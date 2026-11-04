"use client";

import {
  BOSS_KEYS,
  BOSSES,
  RESULTS,
  TITLE_ORDER,
  TITLES,
  TOOLS,
} from "@/lib/game";
import { GOALS } from "@/lib/quiz-data";
import { toolDoc, TOOL_LABELS, type AnyToolKey } from "@/lib/tools";
import { Button, Card, Label, lowerFirst, Pill } from "@/components/ui";
import { useCoach } from "./app-context";

export function Journey() {
  const { state, actions, meta } = useCoach();
  const { game } = state.saved;
  const titleIndex = TITLE_ORDER.indexOf(meta.title);
  const goal = GOALS[meta.answers.goal];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-3xl">Your journey</h1>

      <Card className="my-0">
        <Label>30-day map</Label>
        <ol className="mt-2 flex flex-col gap-2.5">
          {BOSS_KEYS.map((key) => {
            const boss = BOSSES[key];
            const beaten = game.bossesBeaten.includes(key);
            const current = meta.week === boss.week && !beaten;
            return (
              <li key={key} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-0.5 grid size-6 flex-none place-items-center rounded-full text-xs font-bold ${beaten ? "bg-good text-white" : current ? "border-2 border-accent text-accent" : "border-2 border-line text-muted"}`}
                >
                  {beaten ? "✓" : boss.week}
                </span>
                <div>
                  <p className="font-semibold">
                    Week {boss.week} · {boss.name}
                    {beaten ? <span className="sr-only"> (beaten)</span> : null}
                  </p>
                  <p className="text-sm text-muted">
                    {beaten
                      ? `Beaten. Unlocked: ${TOOLS[boss.unlocks].label.toLowerCase()}.`
                      : `Proof: ${lowerFirst(boss.proof)}.`}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="my-0">
        <Label>Titles</Label>
        <ol className="mt-2 flex flex-col gap-2">
          {TITLE_ORDER.map((key, i) => (
            <li key={key} className={i <= titleIndex ? "" : "text-muted"}>
              <span className="font-semibold">{TITLES[key].label}</span>
              {key === meta.title ? (
                <span className="ml-2">
                  <Pill tone="good">Now</Pill>
                </span>
              ) : null}
              <span className="block text-sm text-muted">{TITLES[key].earnedBy}</span>
            </li>
          ))}
        </ol>
        {meta.title === "consultant" ? (
          <div className="mt-3">
            <Button variant="outline" onClick={actions.reachGoal}>
              My side income reached {goal.monthlyUsd ? goal.label : "my goal"}
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="my-0">
        <Label>Your tools</Label>
        {meta.tools.length ? (
          <ul className="mt-2 flex flex-col gap-1.5">
            {meta.tools.map((tool) => (
              <li key={tool}>
                <button
                  type="button"
                  onClick={() => actions.openSheet({ kind: "tool", tool })}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-bg px-3.5 py-3 text-left font-semibold hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {TOOL_LABELS[tool]}
                  <span aria-hidden>→</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Beat the week 1 boss to unlock your call script.
          </p>
        )}
      </Card>

      <Card className="my-0">
        <Label>Results</Label>
        {game.results.length ? (
          <ul className="mt-2 flex flex-col gap-1">
            {game.results.map((r, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm">
                <span>{RESULTS[r.type].label}</span>
                <span className="text-muted">
                  Day {r.day} · {r.proof === "verified" ? "verified" : "self-reported"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Nothing logged yet. Your first reply goes here.</p>
        )}
        <p className="mt-3 text-xs text-muted">
          Best streak: {game.bestStreak} {game.bestStreak === 1 ? "day" : "days"}
        </p>
      </Card>
    </div>
  );
}

export function ToolSheet({ tool }: { tool: AnyToolKey }) {
  const { state, actions } = useCoach();
  const doc = toolDoc(tool, state.saved.answers, state.saved.offer);
  return (
    <div>
      <h2 className="text-xl font-bold">{doc.title}</h2>
      <p className="mt-1 text-sm text-muted">{doc.intro}</p>
      <div className="mt-4 flex flex-col gap-3">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h3 className="text-sm font-bold">{section.heading}</h3>
            <p className="mt-0.5 text-[15px] whitespace-pre-line">{section.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-5">
        <Button variant="outline" onClick={actions.closeSheet}>
          Close
        </Button>
      </div>
    </div>
  );
}
