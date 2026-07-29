# HTTP cache, SWR, and request dedup (Phase 5.5)

## 5.5.1 Cache interceptor

| Piece | Location |
|-------|----------|
| `HttpCacheService` | `apps/web/src/app/core/http/http-cache.service.ts` |
| `cacheInterceptor` | `apps/web/src/app/core/interceptors/cache.interceptor.ts` |
| Chain slot | after auth/logging, before retry |

**Behavior**

- Caches **GET** todo **collection** URLs (`…/todos?userId=…`) with TTL **30s**.
- Fresh hit → `HttpResponse` from memory (no network).
- **POST / PATCH / DELETE / PUT** on `/todos*` → `invalidateTodos()` after a successful response.
- Logout → `HttpCacheEffects` clears the whole cache.

## 5.5.2 Stale-while-revalidate

Two layers:

1. **HTTP:** expired cache entry still present → emit stale body, then network refresh (`concat`), which updates the cache and the NgRx effect (second `loadTodosSuccess` if body changed).
2. **Store / facade:** `loadTodos` sets `loading: true` only when the entity collection is empty — existing todos stay on screen during background refresh (`TodosFacade.load()`).

## 5.5.3 Deduplication

| Layer | Mechanism |
|-------|-----------|
| Effects | `exhaustMap` on `loadTodos$` — second `loadTodos` while in flight is ignored |
| HTTP | Shared `shareReplay` Observable per GET URL in `inflightGets` map |

`switchMap` would cancel the previous request; we prefer **not** restarting an identical list fetch.
