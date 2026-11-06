// Everything the user does is saved in this browser only. No account, no server.

import { createGame, type GameState } from "./game";
import type { Contact, LessonsState } from "./model";
import type { PlanKey, QuizAnswers } from "./quiz-data";

/** The key name stays "v1"; the `version` field inside says which shape is stored. */
const KEY = "aibc:v1";
const VERSION = 2;

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
  /** The people the user may message, from day 1 on. Replaces the v1 `warmList`. */
  contacts: Contact[];
  /** Read and decided lessons. */
  lessons: LessonsState;
  /** Set by the demo control "Unlock all lessons" (?demo=1 only). */
  demoUnlockAll?: boolean;
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
    contacts: [],
    lessons: {},
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

/** v1 kept a plain list of names. Each one becomes a listed contact. */
export function migrateV1(v1: Record<string, unknown>): SavedState {
  const { warmList, ...rest } = v1;
  const names = Array.isArray(warmList)
    ? warmList.filter((n): n is string => typeof n === "string" && n.trim() !== "")
    : [];
  const contacts: Contact[] = names.map((name, i) => ({
    id: `c${i + 1}`,
    name: name.trim(),
    relation: "other",
    stage: "listed",
    addedDay: 1,
    followUps: 0,
    awaitingAnswer: false,
  }));
  return { ...emptyState(), ...(rest as Partial<SavedState>), version: VERSION, contacts, lessons: {} };
}

/** Returns null for missing, broken or unknown-version data. v1 is migrated. */
export function parseState(raw: string | null): SavedState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.game) return null;
    if (parsed.version === 1) return migrateV1(parsed);
    if (parsed.version !== VERSION) return null;
    const state = { ...emptyState(), ...(parsed as Partial<SavedState>) };
    if (!Array.isArray(state.contacts)) state.contacts = [];
    if (!state.lessons || typeof state.lessons !== "object") state.lessons = {};
    return state;
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
