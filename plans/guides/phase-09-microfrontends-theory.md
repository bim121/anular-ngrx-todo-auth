# Phase 09 — Polyglot Microfrontends (теория)

> **Статус:** placeholder  
> **Практика:** [../phase-09-microfrontends.md](../phase-09-microfrontends.md)  
> **React/Next:** [react-next-faang-theory.md](./react-next-faang-theory.md)  
> **Vue:** [vue-faang-theory.md](./vue-faang-theory.md)

---

## 1. Зачем polyglot MFE

- Team autonomy, independent deploy
- Best tool per surface: Next SSR for marketing, Vue for dashboards, Angular for app core
- Netflix/Spotify/Amazon interview patterns

## 2. Integration patterns

| Pattern | Pros | Cons |
|---------|------|------|
| Native Federation (Angular) | First-class | Angular only |
| Vite Federation (Vue) | Fast HMR | Cross-framework manual |
| Route proxy (Next) | Simple SSR | Edge config |
| Module Federation 2 | Unified | Complex setup |
| single-spa | Framework agnostic | Orchestration overhead |
| iframe | Isolation | UX, perf |

## 3. Cross-cutting concerns

- Auth: shared cookie vs token bridge vs events
- Routing: shell vs remote ownership
- CSS isolation + design tokens
- Version skew / shared dependencies
- Error boundaries per remote

## 4. Interview bank

1. Design Netflix-scale MFE platform
2. How to share auth across React/Vue/Angular?
3. Independent deploy without breaking shell
4. When NOT to use microfrontends

## 5. Связь с multi-stack

- [multi-stack-roadmap.md](../multi-stack-roadmap.md) — marketing-mfe (Next)
- [multi-stack-roadmap.md](../multi-stack-roadmap.md) — analytics-mfe (Vue)
