/* أوجد الفروقات — صور حقيقية مع تعديلات SVG فوقها */

/*
 * SVG viewBox "0 0 100 75" matches the 4:3 aspect ratio of every photo.
 * Overlay shapes are placed in that coordinate space.
 * Difference hit-zones (differences[]) use 0–1 fractions:
 *   x = svg_cx / 100   (fraction of display width)
 *   y = svg_cy / 75    (fraction of display height)
 *   r = hit radius in the same normalized space (~0.08–0.13)
 */

const SPOT_PUZZLES = [
  /* ── 1: الأهرامات ────────────────────────────────────────────────── */
  {
    type: 'photo-overlay',
    title: 'الأهرامات',
    base: 'assets/spot/camels-base-r.jpg',
    overlays: `
      <!-- Bird silhouette, upper-right sky (cx≈75, cy≈14) -->
      <path d="M 67 14 Q 71 10 75 14 Q 79 10 83 14"
            stroke="#111" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <!-- Cloud, upper-center-left (center≈38,8) -->
      <ellipse cx="38" cy="8"  rx="12" ry="4.5" fill="white" opacity="0.88"/>
      <ellipse cx="29" cy="10" rx="8"  ry="3.5"  fill="white" opacity="0.88"/>
      <ellipse cx="47" cy="10" rx="7"  ry="3"    fill="white" opacity="0.88"/>
      <!-- Full moon, upper-center (cx≈55, cy≈19) -->
      <circle cx="55" cy="19" r="6.5" fill="#f0e8c8" stroke="#d8c888" stroke-width="0.9"/>
      <!-- Red ornament ball, lower-left camel garland area (cx≈8, cy≈61) -->
      <circle cx="8"  cy="61" r="5"   fill="#e8315f" stroke="#a01030" stroke-width="1"/>
      <!-- Gold 4-pointed star, lower-right (cx≈80, cy≈61) -->
      <polygon points="80,56 82.5,58.5 85,61 82.5,63.5 80,66 77.5,63.5 75,61 77.5,58.5"
               fill="#ffd700" stroke="#cc8800" stroke-width="0.8"/>
    `,
    differences: [
      { x: 0.75, y: 0.19, r: 0.10 },
      { x: 0.38, y: 0.11, r: 0.13 },
      { x: 0.55, y: 0.25, r: 0.09 },
      { x: 0.08, y: 0.81, r: 0.09 },
      { x: 0.80, y: 0.81, r: 0.09 },
    ],
  },

  /* ── 2: فلورنسا ──────────────────────────────────────────────────── */
  {
    type: 'photo-overlay',
    title: 'فلورنسا',
    base: 'assets/spot/city-base-r.jpg',
    overlays: `
      <!-- Airplane, upper-left sky (center≈30,12) -->
      <rect x="22" y="11"   width="16" height="2.5" rx="1.5" fill="#e0e0e0" stroke="#aaa" stroke-width="0.5"/>
      <polygon points="27,11 22,9 27,9"           fill="#cccccc"/>
      <polygon points="35,11 39,13.5 35,13.5"     fill="#cccccc"/>
      <!-- Bird, left mid-sky (cx≈15, cy≈30) -->
      <path d="M 7 30 Q 11 26 15 30 Q 19 26 23 30"
            stroke="#111" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <!-- Cloud, upper-right (center≈63,7) -->
      <ellipse cx="63" cy="7"  rx="13" ry="5"   fill="white" opacity="0.84"/>
      <ellipse cx="54" cy="9"  rx="9"  ry="3.5" fill="white" opacity="0.84"/>
      <ellipse cx="72" cy="9"  rx="8"  ry="3"   fill="white" opacity="0.84"/>
      <!-- Full moon, far-right sky (cx≈84, cy≈11) -->
      <circle cx="84" cy="11" r="6"   fill="#f0e8c8" stroke="#d8c888" stroke-width="0.9"/>
      <!-- Red ball, lower-right street area (cx≈70, cy≈68) -->
      <circle cx="70" cy="68" r="4.5" fill="#e8315f" stroke="#a01030" stroke-width="1"/>
    `,
    differences: [
      { x: 0.30, y: 0.16, r: 0.11 },
      { x: 0.15, y: 0.40, r: 0.10 },
      { x: 0.63, y: 0.09, r: 0.13 },
      { x: 0.84, y: 0.15, r: 0.09 },
      { x: 0.70, y: 0.91, r: 0.09 },
    ],
  },

  /* ── 3: الشاطئ ───────────────────────────────────────────────────── */
  {
    type: 'photo-overlay',
    title: 'الشاطئ',
    base: 'assets/spot/beach-base.jpg',
    overlays: `
      <!-- Bird, upper-right sky (cx≈72, cy≈12) -->
      <path d="M 64 12 Q 68 8 72 12 Q 76 8 80 12"
            stroke="#111" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <!-- Cloud, upper-center-left (center≈28,7) -->
      <ellipse cx="28" cy="7"  rx="12" ry="5"   fill="white" opacity="0.86"/>
      <ellipse cx="19" cy="9"  rx="8"  ry="3.5" fill="white" opacity="0.86"/>
      <ellipse cx="37" cy="9"  rx="7"  ry="3"   fill="white" opacity="0.86"/>
      <!-- Full moon, upper-left (cx≈10, cy≈12) -->
      <circle cx="10" cy="12" r="5.5" fill="#f0e8c8" stroke="#d8c888" stroke-width="0.9"/>
      <!-- Sun umbrella, lower-right beach (pole base≈82, canopy cy≈60) -->
      <rect x="81.3" y="58" width="1.5" height="13" fill="#555" rx="0.5"/>
      <ellipse cx="82" cy="58" rx="9"  ry="4"   fill="#ffcc00" stroke="#cc9900" stroke-width="0.9" opacity="0.93"/>
      <!-- Small sailing boat, center water area (hull≈50,40) -->
      <polygon points="44,41 56,41 54,45 46,45" fill="white"   stroke="#888" stroke-width="0.5"/>
      <rect x="49.5" y="34"  width="1.5" height="7" fill="#666"/>
      <polygon points="49.5,34 49.5,40 56,40"       fill="#cc3333" opacity="0.85"/>
    `,
    differences: [
      { x: 0.72, y: 0.16, r: 0.10 },
      { x: 0.28, y: 0.09, r: 0.12 },
      { x: 0.10, y: 0.16, r: 0.09 },
      { x: 0.82, y: 0.80, r: 0.10 },
      { x: 0.50, y: 0.52, r: 0.10 },
    ],
  },

  /* ── 4: لندن ─────────────────────────────────────────────────────── */
  {
    type: 'photo-overlay',
    title: 'لندن',
    base: 'assets/spot/london-base.jpg',
    overlays: `
      <!-- Bird, upper-center sky (cx≈50, cy≈14) -->
      <path d="M 42 14 Q 46 10 50 14 Q 54 10 58 14"
            stroke="#111" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <!-- Cloud, upper-right (center≈76,7) -->
      <ellipse cx="76" cy="7"  rx="12" ry="5"   fill="white" opacity="0.84"/>
      <ellipse cx="67" cy="9"  rx="8"  ry="3.5" fill="white" opacity="0.84"/>
      <ellipse cx="85" cy="9"  rx="7"  ry="3"   fill="white" opacity="0.84"/>
      <!-- Full moon, far-right sky (cx≈88, cy≈15) -->
      <circle cx="88" cy="15" r="6"   fill="#f0e8c8" stroke="#d8c888" stroke-width="0.9"/>
      <!-- Red ball, lower-center street (cx≈35, cy≈68) -->
      <circle cx="35" cy="68" r="4.5" fill="#e8315f" stroke="#a01030" stroke-width="1"/>
      <!-- Gold 4-pointed star, lower-left (cx≈15, cy≈68) -->
      <polygon points="15,63 17.5,65.5 20,68 17.5,70.5 15,73 12.5,70.5 10,68 12.5,65.5"
               fill="#ffd700" stroke="#cc8800" stroke-width="0.8"/>
    `,
    differences: [
      { x: 0.50, y: 0.19, r: 0.10 },
      { x: 0.76, y: 0.09, r: 0.12 },
      { x: 0.88, y: 0.20, r: 0.09 },
      { x: 0.35, y: 0.91, r: 0.09 },
      { x: 0.15, y: 0.91, r: 0.09 },
    ],
  },

  /* ── 5: الماراثون ────────────────────────────────────────────────── */
  {
    type: 'photo-overlay',
    title: 'الماراثون',
    base: 'assets/spot/marathon-base.jpg',
    overlays: `
      <!-- Bird, upper-center-right sky (cx≈60, cy≈8) -->
      <path d="M 52 8 Q 56 4 60 8 Q 64 4 68 8"
            stroke="#111" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <!-- Cloud, upper-left (center≈22,6) -->
      <ellipse cx="22" cy="6"  rx="11" ry="4.5" fill="white" opacity="0.85"/>
      <ellipse cx="13" cy="8"  rx="7"  ry="3.5" fill="white" opacity="0.85"/>
      <ellipse cx="31" cy="8"  rx="7"  ry="3"   fill="white" opacity="0.85"/>
      <!-- Full moon, far-right sky (cx≈85, cy≈9) -->
      <circle cx="85" cy="9"  r="5.5" fill="#f0e8c8" stroke="#d8c888" stroke-width="0.9"/>
      <!-- Red balloon, mid crowd (ball cy≈33, string to 39) -->
      <circle cx="40" cy="33" r="5.5" fill="#e8315f" stroke="#a01030" stroke-width="0.9"/>
      <line   x1="40" y1="38.5" x2="40" y2="45" stroke="#444" stroke-width="0.9"/>
      <!-- Gold 4-pointed star, mid crowd right (cx≈72, cy≈52) -->
      <polygon points="72,47 74.5,49.5 77,52 74.5,54.5 72,57 69.5,54.5 67,52 69.5,49.5"
               fill="#ffd700" stroke="#cc8800" stroke-width="0.8"/>
    `,
    differences: [
      { x: 0.60, y: 0.11, r: 0.10 },
      { x: 0.22, y: 0.08, r: 0.12 },
      { x: 0.85, y: 0.12, r: 0.09 },
      { x: 0.40, y: 0.44, r: 0.10 },
      { x: 0.72, y: 0.69, r: 0.09 },
    ],
  },
];
