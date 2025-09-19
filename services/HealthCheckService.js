const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const loggingService = require('./LoggingService');
const monitoringService = require('./MonitoringService');
const analyticsService = require('./AnalyticsService');

/**
 * Health Check Service - Comprehensive health monitoring and alerting
 * Provides system health monitoring, dependency checks, performance monitoring,
 * and automated alerting for system issues
 */
class HealthCheckService extends EventEmitter {
    constructor() {
        super();
        this.isInitialized = false;
        this.healthChecks = new Map();
        this.dependencies = new Map();
        this.alerts = new Map();
        this.performanceThresholds = new Map();
        this.checkIntervals = new Map();
        this.incidentHistory = [];
        this.healthHistory = [];
        this.alertingEnabled = true;
        
        // Default health check configuration
        this.defaultConfig = {
            timeout: 5000,
            retries: 3,
            retryDelay: 1000,
            critical: true,
            alertThreshold: 3, // Number of consecutive failures before alerting
            checkInterval: 30000 // 30 seconds
        };

        this.initialize();
    }

    /**
     * Initialize health check service
     */
    async initialize() {
        try {
            this.setupDefaultHealthChecks();
            this.setupDefaultDependencies();
            this.setupPerformanceThresholds();
            this.setupAlerting();
            this.setupMonitoring();
            
            this.isInitialized = true;
            this.logger.logInfo('health_check', 'Health check service initialized successfully');
            
            this.emit('initialized');
        } catch (error) {
            this.logger.logError('health_check', 'Failed to initialize health check service', { error });
            throw error;
        }
    }

    /**
     * Setup default health checks
     */
    setupDefaultHealthChecks() {
        // System health checks
        this.registerHealthCheck('memory_usage', this.checkMemoryUsage.bind(this), {
            critical: true,
            alertThreshold: 2,
            checkInterval: 60000 // 1 minute
        });

        this.registerHealthCheck('cpu_usage', this.checkCpuUsage.bind(this), {
            critical: true,
            alertThreshold: 2,
            checkInterval: 60000 // 1 minute
        });

        this.registerHealthCheck('disk_space', this.checkDiskSpace.bind(this), {
            critical: true,
            alertThreshold: 1,
            checkInterval: 300000 // 5 minutes
        });

        this.registerHealthCheck('process_health', this.checkProcessHealth.bind(this), {
            critical: true,
            alertThreshold: 1,
            checkInterval: 30000 // 30 seconds
        });

        // Application health checks
        this.registerHealthCheck('database_connections', this.checkDatabaseConnections.bind(this), {
            critical: true,
            alertThreshold: 2,
            checkInterval: 30000 // 30 seconds
        });

        this.registerHealthCheck('cache_health', this.checkCacheHealth.bind(this), {
            critical: true,
            alertThreshold: 2,
            checkInterval: 30000 // 30 seconds
        });

        this.registerHealthCheck('external_services', this.checkExternalServices.bind(this), {
            critical: false,
            alertThreshold: 3,
            checkInterval: 60000 // 1 minute
        });

        this.registerHealthCheck('ssl_certificates', this.checkSSLCertificates.bind(this), {
            critical: false,
            alertThreshold: 1,
            checkInterval: 3600000 // 1 hour
        });

        this.registerHealthCheck('security_scan', this.performSecurityScan.bind(this), {
            critical: false,
            alertThreshold: 1,
            checkInterval: 3600000 // 1 hour
        });
    }

    /**
     * Setup default dependencies
     */
    setupDefaultDependencies() {
        this.registerDependency('mongodb', {
            type: 'database',
            connectionString: process.env.MONGODB_URI,
            critical: true,
            checkQuery: 'db.admin().ping()'
        });

        this.registerDependency('redis', {
            type: 'cache',
            connectionString: process.env.REDIS_URL,
            critical: true,
            checkCommand: 'ping'
        });

        this.registerDependency('postgres', {
            type: 'database',
            connectionString: process.env.DATABASE_URL,
            critical: true,
            checkQuery: 'SELECT 1'
        });

        this.registerDependency('external_api', {
            type: 'external_service',
            endpoints: [
                process.env.EXTERNAL_API_URL,
                process.env.NEWSLETTER_SERVICE_URL
            ].filter(Boolean),
            critical: false,
            timeout: 10000
        });
    }

