// ?demo=1 only: the people and replies the demo controls add. Pure functions, no React.

import { createContact } from "./contacts";
import type { Contact, ContactInput, Stage } from "./model";

type Seed = ContactInput & {
  stage: Stage;
  /** Days before today of the last action. */
  ago?: number;
  lastSent?: string;
  lastReply?: string;
  awaitingAnswer?: boolean;
};

const SEEDS: Seed[] = [
  {
    name: "Maya Collins",
    relation: "ex-colleague",
    note: "We shared a team for two years. She now runs marketing at a dental group.",
    stage: "listed",
  },
  {
    name: "Tom Reyes",
    relation: "friend",
    note: "Runs a coffee cart and keeps asking me about his logo.",
    stage: "listed",
  },
  {
    name: "Priya Shah",
    relation: "past-client",
    note: "I did a freelance job for her bakery last spring.",
    stage: "messaged",
    ago: 4,
    lastSent: "Hi Priya, I've started taking on a few small projects outside work. Would it be useful to talk about the bakery?",
  },
  {
    name: "Daniel Okafor",
    relation: "local-business",
    note: "Owns the bike shop near my flat. Opening a second shop this year.",
    stage: "replied",
    ago: 1,
    lastSent: "Hi Daniel, I help local shops with this kind of work. Happy to share a few ideas for the new shop.",
    lastReply: "Sounds interesting — how much would that be?",
    awaitingAnswer: true,
  },
  {
    name: "Sofia Marin",
    relation: "colleague-friend",
    note: "Left for a startup in March. Said they need help soon.",
    stage: "call",
    ago: 2,
  },
];

/** Five people at mixed stages: 2 listed, 1 messaged 4 days ago, 1 replied, 1 at call. */
export function demoContacts(today: number): Contact[] {
  return SEEDS.map(({ stage, ago, lastSent, lastReply, awaitingAnswer, ...input }, i) => ({
    ...createContact(input, today - (ago ?? 0), `demo${i + 1}`),
    stage,
    ...(ago !== undefined ? { lastActionDay: today - ago } : {}),
    ...(lastSent ? { lastSent } : {}),
    ...(lastReply ? { lastReply } : {}),
    awaitingAnswer: awaitingAnswer ?? false,
  }));
}

/** The person who has waited longest for an answer to a first message, or undefined. */
export function oldestMessaged(contacts: Contact[]): Contact | undefined {
  return contacts
    .filter((c) => c.stage === "messaged")
    .sort((a, b) => (a.lastActionDay ?? a.addedDay) - (b.lastActionDay ?? b.addedDay))[0];
}

export const DEMO_REPLY = "Good to hear from you. What would that involve?";
