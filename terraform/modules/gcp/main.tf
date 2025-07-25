# GCP GKE Infrastructure Module

# Local variables
locals {
  cluster_name = "${var.app_name}-${var.environment}"
  network_name = "${var.app_name}-${var.environment}-network"
  subnet_name  = "${var.app_name}-${var.environment}-subnet"
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = local.network_name
  auto_create_subnetworks = false
  project                 = var.project_id

  depends_on = [
    google_project_service.compute,
    google_project_service.container
  ]
}

# Subnet
resource "google_compute_subnetwork" "main" {
  name          = local.subnet_name
  ip_cidr_range = var.network_cidr
  region        = var.region
  network       = google_compute_network.main.id
  project       = var.project_id

  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = "192.168.1.0/24"
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "192.168.64.0/18"
  }

  private_ip_google_access = true
}

# Cloud Router
resource "google_compute_router" "main" {
  name    = "${local.cluster_name}-router"
  region  = var.region
  network = google_compute_network.main.id
  project = var.project_id
}

# Cloud NAT
resource "google_compute_router_nat" "main" {
  name                               = "${local.cluster_name}-nat"
  router                            = google_compute_router.main.name
  region                            = var.region
  nat_ip_allocate_option            = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  project                           = var.project_id

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall Rules
resource "google_compute_firewall" "allow_internal" {
  name    = "${local.cluster_name}-allow-internal"
  network = google_compute_network.main.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [var.network_cidr, "192.168.1.0/24", "192.168.64.0/18"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "${local.cluster_name}-allow-ssh"
  network = google_compute_network.main.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ssh"]
}

# GKE Service Account
resource "google_service_account" "gke_service_account" {
  account_id   = "${var.app_name}-${var.environment}-gke"
  display_name = "GKE Service Account for ${local.cluster_name}"
  project      = var.project_id
}

resource "google_project_iam_member" "gke_service_account_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/storage.objectViewer"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.gke_service_account.email}"
}

# GKE Cluster
resource "google_container_cluster" "main" {
  name     = local.cluster_name
  location = var.region
  project  = var.project_id

  # Remove default node pool
  remove_default_node_pool = true
  initial_node_count       = 1

  # Network configuration
  network    = google_compute_network.main.name
  subnetwork = google_compute_subnetwork.main.name

  # IP allocation policy
  ip_allocation_policy {
    cluster_secondary_range_name  = "pod-ranges"
    services_secondary_range_name = "services-range"
  }

  # Network policy
  network_policy {
    enabled = var.enable_network_policy
  }

  # Private cluster configuration
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # Master authorized networks
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All"
    }
  }

  # Workload Identity
  workload_identity_config {
    workload_pool = var.enable_workload_identity ? "${var.project_id}.svc.id.goog" : null
  }

  # Addons
  addons_config {
    http_load_balancing {
      disabled = false
    }

    horizontal_pod_autoscaling {
      disabled = false
    }

    network_policy_config {
      disabled = !var.enable_network_policy
    }

    dns_cache_config {
      enabled = true
    }
  }

  # Maintenance policy
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }

  # Enable shielded nodes
  enable_shielded_nodes = true

  # Logging and monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"

  depends_on = [
    google_project_service.compute,
    google_project_service.container,
    google_compute_subnetwork.main
  ]
}

# Primary Node Pool
resource "google_container_node_pool" "primary" {
  name       = "${local.cluster_name}-primary-pool"
  location   = var.region
  cluster    = google_container_cluster.main.name
  project    = var.project_id

  initial_node_count = var.initial_nodes

  autoscaling {
    min_node_count = var.min_nodes
    max_node_count = var.max_nodes
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    preemptible  = false
    machine_type = var.machine_type
    disk_size_gb = 50
    disk_type    = "pd-ssd"

    service_account = google_service_account.gke_service_account.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_only"
    ]

    # Enable workload identity
    workload_metadata_config {
      mode = var.enable_workload_identity ? "GKE_METADATA" : "GCE_METADATA"
    }

    # Shielded instance config
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    labels = var.labels

    tags = ["gke-node", "${local.cluster_name}-node"]
  }

  upgrade_settings {
    max_surge       = 1
    max_unavailable = 0
  }
}

# Artifact Registry
resource "google_artifact_registry_repository" "app" {
  location      = var.region
  repository_id = local.cluster_name
  description   = "Docker repository for ${local.cluster_name}"
  format        = "DOCKER"
  project       = var.project_id

  depends_on = [google_project_service.artifact_registry]
}

# SSL Certificate
resource "google_compute_managed_ssl_certificate" "app" {
  name    = "${local.cluster_name}-ssl-cert"
  project = var.project_id

  managed {
    domains = [var.domain_name, "*.${var.domain_name}"]
  }
}

# Global Static IP for Load Balancer
resource "google_compute_global_address" "app" {
  name    = "${local.cluster_name}-ip"
  project = var.project_id
}

# Required APIs
resource "google_project_service" "compute" {
  project = var.project_id
  service = "compute.googleapis.com"

  disable_dependent_services = false
}

resource "google_project_service" "container" {
  project = var.project_id
  service = "container.googleapis.com"

  disable_dependent_services = false
}

resource "google_project_service" "artifact_registry" {
  project = var.project_id
  service = "artifactregistry.googleapis.com"

  disable_dependent_services = false
}

resource "google_project_service" "dns" {
  project = var.project_id
  service = "dns.googleapis.com"

  disable_dependent_services = false
}

# Cloud DNS Managed Zone (optional)
resource "google_dns_managed_zone" "app" {
  count       = var.create_dns_zone ? 1 : 0
  name        = replace("${local.cluster_name}-zone", "-", "")
  dns_name    = "${var.domain_name}."
  description = "DNS zone for ${var.domain_name}"
  project     = var.project_id

  depends_on = [google_project_service.dns]
}

# Workload Identity binding
resource "google_service_account_iam_binding" "workload_identity" {
  count              = var.enable_workload_identity ? 1 : 0
  service_account_id = google_service_account.gke_service_account.name
  role               = "roles/iam.workloadIdentityUser"

  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[${var.app_name}-${var.environment}/${var.app_name}]"
  ]
}