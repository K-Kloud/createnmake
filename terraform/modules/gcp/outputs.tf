# GCP Module Outputs

output "cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.main.endpoint
}

output "cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.main.name
}

output "cluster_ca" {
  description = "GKE cluster certificate authority"
  value       = google_container_cluster.main.master_auth.0.cluster_ca_certificate
}

output "cluster_token" {
  description = "GKE cluster authentication token"
  value       = data.google_client_config.current.access_token
  sensitive   = true
}

output "network_name" {
  description = "VPC network name"
  value       = google_compute_network.main.name
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.main.name
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}

output "certificate_name" {
  description = "SSL certificate name"
  value       = google_compute_managed_ssl_certificate.app.name
}

output "load_balancer_ip" {
  description = "Load balancer IP address"
  value       = google_compute_global_address.app.address
}

output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "service_account_email" {
  description = "GKE service account email"
  value       = google_service_account.gke_service_account.email
}

output "dns_zone_name" {
  description = "Cloud DNS zone name"
  value       = var.create_dns_zone ? google_dns_managed_zone.app[0].name : null
}

output "dns_zone_name_servers" {
  description = "Cloud DNS zone name servers"
  value       = var.create_dns_zone ? google_dns_managed_zone.app[0].name_servers : null
}

# Data source for current client config
data "google_client_config" "current" {}