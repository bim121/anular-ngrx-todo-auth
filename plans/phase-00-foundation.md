# Phase 0 — Стабильный фундамент
> **Теория:** [guides/phase-00-foundation-theory.md](./guides/phase-00-foundation-theory.md) — статус: placeholder  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 1–2 недели (10–20 ч)  
**Предусловия:** Node 20+, `npm install`  
**Цель:** Login → Todos CRUD → Logout работает без ручных костылей.

---

## Результат фазы

- [ ] `npm run dev` поднимает Angular + json-server
- [ ] NgRx store/effects/http зарегистрированы
- [ ] Все известные баги из аудита исправлены
- [ ] Минимум 5 unit-тестов зелёные
- [ ] README с инструкцией запуска

### React/Next.js (marketing-mfe)

- [ ] `apps/marketing-mfe/package.json` — placeholder в Nx/monorepo workspace
- [ ] Общий `tsconfig.base.json` со strict для всех apps
- [ ] `docs/multi-stack/00-monorepo-layout.md` — схема apps и libs
- [ ] Скрипт `npm run dev:marketing` (placeholder: echo или `next dev` stub)
- [ ] README: marketing-mfe будет Next в Phase 7, сейчас только slot

### Vue 3 (analytics-mfe)

- [ ] `apps/analytics-mfe` — `npm create vue@latest` minimal hello
- [ ] Pinia + Vue Router установлены (пустые stores/routes)
- [ ] Hello-компонент делает fetch к json-server `/todos` (smoke test)
- [ ] `npm run dev:analytics` в корневом package.json
- [ ] Порт analytics не конфликтует с Angular (например `:5173`)

---

## Блок A — Подключение инфраструктуры приложения

### A.1 HttpClient

**Файл:** `src/app/app.config.ts`

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// позже: authInterceptor из core
provideHttpClient(withInterceptors([authInterceptor])),
```

**Шаги:**
1. Добавить `provideHttpClient()` без interceptors — проверить, что сервисы не падают.
2. Создать `src/app/core/interceptors/auth.interceptor.ts` (functional interceptor).
3. Читать token через `inject(Store).select(selectToken)` + `filter(Boolean)` + `take(1)` или синхронный snapshot если уже в state после rehydrate (Phase 3).
4. Клонировать request с header `Authorization: Bearer <token>`.

**Проверка:** Network tab — запросы к todos с header (после login).

---

### A.2 Регистрация NgRx

**Файл:** `src/app/app.config.ts`

```typescript
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './auth/auth.reducer';
import { todosReducer } from './todos/todo.reducer';
import { AuthEffects } from './auth/auth.effects';
import { TodoEffects } from './todos/todo.effects';

