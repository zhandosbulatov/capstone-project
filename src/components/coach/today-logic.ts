// Pure rules for the Today screen: pipeline counts, draft checks and step wording.

import type { Contact, DraftKind, NextStep } from "../../lib/model";
import { RELATION_LABELS } from "../../lib/model";
import { reached } from "../../lib/next-step";
import type { DraftContact } from "../../lib/hugin-client";

export type PipelineCounts = { listed: number; messaged: number; replied: number; paid: number };

/**
 * The Client #1 funnel. "listed" is everyone on the list; "messaged" is everyone at `messaged` or
 * later (and "not-now"); "replied" is `replied`, `call`, `proposal` and `paid`.
 */
export function pipelineCounts(contacts: readonly Contact[]): PipelineCounts {
  return {
    listed: contacts.length,
    messaged: contacts.filter((c) => c.stage === "not-now" || reached(c, "messaged")).length,
    replied: contacts.filter((c) => reached(c, "replied")).length,
    paid: contacts.filter((c) => c.stage === "paid").length,
  };
}

/** Drafts never contain a bracket (a placeholder the user would have to fill in). */
export function hasBracket(text: string): boolean {
  return /[[\]]/.test(text);
}

/** The first draft without brackets, or null. */
export function firstCleanDraft(drafts: readonly string[]): string | null {
  return drafts.map((d) => d.trim()).find((d) => d && !hasBracket(d)) ?? null;
}

/** Steps that carry a Hugin draft, and the draft kind for each. */
export function draftKindFor(step: NextStep): DraftKind | null {
  switch (step.kind) {
    case "message":
      return "outreach";
    case "follow-up":
      return "follow-up";
    case "answer":
      return "reply";
    case "propose":
      return "proposal";
    default:
      return null;
  }
}

export function contactIdOf(step: NextStep): string | undefined {
  return "contactId" in step ? step.contactId : undefined;
}

export function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** "Message Sarah", "Send Sarah your proposal at $450". */
export function stepHeading(step: NextStep, name: string, price: string): string {
  const first = firstWord(name);
  switch (step.kind) {
    case "message":
      return `Message ${first}`;
    case "follow-up":
      return `Follow up with ${first}`;
    case "answer":
      return `Answer ${first}`;
    case "propose":
      return `Send ${first} your proposal at ${price}`;
    default:
      return "";
  }
}

export function relationLine(contact: Pick<Contact, "relation" | "note">): string {
  const label = RELATION_LABELS[contact.relation];
  return contact.note?.trim() ? `${label} · ${contact.note.trim()}` : label;
}

/** What the draft request sends for one contact. */
export function draftContactFor(contact: Contact, override?: Partial<DraftContact>): DraftContact {
  const { name, relation, note, stage, lastSent, lastReply } = contact;
  return { name, relation, note, stage, lastSent, lastReply, ...override };
}
