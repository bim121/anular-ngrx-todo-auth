# Параллельный трек — навыки FAANG (на весь roadmap)

**Время:** 2–3 ч/нед на протяжении 18+ месяцев  
**Не блокирует фазы**, но обязателен для интервью.

---

## 1. Алгоритмы (еженедельно)

### Структура

| Неделя | Тема | Задач |
|--------|------|-------|
| 1–4 | Arrays, hash map | 20 |
| 5–8 | Two pointers, sliding window | 20 |
| 9–12 | Stack, queue, linked list | 20 |
| 13–16 | Trees, BFS/DFS | 25 |
| 17–20 | Graphs | 20 |
| 21–24 | DP basics | 25 |
| 25+ | Mixed mock interviews | 2/week |

### Артефакты в репо

- Перенести [test.js](../test.js) → `docs/algo/<pattern>/<problem>.ts`
- Шаблон решения: complexity, approach, code, edge cases.

### Чеклист готовности к интервью

- [ ] 150+ задач medium
- [ ] 20 hard
- [ ] 10 mock interviews (Pramp / peer)

---

## 2. Frontend system design (2 кейса / месяц)

См. также **Backend system design** в [`../todo-platform-backend/plans/parallel-skills-backend.md`](../todo-platform-backend/plans/parallel-skills-backend.md).

### Кейсы привязать к проекту

| # | Кейс | Связь с фазой |
|---|------|---------------|
| 1 | Design Twitter feed | Phase 5 perf |
| 2 | Design Google Docs (OT) | optional spike |
| 3 | Design Netflix **polyglot** MFE | Phase 9 |
| 4 | Design autocomplete | RxJS debounce |
| 5 | Design real-time notifications | WebSocket spike |
| 6 | Multi-tenant SaaS frontend | Phase 14 |
| 7 | Blue-green + CDN | Phase 15 |
| 8 | Observability for SPA | Phase 12 |
| 9 | Multi-tenant admin panel | Phase 14–15 + backend B-12 |
| 10 | CQRS end-to-end (Facade → MediatR) | Phase 4 + backend B-03 |
| 11 | **GraphQL BFF design** | Phase 13-GraphQL + B-10 |
| 12 | **gRPC microservices internal** | B-17 |
| 13 | **Polyglot MFE** (Angular+Next+Vue) | Phase 9, [multi-stack-roadmap.md](./multi-stack-roadmap.md) |
| 14 | **Next.js RSC architecture** | Phase 7 |
| 15 | **Vue reactivity deep dive** | Phase 2, 5 |

### Backend system design (parallel track)

| # | Кейс | Backend фаза |
|---|------|--------------|
| 1 | URL shortener | B-06 |
| 2 | Rate limiter | B-19 |
| 3 | Notification system | B-07, B-17 |
| 4 | Multi-tenant SaaS DB | B-11, B-21 |
| 5 | Saga order flow | B-18 |
| 6 | Search at scale | B-15, B-29 |
| 7 | **GraphQL vs REST BFF** | B-10, Phase 13-GraphQL |
| 8 | **gRPC service mesh** | B-17 |

Документы: `docs/system-design/backend/` (в backend repo) + `docs/system-design/` (frontend)

### Формат документа

**Файл:** `docs/system-design/NN-<name>.md`

1. Requirements (functional, non-functional)
2. Estimations (users, QPS, storage)
3. High-level diagram
4. API design
5. Data model
6. Deep dives (2–3)
7. Tradeoffs
8. Failure modes

---

## 3. TypeScript глубина (вплетать в фазы)

| Тема | Когда | Упражнение |
|------|-------|------------|
| Branded types `UserId` | Phase 4 | models |
| Exhaustive switch | Phase 3 | reducers |
| Template literal routes | Phase 1 | typed router |
| Conditional types | Phase 13 | API client wrapper |
| `satisfies` operator | Phase 6 | token objects |

---

## 4. RxJS mastery

**Файл:** `docs/rxjs-patterns.md` — пополнять по ходу.

- Higher-order: switchMap vs mergeMap vs concatMap vs exhaustMap
- Hot vs cold: shareReplay pitfalls
- Testing: TestScheduler, marble diagrams
- anti-patterns: nested subscribe

---

## 5. Security (чеклист по кварталам)

| Квартал | Темы |
|---------|------|
| Q1 | XSS, CSP (Phase 8) |
| Q2 | **OIDC + PKCE + Keycloak** ([Phase 17](./phase-17-auth-oidc-keycloak.md)) |
| Q2b | **CASL** authorization rules |
| Q3 | CSRF, cookies, BFF pattern (Phase 13) |
| Q4 | Tenant isolation (Phase 14) |

## 5b. Auth libraries (читать по Phase 17)

- [ ] OAuth 2.0 BCP for browser apps (IETF)
- [ ] Keycloak: realms, clients, mappers, roles
- [ ] CASL: abilities vs roles
- [ ] Interview: AuthN vs AuthZ, PKCE why mandatory for SPA

---

## 6. Soft skills & process

### Шаблоны в `docs/templates/`

- `RFC.md` — proposal before Phase 4+ large changes
- `design-review.md` — checklist
- `postmortem.md` — после rollback drill
- `estimation-PERT.md` — three-point estimate

### Communication

- Каждые 2 фазы: пост Medium/Telegram «что сделал»
- README Learning Log table

---

## 7. Accessibility (сквозняк)

- Phase 6: компоненты WCAG AA
- Phase 11: axe CI
- Перед интервью: пройти [WCAG quick ref](https://www.w3.org/WAI/WCAG22/quickref/) 1 день

---

## 8. Web platform APIs (spikes по 0.5 дня)

| API | Фаза | Идея |
|-----|------|------|
| IndexedDB | 10 | offline queue |
| Service Worker | 12 | PWA |
| BroadcastChannel | 9 | MFE tabs sync (polyglot) |
| Web Workers | 5 | filter 10k todos |
| View Transitions API | 7 | route animations |

---

## Рекомендуемый недельный ритм (5–10 ч total)

| День | Часы | Активность |
|------|------|------------|
| Пн–Чт | 1h × 4 | текущая Phase из plans/ |
| Пт | 2h | алгоритмы |
| Сб | 1h | system design doc или пост |
| Вс | off / catch-up |
