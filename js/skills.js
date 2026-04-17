/* ============================================
   SKILLS — Hover effects & interactions
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initSkills() {
  const tags = document.querySelectorAll(".skill-tag");
  if (!tags.length) return;

  // Scroll-triggered staggered reveal
  gsap.from(tags, {
    scrollTrigger: {
      trigger: ".skills-grid",
      start: "top 80%",
      toggleActions: "play none none none",
    },
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.08,
    ease: "power3.out",
  });

  // Hover glow + scale effect
  tags.forEach((tag) => {
    tag.addEventListener("mouseenter", () => {
      gsap.to(tag, {
        scale: 1.08,
        duration: 0.3,
        ease: "power2.out",
      });
    });
    tag.addEventListener("mouseleave", () => {
      gsap.to(tag, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
}
