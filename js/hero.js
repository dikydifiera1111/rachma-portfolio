/* ============================================
   HERO — Animations & role switcher
   ============================================ */

import gsap from "gsap";

const ROLES = ["DESIGNER", "CREATIVE", "PROBLEM SOLVER"];
let currentRoleIndex = 0;

export function initHero() {
  splitNameLetters();

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-greeting", { opacity: 0, y: 20, duration: 0.8 })
    .from(".hero-name", { opacity: 0, y: 40, duration: 1, delay: 0.1 })
    // We remove the GSAP animation for the wrapper entirely to ensure it doesn't conflict with Magnetic!
    .from(".hero-creative-label", { opacity: 0, x: 20, duration: 0.6 }, "-=0.4")
    .from(".hero-role-switcher", { opacity: 0, x: 20, duration: 0.6 }, "-=0.3")
    .from(".hero-scroll-hint", { opacity: 0, y: 6, duration: 0.6 }, "-=0.1");

  startRoleSwitcher();
  // initPortraitTilt();
  initCursorTwinkles();
}

// Wrap each character of name lines in <span class="letter"> so the
// CSS hover wave can stagger them.
function splitNameLetters() {
  const lines = document.querySelectorAll(".hero-name-line");
  lines.forEach((line) => {
    const text = line.textContent;
    line.textContent = "";
    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "letter";
      span.textContent = ch;
      line.appendChild(span);
    });
  });
}

// Cursor-reactive tilt on the portrait — tracks mouse position inside a
// generous radius around the photo, returns to rest on leave.
function initPortraitTilt() {
  const wrapper = document.querySelector(
    '.hero-photo-wrapper[string="magnetic"]',
  );
  if (!wrapper) return;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReduced) return;

  const maxTilt = 10;
  const section = document.getElementById("hero");
  if (!section) return;

  section.addEventListener("mousemove", (e) => {
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    const clamp = (v) => Math.max(-1.5, Math.min(1.5, v));
    gsap.to(wrapper, {
      rotateY: clamp(dx) * maxTilt,
      rotateX: -clamp(dy) * maxTilt,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  section.addEventListener("mouseleave", () => {
    gsap.to(wrapper, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: "elastic.out(1, 0.6)",
    });
  });
}

// Spawn brief purple twinkles where the cursor moves inside the hero.
function initCursorTwinkles() {
  const layer = document.querySelector(".hero-twinkles");
  const section = document.getElementById("hero");
  if (!layer || !section) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  let lastSpawn = 0;
  const minInterval = 70;

  section.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastSpawn < minInterval) return;
    // 35% chance per eligible move, keeps it sparing and elegant
    if (Math.random() > 0.35) return;
    lastSpawn = now;

    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const jitterX = (Math.random() - 0.5) * 40;
    const jitterY = (Math.random() - 0.5) * 40;

    const t = document.createElement("span");
    t.className = "twinkle";
    t.style.left = `${x + jitterX}px`;
    t.style.top = `${y + jitterY}px`;
    const scale = 0.6 + Math.random() * 1.1;
    t.style.setProperty("transform", `scale(${scale})`);
    layer.appendChild(t);
    setTimeout(() => t.remove(), 1300);
  });
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
