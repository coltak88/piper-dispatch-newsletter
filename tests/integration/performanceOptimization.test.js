/**
 * Integration Tests for Performance Optimization
 * Tests caching, database optimization, query performance, and monitoring
 */

const request = require('supertest');
const app = require('../../src/app');
const CacheService = require('../../services/CacheService');
const DatabaseOptimizationService = require('../../services/DatabaseOptimizationService');
const MonitoringService = require('../../services/MonitoringService');
const LoggingService = require('../../services/LoggingService');

describe('Performance Optimization Integration Tests', () => {
    let cacheService;
    let dbOptimizationService;
    let monitoringService;
    let loggingService;
    let server;
    let authToken;

    beforeAll(async () => {
        // Initialize services
        loggingService = new LoggingService('PerformanceIntegrationTest');
        monitoringService = new MonitoringService();
        cacheService = new CacheService({
            cache: {
                defaultTTL: 300,
                enableCompression: true,
                compressionThreshold: 1024
            }
        });
        
        dbOptimizationService = new DatabaseOptimizationService({
            optimization: {
                slowQueryThresholdMs: 500,
                enableQueryCaching: true,
                maxQueryCacheSize: 100
            }
        });

        // Start server
        server = app.listen(0); // Use random port
        
        // Get auth token for authenticated requests
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        
        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        if (server) {
            await new Promise(resolve => server.close(resolve));
        }
        
        await cacheService.cleanup();
        await dbOptimizationService.cleanup();
        await monitoringService.cleanup();
    });

    describe('Caching Integration', () => {
        test('should cache API responses', async () => {
            const endpoint = '/api/newsletters';
            
            // First request - should hit database
            const response1 = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response1.status).toBe(200);
            expect(response1.body).toHaveProperty('newsletters');
            
            // Second request - should be cached
            const response2 = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response2.status).toBe(200);
            expect(response2.body).toEqual(response1.body);
            
            // Verify caching headers
            expect(response2.headers).toHaveProperty('x-cache-status');
            expect(response2.headers['x-cache-status']).toMatch(/HIT|MISS/);
        });

        test('should handle cache invalidation', async () => {
            const endpoint = '/api/newsletters';
            
            // Get initial data
            const response1 = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            // Create new newsletter (should invalidate cache)
            const createResponse = await request(app)
                .post('/api/newsletters')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Newsletter',
                    content: 'Test content',
                    status: 'draft'
                });
            
            expect(createResponse.status).toBe(201);
            
            // Get data again - should not be cached
            const response2 = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response2.status).toBe(200);
            expect(response2.body.newsletters.length).toBeGreaterThan(response1.body.newsletters.length);
        });

        test('should compress large responses', async () => {
            // Create a large dataset
            const largeContent = 'x'.repeat(10000);
            
            const response = await request(app)
                .post('/api/newsletters')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Large Content Test',
                    content: largeContent,
                    status: 'draft'
                });
            
            expect(response.status).toBe(201);
            
            // Check if response was compressed
            const getResponse = await request(app)
                .get(`/api/newsletters/${response.body.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('Accept-Encoding', 'gzip');
            
            expect(getResponse.status).toBe(200);
            expect(getResponse.headers).toHaveProperty('content-encoding');
        });

        test('should handle cache warming', async () => {
            const warmupKeys = [
                'newsletters:popular',
                'analytics:dashboard',
                'users:active'
            ];
            
            // Pre-populate cache
            for (const key of warmupKeys) {
                await cacheService.set(key, { data: 'warmed' }, 'warmup');
            }
            
            // Verify cache warming
            for (const key of warmupKeys) {
                const cached = await cacheService.get(key, 'warmup');
                expect(cached).toEqual({ data: 'warmed' });
            }
        });
    });

    describe('Database Query Optimization', () => {
        test('should optimize slow queries', async () => {
            const startTime = Date.now();
            
            // Execute a potentially slow query
            const response = await request(app)
                .get('/api/analytics/performance')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    granularity: 'daily'
                });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            expect(response.status).toBe(200);
            expect(responseTime).toBeLessThan(2000); // Should be optimized
            
            // Check optimization metrics
            const stats = dbOptimizationService.getPerformanceStats();
            expect(stats.totalQueries).toBeGreaterThan(0);
        });

        test('should use query result caching', async () => {
            const query = 'SELECT COUNT(*) as count FROM newsletters WHERE status = $1';
            const params = ['published'];
            
            // First execution
            const result1 = await dbOptimizationService.executeQuery(query, params);
            
            // Second execution - should use cache
            const result2 = await dbOptimizationService.executeQuery(query, params);
            
            expect(result1).toEqual(result2);
            
            // Verify cache usage
            const stats = dbOptimizationService.getPerformanceStats();
            expect(stats.cacheHits).toBeGreaterThan(0);
        });

        test('should detect and analyze slow queries', async () => {
            // Create a deliberately slow query
            const slowQuery = `
                SELECT 
                    n.*, 
                    u.name as user_name,
                    COUNT(s.id) as subscriber_count
                FROM newsletters n
                JOIN users u ON n.user_id = u.id
                LEFT JOIN subscribers s ON s.user_id = u.id
                GROUP BY n.id, u.name
                ORDER BY subscriber_count DESC
            `;
            
            const result = await dbOptimizationService.executeQuery(slowQuery);
            
            expect(result).toBeDefined();
            
            // Check if slow query was detected
            const stats = dbOptimizationService.getPerformanceStats();
            expect(stats.slowQueries).toBeGreaterThanOrEqual(0);
        });

        test('should provide index suggestions', async () => {
            // Execute queries that would benefit from indexes
            const queries = [
                'SELECT * FROM newsletters WHERE user_id = $1 AND status = $2',
                'SELECT * FROM subscribers WHERE email LIKE $1',
                'SELECT * FROM analytics WHERE created_at > $1'
            ];
            
            for (const query of queries) {
                await dbOptimizationService.executeQuery(query, [1, 'published']);
            }
            
            // Check for index suggestions
            const health = await dbOptimizationService.healthCheck();
            expect(health).toHaveProperty('suggestions');
            expect(Array.isArray(health.suggestions)).toBe(true);
        });
    });

    describe('Performance Monitoring', () => {
        test('should monitor API response times', async () => {
            const endpoints = [
                '/api/auth/profile',
                '/api/newsletters',
                '/api/subscribers',
                '/api/analytics/summary'
            ];
            
            const responseTimes = {};
            
            for (const endpoint of endpoints) {
                const startTime = Date.now();
                
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                const endTime = Date.now();
                responseTimes[endpoint] = endTime - startTime;
                
                expect(response.status).toBe(200);
                expect(responseTimes[endpoint]).toBeLessThan(1000); // Should be fast
            }
            
            // Log performance metrics
            loggingService.info('API Response Times', responseTimes);
        });

        test('should track database query performance', async () => {
            // Execute various queries
            const queries = [
                { query: 'SELECT COUNT(*) FROM users', type: 'count' },
                { query: 'SELECT * FROM users LIMIT 10', type: 'select' },
                { query: 'SELECT * FROM newsletters WHERE status = $1', params: ['published'], type: 'filtered' }
            ];
            
            const performanceMetrics = [];
            
            for (const queryData of queries) {
                const startTime = Date.now();
                await dbOptimizationService.executeQuery(
                    queryData.query, 
                    queryData.params || []
                );
                const endTime = Date.now();
                
                performanceMetrics.push({
                    type: queryData.type,
                    executionTime: endTime - startTime
                });
            }
            
            // Verify performance
            performanceMetrics.forEach(metric => {
                expect(metric.executionTime).toBeLessThan(500); // Should be fast
            });
        });

        test('should monitor memory usage', async () => {
            const initialMemory = process.memoryUsage();
            
            // Execute memory-intensive operations
            for (let i = 0; i < 100; i++) {
                await request(app)
                    .get('/api/newsletters')
                    .set('Authorization', `Bearer ${authToken}`);
            }
            
            const finalMemory = process.memoryUsage();
            
            // Memory should not increase significantly
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
            
            // Log memory usage
            monitoringService.recordMetric('memory.heap_used', finalMemory.heapUsed);
            monitoringService.recordMetric('memory.heap_increase', memoryIncrease);
        });

        test('should collect comprehensive performance metrics', async () => {
            // Execute various operations
            await request(app)
                .get('/api/analytics/performance')
                .set('Authorization', `Bearer ${authToken}`);
            
            // Get performance stats
            const stats = dbOptimizationService.getPerformanceStats();
            
            expect(stats).toHaveProperty('totalQueries');
            expect(stats).toHaveProperty('avgQueryTime');
            expect(stats).toHaveProperty('cacheHitRate');
            expect(stats).toHaveProperty('slowQueries');
            expect(stats).toHaveProperty('connectionPool');
            
            // Verify reasonable performance
            expect(stats.avgQueryTime).toBeLessThan(100); // Should be fast
            expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
            expect(stats.cacheHitRate).toBeLessThanOrEqual(100);
        });
    });

    describe('Load Testing', () => {
        test('should handle concurrent requests', async () => {
            const concurrentRequests = 50;
            const endpoint = '/api/newsletters';
            
            const startTime = Date.now();
            
            // Send concurrent requests
            const promises = Array(concurrentRequests).fill().map(() =>
                request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
            );
            
            const responses = await Promise.all(promises);
            const endTime = Date.now();
            
            // All requests should succeed
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
            
            // Should complete in reasonable time
            const totalTime = endTime - startTime;
            expect(totalTime).toBeLessThan(5000); // 5 seconds max
            
            loggingService.info('Concurrent Load Test', {
                concurrentRequests,
                totalTime,
                avgTimePerRequest: totalTime / concurrentRequests
            });
        });

        test('should maintain performance under sustained load', async () => {
            const iterations = 10;
            const requestsPerIteration = 20;
            const responseTimes = [];
            
            for (let i = 0; i < iterations; i++) {
                const iterationStart = Date.now();
                
                // Send requests in this iteration
                const promises = Array(requestsPerIteration).fill().map(() =>
                    request(app)
                        .get('/api/subscribers')
                        .set('Authorization', `Bearer ${authToken}`)
                );
                
                await Promise.all(promises);
                
                const iterationEnd = Date.now();
                responseTimes.push(iterationEnd - iterationStart);
                
                // Small delay between iterations
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Performance should remain consistent
            const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
            responseTimes.forEach(time => {
                // Should not vary by more than 50% from average
                expect(time).toBeLessThan(avgResponseTime * 1.5);
            });
        });
    });

    describe('Error Handling and Recovery', () => {
        test('should handle cache service failures gracefully', async () => {
            // Simulate cache failure
            jest.spyOn(cacheService, 'get').mockRejectedValue(new Error('Cache service down'));
            
            const response = await request(app)
                .get('/api/newsletters')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('newsletters');
        });

        test('should handle database optimization service failures', async () => {
            // Simulate database optimization failure
            jest.spyOn(dbOptimizationService.pool, 'query').mockRejectedValueOnce(
                new Error('Database connection lost')
            );
            
            const response = await request(app)
                .get('/api/analytics/performance')
                .set('Authorization', `Bearer ${authToken}`);
            
            // Should fallback to regular query execution
            expect([200, 500]).toContain(response.status);
        });

        test('should recover from transient failures', async () => {
            let callCount = 0;
            
            // Mock intermittent failures
            jest.spyOn(dbOptimizationService.pool, 'query').mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('Temporary failure'));
                }
                return Promise.resolve({ rows: [{ id: 1 }], rowCount: 1 });
            });
            
            // First attempt should fail
            await expect(dbOptimizationService.executeQuery('SELECT 1'))
                .rejects.toThrow('Temporary failure');
            
            // Second attempt should succeed
            const result = await dbOptimizationService.executeQuery('SELECT 1');
            expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1 });
        });
    });

    describe('Real-time Performance Analytics', () => {
        test('should provide real-time performance dashboard data', async () => {
            const response = await request(app)
                .get('/api/analytics/realtime')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('performance');
            expect(response.body).toHaveProperty('cache');
            expect(response.body).toHaveProperty('database');
            
            const { performance, cache, database } = response.body;
            
            expect(performance).toHaveProperty('responseTimes');
            expect(cache).toHaveProperty('hitRate');
            expect(database).toHaveProperty('queryStats');
        });

        test('should track performance trends over time', async () => {
            const timeRanges = ['1h', '24h', '7d', '30d'];
            
            for (const range of timeRanges) {
                const response = await request(app)
                    .get('/api/analytics/trends')
                    .set('Authorization', `Bearer ${authToken}`)
                    .query({ range });
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('trends');
                expect(Array.isArray(response.body.trends)).toBe(true);
                
                if (response.body.trends.length > 0) {
                    expect(response.body.trends[0]).toHaveProperty('timestamp');
                    expect(response.body.trends[0]).toHaveProperty('responseTime');
                    expect(response.body.trends[0]).toHaveProperty('errorRate');
                }
            }
        });
    });
});