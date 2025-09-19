const prometheus = require('prom-client');
const axios = require('axios');
const winston = require('winston');
const os = require('os');
const dns = require('dns').promises;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'monitoring-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/monitoring-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/monitoring-combined.log' })
  ]
});

class MonitoringService {
  constructor() {
    this.register = new prometheus.Registry();
    this.collectDefaultMetrics();
    this.initializeCustomMetrics();
    this.healthChecks = new Map();
    this.alerts = new Map();
    this.performanceMetrics = new Map();
    this.uptimeStart = Date.now();
  }

  collectDefaultMetrics() {
    prometheus.collectDefaultMetrics({
      register: this.register,
      prefix: 'piper_newsletter_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
      eventLoopMonitoringPrecision: 10
    });
  }

  initializeCustomMetrics() {
    // Application metrics
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'piper_newsletter_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    this.httpRequestTotal = new prometheus.Counter({
      name: 'piper_newsletter_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    this.activeUsers = new prometheus.Gauge({
      name: 'piper_newsletter_active_users',
      help: 'Number of active users in the last 5 minutes'
    });

    this.userRegistrations = new prometheus.Counter({
      name: 'piper_newsletter_user_registrations_total',
      help: 'Total number of user registrations'
    });

    this.newsletterSent = new prometheus.Counter({
      name: 'piper_newsletter_sent_total',
      help: 'Total number of newsletters sent',
      labelNames: ['campaign_type', 'status']
    });

    this.emailQueueSize = new prometheus.Gauge({
      name: 'piper_newsletter_email_queue_size',
      help: 'Number of emails in the queue'
    });

    this.subscriptionRevenue = new prometheus.Gauge({
      name: 'piper_newsletter_subscription_revenue',
      help: 'Total subscription revenue',
      labelNames: ['plan_type']
    });

    this.databaseConnections = new prometheus.Gauge({
      name: 'piper_newsletter_database_connections',
      help: 'Number of database connections',
      labelNames: ['state']
    });

    this.cacheHitRate = new prometheus.Gauge({
      name: 'piper_newsletter_cache_hit_rate',
      help: 'Cache hit rate percentage'
    });

    this.errorRate = new prometheus.Gauge({
      name: 'piper_newsletter_error_rate',
      help: 'Error rate percentage',
      labelNames: ['error_type']
    });

    this.memoryUsage = new prometheus.Gauge({
      name: 'piper_newsletter_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type']
    });

    this.cpuUsage = new prometheus.Gauge({
      name: 'piper_newsletter_cpu_usage_percent',
      help: 'CPU usage percentage'
    });

    this.diskUsage = new prometheus.Gauge({
      name: 'piper_newsletter_disk_usage_bytes',
      help: 'Disk usage in bytes',
      labelNames: ['type']
    });

    this.apiResponseTime = new prometheus.Histogram({
      name: 'piper_newsletter_api_response_time_seconds',
      help: 'API response time in seconds',
      labelNames: ['endpoint', 'method'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
    });

    this.thirdPartyApiCalls = new prometheus.Counter({
      name: 'piper_newsletter_third_party_api_calls_total',
      help: 'Total third-party API calls',
      labelNames: ['service', 'endpoint', 'status']
    });

    this.securityEvents = new prometheus.Counter({
      name: 'piper_newsletter_security_events_total',
      help: 'Total security events',
      labelNames: ['event_type', 'severity']
    });

    // Register all metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.activeUsers);
    this.register.registerMetric(this.userRegistrations);
    this.register.registerMetric(this.newsletterSent);
    this.register.registerMetric(this.emailQueueSize);
    this.register.registerMetric(this.subscriptionRevenue);
    this.register.registerMetric(this.databaseConnections);
    this.register.registerMetric(this.cacheHitRate);
    this.register.registerMetric(this.errorRate);
    this.register.registerMetric(this.memoryUsage);
    this.register.registerMetric(this.cpuUsage);
    this.register.registerMetric(this.diskUsage);
    this.register.registerMetric(this.apiResponseTime);
    this.register.registerMetric(this.thirdPartyApiCalls);
    this.register.registerMetric(this.securityEvents);
  }

  // Middleware for HTTP request metrics
  httpMetricsMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      const route = req.route ? req.route.path : req.path;
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const method = req.method;
        const statusCode = res.statusCode.toString();
        
        this.httpRequestDuration
          .labels(method, route, statusCode)
          .observe(duration);
        
        this.httpRequestTotal
          .labels(method, route, statusCode)
          .inc();

        // Track slow requests
        if (duration > 5) {
          logger.warn('Slow request detected', {
            method,
            route,
            duration,
            statusCode
          });
        }
      });
      
      next();
    };
  }

  // Update application metrics
  updateActiveUsers(count) {
    this.activeUsers.set(count);
  }

  incrementUserRegistrations() {
    this.userRegistrations.inc();
  }

  incrementNewsletterSent(campaignType, status) {
    this.newsletterSent.labels(campaignType, status).inc();
  }

  updateEmailQueueSize(size) {
    this.emailQueueSize.set(size);
  }

  updateSubscriptionRevenue(planType, amount) {
    this.subscriptionRevenue.labels(planType).set(amount);
  }

  updateDatabaseConnections(state, count) {
    this.databaseConnections.labels(state).set(count);
  }

  updateCacheHitRate(rate) {
    this.cacheHitRate.set(rate);
  }

  updateErrorRate(errorType, rate) {
    this.errorRate.labels(errorType).set(rate);
  }

  updateSystemMetrics() {
    // Memory usage
    const memUsage = process.memoryUsage();
    this.memoryUsage.labels('rss').set(memUsage.rss);
    this.memoryUsage.labels('heapUsed').set(memUsage.heapUsed);
    this.memoryUsage.labels('heapTotal').set(memUsage.heapTotal);
    this.memoryUsage.labels('external').set(memUsage.external);

    // CPU usage
    const cpuUsage = process.cpuUsage();
    const totalCpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    this.cpuUsage.set(totalCpuUsage);

    // Disk usage (simplified)
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      this.diskUsage.labels('total').set(0); // Would need proper disk stats
      this.diskUsage.labels('used').set(0);
      this.diskUsage.labels('free').set(0);
    } catch (error) {
      logger.error('Failed to get disk usage', error);
    }
  }

  // API performance tracking
  trackApiPerformance(endpoint, method, duration) {
    this.apiResponseTime.labels(endpoint, method).observe(duration / 1000);
  }

  // Third-party API tracking
  trackThirdPartyApiCall(service, endpoint, status) {
    this.thirdPartyApiCalls.labels(service, endpoint, status).inc();
  }

  // Security event tracking
  trackSecurityEvent(eventType, severity) {
    this.securityEvents.labels(eventType, severity).inc();
  }

  // Health check management
  addHealthCheck(name, checkFunction, options = {}) {
    const {
      interval = 30000, // 30 seconds
      timeout = 5000,   // 5 seconds
      retries = 3
    } = options;

    this.healthChecks.set(name, {
      checkFunction,
      interval,
      timeout,
      retries,
      lastCheck: null,
      status: 'unknown',
      message: null,
      lastError: null
    });

    // Start periodic health checks
    this.startHealthCheck(name);
  }

  async startHealthCheck(name) {
    const check = this.healthChecks.get(name);
    if (!check) return;

    const runCheck = async () => {
      try {
        const start = Date.now();
        const result = await Promise.race([
          check.checkFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
          )
        ]);
        
        const duration = Date.now() - start;
        
        check.lastCheck = new Date();
        check.status = result.status || 'healthy';
        check.message = result.message || 'OK';
        check.lastError = null;
        
        logger.info(`Health check passed: ${name}`, {
          duration,
          status: check.status,
          message: check.message
        });

      } catch (error) {
        check.lastCheck = new Date();
        check.status = 'unhealthy';
        check.message = error.message;
        check.lastError = error;
        
        logger.error(`Health check failed: ${name}`, {
          error: error.message,
          status: check.status
        });

        // Trigger alert if configured
        this.triggerAlert('health_check_failed', {
          checkName: name,
          error: error.message,
          severity: 'high'
        });
      }
    };

    // Run immediately
    await runCheck();

    // Schedule periodic checks
    setInterval(runCheck, check.interval);
  }

  // Common health checks
  setupDatabaseHealthCheck(database) {
    this.addHealthCheck('database', async () => {
      try {
        await database.ping();
        return { status: 'healthy', message: 'Database connection OK' };
      } catch (error) {
        return { status: 'unhealthy', message: `Database error: ${error.message}` };
      }
    });
  }

  setupRedisHealthCheck(redisClient) {
    this.addHealthCheck('redis', async () => {
      try {
        await redisClient.ping();
        return { status: 'healthy', message: 'Redis connection OK' };
      } catch (error) {
        return { status: 'unhealthy', message: `Redis error: ${error.message}` };
      }
    });
  }

  setupEmailServiceHealthCheck(emailService) {
    this.addHealthCheck('email_service', async () => {
      try {
        await emailService.verifyConnection();
        return { status: 'healthy', message: 'Email service OK' };
      } catch (error) {
        return { status: 'unhealthy', message: `Email service error: ${error.message}` };
      }
    });
  }

  setupPaymentServiceHealthCheck(paymentService) {
    this.addHealthCheck('payment_service', async () => {
      try {
        await paymentService.healthCheck();
        return { status: 'healthy', message: 'Payment service OK' };
      } catch (error) {
        return { status: 'unhealthy', message: `Payment service error: ${error.message}` };
      }
    });
  }

  // Alert management
  addAlert(name, condition, action, options = {}) {
    const {
      cooldown = 300000, // 5 minutes
      severity = 'medium'
    } = options;

    this.alerts.set(name, {
      condition,
      action,
      cooldown,
      severity,
      lastTriggered: null,
      triggerCount: 0
    });
  }

  async triggerAlert(alertName, data) {
    const alert = this.alerts.get(alertName);
    if (!alert) return;

    const now = Date.now();
    
    // Check cooldown
    if (alert.lastTriggered && (now - alert.lastTriggered) < alert.cooldown) {
      return;
    }

    // Check condition
    const shouldTrigger = await alert.condition(data);
    if (!shouldTrigger) return;

    // Trigger alert
    alert.lastTriggered = now;
    alert.triggerCount++;

    try {
      await alert.action(data);
      logger.warn(`Alert triggered: ${alertName}`, {
        severity: alert.severity,
        data,
        triggerCount: alert.triggerCount
      });
    } catch (error) {
      logger.error(`Alert action failed: ${alertName}`, {
        error: error.message,
        data
      });
    }
  }

  // Common alert configurations
  setupCommonAlerts() {
    // High error rate alert
    this.addAlert('high_error_rate', 
      async (data) => {
        const errorRate = await this.getErrorRate();
        return errorRate > 10; // 10% error rate
      },
      async (data) => {
        // Send notification to ops team
        logger.error('High error rate detected', { errorRate: data.errorRate });
      },
      { severity: 'high', cooldown: 300000 }
    );

    // Low memory alert
    this.addAlert('low_memory',
      async (data) => {
        const memUsage = process.memoryUsage();
        const memoryMB = memUsage.heapUsed / 1024 / 1024;
        return memoryMB > 500; // 500MB heap usage
      },
      async (data) => {
        logger.warn('High memory usage detected', { memoryMB: data.memoryMB });
      },
      { severity: 'medium', cooldown: 600000 }
    );

    // Database connection pool exhaustion
    this.addAlert('db_connection_pool_exhaustion',
      async (data) => {
        // This would check actual database connection metrics
        return false; // Placeholder
      },
      async (data) => {
        logger.error('Database connection pool exhausted');
      },
      { severity: 'high', cooldown: 300000 }
    );
  }

  // Get system health status
  async getHealthStatus() {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.uptimeStart,
      status: 'healthy',
      checks: {},
      metrics: {}
    };

    // Run all health checks
    for (const [name, check] of this.healthChecks.entries()) {
      healthStatus.checks[name] = {
        status: check.status,
        message: check.message,
        lastCheck: check.lastCheck
      };

      if (check.status === 'unhealthy') {
        healthStatus.status = 'unhealthy';
      }
    }

    // Add system metrics
    healthStatus.metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    };

    return healthStatus;
  }

  // Get metrics for Prometheus
  getMetrics() {
    return this.register.metrics();
  }

  // Performance monitoring
  startPerformanceMonitoring() {
    // Update system metrics every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);

    // Monitor event loop lag
    this.monitorEventLoop();
  }

  monitorEventLoop() {
    let lastCheck = Date.now();
    
    setInterval(() => {
      const now = Date.now();
      const lag = now - lastCheck - 1000; // Expected 1000ms interval
      
      if (lag > 100) { // More than 100ms lag
        logger.warn('Event loop lag detected', { lag: `${lag}ms` });
      }
      
      lastCheck = now;
    }, 1000);
  }

  // Get current metrics snapshot
  getMetricsSnapshot() {
    return {
      timestamp: new Date().toISOString(),
      counters: this.getCounterMetrics(),
      gauges: this.getGaugeMetrics(),
      histograms: this.getHistogramMetrics()
    };
  }

  getCounterMetrics() {
    // Return current counter values
    return {
      httpRequests: this.httpRequestTotal.values,
      userRegistrations: this.userRegistrations.values,
      newsletterSent: this.newsletterSent.values,
      thirdPartyApiCalls: this.thirdPartyApiCalls.values,
      securityEvents: this.securityEvents.values
    };
  }

  getGaugeMetrics() {
    // Return current gauge values
    return {
      activeUsers: this.activeUsers.values,
      emailQueueSize: this.emailQueueSize.values,
      subscriptionRevenue: this.subscriptionRevenue.values,
      databaseConnections: this.databaseConnections.values,
      cacheHitRate: this.cacheHitRate.values,
      errorRate: this.errorRate.values,
      memoryUsage: this.memoryUsage.values,
      cpuUsage: this.cpuUsage.values,
      diskUsage: this.diskUsage.values
    };
  }

  getHistogramMetrics() {
    // Return current histogram values
    return {
      httpRequestDuration: this.httpRequestDuration.values,
      apiResponseTime: this.apiResponseTime.values
    };
  }

  // Cleanup
  cleanup() {
    // Clear intervals and timeouts
    this.register.clear();
    logger.info('Monitoring service cleaned up');
  }
}

module.exports = MonitoringService;