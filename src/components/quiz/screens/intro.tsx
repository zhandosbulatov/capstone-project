"use client";

import { SKILL_KEYS, SKILLS } from "@/lib/quiz-data";
import { Pill } from "@/components/ui";
import { useQuiz } from "../quiz-context";
import { Note, Option, OptionList, ScreenBody, ScreenSub, ScreenTitle } from "../quiz-ui";

/** Screen 1: the Instagram ad that starts the funnel. */
export function AdScreen() {
  const { actions } = useQuiz();
  return (
    <ScreenBody>
      <p className="mt-1 text-sm text-muted">Instagram feed · sponsored</p>
      <article className="mt-1 overflow-hidden rounded-[14px] border border-line bg-surface">
        <header className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-accent text-[13px] font-bold text-accent-ink"
          >
            AI
          </div>
          <div>
            <p className="text-[13.5px] font-bold">AI Business Coach</p>
            <p className="text-[11.5px] text-muted">Sponsored</p>
          </div>
        </header>
        <div className="flex aspect-square flex-col justify-center gap-2.5 border-y border-line bg-linear-160 from-accent-soft to-surface p-6">
          <Pill>Good at your job?</Pill>
          <p className="font-display text-[28px] leading-tight">Someone will pay you for it.</p>
          <p className="text-muted">
            Your first paying client in 30 days — 20 minutes a day, without quitting your job.
          </p>
        </div>
        <footer className="flex items-center justify-between gap-2.5 px-3 py-2.5">
          <p className="text-sm">
            <b>Find your first client</b>
            <br />
            <span className="text-[11.5px] text-muted">Take the 1-minute quiz</span>
          </p>
          <button
            type="button"
            onClick={actions.next}
            className="cursor-pointer rounded-lg bg-line px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-accent"
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
      <Pill tone="good">6 quick questions · 1 minute</Pill>
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
