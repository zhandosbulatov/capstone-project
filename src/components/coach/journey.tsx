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
import { Icon } from "@/components/icons";
import { Rail, RouteStrip, Stop } from "@/components/route";
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
      <h1 className="font-display text-h1 leading-tight">Your journey</h1>

      <section aria-labelledby="map" className="rounded-md border border-line bg-surface px-4 pt-3 pb-4">
        <h2 id="map" className="sr-only">
          30-day map
        </h2>
        <RouteStrip day={game.day} />
        <Rail className="mt-4">
          {BOSS_KEYS.map((key, i) => {
            const boss = BOSSES[key];
            const beaten = game.bossesBeaten.includes(key);
            const current = meta.week === boss.week && !beaten;
            const travelled = game.day >= boss.week * 7;
            return (
              <Stop
                key={key}
                kind={beaten ? "bossDone" : current ? "now" : "boss"}
                segment={i === BOSS_KEYS.length - 1 ? "none" : travelled ? "travelled" : "ahead"}
                label={`Week ${boss.week} · day ${boss.week * 7}${current ? " · you are here" : ""}`}
              >
                <p className="font-display text-lg leading-snug">
                  {boss.name}
                  {beaten ? <span className="sr-only"> (beaten)</span> : null}
                </p>
                <p className="text-sm text-ink-muted">
                  {beaten
                    ? `Beaten. Unlocked: ${TOOLS[boss.unlocks].label.toLowerCase()}.`
                    : `Proof: ${lowerFirst(boss.proof)}.`}
                </p>
              </Stop>
            );
          })}
        </Rail>
      </section>

      <Card className="my-0">
        <Label>Titles</Label>
        <ol className="mt-2 flex flex-col gap-2">
          {TITLE_ORDER.map((key, i) => (
            <li key={key} className={i <= titleIndex ? "" : "text-ink-muted"}>
              <span className="font-semibold">{TITLES[key].label}</span>
              {key === meta.title ? (
                <span className="ml-2">
                  <Pill tone="success">Now</Pill>
                </span>
              ) : null}
              <span className="block text-sm text-ink-muted">{TITLES[key].earnedBy}</span>
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
                  className="flex w-full cursor-pointer items-center justify-between rounded-md bg-canvas px-3.5 py-3 text-left font-semibold hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-ink"
                >
                  {TOOL_LABELS[tool]}
                  <Icon name="arrowRight" size={18} className="text-ink-muted" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">
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
                <span className="text-ink-muted">
                  Day {r.day} · {r.proof === "verified" ? "verified" : "self-reported"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">Nothing logged yet. Your first reply goes here.</p>
        )}
        <p className="mt-3 text-xs text-ink-muted">
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
      <p className="mt-1 text-sm text-ink-muted">{doc.intro}</p>
      <div className="mt-4 flex flex-col gap-3">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h3 className="text-sm font-bold">{section.heading}</h3>
            <p className="mt-0.5 text-base whitespace-pre-line">{section.body}</p>
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
