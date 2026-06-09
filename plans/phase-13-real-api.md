# Phase 13 — Real API integration

> **Теория:** [guides/phase-13-real-api-theory.md](./guides/phase-13-real-api-theory.md) — статус: placeholder  
> **Backend:** ASP.NET [`../todo-platform-backend`](../todo-platform-backend) — pred: **B-03, B-05** complete  
> **Cutover:** [integration-map.md](./integration-map.md)  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 28–31 недели (40–60 ч)  
**Предусловия:** Phase 12, [Phase 17](./phase-17-auth-oidc-keycloak.md), backend B-03 + B-05 в sibling repo  
**Цель:** OpenAPI client → **TodoPlatform.Api**, Keycloak JWT, `environment.useRealApi = true`  
> **Следующий шаг сразу после REST:** [Phase 13-GraphQL](./phase-13-graphql-client.md) + backend [B-10 GraphQL](../../todo-platform-backend/plans/backend-phase-10-complex-sql-readmodels.md).

---

## Результат фазы

- [ ] `HttpTodoRepository` + `HttpAuthRepository`
- [ ] OpenAPI-generated TypeScript client
- [ ] JWT access + refresh rotation
- [ ] RFC 7807 errors в NgRx
- [ ] API versioning header
- [ ] Contract tests against **todo-platform-backend** (Pact provider URL in CI)
- [ ] Cutover checklist from [integration-map.md](./integration-map.md)

### React/Next.js (marketing-mfe)

- [ ] TanStack Query — real API hooks для pricing stats / public metrics
- [ ] `useTodos` или marketing-specific queries с Keycloak Bearer
- [ ] RFC 7807 errors → toast в client components
- [ ] `environment.useRealApi` switch

### Vue 3 (analytics-mfe)

- [ ] Pinia store `stats` — real API `GET /analytics/weekly`
- [ ] Auth interceptor: Keycloak JWT + refresh
- [ ] Chart data from real stats endpoint (не mock)
- [ ] Error boundary + retry на dashboard

---

## Неделя 1 — Contract first

### 13.1.1 OpenAPI spec

Shared contract: [`../../contracts/openapi.yaml`](../../contracts/openapi.yaml) — реализует backend B-02.

### 13.1.2 Codegen

```bash
npm i -D @openapitools/openapi-generator-cli
openapi-generator-cli generate -i contracts/openapi.yaml -g typescript-angular -o libs/api-client
```

### 13.1.3 Repository migration

```typescript
export class HttpTodoRepository implements TodoRepository {
  constructor(private api: TodosApiService) {}
  getAll(userId: string) {
    return from(this.api.getTodos({ userId }));
  }
}
```

### 13.1.4 Feature flag switch

`environment.useRealApi` → provider `HttpTodoRepository` vs `JsonServerTodoRepository`.

---

## Неделя 2 — Authentication (с Keycloak, не custom JWT)

> Токены выдаёт **Keycloak** (Phase 17). Фронт: `angular-oauth2-oidc` / `keycloak-angular`.  
> Бэк: validate JWT via Keycloak JWKS endpoint.

### 13.2.1 Token model

| Token | Источник | Lifetime |
|-------|----------|----------|
| Access | Keycloak | ~5–15m |
| Refresh | offline_access scope | rotation on server |

### 13.2.2 Refresh interceptor

```typescript
if (error.status === 401 && !req.url.includes('/refresh')) {
  return refreshToken().pipe(
    switchMap(() => retry(req)),
  );
}
```

### 13.2.3 Rotation

On refresh success — new refresh token, invalidate old (server-side).

### 13.2.4 Logout

Call `POST /auth/logout` — clear cookies + NgRx reset.

### 13.2.5 NgRx effects update

- `loginSuccess` stores only non-sensitive user profile in store.
- Token **не** в localStorage if httpOnly cookies.

---

## Неделя 3 — API versioning & errors

### 13.3.1 Version header

