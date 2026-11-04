"use client";

// Parts every quiz screen is built from: the top bar, titles, option lists and the bottom CTA.

import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { useQuiz } from "./quiz-context";

export function QuizBar() {
  const { actions, meta } = useQuiz();
  return (
    <div className="flex min-h-12 items-center gap-2.5 px-4 pt-3.5 pb-2">
      <button
        type="button"
        onClick={actions.back}
        aria-label="Back"
        className={`grid size-9 cursor-pointer place-items-center rounded-md text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink ${meta.canGoBack ? "" : "invisible"}`}
      >
        <Icon name="arrowLeft" size={20} />
      </button>
      <div
        className={`h-1.5 flex-1 overflow-hidden rounded-full bg-brand-soft ${meta.isQuizScreen ? "" : "invisible"}`}
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={meta.progress}
      >
        <div
          className="h-full origin-left rounded-full bg-brand transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${meta.progress / 100})` }}
        />
      </div>
      <span className="font-display text-sm whitespace-nowrap text-ink-muted">AI Business Coach</span>
    </div>
  );
}

/** A screen's scrollable column; the Cta sticks to its bottom. */
export function ScreenBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col px-5 pt-2 pb-5">{children}</div>;
}

/** tabIndex -1 lets the quiz move focus here when the screen changes. */
export function ScreenTitle({ children }: { children: ReactNode }) {
  return (
    <h1 tabIndex={-1} className="mt-2 mb-1.5 font-display text-[25px] leading-tight focus:outline-none">
      {children}
    </h1>
  );
}

export function ScreenSub({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-sm text-ink-muted">{children}</p>;
}

export function OptionList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="mt-3 flex flex-col gap-2.5">
      {children}
    </div>
  );
}

export function Option({
  selected,
  onSelect,
  children,
}: {
  /** Kept for the quiz data; options render as text only (no emoji icons, see DESIGN.md). */
  icon?: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-md border-[1.5px] px-4 py-3.5 text-left transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${selected ? "border-ink bg-sun-soft" : "border-line bg-surface"}`}
    >

      <span>{children}</span>
    </button>
  );
}

/** Bottom area for the screen's main action. */
export function Cta({ children }: { children: ReactNode }) {
  return <div className="mt-auto flex flex-col gap-1 pt-4">{children}</div>;
}

/** Small print under an action. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs text-ink-muted">{children}</p>;
}
