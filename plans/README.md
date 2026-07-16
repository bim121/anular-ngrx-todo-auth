# Планы развития проекта (FAANG Roadmap)

Мастер-обзор: этот README + детальные файлы по фазам.

**Темп:** 18+ месяцев, 5–10 ч/нед.  
**Три стека в каждой фазе:** Angular (core) + **React/Next.js** (`marketing-mfe`) + **Vue 3** (`analytics-mfe`) — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)  
**Backend:** [`../todo-platform-backend`](../todo-platform-backend) (.NET) + [`../todo-platform-java`](../todo-platform-java) (Java) — независимо, cutover Phase 13.  
**Интеграция:** [integration-map.md](./integration-map.md) | **MFE:** [polyglot-mfe-architecture.md](./polyglot-mfe-architecture.md)

---

## Dual Track: Frontend + Backend

| Трек | Репозиторий | Планы |
|------|-------------|-------|
| **Frontend (3 stacks)** | `anular-ngrx-todo-auth` | `plans/phase-*.md` — в каждом Angular + React/Next + Vue |
| **Backend (.NET)** | `todo-platform-backend` | `plans/backend-phase-*.md` — B-00…B-33 |
| **Backend (Java)** | `todo-platform-java` | `plans/java-phase-*.md` — **J-00…J-33** (паритет с .NET) |
| Contract | [`../../contracts/openapi.yaml`](../../contracts/openapi.yaml) | + [`graphql/schema.graphql`](../../contracts/graphql/schema.graphql) |

Стек-маппинг: [stack-equivalents.md](../todo-platform-java/plans/stack-equivalents.md)

---

## Сквозные треки

| Трек | Файл |
|------|------|
| **Multi-stack matrix** | [multi-stack-roadmap.md](./multi-stack-roadmap.md) |
| Auth & Keycloak (все стеки) | [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md) |
| Polyglot MFE (Phase 9) | [polyglot-mfe-architecture.md](./polyglot-mfe-architecture.md) |
| GraphQL (Phase 13g) | [phase-13-graphql-client.md](./phase-13-graphql-client.md) |
| Admin panel | [admin-panel-spec.md](./admin-panel-spec.md) |
| Product vectors | [product-features-expansion.md](./product-features-expansion.md) |
| **AWS certs (backend)** | [aws-cert-track.md](../todo-platform-backend/plans/aws-cert-track.md) |
| **RAG / Agents** | [phase-19](./phase-19-rag-chat-ui.md), [phase-20](./phase-20-ai-agents-mcp-ui.md) |

---

## Навигация по фазам (Angular + React/Next + Vue)

