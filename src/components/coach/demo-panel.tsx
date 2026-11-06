"use client";

// ?demo=1 only: controls for showing a week of progress in a one-minute live demo.

import { oldestMessaged } from "@/lib/demo";
import { useCoach } from "./app-context";

function DemoButton({
  onClick,
  disabled = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold hover:border-ink focus-visible:outline-2 focus-visible:outline-ink"
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
      <p className="text-xs font-bold tracking-[0.05em] text-warning-ink uppercase">
        Demo controls · day {state.saved.game.day}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <DemoButton onClick={demo.nextDay}>Next day</DemoButton>
        <DemoButton onClick={demo.missDay}>Miss a day</DemoButton>
        <DemoButton onClick={demo.seedPeople}>Seed demo people</DemoButton>
        <DemoButton onClick={demo.simulateReply} disabled={!oldestMessaged(state.saved.contacts)}>
          Simulate a reply
        </DemoButton>
        <DemoButton onClick={demo.unlockAllLessons} disabled={Boolean(state.saved.demoUnlockAll)}>
          Unlock all lessons
        </DemoButton>
      </div>
    </section>
  );
}
