# analytics-mfe

Vue 3 + Vite + Pinia — analytics micro-frontend with todo list on reactivity (Phase 2).

## Dev

```bash
# terminal 1
npm run api

# terminal 2
npm run dev:analytics
```

Open http://localhost:4400 — login at `/login` with `test@example.com` / `password123`, then manage todos at `/todos`.

## Routes

| Path | View |
|------|------|
| `/` | Home |
| `/login` | Login (controlled form, `computed` validation) |
| `/todos` | Todo list — `ref`, `computed`, `watch` (requires auth) |
| `/analytics` | Dashboard stub (requires auth) |

## Stack notes

- **Todos:** `src/features/todos/TodoListView.vue` — filters all / active / done, CRUD via fetch.
- **Login:** `validateLogin()` + `v-model` in `LoginView.vue`.
- **Docs:** `docs/vue/proxy-reactivity-deep-dive.md`.
