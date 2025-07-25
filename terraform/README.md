# OpenTech Webapp - Terraform Infrastructure as Code

This directory contains the complete Infrastructure as Code (IaC) setup for deploying the OpenTech webapp on both AWS EKS and Google Cloud GKE platforms.

## 📋 Overview

This Terraform configuration provides:

- **Multi-cloud support**: Deploy on AWS EKS or Google Cloud GKE
- **Production-ready**: Security, monitoring, and scalability built-in
- **Environment management**: Separate configurations for dev/staging/prod
- **Complete observability**: Prometheus, Grafana, and logging
- **Security hardening**: Network policies, RBAC, and encryption
- **Cost optimization**: Spot instances and auto-scaling

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   AWS EKS       │    │   GCP GKE       │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   VPC       │ │    │ │   VPC       │ │
│ │ ┌─────────┐ │ │    │ │ ┌─────────┐ │ │
│ │ │  EKS    │ │ │    │ │ │  GKE    │ │ │
│ │ │Cluster  │ │ │    │ │ │Cluster  │ │ │
│ │ └─────────┘ │ │    │ │ └─────────┘ │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────┐
         │   Kubernetes    │
         │    Resources    │
         │                 │
         │ • Deployment    │
         │ • Services      │
         │ • Ingress       │
         │ • HPA           │
         │ • Monitoring    │
         └─────────────────┘
```

## 📁 Project Structure

```
terraform/
├── main.tf                     # Main configuration
├── variables.tf                # Variable definitions
├── outputs.tf                  # Output definitions
├── versions.tf                 # Provider versions
├── modules/
│   ├── aws/                    # AWS EKS module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── policies/
│   ├── gcp/                    # GCP GKE module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── kubernetes/             # Kubernetes resources
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/             # Monitoring stack
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   └── terraform.tfvars
│   ├── staging/
│   │   └── terraform.tfvars
│   └── prod/
│       └── terraform.tfvars
└── scripts/
    └── deploy.sh               # Deployment automation script
```

## 🚀 Quick Start

### Prerequisites

- [Terraform](https://terraform.io) >= 1.5.0
- [AWS CLI](https://aws.amazon.com/cli/) v2 (for AWS deployments)
- [gcloud CLI](https://cloud.google.com/sdk/gcloud) (for GCP deployments)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/) >= 3.0

### 1. Configure Credentials

**For AWS:**
```bash
aws configure
# or use environment variables:
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
```

**For GCP:**
```bash
gcloud auth login
gcloud config set project your-project-id
# or use service account:
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

### 2. Set Environment Variables

```bash
# Required for all environments
export TF_VAR_supabase_url="https://igkiffajkpfwdfxwokwg.supabase.co"
export TF_VAR_supabase_anon_key="your-supabase-anon-key"

# Required for production/staging
export TF_VAR_grafana_admin_password="secure-password"

# Optional: Monitoring alerts
export TF_VAR_slack_webhook_url="your-slack-webhook"
export TF_VAR_pagerduty_service_key="your-pagerduty-key"

# For GCP deployments
export TF_VAR_gcp_project_id="your-gcp-project-id"
```

### 3. Deploy Using Script

```bash
# Initialize and plan (AWS production)
./scripts/deploy.sh -e prod -c aws init
./scripts/deploy.sh -e prod -c aws plan

# Apply configuration
./scripts/deploy.sh -e prod -c aws apply

# For GCP deployment
./scripts/deploy.sh -e prod -c gcp apply

# Development environment (minimal resources)
./scripts/deploy.sh -e dev -c aws apply
```

### 4. Manual Deployment

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="environments/prod/terraform.tfvars" \
               -var="cloud_provider=aws"

# Apply configuration
terraform apply -var-file="environments/prod/terraform.tfvars" \
                -var="cloud_provider=aws"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TF_VAR_supabase_url` | Supabase project URL | Yes | - |
| `TF_VAR_supabase_anon_key` | Supabase anonymous key | Yes | - |
| `TF_VAR_grafana_admin_password` | Grafana admin password | Prod/Staging | - |
| `TF_VAR_slack_webhook_url` | Slack webhook for alerts | No | - |
| `TF_VAR_pagerduty_service_key` | PagerDuty service key | No | - |
| `TF_VAR_gcp_project_id` | GCP project ID | GCP only | - |

### Terraform Variables

Key configuration options in `terraform.tfvars`:

```hcl
# Cloud provider selection
cloud_provider = "aws"  # or "gcp"
environment    = "prod"

# Cluster sizing
min_nodes     = 3
max_nodes     = 10
desired_nodes = 3

