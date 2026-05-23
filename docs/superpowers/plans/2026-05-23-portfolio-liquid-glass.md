# Portfolio Liquid Glass Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current scroll-morph portfolio section (circle→arc, 8 cards, pinned 2400px) with a Liquid Glass + Kinetic Spotlight layout — 4 floating glass cards, auto-rotating spotlight, marquee text background, non-pinned scroll.

**Architecture:** Single section (`#portfolio`) ~100vh tall, three stacked visual layers — radial gradient background that crossfades brand colors, kinetic marquee strip, and 4 horizontal glass cards with one auto-rotating spotlight. JS is a single `initPortfolio()` entrypoint composed of focused helpers (build cards, spotlight controller, layout engine, background painter, interactions). No GSAP ScrollTrigger pin; GSAP is used only for tweens.

**Tech Stack:** Vanilla JS (ES modules), GSAP 3 (already in deps), CSS (`backdrop-filter`, custom properties, `@keyframes`), Vite for asset imports (`?url`).

**Spec:** [docs/superpowers/specs/2026-05-23-portfolio-liquid-glass-design.md](../specs/2026-05-23-portfolio-liquid-glass-design.md)

This project does **not** have an automated test runner. Verification is browser-based: `npm run dev`, open the URL, manually check each acceptance criterion. Every implementation task ends with explicit verification steps that the executor must perform in the browser. No mock tests are written — instead, each task lists what to look for visually.

---

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| [docs/superpowers/specs/2026-05-23-portfolio-liquid-glass-design.md](../specs/2026-05-23-portfolio-liquid-glass-design.md) | read-only | Source of truth |
| [index.html](../../../index.html) | modify (lines ~770-800) | Replace `.portfolio-section` markup |
| [js/portfolio.js](../../../js/portfolio.js) | rewrite | New init logic — 5 internal helpers under one entrypoint |
| [style.css](../../../style.css) | modify (lines ~2750-2990) | Replace `.portfolio-*` CSS block |
| [main.js](../../../main.js) | no change | Still calls `initPortfolio()` |
| [data/work/](../../../data/work/) | read-only | Existing PNGs reused (1 per project) |

The plan is sequenced so the section is **always loadable in the browser** at the end of each task — no broken intermediate states.

---

## Task 1: Replace markup in index.html

**Files:**
- Modify: `index.html` (lines ~770-800)

- [ ] **Step 1: Open index.html and locate the current `<section id="portfolio">` block**

The current block (around line 770) looks like:

```html
<section id="portfolio" class="portfolio-section">
  <h2 class="section-heading-outline">Portofolio</h2>
  <div id="portfolio-stage" class="portfolio-stage">
    <div class="portfolio-intro">
      <h3 class="portfolio-intro-title">Selected Work</h3>
      <p class="portfolio-intro-sub">SCROLL TO EXPLORE</p>
    </div>
    <div class="portfolio-outro">
      <h3 class="portfolio-outro-title">Four projects. One journey.</h3>
      <p class="portfolio-outro-sub">Lavender → Teal → Navy → Yellow</p>
      <a href="https://dribbble.com/bungaracma" target="_blank" rel="noopener" class="portfolio-outro-cta">View full portfolio ↗</a>
    </div>
    <div id="portfolio-cards" class="portfolio-cards"></div>
    <div class="portfolio-caption" id="portfolio-caption">
      <span class="portfolio-caption-project" id="portfolio-caption-project"></span>
      <span class="portfolio-caption-desc" id="portfolio-caption-desc"></span>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Replace it with the new markup**

Replace the entire block above with:

```html
<section id="portfolio" class="portfolio-section">
  <h2 class="section-heading-outline">Portofolio</h2>
  <div id="portfolio-stage" class="portfolio-stage">
    <div class="portfolio-marquee" aria-hidden="true">
      <span class="portfolio-marquee-track">Selected Work&nbsp;·&nbsp;04 Projects&nbsp;·&nbsp;One Journey&nbsp;·&nbsp;Scroll to Explore&nbsp;·&nbsp;</span>
      <span class="portfolio-marquee-track">Selected Work&nbsp;·&nbsp;04 Projects&nbsp;·&nbsp;One Journey&nbsp;·&nbsp;Scroll to Explore&nbsp;·&nbsp;</span>
    </div>
    <div id="portfolio-cards" class="portfolio-cards" role="list"></div>
    <div class="portfolio-dots" id="portfolio-dots" role="tablist" aria-label="Portfolio navigation"></div>
  </div>
