# Phase 13-GraphQL — GraphQL client (сразу после REST)

> **Теория:** [guides/phase-13-graphql-theory.md](./guides/phase-13-graphql-theory.md) — статус: placeholder  
> **Backend:** [B-10 GraphQL BFF](../../todo-platform-backend/plans/backend-phase-10-complex-sql-readmodels.md) (нед 3–4), gRPC architecture → [B-17](../../todo-platform-backend/plans/backend-phase-17-microservices-split.md)  
> **REST ([Phase 13](./phase-13-real-api.md)) остаётся default** для writes  
> **Multi-stack:** Apollo во всех трёх стеках — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 2–3 недели (25–35 ч) — **сразу после REST cutover**, недели 31–33  
**Предусловия:** [Phase 13](./phase-13-real-api.md) нед 1–2 (REST CRUD работает), backend **B-10 GraphQL** готов  
**Цель:** Apollo Angular + codegen; hybrid REST write + GraphQL read; понять BFF до Admin/Kanban.

---

## Зачем сразу после REST, а не в конце

| Момент | Что учишь | Почему сейчас |
|--------|-----------|---------------|
| Phase 13 нед 1–2 | REST + OpenAPI | Базовый transport |
| **Phase 13-GraphQL** | GraphQL read path | Kanban (Phase 6) и Admin (Phase 14) нужны nested queries — подключаем до них |
| Phase 14 | Multi-tenant + Admin v1 | Admin может сразу `useGraphQL` для tenant list |
| B-17 (backend sync) | gRPC internal | System design на нед 3 — параллельно backend split |

> **FAANG interview:** «Почему не gRPC из браузера?» → GraphQL BFF проще для SPA; gRPC — только service-to-service (B-17).

---

## Результат фазы

- [ ] `@apollo/client` / `apollo-angular` + `graphql` packages
- [ ] Codegen from [`../../contracts/graphql/schema.graphql`](../../contracts/graphql/schema.graphql)
- [ ] `HybridTodoRepository`: REST write + GraphQL read when `useGraphQL`
- [ ] Kanban board: one GraphQL query (columns + todos) — закрывает over-fetching из Phase 6
- [ ] Feature flag `environment.useGraphQL`
- [ ] Auth: Bearer in Apollo `authLink`; tenant: `X-Tenant-Id`
- [ ] Error handling: GraphQL `errors[]` → toast / NgRx
- [ ] E2E: todos list via GraphQL
- [ ] Doc: `docs/system-design/graphql-bff-vs-grpc.md` (gRPC theory — backend B-17)
- [ ] ADR-013g: when GraphQL vs REST in this app

### React/Next.js (marketing-mfe)

- [ ] `@apollo/client` + codegen в marketing-mfe
- [ ] Client component: public metrics GraphQL query (если в schema)
- [ ] `authLink` — Bearer from next-auth session

### Vue 3 (analytics-mfe)

- [ ] `@vue/apollo-composable` + shared codegen types
- [ ] `useQuery` для `todoStats` / dashboard aggregates
- [ ] Hybrid: REST write остаётся в shell; GraphQL read в analytics

### Angular (все MFE)

- [ ] `apollo-angular` в shell, todos-mfe, admin-mfe — единый schema

---

## Неделя 1 — Setup & codegen (сразу после REST работает)

### 13g.1 Packages

