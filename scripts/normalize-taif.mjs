/**
 * Normalizes the transparent Taif poses so every pose renders at a consistent
 * apparent size and foot position inside a fixed-aspect container.
 *
 * Steps per pose:
 *  1. Read the transparent PNG (RGBA).
 *  2. Coverage-trim: drop edge rows/columns whose opaque coverage is below a
 *     small threshold. This removes stray 1-2px background lines left by the
 *     white flood-fill (welcome/dramatic/bored had a faint bottom border) and
 *     isolates the real figure (+ its soft foot shadow).
 *  3. Scale the trimmed figure to fit (contain) inside a target content box.
 *  4. Composite bottom-centered onto a uniform CANVAS_W x CANVAS_H canvas.
 *
 * Output overwrites assets/taif/transparent/<pose>.png (originals remain in
 * assets/taif/<pose>.png as the untouched source). Run: node scripts/normalize-taif.mjs
 */
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dir = join(root, 'assets', 'taif', 'transparent');

const POSES = ['confident', 'talk', 'sassy', 'welcome', 'dramatic', 'bored'];

// Uniform output canvas (portrait). object-fit: contain in the CSS container
// then renders every pose at the same size with feet on a common baseline.
const CANVAS_W = 660;
const CANVAS_H = 820;
const TOP_PAD = 0.04;     // fraction of canvas height kept clear above the figure
const BOTTOM_PAD = 0.03;  // fraction kept clear below the figure (feet baseline)
const SIDE_PAD = 0.06;    // fraction kept clear on each side
const ALPHA_ON = 40;      // a pixel counts as "figure" above this alpha
const ROW_COV = 0.012;    // min opaque coverage for an edge row to be kept
const COL_COV = 0.012;    // min opaque coverage for an edge column to be kept

function contentBounds(data, W, H) {
  const rowCov = new Float32Array(H);
  const colCov = new Float32Array(W);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (data[(y * W + x) * 4 + 3] > ALPHA_ON) {
        rowCov[y] += 1;
        colCov[x] += 1;
      }
    }
  }
  for (let y = 0; y < H; y += 1) rowCov[y] /= W;
  for (let x = 0; x < W; x += 1) colCov[x] /= H;

  let top = 0;
  while (top < H && rowCov[top] < ROW_COV) top += 1;
  let bottom = H - 1;
  while (bottom > top && rowCov[bottom] < ROW_COV) bottom -= 1;
  let left = 0;
  while (left < W && colCov[left] < COL_COV) left += 1;
  let right = W - 1;
  while (right > left && colCov[right] < COL_COV) right -= 1;

  return { left, top, right, bottom };
}

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Install sharp first: npm install sharp');
    process.exit(1);
  }

  const present = new Set(await readdir(dir));

  for (const pose of POSES) {
    const file = `${pose}.png`;
    if (!present.has(file)) {
      console.warn(`skip (missing): ${file}`);
      continue;
    }
    const path = join(dir, file);
    const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { left, top, right, bottom } = contentBounds(data, info.width, info.height);
    const cropW = right - left + 1;
    const cropW2 = cropW;
    const cropH = bottom - top + 1;

    // Cropped figure as its own PNG buffer.
    const cropped = await sharp(path)
      .ensureAlpha()
      .extract({ left, top, width: cropW2, height: cropH })
      .png()
      .toBuffer();

    const boxW = CANVAS_W * (1 - 2 * SIDE_PAD);
    const boxH = CANVAS_H * (1 - TOP_PAD - BOTTOM_PAD);
    const scale = Math.min(boxW / cropW2, boxH / cropH);
    const drawW = Math.max(1, Math.round(cropW2 * scale));
    const drawH = Math.max(1, Math.round(cropH * scale));

    const resized = await sharp(cropped).resize(drawW, drawH).png().toBuffer();

    const leftPos = Math.round((CANVAS_W - drawW) / 2);
    const topPos = Math.round(CANVAS_H * (1 - BOTTOM_PAD) - drawH);

    await sharp({
      create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .composite([{ input: resized, left: leftPos, top: Math.max(0, topPos) }])
      .png()
      .toFile(path);

    console.log(`OK ${pose}: crop ${cropW2}x${cropH} -> draw ${drawW}x${drawH} on ${CANVAS_W}x${CANVAS_H}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