</section>
```

- [ ] **Step 3: Run the dev server and visually verify**

Run:
```bash
npm run dev
```

Open the URL shown (usually http://localhost:5173/). Scroll to the portfolio section. Verify:

- The section exists (you should see the "Portofolio" outline heading)
- The section is mostly empty — only the heading and an empty stage
- No console errors related to missing markup (you may see JS errors from `portfolio.js` looking for the removed `#portfolio-caption-project` — that is expected and will be fixed in Task 3)

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "refactor(portfolio): replace section markup for liquid glass redesign"
```

---

## Task 2: Replace CSS block in style.css

**Files:**
- Modify: `style.css` (lines ~2750-2990 — the entire `/* PORTFOLIO (SCROLL-MORPH) SECTION */` block)

- [ ] **Step 1: Locate and select the existing portfolio CSS block**

In `style.css`, find the comment header:
```css
/* ============================================
   PORTFOLIO (SCROLL-MORPH) SECTION
   ============================================ */
```

Select from that header through the end of the `@media (max-width: 768px)` block that follows it (where the `.portfolio-card { width: 58px; height: 82px; ...` rules are). The whole block is approximately lines 2750–2990. Delete it.

- [ ] **Step 2: Insert the new CSS block in the same location**

Insert at the same location (right after the previous section's CSS ends):

```css
/* ============================================
   PORTFOLIO (LIQUID GLASS + KINETIC SPOTLIGHT)
   ============================================ */
.portfolio-section {
  padding: var(--section-padding);
  padding-bottom: 0;
  max-width: var(--container-max);
  margin: 0 auto;
}

#portfolio + .social-3d-section,
.portfolio-section + .social-3d-section {
  margin-top: clamp(-40px, -4vh, -16px);
  padding-top: 0;
}

.portfolio-stage {
  --stage-color: #c8b6e2;
  --portfolio-glass-blur: blur(14px) saturate(140%);
  --portfolio-card-border: 1px solid rgba(255, 255, 255, 0.15);
  --portfolio-card-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.25);
  --portfolio-shadow-base: 0 20px 50px rgba(0, 0, 0, 0.45);
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  height: 100vh;
  min-height: 620px;
  margin-top: 2rem;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse 60% 50% at 50% 40%,
      color-mix(in srgb, var(--stage-color) 22%, transparent) 0%,
      transparent 70%
    ),
    radial-gradient(
      circle at 80% 80%,
      color-mix(in srgb, var(--accent) 10%, transparent) 0%,
      transparent 50%
    ),
    var(--bg-primary);
  transition: background 0.7s ease;
}

/* Marquee (kinetic typography behind cards) */
.portfolio-marquee {
  position: absolute;
  top: 22%;
  left: 0;
  right: 0;
  display: flex;
  gap: 0;
  white-space: nowrap;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.portfolio-marquee.is-ready {
  opacity: 0.30;
  transition: opacity 0.6s ease;
}

.portfolio-marquee-track {
  font-family: var(--font-heading, "Outfit", sans-serif);
  font-weight: 800;
  font-size: clamp(1.1rem, 2vw, 1.6rem);
  color: var(--accent);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  flex: 0 0 auto;
  animation: portfolio-marquee-scroll 28s linear infinite;
}

@keyframes portfolio-marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

/* Card row */
.portfolio-cards {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 2vw, 28px);
  z-index: 3;
  padding: 0 clamp(12px, 4vw, 48px);
}

/* Card */
.portfolio-card {
  --card-color: #b48cde;
  position: relative;
  flex: 0 0 auto;
  width: clamp(160px, 18vw, 230px);
  height: clamp(220px, 32vh, 320px);
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: #fff;
  cursor: pointer;
  background:
    linear-gradient(140deg,
      color-mix(in srgb, var(--card-color) 65%, transparent) 0%,
      color-mix(in srgb, var(--card-color) 22%, transparent) 100%);
  backdrop-filter: var(--portfolio-glass-blur);
  -webkit-backdrop-filter: var(--portfolio-glass-blur);
  border: var(--portfolio-card-border);
  box-shadow:
    var(--portfolio-shadow-base),
    var(--portfolio-card-highlight),
    0 30px 60px color-mix(in srgb, var(--card-color) 30%, transparent);
  transform: translateY(8px);
  transition:
    width 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.7s ease,
    opacity 0.5s ease,
    filter 0.5s ease;
  will-change: transform, box-shadow;
}

.portfolio-card.is-spotlight {
  width: clamp(220px, 22vw, 300px);
  height: clamp(280px, 40vh, 400px);
  border-radius: 20px;
  transform: translateY(0);
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    0 40px 90px color-mix(in srgb, var(--card-color) 50%, transparent),
    0 0 60px color-mix(in srgb, var(--accent) 35%, transparent),
    var(--portfolio-card-highlight);
  z-index: 4;
}

