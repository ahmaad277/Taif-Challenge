/* Taif v2.1 — PNG-first actor, Host Bar layouts, grid walk */

const TAIF_LOTTIE_PATH = 'assets/taif/taif-character.json';

const TAIF_PNG = {
  base: 'assets/taif/transparent/confident.png',
  talk: 'assets/taif/transparent/talk.png',
  react_bad: 'assets/taif/transparent/sassy.png',
  react_good: 'assets/taif/transparent/welcome.png',
  dramatic: 'assets/taif/transparent/dramatic.png',
  bored: 'assets/taif/transparent/bored.png'
};

const TAIF_LINES = {
  welcome: [
    'مرحباً! أنا هنا لأساعدكم… أو على الأقل لأسخر منكم بلطف.',
    'مرحباً بكم في تحديات طيف — حيث الفوز اختياري!',
    'أنا طيف! سأكون لطيفة… حتى تخسرون.'
  ],
  teams: [
    'سمّوا فرقكم… بأسماء تليق بالهزيمة القادمة!',
    'اختاروا أسماء قصيرة… حتى يسهل السخرية منها لاحقاً!',
    'عدد الفرق؟ كلما زاد العدد، زادت الفرص للسخرية!',
    'اختاروا أسماء تعطيكم هيبة... لأن الأداء غالباً ماراح يعطيكم إياها.'
  ],
  gameSelect: [
    'اختاروا تحدّيكم… أو تخلّوا الحظ يقرر!',
    'سبعة تحديات… وسبعة أسباب للندم. اختاروا بحكمة!',
    'أي لعبة تريدو أن تفشلوا فيها أولاً؟',
    'العبو الكل عشوائياً… لو كان عندكم شجاعه!',
    'اختاروا اللعبة التي تشعرون إنها تمثل "نقطة قوتكم"... لكي تكون الصدمة أقوى!',
    'جولة سريعة وخفيفة، ولا جولة عميقة تخرب العلاقات؟ حددوا مساركم.'
  ],
  triviaCategory: [
    'اختاروا فئتكم… ولا تلوموني إن كانت صعبة!',
    'فئة واحدة، مصير واحد… اختاروا بحكمة!',
    'ثماني فئات… وثمانية أسباب للندم. ابدأوا!'
  ],
  games: {
    trivia: [
      'معلوماتكم من الكتب والدراسة، ام من قنوات "هل تعلم"؟ سنكتشف ذلك الان!',
      'أول إجابة تخطر ببالكم غالباً هي الصح… ولستُ مسؤولة عن كلامي!',
      'اختبار معلومات… أو اختبار لصبركم!',
      'فكروا بسرعة… أو على الأقل فكروا!'
    ],
    sentence: [
      'الكلمات مبعثرة… مثل أفكاركم أحياناً!',
      'رتّبوا الجملة… قبل أن يرتبها أحد غيركم!',
      'الترتيب الصحيح يحتاج صبراً!',
      'هذه اللعبه ستكشف لنا فائدة حصص القراءة والإملاء التي كنتم تنامون فيها!'
    ],
    picmerge: [
      'صورتان… كلمة واحدة. فكّروا!',
      'ادمجوا ما ترونه في بالكم… ثم اكتبوه!',
      'رمز + رمز = كلمة. بسيط؟ لا!',
      'الكلمة مخفية بين الصورتين… هل تجدونها؟'
    ],
    spot: [
      'خمس فروق… أو خمس أعذار إن لم تجدوها!',
      'عينك حادّه؟ سنرى!',
      'ما لقيتم الفرق؟ واذا قمت ولقيته؟؟',
      'تفاصيل صغيرة… فارق كبير!'
    ],
    memory: [
      'احفظوا بسرعة… الذاكرة القصيرة مهارة نادرة!',
      'ركزوا! ما ترونه الآن لن يبقى!',
      'ذاكرة بصرية… أو ذاكرة مؤقتة!',
      'أصحاب الذاكرة المؤقتة.. انتم في ورطه!'
    ],
    creative: [
      'أبدعوا… أو على الأقل حاولوا!',
      'الإبداع مطلوب والتقييم صارم.. لا يوجد واسطات!',
      'أظهروا مواهبكم… أو ما تبقى منها!',
      'جهزوا إبداعكم لأن محكمة طيف الفنية ما ترحم!'
    ],
    password: [
      'صفوا الكلمه بدون قولها. سهل؟ بالتأكيد لا! هل هي مشكلتي؟ ايضاً لا',
      'كلمة سر… ووصف محفوف بالمخاطر!',
      'في هذه اللعبة فقط.. التزموا الصمت',
      'لغة الإشارة… أو لغة الإحباط!'
    ]
  },
  partialWin: [
    'لا تفرحوا كثيراً… المفاجأة قادمة!',
    'تقدّم جيد… لكن اللعبة لم تنتهِ!',
    'نقاطكم ترتفع… مثل توقعاتكم!'
  ],
  partialLose: [],
  partialNeutral: [
    'انتهت الجولة… من يتقدّم؟',
    'لا تفرحوا كثيراً، ما زالت الألعاب قادمة!',
    'استراحة قصيرة… ثم نكمل تعذيبكم.',
    'جولة انتهت… والأعصاب ما زالت!'
  ],
  sessionWin: [
    'مبروك! البقية… تمرّنوا للمرة الجاية.',
    'فوز مستحق؟… أو حظ سعيد؟.. قراركم!',
    'الفائز يستحق… على الأقل نقطة!'
  ],
  sessionTie: [
    'تعادل! حتى لو انكم متفقين لن تخرجوا بهذه النتيجة!',
    'لا فائز؟ إذاً الجميع خسر بأناقة!',
    'تعادل… يعني أحدكم كان محظوظاً!'
  ],
  sessionEmpty: [
    'الجميع خسر… يعني الجميع فاز بالتواضع!',
    'صفر نقاط؟ أداء فريد من نوعه!',
    'لا فائز… لكن الذكريات باقية!'
  ],
  surprise: [
    'مفاجأة! كنتُ أخطط لإعطائكم استراحة… لكن لا.',
    'جولة مفاجأة! وقت مضاعف ونقاط مضاعفة!',
    'مفاجأة! استعدوا… أو لا، قراركم!',
    'جولة الطاولة المقلوبة! النقاط هنا ستغير الترتيب... استعدوا!'
  ],
  correct: [
    'واو! هل هذا فريقكم الحقيقي؟',
    'إجابة صحيحة… انها مفاجأة!',
    'إجابة صحيحة.. كادت طيف أن تصدق إنكم عباقرة!',
    'نقطة مستحقة! يبدو ان الفريق الثاني يمر بمرحلة استيعاب الصدمة!',
    'ممتاز! استمروا قبل أن تغيّروا رأيي!'
  ],
  wrong: [
    'لا بأس… تقريباً!',
    'الثقة كانت مليون... والنتيجة صفر!',
    'يا سلام على الثقة!',
    'اجابة خاطئه؟ اقترح إعادة النظر في مصادر معلوماتكم.',
    'لا بأس! ما زال هناك مجال للريمونتادا',
    'خطأ! لكن على الأقل حاولتم!',
    'ليس تماماً… لكن قريب… نوعاً ما!'
  ],
  timeout: [
    'الوقت لا ينتظر… على عكس بعضكم!',
    'انتهى الوقت! الساعة لا تكذب.',
    'تأخرتم… والمؤقت لا يرحم!',
    'الوقت انتهى… كالأمل أحياناً!'
  ]
};

