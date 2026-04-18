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

  // Lamp reveal — widens the cones + lights the filament as the skills
  // section comes into view, just before the heading's laser sweep fires.
  const lamp = document.querySelector(".lamp");
  if (lamp) {
    ScrollTrigger.create({
      trigger: lamp,
      start: "top 80%",
      once: true,
      onEnter: () => lamp.classList.add("is-lit"),
    });
  }
}
