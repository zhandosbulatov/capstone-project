// XP progress bar. No hooks, so it renders on the server too (the landing preview uses it).

/** XP towards the next level, in peach. Grows with a transform, not width. */
export function XpBar({ into, needed, level }: { into: number; needed: number; level: number }) {
  const pct = Math.min(100, Math.round((into / needed) * 100));
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-brand-soft"
      role="progressbar"
      aria-label={`XP to level ${level + 1}`}
      aria-valuemin={0}
      aria-valuemax={needed}
      aria-valuenow={into}
    >
      <div
        className="h-full origin-left rounded-full bg-brand transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}
