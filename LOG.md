# 🔄 Build Log — Portfolio Landing Page

> This file tracks the history of all AI-assisted work sessions.
> **Every AI session MUST read this file first and append to it at the end.**

---

## 📌 Project Context

- **Owner:** Rachma Bunga Safitrie
- **Type:** Portfolio landing page
- **Reference:** https://www.moncy.dev/
- **Tech Stack:** Vite + Vanilla JS + CSS + GSAP + Lenis
- **Data:** `data/LinkedIn_Profile.md`, `data/Rachma Bunga Safitrie.jpeg`

---

## 📋 Master Task Status

| Phase | Task                    | Status  | Session |
| ----- | ----------------------- | ------- | ------- |
| 0.1   | Initialize Vite         | ✅ Done | 1       |
| 0.2   | Install dependencies    | ✅ Done | 1       |
| 0.3   | Add Google Fonts        | ✅ Done | 1       |
| 0.4   | Set up file structure   | ✅ Done | 1       |
| 1.1   | CSS Design System       | ✅ Done | 2       |
| 1.2   | HTML Structure          | ✅ Done | 1       |
| 2.1   | Style Navigation        | ✅ Done | 3       |
| 2.2   | Style Hero              | ✅ Done | 3       |
| 2.3   | Style Timeline          | ✅ Done | 3       |
| 2.4   | Style Skills            | ✅ Done | 3       |
| 2.5   | Style Education         | ✅ Done | 3       |
| 2.6   | Style Contact Footer    | ✅ Done | 3       |
| 2.7   | Style Social Sidebar    | ✅ Done | 3       |
| 3.1   | Lenis Smooth Scroll     | ✅ Done | 1       |
| 3.2   | Hero Animations         | ✅ Done | 1       |
| 3.3   | Navigation Behavior     | ✅ Done | 1       |
| 3.4   | Timeline Scroll Reveals | ✅ Done | 1       |
| 3.5   | Skill Tag Effects       | ✅ Done | 1       |
| 4.1   | Test Desktop            | ✅ Done | 4       |
| 4.2   | Test Mobile             | ✅ Done | 4       |
| 4.3   | Fix Issues              | ✅ Done | 4       |
| 4.4   | Performance Audit       | ✅ Done | 4       |

---

## 📝 Session History

### Session 1 — 2026-04-17 00:49

**Tasks Completed:**

- 0.1: Initialized Vite (vanilla template) via temp directory to preserve `data/`
- 0.2: Installed dependencies — `gsap`, `lenis`, `vite`
- 0.3: Added Google Fonts (Inter + Outfit) to `index.html`
- 0.4: Created full file structure with JS modules
- 1.2: Built complete HTML structure with all 7 sections and real CV data
- 3.1-3.5: Created all JS animation modules (smooth scroll, nav, hero, timeline, skills)

**Changes Made:**

- `package.json` — created (renamed to `rachma-portfolio`)
- `index.html` — full HTML skeleton with all sections, SEO meta, Google Fonts
- `style.css` — CSS design system foundation (variables, reset, base typography)
- `main.js` — entry point importing all modules
- `js/smooth-scroll.js` — Lenis initialization
- `js/navigation.js` — sticky nav + scroll-to-section
- `js/hero.js` — GSAP hero animations + role switcher
- `js/timeline.js` — ScrollTrigger-based timeline reveals
- `js/skills.js` — staggered reveal + hover effects

**Issues Found:**

- `create-vite` cannot scaffold into non-empty directories even with `--no-interactive` flag → workaround: scaffold in temp subdirectory then copy files

**Verification:**

- Dev server runs at `http://localhost:5173/`
- All sections render with real data (unstyled)
- Photo loads correctly
- No console errors

**Next Steps:**

- Phase 1.1: Build comprehensive CSS Design System in `style.css`
- Phase 2.1-2.7: Style all sections to match moncy.dev aesthetic (dark theme, glowing timeline, glass cards)

### Session 2 — 2026-04-17 16:50

**Tasks Completed:**

- 1.1: Built comprehensive CSS Design System — expanded `style.css` from ~73 lines to full design system
- 1.2: Verified HTML structure completeness (already done in Session 1, confirmed all 7 sections correct)

**Changes Made:**

