# marketing-mfe

React marketing micro-frontend — login + todo list on hooks (Phase 2).

- **Now:** Vite + React, feature folders, json-server auth + todos
- **Phase 7:** migrate to Next.js App Router (SSR, `/pricing`, `/docs`)
- **Phase 9:** mount into Angular shell at `/`

## Dev

```bash
# terminal 1 — mock API
npm run api

# terminal 2 — marketing app
npm run dev:marketing
```

Open http://localhost:4300 — login with `test@example.com` / `password123`, then manage todos with filters (all / active / done).

## Stack notes

- **Login:** controlled form with shared `@shared/validators/email` (same rules as Angular).
- **Todos:** `useState` + `useEffect` + `useMemo` in `src/features/todos/TodoList.tsx`.
- **Docs:** `docs/react/reconciliation-and-fiber.md`, `docs/angular-vs-react-state.md`.
