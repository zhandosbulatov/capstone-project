// Pure helpers for the People and Progress tabs. Relative imports only, so Vitest can load it.

import { TITLE_ORDER, TITLES, type GameState, type ResultType, type TitleKey } from "../../lib/game";
import { LESSONS, LESSON_ORDER } from "../../lib/curriculum";
import type { Contact, LessonId, LessonsState, Stage } from "../../lib/model";
import { isLessonFinished, isLessonUnlocked, type StepInput } from "../../lib/next-step";

/** People groups in display order. */
export const GROUPS: { stage: Stage; label: string }[] = [
  { stage: "replied", label: "Replied" },
  { stage: "call", label: "Call booked" },
  { stage: "proposal", label: "Proposal sent" },
  { stage: "messaged", label: "Messaged" },
  { stage: "listed", label: "On your list" },
  { stage: "paid", label: "Paid" },
  { stage: "not-now", label: "Not now" },
];

const ACTION_VERBS: Record<Stage, string> = {
  listed: "added",
  messaged: "messaged",
  replied: "replied",
  call: "call booked",
  proposal: "proposal sent",
  paid: "paid",
  "not-now": "marked not now",
};

export function groupContacts(contacts: Contact[]): { stage: Stage; label: string; items: Contact[] }[] {
  return GROUPS.map((g) => ({ ...g, items: contacts.filter((c) => c.stage === g.stage) })).filter(
    (g) => g.items.length > 0,
  );
}

/** "messaged 3 days ago", in plain words. Days are game days. */
export function lastActionText(contact: Contact, today: number): string {
  const since = contact.lastActionDay ?? contact.addedDay;
  const verb = contact.lastActionDay === undefined ? "added" : ACTION_VERBS[contact.stage];
  const gap = Math.max(0, today - since);
  const when = gap === 0 ? "today" : gap === 1 ? "yesterday" : `${gap} days ago`;
  return `${verb} ${when}`;
}

/** The ladder shown in Progress. Studio Owner is a later, separate goal. */
const LADDER: TitleKey[] = TITLE_ORDER.filter((t) => t !== "studioOwner");

export const MILESTONES: { result: ResultType; label: string }[] = [
  { result: "firstReply", label: "First reply" },
  { result: "callBooked", label: "First call" },
  { result: "proposalSent", label: "First proposal" },
  { result: "clientPaid", label: "First client" },
];

/** The game day each milestone was first reached, or null. */
export function milestoneDays(game: Pick<GameState, "results">) {
  return MILESTONES.map((m) => ({
    ...m,
    day: game.results.find((r) => r.type === m.result)?.day ?? null,
  }));
}

/** The next title and what earns it, or null at the top of the ladder. */
export function nextTitle(title: TitleKey): { label: string; earnedBy: string } | null {
  const next = LADDER[LADDER.indexOf(title) + 1];
  return next ? TITLES[next] : null;
}

// ---- Course map and one-page business ----

export type CourseItem = {
  id: LessonId;
  title: string;
  minutes: number;
  unlockText: string;
  state: "done" | "unlocked" | "locked";
  /** Game day it was read or decided, when done. */
  day?: number;
};

/** All lessons in order, each done, unlocked or locked (same rules as the daily step). */
export function courseMap(input: StepInput): CourseItem[] {
  return LESSON_ORDER.map((id) => {
    const lesson = LESSONS[id];
    const progress = input.lessons[id];
    const finished = isLessonFinished(id, input.lessons);
    return {
      id,
      title: lesson.title,
      minutes: lesson.minutes,
      unlockText: lesson.unlockText,
      state: finished ? "done" : isLessonUnlocked(id, input) ? "unlocked" : "locked",
      day: finished ? (lesson.readOnly ? progress?.readDay : progress?.decidedDay) : undefined,
    };
  });
}

/** Lessons whose saved decisions show on the one-page card, with the heading each gets. */
export const ONE_PAGE_SECTIONS: { id: LessonId; heading: string }[] = [
  { id: "m1-offer", heading: "Your offer" },
  { id: "m2-package", heading: "Your package" },
  { id: "m4-sales", heading: "Call questions" },
  { id: "m5-proposal", heading: "Agreement basics" },
  { id: "m6-deliver", heading: "Kickoff and review plan" },
  { id: "l2-beyond", heading: "Next steps" },
];

export type OnePageSection = { id: LessonId; heading: string; rows: { label: string; value: string }[] };

/** Saved decisions matched to the lesson's own field ids and labels. Empty sections are left out. */
export function onePageSections(lessons: LessonsState): OnePageSection[] {
  return ONE_PAGE_SECTIONS.flatMap(({ id, heading }) => {
    const saved = lessons[id]?.decision;
    if (!saved) return [];
    const rows = (LESSONS[id].decision?.fields ?? []).flatMap((f) => {
      const value = saved[f.id]?.trim();
      return value ? [{ label: f.label, value }] : [];
    });
    return rows.length ? [{ id, heading, rows }] : [];
  });
}

/** Lessons that carry the small "Not legal or tax advice" tag. */
export const ADVICE_TAG_LESSONS: LessonId[] = ["m0-safe", "m7-money"];
