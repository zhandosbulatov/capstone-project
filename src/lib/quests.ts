// Day 1 is the only quest left. From day 2 the app chooses the step from the user's real
// pipeline (see next-step.ts). `questForDay` stays for callers that still ask for a quest.

import type { BossKey, StatKey } from "./game";
import type { DraftKind } from "./model";
import { formatUsd } from "./pricing";

/** Moved to model.ts; re-exported so old imports keep working. */
export type { DraftKind } from "./model";

type QuestTemplate = {
  /** May use {price} and {firstStep}. */
  title: string;
  text: string;
  stats: StatKey[];
  /** Hugin can draft text for this quest. */
  draft?: DraftKind;
  /** Hugin's one-line comment. May use {minutes}. */
  hugin: string;
};

const DAY_ONE: QuestTemplate = {
  title: "Write your offer and your first 5 names",
  text: "Edit the offer your coach drafted until you would say it out loud. Then write down five people who have seen your work.",
  stats: ["clarity", "reach"],
  draft: "offer",
  hugin: "One sentence about what you sell. Five people who know your work. That's the whole day.",
};

/** Used for any day after day 1, so callers always get a quest. */
const GENERIC: QuestTemplate = {
  title: "{firstStep}",
  text: "Take today's step. Warm beats clever.",
  stats: ["reach"],
  hugin: "One step. {minutes} minutes. Then you're done for the day.",
};

export const QUEST_DAYS = 1;

export type QuestContext = {
  minutes: number;
  price: number;
  firstStep: string;
};

export type Quest = {
  day: number;
  title: string;
  text: string;
  minutes: number;
  stats: StatKey[];
  draft?: DraftKind;
  /** @deprecated Quests no longer carry a boss check-in. Always undefined. */
  boss?: BossKey;
  hugin: string;
  /** @deprecated There are no recovery quests. Always false. */
  recovery: boolean;
};

/** The stats a day's quest trains. */
export function questStats(day: number): StatKey[] {
  return (day === 1 ? DAY_ONE : GENERIC).stats;
}

/** `options` is ignored; it stays so old callers compile. */
export function questForDay(
  day: number,
  ctx: QuestContext,
  options: { recovery?: boolean } = {},
): Quest {
  void options;
  const template = day === 1 ? DAY_ONE : GENERIC;
  const fill = (text: string) =>
    text
      .replaceAll("{price}", formatUsd(ctx.price))
      .replaceAll("{firstStep}", ctx.firstStep)
      .replaceAll("{minutes}", String(ctx.minutes));

  return {
    day,
    title: fill(template.title),
    text: fill(template.text),
    minutes: ctx.minutes,
    stats: template.stats,
    draft: template.draft,
    hugin: fill(template.hugin),
    recovery: false,
  };
}
