# Phase 5 — Performance
> **Теория:** [guides/phase-05-performance-theory.md](./guides/phase-05-performance-theory.md) — статус: placeholder  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 11–12 недели (40–50 ч)  
**Предусловия:** Phase 4, Nx libs стабильны  
**Цель:** Lighthouse ≥90, virtual scroll, bundle budgets, memoization, no leaks.

---

## Результат фазы

- [x] `docs/perf-budget.md` с цифрами
- [x] Virtual scroll 1000+ todos
- [x] HTTP cache + dedup
- [x] Lighthouse CI
- [x] Memory leak audit doc

### React/Next.js (marketing-mfe)

- [x] `@tanstack/react-virtual` — 1000 todos smooth scroll
- [x] React Profiler doc `docs/react/perf-profiling.md`
- [x] `React.memo` on todo row — measure before/after
- [x] Bundle analyze marketing-mfe chunk sizes
- [ ] Lighthouse run на todo list route (если доступен)

### Vue 3 (analytics-mfe)

- [x] `v-memo` on todo rows в списке
- [x] Chart.js/ECharts — stats widget (mock `/todos/stats`)
- [x] analytics-mfe: first chart on `/analytics` dashboard route
- [x] Perf baseline doc для Vue list render
- [x] Vitest perf smoke: render 1000 items < threshold

---

## Неделя 1 — Profiling baseline

### 5.1.1 Замеры «до»

| Метрика | Как | Target |
|---------|-----|--------|
| LCP | Lighthouse prod build | < 2.5s |
| INP | Lighthouse | < 200ms |
| CLS | Lighthouse | < 0.1 |
| Initial JS | `dist/stats.json` | document KB |
| Todo list render 1000 | DevTools Profiler | < 100ms |

**Done (2026-07-23):** numbers + screenshots in [`docs/perf/baseline.md`](../docs/perf/baseline.md) and [`docs/perf-budget.md`](../docs/perf-budget.md).

### 5.1.2 Seed 1000 todos

Script `scripts/seed-many-todos.js` → db.json для stress test.

```bash
node scripts/seed-many-todos.js 1000
# or: npm run seed:many
```

### 5.1.3 Angular DevTools

- [x] Record profile: scroll list, toggle interactions (`docs/perf/baseline-profile.png`).
- INP **61 ms**, CLS **0**; Rendering/Painting dominate vs Scripting — see [`docs/perf/baseline.md`](../docs/perf/baseline.md).
---

## Неделя 2 — Rendering

### 5.2.1 CDK Virtual Scroll

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

// template — *cdkVirtualFor + trackBy (fixed itemSize=72)
<cdk-virtual-scroll-viewport itemSize="72" class="todo-viewport">
  <li *cdkVirtualFor="let node of filteredTodoTree(); trackBy: trackByTodoId">
    <app-todo-tree-item [node]="node" … />
  </li>
