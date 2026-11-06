// Hugin's personality and the user context every Gemini call gets. Shared by the API routes;
// holds no secrets.

import { HUGIN_NOTES, LESSONS } from "./curriculum";
import type { ResultType } from "./game";
import {
  RELATION_LABELS,
  RELATIONS,
  STAGE_LABELS,
  STAGES,
  type DraftKind,
  type LessonId,
  type Relation,
  type Stage,
} from "./model";

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
  note: 300,
  message: 600,
  field: 600,
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

/** The one person a draft is about, as the server accepts it. */
export type DraftContactInput = {
  name: string;
  relation: Relation;
  note?: string;
  stage?: Stage;
  lastSent?: string;
  lastReply?: string;
};

const RELATION_VOICE: Record<Relation, string> = {
  "ex-colleague":
    "Friendly and brief, the tone of someone catching up. Do not mention the old workplace unless the note does.",
  "colleague-friend": "Casual and warm, like a message to a friend who also knows your work.",
  friend: "Casual and personal, short. No business stiffness.",
  "past-client":
    "Familiar and grateful. They have seen the work first-hand, but only mention a specific project if the note does.",
  "local-business":
    "Polite, plain and respectful of their time. Talk about their business, not shared history.",
  other: "Neutral and polite. Introduce nothing you were not told.",
};

function contactSection(contact: DraftContactInput): string {
  const lines = [
    `- Name: ${contact.name}`,
    `- Relation: ${RELATION_LABELS[contact.relation]}`,
    `- Note from the user: ${contact.note ? `"${contact.note}"` : "none given. Do not mention any shared history."}`,
  ];
  if (contact.stage) lines.push(`- Where they are in the user's list: ${STAGE_LABELS[contact.stage]}`);
  if (contact.lastSent) lines.push(`- The last thing the user sent them: "${contact.lastSent}"`);
  if (contact.lastReply) lines.push(`- What they wrote back: "${contact.lastReply}"`);
  return `

The message is for one real person:
${lines.join("\n")}

How to write to them:
- Use their first name (${contact.name.trim().split(/\s+/)[0]}) naturally, never the full name in a greeting. Do not use any other name.
- Use the note only as the user wrote it. Don't add feelings, memories or details to it.
- Write from the relation. ${RELATION_VOICE[contact.relation]}
- Mention a shared memory, project or conversation only if the note gives one, and use only what the note says. Otherwise mention none.
- Do not guess what they do, what business they run or what they like. The user's list of warmest buyers is about the user, not about this person. Know only what the note says.
- Do not repeat the last message the user sent them.
- If the user's decisions include a proof line (one line of past work), you may use it once, lightly.
- Do not sign off with a name: the user adds their own.`;
}

