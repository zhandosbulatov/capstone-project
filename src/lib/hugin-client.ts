// Browser calls to Hugin's API routes. Every failure comes back as a calm line, never a throw.

import type { HuginContext } from "./hugin";
import type { Contact, DecisionReview, DraftKind, LessonId } from "./model";

const OFFLINE = "No connection. The quest still works without me.";

async function errorLine(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Something went wrong on my side. Try again in a minute.";
}

/** The one contact a draft is about. Only what the user typed; never the whole list. */
export type DraftContact = Pick<Contact, "name" | "relation" | "note" | "stage" | "lastSent" | "lastReply">;

export function toDraftContact(contact: Contact): DraftContact {
  const { name, relation, note, stage, lastSent, lastReply } = contact;
  return { name, relation, note, stage, lastSent, lastReply };
}

/** POST /api/draft body. */
export type DraftRequest = {
  kind: DraftKind;
  context: HuginContext;
  contact?: DraftContact;
  /** A saved lesson decision the draft should use. */
  lesson?: { id: LessonId; fields: Record<string, string> };
  /** How many drafts to ask for. The route decides its own default. */
  count?: number;
};

async function postJson<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T | { error: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) return { error: await errorLine(res) };
    return (await res.json()) as T;
  } catch (error) {
    if (signal?.aborted) throw error;
    return { error: OFFLINE };
  }
}

export function fetchDrafts(
  request: DraftRequest,
  signal?: AbortSignal,
): Promise<{ drafts: string[] } | { error: string }> {
  return postJson<{ drafts: string[] }>("/api/draft", request, signal);
}

/** POST /api/review body: Hugin reviews a lesson decision. */
export type ReviewRequest = {
  lessonId: LessonId;
  fields: Record<string, string>;
  context: HuginContext;
};

export function fetchReview(
  request: ReviewRequest,
  signal?: AbortSignal,
): Promise<{ review: DecisionReview } | { error: string }> {
  return postJson<{ review: DecisionReview }>("/api/review", request, signal);
}

export type ChatMessage = { role: "user" | "hugin"; text: string };

/** Streams Hugin's reply; `onText` gets the whole reply so far. Returns the final text. */
export async function streamChat(
  messages: ChatMessage[],
  context: HuginContext,
  onText: (text: string) => void,
): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });
    if (!res.ok || !res.body) {
      const line = await errorLine(res);
      onText(line);
      return line;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
    return text;
  } catch {
    onText(OFFLINE);
    return OFFLINE;
  }
}
