# Vue analytics dashboard perf (analytics-mfe)

**Context:** Phase 5 — V.5.2 Chart.js spike + V.5.3 checklist.

Routes: `/analytics` (chart) · `/todos` (list with `v-memo`)

---

## V.5.2 — Chart spike

| Item | Location |
|------|----------|
| Deps | `chart.js` + `vue-chartjs` in `analytics-mfe` |
| Component | `src/features/analytics/StatsChart.vue` |
| Route | `/analytics` via `AnalyticsView.vue` |
| Data | Client-side aggregate: completed todos **by tag** (no separate `/todos/stats` yet) |

**CLS:** `.chart-wrap` is always **240px** tall (loading hint overlays) so the card does not jump when the canvas mounts.

**Check:** open `/analytics` after login — bar chart renders; layout height stable before/after load.

---

## V.5.3 — Dashboard perf checklist

| Metric | Target | How to check | Status notes |
|--------|--------|--------------|--------------|
| List 1000 todos scroll | smooth | `seed-many-todos.js 1000` → `/todos` scroll viewport | Scroll container `max-height: min(60vh, 520px)`; `v-memo` reduces patch cost (not virtual DOM count — see React virtualizer for that) |
| Chart first paint | &lt; 500ms | Performance → measure from navigation to chart canvas | Chart.js after `load()`; fixed 240px slot |
| Memory after 50 navigations | stable | DevTools Memory: `/todos` ↔ `/analytics` × 50 | Expect flat heap after GC; no growing detached nodes |

---

## Vitest smoke

`TodoRow.v-memo.spec.ts` mounts **1000** memoized rows and asserts render finishes under a CI-safe threshold (see test file).

```bash
npm run test --workspace=analytics-mfe
```

---

## Related

- [perf-v-memo.md](./perf-v-memo.md)
- Angular/React budgets: [perf-budget.md](../perf-budget.md)
