const HealthCheckService = require('../../services/HealthCheckService');
const loggingService = require('../../services/LoggingService');
const monitoringService = require('../../services/MonitoringService');
const analyticsService = require('../../services/AnalyticsService');

describe('HealthCheckService', () => {
    let healthCheckService;

    beforeEach(() => {
        // Mock dependencies
        jest.spyOn(loggingService, 'logInfo').mockImplementation(() => {});
        jest.spyOn(loggingService, 'logError').mockImplementation(() => {});
        jest.spyOn(loggingService, 'logWarning').mockImplementation(() => {});
        jest.spyOn(monitoringService, 'trackMetric').mockImplementation(() => {});
        jest.spyOn(analyticsService, 'trackPerformance').mockImplementation(() => {});
        jest.spyOn(analyticsService, 'trackBusinessMetric').mockImplementation(() => {});
        jest.spyOn(analyticsService, 'trackEvent').mockImplementation(() => {});

        // Create a fresh instance for each test
        healthCheckService = new HealthCheckService();
    });

    afterEach(async () => {
        await healthCheckService.cleanup();
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with default configuration', () => {
            expect(healthCheckService.isInitialized).toBe(false);
            expect(healthCheckService.healthChecks).toBeInstanceOf(Map);
            expect(healthCheckService.dependencies).toBeInstanceOf(Map);
            expect(healthCheckService.alerts).toBeInstanceOf(Map);
            expect(healthCheckService.performanceThresholds).toBeInstanceOf(Map);
            expect(healthCheckService.checkIntervals).toBeInstanceOf(Map);
            expect(healthCheckService.alertingEnabled).toBe(true);
        });

        test('should have default configuration', () => {
            expect(healthCheckService.defaultConfig).toEqual({
                timeout: 5000,
                retries: 3,
                retryDelay: 1000,
                critical: true,
                alertThreshold: 3,
                checkInterval: 30000
            });
        });

        test('should initialize successfully', async () => {
            await expect(healthCheckService.initialize()).resolves.not.toThrow();
            expect(healthCheckService.isInitialized).toBe(true);
            expect(loggingService.logInfo).toHaveBeenCalledWith('health_check', 'Health check service initialized successfully');
        });

        test('should emit initialized event', async () => {
            const initializedSpy = jest.fn();
            healthCheckService.on('initialized', initializedSpy);
            
            await healthCheckService.initialize();
            
            expect(initializedSpy).toHaveBeenCalled();
        });

        test('should handle initialization errors', async () => {
            const error = new Error('Initialization failed');
            jest.spyOn(healthCheckService, 'setupDefaultHealthChecks').mockRejectedValue(error);
            
            await expect(healthCheckService.initialize()).rejects.toThrow(error);
            expect(loggingService.logError).toHaveBeenCalledWith('health_check', 'Failed to initialize health check service', { error });
        });
    });

    describe('Health Check Registration', () => {
        test('should register a health check', () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({ status: 'healthy' });
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction, {
                critical: true,
                checkInterval: 60000
            });
            
            expect(healthCheckService.healthChecks.has('test_check')).toBe(true);
            const check = healthCheckService.healthChecks.get('test_check');
            expect(check.name).toBe('test_check');
            expect(check.checkFunction).toBe(mockCheckFunction);
            expect(check.config.critical).toBe(true);
            expect(check.config.checkInterval).toBe(60000);
            expect(check.status).toBe('unknown');
            expect(check.consecutiveFailures).toBe(0);
            expect(check.consecutiveSuccesses).toBe(0);
        });

        test('should schedule health check after registration', () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({ status: 'healthy' });
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            expect(healthCheckService.checkIntervals.has('test_check')).toBe(true);
        });

        test('should log health check registration', () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({ status: 'healthy' });
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            expect(loggingService.logInfo).toHaveBeenCalledWith('health_check', 'Registered health check: test_check');
        });
    });

    describe('Dependency Registration', () => {
        test('should register a dependency', () => {
            const config = {
                type: 'database',
                connectionString: 'mongodb://localhost:27017/test',
                critical: true
            };
            
            healthCheckService.registerDependency('test_db', config);
            
            expect(healthCheckService.dependencies.has('test_db')).toBe(true);
            const dependency = healthCheckService.dependencies.get('test_db');
            expect(dependency.name).toBe('test_db');
            expect(dependency.type).toBe('database');
            expect(dependency.critical).toBe(true);
            expect(dependency.status).toBe('unknown');
        });

        test('should create health check for dependency', () => {
            const config = {
                type: 'database',
                connectionString: 'mongodb://localhost:27017/test',
                critical: true
            };
            
            healthCheckService.registerDependency('test_db', config);
            
            expect(healthCheckService.healthChecks.has('dependency_test_db')).toBe(true);
        });

        test('should log dependency registration', () => {
            const config = {
                type: 'database',
                connectionString: 'mongodb://localhost:27017/test'
            };
            
            healthCheckService.registerDependency('test_db', config);
            
            expect(loggingService.logInfo).toHaveBeenCalledWith('health_check', 'Registered dependency: test_db');
        });
    });

    describe('Performance Thresholds', () => {
        test('should set performance threshold', () => {
            const threshold = {
                warning: 70,
                critical: 85,
                unit: 'percentage'
            };
            
            healthCheckService.setPerformanceThreshold('memory_usage', threshold);
            
            expect(healthCheckService.performanceThresholds.has('memory_usage')).toBe(true);
            expect(healthCheckService.performanceThresholds.get('memory_usage')).toEqual(threshold);
        });

        test('should log performance threshold setting', () => {
            const threshold = {
                warning: 70,
                critical: 85,
                unit: 'percentage'
            };
            
            healthCheckService.setPerformanceThreshold('memory_usage', threshold);
            
            expect(loggingService.logInfo).toHaveBeenCalledWith('health_check', 'Set performance threshold for memory_usage:', threshold);
        });
    });

    describe('Health Check Execution', () => {
        test('should execute health check successfully', async () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({
                status: 'healthy',
                message: 'Test check passed'
            });
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            const result = await healthCheckService.runHealthCheck('test_check');
            
            expect(result).toMatchObject({
                name: 'test_check',
                status: 'healthy',
                message: 'Test check passed'
            });
            expect(result.timestamp).toBeInstanceOf(Date);
            expect(result.responseTime).toBeGreaterThanOrEqual(0);
            expect(mockCheckFunction).toHaveBeenCalled();
        });

        test('should handle health check failures', async () => {
            const error = new Error('Check failed');
            const mockCheckFunction = jest.fn().mockRejectedValue(error);
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            const result = await healthCheckService.runHealthCheck('test_check');
            
            expect(result).toMatchObject({
                name: 'test_check',
                status: 'unhealthy',
                message: 'Check failed'
            });
            expect(result.metadata).toHaveProperty('error');
            expect(loggingService.logError).toHaveBeenCalledWith('health_check', 'Health check failed: test_check', { error });
        });

        test('should update consecutive failure count on failure', async () => {
            const error = new Error('Check failed');
            const mockCheckFunction = jest.fn().mockRejectedValue(error);
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            await healthCheckService.runHealthCheck('test_check');
            
            const check = healthCheckService.healthChecks.get('test_check');
            expect(check.consecutiveFailures).toBe(1);
            expect(check.consecutiveSuccesses).toBe(0);
        });

        test('should update consecutive success count on success', async () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({ status: 'healthy' });
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            await healthCheckService.runHealthCheck('test_check');
            
            const check = healthCheckService.healthChecks.get('test_check');
            expect(check.consecutiveFailures).toBe(0);
            expect(check.consecutiveSuccesses).toBe(1);
        });

        test('should emit health_check_completed event', async () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({ status: 'healthy' });
            const eventSpy = jest.fn();
            
            healthCheckService.on('health_check_completed', eventSpy);
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            await healthCheckService.runHealthCheck('test_check');
            
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                name: 'test_check',
                status: 'healthy'
            }));
        });

        test('should handle non-existent health check', async () => {
            const result = await healthCheckService.runHealthCheck('non_existent');
            
            expect(result).toBeUndefined();
            expect(loggingService.logError).toHaveBeenCalledWith('health_check', 'Health check not found: non_existent');
        });
    });

    describe('Retry Mechanism', () => {
        test('should retry failed health checks', async () => {
            const mockCheckFunction = jest.fn()
                .mockRejectedValueOnce(new Error('First attempt failed'))
                .mockRejectedValueOnce(new Error('Second attempt failed'))
                .mockResolvedValue({ status: 'healthy', message: 'Success on third attempt' });
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction, {
                retries: 3,
                retryDelay: 100
            });
            
            const result = await healthCheckService.runHealthCheck('test_check');
            
            expect(result.status).toBe('healthy');
            expect(result.message).toBe('Success on third attempt');
            expect(mockCheckFunction).toHaveBeenCalledTimes(3);
        });

        test('should fail after max retries', async () => {
            const error = new Error('All attempts failed');
            const mockCheckFunction = jest.fn().mockRejectedValue(error);
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction, {
                retries: 2,
                retryDelay: 100
            });
            
            const result = await healthCheckService.runHealthCheck('test_check');
            
            expect(result.status).toBe('unhealthy');
            expect(result.message).toBe('All attempts failed');
            expect(mockCheckFunction).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        test('should log retry attempts', async () => {
            const mockCheckFunction = jest.fn()
                .mockRejectedValueOnce(new Error('First attempt failed'))
                .mockResolvedValue({ status: 'healthy' });
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction, {
                retries: 2,
                retryDelay: 100
            });
            
            await healthCheckService.runHealthCheck('test_check');
            
            expect(loggingService.logWarning).toHaveBeenCalledWith(
                'health_check',
                'Attempt 1 failed, retrying in 100ms:',
                'First attempt failed'
            );
        });
    });

    describe('Default Health Checks', () => {
        test('should setup default health checks', () => {
            healthCheckService.setupDefaultHealthChecks();
            
            expect(healthCheckService.healthChecks.has('memory_usage')).toBe(true);
            expect(healthCheckService.healthChecks.has('cpu_usage')).toBe(true);
            expect(healthCheckService.healthChecks.has('disk_space')).toBe(true);
            expect(healthCheckService.healthChecks.has('process_health')).toBe(true);
            expect(healthCheckService.healthChecks.has('database_connections')).toBe(true);
            expect(healthCheckService.healthChecks.has('cache_health')).toBe(true);
            expect(healthCheckService.healthChecks.has('external_services')).toBe(true);
            expect(healthCheckService.healthChecks.has('ssl_certificates')).toBe(true);
            expect(healthCheckService.healthChecks.has('security_scan')).toBe(true);
        });

        test('should setup default dependencies', () => {
            healthCheckService.setupDefaultDependencies();
            
            expect(healthCheckService.dependencies.has('mongodb')).toBe(true);
            expect(healthCheckService.dependencies.has('redis')).toBe(true);
            expect(healthCheckService.dependencies.has('postgres')).toBe(true);
            expect(healthCheckService.dependencies.has('external_api')).toBe(true);
        });

        test('should setup performance thresholds', () => {
            healthCheckService.setupPerformanceThresholds();
            
            expect(healthCheckService.performanceThresholds.has('memory_usage')).toBe(true);
            expect(healthCheckService.performanceThresholds.has('cpu_usage')).toBe(true);
            expect(healthCheckService.performanceThresholds.has('disk_space')).toBe(true);
            expect(healthCheckService.performanceThresholds.has('response_time')).toBe(true);
            expect(healthCheckService.performanceThresholds.has('error_rate')).toBe(true);
            expect(healthCheckService.performanceThresholds.has('database_connections')).toBe(true);
        });
    });

    describe('Memory Usage Check', () => {
        test('should return healthy status for normal memory usage', async () => {
            const result = await healthCheckService.checkMemoryUsage();
            
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('metadata');
            expect(result.metadata).toHaveProperty('heapUsedMB');
            expect(result.metadata).toHaveProperty('heapTotalMB');
            expect(result.metadata).toHaveProperty('usagePercentage');
            expect(result.metadata).toHaveProperty('threshold');
        });

        test('should detect high memory usage', async () => {
            // Mock high memory usage
            jest.spyOn(process, 'memoryUsage').mockReturnValue({
                heapUsed: 900 * 1024 * 1024, // 900MB
                heapTotal: 1000 * 1024 * 1024, // 1GB
                external: 100 * 1024 * 1024,
                rss: 1100 * 1024 * 1024
            });
            
            const result = await healthCheckService.checkMemoryUsage();
            
            expect(result.status).toBe('warning');
            expect(result.message).toContain('High memory usage');
        });
    });

    describe('CPU Usage Check', () => {
        test('should return healthy status for normal CPU usage', async () => {
            const result = await healthCheckService.checkCpuUsage();
            
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('metadata');
            expect(result.metadata).toHaveProperty('user');
            expect(result.metadata).toHaveProperty('system');
            expect(result.metadata).toHaveProperty('total');
            expect(result.metadata).toHaveProperty('usagePercentage');
        });
    });

    describe('Process Health Check', () => {
        test('should return healthy status for stable process', async () => {
            const result = await healthCheckService.checkProcessHealth();
            
            expect(result.status).toBe('healthy');
            expect(result.message).toContain('Process healthy');
            expect(result.metadata).toHaveProperty('pid');
            expect(result.metadata).toHaveProperty('uptime');
            expect(result.metadata).toHaveProperty('version');
            expect(result.metadata).toHaveProperty('platform');
            expect(result.metadata).toHaveProperty('arch');
        });

        test('should warn for recently started process', async () => {
            jest.spyOn(process, 'uptime').mockReturnValue(30); // 30 seconds
            
            const result = await healthCheckService.checkProcessHealth();
            
            expect(result.status).toBe('warning');
            expect(result.message).toContain('Process recently started');
        });
    });

    describe('Alerting', () => {
        test('should setup alerting channels', () => {
            healthCheckService.setupAlerting();
            
            expect(healthCheckService.alertChannels).toHaveProperty('email');
            expect(healthCheckService.alertChannels).toHaveProperty('slack');
            expect(healthCheckService.alertChannels).toHaveProperty('webhook');
            expect(healthCheckService.alertChannels).toHaveProperty('sms');
        });

        test('should setup alert rules', () => {
            healthCheckService.setupAlerting();
            
            expect(healthCheckService.alertRules).toBeInstanceOf(Array);
            expect(healthCheckService.alertRules.length).toBeGreaterThan(0);
            
            const criticalRule = healthCheckService.alertRules.find(rule => rule.name === 'critical_system_failure');
            expect(criticalRule).toBeDefined();
            expect(criticalRule.channels).toContain('email');
            expect(criticalRule.channels).toContain('slack');
            expect(criticalRule.channels).toContain('sms');
        });

        test('should trigger alert on consecutive failures', async () => {
            const mockCheckFunction = jest.fn().mockRejectedValue(new Error('Check failed'));
            const alertSpy = jest.spyOn(healthCheckService, 'triggerAlert').mockResolvedValue();
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction, {
                alertThreshold: 2
            });
            
            // Run check twice to trigger alert
            await healthCheckService.runHealthCheck('test_check');
            await healthCheckService.runHealthCheck('test_check');
            
            expect(alertSpy).toHaveBeenCalledWith('test_check', expect.objectContaining({
                status: 'unhealthy',
                message: 'Check failed'
            }));
        });

        test('should respect alert cooldown', async () => {
            const mockCheckFunction = jest.fn().mockRejectedValue(new Error('Check failed'));
            const alertSpy = jest.spyOn(healthCheckService, 'triggerAlert').mockResolvedValue();
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction, {
                alertThreshold: 1
            });
            
            // Run check twice in quick succession
            await healthCheckService.runHealthCheck('test_check');
            await healthCheckService.runHealthCheck('test_check');
            
            // Should only trigger alert once due to cooldown
            expect(alertSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Overall Health Status', () => {
        test('should return overall health status', () => {
            const health = healthCheckService.getOverallHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('timestamp');
            expect(health).toHaveProperty('uptime');
            expect(health).toHaveProperty('version');
            expect(health).toHaveProperty('environment');
            expect(health).toHaveProperty('checks');
            expect(health).toHaveProperty('dependencies');
            expect(health).toHaveProperty('performance');
            expect(health).toHaveProperty('recentIncidents');
        });

        test('should calculate overall status based on critical checks', () => {
            // Register a failing critical check
            const mockCheckFunction = jest.fn().mockRejectedValue(new Error('Critical failure'));
            healthCheckService.registerHealthCheck('critical_check', mockCheckFunction, {
                critical: true,
                alertThreshold: 1
            });
            
            const health = healthCheckService.getOverallHealth();
            
            // Should be critical due to failing critical check
            expect(health.status).toBe('critical');
        });
    });

    describe('Detailed Health Report', () => {
        test('should generate detailed health report', () => {
            const report = healthCheckService.getDetailedHealthReport();
            
            expect(report).toHaveProperty('status');
            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('uptime');
            expect(report).toHaveProperty('version');
            expect(report).toHaveProperty('environment');
            expect(report).toHaveProperty('checks');
            expect(report).toHaveProperty('dependencies');
            expect(report).toHaveProperty('performance');
            expect(report).toHaveProperty('recentIncidents');
            expect(report).toHaveProperty('detailedChecks');
            expect(report).toHaveProperty('detailedDependencies');
            expect(report).toHaveProperty('performanceMetrics');
            expect(report).toHaveProperty('recommendations');
        });

        test('should include health recommendations', () => {
            const report = healthCheckService.getDetailedHealthReport();
            
            expect(report.recommendations).toBeInstanceOf(Array);
            // Should have recommendations based on current health status
            expect(report.recommendations.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Performance Metrics', () => {
        test('should calculate response time metrics', () => {
            const metrics = healthCheckService.getResponseTimeMetrics();
            
            expect(metrics).toHaveProperty('avg');
            expect(metrics).toHaveProperty('min');
            expect(metrics).toHaveProperty('max');
            expect(metrics).toHaveProperty('p95');
            expect(metrics).toHaveProperty('p99');
        });

        test('should calculate throughput metrics', () => {
            const metrics = healthCheckService.getThroughputMetrics();
            
            expect(metrics).toHaveProperty('checksPerMinute');
            expect(metrics).toHaveProperty('successRate');
        });

        test('should get resource usage metrics', () => {
            const metrics = healthCheckService.getResourceUsageMetrics();
            
            expect(metrics).toHaveProperty('memory');
            expect(metrics).toHaveProperty('cpu');
            expect(metrics.memory).toHaveProperty('heapUsed');
            expect(metrics.memory).toHaveProperty('heapTotal');
            expect(metrics.memory).toHaveProperty('percentage');
            expect(metrics.cpu).toHaveProperty('user');
            expect(metrics.cpu).toHaveProperty('system');
            expect(metrics.cpu).toHaveProperty('total');
        });
    });

    describe('Service Health', () => {
        test('should return service health status', () => {
            const health = healthCheckService.getHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('initialized');
            expect(health).toHaveProperty('totalChecks');
            expect(health).toHaveProperty('totalDependencies');
            expect(health).toHaveProperty('totalAlerts');
            expect(health).toHaveProperty('alertingEnabled');
            expect(health).toHaveProperty('incidentCount');
        });

        test('should reflect initialization status', () => {
            healthCheckService.isInitialized = true;
            const health = healthCheckService.getHealth();
            
            expect(health.status).toBe('healthy');
            expect(health.initialized).toBe(true);
        });
    });

    describe('Alerting Control', () => {
        test('should enable alerting', () => {
            healthCheckService.setAlertingEnabled(true);
            
            expect(healthCheckService.alertingEnabled).toBe(true);
            expect(loggingService.logInfo).toHaveBeenCalledWith('health_check', 'Alerting enabled');
        });

        test('should disable alerting', () => {
            healthCheckService.setAlertingEnabled(false);
            
            expect(healthCheckService.alertingEnabled).toBe(false);
            expect(loggingService.logInfo).toHaveBeenCalledWith('health_check', 'Alerting disabled');
        });

        test('should not trigger alerts when disabled', async () => {
            healthCheckService.setAlertingEnabled(false);
            const triggerAlertSpy = jest.spyOn(healthCheckService, 'triggerAlert').mockResolvedValue();
            
            const mockCheckFunction = jest.fn().mockRejectedValue(new Error('Check failed'));
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction, {
                alertThreshold: 1
            });
            
            await healthCheckService.runHealthCheck('test_check');
            
            expect(triggerAlertSpy).not.toHaveBeenCalled();
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources', async () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({ status: 'healthy' });
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            await healthCheckService.cleanup();
            
            expect(healthCheckService.isInitialized).toBe(false);
            expect(healthCheckService.checkIntervals.size).toBe(0);
            expect(loggingService.logInfo).toHaveBeenCalledWith('health_check', 'Health check service cleaned up');
        });

        test('should clear all intervals on cleanup', async () => {
            const mockCheckFunction = jest.fn().mockResolvedValue({ status: 'healthy' });
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            expect(healthCheckService.checkIntervals.size).toBeGreaterThan(0);
            
            await healthCheckService.cleanup();
            
            expect(healthCheckService.checkIntervals.size).toBe(0);
        });

        test('should remove event listeners on cleanup', async () => {
            const listenerSpy = jest.fn();
            healthCheckService.on('test_event', listenerSpy);
            
            await healthCheckService.cleanup();
            
            healthCheckService.emit('test_event');
            expect(listenerSpy).not.toHaveBeenCalled();
        });
    });

    describe('Monitoring and Metrics Collection', () => {
        test('should collect system metrics', async () => {
            await healthCheckService.collectSystemMetrics();
            
            expect(analyticsService.trackPerformance).toHaveBeenCalledWith('system_memory', expect.any(Number), 'bytes');
            expect(analyticsService.trackPerformance).toHaveBeenCalledWith('system_cpu', expect.any(Number), 'microseconds');
            expect(analyticsService.trackPerformance).toHaveBeenCalledWith('system_uptime', expect.any(Number), 'seconds');
        });

        test('should collect application metrics', async () => {
            await healthCheckService.collectApplicationMetrics();
            
            expect(analyticsService.trackPerformance).toHaveBeenCalledWith('app_connections', expect.any(Number), 'count');
            expect(analyticsService.trackPerformance).toHaveBeenCalledWith('app_request_rate', expect.any(Number), 'requests_per_minute');
            expect(analyticsService.trackPerformance).toHaveBeenCalledWith('app_error_rate', expect.any(Number), 'percentage');
            expect(analyticsService.trackPerformance).toHaveBeenCalledWith('app_response_time', expect.any(Number), 'milliseconds');
        });

        test('should collect business metrics', async () => {
            await healthCheckService.collectBusinessMetrics();
            
            expect(analyticsService.trackBusinessMetric).toHaveBeenCalledWith('active_users', expect.any(Number));
            expect(analyticsService.trackBusinessMetric).toHaveBeenCalledWith('total_requests', expect.any(Number));
            expect(analyticsService.trackBusinessMetric).toHaveBeenCalledWith('conversion_rate', expect.any(Number), { unit: 'percentage' });
        });
    });

    describe('Error Handling', () => {
        test('should handle health check function returning invalid result', async () => {
            const mockCheckFunction = jest.fn().mockResolvedValue(null);
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            const result = await healthCheckService.runHealthCheck('test_check');
            
            expect(result.status).toBe('unhealthy');
            expect(result.message).toBe('');
        });

        test('should handle health check function returning undefined', async () => {
            const mockCheckFunction = jest.fn().mockResolvedValue(undefined);
            
            healthCheckService.registerHealthCheck('test_check', mockCheckFunction);
            
            const result = await healthCheckService.runHealthCheck('test_check');
            
            expect(result.status).toBe('unhealthy');
            expect(result.message).toBe('');
        });

        test('should handle dependency check errors', async () => {
            const result = await healthCheckService.checkDependency('non_existent_dependency');
            
            expect(result).toMatchObject({
                status: 'error',
                message: 'Dependency not found: non_existent_dependency'
            });
        });
    });
});