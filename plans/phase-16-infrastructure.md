# Phase 16 — Infrastructure (Terraform, Kubernetes, Ansible, GitOps)

**Длительность:** 40–52+ недели (80–120 ч)  
**Предусловия:** Phase 15, cloud account (AWS/GCP/Azure) or local kind cluster  
**Цель:** IaC for full stack, K8s deploy, Ansible bootstrap, observability, secrets.

---

## Результат фазы

- [ ] Terraform modules: network, cluster, DB, state backend
- [ ] Helm charts: shell, todos-mfe, API
- [ ] Ansible playbooks for VM path (alternative)
- [ ] ArgoCD GitOps flow
- [ ] Prometheus + Grafana + Loki
- [ ] Vault or Sealed Secrets
- [ ] Staging environment reproducible from scratch

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

## Связанные планы

- [README](./README.md) — индекс всех фаз
- Frontend завершён в [phase-12](./phase-12-frontend-platform.md)
