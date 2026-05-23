/* ============================================
   PORTFOLIO — Liquid Glass + Kinetic Spotlight
   See spec: docs/superpowers/specs/2026-05-23-portfolio-liquid-glass-design.md
   ============================================ */

import gsap from "gsap";

import cronicle1 from "../data/work/cronicle-1.png?url";
import wellpad1 from "../data/work/wellpad-1.png?url";
import raya1 from "../data/work/raya-1.png?url";
import maxim2 from "../data/work/maxim-2.png?url";

const SHOT_URLS = {
  Cronicle: "https://dribbble.com/shots/22715943-Cronicle-App-UI-UX-Design-Portfolio",
  Wellpad: "https://dribbble.com/shots/22715683-Wellpad-Health-Lifestyle-App",
  Raya: "https://dribbble.com/shots/23776552-Banking-Apps-Gamification-Feature-Design",
  Maxim: "https://dribbble.com/shots/22715848-Maxim-App-Redesign",
};

const PROJECTS = [
  { name: "Cronicle", caption: "Fashion · Lavender",  color: "#C8B6E2", img: cronicle1, url: SHOT_URLS.Cronicle },
  { name: "Wellpad",  caption: "Wellness · Teal",     color: "#2F6A6A", img: wellpad1,  url: SHOT_URLS.Wellpad  },
  { name: "Raya",     caption: "Banking · Navy",      color: "#0B2A5B", img: raya1,     url: SHOT_URLS.Raya     },
  { name: "Maxim",    caption: "Ride-hail · Yellow",  color: "#F7D417", img: maxim2,    url: SHOT_URLS.Maxim    },
];

const TOTAL = PROJECTS.length;
const SPOTLIGHT_INITIAL = 0;

function buildCards(projects, cardsRoot) {
  return projects.map((p, i) => {
    const num = String(i + 1).padStart(2, "0");
    const el = document.createElement("a");
    el.className = "portfolio-card is-entering";
    el.href = p.url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.dataset.index = String(i);
    el.style.setProperty("--card-color", p.color);
    el.setAttribute("aria-label", `${p.name} — ${p.caption}`);
    el.innerHTML = `
      <div class="portfolio-card-media">
        <img src="${p.img}" alt="${p.name} — ${p.caption}" loading="lazy" />
      </div>
      <div class="portfolio-card-content">
        <span class="portfolio-card-num">${num}</span>
        <span class="portfolio-card-spotlight-tag">★ SPOTLIGHT · ${num}</span>
        <h3 class="portfolio-card-name">${p.name}</h3>
        <span class="portfolio-card-caption">${p.caption}</span>
        <span class="portfolio-card-cta">VIEW CASE ↗</span>
      </div>
    `;
    cardsRoot.appendChild(el);
    return el;
  });
}

function buildDots(total, dotsRoot, onSelect) {
  const dots = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");
    dot.className = "portfolio-dot";
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show project ${i + 1}`);
    dot.dataset.index = String(i);
    dot.addEventListener("click", () => onSelect(i));
    dotsRoot.appendChild(dot);
    dots.push(dot);
  }
  return dots;
}

function applySpotlight(cards, dots, stage, activeIndex) {
  cards.forEach((el, i) => {
    el.classList.toggle("is-spotlight", i === activeIndex);
    el.setAttribute("aria-current", i === activeIndex ? "true" : "false");
  });
  dots.forEach((el, i) => {
    el.classList.toggle("is-active", i === activeIndex);
    el.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
  });
  // The stage's background `transition: background 0.7s ease` (set in CSS)
  // handles the visual crossfade — we just need to set the new color.
  stage.style.setProperty("--stage-color", PROJECTS[activeIndex].color);
}

export function initPortfolio() {
  const stage = document.getElementById("portfolio-stage");
  const cardsRoot = document.getElementById("portfolio-cards");
  const dotsRoot = document.getElementById("portfolio-dots");
  if (!stage || !cardsRoot || !dotsRoot) return;

  const cards = buildCards(PROJECTS, cardsRoot);
  gsap.set(cards, { opacity: 0, y: 40, scale: 0.95, filter: "blur(8px)" });

  let activeIndex = SPOTLIGHT_INITIAL;
  const dots = buildDots(TOTAL, dotsRoot, (i) => selectIndex(i, true));

  const ROTATION_MS = 4500;
  const MANUAL_LOCK_MS = 8000;

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover)").matches;

  let rotationTimer = null;
  let manualLockUntil = 0;
  let inViewport = false;
  let hovering = false;

  function shouldAutoRotate() {
    if (prefersReducedMotion) return false;
    if (!inViewport) return false;
    if (hovering) return false;
    if (Date.now() < manualLockUntil) return false;
    return true;
  }

  function scheduleNext() {
    clearTimeout(rotationTimer);
    if (!shouldAutoRotate()) return;
    rotationTimer = setTimeout(() => {
      activeIndex = (activeIndex + 1) % TOTAL;
      applySpotlight(cards, dots, stage, activeIndex);
      scheduleNext();
    }, ROTATION_MS);
  }

  function selectIndex(i, manual) {
    if (i === activeIndex) return;
    activeIndex = i;
    applySpotlight(cards, dots, stage, activeIndex);
    if (manual) {
      manualLockUntil = Date.now() + MANUAL_LOCK_MS;
    }
    scheduleNext();
  }

  const marquee = stage.querySelector(".portfolio-marquee");

  cards.forEach((el, i) => {
    el.addEventListener("click", (e) => {
      if (i !== activeIndex) {
        e.preventDefault();
        selectIndex(i, true);
      }
    });
  });

  if (supportsHover) {
    cards.forEach((el, i) => {
      el.addEventListener("mouseenter", () => {
        hovering = true;
        cards.forEach((c, j) => {
          c.classList.toggle("is-dim", j !== i);
        });
        clearTimeout(rotationTimer);
      });
      el.addEventListener("mouseleave", () => {
        hovering = false;
        cards.forEach((c) => c.classList.remove("is-dim"));
        scheduleNext();
      });
    });
  }

  function runEntryAnimation() {
    cards.forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        delay: 0.3 + i * 0.08,
        ease: "power3.out",
        onStart: () => el.classList.remove("is-entering"),
      });
    });
    if (marquee) {
      setTimeout(() => marquee.classList.add("is-ready"), 200);
    }
    setTimeout(() => {
      applySpotlight(cards, dots, stage, activeIndex);
      scheduleNext();
    }, 900);
  }

  // Trigger entry once when the section is in view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inViewport = entry.isIntersecting;
      if (inViewport && entry.intersectionRatio >= 0.2) {
        runEntryAnimation();
        io.unobserve(stage);
        const presenceIo = new IntersectionObserver((es) => {
          es.forEach((e) => {
            inViewport = e.isIntersecting;
            if (inViewport) scheduleNext();
            else clearTimeout(rotationTimer);
          });
        }, { threshold: 0.1 });
        presenceIo.observe(stage);
      }
    });
  }, { threshold: 0.2 });
  io.observe(stage);
}
