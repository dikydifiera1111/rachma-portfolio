/* ============================================
   HERO — Animations & role switcher
   ============================================ */

import gsap from "gsap";

const ROLES = ["DESIGNER", "CREATIVE", "PROBLEM SOLVER"];
let currentRoleIndex = 0;

export function initHero() {
  // Animate hero elements on page load
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-greeting", { opacity: 0, y: 20, duration: 0.8 })
    .from(".hero-name", { opacity: 0, y: 40, duration: 1, delay: 0.1 })
    .from(
      ".hero-photo-wrapper",
      { opacity: 0, scale: 0.9, duration: 1 },
      "-=0.5",
    )
    .from(".hero-creative-label", { opacity: 0, x: 20, duration: 0.6 }, "-=0.4")
    .from(".hero-role-switcher", { opacity: 0, x: 20, duration: 0.6 }, "-=0.3");

  // Start role switcher
  startRoleSwitcher();
}

function startRoleSwitcher() {
  const roleText = document.getElementById("role-text");
  if (!roleText) return;

  setInterval(() => {
    currentRoleIndex = (currentRoleIndex + 1) % ROLES.length;
    const nextRole = ROLES[currentRoleIndex];

    // Animate out
    gsap.to(roleText, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      onComplete: () => {
        roleText.textContent = nextRole;
        // Animate in
        gsap.fromTo(
          roleText,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3 },
        );
      },
    });
  }, 3000);
}
