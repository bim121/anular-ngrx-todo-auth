# Perf budget (baseline)

Captured 2026-07-23 — see [perf/baseline.md](./perf/baseline.md) for method and screenshots.

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| LCP (Lighthouse `/login`, mobile) | 2.4–2.5 s | &lt; 2.5 s | Borderline / pass |
| LCP (Lighthouse `/todos` @ 1000) | 2.3 s | &lt; 2.5 s | Pass |
| INP (Chrome Performance `/todos`) | 61 ms | &lt; 200 ms | Pass |
| CLS (Chrome Performance + Lighthouse) | 0 | &lt; 0.1 | Pass |
| Initial JS (raw) | 444.78 kB | document (plan ~350 warn) | Over warn band |
| Initial JS (transfer est.) | 125.58 kB | — | OK-ish |
| List API→DOM (1 item) | 114 ms | &lt; 100 ms | Fail |
| List API→DOM (1000 items) | 164 ms | &lt; 100 ms | Fail |

Next optimizations (Phase 5 weeks 2–3): CDK virtual scroll, lighter stats for large N, bundle budgets, RxJS/tree-shaking.
