#!/bin/bash

# Piper Newsletter System - GitHub Actions Setup Script
# Sets up GitHub Actions workflows and secrets for automated deployment

set -euo pipefail

# Configuration
GITHUB_REPO="sarvajaya-genesis-protocol/piper-dispatch-main"
PROJECT_ID="sarvajaya-genesis-protocol"
REGION="us-central1"
SERVICE_NAME="piper-dispatch-main"
SERVICE_ACCOUNT_EMAIL="piper-newsletter-sa@${PROJECT_ID}.iam.gserviceaccount.com"

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
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is not installed"
        echo "Install from: https://cli.github.com/"
        exit 1
    fi
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI is not installed"
        exit 1
    fi
    
    # Check if user is authenticated with GitHub
    if ! gh auth status 2>/dev/null; then
        error "Not authenticated with GitHub. Run 'gh auth login'"
        exit 1
    fi
    
    # Check if user is authenticated with gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "Not authenticated with gcloud. Run 'gcloud auth login'"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create GitHub secrets
create_github_secrets() {
    log "Creating GitHub secrets..."
    
    # Function to create or update secret
    create_or_update_secret() {
        local secret_name=$1
        local secret_value=$2
        
        if gh secret list --repo "$GITHUB_REPO" | grep -q "^$secret_name\s"; then
            warning "Secret already exists: $secret_name"
            read -p "Update existing secret? (y/N): " update_secret
            if [[ "$update_secret" =~ ^[Yy]$ ]]; then
                echo -n "$secret_value" | gh secret set "$secret_name" --repo "$GITHUB_REPO"
                success "Secret updated: $secret_name"
            fi
        else
            echo -n "$secret_value" | gh secret set "$secret_name" --repo "$GITHUB_REPO"
            success "Secret created: $secret_name"
        fi
    }
    
    # Google Cloud Service Account Key
    log "Creating service account key..."
    gcloud iam service-accounts keys create /tmp/service-account-key.json \
        --iam-account="$SERVICE_ACCOUNT_EMAIL" \
        --project="$PROJECT_ID" || {
        error "Failed to create service account key"
        exit 1
    }
    
    # Convert to base64 for GitHub secret
    GCP_SA_KEY=$(base64 -w 0 /tmp/service-account-key.json)
    rm /tmp/service-account-key.json
    
    create_or_update_secret "GCP_SA_KEY" "$GCP_SA_KEY"
    
    # Project configuration
    create_or_update_secret "GCP_PROJECT_ID" "$PROJECT_ID"
    create_or_update_secret "GCP_REGION" "$REGION"
    create_or_update_secret "GCP_SERVICE_NAME" "$SERVICE_NAME"
    
    # Application secrets (from Google Secret Manager)
    log "Retrieving application secrets from Google Secret Manager..."
    
    # JWT Secret
    if gcloud secrets describe JWT_SECRET --project="$PROJECT_ID" 2>/dev/null; then
        JWT_SECRET=$(gcloud secrets versions access latest --secret=JWT_SECRET --project="$PROJECT_ID")
        create_or_update_secret "JWT_SECRET" "$JWT_SECRET"
    fi
    
    # Database URL
    if gcloud secrets describe DATABASE_URL --project="$PROJECT_ID" 2>/dev/null; then
        DATABASE_URL=$(gcloud secrets versions access latest --secret=DATABASE_URL --project="$PROJECT_ID")
        create_or_update_secret "DATABASE_URL" "$DATABASE_URL"
    fi
    
    # MongoDB URI
    if gcloud secrets describe MONGODB_URI --project="$PROJECT_ID" 2>/dev/null; then
        MONGODB_URI=$(gcloud secrets versions access latest --secret=MONGODB_URI --project="$PROJECT_ID")
        create_or_update_secret "MONGODB_URI" "$MONGODB_URI"
    fi
    
    # Redis URL
    if gcloud secrets describe REDIS_URL --project="$PROJECT_ID" 2>/dev/null; then
        REDIS_URL=$(gcloud secrets versions access latest --secret=REDIS_URL --project="$PROJECT_ID")
        create_or_update_secret "REDIS_URL" "$REDIS_URL"
    fi
    
    # SendGrid API Key
    if gcloud secrets describe SENDGRID_API_KEY --project="$PROJECT_ID" 2>/dev/null; then
        SENDGRID_API_KEY=$(gcloud secrets versions access latest --secret=SENDGRID_API_KEY --project="$PROJECT_ID")
        create_or_update_secret "SENDGRID_API_KEY" "$SENDGRID_API_KEY"
    fi
    
    # Stripe Secret Key
    if gcloud secrets describe STRIPE_SECRET_KEY --project="$PROJECT_ID" 2>/dev/null; then
        STRIPE_SECRET_KEY=$(gcloud secrets versions access latest --secret=STRIPE_SECRET_KEY --project="$PROJECT_ID")
        create_or_update_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
    fi
    
    # Sentry DSN
    if gcloud secrets describe SENTRY_DSN --project="$PROJECT_ID" 2>/dev/null; then
        SENTRY_DSN=$(gcloud secrets versions access latest --secret=SENTRY_DSN --project="$PROJECT_ID")
        create_or_update_secret "SENTRY_DSN" "$SENTRY_DSN"
    fi
    
    # Additional secrets
    create_or_update_secret "NODE_ENV" "production"
    create_or_update_secret "REACT_APP_BUILD_MODE" "production"
    
    success "GitHub secrets created successfully"
}

