# Vue 3 Proxy reactivity — deep dive

**Context:** Phase 2 — `analytics-mfe` todo list and login form on `ref` / `computed` / `watch`.

Related:

- [angular-vs-react-state.md](../angular-vs-react-state.md)
- [react/reconciliation-and-fiber.md](../react/reconciliation-and-fiber.md)
- [plans/guides/react-next-faang-theory.md](../plans/guides/react-next-faang-theory.md) (Vue section in multi-stack roadmap)

---

## How Vue 3 tracks changes

Vue 3 reactivity is built on **Proxies** (`Proxy` / `Reflect`). When you read a reactive property during render or in a `computed`, Vue registers a **dependency**. When that property is written, dependents re-run.

This is different from React’s “re-render the component function” model and closer in spirit to Angular signals (fine-grained invalidation), though the implementation differs.

---

## `ref` vs `reactive`

### `ref`

```ts
const todos = ref<Todo[]>([]);
todos.value = await fetchTodos(userId, accessToken);
```

- Works with **primitives** and objects.
- In `<script setup>`, access via `.value`.
- In templates, Vue **auto-unwraps** refs — use `todos`, not `todos.value`.
- Prefer `ref` for replaceable values (arrays, IDs, flags).

### `reactive`

```ts
const state = reactive({ todos: [] as Todo[], filter: 'all' as const });
state.todos.push(item);
```

- Only for **objects**; loses reactivity if destructured (`const { todos } = state`).
- Good for grouped form state; less ideal when you replace whole arrays (`state.todos = newList` works, but easy to break with destructuring).

**This repo (TodoListView):** `ref` for `todos`, `filter`, `loading` — matches Angular’s separate signals and avoids reactive destructuring pitfalls.

---

## `computed` caching

```ts
const filteredTodos = computed(() =>
  applyFilter(todos.value, filter.value)
);
```

- **Lazy:** runs only when `todos` or `filter` change.
- **Cached:** repeated reads in the same render tick return the same result without re-running the function.
- Analogous to Angular `computed(() => …)` and React `useMemo`.

| | Vue `computed` | Angular `computed` | React `useMemo` |
|---|----------------|----------------------|-----------------|
| Invalidation | Proxy dependency tracking | Signal graph | Manual dependency array |
| Re-run trigger | Dependency write | Signal write | Dep array change |

---

## `watch` vs `watchEffect`

### `watch`

```ts
watch(filter, (value) => {
  console.info('[analytics-mfe] todo filter changed:', value);
});
```

- Tracks **explicit sources** (`filter` ref).
- Runs **after** the source changes; old/new values available.
- Does not run on mount unless `{ immediate: true }`.
- Use for side effects tied to specific state (analytics, API refetch, logging).

### `watchEffect`

```ts
watchEffect(() => {
  document.title = `${filteredTodos.value.length} todos`;
});
```

- Auto-collects dependencies inside the callback.
- Runs immediately, then re-runs when any dependency changes.
- Use when the effect should always stay in sync with “whatever was read inside.”

**Todo list:** filter analytics uses `watch(filter)` — explicit, no mount noise.

---

## Comparison with Angular `signal()` / `computed()`

| Concept | Vue 3 | Angular (Phase 2 todo list) |
|---------|-------|-------------------------------|
| Writable state | `ref(0)` / `reactive` | `signal(0)` |
| Read in script | `count.value` | `count()` |
| Read in template | `count` (auto-unwrap) | `count()` |
| Derived | `computed(() => …)` | `computed(() => …)` |
| Side effect | `watch` / `watchEffect` | `effect(() => …)` |
| List identity | `:key="todo.id"` | `@for (…; track todo.id)` |

Both update the DOM without manual `forceUpdate` / `$forceUpdate`.

---

## Immutable updates in TodoListView

Toggle todo (plan requirement):

```ts
todos.value = todos.value.map((item) =>
  item.id === updated.id ? updated : item
);
```

Replacing the array reference triggers ref subscribers and keeps list diff predictable (same pattern as React `setTodos(map)`).

---

## Login form: computed validation

```ts
const errors = computed(() => validateLogin(email.value, password.value));
const isValid = computed(() => isLoginValid(errors.value));
```

- Validation re-runs when `email` or `password` change.
- Template uses `v-model` on inputs — two-way binding on refs.
- Submit blocked when `!isValid` after first submit attempt.

Shared rules live in `libs/shared/validators/email.ts` (same as Angular and React stacks).

---

## DevTools

Open **Vue DevTools** on `/todos`:

- Inspect `todos`, `filter`, `filteredTodos` refs.
- Confirm filter clicks update `filter` and `filteredTodos` without remounting the whole app.

---

## Further reading

- [Vue docs — Reactivity fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue docs — Computed properties](https://vuejs.org/guide/essentials/computed.html)
- [Vue docs — Watchers](https://vuejs.org/guide/essentials/watchers.html)
- [Angular signals guide](https://angular.dev/guide/signals)
