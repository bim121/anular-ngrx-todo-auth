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

## SEO (Phase 7 / V.7.2)

- Standalone app is **`noindex, nofollow`** (`index.html` + `src/core/seo.ts`).
- Public SEO is owned by Next marketing + Angular shell — see [ADR-014](../../docs/adr/ADR-014-nuxt-vs-vite-analytics.md).
- Nuxt migration **rejected** for this remote ([comparison](../../docs/multi-stack/07-nuxt-comparison-adr.md)).

## Stack notes

- **Todos:** `TodoListView.vue` + `TodoRow.vue` with `v-memo` (Phase 5).
- **Analytics:** Chart.js bar on `/analytics` (`StatsChart.vue`).
- **Login:** `validateLogin()` + `v-model` in `LoginView.vue`.
- **Docs:** `docs/vue/proxy-reactivity-deep-dive.md`, `docs/vue/perf-v-memo.md`, `docs/vue/perf-dashboard.md`.

## Perf stress (1000 todos)

```bash
node scripts/seed-many-todos.js 1000
```

Then open `/todos` and scroll; chart on `/analytics`.
