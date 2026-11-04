# AI Business Coach

An AI coach that takes someone who is good at their job to a first paying client of their own side service in 30 days, 20 minutes a day, without quitting.

Built by Team 4 (Jandos, Temirlan) for the Zimran IT School capstone.

## Live links

- **Landing page:** https://ai-business-coach-blush.vercel.app
- **Product (start with the quiz):** https://ai-business-coach-blush.vercel.app/quiz
- **Demo mode:** https://ai-business-coach-blush.vercel.app/quiz?demo=1 adds a screen map to the quiz and day controls to the app, so you can see a week of progress in a minute.

## What it does

1. **Quiz (`/quiz`):** six questions about your skill, experience, goal, time and main blocker. You get a personal plan before you pay: a service to sell, a starting price, your first buyers and a four-week map.
2. **Paywall and checkout:** three plans with 50% off the first period, a billing timeline, and an auto-renewal checkbox that is never pre-ticked. Checkout is simulated.
3. **The app (`/app`):** one quest a day, sized to your time. Quests and real results earn XP, grow six stats and change your title, from Employee to Consultant. Each week ends with a boss: a real result such as a first reply or a first paying client.
4. **Hugin, the coach:** a raven with a dry sense of humour. He drafts your messages and proposals, checks proof screenshots and answers questions in a chat.

## Screenshots

| Landing | Personal plan | Paywall |
| --- | --- | --- |
| ![Landing page hero with the app preview](docs/screenshots/01-landing.png) | ![Personal plan: service, price, first buyers and four weeks](docs/screenshots/02-plan.png) | ![Paywall with three plans, billing timeline and unticked renewal consent](docs/screenshots/03-paywall.png) |

| Today, day 8 | Drafts from Hugin |
| --- | --- |
| ![Status window with title, level, XP and six stats, and today's quest](docs/screenshots/04-app-today.png) | ![Three outreach messages drafted by Hugin, each with a Copy button](docs/screenshots/05-hugin-drafts.png) |

## Tech stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS 4 with design tokens in `src/app/globals.css`, light and dark themes
- **AI:** Google Gemini through the `@google/genai` SDK, called only from server route handlers
- **Animation:** React `<ViewTransition>` for screen changes, growth notifications and sheets; turned off under reduced motion
- **Tests:** Vitest, 66 tests for pricing, the game rules, quests, tools and Hugin's input handling
- **Hosting:** Vercel

## How the Gemini parts work

Three API routes call Gemini. The API key stays on the server and never reaches the browser.

| Route | What it does | Model |
| --- | --- | --- |
| `POST /api/draft` | Writes three offer, outreach, follow-up or proposal drafts for today's quest, returned as JSON | `gemini-3.5-flash-lite` |
| `POST /api/verify` | Checks whether a proof screenshot shows the claimed result (a reply, a booking, a payment) and answers in Hugin's voice | `gemini-3.6-flash` |
| `POST /api/chat` | A streamed chat with Hugin | `gemini-3.5-flash-lite` |

- **One personality:** every call shares Hugin's system prompt in `src/lib/hugin.ts`. He is calm, uses no exclamation marks, never promises income, gives no legal, tax or medical advice, and never invents shared history with the person a message goes to.
- **Privacy:** the browser sends only the user's service, price and offer. The warm list of names is never sent. Screenshots are checked and dropped: only the verdict is saved.
- **Reliability:** if the main model is overloaded or returns nothing, the call retries on a backup model. If Gemini is down, Hugin says so in one line and the quest still works.
- **Cost protection:** a per-visitor limit (for example 15 screenshot checks per 10 minutes) keeps a public link from using up the API quota.

## What the MVP simulates, and why

| Part | In the MVP | Why |
| --- | --- | --- |
| Payments | Apple Pay, Google Pay and card buttons simulate a successful payment. No card details are collected. | The capstone tests the funnel and the product, not a payment provider. |
| Email | The email is stored in the browser and never sent. | No email service is needed to show the flow. |
| Accounts and data | Progress is saved in the browser's `localStorage`. There is no login or database. | Keeps the demo instant and private. A real launch would add accounts. |
| Days | The day count follows the calendar. Missed days use a Streak Shield or become a recovery quest. Demo mode can move ahead of the calendar. | Lets the jury see weeks of progress in one session. |

## Run it locally

You need Node.js 22 or newer and a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
npm install
```

```bash
cp .env.example .env.local
```

Add your key to `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
```

Start the dev server and open http://localhost:3000:

```bash
npm run dev
```

If your antivirus scans HTTPS traffic (Avast does) and `npm` or Gemini calls fail with `unable to get local issuer certificate`, tell Node.js to use the Windows certificate store:

```powershell
$env:NODE_OPTIONS = "--use-system-ca"
```

Other commands:

```bash
npm test
```

```bash
npm run build
```

## Project structure

- `src/app/page.tsx`: the landing page
- `src/components/quiz/`: the 14-screen quiz, paywall, checkout and upsell
- `src/components/coach/`: the app: status window, quests, bosses, Journey, Settings, Hugin's sheets
- `src/app/api/`: the Gemini routes (`draft`, `verify`, `chat`) and a `health` check
- `src/lib/`: plain TypeScript with no React: quiz data, pricing, the game engine, quests, tools, storage
