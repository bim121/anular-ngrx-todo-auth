# Phase 18 — AI & Vector features
> **Теория:** [guides/phase-18-ai-features-theory.md](./guides/phase-18-ai-features-theory.md) — статус: placeholder  
> **Multi-stack:** Angular primary; Vercel AI SDK (Next) + Vue composable optional — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

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

### React/Next.js (marketing-mfe) — optional

- [ ] Vercel AI SDK spike — «Ask about pricing» chat widget on `/pricing`
- [ ] Feature flag `ai.marketing.enabled` — off by default
- [ ] Doc: cost/latency for edge vs API route

### Vue 3 (analytics-mfe) — optional

- [ ] `useAiInsight` composable — natural language summary of weekly stats
- [ ] Feature flag `ai.analytics.enabled`
- [ ] Mock LLM in tests; real API behind flag

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

## Стек React / Next.js (marketing-mfe)

> Vercel AI SDK — optional spike для marketing; Angular остаётся primary для todo AI. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.18.1 — Vercel AI SDK spike (optional)

```bash
npm i ai @ai-sdk/openai --workspace=marketing-mfe
```

**Файл:** `apps/marketing-mfe/src/app/api/chat/route.ts`

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({ model: openai('gpt-4o-mini'), messages });
  return result.toDataStreamResponse();
}
```

**Шаги:**
1. Client widget on `/pricing` — «Ask about plans» (behind `ai.marketing.enabled`).
2. Rate limit: 1 req / 5s; no PII in prompts.
3. Fallback: static FAQ when flag off or API key missing.

**Проверка:** demo works locally with `OPENAI_API_KEY`; prod flag off.

### R.18.2 — Cost control doc

**Файл:** `docs/ai/marketing-ai-cost.md` — edge vs Node runtime, token budget.

**Критерий:** app fully usable with `ai.marketing.enabled: false`.

---

## Стек Vue 3 (analytics-mfe)

### V.18.1 — useAiInsight composable (optional)

**Файл:** `apps/analytics-mfe/src/composables/useAiInsight.ts`

```typescript
export function useAiInsight(stats: Ref<WeeklyStats | null>) {
  const insight = ref<string | null>(null);
  async function generate() {
    if (!import.meta.env.VITE_AI_ENABLED) return;
    insight.value = await fetch('/api/ai/summarize', { ... }).then(r => r.text());
  }
  return { insight, generate };
}
```

**Шаги:**
1. Button «Explain my week» on dashboard — behind `ai.analytics.enabled`.
2. Mock service in Vitest — deterministic summary string.
3. Prompt: only aggregated stats, no raw todo titles (privacy).

**Проверка:** composable returns null when flag off; UI hides button.

### V.18.2 — Integration with Angular AI

**Шаги:**
1. Shared `docs/ai/architecture.mmd` — which stack owns which AI feature.
2. Semantic search stays Angular/todos-mfe; analytics gets summary only.
3. Interview story: feature flags for AI rollout per MFE.

**Критерий:** optional composable does not block Phase 18 Angular criteria.

---

## Связь

← [product-features-expansion.md](./product-features-expansion.md)  
← [phase-17-auth-oidc-keycloak.md](./phase-17-auth-oidc-keycloak.md)  
→ [phase-19-rag-chat-ui.md](./phase-19-rag-chat-ui.md) — RAG после semantic search  
→ Backend [B-36](../../todo-platform-backend/plans/backend-phase-36-rag-llm.md) / [B-37](../../todo-platform-backend/plans/backend-phase-37-ai-agents-mcp.md)


