# Multi-Stack Roadmap — Angular + React/Next + Vue

> **Принцип:** React/Next и Vue — **не отдельный side-track**, а обязательная часть **каждой фазы** `phase-XX.md`.  
> **MFE:** 2× Angular + Next + Vue собираются в [Phase 9](./phase-09-microfrontends.md); подготовка идёт с Phase 0.

| App | Stack | Route | Первая фаза |
|-----|-------|-------|-------------|
| shell, todos-mfe, admin-mfe | Angular 19+ | host, `/todos`, `/admin` | 0 → 9 |
| marketing-mfe | Next.js 15 | `/`, `/pricing`, `/docs` | **1** scaffold → **7** SSR → **9** MFE |
| analytics-mfe | Vue 3 + Vite | `/analytics` | **1** scaffold → **5–6** dashboard → **9** MFE |

**Архитектура MFE:** [polyglot-mfe-architecture.md](./polyglot-mfe-architecture.md)

---

## Как читать фазы

Каждый `phase-XX.md` содержит:

1. **Angular** — основной блок (как раньше)
2. **Стек React/Next.js** — marketing-mfe + React fundamentals
3. **Стек Vue 3** — analytics-mfe + Vue fundamentals

Критерии готовности фазы = **все три стека** (кроме Phase 10 — desktop только Angular).

---

## Сводная матрица

| Фаза | Angular | React/Next (`marketing-mfe`) | Vue 3 (`analytics-mfe`) |
|------|---------|------------------------------|-------------------------|
| 0 | NgRx, json-server | Monorepo slot, strict TS | Monorepo slot, Vite hello |
| 1 | core/features, OpenAPI | Feature folders, ESLint react | Feature folders, Pinia stub |
| 2 | Signals, zoneless | Hooks, reconciliation | ref/reactive/computed |
| 3 | NgRx Entity, optimistic | TanStack Query + Zustand | Pinia CRUD mock |
| 4 | Facades, HttpRepo stub | useTodos composable | useTodos composable |
| 5 | Virtual scroll, Lighthouse | react-virtual, Profiler | v-memo, Chart spike |
| 6 | Design tokens, Kanban | shadcn/ui + tokens | Dashboard layout + tokens |
| 7 | Angular SSR, i18n | **Next App Router, metadata** | Nuxt comparison ADR |
| 8 | env, CSP | next.config, analyze | vite.config, env |
| 9 | 2× Angular MF | Next in shell | Vue federation |
| 10 | Electron | — (doc: Tauri) | — |
| 11 | Playwright, Pact | Vitest + RTL, MSW | Vitest + test-utils |
| 12 | CI/CD, PWA | marketing CI job | analytics CI job |
| 17 | Keycloak Angular | next-auth middleware | keycloak-js guards |
| 13 | HttpTodoRepository | TanStack Query real API | Pinia + real stats API |
| 13g | Apollo Angular | Apollo React | Apollo Vue |
| 14 | admin-mfe tenant | Next middleware tenant | fetch interceptor tenant |
| 15 | manifest blue/green | CDN slot marketing | CDN slot analytics |
| 16 | shell CDN | deploy marketing | deploy analytics |
| 18 | AI Angular UI | Vercel AI SDK spike | optional composable |

---

## Phase 0 — Monorepo foundation (все стеки)

### React/Next
- [ ] `apps/marketing-mfe/package.json` — placeholder in Nx workspace
- [ ] Shared `tsconfig.base.json` strict for all apps
- [ ] `docs/multi-stack/00-monorepo-layout.md`

### Vue
- [ ] `apps/analytics-mfe` — `npm create vue@latest` minimal hello + json-server fetch
- [ ] Pinia + Vue Router installed (empty stores)

---

## Phase 1 — Structure & contract (все стеки)

### React/Next
- [ ] `apps/marketing-mfe/src/features/`, `shared/`, `core/`
- [ ] ESLint `eslint-plugin-react-hooks`
- [ ] Login page stub (client component) — same json-server `/users`

### Vue
- [ ] `src/features/`, `composables/`, `stores/`
- [ ] Login view + Pinia auth stub
- [ ] Shared validators/types from `libs/shared/api-types`

---

## Phase 2 — Modern reactivity (все стеки)

### React/Next
- [ ] Todo list: `useState`, `useEffect`, `useMemo` filtered list
- [ ] `docs/react/reconciliation-and-fiber.md`
- [ ] Rules of hooks — lint enforced
- [ ] Controlled login form

### Vue
- [ ] Todo list: `ref`, `computed`, `watch`
- [ ] `docs/vue/proxy-reactivity-deep-dive.md`
- [ ] `<script setup lang="ts">` login form

---

## Phase 3 — State (все стеки)

### React/Next
- [ ] TanStack Query: `useQuery` getTodos, `useMutation` CRUD
- [ ] Zustand: auth slice (token, userId)
- [ ] Optimistic toggle + rollback

### Vue
- [ ] Pinia `useTodosStore` + `useAuthStore`
- [ ] Optimistic PATCH with rollback
- [ ] Normalized todos in store

---

## Phase 4 — Architecture (все стеки)

### React/Next
- [ ] `useTodos()` composable — repository behind hook
- [ ] `TodoRepository` interface + json impl
- [ ] Feature folder boundaries ADR

### Vue
- [ ] `useTodos()` composable wrapping Pinia + service
- [ ] Same repository interface (shared TS type)

---

## Phase 5 — Performance (все стеки)

