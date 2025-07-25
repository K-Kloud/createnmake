# Monitoring Module - Prometheus, Grafana, and Alerting

# Monitoring Namespace
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
    labels = {
      name = "monitoring"
    }
  }
}

# Prometheus Operator via Helm
resource "helm_release" "prometheus_operator" {
  name       = "prometheus-operator"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "55.5.0"

  values = [
    <<-EOT
    prometheus:
      prometheusSpec:
        retention: ${var.prometheus_retention}
        storageSpec:
          volumeClaimTemplate:
            spec:
              accessModes: ["ReadWriteOnce"]
              resources:
                requests:
                  storage: ${var.prometheus_storage}
        serviceMonitorSelectorNilUsesHelmValues: false
        ruleSelectorNilUsesHelmValues: false
    
    grafana:
      adminPassword: ${var.grafana_admin_password}
      ingress:
        enabled: true
        annotations:
          kubernetes.io/ingress.class: nginx
          cert-manager.io/cluster-issuer: letsencrypt-prod
        hosts:
          - grafana.${var.domain_name}
        tls:
          - secretName: grafana-tls
            hosts:
              - grafana.${var.domain_name}
      
      dashboardProviders:
        dashboardproviders.yaml:
          apiVersion: 1
          providers:
          - name: 'default'
            orgId: 1
            folder: ''
            type: file
            disableDeletion: false
            editable: true
            options:
              path: /var/lib/grafana/dashboards/default
      
      dashboards:
        default:
          kubernetes-cluster:
            gnetId: 7249
            revision: 1
            datasource: Prometheus
          kubernetes-pod:
            gnetId: 6417
            revision: 1
            datasource: Prometheus
          nginx-ingress:
            gnetId: 9614
            revision: 1
            datasource: Prometheus
    
    alertmanager:
      alertmanagerSpec:
        storage:
          volumeClaimTemplate:
            spec:
              accessModes: ["ReadWriteOnce"]
              resources:
                requests:
                  storage: 10Gi
      config:
        global:
          slack_api_url: '${var.slack_webhook_url}'
        route:
          group_by: ['alertname']
          group_wait: 10s
          group_interval: 10s
          repeat_interval: 1h
          receiver: 'web.hook'
          routes:
          - match:
              severity: critical
            receiver: 'pagerduty'
        receivers:
        - name: 'web.hook'
          slack_configs:
          - channel: '#alerts'
            title: 'OpenTech Webapp Alert'
            text: '{{ range .Alerts }}{{ .Annotations.summary }}: {{ .Annotations.description }}{{ end }}'
        - name: 'pagerduty'
          pagerduty_configs:
          - service_key: '${var.pagerduty_service_key}'
    EOT
  ]

  depends_on = [kubernetes_namespace.monitoring]
}

# ServiceMonitor for the application
resource "kubernetes_manifest" "service_monitor" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "${var.app_name}-monitor"
      namespace = var.namespace
      labels = {
        app = var.app_name
      }
    }
    spec = {
      selector = {
        matchLabels = {
          app = var.app_name
        }
      }
      endpoints = [
        {
          port     = "http"
          path     = "/metrics"
          interval = "30s"
          scrapeTimeout = "10s"
        }
      ]
    }
  }

  depends_on = [helm_release.prometheus_operator]
}

# PrometheusRule for application alerts
resource "kubernetes_manifest" "prometheus_rule" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "PrometheusRule"
    metadata = {
      name      = "${var.app_name}-alerts"
      namespace = var.namespace
      labels = {
        app = var.app_name
      }
    }
    spec = {
      groups = [
        {
          name = "${var.app_name}.rules"
          rules = [
            {
              alert = "WebappDown"
              expr  = "up{job=\"${var.app_name}-service\"} == 0"
              for   = "5m"
              labels = {
                severity = "critical"
              }
              annotations = {
                summary     = "OpenTech webapp is down"
                description = "The OpenTech webapp has been down for more than 5 minutes."
              }
            },
            {
              alert = "WebappHighCPU"
              expr  = "rate(container_cpu_usage_seconds_total{pod=~\"${var.app_name}-.*\"}[5m]) > 0.8"
              for   = "10m"
              labels = {
                severity = "warning"
              }
              annotations = {
                summary     = "High CPU usage on OpenTech webapp"
                description = "CPU usage is above 80% for more than 10 minutes."
              }
            },
            {
              alert = "WebappHighMemory"
              expr  = "container_memory_usage_bytes{pod=~\"${var.app_name}-.*\"} / container_spec_memory_limit_bytes > 0.9"
              for   = "5m"
              labels = {
                severity = "warning"
              }
              annotations = {
                summary     = "High memory usage on OpenTech webapp"
                description = "Memory usage is above 90% for more than 5 minutes."
              }
            },
            {
              alert = "WebappHighErrorRate"
              expr  = "rate(nginx_http_requests_total{status=~\"5..\"}[5m]) / rate(nginx_http_requests_total[5m]) > 0.1"
              for   = "5m"
              labels = {
                severity = "critical"
              }
              annotations = {
                summary     = "High error rate on OpenTech webapp"
                description = "Error rate is above 10% for more than 5 minutes."
              }
            },
            {
              alert = "WebappPodCrashLooping"
              expr  = "rate(kube_pod_container_status_restarts_total{pod=~\"${var.app_name}-.*\"}[15m]) > 0"
              for   = "5m"
              labels = {
                severity = "warning"
              }
              annotations = {
                summary     = "OpenTech webapp pod is crash looping"
                description = "Pod {{ $labels.pod }} is restarting frequently."
              }
            },
            {
              alert = "WebappReplicasNotReady"
              expr  = "kube_deployment_status_replicas_available{deployment=\"${var.app_name}\"} < kube_deployment_spec_replicas{deployment=\"${var.app_name}\"}"
              for   = "10m"
              labels = {
                severity = "warning"
              }
              annotations = {
                summary     = "OpenTech webapp replicas not ready"
                description = "Not all replicas are ready for deployment {{ $labels.deployment }}."
              }
            }
          ]
        }
      ]
    }
  }

  depends_on = [helm_release.prometheus_operator]
}

