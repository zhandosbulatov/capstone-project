import { describe, expect, it } from "vitest";
import type { Contact, Stage } from "@/lib/model";
import {
  draftKindFor,
  firstCleanDraft,
  hasBracket,
  pipelineCounts,
  stepHeading,
} from "./today-logic";

function contact(stage: Stage, i = 0): Contact {
  return {
    id: `c${i}`,
    name: `Person ${i}`,
    relation: "friend",
    stage,
    addedDay: 1,
    followUps: 0,
    awaitingAnswer: false,
  };
}

describe("pipelineCounts", () => {
  it("counts the funnel cumulatively", () => {
    const stages: Stage[] = ["listed", "messaged", "not-now", "replied", "call", "proposal", "paid"];
    expect(pipelineCounts(stages.map((s, i) => contact(s, i)))).toEqual({
      listed: 7,
      messaged: 6,
      replied: 4,
      paid: 1,
    });
  });
});

describe("drafts", () => {
  it("detects brackets", () => {
    expect(hasBracket("Hi [name]")).toBe(true);
    expect(hasBracket("Hi Sarah")).toBe(false);
  });
  it("picks the first clean draft", () => {
    expect(firstCleanDraft(["Hi [x]", " Hi Sarah ", "Hello"])).toBe("Hi Sarah");
    expect(firstCleanDraft(["Hi [x]"])).toBeNull();
  });
  it("maps steps to draft kinds", () => {
    expect(draftKindFor({ kind: "message", contactId: "a" })).toBe("outreach");
    expect(draftKindFor({ kind: "answer", contactId: "a" })).toBe("reply");
    expect(draftKindFor({ kind: "add-people" })).toBeNull();
  });
});

describe("stepHeading", () => {
  it("uses the first name", () => {
    expect(stepHeading({ kind: "message", contactId: "a" }, "Sarah Cole", "$450")).toBe("Message Sarah");
    expect(stepHeading({ kind: "propose", contactId: "a" }, "Sarah Cole", "$450")).toBe(
      "Send Sarah your proposal at $450",
    );
  });
});
