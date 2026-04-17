/* ============================================
   BOXES — Interactive grid background for About
   Canvas-based implementation of background-boxes
   ============================================ */

export function initBoxes() {
  const canvas = document.getElementById("about-boxes-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const section = document.getElementById("about");

  // Grid settings
  const CELL_W = 64;
  const CELL_H = 32;
  const SKEW_X = -48;
  const SKEW_Y = 14;

  // Colors matched to site palette
  const GRID_COLOR = "rgba(180, 140, 222, 0.1)";
  const PLUS_COLOR = "rgba(180, 140, 222, 0.12)";
  const HOVER_COLORS = [
    "rgba(180, 140, 222, 0.35)",
    "rgba(124, 92, 170, 0.35)",
    "rgba(200, 160, 240, 0.3)",
    "rgba(160, 120, 210, 0.3)",
    "rgba(140, 100, 190, 0.35)",
    "rgba(220, 180, 255, 0.25)",
    "rgba(170, 130, 220, 0.3)",
  ];

  let mouse = { x: -1000, y: -1000 };
  let hoveredCells = new Map(); // key: "col,row" -> { color, opacity }
  let animationFrameId;

  function resize() {
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }

  // Convert screen coords to skewed grid coords
  function screenToGrid(sx, sy) {
    const cx = canvas.width * 0.25;
    const cy = canvas.height * -0.25;

    // Reverse the transform: scale -> skew
    const scale = 0.675;
    let x = (sx - cx) / scale;
    let y = (sy - cy) / scale;

    // Reverse skew
    const skewXRad = (SKEW_X * Math.PI) / 180;
    const skewYRad = (SKEW_Y * Math.PI) / 180;

    const det = 1 - Math.tan(skewXRad) * Math.tan(skewYRad);
    const ux = (x - y * Math.tan(skewXRad)) / det;
    const uy = (y - x * Math.tan(skewYRad)) / det;

    const col = Math.floor(ux / CELL_W);
    const row = Math.floor(uy / CELL_H);
    return { col, row };
  }

  function getRandomColor() {
    return HOVER_COLORS[Math.floor(Math.random() * HOVER_COLORS.length)];
  }

  function draw() {
    animationFrameId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Match the CSS transform from the React component
    const cx = canvas.width * 0.25;
    const cy = canvas.height * -0.25;
    ctx.translate(cx, cy);
    ctx.scale(0.675, 0.675);

    const skewXRad = (SKEW_X * Math.PI) / 180;
    const skewYRad = (SKEW_Y * Math.PI) / 180;
    ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);

    // Determine visible grid range
    const cols = Math.ceil(canvas.width / (CELL_W * 0.3)) + 10;
    const rows = Math.ceil(canvas.height / (CELL_H * 0.3)) + 10;
    const startCol = -5;
    const startRow = -10;

    // Draw hovered cells
    hoveredCells.forEach((data, key) => {
      const [c, r] = key.split(",").map(Number);
      ctx.fillStyle = data.color;
      ctx.globalAlpha = data.opacity;
      ctx.fillRect(c * CELL_W, r * CELL_H, CELL_W, CELL_H);

      // Fade out
      data.opacity -= 0.008;
      if (data.opacity <= 0) {
        hoveredCells.delete(key);
      }
    });

    ctx.globalAlpha = 1;

    // Draw grid lines
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let c = startCol; c < startCol + cols; c++) {
      const x = c * CELL_W;
      ctx.beginPath();
      ctx.moveTo(x, startRow * CELL_H);
      ctx.lineTo(x, (startRow + rows) * CELL_H);
      ctx.stroke();
    }

    // Horizontal lines
    for (let r = startRow; r < startRow + rows; r++) {
      const y = r * CELL_H;
      ctx.beginPath();
      ctx.moveTo(startCol * CELL_W, y);
      ctx.lineTo((startCol + cols) * CELL_W, y);
      ctx.stroke();
    }

    // Draw plus signs at intersections (every other)
    ctx.strokeStyle = PLUS_COLOR;
    ctx.lineWidth = 1;
    const plusSize = 6;
    for (let c = startCol; c < startCol + cols; c += 2) {
      for (let r = startRow; r < startRow + rows; r += 2) {
        const px = c * CELL_W;
        const py = r * CELL_H;
        ctx.beginPath();
        ctx.moveTo(px, py - plusSize);
        ctx.lineTo(px, py + plusSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - plusSize, py);
        ctx.lineTo(px + plusSize, py);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    const { col, row } = screenToGrid(mouse.x, mouse.y);
    const key = `${col},${row}`;

    if (!hoveredCells.has(key) || hoveredCells.get(key).opacity < 0.5) {
      hoveredCells.set(key, { color: getRandomColor(), opacity: 1 });
    }

    // Also light up adjacent cells slightly
    const neighbors = [
      [col - 1, row],
      [col + 1, row],
      [col, row - 1],
      [col, row + 1],
    ];
    neighbors.forEach(([nc, nr]) => {
      const nk = `${nc},${nr}`;
      if (!hoveredCells.has(nk) || hoveredCells.get(nk).opacity < 0.3) {
        hoveredCells.set(nk, { color: getRandomColor(), opacity: 0.4 });
      }
    });
  }

  function handleMouseLeave() {
    mouse.x = -1000;
    mouse.y = -1000;
  }

  window.addEventListener("resize", resize);
  section.addEventListener("mousemove", handleMouseMove);
  section.addEventListener("mouseleave", handleMouseLeave);

  resize();
  draw();
}
