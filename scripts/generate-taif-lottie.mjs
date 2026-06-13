#!/usr/bin/env node
/** Generates assets/taif/taif-character.json — chibi Lottie with state markers */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'assets', 'taif', 'taif-character.json');

const FR = 30;
const OP = 270;

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function solidFill(hex) {
  return {
    ty: 'fl',
    c: { a: 0, k: [...rgb(hex), 1] },
    o: { a: 0, k: 100 },
    r: 1,
    bm: 0
  };
}

function ellipse(w, h) {
  return {
    ty: 'el',
    p: { a: 0, k: [0, 0] },
    s: { a: 0, k: [w, h] },
    d: 1
  };
}

function rect(w, h, round = 0) {
  return {
    ty: 'rc',
    p: { a: 0, k: [0, 0] },
    s: { a: 0, k: [w, h] },
    r: { a: 0, k: round },
    d: 1
  };
}

function shapeLayer(name, ind, shapes, parent, ip, op, pos = [100, 150, 0], anchor = [0, 0, 0], rotKeyframes = null) {
  const ks = {
    o: { a: 0, k: 100 },
    r: rotKeyframes || { a: 0, k: 0 },
    p: { a: 0, k: pos },
    a: { a: 0, k: anchor },
    s: { a: 0, k: [100, 100, 100] }
  };
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks,
    ao: 0,
    shapes: [{ ty: 'gr', it: [...shapes, { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }], nm: name, np: 2, cix: 2, bm: 0 }],
    ip,
    op,
    st: 0,
    bm: 0,
    parent
  };
}

function nullLayer(name, ind, posKeyframes, ip, op) {
  return {
    ddd: 0,
    ind,
    ty: 3,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: {
        a: 1,
        k: [
          { t: 0, s: [0], h: 1 },
          { t: 210, s: [0], h: 0 },
          { t: 212, s: [-4], h: 0 },
          { t: 214, s: [4], h: 0 },
          { t: 216, s: [-3], h: 0 },
          { t: 218, s: [3], h: 0 },
          { t: 220, s: [0], h: 1 },
          { t: OP, s: [0], h: 1 }
        ]
      },
      p: posKeyframes,
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] }
    },
    ip,
    op,
    st: 0,
    bm: 0
  };
}

const rootPos = {
  a: 1,
  k: [
    { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [100, 200, 0] },
    { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 30, s: [100, 195, 0] },
    { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 60, s: [100, 200, 0] },
    { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 89, s: [100, 195, 0] },
    { t: 90, s: [85, 200, 0] },
    { t: 105, s: [115, 198, 0] },
    { t: 119, s: [100, 200, 0] },
    { t: 120, s: [100, 200, 0] },
    { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 150, s: [100, 200, 0] },
    { t: 179, s: [100, 200, 0] },
    { t: 180, s: [100, 200, 0] },
    { t: 209, s: [100, 200, 0] },
    { t: 240, s: [100, 200, 0] },
    { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 252, s: [100, 185, 0] },
    { t: 264, s: [100, 200, 0] },
    { t: OP, s: [100, 200, 0] }
  ]
};

const headScale = {
  a: 1,
  k: [
    { t: 0, s: [100, 100, 100], h: 1 },
    { t: 120, s: [100, 100, 100], h: 0 },
    { t: 135, s: [100, 105, 100], h: 0 },
    { t: 150, s: [100, 100, 100], h: 0 },
    { t: 165, s: [100, 105, 100], h: 0 },
    { t: 179, s: [100, 100, 100], h: 1 },
    { t: OP, s: [100, 100, 100], h: 1 }
  ]
};

const armRot = {
  a: 1,
  k: [
    { t: 0, s: [0], h: 1 },
    { t: 180, s: [0], h: 0 },
    { t: 190, s: [-25], h: 0 },
    { t: 200, s: [15], h: 0 },
    { t: 209, s: [0], h: 1 },
    { t: OP, s: [0], h: 1 }
  ]
};

const legWalk = {
  a: 1,
  k: [
    { t: 0, s: [0], h: 1 },
    { t: 90, s: [0], h: 0 },
    { t: 98, s: [18], h: 0 },
    { t: 106, s: [-18], h: 0 },
    { t: 114, s: [18], h: 0 },
    { t: 119, s: [0], h: 1 },
    { t: OP, s: [0], h: 1 }
  ]
};

const layers = [
  nullLayer('Root', 1, rootPos, 0, OP),
  {
    ...shapeLayer('LegR', 2, [ellipse(14, 36), solidFill('#16213e')], 1, 0, OP, [18, 42, 0], [0, 0, 0], legWalk),
    parent: 1
  },
  {
    ...shapeLayer('LegL', 3, [ellipse(14, 36), solidFill('#16213e')], 1, 0, OP, [-18, 42, 0], [0, 0, 0], {
      a: 1,
      k: [
        { t: 0, s: [0], h: 1 },
        { t: 90, s: [0], h: 0 },
        { t: 98, s: [-18], h: 0 },
        { t: 106, s: [18], h: 0 },
        { t: 114, s: [-18], h: 0 },
        { t: 119, s: [0], h: 1 },
        { t: OP, s: [0], h: 1 }
      ]
    }),
    parent: 1
  },
  { ...shapeLayer('Body', 4, [rect(52, 58, 8), solidFill('#e94560')], 1, 0, OP, [0, 0, 0]), parent: 1 },
  { ...shapeLayer('ArmR', 5, [rect(10, 38, 4), solidFill('#f5d0c5')], 1, 0, OP, [32, -8, 0], [0, -19, 0], armRot), parent: 1 },
  { ...shapeLayer('ArmL', 6, [rect(10, 38, 4), solidFill('#f5d0c5')], 1, 0, OP, [-32, -8, 0]), parent: 1 },
  {
    ddd: 0,
    ind: 7,
    ty: 4,
    nm: 'Head',
    sr: 1,
    parent: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [0, -52, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: headScale
    },
    ao: 0,
    shapes: [{
      ty: 'gr',
      it: [
        ellipse(58, 58),
        solidFill('#f5d0c5'),
        ellipse(62, 38),
        solidFill('#2d2d44'),
        ellipse(8, 10),
        solidFill('#333333'),
        { ty: 'tr', p: { a: 0, k: [-14, 2] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ellipse(8, 10),
        solidFill('#333333'),
        { ty: 'tr', p: { a: 0, k: [14, 2] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }
      ],
      nm: 'HeadGroup',
      np: 3,
      cix: 2,
      bm: 0
    }],
    ip: 0,
    op: OP,
    st: 0,
    bm: 0
  }
];

const lottie = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: OP,
  w: 200,
  h: 280,
  nm: 'TaifCharacter',
  ddd: 0,
  assets: [],
  layers,
  markers: [
    { cm: 'idle', tm: 0, dr: 90 },
    { cm: 'walk', tm: 90, dr: 30 },
    { cm: 'talk', tm: 120, dr: 60 },
    { cm: 'count', tm: 180, dr: 30 },
    { cm: 'react_bad', tm: 210, dr: 30 },
    { cm: 'react_good', tm: 240, dr: 30 }
  ]
};

writeFileSync(out, JSON.stringify(lottie));
console.log('Wrote', out);
