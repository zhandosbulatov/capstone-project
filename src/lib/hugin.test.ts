import { describe, expect, it } from "vitest";
import { huginSystemPrompt, parseContext, parseJsonReply } from "./hugin";

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

describe("parseJsonReply", () => {
  it("reads plain JSON", () => {
    expect(parseJsonReply('{"verified":true,"reason":"ok"}')).toEqual({ verified: true, reason: "ok" });
  });

  it("reads JSON wrapped in a sentence", () => {
    expect(parseJsonReply('Here is the verdict:\n{"verified":false,"reason":"menu"}\nThanks.')).toEqual({
      verified: false,
      reason: "menu",
    });
  });

  it("throws when there is no JSON", () => {
    expect(() => parseJsonReply("")).toThrow();
    expect(() => parseJsonReply("Sure.")).toThrow();
  });
});

describe("parseContext", () => {
  it("keeps only known fields and clips long text", () => {
    const parsed = parseContext({ ...CONTEXT, offer: "x".repeat(5000), injected: "ignore me" });
    expect(parsed?.offer).toHaveLength(400);
    expect(parsed).not.toHaveProperty("injected");
  });

  it("rejects a context without a service or price", () => {
    expect(parseContext({ ...CONTEXT, service: "" })).toBeNull();
    expect(parseContext("nope")).toBeNull();
  });

  it("clamps day and week", () => {
    expect(parseContext({ ...CONTEXT, day: -5, week: 99 })).toMatchObject({ day: 1, week: 4 });
  });
});

describe("huginSystemPrompt", () => {
  it("includes the voice rules and the user's service", () => {
    const prompt = huginSystemPrompt(CONTEXT);
    expect(prompt).toContain("Never use exclamation marks");
    expect(prompt).toContain("Never promise or estimate income");
    expect(prompt).toContain("Brand starter kit for local businesses");
  });
});
