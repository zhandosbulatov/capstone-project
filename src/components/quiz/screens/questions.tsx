"use client";

// Q2–Q6: one question each, options auto-advance.

import {
  BLOCKER_KEYS,
  BLOCKERS,
  EXPERIENCE,
  EXPERIENCE_KEYS,
  GOAL_KEYS,
  GOALS,
  PAID_BEFORE,
  PAID_KEYS,
  TIME_KEYS,
  TIMES,
  type QuizAnswers,
} from "@/lib/quiz-data";
import { useQuiz } from "../quiz-context";
import { Option, OptionList, ScreenBody, ScreenSub, ScreenTitle } from "../quiz-ui";

type Choice<V> = { value: V; label: string; icon?: string };

function Question<K extends keyof QuizAnswers>({
  answerKey,
  title,
  sub,
  choices,
}: {
  answerKey: K;
  title: string;
  sub?: string;
  choices: Choice<QuizAnswers[K]>[];
}) {
  const { state, actions } = useQuiz();
  return (
    <ScreenBody>
      <ScreenTitle>{title}</ScreenTitle>
      {sub ? <ScreenSub>{sub}</ScreenSub> : null}
      <OptionList label={title}>
        {choices.map((choice) => (
          <Option
            key={String(choice.value)}
            icon={choice.icon}
            selected={state.answers[answerKey] === choice.value}
            onSelect={() => actions.pick(answerKey, choice.value)}
          >
            {choice.label}
          </Option>
        ))}
      </OptionList>
    </ScreenBody>
  );
}

export function YearsScreen() {
  return (
    <Question
      answerKey="years"
      title="How long have you been doing it?"
      sub="We use this to set your starting price."
      choices={EXPERIENCE_KEYS.map((value) => ({ value, label: EXPERIENCE[value].label }))}
    />
  );
}

export function PaidScreen() {
  return (
    <Question
      answerKey="paid"
      title="Has anyone paid you for it outside your job?"
      choices={PAID_KEYS.map((value) => ({
        value,
        label: PAID_BEFORE[value].label,
        icon: PAID_BEFORE[value].icon,
      }))}
    />
  );
}

export function GoalScreen() {
  return (
    <Question
      answerKey="goal"
      title="What extra income would feel like a win in 6 months?"
      sub="Your goal, not our promise. We use it to plan your pace."
      choices={GOAL_KEYS.map((value) => ({ value, label: GOALS[value].label }))}
    />
  );
}

export function TimeScreen() {
  return (
    <Question
      answerKey="time"
      title="How much time can you give it on a workday?"
      choices={TIME_KEYS.map((value) => ({ value, label: TIMES[value].label }))}
    />
  );
}

export function BlockerScreen() {
  return (
    <Question
      answerKey="blocker"
      title="What stops you most right now?"
      choices={BLOCKER_KEYS.map((value) => ({
        value,
        label: BLOCKERS[value].label,
        icon: BLOCKERS[value].icon,
      }))}
    />
  );
}
