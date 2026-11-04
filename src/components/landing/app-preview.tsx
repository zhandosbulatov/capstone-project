// A static picture of the real app for the landing hero: the status window and a day-2 quest.
// Same layout and tokens as /app, filled with sample progress.

import { STAT_KEYS, STATS } from "@/lib/game";
import { HuginAvatar } from "@/components/coach/hugin";

const SAMPLE_STATS: Record<(typeof STAT_KEYS)[number], number> = {
  clarity: 3,
  reach: 9,
  persuasion: 2,
  pricingPower: 1,
  consistency: 5,
  reputation: 1,
};

export function AppPreview() {
  return (
    <div
      aria-label="A preview of the app: your title, level, stats and today's quest"
      role="img"
      className="mx-auto w-full max-w-[380px] rounded-[28px] border border-line bg-bg p-3 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.35)]"
    >
      <div className="flex items-center justify-between px-1 pt-1 pb-2 text-sm">
        <p className="font-bold">
          Day 8 <span className="font-normal text-muted">of 30</span>
        </p>
        <p className="flex items-center gap-2.5 font-semibold">
          <span>🔥 7</span>
          <span>🛡 1</span>
          <HuginAvatar size={26} />
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-3.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.06em] text-muted uppercase">Title</p>
            <p className="font-display text-xl leading-tight">Side Starter</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-[0.06em] text-muted uppercase">Level</p>
            <p className="font-display text-xl leading-tight">3</p>
          </div>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full w-[80%] rounded-full bg-accent" />
        </div>
        <p className="mt-1 text-[11px] text-muted">80 / 100 XP</p>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {STAT_KEYS.map((stat) => (
            <div key={stat} className="rounded-lg bg-bg px-2 py-1.5">
              <p className="truncate text-[10px] text-muted">{STATS[stat].label}</p>
              <p className="text-base leading-tight font-semibold">{SAMPLE_STATS[stat]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 rounded-2xl border border-line bg-surface p-3.5">
        <span className="inline-block rounded-full bg-accent-soft px-2 py-[3px] text-[10px] font-bold tracking-[0.04em] text-accent uppercase">
          Today’s quest · 20 min
        </span>
        <p className="mt-1.5 font-bold">Offer a 15-minute call to 3 people</p>
        <p className="mt-0.5 text-[11px] text-muted">Reward: +10 XP · Reach +1 · Persuasion +1</p>
        <p className="mt-2.5 flex items-start gap-2 text-[13px] text-muted">
          <HuginAvatar size={22} />
          <span className="pt-0.5">Fifteen minutes gets a yes. An hour gets a maybe.</span>
        </p>
      </div>
    </div>
  );
}
