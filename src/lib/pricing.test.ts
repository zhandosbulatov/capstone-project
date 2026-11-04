import { describe, expect, it } from "vitest";
import { formatUsd, startingPrice } from "./pricing";
import type { ExperienceKey, SkillKey } from "./quiz-data";

// Starting prices for every skill × experience, from the product spec.
const TABLE: Record<SkillKey, [number, number, number, number]> = {
  design: [300, 450, 600, 700],
  writing: [250, 350, 450, 550],
  marketing: [300, 400, 500, 650],
  finance: [200, 250, 350, 400],
  teaching: [200, 300, 350, 450],
  consult: [400, 600, 800, 950],
  data: [350, 500, 650, 800],
};

const YEARS: ExperienceKey[] = ["y1", "y2", "y3", "y4"];

describe("startingPrice", () => {
  for (const [skill, prices] of Object.entries(TABLE) as [SkillKey, number[]][]) {
    YEARS.forEach((years, i) => {
      it(`${skill} · ${years} → $${prices[i]}`, () => {
        expect(startingPrice(skill, years)).toBe(prices[i]);
      });
    });
  }

  it("rounds teaching's $275 base up to $300", () => {
    expect(startingPrice("teaching", "y2")).toBe(300);
  });
});

describe("formatUsd", () => {
  it("drops cents for whole dollars and keeps them otherwise", () => {
    expect(formatUsd(450)).toBe("$450");
    expect(formatUsd(39.99)).toBe("$39.99");
    expect(formatUsd(1000)).toBe("$1,000");
  });
});
