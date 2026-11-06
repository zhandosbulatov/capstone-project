"use client";

// One person: details, note, their last reply, and where they are in your pipeline.

import { useState } from "react";
import { RELATION_LABELS, STAGE_LABELS, STAGES, type Stage } from "@/lib/model";
import { Button, fieldClass, Label } from "@/components/ui";
import { useCoach } from "./app-context";
import { lastActionText } from "./l4-helpers";

export function ContactSheet({ id }: { id: string }) {
  const { state, actions } = useCoach();
  const contact = state.saved.contacts.find((c) => c.id === id);
  const [note, setNote] = useState(contact?.note ?? "");
  const [confirmRemove, setConfirmRemove] = useState(false);
  if (!contact) return <p className="text-ink-muted">This person is no longer on your list.</p>;

  const noteChanged = note.trim() !== (contact.note ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">{contact.name}</h2>
        <p className="text-sm text-ink-muted">
          {RELATION_LABELS[contact.relation]} · {STAGE_LABELS[contact.stage]} ·{" "}
          {lastActionText(contact, state.saved.game.day)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-note-edit" className="type-label">
          Note
        </label>
        <textarea
          id="contact-note-edit"
          rows={3}
          value={note}
          placeholder="Anything Hugin should know about them"
          onChange={(e) => setNote(e.target.value)}
          className={`resize-y ${fieldClass}`}
        />
        {noteChanged ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => actions.updateContact(contact.id, { note: note.trim() || undefined })}
          >
            Save note
          </Button>
        ) : null}
      </div>

      {contact.lastReply ? (
        <div>
          <Label>Their last reply</Label>
          <p className="mt-1 rounded-md bg-canvas px-3.5 py-3 text-sm whitespace-pre-line">
            {contact.lastReply}
          </p>
        </div>
      ) : null}

      <div>
        <Label>Move to…</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {STAGES.map((s: Stage) => (
            <Button
              key={s}
              size="sm"
              variant={s === contact.stage ? "primary" : "outline"}
              aria-pressed={s === contact.stage}
              onClick={() => s !== contact.stage && actions.setStage(contact.id, s)}
            >
              {STAGE_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => actions.openSheet({ kind: "reply", contactId: contact.id })}
      >
        Log a reply
      </Button>

      {confirmRemove ? (
        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <p className="text-sm text-ink-muted">
            Remove {contact.name} from your list? This can&apos;t be undone.
          </p>
          <Button
            variant="dark"
            onClick={() => {
              actions.removeContact(contact.id);
              actions.closeSheet();
            }}
          >
            Yes, remove
          </Button>
          <Button variant="ghost" onClick={() => setConfirmRemove(false)}>
            Keep them
          </Button>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setConfirmRemove(true)}>
          Remove from list
        </Button>
      )}
    </div>
  );
}
