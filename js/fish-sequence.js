/* ============================================
   FISH SEQUENCE — Scroll-linked image sequence
   Renders 60 sampled frames onto #hero-canvas,
   scrubbing to scroll progress across .hero-scroll-wrapper.
   ============================================ */

// Sample every 4th frame from 1..237 → 60 frames.
// Source PNGs live in assets/fish-frames/ (gitignored, ~142MB).
// Web-optimized WebPs (~2.3MB total) live in public/assets/fish-frames-web/
// (served at /assets/fish-frames-web/ by Vite) with names
// frame-001.webp, frame-005.webp, ..., frame-237.webp.
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
  // Cap DPR at 1 — this canvas is an ambient background scrubbed on scroll.
  // Drawing at native DPR doubles pixel work for a negligible visual gain
  // on a soft-edged WebP sequence, and hurts scroll-scrub smoothness.
  const dpr = 1;
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
