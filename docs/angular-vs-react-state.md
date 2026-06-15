# Angular signals vs React useState

**Context:** Phase 2 multi-stack — same todo domain in Angular (`anular-ngrx-todo-auth`) and React (`marketing-mfe`).

Related:

- [ADR-006: local httpResource vs global NgRx store](./adr/ADR-006-local-resource-vs-global-store.md)
- [React reconciliation and Fiber](./react/reconciliation-and-fiber.md)
- [plans/guides/react-next-faang-theory.md](../plans/guides/react-next-faang-theory.md)

---

## Mental model

| | Angular signals | React `useState` |
|---|-----------------|------------------|
| Unit of reactivity | Signal (`signal`, `computed`) | Component state hook |
| Read in template | `filter()` — call as function | `filter` — plain variable |
| Derived data | `computed(() => …)` | `useMemo(() => …, [deps])` |
| Side effects | `effect(() => …)` | `useEffect(() => …, [deps])` |
| Global shared state | NgRx store, `httpResource` | Context, Zustand, TanStack Query (Phase 3) |

Angular signals integrate with **OnPush** and zoneless change detection: the framework tracks signal reads during template execution.

React re-renders the **whole function component** when `setState` runs; child optimization is opt-in (`memo`, `useMemo`, `useCallback`).

---

## Todo list: parallel implementations

### React (`TodoList.tsx`)

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

useEffect(() => {
  fetchTodos(userId, accessToken).then(setTodos);
}, [userId, accessToken]); // stable deps — no infinite loop

const filtered = useMemo(
  () => applyFilter(todos, filter),
  [todos, filter]
);
```

- **Local UI state** (filter, form input) → `useState`.
- **Server data** loaded once per session user → `useEffect` + `setTodos`.
- **Mutations** → fetch API, then `setTodos` with new array (immutable update).

### Angular (`TodoListComponent`)

```typescript
readonly todos = toSignal(this.store.select(selectAllTodos), { initialValue: [] });
readonly filter = signal<TodoFilter>('all');
readonly filteredTodos = computed(() => applyFilter(this.todos(), this.filter()));
```

- **Domain state** (todos) → NgRx (shared, effects, DevTools).
- **Local UI state** (filter) → component `signal`.
- **Derived list** → `computed` (like `useMemo`, but automatically tracked).

---

## When to use which layer

| Data | Angular (this repo) | React (this repo) |
|------|---------------------|-------------------|
| Todos CRUD | NgRx + effects | `useState` + fetch in `TodoList` |
| Auth session | NgRx `auth` feature | `useState` in `App` |
| User profile | `httpResource` (local) | N/A in Phase 2 |
| Login form | Signal forms / reactive | Controlled `useState` inputs |

Rule of thumb aligned with [ADR-006](./adr/ADR-006-local-resource-vs-global-store.md):

- **Shared, mutated, cross-route** → global store (Angular NgRx; React will use TanStack Query / Zustand in Phase 3).
- **Screen-local, read-only or ephemeral** → signals / `useState` / `httpResource`.

---

## Forms: validation parity

Both stacks use the shared validator in `libs/shared/validators/email.ts`:

- Angular: `email()` and `required()` in `auth-signal-form.schema.ts`
- React: `isValidEmail()` + `AUTH_VALIDATION_MESSAGES` in `login-page.tsx`

Same regex, same error strings — polyglot contract for auth UX.

---

## Common pitfalls

### React

- **`useEffect` infinite loop** — never put unstable objects or `setTodos` callbacks in deps without care; load effect depends only on `userId` and `accessToken`.
- **Stale closure** — mutation handlers should use functional updates: `setTodos((current) => …)`.

### Angular

- **Forgetting to call signals** — `filter` vs `filter()` in templates.
- **Duplicating server state** — do not store todos in both NgRx and `httpResource`.

---

## Profiler comparison (Phase 2 exercise)

1. Open React app → login → toggle filter chips three times → note render count in React DevTools Profiler.
2. Open Angular app → same actions → Angular DevTools profiler.
3. Expect filter changes to re-render list container; with NgRx + OnPush, item components may skip updates if inputs unchanged.

Document observations in your learning notes; numbers vary by devtools version.
