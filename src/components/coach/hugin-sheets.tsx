"use client";

// Hugin on Gemini: a short chat. Drafts live in the Today step card (today-draft.tsx).

import { useEffect, useRef, useState } from "react";
import { Button, buttonClass } from "@/components/ui";
import { useCoach } from "./app-context";
import { HuginAvatar, HuginLine } from "./hugin";

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
