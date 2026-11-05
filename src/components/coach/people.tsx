"use client";

// Placeholder from the base: a plain list of people and stages. Lane L4 designs it.

import { STAGE_LABELS } from "@/lib/model";
import { Button, Card } from "@/components/ui";
import { useCoach } from "./app-context";

export function People() {
  const { state, actions } = useCoach();
  const { contacts } = state.saved;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-3xl">People</h1>
      <Card className="my-0">
        {contacts.length ? (
          <ul className="flex flex-col divide-y divide-line">
            {contacts.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => actions.openSheet({ kind: "contact", id: c.id })}
                  className="flex w-full cursor-pointer justify-between gap-3 py-2.5 text-left"
                >
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-sm text-ink-muted">{STAGE_LABELS[c.stage]}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">Nobody on your list yet.</p>
        )}
      </Card>
      <Button variant="outline" onClick={() => actions.openSheet({ kind: "add-contact" })}>
        Add a person
      </Button>
      <Button variant="outline" onClick={() => actions.openSheet({ kind: "reply" })}>
        Someone replied?
      </Button>
    </div>
  );
}
