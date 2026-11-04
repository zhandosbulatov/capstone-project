# DESIGN.md - AI Business Coach

## Context (from discovery)

- Artifact type: composite. A marketing landing page (`/`), an onboarding quiz and paywall (`/quiz`), and a mobile-first habit app (`/app`).
- Positioning: practical and calm, for adults. A coach, not a course, and not a game.
- Audience: employees aged 28 to 45 in the US and UK who are good at their job and live on one salary. Primary action: take the quiz, then complete one 20-minute quest a day.
- Adjectives: calm, direct, measured, progressive, adult.
- Visual word translations:
  - calm: one strong colour line on white, everything else navy ink and grey.
  - direct: signage typography, short labels, one primary button per view.
  - measured: progress is drawn to scale (30 stops), never as a vague percentage.
  - progressive: a line that fills as you travel it.
  - adult: no emoji, no confetti, no game fonts, no pills used as decoration.
- Aesthetic essence: transit line, plain signage.
- Single-minded proposition: you can see exactly where you are on the way to a first paying client.
- References: admire transit line diagrams (one line, ticks for stops, rings for interchanges, plain grotesk labels) and wayfinding signage (high contrast, few words). Avoid: the hero + card grid SaaS template, and game UI (neon, ranks, chests).
- Mode: both (follows the system setting). Density: balanced in the app, airy on the landing page.
- Constraints: Next.js 16, Tailwind 4 tokens in `src/app/globals.css`, mobile first at 375px, WCAG 2.2 AA. Game-style information, not a game look (see CLAUDE.md).

## Aesthetic

- Direction: the route map. The 30-day plan is a single transit line from Employee to Consultant.
- Defining trait: progress is always shown as a position on a line. Days are stops (ticks), weekly bosses are interchange stations (rings), and titles are zones along the line.
- Signature move: the route line itself, drawn at three scales.
  - Strip: all 30 days with a "You" marker (status window, plan screen, landing hero).
  - Rail: a vertical line on the Today tab, with today's quest attached to its stop and the week's boss as the next interchange.
  - Map: the Journey tab, the four weeks as one vertical line with their interchanges.

## Typography

- Display: Familjen Grotesk | Google Fonts | OFL. Used for page titles, quest titles, title and level.
- Body: Atkinson Hyperlegible Next | Google Fonts | OFL. Built for legibility, with signage roots.
- No mono. Numbers use `tabular-nums`.
- Scale: ratio 1.25 (Major Third), base 16px.

| step | size | line-height | use |
|------|------|-------------|-----|
| display | 49px (61px desktop) | 1.05 | landing hero |
| h1 | 31px | 1.15 | landing sections, Journey title |
| h2 | 25px | 1.2 | quiz screen titles, title in the status window |
| h3 | 20px | 1.25 | quest and boss titles |
| body | 16px | 1.5 | text |
| small | 13px | 1.45 | labels, meta, rewards |

- Weights: 400 and 600 for body, 600 and 700 for display. Tracking: normal; display at -0.01em from h1 up.
- Labels: sentence case, 12 to 13px, semibold, muted. No uppercase kicker labels above headings.

## Color

- Strategy: navy ink and grey carry the interface; one signal-orange line carries progress. Orange is used only for the route, XP and reward chips, so it always means "progress". This leaves the AI-default blue and indigo band behind and reads as signage, not SaaS.
- Distribution: 60 white and grey / 30 navy ink / 10 orange line.
- Palette (role -> OKLCH | hex approx):
  - bg: oklch(0.985 0.003 250) | #f9fafc
  - surface: oklch(1 0 0) | #ffffff
  - ink (fg): oklch(0.25 0.045 255) | #1a2436
  - muted: oklch(0.50 0.03 255) | #5c6577
  - line (border): oklch(0.90 0.01 255) | #dfe2e8
  - bar: oklch(0.82 0.015 255) | #c4c9d2
  - accent (primary actions, focus, selected): oklch(0.30 0.06 245) | #1f3450
  - accent-ink: oklch(1 0 0) | #ffffff
  - accent-soft: oklch(0.95 0.015 245) | #eaf0f6
  - route (the line, XP): oklch(0.66 0.18 45) | #e5632a
  - route-soft (line still to travel): oklch(0.90 0.05 50) | #f8d9c6
  - route-ink (text on route-soft): oklch(0.45 0.13 45) | #9a3d10
  - good / good-soft: oklch(0.48 0.10 155) / oklch(0.95 0.03 155)
  - warn / warn-soft: oklch(0.50 0.10 80) / oklch(0.95 0.04 85)
  - bad: oklch(0.52 0.17 25)
- Dark mode overrides: bg oklch(0.17 0.015 255), surface oklch(0.21 0.018 255), ink oklch(0.94 0.01 255), muted oklch(0.72 0.02 255), line oklch(0.31 0.02 255), accent oklch(0.82 0.07 245) on accent-ink oklch(0.20 0.03 255), route oklch(0.72 0.16 50), route-soft oklch(0.36 0.07 50).

