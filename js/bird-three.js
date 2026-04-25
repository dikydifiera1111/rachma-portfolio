import "@splinetool/viewer";

const CONFIG = {
  // Starting position (scroll = 0): small, top-right
  // translateX/Y are in vw/vh units relative to the element's center
  START_X:     35,    // vw from center → positive = right
  START_Y:    -30,    // vh from center → negative = up
  START_SCALE: 0.18,

  // Ending position (scroll = heroHeight): larger, bottom-left
  END_X:      -38,    // vw from center → negative = left
  END_Y:       32,    // vh from center → positive = down
  END_SCALE:   0.65,

  // Fade-out starts at this scroll progress (0–1)
  FADE_START:  0.80,

  // Lerp smoothing per frame (0 = frozen, 1 = instant snap)
  LERP_FACTOR: 0.08,
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function initBird() {
  // Create the spline-viewer web component
  const viewer = document.createElement("spline-viewer");
  viewer.setAttribute("url", "https://prod.spline.design/dUPmVvR1pgPdtnM9/scene.splinecode");
  viewer.setAttribute("loading-anim-type", "none");

  // Fixed overlay, pointer-events none so it never blocks page interaction
  Object.assign(viewer.style, {
    position:      "fixed",
    top:           "0",
    left:          "0",
    width:         "100vw",
    height:        "100vh",
    zIndex:        "2",
    pointerEvents: "none",
    background:    "transparent",
    transformOrigin: "center center",
  });

  document.body.appendChild(viewer);

  // --- Scroll state ---
  let heroHeight = getHeroHeight();
  let scrollProgress = 0;

  function onScroll() {
    scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // --- Resize ---
  function onResize() {
    heroHeight = getHeroHeight();
    scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
  }
  window.addEventListener("resize", onResize);

  // --- Lerp state, initialised to start values ---
  let curX     = CONFIG.START_X;
  let curY     = CONFIG.START_Y;
  let curScale = CONFIG.START_SCALE;
  let curOpacity = 1;

  let rafId;

  function animate() {
    const p = scrollProgress;

    const targetX     = lerp(CONFIG.START_X,     CONFIG.END_X,     p);
    const targetY     = lerp(CONFIG.START_Y,      CONFIG.END_Y,     p);
    const targetScale = lerp(CONFIG.START_SCALE,  CONFIG.END_SCALE, p);

    curX     = lerp(curX,     targetX,     CONFIG.LERP_FACTOR);
    curY     = lerp(curY,     targetY,     CONFIG.LERP_FACTOR);
    curScale = lerp(curScale, targetScale, CONFIG.LERP_FACTOR);

    const targetOpacity = p >= CONFIG.FADE_START
      ? 1 - (p - CONFIG.FADE_START) / (1 - CONFIG.FADE_START)
      : 1;
    curOpacity = lerp(curOpacity, targetOpacity, CONFIG.LERP_FACTOR);

    viewer.style.transform = `translate(${curX}vw, ${curY}vh) scale(${curScale})`;
    viewer.style.opacity   = String(Math.max(0, curOpacity));

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
