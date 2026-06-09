# Phase 2 — Modern Angular (signals, zoneless, signal forms)
> **Теория:** [guides/phase-02-modern-angular-theory.md](./guides/phase-02-modern-angular-theory.md) — статус: placeholder  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 5–6 недель (50–60 ч)  
**Предусловия:** Phase 1  
**Цель:** Zoneless-ready приложение, signals в UI, signal forms на auth, control flow.

---

## Результат фазы

- [ ] `provideZonelessChangeDetection()` (или experimental alias)
- [ ] Todo list на signals + OnPush
- [ ] Auth forms: signal forms branch (feature flag)
- [ ] `@defer`, `@for` с track
- [ ] ADR: NgRx vs httpResource
- [ ] Документ «zoneless caveats»

### React/Next.js (marketing-mfe)

- [ ] Todo list: `useState`, `useEffect`, `useMemo` filtered list
- [ ] `docs/react/reconciliation-and-fiber.md` — теория reconciliation
- [ ] Rules of hooks — lint enforced (`eslint-plugin-react-hooks`)
- [ ] Controlled login form (email/password)
- [ ] `docs/angular-vs-react-state.md` — signals vs hooks comparison

### Vue 3 (analytics-mfe)

- [ ] Todo list: `ref`, `computed`, `watch` для filter
- [ ] `docs/vue/proxy-reactivity-deep-dive.md` — Proxy reactivity
- [ ] `<script setup lang="ts">` login form с v-model
- [ ] Filter chips: all / active / done через `computed`
- [ ] CRUD todos через fetch (до Pinia entity в Phase 3)

---

## Неделя 1 — Signals в компонентах

### 2.1.1 Миграция TodoListComponent

**Было:** `store.select(...) | async`  
**Стало:**

```typescript
readonly todos = toSignal(this.store.select(selectAllTodos), { initialValue: [] });
readonly loading = toSignal(this.store.select(selectTodosLoading), { initialValue: false });
readonly filter = signal<'all' | 'active' | 'done'>('all');

readonly filteredTodos = computed(() => {
  const items = this.todos();
  const f = this.filter();
  // filter logic
});
```

**Шаги:**
1. OnPush на компонент.
2. Заменить async pipe в template на `filteredTodos()`.
3. Outputs: `todoToggled = output<string>()` для dumb child (подготовка Phase 4).

### 2.1.2 input() / output() на dumb components

- `TodoItemComponent`: `todo = input.required<Todo>()`, `toggle = output<void>()`.

### 2.1.3 effect() — только side effects

```typescript
constructor() {
  effect(() => {
    const err = this.error();
    if (err) this.toast.error(err);
  });
}
```

**Правило:** не писать business logic в effect — только UI side effects.

### 2.1.4 Чеклист

- [ ] Нет лишних подписок в компонентах
- [ ] DevTools profiler: меньше CD циклов после миграции

---

## Неделя 2 — Zoneless

### 2.2.1 Включение

**Файл:** `app.config.ts`

```typescript
import { provideZonelessChangeDetection } from '@angular/core';
// или provideExperimentalZonelessChangeDetection() — проверить API Angular 21 docs

providers: [
  provideZonelessChangeDetection(),
  ...
]
```

### 2.2.2 Аудит zone.js

1. `angular.json` — можно ли убрать polyfills zone (если отдельный entry).
2. Тесты: `TestBed` с zoneless provider.
3. Список что сломалось: third-party, `setTimeout` без signals (редко).

### 2.2.3 NgRx + zoneless

- Store updates должны триггерить UI через signals (`toSignal`).
- Проверить router-store navigation.
- DevTools: actions dispatch, UI обновляется.

### 2.2.4 Документ

**Файл:** `docs/zoneless-caveats.md` — таблица проблем и решений.

---

## Неделя 3 — Signal Forms

### 2.3.1 Spike login form

- Параллельный route `/login-signal` или `@if (useSignalForms())` на одной странице.
- Использовать официальный Signal Forms API из Angular 21 docs.

### 2.3.2 Поля и валидация

| Field | Validation |
|-------|------------|
| email | required, email format |
| password | required, minLength |

- Отображение errors через signal form state API.
- Submit → dispatch `login` action (NgRx остаётся).

### 2.3.3 Custom control

- `FormFieldComponent` оборачивает input + label + errors для DS (Phase 6).

### 2.3.4 Сравнительная таблица

**Файл:** `docs/signal-forms-vs-reactive.md`

