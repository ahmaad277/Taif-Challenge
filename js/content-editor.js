/* ============================================================================
 * محرّر المحتوى — عرض وتعديل وإضافة محتوى كل الألعاب
 * ----------------------------------------------------------------------------
 * يعرض المحتوى الأصلي (المدمج في الكود) + المحتوى المخصّص معًا، ويتيح تعديل أو
 * حذف أي عنصر. يخزّن في IndexedDB ثلاثة أنواع من السجلات:
 *   add    — عنصر مضاف من المستخدم
 *   edit   — تعديل على عنصر أصلي (مفتاحه b:<game>:<index>)
 *   delete — إخفاء عنصر أصلي (قابل للاسترجاع)
 * عند الإقلاع وبعد كل تغيير، يُعاد بناء كل مصفوفة لعبة من:
 *   الأصلي − المحذوف + التعديلات + المضاف.
 * يُحمّل بعد script.js وقبل taif-actor.js فكل المصفوفات العامة متاحة.
 * ========================================================================== */
(function () {
  'use strict';

  // ---- التخزين: الخادم مصدر الحقيقة + IndexedDB كاش محلي احتياطي --------------
  const API = '/api/content';
  const DB_NAME = 'taifContent';
  const STORE = 'items';
  const DB_VER = 1;
  const PASS_KEY = 'taif_content_passcode';
  let _dbPromise = null;
  let serverOnline = false;          // هل آخر مزامنة مع الخادم نجحت؟
  let localOnlyIds = [];             // عناصر في الكاش غير موجودة على الخادم (للترحيل)

  const getPasscode = () => { try { return localStorage.getItem(PASS_KEY) || ''; } catch { return ''; } };
  const setPasscode = (v) => { try { localStorage.setItem(PASS_KEY, v); } catch { /* ignore */ } };

  // --- IndexedDB (كاش) ---
  function openDB() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return _dbPromise;
  }
  async function cacheAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const rq = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      rq.onsuccess = () => resolve(rq.result || []);
      rq.onerror = () => reject(rq.error);
    });
  }
  async function cachePut(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function cacheDelete(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function cacheReplaceAll(items) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      store.clear();
      items.forEach((it) => store.put(it));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- الخادم ---
  // GET يرجّع رابط ملف content.json في Vercel Blob، ونقرأه مباشرة من الـ CDN
  // (لتفادي حد حجم استجابة الدالة). يدعم أيضًا { items } مباشرة كاحتياط.
  async function serverAll() {
    const r = await fetch(API, { cache: 'no-store' });
    if (r.status === 503) throw new Error('storage-not-configured');
    if (!r.ok) throw new Error('GET ' + r.status);
    const meta = await r.json();
    if (Array.isArray(meta.items)) return meta.items;
    if (!meta.url) return [];
    const r2 = await fetch(meta.url, { cache: 'no-store' });
    if (!r2.ok) throw new Error('BLOB ' + r2.status);
    const data = await r2.json();
    return Array.isArray(data.items) ? data.items : [];
  }
  async function serverWrite(method, payload) {
    const r = await fetch(API, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-write-key': getPasscode() },
      body: JSON.stringify(payload),
    });
    if (r.status === 401) throw new Error('unauthorized');
    if (r.status === 503) throw new Error('storage-not-configured');
    if (!r.ok) throw new Error(method + ' ' + r.status);
  }
  // يطلب رمز المضيف عند الحاجة ويعيد المحاولة مرة واحدة
  async function withPasscode(fn) {
    try { return await fn(); }
    catch (e) {
      if (String(e && e.message) === 'unauthorized') {
        const code = window.prompt('🔒 أدخل رمز المضيف للإضافة والتعديل:');
        if (code == null) throw e;
        setPasscode(code.trim());
        return fn();
      }
      throw e;
    }
  }

  // واجهة موحّدة: تكتب على الخادم ثم تحدّث الكاش المحلي
  async function dbAll() {
    try {
      const items = await serverAll();
      serverOnline = true;
      const serverIds = new Set(items.map((it) => it.id));
      let localOnly = [];
      try {
        const cached = await cacheAll();
        localOnly = cached.filter((it) => !serverIds.has(it.id)); // أُضيفت محليًا قبل المزامنة
      } catch { localOnly = []; }
      localOnlyIds = localOnly.map((it) => it.id);
      const all = items.concat(localOnly); // اعرض المحلي أيضًا حتى لا يختفي قبل ترحيله
      await cacheReplaceAll(all).catch(() => {}); // الكاش يحفظ الخادم + المحلي غير المرفوع
      return all;
    } catch (e) {
      serverOnline = false;
      console.warn('content sync offline, using local cache:', e && e.message);
      return cacheAll().catch(() => []);
    }
  }
  async function dbPut(item) {
    await withPasscode(() => serverWrite('POST', { item }));
    await cachePut(item).catch(() => {});
  }
  async function dbDelete(id) {
    await withPasscode(() => serverWrite('DELETE', { id }));
    await cacheDelete(id).catch(() => {});
  }

  // يرفع العناصر المحلية (المضافة قبل المزامنة) إلى الخادم
  async function migrateLocal() {
    const cached = await cacheAll();
    const serverIds = new Set((await serverAll().catch(() => [])).map((it) => it.id));
    const pending = cached.filter((it) => !serverIds.has(it.id));
    for (const it of pending) {
      await withPasscode(() => serverWrite('POST', { item: it }));
    }
    return pending.length;
  }

  const uid = () => 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---- نموذج البيانات -------------------------------------------------------
  let ITEMS = [];          // كل السجلات من IndexedDB
  const ORIGINALS = {};    // لقطة للمحتوى الأصلي لكل لعبة (قبل أي حقن)
  let _captured = false;

  const ARRAYS = {
    trivia: () => (typeof TRIVIA_QUESTIONS !== 'undefined' ? TRIVIA_QUESTIONS : null),
    sentence: () => (typeof SENTENCE_PUZZLES !== 'undefined' ? SENTENCE_PUZZLES : null),
    password: () => (typeof PASSWORD_PHRASES !== 'undefined' ? PASSWORD_PHRASES : null),
    creative: () => (typeof CREATIVE_CHALLENGES !== 'undefined' ? CREATIVE_CHALLENGES : null),
    picmerge: () => (typeof PICMERGE_PUZZLES !== 'undefined' ? PICMERGE_PUZZLES : null),
    spot: () => (typeof SPOT_PUZZLES !== 'undefined' ? SPOT_PUZZLES : null),
    memory: () => (typeof MEMORY_ICON_PUZZLES !== 'undefined' ? MEMORY_ICON_PUZZLES : null),
  };

  function captureOriginals() {
    if (_captured) return;
    Object.keys(ARRAYS).forEach((game) => {
      const arr = ARRAYS[game]();
      ORIGINALS[game] = arr ? arr.slice() : [];
    });
    _captured = true;
  }

  const addedFor = (game) => ITEMS.filter((it) => it.game === game && (!it.kind || it.kind === 'add'));
  function editMapFor(game) {
    const m = new Map();
    ITEMS.filter((it) => it.game === game && it.kind === 'edit').forEach((it) => m.set(it.targetKey, it));
    return m;
  }
  function deleteSetFor(game) {
    return new Set(ITEMS.filter((it) => it.game === game && it.kind === 'delete').map((it) => it.targetKey));
  }

  // يبني كائن عنصر مخصّص جاهز للعب
  function userEntry(game, rec) {
    if (game === 'memory') {
      const e = { __user: true, answer: rec.answer, image: rec.image };
      e._imgEl = Object.assign(new Image(), { src: rec.image });
      return e;
    }
    const { id, game: g, kind, createdAt, ...fields } = rec;
    return { __user: true, ...fields };
  }

  // يدمج تعديلًا على عنصر أصلي
  function mergeBuiltin(game, orig, editRec) {
    const merged = Object.assign({}, orig, editRec.fields, { __edited: true });
    if (game === 'memory' && editRec.fields.image) {
      merged._imgEl = Object.assign(new Image(), { src: editRec.fields.image });
    }
    return merged;
  }

  // قائمة العرض لكل لعبة: أصلي (مع التعديلات) + مخصّص
  function displayItems(game) {
    const originals = ORIGINALS[game] || [];
    const edits = editMapFor(game);
    const dels = deleteSetFor(game);
    const list = [];
    originals.forEach((orig, idx) => {
      const key = `b:${game}:${idx}`;
      const ed = edits.get(key);
      list.push({
        key, source: 'builtin', editKey: key, recordId: ed ? ed.id : null,
        deleted: dels.has(key), edited: !!ed,
        data: ed ? mergeBuiltin(game, orig, ed) : orig,
      });
    });
    addedFor(game).forEach((rec) => {
      list.push({
        key: rec.id, source: 'user', editKey: null, recordId: rec.id,
        deleted: false, edited: false, data: userEntry(game, rec),
      });
    });
    return list;
  }

  function activeCount(game) {
    return displayItems(game).filter((d) => !d.deleted).length;
  }

  // يعيد بناء مصفوفة كل لعبة من الأصلي − المحذوف + التعديلات + المضاف
  function applyAll() {
    Object.keys(ARRAYS).forEach((game) => {
      const arr = ARRAYS[game]();
      if (!arr) return;
      const result = [];
      displayItems(game).forEach((d) => { if (!d.deleted) result.push(d.data); });
      arr.length = 0;
      result.forEach((x) => arr.push(x));
    });
  }

  async function reload() {
    captureOriginals();
    ITEMS = await dbAll();
    ITEMS.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    applyAll();
  }

  // ---- أدوات الصور ----------------------------------------------------------
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('decode'));
      img.src = src;
    });
  }
  async function fileToDataURL(file, { max = 1000, square = false, quality = 0.85 } = {}) {
    const raw = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => rej(new Error('read'));
      fr.readAsDataURL(file);
    });
    const img = await loadImage(raw);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (square) {
      canvas.width = canvas.height = max;
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, max, max);
    } else {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/jpeg', quality);
  }

  // ---- كشف الفروق تلقائيًا (نسخة متصفّح مبسّطة من خط المعالجة) --------------
  async function imageDataAt(src, size) {
    const img = await loadImage(src);
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return ctx.getImageData(0, 0, size, size).data;
  }
  function boxBlur(src, w, h, r) {
    const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, c = 0;
      for (let dx = -r; dx <= r; dx++) { const xx = x + dx; if (xx >= 0 && xx < w) { s += src[y * w + xx]; c++; } }
      tmp[y * w + x] = s / c;
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, c = 0;
      for (let dy = -r; dy <= r; dy++) { const yy = y + dy; if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; c++; } }
      out[y * w + x] = s / c;
    }
    return out;
  }
  function dilate(mask, w, h, r) {
    const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let dx = -r; dx <= r; dx++) { const xx = x + dx; if (xx >= 0 && xx < w && mask[y * w + xx]) { v = 1; break; } } tmp[y * w + x] = v; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let dy = -r; dy <= r; dy++) { const yy = y + dy; if (yy >= 0 && yy < h && tmp[yy * w + x]) { v = 1; break; } } out[y * w + x] = v; }
    return out;
  }
  function erode(mask, w, h, r) {
    const inv = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) inv[i] = mask[i] ? 0 : 1;
    const d = dilate(inv, w, h, r);
    for (let i = 0; i < w * h; i++) d[i] = d[i] ? 0 : 1;
    return d;
  }
  function components(mask, w, h) {
    const labels = new Int32Array(w * h), comps = [], stack = [];
    let next = 0;
    for (let i = 0; i < w * h; i++) {
      if (!mask[i] || labels[i]) continue;
      next++; let area = 0, minX = w, minY = h, maxX = 0, maxY = 0;
      stack.length = 0; stack.push(i); labels[i] = next;
      while (stack.length) {
        const p = stack.pop(), x = p % w, y = (p / w) | 0;
        area++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const np = ny * w + nx; if (mask[np] && !labels[np]) { labels[np] = next; stack.push(np); }
        }
      }
      comps.push({ area, minX, minY, maxX, maxY });
    }
    return comps;
  }
  async function autoDetect(baseSrc, modSrc) {
    const D = 260;
    const a = await imageDataAt(baseSrc, D), b = await imageDataAt(modSrc, D);
    const n = D * D, diff = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const j = i * 4;
      const dr = a[j] - b[j], dg = a[j + 1] - b[j + 1], db = a[j + 2] - b[j + 2];
      diff[i] = Math.sqrt((dr * dr + dg * dg + db * db) / 3);
    }
    const bl = boxBlur(diff, D, D, 3);
    let peak = 0; for (let i = 0; i < n; i++) if (bl[i] > peak) peak = bl[i];
    if (peak < 14) return [];
    const mask = new Uint8Array(n);
    for (let i = 0; i < n; i++) mask[i] = bl[i] >= 16 ? 1 : 0;
    const closed = erode(dilate(mask, D, D, 3), D, D, 1);
    let comps = components(closed, D, D).filter((c) => c.area >= 0.001 * n).sort((x, y) => y.area - x.area);
    const largest = comps[0] ? comps[0].area : 0;
    comps = comps.filter((c) => c.area >= 0.1 * largest).slice(0, 8);
    return comps.map((c) => {
      const bw = c.maxX - c.minX + 1, bh = c.maxY - c.minY + 1;
      return {
        x: +((c.minX + c.maxX) / 2 / D).toFixed(3),
        y: +((c.minY + c.maxY) / 2 / D).toFixed(3),
        r: +Math.min(0.15, Math.max(0.05, (Math.max(bw, bh) / 2 / D) * 1.22)).toFixed(3),
      };
    });
  }

  // ---- تعريف الألعاب --------------------------------------------------------
  const esc = (t) => (typeof escapeHtml === 'function' ? escapeHtml(t) : String(t == null ? '' : t));

  const GAMES = {
    trivia: { name: 'الأسئلة العامة', kind: 'trivia', summary: (it) => it.question },
    password: { name: 'كلمة السر', kind: 'password', summary: (it) => it.answer },
    sentence: { name: 'رتب الجملة', kind: 'sentence', summary: (it) => (it.words || []).join(' ') },
    creative: { name: 'التحدي الإبداعي', kind: 'creative', summary: (it) => it.prompt },
    picmerge: { name: 'تحدي الصور', kind: 'picmerge', summary: (it) => it.answer },
    memory: { name: 'الذاكرة البصرية', kind: 'memory', summary: (it) => it.answer },
    spot: { name: 'أوجد الفروق', kind: 'spot', summary: (it) => `${(it.differences || []).length} فروقات` },
  };
  const GAME_ORDER = ['trivia', 'password', 'sentence', 'creative', 'picmerge', 'memory', 'spot'];

  // يحوّل عنصر عرض إلى قيم ابتدائية للنموذج (للتعديل)
  function toInitial(game, data) {
    switch (GAMES[game].kind) {
      case 'trivia': return { categoryId: data.categoryId, question: data.question, options: (data.options || []).slice(), correctIndex: data.correctIndex };
      case 'password': return { answer: data.answer, category: data.category };
      case 'sentence': return { sentence: (data.words || []).join(' ') };
      case 'creative': return { prompt: data.prompt, target: data.target };
      case 'picmerge': return { image: data.image || '', answer: data.answer, aliases: (data.aliases || []).join('، ') };
      case 'memory': return { image: data.image || '', answer: data.answer, hasVisual: !!(data.image || data.draw) };
      case 'spot': return { base: data.base, modified: data.modified, differences: (data.differences || []).map((d) => ({ ...d })) };
      default: return {};
    }
  }

  // ---- الواجهة --------------------------------------------------------------
  let listFilter = '';
  const root = () => document.getElementById('ce-root');

  function open() {
    if (typeof showScreen === 'function') showScreen('content-editor-screen');
    renderPicker();
  }
  function goHome() { if (typeof showScreen === 'function') showScreen('welcome-screen'); }

  function writeErrorMsg(err) {
    const m = String(err && err.message);
    if (m === 'storage-not-configured') return 'الخادم غير مُهيّأ بعد (لم تُضبط خدمة التخزين).';
    if (m === 'unauthorized') return 'رمز المضيف غير صحيح.';
    if (m.includes('Failed to fetch') || m.startsWith('POST') || m.startsWith('DELETE')) return 'تعذّر الاتصال بالخادم — تأكد من اتصالك بالإنترنت.';
    return 'تعذّر الحفظ (قد تكون الصورة كبيرة جدًا).';
  }

  function renderSyncStatus(host) {
    if (!host) return;
    if (!serverOnline) {
      host.innerHTML = `<div class="ce-sync ce-sync--offline">
        <span>⚠️ غير متصل بخادم المزامنة — تُعرض نسخة محلية. الإضافة والتعديل تتطلب اتصالاً.</span>
      </div>`;
      return;
    }
    if (localOnlyIds.length) {
      host.innerHTML = `<div class="ce-sync ce-sync--pending">
        <span>لديك ${localOnlyIds.length} عنصرًا محليًا غير مرفوع لباقي الأجهزة.</span>
        <button type="button" class="btn btn-primary btn-sm" id="ce-migrate">رفع للخادم الآن</button>
      </div>`;
      host.querySelector('#ce-migrate').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true; btn.textContent = 'جارٍ الرفع...';
        try {
          const n = await migrateLocal();
          await reload();
          renderPicker();
          if (typeof setTaifSpeech === 'function') { /* optional */ }
          window.alert(`تم رفع ${n} عنصرًا — صارت متاحة على كل الأجهزة.`);
        } catch (err) {
          btn.disabled = false; btn.textContent = 'رفع للخادم الآن';
          window.alert(String(err && err.message) === 'unauthorized' ? 'رمز المضيف غير صحيح.' : 'تعذّر الرفع، حاول مرة أخرى.');
        }
      });
      return;
    }
    host.innerHTML = `<div class="ce-sync ce-sync--ok"><span>✓ متزامن مع كل الأجهزة</span></div>`;
  }

  function renderPicker() {
    const el = root();
    el.innerHTML = `
      <div class="ce-header">
        <h2 class="screen-title">إدارة المحتوى</h2>
        <p class="ce-subtitle">اختر لعبة لعرض محتواها الحالي وتعديله أو إضافة جديد</p>
      </div>
      <div id="ce-sync-status"></div>
      <div class="ce-game-grid" id="ce-game-grid"></div>
      <button class="btn btn-secondary" id="ce-home-btn">عودة للرئيسية</button>`;
    renderSyncStatus(el.querySelector('#ce-sync-status'));
    const grid = el.querySelector('#ce-game-grid');
    GAME_ORDER.forEach((game) => {
      const count = activeCount(game);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ce-game-card';
      const icon = (window.GAME_ICON_SVG && window.GAME_ICON_SVG[game]) || '';
      card.innerHTML = `
        <span class="ce-game-thumb">${icon}</span>
        <span class="ce-game-name">${esc(GAMES[game].name)}</span>
        <span class="ce-count-badge${count ? ' ce-count-badge--has' : ''}">${count}</span>`;
      card.addEventListener('click', () => { listFilter = ''; renderGameEditor(game); });
      grid.appendChild(card);
    });
    el.querySelector('#ce-home-btn').addEventListener('click', goHome);
  }

  function renderGameEditor(game) {
    const el = root();
    el.innerHTML = `
      <div class="ce-header ce-header--row">
        <button class="btn btn-secondary btn-sm" id="ce-back">‹ الألعاب</button>
        <h2 class="screen-title ce-game-title">${esc(GAMES[game].name)}</h2>
      </div>
      <div id="ce-form-host"></div>
      <div class="ce-list">
        <div class="ce-list-head">
          <h3 class="ce-list-title">المحتوى الحالي <span class="ce-list-count" id="ce-list-count"></span></h3>
          <input type="search" id="ce-search" class="ui-input ce-input ce-search" placeholder="بحث...">
        </div>
        <ul class="ce-items" id="ce-items"></ul>
      </div>`;
    el.querySelector('#ce-back').addEventListener('click', renderPicker);
    const search = el.querySelector('#ce-search');
    search.value = listFilter;
    search.addEventListener('input', () => { listFilter = search.value.trim(); renderItems(game); });
    buildForm(game, el.querySelector('#ce-form-host'), null, null);
    renderItems(game);
  }

  // ---- بناء النموذج (إضافة/تعديل) ------------------------------------------
  function fieldText(key, label, { value = '', placeholder = '', textarea = false, hint = '' } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'ce-field';
    wrap.innerHTML = `<label class="ce-label" for="ce-${key}">${esc(label)}</label>`
      + (textarea
        ? `<textarea id="ce-${key}" class="ui-input ce-input ce-textarea" placeholder="${esc(placeholder)}" rows="2">${esc(value)}</textarea>`
        : `<input id="ce-${key}" class="ui-input ce-input" type="text" placeholder="${esc(placeholder)}" autocomplete="off" value="${esc(value)}">`)
      + (hint ? `<span class="ce-hint">${esc(hint)}</span>` : '');
    return wrap;
  }

  function buildForm(game, container, initial, editingCtx) {
    container.innerHTML = '';
    const kind = GAMES[game].kind;
    const init = initial || {};
    const editing = !!editingCtx;
    const form = document.createElement('form');
    form.className = 'ce-form';
    form.id = 'ce-form';

    if (editing) {
      const banner = document.createElement('div');
      banner.className = 'ce-edit-banner';
      banner.innerHTML = `<span>✎ وضع التعديل</span><button type="button" class="ce-cancel-edit">إلغاء</button>`;
      banner.querySelector('.ce-cancel-edit').addEventListener('click', () => buildForm(game, container, null, null));
      form.appendChild(banner);
    }

    const state = {};

    if (kind === 'trivia') {
      const cats = (typeof TRIVIA_CATEGORIES !== 'undefined' ? TRIVIA_CATEGORIES : []);
      const cat = document.createElement('div');
      cat.className = 'ce-field';
      cat.innerHTML = `<label class="ce-label" for="ce-cat">التصنيف</label>
        <select id="ce-cat" class="ui-input ce-input">
          ${cats.map((c) => `<option value="${esc(c.id)}" ${c.id === init.categoryId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>`;
      form.appendChild(cat);
      form.appendChild(fieldText('question', 'نص السؤال', { value: init.question || '', placeholder: 'اكتب السؤال...', textarea: true }));
      const opts = document.createElement('div');
      opts.className = 'ce-field';
      opts.innerHTML = `<span class="ce-label">الخيارات — اختر الإجابة الصحيحة</span>`;
      const list = document.createElement('div');
      list.className = 'ce-options';
      for (let i = 0; i < 4; i++) {
        const row = document.createElement('label');
        row.className = 'ce-option-row';
        const checked = (init.correctIndex != null ? init.correctIndex : 0) === i;
        row.innerHTML = `
          <input type="radio" name="ce-correct" class="ce-radio" value="${i}" ${checked ? 'checked' : ''}>
          <input type="text" class="ui-input ce-input ce-opt-input" placeholder="الخيار ${i + 1}" autocomplete="off" value="${esc((init.options || [])[i] || '')}">`;
        list.appendChild(row);
      }
      opts.appendChild(list);
      form.appendChild(opts);
      state.collect = () => ({
        categoryId: form.querySelector('#ce-cat').value,
        question: form.querySelector('#ce-question').value.trim(),
        options: [...list.querySelectorAll('.ce-opt-input')].map((i) => i.value.trim()),
        correctIndex: Number(list.querySelector('input[name="ce-correct"]:checked').value),
      });
      state.validate = (v) => (!v.question ? 'اكتب نص السؤال' : v.options.some((o) => !o) ? 'اكتب الخيارات الأربعة' : new Set(v.options).size !== 4 ? 'الخيارات يجب أن تكون مختلفة' : null);
    } else if (kind === 'password') {
      form.appendChild(fieldText('answer', 'كلمة السر (العبارة)', { value: init.answer || '', placeholder: 'مثال: الحركة بركة' }));
      form.appendChild(fieldText('category', 'التلميح / الفئة', { value: init.category || '', placeholder: 'مثال: مثل خليجي شعبي' }));
      state.collect = () => ({ answer: form.querySelector('#ce-answer').value.trim(), category: form.querySelector('#ce-category').value.trim() });
      state.validate = (v) => (!v.answer ? 'اكتب كلمة السر' : !v.category ? 'اكتب التلميح' : null);
    } else if (kind === 'sentence') {
      const f = fieldText('sentence', 'الجملة', { value: init.sentence || '', placeholder: 'اكتب جملة من 3 إلى 8 كلمات', hint: 'ستُقسّم تلقائيًا حسب المسافات' });
      form.appendChild(f);
      const preview = document.createElement('div');
      preview.className = 'ce-chips';
      form.appendChild(preview);
      const input = f.querySelector('#ce-sentence');
      const renderChips = () => {
        const words = input.value.trim().split(/\s+/).filter(Boolean);
        preview.innerHTML = words.map((w) => `<span class="ce-chip">${esc(w)}</span>`).join('');
      };
      input.addEventListener('input', renderChips);
      renderChips();
      state.collect = () => ({ words: input.value.trim().split(/\s+/).filter(Boolean) });
      state.validate = (v) => (v.words.length < 3 ? 'الجملة تحتاج 3 كلمات على الأقل' : v.words.length > 8 ? 'الجملة طويلة (8 كلمات كحد أقصى)' : null);
    } else if (kind === 'creative') {
      form.appendChild(fieldText('prompt', 'التحدي (ماذا يرسم اللاعب؟)', { value: init.prompt || '', placeholder: 'مثال: ارسم سيارة' }));
      form.appendChild(fieldText('target', 'الكلمة المستهدفة', { value: init.target || '', placeholder: 'مثال: سيارة' }));
      state.collect = () => ({ prompt: form.querySelector('#ce-prompt').value.trim(), target: form.querySelector('#ce-target').value.trim() });
      state.validate = (v) => (!v.prompt ? 'اكتب نص التحدي' : !v.target ? 'اكتب الكلمة المستهدفة' : null);
    } else if (kind === 'picmerge') {
      const up = imageUploader('صورة اللغز', { square: false, max: 900 }, init.image);
      form.appendChild(up.el);
      form.appendChild(fieldText('answer', 'الإجابة', { value: init.answer || '', placeholder: 'الكلمة الصحيحة' }));
      form.appendChild(fieldText('aliases', 'إجابات بديلة (اختياري)', { value: init.aliases || '', placeholder: 'افصل بينها بفاصلة', hint: 'تُقبل كإجابات صحيحة أيضًا' }));
      state.collect = () => ({
        image: up.getValue() || init.image || '',
        answer: form.querySelector('#ce-answer').value.trim(),
        aliases: form.querySelector('#ce-aliases').value.split(/[،,]/).map((s) => s.trim()).filter(Boolean),
        id: editing ? undefined : uid(),
      });
      state.validate = (v) => (!v.image ? 'ارفع صورة اللغز' : !v.answer ? 'اكتب الإجابة' : null);
    } else if (kind === 'memory') {
      const up = imageUploader('صورة البطاقة', { square: true, max: 400 }, init.image);
      form.appendChild(up.el);
      if (init.hasVisual && !init.image) {
        const note = document.createElement('p');
        note.className = 'ce-hint';
        note.textContent = 'هذه أيقونة مرسومة — ارفع صورة لاستبدالها، أو اترك الحقل لإبقائها.';
        up.el.appendChild(note);
      }
      form.appendChild(fieldText('answer', 'اسم الصورة', { value: init.answer || '', placeholder: 'مثال: قطة', hint: 'يُعرض في وضع تسمية الصور' }));
      state.collect = () => ({ image: up.getValue(), answer: form.querySelector('#ce-answer').value.trim() });
      state.validate = (v) => ((!v.image && !init.hasVisual) ? 'ارفع صورة البطاقة' : !v.answer ? 'اكتب اسم الصورة' : null);
    } else if (kind === 'spot') {
      const editor = spotEditor(init);
      form.appendChild(editor.el);
      state.collect = () => editor.getValue();
      state.validate = (v) => (!v.base || !v.modified ? 'ارفع الصورة الأصلية والمعدّلة' : !v.differences.length ? 'حدّد فرقًا واحدًا على الأقل' : null);
    }

    const error = document.createElement('p');
    error.className = 'error-message';
    error.hidden = true;
    form.appendChild(error);

    const actions = document.createElement('div');
    actions.className = 'btn-group ce-actions';
    actions.innerHTML = `<button type="submit" class="btn btn-primary">${editing ? 'حفظ التعديل' : 'حفظ وإضافة'}</button>`;
    form.appendChild(actions);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = state.collect();
      const msg = state.validate(v);
      if (msg) { error.textContent = msg; error.hidden = false; return; }
      error.hidden = true;
      const btn = actions.querySelector('button');
      btn.disabled = true; btn.textContent = 'جارٍ الحفظ...';
      try {
        await saveForm(game, v, editingCtx);
        await reload();
        renderGameEditor(game);
      } catch (err) {
        error.textContent = writeErrorMsg(err);
        error.hidden = false;
        btn.disabled = false; btn.textContent = editing ? 'حفظ التعديل' : 'حفظ وإضافة';
      }
    });

    container.appendChild(form);
    if (editing) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // resolve image keep-on-empty for memory edits
  function resolveImageKeep(game, v, editingCtx) {
    if (game !== 'memory') return;
    if (!v.image && editingCtx && editingCtx.source === 'user') {
      const rec = ITEMS.find((it) => it.id === editingCtx.recordId);
      if (rec) v.image = rec.image;
    }
  }

  async function saveForm(game, v, editingCtx) {
    resolveImageKeep(game, v, editingCtx);
    const clean = { ...v };
    delete clean.id;
    if (!editingCtx) {
      await dbPut({ id: uid(), game, kind: 'add', createdAt: Date.now(), ...clean });
    } else if (editingCtx.source === 'user') {
      const prev = ITEMS.find((it) => it.id === editingCtx.recordId);
      await dbPut({ id: editingCtx.recordId, game, kind: 'add', createdAt: (prev && prev.createdAt) || Date.now(), ...clean });
    } else { // builtin edit
      // for memory builtin: empty image means keep drawn original (don't store image)
      if (game === 'memory' && !clean.image) delete clean.image;
      await dbPut({ id: 'e:' + editingCtx.key, game, kind: 'edit', targetKey: editingCtx.key, createdAt: Date.now(), fields: clean });
    }
  }

  // مُحمّل صورة عام مع قيمة ابتدائية اختيارية
  function imageUploader(label, opts, initialSrc) {
    const el = document.createElement('div');
    el.className = 'ce-field';
    el.innerHTML = `
      <span class="ce-label">${esc(label)}</span>
      <label class="ce-uploader">
        <input type="file" accept="image/*" hidden>
        <span class="ce-uploader-prompt"${initialSrc ? ' hidden' : ''}>انقر لاختيار صورة</span>
        <img class="ce-uploader-preview"${initialSrc ? '' : ' hidden'} src="${initialSrc ? esc(initialSrc) : ''}" alt="">
      </label>
      <span class="ce-hint">JPG أو PNG. صور iPhone بصيغة HEIC قد لا تُفتح في المتصفح.</span>
      <span class="error-message ce-up-error" hidden></span>`;
    const input = el.querySelector('input');
    const prompt = el.querySelector('.ce-uploader-prompt');
    const preview = el.querySelector('.ce-uploader-preview');
    const upErr = el.querySelector('.ce-up-error');
    let value = '';
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      upErr.hidden = true;
      try {
        value = await fileToDataURL(file, opts);
        preview.src = value; preview.hidden = false; prompt.hidden = true;
      } catch (e) {
        value = '';
        upErr.textContent = 'تعذّر قراءة الصورة. جرّب JPG/PNG.';
        upErr.hidden = false;
      }
    });
    return { el, getValue: () => value };
  }

  // محرّر أوجد الفروق — يقبل قيمًا ابتدائية للتعديل
  function spotEditor(init) {
    const el = document.createElement('div');
    el.className = 'ce-spot';
    el.innerHTML = `
      <div class="ce-spot-uploads">
        <label class="ce-spot-up">
          <input type="file" accept="image/*" hidden data-side="base">
          <span class="ce-spot-up-label">الصورة الأصلية</span>
          <span class="ce-spot-up-prompt">${init.base ? '✓ موجودة — انقر للاستبدال' : 'انقر للاختيار'}</span>
        </label>
        <label class="ce-spot-up">
          <input type="file" accept="image/*" hidden data-side="mod">
          <span class="ce-spot-up-label">الصورة المعدّلة</span>
          <span class="ce-spot-up-prompt">${init.modified ? '✓ موجودة — انقر للاستبدال' : 'انقر للاختيار'}</span>
        </label>
      </div>
      <p class="ce-hint">انقر على الصورة المعدّلة لإضافة دائرة · انقر دائرة لتحديدها · اسحب لتحريكها.</p>
      <div class="ce-spot-toolbar" hidden>
        <button type="button" class="btn btn-secondary btn-sm" data-act="auto">كشف تلقائي</button>
        <label class="ce-spot-size">الحجم<input type="range" min="4" max="16" value="9" step="1" data-act="size" disabled></label>
        <button type="button" class="btn btn-secondary btn-sm" data-act="del" disabled>حذف المحدّد</button>
        <button type="button" class="btn btn-secondary btn-sm" data-act="clear">مسح الكل</button>
      </div>
      <div class="ce-spot-stages" hidden>
        <figure class="ce-spot-pane">
          <figcaption class="ce-spot-pane-label">الأصلية — للمقارنة</figcaption>
          <div class="ce-spot-stage ce-spot-stage--ref">
            <img class="ce-spot-img" data-role="base" alt="الأصلية" draggable="false">
            <div class="ce-spot-layer ce-spot-layer--ref"></div>
          </div>
        </figure>
        <figure class="ce-spot-pane">
          <figcaption class="ce-spot-pane-label">المعدّلة — انقر لتحديد الفروق</figcaption>
          <div class="ce-spot-stage ce-spot-stage--edit">
            <img class="ce-spot-img" data-role="mod" alt="المعدّلة" draggable="false">
            <div class="ce-spot-layer"></div>
          </div>
        </figure>
      </div>`;

    const state = {
      base: init.base || '',
      modified: init.modified || '',
      differences: (init.differences || []).map((d) => ({ ...d })),
      selected: -1,
    };
    const stages = el.querySelector('.ce-spot-stages');
    const baseImg = el.querySelector('[data-role="base"]');
    const modImg = el.querySelector('[data-role="mod"]');
    const stage = el.querySelector('.ce-spot-stage--edit'); // interactive pane
    const layer = stage.querySelector('.ce-spot-layer');
    const refLayer = el.querySelector('.ce-spot-layer--ref');
    const toolbar = el.querySelector('.ce-spot-toolbar');
    const sizeInput = el.querySelector('[data-act="size"]');
    const delBtn = el.querySelector('[data-act="del"]');

    if (state.base) baseImg.src = state.base;
    if (state.modified) modImg.src = state.modified;

    function renderCircles(container, interactive) {
      container.innerHTML = '';
      state.differences.forEach((d, i) => {
        const c = document.createElement('div');
        c.className = 'ce-spot-circle' + (i === state.selected ? ' is-selected' : '');
        c.style.left = d.x * 100 + '%';
        c.style.top = d.y * 100 + '%';
        c.style.width = d.r * 200 + '%';
        c.style.height = d.r * 200 + '%';
        if (interactive) c.dataset.i = i;
        container.appendChild(c);
      });
    }

    function refresh() {
      renderCircles(layer, true);     // interactive (modified)
      renderCircles(refLayer, false); // mirror on original
      delBtn.disabled = state.selected < 0;
      sizeInput.disabled = state.selected < 0;
      if (state.selected >= 0) sizeInput.value = Math.round(state.differences[state.selected].r * 100);
      toolbar.hidden = !(state.base && state.modified);
      stages.hidden = !(state.base || state.modified);
    }

    el.querySelectorAll('input[type="file"]').forEach((inp) => {
      inp.addEventListener('change', async () => {
        const file = inp.files && inp.files[0];
        if (!file) return;
        const side = inp.dataset.side;
        const lbl = inp.closest('.ce-spot-up').querySelector('.ce-spot-up-prompt');
        try {
          const data = await fileToDataURL(file, { square: true, max: 900 });
          if (side === 'base') { state.base = data; baseImg.src = data; }
          else { state.modified = data; modImg.src = data; }
          lbl.textContent = '✓ تم';
          refresh();
        } catch (e) { lbl.textContent = 'تعذّر فتح الصورة'; }
      });
    });

    function relCoords(ev) {
      const r = stage.getBoundingClientRect();
      const p = ev.touches ? ev.touches[0] : ev;
      return { x: (p.clientX - r.left) / r.width, y: (p.clientY - r.top) / r.height };
    }
    let dragging = -1;
    layer.addEventListener('pointerdown', (ev) => {
      const t = ev.target.closest('.ce-spot-circle');
      if (t) { state.selected = Number(t.dataset.i); dragging = state.selected; layer.setPointerCapture(ev.pointerId); refresh(); ev.preventDefault(); }
    });
    layer.addEventListener('pointermove', (ev) => {
      if (dragging < 0) return;
      const { x, y } = relCoords(ev);
      state.differences[dragging].x = Math.min(1, Math.max(0, x));
      state.differences[dragging].y = Math.min(1, Math.max(0, y));
      refresh();
    });
    layer.addEventListener('pointerup', () => { dragging = -1; });
    stage.addEventListener('click', (ev) => {
      if (!state.modified) return;
      if (ev.target.closest('.ce-spot-circle')) return;
      const { x, y } = relCoords(ev);
      state.differences.push({ x: +x.toFixed(3), y: +y.toFixed(3), r: 0.09 });
      state.selected = state.differences.length - 1;
      refresh();
    });
    sizeInput.addEventListener('input', () => {
      if (state.selected < 0) return;
      state.differences[state.selected].r = Number(sizeInput.value) / 100;
      refresh();
    });
    delBtn.addEventListener('click', () => {
      if (state.selected < 0) return;
      state.differences.splice(state.selected, 1); state.selected = -1; refresh();
    });
    el.querySelector('[data-act="clear"]').addEventListener('click', () => { state.differences = []; state.selected = -1; refresh(); });
    el.querySelector('[data-act="auto"]').addEventListener('click', async (e) => {
      if (!state.base || !state.modified) return;
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = 'جارٍ الكشف...';
      try {
        const found = await autoDetect(state.base, state.modified);
        if (found.length) { state.differences = found; state.selected = -1; refresh(); }
        else btn.textContent = 'لا فروق واضحة';
      } finally { setTimeout(() => { btn.disabled = false; btn.textContent = 'كشف تلقائي'; }, 1200); }
    });

    refresh();
    return { el, getValue: () => ({ base: state.base, modified: state.modified, aspect: '1 / 1', differences: state.differences }) };
  }

  // ---- قائمة المحتوى --------------------------------------------------------
  function renderItems(game) {
    const list = document.getElementById('ce-items');
    const countEl = document.getElementById('ce-list-count');
    if (!list) return;
    let items = displayItems(game);
    const total = items.filter((d) => !d.deleted).length;
    countEl.textContent = `(${total})`;
    if (listFilter) {
      const q = listFilter;
      items = items.filter((d) => (GAMES[game].summary(d.data) || '').includes(q));
    }
    // الأحدث (المخصّص) أولًا، ثم الأصلي
    items = items.slice().reverse();
    if (!items.length) {
      list.innerHTML = `<li class="ce-empty">${listFilter ? 'لا نتائج للبحث' : 'لا يوجد محتوى'}</li>`;
      return;
    }
    list.innerHTML = '';
    items.forEach((item) => {
      const d = item.data;
      const li = document.createElement('li');
      li.className = 'ce-item' + (item.deleted ? ' is-deleted' : '');
      const imgSrc = d.image || d.modified;
      const thumb = imgSrc
        ? `<img class="ce-item-thumb" src="${esc(imgSrc)}" alt="" loading="lazy">`
        : `<span class="ce-item-thumb ce-item-thumb--text">${esc((GAMES[game].summary(d) || '؟').slice(0, 1))}</span>`;
      const tag = item.source === 'user'
        ? `<span class="ce-tag ce-tag--user">مخصّص</span>`
        : `<span class="ce-tag ce-tag--builtin">أصلي${item.edited ? ' · معدّل' : ''}</span>`;
      const revertBtn = (item.source === 'builtin' && item.edited && !item.deleted)
        ? `<button class="ce-item-btn ce-item-revert" type="button" title="إرجاع للأصل" aria-label="إرجاع للأصل">↶</button>` : '';
      li.innerHTML = `
        ${thumb}
        <span class="ce-item-text">${esc(GAMES[game].summary(d))}</span>
        ${tag}
        <button class="ce-item-btn ce-item-edit" type="button" title="تعديل" aria-label="تعديل" ${item.deleted ? 'disabled' : ''}>✎</button>
        ${revertBtn}
        <button class="ce-item-btn ce-item-del" type="button" title="${item.deleted ? 'استرجاع' : 'حذف'}" aria-label="${item.deleted ? 'استرجاع' : 'حذف'}">${item.deleted ? '↺' : '✕'}</button>`;
      li.querySelector('.ce-item-edit').addEventListener('click', () => {
        buildForm(game, document.getElementById('ce-form-host'), toInitial(game, d), { source: item.source, key: item.editKey, recordId: item.recordId });
      });
      const revertEl = li.querySelector('.ce-item-revert');
      if (revertEl) revertEl.addEventListener('click', async () => {
        try {
          await dbDelete('e:' + item.key);
          await reload();
          renderItems(game);
        } catch (err) { window.alert(writeErrorMsg(err)); }
      });
      li.querySelector('.ce-item-del').addEventListener('click', () => toggleDelete(game, item));
      list.appendChild(li);
    });
  }

  async function toggleDelete(game, item) {
    try {
      if (item.source === 'user') {
        if (!confirm('حذف هذا العنصر نهائيًا؟')) return;
        await dbDelete(item.recordId);
      } else if (item.deleted) {
        await dbDelete('d:' + item.key); // restore
      } else {
        await dbPut({ id: 'd:' + item.key, game, kind: 'delete', targetKey: item.key, createdAt: Date.now() });
      }
      await reload();
      renderItems(game);
    } catch (err) { window.alert(writeErrorMsg(err)); }
  }

  // ---- إقلاع ----------------------------------------------------------------
  window.TaifContentEditor = { open };
  document.addEventListener('DOMContentLoaded', () => {
    const entry = document.getElementById('open-content-editor-btn');
    if (entry) entry.addEventListener('click', open);
    reload().catch((e) => console.warn('content-editor load failed', e));
  });
})();
