import { describe, expect, it } from "vitest";
import {
  advanceDay,
  completeDailyStep,
  createGame,
  isToastEvent,
  normalizeGame,
  recordStage,
  titleFor,
  unlockedTools,
  visibleToastText,
  type GameEvent,
  type GameState,
} from "./game";
import { questForDay } from "./quests";

const ctx = { minutes: 20, price: 450, firstStep: "List 20 people" };

describe("one streak day per calendar day", () => {
  it("counts the first step, then pays 5 XP for each later step the same day", () => {
    const first = completeDailyStep(createGame(), "2026-11-05");
    expect(first.state.streak).toBe(1);
    expect(first.state.xp).toBe(10);

    const second = completeDailyStep(first.state, "2026-11-05");
    expect(second.state.streak).toBe(1);
    expect(second.state.xp).toBe(15);
    expect(second.events).toEqual([{ kind: "xp", amount: 5 }]);
    expect(second.state.stats.consistency).toBe(first.state.stats.consistency);

    const third = completeDailyStep(second.state, "2026-11-05");
    expect(third.state.streak).toBe(1);
    expect(third.state.xp).toBe(20);
  });

  it("a new calendar day counts again", () => {
    let s = completeDailyStep(createGame(), "2026-11-05").state;
    s = advanceDay(s).state;
    s = completeDailyStep(s, "2026-11-06").state;
    expect(s.streak).toBe(2);
    expect(s.completedDays).toEqual([1, 2]);
  });

  it("works without a date by using the game day", () => {
    const once = completeDailyStep(createGame()).state;
    expect(completeDailyStep(once).state.streak).toBe(1);
  });
});

describe("shields and reset", () => {
  function streakOf(days: number): GameState {
    let s = createGame();
    for (let i = 0; i < days; i++) {
      s = completeDailyStep(s, `d${i}`).state;
      s = advanceDay(s).state;
    }
    return s;
  }

  it("earns a shield on day 7 and uses it on the first miss", () => {
    const week = streakOf(7);
    expect(week.shields).toBe(1);
    const miss = advanceDay(week);
    expect(miss.state.streak).toBe(7);
    expect(miss.state.shields).toBe(0);
    expect(miss.events).toEqual([{ kind: "shieldUsed", shields: 0 }]);
  });

  it("resets to 0 on the next miss and never offers a recovery", () => {
    const week = streakOf(7);
    const first = advanceDay(week).state;
    const second = advanceDay(first);
    expect(second.state.streak).toBe(0);
    expect(second.events).toEqual([{ kind: "streakReset" }]);
    expect(second.state.xp).toBe(week.xp);
  });
});

describe("titles from real events", () => {
  it("each stage earns its title and tools", () => {
    let s = createGame();
    expect(titleFor(s)).toBe("employee");

    s = recordStage(s, "messaged", "replied").state;
    expect(titleFor(s)).toBe("sideStarter");
    expect(s.results).toEqual([{ type: "firstReply", proof: "self", day: 1 }]);
    expect(unlockedTools(s)).toEqual(["callScript"]);

    s = recordStage(s, "replied", "call").state;
    expect(titleFor(s)).toBe("sideStarter");

    s = recordStage(s, "call", "proposal").state;
    expect(titleFor(s)).toBe("freelancer");
    expect(unlockedTools(s)).toEqual(["callScript", "proposalTemplate", "followUpScript"]);

    const paid = recordStage(s, "proposal", "paid");
    expect(titleFor(paid.state)).toBe("consultant");
    expect(unlockedTools(paid.state)).toContain("reviewForm");
    expect(paid.events).toContainEqual({ kind: "title", title: "consultant" });
  });

  it("a proposal without a call is not yet a Freelancer", () => {
    const s = recordStage(createGame(), "call", "proposal").state;
    expect(titleFor(s)).toBe("employee");
  });

  it("moving back or to not-now records nothing", () => {
    const g = createGame();
    expect(recordStage(g, "replied", "messaged")).toEqual({ state: g, events: [] });
    expect(recordStage(g, "messaged", "not-now")).toEqual({ state: g, events: [] });
  });
});

describe("repeat events", () => {
  it("add XP only, with no new stat or title event", () => {
    const first = recordStage(createGame(), "messaged", "replied").state;
    const again = recordStage(first, "messaged", "replied");
    expect(again.state.xp).toBe(first.xp + 25);
    expect(again.state.stats).toEqual(first.stats);
    expect(again.events.filter((e) => e.kind !== "level")).toEqual([{ kind: "xp", amount: 25 }]);
    expect(again.state.bossesBeaten).toEqual(first.bossesBeaten);
  });
});

describe("old saved games", () => {
  it("load with a leftover recovery field, which is ignored and dropped", () => {
    const old = {
      ...createGame(),
      day: 5,
      streak: 3,
      recovery: { missedDay: 4, day: 5 },
    } as unknown as GameState;

    const loaded = normalizeGame(old);
    expect("recovery" in loaded).toBe(false);
    expect(loaded.streak).toBe(3);

    // Actions on the raw old state ignore it too: a miss resets, there is no recovery quest.
    const next = advanceDay(old);
    expect("recovery" in next.state).toBe(false);
    expect(next.events).toEqual([{ kind: "streakReset" }]);
    expect(completeDailyStep(old, "2026-11-05").state.streak).toBe(4);
  });

  it("fill fields a very old save lacks", () => {
    const loaded = normalizeGame({ day: 3, xp: 40 });
    expect(loaded.results).toEqual([]);
    expect(loaded.shields).toBe(0);
  });

  it("keep a title earned by a beaten boss in a save with no results", () => {
    const old = { ...createGame(), bossesBeaten: ["w1" as const] };
    expect(titleFor(old)).toBe("sideStarter");
  });
});

describe("quiet notifications", () => {
  it("shows only titles, shields and streak milestones", () => {
    const events: GameEvent[] = [
      { kind: "xp", amount: 10 },
      { kind: "stat", stat: "reach", amount: 1 },
      { kind: "level", level: 2 },
      { kind: "streak", streak: 3 },
      { kind: "streak", streak: 7 },
      { kind: "shieldEarned", shields: 1 },
      { kind: "shieldUsed", shields: 0 },
      { kind: "streakReset" },
      { kind: "title", title: "sideStarter" },
    ];
    expect(events.filter(isToastEvent).map((e) => e.kind)).toEqual([
      "streak",
      "shieldEarned",
      "title",
    ]);
  });

  it("strips quiet parts from a combined toast and drops empty ones", () => {
    expect(visibleToastText("+10 XP · Consistency +1")).toBeNull();
    expect(visibleToastText("Level 3 · New title: Side Starter")).toBe("New title: Side Starter");
    expect(visibleToastText("Streak Shield earned")).toBe("Streak Shield earned");
    expect(visibleToastText("7-day streak")).toBe("7-day streak");
    expect(visibleToastText("Streak Shield used")).toBeNull();
  });
});

describe("quests", () => {
  it("day 1 is still the offer quest", () => {
    const quest = questForDay(1, ctx);
    expect(quest.title).toBe("Write your offer and your first 5 names");
    expect(quest.hugin).not.toContain("!");
    expect(quest.recovery).toBe(false);
  });
});
