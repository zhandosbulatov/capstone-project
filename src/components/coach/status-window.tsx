"use client";

// The status window: title and level, then XP and the six stats. It sits inside a collapsible
// section in Progress, so it has no hero styling.

import { ViewTransition } from "react";
import { XpBar } from "@/components/xp-bar";
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
  // (service and price now live in Settings, "About you")
  const { level, into, needed } = meta.progress;

  return (
    <section aria-label="Your status" className="flex flex-col gap-3">
      <p className="text-sm">
        <ViewTransition key={meta.title} enter="bump" exit="none" default="none">
          <span className="inline-block font-semibold">{TITLES[meta.title].label}</span>
        </ViewTransition>
        {" · "}
        <span className="whitespace-nowrap">
          Level <Ticker value={level} />
        </span>
      </p>

      <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="type-label">Progress to level {level + 1}</h2>
        <p className="text-label whitespace-nowrap text-ink-muted tabular-nums">
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
            <dt className="truncate text-label text-ink-muted">{STATS[stat].label}</dt>
            <dd className="text-lg leading-tight font-bold tabular-nums">
              <Ticker value={game.stats[stat]} />
            </dd>
          </div>
        ))}
      </dl>
      </div>
    </section>
  );
}
