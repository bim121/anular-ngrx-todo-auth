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
- [ ] HTTP cache + dedup
- [ ] Lighthouse CI
- [ ] Memory leak audit doc

### React/Next.js (marketing-mfe)

- [ ] `@tanstack/react-virtual` — 1000 todos smooth scroll
- [ ] React Profiler doc `docs/react/perf-profiling.md`
- [ ] `React.memo` on todo row — measure before/after
- [ ] Bundle analyze marketing-mfe chunk sizes
- [ ] Lighthouse run на todo list route (если доступен)

### Vue 3 (analytics-mfe)

- [ ] `v-memo` on todo rows в списке
- [ ] Chart.js/ECharts — stats widget (mock `/todos/stats`)
- [ ] analytics-mfe: first chart on `/analytics` dashboard route
- [ ] Perf baseline doc для Vue list render
- [ ] Vitest perf smoke: render 1000 items < threshold

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
ng build --configuration production --stats-json
npx esbuild-visualizer --metadata dist/.../stats.json
```

### 5.3.2 angular.json budgets

```json
"budgets": [
  { "type": "initial", "maximumWarning": "350kb", "maximumError": "500kb" },
  { "type": "anyComponentStyle", "maximumWarning": "2kb", "maximumError": "4kb" }
]
```

### 5.3.3 Lazy routes audit

- Каждый feature — отдельный chunk.
- Shared libs не дублируют `@angular/core`.

### 5.3.4 RxJS imports

- Только path imports: `import { map } from 'rxjs/operators'`.
- ESLint rule `rxjs/no-subject-unsubscribe` etc.

---

## Неделя 4 — Memoization

### 5.4.1 Parametric selectors

```typescript
export const selectFilteredTodos = (filter: Filter) =>
  createSelector(selectAllTodos, (todos) => applyFilter(todos, filter));
```

Использовать с `store.select(selectFilteredTodos(filter))` — memo per filter.

### 5.4.2 Не дублировать с computed

Правило в `docs/memoization.md`:
- Server state → NgRx selectors.
- UI-only derived → `computed()` from `toSignal`.

### 5.4.3 shareReplay audit

Grep `shareReplay` — каждое использование обосновать (refCount: true).

### 5.4.4 Pure pipes vs signals

| Use case | Choice |
|----------|--------|
| Expensive transform in template | computed signal |
| Rarely changing display | pure pipe |

---

## Неделя 5 — Network

### 5.5.1 HTTP cache interceptor

```typescript
const cache = new Map<string, { data: unknown; expiry: number }>();
// GET todos — TTL 30s
// Invalidate on add/update/delete actions via service
```

### 5.5.2 Stale-while-revalidate

Facade: показать cached todos immediately, фоновый refresh.

### 5.5.3 Request deduplication

Если 2 компонента dispatch `loadTodos` одновременно — один inflight (effect `exhaustMap` уже помогает; добавить shared `inFlight$` если нужно).

---

## Неделя 6 — Web Vitals CI & memory

### 5.6.1 Lighthouse CI

**Файл:** `.github/workflows/lighthouse.yml`

```yaml
- run: npm run build
- uses: treosh/lighthouse-ci-action
  with:
    urls: |
      http://localhost:4000/login
    budgetPath: ./lighthouserc.json
```

### 5.6.2 Hydration

- SSR build: проверить mismatch warnings.
- Event replay — measure duplicate handlers.

### 5.6.3 Memory audit

1. Chrome heap snapshot before.
2. Navigate login → todos 100x.
3. Snapshot after — compare detached nodes.
4. Fix: `takeUntilDestroyed` in any remaining subscriptions.

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

- [ ] Lighthouse Performance score ≥ 90
- [ ] Virtual scroll smooth with 1000 items
- [ ] CI fails if budget exceeded
- [ ] No leak growth > 5MB after 100 navigations

---

## Product features

### PF-2.1 Client search (V2)

- [ ] Signal `searchQuery` + debounced `computed` filter
- [ ] Highlight matches in task text

### PF-6.1 Stats dashboard (V6)

- [ ] Memoized selector `selectWeeklyCompletionStats`
- [ ] Simple bar chart component (prepare Phase 6 DS)
- [ ] **Vue analytics:** Chart.js spike в `analytics-mfe` — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md) Phase 5; MFE интеграция в [Phase 9](./phase-09-microfrontends.md)

### PF-5.1 Export CSV (V5)

- [ ] `exportTodos()` — Blob download, perf test on 1000 items

### PF-1.1 WebSocket full (V1)

- [ ] Завершить real-time после virtual scroll baseline

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

### R.5.2 — React.memo on TodoRow

```tsx
export const TodoRow = React.memo(function TodoRow({ todo, onToggle }: Props) {
  // ...
});
```

**Документ:** `docs/react/perf-profiling.md` — Profiler screenshots before/after memo.

**Проверка:** toggle one item — только 1 row re-render (React DevTools highlight).

### R.5.3 — Bundle baseline

```bash
npm run build --workspace=marketing-mfe
# analyze if Next/webpack stats available
```

Записать KB в `docs/perf-budget.md` секция React.

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

### V.5.2 — Chart spike (dashboard route)

```bash
npm install chart.js vue-chartjs --workspace=analytics-mfe
```

**Файл:** `apps/analytics-mfe/src/features/dashboard/StatsChart.vue`

```typescript
// fetch mock GET /todos/stats or compute client-side from todos
const chartData = computed(() => ({
  labels: ['Mon', 'Tue', ...],
  datasets: [{ data: weeklyCounts }],
}));
```

**Route:** `/analytics` — grid layout placeholder (full layout Phase 6).

**Проверка:** chart renders with mock data; no layout shift (CLS).

### V.5.3 — Dashboard perf checklist

| Метрика | Target |
|---------|--------|
| List 1000 todos scroll | smooth |
| Chart first paint | < 500ms |
| Memory after 50 navigations | stable |

---

## Следующая фаза

→ [phase-06-design-system.md](./phase-06-design-system.md)