.portfolio-card.is-dim {
  opacity: 0.55;
  filter: blur(2px);
}

.portfolio-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

/* Card image */
.portfolio-card-media {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
}

.portfolio-card-media::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.2) 45%,
    transparent 70%
  );
  pointer-events: none;
}

.portfolio-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Card text content */
.portfolio-card-content {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: none;
}

.portfolio-card-num {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  opacity: 0.75;
}

.portfolio-card-spotlight-tag {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: var(--accent);
  text-transform: uppercase;
  display: none;
}

.portfolio-card-name {
  font-family: var(--font-heading, "Outfit", sans-serif);
  font-weight: 800;
  font-size: clamp(1.1rem, 1.4vw, 1.4rem);
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 4px 0 0;
  text-transform: uppercase;
}

.portfolio-card-caption {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.portfolio-card-cta {
  display: none;
  margin-top: 10px;
  padding: 6px 12px;
  background: #fff;
  color: #000;
  border-radius: 999px;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  align-self: flex-start;
}

.portfolio-card.is-spotlight .portfolio-card-spotlight-tag,
.portfolio-card.is-spotlight .portfolio-card-cta {
  display: inline-block;
}

.portfolio-card.is-spotlight .portfolio-card-name {
  font-size: clamp(1.4rem, 2vw, 2rem);
  font-weight: 900;
}

/* Dot indicators */
.portfolio-dots {
  position: absolute;
  bottom: clamp(20px, 4vh, 40px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 5;
}

.portfolio-dot {
  width: 24px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: width 0.4s ease, background 0.4s ease;
}

.portfolio-dot.is-active {
  width: 32px;
  background: var(--accent);
}

.portfolio-dot:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 6px;
}

/* Entry initial state (JS toggles .is-entered to animate in) */
.portfolio-card.is-entering {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  filter: blur(8px);
}

/* Mobile */
@media (max-width: 768px) {
  .portfolio-section {
    padding-left: clamp(12px, 4vw, 24px);
    padding-right: clamp(12px, 4vw, 24px);
  }
  .portfolio-stage {
    min-height: 540px;
    height: 90vh;
  }
  .portfolio-cards {
    gap: 10px;
    padding: 0 12px;
  }
  .portfolio-card {
    width: 36vw;
    height: 50vh;
  }
  .portfolio-card.is-spotlight {
    width: 70vw;
    height: 62vh;
  }
  .portfolio-marquee-track {
    font-size: 0.95rem;
    animation-duration: 22s;
  }
}

@media (max-width: 480px) {
  .portfolio-stage {
    height: 80vh;
    min-height: 480px;
  }
  .portfolio-card.is-spotlight {
    width: 78vw;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .portfolio-marquee-track {
    animation: none;
  }
  .portfolio-card {
    transition-duration: 0.2s;
  }
  .portfolio-stage {
    transition: none;
  }
}
```

- [ ] **Step 3: Verify in the browser**

Refresh the dev server. Scroll to the portfolio section. Verify:
- The section has the right shape (full-bleed background, ~100vh height)
- The "Portofolio" heading is visible
- No cards yet (they are built by JS in Task 3, which still has the old code — there may be a JS error in the console, that's expected and OK for now)

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "refactor(portfolio): replace CSS with liquid glass styles"
```

---

## Task 3: Rewrite portfolio.js — data model and card builder

**Files:**
- Rewrite: `js/portfolio.js`

This task replaces the entire `js/portfolio.js`. The new file is built in three tasks (Task 3, 4, 5). Task 3 lands a minimal working version: cards build correctly and display in DOM, no interactions yet.

- [ ] **Step 1: Replace the file contents with the minimal working version**

Replace `js/portfolio.js` entirely with:

```js
/* ============================================
   PORTFOLIO — Liquid Glass + Kinetic Spotlight
   See spec: docs/superpowers/specs/2026-05-23-portfolio-liquid-glass-design.md
   ============================================ */

import gsap from "gsap";

import cronicle1 from "../data/work/cronicle-1.png?url";
import wellpad1 from "../data/work/wellpad-1.png?url";
import raya1 from "../data/work/raya-1.png?url";
import maxim2 from "../data/work/maxim-2.png?url";

const SHOT_URLS = {
  Cronicle: "https://dribbble.com/shots/22715943-Cronicle-App-UI-UX-Design-Portfolio",
  Wellpad: "https://dribbble.com/shots/22715683-Wellpad-Health-Lifestyle-App",
  Raya: "https://dribbble.com/shots/23776552-Banking-Apps-Gamification-Feature-Design",
  Maxim: "https://dribbble.com/shots/22715848-Maxim-App-Redesign",
};

const PROJECTS = [
  { name: "Cronicle", caption: "Fashion · Lavender",  color: "#C8B6E2", img: cronicle1, url: SHOT_URLS.Cronicle },
  { name: "Wellpad",  caption: "Wellness · Teal",     color: "#2F6A6A", img: wellpad1,  url: SHOT_URLS.Wellpad  },
  { name: "Raya",     caption: "Banking · Navy",      color: "#0B2A5B", img: raya1,     url: SHOT_URLS.Raya     },
  { name: "Maxim",    caption: "Ride-hail · Yellow",  color: "#F7D417", img: maxim2,    url: SHOT_URLS.Maxim    },
];

const TOTAL = PROJECTS.length;
const SPOTLIGHT_INITIAL = 0;

function buildCards(projects, cardsRoot) {
  return projects.map((p, i) => {
    const num = String(i + 1).padStart(2, "0");
    const el = document.createElement("a");
    el.className = "portfolio-card is-entering";
    el.href = p.url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.dataset.index = String(i);
    el.style.setProperty("--card-color", p.color);
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-label", `${p.name} — ${p.caption}`);
    el.innerHTML = `
      <div class="portfolio-card-media">
        <img src="${p.img}" alt="${p.name} — ${p.caption}" loading="lazy" />
      </div>
      <div class="portfolio-card-content">
        <span class="portfolio-card-num">${num}</span>
        <span class="portfolio-card-spotlight-tag">★ SPOTLIGHT · ${num}</span>
        <h3 class="portfolio-card-name">${p.name}</h3>
        <span class="portfolio-card-caption">${p.caption}</span>
        <span class="portfolio-card-cta">VIEW CASE ↗</span>
      </div>
    `;
    cardsRoot.appendChild(el);
    return el;
  });
}

function buildDots(total, dotsRoot, onSelect) {
  const dots = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");
    dot.className = "portfolio-dot";
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show project ${i + 1}`);
    dot.dataset.index = String(i);
    dot.addEventListener("click", () => onSelect(i));
    dotsRoot.appendChild(dot);
    dots.push(dot);
  }
  return dots;
}

