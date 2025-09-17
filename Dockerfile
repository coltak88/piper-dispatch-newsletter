# Piper Dispatch Newsletter - Production Dockerfile
# Multi-stage build for optimized production deployment
# Features: React app, quantum security, privacy-first architecture

# Stage 1: Build environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && npm install -g npm@latest

# Copy package files
COPY package*.json ./

# Install dependencies with security audit
RUN npm ci --only=production --audit --audit-level=high

# Copy source code
COPY . .

# Build application with optimizations
ENV NODE_ENV=production
ENV REACT_APP_BUILD_MODE=production
ENV REACT_APP_QUANTUM_SECURITY=enabled
ENV REACT_APP_PRIVACY_MODE=gdpr-plus

RUN npm run build

# Stage 2: Production environment
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S piper && \
    adduser -S piper -u 1001 -G piper

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder --chown=piper:piper /app/build /usr/share/nginx/html

# Copy security headers configuration
COPY docker/security-headers.conf /etc/nginx/conf.d/security-headers.conf

# Create necessary directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R piper:piper /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Switch to non-root user
USER piper

# Expose port
EXPOSE 8080

# Labels for metadata
LABEL maintainer="Piper Dispatch Team" \
      version="1.0.0" \
      description="Piper Dispatch Newsletter - Privacy-First Publication System" \
      security.quantum="CRYSTALS-Kyber" \
      privacy.compliance="GDPR-Plus" \
      accessibility.wcag="2.1-AA"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]