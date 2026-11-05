"use client";

// The quiz provider is the only place that knows how quiz state is stored.
// Screens read `state`, call `actions` and use the derived `meta`.

import {
  addTransitionType,
  createContext,
  startTransition,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { buildPlan, type PersonalPlan } from "@/lib/plan";
import {
  DEFAULT_ANSWERS,
  DEFAULT_PLAN,
  type PlanKey,
  type QuizAnswers,
} from "@/lib/quiz-data";
import { createGame } from "@/lib/game";
import { updateState } from "@/lib/storage";

export const SCREEN_IDS = [
  "ad",
  "landing",
  "years",
  "paid",
  "tease",
  "goal",
  "time",
  "block",
  "loader",
  "plan",
  "email",
  "paywall",
  "checkout",
  "upsell",
] as const;

export type ScreenId = (typeof SCREEN_IDS)[number];

/** Screens that show the progress bar. */
const QUIZ_SCREENS: ScreenId[] = SCREEN_IDS.slice(
  SCREEN_IDS.indexOf("landing"),
  SCREEN_IDS.indexOf("email") + 1,
);

const AUTO_ADVANCE_MS = 180;
const DEMO_EMAIL = "you@example.com";

export const EMAIL_PATTERN = /.+@.+\..+/;

type QuizState = {
  screen: ScreenId;
  answers: Partial<QuizAnswers>;
  email: string;
  plan: PlanKey;
  consent: boolean;
};

type QuizActions = {
  next: () => void;
  back: () => void;
  /** Jump to a screen (demo map). Skipped answers get defaults. */
  jumpTo: (screen: ScreenId) => void;
  /** Save an answer, then move on after a short pause so the selection is visible. */
  pick: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setEmail: (email: string) => void;
  /** Changing the plan clears the consent box: the user agrees to one specific price. */
  choosePlan: (plan: PlanKey) => void;
  setConsent: (consent: boolean) => void;
  /** Payment done and the upsell answered: save everything and open the app. */
  finish: (firstClientKit: boolean) => void;
};

type QuizMeta = {
  /** Answers with defaults for anything not answered yet. */
  answers: QuizAnswers;
  plan: PersonalPlan;
  isQuizScreen: boolean;
  /** 0–100, for the progress bar. */
  progress: number;
  canGoBack: boolean;
};

type QuizContextValue = { state: QuizState; actions: QuizActions; meta: QuizMeta };

const QuizContext = createContext<QuizContextValue | null>(null);

export function useQuiz(): QuizContextValue {
  const value = use(QuizContext);
  if (!value) throw new Error("useQuiz must be used inside <QuizProvider>");
  return value;
}

const noSubscribe = () => () => {};

/**
 * Today's date, read in the browser. The page is pre-rendered at build time, where "today" would
 * be the build date; the pre-render only shows the ad screen, which shows no date.
 */
function useToday(): Date {
  const day = useSyncExternalStore(noSubscribe, () => new Date().toDateString(), () => "");
  return useMemo(() => (day ? new Date(day) : new Date(0)), [day]);
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<QuizState>({
    screen: "ad",
    answers: {},
    email: "",
    plan: DEFAULT_PLAN,
    consent: false,
  });
  const today = useToday();
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const navigate = useCallback((direction: "nav-forward" | "nav-back", to: (s: QuizState) => ScreenId) => {
    startTransition(() => {
      addTransitionType(direction);
      setState((s) => ({ ...s, screen: to(s) }));
    });
    window.scrollTo({ top: 0 });
  }, []);

  const actions = useMemo<QuizActions>(() => {
    const step = (s: QuizState, by: number) => {
      const i = SCREEN_IDS.indexOf(s.screen) + by;
      return SCREEN_IDS[Math.max(0, Math.min(SCREEN_IDS.length - 1, i))];
    };

    return {
      next: () => navigate("nav-forward", (s) => step(s, 1)),
      back: () => navigate("nav-back", (s) => step(s, -1)),
      jumpTo: (screen) => {
        const target = SCREEN_IDS.indexOf(screen);
        setState((s) => ({
          ...s,
          answers: target > 1 ? { ...DEFAULT_ANSWERS, ...s.answers } : s.answers,
          email: target > SCREEN_IDS.indexOf("email") && !s.email ? DEMO_EMAIL : s.email,
          consent: target > SCREEN_IDS.indexOf("paywall") ? true : s.consent,
        }));
        navigate(
          target >= SCREEN_IDS.indexOf(state.screen) ? "nav-forward" : "nav-back",
          () => screen,
        );
      },
      pick: (key, value) => {
        setState((s) => ({ ...s, answers: { ...s.answers, [key]: value } }));
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(
          () => navigate("nav-forward", (s) => step(s, 1)),
          AUTO_ADVANCE_MS,
        );
      },
      setEmail: (email) => setState((s) => ({ ...s, email })),
      choosePlan: (plan) =>
        setState((s) => (s.plan === plan ? s : { ...s, plan, consent: false })),
      setConsent: (consent) => setState((s) => ({ ...s, consent })),
      finish: (firstClientKit) => {
        updateState(() => ({
          version: 1,
          answers: { ...DEFAULT_ANSWERS, ...state.answers },
          email: state.email || null,
          purchase: {
            plan: state.plan,
            paidAt: new Date().toISOString(),
            firstClientKit,
          },
          planStartedAt: today.toISOString(),
          game: createGame(),
          cancelled: false,
          offer: null,
          warmList: [],
        }));
        const demo = new URLSearchParams(window.location.search).has("demo");
        router.push(demo ? "/app?demo=1" : "/app");
      },
    };
  }, [navigate, router, state.answers, state.email, state.plan, state.screen, today]);

  const meta = useMemo<QuizMeta>(() => {
    const answers = { ...DEFAULT_ANSWERS, ...state.answers };
    const quizIndex = QUIZ_SCREENS.indexOf(state.screen);
    return {
      answers,
      plan: buildPlan(answers, today),
      isQuizScreen: quizIndex >= 0,
      progress: quizIndex >= 0 ? Math.round(((quizIndex + 1) / QUIZ_SCREENS.length) * 100) : 0,
      canGoBack: state.screen !== SCREEN_IDS[0],
    };
  }, [state.answers, state.screen, today]);

  const value = useMemo(() => ({ state, actions, meta }), [state, actions, meta]);

  return <QuizContext value={value}>{children}</QuizContext>;
}
