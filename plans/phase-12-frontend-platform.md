# Phase 12 — Frontend platform & observability

**Длительность:** 26–27 недели (30–40 ч)  
**Предусловия:** Phase 11  
**Цель:** CI/CD previews, Sentry, RUM, PWA, feature flags — production-like frontend ops.

---

## Результат фазы

- [ ] PR preview deploy
- [ ] Sentry error tracking
- [ ] Web Vitals RUM
- [ ] PWA installable
- [ ] Feature flags abstraction
- [ ] OWASP ASVS checklist complete

---

## Неделя 1 — CI/CD

### 12.1.1 GitHub Actions pipeline

```yaml
name: CI
on: [push, pull_request]
jobs:
  build-test:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx nx affected -t lint test build
  e2e:
    needs: build-test
    steps:
      - run: npx playwright test
```

### 12.1.2 Preview deploy

| Platform | Setup |
|----------|-------|
| Vercel / Netlify / Cloudflare Pages | Connect repo, `dist/apps/web/browser` |

- Preview URL per PR comment (bot).
- Environment variables: `API_URL` staging.

### 12.1.3 Production deploy manual

Document: tag `v*` triggers deploy workflow.

---

## Неделя 2 — Observability

### 12.2.1 Sentry Angular

```typescript
import * as Sentry from '@sentry/angular';

provideAppInitializer(() => {
  Sentry.init({ dsn: environment.sentryDsn, ... });
});
```

- ErrorHandler integration.
- Source maps upload (hidden) in CI — `sentry-cli`.

### 12.2.2 Web Vitals RUM

```typescript
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP((metric) => sendToAnalytics(metric));
```

Endpoint: mock `POST /analytics/vitals` in json-server or console in dev.

### 12.2.3 Correlation ID

Link RUM events to `X-Correlation-Id` from interceptor.

### 12.2.4 Dashboard mock

Grafana JSON import optional — or document Datadog mapping for interview stories.

---

## Неделя 3 — Feature flags

### 12.3.1 Interface

```typescript
export interface FeatureFlagService {
  isEnabled(key: string): boolean;
  getVariant<T>(key: string): T;
}
```

### 12.3.2 Implementations

| Impl | Use |
|------|-----|
| `LocalFeatureFlagService` | assets/flags.json |
| `LaunchDarklyMockService` | interview prep |

### 12.3.3 Usage

```html
@if (flags.isEnabled('signal-forms')) {
  <app-login-signal />
}
```

### 12.3.4 NgRx integration

Load flags in `APP_INITIALIZER` → dispatch `loadFlagsSuccess`.

---

## Неделя 4 — PWA

### 12.4.1 Add PWA

```bash
ng add @angular/pwa --project web
```

### 12.4.2 Service worker strategy

- `ngsw-config.json`: assets prefetch, API data freshness for todos (careful with auth).

### 12.4.3 Offline shell

App shell cached; todos network-first.

### 12.4.4 Install prompt

UI banner "Install app" when `beforeinstallprompt`.

---

## Неделя 5 — Security hardening

### 12.5.1 OWASP ASVS SPA

Complete `docs/security-spa-checklist.md`:
- XSS: sanitize user content in todo task (if rich text later)
- CSRF: when cookie auth (Phase 7)
- Clickjacking: X-Frame-Options
- Dependency audit: `npm audit` in CI

### 12.5.2 Rate limit UX

Mock 429 from json-server → toast + retry-after header display.

### 12.5.3 Auth — не здесь, а Phase 17

Полный OIDC + Keycloak + CASL: **[phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md)**.  
В Phase 12 только feature flag `authProvider` и docker-compose ссылка в README.

---

## Portfolio artifacts

- [ ] Live demo URL in README
- [ ] Architecture diagram (C4 container level)
- [ ] Sentry screenshot (sanitized)
- [ ] Lighthouse CI badge

---

## Product features

### PF-7.2 PWA Push (V7)

- [ ] Push subscription mock + notification on todo due

---

## Критерии готовности — FRONTEND OPS COMPLETE

- [ ] PR preview works
- [ ] Sentry catches test error
- [ ] PWA install + offline shell
- [ ] Feature flag toggles UI
- [ ] Ready for **Phase 17 (Keycloak)** and Phase 13 API

---

## Следующие фазы

→ [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md) (**рекомендуется сразу после 12**)  
→ [phase-13-real-api.md](./phase-13-real-api.md)
