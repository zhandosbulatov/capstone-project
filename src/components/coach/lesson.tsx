"use client";

// Placeholder from the base: title, body and a way to finish. Lane L4 designs it.

import { useState } from "react";
import { LESSONS } from "@/lib/curriculum";
import type { LessonId } from "@/lib/model";
import { Button, fieldClass } from "@/components/ui";
import { useCoach } from "./app-context";

export function LessonSheet({ id }: { id: LessonId }) {
  const { state, actions } = useCoach();
  const lesson = LESSONS[id];
  const progress = state.saved.lessons[id];
  const [fields, setFields] = useState<Record<string, string>>(() => progress?.decision ?? {});

  return (
    <div>
      <h2 className="text-xl font-bold">{lesson.title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{lesson.minutes} min</p>
      {lesson.body.map((p, i) => (
        <p key={i} className="mt-2">
          {p}
        </p>
      ))}
      {lesson.decision ? (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm text-ink-muted">{lesson.decision.intro}</p>
          {lesson.decision.fields.map((f) => (
            <input
              key={f.id}
              aria-label={f.label}
              placeholder={f.placeholder}
              value={fields[f.id] ?? ""}
              onChange={(e) => setFields((prev) => ({ ...prev, [f.id]: e.target.value }))}
              className={fieldClass}
            />
          ))}
          <Button
            disabled={!lesson.decision.fields.every((f) => fields[f.id]?.trim())}
            onClick={() => {
              actions.saveDecision(id, fields);
              actions.closeSheet();
            }}
          >
            Save decision
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <Button
            onClick={() => {
              actions.markLessonRead(id);
              actions.closeSheet();
            }}
          >
            {progress?.readDay !== undefined ? "Read" : "Mark as read"}
          </Button>
        </div>
      )}
    </div>
  );
}
