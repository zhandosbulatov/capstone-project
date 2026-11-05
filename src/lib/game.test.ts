import { describe, expect, it } from "vitest";
import {
  advanceDay,
  calendarDay,
  catchUp,
  completeDailyStep,
  createGame,
  formatEvent,
  levelFromXp,
  reachGoal,
  recordResult,
  titleFor,
  totalXpForLevel,
  unlockedTools,
  type GameState,
} from "./game";

/** Take the daily step on each of the next `days` days. */
function playDays(state: GameState, days: number): GameState {
  let s = state;
  for (let i = 0; i < days; i++) {
    s = completeDailyStep(s, `d${s.day}`).state;
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
});

describe("daily step", () => {
  it("gives +10 XP, Consistency +1 and a 1-day streak", () => {
    const { state, events } = completeDailyStep(createGame(), "2026-11-05");
    expect(events.map(formatEvent)).toEqual(["+10 XP", "Consistency +1", "Streak 1"]);
    expect(state.xp).toBe(10);
    expect(state.stats.consistency).toBe(2);
    expect(state.streak).toBe(1);
    expect(titleFor(state)).toBe("employee");
  });

  it("every 7-day streak gives a shield, holding at most 2", () => {
    const week = playDays(createGame(), 7);
    expect(week.streak).toBe(7);
    expect(week.shields).toBe(1);
    const threeWeeks = playDays(week, 14);
    expect(threeWeeks.streak).toBe(21);
    expect(threeWeeks.shields).toBe(2);
    expect(playDays(threeWeeks, 7).shields).toBe(2);
  });
});

describe("missed days", () => {
  it("use a shield first and keep the streak", () => {
    const week = playDays(createGame(), 7);
    const { state, events } = advanceDay(week);
    expect(events.map((e) => e.kind)).toEqual(["shieldUsed"]);
    expect(state.shields).toBe(0);
    expect(state.streak).toBe(7);
  });

  it("without a shield, reset the streak to 0", () => {
    const three = playDays(createGame(), 3);
    const { state, events } = advanceDay(three);
    expect(events).toEqual([{ kind: "streakReset" }]);
    expect(state.streak).toBe(0);
    expect(state.bestStreak).toBe(3);
  });

  it("with no streak, change nothing but the day", () => {
    const { state, events } = advanceDay(createGame());
    expect(events).toEqual([]);
    expect(state.day).toBe(2);
  });
});

describe("calendar", () => {
  it("counts the start day as day 1, ignoring the time of day", () => {
    const start = new Date(2026, 10, 4, 23, 30);
    expect(calendarDay(start, new Date(2026, 10, 4, 8))).toBe(1);
    expect(calendarDay(start, new Date(2026, 10, 5, 0, 5))).toBe(2);
    expect(calendarDay(start, new Date(2026, 11, 4))).toBe(31);
  });

  it("catching up after two days away uses the shield, then resets the streak", () => {
    const week = playDays(createGame(), 7); // day 8, streak 7, one shield
    const { state, events } = catchUp(week, 10);
    expect(state.day).toBe(10);
    expect(events.map((e) => e.kind)).toEqual(["shieldUsed", "streakReset"]);
    expect(state.streak).toBe(0);
  });

  it("does nothing when the game is already ahead of the calendar (demo mode)", () => {
    const ahead = { ...createGame(), day: 14 };
    expect(catchUp(ahead, 3)).toEqual({ state: ahead, events: [] });
  });
});

describe("real results", () => {
  it("a verified first reply gives 50 XP, Reach +3 and the Side Starter title", () => {
    const { state, events } = recordResult(createGame(), "firstReply", "verified");
    expect(state.xp).toBe(50);
    expect(state.stats.reach).toBe(4);
    expect(titleFor(state)).toBe("sideStarter");
    expect(unlockedTools(state)).toEqual(["callScript"]);
    expect(events.map(formatEvent)).toEqual([
      "+50 XP",
      "Reach +3",
      "Level 2",
      "New title: Side Starter",
      "Unlocked: Call script",
    ]);
  });

  it("a self-reported result gives 25 XP and +1", () => {
    const { state } = recordResult(createGame(), "firstReply", "self");
    expect(state.xp).toBe(25);
    expect(state.stats.reach).toBe(2);
  });

  it("Freelancer needs a call and a proposal, Consultant needs a payment", () => {
    let s = recordResult(createGame(), "firstReply", "self").state;
    s = recordResult(s, "callBooked", "self").state;
    expect(titleFor(s)).toBe("sideStarter");
    s = recordResult(s, "proposalSent", "self").state;
    expect(titleFor(s)).toBe("freelancer");
    expect(unlockedTools(s)).toEqual(["callScript", "proposalTemplate", "followUpScript"]);
    s = recordResult(s, "clientPaid", "self").state;
    expect(titleFor(s)).toBe("consultant");
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
