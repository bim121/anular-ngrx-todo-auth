# Phase 1 — Production-grade core

**Длительность:** 3–4 недели (30–40 ч)  
**Предусловия:** [Phase 0](./phase-00-foundation.md) выполнена полностью  
**Цель:** Чистая структура, routing, формы, ошибки, контракт API, lint.

---

## Результат фазы

- [ ] Структура `core/`, `shared/`, `features/`, `layout/`
- [ ] Path aliases в tsconfig
- [ ] Guards: auth + guest
- [ ] Reactive forms + validators
- [ ] Toast вместо alert
- [ ] ESLint + Husky
- [ ] ADR-001, ADR-002 в `docs/adr/`
- [ ] `docs/api-contract.yaml`

---

## Неделя 1 — Реструктуризация

### 1.1 Целевая структура папок

```
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── services/          # global error handler
│   └── index.ts           # осторожно с barrel
├── shared/
│   ├── ui/                # toast, spinner (minimal)
│   ├── pipes/
│   └── validators/
├── layout/
│   ├── main-layout/
│   └── auth-layout/
├── features/
│   ├── auth/
│   │   ├── data-access/   # actions, effects, reducer, selectors, service
│   │   └── pages/         # login, register
│   └── todos/
│       ├── data-access/
│       └── pages/
└── app.config.ts
```

**Шаги (по одному PR-логическому блоку):**
1. Создать папки, переместить файлы без изменения логики.
2. Обновить все import paths.
3. `ng build` после каждого крупного move.
4. Написать ADR-001: почему feature-based, границы core vs shared.

### 1.2 Path aliases

**Файл:** `tsconfig.json` → `compilerOptions.paths`

```json
{
  "@app/core/*": ["src/app/core/*"],
  "@app/shared/*": ["src/app/shared/*"],
  "@app/features/auth/*": ["src/app/features/auth/*"],
  "@app/features/todos/*": ["src/app/features/todos/*"]
}
```

Проверить, что `@angular/build` подхватывает paths (в Angular 17+ обычно да).

### 1.3 Layout components

| Компонент | Назначение |
|-----------|------------|
| `MainLayoutComponent` | header (user, logout), footer, outlet |
| `AuthLayoutComponent` | центрированная карточка для login/register |

**Routes:** children под layout:
```typescript
{
  path: '',
  component: MainLayoutComponent,
  children: [
    { path: 'todos', ... },
  ],
},
{
  path: '',
  component: AuthLayoutComponent,
  children: [
    { path: 'login', ... },
    { path: 'register', ... },
  ],
},
```

---

## Неделя 2 — Routing & guards

### 2.1 Lazy loading (довести)

- Все feature routes через `loadComponent` / `loadChildren`.
- Отдельные chunks в build output (проверить `ng build --stats-json`).

### 2.2 Guards

| Guard | Файл | Логика |
|-------|------|--------|
| `authGuard` | `core/guards/auth.guard.ts` | `selectIsLoggedIn` → true или `UrlTree` to login |
| `guestGuard` | `core/guards/guest.guard.ts` | logged in → redirect `/todos` |

Functional guards + `inject(Store)` + `map` + `take(1)`.

### 2.3 Route data

```typescript
{
  path: 'todos',
  data: { title: 'My Todos', breadcrumb: 'Todos' },
}
```

Подготовка к Phase 7 (Title service).

### 2.4 Preloading

- `withPreloading(PreloadAllModules)` или custom `TodosPreloadStrategy` — измерить размер chunk todos.

---

## Неделя 3 — Errors, loading, forms

### 3.1 Global ErrorHandler

**Файл:** `core/services/global-error.handler.ts`

- Лог в console (dev).
- Отправка в store: `ui/error` slice (опционально) или toast.
- Не глотать NgRx errors — только необработанные exceptions.

### 3.2 Toast service

**Минимум без Material:**
- `shared/ui/toast/toast.service.ts` — Subject + компонент overlay.
- API: `toast.success(msg)`, `toast.error(msg)`.
- Заменить `alert()` в `auth.effects.ts` register success.

### 3.3 Loading states

- Селектор `selectAuthLoading`, `selectTodosLoading`.
- Шаблон: `@if (loading()) { <app-spinner /> }`.
- Disable кнопок submit при loading.

### 3.4 Retry в effects

```typescript
pipe(
  exhaustMap(...),
  retry({ count: 2, delay: 1000 }),
  catchError((error) => of(todoActions.loadTodosFailure({ error }))),
)
```

Только для GET/load, не для всех мутаций.

### 3.5 Reactive forms — Login

| Control | Validators |
|---------|------------|
| email | required, email |
| password | required, minLength(8) |

- Error messages в шаблоне: `@if (form.controls.email.hasError('required'))`.
- `submit()`: если invalid → `markAllAsTouched()`.

### 3.6 Reactive forms — Register

- passwordConfirm + custom validator `passwordMatch`.
- Async validator: email unique (GET `/users?email=`).

### 3.7 ADR-002

Тема: Template-driven vs Reactive — почему reactive для auth.

---

## Неделя 4 — API contract & quality

### 4.1 json-server middleware

**Файл:** `server/middleware.js` или `json-server.json`

- Простая проверка `Authorization` header (mock).
- POST `/users` — reject duplicate email.

### 4.2 Фильтрация todos

- GET `/todos?userId=xxx` — убедиться, что effects передают query param.

### 4.3 api-contract.yaml

```yaml
openapi: 3.0.0
paths:
  /users:
    get: ...
  /todos:
    get:
      parameters:
        - name: userId
          in: query
```

### 4.4 ESLint

```bash
ng add @angular-eslint/schematics
```

- `angular.json` → lint target.
- Правила: `component-selector`, `prefer-on-push` (warn).

### 4.5 Husky

```bash
npx husky init
```

pre-commit: `npm run lint && npm test`

### 4.6 Seed script

**Файл:** `scripts/seed-db.js` — сброс db.json к начальному состоянию.

---

## Критерии готовности (детально)

| # | Критерий | Как проверить |
|---|----------|---------------|
| 1 | Нет импортов из `features` в `shared` | dependency-cruiser или ручной grep |
| 2 | Login invalid показывает ошибки полей | e2e или manual |
| 3 | Duplicate email register fails | manual |
| 4 | Lint в CI локально проходит | `npm run lint` |
| 5 | api-contract описывает все endpoints | review yaml |

---

## Ресурсы

- Angular Routing: functional guards, `CanMatchFn`
- NgRx: error handling в effects
- json-server custom routes docs

---

## Сквозные фичи (product roadmap)

По мере готовности форм — задел под AuthZ:

- [ ] Модель `User` с полем `roles: string[]` (пока mock, Phase 17 — из Keycloak claims)
- [ ] См. [product-features-expansion.md](./product-features-expansion.md) — пока без крупных фич, только структура

---

## Следующая фаза

→ [phase-02-modern-angular.md](./phase-02-modern-angular.md)
