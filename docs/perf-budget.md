# Perf budget (baseline)

Captured 2026-07-23 (CWV) / 2026-07-28 (bundle) / 2026-07-30 (LHCI + SSR) / **2026-08-10 (React marketing-mfe)** — see [perf/baseline.md](./perf/baseline.md), [perf/bundle-audit.md](./perf/bundle-audit.md), [perf/hydration.md](./perf/hydration.md), [perf/memory-audit.md](./perf/memory-audit.md), [react/perf-profiling.md](./react/perf-profiling.md).

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| LCP (Lighthouse `/login`, mobile) | 2.4–2.5 s | &lt; 2.5 s | Borderline / pass |
| LCP (Lighthouse `/todos` @ 1000) | 2.3 s | &lt; 2.5 s | Pass |
| INP (Chrome Performance `/todos`) | 61 ms | &lt; 200 ms | Pass |
| CLS (Chrome Performance + Lighthouse) | 0 | &lt; 0.1 | Pass |
| Initial JS (raw, after cut) | **~349 kB** | warn 350 / error 500 | **Pass** |
| Initial JS (transfer est.) | ~100 kB | — | OK |
| List API→DOM (1 item) | 114 ms | &lt; 100 ms | Fail |
| List API→DOM (1000 items) | 164 ms | &lt; 100 ms | Fail |
| Lighthouse CI (`/login`) | — | perf ≥ 0.9 | Enforced in Actions |

**CI:** [`.github/workflows/lighthouse.yml`](../.github/workflows/lighthouse.yml) · configs `lighthouserc.json` / `lighthouserc.ci.json` · [`budget.json`](../budget.json)

**Local:** `npm run lhci` · SSR check: `npm run build && npm run serve:ssr`

Budgets also live in `apps/web/project.json`. Treemap: [`docs/perf/bundle-stats.html`](./perf/bundle-stats.html).

---

## React (`marketing-mfe`) — R.5.3

Vite production build (`npm run build --workspace=marketing-mfe`), 2026-08-10:

| Asset | Raw | Gzip |
|-------|-----|------|
| `dist/assets/index-*.js` | **264.87 kB** | 82.54 kB |
| `dist/assets/index-*.css` | 4.21 kB | 1.34 kB |
| `dist/index.html` | 0.40 kB | 0.27 kB |

Notes:

- Single client entry (Vite SPA) — React + React DOM + TanStack Query + react-virtual + Zustand in one chunk.
- Soft warn bar for React MFE JS: **300 kB raw** (informational until Next.js Phase 7 splits routes).
- Virtual list + `React.memo`: see [react/perf-profiling.md](./react/perf-profiling.md).