const TAIF_MOCK_LINES = [
  (team) => `يا ${team}… المركز الأخير يناسبك أكثر مما توقعت!`,
  (team) => `يا ${team}... الجو بالأسفل هادئ ومريح أليس كذلك؟`,
  (team) => `${team} ذاهب في جولة إلى الطريق المنحدره!`,
  (team) => `يا ${team} هل تلعبون لعبة "الهروب من الأضواء"!?`,
  (team) => `${team}، حتى نقاطك تتمنّى لو تنتمي لفريق ثاني!`,
  (team) => `${team}… أداء ثابت في أسفل القائمة!`,
  (team) => `شجّعوا ${team}… يحتاجون معجزة!`,
  (team) => `${team}، النقاط عندكم تتجمّد!`,
  (team) => `يا ${team}، المركز الأخير يرحّب بكم!`,
  (team) => `${team}… محاولة شجاعة، نتيجة حزينة!`,
  (team) => `لا تيأس يا ${team}… أو تيأس، قرارك!`
];

const TAIF_LOSE_QUIPS = TAIF_LINES.wrong;

let taifUsedLines = new Set();
let taifBarResizeObserver = null;

const TAIF_LOTTIE_SEGMENTS = {
  idle: [0, 89],
  walk: [90, 119],
  talk: [120, 179],
  count: [180, 209],
  react_bad: [210, 239],
  react_good: [240, 269]
};

