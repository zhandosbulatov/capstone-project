// A static picture of the real app for the landing hero: the route, the status window and today's
// quest hanging off its stop. Built from the same components and tokens as /app, with sample data.

import { HuginAvatar } from "@/components/coach/hugin";
import { XpBar } from "@/components/coach/status-window";
import { Icon } from "@/components/icons";
import { Rail, RouteStrip, Stop } from "@/components/route";
import { Rewards } from "@/components/ui";
import { STAT_KEYS, STATS } from "@/lib/game";

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
      aria-label="A preview of the app: day 8 of 30 on the route, your title, level, stats and today's quest"
      role="img"
      className="mx-auto w-full max-w-[380px] rounded-[20px] border border-line-strong bg-canvas p-3"
    >
      <div className="flex items-center justify-between px-1 pt-1 pb-2 text-sm">
        <p className="font-display text-base">
          Day 8 <span className="font-semibold text-ink-muted">of 30</span>
        </p>
        <p className="flex items-center gap-2.5 font-semibold tabular-nums">
          <span className="flex items-center gap-1">
            <Icon name="flame" size={15} className="text-brand" />7
          </span>
          <span className="flex items-center gap-1">
            <Icon name="shield" size={15} className="text-ink-muted" />1
          </span>
          <HuginAvatar size={26} />
        </p>
      </div>

      <div className="rounded-md border border-line bg-surface px-3.5 pt-2.5 pb-1">
        <RouteStrip day={8} />
        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-display text-lg leading-tight">Side Starter · Level 3</p>
          <p className="text-xs text-ink-muted tabular-nums">80 / 100 XP</p>
        </div>
        <div className="mt-1.5">
          <XpBar into={80} needed={100} level={3} />
        </div>
        <dl className="mt-2.5 grid grid-cols-3 border-t border-line">
          {STAT_KEYS.map((stat, i) => (
            <div key={stat} className={`py-1.5 ${i < 3 ? "border-b border-line" : ""}`}>
              <dt className="truncate text-xs text-ink-muted">{STATS[stat].label}</dt>
              <dd className="font-display text-base leading-tight">{SAMPLE_STATS[stat]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Rail className="mt-3">
        <Stop kind="now" segment="none" label="Day 8 · today · 20 min">
          <div className="mt-1.5 rounded-md border border-line bg-surface p-3">
            <p className="font-display text-[17px] leading-snug">Offer a 15-minute call to 3 people</p>
            <Rewards parts={["+10 XP", "Reach +1", "Persuasion +1"]} />
            <p className="mt-2.5 flex items-start gap-2 text-[13px] text-ink-muted">
              <HuginAvatar size={22} />
              <span className="pt-0.5">Fifteen minutes gets a yes. An hour gets a maybe.</span>
            </p>
          </div>
        </Stop>
      </Rail>
    </div>
  );
}
