# ADR-012: Phase 3 — Advanced NgRx recap (cheat sheet)

**Status:** Accepted (reference)  
**Date:** 2026-06-15  
**Context:** Quick-return guide for [Phase 3](../../plans/phase-03-advanced-ngrx.md) — entity stores, effects operators, optimistic UI, SignalStore, router store, persistence, product features.  
**Deep dives:** [ADR-003](./ADR-003-global-ngrx-vs-signalstore.md), [ADR-007](./ADR-007-optimistic-todo-toggle.md), [ADR-008](./ADR-008-router-store-and-navigation-load.md), [ADR-009](./ADR-009-store-persistence-and-meta-reducers.md)

---

## What Phase 3 gave us

Enterprise NgRx patterns: **entity adapters**, optimistic mutations, marble-tested effects, **component-scoped SignalStore**, router-driven loads, **localStorage** auth rehydrate, DevTools sanitizers, notifications entity, tags/priority/subtasks tree.

---

## Entity stores

| Slice | File | Adapter ops |
|-------|------|-------------|
| Todos | `features/todos/data-access/todo.reducer.ts` | `setAll`, `addOne`, `updateOne`, `removeOne` |
| Notifications | `features/notifications/data-access/notification.reducer.ts` | `addOne` on mock `todoAssigned` |

**Selectors** (`todo.selectors.ts`):

- `selectTodoById(id)` — props factory
- `selectTodosByTag(tag)`
- `selectTodoTree` + `buildTodoTree()` — `parentId` hierarchy

**Gap:** todos use manual `todosFeatureKey`; auth uses `createFeature` (`auth.feature.ts`).

---

## Optimistic toggle ([ADR-007](./ADR-007-optimistic-todo-toggle.md))

**Flow:**

1. UI dispatches `toggleTodoOptimistic({ todo })`
2. Reducer flips `completed` + adds `pendingToggleIds`
3. Effect `switchMap` → PATCH API
4. Success → `toggleTodoSuccess` / Failure → `toggleTodoFailure` (rollback)

**Files:** `todo.actions.ts`, `todo.reducer.ts`, `todo.effects.ts`, `todo-item.component.ts` (disable while pending)

**Demo:** task `[500]…` triggers mock API error → rollback.

---

## SignalStore UI ([ADR-003](./ADR-003-global-ngrx-vs-signalstore.md))

```typescript
// features/todos/pages/todo-list/todo-list-ui.store.ts
export const TodoListUiStore = signalStore(
  withState({ filter: 'all', editingId: null, selectedTag: null }),
  withMethods(/* setFilter, startEdit, cancelEdit, setTag */),
);
```

**Provision:** `providers: [TodoListUiStore]` on `TodoListComponent` only.

**Stays in component:** `newTask`, `updatedTask` form fields; `computed()` joins NgRx todos + UI filter/tag.

---

## Effects operators

| Operator | Used for | File |
|----------|----------|------|
| `exhaustMap` | login, register — ignore double-submit | `auth.effects.ts` |
| `switchMap` | load todos, toggle — cancel stale | `todo.effects.ts` |
| `concatMap` | add todo — preserve order | `todo.effects.ts` |
| `concatLatestFrom` | read store inside effect | both |
| `tap` (no dispatch) | toast, navigation, analytics log | both |

**Reference table:** `docs/ngrx-effects-operators.md`

---

## Router store & navigation load ([ADR-008](./ADR-008-router-store-and-navigation-load.md))

| File | Role |
|------|------|
| `core/routing/custom-router.serializer.ts` | Slim `AppRouterState` (url, params, queryParams) |
| `core/routing/router.selectors.ts` | `selectRouterUrl`, etc. |
| `todo.effects.ts` → `loadTodosOnNavigation$` | On `routerNavigatedAction` + authenticated `/todos` → `loadTodos` |

**Repeat:** do not `loadTodos` in component `ngOnInit` — navigation effect owns it.

---

## Persistence & strict dev checks ([ADR-009](./ADR-009-store-persistence-and-meta-reducers.md))

| Piece | File |
|-------|------|
| `localStorageSync` (auth fields) | `core/store/store.meta-reducers.ts` |
| Clear todos on logout | `clearStateMetaReducer` |
| `_persistedAt` / ready flag | `persistenceReadyMetaReducer` |
| Guards wait for rehydrate | `auth.guard.ts`, `guest.guard.ts`, `selectAuthPersistenceReady` |
| DevTools password mask | `core/store/devtools-config.ts` |
| Strict immutability (dev) | `app.config.ts` |

---

## Logout cancels in-flight HTTP

`core/effects/effects-lifecycle.service.ts` — `takeUntil(cancelPendingRequests)` on `loadTodos$` when `logoutUser` fires.

---

## Feature flags / runtime config

| File | Role |
|------|------|
| `core/config/app-config.reducer.ts` | `appConfig` slice |
| `core/config/app-config.effects.ts` | load `assets/config.json` |
| `public/assets/config.json` | toggles for experiments |

`APP_INITIALIZER` or effect on bootstrap loads config.

---

## Product features (PF-3.x / PF-7.x)

| Feature | Model / UI |
|---------|------------|
| Tags | `todo.model.ts` → `tags?: string[]`; filter via `TodoListUiStore.selectedTag` |
| Priority | `priority?: 'low' \| 'medium' \| 'high'` |
| Subtasks | `parentId?: string`; `todo-tree-item/` component |
| Notifications | `features/notifications/` + bell in main layout header |

---

## Testing

| Area | File | Style |
|------|------|-------|
| Auth effects | `auth.effects.spec.ts` | TestScheduler marbles (~8) |
| Todo effects | `todo.effects.spec.ts` | marbles (~17) — toggle, load, navigation |
| Reducers | `*.reducer.spec.ts` | pure state transitions |

**Target met:** ≥10 marble tests across auth + todos.

---

## React mirror (marketing-mfe)

Same json-server; different stack:

| Angular | React |
|---------|-------|
| NgRx entity + effects | TanStack Query — `useTodosQuery.ts` |
| NgRx auth | Zustand — `stores/authStore.ts` |
| Optimistic toggle in reducer | `useToggleTodoMutation` `onMutate`/`onError` |
| Logout clears store | `useLogout` → `queryClient.clear()` |

See [ADR-003-react-state.md](./ADR-003-react-state.md).

---

## 30-second “add advanced NgRx behavior” recipe

1. **Read path:** action → effect (`switchMap`/`exhaustMap`) → success/fail actions → entity reducer.
2. **Optimistic path:** optimistic action in reducer first; failure action restores from `pending` snapshot or re-fetches.
3. **UI-only state:** new `signalStore` on the page component, not global reducer.
4. **Cross-route data:** global entity slice + selector; wire load to router or auth state, not `ngOnInit`.
5. **Persistence:** only whitelisted keys in `localStorageSync`; meta-reducer on logout.
6. **Test:** marble the effect stream; reducer spec for each new action handler.
