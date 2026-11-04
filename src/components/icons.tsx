// The app's few icons: Tabler outline paths (MIT), 24px grid, 2px stroke, round caps and joins.
// Decorative by default; give the surrounding element the accessible name.

import type { ComponentProps } from "react";

const PATHS = {
  flame:
    "M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z",
  shield: "M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3",
  check: "M5 12l5 5l10 -10",
  arrowLeft: "M5 12l14 0M5 12l6 6M5 12l6 -6",
  arrowRight: "M5 12l14 0M13 18l6 -6M13 6l6 6",
  sun: "M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7",
  moon: "M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z",
  desktop:
    "M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10zM7 20h10M9 16v4M15 16v4",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 18,
  ...props
}: { name: IconName; size?: number } & Omit<ComponentProps<"svg">, "children">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
