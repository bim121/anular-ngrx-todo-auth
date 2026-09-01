# ADR-005: i18n — `$localize` + route prefix

**Status:** Accepted  
**Date:** 2026-09-01  
**Phase:** 7.4

## Context

The app needs English and Russian UI for SEO (`hreflang`) and learning goals. Options:

| Option | Pros | Cons |
|--------|------|------|
| `$localize` | Official Angular, build-time extract, tree-shakable | Per-locale builds for full SSG |
| `ngx-translate` | Runtime JSON switch | Extra dependency, not official |

## Decision

Use **`@angular/localize`** with:

1. **Route prefix** — `/en/login`, `/ru/login` (locale in URL for SEO + shareable links).
2. **Runtime `loadTranslations()`** for `ru` in dev/SSR single build (learning-friendly; production can add per-locale builds later).
3. **`localeGuard`** validates `:locale` and loads catalog before child routes activate.
4. **`hreflang`** alternate links synced on navigation (Phase 7.4.4).
5. **RTL spike** — dedicated `/en/rtl-demo` page with `dir="rtl"` for DS layout check (7.4.5).

## Consequences

- Guards and auth navigation must preserve locale segment.
- Prerender paths: `en/login`, `ru/login`, etc.
- `ng extract-i18n` extracts from `i18n` / `$localize` markers into `messages.xlf`.

## Alternatives considered

- **ngx-translate** — rejected for learning track (plan recommends `$localize`).
- **Subdomain i18n** (`ru.example.com`) — out of scope for local dev.
