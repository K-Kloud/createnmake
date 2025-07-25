# Monitoring Module Variables

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "namespace" {
  description = "Application namespace"
  type        = string
}

variable "domain_name" {
  description = "Domain name for monitoring services"
  type        = string
}

variable "prometheus_retention" {
  description = "Prometheus data retention period"
  type        = string
  default     = "30d"
}

variable "prometheus_storage" {
  description = "Prometheus storage size"
  type        = string
  default     = "50Gi"
}

variable "grafana_admin_password" {
  description = "Grafana admin password"
  type        = string
  sensitive   = true
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for alerts"
  type        = string
  sensitive   = true
  default     = ""
}

variable "pagerduty_service_key" {
  description = "PagerDuty service key for critical alerts"
  type        = string
  sensitive   = true
  default     = ""
}

variable "enable_logging" {
  description = "Enable Loki for log aggregation"
  type        = bool
  default     = true
}

variable "enable_tracing" {
  description = "Enable Jaeger for distributed tracing"
  type        = bool
  default     = false
}

variable "enable_node_exporter" {
  description = "Enable Node Exporter"
  type        = bool
  default     = true
}