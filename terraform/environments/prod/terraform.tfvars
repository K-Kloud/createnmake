# Production Environment Configuration

# Cloud Provider Configuration
cloud_provider = "aws"  # Change to "gcp" for Google Cloud
environment    = "prod"

# AWS Configuration (when using AWS)
aws_region = "us-west-2"
vpc_cidr   = "10.0.0.0/16"

# GCP Configuration (when using GCP)
# gcp_project_id = "your-gcp-project-id"
# gcp_region     = "us-central1"

# Kubernetes Configuration
kubernetes_version   = "1.28"
node_instance_type   = "t3.medium"  # AWS
# gcp_machine_type   = "e2-standard-2"  # GCP

# Cluster Sizing
min_nodes     = 3
max_nodes     = 10
desired_nodes = 3

# Application Configuration
domain_name   = "openteknologies.com"
image_tag     = "latest"
replica_count = 3

# Resource Configuration
cpu_request    = "250m"
memory_request = "256Mi"
cpu_limit      = "500m"
memory_limit   = "512Mi"

# Autoscaling Configuration
enable_hpa                   = true
min_replicas                 = 3
max_replicas                 = 10
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
prometheus_retention        = "30d"
prometheus_storage          = "50Gi"

# Cost Optimization
enable_spot_instances       = false
enable_cluster_autoscaler   = true

# Backup Configuration
enable_backups              = true
backup_retention_days       = 30

# Sensitive variables (set via environment variables or secure storage)
# supabase_url              = "https://igkiffajkpfwdfxwokwg.supabase.co"
# supabase_anon_key         = "your-supabase-anon-key"
# grafana_admin_password    = "secure-password"
# slack_webhook_url         = "your-slack-webhook-url"
# pagerduty_service_key     = "your-pagerduty-service-key"