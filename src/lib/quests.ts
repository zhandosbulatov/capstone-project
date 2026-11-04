// The 30-day quest map: week 1 first reply → week 2 first calls → week 3 first proposal →
// week 4 first client. One quest a day, sized to the minutes the user chose in the quiz.

import type { BossKey, StatKey } from "./game";
import { formatUsd } from "./pricing";

export type DraftKind = "offer" | "outreach" | "follow-up" | "proposal";

type QuestTemplate = {
  /** May use {n}, {price} and {firstStep}. */
  title: string;
  text: string;
  stats: StatKey[];
  /** How many messages or items; a recovery quest asks for 1.5× this. */
  count?: number;
  /** Hugin can draft text for this quest. */
  draft?: DraftKind;
  /** This day is the week's boss check-in. */
  boss?: BossKey;
  /** Hugin's one-line comment. May use {minutes} and {n}. */
  hugin: string;
};

const TEMPLATES: QuestTemplate[] = [
  // Week 1 · First reply
  {
    title: "Write your offer and your first 5 names",
    text: "Edit the offer your coach drafted until you would say it out loud. Then write down five people who have seen your work.",
    stats: ["clarity", "reach"],
    draft: "offer",
    hugin: "One sentence about what you sell. Five people who know your work. That's the whole day.",
  },
  {
    title: "Send your first {n} messages",
    text: "Pick {n} people from your list. Your coach has drafted a message for each one. Edit, then send.",
    stats: ["reach"],
    count: 3,
    draft: "outreach",
    hugin: "{n} messages today. {minutes} minutes. The people on your list won't message themselves.",
  },
  {
    title: "{firstStep}",
    text: "Colleagues, ex-clients, friends who run something. Warm beats clever.",
    stats: ["reach"],
    hugin: "Everyone who has seen your work counts. Even the ones you haven't spoken to in a while.",
  },
  {
    title: "Sharpen your offer",
    text: "Read your offer to your coach. Cut every word a client wouldn't use.",
    stats: ["clarity"],
    draft: "offer",
    hugin: "If it needs a second sentence, it isn't finished.",
  },
  {
    title: "Send {n} more messages",
    text: "Next {n} names on your list. Ask how they're doing before you mention your offer.",
    stats: ["reach"],
    count: 3,
    draft: "outreach",
    hugin: "Same as Tuesday. It gets easier on the third one.",
  },
  {
    title: "Follow up with {n} people",
    text: "A short, friendly nudge to anyone who hasn't replied. No guilt, no pressure.",
    stats: ["reach", "consistency"],
    count: 3,
    draft: "follow-up",
    hugin: "Silence usually means busy, not no.",
  },
  {
    title: "Check your replies",
    text: "Look through your chats and inbox. If anyone replied, log it as your first result.",
    stats: ["reach"],
    boss: "w1",
    hugin: "One reply is this week's boss. Go and see who answered.",
  },
  // Week 2 · First calls
  {
    title: "Offer a 15-minute call to {n} people",
    text: "Message {n} warm contacts and offer a short call about their problem, not your service.",
    stats: ["reach", "persuasion"],
    count: 3,
    draft: "outreach",
    hugin: "Fifteen minutes is easy to say yes to. An hour isn't.",
  },
  {
    title: "Prepare 3 questions for your calls",
    text: "Write three questions that get a client talking about what's broken.",
    stats: ["persuasion"],
    hugin: "The person asking the questions runs the call.",
  },
  {
    title: "Send {n} more call invites",
    text: "Next {n} names. Same message, adjusted for each person.",
    stats: ["reach"],
    count: 3,
    draft: "outreach",
    hugin: "{n} more. You know the drill now.",
  },
  {
    title: "Say your call opener out loud",
    text: "Practise the first 30 seconds of a call until it sounds like you.",
    stats: ["persuasion"],
    hugin: "Nobody sounds good the first time. Do it three times.",
  },
  {
    title: "Ask {n} people for an introduction",
    text: "Ask {n} contacts if they know someone who needs your service.",
    stats: ["reach"],
    count: 3,
    draft: "outreach",
    hugin: "Your network has a network. Borrow it.",
  },
  {
    title: "Follow up with two time slots",
    text: "Reply to anyone who showed interest and offer two specific times.",
    stats: ["persuasion", "consistency"],
    count: 3,
    draft: "follow-up",
    hugin: "\"Tuesday at 6 or Thursday at 7\" gets booked. \"Sometime next week\" doesn't.",
  },
  {
    title: "Book your first call",
    text: "Confirm a time with one person and send the calendar invite.",
    stats: ["persuasion"],
    boss: "w2",
    hugin: "This week's boss is a call on the calendar. Not a maybe.",
  },
  // Week 3 · First proposal
  {
    title: "Run a call with the script",
    text: "Use the call script. Listen more than you talk. Agree on the next step before you hang up.",
    stats: ["persuasion"],
    hugin: "End every call with a next step and a date.",
  },
  {
    title: "Write your proposal at {price}",
    text: "Your coach drafts it from your offer. Name the price once, clearly, without apologising.",
    stats: ["pricingPower"],
    draft: "proposal",
    hugin: "{price}. Say it like a fact, because it is one.",
  },
  {
    title: "Practise naming your price",
    text: "Say your price out loud until it stops feeling strange.",
    stats: ["pricingPower"],
    hugin: "The pause after the price is theirs, not yours. Don't fill it.",
  },
  {
    title: "Send your first proposal",
    text: "Send the proposal to the person from your call. Ask when they'd like to start.",
    stats: ["pricingPower", "persuasion"],
    draft: "proposal",
    hugin: "Sent is better than perfect.",
  },
  {
    title: "Book or hold another call",
    text: "Message {n} people who showed interest and book one more conversation.",
    stats: ["persuasion", "reach"],
    count: 2,
    draft: "outreach",
    hugin: "Two proposals is the goal this week. One needs another call.",
  },
  {
    title: "Send your second proposal",
    text: "Same structure, adjusted to this client's problem.",
    stats: ["pricingPower"],
    draft: "proposal",
    hugin: "Second one takes half the time. Notice that.",
  },
  {
    title: "Log a proposal you sent",
    text: "Find the sent proposal or the message with your price, and log it.",
    stats: ["pricingPower"],
    boss: "w3",
    hugin: "This week's boss is a price, sent. Show me.",
  },
  // Week 4 · First client
  {
    title: "Follow up on your proposals",
    text: "A short check-in on each proposal. Ask if they have questions.",
    stats: ["persuasion", "consistency"],
    count: 2,
    draft: "follow-up",
    hugin: "Most deals close on the follow-up, not the proposal.",
  },
  {
    title: "Prepare for \"too expensive\" and \"not now\"",
    text: "Write a calm reply to each. Offer a smaller first step instead of a discount.",
    stats: ["pricingPower", "persuasion"],
    hugin: "A smaller scope keeps the price. A discount doesn't.",
  },
  {
    title: "Keep the pipeline warm: {n} new messages",
    text: "Message {n} new people from your list, so you're not waiting on one answer.",
    stats: ["reach"],
    count: 3,
    draft: "outreach",
    hugin: "Waiting on one person is how side projects stall.",
  },
  {
    title: "Offer a first step to anyone hesitating",
    text: "Suggest one small piece of the work at a fair price to start.",
    stats: ["pricingPower"],
    draft: "follow-up",
    hugin: "Small yes now, bigger yes later.",
  },
  {
    title: "Send the invoice or payment link",
    text: "When someone says yes, send a clear invoice the same day.",
    stats: ["pricingPower"],
    hugin: "Yes isn't a client until the invoice is out.",
  },
  {
    title: "Plan the delivery",
    text: "Write down dates, what you'll deliver and what you need from the client.",
    stats: ["reputation"],
    hugin: "Clients remember the start more than the finish. Make it tidy.",
  },
  {
    title: "Log your first payment",
    text: "Find the payment notification or the invoice marked paid, and log it.",
    stats: ["reputation"],
    boss: "w4",
    hugin: "This week's boss is money in, from outside your job.",
  },
  {
    title: "Ask for a review",
    text: "Send your client the review request when the work is delivered.",
    stats: ["reputation"],
    hugin: "Ask while they're happy. That's usually the day you deliver.",
  },
  {
    title: "Look back and set the next price",
    text: "Note what worked, who to ask next, and the price for your next client.",
    stats: ["consistency", "pricingPower"],
    hugin: "Thirty days. Write down what you'd tell yourself on day one.",
  },
];

