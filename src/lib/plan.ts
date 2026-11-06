import { formatUsd, startingPrice } from "./pricing";
import {
  BLOCKERS,
  PAID_BEFORE,
  SKILLS,
  type QuizAnswers,
} from "./quiz-data";

const DAYS_TO_FIRST_CLIENT = 84 // 12 weeks;

export type PlanWeek = { week: number; title: string; text: string };

/** The personal plan shown before the paywall and used across the app. */
export type PersonalPlan = {
  skillLabel: string;
  skillIcon: string;
  service: string;
  unit: string;
  price: number;
  /** "$450 per project" */
  priceLabel: string;
  firstBuyers: string;
  deliverable: string;
  minutes: number;
  clientBy: Date;
  /** "December 4" */
  clientByLabel: string;
  firstStep: string;
  weeks: PlanWeek[];
};

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** "December 4" */
export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/** Week 1's first step depends on whether the user has freelanced before. */
export function firstStep(answers: Pick<QuizAnswers, "paid">): string {
  return answers.paid === "some"
    ? "Re-contact 3 past clients and tell them about your new package"
    : "List 20 people who have seen your work";
}

export function buildPlan(answers: QuizAnswers, today: Date): PersonalPlan {
  const skill = SKILLS[answers.skill];
  const price = startingPrice(answers.skill, answers.years);
  const clientBy = addDays(today, DAYS_TO_FIRST_CLIENT);
  const step = firstStep(answers);

  return {
    skillLabel: skill.label,
    skillIcon: skill.icon,
    service: skill.service,
    unit: skill.unit,
    price,
    priceLabel: `${formatUsd(price)} ${skill.unit}`,
    firstBuyers: skill.firstBuyers,
    deliverable: skill.deliverable,
    minutes: answers.time,
    clientBy,
    clientByLabel: formatMonthDay(clientBy),
    firstStep: step,
    weeks: [
      {
        week: 1,
        title: "First reply",
        text: `Write your offer in one sentence. ${step}.`,
      },
      {
        week: 2,
        title: "First calls",
        text: "Send 15 warm messages your coach drafts. Book 2 calls.",
      },
      {
        week: 3,
        title: "First proposal",
        text: `Run the call script. Send 2 proposals at ${formatUsd(price)}.`,
      },
      {
        week: 4,
        title: "First client",
        text: "Close one client. Ask for a review. Unlock Level 2.",
      },
    ],
  };
}

/** "First paying client by December 4" */
export function planHeadline(plan: PersonalPlan): string {
  return `First paying client by ${plan.clientByLabel}`;
}

/** Day 1 offer draft: "I help {who} get {result}: {deliverable}, for ${price} {unit}." */
export function offerDraft(answers: QuizAnswers): string {
  const skill = SKILLS[answers.skill];
  const price = startingPrice(answers.skill, answers.years);
  return `I help ${skill.who} get ${skill.result}: ${skill.deliverable}, for ${formatUsd(price)} ${skill.unit}.`;
}

/** Screen 5 teaser, personalised by the "paid before" answer. */
export function teaser(answers: QuizAnswers): {
  icon: string;
  title: string;
  body: string;
  line: string;
} {
  const skill = SKILLS[answers.skill];
  return {
    icon: skill.icon,
    title: `${skill.label} sells well as a service`,
    body: `Small businesses already buy it from freelancers every day: ${skill.deliverable}.`,
    line: PAID_BEFORE[answers.paid].teaser,
  };
}

/** The loader screen answers the user's main blocker. */
export function blockerFix(answers: QuizAnswers): string {
  return BLOCKERS[answers.blocker].fix;
}
