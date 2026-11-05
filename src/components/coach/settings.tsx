"use client";

import { useState } from "react";
import { formatMonthDay } from "@/lib/plan";
import { formatUsd } from "@/lib/pricing";
import { SKILLS } from "@/lib/quiz-data";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button, Card, Label } from "@/components/ui";
import { useCoach } from "./app-context";

export function Settings() {
  const { state, actions, meta } = useCoach();
  const { saved } = state;
  const plan = meta.purchasePlan;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-3xl">Settings</h1>

      <Card className="my-0">
        <Label>Your plan</Label>
        <p className="mt-1 font-semibold">{plan.name}</p>
        <p className="text-sm text-ink-muted">
          {saved.cancelled
            ? `Cancelled. You keep access until ${formatMonthDay(meta.renewsOn)}. Nothing else will be charged.`
            : `Renews on ${formatMonthDay(meta.renewsOn)} at ${formatUsd(plan.fullUsd)} every ${plan.weeks} weeks. We email you 3 days before.`}
        </p>
        <div className="mt-3">
          {saved.cancelled ? (
            <Button variant="outline" onClick={actions.resumePlan}>
              Keep my plan after all
            </Button>
          ) : (
            <Button variant="outline" onClick={actions.cancelPlan}>
              Cancel plan
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-muted">Demo: no payment was taken and none will be.</p>
      </Card>

      <Card className="my-0">
        <Label>About you</Label>
        <dl className="mt-1 flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Service</dt>
            <dd className="text-right">{SKILLS[meta.answers.skill].service}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Starting price</dt>
            <dd>{meta.plan.priceLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Time a day</dt>
            <dd>{meta.answers.time} min</dd>
          </div>
          {saved.email ? (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Email</dt>
              <dd className="truncate">{saved.email}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-2 text-xs text-ink-muted">
          Your answers and progress are saved in this browser only.
        </p>
      </Card>

      <Card className="my-0">
        <Label>Appearance</Label>
        <ThemeSwitcher className="mt-2" />
        <p className="mt-2 text-xs text-ink-muted">System follows your device&apos;s light or dark setting.</p>
      </Card>

      <Card className="my-0">
        <Label>Start over</Label>
        <p className="mt-1 text-sm text-ink-muted">
          Deletes your answers, offer, people, lessons and progress from this browser.
        </p>
        <div className="mt-3">
          {confirmReset ? (
            <div className="flex flex-col gap-2">
              <Button variant="dark" onClick={actions.resetEverything}>
                Yes, delete everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Keep my progress
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setConfirmReset(true)}>
              Reset everything
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
