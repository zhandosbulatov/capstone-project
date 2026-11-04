import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today · AI Business Coach",
};

// The product: status window, quests and bosses. Placeholder until the app build.
export default function AppPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16">
      <p className="text-sm font-medium text-muted">Day 1 of 30</p>
      <h1 className="font-display text-3xl leading-tight">Today</h1>
    </main>
  );
}
