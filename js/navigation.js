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
      if (targetEl) {
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(targetEl);
        } else {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}
