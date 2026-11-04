# DESIGN.md - AI Business Coach

## Context (from discovery)

- Artifact type: composite. Marketing landing page (`/`), onboarding quiz and paywall (`/quiz`), mobile-first habit app (`/app`). Designed region by region; the signature lives in the landing hero.
- Positioning: warm and encouraging, for people who have never sold anything outside their job and feel nervous about it. Practical underneath: a coach, not a course, not a game.
- Audience: employees aged 28 to 45 in the US and UK who are good at their job and live on one salary.
- Primary action: take the 1-minute quiz (landing), then complete one daily quest (app).
- Adjectives: warm, joyful, encouraging, grounded, quietly proud.
- Visual word translations:
  - warm: a warm off-white page, purple-black ink instead of pure black, peach as the main colour.
  - joyful: three bright colours (peach, sunshine, sky) used at full strength, always with dark text on them.
  - encouraging: the friendly rounded serif Young Serif for headings, pill-shaped buttons, sentence case everywhere.
  - grounded: one real object at the centre (your business card), plain Figtree for everything you read.
  - quietly proud: the card shows your new title; progress is shown, never shouted.
- Aesthetic essence: your first yes.
- Single-minded proposition: you already have something people will pay for, and here is the card that says so.
- References: admire aliabdaal.com for its palette (warm off-white, purple-black ink, peach, sunshine and sky used boldly with dark text) and its friendly serif plus clean sans pairing. We take the colour values only: not its logo, photos, illustrations, fonts (Recoleta and Elza are commercial) or hand-drawn underline device. Avoid: corporate SaaS blue, game UI.
- Mode: light and dark (System, Light or Dark switcher). Density: airy on the landing page, balanced in the app.
- Constraints: Next.js 16, Tailwind 4 tokens in `src/app/globals.css`, mobile first at 375px, WCAG 2.2 AA, game-style information without a game look (CLAUDE.md).

## Aesthetic

- Direction: "Your new card". The side service the quiz creates is shown as a small-business card.
- Defining trait: one bright object (the sunshine card) on a calm warm page, with peach for the action and sky for the secondary action.
- Signature move: the business card flip. In the landing hero an old white work card ("Designer, Northwind Ltd") sits behind a sunshine card that flips over once to show the new side service, its price and the title Side Starter. In the app the status window is your card: your service, price, title and level, printed on sunshine.

## Typography

- Display: Young Serif (400 only) | Google Fonts | OFL. Headings, card names, prices, big numbers.
- Body: Figtree (400, 600, 700) | Google Fonts | OFL. Everything you read and tap.
- No mono. Figures use `tabular-nums` where they line up.
- Scale: ratio 1.25 (Major Third), base 16px.

| step | size | line-height | use |
|------|------|-------------|-----|
| hero | 49px (desktop) / 39px (phone) | 1.08 | landing headline |
| display | 39px | 1.1 | landing section titles (desktop) |
| h1 | 31px | 1.15 | section titles (phone), Journey and Settings titles |
| h2 | 25px | 1.2 | quiz screen titles, the card's title line |
| h3 | 20px | 1.3 | quest, boss and card names |
| body | 16px | 1.5 | text |
| label | 13px | 1.4 | labels, meta, chips (`type-label`) |

- Utilities: `type-display` (Young Serif, weight 400, tight leading) and `type-label` (13px, 600, ink-muted). Young Serif ships one weight, so `type-display` and `font-display` force weight 400 to stop the browser faking bold.
- No uppercase labels except the one on the card's title chip.

## Color

