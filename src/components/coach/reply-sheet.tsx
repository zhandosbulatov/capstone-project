"use client";

// "Someone replied?": pick the person, paste what they wrote, say what happened. For a plain reply
// Hugin's answer shows right here with Send / Edit / Copy.

import { useState } from "react";
import type { ReplyOutcome } from "@/lib/model";
import { Button, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";
import { HuginLine } from "./hugin";
import { DraftCard } from "./today-draft";
import { draftContactFor } from "./today-logic";

const OUTCOMES: { outcome: ReplyOutcome; label: string }[] = [
  { outcome: "replied", label: "They replied" },
  { outcome: "call", label: "We booked a call" },
  { outcome: "paid", label: "They paid" },
];

/** Only people the user has messaged and who haven't paid can have replied. */
const REPLYABLE = ["messaged", "call", "proposal"];

export function ReplySheet({ contactId }: { contactId?: string }) {
  const { state, actions } = useCoach();
  const people = state.saved.contacts.filter((c) => REPLYABLE.includes(c.stage));
  const [id, setId] = useState(
    contactId && people.some((c) => c.id === contactId) ? contactId : (people[0]?.id ?? ""),
  );
  const [text, setText] = useState("");
  const [answering, setAnswering] = useState<{ id: string; text: string } | null>(null);

  const answered = answering ? state.saved.contacts.find((c) => c.id === answering.id) : undefined;
  if (answering && answered) {
    return (
      <div>
        <h2 className="text-xl font-bold">Answer {answered.name.split(/\s+/)[0]}</h2>
        <DraftCard
          kind="reply"
          contact={draftContactFor(answered, { stage: "replied", lastReply: answering.text })}
          onSent={() => {
            actions.markReplyAnswered(answered.id);
            actions.closeSheet();
          }}
        />
      </div>
    );
  }

  if (!people.length) {
    return (
      <div>
        <h2 className="text-xl font-bold">Someone replied?</h2>
        <HuginLine>Nobody to log yet. Send a first message and come back.</HuginLine>
        <div className="mt-4">
          <Button variant="ghost" onClick={actions.closeSheet}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const log = (outcome: ReplyOutcome) => {
    actions.logReply(id, text, outcome);
    if (outcome === "replied") setAnswering({ id, text });
    else actions.closeSheet();
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Someone replied?</h2>
      <HuginLine>Nice. Paste what they said and I&apos;ll help you answer.</HuginLine>
      <label htmlFor="reply-person" className="mt-2 text-sm text-ink-muted">
        Who
      </label>
      <select
        id="reply-person"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className={fieldClass}
      >
        {people.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <label htmlFor="reply-text" className="text-sm text-ink-muted">
        What they wrote (optional if you booked a call or got paid)
      </label>
      <textarea
        id="reply-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`resize-y ${fieldClass}`}
      />
      <p className="text-sm text-ink-muted">What happened?</p>
      {OUTCOMES.map(({ outcome, label }) => (
        <Button
          key={outcome}
          variant={outcome === "replied" ? "primary" : "outline"}
          disabled={!id || (outcome === "replied" && !text.trim())}
          onClick={() => log(outcome)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
