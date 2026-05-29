# ADR-001: Feature-based folder structure

**Status:** Accepted  
**Date:** 2026-05-27  
**Context:** Phase 1 — production-grade core, week 1 restructuring.

## Decision

Organize `src/app/` into four top-level zones:

| Zone | Responsibility |
|------|----------------|
| `core/` | Singleton app services: guards, HTTP interceptors, global error handling. Imported only from `app.config` or root routes. |
| `shared/` | Reusable UI, pipes, validators with no business logic. May be imported by any feature. |
| `layout/` | Shell components (main layout, auth layout) that wrap `<router-outlet>`. |
| `features/<name>/` | Vertical slices: `data-access/` (NgRx + API) and `pages/` (routed components). |

Auth and todos live under `features/`. Cross-feature imports are allowed only from `data-access` (e.g. todos reducer listens to `logoutUser` from auth).

## Rationale

- **Feature colocation** — login page sits next to auth reducer/effects; fewer context switches when changing auth flow.
- **Clear boundaries** — `core` must not depend on `features`. `shared` must not depend on `features`. Features may depend on `core` and `shared`.
- **Scales with team** — new feature = new folder under `features/`, minimal touch to app shell.
- **Aligns with NgRx style guide** — store/effects/selectors grouped in `data-access/`.

## Consequences

- Import paths are longer until path aliases land (Phase 1.2: `@app/features/auth/*`).
- No barrel `index.ts` in `core/` yet — direct file imports avoid circular deps and tree-shaking issues.
- `layout/` and `shared/ui/` are placeholders until Phase 1.3 (layouts) and toast/spinner work.

## Alternatives considered

- **Flat `auth/` + `todos/` at app root** — worked for Phase 0 but mixes pages and store; harder to enforce boundaries as the app grows.
- **Nx monorepo libraries** — overkill for current scope; may revisit in Phase 16.
