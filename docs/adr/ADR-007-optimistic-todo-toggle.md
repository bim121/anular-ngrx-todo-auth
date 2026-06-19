# ADR-007: Optimistic todo toggle with rollback

**Status:** Accepted  
**Date:** 2026-06-16  
**Context:** Phase 3 — optimistic UI for checkbox toggle. Prior flow reused `updateTodo` with reducer-side optimistic patch; toggle needed a dedicated action pipeline, rollback, and per-item pending state.

**Related:** [ADR-006](./ADR-006-local-resource-vs-global-store.md), [ngrx-effects-operators.md](../ngrx-effects-operators.md)

---

## Decision

Implement **optimistic toggle** as a separate action sequence from task **edit** (`updateTodo`):

| Step | Action | Layer |
|------|--------|-------|
| 1 | `toggleTodoOptimistic({ id })` | Reducer — flip `completed`, add `id` to `pendingToggleIds` |
| 2 | `toggleTodo({ id })` | Effect — `PATCH` via `TodoService.updateTodo` |
| 3a | `toggleTodoSuccess({ todo })` | Reducer — sync server entity, clear pending |
| 3b | `toggleTodoFailure({ id, previousCompleted, error })` | Reducer — rollback `completed`, clear pending; Effect — toast |

Task text edits keep the existing **`updateTodo`** optimistic path (reducer patch + effect HTTP).

---

## State shape

`TodosState` extends `@ngrx/entity` `EntityState<Todo>` plus:

```typescript
{
  loading: boolean;
  error: string | null;
  pendingToggleIds: string[];  // in-flight toggle requests
}
```

Entity adapter handlers (Phase 3.1.2):

- `loadTodosSuccess` → `setAll`
- `addTodoSuccess` → `addOne`
- `updateTodo` / `updateTodoSuccess` → `updateOne` (edit flow)
- `deleteTodoSuccess` → `removeOne`
- `toggleTodoOptimistic` / `toggleTodoFailure` → `updateOne` (rollback)

---

## Rollback strategy

On HTTP failure the effect dispatches `toggleTodoFailure` with **`previousCompleted`** captured from store **after** optimistic flip (`!todo.completed` equals pre-toggle value).

Reducer rolls back via:

```typescript
todosAdapter.updateOne(
  { id, changes: { completed: previousCompleted } },
  { ...state, pendingToggleIds: without(id) }
);
```

We do **not** reload all todos on toggle failure — targeted rollback is enough for a single boolean field.

Toggle failures do **not** write to `state.error` (avoids duplicate toasts with the list-level error effect). User feedback is via **`toggleTodoFailureToast$`** (`dispatch: false`).

---

## UI

`TodoListComponent` on checkbox click:

```typescript
dispatch(toggleTodoOptimistic({ id }));
dispatch(toggleTodo({ id }));
```

Checkbox / toggle button `[disabled]="loading() || isTogglePending(todo.id)"` — only the toggling row is locked, not the whole list.

---

## Effects summary (Phase 3.2 + 3.3)

| Effect | Operator | Notes |
|--------|----------|-------|
| `toggleTodo$` | `switchMap` | Latest toggle wins per burst |
| `toggleTodoFailureToast$` | `tap`, non-dispatching | Toast: `"<message> — changes reverted"` |
| `loadTodos$` | `switchMap` + `takeUntil(cancelPendingRequests)` | Cancelled on logout |

`concatLatestFrom` reads `userId` and `selectTodoEntities` after `toggleTodo` action.

---

## Testing

| Test | File | Covers |
|------|------|--------|
| Optimistic flip + pending id | `todo.reducer.spec.ts` | `toggleTodoOptimistic` |
| Rollback on failure | `todo.reducer.spec.ts` | `toggleTodoFailure` |
| Success clears pending | `todo.reducer.spec.ts` | `toggleTodoSuccess` |
| Marble success | `todo.effects.spec.ts` | `toggleTodo$` → `toggleTodoSuccess` |
| Marble failure | `todo.effects.spec.ts` | `toggleTodo$` → `toggleTodoFailure` |
| Toast on rollback | `todo.effects.spec.ts` | `toggleTodoFailureToast$` |

---

## Alternatives considered

- **Single `toggleTodo` action** — reducer and effect on same action; rejected to keep optimistic dispatch explicit and testable (plan 3.3.1).
- **Reload all on failure** — simpler but slower UX and extra API load.
- **No `pendingToggleIds`** — disable all checkboxes via global `loading`; rejected (plan 3.3.2 optional per-item disable).

---

## Files

| File | Role |
|------|------|
| `todo.actions.ts` | Toggle action group |
| `todo.reducer.ts` | Optimistic + rollback handlers |
| `todo.effects.ts` | `toggleTodo$`, `toggleTodoFailureToast$` |
| `todo.selectors.ts` | `selectPendingToggleIds`, `selectIsTodoTogglePending` |
| `todo-list.component.ts` | Dispatches optimistic + API actions |

---

## Consequences

- Checkbox and edit flows are separate — do not dispatch `updateTodo` for checkbox toggles.
- `pendingToggleIds` resets on `logoutUser` via `initialTodoState`.
- Future Phase 3 work (SignalStore for filter UI, persistence) does not change this toggle pipeline.
