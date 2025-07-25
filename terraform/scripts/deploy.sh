#!/bin/bash

# OpenTech Webapp - Terraform Deployment Script
# This script automates the deployment of the OpenTech webapp infrastructure

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(dirname "$SCRIPT_DIR")"
DEFAULT_ENVIRONMENT="prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Help function
show_help() {
    cat << EOF
OpenTech Webapp Terraform Deployment Script

Usage: $0 [OPTIONS] [COMMAND]

COMMANDS:
    plan        Generate and show Terraform execution plan
    apply       Apply Terraform configuration
    destroy     Destroy Terraform-managed infrastructure
    validate    Validate Terraform configuration
    fmt         Format Terraform files
    init        Initialize Terraform working directory
    output      Show Terraform outputs
    state       Show Terraform state
    help        Show this help message

OPTIONS:
    -e, --environment ENV    Environment to deploy (dev, staging, prod) [default: prod]
    -c, --cloud PROVIDER     Cloud provider (aws, gcp) [default: aws]
    -r, --region REGION      Cloud region [default: us-west-2 for AWS, us-central1 for GCP]
    -v, --verbose           Enable verbose output
    -y, --yes               Auto-approve actions (use with caution)
    -h, --help              Show this help message

EXAMPLES:
    # Initialize and plan production deployment on AWS
    $0 -e prod -c aws init
    $0 -e prod -c aws plan

    # Apply staging deployment on GCP
    $0 -e staging -c gcp apply

    # Destroy development environment
    $0 -e dev destroy

    # Format all Terraform files
    $0 fmt

PREREQUISITES:
    - Terraform >= 1.5.0
    - AWS CLI (for AWS deployments)
    - gcloud CLI (for GCP deployments)
    - kubectl
    - helm

ENVIRONMENT VARIABLES:
    TF_VAR_supabase_url              Supabase project URL
    TF_VAR_supabase_anon_key         Supabase anonymous key
    TF_VAR_grafana_admin_password    Grafana admin password
    TF_VAR_slack_webhook_url         Slack webhook URL for alerts
    TF_VAR_pagerduty_service_key     PagerDuty service key
    TF_VAR_gcp_project_id           GCP project ID (for GCP deployments)

EOF
}

# Parse command line arguments
ENVIRONMENT="$DEFAULT_ENVIRONMENT"
CLOUD_PROVIDER="aws"
REGION=""
VERBOSE=false
AUTO_APPROVE=false
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -c|--cloud)
            CLOUD_PROVIDER="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -y|--yes)
            AUTO_APPROVE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        plan|apply|destroy|validate|fmt|init|output|state|help)
            COMMAND="$1"
            shift
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            ;;
    esac
done

# Set default region if not specified
if [[ -z "$REGION" ]]; then
    if [[ "$CLOUD_PROVIDER" == "aws" ]]; then
        REGION="us-west-2"
    elif [[ "$CLOUD_PROVIDER" == "gcp" ]]; then
        REGION="us-central1"
    fi
fi

# Validate inputs
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
fi

if [[ ! "$CLOUD_PROVIDER" =~ ^(aws|gcp)$ ]]; then
    error "Invalid cloud provider: $CLOUD_PROVIDER. Must be aws or gcp."
fi

if [[ -z "$COMMAND" ]]; then
    error "No command specified. Use --help for usage information."
fi

# Show help if requested
if [[ "$COMMAND" == "help" ]]; then
    show_help
    exit 0
fi

# Set verbose mode
if [[ "$VERBOSE" == "true" ]]; then
    set -x
