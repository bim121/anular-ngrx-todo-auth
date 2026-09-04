# ADR-014: Nuxt 3 vs Vite SPA for analytics-mfe

**Status:** Accepted  
**Date:** 2026-09-04  
**Phase:** 7 / V.7.1  
**Plan label:** ADR-007 (reused number in phase plan; formal ID is **014** — `ADR-007-*` already used for layering)

## Context

`analytics-mfe` is a Vue 3 dashboard (charts, todos) meant to mount into the Angular shell at `/analytics` (Phase 9 federation). Phase 7 asks whether to migrate to **Nuxt 3** for SSR/SEO or keep **Vite SPA**.

Public SEO already belongs to:
- **Next.js** `marketing-mfe` — `/`, `/pricing`, `/docs`
- **Angular SSR** `web` — auth + authenticated todos

## Decision

**Stay on Vite SPA.** Do **not** migrate `analytics-mfe` to Nuxt.

Nuxt is deferred unless we later need a **standalone** Vue marketing+analytics product outside the shell.

## Consequences

- Analytics remains client-rendered; crawlers should **not** index the remote (`noindex` — V.7.2).
- Shell (host) owns document title/meta for `/analytics` when federation lands.
- Module Federation path stays simple (`@originjs/vite-plugin-federation` / MF2).

## Alternatives considered

| Option | Verdict |
|--------|---------|
| Nuxt 3 SSR for `/analytics` | Rejected — dashboard is authenticated; SEO value near zero; federation harder |
| Keep Vite SPA | **Accepted** |
| Move charts into Angular | Out of scope — learning goal is Vue remote |

Full comparison: [docs/multi-stack/07-nuxt-comparison-adr.md](../multi-stack/07-nuxt-comparison-adr.md).