function applySpotlight(cards, dots, stage, activeIndex) {
  cards.forEach((el, i) => {
    el.classList.toggle("is-spotlight", i === activeIndex);
    el.setAttribute("aria-current", i === activeIndex ? "true" : "false");
  });
  dots.forEach((el, i) => {
    el.classList.toggle("is-active", i === activeIndex);
    el.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
  });
  // The stage's background `transition: background 0.7s ease` (set in CSS)
  // handles the visual crossfade — we just need to set the new color.
  stage.style.setProperty("--stage-color", PROJECTS[activeIndex].color);
}

export function initPortfolio() {
  const stage = document.getElementById("portfolio-stage");
  const cardsRoot = document.getElementById("portfolio-cards");
  const dotsRoot = document.getElementById("portfolio-dots");
  if (!stage || !cardsRoot || !dotsRoot) return;

  const cards = buildCards(PROJECTS, cardsRoot);

  let activeIndex = SPOTLIGHT_INITIAL;
  const dots = buildDots(TOTAL, dotsRoot, (i) => {
    activeIndex = i;
    applySpotlight(cards, dots, stage, activeIndex);
  });

  // Initial paint: remove .is-entering after a frame so transition applies
  requestAnimationFrame(() => {
    cards.forEach((el) => el.classList.remove("is-entering"));
    applySpotlight(cards, dots, stage, activeIndex);
  });
}
```

- [ ] **Step 2: Verify in the browser**

Refresh the dev server. Scroll to portfolio section. Verify:

- 4 cards are visible (Cronicle, Wellpad, Raya, Maxim, in that order, left to right)
- The first card (Cronicle) is the spotlight: larger, has `★ SPOTLIGHT · 01` tag and `VIEW CASE ↗` pill
- Background gradient is lavender-tinted
- 4 dots visible at the bottom; the first dot is wider and purple
- Clicking dot 2/3/4 changes which card is the spotlight (size grows, glow shifts, background tint changes to that project's brand color)
- Clicking the spotlight card opens its Dribbble URL in a new tab
- No console errors

Take a screenshot at this point — useful for the next iterations.

- [ ] **Step 3: Commit**

```bash
git add js/portfolio.js
git commit -m "feat(portfolio): rewrite with liquid glass cards + manual spotlight"
```

---

## Task 4: Add entry animation + marquee fade-in

**Files:**
- Modify: `js/portfolio.js`

The cards currently appear without animation. Add a staggered fly-in when the section enters viewport, and fade the marquee to its target opacity.

- [ ] **Step 1: Add IntersectionObserver and entry animation**

Replace the bottom of `initPortfolio()` (everything after the `const dots = buildDots(...)` block) with:

```js
  const marquee = stage.querySelector(".portfolio-marquee");

  function runEntryAnimation() {
    cards.forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        delay: 0.3 + i * 0.08,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        onStart: () => el.classList.remove("is-entering"),
      });
    });
    if (marquee) {
      setTimeout(() => marquee.classList.add("is-ready"), 200);
    }
    setTimeout(() => applySpotlight(cards, dots, stage, activeIndex), 900);
  }

  // Trigger entry once when the section is in view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runEntryAnimation();
        io.disconnect();
      }
    });
  }, { threshold: 0.2 });
  io.observe(stage);
