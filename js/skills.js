/* ============================================
   SKILLS — Scramble-on-hover tool pills +
   dual-row marquee setup (duration via data-speed).
   Reveals the skills-hero block on scroll.
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function scramble(el) {
  if (el.dataset.scrambling === "1") return;
  const original = el.dataset.tool || el.textContent.trim();
  el.dataset.scrambling = "1";

  let iteration = 0;
  const max = original.length;

  const id = setInterval(() => {
    el.textContent = original
      .split("")
      .map((_, i) =>
        i < iteration
          ? original[i]
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      )
      .join("");

    if (iteration >= max) {
      clearInterval(id);
      el.textContent = original;
      el.dataset.scrambling = "0";
    }
    iteration += 1 / 3;
  }, 30);
}

export function initSkills() {
  // Scramble-on-hover pills
  document.querySelectorAll(".tool-pill").forEach((el) => {
    el.addEventListener("mouseenter", () => scramble(el));
  });

  // Apply per-row duration from data-speed (seconds)
  document.querySelectorAll(".marquee").forEach((m) => {
    const s = parseInt(m.dataset.speed || "32", 10);
    m.style.setProperty("--duration", `${s}s`);
  });

  // Scroll-reveal the whole hero block
  const hero = document.querySelector(".skills-hero");
  if (hero) {
    gsap.from(hero, {
      scrollTrigger: {
        trigger: hero,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: "power3.out",
    });
  }
}
