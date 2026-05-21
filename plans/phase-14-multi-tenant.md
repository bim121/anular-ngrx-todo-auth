# Phase 14 — Multi-tenant

**Длительность:** 32–35 недели (50–70 ч)  
**Предусловия:** Phase 13, backend supports tenants  
**Цель:** Tenant isolation, config per tenant, migration abstraction.

---

## Результат фазы

- [ ] Tenant resolution (subdomain/header)
- [ ] `tenant` NgRx slice + APP_INITIALIZER
- [ ] Per-tenant branding/config
- [ ] Migration runner interface + docs
- [ ] Isolation test suite
- [ ] ADR-010 data isolation model

---

## Неделя 1 — Tenant identification

### 14.1.1 Resolution strategies

| Strategy | Example | Implementation |
|----------|---------|----------------|
| Subdomain | `acme.app.com` | parse `window.location.hostname` |
| Header | `X-Tenant-Id` | interceptor |
| Path | `/t/acme/todos` | route param |

Pick one primary + document fallback.

### 14.1.2 TenantService

```typescript
@Injectable({ providedIn: 'root' })
export class TenantService {
  readonly tenantId = signal<string | null>(null);
  resolve(): string { ... }
}
```

### 14.1.3 Interceptor

Every API request: `X-Tenant-Id: acme`.

### 14.1.4 Invalid tenant

404 from API → dedicated error page `UnknownTenantComponent`.

---

## Неделя 2 — Tenant config

### 14.2.1 Config endpoint

`GET /tenants/{id}/config`

```json
{
  "branding": { "logoUrl": "...", "primaryColor": "#..." },
  "features": { "todos": true, "export": false },
  "limits": { "maxTodos": 1000 }
}
```

### 14.2.2 NgRx slice

```typescript
interface TenantState {
  id: string;
  config: TenantConfig | null;
  loading: boolean;
}
```

`loadTenantConfig` on APP_INITIALIZER.

### 14.2.3 Dynamic theming

Apply `--color-primary` from tenant config (extends Phase 6 tokens).

### 14.2.4 Feature gating

```typescript
@if (tenantFacade.isFeatureEnabled('export')) {
  <button>Export</button>
}
```

---

## Неделя 3 — Data isolation (concept + tests)

### 14.3.1 ADR-010

Document backend model:

| Model | Isolation | Pros/Cons |
|-------|-----------|-----------|
| DB per tenant | physical | strongest |
| Schema per tenant | logical | medium |
| shared table + tenant_id | row-level | cheapest |

### 14.3.2 Frontend guarantees

- Never send request without tenant header.
- Store keyed by tenant: `localStorage['auth:acme']` if multi-tenant same browser.

### 14.3.3 E2E isolation test

1. Login tenant A → create todo.
2. Switch tenant B (different subdomain mock).
3. Assert todos from A not visible.

---

## Неделя 4 — Migrations abstraction

### 14.4.1 Interface (frontend documents backend)

```typescript
interface MigrationRunner {
  getPending(tenantId: string): Observable<Migration[]>;
  apply(tenantId: string, version: string): Observable<void>;
}
```

### 14.4.2 Admin UI mock (optional)

Internal page `/admin/tenants` — list migration status (read-only from API).

### 14.4.3 Version per tenant

Store `schemaVersion` in tenant config — show warning if client outdated.

---

## Неделя 5 — Shell + MFE tenant propagation

- Shell resolves tenant → passes to remote via `SessionService.tenantId`.
- Remote includes tenant in all API calls.
- Manifest per tenant CDN path: `/tenants/acme/todos/remoteEntry.json`.

---

## Критерии готовности

- [ ] 2 tenants with different branding work
- [ ] Data isolation E2E green
- [ ] ADR-010 published
- [ ] Migration status visible in admin mock

---

## Product features

### PF-10 Workspaces (V10)

- [ ] Sidebar workspace switcher
- [ ] `workspaceId` on todos API
- [ ] Keycloak groups ↔ workspace (Phase 17 mapper)

### PF-4 Admin dashboard (V4)

- [ ] `/admin` route + CASL `manage all`

---

## Следующая фаза

→ [phase-15-blue-green.md](./phase-15-blue-green.md)
