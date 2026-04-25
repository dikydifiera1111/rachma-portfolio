import * as THREE from "three";
import SplineLoader from "@splinetool/loader";

const CONFIG = {
  START_VIEWPORT_X:  0.38,
  START_VIEWPORT_Y:  0.75,
  START_Z:           800,

  END_VIEWPORT_X:   -0.55,
  END_VIEWPORT_Y:  -0.70,
  END_Z:            323.53,

  FADE_START:        0.80,
  LERP_FACTOR:       0.08,
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function initBird() {
  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    70,
    100000,
  );
  camera.position.set(0, 0, CONFIG.START_Z);
  camera.quaternion.setFromEuler(new THREE.Euler(0, 0, 0));

  // --- Scene ---
  const scene = new THREE.Scene();
  // No scene.background — transparent

  // --- Spline loader ---
  const loader = new SplineLoader();
  loader.load(
    "https://prod.spline.design/dUPmVvR1pgPdtnM9/scene.splinecode",
    (splineScene) => {
      scene.add(splineScene);
    },
  );

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearAlpha(0);

  const canvas = renderer.domElement;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "2";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  // --- Scroll state ---
  let heroHeight = getHeroHeight();
  let scrollProgress = 0;

  window.addEventListener("scroll", () => {
    scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
  }, { passive: true });

  // --- Lerp state (initialised to start values) ---
  let curX = CONFIG.START_VIEWPORT_X;
  let curY = CONFIG.START_VIEWPORT_Y;
  let curZ = CONFIG.START_Z;

  // --- Resize ---
  window.addEventListener("resize", () => {
    heroHeight = getHeroHeight();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Animation loop ---
  renderer.setAnimationLoop(() => {
    const p = scrollProgress;

    const targetX = lerp(CONFIG.START_VIEWPORT_X, CONFIG.END_VIEWPORT_X, p);
    const targetY = lerp(CONFIG.START_VIEWPORT_Y, CONFIG.END_VIEWPORT_Y, p);
    const targetZ = lerp(CONFIG.START_Z,          CONFIG.END_Z,          p);

    curX = lerp(curX, targetX, CONFIG.LERP_FACTOR);
    curY = lerp(curY, targetY, CONFIG.LERP_FACTOR);
    curZ = lerp(curZ, targetZ, CONFIG.LERP_FACTOR);

    // Viewport-fraction → world-unit camera positioning
    const fovRad = camera.fov * (Math.PI / 180);
    const visH = 2 * Math.tan(fovRad / 2) * curZ;
    const visW = visH * camera.aspect;

    camera.position.x = -curX * (visW / 2);
    camera.position.y =  curY * (visH / 2);
    camera.position.z =  curZ;

    // Fade out over last (1 - FADE_START) of scroll range
    if (p >= CONFIG.FADE_START) {
      canvas.style.opacity = String(
        1 - (p - CONFIG.FADE_START) / (1 - CONFIG.FADE_START)
      );
    } else {
      canvas.style.opacity = "1";
    }

    renderer.render(scene, camera);
  });
}

function getHeroHeight() {
  const hero = document.getElementById("hero");
  return hero ? hero.offsetHeight : window.innerHeight;
}
