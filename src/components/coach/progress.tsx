"use client";

// Placeholder from the base: what used to sit on Today and Journey. Lane L4 designs it.

import { BossCard } from "./boss";
import { Journey } from "./journey";
import { StatusWindow } from "./status-window";

export function Progress() {
  return (
    <div className="flex flex-col gap-4">
      <StatusWindow />
      <BossCard />
      <Journey />
    </div>
  );
}
