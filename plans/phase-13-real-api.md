# Phase 13 — Real API integration

> **Теория:** [guides/phase-13-real-api-theory.md](./guides/phase-13-real-api-theory.md) — статус: placeholder  
> **Backend:** ASP.NET [`../todo-platform-backend`](../todo-platform-backend) — pred: **B-03, B-05** complete  
> **Cutover:** [integration-map.md](./integration-map.md)

**Длительность:** 28–31 недели (40–60 ч)  
**Предусловия:** Phase 12, [Phase 17](./phase-17-auth-oidc-keycloak.md), backend B-03 + B-05 в sibling repo  
**Цель:** OpenAPI client → **TodoPlatform.Api**, Keycloak JWT, `environment.useRealApi = true`

---

## Результат фазы

- [ ] `HttpTodoRepository` + `HttpAuthRepository`
- [ ] OpenAPI-generated TypeScript client
- [ ] JWT access + refresh rotation
- [ ] RFC 7807 errors в NgRx
- [ ] API versioning header
- [ ] Contract tests against **todo-platform-backend** (Pact provider URL in CI)
- [ ] Cutover checklist from [integration-map.md](./integration-map.md)

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

## Следующие фазы

→ [phase-14-multi-tenant.md](./phase-14-multi-tenant.md)  
→ [phase-18-ai-features.md](./phase-18-ai-features.md)
