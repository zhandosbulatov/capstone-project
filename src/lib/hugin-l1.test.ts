import { describe, expect, it } from "vitest";
import {
  cleanReview,
  CONTACT_TASKS,
  DRAFT_KINDS,
  DRAFT_TASKS,
  draftInstruction,
  hasBrackets,
  huginSystemPrompt,
  parseDraftRequest,
  reviewInstruction,
  stripBracketSentences,
} from "./hugin";

const CONTEXT = {
  skill: "Design",
  service: "Brand starter kit for local businesses",
  price: "$450 per project",
  who: "local businesses",
  deliverable: "logo refresh",
  firstBuyers: "cafés",
  offer: "I help local businesses look professional.",
  day: 2,
  week: 1,
  questTitle: "Send your first 3 messages",
  title: "Employee",
};

const SARAH = {
  name: "Sarah",
  relation: "ex-colleague" as const,
  note: "we redid the Q3 sales deck together",
};

describe("huginSystemPrompt with a contact", () => {
  it("has no bracket instruction", () => {
    const prompt = huginSystemPrompt(CONTEXT, SARAH);
    expect(prompt).not.toContain("[name]");
    expect(prompt).not.toMatch(/use \[/i);
    expect(prompt).toContain("Never output square brackets");
  });

  it("includes the contact's name, relation and note", () => {
    const prompt = huginSystemPrompt(CONTEXT, SARAH);
    expect(prompt).toContain("Sarah");
    expect(prompt).toContain("Ex-colleague");
    expect(prompt).toContain("we redid the Q3 sales deck together");
  });

  it("says to mention no history when there is no note", () => {
    const prompt = huginSystemPrompt(CONTEXT, { name: "Mike", relation: "local-business" });
    expect(prompt).toContain("Local business");
    expect(prompt).toContain("Do not mention any shared history");
  });

  it("lists decisions only when they exist", () => {
    expect(huginSystemPrompt(CONTEXT)).not.toContain("Decisions from their lessons");
    const withDecisions = huginSystemPrompt({ ...CONTEXT, decisions: "Package: Starter, $450" });
    expect(withDecisions).toContain("Decisions from their lessons");
    expect(withDecisions).toContain("Package: Starter, $450");
  });
});

describe("draft tasks", () => {
  it("exist for every kind, with and without a contact", () => {
    for (const kind of DRAFT_KINDS) {
      expect(DRAFT_TASKS[kind].length).toBeGreaterThan(20);
      expect(CONTACT_TASKS[kind].length).toBeGreaterThan(20);
      expect(DRAFT_TASKS[kind]).not.toContain("[");
      expect(CONTACT_TASKS[kind]).not.toContain("[");
    }
  });

  it("asks for one message with a contact and three without", () => {
    expect(draftInstruction("outreach", 1, true)).toContain("Write one message");
    expect(draftInstruction("outreach", 3, false)).toContain("Write 3");
  });

  it("makes the reply task cover price, interest and not now", () => {
    const task = CONTACT_TASKS.reply;
    expect(task).toContain("15-minute call");
    expect(task).toContain("two concrete times");
    expect(task).toContain("check back in a few weeks");
  });
});

describe("bracket stripper", () => {
  it("removes the bracketed sentence and keeps the rest", () => {
    const out = stripBracketSentences("Hi Sarah. We worked on [the project]. Free for a quick chat?");
    expect(out).toBe("Hi Sarah. Free for a quick chat?");
    expect(hasBrackets(out)).toBe(false);
  });

  it("drops a bracketed greeting line and keeps the body", () => {
    expect(stripBracketSentences("Hi [name],\n\nI do brand work. Want to hear more?")).toBe(
      "I do brand work. Want to hear more?",
    );
  });

  it("returns empty when everything is bracketed", () => {
    expect(stripBracketSentences("Hi [name]. Loved [that thing].")).toBe("");
  });
});

describe("parseDraftRequest", () => {
  it("rejects an unknown kind", () => {
    expect(parseDraftRequest({ kind: "poem", context: CONTEXT }).ok).toBe(false);
  });

  it("rejects a contact without a name", () => {
    const res = parseDraftRequest({
      kind: "outreach",
      context: CONTEXT,
      contact: { relation: "friend" },
    });
    expect(res.ok).toBe(false);
  });

  it("rejects a review without a lesson", () => {
    expect(parseDraftRequest({ kind: "review", context: CONTEXT }).ok).toBe(false);
    expect(
      parseDraftRequest({ kind: "review", context: CONTEXT, lesson: { id: "m1-offer", fields: {} } }).ok,
    ).toBe(false);
  });

  it("defaults to one draft with a contact and three without", () => {
    const one = parseDraftRequest({ kind: "outreach", context: CONTEXT, contact: SARAH });
    const three = parseDraftRequest({ kind: "outreach", context: CONTEXT });
    expect(one.ok && one.count).toBe(1);
    expect(three.ok && three.count).toBe(3);
  });

  it("accepts a review with a lesson", () => {
    const res = parseDraftRequest({
      kind: "review",
      context: CONTEXT,
      lesson: { id: "m1-offer", fields: { answer: "I do design." } },
    });
    expect(res.ok && res.lesson?.fields.answer).toBe("I do design.");
  });
});

describe("review", () => {
  it("builds an instruction from the lesson", () => {
    const text = reviewInstruction({ id: "m1-offer", fields: { answer: "I do design." } });
    expect(text).toContain("Sharpen your offer");
    expect(text).toContain("I do design.");
  });

  it("keeps at most 3 feedback lines and only known fields", () => {
    const review = cleanReview(
      {
        feedback: ["One.", "Two.", "Three.", "Four."],
        improved: { answer: "Brand kits for cafés, $450.", other: "ignored" },
      },
      "m1-offer",
    );
    expect(review?.feedback).toHaveLength(3);
    expect(review?.improved).toEqual({ answer: "Brand kits for cafés, $450." });
  });

  it("returns null when nothing usable is left", () => {
    expect(cleanReview({ feedback: ["See [this]."], improved: { answer: "[x]" } }, "m1-offer")).toBeNull();
  });
});