const TAIF_MOTION_CLASSES = [
  'taif-motion-idle',
  'taif-motion-talk',
  'taif-motion-walk',
  'taif-motion-count',
  'taif-motion-react-bad',
  'taif-motion-react-good'
];

const TAIF_MOOD_TO_MOTION = {
  welcome: 'idle',
  rules: 'idle',
  mock: 'react-bad',
  bored: 'idle',
  surprise: 'react-good',
  celebrate: 'react-good',
  neutral: 'idle',
  talk: 'talk',
  walk: 'walk',
  count: 'count'
};

const TAIF_MOOD_TO_PNG = {
  welcome: 'react_good',
  rules: 'base',
  mock: 'react_bad',
  bored: 'bored',
  surprise: 'dramatic',
  celebrate: 'react_good',
  neutral: 'base',
  talk: 'talk'
};

const TAIF_MOTION_TO_PNG = {
  idle: 'base',
  talk: 'talk',
  walk: 'base',
  count: 'base',
  'react-bad': 'react_bad',
  'react-good': 'react_good'
};

const TAIF_HERO_SCREENS = new Set([
  'welcome-screen',
  'teams-screen',
  'taif-screen',
  'game-select-screen',
  'trivia-category-screen',
  'surprise-screen',
  'partial-results-screen',
  'session-end-screen'
]);

const TAIF_GAME_SCREEN_IDS = new Set([
  'trivia-screen',
  'sentence-screen',
  'picmerge-screen',
  'spot-screen',
  'memory-screen',
  'creative-screen',
  'password-screen'
]);

const TAIF_TIMED_GAME_KEYS = new Set([
  'trivia',
  'sentence',
  'picmerge',
  'spot',
  'memory',
  'creative',
  'password'
]);

let taifLottieAnim = null;
let taifLottieEnabled = false;
let taifPresenterState = { mood: 'welcome', layout: 'hero', motion: 'idle' };
let taifMicroQuipTimer = null;
let taifMicroQuipRestore = null;
let taifLastMicroQuipAt = 0;
let taifTypewriterActive = false;

function setTaifTypewriterActive(active) {
  taifTypewriterActive = active;
}

function isTaifTypewriterActive() {
  return taifTypewriterActive;
}

let taifCurrentMotion = 'idle';
let taifGridWalkTimer = null;
let taifGridMode = false;
let taifGridEl = null;
let taifGridCols = 4;
let taifLastTimerSecond = null;
let taifCurrentPngKey = 'base';

function pickTaifLine(poolKey, { gameId } = {}) {
  let pool;
  if (gameId) {
    pool = TAIF_LINES.games?.[gameId] || [];
  } else if (poolKey) {
    pool = TAIF_LINES[poolKey];
  } else {
    return '';
  }
  if (!pool || !pool.length) return '';

  const available = pool.filter((line) => !taifUsedLines.has(line));
  const pickFrom = available.length ? available : pool;
  const line = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  taifUsedLines.add(line);
  return line;
}

function resetTaifUsedLines() {
  taifUsedLines = new Set();
}

function syncTaifLayoutOffset() {
  const dock = document.getElementById('taif-dock');
  const layout = taifPresenterState.layout || 'hero';

  document.documentElement.style.setProperty('--taif-hero-width', '0px');

  if (layout === 'hero') {
    document.documentElement.style.setProperty('--taif-dock-height', '0px');
    return;
  }

  if (dock && !dock.hidden) {
    const height = dock.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--taif-dock-height', `${Math.ceil(height + 12)}px`);
  } else {
    document.documentElement.style.setProperty('--taif-dock-height', '0px');
  }
}

function syncTaifBarOffset() {
  syncTaifLayoutOffset();
}

function initTaifBarObserver() {
  const heroPanel = document.getElementById('taif-hero-panel');
  const dock = document.getElementById('taif-dock');
  if (taifBarResizeObserver) return;

  taifBarResizeObserver = new ResizeObserver(() => syncTaifLayoutOffset());
  if (heroPanel) taifBarResizeObserver.observe(heroPanel);
  if (dock) taifBarResizeObserver.observe(dock);
  window.addEventListener('resize', syncTaifLayoutOffset);
}

