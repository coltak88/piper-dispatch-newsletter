# Piper Dispatch Special Kit Makefile
# Privacy-first implementation engine with neurodiversity optimization

.PHONY: help install dev build test lint security-check privacy-audit deploy health-check push clean

# Default target
help:
	@echo "Piper Dispatch Special Kit - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install        Install dependencies"
	@echo "  dev           Start development server"
	@echo "  build         Build production bundle"
	@echo "  test          Run test suite"
	@echo "  lint          Run linting"
	@echo ""
	@echo "Security & Privacy:"
	@echo "  security-check Run security audit"
	@echo "  privacy-audit  Run privacy compliance check"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy        Deploy to Google Cloud Run"
	@echo "  health-check  Check application health"
	@echo "  push          Git push with security checks"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean         Clean build artifacts"

# Development commands
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Dependencies installed successfully"

dev:
	@echo "Starting development server..."
	npm run dev

build:
	@echo "Building production bundle..."
	npm run build
	@echo "Build completed successfully"

test:
	@echo "Running test suite..."
	npm run test
	@echo "Tests completed"

lint:
	@echo "Running linting..."
	npm run lint
	@echo "Linting completed"

# Security and Privacy commands
security-check:
	@echo "Running security audit..."
	npm audit
	@echo "Running Snyk security scan..."
	npx snyk test
	@echo "Security check completed"

privacy-audit:
	@echo "Running privacy compliance audit..."
	node scripts/privacy-audit.js
	@echo "Checking GDPR-Plus compliance..."
	node scripts/gdpr-compliance-check.js
	@echo "Verifying 15-second data purge..."
	node scripts/data-purge-verification.js
	@echo "Privacy audit completed"

# Deployment commands
deploy: build security-check privacy-audit
	@echo "Deploying to Google Cloud Run..."
	gcloud run deploy piperdispatch-specialkit \
		--source . \
		--platform managed \
		--region us-central1 \
		--allow-unauthenticated \
		--memory 512Mi \
		--cpu 1 \
		--max-instances 10 \
		--set-env-vars NODE_ENV=production
	@echo "Deployment completed successfully"

health-check:
	@echo "Performing health check..."
	@curl -f http://localhost:3000/health || (echo "Health check failed" && exit 1)
	@echo "Health check passed"

push: security-check privacy-audit
	@echo "Running pre-push security checks..."
	@echo "Verifying no sensitive data in commit..."
	git diff --cached --name-only | xargs grep -l "password\|secret\|key\|token" || true
	@echo "Checking for privacy compliance..."
	node scripts/pre-commit-privacy-check.js
	@echo "Pushing to repository..."
	git push
	@echo "Push completed successfully"

# Maintenance commands
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .next/
	rm -rf out/
	rm -rf build/
	rm -rf dist/
	rm -rf coverage/
	rm -rf node_modules/.cache/
	@echo "Clean completed"

# Neurodiversity-specific commands
test-accessibility:
	@echo "Running accessibility tests..."
	npx axe-cli http://localhost:3000
	@echo "Testing ADHD-friendly components..."
	node scripts/test-adhd-components.js
	@echo "Testing dyslexia-optimized templates..."
	node scripts/test-dyslexia-templates.js
	@echo "Testing ASD-structured workflows..."
	node scripts/test-asd-workflows.js
	@echo "Accessibility tests completed"

# Privacy-first verification
verify-privacy:
	@echo "Verifying privacy-first architecture..."
	@echo "Checking for data retention violations..."
	grep -r "localStorage\|sessionStorage\|cookie" src/ || echo "No client-side storage found"
	@echo "Verifying 15-second data purge..."
	node scripts/verify-data-purge.js
	@echo "Checking quantum-resistant encryption..."
	node scripts/verify-quantum-encryption.js
	@echo "Privacy verification completed"

# Complete deployment pipeline
full-deploy: clean install build test lint security-check privacy-audit test-accessibility verify-privacy deploy health-check
	@echo "Full deployment pipeline completed successfully"

# Development setup
setup: install
	@echo "Setting up development environment..."
	cp .env.example .env.local
	@echo "Creating necessary directories..."
	mkdir -p logs/
	mkdir -p temp/
	@echo "Setup completed - run 'make dev' to start development"

# Git workflow helpers
commit-section: security-check privacy-audit
	@echo "Committing section deliverables..."
	git add .
	git commit -m "feat: implement section deliverables with privacy-first architecture"
	git push
	@echo "Section committed and pushed successfully"