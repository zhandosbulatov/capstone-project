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

export const QUEST_DONE_LINE = "Done. Same time tomorrow.";
export const SHIELD_USED_LINE = "A Streak Shield covered yesterday. The streak holds.";
export const STREAK_RESET_LINE = "The streak reset. The work you did didn't.";
export const STUDIO_OWNER_LINE = "Your side income hit your goal. That's not a side project anymore.";
