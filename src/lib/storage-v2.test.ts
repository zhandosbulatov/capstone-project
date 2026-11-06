import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGame } from "./game";
import { clearState, emptyState, loadState, parseState, saveState } from "./storage";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const V1 = {
  version: 1,
  answers: null,
  email: "you@example.com",
  purchase: null,
  planStartedAt: "2026-11-01T00:00:00.000Z",
  game: { ...createGame(), day: 4, streak: 3, completedDays: [1, 2, 3] },
  cancelled: false,
  offer: "I help cafés look professional.",
  warmList: ["Ana", "  Ben ", "", "Cara"],
};

describe("v1 → v2 migration", () => {
  it("turns each warm-list name into a listed contact and keeps everything else", () => {
    const state = parseState(JSON.stringify(V1));
    expect(state?.version).toBe(2);
    expect(state?.contacts.map((c) => c.name)).toEqual(["Ana", "Ben", "Cara"]);
    expect(state?.contacts.every((c) => c.relation === "other" && c.stage === "listed" && c.followUps === 0)).toBe(true);
    expect(new Set(state?.contacts.map((c) => c.id)).size).toBe(3);
    expect(state?.lessons).toEqual({});
    expect(state).not.toHaveProperty("warmList");
    expect(state?.offer).toBe(V1.offer);
    expect(state?.email).toBe(V1.email);
    expect(state?.game.streak).toBe(3);
  });

  it("migrates a v1 save with no warm list", () => {
    const noList: Partial<typeof V1> = { ...V1 };
    delete noList.warmList;
    expect(parseState(JSON.stringify(noList))?.contacts).toEqual([]);
  });
});

describe("parseState", () => {
  it("reads v2 as saved", () => {
    const state = { ...emptyState(), offer: "x" };
    expect(parseState(JSON.stringify(state))).toEqual(state);
  });

  it("returns null for missing, broken or unknown data", () => {
    expect(parseState(null)).toBeNull();
    expect(parseState("not json")).toBeNull();
    expect(parseState("null")).toBeNull();
    expect(parseState(JSON.stringify({ version: 3, game: createGame() }))).toBeNull();
    expect(parseState(JSON.stringify({ version: 2 }))).toBeNull();
  });

  it("repairs a v2 save with broken contacts or lessons", () => {
    const state = parseState(JSON.stringify({ ...emptyState(), contacts: "x", lessons: null }));
    expect(state?.contacts).toEqual([]);
    expect(state?.lessons).toEqual({});
  });
});

describe("reset", () => {
  beforeEach(() => vi.stubGlobal("window", { localStorage: memoryStorage() }));
  afterEach(() => vi.unstubAllGlobals());

  it("clears contacts, lessons and everything else", () => {
    const state = {
      ...emptyState(),
      offer: "x",
      contacts: parseState(JSON.stringify(V1))!.contacts,
      lessons: { "m0-safe": { readDay: 2 } },
    };
    expect(saveState(state)).toBe(true);
    expect(loadState()?.contacts).toHaveLength(3);
    clearState();
    expect(loadState()).toBeNull();
  });

  it("starts empty", () => {
    expect(emptyState().contacts).toEqual([]);
    expect(emptyState().lessons).toEqual({});
  });
});