```

Also, **remove** the previous `requestAnimationFrame` block at the end of `initPortfolio()`:

```js
  // REMOVE this block:
  requestAnimationFrame(() => {
    cards.forEach((el) => el.classList.remove("is-entering"));
    applySpotlight(cards, dots, stage, activeIndex);
  });
```

- [ ] **Step 2: Set initial GSAP state for the entry animation**

The CSS class `.is-entering` controls the initial opacity/transform. But GSAP-driven properties (`opacity`, `y`, `scale`, `filter`) need to be set explicitly via `gsap.set` so that GSAP and CSS agree.

Insert this **right after `const cards = buildCards(PROJECTS, cardsRoot);`**:

```js
  gsap.set(cards, { opacity: 0, y: 40, scale: 0.95, filter: "blur(8px)" });
```

- [ ] **Step 3: Verify in browser**

Refresh. Scroll down so the portfolio section enters from below:

- Cards should fly in from below, staggered, with blur clearing to focus (about 1 second total)
- Marquee strip appears at ~20% from top of section, scrolling continuously to the left
- Spotlight (first card) ramps up after all cards land
- Scrolling away and back: animation does NOT replay (one-shot, correct)
- Dots still work to switch spotlight

- [ ] **Step 4: Commit**

```bash
git add js/portfolio.js
git commit -m "feat(portfolio): add entry animation and marquee reveal"
```

---

## Task 5: Add auto-rotation + hover dim + click promotion

**Files:**
- Modify: `js/portfolio.js`

Now add the core spotlight behaviors: auto-rotate every 4.5s with pause logic, hover-dim non-spotlight cards, and click-to-promote for non-spotlight cards.

- [ ] **Step 1: Add rotation controller**

Inside `initPortfolio()`, after the `const dots = buildDots(...)` block and before the `runEntryAnimation` function, add:

```js
  const ROTATION_MS = 4500;
  const MANUAL_LOCK_MS = 8000;

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover)").matches;

  let rotationTimer = null;
  let manualLockUntil = 0;
  let inViewport = false;
  let hovering = false;

  function shouldAutoRotate() {
    if (prefersReducedMotion) return false;
    if (!inViewport) return false;
    if (hovering) return false;
    if (Date.now() < manualLockUntil) return false;
    return true;
  }

  function scheduleNext() {
    clearTimeout(rotationTimer);
    if (!shouldAutoRotate()) return;
    rotationTimer = setTimeout(() => {
      activeIndex = (activeIndex + 1) % TOTAL;
      applySpotlight(cards, dots, stage, activeIndex);
      scheduleNext();
    }, ROTATION_MS);
  }

  function selectIndex(i, manual) {
    if (i === activeIndex) return;
    activeIndex = i;
    applySpotlight(cards, dots, stage, activeIndex);
    if (manual) {
      manualLockUntil = Date.now() + MANUAL_LOCK_MS;
    }
    scheduleNext();
  }
```

- [ ] **Step 2: Replace the dot click handler to use selectIndex**

Find this earlier line:
```js
  const dots = buildDots(TOTAL, dotsRoot, (i) => {
    activeIndex = i;
    applySpotlight(cards, dots, stage, activeIndex);
  });
```

Replace the callback with:
```js
  const dots = buildDots(TOTAL, dotsRoot, (i) => selectIndex(i, true));
```

- [ ] **Step 3: Intercept card clicks — promote non-spotlight, allow default for spotlight**

Add inside `initPortfolio()`, after the rotation controller block:

```js
  cards.forEach((el, i) => {
    el.addEventListener("click", (e) => {
      if (i !== activeIndex) {
        e.preventDefault();
        selectIndex(i, true);
      }
    });
  });
