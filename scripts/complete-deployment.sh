#!/bin/bash

# Piper Newsletter System - Complete Deployment Script
# This script handles the entire deployment process from start to finish

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="piper-dispatch-main"
REGION="us-central1"
SERVICE_NAME="piper-dispatch-main"
GITHUB_REPO="sarvajaya-genesis-protocol/piper-dispatch-main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check required tools
    if ! command_exists gcloud; then
        missing_deps+=("gcloud")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Missing required dependencies: ${missing_deps[*]}"
        error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    success "All prerequisites satisfied"
}

# Function to authenticate with Google Cloud
authenticate_gcp() {
    log "Authenticating with Google Cloud Platform..."
    
    # Check if already authenticated
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        success "Already authenticated with GCP"
        return 0
    fi
    
    # Try to authenticate with service account key if available
    if [ -f "$PROJECT_ROOT/gcp-service-account-key.json" ]; then
        gcloud auth activate-service-account --key-file="$PROJECT_ROOT/gcp-service-account-key.json"
        success "Authenticated with service account key"
    else
        warning "No service account key found. Please authenticate manually:"
        gcloud auth login
    fi
    
    # Set project
    gcloud config set project sarvajaya-genesis-protocol
    success "GCP authentication completed"
}

# Function to setup GCP environment
setup_gcp_environment() {
    log "Setting up Google Cloud Platform environment..."
    
    # Run GCP setup script
    "$SCRIPT_DIR/setup-gcp-environment.sh" --skip-cloud-sql
    
    success "GCP environment setup completed"
}

# Function to setup GitHub Actions
setup_github_actions() {
    log "Setting up GitHub Actions..."
    
    # Run GitHub Actions setup script
    "$SCRIPT_DIR/github-actions-setup.sh"
    
    success "GitHub Actions setup completed"
}

# Function to run tests
run_tests() {
    log "Running comprehensive test suite..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log "Installing dependencies..."
    npm ci
    
    # Run linting
    log "Running code linting..."
    npm run lint
    
    # Run type checking
    log "Running type checking..."
    npm run type-check
    
    # Run unit tests
    log "Running unit tests..."
    npm run test:unit
    
    # Run integration tests
    log "Running integration tests..."
    npm run test:integration
    
    # Run security audit
    log "Running security audit..."
    npm audit --audit-level=high
    
    # Build application
    log "Building application..."
    npm run build
    
    # Check bundle size
    log "Checking bundle size..."
    npm run bundle-size
    
    success "All tests passed successfully"
}

# Function to build and test Docker image
build_docker_image() {
    log "Building and testing Docker image..."
    
    cd "$PROJECT_ROOT"
    
    # Build Docker image
    log "Building Docker image..."
    docker build -t "gcr.io/sarvajaya-genesis-protocol/$SERVICE_NAME:latest" .
    
    # Test Docker image locally
    log "Testing Docker image locally..."
    docker run -d -p 8080:8080 --name test-container "gcr.io/sarvajaya-genesis-protocol/$SERVICE_NAME:latest"
    
    # Wait for container to start
    sleep 10
    
    # Test health endpoint
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        success "Docker image health check passed"
    else
        error "Docker image health check failed"
        docker logs test-container
        docker stop test-container
        docker rm test-container
        exit 1
    fi
    
    # Stop and remove test container
    docker stop test-container
    docker rm test-container
    
    success "Docker image build and test completed"
}

# Function to push Docker image
push_docker_image() {
    log "Pushing Docker image to Google Container Registry..."
    
    # Configure Docker for GCR
    gcloud auth configure-docker
    
    # Push image
    docker push "gcr.io/sarvajaya-genesis-protocol/$SERVICE_NAME:latest"
    
    success "Docker image pushed successfully"
}

