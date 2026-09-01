# View-source verification (Phase 7.3.2)

Manual checks after `npm run build` + `npm run serve:ssr` (default `http://localhost:4000`).

Automated smoke: `node scripts/verify-ssr-view-source.mjs` (server must be running).

## `/login` (Prerender)

**View Source** (`Ctrl+U`) should show:

| Check | Expected |
|-------|----------|
| Full page HTML | Login form markup inside `<app-root>` (not empty shell) |
| `<title>` | `Login \| Todo App` (or route title + app name) |
| `meta[name="description"]` | Sign-in description from route `data` |
| `meta[property="og:title"]` | Same as document title |
| `meta[rel="canonical"]` | `http://localhost:4200/login` (dev) or prod `siteUrl` |
| Prerender hint | No per-request-only SSR variance; HTML identical across reloads |

## `/register` (Prerender)

Same as login — title/description for Create Account route.

## `/todos` (Server SSR, auth-dependent)

| Check | Expected |
|-------|----------|
| Without `session` cookie | Redirect to `/login` or minimal shell (guard) |
| With valid `session` cookie | Server-rendered app shell + todo list region |
| `script#ng-state` | May contain `todos` key after authenticated SSR (TransferState) |
| Meta tags | `My Todos \| Todo App` when authenticated |

### Set session cookie for manual test

1. Login via UI (sets httpOnly cookie via `POST /api/session`).
2. Or use test user after login, then hard-refresh `/todos`.
3. View Source — confirm title/meta and that content is not a blank `<app-root></app-root>`.

## Response headers (Express hardening)

In DevTools → Network → any static `*.js` with hash in filename:

```
Cache-Control: public, max-age=31536000, immutable
```

HTML document responses should include `Content-Encoding: gzip` (or br) when `compression` middleware is active.
