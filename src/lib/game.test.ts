import { describe, expect, it } from "vitest";
import {
  advanceDay,
  completeQuest,
  createGame,
  formatEvent,
  levelFromXp,
  recordResult,
  reachGoal,
  titleFor,
  totalXpForLevel,
  unlockedTools,
  type GameState,
} from "./game";

/** Complete the quest on each of the next `days` days. */
function playDays(state: GameState, days: number): GameState {
  let s = state;
  for (let i = 0; i < days; i++) {
    s = completeQuest(s).state;
    s = advanceDay(s).state;
  }
  return s;
}

describe("level curve", () => {
  it("matches the total XP table for levels 2–10", () => {
    const totals = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(totalXpForLevel);
    expect(totals).toEqual([50, 125, 225, 350, 500, 675, 875, 1100, 1350]);
  });

  it("levels up exactly at the threshold", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(49)).toBe(1);
    expect(levelFromXp(50)).toBe(2);
    expect(levelFromXp(1349)).toBe(9);
    expect(levelFromXp(1350)).toBe(10);
  });

  it("puts an engaged first month at about level 8", () => {
    // 30 quests + 7 verified results + 4 bosses = 300 + 350 + 400 XP
    expect(levelFromXp(1050)).toBe(8);
  });
});

describe("day 1 quest", () => {
  it("gives +10 XP, Clarity +1, Reach +1 and a 1-day streak", () => {
    const { state, events } = completeQuest(createGame());
    expect(events.map(formatEvent)).toEqual([
      "+10 XP",
      "Clarity +1",
      "Reach +1",
      "Streak 1",
    ]);
    expect(state.xp).toBe(10);
    expect(state.stats.clarity).toBe(2);
    expect(state.stats.reach).toBe(2);
    expect(state.streak).toBe(1);
    expect(titleFor(state)).toBe("employee");
  });

  it("can't be completed twice", () => {
    const once = completeQuest(createGame()).state;
    const twice = completeQuest(once);
    expect(twice.events).toEqual([]);
    expect(twice.state.xp).toBe(10);
  });
});

describe("streak, Streak Shield and recovery", () => {
  it("every 7-day streak gives a shield and +3 Consistency, holding at most 2", () => {
    const week = playDays(createGame(), 7);
    expect(week.streak).toBe(7);
    expect(week.shields).toBe(1);
    expect(week.stats.consistency).toBeGreaterThanOrEqual(1 + 3);

    const threeWeeks = playDays(week, 14);
    expect(threeWeeks.streak).toBe(21);
    expect(threeWeeks.shields).toBe(2);
  });

  it("a missed day uses a shield first and keeps the streak", () => {
    const week = playDays(createGame(), 7);
    const { state, events } = advanceDay(week);
    expect(events.map((e) => e.kind)).toEqual(["shieldUsed"]);
    expect(state.shields).toBe(0);
    expect(state.streak).toBe(7);
    expect(state.recovery).toBeNull();
  });

  it("without a shield, a missed day becomes a recovery quest the next day", () => {
    const three = playDays(createGame(), 3);
    const missed = advanceDay(three);
    expect(missed.events).toEqual([{ kind: "recoveryOffered", day: 5 }]);
    expect(missed.state.recovery).toEqual({ missedDay: 4, day: 5 });
    expect(missed.state.streak).toBe(3);
  });

  it("a done recovery quest keeps the streak and gives 15 XP and +1 Consistency", () => {
    const three = playDays(createGame(), 3);
    const recoveryDay = advanceDay(three).state;
    const { state, events } = completeQuest(recoveryDay);
    expect(events[0]).toEqual({ kind: "xp", amount: 15 });
    expect(events).toContainEqual({ kind: "stat", stat: "consistency", amount: 1 });
    expect(state.xp).toBe(three.xp + 15);
    expect(state.streak).toBe(4);
    expect(state.recovery).toBeNull();
  });

  it("a missed recovery quest resets the streak to 0", () => {
    const three = playDays(createGame(), 3);
    const recoveryDay = advanceDay(three).state;
    const { state, events } = advanceDay(recoveryDay);
    expect(events).toEqual([{ kind: "streakReset" }]);
    expect(state.streak).toBe(0);
    expect(state.recovery).toBeNull();
  });

  it("missing a day with no streak offers nothing", () => {
    const { state, events } = advanceDay(createGame());
    expect(events).toEqual([]);
    expect(state.day).toBe(2);
    expect(state.recovery).toBeNull();
  });
});

describe("real results and bosses", () => {
  it("a verified first reply beats the week 1 boss", () => {
    const { state, events } = recordResult(createGame(), "firstReply", "verified");
    // 50 for the result + 100 for the boss
    expect(state.xp).toBe(150);
    // 1 + 3 (verified result) + 5 (boss)
    expect(state.stats.reach).toBe(9);
    expect(state.bossesBeaten).toEqual(["w1"]);
    expect(unlockedTools(state)).toEqual(["callScript"]);
    expect(titleFor(state)).toBe("sideStarter");
    expect(events.map(formatEvent)).toEqual([
      "+50 XP",
      "Reach +3",
      "Boss beaten: First reply",
      "+100 XP",
      "Reach +5",
      "Unlocked: Call script",
      "Level 2",
      "Level 3",
      "New title: Side Starter",
    ]);
  });

  it("a self-reported result gives 25 XP and +1, and the boss bonus still applies", () => {
    const { state } = recordResult(createGame(), "firstReply", "self");
    expect(state.xp).toBe(125);
    expect(state.stats.reach).toBe(1 + 1 + 5);
    expect(state.bossesBeaten).toEqual(["w1"]);
  });

  it("a second reply earns XP but doesn't beat the boss again", () => {
    const first = recordResult(createGame(), "firstReply", "verified").state;
    const { state, events } = recordResult(first, "firstReply", "verified");
    expect(state.xp).toBe(200);
    expect(state.bossesBeaten).toEqual(["w1"]);
    expect(events.some((e) => e.kind === "boss")).toBe(false);
  });

  it("titles follow the bosses: Freelancer needs weeks 2 and 3, Consultant needs week 4", () => {
    let s = recordResult(createGame(), "firstReply", "verified").state;
    s = recordResult(s, "callBooked", "verified").state;
    expect(titleFor(s)).toBe("sideStarter");
    s = recordResult(s, "proposalSent", "verified").state;
    expect(titleFor(s)).toBe("freelancer");
    expect(s.stats.pricingPower).toBe(1 + 3 + 5);
    s = recordResult(s, "clientPaid", "verified").state;
    expect(titleFor(s)).toBe("consultant");
    expect(s.stats.reputation).toBe(1 + 5);
    expect(unlockedTools(s)).toEqual([
      "callScript",
      "proposalTemplate",
      "followUpScript",
      "reviewForm",
    ]);
  });

  it("reaching the income goal makes the user a Studio Owner", () => {
    const { state, events } = reachGoal(createGame());
    expect(titleFor(state)).toBe("studioOwner");
    expect(events).toEqual([{ kind: "title", title: "studioOwner" }]);
  });
});
