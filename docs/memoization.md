# Memoization guidelines (Phase 5.4)

Rules for derived state in this monorepo: when to use NgRx selectors, `computed()`, `shareReplay`, and pure pipes.

---

## 5.4.1 / 5.4.2 — Selectors vs `computed()`

| Source of truth | Tool | Example |
|-----------------|------|---------|
| **Server / domain state** in the global store | NgRx `createSelector` (parametric when args needed) | `selectFilteredTodos('active')`, `selectTodoById(id)` |
| **UI-only** state (chips, edit mode, local toggles) | `@ngrx/signals` / component `signal()` | `TodoListUiStore.filter` |
| **Join** domain + UI for the template | `computed()` | `filteredTodoTree` = selector output + `selectedTag` + `buildTodoTree` |

### Do

- Put expensive filters over entities in **selectors** so memoization is shared across subscribers.
- Cache parametric selector factories for discrete args (`all` / `active` / `done`) or unbounded keys (`Map` per tag) so each arg reuses **one** selector instance.
- Keep filter **chips** in SignalStore ([ADR-003](./adr/ADR-003-global-ngrx-vs-signalstore.md)); do not put them in the todos reducer.
- Use `computed()` only for the last mile: tree shape, visible counts, combining UI args with already-selected domain data.

### Don’t

- Re-implement `applyTodoFilter` inside a component when `selectFilteredTodos` / `TodosFacade.filteredTodos` already exists.
- Duplicate the same derivation as both a selector **and** a `computed` that re-filters `selectAllTodos`.
- Put ephemeral UI (`editingId`, selected tag) into NgRx just to get a selector.

### Todo list pattern (this app)

```typescript
// Domain — memoized in NgRx
export const selectFilteredTodos = (filter: TodoFilter) =>
  selectFilteredTodosByStatus[filter];

// Facade
filteredTodos(filter: TodoFilter): Todo[] {
  return this.filteredByStatus[filter]();
}

// Page — UI join only
readonly filteredTodoTree = computed(() => {
  let items = this.todosFacade.filteredTodos(this.uiStore.filter());
  const tag = this.uiStore.selectedTag();
  if (tag) items = items.filter((t) => t.tags.includes(tag));
  return buildTodoTree(items);
});
```

---

## 5.4.3 — `shareReplay` audit

| Location | Config | Why |
|----------|--------|-----|
| `RoutePageContextService.activePageSource$` | `shareReplay({ bufferSize: 1, refCount: true })` | Multiple consumers (`toSignal` + title `effect`) share one navigation→page-data pipeline; `refCount: true` unsubscribes when unused so router work does not leak. |

**Rules**

- Prefer `shareReplay({ bufferSize: 1, refCount: true })` for app code.
- Avoid bare `shareReplay(1)` / `refCount: false` unless the stream must stay hot for the whole app lifetime (document why).
- Prefer NgRx store / `toSignal(store.select(...))` over hand-rolled shared HTTP observables when the data is domain state.

**Grep (2026-07-29):** only the route page-context usage above — no other `shareReplay` in app/libs sources.

---

## 5.4.4 — Pure pipes vs signals / `computed`

| Use case | Choice | Why |
|----------|--------|-----|
| Expensive transform that depends on reactive inputs in the template | `computed()` (or selector upstream) | Runs when deps change; fits zoneless + OnPush; easy to unit-test |
| Rarely changing display formatting (dates, currency, fixed labels) | Pure `@Pipe` | Cheap, declarative in templates; Angular skips recalc when refs unchanged |
| Domain filtering / entity graphs | NgRx selector | Shared memoization, DevTools-friendly |
| One-off string in a single template | Method call or inline | Avoid a pipe/`computed` ceremony |

**This app:** no custom pipes in the todos feature yet — list filtering and tree building use selectors + `computed`. Prefer adding a pure pipe only for cross-feature display formatting (e.g. date), not for filtering todos.

---

## Quick checklist

1. New derived **domain** value? → selector (parametric + cache if args).
2. New derived **UI** value? → `computed` / SignalStore.
3. New multicast Observable? → justify `shareReplay` + `refCount: true`.
4. Template-only format? → pure pipe; otherwise signal/`computed`.
