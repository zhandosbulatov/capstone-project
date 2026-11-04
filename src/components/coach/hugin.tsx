import type { ReactNode } from "react";

/** Hugin the raven: a small avatar, never a full-screen character. */
export function HuginAvatar({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Hugin"
      className="flex-none"
    >
      <circle cx="16" cy="16" r="16" className="fill-accent-soft" />
      {/* Head and body facing right, with a long beak. */}
      <path
        d="M7 24c0-6 2.5-11 7.5-12.5 3-.9 5.6.2 7 2.2l5.5 1.6-5 1.4c-.3 3.9-3.3 7.3-7.5 7.3H7z"
        className="fill-ink"
      />
      <circle cx="18.6" cy="14.6" r="1.1" className="fill-accent-soft" />
    </svg>
  );
}

/** Hugin's one-line comment next to a card. */
export function HuginLine({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2.5 text-sm text-muted">
      <HuginAvatar />
      <span className="pt-1">{children}</span>
    </p>
  );
}
