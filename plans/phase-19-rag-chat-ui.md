# Phase 19 — RAG Chat UI

> **Backend:** [B-36](../../todo-platform-backend/plans/backend-phase-36-rag-llm.md) / [J-36](../../todo-platform-java/plans/java-phase-36-rag-llm.md)  
> **Теория:** [guides/phase-19-rag-chat-theory.md](./guides/phase-19-rag-chat-theory.md) — placeholder  
> **Предусловия:** [phase-18-ai-features.md](./phase-18-ai-features.md), Phase 13 real API

**Длительность:** 2–3 недели  
**Цель:** Chat UI с grounded answers, citations, streaming — UX для RAG.

---

## Результат фазы

### Angular (primary)

- [ ] `AiRagChatComponent` — message list, streaming tokens
- [ ] Citation chips → navigate/highlight todo
- [ ] Empty / loading / error / «I don’t know» states
- [ ] Feature flag `ai.rag.enabled`
- [ ] NgRx or signal store for session messages

### React/Next (marketing or todos shell)

- [ ] Streaming via Vercel AI SDK **или** fetch SSE to same B-36 API
- [ ] Shared citation component pattern

### Vue (analytics)

- [ ] Optional: «Ask about my week» → RAG over stats summary

---

## Неделя 1–2

1. OpenAPI client for `POST /api/ai/rag/query` (+ stream)
2. Accessibility: live region for streamed text
3. Privacy banner: data sent to LLM provider

## Критерии

| # | Критерий |
|---|----------|
| 1 | Citations clickable |
| 2 | Stream cancels on navigate away |
| 3 | Flag off → UI hidden |

→ [phase-20-ai-agents-mcp-ui.md](./phase-20-ai-agents-mcp-ui.md)
