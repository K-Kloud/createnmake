# Kubernetes Resources Module

# Local variables
locals {
  app_labels = {
    app         = var.app_name
    environment = var.environment
    version     = var.image_tag
  }
}

# Namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = var.namespace
    labels = merge(local.app_labels, {
      "security.compliance/pod-security-standard" = "restricted"
    })
  }
}

# Limit Range
resource "kubernetes_limit_range" "app" {
  metadata {
    name      = "${var.app_name}-limits"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    limit {
      type = "Container"
      default = {
        cpu    = var.cpu_limit
        memory = var.memory_limit
      }
      default_request = {
        cpu    = var.cpu_request
        memory = var.memory_request
      }
    }
  }
}

# Resource Quota
resource "kubernetes_resource_quota" "app" {
  metadata {
    name      = "${var.app_name}-quota"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"              = "2"
      "requests.memory"           = "4Gi"
      "limits.cpu"               = "4"
      "limits.memory"            = "8Gi"
      "persistentvolumeclaims"   = "2"
      "pods"                     = "10"
      "services"                 = "5"
    }
  }
}

# Service Account
resource "kubernetes_service_account" "app" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = local.app_labels
  }
  
  automount_service_account_token = false
}

# Secret for Supabase credentials
resource "kubernetes_secret" "supabase" {
  metadata {
    name      = "supabase-secrets"
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = local.app_labels
  }

  type = "Opaque"

  data = {
    url       = var.supabase_url
    anon-key  = var.supabase_anon_key
  }
}

# ConfigMap for application configuration
resource "kubernetes_config_map" "app" {
  metadata {
    name      = "${var.app_name}-config"
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = local.app_labels
  }

  data = {
    NODE_ENV     = "production"
    PORT         = "8080"
    DOMAIN_NAME  = var.domain_name
  }
}

# Deployment
resource "kubernetes_deployment" "app" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = local.app_labels
  }

  spec {
    replicas = var.replica_count

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = "1"
        max_unavailable = "0"
      }
    }

    selector {
      match_labels = {
        app = var.app_name
      }
    }

    template {
      metadata {
        labels = merge(local.app_labels, {
          "app" = var.app_name
        })
        annotations = {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "8080"
          "prometheus.io/path"   = "/metrics"
        }
      }

      spec {
        service_account_name            = kubernetes_service_account.app.metadata[0].name
        automount_service_account_token = false

        security_context {
          run_as_non_root        = true
          run_as_user           = 1001
          run_as_group          = 1001
          fs_group              = 1001
          supplemental_groups   = [1001]
        }

        affinity {
          pod_anti_affinity {
            preferred_during_scheduling_ignored_during_execution {
              weight = 100
              pod_affinity_term {
                label_selector {
                  match_expressions {
                    key      = "app"
                    operator = "In"
                    values   = [var.app_name]
                  }
                }
                topology_key = "kubernetes.io/hostname"
              }
            }
          }
        }

        container {
          name  = "webapp"
          image = "${var.app_name}:${var.image_tag}"

          port {
            container_port = 8080
            name          = "http"
            protocol      = "TCP"
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.app.metadata[0].name
            }
          }

          env {
            name = "SUPABASE_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.supabase.metadata[0].name
                key  = "url"
              }
            }
          }

          env {
            name = "SUPABASE_ANON_KEY"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.supabase.metadata[0].name
                key  = "anon-key"
              }
            }
          }

          resources {
            requests = {
              cpu    = var.cpu_request
              memory = var.memory_request
            }
            limits = {
              cpu    = var.cpu_limit
              memory = var.memory_limit
            }
          }

          security_context {
            allow_privilege_escalation = false
            capabilities {
              drop = ["ALL"]
            }
            privileged                = false
            read_only_root_filesystem = true
            run_as_non_root          = true
            run_as_user              = 1001
            run_as_group             = 1001
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 8080
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 8080
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }

          volume_mount {
            name       = "tmp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "var-cache"
            mount_path = "/var/cache/nginx"
          }

          volume_mount {
            name       = "var-log"
            mount_path = "/var/log/nginx"
          }
        }

        volume {
          name = "tmp"
          empty_dir {}
        }

        volume {
          name = "var-cache"
          empty_dir {}
        }

        volume {
          name = "var-log"
          empty_dir {}
        }
      }
    }
  }
}

# Service
resource "kubernetes_service" "app" {
  metadata {
    name      = "${var.app_name}-service"
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = local.app_labels
    annotations = {
      "prometheus.io/scrape" = "true"
      "prometheus.io/port"   = "8080"
    }
  }

  spec {
    type = "ClusterIP"

    port {
      port        = 80
      target_port = 8080
      protocol    = "TCP"
      name        = "http"
    }

    selector = {
      app = var.app_name
    }
  }
}

# Headless Service
resource "kubernetes_service" "app_headless" {
  metadata {
    name      = "${var.app_name}-headless"
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = local.app_labels
  }

  spec {
    type       = "ClusterIP"
    cluster_ip = "None"

    port {
      port        = 80
      target_port = 8080
      protocol    = "TCP"
      name        = "http"
    }

    selector = {
      app = var.app_name
    }
  }
}

