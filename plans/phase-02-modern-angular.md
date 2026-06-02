# Phase 2 — Modern Angular (signals, zoneless, signal forms)
> **Теория:** [guides/phase-02-modern-angular-theory.md](./guides/phase-02-modern-angular-theory.md) — статус: placeholder


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

## Следующая фаза

→ [phase-03-advanced-ngrx.md](./phase-03-advanced-ngrx.md)


