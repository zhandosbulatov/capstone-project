// Hugin's personality and the user context every Gemini call gets. Shared by the API routes;
// holds no secrets.

import type { ResultType } from "./game";
import type { DraftKind } from "./model";

/**
 * What Hugin knows about the user. Built in the browser from saved state. Never includes contacts:
 * a draft request sends the one contact it is about separately.
 */
export type HuginContext = {
  skill: string;
  service: string;
  /** "$450 per project" */
  price: string;
  who: string;
  deliverable: string;
  firstBuyers: string;
  offer: string;
  day: number;
  week: number;
  questTitle: string;
  title: string;
  /** Short text summary of the saved lesson decisions. `parseContext` always sets it (maybe ""). */
  decisions?: string;
};

const LIMITS = {
  short: 80,
  long: 400,
  decisions: 1200,
};

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max).trim() : "";
}

/** Accepts only the expected fields, each length-limited, from an untrusted request body. */
export function parseContext(raw: unknown): HuginContext | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const ctx: HuginContext = {
    skill: clip(r.skill, LIMITS.short),
    service: clip(r.service, LIMITS.short),
    price: clip(r.price, LIMITS.short),
    who: clip(r.who, LIMITS.short),
    deliverable: clip(r.deliverable, LIMITS.long),
    firstBuyers: clip(r.firstBuyers, LIMITS.long),
    offer: clip(r.offer, LIMITS.long),
    day: Math.max(1, Math.min(365, Number(r.day) || 1)),
    week: Math.max(1, Math.min(4, Number(r.week) || 1)),
    questTitle: clip(r.questTitle, LIMITS.short),
    title: clip(r.title, LIMITS.short),
    decisions: clip(r.decisions, LIMITS.decisions),
  };
  return ctx.service && ctx.price ? ctx : null;
}

export function huginSystemPrompt(ctx: HuginContext): string {
  return `You are Hugin, a raven and an AI coach inside the app AI Business Coach. You help an employed professional turn a skill they use at work into a paid side service and land a first paying client in 30 days, about 20 minutes a day, without quitting their job.

Personality: calm, dry humour, short sentences. Never cheesy. Never shout. Never use exclamation marks. Never use emoji. Sound like a sharp, kind friend, not a marketer.

Tone examples:
- "Three messages today. Twenty minutes. The people on your list won't message themselves."
- "Level 4. Quietly impressive."
- "That's a lovely screenshot of a lunch menu. I need the reply."
- "Someone paid you for your work. Outside your job. Note the date."

Rules:
- Never promise or estimate income. Talk about steps, replies, calls and clients, not money earned.
- No medical, legal, tax or financial advice. If asked, say it's one for a professional and move on.
- Never invent facts about the user, their clients or their results. Never claim a past conversation, project or shared history with the recipient that you weren't told about.
- Messages the user will send go to people who already know their work. They send help, not a pitch.
- Use [name] and other [brackets] for details you don't know. Never make up a real person's name.
- Plain English. US spelling.

About the user:
- Skill: ${ctx.skill}
- Service: ${ctx.service}
- Starting price: ${ctx.price}
- Who it's for: ${ctx.who}
- What the client gets: ${ctx.deliverable}
- Warmest first buyers: ${ctx.firstBuyers}
- Their offer, in their words: ${ctx.offer}
- Day ${ctx.day} of 30, week ${ctx.week}. Current title: ${ctx.title}. Today's quest: ${ctx.questTitle}.${ctx.decisions ? `
- Decisions from their lessons:
${ctx.decisions}` : ""}`;
}

/**
 * Parse a JSON reply. Some models wrap the JSON in a sentence despite JSON mode, so fall back to
 * the first {...} block in the text.
 */
export function parseJsonReply(text: string | undefined): unknown {
  const raw = text ?? "";
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON in reply: ${raw.slice(0, 120)}`);
    return JSON.parse(match[0]);
  }
}

export const DRAFT_KINDS: DraftKind[] = [
  "offer",
  "outreach",
  "follow-up",
  "proposal",
  "reply",
  "kickoff",
  "review-request",
  "referral",
];

export const DRAFT_TASKS: Record<DraftKind, string> = {
  offer:
    "Write 3 versions of the user's offer, each one sentence a client would understand without context: who it's for, what they get, the price.",
  outreach:
    "Write 3 short warm messages (2–4 sentences each) to people who have seen the user's work. Open with them, not the offer. Mention the service lightly and end with an easy question. No hard sell. Never state a memory, project or conversation you share with them; if one would help, leave a bracket for the user to fill, like [something you worked on together].",
  "follow-up":
    "Write 3 short, friendly follow-up messages (1–3 sentences each) for someone who hasn't replied, or who showed interest but went quiet. No guilt, no pressure, one easy next step.",
  proposal:
    "Write 3 short proposal emails (4–6 sentences each) for a client after a call: their problem in one line, what they get, a simple timeline, the price stated once and plainly, and how to say yes.",
  // Base stubs. Lane L1 writes the real tasks.
  reply:
    "Write 3 short answers (1–3 sentences each) to the reply the person sent. Answer what they asked, then suggest one easy next step.",
  kickoff:
    "Write 3 short kickoff messages (2–4 sentences each) to a client who just said yes: thank them, confirm what happens first and when.",
  "review-request":
    "Write 3 short messages (2–3 sentences each) asking a happy client for a one-line review of the work.",
  referral:
    "Write 3 short messages (2–3 sentences each) asking a happy client whether they know one person who might need the same help.",
};

export const PROOF_RULES: Record<ResultType, string> = {
  firstReply: "a reply from another person in a chat, email, DM or text thread, responding to the user",
  callBooked: "a calendar invite, booking confirmation or message agreeing a specific call time",
  callHeld: "a call log, finished video call, or calendar event for a call that has already happened",
  proposalSent: "a sent proposal, quote or message that states a price for the user's work",
  clientPaid: "a payment notification, bank or payment-app receipt, or an invoice marked paid",
  reviewReceived: "a written review, testimonial or recommendation about the user's work",
  referralReceived: "a message introducing or recommending the user to someone new",
  priceRaised: "a proposal, quote or price list showing a price for the user's service",
};
