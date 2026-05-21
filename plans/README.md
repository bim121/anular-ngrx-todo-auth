# Планы развития проекта (FAANG Roadmap)

Мастер-обзор: этот README + детальные файлы по фазам.

**Темп:** 18+ месяцев, 5–10 ч/нед. **Приоритет:** глубокий фронт (Phase 0–12), auth/product (17–18), платформа (13–16) после бэка.

**Параллельно:** [parallel-skills-faang.md](./parallel-skills-faang.md)

---

## Два сквозных трека (новое)

| Трек | Файл | Что даёт |
|------|------|----------|
| **Auth & Keycloak** | [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md) | `angular-oauth2-oidc`, **Keycloak**, **CASL** RBAC |
| **Расширение продукта** | [product-features-expansion.md](./product-features-expansion.md) | 10 векторов фич (real-time, kanban, vector search, AI, admin…) |
| **AI / Vector** | [phase-18-ai-features.md](./phase-18-ai-features.md) | Semantic search, NL todos, embeddings |

Фичи из product-roadmap **вплетены** в Phase 3–6, 12–14 — не отдельный «ещё один проект», а рост того же приложения.

---

## Навигация по фазам

| Фаза | Файл | Срок | Фокус |
|------|------|------|-------|
| 0 | [phase-00-foundation.md](./phase-00-foundation.md) | 1–2 нед | Рабочий E2E, починка NgRx |
| 1 | [phase-01-production-core.md](./phase-01-production-core.md) | 3–4 нед | Архитектура, routing, forms |
| 2 | [phase-02-modern-angular.md](./phase-02-modern-angular.md) | 5–6 нед | Signals, zoneless, signal forms |
| 3 | [phase-03-advanced-ngrx.md](./phase-03-advanced-ngrx.md) | 7–8 нед | Entity, optimistic, SignalStore |
| 4 | [phase-04-architecture-patterns.md](./phase-04-architecture-patterns.md) | 9–10 нед | Facades, CQRS-lite, Nx |
| 5 | [phase-05-performance.md](./phase-05-performance.md) | 11–12 нед | Perf, memoization, Web Vitals |
| 6 | [phase-06-design-system.md](./phase-06-design-system.md) | 13–14 нед | DS, Storybook, **Kanban UI** |
| 7 | [phase-07-seo-ssr-i18n.md](./phase-07-seo-ssr-i18n.md) | 15–16 нед | SEO, TransferState, i18n |
| 8 | [phase-08-build-webpack.md](./phase-08-build-webpack.md) | 17–18 нед | Environments, CSP |
| 9 | [phase-09-microfrontends.md](./phase-09-microfrontends.md) | 19–21 нед | Module Federation |
| 10 | [phase-10-electron.md](./phase-10-electron.md) | 22–23 нед | Desktop, offline |
| 11 | [phase-11-testing-quality.md](./phase-11-testing-quality.md) | 24–25 нед | Playwright, Pact |
| 12 | [phase-12-frontend-platform.md](./phase-12-frontend-platform.md) | 26–27 нед | CI/CD, Sentry, PWA |
| **17** | [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md) | **27–30 нед** | **OIDC, Keycloak, CASL** |
| 13 | [phase-13-real-api.md](./phase-13-real-api.md) | 28–31 нед | OpenAPI, API + OIDC tokens |
| 14 | [phase-14-multi-tenant.md](./phase-14-multi-tenant.md) | 32–35 нед | Tenant, workspaces |
| 15 | [phase-15-blue-green.md](./phase-15-blue-green.md) | 36–39 нед | Blue-green |
| 16 | [phase-16-infrastructure.md](./phase-16-infrastructure.md) | 40–52+ нед | Terraform, K8s |
| **18** | [phase-18-ai-features.md](./phase-18-ai-features.md) | **33–36 нед** | **Vector search, NL AI** |

> **Порядок 17 vs 13:** Phase 17 (Keycloak) логично **сразу после 12** — до или параллельно с real API. Phase 13 тогда принимает JWT от Keycloak, не mock. Phase 18 — когда есть API (embeddings/search).

---

## Векторы продукта (кратко)

См. полную матрицу в [product-features-expansion.md](./product-features-expansion.md):

1. **Collaboration** — WebSocket, comments, share links  
2. **Search** — full-text + **vector semantic**  
3. **Productivity** — kanban, calendar, recurring, tags  
4. **Admin** — dashboard, audit log (нужен Phase 17)  
5. **Integrations** — export, webhooks  
6. **Analytics** — charts, goals  
7. **Notifications** — in-app + push  
8. **Files** — attachments  
9. **AI** — NL create, smart tags (Phase 18)  
10. **Workspaces** — teams (Phase 14)  

---

## Рекомендуемый календарь (обновлён)

| Месяц | Фазы + продукт |
|-------|----------------|
| 1 | 0–1 |
| 2–3 | 2 + tags/subtasks (V3) |
| 4–5 | 3 + notifications (V7) |
| 6–7 | 4–5 + WebSocket spike (V1) |
| 8 | 6 + Kanban/calendar (V3) |
| 9 | 7 |
| 10 | 8–9 |
| 11 | 10–11 |
| 12 | 12 + **17 Keycloak** |
| 13–14 | 13 + search (V2) |
| 15 | 14 + workspaces (V10) |
| 16 | **18 AI/vector** + 15 |
| 17–18 | 16 infra + polish portfolio |

---

## Как пользоваться

1. Не переходи к следующей фазе без **критериев готовности**.
2. При прохождении Phase 3–6 — открывай [product-features-expansion.md](./product-features-expansion.md) и бери 1–2 фичи из таблицы.
3. ADR в `docs/adr/` — особенно 011 (auth), 013 (vector).
4. Каждые 2 фазы — пост «What I learned».

---

## Параллельный трек

- Алгоритмы: 2–3 ч/нед → `docs/algo/`
- System design: real-time, vector search, OIDC — из product/auth планов
- Security: Phase 17 + Phase 8 CSP