# Horizontal Pod Autoscaler
resource "kubernetes_horizontal_pod_autoscaler_v2" "app" {
  count = var.enable_hpa ? 1 : 0

  metadata {
    name      = "${var.app_name}-hpa"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.app.metadata[0].name
    }

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = var.target_cpu
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = var.target_memory
        }
      }
    }

    behavior {
      scale_down {
        stabilization_window_seconds = 300
        policy {
          type          = "Percent"
          value         = 10
          period_seconds = 60
        }
      }

      scale_up {
        stabilization_window_seconds = 60
        policy {
          type          = "Percent"
          value         = 50
          period_seconds = 60
        }
        policy {
          type          = "Pods"
          value         = 2
          period_seconds = 60
        }
        select_policy = "Max"
      }
    }
  }
}

# Ingress
resource "kubernetes_ingress_v1" "app" {
  count = var.enable_tls ? 1 : 0

  metadata {
    name      = "${var.app_name}-ingress"
    namespace = kubernetes_namespace.app.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"                       = "nginx"
      "nginx.ingress.kubernetes.io/rewrite-target"        = "/"
      "nginx.ingress.kubernetes.io/ssl-redirect"          = "true"
      "nginx.ingress.kubernetes.io/force-ssl-redirect"    = "true"
      "cert-manager.io/cluster-issuer"                    = "letsencrypt-prod"
      "nginx.ingress.kubernetes.io/rate-limit"            = "100"
      "nginx.ingress.kubernetes.io/rate-limit-window"     = "1m"
      "nginx.ingress.kubernetes.io/enable-modsecurity"    = "true"
      "nginx.ingress.kubernetes.io/enable-owasp-core-rules" = "true"
      "nginx.ingress.kubernetes.io/proxy-body-size"       = "10m"
      "nginx.ingress.kubernetes.io/configuration-snippet" = <<-EOT
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ${var.supabase_url}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' ${var.supabase_url} wss://${replace(var.supabase_url, "https://", "")}; frame-ancestors 'none';" always;
      EOT
    }
  }

  spec {
    tls {
      hosts       = [var.domain_name]
      secret_name = "${var.app_name}-tls"
    }

    rule {
      host = var.domain_name
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.app.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}

# Network Policy
resource "kubernetes_network_policy" "app" {
  count = var.enable_network_policy ? 1 : 0

  metadata {
    name      = "${var.app_name}-netpol"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    pod_selector {
      match_labels = {
        app = var.app_name
      }
    }

    policy_types = ["Ingress", "Egress"]

    ingress {
      from {
        namespace_selector {
          match_labels = {
            name = "ingress-nginx"
          }
        }
      }
      from {
        namespace_selector {
          match_labels = {
            name = "monitoring"
          }
        }
      }
      ports {
        protocol = "TCP"
        port     = "8080"
      }
    }

    egress {
      # Allow DNS resolution
      to {}
      ports {
        protocol = "UDP"
        port     = "53"
      }
      ports {
        protocol = "TCP"
        port     = "53"
      }
    }

    egress {
      # Allow HTTPS to Supabase and external services
      to {}
      ports {
        protocol = "TCP"
        port     = "443"
      }
    }

    egress {
      # Allow internal communication
      to {
        pod_selector {
          match_labels = {
            app = var.app_name
          }
        }
      }
      ports {
        protocol = "TCP"
        port     = "8080"
      }
    }
  }
}

# Pod Security Policy (if enabled)
resource "kubernetes_manifest" "pod_security_policy" {
  count = var.enable_pod_security_policy ? 1 : 0

  manifest = {
    apiVersion = "policy/v1beta1"
    kind       = "PodSecurityPolicy"
    metadata = {
      name = "${var.app_name}-psp"
      annotations = {
        "seccomp.security.alpha.kubernetes.io/allowedProfileNames"  = "runtime/default"
        "seccomp.security.alpha.kubernetes.io/defaultProfileName"   = "runtime/default"
        "apparmor.security.beta.kubernetes.io/allowedProfileNames"  = "runtime/default"
        "apparmor.security.beta.kubernetes.io/defaultProfileName"   = "runtime/default"
      }
    }
    spec = {
      privileged               = false
      allowPrivilegeEscalation = false
      requiredDropCapabilities = ["ALL"]
      volumes = [
        "emptyDir",
        "projected",
        "secret",
        "downwardAPI",
        "configMap"
      ]
      runAsUser = {
        rule = "MustRunAsNonRoot"
      }
      seLinux = {
        rule = "RunAsAny"
      }
      fsGroup = {
        rule = "RunAsAny"
      }
      readOnlyRootFilesystem = true
    }
  }
}

# RBAC for Pod Security Policy
resource "kubernetes_role" "psp" {
  count = var.enable_pod_security_policy ? 1 : 0

  metadata {
    name      = "${var.app_name}-psp"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  rule {
    api_groups     = ["policy"]
    resources      = ["podsecuritypolicies"]
    verbs          = ["use"]
    resource_names = ["${var.app_name}-psp"]
  }
}

resource "kubernetes_role_binding" "psp" {
  count = var.enable_pod_security_policy ? 1 : 0

  metadata {
    name      = "${var.app_name}-psp"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  role_ref {
    kind      = "Role"
    name      = kubernetes_role.psp[0].metadata[0].name
    api_group = "rbac.authorization.k8s.io"
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.app.metadata[0].name
    namespace = kubernetes_namespace.app.metadata[0].name
  }
}