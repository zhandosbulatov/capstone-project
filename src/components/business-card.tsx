// The signature object (DESIGN.md): the side service the quiz creates, printed as a sunshine
// business card. Used in the landing hero (with a one-time flip), the plan screen and the app.

import type { ReactNode } from "react";

const RAVEN =
  "M7 24c0-6 2.5-11 7.5-12.5 3-.9 5.6.2 7 2.2l5.5 1.6-5 1.4c-.3 3.9-3.3 7.3-7.5 7.3H7z";

function RavenMark({ size }: { size: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 32 32" className="fill-on-bright">
      <path d={RAVEN} />
    </svg>
  );
}

/** The sunshine card. Text on it is always on-bright (dark) in both themes. */
export function BusinessCard({
  name,
  service,
  price,
  title,
  className = "",
  children,
}: {
  /** The holder's name; the app has none, so it is optional. */
  name?: string;
  service: string;
  price: string;
  /** Printed on the chip at the bottom, e.g. "Side Starter". */
  title: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative rounded-md bg-sun px-5 pt-4 pb-14 text-on-bright ${className}`}>
      {name ? <p className="font-display text-h3 leading-tight">{name}</p> : null}
      <p className={`font-semibold leading-snug ${name ? "mt-1.5 text-base" : "font-display text-xl"}`}>
        {service}
      </p>
      <p className="mt-2 font-display text-lg">{price}</p>
      {children}
      <span className="absolute bottom-3.5 left-4 rounded-full bg-on-bright px-2.5 py-0.5 text-label font-bold text-sun">
        {title}
      </span>
      <span className="absolute right-4 bottom-3">
        <RavenMark size={26} />
      </span>
    </div>
  );
}

/**
 * Landing hero: the old work card behind, the new sunshine card in front. The new card flips
 * over once on load (the page's one motion moment); reduced motion shows it already flipped.
 */
export function HeroCards() {
  return (
    <div
      role="img"
      aria-label="Two business cards. The old one: Alex Morgan, Designer at Northwind Ltd. The new one: Alex Morgan, brand starter kits for local businesses, from $450, Side Starter."
      className="relative mx-auto h-[300px] w-full max-w-[400px] [perspective:900px] sm:h-[340px]"
    >
      <span aria-hidden className="absolute top-12 -right-2 size-56 rounded-full bg-accent/35 sm:size-64" />
      <div className="absolute top-0 left-0 w-[78%] -rotate-[5deg] rounded-md border border-line bg-surface p-4 pb-10 text-ink-muted">
        <p className="font-display text-lg text-ink/60">Alex Morgan</p>
        <p className="text-label">Designer, Northwind Ltd</p>
      </div>
      <div className="card-flip absolute top-24 right-0 w-[82%] rotate-[3deg] [transform-style:preserve-3d] sm:top-28">
        <BusinessCard
          name="Alex Morgan"
          service="Brand starter kits for local businesses"
          price="from $450"
          title="Side Starter"
          className="[backface-visibility:hidden]"
        />
        <div
          aria-hidden
          className="absolute inset-0 grid place-items-center rounded-md bg-brand [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <RavenMark size={44} />
        </div>
      </div>
    </div>
  );
}
