import "@splinetool/viewer";

const CONFIG = {
  // Starting state (scroll = 0): small box in top-right corner
  START_SIZE:   220,    // px — width & height of the viewer box
  START_RIGHT:   24,    // px from right edge
  START_TOP:     72,    // px from top edge (below nav)

  // Ending state (scroll = heroHeight): large box in bottom-left corner
  END_SIZE:     600,    // px
  END_RIGHT:   null,    // not used at end
  END_LEFT:      24,    // px from left edge
  END_BOTTOM:    40,    // px from bottom of viewport

  // Fade-out starts at this scroll progress (0–1)
  FADE_START:   0.80,

  // Lerp smoothing per frame (0 = frozen, 1 = instant snap)
  LERP_FACTOR:  0.08,
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function initBird() {
  const viewer = document.createElement("spline-viewer");
  viewer.setAttribute("url", "https://prod.spline.design/dUPmVvR1pgPdtnM9/scene.splinecode");
  viewer.setAttribute("loading-anim-type", "none");
  viewer.setAttribute("background", "transparent");

  Object.assign(viewer.style, {
    position:      "fixed",
    zIndex:        "2",
    pointerEvents: "none",
    display:       "block",
    border:        "none",
    outline:       "none",
  });

  document.body.appendChild(viewer);

  // --- Scroll state ---
  let heroHeight = getHeroHeight();
  let scrollProgress = 0;

  function onScroll() {
    scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  function onResize() {
    heroHeight = getHeroHeight();
    scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
  }
  window.addEventListener("resize", onResize);

  // --- Lerp state ---
  let curSize    = CONFIG.START_SIZE;
  let curOpacity = 1;

  let rafId;

  function applyStyles(size, progress) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // At p=0: top-right. At p=1: bottom-left.
    // We lerp the box's pixel position between the two corners.
    const startL = w - CONFIG.START_RIGHT - size;
    const startT = CONFIG.START_TOP;

    const endL = CONFIG.END_LEFT;
    const endT = h - CONFIG.END_BOTTOM - size;

    const left = lerp(startL, endL, progress);
    const top  = lerp(startT, endT, progress);

    viewer.style.width  = `${size}px`;
    viewer.style.height = `${size}px`;
    viewer.style.left   = `${left}px`;
    viewer.style.top    = `${top}px`;
    viewer.style.right  = "";
    viewer.style.bottom = "";
  }

  function animate() {
    const p = scrollProgress;

    const targetSize = lerp(CONFIG.START_SIZE, CONFIG.END_SIZE, p);
    curSize = lerp(curSize, targetSize, CONFIG.LERP_FACTOR);

    const targetOpacity = p >= CONFIG.FADE_START
      ? 1 - (p - CONFIG.FADE_START) / (1 - CONFIG.FADE_START)
      : 1;
    curOpacity = lerp(curOpacity, targetOpacity, CONFIG.LERP_FACTOR);

    applyStyles(curSize, p);
    viewer.style.opacity = String(Math.max(0, curOpacity));

    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      viewer.remove();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    },
  };
}

function getHeroHeight() {
  const hero = document.getElementById("hero");
  return hero ? hero.offsetHeight : window.innerHeight;
}
