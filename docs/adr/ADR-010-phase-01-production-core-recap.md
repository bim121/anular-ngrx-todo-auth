# ADR-010: Phase 1 — Production core recap (cheat sheet)

**Status:** Accepted (reference)  
**Date:** 2026-06-15  
**Context:** Quick-return guide for everything implemented in [Phase 1](../../plans/phase-01-production-core.md).  
**Deep dive:** [ADR-001](./ADR-001-feature-based-structure.md)

---

## What Phase 1 gave us

Production-shaped Angular app: feature folders, lazy routing, guards, NgRx auth/todos, HTTP interceptors, global errors, toast, lint/husky, mock API.

---

## Folder map (repeat this layout)

```
src/app/
  core/           # singletons: guards, interceptors, routing helpers, store meta
  shared/         # toast, spinner, form-field, validators — no business logic
  layout/         # main-layout, auth-layout shells
  features/
    auth/data-access/ + pages/
    todos/data-access/ + pages/ + ui/
```

**Path aliases** (`tsconfig.json`): `@app/core/*`, `@app/shared/*`, `@app/features/*`, `@app/layout/*`

---

## Routing & navigation

| Pattern | File |
|---------|------|
| Root routes + lazy children | `src/app/app.routes.ts` |
| Auth routes (login, register) | `features/auth/auth.routes.ts` |
| Todos routes | `features/todos/todos.routes.ts` |
| `canActivate` auth guard | `core/guards/auth.guard.ts` |
| Guest guard (login when logged in) | `core/guards/guest.guard.ts` |
| Custom preload | `core/routing/todos-preload.strategy.ts` |
| Route `data` (title, breadcrumb) | `core/routing/route-page-data.model.ts` |
| Title sync | `core/services/route-page-context.service.ts` |

**Repeat:** lazy `loadComponent`, guard with `inject(Store)` + `map`/`filter`, route `data` for shell chrome.

---

## NgRx features (Phase 1 baseline)

| Feature | Path | Notes |
|---------|------|-------|
| Auth | `features/auth/data-access/` | login/register/logout actions, effects, reducer, selectors |
| Todos | `features/todos/data-access/` | load/add/update/delete; extended in Phase 3 with entity adapter |

**Repeat:** `data-access/` holds actions, reducer, effects, selectors, service — pages only dispatch.

---

## HTTP & errors

| Pattern | File |
|---------|------|
| Bearer from store | `core/interceptors/auth.interceptor.ts` |
| Skip NgRx in global handler | `core/services/global-error.handler.ts` |
| User-facing banner | `core/services/global-error.service.ts`, `shared/ui/global-error-banner/` |
| GET retry (todos load only) | `features/todos/data-access/todo.effects.ts` |

---

## UX primitives

| Pattern | File |
|---------|------|
| Toast (no `alert`) | `shared/ui/toast/toast.service.ts`, `toast-container.component.ts` |
| Loading spinner | `shared/ui/spinner/` + `selectAuthLoading` / `selectTodosLoading` |
| Shared email validator | `libs/shared/validators/email.ts`, `shared/validators/` |

Auth effects call `ToastService` on success/failure.

---

## Mock backend & contracts

| Item | Path |
|------|------|
| json-server + middleware | `server/index.js`, `server/middleware.js` |
| Bearer guard on `/todos` | `server/middleware.js` → `auth` |
| Duplicate email 409 | `rejectDuplicateUserEmail` |
| Seed script | `scripts/seed-db.js` |
| OpenAPI draft | `docs/api-contract.yaml` |

---

## Quality gate

```bash
npm run lint && npm test    # husky pre-commit
```

`angular-eslint` + Karma/Jasmine specs on reducers/effects (expanded in Phase 3).

---

## Intentional gaps (do not assume done)

| Planned in Phase 1 | Actual |
|--------------------|--------|
| ADR-002 reactive vs template forms | **Not written** — app uses Signal Forms (Phase 2) |
| Reactive forms on login | **Skipped** — see `auth-signal-form.schema.ts` |
| `User.roles: string[]` | **Not in model** — deferred to Keycloak phase |
| `contracts/openapi.yaml` at repo root | **`docs/api-contract.yaml`** only |

---

## 30-second “add a new feature” recipe

1. `features/<name>/data-access/` — actions, reducer, effects, selectors, service.
2. `features/<name>/pages/` — routed components.
3. Register reducer/effects in `app.config.ts` (`provideState`, `provideEffects`).
4. Add lazy route in `app.routes.ts` under `MainLayoutComponent`.
5. Guard if needed; toast in effects for user feedback.
