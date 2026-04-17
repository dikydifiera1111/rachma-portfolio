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