```bash
npm i @apollo/client graphql
npm i -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

### 13g.2 Codegen config

**Файл:** `codegen.ts`

```typescript
export default {
  schema: '../contracts/graphql/schema.graphql',
  documents: ['src/app/**/*.graphql'],
  generates: {
    'src/app/generated/graphql/': { preset: 'client' },
  },
};
```

```bash
npm run graphql:codegen
```

### 13g.3 Apollo provider

**Файл:** `src/app/core/graphql/apollo.provider.ts`

```typescript
export function provideGraphql() {
  return provideApollo(() => {
    const httpLink = inject(HttpLink);
    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
    }));
    return {
      link: authLink.concat(httpLink.create({ uri: `${environment.apiUrl}/graphql` })),
      cache: new InMemoryCache(),
    };
  });
}
```

### 13g.4 Feature flag

```typescript
// environment.ts
useGraphQL: false, // true when backend B-10 GraphQL ready
graphqlUrl: 'http://localhost:5000/graphql',
```

---

## Неделя 2 — Hybrid repository & Kanban query

### 13g.5 Todos GraphQL query

**Файл:** `src/app/features/todos/data-access/queries/get-todos.graphql`

```graphql
query GetTodos($userId: UUID!, $status: TodoStatus) {
  todos(userId: $userId, status: $status) {
    id
    title
    completed
    status
    priority
  }
}
```

### 13g.6 Hybrid repository

| Operation | Transport |
|-----------|-----------|
| GET list / Kanban board | GraphQL when `useGraphQL` |
| POST/PATCH/DELETE | REST (Phase 13) |

**Класс:** `HybridTodoRepository implements TodoRepository`

### 13g.7 Kanban one-query (Phase 6 payoff)

```graphql
query KanbanBoard($userId: UUID!) {
  todos(userId: $userId) {
    id title status priority
  }
  todoStats(userId: $userId) { total active completed }
}
```

Клиент группирует по `status` → колонки. Один roundtrip вместо REST stats + list.

---

## Неделя 3 — gRPC architecture & Phase 14 prep

### 13g.8 System design doc (browser не вызывает gRPC)

**Файл:** `docs/system-design/graphql-bff-vs-grpc.md`

1. Browser → GraphQL Gateway → gRPC → microservices (diagram)
2. Связь с backend [B-17 gRPC](../../todo-platform-backend/plans/backend-phase-17-microservices-split.md)
3. gRPC-Web tradeoffs — optional spike, не required

### 13g.9 Apollo во всех MFE + admin preview

**Polyglot GraphQL** (Phase 9 remotes):
- `marketing-mfe` — `@apollo/client` (Next client components)
- `analytics-mfe` — `@vue/apollo-composable`

Один `contracts/graphql/schema.graphql` — все потребители.

**Admin (Phase 14):** подготовь `.graphql` для `adminTenants` — wire когда backend B-12 расширит schema.

### 13g.10 E2E & interview

- Playwright: login → todos loaded (GraphQL in network tab)
- N+1 → DataLoader (backend B-10)
- GraphQL subscriptions vs SignalR (Phase 4–5)

---

## Критерии готовности

| # | Критерий | Проверка |
|---|----------|----------|
| 1 | Codegen in CI | `npm run graphql:codegen` |
| 2 | Todos query works | Apollo devtools |
| 3 | Kanban via GraphQL | one query, 3 columns |
| 4 | REST still works | `useGraphQL: false` |
| 5 | Auth + tenant headers | network inspect |
| 6 | gRPC system design doc | docs/ |
| 7 | ADR-013g published | docs/adr/ |

---

## Связь с backend

| Frontend | Backend |
|----------|---------|
| Phase 13-GraphQL | B-10 GraphQL `/graphql` |
| Kanban (Phase 6) | `todos` + `todoStats` query |
| Phase 14 Admin | extend schema in B-12 |
| gRPC theory | B-17 implementation |

---

## Стек React / Next.js (marketing-mfe)

> Apollo Client — тот же `contracts/graphql/schema.graphql`. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.13g.1 — Apollo Client setup

```bash
npm i @apollo/client graphql --workspace=marketing-mfe
```

**Файл:** `apps/marketing-mfe/src/core/apollo-client.ts`

```typescript
export const apolloClient = new ApolloClient({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});
```

**Шаги:**
1. Codegen: shared output `libs/shared/graphql/generated/`.
2. Client component `MetricsWidget` — `useQuery(PUBLIC_STATS_DOCUMENT)`.
3. `ApolloProvider` в client layout wrapper.

**Проверка:** Apollo DevTools shows cached query.

### R.13g.2 — Auth link

**Шаги:**
1. Read session token from next-auth `getSession()`.
2. `X-Tenant-Id` header when Phase 14 active.
3. Error policy: `graphQLErrors` → toast.

**Критерий:** marketing page loads GraphQL data with Bearer.

---

## Стек Vue 3 (analytics-mfe)

### V.13g.1 — @vue/apollo-composable

```bash
npm i @vue/apollo-composable @apollo/client graphql --workspace=analytics-mfe
```

**Шаги:**
1. `provideApolloClient` in `main.ts`.
2. `useWeeklyStatsQuery` composable wrapping `useQuery`.
3. Replace REST stats store with GraphQL when `VITE_USE_GRAPHQL=true`.

**Проверка:** one query returns chart data — network shows `/graphql`.

### V.13g.2 — Dashboard Kanban stats

```graphql
query AnalyticsDashboard($userId: UUID!) {
  todoStats(userId: $userId) { total active completed }
}
```

**Шаги:**
1. Import generated types from `libs/shared/graphql`.
2. Loading/error states in dashboard layout.
3. Feature flag: REST fallback when GraphQL down.

**Критерий:** `useGraphQL: false` restores Pinia REST path.

---

## Стек Angular (все remotes)

### A.13g.1 — Apollo во всех Angular MFE

**Apps:** shell, todos-mfe, admin-mfe

**Шаги:**
1. Shared `provideGraphql()` in `libs/shared/graphql`.
2. todos-mfe: Kanban one-query (Phase 6 payoff).
3. admin-mfe: stub `adminTenants` query for Phase 14.

**Критерий:** codegen once — consumed by all three stacks.

---

## Следующая фаза

→ [Phase 14 Multi-tenant](./phase-14-multi-tenant.md) — Admin v1 с опциональным GraphQL path