| Критерий | Reactive | Signal Forms |
|----------|----------|--------------|
| DX | | |
| Perf | | |
| Testability | | |
| SSR | | |

---

## Неделя 4 — Control flow & defer

### 2.4.1 Template migration

```html
@for (todo of filteredTodos(); track todo.id) {
  <app-todo-item [todo]="todo" />
} @empty {
  <p>No todos</p>
}

@if (loading()) {
  <app-spinner />
}
```

### 2.4.2 @defer

```html
@defer (on viewport) {
  <app-todo-stats-panel />
} @placeholder {
  <div class="skeleton" />
}
```

Тяжёлая панель статистики (можно mock 100ms computation).

### 2.4.3 @let

```html
@let count = filteredTodos().length;
<span>{{ count }} items</span>
```

---

## Неделя 5–6 — httpResource spike

### 2.5.1 Read-only experiment

- Endpoint: `GET /users/me` mock profile (добавить в db.json).
- Компонент `UserProfileComponent` использует `httpResource` **без** NgRx.
- ADR-006: когда local resource vs global store.

### 2.5.2 Не дублировать todos

Todos остаются в NgRx — spike только для secondary data.

---

## Тестирование

- [ ] Component tests с `fixture.detectChanges()` в zoneless
- [ ] Signal forms: invalid submit blocked
- [ ] Snapshot template с `@for` track

---

## Критерии готовности

1. App runs zoneless без console errors 5 min session.
2. ≥50% templates use signals not async pipe.
3. Login works on both reactive and signal forms paths.
4. `docs/zoneless-caveats.md` exists.

---

## Стек React / Next.js (marketing-mfe)

> Параллель Angular signals ↔ React hooks. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md) и [guides/react-next-faang-theory.md](./guides/react-next-faang-theory.md).

### R.2.1 — Todo list на hooks

**Файл:** `apps/marketing-mfe/src/features/todos/TodoList.tsx`

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

useEffect(() => {
  fetch('http://localhost:3000/todos?userId=...')
    .then(r => r.json())
    .then(setTodos);
}, [userId]);

const filtered = useMemo(() => applyFilter(todos, filter), [todos, filter]);
```

**Шаги:**
1. Add / toggle / delete через `setTodos` + fetch mutations.
2. Loading + error states в UI.
3. Сравнить re-render count с Angular signals (React DevTools Profiler).

**Критерий:** 3 фильтра работают; нет infinite loop в `useEffect`.

### R.2.2 — Controlled login form

```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
// controlled inputs, submit handler, disabled while loading
```

**Проверка:** invalid email blocked client-side; same validators as Angular Phase 1.

### R.2.3 — Reconciliation doc

**Файл:** `docs/react/reconciliation-and-fiber.md`

- Virtual DOM diff, Fiber, keys in lists.
- Сравнение с Angular `@for (track todo.id)`.
- Ссылка на [guides/react-next-faang-theory.md](./guides/react-next-faang-theory.md).

**Критерий:** ADR или doc section «Angular signals vs React useState» в `docs/angular-vs-react-state.md`.

---

## Стек Vue 3 (analytics-mfe)

### V.2.1 — Todo list на reactivity

**Файл:** `apps/analytics-mfe/src/features/todos/TodoListView.vue`

```vue
<script setup lang="ts">
const todos = ref<Todo[]>([]);
const filter = ref<'all' | 'active' | 'done'>('all');
const filteredTodos = computed(() => applyFilter(todos.value, filter.value));

watch(filter, () => { /* optional analytics log */ });

onMounted(async () => {
  todos.value = await fetchTodos(userId);
});
</script>
```

**Шаги:**
1. `<script setup lang="ts">` на всех новых компонентах.
2. Toggle todo через `todos.value = todos.value.map(...)`.
3. `@click` filter buttons меняют `filter`.

**Критерий:** UI обновляется без manual `forceUpdate`; Vue DevTools показывает refs.

### V.2.2 — Login form (script setup)

```vue
const email = ref('');
const password = ref('');
const errors = computed(() => validateLogin(email.value, password.value));
```

**Проверка:** v-model на inputs; submit blocked when invalid.

### V.2.3 — Reactivity deep dive

**Файл:** `docs/vue/proxy-reactivity-deep-dive.md`

- `ref` vs `reactive`, `computed` caching, `watch` vs `watchEffect`.
- Сравнение с Angular `signal()` / `computed()`.

---

## Следующая фаза

→ [phase-03-advanced-ngrx.md](./phase-03-advanced-ngrx.md)


