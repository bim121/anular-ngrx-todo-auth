# Phase 11 — Testing & quality at scale

> **Теория:** [guides/phase-11-testing-quality-theory.md](./guides/phase-11-testing-quality-theory.md) — статус: placeholder  
> **Pact provider:** [`../todo-platform-backend`](../todo-platform-backend) (optional until B-02 ready)

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

### 11.3.3 MFE E2E

Shell loads remote — assert todo list from remote chunk.

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

## Следующая фаза

→ [phase-12-frontend-platform.md](./phase-12-frontend-platform.md)
