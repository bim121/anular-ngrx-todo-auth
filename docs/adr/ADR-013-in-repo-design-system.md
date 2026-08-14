# ADR-013: In-repo design system (tokens + primitives, no external DS wrap)

**Status:** Accepted  
**Date:** 2026-08-14  
**Context:** Phase 6.1 — there is no separate company/personal design-system package to `npm link`. The plan’s “ADR-008 wrapper vs direct import” slot is already used by [ADR-008](./ADR-008-router-store-and-navigation-load.md), so this decision lives here.

**Related:** [phase-06-design-system.md](../plans/phase-06-design-system.md)

---

## Decision

Own a **small in-repo design system** in `libs/shared/ui`:

| Layer | Location |
|-------|----------|
| Tokens (CSS variables) | `libs/shared/ui/styles/_tokens.css` |
| Theme (`light` \| `dark` \| `system`) | `ThemeStore` → `data-theme` on `<html>` |
| Primitives (Button, Input, …) | same lib, added in weeks 2–3 |

**Direct import** of these primitives from `@anular-ngrx/shared-ui`. Do **not** wrap Angular Material, PrimeNG, or another third-party DS.

React (`marketing-mfe`) and Vue (`analytics-mfe`) consume the **same CSS variables** later (Phase 6 R.6 / V.6), not Angular components.

## Rationale

- No external DS exists for this repo; inventing a wrapper would add an empty abstraction.
- Tokens on `:root` / `[data-theme]` are the shared contract across stacks.
- Keeping primitives in `shared-ui` matches the existing Spinner / Toast / FormField home.

## Consequences

- Features import `@anular-ngrx/shared-ui` components, not raw Material widgets.
- Changing a color means editing `_tokens.css` once; Angular chrome already maps `--app-*` aliases to the same variables.
- If a published DS appears later, wrap **only** at the primitive boundary (Button/Input), not in feature templates.

## Alternatives considered

- **Wrap Angular Material** — extra bundle and two visual languages; rejected for a learning app that already has custom UI.
- **Separate `libs/shared/design-tokens` package now** — useful for MFE path aliases in week 2+; week 1 keeps a single canonical CSS file to avoid drift.
