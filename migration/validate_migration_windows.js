#!/usr/bin/env node

/**
 * Windows-Compatible Migration Validation Script
 * Validates the migration from ask-polestar to rasa-x-machina organization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WindowsMigrationValidator {
    constructor() {
        this.validationResults = {
            passed: [],
            failed: [],
            warnings: []
        };
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

    // Windows-compatible file search
    searchFiles(directory, pattern) {
        const results = [];
        
        function walkDir(dir) {
            try {
                const items = fs.readdirSync(dir);
                
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        // Skip common ignore directories
                        if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'migration'].includes(item)) {
                            walkDir(fullPath);
                        }
                    } else {
                        // Check if file matches pattern
                        if (fullPath.includes(pattern) || item.includes(pattern)) {
                            results.push(fullPath);
                        }
                    }
                });
            } catch (error) {
                // Silently continue if directory can't be read
            }
        }
        
        walkDir(directory);
        return results;
    }

    // Windows-compatible content search
    searchContent(directory, searchTerm) {
        const results = [];
        
        function walkDir(dir) {
            try {
                const items = fs.readdirSync(dir);
                
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        // Skip common ignore directories
                        if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'migration'].includes(item)) {
                            walkDir(fullPath);
                        }
                    } else {
                        // Search in text files only
                        if (item.match(/\.(js|json|md|yml|yaml|txt|sh|bat|ps1)$/)) {
                            try {
                                const content = fs.readFileSync(fullPath, 'utf8');
                                const lines = content.split('\n');
                                
                                lines.forEach((line, index) => {
                                    // Skip comments that mention the old organization
                                    if (line.includes(searchTerm) && !line.trim().startsWith('#') && !line.trim().startsWith('//')) {
                                        results.push({
                                            file: fullPath,
                                            line: index + 1
                                        });
                                    }
                                });
                            } catch (error) {
                                // Skip files that can't be read as text
                            }
                        }
                    }
                });
            } catch (error) {
                // Silently continue if directory can't be read
            }
        }
        
        walkDir(directory);
        return results;
    }

    validateNoOldReferences() {
        this.log('Checking for remaining ask-polestar references...', 'info');
        
        const results = this.searchContent(process.cwd(), 'ask-polestar');
        
        // Filter out the migration check workflow which intentionally contains old references
        const filteredResults = results.filter(result => 
            !result.file.includes('organization-migration.yml')
        );
        
        if (filteredResults.length === 0) {
            this.validationResults.passed.push('No ask-polestar references found');
            this.log('✅ No ask-polestar references found', 'success');
            return true;
        } else {
            this.validationResults.failed.push(`Found ${filteredResults.length} ask-polestar references`);
            filteredResults.forEach(result => {
                this.log(`❌ Found ask-polestar in ${result.file}:${result.line}`, 'error');
            });
            return false;
        }
    }

    validateGitRemotes() {
        this.log('Validating Git remotes...', 'info');
        
        try {
            const gitConfigPath = path.join(process.cwd(), '.git', 'config');
            if (!fs.existsSync(gitConfigPath)) {
                this.validationResults.failed.push('No git config found');
                this.log('❌ No git config found', 'error');
                return false;
            }
            
            const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');
            
            if (gitConfig.includes('rasa-x-machina')) {
                this.validationResults.passed.push('Rasa-x-machina remote configured');
                this.log('✅ Rasa-x-machina remote configured', 'success');
                return true;
            } else {
                this.validationResults.failed.push('Rasa-x-machina remote not found');
                this.log('❌ Rasa-x-machina remote not found', 'error');
                return false;
            }
        } catch (error) {
            this.validationResults.failed.push(`Git validation error: ${error.message}`);
            this.log(`❌ Git validation error: ${error.message}`, 'error');
            return false;
        }
    }

    validatePackageJson() {
        this.log('Validating package.json...', 'info');
        
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            this.validationResults.warnings.push('No package.json found');
            this.log('⚠️ No package.json found', 'warning');
            return true;
        }
        
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            let valid = true;
            
            // Check repository URL
            if (packageJson.repository && packageJson.repository.url) {
                if (packageJson.repository.url.includes('rasa-x-machina')) {
                    this.validationResults.passed.push('Package.json repository URL updated');
                    this.log('✅ Package.json repository URL updated', 'success');
                } else {
                    this.validationResults.failed.push('Package.json repository URL not updated');
                    this.log('❌ Package.json repository URL not updated', 'error');
                    valid = false;
                }
            }
            
            // Check homepage
            if (packageJson.homepage) {
                if (packageJson.homepage.includes('rasa-x-machina')) {
                    this.validationResults.passed.push('Package.json homepage updated');
                    this.log('✅ Package.json homepage updated', 'success');
                } else {
                    this.validationResults.warnings.push('Package.json homepage not updated');
                    this.log('⚠️ Package.json homepage not updated', 'warning');
                }
            }
            
            return valid;
        } catch (error) {
            this.validationResults.failed.push(`Package.json validation error: ${error.message}`);
            this.log(`❌ Package.json validation error: ${error.message}`, 'error');
            return false;
        }
    }

    validateGitHubWorkflows() {
        this.log('Validating GitHub workflows...', 'info');
        
        const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
        if (!fs.existsSync(workflowsDir)) {
            this.validationResults.warnings.push('No GitHub workflows directory found');
            this.log('⚠️ No GitHub workflows directory found', 'warning');
            return true;
        }
        
        const workflowFiles = fs.readdirSync(workflowsDir)
            .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));
        
        let valid = true;
        
        workflowFiles.forEach(file => {
            const filePath = path.join(workflowsDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Skip the migration check workflow as it intentionally contains old references for validation
                if (file === 'organization-migration.yml') {
                    this.validationResults.passed.push(`Migration check workflow ${file} present`);
                    this.log(`✅ Migration check workflow ${file} present`, 'success');
                    return;
                }
                
                if (content.includes('rasa-x-machina')) {
                    this.validationResults.passed.push(`Workflow ${file} updated for rasa-x-machina`);
                    this.log(`✅ Workflow ${file} updated for rasa-x-machina`, 'success');
                } else if (content.includes('ask-polestar')) {
                    this.validationResults.failed.push(`Workflow ${file} still contains ask-polestar references`);
                    this.log(`❌ Workflow ${file} still contains ask-polestar references`, 'error');
                    valid = false;
                }
            } catch (error) {
                this.validationResults.warnings.push(`Could not read workflow ${file}`);
                this.log(`⚠️ Could not read workflow ${file}`, 'warning');
            }
        });
        
        return valid;
    }

    validateNewFiles() {
        this.log('Validating new organization files...', 'info');
        
        const expectedFiles = [
            '.github/workflows/rasa-x-machina-deploy.yml',
            '.github/workflows/organization-migration.yml',
            'deployment/rasa-x-machina-deploy.yml',
            'deployment/.env.rasa-x-machina',
            'deployment/cloudbuild.rasa-x-machina.yml'
        ];
        
        let allFound = true;
        
        expectedFiles.forEach(file => {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                this.validationResults.passed.push(`New file created: ${file}`);
                this.log(`✅ New file created: ${file}`, 'success');
            } else {
                this.validationResults.failed.push(`Missing new file: ${file}`);
                this.log(`❌ Missing new file: ${file}`, 'error');
                allFound = false;
            }
        });
        
        return allFound;
    }

    validateDomainReferences() {
        this.log('Validating domain references...', 'info');
        
        const results = this.searchContent(process.cwd(), 'rasa-x-machina.dev');
        
        if (results.length > 0) {
            this.validationResults.passed.push(`Found ${results.length} rasa-x-machina.dev references`);
            this.log(`✅ Found ${results.length} rasa-x-machina.dev references`, 'success');
            return true;
        } else {
            this.validationResults.warnings.push('No rasa-x-machina.dev references found');
            this.log('⚠️ No rasa-x-machina.dev references found', 'warning');
            return true; // Not a critical failure
        }
    }

    generateValidationReport() {
        this.log('\n📋 Generating Validation Report...', 'header');
        
        const report = {
            timestamp: new Date().toISOString(),
            validationResults: this.validationResults,
            summary: {
                totalPassed: this.validationResults.passed.length,
                totalFailed: this.validationResults.failed.length,
                totalWarnings: this.validationResults.warnings.length,
                success: this.validationResults.failed.length === 0
            }
        };

        const reportPath = path.join(process.cwd(), 'migration', 'windows_validation_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`✅ Validation report saved to ${reportPath}`, 'success');
        return report;
    }

    run() {
        this.log('\n🔍 Running Windows-Compatible Migration Validation...', 'header');
        
        // Run all validation checks
        this.validateNoOldReferences();
        this.validateGitRemotes();
        this.validatePackageJson();
        this.validateGitHubWorkflows();
        this.validateNewFiles();
        this.validateDomainReferences();
        
        // Generate final report
        const report = this.generateValidationReport();
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        this.log('VALIDATION SUMMARY', 'header');
        this.log(`✅ Passed: ${report.summary.totalPassed}`, 'success');
        this.log(`❌ Failed: ${report.summary.totalFailed}`, 'error');
        this.log(`⚠️ Warnings: ${report.summary.totalWarnings}`, 'warning');
        console.log('='.repeat(60));
        
        if (report.summary.success) {
            this.log('🎉 VALIDATION PASSED!', 'success');
            this.log('Your migration to rasa-x-machina is complete!', 'success');
        } else {
            this.log('⚠️ VALIDATION FAILED', 'error');
            this.log('Please review the failed checks above', 'error');
        }
        
        return report.summary.success;
    }
}

// Run the validation if this script is executed directly
if (require.main === module) {
    const validator = new WindowsMigrationValidator();
    validator.run();
}

module.exports = WindowsMigrationValidator;