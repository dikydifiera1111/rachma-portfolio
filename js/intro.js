import gsap from "gsap";

export function initIntro() {
  const overlay = document.getElementById("intro-overlay");
  if (!overlay) return;

  // Prevent scroll during intro
  document.body.style.overflow = "hidden";

  // Let the generating spinner play for a few seconds...
  setTimeout(() => {
    // Fade out
    gsap.to(overlay, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        overlay.style.display = "none";
      }
    });

    // Re-enable scrolling
    document.body.style.overflow = "auto";
  }, 2500); // 2.5 seconds loading time
}