# Function to deploy to staging
deploy_staging() {
    log "Deploying to staging environment..."
    
    # Deploy to Cloud Run with staging configuration
    gcloud run deploy "$SERVICE_NAME-staging" \
        --image "gcr.io/sarvajaya-genesis-protocol/$SERVICE_NAME:latest" \
        --region "$REGION" \
        --platform managed \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --max-instances 10 \
        --min-instances 1 \
        --concurrency 1000 \
        --timeout 300s \
        --set-env-vars NODE_ENV=staging \
        --set-env-vars "DATABASE_URL=secret:staging-database-url" \
        --set-env-vars "JWT_SECRET=secret:staging-jwt-secret" \
        --set-env-vars "REDIS_URL=secret:staging-redis-url" \
        --set-env-vars "EMAIL_API_KEY=secret:staging-email-api-key" \
        --set-env-vars "PAYMENT_API_KEY=secret:staging-payment-api-key" \
        --set-env-vars "ANALYTICS_API_KEY=secret:staging-analytics-api-key"
    
    success "Staging deployment completed"
}

# Function to run staging tests
run_staging_tests() {
    log "Running staging environment tests..."
    
    # Get staging URL
    STAGING_URL=$(gcloud run services describe "$SERVICE_NAME-staging" \
        --region "$REGION" \
        --format 'value(status.url)')
    
    # Run end-to-end tests against staging
    cd "$PROJECT_ROOT"
    STAGING_URL="$STAGING_URL" npm run test:e2e:staging
    
    # Run performance tests
    npm run test:performance -- --target "$STAGING_URL"
    
    success "Staging tests completed"
}

# Function to deploy to production
deploy_production() {
    log "Deploying to production environment..."
    
    # Deploy to Cloud Run with production configuration
    gcloud run deploy "$SERVICE_NAME" \
        --image "gcr.io/sarvajaya-genesis-protocol/$SERVICE_NAME:latest" \
        --region "$REGION" \
        --platform managed \
        --allow-unauthenticated \
        --memory 4Gi \
        --cpu 4 \
        --max-instances 100 \
        --min-instances 2 \
        --concurrency 1000 \
        --timeout 300s \
        --set-env-vars NODE_ENV=production \
        --set-env-vars "DATABASE_URL=secret:production-database-url" \
        --set-env-vars "JWT_SECRET=secret:production-jwt-secret" \
        --set-env-vars "REDIS_URL=secret:production-redis-url" \
        --set-env-vars "EMAIL_API_KEY=secret:production-email-api-key" \
        --set-env-vars "PAYMENT_API_KEY=secret:production-payment-api-key" \
        --set-env-vars "ANALYTICS_API_KEY=secret:production-analytics-api-key" \
        --set-env-vars "SSL_CERT=secret:ssl-cert" \
        --set-env-vars "SSL_KEY=secret:ssl-key"
    
    success "Production deployment completed"
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Get production URL
    PRODUCTION_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region "$REGION" \
        --format 'value(status.url)')
    
    # Test health endpoint
    if curl -f "$PRODUCTION_URL/health" >/dev/null 2>&1; then
        success "Health check passed"
    else
        error "Health check failed"
        return 1
    fi
    
    # Test API endpoints
    if curl -f "$PRODUCTION_URL/api/health" >/dev/null 2>&1; then
        success "API health check passed"
    else
        error "API health check failed"
        return 1
    fi
    
    # Test database connectivity
    if curl -f "$PRODUCTION_URL/api/status" >/dev/null 2>&1; then
        success "Database connectivity check passed"
    else
        error "Database connectivity check failed"
        return 1
    fi
    
    success "Deployment verification completed"
}

# Function to setup monitoring
setup_monitoring() {
    log "Setting up monitoring and alerting..."
    
    # Create monitoring dashboard
    gcloud monitoring dashboards create \
        --config-from-file="$PROJECT_ROOT/monitoring/dashboard.json" \
        --project=sarvajaya-genesis-protocol || warning "Dashboard creation failed (may already exist)"
    
    # Create alert policies
    gcloud alpha monitoring policies create \
        --policy-from-file="$PROJECT_ROOT/monitoring/alerts.json" \
        --project=sarvajaya-genesis-protocol || warning "Alert policies creation failed (may already exist)"
    
    success "Monitoring setup completed"
}

# Function to cleanup old revisions
cleanup_old_revisions() {
    log "Cleaning up old revisions..."
    
    # Keep only the latest 5 revisions
    gcloud run revisions list --service="$SERVICE_NAME" --region="$REGION" \
        --format="value(metadata.name)" \
        --sort-by="~metadata.creationTimestamp" |
        tail -n +6 |
        while read -r revision; do
            gcloud run revisions delete "$revision" --region="$REGION" --quiet
        done
    
    success "Old revisions cleaned up"
}

