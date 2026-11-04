"use client";

// Paywall, simulated checkout and the one-time upsell.
// Compliance details are part of the spec: consent is never pre-ticked and resets when the plan
// changes, and the full price after the intro period is shown before Pay.

import { useEffect, useState } from "react";
import { formatUsd } from "@/lib/pricing";
import {
  FIRST_CLIENT_KIT,
  GOALS,
  PLAN_KEYS,
  PLANS,
  SKILLS,
  introPerDay,
  reminderDay,
  type Plan,
} from "@/lib/quiz-data";
import { Button, Card, Label, Pill } from "@/components/ui";
import { useQuiz } from "../quiz-context";
import { Cta, Note, ScreenBody, ScreenSub, ScreenTitle } from "../quiz-ui";

const OFFER_MS = 10 * 60 * 1000;

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function OfferTimer({ endsAt }: { endsAt: number | null }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  // Clamp: the first tick can land a few ms before the end time is set.
  const left = endsAt && now ? Math.min(OFFER_MS, endsAt - now) : OFFER_MS;
  return (
    <div className="flex items-center justify-between gap-2.5 rounded-md bg-warning-soft px-3.5 py-2.5 text-label font-semibold text-warning-ink">
      <span>{left > 0 ? "50% off your first period is reserved for" : "Your 50% off is still applied"}</span>
      <b className="text-base tabular-nums" aria-live="off">
        {formatCountdown(left)}
      </b>
    </div>
  );
}

function weeksOf(plan: Plan) {
  return `${plan.weeks} weeks`;
}

