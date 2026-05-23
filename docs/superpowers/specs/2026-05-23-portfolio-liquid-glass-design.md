# Portfolio Section Redesign — Liquid Glass + Kinetic Spotlight

**Date:** 2026-05-23
**Owner:** Diky (on behalf of Rachma)
**Status:** Approved — ready for implementation plan

## Goal

Redesign the existing `#portfolio` section to feel **modern, Gen Z, premium, and animated** while remaining clean and on-brand. The current scroll-morph (circle → arc) implementation is being replaced because:

- Cards are too small to read project visuals
- The pinned scroll-hijack (2400px) holds the user too long for little payoff
- 8 cards (2 per project) is visually crowded
- The look is "elegant but serious" — does not match the Gen Z direction requested

The new direction is **Liquid Glass + Kinetic Typography (Hybrid)**: 4 floating glass cards with an auto-rotating spotlight, marquee kinetic text in the background, and a smooth, non-hijacking scroll experience.

## Scope

**In scope:**
- Full rewrite of `js/portfolio.js`
- Replace `.portfolio-*` CSS block in `style.css` (~220 lines)
- Replace `.portfolio-section` markup in `index.html`
- Reduce data set from 8 entries to 4 (one image per project)

**Out of scope:**
- Changes to other sections (hero, about, social-3d, etc.)
- New asset creation — reuse existing PNGs in `data/work/`
- Changes to portfolio data model beyond reducing to 4 entries

## Design

### Layout

A non-pinned section, ~100vh tall, with three stacked visual layers:

1. **Background layer** — `<canvas>` or pure CSS radial gradient that crossfades brand color (lavender → teal → navy → yellow) as the spotlight rotates.
2. **Kinetic typography layer** —
   - "PORTOFOLIO" oversized outline heading (existing `.section-heading-outline` reused), positioned above the cards.
   - Marquee strip "SELECTED WORK · 04 PROJECTS · ONE JOURNEY · SCROLL TO EXPLORE" scrolling continuously behind the cards. Opacity ~0.30, no animation pause.
3. **Card layer** — 4 liquid glass cards in a horizontal row. Spotlight card is center, larger, with stronger glow.

### Card Anatomy

Each card represents one project (Cronicle, Wellpad, Raya, Maxim).

**Glass surface:**
- `backdrop-filter: blur(14px) saturate(140%)`
- Gradient fill: `linear-gradient(140deg, brand-color/65%, brand-color/22%)`
- Border: `1px solid rgba(255,255,255,0.15)`
- Inset highlight: `inset 0 1px 0 rgba(255,255,255,0.25)`
- Radius: 18px (non-spotlight), 20px (spotlight)

**Content (inside card):**
- Project image (full bleed, rounded inner mask, dark gradient overlay from bottom 60% to enhance text legibility)
- Number tag (top-left): `01`/`02`/`03`/`04` in Inter, 9px, letter-spacing 0.3em, opacity 0.7
- Project name (bottom-left): Outfit Black, 18-26px, letter-spacing -0.03em
- Caption (below name): one-line `"Fashion · Lavender"` style, Inter 9-11px, opacity 0.7
- Spotlight-only: `★ SPOTLIGHT · NN` label in accent color above name, and a CTA pill `VIEW CASE ↗` below caption

**Sizing:**
- Non-spotlight cards: width clamp(160px, 18vw, 230px), height clamp(220px, 32vh, 320px)
- Spotlight card: width clamp(220px, 22vw, 300px), height clamp(280px, 40vh, 400px)
- Cards arranged in row with center spotlight; non-spotlight cards sit slightly lower with reduced shadow

### Spotlight System

- Exactly one card is "spotlight" at any time. Initial spotlight = index 0 (Cronicle).
- **Auto rotation:** Every 4500ms, spotlight advances `(activeIndex + 1) % 4`.
- **Auto rotation pauses** when:
  - The user hovers any card (resumes 1500ms after `mouseleave` from the section)
  - The section is not in the viewport (use IntersectionObserver)
  - The user has interacted manually within the last 8 seconds
- **Manual control:**
  - Click any non-spotlight card → it becomes the spotlight
  - Click any dot indicator → jump to that card
  - Mobile: swipe left/right within the section
- **Transition:** 700ms cubic-bezier(0.22, 1, 0.36, 1) — scale, glow intensity, and position interpolate together
- **Click on the spotlight card itself** → opens the project's Dribbble URL in a new tab (same as current behavior)

### Background Crossfade

The section's radial gradient color is tied to the spotlight's brand color.
- Stored as CSS custom property `--stage-color` on the section root (same pattern as current code)
- Transitions over 700ms ease when spotlight changes
- Two radial gradients composited: primary at 50% 40% (brand color at 18% alpha), secondary at 80% 80% (accent yellow at 10% alpha)

### Entry Animation

When the section enters viewport (top 80%, `once: true`):

