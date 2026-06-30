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
    questionStartTime: 0,
    answered: false,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 30
  },
  picmerge: {
    playMode: 'turns',
    shuffledIndices: [],
    poolPointer: 0,
    currentTeamIndex: 0,
    teamRoundCounts: {},
    completedBattleRounds: 0,
    penalties: {},
    penaltyDisplayTeam: null,
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
    playMode: 'medium',
    gridSize: 3,
    currentTeamIndex: 0,
    teamRoundCounts: {},
    roundsPerTeam: 3,
    cardOrder: [],
    matched: [],
    selection: null,
    flashPair: null,
    inputLocked: false,
    phase: 'idle',
    questionStartTime: 0,
    answered: false,
    memorizeTimerId: null,
    memorizeTimeLeft: 0,
    mismatchFlashId: null,
    penaltyFlashTimeoutId: null,
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
    phase: 'idle',
    answerText: '',
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 60,
    roundDuration: 60,
    timeSpent: 0,
    isDrawing: false,
    drawListenersBound: false,
    brushColor: '#1a1a1a',
    brushSize: 6,
    tool: 'brush',
    undoStack: [],
    redoStack: [],
    realisticToken: 0,
    evaluating: false,
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
    currentCategory: '',
    phase: 'idle',
    guessStartTime: 0,
    answered: false,
    readTimerId: null,
    timerId: null,
    feedbackTimeoutId: null,
    timeLeft: 30
  }
};

const TEAM_COLORS = [
  '#5B9FED', /* 1 — أزرق */
  '#FF5757', /* 2 — أحمر */
  '#FFD54A', /* 3 — أصفر */
  '#4ADE80', /* 4 — أخضر */
  '#000000', /* 5 — أسود */
  '#C084FC', /* 6 */
  '#FF9F43', /* 7 */
  '#22D3EE'  /* 8 */
];

function getTeamColorByIndex(index) {
  if (index < 0) return '';
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

function getTeamColorByName(teamName) {
  return getTeamColorByIndex(gameState.teams.indexOf(teamName));
}

function applyTeamLabelColor(element, teamName) {
  if (!element) return;

  const index = gameState.teams.indexOf(teamName);
  element.classList.add('game-team-label');
  element.classList.toggle('team-label--dark', index === 4);
  element.dataset.teamIndex = index >= 0 ? String(index) : '';

  if (index < 0) {
    element.style.removeProperty('color');
    return;
  }

  if (index === 4) {
    element.style.removeProperty('color');
    return;
  }

  element.style.color = getTeamColorByIndex(index);
}

function setColoredTeamLabel(element, prefix, teamName) {
  if (!element) return;
  element.textContent = `${prefix}${teamName}`;
  applyTeamLabelColor(element, teamName);
}

function buildTeamScoreItemHtml(team, score, itemClass) {
  const index = gameState.teams.indexOf(team);
  const darkClass = index === 4 ? ' team-score-item--dark' : '';
  const color = getTeamColorByIndex(index);
  const colorAttr = index >= 0 && index !== 4 ? ` style="color:${color}"` : '';

  return `<span class="${itemClass} game-score-item${darkClass}"${colorAttr}><strong>${team}</strong>: ${score}</span>`;
}

function syncGameFooterTeamCount(scoresEl) {
  if (!scoresEl) return;

  const count = String(gameState.teams.length);
  scoresEl.dataset.teamCount = count;
  scoresEl.closest('.game-panel-footer')?.setAttribute('data-team-count', count);
}

function updateGameScoresDisplay(scoresId, itemClass) {
  const scoresEl = document.getElementById(scoresId);
  if (!scoresEl) return;

  scoresEl.innerHTML = gameState.teams
    .map((team) => buildTeamScoreItemHtml(team, gameState.scores[team] || 0, itemClass))
    .join('');

  syncGameFooterTeamCount(scoresEl);
}

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
    screenId: 'picmerge-mode-screen',
    start: () => startPicmergeModeSelect(),
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
    screenId: 'memory-mode-screen',
    start: () => startMemoryEntry(),
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
  const threshold = getSpeedThreshold(gameId);
  const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, threshold);
  addTeamScore(teamName, points);
  return { points, bonusText };
}

function isSurpriseRound() {
  return gameState.session.surpriseActive === true;
}

/* ============================================================================
 * جسر الإعدادات — المحرك يقرأ القيم القابلة للتخصيص من window.TAIF_SETTINGS
 * تُضبط من شاشة الإعدادات (js/settings.js). عند غياب الإعداد تُستخدم القيمة
 * الافتراضية الممرّرة، فيبقى المحرك سليمًا حتى لو لم يُحمَّل ملف الإعدادات بعد.
 * ========================================================================== */
function getTiming(game, key, fallback) {
  const t = window.TAIF_SETTINGS && window.TAIF_SETTINGS.timings && window.TAIF_SETTINGS.timings[game];
  const v = t && t[key];
  return (typeof v === 'number' && v >= 0) ? v : fallback;
}

function getScoringCfg(key, fallback) {
  const s = window.TAIF_SETTINGS && window.TAIF_SETTINGS.scoring;
  const v = s && s[key];
  return (typeof v === 'number' && v >= 0) ? v : fallback;
}

function getRoundsCfg(game, fallback) {
  const r = window.TAIF_SETTINGS && window.TAIF_SETTINGS.rounds;
  const v = r && r[game];
  return (typeof v === 'number' && v > 0) ? v : fallback;
}

function getSurpriseMultiplier() {
  const s = window.TAIF_SETTINGS && window.TAIF_SETTINGS.scoring;
  const v = s && s.surpriseMultiplier;
  return (typeof v === 'number' && v > 1) ? v : 2;
}

function isSurpriseEnabled() {
  const s = window.TAIF_SETTINGS && window.TAIF_SETTINGS.scoring;
  return !(s && s.surpriseEnabled === false);
}

function getSpeedThreshold(game) {
  const s = window.TAIF_SETTINGS && window.TAIF_SETTINGS.speedThresholds;
  const v = s && s[game];
  return (typeof v === 'number' && v > 0) ? v : SCORE_SPEED_THRESHOLDS[game];
}

function getRoundDuration(baseSeconds) {
  return isSurpriseRound() ? baseSeconds * getSurpriseMultiplier() : baseSeconds;
}

function getCorrectPoints(basePoints) {
  const base = (typeof basePoints === 'number') ? basePoints : getScoringCfg('correctPoints', 10);
  return isSurpriseRound() ? base * getSurpriseMultiplier() : base;
}

