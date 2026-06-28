/**
 * Automated "spot the difference" builder.
 *
 * Each puzzle is a pair: an original photo and an AI-modified copy where some
 * regions were erased. The two are (nearly) pixel-aligned, so we detect the
 * changes by diffing them.
 *
 * Key trick: a SHIFT-TOLERANT diff. For every pixel we take the minimum colour
 * distance over a small neighbourhood in the other image. That cancels the
 * 1-2px misalignment that otherwise lights up every sharp edge, leaving only
 * genuine region changes (the erasures).
 *
 * Outputs:
 *   assets/spot/spot-NN-base.jpg / spot-NN-mod.jpg   (display images, square)
 *   scripts/_preview/spot-NN.png                     (base + detected circles)
 *   scripts/_preview/diff-NN.png                     (normalized diff heatmap)
 *   scripts/_spot-results.json                       (machine-readable results)
 *
 * Does NOT modify js/spot-scenes.js (review previews first).
 */
import sharp from 'sharp';
import { readdirSync, existsSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const spotDir = join(import.meta.dirname, '..', 'assets', 'spot');
const decodedDir = join(spotDir, '_decoded');
const previewDir = join(import.meta.dirname, '_preview');

const TARGET = 900;        // saved display image size (square, px)
const DIFF = 280;          // diff working resolution (square, px)
const TOL = 2;             // shift tolerance in px (neighbourhood radius)
const BLUR = 2.0;          // gaussian blur sigma on the diff map
const IDENTICAL_MAX = 14;  // if peak blurred diff below this -> pair unchanged
const THRESH = 16;         // diff threshold (0-255) after blur
const MIN_AREA_FRAC = 0.0010; // ignore blobs smaller than this fraction of area
const REL_AREA = 0.10;     // drop blobs smaller than REL_AREA * largest blob
const MAX_DIFFS = 8;       // hard cap on reported regions
const MERGE_DIST = 0.055;  // merge blob centers closer than this (fraction)
const R_PAD = 1.22;        // radius padding factor over the blob half-size
const R_MIN = 0.05, R_MAX = 0.15;

// ---- pair discovery -------------------------------------------------------
function listStems() {
  const files = readdirSync(spotDir)
    .filter(f => /\.(jpe?g|png|heic|heif)$/i.test(f) && !f.startsWith('_') && !/-(base|mod)\.jpg$/i.test(f));
  return [...new Set(files.map(f => f.replace(/-2(?=\.[^.]+$)/i, '').replace(/\.[^.]+$/, '')))].sort();
}
function resolveSide(stem, isMod) {
  const dec = join(decodedDir, isMod ? `${stem}-2.png` : `${stem}.png`);
  if (existsSync(dec)) return dec;
  for (const e of ['jpg', 'JPG', 'jpeg', 'png', 'PNG']) {
    const p = join(spotDir, isMod ? `${stem}-2.${e}` : `${stem}.${e}`);
    if (existsSync(p)) return p;
  }
  return null;
}

async function rawColor(src, size) {
  const { data } = await sharp(src).resize(size, size, { fit: 'cover', position: 'centre' })
    .flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return data; // size*size*3 RGB
}

// ---- shift-tolerant diff map ----------------------------------------------
async function diffMap(baseSrc, modSrc) {
  const a = await rawColor(baseSrc, DIFF);
  const b = await rawColor(modSrc, DIFF);
  const n = DIFF * DIFF;
  const diff = Buffer.alloc(n);
  for (let y = 0; y < DIFF; y++) {
    for (let x = 0; x < DIFF; x++) {
      const ia = (y * DIFF + x) * 3;
      let best = Infinity;
      for (let dy = -TOL; dy <= TOL; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= DIFF) continue;
        for (let dx = -TOL; dx <= TOL; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= DIFF) continue;
          const ib = (yy * DIFF + xx) * 3;
          const dr = a[ia] - b[ib], dg = a[ia + 1] - b[ib + 1], db = a[ia + 2] - b[ib + 2];
          const d = dr * dr + dg * dg + db * db;
          if (d < best) best = d;
        }
      }
      diff[y * DIFF + x] = Math.min(255, Math.round(Math.sqrt(best / 3)));
    }
  }
  const blurred = await sharp(diff, { raw: { width: DIFF, height: DIFF, channels: 1 } })
    .blur(BLUR).raw().toBuffer();
  let peak = 0;
  for (let i = 0; i < n; i++) if (blurred[i] > peak) peak = blurred[i];
  return { blurred, peak, n };
}

