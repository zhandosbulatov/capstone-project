import { describe, expect, it } from "vitest";
import type { LessonId } from "./model";
import { HUGIN_NOTES, LESSON_ORDER, LESSONS } from "./curriculum";

const ALL_IDS: LessonId[] = [
  "m0-safe",
  "m1-offer",
  "m2-package",
  "m3-outreach",
  "m4-sales",
  "m5-proposal",
  "m6-deliver",
  "m7-money",
  "l2-beyond",
];
const READ_ONLY: LessonId[] = ["m0-safe", "m7-money"];

describe("curriculum", () => {
  it("has all 9 lessons in order m0 to l2", () => {
    expect(LESSON_ORDER).toEqual(ALL_IDS);
    expect(Object.keys(LESSONS).sort()).toEqual([...ALL_IDS].sort());
    for (const id of ALL_IDS) {
      expect(LESSONS[id].id).toBe(id);
    }
  });

  it("marks read-only lessons and gives every other lesson a decision", () => {
    for (const id of ALL_IDS) {
      const lesson = LESSONS[id];
      if (READ_ONLY.includes(id)) {
        expect(lesson.readOnly, id).toBe(true);
        expect(lesson.decision, id).toBeUndefined();
      } else {
        expect(lesson.readOnly, id).toBe(false);
        expect(lesson.decision, id).toBeDefined();
        const count = lesson.decision?.fields.length ?? 0;
        expect(count, id).toBeGreaterThanOrEqual(2);
        expect(count, id).toBeLessThanOrEqual(4);
      }
    }
  });

  it("has unique field IDs within each decision", () => {
    for (const id of ALL_IDS) {
      const fields = LESSONS[id].decision?.fields ?? [];
      const ids = fields.map((f) => f.id);
      expect(new Set(ids).size, id).toBe(ids.length);
    }
  });

  it("has no empty body text", () => {
    for (const id of ALL_IDS) {
      const lesson = LESSONS[id];
      expect(lesson.body.length, id).toBeGreaterThan(0);
      for (const paragraph of lesson.body) {
        expect(paragraph.trim(), id).not.toBe("");
      }
      for (const point of lesson.keyPoints) {
        expect(point.trim(), id).not.toBe("");
      }
    }
  });

  it("has Hugin review notes for every lesson, not empty", () => {
    for (const id of ALL_IDS) {
      expect(HUGIN_NOTES[id].trim(), id).not.toBe("");
    }
  });
});