- `style.css` — Complete rewrite with:
  - CSS custom properties (colors, typography, spacing, transitions)
  - CSS reset + base typography (headings, paragraphs)
  - Utility classes (`.container`, `.section-padding`, `.glass`)
  - Navigation: sticky bar, glass-morphism on scroll, hover underline animation
  - Hero: 3-column grid layout, circular photo with glowing pulse, floating orb animation (`@keyframes orbFloat`), photo glow effect (`@keyframes photoPulse`), role switcher styling
  - Timeline: 3-column grid, glowing vertical line, year numbers, role/company styling
  - Skills: flex-wrap pills with border, hover glow effect
  - Education: glass-morphism cards, hover lift animation
  - Contact/Footer: 3-column grid, external link arrows, divider line
  - Social sidebar: fixed left positioning, hover scale animation
  - Responsive breakpoints: 1024px (tablet), 768px (mobile stacking, sidebar hidden), 480px (small mobile)
  - Section heading outline text (`-webkit-text-stroke`)

**Issues Found:**

- Chrome browser extension not connected for visual verification — structure verified via code review

**Next Steps:**

- Phase 2.1-2.7: These are now effectively done as part of Phase 1.1 (all section styles included in the design system)
- Phase 4.1-4.4: Test desktop/mobile, fix issues, performance audit

### Session 3 — 2026-04-17

**Tasks Completed:**

- 2.1: Refined navigation — smooth border-color transition, increased blur, explicit transparent initial state
- 2.2: Refined hero — added radial gradient background, fixed floating orb to use GPU-accelerated `transform` instead of `top/left` in keyframes, added `will-change: transform`, added subtle body background gradients
- 2.3: Fixed timeline — replaced invisible `::before` dots (opacity: 0) with actual `.timeline-dot` elements, added glowing bottom endpoint, added column layout for center
- 2.4: Enhanced skills — added subtle idle float animation (`skillFloat` keyframes) with staggered delays, added background color to pills, pauses animation on hover
- 2.5: Refined education cards — added background transition on hover, enhanced hover glow shadow, increased padding
- 2.6: Refined contact footer — added `display: inline-block` on arrow for proper transform, increased arrow movement on hover, adjusted bottom padding
- 2.7: Enhanced social sidebar — added decorative vertical gradient line below icons via `::after` pseudo-element

**Changes Made:**

- `style.css` — Comprehensive refinements across all 7 section styles (navigation, hero, timeline, skills, education, contact, social sidebar)
- `index.html` — Added `.timeline-dot` div elements inside each `.timeline-center` (5 entries)

**Issues Found:**

- Session 2 noted Phase 2 was "effectively done" but timeline dots were invisible (opacity: 0 on `::before`) — fixed by using actual DOM elements
- Floating orb animation used `top`/`left` properties in keyframes causing layout thrashing — fixed to use `transform`

**Next Steps:**

- Phase 4.1-4.4: Test desktop (1440px) and mobile (375px), fix any layout issues, run performance audit

## Session 6 (2026-04-18)
- Added new transition animation chain matching React Framer-Motion prompt.
- Used SVG curve path morphing animated by GSAP (`M... L... Q... L...`).
- Adapted component design to Vanilla `.intro-overlay`.
- Combined the original `Generating...` loader with the new multi-language text cycler in sequence.
- Matched Tailwind CSS sizing/coloring exactly to project variables (`--bg-primary`, `--text-primary`).
- Pushed changes to GitHub Pages deployment.

## Session 7 (2026-04-18)
- Referenced `igloo.inc` animated square-bracket target hover effect for social links.
- Replaced vertical `.social-sidebar` (hidden on mobile) with fixed bottom horizontal `.igloo-social-bar`.
- Applied `target` corner pseudo-elements (`::before`/`::after` on `.igloo-link` and `.igloo-corners`) using native CSS animated `transform: translate()` mapping.
- Brackets glow seamlessly with the project's `--accent` color. 
- Awaiting user testing; deliberately bypassed push to remote.

## Session 8 (2026-04-18)
- Acknowledged request for igloo.inc 3D particle morphing on social section.
- Added Three.js to implement a point cloud morphing engine.
- Explained limitations regarding proprietary 3D asset generation (Penguin mesh).
