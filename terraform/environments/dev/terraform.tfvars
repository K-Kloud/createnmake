# Development Environment Configuration

# Cloud Provider Configuration
cloud_provider = "aws"  # Change to "gcp" for Google Cloud
environment    = "dev"

# AWS Configuration (when using AWS)
aws_region = "us-west-2"
vpc_cidr   = "10.2.0.0/16"

# GCP Configuration (when using GCP)
# gcp_project_id = "your-gcp-project-id-dev"
# gcp_region     = "us-central1"

# Kubernetes Configuration
kubernetes_version   = "1.28"
node_instance_type   = "t3.micro"  # AWS - smallest for dev
# gcp_machine_type   = "e2-micro"   # GCP - smallest for dev

# Cluster Sizing (minimal for dev)
min_nodes     = 1
max_nodes     = 3
desired_nodes = 1

# Application Configuration
domain_name   = "dev.openteknologies.com"
image_tag     = "dev"
replica_count = 1

# Resource Configuration (minimal for dev)
cpu_request    = "50m"
memory_request = "64Mi"
cpu_limit      = "100m"
memory_limit   = "128Mi"

# Autoscaling Configuration (minimal for dev)
enable_hpa                   = false  # Disable HPA for dev
min_replicas                 = 1
max_replicas                 = 2
target_cpu_utilization       = 80
target_memory_utilization    = 80

# Security Configuration (relaxed for dev)
enable_tls                   = false  # Disable TLS for dev
enable_irsa                  = false  # Simplified for dev
enable_workload_identity     = false  # Simplified for dev
enable_encryption            = false  # Simplified for dev
enable_pod_security_policy   = false  # Simplified for dev
enable_network_policy        = false  # Simplified for dev

# Monitoring Configuration (minimal for dev)
enable_monitoring            = false  # Disable monitoring for dev
enable_logging              = false  # Disable logging for dev
prometheus_retention        = "1d"
prometheus_storage          = "5Gi"

# Cost Optimization (maximum savings for dev)
enable_spot_instances       = true
enable_cluster_autoscaler   = true

# Backup Configuration (minimal for dev)
enable_backups              = false  # Disable backups for dev
backup_retention_days       = 1

# Sensitive variables (set via environment variables or secure storage)
# supabase_url              = "https://igkiffajkpfwdfxwokwg.supabase.co"
# supabase_anon_key         = "your-supabase-anon-key"
# grafana_admin_password    = "dev-password"
# slack_webhook_url         = ""  # No alerts for dev
# pagerduty_service_key     = ""  # No paging for dev