# Piper Newsletter System - Deployment Checklist

## Pre-Deployment Requirements

### ✅ Environment Setup
- [ ] Google Cloud Project configured
- [ ] Service account created with proper permissions
- [ ] Required APIs enabled
- [ ] Secrets configured in Secret Manager
- [ ] GitHub repository secrets configured
- [ ] Docker environment ready

### ✅ Code Quality
- [ ] All tests passing
- [ ] Code linting successful
- [ ] Security scans passed
- [ ] Performance tests completed
- [ ] Documentation updated

### ✅ Database Preparation
- [ ] Database migrations executed
- [ ] Seed data loaded
- [ ] Database backup created
- [ ] Connection strings verified

## Deployment Steps

### 1. Git Repository Setup
```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Google Cloud Platform Setup
```bash
# Run the GCP environment setup script
./scripts/setup-gcp-environment.sh

# Verify setup
gcloud config list
gcloud projects describe sarvajaya-genesis-protocol
```

### 3. GitHub Actions Configuration
```bash
# Setup GitHub Actions workflows and secrets
./scripts/github-actions-setup.sh

# Verify secrets are configured
gh secret list --repo sarvajaya-genesis-protocol/piper-dispatch-main
```

### 4. Build and Test
```bash
# Install dependencies
npm ci

# Run all tests
npm run test:all

# Build application
npm run build

# Run security audit
npm audit --audit-level=high
```

### 5. Docker Build Test
```bash
# Test Docker build locally
docker build -t piper-newsletter:test .

# Test container locally
docker run -p 8080:8080 piper-newsletter:test

# Verify health endpoint
curl http://localhost:8080/health
```

### 6. Database Migration
```bash
# Run database migrations
npm run migrate:prod

# Verify migrations
npm run migrate:status
```

### 7. Deploy to Cloud Run
```bash
# Deploy to staging first
./scripts/deploy-to-cloud-run.sh --skip-tests

# Verify staging deployment
curl https://piper-dispatch-main-sarvajaya-genesis-protocol.cloudrun.app/health

# Run staging tests
npm run test:e2e:staging

# Deploy to production
./scripts/deploy-to-cloud-run.sh --force
```

### 8. Post-Deployment Verification

#### Health Checks
- [ ] Application health endpoint responding
- [ ] Database connections working
- [ ] Redis cache accessible
- [ ] Email service functional
- [ ] Payment processing operational

#### Performance Verification
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query performance acceptable
- [ ] Memory usage within limits
- [ ] CPU utilization normal

#### Security Verification
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Authentication working
- [ ] Authorization checks passing

#### Feature Testing
- [ ] Newsletter creation and sending
- [ ] Subscription management
- [ ] User authentication
- [ ] Analytics tracking
- [ ] GDPR compliance features

## Monitoring and Alerting

### Application Monitoring
- [ ] Cloud Monitoring dashboards created
- [ ] Alert policies configured
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring active
- [ ] Uptime checks configured

### Infrastructure Monitoring
- [ ] Cloud Run metrics visible
- [ ] Database performance monitored
- [ ] Redis cache metrics tracked
- [ ] Storage usage monitored
- [ ] Network traffic analyzed

## Rollback Procedure

### Automatic Rollback Triggers
- Health check failures
- Error rate > 5%
- Response time > 5 seconds
- Memory usage > 80%
- CPU usage > 90%

### Manual Rollback Steps
```bash
# Get previous revision
PREVIOUS_REVISION=$(gcloud run services describe piper-dispatch-main \
  --region=us-central1 \
  --format="value(status.traffic[1].revisionName)")

# Rollback to previous revision
gcloud run services update-traffic piper-dispatch-main \
  --to-revisions "$PREVIOUS_REVISION"=100 \
  --region=us-central1

# Verify rollback
curl https://piper-dispatch-main-sarvajaya-genesis-protocol.cloudrun.app/health
```

## Post-Deployment Tasks

### Documentation Updates
- [ ] Update deployment documentation
- [ ] Update API documentation
- [ ] Update user guides
- [ ] Update troubleshooting guides

### Team Communication
- [ ] Notify team of deployment
- [ ] Update status page
- [ ] Send deployment summary
- [ ] Schedule post-deployment review

### Performance Optimization
- [ ] Analyze performance metrics
- [ ] Identify optimization opportunities
- [ ] Plan performance improvements
- [ ] Schedule follow-up optimizations

## Emergency Contacts

### Technical Team
- Primary: Technical Lead
- Secondary: DevOps Engineer
- Escalation: Engineering Manager

### Support Team
- Customer Support: support@pipernewsletter.com
- Technical Support: tech@pipernewsletter.com
- Emergency: emergency@pipernewsletter.com

## Troubleshooting

### Common Issues
1. **Deployment Fails**: Check build logs and service account permissions
2. **Health Check Fails**: Verify application startup and dependencies
3. **Database Connection Issues**: Check connection strings and network access
4. **Performance Issues**: Review resource allocation and optimization
5. **Security Issues**: Verify security headers and authentication

### Debug Commands
```bash
# View Cloud Run logs
gcloud logging read "resource.type=\"cloud_run_revision\" \
  resource.labels.service_name=\"piper-dispatch-main\"\" \
  --limit=50 --format="table(timestamp, textPayload)"

# Check service status
gcloud run services describe piper-dispatch-main \
  --region=us-central1

# View recent deployments
gcloud run revisions list --service=piper-dispatch-main \
  --region=us-central1
```

## Success Criteria

### Deployment Success
- [ ] All health checks passing
- [ ] Zero critical errors
- [ ] Performance metrics within targets
- [ ] Security scans clean
- [ ] User acceptance testing passed

### Business Success
- [ ] Newsletter system operational
- [ ] Users can subscribe/unsubscribe
- [ ] Analytics tracking working
- [ ] GDPR compliance verified
- [ ] Customer feedback positive

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Approved By**: ___________  
**Status**: ___________