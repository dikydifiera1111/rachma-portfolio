import gsap from "gsap";

export function initIntro() {
  const overlay = document.getElementById("intro-overlay");
  const loaderWrapper = document.querySelector(".loader-wrapper");
  const preloaderDiv = document.getElementById("preloader-transition");
  const preloaderWord = document.getElementById("preloader-word");
  const preloaderText = document.getElementById("preloader-text");
  const preloaderSvgPath = document.getElementById("preloader-svg-path");

  if (!overlay) return;

  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);

  const words = [
    "Hello",
    "Bonjour",
    "Ciao",
    "Olà",
    "やあ",
    "Hallå",
    "Guten tag",
    "হ্যালো",
  ];
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Set initial SVG path shape
  if (preloaderSvgPath) {
    const initialPath = `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height + 300} 0 ${height} L0 0`;
    preloaderSvgPath.setAttribute("d", initialPath);
  }

  // Preloader timeout matching React's flow
  setTimeout(() => {
    // Hide generator spinner smoothly
    gsap.to(loaderWrapper, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        loaderWrapper.style.display = "none";

        if (preloaderDiv && preloaderWord) {
          preloaderDiv.style.display = "flex";
          let currentIndex = 0;
          preloaderWord.textContent = words[currentIndex];

          gsap.fromTo(
            preloaderText,
            { opacity: 0 },
            { opacity: 0.75, duration: 1, ease: "power2.out" },
          );

          const nextWord = () => {
            currentIndex++;
            if (currentIndex >= words.length) {
              setTimeout(startExitAnimation, 1000);
              return;
            }
            preloaderWord.textContent = words[currentIndex];
            setTimeout(nextWord, currentIndex === 0 ? 1000 : 150); // Fallback: since we just incremented, first delay was via the initial call, but let's just use 150.
          };

          setTimeout(nextWord, 1000); // the first word 'Hello' stays for 1000ms

          function startExitAnimation() {
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Re-enable scrolling shortly after animation starts
            setTimeout(() => {
              document.body.style.overflow = "auto";
            }, 200);

            // Make SVG the primary background shape
            overlay.style.background = "transparent";

            // Slide up overall overlay
            gsap.to(overlay, {
              top: "-100vh",
              duration: 0.8,
              ease: "power4.inOut",
              delay: 0.2,
            });

            // Slide up text
            gsap.to(preloaderText, {
              top: "-10vh",
              opacity: 0,
              duration: 0.8,
              ease: "power4.inOut",
            });

            if (preloaderSvgPath) {
              const targetPath = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`;
              gsap.to(preloaderSvgPath, {
                attr: { d: targetPath },
                duration: 0.7,
                ease: "power2.inOut",
                delay: 0.3,
                onComplete: () => {
                  overlay.style.display = "none";
                },
              });
            } else {
              setTimeout(() => (overlay.style.display = "none"), 1000);
            }
          }
        }
      },
    });
  }, 2000);
}