export function huginSystemPrompt(ctx: HuginContext, contact?: DraftContactInput): string {
  return `You are Hugin, a raven and an AI coach inside the app AI Business Coach. You help an employed professional turn a skill they use at work into a paid side service and work toward a first paying client over about 12 weeks, 20 minutes a day, without quitting their job. The 12 weeks is a plan, never a guarantee: do not say or imply that a client or any income is certain by any date.

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
- Drafts are ready to send. Never output square brackets of any kind and never leave a placeholder. If you lack a detail, write around it. Never make up a real person's name.
- Plain English. US spelling.

About the user:
- Skill: ${ctx.skill}
- Service: ${ctx.service}
- Starting price: ${ctx.price}
- Who it's for: ${ctx.who}
- What the client gets: ${ctx.deliverable}
- Warmest first buyers: ${ctx.firstBuyers}
- Their offer, in their words: ${ctx.offer}
- Day ${ctx.day}. Current title: ${ctx.title}. Today's quest: ${ctx.questTitle}.${ctx.decisions ? `
- Decisions from their lessons:
${ctx.decisions}` : ""}${contact ? contactSection(contact) : ""}`;
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

/** Tasks when no contact is given: 3 generic versions, as before. */
export const DRAFT_TASKS: Record<DraftKind, string> = {
  offer:
    "Write 3 versions of the user's offer, each one sentence a client would understand without context: who it's for, what they get, the price.",
  outreach:
    "Write 3 short warm messages (2–4 sentences each) to people who have seen the user's work. Open with them, not the offer. Mention the service lightly and end with an easy question. No hard sell. Never state a memory, project or conversation you share with them.",
  "follow-up":
    "Write 3 short, friendly follow-up messages (1–3 sentences each) for someone who hasn't replied, or who showed interest but went quiet. No guilt, no pressure, one easy next step.",
  proposal:
    "Write 3 short proposal emails (4–6 sentences each) for a client after a call: their problem in one line, what they get, a simple timeline, the price stated once and plainly, and how to say yes.",
  reply:
    "Write 3 short answers (1–3 sentences each) to the reply the person sent. Answer what they asked, then suggest one easy next step.",
  kickoff:
    "Write 3 short kickoff messages (2–4 sentences each) to a client who just said yes: what happens next, what you need from them, the first date.",
  "review-request":
    "Write 3 short messages (2–3 sentences each) asking a happy client, on delivery day, for a 2–3 sentence review of the work.",
  referral:
    "Write 3 short messages (2–3 sentences each) asking a happy client whether they know one person who might need the same help.",
};

/** Tasks for one named contact. `draftInstruction` puts "Write one message:" in front. */
export const CONTACT_TASKS: Record<DraftKind, string> = {
  offer:
    "the user's offer in one sentence this person would understand without context: who it's for, what they get, the price.",
  outreach:
    "a first message of 2–4 sentences. Open with them, not the offer. Mention the service lightly. End with an easy question they can answer in a few words.",
  "follow-up":
    'a follow-up of 1–3 sentences to someone who has gone quiet. No guilt, no pressure, no "just checking in". One easy next step.',
  reply:
    "an answer to what they wrote back (shown above). Answer what they asked, then move them one step on. If they asked about price or details, give the price (the package price from the user's decisions if there is one, otherwise the starting price) and always end by suggesting a 15-minute call to go through the details. If they are interested, offer two concrete times to talk, using day names and no invented dates. If they said not now, stay warm and ask if it is OK to check back in a few weeks. 1–3 sentences.",
  proposal:
    "a proposal email of 4–6 sentences after a call. Their problem in one line, what they get (use the package from the user's decisions if there is one), the timeline, the price stated once and plainly, the payment terms if the decisions give them, and how to say yes. Do not invent details of the call.",
  kickoff:
    "a short message to a new client: what happens next, what you need from them, and the first date. If you were not given a date, ask which day this week suits them for the first step.",
  "review-request":
    "a short message sent on delivery day asking for a review of 2–3 sentences. Make it easy by saying what the review could cover. No pressure.",
  referral:
    'a short message to a happy client or friend: "do you know one person who needs this kind of help?" Make it easy to say no.',
};

/** The user turn for a draft call. With a contact the default is one message. */
export function draftInstruction(kind: DraftKind, count: number, hasContact: boolean): string {
  if (!hasContact) return `${DRAFT_TASKS[kind]} Return them as JSON.`;
  const lead = count === 1 ? "Write one message: " : `Write ${count} different versions of: `;
  return `${lead}${CONTACT_TASKS[kind]} Return ${count === 1 ? "it" : "them"} as JSON.`;
}

/** Added to the instruction for the one retry after a draft came back with brackets. */
export const STRICT_RETRY =
  " Your last attempt contained square brackets. Do not output [ or ] anywhere. Use only the details you were given and write around anything missing.";

export function hasBrackets(text: string): boolean {
  return /[[\]]/.test(text);
}

/**
 * Removes every sentence that contains `[` or `]`, keeping line breaks. Returns "" when nothing
 * is left.
 */
export function stripBracketSentences(text: string): string {
  const lines = text.split("\n").map((line) =>
    line
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !hasBrackets(sentence))
      .join(" ")
      .trim(),
  );
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type DraftRequestParsed =
  | {
      ok: true;
      kind: DraftKind | "review";
      context: HuginContext;
      contact?: DraftContactInput;
      lesson?: { id: LessonId; fields: Record<string, string> };
      count: number;
    }
  | { ok: false; error: string };

export function parseContact(raw: unknown): DraftContactInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = clip(r.name, LIMITS.short);
  if (!name) return null;
  return {
    name,
    relation: RELATIONS.find((x) => x === r.relation) ?? "other",
    note: clip(r.note, LIMITS.note) || undefined,
    stage: STAGES.find((x) => x === r.stage),
    lastSent: clip(r.lastSent, LIMITS.message) || undefined,
    lastReply: clip(r.lastReply, LIMITS.message) || undefined,
  };
}

