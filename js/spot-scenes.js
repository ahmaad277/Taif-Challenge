/* أوجد الفروقات — أزواج صور حقيقية (أصلية + معدّلة بمسح أجزاء بالذكاء الاصطناعي).
 *
 * مولّد آليًا عبر scripts/build-spot-puzzles.mjs — لا تعدّله يدويًا؛
 * عدّل الصور المصدر ثم أعد التوليد.
 *
 * differences: كسور 0–1 من مربّع العرض { x, y, r }
 *   x = كسر العرض، y = كسر الارتفاع، r = نصف قطر منطقة النقر.
 */

const SPOT_PUZZLES = [
  {
    type: 'photo',
    title: 'لقطة 1',
    aspect: '1 / 1',
    base: 'assets/spot/spot-01-base.jpg',
    modified: 'assets/spot/spot-01-mod.jpg',
    differences: [
      { x: 0.255, y: 0.782, r: 0.15 },
      { x: 0.473, y: 0.613, r: 0.07 },
      { x: 0.586, y: 0.964, r: 0.05 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 2',
    aspect: '1 / 1',
    base: 'assets/spot/spot-02-base.jpg',
    modified: 'assets/spot/spot-02-mod.jpg',
    differences: [
      { x: 0.843, y: 0.361, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 3',
    aspect: '1 / 1',
    base: 'assets/spot/spot-03-base.jpg',
    modified: 'assets/spot/spot-03-mod.jpg',
    differences: [
      { x: 0.198, y: 0.293, r: 0.15 },
      { x: 0.327, y: 0.941, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 4',
    aspect: '1 / 1',
    base: 'assets/spot/spot-04-base.jpg',
    modified: 'assets/spot/spot-04-mod.jpg',
    differences: [
      { x: 0.313, y: 0.071, r: 0.15 },
      { x: 0.291, y: 0.291, r: 0.122 },
      { x: 0.593, y: 0.445, r: 0.068 },
      { x: 0.598, y: 0.343, r: 0.061 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 5',
    aspect: '1 / 1',
    base: 'assets/spot/spot-05-base.jpg',
    modified: 'assets/spot/spot-05-mod.jpg',
    differences: [
      { x: 0.791, y: 0.559, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 6',
    aspect: '1 / 1',
    base: 'assets/spot/spot-07-base.jpg',
    modified: 'assets/spot/spot-07-mod.jpg',
    differences: [
      { x: 0.784, y: 0.879, r: 0.15 },
      { x: 0.511, y: 0.543, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 7',
    aspect: '1 / 1',
    base: 'assets/spot/spot-08-base.jpg',
    modified: 'assets/spot/spot-08-mod.jpg',
    differences: [
      { x: 0.448, y: 0.736, r: 0.15 },
      { x: 0.254, y: 0.521, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 8',
    aspect: '1 / 1',
    base: 'assets/spot/spot-09-base.jpg',
    modified: 'assets/spot/spot-09-mod.jpg',
    differences: [
      { x: 0.509, y: 0.868, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 9',
    aspect: '1 / 1',
    base: 'assets/spot/spot-11-base.jpg',
    modified: 'assets/spot/spot-11-mod.jpg',
    differences: [
      { x: 0.302, y: 0.671, r: 0.102 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 10',
    aspect: '1 / 1',
    base: 'assets/spot/spot-12-base.jpg',
    modified: 'assets/spot/spot-12-mod.jpg',
    differences: [
      { x: 0.237, y: 0.38, r: 0.15 },
      { x: 0.773, y: 0.414, r: 0.1 },
      { x: 0.95, y: 0.466, r: 0.109 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 11',
    aspect: '1 / 1',
    base: 'assets/spot/spot-13-base.jpg',
    modified: 'assets/spot/spot-13-mod.jpg',
    differences: [
      { x: 0.164, y: 0.404, r: 0.15 },
      { x: 0.702, y: 0.138, r: 0.113 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 12',
    aspect: '1 / 1',
    base: 'assets/spot/spot-14-base.jpg',
    modified: 'assets/spot/spot-14-mod.jpg',
    differences: [
      { x: 0.455, y: 0.545, r: 0.15 },
      { x: 0.232, y: 0.693, r: 0.15 },
      { x: 0.163, y: 0.954, r: 0.054 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 13',
    aspect: '1 / 1',
    base: 'assets/spot/spot-15-base.jpg',
    modified: 'assets/spot/spot-15-mod.jpg',
    differences: [
      { x: 0.762, y: 0.302, r: 0.135 },
      { x: 0.852, y: 0.63, r: 0.083 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 14',
    aspect: '1 / 1',
    base: 'assets/spot/spot-16-base.jpg',
    modified: 'assets/spot/spot-16-mod.jpg',
    differences: [
      { x: 0.87, y: 0.423, r: 0.15 },
      { x: 0.102, y: 0.298, r: 0.15 },
      { x: 0.332, y: 0.421, r: 0.102 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 15',
    aspect: '1 / 1',
    base: 'assets/spot/spot-17-base.jpg',
    modified: 'assets/spot/spot-17-mod.jpg',
    differences: [
      { x: 0.961, y: 0.907, r: 0.111 },
      { x: 0.005, y: 0.925, r: 0.089 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 16',
    aspect: '1 / 1',
    base: 'assets/spot/spot-18-base.jpg',
    modified: 'assets/spot/spot-18-mod.jpg',
    differences: [
      { x: 0.727, y: 0.834, r: 0.15 },
      { x: 0.111, y: 0.836, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 17',
    aspect: '1 / 1',
    base: 'assets/spot/spot-19-base.jpg',
    modified: 'assets/spot/spot-19-mod.jpg',
    differences: [
      { x: 0.189, y: 0.193, r: 0.15 },
      { x: 0.439, y: 0.646, r: 0.15 },
      { x: 0.066, y: 0.041, r: 0.083 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 18',
    aspect: '1 / 1',
    base: 'assets/spot/spot-20-base.jpg',
    modified: 'assets/spot/spot-20-mod.jpg',
    differences: [
      { x: 0.318, y: 0.611, r: 0.15 },
      { x: 0.834, y: 0.643, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 19',
    aspect: '1 / 1',
    base: 'assets/spot/spot-21-base.jpg',
    modified: 'assets/spot/spot-21-mod.jpg',
    differences: [
      { x: 0.046, y: 0.195, r: 0.07 },
      { x: 0.975, y: 0.186, r: 0.063 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 20',
    aspect: '1 / 1',
    base: 'assets/spot/spot-22-base.jpg',
    modified: 'assets/spot/spot-22-mod.jpg',
    differences: [
      { x: 0.543, y: 0.463, r: 0.15 },
      { x: 0.741, y: 0.943, r: 0.087 },
      { x: 0.777, y: 0.304, r: 0.102 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 21',
    aspect: '1 / 1',
    base: 'assets/spot/spot-24-base.jpg',
    modified: 'assets/spot/spot-24-mod.jpg',
    differences: [
      { x: 0.646, y: 0.982, r: 0.133 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 22',
    aspect: '1 / 1',
    base: 'assets/spot/spot-25-base.jpg',
    modified: 'assets/spot/spot-25-mod.jpg',
    differences: [
      { x: 0.318, y: 0.216, r: 0.135 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 23',
    aspect: '1 / 1',
    base: 'assets/spot/spot-26-base.jpg',
    modified: 'assets/spot/spot-26-mod.jpg',
    differences: [
      { x: 0.898, y: 0.809, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 24',
    aspect: '1 / 1',
    base: 'assets/spot/spot-27-base.jpg',
    modified: 'assets/spot/spot-27-mod.jpg',
    differences: [
      { x: 0.077, y: 0.163, r: 0.15 },
      { x: 0.684, y: 0.332, r: 0.142 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 25',
    aspect: '1 / 1',
    base: 'assets/spot/spot-28-base.jpg',
    modified: 'assets/spot/spot-28-mod.jpg',
    differences: [
      { x: 0.682, y: 0.104, r: 0.15 },
      { x: 0.875, y: 0.371, r: 0.115 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 26',
    aspect: '1 / 1',
    base: 'assets/spot/spot-29-base.jpg',
    modified: 'assets/spot/spot-29-mod.jpg',
    differences: [
      { x: 0.813, y: 0.798, r: 0.15 },
      { x: 0.093, y: 0.386, r: 0.142 },
      { x: 0.286, y: 0.955, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 27',
    aspect: '1 / 1',
    base: 'assets/spot/spot-30-base.jpg',
    modified: 'assets/spot/spot-30-mod.jpg',
    differences: [
      { x: 0.341, y: 0.907, r: 0.111 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 28',
    aspect: '1 / 1',
    base: 'assets/spot/spot-32-base.jpg',
    modified: 'assets/spot/spot-32-mod.jpg',
    differences: [
      { x: 0.259, y: 0.154, r: 0.15 },
      { x: 0.316, y: 0.845, r: 0.15 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 29',
    aspect: '1 / 1',
    base: 'assets/spot/spot-33-base.jpg',
    modified: 'assets/spot/spot-33-mod.jpg',
    differences: [
      { x: 0.688, y: 0.386, r: 0.15 },
      { x: 0.388, y: 0.798, r: 0.15 },
      { x: 0.143, y: 0.789, r: 0.15 },
      { x: 0.954, y: 0.77, r: 0.07 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 30',
    aspect: '1 / 1',
    base: 'assets/spot/spot-35-base.jpg',
    modified: 'assets/spot/spot-35-mod.jpg',
    differences: [
      { x: 0.343, y: 0.314, r: 0.15 },
      { x: 0.582, y: 0.188, r: 0.122 },
      { x: 0.18, y: 0.214, r: 0.1 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 31',
    aspect: '1 / 1',
    base: 'assets/spot/spot-36-base.jpg',
    modified: 'assets/spot/spot-36-mod.jpg',
    differences: [
      { x: 0.138, y: 0.843, r: 0.15 },
      { x: 0.452, y: 0.895, r: 0.15 },
      { x: 0.275, y: 0.564, r: 0.129 },
      { x: 0.361, y: 0.725, r: 0.076 },
    ],
  },
  {
    type: 'photo',
    title: 'لقطة 32',
    aspect: '1 / 1',
    base: 'assets/spot/spot-37-base.jpg',
    modified: 'assets/spot/spot-37-mod.jpg',
    differences: [
      { x: 0.62, y: 0.846, r: 0.081 },
      { x: 0.439, y: 0.882, r: 0.05 },
    ],
  },
];
