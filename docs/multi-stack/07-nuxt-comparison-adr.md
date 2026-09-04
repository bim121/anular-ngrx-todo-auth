# Nuxt 3 vs Vite SPA — analytics-mfe (Phase 7 / V.7.1)

**ADR:** [ADR-014-nuxt-vs-vite-analytics.md](../adr/ADR-014-nuxt-vs-vite-analytics.md)  
**Status:** Accepted — remain on Vite SPA  
**Spike type:** doc-only (no Nuxt app in monorepo)

## Goal

Decide whether `apps/analytics-mfe` should migrate from Vue 3 + Vite to Nuxt 3 for SSR/SEO in Phase 7.

## Comparison

| Criterion | Nuxt 3 | Vite SPA (current) |
|-----------|--------|---------------------|
| SSR / SEO | Built-in App Router–style SSR, `useSeoMeta`, sitemap modules | No SSR; `index.html` shell only |
| Fit for `/analytics` | Overkill — authenticated dashboard, charts, session | Matches embed MFE: UI island inside shell |
| Module Federation | Possible but extra config; SSR + remoteEntry is awkward | `@originjs/vite-plugin-federation` / MF2 — standard for Phase 9 |
| Learning curve | New framework (Nitro, file routes, modules) | Already used in Phases 0–6 |
| Bundle / TTFB | Server Node process + hydration cost | Static remote chunks on CDN |
| Overlap with Next marketing | Second SSR framework in monorepo | SEO stays on Next + Angular |

## Spike notes (doc-only)

A full `nuxi init` hello-world was **not** added to the monorepo (plan: compare only, do not land Nuxt here). Criteria above are enough to reject Nuxt for this remote:

1. **SEO ownership** for public pages is already assigned to Next (`marketing-mfe`) and Angular prerender/SSR (`web`).
2. Analytics charts need client JS + auth; server HTML adds little for crawlers.
3. Phase 9 integration path for Vue is federation as a **client remote**, not a second SSR host.

## Decision

**Remain on Vite SPA.** Nuxt is **rejected for analytics-mfe**; revisit only if product needs a standalone Vue public site.

## Follow-ups (V.7.2)

- `noindex` on analytics remote so standalone `:4400` is not crawled.
- Document which remote owns SEO in [polyglot-mfe-architecture.md](../../plans/polyglot-mfe-architecture.md).
