"use client";

import { useEffect, useRef, useSyncExternalStore, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { loadRaw, parseState, type SavedState } from "@/lib/storage";
import { AppProvider, isActive, useCoach, type Sheet as SheetState, type Tab } from "./app-context";
import { BossCard, LogResultSheet } from "./boss";
import { DemoPanel } from "./demo-panel";
import { HuginAvatar } from "./hugin";
import { ChatSheet, DraftSheet } from "./hugin-sheets";
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
  const { state, actions, meta } = useCoach();
  const { game } = state.saved;

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col pb-20">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="font-bold">
          Day {game.day} <span className="font-normal text-muted">of 30</span>
        </p>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span title="Streak">
            <span aria-hidden>🔥 </span>
            {game.streak}
            <span className="sr-only"> day streak</span>
          </span>
          <span title="Streak Shields">
            <span aria-hidden>🛡 </span>
            {game.shields}
            <span className="sr-only"> Streak Shields</span>
          </span>
          <button
            type="button"
            onClick={() => actions.openSheet({ kind: "chat" })}
            aria-label="Ask Hugin"
            className="-m-1 cursor-pointer rounded-full p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <HuginAvatar size={34} />
          </button>
        </div>
      </header>

      <main id="main" className="flex flex-1 flex-col px-4">
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

const SHEET_LABELS: Record<Exclude<SheetState, null>["kind"], string> = {
  log: "Log a result",
  tool: "Tool",
  draft: "Drafts from Hugin",
  chat: "Ask Hugin",
};

/** Bottom sheet for logging a result, reading a tool, drafts and chat. */
function Sheet() {
  const { state, actions } = useCoach();
  const { sheet } = state;
  const { closeSheet } = actions;
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = sheet !== null;

  // Move focus into the sheet when it opens, keep Tab inside it, and give focus back on close.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [isOpen, closeSheet]);

  if (!sheet) return null;
  return (
    <ViewTransition enter="sheet-in" exit="sheet-out" default="none">
      <div className="fixed inset-0 z-40 flex items-end justify-center">
        <div aria-hidden onClick={closeSheet} className="absolute inset-0 bg-black/40" />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={SHEET_LABELS[sheet.kind]}
          tabIndex={-1}
          className="relative max-h-[88vh] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-3xl bg-surface px-5 pt-5 pb-8 focus:outline-none"
        >
          {sheet.kind === "log" ? (
            <LogResultSheet initial={sheet.result} />
          ) : sheet.kind === "tool" ? (
            <ToolSheet tool={sheet.tool} />
          ) : sheet.kind === "draft" ? (
            <DraftSheet kind={sheet.draft} />
          ) : (
            <ChatSheet />
          )}
        </div>
      </div>
    </ViewTransition>
  );
}
