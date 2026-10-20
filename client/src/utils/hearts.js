// A little burst of pink hearts drawn on a <canvas> when you tick a problem.
// Plain JavaScript (no React): one canvas fixed over the page, animated with requestAnimationFrame.

let canvas, ctx, frame = 0;
let parts = [];

function setup() {
  canvas = document.createElement('canvas');
  canvas.className = 'fx';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
}

function heart(x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.fill();
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  parts = parts.filter((p) => --p.life > 0);
  for (const p of parts) {
    p.vy += 0.18; // gravity
    p.x += p.vx;
    p.y += p.vy;
    ctx.globalAlpha = Math.min(1, p.life / 30);
    heart(p.x, p.y, p.size, p.color);
  }
  ctx.globalAlpha = 1;
  frame = parts.length ? requestAnimationFrame(tick) : 0;
}

export function burstHearts(x, y, count = 14) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!canvas) setup();
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const css = getComputedStyle(document.documentElement);
  const colors = ['--accent', '--h2', '--h1', '--h4'].map((v) => css.getPropertyValue(v).trim());
  for (let i = 0; i < count; i++) {
    parts.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: -Math.random() * 7 - 2, size: 6 + Math.random() * 7, color: colors[i % 4], life: 60 + Math.random() * 30 });
  }
  if (!frame) tick();
}
