"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  ViewTransition,
  type ComponentType,
} from "react";
import { QuizProvider, SCREEN_IDS, useQuiz, type ScreenId } from "./quiz-context";
import { QuizBar } from "./quiz-ui";
import { AdScreen, LandingScreen } from "./screens/intro";
import {
  BlockerScreen,
  GoalScreen,
  PaidScreen,
  TimeScreen,
  YearsScreen,
} from "./screens/questions";
import { EmailScreen, LoaderScreen, PlanScreen, TeaserScreen } from "./screens/plan";
import { CheckoutScreen, PaywallScreen, UpsellScreen } from "./screens/purchase";

const SCREENS: Record<ScreenId, { name: string; Component: ComponentType }> = {
  ad: { name: "Ad", Component: AdScreen },
  landing: { name: "Landing + Q1", Component: LandingScreen },
  years: { name: "Q2 Experience", Component: YearsScreen },
  paid: { name: "Q3 Paid before", Component: PaidScreen },
  tease: { name: "Teaser", Component: TeaserScreen },
  goal: { name: "Q4 Goal", Component: GoalScreen },
  time: { name: "Q5 Time", Component: TimeScreen },
  block: { name: "Q6 Blocker", Component: BlockerScreen },
  loader: { name: "Building plan", Component: LoaderScreen },
  plan: { name: "Personal plan", Component: PlanScreen },
  email: { name: "Email", Component: EmailScreen },
  paywall: { name: "Paywall", Component: PaywallScreen },
  checkout: { name: "Checkout", Component: CheckoutScreen },
  upsell: { name: "Upsell", Component: UpsellScreen },
};

export function Quiz() {
  return (
    <QuizProvider>
      <QuizFrame />
    </QuizProvider>
  );
}

function QuizFrame() {
  const { state } = useQuiz();
  const { Component } = SCREENS[state.screen];
  const mainRef = useRef<HTMLElement>(null);
  const shownScreen = useRef(state.screen);

  // When the screen changes, move focus to its heading so keyboard and screen reader users
  // start at the top of the new screen instead of on a button that no longer exists.
  useEffect(() => {
    if (shownScreen.current === state.screen) return;
    shownScreen.current = state.screen;
    const target = mainRef.current?.querySelector<HTMLElement>("h1") ?? mainRef.current;
    target?.focus({ preventScroll: true });
  }, [state.screen]);
  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col sm:my-6 sm:rounded-md sm:border sm:border-line sm:bg-surface">
      <QuizBar />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
        <ViewTransition
          key={state.screen}
          enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          default="none"
        >
          <div className="flex flex-1 flex-col">
            <Component />
          </div>
        </ViewTransition>
      </main>
      <DemoMap />
    </div>
  );
}

const subscribe = () => () => {};

/** ?demo=1 shows a screen map for jumping around during a live demo. */
function DemoMap() {
  const { state, actions } = useQuiz();
  const demo = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).has("demo"),
    () => false,
  );
  if (!demo) return null;
  return (
    <nav aria-label="Demo screen map" className="border-t border-dashed border-line px-4 py-3">
      <p className="mb-2 text-xs font-bold tracking-[0.05em] text-ink-muted uppercase">
        Demo · jump to a screen
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SCREEN_IDS.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => actions.jumpTo(id)}
            aria-current={id === state.screen ? "step" : undefined}
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${id === state.screen ? "border-ink font-semibold text-brand-ink" : "border-line text-ink-muted"}`}
          >
            {i + 1}. {SCREENS[id].name}
          </button>
        ))}
      </div>
    </nav>
  );
}
