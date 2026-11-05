import { describe, expect, it } from "vitest";
import type { Contact, LessonsState, Stage } from "./model";
import {
  decisionsSummary,
  isDay1Done,
  isLessonUnlocked,
  nextStep,
  tidyContacts,
  type StepInput,
} from "./next-step";

let seq = 0;
function contact(stage: Stage, extra: Partial<Contact> = {}): Contact {
  seq += 1;
  return {
    id: `c${seq}`,
    name: `Person ${seq}`,
    relation: "friend",
    stage,
    addedDay: 1,
    followUps: 0,
    awaitingAnswer: false,
    ...(stage !== "listed" ? { lastActionDay: 2 } : {}),
    ...extra,
  };
}

function input(contacts: Contact[], lessons: LessonsState = {}, offer: string | null = "Offer"): StepInput {
  return { offer, contacts, lessons };
}

/** Every lesson finished, so rule 3 never fires. */
const ALL_DONE: LessonsState = {
  "m0-safe": { readDay: 1 },
  "m1-offer": { decidedDay: 1 },
  "m2-package": { decidedDay: 1 },
  "m3-outreach": { decidedDay: 1 },
  "m4-sales": { decidedDay: 1 },
  "m5-proposal": { decidedDay: 1 },
  "m6-deliver": { decidedDay: 1 },
  "m7-money": { readDay: 1 },
  "l2-beyond": { decidedDay: 1 },
};

describe("rule 1: day 1", () => {
  it("asks for day 1 until there's an offer and a person", () => {
    expect(nextStep(input([], {}, null), 1)).toEqual({ kind: "day1" });
    expect(nextStep(input([contact("listed")], {}, null), 5)).toEqual({ kind: "day1" });
    expect(nextStep(input([], {}, "Offer"), 5)).toEqual({ kind: "day1" });
  });

  it("doesn't depend on the game day", () => {
    expect(isDay1Done(input([contact("listed")]))).toBe(true);
    expect(nextStep(input([contact("listed")], ALL_DONE), 9).kind).toBe("message");
  });
});

describe("rule 2: answer", () => {
  it("beats lessons, proposals, follow-ups and messages", () => {
    const waiting = contact("replied", { awaitingAnswer: true });
    const contacts = [contact("call"), contact("messaged", { lastActionDay: 1 }), contact("listed"), waiting];
    expect(nextStep(input(contacts), 10)).toEqual({ kind: "answer", contactId: waiting.id });
  });

  it("ignores not-now contacts", () => {
    const c = contact("not-now", { awaitingAnswer: true });
    expect(nextStep(input([c, contact("listed")], ALL_DONE), 3).kind).toBe("message");
  });
});

describe("rule 3: lessons", () => {
  it("offers m0-safe right after day 1", () => {
    expect(nextStep(input([contact("listed")]), 2)).toEqual({ kind: "lesson", lessonId: "m0-safe" });
  });

  it("skips lessons when asked", () => {
    expect(nextStep(input([contact("listed")]), 2, { skipLessons: true }).kind).toBe("message");
  });

  it("offers at most one lesson step a day", () => {
    const contacts = [contact("messaged"), contact("messaged"), contact("listed")];
    const lessons: LessonsState = { "m0-safe": { readDay: 4 } };
    // m1-offer is unlocked (2 messaged) but a lesson was already read today.
    expect(nextStep(input(contacts, lessons), 4).kind).not.toBe("lesson");
    expect(nextStep(input(contacts, lessons), 5)).toEqual({ kind: "lesson", lessonId: "m1-offer" });
  });

  it("checks lessons in order, and a read-only lesson is finished by reading", () => {
    const contacts = [contact("replied"), contact("messaged")];
    // m0 read, m1 unlocked and not decided → m1 comes before m2.
    expect(nextStep(input(contacts, { "m0-safe": { readDay: 1 } }), 3)).toEqual({
      kind: "lesson",
      lessonId: "m1-offer",
    });
    // Reading a decision lesson isn't finishing it.
    expect(
      nextStep(input(contacts, { "m0-safe": { readDay: 1 }, "m1-offer": { readDay: 1 } }), 3),
    ).toEqual({ kind: "lesson", lessonId: "m1-offer" });
  });

  it("unlocks each lesson by its rule", () => {
    const base = { "m0-safe": { readDay: 1 } } as LessonsState;
    const unlocked = (contacts: Contact[], lessons: LessonsState = base) => (id: Parameters<typeof isLessonUnlocked>[0]) =>
      isLessonUnlocked(id, input(contacts, lessons));

    expect(unlocked([contact("listed")])("m0-safe")).toBe(true);
    expect(unlocked([], {})("m0-safe")).toBe(false);

    expect(unlocked([contact("messaged")])("m1-offer")).toBe(false);
    expect(unlocked([contact("messaged"), contact("not-now", { lastActionDay: 2 })])("m1-offer")).toBe(true);

    expect(unlocked([contact("replied")])("m2-package")).toBe(true);
    expect(unlocked([1, 2, 3, 4].map(() => contact("messaged")))("m2-package")).toBe(false);
    expect(unlocked([1, 2, 3, 4, 5].map(() => contact("messaged")))("m2-package")).toBe(true);

    const lowList = [contact("listed"), contact("messaged")];
    expect(unlocked(lowList)("m3-outreach")).toBe(false);
    expect(unlocked(lowList, { ...base, "m1-offer": { decidedDay: 2 } })("m3-outreach")).toBe(true);
    expect(
      unlocked([contact("listed"), contact("listed")], { "m1-offer": { decidedDay: 2 } })("m3-outreach"),
    ).toBe(false);

    expect(unlocked([contact("replied")])("m4-sales")).toBe(false);
    expect(unlocked([contact("call")])("m4-sales")).toBe(true);
    expect(unlocked([contact("proposal")])("m4-sales")).toBe(true);

    expect(unlocked([contact("call")])("m5-proposal")).toBe(false);
    expect(unlocked([contact("call")], { "m4-sales": { decidedDay: 3 } })("m5-proposal")).toBe(true);

    expect(unlocked([contact("proposal")])("m6-deliver")).toBe(false);
    expect(unlocked([contact("paid")])("m6-deliver")).toBe(true);

    expect(unlocked([contact("paid")])("m7-money")).toBe(false);
    expect(unlocked([contact("paid")], { "m6-deliver": { decidedDay: 3 } })("m7-money")).toBe(true);
    expect(unlocked([contact("paid")], { "m7-money": { readDay: 3 } })("l2-beyond")).toBe(true);
  });
});

