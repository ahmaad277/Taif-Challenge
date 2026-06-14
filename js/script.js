const gameState = {
  teams: [],
  scores: {},
  trivia: {
    shuffledIndices: [],
    poolPointer: 0,
    currentTeamIndex: 0,
    teamQuestionCounts: {},
    questionsPerTeam: 5,
    questionStartTime: 0,
    answered: false,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 15,
    currentQuestion: null,
    selectedCategoryId: null,
    playMode: 'single-cat',       // 'random-all' | 'multi-cat' | 'single-cat'
    selectedCategoryIds: [],       // للنمط الثاني: الفئات المختارة
    questionPool: []               // مجمع الأسئلة للنمطين الأول والثاني
  },
  sentence: {
    shuffledIndices: [],
    poolPointer: 0,
    currentTeamIndex: 0,
    teamRoundCounts: {},
    roundsPerTeam: 3,
    currentWords: [],
    correctWords: [],
    selectedWordIndex: null,
    questionStartTime: 0,
    answered: false,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 30
  },
  picmerge: {
    shuffledIndices: [],
    poolPointer: 0,
    currentTeamIndex: 0,
    teamRoundCounts: {},
    roundsPerTeam: 3,
    currentPuzzle: null,
    questionStartTime: 0,
    answered: false,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 40
  },
  spot: {
    shuffledIndices: [],
    poolPointer: 0,
    currentTeamIndex: 0,
    teamRoundCounts: {},
    roundsPerTeam: 3,
    currentPuzzle: null,
    foundDiffIndices: [],
    roundActive: false,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 60
  },
  memory: {
    shuffledRoundSeeds: [],
    poolPointer: 0,
    currentTeamIndex: 0,
    teamRoundCounts: {},
    roundsPerTeam: 3,
    correctOrder: [],
    currentOrder: [],
    revealedCells: [],
    selectedCellIndex: null,
    phase: 'idle',
    questionStartTime: 0,
    answered: false,
    memorizeTimerId: null,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 30
  },
  creative: {
    shuffledIndices: [],
    poolPointer: 0,
    currentTeamIndex: 0,
    teamRoundCounts: {},
    roundsPerTeam: 3,
    currentChallenge: null,
    evaluatorTeamIndex: 0,
    phase: 'idle',
    answerText: '',
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 60,
    isDrawing: false,
    drawListenersBound: false,
    rated: false
  },
  session: {
    mode: null,
    gameQueue: [],
    queueIndex: 0,
    completedGameIds: [],
    surpriseShown: false,
    surpriseActive: false,
    pendingSurpriseGameId: null,
    pendingContinue: null,
    lastCompletedGameId: null
  },
  password: {
    shuffledIndices: [],
    poolPointer: 0,
    teamRoundCounts: {},
    roundsPerTeam: 3,
    roundNumber: 0,
    describerTeamIndex: 0,
    guesserTeamIndex: 0,
    currentWord: '',
    phase: 'idle',
    guessStartTime: 0,
    answered: false,
    readTimerId: null,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 30
  }
};

const SENTENCE_PUZZLES = [
  { words: ['الطفل', 'يلعب', 'في', 'الحديقة', 'الجميلة'] },
  { words: ['الشمس', 'تشرق', 'من', 'الشرق', 'يومياً'] },
  { words: ['الكتاب', 'موضوع', 'على', 'الطاولة', 'الخشبية'] },
  { words: ['الطالب', 'يدرس', 'درساً', 'جديداً', 'اليوم'] },
  { words: ['القطة', 'تنام', 'تحت', 'الشجرة', 'الكبيرة'] },
  { words: ['الماء', 'ضروري', 'لحياة', 'كل', 'الكائنات'] },
  { words: ['السماء', 'زرقاء', 'في', 'يوم', 'صيفي'] },
  { words: ['الأم', 'تطبخ', 'طعاماً', 'لذيذاً', 'للعائلة'] },
  { words: ['الطيور', 'تطير', 'فوق', 'الجبال', 'العالية'] },
  { words: ['الليل', 'هادئ', 'والنجوم', 'تلمع', 'بجمال'] },
  { words: ['المدرسة', 'قريبة', 'من', 'منزلنا', 'الجديد'] },
  { words: ['الصديق', 'يساعد', 'صديقه', 'في', 'الواجب'] },
  { words: ['الورد', 'جميل', 'له', 'رائحة', 'عطرة'] },
  { words: ['الفصل', 'الشتاء', 'بارد', 'وممطر', 'أحياناً'] },
  { words: ['النجاح', 'يحتاج', 'إلى', 'عمل', 'وجهد'] },
  { words: ['الحلم', 'جميل', 'عندما', 'ننام', 'ليلاً'] },
  { words: ['العلم', 'نور', 'والجهل', 'ظلام', 'دائماً'] },
  { words: ['الصبر', 'مفتاح', 'الفرج', 'في', 'الحياة'] },
  { words: ['الرياضة', 'تقوي', 'الجسم', 'والعقل', 'معاً'] },
  { words: ['القراءة', 'تفتح', 'آفاقاً', 'جديدة', 'للمعرفة'] },
  { words: ['الصدق', 'من', 'أجمل', 'الصفات', 'الإنسانية'] },
  { words: ['الابتسامة', 'تزين', 'الوجه', 'الجميل', 'دائماً'] },
  { words: ['الوقت', 'كالسيف', 'إن', 'لم', 'تقطعه'] },
  { words: ['العمل', 'الجماعي', 'يحقق', 'النجاح', 'الكبير'] }
];

let taifTransitionTimer = null;
let surpriseTransitionTimer = null;
let typewriterInterval = null;

const TAIF_WELCOME_TEXT =
  'أهلاً بكم! أنا طيف، مضيفتكم اللطيفة.. نسبياً. ' +
  'جهزوا عقولكم – أو ما تبقى منها – فالتحديات القادمة تحتاج إلى تركيز حقيقي، وليست مجرد لعبة! ' +
  'الأمر أشبه بمحاولة إقناع العائلة بأن الهاتف لا يسبب كل كوارث الكوكب.';

function getTaifWelcomeText() {
  return TAIF_WELCOME_TEXT;
}

function showScreen(screenId) {
  const startBtn = document.getElementById('taif-start-btn');

  if (screenId !== 'taif-screen') {
    if (startBtn) {
      startBtn.hidden = true;
    }
    if (typeof isTaifTypewriterActive === 'function' && isTaifTypewriterActive()) {
      clearTypewriter();
    }
  } else if (startBtn) {
    startBtn.hidden = false;
  }

  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId)?.classList.add('active');
  updateTaifForScreen(screenId);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const GAME_THUMB_SIZE = 56;
const C = window.DESIGN_COLORS || {
  surfaceCard: '#2a1848',
  surfaceInset: '#140a24',
  accent: '#e84393',
  gold: '#f0c75e',
  blue: '#6c8cff',
  success: '#5cdb95',
  textSecondary: '#c4b8d9'
};

function drawTriviaThumb(ctx, size) {
  drawThumbBackground(ctx, size);
  ctx.fillStyle = C.accent;
  ctx.font = `bold ${size * 0.55}px "Tajawal", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', size / 2, size / 2);
}

function drawSentenceThumb(ctx, size) {
  drawThumbBackground(ctx, size);
  ctx.fillStyle = C.blue;
  const w = size * 0.22;
  const h = size * 0.14;
  const gap = size * 0.06;
  const startX = (size - w * 3 - gap * 2) / 2;
  const y = size * 0.42;
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(startX + i * (w + gap), y, w, h);
  }
}

function drawPicmergeThumb(ctx, size) {
  drawThumbBackground(ctx, size);
  const w = size * 0.28;
  const h = size * 0.38;
  const y = size * 0.28;
  const gap = size * 0.08;
  const startX = (size - w * 2 - gap) / 2;
  ctx.fillStyle = C.blue;
  ctx.fillRect(startX, y, w, h);
  ctx.fillStyle = C.accent;
  ctx.fillRect(startX + w + gap, y, w, h);
  ctx.fillStyle = C.gold;
  ctx.font = `bold ${size * 0.18}px "Tajawal", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+', size / 2, y + h / 2);
}

function drawSpotThumb(ctx, size) {
  drawThumbBackground(ctx, size);
  const w = size * 0.38;
  const h = size * 0.55;
  const y = size * 0.22;
  ctx.fillStyle = C.blue;
  ctx.fillRect(size * 0.1, y, w, h);
  ctx.fillStyle = C.accent;
  ctx.fillRect(size * 0.52, y, w, h);
}

function drawMemoryThumb(ctx, size) {
  drawThumbBackground(ctx, size);
  const cell = size / 4;
  const colors = [C.accent, C.blue, C.success, C.gold];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      ctx.fillStyle = colors[(row + col) % colors.length];
      ctx.fillRect(col * cell + 1, row * cell + 1, cell - 2, cell - 2);
    }
  }
}

function drawCreativeThumb(ctx, size) {
  drawThumbBackground(ctx, size);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(size * 0.65, size * 0.2);
  ctx.lineTo(size * 0.3, size * 0.75);
  ctx.stroke();
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.75);
  ctx.lineTo(size * 0.22, size * 0.62);
  ctx.lineTo(size * 0.38, size * 0.68);
  ctx.closePath();
  ctx.fill();
}

function drawPasswordThumb(ctx, size) {
  drawThumbBackground(ctx, size);
  ctx.fillStyle = C.textSecondary;
  ctx.fillRect(size * 0.35, size * 0.48, size * 0.3, size * 0.28);
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.42, size * 0.14, Math.PI, 0);
  ctx.strokeStyle = C.textSecondary;
  ctx.lineWidth = size * 0.07;
  ctx.stroke();
  ctx.fillStyle = C.surfaceCard;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.58, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

const GAME_REGISTRY = [
  {
    id: 'trivia',
    name: 'الأسئلة العامة',
    screenId: 'trivia-mode-screen',
    start: () => startTriviaModeSelect(),
    drawThumb: drawTriviaThumb,
    enabled: true
  },
  {
    id: 'sentence',
    name: 'رتب الجملة',
    screenId: 'sentence-screen',
    start: () => startSentenceGame(),
    drawThumb: drawSentenceThumb,
    enabled: true
  },
  {
    id: 'picmerge',
    name: 'تحدي الصور',
    screenId: 'picmerge-screen',
    start: () => startPicmergeGame(),
    drawThumb: drawPicmergeThumb,
    enabled: true
  },
  {
    id: 'spot',
    name: 'أوجد الفروق',
    screenId: 'spot-screen',
    start: () => startSpotGame(),
    drawThumb: drawSpotThumb,
    enabled: true
  },
  {
    id: 'memory',
    name: 'الذاكرة البصرية',
    screenId: 'memory-screen',
    start: () => startMemoryGame(),
    drawThumb: drawMemoryThumb,
    enabled: true
  },
  {
    id: 'creative',
    name: 'التحدي الإبداعي',
    screenId: 'creative-screen',
    start: () => startCreativeGame(),
    drawThumb: drawCreativeThumb,
    enabled: true
  },
  {
    id: 'password',
    name: 'كلمة السر',
    screenId: 'password-screen',
    start: () => startPasswordGame(),
    drawThumb: drawPasswordThumb,
    enabled: true
  }
];

function getGameEntry(gameId) {
  return GAME_REGISTRY.find((game) => game.id === gameId);
}

function getPlayableGameIds() {
  return GAME_REGISTRY.filter((game) => game.enabled).map((game) => game.id);
}

function resetSessionScores() {
  gameState.scores = {};
  gameState.teams.forEach((team) => {
    gameState.scores[team] = 0;
  });
}

function resetSessionState() {
  const { session } = gameState;
  session.completedGameIds = [];
  session.surpriseShown = false;
  session.surpriseActive = false;
  session.pendingSurpriseGameId = null;
  session.pendingContinue = null;
  session.lastCompletedGameId = null;
}

const SCORE_SPEED_THRESHOLDS = {
  trivia: 5,
  sentence: 15,
  picmerge: 10,
  memory: 15,
  password: 30
};

function addTeamScore(teamName, points) {
  if (!teamName || points <= 0) return;
  gameState.scores[teamName] = (gameState.scores[teamName] || 0) + points;
}

function awardStandardScore(teamName, elapsedSeconds, gameId) {
  const threshold = SCORE_SPEED_THRESHOLDS[gameId];
  const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, threshold);
  addTeamScore(teamName, points);
  return { points, bonusText };
}

function isSurpriseRound() {
  return gameState.session.surpriseActive === true;
}

function getRoundDuration(baseSeconds) {
  return isSurpriseRound() ? baseSeconds * 2 : baseSeconds;
}

function getCorrectPoints(basePoints = 10) {
  return isSurpriseRound() ? basePoints * 2 : basePoints;
}

function getSpeedBonus(baseBonus = 5) {
  return isSurpriseRound() ? baseBonus * 2 : baseBonus;
}

function getMemorizeDurationMs() {
  return isSurpriseRound() ? MEMORY_MEMORIZE_MS * 2 : MEMORY_MEMORIZE_MS;
}

function calculateSpeedPoints(elapsedSeconds, speedThresholdSeconds) {
  let points = getCorrectPoints();
  let bonusText = '';
  if (elapsedSeconds < speedThresholdSeconds) {
    points += getSpeedBonus();
    bonusText = ` (+${getSpeedBonus()} مكافأة سرعة!)`;
  }
  return { points, bonusText };
}

function awardSpeedPoints(teamName, elapsedSeconds, speedThresholdSeconds) {
  const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, speedThresholdSeconds);
  addTeamScore(teamName, points);
  return { points, bonusText };
}

function getSortedTeamsByScore() {
  return [...gameState.teams].sort(
    (a, b) => (gameState.scores[b] || 0) - (gameState.scores[a] || 0)
  );
}

function getWinningTeams() {
  const sorted = getSortedTeamsByScore();
  if (!sorted.length) return [];
  const topScore = gameState.scores[sorted[0]] || 0;
  return sorted.filter((team) => (gameState.scores[team] || 0) === topScore);
}

function getWinnerLabel() {
  const winners = getWinningTeams();
  if (!winners.length || (gameState.scores[winners[0]] || 0) === 0) {
    return 'لا فائز هذه المرة… الجميع متساوون في… لا شيء!';
  }
  if (winners.length === 1) {
    return `الفائز: ${winners[0]}!`;
  }
  return `تعادل! ${winners.join('، ')}`;
}

function renderScoreBoard(containerEl, options = {}) {
  if (!containerEl) return;

  const { highlightWinner = false } = options;
  const sorted = getSortedTeamsByScore();
  const topScore = sorted.length ? (gameState.scores[sorted[0]] || 0) : 0;

  containerEl.innerHTML = sorted
    .map((team, index) => {
      const score = gameState.scores[team] || 0;
      const isWinner = highlightWinner && score === topScore && topScore > 0;
      const winnerClass = isWinner ? ' score-board-item--winner' : '';
      return `<span class="score-board-item${winnerClass}"><strong>${index + 1}. ${team}</strong>: ${score} نقطة</span>`;
    })
    .join('');
}

function peekNextGameId() {
  const { session } = gameState;
  let index = session.queueIndex;

  while (index + 1 < session.gameQueue.length) {
    index += 1;
    const nextId = session.gameQueue[index];
    if (!session.completedGameIds.includes(nextId)) {
      return nextId;
    }
  }

  return null;
}

function stopAllGameTimers() {
  ['trivia', 'sentence', 'picmerge', 'spot', 'memory', 'creative', 'password'].forEach((g) => {
    const s = gameState[g];
    if (!s) return;
    if (s.timerId) { clearInterval(s.timerId); s.timerId = null; }
    if (s.memorizeTimerId) { clearInterval(s.memorizeTimerId); s.memorizeTimerId = null; }
    if (s.readTimerId) { clearInterval(s.readTimerId); s.readTimerId = null; }
    if (s.feedbackTimeoutId) { clearTimeout(s.feedbackTimeoutId); s.feedbackTimeoutId = null; }
  });
}

function returnToGameSelect() {
  const { session } = gameState;
  session.pendingContinue = null;
  session.pendingSurpriseGameId = null;
  session.surpriseActive = false;
  document.body.classList.remove('surprise-round-active');
  showScreen('game-select-screen');
  renderGameSelectScreen();
}

