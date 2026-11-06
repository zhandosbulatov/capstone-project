import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroCards } from "@/components/business-card";
import { HuginAvatar } from "@/components/coach/hugin";
import { Rail, RouteStrip, Stop } from "@/components/route";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { buttonClass } from "@/components/ui";
import { AppPreview } from "@/components/landing/app-preview";
import { LESSON_ORDER, LESSONS } from "@/lib/curriculum";
import { TITLE_ORDER, TITLES } from "@/lib/game";
import { formatUsd } from "@/lib/pricing";
import { FIRST_CLIENT_KIT, introPerDay, PLAN_KEYS, PLANS } from "@/lib/quiz-data";

export const metadata: Metadata = {
  title: "AI Business Coach: a plan to your first paying client in 12 weeks",
  description:
    "An AI coach that turns the skill you use at work into a paid side service. A plan to your first paying client in 12 weeks. 20 minutes a day, without quitting your job.",
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
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-14 sm:py-20">
      <h2 id={id} className="font-display text-h1 leading-[1.15] sm:text-display">
        {title}
      </h2>
      {intro ? <p className="mt-3 max-w-2xl text-lg text-ink-muted">{intro}</p> : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}

const MILESTONES = ["First reply", "First call", "First proposal", "First client"];

const STEPS = [
  {
    title: "Tell us what you do at work.",
    body: "Six questions give you an offer, a starting price and your first buyers, before you pay.",
  },
  {
    title: "Add 5 people who know your work.",
    body: "Ex-colleagues, past clients, friends who run something. Tap how you know each one.",
  },
  {
    title: "Each day, one step.",
    body: "Hugin picks it and writes the message. You read it, change what you like, and send it.",
  },
];

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
  "One message today. To Sarah. It’s already written.",
  "She asked how much. That’s a good sign. Here’s your answer.",
  "Someone paid you for your work. Outside your job. Note the date.",
];

const SARAH_CARD =
  "Hi Sarah, it’s been a while. I’ve started offering brand starter kits to local businesses on the side. You know how I work, so I wanted you to hear it first. Open to a quick chat?";
const SARAH_REPLY = "Sounds interesting, how much would that be?";
const HUGIN_ANSWER =
  "Hi Sarah, a starter kit is $450 for the whole project. Want to do a 15-minute call this week so I can hear what you need? Thursday or Friday works for me.";

