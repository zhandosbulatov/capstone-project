"use client";

import { useState } from "react";
import {
  BOSSES,
  RESULT_TYPES,
  RESULTS,
  STATS,
  TITLES,
  TOOLS,
  XP,
  STAT_POINTS,
  type BossKey,
  type ResultType,
} from "@/lib/game";
import { verifyScreenshot, type Verdict } from "@/lib/verify-client";
import { Button, Card, lowerFirst, Pill, Rewards } from "@/components/ui";
import { useCoach } from "./app-context";
import { HuginLine } from "./hugin";

const BOSS_TITLES: Partial<Record<BossKey, keyof typeof TITLES>> = {
  w1: "sideStarter",
  w3: "freelancer",
  w4: "consultant",
};

/** This week's boss: a real result, not a task. */
export function BossCard() {
  const { state, actions, meta } = useCoach();
  const key = meta.boss;
  const boss = BOSSES[key];
  const beaten = state.saved.game.bossesBeaten.includes(key);
  const title = BOSS_TITLES[key];

  return (
    <Card className="my-0">
      {beaten ? (
        <div className="mb-2">
          <Pill tone="good">Beaten</Pill>
        </div>
      ) : null}
      <h2 className="font-display text-lg leading-snug">{boss.name}</h2>
      <p className="mt-1 text-sm text-muted">Proof: {lowerFirst(boss.proof)}.</p>
      <Rewards
        parts={[`+${XP.boss} XP`, `${STATS[boss.stat].label} +${STAT_POINTS.boss}`]}
        note={`${title ? `Title ${TITLES[title].label}. ` : ""}Unlocks ${TOOLS[boss.unlocks].label.toLowerCase()}.`}
      />
      {beaten ? null : (
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={() => actions.openSheet({ kind: "log", result: boss.result })}
          >
            Log a result
          </Button>
        </div>
      )}
    </Card>
  );
}

type Step =
  | { kind: "choose" }
  | { kind: "checking" }
  | { kind: "verdict"; verdict: Verdict };

/** Log a real result: screenshot proof (full XP) or self-report (half XP). */
export function LogResultSheet({ initial }: { initial?: ResultType }) {
  const { actions } = useCoach();
  const [result, setResult] = useState<ResultType>(initial ?? "firstReply");
  const [step, setStep] = useState<Step>({ kind: "choose" });

  async function onFile(file: File | undefined) {
    if (!file) return;
    setStep({ kind: "checking" });
    const verdict = await verifyScreenshot(file, result);
    if (verdict.status === "verified") {
      actions.recordResult(result, "verified");
      return;
    }
    setStep({ kind: "verdict", verdict });
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Log a result</h2>
      <p className="mt-1 text-sm text-muted">
        Real results earn the most: {XP.resultVerified} XP with a screenshot, {XP.resultSelfReported}{" "}
        XP without.
      </p>

      <label htmlFor="result" className="mt-4 block text-sm font-semibold">
        What happened?
      </label>
      <select
        id="result"
        value={result}
        onChange={(e) => {
          setResult(e.target.value as ResultType);
          setStep({ kind: "choose" });
        }}
        className="mt-1.5 w-full rounded-md border-[1.5px] border-line bg-surface px-3 py-3 text-[15px] focus:border-accent focus:outline-none"
      >
        {RESULT_TYPES.map((type) => (
          <option key={type} value={type}>
            {RESULTS[type].label}
          </option>
        ))}
      </select>

      <div className="mt-4 rounded-md bg-warn-soft px-3.5 py-3 text-[13px] text-warn">
        Crop or blur other people&apos;s names before you upload. We check the screenshot and keep
        only the verdict, never the image.
      </div>

      {step.kind === "verdict" ? (
        <HuginLine>{step.verdict.reason}</HuginLine>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        <label
          className={`block w-full cursor-pointer rounded-md bg-accent px-[18px] py-[14px] text-center font-semibold text-accent-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${step.kind === "checking" ? "pointer-events-none opacity-40" : ""}`}
        >
          {step.kind === "checking"
            ? "Hugin is checking…"
            : step.kind === "verdict"
              ? "Upload another screenshot"
              : "Upload a screenshot"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={step.kind === "checking"}
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <Button
          variant="outline"
          disabled={step.kind === "checking"}
          onClick={() => actions.recordResult(result, "self")}
        >
          No screenshot possible · log it anyway
        </Button>
        <Button variant="ghost" onClick={actions.closeSheet}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