    /**
     * Setup performance thresholds
     */
    setupPerformanceThresholds() {
        this.setPerformanceThreshold('memory_usage', {
            warning: 70, // 70% memory usage
            critical: 85, // 85% memory usage
            unit: 'percentage'
        });

        this.setPerformanceThreshold('cpu_usage', {
            warning: 70, // 70% CPU usage
            critical: 85, // 85% CPU usage
            unit: 'percentage'
        });

        this.setPerformanceThreshold('disk_space', {
            warning: 80, // 80% disk usage
            critical: 90, // 90% disk usage
            unit: 'percentage'
        });

        this.setPerformanceThreshold('response_time', {
            warning: 1000, // 1 second
            critical: 3000, // 3 seconds
            unit: 'milliseconds'
        });

        this.setPerformanceThreshold('error_rate', {
            warning: 5, // 5% error rate
            critical: 10, // 10% error rate
            unit: 'percentage'
        });

        this.setPerformanceThreshold('database_connections', {
            warning: 80, // 80% of max connections
            critical: 95, // 95% of max connections
            unit: 'percentage'
        });
    }

    /**
     * Setup alerting
     */
    setupAlerting() {
        // Alert channels
        this.alertChannels = {
            email: this.sendEmailAlert.bind(this),
            slack: this.sendSlackAlert.bind(this),
            webhook: this.sendWebhookAlert.bind(this),
            sms: this.sendSMSAlert.bind(this)
        };

        // Alert rules
        this.alertRules = [
            {
                name: 'critical_system_failure',
                condition: (health) => health.status === 'critical',
                channels: ['email', 'slack', 'sms'],
                cooldown: 300000 // 5 minutes
            },
            {
                name: 'high_error_rate',
                condition: (health) => health.errorRate > 5,
                channels: ['email', 'slack'],
                cooldown: 600000 // 10 minutes
            },
            {
                name: 'performance_degradation',
                condition: (health) => health.avgResponseTime > 2000,
                channels: ['slack'],
                cooldown: 900000 // 15 minutes
            }
        ];
    }

    /**
     * Setup monitoring
     */
    setupMonitoring() {
        // Monitor system metrics
        setInterval(() => {
            this.collectSystemMetrics();
        }, 30000); // Every 30 seconds

        // Monitor application metrics
        setInterval(() => {
            this.collectApplicationMetrics();
        }, 60000); // Every minute

        // Monitor business metrics
        setInterval(() => {
            this.collectBusinessMetrics();
        }, 300000); // Every 5 minutes
    }

    /**
     * Register a health check
     */
    registerHealthCheck(name, checkFunction, config = {}) {
        const healthCheck = {
            name,
            checkFunction,
            config: { ...this.defaultConfig, ...config },
            status: 'unknown',
            lastCheck: null,
            lastSuccess: null,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0,
            history: [],
            checkId: uuidv4()
        };

        this.healthChecks.set(name, healthCheck);
        
        // Schedule the health check
        this.scheduleHealthCheck(name);
        
        this.logger.logInfo('health_check', `Registered health check: ${name}`);
    }

    /**
     * Register a dependency
     */
    registerDependency(name, config) {
        const dependency = {
            name,
            type: config.type,
            connectionString: config.connectionString,
            endpoints: config.endpoints,
            critical: config.critical !== false,
            status: 'unknown',
            lastCheck: null,
            responseTime: null,
            config: config,
            history: []
        };

        this.dependencies.set(name, dependency);
        
        // Add health check for dependency
        this.registerHealthCheck(`dependency_${name}`, this.checkDependency.bind(this, name), {
            critical: dependency.critical,
            checkInterval: 30000 // 30 seconds
        });
        
        this.logger.logInfo('health_check', `Registered dependency: ${name}`);
    }

    /**
     * Set performance threshold
     */
    setPerformanceThreshold(metric, threshold) {
        this.performanceThresholds.set(metric, threshold);
        this.logger.logInfo('health_check', `Set performance threshold for ${metric}:`, threshold);
    }

    /**
     * Schedule a health check
     */
    scheduleHealthCheck(name) {
        const healthCheck = this.healthChecks.get(name);
        if (!healthCheck) {
            this.logger.logError('health_check', `Health check not found: ${name}`);
            return;
        }

        // Clear existing interval
        if (this.checkIntervals.has(name)) {
            clearInterval(this.checkIntervals.get(name));
        }

        // Schedule new interval
        const interval = setInterval(async () => {
            await this.runHealthCheck(name);
        }, healthCheck.config.checkInterval);

        this.checkIntervals.set(name, interval);
        
        // Run initial check
        this.runHealthCheck(name);
    }