```

- [ ] **Step 4: Add hover dim (desktop only)**

Add after the click handler block:

```js
  if (supportsHover) {
    cards.forEach((el, i) => {
      el.addEventListener("mouseenter", () => {
        hovering = true;
        cards.forEach((c, j) => {
          c.classList.toggle("is-dim", j !== i);
        });
        clearTimeout(rotationTimer);
      });
      el.addEventListener("mouseleave", () => {
        hovering = false;
        cards.forEach((c) => c.classList.remove("is-dim"));
        scheduleNext();
      });
    });
  }
```

- [ ] **Step 5: Tie viewport detection to rotation**

Replace the existing `IntersectionObserver` block with:

```js
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inViewport = entry.isIntersecting;
      if (inViewport && entry.intersectionRatio >= 0.2) {
        runEntryAnimation();
        // Switch to a presence observer after first run
        io.unobserve(stage);
        const presenceIo = new IntersectionObserver((es) => {
          es.forEach((e) => {
            inViewport = e.isIntersecting;
            if (inViewport) scheduleNext();
            else clearTimeout(rotationTimer);
          });
        }, { threshold: 0.1 });
        presenceIo.observe(stage);
      }
    });
  }, { threshold: 0.2 });
  io.observe(stage);
```

Also, **change `runEntryAnimation`** so it kicks off the first rotation at its end. Find the line `setTimeout(() => applySpotlight(...)` inside `runEntryAnimation` and add a `scheduleNext()` call after the applySpotlight call:

```js
    setTimeout(() => {
      applySpotlight(cards, dots, stage, activeIndex);
      scheduleNext();
    }, 900);
```

- [ ] **Step 6: Verify in browser**

Refresh and scroll to portfolio:

- Cards fly in (as in Task 4)
- ~4.5s after entry, the spotlight advances to card 2 automatically (Wellpad — teal)
- Another ~4.5s: card 3 (Raya — navy)
- Then card 4 (Maxim — yellow), then loops back to card 1
- Hover over a non-spotlight card: that card stays clear, all others fade/blur slightly, auto-rotation pauses
- Move mouse away: dim clears, auto-rotation resumes
- Click a non-spotlight card: it becomes the spotlight (no new tab opens). Auto-rotation pauses for ~8s.
- Click the spotlight card: opens Dribbble in new tab
- Click dot 3: card 3 becomes spotlight, pause for ~8s
- Scroll away from section: rotation stops (no extra timer fires)
- Scroll back: rotation resumes

- [ ] **Step 7: Commit**

```bash
git add js/portfolio.js
git commit -m "feat(portfolio): add auto-rotation, hover dim, click promotion"
```

---

## Task 6: Add magnetic tilt + breathing glow + mouse parallax

**Files:**
- Modify: `js/portfolio.js`

Polish layer: subtle continuous motion and per-card magnetic tilt on hover. Skipped entirely under `prefers-reduced-motion`.

- [ ] **Step 1: Add magnetic tilt on hover (desktop only)**

Inside the existing `if (supportsHover) { ... }` block — extend the existing `mouseenter`/`mouseleave` logic by adding `mousemove` and resetting transform on leave. Replace the whole `if (supportsHover)` block with:

```js
  if (supportsHover && !prefersReducedMotion) {
    cards.forEach((el, i) => {
      let raf = null;
      const onMove = (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          gsap.to(el, {
            duration: 0.4,
            ease: "power2.out",
            rotationX: -ny * 4,
            rotationY: nx * 4,
            y: -8,
            transformPerspective: 800,
          });
          raf = null;
        });
      };
      const reset = () => {
        gsap.to(el, {
          duration: 0.5,
          ease: "power2.out",
          rotationX: 0,
          rotationY: 0,
          y: el.classList.contains("is-spotlight") ? 0 : 8,
        });
      };
      el.addEventListener("mouseenter", () => {
        hovering = true;
        cards.forEach((c, j) => c.classList.toggle("is-dim", j !== i));
        clearTimeout(rotationTimer);
        el.addEventListener("mousemove", onMove);
      });
      el.addEventListener("mouseleave", () => {
        hovering = false;
        cards.forEach((c) => c.classList.remove("is-dim"));
        el.removeEventListener("mousemove", onMove);
        reset();
        scheduleNext();
      });
    });
  } else if (supportsHover) {
    // Reduced motion: keep dim-on-hover and pause behavior, no tilt
    cards.forEach((el, i) => {
      el.addEventListener("mouseenter", () => {
        hovering = true;
        cards.forEach((c, j) => c.classList.toggle("is-dim", j !== i));
        clearTimeout(rotationTimer);
      });
      el.addEventListener("mouseleave", () => {
        hovering = false;
        cards.forEach((c) => c.classList.remove("is-dim"));
        scheduleNext();
      });
    });
  }
