"use client";

import { useState } from "react";
import { BOSSES, STATS, TITLES, TOOLS, XP, type BossKey, type ResultType } from "@/lib/game";
import { verifyScreenshot, type Verdict } from "@/lib/verify-client";
import { Button, buttonClass, Card, lowerFirst, Pill } from "@/components/ui";
import { useCoach } from "./app-context";
import { HuginLine } from "./hugin";

const BOSS_TITLES: Partial<Record<BossKey, keyof typeof TITLES>> = {
  w1: "sideStarter",
  w3: "freelancer",
  w4: "consultant",
};

/** This week's milestone: a real result, not a task. It earns the title by itself. */
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
          <Pill tone="success">Beaten</Pill>
        </div>
      ) : null}
      <h2 className="font-display text-lg leading-snug">{boss.name}</h2>
      <p className="mt-1 text-sm text-ink-muted">Proof: {lowerFirst(boss.proof)}.</p>
      <p className="mt-1 text-sm text-ink-muted">
        {title ? `Title ${TITLES[title].label}. ` : ""}Unlocks {TOOLS[boss.unlocks].label.toLowerCase()}.
        Grows {STATS[boss.stat].label}.
      </p>
      {beaten ? null : (
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={() => actions.openSheet({ kind: "log", result: boss.result })}
          >
            Add proof
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

/**
 * Optional "Add proof" for the first payment. The payment already counts from the pipeline; a
 * verified screenshot only adds the verified XP and never changes titles.
 */
export function LogResultSheet({ initial }: { initial?: ResultType }) {
  const { actions } = useCoach();
  const result: ResultType = initial ?? "clientPaid";
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
      <h2 className="text-xl font-bold">Add proof</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Optional. A screenshot of the payment earns {XP.resultVerified} XP. Your title doesn&apos;t
        depend on it.
      </p>

      <div className="mt-4 rounded-md bg-warning-soft px-3.5 py-3 text-label text-warning-ink">
        Crop or blur other people&apos;s names before you upload. We check the screenshot and keep
        only the verdict, never the image.
      </div>

      {step.kind === "verdict" ? (
        <HuginLine>{step.verdict.reason}</HuginLine>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        <label
          className={`${buttonClass()} focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${step.kind === "checking" ? "pointer-events-none opacity-40" : ""}`}
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
        <Button variant="ghost" onClick={actions.closeSheet}>
          Not now
        </Button>
      </div>
    </div>
  );
}
