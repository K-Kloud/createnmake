#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Security scan functions
scan_dockerfile() {
    log "Scanning Dockerfile for security issues..."
    
    if command -v hadolint >/dev/null 2>&1; then
        hadolint Dockerfile || warn "Dockerfile security issues found"
    else
        warn "hadolint not found. Install it for Dockerfile security scanning."
    fi
}

scan_dependencies() {
    log "Scanning dependencies for vulnerabilities..."
    
    if command -v npm >/dev/null 2>&1; then
        npm audit --audit-level moderate || warn "NPM vulnerabilities found"
    fi
    
    if command -v yarn >/dev/null 2>&1; then
        yarn audit --level moderate || warn "Yarn vulnerabilities found"
    fi
}

scan_container_image() {
    log "Scanning container image for vulnerabilities..."
    
    IMAGE_NAME="${1:-opentech-webapp:latest}"
    
    if command -v trivy >/dev/null 2>&1; then
        trivy image --severity HIGH,CRITICAL "$IMAGE_NAME" || warn "Container vulnerabilities found"
    else
        warn "Trivy not found. Install it for container image scanning."
    fi
    
    if command -v grype >/dev/null 2>&1; then
        grype "$IMAGE_NAME" || warn "Grype found vulnerabilities"
    fi
}

scan_k8s_manifests() {
    log "Scanning Kubernetes manifests for security misconfigurations..."
    
    if command -v kubesec >/dev/null 2>&1; then
        for file in k8s/*.yaml; do
            log "Scanning $file"
            kubesec scan "$file" || warn "Security issues found in $file"
        done
    else
        warn "kubesec not found. Install it for K8s manifest scanning."
    fi
    
    if command -v kube-score >/dev/null 2>&1; then
        kube-score score k8s/*.yaml || warn "Kube-score found issues"
    fi
}

scan_secrets() {
    log "Scanning for exposed secrets..."
    
    if command -v gitleaks >/dev/null 2>&1; then
        gitleaks detect --source . --verbose || warn "Potential secrets found"
    else
        warn "gitleaks not found. Install it for secret scanning."
    fi
    
    if command -v truffleHog >/dev/null 2>&1; then
        truffleHog filesystem . || warn "TruffleHog found potential secrets"
    fi
}

security_checklist() {
    log "Security checklist verification..."
    
    echo "✓ Checking security configurations:"
    
    # Check Dockerfile security
    if grep -q "USER" Dockerfile; then
        echo "  ✓ Non-root user configured in Dockerfile"
    else
        echo "  ✗ No non-root user found in Dockerfile"
    fi
    
    # Check for security headers in nginx config
    if grep -q "X-Frame-Options" nginx.conf; then
        echo "  ✓ Security headers configured in nginx"
    else
        echo "  ✗ Security headers missing in nginx config"
    fi
    
    # Check K8s security contexts
    if grep -q "runAsNonRoot: true" k8s/deployment.yaml; then
        echo "  ✓ Pod security context configured"
    else
        echo "  ✗ Pod security context missing"
    fi
    
    # Check network policies
    if [ -f "k8s/network-policy.yaml" ]; then
        echo "  ✓ Network policy defined"
    else
        echo "  ✗ Network policy missing"
    fi
    
    # Check RBAC
    if [ -f "k8s/rbac.yaml" ]; then
        echo "  ✓ RBAC configured"
    else
        echo "  ✗ RBAC missing"
    fi
}

compliance_check() {
    log "Running compliance checks..."
    
    # CIS Docker Benchmark (if docker-bench-security is available)
    if command -v docker-bench-security >/dev/null 2>&1; then
        docker-bench-security || warn "CIS Docker Benchmark issues found"
    fi
    
    # OPA Conftest for policy validation
    if command -v conftest >/dev/null 2>&1; then
        log "Running OPA Conftest policies..."
        conftest verify --policy policies/ k8s/ || warn "Policy violations found"
    fi
}

main() {
    log "Starting comprehensive security scan..."
    
    scan_dockerfile
    scan_dependencies
    scan_secrets
    scan_k8s_manifests
    security_checklist
    compliance_check
    
    # If image exists, scan it
    if docker images | grep -q "opentech-webapp"; then
        scan_container_image "opentech-webapp:latest"
    fi
    
    log "Security scan completed!"
    
    echo ""
    echo "Recommendations:"
    echo "1. Fix any HIGH/CRITICAL vulnerabilities found"
    echo "2. Update dependencies regularly"
    echo "3. Use external secret management in production"
    echo "4. Implement runtime security monitoring"
    echo "5. Regular security audits and penetration testing"
}

main "$@"