# Setup GitHub Actions workflows
setup_workflows() {
    log "Setting up GitHub Actions workflows..."
    
    # Create workflow directories
    mkdir -p .github/workflows
    
    # Create deployment workflow
    cat > .github/workflows/deploy-to-cloud-run.yml << 'EOF'
name: Deploy to Cloud Run

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      skip_tests:
        description: 'Skip tests'
        required: false
        default: false
        type: boolean

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: ${{ secrets.GCP_REGION }}
  SERVICE_NAME: ${{ secrets.GCP_SERVICE_NAME }}
  IMAGE_NAME: gcr.io/${{ secrets.GCP_PROJECT_ID }}/piper-newsletter

jobs:
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run security audit
        run: npm audit --audit-level=high
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true
        
      - name: Upload security results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: security-results
          path: |
            snyk-report.json
            npm-audit.json

  test-and-build:
    name: Test and Build
    runs-on: ubuntu-latest
    needs: security-scan
    if: github.event.inputs.skip_tests != 'true'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run type check
        run: npm run type-check
        
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
          
      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          REACT_APP_BUILD_MODE: production
          
      - name: Check bundle size
        run: npm run analyze-bundle
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            build/
            dist/
            package.json

  deploy:
    name: Deploy to Cloud Run
    runs-on: ubuntu-latest
    needs: [security-scan, test-and-build]
    if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'
    
    environment: 
      name: ${{ github.event.inputs.environment || 'staging' }}
      url: ${{ steps.deploy.outputs.url }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          
      - name: Configure Docker for GCR
        run: gcloud auth configure-docker
        
      - name: Build Docker image
        run: |
          docker build -t ${{ env.IMAGE_NAME }}:${{ github.sha }} .
          docker tag ${{ env.IMAGE_NAME }}:${{ github.sha }} ${{ env.IMAGE_NAME }}:latest
          
      - name: Push Docker image
        run: |
          docker push ${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker push ${{ env.IMAGE_NAME }}:latest
          
      - name: Deploy to Cloud Run
        id: deploy
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image ${{ env.IMAGE_NAME }}:${{ github.sha }} \
            --platform managed \
            --region ${{ env.REGION }} \
            --allow-unauthenticated \
            --memory "1Gi" \
            --cpu "1000m" \
            --max-instances "3" \
            --min-instances "0" \
            --timeout "300s" \
            --concurrency "1000" \
            --service-account ${{ env.SERVICE_ACCOUNT_EMAIL }} \
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
            --quiet
            
          # Get service URL
          SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region ${{ env.REGION }} \
            --format "value(status.url)")
          
          echo "url=$SERVICE_URL" >> $GITHUB_OUTPUT
          echo "Service deployed to: $SERVICE_URL"
          
      - name: Run health check
        run: |
          SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region ${{ env.REGION }} \
            --format "value(status.url)")
          
          # Wait for service to be ready
          sleep 30
          
          # Perform health check
          for i in {1..10}; do
            if curl -f "$SERVICE_URL/health" >/dev/null 2>&1; then
              echo "Health check passed!"
              exit 0
            fi
            echo "Health check attempt $i/10 failed, retrying in 10 seconds..."
            sleep 10
          done
          
          echo "Health check failed after 10 attempts"
          exit 1
          
      - name: Notify deployment success
        if: success()
        run: |
          echo "🚀 Deployment successful!"
          echo "Service URL: ${{ steps.deploy.outputs.url }}"
          echo "Environment: ${{ github.event.inputs.environment || 'staging' }}"
          
      - name: Notify deployment failure
        if: failure()
        run: |
          echo "❌ Deployment failed!"
          echo "Check the logs for more details"
EOF
    
    success "GitHub Actions workflows created"
}

