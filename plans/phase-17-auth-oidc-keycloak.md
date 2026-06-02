# Phase 17 — Auth libraries, OIDC и Keycloak

> **Теория:** [guides/phase-17-auth-oidc-keycloak-theory.md](./guides/phase-17-auth-oidc-keycloak-theory.md) — статус: placeholder  
> **Backend:** B-05, B-08 — JWT validation в [`../todo-platform-backend`](../todo-platform-backend)

**Длительность:** 28–32 недели (вставка после Phase 12, **до или параллельно** Phase 13)  
**Предусловия:** Phase 11–12, рабочий custom JWT из Phase 0–3  
**Цель:** Профессиональный AuthN/AuthZ стек: `angular-oauth2-oidc` → **Keycloak**, RBAC через **CASL**, готово к enterprise и multi-tenant.

> **Зачем отдельная фаза:** FAANG-level фронт = не «свой JWT в localStorage», а стандартные протоколы (OIDC/OAuth2), библиотеки, роли/claims, SSO, logout everywhere, SSR-safe cookies.

---

## Стек (что учишь)

| Слой | Библиотека | Назначение |
|------|------------|------------|
| **AuthN** (кто ты) | [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc) | OIDC client, PKCE, silent refresh, discovery |
| **AuthN (IdP)** | [Keycloak](https://www.keycloak.org/) + [keycloak-angular](https://github.com/mauricioviggi/keycloak-angular) | Realm, roles, SSO, tenant claims |
| **AuthZ** (что можно) | [@casl/ability](https://casl.js.org/) + `@casl/angular` | Правила: `can('update', todo, { ownerId })` |
| **Guards** | Angular `canActivate`, `canMatch` | Маршруты по ролям |
| **State** | NgRx | Claims в store, синхрон с token |

**Не путать:** Authentication ≠ Authorization. Сначала OIDC login, потом CASL permissions.

---

## Результат фазы

- [ ] Login/logout через OIDC (не ручной POST `/users`)
- [ ] PKCE + silent refresh работают
- [ ] CASL: UI и guards скрывают действия без прав
- [ ] Keycloak в Docker: realm `todo-app`, client SPA
- [ ] Роли: `user`, `admin`, `tenant-admin` в token claims
- [ ] ADR-011: почему oauth2-oidc + Keycloak + CASL
- [ ] E2E: login через Keycloak (test user)

---

## Этап 1 — Теория (3–5 ч, до кода)

### 17.0.1 Протоколы

- [ ] OAuth2: authorization code + **PKCE** (SPA обязательно)
- [ ] OIDC: `id_token` vs `access_token`, `openid-configuration`
- [ ] Scopes: `openid profile email`
- [ ] Refresh token rotation (concept)
- [ ] Logout: RP-initiated logout, `end_session_endpoint`

**Артефакт:** `docs/auth/oauth2-oidc-cheatsheet.md`

### 17.0.2 JWT claims для AuthZ

```json
{
  "sub": "user-uuid",
  "email": "user@acme.com",
  "realm_access": { "roles": ["user"] },
  "tenant_id": "acme",
  "permissions": ["todos:read", "todos:write"]
}
```

---

## Этап 2 — angular-oauth2-oidc (без Keycloak, 1–2 нед)

Цель: привыкнуть к библиотеке на **mock OIDC** (Dex, Authentik или Keycloak сразу — см. этап 4).

### 17.2.1 Установка

```bash
npm i angular-oauth2-oidc
```

### 17.2.2 AuthConfig

**Файл:** `libs/auth/oidc/src/lib/auth.config.ts`

```typescript
export const authConfig: AuthConfig = {
  issuer: environment.oidcIssuer, // https://localhost:8080/realms/todo-app
  redirectUri: window.location.origin + '/auth/callback',
  clientId: 'todo-spa',
  responseType: 'code',
  scope: 'openid profile email offline_access',
  showDebugInformation: !environment.production,
  requireHttps: environment.production,
};
```

### 17.2.3 APP_INITIALIZER

```typescript
export function configureOAuth(oauthService: OAuthService) {
  return () => {
    oauthService.configure(authConfig);
    return oauthService.loadDiscoveryDocumentAndTryLogin();
  };
}
```

### 17.2.4 Callback route

```typescript
{ path: 'auth/callback', component: AuthCallbackComponent },
```

### 17.2.5 Замена AuthService

| Было (json-server) | Стало |
|--------------------|-------|
| `login(email, password)` | `oauthService.initCodeFlow()` или custom login page Keycloak |
| token в store вручную | `oauthService.getAccessToken()`, events `token_received` |

### 17.2.6 NgRx интеграция

**Effect на события OAuth:**

```typescript
oauthService.events.pipe(
  filter(e => e.type === 'token_received'),
  map(() => AuthActions.oidcLoginSuccess({
    user: buildUserFromClaims(oauthService.getIdentityClaims()),
    token: oauthService.getAccessToken(),
  })),
);
```

### 17.2.7 HTTP Interceptor

Использовать `oauthService.getAccessToken()` вместо store (или синхронизировать store ← token).

### 17.2.8 Silent refresh

```typescript
oauthService.setupAutomaticSilentRefresh();
```

**Проверка:** access token истекает → refresh без re-login.

### 17.2.9 Чеклист этапа 2

- [ ] Login redirect → callback → `/todos`
- [ ] Refresh страницы — session восстанавливается
- [ ] Logout очищает tokens + NgRx

---

## Этап 3 — CASL Authorization (1–2 нед)

### 17.3.1 Установка

```bash
npm i @casl/ability @casl/angular
```

### 17.3.2 Ability factory

**Файл:** `libs/auth/authorization/src/lib/ability.factory.ts`

```typescript
export function createAbilityFor(user: UserClaims) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.roles.includes('admin')) {
    can('manage', 'all');
  } else {
    can(['read', 'create'], 'Todo');
    can(['update', 'delete'], 'Todo', { ownerId: user.sub });
  }

  return build();
}
```

### 17.3.3 Provide в app

```typescript
providers: [
  {
    provide: PureAbility,
    useFactory: (store: Store) => {
      const user = /* select user claims */;
      return createAbilityFor(user);
    },
    deps: [Store],
  },
],
```

### 17.3.4 Structural directive

```html
<button *casl="'update'; Todo: todo" (click)="edit()">Edit</button>
```

Или `*appCan="'delete'; subject: 'Todo'; field: todo'"`.

### 17.3.5 Route guards

```typescript
export const canEditTodoGuard: CanActivateFn = (route) => {
  const ability = inject(PureAbility);
  const todo = inject(Store).selectSignal(selectTodoById(route.paramMap.get('id')))();
  return ability.can('update', subject('Todo', todo));
};
```

### 17.3.6 NgRx + CASL

- Selector `selectUserAbility` — пересоздавать ability при смене user/roles.
- **Не дублировать** бизнес-правила в reducer и CASL — single source в `ability.factory.ts`.

### 17.3.7 Тесты

```typescript
it('user cannot delete others todo', () => {
  const ability = createAbilityFor({ sub: '1', roles: ['user'] });
  expect(ability.can('delete', subject('Todo', { ownerId: '2' }))).toBe(false);
});
```

### 17.3.8 Фичи в приложении (видимый AuthZ)

| UI | Правило |
|----|---------|
| Delete todo | `can('delete', todo)` |
| Admin panel route | `can('read', 'AdminPanel')` |
| Export todos | `can('export', 'Todo')` — только admin |

---

## Этап 4 — Keycloak (2–3 нед)

### 17.4.1 Docker Compose

**Файл:** `docker/keycloak-compose.yml`

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.0
    command: start-dev --import-realm
    volumes:
      - ./realm-export:/opt/keycloak/data/import
    ports:
      - "8080:8080"
```

### 17.4.2 Realm export

**Файл:** `docker/realm-export/todo-app-realm.json`

- Client `todo-spa`: public, PKCE S256, valid redirect URIs `http://localhost:4200/*`
- Client `todo-api`: bearer-only (для бэка позже)
- Roles realm: `user`, `admin`, `tenant-admin`
- Test users: `user@test.com`, `admin@test.com`

### 17.4.3 keycloak-angular (опционально vs чистый oauth2-oidc)

**Путь A (рекомендуется):** только `angular-oauth2-oidc` + issuer Keycloak — меньше зависимостей.  
**Путь B:** `keycloak-angular` `KeycloakService` — удобные wrappers, `keycloak.init()`.

```bash
npm i keycloak-angular keycloak-js
```

```typescript
provideKeycloak({
  config: {
    url: 'http://localhost:8080',
    realm: 'todo-app',
    clientId: 'todo-spa',
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  },
});
```

### 17.4.4 Custom claims для tenant (под Phase 14)

Keycloak **Protocol Mapper**:

- `tenant_id` ← user attribute или group name `tenant:acme`
- `permissions` ← client scope script mapper (mock list)

### 17.4.5 Account theme / login (опционально)

- Кастомная тема Keycloak — 1 день spike (Freemarker) — для портфолио «знаю Keycloak».

### 17.4.6 Logout everywhere

```typescript
await keycloak.logout({ redirectUri: window.location.origin + '/login' });
// или oauthService.logOut();
```

### 17.4.7 SSR + Keycloak

- `silent-check-sso.html` в `public/`
- ADR-012: httpOnly cookie bridge для SSR (BFF pattern) — когда API на Phase 13

**BFF spike (карьера):** Express route `/api/auth/token` обменивает code → cookie httpOnly.

---

## Этап 5 — Миграция с mock JWT (1 нед)

### 17.5.1 Feature flag

```typescript
environment.authProvider: 'mock' | 'oidc' | 'keycloak';
```

### 17.5.2 Постепенно

1. `mock` — json-server (Phase 0–12 dev)
2. `oidc` — Keycloak local
3. Production — Keycloak staging realm

### 17.5.3 Удалить небезопасное

- [ ] Пароль в query string json-server — удалить
- [ ] Mock JWT generator в AuthService — удалить после миграции
- [ ] Token только в memory + httpOnly cookie (не localStorage для refresh)

---

## Этап 6 — Тестирование & security

### 17.6.1 Playwright

```typescript
test('login via keycloak', async ({ page }) => {
  await page.goto('/login');
  await page.click('text=Sign in with SSO');
  await page.fill('#username', 'user@test.com');
  // keycloak login form...
});
```

### 17.6.2 OWASP для OIDC

- [ ] PKCE enabled
- [ ] State parameter validated
- [ ] Nonce in id_token
- [ ] HTTPS only prod
- [ ] Short access token TTL

### 17.6.3 Interview stories

Подготовить 3 истории:

1. Почему PKCE для SPA
2. Как CASL vs только `*ngIf="isAdmin"`
3. Keycloak multi-tenant claims

---

## Связь с другими фазами

| Фаза | Связь |
|------|-------|
| Phase 7 SSR | Cookie + silent SSO |
| Phase 13 API | Bearer from oauth, audience `todo-api` |
| Phase 14 Multi-tenant | `tenant_id` claim из Keycloak |
| Phase 15 Blue-green | Keycloak realm version / client version |
| [product-features-expansion.md](./product-features-expansion.md) | Admin panel, audit — нужны роли |

---

## Критерии готовности

- [ ] Dev: `docker compose up keycloak` + `ng serve` → SSO login
- [ ] CASL скрывает delete чужих todos
- [ ] Admin route только для `admin` role
- [ ] Документация ADR-011, ADR-012
- [ ] json-server auth можно отключить (`authProvider: oidc`)

---

## Ресурсы

- [angular-oauth2-oidc docs](https://github.com/manfredsteyer/angular-oauth2-oidc)
- [Keycloak Server Admin](https://www.keycloak.org/docs/latest/server_admin/)
- [CASL Angular guide](https://casl.js.org/v6/en/package/casl-angular)
- OAuth 2.0 for Browser-Based Apps (IETF BCP)

---

## Следующие шаги

→ [phase-13-real-api.md](./phase-13-real-api.md) (API валидирует JWT от Keycloak)  
→ [product-features-expansion.md](./product-features-expansion.md) (фичи, требующие ролей)
