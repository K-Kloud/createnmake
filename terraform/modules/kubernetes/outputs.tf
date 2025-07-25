# Kubernetes Module Outputs

output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.app.metadata[0].name
}

output "service_name" {
  description = "Kubernetes service name"
  value       = kubernetes_service.app.metadata[0].name
}

output "deployment_name" {
  description = "Kubernetes deployment name"
  value       = kubernetes_deployment.app.metadata[0].name
}

output "service_account_name" {
  description = "Kubernetes service account name"
  value       = kubernetes_service_account.app.metadata[0].name
}

output "ingress_name" {
  description = "Kubernetes ingress name"
  value       = var.enable_tls ? kubernetes_ingress_v1.app[0].metadata[0].name : null
}

output "hpa_name" {
  description = "Horizontal Pod Autoscaler name"
  value       = var.enable_hpa ? kubernetes_horizontal_pod_autoscaler_v2.app[0].metadata[0].name : null
}

output "configmap_name" {
  description = "ConfigMap name"
  value       = kubernetes_config_map.app.metadata[0].name
}

output "secret_name" {
  description = "Secret name"
  value       = kubernetes_secret.supabase.metadata[0].name
}

output "network_policy_name" {
  description = "Network Policy name"
  value       = var.enable_network_policy ? kubernetes_network_policy.app[0].metadata[0].name : null
}

output "pod_security_policy_name" {
  description = "Pod Security Policy name"
  value       = var.enable_pod_security_policy ? kubernetes_manifest.pod_security_policy[0].manifest.metadata.name : null
}

output "app_labels" {
  description = "Application labels"
  value = {
    app         = var.app_name
    environment = var.environment
    version     = var.image_tag
  }
}