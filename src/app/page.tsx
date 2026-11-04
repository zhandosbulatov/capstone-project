import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroCards } from "@/components/business-card";
import { HuginAvatar } from "@/components/coach/hugin";
import { Rail, RouteStrip, Stop } from "@/components/route";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { buttonClass, lowerFirst } from "@/components/ui";
import { AppPreview } from "@/components/landing/app-preview";
import { BOSS_KEYS, BOSSES, STAT_KEYS, STATS, TITLE_ORDER, TITLES } from "@/lib/game";
import { formatUsd } from "@/lib/pricing";
import { FIRST_CLIENT_KIT, introPerDay, PLAN_KEYS, PLANS } from "@/lib/quiz-data";

export const metadata: Metadata = {
  title: "AI Business Coach: your first paying client in 30 days",
  description:
    "An AI coach that turns the skill you use at work into a paid side service. Your first paying client in 30 days, 20 minutes a day, without quitting your job.",
};

const QUIZ = "/quiz";

function Cta({ children = "Take the 1-minute quiz" }: { children?: ReactNode }) {
  return (
    <Link
      href={QUIZ}
      className={buttonClass({ width: "auto" })}
    >
      {children}
    </Link>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-14 sm:py-20">
      <h2 id={id} className="font-display text-[31px] leading-[1.15] sm:text-[39px]">
        {title}
      </h2>
      {intro ? <p className="mt-3 max-w-2xl text-lg text-ink-muted">{intro}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

// Week plans from the 30-day map; each week ends with its boss.
const WEEKS: Record<(typeof BOSS_KEYS)[number], string> = {
  w1: "Write your offer in one sentence. Message people who have seen your work.",
  w2: "Send 15 warm messages Hugin drafts for you. Book 2 calls.",
  w3: "Run the call with a script. Send 2 proposals at your price.",
  w4: "Close one client. Ask for a review. Unlock Level 2.",
};

const INSTEAD = [
  {
    title: "Another course",
    body: "You finish it, get a certificate and still haven’t sold anything.",
  },
  {
    title: "Side-hustle idea videos",
    body: "A list of ideas doesn’t send a message or book a call.",
  },
  {
    title: "A business coach at $100+ an hour",
    body: `Hugin coaches you every day, from ${formatUsd(introPerDay(PLANS.p24))} a day in your first period.`,
  },
];

const HUGIN_LINES = [
  "Three messages today. Twenty minutes. The people on your list won’t message themselves.",
  "That’s a lovely screenshot of a lunch menu. I need the reply.",
  "Someone paid you for your work. Outside your job. Note the date.",
];

const FAQ = [
  {
    q: "Do I need to quit my job?",
    a: "No. AI Business Coach is built for people with a full-time job. Your first client comes from the people who already know your work.",
  },
  {
    q: "What if I’ve never freelanced?",
    a: "You start with people who have seen your work: colleagues, ex-clients, friends who run something. Week 1 asks for one reply, not a sale.",
  },
  {
    q: "How much time does it take?",
    a: "You choose 15, 20, 30 or 60 minutes a day in the quiz. Every daily quest fits the time you choose.",
  },
  {
    q: "What does it cost after the first period, and how do I cancel?",
    a: `The 4-week plan renews at ${formatUsd(PLANS.p4.fullUsd)} every 4 weeks, the 12-week plan at ${formatUsd(PLANS.p12.fullUsd)} every 12 weeks and the 24-week plan at ${formatUsd(PLANS.p24.fullUsd)} every 24 weeks. We email you 3 days before any renewal. Cancel in Settings in two taps.`,
  },
  {
    q: "Do you promise I’ll earn a certain amount?",
    a: "No. We promise steps and a deadline: a plan to your first paying client in 30 days. What you earn depends on your work, your price and your clients.",
  },
  {
    q: "Is this a real product?",
    a: "It’s a working demo built for the Zimran IT School capstone. The quiz, app and AI coach work. No payment is taken and no card details are collected.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <HuginAvatar size={30} />
          AI Business Coach
        </Link>
        <Link
          href={QUIZ}
          className={buttonClass({ variant: "secondary", size: "sm", width: "auto" })}
        >
          Take the quiz
        </Link>
      </header>

      <main id="main">
        <section className="grid items-center gap-12 pt-8 pb-16 sm:pt-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="type-display text-[39px] sm:text-[49px]">
              <span className="block text-brand-ink">Good at your job?</span>
              Someone will pay you for it.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-muted sm:text-xl">
              Get your first paying client in 30 days. 20 minutes a day, without quitting your
              job.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              <Cta />
              <p className="text-sm text-ink-muted">
                6 questions. You see your service, starting price and 30-day plan before you pay.
              </p>
            </div>
          </div>
          <HeroCards />
        </section>

        <Section
          id="instead"
          title="Sell the skill you already have"
          intro="You don’t need a new skill. You need one offer, a price and people who already know your work."
        >
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {INSTEAD.map((item) => (
              <li key={item.title} className="border-t-[1.5px] border-ink pt-3">
                <p className="text-[13px] font-semibold text-ink-muted">Instead of</p>
                <p className="mt-0.5 font-display text-xl text-ink-muted line-through decoration-brand decoration-2">
                  {item.title}
                </p>
                <p className="mt-1.5">{item.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="how"
          title="Four weeks, four bosses"
          intro="Each week ends with a boss: a real result, not a task. Beat it to unlock the tool you need for the next week."
        >
          <RouteStrip day={1} you="Day 1" className="max-w-md" />
          <Rail className="mt-8 sm:hidden">
            {BOSS_KEYS.map((key, i) => {
              const boss = BOSSES[key];
              return (
                <Stop
                  key={key}
                  kind="boss"
                  segment={i === BOSS_KEYS.length - 1 ? "none" : "ahead"}
                  label={`Week ${boss.week} · day ${boss.week * 7}`}
                >
                  <p className="font-display text-lg">{boss.name}</p>
                  <p className="mt-1 text-ink-muted">{WEEKS[key]}</p>
                  <p className="mt-1.5 text-sm text-ink-muted">Proof: {lowerFirst(boss.proof)}</p>
                </Stop>
              );
            })}
          </Rail>
          <ol className="relative mt-10 hidden grid-cols-4 gap-6 sm:grid">
            <span aria-hidden className="absolute top-[8.5px] right-0 left-0 h-[5px] bg-brand-soft" />
            {BOSS_KEYS.map((key) => {
              const boss = BOSSES[key];
              return (
                <li key={key} className="relative pt-10">
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 size-[22px] rounded-full border-4 border-ink bg-surface"
                  />
                  <p className="text-[13px] font-semibold text-ink-muted">
                    Week {boss.week} · day {boss.week * 7}
                  </p>
                  <p className="mt-0.5 font-display text-lg">{boss.name}</p>
                  <p className="mt-1.5 text-ink-muted">{WEEKS[key]}</p>
                  <p className="mt-2 text-sm text-ink-muted">Proof: {lowerFirst(boss.proof)}</p>
                </li>
              );
            })}
          </ol>
        </Section>

        <Section
          id="hugin"
          title="Meet Hugin, your coach"
          intro="Hugin is a raven and an AI coach. He drafts your messages, checks your proof screenshots and plans each day around the time you have."
        >
          <ul className="flex max-w-2xl flex-col gap-4">
            {HUGIN_LINES.map((line) => (
              <li key={line} className="flex items-start gap-3">
                <HuginAvatar size={34} />
                <p className="rounded-md border border-line bg-surface px-4 py-2.5 text-[17px]">
                  {line}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">
            Calm, dry, short. Hugin never shouts and never promises you money.
          </p>
        </Section>

        <Section
          id="progress"
          title="Watch your progress add up"
          intro="Every quest and real result adds XP and grows six stats. Your title changes as you beat each boss."
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-xl">Titles</h3>
              <Rail className="mt-4">
                {TITLE_ORDER.map((key, i) => (
                  <Stop
                    key={key}
                    kind={i === 0 ? "passed" : "boss"}
                    segment={i === TITLE_ORDER.length - 1 ? "none" : "ahead"}
                    label={TITLES[key].earnedBy}
                  >
                    <p className="font-display text-lg">{TITLES[key].label}</p>
                  </Stop>
                ))}
              </Rail>
              <h3 className="mt-10 font-display text-xl">Six stats</h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 border-t border-line">
                {STAT_KEYS.map((stat) => (
                  <div key={stat} className="border-b border-line py-3">
                    <dt className="font-semibold">{STATS[stat].label}</dt>
                    <dd className="text-sm text-ink-muted">{STATS[stat].meaning}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <AppPreview />
          </div>
        </Section>

        <Section
          id="pricing"
          title="Pricing"
          intro="Your first period is 50% off. After that, your plan renews at the full price until you cancel."
        >
          {/* Phones: one card per plan. Wider screens: the full table. */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {PLAN_KEYS.map((key) => {
              const plan = PLANS[key];
              return (
                <li
                  key={key}
                  className={`rounded-md border p-4 ${plan.tag ? "border-ink bg-sun-soft" : "border-line bg-surface"}`}
                >
                  <p className="flex items-center justify-between gap-2 font-bold">
                    {plan.name}
                    {plan.tag ? (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-on-bright">
                        {plan.tag}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1">
                    <b>{formatUsd(plan.introUsd)}</b> for the first {plan.weeks} weeks{" "}
                    <span className="text-sm text-ink-muted">({formatUsd(introPerDay(plan))} a day)</span>
                  </p>
                  <p className="text-sm text-ink-muted">
                    Then {formatUsd(plan.fullUsd)} every {plan.weeks} weeks
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto rounded-md border border-line bg-surface sm:block">
            <table className="w-full min-w-[520px] text-left">
              <caption className="sr-only">Plans and prices</caption>
              <thead className="text-sm text-ink-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 font-semibold">Plan</th>
                  <th scope="col" className="px-5 py-3 font-semibold">First period</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Then</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Per day, first period</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_KEYS.map((key) => {
                  const plan = PLANS[key];
                  return (
                    <tr key={key} className={`border-b border-line last:border-b-0 ${plan.tag ? "bg-sun-soft" : ""}`}>
                      <th scope="row" className="px-5 py-4 font-bold">
                        {plan.name}
                        {plan.tag ? (
                          <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-on-bright">
                            {plan.tag}
                          </span>
                        ) : null}
                      </th>
                      <td className="px-5 py-4">
                        <b>{formatUsd(plan.introUsd)}</b>{" "}
                        <s className="text-sm text-ink-muted">{formatUsd(plan.fullUsd)}</s>
                      </td>
                      <td className="px-5 py-4">
                        {formatUsd(plan.fullUsd)} every {plan.weeks} weeks
                      </td>
                      <td className="px-5 py-4">{formatUsd(introPerDay(plan))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="mt-5 flex flex-col gap-1.5 text-ink-muted">
            <li>We email you 3 days before any renewal.</li>
            <li>Cancel in Settings in two taps.</li>
            <li>14-day money-back guarantee if you finish the week 1 quests.</li>
            <li>
              Optional {FIRST_CLIENT_KIT.name}: {formatUsd(FIRST_CLIENT_KIT.priceUsd)} once, not a
              subscription. It gives you the week 2 and 3 tools from day 1.
            </li>
          </ul>
        </Section>

        <Section id="faq" title="Questions">
          <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold focus-visible:outline-2 focus-visible:outline-ink">
                  {item.q}
                  <span aria-hidden className="text-ink-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section
          aria-labelledby="start"
          className="grid items-center gap-8 border-t border-line py-14 sm:py-20 lg:grid-cols-2"
        >
          <div>
            <h2 id="start" className="font-display text-[31px] leading-[1.15] sm:text-[39px]">
              Your plan takes one minute
            </h2>
            <p className="mt-3 max-w-lg text-lg text-ink-muted">
              Answer 6 questions. See your service, your starting price and your first buyers.
            </p>
            <div className="mt-7">
              <Cta>Build my 30-day plan</Cta>
            </div>
          </div>
          <RouteStrip day={1} you="You, today" end="First client" className="mx-auto max-w-md" />
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-line py-8 text-sm text-ink-muted">
        <div>
          <p>AI Business Coach · Zimran IT School capstone, Team 4.</p>
          <p className="mt-1">Demo: no payments are taken and no card details are collected.</p>
        </div>
        <ThemeSwitcher />
      </footer>
    </div>
  );
}