const FAQ = [
  {
    q: "Do I need to quit my job?",
    a: "No. AI Business Coach is built for people with a full-time job. Your first client comes from the people who already know your work.",
  },
  {
    q: "What if I’ve never freelanced?",
    a: "You start with people who have seen your work: colleagues, ex-clients, friends who run something. Your first goal is one reply, not a sale.",
  },
  {
    q: "How much time does it take?",
    a: "Plan for 20 minutes a day. On a busy evening, one step, about 2 minutes, keeps you moving.",
  },
  {
    q: "What does it cost after the first period, and how do I cancel?",
    a: `The 4-week plan renews at ${formatUsd(PLANS.p4.fullUsd)} every 4 weeks, the 12-week plan at ${formatUsd(PLANS.p12.fullUsd)} every 12 weeks and the 24-week plan at ${formatUsd(PLANS.p24.fullUsd)} every 24 weeks. We email you 3 days before any renewal. Cancel in Settings in two taps.`,
  },
  {
    q: "Do you promise I’ll earn a certain amount?",
    a: "No. We promise steps and a deadline: a plan to your first paying client in 12 weeks. What you earn depends on your work, your price and your clients.",
  },
  {
    q: "Will my employer find out?",
    a: "Not from us. Nothing is posted publicly, and you message people from your own phone or email. Check your employment contract first. The app’s first lesson shows you what to look for.",
  },
  {
    q: "Do I need a website or a company first?",
    a: "No. Your first client comes from people who already know your work. The money lesson covers what to sort out after your first payment.",
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
            <h1 className="type-display text-display sm:text-hero">
              <span className="block text-brand-ink">Good at your job?</span>
              Someone will pay you for it.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-muted sm:text-xl">
              A plan to your first paying client in 12 weeks. 20 minutes a day, without quitting
              your job.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              <Cta />
              <p className="text-sm text-ink-muted">
                Most of the work is one message a day. Your first reply can come in week 1.
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
                <p className="text-label font-semibold text-ink-muted">Instead of</p>
                <p className="mt-0.5 font-display text-xl text-ink-muted line-through decoration-brand decoration-2">
                  {item.title}
                </p>
                <p className="mt-1.5">{item.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="how" title="One step a day to your first client">
          <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t-[1.5px] border-ink pt-3">
                <p className="text-label font-semibold text-ink-muted">Step {i + 1}</p>
                <p className="mt-0.5 font-display text-xl">{step.title}</p>
                <p className="mt-1.5 text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <ol
            aria-label="Your milestones"
            className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 font-semibold"
          >
            {MILESTONES.map((m, i) => (
              <li key={m} className="flex items-center gap-2">
                <span className="rounded-full border border-line-strong bg-surface px-3.5 py-1.5">
                  {m}
                </span>
                {i < MILESTONES.length - 1 ? (
                  <span aria-hidden className="text-ink-muted">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="hugin"
          title="Hugin writes it. You send it."
          intro="Hugin knows your offer, your price and how you know each person. When someone replies, paste it in and he writes your answer."
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex max-w-xl flex-col gap-3">
              <p className="rounded-md border border-line bg-surface px-4 py-3">
                <span className="type-label block">Your card to Sarah</span>
                {SARAH_CARD}
              </p>
              <p className="self-end rounded-md bg-sand px-4 py-3">
                <span className="type-label block">Sarah</span>
                <i>“{SARAH_REPLY}”</i>
              </p>
              <p className="rounded-md border border-line bg-surface px-4 py-3">
                <span className="type-label block">Hugin’s answer</span>
                {HUGIN_ANSWER}
              </p>
              <ul className="mt-4 flex flex-col gap-4">
                {HUGIN_LINES.map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <HuginAvatar size={34} />
                    <p className="rounded-md border border-line bg-surface px-4 py-2.5 text-lg">
                      {line}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-ink-muted">
                Calm, dry, short. Hugin never shouts and never promises you money.
              </p>
            </div>
            <AppPreview />
          </div>
        </Section>

        <Section
          id="lessons"
          title="Learn the business as you go"
          intro="Nine short lessons, each at the moment you need it: pricing when someone asks ‘how much?’, a simple agreement before your first proposal, money basics after your first payment. Each one takes 3 minutes and ends with a decision Hugin uses from then on."
        >
          <ol className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {LESSON_ORDER.map((id, i) => (
              <li key={id} className="flex gap-3 border-t border-line py-3">
                <span className="w-5 text-ink-muted tabular-nums">{i + 1}</span>
                <span className="font-semibold">{LESSONS[id].title}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="progress"
          title="See real progress, not points"
          intro="Your Client #1 card shows who’s on your list, who you’ve messaged, who replied and who paid. Your title changes when something real happens: Side Starter at your first reply, Consultant at your first payment."
        >
          <h3 className="font-display text-xl">Titles</h3>
          <Rail className="mt-4 max-w-md">
            {TITLE_ORDER.slice(0, 4).map((key, i) => (
              <Stop
                key={key}
                kind={i === 0 ? "passed" : "boss"}
                segment={i === 3 ? "none" : "ahead"}
                label={TITLES[key].earnedBy}
              >
                <p className="font-display text-lg">{TITLES[key].label}</p>
              </Stop>
            ))}
          </Rail>
        </Section>

        <Section
          id="private"
          title="Private by design"
          intro="No public posts, no ‘open for work’ badge. You message people one at a time, from your own phone or email. The first lesson shows what to check in your employment contract before you start."
        />

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
                  <th scope="col" className="px-5 py-3 text-right font-semibold">First period</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Then</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Per day, first period</th>
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
                      <td className="px-5 py-4 text-right tabular-nums">
                        <b>{formatUsd(plan.introUsd)}</b>{" "}
                        <s className="text-sm text-ink-muted">{formatUsd(plan.fullUsd)}</s>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {formatUsd(plan.fullUsd)} every {plan.weeks} weeks
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">{formatUsd(introPerDay(plan))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="mt-5 flex flex-col gap-1.5 text-ink-muted">
            <li>We email you 3 days before any renewal.</li>
            <li>Cancel in Settings in two taps.</li>
            <li>14-day money-back guarantee if you complete your first 7 daily steps.</li>
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
            <h2 id="start" className="font-display text-h1 leading-[1.15] sm:text-display">
              Your plan takes one minute
            </h2>
            <p className="mt-3 max-w-lg text-lg text-ink-muted">
              Answer 6 questions. See your service, your starting price and your first buyers.
            </p>
            <div className="mt-7">
              <Cta>Build my plan</Cta>
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
