#!/usr/bin/env node

/**
 * GitHub Actions Migration Script
 * Updates CI/CD workflows for rasa-x-machina organization
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class GitHubActionsMigrator {
    constructor() {
        this.oldOrg = 'rasa-x-machina';
        this.newOrg = 'rasa-x-machina';
        this.oldUser = 'coltak88';
        this.workflowsDir = path.join(process.cwd(), '.github', 'workflows');
        this.updatedWorkflows = [];
        this.errors = [];
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

    updateWorkflowFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            let newContent = content;

            // Common patterns to update in GitHub Actions
            const updates = [
                {
                    pattern: /repository:\s*rasa-x-machina\//g,
                    replacement: 'repository: rasa-x-machina/',
                    description: 'Repository references'
                },
                {
                    pattern: /owner:\s*rasa-x-machina/g,
                    replacement: 'owner: rasa-x-machina',
                    description: 'Owner references'
                },
                {
                    pattern: /github\.com\/rasa-x-machina\//g,
                    replacement: 'github.com/rasa-x-machina/',
                    description: 'GitHub URL references'
                },
                {
                    pattern: /coltak88\/piper-dispatch/g,
                    replacement: 'rasa-x-machina/piper-dispatch-ecosystem',
                    description: 'Specific repository references'
                },
                {
                    pattern: /rasa-x-machina\/piperdispatch/g,
                    replacement: 'rasa-x-machina/piper-dispatch-main',
                    description: 'Piperdispatch references'
                },
                {
                    pattern: /rasa-x-machina\/piperdispatch-specialkit/g,
                    replacement: 'rasa-x-machina/piper-dispatch-special-kit',
                    description: 'Special kit references'
                }
            ];

            updates.forEach(update => {
                if (newContent.match(update.pattern)) {
                    newContent = newContent.replace(update.pattern, update.replacement);
                    updated = true;
                    this.log(`Updated ${update.description} in ${path.basename(filePath)}`);
                }
            });

            // Update environment variables and secrets references
            const envUpdates = [
                {
                    pattern: /GCP_PROJECT_ID:\s*rasa-x-machina/g,
                    replacement: 'GCP_PROJECT_ID: rasa-x-machina',
                    description: 'GCP project references'
                },
                {
                    pattern: /DOMAIN:\s*piperdispatch\.com/g,
                    replacement: 'DOMAIN: rasa-x-machina.dev',
                    description: 'Domain references'
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
                this.updatedWorkflows.push(filePath);
                this.log(`Successfully updated ${path.basename(filePath)}`, 'success');
                return true;
            }
            
            return false;
        } catch (error) {
            this.errors.push({ file: filePath, error: error.message });
            this.log(`Error updating ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    createNewWorkflows() {
        this.log('Creating new organization-specific workflows...', 'info');
        
        const newWorkflows = [
            {
                name: 'rasa-x-machina-deploy.yml',
                content: this.generateRasaXMachinaDeployWorkflow()
            },
            {
                name: 'organization-migration.yml',
                content: this.generateMigrationWorkflow()
            }
        ];

        newWorkflows.forEach(workflow => {
            const filePath = path.join(this.workflowsDir, workflow.name);
            try {
                fs.writeFileSync(filePath, workflow.content);
                this.updatedWorkflows.push(filePath);
                this.log(`Created new workflow: ${workflow.name}`, 'success');
            } catch (error) {
                this.errors.push({ file: filePath, error: error.message });
                this.log(`Error creating ${workflow.name}: ${error.message}`, 'error');
            }
        });
    }

    generateRasaXMachinaDeployWorkflow() {
        return `name: Rasa-X-Machina Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  ORGANIZATION: rasa-x-machina
  REPOSITORY: piper-dispatch-ecosystem
  GCP_PROJECT_ID: rasa-x-machina
  DOMAIN: rasa-x-machina.dev

jobs:
  deploy:
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
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Setup GCP credentials
      uses: google-github-actions/auth@v2
      with:
        credentials_json: \${{ secrets.GCP_SA_KEY }}
        
    - name: Deploy to Cloud Run
      run: |
        gcloud config set project \${{ env.GCP_PROJECT_ID }}
        gcloud run deploy piper-dispatch-ecosystem \\
          --image gcr.io/\${{ env.GCP_PROJECT_ID }}/piper-dispatch-ecosystem:\${{ github.sha }} \\
          --platform managed \\
          --region us-central1 \\
          --allow-unauthenticated
          
    - name: Update deployment status
      uses: bobheadxi/deployments@v1
      with:
        step: finish
        token: \${{ secrets.GITHUB_TOKEN }}
        status: \${{ job.status }}
        deployment_id: \${{ steps.deployment.outputs.deployment_id }}
`;
    }

    generateMigrationWorkflow() {
        return `name: Organization Migration Check

on:
  push:
    branches: [ main, unified-ecosystem ]
  workflow_dispatch:

jobs:
  migration-check:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Check organization references
      run: |
        echo "Checking for old organization references..."
        if grep -r "rasa-x-machina" . --exclude-dir=node_modules --exclude-dir=.git; then
          echo "❌ Found old organization references"
          exit 1
        else
          echo "✅ No old organization references found"
        fi
        
    - name: Validate repository URLs
      run: |
        echo "Validating repository URLs..."
        if grep -r "github.com/rasa-x-machina" . --exclude-dir=node_modules --exclude-dir=.git; then
          echo "❌ Found old repository URLs"
          exit 1
        else
          echo "✅ All repository URLs updated"
        fi
        
    - name: Check deployment configurations
      run: |
        echo "Validating deployment configurations..."
        if [ -f "deploy.yml" ]; then
          if grep -q "rasa-x-machina" deploy.yml; then
            echo "❌ Deployment config contains old references"
            exit 1
          fi
        fi
        echo "✅ Deployment configurations validated"
        
    - name: Migration status
      run: echo "✅ Organization migration validation completed"
`;
    }

    updatePackageJsonScripts() {
        this.log('Updating package.json deployment scripts...', 'info');
        
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            // Update scripts that reference old organization
            if (packageJson.scripts) {
                Object.keys(packageJson.scripts).forEach(script => {
                    const oldScript = packageJson.scripts[script];
                    let newScript = oldScript;
                    
                    // Replace organization references in scripts
                    if (oldScript.includes('rasa-x-machina')) {
                        newScript = oldScript.replace(/rasa-x-machina/g, 'rasa-x-machina');
                        packageJson.scripts[script] = newScript;
                        this.log(`Updated script: ${script}`);
                    }
                });
            }
            
            // Update repository URL
            if (packageJson.repository && packageJson.repository.url) {
                packageJson.repository.url = packageJson.repository.url.replace(
                    /rasa-x-machina/g, 
                    'rasa-x-machina'
                );
                this.log('Updated repository URL in package.json');
            }
            
            // Update homepage/bugs URLs if present
            if (packageJson.homepage) {
                packageJson.homepage = packageJson.homepage.replace(/rasa-x-machina/g, 'rasa-x-machina');
            }
            if (packageJson.bugs && packageJson.bugs.url) {
                packageJson.bugs.url = packageJson.bugs.url.replace(/rasa-x-machina/g, 'rasa-x-machina');
            }
            
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            this.updatedWorkflows.push(packageJsonPath);
            this.log('Successfully updated package.json', 'success');
            
        } catch (error) {
            this.errors.push({ file: packageJsonPath, error: error.message });
            this.log(`Error updating package.json: ${error.message}`, 'error');
        }
    }

    run() {
        this.log('Starting GitHub Actions migration for rasa-x-machina organization...', 'info');
        
        // Ensure workflows directory exists
        if (!fs.existsSync(this.workflowsDir)) {
            fs.mkdirSync(this.workflowsDir, { recursive: true });
        }

        // Find all workflow files
        const workflowFiles = fs.readdirSync(this.workflowsDir)
            .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
            .map(file => path.join(this.workflowsDir, file));

        this.log(`Found ${workflowFiles.length} workflow files to update`);

        // Update existing workflows
        workflowFiles.forEach(filePath => {
            this.updateWorkflowFile(filePath);
        });

        // Create new organization-specific workflows
        this.createNewWorkflows();

        // Update package.json scripts
        this.updatePackageJsonScripts();

        // Generate migration report
        const report = {
            timestamp: new Date().toISOString(),
            updatedWorkflows: this.updatedWorkflows,
            errors: this.errors,
            summary: {
                totalWorkflowsUpdated: this.updatedWorkflows.length,
                totalErrors: this.errors.length,
                success: this.errors.length === 0
            }
        };

        const reportPath = path.join(process.cwd(), 'migration', 'github_actions_migration_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`GitHub Actions migration report saved to ${reportPath}`);

        if (report.summary.success) {
            this.log('GitHub Actions migration completed successfully!', 'success');
        } else {
            this.log(`GitHub Actions migration completed with ${report.summary.totalErrors} errors`, 'warning');
        }

        return report;
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    const migrator = new GitHubActionsMigrator();
    migrator.run();
}

module.exports = GitHubActionsMigrator;