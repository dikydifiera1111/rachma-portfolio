import { gsap } from "gsap";

const DEMO_ITEMS = [
  {
    id: 1,
    title: "Bachelor's Degree",
    description: "Universitas Padjadjaran",
    meta: "Management of Media Production • 2018 — 2022",
    imageSrc:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop",
    href: "#education-bachelors",
  },
  {
    id: 2,
    title: "Certificate",
    description: "Binar Academy",
    meta: "UI/UX Research and Design • Mar 2022 — Jul 2022",
    imageSrc:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1000&auto=format&fit=crop",
    href: "#education-binar",
  },
  {
    id: 3,
    title: "Interactive Design Workshop",
    description: "Creative Arts Society",
    meta: "Ongoing Learning • 2023",
    imageSrc:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
    href: "#education-workshop",
  },
  {
    id: 5,
    title: "Product Strategy Summit",
    description: "Jakarta Tech Community",
    meta: "Leadership & Growth • 2024",
    imageSrc:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop",
  },
];

function wrap(min, max, v) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

export function initFocusRail() {
  const container = document.getElementById("focus-rail");
  if (!container) return;

  const track = document.getElementById("focus-rail-track");
  const bgImg = document.getElementById("fr-bg-img");
  const metaEl = document.getElementById("fr-meta");
  const titleEl = document.getElementById("fr-title");
  const descEl = document.getElementById("fr-desc");
  const counterEl = document.getElementById("fr-counter");

  const prevBtn = document.getElementById("fr-prev");
  const nextBtn = document.getElementById("fr-next");

  const items = DEMO_ITEMS;
  const count = items.length;
  let activeIndex = 0;

  // Track state
  const visibleProps = [[-2], [-1], [0], [1], [2]]; // Array of positions
  let cards = [];

  // Build DOM
  function buildDOM() {
    track.innerHTML = "";
    cards = [];

    // Pre-create a large pool of cards or just create them dynamically.
    // For simplicity, let's keep track of elements by their absIndex.
  }

  const activeCards = new Map(); // absIndex -> domElement

  function updateVisuals(animate = true, prevActive = null) {
    const wrappedActive = wrap(0, count, activeIndex);
    const activeItem = items[wrappedActive];

    // Background
    if (bgImg.src !== activeItem.imageSrc) {
      bgImg.style.opacity = 0;
      setTimeout(() => {
        bgImg.src = activeItem.imageSrc;
        bgImg.style.opacity = 0.4;
      }, 300);
    }

    // Text info fade
    if (animate && prevActive !== activeIndex) {
      gsap.to([metaEl, titleEl, descEl], {
        opacity: 0,
        y: -10,
        duration: 0.2,
        stagger: 0.02,
        onComplete: () => {
          metaEl.textContent = activeItem.meta || "";
          titleEl.textContent = activeItem.title || "";
          descEl.textContent = activeItem.description || "";
          gsap.fromTo(
            [metaEl, titleEl, descEl],
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 },
          );
        },
      });
    } else if (!animate) {
      metaEl.textContent = activeItem.meta || "";
      titleEl.textContent = activeItem.title || "";
      descEl.textContent = activeItem.description || "";
    }

    // Counter
    counterEl.textContent = `${wrappedActive + 1} / ${count}`;

    // Determine the new valid absIndices
    const visibleOffsets = [-2, -1, 0, 1, 2];
    const newIndices = visibleOffsets.map((off) => activeIndex + off);

    // Remove cards that are no longer visible
    for (const [absIdx, cardEl] of activeCards.entries()) {
      if (!newIndices.includes(absIdx)) {
        // animate out
        gsap.to(cardEl, {
          opacity: 0,
          scale: 0.5,
          duration: 0.4,
          onComplete: () => {
            if (track.contains(cardEl)) track.removeChild(cardEl);
          },
        });
        activeCards.delete(absIdx);
      }
    }

    // Add or update visible cards
    visibleOffsets.forEach((offset) => {
      const absIndex = activeIndex + offset;
      const dataIndex = wrap(0, count, absIndex);
      const item = items[dataIndex];

      const isCenter = offset === 0;
      const dist = Math.abs(offset);

      const xOffset = offset * (window.innerWidth < 768 ? 260 : 320);
      const zOffset = -dist * 180;
      const scale = isCenter ? 1 : 0.85;
      const rotateY = offset * -20;
      const opacity = isCenter ? 1 : Math.max(0.1, 1 - dist * 0.5);
      const blur = isCenter ? 0 : dist * 6;
      const brightness = isCenter ? 1 : 0.5;
      const zIndex = isCenter ? 20 : 10;

      let cardEl = activeCards.get(absIndex);

      if (!cardEl) {
        // Create new card
        cardEl = document.createElement("div");
        cardEl.className = "focus-rail-card";

        const img = document.createElement("img");
        img.src = item.imageSrc;
        img.alt = item.title;

        const lights = document.createElement("div");
        lights.className = "focus-rail-card-lights";

        const shadow = document.createElement("div");
        shadow.className = "focus-rail-card-shadow";

        cardEl.appendChild(img);
        cardEl.appendChild(lights);
        cardEl.appendChild(shadow);

        cardEl.addEventListener("click", () => {
          // Calculate offset based on current activeIndex (which may have changed since click attached)
          // Actually we can compute relative index:
          const currentOffset = absIndex - activeIndex;
          if (currentOffset !== 0) navigateBy(currentOffset);
        });

        track.appendChild(cardEl);
        activeCards.set(absIndex, cardEl);

        // set initial far-off state if entering
        gsap.set(cardEl, {
          x: (offset > 0 ? 1 : -1) * (Math.abs(offset) + 1) * 320,
          z: -(dist + 1) * 180,
          scale: 0.8,
          rotationY: (offset > 0 ? 1 : -1) * -20,
          opacity: 0,
          filter: `blur(${blur + 5}px) brightness(${brightness - 0.2})`,
          zIndex,
        });
      } else {
        cardEl.style.zIndex = zIndex;
      }

      // Animate smoothly to new position
      if (animate) {
        gsap.to(cardEl, {
          x: xOffset,
          z: zOffset,
          scale: scale,
          rotationY: rotateY,
          opacity: opacity,
          filter: `blur(${blur}px) brightness(${brightness})`,
          duration: 0.6,
          ease: isCenter ? "back.out(1.2)" : "power3.out",
        });
      } else {
        gsap.set(cardEl, {
          x: xOffset,
          z: zOffset,
          scale: scale,
          rotationY: rotateY,
          opacity: opacity,
          filter: `blur(${blur}px) brightness(${brightness})`,
        });
      }
    });
  }

  function navigateBy(amount) {
    const prevActive = activeIndex;
    activeIndex += amount;
    updateVisuals(true, prevActive);
  }

  // Drag logic (rudimentary via Pointer events)
  let isDragging = false;
  let startX = 0;

  track.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    track.style.cursor = "grabbing";
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = "grab";
    track.releasePointerCapture(e.pointerId);
    const diff = e.clientX - startX;

    if (diff > 50) {
      navigateBy(-1); // swiped right -> GO PREV
    } else if (diff < -50) {
      navigateBy(1); // swiped left -> GO NEXT
    }
  });

  // Wheel logic
  let lastWheelTime = 0;
  container.addEventListener(
    "wheel",
    (e) => {
      const now = Date.now();
      if (now - lastWheelTime < 400) return;

      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;

      if (Math.abs(delta) > 20) {
        if (delta > 0) navigateBy(1);
        else navigateBy(-1);
        lastWheelTime = now;
        e.preventDefault(); // prevent scroll
      }
    },
    { passive: false },
  );

  // Key logic
  container.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") navigateBy(-1);
    if (e.key === "ArrowRight") navigateBy(1);
  });

  // Clicks
  prevBtn.addEventListener("click", () => navigateBy(-1));
  nextBtn.addEventListener("click", () => navigateBy(1));

  // Initialize
  buildDOM();
  updateVisuals(false); // set initial state without animation
}