// ---- connected components (8-connectivity) --------------------------------
function components(mask, w, h) {
  const labels = new Int32Array(w * h);
  const comps = [];
  const stack = [];
  let next = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || labels[i]) continue;
    next++;
    let area = 0, minX = w, minY = h, maxX = 0, maxY = 0;
    stack.length = 0; stack.push(i); labels[i] = next;
    while (stack.length) {
      const p = stack.pop();
      const x = p % w, y = (p / w) | 0;
      area++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const np = ny * w + nx;
          if (mask[np] && !labels[np]) { labels[np] = next; stack.push(np); }
        }
    }
    comps.push({ area, minX, minY, maxX, maxY });
  }
  return comps;
}

// separable morphological dilate (max filter), radius r
function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dx = -r; dx <= r; dx++) { const xx = x + dx; if (xx >= 0 && xx < w && mask[y * w + xx]) { v = 1; break; } }
      tmp[y * w + x] = v;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dy = -r; dy <= r; dy++) { const yy = y + dy; if (yy >= 0 && yy < h && tmp[yy * w + x]) { v = 1; break; } }
      out[y * w + x] = v;
    }
  return out;
}
function erode(mask, w, h, r) {
  const inv = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) inv[i] = mask[i] ? 0 : 1;
  const d = dilate(inv, w, h, r);
  for (let i = 0; i < w * h; i++) d[i] = d[i] ? 0 : 1;
  return d;
}

function mergeClose(diffs) {
  const out = [];
  for (const d of diffs.sort((a, b) => b.area - a.area)) {
    const near = out.find(o => Math.hypot(o.x - d.x, o.y - d.y) < MERGE_DIST);
    if (near) { near.r = Math.min(R_MAX, Math.max(near.r, d.r)); continue; }
    out.push({ ...d });
  }
  return out;
}

function analyze({ blurred, peak, n }) {
  if (peak < IDENTICAL_MAX) return { identical: true, diffs: [] };
  let mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = blurred[i] >= THRESH ? 1 : 0;
  // morphological closing: bridge the striping/aliasing gaps, then shrink back
  mask = erode(dilate(mask, DIFF, DIFF, 3), DIFF, DIFF, 1);
  const minArea = MIN_AREA_FRAC * n;
  const allComps = components(mask, DIFF, DIFF).sort((a, b) => b.area - a.area);
  if (process.env.DBG) console.log(`   rawComps=${allComps.length} top=${allComps.slice(0, 6).map(c => c.area).join(',')} minArea=${minArea.toFixed(0)}`);
  let comps = allComps.filter(c => c.area >= minArea);
  comps.sort((x, y) => y.area - x.area);
  const largest = comps.length ? comps[0].area : 0;
  comps = comps.filter(c => c.area >= REL_AREA * largest).slice(0, MAX_DIFFS);
  let diffs = comps.map(c => {
    const bw = c.maxX - c.minX + 1, bh = c.maxY - c.minY + 1;
    return {
      x: (c.minX + c.maxX) / 2 / DIFF,
      y: (c.minY + c.maxY) / 2 / DIFF,
      r: Math.min(R_MAX, Math.max(R_MIN, (Math.max(bw, bh) / 2 / DIFF) * R_PAD)),
      area: c.area,
    };
  });
  diffs = mergeClose(diffs);
  return { identical: false, diffs: diffs.map(d => ({ x: +d.x.toFixed(3), y: +d.y.toFixed(3), r: +d.r.toFixed(3) })) };
}

