// Pure helpers for the People and Progress tabs. Relative imports only, so Vitest can load it.

import { TITLE_ORDER, TITLES, type GameState, type ResultType, type TitleKey } from "../../lib/game";
import type { Contact, Stage } from "../../lib/model";

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
