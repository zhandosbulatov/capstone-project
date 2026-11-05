"use client";

// A Hugin draft inside a card: loads on its own, then Send / Edit / Copy / New version.
// Used by the Today step card and by the reply sheet.

import { useEffect, useState } from "react";
import { fetchDrafts, type DraftContact } from "@/lib/hugin-client";
import type { DraftKind } from "@/lib/model";
import { Button, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";
import { firstCleanDraft, firstWord } from "./today-logic";

type Load =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "busy"; message: string };

const MAX_TRIES = 3;
const BUSY_LINE = "I'm busy right now. Write it yourself below, or ask for a new version.";

/**
 * Props:
 * - `kind`      the draft kind sent to Hugin (`outreach`, `follow-up`, `reply`, `proposal`).
 * - `contact`   the one contact the draft is about.
 * - `onSent`    called with the final text after Send or Copy; `notice` is the line to show.
 */
export function DraftCard({
  kind,
  contact,
  onSent,
}: {
  kind: DraftKind;
  contact: DraftContact;
  onSent: (text: string, notice: string) => void;
}) {
  const { meta } = useCoach();
  const [attempt, setAttempt] = useState(0);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const first = firstWord(contact.name);

  useEffect(() => {
    const controller = new AbortController();
    // Hugin sometimes returns drafts with [placeholders]. Ask again (up to 3 times) until one is clean.
    (async () => {
      let message = BUSY_LINE;
      for (let tries = 0; tries < MAX_TRIES; tries++) {
        const result = await fetchDrafts(
          { kind, context: meta.huginContext, contact, count: 3 },
          controller.signal,
        );
        if ("drafts" in result) {
          const clean = firstCleanDraft(result.drafts);
          if (clean) {
            setText(clean);
            setLoad({ status: "ready" });
            return;
          }
        } else {
          message = result.error || BUSY_LINE;
        }
      }
      setLoad({ status: "busy", message });
    })().catch(() => {
      // Aborted: the card went away.
    });
    return () => controller.abort();
    // One draft per card and retry, not on every context change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const regenerate = () => {
    setEditing(false);
    setLoad({ status: "loading" });
    setAttempt((n) => n + 1);
  };

  const final = text.trim();
  const canAct = final.length > 0 && load.status !== "loading";

  const send = async () => {
    if (!canAct) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ text: final });
        onSent(final, `Sent to ${first}.`);
        return;
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        // Share failed for another reason: fall back to copying.
      }
    }
    await copy(`Copied. Paste it to ${first}.`);
  };

  const copy = async (notice = "Copied.") => {
    if (!canAct) return;
    try {
      await navigator.clipboard.writeText(final);
    } catch {
      // Clipboard blocked: the text is on screen to select by hand.
    }
    onSent(final, notice);
  };

  return (
    <div className="mt-3">
      {load.status === "loading" ? (
        <div aria-busy="true" aria-live="polite" className="rounded-md bg-canvas px-3.5 py-3">
          <span className="sr-only">Hugin is drafting. A few seconds.</span>
          <div className="h-3 w-11/12 animate-pulse rounded bg-line" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-line" />
          <div className="mt-2 h-3 w-7/12 animate-pulse rounded bg-line" />
        </div>
      ) : (
        <>
          {load.status === "busy" ? (
            <p className="mb-2 text-sm text-ink-muted">{load.message}</p>
          ) : null}
          {editing || load.status === "busy" ? (
            <>
              <label htmlFor="draft-text" className="sr-only">
                Your message to {first}
              </label>
              <textarea
                id="draft-text"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`resize-y ${fieldClass}`}
              />
            </>
          ) : (
            <p className="rounded-md bg-canvas px-3.5 py-3 text-base whitespace-pre-line">{text}</p>
          )}
        </>
      )}

      <div className="mt-3 flex flex-col gap-2">
        <Button disabled={!canAct} onClick={send}>
          Send
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={load.status === "loading"}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? "Done editing" : "Edit"}
          </Button>
          <Button variant="outline" disabled={!canAct} onClick={() => copy()}>
            Copy
          </Button>
        </div>
        <button
          type="button"
          onClick={regenerate}
          disabled={load.status === "loading"}
          className="mx-auto min-h-9 text-sm font-semibold text-brand-ink underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-45"
        >
          New version
        </button>
      </div>
    </div>
  );
}
