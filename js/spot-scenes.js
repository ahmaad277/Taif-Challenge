/* أوجد الفروقات — مشاهد SVG نظيفة ومتّسقة (تصميم مسطّح بنظام ألوان وسماكة موحّدة) */

const SPOT_VIEW_W = 400;
const SPOT_VIEW_H = 300;

/* لوحة ألوان مشتركة بنفس روح توكنات التصميم */
const SP = {
  outline: '#34294f',
  skyDay: '#bfe3ff',
  skyDusk: '#f7c9a3',
  night: '#241a3e',
  grass: '#83cf76',
  grassDark: '#5cb86a',
  sand: '#f3d6a0',
  sea: '#54b6e6',
  white: '#ffffff',
  pink: '#e84393',
  gold: '#f0c75e',
  blue: '#6c8cff',
  green: '#5cdb95',
  purple: '#b388ff',
  orange: '#ffb86c',
  red: '#e8556b',
  brown: '#a06a44',
  brownDark: '#7d4f30',
  grey: '#9aa3b8',
  greyLight: '#cdd4e6'
};

const SO = `stroke="${SP.outline}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

/* ——— مكوّنات قابلة لإعادة الاستخدام ——— */
function spSun(cx, cy, color) {
  let rays = '';
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * 2 * i) / 8;
    const x1 = cx + Math.cos(a) * 30;
    const y1 = cy + Math.sin(a) * 30;
    const x2 = cx + Math.cos(a) * 40;
    const y2 = cy + Math.sin(a) * 40;
    rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
  }
  return `${rays}<circle cx="${cx}" cy="${cy}" r="22" fill="${color}" ${SO}/>`;
}

function spCloud(cx, cy) {
  return `<g ${SO} fill="${SP.white}">
    <circle cx="${cx - 18}" cy="${cy + 4}" r="14"/>
    <circle cx="${cx}" cy="${cy - 6}" r="18"/>
    <circle cx="${cx + 18}" cy="${cy + 4}" r="14"/>
    <rect x="${cx - 30}" y="${cy + 2}" width="60" height="16" rx="8" stroke="none"/>
  </g>`;
}

function spTree(x, groundY, fruit) {
  const topY = groundY - 150;
  let fruits = '';
  if (fruit) {
    fruits = `<circle cx="${x - 14}" cy="${topY + 70}" r="7" fill="${SP.red}" ${SO}/>
      <circle cx="${x + 16}" cy="${topY + 90}" r="7" fill="${SP.red}" ${SO}/>`;
  }
  return `<rect x="${x - 9}" y="${groundY - 70}" width="18" height="70" rx="6" fill="${SP.brown}" ${SO}/>
    <circle cx="${x}" cy="${topY + 78}" r="46" fill="${SP.green}" ${SO}/>${fruits}`;
}

function spBench(x, y, color) {
  return `<g ${SO} fill="${color}">
    <rect x="${x - 34}" y="${y}" width="68" height="12" rx="4"/>
    <rect x="${x - 28}" y="${y + 12}" width="10" height="22" rx="3"/>
    <rect x="${x + 18}" y="${y + 12}" width="10" height="22" rx="3"/>
  </g>`;
}

function spFlower(x, y, color) {
  let petals = '';
  for (let i = 0; i < 5; i += 1) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    petals += `<circle cx="${(x + Math.cos(a) * 11).toFixed(1)}" cy="${(y + Math.sin(a) * 11).toFixed(1)}" r="7" fill="${color}" ${SO}/>`;
  }
  return `<rect x="${x - 2}" y="${y}" width="4" height="34" fill="${SP.grassDark}" stroke="none"/>${petals}<circle cx="${x}" cy="${y}" r="6" fill="${SP.gold}" ${SO}/>`;
}

function spBird(cx, cy) {
  return `<path d="M ${cx - 14} ${cy} Q ${cx - 7} ${cy - 10} ${cx} ${cy} Q ${cx + 7} ${cy - 10} ${cx + 14} ${cy}" fill="none" stroke="${SP.outline}" stroke-width="3" stroke-linecap="round"/>`;
}

function spStar(cx, cy, r, color) {
  let pts = '';
  for (let i = 0; i < 5; i += 1) {
    const ao = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const ai = ao + Math.PI / 5;
    pts += `${(cx + Math.cos(ao) * r).toFixed(1)},${(cy + Math.sin(ao) * r).toFixed(1)} `;
    pts += `${(cx + Math.cos(ai) * r * 0.45).toFixed(1)},${(cy + Math.sin(ai) * r * 0.45).toFixed(1)} `;
  }
  return `<polygon points="${pts.trim()}" fill="${color}"/>`;
}

function spScene(inner) {
  return `<svg viewBox="0 0 ${SPOT_VIEW_W} ${SPOT_VIEW_H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">${inner}</svg>`;
}

/* ——— المشاهد ——— */
const SPOT_PUZZLES = [
  // 1) الحديقة
  (() => {
    const sky = `<rect x="0" y="0" width="400" height="190" fill="${SP.skyDay}"/>`;
    const ground = `<rect x="0" y="186" width="400" height="114" fill="${SP.grass}"/><rect x="0" y="186" width="400" height="8" fill="${SP.grassDark}"/>`;
    const common = sky + ground + spBird(205, 60) + spBird(245, 70);
    return {
      title: 'الحديقة',
      base: spScene(common + spSun(330, 60, SP.gold) + spCloud(110, 60) + spTree(80, 250, false) + spBench(310, 210, SP.blue) + spFlower(190, 232, SP.pink)),
      modified: spScene(common + spSun(330, 60, SP.orange) + spTree(80, 250, true) + spBench(310, 210, SP.red) + spFlower(190, 232, SP.purple)),
      differences: [
        { x: 0.825, y: 0.20, r: 0.10 },
        { x: 0.275, y: 0.20, r: 0.11 },
        { x: 0.20, y: 0.52, r: 0.10 },
        { x: 0.775, y: 0.72, r: 0.10 },
        { x: 0.475, y: 0.79, r: 0.09 }
      ]
    };
  })(),

  // 2) الشاطئ
  (() => {
    const sky = `<rect x="0" y="0" width="400" height="180" fill="${SP.skyDay}"/>`;
    const sea = `<rect x="0" y="170" width="400" height="60" fill="${SP.sea}"/>`;
    const sand = `<rect x="0" y="226" width="400" height="74" fill="${SP.sand}"/>`;
    const boatBase = `<g ${SO}><path d="M 250 150 L 250 80 L 310 140 Z" fill="${SP.pink}"/><path d="M 230 150 L 330 150 L 314 172 L 246 172 Z" fill="${SP.brown}"/></g>`;
    const boatMod = `<g ${SO}><path d="M 250 150 L 250 80 L 310 140 Z" fill="${SP.green}"/><path d="M 230 150 L 330 150 L 314 172 L 246 172 Z" fill="${SP.brown}"/></g>`;
    const umbrellaBase = `<g ${SO}><line x1="90" y1="200" x2="90" y2="262" stroke="${SP.outline}" stroke-width="4"/><path d="M 52 202 A 38 38 0 0 1 128 202 Z" fill="${SP.red}"/></g>`;
    const umbrellaMod = `<g ${SO}><line x1="90" y1="200" x2="90" y2="262" stroke="${SP.outline}" stroke-width="4"/><path d="M 52 202 A 38 38 0 0 1 128 202 Z" fill="${SP.blue}"/></g>`;
    const ball = c => `<circle cx="300" cy="250" r="20" fill="${c}" ${SO}/>`;
    const common = sky + sea + sand;
    return {
      title: 'الشاطئ',
      base: spScene(common + spSun(60, 50, SP.gold) + umbrellaBase + boatBase + ball(SP.gold) + spStar(180, 268, 12, SP.orange)),
      modified: spScene(common + spCloud(60, 50) + umbrellaMod + boatMod + ball(SP.purple) + spStar(180, 268, 12, SP.pink) + spBird(330, 60)),
      differences: [
        { x: 0.15, y: 0.17, r: 0.11 },
        { x: 0.225, y: 0.68, r: 0.10 },
        { x: 0.70, y: 0.38, r: 0.11 },
        { x: 0.75, y: 0.83, r: 0.09 },
        { x: 0.45, y: 0.89, r: 0.09 }
      ]
    };
  })(),

  // 3) الغرفة
  (() => {
    const wall = `<rect x="0" y="0" width="400" height="232" fill="#efe3d0"/>`;
    const floor = `<rect x="0" y="226" width="400" height="74" fill="${SP.brown}"/><rect x="0" y="226" width="400" height="8" fill="${SP.brownDark}"/>`;
    const windowBase = `<g ${SO}><rect x="40" y="50" width="110" height="90" rx="6" fill="${SP.skyDay}"/><line x1="95" y1="50" x2="95" y2="140" stroke="${SP.outline}" stroke-width="3"/><line x1="40" y1="95" x2="150" y2="95" stroke="${SP.outline}" stroke-width="3"/></g>`;
    const windowMod = `<g ${SO}><rect x="40" y="50" width="110" height="90" rx="6" fill="${SP.skyDusk}"/><line x1="95" y1="50" x2="95" y2="140" stroke="${SP.outline}" stroke-width="3"/><line x1="40" y1="95" x2="150" y2="95" stroke="${SP.outline}" stroke-width="3"/></g>`;
    const frame = c => `<g ${SO}><rect x="240" y="60" width="90" height="70" rx="6" fill="${SP.white}"/><circle cx="270" cy="95" r="12" fill="${c}"/><path d="M 240 130 L 280 95 L 330 130 Z" fill="${SP.green}"/></g>`;
    const lamp = on => `<g ${SO}><rect x="285" y="150" width="14" height="76" fill="${SP.grey}"/><path d="M 262 150 L 322 150 L 308 120 L 276 120 Z" fill="${on ? SP.gold : SP.greyLight}"/></g>`;
    const plant = `<g ${SO}><rect x="55" y="186" width="40" height="40" rx="4" fill="${SP.orange}"/><circle cx="63" cy="180" r="12" fill="${SP.green}"/><circle cx="80" cy="172" r="14" fill="${SP.green}"/><circle cx="92" cy="184" r="11" fill="${SP.green}"/></g>`;
    const clock = hands => `<g ${SO}><circle cx="200" cy="80" r="26" fill="${SP.white}"/>${hands}</g>`;
    const common = wall + floor + plant;
    return {
      title: 'الغرفة',
      base: spScene(common + windowBase + frame(SP.pink) + lamp(true) + clock(`<line x1="200" y1="80" x2="200" y2="62" stroke="${SP.outline}" stroke-width="3"/><line x1="200" y1="80" x2="216" y2="80" stroke="${SP.outline}" stroke-width="3"/>`)),
      modified: spScene(common + windowMod + frame(SP.blue) + lamp(false) + clock(`<line x1="200" y1="80" x2="184" y2="80" stroke="${SP.outline}" stroke-width="3"/><line x1="200" y1="80" x2="200" y2="98" stroke="${SP.outline}" stroke-width="3"/>`)),
      differences: [
        { x: 0.2375, y: 0.317, r: 0.12 },
        { x: 0.6375, y: 0.32, r: 0.11 },
        { x: 0.7375, y: 0.45, r: 0.11 },
        { x: 0.50, y: 0.267, r: 0.10 },
        { x: 0.1875, y: 0.62, r: 0.10 }
      ]
    };
  })(),

  // 4) المدينة ليلاً
  (() => {
    const sky = `<rect x="0" y="0" width="400" height="300" fill="${SP.night}"/>`;
    const road = `<rect x="0" y="252" width="400" height="48" fill="#3a3357"/>`;
    const b1 = c => `<rect x="30" y="150" width="70" height="105" fill="${c}" ${SO}/>`;
    const b2 = `<rect x="120" y="110" width="64" height="145" fill="#4b6cc4" ${SO}/>`;
    const b3 = `<rect x="205" y="170" width="60" height="85" fill="#7d5bb0" ${SO}/>`;
    const win = (x, y, on) => `<rect x="${x}" y="${y}" width="12" height="14" rx="2" fill="${on ? SP.gold : '#2a2350'}"/>`;
    const winsBase = win(135, 130, true) + win(158, 130, false) + win(135, 160, true) + win(158, 160, true);
    const winsMod = win(135, 130, true) + win(158, 130, true) + win(135, 160, true) + win(158, 160, true);
    const car = c => `<g ${SO}><rect x="290" y="225" width="80" height="26" rx="8" fill="${c}"/><rect x="304" y="208" width="44" height="20" rx="6" fill="${c}"/><circle cx="308" cy="252" r="9" fill="${SP.outline}"/><circle cx="352" cy="252" r="9" fill="${SP.outline}"/></g>`;
    const common = sky + road + b2 + b3 + spStar(60, 50, 10, SP.white) + spStar(330, 80, 9, SP.white);
    return {
      title: 'المدينة',
      base: spScene(common + b1(SP.pink) + winsBase + `<circle cx="320" cy="45" r="24" fill="${SP.greyLight}" ${SO}/>` + car(SP.blue)),
      modified: spScene(common + b1(SP.orange) + winsMod + spSun(320, 45, SP.gold) + car(SP.red) + spStar(200, 40, 9, SP.gold)),
      differences: [
        { x: 0.1625, y: 0.675, r: 0.12 },
        { x: 0.40, y: 0.45, r: 0.08 },
        { x: 0.80, y: 0.15, r: 0.11 },
        { x: 0.825, y: 0.78, r: 0.12 },
        { x: 0.50, y: 0.135, r: 0.09 }
      ]
    };
  })(),

  // 5) المزرعة
  (() => {
    const sky = `<rect x="0" y="0" width="400" height="190" fill="${SP.skyDay}"/>`;
    const ground = `<rect x="0" y="186" width="400" height="114" fill="${SP.grass}"/><rect x="0" y="186" width="400" height="8" fill="${SP.grassDark}"/>`;
    const barn = roof => `<g ${SO}><rect x="40" y="150" width="120" height="100" fill="${SP.red}"/><path d="M 32 150 L 100 110 L 168 150 Z" fill="${roof}"/><rect x="85" y="195" width="30" height="55" fill="${SP.brownDark}"/></g>`;
    const cow = spots => `<g ${SO}><ellipse cx="280" cy="210" rx="46" ry="30" fill="${SP.white}"/><circle cx="318" cy="190" r="20" fill="${SP.white}"/><rect x="262" y="236" width="8" height="20" fill="${SP.white}"/><rect x="292" y="236" width="8" height="20" fill="${SP.white}"/>${spots}</g>`;
    const cowSpotsBase = `<circle cx="268" cy="205" r="11" fill="${SP.outline}"/><circle cx="296" cy="218" r="9" fill="${SP.outline}"/>`;
    const cowSpotsMod = `<circle cx="272" cy="208" r="9" fill="${SP.pink}"/><circle cx="298" cy="216" r="8" fill="${SP.pink}"/>`;
    const sunBase = spSun(350, 50, SP.gold);
    const common = sky + ground + barn(SP.brown);
    return {
      title: 'المزرعة',
      base: spScene(common + sunBase + cow(cowSpotsBase) + spTree(195, 250, false) + spCloud(120, 55)),
      modified: spScene(common + spSun(350, 50, SP.orange) + cow(cowSpotsMod) + spTree(195, 250, true) + spCloud(120, 55) + spBird(150, 90)),
      differences: [
        { x: 0.875, y: 0.167, r: 0.10 },
        { x: 0.71, y: 0.70, r: 0.12 },
        { x: 0.4875, y: 0.52, r: 0.10 },
        { x: 0.375, y: 0.30, r: 0.09 },
        { x: 0.25, y: 0.45, r: 0.08 }
      ]
    };
  })(),

  // 6) الفضاء
  (() => {
    const sky = `<rect x="0" y="0" width="400" height="300" fill="${SP.night}"/>`;
    const stars = spStar(60, 60, 9, SP.white) + spStar(120, 110, 7, SP.white) + spStar(330, 200, 8, SP.white);
    const planet = c => `<g ${SO}><circle cx="300" cy="80" r="40" fill="${c}"/><ellipse cx="300" cy="80" rx="60" ry="16" fill="none" stroke="${SP.gold}" stroke-width="5"/></g>`;
    const rocket = win => `<g ${SO}><path d="M 110 230 L 110 130 Q 130 100 150 130 L 150 230 Z" fill="${SP.greyLight}"/><circle cx="130" cy="160" r="12" fill="${win}"/><path d="M 110 215 L 88 245 L 110 240 Z" fill="${SP.red}"/><path d="M 150 215 L 172 245 L 150 240 Z" fill="${SP.red}"/><path d="M 118 230 L 142 230 L 130 262 Z" fill="${SP.orange}"/></g>`;
    const moon = `<g ${SO}><circle cx="70" cy="220" r="26" fill="${SP.greyLight}"/><circle cx="64" cy="214" r="6" fill="${SP.grey}" stroke="none"/><circle cx="80" cy="228" r="5" fill="${SP.grey}" stroke="none"/></g>`;
    const common = sky + stars + moon;
    return {
      title: 'الفضاء',
      base: spScene(common + planet(SP.pink) + rocket(SP.skyDay)),
      modified: spScene(common + planet(SP.blue) + rocket(SP.gold) + spStar(210, 70, 10, SP.gold) + spStar(360, 120, 8, SP.white)),
      differences: [
        { x: 0.75, y: 0.267, r: 0.13 },
        { x: 0.325, y: 0.533, r: 0.08 },
        { x: 0.525, y: 0.233, r: 0.09 },
        { x: 0.90, y: 0.40, r: 0.08 },
        { x: 0.625, y: 0.50, r: 0.10 }
      ]
    };
  })()
];

if (typeof window !== 'undefined') {
  window.SPOT_PUZZLES = SPOT_PUZZLES;
}
