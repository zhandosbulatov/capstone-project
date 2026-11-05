"use client";

// Placeholder from the base: one person's details and stage. Lane L4 designs it.

import { RELATION_LABELS, STAGE_LABELS, STAGES, type Stage } from "@/lib/model";
import { Button, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";

export function ContactSheet({ id }: { id: string }) {
  const { state, actions } = useCoach();
  const contact = state.saved.contacts.find((c) => c.id === id);
  if (!contact) return <p className="text-ink-muted">This person is no longer on your list.</p>;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">{contact.name}</h2>
      <p className="text-sm text-ink-muted">{RELATION_LABELS[contact.relation]}</p>
      {contact.note ? <p>{contact.note}</p> : null}
      {contact.lastReply ? (
        <p className="text-sm">
          <span className="text-ink-muted">Last reply: </span>
          {contact.lastReply}
        </p>
      ) : null}
      <label htmlFor="contact-stage" className="mt-2 text-sm text-ink-muted">
        Stage
      </label>
      <select
        id="contact-stage"
        value={contact.stage}
        onChange={(e) => actions.setStage(contact.id, e.target.value as Stage)}
        className={fieldClass}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {STAGE_LABELS[s]}
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        onClick={() => actions.openSheet({ kind: "reply", contactId: contact.id })}
      >
        Log a reply
      </Button>
    </div>
  );
}
