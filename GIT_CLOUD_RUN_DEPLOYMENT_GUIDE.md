# Git and Cloud Run Deployment Procedure

## Overview
This guide provides a comprehensive procedure for setting up Git repository management and deploying the Piper Newsletter System to Google Cloud Run with automated CI/CD pipelines.

## Prerequisites

### Required Tools
- Git 2.30+
- Google Cloud SDK (gcloud)
- Docker 20.10+
- Node.js 18.x
- GitHub CLI (optional but recommended)

### Required Accounts
- GitHub account with repository access
- Google Cloud Platform account with billing enabled
- Docker Hub account (optional for container registry)

## Step 1: Git Repository Setup

### 1.1 Initialize Git Repository
```bash
# Navigate to project directory
cd c:\Users\Dell\piper_newsletter

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Piper Newsletter System with quantum security and GDPR-Plus compliance"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/piper-newsletter.git

# Push to main branch
git push -u origin main
```

### 1.2 Branch Strategy Setup
```bash
# Create development branch
git checkout -b develop
git push -u origin develop

# Create feature branch template
git checkout -b feature/initial-setup
git push -u origin feature/initial-setup

# Create release branch template
git checkout -b release/v1.0.0
git push -u origin release/v1.0.0
```

### 1.3 Git Configuration
```bash
# Configure git user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure git hooks
git config --global core.hooksPath .githooks

# Set up branch protection (requires GitHub CLI)
gh repo edit --enable-auto-merge --delete-branch-on-merge
```

## Step 2: Google Cloud Platform Setup

### 2.1 Install and Configure gcloud CLI
```bash
# Download and install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Set default project
gcloud config set project sarvajaya-genesis-protocol

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

### 2.2 Create Service Account
```bash
# Create service account
gcloud iam service-accounts create piper-newsletter-sa \
    --display-name="Piper Newsletter Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding sarvajaya-genesis-protocol \
    --member="serviceAccount:piper-newsletter-sa@sarvajaya-genesis-protocol.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding sarvajaya-genesis-protocol \
    --member="serviceAccount:piper-newsletter-sa@sarvajaya-genesis-protocol.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding sarvajaya-genesis-protocol \
    --member="serviceAccount:piper-newsletter-sa@sarvajaya-genesis-protocol.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding sarvajaya-genesis-protocol \
    --member="serviceAccount:piper-newsletter-sa@sarvajaya-genesis-protocol.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 2.3 Create Secrets in Secret Manager
```bash
# Create secrets for application
gcloud secrets create JWT_SECRET --data-file=<(echo "your-jwt-secret-key")
gcloud secrets create STRIPE_SECRET_KEY --data-file=<(echo "sk_live_your_stripe_key")
gcloud secrets create SENDGRID_API_KEY --data-file=<(echo "SG.your_sendgrid_key")
gcloud secrets create MONGODB_URI --data-file=<(echo "mongodb://your-connection-string")
gcloud secrets create REDIS_URL --data-file=<(echo "redis://your-redis-connection")
gcloud secrets create DATABASE_URL --data-file=<(echo "postgresql://your-postgres-connection")
gcloud secrets create SENTRY_DSN --data-file=<(echo "https://your-sentry-dsn")
```

## Step 3: Docker Configuration for Cloud Run

### 3.1 Build and Test Docker Image Locally
```bash
# Build Docker image
docker build -t piper-newsletter:latest .

# Run container locally for testing
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e JWT_SECRET=test-secret \
  -e PORT=8080 \
  piper-newsletter:latest

# Test health endpoint
curl http://localhost:8080/health
```

### 3.2 Push to Container Registry
```bash
# Configure Docker for Google Container Registry
gcloud auth configure-docker

# Tag image for GCR
docker tag piper-newsletter:latest gcr.io/sarvajaya-genesis-protocol/piper-newsletter:latest

# Push to GCR
docker push gcr.io/sarvajaya-genesis-protocol/piper-newsletter:latest
```

## Step 4: Cloud Run Deployment