# Security features
enable_tls               = true
enable_encryption        = true
enable_network_policy    = true

# Monitoring
enable_monitoring = true
enable_logging   = true
```

## 🛡 Security Features

### Container Security
- Non-root containers
- Read-only root filesystem
- Security contexts enforced
- Vulnerability scanning enabled

### Kubernetes Security
- Pod Security Standards (restricted)
- Network Policies for traffic isolation
- RBAC with least-privilege access
- Service account token auto-mounting disabled

### Cloud Security
- **AWS**: VPC with private subnets, IAM roles (IRSA), KMS encryption
- **GCP**: Private GKE cluster, Workload Identity, Google-managed encryption

### Network Security
- TLS termination at ingress
- Security headers configured
- Content Security Policy
- ModSecurity and OWASP rules

## 📊 Monitoring & Observability

### Included Components
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and management
- **Loki**: Log aggregation (optional)
- **Jaeger**: Distributed tracing (optional)

### Access URLs
After deployment:
- Application: `https://openteknologies.com`
- Grafana: `https://grafana.openteknologies.com`
- Prometheus: `https://prometheus.openteknologies.com`

### Custom Dashboards
- Application performance metrics
- Kubernetes cluster metrics
- Infrastructure monitoring
- Business metrics

## 💰 Cost Optimization

### Development Environment
- Minimal node sizes (`t3.micro`, `e2-micro`)
- Single node clusters
- Spot instances enabled
- Monitoring disabled

### Staging Environment
- Small node sizes (`t3.small`, `e2-standard-2`)
- Spot instances for cost savings
- Reduced monitoring retention

### Production Environment
- Appropriate sizing for workloads
- On-demand instances for reliability
- Cluster autoscaler enabled
- Full monitoring and alerting

### Cost Estimates (Monthly USD)

| Environment | AWS | GCP |
|-------------|-----|-----|
| Development | $50-100 | $40-80 |
| Staging | $150-250 | $120-200 |
| Production | $300-600 | $250-500 |

*Estimates based on moderate usage patterns and may vary*

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Infrastructure
on:
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
      with:
        terraform_version: 1.5.0
    
    - name: Configure AWS
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Deploy Infrastructure
      run: |
        cd terraform
        ./scripts/deploy.sh -e prod -c aws -y apply
      env:
        TF_VAR_supabase_url: ${{ secrets.SUPABASE_URL }}
        TF_VAR_supabase_anon_key: ${{ secrets.SUPABASE_ANON_KEY }}
        TF_VAR_grafana_admin_password: ${{ secrets.GRAFANA_PASSWORD }}
```

## 🔧 Maintenance

### Updating Infrastructure

```bash
# Update to latest configuration
git pull origin main

# Plan changes
./scripts/deploy.sh -e prod -c aws plan

# Apply updates
./scripts/deploy.sh -e prod -c aws apply
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment opentech-webapp --replicas=5

# Update HPA limits
terraform apply -var="max_replicas=20"
```

### Backup and Recovery

```bash
# Backup Kubernetes resources
kubectl get all,secrets,configmaps -o yaml > backup.yaml

# Backup Terraform state (if using local state)
cp terraform.tfstate terraform.tfstate.backup
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   ```bash
   # Check AWS/GCP permissions
   aws sts get-caller-identity
   gcloud auth list
   ```

2. **Resource Limits**
   ```bash
   # Check quotas
   kubectl describe limitrange
   kubectl describe resourcequota
   ```

3. **Pod Security Issues**
   ```bash
   # Check security contexts
   kubectl describe pod <pod-name>
   ```

### Debug Commands

```bash
# Check cluster status
kubectl cluster-info

# View application logs
kubectl logs -l app=opentech-webapp

# Port forward for local access
kubectl port-forward svc/opentech-webapp-service 8080:80

# Check ingress
kubectl get ingress
kubectl describe ingress opentech-webapp-ingress
```

### Support

For additional support:

1. Check the [Terraform documentation](https://terraform.io/docs)
2. Review [Kubernetes documentation](https://kubernetes.io/docs)
3. Consult cloud provider documentation:
   - [AWS EKS](https://docs.aws.amazon.com/eks/)
   - [Google GKE](https://cloud.google.com/kubernetes-engine/docs)

## 📜 License

This infrastructure code is part of the OpenTech webapp project and follows the same licensing terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes in dev environment
4. Submit a pull request

For infrastructure changes, always:
- Test in development first
- Include security considerations
- Update documentation
- Consider cost implications

---

**Note**: This infrastructure setup provides a production-ready foundation but should be customized based on your specific requirements, compliance needs, and organizational policies.