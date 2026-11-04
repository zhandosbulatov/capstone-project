// Small shared building blocks. Variants are explicit strings, not boolean flags.

/** "The reply in a chat, email or DM" → "the reply in a chat, email or DM" */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "outline" | "ghost";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-bright font-semibold text-base py-[14px] hover:opacity-92",
  dark: "bg-ink text-canvas font-semibold text-base py-[14px] hover:opacity-92",
  outline:
    "border-[1.5px] border-line-strong bg-surface font-semibold text-base py-[12.5px] hover:border-ink",
  ghost: "bg-transparent text-ink-muted font-semibold text-sm py-2.5 hover:text-ink",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      className={`block w-full cursor-pointer rounded-md px-[18px] text-center transition-[opacity,border-color,color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_STYLES[variant]} ${className}`}
      {...props}
    />
  );
}

type PillTone = "accent" | "good" | "warn" | "route";

const PILL_STYLES: Record<PillTone, string> = {
  accent: "bg-sun-soft text-brand-ink",
  good: "bg-success-soft text-success-ink",
  warn: "bg-warning-soft text-warning-ink",
  route: "bg-brand-soft text-brand-ink",
};

/** Status that changes (Done, Beaten, Recovery). Not a decorative kicker above headings. */
export function Pill({ tone = "accent", children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span
      className={`inline-block w-fit rounded px-2 py-0.5 text-xs font-semibold ${PILL_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`my-2.5 rounded-md border border-line bg-surface px-4 py-4 ${className}`}
      {...props}
    />
  );
}

/** Small label above a value. Sentence case, like a station sign. */
export function Label({ children }: { children: ReactNode }) {
  return <span className="block text-[13px] font-semibold text-ink-muted">{children}</span>;
}

/** The reward as chips on the route colour: orange always means progress. */
export function Rewards({ parts, note }: { parts: string[]; note?: string }) {
  return (
    <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[13px]">
      <span className="sr-only">Reward: </span>
      {parts.map((part) => (
        <span key={part} className="rounded bg-brand-soft px-2 py-0.5 font-semibold text-brand-ink">
          {part}
        </span>
      ))}
      {note ? <span className="text-ink-muted">{note}</span> : null}
    </p>
  );
}