```

This replaces the simpler `if (supportsHover)` block from Task 5.

- [ ] **Step 2: Add mouse parallax (cards drift slightly with cursor)**

Add after the hover/tilt block:

```js
  if (!prefersReducedMotion) {
    let parallaxRaf = null;
    stage.addEventListener("mousemove", (e) => {
      if (parallaxRaf) return;
      parallaxRaf = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        cards.forEach((el, i) => {
          // Skip if currently being hover-tilted (mouse is over that card)
          if (el.matches(":hover")) return;
          const depth = el.classList.contains("is-spotlight") ? 6 : 4;
          gsap.to(el, {
            duration: 0.6,
            ease: "power2.out",
            x: nx * depth,
          });
        });
        parallaxRaf = null;
      });
    });
  }
```

- [ ] **Step 3: Add breathing glow via CSS**

This one is CSS-only (no JS change). Open `style.css` and find the `.portfolio-card { ... }` rule block. Below it, add:

```css
@keyframes portfolio-breathe {
  0%, 100% { box-shadow:
      var(--portfolio-shadow-base),
      var(--portfolio-card-highlight),
      0 30px 60px color-mix(in srgb, var(--card-color) 30%, transparent);
  }
  50% { box-shadow:
      var(--portfolio-shadow-base),
      var(--portfolio-card-highlight),
      0 30px 75px color-mix(in srgb, var(--card-color) 38%, transparent);
  }
}

@keyframes portfolio-breathe-spotlight {
  0%, 100% { box-shadow:
      0 40px 90px color-mix(in srgb, var(--card-color) 50%, transparent),
      0 0 60px color-mix(in srgb, var(--accent) 35%, transparent),
      var(--portfolio-card-highlight);
  }
  50% { box-shadow:
      0 40px 100px color-mix(in srgb, var(--card-color) 60%, transparent),
      0 0 80px color-mix(in srgb, var(--accent) 45%, transparent),
      var(--portfolio-card-highlight);
  }
}

.portfolio-card:not(.is-entering):not(:hover) {
  animation: portfolio-breathe 4s ease-in-out infinite;
}

.portfolio-card.is-spotlight:not(.is-entering):not(:hover) {
  animation: portfolio-breathe-spotlight 4s ease-in-out infinite;
}

.portfolio-card[data-index="1"] { animation-delay: -1s; }
.portfolio-card[data-index="2"] { animation-delay: -2s; }
.portfolio-card[data-index="3"] { animation-delay: -3s; }

@media (prefers-reduced-motion: reduce) {
  .portfolio-card,
  .portfolio-card.is-spotlight {
    animation: none !important;
  }
}
```

- [ ] **Step 4: Verify in browser**

Refresh and scroll to portfolio:

- Each card has a subtle glow pulse (~4s cycle), offset between cards (they don't all pulse together)
- Hover a card: it lifts ~8px and tilts up to ~4 degrees as you move the cursor across it. Glow gets bigger.
- Move cursor away: card returns smoothly to rest
- Move cursor across the section (not on a card): all cards drift slightly horizontally (up to ~6px) — magnetic parallax effect
- Open devtools, toggle "Emulate CSS prefers-reduced-motion: reduce" → no tilt, no parallax, no glow breathing, marquee stops scrolling. Cards remain clickable.

- [ ] **Step 5: Commit**

```bash
git add js/portfolio.js style.css
git commit -m "feat(portfolio): add magnetic tilt, mouse parallax, breathing glow"
```

---

## Task 7: Add swipe support for mobile

**Files:**
- Modify: `js/portfolio.js`

Touch devices skip hover/tilt entirely. Add swipe left/right to navigate spotlight.

- [ ] **Step 1: Add touch handlers**

Add after the parallax block in `initPortfolio()`:

```js
  // Touch / swipe support (mobile)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;
  const SWIPE_THRESHOLD = 40;

  stage.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchActive = true;
  }, { passive: true });

  stage.addEventListener("touchend", (e) => {
    if (!touchActive) return;
    touchActive = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    // Only treat as a swipe if horizontal motion dominates
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) < Math.abs(dy)) return;
    const dir = dx < 0 ? 1 : -1; // swipe left → next
    const next = (activeIndex + dir + TOTAL) % TOTAL;
    selectIndex(next, true);
  }, { passive: true });
