"use client";

// Placeholder from the base: plain fields for one person. Lane L2 designs it.

import { useState } from "react";
import { RELATION_LABELS, RELATIONS, type ContactInput, type Relation } from "@/lib/model";
import { Button, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";

/** A plain relation select. Day 1 uses it next to each name. */
export function RelationSelect({
  value,
  onChange,
  id,
  label = "Relation",
}: {
  value: Relation;
  onChange: (relation: Relation) => void;
  id?: string;
  label?: string;
}) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as Relation)}
      className={fieldClass}
    >
      {RELATIONS.map((r) => (
        <option key={r} value={r}>
          {RELATION_LABELS[r]}
        </option>
      ))}
    </select>
  );
}

export function ContactForm({
  initial,
  submitLabel = "Save",
  onSave,
}: {
  initial?: ContactInput;
  submitLabel?: string;
  onSave: (input: ContactInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [relation, setRelation] = useState<Relation>(initial?.relation ?? "other");
  const [note, setNote] = useState(initial?.note ?? "");

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), relation, note: note.trim() || undefined });
      }}
    >
      <label className="text-sm text-ink-muted" htmlFor="contact-name">
        Name
      </label>
      <input
        id="contact-name"
        autoComplete="off"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={fieldClass}
      />
      <label className="text-sm text-ink-muted" htmlFor="contact-relation">
        How you know them
      </label>
      <RelationSelect id="contact-relation" value={relation} onChange={setRelation} />
      <label className="text-sm text-ink-muted" htmlFor="contact-note">
        Note (optional)
      </label>
      <textarea
        id="contact-note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={`resize-y ${fieldClass}`}
      />
      <Button type="submit" disabled={!name.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}

/** The "add-contact" sheet. */
export function AddContactSheet() {
  const { actions } = useCoach();
  return (
    <div>
      <h2 className="mb-3 text-xl font-bold">Add a person</h2>
      <ContactForm
        submitLabel="Add"
        onSave={(input) => {
          actions.addContact(input);
          actions.closeSheet();
        }}
      />
    </div>
  );
}
