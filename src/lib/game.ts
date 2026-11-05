// Progression rules: XP, levels, six stats, career titles, weekly bosses, streak, Streak Shield
// and recovery quests. Pure functions: every action returns a new state plus the events to show.
// XP and stat numbers are starting values, to be tuned after the first users.

import { STAGE_ORDER, type Stage } from "./model";
import { questStats } from "./quests";

export type StatKey =
  | "clarity"
  | "reach"
  | "persuasion"
  | "pricingPower"
  | "consistency"
  | "reputation";

export const STATS: Record<StatKey, { label: string; meaning: string }> = {
  clarity: { label: "Clarity", meaning: "How clear the offer is" },
  reach: { label: "Reach", meaning: "Size and warmth of the network being worked" },
  persuasion: { label: "Persuasion", meaning: "Selling without sounding salesy" },
  pricingPower: { label: "Pricing Power", meaning: "Confidence in the price" },
  consistency: { label: "Consistency", meaning: "Showing up" },
  reputation: { label: "Reputation", meaning: "Trust and social proof" },
};

export const STAT_KEYS = Object.keys(STATS) as StatKey[];

export type TitleKey =
  | "employee"
  | "sideStarter"
  | "freelancer"
  | "consultant"
  | "studioOwner";

export const TITLES: Record<TitleKey, { label: string; earnedBy: string }> = {
  employee: { label: "Employee", earnedBy: "Start" },
  sideStarter: { label: "Side Starter", earnedBy: "Beat the week 1 boss: first reply" },
  freelancer: {
    label: "Freelancer",
    earnedBy: "Beat the week 2 and week 3 bosses: first call and first proposal",
  },
  consultant: { label: "Consultant", earnedBy: "Beat the week 4 boss: first paying client" },
  studioOwner: {
    label: "Studio Owner",
    earnedBy: "Monthly side income reaches the goal you chose",
  },
};

export const TITLE_ORDER: TitleKey[] = [
  "employee",
  "sideStarter",
  "freelancer",
  "consultant",
  "studioOwner",
];

/** Real results that earn XP, and the stat each one grows. */
export type ResultType =
  | "firstReply"
  | "callBooked"
  | "callHeld"
  | "proposalSent"
  | "clientPaid"
  | "reviewReceived"
  | "referralReceived"
  | "priceRaised";

export const RESULTS: Record<ResultType, { label: string; stat: StatKey }> = {
  firstReply: { label: "Reply received", stat: "reach" },
  callBooked: { label: "Call booked", stat: "persuasion" },
  callHeld: { label: "Call held", stat: "persuasion" },
  proposalSent: { label: "Proposal sent", stat: "pricingPower" },
  clientPaid: { label: "Client paid", stat: "pricingPower" },
  reviewReceived: { label: "Review received", stat: "reputation" },
  referralReceived: { label: "Referral received", stat: "reputation" },
  priceRaised: { label: "Price raised", stat: "pricingPower" },
};

export const RESULT_TYPES = Object.keys(RESULTS) as ResultType[];

export type ToolKey = "callScript" | "proposalTemplate" | "followUpScript" | "reviewForm";

export const TOOLS: Record<ToolKey, { label: string; forWeek: number }> = {
  callScript: { label: "Call script", forWeek: 2 },
  proposalTemplate: { label: "Proposal template", forWeek: 3 },
  followUpScript: { label: "Follow-up and closing script", forWeek: 4 },
  reviewForm: { label: "Review request form", forWeek: 5 },
};

export type BossKey = "w1" | "w2" | "w3" | "w4";

export type Boss = {
  week: number;
  name: string;
  /** The result that beats this boss. */
  result: ResultType;
  proof: string;
  stat: StatKey;
  unlocks: ToolKey;
};

