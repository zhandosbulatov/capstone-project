"use client";

/**
 * Contact entry: a name, how you know them (one-tap chips, required) and an optional note.
 *
 * `<ContactForm />` props (keep stable; Day 1, the "add a person" step and the People tab use it):
 * - `mode`        "card" (default): one card with a Save button. "row": a compact row, no button.
 * - `value`       controlled draft `{ name, relation?, note? }`. Row mode needs it (and `onChange`).
 * - `onChange`    called with the new draft on every edit.
 * - `initial`     starting values for the uncontrolled card, e.g. when editing a contact.
 * - `onSave`      card mode: called with a `ContactInput` when Save is pressed. Needs name + relation.
 * - `submitLabel` Save button text, default "Save".
 * - `index`       row mode: 0-based position, used for labels ("Name 1").
 *
 * `AddContactSheet` is the "add-contact" sheet and stays exported.
 */

import { useState } from "react";
import { RELATION_LABELS, RELATIONS, type ContactInput, type Relation } from "@/lib/model";
import { Button, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";

export type ContactDraft = { name: string; relation?: Relation; note?: string };

type Props = {
  mode?: "row" | "card";
  value?: ContactDraft;
  onChange?: (draft: ContactDraft) => void;
  initial?: ContactInput;
  onSave?: (input: ContactInput) => void;
  submitLabel?: string;
  index?: number;
};

export function ContactForm({
  mode = "card",
  value,
  onChange,
  initial,
  onSave,
  submitLabel = "Save",
  index = 0,
}: Props) {
  const [inner, setInner] = useState<ContactDraft>(() => initial ?? { name: "", note: "" });
  const draft = value ?? inner;
  const [noteOpen, setNoteOpen] = useState(() => Boolean(draft.note?.trim()));
  const compact = mode === "row";
  const label = compact ? `Name ${index + 1}` : "Name";

  const set = (patch: Partial<ContactDraft>) => {
    const next = { ...draft, ...patch };
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const canSave = Boolean(draft.name.trim() && draft.relation);

  const fields = (
    <>
      <input
        aria-label={label}
        placeholder={label}
        autoComplete="off"
        value={draft.name}
        onChange={(e) => set({ name: e.target.value })}
        className={fieldClass}
      />
      <div
        role="group"
        aria-label={compact ? `How you know name ${index + 1}` : "How you know them"}
        className="mt-1.5 flex flex-wrap gap-1.5"
      >
        {RELATIONS.map((r) => {
          const on = draft.relation === r;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={on}
              onClick={() => set({ relation: r })}
              className={`min-h-9 rounded-full border-[1.5px] px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                on
                  ? "border-brand bg-brand text-on-bright"
                  : "border-line-strong bg-surface text-ink"
              }`}
            >
              {RELATION_LABELS[r]}
            </button>
          );
        })}
      </div>
      {noteOpen ? (
        <input
          aria-label={compact ? `Detail about name ${index + 1}` : "A detail Hugin can use"}
          placeholder="e.g. we redid the sales deck together in 2023"
          autoComplete="off"
          value={draft.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          className={`mt-1.5 ${fieldClass}`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="mt-1.5 min-h-9 self-start text-sm font-semibold text-brand-ink underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          + add a detail Hugin can use
        </button>
      )}
    </>
  );

  if (compact) {
    return <div className="flex flex-col rounded-md bg-canvas p-2.5">{fields}</div>;
  }

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave || !draft.relation) return;
        onSave?.({
          name: draft.name.trim(),
          relation: draft.relation,
          note: draft.note?.trim() || undefined,
        });
      }}
    >
      {fields}
      <div className="mt-3">
        <Button type="submit" disabled={!canSave}>
          {submitLabel}
        </Button>
      </div>
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
