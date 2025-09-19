const request = require('supertest');
const app = require('../../app');
const HealthCheckService = require('../../services/HealthCheckService');
const loggingService = require('../../services/LoggingService');
const monitoringService = require('../../services/MonitoringService');
const analyticsService = require('../../services/AnalyticsService');

describe('Health Check Integration Tests', () => {
    let healthCheckService;

    beforeAll(async () => {
        // Initialize health check service
        healthCheckService = new HealthCheckService();
        await healthCheckService.initialize();
    });

    afterAll(async () => {
        await healthCheckService.cleanup();
    });

    beforeEach(() => {
        // Reset health check state before each test
        healthCheckService.healthChecks.clear();
        healthCheckService.dependencies.clear();
        healthCheckService.alerts.clear();
    });

    describe('Health Check API Endpoints', () => {
        describe('GET /health', () => {
            test('should return basic health status', async () => {
                const response = await request(app)
                    .get('/health')
                    .expect(200);

                expect(response.body).toHaveProperty('status', 'healthy');
                expect(response.body).toHaveProperty('timestamp');
                expect(response.body).toHaveProperty('uptime');
                expect(response.body).toHaveProperty('version');
                expect(response.body).toHaveProperty('environment');
            });

            test('should return detailed health check', async () => {
                const response = await request(app)
                    .get('/health/detailed')
                    .expect(200);

                expect(response.body).toHaveProperty('status', 'healthy');
                expect(response.body).toHaveProperty('checks');
                expect(response.body.checks).toBeInstanceOf(Array);
                expect(response.body.checks.length).toBeGreaterThan(0);
                
                // Check for specific health checks
                const checkNames = response.body.checks.map(check => check.name);
                expect(checkNames).toContain('memory');
                expect(checkNames).toContain('cpu');
                expect(checkNames).toContain('disk');
            });

            test('should return health check with dependencies', async () => {
                const response = await request(app)
                    .get('/health/dependencies')
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body).toHaveProperty('dependencies');
                expect(response.body.dependencies).toBeInstanceOf(Array);
                
                // Check for common dependencies
                const dependencyNames = response.body.dependencies.map(dep => dep.name);
                expect(dependencyNames).toContain('database');
                expect(dependencyNames).toContain('redis');
            });

            test('should return health check with performance metrics', async () => {
                const response = await request(app)
                    .get('/health/performance')
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body).toHaveProperty('performance');
                expect(response.body.performance).toHaveProperty('memory');
                expect(response.body.performance).toHaveProperty('cpu');
                expect(response.body.performance).toHaveProperty('response_times');
            });

            test('should return health check with all information', async () => {
                const response = await request(app)
                    .get('/health/full')
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body).toHaveProperty('timestamp');
                expect(response.body).toHaveProperty('uptime');
                expect(response.body).toHaveProperty('version');
                expect(response.body).toHaveProperty('environment');
                expect(response.body).toHaveProperty('checks');
                expect(response.body).toHaveProperty('dependencies');
                expect(response.body).toHaveProperty('performance');
                expect(response.body).toHaveProperty('alerts');
            });
        });

        describe('GET /health/:service', () => {
            test('should check database health', async () => {
                const response = await request(app)
                    .get('/health/database')
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body).toHaveProperty('service', 'database');
                expect(response.body).toHaveProperty('details');
                expect(response.body.details).toHaveProperty('connection');
                expect(response.body.details).toHaveProperty('response_time');
            });

            test('should check Redis health', async () => {
                const response = await request(app)
                    .get('/health/redis')
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body).toHaveProperty('service', 'redis');
                expect(response.body).toHaveProperty('details');
                expect(response.body.details).toHaveProperty('connection');
                expect(response.body.details).toHaveProperty('memory_usage');
            });

            test('should check external services health', async () => {
                const response = await request(app)
                    .get('/health/external-services')
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body).toHaveProperty('service', 'external-services');
                expect(response.body).toHaveProperty('details');
                expect(response.body.details).toBeInstanceOf(Array);
            });

            test('should return 503 for unhealthy service', async () => {
                // Mock unhealthy service
                jest.spyOn(healthCheckService, 'checkServiceHealth').mockResolvedValueOnce({
                    status: 'unhealthy',
                    service: 'database',
                    error: 'Connection timeout',
                    timestamp: new Date().toISOString()
                });

                const response = await request(app)
                    .get('/health/database')
                    .expect(503);

                expect(response.body).toHaveProperty('status', 'unhealthy');
                expect(response.body).toHaveProperty('error');
            });
        });

        describe('POST /health/alerts', () => {
            test('should create health alert', async () => {
                const alertData = {
                    name: 'high_memory_usage',
                    condition: 'memory.usage > 80',
                    severity: 'warning',
                    enabled: true
                };

                const response = await request(app)
                    .post('/health/alerts')
                    .send(alertData)
                    .expect(201);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('alert');
                expect(response.body.alert).toHaveProperty('name', 'high_memory_usage');
                expect(response.body.alert).toHaveProperty('enabled', true);
            });

            test('should validate alert configuration', async () => {
                const invalidAlert = {
                    name: '',
                    condition: 'invalid condition',
                    severity: 'invalid'
                };

                const response = await request(app)
                    .post('/health/alerts')
                    .send(invalidAlert)
                    .expect(400);

                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toContain('Validation error');
            });
        });

        describe('GET /health/alerts', () => {
            test('should get all health alerts', async () => {
                // Add some test alerts
                await healthCheckService.createAlert({
                    name: 'high_cpu',
                    condition: 'cpu.usage > 90',
                    severity: 'critical'
                });

                await healthCheckService.createAlert({
                    name: 'high_memory',
                    condition: 'memory.usage > 85',
                    severity: 'warning'
                });

                const response = await request(app)
                    .get('/health/alerts')
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('alerts');
                expect(response.body.alerts).toBeInstanceOf(Array);
                expect(response.body.alerts.length).toBeGreaterThanOrEqual(2);
            });
        });

        describe('DELETE /health/alerts/:name', () => {
            test('should delete health alert', async () => {
                // Create alert first
                await healthCheckService.createAlert({
                    name: 'test_alert',
                    condition: 'test > 0',
                    severity: 'info'
                });

                const response = await request(app)
                    .delete('/health/alerts/test_alert')
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('message', 'Alert deleted successfully');
            });
        });
    });

    describe('Health Check Service Integration', () => {
        test('should integrate with logging service', async () => {
            const logSpy = jest.spyOn(loggingService, 'logInfo');

            await request(app)
                .get('/health')
                .expect(200);

            expect(logSpy).toHaveBeenCalledWith('health_check', 'Health check performed', expect.any(Object));
        });

        test('should integrate with monitoring service', async () => {
            const metricSpy = jest.spyOn(monitoringService, 'trackMetric');

            await request(app)
                .get('/health/detailed')
                .expect(200);

            expect(metricSpy).toHaveBeenCalledWith('health_check_duration', expect.any(Number), expect.any(Object));
        });

        test('should emit health check events', async () => {
            const healthSpy = jest.fn();
            healthCheckService.on('health_check', healthSpy);

            await request(app)
                .get('/health')
                .expect(200);

            expect(healthSpy).toHaveBeenCalledWith(expect.objectContaining({
                status: expect.any(String),
                timestamp: expect.any(String)
            }));
        });
    });

    describe('Health Check Monitoring and Alerts', () => {
        test('should detect and alert on health issues', async () => {
            // Mock unhealthy condition
            jest.spyOn(healthCheckService, 'checkMemoryHealth').mockResolvedValueOnce({
                name: 'memory',
                status: 'unhealthy',
                details: { usage: 95, threshold: 80 },
                timestamp: new Date().toISOString()
            });

            const alertSpy = jest.fn();
            healthCheckService.on('alert', alertSpy);

            const response = await request(app)
                .get('/health/detailed')
                .expect(200);

            expect(response.body.status).toBe('unhealthy');
            expect(alertSpy).toHaveBeenCalledWith(expect.objectContaining({
                name: 'memory',
                severity: expect.any(String)
            }));
        });

        test('should track health check history', async () => {
            // Perform multiple health checks
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .get('/health')
                    .expect(200);
            }

            const history = healthCheckService.getHealthHistory();
            expect(history).toBeInstanceOf(Array);
            expect(history.length).toBeGreaterThanOrEqual(5);
            
            history.forEach(entry => {
                expect(entry).toHaveProperty('status');
                expect(entry).toHaveProperty('timestamp');
                expect(entry).toHaveProperty('checks');
            });
        });

        test('should calculate health check statistics', async () => {
            // Add various health check results
            healthCheckService.healthHistory = [
                { status: 'healthy', timestamp: new Date() },
                { status: 'healthy', timestamp: new Date() },
                { status: 'warning', timestamp: new Date() },
                { status: 'healthy', timestamp: new Date() },
                { status: 'unhealthy', timestamp: new Date() }
            ];

            const stats = healthCheckService.getHealthStatistics();
            
            expect(stats).toHaveProperty('totalChecks');
            expect(stats).toHaveProperty('healthyChecks');
            expect(stats).toHaveProperty('unhealthyChecks');
            expect(stats).toHaveProperty('warningChecks');
            expect(stats).toHaveProperty('uptimePercentage');
            
            expect(stats.totalChecks).toBe(5);
            expect(stats.healthyChecks).toBe(3);
            expect(stats.unhealthyChecks).toBe(1);
            expect(stats.warningChecks).toBe(1);
            expect(stats.uptimePercentage).toBe(60); // 3 healthy out of 5 total
        });
    });

    describe('Health Check Dependencies', () => {
        test('should monitor all system dependencies', async () => {
            const response = await request(app)
                .get('/health/dependencies')
                .expect(200);

            expect(response.body.dependencies).toBeInstanceOf(Array);
            
            const dependencyNames = response.body.dependencies.map(dep => dep.name);
            
            // Check for common dependencies
            expect(dependencyNames).toContain('database');
            expect(dependencyNames).toContain('redis');
            expect(dependencyNames).toContain('logging_service');
            expect(dependencyNames).toContain('monitoring_service');
            expect(dependencyNames).toContain('analytics_service');
        });

        test('should detect dependency failures', async () => {
            // Mock failed dependency
            jest.spyOn(healthCheckService, 'checkDependency').mockImplementationOnce((name) => {
                return Promise.resolve({
                    name,
                    status: 'unhealthy',
                    error: 'Connection refused',
                    response_time: 5000
                });
            });

            const response = await request(app)
                .get('/health/dependencies')
                .expect(200);

            const failedDependency = response.body.dependencies.find(dep => dep.status === 'unhealthy');
            expect(failedDependency).toBeDefined();
            expect(failedDependency).toHaveProperty('error');
        });

        test('should track dependency response times', async () => {
            const response = await request(app)
                .get('/health/dependencies')
                .expect(200);

            response.body.dependencies.forEach(dep => {
                expect(dep).toHaveProperty('response_time');
                expect(typeof dep.response_time).toBe('number');
                expect(dep.response_time).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('Health Check Performance Monitoring', () => {
        test('should monitor system performance metrics', async () => {
            const response = await request(app)
                .get('/health/performance')
                .expect(200);

            expect(response.body.performance).toHaveProperty('memory');
            expect(response.body.performance).toHaveProperty('cpu');
            expect(response.body.performance).toHaveProperty('disk');
            expect(response.body.performance).toHaveProperty('response_times');
            
            // Check memory metrics
            expect(response.body.performance.memory).toHaveProperty('usage');
            expect(response.body.performance.memory).toHaveProperty('total');
            expect(response.body.performance.memory).toHaveProperty('free');
            
            // Check CPU metrics
            expect(response.body.performance.cpu).toHaveProperty('usage');
            expect(response.body.performance.cpu).toHaveProperty('cores');
            
            // Check response times
            expect(response.body.performance.response_times).toHaveProperty('average');
            expect(response.body.performance.response_times).toHaveProperty('p95');
            expect(response.body.performance.response_times).toHaveProperty('p99');
        });

        test('should detect performance degradation', async () => {
            // Mock high response times
            jest.spyOn(healthCheckService, 'getResponseTimeMetrics').mockReturnValueOnce({
                average: 2000,
                p95: 5000,
                p99: 10000
            });

            const response = await request(app)
                .get('/health/performance')
                .expect(200);

            expect(response.body.performance.response_times.average).toBe(2000);
            expect(response.body.performance.response_times.p95).toBe(5000);
            expect(response.body.performance.response_times.p99).toBe(10000);
        });

        test('should track performance trends', async () => {
            // Add performance history
            healthCheckService.performanceHistory = [
                { timestamp: new Date(Date.now() - 3600000), response_time: 100 },
                { timestamp: new Date(Date.now() - 1800000), response_time: 150 },
                { timestamp: new Date(), response_time: 200 }
            ];

            const trends = healthCheckService.getPerformanceTrends();
            
            expect(trends).toHaveProperty('response_time_trend');
            expect(trends).toHaveProperty('memory_trend');
            expect(trends).toHaveProperty('cpu_trend');
            expect(trends.response_time_trend).toBe('increasing');
        });
    });

    describe('Health Check Error Handling and Recovery', () => {
        test('should handle health check errors gracefully', async () => {
            // Mock error in health check
            jest.spyOn(healthCheckService, 'checkMemoryHealth').mockRejectedValueOnce(new Error('Memory check failed'));

            const response = await request(app)
                .get('/health/detailed')
                .expect(200);

            expect(response.body.status).toBe('unhealthy');
            expect(response.body.checks).toContainEqual(expect.objectContaining({
                name: 'memory',
                status: 'error',
                error: 'Memory check failed'
            }));
        });

        test('should recover from transient health check failures', async () => {
            let callCount = 0;
            jest.spyOn(healthCheckService, 'checkMemoryHealth').mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('Temporary failure'));
                }
                return Promise.resolve({
                    name: 'memory',
                    status: 'healthy',
                    details: { usage: 50, threshold: 80 }
                });
            });

            // First call should fail
            const response1 = await request(app)
                .get('/health/detailed')
                .expect(200);

            expect(response1.body.status).toBe('unhealthy');

            // Wait for retry
            await new Promise(resolve => setTimeout(resolve, 100));

            // Second call should succeed
            const response2 = await request(app)
                .get('/health/detailed')
                .expect(200);

            expect(response2.body.status).toBe('healthy');
        });

        test('should handle missing health check dependencies', async () => {
            // Mock missing dependency
            jest.spyOn(healthCheckService, 'checkDependency').mockRejectedValueOnce(new Error('Dependency not found'));

            const response = await request(app)
                .get('/health/dependencies')
                .expect(200);

            expect(response.body.dependencies).toContainEqual(expect.objectContaining({
                status: 'error',
                error: 'Dependency not found'
            }));
        });
    });

    describe('Health Check Security and Validation', () => {
        test('should validate health check parameters', async () => {
            const response = await request(app)
                .get('/health/invalid-service')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invalid service name');
        });

        test('should handle health check rate limiting', async () => {
            // Make multiple rapid requests
            const requests = [];
            for (let i = 0; i < 10; i++) {
                requests.push(request(app).get('/health'));
            }

            const responses = await Promise.all(requests);
            
            // Some requests should be rate limited
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });

        test('should sanitize health check responses', async () => {
            // Add sensitive data to health check
            jest.spyOn(healthCheckService, 'checkDatabaseHealth').mockResolvedValueOnce({
                name: 'database',
                status: 'healthy',
                details: {
                    connection_string: 'postgresql://user:password@host:5432/db',
                    api_key: 'secret-key-123'
                }
            });

            const response = await request(app)
                .get('/health/database')
                .expect(200);

            // Sensitive data should be sanitized
            expect(response.body.details.connection_string).toBe('[REDACTED]');
            expect(response.body.details.api_key).toBe('[REDACTED]');
        });
    });

    describe('Health Check Service Configuration', () => {
        test('should support custom health check intervals', async () => {
            const customHealthCheckService = new HealthCheckService({
                checkInterval: 5000, // 5 seconds
                timeout: 3000 // 3 seconds
            });

            await customHealthCheckService.initialize();

            expect(customHealthCheckService.config.checkInterval).toBe(5000);
            expect(customHealthCheckService.config.timeout).toBe(3000);

            await customHealthCheckService.cleanup();
        });

        test('should support custom thresholds', async () => {
            const customHealthCheckService = new HealthCheckService({
                thresholds: {
                    memory: { warning: 70, critical: 85 },
                    cpu: { warning: 60, critical: 80 },
                    response_time: { warning: 1000, critical: 2000 }
                }
            });

            await customHealthCheckService.initialize();

            expect(customHealthCheckService.config.thresholds.memory.warning).toBe(70);
            expect(customHealthCheckService.config.thresholds.cpu.critical).toBe(80);

            await customHealthCheckService.cleanup();
        });

        test('should support custom health checks', async () => {
            const customCheck = {
                name: 'custom_check',
                check: async () => {
                    return {
                        status: 'healthy',
                        details: { custom_metric: 42 }
                    };
                }
            };

            healthCheckService.registerHealthCheck(customCheck);

            const response = await request(app)
                .get('/health/detailed')
                .expect(200);

            const customCheckResult = response.body.checks.find(check => check.name === 'custom_check');
            expect(customCheckResult).toBeDefined();
            expect(customCheckResult.status).toBe('healthy');
            expect(customCheckResult.details.custom_metric).toBe(42);
        });
    });
});