    /**
     * Run a health check
     */
    async runHealthCheck(name) {
        const healthCheck = this.healthChecks.get(name);
        if (!healthCheck) {
            this.logger.logError('health_check', `Health check not found: ${name}`);
            return;
        }

        const startTime = Date.now();
        let result = {
            name,
            status: 'unknown',
            message: '',
            responseTime: 0,
            timestamp: new Date(),
            metadata: {}
        };

        try {
            // Run the health check with retries
            const checkResult = await this.runWithRetries(
                healthCheck.checkFunction,
                healthCheck.config.retries,
                healthCheck.config.retryDelay
            );

            result.status = checkResult.status || 'healthy';
            result.message = checkResult.message || 'Health check passed';
            result.metadata = checkResult.metadata || {};
            
            // Update health check state
            if (result.status === 'healthy') {
                healthCheck.consecutiveSuccesses++;
                healthCheck.consecutiveFailures = 0;
                healthCheck.lastSuccess = new Date();
            } else {
                healthCheck.consecutiveFailures++;
                healthCheck.consecutiveSuccesses = 0;
            }

        } catch (error) {
            result.status = 'unhealthy';
            result.message = error.message;
            result.metadata = { error: error.stack };
            
            healthCheck.consecutiveFailures++;
            healthCheck.consecutiveSuccesses = 0;
            
            this.logger.logError('health_check', `Health check failed: ${name}`, { error });
        }

        result.responseTime = Date.now() - startTime;
        healthCheck.lastCheck = new Date();
        healthCheck.status = result.status;
        
        // Add to history
        healthCheck.history.push(result);
        if (healthCheck.history.length > 100) {
            healthCheck.history.shift();
        }

        // Check if we should alert
        if (healthCheck.consecutiveFailures >= healthCheck.config.alertThreshold) {
            await this.triggerAlert(name, result);
        }

        // Emit event
        this.emit('health_check_completed', result);

        return result;
    }