1. `t=0`: Heading "PORTOFOLIO" fades in (existing behavior, do not break)
2. `t=200ms`: Marquee strip fades in to opacity 0.30 and begins scrolling
3. `t=300ms + (i * 80ms)`: Each card flies in from `y: 40px, opacity: 0, blur(8px), scale: 0.95` to its resting state. Duration 600ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`.
4. `t=900ms`: Spotlight card scales up + glow ramps to full
5. `t=1100ms`: Dot indicator fades in
6. `t=4500ms`: First auto-rotate fires

### Hover / Idle Interactions

**Desktop hover (non-touch):**
- Hovered card lifts 8px (translateY) and tilts ±4deg toward the cursor (magnetic effect using `mousemove` within card bounds)
- Hovered card glow ramps to 1.2× intensity
- Other cards dim to opacity 0.6 with a subtle blur(2px)
- Cursor over the card becomes pointer (cards are anchors)

**Idle:**
- Each card has a subtle continuous "breathing" — glow opacity oscillates ±15% over a 4s sine cycle, phase-offset per card so they don't pulse in sync
- Mouse-parallax on the section: cards translate up to 6px based on cursor position relative to the section center

**Mobile:**
- No magnetic tilt (touch devices skip the `mousemove` listener)
- Swipe gesture (horizontal threshold 40px) advances/retreats spotlight
- Breathing glow remains
- Cards are slightly more compact; spotlight remains visually distinct via scale + glow

### Progress Indicator

Below the cards: 4 dash indicators (24px × 4px, radius 2px). Active dash is 32px wide and uses `--accent` color (`#b48cde`). Other dashes use `rgba(255,255,255,0.2)`. Each dash is a `<button>` (a11y) that jumps to the corresponding card.

## Component Boundaries

`js/portfolio.js` exposes a single function `initPortfolio()` (matches existing pattern in `main.js`). Internally it is organized as:

| Internal module | Responsibility |
| --- | --- |
| `buildCards(projects)` | Create DOM for 4 cards, append to `#portfolio-cards`, return refs |
| `Spotlight` controller | State: `activeIndex`, `paused`. Methods: `set(index)`, `next()`, `start()`, `stop()`. Emits an event on change. |
| `Layout` engine | On viewport resize, computes positions/sizes for spotlight + non-spotlight cards. Applies transforms via GSAP `gsap.to`. |
| `Background` painter | Subscribes to spotlight change → animates `--stage-color` via `gsap.to(stage.style, ...)` over 700ms |
| `Marquee` | Pure CSS animation (`@keyframes` translateX -50% loop). No JS needed beyond initial mount. |
| `Interactions` | Hover (desktop only via `matchMedia('(hover: hover)')`), swipe (touch), keyboard (arrow keys focus optional — out of scope for v1), IntersectionObserver pause/resume |

The single `initPortfolio()` entrypoint wires these together. Each helper is independently testable and replaceable.

## Data Model

```js
const PROJECTS = [
  { name: "Cronicle", caption: "Fashion · Lavender", color: "#C8B6E2", img: cronicle1, url: SHOT_URLS.Cronicle },
  { name: "Wellpad",  caption: "Wellness · Teal",    color: "#2F6A6A", img: wellpad1,  url: SHOT_URLS.Wellpad  },
  { name: "Raya",     caption: "Banking · Navy",     color: "#0B2A5B", img: raya1,     url: SHOT_URLS.Raya     },
  { name: "Maxim",    caption: "Ride-hail · Yellow", color: "#F7D417", img: maxim2,    url: SHOT_URLS.Maxim    },
];
```

Image selection (one shot per project, the visually strongest):
- Cronicle → `cronicle-1.png`
- Wellpad → `wellpad-1.png`
- Raya → `raya-1.png`
- Maxim → `maxim-2.png` (yellow hero shot)

Captions trimmed to a single noun-phrase to fit the new layout.

## Responsiveness

| Breakpoint | Behavior |
| --- | --- |
| ≥ 1100px | Full 4-card horizontal row, spotlight in center, non-spotlight cards visible on either side with slight Y-offset |
| 768–1099px | Spotlight center, 1 non-spotlight visible on each side, the 4th peeks 30% from the edge |
| < 768px | Spotlight center fills most of the width, neighbors peek ~15% from each edge ("coverflow" feel). Swipe is primary control. Auto-rotation interval bumps to 5500ms. |
| < 480px | Section height shrinks to 80vh; spotlight is ~78vw wide |

The `prefers-reduced-motion` media query disables:
- Auto-rotation
- Mouse-parallax
- Breathing glow
- Marquee scroll (replaced with static text)

