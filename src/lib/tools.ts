// Text for the free tools bosses unlock, and the First Client Kit, filled with the user's
// service and price. Hugin's AI drafts come on top of these; these always work offline.

import type { ToolKey } from "./game";
import { formatUsd } from "./pricing";
import { SKILLS, type QuizAnswers } from "./quiz-data";
import { startingPrice } from "./pricing";

export type KitToolKey = "outreachPack" | "pricingCalculator";
export type AnyToolKey = ToolKey | KitToolKey;

export type ToolSection = { heading: string; body: string };
export type ToolDoc = { title: string; intro: string; sections: ToolSection[] };

export const KIT_TOOLS: KitToolKey[] = ["outreachPack", "pricingCalculator"];

/** What the First Client Kit unlocks straight away: weeks 2–3 tools without waiting for bosses. */
export const KIT_UNLOCKS: AnyToolKey[] = ["outreachPack", "proposalTemplate", "pricingCalculator"];

export const TOOL_LABELS: Record<AnyToolKey, string> = {
  callScript: "Call script",
  proposalTemplate: "Proposal template",
  followUpScript: "Follow-up and closing script",
  reviewForm: "Review request form",
  outreachPack: "12 outreach messages",
  pricingCalculator: "Pricing calculator",
};

function context(answers: QuizAnswers, offer: string | null) {
  const skill = SKILLS[answers.skill];
  const price = startingPrice(answers.skill, answers.years);
  return {
    skill,
    price,
    priceText: `${formatUsd(price)} ${skill.unit}`,
    offer: offer?.trim() || `I help ${skill.who} get ${skill.result}.`,
  };
}

/** Prices for the next 5 clients: hold the start, then step up about 15% every two clients. */
export function nextFivePrices(price: number): number[] {
  const step = (factor: number) => Math.round((price * factor) / 50) * 50;
  return [price, price, step(1.15), step(1.15), step(1.3)];
}

export function toolDoc(tool: AnyToolKey, answers: QuizAnswers, offer: string | null): ToolDoc {
  const { skill, price, priceText, offer: offerLine } = context(answers, offer);

  switch (tool) {
    case "callScript":
      return {
        title: "Call script",
        intro: "Fifteen minutes. You ask, they talk, you agree on a next step.",
        sections: [
          {
            heading: "Open (30 seconds)",
            body: `"Thanks for making time. I'd like to understand how you handle this today, and then I'll tell you if I think I can help. Sound fair?"`,
          },
          {
            heading: "Three questions",
            body: `1. "What's not working right now with this?"\n2. "What have you tried so far?"\n3. "If this was sorted in a month, what would be different?"`,
          },
          {
            heading: "Your offer, in one sentence",
            body: offerLine,
          },
          {
            heading: "Next step",
            body: `"I'll send a short proposal by tomorrow: ${skill.deliverable}, for ${priceText}. Does Thursday work to go through it?"`,
          },
        ],
      };
    case "proposalTemplate":
      return {
        title: "Proposal template",
        intro: "One page. Name the price once, clearly.",
        sections: [
          { heading: "The problem", body: "[One sentence in their words, from the call.]" },
          { heading: "What you get", body: `${skill.service}: ${skill.deliverable}.` },
          { heading: "Timeline", body: "Start [date]. First draft in [N] days. Done by [date]." },
          { heading: "Price", body: `${priceText}. 50% to start, 50% on delivery.` },
          {
            heading: "Next step",
            body: "Reply \"yes\" and I'll send the invoice and a start date.",
          },
        ],
      };
    case "followUpScript":
      return {
        title: "Follow-up and closing script",
        intro: "Most deals close on the follow-up. Keep it short and easy to answer.",
        sections: [
          {
            heading: "Three days after the proposal",
            body: `"Hi [name], did the proposal make sense? Happy to adjust the scope if the timing is tight."`,
          },
          {
            heading: "If they say it's too expensive",
            body: `"Understood. We could start smaller: [one part of the work] first, then decide on the rest. The price for the full ${skill.service.toLowerCase()} stays ${formatUsd(price)}."`,
          },
          {
            heading: "If they say not now",
            body: `"No problem. Shall I check back in [two weeks]?"`,
          },
          {
            heading: "When they say yes",
            body: `"Great. I'll send the invoice today and we start on [date]."`,
          },
        ],
      };
    case "reviewForm":
      return {
        title: "Review request form",
        intro: "Send this the day you deliver, while they're happy.",
        sections: [
          {
            heading: "The message",
            body: `"Thanks for working with me. Would you answer three quick questions? It helps me a lot."`,
          },
          {
            heading: "The questions",
            body: "1. What was the problem before we worked together?\n2. What changed?\n3. Would you recommend me, and to whom?",
          },
        ],
      };
    case "outreachPack":
      return {
        title: "12 outreach messages",
        intro: `Written for your ${skill.service.toLowerCase()}. Edit the bits in brackets, then send.`,
        sections: OUTREACH.map((write, i) => ({
          heading: `Message ${i + 1}`,
          body: write(skill.who, skill.result, skill.deliverable),
        })),
      };
    case "pricingCalculator":
      return {
        title: "Pricing calculator",
        intro: "Start at your price, then step up as reviews come in.",
        sections: nextFivePrices(price).map((p, i) => ({
          heading: `Client ${i + 1}`,
          body: `${formatUsd(p)} ${skill.unit}${i === 2 ? " · first raise, once you have a review" : ""}`,
        })),
      };
  }
}

type OutreachWriter = (who: string, result: string, deliverable: string) => string;

const OUTREACH: OutreachWriter[] = [
  (who) => `"Hi [name], how's [their project] going? I've started helping ${who} on the side and thought of you."`,
  (_, result) => `"Hi [name], quick one: is getting ${result} on your list this quarter? I've got space for one project."`,
  (_, __, deliverable) => `"Hi [name], I'm doing a small package now: ${deliverable}. Would that help you, or someone you know?"`,
  () => `"Hi [name], I saw [something they posted]. Nice work. I do this kind of thing on the side now, if it's ever useful."`,
  (who) => `"Hi [name], do you know any ${who} who've complained about this lately? I can help."`,
  () => `"Hi [name], it's been a while. I'm taking on a couple of side projects. Fancy a 15-minute catch-up?"`,
  (_, result) => `"Hi [name], if ${result} would make your month easier, I'd love to hear what's in the way."`,
  () => `"Hi [name], no pitch, just a question: how do you handle [the problem] right now?"`,
  (_, __, deliverable) => `"Hi [name], I've put together ${deliverable} for someone like you. Want to see what it looks like?"`,
  () => `"Hi [name], you mentioned [the problem] last time we spoke. Still a headache?"`,
  (who) => `"Hi [name], I'm looking for one or two ${who} to work with this month. Anyone come to mind?"`,
  () => `"Hi [name], thanks again for the intro last time. If you meet anyone who needs this, I'd be grateful."`,
];