| Фаза | Файл | Срок | Angular | React/Next | Vue 3 |
|------|------|------|---------|------------|-------|
| 0 | [phase-00](./phase-00-foundation.md) | 1–2 | NgRx, json-server | monorepo slot | Vite hello |
| 1 | [phase-01](./phase-01-production-core.md) | 3–4 | core/features | feature folders | Pinia stub |
| 2 | [phase-02](./phase-02-modern-angular.md) | 5–6 | Signals | Hooks | ref/reactive |
| 3 | [phase-03](./phase-03-advanced-ngrx.md) | 7–8 | Entity, optimistic | TanStack Query | Pinia CRUD |
| 4 | [phase-04](./phase-04-architecture-patterns.md) | 9–10 | Facades | useTodos hook | composables |
| 5 | [phase-05](./phase-05-performance.md) | 11–12 | Virtual scroll | react-virtual | charts spike |
| 6 | [phase-06](./phase-06-design-system.md) | 13–14 | DS, Kanban | shadcn/ui | dashboard |
| 7 | [phase-07](./phase-07-seo-ssr-i18n.md) | 15–16 | Angular SSR | **Next SSR** | Nuxt ADR |
| 8 | [phase-08](./phase-08-build-webpack.md) | 17–18 | env, CSP | next.config | vite.config |
| 9 | [phase-09](./phase-09-microfrontends.md) | 19–25 | 2× Angular MF | Next remote | Vue remote |
| 10 | [phase-10](./phase-10-electron.md) | 22–23 | Electron | doc only | doc only |
| 11 | [phase-11](./phase-11-testing-quality.md) | 24–25 | Playwright | Vitest RTL | Vitest Vue |
| 12 | [phase-12](./phase-12-frontend-platform.md) | 26–27 | CI/PWA | marketing CI | analytics CI |
| **17** | [phase-17](./phase-17-auth-oidc-keycloak.md) | 27–30 | keycloak-angular | next-auth | keycloak-js |
| **13** | [phase-13](./phase-13-real-api.md) | 28–30 | HttpRepo | TanStack real API | Pinia stats |
| **13g** | [phase-13-graphql](./phase-13-graphql-client.md) | 31–33 | Apollo | Apollo React | Apollo Vue |
| 14 | [phase-14](./phase-14-multi-tenant.md) | 32–35 | admin-mfe | middleware | interceptor |
| 15 | [phase-15](./phase-15-blue-green.md) | 36–39 | manifest | CDN slot | CDN slot |
| 16 | [phase-16](./phase-16-infrastructure.md) | 40–52+ | shell CDN | deploy Next | deploy Vue |
| **18** | [phase-18](./phase-18-ai-features.md) | 33–36 | AI UI semantic | Vercel AI | composable |
| **19** | [phase-19](./phase-19-rag-chat-ui.md) | 37–39 | **RAG chat** + citations | SSE/Vercel AI | optional insights |
| **20** | [phase-20](./phase-20-ai-agents-mcp-ui.md) | 40–42 | **Agents + HITL** | optional | optional |
| **21** | [phase-21](./phase-21-frontend-aws-observability.md) | 43–45 | CloudFront + RUM | AWS hosting | — |

> **Порядок:** Phase 17 ∥ Phase 13. Phase 13g после REST. Phase 18 → 19 → 20 (AI). Phase 21 после B-34. Observability backend: **B-24** (Grafana/Loki/Prometheus/Promtail). AWS certs: [aws-cert-track.md](../todo-platform-backend/plans/aws-cert-track.md).

---

## Календарь (frontend + backend)

| Месяц | Frontend (3 stacks) | Backend |
|-------|---------------------|---------|
| 1 | 0–1: monorepo + 3 apps scaffold | — |
| 2–3 | 2–3: state во всех стеках | B-00 → B-02 |
| 4–5 | 4–5: architecture | B-03 → B-08 |
| 6–7 | 6–7: DS + **Next SSR** + Vue dashboard | B-09 → B-10 GraphQL |
| 8–9 | 8–9: **Polyglot MFE** | B-08 |
| 12 | 12 + 17: Keycloak **все стеки** | B-05, B-12 |
| 13–14 | 13 REST → 13g GraphQL **все стеки** | B-17 gRPC |
| 15–16 | 14–15 Admin | B-12, B-28 |
| 18+ | 16 CDN 4 remotes | B-20 → B-33 | J-20 → J-33 |
| 20+ | **18–20 AI** (vector→RAG→agents) | **B-29, B-36–37** | J-29, J-36–37 |
| 22+ | **21 FE AWS** | **B-34–35, B-38** | J-34–38 |

---

## Как пользоваться

1. Открывай `phase-XX.md` — три секции: **Angular**, **Стек React/Next.js**, **Стек Vue 3**.
2. Не переходи к следующей фазе без критериев **всех стеков** (Phase 10 — Vue/React doc-only).
3. Теория: `guides/phase-XX-*-theory.md` + [react-next-faang-theory.md](./guides/react-next-faang-theory.md) + [vue-faang-theory.md](./guides/vue-faang-theory.md).
4. Backend CQRS: [`b-00-architecture-and-cqrs-theory.md`](../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md).

---

## Параллельный трек

- Алгоритмы → `docs/algo/`
- System design → [parallel-skills-faang.md](./parallel-skills-faang.md)
- Security: Phase 17 + Phase 8 CSP (все apps)
