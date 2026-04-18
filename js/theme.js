/* ============================================
   THEME — Dark / Light mode toggle
   Default: dark. Persists choice in localStorage.
   ============================================ */

const STORAGE_KEY = "rachma-theme";
const THEMES = { DARK: "dark", LIGHT: "light" };

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore storage failures */
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === THEMES.LIGHT) {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
  // Update meta theme-color for mobile browser chrome
  updateMetaThemeColor(theme);
  // Notify canvas/three.js modules that they should re-read theme colors
  window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
}

function updateMetaThemeColor(theme) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = theme === THEMES.LIGHT ? "#fafafa" : "#050405";
}

export function initTheme() {
  // Resolve initial theme: stored > default(dark).
  // We intentionally do NOT auto-follow system preference —
  // site default is dark, per product decision.
  const initial = getStoredTheme() === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  applyTheme(initial);

  const input = document.getElementById("theme-toggle");
  if (!input) return;

  // Sky-toggle convention: checked = night (dark), unchecked = day (light).
  input.checked = initial === THEMES.DARK;

  input.addEventListener("change", (event) => {
    const next = input.checked ? THEMES.DARK : THEMES.LIGHT;
    runThemeTransition(event, next);
    storeTheme(next);
  });
}

/**
 * Circular reveal from the toggle position using the View Transitions API.
 * Falls back to a plain apply on unsupported browsers (Firefox / older Safari).
 */
function runThemeTransition(event, next) {
  const canAnimate =
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canAnimate) {
    applyTheme(next);
    return;
  }

  // Anchor the reveal on the toggle's center. Fall back to viewport center.
  const toggle = document.querySelector(".theme-switch") ||
    document.getElementById("theme-toggle");
  let originX = window.innerWidth - 64;
  let originY = 64;
  if (toggle) {
    const rect = toggle.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
  }

  // Radius = farthest viewport corner, so the circle always fully covers.
  const endRadius = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY),
  );

  // Expose origin to CSS for the @keyframes circle-in animation.
  document.documentElement.style.setProperty("--tt-x", `${originX}px`);
  document.documentElement.style.setProperty("--tt-y", `${originY}px`);
  document.documentElement.style.setProperty("--tt-r", `${endRadius}px`);

  const transition = document.startViewTransition(() => applyTheme(next));

  // Clean the custom props after the animation so they don't persist.
  transition.finished.finally(() => {
    document.documentElement.style.removeProperty("--tt-x");
    document.documentElement.style.removeProperty("--tt-y");
    document.documentElement.style.removeProperty("--tt-r");
  });
}