function getSpeedBonus(baseBonus) {
  const base = (typeof baseBonus === 'number') ? baseBonus : getScoringCfg('speedBonus', 5);
  return isSurpriseRound() ? base * getSurpriseMultiplier() : base;
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
      const teamIndex = gameState.teams.indexOf(team);
      const isWinner = highlightWinner && score === topScore && topScore > 0;
      const winnerClass = isWinner ? ' score-board-item--winner' : '';
      const darkClass = teamIndex === 4 ? ' team-score-item--dark' : '';
      const color = getTeamColorByIndex(teamIndex);
      const colorAttr = teamIndex >= 0 && teamIndex !== 4 ? ` style="color:${color}"` : '';

      return `<span class="score-board-item game-score-item${winnerClass}${darkClass}"${colorAttr}><strong>${index + 1}. ${team}</strong>: ${score}</span>`;
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
    if (g === 'picmerge' && s.penalties) {
      clearPicmergePenaltyTimers();
    }
    if (g === 'memory') {
      clearMemoryTimers();
    }
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

  if (!session.surpriseShown && session.completedGameIds.length >= 3 && isSurpriseEnabled()) {
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

  if (!session.surpriseShown && session.completedGameIds.length >= 3 && isSurpriseEnabled()) {
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

  clearCelebrationEffects();
  showScreen('partial-results-screen');
  startCelebrationEffects('partial-results-confetti');
  playVictorySound();
}

function handlePartialResultsContinue() {
  clearCelebrationEffects();
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

  if (gameId === 'memory' && gameState.session.mode === 'random-all') {
    gameState.memory.playMode = 'medium';
    showScreen('memory-screen');
    startMemoryGame();
    return;
  }

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

/* ——— أنماط تحدي الصور ——— */

function startPicmergeModeSelect() {
  renderPicmergeModeScreen();
}

function renderPicmergeModeScreen() {
  const grid = document.getElementById('picmerge-mode-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const modes = [
    {
      id: 'turns',
      name: 'دور متناوب',
      desc: 'كل فريق يلعب دوره على صورة مختلفة',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(112,72,232,0.15)" stroke="rgba(112,72,232,0.5)" stroke-width="1.5"/><g stroke="#7048e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="18" cy="22" r="5"/><circle cx="38" cy="34" r="5"/><path d="M23 22h10l5 7"/></g></svg>`
    },
    {
      id: 'battle',
      name: 'سباق الفرق',
      desc: 'جميع الفرق على نفس الصورة — من يجيب أولاً يفوز',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(232,67,147,0.15)" stroke="rgba(232,67,147,0.5)" stroke-width="1.5"/><g stroke="#e84393" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 38l8-14 6 8 8-16 6 10"/><circle cx="14" cy="38" r="2" fill="#e84393"/><circle cx="44" cy="26" r="2" fill="#e84393"/></g></svg>`
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
    card.addEventListener('click', () => handlePicmergeModeSelect(mode.id));
    grid.appendChild(card);
  });
}

function handlePicmergeModeSelect(modeId) {
  gameState.picmerge.playMode = modeId;
  showScreen('picmerge-screen');
  startPicmergeGame();
}

/* ——— أنماط الذاكرة البصرية ——— */

function startMemoryEntry() {
  if (gameState.session.mode === 'random-all') {
    gameState.memory.playMode = 'medium';
    showScreen('memory-screen');
    startMemoryGame();
    return;
  }
  renderMemoryModeScreen();
}

function renderMemoryModeScreen() {
  const grid = document.getElementById('memory-mode-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const modes = [
    {
      id: 'easy',
      name: 'سهل',
      desc: '2×2 — حفظ 7 ث، حل 15 ث',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(92,219,149,0.15)" stroke="rgba(92,219,149,0.5)" stroke-width="1.5"/><g stroke="#5cdb95" stroke-width="2.5" fill="none"><rect x="16" y="16" width="10" height="10" rx="1"/><rect x="30" y="16" width="10" height="10" rx="1"/><rect x="16" y="30" width="10" height="10" rx="1"/><rect x="30" y="30" width="10" height="10" rx="1"/></g></svg>`
    },
    {
      id: 'medium',
      name: 'متوسط',
      desc: '3×3 — حفظ 20 ث، حل 45 ث',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(240,199,94,0.12)" stroke="rgba(240,199,94,0.45)" stroke-width="1.5"/><g stroke="#f0c75e" stroke-width="2" fill="none"><rect x="14" y="14" width="8" height="8" rx="1"/><rect x="24" y="14" width="8" height="8" rx="1"/><rect x="34" y="14" width="8" height="8" rx="1"/><rect x="14" y="24" width="8" height="8" rx="1"/><rect x="24" y="24" width="8" height="8" rx="1"/><rect x="34" y="24" width="8" height="8" rx="1"/><rect x="14" y="34" width="8" height="8" rx="1"/><rect x="24" y="34" width="8" height="8" rx="1"/><rect x="34" y="34" width="8" height="8" rx="1"/></g></svg>`
    },
    {
      id: 'hard',
      name: 'صعب',
      desc: '4×4 — حفظ 45 ث، حل 60 ث',
      svg: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="1.5" y="1.5" width="53" height="53" rx="13" fill="rgba(232,67,147,0.15)" stroke="rgba(232,67,147,0.5)" stroke-width="1.5"/><g stroke="#e84393" stroke-width="1.5" fill="none"><rect x="13" y="13" width="7" height="7" rx="0.5"/><rect x="21" y="13" width="7" height="7" rx="0.5"/><rect x="29" y="13" width="7" height="7" rx="0.5"/><rect x="37" y="13" width="7" height="7" rx="0.5"/><rect x="13" y="21" width="7" height="7" rx="0.5"/><rect x="21" y="21" width="7" height="7" rx="0.5"/><rect x="29" y="21" width="7" height="7" rx="0.5"/><rect x="37" y="21" width="7" height="7" rx="0.5"/><rect x="13" y="29" width="7" height="7" rx="0.5"/><rect x="21" y="29" width="7" height="7" rx="0.5"/><rect x="29" y="29" width="7" height="7" rx="0.5"/><rect x="37" y="29" width="7" height="7" rx="0.5"/><rect x="13" y="37" width="7" height="7" rx="0.5"/><rect x="21" y="37" width="7" height="7" rx="0.5"/><rect x="29" y="37" width="7" height="7" rx="0.5"/><rect x="37" y="37" width="7" height="7" rx="0.5"/></g></svg>`
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
    card.addEventListener('click', () => handleMemoryModeSelect(mode.id));
    grid.appendChild(card);
  });
}

function handleMemoryModeSelect(modeId) {
  gameState.memory.playMode = modeId;
  showScreen('memory-screen');
  startMemoryGame();
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

  const hintEl = document.getElementById('surprise-multiplier-hint');
  if (hintEl) {
    const m = getSurpriseMultiplier();
    hintEl.textContent = `مؤقت ×${m} | نقاط ×${m}`;
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

    if (!session.surpriseShown && session.completedGameIds.length >= 3 && isSurpriseEnabled()) {
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
  updateGameScoresDisplay('trivia-scores', 'trivia-score-item');
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
  gameState.trivia.timeLeft = getRoundDuration(getTiming('trivia', 'play', 15));
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
    setColoredTeamLabel(teamLabelEl, 'دور فريق: ', teamName);
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
  updateGameScoresDisplay('sentence-scores', 'sentence-score-item');
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
  gameState.sentence.timeLeft = getRoundDuration(getTiming('sentence', 'play', 30));
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

let sentenceDragState = null;

// المسافة (بكسل) التي يجب أن يقطعها الضغط قبل اعتباره سحبًا بدل نقرة عابرة —
// تمنع النقرات السريعة من إزاحة ترتيب الكلمات عن طريق الخطأ.
const SENTENCE_DRAG_THRESHOLD = 5;

function syncSentenceWordsFromDom() {
  const wordsEl = document.getElementById('sentence-words');
  if (!wordsEl) return;

  const chips = wordsEl.querySelectorAll('.sentence-word');
  gameState.sentence.currentWords = [...chips].map((chip) => chip.textContent.trim());
  chips.forEach((chip, index) => {
    chip.dataset.index = String(index);
  });
}

function clearSentenceDragUi() {
  const wordsEl = document.getElementById('sentence-words');
  if (!wordsEl) return;

  wordsEl.classList.remove('is-drag-active');
  wordsEl.querySelectorAll('.sentence-word').forEach((chip) => {
    chip.classList.remove('is-dragging', 'is-nudged');
    if (chip._flipAnim) {
      chip._flipAnim.cancel();
      chip._flipAnim = null;
    }
    chip.style.transform = '';
    chip.style.transition = '';
    chip.style.willChange = '';
  });
}

// تنقل القطعة المسحوبة إلى جوار الكلمة التي يقف فوقها المؤشر، ثم تُمرّر الكلمات
// المُزاحة إلى مواقعها الجديدة بانسيابية عبر تقنية FLIP بدل القفز المفاجئ.
// مراعية لاتجاه RTL: وجود المؤشر يمين منتصف كلمة يعني أنها "أسبق في ترتيب القراءة".
function reorderSentenceWordToPointer(wordsEl, dragging, clientX, clientY) {
  const others = [...wordsEl.querySelectorAll('.sentence-word:not(.is-dragging)')];
  if (!others.length) return;

  let closest = null;
  let closestCenterX = 0;
  let closestDist = Infinity;
  for (const chip of others) {
    const rect = chip.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = (cx - clientX) ** 2 + (cy - clientY) ** 2;
    if (dist < closestDist) {
      closestDist = dist;
      closest = chip;
      closestCenterX = cx;
    }
  }
  if (!closest) return;

  let ref = clientX > closestCenterX ? closest : closest.nextElementSibling;
  if (ref === dragging) ref = dragging.nextElementSibling;

  // القطعة بالفعل في موضعها الصحيح — نتجنّب إعادة التخطيط والحركة بلا داعٍ.
  if (dragging.nextElementSibling === ref) return;

  // FLIP: نلتقط مواضع الكلمات قبل النقل، ننقل، ثم نُحرّكها من القديم إلى الجديد.
  const before = new Map();
  others.forEach((chip) => before.set(chip, chip.getBoundingClientRect()));

  wordsEl.insertBefore(dragging, ref);

  others.forEach((chip) => {
    const prev = before.get(chip);
    const next = chip.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    animateSentenceWordSlide(chip, dx, dy);
  });
}

// تُحرّك الكلمة من إزاحتها القديمة (dx, dy) إلى موضعها الجديد عبر Web Animations API.
// الميزة: لا تُعدّل style.transform إطلاقًا فلا يبقى أي تحويل عالقًا بعد الانتهاء،
// ونُلغي أي حركة جارية على الكلمة كي لا تتراكم الإزاحات عند السحب السريع.
function animateSentenceWordSlide(chip, dx, dy) {
  if (chip._flipAnim) chip._flipAnim.cancel();
  const anim = chip.animate(
    [
      { transform: `translate(${dx}px, ${dy}px)` },
      { transform: 'translate(0, 0)' },
    ],
    { duration: 220, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }
  );
  chip._flipAnim = anim;
  anim.onfinish = anim.oncancel = () => {
    if (chip._flipAnim === anim) chip._flipAnim = null;
  };
}

function applySentenceDragTransform(state) {
  // النقل (translate) يلاحق المؤشر، والتكبير (scale) يطابق هيئة الرفع المعرّفة في
  // ‎.is-dragging‎ (التي نتجاوز تحويلها هنا مع الإبقاء على ظلّها وحدودها).
  state.chip.style.transform =
    `translate(${state.tx}px, ${state.ty}px) scale(1.08)`;
}

function beginSentenceDrag(state) {
  state.active = true;
  state.chip.classList.add('is-dragging');
  state.chip.style.transition = 'none';
  state.chip.style.willChange = 'transform';
  applySentenceDragTransform(state);
  document.getElementById('sentence-words')?.classList.add('is-drag-active');
}

function teardownSentenceDragListeners() {
  window.removeEventListener('pointermove', handleSentenceWordPointerMove);
  window.removeEventListener('pointerup', handleSentenceWordPointerEnd);
  window.removeEventListener('pointercancel', handleSentenceWordPointerEnd);
}

function handleSentenceWordPointerDown(event) {
  if (gameState.sentence.answered || event.button > 0) return;

  // شبكة أمان: إن بقي سحب سابق عالقًا (مثلاً لم يصل له pointerup) ننهيه وننظّف
  // كل أثر له قبل بدء سحب جديد، فلا تتراكم كلمات عالقة في منتصف السحب.
  if (sentenceDragState) {
    teardownSentenceDragListeners();
    clearSentenceDragUi();
    sentenceDragState = null;
  }

  event.preventDefault();

  const chip = event.currentTarget;
  const rect = chip.getBoundingClientRect();
  sentenceDragState = {
    pointerId: event.pointerId,
    chip,
    startX: event.clientX,
    startY: event.clientY,
    grabX: event.clientX - rect.left,
    grabY: event.clientY - rect.top,
    tx: 0,
    ty: 0,
    active: false,
  };

  // نتتبّع الإيماءة على مستوى النافذة لا على القطعة: هذا يضمن وصول pointermove
  // وpointerup دائمًا حتى لو تغيّر موضع القطعة في DOM أثناء إعادة الترتيب أو خرج
  // المؤشر عنها أو فُقد التقاط المؤشر — وإلا يتجمّد السحب وتبقى الكلمة عالقة.
  window.addEventListener('pointermove', handleSentenceWordPointerMove);
  window.addEventListener('pointerup', handleSentenceWordPointerEnd);
  window.addEventListener('pointercancel', handleSentenceWordPointerEnd);
  // الالتقاط مكمّل (يمنع تمرير الصفحة على اللمس) لكن صحّة السحب لا تعتمد عليه.
  try {
    chip.setPointerCapture(event.pointerId);
  } catch (_) {
    /* الالتقاط غير متاح — تتبّع النافذة يكفي */
  }
}

function handleSentenceWordPointerMove(event) {
  const state = sentenceDragState;
  if (!state || event.pointerId !== state.pointerId) return;

  if (!state.active) {
    const moved = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
    if (moved < SENTENCE_DRAG_THRESHOLD) return;
    beginSentenceDrag(state);
  }

  const wordsEl = document.getElementById('sentence-words');
  if (!wordsEl) return;

  reorderSentenceWordToPointer(wordsEl, state.chip, event.clientX, event.clientY);

  // نُبقي القطعة ملتصقة بالمؤشر حتى بعد تغيّر موضعها في الصف: نشتقّ موضعها
  // الطبيعي من القياس الحيّ ثم نزيحها إليه (rect.left − tx ≈ الموضع الطبيعي).
  const liveRect = state.chip.getBoundingClientRect();
  state.tx = event.clientX - state.grabX - (liveRect.left - state.tx);
  state.ty = event.clientY - state.grabY - (liveRect.top - state.ty);
  applySentenceDragTransform(state);
}

function settleSentenceDraggedChip(chip) {
  chip.style.transition = '';
  chip.style.willChange = '';
  // نُثبّت التحويل الحالي قبل إزالته كي تنزلق القطعة إلى مكانها بدل أن تقفز.
  void chip.offsetWidth;
  chip.style.transform = '';
  chip.classList.remove('is-dragging');
}

function handleSentenceWordPointerEnd(event) {
  const state = sentenceDragState;
  if (!state || event.pointerId !== state.pointerId) return;

  const { chip } = state;
  try {
    chip.releasePointerCapture(event.pointerId);
  } catch (_) {
    /* المؤشر مُحرَّر مسبقًا */
  }
  teardownSentenceDragListeners();

  sentenceDragState = null;
  document.getElementById('sentence-words')?.classList.remove('is-drag-active');

  if (!state.active) {
    chip.style.willChange = '';
    return;
  }

  syncSentenceWordsFromDom();
  settleSentenceDraggedChip(chip);
}

function renderSentenceWords() {
  const wordsEl = document.getElementById('sentence-words');
  if (!wordsEl) return;

  clearSentenceDragUi();
  sentenceDragState = null;
  wordsEl.innerHTML = '';

  gameState.sentence.currentWords.forEach((word, index) => {
    const chip = document.createElement('span');
    chip.className = 'sentence-word';
    chip.textContent = word;
    chip.dataset.index = String(index);
    chip.setAttribute('role', 'listitem');
    chip.addEventListener('pointerdown', handleSentenceWordPointerDown);

    wordsEl.appendChild(chip);
  });
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

function showSentenceNextButton(show) {
  const btn = document.getElementById('sentence-next-btn');
  if (btn) btn.hidden = !show;
}

function handleSentenceNext() {
  if (!gameState.sentence.answered) return;
  showNextSentenceRound();
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
  showSentenceNextButton(true);
}

function handleSentenceCheck() {
  if (gameState.sentence.answered) return;

  const { sentence } = gameState;
  const isCorrect =
    sentence.currentWords.join(' ') === sentence.correctWords.join(' ');
  const elapsedSeconds = (Date.now() - sentence.questionStartTime) / 1000;

  if (isCorrect) {
    const teamName = getCurrentSentenceTeamName();
    const { points } = calculateSpeedPoints(elapsedSeconds, getSpeedThreshold('sentence'));
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
  showSentenceNextButton(true);
}

function showNextSentenceRound() {
  clearSentenceTimers();
  hideSentenceFeedback();
  showSentenceNextButton(false);

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
  sentence.answered = false;
  sentence.questionStartTime = Date.now();

  const teamLabelEl = document.getElementById('sentence-team-label');
  const progressEl = document.getElementById('sentence-progress');
  const teamName = getCurrentSentenceTeamName();
  const roundCount = sentence.teamRoundCounts[teamName];

  if (teamLabelEl) {
    setColoredTeamLabel(teamLabelEl, 'دور فريق: ', teamName);
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

function clearPicmergePenaltyTimers() {
  const { penalties } = gameState.picmerge;
  Object.keys(penalties).forEach((teamName) => {
    stopPicmergePenalty(teamName);
  });
  gameState.picmerge.penalties = {};
  gameState.picmerge.penaltyDisplayTeam = null;
  hideTaifGameTimer();
}

function clearPicmergeTimers() {
  stopPicmergeTimer();
  clearPicmergePenaltyTimers();

  const { picmerge } = gameState;
  if (picmerge.feedbackTimeoutId) {
    clearTimeout(picmerge.feedbackTimeoutId);
    picmerge.feedbackTimeoutId = null;
  }
}

function isPicmergeBattleComplete() {
  return gameState.picmerge.completedBattleRounds >= gameState.picmerge.roundsPerTeam;
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
  updateGameScoresDisplay('picmerge-scores', 'picmerge-score-item');
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

function setupPicmergeUILayout(mode) {
  const screen = document.getElementById('picmerge-screen');
  const turnRow = document.getElementById('picmerge-input-row');
  const battleInputs = document.getElementById('picmerge-battle-inputs');
  const timerEl = document.getElementById('picmerge-timer');
  const teamLabelEl = document.getElementById('picmerge-team-label');
  const isBattle = mode === 'battle';

  screen?.classList.toggle('picmerge-screen--battle', isBattle);

  if (turnRow) turnRow.hidden = isBattle;
  if (battleInputs) {
    battleInputs.hidden = !isBattle;
    if (isBattle) renderPicmergeBattleInputs();
  }
  if (timerEl) timerEl.hidden = isBattle;

  if (isBattle && teamLabelEl) {
    teamLabelEl.textContent = 'جميع الفرق — من يجيب أولاً يفوز!';
    teamLabelEl.style.removeProperty('color');
  }
}

function renderPicmergeBattleInputs() {
  const container = document.getElementById('picmerge-battle-inputs');
  if (!container) return;
  container.innerHTML = '';

  gameState.teams.forEach((teamName, index) => {
    const row = document.createElement('div');
    row.className = 'picmerge-battle-row';
    row.dataset.teamIndex = String(index);

    const label = document.createElement('span');
    label.className = 'picmerge-battle-team-label';
    label.textContent = teamName;
    applyTeamLabelColor(label, teamName);

    const wrap = document.createElement('div');
    wrap.className = 'picmerge-battle-input-wrap';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'picmerge-input ui-input picmerge-battle-input';
    input.placeholder = 'اكتب الكلمة…';
    input.maxLength = 40;
    input.dataset.teamIndex = String(index);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary picmerge-battle-submit';
    btn.textContent = 'تخمين';
    btn.dataset.teamIndex = String(index);

    wrap.appendChild(input);
    wrap.appendChild(btn);
    row.appendChild(label);
    row.appendChild(wrap);
    container.appendChild(row);

    btn.addEventListener('click', () => handlePicmergeBattleSubmit(index));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handlePicmergeBattleSubmit(index);
      }
    });
  });
}

function getPicmergeBattleRow(teamIndex) {
  return document.querySelector(`.picmerge-battle-row[data-team-index="${teamIndex}"]`);
}

function setPicmergeBattleInputEnabled(teamIndex, enabled) {
  const row = getPicmergeBattleRow(teamIndex);
  if (!row) return;
  const input = row.querySelector('.picmerge-battle-input');
  const btn = row.querySelector('.picmerge-battle-submit');
  if (input) input.disabled = !enabled;
  if (btn) btn.disabled = !enabled;
}

function updatePicmergePenaltyTimerDisplay() {
  const { picmerge } = gameState;
  const teamName = picmerge.penaltyDisplayTeam;
  const penalty = teamName ? picmerge.penalties[teamName] : null;

  if (!penalty || !teamName) {
    hideTaifGameTimer();
    return;
  }

  const timeLeft = penalty.timeLeft;
  const timerEl = document.getElementById('picmerge-timer');
  if (timerEl) {
    timerEl.textContent = String(timeLeft);
    timerEl.classList.toggle('timer-warning', timeLeft <= 5);
  }
  maybePlayTimerTick(timeLeft, 'picmerge');
  syncGameTimer('picmerge', timeLeft, { active: true });
}

function pickNextPicmergePenaltyDisplayTeam() {
  const { penalties } = gameState.picmerge;
  const teamNames = Object.keys(penalties);

  if (teamNames.length === 0) {
    gameState.picmerge.penaltyDisplayTeam = null;
    hideTaifGameTimer();
    return;
  }

  let nextTeam = teamNames[0];
  let minTime = penalties[nextTeam].timeLeft;
  teamNames.forEach((name) => {
    if (penalties[name].timeLeft < minTime) {
      minTime = penalties[name].timeLeft;
      nextTeam = name;
    }
  });

  gameState.picmerge.penaltyDisplayTeam = nextTeam;
  updatePicmergePenaltyTimerDisplay();
}

function stopPicmergePenalty(teamName) {
  const entry = gameState.picmerge.penalties[teamName];
  if (entry?.timerId) {
    clearInterval(entry.timerId);
  }
  delete gameState.picmerge.penalties[teamName];

  const teamIndex = gameState.teams.indexOf(teamName);
  const row = getPicmergeBattleRow(teamIndex);
  row?.classList.remove('picmerge-battle-row--penalized');

  if (gameState.picmerge.penaltyDisplayTeam === teamName) {
    pickNextPicmergePenaltyDisplayTeam();
  }
}

function startPicmergePenalty(teamName) {
  const { picmerge } = gameState;
  if (picmerge.answered) return;

  const teamIndex = gameState.teams.indexOf(teamName);
  if (teamIndex === -1) return;

  stopPicmergePenalty(teamName);

  const row = getPicmergeBattleRow(teamIndex);
  const input = row?.querySelector('.picmerge-battle-input');
  if (input) input.value = '';

  setPicmergeBattleInputEnabled(teamIndex, false);
  row?.classList.add('picmerge-battle-row--penalized');

  const duration = getRoundDuration(getTiming('picmerge', 'penalty', 15));
  picmerge.penaltyDisplayTeam = teamName;
  updatePicmergePenaltyTimerDisplay();

  picmerge.penalties[teamName] = {
    timeLeft: duration,
    timerId: setInterval(() => {
      const penalty = picmerge.penalties[teamName];
      if (!penalty) return;

      penalty.timeLeft -= 1;
      if (picmerge.penaltyDisplayTeam === teamName) {
        updatePicmergePenaltyTimerDisplay();
      }

      if (penalty.timeLeft <= 0) {
        stopPicmergePenalty(teamName);
        if (!picmerge.answered) {
          setPicmergeBattleInputEnabled(teamIndex, true);
        }
      }
    }, 1000)
  };
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
  gameState.picmerge.timeLeft = getRoundDuration(getTiming('picmerge', 'play', 40));
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
  if (gameState.picmerge.answered || gameState.picmerge.playMode !== 'turns') return;

  const inputEl = document.getElementById('picmerge-input');
  const guessText = normalizePicmergeText(inputEl?.value || '');
  if (!guessText) return;

  const { picmerge } = gameState;
  const isCorrect = isPicmergeAnswerCorrect(picmerge.currentPuzzle, guessText);
  const elapsedSeconds = (Date.now() - picmerge.questionStartTime) / 1000;

  if (isCorrect) {
    const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, getSpeedThreshold('picmerge'));
    finishPicmergeRound(true, points, `صح! +${points} نقطة${bonusText}`);
    return;
  }

  showPicmergeFeedback('خطأ! حاول مرة أخرى', false);
}

function handlePicmergeBattleSubmit(teamIndex) {
  const { picmerge } = gameState;
  if (picmerge.answered || picmerge.playMode !== 'battle') return;

  const teamName = gameState.teams[teamIndex];
  if (!teamName || picmerge.penalties[teamName]) return;

  const row = getPicmergeBattleRow(teamIndex);
  const input = row?.querySelector('.picmerge-battle-input');
  const guessText = normalizePicmergeText(input?.value || '');
  if (!guessText) return;

  const isCorrect = isPicmergeAnswerCorrect(picmerge.currentPuzzle, guessText);
  const elapsedSeconds = (Date.now() - picmerge.questionStartTime) / 1000;

  if (isCorrect) {
    const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, getSpeedThreshold('picmerge'));
    finishPicmergeBattleRound(teamName, points, `صح! ${teamName} +${points} نقطة${bonusText}`);
    return;
  }

  playLoseSound();
  startPicmergePenalty(teamName);
  if (typeof maybeTaifLoseQuip === 'function') maybeTaifLoseQuip();
}

function finishPicmergeBattleRound(teamName, points, message) {
  gameState.picmerge.answered = true;
  clearPicmergePenaltyTimers();

  gameState.teams.forEach((_, index) => {
    setPicmergeBattleInputEnabled(index, false);
  });

  addTeamScore(teamName, points);
  showPicmergeFeedback(message, true);
  if (typeof taifQuipCorrect === 'function') taifQuipCorrect();

  gameState.picmerge.completedBattleRounds += 1;
  updatePicmergeScoresDisplay();
  scheduleNextPicmergeRound();
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

  if (gameState.picmerge.playMode === 'battle') {
    showNextPicmergeBattleRound();
    return;
  }

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
    setColoredTeamLabel(teamLabelEl, 'دور فريق: ', teamName);
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

function showNextPicmergeBattleRound() {
  if (isPicmergeBattleComplete()) {
    finishPicmergeGame();
    return;
  }

  const puzzle = getNextPicmergePuzzle();
  const { picmerge } = gameState;

  picmerge.currentPuzzle = puzzle;
  picmerge.answered = false;
  picmerge.questionStartTime = Date.now();

  const progressEl = document.getElementById('picmerge-progress');
  if (progressEl) {
    progressEl.textContent = `التحدي ${picmerge.completedBattleRounds + 1} من ${picmerge.roundsPerTeam}`;
  }

  gameState.teams.forEach((_, index) => {
    const row = getPicmergeBattleRow(index);
    const input = row?.querySelector('.picmerge-battle-input');
    if (input) input.value = '';
    setPicmergeBattleInputEnabled(index, true);
  });

  showPicmergeImage(puzzle);
  updatePicmergeScoresDisplay();
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
  gameState.picmerge.completedBattleRounds = 0;
  gameState.picmerge.penalties = {};
  gameState.picmerge.penaltyDisplayTeam = null;
  gameState.picmerge.answered = false;
  gameState.picmerge.currentPuzzle = null;

  gameState.teams.forEach((team) => {
    gameState.picmerge.teamRoundCounts[team] = 0;
  });

  setupPicmergeUILayout(gameState.picmerge.playMode);
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
  updateGameScoresDisplay('spot-scores', 'spot-score-item');
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

  // Photo pairs may be square (or any ratio); keep both scenes matching the
  // image box so the normalized difference coordinates line up with clicks.
  const aspect = puzzle.aspect || '4 / 3';
  leftScene.style.aspectRatio = aspect;
  rightScene.style.aspectRatio = aspect;

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
  gameState.spot.timeLeft = getRoundDuration(getTiming('spot', 'play', 60));
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

function showSpotNextButton(show) {
  const btn = document.getElementById('spot-next-btn');
  if (btn) btn.hidden = !show;
}

function handleSpotNext() {
  if (gameState.spot.roundActive) return;
  showNextSpotRound();
}

function finishSpotRound(message, isSuccess) {
  gameState.spot.roundActive = false;
  stopSpotTimer();
  showSpotFeedback(message, isSuccess);
  updateSpotScoresDisplay();
  advanceSpotTurn();
  showSpotNextButton(true);
}

function handleSpotCanvasClick(event) {
  const { spot } = gameState;
  if (!spot.roundActive || !spot.currentPuzzle) return;

  const sceneEl = document.getElementById('spot-right-scene');
  if (!sceneEl) return;

  const { x, y } = getSpotCanvasRelativeCoords(sceneEl, event);
  if (x < 0 || x > 1 || y < 0 || y > 1) return;

  const hitIndex = findHitSpotDifference(x, y);

  if (hitIndex === -1) {
    placeSpotMarker(x, y, 'wrong');
    gameState.spot.timeLeft = Math.max(0, gameState.spot.timeLeft - getTiming('spot', 'penalty', 2));
    updateSpotTimerDisplay();
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
  showSpotNextButton(false);

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
    setColoredTeamLabel(teamLabelEl, 'دور فريق: ', teamName);
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

const MEMORY_MODES = {
  easy: { gridSize: 2, memorizeSec: 7, playSec: 15 },
  medium: { gridSize: 3, memorizeSec: 20, playSec: 45 },
  hard: { gridSize: 4, memorizeSec: 45, playSec: 60 }
};
const MEMORY_MISMATCH_PENALTY_SEC = 2;
const MEMORY_MISMATCH_FLASH_MS = 1000;

function getMemoryModeConfig() {
  const mode = gameState.memory.playMode;
  const base = MEMORY_MODES[mode] || MEMORY_MODES.medium;
  const ov = window.TAIF_SETTINGS && window.TAIF_SETTINGS.memory && window.TAIF_SETTINGS.memory[mode];
  if (!ov) return base;
  return {
    gridSize: base.gridSize,
    memorizeSec: (typeof ov.memorizeSec === 'number' && ov.memorizeSec > 0) ? ov.memorizeSec : base.memorizeSec,
    playSec: (typeof ov.playSec === 'number' && ov.playSec > 0) ? ov.playSec : base.playSec
  };
}

function getMemoryCellCount() {
  const { gridSize } = getMemoryModeConfig();
  return gridSize * gridSize;
}

function clearMemoryTimers() {
  taifExitGridMode();
  setTaifLayout('compact');
  const { memory } = gameState;
  if (memory.memorizeTimerId) {
    clearInterval(memory.memorizeTimerId);
    memory.memorizeTimerId = null;
  }
  if (memory.mismatchFlashId) {
    clearTimeout(memory.mismatchFlashId);
    memory.mismatchFlashId = null;
  }
  if (memory.penaltyFlashTimeoutId) {
    clearTimeout(memory.penaltyFlashTimeoutId);
    memory.penaltyFlashTimeoutId = null;
  }
  if (memory.timerId) {
    clearInterval(memory.timerId);
    memory.timerId = null;
  }
  if (memory.feedbackTimeoutId) {
    clearTimeout(memory.feedbackTimeoutId);
    memory.feedbackTimeoutId = null;
  }
  memory.inputLocked = false;
  memory.flashPair = null;
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

const MEMORY_EMPTY_CELL = -1;

function getMemoryPairCount() {
  const mode = getMemoryModeConfig();
  if (mode.gridSize === 3) return 4;
  return (mode.gridSize * mode.gridSize) / 2;
}

function isMemoryEmptyCell(index) {
  return gameState.memory.cardOrder[index] === MEMORY_EMPTY_CELL;
}

function buildMemoryRoundLayout() {
  const mode = getMemoryModeConfig();
  const pairCount = getMemoryPairCount();
  const icons = shuffleArray(MEMORY_ICON_PUZZLES.map((_, index) => index)).slice(0, pairCount);
  const cards = shuffleArray([...icons, ...icons]);

  if (mode.gridSize === 3) {
    cards.splice(4, 0, MEMORY_EMPTY_CELL);
  }

  return cards;
}

function syncMemoryBoardWrapSize() {
  const wrap = document.querySelector('.memory-board-wrap');
  const gridSize = String(getMemoryModeConfig().gridSize);
  if (wrap) wrap.dataset.size = gridSize;
}

function updateMemoryScoresDisplay() {
  updateGameScoresDisplay('memory-scores', 'memory-score-item');
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

function updateMemoryMemorizeTimerDisplay() {
  const { memory } = gameState;
  const timerEl = document.getElementById('memory-timer');
  if (timerEl) {
    timerEl.textContent = String(memory.memorizeTimeLeft);
    timerEl.classList.remove('timer-warning');
    timerEl.classList.toggle('timer-memorize', memory.phase === 'memorize');
  }

  syncGameTimer('memory', memory.memorizeTimeLeft, {
    active: !!memory.memorizeTimerId && memory.phase === 'memorize',
    memorize: true,
    warning: false
  });
}

function updateMemoryTimerDisplay() {
  const timerEl = document.getElementById('memory-timer');
  if (!timerEl) return;

  timerEl.classList.remove('timer-memorize');
  timerEl.textContent = String(gameState.memory.timeLeft);
  timerEl.classList.toggle('timer-warning', gameState.memory.timeLeft <= 5);
  maybePlayTimerTick(gameState.memory.timeLeft, 'memory');
  syncGameTimer('memory', gameState.memory.timeLeft, {
    active: !!gameState.memory.timerId && gameState.memory.phase === 'play'
  });
}

function showMemoryPenaltyFlash() {
  const el = document.getElementById('memory-penalty-flash');
  if (!el) return;

  const { memory } = gameState;
  el.hidden = false;
  el.textContent = '−2';

  if (memory.penaltyFlashTimeoutId) {
    clearTimeout(memory.penaltyFlashTimeoutId);
  }

  memory.penaltyFlashTimeoutId = setTimeout(() => {
    memory.penaltyFlashTimeoutId = null;
    el.hidden = true;
  }, 1000);
}

function setMemoryPhaseUI(phase) {
  const timerEl = document.getElementById('memory-timer');
  const hintEl = document.getElementById('memory-phase-hint');
  const penaltyEl = document.getElementById('memory-penalty-flash');

  if (phase === 'memorize') {
    if (timerEl) {
      timerEl.hidden = false;
      timerEl.classList.add('timer-memorize');
      timerEl.classList.remove('timer-warning');
    }
    if (penaltyEl) penaltyEl.hidden = true;
    if (hintEl) hintEl.textContent = 'احفظ أماكن الصور!';
  } else if (phase === 'play') {
    if (timerEl) {
      timerEl.hidden = false;
      timerEl.classList.remove('timer-memorize');
    }
    if (hintEl) hintEl.textContent = 'افتح خليتين متطابقتين';
  }
}

function drawMemoryIcon(canvas, puzzleIndex) {
  const puzzle = MEMORY_ICON_PUZZLES[puzzleIndex];
  if (!puzzle) return;

  const size = 128;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#2a2a44';
  ctx.fillRect(0, 0, size, size);

  // محتوى المستخدم: صورة مرفوعة بدل دالة الرسم
  if (puzzle.image) {
    const img = puzzle._imgEl || (puzzle._imgEl = Object.assign(new Image(), { src: puzzle.image }));
    if (!(img.complete && img.naturalWidth)) {
      img.onload = () => drawMemoryIcon(canvas, puzzleIndex);
      return;
    }
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(6, 6, size - 12, size - 12, size * 0.16);
    ctx.clip();
    ctx.drawImage(img, sx, sy, side, side, 6, 6, size - 12, size - 12);
    ctx.restore();
    return;
  }

  const iconSize = size * 0.72;
  const pad = (size - iconSize) / 2;
  ctx.save();
  ctx.translate(pad, pad);
  puzzle.draw(ctx, iconSize);
  ctx.restore();
}

function isMemoryCellVisible(index) {
  const { memory } = gameState;
  if (isMemoryEmptyCell(index)) return false;
  if (memory.phase === 'memorize') return true;
  if (memory.matched[index]) return true;

  if (memory.flashPair && (memory.flashPair.a === index || memory.flashPair.b === index)) {
    return true;
  }

  if (memory.selection === index) return true;

  return false;
}

function isMemoryCellInteractive(index) {
  const { memory } = gameState;
  if (memory.phase !== 'play' || memory.answered || memory.inputLocked) return false;
  if (isMemoryEmptyCell(index)) return false;
  if (memory.matched[index]) return false;
  return true;
}

function renderMemoryGrid() {
  const gridEl = document.getElementById('memory-grid');
  if (!gridEl) return;

  const { memory } = gameState;
  const cellCount = memory.cardOrder.length;
  gridEl.innerHTML = '';
  gridEl.dataset.size = String(getMemoryModeConfig().gridSize);
  syncMemoryBoardWrapSize();

  for (let i = 0; i < cellCount; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-cell';
    button.dataset.index = String(i);

    if (isMemoryEmptyCell(i)) {
      button.classList.add('empty');
      button.disabled = true;
      gridEl.appendChild(button);
      continue;
    }

    const visible = isMemoryCellVisible(i);
    if (!visible) {
      button.classList.add('hidden');
    }
    if (memory.matched[i]) {
      button.classList.add('matched');
    }
    if (memory.selection === i) {
      button.classList.add('selected');
    }

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    drawMemoryIcon(canvas, memory.cardOrder[i]);
    button.appendChild(canvas);

    if (!visible) {
      button.classList.add('hidden');
    }

    if (isMemoryCellInteractive(i)) {
      button.addEventListener('click', () => handleMemoryCellClick(i));
    } else if (!isMemoryEmptyCell(i)) {
      button.disabled = true;
    }

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
  if (gameState.memory.timerId) {
    clearInterval(gameState.memory.timerId);
    gameState.memory.timerId = null;
  }
  const mode = getMemoryModeConfig();
  gameState.memory.timeLeft = getRoundDuration(mode.playSec);
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

function stopMemoryMemorizeTimer() {
  if (gameState.memory.memorizeTimerId) {
    clearInterval(gameState.memory.memorizeTimerId);
    gameState.memory.memorizeTimerId = null;
  }
}

function startMemoryMemorizePhase() {
  const { memory } = gameState;
  const cellCount = getMemoryCellCount();
  const mode = getMemoryModeConfig();

  memory.phase = 'memorize';
  memory.selection = null;
  memory.flashPair = null;
  memory.inputLocked = false;
  memory.matched = Array(cellCount).fill(false);
  memory.answered = false;

  setMemoryPhaseUI('memorize');
  hideMemoryFeedback();
  renderMemoryGrid();
  setTaifMotion('idle');

  stopMemoryMemorizeTimer();
  memory.memorizeTimeLeft = getRoundDuration(mode.memorizeSec);
  updateMemoryMemorizeTimerDisplay();

  memory.memorizeTimerId = setInterval(() => {
    memory.memorizeTimeLeft -= 1;
    updateMemoryMemorizeTimerDisplay();

    if (memory.memorizeTimeLeft <= 0) {
      stopMemoryMemorizeTimer();
      startMemoryPlayPhase();
    }
  }, 1000);
}

function startMemoryPlayPhase() {
  const { memory } = gameState;

  stopMemoryMemorizeTimer();
  resetTaifActorPosition();
  setTaifLayout('compact');

  memory.phase = 'play';
  memory.selection = null;
  memory.flashPair = null;
  memory.inputLocked = false;
  memory.questionStartTime = Date.now();
  memory.answered = false;

  setMemoryPhaseUI('play');
  renderMemoryGrid();
  startMemoryTimer();
}

function isMemoryBoardComplete() {
  const { memory } = gameState;
  return memory.cardOrder.every((icon, index) => {
    if (icon === MEMORY_EMPTY_CELL) return true;
    return memory.matched[index];
  });
}

function applyMemoryMismatchPenalty(indexA, indexB) {
  const { memory } = gameState;

  memory.inputLocked = true;
  memory.flashPair = { a: indexA, b: indexB };
  memory.selection = null;
  renderMemoryGrid();

  memory.timeLeft = Math.max(0, memory.timeLeft - getTiming('memory', 'penalty', MEMORY_MISMATCH_PENALTY_SEC));
  updateMemoryTimerDisplay();
  showMemoryPenaltyFlash();
  playLoseSound();
  if (typeof maybeTaifLoseQuip === 'function') maybeTaifLoseQuip();

  if (memory.timeLeft <= 0) {
    stopMemoryTimer();
  }

  if (memory.mismatchFlashId) {
    clearTimeout(memory.mismatchFlashId);
  }

  memory.mismatchFlashId = setTimeout(() => {
    memory.mismatchFlashId = null;
    memory.flashPair = null;
    memory.inputLocked = false;

    if (memory.timeLeft <= 0) {
      handleMemoryTimeout();
      return;
    }

    renderMemoryGrid();
  }, MEMORY_MISMATCH_FLASH_MS);
}

function handleMemoryCellClick(index) {
  const { memory } = gameState;
  if (!isMemoryCellInteractive(index)) return;

  if (memory.selection === null) {
    memory.selection = index;
    renderMemoryGrid();
    return;
  }

  if (memory.selection === index) {
    memory.selection = null;
    renderMemoryGrid();
    return;
  }

  const firstIndex = memory.selection;
  const secondIndex = index;

  if (memory.cardOrder[firstIndex] === memory.cardOrder[secondIndex]) {
    memory.matched[firstIndex] = true;
    memory.matched[secondIndex] = true;
    memory.selection = null;
    renderMemoryGrid();

    if (isMemoryBoardComplete()) {
      const elapsedSeconds = (Date.now() - memory.questionStartTime) / 1000;
      const { points } = calculateSpeedPoints(elapsedSeconds, getSpeedThreshold('memory'));
      finishMemoryRoundAfterAnswer(true, points);
      if (typeof taifQuipCorrect === 'function') taifQuipCorrect();
    }
    return;
  }

  applyMemoryMismatchPenalty(firstIndex, secondIndex);
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

function showMemoryNextButton(show) {
  const btn = document.getElementById('memory-next-btn');
  if (btn) btn.hidden = !show;
}

function handleMemoryNext() {
  if (!gameState.memory.answered) return;
  showNextMemoryRound();
}

function finishMemoryRoundAfterAnswer(isCorrect, points) {
  const { memory } = gameState;
  memory.answered = true;
  stopMemoryTimer();

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
  showMemoryNextButton(true);
}

function handleMemoryTimeout() {
  if (gameState.memory.answered || gameState.memory.phase !== 'play') return;

  gameState.memory.answered = true;
  stopMemoryTimer();

  showMemoryFeedback('انتهى الوقت!', false);
  if (typeof taifQuipTimeout === 'function') taifQuipTimeout();
  playLoseSound();
  updateMemoryScoresDisplay();
  advanceMemoryTurn();
  showMemoryNextButton(true);
}

function showNextMemoryRound() {
  clearMemoryTimers();
  hideMemoryFeedback();
  showMemoryNextButton(false);

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
  const mode = getMemoryModeConfig();
  const cellCount = mode.gridSize * mode.gridSize;

  memory.currentTeamIndex = teamIndex;
  memory.gridSize = mode.gridSize;
  memory.cardOrder = buildMemoryRoundLayout();
  memory.matched = Array(cellCount).fill(false);
  memory.selection = null;
  memory.flashPair = null;
  memory.inputLocked = false;
  memory.phase = 'idle';
  memory.answered = false;

  const teamLabelEl = document.getElementById('memory-team-label');
  const progressEl = document.getElementById('memory-progress');
  const teamName = getCurrentMemoryTeamName();
  const roundCount = memory.teamRoundCounts[teamName];

  if (teamLabelEl) {
    setColoredTeamLabel(teamLabelEl, 'دور فريق: ', teamName);
  }

  if (progressEl) {
    progressEl.textContent = `الجولة ${roundCount + 1} من ${memory.roundsPerTeam}`;
  }

  updateMemoryScoresDisplay();
  startMemoryMemorizePhase();
}

const CREATIVE_CANVAS_WIDTH = 480;
const CREATIVE_CANVAS_HEIGHT = 336;

const CREATIVE_CHALLENGES = [
  { prompt: 'ارسم شجرة', target: 'شجرة' },
  { prompt: 'ارسم سيارة', target: 'سيارة' },
  { prompt: 'ارسم منزلاً', target: 'منزل' },
  { prompt: 'ارسم قطة', target: 'قطة' },
  { prompt: 'ارسم طائرة', target: 'طائرة' },
  { prompt: 'ارسم زهرة', target: 'زهرة' },
  { prompt: 'ارسم سمكة', target: 'سمكة' },
  { prompt: 'ارسم شمساً', target: 'شمس' },
  { prompt: 'ارسم سفينة', target: 'سفينة' },
  { prompt: 'ارسم وجهاً مبتسماً', target: 'وجه مبتسم' },
  { prompt: 'ارسم نجمة', target: 'نجمة' },
  { prompt: 'ارسم فيلاً', target: 'فيل' },
  { prompt: 'ارسم دراجة هوائية', target: 'دراجة هوائية' },
  { prompt: 'ارسم ساعة', target: 'ساعة' },
  { prompt: 'ارسم فنجان قهوة', target: 'فنجان قهوة' },
  { prompt: 'ارسم طائراً', target: 'طائر' },
  { prompt: 'ارسم قلباً', target: 'قلب' },
  { prompt: 'ارسم كلباً', target: 'كلب' },
  { prompt: 'ارسم بطة', target: 'بطة' },
  { prompt: 'ارسم أرنباً', target: 'أرنب' },
  { prompt: 'ارسم تفاحة', target: 'تفاحة' },
  { prompt: 'ارسم موزة', target: 'موزة' },
  { prompt: 'ارسم مظلة', target: 'مظلة' },
  { prompt: 'ارسم بالوناً', target: 'بالون' },
  { prompt: 'ارسم مفتاحاً', target: 'مفتاح' },
  { prompt: 'ارسم كوباً', target: 'كوب' },
  { prompt: 'ارسم هلالاً', target: 'هلال' },
  { prompt: 'ارسم سحابة', target: 'سحابة' },
  { prompt: 'ارسم علماً', target: 'علم' },
  { prompt: 'ارسم كرة', target: 'كرة' },
  { prompt: 'ارسم نظارة', target: 'نظارة' },
  { prompt: 'ارسم جبلاً', target: 'جبل' },
  { prompt: 'ارسم صاروخاً', target: 'صاروخ' },
  { prompt: 'ارسم فراشة', target: 'فراشة' },
  { prompt: 'ارسم آيس كريم', target: 'آيس كريم' },
  { prompt: 'ارسم جزرة', target: 'جزرة' },
  { prompt: 'ارسم بيتاً للطيور', target: 'بيت طيور' },
  { prompt: 'ارسم قبعة', target: 'قبعة' },
  { prompt: 'ارسم شمعة', target: 'شمعة' }
];

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text == null ? '' : String(text);
  return div.innerHTML;
}

// تقييم الرسمة عبر OpenRouter (واجهة متوافقة مع OpenAI، تدعم الرؤية).
// ⚠️ هذا المفتاح مكشوف لأي شخص يفتح الموقع المنشور — يُفضّل تدويره أو استخدام خادم وسيط.
const OPENROUTER_DEFAULT_KEY =
  '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';
// نموذج رؤية على OpenRouter — أذكى من lite لتعليقات مترابطة، وما زال رخيصاً.
// بدائل: google/gemini-2.5-flash-lite (أرخص)، openai/gpt-4o-mini (مدفوع).
const CREATIVE_AI_MODEL = 'google/gemini-2.5-flash';
// نموذج توليد الصور لتحويل الرسمة إلى نسخة واقعية بسيطة.
const CREATIVE_IMAGE_MODEL = 'google/gemini-2.5-flash-image';
const CREATIVE_API_KEY_STORAGE = 'taif_openrouter_api_key';

// ألوان التلوين الأساسية (متناسقة مع ألوان واجهة التطبيق).
const CREATIVE_COLORS = [
  { name: 'أسود', value: '#1a1a1a' },
  { name: 'أحمر', value: '#ff4757' },
  { name: 'برتقالي', value: '#ff9f1a' },
  { name: 'أصفر', value: '#ffd32a' },
  { name: 'أخضر', value: '#2ed573' },
  { name: 'أزرق', value: '#5b9fed' },
  { name: 'بنفسجي', value: '#a55eea' },
  { name: 'وردي', value: '#e84393' },
  { name: 'بني', value: '#8a5a2b' }
];
const CREATIVE_DEFAULT_COLOR = CREATIVE_COLORS[0].value;

function getCreativeApiKey() {
  try {
    const stored = (localStorage.getItem(CREATIVE_API_KEY_STORAGE) || '').trim();
    if (stored) return stored;
  } catch (error) {
    /* تجاهل: قد يكون التخزين المحلي معطّلاً */
  }
  return OPENROUTER_DEFAULT_KEY;
}

function setCreativeApiKey(key) {
  try {
    if (key) {
      localStorage.setItem(CREATIVE_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(CREATIVE_API_KEY_STORAGE);
    }
  } catch (error) {
    /* تجاهل: قد يكون التخزين المحلي معطّلاً */
  }
}

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
  updateGameScoresDisplay('creative-scores', 'creative-score-item');
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
  ctx.fillStyle = '#ffffff';
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

  canvas.addEventListener('pointerdown', (event) => {
    if (gameState.creative.phase !== 'create') return;
    const { x, y } = getCanvasPoint(event);
    const tool = gameState.creative.tool;

    if (tool === 'fill') {
      saveCreativeUndoState();
      floodFillCanvas(Math.round(x), Math.round(y), gameState.creative.brushColor || CREATIVE_DEFAULT_COLOR);
      event.preventDefault();
      return;
    }

    saveCreativeUndoState();
    gameState.creative.isDrawing = true;
    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        /* تجاهل: بعض المتصفحات قد ترفض الالتقاط */
      }
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    event.preventDefault();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!gameState.creative.isDrawing || gameState.creative.phase !== 'create') return;
    const { x, y } = getCanvasPoint(event);
    const tool = gameState.creative.tool;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : (gameState.creative.brushColor || CREATIVE_DEFAULT_COLOR);
    ctx.lineWidth = gameState.creative.brushSize || 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    event.preventDefault();
  });

  const stopDrawing = () => {
    gameState.creative.isDrawing = false;
  };

  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);

  gameState.creative.drawListenersBound = true;
}

function clearCreativeCanvas() {
  const canvas = getCreativeDrawCanvas();
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderCreativePalette() {
  const container = document.getElementById('creative-palette');
  if (!container || container.childElementCount) return;

  CREATIVE_COLORS.forEach((color, index) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'creative-swatch';
    swatch.style.backgroundColor = color.value;
    swatch.title = color.name;
    swatch.setAttribute('aria-label', color.name);
    if (index === 0) swatch.classList.add('active');
    swatch.addEventListener('click', () => {
      gameState.creative.brushColor = color.value;
      container.querySelectorAll('.creative-swatch').forEach((el) => {
        el.classList.toggle('active', el === swatch);
      });
      if (gameState.creative.tool === 'eraser') setCreativeActiveTool('brush');
    });
    container.appendChild(swatch);
  });
}

function saveCreativeUndoState() {
  const canvas = getCreativeDrawCanvas();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  gameState.creative.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  gameState.creative.redoStack = [];
  if (gameState.creative.undoStack.length > 30) gameState.creative.undoStack.shift();
}

function creativeUndo() {
  const canvas = getCreativeDrawCanvas();
  if (!canvas || !gameState.creative.undoStack.length) return;
  const ctx = canvas.getContext('2d');
  gameState.creative.redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  ctx.putImageData(gameState.creative.undoStack.pop(), 0, 0);
}

function creativeRedo() {
  const canvas = getCreativeDrawCanvas();
  if (!canvas || !gameState.creative.redoStack.length) return;
  const ctx = canvas.getContext('2d');
  gameState.creative.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  ctx.putImageData(gameState.creative.redoStack.pop(), 0, 0);
}

function hexToRGB(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 0, g: 0, b: 0 };
}

function floodFillCanvas(startX, startY, fillColor) {
  const canvas = getCreativeDrawCanvas();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const fill = hexToRGB(fillColor);
  const si = (startY * w + startX) * 4;
  const tR = d[si], tG = d[si + 1], tB = d[si + 2], tA = d[si + 3];
  if (tR === fill.r && tG === fill.g && tB === fill.b) return;
  const tol = 32;
  const stack = [startX, startY];
  const seen = new Uint8Array(w * h);
  while (stack.length) {
    const cy = stack.pop(), cx = stack.pop();
    const pi = cy * w + cx;
    if (seen[pi]) continue;
    const di = pi * 4;
    if (Math.abs(d[di] - tR) > tol || Math.abs(d[di + 1] - tG) > tol || Math.abs(d[di + 2] - tB) > tol || Math.abs(d[di + 3] - tA) > tol) continue;
    seen[pi] = 1;
    d[di] = fill.r; d[di + 1] = fill.g; d[di + 2] = fill.b; d[di + 3] = 255;
    if (cx > 0) stack.push(cx - 1, cy);
    if (cx < w - 1) stack.push(cx + 1, cy);
    if (cy > 0) stack.push(cx, cy - 1);
    if (cy < h - 1) stack.push(cx, cy + 1);
  }
  ctx.putImageData(imgData, 0, 0);
}

function setCreativeActiveTool(toolName) {
  gameState.creative.tool = toolName;
  ['brush', 'eraser', 'fill'].forEach(t => {
    const btn = document.getElementById('creative-tool-' + t);
    if (btn) btn.classList.toggle('active', t === toolName);
  });
}

function setCreativeCreateInputsEnabled(enabled) {
  const doneBtn = document.getElementById('creative-done-btn');
  const clearBtn = document.getElementById('creative-clear-btn');
  const canvas = getCreativeDrawCanvas();
  const toolbar = document.getElementById('creative-toolbar');

  if (doneBtn) doneBtn.disabled = !enabled;
  if (clearBtn) clearBtn.disabled = !enabled;
  if (canvas) {
    canvas.style.pointerEvents = enabled ? 'auto' : 'none';
  }
  if (toolbar) {
    toolbar.querySelectorAll('button').forEach(btn => { btn.disabled = !enabled; });
  }
}

function updateCreativeChallengeUI(challenge) {
  const challengeEl = document.getElementById('creative-challenge');

  if (challengeEl) {
    challengeEl.textContent = challenge.prompt;
  }

  initCreativeDrawCanvas();
  clearCreativeCanvas();
  renderCreativePalette();
  gameState.creative.brushColor = CREATIVE_DEFAULT_COLOR;
  gameState.creative.tool = 'brush';
  gameState.creative.brushSize = 6;
  gameState.creative.undoStack = [];
  gameState.creative.redoStack = [];
  const palette = document.getElementById('creative-palette');
  if (palette) {
    palette.querySelectorAll('.creative-swatch').forEach((el, i) => {
      el.classList.toggle('active', i === 0);
    });
  }
  setCreativeActiveTool('brush');
  document.querySelectorAll('.creative-size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === '6');
  });
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
  gameState.creative.roundDuration = getRoundDuration(getTiming('creative', 'play', 75));
  gameState.creative.timeLeft = gameState.creative.roundDuration;
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
  const canvas = getCreativeDrawCanvas();
  creative.answerText = canvas ? canvas.toDataURL('image/png') : '';
}

function renderCreativeAnswerPreview() {
  const previewEl = document.getElementById('creative-answer-preview');
  if (!previewEl) return;

  const { creative } = gameState;
  previewEl.innerHTML = '';

  const img = document.createElement('img');
  img.src = creative.answerText || '';
  img.alt = 'رسم الفريق';
  previewEl.appendChild(img);
}

function setCreativeEvalResult(html) {
  const resultEl = document.getElementById('creative-eval-result');
  if (resultEl) {
    resultEl.innerHTML = html;
  }
}

function showCreativeKeySetup(show) {
  const setupEl = document.getElementById('creative-key-setup');
  if (setupEl) {
    setupEl.hidden = !show;
  }
}

// يحوّل عدد البكسلات المرسومة + الوقت إلى درجة تقريبية حين لا يتوفّر مفتاح API.
function heuristicCreativeScore(canvas, timeSpent, totalTime) {
  let detailRatio = 0;
  try {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let drawn = 0;
    // الخلفية بيضاء (255,255,255)؛ نعدّ أي بكسل ملوّن/مرسوم.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if ((255 - r) + (255 - g) + (255 - b) > 40) {
        drawn += 1;
      }
    }
    const totalPixels = data.length / 4;
    detailRatio = totalPixels > 0 ? drawn / totalPixels : 0;
  } catch (error) {
    detailRatio = 0;
  }

  // التفاصيل: نعتبر تغطية ~9% رسمة غنية (أسهل). الوقت: حصّة أصغر.
  const detailScore = Math.min(1, detailRatio / 0.09);
  const timeScore = totalTime > 0 ? Math.min(1, timeSpent / totalTime) : 0;
  const combined = detailScore * 0.75 + timeScore * 0.25;
  const score = Math.round(combined * 6) + 4; // 4..10 (أسهل)
  return Math.max(1, Math.min(10, score));
}

// يستخرج {score, comment} من نص الرد ولو احتوى على زوائد حول JSON.
function parseCreativeScore(text) {
  if (!text) return null;
  let raw = text.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) raw = match[0];
  try {
    const parsed = JSON.parse(raw);
    let score = Number(parsed.score);
    if (!Number.isFinite(score)) return null;
    score = Math.max(1, Math.min(10, Math.round(score)));
    const comment = typeof parsed.comment === 'string' ? parsed.comment.trim() : '';
    return { score, comment };
  } catch (error) {
    return null;
  }
}

async function evaluateDrawingWithAI(target, imageDataUrl, timeSpent, totalTime) {
  const apiKey = getCreativeApiKey();
  if (!apiKey) throw new Error('no-key');
  if (!imageDataUrl || imageDataUrl.indexOf(',') === -1) throw new Error('no-image');

  // طيف تعلّق برأيها العفوي على الرسمة (لا قالب ثابت)، بشرط الترابط والإيجاز.
  const systemPrompt =
    'أنتِ "طيف"، مقدّمة مسابقات بلهجة خليجية خفيفة الظل. ' +
    'تأمّلي الرسمة وعلّقي عليها برأيكِ أنتِ بشكل عفوي وطبيعي وساخر بلطف — انطباعكِ الصادق عمّا تشاهدينه. ' +
    'نوّعي في تعليقاتكِ ولا تكرري نفس الأسلوب أو القالب؛ عبّري بطريقتكِ الخاصة كل مرة. ' +
    'الشرط الوحيد: يكون التعليق عن هذه الرسمة بالذات ومفهوماً (لا كلمات أو تشبيهات عشوائية لا علاقة لها بما تشاهدينه). ' +
    'خليه قصيراً وبسيطاً (جملة واحدة).';

  const userText =
    `طُلب من الفريق أن يرسم: "${target}". قضى ${timeSpent} ثانية من أصل ${totalTime} ثانية. ` +
    `قيّمي الرسمة من 1 إلى 10، وكوني كريمة وسهلة في الدرجات: أي محاولة فيها شبه ولو بسيط بـ "${target}" تستحق 6 أو أكثر، والرسمة الجيدة 8 إلى 10. ` +
    `قد يكون الفريق لوّن الرسمة بالألوان؛ فإذا استخدم ألواناً مناسبة وجميلة اعتبري ذلك جهداً إضافياً يرفع الدرجة قليلاً. ` +
    `لا تعطي أقل من 5 إلا إذا كانت الورقة فارغة تماماً أو مجرد خربشة عشوائية بلا أي معنى. ` +
    `اكتبي تعليقكِ الخاص بعفوية عمّا تشاهدينه في الرسمة (بما فيها الألوان) وعلاقته بـ "${target}" — قصير وبسيط ومترابط، وبأسلوب مختلف كل مرة. ` +
    `أعيدي ردّكِ بصيغة JSON فقط دون أي نص خارجه: {"score": رقم صحيح من 1 إلى 10, "comment": "تعليقكِ العفوي"}`;

  const body = {
    model: CREATIVE_AI_MODEL,
    max_tokens: 400,
    temperature: 0.85,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: { url: imageDataUrl } }
        ]
      }
    ]
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + apiKey,
      'X-Title': 'Taif Challenge'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('api-' + response.status);
  }

  const data = await response.json();
  const text = data && data.choices && data.choices[0]
    ? (data.choices[0].message && data.choices[0].message.content) || ''
    : '';
  const parsed = parseCreativeScore(text);
  if (!parsed) throw new Error('bad-response');
  return parsed;
}

// يحوّل رسمة الفريق إلى صورة واقعية بسيطة عبر نموذج توليد الصور، ويعيد رابط data URL.
async function generateRealisticImage(target, imageDataUrl) {
  const apiKey = getCreativeApiKey();
  if (!apiKey) throw new Error('no-key');
  if (!imageDataUrl || imageDataUrl.indexOf(',') === -1) throw new Error('no-image');

  const body = {
    model: CREATIVE_IMAGE_MODEL,
    modalities: ['image', 'text'],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              `هذه رسمة يدوية بسيطة لـ "${target}". حوّلها إلى صورة واقعية بسيطة وواضحة لنفس الشيء، ` +
              `مع المحافظة على نفس التكوين والوضعية والألوان قدر الإمكان. أبقها بسيطة وغير مزدحمة.`
          },
          { type: 'image_url', image_url: { url: imageDataUrl } }
        ]
      }
    ]
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + apiKey,
      'X-Title': 'Taif Challenge'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('img-' + response.status);
  }

  const data = await response.json();
  const message = data && data.choices && data.choices[0] && data.choices[0].message;
  const images = message && message.images;
  const imageUrl = images && images[0] && images[0].image_url && images[0].image_url.url;
  if (!imageUrl) throw new Error('no-image-out');
  return imageUrl;
}

// يطلب النسخة الواقعية ويعرضها في الصندوق المجاور للرسمة.
function runCreativeRealistic() {
  const { creative } = gameState;
  const box = document.getElementById('creative-realistic-box');
  if (!box) return;

  creative.realisticToken += 1;
  const token = creative.realisticToken;
  const target = creative.currentChallenge?.target || creative.currentChallenge?.prompt || '';
  const sourceImage = creative.answerText;

  box.innerHTML = '<p class="creative-realistic-status">طيف ترسمها بالواقع…</p>';

  generateRealisticImage(target, sourceImage)
    .then((url) => {
      if (creative.realisticToken !== token) return; // جولة جديدة بدأت
      box.innerHTML = '';
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'نسخة واقعية للرسمة';
      box.appendChild(img);
    })
    .catch(() => {
      if (creative.realisticToken !== token) return;
      box.innerHTML = '<p class="creative-realistic-status">تعذّر توليد النسخة الواقعية.</p>';
    });
}

// يعتمد الدرجة النهائية، يمنح النقاط، ويعرض حكم طيف ثم ينتقل للجولة التالية.
function finalizeCreativeScore(score, comment, fromAI) {
  const { creative } = gameState;
  if (creative.phase !== 'rate' || creative.rated) return;
  creative.rated = true;

  const creatorName = getCurrentCreativeTeamName();
  const awardedScore = score * (isSurpriseRound() ? getSurpriseMultiplier() : 1);
  addTeamScore(creatorName, awardedScore);

  const verdict = comment && comment.length
    ? comment
    : (fromAI ? 'تقييم طيف جاهز!' : 'تقييم تقريبي (بدون مفتاح).');
  const badge = fromAI ? 'تقييم طيف الذكي' : 'تقييم تقريبي';
  setCreativeEvalResult(
    `<div class="creative-eval-score">${score} <span>/ 10</span></div>` +
    `<p class="creative-eval-comment">${escapeHtml(verdict)}</p>` +
    `<p class="creative-eval-badge">${badge}</p>`
  );

  if (typeof setTaifSpeech === 'function') {
    setTaifSpeech(verdict);
  }
  if (typeof setTaifMood === 'function') {
    setTaifMood(score >= 6 ? 'celebrate' : 'mock');
  }

  showCreativeFeedback(`+${awardedScore} نقطة لفريق ${creatorName}`, true);
  updateCreativeScoresDisplay();
  showCreativeNextButton(true);
  advanceCreativeTurn();
}

async function runCreativeEvaluation() {
  const { creative } = gameState;
  if (creative.evaluating || creative.rated) return;

  if (!getCreativeApiKey()) {
    setCreativeEvalResult('<p class="creative-eval-status">بحاجة لمفتاح API لتقييم طيف الذكي…</p>');
    showCreativeKeySetup(true);
    return;
  }

  showCreativeKeySetup(false);
  creative.evaluating = true;
  setCreativeEvalResult('<p class="creative-eval-status">طيف يتأمّل الرسمة…</p>');
  if (typeof setTaifSpeech === 'function') {
    setTaifSpeech('خلّوني أشوف هالتحفة الفنية…');
  }

  const target = creative.currentChallenge?.target || creative.currentChallenge?.prompt || '';
  try {
    const { score, comment } = await evaluateDrawingWithAI(
      target,
      creative.answerText,
      creative.timeSpent,
      creative.roundDuration
    );
    creative.evaluating = false;
    if (creative.phase !== 'rate') return;
    finalizeCreativeScore(score, comment, true);
  } catch (error) {
    creative.evaluating = false;
    if (creative.phase !== 'rate') return;
    // فشل الاتصال أو الرد → تقييم تقريبي احتياطي حتى لا تتوقف اللعبة.
    const canvas = getCreativeDrawCanvas();
    const fallbackScore = canvas
      ? heuristicCreativeScore(canvas, creative.timeSpent, creative.roundDuration)
      : 5;
    const note = error && error.message === 'no-key'
      ? 'بدون مفتاح — تقييم تقريبي.'
      : 'تعذّر تقييم طيف الذكي — تقييم تقريبي.';
    finalizeCreativeScore(fallbackScore, note, false);
  }
}

function handleCreativeKeySave() {
  const inputEl = document.getElementById('creative-key-input');
  const key = inputEl ? inputEl.value.trim() : '';
  if (!key) return;
  setCreativeApiKey(key);
  if (inputEl) inputEl.value = '';
  showCreativeKeySetup(false);
  runCreativeEvaluation();
}

function handleCreativeKeySkip() {
  const { creative } = gameState;
  if (creative.phase !== 'rate' || creative.rated) return;
  showCreativeKeySetup(false);
  const canvas = getCreativeDrawCanvas();
  const score = canvas
    ? heuristicCreativeScore(canvas, creative.timeSpent, creative.roundDuration)
    : 5;
  finalizeCreativeScore(score, 'تقييم تقريبي (بدون مفتاح).', false);
}

function startCreativeRatePhase() {
  const { creative } = gameState;
  if (creative.phase === 'rate') return;

  creative.timeSpent = Math.max(0, creative.roundDuration - Math.max(0, creative.timeLeft));
  creative.phase = 'rate';
  creative.rated = false;
  creative.evaluating = false;
  stopCreativeTimer();
  captureCreativeAnswer();
  setCreativeCreateInputsEnabled(false);
  setCreativePhaseUI('rate');
  renderCreativeAnswerPreview();
  showCreativeKeySetup(false);
  showCreativeNextButton(false);
  runCreativeEvaluation();
  runCreativeRealistic();
}

function showCreativeNextButton(show) {
  const btn = document.getElementById('creative-next-btn');
  if (btn) btn.hidden = !show;
}

function handleCreativeNext() {
  const { creative } = gameState;
  if (creative.phase !== 'rate' || !creative.rated) return;
  if (creative.feedbackTimeoutId) {
    clearTimeout(creative.feedbackTimeoutId);
    creative.feedbackTimeoutId = null;
  }
  showNextCreativeRound();
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
  // مهلة أطول لإتاحة الوقت لظهور النسخة الواقعية وقراءة الحكم (مع زر "التالي" للتحكم اليدوي).
  gameState.creative.feedbackTimeoutId = setTimeout(() => {
    gameState.creative.feedbackTimeoutId = null;
    showNextCreativeRound();
  }, 16000);
}

function startCreativeCreatePhase() {
  const { creative } = gameState;

  creative.phase = 'create';
  creative.answerText = '';
  creative.rated = false;
  creative.evaluating = false;
  creative.timeSpent = 0;
  hideCreativeFeedback();
  setCreativeEvalResult('');
  showCreativeKeySetup(false);
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

  const { creative } = gameState;
  creative.currentTeamIndex = teamIndex;
  creative.currentChallenge = getNextCreativeChallenge();
  creative.phase = 'idle';

  const creatorLabelEl = document.getElementById('creative-creator-label');
  const progressEl = document.getElementById('creative-progress');
  const creatorName = getCurrentCreativeTeamName();
  const roundCount = creative.teamRoundCounts[creatorName];

  if (creatorLabelEl) {
    setColoredTeamLabel(creatorLabelEl, 'دور فريق: ', creatorName);
  }
  if (progressEl) {
    progressEl.textContent = `التحدي ${roundCount + 1} من ${creative.roundsPerTeam}`;
  }

  updateCreativeScoresDisplay();
  startCreativeCreatePhase();
}

// عبارات كلمة السر: كل عبارة لها تصنيف يظهر لفريق الوصف مع العبارة نفسها.
const PASSWORD_PHRASES = [
  // أمثال خليجية شعبية
  { answer: 'اللي ما يعرف الصقر يشويه', category: 'مثل خليجي شعبي' },
  { answer: 'يا ما تحت السواهي دواهي', category: 'مثل خليجي شعبي' },
  { answer: 'الحركة بركة', category: 'مثل خليجي شعبي' },
  { answer: 'عصفور باليد ولا عشرة على الشجرة', category: 'مثل خليجي شعبي' },
  { answer: 'اللي على راسه بطحة يحسّس عليها', category: 'مثل خليجي شعبي' },
  { answer: 'باب النجار مخلوع', category: 'مثل خليجي شعبي' },
  { answer: 'الصيت ولا الغنى', category: 'مثل خليجي شعبي' },
  { answer: 'اللي ما يطول العنب حامض عنه يقول', category: 'مثل خليجي شعبي' },

  // أغاني عربية معروفة
  { answer: 'مقادير', category: 'أغنية سعودية لطلال مداح' },
  { answer: 'الرسايل', category: 'أغنية سعودية لمحمد عبده' },
  { answer: 'إنت عمري', category: 'أغنية مصرية لأم كلثوم' },
  { answer: 'ألف ليلة وليلة', category: 'أغنية مصرية لأم كلثوم' },
  { answer: 'قارئة الفنجان', category: 'أغنية مصرية لعبدالحليم حافظ' },
  { answer: 'بشرة خير', category: 'أغنية إماراتية لحسين الجسمي' },
  { answer: 'نسم علينا الهوى', category: 'أغنية لبنانية لفيروز' },
  { answer: 'حدي نظر', category: 'أغنية سعودية لخالد عبد الرحمن' },

  // مسلسلات عربية مشهورة
  { answer: 'طاش ما طاش', category: 'مسلسل كوميدي سعودي' },
  { answer: 'باب الحارة', category: 'مسلسل سوري شامي' },
  { answer: 'خالتي قماشة', category: 'مسلسل كويتي' },
  { answer: 'بقعة ضوء', category: 'مسلسل كوميدي سوري' },
  { answer: 'سيلفي', category: 'مسلسل سعودي لناصر القصبي' },
  { answer: 'العاصوف', category: 'مسلسل درامي سعودي' },
  { answer: 'الهيبة', category: 'مسلسل لبناني سوري' },
  { answer: 'رقية وسبيكة', category: 'مسلسل كويتي' },

  // برامج تلفزيونية عربية مشهورة
  { answer: 'من سيربح المليون', category: 'برنامج مسابقات عربي' },
  { answer: 'ستار أكاديمي', category: 'برنامج مواهب عربي' },
  { answer: 'عرب آيدول', category: 'برنامج مواهب غنائي' },
  { answer: 'خواطر', category: 'برنامج لأحمد الشقيري' },
  { answer: 'الاتجاه المعاكس', category: 'برنامج حواري سياسي' },
  { answer: 'صاحبة السعادة', category: 'برنامج لإسعاد يونس' }
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

function getNextPasswordPhrase() {
  const { password } = gameState;

  if (password.poolPointer >= password.shuffledIndices.length) {
    password.shuffledIndices = shuffleArray(PASSWORD_PHRASES.map((_, index) => index));
    password.poolPointer = 0;
  }

  const phraseIndex = password.shuffledIndices[password.poolPointer];
  password.poolPointer += 1;
  return PASSWORD_PHRASES[phraseIndex];
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

// تطبيع عربي متسامح: يوحّد الألف والتاء المربوطة والألف المقصورة،
// ويزيل التشكيل والتطويل وعلامات الترقيم، حتى يسهل مطابقة العبارات.
function normalizePasswordText(text) {
  return (text || '')
    .replace(/[ً-ْٰ]/g, '')   // التشكيل
    .replace(/ـ/g, '')                   // التطويل (ـ)
    .replace(/[أإآا]/g, 'ا') // توحيد الألف
    .replace(/ى/g, 'ي')             // الألف المقصورة → ياء
    .replace(/ؤ/g, 'و')             // ؤ → و
    .replace(/ئ/g, 'ي')             // ئ → ي
    .replace(/ة/g, 'ه')             // التاء المربوطة → هاء
    .replace(/[^؀-ۿ0-9\s]/g, ' ')   // إزالة الرموز/الترقيم
    .replace(/\s+/g, ' ')
    .trim();
}

function updatePasswordScoresDisplay() {
  updateGameScoresDisplay('password-scores', 'password-score-item');
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
      ? 'فريق الوصف: اقرأوا العبارة وتصنيفها وصفوها لفريق التخمين (بدون ذكر العبارة!)'
      : 'فريق التخمين: اكتبوا العبارة الصحيحة';
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
  gameState.password.timeLeft = getRoundDuration(getTiming('password', 'read', 30));
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
  gameState.password.timeLeft = getRoundDuration(getTiming('password', 'play', 30));
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
    const { points, bonusText } = calculateSpeedPoints(elapsedSeconds, getSpeedThreshold('password'));
    finishPasswordRoundAfterAnswer(true, points, `صح! +${points} نقطة${bonusText}`);
    return;
  }

  showPasswordFeedback('خطأ! حاول مرة أخرى', false);
}

function handlePasswordGuessTimeout() {
  if (gameState.password.answered || gameState.password.phase !== 'guess') return;

  const answer = gameState.password.currentWord;
  finishPasswordRoundAfterAnswer(false, 0, `انتهى الوقت! العبارة: ${answer}`);
}

function updatePasswordCategoryDisplay() {
  const categoryEl = document.getElementById('password-secret-category');
  if (categoryEl) {
    categoryEl.textContent = gameState.password.currentCategory || '';
  }
}

function startPasswordGuessPhase() {
  const { password } = gameState;
  if (password.phase === 'guess') return;

  password.phase = 'guess';
  password.guessStartTime = Date.now();
  password.answered = false;

  const secretEl = document.getElementById('password-secret-word');
  if (secretEl) {
    secretEl.textContent = '؟؟؟';
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
  updatePasswordCategoryDisplay();

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

  const phrase = getNextPasswordPhrase();
  password.currentWord = phrase.answer;
  password.currentCategory = phrase.category;
  password.phase = 'idle';
  password.roundNumber += 1;

  const describerLabelEl = document.getElementById('password-describer-label');
  const guesserLabelEl = document.getElementById('password-guesser-label');
  const progressEl = document.getElementById('password-progress');
  const describerName = getDescriberTeamName();
  const guesserName = getGuesserTeamName();

  if (describerLabelEl) {
    setColoredTeamLabel(describerLabelEl, 'فريق الوصف: ', describerName);
  }
  if (guesserLabelEl) {
    setColoredTeamLabel(guesserLabelEl, 'فريق التخمين: ', guesserName);
  }
  if (progressEl) {
    progressEl.textContent = `الجولة ${password.roundNumber} — ${describerName} ضد ${guesserName}`;
  }

  updatePasswordScoresDisplay();
  startPasswordReadPhase();
}

// تغيير العبارة الحالية مع الإبقاء على نفس فريقَي الوصف والتخمين ودون خصم نقاط ولا تقدّم الجولة.
function changePasswordRound() {
  clearPasswordTimers();
  hidePasswordFeedback();

  if (isPasswordComplete()) return;

  const { password } = gameState;
  const phrase = getNextPasswordPhrase();
  password.currentWord = phrase.answer;
  password.currentCategory = phrase.category;
  password.phase = 'idle';
  password.answered = false;

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
    PASSWORD_PHRASES.map((_, index) => index)
  );
  gameState.password.poolPointer = 0;
  gameState.password.teamRoundCounts = {};
  gameState.password.roundNumber = 0;
  gameState.password.describerTeamIndex = 0;
  gameState.password.guesserTeamIndex = 0;
  gameState.password.currentWord = '';
  gameState.password.currentCategory = '';
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
  gameState.creative.phase = 'idle';
  gameState.creative.answerText = '';
  gameState.creative.timeSpent = 0;
  gameState.creative.evaluating = false;
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

  const mode = getMemoryModeConfig();
  gameState.memory.gridSize = mode.gridSize;
  gameState.memory.currentTeamIndex = 0;
  gameState.memory.teamRoundCounts = {};
  gameState.memory.cardOrder = [];
  gameState.memory.matched = [];
  gameState.memory.selection = null;
  gameState.memory.flashPair = null;
  gameState.memory.inputLocked = false;
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
    label.style.color = getTeamColorByIndex(i - 1);
    label.style.fontWeight = '700';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `team-input-${i}`;
    input.className = 'team-input';
    input.placeholder = `اسم الفريق ${i}`;
    input.maxLength = 30;
    input.dataset.teamIndex = String(i - 1);
    input.style.setProperty('--team-accent', getTeamColorByIndex(i - 1));

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
let sharedMasterGain = null;
const timerTickLast = {};

function getAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
      sharedMasterGain = sharedAudioCtx.createGain();
      sharedMasterGain.gain.value = getMasterVolume();
      sharedMasterGain.connect(sharedAudioCtx.destination);
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// مخرج كل المؤثرات يمرّ عبر بوابة الصوت الرئيسية (للتحكم في المستوى/الكتم)
function getSoundDestination() {
  return sharedMasterGain || (sharedAudioCtx && sharedAudioCtx.destination);
}

function getMasterVolume() {
  const s = window.TAIF_SETTINGS && window.TAIF_SETTINGS.sound;
  if (s && s.enabled === false) return 0;
  const v = s && typeof s.volume === 'number' ? s.volume : 0.8;
  return Math.max(0, Math.min(1, v));
}

function applySoundVolume() {
  if (sharedMasterGain) sharedMasterGain.gain.value = getMasterVolume();
}

// هل يُسمح بمؤثر من فئة معيّنة؟ (ui / tick / effects)
function sfxAllowed(category) {
  const s = window.TAIF_SETTINGS && window.TAIF_SETTINGS.sound;
  if (!s) return true;
  if (s.enabled === false) return false;
  if (s.events && s.events[category] === false) return false;
  return true;
}

// اهتزاز الجهاز عند الخطأ/انتهاء الوقت (إن دعمه الجهاز وفُعّل)
function taifVibrate(pattern) {
  try {
    const s = window.TAIF_SETTINGS && window.TAIF_SETTINGS.sound;
    if (s && s.vibration === false) return;
    if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch {
    // غير مدعوم
  }
}

function playClickSound() {
  if (!sfxAllowed('ui')) return;
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
    gain.connect(getSoundDestination());

    oscillator.start(start);
    oscillator.stop(start + 0.09);
  } catch {
    // Audio may be blocked.
  }
}

function playLoseSound() {
  taifVibrate([60, 40, 80]);
  if (sfxAllowed('effects')) {
    try {
      const ctx = getAudioContext();
      if (ctx) {
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
          gain.connect(getSoundDestination());

          oscillator.start(noteStart);
          oscillator.stop(noteStart + 0.25);
        });
      }
    } catch {
      // Audio may be blocked.
    }
  }

  maybeTaifLoseQuip();
}

function playTickSound() {
  if (!sfxAllowed('tick')) return;
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
    gain.connect(getSoundDestination());

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
  if (sfxAllowed('effects')) try {
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
      gain.connect(getSoundDestination());

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
    sweepGain.connect(getSoundDestination());
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
    pingGain.connect(getSoundDestination());
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
    gain.connect(getSoundDestination());

    oscillator.start(start);
    oscillator.stop(start + 0.6);
  } catch {
    // Audio may be blocked; intro continues without sound.
  }
}

const CONFETTI_COLORS = ['#e94560', '#ffd32a', '#2ed573', '#3498db', '#C084FC', '#FF9F43'];

function populateConfetti(confettiEl, pieceCount = 40) {
  if (!confettiEl) return;

  confettiEl.innerHTML = '';
  const palette = [...TEAM_COLORS, ...CONFETTI_COLORS];

  for (let i = 0; i < pieceCount; i += 1) {
    const piece = document.createElement('span');
    const variant = i % 7;
    piece.className = variant === 0
      ? 'confetti-piece confetti-piece--wide'
      : variant === 1
        ? 'confetti-piece confetti-piece--sparkle'
        : 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = palette[i % palette.length];
    piece.style.animationDelay = `${Math.random() * 1.4}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 2}s`;
    confettiEl.appendChild(piece);
  }
}

function playVictorySound() {
  if (!sfxAllowed('effects')) return;
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
      gain.connect(getSoundDestination());

      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.4);
    });

    const chordStart = startTime + 0.72;
    [523.25, 659.25, 783.99].forEach((freq) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, chordStart);

      gain.gain.setValueAtTime(0.0001, chordStart);
      gain.gain.exponentialRampToValueAtTime(0.14, chordStart + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordStart + 0.9);

      oscillator.connect(gain);
      gain.connect(getSoundDestination());

      oscillator.start(chordStart);
      oscillator.stop(chordStart + 0.95);
    });
  } catch {
    // Audio may be blocked; results screen continues without sound.
  }
}

function startCelebrationEffects(confettiId = 'session-end-confetti') {
  document.body.classList.add('results-celebrating');

  const confettiEl = document.getElementById(confettiId);
  if (confettiEl && confettiEl.parentElement !== document.body) {
    document.body.appendChild(confettiEl);
  }

  const pieceCount = confettiId === 'partial-results-confetti' ? 52 : 40;
  populateConfetti(confettiEl, pieceCount);
}

function clearCelebrationEffects() {
  document.body.classList.remove('results-celebrating', 'session-celebrating');

  ['session-end-confetti', 'partial-results-confetti'].forEach((id) => {
    const confettiEl = document.getElementById(id);
    if (confettiEl) {
      confettiEl.innerHTML = '';
    }
  });
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

  if (startBtn) {
    startBtn.hidden = false;
  }

  const { text: textEl, heroText } = getTaifStageElements();
  if (textEl) textEl.textContent = '';
  if (heroText) heroText.textContent = '';

  setTaifMood('rules', { text: '' });
  playWelcomeSound();

  typewriterEffect(getTaifWelcomeText(), () => {
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
  document.querySelectorAll('.game-panel-footer .game-scores').forEach((scoresEl) => {
    syncGameFooterTeamCount(scoresEl);
  });
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

  const picmergeModeBackBtn = document.getElementById('picmerge-mode-back-btn');
  if (picmergeModeBackBtn) {
    picmergeModeBackBtn.addEventListener('click', () => {
      showScreen('game-select-screen');
      renderGameSelectScreen();
    });
  }

  const memoryModeBackBtn = document.getElementById('memory-mode-back-btn');
  if (memoryModeBackBtn) {
    memoryModeBackBtn.addEventListener('click', () => {
      showScreen('game-select-screen');
      renderGameSelectScreen();
    });
  }

  const sentenceCheckBtn = document.getElementById('sentence-check-btn');
  if (sentenceCheckBtn) {
    sentenceCheckBtn.addEventListener('click', handleSentenceCheck);
  }

  const sentenceNextBtn = document.getElementById('sentence-next-btn');
  if (sentenceNextBtn) {
    sentenceNextBtn.addEventListener('click', handleSentenceNext);
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

  const spotClickScene = document.getElementById('spot-right-scene');
  if (spotClickScene) {
    spotClickScene.addEventListener('click', handleSpotCanvasClick);
  }

  const spotNextBtn = document.getElementById('spot-next-btn');
  if (spotNextBtn) {
    spotNextBtn.addEventListener('click', handleSpotNext);
  }

  const memoryNextBtn = document.getElementById('memory-next-btn');
  if (memoryNextBtn) {
    memoryNextBtn.addEventListener('click', handleMemoryNext);
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
    partialResultsBackBtn.addEventListener('click', () => {
      clearCelebrationEffects();
      returnToGameSelect();
    });
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
    creativeClearBtn.addEventListener('click', () => {
      saveCreativeUndoState();
      clearCreativeCanvas();
    });
  }

  const toolBrushBtn = document.getElementById('creative-tool-brush');
  const toolEraserBtn = document.getElementById('creative-tool-eraser');
  const toolFillBtn = document.getElementById('creative-tool-fill');
  if (toolBrushBtn) toolBrushBtn.addEventListener('click', () => setCreativeActiveTool('brush'));
  if (toolEraserBtn) toolEraserBtn.addEventListener('click', () => setCreativeActiveTool('eraser'));
  if (toolFillBtn) toolFillBtn.addEventListener('click', () => setCreativeActiveTool('fill'));

  document.querySelectorAll('.creative-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gameState.creative.brushSize = parseInt(btn.dataset.size, 10);
      document.querySelectorAll('.creative-size-btn').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  const creativeUndoBtn = document.getElementById('creative-undo-btn');
  const creativeRedoBtn = document.getElementById('creative-redo-btn');
  if (creativeUndoBtn) creativeUndoBtn.addEventListener('click', creativeUndo);
  if (creativeRedoBtn) creativeRedoBtn.addEventListener('click', creativeRedo);

  const creativeNextBtn = document.getElementById('creative-next-btn');
  if (creativeNextBtn) {
    creativeNextBtn.addEventListener('click', handleCreativeNext);
  }

  const creativeKeySaveBtn = document.getElementById('creative-key-save');
  if (creativeKeySaveBtn) {
    creativeKeySaveBtn.addEventListener('click', handleCreativeKeySave);
  }

  const creativeKeySkipBtn = document.getElementById('creative-key-skip');
  if (creativeKeySkipBtn) {
    creativeKeySkipBtn.addEventListener('click', handleCreativeKeySkip);
  }

  const creativeKeyInput = document.getElementById('creative-key-input');
  if (creativeKeyInput) {
    creativeKeyInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleCreativeKeySave();
      }
    });
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

  document.querySelectorAll('.game-screen .game-back-btn').forEach((backBtn) => {
    backBtn.addEventListener('click', () => {
      stopAllGameTimers();
      returnToGameSelect();
    });
  });

  // زر "تغيير السؤال": يستبدل السؤال/الجولة الحالية بأخرى للفريق نفسه دون خصم نقاط ولا تقدّم الدور.
  const CHANGE_QUESTION_HANDLERS = {
    'trivia-screen': showNextTriviaQuestion,
    'sentence-screen': showNextSentenceRound,
    'picmerge-screen': showNextPicmergeRound,
    'spot-screen': showNextSpotRound,
    'memory-screen': showNextMemoryRound,
    'creative-screen': showNextCreativeRound,
    'password-screen': changePasswordRound
  };

  document.querySelectorAll('.game-screen .game-change-btn').forEach((changeBtn) => {
    changeBtn.addEventListener('click', () => {
      const screen = changeBtn.closest('.game-screen');
      const handler = screen ? CHANGE_QUESTION_HANDLERS[screen.id] : null;
      if (handler) handler();
    });
  });
});
