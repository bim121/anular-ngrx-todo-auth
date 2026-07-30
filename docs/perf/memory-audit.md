# Memory leak audit (Phase 5.6.3)

## Goal

Prove that repeated navigation (login ↔ todos) does **not** grow detached DOM / JS heap unboundedly (&lt; ~5 MB growth after ~100 cycles is the Phase 5 readiness bar).

## Manual procedure (Chrome)

1. `npm run build` then `npx serve dist/web/browser -l 4173 -s` (+ `npm run api` if login needs the API).
2. Open `http://localhost:4173/login` in Chrome.
3. DevTools → **Memory** → take **Heap snapshot** → label `before`.
4. Automate or manually: login → `/todos` → logout → `/login`, **~100 times**.
5. Take snapshot `after`.
6. Compare:
   - **Comparison** view: look for growing `Detached HTML…`, listeners, NgRx effects without teardown.
   - Total heap delta (JS).

Optional: Performance monitor → JS heap size chart while looping.

## What “good” looks like

| Signal | Pass |
|--------|------|
| Detached nodes | Flat or tiny after GC |
| Heap after forced GC | Growth ≲ 5 MB over 100 navigations |
| Console | No runaway `setInterval` / WebSocket after logout |

## Code audit (2026-07-30)

Grep for long-lived `.subscribe(` outside specs:

| Location | Teardown | Status |
|----------|----------|--------|
| `TodoListUiStore` `onInit` | `takeUntilDestroyed()` | OK |
| `TodoEffects.loadTodos$` | `takeUntil(lifecycle.cancelPendingRequests)` | OK |
| `RealtimeEffects` | `takeUntil(logoutUser)` | OK |
| `MockRealtimeService` | `disconnect()` unsubscribes `interval` | OK |
| NgRx `createEffect` streams | Framework-managed | OK |
| Facades `toSignal(store.select…)` | Tied to injector lifetime | OK |

**Rule:** any new component/service `.subscribe()` must use `takeUntilDestroyed()`, `DestroyRef`, or an explicit `unsubscribe` in `ngOnDestroy` / `disconnect`.

Specs may call `.subscribe()` freely — not production paths.

## Fix checklist if growth appears

1. Identify retaining path in heap snapshot (often a Subject → component).
2. Add `takeUntilDestroyed()` or move to `async` pipe / `toSignal`.
3. On logout, ensure realtime `disconnect()` and HTTP inflight maps clear (see `HttpCacheEffects`).
4. Re-run the 100× navigation test; attach screenshots under `docs/perf/` if regressing.
