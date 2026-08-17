# shared-ui

In-repo **design system** for the Angular app (Phase 6).

- **Tokens:** `styles/_tokens.css` — colors, space, radius, type, shadows; light/dark via `[data-theme]`.
- **Theme:** `ThemeStore` (`light` | `dark` | `system`) writes `data-theme` on `<html>`.
- **Primitives:** Button, Card, Spinner, Toast, FormField, Input (CVA), Checkbox (CVA).

```html
<button app-button variant="primary" size="md">Save</button>
<app-card title="Todos">…</app-card>
<app-form-field label="Email" controlId="email" [field]="loginForm.email" />
<app-form-field label="Task" controlId="task" hint="Keep it short">
  <app-input inputId="task" [formControl]="taskCtrl" />
  <span dsError>Required</span>
</app-form-field>
```

Forms-backed controls (`FormField`, `Input`, `Checkbox`) are imported from secondary paths so the main barrel does not pull `@angular/forms`.

Decision record: [ADR-013](../../../docs/adr/ADR-013-in-repo-design-system.md).