export const BOSSES: Record<BossKey, Boss> = {
  w1: {
    week: 1,
    name: "First reply",
    result: "firstReply",
    proof: "The reply in a chat, email or DM",
    stat: "reach",
    unlocks: "callScript",
  },
  w2: {
    week: 2,
    name: "First call",
    result: "callBooked",
    proof: "Calendar invite or booking confirmation",
    stat: "persuasion",
    unlocks: "proposalTemplate",
  },
  w3: {
    week: 3,
    name: "First proposal",
    result: "proposalSent",
    proof: "The sent proposal or message with the price",
    stat: "pricingPower",
    unlocks: "followUpScript",
  },
  w4: {
    week: 4,
    name: "First client",
    result: "clientPaid",
    proof: "Payment notification or invoice marked paid",
    stat: "reputation",
    unlocks: "reviewForm",
  },
};

export const BOSS_KEYS = Object.keys(BOSSES) as BossKey[];

export const XP = {
  dailyQuest: 10,
  recoveryQuest: 15,
  resultVerified: 50,
  resultSelfReported: 25,
  boss: 100,
} as const;

export const STAT_POINTS = {
  dailyQuest: 1,
  recoveryBonus: 1,
  streakWeek: 3,
  resultVerified: 3,
  resultSelfReported: 1,
  boss: 5,
} as const;

export const STREAK_SHIELD_EVERY = 7;
export const MAX_SHIELDS = 2;
export const DAYS_IN_MAP = 30;

export type Proof = "verified" | "self";

export type ResultRecord = { type: ResultType; proof: Proof; day: number };

export type GameState = {
  day: number;
  xp: number;
  stats: Record<StatKey, number>;
  streak: number;
  bestStreak: number;
  shields: number;
  completedDays: number[];
  /** A recovery quest replaces the daily quest on `day`; done keeps the streak, missed resets it. */
  recovery: { missedDay: number; day: number } | null;
  results: ResultRecord[];
  bossesBeaten: BossKey[];
  goalReached: boolean;
};

export type GameEvent =
  | { kind: "xp"; amount: number }
  | { kind: "stat"; stat: StatKey; amount: number }
  | { kind: "level"; level: number }
  | { kind: "title"; title: TitleKey }
  | { kind: "streak"; streak: number }
  | { kind: "shieldEarned"; shields: number }
  | { kind: "shieldUsed"; shields: number }
  | { kind: "recoveryOffered"; day: number }
  | { kind: "streakReset" }
  | { kind: "boss"; boss: BossKey }
  | { kind: "unlock"; tool: ToolKey };

export type Step = { state: GameState; events: GameEvent[] };

export function createGame(): GameState {
  return {
    day: 1,
    xp: 0,
    stats: {
      clarity: 1,
      reach: 1,
      persuasion: 1,
      pricingPower: 1,
      consistency: 1,
      reputation: 1,
    },
    streak: 0,
    bestStreak: 0,
    shields: 0,
    completedDays: [],
    recovery: null,
    results: [],
    bossesBeaten: [],
    goalReached: false,
  };
}

// --- Levels -------------------------------------------------------------------------------

/** XP needed to go from level n to n + 1. */
export function xpToNextLevel(level: number): number {
  return 50 + 25 * (level - 1);
}

/** Total XP needed to reach a level (level 1 = 0). */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let n = 1; n < level; n++) total += xpToNextLevel(n);
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= totalXpForLevel(level + 1)) level++;
  return level;
}

/** For the XP bar: how far into the current level the user is. */
export function levelProgress(xp: number): {
  level: number;
  into: number;
  needed: number;
} {
  const level = levelFromXp(xp);
  return {
    level,
    into: xp - totalXpForLevel(level),
    needed: xpToNextLevel(level),
  };
}

// --- Titles, weeks, tools -----------------------------------------------------------------

export function titleFor(state: GameState): TitleKey {
  const beaten = (boss: BossKey) => state.bossesBeaten.includes(boss);
  if (state.goalReached) return "studioOwner";
  if (beaten("w4")) return "consultant";
  if (beaten("w2") && beaten("w3")) return "freelancer";
  if (beaten("w1")) return "sideStarter";
  return "employee";
}

/** Week of the 30-day map (days 29–30 belong to week 4). */
export function weekOfDay(day: number): number {
  return Math.min(4, Math.ceil(day / 7));
}

export function unlockedTools(state: GameState): ToolKey[] {
  return state.bossesBeaten.map((boss) => BOSSES[boss].unlocks);
}

