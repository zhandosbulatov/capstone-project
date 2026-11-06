"use client";

import { useState, ViewTransition } from "react";
import { stepLine } from "@/lib/hugin-lines";
import { nextStep } from "@/lib/next-step";
import { offerDraft } from "@/lib/plan";
import { Icon } from "@/components/icons";
import { Button, Card, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";
import { ContactForm, type ContactDraft } from "./contact-form";
import { HuginLine } from "./hugin";
import { completeRows, DAY1_PEOPLE, day1Ready, firstName } from "./today-day1";
import { PipelineCard, StepCard } from "./today-step";

/**
 * Today: the Client #1 pipeline card, one step, and "Someone replied?". After the day's step it
 * shows "Done for today" and an optional extra step. The status window and boss card are in Progress.
 */
export function TodayRoute() {
  const { state, actions, meta } = useCoach();
  const day = state.saved.game.day;
  const [notice, setNotice] = useState<{ day: number; text: string } | null>(null);
  const [extra, setExtra] = useState(false);
  const extraStep = nextStep(state.saved, day, { skipLessons: true });
  const showNotice = notice && notice.day === day ? notice.text : null;
  const phase = !meta.day1Done ? "day1" : day === 1 ? "day1-done" : meta.questDone ? "done" : "step";

  return (
    <div className="mt-1 flex flex-col gap-3">
      {meta.day1Done ? <PipelineCard /> : null}
      <ViewTransition key={phase} enter="fade-in" exit="fade-out" default="none">
        <div className="flex flex-col gap-3">
          {phase === "day1" ? (
            <Day1Quest />
          ) : phase === "day1-done" ? (
            <Day1Done />
          ) : phase === "step" ? (
            <>
              <p className="type-label">Today · about 2 min · keeps your streak</p>
              <StepCard
                key={`${meta.step.kind}-${"contactId" in meta.step ? meta.step.contactId : ""}`}
                step={meta.step}
                onDone={(text) => setNotice({ day, text })}
              />
            </>
          ) : (
            <>
              <Card className="my-0">
                {showNotice ? (
                  <p role="status" className="mb-1.5 text-sm font-semibold text-success-ink">
                    {showNotice}
                  </p>
                ) : null}
                <h2 className="font-display text-xl leading-snug">Done for today.</h2>
                <HuginLine>{stepLine("done", day)}</HuginLine>
              </Card>
              {extra ? (
                <>
                  <p className="type-label">One more · extra steps don&apos;t add streak days</p>
                  <StepCard
                    key={`extra-${extraStep.kind}-${"contactId" in extraStep ? extraStep.contactId : ""}`}
                    step={extraStep}
                    onDone={(text) => {
                      setNotice({ day, text });
                      setExtra(false);
                    }}
                  />
                </>
              ) : (
                <Button variant="outline" onClick={() => setExtra(true)}>
                  Want to do one more?
                </Button>
              )}
            </>
          )}
        </div>
      </ViewTransition>
      {meta.day1Done && day > 1 ? (
        <Button variant="ghost" onClick={() => actions.openSheet({ kind: "reply" })}>
          Someone replied?
        </Button>
      ) : null}
    </div>
  );
}

/** Day 1: write the offer and the first 5 people, each with how you know them. */
function Day1Quest() {
  const { state, actions, meta } = useCoach();
  const [offer, setOffer] = useState(() => state.saved.offer ?? offerDraft(meta.answers));
  const [rows, setRows] = useState<ContactDraft[]>(() =>
    Array.from({ length: DAY1_PEOPLE }, (_, i) => {
      const c = state.saved.contacts[i];
      return c ? { name: c.name, relation: c.relation, note: c.note } : { name: "" };
    }),
  );
  const done = completeRows(rows);
  const ready = day1Ready(offer, rows);

  const finish = () =>
    actions.completeDay1(
      offer,
      rows.flatMap((r) =>
        r.relation
          ? [{ name: r.name.trim(), relation: r.relation, note: r.note?.trim() || undefined }]
          : [],
      ),
    );

  return (
    <Card className="my-0">
      <h2 className="font-display text-xl leading-snug">{meta.quest.title}</h2>

      <label htmlFor="offer" className="mt-3 block text-sm text-ink-muted">
        Step 1. Your coach drafted your offer. Edit it until you would say it out loud.
      </label>
      <textarea
        id="offer"
        value={offer}
        onChange={(e) => setOffer(e.target.value)}
        rows={4}
        className={`mt-1.5 resize-y ${fieldClass}`}
      />

      <fieldset className="mt-3">
        <legend className="text-sm text-ink-muted">
          Step 2. Five people who have seen your work. Type a name, then tap how you know them.
        </legend>
        <div className="mt-1.5 flex flex-col gap-2">
          {rows.map((row, i) => (
            <ContactForm
              key={i}
              mode="row"
              index={i}
              value={row}
              onChange={(next) => setRows((prev) => prev.map((r, j) => (j === i ? next : r)))}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Only people who&apos;ve seen your work. Nobody at your current job needs to know.
        </p>
      </fieldset>

      <div className="mt-4">
        <Button disabled={!ready} onClick={finish}>
          {`Complete quest · ${done}/${DAY1_PEOPLE}`}
        </Button>
        {!ready ? (
          <p className="mt-1.5 text-center text-xs text-ink-muted">
            {done < DAY1_PEOPLE
              ? "Five people, each with how you know them."
              : "Write your offer in a full sentence to finish."}
          </p>
        ) : null}
      </div>
      <HuginLine>{meta.quest.hugin}</HuginLine>
    </Card>
  );
}

function Day1Done() {
  const { state, meta } = useCoach();
  const first = firstName(state.saved.contacts[0]?.name ?? "");
  return (
    <Card className="my-0">
      <div className="py-2 text-center">
        <span
          aria-hidden
          className="mx-auto grid size-10 place-items-center rounded-full bg-brand text-on-bright"
        >
          <Icon name="check" size={22} strokeWidth={2.5} />
        </span>
        <h2 className="mt-2 font-display text-xl">Quest 1 done</h2>
        <p className="mt-1 text-ink-muted">
          Your offer is written and 5 people are on your list.
        </p>
      </div>
      <div className="mt-2 rounded-md bg-canvas px-3.5 py-3">
        <p className="text-sm font-bold">Tomorrow</p>
        <p className="mt-1 text-sm text-ink-muted">
          {first
            ? `Your first message, to ${first}. Hugin will have it ready.`
            : "Your first message. Hugin will have it ready."}
        </p>
      </div>
      <HuginLine>{meta.quest.hugin}</HuginLine>
    </Card>
  );
}
