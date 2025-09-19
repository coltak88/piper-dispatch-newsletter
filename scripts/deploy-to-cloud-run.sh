#!/bin/bash

# Super Size Piper Newsletter - Google Cloud Run Deployment Script
# This script builds and deploys the unified ecosystem to Google Cloud Run

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-piper-newsletter-project}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-super-size-piper-newsletter}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
MEMORY="${MEMORY:-2Gi}"
CPU="${CPU:-2}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"
MIN_INSTANCES="${MIN_INSTANCES:-1}"
CONCURRENCY="${CONCURRENCY:-100}"
TIMEOUT="${TIMEOUT:-300s}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        error "Google Cloud SDK (gcloud) is not installed. Please install it first."
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> //null; then
        error "Docker is not installed. Please install it first."
    fi
    
    # Check if user is authenticated with gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "Not authenticated with Google Cloud. Run 'gcloud auth login' first."
    fi
    
    # Check if project is set
    if ! gcloud config get-value project &> /dev/null; then
        error "No Google Cloud project set. Run 'gcloud config set project PROJECT_ID' first."
    fi
    
    success "Prerequisites check passed"
}

# Enable required APIs
enable_apis() {
    log "Enabling required Google Cloud APIs..."
    
    gcloud services enable \
        run.googleapis.com \
        containerregistry.googleapis.com \
        cloudbuild.googleapis.com \
        secretmanager.googleapis.com \
        firestore.googleapis.com \
        redis.googleapis.com \
        monitoring.googleapis.com \
        logging.googleapis.com \
        cloudkms.googleapis.com \
        --project="${PROJECT_ID}"
    
    success "Required APIs enabled"
}

# Build and push Docker image
build_and_push() {
    log "Building Docker image..."
    
    # Build the image
    docker build -t "${IMAGE_NAME}:latest" -t "${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" .
    
    # Configure Docker for GCR
    gcloud auth configure-docker
    
    # Push the image
    docker push "${IMAGE_NAME}:latest"
    docker push "${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)"
    
    success "Docker image built and pushed successfully"
}

# Create environment secrets
create_secrets() {
    log "Creating environment secrets..."
    
    # Create secrets if they don't exist
    secrets=(
        "jwt-secret:your_jwt_secret_key_here"
        "mongo-password:secure_mongodb_password_here"
        "redis-password:secure_redis_password_here"
        "email-password:your_email_password_here"
        "stripe-secret:your_stripe_secret_key_here"
        "paypal-secret:your_paypal_secret_here"
        "twilio-auth:your_twilio_auth_token_here"
    )
    
    for secret in "${secrets[@]}"; do
        IFS=':' read -r name value <<< "$secret"
        if ! gcloud secrets describe "${name}" --project="${PROJECT_ID}" &> /dev/null; then
            echo -n "${value}" | gcloud secrets create "${name}" --data-file=- --project="${PROJECT_ID}"
            success "Created secret: ${name}"
        else
            warning "Secret ${name} already exists"
        fi
    done
    
    success "Environment secrets created"
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    log "Deploying to Google Cloud Run..."
    
    # Deploy the service
    gcloud run deploy "${SERVICE_NAME}" \
        --image="${IMAGE_NAME}:latest" \
        --platform=managed \
        --region="${REGION}" \
        --project="${PROJECT_ID}" \
        --memory="${MEMORY}" \
        --cpu="${CPU}" \
        --max-instances="${MAX_INSTANCES}" \
        --min-instances="${MIN_INSTANCES}" \
        --concurrency="${CONCURRENCY}" \
        --timeout="${TIMEOUT}" \
        --allow-unauthenticated \
        --port=3000 \
        --set-env-vars="NODE_ENV=production" \
        --set-env-vars="PORT=3000" \
        --set-env-vars="MONGODB_URI=projects/${PROJECT_ID}/secrets/mongo-connection-string/versions/latest" \
        --set-env-vars="REDIS_URL=projects/${PROJECT_ID}/secrets/redis-connection-string/versions/latest" \
        --set-env-vars="JWT_SECRET=projects/${PROJECT_ID}/secrets/jwt-secret/versions/latest" \
        --set-env-vars="EMAIL_HOST=smtp.gmail.com" \
        --set-env-vars="EMAIL_PORT=587" \
        --set-env-vars="EMAIL_USER=projects/${PROJECT_ID}/secrets/email-user/versions/latest" \
        --set-env-vars="EMAIL_PASS=projects/${PROJECT_ID}/secrets/email-password/versions/latest" \
        --set-env-vars="SENTRY_DSN=projects/${PROJECT_ID}/secrets/sentry-dsn/versions/latest" \
        --set-env-vars="STRIPE_SECRET_KEY=projects/${PROJECT_ID}/secrets/stripe-secret/versions/latest" \
        --set-env-vars="PAYPAL_CLIENT_SECRET=projects/${PROJECT_ID}/secrets/paypal-secret/versions/latest" \
        --set-env-vars="TWILIO_AUTH_TOKEN=projects/${PROJECT_ID}/secrets/twilio-auth/versions/latest" \
        --set-env-vars="BLOCKCHAIN_ENABLED=true" \
        --set-env-vars="PRIVACY_MODE=gdpr-plus" \
        --set-env-vars="QUANTUM_SECURITY=enabled" \
        --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID}" \
        --set-env-vars="GCP_REGION=${REGION}" \
        --vpc-connector="piper-vpc-connector" \
        --vpc-egress="private-ranges-only" \
        --ingress="all" \
        --service-account="piper-newsletter-sa@${PROJECT_ID}.iam.gserviceaccount.com"
    
    success "Application deployed to Google Cloud Run"
}