export function isQuestDone(state: GameState, day = state.day): boolean {
  return state.completedDays.includes(day);
}

export function isRecoveryDay(state: GameState): boolean {
  return state.recovery?.day === state.day;
}

// --- Actions ------------------------------------------------------------------------------

/** Complete today's quest (or today's recovery quest). */
export function completeQuest(prev: GameState): Step {
  if (isQuestDone(prev)) return { state: prev, events: [] };

  const recovery = isRecoveryDay(prev);
  const xp = recovery ? XP.recoveryQuest : XP.dailyQuest;
  const stats = { ...prev.stats };
  const events: GameEvent[] = [{ kind: "xp", amount: xp }];

  for (const stat of questStats(prev.day)) {
    stats[stat] += STAT_POINTS.dailyQuest;
    events.push({ kind: "stat", stat, amount: STAT_POINTS.dailyQuest });
  }
  if (recovery) {
    stats.consistency += STAT_POINTS.recoveryBonus;
    events.push({ kind: "stat", stat: "consistency", amount: STAT_POINTS.recoveryBonus });
  }

  const streak = prev.streak + 1;
  let shields = prev.shields;
  events.push({ kind: "streak", streak });
  if (streak % STREAK_SHIELD_EVERY === 0) {
    stats.consistency += STAT_POINTS.streakWeek;
    events.push({ kind: "stat", stat: "consistency", amount: STAT_POINTS.streakWeek });
    if (shields < MAX_SHIELDS) {
      shields += 1;
      events.push({ kind: "shieldEarned", shields });
    }
  }

  return finalize(prev, {
    ...prev,
    xp: prev.xp + xp,
    stats,
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    shields,
    completedDays: [...prev.completedDays, prev.day],
    recovery: recovery ? null : prev.recovery,
  }, events);
}

/**
 * Move to the next day. If today's quest was missed:
 * 1. a Streak Shield is used if the user has one;
 * 2. otherwise tomorrow becomes a recovery quest;
 * 3. a missed recovery quest resets the streak to 0.
 */
export function advanceDay(prev: GameState): Step {
  const events: GameEvent[] = [];
  let { streak, shields, recovery } = prev;

  if (!isQuestDone(prev)) {
    if (isRecoveryDay(prev)) {
      streak = 0;
      recovery = null;
      events.push({ kind: "streakReset" });
    } else if (streak > 0) {
      if (shields > 0) {
        shields -= 1;
        events.push({ kind: "shieldUsed", shields });
      } else {
        recovery = { missedDay: prev.day, day: prev.day + 1 };
        events.push({ kind: "recoveryOffered", day: prev.day + 1 });
      }
    }
  }

  return {
    state: { ...prev, day: prev.day + 1, streak, shields, recovery },
    events,
  };
}

/** Log a real result. Beats the matching boss the first time it happens. */
export function recordResult(prev: GameState, type: ResultType, proof: Proof): Step {
  const verified = proof === "verified";
  const resultXp = verified ? XP.resultVerified : XP.resultSelfReported;
  const resultPoints = verified ? STAT_POINTS.resultVerified : STAT_POINTS.resultSelfReported;
  const resultStat = RESULTS[type].stat;

  const stats = { ...prev.stats, [resultStat]: prev.stats[resultStat] + resultPoints };
  let xp = prev.xp + resultXp;
  let bossesBeaten = prev.bossesBeaten;
  const events: GameEvent[] = [
    { kind: "xp", amount: resultXp },
    { kind: "stat", stat: resultStat, amount: resultPoints },
  ];

  const bossKey = BOSS_KEYS.find(
    (key) => BOSSES[key].result === type && !prev.bossesBeaten.includes(key),
  );
  if (bossKey) {
    const boss = BOSSES[bossKey];
    xp += XP.boss;
    stats[boss.stat] += STAT_POINTS.boss;
    bossesBeaten = [...bossesBeaten, bossKey];
    events.push(
      { kind: "boss", boss: bossKey },
      { kind: "xp", amount: XP.boss },
      { kind: "stat", stat: boss.stat, amount: STAT_POINTS.boss },
      { kind: "unlock", tool: boss.unlocks },
    );
  }

  return finalize(prev, {
    ...prev,
    xp,
    stats,
    bossesBeaten,
    results: [...prev.results, { type, proof, day: prev.day }],
  }, events);
}

