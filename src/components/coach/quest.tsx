"use client";

import { useState, ViewTransition } from "react";
import { BOSSES, STATS, XP } from "@/lib/game";
import { offerDraft } from "@/lib/plan";
import { Icon } from "@/components/icons";
import { Button, Card, fieldClass, Pill, Rewards } from "@/components/ui";
import { useCoach } from "./app-context";
import { ContactForm, type ContactDraft } from "./contact-form";
import { HuginLine } from "./hugin";
import { completeRows, DAY1_PEOPLE, day1Ready, firstName } from "./today-day1";

/** ["+10 XP", "Clarity +1", "Reach +1"] */
function rewardParts(xp: number, stats: readonly (keyof typeof STATS)[], recovery: boolean) {
  const parts = [`+${xp} XP`, ...stats.map((s) => `${STATS[s].label} +1`)];
  if (recovery && !stats.includes("consistency")) parts.push("Consistency +1");
  return parts;
}


/** Switches between today's quest and its done state, with a soft cross-fade. */
export function TodayQuest() {
  const { state, meta } = useCoach();
  const key = `${state.saved.game.day}-${meta.day1Done ? "d1" : "new"}-${meta.questDone ? "done" : "open"}`;
  return (
    <ViewTransition key={key} enter="fade-in" exit="fade-out" default="none">
      <div>
        {!meta.day1Done ? (
          <Day1Quest />
        ) : state.saved.game.day === 1 ? (
          <Day1Done />
        ) : meta.questDone ? (
          <QuestDone />
        ) : (
          <QuestCard />
        )}
      </div>
    </ViewTransition>
  );
}

/**
 * Today, base placeholder: a plain "next step" line from `nextStep()` above the current quest card.
 * Lane L2 replaces this with the real step card. The status window and boss card are in Progress.
 */
export function TodayRoute() {
  const { meta } = useCoach();
  return (
    <div className="mt-1 flex flex-col gap-3">
      {meta.day1Done ? <NextStepLine /> : null}
      <TodayQuest />
    </div>
  );
}

function NextStepLine() {
  const { actions, meta } = useCoach();
  const { step } = meta;
  return (
    <Card className="my-0">
      <p className="text-sm text-ink-muted">
        {meta.questDone ? "Today's step is done. One more?" : "Today's step"}
      </p>
      <p className="mt-0.5 font-semibold">{meta.stepTitle}</p>
      <div className="mt-3 flex flex-col gap-2">
        {step.kind === "lesson" ? (
          <Button
            variant="outline"
            onClick={() => actions.openSheet({ kind: "lesson", id: step.lessonId })}
          >
            Open the lesson
          </Button>
        ) : step.kind === "add-people" ? (
          <Button variant="outline" onClick={() => actions.openSheet({ kind: "add-contact" })}>
            Add a person
          </Button>
        ) : null}
        <Button onClick={() => actions.markStepDone(step)}>Mark step done</Button>
        <Button variant="ghost" onClick={() => actions.openSheet({ kind: "reply" })}>
          Someone replied?
        </Button>
      </div>
    </Card>
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

/** Any day after day 1. */
function QuestCard() {
  const { actions, meta } = useCoach();
  const { quest } = meta;
  return (
    <Card className="my-0">
      {meta.isRecovery ? (
        <div className="mb-2">
          <Pill tone="warning">Recovery quest</Pill>
        </div>
      ) : null}
      <h2 className="font-display text-xl leading-snug">{quest.title}</h2>
      <p className="mt-1.5">{quest.text}</p>
      <Rewards
        parts={rewardParts(
          meta.isRecovery ? XP.recoveryQuest : XP.dailyQuest,
          quest.stats,
          meta.isRecovery,
        )}
        note={meta.isRecovery ? "Keeps your streak" : undefined}
      />
      <div className="mt-4 flex flex-col gap-2">
        {quest.draft ? (
          <Button
            variant="outline"
            onClick={() => actions.openSheet({ kind: "draft", draft: quest.draft! })}
          >
            Draft with Hugin
          </Button>
        ) : null}
        <Button onClick={actions.completeQuest}>Mark as done</Button>
        {quest.boss ? (
          <Button
            variant="outline"
            onClick={() => actions.openSheet({ kind: "log", result: BOSSES[quest.boss!].result })}
          >
            Log a result
          </Button>
        ) : null}
      </div>
      <HuginLine>{quest.hugin}</HuginLine>
    </Card>
  );
}

function QuestDone() {
  const { state, meta } = useCoach();
  return (
    <Card className="my-0">
      <Pill tone="success">Done today</Pill>
      <h2 className="mt-2 font-display text-xl leading-snug">{meta.quest.title}</h2>
      <p className="mt-1.5 text-ink-muted">
        Day {state.saved.game.day} is done. Your next quest opens tomorrow.
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        Log any reply, call or payment on the boss card below.
      </p>
    </Card>
  );
}
