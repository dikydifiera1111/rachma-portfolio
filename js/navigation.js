/* ============================================
   NAVIGATION — Sticky nav, smooth scroll links
   ============================================ */

import { getLenis } from "./smooth-scroll.js";

export function initNavigation() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  // Toggle glass effect on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Smooth scroll on nav link click
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      // The portfolio is a pinned scroll timeline — its section top is the hero
      // intro, and the gallery grid only appears partway through the pin. Jump
      // straight to the scroll position where the grid is fully revealed
      // (the "galleryReveal" label set in portfolio.js).
      let targetY = targetEl;
      if (targetId === "#portfolio") {
        const st = targetEl.querySelector(".cinematic-portfolio")?._portfolioST;
        const labelY = st?.labelToScroll?.("galleryReveal");
        if (typeof labelY === "number" && !Number.isNaN(labelY)) {
          targetY = labelY;
        }
      }

      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(targetY);
      } else if (typeof targetY === "number") {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      } else {
        targetY.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}
