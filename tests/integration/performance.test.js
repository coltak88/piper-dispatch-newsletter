const request = require('supertest');
const app = require('../../app');
const redis = require('../../config/redis');
const { PerformanceObserver } = require('perf_hooks');
const monitoringService = require('../../services/MonitoringService');
const loggingService = require('../../services/LoggingService');
const analyticsService = require('../../services/AnalyticsService');

describe('Performance Integration Tests', () => {
    let performanceMetrics;
    let performanceObserver;

    beforeAll(async () => {
        // Initialize performance monitoring
        performanceMetrics = new Map();
        
        // Set up performance observer
        performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                performanceMetrics.set(entry.name, {
                    duration: entry.duration,
                    startTime: entry.startTime,
                    entryType: entry.entryType
                });
            });
        });
        
        performanceObserver.observe({ entryTypes: ['measure', 'mark'] });
    });

    afterAll(async () => {
        if (performanceObserver) {
            performanceObserver.disconnect();
        }
        await redis.quit();
    });

    beforeEach(() => {
        // Clear performance metrics before each test
        performanceMetrics.clear();
        
        // Clear Redis cache
        if (redis && redis.flushAll) {
            redis.flushAll();
        }
    });

    describe('API Response Time Performance', () => {
        test('should measure API endpoint response times', async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
            expect(response.body).toHaveProperty('status', 'healthy');
            
            // Log performance metric
            await loggingService.logInfo('performance', 'API response time measured', {
                endpoint: '/api/health',
                responseTime,
                statusCode: 200
            });
        });

        test('should measure database query performance', async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get('/api/users')
                .expect(200);
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            expect(responseTime).toBeLessThan(2000); // Database queries should be fast
            expect(response.body).toHaveProperty('users');
            
            // Track in monitoring service
            await monitoringService.trackMetric('database_query_time', responseTime, {
                query: 'users_list',
                result_count: response.body.users.length
            });
        });

        test('should measure concurrent request performance', async () => {
            const concurrentRequests = 10;
            const startTime = Date.now();
            
            // Make concurrent requests
            const requests = Array(concurrentRequests).fill().map(() => 
                request(app).get('/api/health')
            );
            
            const responses = await Promise.all(requests);
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            
            // All requests should succeed
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('status', 'healthy');
            });
            
            // Total time should be reasonable even with concurrency
            expect(totalTime).toBeLessThan(2000);
            
            // Track concurrent performance
            await analyticsService.trackEvent('performance_test', 'system', {
                concurrent_requests: concurrentRequests,
                total_time: totalTime,
                average_time: totalTime / concurrentRequests
            });
        });

        test('should measure large payload processing performance', async () => {
            const largePayload = {
                items: Array(1000).fill().map((_, i) => ({
                    id: i,
                    name: `Item ${i}`,
                    description: `Description for item ${i}`,
                    price: Math.random() * 100,
                    category: ['electronics', 'clothing', 'books'][Math.floor(Math.random() * 3)]
                }))
            };
            
            const startTime = Date.now();
            
            const response = await request(app)
                .post('/api/products/bulk')
                .send(largePayload)
                .expect(200);
            
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            expect(processingTime).toBeLessThan(5000); // Should process large payload within 5 seconds
            expect(response.body).toHaveProperty('processed', 1000);
            
            // Track large payload performance
            await monitoringService.trackMetric('large_payload_processing_time', processingTime, {
                payload_size: JSON.stringify(largePayload).length,
                item_count: largePayload.items.length
            });
        });
    });

    describe('Caching Performance', () => {
        test('should measure cache hit performance improvement', async () => {
            const cacheKey = 'test_cache_key';
            const cacheValue = { data: 'test_data', timestamp: Date.now() };
            
            // First request - cache miss
            const start1 = Date.now();
            const response1 = await request(app)
                .get(`/api/data/${cacheKey}`)
                .expect(200);
            const time1 = Date.now() - start1;
            
            // Set cache value
            await redis.setex(cacheKey, 300, JSON.stringify(cacheValue));
            
            // Second request - cache hit
            const start2 = Date.now();
            const response2 = await request(app)
                .get(`/api/data/${cacheKey}`)
                .expect(200);
            const time2 = Date.now() - start2;
            
            // Cache hit should be significantly faster
            expect(time2).toBeLessThan(time1 / 2);
            expect(response2.body).toEqual(cacheValue);
            
            // Track cache performance
            await analyticsService.trackEvent('cache_performance', 'system', {
                cache_key: cacheKey,
                cache_miss_time: time1,
                cache_hit_time: time2,
                improvement: ((time1 - time2) / time1 * 100).toFixed(2) + '%'
            });
        });

        test('should measure Redis connection performance', async () => {
            const startTime = Date.now();
            
            // Test Redis connection
            const redisResponse = await redis.ping();
            const connectionTime = Date.now() - startTime;
            
            expect(redisResponse).toBe('PONG');
            expect(connectionTime).toBeLessThan(100); // Redis should respond very quickly
            
            // Test multiple operations
            const operations = 100;
            const opsStart = Date.now();
            
            for (let i = 0; i < operations; i++) {
                await redis.set(`perf_test_${i}`, `value_${i}`);
            }
            
            const opsTime = Date.now() - opsStart;
            const avgOpTime = opsTime / operations;
            
            expect(avgOpTime).toBeLessThan(10); // Average operation should be very fast
            
            // Track Redis performance
            await monitoringService.trackMetric('redis_performance', avgOpTime, {
                operations,
                total_time: opsTime,
                connection_time: connectionTime
            });
        });

        test('should measure cache invalidation performance', async () => {
            const keys = Array(50).fill().map((_, i) => `cache_key_${i}`);
            
            // Set multiple cache keys
            for (const key of keys) {
                await redis.setex(key, 300, JSON.stringify({ data: key }));
            }
            
            const startTime = Date.now();
            
            // Invalidate all keys
            await redis.del(keys);
            
            const invalidationTime = Date.now() - startTime;
            
            expect(invalidationTime).toBeLessThan(100); // Should invalidate quickly
            
            // Verify all keys are deleted
            for (const key of keys) {
                const value = await redis.get(key);
                expect(value).toBeNull();
            }
            
            // Track cache invalidation performance
            await analyticsService.trackEvent('cache_invalidation', 'system', {
                keys_count: keys.length,
                invalidation_time: invalidationTime,
                average_time_per_key: invalidationTime / keys.length
            });
        });
    });

    describe('Database Performance', () => {
        test('should measure database query optimization', async () => {
            // Create test data
            const testUsers = Array(100).fill().map((_, i) => ({
                username: `user_${i}`,
                email: `user_${i}@example.com`,
                created_at: new Date()
            }));
            
            // Measure bulk insert performance
            const insertStart = Date.now();
            
            const response = await request(app)
                .post('/api/users/bulk')
                .send({ users: testUsers })
                .expect(201);
            
            const insertTime = Date.now() - insertStart;
            
            expect(insertTime).toBeLessThan(3000); // Bulk insert should be fast
            expect(response.body).toHaveProperty('inserted', 100);
            
            // Measure query with index performance
            const queryStart = Date.now();
            
            const queryResponse = await request(app)
                .get('/api/users/search?username=user_50')
                .expect(200);
            
            const queryTime = Date.now() - queryStart;
            
            expect(queryTime).toBeLessThan(500); // Indexed query should be fast
            expect(queryResponse.body.users).toHaveLength(1);
            expect(queryResponse.body.users[0].username).toBe('user_50');
            
            // Track database performance
            await monitoringService.trackMetric('database_performance', queryTime, {
                operation: 'indexed_query',
                record_count: queryResponse.body.users.length,
                insert_time: insertTime
            });
        });

        test('should measure database connection pooling', async () => {
            const concurrentConnections = 20;
            const startTime = Date.now();
            
            // Create multiple concurrent database connections
            const connections = Array(concurrentConnections).fill().map(async (_, i) => {
                const response = await request(app)
                    .get(`/api/users/${i + 1}`)
                    .timeout(5000);
                
                return response;
            });
            
            const results = await Promise.all(connections);
            const totalTime = Date.now() - startTime;
            
            // All connections should succeed
            results.forEach(result => {
                expect(result.status).toBe(200);
            });
            
            // Connection pooling should handle concurrency efficiently
            expect(totalTime).toBeLessThan(3000);
            
            // Track connection pooling performance
            await analyticsService.trackEvent('database_connection_pooling', 'system', {
                concurrent_connections: concurrentConnections,
                total_time: totalTime,
                average_time: totalTime / concurrentConnections
            });
        });

        test('should measure database transaction performance', async () => {
            const transactionData = {
                operations: [
                    { type: 'insert', table: 'users', data: { username: 'transaction_user', email: 'transaction@example.com' } },
                    { type: 'update', table: 'users', id: 1, data: { last_login: new Date() } },
                    { type: 'delete', table: 'sessions', user_id: 1 }
                ]
            };
            
            const startTime = Date.now();
            
            const response = await request(app)
                .post('/api/transactions/execute')
                .send(transactionData)
                .expect(200);
            
            const transactionTime = Date.now() - startTime;
            
            expect(transactionTime).toBeLessThan(2000); // Transaction should complete quickly
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('operations_completed', 3);
            
            // Track transaction performance
            await monitoringService.trackMetric('database_transaction_time', transactionTime, {
                operations_count: transactionData.operations.length,
                transaction_type: 'mixed_operations'
            });
        });
    });

    describe('Memory and Resource Usage', () => {
        test('should monitor memory usage during operations', async () => {
            const initialMemory = process.memoryUsage();
            
            // Perform memory-intensive operation
            const largeArray = Array(1000000).fill().map((_, i) => ({
                id: i,
                data: `Large data string ${i}`.repeat(100)
            }));
            
            const response = await request(app)
                .post('/api/data/large')
                .send({ items: largeArray })
                .expect(200);
            
            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            
            expect(response.body).toHaveProperty('processed', 1000000);
            expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // Memory increase should be reasonable
            
            // Track memory usage
            await analyticsService.trackEvent('memory_usage', 'system', {
                operation: 'large_data_processing',
                initial_memory: initialMemory.heapUsed,
                final_memory: finalMemory.heapUsed,
                memory_increase: memoryIncrease,
                item_count: largeArray.length
            });
        });

        test('should measure garbage collection impact', async () => {
            const gcStart = Date.now();
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const gcTime = Date.now() - gcStart;
            
            // Measure performance before and after GC
            const beforeGC = process.memoryUsage();
            
            // Create some garbage
            const tempData = Array(10000).fill().map(() => ({
                large: 'x'.repeat(1000),
                nested: { deep: { data: Math.random() } }
            }));
            
            // Clear reference to allow GC
            tempData.length = 0;
            
            const afterGC = process.memoryUsage();
            
            // Track GC performance
            await monitoringService.trackMetric('garbage_collection_impact', gcTime, {
                memory_before: beforeGC.heapUsed,
                memory_after: afterGC.heapUsed,
                memory_reclaimed: beforeGC.heapUsed - afterGC.heapUsed
            });
            
            expect(gcTime).toBeLessThan(1000); // GC should be fast
        });

        test('should monitor CPU usage during operations', async () => {
            const startCpuUsage = process.cpuUsage();
            
            // CPU-intensive operation
            const response = await request(app)
                .get('/api/data/calculate?iterations=1000000')
                .expect(200);
            
            const endCpuUsage = process.cpuUsage(startCpuUsage);
            const cpuPercent = (endCpuUsage.user + endCpuUsage.system) / 1000000 * 100;
            
            expect(response.body).toHaveProperty('result');
            expect(cpuPercent).toBeLessThan(50); // CPU usage should be reasonable
            
            // Track CPU usage
            await analyticsService.trackEvent('cpu_usage', 'system', {
                operation: 'intensive_calculation',
                cpu_percent: cpuPercent,
                user_time: endCpuUsage.user,
                system_time: endCpuUsage.system
            });
        });
    });

    describe('Load Testing and Scalability', () => {
        test('should handle sustained load', async () => {
            const duration = 10000; // 10 seconds
            const requestsPerSecond = 10;
            const totalRequests = (duration / 1000) * requestsPerSecond;
            
            const results = [];
            const startTime = Date.now();
            
            // Generate sustained load
            const loadTest = setInterval(async () => {
                if (Date.now() - startTime > duration) {
                    clearInterval(loadTest);
                    return;
                }
                
                try {
                    const reqStart = Date.now();
                    const response = await request(app)
                        .get('/api/health')
                        .timeout(5000);
                    
                    const reqTime = Date.now() - reqStart;
                    results.push({
                        success: response.status === 200,
                        responseTime: reqTime,
                        timestamp: new Date()
                    });
                } catch (error) {
                    results.push({
                        success: false,
                        error: error.message,
                        timestamp: new Date()
                    });
                }
            }, 100); // 10 requests per second
            
            // Wait for load test to complete
            await new Promise(resolve => setTimeout(resolve, duration + 1000));
            
            // Analyze results
            const successfulRequests = results.filter(r => r.success);
            const failedRequests = results.filter(r => !r.success);
            const avgResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
            
            expect(successfulRequests.length).toBeGreaterThan(totalRequests * 0.95); // 95% success rate
            expect(avgResponseTime).toBeLessThan(500); // Average response time should be reasonable
            expect(failedRequests.length).toBeLessThan(totalRequests * 0.05); // Less than 5% failures
            
            // Track load test results
            await analyticsService.trackEvent('load_test_completed', 'system', {
                total_requests: results.length,
                successful_requests: successfulRequests.length,
                failed_requests: failedRequests.length,
                average_response_time: avgResponseTime,
                duration: duration,
                success_rate: (successfulRequests.length / results.length * 100).toFixed(2) + '%'
            });
        });

        test('should measure horizontal scaling performance', async () => {
            const instances = [1, 2, 4, 8];
            const results = [];
            
            for (const instanceCount of instances) {
                const startTime = Date.now();
                
                // Simulate requests distributed across instances
                const requests = Array(100).fill().map(async (_, i) => {
                    const instanceId = i % instanceCount;
                    return request(app)
                        .get(`/api/health?instance=${instanceId}`)
                        .timeout(5000);
                });
                
                const responses = await Promise.all(requests);
                const totalTime = Date.now() - startTime;
                
                const allSuccess = responses.every(r => r.status === 200);
                const avgTime = totalTime / responses.length;
                
                results.push({
                    instances: instanceCount,
                    totalTime,
                    avgTime,
                    allSuccess,
                    throughput: 100 / (totalTime / 1000) // requests per second
                });
            }
            
            // Analyze scaling performance
            results.forEach((result, index) => {
                if (index > 0) {
                    const previousResult = results[index - 1];
                    const scalingEfficiency = (previousResult.throughput / result.throughput) * (result.instances / previousResult.instances);
                    
                    expect(scalingEfficiency).toBeGreaterThan(0.7); // At least 70% scaling efficiency
                }
            });
            
            // Track scaling performance
            await monitoringService.trackMetric('horizontal_scaling_efficiency', results[results.length - 1].throughput, {
                instances: results[results.length - 1].instances,
                results: results.map(r => ({
                    instances: r.instances,
                    throughput: r.throughput,
                    efficiency: r.throughput / r.instances
                }))
            });
        });
    });

    describe('Performance Monitoring and Analytics', () => {
        test('should track performance metrics in real-time', async () => {
            const metrics = [];
            
            // Track metrics during operation
            for (let i = 0; i < 10; i++) {
                const startTime = Date.now();
                
                await request(app)
                    .get('/api/health')
                    .expect(200);
                
                const responseTime = Date.now() - startTime;
                
                metrics.push({
                    timestamp: new Date(),
                    responseTime,
                    iteration: i
                });
            }
            
            // Analyze metrics
            const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
            const maxResponseTime = Math.max(...metrics.map(m => m.responseTime));
            const minResponseTime = Math.min(...metrics.map(m => m.responseTime));
            
            expect(avgResponseTime).toBeLessThan(200);
            expect(maxResponseTime - minResponseTime).toBeLessThan(50); // Consistent performance
            
            // Track performance analytics
            await analyticsService.trackEvent('performance_metrics', 'system', {
                average_response_time: avgResponseTime,
                max_response_time: maxResponseTime,
                min_response_time: minResponseTime,
                consistency: ((maxResponseTime - minResponseTime) / avgResponseTime * 100).toFixed(2) + '%'
            });
        });

        test('should generate performance reports', async () => {
            // Collect performance data
            const performanceData = [];
            
            for (let i = 0; i < 50; i++) {
                const startTime = Date.now();
                
                await request(app)
                    .get('/api/users')
                    .expect(200);
                
                const responseTime = Date.now() - startTime;
                
                performanceData.push({
                    endpoint: '/api/users',
                    responseTime,
                    timestamp: new Date(),
                    success: true
                });
            }
            
            // Generate performance report
            const report = {
                period: 'test_period',
                endpoint: '/api/users',
                totalRequests: performanceData.length,
                averageResponseTime: performanceData.reduce((sum, d) => sum + d.responseTime, 0) / performanceData.length,
                p95ResponseTime: performanceData.map(d => d.responseTime).sort((a, b) => a - b)[Math.floor(performanceData.length * 0.95)],
                p99ResponseTime: performanceData.map(d => d.responseTime).sort((a, b) => a - b)[Math.floor(performanceData.length * 0.99)],
                successRate: (performanceData.filter(d => d.success).length / performanceData.length * 100).toFixed(2) + '%'
            };
            
            expect(report.averageResponseTime).toBeLessThan(500);
            expect(parseFloat(report.successRate)).toBeGreaterThan(95);
            
            // Store performance report
            await analyticsService.trackEvent('performance_report_generated', 'system', report);
        });
    });
});