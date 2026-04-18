/* ============================================
   PORTFOLIO — Scroll-morph hero
   Based on 21st.dev scroll-morph-hero pattern,
   ported to vanilla JS + GSAP ScrollTrigger.
   Choreography locked in data/work/PORTFOLIO_BRIEF.md:
   Lavender (Cronicle) → Teal (Wellpad) → Navy (Raya) → Yellow (Maxim)
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Direct Dribbble shot URLs — mapped per project by Rachma.
const SHOT_URLS = {
  Cronicle:
    "https://dribbble.com/shots/22715943-Cronicle-App-UI-UX-Design-Portfolio",
  Wellpad:
    "https://dribbble.com/shots/22715683-Wellpad-Health-Lifestyle-App",
  Raya:
    "https://dribbble.com/shots/23776552-Banking-Apps-Gamification-Feature-Design",
  Maxim: "https://dribbble.com/shots/22715848-Maxim-App-Redesign",
};

const PROJECTS = [
  {
    name: "Cronicle",
    desc: "Fashion e-commerce · lavender",
    color: "#C8B6E2",
    img: "./data/work/cronicle-1.png",
    url: SHOT_URLS.Cronicle,
  },
  {
    name: "Cronicle",
    desc: "Product detail · Vindy Knit Cardigan",
    color: "#C8B6E2",
    img: "./data/work/cronicle-2.png",
    url: SHOT_URLS.Cronicle,
  },
  {
    name: "Wellpad",
    desc: "Wellness in your hand · teal",
    color: "#2F6A6A",
    img: "./data/work/wellpad-1.png",
    url: SHOT_URLS.Wellpad,
  },
  {
    name: "Wellpad",
    desc: "Home · Hello Lala! dashboard",
    color: "#2F6A6A",
    img: "./data/work/wellpad-2.png",
    url: SHOT_URLS.Wellpad,
  },
  {
    name: "Raya",
    desc: "Loyalty dashboard · navy",
    color: "#0B2A5B",
    img: "./data/work/raya-1.png",
    url: SHOT_URLS.Raya,
  },
  {
    name: "Raya",
    desc: "Tier progression · Beginner → Ultimate",
    color: "#0B2A5B",
    img: "./data/work/raya-2.png",
    url: SHOT_URLS.Raya,
  },
  {
    name: "Maxim",
    desc: "App redesign · yellow",
    color: "#F7D417",
    img: "./data/work/maxim-2.png",
    url: SHOT_URLS.Maxim,
  },
  {
    name: "Maxim",
    desc: "Home · service grid & Maxim Pay",
    color: "#F7D417",
    img: "./data/work/maxim-1.png",
    url: SHOT_URLS.Maxim,
  },
];

const TOTAL = PROJECTS.length;

// --- Helpers ---
const lerp = (a, b, t) => a * (1 - t) + b * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export function initPortfolio() {
  const stage = document.getElementById("portfolio-stage");
  const cardsRoot = document.getElementById("portfolio-cards");
  const captionProject = document.getElementById("portfolio-caption-project");
  const captionDesc = document.getElementById("portfolio-caption-desc");
  if (!stage || !cardsRoot) return;

  // Build cards (anchors so the entire flipped face is clickable)
  const cards = PROJECTS.map((p, i) => {
    const el = document.createElement("a");
    el.className = "portfolio-card";
    el.href = p.url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.setAttribute(
      "aria-label",
      `Open ${p.name} on Dribbble — ${p.desc}`
    );
    el.style.setProperty("--card-color", p.color);
    el.innerHTML = `
      <div class="portfolio-card-inner">
        <div class="portfolio-card-face portfolio-card-front">
          <img src="${p.img}" alt="${p.name} — ${p.desc}" loading="lazy" />
        </div>
        <div class="portfolio-card-face portfolio-card-back">
          <span class="portfolio-card-project">${p.name}</span>
          <span class="portfolio-card-view">VIEW ↗</span>
        </div>
      </div>
    `;
    cardsRoot.appendChild(el);
    return el;
  });

  // State
  let stageRect = stage.getBoundingClientRect();
  const state = {
    width: stageRect.width,
    height: stageRect.height,
    morph: 0, // 0 circle → 1 bottom-arc
    rotate: 0, // 0..1 shuffle progress
    parallax: 0, // -100..100
    activeIndex: 0,
  };

  // Resize
  const ro = new ResizeObserver(() => {
    const r = stage.getBoundingClientRect();
    state.width = r.width;
    state.height = r.height;
    render();
  });
  ro.observe(stage);

  // Mouse parallax
  stage.addEventListener("mousemove", (e) => {
    const r = stage.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    gsap.to(state, {
      parallax: nx * 60,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: render,
    });
  });

  // Intro sequence: scatter → line → circle
  cards.forEach((el, i) => {
    const sx = (Math.random() - 0.5) * 1200;
    const sy = (Math.random() - 0.5) * 800;
    const sr = (Math.random() - 0.5) * 180;
    gsap.set(el, {
      x: sx,
      y: sy,
      rotation: sr,
      scale: 0.6,
      opacity: 0,
    });
  });

  // Line → circle via ScrollTrigger intro (on entering the section)
  ScrollTrigger.create({
    trigger: stage,
    start: "top 80%",
    once: true,
    onEnter: () => {
      // Stage 1: line
      const spacing = 70;
      const lineTotal = TOTAL * spacing;
      cards.forEach((el, i) => {
        gsap.to(el, {
          x: i * spacing - lineTotal / 2,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          delay: 0.05 * i,
          ease: "power3.out",
        });
      });
      // Stage 2: circle
      gsap.delayedCall(1.6, () => {
        state.morph = 0;
        render();
      });
    },
  });

  // Scroll-driven morph + shuffle — pinned while scrolling through
  ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: "+=2400",
    pin: true,
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress; // 0..1 across the pin
      // First 25% = morph into arc
      state.morph = clamp(p / 0.25, 0, 1);
      // Remaining 75% = shuffle rotation
      state.rotate = clamp((p - 0.25) / 0.75, 0, 1);
      render();
      updateCaption();
      updateBackground(p);
    },
  });

  function updateCaption() {
    // Which card is closest to the apex (angle ≈ -90deg)?
    const idx = Math.round(state.rotate * (TOTAL - 1));
    if (idx !== state.activeIndex) {
      state.activeIndex = idx;
      const p = PROJECTS[idx];
      captionProject.textContent = p.name;
      captionDesc.textContent = p.desc;
    }
  }

  function updateBackground(p) {
    // Color arc: Lavender → Teal → Navy → Yellow
    // 4 stops across the pin
    const stops = ["#C8B6E2", "#2F6A6A", "#0B2A5B", "#F7D417"];
    const seg = 1 / (stops.length - 1);
    const i = clamp(Math.floor(p / seg), 0, stops.length - 2);
    const t = (p - i * seg) / seg;
    const c = mixHex(stops[i], stops[i + 1], t);
    stage.style.setProperty("--stage-color", c);
  }

  // Initial caption + bg
  captionProject.textContent = PROJECTS[0].name;
  captionDesc.textContent = PROJECTS[0].desc;
  stage.style.setProperty("--stage-color", PROJECTS[0].color);

  // --- Render loop ---
  function render() {
    const { width, height, morph, rotate, parallax } = state;
    const isMobile = width < 768;
    const minDim = Math.min(width, height);

    // Circle geometry
    const circleR = Math.min(minDim * 0.32, 280);

    // Arc geometry
    const baseR = Math.min(width, height * 1.5);
    const arcR = baseR * (isMobile ? 1.3 : 1.0);
    const apexY = height * (isMobile ? 0.4 : 0.3);
    const arcCY = apexY + arcR;
    const spread = isMobile ? 100 : 130;
    const startA = -90 - spread / 2;
    const step = spread / (TOTAL - 1);

    // Shuffle rotation bounded within spread
    const maxRot = spread * 0.8;
    const boundedRot = -rotate * maxRot;

    cards.forEach((el, i) => {
      // Circle pos
      const cA = (i / TOTAL) * 360;
      const cRad = (cA * Math.PI) / 180;
      const cx = Math.cos(cRad) * circleR;
      const cy = Math.sin(cRad) * circleR;
      const cRot = cA + 90;

      // Arc pos
      const aA = startA + i * step + boundedRot;
      const aRad = (aA * Math.PI) / 180;
      const ax = Math.cos(aRad) * arcR + parallax;
      const ay = Math.sin(aRad) * arcR + arcCY - height / 2;
      const aRot = aA + 90;
      const aScale = isMobile ? 1.25 : 1.55;

      // Interpolate
      const x = lerp(cx, ax, morph);
      const y = lerp(cy, ay, morph);
      const rot = lerp(cRot, aRot, morph);
      const scale = lerp(1, aScale, morph);

      // Highlight the active (apex-closest) card
      const isActive = i === state.activeIndex && morph > 0.8;
      const bonusScale = isActive ? 1.15 : 1;

      gsap.set(el, {
        x,
        y,
        rotation: rot,
        scale: scale * bonusScale,
        zIndex: isActive ? 10 : 1,
      });
    });
  }

  render();
}

// --- Hex color mixer ---
function mixHex(a, b, t) {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const r = Math.round(lerp(pa.r, pb.r, t));
  const g = Math.round(lerp(pa.g, pb.g, t));
  const bl = Math.round(lerp(pa.b, pb.b, t));
  return `rgb(${r}, ${g}, ${bl})`;
}

function parseHex(h) {
  const s = h.replace("#", "");
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}
