import { describe, expect, it } from "vitest";
import { demoContacts, oldestMessaged } from "./demo";
import { isLessonUnlocked } from "./next-step";
import { LESSON_ORDER } from "./curriculum";

describe("demo controls", () => {
  it("seeds 5 people at mixed stages", () => {
    const contacts = demoContacts(3);
    expect(contacts.map((c) => c.stage)).toEqual(["listed", "listed", "messaged", "replied", "call"]);
    expect(contacts.find((c) => c.stage === "messaged")?.lastActionDay).toBe(-1);
    expect(contacts.find((c) => c.stage === "replied")?.lastReply).toBe(
      "Sounds interesting — how much would that be?",
    );
    expect(contacts.every((c) => c.note && !/[[\]]/.test(c.note))).toBe(true);
  });

  it("picks the oldest messaged person for a simulated reply", () => {
    const contacts = demoContacts(5);
    const later = { ...contacts[2], id: "x", lastActionDay: 4 };
    expect(oldestMessaged([later, ...contacts])?.id).toBe(contacts[2].id);
    expect(oldestMessaged([])).toBeUndefined();
  });

  it("unlocks every lesson when the demo flag is set", () => {
    const state = { offer: null, contacts: [], lessons: {}, demoUnlockAll: true };
    expect(LESSON_ORDER.every((id) => isLessonUnlocked(id, state))).toBe(true);
    expect(isLessonUnlocked("m4-sales", { ...state, demoUnlockAll: false })).toBe(false);
  });
});
