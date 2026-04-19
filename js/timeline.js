/* ============================================
   TIMELINE — Scroll-triggered reveals
   ============================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initTimeline() {
  const entries = document.querySelectorAll(".timeline-entry");
  if (!entries.length) return;

  entries.forEach((entry, i) => {
    gsap.from(entry, {
      scrollTrigger: {
        trigger: entry,
        start: "top 85%",
        end: "bottom 20%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      delay: i * 0.1,
      ease: "power3.out",
    });

    // Light up the row when the laser line's tip reaches this entry's dot.
    // The laser scrubs between "top 80%" and "bottom 20%" of .timeline, so
    // each entry's dot aligns to the tip around when the entry crosses ~60%
    // of the viewport. `toggleClass` on the entry handles both enter+leave-back
    // so scrolling up dims the row again.
    ScrollTrigger.create({
      trigger: entry,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => {
        entry.classList.add("is-lit");
        createFirework(entry.querySelector(".timeline-dot"));
      },
      onLeaveBack: () => {
        entry.classList.remove("is-lit");
      },
    });
  });

  // Animate the timeline line growth
  const timelineLine = document.querySelector(".timeline-line");
  if (timelineLine) {
    gsap.from(timelineLine, {
      scrollTrigger: {
        trigger: ".timeline",
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
      scaleY: 0,
      transformOrigin: "top center",
    });
  }
}

function createFirework(dot) {
  if (!dot) return;
  const numParticles = 12;
  const color = "var(--accent)"; // Purple spark
  
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement("div");
    particle.className = "timeline-spark";
    dot.appendChild(particle);

    // Initial state: centered on the dot perfectly
    gsap.set(particle, {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "4px",
      height: "4px",
      backgroundColor: color,
      borderRadius: "50%",
      xPercent: -50,
      yPercent: -50,
      pointerEvents: "none",
      boxShadow: "0 0 10px var(--accent), 0 0 20px var(--glow)",
      zIndex: -1, // Keep behind the dot
    });

    // Randomize explosion trajectory
    const angle = (Math.PI * 2 * i) / numParticles + (Math.random() - 0.5) * 0.5;
    const distance = 25 + Math.random() * 25; 
    
    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0.5 + Math.random() * 1.5,
      duration: 0.6 + Math.random() * 0.4,
      ease: "power3.out",
      onComplete: () => {
        particle.remove();
      }
    });
  }
}