function returnToWelcomeScreen() {
  clearCelebrationEffects();
  resetSessionState();
  gameState.session.mode = null;
  gameState.session.gameQueue = [];
  gameState.session.queueIndex = 0;
  document.body.classList.remove('surprise-round-active');
  if (typeof resetTaifUsedLines === 'function') resetTaifUsedLines();
  showScreen('welcome-screen');
}

function getPartialResultsContinueLabel() {
  const { session } = gameState;

  if (session.mode === 'single') {
    return 'عرض النتائج النهائية';
  }

  if (!session.surpriseShown && session.completedGameIds.length >= 3) {
    return 'جولة المفاجأة!';
  }

  if (!peekNextGameId()) {
    return 'عرض النتائج النهائية';
  }

  return 'اللعبة التالية';
}

function getPartialResultsSubtitle(completedGameId) {
  const entry = getGameEntry(completedGameId);
  const gameName = entry ? entry.name : completedGameId;
  let text = `انتهت: ${gameName}`;
  const { session } = gameState;

  if (session.mode === 'single') {
    return text;
  }

  if (!session.surpriseShown && session.completedGameIds.length >= 3) {
    return `${text} — القادم: جولة المفاجأة!`;
  }

  const nextId = peekNextGameId();
  if (nextId) {
    const nextEntry = getGameEntry(nextId);
    if (nextEntry) {
      text += ` — القادم: ${nextEntry.name}`;
    }
  } else {
    text += ' — هذه آخر لعبة في الجلسة';
  }

  return text;
}

function getPartialResultsTaifComment(completedGameId) {
  if (hasDistinctLastPlace()) {
    return getTaifMockLine(getLastPlaceTeam());
  }

  return pickTaifLine('partialNeutral');
}

function getSessionEndTaifComment() {
  const winners = getWinningTeams();
  const lastTeam = getLastPlaceTeam();

  if (!winners.length || (gameState.scores[winners[0]] || 0) === 0) {
    return pickTaifLine('sessionEmpty');
  }

  if (winners.length === 1) {
    let text = `مبروك ${winners[0]}! ${pickTaifLine('sessionWin')}`;
    if (lastTeam && lastTeam !== winners[0] && hasDistinctLastPlace()) {
      text += ` ${getTaifMockLine(lastTeam)}`;
    }
    return text;
  }

  return pickTaifLine('sessionTie');
}

function showPartialResultsScreen(completedGameId, onContinue) {
  const { session } = gameState;
  session.pendingContinue = onContinue;
  session.lastCompletedGameId = completedGameId;

  const subtitleEl = document.getElementById('partial-results-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = getPartialResultsSubtitle(completedGameId);
  }

  renderScoreBoard(document.getElementById('partial-results-scores'));

  const continueBtn = document.getElementById('partial-results-continue-btn');
  if (continueBtn) {
    continueBtn.textContent = getPartialResultsContinueLabel();
    continueBtn.hidden = session.mode === 'single';
  }

  showScreen('partial-results-screen');
}

function handlePartialResultsContinue() {
  const { pendingContinue } = gameState.session;
  gameState.session.pendingContinue = null;
  if (pendingContinue) {
    pendingContinue();
  }
}

function pickSurpriseGameId() {
  const { completedGameIds } = gameState.session;
  const unused = getPlayableGameIds().filter((id) => !completedGameIds.includes(id));
  if (unused.length === 0) return null;
  return unused[Math.floor(Math.random() * unused.length)];
}

function getSurpriseTaifText(gameName) {
  const intro = pickTaifLine('surprise');
  return `${intro} التحدي القادم: ${gameName}. استعدوا… أو لا، قراركم!`;
}

function startGameById(gameId) {
  const entry = getGameEntry(gameId);
  if (!entry || !entry.enabled || !entry.start) return;

  document.body.classList.toggle('surprise-round-active', isSurpriseRound());
  showScreen(entry.screenId);
  entry.start();
}

function renderGameSelectScreen() {
  const gridEl = document.getElementById('game-select-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  GAME_REGISTRY.forEach((game) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-select-card';
    if (!game.enabled) {
      card.classList.add('disabled');
    }

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'game-select-thumb';
    thumbWrap.innerHTML = (window.GAME_ICON_SVG && window.GAME_ICON_SVG[game.id]) || '';

    const nameEl = document.createElement('span');
    nameEl.className = 'game-select-name';
    nameEl.textContent = game.enabled ? game.name : `${game.name} (قريباً)`;

    card.appendChild(thumbWrap);
    card.appendChild(nameEl);

    if (game.enabled) {
      card.addEventListener('click', () => startSingleGame(game.id));
    }

    gridEl.appendChild(card);
  });
}

function renderTriviaCategoryScreen() {
  const gridEl = document.getElementById('trivia-category-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  TRIVIA_CATEGORIES.forEach((category) => {
    const hasQuestions = isTriviaCategoryPlayable(category.id);
    const playable = hasQuestions;

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-select-card';
    if (!playable) {
      card.classList.add('disabled');
    }

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'game-select-thumb';
    thumbWrap.innerHTML = (window.TRIVIA_ICON_SVG && window.TRIVIA_ICON_SVG[category.id]) || '';

    const nameEl = document.createElement('span');
    nameEl.className = 'game-select-name';
    nameEl.textContent = playable ? category.name : `${category.name} (قريباً)`;

    card.appendChild(thumbWrap);
    card.appendChild(nameEl);

    if (playable) {
      card.addEventListener('click', () => startTriviaWithCategory(category.id));
    }

    gridEl.appendChild(card);
  });
}

/* ——— أنماط الأسئلة العامة الثلاثة ——— */

function startTriviaModeSelect() {
  renderTriviaModeScreen();
}

function renderTriviaModeScreen() {
  const grid = document.getElementById('trivia-mode-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const modes = [
    {
      id: 'random-all',
      name: 'عشوائي شامل',
      desc: 'أسئلة من جميع الفئات بشكل عشوائي',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(232,67,147,0.15)" stroke="rgba(232,67,147,0.5)" stroke-width="1.5"/><g stroke="#e84393" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 20h4l14 16h4"/><path d="M36 20h4M40 36h-4"/><path d="M14 36l10-8"/><circle cx="38" cy="20" r="2" fill="#e84393"/><circle cx="38" cy="36" r="2" fill="#e84393"/></g></svg>`
    },
    {
      id: 'multi-cat',
      name: 'فئات مختارة',
      desc: 'اختر الفئات التي تريد اللعب فيها',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(112,72,232,0.15)" stroke="rgba(112,72,232,0.5)" stroke-width="1.5"/><g stroke="#7048e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="12" y="16" width="10" height="10" rx="2"/><rect x="12" y="30" width="10" height="10" rx="2"/><path d="M27 21h17M27 35h17"/><path d="M14 21l2 2 4-4M14 35l2 2 4-4" stroke="#7048e8"/></g></svg>`
    },
    {
      id: 'single-cat',
      name: 'فئة واحدة',
      desc: 'اختر فئة محددة للتركيز فيها',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(240,199,94,0.12)" stroke="rgba(240,199,94,0.45)" stroke-width="1.5"/><g stroke="#f0c75e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="28" cy="28" r="14"/><circle cx="28" cy="28" r="7"/><circle cx="28" cy="28" r="2" fill="#f0c75e"/></g></svg>`
    }
  ];

  modes.forEach((mode) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'trivia-mode-card';
    card.innerHTML = `
      <div class="trivia-mode-icon">${mode.svg}</div>
      <div class="trivia-mode-text">
        <span class="trivia-mode-name">${mode.name}</span>
        <span class="trivia-mode-desc">${mode.desc}</span>
      </div>`;
    card.addEventListener('click', () => handleTriviaModeSelect(mode.id));
    grid.appendChild(card);
  });
}

function handleTriviaModeSelect(modeId) {
  gameState.trivia.playMode = modeId;

  if (modeId === 'random-all') {
    gameState.trivia.selectedCategoryIds = TRIVIA_CATEGORIES
      .filter((c) => isTriviaCategoryPlayable(c.id))
      .map((c) => c.id);
    showScreen('trivia-screen');
    startTriviaGame();
  } else if (modeId === 'multi-cat') {
    renderTriviaMultiCategoryScreen();
    showScreen('trivia-multi-cat-screen');
  } else {
    renderTriviaCategoryScreen();
    showScreen('trivia-category-screen');
  }
}

function renderTriviaMultiCategoryScreen() {
  const grid = document.getElementById('trivia-multi-cat-grid');
  const startBtn = document.getElementById('trivia-multi-cat-start-btn');
  if (!grid || !startBtn) return;

  gameState.trivia.selectedCategoryIds = [];
  grid.innerHTML = '';
  startBtn.disabled = true;

  TRIVIA_CATEGORIES.forEach((category) => {
    if (!isTriviaCategoryPlayable(category.id)) return;

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-select-card';
    card.dataset.categoryId = category.id;

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'game-select-thumb';
    thumbWrap.innerHTML = (window.TRIVIA_ICON_SVG && window.TRIVIA_ICON_SVG[category.id]) || '';

    const nameEl = document.createElement('span');
    nameEl.className = 'game-select-name';
    nameEl.textContent = category.name;

    card.appendChild(thumbWrap);
    card.appendChild(nameEl);

    card.addEventListener('click', () => {
      const ids = gameState.trivia.selectedCategoryIds;
      const idx = ids.indexOf(category.id);
      if (idx === -1) {
        ids.push(category.id);
        card.classList.add('trivia-cat-selected');
      } else {
        ids.splice(idx, 1);
        card.classList.remove('trivia-cat-selected');
      }
      startBtn.disabled = ids.length === 0;
    });

    grid.appendChild(card);
  });
}

/* النمط القديم: فئة واحدة (يُبقي التوافق مع أي مسارات أخرى) */
function startTriviaCategorySelect() {
  gameState.trivia.playMode = 'single-cat';
  renderTriviaCategoryScreen();
}

function startTriviaWithCategory(categoryId) {
  if (!isTriviaCategoryPlayable(categoryId)) return;

  gameState.trivia.playMode = 'single-cat';
  gameState.trivia.selectedCategoryId = categoryId;
  showScreen('trivia-screen');
  startTriviaGame();
}

function updateTriviaScreenTitle() {
  const titleEl = document.getElementById('trivia-screen-title');
  if (!titleEl) return;
  const mode = gameState.trivia.playMode;
  if (mode === 'random-all') {
    titleEl.textContent = 'الأسئلة العامة — عشوائي شامل';
  } else if (mode === 'multi-cat') {
    const count = gameState.trivia.selectedCategoryIds.length;
    titleEl.textContent = `الأسئلة العامة — ${count} فئ${count === 1 ? 'ة' : 'ات'}`;
  } else {
    const category = getTriviaCategoryById(gameState.trivia.selectedCategoryId);
    titleEl.textContent = category ? `الأسئلة العامة — ${category.name}` : 'الأسئلة العامة';
  }
}

function startSingleGame(gameId) {
  const entry = getGameEntry(gameId);
  if (!entry || !entry.enabled) return;

  gameState.session.mode = 'single';
  gameState.session.gameQueue = [gameId];
  gameState.session.queueIndex = 0;
  resetSessionScores();
  resetSessionState();
  startGameById(gameId);
}

function startRandomAllGames() {
  gameState.session.mode = 'random-all';
  gameState.session.gameQueue = shuffleArray(getPlayableGameIds());
  gameState.session.queueIndex = 0;
  resetSessionScores();
  resetSessionState();
  startGameById(gameState.session.gameQueue[0]);
}

function showSessionEndScreen() {
  document.body.classList.remove('surprise-round-active');

  const winnerEl = document.getElementById('session-end-winner');
  if (winnerEl) {
    winnerEl.textContent = getWinnerLabel();
  }

  renderScoreBoard(document.getElementById('session-end-scores'), { highlightWinner: true });

  clearCelebrationEffects();
  startCelebrationEffects();
  playVictorySound();

  showScreen('session-end-screen');
}

function advanceSessionQueue() {
  const { session } = gameState;

  while (session.queueIndex + 1 < session.gameQueue.length) {
    session.queueIndex += 1;
    const nextId = session.gameQueue[session.queueIndex];
    if (!session.completedGameIds.includes(nextId)) {
      startGameById(nextId);
      return;
    }
  }

  document.body.classList.remove('surprise-round-active');
  showSessionEndScreen();
}

function startSurpriseGame() {
  const { session } = gameState;
  const gameId = session.pendingSurpriseGameId;
  if (!gameId) {
    advanceSessionQueue();
    return;
  }

  session.surpriseActive = true;
  startGameById(gameId);
}

function startSurpriseIntro() {
  if (surpriseTransitionTimer) {
    clearTimeout(surpriseTransitionTimer);
    surpriseTransitionTimer = null;
  }

  const gameId = pickSurpriseGameId();
  if (!gameId) {
    advanceSessionQueue();
    return;
  }

  const entry = getGameEntry(gameId);
  gameState.session.pendingSurpriseGameId = gameId;

  const gameNameEl = document.getElementById('surprise-game-name');
  if (gameNameEl && entry) {
    gameNameEl.textContent = entry.name;
  }

  document.body.classList.remove('surprise-round-active');
  showScreen('surprise-screen');
  playSurpriseSound();

  const surpriseText = getSurpriseTaifText(entry ? entry.name : '');
  typewriterEffect(surpriseText, () => {
    surpriseTransitionTimer = setTimeout(() => {
      startSurpriseGame();
      surpriseTransitionTimer = null;
    }, 3000);
  });
}

function onGameCompleted(completedId) {
  const { session } = gameState;

  session.completedGameIds.push(completedId);

  showPartialResultsScreen(completedId, () => {
    if (session.mode === 'single') {
      returnToGameSelect();
      return;
    }

    if (session.surpriseActive) {
      session.surpriseActive = false;
      session.pendingSurpriseGameId = null;
      advanceSessionQueue();
      return;
    }

    if (!session.surpriseShown && session.completedGameIds.length >= 3) {
      session.surpriseShown = true;
      startSurpriseIntro();
      return;
    }

    advanceSessionQueue();
  });
}

function clearTriviaTimers() {
  const { trivia } = gameState;
  if (trivia.timerId) {
    clearInterval(trivia.timerId);
    trivia.timerId = null;
  }
  if (trivia.feedbackTimeoutId) {
    clearTimeout(trivia.feedbackTimeoutId);
    trivia.feedbackTimeoutId = null;
  }
}

function isTriviaComplete() {
  return gameState.teams.every(
    (team) => gameState.trivia.teamQuestionCounts[team] >= gameState.trivia.questionsPerTeam
  );
}

function getCurrentTeamName() {
  return gameState.teams[gameState.trivia.currentTeamIndex];
}

function findActiveTeamIndex() {
  const { teams, trivia } = gameState;
  if (teams.length === 0) return -1;

  for (let i = 0; i < teams.length; i += 1) {
    const index = (trivia.currentTeamIndex + i) % teams.length;
    const team = teams[index];
    if (trivia.teamQuestionCounts[team] < trivia.questionsPerTeam) {
      return index;
    }
  }

  return -1;
}

function getNextQuestion() {
  const { trivia } = gameState;

  if (trivia.playMode === 'single-cat') {
    // النمط الثالث: مجمع فئة واحدة بمؤشرات مخلوطة
    const pool = getTriviaQuestionsForCategory(trivia.selectedCategoryId);
    if (pool.length === 0) return null;
    if (trivia.poolPointer >= trivia.shuffledIndices.length) {
      trivia.shuffledIndices = shuffleArray(pool.map((_, index) => index));
      trivia.poolPointer = 0;
    }
    const q = pool[trivia.shuffledIndices[trivia.poolPointer]];
    trivia.poolPointer += 1;
    return q;
  }

  // النمطان الأول والثاني: مجمع مدمج مسطّح
  const pool = trivia.questionPool;
  if (!pool || pool.length === 0) return null;
  if (trivia.poolPointer >= pool.length) {
    trivia.questionPool = shuffleArray([...pool]);
    trivia.poolPointer = 0;
  }
  const q = trivia.questionPool[trivia.poolPointer];
  trivia.poolPointer += 1;
  return q;
}

