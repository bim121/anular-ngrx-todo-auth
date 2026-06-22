# ADR-008: Custom router serializer and navigation-triggered todo load

**Status:** Accepted  
**Date:** 2026-06-16  
**Context:** Phase 3.5 — connect `@ngrx/router-store` with a memory-efficient serializer and load todos from an effect on navigation instead of from the list component.

**Related:** [ADR-003](./ADR-003-global-ngrx-vs-signalstore.md), [ngrx-effects-operators.md](../ngrx-effects-operators.md)

---

## Decision

### 3.5.1 Custom router serializer

Replace the default **Full** / **Minimal** serializers with a project-specific serializer that keeps only:

```typescript
interface AppRouterState {
  url: string;
  params: Params;
  queryParams: Params;
}
```

NgRx wraps this in `RouterReducerState<AppRouterState>` as `{ state, navigationId }` under feature key `router`.

**Why:** Full serializer stores the entire `ActivatedRouteSnapshot` tree; Minimal still keeps a nested route tree. For this app we only need URL and leaf-route params for selectors and navigation effects — less memory and simpler DevTools snapshots.

**Registration:**

```typescript
provideState('router', routerReducer),
provideRouterStore({ serializer: CustomRouterSerializer }),
```

Built-in `getRouterSelectors()` assumes a `root` property on serialized state; with our shape use **`router.selectors.ts`** (`selectRouterUrl`, `selectRouterParams`, `selectRouterQueryParams`).

### 3.5.2 Effect on navigation

Dispatch `loadTodos` from an effect when:

1. `routerNavigatedAction` fires (navigation finished),
2. `selectUserId` is present (authenticated),
3. Target URL is the todos page (`/todos`).

```typescript
loadTodosOnNavigation$ = createEffect(() =>
  this.actions$.pipe(
    ofType(routerNavigatedAction),
    concatLatestFrom(() => this.store.select(selectUserId)),
    filter(([action, userId]) =>
      userId != null && action.payload.routerState.url.includes('/todos')
    ),
    map(() => loadTodos())
  )
);
```

`loadTodos$` remains unchanged (HTTP, retry, `takeUntil` logout cancel).

**Remove** `TodoListComponent.ngOnInit()` dispatch — data loading is a side effect of routing, not of mounting the list UI.

**Flow after login:** `loginSuccess` → `authNavigation$` navigates to `/todos` → `routerNavigatedAction` → `loadTodosOnNavigation$` → `loadTodos$`.

---

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Keep `loadTodos()` in `ngOnInit` | Duplicates trigger; component owns data-fetch concern |
| Load on every authenticated navigation | Reloads todos when opening `/profile` — unnecessary API traffic |
| Default `MinimalRouterStateSerializer` | Still serializes full route tree; plan asks for explicit field subset |
| `ROUTER_NAVIGATION` instead of `ROUTER_NAVIGATED` | Runs before guards; may fire for cancelled navigations |

---

## Testing

| Test | File | Covers |
|------|------|--------|
| Serializer shape + leaf walk | `custom-router.serializer.spec.ts` | 3.5.1 |
| Dispatches `loadTodos` when authenticated + `/todos` | `todo.effects.spec.ts` | 3.5.2 |
| Skips when logged out or non-todos URL | `todo.effects.spec.ts` | 3.5.2 |

---

## Files

| File | Role |
|------|------|
| `custom-router.serializer.ts` | `CustomRouterSerializer`, `AppRouterState` |
| `router.selectors.ts` | Selectors for slim router state |
| `app.config.ts` | `routerReducer` + `provideRouterStore({ serializer })` |
| `todo.effects.ts` | `loadTodosOnNavigation$` |
| `todo-list.component.ts` | No manual `loadTodos` on init |

---

## Consequences

- Router feature must stay registered (`provideState('router', routerReducer)`) for selectors and DevTools.
- Future route-param-driven features read `selectRouterParams` / `selectRouterQueryParams` instead of injecting `ActivatedRoute` in effects.
- Phase 3.5.3 (localStorage sync) and 3.5.4 (meta-reducer reset) are separate follow-ups.
