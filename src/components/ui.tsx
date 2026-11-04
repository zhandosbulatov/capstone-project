// Small shared building blocks. Variants and states are explicit strings, not boolean flags.
// Styling follows DESIGN.md: pill buttons, 6px cards, borders only, ink focus ring.

import type { ComponentProps, ReactNode } from "react";

/** "The reply in a chat, email or DM" → "the reply in a chat, email or DM" */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "dark";
export type ButtonSize = "md" | "sm";
export type ButtonStatus = "idle" | "loading";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-bright hover:bg-brand-hover",
  secondary: "bg-accent text-on-bright hover:bg-accent-hover",
  outline: "border-[1.5px] border-line-strong bg-surface text-ink hover:border-ink",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-sand",
  dark: "bg-ink text-canvas hover:opacity-90",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-12 px-6 text-base",
  sm: "min-h-9 px-4 text-sm",
};

/**
 * Shared class list for anything that looks like a button (a <button> or a link).
 * States: hover (per variant), active (1px press), focus-visible (ink ring, 2px offset),
 * disabled (45% opacity) and loading (aria-busy, set by <Button status="loading">).
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  width = "full",
}: { variant?: ButtonVariant; size?: ButtonSize; width?: "full" | "auto" } = {}): string {
  return [
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-center font-semibold",
    "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
    "active:translate-y-px aria-busy:cursor-progress",
    "disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0",
    width === "full" ? "w-full" : "",
    VARIANTS[variant],
    SIZES[size],
  ].join(" ");
}

function Spinner() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 animate-spin motion-reduce:animate-none"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  width = "full",
  status = "idle",
  className = "",
  children,
  disabled,
  onClick,
  ...props
}: ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: "full" | "auto";
  status?: ButtonStatus;
}) {
  const loading = status === "loading";
  return (
    <button
      type="button"
      aria-busy={loading || undefined}
      disabled={disabled}
      onClick={loading ? undefined : onClick}
      className={`${buttonClass({ variant, size, width })} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

/** Text inputs, textareas and selects. 3:1 border, ink border and ring on focus. */
export const fieldClass =
  "w-full rounded-md border-[1.5px] border-line-strong bg-surface px-3.5 py-3 text-base text-ink placeholder:text-ink-muted focus:border-ink focus:outline-2 focus:outline-offset-1 focus:outline-ink aria-invalid:border-error-ink disabled:opacity-45";

export type PillTone = "brand" | "accent" | "success" | "warning";

const PILL_TONES: Record<PillTone, string> = {
  brand: "bg-brand-soft text-brand-ink",
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-success-soft text-success-ink",
  warning: "bg-warning-soft text-warning-ink",
};

/** Status that changes (Done, Beaten, Recovery). Not a decorative kicker above headings. */
export function Pill({ tone = "accent", children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span
      className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${PILL_TONES[tone]}`}
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

/** Small label above a value. */
export function Label({ children }: { children: ReactNode }) {
  return <span className="type-label block">{children}</span>;
}

/** The reward as peach chips: peach always means progress. */
export function Rewards({ parts, note }: { parts: string[]; note?: string }) {
  return (
    <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-label">
      <span className="sr-only">Reward: </span>
      {parts.map((part) => (
        <span key={part} className="rounded-full bg-brand-soft px-2.5 py-0.5 font-semibold text-brand-ink">
          {part}
        </span>
      ))}
      {note ? <span className="text-ink-muted">{note}</span> : null}
    </p>
  );
}
