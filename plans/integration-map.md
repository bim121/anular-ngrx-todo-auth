# Integration Map — Frontend ↔ Backend

Backend: [`../../todo-platform-backend`](../../todo-platform-backend) (независимая разработка)  
Backend sync: [`../../todo-platform-backend/plans/integration-sync.md`](../../todo-platform-backend/plans/integration-sync.md)  
Contract: [`../../contracts/openapi.yaml`](../../contracts/openapi.yaml)

---

## Принцип

Фронт **не ждёт** бэк. По умолчанию — `json-server`. Подключение через **feature flags** когда backend-фаза готова.

```typescript
// environment.ts (пример)
export const environment = {
  useRealApi: false,        // Phase 13 → true когда B-03, B-05 готовы
  useKeycloak: false,       // Phase 17 → true когда B-05, B-08
  useRealTime: false,       // Phase 4–5 spike → B-13
  useBackendSearch: false,  // Phase 13+ → B-15
  admin: { enabled: false } // Phase 14–15 → B-12, B-28
};
```

---

## Матрица интеграции

| Момент | Frontend | Backend ready | Что подключаем | Flag |
|--------|----------|---------------|----------------|------|
| Контракт | Phase 1 нед 4 | — | `../../contracts/openapi.yaml` draft | — |
| Repository skeleton | Phase 4 | — | `HttpTodoRepository` stub | `useRealApi: false` |
| Pact tests | Phase 11 | B-02+ | Provider = backend URL | CI only |
| Auth cutover | Phase 17 | B-05, B-08 | Keycloak JWT → API | `useKeycloak: true` |
| Todos CRUD | Phase 13 | B-03, B-05 | Full HttpTodoRepository | `useRealApi: true` |
| WebSocket / realtime | Phase 4–5 | B-13 | SignalR hub | `useRealTime: true` |
| Search | Phase 13+ | B-15 | `GET /search` | `useBackendSearch: true` |
| Multi-tenant | Phase 14 | B-11 | `X-Tenant-Id`, config API | when real API |
| Admin panel v1 | Phase 14 | B-12 | Tenant list, migrations view | `admin.enabled` |
| Admin panel v2 | Phase 15 | B-12, B-28 | Blue/green switch, migrate | `admin.enabled` |
| Attachments | Phase 13 | B-14 | Presigned upload | per feature |
| AI / Vector | Phase 18 | B-29 | Semantic search | per feature |

---

## CQRS mapping (Phase 4 ↔ B-03)

| Frontend Facade | Backend MediatR |
|-----------------|-----------------|
| `TodosFacade.add()` | `CreateTodoCommand` |
| `TodosFacade.load()` | `GetTodosQuery` |
| `TodosFacade.update()` | `UpdateTodoCommand` |
| `TodosFacade.remove()` | `DeleteTodoCommand` |
| `AdminFacade.switchTrack()` | `SwitchTenantTrackCommand` |
| `AdminFacade.migrateTenant()` | `ApplyTenantMigrationCommand` |
| `selectAllTodos` | `GetTodosQuery` result |
| `selectTenants` | `GetTenantsQuery` result |

Теория: [`../../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md`](../../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md)

---

## Product features → Backend

| Vector | Frontend phase | Backend phase | API / infra |
|--------|----------------|---------------|-------------|
| V1 Collaboration | 4–5 | B-13 | SignalR hub |
| V2 Search | 5, 13 | B-15, B-29 | `/search`, semantic |
| V3 Kanban | 6 | B-01, B-09 | `PATCH /todos/:id/status` |
| V4 Admin | 14, 17 | B-12, B-16 | `/admin/*`, Kafka audit |
| V5 Webhooks | 13 | B-07, B-16 | Event dispatcher |
| V8 Files | 13 | B-14 | Presigned Blob |
| V9 AI | 18 | B-29 | Embeddings |
| V10 Workspaces | 14 | B-11 | Tenant + workspace |

---

## Admin API

Полная спека UI: [admin-panel-spec.md](./admin-panel-spec.md)

```
GET    /admin/tenants
GET    /admin/tenants/{id}
GET    /admin/tenants/{id}/migrations
POST   /admin/tenants/{id}/switch-track
POST   /admin/tenants/{id}/migrate
POST   /admin/tenants/bulk-migrate
GET    /admin/deployment/status
```

---

## Cutover checklist (Phase 13)

- [ ] Backend B-03 CQRS endpoints работают
- [ ] Backend B-05 валидирует Keycloak JWT (или mock до Phase 17)
- [ ] `contracts/openapi.yaml` синхронизирован
- [ ] Pact tests green (Phase 11)
- [ ] `environment.useRealApi = true` в staging
- [ ] Smoke: login → todos CRUD → logout
- [ ] Rollback plan: flip flag обратно на json-server
