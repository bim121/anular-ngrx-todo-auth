# Phase 0 — Changelog

Цель фазы: Login → Todos CRUD → Logout работает без ручных костылей.

## Инфраструктура

- `provideHttpClient(withInterceptors([authInterceptor]))` — HttpClient + functional interceptor (`src/app/core/auth.interceptors.ts`), который читает `selectToken` и подставляет `Authorization: Bearer <token>` во все запросы кроме первой login/register.
- `provideStore()` + `provideState(authFeatureKey, authReducer)` + `provideState(todosFeatureKey, todosReducer)`.
- `provideEffects(AuthEffects, TodoEffects)`.
- `provideStoreDevtools({ maxAge: 25 })` подключается только в `isDevMode()`.
- npm-скрипты `api`, `dev` (через `concurrently`).

## NgRx — ключи и регистрация

- `authFeatureKey = 'auth'`, `todosFeatureKey = 'todos'` экспортируются из соответствующих reducer'ов и переиспользуются в `provideState` и `createFeatureSelector`.
- Исправлена опечатка `todosFeaureKey` → `todosFeatureKey`.
- Удалён случайный `import { todo } from 'node:test'` в `todo.reducer.ts`.

## Исправленные баги

| Файл | Что было | Что стало |
|------|----------|-----------|
| `auth.effects.ts` | `logoutUser$` слушал `loginSuccess` → редирект на `/login` сразу после логина | Слушает `logoutUser`, навигация на `/login` |
| `auth.reducer.ts` | `loginFailure` ставил `isLoggedIn: true` | `isLoggedIn: false`, ошибка пишется в `state.error` |
| `auth.reducer.ts` | `registerSuccess/Failure` оставляли `isLoading: true` | сбрасывают `isLoading: false` |
| `auth.service.ts` | `"Server error: ${error.status}"` (обычная строка) | шаблонная строка с `${error.status}` |
| `todo.service.ts` | URL `http:localhost:3000/todos` (отсутствует `//`) | `http://localhost:3000/todos` |
| `todo.reducer.ts` | `updateTodoSuccess` маппил `item.id ? todo : item` (всегда `todo`) | `item.id === todo.id ? todo : item` |
| `todo.effects.ts` | `import { access } from 'fs'` (Node-модуль в браузере) | удалён |
| `register.component.html` | `(idLoading$ \| async)` ломал prod-сборку | `(isLoading$ \| async)` |
| `app.html` | дефолтный welcome-шаблон Angular ~340 строк, `<router-outlet />` внизу | минимальный layout с `<main><router-outlet /></main>` |

## Auth Guard

- Использует `router.createUrlTree(['/login'])` вместо `router.navigate` — корректная семантика `CanActivateFn`.

## Logout

- Кнопка в шапке `TodoListComponent`, метод `logout()` диспатчит `AuthActions.logoutUser`.
- `auth.reducer` на `logoutUser` сбрасывает state в `initialState`.
- `todo.reducer` на `logoutUser` сбрасывает state в `initialTodoState` — иначе после смены аккаунта остались бы todos предыдущего пользователя.
- `auth.effects.logoutUser$` навигирует на `/login`.

## Тесты (Vitest, 13 шт)

| Файл | Покрытие |
|------|----------|
| `auth.reducer.spec.ts` | initial state, `loginSuccess`, `loginFailure`, `logoutUser` |
| `auth.selectors.spec.ts` | `selectIsLoggedIn` (false/true) |
| `auth.guard.spec.ts` | allow при логине, `createUrlTree(['/login'])` без логина |
| `todo.reducer.spec.ts` | `updateTodoSuccess` (замена по id), `logoutUser` reset |
| `auth.effects.spec.ts` | `loginUser` → `loginSuccess` через `provideMockActions` |

## Ручная проверка

1. Register → alert «Please Login» → редирект остаётся в форме (Phase 1 добавит auto-redirect).
2. Login `test@example.com / password123` → `/todos`.
3. Add / toggle / edit / delete todo.
4. Logout → `/login`, `authGuard` блокирует прямой переход на `/todos`.
5. Network: запросы к `/todos` идут с заголовком `Authorization: Bearer mockToken=...`.
6. Redux DevTools показывает actions `[Login page] login user` → `[Auth API] Login Success` → `[To do page] load to dods` → `[To do API] to do list success`.

## Что осталось (выйдет в следующие фазы)

- Persistence в `localStorage` (Phase 3).
- UI для ошибок и loading-индикаторов (Phase 1).
- Routing redirect после register (Phase 1).
- Polished UI/layout, dark theme (Phase 2).
- e2e и CI pipeline (Phase 1+).
