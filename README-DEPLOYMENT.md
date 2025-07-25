# OpenTech Webapp - Container & Kubernetes Deployment Guide

This guide provides comprehensive instructions for deploying the OpenTech webapp to AWS EKS, Google GKE, or any Kubernetes cluster with security best practices.

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Kubernetes 1.21+
- kubectl configured
- Helm 3.0+ (optional)

### Local Development with Docker

```bash
# Build and run locally
docker-compose up --build

# Access at http://localhost:8080
```

### Production Deployment

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run security scan
./scripts/security-scan.sh

# Deploy to Kubernetes
./scripts/deploy.sh v1.0.0
```

## 🛡️ Security Features

### Container Security

- ✅ Multi-stage builds with distroless base images
- ✅ Non-root user execution (UID 1001)
- ✅ Read-only root filesystem
- ✅ Security headers and CSP
- ✅ Vulnerability scanning with Trivy

### Kubernetes Security

- ✅ Pod Security Standards (restricted)
- ✅ Network Policies for traffic isolation
- ✅ RBAC with least-privilege access
- ✅ Security contexts and capabilities dropping
- ✅ Resource limits and quotas

### Compliance Standards

- ✅ CIS Kubernetes Benchmark
- ✅ OWASP security headers
- ✅ SOC 2 Type II ready
- ✅ PCI DSS compliant configurations

## 🏗️ Architecture

```
Internet
    ↓
[Load Balancer]
    ↓
[Ingress Controller] ← SSL Termination
    ↓
[Service] ← Network Policies
    ↓
[Pods (3 replicas)] ← Security Contexts
    ↓
[Supabase Backend] ← Encrypted connections
```

## 📁 File Structure

```
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local development
├── nginx.conf                 # Production web server config
├── k8s/                      # Kubernetes manifests
│   ├── namespace.yaml        # Namespace with quotas
│   ├── deployment.yaml       # App deployment
│   ├── service.yaml          # Service definitions
│   ├── ingress.yaml          # Ingress with SSL
│   ├── hpa.yaml              # Horizontal Pod Autoscaler
│   ├── rbac.yaml             # Role-based access control
│   ├── secrets.yaml          # Secret management
│   ├── network-policy.yaml   # Network isolation
│   ├── pod-security-policy.yaml # Pod security policies
│   └── monitoring.yaml       # Prometheus monitoring
└── scripts/
    ├── deploy.sh             # Automated deployment
    └── security-scan.sh      # Security scanning
```

## 🚀 Cloud Provider Setup

### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster \
  --name opentech-webapp \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name opentech-webapp

# Install AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=opentech-webapp
```

### Google GKE

```bash
# Create GKE cluster
gcloud container clusters create opentech-webapp \
  --zone us-central1-a \
  --machine-type e2-standard-4 \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-network-policy

# Get credentials
gcloud container clusters get-credentials opentech-webapp --zone us-central1-a
```

## 🔧 Configuration

### Environment Variables

Update `k8s/secrets.yaml` with your configuration:

```yaml
stringData:
  url: "YOUR_SUPABASE_URL"
  anon-key: "YOUR_SUPABASE_ANON_KEY"
```

### Domain Configuration

Update `k8s/ingress.yaml`:

```yaml
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: webapp-tls
  rules:
  - host: your-domain.com
```

## 📊 Monitoring & Observability

### Prometheus Metrics

The application exposes metrics at `/metrics`:

- HTTP request duration
- Memory usage
- CPU utilization
- Custom business metrics

### Grafana Dashboard

Import the provided dashboard:

```bash
kubectl apply -f monitoring/grafana-dashboard.json
```

### Log Aggregation

Logs are structured and ready for:

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Fluentd/Fluent Bit
- Cloud-native logging (CloudWatch, Stackdriver)

## 🛠️ Maintenance

### Updates and Rollbacks

```bash
# Rolling update
kubectl set image deployment/opentech-webapp webapp=opentech-webapp:v1.1.0

# Rollback
kubectl rollout undo deployment/opentech-webapp

# Check status
kubectl rollout status deployment/opentech-webapp
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment opentech-webapp --replicas=5

# Auto-scaling is configured via HPA
```

### Backup and Disaster Recovery

```bash
# Backup configurations
kubectl get all -n opentech-webapp -o yaml > backup.yaml

# Restore
kubectl apply -f backup.yaml
```

## 🔍 Troubleshooting

### Common Issues

1. **Pod Security Policy Issues**
   ```bash
   kubectl describe pod <pod-name> -n opentech-webapp
   ```

2. **Network Policy Blocking Traffic**
   ```bash
   kubectl describe networkpolicy -n opentech-webapp
   ```

3. **Resource Limits**
   ```bash
   kubectl top pods -n opentech-webapp
   ```

### Debug Commands

```bash
# Check pod logs
kubectl logs -f deployment/opentech-webapp -n opentech-webapp

# Shell into pod
kubectl exec -it deployment/opentech-webapp -n opentech-webapp -- /bin/sh

# Port forward for local testing
kubectl port-forward svc/opentech-webapp-service 8080:80 -n opentech-webapp
```

## 🔐 Security Checklist

- [ ] Container images scanned for vulnerabilities
- [ ] Non-root user configured
- [ ] Security contexts applied
- [ ] Network policies implemented
- [ ] RBAC configured with least privilege
- [ ] Secrets managed externally (production)
- [ ] TLS certificates configured
- [ ] Security headers enabled
- [ ] Resource limits set
- [ ] Monitoring and alerting configured

## 📞 Support

For issues and questions:

1. Check logs: `kubectl logs -f deployment/opentech-webapp -n opentech-webapp`
2. Review security scan results: `./scripts/security-scan.sh`
3. Verify cluster status: `kubectl get all -n opentech-webapp`

## 🔄 CI/CD Integration

This deployment is ready for integration with:

- GitHub Actions
- GitLab CI/CD
- Jenkins
- ArgoCD (GitOps)
- Tekton Pipelines

See the `.github/workflows/` directory for example pipeline configurations.