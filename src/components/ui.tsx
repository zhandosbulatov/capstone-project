// Small shared building blocks. Variants are explicit strings, not boolean flags.

import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "outline" | "ghost";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink font-bold text-base py-[15px]",
  dark: "bg-ink text-bg font-bold text-base py-[15px]",
  outline:
    "border-[1.5px] border-line bg-surface font-semibold text-base py-[14px] hover:border-accent",
  ghost: "bg-transparent text-muted font-medium text-sm py-2.5",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      className={`block w-full cursor-pointer rounded-[14px] px-[18px] text-center transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_STYLES[variant]} ${className}`}
      {...props}
    />
  );
}

type PillTone = "accent" | "good" | "warn";

const PILL_STYLES: Record<PillTone, string> = {
  accent: "bg-accent-soft text-accent",
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
};

export function Pill({ tone = "accent", children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span
      className={`inline-block w-fit rounded-full px-2 py-[3px] text-[11px] font-bold uppercase tracking-[0.04em] ${PILL_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`my-2.5 rounded-[14px] border border-line bg-surface px-4 py-3.5 ${className}`}
      {...props}
    />
  );
}

/** Small uppercase label above a value. */
export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted">
      {children}
    </span>
  );
}
