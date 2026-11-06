"use client";

// The People tab: everyone on the list, grouped by where they are with you.

import { RELATION_LABELS, STAGE_LABELS, type Stage } from "@/lib/model";
import { Button, Pill, type PillTone } from "@/components/ui";
import { useCoach } from "./app-context";
import { groupContacts, lastActionText } from "./l4-helpers";

const CHIP_TONES: Record<Stage, PillTone> = {
  listed: "accent",
  messaged: "accent",
  replied: "brand",
  call: "brand",
  proposal: "brand",
  paid: "success",
  "not-now": "warning",
};

export function People() {
  const { state, actions } = useCoach();
  const { contacts, game } = state.saved;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">People · {contacts.length}</h1>
        <Button size="sm" variant="outline" onClick={() => actions.openSheet({ kind: "add-contact" })}>
          Add a person
        </Button>
      </div>

      {contacts.length ? (
        groupContacts(contacts).map((group) => (
          <section key={group.stage} aria-label={group.label} className="flex flex-col gap-1">
            <h2 className="type-label">
              {group.label} · {group.items.length}
            </h2>
            <ul className="divide-y divide-line rounded-md border border-line bg-surface">
              {group.items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => actions.openSheet({ kind: "contact", id: c.id })}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="truncate">{c.name}</span>
                        {c.awaitingAnswer ? (
                          <span
                            role="img"
                            aria-label="Waiting for your answer"
                            className="size-2.5 shrink-0 rounded-full bg-brand"
                          />
                        ) : null}
                      </span>
                      <span className="block truncate text-sm text-ink-muted">
                        {RELATION_LABELS[c.relation]} · {lastActionText(c, game.day)}
                      </span>
                    </span>
                    <Pill tone={CHIP_TONES[c.stage]}>{STAGE_LABELS[c.stage]}</Pill>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className="rounded-md border border-line bg-surface px-4 py-4 text-ink-muted">
          Nobody here yet. Add someone who has seen your work.
        </p>
      )}
    </div>
  );
}
