# marketing-mfe

Next.js App Router marketing site (Phase 7 / R.7) — public SEO pages with i18n.

- **Routes:** `/en`, `/en/pricing`, `/en/docs` (+ `/ru/...`)
- **SEO:** `generateMetadata`, Open Graph, `sitemap.ts`, `robots.ts`, JSON-LD
- **Tokens:** `libs/shared/design-tokens` shared with Angular DS
- **Auth todos:** stay in Angular SSR (`NEXT_PUBLIC_ANGULAR_APP_URL`)

## Dev

```bash
npm run dev:marketing
```

Open http://localhost:4300 — redirects to `/en`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:marketing` | Next dev server on :4300 |
| `npm run build:marketing` | Production build |
| `npm run typecheck --workspace=marketing-mfe` | `tsc --noEmit` |

## Env

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:4300
NEXT_PUBLIC_ANGULAR_APP_URL=http://localhost:4200/en/todos
```