- Strategy: warm neutrals carry the page; three brights do the talking. Peach is the brand and the primary action, sunshine is the card, sky is the secondary action and links on bright blocks. Every bright carries dark `on-bright` text, never white (white on these brights fails contrast).
- Distribution: about 65 warm neutral / 25 brights (card, buttons, chips) / 10 ink-coloured accents.
- Palette, light (role -> OKLCH | hex):
  - canvas: oklch(0.975 0.005 67.8) | #F9F6F3
  - sand (banded sections): oklch(0.926 0.009 52.1) | #ECE5E1
  - surface: oklch(1 0 0) | #FFFFFF
  - ink: oklch(0.213 0.028 300.4) | #1B1624
  - ink-muted: oklch(0.479 0.018 302.2) | #5F5B66
  - line: oklch(0.899 0.010 58.2) | #E3DCD7
  - line-strong (input borders): oklch(0.630 0.017 319.5) | #8E8690
  - brand (peach): oklch(0.774 0.135 42.8) | #FD976D; brand-hover oklch(0.733 0.152 40.4) | #F7845A; brand-ink oklch(0.504 0.170 34.4) | #B0300F; brand-soft oklch(0.939 0.031 45.3) | #FEE5DA
  - sun (the card): oklch(0.885 0.132 88.2) | #FDD46B; sun-soft oklch(0.962 0.046 90.9) | #FEF2D0
  - accent (sky): oklch(0.797 0.113 222.2) | #5DCDF1; accent-hover oklch(0.763 0.123 224.5) | #45C2EC; accent-ink oklch(0.475 0.091 229.5) | #0A6585; accent-soft oklch(0.953 0.026 220.6) | #DDF4FC
  - on-bright (text on peach, sun, sky in both modes): oklch(0.213 0.028 300.4) | #1B1624
  - success: #34B378; success-ink oklch(0.470 0.098 157) | #1D6B44; success-soft #DCF1E4
  - warning: #F5B53D; warning-ink oklch(0.482 0.103 65.5) | #85500A; warning-soft #FDF0D5
  - error: #E5484D; error-ink oklch(0.503 0.171 24.2) | #B12A2F; error-soft #FCE3E3
- Dark overrides: canvas #15111B, sand #1E1925, surface #221C2A, ink #F5F0F2, ink-muted #B6AFBC, line #362E3F, line-strong #7D7486, brand-hover #FFA987, brand-ink #FFAE8E, brand-soft #3A2420, sun-soft #3A311A, accent-hover #7AD6F4, accent-ink #8BDDF7, accent-soft #14303C, success-ink #7FD6A6, success-soft #17301F, warning-ink #F6C46A, warning-soft #33270F, error-ink #FF9A9C, error-soft #3A1C1E. The brights (brand, sun, accent) and on-bright stay the same: the card is a physical object and keeps its colour at night.

### Contrast (WCAG 2.2 AA), computed from the hex values

Light: ink on canvas 16.4, on surface 17.7, on sand 14.2. Ink-muted on canvas 6.1, on surface 6.6, on sand 5.3. Brand-ink on canvas 6.0, on surface 6.4, on brand-soft 5.3. Accent-ink on canvas 6.1, on accent-soft 5.7. On-bright on brand 8.3, on brand-hover 7.1, on sun 12.5, on accent 9.7, on accent-hover 8.6. Success-ink on success-soft 5.5. Warning-ink on warning-soft 5.9. Error-ink on error-soft 5.3, on surface 6.5. Line-strong (input borders) on surface 3.5, on canvas 3.3 (needs 3.0).

Dark: ink on canvas 16.5, on surface 14.7. Ink-muted on canvas 8.7, on surface 7.8. Brand-ink on canvas 10.4, on brand-soft 8.0. Accent-ink on accent-soft 9.1. On-bright on brand 8.3, on brand-hover 9.5, on sun 12.5, on accent 9.7. Success-ink on success-soft 8.2. Warning-ink on warning-soft 9.1. Error-ink on error-soft 7.6. Line-strong on surface 3.7.

Focus ring: a 2px `ink` outline with a 2px offset, so the ring always sits on the page, never on the control. Ring against the page: 16.4 light, 16.5 dark (needs 3.0). In dark mode the ring next to a peach button is 1.9 against the button itself; the offset keeps the ring off the button, and focus appearance compares the ring with the page pixels it replaces, so this passes.

All pairs pass. White text is never placed on brand, sun or accent.

## Spacing, radius, depth

- Spacing base: 4px; scale 4, 8, 12, 16, 24, 32, 56, 80.
- Radius: two values. 6px (`rounded-md`) for cards, inputs, sheets and the business card. Full (`rounded-full`) for buttons, pills, chips, avatars and progress bars.
- Depth: border only. Cards and inputs have a 1px border; nothing has a shadow. The brights need no border.

