import { describe, expect, it } from "vitest";
import { completeRows, day1Ready, firstName } from "./today-day1";

const full = Array.from({ length: 5 }, (_, i) => ({ name: `P${i}`, relation: "friend" as const }));
const offer = "I redesign sales decks";

describe("day 1 rules", () => {
  it("needs 5 names with relations and an offer over 10 chars", () => {
    expect(day1Ready(offer, full)).toBe(true);
  });
  it("rejects a missing relation", () => {
    const rows = [...full.slice(0, 4), { name: "X" }];
    expect(day1Ready(offer, rows)).toBe(false);
    expect(completeRows(rows)).toBe(4);
  });
  it("rejects a blank name or a short offer", () => {
    expect(day1Ready(offer, [...full.slice(0, 4), { name: " ", relation: "friend" as const }])).toBe(false);
    expect(day1Ready("short", full)).toBe(false);
    expect(day1Ready("exactly 10", full)).toBe(false);
  });
  it("takes the first name", () => {
    expect(firstName("  Anna  Lee")).toBe("Anna");
    expect(firstName("")).toBe("");
  });
});