```

- [ ] **Step 2: Verify in browser**

Open Chrome DevTools, toggle device mode (e.g. iPhone 12 preset). Refresh, scroll to portfolio:

- Cards arrange as: spotlight in center, ~15% peek of neighbors on either side
- Tap a non-spotlight card: it becomes spotlight (works the same as desktop click)
- Tap-and-drag from right to left across the section: spotlight advances to the next project
- Tap-and-drag from left to right: spotlight goes back to the previous project
- Vertical scroll still works (doesn't interfere)
- Auto-rotation runs at 5.5s (per the CSS — wait, no, the JS doesn't change rotation timing on mobile. Just verify rotation is happening.)

- [ ] **Step 3: Commit**

```bash
git add js/portfolio.js
git commit -m "feat(portfolio): add swipe navigation for touch devices"
```

---

## Task 8: Final QA pass + spec acceptance verification

**Files:**
- No code changes unless a bug is found

Walk through every acceptance criterion from the spec and verify it works. Fix any issues immediately and commit fixes as needed.

- [ ] **Step 1: Run dev server and walk through each criterion**

Run:
```bash
npm run dev
```

For each item below, verify in the browser. Mark each check as you confirm:

1. The section is no longer pinned — scrolling past it feels natural (no scroll-hijack)
2. Four glass cards are visible, each clearly tied to a project's brand color (lavender, teal, navy, yellow)
3. The center spotlight card is visually dominant (larger, stronger glow, has the CTA pill)
4. The spotlight rotates automatically every ~4.5s while the section is in view
5. Clicking a non-spotlight card promotes it to spotlight (does NOT open Dribbble on the first click)
6. The background gradient color follows the spotlight (smooth crossfade)
7. The marquee text scrolls continuously behind the cards
8. Clicking the spotlight opens the correct Dribbble shot in a new tab
9. On mobile (Chrome DevTools, iPhone preset), the section is usable: spotlight visible, swipe works, no horizontal page-scroll bleed
10. With `prefers-reduced-motion: reduce` (devtools toggle), no auto-rotation, no marquee scroll, no breathing — but cards remain clickable
11. No console errors, no broken images, no layout shift on initial load
12. The "Portofolio" outlined heading remains visible at the top of the section

- [ ] **Step 2: Production build sanity check**

Run:
```bash
npm run build
```

Verify the build succeeds with no errors. Then preview:
```bash
npm run preview
```

Open the preview URL and re-confirm the portfolio section looks and behaves the same as in dev.

- [ ] **Step 3: Fix any issues found**

If any criterion fails, fix it inline. Commit each fix with a clear message: `fix(portfolio): <what was broken>`.

- [ ] **Step 4: Final commit (if any QA fixes were made)**

```bash
git add -A
git status   # confirm only intended files
git commit -m "fix(portfolio): QA pass corrections" # only if there are changes
```

If nothing changed in Step 3, skip the commit and proceed.

- [ ] **Step 5: Done**

The portfolio redesign is complete. Confirm with the user that they want to leave it on `main` or move to a feature branch / open a PR.

---

## Notes for the Executor

- **GSAP is already in `package.json`** — no `npm install` needed.
- **All asset paths use Vite's `?url` import suffix** — this is required so GitHub Pages serves them from the `/rachma-portfolio/` base. Do not change to plain relative paths.
- **Do not touch `main.js`.** It already calls `initPortfolio()` and that export name is unchanged.
- **Do not touch other sections** (hero, about, social-3d). The CSS scope is limited to `.portfolio-*` and `#portfolio-*` selectors.
- **`prefers-reduced-motion` is detected once at init.** If a user toggles it mid-session, they must refresh. This is acceptable for a portfolio site.
- **The marquee duplicates its text twice in markup** so the seamless `translateX(-100%)` loop works without visible gaps. Do not change to a single track.
- **`backdrop-filter` is GPU-expensive.** All four cards use it. If perf is bad on low-end mobile, the spec allows dropping `backdrop-filter` on non-spotlight cards (replace with a solid `rgba` background) — but only do that if a real device shows jank.
- **`color-mix(in srgb, ...)` is used heavily.** This needs modern browsers (Chrome 111+, Safari 16.4+, Firefox 113+). Project already uses it in `.portfolio-stage` (current code), so OK.
- **No tests are written** because the project has no test runner. Verification is purely visual. If the user later adds a test runner, the spotlight controller (the `selectIndex`/`scheduleNext` pair) is the natural seam to unit-test.
