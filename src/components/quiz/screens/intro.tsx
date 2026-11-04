"use client";

import { SKILL_KEYS, SKILLS } from "@/lib/quiz-data";
import { BusinessCard } from "@/components/business-card";
import { buttonClass } from "@/components/ui";
import { useQuiz } from "../quiz-context";
import { Note, Option, OptionList, ScreenBody, ScreenSub, ScreenTitle } from "../quiz-ui";

/** Screen 1: the Instagram ad that starts the funnel. */
export function AdScreen() {
  const { actions } = useQuiz();
  return (
    <ScreenBody>
      <p className="mt-1 text-sm text-ink-muted">Instagram feed · sponsored</p>
      <article className="mt-1 overflow-hidden rounded-md border border-line bg-surface">
        <header className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-brand text-label font-bold text-on-bright"
          >
            AI
          </div>
          <div>
            <p className="text-label font-bold">AI Business Coach</p>
            <p className="text-xs text-ink-muted">Sponsored</p>
          </div>
        </header>
        <div className="flex aspect-square flex-col justify-center gap-2.5 border-y border-line bg-surface p-6">
          <p className="font-display text-lg text-ink-muted">Good at your job?</p>
          <p className="font-display text-h1 leading-tight">Someone will pay you for it.</p>
          <p className="text-ink-muted">
            20 minutes a day, without quitting your job.
          </p>
          <BusinessCard
            service="Brand starter kits for local businesses"
            price="from $450"
            title="Your first client in 30 days"
            className="mt-3 rotate-[-2deg]"
          />
        </div>
        <footer className="flex items-center justify-between gap-2.5 px-3 py-2.5">
          <p className="text-sm">
            <b>Find your first client</b>
            <br />
            <span className="text-xs text-ink-muted">Take the 1-minute quiz</span>
          </p>
          <button
            type="button"
            onClick={actions.next}
            className={buttonClass({ variant: "secondary", size: "sm", width: "auto" })}
          >
            Learn more
          </button>
        </footer>
      </article>
      <Note>The ad promises an action, a first client, never an income amount.</Note>
    </ScreenBody>
  );
}

/** Screen 2: landing and the first question. */
export function LandingScreen() {
  const { state, actions } = useQuiz();
  return (
    <ScreenBody>
      <p className="mt-2 text-sm font-semibold text-ink-muted">6 quick questions · 1 minute</p>
      <ScreenTitle>Build your 30-day plan to a first paying client</ScreenTitle>
      <ScreenSub>Start with what you already do well. What do people pay you for at work?</ScreenSub>
      <OptionList label="Your skill">
        {SKILL_KEYS.map((key) => (
          <Option
            key={key}
            icon={SKILLS[key].icon}
            selected={state.answers.skill === key}
            onSelect={() => actions.pick("skill", key)}
          >
            {SKILLS[key].label}
          </Option>
        ))}
      </OptionList>
    </ScreenBody>
  );
}
