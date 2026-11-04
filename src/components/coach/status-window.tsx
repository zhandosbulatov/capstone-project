"use client";

// The status window: where you are on the 30-day route, your title, level, XP and the six stats.
// Game-style information, calm presentation.

import { ViewTransition } from "react";
import { RouteStrip } from "@/components/route";
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

/** XP towards the next level, on the route colour. Grows with a transform, not width. */
export function XpBar({ into, needed, level }: { into: number; needed: number; level: number }) {
  const pct = Math.min(100, Math.round((into / needed) * 100));
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-route-soft"
      role="progressbar"
      aria-label={`XP to level ${level + 1}`}
      aria-valuemin={0}
      aria-valuemax={needed}
      aria-valuenow={into}
    >
      <div
        className="h-full origin-left rounded-full bg-route transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}

export function StatusWindow() {
  const { state, meta } = useCoach();
  const { game } = state.saved;
  const { level, into, needed } = meta.progress;

  return (
    <section aria-label="Your status" className="rounded-md border border-line bg-surface px-4 pt-3 pb-1">
      <RouteStrip day={game.day} />

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[22px] leading-tight">
          <ViewTransition key={meta.title} enter="bump" exit="none" default="none">
            <span className="inline-block">{TITLES[meta.title].label}</span>
          </ViewTransition>
          <span className="text-muted"> · </span>
          <span className="whitespace-nowrap">
            Level <Ticker value={level} />
          </span>
        </h2>
        <p className="text-[13px] whitespace-nowrap text-muted tabular-nums">
          {into} / {needed} XP
        </p>
      </div>
      <div className="mt-2">
        <XpBar into={into} needed={needed} level={level} />
      </div>

      <dl className="mt-3 grid grid-cols-3 border-t border-line">
        {STAT_KEYS.map((stat, i) => (
          <div
            key={stat}
            title={STATS[stat].meaning}
            className={`py-2 ${i < 3 ? "border-b border-line" : ""}`}
          >
            <dt className="truncate text-[13px] text-muted">{STATS[stat].label}</dt>
            <dd className="font-display text-lg leading-tight">
              <Ticker value={game.stats[stat]} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
