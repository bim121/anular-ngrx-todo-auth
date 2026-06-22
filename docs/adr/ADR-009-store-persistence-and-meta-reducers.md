# ADR-009: Auth persistence, meta-reducers, and runtime checks

**Status:** Accepted  
**Date:** 2026-06-16  
**Context:** Phase 3.5.3–3.5.5 — persist auth session across refresh, reset global state on logout, avoid rehydrate race with guards, enable NgRx strict checks in development.

**Related:** [ADR-008](./ADR-008-router-store-and-navigation-load.md), [ADR-003](./ADR-003-global-ngrx-vs-signalstore.md)

---

## Decision

### 3.5.3 `ngrx-store-localstorage`

Persist only auth fields needed to restore a session:

```typescript
localStorageSync({
  keys: [{ auth: ['token', 'user', 'isLoggedIn'] }],
  rehydrate: true,
  checkStorageAvailability: true,
});
```

**Not persisted:** `isLoading`, `error`, `_persistedAt`, todos, router — server/cache-friendly and avoids stale UI flags.

**Race fix:** After rehydrate, `persistenceReadyMetaReducer` sets `auth._persistedAt`. `authGuard` and `guestGuard` wait for `selectAuthPersistenceReady` before reading `selectIsAuthenticated`. This prevents a refresh from redirecting to `/login` while persisted token is still loading.

Alternative from the plan (`APP_INITIALIZER`) is equivalent; guards were chosen because they already gate routed entry points.

### 3.5.4 Meta-reducer reset on logout

On `logoutUser`, `clearStateMetaReducer` passes `state = undefined` into the root reducer so **all slices** reset (auth + todos + any future features), not only auth via its feature reducer.

Todos also listen to `logoutUser` in their reducer; the meta-reducer guarantees a full wipe even if a slice forgets to handle logout.

### 3.5.5 `strictStateChecks` (dev only)

```typescript
provideStore({}, {
  metaReducers,
  runtimeChecks: {
    strictStateImmutability: true,
    strictActionImmutability: true,
    strictStateSerializability: true,
    strictActionSerializability: true,
  },
});
```

Enabled only when `isDevMode()` — production bundle skips the overhead.

---

## Meta-reducer composition

Order (innermost → outermost):

| Order | Reducer | Role |
|-------|---------|------|
| 1 | `clearStateMetaReducer` | `state = undefined` on logout |
| 2 | `localStorageSyncReducer` | rehydrate on INIT, sync on change |
| 3 | `persistenceReadyMetaReducer` | set `auth._persistedAt` |

---

## Flow after page refresh

1. `INIT` → localStorage rehydrates `auth.token`, `auth.user`, `auth.isLoggedIn`
2. `persistenceReadyMetaReducer` sets `_persistedAt`
3. Guard sees persisted session → allows `/todos`
4. `routerNavigated` → `loadTodosOnNavigation$` (ADR-008)

---

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Persist todos in localStorage | Stale list vs server; todos reload on navigation anyway |
| `logoutSuccess` action (plan snippet) | App uses synchronous `logoutUser`; no separate success action |
| Strict checks in production | Dev-only signal for accidental mutations |
| Guard without `_persistedAt` | Race: first `selectIsAuthenticated` emission can be `false` before rehydrate merge |

---

## Testing

| Test | File | Covers |
|------|------|--------|
| Rehydrate + `_persistedAt` | `store.meta-reducers.spec.ts` | 3.5.3 |
| Sync after login | `store.meta-reducers.spec.ts` | 3.5.3 |
| Todos cleared on logout | `store.meta-reducers.spec.ts` | 3.5.4 |
| `selectAuthPersistenceReady` | `auth.selectors.spec.ts` | 3.5.3 |
| Guards wait for persistence | `auth.guard.spec.ts`, `guest.guard.spec.ts` | 3.5.3 |

---

## Files

| File | Role |
|------|------|
| `core/store/store.meta-reducers.ts` | All meta-reducers + exported array |
| `app.config.ts` | `provideStore({ metaReducers, runtimeChecks })` |
| `auth.model.ts` | Optional `_persistedAt` |
| `auth.selectors.ts` | `selectAuthPersistenceReady` |
| `auth.guard.ts`, `guest.guard.ts` | Wait for persistence before auth check |

---

## Consequences

- Session survives browser refresh until explicit logout.
- Logout clears todos from store immediately (no leaked entities in DevTools).
- `_persistedAt` must stay **out** of `localStorageSync` keys.
- Phase 3.6 DevTools sanitizers are a separate follow-up.
