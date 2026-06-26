# ADR-011: Phase 2 — Modern Angular recap (cheat sheet)

**Status:** Accepted (reference)  
**Date:** 2026-06-15  
**Context:** Quick-return guide for [Phase 2](../../plans/phase-02-modern-angular.md) — zoneless, signals, new control flow, Signal Forms, `httpResource`.  
**Related:** [ADR-006](./ADR-006-local-resource-vs-global-store.md), `docs/zoneless-caveats.md`, `docs/signal-forms-vs-reactive.md`

---

## What Phase 2 gave us

Angular 19+ style UI: **no Zone.js**, signal-based components, `@if`/`@for`, `@defer`, Signal Forms for auth, `httpResource` spike for profile.

---

## Zoneless bootstrap

| Item | File |
|------|------|
| `provideZonelessChangeDetection()` | `src/app/app.config.ts` |
| Test providers mirror | `src/testing/test-providers.ts` |

**Repeat:** all components should work with OnPush + signals; avoid `NgZone.run` hacks.

**Caveats:** `docs/zoneless-caveats.md`

---

## Signals in feature components

| Pattern | Where |
|---------|-------|
| `toSignal(store.select(...))` | `todo-list.component.ts` — bridge NgRx → template |
| `computed()` | filtered todo tree, visible counts |
| `effect()` | toast when `error()` signal changes |
| `ChangeDetectionStrategy.OnPush` | login, register, layouts, dumb components |

**Repeat:** NgRx stays source of truth; signals are the **view layer** adapter.

---

## Modern template syntax

| Syntax | Example file |
|--------|----------------|
| `@if (loading())` | `todo-list.component.html` |
| `@for (node of tree(); track node.id)` | todo tree rendering |
| `@empty` | empty list branch |
| `@defer (on viewport)` | lazy `TodoStatsPanelComponent` |

**Not used:** `@let` — counts via `computed()` instead.

---

## Dumb components (signal inputs/outputs)

```typescript
// features/todos/ui/todo-item/todo-item.component.ts
todo = input.required<TodoTreeNode>();
toggled = output<string>();
```

**Repeat:** smart page dispatches NgRx; dumb `ui/` components only emit events.

---

## Signal Forms (auth)

| File | Role |
|------|------|
| `features/auth/pages/login/login.component.ts` | `form()` from `@angular/forms/signals` |
| `features/auth/pages/register/register.component.ts` | same pattern |
| `features/auth/data-access/auth-signal-form.schema.ts` | field schema + validators |
| `shared/ui/form-field/form-field.component.ts` | label + error display |

**Async validator:** email uniqueness via `validateHttp` against json-server.

**Gap vs plan:** no parallel Reactive Forms `/login` path — Signal Forms only.

---

## httpResource spike (read-only secondary data)

| File | Role |
|------|------|
| `features/auth/ui/user-profile/user-profile.component.ts` | `httpResource` → `GET /users/me` |
| Route `/profile` | under main layout |

**Rule ([ADR-006](./ADR-006-local-resource-vs-global-store.md)):** profile metadata is local; session + todos stay in NgRx.

---

## Todo list UI (pre–SignalStore)

Phase 2 todo list already used:

- `toSignal` selectors for `todos`, `loading`, `error`
- `computed()` for client-side filter (moved filter to `TodoListUiStore` in Phase 3)

---

## Docs written in Phase 2

| Doc | Topic |
|-----|-------|
| `docs/zoneless-caveats.md` | When change detection needs explicit marks |
| `docs/signal-forms-vs-reactive.md` | Why Signal Forms for this project |
| `docs/angular-vs-react-state.md` | Cross-stack mental model |

---

## 30-second checklist for a new screen

1. Component: `OnPush`, `inject(Store)`, `toSignal` for store slices.
2. Template: `@if` / `@for` / `@defer` — no `*ngIf` / `*ngFor` in new code.
3. Forms: Signal `form()` + shared `FormFieldComponent`.
4. Secondary GET-only data: consider `httpResource` before adding NgRx slice.
5. Run tests with `provideZonelessChangeDetection()` in test bed.
