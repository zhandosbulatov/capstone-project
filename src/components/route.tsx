// The route: the 30-day plan drawn as one transit line. Days are stops (ticks), weekly bosses are
// interchange stations (rings), "You" marks today. Used at three scales (see DESIGN.md):
// RouteStrip (all 30 days), and Rail + Stop (a vertical line that content hangs off).

import type { ReactNode } from "react";
import { Icon } from "./icons";

const DAYS = 30;
const INTERCHANGES = [7, 14, 21, 28];
const W = 320;
const PAD = 8;
const Y = 16;

const x = (day: number) => PAD + ((day - 1) * (W - PAD * 2)) / (DAYS - 1);

/** All 30 days on one line, with today marked. */
export function RouteStrip({
  day,
  start = "Employee",
  end = "Consultant",
  you = "You",
  className = "",
}: {
  day: number;
  start?: string;
  end?: string;
  you?: string;
  className?: string;
}) {
  const d = Math.min(DAYS, Math.max(1, day));
  const xd = x(d);
  // Keep the "You" label clear of the end labels near either end of the line.
  const nearStart = d <= 5;
  const nearEnd = d >= 26;
  return (
    <svg
      viewBox={`0 0 ${W} 46`}
      className={`block h-auto w-full overflow-visible ${className}`}
      role="img"
      aria-label={`Day ${d} of ${DAYS}, on the way from ${start} to ${end}`}
    >
      <line x1={PAD} y1={Y} x2={W - PAD} y2={Y} className="stroke-brand-soft" strokeWidth={5} />
      <line x1={PAD} y1={Y} x2={xd} y2={Y} className="stroke-brand" strokeWidth={5} />
      {Array.from({ length: DAYS }, (_, i) => i + 1)
        .filter((n) => !INTERCHANGES.includes(n) && n !== d && n !== 1 && n !== DAYS)
        .map((n) => (
          <line
            key={n}
            x1={x(n)}
            x2={x(n)}
            y1={Y + 3}
            y2={Y + 8}
            strokeWidth={1}
            className={n < d ? "stroke-ink" : "stroke-line-strong"}
          />
        ))}
      <circle cx={PAD} cy={Y} r={4} className="fill-brand" />
      <circle cx={W - PAD} cy={Y} r={4} className="fill-brand-soft" />
      {INTERCHANGES.filter((n) => n !== d).map((n) => (
        <circle
          key={n}
          cx={x(n)}
          cy={Y}
          r={n < d ? 5 : 6}
          strokeWidth={2.5}
          className={n < d ? "fill-ink stroke-ink" : "fill-surface stroke-ink"}
        />
      ))}
      <circle cx={xd} cy={Y} r={8} className="fill-ink" />
      <circle cx={xd} cy={Y} r={3} className="fill-surface" />
      <g className="text-[11px]">
        {nearStart ? null : (
          <text x={PAD - 6} y={42} className="fill-ink-muted">
            {start}
          </text>
        )}
        <text
          x={nearStart ? PAD - 6 : nearEnd ? W - PAD + 6 : xd}
          y={42}
          textAnchor={nearStart ? "start" : nearEnd ? "end" : "middle"}
          className="fill-ink font-semibold"
        >
          {you}
        </text>
        {nearEnd ? null : (
          <text x={W - PAD + 6} y={42} textAnchor="end" className="fill-ink-muted">
            {end}
          </text>
        )}
      </g>
    </svg>
  );
}

/** A vertical line that stops hang off. */
export function Rail({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <ol className={`flex flex-col ${className}`}>{children}</ol>;
}

type StopKind = "now" | "boss" | "bossDone" | "minor" | "passed";
type Segment = "travelled" | "ahead" | "none";

const MARKERS: Record<StopKind, string> = {
  now: "left-[4.5px] top-0 size-[22px] border-[7px] border-ink bg-surface",
  boss: "left-[4.5px] top-0 size-[22px] border-4 border-ink bg-surface",
  bossDone: "left-[4.5px] top-0 grid size-[22px] place-items-center bg-ink text-surface",
  minor: "left-[11px] top-[5px] size-[9px] bg-surface",
  passed: "left-[9.5px] top-[3px] size-3 bg-ink",
};

/** One stop on a Rail: a marker on the line, a short label and anything hanging off it. */
export function Stop({
  kind,
  label,
  segment = "travelled",
  children,
}: {
  kind: StopKind;
  label: ReactNode;
  segment?: Segment;
  children?: ReactNode;
}) {
  return (
    <li className="relative pb-5 pl-10 last:pb-0">
      {segment === "none" ? null : (
        <span
          aria-hidden
          className={`absolute top-[11px] -bottom-[11px] left-[13px] w-[5px] ${segment === "travelled" ? "bg-brand" : "bg-brand-soft"}`}
        />
      )}
      <span aria-hidden className={`absolute z-10 rounded-full ${MARKERS[kind]}`}>
        {kind === "bossDone" ? <Icon name="check" size={12} strokeWidth={3} /> : null}
      </span>
      <p className="text-[13px] leading-[18px] font-semibold text-ink-muted">{label}</p>
      {children}
    </li>
  );
}
