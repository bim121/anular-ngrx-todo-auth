# Perf budget (baseline)

Captured 2026-07-23 (CWV) / 2026-07-28 (bundle) / 2026-07-30 (LHCI + SSR) — see [perf/baseline.md](./perf/baseline.md), [perf/bundle-audit.md](./perf/bundle-audit.md), [perf/hydration.md](./perf/hydration.md), [perf/memory-audit.md](./perf/memory-audit.md).

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
