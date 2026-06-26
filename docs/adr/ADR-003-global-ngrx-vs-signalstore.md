# ADR-003: Global NgRx store vs SignalStore boundaries

**Status:** Accepted  
**Date:** 2026-06-19  
**Context:** Phase 3 — `@ngrx/signals` `signalStore` for todo list **UI-only** state. Domain todos and auth remain in global NgRx (`provideStore` / `provideState`).

**Related:**

- [ADR-006](./ADR-006-local-resource-vs-global-store.md) — httpResource vs NgRx
- [ADR-007](./ADR-007-optimistic-todo-toggle.md) — optimistic toggle in NgRx entity store
- [ADR-003-react-state.md](./ADR-003-react-state.md) — React mirror (TanStack Query + Zustand)
- [ADR-012](./ADR-012-phase-03-advanced-ngrx-recap.md) — Phase 3 cheat sheet
- [ngrx-effects-operators.md](../ngrx-effects-operators.md)

---

## Decision

Use **two layers** with clear ownership:

| Layer | Technology | Scope | Examples in this app |
|-------|------------|-------|----------------------|
| **Domain / shared** | NgRx `Store` + `Effects` + `Entity` | App-wide, persisted intent, DevTools | `auth`, `todos` (CRUD, toggle, loading, errors) |
| **Page / widget UI** | `@ngrx/signals` `signalStore` | Component-provided, ephemeral | `TodoListUiStore` — filter chip, inline edit row id |

Do **not** put filter or `editingId` in the global `todos` reducer. Do **not** put todo entities in `TodoListUiStore`.

---

## TodoListUiStore (Phase 3.4.1)

```typescript
// src/app/features/todos/pages/todo-list/todo-list-ui.store.ts
export const TodoListUiStore = signalStore(
  withState({ filter: 'all', editingId: null }),
  withMethods(/* setFilter, startEdit, cancelEdit */),
);
```

**Provision:** `providers: [TodoListUiStore]` on `TodoListComponent` only — **not** in `app.config` or root.

**Why component scope:**

- State resets when user leaves `/todos` (destroy store instance).
- No cross-route reads — filter is irrelevant on login/profile.
- Avoids polluting global DevTools with UI noise.

**What stays in the component (not SignalStore):**

- `newTask` / `updatedTask` — ephemeral form fields bound to `ngModel`.
- `filteredTodos` — `computed()` joining NgRx `todos` + `uiStore.filter()`.
- NgRx selectors via `toSignal(store.select(...))` for domain data.

---

## Global NgRx — keep when

- Data is **shared** across routes, guards, interceptors, or features (auth token, todo list).
- **Side effects** required (HTTP, navigation bus, toasts tied to actions).
- **Optimistic updates + rollback** with entity adapter ([ADR-007](./ADR-007-optimistic-todo-toggle.md)).
- Need **time-travel** / action log in Redux DevTools.
- Other features react to the same actions (e.g. `logoutUser` clears todos).

---

## SignalStore — use when

- State is **UI-only** (filters, panel open, selected tab, inline edit mode).
- **Single screen** owns the state; no other feature reads it.
- Reset on navigate away is desired.
- No HTTP or cross-feature effects.

---

## Comparison table

| Concern | NgRx global | SignalStore (local) |
|---------|-------------|---------------------|
| Todo entities | ✅ `todos` feature + entity adapter | ❌ |
| Filter all/active/done | ❌ | ✅ `TodoListUiStore.filter` |
| Which row is editing | ❌ | ✅ `TodoListUiStore.editingId` |
| Toggle optimistic + rollback | ✅ actions/effects/reducer | ❌ |
| Auth session | ✅ `auth` feature | ❌ |
| User profile (read-only) | ❌ | ❌ — use `httpResource` ([ADR-006](./ADR-006-local-resource-vs-global-store.md)) |

---

## Alternatives considered

- **Filter in NgRx todos slice** — works but couples list UI to global store; every filter change in DevTools; survives logout unless cleared manually.
- **Component `signal()` only** — fine for Phase 2; SignalStore adds named methods, testability, and matches Phase 3 learning goal.
- **ComponentStore** — valid for local state; project standardizes on `@ngrx/signals` for new UI state in Phase 3+.

---

## Consequences

- Inject `TodoListUiStore` only under `TodoListComponent` subtree.
- New page-level UI state → new `signalStore`, component-scoped provider.
- Domain mutations continue to dispatch NgRx actions from the component.
- Future persistence meta-reducer applies to `auth` / `todos`, not `TodoListUiStore`.

---

## Files

| File | Role |
|------|------|
| `todo-list-ui.store.ts` | SignalStore definition |
| `todo-list.component.ts` | `providers: [TodoListUiStore]`, bridges NgRx + UI store |
| `todo.reducer.ts` / `todo.effects.ts` | Domain todo state (unchanged by SignalStore) |