// --- Rework stubs (base). Lane L3 replaces these; keep the signatures. ---------------------

/** The day's minimum step. Counts the streak at most once per game day. */
export function completeDailyStep(prev: GameState): Step {
  return completeQuest(prev);
}

/** The real result each pipeline stage stands for. */
const STAGE_RESULTS: Partial<Record<Stage, ResultType>> = {
  replied: "firstReply",
  call: "callBooked",
  proposal: "proposalSent",
  paid: "clientPaid",
};

/**
 * Turn a contact's stage change into results (and so bosses and titles). Moving forward over
 * several stages records each one in between. Moving back or to "not now" records nothing.
 */
export function recordStage(prev: GameState, from: Stage, to: Stage): Step {
  if (to === "not-now") return { state: prev, events: [] };
  const start = from === "not-now" ? 0 : STAGE_ORDER.indexOf(from);
  const end = STAGE_ORDER.indexOf(to);
  let state = prev;
  const events: GameEvent[] = [];
  for (const stage of STAGE_ORDER.slice(start + 1, end + 1)) {
    const result = STAGE_RESULTS[stage];
    if (!result) continue;
    const step = recordResult(state, result, "self");
    state = step.state;
    events.push(...step.events);
  }
  return { state, events };
}

/** Level 2: the user's monthly side income reached the goal they chose in the quiz. */
export function reachGoal(prev: GameState): Step {
  if (prev.goalReached) return { state: prev, events: [] };
  return finalize(prev, { ...prev, goalReached: true }, []);
}

/** Demo mode only: add XP without a quest or result. */
export function grantXp(prev: GameState, amount: number): Step {
  return finalize(prev, { ...prev, xp: prev.xp + amount }, [{ kind: "xp", amount }]);
}

/** Days from the plan start to `today`, counting the start day as day 1. */
export function calendarDay(planStartedAt: Date, today: Date): number {
  const start = new Date(planStartedAt.getFullYear(), planStartedAt.getMonth(), planStartedAt.getDate());
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(1, Math.round((now.getTime() - start.getTime()) / 86_400_000) + 1);
}

/** Bring the game up to the calendar: every day the user didn't open the app counts as missed. */
export function catchUp(prev: GameState, day: number): Step {
  let state = prev;
  const events: GameEvent[] = [];
  while (state.day < day) {
    const step = advanceDay(state);
    state = step.state;
    events.push(...step.events);
  }
  return { state, events };
}

/** Adds level-up and new-title events by comparing before and after. */
function finalize(prev: GameState, next: GameState, events: GameEvent[]): Step {
  const before = levelFromXp(prev.xp);
  const after = levelFromXp(next.xp);
  for (let level = before + 1; level <= after; level++) {
    events.push({ kind: "level", level });
  }
  const title = titleFor(next);
  if (title !== titleFor(prev)) events.push({ kind: "title", title });
  return { state: next, events };
}

// --- Display ------------------------------------------------------------------------------

/** Short growth notification text: "+10 XP", "Clarity +1", "Level 2", "New title: Side Starter". */
export function formatEvent(event: GameEvent): string {
  switch (event.kind) {
    case "xp":
      return `+${event.amount} XP`;
    case "stat":
      return `${STATS[event.stat].label} +${event.amount}`;
    case "level":
      return `Level ${event.level}`;
    case "title":
      return `New title: ${TITLES[event.title].label}`;
    case "streak":
      return `Streak ${event.streak}`;
    case "shieldEarned":
      return "Streak Shield earned";
    case "shieldUsed":
      return "Streak Shield used";
    case "recoveryOffered":
      return "Recovery quest";
    case "streakReset":
      return "Streak reset";
    case "boss":
      return `Boss beaten: ${BOSSES[event.boss].name}`;
    case "unlock":
      return `Unlocked: ${TOOLS[event.tool].label}`;
  }
}