### 4.1 Deploy to Cloud Run
```bash
# Deploy to Cloud Run
gcloud run deploy piper-dispatch-main \
    --image gcr.io/sarvajaya-genesis-protocol/piper-newsletter:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 3 \
    --min-instances 0 \
    --timeout 300s \
    --concurrency 1000 \
    --service-account piper-newsletter-sa@sarvajaya-genesis-protocol.iam.gserviceaccount.com \
    --set-secrets JWT_SECRET=JWT_SECRET:latest \
    --set-secrets STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest \
    --set-secrets SENDGRID_API_KEY=SENDGRID_API_KEY:latest \
    --set-secrets MONGODB_URI=MONGODB_URI:latest \
    --set-secrets REDIS_URL=REDIS_URL:latest \
    --set-secrets DATABASE_URL=DATABASE_URL:latest \
    --set-secrets SENTRY_DSN=SENTRY_DSN:latest \
    --set-env-vars NODE_ENV=production \
    --set-env-vars REACT_APP_BUILD_MODE=production \
    --set-env-vars REACT_APP_QUANTUM_SECURITY=enabled \
    --set-env-vars REACT_APP_PRIVACY_MODE=gdpr-plus
```

### 4.2 Set Up Custom Domain
```bash
# Map custom domain
gcloud run domain-mappings create \
    --service piper-dispatch-main \
    --domain newsletter.yourdomain.com \
    --region us-central1
```

### 4.3 Configure Load Balancer (Optional)
```bash
# Create backend service
gcloud compute backend-services create piper-newsletter-backend \
    --load-balancing-scheme=EXTERNAL \
    --protocol=HTTP \
    --global

# Create URL map
gcloud compute url-maps create piper-newsletter-url-map \
    --default-service piper-newsletter-backend

# Create target proxy
gcloud compute target-http-proxies create piper-newsletter-proxy \
    --url-map piper-newsletter-url-map

# Create forwarding rule
gcloud compute forwarding-rules create piper-newsletter-forwarding-rule \
    --global \
    --target-http-proxy piper-newsletter-proxy \
    --ports 80
```

## Step 5: GitHub Actions Configuration

### 5.1 Set GitHub Secrets
Navigate to GitHub repository settings → Secrets and variables → Actions, and add:

```yaml
# Required Secrets
GCP_PROJECT_ID: sarvajaya-genesis-protocol
GCP_SA_KEY: <base64-encoded-service-account-key>
GCP_REGION: us-central1
GCP_SERVICE_NAME: piper-dispatch-main

# Optional Secrets
DOCKER_USERNAME: <your-dockerhub-username>
DOCKER_PASSWORD: <your-dockerhub-password>
SNYK_TOKEN: <your-snyk-token>
SENTRY_AUTH_TOKEN: <your-sentry-token>
```

### 5.2 Configure Environment Variables
```bash
# Create .env.production file
cat > .env.production << EOF
NODE_ENV=production
REACT_APP_BUILD_MODE=production
REACT_APP_QUANTUM_SECURITY=enabled
REACT_APP_PRIVACY_MODE=gdpr-plus
REACT_APP_API_URL=https://your-cloud-run-url
REACT_APP_CDN_URL=https://your-cdn-url
EOF
```

## Step 6: Automated Deployment Process

### 6.1 Manual Deployment Trigger
```bash
# Trigger deployment manually
git tag v1.0.0
git push origin v1.0.0

# Or trigger via GitHub Actions
gh workflow run deploy.yml -f environment=production
```

### 6.2 Automated Deployment Flow
1. **Code Push** → GitHub
2. **GitHub Actions** → Runs CI/CD pipeline
3. **Security Scan** → Snyk, CodeQL, npm audit
4. **Testing** → Unit, integration, performance tests
5. **Build** → Docker image creation
6. **Push** → Container Registry
7. **Deploy** → Cloud Run service update
8. **Verify** → Health checks and monitoring

## Step 7: Monitoring and Logging

