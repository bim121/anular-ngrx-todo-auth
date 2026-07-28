# Bundle audit — Phase 5.3

**Date:** 2026-07-28 (optimized pass)  
**Build:** `npm run build:stats` → `dist/web/stats.json`  
**Visualizer:** [`bundle-stats.html`](./bundle-stats.html) (`npx esbuild-visualizer`)

---

## 5.3.1 Analyzer

```bash
npm run build:stats
npm run analyze   # writes docs/perf/bundle-stats.html
```

Open `docs/perf/bundle-stats.html` in a browser for the treemap.

### Prod sizes (this run)

| | Raw | Transfer (est.) |
|--|-----|-----------------|
| **Initial total** | **348.08 kB** | **99.47 kB** |
| Lazy todos feature (`index`) | 52.56 kB | 13.13 kB |
| Lazy auth feature (`index`) | 46.56 kB | 12.05 kB |
| Shared forms chunk (lazy) | 31.10 kB | 7.20 kB |
| Todos route providers chunk | 11.02 kB | 3.07 kB |
| `main-layout-component` | 8.10 kB | 2.58 kB |
| `todos-routes` | 3.46 kB | 1.34 kB |
| `auth-layout-component` | 1.54 kB | 0.71 kB |

**Baseline (pre-cut):** initial **468.73 kB** → **348.08 kB** (−120.65 kB).

---

## 5.3.2 Budgets (`apps/web/project.json`)

| Type | Warning | Error |
|------|---------|-------|
| `initial` | **350 kB** | **500 kB** |
| `anyComponentStyle` | **2 kB** | **4 kB** |

Current build status:

| Check | Result |
|-------|--------|
| Initial vs 350 kB warn | **Pass** — 348.08 kB |
| Initial vs 500 kB error | **Pass** |
| `anyComponentStyle` | **Pass** (main-layout + register under 2 kB) |

---

## Cuts applied (follow-up to first audit)

1. **Keep `@angular/forms` off initial** — `form-field` / auth signal schemas off shared barrels; deep imports on login/register only.
2. **Drop prod StoreDevtools** — `devtools.providers.ts` + `.prod.ts` via `fileReplacements`.
3. **Skip `withEventReplay()`** — hydration without event-replay (~10 kB).
4. **Replace `ngrx-store-localstorage`** — lightweight `localStorageSyncReducer` (no `deepmerge`).
5. **Replace `uuid`** — `crypto.randomUUID()`.
6. **Lazy NgRx feature registration** — todos/comments/notifications/realtime `provideState` + `provideEffects` on `TODOS_ROUTES` (moves `@ngrx/entity` + repos/effects out of initial).
7. **Trim CSS** — `main-layout` / `register` under 2 kB warn.

Initial composition (approx.): `@angular/core` ~150 kB, `router` ~73 kB, `common` ~34 kB, `rxjs` ~28 kB, NgRx store/effects/router-store ~23 kB, auth + app shell remainder.

---

## 5.3.3 Lazy routes audit

Entry: `apps/web/src/app/app.routes.ts`

| Route group | Load | Chunk name (prod) |
|-------------|------|-------------------|
| Todos shell | `loadChildren` → `todos.routes` (+ feature providers) | `todos-routes` + provider chunk |
| Auth shell | `loadChildren` → `auth.routes` | `auth-routes` |
| Main layout | `loadComponent` | `main-layout-component` |
| Auth layout | `loadComponent` | `auth-layout-component` |
| `/todos` page | `loadComponent` → `@anular-ngrx/todos-feature-list` | lazy `index` (~53 kB) |
| `/profile` | `loadComponent` → auth-feature-login | (auth feature chunk) |
| `/login`, `/register` | `loadComponent` → auth-feature-login | lazy `index` (~47 kB, includes forms) |
| Stats panel | `@defer` lazy component | `todo-stats-panel-component` (101 B stub) |

**Findings**

- Features are separate lazy chunks — good.
- `@angular/forms` lives in **lazy** auth/todos UI chunks, not initial.
- Todos feature still largest page payload (~53 kB) — CDK scrolling (Phase 5.2).

---

## 5.3.4 RxJS imports

### Codebase audit

- No `import * as … from 'rxjs'`
- No `rxjs/Rx` / `rxjs/internal`
- Operators use **named imports from `'rxjs'`** (RxJS 7+ tree-shakeable).

### ESLint

| Mechanism | What it bans |
|-----------|----------------|
| `no-restricted-imports` | `rxjs/Rx`, `rxjs/internal`, `rxjs/internal/*` |

`eslint-plugin-rxjs` is installed for optional local use; type-aware rules deferred so `nx lint` stays green.

---

## Follow-ups (later weeks)

1. Memoization / parametric selectors (5.4).
2. HTTP cache interceptor (5.5).
3. Re-run `npm run analyze` after further cuts; refresh this doc.
