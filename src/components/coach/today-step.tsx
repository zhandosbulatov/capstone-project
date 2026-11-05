"use client";

// The Today pieces: the Client #1 pipeline card and the one step card.

import type { NextStep } from "@/lib/model";
import { LESSONS } from "@/lib/curriculum";
import { stepLine } from "@/lib/hugin-lines";
import { Button, Card } from "@/components/ui";
import { useCoach } from "./app-context";
import { ContactForm } from "./contact-form";
import { HuginLine } from "./hugin";
import { DraftCard } from "./today-draft";
import {
  contactIdOf,
  draftContactFor,
  draftKindFor,
  pipelineCounts,
  relationLine,
  stepHeading,
} from "./today-logic";

/** "Client #1 · service · price" with the funnel counts. Tapping opens the People tab. */
export function PipelineCard() {
  const { state, actions, meta } = useCoach();
  const c = pipelineCounts(state.saved.contacts);
  return (
    <button
      type="button"
      onClick={() => actions.setTab("people")}
      className="w-full rounded-md border border-line bg-sun px-4 py-3.5 text-left text-on-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <span className="block text-sm font-semibold">
        Client #1 · {meta.plan.service} · {meta.plan.priceLabel}
      </span>
      <span className="mt-1 block text-base font-bold tabular-nums">
        {c.listed} listed → {c.messaged} messaged → {c.replied} replied → {c.paid} paid
      </span>
    </button>
  );
}

/** The step card for one `nextStep()` result. `onDone` gets the line to show after Send or Copy. */
export function StepCard({ step, onDone }: { step: NextStep; onDone: (notice: string) => void }) {
  const { state, actions, meta } = useCoach();
  const day = state.saved.game.day;
  const contact = state.saved.contacts.find((c) => c.id === contactIdOf(step));
  const kind = draftKindFor(step);

  if (kind && contact) {
    return (
      <Card className="my-0">
        <h2 className="font-display text-xl leading-snug">
          {stepHeading(step, contact.name, meta.plan.priceLabel)}
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">{relationLine(contact)}</p>
        <DraftCard
          key={`${step.kind}-${contact.id}`}
          kind={kind}
          contact={draftContactFor(contact)}
          onSent={(text, notice) => {
            actions.markStepDone(step, { sentText: text });
            if (step.kind === "answer") actions.markReplyAnswered(contact.id);
            onDone(notice);
          }}
        />
        <HuginLine>{stepLine(step.kind as "message", day)}</HuginLine>
      </Card>
    );
  }

  if (step.kind === "lesson") {
    const lesson = LESSONS[step.lessonId];
    return (
      <Card className="my-0">
        <h2 className="font-display text-xl leading-snug">
          Today&apos;s lesson · {lesson.title} · {lesson.minutes} min
        </h2>
        <p className="mt-1.5 text-ink-muted">{lesson.keyPoints[0]}</p>
        <div className="mt-4">
          <Button onClick={() => actions.openSheet({ kind: "lesson", id: step.lessonId })}>
            Open the lesson
          </Button>
        </div>
        <HuginLine>{stepLine("lesson", day)}</HuginLine>
      </Card>
    );
  }

  if (step.kind === "add-people") {
    return (
      <Card className="my-0">
        <h2 className="font-display text-xl leading-snug">
          Add one more person who has seen your work
        </h2>
        <div className="mt-3">
          <ContactForm
            submitLabel="Add and finish"
            onSave={(input) => {
              actions.addContact(input);
              actions.markStepDone(step);
              onDone(`${input.name.split(/\s+/)[0]} is on your list.`);
            }}
          />
        </div>
        <HuginLine>{stepLine("add-people", day)}</HuginLine>
      </Card>
    );
  }

  return null;
}
