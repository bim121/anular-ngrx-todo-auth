# Perf budget (baseline)

Captured 2026-07-23 (CWV) / 2026-07-28 (bundle) — see [perf/baseline.md](./perf/baseline.md) and [perf/bundle-audit.md](./perf/bundle-audit.md).

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| LCP (Lighthouse `/login`, mobile) | 2.4–2.5 s | &lt; 2.5 s | Borderline / pass |
| LCP (Lighthouse `/todos` @ 1000) | 2.3 s | &lt; 2.5 s | Pass |
| INP (Chrome Performance `/todos`) | 61 ms | &lt; 200 ms | Pass |
| CLS (Chrome Performance + Lighthouse) | 0 | &lt; 0.1 | Pass |
| Initial JS (raw, after cut) | **348.08 kB** (was 468.73) | warn 350 / error 500 | **Pass** |
| Initial JS (transfer est.) | 99.47 kB | — | OK |
| List API→DOM (1 item) | 114 ms | &lt; 100 ms | Fail |
| List API→DOM (1000 items) | 164 ms | &lt; 100 ms | Fail |

Budgets live in `apps/web/project.json`. Treemap: [`docs/perf/bundle-stats.html`](./perf/bundle-stats.html).

Next: memoization / HTTP cache (Phase 5 weeks 4–5).
