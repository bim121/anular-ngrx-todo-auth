# shared-ui

In-repo **design system** for the Angular app (Phase 6).

- **Tokens:** `styles/_tokens.css` — colors, space, radius, type, shadows; light/dark via `[data-theme]`.
- **Theme:** `ThemeStore` (`light` | `dark` | `system`) writes `data-theme` on `<html>`.
- **Primitives:** Button, Card, Spinner, FormField, Input (CVA), Checkbox (CVA).
- **Overlays:** Toast (`app-toast` + container), Modal (`ModalService` / CDK Dialog).
- **a11y:** [A11Y.md](./A11Y.md)

```html
<button app-button variant="primary" size="md">Save</button>
<app-card title="Todos">…</app-card>
```

```ts
this.modal.confirm({ title: 'Delete task', message: 'Are you sure?', danger: true });
```

Forms-backed controls (`FormField`, `Input`, `Checkbox`) are imported from secondary paths so the main barrel does not pull `@angular/forms`.

Decision record: [ADR-013](../../../docs/adr/ADR-013-in-repo-design-system.md).