function getTaifStageElements() {
  return {
    stage: document.getElementById('taif-stage'),
    heroPanel: document.getElementById('taif-hero-panel'),
    heroImg: document.getElementById('taif-hero-img'),
    heroText: document.getElementById('taif-hero-text'),
    heroCursor: document.getElementById('taif-hero-cursor'),
    dock: document.getElementById('taif-dock'),
    hostBar: document.querySelector('.taif-dock-bar') || document.querySelector('.taif-host-bar'),
    actorWrap: document.getElementById('taif-actor-wrap'),
    characterImg: document.getElementById('taif-character-img'),
    lottie: document.getElementById('taif-lottie'),
    timer: document.getElementById('taif-host-timer'),
    text: document.getElementById('taif-host-text'),
    label: document.getElementById('taif-host-label'),
    cursor: document.getElementById('taif-host-cursor'),
    bubble: document.querySelector('#taif-dock .taif-host-bubble') || document.querySelector('.taif-hero-bubble')
  };
}

function getActiveTaifCharacterImg() {
  const { heroImg, characterImg } = getTaifStageElements();
  const layout = taifPresenterState.layout || 'hero';
  return layout === 'hero' ? heroImg || characterImg : characterImg || heroImg;
}

function showTaifHost() {
  document.body.classList.add('has-taif-host');
  syncTaifLayoutVisibility();
}

function hideTaifHost() {
  document.body.classList.remove('has-taif-host');
  const { heroPanel, dock } = getTaifStageElements();
  if (heroPanel) heroPanel.hidden = true;
  if (dock) dock.hidden = true;
}

function syncTaifLayoutVisibility() {
  const { heroPanel, dock } = getTaifStageElements();
  const layout = taifPresenterState.layout || 'hero';
  const isHero = layout === 'hero';

  if (heroPanel) heroPanel.hidden = !isHero;
  if (dock) dock.hidden = isHero;

  document.body.classList.toggle('taif-layout-hero', isHero);
  document.body.classList.toggle('taif-layout-compact', layout === 'compact' || layout === 'grid');
  document.body.classList.toggle('taif-layout-grid', layout === 'grid');

  requestAnimationFrame(syncTaifLayoutOffset);
}

function shouldUseLottie() {
  return new URLSearchParams(window.location.search).get('lottie') === '1';
}

function playTaifLottieState(stateName, loop = true) {
  if (!taifLottieEnabled || !taifLottieAnim) return;
  const seg = TAIF_LOTTIE_SEGMENTS[stateName];
  if (!seg || typeof taifLottieAnim.playSegments !== 'function') return;
  taifLottieAnim.loop = loop;
  taifLottieAnim.playSegments(seg, true);
}

function setTaifLayout(layout) {
  const { stage } = getTaifStageElements();
  if (!layout) return;
  taifPresenterState.layout = layout;
  if (stage) stage.dataset.layout = layout === 'hero' ? 'compact' : layout;
  syncTaifLayoutVisibility();
}

function resolveLayoutForScreen(screenId) {
  if (TAIF_GAME_SCREEN_IDS.has(screenId)) {
    if (taifGridMode && screenId === 'memory-screen') {
      return 'grid';
    }
    return 'compact';
  }
  if (TAIF_HERO_SCREENS.has(screenId)) return 'hero';
  return 'hero';
}

function setTaifPng(pngKey) {
  const { characterImg, heroImg, lottie } = getTaifStageElements();
  if (taifLottieEnabled) return;

  const src = TAIF_PNG[pngKey] || TAIF_PNG.base;
  if (taifCurrentPngKey === pngKey) return;

  taifCurrentPngKey = pngKey;
  [characterImg, heroImg].forEach((img) => {
    if (!img) return;
    img.classList.add('taif-img-crossfade');
    img.addEventListener(
      'load',
      () => img.classList.remove('taif-img-crossfade'),
      { once: true }
    );
    img.src = src;
    img.hidden = false;
  });
  if (lottie) lottie.hidden = true;
}

