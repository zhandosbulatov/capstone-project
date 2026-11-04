// Quiz options and paywall data. Keys, labels and prices are part of the spec: change them on purpose only.

export type SkillKey =
  | "design"
  | "writing"
  | "marketing"
  | "finance"
  | "teaching"
  | "consult"
  | "data";

export type Skill = {
  icon: string;
  label: string;
  /** The service the user sells (their offer). */
  service: string;
  unit: string;
  basePrice: number;
  /** Who the offer is for, used in the offer draft. */
  who: string;
  /** What the client gets, used in the offer draft. */
  result: string;
  firstBuyers: string;
  deliverable: string;
};

export const SKILLS: Record<SkillKey, Skill> = {
  design: {
    icon: "🎨",
    label: "Design",
    service: "Brand starter kit for local businesses",
    unit: "per project",
    basePrice: 450,
    who: "local businesses",
    result: "a brand that looks professional",
    firstBuyers:
      "cafés, studios and shops near you, plus ex-colleagues who now run teams",
    deliverable: "logo refresh, colour palette, 5 social templates",
  },
  writing: {
    icon: "✍️",
    label: "Writing and content",
    service: "Website copy refresh for small businesses",
    unit: "per site",
    basePrice: 350,
    who: "small businesses",
    result: "a website that sells",
    firstBuyers:
      "small business owners whose sites you already think are badly written",
    deliverable: "home, about and service pages rewritten in 7 days",
  },
  marketing: {
    icon: "📣",
    label: "Marketing",
    service: "Instagram setup for local businesses",
    unit: "per month",
    basePrice: 400,
    who: "local businesses",
    result: "steady posts and first leads",
    firstBuyers: "local businesses that post rarely or not at all",
    deliverable: "content plan, 12 posts, one ad test",
  },
  finance: {
    icon: "📊",
    label: "Bookkeeping and finance",
    service: "Monthly bookkeeping for freelancers",
    unit: "per month",
    basePrice: 250,
    who: "freelancers",
    result: "clean books and no tax surprises",
    firstBuyers: "freelancers and micro-businesses in your network",
    deliverable: "monthly books, tax set-aside, one-page report",
  },
  teaching: {
    icon: "🎓",
    label: "Teaching and tutoring",
    service: "5-session exam prep package",
    unit: "per package",
    basePrice: 275,
    who: "students",
    result: "a higher exam score",
    firstBuyers: "parents and students in your city's school chats",
    deliverable: "5 one-to-one sessions and a study plan",
  },
  consult: {
    icon: "🧭",
    label: "Management and consulting",
    service: "Process audit for small teams",
    unit: "per audit",
    basePrice: 600,
    who: "small teams",
    result: "fewer dropped balls",
    firstBuyers: "founders of 5–30 person companies you know through work",
    deliverable: "2 interviews, a process map, 5 fixes",
  },
  data: {
    icon: "💻",
    label: "Data and IT",
    service: "Sales dashboard for small online shops",
    unit: "per project",
    basePrice: 500,
    who: "small online shops",
    result: "sales numbers they can trust",
    firstBuyers:
      "online shop owners who still track sales in spreadsheets",
    deliverable: "one live dashboard and a 30-minute handover",
  },
};

export const SKILL_KEYS = Object.keys(SKILLS) as SkillKey[];

export type ExperienceKey = "y1" | "y2" | "y3" | "y4";

/** Price multiplier in percent, so the price formula stays in integer maths. */
export const EXPERIENCE: Record<
  ExperienceKey,
  { label: string; multiplierPct: number }
> = {
  y1: { label: "Less than 2 years", multiplierPct: 70 },
  y2: { label: "2–5 years", multiplierPct: 100 },
  y3: { label: "5–10 years", multiplierPct: 130 },
  y4: { label: "10+ years", multiplierPct: 160 },
};

export const EXPERIENCE_KEYS = Object.keys(EXPERIENCE) as ExperienceKey[];

export type PaidKey = "never" | "once" | "some";

export const PAID_BEFORE: Record<
  PaidKey,
  { icon: string; label: string; teaser: string }
