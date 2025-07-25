# Monitoring Module Outputs

output "monitoring_namespace" {
  description = "Monitoring namespace name"
  value       = kubernetes_namespace.monitoring.metadata[0].name
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "https://prometheus.${var.domain_name}"
}

output "grafana_url" {
  description = "Grafana URL"
  value       = "https://grafana.${var.domain_name}"
}

output "alertmanager_url" {
  description = "Alertmanager URL"
  value       = "https://alertmanager.${var.domain_name}"
}

output "jaeger_url" {
  description = "Jaeger URL"
  value       = var.enable_tracing ? "https://jaeger.${var.domain_name}" : null
}

output "prometheus_operator_release_name" {
  description = "Prometheus Operator Helm release name"
  value       = helm_release.prometheus_operator.name
}

output "loki_release_name" {
  description = "Loki Helm release name"
  value       = var.enable_logging ? helm_release.loki[0].name : null
}

output "jaeger_release_name" {
  description = "Jaeger Helm release name"
  value       = var.enable_tracing ? helm_release.jaeger[0].name : null
}

output "service_monitor_name" {
  description = "ServiceMonitor name"
  value       = kubernetes_manifest.service_monitor.manifest.metadata.name
}

output "prometheus_rule_name" {
  description = "PrometheusRule name"
  value       = kubernetes_manifest.prometheus_rule.manifest.metadata.name
}

output "dashboard_configmap_name" {
  description = "Grafana dashboard ConfigMap name"
  value       = kubernetes_config_map.grafana_dashboard.metadata[0].name
}