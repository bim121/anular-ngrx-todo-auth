# Phase 11 — Testing & quality at scale

> **Теория:** [guides/phase-11-testing-quality-theory.md](./guides/phase-11-testing-quality-theory.md) — статус: placeholder  
> **Pact provider:** [`../todo-platform-backend`](../todo-platform-backend) (optional until B-02 ready)  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 24–25 недели (40–50 ч)  
**Предусловия:** Phase 10 (или Phase 8 if Electron skipped)  
**Цель:** Test pyramid, Playwright E2E, a11y CI, contract tests foundation.

---

## Результат фазы

- [ ] 80%+ coverage data-access libs
- [ ] Playwright suite: auth + todos + SSR smoke
- [ ] axe in CI
- [ ] Pact consumer tests
- [ ] PR gate: lint + unit + e2e

### React/Next.js (marketing-mfe)

- [ ] Vitest + `@testing-library/react` — login page, pricing metadata helper
- [ ] MSW — mock json-server / API в unit tests
- [ ] Coverage target: `features/` ≥ 70%

### Vue 3 (analytics-mfe)

- [ ] Vitest + `@vue/test-utils` — dashboard components, Pinia stores
- [ ] MSW или `vi.mock` для fetch composables
- [ ] Coverage target: stores + composables ≥ 80%

### Polyglot E2E (все стеки)

- [ ] Playwright: shell → marketing `/`, analytics `/analytics`, todos CRUD
- [ ] Logout propagates across remotes

---

## Неделя 1 — Unit & integration

### 11.1.1 Coverage targets

| Lib | Target |
|-----|--------|
| auth/data-access | 90% reducers/selectors/effects |
| todos/data-access | 90% |
| shared/ui | 70% components |

```bash
nx test auth-data-access --coverage
```

### 11.1.2 Component integration tests

```typescript
await TestBed.configureTestingModule({
  imports: [TodoListPageComponent],
  providers: [
    provideMockStore({ initialState: { todos: { ids: [], entities: {} } } }),
    { provide: TodosFacade, useClass: MockTodosFacade },
  ],
});
```

### 11.1.3 HttpTestingController

Repository tests without real HTTP.

---

## Неделя 2 — Playwright E2E

### 11.2.1 Setup

```bash
npm init playwright@latest
```

**Файл:** `e2e/playwright.config.ts` — baseURL localhost:4200.

### 11.2.2 Specs

| Spec | Steps |
|------|-------|
| `auth.spec.ts` | login valid/invalid, register, logout |
| `todos.spec.ts` | CRUD, filter, optimistic toggle |
| `ssr.spec.ts` | request HTML, assert meta title present |
| `a11y.spec.ts` | axe scan login + todos |

### 11.2.3 CI services

```yaml
services:
  json-server:
    image: node
    run: npm run api
```

Or mock API with Playwright `route.fulfill`.

### 11.2.4 Visual regression (optional)

`expect(page).toHaveScreenshot()` for login page.

---

## Неделя 3 — Advanced testing

### 11.3.1 Mutation testing (optional)

```bash
npx stryker run
```

Target: `auth.reducer.ts`, `todo.reducer.ts`.

### 11.3.2 Performance E2E

Playwright trace + measure navigation timing budget.

### 11.3.3 Polyglot MFE E2E

- [ ] Shell → todos-mfe (Angular)
- [ ] Shell → admin-mfe stub (Angular)
- [ ] Shell → `/` marketing-mfe (Next SSR content)
- [ ] Shell → `/analytics` analytics-mfe (Vue chart)
- [ ] Logout clears session in all remotes

См. [polyglot-mfe-architecture.md](./polyglot-mfe-architecture.md).

---

## Неделя 4 — Contract testing

### 11.4.1 Pact

```bash
npm i -D @pact-foundation/pact
```

Consumer test: `TodoRepository.getAll` expects GET `/todos?userId=`.

**Provider:** [`../todo-platform-backend`](../todo-platform-backend) running locally or CI (optional until B-02).  
Provider URL: `http://localhost:5000` (ASP.NET) or mock provider in CI if backend not ready.

### 11.4.2 Sync with OpenAPI

Script validates Pact matches [`../../contracts/openapi.yaml`](../../contracts/openapi.yaml) subset.

### 11.4.3 CI

```bash
nx run todos-data-access:pact
```

Fails PR if provider contract breaks (mock provider in CI).

---

## Неделя 5 — Quality gates

### 11.5.1 GitHub Actions

```yaml
jobs:
  quality:
    steps:
      - run: nx affected -t lint test
      - run: npx playwright test
      - run: npm run lighthouse (from Phase 5)
```

### 11.5.2 Branch protection

Require: lint, unit, e2e.

### 11.5.3 Test documentation

**Файл:** `docs/testing-strategy.md` — pyramid diagram.

---

## Критерии готовности

- [ ] All CI jobs green on main
- [ ] E2E runs < 5 min
- [ ] No critical a11y violations
- [ ] Pact publishes pact file artifact

---

## Стек React / Next.js (marketing-mfe)

> Vitest + RTL + MSW — стандарт для Next client components. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.11.1 — Vitest + Testing Library

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom --workspace=marketing-mfe
```

**Файлы:**
- `apps/marketing-mfe/vitest.config.ts`
- `src/features/auth/login-page.test.tsx`

**Шаги:**
1. Render login form — assert validation errors.
2. Mock `fetch` или MSW handler `POST /users`.
3. `nx test marketing-mfe --coverage`.

**Проверка:** ≥ 3 unit tests green.

### R.11.2 — MSW setup

**Файл:** `apps/marketing-mfe/src/mocks/handlers.ts`

```typescript
http.post('http://localhost:3000/users', () => HttpResponse.json({ id: '1' }))
```

**Шаги:**
1. `setupServer` in `vitest.setup.ts`.
2. Test pricing page metadata helper без Next server.
3. CI: `nx test marketing-mfe` в quality job.

**Критерий:** MSW isolates tests from json-server.

---

## Стек Vue 3 (analytics-mfe)

### V.11.1 — Vitest + vue-test-utils

```bash
npm i -D vitest @vue/test-utils happy-dom --workspace=analytics-mfe
```

**Шаги:**
1. `stores/auth.spec.ts` — login/logout actions.
2. `DashboardChart.spec.ts` — mount + assert props.
3. Pinia testing: `createTestingPinia()`.

**Проверка:** `nx test analytics-mfe --coverage` ≥ 80% stores.

### V.11.2 — Composable tests

**Файл:** `composables/useWeeklyStats.spec.ts`

**Шаги:**
1. Mock `fetch` with deterministic stats JSON.
2. Test loading/error states.
3. Integrate in CI matrix alongside Angular tests.

---

## Polyglot E2E (все remotes)

### P.11.1 — Playwright polyglot suite

**Файл:** `e2e/polyglot-mfe.spec.ts`

| Step | Assert |
|------|--------|
| Login shell | redirect `/todos` |
| Navigate `/` | Next marketing H1 visible |
| Navigate `/analytics` | Vue chart canvas |
| Navigate `/admin` | Angular admin stub |
| Logout | all routes require auth |

**Критерий:** E2E < 5 min; runs in CI after `nx build` all MFEs.

---

## Следующая фаза

→ [phase-12-frontend-platform.md](./phase-12-frontend-platform.md)
