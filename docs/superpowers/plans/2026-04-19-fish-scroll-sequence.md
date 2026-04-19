# Fish Scroll Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero particle background with a scroll-linked image sequence of a cyber fish, rendered on `#hero-canvas` and scrubbed to scroll position through a pinned hero section.

**Architecture:** New module `js/fish-sequence.js` preloads 60 sampled frames from `assets/fish-frames/` and redraws the current frame to the existing `<canvas id="hero-canvas">` element whenever scroll progress across a new `.hero-scroll-wrapper` changes. Hero becomes `position: sticky` inside that wrapper so it stays pinned during scrub. Particle module stays on disk but is no longer imported.

**Tech Stack:** Vanilla ES modules, HTML5 Canvas 2D API, CSS sticky positioning, native scroll + `requestAnimationFrame`. Vite dev server.

**Verification model:** This codebase has no test runner. "Test" steps are manual browser checks. Run the Vite dev server (`npm run dev`) and verify in a browser. Each verification step names exactly what to observe.

---

## File Structure

- **Create:** `js/fish-sequence.js` — preload + render + scroll-scrub logic (one module, single responsibility)
- **Modify:** `main.js` — swap import and init call
- **Modify:** `index.html` — wrap hero in `.hero-scroll-wrapper`, add scroll hint + progress bar
- **Modify:** `style.css` — sticky hero, wrapper height, glow filter, scroll hint, progress bar, responsive, reduced-motion
- **Untouched:** `js/particles.js` — left on disk, unimported

---

## Task 1: Add hero scroll wrapper and DOM hooks

**Files:**
- Modify: `index.html:140-230`

- [ ] **Step 1: Wrap the hero section in a scroll wrapper and add DOM hooks**

In [index.html](index.html), replace the block that currently reads:

```html
    <!-- ==================== HERO SECTION ==================== -->
    <section id="hero" class="hero-section">
      <canvas id="hero-canvas" class="hero-canvas"></canvas>

      <!-- Cursor-reactive twinkle layer -->
      <div class="hero-twinkles" aria-hidden="true"></div>
```

with:

```html
    <!-- ==================== HERO SECTION ==================== -->
    <div class="hero-scroll-wrapper">
    <section id="hero" class="hero-section">
      <canvas id="hero-canvas" class="hero-canvas"></canvas>

      <!-- Fish sequence preload progress bar -->
      <div class="hero-preload-bar" aria-hidden="true">
        <div class="hero-preload-bar__fill"></div>
      </div>

      <!-- Cursor-reactive twinkle layer -->
      <div class="hero-twinkles" aria-hidden="true"></div>
```

Then locate the closing of the hero section (the `</section>` at line 230 after `<div class="floating-orb"></div>`) and replace:

```html
      <!-- Floating orb -->
      <div class="floating-orb"></div>
    </section>
```

with:

```html
      <!-- Floating orb -->
      <div class="floating-orb"></div>

      <!-- Scroll hint -->
      <div class="hero-scroll-hint" aria-hidden="true">scroll to explore ↓</div>
    </section>
    </div>
```

- [ ] **Step 2: Verify DOM structure**

Run: `npm run dev`
Open the site. Open DevTools Elements panel.
Expected: `.hero-scroll-wrapper` wraps `#hero`. Inside `#hero`: `#hero-canvas`, `.hero-preload-bar > .hero-preload-bar__fill`, `.hero-twinkles`, `.hero-container`, `.floating-orb`, `.hero-scroll-hint`. No JS console errors. Page still renders (particles will still run at this point).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(hero): wrap hero in scroll wrapper; add fish preload bar and scroll hint"
```

---

## Task 2: Add CSS for pinned hero, glow, scroll hint, progress bar

**Files:**
- Modify: `style.css` — append new rules and adjust `.hero-section` + `.hero-canvas`

- [ ] **Step 1: Update `.hero-section` to sticky and add wrapper + supporting styles**

In [style.css:676-693](style.css#L676-L693), replace:

```css
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 6rem 2rem 4rem;
}

.hero-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
```

with:

```css
.hero-scroll-wrapper {
  position: relative;
  width: 100%;
  height: 250vh;
}

.hero-section {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  overflow: hidden;
  padding: 6rem 2rem 4rem;
}

.hero-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: transparent;
  filter: drop-shadow(0 0 40px rgba(180, 140, 222, 0.45));
  pointer-events: none;
}

.hero-preload-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(180, 140, 222, 0.08);
  z-index: 3;
  transition: opacity 400ms ease;
}

.hero-preload-bar.is-done {
  opacity: 0;
}

.hero-preload-bar__fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #7c5caa, #b48cde);
  box-shadow: 0 0 12px rgba(180, 140, 222, 0.6);
  transition: width 120ms linear;
}

