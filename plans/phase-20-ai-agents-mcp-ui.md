# Phase 20 — AI Agents & MCP UI

> **Backend:** [B-37](../../todo-platform-backend/plans/backend-phase-37-ai-agents-mcp.md)  
> **Предусловия:** [phase-19-rag-chat-ui.md](./phase-19-rag-chat-ui.md)

**Длительность:** 2–3 недели  
**Цель:** Agent panel with tool timeline + human-in-the-loop confirm; docs for MCP in Cursor.

---

## Результат фазы

- [ ] Agent chat session UI (Angular)
- [ ] Timeline: thought / tool call / result (collapsible)
- [ ] Confirm dialog for `create_todo` / `complete_todo`
- [ ] Reject / edit proposed action
- [ ] `docs/mcp/frontend-notes.md` — how FE team uses MCP in Cursor against local API
- [ ] Feature flag `ai.agent.enabled`
- [ ] Next optional: same confirm UX in marketing admin spike
- [ ] Vue optional: agent summary for analytics anomalies

---

## Критерии

| # | Критерий |
|---|----------|
| 1 | No mutation without confirm |
| 2 | Tool errors visible in timeline |
| 3 | Session resume works |

→ [phase-21-frontend-aws-observability.md](./phase-21-frontend-aws-observability.md)
