"use client";

// A lesson: read it, then either "Got it" (read-only) or write one decision Hugin will use.

import { useState } from "react";
import { LESSONS } from "@/lib/curriculum";
import { fetchReview } from "@/lib/hugin-client";
import type { DecisionReview, LessonId } from "@/lib/model";
import { Button, fieldClass, Label, Pill } from "@/components/ui";
import { useCoach } from "./app-context";
import { ADVICE_TAG_LESSONS } from "./l4-helpers";

export function LessonSheet({ id }: { id: LessonId }) {
  const { state, actions, meta } = useCoach();
  const lesson = LESSONS[id];
  const progress = state.saved.lessons[id];
  const decision = lesson.decision;
  const [fields, setFields] = useState<Record<string, string>>(() => progress?.decision ?? {});
  const [review, setReview] = useState<DecisionReview | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const complete = Boolean(decision?.fields.every((f) => fields[f.id]?.trim()));

  async function askHugin() {
    setReviewing(true);
    setReviewError(null);
    const result = await fetchReview({ lessonId: id, fields, context: meta.huginContext });
    setReviewing(false);
    if ("error" in result) setReviewError(result.error);
    else setReview(result.review);
  }

  function edit(fieldId: string, value: string) {
    setSaved(false);
    setFields((prev) => ({ ...prev, [fieldId]: value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">{lesson.title}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <span>{lesson.minutes} min read</span>
          {ADVICE_TAG_LESSONS.includes(id) ? <Pill tone="warning">Not legal or tax advice</Pill> : null}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {lesson.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {lesson.keyPoints.length ? (
        <div>
          <Label>Key points</Label>
          <ul className="mt-1 list-disc pl-5">
            {lesson.keyPoints.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {lesson.links.length ? (
        <div>
          <Label>Read more</Label>
          <ul className="mt-1 flex flex-col gap-1">
            {lesson.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-ink underline underline-offset-2"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {decision ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <p className="text-sm text-ink-muted">{decision.intro}</p>
          {decision.fields.map((f) => {
            const improved = review?.improved[f.id];
            const common = {
              id: `lesson-${id}-${f.id}`,
              placeholder: f.placeholder,
              value: fields[f.id] ?? "",
              onChange: (e: { target: { value: string } }) => edit(f.id, e.target.value),
            };
            return (
              <div key={f.id} className="flex flex-col gap-1">
                <label htmlFor={common.id} className="text-sm font-semibold">
                  {f.label}
                </label>
                {f.multiline ? (
                  <textarea rows={3} className={`resize-y ${fieldClass}`} {...common} />
                ) : (
                  <input className={fieldClass} {...common} />
                )}
                {f.help ? <p className="text-xs text-ink-muted">{f.help}</p> : null}
                {improved && improved !== fields[f.id] ? (
                  <div className="mt-1 rounded-md bg-canvas px-3.5 py-3 text-sm">
                    <p className="text-ink-muted">Hugin&apos;s version</p>
                    <p className="mt-0.5 whitespace-pre-line">{improved}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      width="auto"
                      className="mt-2"
                      onClick={() => edit(f.id, improved)}
                    >
                      Use this
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}

          {review?.feedback.length ? (
            <ul className="list-disc rounded-md bg-canvas py-3 pr-3.5 pl-8 text-sm">
              {review.feedback.slice(0, 3).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
          {reviewError ? (
            <p role="status" className="text-sm text-ink-muted">
              {reviewError}
            </p>
          ) : null}

          <Button
            variant="secondary"
            status={reviewing ? "loading" : "idle"}
            disabled={!complete}
            onClick={askHugin}
          >
            Ask Hugin to review
          </Button>
          <Button
            disabled={!complete}
            onClick={() => {
              actions.saveDecision(id, fields);
              setSaved(true);
            }}
          >
            Save
          </Button>
          {saved ? (
            <p role="status" className="text-sm font-semibold">
              Saved. Hugin uses this from now on: {decision.usedFor}
            </p>
          ) : null}
        </div>
      ) : (
        <Button
          onClick={() => {
            actions.markLessonRead(id);
            actions.closeSheet();
          }}
        >
          Got it
        </Button>
      )}
    </div>
  );
}
