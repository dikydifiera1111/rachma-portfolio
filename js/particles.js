/* ============================================
   PARTICLES — Canvas background animation
   Adapted from AetherFlowHero for vanilla JS
   ============================================ */

export function initParticles() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let animationFrameId;
  let particles = [];
  const mouse = { x: null, y: null, radius: 200 };

  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Mouse collision detection
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius + this.size) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 5;
          this.y -= forceDirectionY * force * 5;
        }
      }

      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  function init() {
    particles = [];
    const numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * (canvas.width - size * 4) + size * 2;
      const y = Math.random() * (canvas.height - size * 4) + size * 2;
      const directionX = Math.random() * 0.4 - 0.2;
      const directionY = Math.random() * 0.4 - 0.2;
      // Match site accent: #b48cde
      const color = "rgba(180, 140, 222, 0.8)";
      particles.push(
        new Particle(x, y, directionX, directionY, size, color),
      );
    }
  }

  function resizeCanvas() {
    const hero = document.getElementById("hero");
    if (!hero) return;
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    init();
  }

  function connect() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const distance =
          (particles[a].x - particles[b].x) *
            (particles[a].x - particles[b].x) +
          (particles[a].y - particles[b].y) *
            (particles[a].y - particles[b].y);

        if (distance < (canvas.width / 7) * (canvas.height / 7)) {
          const opacityValue = 1 - distance / 20000;

          if (mouse.x !== null) {
            const dx = particles[a].x - mouse.x;
            const dy = particles[a].y - mouse.y;
            const distMouse = Math.sqrt(dx * dx + dy * dy);

            if (distMouse < mouse.radius) {
              // Bright white lines near cursor
              ctx.strokeStyle = `rgba(234, 229, 236, ${opacityValue})`;
            } else {
              // Purple accent lines (#b48cde toned)
              ctx.strokeStyle = `rgba(180, 140, 222, ${opacityValue})`;
            }
          } else {
            ctx.strokeStyle = `rgba(180, 140, 222, ${opacityValue})`;
          }

          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    // Match --bg-primary: #050405
    ctx.fillStyle = "rgba(5, 4, 5, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }
    connect();
  }

  function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }

  function handleMouseOut() {
    mouse.x = null;
    mouse.y = null;
  }

  window.addEventListener("resize", resizeCanvas);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseout", handleMouseOut);

  resizeCanvas();
  animate();
}