# Setup monitoring and logging
setup_monitoring() {
    log "Setting up monitoring and logging..."
    
    # Create custom metrics
    gcloud monitoring dashboards create \
        --config-from-file=monitoring/dashboard-config.json \
        --project="${PROJECT_ID}" || warning "Dashboard creation failed or Already exists"
    
    # Create alerting policies
    gcloud alpha monitoring policies create \
        --policy-from-file=monitoring/alerting-policies.json \
        --project="${PROJECT_ID}" || warning "Alerting policies creation failed or already exists"
    
    success "Monitoring and logging setup complete"
}

# Setup load balancing and CDN
setup_load_balancing() {
    log "Setting up load balancing and CDN..."
    
    # Create backend service
    gcloud compute backend-services create "${SERVICE_NAME}-backend" \
        --protocol=HTTP \
        --port-name=http \
        --health-checks="${SERVICE_NAME}-health-check" \
        --project="${PROJECT_ID}" \
        --global || warning "Backend service already exists"
    
    # Create URL map
    gcloud compute url-maps create "${SERVICE_NAME}-url-map" \
        --default-service="${SERVICE_NAME}-backend" \
        --project="${PROJECT_ID}" \
        --global || warning "URL map already exists"
    
    # Create SSL certificate
    gcloud compute ssl-certificates create "${SERVICE_NAME}-ssl-cert" \
        --domains="${DOMAIN_NAME:-piper-newsletter.com}" \
        --project="${PROJECT_ID}" \
        --global || warning "SSL certificate already exists"
    
    # Create HTTPS proxy
    gcloud compute target-https-proxies create "${SERVICE_NAME}-https-proxy" \
        --url-map="${SERVICE_NAME}-url-map" \
        --ssl-certificates="${SERVICE_NAME}-ssl-cert" \
        --project="${PROJECT_ID}" || warning "HTTPS proxy already exists"
    
    success "Load balancing and CDN setup complete"
}

# Post-deployment verification
verify_deployment() {
    log "Verifying deployment..."
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
        --platform=managed \
        --region="${REGION}" \
        --project="${PROJECT_ID}" \
        --format="value(status.url)")
    
    log "Service URL: ${SERVICE_URL}"
    
    # Health check
    for i in {1..10}; do
        if curl -f "${SERVICE_URL}/api/health" &> /dev/null; then
            success "Health check passed"
            break
        fi
        warning "Health check attempt $i failed, retrying in 30 seconds..."
        sleep 30
    done
    
    # Performance test
    log "Running performance test..."
    if command -v artillery &> /dev/null; then
        artillery quick --count 50 --num 10 "${SERVICE_URL}/api/health" || warning "Performance test failed"
    fi
    
    success "Deployment verification complete"
}

# Main deployment function
main() {
    log "Starting Super Size Piper Newsletter deployment to Google Cloud Run..."
    
    check_prerequisites
    enable_apis
    create_secrets
    build_and_push
    deploy_to_cloud_run
    setup_monitoring
    setup_load_balancing
    verify_deployment
    
    SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
        --platform=managed \
        --region="${REGION}" \
        --project="${PROJECT_ID}" \
        --format="value(status.url)")
    
    success "🎉 Super Size Piper Newsletter successfully deployed!"
    log "Service URL: ${SERVICE_URL}"
    log "Grafana Dashboard: https://console.cloud.google.com/monitoring"
    log "Logs: https://console.cloud.google.com/logs"
    log "Service: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "build")
        build_and_push
        ;;
    "verify")
        verify_deployment
        ;;
    "monitoring")
        setup_monitoring
        ;;
    "load-balancer")
        setup_load_balancing
        ;;
    "secrets")
        create_secrets
        ;;
    "help"|"-h"|"--help")
        echo "Super Size Piper Newsletter - Google Cloud Run Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy         Full deployment (default)"
        echo "  build          Build and push Docker image"
        echo "  verify         Verify deployment"
        echo "  monitoring     Setup monitoring and logging"
        echo "  load-balancer  Setup load balancing and CDN"
        echo "  secrets        Create environment secrets"
        echo "  help           Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  GCP_PROJECT_ID         Google Cloud Project ID"
        echo "  GCP_REGION             Google Cloud Region"
        echo "  SERVICE_NAME           Cloud Run service name"
        echo "  MEMORY                 Memory allocation (default: 2Gi)"
        echo "  CPU                    CPU allocation (default: 2)"
        echo "  MAX_INSTANCES          Maximum instances (default: 10)"
        echo "  MIN_INSTANCES          Minimum instances (default: 1)"
        ;;
    *)
        error "Unknown command: $1. Use 'help' for usage information."
        ;;
esac