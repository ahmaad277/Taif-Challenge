/* ============================================================================
 * إعدادات اللعبة — لوحة تحكّم شاملة (الأوقات، النقاط، الجولات، الصوت، المظهر…)
 * ----------------------------------------------------------------------------
 * وحدة مستقلة (IIFE). تُخزّن خيارات المستخدم في localStorage تحت المفتاح
 * "taifSettings"، وتنشرها للمحرّك عبر window.TAIF_SETTINGS الذي يقرأه script.js
 * من خلال الدوال: getTiming / getScoringCfg / getRoundsCfg / getSpeedThreshold
 * / getMemoryModeConfig / sfxAllowed / getMasterVolume.
 * تُحمّل بعد script.js فكل المتغيّرات العامة (gameState, GAME_REGISTRY…) متاحة.
 * ========================================================================== */
(function () {
  'use strict';

  const STORE_KEY = 'taifSettings';

  // ---- القيم الافتراضية — مصدر الحقيقة الوحيد للقيم القابلة للتخصيص ----------
  const DEFAULTS = {
    timings: {
      trivia: { play: 15 },
      sentence: { play: 30 },
      picmerge: { play: 40, penalty: 15 },
      spot: { play: 60, penalty: 2 },
      creative: { play: 75 },
      password: { read: 30, play: 30 },
      memory: { penalty: 2 }
    },
    // الذاكرة لها ثلاثة مستويات، لكلٍّ وقت حفظ ووقت لعب
    memory: {
      easy: { memorizeSec: 7, playSec: 15 },
      medium: { memorizeSec: 20, playSec: 45 },
      hard: { memorizeSec: 45, playSec: 60 }
    },
    rounds: { trivia: 5, sentence: 3, picmerge: 3, spot: 3, memory: 3, creative: 3, password: 3 },
    scoring: { correctPoints: 10, speedBonus: 5, surpriseEnabled: true, surpriseMultiplier: 2 },
    speedThresholds: { trivia: 5, sentence: 15, picmerge: 10, memory: 15, password: 30 },
    disabledGames: [],
    sound: { enabled: true, volume: 0.8, vibration: true, events: { ui: true, tick: true, effects: true } },
    appearance: { theme: 'dark', fontScale: 'normal', reduceMotion: false },
    taif: { speech: true, lottie: false }
  };

  // أسماء الألعاب بالعربية + تسميات الحقول الزمنية لكل لعبة
  const GAME_LABELS = {
    trivia: 'الأسئلة العامة',
    sentence: 'رتب الجملة',
    picmerge: 'تحدي الصور',
    spot: 'أوجد الفروق',
    memory: 'الذاكرة البصرية',
    creative: 'التحدي الإبداعي',
    password: 'كلمة السر'
  };
  const GAME_ORDER = ['trivia', 'sentence', 'picmerge', 'spot', 'memory', 'creative', 'password'];

  // حقول الوقت المعروضة لكل لعبة: [مفتاح, تسمية, أدنى, أقصى]
  const TIMING_FIELDS = {
    trivia: [['play', 'وقت السؤال', 5, 120]],
    sentence: [['play', 'وقت الترتيب', 5, 180]],
    picmerge: [['play', 'وقت التخمين', 5, 180], ['penalty', 'تجميد الفريق بعد الخطأ (سباق)', 0, 60]],
    spot: [['play', 'وقت الجولة', 10, 240], ['penalty', 'الخصم عند النقر الخطأ', 0, 30]],
    creative: [['play', 'وقت الرسم/الإبداع', 10, 300]],
    password: [['read', 'وقت قراءة الكلمة', 5, 120], ['play', 'وقت التخمين', 5, 180]],
    memory: [['penalty', 'الخصم عند خطأ المطابقة', 0, 30]]
  };

  const MEMORY_MODE_LABELS = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };

  // ---- إعدادات مسبقة جاهزة (تضبط الأوقات والجولات دفعة واحدة) ------------------
  const PRESETS = {
    relaxed: {
      label: 'هادئ 🐢',
      hint: 'أوقات أطول وضغط أقل — مناسب للأطفال أو اللعب المتمهّل',
      apply: (s) => {
        s.timings.trivia.play = 25; s.timings.sentence.play = 45; s.timings.picmerge.play = 60;
        s.timings.spot.play = 90; s.timings.creative.play = 110; s.timings.password.read = 40; s.timings.password.play = 45;
        s.memory.easy = { memorizeSec: 10, playSec: 25 }; s.memory.medium = { memorizeSec: 30, playSec: 60 }; s.memory.hard = { memorizeSec: 60, playSec: 90 };
      }
    },
    standard: {
      label: 'متوازن ⚖️',
      hint: 'الإعداد الافتراضي الموصى به',
      apply: (s) => { applyDefaultsTo(s, ['timings', 'memory', 'rounds']); }
    },
    fast: {
      label: 'سريع ⚡',
      hint: 'أوقات قصيرة وحماس عالٍ — للجلسات السريعة',
      apply: (s) => {
        s.timings.trivia.play = 10; s.timings.sentence.play = 20; s.timings.picmerge.play = 25;
        s.timings.spot.play = 40; s.timings.creative.play = 50; s.timings.password.read = 20; s.timings.password.play = 20;
        s.memory.easy = { memorizeSec: 5, playSec: 10 }; s.memory.medium = { memorizeSec: 12, playSec: 30 }; s.memory.hard = { memorizeSec: 25, playSec: 40 };
        GAME_ORDER.forEach((g) => { s.rounds[g] = g === 'trivia' ? 3 : 2; });
      }
    },
    marathon: {
      label: 'ماراثون 🏁',
      hint: 'جولات أكثر لكل فريق — جلسة طويلة',
      apply: (s) => { applyDefaultsTo(s, ['timings', 'memory']); GAME_ORDER.forEach((g) => { s.rounds[g] = g === 'trivia' ? 8 : 5; }); }
    }
  };

  // ---- أدوات مساعدة -----------------------------------------------------------
  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function deepMerge(base, over) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!over || typeof over !== 'object') return out;
    Object.keys(over).forEach((k) => {
      const bv = base ? base[k] : undefined;
      const ov = over[k];
      if (ov && typeof ov === 'object' && !Array.isArray(ov) && bv && typeof bv === 'object') {
        out[k] = deepMerge(bv, ov);
      } else if (Array.isArray(ov)) {
        out[k] = ov.slice();
      } else {
        out[k] = ov;
      }
    });
    return out;
  }

  function applyDefaultsTo(s, keys) {
    keys.forEach((k) => { s[k] = deepClone(DEFAULTS[k]); });
  }

  let state = deepClone(DEFAULTS);

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) state = deepMerge(DEFAULTS, JSON.parse(raw));
      else state = deepClone(DEFAULTS);
    } catch {
      state = deepClone(DEFAULTS);
    }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ممتلئ أو محظور */ }
  }

  // ---- النشر للمحرّك + تطبيق التأثيرات العامة ---------------------------------
  function apply() {
    window.TAIF_SETTINGS = state;

    // الجولات لكل فريق → gameState
    if (typeof gameState !== 'undefined') {
      if (gameState.trivia) gameState.trivia.questionsPerTeam = state.rounds.trivia;
      ['sentence', 'picmerge', 'spot', 'memory', 'creative', 'password'].forEach((g) => {
        if (gameState[g]) gameState[g].roundsPerTeam = state.rounds[g];
      });
    }

    // تفعيل/تعطيل الألعاب
    if (typeof GAME_REGISTRY !== 'undefined' && Array.isArray(GAME_REGISTRY)) {
      const disabled = new Set(state.disabledGames);
      GAME_REGISTRY.forEach((g) => { g.enabled = !disabled.has(g.id); });
    }

    // الصوت
    if (typeof applySoundVolume === 'function') applySoundVolume();

    // المظهر
    const html = document.documentElement;
    html.setAttribute('data-theme', state.appearance.theme === 'light' ? 'light' : 'dark');
    html.setAttribute('data-fontscale', state.appearance.fontScale || 'normal');
    document.body.classList.toggle('force-reduce-motion', !!state.appearance.reduceMotion);

    // طيف
    document.body.classList.toggle('taif-no-speech', state.taif.speech === false);

    // إعادة رسم شبكة اختيار الألعاب إن كانت ظاهرة
    if (typeof renderGameSelectScreen === 'function') {
      const sel = document.getElementById('game-select-screen');
      if (sel && sel.classList.contains('active')) renderGameSelectScreen();
    }
  }

  function commit() { save(); apply(); }

  // ---- الواجهة ----------------------------------------------------------------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const root = () => document.getElementById('settings-root');

  function open() {
    if (typeof showScreen === 'function') showScreen('settings-screen');
    render();
  }
  function goHome() { if (typeof showScreen === 'function') showScreen('welcome-screen'); }

  // مولّدات عناصر
  function numberRow(label, value, min, max, onChange, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'set-row';
    const id = 'set-' + Math.random().toString(36).slice(2, 8);
    wrap.innerHTML = `
      <label class="set-row-label" for="${id}">${esc(label)}</label>
      <div class="set-num">
        <button type="button" class="set-step" data-dir="-1" aria-label="إنقاص">−</button>
        <input id="${id}" class="ui-input set-num-input" type="number" inputmode="numeric"
               value="${value}" min="${min}" max="${max}" step="${opts.step || 1}">
        <button type="button" class="set-step" data-dir="1" aria-label="زيادة">+</button>
        ${opts.suffix ? `<span class="set-suffix">${esc(opts.suffix)}</span>` : ''}
      </div>`;
    const input = wrap.querySelector('input');
    const clamp = (v) => Math.max(min, Math.min(max, v));
    const fire = () => {
      let v = Number(input.value);
      if (!Number.isFinite(v)) v = min;
      v = clamp(Math.round(v));
      input.value = v;
      onChange(v);
    };
    input.addEventListener('change', fire);
    wrap.querySelectorAll('.set-step').forEach((b) => {
      b.addEventListener('click', () => {
        const dir = Number(b.dataset.dir);
        input.value = clamp((Number(input.value) || 0) + dir * (opts.step || 1));
        fire();
      });
    });
    return wrap;
  }

  function toggleRow(label, checked, onChange, hint) {
    const wrap = document.createElement('div');
    wrap.className = 'set-row';
    wrap.innerHTML = `
      <span class="set-row-label">${esc(label)}${hint ? `<span class="set-hint">${esc(hint)}</span>` : ''}</span>
      <button type="button" class="set-switch${checked ? ' is-on' : ''}" role="switch" aria-checked="${checked}">
        <span class="set-switch-knob"></span>
      </button>`;
    const sw = wrap.querySelector('.set-switch');
    sw.addEventListener('click', () => {
      const now = !sw.classList.contains('is-on');
      sw.classList.toggle('is-on', now);
      sw.setAttribute('aria-checked', String(now));
      onChange(now);
    });
    return wrap;
  }

  function selectRow(label, options, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'set-row';
    const id = 'set-' + Math.random().toString(36).slice(2, 8);
    wrap.innerHTML = `
      <label class="set-row-label" for="${id}">${esc(label)}</label>
      <select id="${id}" class="ui-input set-select">
        ${options.map((o) => `<option value="${esc(o.value)}" ${o.value === value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
      </select>`;
    wrap.querySelector('select').addEventListener('change', (e) => onChange(e.target.value));
    return wrap;
  }

  function sliderRow(label, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'set-row';
    const id = 'set-' + Math.random().toString(36).slice(2, 8);
    wrap.innerHTML = `
      <label class="set-row-label" for="${id}">${esc(label)}</label>
      <div class="set-slider-wrap">
        <input id="${id}" class="set-slider" type="range" min="0" max="100" value="${Math.round(value * 100)}">
        <span class="set-slider-val">${Math.round(value * 100)}%</span>
      </div>`;
    const input = wrap.querySelector('input');
    const valEl = wrap.querySelector('.set-slider-val');
    input.addEventListener('input', () => {
      valEl.textContent = input.value + '%';
      onChange(Number(input.value) / 100);
    });
    return wrap;
  }

  function section(title, subtitle) {
    const sec = document.createElement('section');
    sec.className = 'set-section';
    sec.innerHTML = `<h3 class="set-section-title">${esc(title)}</h3>${subtitle ? `<p class="set-section-sub">${esc(subtitle)}</p>` : ''}`;
    return sec;
  }

  function render() {
    const el = root();
    if (!el) return;
    el.innerHTML = `
      <div class="set-header">
        <h2 class="screen-title">الإعدادات</h2>
        <p class="set-subtitle">خصّص الأوقات والنقاط والصوت والمظهر لتناسب مجموعتك</p>
      </div>
      <div id="set-body" class="set-body"></div>
      <div class="set-footer">
        <button type="button" class="btn btn-secondary" id="set-export">تصدير</button>
        <button type="button" class="btn btn-secondary" id="set-import">استيراد</button>
        <button type="button" class="btn btn-secondary set-danger" id="set-reset">إعادة الكل للافتراضي</button>
        <button type="button" class="btn btn-primary" id="set-home">حفظ وعودة</button>
      </div>
      <input type="file" id="set-import-file" accept="application/json,.json" hidden>`;

    const body = el.querySelector('#set-body');

    // ===== الإعدادات المسبقة =====
    const presetSec = section('إعدادات سريعة', 'طبّق حزمة أوقات جاهزة بنقرة واحدة');
    const presetGrid = document.createElement('div');
    presetGrid.className = 'set-preset-grid';
    Object.keys(PRESETS).forEach((key) => {
      const p = PRESETS[key];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'set-preset-card';
      card.innerHTML = `<span class="set-preset-name">${esc(p.label)}</span><span class="set-preset-hint">${esc(p.hint)}</span>`;
      card.addEventListener('click', () => {
        p.apply(state);
        commit();
        render();
        flash('تم تطبيق إعداد: ' + p.label);
      });
      presetGrid.appendChild(card);
    });
    presetSec.appendChild(presetGrid);
    body.appendChild(presetSec);

    // ===== الأوقات لكل لعبة =====
    const timeSec = section('أوقات الألعاب', 'بالثواني — وقت اللعب، التفكير، والخصم عند الخطأ');
    GAME_ORDER.forEach((g) => {
      const block = document.createElement('div');
      block.className = 'set-game-block';
      block.innerHTML = `<h4 class="set-game-name">${esc(GAME_LABELS[g])}</h4>`;

      (TIMING_FIELDS[g] || []).forEach(([key, label, min, max]) => {
        block.appendChild(numberRow(label, state.timings[g][key], min, max, (v) => {
          state.timings[g][key] = v; commit();
        }, { suffix: 'ث' }));
      });

      // الذاكرة: أوقات الحفظ واللعب للمستويات الثلاثة
      if (g === 'memory') {
        ['easy', 'medium', 'hard'].forEach((mode) => {
          const sub = document.createElement('div');
          sub.className = 'set-subgroup';
          sub.innerHTML = `<span class="set-subgroup-title">المستوى: ${esc(MEMORY_MODE_LABELS[mode])}</span>`;
          sub.appendChild(numberRow('وقت الحفظ', state.memory[mode].memorizeSec, 2, 120, (v) => { state.memory[mode].memorizeSec = v; commit(); }, { suffix: 'ث' }));
          sub.appendChild(numberRow('وقت اللعب', state.memory[mode].playSec, 5, 240, (v) => { state.memory[mode].playSec = v; commit(); }, { suffix: 'ث' }));
          block.appendChild(sub);
        });
      }

      // عدد الجولات/الأسئلة لكل فريق
      const roundLabel = g === 'trivia' ? 'عدد الأسئلة لكل فريق' : 'عدد الجولات لكل فريق';
      block.appendChild(numberRow(roundLabel, state.rounds[g], 1, 20, (v) => { state.rounds[g] = v; commit(); }));

      timeSec.appendChild(block);
    });
    body.appendChild(timeSec);

    // ===== النقاط =====
    const scoreSec = section('النقاط والمكافآت', 'تحكّم بقيم النقاط ومضاعفة جولة المفاجأة');
    scoreSec.appendChild(numberRow('نقاط الإجابة الصحيحة', state.scoring.correctPoints, 1, 100, (v) => { state.scoring.correctPoints = v; commit(); }, { suffix: 'نقطة' }));
    scoreSec.appendChild(numberRow('مكافأة السرعة', state.scoring.speedBonus, 0, 100, (v) => { state.scoring.speedBonus = v; commit(); }, { suffix: 'نقطة' }));
    scoreSec.appendChild(toggleRow('تفعيل جولة المفاجأة', state.scoring.surpriseEnabled, (on) => { state.scoring.surpriseEnabled = on; commit(); }, 'جولة وسط الجلسة تضاعف الوقت والنقاط'));
    scoreSec.appendChild(numberRow('مضاعِف جولة المفاجأة', state.scoring.surpriseMultiplier, 2, 5, (v) => { state.scoring.surpriseMultiplier = v; commit(); }, { suffix: '×' }));
    // عتبات مكافأة السرعة (متقدّم)
    const adv = document.createElement('details');
    adv.className = 'set-advanced';
    adv.innerHTML = '<summary>عتبات مكافأة السرعة (متقدّم)</summary>';
    Object.keys(state.speedThresholds).forEach((g) => {
      adv.appendChild(numberRow(`${GAME_LABELS[g]} — أقل من`, state.speedThresholds[g], 1, 120, (v) => { state.speedThresholds[g] = v; commit(); }, { suffix: 'ث' }));
    });
    scoreSec.appendChild(adv);
    body.appendChild(scoreSec);

    // ===== الألعاب المفعّلة =====
    const gamesSec = section('الألعاب المتاحة', 'أوقف لعبة لإخفائها من القائمة ومن وضع «العب الكل»');
    const disabled = new Set(state.disabledGames);
    GAME_ORDER.forEach((g) => {
      gamesSec.appendChild(toggleRow(GAME_LABELS[g], !disabled.has(g), (on) => {
        const set = new Set(state.disabledGames);
        if (on) set.delete(g); else set.add(g);
        // امنع تعطيل كل الألعاب
        if (set.size >= GAME_ORDER.length) { flash('يجب إبقاء لعبة واحدة على الأقل'); render(); return; }
        state.disabledGames = Array.from(set);
        commit();
      }));
    });
    body.appendChild(gamesSec);

    // ===== الصوت =====
    const soundSec = section('الصوت والاهتزاز');
    soundSec.appendChild(toggleRow('تفعيل الصوت', state.sound.enabled, (on) => { state.sound.enabled = on; commit(); }));
    soundSec.appendChild(sliderRow('مستوى الصوت', state.sound.volume, (v) => { state.sound.volume = v; commit(); }));
    soundSec.appendChild(toggleRow('نقرات الأزرار', state.sound.events.ui, (on) => { state.sound.events.ui = on; commit(); }));
    soundSec.appendChild(toggleRow('تكتكة العدّ التنازلي', state.sound.events.tick, (on) => { state.sound.events.tick = on; commit(); }, 'في آخر ٥ ثوانٍ'));
    soundSec.appendChild(toggleRow('مؤثرات الفوز والخطأ', state.sound.events.effects, (on) => { state.sound.events.effects = on; commit(); }));
    soundSec.appendChild(toggleRow('اهتزاز الجهاز عند الخطأ', state.sound.vibration, (on) => { state.sound.vibration = on; commit(); }, 'الجوال فقط'));
    body.appendChild(soundSec);

    // ===== المظهر =====
    const lookSec = section('المظهر وإمكانية الوصول');
    lookSec.appendChild(selectRow('السمة', [{ value: 'dark', label: 'ليلي (الاستوديو)' }, { value: 'light', label: 'نهاري' }], state.appearance.theme, (v) => { state.appearance.theme = v; commit(); }));
    lookSec.appendChild(selectRow('حجم الخط', [{ value: 'small', label: 'صغير' }, { value: 'normal', label: 'عادي' }, { value: 'large', label: 'كبير' }, { value: 'xlarge', label: 'كبير جدًا' }], state.appearance.fontScale, (v) => { state.appearance.fontScale = v; commit(); }));
    lookSec.appendChild(toggleRow('تقليل الحركة', state.appearance.reduceMotion, (on) => { state.appearance.reduceMotion = on; commit(); }, 'يخفّف الأنيميشن والانتقالات'));
    const fsRow = document.createElement('div');
    fsRow.className = 'set-row';
    fsRow.innerHTML = `<span class="set-row-label">ملء الشاشة</span><button type="button" class="btn btn-secondary btn-sm" id="set-fullscreen">تبديل ملء الشاشة</button>`;
    fsRow.querySelector('#set-fullscreen').addEventListener('click', toggleFullscreen);
    lookSec.appendChild(fsRow);
    body.appendChild(lookSec);

    // ===== طيف =====
    const taifSec = section('المُقدِّمة طيف');
    taifSec.appendChild(toggleRow('إظهار تعليقات طيف', state.taif.speech, (on) => { state.taif.speech = on; commit(); }));
    taifSec.appendChild(toggleRow('تشغيل أنيميشن طيف المتحرّك (Lottie)', state.taif.lottie, (on) => { state.taif.lottie = on; commit(); flash('يُطبّق التغيير بعد إعادة تحميل الصفحة'); }, 'يتطلّب إعادة تحميل'));
    body.appendChild(taifSec);

    // أزرار التذييل
    el.querySelector('#set-home').addEventListener('click', goHome);
    el.querySelector('#set-reset').addEventListener('click', () => {
      if (window.confirm('إعادة جميع الإعدادات للوضع الافتراضي؟')) {
        state = deepClone(DEFAULTS); commit(); render(); flash('تمت إعادة التعيين');
      }
    });
    el.querySelector('#set-export').addEventListener('click', exportSettings);
    const fileInput = el.querySelector('#set-import-file');
    el.querySelector('#set-import').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importSettings);
  }

  // ---- إجراءات ---------------------------------------------------------------
  let flashTimer = null;
  function flash(msg) {
    let bar = document.getElementById('set-flash');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'set-flash';
      bar.className = 'set-flash';
      document.body.appendChild(bar);
    }
    bar.textContent = msg;
    bar.classList.add('is-visible');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => bar.classList.remove('is-visible'), 2200);
  }

  function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen || function () {}).call(document.documentElement);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
      }
    } catch { /* غير مدعوم */ }
  }

  function exportSettings() {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'taif-settings.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      flash('تعذّر التصدير');
    }
  }

  function importSettings(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = deepMerge(DEFAULTS, parsed);
        commit();
        render();
        flash('تم استيراد الإعدادات');
      } catch {
        flash('ملف غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ---- التهيئة ---------------------------------------------------------------
  load();
  apply(); // ينشر للمحرّك فورًا قبل بدء أي لعبة

  window.TaifSettings = { open, get: () => state, apply };

  function wire() {
    const btn = document.getElementById('open-settings-btn');
    if (btn) btn.addEventListener('click', open);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
