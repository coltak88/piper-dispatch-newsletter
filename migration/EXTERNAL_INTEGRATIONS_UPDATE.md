# 🔗 External Integrations Update Guide

## Overview
This document outlines the external integrations that need to be updated after migrating from ask-polestar to rasa-x-machina organization.

## Repository Information
- **New Organization**: rasa-x-machina
- **New Repository**: piper-dispatch-newsletter
- **New Repository URL**: https://github.com/coltak88/piper-dispatch-newsletter

## Integrations Requiring Updates

### 1. GitHub Services

#### GitHub Pages
- **Status**: ✅ Configured via GitHub Actions
- **Domain**: https://rasa-x-machina.github.io/piper-dispatch-newsletter
- **Configuration**: Set in `.github/workflows/deploy.yml`
- **Action Required**: Verify custom domain if applicable

#### GitHub API Integrations
- **Old Endpoint**: `https://api.github.com/repos/ask-polestar/*`
- **New Endpoint**: `https://api.github.com/repos/coltak88/piper-dispatch-newsletter`
- **Files to Update**:
  - `src/services/githubService.js`
  - `src/config/github.js`
  - Any API integration scripts

### 2. CI/CD Services

#### GitHub Actions
- **Status**: ✅ Migrated and configured
- **Workflow Files**: `.github/workflows/`
- **Secrets Required**:
  - `GITHUB_TOKEN` (auto-generated)
  - `DEPLOY_KEY` or `PERSONAL_ACCESS_TOKEN`
  - Environment-specific variables

#### External CI/CD Platforms
If using external services (Travis CI, CircleCI, Jenkins):
- Update repository URLs in configuration files
- Regenerate deployment keys
- Update webhook URLs

### 3. Package Registries

#### npm Registry
- **Package Names**: Update scoped packages if applicable
- **Registry URLs**: Verify npm registry configurations
- **Authentication**: Update npm tokens if required

#### Other Registries
- Docker Hub: Update image references
- GitHub Packages: Update package URLs
- Private registries: Update authentication tokens

### 4. Third-Party Services

#### Analytics Services
- **Google Analytics**: Update tracking codes
- **Mixpanel**: Update project tokens
- **Custom Analytics**: Update endpoint URLs

#### Monitoring Services
- **Sentry**: Update DSN URLs
- **New Relic**: Update application IDs
- **Datadog**: Update API keys

#### Communication Services
- **Slack**: Update webhook URLs
- **Discord**: Update bot configurations
- **Email Services**: Update SMTP settings

### 5. API Integrations

#### External APIs
Update base URLs in:
- `src/config/api.js`
- `src/services/externalApi.js`
- Environment configuration files

#### Webhook Endpoints
- Update webhook URLs in external services
- Regenerate webhook secrets
- Test webhook functionality

## Update Checklist

### Immediate Actions (High Priority)
- [ ] Update GitHub API references
- [ ] Verify GitHub Actions workflows
- [ ] Update deployment configurations
- [ ] Test build and deployment processes

### Short-term Actions (Medium Priority)
- [ ] Update external CI/CD configurations
- [ ] Verify package registry settings
- [ ] Update monitoring service configurations
- [ ] Test external API integrations

### Long-term Actions (Low Priority)
- [ ] Update analytics tracking codes
- [ ] Verify communication service integrations
- [ ] Test webhook functionality
- [ ] Document all integration changes

## Configuration Files to Update

### Environment Variables
```bash
# Update in .env.production and GitHub Secrets
GITHUB_OWNER=coltak88
GITHUB_REPO=piper-dispatch-newsletter
REPOSITORY_URL=https://github.com/coltak88/piper-dispatch-newsletter
API_BASE_URL=https://api.github.com/repos/coltak88/piper-dispatch-newsletter
```

### Package Configuration
```json
// Update in package.json files
{
  "repository": {
    "type": "git",
    "url": "https://github.com/coltak88/piper-dispatch-newsletter.git"
  },
  "bugs": {
    "url": "https://github.com/coltak88/piper-dispatch-newsletter/issues"
  },
  "homepage": "https://rasa-x-machina.github.io/piper-dispatch-newsletter"
}
```

### Service Configuration
```javascript
// Update in service configuration files
const config = {
  github: {
    owner: 'coltak88',
    repo: 'piper-dispatch-newsletter',
    apiUrl: 'https://api.github.com/repos/coltak88/piper-dispatch-newsletter'
  }
};
```

## Testing Integration Updates

### 1. GitHub Integration Test
```bash
# Test GitHub API connectivity
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/coltak88/piper-dispatch-newsletter
```

### 2. Build and Deployment Test
```bash
# Test the complete build and deployment process
npm run build
npm run deploy
```

### 3. External Service Test
```bash
# Test external API integrations
npm run test:integration
# or
npm run test:external
```

## Rollback Plan

If integration updates cause issues:
1. **Immediate Rollback**:
   - Revert to previous configuration
   - Use backup environment variables
   - Restore old repository references

2. **Gradual Rollback**:
   - Update one integration at a time
   - Test each integration separately
   - Maintain parallel configurations during transition

## Support and Resources

### Documentation
- [POST_MIGRATION_CHECKLIST.md](./POST_MIGRATION_CHECKLIST.md)
- [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
- [setup_deployment_env.sh](./setup_deployment_env.sh)

### GitHub Resources
- Repository: https://github.com/coltak88/piper-dispatch-newsletter
- Issues: https://github.com/coltak88/piper-dispatch-newsletter/issues
- Actions: https://github.com/coltak88/piper-dispatch-newsletter/actions

### External Service Documentation
- GitHub API: https://docs.github.com/en/rest
- GitHub Actions: https://docs.github.com/en/actions
- GitHub Pages: https://docs.github.com/en/pages

## Success Criteria

✅ **Integration Updates Successful When**:
- All GitHub services work correctly
- CI/CD pipelines run without errors
- External APIs respond correctly
- Monitoring services receive data
- Deployment processes complete successfully

⚠️ **Warning Signs**:
- Failed GitHub Actions workflows
- External service authentication errors
- Missing data in analytics/monitoring
- Broken API integrations
- Deployment failures

## Next Steps
1. Complete integration updates
2. Test all external services
3. Archive old repository
4. Monitor application performance
5. Document any additional issues