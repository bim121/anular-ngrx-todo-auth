# Phase 7 — SEO, SSR, i18n

**Длительность:** 15–16 недели (40–50 ч)  
**Предусловия:** Phase 6, SSR уже в angular.json  
**Цель:** SEO ≥95, корректный SSR data transfer, i18n, structured data.

---

## Результат фазы

- [ ] Meta/OG/Twitter на всех routes
- [ ] TransferState для todos (authenticated SSR path)
- [ ] Prerender login/register
- [ ] i18n en/ru
- [ ] sitemap, robots, JSON-LD
- [ ] ADR-004 cookie auth for SSR

---

## Неделя 1 — Meta & titles

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

## Следующая фаза

→ [phase-08-build-webpack.md](./phase-08-build-webpack.md)