fi

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed. Please install Terraform >= 1.5.0"
    fi
    
    terraform_version=$(terraform version -json | jq -r '.terraform_version')
    log "Found Terraform version: $terraform_version"
    
    # Check cloud provider CLI
    if [[ "$CLOUD_PROVIDER" == "aws" ]]; then
        if ! command -v aws &> /dev/null; then
            error "AWS CLI is not installed. Please install AWS CLI v2"
        fi
        
        # Check AWS credentials
        if ! aws sts get-caller-identity &> /dev/null; then
            error "AWS credentials not configured. Run 'aws configure' first."
        fi
        
        log "AWS CLI configured for account: $(aws sts get-caller-identity --query Account --output text)"
        
    elif [[ "$CLOUD_PROVIDER" == "gcp" ]]; then
        if ! command -v gcloud &> /dev/null; then
            error "gcloud CLI is not installed. Please install Google Cloud CLI"
        fi
        
        # Check GCP authentication
        if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 &> /dev/null; then
            error "GCP authentication not configured. Run 'gcloud auth login' first."
        fi
        
        if [[ -z "${TF_VAR_gcp_project_id:-}" ]]; then
            error "GCP project ID not set. Set TF_VAR_gcp_project_id environment variable."
        fi
        
        log "gcloud configured for project: ${TF_VAR_gcp_project_id}"
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        warn "kubectl is not installed. You'll need it to interact with the cluster after deployment."
    fi
    
    # Check Helm
    if ! command -v helm &> /dev/null; then
        warn "Helm is not installed. Some features may not work properly."
    fi
    
    log "Prerequisites check completed"
}

# Initialize Terraform
terraform_init() {
    log "Initializing Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Set backend configuration based on environment and cloud provider
    local backend_config=""
    if [[ "$CLOUD_PROVIDER" == "aws" ]]; then
        backend_config="-backend-config=bucket=opentech-terraform-state-${ENVIRONMENT}"
        backend_config="$backend_config -backend-config=key=${ENVIRONMENT}/terraform.tfstate"
        backend_config="$backend_config -backend-config=region=${REGION}"
    elif [[ "$CLOUD_PROVIDER" == "gcp" ]]; then
        backend_config="-backend-config=bucket=opentech-terraform-state-${ENVIRONMENT}"
        backend_config="$backend_config -backend-config=prefix=${ENVIRONMENT}"
    fi
    
    terraform init $backend_config
    
    log "Terraform initialized successfully"
}

# Validate configuration
terraform_validate() {
    log "Validating Terraform configuration..."
    
    cd "$TERRAFORM_DIR"
    terraform validate
    
    log "Terraform configuration is valid"
}

# Format Terraform files
terraform_fmt() {
    log "Formatting Terraform files..."
    
    cd "$TERRAFORM_DIR"
    terraform fmt -recursive
    
    log "Terraform files formatted"
}

# Generate Terraform plan
terraform_plan() {
    log "Generating Terraform plan for $ENVIRONMENT environment on $CLOUD_PROVIDER..."
    
    cd "$TERRAFORM_DIR"
    
    local var_file="environments/${ENVIRONMENT}/terraform.tfvars"
    if [[ ! -f "$var_file" ]]; then
        error "Variable file not found: $var_file"
    fi
    
    terraform plan \
        -var-file="$var_file" \
        -var="cloud_provider=$CLOUD_PROVIDER" \
        -var="aws_region=$REGION" \
        -var="gcp_region=$REGION" \
        -out="terraform-${ENVIRONMENT}.plan"
    
    log "Terraform plan generated: terraform-${ENVIRONMENT}.plan"
}

