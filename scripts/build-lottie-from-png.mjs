#!/usr/bin/env node
/**
 * Optional: builds a minimal Lottie JSON referencing transparent PNG assets.
 * Replace taif-character.json with a professional export when available.
 *
 * Usage: node scripts/build-lottie-from-png.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const out = join(root, 'assets', 'taif', 'taif-character-from-png.json');

const FR = 30;
const DURATION = 90;
const PNG = 'transparent/confident.png';

const lottie = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: DURATION,
  w: 280,
  h: 400,
  nm: 'Taif PNG placeholder',
  ddd: 0,
  assets: [
    {
      id: 'image_0',
      w: 280,
      h: 400,
      u: 'assets/taif/',
      p: PNG,
      e: 0
    }
  ],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 2,
      nm: 'Taif',
      refId: 'image_0',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [140, 200, 0] },
        a: { a: 0, k: [140, 200, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      ip: 0,
      op: DURATION,
      st: 0,
      bm: 0
    }
  ],
  markers: [
    { cm: 'idle', tm: 0, dr: DURATION },
    { cm: 'walk', tm: 0, dr: DURATION },
    { cm: 'talk', tm: 0, dr: DURATION },
    { cm: 'count', tm: 0, dr: DURATION },
    { cm: 'react_bad', tm: 0, dr: DURATION },
    { cm: 'react_good', tm: 0, dr: DURATION }
  ]
};

writeFileSync(out, JSON.stringify(lottie, null, 2));
console.log(`Wrote ${out}`);
console.log('Enable with ?lottie=1 and point TAIF_LOTTIE_PATH to this file if desired.');
