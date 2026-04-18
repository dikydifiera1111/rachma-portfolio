/* ============================================
   FOOTER CTA — scroll reveal + magnetic buttons
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initFooterCta() {
  const section = document.querySelector(".cta-footer");
  if (!section) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top 75%",
    once: true,
    onEnter: () => section.classList.add("is-visible"),
  });

  const buttons = section.querySelectorAll("[data-magnetic]");
  buttons.forEach((btn) => {
    const inner = btn.querySelector(".cta-btn__inner");
    const strength = 0.25;

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: "power2.out",
      });
      if (inner) {
        gsap.to(inner, {
          x: x * strength * 0.4,
          y: y * strength * 0.4,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
      if (inner) {
        gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
      }
    });
  });
}
