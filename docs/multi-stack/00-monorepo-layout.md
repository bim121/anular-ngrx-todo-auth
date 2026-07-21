# Monorepo layout — multi-stack workspace

Single repo: `anular-ngrx-todo-auth` (npm workspaces).  
Target polyglot MFE architecture: [polyglot-mfe-architecture.md](../../plans/polyglot-mfe-architecture.md).

## Apps

| App | Stack | Path | Route (target) | Status |
|-----|-------|------|----------------|--------|
| **web** (shell) | Angular 21 + Nx | `apps/web/` | layout, auth, router | Phase 4 — Nx app |
| **todos-mfe** | Angular 21 | `libs/todos/*` (in web today) | `/todos/*` | Phase 9 — extract remote |
| **admin-mfe** | Angular 21 | — | `/admin/*` | Phase 9 stub → Phase 14 |
| **marketing-mfe** | React + Vite (→ Next.js 15) | `apps/marketing-mfe/` | `/`, `/pricing`, `/docs` | Phase 1 login stub |
| **analytics-mfe** | Vue 3 + Vite | `apps/analytics-mfe/` | `/analytics` | Phase 1 auth stub |

## Angular libs (Nx)

| Lib | Import | Tags |
|-----|--------|------|
| auth-data-access | `@anular-ngrx/auth-data-access` | `scope:auth`, `type:data-access` |
| auth-feature-login | `@anular-ngrx/auth-feature-login` | `scope:auth`, `type:feature` |
| todos-data-access | `@anular-ngrx/todos-data-access` | `scope:todos`, `type:data-access` |
| todos-feature-list | `@anular-ngrx/todos-feature-list` | `scope:todos`, `type:feature` |
| shared-ui | `@anular-ngrx/shared-ui` | `scope:shared`, `type:ui` |

```bash
nx build web
nx test web
nx run-many -t test --projects=auth-data-access,todos-data-access,todos-feature-list,shared-ui
nx graph
```

Today the Angular **web** shell lives under `apps/web/`. Feature code is in `libs/`. `marketing-mfe` / `analytics-mfe` remain separate workspaces under `apps/`.

## Dev servers & ports

| Service | Port | Command |
|---------|------|---------|
| json-server mock API | **3000** | `npm run api` |
| Angular app (shell/todos) | **4200** | `npm start` or `npm run dev` |
| Angular + API together | 3000 + 4200 | `npm run dev` |
| marketing-mfe (React) | **4300** | `npm run dev:marketing` |
| analytics-mfe (Vue) | **4400** | `npm run dev:analytics` |

## Shared config

| File | Purpose |
|------|---------|
| [`tsconfig.base.json`](../../tsconfig.base.json) | Strict TypeScript defaults for all apps |
| [`libs/shared/validators/email.ts`](../../libs/shared/validators/email.ts) | `isValidEmail` — Angular + Vue |
| [`libs/shared/api-types/src/login.dto.ts`](../../libs/shared/api-types/src/login.dto.ts) | Shared `LoginDto` |
| [`contracts/openapi.yaml`](../../../contracts/openapi.yaml) | Shared API contract (workspace `ngrx/`) |
| [`db.json`](../../db.json) | Mock database for json-server |

## Typecheck

```bash
npm run typecheck
```

Runs `tsc -b` for the Angular app and `tsc --noEmit` for `marketing-mfe` and `analytics-mfe`.

## Related docs

- [multi-stack-roadmap.md](../../plans/multi-stack-roadmap.md) — phase matrix per stack
- [polyglot-mfe-architecture.md](../../plans/polyglot-mfe-architecture.md) — 4 remotes + shell (Phase 9)
- [integration-map.md](../../plans/integration-map.md) — frontend ↔ backend flags
