# Admin Panel — спецификация (Frontend Phase 14–15)

**Маршрут:** `/admin` (lazy loaded)  
**Guard:** CASL `can('manage', 'Tenant')` — Phase 17  
**Backend:** B-12, B-28 в [`todo-platform-backend`](../../todo-platform-backend)  
**Contract:** [`../../contracts/openapi.yaml`](../../contracts/openapi.yaml) — tag `Admin`

---

## Экраны

### 1. Tenant List (`/admin/tenants`)

| Колонка | Источник |
|---------|----------|
| id, name | `TenantAdminDto` |
| schemaVersion | DB migration state |
| deploymentTrack | blue / green |
| appVersion | pinned frontend version |
| status | active / migrating / error |

**Actions:** row click → detail; bulk select → bulk migrate (Phase 15)

### 2. Tenant Detail (`/admin/tenants/:id`)

- Branding preview (from tenant config)
- Migration history table
- Pending migrations list
- Current track badge (blue/green)
- Buttons: Switch track, Migrate, View audit (Kafka B-16)

### 3. Blue/Green Switch (Phase 15)

- Dropdown or toggle: Move to **Blue** / **Green**
- Confirmation dialog with impact summary
- Optimistic UI → rollback on API error
- Maps to `SwitchTenantTrackCommand`

### 4. Migration Runner (Phase 15)

1. Select target schema version
2. Preview diff (`GetMigrationPlanQuery`) — SQL summary read-only
3. Execute → `ApplyTenantMigrationCommand`
4. Progress via SignalR `MigrationProgressHub`
5. State machine: `pending → running → done | failed`

### 5. Bulk Migrate (Phase 15)

- Checkbox on tenant list
- `BulkApplyMigrationCommand` (Saga B-18)
- Progress per tenant in modal

### 6. Deployment Overview (`/admin/deployment`)

- Global blue vs green versions
- Tenant count per track
- Error rate comparison (from `GetDeploymentStatusQuery`)
- Link to runbooks

---

## Frontend architecture

### Module structure

```
features/admin/
├── data-access/
│   ├── admin.actions.ts      # commands
│   ├── admin.effects.ts
│   ├── admin.reducer.ts
│   ├── admin.selectors.ts    # queries
│   └── admin.facade.ts
├── pages/
│   ├── tenant-list/
│   ├── tenant-detail/
│   └── deployment-overview/
└── admin.routes.ts
```

### Patterns

| Pattern | Implementation |
|---------|----------------|
| CQRS-lite | `AdminFacade` → actions vs selectors |
| Optimistic UI | Switch track immediate, revert on error |
| State machine | Migration job status in reducer |
| Confirmation | Destructive actions require dialog |
| SignalR | `MigrationProgressHub` → effect updates store |

### NgRx example

```typescript
// Command side
adminActions.switchTrack({ tenantId, track: 'green' });

// Query side
adminFacade.tenants(); // signal from selectTenants
adminFacade.migrationStatus(jobId);
```

---

## Optional: GraphQL (Phase 13-GraphQL + B-10, admin fields in B-12)

When `environment.useGraphQL: true`:

| UI action | GraphQL | MediatR |
|-----------|---------|---------|
| Load tenants | `query { adminTenants { ... } }` | `GetTenantsQuery` |
| Switch track | `mutation { switchTenantTrack(...) }` | `SwitchTenantTrackCommand` |

REST admin API (table below) остаётся default.

---

## Backend mapping (REST)

| UI action | HTTP | MediatR |
|-----------|------|---------|
| Load tenants | GET /admin/tenants | `GetTenantsQuery` |
| Load detail | GET /admin/tenants/{id} | `GetTenantByIdQuery` |
| Switch track | POST .../switch-track | `SwitchTenantTrackCommand` |
| Migrate | POST .../migrate | `ApplyTenantMigrationCommand` |
| Bulk migrate | POST .../bulk-migrate | `BulkApplyMigrationCommand` |
| Deployment status | GET /admin/deployment/status | `GetDeploymentStatusQuery` |

---

## Fallback (backend not ready)

json-server mock or static `admin-mock.json` until B-12 complete.  
Feature flag `admin.enabled` + environment `adminApiUrl`.

---

## E2E scenarios (Phase 15)

1. Admin login → tenant list loads
2. Switch tenant A to green → confirm → status updates
3. Run migration v11 → v12 → progress bar → success
4. Bulk migrate 3 tenants → all complete or partial failure UI
5. Deployment overview shows correct counts

---

## ADR

- ADR-021: Admin CQRS-lite on frontend
- ADR-020: Backend admin commands (in backend repo)

---

## Связанные планы

- [phase-14-multi-tenant.md](./phase-14-multi-tenant.md) — Admin v1
- [phase-15-blue-green.md](./phase-15-blue-green.md) — Admin v2
- [integration-map.md](./integration-map.md)
