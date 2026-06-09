# Phase 9 — Polyglot Microfrontends (2× Angular + Next + Vue)

> **Теория:** [guides/phase-09-microfrontends-theory.md](./guides/phase-09-microfrontends-theory.md)  
> **Архитектура:** [polyglot-mfe-architecture.md](./polyglot-mfe-architecture.md)  
> **Multi-stack:** Angular + React/Next + Vue — **все стеки сходятся в этой фазе**; подготовка с Phase 0–8, см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 6–7 недель (60–80 ч)  
**Предусловия:** Phase 8; **Phase 7** (Next scaffold), **Phase 5–6** (Vue analytics spike) — подготовка уже сделана  
**Цель:** Shell host + **4 remotes**: 2 Angular + 1 Next.js + 1 Vue; independent deploy; shared auth contract.

---

## Зачем polyglot сейчас, а не «один Angular»

| Remote | Stack | Зачем отдельный фреймворк |
|--------|-------|---------------------------|
| todos-mfe | Angular | NgRx, Kanban — core product |
| admin-mfe | Angular | CASL, admin CQRS-lite — Phase 14 |
| marketing-mfe | **Next.js** | SSR/SEO — payoff Phase 7 |
| analytics-mfe | **Vue 3** | Charts dashboard — payoff Phase 5–6 |

> **FAANG:** Netflix/Spotify polyglot MFE — interview case. Ты не «знаешь один фреймворк», а **архитектор платформы**.

---

## Результат фазы

- [ ] `apps/shell` + `todos-mfe` + `admin-mfe` (Angular Native Federation)
- [ ] `apps/marketing-mfe` (Next.js 15 App Router)
- [ ] `apps/analytics-mfe` (Vue 3 + Vite federation)
- [ ] `libs/shared/auth-contract` — JWT, tenantId, `auth:logout` event
- [ ] `libs/shared/design-tokens` — CSS variables для всех 4
- [ ] `mf-manifest.json` — runtime URLs all remotes
- [ ] ADR-005 cross-MFE communication
- [ ] ADR-009 polyglot integration strategy
- [ ] Fallback UI when any remote fails
- [ ] Playwright E2E: shell → todos, admin stub, `/`, `/analytics`

---

## Неделя 1 — Workspace & 2 Angular remotes

### 9.1.1 Apps layout

```
apps/
  shell/              # Angular host — auth, layout, manifest loader
  todos-mfe/          # Angular — /todos/*
  admin-mfe/          # Angular — /admin/* (stub routes)
  marketing-mfe/      # Next.js — /, /pricing, /docs
  analytics-mfe/      # Vue 3 — /analytics
libs/shared/
  auth-contract/
  design-tokens/
```

### 9.1.2 Move from monolith

| From | To |
|------|-----|
| auth + layout | shell |
| todos feature | todos-mfe |
| admin placeholder routes | admin-mfe (empty tenant list → Phase 14) |

### 9.1.3 Native Federation — todos-mfe

```bash
npm i @angular-architects/native-federation -D
```

**todos-mfe federation.config.js:**
```javascript
module.exports = withNativeFederation({
  name: 'todos',
  exposes: { './Routes': './apps/todos-mfe/src/app/remote.routes.ts' },
  shared: { ...shareAll({ singleton: true, strictVersion: true }) },
});
```

### 9.1.4 admin-mfe (Angular #2)

Same federation setup, exposes `./AdminRoutes`:

```typescript
// admin-mfe/remote.routes.ts — stub
{ path: '', component: AdminPlaceholderComponent }
```

Full Admin v1 → [Phase 14](./phase-14-multi-tenant.md).

### 9.1.5 Shell routes

```typescript
{
  path: 'todos',
  loadChildren: () => loadRemoteModule('todos', './Routes'),
},
{
  path: 'admin',
  loadChildren: () => loadRemoteModule('admin', './AdminRoutes'),
},
```

---

## Неделя 2 — Angular state & auth bridge

### 9.2.1 SessionService (shared contract)

```typescript
// libs/shared/auth-contract/src/session.contract.ts
export interface SessionContract {
  userId: Signal<string | null>;
  tenantId: Signal<string | null>;
  accessToken: Signal<string | null>;
}
```

Shell implements; Angular remotes inject via `SESSION_CONTRACT` token.

### 9.2.2 Rules (ADR-005)

| Owns | Shell | Angular remotes | Next | Vue |
|------|-------|-----------------|------|-----|
| Auth store | ✅ | read only | cookie/middleware | inject event |
| Router top-level | ✅ | child routes | own sub-router | own sub-router |
| Theme/tokens | ✅ | consume CSS vars | import tokens | import tokens |

**Anti-pattern:** remote importing shell NgRx store directly.

### 9.2.3 Dev workflow

```bash
nx serve todos-mfe    # :4201
nx serve admin-mfe    # :4202
nx serve shell        # :4200
```

---

## Неделя 3 — Vue analytics-mfe

> **Подготовка:** Vue analytics spike — Phase 5–6, см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

### 9.3.1 Vite federation

```bash
cd apps/analytics-mfe
npm i @originjs/vite-plugin-federation -D
```

**vite.config.ts:**
```typescript
federation({
  name: 'analytics',
  filename: 'remoteEntry.js',
  exposes: { './AnalyticsApp': './src/App.vue' },
  shared: ['vue', 'pinia'],
}),
```

### 9.3.2 Shell loader for Vue

