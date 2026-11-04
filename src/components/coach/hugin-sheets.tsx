"use client";

// Hugin on Gemini: drafted messages for the day's quest, and a short chat.

import { useEffect, useRef, useState } from "react";
import { fetchDrafts } from "@/lib/hugin-client";
import type { DraftKind } from "@/lib/quests";
import { Button, buttonClass } from "@/components/ui";
import { useCoach } from "./app-context";
import { HuginAvatar, HuginLine } from "./hugin";

const DRAFT_TITLES: Record<DraftKind, string> = {
  offer: "Your offer, three ways",
  outreach: "Three messages to send",
  "follow-up": "Three follow-ups",
  proposal: "Three proposal drafts",
};

type DraftState =
  | { status: "loading" }
  | { status: "ready"; drafts: string[] }
  | { status: "error"; message: string };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked: the text is still there to select by hand.
        }
      }}
      aria-live="polite"
      className={`${buttonClass({ variant: "outline", size: "sm", width: "auto" })} min-w-16`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function DraftSheet({ kind }: { kind: DraftKind }) {
  const { actions, meta } = useCoach();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DraftState>({ status: "loading" });
  const context = meta.huginContext;

  useEffect(() => {
    const controller = new AbortController();
    fetchDrafts(kind, context, controller.signal)
      .then((result) =>
        setState("drafts" in result ? { status: "ready", drafts: result.drafts } : { status: "error", message: result.error }),
      )
      .catch(() => {
        // Aborted because the sheet closed.
      });
    return () => controller.abort();
    // Draft once per open or retry, not on every context change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, attempt]);

  return (
    <div>
      <h2 className="text-xl font-bold">{DRAFT_TITLES[kind]}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Edit the bits in brackets. Then send them from your own phone or email.
      </p>

      <div aria-live="polite" className="mt-4 flex flex-col gap-2.5">
        {state.status === "loading" ? (
          <HuginLine>Drafting. A few seconds.</HuginLine>
        ) : state.status === "error" ? (
          <HuginLine>{state.message}</HuginLine>
        ) : (
          state.drafts.map((draft, i) => (
            <div key={i} className="rounded-md border border-line bg-canvas px-3.5 py-3">
              <p className="text-base whitespace-pre-line">{draft}</p>
              <div className="mt-2 flex justify-end">
                <CopyButton text={draft} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button
          variant="outline"
          disabled={state.status === "loading"}
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((n) => n + 1);
          }}
        >
          {state.status === "error" ? "Try again" : "Draft three more"}
        </Button>
        <Button variant="ghost" onClick={actions.closeSheet}>
          Close
        </Button>
      </div>
    </div>
  );
}

export function ChatSheet() {
  const { state, actions } = useCoach();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [state.chat]);

  const send = () => {
    if (!text.trim() || state.chatBusy) return;
    actions.sendChat(text);
    setText("");
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5">
        <HuginAvatar size={36} />
        <div>
          <h2 className="text-xl leading-tight font-bold">Ask Hugin</h2>
          <p className="text-sm text-ink-muted">About your offer, a message, a client, your price.</p>
        </div>
      </div>

      <div aria-live="polite" className="mt-4 flex min-h-32 flex-col gap-2.5">
        {state.chat.length === 0 ? (
          <HuginLine>What&apos;s in the way today?</HuginLine>
        ) : (
          state.chat.map((m, i) =>
            m.role === "user" ? (
              <p
                key={i}
                className="max-w-[85%] self-end rounded-md bg-brand px-3.5 py-2.5 text-base whitespace-pre-line text-on-bright"
              >
                {m.text}
              </p>
            ) : (
              <div key={i} className="flex max-w-[92%] items-start gap-2">
                <HuginAvatar size={24} />
                <p className="rounded-md bg-canvas px-3.5 py-2.5 text-base whitespace-pre-line">
                  {m.text || "…"}
                </p>
              </div>
            ),
          )
        )}
        <div ref={endRef} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message to Hugin
        </label>
        <input
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a question"
          autoComplete="off"
          maxLength={2000}
          className="min-w-0 flex-1 rounded-md border-[1.5px] border-line-strong bg-surface px-3.5 py-3 text-base focus:border-ink focus:outline-2 focus:outline-offset-1 focus:outline-ink"
        />
        <button
          type="submit"
          disabled={!text.trim() || state.chatBusy}
          className={buttonClass({ size: "md", width: "auto" })}
        >
          Send
        </button>
      </form>
      <p className="mt-2 text-xs text-ink-muted">
        Hugin is an AI. He can be wrong, and he doesn&apos;t give legal, tax or medical advice.
      </p>
      <div className="mt-3">
        <Button variant="ghost" onClick={actions.closeSheet}>
          Close
        </Button>
      </div>
    </div>
  );
}
