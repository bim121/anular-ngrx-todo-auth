# Vue `v-memo` on todo rows (analytics-mfe)

**Context:** Phase 5 — V.5.1. Parallel to React `React.memo` / Angular OnPush list rows.

App: `apps/analytics-mfe` · list: `TodoListView.vue` + `TodoRow.vue` · seed: `node scripts/seed-many-todos.js 1000`

---

## What `v-memo` does

`v-memo="[dep1, dep2, …]"` tells Vue: **skip patching this VNode subtree** unless one of the dependency values changed since the last render.

Unlike React.memo (bail out of function re-execution), Vue still runs the parent render; `v-memo` cuts **DOM / child update** work for unchanged rows.

```vue
<TodoRow
  v-for="todo in filteredTodos"
  :key="todo.id"
  v-memo="[todo.id, todo.completed, todo.task, mutating]"
  :todo="todo"
  :disabled="mutating"
/>
```

Deps chosen so:

| Change | Rows update? |
|--------|----------------|
| Type in “new task” input | No (deps unchanged) |
| Toggle one todo | Only that row (`completed` / `task`) |
| Filter all → active | Removed unmount; survivors skip if deps same |
| `mutating` flips | All rows (disabled state) |

---

## Measure (Vue DevTools)

1. `npm run api` + `npm run dev:analytics`
2. Seed: `node scripts/seed-many-todos.js 1000`
3. Login → `/todos`
4. Vue DevTools → **Timeline** / component render highlights
5. Baseline (temporarily remove `v-memo`): type in the add input → every row updates
6. With `v-memo`: same typing → row updates stay flat

**Pass:** measurable drop in component updates when parent re-renders for unrelated local state (`newTask`, toasts).

---

## Related

- Dashboard chart + checklist: [perf-dashboard.md](./perf-dashboard.md)
- Proxy reactivity: [proxy-reactivity-deep-dive.md](./proxy-reactivity-deep-dive.md)
- React counterpart: [react/perf-profiling.md](../react/perf-profiling.md)
