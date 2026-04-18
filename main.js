/* ============================================
   MAIN ENTRY POINT
   Imports all modules and initializes the app
   ============================================ */

import "./style.css";
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

// Initialize everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
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

  console.log("🚀 Portfolio initialized");
});
