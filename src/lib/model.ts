// The shared data model for contacts, lessons, drafts and the daily step. Types and labels only.
// Days are game days (`GameState.day`, kept in step with the calendar by `catchUp`), not dates,
// so demo mode's "Next day" moves every rule forward too.

export type Relation =
  | "ex-colleague"
  | "colleague-friend"
  | "friend"
  | "past-client"
  | "local-business"
  | "other";

export const RELATION_LABELS: Record<Relation, string> = {
  "ex-colleague": "Ex-colleague",
  "colleague-friend": "Colleague and friend",
  friend: "Friend",
  "past-client": "Past client",
  "local-business": "Local business",
  other: "Other",
};

export const RELATIONS = Object.keys(RELATION_LABELS) as Relation[];

export type Stage = "listed" | "messaged" | "replied" | "call" | "proposal" | "paid" | "not-now";

export const STAGE_LABELS: Record<Stage, string> = {
  listed: "Listed",
  messaged: "Messaged",
  replied: "Replied",
  call: "Call",
  proposal: "Proposal sent",
  paid: "Paid",
  "not-now": "Not now",
};

/** Forward order of the pipeline. `not-now` sits outside it. */
export const STAGE_ORDER: Exclude<Stage, "not-now">[] = [
  "listed",
  "messaged",
  "replied",
  "call",
  "proposal",
  "paid",
];

export const STAGES = Object.keys(STAGE_LABELS) as Stage[];

export type Contact = {
  id: string;
  name: string;
  relation: Relation;
  note?: string;
  stage: Stage;
  /** Game day the contact was added. */
  addedDay: number;
  /** Game day of the last message, follow-up, proposal, answer or logged reply. */
  lastActionDay?: number;
  /** Follow-ups sent since the last message or reply. */
  followUps: number;
  /** The last thing the user sent them. */
  lastSent?: string;
  /** What they wrote, pasted by the user. */
  lastReply?: string;
  /** A reply is logged but the user hasn't answered it yet. */
  awaitingAnswer: boolean;
};

/** What the user types to add someone. */
export type ContactInput = { name: string; relation: Relation; note?: string };

export type LessonId =
  | "m0-safe"
  | "m1-offer"
  | "m2-package"
  | "m3-outreach"
  | "m4-sales"
  | "m5-proposal"
  | "m6-deliver"
  | "m7-money"
  | "l2-beyond";

export type DecisionField = {
  id: string;
  label: string;
  placeholder: string;
  help?: string;
  multiline?: boolean;
};

export type Lesson = {
  id: LessonId;
  title: string;
  minutes: number;
  /** Legal and tax lessons: general information only, finished by reading. */
  readOnly: boolean;
  /** Shown while locked, e.g. "Unlocks when someone replies". */
  unlockText: string;
  /** Paragraphs. */
  body: string[];
  keyPoints: string[];
  decision?: { intro: string; fields: DecisionField[]; usedFor: string };
  /** Empty for now. */
  links: { label: string; url: string }[];
};

export type LessonProgress = {
  /** Game day the lesson was read. */
  readDay?: number;
  decision?: Record<string, string>;
  /** Game day the decision was saved. */
  decidedDay?: number;
};

export type LessonsState = Partial<Record<LessonId, LessonProgress>>;

export type DraftKind =
  | "offer"
  | "outreach"
  | "follow-up"
  | "proposal"
  | "reply"
  | "kickoff"
  | "review-request"
  | "referral";

export type NextStep =
  | { kind: "day1" }
  | { kind: "answer"; contactId: string }
  | { kind: "lesson"; lessonId: LessonId }
  | { kind: "propose"; contactId: string }
  | { kind: "follow-up"; contactId: string }
  | { kind: "message"; contactId: string }
  | { kind: "add-people" };

/** Hugin's review of a lesson decision, from POST /api/review (not a draft kind). */
export type DecisionReview = { feedback: string[]; improved: Record<string, string> };

/** How a logged reply moves the contact. */
export type ReplyOutcome = "replied" | "call" | "paid" | "not-now";