> = {
  never: {
    icon: "🌱",
    label: "Never, only at my job",
    teaser:
      "Most people start exactly here. Your plan begins with people who already trust your work, so the first sale feels like a favour, not a pitch.",
  },
  once: {
    icon: "🙌",
    label: "Once or twice, for friends",
    teaser:
      "You've done it before, so the hard part is behind you. Now we turn a one-off into a service people can buy again.",
  },
  some: {
    icon: "💼",
    label: "I freelance now and then",
    teaser:
      "You already have proof. The plan packages it into one clear offer with a price, so clients come from a system rather than luck.",
  },
};

export const PAID_KEYS = Object.keys(PAID_BEFORE) as PaidKey[];

export type GoalKey = "g1" | "g2" | "g3" | "g4";

/** monthlyUsd is null for "Replace my salary": the user confirms that goal themselves. */
export const GOALS: Record<GoalKey, { label: string; monthlyUsd: number | null }> =
  {
    g1: { label: "+$500 a month", monthlyUsd: 500 },
    g2: { label: "+$1,000 a month", monthlyUsd: 1000 },
    g3: { label: "+$2,000 a month", monthlyUsd: 2000 },
    g4: { label: "Replace my salary one day", monthlyUsd: null },
  };

export const GOAL_KEYS = Object.keys(GOALS) as GoalKey[];

export type TimeKey = 15 | 20 | 30 | 60;

export const TIMES: Record<TimeKey, { label: string }> = {
  15: { label: "15 minutes" },
  20: { label: "20 minutes" },
  30: { label: "30 minutes" },
  60: { label: "1 hour" },
};

export const TIME_KEYS: TimeKey[] = [15, 20, 30, 60];

export type BlockerKey = "what" | "price" | "who" | "sales";

export const BLOCKERS: Record<
  BlockerKey,
  { icon: string; label: string; fix: string }
> = {
  what: {
    icon: "🤔",
    label: "I don't know what to sell",
    fix: "Day 1 turns your skill into one offer you can say in a sentence.",
  },
  price: {
    icon: "💲",
    label: "I don't know what to charge",
    fix: "Your plan already has a starting price. Week 3 shows you how to raise it.",
  },
  who: {
    icon: "🔍",
    label: "I'm not sure who would buy",
    fix: "Week 1 starts with people who have already seen your work: the warmest buyers you have.",
  },
  sales: {
    icon: "🙈",
    label: "I don't want to look salesy",
    fix: "Your coach drafts every message. You send help, not a pitch.",
  },
};

export const BLOCKER_KEYS = Object.keys(BLOCKERS) as BlockerKey[];

export type PlanKey = "p4" | "p12" | "p24";

export type Plan = {
  name: string;
  introUsd: number;
  fullUsd: number;
  days: number;
  weeks: number;
  tag?: string;
};

export const PLANS: Record<PlanKey, Plan> = {
  p4: { name: "4-week plan", introUsd: 19.99, fullUsd: 39.99, days: 28, weeks: 4 },
  p12: {
    name: "12-week plan",
    introUsd: 39.99,
    fullUsd: 79.99,
    days: 84,
    weeks: 12,
    tag: "Most popular",
  },
  p24: {
    name: "24-week plan",
    introUsd: 59.99,
    fullUsd: 119.99,
    days: 168,
    weeks: 24,
  },
};

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];
export const DEFAULT_PLAN: PlanKey = "p12";

/** The reminder email goes out this many days before the renewal. */
export const REMINDER_DAYS_BEFORE = 3;

export function reminderDay(plan: Plan): number {
  return plan.days - REMINDER_DAYS_BEFORE;
}

export function introPerDay(plan: Plan): number {
  return plan.introUsd / plan.days;
}

export const FIRST_CLIENT_KIT = {
  name: "First Client Kit",
  priceUsd: 29.99,
  contents: [
    "12 outreach messages, written for your service",
    "A proposal template with your price filled in",
    "A pricing calculator for your next 5 clients",
  ],
} as const;

/** Everything the quiz collects. */
export type QuizAnswers = {
  skill: SkillKey;
  years: ExperienceKey;
  paid: PaidKey;
  goal: GoalKey;
  time: TimeKey;
  blocker: BlockerKey;
};

/** Defaults for skipped screens (demo screen map), as in the prototype. */
export const DEFAULT_ANSWERS: QuizAnswers = {
  skill: "design",
  years: "y2",
  paid: "never",
  goal: "g2",
  time: 20,
  blocker: "what",
};
