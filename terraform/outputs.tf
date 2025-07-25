# OpenTech Webapp - Terraform Outputs

# Cloud Provider Information
output "cloud_provider" {
  description = "Selected cloud provider"
  value       = var.cloud_provider
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

# AWS Outputs (when using AWS)
output "aws_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].cluster_endpoint : null
}

output "aws_cluster_name" {
  description = "EKS cluster name"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].cluster_name : null
}

output "aws_cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].cluster_security_group_id : null
}

output "aws_vpc_id" {
  description = "VPC ID"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].vpc_id : null
}

output "aws_private_subnet_ids" {
  description = "Private subnet IDs"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].private_subnet_ids : null
}

output "aws_public_subnet_ids" {
  description = "Public subnet IDs"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].public_subnet_ids : null
}

output "aws_ecr_repository_url" {
  description = "ECR repository URL"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].ecr_repository_url : null
}

output "aws_load_balancer_dns" {
  description = "Application Load Balancer DNS name"
  value       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].load_balancer_dns : null
}

# GCP Outputs (when using GCP)
output "gcp_cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = var.cloud_provider == "gcp" ? module.gcp_infrastructure[0].cluster_endpoint : null
}

output "gcp_cluster_name" {
  description = "GKE cluster name"
  value       = var.cloud_provider == "gcp" ? module.gcp_infrastructure[0].cluster_name : null
}

output "gcp_network_name" {
  description = "VPC network name"
  value       = var.cloud_provider == "gcp" ? module.gcp_infrastructure[0].network_name : null
}

output "gcp_subnet_name" {
  description = "Subnet name"
  value       = var.cloud_provider == "gcp" ? module.gcp_infrastructure[0].subnet_name : null
}

output "gcp_artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = var.cloud_provider == "gcp" ? module.gcp_infrastructure[0].artifact_registry_url : null
}

output "gcp_load_balancer_ip" {
  description = "Load Balancer IP address"
  value       = var.cloud_provider == "gcp" ? module.gcp_infrastructure[0].load_balancer_ip : null
}

# Kubernetes Outputs
output "kubernetes_namespace" {
  description = "Kubernetes namespace"
  value       = module.kubernetes_resources.namespace
}

output "application_url" {
  description = "Application URL"
  value       = "https://${var.domain_name}"
}

output "application_health_check_url" {
  description = "Application health check URL"
  value       = "https://${var.domain_name}/health"
}

# Monitoring Outputs
output "prometheus_url" {
  description = "Prometheus URL"
  value       = var.enable_monitoring ? "https://prometheus.${var.domain_name}" : null
}

output "grafana_url" {
  description = "Grafana URL"
  value       = var.enable_monitoring ? "https://grafana.${var.domain_name}" : null
}

output "grafana_admin_user" {
  description = "Grafana admin username"
  value       = var.enable_monitoring ? "admin" : null
}

# Security Outputs
output "tls_certificate_arn" {
  description = "TLS certificate ARN (AWS) or name (GCP)"
  value       = var.enable_tls ? (var.cloud_provider == "aws" ? module.aws_infrastructure[0].certificate_arn : module.gcp_infrastructure[0].certificate_name) : null
}

# Resource Information
output "cluster_autoscaler_status" {
  description = "Cluster autoscaler enabled status"
  value       = var.enable_cluster_autoscaler
}

output "horizontal_pod_autoscaler_status" {
  description = "HPA enabled status"
  value       = var.enable_hpa
}

output "backup_status" {
  description = "Backup enabled status"
  value       = var.enable_backups
}

# Connection Information
output "kubectl_config_command" {
  description = "Command to configure kubectl"
  value = var.cloud_provider == "aws" ? "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.aws_infrastructure[0].cluster_name}" : "gcloud container clusters get-credentials ${module.gcp_infrastructure[0].cluster_name} --region ${var.gcp_region} --project ${var.gcp_project_id}"
}

# DNS Configuration
output "dns_configuration" {
  description = "DNS configuration required"
  value = {
    domain = var.domain_name
    target = var.cloud_provider == "aws" ? module.aws_infrastructure[0].load_balancer_dns : module.gcp_infrastructure[0].load_balancer_ip
    type   = var.cloud_provider == "aws" ? "CNAME" : "A"
  }
}

# Cost Information
output "estimated_monthly_cost" {
  description = "Estimated monthly cost (USD)"
  value = {
    aws_small  = "$150-250 (2 nodes, t3.medium)"
    aws_medium = "$300-500 (3-5 nodes, t3.large)"
    aws_large  = "$600-1000 (5-10 nodes, t3.xlarge)"
    gcp_small  = "$120-200 (2 nodes, e2-standard-2)"
    gcp_medium = "$250-400 (3-5 nodes, e2-standard-4)"
    gcp_large  = "$500-800 (5-10 nodes, e2-standard-8)"
  }
}

# Security Compliance
output "security_features" {
  description = "Enabled security features"
  value = {
    network_policies     = var.enable_network_policy
    pod_security_policy  = var.enable_pod_security_policy
    encryption_at_rest   = var.enable_encryption
    tls_termination     = var.enable_tls
    workload_identity   = var.cloud_provider == "gcp" ? var.enable_workload_identity : false
    irsa                = var.cloud_provider == "aws" ? var.enable_irsa : false
  }
}