.hero-scroll-hint {
  position: absolute;
  bottom: 2.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-secondary, #8a8490);
  opacity: 0.55;
  transition: opacity 350ms ease;
  pointer-events: none;
}

.hero-scroll-hint.is-hidden {
  opacity: 0;
}
```

- [ ] **Step 2: Append responsive + reduced-motion overrides at end of `style.css`**

Append to the end of [style.css](style.css):

```css
/* Fish scroll sequence — responsive + reduced motion */
@media (max-width: 768px) {
  .hero-scroll-wrapper {
    height: 200vh;
  }
  .hero-scroll-hint {
    font-size: 0.7rem;
    bottom: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-scroll-wrapper {
    height: auto;
  }
  .hero-section {
    position: relative;
    top: auto;
  }
}
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev` (if not already running).
Expected: Hero still renders. You can now scroll ~2.5 viewports before the About section begins. Hero content stays pinned at the top of the viewport during that extra scroll. Particle canvas has a subtle purple halo (drop-shadow). No layout overlap with the About section after the pin ends.

Note: with particles still running, you'll see them playing behind the hero — expected at this stage.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "style(hero): pin hero sticky; add preload bar, scroll hint, purple glow"
```

---

## Task 3: Create the fish-sequence module — preload + first draw

**Files:**
- Create: `js/fish-sequence.js`

- [ ] **Step 1: Write the module (preload + single-frame draw, no scroll yet)**

Create [js/fish-sequence.js](js/fish-sequence.js):

```js
/* ============================================
   FISH SEQUENCE — Scroll-linked image sequence
   Renders 60 sampled frames onto #hero-canvas,
   scrubbing to scroll progress across .hero-scroll-wrapper.
   ============================================ */

// Sample every 4th frame from 1..237 → 60 frames.
// Source PNGs live in assets/fish-frames/ (gitignored, ~142MB).
// Web-optimized WebPs (~2.3MB total) are committed under assets/fish-frames-web/
// with names frame-001.webp, frame-005.webp, ..., frame-237.webp.
const FRAME_STEP = 4;
const FRAME_START = 1;
const FRAME_END = 237;

function buildFrameUrls() {
  const urls = [];
  for (let i = FRAME_START; i <= FRAME_END; i += FRAME_STEP) {
    const padded = String(i).padStart(3, "0");
    // Use Vite's import.meta.env.BASE_URL so the path works under
    // the GitHub Pages subfolder (/rachma-portfolio/) and in dev.
    const base = import.meta.env.BASE_URL || "/";
    urls.push(`${base}assets/fish-frames-web/frame-${padded}.webp`);
  }
  return urls;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function drawCover(ctx, img, canvasW, canvasH) {
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (!imgW || !imgH) return;
  const scale = Math.max(canvasW / imgW, canvasH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const dx = (canvasW - drawW) / 2;
  const dy = (canvasH - drawH) / 2;
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function sizeCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

export function initFishSequence() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const bar = document.querySelector(".hero-preload-bar");
  const barFill = document.querySelector(".hero-preload-bar__fill");

  const urls = buildFrameUrls();
  const frames = new Array(urls.length);
  let { ctx, w, h } = sizeCanvas(canvas);
  let firstDrawn = false;
  let loadedCount = 0;

  urls.forEach((url, i) => {
    loadImage(url)
      .then((img) => {
        frames[i] = img;
        loadedCount += 1;
        if (barFill) {
          barFill.style.width = `${(loadedCount / urls.length) * 100}%`;
        }
        if (!firstDrawn) {
          drawCover(ctx, img, w, h);
          firstDrawn = true;
        }
        if (loadedCount === urls.length && bar) {
          bar.classList.add("is-done");
        }
      })
      .catch((err) => {
        console.warn("[fish-sequence]", err);
      });
  });

  // Redraw current first frame on resize so the hero is never blank.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const sized = sizeCanvas(canvas);
      ctx = sized.ctx;
      w = sized.w;
      h = sized.h;
      const firstAvailable = frames.find(Boolean);
      if (firstAvailable) drawCover(ctx, firstAvailable, w, h);
    }, 150);
  });
}
```

- [ ] **Step 2: Wire it into `main.js`, remove particles**

In [main.js](main.js), replace the file contents with:

```js
/* ============================================
   MAIN ENTRY POINT
   Imports all modules and initializes the app
   ============================================ */

import "./style.css";
import { initTheme } from "./js/theme.js";
import { initIntro } from "./js/intro.js";
import { initSmoothScroll } from "./js/smooth-scroll.js";
import { initNavigation } from "./js/navigation.js";
import { initHero } from "./js/hero.js";
import { initTimeline } from "./js/timeline.js";
import { initSkills } from "./js/skills.js";
import { initFishSequence } from "./js/fish-sequence.js";
import { initRobot } from "./js/robot.js";
import { initBoxes } from "./js/boxes.js";
import { initSocial3D } from "./js/social3d.js";
import { initPortfolio } from "./js/portfolio.js";
import { initHeadings } from "./js/headings.js";
import { initParallax } from "./js/parallax.js";
import { initFocusRail } from "./js/focus-rail.js";
import { initFooterCta } from "./js/footer-cta.js";
import { initCursor } from "./js/cursor.js";

// Initialize everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initIntro();
  initSmoothScroll();
  initNavigation();
  initFishSequence();
  initHero();
  initTimeline();
  initSkills();
  initRobot();
  initBoxes();
  initSocial3D();
  initPortfolio();
  initHeadings();
  initParallax();
  initFocusRail();
  initFooterCta();
  initCursor();

  console.log("🚀 Portfolio initialized");
});
```

- [ ] **Step 3: Verify preload + first frame**

Run: `npm run dev`
Open the site. Open DevTools → Network tab, filter by "fish-frames".
Expected:
- 60 WebP requests go out for `frame-001.webp`, `frame-005.webp`, `frame-009.webp`, …, `frame-237.webp` from `assets/fish-frames-web/`.
- All return 200.
- Purple progress bar at top of hero fills from 0% to 100% then fades out.
- Hero shows the first frame of the fish (small fish on the right side, far away).
- No more animated particles.
- No JS console errors.

If any frame 404s, the Vite base path logic is wrong — inspect the failing request URL and verify `import.meta.env.BASE_URL` resolves to the expected dev path (should be `/`). In that case, stop and adjust.

- [ ] **Step 4: Commit**

```bash
git add js/fish-sequence.js main.js
git commit -m "feat(hero): add fish-sequence module with preload and first-frame draw"
```

---

## Task 4: Add scroll-scrub to the fish sequence

**Files:**
- Modify: `js/fish-sequence.js`

- [ ] **Step 1: Extend `initFishSequence` with scroll handler**

Open [js/fish-sequence.js](js/fish-sequence.js). Replace the `export function initFishSequence()` body with this expanded version (keep the helper functions above it — `FRAME_STEP`, `FRAME_START`, `FRAME_END`, `buildFrameUrls`, `loadImage`, `drawCover`, `sizeCanvas` — unchanged):

```js
export function initFishSequence() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const wrapper = document.querySelector(".hero-scroll-wrapper");
  const bar = document.querySelector(".hero-preload-bar");
  const barFill = document.querySelector(".hero-preload-bar__fill");
  const hint = document.querySelector(".hero-scroll-hint");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const urls = buildFrameUrls();
  const frames = new Array(urls.length);
  let { ctx, w, h } = sizeCanvas(canvas);
  let firstDrawn = false;
  let loadedCount = 0;
  let lastFrameIndex = -1;
  let rafId = null;

  function currentProgress() {
    if (!wrapper) return 0;
    const rect = wrapper.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / scrollable));
  }

  function render() {
    rafId = null;
    const progress = currentProgress();
    const index = prefersReducedMotion
      ? frames.length - 1
      : Math.round(progress * (frames.length - 1));
    const img = frames[index];
    if (img && index !== lastFrameIndex) {
      drawCover(ctx, img, w, h);
      lastFrameIndex = index;
    } else if (img && !firstDrawn) {
      drawCover(ctx, img, w, h);
      firstDrawn = true;
      lastFrameIndex = index;
    }
    if (hint) {
      hint.classList.toggle("is-hidden", progress > 0.05);
    }
  }

  function scheduleRender() {
    if (rafId == null) rafId = requestAnimationFrame(render);
  }

  urls.forEach((url, i) => {
    loadImage(url)
      .then((img) => {
        frames[i] = img;
        loadedCount += 1;
        if (barFill) {
          barFill.style.width = `${(loadedCount / urls.length) * 100}%`;
        }
        if (!firstDrawn) {
          drawCover(ctx, img, w, h);
          firstDrawn = true;
        }
        scheduleRender();
        if (loadedCount === urls.length && bar) {
          bar.classList.add("is-done");
        }
      })
      .catch((err) => {
        console.warn("[fish-sequence]", err);
      });
  });

  if (!prefersReducedMotion) {
    window.addEventListener("scroll", scheduleRender, { passive: true });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const sized = sizeCanvas(canvas);
      ctx = sized.ctx;
      w = sized.w;
      h = sized.h;
      lastFrameIndex = -1;
      scheduleRender();
    }, 150);
  });
}
```

- [ ] **Step 2: Verify scroll scrub**

Run: `npm run dev`
Open the site.
Expected:
- At scroll position 0: small fish far on the right (first frame).
- Scroll slowly down through the hero: fish swims right→left and grows larger. The image updates smoothly in sync with scroll.
- Scroll hint "scroll to explore ↓" fades out as soon as you start scrolling.
- Scroll past the pinned hero: About section appears with the fish showing the last frame (fish large/close).
- Scroll back up: fish retreats, scrubbing backward. Scroll hint re-appears near top.
- Resize the window: canvas stays full-bleed; current frame redraws correctly, no distortion.
- No JS errors. Frame rate stays ≥ 50fps during scroll in DevTools Performance.

- [ ] **Step 3: Verify reduced motion**

Temporarily enable "Emulate CSS prefers-reduced-motion: reduce" in DevTools → Rendering tab. Reload.
Expected:
- Hero is not pinned (normal 100vh flow).
- Canvas shows the final frame (fish large/close) statically.
- Scrolling doesn't change the frame.
Disable the emulation when done.

- [ ] **Step 4: Verify mobile**

In DevTools responsive mode, set viewport to 375×812 (iPhone). Reload.
Expected:
- Hero pin spans about 2 viewports of scroll instead of 2.5.
- Fish sequence still scrubs with scroll.
- Scroll hint is smaller and positioned near the bottom.

- [ ] **Step 5: Commit**

```bash
git add js/fish-sequence.js
git commit -m "feat(hero): scroll-scrub fish sequence; fade scroll hint; reduced-motion support"
```

---

## Task 5: Production build verification

**Files:** none

- [ ] **Step 1: Build and preview**

Run: `npm run build`
Expected: build succeeds, `dist/` produced.

Run: `npm run preview` (or whatever Vite preview command this project uses — check `package.json` scripts).
Open the preview URL.
Expected:
- Fish frames load from the correct `/rachma-portfolio/assets/fish-frames/...` paths under the Vite base.
- Scroll scrub behaves identically to dev.
- No 404s in the Network panel.

- [ ] **Step 2: Commit if any fixes were needed**

If Step 1 revealed path issues, fix them in `js/fish-sequence.js` (inspect the failing URL and adjust `buildFrameUrls` — likely an `import.meta.env.BASE_URL` concatenation edge case with leading/trailing slashes) and commit:

```bash
git add js/fish-sequence.js
git commit -m "fix(hero): correct fish-frames asset path under Vite base"
```

If no fixes needed, skip the commit.

---

## Task 6: Final review

- [ ] **Step 1: Run through the full page**

- Reload the site at dev URL.
- Experience: intro overlay → enter → hero appears with fish on right → scroll slowly → fish swims left and grows → pin releases → About section with the boxes canvas renders normally → rest of site unchanged.

- [ ] **Step 2: Check that nothing else regressed**

Confirm still present and working:
- Letter-wave animation on "RACHMA BUNGA SAFITRIE".
- Orbiting tool icons around the portrait.
- Twinkle cursor effect.
- Role switcher.
- Navigation glass effect on scroll.
- About section interactive boxes.
- Spline robot.
- Skills, portfolio, social-3d, contact sections.

- [ ] **Step 3: Final commit if anything touched, else done**

```bash
git status
```

If clean: implementation complete. Otherwise resolve and commit.

---

## Self-Review Notes

Spec coverage check:
- Replace particle bg with fish sequence → Task 3 Step 2 removes `initParticles`, adds `initFishSequence`.
- Every 4th frame (60 frames) → Task 3 `FRAME_STEP = 4`, `FRAME_END = 237`, yields 60 frames.
- Pinned hero (sticky) → Task 2 Step 1.
- Drop-shadow purple glow → Task 2 Step 1 (`filter: drop-shadow(...)` on `.hero-canvas`).
- No tagline overlay → not added (correct).
- Reuse `#hero-canvas` element → Task 3 uses `getElementById("hero-canvas")`.
- `js/particles.js` left on disk → not modified/deleted in any task.
- Preload with progress bar → Task 3 Step 1 fills `.hero-preload-bar__fill`; Task 2 styles it.
- First frame renders as soon as available → Task 3 `firstDrawn` flag.
- Scroll-scrub forward + backward → Task 4 derives `frameIndex` from scroll position in both directions.
- Scroll hint fades on scroll → Task 4 Step 1 toggles `.is-hidden`.
- Responsive (mobile 200vh) → Task 2 Step 2 media query.
- `prefers-reduced-motion` → Task 2 Step 2 CSS; Task 4 Step 1 JS skips scroll binding, renders last frame.
- GitHub Pages base path → Task 3 uses `import.meta.env.BASE_URL`; Task 5 verifies in production build.
- 60fps perf → rAF throttle + redraw-on-change-only (Task 4).

Placeholder scan: no TBDs, every code block is complete, verification steps name specific observations. Type consistency: `frames`, `frameIndex`, `lastFrameIndex`, `scheduleRender`, `render` names used consistently across Tasks 3 and 4.