function setTaifMotion(motion) {
  const { characterImg, heroImg } = getTaifStageElements();
  const imgs = [characterImg, heroImg].filter(Boolean);
  if (!imgs.length) return;

  taifCurrentMotion = motion;
  imgs.forEach((img) => {
    TAIF_MOTION_CLASSES.forEach((cls) => img.classList.remove(cls));
    img.classList.add(`taif-motion-${motion}`);
  });

  if (!taifTypewriterActive && motion !== 'walk' && motion !== 'count') {
    const pngKey = TAIF_MOTION_TO_PNG[motion] || 'base';
    setTaifPng(pngKey);
  }

  const lottieState = motion === 'react-bad' ? 'react_bad' : motion === 'react-good' ? 'react_good' : motion;
  playTaifLottieState(lottieState);
}

function setTaifSpeech(text) {
  const { text: dockText, heroText } = getTaifStageElements();
  if (text !== undefined) {
    if (dockText) dockText.textContent = text;
    if (heroText) heroText.textContent = text;
  }
  requestAnimationFrame(syncTaifLayoutOffset);
}

function setTaifMood(mood, { text, motion, pngKey } = {}) {
  if (mood) taifPresenterState.mood = mood;
  if (text !== undefined) setTaifSpeech(text);

  if (taifTypewriterActive) return;

  const motionName = motion || TAIF_MOOD_TO_MOTION[mood] || 'idle';
  taifPresenterState.motion = motionName;
  setTaifMotion(motionName);

  if (pngKey) {
    setTaifPng(pngKey);
  } else if (TAIF_MOOD_TO_PNG[mood]) {
    setTaifPng(TAIF_MOOD_TO_PNG[mood]);
  }
}

function setTaifPresenter(opts = {}) {
  setTaifMood(opts.mood, {
    text: opts.text,
    motion: opts.lottieState ? opts.lottieState.replace('_', '-') : undefined,
    pngKey: opts.pngKey
  });
}

function getLastPlaceTeam() {
  const sorted = getSortedTeamsByScore();
  if (!sorted.length) return null;
  return sorted[sorted.length - 1];
}

function getTaifMockLine(teamName) {
  const lineFn = TAIF_MOCK_LINES[Math.floor(Math.random() * TAIF_MOCK_LINES.length)];
  return lineFn(teamName);
}

function hasDistinctLastPlace() {
  const sorted = getSortedTeamsByScore();
  if (sorted.length < 2) return false;
  const topScore = gameState.scores[sorted[0]] || 0;
  const lastScore = gameState.scores[sorted[sorted.length - 1]] || 0;
  return lastScore < topScore;
}

function getWelcomeScreenTaifText() {
  return pickTaifLine('welcome');
}

function getTeamsScreenTaifText() {
  return pickTaifLine('teams');
}

function getGameSelectTaifText() {
  return pickTaifLine('gameSelect');
}

function getTriviaCategoryTaifText() {
  return pickTaifLine('triviaCategory');
}

function getGameScreenTaifText(screenId) {
  const gameId = screenId.replace('-screen', '');
  return pickTaifLine(null, { gameId }) || 'يلا نلعب!';
}

function syncTaifTimer(seconds, { warning = false, gameKey = null, active = true, memorize = false } = {}) {
  const { timer, stage } = getTaifStageElements();
  if (!timer || !stage) return;

  const activeScreen = document.querySelector('.screen.active');
  const showTimer =
    active &&
    gameKey &&
    TAIF_TIMED_GAME_KEYS.has(gameKey) &&
    activeScreen &&
    TAIF_GAME_SCREEN_IDS.has(activeScreen.id);

  if (!showTimer) {
    timer.hidden = true;
    timer.classList.remove('timer-warning', 'timer-memorize');
    stage.classList.remove('taif-stage--timer-active');
    taifLastTimerSecond = null;
    if (!taifTypewriterActive && taifCurrentMotion === 'count') {
      setTaifMotion(taifPresenterState.motion || 'idle');
    }
    return;
  }

  timer.hidden = false;
  timer.textContent = String(seconds);
  timer.classList.toggle('timer-memorize', memorize);
  timer.classList.toggle('timer-warning', !memorize && warning);
  stage.classList.add('taif-stage--timer-active');

  if (!memorize && warning && taifLastTimerSecond !== seconds) {
    setTaifMotion('count');
  } else if (!memorize && !warning && taifCurrentMotion === 'count' && !taifTypewriterActive) {
    setTaifMotion(taifPresenterState.motion || 'idle');
  }

  taifLastTimerSecond = seconds;
}

function syncGameTimer(gameKey, timeLeft, { active = true, warning, memorize = false } = {}) {
  syncTaifTimer(timeLeft, {
    warning: warning !== undefined ? warning : (timeLeft <= 5 && !memorize),
    gameKey,
    active,
    memorize
  });
}