export const QUEST_DAYS = TEMPLATES.length;

const RECOVERY_FACTOR = 1.5;

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
  boss?: BossKey;
  hugin: string;
  recovery: boolean;
};

/** After day 30 the last week's quests repeat. */
function templateFor(day: number): QuestTemplate {
  const index = day <= QUEST_DAYS ? day - 1 : 23 + ((day - 24) % 7);
  return TEMPLATES[index];
}

/** The stats a day's quest trains. */
export function questStats(day: number): StatKey[] {
  return templateFor(day).stats;
}

export function questForDay(
  day: number,
  ctx: QuestContext,
  options: { recovery?: boolean } = {},
): Quest {
  const template = templateFor(day);
  const recovery = options.recovery ?? false;
  const n = template.count
    ? recovery
      ? Math.ceil(template.count * RECOVERY_FACTOR)
      : template.count
    : 0;

  const fill = (text: string) =>
    text
      .replaceAll("{n}", String(n))
      .replaceAll("{price}", formatUsd(ctx.price))
      .replaceAll("{firstStep}", ctx.firstStep)
      .replaceAll("{minutes}", String(ctx.minutes));

  let title = fill(template.title);
  let text = fill(template.text);
  let hugin = fill(template.hugin);

  if (recovery) {
    title = `Recovery: ${title}`;
    if (!template.count) {
      text = `${text} Then send 2 extra messages to people on your list.`;
    }
    hugin = template.count
      ? `Yesterday didn't happen. Today can make up for it: ${n} messages, by tomorrow morning.`
      : "Yesterday didn't happen. Today can make up for it, by tomorrow morning.";
  }

  return {
    day,
    title,
    text,
    minutes: ctx.minutes,
    stats: template.stats,
    draft: template.draft,
    boss: template.boss,
    hugin,
    recovery,
  };
}
