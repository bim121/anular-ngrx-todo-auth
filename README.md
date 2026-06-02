# Angular NgRx Todo Auth

Todo-приложение на Angular 21 с авторизацией и NgRx (store + effects + router-store + devtools). REST подделан через `json-server` и `db.json`.

**Текущий этап:** Phase 0 завершён — Login → Todos CRUD → Logout работает.

## Стек

- Angular 21 (standalone components, SSR)
- NgRx Store / Effects / Router-Store / Store-DevTools
- RxJS, TypeScript 5.9
- json-server — mock REST API
- Vitest — unit-тесты

## Установка

```bash
npm install
```

## Запуск (dev)

Один скрипт поднимает API (`:3000`) и Angular (`:4200`) параллельно:

```bash
npm run dev
```

Если хочется отдельно:

```bash
npm run api      # json-server :3000
npm start        # ng serve   :4200
```

Открыть [http://localhost:4200](http://localhost:4200).

## Тестовый пользователь

Из `db.json`:

| email | password |
|-------|----------|
| `test@example.com` | `password123` |

Регистрация новых пользователей через `/register` тоже работает — записи пишутся в `db.json`.

## Скрипты

| Скрипт | Что делает |
|--------|------------|
| `npm start` | `ng serve` (только Angular) |
| `npm run api` | `json-server db.json -p 3000` |
| `npm run dev` | API + Angular одновременно |
| `npm run build` | Production-сборка |
| `npm run build:stats` | Сборка + `stats.json` (анализ lazy chunks) |
| `npm test` | Vitest unit-тесты |

После `npm run build` в выводе CLI смотри **Lazy chunk files** — отдельные бандлы для `auth-routes`, `todos-routes`, layouts и страниц login/register/todos.

### Preloading (Phase 1.4)

`TodosPreloadStrategy` в `app.config.ts` — после старта приложения в фоне подгружается только todos feature (`data: { preload: true }` в `app.routes.ts`). Auth chunks остаются lazy до перехода на `/login`.

Примерные размеры todos-related chunks (production build):

| Chunk | Raw | Transfer (gzip) |
|-------|-----|-----------------|
| `todos-routes` | ~0.6 kB | ~0.6 kB |
| `main-layout-component` | ~3.6 kB | ~1.3 kB |
| `todo-list-component` | ~6.8 kB | ~2.1 kB |
| shared NgRx/RxJS (lazy) | ~30 kB | ~6.7 kB |

Полный анализ: `npm run build:stats` → `dist/anular-ngrx-todo-auth/stats.json`.

## Структура

```
src/app/
├── app.config.ts
├── app.routes.ts
├── core/
│   ├── guards/              # authGuard
│   └── interceptors/      # authInterceptor (Bearer token)
├── shared/                  # ui, pipes, validators (Phase 1+)
├── layout/
│   ├── main-layout/         # header (user, logout), footer, outlet
│   └── auth-layout/         # centered card for login/register
└── features/
    ├── auth/
    │   ├── data-access/     # NgRx + AuthService
    │   └── pages/           # login, register
    └── todos/
        ├── data-access/
        └── pages/           # todo-list
```

Подробнее: [docs/adr/ADR-001-feature-based-structure.md](./docs/adr/ADR-001-feature-based-structure.md)

### Path aliases (`tsconfig.json`)

| Alias | Путь |
|-------|------|
| `@app/core/*` | `src/app/core/*` |
| `@app/shared/*` | `src/app/shared/*` |
| `@app/features/auth/*` | `src/app/features/auth/*` |
| `@app/features/todos/*` | `src/app/features/todos/*` |

Пример: `import { authGuard } from '@app/core/guards/auth.guard';`

## NgRx DevTools

Расширение [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools) → вкладка Redux в браузере. В production не подключается.

## Известные ограничения Phase 0

- Нет persistence: после refresh страницы пользователь разлогинен (`localStorage` rehydrate — в Phase 3).
- Пароль и mock-`accessToken` приходят с json-server — это учебная заглушка, не для прода.
- Нет UI для ошибок API (Phase 1).
- Нет e2e и CI (Phase 1+).

## Следующие фазы

См. [`plans/`](./plans/) — Phase 1 и далее.

## Backend (отдельный репозиторий)

ASP.NET Core backend разрабатывается **независимо**:

- Roadmap: [`../todo-platform-backend/plans/`](../todo-platform-backend/plans/)
- Теория CQRS/архитектуры: [`../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md`](../todo-platform-backend/plans/guides/b-00-architecture-and-cqrs-theory.md)
- Shared API contract: [`../contracts/openapi.yaml`](../contracts/openapi.yaml)
- Интеграция с фронтом: [`plans/integration-map.md`](./plans/integration-map.md)

Фронт подключается к бэку по готовности (Phase 13, `useRealApi: true`).

## Guides (теория)

- Frontend: [`plans/guides/`](./plans/guides/)
- Backend: [`../todo-platform-backend/plans/guides/`](../todo-platform-backend/plans/guides/)
