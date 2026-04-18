/* ============================================
   HEADINGS — Scroll-triggered reveal + laser sweep
   Mirrors the timeline's "laser hits → glow" behavior
   for all section titles.
   ============================================ */

import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initHeadings() {
  const headings = document.querySelectorAll(
    ".section-heading-outline, .section-heading"
  );
  if (!headings.length) return;

  headings.forEach((heading) => {
    ScrollTrigger.create({
      trigger: heading,
      start: "top 85%",
      once: true,
      onEnter: () => {
        heading.classList.add("is-revealed");
        // Brief "laser hit" glow that fades out after the sweep finishes
        // so the heading settles at its revealed (accent-stroked) state
        // without a permanent bloom.
        setTimeout(() => heading.classList.add("is-lit"), 400);
        setTimeout(() => heading.classList.remove("is-lit"), 1600);
      },
    });
  });
}
