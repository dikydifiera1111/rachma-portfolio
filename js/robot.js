/* ============================================
   ROBOT — Spline 3D interactive viewer
   ============================================ */

export function initRobot() {
  const container = document.getElementById("robot-container");
  if (!container) return;

  const SCENE_URL =
    "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

  // Use IntersectionObserver for lazy loading performance (Phase 4.4)
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stop observing once loaded
          observer.unobserve(entry.target);
          loadSplineViewer();
        }
      });
    },
    { rootMargin: "200px 0px" }, // Load slightly before it comes into view
  );

  observer.observe(container);

  function loadSplineViewer() {
    import("@splinetool/viewer").then(() => {
      const viewer = document.createElement("spline-viewer");
      viewer.setAttribute("url", SCENE_URL);
      viewer.classList.add("robot-viewer");

      function removeBranding(shadowRoot) {
        if (!shadowRoot) return;
        // Remove logo element entirely so Spline can't set display on it
        const logo = shadowRoot.querySelector("#logo");
        if (logo) logo.remove();
        // Remove preloader
        const preloader = shadowRoot.querySelector("#preloader");
        if (preloader) preloader.remove();
      }

      if (viewer.shadowRoot) {
        // Keep observing — Spline rebuilds shadow DOM on rerender()
        const domObserver = new MutationObserver(() => {
          removeBranding(viewer.shadowRoot);
        });
        domObserver.observe(viewer.shadowRoot, {
          childList: true,
          subtree: true,
        });

        viewer.addEventListener("load-complete", () => {
          removeBranding(viewer.shadowRoot);
          const loading = document.getElementById("robot-loading");
          if (loading) loading.style.display = "none";
        });
      }

      container.appendChild(viewer);
    });
  }
}
