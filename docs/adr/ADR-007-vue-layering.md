# ADR-007 (Vue): Layering and feature folder boundaries

**Status:** Accepted  
**Date:** 2026-07-22  
**Context:** Phase 4 — `analytics-mfe` mirrors Angular repository + facade layering with Promise-based ports and Vue composables.  
**React mirror:** [ADR-007-react-layering.md](./ADR-007-react-layering.md)  
**Shared port:** `@shared/data-access` (`TodoRepository`)

---

## Decision

Dependency direction in `analytics-mfe`:

```text
views (TodoListView, LoginView, …)
        ↓
   composables (useTodos, useLogout, useAuth, …)
        ↓
   Pinia stores (sync state only)  +  repository port
        ↓
   json-server / mock (TodoRepository impl)
```

| Layer | May import | Must not import |
|-------|------------|-----------------|
| `features/*/views` | Composables, router | `@tanstack/vue-query`, repository HTTP, other feature internals |
| `composables/` | Stores, `@shared/data-access`, `services/` | Feature view SFCs |
| `stores/` | Shared types / `core` auth API for login only | Views, composables, HTTP for todos |
| `services/` | `@shared/data-access`, `core/env`, auth store getters | Views |

### Feature folder boundaries

- `features/auth` must **not** import `stores/todos` — only composables/public API (e.g. logout via `useLogout`).
- `features/todos` must **not** import `features/auth` internals (login form / validators); auth via `useAuth` / `useAuthStore`.
- Views call **`useTodos()`** only — never `fetch` / repository classes directly.

### Repository swap

```typescript
// main.ts
app.provide(TODO_REPOSITORY, createJsonServerTodoRepository());

// Vitest — no json-server
useTodos({ repository: new MockTodoRepository(seed) });
// or app.provide(TODO_REPOSITORY, mockRepo)
```

### Pinia vs repository

- **Pinia `todos`** — `setAll`, `upsert`, `patchTodo`, `removeTodo`, loading/error flags (sync).
- **Repository** — `getAll` / `create` / `update` / `delete` (async I/O).
- **`useTodos`** — load/add/toggle/remove orchestration, including optimistic toggle + rollback.

---

## Consequences

- Todos server cache no longer uses Vue Query in this MFE (Phase 3 Query path replaced by Pinia + repository for clearer layering).
- UI tests inject `MockTodoRepository` and stay offline.
- Vue and React share the same `TodoRepository` TypeScript contract.

## Files

| File | Role |
|------|------|
| `libs/shared/data-access` | Shared `TodoRepository` + json/mock impls |
| `apps/analytics-mfe/src/services/json-server-todo.repository.ts` | Factory + `TODO_REPOSITORY` inject key |
| `apps/analytics-mfe/src/stores/todos.ts` | Sync Pinia state |
| `apps/analytics-mfe/src/composables/useTodos.ts` | Orchestration facade |
| `apps/analytics-mfe/src/features/todos/TodoListView.vue` | UI → `useTodos()` only |
