import { describe, expect, it } from "vitest";
import { blockerFix, buildPlan, offerDraft, planHeadline, teaser } from "./plan";
import { questForDay, QUEST_DAYS } from "./quests";
import { DEFAULT_ANSWERS, type QuizAnswers } from "./quiz-data";
import { nextFivePrices, toolDoc } from "./tools";

describe("tools", () => {
  it("steps the price up for the next five clients", () => {
    expect(nextFivePrices(450)).toEqual([450, 450, 500, 500, 600]);
  });

  it("fills the proposal template with the user's service and price", () => {
    const doc = toolDoc("proposalTemplate", DEFAULT_ANSWERS, null);
    expect(doc.sections.find((s) => s.heading === "Price")?.body).toBe(
      "$450 per project. 50% to start, 50% on delivery.",
    );
  });

  it("gives the outreach pack 12 messages", () => {
    expect(toolDoc("outreachPack", DEFAULT_ANSWERS, null).sections).toHaveLength(12);
  });
});

const NOV_4 = new Date(2026, 10, 4);

describe("personal plan", () => {
  it("builds the default plan", () => {
    const plan = buildPlan(DEFAULT_ANSWERS, NOV_4);
    expect(plan.service).toBe("Brand starter kit for local businesses");
    expect(plan.priceLabel).toBe("$450 per project");
    expect(planHeadline(plan)).toBe("First paying client by January 27");
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

  it("only day 1 uses a quest template; later days get a generic step", () => {
    expect(QUEST_DAYS).toBe(1);
    const day1 = questForDay(1, ctx);
    expect(day1.draft).toBe("offer");
    expect(day1.boss).toBeUndefined();
    expect(questForDay(2, ctx).title).toBe(ctx.firstStep);
    expect(questForDay(31, ctx).title).toBeTruthy();
  });

  it("has no recovery quests and no bosses", () => {
    for (let day = 1; day <= 30; day++) {
      const quest = questForDay(day, ctx, { recovery: true });
      expect(quest.recovery).toBe(false);
      expect(quest.boss).toBeUndefined();
    }
  });

  it("fills minutes into Hugin's line", () => {
    expect(questForDay(2, ctx).hugin).toContain("20 minutes");
  });

  it("never gives Hugin an exclamation mark", () => {
    for (let day = 1; day <= 37; day++) {
      expect(questForDay(day, ctx).hugin).not.toContain("!");
      expect(questForDay(day, ctx, { recovery: true }).hugin).not.toContain("!");
    }
  });
});