# Setup branch protection
setup_branch_protection() {
    log "Setting up branch protection rules..."
    
    # Protect main branch
    gh api repos/$GITHUB_REPO/branches/main/protection \
        --method PUT \
        --input - <<< '{
            "required_status_checks": {
                "strict": true,
                "contexts": [
                    "security-scan",
                    "test-and-build"
                ]
            },
            "enforce_admins": false,
            "required_pull_request_reviews": {
                "required_approving_review_count": 1,
                "dismiss_stale_reviews": true,
                "require_code_owner_reviews": true
            },
            "restrictions": null,
            "allow_force_pushes": false,
            "allow_deletions": false
        }' || {
        warning "Failed to set up branch protection for main branch"
    }
    
    # Protect develop branch
    gh api repos/$GITHUB_REPO/branches/develop/protection \
        --method PUT \
        --input - <<< '{
            "required_status_checks": {
                "strict": true,
                "contexts": [
                    "security-scan",
                    "test-and-build"
                ]
            },
            "enforce_admins": false,
            "required_pull_request_reviews": {
                "required_approving_review_count": 1,
                "dismiss_stale_reviews": true
            },
            "restrictions": null,
            "allow_force_pushes": false,
            "allow_deletions": false
        }' || {
        warning "Failed to set up branch protection for develop branch"
    }
    
    success "Branch protection rules configured"
}

# Setup GitHub environments
setup_environments() {
    log "Setting up GitHub environments..."
    
    # Create staging environment
    gh api repos/$GITHUB_REPO/environments \
        --method POST \
        --input - <<< '{
            "deployment_branch_policy": {
                "protected_branches": true,
                "custom_branch_policies": false
            },
            "reviewers": [
                {
                    "type": "User",
                    "id": 1
                }
            ]
        }' || {
        warning "Failed to create staging environment"
    }
    
    # Create production environment
    gh api repos/$GITHUB_REPO/environments/production \
        --method POST \
        --input - <<< '{
            "deployment_branch_policy": {
                "protected_branches": true,
                "custom_branch_policies": false
            },
            "reviewers": [
                {
                    "type": "User",
                    "id": 1
                }
            ]
        }' || {
        warning "Failed to create production environment"
    }
    
    success "GitHub environments configured"
}

# Main setup function
main() {
    log "Starting GitHub Actions setup for Piper Newsletter System"
    log "Repository: $GITHUB_REPO"
    log "Project: $PROJECT_ID"
    
    # Execute setup steps
    check_prerequisites
    create_github_secrets
    setup_workflows
    setup_branch_protection
    setup_environments
    
    success "GitHub Actions setup completed successfully!"
    log "Next steps:"
    log "1. Commit and push the new workflow files"
    log "2. Test the deployment by pushing to main branch"
    log "3. Monitor deployments at: https://github.com/$GITHUB_REPO/actions"
}

# Command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-branch-protection)
            SKIP_BRANCH_PROTECTION=true
            shift
            ;;
        --skip-environments)
            SKIP_ENVIRONMENTS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --skip-branch-protection  Skip branch protection setup"
            echo "  --skip-environments       Skip environment setup"
            echo "  --help                    Show this help message"
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