# Function to generate deployment report
generate_deployment_report() {
    log "Generating deployment report..."
    
    local report_file="$PROJECT_ROOT/deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# Deployment Report - Piper Newsletter System

**Deployment Date**: $(date)
**Deployment ID**: $(date +%s)
**Deployed By**: $(git config user.name) ($(git config user.email))

## Deployment Summary

- **Service**: $SERVICE_NAME
- **Region**: $REGION
- **Project**: sarvajaya-genesis-protocol
- **Repository**: $GITHUB_REPO
- **Commit**: $(git rev-parse HEAD)
- **Branch**: $(git rev-parse --abbrev-ref HEAD)

## Deployment Status

$(if verify_deployment >/dev/null 2>&1; then echo "✅ SUCCESS"; else echo "❌ FAILED"; fi)

## Service Information

**Service URL**: $(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')
**Latest Revision**: $(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.latestReadyRevisionName)')
**Traffic Split**: $(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.traffic)')

## Resource Configuration

- **Memory**: 4Gi
- **CPU**: 4
- **Max Instances**: 100
- **Min Instances**: 2
- **Concurrency**: 1000
- **Timeout**: 300s

## Health Checks

- **Application Health**: $(curl -s -o /dev/null -w "%{http_code}" "$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')/health")
- **API Health**: $(curl -s -o /dev/null -w "%{http_code}" "$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')/api/health")

## Monitoring

- **Cloud Monitoring**: Enabled
- **Error Tracking**: Sentry
- **Performance Monitoring**: Enabled
- **Uptime Checks**: Configured

## Next Steps

1. Monitor application performance for 24 hours
2. Review error logs and metrics
3. Update documentation
4. Notify stakeholders
5. Schedule post-deployment review

## Troubleshooting

If issues arise:
1. Check Cloud Run logs: \`gcloud logging read "resource.type=\\"cloud_run_revision\\" resource.labels.service_name=\\"$SERVICE_NAME\\""\`
2. Review monitoring dashboard
3. Check error tracking in Sentry
4. Verify database connectivity
5. Test critical user flows

---
*Generated automatically by deployment script*
EOF
    
    success "Deployment report generated: $report_file"
}

# Main deployment function
main() {
    log "Starting complete deployment process for Piper Newsletter System..."
    
    # Parse command line arguments
    local skip_tests=false
    local skip_staging=false
    local force_deploy=false
    local cleanup_only=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --skip-staging)
                skip_staging=true
                shift
                ;;
            --force)
                force_deploy=true
                shift
                ;;
            --cleanup-only)
                cleanup_only=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-tests      Skip test execution"
                echo "  --skip-staging    Skip staging deployment"
                echo "  --force           Force deployment without confirmation"
                echo "  --cleanup-only    Only cleanup old revisions"
                echo "  --help            Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Cleanup only mode
    if [ "$cleanup_only" = true ]; then
        cleanup_old_revisions
        exit 0
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Authenticate with GCP
    authenticate_gcp
    
    # Setup environment
    setup_gcp_environment
    setup_github_actions
    
    # Run tests (unless skipped)
    if [ "$skip_tests" = false ]; then
        run_tests
    else
        warning "Skipping tests as requested"
    fi
    
    # Build and test Docker image
    build_docker_image
    push_docker_image
    
    # Deploy to staging (unless skipped)
    if [ "$skip_staging" = false ]; then
        deploy_staging
        run_staging_tests
    else
        warning "Skipping staging deployment as requested"
    fi
    
    # Deploy to production
    if [ "$force_deploy" = true ]; then
        deploy_production
    else
        warning "Production deployment requires manual confirmation"
        echo -n "Deploy to production? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            deploy_production
        else
            log "Production deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Post-deployment tasks
    verify_deployment
    setup_monitoring
    cleanup_old_revisions
    generate_deployment_report
    
    success "Deployment process completed successfully!"
    log "Service URL: $(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')"
}

# Run main function with all arguments
main "$@"