// ---- outputs --------------------------------------------------------------
async function makeDisplay(src, outPath) {
  await sharp(src).resize(TARGET, TARGET, { fit: 'cover', position: 'centre' }).jpeg({ quality: 86 }).toFile(outPath);
}
async function makePreview(baseDisplayPath, modDisplayPath, diffs, outPath) {
  const S = 760, GAP = 14, fullH = 2 * S + GAP;
  const top = await sharp(baseDisplayPath).resize(S, S).toBuffer();
  const bot = await sharp(modDisplayPath).resize(S, S).toBuffer();
  const circ = (oy) => diffs.map((d, i) => {
    const cx = d.x * S, cy = oy + d.y * S, r = d.r * S;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ff2d55" stroke-width="4"/>`
      + `<text x="${cx}" y="${cy - r - 5}" fill="#ff2d55" font-size="30" font-weight="bold" font-family="sans-serif" text-anchor="middle">${i + 1}</text>`;
  }).join('');
  const label = (txt, oy) => `<text x="10" y="${oy + 30}" fill="#19e0a0" font-size="26" font-weight="bold" font-family="sans-serif">${txt}</text>`;
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${fullH}">`
    + circ(0) + circ(S + GAP) + label('الأصلية', 0) + label('المعدّلة', S + GAP) + `</svg>`);
  await sharp({ create: { width: S, height: fullH, channels: 3, background: '#222222' } })
    .composite([
      { input: top, left: 0, top: 0 },
      { input: bot, left: 0, top: S + GAP },
      { input: svg, left: 0, top: 0 },
    ]).png().toFile(outPath);
}
async function makeHeatmap({ blurred, peak, n }, outPath) {
  const mx = Math.max(1, peak);
  const vis = Buffer.alloc(n);
  for (let i = 0; i < n; i++) vis[i] = Math.min(255, Math.round(blurred[i] / mx * 255));
  await sharp(vis, { raw: { width: DIFF, height: DIFF, channels: 1 } }).resize(560, 560).png().toFile(outPath);
}

async function main() {
  rmSync(previewDir, { recursive: true, force: true });
  mkdirSync(previewDir, { recursive: true });
  const stems = listStems();
  const results = [];
  let idx = 0;
  for (const stem of stems) {
    idx++;
    const id = String(idx).padStart(2, '0');
    const baseSrc = resolveSide(stem, false), modSrc = resolveSide(stem, true);
    if (!baseSrc || !modSrc) { console.log(`spot-${id} ${stem}: MISSING side`); continue; }

    const baseOut = join(spotDir, `spot-${id}-base.jpg`), modOut = join(spotDir, `spot-${id}-mod.jpg`);
    await makeDisplay(baseSrc, baseOut);
    await makeDisplay(modSrc, modOut);

    const dm = await diffMap(baseSrc, modSrc);
    const { identical, diffs } = analyze(dm);
    await makePreview(baseOut, modOut, diffs, join(previewDir, `spot-${id}.png`));
    await makeHeatmap(dm, join(previewDir, `diff-${id}.png`));

    results.push({
      id, stem, identical,
      base: `assets/spot/spot-${id}-base.jpg`,
      modified: `assets/spot/spot-${id}-mod.jpg`,
      differences: diffs,
    });
    const flag = identical ? '  <-- IDENTICAL (unusable)'
      : (diffs.length < 3 || diffs.length > 6) ? `  <-- review (${diffs.length})` : '';
    console.log(`spot-${id} ${stem.padEnd(38)} peak=${String(dm.peak).padStart(3)} diffs=${diffs.length}${flag}`);
  }
  writeFileSync(join(import.meta.dirname, '_spot-results.json'), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} pairs. Previews + heatmaps in scripts/_preview/`);

  writeSceneFile(results);
}

// Generate js/spot-scenes.js from the detection results (skip unusable pairs).
function writeSceneFile(results) {
  const usable = results.filter(r => !r.identical && r.differences.length > 0);
  const entries = usable.map((r, i) => {
    const diffs = r.differences
      .map(d => `      { x: ${d.x}, y: ${d.y}, r: ${d.r} },`).join('\n');
    return `  {
    type: 'photo',
    title: 'لقطة ${i + 1}',
    aspect: '1 / 1',
    base: '${r.base}',
    modified: '${r.modified}',
    differences: [
${diffs}
    ],
  },`;
  }).join('\n');

  const js = `/* أوجد الفروقات — أزواج صور حقيقية (أصلية + معدّلة بمسح أجزاء بالذكاء الاصطناعي).
 *
 * مولّد آليًا عبر scripts/build-spot-puzzles.mjs — لا تعدّله يدويًا؛
 * عدّل الصور المصدر ثم أعد التوليد.
 *
 * differences: كسور 0–1 من مربّع العرض { x, y, r }
 *   x = كسر العرض، y = كسر الارتفاع، r = نصف قطر منطقة النقر.
 */

const SPOT_PUZZLES = [
${entries}
];
`;
  writeFileSync(join(import.meta.dirname, '..', 'js', 'spot-scenes.js'), js);
  const skipped = results.length - usable.length;
  console.log(`Wrote js/spot-scenes.js with ${usable.length} puzzles (skipped ${skipped} identical/empty).`);
}

main().catch(e => { console.error(e); process.exit(1); });
