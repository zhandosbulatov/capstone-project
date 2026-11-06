// Pure rules for the Day 1 quest. Kept apart from the components so they can be unit-tested.

import type { Relation } from "@/lib/model";

export const DAY1_PEOPLE = 5;
export const MIN_OFFER_LENGTH = 10;

export type Day1Row = { name: string; relation?: Relation };

/** Rows with a name and a relation. */
export function completeRows(rows: readonly Day1Row[]): number {
  return rows.filter((r) => r.name.trim() && r.relation).length;
}

/** 5 names, each with a relation, and an offer longer than 10 characters. */
export function day1Ready(offer: string, rows: readonly Day1Row[]): boolean {
  return completeRows(rows) >= DAY1_PEOPLE && offer.trim().length > MIN_OFFER_LENGTH;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}