export function PaywallScreen() {
  const { state, actions, meta } = useQuiz();
  const skill = SKILLS[meta.answers.skill];
  const selected = PLANS[state.plan];
  const { startPaywallTimer } = actions;

  useEffect(() => {
    startPaywallTimer();
  }, [startPaywallTimer]);

  return (
    <ScreenBody>
      <OfferTimer endsAt={state.paywallEndsAt} />

      <div className="my-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-line bg-surface px-3 py-2.5">
          <Label>Now</Label>
          <b>Salary only</b>
          <p className="text-xs text-ink-muted">{skill.label} only at work</p>
        </div>
        <div className="rounded-md border border-success bg-success-soft px-3 py-2.5">
          <Label>By {meta.plan.clientByLabel}</Label>
          <b>First client</b>
          <p className="text-xs text-ink-muted">
            {skill.service} at {formatUsd(meta.plan.price)}
          </p>
        </div>
      </div>
      <p className="text-xs text-ink-muted">
        Your 6-month goal: {GOALS[meta.answers.goal].label.toLowerCase()}.
      </p>

      <ScreenTitle>Get your personal plan</ScreenTitle>

      <fieldset>
        <legend className="sr-only">Choose a plan</legend>
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const checked = state.plan === key;
          return (
            <label
              key={key}
              className={`relative my-2 grid w-full cursor-pointer grid-cols-[22px_1fr_auto] items-center gap-2.5 rounded-md border-[1.5px] p-3.5 text-left has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${checked ? "border-ink bg-sun-soft" : "border-line bg-surface"}`}
            >
              <input
                type="radio"
                name="plan"
                value={key}
                checked={checked}
                onChange={() => actions.choosePlan(key)}
                className="sr-only"
              />
              {plan.tag ? (
                <span className="absolute -top-2.5 right-3 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-on-bright">
                  {plan.tag}
                </span>
              ) : null}
              <span
                aria-hidden
                className={`size-5 rounded-full ${checked ? "border-[6px] border-ink" : "border-2 border-line-strong"}`}
              />
              <span>
                <span className="font-bold">{plan.name}</span>
                <br />
                <s className="text-label text-ink-muted">
                  <span className="sr-only">Full price </span>
                  {formatUsd(plan.fullUsd)}
                </s>{" "}
                <b>
                  <span className="sr-only">first period </span>
                  {formatUsd(plan.introUsd)}
                </b>
              </span>
              <span className="text-right">
                <b className="block text-lg">{formatUsd(introPerDay(plan))}</b>
                <span className="text-xs text-ink-muted">per day</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <Card>
        <b className="text-sm">How billing works</b>
        <ol className="mt-2">
          {[
            ["Today", `You pay ${formatUsd(selected.introUsd)} for ${weeksOf(selected)}.`],
            [`Day ${reminderDay(selected)}`, "We email you a reminder before anything renews."],
            [
              `Day ${selected.days}`,
              `Renews at ${formatUsd(selected.fullUsd)} every ${weeksOf(selected)}. Cancel anytime before.`,
            ],
          ].map(([when, what]) => (
            <li
              key={when}
              className="grid grid-cols-[64px_1fr] gap-2.5 border-b border-dashed border-line py-1.5 text-label last:border-b-0"
            >
              <b className="text-label font-semibold text-ink-muted">{when}</b>
              <span>{what}</span>
            </li>
          ))}
        </ol>
      </Card>

      <label className="mt-3 mb-1 flex cursor-pointer items-start gap-2.5 text-label">
        <input
          type="checkbox"
          checked={state.consent}
          onChange={(e) => actions.setConsent(e.target.checked)}
          className="mt-px size-5 flex-none accent-brand"
        />
        <span>
          I agree that my plan renews automatically at{" "}
          <b>
            {formatUsd(selected.fullUsd)} every {weeksOf(selected)}
          </b>{" "}
          until I cancel. I can cancel in Settings in two taps.
        </span>
      </label>

      <p className="my-2.5 border-l-[3px] border-line pl-3 text-label text-ink-muted">
        Reviews from verified users will appear here.
      </p>
      <Note>14-day money-back guarantee if you finish the week 1 quests.</Note>

      <Cta>
        <Button onClick={actions.next} disabled={!state.consent} aria-describedby="pay-hint">
          Get my plan · {formatUsd(selected.introUsd)}
        </Button>
        <p id="pay-hint" className="text-center text-xs text-ink-muted">
          {state.consent
            ? "Demo: no payment is taken."
            : "Tick the renewal box above to continue."}
        </p>
      </Cta>
    </ScreenBody>
  );
}

const PROCESSING_MS = 700;

export function CheckoutScreen() {
  const { state, actions } = useQuiz();
  const plan = PLANS[state.plan];
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (!paying) return;
    const id = setTimeout(actions.next, PROCESSING_MS);
    return () => clearTimeout(id);
  }, [paying, actions.next]);

  const payButton = (method: string, variant: "dark" | "outline") => (
    <Button variant={variant} onClick={() => setPaying(method)} disabled={paying !== null}>
      {paying === method ? "Processing…" : `Pay ${method}`}
    </Button>
  );

  return (
    <ScreenBody>
      <ScreenTitle>Checkout</ScreenTitle>
      <Card>
        <div className="flex justify-between gap-3">
          <span>{plan.name} · first period</span>
          <b>{formatUsd(plan.introUsd)}</b>
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">
          Then {formatUsd(plan.fullUsd)} every {weeksOf(plan)}. Reminder email 3 days before. Cancel
          anytime.
        </p>
      </Card>
      <ScreenSub>
        Pay on the web through our payment provider. Wallets first: fewer typos, fewer declines.
      </ScreenSub>
      <div className="mt-3 flex flex-col gap-2.5">
        {payButton("with Apple Pay", "dark")}
        {payButton("with Google Pay", "dark")}
        {payButton("by card", "outline")}
      </div>
      <Note>Demo: these buttons simulate a successful payment. No card details are collected.</Note>
    </ScreenBody>
  );
}

export function UpsellScreen() {
  const { actions, meta } = useQuiz();
  const service = SKILLS[meta.answers.skill].service.toLowerCase();
  return (
    <ScreenBody>
      <Pill tone="success">Payment successful</Pill>
      <ScreenTitle>One-time offer: {FIRST_CLIENT_KIT.name}</ScreenTitle>
      <ScreenSub>
        Get to your first client faster with the materials your coach uses in weeks 2 and 3, ready
        for <b>{service}</b>.
      </ScreenSub>
      <Card>
        <ul className="list-disc pl-[18px]">
          {FIRST_CLIENT_KIT.contents.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
      <Card className="flex items-center justify-between gap-3">
        <span>
          <b>{formatUsd(FIRST_CLIENT_KIT.priceUsd)}</b>{" "}
          <span className="text-sm text-ink-muted">one-off, not a subscription</span>
        </span>
        <Pill tone="warning">Only now</Pill>
      </Card>
      <Cta>
        <Button onClick={() => actions.finish(true)}>
          Add to my plan · {formatUsd(FIRST_CLIENT_KIT.priceUsd)}
        </Button>
        <Button variant="ghost" onClick={() => actions.finish(false)}>
          No thanks, continue
        </Button>
      </Cta>
    </ScreenBody>
  );
}
