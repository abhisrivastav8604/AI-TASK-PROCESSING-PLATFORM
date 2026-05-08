# Infrastructure Configuration

This repository contains all Kubernetes manifests and Argo CD configurations needed to deploy the AI Task Processing Platform.

## Directory Structure
- `/k8s`: Contains manifests for each service (backend, frontend, worker, mongodb, redis) as well as ingress, configmaps, and secrets.
- `/argocd`: Contains the Application CRD used by Argo CD to continuously deploy these resources.

## Deployment with Argo CD

1. Apply the Argo CD application file to cluster:
```bash
kubectl apply -f argocd/app-of-apps.yaml
```

2. Argo CD will automatically sync and deploy everything inside `/k8s` recursively.

## Secrets Management
Ensure you update the base64-encoded strings in `k8s/secrets/app-secrets.yaml` before applying. In a real-world scenario, you should use SealedSecrets or External Secrets Operator (AWS Secrets Manager / Vault) to avoid pushing raw base64 secrets to git.

## Scaling
To scale the worker pods:
```bash
kubectl scale deployment worker-deployment -n ai-task-platform --replicas=5
```
Or set up HPA (Horizontal Pod Autoscaler) based on CPU/Memory metrics.
