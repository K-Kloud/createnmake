# Staging Environment Configuration

# Cloud Provider Configuration
cloud_provider = "aws"  # Change to "gcp" for Google Cloud
environment    = "staging"

# AWS Configuration (when using AWS)
aws_region = "us-west-2"
vpc_cidr   = "10.1.0.0/16"

# GCP Configuration (when using GCP)
# gcp_project_id = "your-gcp-project-id-staging"
# gcp_region     = "us-central1"

# Kubernetes Configuration
kubernetes_version   = "1.28"
node_instance_type   = "t3.small"  # AWS
# gcp_machine_type   = "e2-standard-2"  # GCP

# Cluster Sizing (smaller for staging)
min_nodes     = 2
max_nodes     = 5
desired_nodes = 2

# Application Configuration
domain_name   = "staging.openteknologies.com"
image_tag     = "staging"
replica_count = 2

# Resource Configuration (smaller for staging)
cpu_request    = "100m"
memory_request = "128Mi"
cpu_limit      = "250m"
memory_limit   = "256Mi"

# Autoscaling Configuration
enable_hpa                   = true
min_replicas                 = 2
max_replicas                 = 5
target_cpu_utilization       = 70
target_memory_utilization    = 80

# Security Configuration
enable_tls                   = true
enable_irsa                  = true  # AWS
enable_workload_identity     = true  # GCP
enable_encryption            = true
enable_pod_security_policy   = true
enable_network_policy        = true

# Monitoring Configuration
enable_monitoring            = true
enable_logging              = true
prometheus_retention        = "7d"   # Shorter retention for staging
prometheus_storage          = "20Gi" # Smaller storage for staging

# Cost Optimization (use spot instances for staging)
enable_spot_instances       = true
enable_cluster_autoscaler   = true

# Backup Configuration
enable_backups              = true
backup_retention_days       = 7  # Shorter retention for staging

# Sensitive variables (set via environment variables or secure storage)
# supabase_url              = "https://igkiffajkpfwdfxwokwg.supabase.co"
# supabase_anon_key         = "your-supabase-anon-key"
# grafana_admin_password    = "secure-password"
# slack_webhook_url         = "your-slack-webhook-url"
# pagerduty_service_key     = "your-pagerduty-service-key"