describe("rules 4–7", () => {
  it("4: a call becomes a proposal step, before follow-ups and messages", () => {
    const call = contact("call");
    const contacts = [contact("messaged", { lastActionDay: 1 }), contact("listed"), call];
    expect(nextStep(input(contacts, ALL_DONE), 10)).toEqual({ kind: "propose", contactId: call.id });
  });

  it("5: follows up after 3 quiet days, at most twice, in messaged, replied and proposal", () => {
    const quiet = contact("messaged", { lastActionDay: 2 });
    expect(nextStep(input([quiet, contact("listed")], ALL_DONE), 4).kind).toBe("message");
    expect(nextStep(input([quiet, contact("listed")], ALL_DONE), 5)).toEqual({
      kind: "follow-up",
      contactId: quiet.id,
    });
    const twice = contact("messaged", { lastActionDay: 2, followUps: 2 });
    expect(nextStep(input([twice], ALL_DONE), 9).kind).toBe("add-people");
    for (const stage of ["replied", "proposal"] as const) {
      const c = contact(stage, { lastActionDay: 1 });
      expect(nextStep(input([c], ALL_DONE), 4)).toEqual({ kind: "follow-up", contactId: c.id });
    }
    expect(nextStep(input([contact("paid", { lastActionDay: 1 })], ALL_DONE), 9).kind).toBe("add-people");
  });

  it("6: messages the oldest listed contact first", () => {
    const newer = contact("listed", { addedDay: 3 });
    const older = contact("listed", { addedDay: 1 });
    expect(nextStep(input([newer, older], ALL_DONE), 4)).toEqual({ kind: "message", contactId: older.id });
  });

  it("7: asks for more people when nobody is left", () => {
    expect(nextStep(input([contact("messaged", { lastActionDay: 9 })], ALL_DONE), 10)).toEqual({
      kind: "add-people",
    });
  });
});

describe("tidyContacts", () => {
  it("moves a contact with 2 follow-ups and 3 quiet days to not-now", () => {
    const quiet = contact("messaged", { followUps: 2, lastActionDay: 5 });
    expect(tidyContacts([quiet], 7)).toEqual([quiet]);
    expect(tidyContacts([quiet], 8)[0].stage).toBe("not-now");
  });

  it("leaves other contacts alone and returns the same array if nothing changes", () => {
    const contacts = [
      contact("messaged", { followUps: 1, lastActionDay: 1 }),
      contact("replied", { followUps: 2, lastActionDay: 1, awaitingAnswer: true }),
      contact("paid", { followUps: 2, lastActionDay: 1 }),
      contact("listed"),
    ];
    expect(tidyContacts(contacts, 20)).toBe(contacts);
  });
});

describe("decisionsSummary", () => {
  it("summarizes saved decisions in lesson order", () => {
    const summary = decisionsSummary({
      "m2-package": { decision: { answer: "Three tiers" }, decidedDay: 4 },
      "m1-offer": { decision: { answer: "Logo refresh for cafés" }, decidedDay: 3 },
      "m4-sales": { decision: { answer: "  " } },
    });
    expect(summary.split("\n")).toHaveLength(2);
    expect(summary.indexOf("Logo refresh")).toBeLessThan(summary.indexOf("Three tiers"));
  });
});
