/* ============================================
   MAIN ENTRY POINT
   Imports all modules and initializes the app
   ============================================ */

import "./style.css";
import { StringTune, StringMagnetic, StringLazy } from "@fiddle-digital/string-tune";
import { initTheme } from "./js/theme.js";
import { initIntro } from "./js/intro.js";
import { initSmoothScroll } from "./js/smooth-scroll.js";
import { initNavigation } from "./js/navigation.js";
import { initHero } from "./js/hero.js";
import { initTimeline } from "./js/timeline.js";
import { initSkills } from "./js/skills.js";
import { initParticles } from "./js/particles.js";
import { initRobot } from "./js/robot.js";
import { initBoxes } from "./js/boxes.js";
import { initSocial3D } from "./js/social3d.js";
import { initPortfolio } from "./js/portfolio.js";
import { initHeadings } from "./js/headings.js";
import { initParallax } from "./js/parallax.js";
import { initFocusRail } from "./js/focus-rail.js";
import { initFooterCta } from "./js/footer-cta.js";
import { initCursor } from "./js/cursor.js";

// Initialize everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const stringTune = StringTune.getInstance();
  window.StringTuneContext = stringTune;
  stringTune.use(StringLazy);
  stringTune.use(StringMagnetic);
  stringTune.start(0);

  initTheme();
  initIntro();
  initSmoothScroll();
  initNavigation();
  initParticles();
  initHero();
  initTimeline();
  initSkills();
  initRobot();
  initBoxes();
  initSocial3D();
  initPortfolio();
  initHeadings();
  initParallax();
  initFocusRail();
  initFooterCta();
  initCursor();

  console.log("🚀 Portfolio initialized");
});
