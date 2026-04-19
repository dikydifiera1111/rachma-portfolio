# Scroll-Linked Fish Sequence — Hero Background

**Date:** 2026-04-19
**Status:** Approved for implementation

## Goal

Replace the interactive particle background on the portfolio hero section with a scroll-linked image sequence of a cyber fish swimming from right (small/distant) to left (large/close), rendered via HTML5 canvas and scrubbed to scroll position.

## Context

- Site is a Vite-built vanilla HTML/CSS/JS portfolio at `https://dikydifiera1111.github.io/rachma-portfolio/`.
- Dark theme only. Background `#050405`. Accent `#b48cde`. No frameworks; GSAP available, Lenis handles smooth scroll.
- Existing hero has: `<canvas id="hero-canvas">` (particles), twinkle cursor, letter-wave on the name, circular photo with orbiting tool icons, and a role switcher.
- Frame assets exist at `/assets/fish-frames/ezgif-frame-001.png` … `ezgif-frame-240.png` (240 frames total).

## Design Decisions

1. **Replace particles** (do not layer). Particles and fish would fight as ambient backgrounds.
2. **Use every 4th frame** → ~60 frames. Balances scrub smoothness against preload weight.
3. **Pinned hero via `position: sticky`.** Hero sticks for the duration of the scrub, then unpins into About.
4. **No tagline overlay.** Existing hero text is strong enough; fish is pure atmosphere.
5. **CSS drop-shadow glow** on the canvas element — single GPU filter, no per-frame cost.
6. **Reuse existing `#hero-canvas` element.** New module `js/fish-sequence.js` replaces the `js/particles.js` import. `particles.js` stays on disk, unimported.

## Architecture

### Module: `js/fish-sequence.js`

Responsibilities:
- Build frame URL list (every 4th frame from 1 to 237 → 60 frames).
- Preload all frames in parallel; track progress; expose a promise.
- Render the current frame to `#hero-canvas`, sized cover with aspect preservation.
- Listen to scroll; compute hero-wrapper progress (0…1); map to frame index; redraw via rAF when index changes.
- Handle resize (debounced), `prefers-reduced-motion`, and a simple loading progress bar.

Public entry: a single `initFishSequence()` function called from `main.js`.

### Main entry wiring
- Remove `import './js/particles.js'` (or equivalent) from `main.js`.
- Add `import { initFishSequence } from './js/fish-sequence.js'` and call after DOM ready.

### DOM & CSS changes (`index.html`, `style.css`)

HTML:
- Wrap `<section id="hero">` in `<div class="hero-scroll-wrapper">`.
- Add a scroll hint `<div class="hero-scroll-hint">scroll to explore ↓</div>` at the bottom of the hero.
- Add a progress bar `<div class="hero-preload-bar"><div class="hero-preload-bar__fill"></div></div>` inside the hero.

CSS:
- `.hero-scroll-wrapper { position: relative; height: 250vh; }` (200vh on mobile via media query).
- `#hero.hero-section { position: sticky; top: 0; height: 100vh; }`
- `#hero-canvas { filter: drop-shadow(0 0 40px rgba(180, 140, 222, 0.45)); background: transparent; }`
- `.hero-scroll-hint` — bottom-center, low opacity, fades via `opacity` toggle on scroll.
- `.hero-preload-bar` — thin bar, purple fill, fades out when loaded.

## Scroll Mechanic

Given the wrapper and the sticky inner hero:

```
progress = clamp(
  (-wrapperRect.top) / (wrapperRect.height - window.innerHeight),
  0, 1
)
frameIndex = Math.round(progress * (frames.length - 1))
```

- Scroll listener is passive; schedules a rAF redraw. Only redraws when `frameIndex` changes from last drawn.
- Works with Lenis since Lenis fires native `scroll` events.

## Rendering

- Canvas is sized to `window.innerWidth × window.innerHeight` via devicePixelRatio scaling.
- Each frame drawn with `drawImage` using a cover fit: compute scale so the image covers the canvas; center the remainder.
- Frames have a dark navy-black background that blends with `#050405` — canvas itself is transparent so the site bg shows through at the edges of the drawn image if any.

## Loading State

- A thin 2px purple progress bar at the top of the hero area fills from 0→100% as frames load.
- First successfully loaded frame is rendered immediately (no blank hero while others load).
- Bar fades out (opacity 0, 400ms) once all 60 frames are loaded.

## Responsive

- `window.innerWidth < 768px`: wrapper height drops to `200vh` via media query.
- Resize handler (debounced 150ms) re-sizes canvas and redraws the current frame.

## Accessibility

- `prefers-reduced-motion: reduce`:
  - Skip scroll-scrub binding.
  - Render the final frame statically (fish close/large).
  - Keep wrapper at `100vh` so there is no artificial pin.
- Canvas has `aria-hidden="true"` (already does).
- Scroll hint has `aria-hidden="true"`.

## Interactions preserved / removed

Preserved: letter-wave on hero name, orbiting tool icons on photo, twinkle cursor, role switcher, intro spiral overlay.

Removed: mouse-repulsion particle interaction (particles module no longer imported).

## Performance Budget

- 60 frames × average ~50–150 KB PNG = ~3–9 MB total preload.
- Scroll handler: passive, rAF-throttled, no-op when frame index unchanged.
- GPU drop-shadow filter — constant cost, no per-frame overhead.
- Target: 60 fps scroll-scrub on mid-tier hardware.

## Out of Scope

- Tagline text overlay ("Creative by Nature").
- Layering fish with particles.
- Keeping the particle interaction.
- Renaming/deleting `js/particles.js` from disk.
- Backward/forward "retreat" mechanics beyond the natural scroll-up behavior (scroll up already scrubs backward by design since index derives from position).

## Integration Notes

- Image paths must work under the GitHub Pages base path `/rachma-portfolio/`. Use Vite's import.meta.env.BASE_URL or a relative `./assets/fish-frames/...` path that Vite will rewrite. Plain `/assets/...` breaks on GitHub Pages subfolder.
- Confirm frame file names use the `ezgif-frame-NNN.png` pattern (zero-padded 3 digits) — sampled indices 001, 005, 009, …, 237.
