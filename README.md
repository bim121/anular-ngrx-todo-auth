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
| `npm test` | Vitest unit-тесты |

## Структура

```
src/app/
├── app.config.ts
├── app.routes.ts
├── core/
│   ├── guards/              # authGuard
│   └── interceptors/      # authInterceptor (Bearer token)
├── shared/                  # ui, pipes, validators (Phase 1+)
├── layout/                  # main-layout, auth-layout (Phase 1.3)
└── features/
    ├── auth/
    │   ├── data-access/     # NgRx + AuthService
    │   └── pages/           # login, register
    └── todos/
        ├── data-access/
        └── pages/           # todo-list
```

Подробнее: [docs/adr/ADR-001-feature-based-structure.md](./docs/adr/ADR-001-feature-based-structure.md)

## NgRx DevTools

Расширение [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools) → вкладка Redux в браузере. В production не подключается.

## Известные ограничения Phase 0

- Нет persistence: после refresh страницы пользователь разлогинен (`localStorage` rehydrate — в Phase 3).
- Пароль и mock-`accessToken` приходят с json-server — это учебная заглушка, не для прода.
- Нет UI для ошибок API (Phase 1).
- Нет e2e и CI (Phase 1+).

## Следующие фазы

См. [`plans/`](./plans/) — phase-01 и далее.
