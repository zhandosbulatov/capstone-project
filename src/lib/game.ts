// Progression rules: XP, levels, six stats, career titles, streak and Streak Shield. Titles come
// from real pipeline events (first reply, call, proposal, payment), not from quests or bosses.
// Pure functions: every action returns a new state plus the events to show.
// XP and stat numbers are starting values, to be tuned after the first users.

import { STAGE_ORDER, type Stage } from "./model";

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
  sideStarter: { label: "Side Starter", earnedBy: "Your first reply" },
  freelancer: { label: "Freelancer", earnedBy: "Your first call and your first proposal" },
  consultant: { label: "Consultant", earnedBy: "Your first paying client" },
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

/**
 * Milestone data, still imported by the landing page, journey, demo panel and Hugin lines.
 * Bosses no longer gate titles or tools, and beating one gives no bonus.
 */
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
  /** The first step of a calendar day. */
  dailyStep: 10,
  /** Any later step the same day. */
  extraStep: 5,
  resultVerified: 50,
  resultSelfReported: 25,
} as const;

export const STAT_POINTS = {
  dailyStep: 1,
  resultVerified: 3,
  resultSelfReported: 1,
} as const;

export const STREAK_SHIELD_EVERY = 7;
export const MAX_SHIELDS = 2;
/** Streak lengths that get a notification. */
export const STREAK_MILESTONES = [7, 14, 30] as const;

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
  /** @deprecated Old saves may carry this. It is ignored and dropped on the next action. */
  recovery?: null;
  /** ISO date (YYYY-MM-DD) of the last step, so a calendar day counts the streak only once. */
  lastStepDate?: string;
  results: ResultRecord[];
  /** Milestones reached, kept for the journey view. Titles read `results`, not this. */
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
  /** @deprecated Never emitted any more. */
  | { kind: "recoveryOffered"; day: number }
  | { kind: "streakReset" }
  /** @deprecated Never emitted any more. */
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
    results: [],
    bossesBeaten: [],
    goalReached: false,
  };
}

/** Load an old saved game: fill missing fields and ignore a leftover `recovery`. */
export function normalizeGame(saved: Partial<GameState>): GameState {
  return dropRecovery({ ...createGame(), ...saved });
}