# Loki for log aggregation (optional)
resource "helm_release" "loki" {
  count      = var.enable_logging ? 1 : 0
  name       = "loki"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "2.9.11"

  values = [
    <<-EOT
    loki:
      persistence:
        enabled: true
        size: 50Gi
    
    promtail:
      enabled: true
      config:
        snippets:
          extraScrapeConfigs: |
            - job_name: kubernetes-pods
              kubernetes_sd_configs:
                - role: pod
              pipeline_stages:
                - docker: {}
              relabel_configs:
                - source_labels:
                    - __meta_kubernetes_pod_container_name
                  target_label: container
                - source_labels:
                    - __meta_kubernetes_pod_name
                  target_label: pod
                - source_labels:
                    - __meta_kubernetes_namespace
                  target_label: namespace
    
    grafana:
      enabled: false
    EOT
  ]

  depends_on = [kubernetes_namespace.monitoring]
}

# Jaeger for distributed tracing (optional)
resource "helm_release" "jaeger" {
  count      = var.enable_tracing ? 1 : 0
  name       = "jaeger"
  repository = "https://jaegertracing.github.io/helm-charts"
  chart      = "jaeger"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "0.71.11"

  values = [
    <<-EOT
    allInOne:
      enabled: true
      ingress:
        enabled: true
        annotations:
          kubernetes.io/ingress.class: nginx
          cert-manager.io/cluster-issuer: letsencrypt-prod
        hosts:
          - host: jaeger.${var.domain_name}
            paths:
              - path: /
                pathType: Prefix
        tls:
          - secretName: jaeger-tls
            hosts:
              - jaeger.${var.domain_name}
    EOT
  ]

  depends_on = [kubernetes_namespace.monitoring]
}

# Node Exporter DaemonSet (if not included in kube-prometheus-stack)
resource "kubernetes_manifest" "node_exporter_service_monitor" {
  count = var.enable_node_exporter ? 1 : 0

  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "node-exporter"
      namespace = kubernetes_namespace.monitoring.metadata[0].name
    }
    spec = {
      selector = {
        matchLabels = {
          "app.kubernetes.io/name" = "node-exporter"
        }
      }
      endpoints = [
        {
          port = "metrics"
        }
      ]
    }
  }

  depends_on = [helm_release.prometheus_operator]
}

# Custom Grafana dashboard for the application
resource "kubernetes_config_map" "grafana_dashboard" {
  metadata {
    name      = "${var.app_name}-dashboard"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
    labels = {
      grafana_dashboard = "1"
    }
  }

  data = {
    "${var.app_name}-dashboard.json" = jsonencode({
      dashboard = {
        id    = null
        title = "OpenTech Webapp Dashboard"
        tags  = ["opentech", "webapp"]
        style = "dark"
        timezone = "browser"
        panels = [
          {
            id    = 1
            title = "Request Rate"
            type  = "graph"
            targets = [
              {
                expr = "rate(nginx_http_requests_total{service=\"${var.app_name}-service\"}[5m])"
              }
            ]
          },
          {
            id    = 2
            title = "Response Time"
            type  = "graph"
            targets = [
              {
                expr = "histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket{service=\"${var.app_name}-service\"}[5m]))"
              }
            ]
          },
          {
            id    = 3
            title = "Error Rate"
            type  = "graph"
            targets = [
              {
                expr = "rate(nginx_http_requests_total{service=\"${var.app_name}-service\",status=~\"5..\"}[5m])"
              }
            ]
          },
          {
            id    = 4
            title = "CPU Usage"
            type  = "graph"
            targets = [
              {
                expr = "rate(container_cpu_usage_seconds_total{pod=~\"${var.app_name}-.*\"}[5m])"
              }
            ]
          },
          {
            id    = 5
            title = "Memory Usage"
            type  = "graph"
            targets = [
              {
                expr = "container_memory_usage_bytes{pod=~\"${var.app_name}-.*\"}"
              }
            ]
          }
        ]
        time = {
          from = "now-1h"
          to   = "now"
        }
        refresh = "5s"
      }
    })
  }

  depends_on = [helm_release.prometheus_operator]
}