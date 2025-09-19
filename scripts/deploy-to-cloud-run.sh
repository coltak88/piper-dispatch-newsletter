#!/bin/bash

# Piper Newsletter System - Cloud Run Deployment Script
# Automated deployment with error handling and rollback capabilities

set -euo pipefail

# Configuration
PROJECT_ID="sarvajaya-genesis-protocol"
SERVICE_NAME="piper-dispatch-main"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/piper-newsletter"
SERVICE_ACCOUNT="piper-newsletter-sa@${PROJECT_ID}.iam.gserviceaccount.com"

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

# Error handling
cleanup() {
    if [[ -n "${CURRENT_REVISION:-}" ]]; then
        log "Performing rollback to revision: $CURRENT_REVISION"
        gcloud run services update-traffic "$SERVICE_NAME" \
            --to-revisions "$CURRENT_REVISION"=100 \
            --region="$REGION" \
            --quiet || true
    fi
}

trap cleanup ERR

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI is not installed"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "Not authenticated with gcloud. Run 'gcloud auth login'"
        exit 1
    fi
    
    # Check if project is set
    if [[ "$(gcloud config get-value project)" != "$PROJECT_ID" ]]; then
        log "Setting project to $PROJECT_ID"
        gcloud config set project "$PROJECT_ID"
    fi
    
    success "Prerequisites check passed"
}

# Get current revision
get_current_revision() {
    log "Getting current service revision..."
    CURRENT_REVISION=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --format="value(status.latestCreatedRevisionName)" 2>/dev/null || echo "")
    
    if [[ -n "$CURRENT_REVISION" ]]; then
        log "Current revision: $CURRENT_REVISION"
    else
        warning "Service does not exist yet, will create new service"
    fi
}

# Build Docker image
build_image() {
    log "Building Docker image..."
    
    # Build the image
    docker build -t "$IMAGE_NAME:latest" . || {
        error "Failed to build Docker image"
        exit 1
    }
    
    # Tag with timestamp
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:$TIMESTAMP"
    
    success "Docker image built successfully: $IMAGE_NAME:latest"
    success "Tagged image: $IMAGE_NAME:$TIMESTAMP"
}

# Push image to registry
push_image() {
    log "Pushing image to Google Container Registry..."
    
    # Configure Docker for GCR
    gcloud auth configure-docker
    
    # Push both tags
    docker push "$IMAGE_NAME:latest" || {
        error "Failed to push latest image"
        exit 1
    }
    
    docker push "$IMAGE_NAME:$TIMESTAMP" || {
        error "Failed to push timestamped image"
        exit 1
    }
    
    success "Images pushed successfully"
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    log "Deploying to Cloud Run..."
    
    # Deploy command
    gcloud run deploy "$SERVICE_NAME" \
        --image "$IMAGE_NAME:latest" \
        --platform managed \
        --region="$REGION" \
        --allow-unauthenticated \
        --memory "1Gi" \
        --cpu "1000m" \
        --max-instances "3" \
        --min-instances "0" \
        --timeout "300s" \
        --concurrency "1000" \
        --service-account "$SERVICE_ACCOUNT" \
        --set-secrets "JWT_SECRET=JWT_SECRET:latest" \
        --set-secrets "STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest" \
        --set-secrets "SENDGRID_API_KEY=SENDGRID_API_KEY:latest" \
        --set-secrets "MONGODB_URI=MONGODB_URI:latest" \
        --set-secrets "REDIS_URL=REDIS_URL:latest" \
        --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
        --set-secrets "SENTRY_DSN=SENTRY_DSN:latest" \
        --set-env-vars "NODE_ENV=production" \
        --set-env-vars "REACT_APP_BUILD_MODE=production" \
        --set-env-vars "REACT_APP_QUANTUM_SECURITY=enabled" \
        --set-env-vars "REACT_APP_PRIVACY_MODE=gdpr-plus" \
        --quiet || {
        error "Failed to deploy to Cloud Run"
        exit 1
    }
    
    success "Deployed to Cloud Run successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --format="value(status.url)")
    
    log "Service URL: $SERVICE_URL"
    
    # Wait for service to be ready
    log "Waiting for service to be ready..."
    sleep 30
    
    # Perform health check
    for i in {1..10}; do
        if curl -f "$SERVICE_URL/health" >/dev/null 2>&1; then
            success "Health check passed!"
            return 0
        fi
        
        log "Health check attempt $i/10 failed, retrying in 10 seconds..."
        sleep 10
    done
    
    error "Health check failed after 10 attempts"
    exit 1
}

# Performance test
performance_test() {
    log "Running performance tests..."
    
    # Run basic performance test
    if command -v artillery &> /dev/null; then
        artillery run artillery/performance-test.yml --target "$SERVICE_URL" || {
            warning "Performance test failed, but continuing..."
        }
    else
        warning "Artillery not installed, skipping performance tests"
    fi
}

# Update traffic routing
traffic_routing() {
    log "Updating traffic routing..."
    
    # Gradual traffic migration (optional)
    # First send 10% traffic to new revision
    gcloud run services update-traffic "$SERVICE_NAME" \
        --to-latest \
        --region="$REGION" \
        --quiet || {
        error "Failed to update traffic routing"
        exit 1
    }
    
    success "Traffic routing updated successfully"
}

# Cleanup old revisions
cleanup_revisions() {
    log "Cleaning up old revisions..."
    
    # Keep only the latest 3 revisions
    gcloud run revisions list --service="$SERVICE_NAME" --region="$REGION" \
        --format="value(name)" \
        --sort-by="~metadata.creationTimestamp" |
    tail -n +4 |
    while read -r revision; do
        if [[ -n "$revision" ]]; then
            log "Deleting old revision: $revision"
            gcloud run revisions delete "$revision" --region="$REGION" --quiet || true
        fi
    done
    
    success "Old revisions cleaned up"
}

# Generate deployment report
generate_report() {
    log "Generating deployment report..."
    
    cat > deployment-report.json << EOF
{
    "deployment": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "service_name": "$SERVICE_NAME",
        "region": "$REGION",
        "image": "$IMAGE_NAME:latest",
        "status": "success",
        "service_url": "$SERVICE_URL",
        "previous_revision": "$CURRENT_REVISION"
    }
}
EOF
    
    success "Deployment report generated: deployment-report.json"
}

# Main deployment function
main() {
    log "Starting Cloud Run deployment for Piper Newsletter System"
    log "Project: $PROJECT_ID"
    log "Service: $SERVICE_NAME"
    log "Region: $REGION"
    
    # Execute deployment steps
    check_prerequisites
    get_current_revision
    build_image
    push_image
    deploy_to_cloud_run
    health_check
    performance_test
    traffic_routing
    cleanup_revisions
    generate_report
    
    success "Deployment completed successfully!"
    log "Service URL: $SERVICE_URL"
    log "Deployment report: deployment-report.json"
}

# Command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-cleanup)
            SKIP_CLEANUP=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --skip-tests     Skip performance tests"
            echo "  --skip-cleanup   Skip cleanup of old revisions"
            echo "  --force          Force deployment without confirmation"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Confirmation prompt (unless forced)
if [[ "${FORCE_DEPLOY:-false}" != "true" ]]; then
    warning "This will deploy to production environment. Continue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Deployment cancelled by user"
        exit 0
    fi
fi

# Run main function
main "$@"