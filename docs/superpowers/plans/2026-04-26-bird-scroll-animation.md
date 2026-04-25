# Bird Scroll Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `js/bird-three.js` as a scroll-driven module that renders the Spline 3D bird transparently over the page — small in the top-right at scroll=0, gliding to bottom-left and growing as the user scrolls through the hero section, then fading out.

**Architecture:** A single exported `initBird()` function owns the Three.js renderer, camera, scroll listener, and animation loop. Scroll progress (0–1) over the hero section drives per-frame lerp targets for camera X/Y/Z. Opacity fades to 0 over the last 20% of the scroll range. All tunable values live in a top-level `CONFIG` object.

**Tech Stack:** Three.js (^0.184.0), `@splinetool/loader` — both already installed. No new dependencies.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `js/bird-three.js` | Rewrite | Spline loader, Three.js renderer, scroll animation, exported `initBird()` |
| `main.js` | Modify | Import and call `initBird()` |

---

### Task 1: Scaffold the module shell with CONFIG and renderer setup

**Files:**
- Modify: `js/bird-three.js` (full rewrite)

- [ ] **Step 1: Replace the entire file with the module shell**

Open `js/bird-three.js` and replace all contents with:

```js
import * as THREE from "three";
import SplineLoader from "@splinetool/loader";

const CONFIG = {
  START_VIEWPORT_X:  0.38,
  START_VIEWPORT_Y:  0.75,
  START_Z:           800,

  END_VIEWPORT_X:   -0.55,
  END_VIEWPORT_Y:  -0.70,
  END_Z:            323.53,

  FADE_START:        0.80,
  LERP_FACTOR:       0.08,
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function initBird() {
  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    70,
    100000,
  );
  camera.position.set(0, 0, CONFIG.START_Z);
  camera.quaternion.setFromEuler(new THREE.Euler(0, 0, 0));

  // --- Scene ---
  const scene = new THREE.Scene();
  // No scene.background — transparent

  // --- Spline loader ---
  const loader = new SplineLoader();
  loader.load(
    "https://prod.spline.design/dUPmVvR1pgPdtnM9/scene.splinecode",
    (splineScene) => {
      scene.add(splineScene);
    },
  );

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearAlpha(0);

  const canvas = renderer.domElement;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "2";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  // --- Scroll state ---
  let heroHeight = getHeroHeight();
  let scrollProgress = 0;

  window.addEventListener("scroll", () => {
    scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
  }, { passive: true });

  // --- Lerp state (initialised to start values) ---
  let curX = CONFIG.START_VIEWPORT_X;
  let curY = CONFIG.START_VIEWPORT_Y;
  let curZ = CONFIG.START_Z;

  // --- Resize ---
  window.addEventListener("resize", () => {
    heroHeight = getHeroHeight();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Animation loop ---
  renderer.setAnimationLoop(() => {
    const p = scrollProgress;

    const targetX = lerp(CONFIG.START_VIEWPORT_X, CONFIG.END_VIEWPORT_X, p);
    const targetY = lerp(CONFIG.START_VIEWPORT_Y, CONFIG.END_VIEWPORT_Y, p);
    const targetZ = lerp(CONFIG.START_Z,          CONFIG.END_Z,          p);

    curX = lerp(curX, targetX, CONFIG.LERP_FACTOR);
    curY = lerp(curY, targetY, CONFIG.LERP_FACTOR);
    curZ = lerp(curZ, targetZ, CONFIG.LERP_FACTOR);

    // Viewport-fraction → world-unit camera positioning
    const fovRad = camera.fov * (Math.PI / 180);
    const visH = 2 * Math.tan(fovRad / 2) * curZ;
    const visW = visH * camera.aspect;

    camera.position.x = -curX * (visW / 2);
    camera.position.y =  curY * (visH / 2);
    camera.position.z =  curZ;

    // Fade out over last (1 - FADE_START) of scroll range
    if (p >= CONFIG.FADE_START) {
      canvas.style.opacity = String(
        1 - (p - CONFIG.FADE_START) / (1 - CONFIG.FADE_START)
      );
    } else {
      canvas.style.opacity = "1";
    }

    renderer.render(scene, camera);
  });
}

function getHeroHeight() {
  const hero = document.getElementById("hero");
  return hero ? hero.offsetHeight : window.innerHeight;
}
```

- [ ] **Step 2: Verify the file saved correctly**

Run:
```bash
head -5 /Users/diky/Documents/landing-page-try/js/bird-three.js
```
Expected output starts with:
```
import * as THREE from "three";
import SplineLoader from "@splinetool/loader";
```

- [ ] **Step 3: Commit**

```bash
cd /Users/diky/Documents/landing-page-try
git add js/bird-three.js
git commit -m "feat: rewrite bird-three.js as scroll-animated transparent module"
```

---

### Task 2: Wire initBird() into main.js

**Files:**
- Modify: `main.js`

- [ ] **Step 1: Add the import at the top of main.js**

In `main.js`, after the last existing import line (currently `import { initCursor } from "./js/cursor.js";`), add:

```js
import { initBird } from "./js/bird-three.js";
```

- [ ] **Step 2: Call initBird() inside the DOMContentLoaded block**

In `main.js`, inside the `DOMContentLoaded` callback, add `initBird();` after `initCursor();`:

```js
  initCursor();
  initBird();
```

- [ ] **Step 3: Verify the dev server starts without errors**

Run:
```bash
cd /Users/diky/Documents/landing-page-try && npm run dev
```
Expected: Vite starts, no import errors in terminal. Open the local URL in a browser — the page should load with no black background from the bird canvas, and the hero content (nav, name, photo) should be visible and clickable.

- [ ] **Step 4: Commit**

```bash
git add main.js
git commit -m "feat: integrate initBird scroll animation into main entry point"
```

---

### Task 3: Manual visual verification

**Files:** none — verification only

- [ ] **Step 1: Open the dev server and verify initial state**

With `npm run dev` running, open the local URL. At scroll=0:
- The bird should appear small in the top-right area of the hero
- The hero text, photo, and nav must all be visible and fully clickable (bird canvas has `pointer-events: none`)
- Page background color (dark `#050405`) should show through — no black canvas rectangle

If the bird is invisible: the Spline scene may take a moment to load over the network — wait ~3s before judging.

If the bird is too large or wrongly positioned: adjust `CONFIG.START_Z` (increase to shrink) and `CONFIG.START_VIEWPORT_X` / `CONFIG.START_VIEWPORT_Y` in `js/bird-three.js`.

- [ ] **Step 2: Verify scroll animation**

Scroll slowly through the hero section:
- Bird should move from top-right toward bottom-left
- Bird should grow (camera getting closer)
- Motion should feel smooth with a slight lag (lerp trailing effect)
- Over the last ~20% of hero height, the bird should fade to invisible

If motion feels too snappy: decrease `CONFIG.LERP_FACTOR` (e.g. `0.05`).
If motion feels too sluggish: increase `CONFIG.LERP_FACTOR` (e.g. `0.12`).

- [ ] **Step 3: Verify on mobile viewport**

In browser DevTools, switch to a mobile viewport (e.g. 390×844). Confirm:
- Bird still starts top-right, ends bottom-left
- No horizontal overflow or canvas clipping

- [ ] **Step 4: Commit any CONFIG tuning changes**

If you adjusted CONFIG values during testing:
```bash
git add js/bird-three.js
git commit -m "tune: adjust bird CONFIG values for correct initial position and feel"
```
If no changes were needed, skip this step.
