"use client";

import { useEffect, useSyncExternalStore, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { loadRaw, parseState, type SavedState } from "@/lib/storage";
import { AppProvider, isActive, useCoach, type Tab } from "./app-context";
import { BossCard, LogResultSheet } from "./boss";
import { DemoPanel } from "./demo-panel";
import { Journey, ToolSheet } from "./journey";
import { TodayQuest } from "./quest";
import { Settings } from "./settings";
import { StatusWindow } from "./status-window";
import { Toasts } from "./toasts";

const noSubscribe = () => () => {};

// Parse once per saved string, so the snapshot stays the same object between renders.
let lastRaw: string | null = null;
let lastParsed: SavedState | null = null;
function savedSnapshot(): SavedState | null {
  const raw = loadRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parseState(raw);
  }
  return lastParsed;
}

/** undefined while pre-rendering, then what this browser has saved. */
function useSaved(): SavedState | null | undefined {
  return useSyncExternalStore(noSubscribe, savedSnapshot, () => undefined);
}

function useDemo(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).has("demo"),
    () => false,
  );
}

export function CoachApp() {
  const saved = useSaved();
  const demo = useDemo();
  const router = useRouter();
  const active = isActive(saved ?? null);

  useEffect(() => {
    if (saved !== undefined && !active) router.replace(demo ? "/quiz?demo=1" : "/quiz");
  }, [saved, active, demo, router]);

  if (saved === undefined || !isActive(saved)) {
    return (
      <main className="mx-auto flex w-full max-w-[440px] flex-1 items-center justify-center px-4">
        <p className="text-muted">{saved === undefined ? "Loading your plan…" : "Taking you to the quiz…"}</p>
      </main>
    );
  }

  return (
    <AppProvider initial={saved} demo={demo}>
      <Shell />
    </AppProvider>
  );
}

const TABS: { key: Tab; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "journey", label: "Journey" },
  { key: "settings", label: "Settings" },
];

function Shell() {
  const { state, meta } = useCoach();
  const { game } = state.saved;

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col pb-20">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="font-bold">
          Day {game.day} <span className="font-normal text-muted">of 30</span>
        </p>
        <p className="flex items-center gap-3 text-sm font-semibold">
          <span aria-label={`Streak ${game.streak} days`}>🔥 {game.streak}</span>
          <span aria-label={`${game.shields} Streak Shields`} title="Streak Shields">
            🛡 {game.shields}
          </span>
        </p>
      </header>

      <main className="flex flex-1 flex-col px-4">
        <ViewTransition key={state.tab} enter="fade-in" exit="fade-out" default="none">
          <div className="flex flex-col gap-3">
            {state.tab === "today" ? (
              <>
                <StatusWindow />
                <TodayQuest />
                <BossCard />
                {meta.demo ? <DemoPanel /> : null}
              </>
            ) : state.tab === "journey" ? (
              <Journey />
            ) : (
              <Settings />
            )}
          </div>
        </ViewTransition>
      </main>

      <Sheet />
      <Toasts />
      <TabBar />
    </div>
  );
}

function TabBar() {
  const { state, actions } = useCoach();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-[440px]">
        {TABS.map((tab) => (
          <li key={tab.key} className="flex-1">
            <button
              type="button"
              onClick={() => actions.setTab(tab.key)}
              aria-current={state.tab === tab.key ? "page" : undefined}
              className={`w-full cursor-pointer py-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-accent ${state.tab === tab.key ? "text-accent" : "text-muted"}`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Bottom sheet for logging a result or reading a tool. */
function Sheet() {
  const { state, actions } = useCoach();
  const { sheet } = state;

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") actions.closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet, actions]);

  if (!sheet) return null;
  return (
    <ViewTransition enter="sheet-in" exit="sheet-out" default="none">
      <div className="fixed inset-0 z-40 flex items-end justify-center">
        <button
          type="button"
          aria-label="Close"
          onClick={actions.closeSheet}
          className="absolute inset-0 cursor-default bg-black/40"
        />
        <div
          role="dialog"
          aria-modal="true"
          className="relative max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-t-3xl bg-surface px-5 pt-5 pb-8"
        >
          {sheet.kind === "log" ? (
            <LogResultSheet initial={sheet.result} />
          ) : (
            <ToolSheet tool={sheet.tool} />
          )}
        </div>
      </div>
    </ViewTransition>
  );
}