function hideTaifGameTimer() {
  syncTaifTimer(0, { gameKey: null });
}

function stopTaifGridWalk() {
  if (taifGridWalkTimer) {
    clearInterval(taifGridWalkTimer);
    taifGridWalkTimer = null;
  }
}

function resetTaifActorPosition() {
  const { actorWrap, stage } = getTaifStageElements();
  if (!actorWrap || !stage) return;

  actorWrap.classList.remove('taif-actor-wrap--grid');
  actorWrap.style.position = '';
  actorWrap.style.left = '';
  actorWrap.style.top = '';
  actorWrap.style.transform = '';
  actorWrap.style.zIndex = '';
  stage.classList.remove('taif-stage--on-grid');
}

function taifWalkToCell(gridEl, row, col, cols = 4) {
  const { actorWrap, characterImg } = getTaifStageElements();
  if (!gridEl || !actorWrap) return Promise.resolve();

  const index = row * cols + col;
  const cell = gridEl.children[index];
  if (!cell) return Promise.resolve();

  setTaifMotion('walk');

  const rect = cell.getBoundingClientRect();
  actorWrap.classList.add('taif-actor-wrap--grid');
  actorWrap.style.position = 'fixed';
  actorWrap.style.left = `${rect.left + rect.width / 2}px`;
  actorWrap.style.top = `${rect.top + rect.height / 2}px`;
  actorWrap.style.transform = 'translate(-50%, -92%) scale(0.8)';
  actorWrap.style.zIndex = '250';

  if (characterImg) characterImg.hidden = false;

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!taifGridWalkTimer) {
        setTaifMotion('idle');
      }
      resolve();
    }, 360);
  });
}

function taifWalkToCellIndex(gridEl, index, cols = 4) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  return taifWalkToCell(gridEl, row, col, cols);
}

function startTaifGridWalk(gridEl, cols = 4, intervalMs = 1400) {
  stopTaifGridWalk();
  if (!gridEl || !gridEl.children.length) return;

  taifGridEl = gridEl;
  taifGridCols = cols;
  taifGridMode = true;
  setTaifLayout('grid');

  const { stage } = getTaifStageElements();
  if (stage) stage.classList.add('taif-stage--on-grid');

  const step = () => {
    const total = gridEl.children.length;
    const idx = Math.floor(Math.random() * total);
    taifWalkToCellIndex(gridEl, idx, cols);
  };

  step();
  taifGridWalkTimer = setInterval(step, intervalMs);
}

function taifEnterGridMode(gridEl, cols = 4) {
  taifGridEl = gridEl;
  taifGridCols = cols;
  taifGridMode = true;
  setTaifLayout('grid');
  const { stage } = getTaifStageElements();
  if (stage) stage.classList.add('taif-stage--on-grid');
}

function taifExitGridMode() {
  stopTaifGridWalk();
  taifGridMode = false;
  taifGridEl = null;
  resetTaifActorPosition();

  const activeScreen = document.querySelector('.screen.active');
  if (activeScreen) {
    setTaifLayout(resolveLayoutForScreen(activeScreen.id));
  }

  if (!taifTypewriterActive) {
    setTaifMotion(taifPresenterState.motion || 'idle');
  }
}

