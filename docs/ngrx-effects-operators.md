# NgRx Effects — operator choices

**Context:** Phase 3 — advanced effects in `anular-ngrx-todo-auth`.  
**Related:** [phase-03-advanced-ngrx.md](../plans/phase-03-advanced-ngrx.md)

---

## `concatLatestFrom` vs `withLatestFrom`

Todo effects read `userId` from the store after each action. We use **`concatLatestFrom`** from `@ngrx/operators` instead of RxJS `withLatestFrom`:

| | `withLatestFrom` | `concatLatestFrom` |
|---|------------------|---------------------|
| When store is read | Latest value at source emission | Snapshot **after** the triggering action (and any synchronous reducers) |
| Use in NgRx | Legacy pattern | Recommended for action + store pairs |

```typescript
import { concatLatestFrom } from '@ngrx/operators';

this.actions$.pipe(
  ofType(TodoActions.loadTodos),
  concatLatestFrom(() => this.store.select(selectUserId)),
  // [action, userId]
);
```

---

## Flattening operators by effect

| Effect | Operator | Why |
|--------|----------|-----|
| `loginUser$` | `exhaustMap` | Ignore double-click / duplicate login while request in flight |
| `registerUser$` | `exhaustMap` | Same — one registration at a time |
| `loadTodos$` | `switchMap` | New load cancels the previous in-flight fetch (e.g. rapid navigation) |
| `addTodo$` | `concatMap` | Preserve add order when user submits tasks quickly |
| `updateTodo$` | `switchMap` | Latest edit wins; matches optimistic reducer overwrite |
| `deleteTodo$` | `switchMap` | Latest delete wins for the same burst of clicks |

### Quick reference

- **`exhaustMap`** — ignore new sources until current inner observable completes (auth).
- **`switchMap`** — cancel previous inner when a new source arrives (reads, last-write-wins updates).
- **`concatMap`** — queue inner observables; order preserved (add todo).
- **`mergeMap`** — parallel; use when order does not matter and concurrency is OK (not used here).

### Cancel on logout

`loadTodos$` inner HTTP uses `takeUntil(EffectsLifecycleService.cancelPendingRequests)`.  
`authNavigation$` calls `notifyCancelPendingRequests()` on `logoutUser` so in-flight loads do not dispatch after session ends.

---

## Non-dispatching effects (`auth.effects.ts`)

| Effect | Role |
|--------|------|
| `registerSuccess$` | Toast after registration |
| `authNavigation$` | Navigate to `/todos` or `/login`; cancel pending todo loads on logout |
| `analyticsLog$` | Dev-only `console.info('[analytics mock]', action.type)` |

---

## Read retries

`loadTodos$` uses `retry({ count: 2, delay: 1000 })` inside the inner observable — **read-only**. Mutations (`add` / `update` / `delete`) do not retry to avoid duplicate side effects.

---

## Implementation files

| Feature | File |
|---------|------|
| Auth effects | `src/app/features/auth/data-access/auth.effects.ts` |
| Todo effects | `src/app/features/todos/data-access/todo.effects.ts` |
| Logout cancel bus | `src/app/core/effects/effects-lifecycle.service.ts` |
