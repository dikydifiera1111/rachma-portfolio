/* ============================================
   HERO CLOUDS — Vanta.js CLOUDS background
   Soft drifting clouds on the cover that shift with the pointer.
   Re-inits with a theme-specific palette on `themechange` (see theme.js).

   NOTE on three.js version: Vanta is built against three r134 and breaks
   on r150+. The rest of this project uses three@0.184 (social3d.js), so
   Vanta gets its own pinned copy via the npm alias `three-vanta@npm:three@0.134`.
   THREE is passed into the options object explicitly — Vanta's default
   `window.THREE` global does not exist in a Vite/ESM build.
   ============================================ */

import * as THREE from "three-vanta";
import CLOUDS_MODULE from "vanta/dist/vanta.clouds.min.js";

// Vanta ships a UMD bundle (module.exports = fn). Vite's CJS interop nests
// the function under `.default`, so unwrap it before calling.
const CLOUDS = CLOUDS_MODULE.default || CLOUDS_MODULE;

// Per-theme cloud palettes (from the Vanta builder).
const PALETTES = {
  light: {
    backgroundColor: 0xfcf6f6,
    skyColor: 0xbbc3cd,
    cloudColor: 0xa09ceb,
    cloudShadowColor: 0x112f50,
    sunColor: 0x1459ff,
    sunGlareColor: 0xdca86e,
    sunlightColor: 0xf79533,
  },
  dark: {
    backgroundColor: 0xfcf6f6,
    skyColor: 0x161631,
    cloudColor: 0xa09ceb,
    cloudShadowColor: 0x112f50,
    sunColor: 0x142fff,
    sunGlareColor: 0x420ea2,
    sunlightColor: 0xaa416c,
  },
};

function currentTheme() {
  // theme.js sets data-theme="light"; dark is the default (no attribute).
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export function initHeroClouds() {
  const el = document.getElementById("hero");
  if (!el) return;

  let vantaEffect = null;

  const build = (theme) => {
    if (vantaEffect) {
      vantaEffect.destroy();
      vantaEffect = null;
    }
    vantaEffect = CLOUDS({
      el,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      speed: 1.2,
      ...PALETTES[theme],
    });
  };

  build(currentTheme());

  // Rebuild with the matching palette whenever the theme toggles.
  const onThemeChange = (e) => {
    const theme = e?.detail?.theme === "light" ? "light" : "dark";
    build(theme);
  };
  window.addEventListener("themechange", onThemeChange);

  // HMR cleanup — prevents stacked canvases / leaked WebGL contexts in dev.
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener("themechange", onThemeChange);
      if (vantaEffect) vantaEffect.destroy();
    });
  }
}
