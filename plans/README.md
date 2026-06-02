# Планы развития проекта (FAANG Roadmap)

Мастер-обзор: этот README + детальные файлы по фазам.

**Темп:** 18+ месяцев, 5–10 ч/нед.  
**Backend (отдельный репо):** [`../todo-platform-backend`](../todo-platform-backend) — разрабатывается **независимо**, фронт подключается по готовности.  
**Интеграция:** [integration-map.md](./integration-map.md)  
**Теория:** [guides/README.md](./guides/README.md)  
**Параллельно:** [parallel-skills-faang.md](./parallel-skills-faang.md)

---

## Dual Track: Frontend + Backend

| Трек | Репозиторий | Планы |
|------|-------------|-------|
| **Frontend** | `anular-ngrx-todo-auth` | `plans/phase-*.md` + `plans/guides/` |
| **Backend** | `todo-platform-backend` | `plans/backend-phase-*.md` + `plans/guides/` |
| **Contract** | `contracts/openapi.yaml` | Shared OpenAPI |

Фронт по умолчанию на **json-server**. Cutover на ASP.NET — Phase 13 (`useRealApi: true`) когда backend B-03, B-05 готовы.

---

## Сквозные треки

| Трек | Файл | Что даёт |
|------|------|----------|
| **Auth & Keycloak** | [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md) | OIDC, Keycloak, CASL |
| **Admin panel** | [admin-panel-spec.md](./admin-panel-spec.md) | Tenants, blue/green, migrations (Phase 14–15) |
| **Расширение продукта** | [product-features-expansion.md](./product-features-expansion.md) | 10 векторов фич |
| **AI / Vector** | [phase-18-ai-features.md](./phase-18-ai-features.md) | Semantic search, NL todos |

---

## Навигация по фазам (frontend)

| Фаза | Файл | Срок | Фокус |
|------|------|------|-------|
| 0 | [phase-00-foundation.md](./phase-00-foundation.md) | 1–2 нед | E2E, NgRx |
| 1 | [phase-01-production-core.md](./phase-01-production-core.md) | 3–4 нед | Архитектура, OpenAPI draft |
| 2 | [phase-02-modern-angular.md](./phase-02-modern-angular.md) | 5–6 нед | Signals, zoneless |
| 3 | [phase-03-advanced-ngrx.md](./phase-03-advanced-ngrx.md) | 7–8 нед | Entity, optimistic |
| 4 | [phase-04-architecture-patterns.md](./phase-04-architecture-patterns.md) | 9–10 нед | Facades, CQRS-lite, HttpRepo stub |
| 5 | [phase-05-performance.md](./phase-05-performance.md) | 11–12 нед | Perf, Web Vitals |
| 6 | [phase-06-design-system.md](./phase-06-design-system.md) | 13–14 нед | DS, Kanban |
| 7 | [phase-07-seo-ssr-i18n.md](./phase-07-seo-ssr-i18n.md) | 15–16 нед | SEO, i18n |
| 8 | [phase-08-build-webpack.md](./phase-08-build-webpack.md) | 17–18 нед | Environments, CSP |
| 9 | [phase-09-microfrontends.md](./phase-09-microfrontends.md) | 19–21 нед | Module Federation |
| 10 | [phase-10-electron.md](./phase-10-electron.md) | 22–23 нед | Desktop |
| 11 | [phase-11-testing-quality.md](./phase-11-testing-quality.md) | 24–25 нед | Playwright, Pact → backend |
| 12 | [phase-12-frontend-platform.md](./phase-12-frontend-platform.md) | 26–27 нед | CI/CD, PWA |
| **17** | [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md) | 27–30 нед | Keycloak + backend B-05 |
| 13 | [phase-13-real-api.md](./phase-13-real-api.md) | 28–31 нед | Cutover на ASP.NET API |
| 14 | [phase-14-multi-tenant.md](./phase-14-multi-tenant.md) | 32–35 нед | Tenant + **Admin v1** |
| 15 | [phase-15-blue-green.md](./phase-15-blue-green.md) | 36–39 нед | Blue-green + **Admin v2** |
| 16 | [phase-16-infrastructure.md](./phase-16-infrastructure.md) | 40–52+ нед | Frontend CDN/MFE deploy |
| **18** | [phase-18-ai-features.md](./phase-18-ai-features.md) | 33–36 нед | Vector search |

> **Порядок 17 vs 13:** Phase 17 до или параллельно Phase 13. Backend: [`../todo-platform-backend/plans/integration-sync.md`](../todo-platform-backend/plans/integration-sync.md)

---

## Календарь (frontend + backend sync)

| Месяц | Frontend | Backend | Cutover |
|-------|----------|---------|---------|
| 1 | 0–1 | — | OpenAPI in `contracts/` |
| 2–3 | 2–3 | B-00 → B-02 | — |
| 4–5 | 4–5 | B-03 → B-08 | HttpTodoRepository stub |
| 12 | 12 + 17 | B-05 + B-12 | Keycloak |
| 13–14 | **13** | B-17 | `useRealApi: true` |
| 15–16 | 14–15 Admin | B-12, B-28 | Admin panel |
| 18+ | 16 CDN | B-20 → B-31 | Full stack |

---

## Как пользоваться

1. **Практика** — `phase-XX.md`; **теория** — `guides/phase-XX-*-theory.md`.
2. Запроси наполнение теории: *«Напиши теорию для Phase 3»*.
3. Backend теория (CQRS): [`../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md`](../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md) — **full**.
4. Не переходи к следующей фазе без критериев готовности.
5. ADR в `docs/adr/`.

---

## Параллельный трек

- Алгоритмы → `docs/algo/`
- Frontend + **Backend** system design → [parallel-skills-faang.md](./parallel-skills-faang.md)
- Security: Phase 17 + Phase 8 CSP
