/**
 * Removes near-white backgrounds from PNGs in assets/taif/
 * Uses edge-connected flood fill so interior whites (eyes, highlights) stay opaque.
 *
 * Usage: node scripts/remove-bg.mjs
 * Requires: npm install sharp (in project root)
 */
import { mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const inputDir = join(root, 'assets', 'taif');
const outputDir = join(root, 'assets', 'taif', 'transparent');
const THRESHOLD = 252;

const POSE_FILES = new Set([
  'welcome.png',
  'confident.png',
  'sassy.png',
  'bored.png',
  'dramatic.png',
  'talk.png'
]);

function isBackgroundPixel(r, g, b) {
  return r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD;
}

function floodFillBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const trySeed = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const i = nIdx * 4;
      if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2])) continue;
      visited[nIdx] = 1;
      queue.push(nIdx);
    }
  }

  for (let idx = 0; idx < width * height; idx += 1) {
    if (visited[idx]) {
      data[idx * 4 + 3] = 0;
    }
  }
}

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Install sharp first: npm install sharp');
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });
  const files = (await readdir(inputDir)).filter(
    (f) => f.toLowerCase().endsWith('.png') && POSE_FILES.has(f)
  );

  if (!files.length) {
    console.warn('No pose PNG files found in assets/taif/');
    return;
  }

  for (const file of files) {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file);
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    floodFillBackground(data, info.width, info.height);

    await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
      .png()
      .toFile(outputPath);

    console.log(`OK: ${file} -> transparent/${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
