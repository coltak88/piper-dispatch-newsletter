#!/bin/bash

# Piper Newsletter System - GCP Environment Setup Script
# Sets up Google Cloud Platform environment for Cloud Run deployment

set -euo pipefail

# Configuration
PROJECT_ID="sarvajaya-genesis-protocol"
REGION="us-central1"
SERVICE_NAME="piper-dispatch-main"
SERVICE_ACCOUNT_NAME="piper-newsletter-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI is not installed"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "Not authenticated with gcloud. Run 'gcloud auth login'"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Enable required APIs
enable_apis() {
    log "Enabling required Google Cloud APIs..."
    
    # Cloud Run API
    gcloud services enable run.googleapis.com
    
    # Cloud Build API
    gcloud services enable cloudbuild.googleapis.com
    
    # Container Registry API
    gcloud services enable containerregistry.googleapis.com
    
    # Secret Manager API
    gcloud services enable secretmanager.googleapis.com
    
    # Cloud SQL API (if using Cloud SQL)
    gcloud services enable sqladmin.googleapis.com
    
    # Cloud Monitoring API
    gcloud services enable monitoring.googleapis.com
    
    # Cloud Logging API
    gcloud services enable logging.googleapis.com
    
    # Cloud Trace API
    gcloud services enable cloudtrace.googleapis.com
    
    # Cloud Profiler API
    gcloud services enable cloudprofiler.googleapis.com
    
    # Cloud Debugger API
    gcloud services enable clouddebugger.googleapis.com
    
    success "Required APIs enabled"
}

# Create service account
create_service_account() {
    log "Creating service account..."
    
    # Check if service account exists
    if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" 2>/dev/null; then
        warning "Service account already exists: $SERVICE_ACCOUNT_EMAIL"
    else
        # Create service account
        gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
            --display-name="Piper Newsletter Service Account" \
            --description="Service account for Piper Newsletter System Cloud Run service"
        
        success "Service account created: $SERVICE_ACCOUNT_EMAIL"
    fi
}

# Grant service account permissions
grant_permissions() {
    log "Granting service account permissions..."
    
    # Cloud Run permissions
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/run.serviceAgent"
    
    # Cloud SQL permissions (if using Cloud SQL)
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/cloudsql.client"
    
    # Secret Manager permissions
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/secretmanager.secretAccessor"
    
    # Cloud Storage permissions (for file uploads)
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/storage.objectAdmin"
    
    # Cloud Logging permissions
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/logging.logWriter"
    
    # Cloud Monitoring permissions
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/monitoring.metricWriter"
    
    success "Service account permissions granted"
}

# Create secrets
create_secrets() {
    log "Creating secrets in Secret Manager..."
    
    # Function to create or update secret
    create_or_update_secret() {
        local secret_name=$1
        local secret_value=$2
        local description=$3
        
        if gcloud secrets describe "$secret_name" 2>/dev/null; then
            warning "Secret already exists: $secret_name"
            read -p "Update existing secret? (y/N): " update_secret
            if [[ "$update_secret" =~ ^[Yy]$ ]]; then
                echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=-
                success "Secret updated: $secret_name"
            fi
        else
            echo -n "$secret_value" | gcloud secrets create "$secret_name" --data-file=-
            success "Secret created: $secret_name"
        fi
    }
    
    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 32)
    create_or_update_secret "JWT_SECRET" "$JWT_SECRET" "JWT secret for authentication"
    
    # Database URL (update with your actual database URL)
    read -p "Enter MongoDB URI (or press Enter to skip): " mongodb_uri
    if [[ -n "$mongodb_uri" ]]; then
        create_or_update_secret "MONGODB_URI" "$mongodb_uri" "MongoDB connection string"
    fi
    
    # Redis URL (update with your actual Redis URL)
    read -p "Enter Redis URL (or press Enter to skip): " redis_url
    if [[ -n "$redis_url" ]]; then
        create_or_update_secret "REDIS_URL" "$redis_url" "Redis connection string"
    fi
    
    # Database URL (PostgreSQL)
    read -p "Enter PostgreSQL DATABASE_URL (or press Enter to skip): " database_url
    if [[ -n "$database_url" ]]; then
        create_or_update_secret "DATABASE_URL" "$database_url" "PostgreSQL connection string"
    fi
    
    # SendGrid API Key
    read -p "Enter SendGrid API Key (or press Enter to skip): " sendgrid_key
    if [[ -n "$sendgrid_key" ]]; then
        create_or_update_secret "SENDGRID_API_KEY" "$sendgrid_key" "SendGrid API key for email delivery"
    fi
    
    # Stripe Secret Key
    read -p "Enter Stripe Secret Key (or press Enter to skip): " stripe_key
    if [[ -n "$stripe_key" ]]; then
        create_or_update_secret "STRIPE_SECRET_KEY" "$stripe_key" "Stripe secret key for payments"
    fi
    
    # Sentry DSN
    read -p "Enter Sentry DSN (or press Enter to skip): " sentry_dsn
    if [[ -n "$sentry_dsn" ]]; then
        create_or_update_secret "SENTRY_DSN" "$sentry_dsn" "Sentry DSN for error tracking"
    fi
}

