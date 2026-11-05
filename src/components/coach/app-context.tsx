"use client";

// The app provider is the only place that knows how progress is stored. Every change goes
// through `commit`, which runs inside a transition so view transitions can animate it.

import {
  createContext,
  startTransition,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  advanceDay,
  calendarDay,
  catchUp,
  completeDailyStep,
  formatEvent,
  grantXp,
  isQuestDone,
  isRecoveryDay,
  levelProgress,
  reachGoal,
  recordResult,
  recordStage,
  STATS,
  TITLES,
  titleFor,
  unlockedTools,
  weekOfDay,
  type BossKey,
  type GameEvent,
  type GameState,
  type Proof,
  type ResultType,
  type Step,
  type StatKey,
  type TitleKey,
} from "@/lib/game";
import {
  BOSS_LINES,
  levelLine,
  QUEST_DONE_LINE,
  SHIELD_USED_LINE,
  STREAK_RESET_LINE,
  STUDIO_OWNER_LINE,
} from "@/lib/hugin-lines";
import type { HuginContext } from "@/lib/hugin";
import { streamChat, type ChatMessage } from "@/lib/hugin-client";
import {
  applyReply,
  applyStepDone,
  createContact,
  markAnswered,
  setContactStage,
  updateContact,
  type ContactUpdate,
} from "@/lib/contacts";
import type {
  Contact,
  ContactInput,
  DraftKind,
  LessonId,
  LessonProgress,
  NextStep,
  ReplyOutcome,
  Stage,
} from "@/lib/model";
import { decisionsSummary, isDay1Done, nextStep, stepTitle, tidyContacts } from "@/lib/next-step";
import { addDays, buildPlan, offerDraft, type PersonalPlan } from "@/lib/plan";
import { questForDay, type Quest } from "@/lib/quests";
import { PLANS, SKILLS, type Plan, type QuizAnswers } from "@/lib/quiz-data";
import { clearState, saveState, type Purchase, type SavedState } from "@/lib/storage";
import { KIT_UNLOCKS, type AnyToolKey } from "@/lib/tools";

/** Saved state after the quiz: answers, purchase and start date are always there. */
export type ActiveState = SavedState & {
  answers: QuizAnswers;
  purchase: Purchase;
  planStartedAt: string;
};

export function isActive(saved: SavedState | null): saved is ActiveState {
  return Boolean(saved?.answers && saved.purchase && saved.planStartedAt);
}

/** The three tabs in the tab bar. */
export type Tab = "today" | "people" | "progress";
/** Every screen: the tabs, plus Settings, which opens from the gear in the header. */
export type Screen = Tab | "settings";

export type Sheet =
  | { kind: "log"; result?: ResultType }
  | { kind: "tool"; tool: AnyToolKey }
  | { kind: "draft"; draft: DraftKind; contactId?: string }
  | { kind: "chat" }
  /** Log a reply; `contactId` preselects the person. */
  | { kind: "reply"; contactId?: string }
  | { kind: "lesson"; id: LessonId }
  | { kind: "contact"; id: string }
  | { kind: "add-contact" }
  | null;

export type Toast = { id: number; text: string; hugin?: string };

type AppState = {
  saved: ActiveState;
  tab: Screen;
  sheet: Sheet;
  toasts: Toast[];
  /** Hugin chat for this visit. Not saved. */
  chat: ChatMessage[];
  chatBusy: boolean;
};

type AppActions = {
  setTab: (tab: Screen) => void;
  openSheet: (sheet: Exclude<Sheet, null>) => void;
  closeSheet: () => void;
  dismissToast: (id: number) => void;
  /** Saves the offer and replaces the list with these people; counts as the day's step. */
  completeDay1: (offer: string, contacts: ContactInput[]) => void;
  /** Returns the new contact's id. */
  addContact: (input: ContactInput) => string;
  updateContact: (id: string, patch: Partial<ContactInput>) => void;
  setStage: (id: string, stage: Stage) => void;
  /**
   * The user did `step`. Moves the contact (stage, follow-ups, last action, what was sent). The
   * first step of the game day counts for the streak; later ones only move contacts.
   */
  markStepDone: (step: NextStep, options?: { sentText?: string }) => void;
  logReply: (contactId: string, text: string, outcome: ReplyOutcome) => void;
  markReplyAnswered: (contactId: string) => void;
  /** Lesson actions save progress only; they don't count as the day's step on their own. */
  markLessonRead: (id: LessonId) => void;
  saveDecision: (id: LessonId, fields: Record<string, string>) => void;
  /** Old quest card: completes the day's step with no contact. */
  completeQuest: () => void;
  recordResult: (result: ResultType, proof: Proof) => void;
  reachGoal: () => void;
  cancelPlan: () => void;
  resumePlan: () => void;
  resetEverything: () => void;
  sendChat: (text: string) => void;
  demo: {
    nextDay: () => void;
    missDay: () => void;
    jumpToBoss: (boss: BossKey) => void;
    addXp: () => void;
  };
};

