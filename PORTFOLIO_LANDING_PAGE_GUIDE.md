# 🎨 Portfolio Landing Page — Complete AI Implementation Guide

> **For:** Rachma Bunga Safitrie — UI/UX & Product Designer
> **Reference:** [moncy.dev](https://www.moncy.dev/)
> **Created:** 2026-04-17

---

# PART 1: COMPREHENSIVE AI PROMPT

Below is a ready-to-use prompt you can copy-paste into any AI coding assistant (Claude, ChatGPT, Cursor, GitHub Copilot, etc.) to build the entire landing page.

---

````markdown
## SYSTEM CONTEXT

You are building a professional portfolio landing page for **Rachma Bunga Safitrie**, a UI/UX & Product Designer based in Jakarta, Indonesia. The site is heavily inspired by [moncy.dev](https://www.moncy.dev/) — a dark, immersive, single-page portfolio with smooth scroll animations, a glowing timeline, and interactive visual elements.

### Tech Stack (mandatory)

| Layer         | Tool                                                  | Why                                        |
| ------------- | ----------------------------------------------------- | ------------------------------------------ |
| Build tool    | **Vite**                                              | Fast dev server, instant HMR               |
| Framework     | **Vanilla JS** (or React if you prefer)               | Keeps it simple, flexible                  |
| Styling       | **Vanilla CSS**                                       | Full control, no utility-class bloat       |
| Animations    | **GSAP + ScrollTrigger**                              | Industry-standard scroll-driven animations |
| Smooth scroll | **Lenis**                                             | Buttery-smooth native scroll               |
| Fonts         | Google Fonts: **Outfit** (headings), **Inter** (body) | Modern, clean                              |
| Icons         | **Lucide Icons** or inline SVGs                       | Lightweight, sharp                         |
| Deployment    | **Vercel** or **Netlify**                             | One-click deploy from Git                  |

### Project Root

```
/Users/diky/Documents/landing-page-try/
```

### Data Sources (do NOT modify these files)

| File                              | What it contains                                             |
| --------------------------------- | ------------------------------------------------------------ |
| `data/LinkedIn_Profile.md`        | Full CV: name, title, summary, experience, education, skills |
| `data/Rachma Bunga Safitrie.jpeg` | Professional headshot photo                                  |

---

## PERSONAL DATA (extracted from CV)

```yaml
name: "Rachma Bunga Safitrie"
headline: "UI/UX Designer · Product Designer"
location: "Jakarta, Indonesia"
email: "bungaracma@gmail.com"
linkedin: "https://www.linkedin.com/in/rachmabunga-safitrie"
portfolio: "https://dribbble.com/bungaracma"
photo: "data/Rachma Bunga Safitrie.jpeg"

top_skills:
  - Adobe Photoshop
  - Mobile Interface Design
  - Product Design

summary: >
  I am a highly creative person with a passion for generating innovative solutions.
  With a strong background in UI/UX & visual design and creative media development,
  I am constantly looking for new ways to generate fresh and engaging ideas.
  I believe that creativity is a driving force that motivates me to tackle challenges,
  create compelling experiences and make a positive impact in every project I take on.

experience:
  - role: "Product Designer"
    company: "PT Bank Raya Indonesia Tbk."
    period: "April 2024 - Present"
    location: "South Jakarta, Indonesia"
    description: ""

  - role: "Product Designer"
    company: "Voltron Indonesia"
    period: "Dec 2023 - Feb 2024"
    location: "Jakarta, Indonesia"
    description: ""

  - role: "HR Design & Creative Specialist"
    company: "Investree"
    period: "Dec 2022 - Aug 2023"
    location: "Indonesia"
    description: >
      Produced creative content (infographics, news, special day content).
      Increased engagement by creating daily work-related content.
      Created short video content about employees' daily lives.
      Generated video content ideas, including production and editing.

  - role: "Content Writer and Design"
    company: "Kementerian Pertanian"
    period: "Jul 2021 - Sep 2021"
    location: "Indonesia"
    description: >
      Created social media and website content and wrote news/articles.
      Designed infographics to enhance the visual appeal of articles.
      Organized content calendars and schedules.

  - role: "Content Specialist"
    company: "FIX Indonesia"
    period: "Feb 2021 - Jul 2021"
    location: "Indonesia"
    description: >
      Generated ideas for YouTube news content.
      Created scripts and designed graphic assets for video editing.

education:
  - degree: "Bachelor's degree, Management of Media Production"
    school: "Universitas Padjadjaran"
    period: "2018 - 2022"

  - degree: "UI/UX Research and Design"
    school: "Binar Academy"
    period: "March 2022 - July 2022"
```

---

## DESIGN SPECIFICATION (inspired by moncy.dev)

### Color Palette

| Token                | Value                      | Usage                          |
| -------------------- | -------------------------- | ------------------------------ |
| `--bg-primary`       | `#050405`                  | Main background (near-black)   |
| `--bg-card`          | `#0d0b0f`                  | Card / section backgrounds     |
| `--text-primary`     | `#EAE5EC`                  | Headings, main text            |
| `--text-secondary`   | `#8a8490`                  | Body text, captions            |
| `--accent`           | `#b48cde`                  | Purple accent (links, glows)   |
| `--accent-secondary` | `#7c5caa`                  | Darker purple for hover states |
| `--glow`             | `rgba(180, 140, 222, 0.3)` | Glow effects                   |

### Typography

```css
:root {
  --font-heading: "Outfit", sans-serif; /* 700-900 weight */
  --font-body: "Inter", sans-serif; /* 300-500 weight */
}
```

- Hero name: `clamp(3rem, 8vw, 6rem)`, weight 900, uppercase
- Section headings: `clamp(2rem, 5vw, 3.5rem)`, weight 700
- Body text: `clamp(0.95rem, 1.2vw, 1.1rem)`, weight 300
- Nav links: `0.875rem`, weight 500, letter-spacing `0.05em`, uppercase

### Layout Rules

- Max content width: `1200px`, centered with `margin: 0 auto`
- Section padding: `clamp(80px, 12vh, 160px) clamp(24px, 5vw, 80px)`
- Always full-viewport-height hero section (`min-height: 100vh`)
- Fixed social sidebar on the left (hidden on mobile)
- Sticky navigation bar at top

---

## SECTIONS TO BUILD (in order)

### 1. 🧭 Navigation Bar (sticky)

- **Left:** Logo or name "rachma.design" (text logo, weight 700)
- **Center:** Email link `bungaracma@gmail.com` (clickable `mailto:`)
- **Right:** Nav links → ABOUT · WORK · CONTACT (smooth scroll to sections)
- Subtle glass-morphism background on scroll: `backdrop-filter: blur(12px)`
- Navigation links have hover underline animation (bottom border slides in from left)

### 2. 🌟 Hero Section (100vh)

- **Layout:** Two-column — text left, photo right
- **Left side:**
  - Small greeting: "Hello! I'm" (font-size small, `--text-secondary` color)
  - Large name: "RACHMA BUNGA SAFITRIE" (huge, bold, `--text-primary`)
- **Right side:**
  - "A Creative" label (small text)
  - **Dynamic text switcher** cycling through: `DESIGNER` → `CREATIVE` → `PROBLEM SOLVER` (typing/morphing animation)
- **Center:** Large circular or soft-rounded photo of Rachma with a glowing purple border/shadow
- **Background:** Very subtle radial gradient glow (purple/dark) behind the photo
- **Floating orb:** A soft, blurred purple circle that slowly floats around (CSS animation)

### 3. 📋 About / Experience Timeline

- **Heading:** "About" in large transparent outline text
- **Layout:** Three-column timeline:
  - **Left column:** Role title (bold) + Company name (accent color)
  - **Center column:** Year (large, semi-transparent), connected by a vertical glowing line
  - **Right column:** Description paragraph
- **Timeline entries (from CV):**
  1. `2024` → Product Designer · Bank Raya Indonesia
  2. `2023` → Product Designer · Voltron Indonesia
  3. `2022` → HR Design & Creative Specialist · Investree
  4. `2021` → Content Writer & Design · Kementerian Pertanian
  5. `2021` → Content Specialist · FIX Indonesia
- **Glowing vertical line** connecting all entries (purple glow at the bottom dot)
- Each entry animates in on scroll (staggered fade + slide up)

### 4. 🎨 Skills Section

- **Heading:** "MY SKILLS" in massive outlined/transparent text (stroke only, no fill)
- **Layout:** Grid or floating tags of skills:
  - Adobe Photoshop · Mobile Interface Design · Product Design
  - Figma · Adobe Illustrator · UI/UX Design · Prototyping · Wireframing
  - Content Creation · Video Editing · Visual Design
- Each skill is a rounded pill/tag with border, hover glow effect
- Optional: Animated floating/orbiting layout (CSS keyframes)
- Alternatively: Interactive skill cards with icons that tilt on hover (CSS perspective transform)

### 5. 🎓 Education Section

- **Heading:** "Education"
- **Card layout** (two cards side by side):
  - 📘 Universitas Padjadjaran — Bachelor's, Management of Media Production (2018-2022)
  - 📘 Binar Academy — UI/UX Research and Design (Mar 2022 - Jul 2022)
- Cards have subtle glass-morphism effect, hover lift animation

### 6. 📬 Contact / Footer

- **Heading:** "CONTACT" in large bold text
- **Three-column grid:**
  - **Left:** "Email" label + `bungaracma@gmail.com` (clickable)
  - **Center:** "Social" label + LinkedIn ↗ · Dribbble ↗ (external links with arrow icon)
  - **Right:** "Designed and Developed" credit line
- **Location:** "Jakarta, Indonesia"
- Divider line above footer
- Social links have diagonal arrow icons indicating external links

### 7. 🔗 Fixed Social Sidebar (left edge)

- Vertical stack of icons: LinkedIn · Dribbble
- Fixed position, vertically centered on the left side
- Hidden on mobile (below 768px)
- Icons have hover scale + color change animation

---

## ANIMATION REQUIREMENTS

| Element          | Library                  | Effect                                              |
| ---------------- | ------------------------ | --------------------------------------------------- |
| Page scroll      | **Lenis**                | Smooth, momentum-based scrolling                    |
| Section reveals  | **GSAP + ScrollTrigger** | Fade in + slide up, staggered per child             |
| Hero text        | **GSAP**                 | Letter-by-letter reveal on page load                |
| Role switcher    | **JS/CSS**               | Typing effect cycling through roles every 3 seconds |
| Timeline entries | **GSAP + ScrollTrigger** | Staggered reveal, glow line grows on scroll         |
| Skill tags       | **CSS**                  | Hover glow + subtle float animation                 |
| Nav bar          | **CSS**                  | Glass blur appears after 50px scroll                |
| Photo            | **CSS**                  | Glowing purple border pulse animation               |
| Floating orb     | **CSS**                  | Slow orbit using `@keyframes`                       |

---

## RESPONSIVE DESIGN

| Breakpoint   | Changes                                                 |
| ------------ | ------------------------------------------------------- |
| `≤ 768px`    | Single column layout, stacked hero, hide social sidebar |
| `769-1024px` | Two columns for hero, smaller fonts                     |
| `≥ 1025px`   | Full three-column timeline, all features visible        |

- All font sizes use `clamp()` for fluid scaling
- Images scale with `max-width: 100%`
- Timeline switches to single-column on mobile with role/year stacked

---

## SEO & META

```html
<title>Rachma Bunga Safitrie — UI/UX & Product Designer</title>
<meta
  name="description"
  content="Portfolio of Rachma Bunga Safitrie, a creative UI/UX and Product Designer based in Jakarta, Indonesia. Specializing in mobile interface design and visual storytelling."
/>
<meta
  name="keywords"
  content="UI/UX Designer, Product Designer, Jakarta, Portfolio, Mobile Interface Design"
/>
<meta property="og:title" content="Rachma Bunga Safitrie — UI/UX Designer" />
<meta
  property="og:description"
  content="Creative UI/UX and Product Designer based in Jakarta."
/>
<meta property="og:image" content="./data/Rachma Bunga Safitrie.jpeg" />
```

---

## QUALITY CHECKLIST

Before considering the build complete, verify:

- [ ] All sections render correctly on desktop (1440px) and mobile (375px)
- [ ] Smooth scroll works across all sections
- [ ] Navigation links scroll to correct sections
- [ ] Role switcher cycles through all 3 roles
- [ ] Timeline entries animate on scroll
- [ ] Photo displays correctly with glow effect
- [ ] All external links open in new tabs (`target="_blank"`)
- [ ] No console errors
- [ ] Lighthouse performance score ≥ 90
- [ ] Page loads in under 3 seconds
````

---

# PART 2: STEP-BY-STEP IMPLEMENTATION PLAN

Use this as a sequential task list. Run each step one at a time. Mark each step as complete before moving to the next.

---

## Phase 0: Project Setup

### Step 0.1 — Initialize Vite Project

```bash
cd /Users/diky/Documents/landing-page-try
npm create vite@latest ./ -- --template vanilla
npm install
```

> If prompted about existing files, overwrite. The `data/` folder will remain intact.

### Step 0.2 — Install Dependencies

```bash
npm install gsap @studio-freight/lenis
```

### Step 0.3 — Add Google Fonts

In `index.html`, add inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Outfit:wght@700;800;900&display=swap"
  rel="stylesheet"
/>
```

### Step 0.4 — Set Up Project Structure

Create the following file structure:

```
/Users/diky/Documents/landing-page-try/
├── index.html              ← Main HTML (all sections)
├── style.css               ← Global styles + design tokens
├── main.js                 ← Entry point, imports & init
├── js/
│   ├── navigation.js       ← Sticky nav, smooth scroll links
│   ├── hero.js             ← Hero animations, role switcher
│   ├── timeline.js         ← Experience timeline scroll reveals
│   ├── skills.js           ← Skill tags hover effects
│   └── smooth-scroll.js    ← Lenis initialization
├── data/                   ← (existing, DO NOT MODIFY)
│   ├── LinkedIn_Profile.md
│   ├── LinkedIn_Profile.pdf
│   └── Rachma Bunga Safitrie.jpeg
└── LOG.md                  ← Build log / history file (see Part 3)
```

---

## Phase 1: Foundation (HTML + CSS Design System)

### Step 1.1 — Build `style.css` Design System

1. Define all CSS custom properties (colors, fonts, spacing)
2. CSS Reset (box-sizing, margin, padding)
3. Base typography styles
4. Utility classes (`.section-padding`, `.container`, `.glass`)
5. Floating orb keyframe animation
6. Responsive breakpoints

### Step 1.2 — Build `index.html` Structure

Write the complete HTML skeleton with all 7 sections:

1. `<nav>` — Navigation bar
2. `<section id="hero">` — Hero section
3. `<section id="about">` — Experience timeline
4. `<section id="skills">` — Skills grid
5. `<section id="education">` — Education cards
6. `<section id="contact">` — Contact footer
7. `<aside>` — Fixed social sidebar

Fill in all real content from the CV data. No Lorem Ipsum.

---

## Phase 2: Styling (Section by Section)

### Step 2.1 — Style Navigation

- Glass morphism effect (backdrop-filter on scroll)
- Flexbox layout, sticky positioning
- Hover underline animation on nav links

### Step 2.2 — Style Hero Section

- Two-column layout with centered photo
- Glowing photo border (box-shadow with purple glow)
- Floating purple orb (CSS keyframes)
- Responsive: stacks vertically on mobile

### Step 2.3 — Style Timeline

- Three-column grid (role | year | description)
- Glowing vertical center line
- Year numbers in large semi-transparent text
- Responsive: single column on mobile

### Step 2.4 — Style Skills Section

- Outlined heading text (using `-webkit-text-stroke`)
- Skill pills/tags grid with border and hover glow
- Float animation on hover

### Step 2.5 — Style Education Section

- Glass-morphism cards
- Side-by-side layout (flexbox)
- Hover lift effect

### Step 2.6 — Style Contact Footer

- Three-column grid
- External link arrows (↗)
- Divider line

### Step 2.7 — Style Social Sidebar

- Fixed positioning, left edge
- Vertical icon stack
- Hide on mobile

---

## Phase 3: Animations & Interactivity

### Step 3.1 — Initialize Lenis Smooth Scroll

In `js/smooth-scroll.js`:

```js
import Lenis from "@studio-freight/lenis";
const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

### Step 3.2 — Hero Animations

In `js/hero.js`:

- GSAP timeline: fade in greeting → animate name letters → start role switcher
- Role switcher: cycle through `['DESIGNER', 'CREATIVE', 'PROBLEM SOLVER']` every 3s with typing effect

### Step 3.3 — Navigation Behavior

In `js/navigation.js`:

- Add scroll listener: toggle `.scrolled` class on nav when `scrollY > 50`
- Smooth scroll on nav link click (using Lenis `scrollTo`)

### Step 3.4 — Timeline Scroll Reveals

In `js/timeline.js`:

- GSAP ScrollTrigger: each timeline entry fades in + slides up when entering viewport
- Glowing line grows in height as user scrolls through

### Step 3.5 — Skill Tag Effects

In `js/skills.js`:

- Add hover listeners for glow/scale micro-interactions
- Optional: subtle float animation on idle

---

## Phase 4: Polish & QA

### Step 4.1 — Test Desktop (1440px)

- Open in browser, verify all sections
- Check that scroll animations trigger correctly
- Verify role switcher cycles

### Step 4.2 — Test Mobile (375px)

- Resize browser or use DevTools
- Verify single-column layouts
- Verify sidebar hidden
- Verify readable font sizes

### Step 4.3 — Fix Any Issues

- Check console for JS errors
- Fix any layout overflows
- Ensure all links work

### Step 4.4 — Performance Audit

- Run Lighthouse in Chrome DevTools
- Target: Performance ≥ 90, Accessibility ≥ 90
- Optimize image (compress JPEG if needed)

---

# PART 3: LOGGING & HISTORY TRACKING

To maintain continuity across multiple AI sessions, use a `LOG.md` file that acts as a shared memory / history log.

---

## Setup: Create `LOG.md`

Create this file at the root of the project:

```
/Users/diky/Documents/landing-page-try/LOG.md
```

### Initial Content:

```markdown
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

| Phase | Task                    | Status         | Session |
| ----- | ----------------------- | -------------- | ------- |
| 0.1   | Initialize Vite         | ⬜ Not started | —       |
| 0.2   | Install dependencies    | ⬜ Not started | —       |
| 0.3   | Add Google Fonts        | ⬜ Not started | —       |
| 0.4   | Set up file structure   | ⬜ Not started | —       |
| 1.1   | CSS Design System       | ⬜ Not started | —       |
| 1.2   | HTML Structure          | ⬜ Not started | —       |
| 2.1   | Style Navigation        | ⬜ Not started | —       |
| 2.2   | Style Hero              | ⬜ Not started | —       |
| 2.3   | Style Timeline          | ⬜ Not started | —       |
| 2.4   | Style Skills            | ⬜ Not started | —       |
| 2.5   | Style Education         | ⬜ Not started | —       |
| 2.6   | Style Contact Footer    | ⬜ Not started | —       |
| 2.7   | Style Social Sidebar    | ⬜ Not started | —       |
| 3.1   | Lenis Smooth Scroll     | ⬜ Not started | —       |
| 3.2   | Hero Animations         | ⬜ Not started | —       |
| 3.3   | Navigation Behavior     | ⬜ Not started | —       |
| 3.4   | Timeline Scroll Reveals | ⬜ Not started | —       |
| 3.5   | Skill Tag Effects       | ⬜ Not started | —       |
| 4.1   | Test Desktop            | ⬜ Not started | —       |
| 4.2   | Test Mobile             | ⬜ Not started | —       |
| 4.3   | Fix Issues              | ⬜ Not started | —       |
| 4.4   | Performance Audit       | ⬜ Not started | —       |

---

## 📝 Session History

<!-- AI: Append a new session entry below after every work session -->
<!-- Format:
### Session N — YYYY-MM-DD HH:MM
**Tasks Completed:** [list]
**Changes Made:** [files changed and what was done]
**Issues Found:** [any bugs or problems encountered]
**Next Steps:** [what the next session should work on]
-->
```

---

## Instructions for Every AI Session

**Add the following instruction to the beginning of every new AI conversation:**

```
IMPORTANT — BEFORE DOING ANYTHING:
1. Read the file `LOG.md` at the project root.
2. Check the "Master Task Status" table to see which tasks are completed (✅) and which are next (⬜).
3. Continue from where the last session left off (see "Session History" for context).
4. AFTER completing your work, append a new "Session N" entry to the LOG.md file with:
   - Tasks completed
   - Files changed
   - Issues found
   - Recommended next steps
5. Update the "Master Task Status" table: change ⬜ to ✅ for completed tasks, or 🔄 for in-progress.
```

### Why This Works

1. **Continuity** — Each AI session knows exactly where the previous one stopped
2. **No duplicate work** — The status table prevents re-doing completed tasks
3. **Context** — Session notes provide reasoning and bug history for future sessions
4. **Debugging** — If something breaks, you can trace back which session introduced it
5. **Collaboration** — If you switch between AI tools (e.g., Claude → ChatGPT), the LOG.md bridges them

---

# QUICK START — Copy This to Start Your First AI Session

```
You are building a professional portfolio landing page for Rachma Bunga Safitrie.

📖 READ THESE FILES FIRST (in order):
1. `PORTFOLIO_LANDING_PAGE_GUIDE.md` — Full specification (design, sections, animations)
2. `LOG.md` — Build log (check which tasks are done, continue from there)
3. `data/LinkedIn_Profile.md` — CV data to populate the website

📋 FOLLOW THE STEP-BY-STEP PLAN in Part 2 of the guide.
📝 AFTER YOUR SESSION, update LOG.md with what you did and what's next.

Start from the first incomplete task in the Master Task Status table.
```

---

_Guide created on 2026-04-17. Ready to build! 🚀_
