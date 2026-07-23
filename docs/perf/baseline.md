# Performance baseline (Phase 5.1)

**Date:** 2026-07-23  
**App:** Angular `web` prod build (`dist/web/browser`) + json-server `:3000`  
**Serve:** `npx serve dist/web/browser -l 4173 -s`

---

## What LCP / INP / CLS mean

| Metric | Full name | What it measures | Good target |
|--------|-----------|------------------|-------------|
| **LCP** | Largest Contentful Paint | When the **largest visible content** (hero text, big image, main card) finishes painting. “Is the page useful yet?” | **&lt; 2.5 s** |
| **INP** | Interaction to Next Paint | Delay from a user click/tap/key until the next visual update. “Does the UI feel sticky?” | **&lt; 200 ms** |
| **CLS** | Cumulative Layout Shift | How much the layout **jumps** while loading (images/fonts/async blocks pushing content). “Does stuff move under my finger?” | **&lt; 0.1** |

Notes:

- **Lighthouse navigation** (lab) always reports LCP + CLS. **INP** is mainly a *field* metric; in lab you often see **TBT** (Total Blocking Time) instead as a proxy for main-thread jank.
- Our Lighthouse runs on `/login` and authenticated `/todos` are **mobile** form factor.

---

## Initial JS (prod)

From `npm run build:stats` (2026-07-23):

| | Raw | Estimated transfer |
|--|-----|-------------------|
| **Initial total** | **444.78 kB** | **125.58 kB** |
| Lazy (todos feature index) | 25.77 kB | 6.46 kB |

Artifact: `dist/web/stats.json`

Budget suggestion (Phase 5.3): warn 350 kB / error 500 kB initial — current raw **444 kB** is already near the plan’s error band → room to optimize.

---

## Lighthouse (prod)

### `/login` (no auth)

| | Score | LCP | CLS | TBT | FCP |
|--|------:|-----|-----|-----|-----|
| before | 0.96 | 2.4 s | 0 | 0 ms | 2.0 s |
| after* | 0.95 | 2.5 s | 0 | 10 ms | 2.2 s |

\*Login audit does not depend on todo count; small variance is noise.

Reports: `docs/perf/lh-before-login.report.html`, `lh-after-login.report.html`

### `/todos` (authenticated, DB = 1000 todos)

| Score | LCP | CLS | TBT | FCP |
|------:|-----|-----|-----|-----|
| 0.97 | 2.3 s | 0 | 0 ms | 2.0 s |

Report: `docs/perf/lh-after-todos.report.html`  
**INP:** not emitted in navigation mode (`null`) — use Chrome UX / timespan or manual Profiler for interactions.

---

## Todo list render (Puppeteer)

Script: `node scripts/perf-measure.mjs <label> http://localhost:4173`

| Run | Items | Reload → list ready | API response → DOM | `app-todo-item` count |
|-----|------:|--------------------:|--------------------:|----------------------:|
| **before-small** | 1 | **172 ms** | **114 ms** | 1 |
| **after-1000** | 1000 | **239 ms** | **164 ms** | 1000 |

Target in plan: **&lt; 100 ms** (Profiler “list commit”).  
Current **api→DOM** is already **above 100 ms** even for 1 item (114 ms), and **164 ms** for 1000 — baseline fails the target → virtual scroll / lighter stats panel are justified.

Observation from screenshot `after-1000-todos.png`: stats panel shows **“Computing statistics…”** while 1000 rows render — main-thread work beyond the list itself.

JSON: `before-small-metrics.json`, `after-1000-metrics.json`

---

## Screenshots

| File | Content |
|------|---------|
| `before-small-login.png` | Login form |
| `before-small-todos.png` | 1 todo |
| `before-small-todos-after-scroll.png` | After scroll |
| `after-1000-login.png` | Login |
| `after-1000-todos.png` | 1000 items (+ stats computing) |
| `after-1000-todos-full.png` | Full page (large) |
| `after-1000-todos-after-scroll.png` | After scroll |
| `baseline-profile.png` | Chrome Performance @ `/todos` (user capture) |

---

## Chrome Performance profile (§5.1.3)

Source: [`baseline-profile.png`](./baseline-profile.png) — DevTools Performance on `http://localhost:4200/todos` (~31.4 s recording).

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **INP** | **61 ms** | &lt; 200 ms | Pass |
| **CLS** | **0** | &lt; 0.1 | Pass |
| **LCP** | — (not in this timespan) | &lt; 2.5 s | See Lighthouse |

Summary breakdown (31.36 s wall):

| Category | Time |
|----------|------|
| Rendering | 3 115 ms |
| Painting | 2 169 ms |
| System | 807 ms |
| Scripting | 490 ms |

**Takeaway:** interactions feel fine (INP 61 ms), but **Rendering + Painting ≫ Scripting** — list paint/layout dominates, which matches the case for virtual scroll. Extensions (Redux DevTools, translators, etc.) appear in 3rd-party — prefer a clean profile window for “after” comparisons.

---

## Seed

```bash
npm run seed              # small canonical db
node scripts/seed-many-todos.js 1000   # stress: 1000 todos for user_1
```

Current `db.json` after this session: **1000** todos for `user_1` (+ 1 for `user_2`).

---

## Commands to reproduce

```bash
npm run api                 # :3000
npm run build:stats
npx serve dist/web/browser -l 4173 -s
node scripts/perf-measure.mjs before-small http://localhost:4173
node scripts/seed-many-todos.js 1000
node scripts/perf-measure.mjs after-1000 http://localhost:4173
npx lighthouse http://localhost:4173/login --only-categories=performance --output=html --output-path=docs/perf/lh-login
```
