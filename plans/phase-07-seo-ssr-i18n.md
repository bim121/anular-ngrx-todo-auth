# Phase 7 — SEO, SSR, i18n
> **Теория:** [guides/phase-07-seo-ssr-i18n-theory.md](./guides/phase-07-seo-ssr-i18n-theory.md) — статус: placeholder  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 15–16 недели (40–50 ч)  
**Предусловия:** Phase 6, SSR уже в angular.json  
**Цель:** SEO ≥95, корректный SSR data transfer, i18n, structured data.

---

## Результат фазы

- [x] Meta/OG/Twitter на всех routes
- [x] TransferState для todos (authenticated SSR path)
- [x] Prerender login/register
- [ ] i18n en/ru
- [ ] sitemap, robots, JSON-LD
- [x] ADR-004 cookie auth for SSR

### React/Next.js (marketing-mfe)

- [ ] `npx create-next-app@latest apps/marketing-mfe` — App Router, TypeScript, Tailwind
- [ ] Страницы `/`, `/pricing`, `/docs` с `generateMetadata` и Open Graph
- [ ] `sitemap.ts` + `robots.ts` (Next conventions)
- [ ] i18n: `next-intl` или `[locale]` segment — en/ru
- [ ] JSON-LD в layout или page metadata
- [ ] Import `libs/shared/design-tokens` — единый бренд с Angular DS
- [ ] Lighthouse SEO ≥ 95 на marketing routes

### Vue 3 (analytics-mfe)

- [ ] **ADR-007:** Nuxt 3 vs Vite SPA для analytics — сравнение SSR/SEO (doc-only spike)
- [ ] Решение: остаёмся на Vite SPA (dashboard не требует SEO); Nuxt — rejected или deferred
- [ ] `docs/multi-stack/07-nuxt-comparison-adr.md` опубликован
- [ ] analytics-mfe: client-only meta для `/analytics` (noindex в shell embed)

---

## Неделя 1 — Meta & titles

- [x] `titleResolver` + route `data.title` / `data.description`
- [x] `RoutePageContextService` syncs title, OG, Twitter, canonical on `NavigationEnd`
- [x] Per-route meta on `/login`, `/register`, `/todos`, `/kanban`, `/calendar`, `/profile`
- [x] Canonical via `environment.siteUrl`

### 7.1.1 TitleStrategy or resolver

```typescript
export const titleResolver: ResolveFn<string> = (route) => {
  return route.data['title'] ?? 'Todo App';
};
```

### 7.1.2 Meta service in effect

```typescript
routerEvents$.pipe(
  filter(event => event instanceof NavigationEnd),
  tap(() => {
    this.title.setTitle(...);
    this.meta.updateTag({ property: 'og:title', content: ... });
  }),
);
```

### 7.1.3 Per-route meta

| Route | title | og:description |
|-------|-------|----------------|
| /login | Login | ... |
| /todos | My Todos | ... |

### 7.1.4 Canonical

```typescript
this.meta.updateTag({ rel: 'canonical', href: `https://example.com${path}` });
```

Use environment `siteUrl`.

---

## Неделя 2 — SSR data transfer

- [x] `todosResolver` + `TransferState` (no double-fetch after hydration)
- [x] `hydrateTodosFromRoute$` seeds NgRx store from resolver data
- [x] ADR-004 httpOnly `session` cookie + Express mock `/api/session`
- [x] SSR auth restore via `restoreAuthFromSession` + `provideSsrAuthRestore()`
- [x] Todo routes use `RenderMode.Server` in `app.routes.server.ts`

### 7.2.1 Problem

Client double-fetches todos after hydration.

### 7.2.2 Server resolver

```typescript
export const todosResolver: ResolveFn<Todo[]> = () => {
  const repo = inject(TodoRepository);
  const transferState = inject(TransferState);
  const key = makeStateKey<Todo[]>('todos');

  if (transferState.hasKey(key)) {
    return transferState.get(key, []);
  }
  return repo.getAll(userId).pipe(
    tap(todos => {
      if (isPlatformServer(inject(PLATFORM_ID))) {
        transferState.set(key, todos);
      }
    }),
  );
};
```

### 7.2.3 Client bootstrap

Effect or resolver consumer checks TransferState first, skip HTTP if present.

### 7.2.4 Auth on SSR

**ADR-004:** httpOnly cookie `session` vs localStorage.

Steps:
1. Login sets cookie (mock in Express server.ts).
2. Server reads cookie → userId for resolver.
3. Document security: SameSite, Secure.

---

## Неделя 3 — Prerender & hybrid rendering

- [x] `login` / `register` → `RenderMode.Prerender`
- [x] `todos` (+ kanban/calendar) → `RenderMode.Server`
- [x] View-source checklist + `scripts/verify-ssr-view-source.mjs`
- [x] Express: `compression` + immutable cache for hashed assets

### 7.3.1 app.routes.server.ts

```typescript
export const serverRoutes: ServerRoute[] = [
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'todos', renderMode: RenderMode.Server },
];
```

### 7.3.2 Verify view-source

- Login: full HTML content, meta tags.
- Todos: server rendered shell (auth dependent).

### 7.3.3 Express server hardening

**Файл:** `src/server.ts` — compression, static cache headers.

---

## Неделя 4 — i18n

### 7.4.1 Выбор (ADR)

| Option | Pros |
|--------|------|
| `$localize` | Official, build-time |
| `ngx-translate` | Runtime switch |

Рекомендация для learning: **$localize** + route prefix.

### 7.4.2 Setup

```bash
ng add @angular/localize
```

Extract: `ng extract-i18n`

### 7.4.3 Routes

```
/en/login
/ru/login
```

`provideRouter` with prefix matcher.

### 7.4.4 hreflang

```html
<link rel="alternate" hreflang="en" href="..." />
<link rel="alternate" hreflang="ru" href="..." />
```

### 7.4.5 RTL spike

One page with `dir="rtl"` — test DS layout.

---

## Неделя 5 — SEO artifacts

### 7.5.1 robots.txt

**Файл:** `public/robots.txt`

```
User-agent: *
Allow: /login
Disallow: /todos
```

### 7.5.2 sitemap.xml

Build script generates static URLs for prerendered routes.

### 7.5.3 JSON-LD

**Landing/public page:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Todo App"
}
```

