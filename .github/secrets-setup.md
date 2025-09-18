# GitHub Secrets Setup for GCP Deployment

This repository requires the following secrets to be configured in GitHub for automated deployment to Google Cloud Run:

## Required Secrets

### GCP_SA_KEY
The service account key JSON content for the `github-actions-piper` service account.

**To set this up:**
1. Go to your repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Name: `GCP_SA_KEY`
4. Value: Copy the entire content of `github-actions-key.json` file

### Note
The `GCP_PROJECT_ID` is already configured in the workflow as an environment variable set to `sarvajaya-genesis-protocol`.

## Service Account Permissions
The service account has been granted the following roles:
- `roles/run.admin` - For Cloud Run deployment
- `roles/storage.admin` - For Container Registry access
- `roles/iam.serviceAccountUser` - For service account usage

## Next Steps
1. Set up the `GCP_SA_KEY` secret in GitHub
2. Trigger a deployment by pushing to main branch or manually running the workflow
3. Monitor the deployment in GitHub Actions and Google Cloud Console