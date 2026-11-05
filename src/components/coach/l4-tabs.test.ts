import { describe, expect, it } from "vitest";
import { createContact } from "../../lib/contacts";
import { createGame, recordResult } from "../../lib/game";
import type { Contact, Stage } from "../../lib/model";
import { courseMap, groupContacts, lastActionText, milestoneDays, nextTitle, onePageSections } from "./l4-helpers";

const make = (name: string, stage: Stage): Contact => ({
  ...createContact({ name, relation: "friend" }, 1, name),
  stage,
});

describe("people grouping", () => {
  it("orders groups and hides empty ones", () => {
    const groups = groupContacts([make("a", "listed"), make("b", "replied"), make("c", "not-now")]);
    expect(groups.map((g) => g.label)).toEqual(["Replied", "On your list", "Not now"]);
  });

  it("describes the last action in plain words", () => {
    const c = { ...make("a", "messaged"), lastActionDay: 2 };
    expect(lastActionText(c, 5)).toBe("messaged 3 days ago");
    expect(lastActionText(c, 3)).toBe("messaged yesterday");
    expect(lastActionText({ ...make("b", "listed") }, 1)).toBe("added today");
  });
});

describe("progress helpers", () => {
  it("lists milestones with days or null", () => {
    const game = recordResult(createGame(), "firstReply", "self").state;
    const days = milestoneDays(game);
    expect(days.map((m) => m.label)).toEqual(["First reply", "First call", "First proposal", "First client"]);
    expect(days[0].day).not.toBeNull();
    expect(days[1].day).toBeNull();
  });

  it("finds the next title", () => {
    expect(nextTitle("employee")?.label).toBe("Side Starter");
    expect(nextTitle("consultant")).toBeNull();
  });
});

describe("course map and one page", () => {
  const input = { offer: null, contacts: [], lessons: {} };

  it("lists all nine lessons and locks them before day 1 is done", () => {
    const map = courseMap(input);
    expect(map).toHaveLength(9);
    expect(map.every((m) => m.state === "locked")).toBe(true);
  });

  it("marks finished lessons done with their day", () => {
    const map = courseMap({ ...input, lessons: { "m0-safe": { readDay: 2 } } });
    expect(map[0]).toMatchObject({ state: "done", day: 2 });
  });

  it("shows only decided fields, labelled from the curriculum", () => {
    expect(onePageSections({})).toEqual([]);
    const sections = onePageSections({ "m1-offer": { decision: { answer: " Logo kit " }, decidedDay: 3 } });
    expect(sections).toHaveLength(1);
    expect(sections[0].rows).toEqual([{ label: "Your decision", value: "Logo kit" }]);
  });
});
