# Bird Scroll Animation — Design Spec
**Date:** 2026-04-26  
**Project:** Rachma Portfolio (landing-page-try)

---

## Overview

Integrate the Spline 3D bird scene as a scroll-driven decorative element on the hero section. At rest (scroll = 0) the bird appears small in the top-right corner. As the user scrolls through the hero, it glides toward the bottom-left and grows larger, then fades out as the About section comes into view.

---

## Architecture

### Approach
Vanilla scroll listener + per-frame lerp inside Three.js's own `setAnimationLoop`. No GSAP coupling. No new dependencies.

### Files Changed
| File | Change |
|------|--------|
| `js/bird-three.js` | Full rewrite — export `initBird()`, remove OrbitControls, add scroll animation |
| `main.js` | Import and call `initBird()` in DOMContentLoaded block |

No HTML or CSS file changes required. The canvas is appended to `document.body` by JS.

---

## Canvas Setup

- Renderer created with `{ antialias: true, alpha: true }`
- `scene.background` removed (no `THREE.Color` set)
- `renderer.setClearAlpha(0)` — fully transparent canvas
- Canvas DOM styles applied in JS:
  ```
  position: fixed
  top: 0; left: 0
  width: 100vw; height: 100vh
  z-index: 2
  pointer-events: none
  ```
- `pointer-events: none` ensures the canvas never blocks clicks or scroll on page content below

---

## Tunable Constants (`CONFIG` block)

All magic numbers live at the top of `bird-three.js` in a single `CONFIG` object. No logic changes needed to tune feel.

```js
const CONFIG = {
  START_VIEWPORT_X:  0.38,   // fraction of half-width, right (+)
  START_VIEWPORT_Y:  0.75,   // fraction of half-height, up (+)
  START_Z:           800,    // camera Z at scroll=0 (farther = smaller)

  END_VIEWPORT_X:   -0.55,   // negative = left
  END_VIEWPORT_Y:  -0.70,    // negative = down
  END_Z:            323.53,  // camera Z at scroll=heroHeight (closer = bigger)

  FADE_START:        0.80,   // scroll progress (0–1) where fade begins
  LERP_FACTOR:       0.08,   // per-frame smoothing (0=frozen, 1=instant)
};
```

---

## Scroll Animation Logic

### Scroll Progress
```
progress = clamp(window.scrollY / heroHeight, 0, 1)
```
`heroHeight` = `document.getElementById('hero').offsetHeight`, captured on load and recalculated on resize.

### Per-Frame Lerp (inside `animate()`)
```
targetX  = lerp(CONFIG.START_VIEWPORT_X, CONFIG.END_VIEWPORT_X, progress)
targetY  = lerp(CONFIG.START_VIEWPORT_Y, CONFIG.END_VIEWPORT_Y, progress)
targetZ  = lerp(CONFIG.START_Z,          CONFIG.END_Z,          progress)

curX = lerp(curX, targetX, CONFIG.LERP_FACTOR)
curY = lerp(curY, targetY, CONFIG.LERP_FACTOR)
curZ = lerp(curZ, targetZ, CONFIG.LERP_FACTOR)
```

### Camera Positioning
Viewport fraction → world units conversion (perspective-correct):
```
visibleHeight = 2 * tan(fov/2 * π/180) * curZ
visibleWidth  = visibleHeight * camera.aspect

camera.position.x = -curX * (visibleWidth  / 2)
camera.position.y =  curY * (visibleHeight / 2)
camera.position.z =  curZ
```
Negative on X: moving camera right shifts the scene left, so negate to keep intuition (positive CONFIG value = bird appears on the right).

### Fade-Out
```
if (progress >= CONFIG.FADE_START) {
  opacity = 1 - (progress - CONFIG.FADE_START) / (1 - CONFIG.FADE_START)
} else {
  opacity = 1
}
canvas.style.opacity = opacity
```

---

## Resize Handling

`onWindowResize` recalculates:
- `heroHeight` from `hero.offsetHeight`
- `camera.aspect` from `window.innerWidth / window.innerHeight`
- `camera.updateProjectionMatrix()`
- `renderer.setSize(window.innerWidth, window.innerHeight)`

The viewport-to-world formula re-runs automatically next frame since it reads live camera values.

---

## Integration into main.js

```js
import { initBird } from './js/bird-three.js';

document.addEventListener("DOMContentLoaded", () => {
  // ... existing inits ...
  initBird();
});
```

---

## What's Removed
- `OrbitControls` import and usage
- `scene.background = new THREE.Color("#000000")`
- `renderer.setClearAlpha(1)` (replaced with `0`)
- `controls.update()` from `animate()`

---

## Out of Scope
- Scroll-jacking or locking scroll position
- Any interaction with the bird (hover, click)
- Animating any section other than hero → about transition
