// Picks the one step the app shows on Today. Pure functions; `today` is the game day.

import { LESSON_ORDER, LESSONS } from "./curriculum";
import {
  STAGE_ORDER,
  type Contact,
  type LessonId,
  type LessonsState,
  type NextStep,
  type Stage,
} from "./model";

/** Days of silence before a follow-up is due. */
export const FOLLOW_UP_AFTER_DAYS = 3;
/** Follow-ups before a quiet contact moves to "not now". */
export const MAX_FOLLOW_UPS = 2;
/** Stages where the user is waiting on the other person and may follow up. */
export const WAITING_STAGES: Stage[] = ["messaged", "replied", "proposal"];

export type StepInput = {
  offer: string | null;
  contacts: Contact[];
  lessons: LessonsState;
};

/** Day 1 is done once there's an offer and at least one person, whatever the game day. */
export function isDay1Done(state: Pick<StepInput, "offer" | "contacts">): boolean {
  return state.offer !== null && state.contacts.length > 0;
}

/** Pipeline position; `not-now` counts as -1. */
export function stageRank(stage: Stage): number {
  return stage === "not-now" ? -1 : STAGE_ORDER.indexOf(stage);
}

/** The contact has reached `stage` or gone past it. */
export function reached(contact: Contact, stage: Exclude<Stage, "not-now">): boolean {
  return stageRank(contact.stage) >= STAGE_ORDER.indexOf(stage);
}

/** Has been messaged at least once (including people who later went quiet). */
export function wasMessaged(contact: Contact): boolean {
  return reached(contact, "messaged") || (contact.stage === "not-now" && contact.lastActionDay !== undefined);
}

export function isLessonFinished(id: LessonId, lessons: LessonsState): boolean {
  const progress = lessons[id];
  if (!progress) return false;
  return LESSONS[id].readOnly ? progress.readDay !== undefined : progress.decidedDay !== undefined;
}

/** Unlock rules, in LESSON_ORDER. "Contact in call" means reached the call stage. */
export function isLessonUnlocked(id: LessonId, state: StepInput): boolean {
  const { contacts, lessons } = state;
  const messaged = contacts.filter(wasMessaged).length;
  const any = (stage: Exclude<Stage, "not-now">) => contacts.some((c) => reached(c, stage));
  const done = (lesson: LessonId) => isLessonFinished(lesson, lessons);
  switch (id) {
    case "m0-safe":
      return isDay1Done(state);
    case "m1-offer":
      return messaged >= 2;
    case "m2-package":
      return any("replied") || messaged >= 5;
    case "m3-outreach":
      return contacts.filter((c) => c.stage === "listed").length <= 1 && done("m1-offer");
    case "m4-sales":
      return any("call");
    case "m5-proposal":
      return any("call") && done("m4-sales");
    case "m6-deliver":
      return any("paid");
    case "m7-money":
      return done("m6-deliver");
    case "l2-beyond":
      return done("m7-money");
  }
}

/** A lesson was read or decided today: at most one lesson step a day. */
function lessonStepToday(lessons: LessonsState, today: number): boolean {
  return Object.values(lessons).some((p) => p?.readDay === today || p?.decidedDay === today);
}

function followUpDue(contact: Contact, today: number): boolean {
  return (
    WAITING_STAGES.includes(contact.stage) &&
    !contact.awaitingAnswer &&
    contact.followUps < MAX_FOLLOW_UPS &&
    contact.lastActionDay !== undefined &&
    today - contact.lastActionDay >= FOLLOW_UP_AFTER_DAYS
  );
}

/** Oldest first; ties keep list order. */
function byAdded(a: Contact, b: Contact): number {
  return a.addedDay - b.addedDay;
}

/** The first matching rule wins. */
export function nextStep(
  state: StepInput,
  today: number,
  options: { skipLessons?: boolean } = {},
): NextStep {
  const { contacts, lessons } = state;

  // 1. Day 1
  if (!isDay1Done(state)) return { kind: "day1" };

  // 2. Someone replied and is waiting for an answer
  const waiting = contacts.find((c) => c.awaitingAnswer && c.stage !== "not-now");
  if (waiting) return { kind: "answer", contactId: waiting.id };

  // 3. An unlocked, unfinished lesson, one a day
  if (!options.skipLessons && !lessonStepToday(lessons, today)) {
    const lesson = LESSON_ORDER.find(
      (id) => isLessonUnlocked(id, state) && !isLessonFinished(id, lessons),
    );
    if (lesson) return { kind: "lesson", lessonId: lesson };
  }

  // 4. A call happened: send the proposal
  const call = contacts.find((c) => c.stage === "call");
  if (call) return { kind: "propose", contactId: call.id };

  // 5. A follow-up is due
  const quiet = contacts.filter((c) => followUpDue(c, today)).sort(byAdded)[0];
  if (quiet) return { kind: "follow-up", contactId: quiet.id };

  // 6. The next person on the list
  const listed = contacts.filter((c) => c.stage === "listed").sort(byAdded)[0];
  if (listed) return { kind: "message", contactId: listed.id };

  // 7. Nobody left to message
  return { kind: "add-people" };
}

/**
 * A waiting contact with 2 follow-ups and 3+ quiet days moves to "not now".
 * Returns the same array when nothing changes.
 */
export function tidyContacts(contacts: Contact[], today: number): Contact[] {
  let changed = false;
  const next = contacts.map((c) => {
    if (
      WAITING_STAGES.includes(c.stage) &&
      !c.awaitingAnswer &&
      c.followUps >= MAX_FOLLOW_UPS &&
      c.lastActionDay !== undefined &&
      today - c.lastActionDay >= FOLLOW_UP_AFTER_DAYS
    ) {
      changed = true;
      return { ...c, stage: "not-now" as const };
    }
    return c;
  });
  return changed ? next : contacts;
}

/** Plain one-line title for a step. Today's UI may use its own copy. */
export function stepTitle(step: NextStep, contacts: Contact[]): string {
  const name = (id: string) => contacts.find((c) => c.id === id)?.name ?? "them";
  switch (step.kind) {
    case "day1":
      return "Write your offer and your first 5 names";
    case "answer":
      return `Answer ${name(step.contactId)}`;
    case "lesson":
      return `Lesson: ${LESSONS[step.lessonId].title}`;
    case "propose":
      return `Send ${name(step.contactId)} a proposal`;
    case "follow-up":
      return `Follow up with ${name(step.contactId)}`;
    case "message":
      return `Message ${name(step.contactId)}`;
    case "add-people":
      return "Add more people who know your work";
  }
}

/** One short summary of saved lesson decisions, for Hugin's context. */
export function decisionsSummary(lessons: LessonsState): string {
  return LESSON_ORDER.flatMap((id) => {
    const decision = lessons[id]?.decision;
    const fields = LESSONS[id].decision?.fields ?? [];
    if (!decision) return [];
    const parts = fields
      .filter((f) => decision[f.id]?.trim())
      .map((f) => `${f.label}: ${decision[f.id].trim()}`);
    return parts.length ? [`${LESSONS[id].title}. ${parts.join("; ")}`] : [];
  }).join("\n");
}
