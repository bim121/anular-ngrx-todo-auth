# Zoneless caveats

Angular 21 zoneless change detection (`provideZonelessChangeDetection()`) is enabled in this app.
Zone.js is not bundled in the browser build; UI updates rely on signals, `AsyncPipe`, or explicit change detection.

## Problem → solution

| Problem | Symptom | Solution | Status in this app |
|--------|---------|----------|-------------------|
| NgRx store bound via `Observable` + `async` pipe | UI stale after `dispatch` under OnPush | Use `toSignal(store.select(...))` in components | Done: todo-list, login, register, main-layout |
| Router metadata (title, breadcrumbs) via `async` | Header/title not updating after navigation | `RoutePageContextService.activePage` is a `toSignal` from `NavigationEnd` | Done |
| `setTimeout` / `setInterval` mutating plain fields | No UI refresh | Emit through `BehaviorSubject`/signal, or use `toSignal(timer(...))` | Toast auto-dismiss uses `BehaviorSubject` + `AsyncPipe` — OK |
| Third-party lib assumes `NgZone` | Silent UI bugs after async work | Prefer signal-based APIs; wrap with `inject(NgZone).run()` only if unavoidable | `ngrx-store-localstorage` not wired yet — audit before use |
| Component tests without zoneless provider | Tests pass with zone but fail in app | `src/testing/test-providers.ts` + `angular.json` → `test.providersFile` | Done |
| `zone.js` in `angular.json` polyfills | Unnecessary bundle size | No separate zone polyfill entry; nothing to remove | N/A |
| Manual property updates in components | Template unchanged | Convert to `signal()` / `computed()`, or call `ChangeDetectorRef.markForCheck()` | Todo list filter uses `signal()` |
| `@ngrx/store-devtools` in production | DevTools overhead | Registered only in `isDevMode()` | Done |

## NgRx + zoneless checklist

1. **Store → UI:** every feature page reads state through `toSignal(this.store.select(...))`.
2. **Effects → router:** `AuthEffects` navigates with `Router` after `loginSuccess` / `logoutUser`; route metadata updates via `RoutePageContextService.activePage`.
3. **Router store:** `provideRouterStore()` syncs navigation into NgRx state for DevTools (state slice `@ngrx/router-store`), even though components read the router directly.

## Manual verification (DevTools)

Run `npm run dev`, open Redux DevTools extension:

| Step | Action | Expected UI |
|------|--------|-------------|
| 1 | Dispatch `loginUser` (or log in via form) | `auth` slice: `isLoading` → `isLoggedIn`, user populated; redirect to `/todos` |
| 2 | After `loadTodos` / `loadTodosSuccess` | Todo list renders items; `loading` false in template |
| 3 | Dispatch `addTodo` / `updateTodo` / `deleteTodo` | List updates without full page reload |
| 4 | Navigate login ↔ register | Auth layout heading/breadcrumb changes (`activePage` signal) |
| 5 | Logout | `logoutUser` → redirect `/login`; user label hidden in main layout |

If an action appears in DevTools but the UI does not change, check whether the component still uses a bare `Observable` field or mutates state outside signals/Observable emissions.

## When `AsyncPipe` is still fine

Non-NgRx streams that emit on every UI-relevant change work with zoneless because `AsyncPipe` marks the view dirty on each emission:

- `ToastContainerComponent` → `toastService.toasts$`
- `GlobalErrorBannerComponent` → `globalErrors.error$`

Prefer `toSignal` for NgRx selectors for consistency and OnPush ergonomics.

## References

- [Angular zoneless guide](https://angular.dev/guide/zoneless)
- [RxJS interop — `toSignal`](https://angular.dev/guide/signals/rxjs-interop)
- App config: `src/app/app.config.ts`
- Test providers: `src/testing/test-providers.ts`
