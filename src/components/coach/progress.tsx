"use client";

// The Progress tab: your title, the four real milestones, the streak, and (collapsed) the stats.

import { TITLES } from "@/lib/game";
import { TOOL_LABELS } from "@/lib/tools";
import { Card, Label, Pill } from "@/components/ui";
import { useCoach } from "./app-context";
import { milestoneDays, nextTitle } from "./l4-helpers";
import { StatusWindow } from "./status-window";

export function Progress() {
  const { state, actions, meta } = useCoach();
  const { game } = state.saved;
  const next = nextTitle(meta.title);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">Progress</h1>

      <Card className="my-0">
        <Label>Your title</Label>
        <p className="mt-1 font-display text-2xl">{TITLES[meta.title].label}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {next
            ? `Next: ${next.label}. ${next.earnedBy}.`
            : "You are at the top of this ladder. The next goal is your monthly side income."}
        </p>
      </Card>

      <section aria-label="Milestones" className="rounded-md border border-line bg-surface px-4 py-3">
        <Label>Milestones</Label>
        <ul className="mt-2 divide-y divide-line">
          {milestoneDays(game).map((m) => (
            <li key={m.result} className="flex items-center justify-between gap-3 py-2.5">
              <span className={m.day === null ? "text-ink-muted" : "font-semibold"}>{m.label}</span>
              <span className="flex items-center gap-3 text-sm">
                {m.result === "clientPaid" && m.day !== null ? (
                  <button
                    type="button"
                    onClick={() => actions.openSheet({ kind: "log", result: "clientPaid" })}
                    className="cursor-pointer font-semibold text-brand-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    Add proof
                  </button>
                ) : null}
                {m.day === null ? (
                  <span className="text-ink-muted">not yet</span>
                ) : (
                  <Pill tone="success">Day {m.day}</Pill>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Card className="my-0">
        <Label>Streak</Label>
        <dl className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <dt className="text-label text-ink-muted">Current</dt>
            <dd className="text-lg font-bold tabular-nums">{game.streak}</dd>
          </div>
          <div>
            <dt className="text-label text-ink-muted">Best</dt>
            <dd className="text-lg font-bold tabular-nums">{game.bestStreak}</dd>
          </div>
          <div>
            <dt className="text-label text-ink-muted">Shields held</dt>
            <dd className="text-lg font-bold tabular-nums">{game.shields}</dd>
          </div>
        </dl>
      </Card>

      {/* P08 fills the next two blocks. */}
      <section aria-label="Course map" className="rounded-md border border-line bg-surface px-4 py-3">
        <Label>Course map</Label>
        <p className="mt-1 text-sm text-ink-muted">Lessons appear here</p>
      </section>

      <section
        aria-label="Your business on one page"
        className="rounded-md border border-line bg-surface px-4 py-3"
      >
        <Label>Your business on one page</Label>
        <p className="mt-1 text-sm text-ink-muted">Your business on one page appears here</p>
      </section>

      {meta.tools.length ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="Your tools" role="group">
          <span className="text-sm text-ink-muted">Tools:</span>
          {meta.tools.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => actions.openSheet({ kind: "tool", tool })}
              className="cursor-pointer rounded-full border-[1.5px] border-line-strong bg-surface px-3 py-1 text-sm font-semibold hover:border-ink focus-visible:outline-2 focus-visible:outline-ink"
            >
              {TOOL_LABELS[tool]}
            </button>
          ))}
        </div>
      ) : null}

      <details className="group rounded-md border border-line bg-surface">
        <summary className="cursor-pointer list-none px-4 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
          Stats for the curious
        </summary>
        <div className="px-4 pb-4">
          <StatusWindow />
        </div>
      </details>
    </div>
  );
}
