// Browser calls to Hugin's API routes. Every failure comes back as a calm line, never a throw.

import type { HuginContext } from "./hugin";
import type { DraftKind } from "./quests";

const OFFLINE = "No connection. The quest still works without me.";

async function errorLine(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Something went wrong on my side. Try again in a minute.";
}

export async function fetchDrafts(
  kind: DraftKind,
  context: HuginContext,
  signal?: AbortSignal,
): Promise<{ drafts: string[] } | { error: string }> {
  try {
    const res = await fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, context }),
      signal,
    });
    if (!res.ok) return { error: await errorLine(res) };
    return (await res.json()) as { drafts: string[] };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { error: OFFLINE };
  }
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
