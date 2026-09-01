# Hydration & SSR (Phase 5.6.2)

## What hydration is

1. **Server** (or prerender) sends HTML for the first paint.
2. **Browser** downloads JS and **hydrates** — attaches listeners / Angular runtime to that DOM instead of wiping and rebuilding it.
3. If the client would have rendered **different HTML** than the server sent → **hydration mismatch** (console warnings, full client re-render, wasted work).

This app uses `provideClientHydration()` in `apps/web/src/app/app.config.ts`.

## Event replay (`withEventReplay`)

Angular can record clicks that happen **before** JS finishes loading and replay them after hydration (`withEventReplay()`).

| | With `withEventReplay()` | Without (current) |
|--|--------------------------|-------------------|
| Early clicks before bootstrap | Replayed into handlers | May be lost |
| Initial JS | ~+10 kB | Smaller (Phase 5.3 cut) |
| Duplicate-handler risk | Must not bind the same listener twice manually | N/A |

**Decision (Phase 5.3 / 5.6):** keep hydration **without** `withEventReplay()` to stay under the 350 kB initial budget. Re-add only if analytics show missed early taps on `/login`.

How to measure duplicate handlers if you re-enable replay:

1. Chrome DevTools → Performance → record load + click login before paint completes.
2. Search for the click handler / `NgZone` / event-dispatch work twice for one user gesture.
3. Also watch console for hydration errors after enabling `provideClientHydration(withEventReplay())`.

## SSR routes in this repo

Configured in `apps/web/src/app/app.routes.server.ts` (Phase 7.3 hybrid rendering):

| Path | Mode | Why |
|------|------|-----|
| `login` / `register` | `RenderMode.Prerender` | Public SEO pages — static HTML at build time |
| `todos` / `kanban` / `calendar` | `RenderMode.Server` | Auth + TransferState — per-request SSR |
| `**` (profile, …) | `RenderMode.Client` | Client-only fallback |

View-source checklist: [docs/seo/view-source-checklist.md](../seo/view-source-checklist.md)

Build outputs (after `npm run build`):

- `dist/web/browser` — static assets (Lighthouse CI serves these)
- `dist/web/server` — Node SSR entry (`npm run serve:ssr`)

## How to check mismatch warnings

```bash
npm run build
npm run serve:ssr
# open http://localhost:4000/login
```

In Chrome DevTools **Console**, look for Angular messages like:

- `NG0500` / hydration mismatch
- Text that existed on server but not on client (or attributes that differ)

Common causes in this stack:

- `Date.now()` / `crypto.randomUUID()` during render
- `isPlatformBrowser` branches that change DOM
- NgRx rehydration that changes first paint vs SSR HTML
- `localStorage` reads during construction of root components

**Mitigations:** keep first paint stable (auth form shell), move browser-only work into `afterNextRender` / effects, avoid random IDs in templates.

## SSR vs Lighthouse CI

Lighthouse CI audits the **static browser build** on `/login` (fast, matches Phase 5.1 baseline).  
SSR hydration checks are a **manual / local** step (`serve:ssr`) documented here — not required for the LHCI gate, but required before calling Phase 5.6.2 done.