function updateTriviaScoresDisplay() {
  const scoresEl = document.getElementById('trivia-scores');
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => {
      const score = gameState.scores[team] || 0;
      return `<span class="trivia-score-item"><strong>${team}</strong>: ${score} نقطة</span>`;
    })
    .join('');
}

function hideTriviaFeedback() {
  const feedbackEl = document.getElementById('trivia-feedback');
  if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
  }
}

function showTriviaFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('trivia-feedback');
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.hidden = false;
  feedbackEl.classList.toggle('correct', isCorrect);
  feedbackEl.classList.toggle('incorrect', !isCorrect);
}

function stopTriviaTimer() {
  if (gameState.trivia.timerId) {
    clearInterval(gameState.trivia.timerId);
    gameState.trivia.timerId = null;
  }
  hideTaifGameTimer();
}

function updateTriviaTimerDisplay() {
  const timerEl = document.getElementById('trivia-timer');
  if (!timerEl) return;

  timerEl.textContent = String(gameState.trivia.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.trivia.timeLeft <= 5);
  maybePlayTimerTick(gameState.trivia.timeLeft, 'trivia');
  syncGameTimer('trivia', gameState.trivia.timeLeft, { active: !!gameState.trivia.timerId });
}

function startTriviaTimer() {
  stopTriviaTimer();
  gameState.trivia.timeLeft = getRoundDuration(15);
  updateTriviaTimerDisplay();

  gameState.trivia.timerId = setInterval(() => {
    gameState.trivia.timeLeft -= 1;
    updateTriviaTimerDisplay();

    if (gameState.trivia.timeLeft <= 0) {
      stopTriviaTimer();
      handleTriviaTimeout();
    }
  }, 1000);
}

function disableTriviaOptions() {
  document.querySelectorAll('.trivia-option').forEach((button) => {
    button.disabled = true;
  });
}

function highlightTriviaAnswer(selectedIndex, isCorrect, correctIndex) {
  const buttons = document.querySelectorAll('.trivia-option');
  buttons.forEach((button, index) => {
    if (index === correctIndex) {
      button.classList.add('correct');
    }
    if (index === selectedIndex && !isCorrect) {
      button.classList.add('incorrect');
    }
  });
}

function advanceTriviaTurn() {
  const teamName = getCurrentTeamName();
  gameState.trivia.teamQuestionCounts[teamName] += 1;
  gameState.trivia.currentTeamIndex =
    (gameState.trivia.currentTeamIndex + 1) % gameState.teams.length;
}

function scheduleNextTriviaQuestion() {
  gameState.trivia.feedbackTimeoutId = setTimeout(() => {
    gameState.trivia.feedbackTimeoutId = null;
    showNextTriviaQuestion();
  }, 1500);
}

function handleTriviaAnswer(selectedIndex) {
  if (gameState.trivia.answered) return;

  gameState.trivia.answered = true;
  stopTriviaTimer();
  disableTriviaOptions();

  const question = gameState.trivia.currentQuestion;
  const teamName = getCurrentTeamName();
  const isCorrect = selectedIndex === question.correctIndex;
  const elapsedSeconds = (Date.now() - gameState.trivia.questionStartTime) / 1000;

  highlightTriviaAnswer(selectedIndex, isCorrect, question.correctIndex);

  if (isCorrect) {
    const { points, bonusText } = awardStandardScore(teamName, elapsedSeconds, 'trivia');
    showTriviaFeedback(`صح! +${points} نقطة${bonusText}`, true);
    if (typeof taifQuipCorrect === 'function') taifQuipCorrect();
  } else {
    playLoseSound();
    showTriviaFeedback('خطأ!', false);
  }

  updateTriviaScoresDisplay();
  advanceTriviaTurn();
  scheduleNextTriviaQuestion();
}

function handleTriviaTimeout() {
  if (gameState.trivia.answered) return;

  gameState.trivia.answered = true;
  disableTriviaOptions();

  const question = gameState.trivia.currentQuestion;
  highlightTriviaAnswer(-1, false, question.correctIndex);
  playLoseSound();
  showTriviaFeedback('انتهى الوقت!', false);
  if (typeof taifQuipTimeout === 'function') taifQuipTimeout();

  advanceTriviaTurn();
  scheduleNextTriviaQuestion();
}

function renderTriviaQuestion(question) {
  const teamLabelEl = document.getElementById('trivia-team-label');
  const progressEl = document.getElementById('trivia-progress');
  const questionEl = document.getElementById('trivia-question');
  const optionsEl = document.getElementById('trivia-options');

  const teamName = getCurrentTeamName();
  const answeredCount = gameState.trivia.teamQuestionCounts[teamName];

  if (teamLabelEl) {
    teamLabelEl.textContent = `دور فريق: ${teamName}`;
  }

  if (progressEl) {
    progressEl.textContent = `السؤال ${answeredCount + 1} من ${gameState.trivia.questionsPerTeam}`;
  }

  if (questionEl) {
    questionEl.textContent = question.question;
  }

  if (optionsEl) {
    optionsEl.innerHTML = '';
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'trivia-option';
      button.textContent = option;
      button.addEventListener('click', () => handleTriviaAnswer(index));
      optionsEl.appendChild(button);
    });
  }
}

function showNextTriviaQuestion() {
  clearTriviaTimers();
  hideTriviaFeedback();

  if (isTriviaComplete()) {
    finishTriviaGame();
    return;
  }

  const teamIndex = findActiveTeamIndex();
  if (teamIndex === -1) {
    finishTriviaGame();
    return;
  }

  gameState.trivia.currentTeamIndex = teamIndex;
  gameState.trivia.currentQuestion = getNextQuestion();
  if (!gameState.trivia.currentQuestion) {
    finishTriviaGame();
    return;
  }
  gameState.trivia.answered = false;
  gameState.trivia.questionStartTime = Date.now();

  renderTriviaQuestion(gameState.trivia.currentQuestion);
  updateTriviaScoresDisplay();
  startTriviaTimer();
}

function finishTriviaGame() {
  clearTriviaTimers();
  playGameCompleteSound();
  onGameCompleted('trivia');
}

function clearSentenceTimers() {
  const { sentence } = gameState;
  if (sentence.timerId) {
    clearInterval(sentence.timerId);
    sentence.timerId = null;
  }
  if (sentence.feedbackTimeoutId) {
    clearTimeout(sentence.feedbackTimeoutId);
    sentence.feedbackTimeoutId = null;
  }
}

function isSentenceComplete() {
  return gameState.teams.every(
    (team) => gameState.sentence.teamRoundCounts[team] >= gameState.sentence.roundsPerTeam
  );
}

function getCurrentSentenceTeamName() {
  return gameState.teams[gameState.sentence.currentTeamIndex];
}

function findActiveSentenceTeamIndex() {
  const { teams, sentence } = gameState;
  if (teams.length === 0) return -1;

  for (let i = 0; i < teams.length; i += 1) {
    const index = (sentence.currentTeamIndex + i) % teams.length;
    const team = teams[index];
    if (sentence.teamRoundCounts[team] < sentence.roundsPerTeam) {
      return index;
    }
  }

  return -1;
}

function getNextSentencePuzzle() {
  const { sentence } = gameState;

  if (sentence.poolPointer >= sentence.shuffledIndices.length) {
    sentence.shuffledIndices = shuffleArray(
      SENTENCE_PUZZLES.map((_, index) => index)
    );
    sentence.poolPointer = 0;
  }

  const puzzleIndex = sentence.shuffledIndices[sentence.poolPointer];
  sentence.poolPointer += 1;
  return SENTENCE_PUZZLES[puzzleIndex];
}

function updateSentenceScoresDisplay() {
  const scoresEl = document.getElementById('sentence-scores');
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => {
      const score = gameState.scores[team] || 0;
      return `<span class="sentence-score-item"><strong>${team}</strong>: ${score} نقطة</span>`;
    })
    .join('');
}

function hideSentenceFeedback() {
  const feedbackEl = document.getElementById('sentence-feedback');
  if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
  }
}

function showSentenceFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('sentence-feedback');
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.hidden = false;
  feedbackEl.classList.toggle('correct', isCorrect);
  feedbackEl.classList.toggle('incorrect', !isCorrect);
}

function stopSentenceTimer() {
  if (gameState.sentence.timerId) {
    clearInterval(gameState.sentence.timerId);
    gameState.sentence.timerId = null;
  }
  hideTaifGameTimer();
}

function updateSentenceTimerDisplay() {
  const timerEl = document.getElementById('sentence-timer');
  if (!timerEl) return;

  timerEl.textContent = String(gameState.sentence.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.sentence.timeLeft <= 5);
  maybePlayTimerTick(gameState.sentence.timeLeft, 'sentence');
  syncGameTimer('sentence', gameState.sentence.timeLeft, { active: !!gameState.sentence.timerId });
}

function startSentenceTimer() {
  stopSentenceTimer();
  gameState.sentence.timeLeft = getRoundDuration(30);
  updateSentenceTimerDisplay();

  gameState.sentence.timerId = setInterval(() => {
    gameState.sentence.timeLeft -= 1;
    updateSentenceTimerDisplay();

    if (gameState.sentence.timeLeft <= 0) {
      stopSentenceTimer();
      handleSentenceTimeout();
    }
  }, 1000);
}

function renderSentenceWords() {
  const wordsEl = document.getElementById('sentence-words');
  if (!wordsEl) return;

  wordsEl.innerHTML = '';
  gameState.sentence.currentWords.forEach((word, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sentence-word';
    if (gameState.sentence.selectedWordIndex === index) {
      button.classList.add('selected');
    }
    button.textContent = word;
    button.addEventListener('click', () => handleSentenceWordClick(index));
    wordsEl.appendChild(button);
  });
}

function handleSentenceWordClick(index) {
  if (gameState.sentence.answered) return;

  const { sentence } = gameState;

  if (sentence.selectedWordIndex === null) {
    sentence.selectedWordIndex = index;
    renderSentenceWords();
    return;
  }

  if (sentence.selectedWordIndex === index) {
    sentence.selectedWordIndex = null;
    renderSentenceWords();
    return;
  }

  const swapped = [...sentence.currentWords];
  [swapped[sentence.selectedWordIndex], swapped[index]] = [
    swapped[index],
    swapped[sentence.selectedWordIndex]
  ];
  sentence.currentWords = swapped;
  sentence.selectedWordIndex = null;
  renderSentenceWords();
}

function advanceSentenceTurn() {
  const teamName = getCurrentSentenceTeamName();
  gameState.sentence.teamRoundCounts[teamName] += 1;
  gameState.sentence.currentTeamIndex =
    (gameState.sentence.currentTeamIndex + 1) % gameState.teams.length;
}

function scheduleNextSentenceRound() {
  gameState.sentence.feedbackTimeoutId = setTimeout(() => {
    gameState.sentence.feedbackTimeoutId = null;
    showNextSentenceRound();
  }, 1500);
}

function finishSentenceRoundAfterAnswer(isCorrect, points) {
  gameState.sentence.answered = true;
  stopSentenceTimer();

  const checkBtn = document.getElementById('sentence-check-btn');
  if (checkBtn) {
    checkBtn.disabled = true;
  }

  if (isCorrect) {
    const teamName = getCurrentSentenceTeamName();
    addTeamScore(teamName, points);
    const bonusText = points > getCorrectPoints() ? ` (+${getSpeedBonus()} مكافأة سرعة!)` : '';
    showSentenceFeedback(`صح! +${points} نقطة${bonusText}`, true);
    if (typeof taifQuipCorrect === 'function') taifQuipCorrect();
  } else {
    playLoseSound();
    showSentenceFeedback('خطأ!', false);
  }

  updateSentenceScoresDisplay();
  advanceSentenceTurn();
  scheduleNextSentenceRound();
}

function handleSentenceCheck() {
  if (gameState.sentence.answered) return;

  const { sentence } = gameState;
  const isCorrect =
    sentence.currentWords.join(' ') === sentence.correctWords.join(' ');
  const elapsedSeconds = (Date.now() - sentence.questionStartTime) / 1000;

  if (isCorrect) {
    const teamName = getCurrentSentenceTeamName();
    const { points } = calculateSpeedPoints(elapsedSeconds, SCORE_SPEED_THRESHOLDS.sentence);
    finishSentenceRoundAfterAnswer(true, points);
    return;
  }

  finishSentenceRoundAfterAnswer(false, 0);
}

function handleSentenceTimeout() {
  if (gameState.sentence.answered) return;

  playLoseSound();
  showSentenceFeedback('انتهى الوقت!', false);
  if (typeof taifQuipTimeout === 'function') taifQuipTimeout();
  gameState.sentence.answered = true;

  const checkBtn = document.getElementById('sentence-check-btn');
  if (checkBtn) {
    checkBtn.disabled = true;
  }

  advanceSentenceTurn();
  scheduleNextSentenceRound();
}

function showNextSentenceRound() {
  clearSentenceTimers();
  hideSentenceFeedback();

  if (isSentenceComplete()) {
    finishSentenceGame();
    return;
  }

  const teamIndex = findActiveSentenceTeamIndex();
  if (teamIndex === -1) {
    finishSentenceGame();
    return;
  }

  const puzzle = getNextSentencePuzzle();
  const { sentence } = gameState;

  sentence.currentTeamIndex = teamIndex;
  sentence.correctWords = [...puzzle.words];
  sentence.currentWords = shuffleArray([...puzzle.words]);
  sentence.selectedWordIndex = null;
  sentence.answered = false;
  sentence.questionStartTime = Date.now();

  const teamLabelEl = document.getElementById('sentence-team-label');
  const progressEl = document.getElementById('sentence-progress');
  const teamName = getCurrentSentenceTeamName();
  const roundCount = sentence.teamRoundCounts[teamName];

  if (teamLabelEl) {
    teamLabelEl.textContent = `دور فريق: ${teamName}`;
  }

  if (progressEl) {
    progressEl.textContent = `الجملة ${roundCount + 1} من ${sentence.roundsPerTeam}`;
  }

  const checkBtn = document.getElementById('sentence-check-btn');
  if (checkBtn) {
    checkBtn.disabled = false;
  }

  renderSentenceWords();
  updateSentenceScoresDisplay();
  startSentenceTimer();
}

const MEMORY_ICON_PUZZLES = [
  { answer: 'تفاحة', draw: drawApple },
  { answer: 'شمس', draw: drawSun },
  { answer: 'قمر', draw: drawMoon },
  { answer: 'سيارة', draw: drawCar },
  { answer: 'منزل', draw: drawHouse },
  { answer: 'شجرة', draw: drawTree },
  { answer: 'سمكة', draw: drawFish },
  { answer: 'وردة', draw: drawFlower },
  { answer: 'كتاب', draw: drawBook },
  { answer: 'كرة', draw: drawBall },
  { answer: 'طائرة', draw: drawPlane },
  { answer: 'قلب', draw: drawHeart },
  { answer: 'نجمة', draw: drawStarShape },
  { answer: 'سحابة', draw: drawCloud },
  { answer: 'جبل', draw: drawMountain },
  { answer: 'فراشة', draw: drawButterfly },
  { answer: 'قلم', draw: drawPen },
  { answer: 'كوب', draw: drawCup },
  { answer: 'ساعة', draw: drawClock },
  { answer: 'مظلة', draw: drawUmbrella },
  { answer: 'قطة', draw: drawCat },
  { answer: 'كلب', draw: drawDog },
  { answer: 'طائر', draw: drawBird },
  { answer: 'سفينة', draw: drawShip }
];