function updateTaifForScreen(screenId) {
  if (taifTypewriterActive) return;

  if (!TAIF_GAME_SCREEN_IDS.has(screenId) || screenId !== 'memory-screen') {
    if (!taifGridWalkTimer) {
      taifExitGridMode();
    }
  }

  hideTaifGameTimer();
  showTaifHost();
  setTaifLayout(resolveLayoutForScreen(screenId));

  switch (screenId) {
    case 'welcome-screen':
      setTaifMood('welcome', { text: getWelcomeScreenTaifText() });
      break;
    case 'teams-screen':
      setTaifMood('mock', { text: getTeamsScreenTaifText() });
      break;
    case 'taif-screen':
      setTaifMood('rules', { text: '' });
      break;
    case 'game-select-screen':
      setTaifMood('rules', { text: getGameSelectTaifText() });
      break;
    case 'trivia-category-screen':
      setTaifMood('rules', { text: getTriviaCategoryTaifText() });
      break;
    case 'picmerge-mode-screen':
      setTaifMood('rules', { text: 'اختر نمط تحدي الصور — دور متناوب أو سباق الفرق!' });
      break;
    case 'memory-mode-screen':
      setTaifMood('rules', { text: 'اختر نمط الذاكرة — سهل أو متوسط أو صعب!' });
      break;
    case 'surprise-screen':
      setTaifMood('surprise', { text: '' });
      break;
    case 'partial-results-screen': {
      const completedId = gameState.session.lastCompletedGameId;
      const mood = hasDistinctLastPlace() ? 'mock' : 'bored';
      setTaifMood(mood, {
        text: getPartialResultsTaifComment(completedId)
      });
      break;
    }
    case 'session-end-screen': {
      const winners = getWinningTeams();
      const topScore = winners.length ? (gameState.scores[winners[0]] || 0) : 0;
      const mood = topScore > 0 ? 'celebrate' : 'mock';
      setTaifMood(mood, {
        text: getSessionEndTaifComment()
      });
      setTaifMotion('react-good');
      break;
    }
    default:
      if (TAIF_GAME_SCREEN_IDS.has(screenId)) {
        setTaifMood('neutral', {
          text: getGameScreenTaifText(screenId)
        });
      }
      break;
  }

  requestAnimationFrame(syncTaifLayoutOffset);
}

function taifQuipCorrect() {
  taifMicroQuip(pickTaifLine('correct'), 'celebrate', 2200);
}

function taifQuipTimeout() {
  taifMicroQuip(pickTaifLine('timeout'), 'mock', 2200);
}

function taifMicroQuip(text, mood = 'mock', durationMs = 2000) {
  const now = Date.now();
  if (now - taifLastMicroQuipAt < 3000 || taifTypewriterActive) return;

  taifLastMicroQuipAt = now;

  if (taifMicroQuipTimer) {
    clearTimeout(taifMicroQuipTimer);
    taifMicroQuipTimer = null;
  }

  if (!taifMicroQuipRestore) {
    taifMicroQuipRestore = {
      ...taifPresenterState,
      text: getTaifStageElements().text?.textContent || ''
    };
  }

  setTaifMood(mood, {
    text,
    motion: mood === 'celebrate' ? 'react-good' : 'react-bad'
  });

  taifMicroQuipTimer = setTimeout(() => {
    taifMicroQuipTimer = null;
    if (taifMicroQuipRestore) {
      setTaifMood(taifMicroQuipRestore.mood, {
        text: taifMicroQuipRestore.text,
        motion: taifMicroQuipRestore.motion
      });
      taifMicroQuipRestore = null;
    }
  }, durationMs);
}

function maybeTaifLoseQuip() {
  const activeScreen = document.querySelector('.screen.active');
  if (!activeScreen || !TAIF_GAME_SCREEN_IDS.has(activeScreen.id)) return;

  taifMicroQuip(pickTaifLine('wrong'), 'mock', 2000);
}

function preloadTaifPngs() {
  Object.values(TAIF_PNG).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function tryInitLottie() {
  if (!shouldUseLottie()) return;

  const { lottie: container, characterImg } = getTaifStageElements();
  if (!container || typeof lottie === 'undefined') return;

  container.hidden = false;
  taifLottieAnim = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: TAIF_LOTTIE_PATH
  });

  taifLottieAnim.addEventListener('DOMLoaded', () => {
    taifLottieEnabled = true;
    if (characterImg) characterImg.hidden = true;
    playTaifLottieState('idle', true);
  });

  taifLottieAnim.addEventListener('complete', () => {
    if (!taifLottieEnabled) return;
    const state = taifPresenterState.motion || 'idle';
    playTaifLottieState(state.replace('-', '_'), true);
  });

  taifLottieAnim.addEventListener('data_failed', () => {
    taifLottieEnabled = false;
    container.hidden = true;
    if (characterImg) characterImg.hidden = false;
  });
}

function initTaifActor() {
  preloadTaifPngs();
  setTaifPng('react_good');
  setTaifMotion('idle');
  setTaifLayout('hero');
  showTaifHost();
  initTaifBarObserver();
  tryInitLottie();
  updateTaifForScreen('welcome-screen');
  requestAnimationFrame(syncTaifLayoutOffset);
}

function initTaifHost() {
  initTaifActor();
}

function setTaifAnim() {
  /* deprecated */
}

function setTaifSize() {
  /* deprecated */
}

function playTaifReactGood() {
  setTaifMotion('react-good');
}