### React/Next
- [ ] `@tanstack/react-virtual` 1000 todos
- [ ] React Profiler doc `docs/react/perf-profiling.md`
- [ ] `React.memo` on todo row — measure before/after

### Vue
- [ ] `v-memo` on todo rows
- [ ] **Chart.js/ECharts** — stats widget (mock `/todos/stats`)
- [ ] analytics-mfe: first chart on dashboard route

---

## Phase 6 — Design system (все стеки)

### React/Next
- [ ] shadcn/ui Button, Card, Input in marketing-mfe
- [ ] Import `libs/shared/design-tokens`

### Vue
- [ ] Dashboard layout: sidebar + chart grid
- [ ] Shared tokens CSS variables
- [ ] StatCard, ChartPanel components

---

## Phase 7 — SSR & SEO (все стеки)

### React/Next — **главный SSR-стек**
- [ ] Next 15 App Router full scaffold
- [ ] `/`, `/pricing`, `/docs` — `generateMetadata`, JSON-LD
- [ ] ISR on pricing
- [ ] `/share/:id` public todo page

### Vue
- [ ] ADR-011: Nuxt 3 vs Next for marketing (why Next)
- [ ] Optional 1-day Nuxt spike — same landing page
- [ ] analytics stays SPA (Vite)

---

## Phase 8 — Build (все стеки)

### React/Next
- [ ] `next.config.ts` — env, images, headers
- [ ] CSP allows shell + remote origins
- [ ] `@next/bundle-analyzer`

### Vue
- [ ] Vite `define`, env files
- [ ] Build budget in `vite.config.ts`
- [ ] Federation plugin prep (install only)

---

## Phase 9 — Polyglot MFE

См. [phase-09-microfrontends.md](./phase-09-microfrontends.md) — интеграция всех remotes.

### React/Next
- [ ] marketing-mfe в shell via route proxy / manifest
- [ ] SSR pages работают через CDN path `/`

### Vue
- [ ] analytics-mfe Vite federation live
- [ ] Chart dashboard в shell route `/analytics`

---

## Phase 10 — Electron

### Angular
- [ ] Electron shell wraps web app

### React/Next + Vue
- [ ] Doc: embed `BrowserView` для remotes (optional)
- [ ] Tauri comparison ADR

---

## Phase 11 — Testing

### React/Next
- [ ] Vitest + RTL: marketing pages
- [ ] MSW for API in component tests
- [ ] Playwright: `/` Next SSR content

### Vue
- [ ] Vitest Pinia + `@vue/test-utils`
- [ ] Playwright: `/analytics` Vue remote

---

## Phase 12 — Platform CI

### React/Next
- [ ] `build-test-marketing` job in GitHub Actions
- [ ] Lighthouse CI on marketing routes

### Vue
- [ ] `build-test-analytics` job
- [ ] Bundle size budget gate

---

## Phase 17 — Auth (все стеки одновременно)

| Stack | Library |
|-------|---------|
| Angular shell/remotes | keycloak-angular |
| Next marketing | next-auth Keycloak provider |
| Vue analytics | keycloak-js + router guards |

Shared: realm `todo-app`, `auth:logout` event, `SESSION_CONTRACT`.

---

## Phase 13 — Real API

### React/Next
- [ ] TanStack Query → OpenAPI generated hooks
- [ ] RFC 7807 error toasts

### Vue
- [ ] Pinia actions → real `GET /api/todos/stats`
- [ ] Bearer + tenant interceptors

---

## Phase 13g — GraphQL

Apollo во **всех трёх** стеках + Angular admin-mfe optional path.

---

## Phase 14–16 — Enterprise

- **14:** tenant propagation Next middleware + Vue interceptor + admin-mfe
- **15:** mf-manifest blue/green per remote URL
- **16:** CDN deploy shell + todos + admin + marketing + analytics

---

## Phase 18 — AI

- **Next:** Vercel AI SDK streaming (optional)
- **Vue:** `useAiInsight()` composable (optional)
- **Angular:** primary AI UI in todos-mfe

## Phase 19 — RAG

- Angular RAG chat + citations → backend B-36
- Next: SSE / AI SDK stream to same API

## Phase 20 — Agents & MCP

- HITL confirm UI → B-37
- Doc: MCP in Cursor for FE/backend tools

## Phase 21 — FE AWS

- CloudFront + RUM ↔ B-34 / B-24 Grafana

---

## Phase 11–18

Детальные шаги — в соответствующих `phase-XX.md`, секции **Стек React/Next** и **Стек Vue 3**.

---

## Теория (FAANG depth)

| Стек | Индекс |
|------|--------|
| React/Next | [guides/react-next-faang-theory.md](./guides/react-next-faang-theory.md) |
| Vue | [guides/vue-faang-theory.md](./guides/vue-faang-theory.md) |
| Angular | [guides/README.md](./guides/README.md) |

Запрос: *«Напиши теорию Phase 3 multi-stack»* — наполняет все три guides за фазу.

---

## FAANG-ready (все стеки)

| # | Angular | React/Next | Vue |
|---|---------|------------|-----|
| 1 | NgRx + Facades | TanStack Query + RSC | Pinia + composables |
| 2 | Module Federation | Next SSR prod | Vite federation |
| 3 | Keycloak | next-auth | keycloak-js |
| 4 | OpenAPI + GraphQL | same contract | same contract |
| 5 | System design docs | `docs/system-design/react/` | `docs/system-design/vue/` |