# Create Cloud SQL instance (optional)
create_cloud_sql() {
    log "Creating Cloud SQL instance..."
    
    INSTANCE_NAME="piper-newsletter-db"
    
    if gcloud sql instances describe "$INSTANCE_NAME" 2>/dev/null; then
        warning "Cloud SQL instance already exists: $INSTANCE_NAME"
    else
        # Create PostgreSQL instance
        gcloud sql instances create "$INSTANCE_NAME" \
            --database-version=POSTGRES_13 \
            --tier=db-f1-micro \
            --region="$REGION" \
            --storage-size=10GB \
            --storage-type=SSD \
            --backup-start-time=02:00 \
            --maintenance-window-day=SUN \
            --maintenance-window-hour=04 \
            --availability-type=zonal \
            --storage-auto-increase
        
        success "Cloud SQL instance created: $INSTANCE_NAME"
        
        # Create database
        gcloud sql databases create piper_newsletter --instance="$INSTANCE_NAME"
        success "Database created: piper_newsletter"
        
        # Create user
        DB_PASSWORD=$(openssl rand -base64 16)
        gcloud sql users create piper_user --instance="$INSTANCE_NAME" --password="$DB_PASSWORD"
        success "Database user created: piper_user"
        
        # Store database connection info
        echo "Database Instance: $INSTANCE_NAME"
        echo "Database Name: piper_newsletter"
        echo "Database User: piper_user"
        echo "Database Password: $DB_PASSWORD"
        echo "Connection String: postgresql://piper_user:$DB_PASSWORD@//$INSTANCE_NAME/piper_newsletter"
    fi
}

# Create Cloud Storage bucket
create_storage_bucket() {
    log "Creating Cloud Storage bucket..."
    
    BUCKET_NAME="${PROJECT_ID}-piper-newsletter-assets"
    
    if gsutil ls -b "gs://$BUCKET_NAME" 2>/dev/null; then
        warning "Storage bucket already exists: $BUCKET_NAME"
    else
        # Create bucket with uniform bucket-level access
        gsutil mb -p "$PROJECT_ID" -c "standard" -l "$REGION" -b on "gs://$BUCKET_NAME"
        
        # Set lifecycle rule for old files
        cat > lifecycle.json << EOF
{
    "rule": [
        {
            "action": {
                "type": "Delete"
            },
            "condition": {
                "age": 365
            }
        }
    ]
}
EOF
        
        gsutil lifecycle set lifecycle.json "gs://$BUCKET_NAME"
        rm lifecycle.json
        
        success "Storage bucket created: $BUCKET_NAME"
    fi
}

# Setup monitoring and alerting
setup_monitoring() {
    log "Setting up monitoring and alerting..."
    
    # Create uptime check
    gcloud alpha monitoring uptime create piper-newsletter-uptime \
        --display-name="Piper Newsletter Service Uptime" \
        --uri="https://${SERVICE_NAME}-${PROJECT_ID}.cloudrun.app/health" \
        --content-type="json" \
        --expected-response="{\"status\":\"healthy\"}"
    
    # Create alert policy for high error rate
    cat > alert-policy.json << EOF
{
    "displayName": "High Error Rate",
    "conditions": [
        {
            "displayName": "Error rate above 5%",
            "conditionThreshold": {
                "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${SERVICE_NAME}\"",
                "metricName": "run.googleapis.com/request_count",
                "thresholdValue": 5,
                "comparison": "COMPARISON_GT",
                "duration": "300s",
                "aggregations": [
                    {
                        "alignmentPeriod": "300s",
                        "perSeriesAligner": "ALIGN_RATE",
                        "crossSeriesReducer": "REDUCE_SUM"
                    }
                ]
            }
        }
    ],
    "notificationChannels": [],
    "alertStrategy": {
        "autoClose": "1800s"
    }
}
EOF
    
    gcloud alpha monitoring policies create --policy-from-file=alert-policy.json
    rm alert-policy.json
    
    success "Monitoring and alerting configured"
}

# Create deployment configuration
create_deployment_config() {
    log "Creating deployment configuration..."
    
    cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=${PROJECT_ID}
GOOGLE_CLOUD_REGION=${REGION}

# Service Configuration
SERVICE_NAME=${SERVICE_NAME}
SERVICE_ACCOUNT=${SERVICE_ACCOUNT_EMAIL}

# Security Configuration
CORS_ORIGIN=https://${SERVICE_NAME}-${PROJECT_ID}.cloudrun.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
STATIC_DIR=/app/public

# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32)
SESSION_TIMEOUT=86400000

# Email Configuration
EMAIL_FROM=noreply@pipernewsletter.com
EMAIL_FROM_NAME=Piper Newsletter

# Analytics Configuration
ENABLE_ANALYTICS=true
ANALYTICS_BATCH_SIZE=100

# Performance Configuration
CACHE_TTL=3600
DB_POOL_SIZE=20
DB_POOL_TIMEOUT=30000

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090
EOF
    
    success "Deployment configuration created: .env.production"
}

# Main setup function
main() {
    log "Starting GCP environment setup for Piper Newsletter System"
    log "Project: $PROJECT_ID"
    log "Region: $REGION"
    log "Service: $SERVICE_NAME"
    
    # Execute setup steps
    check_prerequisites
    enable_apis
    create_service_account
    grant_permissions
    create_secrets
    
    # Optional services
    read -p "Create Cloud SQL instance? (y/N): " create_sql
    if [[ "$create_sql" =~ ^[Yy]$ ]]; then
        create_cloud_sql
    fi
    
    create_storage_bucket
    setup_monitoring
    create_deployment_config
    
    success "GCP environment setup completed successfully!"
    log "Next steps:"
    log "1. Update your environment variables in .env.production"
    log "2. Run: ./scripts/deploy-to-cloud-run.sh"
    log "3. Monitor deployment at: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/revisions"
}

# Command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-sql)
            SKIP_SQL=true
            shift
            ;;
        --skip-monitoring)
            SKIP_MONITORING=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --skip-sql        Skip Cloud SQL setup"
            echo "  --skip-monitoring Skip monitoring setup"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"