### 7.1 Set Up Cloud Monitoring
```bash
# Create alerting policy
gcloud alpha monitoring policies create \
    --policy-from-file=monitoring/alert-policy.yml

# Create uptime check
gcloud alpha monitoring uptime create \
    --display-name="Piper Newsletter Uptime" \
    --uri=https://your-cloud-run-url/health \
    --check-interval=60s
```

### 7.2 Configure Logging
```bash
# Create log sink for audit logs
gcloud logging sinks create piper-newsletter-audit \
    bigquery.googleapis.com/projects/sarvajaya-genesis-protocol/datasets/audit_logs \
    --log-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="piper-dispatch-main"'
```

## Step 8: Database Migration

### 8.1 Set Up Cloud SQL (PostgreSQL)
```bash
# Create Cloud SQL instance
gcloud sql instances create piper-newsletter-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-size=10GB \
    --storage-type=SSD \
    --backup-start-time=02:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04:00

# Create database
gcloud sql databases create piper_newsletter \
    --instance=piper-newsletter-db

# Create user
gcloud sql users create dbuser \
    --instance=piper-newsletter-db \
    --password=your-secure-password
```

### 8.2 Run Database Migrations
```bash
# Connect to Cloud SQL
gcloud sql connect piper-newsletter-db --user=dbuser

# Run migrations
psql -h <cloud-sql-ip> -U dbuser -d piper_newsletter < database/migrations/001_create_users_table.sql
psql -h <cloud-sql-ip> -U dbuser -d piper_newsletter < database/migrations/002_create_newsletters_table.sql
# ... run all migration files
```

## Step 9: Post-Deployment Verification

### 9.1 Health Check
```bash
# Test application health
curl -f https://your-cloud-run-url/health

# Test API endpoints
curl -f https://your-cloud-run-url/api/newsletters
curl -f https://your-cloud-run-url/api/subscriptions
```

### 9.2 Performance Verification
```bash
# Run performance tests
artillery run artillery/performance-test.yml --target https://your-cloud-run-url

# Check Cloud Run metrics
gcloud run services describe piper-dispatch-main --region=us-central1
```

## Step 10: Rollback Procedure

### 10.1 Quick Rollback
```bash
# Rollback to previous revision
gcloud run services update-traffic piper-dispatch-main \
    --to-revisions piper-dispatch-main-00002=100 \
    --region=us-central1
```

### 10.2 Database Rollback
```bash
# Restore from backup (if needed)
gcloud sql backups restore <backup-id> \
    --restore-instance=piper-newsletter-db \
    --backup-instance=piper-newsletter-db
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker logs: `docker logs <container-id>`
   - Verify environment variables
   - Check npm dependencies

2. **Deployment Failures**
   - Verify service account permissions
   - Check Cloud Run quotas
   - Review build logs in Cloud Build

3. **Runtime Issues**
   - Check application logs: `gcloud logging read "resource.type=\"cloud_run_revision\""`
   - Verify database connectivity
   - Check secret manager access

4. **Performance Issues**
   - Monitor Cloud Run metrics
   - Check database performance
   - Review CDN configuration

### Support Commands
```bash
# View Cloud Run logs
gcloud logging read "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"piper-dispatch-main\"" --limit 50

# Check service status
gcloud run services describe piper-dispatch-main --region=us-central1

# View recent deployments
gcloud run revisions list --service=piper-dispatch-main --region=us-central1

# Check service account permissions
gcloud iam service-accounts get-iam-policy piper-newsletter-sa@sarvajaya-genesis-protocol.iam.gserviceaccount.com
```

## Security Considerations

- All secrets are stored in Google Secret Manager
- Service accounts follow principle of least privilege
- Container images are scanned for vulnerabilities
- Network traffic is encrypted end-to-end
- Database connections use SSL/TLS
- Regular security audits are performed

## Cost Optimization

- Use Cloud Run's automatic scaling
- Implement caching strategies
- Optimize database queries
- Use appropriate instance sizes
- Monitor and analyze usage patterns
- Set up budget alerts

This deployment procedure ensures a secure, scalable, and maintainable deployment of the Piper Newsletter System to Google Cloud Run with comprehensive monitoring and rollback capabilities.