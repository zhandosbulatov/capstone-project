"use client";

// ?demo=1 only: controls for showing a week of progress in a one-minute live demo.

import { BOSS_KEYS, BOSSES } from "@/lib/game";
import { useCoach } from "./app-context";

function DemoButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold hover:border-ink focus-visible:outline-2 focus-visible:outline-ink"
    >
      {children}
    </button>
  );
}

export function DemoPanel() {
  const { state, actions } = useCoach();
  const { demo } = actions;
  return (
    <section
      aria-label="Demo controls"
      className="rounded-md border-2 border-dashed border-warning bg-warning-soft/40 px-3.5 py-3"
    >
      <p className="text-[11px] font-bold tracking-[0.05em] text-warning-ink uppercase">
        Demo controls · day {state.saved.game.day}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <DemoButton onClick={demo.nextDay}>Next day</DemoButton>
        <DemoButton onClick={demo.missDay}>Miss a day</DemoButton>
        <DemoButton onClick={demo.addXp}>+100 XP</DemoButton>
        {BOSS_KEYS.map((key) => (
          <DemoButton key={key} onClick={() => demo.jumpToBoss(key)}>
            {`Week ${BOSSES[key].week} boss`}
          </DemoButton>
        ))}
      </div>
    </section>
  );
}