Cards still fade in (single 200ms opacity transition), and hover/click still work. Reduced motion is detected once at init via `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

## Visual Tokens (additions)

These extend, do not replace, the existing tokens in `:root`:

```css
--portfolio-glass-blur: blur(14px) saturate(140%);
--portfolio-card-border: 1px solid rgba(255, 255, 255, 0.15);
--portfolio-card-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.25);
--portfolio-shadow-base: 0 20px 50px rgba(0, 0, 0, 0.45);
--portfolio-shadow-glow: 0 30px 90px var(--card-color, #b48cde);
--portfolio-marquee-opacity: 0.30;
```

Existing tokens reused: `--bg-primary`, `--accent`, `--text-primary`, `--text-secondary`, `--font-heading`, `--font-body`, `--section-padding`, `--container-max`.

## Markup Changes (index.html)

Replace existing `<section id="portfolio">` block (lines ~770-800) with:

```html
<section id="portfolio" class="portfolio-section">
  <h2 class="section-heading-outline">Portofolio</h2>
  <div id="portfolio-stage" class="portfolio-stage">
    <div class="portfolio-marquee" aria-hidden="true">
      <span>Selected Work · 04 Projects · One Journey · Scroll to Explore · </span>
      <span>Selected Work · 04 Projects · One Journey · Scroll to Explore · </span>
    </div>
    <div id="portfolio-cards" class="portfolio-cards"></div>
    <div class="portfolio-dots" id="portfolio-dots" role="tablist" aria-label="Portfolio navigation"></div>
  </div>
</section>
```

Card DOM (built in JS):

```html
<a class="portfolio-card" href="..." target="_blank" rel="noopener noreferrer"
   style="--card-color: #C8B6E2"
   data-index="0" aria-label="Cronicle — Fashion · Lavender">
  <div class="portfolio-card-media">
    <img src="..." alt="Cronicle" loading="lazy" />
  </div>
  <div class="portfolio-card-content">
    <span class="portfolio-card-num">01</span>
    <span class="portfolio-card-spotlight-tag">★ SPOTLIGHT · 01</span>
    <h3 class="portfolio-card-name">CRONICLE</h3>
    <span class="portfolio-card-caption">Fashion · Lavender</span>
    <span class="portfolio-card-cta">VIEW CASE ↗</span>
  </div>
</a>
```

Spotlight-only elements (`.portfolio-card-spotlight-tag`, `.portfolio-card-cta`) are always in DOM but hidden via CSS when the parent does not have `.is-spotlight`.

## Accessibility

- Cards are `<a>` elements (existing pattern, keyboard navigable)
- Dot indicators are `<button>` with `role="tab"` and `aria-selected`
- Spotlight changes update `aria-current="true"` on the active card
- `aria-live="polite"` region announces "Now viewing: Cronicle" on spotlight change (consider for v1.1, not blocking)
- `aria-hidden="true"` on the marquee strip (decorative)
- Reduced-motion compliance per above
- Focus-visible ring uses existing `var(--accent)` outline pattern

## Performance Considerations

- `backdrop-filter` is GPU-expensive; limit to the 4 cards (no nested blurs)
- Transforms use `translate3d` + `will-change: transform` on cards
- IntersectionObserver pauses auto-rotation when section is offscreen, saves wakeups
- Marquee uses pure CSS (no JS RAF loop)
- Mouse-parallax updates throttled via `requestAnimationFrame` (one rAF per frame max)
- Total bundle impact: removes GSAP ScrollTrigger pin (which has overhead), keeps GSAP core (already in deps). Net likely neutral or smaller.

## Migration / Compat

- Existing `data/work/PORTFOLIO_BRIEF.md` choreography (Lavender → Teal → Navy → Yellow) is preserved — projects still appear in that order, color crossfade still follows it
- The `SHOT_URLS` map and Dribbble linking behavior unchanged
- Existing image imports stay (Vite `?url`), unused `*-2.png` imports removed when 8→4 reduction lands
- `initPortfolio` export signature unchanged (still called from `main.js` without args)

## Acceptance Criteria

A reviewer (Diky/Rachma) should be able to verify, by loading `npm run dev` and scrolling to the portfolio section, that:

1. The section is no longer pinned — scrolling past it feels natural
2. Four glass cards are visible, each clearly tied to a project's brand color
3. The center spotlight card is visually dominant (larger, stronger glow, has the CTA pill)
4. The spotlight rotates automatically every ~4.5s while the section is in view
5. Hovering a non-spotlight card promotes it to spotlight on click (manual control works)
6. The background gradient color follows the spotlight (smooth crossfade)
7. The marquee text scrolls continuously behind the cards
8. Clicking the spotlight opens the correct Dribbble shot in a new tab
9. On mobile (Chrome devtools, iPhone preset), the section is usable: spotlight visible, swipe works, no horizontal page-scroll bleed
10. With `prefers-reduced-motion: reduce`, no auto-rotation, no marquee scroll, no breathing — but cards remain clickable
11. No console errors, no broken images, no layout shift on initial load
12. The "Portofolio" outlined heading remains visible at the top of the section

## Open Questions (post-spec, low priority)

These do not block implementation. They can be resolved during the build with user input or left at the listed default:

- **Should clicking a non-spotlight card open Dribbble immediately, or first promote it to spotlight (one click = focus, second click = open)?** Default for v1: clicking a non-spotlight card promotes only; clicking the spotlight opens Dribbble. Same as the mockup interaction.
- **Should the CTA pill on the spotlight be a separate clickable element with its own focus, or is the whole card-as-anchor enough?** Default: whole card is the anchor; the pill is visual only (`pointer-events: none`).
- **Marquee text content — keep as listed, or include Rachma's name/year?** Default: as listed. Easy to change later.
