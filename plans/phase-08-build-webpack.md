# Phase 8 — Build pipeline & Webpack/esbuild

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

### 8.3.3 Webpack Module Federation note

**Файл:** `docs/webpack-vs-esbuild-mf.md`

- If esbuild MF not ready — plan for Phase 9 uses Native Federation.

### 8.3.4 Alias / polyfills (if needed)

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

## Следующая фаза

→ [phase-09-microfrontends.md](./phase-09-microfrontends.md)