---

## Критерии готовности

- [ ] Lighthouse SEO ≥ 95
- [ ] No duplicate GET todos on first paint (network tab)
- [ ] `/en` and `/ru` work
- [ ] Rich results test (Google) valid JSON-LD

---

## Стек React / Next.js (marketing-mfe)

> **Основной SSR-стек фазы:** public pages на Next App Router; Angular SSR — для authenticated `/todos`. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.7.1 — Scaffold Next 15 App Router

```bash
npx create-next-app@latest apps/marketing-mfe --typescript --app --tailwind --eslint
```

**Шаги:**
1. Удалить placeholder из Phase 0; подключить project в Nx workspace.
2. `app/layout.tsx` — root metadata, `lang`, design tokens CSS import.
3. `app/page.tsx`, `app/pricing/page.tsx`, `app/docs/page.tsx`.

**Проверка:** `npm run dev:marketing` — три страницы рендерятся.

### R.7.2 — generateMetadata и OG

**Файл:** `app/pricing/page.tsx`

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Pricing — Todo Platform',
    description: 'Plans for teams',
    openGraph: { title: 'Pricing', images: ['/og-pricing.png'] },
    twitter: { card: 'summary_large_image' },
  };
}
```

**Шаги:**
1. Canonical URL через `metadataBase` в root layout.
2. Per-route `description`, `og:image` для `/`, `/pricing`, `/docs`.
3. View-source: полный HTML с meta без client JS.

**Критерий:** Lighthouse SEO ≥ 95 на `/` и `/pricing`.

### R.7.3 — i18n и sitemap

**Шаги:**
1. `app/[locale]/layout.tsx` — `en`, `ru` segments.
2. `middleware.ts` — locale detection + redirect default `/en`.
3. `app/sitemap.ts` — static URLs для prerendered marketing pages.
4. `app/robots.ts` — Allow `/`, `/pricing`; Disallow `/api`.

**Проверка:** `/en/pricing` и `/ru/pricing` — разный контент, hreflang в layout.

### R.7.4 — JSON-LD и design tokens

```typescript
// app/page.tsx — script type application/ld+json
{ "@context": "https://schema.org", "@type": "WebApplication", "name": "Todo Platform" }
```

Import `libs/shared/design-tokens` CSS variables — визуальная согласованность с Angular shell.

---

## Стек Vue 3 (analytics-mfe)

> Dashboard `/analytics` — **не SEO-critical**; сравнение с Nuxt — архитектурное решение, не миграция.

### V.7.1 — ADR: Nuxt 3 vs Vite SPA

**Файл:** `docs/multi-stack/07-nuxt-comparison-adr.md`

| Критерий | Nuxt 3 | Vite SPA (текущий) |
|----------|--------|---------------------|
| SSR/SEO | Встроенный | Не нужен для embed MFE |
| Federation | Сложнее | `@originjs/vite-plugin-federation` готов |
| Learning curve | Новый фреймворк | Уже в Phase 0–6 |

**Шаги:**
1. Spike 2–3 ч: `nuxi init` hello-world — только для сравнения, не в monorepo.
2. Зафиксировать решение: **остаёмся на Vite**; Nuxt — если позже standalone marketing+analytics.
3. ADR-007 в `docs/adr/`.

**Критерий:** ADR опубликован; команда согласна не мигрировать analytics на Nuxt.

### V.7.2 — Client meta для embed

**Шаги:**
1. `index.html` или `useHead` из `@unhead/vue`: `<meta name="robots" content="noindex">`.
2. Shell route `/analytics` — SEO от shell, не от remote.
3. Документировать в `polyglot-mfe-architecture.md`: какой remote отвечает за SEO.

**Проверка:** view-source shell `/analytics` — корректный title от host; remote не ломает hydration.

---

## Следующая фаза

→ [phase-08-build-webpack.md](./phase-08-build-webpack.md)


