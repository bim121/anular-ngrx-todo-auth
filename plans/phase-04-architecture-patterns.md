# Phase 4 — Architecture & patterns

> **Теория:** [guides/phase-04-architecture-patterns-theory.md](./guides/phase-04-architecture-patterns-theory.md) — статус: placeholder  
> **Backend CQRS:** [../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md](../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md) — **full**

**Длительность:** 9–10 недели (40–50 ч)  
**Предусловия:** Phase 3  
**Цель:** Facades, smart/dumb, repository abstraction, state machines, Nx monorepo.

---

## Результат фазы

- [ ] `AuthFacade`, `TodosFacade`
- [ ] Smart/dumb split для todos
- [ ] `TodoRepository` interface + json implementation + **`HttpTodoRepository` skeleton** (still json-server until Phase 13)
- [ ] Таблица CQRS-lite ↔ backend Commands (см. ниже)
- [ ] Auth state machine documented + implemented
- [ ] Nx workspace с libs
- [ ] Interceptor chain complete
- [ ] ADR-007 layering rules

---

## Неделя 1 — Smart / Dumb

### 4.1.1 Разделение компонентов

| Тип | Компонент | Ответственность |
|-----|-----------|-----------------|
| Smart | `TodoListPageComponent` | facade, dispatch, routing |
| Dumb | `TodoItemComponent` | render, emit events |
| Dumb | `TodoFormComponent` | form UI only |
| Dumb | `TodoFilterComponent` | filter buttons |

### 4.1.2 Правила dumb

- Только `input()` / `output()`, OnPush.
- Нет `Store`, нет `Router`, нет `HttpClient`.

### 4.1.3 Тесты dumb

- `fixture.componentRef.setInput('todo', mockTodo)`.
- Output spy на `toggle`.

---

## Неделя 2 — Facades

### 4.2.1 AuthFacade

```typescript
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private store = inject(Store);

  readonly user = toSignal(this.store.select(selectUser), { initialValue: null });
  readonly isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });
  readonly loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });

  login(credentials: LoginDto): void {
    this.store.dispatch(AuthActions.login(credentials));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logoutUser());
  }
}
```

### 4.2.2 TodosFacade

- Commands: `load()`, `add(task)`, `update(todo)`, `remove(id)`, `toggle(id)`.
- Queries: `todos()`, `loading()`, `error()`.

### 4.2.3 Запрет прямого Store в pages

ESLint rule custom или code review checklist: components in `pages/` only inject facades.

---

## Неделя 3 — Repository pattern

### 4.3.1 Interface

```typescript
export interface TodoRepository {
  getAll(userId: string): Observable<Todo[]>;
  create(todo: CreateTodoDto): Observable<Todo>;
  update(todo: Todo): Observable<Todo>;
  delete(id: string): Observable<void>;
}
```

### 4.3.2 Implementations

| Class | Когда |
|-------|-------|
| `JsonServerTodoRepository` | сейчас |
| `HttpTodoRepository` | Phase 13 |

### 4.3.3 DI

```typescript
{ provide: TodoRepository, useClass: JsonServerTodoRepository },
```

Effects используют repository, не HttpClient напрямую.

---

## Неделя 4 — State machines

### 4.4.1 Auth machine

States: `idle | submitting | authenticated | error`

**Вариант A:** XState interpreter в effect  
**Вариант B:** NgRx reducer с discriminated union `status`

```typescript
type AuthStatus = 'idle' | 'submitting' | 'authenticated' | 'error';
```

### 4.4.2 Todo item edit machine

Per-item: `viewing | editing | saving` в SignalStore или local component state.

### 4.4.3 Диаграмма

**Файл:** `docs/auth-state-machine.mmd`

---

## Неделя 5 — Cross-cutting

### 4.5.1 Interceptor chain (порядок)

1. `correlationIdInterceptor` — header `X-Correlation-Id: uuid`
2. `authInterceptor`
3. `loggingInterceptor` (dev)
4. `retryInterceptor` (GET only)

### 4.5.2 APP_INITIALIZER

```typescript
export function loadAppConfig() {
  return inject(ConfigService).load();
}
```

`assets/app-config.json` — feature flags, api base url.

### 4.5.3 Strategy: TodoFilterStrategy

```typescript
interface TodoFilterStrategy {
  apply(todos: Todo[]): Todo[];
}
class ActiveTodoFilter implements TodoFilterStrategy { ... }
```

Inject в facade computed.

### 4.5.4 Event bus (1 case)

`ThemeService` / `UiEventsService` — `themeChanged$` для decouple header от features.

---

## Неделя 6–7 — Nx migration

### 4.6.1 Команды

```bash
npx nx@latest init
# или create-nx-workspace migration
```

### 4.6.2 Target structure

```
apps/
  web/                    # бывший main app
libs/
  auth/data-access/
  auth/feature-login/
  todos/data-access/
  todos/feature-list/
  shared/ui/
```

### 4.6.3 Boundaries

**project.json tags:**
- `scope:auth`, `scope:todos`, `type:data-access`, `type:ui`

**eslint rule:** `@nx/enforce-module-boundaries`

### 4.6.4 Пошаговая миграция

1. [ ] Создать libs, скопировать код.
2. [ ] Обновить imports на `@anular-ngrx/auth-data-access`.
3. [ ] `nx build web` green.
4. [ ] `nx test` per lib.

---

## CQRS-lite ↔ Backend MediatR (integration prep)

| Frontend (Facade) | NgRx | Backend (B-03) |
|-------------------|------|----------------|
| `TodosFacade.add()` | `addTodo` action | `CreateTodoCommand` |
| `TodosFacade.load()` | `loadTodos` + selector | `GetTodosQuery` |
| `TodosFacade.update()` | `updateTodo` | `UpdateTodoCommand` |
| `TodosFacade.remove()` | `removeTodo` | `DeleteTodoCommand` |

`HttpTodoRepository` — skeleton с `environment.apiUrl`, default still `JsonServerTodoRepository`.  
См. [integration-map.md](./integration-map.md).

---

## ADR-007

Layering: data-access → feature → ui → app shell. Запрет циклов.

---

## Критерии готовности

- [ ] Zero `Store` inject in dumb components
- [ ] Swap `TodoRepository` mock in test without HTTP
- [ ] `nx graph` без circular deps
- [ ] State machine doc matches code

---

## Product features

### PF-1.1 WebSocket prep (V1 Collaboration)

- [ ] `RealtimeService` interface в `core/`
- [ ] Mock implementation + NgRx effect skeleton (полная реализация Phase 4–5)

### PF-1.2 Comments (V1)

- [ ] `Comment` entity + `CommentsFacade`
- [ ] `TodoItem` expandable comments section

---

## Следующая фаза

→ [phase-05-performance.md](./phase-05-performance.md)
