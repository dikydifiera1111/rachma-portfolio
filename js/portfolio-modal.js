/* ============================================
   PORTFOLIO HOVER MODAL — cursor-following preview
   Vanilla port of services-with-animated-hover-modal (React/motion → GSAP).
   Hovering a gallery card scales in a floating image preview + a "View"
   cursor disc, both tracking the pointer. The image stack slides vertically
   to show the hovered project's cover. Mounted on <body> to escape the
   pinned card's transform context (keeps fixed positioning accurate).
   ============================================ */

import gsap from "gsap";

// Same cover shots used by the gallery (Vite-fingerprinted URLs).
import dribble1 from "../data/work/dribble-1.png?url";
import dribble2 from "../data/work/dribble-2.png?url";
import dribble3 from "../data/work/dribble-3.png?url";
import dribble4 from "../data/work/dribble-4.png?url";
import dribble5 from "../data/work/dribble-5.png?url";

// Order MUST match the SLIDES order in portfolio.js (card index → image).
const COVERS = [dribble5, dribble1, dribble2, dribble3, dribble4];

export function initPortfolioModal() {
  const track = document.getElementById("portfolio-carousel-track");
  if (!track) return;

  // Respect reduced-motion: no floating modal at all.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // --- Build modal DOM on <body> ---
  const modal = document.createElement("div");
  modal.className = "pf-modal";
  modal.setAttribute("aria-hidden", "true");

  const slider = document.createElement("div");
  slider.className = "pf-modal-slider";
  COVERS.forEach((src) => {
    const frame = document.createElement("div");
    frame.className = "pf-modal-frame";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    frame.appendChild(img);
    slider.appendChild(frame);
  });
  modal.appendChild(slider);

  document.body.appendChild(modal);

  // Center on the pointer (GSAP-managed so scale tweens preserve it).
  gsap.set(modal, { xPercent: -50, yPercent: -50, scale: 0 });

  // --- Smooth cursor-follow (gsap.quickTo) ---
  const xModal = gsap.quickTo(modal, "left", { duration: 0.8, ease: "power3" });
  const yModal = gsap.quickTo(modal, "top", { duration: 0.8, ease: "power3" });

  const onMouseMove = (e) => {
    xModal(e.clientX);
    yModal(e.clientY);
  };
  window.addEventListener("mousemove", onMouseMove);

  // --- Show/hide on card hover (event delegation) ---
  let active = false;

  const setActive = (state) => {
    if (state === active) return;
    active = state;
    const scale = state ? 1 : 0;
    gsap.to(modal, {
      scale,
      duration: 0.4,
      ease: state ? "power3.out" : "power3.in",
    });
  };

  const cardIndex = (card) =>
    Array.prototype.indexOf.call(track.querySelectorAll(".carousel-card"), card);

  track.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".carousel-card");
    if (!card || !track.contains(card)) return;
    const idx = cardIndex(card);
    if (idx < 0) return;
    slider.style.top = `${idx * -100}%`;
    setActive(true);
  });

  track.addEventListener("mouseout", (e) => {
    // Only hide when the pointer truly leaves a card (not moving within it).
    const card = e.target.closest(".carousel-card");
    if (!card) return;
    const to = e.relatedTarget;
    if (to && card.contains(to)) return; // moved to a child — stay
    if (to && to.closest && to.closest(".carousel-card")) return; // card→card
    setActive(false);
  });

  // Cleanup (defensive — SPA-safe).
  window.addEventListener("beforeunload", () => {
    window.removeEventListener("mousemove", onMouseMove);
    modal.remove();
  });
}
