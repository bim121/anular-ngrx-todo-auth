# Signal Forms vs Reactive Forms

Comparison for auth forms in this project (Angular 21, zoneless, NgRx).

| Criterion | Reactive Forms | Signal Forms |
|-----------|----------------|--------------|
| **DX** | Familiar `FormBuilder`, `formControlName`, validators as `ValidatorFn`. Boilerplate for touched/errors in templates. | Schema colocated with `form(signalModel, schema)`; field state is signals (`field().errors()`, `touched()`). Less template noise with `FormFieldComponent`. API still `@experimental`. |
| **Perf** | Works with zoneless via `AsyncPipe` or manual CD; control trees allocate more objects. | Fine-grained updates via signals; aligns with zoneless + OnPush. Model is a single writable signal (no duplicate state). |
| **Testability** | Mature: `FormGroup` assertions, `markAllAsTouched()`, async validators with `fakeAsync`. | Test field signals directly; async via `validateHttp` / resources. Fewer ecosystem examples today. |
| **SSR** | Stable, well documented for `@angular/ssr`. | Supported in Angular 21; signal form rules run in injection context — verify async validators during prerender if added later. |

## What we use

- **Login / Register:** Signal Forms (`@angular/forms/signals`) with `form()`, `required`, `email`, `minLength`, `validateHttp`, `validateTree`.
- **Submit:** still dispatches NgRx actions (`loginUser`, `registerUser`); store/effects unchanged.
- **UI:** `FormFieldComponent` (label + input + errors) for reusable DS control.

## Migration notes

| Reactive pattern | Signal Forms equivalent |
|------------------|-------------------------|
| `Validators.required` | `required(path, { message })` |
| `emailFormatValidator()` | `email(path, { message })` |
| `Validators.minLength(8)` | `minLength(path, 8, { message })` |
| `emailUniqueValidator()` (async) | `validateHttp` + `debounce` |
| `passwordMatchValidator()` (group) | `validateTree` targeting `passwordConfirm` |
| `form.controls.x.touched && invalid` | `field().touched() && field().invalid()` |
| `form.markAllAsTouched()` | `field().markAsTouched()` per control |

## References

- [Signal Forms overview](https://angular.dev/guide/forms/signals/overview)
- [Validation](https://angular.dev/guide/forms/signals/validation)
- App schema: `src/app/features/auth/data-access/auth-signal-form.schema.ts`
- Custom control: `src/app/shared/ui/form-field/form-field.component.ts`