function drawApple(ctx, size) {
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.55, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2ed573';
  ctx.fillRect(size * 0.47, size * 0.18, size * 0.06, size * 0.12);
  ctx.beginPath();
  ctx.ellipse(size * 0.56, size * 0.22, size * 0.1, size * 0.05, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSun(ctx, size) {
  ctx.fillStyle = '#ffd32a';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd32a';
  ctx.lineWidth = size * 0.04;
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    ctx.beginPath();
    ctx.moveTo(size * 0.5 + Math.cos(angle) * size * 0.24, size * 0.5 + Math.sin(angle) * size * 0.24);
    ctx.lineTo(size * 0.5 + Math.cos(angle) * size * 0.36, size * 0.5 + Math.sin(angle) * size * 0.36);
    ctx.stroke();
  }
}

function drawMoon(ctx, size) {
  ctx.fillStyle = '#f1f2f6';
  ctx.beginPath();
  ctx.arc(size * 0.52, size * 0.48, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#16213e';
  ctx.beginPath();
  ctx.arc(size * 0.58, size * 0.45, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawCar(ctx, size) {
  ctx.fillStyle = '#3498db';
  ctx.fillRect(size * 0.18, size * 0.45, size * 0.64, size * 0.2);
  ctx.fillRect(size * 0.32, size * 0.32, size * 0.36, size * 0.16);
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(size * 0.3, size * 0.68, size * 0.08, 0, Math.PI * 2);
  ctx.arc(size * 0.7, size * 0.68, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(ctx, size) {
  ctx.fillStyle = '#e67e22';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.22);
  ctx.lineTo(size * 0.78, size * 0.48);
  ctx.lineTo(size * 0.22, size * 0.48);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f5d0c5';
  ctx.fillRect(size * 0.28, size * 0.48, size * 0.44, size * 0.32);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(size * 0.42, size * 0.58, size * 0.16, size * 0.22);
}

function drawTree(ctx, size) {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(size * 0.44, size * 0.52, size * 0.12, size * 0.28);
  ctx.fillStyle = '#2ed573';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.18);
  ctx.lineTo(size * 0.72, size * 0.55);
  ctx.lineTo(size * 0.28, size * 0.55);
  ctx.closePath();
  ctx.fill();
}

function drawFish(ctx, size) {
  ctx.fillStyle = '#ff6b81';
  ctx.beginPath();
  ctx.ellipse(size * 0.48, size * 0.5, size * 0.26, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.72, size * 0.5);
  ctx.lineTo(size * 0.88, size * 0.38);
  ctx.lineTo(size * 0.88, size * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(size * 0.38, size * 0.46, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(ctx, size) {
  ctx.fillStyle = '#2ed573';
  ctx.fillRect(size * 0.48, size * 0.52, size * 0.04, size * 0.28);
  const colors = ['#ff6b81', '#ffd32a', '#ff6b81', '#ffd32a', '#ff6b81'];
  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(
      size * 0.5 + Math.cos(angle) * size * 0.12,
      size * 0.42 + Math.sin(angle) * size * 0.12,
      size * 0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = '#ffd32a';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.42, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

function drawBook(ctx, size) {
  ctx.fillStyle = '#3498db';
  ctx.fillRect(size * 0.28, size * 0.28, size * 0.44, size * 0.48);
  ctx.fillStyle = '#fff';
  ctx.fillRect(size * 0.34, size * 0.34, size * 0.32, size * 0.04);
  ctx.fillRect(size * 0.34, size * 0.42, size * 0.28, size * 0.04);
  ctx.fillRect(size * 0.34, size * 0.5, size * 0.3, size * 0.04);
}

function drawBall(ctx, size) {
  const gradient = ctx.createRadialGradient(size * 0.42, size * 0.38, size * 0.05, size * 0.5, size * 0.5, size * 0.28);
  gradient.addColorStop(0, '#ff6b81');
  gradient.addColorStop(1, '#c0392b');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlane(ctx, size) {
  ctx.fillStyle = '#bdc3c7';
  ctx.beginPath();
  ctx.moveTo(size * 0.15, size * 0.5);
  ctx.lineTo(size * 0.55, size * 0.35);
  ctx.lineTo(size * 0.85, size * 0.5);
  ctx.lineTo(size * 0.55, size * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(size * 0.42, size * 0.28, size * 0.08, size * 0.44);
}

function drawHeart(ctx, size) {
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.68);
  ctx.bezierCurveTo(size * 0.2, size * 0.48, size * 0.2, size * 0.22, size * 0.5, size * 0.38);
  ctx.bezierCurveTo(size * 0.8, size * 0.22, size * 0.8, size * 0.48, size * 0.5, size * 0.68);
  ctx.fill();
}

function drawStarShape(ctx, size) {
  ctx.fillStyle = '#ffd32a';
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / 5;
    ctx.lineTo(size * 0.5 + Math.cos(outerAngle) * size * 0.3, size * 0.5 + Math.sin(outerAngle) * size * 0.3);
    ctx.lineTo(size * 0.5 + Math.cos(innerAngle) * size * 0.14, size * 0.5 + Math.sin(innerAngle) * size * 0.14);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCloud(ctx, size) {
  ctx.fillStyle = '#ecf0f1';
  ctx.beginPath();
  ctx.arc(size * 0.38, size * 0.48, size * 0.12, 0, Math.PI * 2);
  ctx.arc(size * 0.52, size * 0.42, size * 0.14, 0, Math.PI * 2);
  ctx.arc(size * 0.66, size * 0.48, size * 0.12, 0, Math.PI * 2);
  ctx.fillRect(size * 0.3, size * 0.48, size * 0.44, size * 0.1);
}

function drawMountain(ctx, size) {
  ctx.fillStyle = '#7f8c8d';
  ctx.beginPath();
  ctx.moveTo(size * 0.15, size * 0.72);
  ctx.lineTo(size * 0.42, size * 0.28);
  ctx.lineTo(size * 0.58, size * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#95a5a6';
  ctx.beginPath();
  ctx.moveTo(size * 0.38, size * 0.72);
  ctx.lineTo(size * 0.62, size * 0.32);
  ctx.lineTo(size * 0.85, size * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(size * 0.38, size * 0.38);
  ctx.lineTo(size * 0.42, size * 0.28);
  ctx.lineTo(size * 0.46, size * 0.38);
  ctx.closePath();
  ctx.fill();
}

function drawButterfly(ctx, size) {
  ctx.fillStyle = '#9b59b6';
  ctx.beginPath();
  ctx.ellipse(size * 0.32, size * 0.42, size * 0.16, size * 0.22, -0.3, 0, Math.PI * 2);
  ctx.ellipse(size * 0.68, size * 0.42, size * 0.16, size * 0.22, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(size * 0.48, size * 0.32, size * 0.04, size * 0.36);
}

function drawPen(ctx, size) {
  ctx.fillStyle = '#3498db';
  ctx.fillRect(size * 0.3, size * 0.35, size * 0.4, size * 0.1);
  ctx.fillStyle = '#ffd32a';
  ctx.beginPath();
  ctx.moveTo(size * 0.7, size * 0.35);
  ctx.lineTo(size * 0.82, size * 0.4);
  ctx.lineTo(size * 0.7, size * 0.45);
  ctx.closePath();
  ctx.fill();
}

function drawCup(ctx, size) {
  ctx.fillStyle = '#e94560';
  ctx.fillRect(size * 0.32, size * 0.36, size * 0.36, size * 0.36);
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.arc(size * 0.72, size * 0.5, size * 0.1, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(size * 0.38, size * 0.72, size * 0.24, size * 0.06);
}

function drawClock(ctx, size) {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = size * 0.03;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.5);
  ctx.lineTo(size * 0.5, size * 0.32);
  ctx.moveTo(size * 0.5, size * 0.5);
  ctx.lineTo(size * 0.62, size * 0.5);
  ctx.stroke();
}

function drawUmbrella(ctx, size) {
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = size * 0.03;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.32);
  ctx.lineTo(size * 0.5, size * 0.78);
  ctx.stroke();
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.32, size * 0.28, Math.PI, 0);
  ctx.fill();
}

function drawCat(ctx, size) {
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.55, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.32, size * 0.38);
  ctx.lineTo(size * 0.28, size * 0.22);
  ctx.lineTo(size * 0.42, size * 0.32);
  ctx.moveTo(size * 0.68, size * 0.38);
  ctx.lineTo(size * 0.72, size * 0.22);
  ctx.lineTo(size * 0.58, size * 0.32);
  ctx.fill();
}

function drawDog(ctx, size) {
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.55, size * 0.26, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.38, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(size * 0.44, size * 0.36, size * 0.02, 0, Math.PI * 2);
  ctx.arc(size * 0.56, size * 0.36, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
}

function drawBird(ctx, size) {
  ctx.fillStyle = '#3498db';
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.5, size * 0.22, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd32a';
  ctx.beginPath();
  ctx.moveTo(size * 0.68, size * 0.48);
  ctx.lineTo(size * 0.82, size * 0.5);
  ctx.lineTo(size * 0.68, size * 0.52);
  ctx.closePath();
  ctx.fill();
}

function drawShip(ctx, size) {
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.moveTo(size * 0.2, size * 0.58);
  ctx.lineTo(size * 0.8, size * 0.58);
  ctx.lineTo(size * 0.72, size * 0.72);
  ctx.lineTo(size * 0.28, size * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(size * 0.47, size * 0.28, size * 0.06, size * 0.32);
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.moveTo(size * 0.53, size * 0.3);
  ctx.lineTo(size * 0.78, size * 0.48);
  ctx.lineTo(size * 0.53, size * 0.48);
  ctx.closePath();
  ctx.fill();
}

function normalizePicmergeText(text) {
  let normalized = text.trim().replace(/\s+/g, ' ');
  normalized = normalized.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  normalized = normalized.replace(/\u0640/g, '');
  normalized = normalized.replace(/[أإآ]/g, 'ا');
  normalized = normalized.replace(/ؤ/g, 'و');
  normalized = normalized.replace(/ئ/g, 'ي');
  normalized = normalized.replace(/ة/g, 'ه');
  normalized = normalized.replace(/ى/g, 'ي');
  return normalized;
}

function isPicmergeAnswerCorrect(puzzle, inputText) {
  const normalized = normalizePicmergeText(inputText);
  if (!normalized || !puzzle) return false;

  const answers = [puzzle.answer, ...(puzzle.aliases || [])].map(normalizePicmergeText);
  return answers.includes(normalized);
}

function clearPicmergeTimers() {
  stopPicmergeTimer();

  const { picmerge } = gameState;
  if (picmerge.feedbackTimeoutId) {
    clearTimeout(picmerge.feedbackTimeoutId);
    picmerge.feedbackTimeoutId = null;
  }
}

function isPicmergeComplete() {
  return gameState.teams.every(
    (team) => gameState.picmerge.teamRoundCounts[team] >= gameState.picmerge.roundsPerTeam
  );
}

function getCurrentPicmergeTeamName() {
  return gameState.teams[gameState.picmerge.currentTeamIndex];
}

function findActivePicmergeTeamIndex() {
  const { teams, picmerge } = gameState;
  if (teams.length === 0) return -1;

  for (let i = 0; i < teams.length; i += 1) {
    const index = (picmerge.currentTeamIndex + i) % teams.length;
    const team = teams[index];
    if (picmerge.teamRoundCounts[team] < picmerge.roundsPerTeam) {
      return index;
    }
  }

  return -1;
}

function getNextPicmergePuzzle() {
  const pool = typeof PICMERGE_PUZZLES !== 'undefined' ? PICMERGE_PUZZLES : [];
  if (!pool.length) {
    return { id: 'empty', answer: '', image: '', aliases: [] };
  }

  const { picmerge } = gameState;

  if (picmerge.poolPointer >= picmerge.shuffledIndices.length) {
    picmerge.shuffledIndices = shuffleArray(pool.map((_, index) => index));
    picmerge.poolPointer = 0;
  }

  const puzzleIndex = picmerge.shuffledIndices[picmerge.poolPointer];
  picmerge.poolPointer += 1;
  return pool[puzzleIndex];
}

function updatePicmergeScoresDisplay() {
  const scoresEl = document.getElementById('picmerge-scores');
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => {
      const score = gameState.scores[team] || 0;
      return `<span class="picmerge-score-item"><strong>${team}</strong>: ${score} نقطة</span>`;
    })
    .join('');
}

function hidePicmergeFeedback() {
  const feedbackEl = document.getElementById('picmerge-feedback');
  if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
  }
}

function showPicmergeFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('picmerge-feedback');
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.hidden = false;
  feedbackEl.classList.toggle('correct', isCorrect);
  feedbackEl.classList.toggle('incorrect', !isCorrect);
}

function stopPicmergeTimer() {
  if (gameState.picmerge.timerId) {
    clearInterval(gameState.picmerge.timerId);
    gameState.picmerge.timerId = null;
  }
  hideTaifGameTimer();
}

function updatePicmergeTimerDisplay() {
  const timerEl = document.getElementById('picmerge-timer');
  if (!timerEl) return;

  timerEl.textContent = String(gameState.picmerge.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.picmerge.timeLeft <= 5);
  maybePlayTimerTick(gameState.picmerge.timeLeft, 'picmerge');
  syncGameTimer('picmerge', gameState.picmerge.timeLeft, { active: !!gameState.picmerge.timerId });
}

function setPicmergeInputEnabled(enabled) {
  const inputEl = document.getElementById('picmerge-input');
  const submitBtn = document.getElementById('picmerge-submit-btn');
  if (inputEl) inputEl.disabled = !enabled;
  if (submitBtn) submitBtn.disabled = !enabled;
}

function showPicmergeImage(puzzle) {
  const imageEl = document.getElementById('picmerge-image');
  const fallbackEl = document.getElementById('picmerge-image-fallback');
  if (!imageEl || !fallbackEl) return;

  imageEl.hidden = true;
  fallbackEl.hidden = true;

  if (!puzzle?.image) {
    fallbackEl.hidden = false;
    fallbackEl.textContent = 'الصور قادمة قريباً';
    return;
  }

  imageEl.onload = () => {
    imageEl.hidden = false;
    fallbackEl.hidden = true;
  };
  imageEl.onerror = () => {
    imageEl.hidden = true;
    fallbackEl.hidden = false;
    fallbackEl.textContent = 'الصور قادمة قريباً';
  };
  imageEl.src = puzzle.image;
  if (imageEl.complete && imageEl.naturalWidth > 0) {
    imageEl.hidden = false;
    fallbackEl.hidden = true;
  }
}

function startPicmergeTimer() {
  stopPicmergeTimer();
  gameState.picmerge.timeLeft = getRoundDuration(40);
  updatePicmergeTimerDisplay();

  gameState.picmerge.timerId = setInterval(() => {
    gameState.picmerge.timeLeft -= 1;
    updatePicmergeTimerDisplay();

    if (gameState.picmerge.timeLeft <= 0) {
      stopPicmergeTimer();
      handlePicmergeTimeout();
    }
  }, 1000);
}

function advancePicmergeTurn() {
  const teamName = getCurrentPicmergeTeamName();
  gameState.picmerge.teamRoundCounts[teamName] += 1;
  gameState.picmerge.currentTeamIndex =
    (gameState.picmerge.currentTeamIndex + 1) % gameState.teams.length;
}

function scheduleNextPicmergeRound() {
  gameState.picmerge.feedbackTimeoutId = setTimeout(() => {
    gameState.picmerge.feedbackTimeoutId = null;
    showNextPicmergeRound();
  }, 1500);
}

function finishPicmergeRound(isCorrect, points, message) {
  gameState.picmerge.answered = true;
  stopPicmergeTimer();
  setPicmergeInputEnabled(false);

  if (isCorrect) {
    const teamName = getCurrentPicmergeTeamName();
    addTeamScore(teamName, points);
    showPicmergeFeedback(message, true);
    if (typeof taifQuipCorrect === 'function') taifQuipCorrect();
  } else {
    playLoseSound();
    showPicmergeFeedback(message, false);
    if (typeof maybeTaifLoseQuip === 'function') maybeTaifLoseQuip();
  }

  updatePicmergeScoresDisplay();
  advancePicmergeTurn();
  scheduleNextPicmergeRound();
}

function handlePicmergeSubmit() {
  if (gameState.picmerge.answered) return;

  const inputEl = document.getElementById('picmerge-input');
  const guessText = normalizePicmergeText(inputEl?.value || '');
  if (!guessText) return;

  const { picmerge } = gameState;
  const isCorrect = isPicmergeAnswerCorrect(picmerge.currentPuzzle, guessText);
  const elapsedSeconds = (Date.now() - picmerge.questionStartTime) / 1000;

  if (isCorrect) {
    const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, SCORE_SPEED_THRESHOLDS.picmerge);
    finishPicmergeRound(true, points, `صح! +${points} نقطة${bonusText}`);
    return;
  }

  showPicmergeFeedback('خطأ! حاول مرة أخرى', false);
}

function handlePicmergeTimeout() {
  if (gameState.picmerge.answered) return;

  const answer = gameState.picmerge.currentPuzzle?.answer || '';
  finishPicmergeRound(false, 0, `انتهى الوقت! الإجابة: ${answer}`);
  if (typeof taifQuipTimeout === 'function') taifQuipTimeout();
}

function showNextPicmergeRound() {
  clearPicmergeTimers();
  hidePicmergeFeedback();

  if (isPicmergeComplete()) {
    finishPicmergeGame();
    return;
  }

  const teamIndex = findActivePicmergeTeamIndex();
  if (teamIndex === -1) {
    finishPicmergeGame();
    return;
  }

  const puzzle = getNextPicmergePuzzle();
  const { picmerge } = gameState;

  picmerge.currentTeamIndex = teamIndex;
  picmerge.currentPuzzle = puzzle;
  picmerge.answered = false;
  picmerge.questionStartTime = Date.now();

  const teamLabelEl = document.getElementById('picmerge-team-label');
  const progressEl = document.getElementById('picmerge-progress');
  const inputEl = document.getElementById('picmerge-input');
  const teamName = getCurrentPicmergeTeamName();
  const roundCount = picmerge.teamRoundCounts[teamName];

  if (teamLabelEl) {
    teamLabelEl.textContent = `دور فريق: ${teamName}`;
  }

  if (progressEl) {
    progressEl.textContent = `التحدي ${roundCount + 1} من ${picmerge.roundsPerTeam}`;
  }

  if (inputEl) {
    inputEl.value = '';
  }

  showPicmergeImage(puzzle);
  setPicmergeInputEnabled(true);
  updatePicmergeScoresDisplay();
  startPicmergeTimer();
}

function finishPicmergeGame() {
  clearPicmergeTimers();
  playGameCompleteSound();
  onGameCompleted('picmerge');
}

function startPicmergeGame() {
  clearPicmergeTimers();
  hidePicmergeFeedback();

  const pool = typeof PICMERGE_PUZZLES !== 'undefined' ? PICMERGE_PUZZLES : [];
  gameState.picmerge.shuffledIndices = shuffleArray(pool.map((_, index) => index));
  gameState.picmerge.poolPointer = 0;
  gameState.picmerge.currentTeamIndex = 0;
  gameState.picmerge.teamRoundCounts = {};
  gameState.picmerge.answered = false;
  gameState.picmerge.currentPuzzle = null;

  gameState.teams.forEach((team) => {
    gameState.picmerge.teamRoundCounts[team] = 0;
  });

  showNextPicmergeRound();
}

function clearSpotTimers() {
  const { spot } = gameState;
  if (spot.timerId) {
    clearInterval(spot.timerId);
    spot.timerId = null;
  }
  if (spot.feedbackTimeoutId) {
    clearTimeout(spot.feedbackTimeoutId);
    spot.feedbackTimeoutId = null;
  }
}

function isSpotComplete() {
  return gameState.teams.every(
    (team) => gameState.spot.teamRoundCounts[team] >= gameState.spot.roundsPerTeam
  );
}

function getCurrentSpotTeamName() {
  return gameState.teams[gameState.spot.currentTeamIndex];
}

function findActiveSpotTeamIndex() {
  const { teams, spot } = gameState;
  if (teams.length === 0) return -1;

  for (let i = 0; i < teams.length; i += 1) {
    const index = (spot.currentTeamIndex + i) % teams.length;
    const team = teams[index];
    if (spot.teamRoundCounts[team] < spot.roundsPerTeam) {
      return index;
    }
  }

  return -1;
}

function getNextSpotPuzzle() {
  const { spot } = gameState;

  if (spot.poolPointer >= spot.shuffledIndices.length) {
    spot.shuffledIndices = shuffleArray(SPOT_PUZZLES.map((_, index) => index));
    spot.poolPointer = 0;
  }

  const puzzleIndex = spot.shuffledIndices[spot.poolPointer];
  spot.poolPointer += 1;
  return SPOT_PUZZLES[puzzleIndex];
}

function updateSpotScoresDisplay() {
  const scoresEl = document.getElementById('spot-scores');
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => {
      const score = gameState.scores[team] || 0;
      return `<span class="spot-score-item"><strong>${team}</strong>: ${score} \u0646\u0642\u0637\u0629</span>`;
    })
    .join('');
}

function hideSpotFeedback() {
  const feedbackEl = document.getElementById('spot-feedback');
  if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
  }
}

function showSpotFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('spot-feedback');
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.hidden = false;
  feedbackEl.classList.toggle('correct', isCorrect);
  feedbackEl.classList.toggle('incorrect', !isCorrect);
}

function updateSpotTimerDisplay() {
  const timerEl = document.getElementById('spot-timer');
  if (!timerEl) return;

  timerEl.textContent = String(gameState.spot.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.spot.timeLeft <= 5);
  maybePlayTimerTick(gameState.spot.timeLeft, 'spot');
  syncGameTimer('spot', gameState.spot.timeLeft, { active: !!gameState.spot.timerId });
}

function updateSpotFoundCount() {
  const countEl = document.getElementById('spot-found-count');
  if (!countEl) return;

  const found = gameState.spot.foundDiffIndices.length;
  const total = gameState.spot.currentPuzzle ? gameState.spot.currentPuzzle.differences.length : 5;
  countEl.textContent = `${found} / ${total}`;
}

function renderSpotCanvases(puzzle) {
  const leftScene = document.getElementById('spot-left-scene');
  const rightScene = document.getElementById('spot-right-scene');
  if (!leftScene || !rightScene) return;

  if (puzzle.type === 'photo') {
    leftScene.innerHTML = `<img src="${puzzle.base}" class="spot-photo" alt="الأصلية" draggable="false">`;
    rightScene.innerHTML = `<img src="${puzzle.modified}" class="spot-photo" alt="المعدّلة" draggable="false">`;
  } else if (puzzle.type === 'photo-overlay') {
    leftScene.innerHTML = `<img src="${puzzle.base}" class="spot-photo" alt="الأصلية" draggable="false">`;
    rightScene.innerHTML = `<img src="${puzzle.base}" class="spot-photo" alt="المعدّلة" draggable="false"><svg class="spot-overlay-svg" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid meet">${puzzle.overlays}</svg>`;
  } else {
    leftScene.innerHTML = puzzle.base;
    rightScene.innerHTML = puzzle.modified;
  }
}

function clearSpotMarkers() {
  const markersEl = document.getElementById('spot-markers');
  if (markersEl) {
    markersEl.innerHTML = '';
  }
}

function placeSpotMarker(relX, relY, type) {
  const markersEl = document.getElementById('spot-markers');
  if (!markersEl) return;

  const marker = document.createElement('div');
  marker.className = `spot-marker ${type}`;
  marker.style.left = `${relX * 100}%`;
  marker.style.top = `${relY * 100}%`;
  markersEl.appendChild(marker);

  if (type === 'wrong') {
    setTimeout(() => {
      marker.remove();
    }, 800);
  }
}

function getSpotCanvasRelativeCoords(sceneEl, event) {
  const rect = sceneEl.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  return { x, y };
}

function findHitSpotDifference(relX, relY) {
  const { spot } = gameState;
  const puzzle = spot.currentPuzzle;
  if (!puzzle) return -1;

  for (let i = 0; i < puzzle.differences.length; i += 1) {
    if (spot.foundDiffIndices.includes(i)) continue;

    const diff = puzzle.differences[i];
    const dx = relX - diff.x;
    const dy = relY - diff.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= diff.r) {
      return i;
    }
  }

  return -1;
}

function stopSpotTimer() {
  if (gameState.spot.timerId) {
    clearInterval(gameState.spot.timerId);
    gameState.spot.timerId = null;
  }
  hideTaifGameTimer();
}

function startSpotTimer() {
  stopSpotTimer();
  gameState.spot.timeLeft = getRoundDuration(60);
  updateSpotTimerDisplay();

  gameState.spot.timerId = setInterval(() => {
    gameState.spot.timeLeft -= 1;
    updateSpotTimerDisplay();

    if (gameState.spot.timeLeft <= 0) {
      stopSpotTimer();
      handleSpotTimeout();
    }
  }, 1000);
}

function advanceSpotTurn() {
  const teamName = getCurrentSpotTeamName();
  gameState.spot.teamRoundCounts[teamName] += 1;
  gameState.spot.currentTeamIndex =
    (gameState.spot.currentTeamIndex + 1) % gameState.teams.length;
}

function scheduleNextSpotRound() {
  gameState.spot.feedbackTimeoutId = setTimeout(() => {
    gameState.spot.feedbackTimeoutId = null;
    showNextSpotRound();
  }, 1500);
}

function finishSpotRound(message, isSuccess) {
  gameState.spot.roundActive = false;
  stopSpotTimer();
  showSpotFeedback(message, isSuccess);
  updateSpotScoresDisplay();
  advanceSpotTurn();
  scheduleNextSpotRound();
}

function handleSpotCanvasClick(event) {
  const { spot } = gameState;
  if (!spot.roundActive || !spot.currentPuzzle) return;

  const sceneEl = document.getElementById('spot-left-scene');
  if (!sceneEl) return;

  const { x, y } = getSpotCanvasRelativeCoords(sceneEl, event);
  if (x < 0 || x > 1 || y < 0 || y > 1) return;

  const hitIndex = findHitSpotDifference(x, y);

  if (hitIndex === -1) {
    placeSpotMarker(x, y, 'wrong');
    return;
  }

  const diff = spot.currentPuzzle.differences[hitIndex];
  spot.foundDiffIndices.push(hitIndex);
  placeSpotMarker(diff.x, diff.y, 'correct');

  const teamName = getCurrentSpotTeamName();
  const points = getCorrectPoints();
  addTeamScore(teamName, points);
  updateSpotScoresDisplay();
  updateSpotFoundCount();
  showSpotFeedback(`\u0635\u062d! +${points} \u0646\u0642\u0627\u0637`, true);

  if (spot.foundDiffIndices.length >= spot.currentPuzzle.differences.length) {
    finishSpotRound('\u0623\u062d\u0633\u0646\u062a! \u0648\u062c\u062f\u062a \u062c\u0645\u064a\u0639 \u0627\u0644\u0641\u0631\u0648\u0642', true);
  }
}

function handleSpotTimeout() {
  if (!gameState.spot.roundActive) return;

  const found = gameState.spot.foundDiffIndices.length;
  const total = gameState.spot.currentPuzzle ? gameState.spot.currentPuzzle.differences.length : 5;
  const success = found >= total;
  const message = success
    ? '\u0623\u062d\u0633\u0646\u062a! \u0648\u062c\u062f\u062a \u062c\u0645\u064a\u0639 \u0627\u0644\u0641\u0631\u0648\u0642'
    : `\u0627\u0646\u062a\u0647\u0649 \u0627\u0644\u0648\u0642\u062a! \u0648\u062c\u062f\u062a ${found} \u0645\u0646 ${total}`;
  if (!success) {
    playLoseSound();
  }
  finishSpotRound(message, success);
}

function showNextSpotRound() {
  clearSpotTimers();
  hideSpotFeedback();

  if (isSpotComplete()) {
    finishSpotGame();
    return;
  }

  const teamIndex = findActiveSpotTeamIndex();
  if (teamIndex === -1) {
    finishSpotGame();
    return;
  }

  const puzzle = getNextSpotPuzzle();
  const { spot } = gameState;

  spot.currentTeamIndex = teamIndex;
  spot.currentPuzzle = puzzle;
  spot.foundDiffIndices = [];
  spot.roundActive = true;

  const teamLabelEl = document.getElementById('spot-team-label');
  const progressEl = document.getElementById('spot-progress');
  const teamName = getCurrentSpotTeamName();
  const roundCount = spot.teamRoundCounts[teamName];

  if (teamLabelEl) {
    teamLabelEl.textContent = `\u062f\u0648\u0631 \u0641\u0631\u064a\u0642: ${teamName}`;
  }

  if (progressEl) {
    progressEl.textContent = `\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 ${roundCount + 1} \u0645\u0646 ${spot.roundsPerTeam} \u2014 ${puzzle.title}`;
  }

  clearSpotMarkers();
  renderSpotCanvases(puzzle);
  updateSpotFoundCount();
  updateSpotScoresDisplay();
  startSpotTimer();
}

const MEMORY_GRID_SIZE = 4;
const MEMORY_CELL_COUNT = MEMORY_GRID_SIZE * MEMORY_GRID_SIZE;
const MEMORY_ICON_SIZE = 80;
const MEMORY_MEMORIZE_MS = 5000;

function clearMemoryTimers() {
  taifExitGridMode();
  setTaifLayout('compact');
  const { memory } = gameState;
  if (memory.memorizeTimerId) {
    clearTimeout(memory.memorizeTimerId);
    memory.memorizeTimerId = null;
  }
  if (memory.timerId) {
    clearInterval(memory.timerId);
    memory.timerId = null;
  }
  if (memory.feedbackTimeoutId) {
    clearTimeout(memory.feedbackTimeoutId);
    memory.feedbackTimeoutId = null;
  }
}

function isMemoryComplete() {
  return gameState.teams.every(
    (team) => gameState.memory.teamRoundCounts[team] >= gameState.memory.roundsPerTeam
  );
}

function getCurrentMemoryTeamName() {
  return gameState.teams[gameState.memory.currentTeamIndex];
}

function findActiveMemoryTeamIndex() {
  const { teams, memory } = gameState;
  if (teams.length === 0) return -1;

  for (let i = 0; i < teams.length; i += 1) {
    const index = (memory.currentTeamIndex + i) % teams.length;
    const team = teams[index];
    if (memory.teamRoundCounts[team] < memory.roundsPerTeam) {
      return index;
    }
  }

  return -1;
}

function getNextMemoryRoundOrder() {
  const { memory } = gameState;

  if (memory.poolPointer >= memory.shuffledRoundSeeds.length) {
    memory.shuffledRoundSeeds = shuffleArray(
      MEMORY_ICON_PUZZLES.map((_, index) => index)
    );
    memory.poolPointer = 0;
  }

  const seedIndex = memory.shuffledRoundSeeds[memory.poolPointer];
  memory.poolPointer += 1;

  const allIndices = MEMORY_ICON_PUZZLES.map((_, index) => index);
  const withoutSeed = allIndices.filter((index) => index !== seedIndex);
  const shuffledRest = shuffleArray(withoutSeed);
  const selected = [seedIndex, ...shuffledRest.slice(0, MEMORY_CELL_COUNT - 1)];

  return shuffleArray(selected);
}

function updateMemoryScoresDisplay() {
  const scoresEl = document.getElementById('memory-scores');
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => {
      const score = gameState.scores[team] || 0;
      return `<span class="memory-score-item"><strong>${team}</strong>: ${score} نقطة</span>`;
    })
    .join('');
}

function hideMemoryFeedback() {
  const feedbackEl = document.getElementById('memory-feedback');
  if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
  }
}

function showMemoryFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('memory-feedback');
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.hidden = false;
  feedbackEl.classList.toggle('correct', isCorrect);
  feedbackEl.classList.toggle('incorrect', !isCorrect);
}

function updateMemoryTimerDisplay() {
  const timerEl = document.getElementById('memory-timer');
  if (!timerEl) return;

  timerEl.textContent = String(gameState.memory.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.memory.timeLeft <= 5);
  maybePlayTimerTick(gameState.memory.timeLeft, 'memory');
  syncGameTimer('memory', gameState.memory.timeLeft, {
    active: !!gameState.memory.timerId && gameState.memory.phase === 'play'
  });
}

function setMemoryPhaseUI(phase) {
  const timerEl = document.getElementById('memory-timer');
  const checkBtn = document.getElementById('memory-check-btn');
  const hintEl = document.getElementById('memory-phase-hint');

  if (phase === 'memorize') {
    if (timerEl) timerEl.hidden = true;
    if (checkBtn) checkBtn.hidden = true;
    if (hintEl) hintEl.textContent = 'احفظ ترتيب الصور!';
    hideTaifGameTimer();
  } else if (phase === 'play') {
    if (timerEl) timerEl.hidden = false;
    if (checkBtn) {
      checkBtn.hidden = false;
      checkBtn.disabled = false;
    }
    if (hintEl) {
      hintEl.textContent = 'انقر على الخلايا الفارغة لإظهار الصور، ثم بدّل مواقعها لإعادة الترتيب الأصلي';
    }
  }
}

function drawMemoryIcon(canvas, puzzleIndex) {
  const puzzle = MEMORY_ICON_PUZZLES[puzzleIndex];
  if (!puzzle) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(MEMORY_ICON_SIZE * dpr);
  canvas.height = Math.round(MEMORY_ICON_SIZE * dpr);
  canvas.style.width = `${MEMORY_ICON_SIZE}px`;
  canvas.style.height = `${MEMORY_ICON_SIZE}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = C.surfaceCard;
  ctx.fillRect(0, 0, MEMORY_ICON_SIZE, MEMORY_ICON_SIZE);
  puzzle.draw(ctx, MEMORY_ICON_SIZE);
}

function isMemoryCellVisible(index) {
  const { memory } = gameState;
  return memory.phase === 'memorize' || memory.revealedCells[index];
}

function renderMemoryGrid() {
  const gridEl = document.getElementById('memory-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';
  const { memory } = gameState;
  const order = memory.phase === 'memorize' ? memory.correctOrder : memory.currentOrder;

  for (let i = 0; i < MEMORY_CELL_COUNT; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-cell';
    button.dataset.index = String(i);

    const visible = isMemoryCellVisible(i);
    if (!visible) {
      button.classList.add('hidden');
    }
    if (memory.selectedCellIndex === i) {
      button.classList.add('selected');
    }

    if (visible) {
      const canvas = document.createElement('canvas');
      drawMemoryIcon(canvas, order[i]);
      button.appendChild(canvas);
    }

    button.addEventListener('click', () => handleMemoryCellClick(i));
    gridEl.appendChild(button);
  }
}

function stopMemoryTimer() {
  if (gameState.memory.timerId) {
    clearInterval(gameState.memory.timerId);
    gameState.memory.timerId = null;
  }
  hideTaifGameTimer();
}

function startMemoryTimer() {
  stopMemoryTimer();
  gameState.memory.timeLeft = getRoundDuration(30);
  updateMemoryTimerDisplay();

  gameState.memory.timerId = setInterval(() => {
    gameState.memory.timeLeft -= 1;
    updateMemoryTimerDisplay();

    if (gameState.memory.timeLeft <= 0) {
      stopMemoryTimer();
      handleMemoryTimeout();
    }
  }, 1000);
}

function startMemoryMemorizePhase() {
  const { memory } = gameState;

  memory.phase = 'memorize';
  memory.revealedCells = Array(MEMORY_CELL_COUNT).fill(false);
  memory.selectedCellIndex = null;
  memory.answered = false;

  setMemoryPhaseUI('memorize');
  hideMemoryFeedback();
  renderMemoryGrid();

  requestAnimationFrame(() => {
    const gridEl = document.getElementById('memory-grid');
    if (gridEl) {
      taifEnterGridMode(gridEl, MEMORY_GRID_SIZE);
      startTaifGridWalk(gridEl, MEMORY_GRID_SIZE, 1400);
    }
  });

  if (memory.memorizeTimerId) {
    clearTimeout(memory.memorizeTimerId);
  }

  memory.memorizeTimerId = setTimeout(() => {
    memory.memorizeTimerId = null;
    startMemoryPlayPhase();
  }, getMemorizeDurationMs());
}

function startMemoryPlayPhase() {
  const { memory } = gameState;

  stopTaifGridWalk();
  resetTaifActorPosition();
  setTaifLayout('compact');

  memory.phase = 'play';
  memory.currentOrder = shuffleArray([...memory.correctOrder]);
  memory.revealedCells = Array(MEMORY_CELL_COUNT).fill(false);
  memory.selectedCellIndex = null;
  memory.questionStartTime = Date.now();
  memory.answered = false;

  setMemoryPhaseUI('play');
  renderMemoryGrid();
  startMemoryTimer();
}

function handleMemoryCellClick(index) {
  const { memory } = gameState;
  if (memory.phase !== 'play' || memory.answered) return;

  if (!memory.revealedCells[index]) {
    memory.revealedCells[index] = true;
    memory.selectedCellIndex = null;
    renderMemoryGrid();
    return;
  }

  if (memory.selectedCellIndex === null) {
    memory.selectedCellIndex = index;
    renderMemoryGrid();
    return;
  }

  if (memory.selectedCellIndex === index) {
    memory.selectedCellIndex = null;
    renderMemoryGrid();
    return;
  }

  const swapped = [...memory.currentOrder];
  [swapped[memory.selectedCellIndex], swapped[index]] = [
    swapped[index],
    swapped[memory.selectedCellIndex]
  ];
  memory.currentOrder = swapped;
  memory.selectedCellIndex = null;
  renderMemoryGrid();
}

function advanceMemoryTurn() {
  const teamName = getCurrentMemoryTeamName();
  gameState.memory.teamRoundCounts[teamName] += 1;
  gameState.memory.currentTeamIndex =
    (gameState.memory.currentTeamIndex + 1) % gameState.teams.length;
}

function scheduleNextMemoryRound() {
  gameState.memory.feedbackTimeoutId = setTimeout(() => {
    gameState.memory.feedbackTimeoutId = null;
    showNextMemoryRound();
  }, 1500);
}

function finishMemoryRoundAfterAnswer(isCorrect, points) {
  const { memory } = gameState;
  memory.answered = true;
  stopMemoryTimer();

  const checkBtn = document.getElementById('memory-check-btn');
  if (checkBtn) {
    checkBtn.disabled = true;
  }

  if (isCorrect) {
    const teamName = getCurrentMemoryTeamName();
    addTeamScore(teamName, points);
    const bonusText = points > getCorrectPoints() ? ` (+${getSpeedBonus()} مكافأة سرعة!)` : '';
    showMemoryFeedback(`صح! +${points} نقطة${bonusText}`, true);
  } else {
    showMemoryFeedback('خطأ!', false);
  }

  updateMemoryScoresDisplay();
  advanceMemoryTurn();
  scheduleNextMemoryRound();
}

function handleMemoryCheck() {
  if (gameState.memory.answered || gameState.memory.phase !== 'play') return;

  const { memory } = gameState;
  const isCorrect = memory.currentOrder.every(
    (value, index) => value === memory.correctOrder[index]
  );
  const elapsedSeconds = (Date.now() - memory.questionStartTime) / 1000;

  if (isCorrect) {
    const { points } = calculateSpeedPoints(elapsedSeconds, SCORE_SPEED_THRESHOLDS.memory);
    finishMemoryRoundAfterAnswer(true, points);
    return;
  }

  showMemoryFeedback('خطأ! حاول مرة أخرى', false);
}

function handleMemoryTimeout() {
  if (gameState.memory.answered || gameState.memory.phase !== 'play') return;

  gameState.memory.answered = true;
  stopMemoryTimer();

  const checkBtn = document.getElementById('memory-check-btn');
  if (checkBtn) {
    checkBtn.disabled = true;
  }

  showMemoryFeedback('انتهى الوقت!', false);
  if (typeof taifQuipTimeout === 'function') taifQuipTimeout();
  playLoseSound();
  updateMemoryScoresDisplay();
  advanceMemoryTurn();
  scheduleNextMemoryRound();
}

function showNextMemoryRound() {
  clearMemoryTimers();
  hideMemoryFeedback();

  if (isMemoryComplete()) {
    finishMemoryGame();
    return;
  }

  const teamIndex = findActiveMemoryTeamIndex();
  if (teamIndex === -1) {
    finishMemoryGame();
    return;
  }

  const { memory } = gameState;
  memory.currentTeamIndex = teamIndex;
  memory.correctOrder = getNextMemoryRoundOrder();
  memory.currentOrder = [...memory.correctOrder];
  memory.revealedCells = Array(MEMORY_CELL_COUNT).fill(false);
  memory.selectedCellIndex = null;
  memory.phase = 'idle';
  memory.answered = false;

  const teamLabelEl = document.getElementById('memory-team-label');
  const progressEl = document.getElementById('memory-progress');
  const teamName = getCurrentMemoryTeamName();
  const roundCount = memory.teamRoundCounts[teamName];

  if (teamLabelEl) {
    teamLabelEl.textContent = `دور فريق: ${teamName}`;
  }

  if (progressEl) {
    progressEl.textContent = `الجولة ${roundCount + 1} من ${memory.roundsPerTeam}`;
  }

  updateMemoryScoresDisplay();
  startMemoryMemorizePhase();
}

const CREATIVE_CANVAS_WIDTH = 400;
const CREATIVE_CANVAS_HEIGHT = 280;

const CREATIVE_CHALLENGES = [
  { prompt: 'ارسم شجرة جميلة', type: 'draw' },
  { prompt: 'اكتب قصة قصيرة (3 جمل) عن رحلة إلى الفضاء', type: 'text' },
  { prompt: 'ارسم منزلاً مع حديقة', type: 'draw' },
  { prompt: 'اكتب وصفاً ليومك المثالي', type: 'text' },
  { prompt: 'ارسم وجهاً مبتسماً', type: 'draw' },
  { prompt: 'اكتب قصيدة من بيتين عن الصداقة', type: 'text' },
  { prompt: 'ارسم سيارة', type: 'draw' },
  { prompt: 'اكتب نصيحة مفيدة للحياة', type: 'text' },
  { prompt: 'ارسم شمساً وسحابة', type: 'draw' },
  { prompt: 'اكتب عن حيوانك المفضل ولماذا', type: 'text' },
  { prompt: 'ارسم قلباً وزهرة', type: 'draw' },
  { prompt: 'اكتب قائمة بثلاثة أشياء تشكر الله عليها', type: 'text' },
  { prompt: 'ارسم سفينة في البحر', type: 'draw' },
  { prompt: 'اكتب حواراً قصيراً بين شخصين', type: 'text' }
];

function clearCreativeTimers() {
  const { creative } = gameState;
  if (creative.timerId) {
    clearInterval(creative.timerId);
    creative.timerId = null;
  }
  if (creative.feedbackTimeoutId) {
    clearTimeout(creative.feedbackTimeoutId);
    creative.feedbackTimeoutId = null;
  }
}

function isCreativeComplete() {
  return gameState.teams.every(
    (team) => gameState.creative.teamRoundCounts[team] >= gameState.creative.roundsPerTeam
  );
}

function getCurrentCreativeTeamName() {
  return gameState.teams[gameState.creative.currentTeamIndex];
}

function getCreativeEvaluatorTeamName() {
  return gameState.teams[gameState.creative.evaluatorTeamIndex];
}

function findActiveCreativeTeamIndex() {
  const { teams, creative } = gameState;
  if (teams.length === 0) return -1;

  for (let i = 0; i < teams.length; i += 1) {
    const index = (creative.currentTeamIndex + i) % teams.length;
    const team = teams[index];
    if (creative.teamRoundCounts[team] < creative.roundsPerTeam) {
      return index;
    }
  }

  return -1;
}

function getNextCreativeChallenge() {
  const { creative } = gameState;

  if (creative.poolPointer >= creative.shuffledIndices.length) {
    creative.shuffledIndices = shuffleArray(
      CREATIVE_CHALLENGES.map((_, index) => index)
    );
    creative.poolPointer = 0;
  }

  const challengeIndex = creative.shuffledIndices[creative.poolPointer];
  creative.poolPointer += 1;
  return CREATIVE_CHALLENGES[challengeIndex];
}

function updateCreativeScoresDisplay() {
  const scoresEl = document.getElementById('creative-scores');
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => {
      const score = gameState.scores[team] || 0;
      return `<span class="creative-score-item"><strong>${team}</strong>: ${score} نقطة</span>`;
    })
    .join('');
}

function hideCreativeFeedback() {
  const feedbackEl = document.getElementById('creative-feedback');
  if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
  }
}

function showCreativeFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('creative-feedback');
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.hidden = false;
  feedbackEl.classList.toggle('correct', isCorrect);
  feedbackEl.classList.toggle('incorrect', !isCorrect);
}

function updateCreativeTimerDisplay() {
  const timerEl = document.getElementById('creative-timer');
  if (!timerEl) return;

  timerEl.textContent = String(gameState.creative.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.creative.timeLeft <= 5);
  maybePlayTimerTick(gameState.creative.timeLeft, 'creative');
  syncGameTimer('creative', gameState.creative.timeLeft, {
    active: !!gameState.creative.timerId && gameState.creative.phase !== 'rate'
  });
}

function getCreativeDrawCanvas() {
  return document.getElementById('creative-draw-canvas');
}

function initCreativeDrawCanvas() {
  const canvas = getCreativeDrawCanvas();
  if (!canvas || gameState.creative.drawListenersBound) return;

  canvas.width = CREATIVE_CANVAS_WIDTH;
  canvas.height = CREATIVE_CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, CREATIVE_CANVAS_WIDTH, CREATIVE_CANVAS_HEIGHT);

  const getCanvasPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  canvas.addEventListener('mousedown', (event) => {
    if (gameState.creative.phase !== 'create') return;
    gameState.creative.isDrawing = true;
    const { x, y } = getCanvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!gameState.creative.isDrawing || gameState.creative.phase !== 'create') return;
    const { x, y } = getCanvasPoint(event);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  const stopDrawing = () => {
    gameState.creative.isDrawing = false;
  };

  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  gameState.creative.drawListenersBound = true;
}

function clearCreativeCanvas() {
  const canvas = getCreativeDrawCanvas();
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setCreativeCreateInputsEnabled(enabled) {
  const inputEl = document.getElementById('creative-answer-input');
  const doneBtn = document.getElementById('creative-done-btn');
  const clearBtn = document.getElementById('creative-clear-btn');
  const canvas = getCreativeDrawCanvas();

  if (inputEl) inputEl.disabled = !enabled;
  if (doneBtn) doneBtn.disabled = !enabled;
  if (clearBtn) clearBtn.disabled = !enabled;
  if (canvas) {
    canvas.style.pointerEvents = enabled ? 'auto' : 'none';
  }
}

function updateCreativeChallengeUI(challenge) {
  const challengeEl = document.getElementById('creative-challenge');
  const inputEl = document.getElementById('creative-answer-input');
  const drawWrap = document.getElementById('creative-draw-wrap');

  if (challengeEl) {
    challengeEl.textContent = challenge.prompt;
  }

  const isDraw = challenge.type === 'draw';
  if (inputEl) {
    inputEl.hidden = isDraw;
    inputEl.value = '';
  }
  if (drawWrap) {
    drawWrap.hidden = !isDraw;
  }
  if (isDraw) {
    initCreativeDrawCanvas();
    clearCreativeCanvas();
  }
}

function stopCreativeTimer() {
  if (gameState.creative.timerId) {
    clearInterval(gameState.creative.timerId);
    gameState.creative.timerId = null;
  }
  hideTaifGameTimer();
}

function startCreativeTimer() {
  stopCreativeTimer();
  gameState.creative.timeLeft = getRoundDuration(60);
  updateCreativeTimerDisplay();

  gameState.creative.timerId = setInterval(() => {
    gameState.creative.timeLeft -= 1;
    updateCreativeTimerDisplay();

    if (gameState.creative.timeLeft <= 0) {
      stopCreativeTimer();
      handleCreativeTimeout();
    }
  }, 1000);
}

function setCreativePhaseUI(phase) {
  const createSection = document.getElementById('creative-create-section');
  const rateSection = document.getElementById('creative-rate-section');
  const timerEl = document.getElementById('creative-timer');

  if (createSection) {
    createSection.hidden = phase === 'rate';
  }
  if (rateSection) {
    rateSection.hidden = phase !== 'rate';
  }
  if (timerEl) {
    timerEl.hidden = phase === 'rate';
  }
  if (phase === 'rate') {
    hideTaifGameTimer();
  }
}

function captureCreativeAnswer() {
  const { creative } = gameState;
  if (creative.currentChallenge?.type === 'text') {
    const inputEl = document.getElementById('creative-answer-input');
    creative.answerText = inputEl?.value.trim() || '';
    return;
  }

  const canvas = getCreativeDrawCanvas();
  creative.answerText = canvas ? canvas.toDataURL('image/png') : '';
}

function renderCreativeAnswerPreview() {
  const previewEl = document.getElementById('creative-answer-preview');
  if (!previewEl) return;

  const { creative } = gameState;
  previewEl.innerHTML = '';

  if (creative.currentChallenge?.type === 'draw') {
    const img = document.createElement('img');
    img.src = creative.answerText || '';
    img.alt = 'رسم الفريق';
    previewEl.appendChild(img);
    return;
  }

  previewEl.textContent = creative.answerText || '(لا توجد إجابة)';
}

function renderCreativeRatingButtons() {
  const container = document.getElementById('creative-rating-buttons');
  if (!container) return;

  container.innerHTML = '';

  for (let score = 1; score <= 10; score += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'creative-rating-btn';
    button.textContent = String(score);
    button.addEventListener('click', () => handleCreativeRating(score));
    container.appendChild(button);
  }
}

function startCreativeRatePhase() {
  const { creative } = gameState;
  if (creative.phase === 'rate') return;

  creative.phase = 'rate';
  stopCreativeTimer();
  captureCreativeAnswer();
  setCreativeCreateInputsEnabled(false);
  setCreativePhaseUI('rate');
  renderCreativeAnswerPreview();
  renderCreativeRatingButtons();
  creative.rated = false;
}

function handleCreativeDone() {
  if (gameState.creative.phase !== 'create') return;
  startCreativeRatePhase();
}

function handleCreativeTimeout() {
  if (gameState.creative.phase !== 'create') return;
  playLoseSound();
  startCreativeRatePhase();
}

function advanceCreativeTurn() {
  const teamName = getCurrentCreativeTeamName();
  gameState.creative.teamRoundCounts[teamName] += 1;
  gameState.creative.currentTeamIndex =
    (gameState.creative.currentTeamIndex + 1) % gameState.teams.length;
}

function scheduleNextCreativeRound() {
  gameState.creative.feedbackTimeoutId = setTimeout(() => {
    gameState.creative.feedbackTimeoutId = null;
    showNextCreativeRound();
  }, 1500);
}

function handleCreativeRating(score) {
  const { creative } = gameState;
  if (creative.phase !== 'rate' || creative.rated) return;

  creative.rated = true;
  const creatorName = getCurrentCreativeTeamName();
  const awardedScore = score * (isSurpriseRound() ? 2 : 1);
  addTeamScore(creatorName, awardedScore);

  const ratingButtons = document.querySelectorAll('.creative-rating-btn');
  ratingButtons.forEach((btn) => {
    btn.disabled = true;
  });

  showCreativeFeedback(`+${awardedScore} نقطة لفريق ${creatorName}`, true);
  updateCreativeScoresDisplay();
  advanceCreativeTurn();
  scheduleNextCreativeRound();
}

function startCreativeCreatePhase() {
  const { creative } = gameState;

  creative.phase = 'create';
  creative.answerText = '';
  creative.rated = false;
  hideCreativeFeedback();
  setCreativePhaseUI('create');
  updateCreativeChallengeUI(creative.currentChallenge);
  setCreativeCreateInputsEnabled(true);
  startCreativeTimer();
}

function showNextCreativeRound() {
  clearCreativeTimers();
  hideCreativeFeedback();

  if (isCreativeComplete()) {
    finishCreativeGame();
    return;
  }

  const teamIndex = findActiveCreativeTeamIndex();
  if (teamIndex === -1) {
    finishCreativeGame();
    return;
  }

  const { creative, teams } = gameState;
  creative.currentTeamIndex = teamIndex;
  creative.evaluatorTeamIndex = (teamIndex + 1) % teams.length;
  creative.currentChallenge = getNextCreativeChallenge();
  creative.phase = 'idle';

  const creatorLabelEl = document.getElementById('creative-creator-label');
  const evaluatorLabelEl = document.getElementById('creative-evaluator-label');
  const progressEl = document.getElementById('creative-progress');
  const creatorName = getCurrentCreativeTeamName();
  const evaluatorName = getCreativeEvaluatorTeamName();
  const roundCount = creative.teamRoundCounts[creatorName];

  if (creatorLabelEl) {
    creatorLabelEl.textContent = `فريق منشئ: ${creatorName}`;
  }
  if (evaluatorLabelEl) {
    evaluatorLabelEl.textContent = `فريق المقيّم: ${evaluatorName}`;
  }
  if (progressEl) {
    progressEl.textContent = `التحدي ${roundCount + 1} من ${creative.roundsPerTeam}`;
  }

  updateCreativeScoresDisplay();
  startCreativeCreatePhase();
}

const PASSWORD_WORDS = [
  'شمس', 'قمر', 'سيارة', 'منزل', 'شجرة', 'كتاب', 'قطة', 'كلب',
  'طائرة', 'سفينة', 'وردة', 'تفاحة', 'جبل', 'بحر', 'نجمة', 'سحابة',
  'مفتاح', 'ساعة', 'كرة', 'قلم', 'كوب', 'مظلة', 'فراشة', 'سمكة',
  'جسر', 'قلعة', 'صحراء', 'مدينة', 'حديقة', 'مطبخ'
];

function clearPasswordTimers() {
  const { password } = gameState;
  if (password.readTimerId) {
    clearTimeout(password.readTimerId);
    password.readTimerId = null;
  }
  if (password.timerId) {
    clearInterval(password.timerId);
    password.timerId = null;
  }
  if (password.feedbackTimeoutId) {
    clearTimeout(password.feedbackTimeoutId);
    password.feedbackTimeoutId = null;
  }
}

function isPasswordComplete() {
  return gameState.teams.every(
    (team) => gameState.password.teamRoundCounts[team] >= gameState.password.roundsPerTeam
  );
}

function getDescriberTeamName() {
  return gameState.teams[gameState.password.describerTeamIndex];
}

function getGuesserTeamName() {
  return gameState.teams[gameState.password.guesserTeamIndex];
}

function getNextPasswordWord() {
  const { password } = gameState;

  if (password.poolPointer >= password.shuffledIndices.length) {
    password.shuffledIndices = shuffleArray(PASSWORD_WORDS.map((_, index) => index));
    password.poolPointer = 0;
  }

  const wordIndex = password.shuffledIndices[password.poolPointer];
  password.poolPointer += 1;
  return PASSWORD_WORDS[wordIndex];
}

function pickPasswordTeams() {
  const { teams, password } = gameState;
  const eligible = teams.filter(
    (team) => password.teamRoundCounts[team] < password.roundsPerTeam
  );
  const describerPool = eligible.length > 0 ? eligible : teams;
  const describerName = describerPool[Math.floor(Math.random() * describerPool.length)];
  const describerTeamIndex = teams.indexOf(describerName);

  const guesserCandidates = teams.filter((team) => team !== describerName);
  const eligibleGuessers = guesserCandidates.filter(
    (team) => password.teamRoundCounts[team] < password.roundsPerTeam
  );
  const guesserPool = eligibleGuessers.length > 0 ? eligibleGuessers : guesserCandidates;
  const guesserName = guesserPool[Math.floor(Math.random() * guesserPool.length)];
  const guesserTeamIndex = teams.indexOf(guesserName);

  password.describerTeamIndex = describerTeamIndex;
  password.guesserTeamIndex = guesserTeamIndex;
}

function normalizePasswordText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

function updatePasswordScoresDisplay() {
  const scoresEl = document.getElementById('password-scores');
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => {
      const score = gameState.scores[team] || 0;
      return `<span class="password-score-item"><strong>${team}</strong>: ${score} نقطة</span>`;
    })
    .join('');
}

function hidePasswordFeedback() {
  const feedbackEl = document.getElementById('password-feedback');
  if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
  }
}

function showPasswordFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('password-feedback');
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.hidden = false;
  feedbackEl.classList.toggle('correct', isCorrect);
  feedbackEl.classList.toggle('incorrect', !isCorrect);
}

function updatePasswordTimerDisplay() {
  const timerEl = document.getElementById('password-timer');
  if (!timerEl) return;

  timerEl.textContent = String(gameState.password.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.password.timeLeft <= 5);
  maybePlayTimerTick(gameState.password.timeLeft, 'password');
  syncGameTimer('password', gameState.password.timeLeft, { active: !!gameState.password.timerId });
}

function setPasswordPhaseUI(phase) {
  const readSection = document.getElementById('password-read-section');
  const guessSection = document.getElementById('password-guess-section');
  const hintEl = document.getElementById('password-phase-hint');

  if (readSection) {
    readSection.hidden = phase !== 'read';
  }
  if (guessSection) {
    guessSection.hidden = phase !== 'guess';
  }
  if (hintEl) {
    hintEl.textContent = phase === 'read'
      ? 'فريق الوصف: اقرأوا الكلمة وصفوها لفريق التخمين (بدون ذكر الكلمة!)'
      : 'فريق التخمين: اكتبوا الكلمة الصحيحة';
  }
}

function setPasswordGuessInputEnabled(enabled) {
  const inputEl = document.getElementById('password-guess-input');
  const submitBtn = document.getElementById('password-submit-btn');
  if (inputEl) inputEl.disabled = !enabled;
  if (submitBtn) submitBtn.disabled = !enabled;
}

function stopPasswordTimer() {
  if (gameState.password.timerId) {
    clearInterval(gameState.password.timerId);
    gameState.password.timerId = null;
  }
  hideTaifGameTimer();
}

function startPasswordReadTimer() {
  stopPasswordTimer();
  gameState.password.timeLeft = getRoundDuration(30);
  updatePasswordTimerDisplay();

  gameState.password.timerId = setInterval(() => {
    gameState.password.timeLeft -= 1;
    updatePasswordTimerDisplay();

    if (gameState.password.timeLeft <= 0) {
      stopPasswordTimer();
      startPasswordGuessPhase();
    }
  }, 1000);
}

function startPasswordGuessTimer() {
  stopPasswordTimer();
  gameState.password.timeLeft = getRoundDuration(60);
  updatePasswordTimerDisplay();

  gameState.password.timerId = setInterval(() => {
    gameState.password.timeLeft -= 1;
    updatePasswordTimerDisplay();

    if (gameState.password.timeLeft <= 0) {
      stopPasswordTimer();
      handlePasswordGuessTimeout();
    }
  }, 1000);
}

function advancePasswordRound() {
  const describerName = getDescriberTeamName();
  const guesserName = getGuesserTeamName();
  gameState.password.teamRoundCounts[describerName] += 1;
  gameState.password.teamRoundCounts[guesserName] += 1;
}

function scheduleNextPasswordRound() {
  gameState.password.feedbackTimeoutId = setTimeout(() => {
    gameState.password.feedbackTimeoutId = null;
    showNextPasswordRound();
  }, 1500);
}

function finishPasswordRoundAfterAnswer(isCorrect, points, message) {
  const { password } = gameState;
  password.answered = true;
  stopPasswordTimer();
  setPasswordGuessInputEnabled(false);

  if (isCorrect) {
    const guesserName = getGuesserTeamName();
    addTeamScore(guesserName, points);
    showPasswordFeedback(message, true);
  } else {
    playLoseSound();
    showPasswordFeedback(message, false);
  }

  updatePasswordScoresDisplay();
  advancePasswordRound();
  scheduleNextPasswordRound();
}

function handlePasswordSubmit() {
  if (gameState.password.answered || gameState.password.phase !== 'guess') return;

  const inputEl = document.getElementById('password-guess-input');
  const guessText = normalizePasswordText(inputEl?.value || '');
  if (!guessText) return;

  const correctAnswer = normalizePasswordText(gameState.password.currentWord);
  const isCorrect = guessText === correctAnswer;
  const elapsedSeconds = (Date.now() - gameState.password.guessStartTime) / 1000;

  if (isCorrect) {
    const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, SCORE_SPEED_THRESHOLDS.password);
    finishPasswordRoundAfterAnswer(true, points, `صح! +${points} نقطة${bonusText}`);
    return;
  }

  showPasswordFeedback('خطأ! حاول مرة أخرى', false);
}

function handlePasswordGuessTimeout() {
  if (gameState.password.answered || gameState.password.phase !== 'guess') return;

  const answer = gameState.password.currentWord;
  finishPasswordRoundAfterAnswer(false, 0, `انتهى الوقت! الكلمة: ${answer}`);
}

function startPasswordGuessPhase() {
  const { password } = gameState;
  if (password.phase === 'guess') return;

  password.phase = 'guess';
  password.guessStartTime = Date.now();
  password.answered = false;

  const secretEl = document.getElementById('password-secret-word');
  if (secretEl) {
    secretEl.textContent = '???';
  }

  const inputEl = document.getElementById('password-guess-input');
  if (inputEl) {
    inputEl.value = '';
  }

  setPasswordPhaseUI('guess');
  setPasswordGuessInputEnabled(true);
  startPasswordGuessTimer();
}

function startPasswordReadPhase() {
  const { password } = gameState;

  password.phase = 'read';
  password.answered = false;
  hidePasswordFeedback();

  const secretEl = document.getElementById('password-secret-word');
  if (secretEl) {
    secretEl.textContent = password.currentWord;
  }

  setPasswordPhaseUI('read');
  setPasswordGuessInputEnabled(false);
  startPasswordReadTimer();
}

function showNextPasswordRound() {
  clearPasswordTimers();
  hidePasswordFeedback();

  if (isPasswordComplete()) {
    finishPasswordGame();
    return;
  }

  pickPasswordTeams();
  const { password } = gameState;

  password.currentWord = getNextPasswordWord();
  password.phase = 'idle';
  password.roundNumber += 1;

  const describerLabelEl = document.getElementById('password-describer-label');
  const guesserLabelEl = document.getElementById('password-guesser-label');
  const progressEl = document.getElementById('password-progress');
  const describerName = getDescriberTeamName();
  const guesserName = getGuesserTeamName();

  if (describerLabelEl) {
    describerLabelEl.textContent = `فريق الوصف: ${describerName}`;
  }
  if (guesserLabelEl) {
    guesserLabelEl.textContent = `فريق التخمين: ${guesserName}`;
  }
  if (progressEl) {
    progressEl.textContent = `الجولة ${password.roundNumber} — ${describerName} ضد ${guesserName}`;
  }

  updatePasswordScoresDisplay();
  startPasswordReadPhase();
}

function finishPasswordGame() {
  clearPasswordTimers();
  playGameCompleteSound();
  onGameCompleted('password');
}

function startPasswordGame() {
  clearPasswordTimers();
  hidePasswordFeedback();

  gameState.password.shuffledIndices = shuffleArray(
    PASSWORD_WORDS.map((_, index) => index)
  );
  gameState.password.poolPointer = 0;
  gameState.password.teamRoundCounts = {};
  gameState.password.roundNumber = 0;
  gameState.password.describerTeamIndex = 0;
  gameState.password.guesserTeamIndex = 0;
  gameState.password.currentWord = '';
  gameState.password.phase = 'idle';
  gameState.password.answered = false;

  gameState.teams.forEach((team) => {
    gameState.password.teamRoundCounts[team] = 0;
  });

  showNextPasswordRound();
}

function finishCreativeGame() {
  clearCreativeTimers();
  playGameCompleteSound();
  onGameCompleted('creative');
}

function startCreativeGame() {
  clearCreativeTimers();
  hideCreativeFeedback();

  gameState.creative.shuffledIndices = shuffleArray(
    CREATIVE_CHALLENGES.map((_, index) => index)
  );
  gameState.creative.poolPointer = 0;
  gameState.creative.currentTeamIndex = 0;
  gameState.creative.teamRoundCounts = {};
  gameState.creative.currentChallenge = null;
  gameState.creative.evaluatorTeamIndex = 0;
  gameState.creative.phase = 'idle';
  gameState.creative.answerText = '';
  gameState.creative.rated = false;

  gameState.teams.forEach((team) => {
    gameState.creative.teamRoundCounts[team] = 0;
  });

  showNextCreativeRound();
}

function finishMemoryGame() {
  clearMemoryTimers();
  playGameCompleteSound();
  onGameCompleted('memory');
}

function startMemoryGame() {
  clearMemoryTimers();
  hideMemoryFeedback();

  gameState.memory.shuffledRoundSeeds = shuffleArray(
    MEMORY_ICON_PUZZLES.map((_, index) => index)
  );
  gameState.memory.poolPointer = 0;
  gameState.memory.currentTeamIndex = 0;
  gameState.memory.teamRoundCounts = {};
  gameState.memory.correctOrder = [];
  gameState.memory.currentOrder = [];
  gameState.memory.revealedCells = [];
  gameState.memory.selectedCellIndex = null;
  gameState.memory.phase = 'idle';
  gameState.memory.answered = false;

  gameState.teams.forEach((team) => {
    gameState.memory.teamRoundCounts[team] = 0;
  });

  showNextMemoryRound();
}

function finishSpotGame() {
  clearSpotTimers();
  playGameCompleteSound();
  onGameCompleted('spot');
}

function startSpotGame() {
  clearSpotTimers();
  hideSpotFeedback();

  gameState.spot.shuffledIndices = shuffleArray(SPOT_PUZZLES.map((_, index) => index));
  gameState.spot.poolPointer = 0;
  gameState.spot.currentTeamIndex = 0;
  gameState.spot.teamRoundCounts = {};
  gameState.spot.foundDiffIndices = [];
  gameState.spot.roundActive = false;
  gameState.spot.currentPuzzle = null;

  gameState.teams.forEach((team) => {
    gameState.spot.teamRoundCounts[team] = 0;
  });

  showNextSpotRound();
}

function finishSentenceGame() {
  clearSentenceTimers();
  playGameCompleteSound();
  onGameCompleted('sentence');
}

function startSentenceGame() {
  clearSentenceTimers();
  hideSentenceFeedback();

  gameState.sentence.shuffledIndices = shuffleArray(
    SENTENCE_PUZZLES.map((_, index) => index)
  );
  gameState.sentence.poolPointer = 0;
  gameState.sentence.currentTeamIndex = 0;
  gameState.sentence.teamRoundCounts = {};
  gameState.sentence.selectedWordIndex = null;
  gameState.sentence.answered = false;

  gameState.teams.forEach((team) => {
    gameState.sentence.teamRoundCounts[team] = 0;
  });

  showNextSentenceRound();
}

function startTriviaGame() {
  clearTriviaTimers();
  hideTriviaFeedback();

  const { trivia } = gameState;

  if (trivia.playMode === 'single-cat') {
    const pool = getTriviaQuestionsForCategory(trivia.selectedCategoryId);
    trivia.shuffledIndices = shuffleArray(pool.map((_, index) => index));
    trivia.questionPool = pool;
  } else {
    // النمطان 'random-all' و 'multi-cat': مجمع مدمج مخلوط
    const allQ = (trivia.selectedCategoryIds || []).flatMap(
      (id) => getTriviaQuestionsForCategory(id)
    );
    trivia.questionPool = shuffleArray(allQ);
    trivia.shuffledIndices = [];
  }

  trivia.poolPointer = 0;
  trivia.currentTeamIndex = 0;
  trivia.teamQuestionCounts = {};
  trivia.answered = false;
  trivia.currentQuestion = null;

  gameState.teams.forEach((team) => {
    trivia.teamQuestionCounts[team] = 0;
  });

  updateTriviaScreenTitle();
  showNextTriviaQuestion();
}

function populateTeamCountSelect(selectEl) {
  for (let count = 2; count <= 8; count++) {
    const option = document.createElement('option');
    option.value = String(count);
    option.textContent = String(count);
    selectEl.appendChild(option);
  }
}

function renderTeamInputs(count) {
  const container = document.getElementById('team-inputs');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    const row = document.createElement('div');
    row.className = 'team-input-row';

    const label = document.createElement('label');
    label.setAttribute('for', `team-input-${i}`);
    label.textContent = `الفريق ${i}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `team-input-${i}`;
    input.className = 'team-input';
    input.placeholder = `اسم الفريق ${i}`;
    input.maxLength = 30;

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  }
}

function hideTeamsError() {
  const errorEl = document.getElementById('teams-error');
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
}

let sharedAudioCtx = null;
const timerTickLast = {};

function getAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime;

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.09);
  } catch {
    // Audio may be blocked.
  }
}

function playLoseSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const start = ctx.currentTime;
    [400, 250].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = start + index * 0.15;

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.2);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.25);
    });
  } catch {
    // Audio may be blocked.
  }

  maybeTaifLoseQuip();
}

function playTickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime;

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1000, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.15, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.11);
  } catch {
    // Audio may be blocked.
  }
}

function maybePlayTimerTick(timeLeft, key) {
  if (timeLeft > 5) {
    timerTickLast[key] = null;
    return;
  }
  if (timerTickLast[key] !== timeLeft) {
    timerTickLast[key] = timeLeft;
    playTickSound();
  }
}

function playGameCompleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [392, 523.25, 659.25];
    const startTime = ctx.currentTime;

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = startTime + index * 0.12;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.22, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.25);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.3);
    });
  } catch {
    // Audio may be blocked.
  }

  if (typeof playTaifReactGood === 'function') {
    playTaifReactGood();
  }
}

function playSurpriseSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const start = ctx.currentTime;
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();

    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(200, start);
    sweep.frequency.exponentialRampToValueAtTime(880, start + 0.35);

    sweepGain.gain.setValueAtTime(0.0001, start);
    sweepGain.gain.exponentialRampToValueAtTime(0.2, start + 0.05);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

    sweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweep.start(start);
    sweep.stop(start + 0.45);

    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    const pingStart = start + 0.35;

    ping.type = 'triangle';
    ping.frequency.setValueAtTime(988, pingStart);

    pingGain.gain.setValueAtTime(0.0001, pingStart);
    pingGain.gain.exponentialRampToValueAtTime(0.28, pingStart + 0.02);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, pingStart + 0.3);

    ping.connect(pingGain);
    pingGain.connect(ctx.destination);
    ping.start(pingStart);
    ping.stop(pingStart + 0.35);
  } catch {
    // Audio may be blocked.
  }
}

function playWelcomeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, start);
    oscillator.frequency.setValueAtTime(659.25, start + 0.15);
    oscillator.frequency.setValueAtTime(783.99, start + 0.3);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.6);
  } catch {
    // Audio may be blocked; intro continues without sound.
  }
}

const CONFETTI_COLORS = ['#e94560', '#ffd32a', '#2ed573', '#3498db'];

function playVictorySound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    const startTime = ctx.currentTime;

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = startTime + index * 0.18;

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.32, noteStart + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.4);
    });
  } catch {
    // Audio may be blocked; results screen continues without sound.
  }
}

function startCelebrationEffects() {
  document.body.classList.add('session-celebrating');

  const confettiEl = document.getElementById('session-end-confetti');
  if (!confettiEl) return;

  confettiEl.innerHTML = '';
  const pieceCount = 24;

  for (let i = 0; i < pieceCount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDelay = `${Math.random() * 1.2}s`;
    piece.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
    confettiEl.appendChild(piece);
  }
}

function clearCelebrationEffects() {
  document.body.classList.remove('session-celebrating');

  const confettiEl = document.getElementById('session-end-confetti');
  if (confettiEl) {
    confettiEl.innerHTML = '';
  }
}

function hideTaifCursor() {
  const { cursor } = getTaifStageElements();
  if (cursor) {
    cursor.classList.add('hidden');
  }
}

