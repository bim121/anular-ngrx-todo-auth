# Bundle audit — Phase 5.3

**Date:** 2026-07-28  
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
| **Initial total** | **468.73 kB** | **131.34 kB** |
| Lazy todos feature (`index`) | 52.51 kB | 13.13 kB |
| Lazy auth feature (`index`) | 11.36 kB | 2.74 kB |
| `main-layout-component` | 9.01 kB | 2.75 kB |
| `auth-layout-component` | 1.54 kB | 0.71 kB |
| route entry chunks | &lt; 1 kB each | — |

**Bailout note:** `ngrx-store-localstorage` pulls CommonJS `deepmerge` (Angular build warning). Candidate for later replacement / `allowedCommonJsDependencies`.

---

## 5.3.2 Budgets (`apps/web/project.json`)

| Type | Warning | Error |
|------|---------|-------|
| `initial` | **350 kB** | **500 kB** |
| `anyComponentStyle` | **2 kB** | **4 kB** |

Current build status:

| Check | Result |
|-------|--------|
| Initial vs 350 kB warn | **Warn** — 468.73 kB (over by 118.73 kB) |
| Initial vs 500 kB error | **Pass** |
| `main-layout.component.css` | **Warn** — 2.82 kB |
| `register.component.css` | **Warn** — 2.23 kB |

Budgets are intentionally tight so CI/local builds surface debt without failing the error ceiling yet.

---

## 5.3.3 Lazy routes audit

Entry: `apps/web/src/app/app.routes.ts`

| Route group | Load | Chunk name (prod) |
|-------------|------|-------------------|
| Todos shell | `loadChildren` → `todos.routes` | `todos-routes` |
| Auth shell | `loadChildren` → `auth.routes` | `auth-routes` |
| Main layout | `loadComponent` | `main-layout-component` |
| Auth layout | `loadComponent` | `auth-layout-component` |
| `/todos` page | `loadComponent` → `@anular-ngrx/todos-feature-list` | lazy `index` (~52 kB) |
| `/profile` | `loadComponent` → auth-feature-login | (auth feature chunk) |
| `/login`, `/register` | `loadComponent` → auth-feature-login | lazy `index` (~11 kB) |
| Stats panel | `@defer` lazy component | `todo-stats-panel-component` (101 B stub) |

**Findings**

- Features are separate lazy chunks — good.
- `@angular/core` / shared framework code stays in **initial** chunks (expected); feature libs do not re-bundle a second copy of `@angular/core` in lazy outputs (esbuild shared chunks).
- Todos feature is the largest lazy payload (~52 kB raw) — includes CDK scrolling after Phase 5.2.

---

## 5.3.4 RxJS imports

### Codebase audit

- No `import * as … from 'rxjs'`
- No `rxjs/Rx` / `rxjs/internal`
- Operators use **named imports from `'rxjs'`** (RxJS 7+ tree-shakeable).  
  Plan’s older `rxjs/operators` style is **not** required on RxJS 7+; named `rxjs` imports are preferred.

### ESLint

Enforced without type-aware lint (flat config + Nx):

| Mechanism | What it bans |
|-----------|----------------|
| `no-restricted-imports` | `rxjs/Rx`, `rxjs/internal`, `rxjs/internal/*` |

`eslint-plugin-rxjs` is installed for optional local use (`rxjs/no-subject-unsubscribe`, etc.), but its rules need `parserOptions.project` / type-aware ESLint. Enabling them repo-wide is deferred so `nx lint` stays green; the import bans + code audit cover Phase 5.3.4 intent.

Manual checks done: no `Subject.unsubscribe()` anti-patterns spotted in app effects (NgRx `createEffect` + operators).

---

## Follow-ups (not in 5.3 scope)

1. Cut initial toward **&lt; 350 kB** (localStorage sync / deepmerge, unused polyfills, stricter sideEffects).
2. Trim `main-layout` / `register` CSS under 2 kB warn.
3. Re-run `npm run analyze` after each bundle win; refresh this doc.
