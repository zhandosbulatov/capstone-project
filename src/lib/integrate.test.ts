import { describe, expect, it } from "vitest";
import { HUGIN_NOTES } from "./curriculum";
import { reviewInstruction } from "./hugin";
import { decisionsSummary } from "./next-step";

describe("joins between lanes", () => {
  it("puts the lesson's hidden notes into the review prompt", () => {
    const text = reviewInstruction({ id: "m2-package", fields: { price: "450" } });
    expect(text).toContain(HUGIN_NOTES["m2-package"]);
  });

  it("sends the key decisions to Hugin first, labelled, with the real field ids", () => {
    const summary = decisionsSummary({
      "m1-offer": { decision: { offer: "Brand kits for cafés", buyer: "Café owners", proof: "12 kits" } },
      "m2-package": {
        decision: { scope: "Logo and menu", notIncluded: "Printing", price: "$450", terms: "Half up front" },
      },
      "m3-outreach": { decision: { groups: "Local café owners" } },
      "m4-sales": { decision: { q1: "What's slow right now?", close: "Shall I send a proposal by Friday?" } },
      "m5-proposal": { decision: { changes: "Two rounds", ownership: "Client owns it", cancellation: "Deposit kept" } },
    });
    for (const text of [
      "Brand kits for cafés",
      "Café owners",
      "12 kits",
      "Logo and menu",
      "Printing",
      "$450",
      "Half up front",
      "Shall I send a proposal by Friday?",
      "Two rounds",
      "Client owns it",
      "Deposit kept",
    ]) {
      expect(summary.indexOf(text)).toBeGreaterThan(-1);
      expect(summary.indexOf(text)).toBeLessThan(summary.indexOf("Local café owners"));
    }
    expect(summary).toContain("Payment terms: Half up front");
  });
});