function showTaifCursor() {
  const { cursor } = getTaifStageElements();
  if (cursor) {
    cursor.classList.remove('hidden');
  }
}

function clearTypewriter() {
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }
  if (typeof setTaifTypewriterActive === 'function') {
    setTaifTypewriterActive(false);
  }
}

function typewriterEffect(text, onComplete) {
  const messageEl = document.getElementById('taif-host-text');
  const heroTextEl = document.getElementById('taif-hero-text');
  if (!messageEl && !heroTextEl) return;

  clearTypewriter();
  if (typeof setTaifTypewriterActive === 'function') {
    setTaifTypewriterActive(true);
  }
  const savedMood = taifPresenterState.mood;
  if (messageEl) messageEl.textContent = '';
  if (heroTextEl) heroTextEl.textContent = '';
  setTaifMood('talk', { motion: 'talk', pngKey: 'talk' });

  const cursor = document.getElementById('taif-host-cursor');
  const heroCursor = document.getElementById('taif-hero-cursor');
  if (cursor) cursor.classList.remove('hidden');
  if (heroCursor) heroCursor.classList.remove('hidden');

  let index = 0;
  typewriterInterval = setInterval(() => {
    if (index < text.length) {
      const chunk = text.slice(0, index + 1);
      if (messageEl) messageEl.textContent = chunk;
      if (heroTextEl) heroTextEl.textContent = chunk;
      index += 1;
      if (typeof syncTaifLayoutOffset === 'function') syncTaifLayoutOffset();
      return;
    }

    clearTypewriter();
    if (cursor) cursor.classList.add('hidden');
    if (heroCursor) heroCursor.classList.add('hidden');
    setTaifMood(savedMood);
    onComplete();
  }, 45);
}

