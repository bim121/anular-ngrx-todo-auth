# Phase 16 — Frontend infrastructure (CDN, MFE deploy)

> **Теория:** [guides/phase-16-infrastructure-theory.md](./guides/phase-16-infrastructure-theory.md) — статус: placeholder  
> **Backend infra:** Terraform/K8s/Helm → [`../todo-platform-backend`](../todo-platform-backend) B-25, B-26, B-28  
> **Full stack deploy** = Frontend Phase 16 + Backend B-26  
> **Multi-stack:** CDN deploy всех 4 remotes — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 40–52+ недели (40–60 ч frontend-only)  
**Предусловия:** Phase 15, [Phase 9 polyglot MFE](./phase-09-microfrontends.md)  
**Цель:** CDN deploy **shell + 4 remotes** (2× Angular, Next, Vue), CI pipelines per app

---

## Результат фазы (frontend scope)

- [ ] S3/CloudFront or Azure Static Web Apps for shell bundle
- [ ] CDN for shell + **4 remotes**: todos, admin, marketing, analytics
- [ ] `mf-manifest.json` per environment / tenant
- [ ] CI matrix: `nx run-many -t build -p shell,todos-mfe,admin-mfe,analytics-mfe` + `marketing-mfe`
- [ ] GitHub Actions deploy frontend staging/prod
- [ ] Environment config per track (blue/green shell URLs)
- [ ] Cross-link: backend infra in `todo-platform-backend/infra/` (B-25–B-28)

> **Делегировано backend:** Terraform modules (VPC, AKS, Postgres), Helm API charts, Prometheus/Grafana stack, Ansible — см. [../todo-platform-backend/plans/backend-phase-25-terraform-azure.md](../todo-platform-backend/plans/backend-phase-25-terraform-azure.md)

### React/Next.js (marketing-mfe)

- [ ] CDN deploy pipeline: `marketing-mfe` → S3/CloudFront or Vercel production
- [ ] Blue/green buckets or paths: `/marketing/blue`, `/marketing/green`
- [ ] Cache headers: static assets immutable, HTML short TTL

### Vue 3 (analytics-mfe)

- [ ] CDN deploy `remoteEntry.js` + chunks for analytics-mfe
- [ ] CORS + CSP allowlist for shell origin
- [ ] CI matrix includes analytics federation build

### Все 4 remotes

- [ ] Deploy jobs: shell, todos-mfe, admin-mfe, marketing-mfe, analytics-mfe
- [ ] `mf-manifest.json` published to CDN per environment/tenant
- [ ] Smoke test post-deploy all remote URLs

---

## Результат фазы (legacy full-stack — см. backend)

- [ ] ~~Terraform modules: network, cluster, DB~~ → backend B-25
- [ ] Helm: shell + todos-mfe (frontend) + API (backend B-26)
- [ ] ~~ArgoCD full stack~~ → backend B-26 + frontend pipeline here

---

## Модуль 1 — Terraform foundations (недели 1–4)

### 16.1.1 Repo layout

```
infra/
  terraform/
    environments/
      staging/
      prod/
    modules/
      vpc/
      eks/          # or aks/gke
      rds/
      s3-cloudfront/
    backend.tf
```

### 16.1.2 Remote state

```hcl
terraform {
  backend "s3" {
    bucket = "tf-state-todoapp"
    key    = "staging/terraform.tfstate"
    region = "eu-central-1"
    dynamodb_table = "tf-locks"
  }
}
```

### 16.1.3 VPC module

- Public/private subnets, NAT, security groups.
- Outputs: subnet ids, vpc id.

### 16.1.4 EKS/AKS module (pick one)

- Managed cluster 1.29+.
- Node pool: 2 nodes staging.
- IRSA / workload identity for pods.

### 16.1.5 RDS (or Cloud SQL)

- Postgres multi-AZ staging.
- Secrets in AWS Secrets Manager.

### 16.1.6 S3 + CloudFront (static shell)

- Bucket for `shell` browser bundle.
- CDN for `remoteEntry.json` MFE manifests.

### 16.1.7 Commands drill

```bash
cd infra/terraform/environments/staging
terraform init
terraform plan
terraform apply
terraform destroy  # только staging
```

---

## Модуль 2 — Kubernetes & Helm (недели 5–8)

### 16.2.1 Cluster access

```bash
aws eks update-kubeconfig --name todo-staging
kubectl get nodes
```

### 16.2.2 Namespaces

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: todo-staging
  labels:
    environment: staging
```

### 16.2.3 Helm chart structure

```
infra/helm/
  todo-platform/
    Chart.yaml
    values.yaml
    values-staging.yaml
    templates/
      deployment-api.yaml
      deployment-shell.yaml
      service.yaml
      ingress.yaml
      hpa.yaml
      configmap-tenant.yaml
```

### 16.2.4 Deployments

| Workload | Replicas | Probes |
|----------|----------|--------|
| api | 2 | `/health` liveness |
| shell (nginx) | 2 | `/` |
| todos-mfe static | CDN optional | |

### 16.2.5 Ingress

- Host: `staging.app.example.com`
- TLS cert-manager Let's Encrypt.

### 16.2.6 HPA

```yaml
minReplicas: 2
maxReplicas: 10
metrics:
  - type: Resource
    resource:
      name: cpu
      targetAverageUtilization: 70
```

### 16.2.7 Blue-green in K8s

- Two deployments: `api-blue`, `api-green`.
- Service selector switch via label `version: green`.
- Or Argo Rollouts canary.

### 16.2.8 ConfigMap per tenant

```yaml
data:
  tenants.json: |
    { "acme": { "track": "blue" } }
