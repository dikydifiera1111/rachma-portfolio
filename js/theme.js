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

  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") === "light"
        ? THEMES.LIGHT
        : THEMES.DARK;
    const next = current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    applyTheme(next);
    storeTheme(next);
  });
}
