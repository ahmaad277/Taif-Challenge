/* أيقونات الألعاب والفئات — مجموعة SVG موحّدة (نفس الإطار والسماكة ونظام الألوان) */

const ICON = {
  card: '#2a1848',
  inset: '#140a24',
  border: '#4a3568',
  pink: '#e84393',
  gold: '#f0c75e',
  blue: '#6c8cff',
  green: '#5cdb95',
  purple: '#b388ff',
  orange: '#ffb86c',
  text: '#c4b8d9'
};

const ICON_SW = 3.5;

/* إطار موحّد: مربّع بزوايا دائرية + تدرّج خفيف + حدّ هادئ، ثم الرمز في المنتصف */
function iconFrame(glyph) {
  return `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" role="img">
    <defs>
      <linearGradient id="ig-${(iconFrame._n = (iconFrame._n || 0) + 1)}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${ICON.card}"/>
        <stop offset="1" stop-color="${ICON.inset}"/>
      </linearGradient>
    </defs>
    <rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="url(#ig-${iconFrame._n})" stroke="${ICON.border}" stroke-width="1.5"/>
    <g fill="none" stroke-width="${ICON_SW}" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
  </svg>`;
}

const GAME_ICON_SVG = {
  // الأسئلة العامة — علامة استفهام
  trivia: iconFrame(`
    <path d="M22 22 a6 6 0 1 1 9 5 c-2 1.5 -3 2.5 -3 5" stroke="${ICON.pink}"/>
    <circle cx="28" cy="40" r="1.8" fill="${ICON.pink}" stroke="none"/>`),

  // رتب الجملة — كلمات/أشرطة
  sentence: iconFrame(`
    <rect x="14" y="18" width="12" height="8" rx="2.5" stroke="${ICON.blue}"/>
    <rect x="30" y="18" width="12" height="8" rx="2.5" stroke="${ICON.green}"/>
    <rect x="14" y="32" width="28" height="8" rx="2.5" stroke="${ICON.gold}"/>`),

  // تحدي الصور — صورتان + علامة جمع
  picmerge: iconFrame(`
    <rect x="13" y="20" width="13" height="16" rx="3" stroke="${ICON.blue}"/>
    <rect x="30" y="20" width="13" height="16" rx="3" stroke="${ICON.pink}"/>
    <path d="M28 25 v6 M25 28 h6" stroke="${ICON.gold}"/>`),

  // أوجد الفروق — لوحتان
  spot: iconFrame(`
    <rect x="13" y="16" width="14" height="24" rx="3" stroke="${ICON.blue}"/>
    <rect x="29" y="16" width="14" height="24" rx="3" stroke="${ICON.pink}"/>
    <circle cx="20" cy="34" r="2.2" fill="${ICON.gold}" stroke="none"/>`),

  // الذاكرة البصرية — شبكة
  memory: iconFrame(`
    <rect x="15" y="15" width="11" height="11" rx="2.5" stroke="${ICON.pink}"/>
    <rect x="30" y="15" width="11" height="11" rx="2.5" stroke="${ICON.blue}"/>
    <rect x="15" y="30" width="11" height="11" rx="2.5" stroke="${ICON.gold}"/>
    <rect x="30" y="30" width="11" height="11" rx="2.5" stroke="${ICON.green}"/>`),

  // التحدي الإبداعي — فرشاة
  creative: iconFrame(`
    <path d="M34 18 L24 30" stroke="${ICON.gold}"/>
    <path d="M24 30 l-6 8 l8 -4 z" stroke="${ICON.pink}"/>`),

  // كلمة السر — قفل
  password: iconFrame(`
    <rect x="18" y="26" width="20" height="15" rx="3.5" stroke="${ICON.gold}"/>
    <path d="M22 26 v-3 a6 6 0 0 1 12 0 v3" stroke="${ICON.text}"/>
    <circle cx="28" cy="33" r="2" fill="${ICON.gold}" stroke="none"/>`)
};

const TRIVIA_ICON_SVG = {
  // التاريخ والجغرافيا — كرة أرضية
  historyGeo: iconFrame(`
    <circle cx="28" cy="28" r="13" stroke="${ICON.blue}"/>
    <path d="M15 28 h26 M28 15 v26 M19 20 q9 8 18 0 M19 36 q9 -8 18 0" stroke="${ICON.green}" stroke-width="2.4"/>`),

  // العلوم والطبيعة — قارورة
  science: iconFrame(`
    <path d="M25 16 v8 l-7 13 a3 3 0 0 0 3 4 h14 a3 3 0 0 0 3 -4 l-7 -13 v-8" stroke="${ICON.green}"/>
    <path d="M22 17 h12" stroke="${ICON.text}"/>
    <circle cx="28" cy="34" r="1.8" fill="${ICON.pink}" stroke="none"/>`),

  // التكنولوجيا — شاشة
  technology: iconFrame(`
    <rect x="15" y="17" width="26" height="18" rx="3" stroke="${ICON.blue}"/>
    <path d="M23 41 h10 M28 35 v6" stroke="${ICON.text}"/>`),

  // الرياضة — كرة
  sports: iconFrame(`
    <circle cx="28" cy="28" r="13" stroke="${ICON.gold}"/>
    <path d="M28 15 v26 M15 28 h26" stroke="${ICON.text}" stroke-width="2.4"/>`),

  // الفضاء — كوكب بحلقة + نجمة
  space: iconFrame(`
    <circle cx="26" cy="27" r="9" stroke="${ICON.pink}"/>
    <ellipse cx="26" cy="27" rx="15" ry="5" stroke="${ICON.gold}" transform="rotate(-20 26 27)"/>
    <circle cx="40" cy="17" r="1.6" fill="${ICON.gold}" stroke="none"/>`),

  // عالم الحيوان — قطة
  animals: iconFrame(`
    <path d="M19 24 l-2 -7 l7 4 M37 24 l2 -7 l-7 4" stroke="${ICON.orange}"/>
    <circle cx="28" cy="30" r="10" stroke="${ICON.orange}"/>
    <circle cx="24" cy="29" r="1.5" fill="${ICON.text}" stroke="none"/>
    <circle cx="32" cy="29" r="1.5" fill="${ICON.text}" stroke="none"/>`),

  // اللغات — حرفان
  languages: iconFrame(`
    <path d="M20 38 l4 -16 l4 16 M21 33 h6" stroke="${ICON.purple}"/>
    <path d="M32 22 h5 a4 4 0 0 1 0 8 h-5 z m0 8 h6 a4 4 0 0 1 0 8 h-6 z" stroke="${ICON.blue}"/>`),

  // ألغاز وذكاء — قطعة أحجية
  puzzles: iconFrame(`
    <path d="M19 19 h7 a2.5 2.5 0 0 1 5 0 h7 v7 a2.5 2.5 0 0 1 0 5 v7 h-7 a2.5 2.5 0 0 0 -5 0 h-7 v-7 a2.5 2.5 0 0 0 0 -5 z" stroke="${ICON.gold}"/>`)
};

if (typeof window !== 'undefined') {
  window.GAME_ICON_SVG = GAME_ICON_SVG;
  window.TRIVIA_ICON_SVG = TRIVIA_ICON_SVG;
}