```

---

## Модуль 3 — Ansible (недели 9–10)

**Примечание:** «Ensemble» в твоём списке — если имелся **Ansible**, этот модуль покрывает; если Azure Service Fabric — отдельный 2-дневный spike в `docs/service-fabric-spike.md`.

### 16.3.1 Inventory

```ini
[web]
vm1 ansible_host=10.0.1.10
```

### 16.3.2 Playbooks

| Playbook | Purpose |
|----------|---------|
| `bootstrap.yml` | docker, nginx, user |
| `deploy-shell.yml` | copy dist artifact |
| `configure-nginx.yml` | reverse proxy blue/green upstream |

### 16.3.3 Idempotency test

Run twice — second run 0 changes.

### 16.3.4 When VM vs K8s

Document: static marketing site on VM; app on K8s.

---

## Модуль 4 — GitOps ArgoCD (недели 11–12)

### 16.4.1 Repo `gitops/`

```
gitops/
  apps/
    todo-staging/
      kustomization.yaml
  helm-values/
    staging.yaml
```

### 16.4.2 ArgoCD Application

```yaml
spec:
  source:
    repoURL: github.com/you/todo-gitops
    path: apps/todo-staging
  destination:
    server: https://kubernetes.default.svc
    namespace: todo-staging
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 16.4.3 Promotion flow

PR merge main → Argo sync staging → manual promote prod.

---

## Модуль 5 — Observability (недели 13–14)

### 16.5.1 Prometheus

- Scrape API metrics `/metrics`.
- kube-prometheus-stack helm.

### 16.5.2 Grafana dashboards

- Request rate, latency p95, error rate.
- Per-tenant label `tenant_id` on metrics.

### 16.5.3 Loki logs

- JSON structured logs from API.
- Correlate with `X-Correlation-Id`.

### 16.5.4 OpenTelemetry

- Trace: shell → API → DB.
- Export to Jaeger staging.

### 16.5.5 Alerting

- Error rate > 1% for 5m → PagerDuty mock.

---

## Модуль 6 — Secrets (недели 15–16)

### 16.6.1 Sealed Secrets

```bash
kubeseal < secret.yaml > sealed-secret.yaml
```

### 16.6.2 Vault (alternative)

- Dynamic DB credentials.
- K8s auth method.

### 16.6.3 Never in git

- `terraform.tfvars` in `.gitignore`.
- Pre-commit detect-secrets hook.

---

## Модуль 7 — End-to-end platform drill

### 16.7.1 Day 1: destroy staging

### 16.7.2 Day 2: terraform apply from zero

### 16.7.3 Day 3: helm install + argo sync

### 16.7.4 Day 4: deploy green API + switch + rollback

### 16.7.5 Document total time — portfolio metric

---

## FAANG interview mapping

| Topic | Artifact in repo |
|-------|------------------|
| System design | `docs/system-design/platform.md` |
| Tradeoffs | ADRs 001–010 |
| Incident response | runbooks/ |
| Scale | HPA + CDN + cache headers |
| Security | secrets + network policies |

---

## Network policies (bonus)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-only-from-ingress
```

Deny pod-to-pod except required.

---

## Критерии готовности — FULL TRACK

- [ ] `terraform apply` staging reproducible
- [ ] `helm upgrade` deploys app accessible via HTTPS
- [ ] ArgoCD shows Synced Healthy
- [ ] Grafana dashboard shows live traffic
- [ ] Blue-green switch on K8s executed
- [ ] Secrets not in source control

---

## Параллельный трек (всё ещё актуально)

- LeetCode / system design 2–3 ч/нед
- Blog series «Building multi-tenant todo platform»

---

## Стек React / Next.js (marketing-mfe)

> CDN deploy marketing — отдельный pipeline, общий manifest. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.16.1 — Marketing CDN pipeline

```yaml
deploy-marketing-prod:
  steps:
    - run: nx build marketing-mfe --configuration=production
    - run: aws s3 sync dist/apps/marketing-mfe s3://cdn-todo/marketing/green/
    - run: aws cloudfront create-invalidation --paths "/marketing/*"
```

**Шаги:**
1. Staging: auto-deploy on merge `main`.
2. Prod: manual approval + blue/green path selection.
3. `Cache-Control: immutable` for `/_next/static/*`.

**Проверка:** `https://cdn.example.com/marketing/green/pricing` serves latest build.

### R.16.2 — Environment tracks

**Шаги:**
1. `environment.staging.ts` → staging CDN manifest URL.
2. `environment.prod.ts` → prod CDN manifest URL.
3. Cross-link backend B-26 ingress for API origin.

**Критерий:** marketing deploy independent of shell deploy.

---

## Стек Vue 3 (analytics-mfe)

### V.16.1 — Analytics federation CDN

```yaml
deploy-analytics-prod:
  steps:
    - run: nx build analytics-mfe --configuration=production
    - run: aws s3 sync dist/apps/analytics-mfe s3://cdn-todo/analytics/green/
```

**Шаги:**
1. Upload `remoteEntry.js` + chunk files.
2. CORS: `Access-Control-Allow-Origin: https://app.example.com`.
3. CSP in shell allows `script-src cdn.example.com`.

**Проверка:** shell loads analytics remote from CDN in staging.

### V.16.2 — CI matrix all remotes

```bash
nx run-many -t build -p shell,todos-mfe,admin-mfe,marketing-mfe,analytics-mfe
```

**Критерий:** single workflow deploys all 4 remotes + publishes manifest.

---

## Связанные планы

- [README](./README.md) — индекс всех фаз
- Frontend завершён в [phase-12](./phase-12-frontend-platform.md)