function startTaifIntro() {
  if (taifTransitionTimer) {
    clearTimeout(taifTransitionTimer);
    taifTransitionTimer = null;
  }

  clearTypewriter();

  const startBtn = document.getElementById('taif-start-btn');

  const { text: textEl, heroText } = getTaifStageElements();
  if (textEl) textEl.textContent = '';
  if (heroText) heroText.textContent = '';

  setTaifMood('rules', { text: '' });
  playWelcomeSound();

  typewriterEffect(getTaifWelcomeText(), () => {
    const taifScreen = document.getElementById('taif-screen');
    if (
      startBtn &&
      taifScreen?.classList.contains('active') &&
      typeof isTaifTypewriterActive === 'function' &&
      !isTaifTypewriterActive()
    ) {
      startBtn.hidden = false;
      startBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    if (typeof syncTaifLayoutOffset === 'function') syncTaifLayoutOffset();
  });
}

function validateAndSaveTeams() {
  const inputs = document.querySelectorAll('.team-input');
  const errorEl = document.getElementById('teams-error');
  const names = [];
  let valid = true;

  inputs.forEach((input) => {
    const name = input.value.trim();
    if (!name) {
      valid = false;
      input.classList.add('input-error');
    } else {
      input.classList.remove('input-error');
      names.push(name);
    }
  });

  if (!valid) {
    if (errorEl) {
      errorEl.textContent = 'يرجى إدخال اسم لكل فريق';
      errorEl.hidden = false;
    }
    return;
  }

  hideTeamsError();
  gameState.teams = names;
  showScreen('taif-screen');
  startTaifIntro();
}

document.addEventListener('DOMContentLoaded', () => {
  initTaifHost();

  document.addEventListener('click', (event) => {
    if (event.target.closest('.btn, .trivia-option, .game-select-card, .creative-rating-btn, .sentence-word, .memory-cell')) {
      playClickSound();
    }
  });

  const startBtn = document.getElementById('start-btn');
  const backBtn = document.getElementById('back-btn');
  const confirmBtn = document.getElementById('confirm-teams-btn');
  const teamCountSelect = document.getElementById('team-count');

  if (teamCountSelect) {
    populateTeamCountSelect(teamCountSelect);
    renderTeamInputs(Number(teamCountSelect.value));
    teamCountSelect.addEventListener('change', () => {
      hideTeamsError();
      renderTeamInputs(Number(teamCountSelect.value));
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      showScreen('teams-screen');
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      hideTeamsError();
      showScreen('welcome-screen');
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', validateAndSaveTeams);
  }

  const taifStartBtn = document.getElementById('taif-start-btn');
  if (taifStartBtn) {
    taifStartBtn.addEventListener('click', () => {
      taifStartBtn.hidden = true;
      showScreen('game-select-screen');
      renderGameSelectScreen();
    });
  }

  const triviaModeBackBtn = document.getElementById('trivia-mode-back-btn');
  if (triviaModeBackBtn) {
    triviaModeBackBtn.addEventListener('click', () => {
      showScreen('game-select-screen');
      renderGameSelectScreen();
    });
  }

  const triviaMultiCatBackBtn = document.getElementById('trivia-multi-cat-back-btn');
  if (triviaMultiCatBackBtn) {
    triviaMultiCatBackBtn.addEventListener('click', () => {
      showScreen('trivia-mode-screen');
    });
  }

  const triviaMultiCatStartBtn = document.getElementById('trivia-multi-cat-start-btn');
  if (triviaMultiCatStartBtn) {
    triviaMultiCatStartBtn.addEventListener('click', () => {
      if (gameState.trivia.selectedCategoryIds.length === 0) return;
      showScreen('trivia-screen');
      startTriviaGame();
    });
  }

  const triviaCategoryBackBtn = document.getElementById('trivia-category-back-btn');
  if (triviaCategoryBackBtn) {
    triviaCategoryBackBtn.addEventListener('click', () => {
      showScreen('trivia-mode-screen');
    });
  }

  const sentenceCheckBtn = document.getElementById('sentence-check-btn');
  if (sentenceCheckBtn) {
    sentenceCheckBtn.addEventListener('click', handleSentenceCheck);
  }

  const picmergeSubmitBtn = document.getElementById('picmerge-submit-btn');
  const picmergeInput = document.getElementById('picmerge-input');
  if (picmergeSubmitBtn) {
    picmergeSubmitBtn.addEventListener('click', handlePicmergeSubmit);
  }
  if (picmergeInput) {
    picmergeInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handlePicmergeSubmit();
      }
    });
  }

  const spotLeftScene = document.getElementById('spot-left-scene');
  if (spotLeftScene) {
    spotLeftScene.addEventListener('click', handleSpotCanvasClick);
  }

  const memoryCheckBtn = document.getElementById('memory-check-btn');
  if (memoryCheckBtn) {
    memoryCheckBtn.addEventListener('click', handleMemoryCheck);
  }

  const playAllRandomBtn = document.getElementById('play-all-random-btn');
  if (playAllRandomBtn) {
    playAllRandomBtn.addEventListener('click', startRandomAllGames);
  }

  const gameSelectHomeBtn = document.getElementById('game-select-home-btn');
  if (gameSelectHomeBtn) {
    gameSelectHomeBtn.addEventListener('click', returnToWelcomeScreen);
  }

  const partialResultsContinueBtn = document.getElementById('partial-results-continue-btn');
  if (partialResultsContinueBtn) {
    partialResultsContinueBtn.addEventListener('click', handlePartialResultsContinue);
  }

  const partialResultsBackBtn = document.getElementById('partial-results-back-btn');
  if (partialResultsBackBtn) {
    partialResultsBackBtn.addEventListener('click', returnToGameSelect);
  }

  const sessionPlayAgainBtn = document.getElementById('session-play-again-btn');
  if (sessionPlayAgainBtn) {
    sessionPlayAgainBtn.addEventListener('click', () => {
      clearCelebrationEffects();
      if (typeof resetTaifUsedLines === 'function') resetTaifUsedLines();
      showScreen('welcome-screen');
    });
  }

  const creativeDoneBtn = document.getElementById('creative-done-btn');
  if (creativeDoneBtn) {
    creativeDoneBtn.addEventListener('click', handleCreativeDone);
  }

  const creativeClearBtn = document.getElementById('creative-clear-btn');
  if (creativeClearBtn) {
    creativeClearBtn.addEventListener('click', clearCreativeCanvas);
  }

  const passwordSubmitBtn = document.getElementById('password-submit-btn');
  const passwordGuessInput = document.getElementById('password-guess-input');
  if (passwordSubmitBtn) {
    passwordSubmitBtn.addEventListener('click', handlePasswordSubmit);
  }
  if (passwordGuessInput) {
    passwordGuessInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handlePasswordSubmit();
      }
    });
  }

  document.querySelectorAll('.game-screen').forEach((screen) => {
    const panel = screen.querySelector('.content-panel--game');
    if (!panel) return;
    const scoresEl = panel.querySelector('.game-scores');
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'btn btn-secondary game-back-btn';
    backBtn.textContent = 'عودة للقائمة';
    if (scoresEl) {
      panel.insertBefore(backBtn, scoresEl);
    } else {
      panel.append(backBtn);
    }
    backBtn.addEventListener('click', () => {
      stopAllGameTimers();
      returnToGameSelect();
    });
  });
});
