"use client";

// Teaser, loader, the personal plan (aha moment #1) and email capture.

import { useEffect, useState } from "react";
import { blockerFix, planHeadline } from "@/lib/plan";
import { PAID_BEFORE, SKILLS } from "@/lib/quiz-data";
import { BusinessCard } from "@/components/business-card";
import { Icon } from "@/components/icons";
import { Rail, Stop } from "@/components/route";
import { Button, fieldClass, Label } from "@/components/ui";
import { EMAIL_PATTERN, useQuiz } from "../quiz-context";
import { Cta, Note, ScreenBody, ScreenSub, ScreenTitle } from "../quiz-ui";

export function TeaserScreen() {
  const { actions, meta } = useQuiz();
  const skill = SKILLS[meta.answers.skill];
  return (
    <ScreenBody>
      <ScreenTitle>{skill.label} sells well as a service</ScreenTitle>
      <p className="mb-3">
        Small businesses already buy it from freelancers every day: <b>{skill.deliverable}</b>.
      </p>
      <p className="text-ink-muted">{PAID_BEFORE[meta.answers.paid].teaser}</p>
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
    `Mapping 12 weeks of ${meta.answers.time}-minute steps`,
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
        className="my-3 h-1.5 overflow-hidden rounded-full bg-brand-soft"
        role="progressbar"
        aria-label="Building your plan"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full origin-left bg-brand transition-transform duration-75 ease-linear motion-reduce:transition-none"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      <ul className="my-4">
        {steps.map((step, i) => {
          const done = pct >= (i + 1) * 24;
          return (
            <li
              key={step}
              className={`flex items-center gap-2.5 py-2.5 transition-colors duration-300 ${done ? "text-ink" : "text-ink-muted"}`}
            >
              <span
                aria-hidden
                className={`grid size-[22px] flex-none place-items-center rounded-full border-2 transition-colors duration-300 ${done ? "border-ink bg-ink text-surface" : "border-line text-transparent"}`}
              >
                <Icon name="check" size={13} strokeWidth={3} />
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

const MILESTONES: { title: string; label?: string }[] = [
  { title: "First reply", label: "Goal for week 1" },
  { title: "First call", label: "Next" },
  { title: "First proposal", label: "Then" },
  { title: "First client" },
];

export function PlanScreen() {
  const { actions, meta } = useQuiz();
  const { plan } = meta;
  return (
    <ScreenBody>
      <p className="mt-2 text-sm font-semibold text-success-ink">Your plan is ready</p>
      <ScreenTitle>{planHeadline(plan)}</ScreenTitle>
      <h2 className="sr-only">Your new card</h2>
      <BusinessCard
        service={plan.service}
        price={plan.priceLabel}
        title="Side Starter at your first reply"
        className="mt-3 rotate-[-1.5deg]"
      />
      <dl className="mt-4">
        <dt>
          <Label>Your first buyers</Label>
        </dt>
        <dd className="text-base leading-snug">{plan.firstBuyers}</dd>
      </dl>
      <section aria-labelledby="route" className="mt-6">
        <h2 id="route" className="type-label">
          Your milestones · {plan.minutes} min a day
        </h2>
        <Rail className="mt-4">
          {MILESTONES.map((m, i) => (
            <Stop
              key={m.title}
              kind="boss"
              segment={i === MILESTONES.length - 1 ? "none" : "ahead"}
              label={m.label ?? `By ${plan.clientByLabel}`}
            >
              <p className="font-display text-lg leading-snug">{m.title}</p>
            </Stop>
          ))}
        </Rail>
      </section>
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
        We save your answers and your plan, so you can come back to them anytime.
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
        className={`${fieldClass}`}
      />
      <Note>Demo: your email stays in this browser and is never sent anywhere.</Note>
      <Cta>
        <Button onClick={actions.next} disabled={!valid} aria-describedby={valid ? undefined : "email-hint"}>
          Continue
        </Button>
        {valid ? null : (
          <p id="email-hint" className="text-center text-xs text-ink-muted">
            Enter an email like name@example.com to continue.
          </p>
        )}
      </Cta>
    </ScreenBody>
  );
}
