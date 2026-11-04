"use client";

// The status window: title, level, XP to the next level, the six stats and the streak.
// Game-style information, calm presentation.

import { ViewTransition } from "react";
import { STAT_KEYS, STATS, TITLES } from "@/lib/game";
import { useCoach } from "./app-context";

/** A number that bumps gently when it changes. */
function Ticker({ value }: { value: number }) {
  return (
    <ViewTransition key={value} enter="bump" exit="none" default="none">
      <span className="inline-block tabular-nums">{value}</span>
    </ViewTransition>
  );
}

export function StatusWindow() {
  const { state, meta } = useCoach();
  const { game } = state.saved;
  const { level, into, needed } = meta.progress;
  const pct = Math.min(100, Math.round((into / needed) * 100));

  return (
    <section aria-label="Your status" className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.06em] text-muted uppercase">Title</p>
          <ViewTransition key={meta.title} enter="bump" exit="none" default="none">
            <p className="font-display text-2xl leading-tight">{TITLES[meta.title].label}</p>
          </ViewTransition>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold tracking-[0.06em] text-muted uppercase">Level</p>
          <p className="font-display text-2xl leading-tight">
            <Ticker value={level} />
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div
          className="h-2 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label={`XP to level ${level + 1}`}
          aria-valuemin={0}
          aria-valuemax={needed}
          aria-valuenow={into}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 flex justify-between text-xs text-muted">
          <span>
            {into} / {needed} XP
          </span>
          <span>Level {level + 1} next</span>
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        {STAT_KEYS.map((stat) => (
          <div key={stat} className="rounded-xl bg-bg px-2.5 py-2" title={STATS[stat].meaning}>
            <dt className="truncate text-[11px] text-muted">{STATS[stat].label}</dt>
            <dd className="text-lg leading-tight font-semibold">
              <Ticker value={game.stats[stat]} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
