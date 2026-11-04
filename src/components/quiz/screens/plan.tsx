"use client";

// Teaser, loader, the personal plan (aha moment #1) and email capture.

import { useEffect, useState } from "react";
import { blockerFix, planHeadline } from "@/lib/plan";
import { PAID_BEFORE, SKILLS } from "@/lib/quiz-data";
import { Button, Card, Label, Pill } from "@/components/ui";
import { EMAIL_PATTERN, useQuiz } from "../quiz-context";
import { Cta, Note, ScreenBody, ScreenSub, ScreenTitle } from "../quiz-ui";

export function TeaserScreen() {
  const { actions, meta } = useQuiz();
  const skill = SKILLS[meta.answers.skill];
  return (
    <ScreenBody>
      <div aria-hidden className="mt-5 text-[44px]">
        {skill.icon}
      </div>
      <ScreenTitle>{skill.label} sells well as a service</ScreenTitle>
      <p className="mb-3">
        Small businesses already buy it from freelancers every day: <b>{skill.deliverable}</b>.
      </p>
      <p className="text-muted">{PAID_BEFORE[meta.answers.paid].teaser}</p>
      <Cta>
        <Button onClick={actions.next}>Continue</Button>
      </Cta>
    </ScreenBody>
  );
}

const LOADER_STEP_MS = 60;
const LOADER_STEP_PCT = 4;

export function LoaderScreen() {
  const { actions, meta } = useQuiz();
  const [pct, setPct] = useState(0);
  const steps = [
    "Matching your skill to a service people buy",
    "Setting a starting price for your experience",
    "Finding your warmest first buyers",
    `Mapping 30 days of ${meta.answers.time}-minute quests`,
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => {
        const next = Math.min(100, p + LOADER_STEP_PCT);
        if (next === 100) clearInterval(id);
        return next;
      });
    }, LOADER_STEP_MS);
    return () => clearInterval(id);
  }, []);

  const ready = pct === 100;
  return (
    <ScreenBody>
      <ScreenTitle>Building your plan…</ScreenTitle>
      <ScreenSub>{blockerFix(meta.answers)}</ScreenSub>
      <div
        className="my-3 h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Building your plan"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="h-full bg-accent transition-[width] duration-75 ease-linear" style={{ width: `${pct}%` }} />
      </div>
      <ul className="my-4">
        {steps.map((step, i) => {
          const done = pct >= (i + 1) * 24;
          return (
            <li
              key={step}
              className={`flex items-center gap-2.5 py-2.5 transition-colors duration-300 ${done ? "text-ink" : "text-muted"}`}
            >
              <span
                aria-hidden
                className={`grid size-[22px] flex-none place-items-center rounded-full border-2 text-xs transition-colors duration-300 ${done ? "border-good bg-good text-white" : "border-line text-transparent"}`}
              >
                ✓
              </span>
              <span>
                {step}
                <span className="sr-only">{done ? " (done)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <Cta>
        <Button onClick={actions.next} disabled={!ready}>
          See my plan
        </Button>
      </Cta>
    </ScreenBody>
  );
}

export function PlanScreen() {
  const { actions, meta } = useQuiz();
  const { plan } = meta;
  return (
    <ScreenBody>
      <Pill tone="good">Your plan is ready</Pill>
      <ScreenTitle>{planHeadline(plan)}</ScreenTitle>
      <Card>
        <dl className="flex flex-col gap-2">
          <div>
            <dt>
              <Label>Your service</Label>
            </dt>
            <dd className="text-[17px] leading-snug font-bold">{plan.service}</dd>
          </div>
          <div>
            <dt>
              <Label>Starting price</Label>
            </dt>
            <dd className="text-[17px] leading-snug font-bold">{plan.priceLabel}</dd>
          </div>
          <div>
            <dt>
              <Label>Your first buyers</Label>
            </dt>
            <dd className="text-[14.5px] leading-snug font-semibold">{plan.firstBuyers}</dd>
          </div>
        </dl>
      </Card>
      <Card>
        <Label>30 days · {plan.minutes} min a day</Label>
        <ol className="mt-2">
          {plan.weeks.map((week, i) => (
            <li key={week.week} className="relative pb-3 pl-[26px]">
              <span aria-hidden className="absolute top-1.5 left-1.5 size-2.5 rounded-full bg-accent" />
              {i < plan.weeks.length - 1 ? (
                <span aria-hidden className="absolute top-[18px] bottom-0 left-2.5 w-0.5 bg-line" />
              ) : null}
              <b className="block text-sm">
                Week {week.week} · {week.title}
              </b>
              <span className="text-[13px] text-muted">{week.text}</span>
            </li>
          ))}
        </ol>
      </Card>
      <Cta>
        <Button onClick={actions.next}>Save my plan</Button>
      </Cta>
    </ScreenBody>
  );
}

export function EmailScreen() {
  const { state, actions } = useQuiz();
  const valid = EMAIL_PATTERN.test(state.email);
  return (
    <ScreenBody>
      <ScreenTitle>Where should we send your plan?</ScreenTitle>
      <ScreenSub>
        We save your answers and your 30-day map, so you can come back to them anytime.
      </ScreenSub>
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        spellCheck={false}
        placeholder="you@example.com"
        value={state.email}
        onChange={(e) => actions.setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && valid) actions.next();
        }}
        className="w-full rounded-xl border-[1.5px] border-line bg-surface px-3.5 py-[13px] text-[15px] focus:border-accent focus:outline-none"
      />
      <Note>Demo: your email stays in this browser and is never sent anywhere.</Note>
      <Cta>
        <Button onClick={actions.next} disabled={!valid} aria-describedby={valid ? undefined : "email-hint"}>
          Continue
        </Button>
        {valid ? null : (
          <p id="email-hint" className="text-center text-xs text-muted">
            Enter an email like name@example.com to continue.
          </p>
        )}
      </Cta>
    </ScreenBody>
  );
}