# Apply Terraform configuration
terraform_apply() {
    log "Applying Terraform configuration for $ENVIRONMENT environment on $CLOUD_PROVIDER..."
    
    cd "$TERRAFORM_DIR"
    
    local apply_args=""
    if [[ "$AUTO_APPROVE" == "true" ]]; then
        apply_args="-auto-approve"
    fi
    
    if [[ -f "terraform-${ENVIRONMENT}.plan" ]]; then
        terraform apply $apply_args "terraform-${ENVIRONMENT}.plan"
    else
        local var_file="environments/${ENVIRONMENT}/terraform.tfvars"
        terraform apply $apply_args \
            -var-file="$var_file" \
            -var="cloud_provider=$CLOUD_PROVIDER" \
            -var="aws_region=$REGION" \
            -var="gcp_region=$REGION"
    fi
    
    log "Terraform apply completed successfully"
    
    # Show important outputs
    log "Retrieving deployment information..."
    terraform output
    
    # Provide next steps
    log "Deployment completed! Next steps:"
    log "1. Configure kubectl: $(terraform output -raw kubectl_config_command)"
    log "2. Access application: $(terraform output -raw application_url)"
    
    if [[ "$(terraform output -raw enable_monitoring)" == "true" ]]; then
        log "3. Access Grafana: $(terraform output -raw grafana_url)"
        log "4. Access Prometheus: $(terraform output -raw prometheus_url)"
    fi
}

# Destroy infrastructure
terraform_destroy() {
    warn "This will destroy all infrastructure for $ENVIRONMENT environment on $CLOUD_PROVIDER"
    
    if [[ "$AUTO_APPROVE" != "true" ]]; then
        read -p "Are you sure you want to proceed? (yes/no): " confirm
        if [[ "$confirm" != "yes" ]]; then
            log "Destroy cancelled"
            exit 0
        fi
    fi
    
    cd "$TERRAFORM_DIR"
    
    local var_file="environments/${ENVIRONMENT}/terraform.tfvars"
    local destroy_args=""
    if [[ "$AUTO_APPROVE" == "true" ]]; then
        destroy_args="-auto-approve"
    fi
    
    terraform destroy $destroy_args \
        -var-file="$var_file" \
        -var="cloud_provider=$CLOUD_PROVIDER" \
        -var="aws_region=$REGION" \
        -var="gcp_region=$REGION"
    
    log "Infrastructure destroyed successfully"
}

# Show Terraform outputs
terraform_output() {
    log "Terraform outputs for $ENVIRONMENT environment:"
    
    cd "$TERRAFORM_DIR"
    terraform output
}

# Show Terraform state
terraform_state() {
    log "Terraform state for $ENVIRONMENT environment:"
    
    cd "$TERRAFORM_DIR"
    terraform state list
}

# Check required environment variables
check_environment_variables() {
    log "Checking required environment variables..."
    
    local required_vars=()
    
    # Always required
    required_vars+=("TF_VAR_supabase_url")
    required_vars+=("TF_VAR_supabase_anon_key")
    
    # Required for production and staging
    if [[ "$ENVIRONMENT" != "dev" ]]; then
        required_vars+=("TF_VAR_grafana_admin_password")
    fi
    
    # Required for GCP
    if [[ "$CLOUD_PROVIDER" == "gcp" ]]; then
        required_vars+=("TF_VAR_gcp_project_id")
    fi
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error "Missing required environment variables: ${missing_vars[*]}"
    fi
    
    log "Environment variables check passed"
}

# Main execution
main() {
    log "Starting OpenTech Webapp deployment"
    log "Environment: $ENVIRONMENT"
    log "Cloud Provider: $CLOUD_PROVIDER"
    log "Region: $REGION"
    log "Command: $COMMAND"
    
    # Always check prerequisites
    check_prerequisites
    
    # Check environment variables for apply and plan commands
    if [[ "$COMMAND" =~ ^(plan|apply)$ ]]; then
        check_environment_variables
    fi
    
    # Execute command
    case "$COMMAND" in
        init)
            terraform_init
            ;;
        validate)
            terraform_validate
            ;;
        fmt)
            terraform_fmt
            ;;
        plan)
            terraform_init
            terraform_validate
            terraform_plan
            ;;
        apply)
            terraform_init
            terraform_validate
            terraform_apply
            ;;
        destroy)
            terraform_destroy
            ;;
        output)
            terraform_output
            ;;
        state)
            terraform_state
            ;;
        *)
            error "Unknown command: $COMMAND"
            ;;
    esac
    
    log "Operation completed successfully"
}

# Execute main function
main "$@"