```typescript
// shell: dynamic import non-Angular remote
async loadAnalytics() {
  const manifest = await fetch('/mf-manifest.json').then(r => r.json());
  await import(/* @vite-ignore */ manifest.analytics.remoteEntry);
  // mount AnalyticsApp in outlet component
}
```

### 9.3.3 Analytics features (from Phase 5–6 spike)

- [ ] Todo stats chart (`/api/todos/stats` mock)
- [ ] Web Vitals summary widget
- [ ] Pinia store + composables

### 9.3.4 Auth in Vue

Listen `window` event `auth:session` from shell OR read shared httpOnly cookie.

---

## Неделя 4 — Next.js marketing-mfe

> **Подготовка:** Next marketing scaffold — Phase 7, см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

### 9.4.1 Integration strategy (ADR-009)

| Option | Dev | Prod | Выбор |
|--------|-----|------|-------|
| A. CDN route proxy | shell proxy `/` → `:3000` | nginx path `/` → Next bucket | **Recommended** |
| B. Module Federation 2 | webpack MF remote | same | Advanced spike |
| C. iframe | simple | isolated | ❌ avoid |

**Default:** Option A — route-level composition (FAANG pattern at edge).

### 9.4.2 Pages

| Route | Page | SSR |
|-------|------|-----|
| `/` | Landing | SSG |
| `/pricing` | Pricing | ISR |
| `/docs` | API docs link | SSG |
| `/share/:id` | Public todo share | SSR |

### 9.4.3 Shared design tokens

```typescript
// marketing-mfe/app/globals.css
@import '@todo-platform/design-tokens/tokens.css';
```

### 9.4.4 Auth bridge

Shell login sets cookie → Next middleware reads JWT for protected `/docs/admin` (optional).

---

## Неделя 5 — Manifest, errors, cross-framework E2E

### 9.5.1 Runtime manifest

**Файл:** `apps/shell/public/mf-manifest.json`

```json
{
  "todos": { "type": "angular", "remoteEntry": "http://localhost:4201/remoteEntry.json" },
  "admin": { "type": "angular", "remoteEntry": "http://localhost:4202/remoteEntry.json" },
  "marketing": { "type": "next", "baseUrl": "http://localhost:3000" },
  "analytics": { "type": "vue", "remoteEntry": "http://localhost:4203/remoteEntry.js" }
}
```

Blue-green ready → [Phase 15](./phase-15-blue-green.md).

### 9.5.2 Error boundary (all remotes)

```typescript
@if (loadError()) {
  <ui-error-fallback [remote]="'todos'" (retry)="retry()" />
}
```

### 9.5.3 Playwright polyglot E2E

```typescript
test('polyglot navigation', async ({ page }) => {
  await page.goto('/todos');      // Angular
  await page.goto('/admin');     // Angular stub
  await page.goto('/');          // Next
  await page.goto('/analytics'); // Vue
});
```

---

## Неделя 6 — Deploy model & comparison docs

### 9.6.1 Independent builds

```bash
nx run-many -t build -p shell,todos-mfe,admin-mfe,analytics-mfe
nx build marketing-mfe
```

### 9.6.2 Version manifest per remote

```json
{ "todos": { "remoteEntry": "https://cdn.example.com/todos/1.2.0/remoteEntry.json" } }
```

Deploy todos v2 **without** shell rebuild — manifest bump only.

### 9.6.3 Comparison docs

| Doc | Content |
|-----|---------|
| `docs/mfe-comparison.md` | Native Federation vs MF2 vs single-spa |
| `docs/mfe-polyglot-auth.md` | Auth across 4 stacks |
| `docs/system-design/polyglot-mfe-netflix.md` | System design case |

### 9.6.4 Performance

- Shell-only vs shell+4 remotes initial load
- Lazy load remotes on route enter only

---

## Неделя 7 (optional) — Module Federation 2 spike

Bonus for Google/Meta interviews:

- [ ] `@module-federation/enhanced` — Next as MF remote without proxy
- [ ] Document tradeoffs vs route proxy

Not required for phase completion.

---

## Критерии готовности

| # | Критерий | Проверка |
|---|----------|----------|
| 1 | 4 remotes + shell build green | CI |
| 2 | Angular MF: todos + admin load | manual |
| 3 | Vue analytics chart visible | `/analytics` |
| 4 | Next landing SSR | view-source has content |
| 5 | Logout in shell clears all remotes | E2E |
| 6 | Remote deploy without shell rebuild | manifest only |
| 7 | ADR-005 + ADR-009 published | docs/adr/ |
| 8 | React + Vue stack sections complete | checklists in [multi-stack-roadmap.md](./multi-stack-roadmap.md) |

---

## Связь с другими фазами

| Фаза | Polyglot |
|------|----------|
| [Phase 14](./phase-14-multi-tenant.md) | admin-mfe full + tenant in manifest |
| [Phase 15](./phase-15-blue-green.md) | per-tenant manifest URLs |
| [Phase 16](./phase-16-infrastructure.md) | CDN 4 remotes + shell |
| [Phase 13-GraphQL](./phase-13-graphql-client.md) | Apollo in Next + Vue |
| [Phase 17](./phase-17-auth-oidc-keycloak.md) | Keycloak all stacks |

---

## Следующая фаза

→ [phase-10-electron.md](./phase-10-electron.md) (shell wraps web)  
→ См. [multi-stack-roadmap.md](./multi-stack-roadmap.md) — критерии React/Next и Vue по фазам 10–13.
