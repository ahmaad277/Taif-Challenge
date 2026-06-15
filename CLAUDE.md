# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**تحديات طيف (Taif Challenge)** — a client-side, Arabic-first, RTL party game for 2–8 teams, hosted by a sarcastic presenter character named **طيف (Taif)**. It contains 7 mini-games plus a hosted "play all" session flow. Pure vanilla HTML/CSS/JS — **no framework, no build step, no bundler**. Deployed as a static site on Vercel (`vercel.json` enables `cleanUrls`) and runs as an installable PWA (`manifest.webmanifest`).

The codebase, all UI text, comments, and game content are in **Arabic**. Match that when adding user-facing strings.

## Running & developing

```bash
# Serve locally (config in .claude/launch.json → preview_start "static")
python -m http.server 4240        # then open http://localhost:4240

# Asset-processing scripts (Node, require: npm install — pulls in sharp)
npm run remove-bg                 # scripts/remove-bg.mjs
npm run generate-lottie           # scripts/generate-taif-lottie.mjs
npm run generate-placeholders     # scripts/generate-placeholders.mjs
node scripts/process-spot-images.mjs   # split/resize spot-the-difference photos
```

There are **no tests, no linter, and no build**. "Building" means editing the source files directly; reload the browser to see changes. Verify visually via the preview server rather than any test suite.

Node is used **only offline** for one-time image/asset generation in `scripts/*.mjs` (via `sharp`). None of it ships to the browser — the deployed app is just the static files.

## Architecture

### Script loading & global namespace
Scripts load via plain `<script>` tags in a **fixed order** (see end of `index.html`) and communicate through **global functions and a single global `gameState` object** — there are no modules or imports. Load order matters: data/registry files before `script.js`, and `taif-actor.js` last.

```
icon-utils.js → vendor/lottie.min.js → game-icons.js → trivia-data.js
→ picmerge-data.js → spot-scenes.js → script.js → taif-actor.js
```

- `icon-utils.js` defines the global `DESIGN_COLORS` palette consumed by the canvas thumbnail drawers.
- Data files (`trivia-data.js`, `picmerge-data.js`, `spot-scenes.js`) each expose a top-level `const` array/registry that `script.js` reads by global name (e.g. `PICMERGE_PUZZLES`, `SPOT_PUZZLES`, `SENTENCE_PUZZLES` which lives inside `script.js`).

### `js/script.js` (~4500 lines) — the engine
This single file holds nearly all game logic. Key structures:

- **`gameState`** (top of file) — one giant object with a per-game sub-object (`trivia`, `sentence`, `picmerge`, `spot`, `memory`, `creative`, `password`) plus `teams`, `scores`, and `session`. Each game tracks its own `timerId`, `feedbackTimeoutId`, pool/pointer for non-repeating question selection, and `currentTeamIndex` for turn rotation.
- **`GAME_REGISTRY`** — the source of truth for the 7 games: each entry has `{ id, name, screenId, start(), drawThumb(), enabled }`. To add/disable a game, edit this array. `getPlayableGameIds()` filters by `enabled`.
- **`showScreen(screenId)`** — the SPA router. Every screen is a `<section class="screen">` in `index.html`; only one is `active` at a time. This function also drives Taif's layout (hero vs. dock) per screen.
- **Session flow** (`gameState.session`) — `startRandomAllGames()` builds a shuffled `gameQueue`, inserts one **surprise round** mid-session, and `onGameCompleted(id)` advances the queue. Surprise rounds **double** durations and points via `getRoundDuration` / `getCorrectPoints` / `getSpeedBonus` (all keyed off `isSurpriseRound()`).
- **Scoring** — `addTeamScore`, `awardStandardScore`, and `SCORE_SPEED_THRESHOLDS` (per-game speed-bonus cutoffs). Standard correct answer = 10 pts + speed bonus.

### `js/taif-actor.js` — the presenter
Controls the Taif character: mood/motion/speech, typewriter intro text, and two layouts — **hero** (big, on welcome/select screens) and **dock** (small, during gameplay). Public API used from `script.js`: `setTaifMood`, `setTaifSpeech`, `setTaifLayout`, `setTaifPresenter`, `pickTaifLine`. Has an optional **Lottie** animation mode gated behind `?lottie=1` in the URL; default is static PNGs from `assets/taif/`.

### The two image-based games (recently reworked — read before touching)
- **`spot` (أوجد الفروق)** uses a `photo-overlay` system: a real photo is the base in **both** panels, and SVG shapes are layered over the *modified* panel via `renderSpotCanvases()`. Differences are `{ x, y, r }` fractions (0–1) of the display box; click detection is in `findHitSpotDifference()`. The number of differences is **dynamic** (`puzzle.differences.length`) — do not hardcode a count. Puzzle data + overlay SVGs live in `js/spot-scenes.js`.
- **`picmerge` (تحدي الصور)** is a rebus game: each `PICMERGE_PUZZLES` entry is `{ id, answer, image, aliases }`. Images are `assets/picmerge/NNN.png`, numbered to match the entry id. Answers are matched against `answer` + `aliases`.

### Styling
Single stylesheet `css/style.css` (~2500 lines). Theming is a **CSS custom-property system** under `:root` (`--surface-*`, `--color-accent`, `--space-*` scale). The whole app is **RTL** — remember that in RTL `align-self: flex-start` places an element on the **right**, and use logical properties (`inset-inline-*`, `border-inline-*`) for direction-aware styles. Respect `env(safe-area-inset-*)` already used for PWA/standalone.

## Conventions

- Add user-facing text in **Arabic**.
- New games go in `GAME_REGISTRY` + a matching `<section class="screen game-screen">` in `index.html` + a `gameState.<id>` sub-object.
- Reuse the existing helpers for turns, timers, and scoring (`addTeamScore`, `awardStandardScore`, `getRoundDuration`, the `stopAllGameTimers` pattern) rather than re-implementing.
- When replacing game assets, keep the numbered-filename ↔ data-entry mapping intact (especially picmerge).
- `.claude/`, `.vercel`, and `node_modules/` are gitignored. Commit asset changes alongside the data file that references them.

## Reference docs in repo
- `BUILD_PLAN.md` — original product spec (the 7 games, scope, v1 decisions).
- `TASKS.md` — task breakdown. `AUDIT.md` — a prior review pass.
- `README.md` — deploy/DNS notes (Vercel + Cloudflare for `t.azhub.uk`).
