/* ============================================
   CUSTOM CURSOR — inverted blend, smooth follow
   ============================================ */

export function initCursor() {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  const size = 40;
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.style.width = `${size}px`;
  cursor.style.height = `${size}px`;
  document.body.appendChild(cursor);
  document.body.classList.add("has-custom-cursor");

  let targetX = -size;
  let targetY = -size;
  let currentX = -size;
  let currentY = -size;
  let visible = false;
  let hovering = false;

  const setVisible = (v) => {
    visible = v;
    cursor.style.opacity = v ? "1" : "0";
  };

  document.addEventListener("mousemove", (e) => {
    if (!visible) setVisible(true);
    targetX = e.clientX;
    targetY = e.clientY;
  });

  document.documentElement.addEventListener("mouseenter", () => setVisible(true));
  document.documentElement.addEventListener("mouseleave", () => setVisible(false));

  const hoverSelector =
    'a, button, [role="button"], input, textarea, select, label, [data-magnetic], .cta-btn, .theme-switch';
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelector)) {
      if (!hovering) {
        hovering = true;
        cursor.classList.add("is-hovering");
      }
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSelector) && !e.relatedTarget?.closest?.(hoverSelector)) {
      hovering = false;
      cursor.classList.remove("is-hovering");
    }
  });

  const animate = () => {
    const scale = hovering ? 1.6 : 1;
    const half = (size * scale) / 2;
    currentX += (targetX - half - currentX) * 0.2;
    currentY += (targetY - half - currentY) * 0.2;
    cursor.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
