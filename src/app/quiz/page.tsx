import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build your plan · AI Business Coach",
};

// Onboarding funnel. Placeholder until the quiz build.
export default function QuizPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16">
      <p className="text-sm font-medium text-muted">6 quick questions · 1 minute</p>
      <h1 className="font-display text-3xl leading-tight">
        Build your 30-day plan to a first paying client
      </h1>
    </main>
  );
}
