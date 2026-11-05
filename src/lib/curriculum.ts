// The 9 short lessons. Stub text from the base; lane L5 writes the real lessons.
// Unlock rules live in next-step.ts; this file holds only content.

import type { Lesson, LessonId } from "./model";

/** The order lessons unlock and are checked in. */
export const LESSON_ORDER: LessonId[] = [
  "m0-safe",
  "m1-offer",
  "m2-package",
  "m3-outreach",
  "m4-sales",
  "m5-proposal",
  "m6-deliver",
  "m7-money",
  "l2-beyond",
];

function stub(
  id: LessonId,
  title: string,
  unlockText: string,
  decision: boolean,
): Lesson {
  return {
    id,
    title,
    minutes: 5,
    readOnly: !decision,
    unlockText,
    body: [`${title}. The full lesson is coming soon.`],
    keyPoints: ["Placeholder key point."],
    decision: decision
      ? {
          intro: "One decision before you move on.",
          fields: [{ id: "answer", label: "Your decision", placeholder: "Write it in one line" }],
          usedFor: "Hugin uses this in your next drafts.",
        }
      : undefined,
    links: [],
  };
}

export const LESSONS: Record<LessonId, Lesson> = {
  "m0-safe": stub("m0-safe", "Doing this safely next to your job", "Unlocks after Day 1", false),
  "m1-offer": stub("m1-offer", "Sharpen your offer", "Unlocks when you've messaged 2 people", true),
  "m2-package": stub("m2-package", "Package what you sell", "Unlocks when someone replies", true),
  "m3-outreach": stub("m3-outreach", "Find more people to ask", "Unlocks when your list runs low", true),
  "m4-sales": stub("m4-sales", "Run a calm first call", "Unlocks when a call is booked", true),
  "m5-proposal": stub("m5-proposal", "Write a proposal they can say yes to", "Unlocks after the call lesson", true),
  "m6-deliver": stub("m6-deliver", "Deliver the first project", "Unlocks when someone pays", true),
  "m7-money": stub("m7-money", "Money, invoices and taxes", "Unlocks after the delivery lesson", false),
  "l2-beyond": stub("l2-beyond", "From one client to a steady side business", "Unlocks after the money lesson", true),
};
