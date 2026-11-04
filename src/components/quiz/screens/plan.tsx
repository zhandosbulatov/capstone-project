"use client";

// Teaser, loader, the personal plan (aha moment #1) and email capture.

import { useEffect, useState } from "react";
import { blockerFix, planHeadline } from "@/lib/plan";
import { PAID_BEFORE, SKILLS } from "@/lib/quiz-data";
import { Icon } from "@/components/icons";
import { Rail, RouteStrip, Stop } from "@/components/route";
import { Button, Card, Label } from "@/components/ui";
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

export function PlanScreen() {
  const { actions, meta } = useQuiz();
  const { plan } = meta;
  return (
    <ScreenBody>
      <p className="mt-2 text-sm font-semibold text-success-ink">Your plan is ready</p>
      <ScreenTitle>{planHeadline(plan)}</ScreenTitle>
      <Card>
        <dl className="flex flex-col gap-3">
          <div>
            <dt>
              <Label>Your service</Label>
            </dt>
            <dd className="font-display text-[19px] leading-snug">{plan.service}</dd>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-6">
            <div>
              <dt>
                <Label>Starting price</Label>
              </dt>
              <dd className="font-display text-[19px] leading-snug">{plan.priceLabel}</dd>
            </div>
            <div>
              <dt>
                <Label>Your first buyers</Label>
              </dt>
              <dd className="text-[15px] leading-snug">{plan.firstBuyers}</dd>
            </div>
          </div>
        </dl>
      </Card>
      <section aria-labelledby="route" className="mt-2">
        <h2 id="route" className="text-[13px] font-semibold text-ink-muted">
          Your route · 30 days · {plan.minutes} min a day
        </h2>
        <RouteStrip day={1} you="Today" end="First client" className="mt-2" />
        <Rail className="mt-4">
          {plan.weeks.map((week, i) => (
            <Stop
              key={week.week}
              kind="boss"
              segment={i === plan.weeks.length - 1 ? "none" : "ahead"}
              label={`Week ${week.week} · day ${week.week * 7}`}
            >
              <p className="font-display text-[17px] leading-snug">{week.title}</p>
              <p className="text-sm text-ink-muted">{week.text}</p>
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
        className="w-full rounded-md border-[1.5px] border-line bg-surface px-3.5 py-[13px] text-[15px] focus:border-ink focus:outline-none"
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