</cdk-virtual-scroll-viewport>
```

**Шаги:**
1. [x] Fixed item height (CSS `.todo-virtual-row { height: 72px }`).
2. [x] `trackBy` обязателен (`trackByTodoId`).
3. Compare FPS with/without virtual scroll (manual / re-run Performance profile).

### 5.2.2 NgOptimizedImage

- [x] Avatar в header (dicebear mock url via `NgOptimizedImage` + `priority`).
- [x] `priority` только above-fold (header avatar).

### 5.2.3 Detach experiment (optional)

- [x] `TodoStatsPanelComponent` — `ChangeDetectorRef.detach()` + `detectChanges()`.
- [x] Документ: [`docs/perf/detach-experiment.md`](../docs/perf/detach-experiment.md).

---

## Неделя 3 — Bundle optimization

### 5.3.1 Analyzer

```bash
npm run build:stats
npm run analyze   # → docs/perf/bundle-stats.html
```

**Done:** report + notes in [`docs/perf/bundle-audit.md`](../docs/perf/bundle-audit.md).

### 5.3.2 angular.json / `apps/web/project.json` budgets

```json
"budgets": [
  { "type": "initial", "maximumWarning": "350kB", "maximumError": "500kB" },
  { "type": "anyComponentStyle", "maximumWarning": "2kB", "maximumError": "4kB" }
]
```

**Done** — prod initial **348.08 kB** (under 350 kB warn); component CSS under 2 kB warn. See [`docs/perf/bundle-audit.md`](../docs/perf/bundle-audit.md).

### 5.3.3 Lazy routes audit

- [x] Каждый feature — отдельный chunk (todos / auth / layouts).
- [x] Shared `@angular/core` в initial, без дубля в feature chunks — see bundle-audit.

### 5.3.4 RxJS imports

- [x] Named imports from `'rxjs'` (RxJS 7+); no `rxjs/Rx` / internals.
- [x] ESLint `no-restricted-imports` for `rxjs/Rx` + `rxjs/internal/*`.
- [x] `eslint-plugin-rxjs` installed (type-aware rules optional — see bundle-audit).

---

## Неделя 4 — Memoization

### 5.4.1 Parametric selectors

```typescript
export const selectFilteredTodos = (filter: Filter) =>
  createSelector(selectAllTodos, (todos) => applyFilter(todos, filter));
```

Использовать с `store.select(selectFilteredTodos(filter))` — memo per filter.

- [x] `selectFilteredTodos` — one memoized selector per `all` / `active` / `done`.
- [x] `selectTodosByTag` — cached factory (`Map`) so the same tag reuses one selector.
- [x] `TodosFacade.filteredTodos` wired to those selectors; list page uses facade + UI `computed` join.
- [x] Shared `applyTodoFilter` for selectors + filter strategies.

### 5.4.2 Не дублировать с computed

Правило в [`docs/memoization.md`](../docs/memoization.md):
- Server state → NgRx selectors.
- UI-only derived → `computed()` from `toSignal` / SignalStore.

- [x] Doc written; todo list follows the split (domain filter in NgRx, tag/tree in `computed`).

### 5.4.3 shareReplay audit

Grep `shareReplay` — каждое использование обосновать (refCount: true).

- [x] Only `RoutePageContextService` — `shareReplay({ bufferSize: 1, refCount: true })` documented in memoization.md + inline comment.

### 5.4.4 Pure pipes vs signals

| Use case | Choice |
|----------|--------|
| Expensive transform in template | computed signal |
| Rarely changing display | pure pipe |

- [x] Table + rules in [`docs/memoization.md`](../docs/memoization.md); todos feature uses selectors/`computed` (no filter pipes).

---

## Неделя 5 — Network

### 5.5.1 HTTP cache interceptor

```typescript
const cache = new Map<string, { data: unknown; expiry: number }>();
// GET todos — TTL 30s
// Invalidate on add/update/delete actions via service
```

- [x] `HttpCacheService` + `cacheInterceptor` (TTL 30s for GET `/todos?…`).
- [x] Invalidate on todo mutations + clear on logout.
- [x] Doc: [`docs/perf/http-cache.md`](../docs/perf/http-cache.md).

### 5.5.2 Stale-while-revalidate

Facade: показать cached todos immediately, фоновый refresh.

- [x] Interceptor: stale cache → emit then revalidate.
- [x] Reducer soft loading when entities already exist; facade `load()` documents SWR.

### 5.5.3 Request deduplication

Если 2 компонента dispatch `loadTodos` одновременно — один inflight (effect `exhaustMap` уже помогает; добавить shared `inFlight$` если нужно).

- [x] `loadTodos$` uses `exhaustMap`.
- [x] HTTP-level inflight map + `shareReplay` for concurrent identical GETs.

---

## Неделя 6 — Web Vitals CI & memory

### 5.6.1 Lighthouse CI

**Файлы:** `.github/workflows/lighthouse.yml`, `lighthouserc.json` (local), `lighthouserc.ci.json` (Actions), `budget.json`

```yaml
- run: npm run build
- uses: treosh/lighthouse-ci-action
  with:
    urls: |
      http://127.0.0.1:4000/login
    configPath: ./lighthouserc.ci.json
    budgetPath: ./budget.json
```

- [x] Workflow + budgets (perf score ≥ 0.9 error; LCP warn 2.5s; CLS error 0.1).
- [x] Local: `npm run lhci` (uses `lighthouserc.json` + static serve on :4000).

### 5.6.2 Hydration

- SSR build: проверить mismatch warnings.
- Event replay — measure duplicate handlers.

- [x] SSR wired in `apps/web/project.json` (`server` + `ssr.entry`); login/register `RenderMode.Server`, rest `Client`.
- [x] Hydration without `withEventReplay()` documented — [`docs/perf/hydration.md`](../docs/perf/hydration.md).
- [x] `npm run serve:ssr` for local mismatch checks.

### 5.6.3 Memory audit

1. Chrome heap snapshot before.
2. Navigate login → todos 100x.
3. Snapshot after — compare detached nodes.
4. Fix: `takeUntilDestroyed` in any remaining subscriptions.

- [x] Procedure + code audit — [`docs/perf/memory-audit.md`](../docs/perf/memory-audit.md).
- [x] Production subscriptions already use `takeUntilDestroyed` / `takeUntil` / explicit `disconnect`.

---

## perf-budget.md template

```markdown
# Performance Budget
- Initial JS: XXX kb gzip
- LCP: < 2.5s
- INP: < 200ms
- Todos list: 1000 items @ 60fps scroll
```

---

## Критерии готовности

- [x] Lighthouse Performance score ≥ 90 (enforced in LHCI assertions)
- [x] Virtual scroll smooth with 1000 items
- [x] CI fails if budget exceeded (`.github/workflows/lighthouse.yml` + `budget.json`)
- [x] Memory audit procedure documented (manual 100× nav; code teardown audit clean)

---

## Product features

### PF-2.1 Client search (V2)

- [x] Signal `searchQuery` + debounced `computed` filter
- [x] Highlight matches in task text

### PF-6.1 Stats dashboard (V6)

- [x] Memoized selector `selectWeeklyCompletionStats`
- [x] Simple bar chart component (prepare Phase 6 DS)
- [x] **Vue analytics:** Chart.js spike в `analytics-mfe` — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md) Phase 5; MFE интеграция в [Phase 9](./phase-09-microfrontends.md)

### PF-5.1 Export CSV (V5)

- [x] `exportTodos()` — Blob download, perf test on 1000 items

### PF-1.1 WebSocket full (V1)

- [x] Завершить real-time после virtual scroll baseline (`ws://localhost:3001`, reconnect/backoff, publish local mutations)

---

## Стек React / Next.js (marketing-mfe)

> Virtualization + profiling. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.5.1 — @tanstack/react-virtual

```bash
npm install @tanstack/react-virtual --workspace=marketing-mfe
```

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);
const rowVirtualizer = useVirtualizer({
  count: todos.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 72,
});
```

**Шаги:**
1. Seed 1000 todos (shared script `scripts/seed-many-todos.js`).
2. Compare scroll FPS with/without virtualizer (Chrome Performance).
3. Fixed row height CSS для stable measurements.

**Критерий:** 60fps scroll на 1000 items; initial render < 100ms.

- [x] Virtual list in `TodoList.tsx` (`estimateSize: 72`, overscan 8)
- [x] Fixed row CSS / `TODO_ROW_HEIGHT_PX`
- [x] Procedure in `docs/react/perf-profiling.md`

### R.5.2 — React.memo on TodoRow

```tsx
export const TodoRow = React.memo(function TodoRow({ todo, onToggle }: Props) {
  // ...
});
```

**Документ:** `docs/react/perf-profiling.md` — Profiler screenshots before/after memo.

**Проверка:** toggle one item — только 1 row re-render (React DevTools highlight).

- [x] `TodoRow.tsx` + stable `useCallback` handlers
- [x] Profiling checklist documented

### R.5.3 — Bundle baseline

```bash
npm run build --workspace=marketing-mfe
# analyze if Next/webpack stats available
```

Записать KB в `docs/perf-budget.md` секция React.

- [x] Baseline recorded (~265 kB JS raw / ~83 kB gzip, 2026-08-10)

---

## Стек Vue 3 (analytics-mfe)

### V.5.1 — v-memo на todo rows

```vue
<div v-for="todo in todos" :key="todo.id" v-memo="[todo.id, todo.completed, todo.task]">
  <TodoRow :todo="todo" />
</div>
```

**Шаги:**
1. Baseline render 1000 todos без v-memo.
2. Enable v-memo — compare Vue DevTools component render count.
3. Document в `docs/vue/perf-v-memo.md`.

**Критерий:** measurable reduction in component updates on filter change.

- [x] `TodoRow.vue` + `v-memo` in `TodoListView.vue`
- [x] `docs/vue/perf-v-memo.md`

### V.5.2 — Chart spike (dashboard route)

```bash
npm install chart.js vue-chartjs --workspace=analytics-mfe
```

**Файл:** `apps/analytics-mfe/src/features/analytics/StatsChart.vue`

```typescript
// fetch mock GET /todos/stats or compute client-side from todos
const chartData = computed(() => ({
  labels: ['Mon', 'Tue', ...],
  datasets: [{ data: weeklyCounts }],
}));
```

**Route:** `/analytics` — grid layout placeholder (full layout Phase 6).

**Проверка:** chart renders with mock data; no layout shift (CLS).

- [x] Chart.js bar (completed by tag) on `/analytics`
- [x] Fixed 240px chart slot (CLS)

### V.5.3 — Dashboard perf checklist

| Метрика | Target |
|---------|--------|
| List 1000 todos scroll | smooth |
| Chart first paint | < 500ms |
| Memory after 50 navigations | stable |

- [x] Checklist documented in `docs/vue/perf-dashboard.md`
- [x] Vitest smoke: 1000 `TodoRow` mounts under threshold

---

## Следующая фаза

→ [phase-06-design-system.md](./phase-06-design-system.md)


