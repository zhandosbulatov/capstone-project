"use client";

// Placeholder from the base: who replied, what they wrote, and what it means. Lane L2 designs it.

import { useState } from "react";
import type { ReplyOutcome } from "@/lib/model";
import { Button, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";

const OUTCOMES: { outcome: ReplyOutcome; label: string }[] = [
  { outcome: "replied", label: "They replied" },
  { outcome: "call", label: "We have a call" },
  { outcome: "paid", label: "They paid" },
];

export function ReplySheet({ contactId }: { contactId?: string }) {
  const { state, actions } = useCoach();
  const { contacts } = state.saved;
  const [id, setId] = useState(contactId ?? contacts[0]?.id ?? "");
  const [text, setText] = useState("");

  if (!contacts.length) {
    return <p className="text-ink-muted">Add someone to your list first.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Someone replied</h2>
      <label htmlFor="reply-person" className="text-sm text-ink-muted">
        Who
      </label>
      <select
        id="reply-person"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className={fieldClass}
      >
        {contacts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <label htmlFor="reply-text" className="text-sm text-ink-muted">
        What they wrote
      </label>
      <textarea
        id="reply-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`resize-y ${fieldClass}`}
      />
      {OUTCOMES.map(({ outcome, label }) => (
        <Button
          key={outcome}
          variant={outcome === "replied" ? "primary" : "outline"}
          disabled={!id}
          onClick={() => {
            actions.logReply(id, text, outcome);
            actions.closeSheet();
          }}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
