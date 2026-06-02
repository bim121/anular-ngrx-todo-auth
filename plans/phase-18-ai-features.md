# Phase 18 — AI & Vector features
> **Теория:** [guides/phase-18-ai-features-theory.md](./guides/phase-18-ai-features-theory.md) — статус: placeholder


**Длительность:** 33–36 недели (30–40 ч)  
**Предусловия:** [product-features-expansion.md](./product-features-expansion.md) V2.3, Phase 13 API  
**Цель:** NL interface, embeddings pipeline, semantic dedup — навыки AI-era frontend/platform.

---

## Результат фазы

- [ ] «Smart add» — текст → structured todo (date, priority, tags)
- [ ] Semantic search UI подключён к vector store
- [ ] Duplicate warning при похожих задачах (cosine > 0.9)
- [ ] ADR-013, ADR-014 (model choice, cost, privacy)
- [ ] Feature flag `ai.enabled` — off in prod demo if no API key

---

## Неделя 1 — Architecture & ethics

### 18.1.1 ADR-013 Vector store

| Option | When |
|--------|------|
| pgvector | Same DB as todos, pet project |
| Qdrant | Dedicated vector workloads |
| Pinecone | Managed, fastest spike |

### 18.1.2 ADR-014 LLM provider

- OpenAI API / Azure OpenAI / local Ollama
- Document: no PII in prompts, user opt-in

### 18.1.3 Diagram

**Файл:** `docs/ai/architecture.mmd` — из product-features V2.3.

---

## Неделя 2 — Embeddings pipeline

### 18.2.1 Backend endpoints (mock or real)

```
POST /todos/:id/embed     — generate & store vector
POST /search/semantic     — { query: string } → Todo[]
GET  /todos/:id/similar   — near-duplicates
```

### 18.2.2 Embedding service abstraction

```typescript
interface EmbeddingService {
  embed(text: string): Promise<number[]>;
}
```

Implementations: `OpenAIEmbeddingService`, `MockEmbeddingService` (deterministic for tests).

### 18.2.3 NgRx

- `generateEmbeddingOnTodoCreated` effect (non-blocking).
- `semanticSearch` action group.

### 18.2.4 UI: semantic search bar

См. product-features F2.3.

---

## Неделя 3 — Natural language todo creation

### 18.3.1 Prompt design

```typescript
const systemPrompt = `Parse user input into JSON: { task, dueDate?, priority?, tags? }`;
```

### 18.3.2 Flow

1. User types в «Quick add with AI».
2. `AiTodoParserService.parse(text)` → structured.
3. Preview card: «Create: Buy milk, due tomorrow?» [Confirm].
4. Confirm → `todosFacade.add(parsed)`.

### 18.3.3 Error handling

- LLM timeout → fallback manual form.
- Invalid JSON → retry once.

### 18.3.4 Cost control

- Debounce, max 1 request / 2s.
- Cache parse results 5 min (same input).

---

## Неделя 4 — Smart features

### 18.4.1 Priority suggestion

Rules engine first (keywords «urgent», «asap») → optional LLM enhance.

### 18.4.2 Duplicate detection

On add: `GET similar` → modal «Similar todo exists: ...».

### 18.4.3 Auto-tagging

LLM suggests tags → user accepts chips.

---

## Неделя 5 — Testing & safety

### 18.5.1 Tests

- Mock LLM returns fixed JSON.
- Mock embeddings — cosine known vectors.

### 18.5.2 Rate limit UI

Show remaining AI quota (mock counter).

### 18.5.3 Accessibility

AI results announced to screen readers.

---

## Критерии готовности

- [ ] Semantic search demo video-ready
- [ ] NL create works for 5 example phrases (RU/EN)
- [ ] Duplicate warning triggers correctly
- [ ] Works with `ai.enabled: false` — app still usable

---

## Career prep

3 interview answers prepared in `docs/ai/interview-stories.md`:

1. How vector search works (embeddings, k-NN)
2. Prompt injection mitigation in UI
3. Cost/latency tradeoffs for AI features

---

## Связь

← [product-features-expansion.md](./product-features-expansion.md)  
← [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md)


