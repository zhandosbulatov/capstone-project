"use client";

import { useState, ViewTransition } from "react";
import { BOSSES, STATS, XP } from "@/lib/game";
import { offerDraft } from "@/lib/plan";
import { Button, Card, Pill } from "@/components/ui";
import { useCoach } from "./app-context";
import { HuginLine } from "./hugin";

const NAME_COUNT = 5;
const MIN_OFFER_LENGTH = 10;

/** "+10 XP · Clarity +1 · Reach +1" */
function rewardLine(xp: number, stats: readonly (keyof typeof STATS)[], recovery: boolean) {
  const parts = [`+${xp} XP`, ...stats.map((s) => `${STATS[s].label} +1`)];
  if (recovery && !stats.includes("consistency")) parts.push("Consistency +1");
  return parts.join(" · ");
}

/** Switches between today's quest and its done state, with a soft cross-fade. */
export function TodayQuest() {
  const { state, meta } = useCoach();
  const day1 = state.saved.game.day === 1;
  const key = `${state.saved.game.day}-${meta.questDone ? "done" : "open"}`;
  return (
    <ViewTransition key={key} enter="fade-in" exit="fade-out" default="none">
      <div>
        {day1 ? (
          meta.questDone ? <Day1Done /> : <Day1Quest />
        ) : meta.questDone ? (
          <QuestDone />
        ) : (
          <QuestCard />
        )}
      </div>
    </ViewTransition>
  );
}

function QuestHeader({ minutes, recovery }: { minutes: number; recovery: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Pill tone={recovery ? "warn" : "accent"}>
        {recovery ? "Recovery quest" : "Today's quest"} · {minutes} min
      </Pill>
    </div>
  );
}

/** Day 1: write the offer and the first 5 names. Real progress in session one. */
function Day1Quest() {
  const { state, actions, meta } = useCoach();
  const [offer, setOffer] = useState(() => state.saved.offer ?? offerDraft(meta.answers));
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: NAME_COUNT }, (_, i) => state.saved.warmList[i] ?? ""),
  );
  const filled = names.filter((n) => n.trim()).length;
  const ready = filled >= NAME_COUNT && offer.trim().length > MIN_OFFER_LENGTH;

  return (
    <Card className="my-0">
      <QuestHeader minutes={meta.quest.minutes} recovery={false} />
      <h2 className="mt-2 text-xl leading-snug font-bold">{meta.quest.title}</h2>
      <p className="mt-1 text-xs text-muted">
        Reward: {rewardLine(XP.dailyQuest, meta.quest.stats, false)}
      </p>

      <label htmlFor="offer" className="mt-3 block text-sm text-muted">
        Step 1. Your coach drafted your offer. Edit it until you would say it out loud.
      </label>
      <textarea
        id="offer"
        value={offer}
        onChange={(e) => setOffer(e.target.value)}
        rows={4}
        className="mt-1.5 w-full resize-y rounded-xl border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] focus:border-accent focus:outline-none"
      />

      <fieldset className="mt-3">
        <legend className="text-sm text-muted">
          Step 2. Five people who have seen your work: colleagues, ex-clients, friends who run
          something.
        </legend>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {names.map((name, i) => (
            <input
              key={i}
              aria-label={`Name ${i + 1}`}
              placeholder={`Name ${i + 1}`}
              value={name}
              onChange={(e) =>
                setNames((prev) => prev.map((n, j) => (j === i ? e.target.value : n)))
              }
              className="w-full rounded-xl border-[1.5px] border-line bg-surface px-3 py-2.5 text-[15px] focus:border-accent focus:outline-none"
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <Button disabled={!ready} onClick={() => actions.completeDay1(offer, names)}>
          {filled >= NAME_COUNT ? "Complete quest" : `Complete quest · ${filled}/5 names`}
        </Button>
        {!ready ? (
          <p className="mt-1.5 text-center text-xs text-muted">
            {filled < NAME_COUNT
              ? "Add five names to finish."
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
  const kit = state.saved.purchase.firstClientKit;
  return (
    <Card className="my-0">
      <div className="py-2 text-center">
        <div aria-hidden className="text-[40px] leading-none">
          🎉
        </div>
        <h2 className="mt-2 text-xl font-bold">Quest 1 done</h2>
        <p className="mt-1 text-muted">
          Your offer is written and 5 people are on your list. That is the step most side
          projects never take.
        </p>
      </div>
      <div className="mt-2 rounded-xl bg-bg px-3.5 py-3">
        <p className="text-sm font-bold">Tomorrow · {meta.quest.minutes} min</p>
        <p className="mt-1 text-sm text-muted">
          Send your first 3 messages. Your coach has already drafted them for the people on your
          list{kit ? ", using your First Client Kit" : ""}.
        </p>
      </div>
      <p className="mt-3 text-xs text-muted">
        Saved: your offer and your list. They are yours, and they grow every day.
      </p>
    </Card>
  );
}

/** Any day after day 1. */
function QuestCard() {
  const { actions, meta } = useCoach();
  const { quest } = meta;
  return (
    <Card className="my-0">
      <QuestHeader minutes={quest.minutes} recovery={meta.isRecovery} />
      <h2 className="mt-2 text-xl leading-snug font-bold">{quest.title}</h2>
      <p className="mt-1.5">{quest.text}</p>
      <p className="mt-2 text-xs text-muted">
        Reward:{" "}
        {rewardLine(meta.isRecovery ? XP.recoveryQuest : XP.dailyQuest, quest.stats, meta.isRecovery)}
        {meta.isRecovery ? " · keeps your streak" : ""}
      </p>
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
      <Pill tone="good">Done today</Pill>
      <h2 className="mt-2 text-xl leading-snug font-bold">{meta.quest.title}</h2>
      <p className="mt-1.5 text-muted">
        Day {state.saved.game.day} is done. Your next quest opens tomorrow.
      </p>
      <p className="mt-3 text-sm text-muted">
        Got a reply, a call or a payment today? Log it on the boss card below.
      </p>
    </Card>
  );
}