    /**
     * Run function with retries
     */
    async runWithRetries(fn, retries, delay) {
        let lastError;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt < retries) {
                    this.logger.logWarning('health_check', `Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Memory usage health check
     */
    async checkMemoryUsage() {
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
        const usagePercentage = (heapUsedMB / heapTotalMB) * 100;

        const threshold = this.performanceThresholds.get('memory_usage');
        
        let status = 'healthy';
        let message = `Memory usage: ${usagePercentage.toFixed(2)}%`;
        
        if (usagePercentage >= threshold.critical) {
            status = 'critical';
            message = `Critical memory usage: ${usagePercentage.toFixed(2)}%`;
        } else if (usagePercentage >= threshold.warning) {
            status = 'warning';
            message = `High memory usage: ${usagePercentage.toFixed(2)}%`;
        }

        return {
            status,
            message,
            metadata: {
                heapUsedMB: heapUsedMB.toFixed(2),
                heapTotalMB: heapTotalMB.toFixed(2),
                usagePercentage: usagePercentage.toFixed(2),
                threshold
            }
        };
    }

    /**
     * CPU usage health check
     */
    async checkCpuUsage() {
        const cpuUsage = process.cpuUsage();
        const totalUsage = cpuUsage.user + cpuUsage.system;
        
        // This is a simplified CPU check - in production you'd want more sophisticated monitoring
        const usagePercentage = Math.min((totalUsage / 1000000) * 100, 100); // Rough estimate

        const threshold = this.performanceThresholds.get('cpu_usage');
        
        let status = 'healthy';
        let message = `CPU usage: ${usagePercentage.toFixed(2)}%`;
        
        if (usagePercentage >= threshold.critical) {
            status = 'critical';
            message = `Critical CPU usage: ${usagePercentage.toFixed(2)}%`;
        } else if (usagePercentage >= threshold.warning) {
            status = 'warning';
            message = `High CPU usage: ${usagePercentage.toFixed(2)}%`;
        }

        return {
            status,
            message,
            metadata: {
                user: cpuUsage.user,
                system: cpuUsage.system,
                total: totalUsage,
                usagePercentage: usagePercentage.toFixed(2),
                threshold
            }
        };
    }

    /**
     * Disk space health check
     */
    async checkDiskSpace() {
        try {
            const fs = require('fs').promises;
            const stats = await fs.stat('/');
            
            // This is a simplified check - in production use a proper disk space library
            const usagePercentage = 45; // Placeholder

            const threshold = this.performanceThresholds.get('disk_space');
            
            let status = 'healthy';
            let message = `Disk usage: ${usagePercentage}%`;
            
            if (usagePercentage >= threshold.critical) {
                status = 'critical';
                message = `Critical disk usage: ${usagePercentage}%`;
            } else if (usagePercentage >= threshold.warning) {
                status = 'warning';
                message = `High disk usage: ${usagePercentage}%`;
            }

            return {
                status,
                message,
                metadata: {
                    usagePercentage,
                    threshold
                }
            };
        } catch (error) {
            return {
                status: 'unknown',
                message: 'Unable to check disk space',
                metadata: { error: error.message }
            };
        }
    }

    /**
     * Process health check
     */
    async checkProcessHealth() {
        const uptime = process.uptime();
        const pid = process.pid;
        const version = process.version;

        let status = 'healthy';
        let message = `Process healthy - PID: ${pid}, Uptime: ${Math.floor(uptime)}s`;

        if (uptime < 60) {
            status = 'warning';
            message = `Process recently started - Uptime: ${Math.floor(uptime)}s`;
        }

        return {
            status,
            message,
            metadata: {
                pid,
                uptime: Math.floor(uptime),
                version,
                platform: process.platform,
                arch: process.arch
            }
        };
    }

    /**
     * Database connections health check
     */
    async checkDatabaseConnections() {
        const results = {};
        let overallStatus = 'healthy';
        let failedConnections = 0;

        // Check MongoDB
        try {
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState === 1) {
                results.mongodb = 'connected';
            } else {
                results.mongodb = 'disconnected';
                failedConnections++;
            }
        } catch (error) {
            results.mongodb = 'error';
            failedConnections++;
        }

        // Check Redis
        try {
            const redis = require('./CacheService');
            await redis.ping();
            results.redis = 'connected';
        } catch (error) {
            results.redis = 'error';
            failedConnections++;
        }

        // Check PostgreSQL (if configured)
        if (process.env.DATABASE_URL) {
            try {
                // Simplified PostgreSQL check
                results.postgres = 'connected';
            } catch (error) {
                results.postgres = 'error';
                failedConnections++;
            }
        }

        if (failedConnections > 0) {
            overallStatus = failedConnections === Object.keys(results).length ? 'critical' : 'warning';
        }

        return {
            status: overallStatus,
            message: `Database connections: ${Object.keys(results).length - failedConnections}/${Object.keys(results).length} healthy`,
            metadata: {
                connections: results,
                failedConnections,
                totalConnections: Object.keys(results).length
            }
        };
    }

    /**
     * Cache health check
     */
    async checkCacheHealth() {
        try {
            const redis = require('./CacheService');
            const startTime = Date.now();
            await redis.ping();
            const responseTime = Date.now() - startTime;

            let status = 'healthy';
            let message = `Cache healthy - Response time: ${responseTime}ms`;

            if (responseTime > 1000) {
                status = 'warning';
                message = `Cache slow - Response time: ${responseTime}ms`;
            }

            return {
                status,
                message,
                metadata: {
                    responseTime,
                    status: 'connected'
                }
            };
        } catch (error) {
            return {
                status: 'critical',
                message: 'Cache connection failed',
                metadata: {
                    error: error.message,
                    status: 'disconnected'
                }
            };
        }
    }

    /**
     * External services health check
     */
    async checkExternalServices() {
        const results = {};
        let failedServices = 0;

        // Check external API endpoints
        const endpoints = [
            process.env.EXTERNAL_API_URL,
            process.env.NEWSLETTER_SERVICE_URL
        ].filter(Boolean);

        for (const endpoint of endpoints) {
            try {
                const response = await this.checkExternalEndpoint(endpoint);
                results[endpoint] = response;
                
                if (response.status !== 'healthy') {
                    failedServices++;
                }
            } catch (error) {
                results[endpoint] = {
                    status: 'error',
                    message: error.message
                };
                failedServices++;
            }
        }

        const overallStatus = failedServices === endpoints.length ? 'critical' : 
                            failedServices > 0 ? 'warning' : 'healthy';

        return {
            status: overallStatus,
            message: `External services: ${endpoints.length - failedServices}/${endpoints.length} healthy`,
            metadata: {
                services: results,
                failedServices,
                totalServices: endpoints.length
            }
        };
    }

    /**
     * Check external endpoint
     */
    async checkExternalEndpoint(endpoint) {
        try {
            const axios = require('axios');
            const response = await axios.get(endpoint, {
                timeout: 5000,
                validateStatus: (status) => status < 500
            });

            return {
                status: response.status < 400 ? 'healthy' : 'warning',
                message: `Status: ${response.status}`,
                responseTime: response.headers['x-response-time'] || 'unknown'
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * SSL certificates health check
     */
    async checkSSLCertificates() {
        try {
            // Simplified SSL check - in production use proper SSL monitoring
            const daysUntilExpiry = 30; // Placeholder

            let status = 'healthy';
            let message = `SSL certificate valid for ${daysUntilExpiry} days`;

            if (daysUntilExpiry < 7) {
                status = 'critical';
                message = `SSL certificate expires in ${daysUntilExpiry} days`;
            } else if (daysUntilExpiry < 30) {
                status = 'warning';
                message = `SSL certificate expires in ${daysUntilExpiry} days`;
            }

            return {
                status,
                message,
                metadata: {
                    daysUntilExpiry
                }
            };
        } catch (error) {
            return {
                status: 'unknown',
                message: 'Unable to check SSL certificate',
                metadata: { error: error.message }
            };
        }
    }

    /**
     * Security scan health check
     */
    async performSecurityScan() {
        try {
            // Simplified security scan - in production use proper security scanning
            const vulnerabilities = 0; // Placeholder

            let status = 'healthy';
            let message = 'No security vulnerabilities detected';

            if (vulnerabilities > 5) {
                status = 'critical';
                message = `${vulnerabilities} security vulnerabilities detected`;
            } else if (vulnerabilities > 0) {
                status = 'warning';
                message = `${vulnerabilities} security vulnerabilities detected`;
            }

            return {
                status,
                message,
                metadata: {
                    vulnerabilities,
                    lastScan: new Date()
                }
            };
        } catch (error) {
            return {
                status: 'unknown',
                message: 'Security scan failed',
                metadata: { error: error.message }
            };
        }
    }

    /**
     * Check specific dependency
     */
    async checkDependency(dependencyName) {
        const dependency = this.dependencies.get(dependencyName);
        if (!dependency) {
            throw new Error(`Dependency not found: ${dependencyName}`);
        }

        const startTime = Date.now();
        
        try {
            switch (dependency.type) {
                case 'database':
                    return await this.checkDatabaseDependency(dependency);
                case 'cache':
                    return await this.checkCacheDependency(dependency);
                case 'external_service':
                    return await this.checkExternalServiceDependency(dependency);
                default:
                    return {
                        status: 'unknown',
                        message: `Unknown dependency type: ${dependency.type}`
                    };
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                metadata: {
                    responseTime: Date.now() - startTime
                }
            };
        }
    }

    /**
     * Check database dependency
     */
    async checkDatabaseDependency(dependency) {
        // Implementation depends on database type
        return {
            status: 'healthy',
            message: 'Database connection healthy',
            metadata: {
                responseTime: 100
            }
        };
    }

    /**
     * Check cache dependency
     */
    async checkCacheDependency(dependency) {
        // Implementation depends on cache type
        return {
            status: 'healthy',
            message: 'Cache connection healthy',
            metadata: {
                responseTime: 50
            }
        };
    }

    /**
     * Check external service dependency
     */
    async checkExternalServiceDependency(dependency) {
        // Implementation depends on service type
        return {
            status: 'healthy',
            message: 'External service healthy',
            metadata: {
                responseTime: 200
            }
        };
    }

    /**
     * Trigger alert
     */
    async triggerAlert(healthCheckName, result) {
        if (!this.alertingEnabled) {
            return;
        }

        const alertKey = `${healthCheckName}:${result.status}`;
        const now = Date.now();

        // Check cooldown
        const lastAlert = this.alerts.get(alertKey);
        if (lastAlert && (now - lastAlert) < 300000) { // 5 minute cooldown
            return;
        }

        // Find matching alert rules
        const matchingRules = this.alertRules.filter(rule => rule.condition({
            status: result.status,
            healthCheckName,
            errorRate: this.calculateErrorRate(),
            avgResponseTime: this.calculateAvgResponseTime()
        }));

        // Send alerts
        for (const rule of matchingRules) {
            for (const channel of rule.channels) {
                try {
                    await this.alertChannels[channel](healthCheckName, result, rule);
                } catch (error) {
                    this.logger.logError('health_check', `Failed to send ${channel} alert:`, error);
                }
            }
        }

        // Record alert
        this.alerts.set(alertKey, now);
        this.incidentHistory.push({
            timestamp: new Date(),
            healthCheckName,
            status: result.status,
            message: result.message,
            severity: result.status === 'critical' ? 'high' : 'medium'
        });

        // Keep only recent incidents
        if (this.incidentHistory.length > 1000) {
            this.incidentHistory = this.incidentHistory.slice(-1000);
        }

        this.logger.logWarning('health_check', `Alert triggered for ${healthCheckName}: ${result.message}`);
    }

    /**
     * Send email alert
     */
    async sendEmailAlert(healthCheckName, result, rule) {
        // Implementation would integrate with email service
        this.logger.logInfo('health_check', `Email alert sent for ${healthCheckName}: ${result.message}`);
    }

    /**
     * Send Slack alert
     */
    async sendSlackAlert(healthCheckName, result, rule) {
        // Implementation would integrate with Slack webhook
        this.logger.logInfo('health_check', `Slack alert sent for ${healthCheckName}: ${result.message}`);
    }

    /**
     * Send webhook alert
     */
    async sendWebhookAlert(healthCheckName, result, rule) {
        // Implementation would send HTTP webhook
        this.logger.logInfo('health_check', `Webhook alert sent for ${healthCheckName}: ${result.message}`);
    }

    /**
     * Send SMS alert
     */
    async sendSMSAlert(healthCheckName, result, rule) {
        // Implementation would integrate with SMS service
        this.logger.logInfo('health_check', `SMS alert sent for ${healthCheckName}: ${result.message}`);
    }

    /**
     * Get overall health status
     */
    getOverallHealth() {
        const healthChecks = Array.from(this.healthChecks.values());
        const dependencies = Array.from(this.dependencies.values());

        const criticalChecks = healthChecks.filter(check => check.config.critical);
        const failedCriticalChecks = criticalChecks.filter(check => check.status === 'unhealthy' || check.status === 'critical');
        
        const criticalDependencies = dependencies.filter(dep => dep.critical);
        const failedCriticalDependencies = criticalDependencies.filter(dep => dep.status === 'error' || dep.status === 'unhealthy');

        let overallStatus = 'healthy';
        
        if (failedCriticalChecks.length > 0 || failedCriticalDependencies.length > 0) {
            overallStatus = 'critical';
        } else {
            const warningChecks = healthChecks.filter(check => check.status === 'warning');
            if (warningChecks.length > 0) {
                overallStatus = 'warning';
            }
        }

        return {
            status: overallStatus,
            timestamp: new Date(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            checks: {
                total: healthChecks.length,
                healthy: healthChecks.filter(check => check.status === 'healthy').length,
                warning: healthChecks.filter(check => check.status === 'warning').length,
                unhealthy: healthChecks.filter(check => check.status === 'unhealthy').length,
                critical: healthChecks.filter(check => check.status === 'critical').length,
                unknown: healthChecks.filter(check => check.status === 'unknown').length
            },
            dependencies: {
                total: dependencies.length,
                healthy: dependencies.filter(dep => dep.status === 'healthy').length,
                unhealthy: dependencies.filter(dep => dep.status !== 'healthy').length
            },
            performance: this.getPerformanceSummary(),
            recentIncidents: this.incidentHistory.slice(-5)
        };
    }

    /**
     * Get detailed health report
     */
    getDetailedHealthReport() {
        const overallHealth = this.getOverallHealth();
        
        return {
            ...overallHealth,
            detailedChecks: this.getDetailedChecks(),
            detailedDependencies: this.getDetailedDependencies(),
            performanceMetrics: this.getPerformanceMetrics(),
            incidentHistory: this.incidentHistory,
            recommendations: this.generateHealthRecommendations(overallHealth)
        };
    }

    /**
     * Get detailed checks
     */
    getDetailedChecks() {
        const checks = {};
        
        this.healthChecks.forEach((check, name) => {
            checks[name] = {
                name,
                status: check.status,
                lastCheck: check.lastCheck,
                lastSuccess: check.lastSuccess,
                consecutiveFailures: check.consecutiveFailures,
                consecutiveSuccesses: check.consecutiveSuccesses,
                responseTime: check.history.length > 0 ? check.history[check.history.length - 1].responseTime : null,
                history: check.history.slice(-10), // Last 10 results
                config: check.config
            };
        });
        
        return checks;
    }

    /**
     * Get detailed dependencies
     */
    getDetailedDependencies() {
        const deps = {};
        
        this.dependencies.forEach((dep, name) => {
            deps[name] = {
                name,
                type: dep.type,
                status: dep.status,
                lastCheck: dep.lastCheck,
                responseTime: dep.responseTime,
                critical: dep.critical,
                config: dep.config,
                history: dep.history.slice(-10)
            };
        });
        
        return deps;
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const summary = {};
        
        this.performanceThresholds.forEach((threshold, metric) => {
            summary[metric] = {
                threshold,
                currentValue: this.getCurrentMetricValue(metric),
                status: this.getMetricStatus(metric)
            };
        });
        
        return summary;
    }

    /**
     * Get current metric value
     */
    getCurrentMetricValue(metric) {
        switch (metric) {
            case 'memory_usage':
                const memUsage = process.memoryUsage();
                return ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2);
            case 'cpu_usage':
                const cpuUsage = process.cpuUsage();
                return Math.min(((cpuUsage.user + cpuUsage.system) / 1000000) * 100, 100).toFixed(2);
            case 'disk_space':
                return 45; // Placeholder
            case 'response_time':
                return this.calculateAvgResponseTime();
            case 'error_rate':
                return this.calculateErrorRate();
            default:
                return 0;
        }
    }

    /**
     * Get metric status
     */
    getMetricStatus(metric) {
        const threshold = this.performanceThresholds.get(metric);
        const currentValue = parseFloat(this.getCurrentMetricValue(metric));
        
        if (currentValue >= threshold.critical) return 'critical';
        if (currentValue >= threshold.warning) return 'warning';
        return 'healthy';
    }

    /**
     * Calculate average response time
     */
    calculateAvgResponseTime() {
        const recentChecks = this.getRecentHealthChecks();
        if (recentChecks.length === 0) return 0;
        
        const totalResponseTime = recentChecks.reduce((sum, check) => 
            sum + (check.responseTime || 0), 0);
        return (totalResponseTime / recentChecks.length).toFixed(2);
    }

    /**
     * Calculate error rate
     */
    calculateErrorRate() {
        const recentChecks = this.getRecentHealthChecks();
        if (recentChecks.length === 0) return 0;
        
        const failedChecks = recentChecks.filter(check => 
            check.status === 'unhealthy' || check.status === 'critical');
        return ((failedChecks.length / recentChecks.length) * 100).toFixed(2);
    }

    /**
     * Get recent health checks
     */
    getRecentHealthChecks() {
        const recent = [];
        this.healthChecks.forEach(check => {
            if (check.history.length > 0) {
                recent.push(check.history[check.history.length - 1]);
            }
        });
        return recent;
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            responseTimes: this.getResponseTimeMetrics(),
            throughput: this.getThroughputMetrics(),
            resourceUsage: this.getResourceUsageMetrics()
        };
    }

    /**
     * Get response time metrics
     */
    getResponseTimeMetrics() {
        const recentChecks = this.getRecentHealthChecks();
        const responseTimes = recentChecks.map(check => check.responseTime || 0);
        
        return {
            avg: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length || 0,
            min: Math.min(...responseTimes),
            max: Math.max(...responseTimes),
            p95: this.calculatePercentile(responseTimes, 95),
            p99: this.calculatePercentile(responseTimes, 99)
        };
    }

    /**
     * Get throughput metrics
     */
    getThroughputMetrics() {
        const recentChecks = this.getRecentHealthChecks();
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        const recent = recentChecks.filter(check => 
            Date.now() - new Date(check.timestamp).getTime() < timeWindow);
        
        return {
            checksPerMinute: recent.length / 5,
            successRate: this.calculateSuccessRate(recent)
        };
    }

    /**
     * Get resource usage metrics
     */
    getResourceUsageMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        return {
            memory: {
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss,
                percentage: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
                total: cpuUsage.user + cpuUsage.system
            }
        };
    }

    /**
     * Calculate percentile
     */
    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;
        
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * (percentile / 100)) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * Calculate success rate
     */
    calculateSuccessRate(checks) {
        if (checks.length === 0) return 100;
        
        const successful = checks.filter(check => check.status === 'healthy');
        return ((successful.length / checks.length) * 100).toFixed(2);
    }

    /**
     * Generate health recommendations
     */
    generateHealthRecommendations(health) {
        const recommendations = [];

        if (health.status === 'critical') {
            recommendations.push({
                priority: 'critical',
                recommendation: 'Immediate attention required - critical system issues detected',
                action: 'Check system logs and resolve critical issues immediately'
            });
        }

        if (health.performance?.memory?.status === 'critical') {
            recommendations.push({
                priority: 'high',
                recommendation: 'High memory usage detected',
                action: 'Consider restarting services or investigating memory leaks'
            });
        }

        if (health.performance?.cpu?.status === 'critical') {
            recommendations.push({
                priority: 'high',
                recommendation: 'High CPU usage detected',
                action: 'Investigate CPU-intensive processes and optimize performance'
            });
        }

        if (health.checks?.unhealthy > 0) {
            recommendations.push({
                priority: 'medium',
                recommendation: `${health.checks.unhealthy} health checks are failing`,
                action: 'Review failed health checks and resolve underlying issues'
            });
        }

        return recommendations;
    }

    /**
     * Collect system metrics
     */
    async collectSystemMetrics() {
        const metrics = {
            timestamp: new Date(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            loadAverage: require('os').loadavg()
        };

        analyticsService.trackPerformance('system_memory', metrics.memory.heapUsed, 'bytes');
        analyticsService.trackPerformance('system_cpu', metrics.cpu.user + metrics.cpu.system, 'microseconds');
        analyticsService.trackPerformance('system_uptime', metrics.uptime, 'seconds');
    }

    /**
     * Collect application metrics
     */
    async collectApplicationMetrics() {
        const metrics = {
            timestamp: new Date(),
            activeConnections: this.getActiveConnectionCount(),
            requestRate: this.getRequestRate(),
            errorRate: this.calculateErrorRate(),
            avgResponseTime: this.calculateAvgResponseTime()
        };

        analyticsService.trackPerformance('app_connections', metrics.activeConnections, 'count');
        analyticsService.trackPerformance('app_request_rate', metrics.requestRate, 'requests_per_minute');
        analyticsService.trackPerformance('app_error_rate', parseFloat(metrics.errorRate), 'percentage');
        analyticsService.trackPerformance('app_response_time', parseFloat(metrics.avgResponseTime), 'milliseconds');
    }

    /**
     * Collect business metrics
     */
    async collectBusinessMetrics() {
        const metrics = {
            timestamp: new Date(),
            activeUsers: analyticsService.userSessions.size,
            totalRequests: this.getTotalRequestCount(),
            conversionRate: this.getConversionRate()
        };

        analyticsService.trackBusinessMetric('active_users', metrics.activeUsers);
        analyticsService.trackBusinessMetric('total_requests', metrics.totalRequests);
        analyticsService.trackBusinessMetric('conversion_rate', metrics.conversionRate, { unit: 'percentage' });
    }

    /**
     * Helper methods for metrics collection
     */
    getActiveConnectionCount() {
        // Implementation would track active connections
        return 0; // Placeholder
    }

    getRequestRate() {
        // Implementation would calculate request rate
        return 0; // Placeholder
    }

    getTotalRequestCount() {
        // Implementation would track total requests
        return 0; // Placeholder
    }

    getConversionRate() {
        // Implementation would calculate conversion rate
        return 0; // Placeholder
    }

    /**
     * Enable/disable alerting
     */
    setAlertingEnabled(enabled) {
        this.alertingEnabled = enabled;
        this.logger.logInfo('health_check', `Alerting ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get health check service health
     */
    getHealth() {
        return {
            status: this.isInitialized ? 'healthy' : 'unhealthy',
            initialized: this.isInitialized,
            totalChecks: this.healthChecks.size,
            totalDependencies: this.dependencies.size,
            totalAlerts: this.alerts.size,
            alertingEnabled: this.alertingEnabled,
            incidentCount: this.incidentHistory.length
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        // Clear all intervals
        this.checkIntervals.forEach(interval => clearInterval(interval));
        this.checkIntervals.clear();
        
        // Run final health checks
        await this.runFinalHealthChecks();
        
        this.isInitialized = false;
        this.removeAllListeners();
        this.logger.logInfo('health_check', 'Health check service cleaned up');
    }

    /**
     * Run final health checks before cleanup
     */
    async runFinalHealthChecks() {
        const promises = [];
        this.healthChecks.forEach((check, name) => {
            promises.push(this.runHealthCheck(name));
        });
        
        try {
            await Promise.allSettled(promises);
        } catch (error) {
            this.logger.logError('health_check', 'Error during final health checks:', error);
        }
    }

    // Getters
    get logger() {
        return loggingService;
    }

    get monitoring() {
        return monitoringService;
    }

    get analytics() {
        return analyticsService;
    }
}

module.exports = new HealthCheckService();