## Spacing, radius, shadow

- Spacing base: 4px; scale 4, 8, 12, 16, 24, 32, 56, 80.
- Radius: 6px for controls and cards (`rounded-md`), 8px for large surfaces and sheets (`rounded-lg`). `rounded-full` only for avatars, route stops and progress bars.
- Shadow approach: defined edge. Cards have a 1px `line` border and no shadow. Sheets sit on a dark scrim.

## Layout and composition

- Grid: single column at 440px max in the app and quiz; the landing page uses a 2-column hero and full-width line sections inside 1024px.
- Spacing rhythm: 8 to 12px inside a stop, 16px between stops, 56 to 80px between landing sections.
- Signature layout move: content hangs off the line. On Today, the quest card and boss card are attached to stops on a vertical rail instead of floating as a stack of cards.
- Responsive: mobile first; breakpoints `sm` 640px and `lg` 1024px.

## Components and states

- Buttons: primary is filled `accent` (navy); secondary is a 1.5px outlined surface; tertiary is muted text. One primary per view. States: hover darkens the border or lifts opacity to 0.92, active moves 1px down (transform), focus shows a 2px accent outline with 2px offset, disabled is 40% opacity.
- Quiz options: text-only rows with a 1.5px border; selected uses `accent-soft` with an `accent` border. No emoji icons.
- Pills: only for status that changes (Done today, Recovery, Beaten, Most popular). 12px, sentence case, 4px radius.
- Reward chips: `route-soft` background, `route-ink` text.
- Inputs: visible labels above, 1.5px `line` border, `accent` border on focus.
- Overlays: bottom sheets with focus trap and focus return (existing).
- Empty and loading: one short sentence in muted text that says what will appear.

## Motion

- Durations: 150ms exit, 210ms enter, 260 to 300ms for moves and sheets.
- Easing: ease-out for enter, ease-in for exit.
- Only transform and opacity animate. The XP bar grows with `scaleX`, not `width`.
- Reduced motion: view transitions drop to 0s; bar transitions are turned off.

## Iconography

- Set: Tabler outline paths, inlined in `src/components/icons.tsx` | grid 24px | stroke 2px | round caps and joins. Only flame (streak), shield (Streak Shield) and check.

## Imagery and illustration

- Mode: the product itself. The landing hero shows the real route strip and a real Today screen built from the same components and tokens.
- Hugin stays a small raven mark in a circle, never a full character.
- Avoid: stock photos, gradient blobs, confetti, emoji.

## Dark mode

- Base bg near-black navy oklch(0.17), surfaces step up in lightness (0.21), borders are lighter than surfaces. The orange line gets lighter and slightly less saturated; navy accent becomes a pale blue so filled buttons stay legible.

## Accessibility

- Contrast: AA in both modes (muted on bg about 5.5:1; route-ink on route-soft about 5:1; accent-ink on accent above 10:1).
- Focus visible on every control; sheets trap and return focus.
- Targets 44px for buttons and tabs.
- Route position is always also given in text ("Day 8 of 30", "You"), never by colour or position alone.

## Tokens (source of truth)

```css
:root {
  --bg: oklch(0.985 0.003 250);
  --surface: oklch(1 0 0);
  --ink: oklch(0.25 0.045 255);
  --muted: oklch(0.50 0.03 255);
  --line: oklch(0.90 0.01 255);
  --bar: oklch(0.82 0.015 255);
  --accent: oklch(0.30 0.06 245);
  --accent-ink: oklch(1 0 0);
  --accent-soft: oklch(0.95 0.015 245);
  --route: oklch(0.66 0.18 45);
  --route-soft: oklch(0.90 0.05 50);
  --route-ink: oklch(0.45 0.13 45);
}
```

- Adapter: Tailwind v4 `@theme inline` in `src/app/globals.css`, which maps each variable to a `--color-*` utility.

## Cards and surfaces

- Cards: 1px `line` border, 6px radius, 16px padding, no shadow. No cards inside cards: stats inside the status window are rows with hairlines, not tiles.

## Slop audit

- Date: 2026-11-04 | Result: fixed 9 tells from the first build.
- Removed: cream background with a big serif hero, pill kicker above the hero headline, default SaaS blue, 16 to 24px radii everywhere, nested stat tiles, emoji used as icons (streak, shield, quiz options, confetti), repeated card grids on the landing page, width animation on the XP bar.
- Still to watch: the landing pricing table and FAQ are conventional on purpose (compliance first).

## Changelog

- 2026-11-04: Theme switcher (System, Light, Dark) in Settings and the landing footer. Dark tokens apply under the system media query unless `data-theme="light"`, and always under `data-theme="dark"`; a head script applies the saved choice before first paint (`src/lib/theme.ts`).
- 2026-11-04: First DESIGN.md. Committed to the route-map direction after comparing it with the ledger and index-card directions on the same Today screen.
