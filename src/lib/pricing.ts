import { EXPERIENCE, SKILLS, type ExperienceKey, type SkillKey } from "./quiz-data";

const MIN_PRICE = 100;
const ROUND_TO = 50;

/** Starting price: base × experience multiplier, rounded to the nearest $50, never below $100. */
export function startingPrice(skill: SkillKey, years: ExperienceKey): number {
  const raw = SKILLS[skill].basePrice * EXPERIENCE[years].multiplierPct;
  const rounded = Math.round(raw / (ROUND_TO * 100)) * ROUND_TO;
  return Math.max(MIN_PRICE, rounded);
}

/** "$450" */
export function formatUsd(amount: number): string {
  const cents = Number.isInteger(amount) ? 0 : 2;
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: cents,
    maximumFractionDigits: cents,
  })}`;
}
