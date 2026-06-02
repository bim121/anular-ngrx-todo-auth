# Phase 5 — Performance
> **Теория:** [guides/phase-05-performance-theory.md](./guides/phase-05-performance-theory.md) — статус: placeholder


**Длительность:** 11–12 недели (40–50 ч)  
**Предусловия:** Phase 4, Nx libs стабильны  
**Цель:** Lighthouse ≥90, virtual scroll, bundle budgets, memoization, no leaks.

---

## Результат фазы

- [ ] `docs/perf-budget.md` с цифрами
- [ ] Virtual scroll 1000+ todos
- [ ] HTTP cache + dedup
- [ ] Lighthouse CI
- [ ] Memory leak audit doc

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

### 5.1.2 Seed 1000 todos

Script `scripts/seed-many-todos.js` → db.json для stress test.

### 5.1.3 Angular DevTools

- Record profile: scroll list, toggle 10 items.
- Export screenshot → `docs/perf/baseline-profile.png`.

---

## Неделя 2 — Rendering

### 5.2.1 CDK Virtual Scroll

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

// template
<cdk-virtual-scroll-viewport itemSize="72" class="viewport">
  @for (todo of todos(); track todo.id) {
    <app-todo-item *cdkVirtualFor="todo; trackBy: trackById" />
  }
</cdk-virtual-scroll-viewport>
```

**Шаги:**
1. Fixed item height (CSS).
2. `trackBy` обязателен.
3. Compare FPS with/without virtual scroll.

### 5.2.2 NgOptimizedImage

- Avatar в header (mock url).
- `priority` только above-fold.

### 5.2.3 Detach experiment (optional)

Один тяжёлый widget — `ChangeDetectorRef.detach()` + manual `markForCheck` — документировать tradeoff.

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

### PF-5.1 Export CSV (V5)

- [ ] `exportTodos()` — Blob download, perf test on 1000 items

### PF-1.1 WebSocket full (V1)

- [ ] Завершить real-time после virtual scroll baseline

---

## Следующая фаза

→ [phase-06-design-system.md](./phase-06-design-system.md)