function dropRecovery(state: GameState): GameState {
  if (!("recovery" in state)) return state;
  const next = { ...state };
  delete next.recovery;
  return next;
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

/** True once this real event has happened (old saves may only have the matching boss). */
function hasResult(state: GameState, type: ResultType): boolean {
  return (
    state.results.some((r) => r.type === type) ||
    state.bossesBeaten.some((key) => BOSSES[key].result === type)
  );
}

/** The title the user's real events have earned, before the income goal is considered. */
function earnedTitle(state: GameState): TitleKey {
  if (hasResult(state, "clientPaid")) return "consultant";
  if (hasResult(state, "callBooked") && hasResult(state, "proposalSent")) return "freelancer";
  if (hasResult(state, "firstReply")) return "sideStarter";
  return "employee";
}

export function titleFor(state: GameState): TitleKey {
  return state.goalReached ? "studioOwner" : earnedTitle(state);
}

/** Week of the early map (days 22 and later belong to week 4). */
export function weekOfDay(day: number): number {
  return Math.min(4, Math.ceil(day / 7));
}

const TOOLS_BY_TITLE: Record<Exclude<TitleKey, "studioOwner">, ToolKey[]> = {
  employee: [],
  sideStarter: ["callScript"],
  freelancer: ["callScript", "proposalTemplate", "followUpScript"],
  consultant: ["callScript", "proposalTemplate", "followUpScript", "reviewForm"],
};

/** Tools unlock with career titles. */
export function unlockedTools(state: GameState): ToolKey[] {
  const title = earnedTitle(state);
  return TOOLS_BY_TITLE[title as keyof typeof TOOLS_BY_TITLE];
}

export function isQuestDone(state: GameState, day = state.day): boolean {
  return state.completedDays.includes(day);
}

// --- Actions ------------------------------------------------------------------------------

/**
 * The day's step. The first one of a calendar day adds a streak day, 10 XP and Consistency +1;
 * later ones that day give 5 XP and leave the streak alone. A shield comes every 7 streak days.
 * Without `todayIso` the game day stands in for the calendar day.
 */
export function completeDailyStep(prev: GameState, todayIso?: string): Step {
  const base = dropRecovery(prev);
  const done = isQuestDone(base);
  const newDate = todayIso !== undefined && !!base.lastStepDate && base.lastStepDate !== todayIso;
  const first = !done || newDate;
  const lastStepDate = todayIso ?? base.lastStepDate;
  const completedDays = done ? base.completedDays : [...base.completedDays, base.day];

  if (!first) {
    return finalize(
      prev,
      { ...base, xp: base.xp + XP.extraStep, lastStepDate, completedDays },
      [{ kind: "xp", amount: XP.extraStep }],
    );
  }

  const stats = { ...base.stats, consistency: base.stats.consistency + STAT_POINTS.dailyStep };
  const events: GameEvent[] = [
    { kind: "xp", amount: XP.dailyStep },
    { kind: "stat", stat: "consistency", amount: STAT_POINTS.dailyStep },
  ];
  const streak = base.streak + 1;
  let shields = base.shields;
  events.push({ kind: "streak", streak });
  if (streak % STREAK_SHIELD_EVERY === 0 && shields < MAX_SHIELDS) {
    shields += 1;
    events.push({ kind: "shieldEarned", shields });
  }

  return finalize(
    prev,
    {
      ...base,
      xp: base.xp + XP.dailyStep,
      stats,
      streak,
      bestStreak: Math.max(base.bestStreak, streak),
      shields,
      lastStepDate,
      completedDays,
    },
    events,
  );
}

/**
 * Move to the next day. If no step was taken today: a Streak Shield is used if the user has
 * one and the streak stays; otherwise the streak goes to 0.
 */
export function advanceDay(prev: GameState): Step {
  const base = dropRecovery(prev);
  const events: GameEvent[] = [];
  let { streak, shields } = base;

  if (!isQuestDone(base) && streak > 0) {
    if (shields > 0) {
      shields -= 1;
      events.push({ kind: "shieldUsed", shields });
    } else {
      streak = 0;
      events.push({ kind: "streakReset" });
    }
  }

  return { state: { ...base, day: base.day + 1, streak, shields }, events };
}

/**
 * Log a real result. The first time each kind happens it earns XP and grows its stat (and may
 * earn a title). A repeat earns XP only.
 */
export function recordResult(prev: GameState, type: ResultType, proof: Proof): Step {
  const base = dropRecovery(prev);
  const verified = proof === "verified";
  const resultXp = verified ? XP.resultVerified : XP.resultSelfReported;
  const resultPoints = verified ? STAT_POINTS.resultVerified : STAT_POINTS.resultSelfReported;
  const resultStat = RESULTS[type].stat;
  const first = !hasResult(base, type);

  const events: GameEvent[] = [{ kind: "xp", amount: resultXp }];
  let stats = base.stats;
  let bossesBeaten = base.bossesBeaten;
  if (first) {
    stats = { ...stats, [resultStat]: stats[resultStat] + resultPoints };
    events.push({ kind: "stat", stat: resultStat, amount: resultPoints });
    bossesBeaten = [
      ...bossesBeaten,
      ...BOSS_KEYS.filter((key) => BOSSES[key].result === type && !bossesBeaten.includes(key)),
    ];
  }

  return finalize(
    prev,
    {
      ...base,
      xp: base.xp + resultXp,
      stats,
      bossesBeaten,
      results: [...base.results, { type, proof, day: base.day }],
    },
    events,
  );
}

/** The real result each pipeline stage stands for. */
const STAGE_RESULTS: Partial<Record<Stage, ResultType>> = {
  replied: "firstReply",
  call: "callBooked",
  proposal: "proposalSent",
  paid: "clientPaid",
};

/**
 * Turn a contact's stage change into results (and so titles), with "self" proof. Moving forward
 * over several stages records each one in between. Only the first time of each event grows a
 * stat; repeats add XP only. Moving back or to "not now" records nothing.
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
  return finalize(prev, { ...dropRecovery(prev), goalReached: true }, []);
}

/** Demo mode only: add XP without a quest or result. */
export function grantXp(prev: GameState, amount: number): Step {
  return finalize(prev, { ...dropRecovery(prev), xp: prev.xp + amount }, [
    { kind: "xp", amount },
  ]);
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

/** Adds level-up, new-title and tool-unlock events by comparing before and after. */
function finalize(prev: GameState, next: GameState, events: GameEvent[]): Step {
  const before = levelFromXp(prev.xp);
  const after = levelFromXp(next.xp);
  for (let level = before + 1; level <= after; level++) {
    events.push({ kind: "level", level });
  }
  const title = titleFor(next);
  if (title !== titleFor(prev)) events.push({ kind: "title", title });
  const toolsBefore = unlockedTools(prev);
  for (const tool of unlockedTools(next)) {
    if (!toolsBefore.includes(tool)) events.push({ kind: "unlock", tool });
  }
  return { state: next, events };
}

// --- Display ------------------------------------------------------------------------------

function isMilestone(streak: number): boolean {
  return (STREAK_MILESTONES as readonly number[]).includes(streak);
}

/** Short text for an event: "+10 XP", "Clarity +1", "Level 2", "New title: Side Starter". */
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
      return isMilestone(event.streak) ? `${event.streak}-day streak` : `Streak ${event.streak}`;
    case "shieldEarned":
      return "Streak Shield earned";
    case "shieldUsed":
      return "Streak Shield used";
    case "recoveryOffered":
      return "";
    case "streakReset":
      return "Streak reset";
    case "boss":
      return `Milestone: ${BOSSES[event.boss].name}`;
    case "unlock":
      return `Unlocked: ${TOOLS[event.tool].label}`;
  }
}

/** Only these events get a notification. XP, stat and level events are recorded, not shown. */
export function isToastEvent(event: GameEvent): boolean {
  switch (event.kind) {
    case "title":
    case "shieldEarned":
      return true;
    case "streak":
      return isMilestone(event.streak);
    default:
      return false;
  }
}

const QUIET_TOAST_PARTS = [
  /^\+\d+ XP$/,
  /^[A-Za-z][A-Za-z ]* \+\d+$/,
  /^Level \d+$/,
  /^Unlocked: /,
  /^Milestone: /,
  /^Streak \d+$/,
  /^Streak Shield used$/,
  /^Streak reset$/,
  /^Recovery quest$/,
];

/**
 * Drop the quiet parts (XP, stat, level, unlock, shield used, reset) from a notification's text.
 * Returns null when nothing worth showing is left.
 */
export function visibleToastText(text: string): string | null {
  const kept = text
    .split(" · ")
    .filter((part) => part && !QUIET_TOAST_PARTS.some((pattern) => pattern.test(part)));
  return kept.length ? kept.join(" · ") : null;
}
