# OpenTech Webapp - Terraform Provider Versions

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    
    google-beta = {
      source  = "hashicorp/google-beta"
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
    
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14"
    }
    
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
    
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

# Provider configurations
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "opentech-webapp"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = "opentech"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  
  # Default labels for all resources
  default_labels = {
    project     = "opentech-webapp"
    environment = var.environment
    managed-by  = "terraform"
    owner       = "opentech"
  }
}

provider "google-beta" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Kubernetes provider configuration
provider "kubernetes" {
  host                   = var.cloud_provider == "aws" ? (length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].cluster_endpoint : "") : (length(module.gcp_infrastructure) > 0 ? module.gcp_infrastructure[0].cluster_endpoint : "")
  cluster_ca_certificate = var.cloud_provider == "aws" ? (length(module.aws_infrastructure) > 0 ? base64decode(module.aws_infrastructure[0].cluster_ca) : "") : (length(module.gcp_infrastructure) > 0 ? base64decode(module.gcp_infrastructure[0].cluster_ca) : "")
  
  dynamic "exec" {
    for_each = var.cloud_provider == "aws" ? [1] : []
    content {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].cluster_name : "",
        "--region",
        var.aws_region
      ]
    }
  }
  
  dynamic "exec" {
    for_each = var.cloud_provider == "gcp" ? [1] : []
    content {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "gke-gcloud-auth-plugin"
    }
  }
}

# Helm provider configuration
provider "helm" {
  kubernetes {
    host                   = var.cloud_provider == "aws" ? (length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].cluster_endpoint : "") : (length(module.gcp_infrastructure) > 0 ? module.gcp_infrastructure[0].cluster_endpoint : "")
    cluster_ca_certificate = var.cloud_provider == "aws" ? (length(module.aws_infrastructure) > 0 ? base64decode(module.aws_infrastructure[0].cluster_ca) : "") : (length(module.gcp_infrastructure) > 0 ? base64decode(module.gcp_infrastructure[0].cluster_ca) : "")
    
    dynamic "exec" {
      for_each = var.cloud_provider == "aws" ? [1] : []
      content {
        api_version = "client.authentication.k8s.io/v1beta1"
        command     = "aws"
        args = [
          "eks",
          "get-token",
          "--cluster-name",
          length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].cluster_name : "",
          "--region",
          var.aws_region
        ]
      }
    }
    
    dynamic "exec" {
      for_each = var.cloud_provider == "gcp" ? [1] : []
      content {
        api_version = "client.authentication.k8s.io/v1beta1"
        command     = "gke-gcloud-auth-plugin"
      }
    }
  }
}

# Kubectl provider configuration
provider "kubectl" {
  host                   = var.cloud_provider == "aws" ? (length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].cluster_endpoint : "") : (length(module.gcp_infrastructure) > 0 ? module.gcp_infrastructure[0].cluster_endpoint : "")
  cluster_ca_certificate = var.cloud_provider == "aws" ? (length(module.aws_infrastructure) > 0 ? base64decode(module.aws_infrastructure[0].cluster_ca) : "") : (length(module.gcp_infrastructure) > 0 ? base64decode(module.gcp_infrastructure[0].cluster_ca) : "")
  load_config_file       = false
  
  dynamic "exec" {
    for_each = var.cloud_provider == "aws" ? [1] : []
    content {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].cluster_name : "",
        "--region",
        var.aws_region
      ]
    }
  }
  
  dynamic "exec" {
    for_each = var.cloud_provider == "gcp" ? [1] : []
    content {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "gke-gcloud-auth-plugin"
    }
  }
}