```typescript
const req = request.clone({
  setHeaders: { 'Accept-Version': 'v2' },
});
```

### 13.3.2 Deprecation handling

Response header `Deprecation: true` → console warn + feature flag fallback UI.

### 13.3.3 Problem Details (RFC 7807)

```typescript
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
```

Map to `loginFailure({ error: problem.title, fieldErrors: problem.errors })`.

### 13.3.4 Form errors

Register: map `errors.email` to form control `setErrors`.

---

## Неделя 4 — Resilience

### 13.4.1 Rate limiting (429)

Interceptor reads `Retry-After` → delay retry.

### 13.4.2 Timeout

`HttpContext` with timeout 10s per request.

### 13.4.3 Circuit breaker (optional)

After 5 failures — stop calls 30s, show maintenance banner.

### 13.4.4 Pact provider verification

Run against staging API in scheduled CI (nightly).

---

## Неделя 5 — SSR + cookies

- Server reads refresh cookie → SSR todos resolver works.
- Update ADR-004 implementation from Phase 7.

---

## Критерии готовности

- [ ] json-server можно отключить полностью
- [ ] Refresh works without user re-login 24h
- [ ] Validation errors show on forms
- [ ] OpenAPI client regenerated in CI when contract changes

---

## Product features (API)

### PF-2.2 Full-text search API (V2)

- [ ] `GET /todos/search?q=`

### PF-2.3 Vector search API (V2) — backend part

- [ ] `POST /search/semantic` — см. [phase-18-ai-features.md](./phase-18-ai-features.md)

### PF-8.1 Attachments (V8)

- [ ] Presigned upload URLs

---

## Стек React / Next.js (marketing-mfe)

> TanStack Query — тот же паттерн, что Phase 3–4 mock; теперь real API. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.13.1 — TanStack Query real API

```bash
npm i @tanstack/react-query --workspace=marketing-mfe
```

**Файл:** `apps/marketing-mfe/src/features/metrics/usePublicStats.ts`

```typescript
export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: () => fetch(`${API_URL}/metrics/public`).then(r => r.json()),
  });
}
```

**Шаги:**
1. `QueryClientProvider` в root layout (client boundary).
2. Bearer token from next-auth session (Phase 17) или public endpoint.
3. RFC 7807: `onError` → toast component.

**Проверка:** Network tab — real `todo-platform-backend` URL.

### R.13.2 — useRealApi switch

**Шаги:**
1. `NEXT_PUBLIC_USE_REAL_API=true` in staging `.env`.
2. MSW disabled when real API on.
3. Pact consumer test for public stats endpoint.

**Критерий:** toggle mock ↔ real without code change.

---

## Стек Vue 3 (analytics-mfe)

### V.13.1 — Pinia real stats API

**Файл:** `apps/analytics-mfe/src/stores/stats.ts`

```typescript
export const useStatsStore = defineStore('stats', () => {
  const weekly = ref<WeeklyStats | null>(null);
  async function fetchWeekly() {
    const res = await api.get('/analytics/weekly');
    weekly.value = res.data;
  }
  return { weekly, fetchWeekly };
});
```

**Шаги:**
1. Replace mock Chart.js data with store fetch on mount.
2. JWT interceptor adds Bearer from keycloak-js (Phase 17).
3. Loading skeleton + error retry UI.

**Проверка:** dashboard shows real numbers from backend B-05.

### V.13.2 — Error handling

**Шаги:**
1. Map RFC 7807 `detail` to user-facing message.
2. `watch` store error → toast via shared composable.
3. E2E: analytics chart renders with real API in CI (testcontainers or mock provider).

**Критерий:** json-server fully disabled for analytics when `VITE_USE_REAL_API=true`.

---

## Следующие фазы

→ **[Phase 13-GraphQL](./phase-13-graphql-client.md)** — сразу после REST (нед 31–33)  
→ [phase-14-multi-tenant.md](./phase-14-multi-tenant.md)  
→ [phase-18-ai-features.md](./phase-18-ai-features.md)
