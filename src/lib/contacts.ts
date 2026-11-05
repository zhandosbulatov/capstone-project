// Pure updates to the contact list. The app provider calls these and passes any stage change
// to `recordStage`, so results, bosses and titles follow real events.

import type { Contact, ContactInput, NextStep, ReplyOutcome, Stage } from "./model";
import { stageRank } from "./next-step";

export type ContactUpdate = {
  contacts: Contact[];
  /** Set when a contact's stage changed. */
  change?: { from: Stage; to: Stage };
};

const NOTE_MAX = 280;

export function newContactId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function createContact(input: ContactInput, today: number, id = newContactId()): Contact {
  const note = input.note?.trim().slice(0, NOTE_MAX);
  return {
    id,
    name: input.name.trim(),
    relation: input.relation,
    ...(note ? { note } : {}),
    stage: "listed",
    addedDay: today,
    followUps: 0,
    awaitingAnswer: false,
  };
}

function patchOne(
  contacts: Contact[],
  id: string,
  patch: (c: Contact) => Contact,
): ContactUpdate {
  const before = contacts.find((c) => c.id === id);
  if (!before) return { contacts };
  const after = patch(before);
  return {
    contacts: contacts.map((c) => (c.id === id ? after : c)),
    change: before.stage !== after.stage ? { from: before.stage, to: after.stage } : undefined,
  };
}

/** Edit name, relation or note. Stage changes go through `setContactStage`. */
export function updateContact(
  contacts: Contact[],
  id: string,
  patch: Partial<Pick<Contact, "name" | "relation" | "note">>,
): Contact[] {
  return patchOne(contacts, id, (c) => ({ ...c, ...patch })).contacts;
}

export function setContactStage(
  contacts: Contact[],
  id: string,
  stage: Stage,
  today: number,
): ContactUpdate {
  return patchOne(contacts, id, (c) =>
    c.stage === stage ? c : { ...c, stage, followUps: 0, lastActionDay: today },
  );
}

/** What doing a step does to the contact it's about. Lessons, Day 1 and add-people change no contact. */
export function applyStepDone(
  contacts: Contact[],
  step: NextStep,
  today: number,
  sentText?: string,
): ContactUpdate {
  const sent = sentText?.trim() ? { lastSent: sentText.trim() } : {};
  switch (step.kind) {
    case "message":
      return patchOne(contacts, step.contactId, (c) => ({
        ...c,
        ...sent,
        stage: c.stage === "listed" ? "messaged" : c.stage,
        followUps: 0,
        lastActionDay: today,
      }));
    case "follow-up":
      return patchOne(contacts, step.contactId, (c) => ({
        ...c,
        ...sent,
        followUps: c.followUps + 1,
        lastActionDay: today,
      }));
    case "propose":
      return patchOne(contacts, step.contactId, (c) => ({
        ...c,
        ...sent,
        stage: c.stage === "call" ? "proposal" : c.stage,
        followUps: 0,
        lastActionDay: today,
      }));
    case "answer":
      return patchOne(contacts, step.contactId, (c) => ({
        ...c,
        ...sent,
        awaitingAnswer: false,
        followUps: 0,
        lastActionDay: today,
      }));
    default:
      return { contacts };
  }
}

/**
 * The user pasted a reply. The contact moves to the outcome's stage, never backwards, and waits
 * for an answer unless they said "not now".
 */
export function applyReply(
  contacts: Contact[],
  id: string,
  text: string,
  outcome: ReplyOutcome,
  today: number,
): ContactUpdate {
  return patchOne(contacts, id, (c) => {
    const stage: Stage =
      outcome === "not-now" || stageRank(outcome) > stageRank(c.stage) ? outcome : c.stage;
    return {
      ...c,
      stage,
      lastReply: text.trim() || c.lastReply,
      awaitingAnswer: outcome !== "not-now",
      followUps: 0,
      lastActionDay: today,
    };
  });
}

export function markAnswered(contacts: Contact[], id: string, today: number): Contact[] {
  return patchOne(contacts, id, (c) => ({ ...c, awaitingAnswer: false, lastActionDay: today })).contacts;
}
