/**
 * Generates the PWA / Add-to-Home-Screen app icons for تحديات طيف.
 *
 * Composition (square, full-bleed brand background):
 *   1. Purple radial-gradient background matching the app stage.
 *   2. Taif (welcome pose) composited in the upper area, centered.
 *   3. Game title "تحديات طيف" in gold below the character.
 *
 * Outputs (assets/icons/):
 *   - icon-512.png   (manifest, any)
 *   - icon-192.png   (manifest, any)
 *   - icon-maskable-512.png (manifest, maskable — extra safe-zone padding)
 *   - apple-touch-icon.png   (180x180, iOS/iPadOS home screen)
 *
 * iOS applies its own rounded mask, so we ship a full-bleed background.
 * Run: node scripts/make-app-icon.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const charPath = join(root, 'assets', 'taif', 'transparent', 'welcome.png');
const outDir = join(root, 'assets', 'icons');

// Brand colors (mirror css :root tokens)
const STAGE_DEEP = '#1e1033';
const STAGE_PANEL = '#2a1848';
const GOLD = '#f0c75e';
const GOLD_SOFT = '#ffe9a8';
const PINK = '#e84393';

/**
 * Build one square icon at the given size.
 * @param {number} size  output edge length
 * @param {object} opts  { padScale, title, fontSize }
 *   padScale: fraction of the canvas reserved as outer margin (maskable wants more)
 */
async function buildIcon(size, opts = {}) {
  const { padScale = 0.0, withTitle = true } = opts;

  // Layout in a 0..size coordinate space.
  const pad = Math.round(size * padScale);
  const inner = size - pad * 2;

  // Title band height (only if titled). Character sits above it.
  const titleH = withTitle ? Math.round(inner * 0.24) : 0;
  const charAreaH = inner - titleH;

  // Background gradient SVG + title text in one layer.
  const fontSize = Math.round(inner * 0.155);
  const titleY = pad + charAreaH + Math.round(titleH * 0.66);

  const bgSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${STAGE_PANEL}"/>
      <stop offset="100%" stop-color="${STAGE_DEEP}"/>
    </radialGradient>
    <radialGradient id="glowTop" cx="50%" cy="0%" r="60%">
      <stop offset="0%" stop-color="${PINK}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${PINK}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowBottom" cx="50%" cy="100%" r="55%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" fill="url(#glowTop)"/>
  <rect width="${size}" height="${size}" fill="url(#glowBottom)"/>
  ${
    withTitle
      ? `<text x="${size / 2}" y="${titleY}" font-family="Tajawal, 'Segoe UI', Tahoma, Arial"
            font-size="${fontSize}" font-weight="800" fill="${GOLD_SOFT}"
            text-anchor="middle" direction="rtl"
            style="paint-order:stroke">تحديات طيف</text>`
      : ''
  }
</svg>`;

  // Scale Taif (660x820) to fit the character area (contain).
  const charBox = Math.round(charAreaH * 0.94);
  const charResized = await sharp(charPath)
    .resize({ height: charBox, fit: 'inside' })
    .toBuffer();
  const charMeta = await sharp(charResized).metadata();
  const charLeft = Math.round((size - charMeta.width) / 2);
  // Bottom-align the figure just above the title band.
  const charTop = Math.round(pad + charAreaH - charMeta.height);

  return sharp(Buffer.from(bgSvg))
    .composite([{ input: charResized, left: charLeft, top: Math.max(pad, charTop) }])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const icon512 = await buildIcon(512, { padScale: 0.0 });
  await sharp(icon512).toFile(join(outDir, 'icon-512.png'));

  const icon192 = await buildIcon(192, { padScale: 0.0 });
  await sharp(icon192).toFile(join(outDir, 'icon-192.png'));

  // Maskable: extra safe-zone padding so nothing critical is clipped by a circle.
  const maskable = await buildIcon(512, { padScale: 0.12 });
  await sharp(maskable).toFile(join(outDir, 'icon-maskable-512.png'));

  // Apple touch icon (iOS rounds corners itself).
  const apple = await buildIcon(180, { padScale: 0.0 });
  await sharp(apple).toFile(join(outDir, 'apple-touch-icon.png'));

  console.log('Generated icons in assets/icons/: icon-512, icon-192, icon-maskable-512, apple-touch-icon');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
