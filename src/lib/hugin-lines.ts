// Hugin's fixed lines for growth moments. Calm, dry, short. Never an exclamation mark.

import type { BossKey } from "./game";

const LEVEL_LINES = [
  "Level {n}. Quietly impressive.",
  "Level {n}. Nobody at work knows yet.",
  "Level {n}. Keep the pace, not the celebration.",
];

export function levelLine(level: number): string {
  return LEVEL_LINES[level % LEVEL_LINES.length].replace("{n}", String(level));
}

export const BOSS_LINES: Record<BossKey, string> = {
  w1: "Someone answered. That's the hardest message you'll send this month.",
  w2: "A call on the calendar. Now it's a conversation, not a list.",
  w3: "A price, sent. Most people never get this far.",
  w4: "Someone paid you for your work. Outside your job. Note the date.",
};

/** One or two lines under the Today step card, by step kind. Never an exclamation mark. */
export const STEP_LINES: Record<
  "message" | "follow-up" | "answer" | "propose" | "lesson" | "add-people" | "done",
  string[]
> = {
  message: [
    "One message. It doesn't need to be clever, it needs to be sent.",
    "They know your work. That's the whole introduction.",
  ],
  "follow-up": [
    "A second note is normal. Silence usually means busy, not no.",
    "Short and friendly. No guilt in it.",
  ],
  answer: [
    "Someone answered. Reply while it's warm.",
    "Keep it short. Ask one thing.",
  ],
  propose: [
    "A price, in writing. Plain and calm.",
    "They asked for a call because they're interested. Make the next step easy.",
  ],
  lesson: ["Two minutes of reading. Then back to real people.", "Read it now, use it this week."],
  "add-people": [
    "The list thins out. Add one more person who has seen your work.",
    "One name is enough for today.",
  ],
  done: ["Done. Same time tomorrow.", "That counts. The rest can wait."],
};

export function stepLine(kind: keyof typeof STEP_LINES, day: number): string {
  const lines = STEP_LINES[kind];
  return lines[day % lines.length];
}

export const QUEST_DONE_LINE = "Done. Same time tomorrow.";
export const SHIELD_USED_LINE = "A Streak Shield covered yesterday. The streak holds.";
export const STREAK_RESET_LINE = "The streak reset. The work you did didn't.";
export const STUDIO_OWNER_LINE = "Your side income hit your goal. That's not a side project anymore.";
