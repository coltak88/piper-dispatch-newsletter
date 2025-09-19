# Piper Newsletter Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Piper Newsletter system across different environments (development, staging, production) using various deployment methods.

## Deployment Options

### 1. Docker Compose (Recommended for Development)
- **Best for**: Local development, small teams
- **Pros**: Easy setup, consistent environment
- **Cons**: Limited scalability

### 2. Kubernetes (Recommended for Production)
- **Best for**: Production environments, high availability
- **Pros**: Scalable, resilient, cloud-native
- **Cons**: Complex setup, requires expertise

### 3. Cloud Platforms (AWS, Azure, GCP)
- **Best for**: Enterprise deployments
- **Pros**: Managed services, auto-scaling, global reach
- **Cons**: Vendor lock-in, cost considerations

## Prerequisites

### System Requirements
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **RAM**: Minimum 4GB, Recommended 8+ GB
- **Storage**: Minimum 50GB, Recommended 100+ GB SSD
- **Network**: 1Gbps connection, static IP recommended

### Software Requirements
- Docker 20.10+
- Docker Compose 1.29+
- Kubernetes 1.20+ (for K8s deployment)
- Git 2.30+
- Node.js 18+ (for local development)

### Domain Requirements
- Valid domain name (e.g., `pipernewsletter.com`)
- SSL/TLS certificate (Let's Encrypt recommended)
- DNS management access

## Environment Configuration

### 1. Environment Variables

Create environment-specific configuration files:

#### Development (.env.development)
```bash
# Application
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/piper_newsletter_dev
POSTGRES_URL=postgresql://piper:password@localhost:5432/piper_analytics_dev
REDIS_URL=redis://localhost:6379/0

# Security
JWT_SECRET=dev-jwt-secret-key-not-for-production
JWT_REFRESH_SECRET=dev-refresh-secret-key
ENCRYPTION_KEY=dev-encryption-key-32-chars-long

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dev@pipernewsletter.com
SMTP_PASS=dev-password

# Monitoring
SENTRY_DSN=
LOG_LEVEL=debug

# Development
DEBUG=true
CORS_ORIGIN=http://localhost:3000
```

#### Production (.env.production)
```bash
# Application
NODE_ENV=production
PORT=3001
API_URL=https://api.pipernewsletter.com
FRONTEND_URL=https://app.pipernewsletter.com

# Database (Use managed services)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/piper_newsletter
POSTGRES_URL=postgresql://user:pass@postgres.pipernewsletter.com:5432/piper_analytics
REDIS_URL=redis://redis.pipernewsletter.com:6379/0

# Security (Use strong, unique secrets)
JWT_SECRET=use-strong-jwt-secret-from-secrets-manager
JWT_REFRESH_SECRET=use-strong-refresh-secret-from-secrets-manager
ENCRYPTION_KEY=use-32-character-encryption-key-from-secrets-manager

# Email (Use professional email service)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sendgrid-api-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=info

# Security
CORS_ORIGIN=https://app.pipernewsletter.com
TRUST_PROXY=true
SECURE_COOKIES=true
```

### 2. SSL/TLS Configuration

#### Generate SSL Certificates (Let's Encrypt)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d api.pipernewsletter.com -d app.pipernewsletter.com

# Certificates will be saved to:
# /etc/letsencrypt/live/api.pipernewsletter.com/
# /etc/letsencrypt/live/app.pipernewsletter.com/
```

#### Create SSL Directory Structure
```bash
mkdir -p nginx/ssl/api.pipernewsletter.com
mkdir -p nginx/ssl/app.pipernewsletter.com
```

## Docker Compose Deployment

### 1. Development Environment

#### Start Development Environment
```bash
# Clone repository
git clone https://github.com/your-org/piper-newsletter.git
cd piper-newsletter

# Copy environment configuration
cp .env.development .env

# Start services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### Development Docker Compose File
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: piper-mongodb-dev
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: piper_newsletter_dev
    volumes:
      - mongodb_dev_data:/data/db
    networks:
      - piper-dev

  postgres:
    image: postgres:14
    container_name: piper-postgres-dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: piper_analytics_dev
      POSTGRES_USER: piper
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    networks:
      - piper-dev

  redis:
    image: redis:7-alpine
    container_name: piper-redis-dev
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_dev_data:/data
    networks:
      - piper-dev

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: piper-backend-dev
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
    env_file:
      - .env.development
    volumes:
      - ./src:/app/src
      - ./logs:/app/logs
    depends_on:
      - mongodb
      - postgres
      - redis
    networks:
      - piper-dev

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: piper-frontend-dev
    ports:
      - "3000:80"
    volumes:
      - ./frontend/src:/app/src
    networks:
      - piper-dev

volumes:
  mongodb_dev_data:
  postgres_dev_data:
  redis_dev_data:

networks:
  piper-dev:
    driver: bridge
```

### 2. Production Environment

#### Production Docker Compose File
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Database Services
  mongodb:
    image: mongo:5.0
    container_name: piper-mongodb-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASS}
      MONGO_INITDB_DATABASE: piper_newsletter
    volumes:
      - mongodb_prod_data:/data/db
      - ./backups/mongodb:/backups
    networks:
      - piper-prod
    healthcheck:
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:14
    container_name: piper-postgres-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: piper_analytics
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    networks:
      - piper-prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: piper-redis-prod
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_prod_data:/data
      - ./backups/redis:/backups
    networks:
      - piper-prod
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Application Services
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: piper-backend-prod
    restart: unless-stopped
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      mongodb:
        condition: service_healthy
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - piper-prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: piper-frontend-prod
    restart: unless-stopped
    networks:
      - piper-prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Load Balancer and SSL
  nginx:
    image: nginx:alpine
    container_name: piper-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - piper-prod

  # Monitoring Services
  prometheus:
    image: prom/prometheus:latest
    container_name: piper-prometheus-prod
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - piper-prod

  grafana:
    image: grafana/grafana:latest
    container_name: piper-grafana-prod
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    networks:
      - piper-prod

  # Log Management
  loki:
    image: grafana/loki:latest
    container_name: piper-loki-prod
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki.yml:/etc/loki/local-config.yaml:ro
      - loki_data:/loki
    networks:
      - piper-prod

  promtail:
    image: grafana/promtail:latest
    container_name: piper-promtail-prod
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/app:ro
      - ./monitoring/promtail.yml:/etc/promtail/config.yml:ro
    command: -config.file=/etc/promtail/config.yml
    networks:
      - piper-prod

volumes:
  mongodb_prod_data:
  postgres_prod_data:
  redis_prod_data:
  prometheus_data:
  grafana_data:
  loki_data:

networks:
  piper-prod:
    driver: bridge
```

#### Deploy Production Environment
```bash
# Copy production environment file
cp .env.production .env

# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Kubernetes Deployment

### 1. Prerequisites

#### Install Required Tools
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm (package manager)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Create Kubernetes Cluster
```bash
# Using managed services (recommended)
# AWS EKS, Google GKE, Azure AKS

# Or using Minikube for local testing
minikube start --cpus=4 --memory=8192 --disk-size=50g
```

### 2. Kubernetes Manifests

#### Namespace Configuration
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: piper-newsletter
  labels:
    name: piper-newsletter
```

#### ConfigMap for Environment Variables
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: piper-config
  namespace: piper-newsletter
data:
  NODE_ENV: "production"
  PORT: "3001"
  API_URL: "https://api.pipernewsletter.com"
  FRONTEND_URL: "https://app.pipernewsletter.com"
  MONGODB_URI: "mongodb://mongodb-service:27017/piper_newsletter"
  POSTGRES_URL: "postgresql://postgres-service:5432/piper_analytics"
  REDIS_URL: "redis://redis-service:6379/0"
  LOG_LEVEL: "info"
```

#### Secret for Sensitive Data
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: piper-secrets
  namespace: piper-newsletter
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  JWT_REFRESH_SECRET: <base64-encoded-secret>
  ENCRYPTION_KEY: <base64-encoded-key>
  SMTP_PASS: <base64-encoded-password>
  GRAFANA_PASSWORD: <base64-encoded-password>
```

#### MongoDB Deployment
```yaml
# k8s/mongodb-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: piper-newsletter
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:5.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            secretKeyRef:
              name: piper-secrets
              key: MONGO_ROOT_USER
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: piper-secrets
              key: MONGO_ROOT_PASS
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: mongodb-storage
        persistentVolumeClaim:
          claimName: mongodb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
  namespace: piper-newsletter
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: piper-newsletter
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

#### Backend Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: piper-backend
  namespace: piper-newsletter
spec:
  replicas: 3
  selector:
    matchLabels:
      app: piper-backend
  template:
    metadata:
      labels:
        app: piper-backend
    spec:
      containers:
      - name: backend
        image: your-registry/piper-newsletter-backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: piper-config
        - secretRef:
            name: piper-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: piper-newsletter
spec:
  selector:
    app: piper-backend
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

#### Frontend Deployment
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: piper-frontend
  namespace: piper-newsletter
spec:
  replicas: 2
  selector:
    matchLabels:
      app: piper-frontend
  template:
    metadata:
      labels:
        app: piper-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/piper-newsletter-frontend:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: piper-newsletter
spec:
  selector:
    app: piper-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

#### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: piper-ingress
  namespace: piper-newsletter
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.pipernewsletter.com
    - app.pipernewsletter.com
    secretName: piper-tls-secret
  rules:
  - host: api.pipernewsletter.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3001
  - host: app.pipernewsletter.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### 3. Deploy to Kubernetes

#### Apply Configurations
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy databases
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# Deploy applications
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

#### Verify Deployment
```bash
# Check pod status
kubectl get pods -n piper-newsletter

# Check service status
kubectl get services -n piper-newsletter

# Check ingress status
kubectl get ingress -n piper-newsletter

# View logs
kubectl logs -f deployment/piper-backend -n piper-newsletter
```

## Cloud Platform Deployment

### AWS Deployment

#### Using AWS ECS (Elastic Container Service)
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create ECS cluster
aws ecs create-cluster --cluster-name piper-newsletter

# Register task definitions
aws ecs register-task-definition --cli-input-json file://aws/backend-task.json
aws ecs register-task-definition --cli-input-json file://aws/frontend-task.json

# Create services
aws ecs create-service --cluster piper-newsletter --service-name piper-backend --task-definition piper-backend:1 --desired-count 3
aws ecs create-service --cluster piper-newsletter --service-name piper-frontend --task-definition piper-frontend:1 --desired-count 2
```

#### Using AWS EKS (Elastic Kubernetes Service)
```bash
# Install eksctl
brew install eksctl

# Create EKS cluster
eksctl create cluster --name piper-newsletter --region us-west-2 --nodegroup-name standard-workers --node-type t3.medium --nodes 3 --nodes-min 1 --nodes-max 4 --managed

# Deploy application
kubectl apply -f k8s/
```

### Google Cloud Platform (GCP)

#### Using Google Kubernetes Engine (GKE)
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Create GKE cluster
gcloud container clusters create piper-newsletter --zone us-central1-a --num-nodes 3 --machine-type n1-standard-2

# Get cluster credentials
gcloud container clusters get-credentials piper-newsletter --zone us-central1-a

# Deploy application
kubectl apply -f k8s/
```

### Microsoft Azure

#### Using Azure Kubernetes Service (AKS)
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Create AKS cluster
az aks create --resource-group piper-newsletter-rg --name piper-newsletter --node-count 3 --node-vm-size Standard_B2s --enable-addons monitoring --generate-ssh-keys

# Get cluster credentials
az aks get-credentials --resource-group piper-newsletter-rg --name piper-newsletter

# Deploy application
kubectl apply -f k8s/
```

## Post-Deployment Configuration

### 1. Database Setup

#### Run Migrations
```bash
# Connect to backend container
docker exec -it piper-backend-prod npm run migrate

# Or in Kubernetes
kubectl exec -it deployment/piper-backend -n piper-newsletter -- npm run migrate
```

#### Create Admin User
```bash
# Create admin user
docker exec -it piper-backend-prod npm run create-admin -- --email admin@pipernewsletter.com --password securePassword123
```

### 2. SSL/TLS Configuration

#### Update Nginx Configuration
```bash
# Update nginx.conf with SSL paths
sed -i 's|ssl_certificate .*|ssl_certificate /etc/nginx/ssl/api.pipernewsletter.com/fullchain.pem;|' nginx/nginx.conf
sed -i 's|ssl_certificate_key .*|ssl_certificate_key /etc/nginx/ssl/api.pipernewsletter.com/privkey.pem;|' nginx/nginx.conf

# Reload nginx
docker exec -it piper-nginx-prod nginx -s reload
```

### 3. Monitoring Setup

#### Configure Grafana Dashboards
```bash
# Access Grafana
open https://monitoring.pipernewsletter.com:3001

# Default credentials
# Username: admin
# Password: (from GRAFANA_PASSWORD in secrets)

# Import dashboards
# Dashboard IDs: 1860 (Node Exporter), 9614 (MongoDB), 9628 (PostgreSQL)
```

#### Set Up Alerts
```bash
# Configure alert rules in Grafana
# CPU usage > 80%
# Memory usage > 85%
# Disk usage > 90%
# HTTP error rate > 5%
# Response time > 2s
```

### 4. Backup Configuration

#### Automated Backups
```bash
# Configure backup service
cp backup/backup-config.yml backup/config.yml

# Edit configuration with your settings
vim backup/config.yml

# Start backup service
docker-compose -f docker-compose.prod.yml up -d backup-service
```

## Security Hardening

### 1. Network Security

#### Configure Firewall
```bash
# UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

#### Network Segmentation
```bash
# Create separate Docker networks
docker network create piper-backend-network
docker network create piper-frontend-network
docker network create piper-database-network

# Connect services to appropriate networks
docker network connect piper-backend-network piper-backend-prod
docker network connect piper-database-network piper-mongodb-prod
```

### 2. Container Security

#### Security Scanning
```bash
# Scan images for vulnerabilities
docker scan your-registry/piper-newsletter-backend:latest
docker scan your-registry/piper-newsletter-frontend:latest

# Use distroless images where possible
# FROM gcr.io/distroless/nodejs:18
```

#### Run as Non-Root User
```dockerfile
# In Dockerfiles
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### 3. Application Security

#### Security Headers
```bash
# Verify security headers
curl -I https://api.pipernewsletter.com

# Should include:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# Content-Security-Policy: default-src 'self'
```

#### Rate Limiting
```bash
# Test rate limiting
curl -X GET https://api.pipernewsletter.com/api/health \
  -H "Authorization: Bearer invalid_token" \
  -w "%{http_code}\n"

# Should return 429 after multiple requests
```

## Performance Optimization

### 1. Database Optimization

#### MongoDB Indexes
```bash
# Create indexes for common queries
docker exec -it piper-mongodb-prod mongo piper_newsletter --eval "
db.newsletters.createIndex({ status: 1, createdAt: -1 });
db.subscribers.createIndex({ email: 1 }, { unique: true });
db.campaigns.createIndex({ status: 1, scheduledFor: 1 });
"
```

#### PostgreSQL Optimization
```bash
# Update configuration for analytics
docker exec -it piper-postgres-prod psql -U piper -d piper_analytics -c "
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
SELECT pg_reload_conf();
"
```

### 2. Caching Strategy

#### Redis Configuration
```bash
# Optimize Redis for caching
docker exec -it piper-redis-prod redis-cli CONFIG SET maxmemory 512mb
docker exec -it piper-redis-prod redis-cli CONFIG SET maxmemory-policy allkeys-lru
docker exec -it piper-redis-prod redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

### 3. CDN Configuration

#### CloudFlare Setup
```bash
# Configure CloudFlare
# 1. Add domain to CloudFlare
# 2. Update nameservers
# 3. Configure SSL/TLS (Full Strict)
# 4. Enable caching for static assets
# 5. Configure page rules for API endpoints
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker logs piper-backend-prod

# Check resource usage
docker stats

# Restart container
docker restart piper-backend-prod
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
docker exec -it piper-backend-prod npm run test-db

# Check database logs
docker logs piper-mongodb-prod
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/api.pipernewsletter.com/cert.pem -text -noout

# Renew certificates
certbot renew --dry-run
```

#### 4. Performance Issues
```bash
# Check resource usage
docker stats

# Monitor application metrics
curl https://monitoring.pipernewsletter.com:3001

# Check slow queries
kubectl logs -f deployment/piper-backend -n piper-newsletter | grep "SLOW_QUERY"
```

### Log Analysis

#### Application Logs
```bash
# View application logs
docker logs -f piper-backend-prod | grep ERROR

# Search for specific errors
docker logs piper-backend-prod | grep -i "database\|connection\|timeout"
```

#### System Logs
```bash
# Check system logs
sudo journalctl -u docker.service -f

# Check nginx logs
docker logs piper-nginx-prod | grep -i error
```

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Check application health
- Monitor error rates
- Verify backup completion

#### Weekly
- Review performance metrics
- Check disk usage
- Update security patches

#### Monthly
- Database optimization
- Log rotation
- Security audit

### Backup and Recovery

#### Automated Backup
```bash
# Configure automated backups
# Daily: Database backups
# Weekly: Full system backup
# Monthly: Archive old backups
```

#### Disaster Recovery
```bash
# Test recovery procedures
# Document recovery steps
# Regular disaster recovery drills
```

## Support and Resources

### Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Security Guide](SECURITY.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

### Community
- [GitHub Issues](https://github.com/your-org/piper-newsletter/issues)
- [Community Forum](https://community.pipernewsletter.com)
- [Discord Channel](https://discord.gg/piper-newsletter)

### Professional Support
- Email: support@pipernewsletter.com
- Phone: +1-555-PIPER-01
- Enterprise Support: enterprise@pipernewsletter.com