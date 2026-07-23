# ChangeDetectorRef.detach() experiment (Phase 5.2.3)

**Component:** `app-todo-stats-panel`  
**Goal:** Keep a deliberately heavy widget from participating in the default CD tree while the todo list paints.

## What we did

1. `ChangeDetectionStrategy.OnPush`
2. `cdr.detach()` in the constructor — the view is **removed** from automatic change detection.
3. An `effect()` watches `todos()` input; after a deferred `computeStats()` (includes artificial 500k-loop load), call **`cdr.detectChanges()`** so the template updates once.

```typescript
this.cdr.detach();

effect((onCleanup) => {
  const items = this.todos();
  this.computing.set(true);
  this.cdr.detectChanges(); // show "Computing…"

  const handle = setTimeout(() => {
    this.stats.set(this.computeStats(items));
    this.computing.set(false);
    this.cdr.detectChanges(); // show numbers
  }, 0);

  onCleanup(() => clearTimeout(handle));
});
```

## Tradeoffs

| Benefit | Cost |
|---------|------|
| Parent CD (list scroll, filters) does **not** re-run this template every tick | Easy to forget `detectChanges()` → stale UI |
| Heavy compute can be scheduled off the critical path | Input-driven updates require explicit wiring (`effect` / `ngOnChanges`) |
| Good teaching demo for “local CD control” | Overkill for cheap widgets; prefer `@defer`, `computed`, or web worker for real apps |

## When to use

- Rarely updating, expensive panels (charts, analytics) next to a high-churn list.
- **Not** for the virtualized todo rows themselves — use CDK virtual scroll there instead.

## Related

- Virtual scroll: `todo-list.component` + `itemSize=72`
- Baseline: [baseline.md](./baseline.md)
