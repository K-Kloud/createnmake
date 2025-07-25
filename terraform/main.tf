# OpenTech Webapp - Main Terraform Configuration
# Multi-cloud Infrastructure as Code for AWS EKS and GCP GKE

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "s3" {
    # Configure based on your environment
    # bucket = "opentech-terraform-state"
    # key    = "webapp/terraform.tfstate"
    # region = "us-west-2"
  }
}

# Local variables
locals {
  common_tags = {
    Project     = "opentech-webapp"
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = "opentech"
  }
  
  app_name = "opentech-webapp"
  domain   = var.domain_name
}

# Data sources
data "aws_availability_zones" "available" {
  count = var.cloud_provider == "aws" ? 1 : 0
  state = "available"
}

data "google_compute_zones" "available" {
  count  = var.cloud_provider == "gcp" ? 1 : 0
  region = var.gcp_region
}

# Conditional deployment based on cloud provider
module "aws_infrastructure" {
  count  = var.cloud_provider == "aws" ? 1 : 0
  source = "./modules/aws"

  # Common variables
  app_name              = local.app_name
  environment          = var.environment
  tags                 = local.common_tags
  
  # AWS-specific variables
  aws_region           = var.aws_region
  availability_zones   = data.aws_availability_zones.available[0].names
  vpc_cidr            = var.vpc_cidr
  
  # Kubernetes configuration
  kubernetes_version   = var.kubernetes_version
  node_instance_type   = var.node_instance_type
  min_nodes           = var.min_nodes
  max_nodes           = var.max_nodes
  desired_nodes       = var.desired_nodes
  
  # Application configuration
  domain_name         = var.domain_name
  supabase_url        = var.supabase_url
  supabase_anon_key   = var.supabase_anon_key
  
  # Security
  enable_irsa         = var.enable_irsa
  enable_encryption   = var.enable_encryption
}

module "gcp_infrastructure" {
  count  = var.cloud_provider == "gcp" ? 1 : 0
  source = "./modules/gcp"

  # Common variables
  app_name              = local.app_name
  environment          = var.environment
  labels               = local.common_tags
  
  # GCP-specific variables
  project_id          = var.gcp_project_id
  region              = var.gcp_region
  zones               = data.google_compute_zones.available[0].names
  network_cidr        = var.vpc_cidr
  
  # Kubernetes configuration
  kubernetes_version   = var.kubernetes_version
  machine_type        = var.gcp_machine_type
  min_nodes          = var.min_nodes
  max_nodes          = var.max_nodes
  initial_nodes      = var.desired_nodes
  
  # Application configuration
  domain_name        = var.domain_name
  supabase_url       = var.supabase_url
  supabase_anon_key  = var.supabase_anon_key
  
  # Security
  enable_workload_identity = var.enable_workload_identity
  enable_network_policy    = var.enable_network_policy
}

# Kubernetes resources (deployed to whichever cloud provider is selected)
module "kubernetes_resources" {
  source = "./modules/kubernetes"
  
  depends_on = [
    module.aws_infrastructure,
    module.gcp_infrastructure
  ]

  # Cluster configuration
  cluster_endpoint = var.cloud_provider == "aws" ? module.aws_infrastructure[0].cluster_endpoint : module.gcp_infrastructure[0].cluster_endpoint
  cluster_ca       = var.cloud_provider == "aws" ? module.aws_infrastructure[0].cluster_ca : module.gcp_infrastructure[0].cluster_ca
  cluster_token    = var.cloud_provider == "aws" ? module.aws_infrastructure[0].cluster_token : module.gcp_infrastructure[0].cluster_token
  
  # Application configuration
  app_name         = local.app_name
  environment      = var.environment
  namespace        = "${local.app_name}-${var.environment}"
  image_tag        = var.image_tag
  replica_count    = var.replica_count
  
  # Domain and SSL
  domain_name      = var.domain_name
  enable_tls       = var.enable_tls
  
  # Supabase configuration
  supabase_url     = var.supabase_url
  supabase_anon_key = var.supabase_anon_key
  
  # Resource limits
  cpu_request      = var.cpu_request
  memory_request   = var.memory_request
  cpu_limit        = var.cpu_limit
  memory_limit     = var.memory_limit
  
  # Autoscaling
  enable_hpa       = var.enable_hpa
  min_replicas     = var.min_replicas
  max_replicas     = var.max_replicas
  target_cpu       = var.target_cpu_utilization
  target_memory    = var.target_memory_utilization
  
  # Monitoring
  enable_monitoring = var.enable_monitoring
  enable_logging   = var.enable_logging
  
  # Security
  enable_pod_security_policy = var.enable_pod_security_policy
  enable_network_policy      = var.enable_network_policy
}

# Monitoring and observability
module "monitoring" {
  count  = var.enable_monitoring ? 1 : 0
  source = "./modules/monitoring"
  
  depends_on = [module.kubernetes_resources]

  app_name     = local.app_name
  environment  = var.environment
  namespace    = "${local.app_name}-${var.environment}"
  domain_name  = var.domain_name
  
  # Prometheus configuration
  prometheus_retention = var.prometheus_retention
  prometheus_storage   = var.prometheus_storage
  
  # Grafana configuration
  grafana_admin_password = var.grafana_admin_password
  
  # Alerting
  slack_webhook_url      = var.slack_webhook_url
  pagerduty_service_key  = var.pagerduty_service_key
}