# Kubernetes Module Variables

variable "cluster_endpoint" {
  description = "Kubernetes cluster endpoint"
  type        = string
}

variable "cluster_ca" {
  description = "Kubernetes cluster certificate authority"
  type        = string
}

variable "cluster_token" {
  description = "Kubernetes cluster authentication token"
  type        = string
  sensitive   = true
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "replica_count" {
  description = "Number of application replicas"
  type        = number
  default     = 3
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "enable_tls" {
  description = "Enable TLS/SSL termination"
  type        = bool
  default     = true
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "cpu_request" {
  description = "CPU request for application containers"
  type        = string
  default     = "250m"
}

variable "memory_request" {
  description = "Memory request for application containers"
  type        = string
  default     = "256Mi"
}

variable "cpu_limit" {
  description = "CPU limit for application containers"
  type        = string
  default     = "500m"
}

variable "memory_limit" {
  description = "Memory limit for application containers"
  type        = string
  default     = "512Mi"
}

variable "enable_hpa" {
  description = "Enable Horizontal Pod Autoscaler"
  type        = bool
  default     = true
}

variable "min_replicas" {
  description = "Minimum number of replicas for HPA"
  type        = number
  default     = 3
}

variable "max_replicas" {
  description = "Maximum number of replicas for HPA"
  type        = number
  default     = 10
}

variable "target_cpu" {
  description = "Target CPU utilization for HPA"
  type        = number
  default     = 70
}

variable "target_memory" {
  description = "Target memory utilization for HPA"
  type        = number
  default     = 80
}

variable "enable_monitoring" {
  description = "Enable monitoring stack"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable centralized logging"
  type        = bool
  default     = true
}

variable "enable_pod_security_policy" {
  description = "Enable Pod Security Policy"
  type        = bool
  default     = true
}

variable "enable_network_policy" {
  description = "Enable Network Policy"
  type        = bool
  default     = true
}