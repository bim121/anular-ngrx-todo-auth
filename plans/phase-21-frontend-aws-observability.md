# Phase 21 — Frontend on AWS & Observability

> **Backend:** [B-34](../../todo-platform-backend/plans/backend-phase-34-aws-foundations.md), [B-24](../../todo-platform-backend/plans/backend-phase-24-observability.md), [B-35](../../todo-platform-backend/plans/backend-phase-35-aws-devops-pro.md)  
> **Предусловия:** [phase-16-infrastructure.md](./phase-16-infrastructure.md), Phase 12

**Длительность:** 2–3 недели  
**Цель:** FE deploy path on AWS + связать browser metrics с Grafana; SAA edge story.

---

## Результат фазы

- [ ] CloudFront + S3 (or Amplify) for shell + remotes **или** document ECS static hosting
- [ ] Cache headers / invalidation on release (parity Phase 15 blue/green)
- [ ] Optional Cognito hosted UI for marketing (if B-34 chose Cognito)
- [ ] Browser RUM: OpenTelemetry web **или** CloudWatch RUM → note in Grafana
- [ ] Link Phase 12 Lighthouse CI artifacts to release pipeline on AWS (B-35)
- [ ] Dashboard panel: FE error rate / CLS (if collected)
- [ ] ADR-049: FE hosting AWS vs Azure Static Web Apps

---

## Критерии

| # | Критерий |
|---|----------|
| 1 | Production URL via CloudFront |
| 2 | Invalidation on deploy |
| 3 | Observability doc updated |

Done for FE AI/AWS track; continue product work as needed.
