@AGENTS.md

# AI Business Coach

An AI coach that takes an employed professional from a skill they use at work to a first paying client of a solo side service. Zimran IT School capstone, Team 4.

## Before building a feature

- The product brief is the source of truth. Its location is in `CLAUDE.local.md` (personal, not in git). Read the relevant section of the brief before building anything.
- Never copy the brief or other internal files (research, homework, mentor notes) into this repo. Product data the code needs (quiz options, prices, XP tables) is fine.
- Deadline: 6 Nov, 12:00 Almaty. Prefer working and simple over complete.

## Structure

- `/` landing page, `/quiz` onboarding funnel, `/app` the product.
- `src/app/api/*` route handlers. Gemini calls happen only here.
- `src/lib/*` data and logic as plain TypeScript, no React.
- Design tokens are CSS variables in `src/app/globals.css`, exposed to Tailwind as `bg`, `surface`, `ink`, `muted`, `line`, `bar`, `accent`, `accent-ink`, `accent-soft`, `good`, `bad`, `warn` (plus `-soft` variants). Fonts: `font-sans` (Geist) for text, `font-display` (Fraunces) for headings. Use tokens, not raw colours.

## Design rules

- Game-style information, NOT a game look. Use a status window, quest cards and short growth notifications ("Reach +1", "Level 5"). No neon, pixel art, game fonts, in-app currency, chests or E→S ranks.
- Calm and adult: the audience is employees aged 28–45 in the US and UK. All UI copy in English.
- Solo only: no leaderboards, guilds or comparison with other users.
- Mobile first: everything must work at 375 px wide.

## Hugin, the coach

- A raven. Calm, dry humour, short sentences. Never cheesy, never shouts, **never uses exclamation marks**.
- Never promises an amount of income. No medical, legal or tax advice.

## Technical rules

- `GEMINI_API_KEY` is server-only. Never import it into a client component or expose it with `NEXT_PUBLIC_`.
- State lives in `localStorage` only (versioned key, every read and write in try/catch). No database, no auth.
- No real payments: checkout is simulated and never shows card fields.
- Paywall compliance is graded: the auto-renew consent is never pre-ticked, and the full price after the intro period is shown before Pay.

## Local setup note

On the team's Windows PC, Avast intercepts HTTPS. If npm, Node, Gemini calls or the Vercel CLI fail with `unable to get local issuer certificate`, run with `NODE_OPTIONS=--use-system-ca` (Node 22.15+).