## Layout and composition

- Grid: single column at 440px max in the app and quiz; landing uses a 2-column hero (copy left, cards right) inside 1024px.
- Rhythm: 8 to 12px inside a group, 16px between cards, 56 to 80px between landing sections; sand bands mark a change of topic.
- Signature layout move: the hero's right column is a real object (two cards, overlapping, slightly rotated), not an illustration.

## Components and states

- Button: explicit `variant` (primary peach, secondary sky, outline, ghost, dark) and `status` ("idle" or "loading"). Pill-shaped. Hover darkens the bright (brand-hover, accent-hover) or the border; active moves 1px down; focus-visible shows the ink ring; disabled is 45% opacity with a not-allowed cursor; loading shows a spinner, keeps the label, sets `aria-busy` and blocks clicks.
- Inputs: visible labels, 1.5px `line-strong` border, ink border on focus plus the ring, error text in `error-ink`.
- Pills: status only (Done, Beaten, Recovery, Most popular); full radius, 12 to 13px, soft background with its -ink text.
- Reward chips: `brand-soft` with `brand-ink`.
- Navigation: bottom tab bar with a 3px peach indicator on the active tab.
- Sheets: bottom sheets, focus trapped and returned, scrim `ink` at 50%.
- Empty and loading: one sentence in `ink-muted`.

## Motion

- The one meaningful moment: the landing hero card flips once on load (rotateY, 800ms, ease-out, starts at 500ms). Transform only.
- Everything else is functional: screen slides and cross-fades through view transitions (150 to 300ms), a gentle lift when a number grows, XP bar growth with `scaleX`.
- Reduced motion: the card is shown already flipped, view transitions drop to 0s, bars stop animating.

## Iconography

- Tabler outline paths inlined in `src/components/icons.tsx`: 24px grid, 2px stroke, round caps and joins. Flame (streak), shield (Streak Shield), check, arrows, sun, moon, desktop.

## Imagery and illustration

- The product is the picture: the business card, built in HTML from the same data the quiz produces. Hugin is a small raven mark on a sunshine circle, never a character.
- Avoid: stock photos, blobs, confetti, emoji, hand-drawn flourishes copied from the reference.

## Dark mode

- Near-black purple canvas, surfaces lighter by step, borders lighter than surfaces. Brights keep their value and their dark text. Soft fills become dark tints of their hue; -ink colours become light tints.

## Accessibility

- AA contrast verified for every pair above, both modes.
- Focus visible on every control (ink ring, 2px offset). Sheets trap and return focus.
- Targets: buttons 48px tall, tabs 52px, chips are not interactive.
- Colour is never the only signal: states carry words (Done, Beaten, Recovery) and progress carries numbers.
- Reduced motion respected.

## Tokens (source of truth)

See `src/app/globals.css`: light values on `:root`, dark values under `prefers-color-scheme: dark` (unless `data-theme="light"`) and under `data-theme="dark"`. Tailwind 4 `@theme inline` maps each to a utility: `canvas`, `sand`, `surface`, `ink`, `ink-muted`, `line`, `line-strong`, `brand`, `brand-hover`, `brand-ink`, `brand-soft`, `sun`, `sun-soft`, `accent`, `accent-hover`, `accent-ink`, `accent-soft`, `on-bright`, `success`, `success-ink`, `success-soft`, `warning`, `warning-ink`, `warning-soft`, `error`, `error-ink`, `error-soft`.

## Cards and surfaces

- Cards: `surface`, 1px `line` border, 6px radius, 16px padding, no shadow. No cards inside cards: the status window's stats are rows with dividers.

## Slop audit

- Pending: filled in after the build.

## Changelog

- 2026-11-04: Replaced the route-map design (navy ink, signal-orange line, Familjen Grotesk and Atkinson Hyperlegible Next) with "Your new card": warm off-white, purple-black ink, peach, sunshine and sky, Young Serif and Figtree, two radii (6px and full), border-only depth, and the business card as the signature. Token names changed to roles (canvas, ink-muted, brand, accent, success, warning, error with -ink and -soft).
- 2026-11-04: Theme switcher (System, Light, Dark).
- 2026-11-04: First DESIGN.md (route map).
