/* ============================================
   TIMELINE — Scroll-triggered reveals
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initTimeline() {
  const entries = document.querySelectorAll(".timeline-entry");
  if (!entries.length) return;

  entries.forEach((entry, i) => {
    gsap.from(entry, {
      scrollTrigger: {
        trigger: entry,
        start: "top 85%",
        end: "bottom 20%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      delay: i * 0.1,
      ease: "power3.out",
    });

    // Light up the row when the laser line's tip reaches this entry's dot.
    // The laser scrubs between "top 80%" and "bottom 20%" of .timeline, so
    // each entry's dot aligns to the tip around when the entry crosses ~60%
    // of the viewport. `toggleClass` on the entry handles both enter+leave-back
    // so scrolling up dims the row again.
    ScrollTrigger.create({
      trigger: entry,
      start: "top 60%",
      end: "bottom 40%",
      toggleClass: { targets: entry, className: "is-lit" },
    });
  });

  // Animate the timeline line growth
  const timelineLine = document.querySelector(".timeline-line");
  if (timelineLine) {
    gsap.from(timelineLine, {
      scrollTrigger: {
        trigger: ".timeline",
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
      scaleY: 0,
      transformOrigin: "top center",
    });
  }
}
