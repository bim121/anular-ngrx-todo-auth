# shared-ui

In-repo **design system** for the Angular app (Phase 6).

- **Tokens:** `styles/_tokens.css` — colors, space, radius, type, shadows; light/dark via `[data-theme]`.
- **Theme:** `ThemeStore` (`light` | `dark` | `system`) writes `data-theme` on `<html>`.
- **Primitives so far:** Spinner, Toast, FormField, global error banner. Button / Card / Modal land in later Phase 6 weeks.

Import:

```ts
import { ThemeStore, SpinnerComponent } from '@anular-ngrx/shared-ui';
```

Decision record: [ADR-013](../../../docs/adr/ADR-013-in-repo-design-system.md).
