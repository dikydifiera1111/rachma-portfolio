/* ============================================
   PARALLAX TRANSITION — layered vertical drift
   as the section scrolls through the viewport.
   No Lenis: we keep native scroll so the site's
   other pinned/scrubbed triggers stay predictable.
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initParallax() {
  const trigger = document.querySelector("[data-parallax-layers]");
  if (!trigger) return;

  // Each layer gets a different yPercent, so they drift at different
  // speeds. Layer 1 is the farthest back and moves most; layer 4 is
  // the closest foreground and barely moves.
  const layers = [
    { sel: '[data-parallax-layer="1"]', yPercent: 70 },
    { sel: '[data-parallax-layer="2"]', yPercent: 55 },
    { sel: '[data-parallax-layer="3"]', yPercent: 40 },
    { sel: '[data-parallax-layer="4"]', yPercent: 10 },
  ];

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "bottom top",
      scrub: 0,
    },
  });

  layers.forEach((l, i) => {
    const el = trigger.querySelector(l.sel);
    if (!el) return;
    tl.to(el, { yPercent: l.yPercent, ease: "none" }, i === 0 ? undefined : "<");
  });
}
