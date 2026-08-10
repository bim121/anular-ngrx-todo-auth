# React perf profiling (marketing-mfe)

**Context:** Phase 5 — R.5.1 virtualization + R.5.2 `React.memo` on todo rows.

App: `apps/marketing-mfe` · list: `TodoList.tsx` + memoized `TodoRow.tsx` · seed: `node scripts/seed-many-todos.js 1000`

---

## Setup

```bash
npm run api
npm run dev:marketing
# optional stress seed (user_1):
node scripts/seed-many-todos.js 1000
```

Open http://localhost:4300 → login → todos. Viewport is fixed height (`min(60vh, 520px)`), row height **72px**.

---

## R.5.1 — Virtual scroll (`@tanstack/react-virtual`)

### What changed

| Before | After |
|--------|--------|
| Mounted all `filtered.map` rows | Only ~viewport + `overscan: 8` rows in DOM |
| 1000 `<li>` nodes | ~15–25 virtual rows |

### Chrome Performance checklist

1. Record **Performance** while scrolling the list aggressively for ~3s.
2. Look at **Frames** / FPS: target **~60fps** on 1000 items.
3. Compare (optional A/B): temporarily replace virtualizer with full `.map` — FPS drops and Scripting time spikes.

### Expected

| Metric | Target | Notes |
|--------|--------|--------|
| Scroll FPS @ 1000 | ~60 | Fixed `estimateSize: 72` keeps measurements stable |
| Initial list paint | &lt; 100ms of row work | Only visible rows commit; full list still in React Query cache |

DOM check: Elements → `.todo-list-viewport` children count stays small while scrolling.

---

## R.5.2 — `React.memo` on `TodoRow`

### What changed

- `TodoRow` wrapped in `memo`.
- Handlers stabilized with `useCallback` in `TodoList` / `useTodos` so memo is not defeated by new function identity every render.

### React DevTools Profiler

1. Install React DevTools → **Profiler**.
2. Enable **Highlight updates when components render**.
3. Toggle **one** checkbox.

**Pass:** only that row (and ancestors that must update: `TodoList`, Query) flash — sibling rows stay dark.

**Fail (before memo / unstable props):** every visible `TodoRow` re-renders on each toggle.

### Mental model

Optimistic toggle updates the Query cache → `TodoList` re-renders → without `memo`, every mounted row re-renders even if `todo` props are unchanged. With `memo` + stable callbacks, unchanged rows bail out.

---

## Screenshots

Capture locally and drop under `docs/react/` if needed:

- `perf-scroll-virtual.png` — Performance panel during scroll (FPS ~60)
- `perf-profiler-toggle-memo.png` — Profiler flamegraph / highlight after single toggle

This doc is the procedure + acceptance bar; screenshots are optional evidence for reviews.

---

## Related

- Angular CDK virtual scroll: Phase 5 Angular track / `TODO_VIRTUAL_ITEM_SIZE_PX`
- Bundle sizes: [perf-budget.md](../perf-budget.md) (React section)
- Fiber / reconciliation: [reconciliation-and-fiber.md](./reconciliation-and-fiber.md)