type AppMeta = {
  answers: QuizAnswers;
  plan: PersonalPlan;
  purchasePlan: Plan;
  quest: Quest;
  /** Today's step is done (the streak counted for this game day). */
  questDone: boolean;
  day1Done: boolean;
  /** The step the app picks for today. */
  step: NextStep;
  stepTitle: string;
  isRecovery: boolean;
  week: number;
  boss: BossKey;
  title: TitleKey;
  progress: ReturnType<typeof levelProgress>;
  tools: AnyToolKey[];
  renewsOn: Date;
  demo: boolean;
  /** What Hugin knows about the user for Gemini calls. */
  huginContext: HuginContext;
};

type AppContextValue = { state: AppState; actions: AppActions; meta: AppMeta };

const AppContext = createContext<AppContextValue | null>(null);

export function useCoach(): AppContextValue {
  const value = use(AppContext);
  if (!value) throw new Error("useCoach must be used inside <AppProvider>");
  return value;
}

const BOSS_DAYS: Record<BossKey, number> = { w1: 7, w2: 14, w3: 21, w4: 28 };

/** Sum XP and stat points into one growth line; milestones get their own toast. */
function toToasts(events: GameEvent[], nextId: () => number, growthHugin?: string): Toast[] {
  const toasts: Toast[] = [];
  let xp = 0;
  const stats = new Map<StatKey, number>();
  for (const e of events) {
    if (e.kind === "xp") xp += e.amount;
    if (e.kind === "stat") stats.set(e.stat, (stats.get(e.stat) ?? 0) + e.amount);
  }
  const growth = [
    ...(xp ? [`+${xp} XP`] : []),
    ...[...stats].map(([stat, n]) => `${STATS[stat].label} +${n}`),
  ];
  if (growth.length) toasts.push({ id: nextId(), text: growth.join(" · "), hugin: growthHugin });

  // A boss and what it unlocks share one notification; so do level-ups and a new title.
  const boss = events.find((e) => e.kind === "boss");
  if (boss) {
    const unlock = events.find((e) => e.kind === "unlock");
    toasts.push({
      id: nextId(),
      text: [boss, ...(unlock ? [unlock] : [])].map(formatEvent).join(" · "),
      hugin: BOSS_LINES[boss.boss],
    });
  }
  const levels = events.filter((e) => e.kind === "level");
  const title = events.find((e) => e.kind === "title");
  const topLevel = levels.at(-1);
  if (topLevel || title) {
    toasts.push({
      id: nextId(),
      text: [...(topLevel ? [topLevel] : []), ...(title ? [title] : [])].map(formatEvent).join(" · "),
      hugin:
        title?.title === "studioOwner"
          ? STUDIO_OWNER_LINE
          : topLevel
            ? levelLine(topLevel.level)
            : undefined,
    });
  }

  for (const e of events) {
    switch (e.kind) {
      case "shieldEarned":
      case "recoveryOffered":
        toasts.push({ id: nextId(), text: formatEvent(e) });
        break;
      case "shieldUsed":
        toasts.push({ id: nextId(), text: formatEvent(e), hugin: SHIELD_USED_LINE });
        break;
      case "streakReset":
        toasts.push({ id: nextId(), text: formatEvent(e), hugin: STREAK_RESET_LINE });
        break;
    }
  }
  return toasts;
}