/** A lesson that has a decision, with only that lesson's own non-empty fields. */
export function parseLesson(raw: unknown): { id: LessonId; fields: Record<string, string> } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { id?: unknown; fields?: unknown };
  const id = (Object.keys(LESSONS) as LessonId[]).find((x) => x === r.id);
  const decision = id ? LESSONS[id].decision : undefined;
  if (!id || !decision || !r.fields || typeof r.fields !== "object") return null;
  const given = r.fields as Record<string, unknown>;
  const fields: Record<string, string> = {};
  for (const f of decision.fields) {
    const value = clip(given[f.id], LIMITS.field);
    if (value) fields[f.id] = value;
  }
  return Object.keys(fields).length ? { id, fields } : null;
}

/** Validates a POST /api/draft body. Errors are ready to send with status 400. */
export function parseDraftRequest(body: unknown): DraftRequestParsed {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const kind = b.kind === "review" ? "review" : DRAFT_KINDS.find((k) => k === b.kind);
  const context = parseContext(b.context);
  if (!kind || !context) return { ok: false, error: "I need to know what to draft." };

  if (kind === "review") {
    const lesson = parseLesson(b.lesson);
    if (!lesson) return { ok: false, error: "I need the lesson decision to review." };
    return { ok: true, kind, context, lesson, count: 1 };
  }

  let contact: DraftContactInput | undefined;
  if (b.contact !== undefined && b.contact !== null) {
    const parsed = parseContact(b.contact);
    if (!parsed) return { ok: false, error: "I need the name of the person this is for." };
    contact = parsed;
  }
  const lesson = b.lesson === undefined ? undefined : (parseLesson(b.lesson) ?? undefined);
  const wanted = Math.round(Number(b.count));
  const count = Number.isFinite(wanted) && wanted >= 1 ? Math.min(3, wanted) : contact ? 1 : 3;
  return { ok: true, kind, context, contact, lesson, count };
}

/** What Hugin is told when it reviews a lesson decision. */
export function reviewInstruction(lesson: { id: LessonId; fields: Record<string, string> }): string {
  const def = LESSONS[lesson.id];
  const decision = def.decision;
  const fieldLines = (decision?.fields ?? [])
    .map((f) => `- ${f.id} (${f.label}): ${lesson.fields[f.id] || "(left empty)"}`)
    .join("\n");
  return `The user just wrote a decision in the lesson "${def.title}".
Goal of the decision: ${decision?.intro ?? def.title} ${decision?.usedFor ?? ""}

Their answers:
${fieldLines}

Guidance for this lesson. Follow it, never quote it or mention it:
${HUGIN_NOTES[lesson.id]}

Give at most 3 pieces of feedback, each one sentence, specific to what they wrote. Then give an improved version of each field, in the user's own voice, the same length or shorter. Keep every fact they gave and add none. No square brackets. Return JSON with "feedback" and "improved" (one key per field id above).`;
}

/** JSON schema for a review: one string per field of the lesson. */
export function reviewSchema(lessonId: LessonId) {
  const ids = (LESSONS[lessonId].decision?.fields ?? []).map((f) => f.id);
  return {
    type: "object",
    properties: {
      feedback: { type: "array", items: { type: "string" }, maxItems: 3 },
      improved: {
        type: "object",
        properties: Object.fromEntries(ids.map((id) => [id, { type: "string" }])),
        required: ids,
      },
    },
    required: ["feedback", "improved"],
  };
}

export type ReviewResult = { feedback: string[]; improved: Record<string, string> };

/** Cleans a model review: at most 3 feedback lines, only known fields, no bracketed sentences. */
export function cleanReview(raw: unknown, lessonId: LessonId): ReviewResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { feedback?: unknown; improved?: unknown };
  const feedback = (Array.isArray(r.feedback) ? r.feedback : [])
    .filter((x): x is string => typeof x === "string")
    .map(stripBracketSentences)
    .filter(Boolean)
    .slice(0, 3);
  const given = (r.improved && typeof r.improved === "object" ? r.improved : {}) as Record<string, unknown>;
  const improved: Record<string, string> = {};
  for (const f of LESSONS[lessonId].decision?.fields ?? []) {
    const value = given[f.id];
    if (typeof value !== "string") continue;
    const clean = stripBracketSentences(value);
    if (clean) improved[f.id] = clean;
  }
  return feedback.length || Object.keys(improved).length ? { feedback, improved } : null;
}

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
