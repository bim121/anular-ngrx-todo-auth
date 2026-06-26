# ADR-003 (React): TanStack Query vs Zustand boundaries

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Phase 3 — `marketing-mfe` mirrors Angular state split: **server state** (todos) vs **client session** (auth).  
**Angular mirror:** [ADR-003-global-ngrx-vs-signalstore.md](./ADR-003-global-ngrx-vs-signalstore.md)

---

## Decision

| Layer | Technology | Scope | Examples in `marketing-mfe` |
|-------|------------|-------|-----------------------------|
| **Server / async** | TanStack Query | Cached HTTP, mutations, optimistic UI | `useTodosQuery`, `useToggleTodoMutation`, CRUD mutations |
| **Client session** | Zustand | Synchronous app identity | `useAuthStore` — `token`, `userId`, `userName`, `login`, `logout` |
| **Page UI** | `useState` / `useMemo` | Ephemeral, single screen | Todo filter chip, `newTask` input, local form errors |

Do **not** put todo entities in Zustand. Do **not** put auth token only in React Query cache.

---

## TanStack Query — use when

- Data comes from **HTTP** and may be stale / refetched.
- **Mutations** with optimistic updates + rollback (`onMutate` / `onError` / `onSettled`).
- Multiple components need the **same list** keyed by `userId`.
- DevTools for cache inspection (development only).

**Query key convention:**

```typescript
// apps/marketing-mfe/src/core/query-client.ts
export const todoQueryKey = (userId: string) => ['todos', userId] as const;
```

**Optimistic toggle (mirror ADR-007):**

- `onMutate` — cancel in-flight queries, snapshot `previous`, patch cache.
- `onError` — restore `previous`.
- `onSettled` — `invalidateQueries` for eventual consistency.
- Mock 500: task text `[500]…` → header `X-Mock-Toggle-Error: 1` → server returns 500 → rollback.

---

## Zustand — use when

- State is **synchronous** and **global** for the SPA shell.
- Guards / API layer read it on every request (`token`, `userId`).
- No natural cache TTL — logout must wipe it explicitly.

**Logout must clear Query cache:**

```typescript
// apps/marketing-mfe/src/hooks/useLogout.ts
logout();
queryClient.clear();
```

Otherwise todos from the previous user could flash after re-login.

---

## Comparison table (React ↔ Angular)

| Concern | React (`marketing-mfe`) | Angular (`src/app`) |
|---------|-------------------------|---------------------|
| Todo list + CRUD | TanStack Query | NgRx entity + effects |
| Auth session | Zustand | NgRx `auth` feature |
| Optimistic toggle | `useMutation` callbacks | actions + reducer + effects |
| Filter / inline edit UI | `useState` (local) | `TodoListUiStore` (SignalStore) |
| Read-only profile | *(not in MFE yet)* | `httpResource` ([ADR-006](./ADR-006-local-resource-vs-global-store.md)) |
| Logout side effects | `queryClient.clear()` | meta-reducer + `logoutUser` actions |

---

## Wiring checklist (repeat this setup)

1. **`createAppQueryClient()`** — `staleTime`, `retry` defaults in `core/query-client.ts`.
2. **`AppProviders`** — wrap root in `QueryClientProvider`; React Query Devtools **only** when `import.meta.env.DEV`.
3. **`main.tsx`** — `<AppProviders><App /></AppProviders>`.
4. **`useTodosQuery`** — `enabled: Boolean(userId && token)`; read auth from Zustand.
5. **Mutations** — `invalidateQueries({ queryKey: todoQueryKey(userId) })` on success (toggle uses optimistic path).
6. **`useLogout`** — Zustand reset + `queryClient.clear()`.

---

## Files

| File | Role |
|------|------|
| `apps/marketing-mfe/src/core/query-client.ts` | QueryClient factory + `todoQueryKey` |
| `apps/marketing-mfe/src/providers/AppProviders.tsx` | Provider + dev Devtools |
| `apps/marketing-mfe/src/stores/authStore.ts` | Zustand auth slice |
| `apps/marketing-mfe/src/hooks/useLogout.ts` | Logout + cache clear |
| `apps/marketing-mfe/src/features/todos/useTodosQuery.ts` | Query + CRUD mutations |
| `apps/marketing-mfe/src/features/todos/TodoList.tsx` | UI wired to hooks |
| `server/middleware.js` | `mockTogglePatchError` for rollback demo |

---

## Consequences

- New server entities → new `useQuery` / `useMutation` hooks, not new Zustand slices.
- New global client flags (theme, locale) → Zustand or React Context; not Query.
- Cross-MFE auth later (Phase 9) may replace in-memory Zustand with shared cookie / module federation shell.
