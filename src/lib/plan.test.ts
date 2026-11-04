import { describe, expect, it } from "vitest";
import { blockerFix, buildPlan, offerDraft, planHeadline, teaser } from "./plan";
import { questForDay, QUEST_DAYS } from "./quests";
import { DEFAULT_ANSWERS, type QuizAnswers } from "./quiz-data";

const NOV_4 = new Date(2026, 10, 4);

describe("personal plan", () => {
  it("builds the default plan", () => {
    const plan = buildPlan(DEFAULT_ANSWERS, NOV_4);
    expect(plan.service).toBe("Brand starter kit for local businesses");
    expect(plan.priceLabel).toBe("$450 per project");
    expect(planHeadline(plan)).toBe("First paying client by December 4");
    expect(plan.weeks[0].text).toBe(
      "Write your offer in one sentence. List 20 people who have seen your work.",
    );
    expect(plan.weeks[2].text).toBe("Run the call script. Send 2 proposals at $450.");
  });

  it("sends past freelancers back to old clients in week 1", () => {
    const answers: QuizAnswers = { ...DEFAULT_ANSWERS, paid: "some" };
    expect(buildPlan(answers, NOV_4).weeks[0].text).toBe(
      "Write your offer in one sentence. Re-contact 3 past clients and tell them about your new package.",
    );
  });

  it("fills the offer draft, teaser and blocker fix", () => {
    expect(offerDraft(DEFAULT_ANSWERS)).toBe(
      "I help local businesses get a brand that looks professional: logo refresh, colour palette, 5 social templates, for $450 per project.",
    );
    expect(teaser(DEFAULT_ANSWERS).title).toBe("Design sells well as a service");
    expect(blockerFix(DEFAULT_ANSWERS)).toBe(
      "Day 1 turns your skill into one offer you can say in a sentence.",
    );
  });
});

describe("quests", () => {
  const ctx = { minutes: 20, price: 450, firstStep: "List 20 people who have seen your work" };

  it("has a quest for each of the 30 days, with bosses on days 7, 14, 21 and 28", () => {
    expect(QUEST_DAYS).toBe(30);
    const bossDays = Array.from({ length: 30 }, (_, i) => questForDay(i + 1, ctx))
      .filter((q) => q.boss)
      .map((q) => [q.day, q.boss]);
    expect(bossDays).toEqual([
      [7, "w1"],
      [14, "w2"],
      [21, "w3"],
      [28, "w4"],
    ]);
  });

  it("day 2 is the first 3 messages, and its recovery asks for 5", () => {
    expect(questForDay(2, ctx).title).toBe("Send your first 3 messages");
    const recovery = questForDay(2, ctx, { recovery: true });
    expect(recovery.title).toBe("Recovery: Send your first 5 messages");
    expect(recovery.hugin).toBe(
      "Yesterday didn't happen. Today can make up for it: 5 messages, by tomorrow morning.",
    );
  });

  it("fills price and minutes, and keeps going after day 30", () => {
    expect(questForDay(16, ctx).title).toBe("Write your proposal at $450");
    expect(questForDay(2, ctx).hugin).toContain("20 minutes");
    expect(questForDay(31, ctx).title).toBeTruthy();
  });

  it("never gives Hugin an exclamation mark", () => {
    for (let day = 1; day <= 37; day++) {
      expect(questForDay(day, ctx).hugin).not.toContain("!");
      expect(questForDay(day, ctx, { recovery: true }).hugin).not.toContain("!");
    }
  });
});
