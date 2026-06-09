# Phase 14 — Multi-tenant

> **Теория:** [guides/phase-14-multi-tenant-theory.md](./guides/phase-14-multi-tenant-theory.md) — статус: placeholder  
> **Backend:** B-11, B-12 — [`../todo-platform-backend`](../todo-platform-backend)  
> **Admin UI:** [admin-panel-spec.md](./admin-panel-spec.md) — **Admin v1 (обязательно)**  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 32–35 недели (50–70 ч)  
**Предусловия:** Phase 13, [Phase 13-GraphQL](./phase-13-graphql-client.md) (рекомендуется), backend supports tenants  
**Цель:** Tenant isolation, config per tenant, migration abstraction. Admin v1 может использовать GraphQL (`useGraphQL`) для tenant list.

---

## Результат фазы

- [ ] Tenant resolution (subdomain/header)
- [ ] `tenant` NgRx slice + APP_INITIALIZER
- [ ] Per-tenant branding/config
- [ ] Migration runner interface + docs
- [ ] Isolation test suite
- [ ] ADR-010 data isolation model

### React/Next.js (marketing-mfe)

- [ ] `middleware.ts` — tenant resolution (subdomain / header)
- [ ] `X-Tenant-Id` на server-side fetch и Apollo authLink
- [ ] Per-tenant branding в layout (CSS variables from tenant config)

### Vue 3 (analytics-mfe)

- [ ] Fetch interceptor — `X-Tenant-Id` на все API/GraphQL calls
- [ ] Pinia `tenant` store synced from shell `SESSION_CONTRACT`
- [ ] Tenant switch E2E with analytics chart reload

### admin-mfe (Angular)

- [ ] Tenant list + detail UI (Admin v1) — primary owner of tenant admin
- [ ] GraphQL `adminTenants` when `useGraphQL`

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

### 14.4.2 Admin UI v1 (обязательно)

См. [admin-panel-spec.md](./admin-panel-spec.md):

- [ ] Lazy route `/admin` + `AdminLayoutComponent`
- [ ] `AdminFacade` + NgRx slice `admin`
- [ ] Tenant list: schemaVersion, track (blue/green), status
- [ ] Tenant detail + pending migrations
- [ ] Backend когда B-12 готов, иначе json-server admin mock
- [ ] ADR-021: Admin CQRS-lite

### 14.4.3 Version per tenant

Store `schemaVersion` in tenant config — show warning if client outdated.

---

## Неделя 5 — Shell + MFE tenant propagation

- Shell resolves tenant → passes to **all 4 remotes** via `SessionService` / cookie / manifest.
- Angular remotes: `SESSION_CONTRACT.tenantId`.
- Next middleware: read `X-Tenant-Id` header.
- Vue: fetch interceptor tenant header.
- Manifest per tenant CDN: `/tenants/acme/mf-manifest.json` (all remote URLs).

---

## Критерии готовности

- [ ] 2 tenants with different branding work
- [ ] Data isolation E2E green
- [ ] ADR-010 published
- [ ] Admin v1 live (tenant list + detail)
- [ ] Migration status visible in admin (not mock-only)

---

## Product features

### PF-10 Workspaces (V10)

- [ ] Sidebar workspace switcher
- [ ] `workspaceId` on todos API
- [ ] Keycloak groups ↔ workspace (Phase 17 mapper)

### PF-4 Admin dashboard (V4)

- [ ] `/admin` route + CASL `manage all`

---

## Стек React / Next.js (marketing-mfe)

> Tenant в Next middleware — server-side resolution до render. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.14.1 — middleware.ts tenant

**Файл:** `apps/marketing-mfe/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const tenantId = host.split('.')[0]; // acme.app.com → acme
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenantId);
  return response;
}
```

**Шаги:**
1. Fallback: `X-Tenant-Id` header from shell proxy.
2. Invalid tenant → redirect `/unknown-tenant`.
3. Server components read tenant via `headers()`.

**Проверка:** `acme.localhost:3001/pricing` — acme branding color.

### R.14.2 — Tenant config fetch

**Шаги:**
1. `GET /tenants/{id}/config` in layout server component.
2. Apply `--color-primary` from config to `:root`.
3. Apollo authLink adds `X-Tenant-Id`.

**Критерий:** two tenants show different logos on `/pricing`.

---

## Стек Vue 3 (analytics-mfe)

### V.14.1 — Fetch interceptor

**Файл:** `apps/analytics-mfe/src/core/api.ts`

```typescript
api.interceptors.request.use((config) => {
  const tenantId = useTenantStore().tenantId;
  config.headers['X-Tenant-Id'] = tenantId;
  return config;
});
```

**Шаги:**
1. Listen `window` event `tenant:changed` from shell.
2. Reload stats on tenant switch.
3. localStorage key `auth:{tenantId}` if multi-tenant same browser.

**Проверка:** E2E tenant A stats ≠ tenant B stats.

---

## admin-mfe (Angular)

### A.14.1 — Admin v1 tenant UI

**Route:** `/admin/tenants`, `/admin/tenants/:id`

**Шаги:**
1. `AdminFacade` + NgRx `admin` slice.
2. Tenant list: schemaVersion, track, status (blue/green prep).
3. CASL: only `tenant-admin` / `admin` roles (Phase 17).

**Критерий:** admin-mfe loads in shell; tenant CRUD mock until B-12.

---

## Следующая фаза

→ [phase-15-blue-green.md](./phase-15-blue-green.md)
