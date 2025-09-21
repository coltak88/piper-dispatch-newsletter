#!/usr/bin/env node

/**
 * Main Migration Orchestrator
 * Coordinates the complete migration from rasa-x-machina to rasa-x-machina organization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import migration modules
const RepositoryMigrator = require('./update_repository_references');
const GitHubActionsMigrator = require('./update_github_actions');
const DeploymentConfigMigrator = require('./update_deployment_configs');

class MigrationOrchestrator {
    constructor() {
        this.startTime = new Date();
        this.migrationResults = {};
        this.errors = [];
        this.warnings = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            header: '\x1b[35m',
            reset: '\x1b[0m'
        };
        
        const color = colors[type] || colors.info;
        console.log(`${colors.reset}[${timestamp}] ${color}${message}${colors.reset}`);
    }

    printHeader() {
        console.log('\n' + '='.repeat(80));
        this.log('PIPER DISPATCH ECOSYSTEM MIGRATION', 'header');
        this.log('Migrating from rasa-x-machina to rasa-x-machina organization', 'header');
        this.log(`Started at: ${this.startTime.toISOString()}`, 'header');
        console.log('='.repeat(80) + '\n');
    }

    printFooter() {
        const endTime = new Date();
        const duration = (endTime - this.startTime) / 1000; // seconds
        
        console.log('\n' + '='.repeat(80));
        this.log('MIGRATION COMPLETED', 'header');
        this.log(`Completed at: ${endTime.toISOString()}`, 'header');
        this.log(`Total duration: ${duration.toFixed(2)} seconds`, 'header');
        
        if (this.errors.length > 0) {
            this.log(`Errors: ${this.errors.length}`, 'error');
        }
        if (this.warnings.length > 0) {
            this.log(`Warnings: ${this.warnings.length}`, 'warning');
        }
        
        console.log('='.repeat(80) + '\n');
    }

    validatePrerequisites() {
        this.log('Validating migration prerequisites...', 'info');
        
        try {
            // Check if we're in a git repository
            execSync('git rev-parse --git-dir', { stdio: 'ignore' });
            this.log('✅ Git repository detected', 'success');
        } catch (error) {
            this.errors.push('Not in a git repository');
            this.log('❌ Not in a git repository', 'error');
            return false;
        }

        try {
            // Check Node.js version
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            this.log(`✅ Node.js version: ${nodeVersion}`, 'success');
        } catch (error) {
            this.warnings.push('Could not verify Node.js version');
            this.log('⚠️ Could not verify Node.js version', 'warning');
        }

        // Check if migration directory exists
        const migrationDir = path.join(process.cwd(), 'migration');
        if (!fs.existsSync(migrationDir)) {
            fs.mkdirSync(migrationDir, { recursive: true });
            this.log('✅ Created migration directory', 'success');
        }

        return this.errors.length === 0;
    }

    createBackup() {
        this.log('Creating backup of current state...', 'info');
        
        try {
            const backupDir = path.join(process.cwd(), 'migration', 'backup');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            // Create git backup
            const gitBackupFile = path.join(backupDir, 'git_status_backup.txt');
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            fs.writeFileSync(gitBackupFile, gitStatus);
            
            // Create package.json backup
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJsonBackup = path.join(backupDir, 'package.json.backup');
                fs.copyFileSync(packageJsonPath, packageJsonBackup);
            }

            // Create .git/config backup
            const gitConfigPath = path.join(process.cwd(), '.git', 'config');
            if (fs.existsSync(gitConfigPath)) {
                const gitConfigBackup = path.join(backupDir, 'git_config.backup');
                fs.copyFileSync(gitConfigPath, gitConfigBackup);
            }

            this.log('✅ Backup created successfully', 'success');
            return true;
        } catch (error) {
            this.errors.push(`Backup creation failed: ${error.message}`);
            this.log(`❌ Backup creation failed: ${error.message}`, 'error');
            return false;
        }
    }

    runRepositoryMigration() {
        this.log('\n📦 Running Repository References Migration...', 'header');
        
        try {
            const migrator = new RepositoryMigrator();
            const result = migrator.run();
            this.migrationResults.repository = result;
            
            if (result.summary.success) {
                this.log('✅ Repository migration completed successfully', 'success');
            } else {
                this.log(`⚠️ Repository migration completed with ${result.summary.totalErrors} errors`, 'warning');
                this.errors.push(...result.errors.map(e => `Repository: ${e.file || e.operation} - ${e.error}`));
            }
            
            return result.summary.success;
        } catch (error) {
            this.errors.push(`Repository migration failed: ${error.message}`);
            this.log(`❌ Repository migration failed: ${error.message}`, 'error');
            return false;
        }
    }

    runGitHubActionsMigration() {
        this.log('\n🔄 Running GitHub Actions Migration...', 'header');
        
        try {
            const migrator = new GitHubActionsMigrator();
            const result = migrator.run();
            this.migrationResults.githubActions = result;
            
            if (result.summary.success) {
                this.log('✅ GitHub Actions migration completed successfully', 'success');
            } else {
                this.log(`⚠️ GitHub Actions migration completed with ${result.summary.totalErrors} errors`, 'warning');
                this.errors.push(...result.errors.map(e => `GitHub Actions: ${e.file} - ${e.error}`));
            }
            
            return result.summary.success;
        } catch (error) {
            this.errors.push(`GitHub Actions migration failed: ${error.message}`);
            this.log(`❌ GitHub Actions migration failed: ${error.message}`, 'error');
            return false;
        }
    }

    runDeploymentMigration() {
        this.log('\n🚀 Running Deployment Configuration Migration...', 'header');
        
        try {
            const migrator = new DeploymentConfigMigrator();
            const result = migrator.run();
            this.migrationResults.deployment = result;
            
            if (result.summary.success) {
                this.log('✅ Deployment migration completed successfully', 'success');
            } else {
                this.log(`⚠️ Deployment migration completed with ${result.summary.totalErrors} errors`, 'warning');
                this.errors.push(...result.errors.map(e => `Deployment: ${e.file} - ${e.error}`));
            }
            
            return result.summary.success;
        } catch (error) {
            this.errors.push(`Deployment migration failed: ${error.message}`);
            this.log(`❌ Deployment migration failed: ${error.message}`, 'error');
            return false;
        }
    }

    validateMigration() {
        this.log('\n🔍 Running Migration Validation...', 'header');
        
        let validationPassed = true;
        
        try {
            // Check for remaining old references
            const oldReferences = execSync('grep -r "rasa-x-machina" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=migration || true', { encoding: 'utf8' });
            if (oldReferences.trim()) {
                this.warnings.push('Found remaining rasa-x-machina references');
                this.log('⚠️ Found remaining rasa-x-machina references', 'warning');
                validationPassed = false;
            } else {
                this.log('✅ No remaining rasa-x-machina references found', 'success');
            }

            // Check Git remotes
            const remotes = execSync('git remote -v', { encoding: 'utf8' });
            if (remotes.includes('rasa-x-machina')) {
                this.log('✅ Rasa-x-machina remote configured', 'success');
            } else {
                this.warnings.push('Rasa-x-machina remote not found');
                this.log('⚠️ Rasa-x-machina remote not found', 'warning');
            }

            // Check package.json
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.repository && packageJson.repository.url) {
                    if (packageJson.repository.url.includes('rasa-x-machina')) {
                        this.log('✅ Package.json repository URL updated', 'success');
                    } else {
                        this.warnings.push('Package.json repository URL not updated');
                        this.log('⚠️ Package.json repository URL not updated', 'warning');
                        validationPassed = false;
                    }
                }
            }

            return validationPassed;
        } catch (error) {
            this.errors.push(`Migration validation failed: ${error.message}`);
            this.log(`❌ Migration validation failed: ${error.message}`, 'error');
            return false;
        }
    }

    generateFinalReport() {
        this.log('\n📋 Generating Final Migration Report...', 'header');
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: (new Date() - this.startTime) / 1000,
            migrationResults: this.migrationResults,
            errors: this.errors,
            warnings: this.warnings,
            summary: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                success: this.errors.length === 0,
                phasesCompleted: Object.keys(this.migrationResults).length
            }
        };

        const reportPath = path.join(process.cwd(), 'migration', 'final_migration_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`✅ Final migration report saved to ${reportPath}`, 'success');
        return report;
    }

    run() {
        this.printHeader();
        
        // Phase 1: Prerequisites
        if (!this.validatePrerequisites()) {
            this.log('❌ Prerequisites validation failed. Aborting migration.', 'error');
            return false;
        }
        
        if (!this.createBackup()) {
            this.log('❌ Backup creation failed. Aborting migration.', 'error');
            return false;
        }

        // Phase 2: Repository Migration
        this.runRepositoryMigration();

        // Phase 3: GitHub Actions Migration
        this.runGitHubActionsMigration();

        // Phase 4: Deployment Migration
        this.runDeploymentMigration();

        // Phase 5: Validation
        const validationPassed = this.validateMigration();

        // Phase 6: Final Report
        const finalReport = this.generateFinalReport();

        this.printFooter();

        if (validationPassed && this.errors.length === 0) {
            this.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!', 'success');
            this.log('Your repository is now ready for the rasa-x-machina organization!', 'success');
            return true;
        } else {
            this.log('⚠️ MIGRATION COMPLETED WITH ISSUES', 'warning');
            this.log('Please review the errors and warnings above', 'warning');
            return false;
        }
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    const orchestrator = new MigrationOrchestrator();
    orchestrator.run();
}

module.exports = MigrationOrchestrator;