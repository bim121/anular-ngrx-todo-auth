# ADR-007 (React): Layering and feature folder boundaries

**Status:** Accepted  
**Date:** 2026-07-22  
**Context:** Phase 4 — `marketing-mfe` mirrors Angular repository + facade layering with Promise-based ports and React hooks.  
**Angular mirror:** feature → data-access → HTTP (see Phase 4 facades / `TodoRepository`).  
**Related:** [ADR-003-react-state.md](./ADR-003-react-state.md)

---

## Decision

Dependency direction in `marketing-mfe`:

```text
pages / UI components
        ↓
   composables (useTodos, useLogout, …)
        ↓
   repository port (TodoRepository)
        ↓
   api / json-server (JsonServerTodoRepository)
```

| Layer | May import | Must not import |
|-------|------------|-----------------|
| `features/*/pages` or list UI | Own feature composables, `shared/ui`, `stores` public API, `hooks` | `@tanstack/react-query`, repository impl details, other feature internals |
| `features/*/composables` | `@shared/data-access`, `stores`, `core/query-client`, `core/env` | Other feature folders’ private modules |
| `stores` | `core` types only | Feature UI or React Query |
| `@shared/data-access` | Nothing from apps | App-specific React / Vue |

### Feature folder boundaries

- `features/todos` must **not** import `features/auth` internals (e.g. login form modules). Auth session is read via `useAuthStore` (public store API), same as Angular facades reading auth selectors.
- `features/auth` must **not** import todos composables or query keys.
- Components call **`useTodos()`** only — never `useQuery` / `useMutation` / `fetch` for todos.

### Repository swap

```typescript
// Production (default inside useTodoRepository)
new JsonServerTodoRepository({ baseUrl, getAccessToken, getUserId })

// Vitest — no json-server
<TodoRepositoryProvider repository={new MockTodoRepository(seed)}>
  …
</TodoRepositoryProvider>
```

---

## Consequences

- New server entities get a repository + feature composable; pages stay thin.
- UI tests inject `MockTodoRepository` and stay offline.
- Cross-feature coupling goes through shared stores / shared libs, not deep relative imports.

## Files

| File | Role |
|------|------|
| `libs/shared/data-access/src/todo.repository.ts` | `TodoRepository` port |
| `libs/shared/data-access/src/json-server-todo.repository.ts` | json-server impl |
| `libs/shared/data-access/src/mock-todo.repository.ts` | in-memory test impl |
| `apps/marketing-mfe/src/features/todos/useTodos.ts` | composable (Query + repo) |
| `apps/marketing-mfe/src/features/todos/todo-repository-context.tsx` | DI for tests |
| `apps/marketing-mfe/src/features/todos/TodoList.tsx` | UI → `useTodos()` only |
