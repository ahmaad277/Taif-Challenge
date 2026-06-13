/* Shared design colors and canvas drawing helpers — synced with css/style.css tokens */

const DESIGN_COLORS = {
  surfaceBase: '#1e1033',
  surfaceCard: '#2a1848',
  surfaceElevated: '#352058',
  surfaceInset: '#140a24',
  borderMuted: '#4a3568',
  textPrimary: '#faf6ff',
  textSecondary: '#c4b8d9',
  accent: '#e84393',
  accentHover: '#ff6bab',
  success: '#5cdb95',
  error: '#ff6b6b',
  gold: '#f0c75e',
  blue: '#6c8cff',
  green: '#5cdb95',
  purple: '#b388ff',
  orange: '#ffb86c'
};

const THUMB_PALETTE = DESIGN_COLORS;

function createHiDPICanvas(logicalSize) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(logicalSize * dpr);
  canvas.height = Math.round(logicalSize * dpr);
  canvas.style.width = `${logicalSize}px`;
  canvas.style.height = `${logicalSize}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas, ctx, size: logicalSize };
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawThumbBackground(ctx, size) {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, DESIGN_COLORS.surfaceCard);
  gradient.addColorStop(1, DESIGN_COLORS.surfaceInset);
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, size, size, size * 0.12);
  ctx.fill();
  ctx.strokeStyle = DESIGN_COLORS.borderMuted;
  ctx.lineWidth = Math.max(1, size * 0.02);
  roundRect(ctx, size * 0.04, size * 0.04, size * 0.92, size * 0.92, size * 0.1);
  ctx.stroke();
}

function appendHiDPIThumb(container, logicalSize, drawFn) {
  const { canvas, ctx, size } = createHiDPICanvas(logicalSize);
  drawFn(ctx, size);
  container.appendChild(canvas);
  return canvas;
}

window.DESIGN_COLORS = DESIGN_COLORS;
window.THUMB_PALETTE = THUMB_PALETTE;
window.createHiDPICanvas = createHiDPICanvas;
window.roundRect = roundRect;
window.drawThumbBackground = drawThumbBackground;
window.appendHiDPIThumb = appendHiDPIThumb;