provideStore(), // root
provideState('auth', authReducer),
provideState('todos', todosReducer),
provideEffects(AuthEffects, TodoEffects),
```

**Шаги:**
1. Убедиться, что `authFeatureKey` / selector keys совпадают (`'auth'`, `'todos'`).
2. Включить `@ngrx/store-devtools` только в dev (опционально в 0, обязательно в 3).
3. Запустить приложение — Redux DevTools видит actions.

---

### A.3 npm scripts

**Файл:** `package.json`

```json
{
  "scripts": {
    "api": "json-server --watch db.json --port 3000",
    "dev": "concurrently \"npm run api\" \"ng serve\"",
    "dev:ssr": "concurrently \"npm run api\" \"ng serve\" 
  }
}
```

**Зависимость:** `concurrently` в devDependencies.

**Шаги:**
1. Добавить скрипты.
2. Обновить `README.md`: порты, тестовый user из db.json.
3. Проверить CORS (json-server beta обычно разрешает localhost).

---

## Блок B — Исправление багов (по файлам)

### B.1 `auth.effects.ts` — logout

**Проблема:** `logoutUser$` слушает `loginSuccess`.

**Исправление:**
```typescript
logoutUser$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.logoutUser),
    tap(() => {
      this.router.navigate(['/login']);
    }),
  ),
  { dispatch: false },
);
```

**Дополнительно:** effect на `logoutSuccess` → `localStorage.removeItem` (если используется).

---

### B.2 `auth.reducer.ts` — loginFailure

**Проблема:** `isLoggedIn: true` при ошибке.

```typescript
on(loginFailure, (state, { error }) => ({
  ...state,
  isLoading: false,
  isLoggedIn: false,
  error,
})),
```

**Также:** register success/failure — сброс `isLoading: false`.

---

### B.3 `todo.service.ts` — URL

```typescript
private readonly apiUrl = 'http://localhost:3000/todos';
```

---

### B.4 `todo.reducer.ts` — updateTodoSuccess

```typescript
on(updateTodoSuccess, (state, { todo }) => ({
  ...state,
  items: state.items.map((item) =>
    item.id === todo.id ? todo : item
  ),
})),
```

Удалить импорт `from 'node:test'`.

---

### B.5 `todo.effects.ts`

- Удалить `import { access } from 'fs'`.
- Проверить все `ofType` соответствуют actions.

---

### B.6 `auth.service.ts` — template string

```typescript
throw new Error(`Server error: ${error.status}`);
```

---

### B.7 `register.component`

- `standalone: true` в `@Component`.
- HTML: `isLoading$` вместо `idLoading$`.

---

### B.8 `app.ts`

- Исправить `styleUrl` → существующий файл или удалить.
- Shell только `<router-outlet />` или layout component.

---

## Блок C — UX минимум

### C.1 Routes

**Файл:** `src/app/app.routes.ts`

```typescript
{ path: '', pathMatch: 'full', redirectTo: 'todos' },
{ path: 'login', loadComponent: () => import('./auth/login/...') },
{ path: 'todos', canActivate: [authGuard], loadComponent: () => ... },
```

### C.2 Logout button

- В `TodoListComponent` или header: `store.dispatch(logoutUser())`.
- Reducer: `on(logoutUser)` → initial state или `on(logoutSuccess)`.

### C.3 Убрать CLI placeholder

**Файл:** `src/app/app.html` — только layout:
```html
<header>...</header>
<main><router-outlet /></main>
```

---

## Блок D — Тесты (Vitest)

| Файл | Что тестировать |
|------|-----------------|
| `auth.reducer.spec.ts` | loginSuccess, loginFailure, logout |
| `auth.selectors.spec.ts` | selectIsLoggedIn |
| `auth.guard.spec.ts` | redirect когда не logged in |
| `todo.reducer.spec.ts` | updateTodoSuccess map |
| `auth.effects.spec.ts` | 1 marble: login → loginSuccess |

**Команда:** `npm test`

---

## Блок E — Чеклист ручного тестирования

1. [ ] Register нового user → redirect/login
2. [ ] Login `test@example.com` / `password123`
3. [ ] Load todos только своего userId
4. [ ] Add todo
5. [ ] Toggle completed
6. [ ] Edit task text
7. [ ] Delete todo
8. [ ] Logout → `/login`, guard блокирует `/todos`
9. [ ] Refresh страницы на `/todos` (без persistence — ожидаемо logout; Phase 3 добавит)

---

## Артефакты

- `README.md` — How to run
- Опционально: `docs/phase-0-changelog.md`

---

## Типичные ошибки

| Симптом | Причина |
|---------|---------|
| HttpClient injection error | Нет `provideHttpClient` |
| Actions без state change | Нет `provideState` |
| Effects не бегут | Нет `provideEffects` |
| Пустой todos | Неверный URL / userId filter |
| Двойная навигация | Дублирующие effects |

---

## Стек React / Next.js (marketing-mfe)

> Placeholder в monorepo; полный Next scaffold — [Phase 7](./phase-07-seo-ssr-i18n.md). См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.0.1 — Слот в monorepo

**Цель:** зарезервировать `apps/marketing-mfe` без полноценного Next до Phase 7.

**Шаги:**
1. Создать `apps/marketing-mfe/package.json` с `"name": "marketing-mfe"`, `"private": true`.
2. Минимальный `src/index.ts` или README: «Next.js marketing site — Phase 7».
3. Добавить project в `nx.json` / workspace config с tag `scope:marketing`.

**Проверка:** `nx show projects` включает `marketing-mfe`.

### R.0.2 — Общий strict TypeScript

**Файл:** `tsconfig.base.json` (корень workspace)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

**Шаги:**
1. Убедиться, что Angular app extends base config.
2. marketing-mfe tsconfig extends base — даже для placeholder.

**Критерий:** `nx run-many -t typecheck` (или `tsc -b`) без ошибок на всех apps.

### R.0.3 — Документация layout

**Файл:** `docs/multi-stack/00-monorepo-layout.md`

- Таблица apps: shell (Angular), todos-mfe, admin-mfe, marketing-mfe, analytics-mfe.
- Порты dev-серверов, json-server `:3000`.
- Ссылка на [polyglot-mfe-architecture.md](./polyglot-mfe-architecture.md).

---

## Стек Vue 3 (analytics-mfe)

> Первая рабочая MFE помимо Angular; dashboard и charts — Phase 5–6.

### V.0.1 — Scaffold analytics-mfe

```bash
cd apps
npm create vue@latest analytics-mfe -- --typescript --router --pinia
```

**Шаги:**
1. Router: единственный route `/` → `HelloAnalytics.vue`.
2. Удалить demo-контент, оставить минимальный layout.
3. `vite.config.ts`: proxy `/api` → `http://localhost:3000` (опционально).

**Проверка:** `npm run dev` в `apps/analytics-mfe` — страница «Analytics MFE».

### V.0.2 — Pinia + Router (пустые)

**Файлы:**
- `src/stores/auth.ts` — `{ token: null, userId: null }` stub
- `src/router/index.ts` — `/`, `/login` (redirect stub)

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => ({
  token: ref<string | null>(null),
  userId: ref<string | null>(null),
}));
```

**Критерий:** DevTools Pinia видит store; login route рендерит placeholder.

### V.0.3 — Smoke fetch json-server

```typescript
// composables/useHealthCheck.ts
export function useHealthCheck() {
  const status = ref<'ok' | 'error' | 'loading'>('loading');
  onMounted(async () => {
    try {
      await fetch('http://localhost:3000/todos');
      status.value = 'ok';
    } catch {
      status.value = 'error';
    }
  });
  return { status };
}
```

**Проверка:** при `npm run api` + dev analytics — badge «API ok».

**Команда (корень):** добавить в `package.json`:
```json
"dev:analytics": "npm run dev --workspace=analytics-mfe"
```

---

## Следующая фаза

→ [phase-01-production-core.md](./phase-01-production-core.md)


