# Phase 3 — Advanced NgRx
> **Теория:** [guides/phase-03-advanced-ngrx-theory.md](./guides/phase-03-advanced-ngrx-theory.md) — статус: placeholder


**Длительность:** 7–8 недель (60–80 ч)  
**Предусловия:** Phase 2  
**Цель:** Entity state, optimistic UI, SignalStore для UI, persistence, marble tests.

---

## Результат фазы

- [ ] `@ngrx/entity` для todos
- [ ] `createFeature` + extraSelectors
- [ ] Optimistic toggle + rollback
- [ ] `@ngrx/signals` signalStore для filter/edit UI
- [ ] localStorage meta-reducer
- [ ] Store DevTools + sanitizers
- [ ] Marble tests для всех effects
- [ ] ADR-003: Store vs ComponentStore vs SignalStore

---

## Неделя 1 — createFeature & Entity

### 3.1.1 Рефакторинг auth feature

```typescript
export const authFeature = createFeature({
  name: 'auth',
  reducer: authReducer,
  extraSelectors: ({ selectAuthState }) => ({
    selectIsAuthenticated: createSelector(
      selectAuthState,
      (s) => s.isLoggedIn && !!s.token
    ),
  }),
});
```

Экспорт: `authFeature.selectIsAuthenticated`, etc.

### 3.1.2 Entity Adapter для todos

```typescript
import { createEntityAdapter, EntityState } from '@ngrx/entity';

export interface TodosState extends EntityState<Todo> {
  loading: boolean;
  error: string | null;
}

const adapter = createEntityAdapter<Todo>({ selectId: (t) => t.id });

export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal,
} = adapter.getSelectors();
```

**Reducer handlers:**
- `loadTodosSuccess` → `adapter.setAll(todos, state)`
- `addTodoSuccess` → `adapter.addOne(todo, state)`
- `updateTodoSuccess` → `adapter.updateOne({ id, changes }, state)`
- `deleteTodoSuccess` → `adapter.removeOne(id, state)`

### 3.1.3 Селекторы с props

```typescript
export const selectTodoById = (id: string) =>
  createSelector(selectTodoEntities, (entities) => entities[id]);
```

---

## Неделя 2 — Effects advanced

### 3.2.1 concatLatestFrom

Заменить `withLatestFrom` где нужен последний store snapshot после action.

### 3.2.2 Таблица operators (документ)

**Файл:** `docs/ngrx-effects-operators.md`

| Effect | Operator | Почему |
|--------|----------|--------|
| login | exhaustMap | ignore double click |
| loadTodos | switchMap | cancel previous load |
| addTodo | concatMap | order preserved |

### 3.2.3 Cancel on logout

```typescript
private readonly destroy$ = new Subject<void>();

// в logout effect:
tap(() => this.destroy$.next()),

// в load effect:
takeUntil(this.destroy$),
```

### 3.2.4 Non-dispatching effects

- Analytics mock: `tap` log action type.
- Navigation (уже есть) — consolidate.

---

## Неделя 3 — Optimistic updates

### 3.3.1 Toggle todo flow

**Actions:**
- `toggleTodoOptimistic({ id })` — reducer сразу меняет completed.
- `toggleTodo` → HTTP → `toggleTodoSuccess` | `toggleTodoFailure`.

**Failure:** rollback через `adapter.updateOne` с предыдущим значением или reload all.

### 3.3.2 UI

- Checkbox disabled только на время request (optional).
- Toast on rollback failure.

### 3.3.3 Тесты

- Reducer test: optimistic then rollback.
- Marble: success path / failure path.

---

## Неделя 4 — SignalStore (UI state)

### 3.4.1 TodoListUiStore

```typescript
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

type TodoListUiState = {
  filter: 'all' | 'active' | 'done';
  editingId: string | null;
};

export const TodoListUiStore = signalStore(
  withState<TodoListUiState>({ filter: 'all', editingId: null }),
  withMethods((store) => ({
    setFilter(filter: TodoListUiState['filter']) {
      patchState(store, { filter });
    },
  })),
);
```

Provide в `TodoListPage` — **не** в root.

### 3.4.2 ADR-003

Global NgRx vs SignalStore boundaries.

---

## Неделя 5 — Router store & persistence

### 3.5.1 Custom Router Serializer

```typescript
export interface RouterReducerState {
  url: string;
  params: Params;
  queryParams: Params;
}
```

Только нужные поля — меньше memory.

### 3.5.2 Effect on navigation

`routerNavigated` + `selectUserId` → dispatch `loadTodos` если user authenticated.

### 3.5.3 ngrx-store-localstorage

```typescript
import { localStorageSync } from 'ngrx-store-localstorage';

const metaReducers: MetaReducer[] = [
  localStorageSync({
    keys: [{ auth: ['token', 'user', 'isLoggedIn'] }],
    rehydrate: true,
  }),
];
```

**Race fix:** `APP_INITIALIZER` или guard ждёт `_persistedAt` flag.

### 3.5.4 Meta-reducer reset on logout

```typescript
function clearStateMeta(reducer) {
  return (state, action) => {
    if (action.type === logoutSuccess.type) {
      state = undefined;
    }
    return reducer(state, action);
  };
}
```

### 3.5.5 strictStateChecks (dev)

`provideStore({ metaReducers, runtimeChecks: { strictStateImmutability: true, ... }})`

---

## Неделя 6 — DevTools & testing

### 3.6.1 DevTools

```typescript
provideStoreDevtools({
  maxAge: 50,
  actionSanitizer: (action) => {
    if (action.type.includes('login')) {
      return { ...action, password: '***' };
    }
    return action;
  },
}),
```

### 3.6.2 Marble tests (все effects)

Шаблон `auth.effects.spec.ts`:

```typescript
actions$ = hot('-a', { a: login({ ... }) });
const expected = cold('-b', { b: loginSuccess({ ... }) });
expect(effects.login$).toBeObservable(expected);
```

### 3.6.3 Reducer coverage

Цель: 100% lines на auth + todos reducers.

---

## Feature flags slice (подготовка tenant)

```typescript
interface AppConfigState {
  features: Record<string, boolean>;
}
```

Mock load from `assets/config.json` в APP_INITIALIZER.

---

## Критерии готовности

| # | Проверка |
|---|----------|
| 1 | Refresh сохраняет session |
| 2 | Logout очищает store + localStorage |
| 3 | Toggle optimistic с rollback при 500 |
| 4 | Entity selectors в DevTools |
| 5 | ≥10 marble tests green |

---

## Product features (из [product-features-expansion.md](./product-features-expansion.md))

**В этой фазе внедрить (опционально 1–2 за раз):**

### PF-3.1 Tags & priorities (V3)

- [ ] Расширить `Todo` model: `tags: string[]`, `priority`
- [ ] Entity adapter + `selectTodosByTag`
- [ ] UI: filter chips в SignalStore

### PF-3.2 Subtasks (V3)

- [ ] `parentId?: string` на Todo
- [ ] Selector `selectTodoTree`

### PF-7.1 Notifications entity (V7)

- [ ] Slice `notifications` + `adapter.addOne` on `todoAssigned` mock event

---

## Следующая фаза

→ [phase-04-architecture-patterns.md](./phase-04-architecture-patterns.md)


