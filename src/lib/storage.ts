// Everything the user does is saved in this browser only. No account, no server.

import { createGame, type GameState } from "./game";
import type { PlanKey, QuizAnswers } from "./quiz-data";

const KEY = "aibc:v1";
const VERSION = 1;

export type Purchase = {
  plan: PlanKey;
  /** ISO date of the simulated payment. */
  paidAt: string;
  firstClientKit: boolean;
};

export type SavedState = {
  version: typeof VERSION;
  answers: QuizAnswers | null;
  email: string | null;
  purchase: Purchase | null;
  /** ISO date the plan was built, so "client by" stays fixed. */
  planStartedAt: string | null;
  game: GameState;
  cancelled: boolean;
  /** The offer the user wrote on day 1. */
  offer: string | null;
  /** The warm list from day 1. */
  warmList: string[];
};

export function emptyState(): SavedState {
  return {
    version: VERSION,
    answers: null,
    email: null,
    purchase: null,
    planStartedAt: null,
    game: createGame(),
    cancelled: false,
    offer: null,
    warmList: [],
  };
}

/** The raw saved string, or null if nothing is saved or storage is blocked. */
export function loadRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Returns null for missing, broken or old-version data. */
export function parseState(raw: string | null): SavedState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    if (parsed.version !== VERSION || !parsed.game) return null;
    return { ...emptyState(), ...parsed } as SavedState;
  } catch {
    return null;
  }
}

export function loadState(): SavedState | null {
  return parseState(loadRaw());
}

/** Returns false if the browser refused to save. */
export function saveState(state: SavedState): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function updateState(update: (state: SavedState) => SavedState): SavedState {
  const next = update(loadState() ?? emptyState());
  saveState(next);
  return next;
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing saved, or storage is blocked: either way there is nothing to clear.
  }
}
