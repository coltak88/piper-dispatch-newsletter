#!/usr/bin/env node

/**
 * Deployment Configuration Migration Script
 * Updates deployment configs, environment variables, and infrastructure for rasa-x-machina
 */

const fs = require('fs');
const path = require('path');

class DeploymentConfigMigrator {
    constructor() {
        this.oldOrg = 'rasa-x-machina';
        this.newOrg = 'rasa-x-machina';
        this.oldUser = 'coltak88';
        this.deploymentFiles = [];
        this.updatedFiles = [];
        this.errors = [];
        
        this.deploymentPatterns = [
            'deploy.yml',
            'deploy.yaml',
            'deployment.yml',
            'deployment.yaml',
            'docker-compose*.yml',
            'docker-compose*.yaml',
            'Dockerfile*',
            '*.env*',
            'terraform/**/*',
            'kubernetes/**/*',
            'helm/**/*',
            'scripts/**/*deploy*',
            'scripts/**/*setup*',
            'cloudbuild*.yml',
            'cloudbuild*.yaml'
        ];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        const color = colors[type] || colors.info;
        console.log(`${colors.reset}[${timestamp}] ${color}${message}${colors.reset}`);
    }

    findDeploymentFiles() {
        this.log('Scanning for deployment configuration files...', 'info');
        
        function walkDir(dir, patterns) {
            const files = [];
            
            try {
                const items = fs.readdirSync(dir);
                
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        // Skip common ignore directories
                        if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.git'].includes(item)) {
                            files.push(...walkDir(fullPath, patterns));
                        }
                    } else {
                        // Check if file matches any pattern
                        const matches = patterns.some(pattern => {
                            if (pattern.includes('*')) {
                                const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\//g, '\\\\'));
                                return regex.test(fullPath);
                            }
                            return path.basename(fullPath) === pattern;
                        });
                        
                        if (matches) {
                            files.push(fullPath);
                        }
                    }
                });
            } catch (error) {
                // Silently continue if directory can't be read
            }
            
            return files;
        }
        
        this.deploymentFiles = walkDir(process.cwd(), this.deploymentPatterns);
        this.log(`Found ${this.deploymentFiles.length} deployment configuration files`);
        return this.deploymentFiles;
    }

    updateDockerfile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            let newContent = content;

            // Update base images if they reference old organization
            const dockerUpdates = [
                {
                    pattern: /FROM\s+gcr\.io\/rasa-x-machina\//g,
                    replacement: 'FROM gcr.io/rasa-x-machina/',
                    description: 'GCR base images'
                },
                {
                    pattern: /gcr\.io\/rasa-x-machina\//g,
                    replacement: 'gcr.io/rasa-x-machina/',
                    description: 'GCR references'
                },
                {
                    pattern: /rasa-x-machina\.com/g,
                    replacement: 'rasa-x-machina.dev',
                    description: 'Domain references'
                }
            ];

            dockerUpdates.forEach(update => {
                if (newContent.match(update.pattern)) {
                    newContent = newContent.replace(update.pattern, update.replacement);
                    updated = true;
                    this.log(`Updated ${update.description} in ${path.basename(filePath)}`);
                }
            });

            // Update environment variables
            if (newContent.includes('ASK_POLESTAR')) {
                newContent = newContent.replace(/ASK_POLESTAR/g, 'RASA_X_MACHINA');
                updated = true;
                this.log(`Updated environment variables in ${path.basename(filePath)}`);
            }

            if (updated) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                this.updatedFiles.push(filePath);
                return true;
            }
            
            return false;
        } catch (error) {
            this.errors.push({ file: filePath, error: error.message });
            this.log(`Error updating Dockerfile ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    updateDockerCompose(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            let newContent = content;

            // Update image references
            const composeUpdates = [
                {
                    pattern: /image:\s*gcr\.io\/rasa-x-machina\//g,
                    replacement: 'image: gcr.io/rasa-x-machina/',
                    description: 'GCR image references'
                },
                {
                    pattern: /rasa-x-machina\.com/g,
                    replacement: 'rasa-x-machina.dev',
                    description: 'Domain references'
                }
            ];

            composeUpdates.forEach(update => {
                if (newContent.match(update.pattern)) {
                    newContent = newContent.replace(update.pattern, update.replacement);
                    updated = true;
                    this.log(`Updated ${update.description} in ${path.basename(filePath)}`);
                }
            });

            // Update environment variables
            if (newContent.includes('ASK_POLESTAR')) {
                newContent = newContent.replace(/ASK_POLESTAR/g, 'RASA_X_MACHINA');
                updated = true;
                this.log(`Updated environment variables in ${path.basename(filePath)}`);
            }

            if (updated) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                this.updatedFiles.push(filePath);
                return true;
            }
            
            return false;
        } catch (error) {
            this.errors.push({ file: filePath, error: error.message });
            this.log(`Error updating Docker Compose ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    updateDeploymentScript(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            let newContent = content;

            // Update deployment-specific references
            const scriptUpdates = [
                {
                    pattern: /github.com\/rasa-x-machina\//g,
                    replacement: 'github.com/rasa-x-machina/',
                    description: 'GitHub repository URLs'
                },
                {
                    pattern: /gcr\.io\/rasa-x-machina\//g,
                    replacement: 'gcr.io/rasa-x-machina/',
                    description: 'GCR image references'
                },
                {
                    pattern: /rasa-x-machina\.com/g,
                    replacement: 'rasa-x-machina.dev',
                    description: 'Domain references'
                },
                {
                    pattern: /GCP_PROJECT_ID=rasa-x-machina/g,
                    replacement: 'GCP_PROJECT_ID=rasa-x-machina',
                    description: 'GCP project ID'
                },
                {
                    pattern: /REGION=us-central1/g,
                    replacement: 'REGION=us-central1',
                    description: 'Region settings (keep same)'
                }
            ];

            scriptUpdates.forEach(update => {
                if (newContent.match(update.pattern)) {
                    newContent = newContent.replace(update.pattern, update.replacement);
                    updated = true;
                    this.log(`Updated ${update.description} in ${path.basename(filePath)}`);
                }
            });

            if (updated) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                this.updatedFiles.push(filePath);
                return true;
            }
            
            return false;
        } catch (error) {
            this.errors.push({ file: filePath, error: error.message });
            this.log(`Error updating deployment script ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    updateEnvironmentFiles(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            let newContent = content;

            // Update environment variables
            const envUpdates = [
                {
                    pattern: /ASK_POLESTAR/g,
                    replacement: 'RASA_X_MACHINA',
                    description: 'Organization environment variables'
                },
                {
                    pattern: /rasa-x-machina\.com/g,
                    replacement: 'rasa-x-machina.dev',
                    description: 'Domain environment variables'
                },
                {
                    pattern: /GCP_PROJECT_ID=rasa-x-machina/g,
                    replacement: 'GCP_PROJECT_ID=rasa-x-machina',
                    description: 'GCP project environment variables'
                }
            ];

            envUpdates.forEach(update => {
                if (newContent.match(update.pattern)) {
                    newContent = newContent.replace(update.pattern, update.replacement);
                    updated = true;
                    this.log(`Updated ${update.description} in ${path.basename(filePath)}`);
                }
            });

            if (updated) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                this.updatedFiles.push(filePath);
                return true;
            }
            
            return false;
        } catch (error) {
            this.errors.push({ file: filePath, error: error.message });
            this.log(`Error updating environment file ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    createNewDeploymentConfigs() {
        this.log('Creating new deployment configurations for rasa-x-machina...', 'info');
        
        const newConfigs = [
            {
                name: 'rasa-x-machina-deploy.yml',
                content: this.generateRasaXMachinaDeployConfig(),
                type: 'deployment'
            },
            {
                name: '.env.rasa-x-machina',
                content: this.generateEnvironmentConfig(),
                type: 'environment'
            },
            {
                name: 'cloudbuild.rasa-x-machina.yml',
                content: this.generateCloudBuildConfig(),
                type: 'cloudbuild'
            }
        ];

        newConfigs.forEach(config => {
            const filePath = path.join(process.cwd(), 'deployment', config.name);
            try {
                // Ensure deployment directory exists
                const deploymentDir = path.dirname(filePath);
                if (!fs.existsSync(deploymentDir)) {
                    fs.mkdirSync(deploymentDir, { recursive: true });
                }
                
                fs.writeFileSync(filePath, config.content);
                this.updatedFiles.push(filePath);
                this.log(`Created new deployment config: ${config.name}`, 'success');
            } catch (error) {
                this.errors.push({ file: filePath, error: error.message });
                this.log(`Error creating ${config.name}: ${error.message}`, 'error');
            }
        });
    }

    generateRasaXMachinaDeployConfig() {
        return `# Rasa-X-Machina Deployment Configuration
# This configuration replaces the old rasa-x-machina deployment setup

name: rasa-x-machina-piper-dispatch
region: us-central1
project: rasa-x-machina

services:
  main:
    image: gcr.io/rasa-x-machina/piper-dispatch-ecosystem
    port: 3000
    env:
      - NODE_ENV=production
      - ORGANIZATION=rasa-x-machina
      - DOMAIN=rasa-x-machina.dev
      - GCP_PROJECT_ID=rasa-x-machina
    resources:
      cpu: 1
      memory: 1Gi
    scaling:
      min_instances: 1
      max_instances: 10
      
  api:
    image: gcr.io/rasa-x-machina/piper-dispatch-api
    port: 8080
    env:
      - NODE_ENV=production
      - ORGANIZATION=rasa-x-machina
    resources:
      cpu: 0.5
      memory: 512Mi
    scaling:
      min_instances: 1
      max_instances: 5

# Domain configuration
domains:
  - rasa-x-machina.dev
  - api.rasa-x-machina.dev
  - piper.rasa-x-machina.dev

# Security settings
security:
  https_redirect: true
  cors_origins:
    - https://rasa-x-machina.dev
    - https://piper.rasa-x-machina.dev
  
# Monitoring
monitoring:
  enabled: true
  alerting: true
  metrics_endpoint: /metrics
`;
    }

    generateEnvironmentConfig() {
        return `# Rasa-X-Machina Environment Configuration
# Copy this to .env file for local development

# Organization Settings
ORGANIZATION=rasa-x-machina
DOMAIN=rasa-x-machina.dev
NODE_ENV=development

# GCP Configuration
GCP_PROJECT_ID=rasa-x-machina
GCP_REGION=us-central1
GCP_ZONE=us-central1-a

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/piper_dispatch
REDIS_URL=redis://localhost:6379

# API Configuration
API_BASE_URL=https://api.rasa-x-machina.dev
FRONTEND_URL=https://rasa-x-machina.dev
PORT=3000

# Authentication
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@rasa-x-machina.dev
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn-here
LOG_LEVEL=info

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
ENABLE_EMAIL_NOTIFICATIONS=true
`;
    }

    generateCloudBuildConfig() {
        return `# Rasa-X-Machina Cloud Build Configuration
# Replaces old rasa-x-machina cloudbuild configuration

steps:
  # Build main application
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/rasa-x-machina/piper-dispatch-ecosystem:$COMMIT_SHA', '.']
    id: 'build-main'
    
  # Build API service
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/rasa-x-machina/piper-dispatch-api:$COMMIT_SHA', './packages/api']
    id: 'build-api'
    waitFor: ['build-main']
    
  # Push images to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/rasa-x-machina/piper-dispatch-ecosystem:$COMMIT_SHA']
    id: 'push-main'
    waitFor: ['build-main']
    
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/rasa-x-machina/piper-dispatch-api:$COMMIT_SHA']
    id: 'push-api'
    waitFor: ['build-api']
    
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'piper-dispatch-ecosystem'
      - '--image'
      - 'gcr.io/rasa-x-machina/piper-dispatch-ecosystem:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
    id: 'deploy-main'
    waitFor: ['push-main']
    
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'piper-dispatch-api'
      - '--image'
      - 'gcr.io/rasa-x-machina/piper-dispatch-api:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
    id: 'deploy-api'
    waitFor: ['push-api']

# Configuration
options:
  logging: CLOUD_LOGGING_ONLY
  
substitutions:
  _ORGANIZATION: rasa-x-machina
  _DOMAIN: rasa-x-machina.dev
  _REGION: us-central1

# Images to build
images:
  - 'gcr.io/rasa-x-machina/piper-dispatch-ecosystem:$COMMIT_SHA'
  - 'gcr.io/rasa-x-machina/piper-dispatch-api:$COMMIT_SHA'
`;
    }

    run() {
        this.log('Starting deployment configuration migration for rasa-x-machina organization...', 'info');
        
        // Find all deployment files
        this.findDeploymentFiles();
        
        // Process each file type appropriately
        this.deploymentFiles.forEach(filePath => {
            const fileName = path.basename(filePath);
            
            if (fileName.toLowerCase().includes('dockerfile')) {
                this.updateDockerfile(filePath);
            } else if (fileName.includes('docker-compose')) {
                this.updateDockerCompose(filePath);
            } else if (fileName.includes('.env')) {
                this.updateEnvironmentFiles(filePath);
            } else if (filePath.includes('scripts') || filePath.includes('deploy')) {
                this.updateDeploymentScript(filePath);
            } else {
                // Generic update for other deployment files
                this.updateDeploymentScript(filePath);
            }
        });

        // Create new deployment configurations
        this.createNewDeploymentConfigs();

        // Generate migration report
        const report = {
            timestamp: new Date().toISOString(),
            totalFilesFound: this.deploymentFiles.length,
            updatedFiles: this.updatedFiles,
            errors: this.errors,
            summary: {
                totalFilesUpdated: this.updatedFiles.length,
                totalErrors: this.errors.length,
                success: this.errors.length === 0
            }
        };

        const reportPath = path.join(process.cwd(), 'migration', 'deployment_migration_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`Deployment migration report saved to ${reportPath}`);

        if (report.summary.success) {
            this.log('Deployment configuration migration completed successfully!', 'success');
        } else {
            this.log(`Deployment configuration migration completed with ${report.summary.totalErrors} errors`, 'warning');
        }

        return report;
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    const migrator = new DeploymentConfigMigrator();
    migrator.run();
}

module.exports = DeploymentConfigMigrator;