export function AppProvider({
  initial,
  demo,
  children,
}: {
  initial: ActiveState;
  demo: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const idRef = useRef(0);
  const nextId = useCallback(() => ++idRef.current, []);

  // Days the app wasn't opened count as missed, so bring the game up to today's date first.
  const [state, setState] = useState<AppState>(() => {
    const today = calendarDay(new Date(initial.planStartedAt), new Date());
    const { state: game, events } = catchUp(initial.game, today);
    let id = 0;
    const toasts = toToasts(events, () => --id);
    return {
      saved: { ...initial, game, contacts: tidyContacts(initial.contacts, game.day) },
      tab: "today",
      sheet: null,
      toasts,
      chat: [],
      chatBusy: false,
    };
  });
  // The latest state for async work (the chat stream) without re-creating actions.
  const stateRef = useRef(state);
  const huginContextRef = useRef<HuginContext | null>(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    saveState(state.saved);
  }, [state.saved]);

  const commit = useCallback(
    (update: (s: AppState) => { saved: ActiveState; events?: GameEvent[]; hugin?: string }) => {
      startTransition(() => {
        setState((s) => {
          const { saved, events = [], hugin } = update(s);
          return { ...s, saved, toasts: [...s.toasts, ...toToasts(events, nextId, hugin)] };
        });
      });
    },
    [nextId],
  );

  /** Run a game action; `hugin` is his comment on the growth notification. */
  const play = useCallback(
    (step: (game: GameState) => Step, patch: Partial<ActiveState> = {}, hugin?: string) =>
      commit((s) => {
        const { state: game, events } = step(s.saved.game);
        return { saved: { ...s.saved, ...patch, game }, events, hugin };
      }),
    [commit],
  );

  /** Apply a contact update; a stage change becomes results via `recordStage`. */
  const applyContacts = useCallback(
    (
      update: (contacts: Contact[], day: number) => ContactUpdate,
      countStep = false,
      hugin?: string,
    ) =>
      commit((s) => {
        const { contacts, change } = update(s.saved.contacts, s.saved.game.day);
        let game = s.saved.game;
        const events: GameEvent[] = [];
        if (change) {
          const step = recordStage(game, change.from, change.to);
          game = step.state;
          events.push(...step.events);
        }
        if (countStep && !isQuestDone(game)) {
          const step = completeDailyStep(game);
          game = step.state;
          events.push(...step.events);
        }
        return { saved: { ...s.saved, contacts, game }, events, hugin };
      }),
    [commit],
  );

  const saveLesson = useCallback(
    (id: LessonId, patch: (day: number) => LessonProgress) =>
      commit((s) => ({
        saved: {
          ...s.saved,
          lessons: {
            ...s.saved.lessons,
            [id]: { ...s.saved.lessons[id], ...patch(s.saved.game.day) },
          },
        },
      })),
    [commit],
  );

  const actions = useMemo<AppActions>(
    () => ({
      setTab: (tab) =>
        startTransition(() => setState((s) => ({ ...s, tab, sheet: null }))),
      openSheet: (sheet) => startTransition(() => setState((s) => ({ ...s, sheet }))),
      closeSheet: () => startTransition(() => setState((s) => ({ ...s, sheet: null }))),
      dismissToast: (id) =>
        startTransition(() =>
          setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) })),
        ),
      completeDay1: (offer, inputs) =>
        commit((s) => {
          const day = s.saved.game.day;
          const contacts = inputs.filter((c) => c.name.trim()).map((c) => createContact(c, day));
          const { state: game, events } = isQuestDone(s.saved.game)
            ? { state: s.saved.game, events: [] }
            : completeDailyStep(s.saved.game);
          return { saved: { ...s.saved, offer: offer.trim(), contacts, game }, events };
        }),
      addContact: (input) => {
        const contact = createContact(input, stateRef.current.saved.game.day);
        commit((s) => ({
          saved: { ...s.saved, contacts: [...s.saved.contacts, contact] },
        }));
        return contact.id;
      },
      updateContact: (id, patch) =>
        commit((s) => ({
          saved: { ...s.saved, contacts: updateContact(s.saved.contacts, id, patch) },
        })),
      setStage: (id, stage) =>
        applyContacts((contacts, day) => setContactStage(contacts, id, stage, day)),
      markStepDone: (step, options = {}) =>
        applyContacts(
          (contacts, day) => applyStepDone(contacts, step, day, options.sentText),
          true,
          QUEST_DONE_LINE,
        ),
      logReply: (contactId, text, outcome) =>
        applyContacts((contacts, day) => applyReply(contacts, contactId, text, outcome, day)),
      markReplyAnswered: (contactId) =>
        applyContacts((contacts, day) => ({ contacts: markAnswered(contacts, contactId, day) })),
      markLessonRead: (id) => saveLesson(id, (day) => ({ readDay: day })),
      saveDecision: (id, fields) =>
        saveLesson(id, (day) => ({ decision: fields, decidedDay: day, readDay: day })),
      completeQuest: () => play(completeDailyStep, {}, QUEST_DONE_LINE),
      recordResult: (result, proof) => {
        play((game) => recordResult(game, result, proof));
        startTransition(() => setState((s) => ({ ...s, sheet: null })));
      },
      reachGoal: () => play(reachGoal),
      cancelPlan: () =>
        commit((s) => ({ saved: { ...s.saved, cancelled: true } })),
      resumePlan: () =>
        commit((s) => ({ saved: { ...s.saved, cancelled: false } })),
      resetEverything: () => {
        clearState();
        router.push("/quiz");
      },
      sendChat: (text) => {
        const current = stateRef.current;
        const context = huginContextRef.current;
        if (current.chatBusy || !text.trim() || !context) return;
        const history: ChatMessage[] = [...current.chat, { role: "user", text: text.trim() }];
        // Plain updates, not transitions: streaming text shouldn't trigger view transitions.
        setState((s) => ({ ...s, chat: [...history, { role: "hugin", text: "" }], chatBusy: true }));
        const setReply = (reply: string) =>
          setState((s) => ({
            ...s,
            chat: [...s.chat.slice(0, -1), { role: "hugin", text: reply }],
          }));
        void streamChat(history, context, setReply).finally(() =>
          setState((s) => ({ ...s, chatBusy: false })),
        );
      },
      demo: {
        nextDay: () =>
          commit((s) => {
            const { state: game, events } = advanceDay(s.saved.game);
            return {
              saved: { ...s.saved, game, contacts: tidyContacts(s.saved.contacts, game.day) },
              events,
            };
          }),
        missDay: () =>
          play((game) => {
            // If today's quest is done, move to tomorrow first, then miss that day.
            const start = isQuestDone(game) ? advanceDay(game) : { state: game, events: [] };
            const missed = advanceDay(start.state);
            return { state: missed.state, events: [...start.events, ...missed.events] };
          }),
        jumpToBoss: (boss) =>
          play((game) => ({
            state: { ...game, day: Math.max(game.day, BOSS_DAYS[boss]), recovery: null },
            events: [],
          })),
        addXp: () => play((game) => grantXp(game, 100)),
      },
    }),
    [applyContacts, commit, play, router, saveLesson],
  );

  const meta = useMemo<AppMeta>(() => {
    const { saved } = state;
    const { game, answers, purchase } = saved;
    const plan = buildPlan(answers, new Date(saved.planStartedAt));
    const recovery = isRecoveryDay(game);
    const week = weekOfDay(game.day);
    const purchasePlan = PLANS[purchase.plan];
    const fromBosses = unlockedTools(game);
    const fromKit = purchase.firstClientKit ? KIT_UNLOCKS : [];
    const skill = SKILLS[answers.skill];
    const quest = questForDay(
      game.day,
      { minutes: answers.time, price: plan.price, firstStep: plan.firstStep },
      { recovery },
    );
    const title = titleFor(game);
    const step = nextStep(saved, game.day);
    const currentStepTitle = stepTitle(step, saved.contacts);
    return {
      answers,
      plan,
      purchasePlan,
      quest,
      huginContext: {
        skill: skill.label,
        service: plan.service,
        price: plan.priceLabel,
        who: skill.who,
        deliverable: plan.deliverable,
        firstBuyers: plan.firstBuyers,
        offer: saved.offer || offerDraft(answers),
        day: game.day,
        week,
        questTitle: currentStepTitle,
        title: TITLES[title].label,
        decisions: decisionsSummary(saved.lessons),
      },
      questDone: isQuestDone(game),
      day1Done: isDay1Done(saved),
      step,
      stepTitle: currentStepTitle,
      isRecovery: recovery,
      week,
      boss: (["w1", "w2", "w3", "w4"] as const)[week - 1],
      title,
      progress: levelProgress(game.xp),
      tools: [...new Set<AnyToolKey>([...fromKit, ...fromBosses])],
      renewsOn: addDays(new Date(purchase.paidAt), purchasePlan.days),
      demo,
    };
  }, [state, demo]);

  useEffect(() => {
    huginContextRef.current = meta.huginContext;
  }, [meta.huginContext]);

  const value = useMemo(() => ({ state, actions, meta }), [state, actions, meta]);
  return <AppContext value={value}>{children}</AppContext>;
}
