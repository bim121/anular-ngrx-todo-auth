# Phase 8 — Build pipeline & Webpack/esbuild
> **Теория:** [guides/phase-08-build-webpack-theory.md](./guides/phase-08-build-webpack-theory.md) — статус: placeholder  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 17–18 недели (30–40 ч)  
**Предусловия:** Phase 7  
**Цель:** Multi-env builds, documented build graph, CSP on SSR, bundle CI.

---

## Результат фазы

- [ ] `environment.ts` dev/staging/prod
- [ ] File replacements в angular.json
- [ ] Build documentation
- [ ] CSP + helmet on Express
- [ ] Custom esbuild plugin spike (documented)

### React/Next.js (marketing-mfe)

- [ ] `next.config.ts` — env `NEXT_PUBLIC_*`, remote image domains, `output: 'standalone'` (опционально)
- [ ] `@next/bundle-analyzer` — CI artifact stats
- [ ] CSP headers в `next.config.ts` `headers()` или middleware
- [ ] `environment.staging.ts` / `.env.production` — apiUrl, siteUrl

### Vue 3 (analytics-mfe)

- [ ] `vite.config.ts` — `define`, `envPrefix: 'VITE_'`, federation build target
- [ ] `.env.staging` / `.env.production` — `VITE_API_URL`, `VITE_TENANT_ID`
- [ ] CSP-compatible build: no inline scripts без nonce (Vite default OK)
- [ ] `rollup-plugin-visualizer` — bundle report в CI

---

## Неделя 1 — Environments

### 8.1.1 Files

```
libs/shared/config/
  src/
    environment.ts
    environment.staging.ts
    environment.prod.ts
```

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  siteUrl: 'http://localhost:4200',
  enableMockApi: true,
  tenantId: 'default',
};
```

### 8.1.2 angular.json configurations

```json
"configurations": {
  "development": { "optimization": false },
  "staging": {
    "fileReplacements": [{
      "replace": "libs/shared/config/src/environment.ts",
      "with": "libs/shared/config/src/environment.staging.ts"
    }]
  },
  "production": { ... }
}
```

### 8.1.3 Inject in app

`{ provide: APP_CONFIG, useValue: environment }`

Replace hardcoded URLs in repositories.

---

## Неделя 2 — Build analysis

### 8.2.1 Document build graph

**Файл:** `docs/build-pipeline.md`

- esbuild (Angular 21 application builder) stages.
- Where SSR bundle is produced.
- Server vs browser bundles.

### 8.2.2 CI artifact

```bash
ng build --configuration production --stats-json
```

Upload `stats.json` as GitHub Actions artifact.

### 8.2.3 Define flags

```typescript
// esbuild define in custom config if needed
define: {
  'import.meta.env.ENABLE_MOCK_API': 'true',
}
```

---

## Неделя 3 — Custom builder spike

### 8.3.1 Evaluate options (Angular 21)

| Tool | Status |
|------|--------|
| `@angular-builders/custom-esbuild` | check compatibility |
| `ngx-build-plus` | webpack fallback |

### 8.3.2 Minimal custom plugin

Example: log bundle size plugin or inject build timestamp into `index.html`.

### 8.3.3 Polyglot build prep (Phase 9)

- [ ] Env schema для shell + todos + admin + **marketing-mfe (Next)** + **analytics-mfe (Vue)**
- [ ] CSP: allow remote origins from `mf-manifest.json`
- [ ] `docs/webpack-vs-esbuild-mf.md` — Native Federation (Angular) vs Vite federation (Vue) vs Next proxy

### 8.3.4 Webpack Module Federation note

**Файл:** `docs/webpack-vs-esbuild-mf.md`

- If esbuild MF not ready — plan for Phase 9 uses Native Federation.

### 8.3.5 Alias / polyfills (if needed)

Only if supporting legacy browser — document decision to drop IE.

---

## Неделя 4 — Security headers

### 8.4.1 helmet on server.ts

```typescript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      ...
    },
  },
}));
```

### 8.4.2 CSP nonce for inline

- Angular SSR nonce support — follow Angular 21 docs.
- Test: no console CSP violations.

### 8.4.3 SRI for external scripts

If CDN used — `integrity` attribute.

### 8.4.4 OWASP SPA checklist

**Файл:** `docs/security-spa-checklist.md` — mark items done.

---

## Критерии готовности

- [ ] `ng build -c staging` uses staging API URL
- [ ] CSP blocks inline script without nonce
- [ ] `docs/build-pipeline.md` complete
- [ ] CI stores bundle stats

---

## Стек React / Next.js (marketing-mfe)

> Env и CSP для всех apps — единая схема в `libs/shared/config`. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.8.1 — next.config.ts

**Файл:** `apps/marketing-mfe/next.config.ts`

```typescript
const nextConfig = {
  env: {
    API_URL: process.env.API_URL,
  },
  images: { remotePatterns: [{ hostname: 'cdn.example.com' }] },
};
```

**Шаги:**
1. `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` в `.env.*`.
2. `@next/bundle-analyzer` — `ANALYZE=true npm run build`.
3. Staging build: `nx build marketing-mfe --configuration=staging`.

**Проверка:** built bundle использует staging API URL.

### R.8.2 — CSP headers (Next)

```typescript
// next.config.ts headers()
{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'nonce-...'" }
```

**Шаги:**
1. Разрешить shell origin для federated embed (Phase 9).
2. `connect-src` включает API + json-server dev.
3. Тест: no CSP violations в console на `/pricing`.

**Критерий:** OWASP SPA checklist — Next section complete.

---

## Стек Vue 3 (analytics-mfe)

### V.8.1 — vite.config env

**Файл:** `apps/analytics-mfe/vite.config.ts`

```typescript
export default defineConfig({
  envPrefix: 'VITE_',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
```

**Шаги:**
1. `.env.development`, `.env.staging`, `.env.production` — `VITE_API_URL`.
2. `import.meta.env.VITE_API_URL` в fetch composables.
3. Federation `build.target: 'esnext'` для remoteEntry.

**Проверка:** `nx build analytics-mfe -c staging` — правильный API host.

### V.8.2 — CSP и bundle CI

**Шаги:**
1. `rollup-plugin-visualizer` → `dist/stats.html` artifact в GitHub Actions.
2. CSP: remote загружается shell — document `script-src` allowlist в shell (Phase 8.4).
3. No eval in production build (`build.minify: 'esbuild'`).

**Критерий:** bundle stats uploaded; CSP test green при embed в shell stub.

---

## Следующая фаза

→ [phase-09-microfrontends.md](./phase-09-microfrontends.md)


