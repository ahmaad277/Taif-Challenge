/**
 * Generates placeholder PNG assets for picmerge puzzles only.
 * Taif character PNGs must come from original assets — never generated here.
 *
 * Usage: node scripts/generate-placeholders.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function generatePicmergePngs() {
  const outDir = join(root, 'assets', 'picmerge');
  await mkdir(outDir, { recursive: true });

  const hues = [0, 25, 50, 120, 180, 210, 260, 300, 330];

  for (let i = 1; i <= 29; i += 1) {
    const id = String(i).padStart(3, '0');
    const hue = hues[i % hues.length];
    const hue2 = (hue + 40) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <rect width="400" height="200" fill="#2a1848"/>
      <rect x="20" y="30" width="160" height="140" rx="12" fill="hsl(${hue}, 65%, 55%)"/>
      <rect x="220" y="30" width="160" height="140" rx="12" fill="hsl(${hue2}, 65%, 50%)"/>
      <text x="200" y="108" text-anchor="middle" font-size="48" font-family="sans-serif" fill="#f0c75e">+</text>
    </svg>`;
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    await writeFile(join(outDir, `${id}.png`), png);
  }
  console.log('Created assets/picmerge/001.png … 029.png');
}

await generatePicmergePngs();
console.log('Picmerge placeholders generated (Taif PNGs excluded).');
