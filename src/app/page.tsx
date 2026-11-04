import Link from "next/link";

// Landing page. Placeholder until the landing build.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <p className="text-sm font-medium text-accent">Good at your job?</p>
      <h1 className="font-display text-4xl leading-tight">
        Someone will pay you for it.
      </h1>
      <p className="text-lg text-muted">
        Your first paying client in 30 days — 20 minutes a day, without quitting
        your job.
      </p>
      <Link
        href="/quiz"
        className="inline-flex h-12 w-fit items-center rounded-full bg-accent px-6 font-medium text-accent-ink"
      >
        Take the 1-minute quiz
      </Link>
    </main>
  );
}
