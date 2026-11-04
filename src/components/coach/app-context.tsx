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
  completeQuest,
  formatEvent,
  grantXp,
  isQuestDone,
  isRecoveryDay,
  levelProgress,
  reachGoal,
  recordResult,
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
import { addDays, buildPlan, offerDraft, type PersonalPlan } from "@/lib/plan";
import { questForDay, type DraftKind, type Quest } from "@/lib/quests";
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

export type Tab = "today" | "journey" | "settings";

export type Sheet =
  | { kind: "log"; result?: ResultType }
  | { kind: "tool"; tool: AnyToolKey }
  | { kind: "draft"; draft: DraftKind }
  | { kind: "chat" }
  | null;

export type Toast = { id: number; text: string; hugin?: string };

type AppState = {
  saved: ActiveState;
  tab: Tab;
  sheet: Sheet;
  toasts: Toast[];
  /** Hugin chat for this visit. Not saved. */
  chat: ChatMessage[];
  chatBusy: boolean;
};

type AppActions = {
  setTab: (tab: Tab) => void;
  openSheet: (sheet: Exclude<Sheet, null>) => void;
  closeSheet: () => void;
  dismissToast: (id: number) => void;
  completeDay1: (offer: string, names: string[]) => void;
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
  questDone: boolean;
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
      saved: { ...initial, game },
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
      completeDay1: (offer, names) =>
        play(completeQuest, { offer: offer.trim(), warmList: names.map((n) => n.trim()) }),
      completeQuest: () => play(completeQuest, {}, QUEST_DONE_LINE),
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
        nextDay: () => play(advanceDay),
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
    [commit, play, router],
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
        questTitle: quest.title,
        title: TITLES[title].label,
      },
      questDone: isQuestDone(game),
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
