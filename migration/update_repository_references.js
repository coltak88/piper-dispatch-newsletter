#!/usr/bin/env node

/**
 * Repository Migration Script - Rasa-X-Machina Organization Move
 * Updates all repository references from rasa-x-machina/coltak88 to rasa-x-machina
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RepositoryMigrator {
    constructor() {
        this.oldOrg = 'rasa-x-machina';
        this.newOrg = 'rasa-x-machina';
        this.oldUser = 'coltak88';
        this.repositoryUrlMappings = {
            'https://github.com/rasa-x-machina/piper-dispatch-ecosystem.git': 'https://github.com/rasa-x-machina/piper-dispatch-ecosystem.git',
            'https://github.com/rasa-x-machina/piper-dispatch-main.git': 'https://github.com/rasa-x-machina/piper-dispatch-main.git',
            'https://github.com/rasa-x-machina/piper-dispatch-special-kit.git': 'https://github.com/rasa-x-machina/piper-dispatch-special-kit.git'
        };
        
        this.filePatterns = [
            'package.json',
            '*.md',
            '*.yml',
            '*.yaml',
            '*.sh',
            '*.ps1',
            '*.bat',
            '*.js',
            '*.config.js'
        ];
        
        this.updatedFiles = [];
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

    findFiles(directory, patterns) {
        const files = [];
        
        function walkDir(dir) {
            try {
                const items = fs.readdirSync(dir);
                
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        // Skip node_modules, .git, and other common ignore patterns
                        if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(item)) {
                            walkDir(fullPath);
                        }
                    } else {
                        // Check if file matches any pattern
                        const matches = patterns.some(pattern => {
                            if (pattern.includes('*')) {
                                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                                return regex.test(item);
                            }
                            return item === pattern;
                        });
                        
                        if (matches) {
                            files.push(fullPath);
                        }
                    }
                });
            } catch (error) {
                this.log(`Error reading directory ${dir}: ${error.message}`, 'error');
            }
        }
        
        walkDir(directory);
        return files;
    }

    updateFileContent(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            let newContent = content;

            // Replace repository URLs
            Object.entries(this.repositoryUrlMappings).forEach(([oldUrl, newUrl]) => {
                if (newContent.includes(oldUrl)) {
                    newContent = newContent.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
                    updated = true;
                    this.log(`Updated repository URL in ${filePath}: ${oldUrl} → ${newUrl}`);
                }
            });

            // Replace organization references
            if (newContent.includes(this.oldOrg)) {
                newContent = newContent.replace(new RegExp(this.oldOrg, 'g'), this.newOrg);
                updated = true;
                this.log(`Updated organization reference in ${filePath}: ${this.oldOrg} → ${this.newOrg}`);
            }

            // Replace specific user references where appropriate
            if (newContent.includes(`github.com/${this.oldUser}/`) && !filePath.includes('make-repos-private')) {
                newContent = newContent.replace(new RegExp(`github\\.com/${this.oldUser}/`, 'g'), `github.com/${this.newOrg}/`);
                updated = true;
                this.log(`Updated GitHub user reference in ${filePath}: ${this.oldUser} → ${this.newOrg}`);
            }

            if (updated) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                this.updatedFiles.push(filePath);
                return true;
            }
            
            return false;
        } catch (error) {
            this.errors.push({ file: filePath, error: error.message });
            this.log(`Error updating ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    updateGitRemotes() {
        this.log('Updating Git remotes...', 'info');
        
        try {
            // Get current remotes
            const remotes = execSync('git remote -v', { encoding: 'utf8' });
            this.log(`Current remotes:\n${remotes}`);

            // Update origin remote if it points to old organization
            if (remotes.includes('github.com/rasa-x-machina/piper-dispatch.git')) {
                execSync('git remote set-url origin https://github.com/rasa-x-machina/piper-dispatch-ecosystem.git');
                this.log('Updated origin remote to rasa-x-machina organization');
            }

            // Update or add rasa-x-machina remote
            if (remotes.includes('rasa-x-machina')) {
                execSync('git remote set-url rasa-x-machina https://github.com/rasa-x-machina/piper-dispatch-special-kit.git');
                this.log('Updated existing rasa-x-machina remote');
            } else {
                execSync('git remote add rasa-x-machina https://github.com/rasa-x-machina/piper-dispatch-special-kit.git');
                this.log('Added new rasa-x-machina remote');
            }

            // Verify changes
            const updatedRemotes = execSync('git remote -v', { encoding: 'utf8' });
            this.log(`Updated remotes:\n${updatedRemotes}`);
            
        } catch (error) {
            this.log(`Error updating Git remotes: ${error.message}`, 'error');
            this.errors.push({ operation: 'git remotes', error: error.message });
        }
    }

    createMigrationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            oldOrganization: this.oldOrg,
            newOrganization: this.newOrg,
            updatedFiles: this.updatedFiles,
            errors: this.errors,
            summary: {
                totalFilesUpdated: this.updatedFiles.length,
                totalErrors: this.errors.length,
                success: this.errors.length === 0
            }
        };

        const reportPath = path.join(process.cwd(), 'migration', 'migration_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`Migration report saved to ${reportPath}`);
        
        return report;
    }

    run() {
        this.log('Starting repository migration to rasa-x-machina organization...', 'info');
        
        // Create migration directory
        const migrationDir = path.join(process.cwd(), 'migration');
        if (!fs.existsSync(migrationDir)) {
            fs.mkdirSync(migrationDir, { recursive: true });
        }

        // Find all relevant files
        this.log('Scanning for files to update...', 'info');
        const files = this.findFiles(process.cwd(), this.filePatterns);
        this.log(`Found ${files.length} files to analyze`);

        // Update file contents
        let updatedCount = 0;
        files.forEach(filePath => {
            if (this.updateFileContent(filePath)) {
                updatedCount++;
            }
        });

        this.log(`Updated ${updatedCount} files`, 'success');

        // Update Git remotes
        this.updateGitRemotes();

        // Generate report
        const report = this.createMigrationReport();
        
        if (report.summary.success) {
            this.log('Migration completed successfully!', 'success');
        } else {
            this.log(`Migration completed with ${report.summary.totalErrors} errors`, 'warning');
        }

        return report;
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    const migrator = new RepositoryMigrator();
    migrator.run();
}

module.exports = RepositoryMigrator;