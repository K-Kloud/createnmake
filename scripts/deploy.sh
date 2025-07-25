#!/bin/bash

set -euo pipefail

# Configuration
NAMESPACE="opentech-webapp"
APP_NAME="opentech-webapp"
IMAGE_TAG="${1:-latest}"
REGISTRY="${REGISTRY:-your-registry.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    command -v kubectl >/dev/null 2>&1 || error "kubectl is required but not installed"
    command -v docker >/dev/null 2>&1 || error "docker is required but not installed"
    
    # Check kubectl connection
    kubectl cluster-info >/dev/null 2>&1 || error "Cannot connect to Kubernetes cluster"
    
    log "All dependencies check passed"
}

# Build and push Docker image
build_and_push() {
    log "Building Docker image..."
    
    # Security scan with Trivy
    if command -v trivy >/dev/null 2>&1; then
        log "Running security scan with Trivy..."
        trivy fs --severity HIGH,CRITICAL . || warn "Security vulnerabilities found"
    fi
    
    # Build image
    docker build -t "$REGISTRY/$APP_NAME:$IMAGE_TAG" -t "$REGISTRY/$APP_NAME:latest" .
    
    # Push image
    log "Pushing Docker image to registry..."
    docker push "$REGISTRY/$APP_NAME:$IMAGE_TAG"
    docker push "$REGISTRY/$APP_NAME:latest"
    
    log "Docker image built and pushed successfully"
}

# Apply Kubernetes manifests
deploy_k8s() {
    log "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply security policies first
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/rbac.yaml
    kubectl apply -f k8s/network-policy.yaml
    kubectl apply -f k8s/pod-security-policy.yaml
    
    # Apply secrets (in production, use external secret management)
    warn "Using default secrets. In production, configure external secret management!"
    kubectl apply -f k8s/secrets.yaml
    
    # Apply application manifests
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/hpa.yaml
    
    # Apply ingress
    kubectl apply -f k8s/ingress.yaml
    
    # Apply monitoring
    kubectl apply -f k8s/monitoring.yaml
    
    log "Kubernetes manifests applied successfully"
}

# Wait for deployment
wait_for_deployment() {
    log "Waiting for deployment to be ready..."
    
    kubectl rollout status deployment/"$APP_NAME" -n "$NAMESPACE" --timeout=300s
    
    # Check pod status
    kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME"
    
    log "Deployment completed successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Get service endpoint
    SERVICE_IP=$(kubectl get svc "$APP_NAME-service" -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
    
    # Port forward for testing
    kubectl port-forward -n "$NAMESPACE" svc/"$APP_NAME-service" 8080:80 &
    PORT_FORWARD_PID=$!
    
    # Wait a moment for port forward to establish
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        log "Health check passed"
    else
        warn "Health check failed"
    fi
    
    # Cleanup port forward
    kill $PORT_FORWARD_PID 2>/dev/null || true
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
}

# Trap cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    log "Starting deployment of $APP_NAME:$IMAGE_TAG"
    
    check_dependencies
    build_and_push
    deploy_k8s
    wait_for_deployment
    health_check
    
    log "Deployment completed successfully!"
    
    # Show access information
    echo ""
    log "Access your application:"
    echo "  Cluster IP: $(kubectl get svc "$APP_NAME-service" -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')"
    echo "  Port: 80"
    echo ""
    echo "To access via port-forward:"
    echo "  kubectl port-forward -n $NAMESPACE svc/$APP_NAME-service 8080:80"
    echo "  Then visit: http://localhost:8080"
}

# Run main function
main "$@"