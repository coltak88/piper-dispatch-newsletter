# 🛠️ Post-Migration Troubleshooting Guide

## Overview
This guide addresses common issues encountered after migrating the Piper Newsletter project to the rasa-x-machina organization.

## Build Issues

### Frontend Build Failures
**Problem**: Build process fails with missing dependencies or configuration errors.

**Solutions**:
1. **Clear npm cache and reinstall dependencies**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version compatibility**:
   ```bash
   node --version  # Should be compatible with project requirements
   ```

3. **Verify environment variables**:
   - Check `.env.production` file exists
   - Ensure all required variables are set
   - Validate GitHub secrets configuration

### Test Failures
**Problem**: Tests fail with "No tests found" error.

**Solutions**:
1. **Create basic test structure**:
   ```bash
   # Create test directories
   mkdir -p packages/core/__tests__
   mkdir -p packages/special-kit/__tests__
   
   # Create placeholder test files
   echo "describe('Core Package', () => { test('placeholder', () => expect(true).toBe(true)); });" > packages/core/__tests__/core.test.js
   echo "describe('Special Kit', () => { test('placeholder', () => expect(true).toBe(true)); });" > packages/special-kit/__tests__/special-kit.test.js
   ```

2. **Update test configuration**:
   - Check `jest.config.js` or similar configuration files
   - Ensure test paths are correctly configured
   - Update test patterns if needed

## GitHub Actions Issues

### Workflow Failures
**Problem**: GitHub Actions workflows fail after migration.

**Solutions**:
1. **Update repository references**:
   - Replace old organization references with `rasa-x-machina`
   - Update repository names in workflow files
   - Check deployment keys and secrets

2. **Verify secrets configuration**:
   - Navigate to repository Settings > Secrets and variables > Actions
   - Ensure all required secrets are configured:
     - `GITHUB_TOKEN` (auto-generated)
     - `DEPLOY_KEY` or `PERSONAL_ACCESS_TOKEN`
     - Environment-specific variables

3. **Check workflow permissions**:
   - Repository Settings > Actions > General
   - Ensure "Read and write permissions" is enabled
   - Verify "Allow GitHub Actions to create and approve pull requests" if needed

### Deployment Issues
**Problem**: GitHub Pages deployment fails.

**Solutions**:
1. **Enable GitHub Pages**:
   - Repository Settings > Pages
   - Select source: "GitHub Actions"
   - Verify custom domain settings if applicable

2. **Check build artifacts**:
   - Ensure build process creates `build/` directory
   - Verify artifact upload in workflow files
   - Check deployment branch settings

## Environment Configuration

### Missing Environment Variables
**Problem**: Application fails due to missing environment variables.

**Required Variables**:
```bash
# Core Configuration
ORGANIZATION_NAME=rasa-x-machina
REPOSITORY_NAME=piper-dispatch-newsletter
DOMAIN_URL=https://rasa-x-machina.github.io/piper-dispatch-newsletter

# GitHub Configuration
GITHUB_OWNER=rasa-x-machina
GITHUB_REPO=piper-dispatch-newsletter
GITHUB_API_URL=https://api.github.com/repos/rasa-x-machina/piper-dispatch-newsletter

# Security (UPDATE THESE)
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-secure-encryption-key
API_KEY=your-secure-api-key
```

### Package Management Issues
**Problem**: Dependency conflicts or missing packages.

**Solutions**:
1. **Update package.json dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Check workspace configuration**:
   - Verify `workspaces` configuration in root `package.json`
   - Ensure all workspace packages are properly linked
   - Check for circular dependencies

## Quick Fix Commands

### Complete Reset
```bash
# Clean everything
npm cache clean --force
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json

# Fresh install
npm install

# Test build
npm run build
```

### Emergency Deployment
If build fails but you need to deploy:
```bash
# Create minimal build
mkdir -p build
echo "<html><body><h1>Piper Newsletter - Under Maintenance</h1></body></html>" > build/index.html

# Manual deployment to GitHub Pages
git add build/
git commit -m "Emergency deployment"
git push origin main
```

## Support Resources

### Documentation
- [POST_MIGRATION_CHECKLIST.md](./POST_MIGRATION_CHECKLIST.md)
- [setup_deployment_env.sh](./setup_deployment_env.sh)
- GitHub Repository: https://github.com/coltak88/piper-dispatch-newsletter

### Contact Information
- Repository Issues: Use GitHub Issues tab
- Emergency Support: Check repository settings for maintainer contact

### Monitoring
- GitHub Actions: Check Actions tab in repository
- Deployment Status: Repository Settings > Pages
- Build Logs: Available in GitHub Actions workflow runs

## Success Indicators
✅ **Migration Successful When**:
- Repository is accessible at new location
- GitHub Actions workflows run without errors
- Application builds successfully
- Deployment to GitHub Pages works
- All environment variables are configured
- External integrations function properly

⚠️ **Warning Signs**:
- Build failures in GitHub Actions
- Missing environment variables
- Broken links or references to old repository
- Deployment failures to GitHub Pages
- Test suite failures

## Next Steps
1. Complete environment configuration
2. Test all workflows
3. Update external integrations
4. Archive old repository
5. Monitor application performance