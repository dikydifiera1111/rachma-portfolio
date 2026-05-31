/* ============================================
   PORTFOLIO — Cinematic scroll hero
   Vanilla port of cinematic-landing-hero React component.
   Pinned scroll timeline: hero text → card rises full-screen →
   iPhone mockup + badges + counter → CTA pullback → exit.
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Real project shot displayed on the phone screen (Vite-fingerprinted URL).
import cronicleShot from "../data/work/cronicle-1.png?url";

// Gallery cover shots (Vite-fingerprinted).
import dribble1 from "../data/work/dribble-1.png?url";
import dribble2 from "../data/work/dribble-2.png?url";
import dribble3 from "../data/work/dribble-3.png?url";
import dribble4 from "../data/work/dribble-4.png?url";
import dribble5 from "../data/work/dribble-5.png?url";
import dribble6 from "../data/work/dribble-6.png?url";
import dribble7 from "../data/work/dribble-7.png?url";
import dribble8 from "../data/work/dribble-8.png?url";
import dribble9 from "../data/work/dribble-9.png?url";

gsap.registerPlugin(ScrollTrigger);

const METRIC_VALUE = 9; // counter target — featured projects

// Gallery slides — Rachma's featured Dribbble projects.
const SLIDES = [
  {
    title: "Raya Entertainment — Banking Hub",
    type: "Fintech",
    services: ["product design", "ui/ux", "mobile"],
    description:
      "A digital entertainment hub built inside a banking app for Bank Raya (BRI Group) — bundling games, rewards, and lifestyle services into one playful space that gives everyday banking a reason to keep coming back.",
    img: dribble7,
    url: "https://dribbble.com/shots/27422128-Raya-Entertainment-Digital-entertainment-hub-inside-banking-apps",
  },
  {
    title: "Uang Saku — Digital Bank for Kids",
    type: "Fintech",
    services: ["product design", "ui/ux", "mobile"],
    description:
      "Indonesia's first kid-focused digital bank for Bank Raya (BRI Group) — a friendly pocket-money experience where children learn to save, spend, and send money safely while parents stay in control.",
    img: dribble8,
    url: "https://dribbble.com/shots/27422420-Digital-Bank-for-Kids",
  },
  {
    title: "Loyalty Membership — Bank Raya",
    type: "Fintech",
    services: ["product design", "ui/ux", "gamification"],
    description:
      "A loyalty and rewards feature for Bank Raya (BRI Group) — five membership tiers, missions, and vouchers designed to feel like friendship, turning routine banking into milestones worth chasing.",
    img: dribble9,
    url: "https://dribbble.com/shots/27422528-loyalty-page-banking-apps",
  },
  {
    title: "Saku Bareng — Community Saving",
    type: "Fintech",
    services: ["product design", "ui/ux", "data viz"],
    description:
      "A community savings feature for Bank Raya (BRI Group) — shared group pockets with expense breakdowns, member tracking, and transaction reports that make saving together transparent and effortless.",
    img: dribble6,
    url: "https://dribbble.com/shots/27421461-Saku-Bareng-Community-Saving-Bank-Raya",
  },
  {
    title: "Bank Raya — Personal Finance",
    type: "Fintech",
    services: ["product design", "ui/ux", "data viz"],
    description:
      "A personal financial management feature for Bank Raya (BRI Group) — smart transaction categorization that makes tracking spending across travel, shopping, and daily life feel effortless and genuinely different.",
    img: dribble5,
    url: "https://dribbble.com/shots/27419295-Personal-Financial-Management-Bank-Raya-Indonesia",
  },
  {
    title: "Raya — Banking Gamification",
    type: "Fintech",
    services: ["product design", "ui/ux", "gamification"],
    description:
      "A loyalty and gamification feature for a banking app — tier progression from Beginner to Ultimate that turns everyday transactions into rewarding milestones.",
    img: dribble1,
    url: "https://dribbble.com/shots/23776552-Banking-Apps-Gamification-Feature-Design",
  },
  {
    title: "Cronicle — Fashion E-commerce",
    type: "E-commerce",
    services: ["branding", "ui/ux", "product detail"],
    description:
      "An end-to-end fashion shopping experience — clean product discovery, rich detail pages, and a checkout flow designed to feel effortless.",
    img: dribble2,
    url: "https://dribbble.com/shots/22715943-Cronicle-App-UI-UX-Design-Portfolio",
  },
  {
    title: "Maxim — App Redesign",
    type: "Super App",
    services: ["redesign", "ui/ux", "payments"],
    description:
      "A full redesign of the Maxim app — a streamlined service grid and integrated Maxim Pay wallet that simplify on-demand rides, delivery, and more.",
    img: dribble3,
    url: "https://dribbble.com/shots/22715848-Maxim-App-Redesign",
  },
  {
    title: "Wellpad — Health & Lifestyle",
    type: "Wellness",
    services: ["branding", "ui/ux", "dashboard"],
    description:
      "A wellness companion that puts daily health in your hand — a friendly dashboard and habit tracking that make a healthier lifestyle feel approachable.",
    img: dribble4,
    url: "https://dribbble.com/shots/22715683-Wellpad-Health-Lifestyle-App",
  },
];

export function initPortfolio() {
  const container = document.getElementById("cinematic-portfolio");
  if (!container) return;

  // Inject the project shot
  const shot = document.getElementById("portfolio-mockup-shot");
  if (shot) shot.src = cronicleShot;

  const mainCard = container.querySelector(".main-card");
  const mockup = container.querySelector(".mockup-device");

  // Build gallery carousel cards
  buildCarousel();

  // Respect reduced-motion: reveal everything statically, skip the timeline.
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion) {
    container.querySelectorAll(".gsap-reveal").forEach((el) => {
      el.style.visibility = "visible";
    });
    const counterVal = container.querySelector(".counter-val");
    if (counterVal) counterVal.textContent = String(METRIC_VALUE);
    const ring = container.querySelector(".progress-ring");
    if (ring) ring.style.strokeDashoffset = "60";
    const layer = container.querySelector(".carousel-layer");
    if (layer) {
      layer.style.position = "static";
      layer.style.pointerEvents = "auto";
    }
    return;
  }

  // --- 1. Mouse-driven card sheen + mockup tilt (rAF-throttled) ---
  let rafId = 0;
  const onMouseMove = (e) => {
    if (window.scrollY > window.innerHeight * 2) return;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      if (!mainCard || !mockup) return;
      const rect = mainCard.getBoundingClientRect();
      mainCard.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      mainCard.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);

      const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
      const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(mockup, {
        rotationY: xVal * 12,
        rotationX: -yVal * 12,
        ease: "power3.out",
        duration: 1.2,
      });
    });
  };
  window.addEventListener("mousemove", onMouseMove);

  // --- 2. Cinematic scroll timeline ---
  const isMobile = window.innerWidth < 768;

  const ctx = gsap.context(() => {
    // Reveal the elements GSAP controls (CSS hides .gsap-reveal initially).
    gsap.set(".gsap-reveal", { visibility: "visible" });

    gsap.set(".text-track", {
      autoAlpha: 0,
      y: 60,
      scale: 0.85,
      filter: "blur(20px)",
      rotationX: -20,
    });
    gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
    gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
    gsap.set(
      [
        ".card-left-text",
        ".card-right-text",
        ".mockup-scroll-wrapper",
        ".floating-badge",
        ".phone-widget",
      ],
      { autoAlpha: 0 },
    );
    gsap.set(".cta-wrapper", {
      autoAlpha: 0,
      scale: 0.8,
      filter: "blur(30px)",
    });
    gsap.set(".carousel-layer", { autoAlpha: 0 });
    gsap.set(".carousel-track", { y: 0 });
    gsap.set(".carousel-progress-bar", { scaleX: 0 });

    // Intro: hero text reveal
    const introTl = gsap.timeline({ delay: 0.3 });
    introTl
      .to(".text-track", {
        duration: 1.8,
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        rotationX: 0,
        ease: "expo.out",
      })
      .to(
        ".text-days",
        { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" },
        "-=1.0",
      );

    // Pinned scroll timeline
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=3400",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Expose the ScrollTrigger so nav links can jump straight to the
        // moment the gallery grid is fully revealed (see "galleryReveal" label).
        onRefreshInit: (self) => {
          container._portfolioST = self;
        },
      },
    });
    container._portfolioST = scrollTl.scrollTrigger;

    scrollTl
      .to(
        [".hero-text-wrapper", ".bg-grid-theme"],
        {
          scale: 1.15,
          filter: "blur(20px)",
          opacity: 0.2,
          ease: "power2.inOut",
          duration: 2,
        },
        0,
      )
      .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
      .to(".main-card", {
        width: "100%",
        height: "100%",
        borderRadius: "0px",
        ease: "power3.inOut",
        duration: 1.5,
      })
      // Hero text fades once the card has fully risen.
      .set(".hero-text-wrapper", { autoAlpha: 0 })
      // --- GALLERY (now first): reveal carousel, scroll it, dispose ---
      .fromTo(
        ".carousel-layer",
        { autoAlpha: 0, y: 60, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, ease: "expo.out", duration: 1.2 },
        "-=0.3",
      )
      // Playhead here = gallery grid fully revealed (top rows in view).
      // Nav "WORK" jumps to the scroll position of this label.
      .addLabel("galleryReveal")
      .to(
        ".carousel-track",
        { y: () => -getCarouselTravel(), ease: "none", duration: 5 },
        "<+=0.5",
      )
      .to(
        ".carousel-progress-bar",
        { scaleX: 1, ease: "none", duration: 5 },
        "<",
      )
      // Hold at the bottom so the last row (project 5) is actually seen.
      .to({}, { duration: 1.5 })
      .to(".carousel-layer", {
        autoAlpha: 0,
        y: -40,
        scale: 0.95,
        ease: "power3.in",
        duration: 1.2,
      })
      // --- MOCKUP (now second): reveal iPhone + widgets + badges + text ---
      .fromTo(
        ".mockup-scroll-wrapper",
        {
          y: 300,
          z: -500,
          rotationX: 50,
          rotationY: -30,
          autoAlpha: 0,
          scale: 0.6,
        },
        {
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          autoAlpha: 1,
          scale: 1,
          ease: "expo.out",
          duration: 2.5,
        },
        "-=0.3",
      )
      .fromTo(
        ".phone-widget",
        { y: 40, autoAlpha: 0, scale: 0.95 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          stagger: 0.15,
          ease: "back.out(1.2)",
          duration: 1.5,
        },
        "-=1.5",
      )
      .to(
        ".progress-ring",
        { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" },
        "-=1.2",
      )
      .to(
        ".counter-val",
        {
          innerHTML: METRIC_VALUE,
          snap: { innerHTML: 1 },
          duration: 2,
          ease: "expo.out",
        },
        "-=2.0",
      )
      .fromTo(
        ".floating-badge",
        { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          rotationZ: 0,
          ease: "back.out(1.5)",
          duration: 1.5,
          stagger: 0.2,
        },
        "-=2.0",
      )
      .fromTo(
        ".card-left-text",
        { x: -50, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 },
        "-=1.5",
      )
      .fromTo(
        ".card-right-text",
        { x: 50, autoAlpha: 0, scale: 0.8 },
        { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 },
        "<",
      )
      // Hold so the mockup show-off is actually seen before pullback.
      .to({}, { duration: 1.5 })
      // Dispose mockup/badges/text before the CTA pullback.
      .to(
        [
          ".mockup-scroll-wrapper",
          ".floating-badge",
          ".card-left-text",
          ".card-right-text",
        ],
        {
          scale: 0.9,
          y: -40,
          z: -200,
          autoAlpha: 0,
          ease: "power3.in",
          duration: 1,
          stagger: 0.04,
        },
      )
      // --- Pullback to CTA ---
      .set(".cta-wrapper", { autoAlpha: 1 })
      .to(
        ".main-card",
        {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut",
          duration: 1.8,
        },
        "pullback",
      )
      .to(
        ".cta-wrapper",
        { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 },
        "pullback",
      )
      .to(".main-card", {
        y: -window.innerHeight - 300,
        ease: "power3.in",
        duration: 1.5,
      });
  }, container);

  // Cleanup if the section is ever torn down (defensive — SPA-safe).
  window.addEventListener("beforeunload", () => {
    window.removeEventListener("mousemove", onMouseMove);
    cancelAnimationFrame(rafId);
    ctx.revert();
  });

  // --- Build the gallery cards from SLIDES ---
  function buildCarousel() {
    const track = document.getElementById("portfolio-carousel-track");
    if (!track || track.querySelector(".carousel-card")) return;
    SLIDES.forEach((s) => {
      const card = document.createElement("a");
      card.className = "carousel-card";
      card.href = s.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.setAttribute("aria-label", `Open ${s.title} on Dribbble`);
      const services = s.services
        .map(
          (svc) => `<span class="carousel-badge badge-service">${svc}</span>`,
        )
        .join("");
      card.innerHTML = `
        <img class="carousel-card-img" src="${s.img}" alt="${s.title}" loading="lazy" />
        <div class="carousel-card-content">
          <div class="carousel-card-group">
            <p class="carousel-card-label">Type</p>
            <div class="carousel-badges">
              <span class="carousel-badge badge-type">${s.type}</span>
            </div>
          </div>
          <div class="carousel-card-group">
            <p class="carousel-card-label">Services</p>
            <div class="carousel-badges">${services}</div>
          </div>
          <div class="carousel-card-group">
            <h4 class="carousel-card-title">${s.title}</h4>
            <p class="carousel-card-desc">${s.description}</p>
          </div>
        </div>
      `;
      track.appendChild(card);
    });
  }

  // Vertical travel distance = track height beyond the viewport.
  function getCarouselTravel() {
    const track = document.getElementById("portfolio-carousel-track");
    const viewport = container.querySelector(".carousel-viewport");
    if (!track || !viewport) return 0;
    const overflow = track.scrollHeight - viewport.clientHeight;
    return Math.max(overflow, 0);
  }
}
