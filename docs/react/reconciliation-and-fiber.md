# React reconciliation and Fiber

**Context:** Phase 2 — React stack in `marketing-mfe`, parallel to Angular control flow and signals.

Theory index: [plans/guides/react-next-faang-theory.md](../plans/guides/react-next-faang-theory.md)

---

## Virtual DOM and reconciliation

React keeps a **Virtual DOM** — a lightweight JS tree describing what the UI should look like. On each update React:

1. Renders a new virtual tree (function components return JSX → objects).
2. **Diffs** the new tree against the previous one (reconciliation).
3. Applies the minimal set of changes to the real DOM.

Reconciliation answers: *which nodes changed, were added, or removed?*

Without stable **keys** in lists, React may reuse DOM nodes incorrectly when items reorder — e.g. checkbox state “sticks” to the wrong row.

---

## Fiber architecture

Since React 16, reconciliation runs on **Fiber** — a unit of work that can be:

- **Paused** and resumed (time slicing),
- **Prioritized** (user input before background work),
- **Discarded** if superseded by a newer update.

Each component instance has a Fiber node linked to its children, siblings, and return (parent). Updates walk this tree incrementally instead of blocking the main thread in one long pass.

**Practical takeaway:** expensive renders in a large list still cost JS work on every parent re-render unless you memoize (`useMemo`, `React.memo`) or split state so unrelated siblings do not re-render.

---

## Keys in lists

### React (`TodoList.tsx`)

```tsx
{filtered.map((todo) => (
  <li key={todo.id}>…</li>
))}
```

- `key` must be **stable** and **unique among siblings** — use `todo.id`, not array index.
- Keys are hints for reconciliation, not passed to the DOM.

### Angular (`todo-list.component.html`)

```html
@for (todo of filteredTodos(); track todo.id) {
  <li>…</li>
}
```

| Aspect | React | Angular |
|--------|-------|---------|
| List hint | `key={todo.id}` on element | `track todo.id` in `@for` |
| Default without hint | Index-based (risky on reorder) | `@for` requires explicit `track` |
| DOM update model | Virtual DOM diff | Ivy incremental DOM updates |

Both frameworks avoid re-creating DOM nodes when the identity (`id`) is unchanged.

---

## Re-render triggers (marketing-mfe todo list)

| Event | React hooks | Angular signals (todo list) |
|-------|-------------|----------------------------|
| Load todos | `setTodos` → re-render | `toSignal(store.select(...))` |
| Change filter | `setFilter` → `useMemo` recalculates | `filter.set()` → `computed` recalculates |
| Toggle todo | `setTodos` with mapped array | NgRx dispatch → selector update |

Use **React DevTools Profiler** and Angular DevTools to compare render counts when toggling filters vs toggling todo items.

---

## Further reading

- [React docs — Rendering lists](https://react.dev/learn/rendering-lists)
- [React docs — Render and commit](https://react.dev/learn/render-and-commit)
- [Angular control flow — `@for`](https://angular.dev/guide/templates/control-flow#for-block)
- State comparison: [angular-vs-react-state.md](../angular-vs-react-state.md)
