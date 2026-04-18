import * as THREE from "three";
import gsap from "gsap";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import linkedInObjUrl from "../data/3d/linkedIn_logo.obj?url";

export function initSocial3D() {
  const container = document.getElementById("social-3d-canvas-container");
  const prevBtn = document.getElementById("social-btn-prev");
  const nextBtn = document.getElementById("social-btn-next");
  const labelsTrack = document.getElementById("social-3d-labels");

  if (!container || !prevBtn || !nextBtn || !labelsTrack) return;

  const links = labelsTrack.querySelectorAll(".igloo-link");
  let currentIndex = 1; // Start at "Dribbble"
  const maxIndex = links.length - 1;

  // Setup Three.js
  const scene = new THREE.Scene();
  // Soft atmospheric fog matching brand
  scene.fog = new THREE.FogExp2(0x070b13, 0.04);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.z = 15;
  camera.position.y = 1;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const particleCount = 6000;

  // Create geometry with position arrays
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  const targets = {
    pinterestShape: new Float32Array(particleCount * 3),
    dribbbleShape: new Float32Array(particleCount * 3),
    box: new Float32Array(particleCount * 3),
  };

  // Target 0: Pinterest "P" logomark — filled circle silhouette with a
  // denser, cleanly carved "P" glyph on the front face (+Z). Reads as the
  // Pinterest brand mark when viewed head-on.
  const pinRadius = 3.5;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const rType = Math.random();
    let x, y, z;

    if (rType < 0.35) {
      // Outer shell (the circular badge)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      x = pinRadius * Math.sin(phi) * Math.cos(theta);
      y = pinRadius * Math.cos(phi);
      z = pinRadius * Math.sin(phi) * Math.sin(theta);
    } else {
      // Front-face "P" glyph — sits on +Z plane so users see it head-on.
      // Glyph metrics (roughly centered at 0,0):
      //   stem:  vertical bar on the left
      //   bowl:  circle on the upper-right
      const glyphType = Math.random();
      const glyphZ = pinRadius * 0.95; // pulled to the front face

      if (glyphType < 0.4) {
        // Vertical stem: x in [-1.1, -0.4], y in [-2.2, 1.6]
        x = -1.1 + Math.random() * 0.7;
        y = -2.2 + Math.random() * 3.8;
      } else {
        // Bowl of the P: ring centered at (0.2, 0.6) with r ~ 1.3, thickness 0.35
        const a = Math.random() * Math.PI * 2;
        const ringR = 1.15 + Math.random() * 0.35;
        x = 0.2 + Math.cos(a) * ringR;
        y = 0.6 + Math.sin(a) * ringR;
      }
      z = glyphZ + (Math.random() - 0.5) * 0.25;
    }

    const noise = (Math.random() - 0.5) * 0.18;
    targets.pinterestShape[i3 + 0] = x + noise;
    targets.pinterestShape[i3 + 1] = y + noise;
    targets.pinterestShape[i3 + 2] = z + noise;
  }

  // Target 1: Dribbble Shape (Basketball Sphere)
  const dribbbleRadius = 3.5;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const rType = Math.random();
    let x, y, z;
    const noiseAmt = 0.2;

    if (rType < 0.45) {
      // Background shell: 45% of particles
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      x = dribbbleRadius * Math.sin(phi) * Math.cos(theta);
      y = dribbbleRadius * Math.cos(phi);
      z = dribbbleRadius * Math.sin(phi) * Math.sin(theta);
    } else {
      // Lines of the basketball: 55% of particles
      const angle = Math.random() * Math.PI * 2;
      let lineType = Math.random();

      if (lineType < 0.3) {
        // Vertical arc
        x = dribbbleRadius * 0.45;
        y = dribbbleRadius * Math.cos(angle) * 0.89; // sin(acos(0.45))
        z = dribbbleRadius * Math.sin(angle) * 0.89;
      } else if (lineType < 0.6) {
        // Horizontal arc
        x = dribbbleRadius * Math.cos(angle) * 0.89;
        y = dribbbleRadius * 0.45;
        z = dribbbleRadius * Math.sin(angle) * 0.89;
      } else {
        // Diagonal outline wrapping around
        x = dribbbleRadius * Math.cos(angle);
        y = dribbbleRadius * Math.sin(angle);
        z = 0;

        // Tilt heavily
        const tiltX = 0.8;
        const tempZ = z * Math.cos(tiltX) - y * Math.sin(tiltX);
        y = z * Math.sin(tiltX) + y * Math.cos(tiltX);
        z = tempZ;
      }

      // Rotate entire line structure slightly
      const rotZ = 0.35;
      const tempX = x * Math.cos(rotZ) - y * Math.sin(rotZ);
      y = x * Math.sin(rotZ) + y * Math.cos(rotZ);
      x = tempX;
    }

    // Add general noise to give particle volume
    const noise = (Math.random() - 0.5) * noiseAmt;

    targets.dribbbleShape[i3 + 0] = x + noise;
    targets.dribbbleShape[i3 + 1] = y + noise;
    targets.dribbbleShape[i3 + 2] = z + noise;
  }

  // Target 2: Box (Linked In) -> Now 3D OBJ LinkedIn Logo
  const loader = new OBJLoader();
  loader.load(linkedInObjUrl, (obj) => {
    const vertices = [];

    // Extract vertices from all meshes in the OBJ
    obj.traverse((child) => {
      if (child.isMesh && child.geometry.attributes.position) {
        const positions = child.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          vertices.push(
            new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]),
          );
        }
      }
    });

    if (vertices.length > 0) {
      // Calculate Bounding Box to center and scale uniformly
      const box = new THREE.Box3().setFromPoints(vertices);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5.0 / maxDim; // Scale slightly lower to fit vertical bounds

      // Populate targets.box with points from the OBJ
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Randomly pick a point from the loaded vertices
        const v = vertices[Math.floor(Math.random() * vertices.length)];

        // Apply slight noise for volume and visual texture
        const noise = (Math.random() - 0.5) * 0.15;

        // Inverting X so it faces the correct orientation instead of mirrored
        targets.box[i3 + 0] = -(v.x - center.x) * scale + noise;
        targets.box[i3 + 1] = (v.y - center.y) * scale + noise;
        targets.box[i3 + 2] = (v.z - center.z) * scale + noise;
      }
    }
  });

  // Set initial to Dribbble shape (index 1)
  for (let i = 0; i < positions.length; i++) {
    positions[i] = targets.dribbbleShape[i];
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xc8addf, // Base color similar to var(--accent-secondary)
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);

  // Add a pivot container for rotating without disrupting the breathing float
  const pivot = new THREE.Group();
  pivot.add(particles);
  scene.add(pivot);

  const shapeKeys = ["pinterestShape", "dribbbleShape", "box"];

  // --- Physics & Interaction State ---
  const basePositions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    basePositions[i] = targets.dribbbleShape[i];
  }

  // Raycaster for mouse interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9999, -9999);
  const mouse3D = new THREE.Vector3();
  const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  container.addEventListener("mousemove", (event) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  });

  container.addEventListener("mouseleave", () => {
    mouse.set(-9999, -9999);
  });

  function transitionTo(index) {
    const targetKey = shapeKeys[index];
    const targetPositions = targets[targetKey];

    const dummy = { t: 0 };
    const startPositions = new Float32Array(basePositions);

    gsap.to(dummy, {
      t: 1,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        for (let i = 0; i < basePositions.length; i++) {
          const target = targetPositions[i];
          const start = startPositions[i];
          basePositions[i] = start + (target - start) * dummy.t;
        }
      },
    });

    // Spin exactly 1 full rotation and lock back explicitly face-forward
    const currentRotation = pivot.rotation.y % (Math.PI * 2);
    pivot.rotation.y = currentRotation; // normalize
    gsap.to(pivot.rotation, {
      y: currentRotation + Math.PI * 2,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }

  function updateUI(oldIndex, newIndex) {
    if (links[oldIndex]) links[oldIndex].classList.remove("active");
    const activeLink = links[newIndex];
    if (activeLink) activeLink.classList.add("active");

    // Position handled by CSS grid (stacked and centered perfectly)

    const corners = document.querySelector(".igloo-corners");
    if (corners && activeLink) {
      activeLink.insertBefore(corners, activeLink.firstChild);
    }
  }

  // Label click: if inactive, switch shape (no navigation);
  // if already active, allow the native link to navigate in a new tab.
  links.forEach((link, idx) => {
    link.addEventListener("click", (e) => {
      if (idx !== currentIndex) {
        e.preventDefault();
        const prev = currentIndex;
        currentIndex = idx;
        updateUI(prev, currentIndex);
        transitionTo(currentIndex);
      }
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      const prev = currentIndex;
      currentIndex--;
      updateUI(prev, currentIndex);
      transitionTo(currentIndex);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      const prev = currentIndex;
      currentIndex++;
      updateUI(prev, currentIndex);
      transitionTo(currentIndex);
    }
  });

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;
    // Breathing rotation (small swing instead of spinning endlessly)
    particles.rotation.y = Math.sin(time) * 0.2;
    particles.position.y = Math.sin(time * 1.5) * 0.4;
    particles.updateMatrixWorld();

    raycaster.setFromCamera(mouse, camera);
    const hasIntersection = raycaster.ray.intersectPlane(planeZ0, mouse3D);

    let isHovering = false;
    const localMouse = new THREE.Vector3();
    if (hasIntersection && mouse.x !== -9999) {
      localMouse.copy(mouse3D);
      particles.worldToLocal(localMouse);
      isHovering = true;
    }

    const currentPositions = geometry.attributes.position.array;
    const spring = 0.06;
    const friction = 0.88;
    const dodgeRadius = 2.2;
    const dodgeForce = 0.35;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      const px = currentPositions[i3 + 0];
      const py = currentPositions[i3 + 1];
      const pz = currentPositions[i3 + 2];

      const bx = basePositions[i3 + 0];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];

      let ax = (bx - px) * spring;
      let ay = (by - py) * spring;
      let az = (bz - pz) * spring;

      if (isHovering) {
        const dx = px - localMouse.x;
        const dy = py - localMouse.y;
        const dz = pz - localMouse.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;

        if (dist < dodgeRadius) {
          const force = (dodgeRadius - dist) / dodgeRadius;
          ax += (dx / dist) * force * dodgeForce;
          ay += (dy / dist) * force * dodgeForce;
          az += (dz / dist) * force * dodgeForce;
        }
      }

      velocities[i3 + 0] = (velocities[i3 + 0] + ax) * friction;
      velocities[i3 + 1] = (velocities[i3 + 1] + ay) * friction;
      velocities[i3 + 2] = (velocities[i3 + 2] + az) * friction;

      currentPositions[i3 + 0] += velocities[i3 + 0];
      currentPositions[i3 + 1] += velocities[i3 + 1];
      currentPositions[i3 + 2] += velocities[i3 + 2];
    }

    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Apply initial shift
  setTimeout(() => updateUI(1, 1), 50);
}
