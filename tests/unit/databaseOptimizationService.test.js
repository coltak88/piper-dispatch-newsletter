/**
 * Unit Tests for DatabaseOptimizationService
 * Tests query optimization, indexing, caching, and performance monitoring
 */

const DatabaseOptimizationService = require('../../services/DatabaseOptimizationService');
const { Pool } = require('pg');
const LoggingService = require('../../services/LoggingService');
const MonitoringService = require('../../services/MonitoringService');
const CacheService = require('../../services/CacheService');

// Mock dependencies
jest.mock('pg');
jest.mock('../../services/LoggingService');
jest.mock('../../services/MonitoringService');
jest.mock('../../services/CacheService');

describe('DatabaseOptimizationService', () => {
    let service;
    let mockPool;
    let mockLogger;
    let mockMonitoring;
    let mockCache;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup mock pool
        mockPool = {
            query: jest.fn(),
            end: jest.fn(),
            totalCount: 10,
            idleCount: 5,
            waitingCount: 0
        };
        
        Pool.mockImplementation(() => mockPool);
        
        // Setup mock logger
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        LoggingService.mockImplementation(() => mockLogger);
        
        // Setup mock monitoring
        mockMonitoring = {
            recordEvent: jest.fn(),
            recordMetric: jest.fn()
        };
        MonitoringService.mockImplementation(() => mockMonitoring);
        
        // Setup mock cache
        mockCache = {
            get: jest.fn(),
            set: jest.fn(),
            healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
            cleanup: jest.fn()
        };
        CacheService.mockImplementation(() => mockCache);
        
        process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    });

    afterEach(async () => {
        if (service) {
            await service.cleanup();
        }
        jest.useRealTimers();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with default configuration', async () => {
            service = new DatabaseOptimizationService();
            
            expect(service.config.database.max).toBe(20);
            expect(service.config.optimization.slowQueryThresholdMs).toBe(1000);
            expect(service.config.optimization.queryTimeoutMs).toBe(30000);
            expect(service.config.monitoring.performanceCheckInterval).toBe(60000);
        });

        test('should initialize with custom configuration', async () => {
            const customConfig = {
                database: { max: 50 },
                optimization: { slowQueryThresholdMs: 500 },
                monitoring: { performanceCheckInterval: 30000 }
            };
            
            service = new DatabaseOptimizationService(customConfig);
            
            expect(service.config.database.max).toBe(50);
            expect(service.config.optimization.slowQueryThresholdMs).toBe(500);
            expect(service.config.monitoring.performanceCheckInterval).toBe(30000);
        });

        test('should initialize dependencies correctly', async () => {
            service = new DatabaseOptimizationService();
            
            expect(LoggingService).toHaveBeenCalledWith('DatabaseOptimizationService');
            expect(MonitoringService).toHaveBeenCalled();
            expect(CacheService).toHaveBeenCalled();
        });

        test('should handle initialization errors gracefully', async () => {
            Pool.mockImplementation(() => {
                throw new Error('Connection failed');
            });
            
            await expect(async () => {
                service = new DatabaseOptimizationService();
                await service.init();
            }).rejects.toThrow('Connection failed');
        });
    });

    describe('Query Execution and Optimization', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
            mockPool.query.mockResolvedValue({ rows: [{ id: 1, name: 'test' }], rowCount: 1 });
        });

        test('should execute query successfully', async () => {
            const query = 'SELECT * FROM users WHERE id = $1';
            const params = [1];
            
            const result = await service.executeQuery(query, params);
            
            expect(mockPool.query).toHaveBeenCalledWith(query, params);
            expect(result).toEqual({ rows: [{ id: 1, name: 'test' }], rowCount: 1 });
            expect(mockLogger.info).toHaveBeenCalled();
        });

        test('should use cache when enabled', async () => {
            mockCache.get.mockResolvedValue({ rows: [{ cached: true }], rowCount: 1 });
            
            const query = 'SELECT * FROM users WHERE id = $1';
            const params = [1];
            
            const result = await service.executeQuery(query, params);
            
            expect(mockCache.get).toHaveBeenCalled();
            expect(result).toEqual({ rows: [{ cached: true }], rowCount: 1 });
            expect(mockPool.query).not.toHaveBeenCalled();
        });

        test('should cache query results', async () => {
            const query = 'SELECT * FROM users WHERE id = $1';
            const params = [1];
            
            await service.executeQuery(query, params);
            
            expect(mockCache.set).toHaveBeenCalled();
        });

        test('should skip cache when requested', async () => {
            const query = 'SELECT * FROM users WHERE id = $1';
            const params = [1];
            
            await service.executeQuery(query, params, { skipCache: true });
            
            expect(mockCache.get).not.toHaveBeenCalled();
            expect(mockCache.set).not.toHaveBeenCalled();
        });

        test('should handle query timeout', async () => {
            mockPool.query.mockImplementation(() => 
                new Promise(resolve => setTimeout(resolve, 35000))
            );
            
            const query = 'SELECT * FROM large_table';
            
            await expect(service.executeQuery(query, [], { timeout: 100 }))
                .rejects.toThrow('Query timeout after 100ms');
        });

        test('should record query performance metrics', async () => {
            const query = 'SELECT * FROM users WHERE id = $1';
            const params = [1];
            
            await service.executeQuery(query, params);
            
            expect(service.performanceStats.totalQueries).toBe(1);
            expect(service.performanceStats.cacheMisses).toBe(1);
        });
    });

    describe('Slow Query Detection and Analysis', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
            mockPool.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 });
        });

        test('should detect slow queries', async () => {
            const originalQuery = mockPool.query;
            mockPool.query.mockImplementationOnce(() => 
                new Promise(resolve => 
                    setTimeout(() => resolve({ rows: [{ id: 1 }], rowCount: 1 }), 2000)
                )
            );
            
            const query = 'SELECT * FROM large_table';
            await service.executeQuery(query);
            
            expect(mockLogger.warn).toHaveBeenCalledWith(
                'Slow query detected',
                expect.objectContaining({
                    executionTime: expect.any(Number),
                    query: expect.stringContaining('SELECT * FROM large_table')
                })
            );
            
            expect(mockMonitoring.recordEvent).toHaveBeenCalledWith(
                'database.slow_query',
                expect.objectContaining({
                    executionTime: expect.any(Number),
                    queryType: 'SELECT'
                })
            );
        });

        test('should analyze very slow queries', async () => {
            const originalQuery = mockPool.query;
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
                .mockResolvedValueOnce({ 
                    rows: [
                        { 'QUERY PLAN': 'Seq Scan on users (cost=0.00..100.00 rows=1000 width=4)' },
                        { 'QUERY PLAN': 'Filter: (id = 1)' }
                    ] 
                });
            
            // Mock slow execution
            jest.useFakeTimers();
            const queryPromise = service.executeQuery('SELECT * FROM users WHERE id = 1');
            jest.advanceTimersByTime(6000); // Simulate 6 seconds
            
            await queryPromise;
            
            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining('EXPLAIN (ANALYZE, BUFFERS)'),
                expect.any(Array)
            );
        });

        test('should generate index suggestions for sequential scans', async () => {
            const explainResult = {
                rows: [
                    { 'QUERY PLAN': 'Seq Scan on users (cost=0.00..100.00 rows=1000 width=4)' }
                ]
            };
            
            mockPool.query.mockResolvedValue(explainResult);
            
            const analysis = service.parseExecutionPlan(explainResult.rows);
            
            expect(analysis.scanTypes).toContain('sequential');
            expect(analysis.warnings).toContain('Sequential scan detected - consider adding index');
        });

        test('should parse execution plan correctly', () => {
            const planRows = [
                { 'QUERY PLAN': 'Index Scan using users_email_idx on users (cost=0.00..8.27 rows=1 width=4) (actual time=0.023..0.024 rows=1 loops=1)' }
            ];
            
            const analysis = service.parseExecutionPlan(planRows);
            
            expect(analysis.scanTypes).toContain('index');
            expect(analysis.indexesUsed).toContain('users_email_idx');
        });
    });

    describe('Performance Monitoring and Statistics', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
        });

        test('should track performance statistics', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 });
            
            await service.executeQuery('SELECT 1');
            await service.executeQuery('SELECT 2');
            
            const stats = service.getPerformanceStats();
            
            expect(stats.totalQueries).toBe(2);
            expect(stats.avgQueryTime).toBeGreaterThan(0);
            expect(stats.cacheHitRate).toBe(0); // No cache hits yet
        });

        test('should calculate cache hit rate correctly', async () => {
            mockCache.get.mockResolvedValueOnce({ cached: true });
            mockPool.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 });
            
            await service.executeQuery('SELECT 1'); // Cache hit
            await service.executeQuery('SELECT 2'); // Cache miss
            
            const stats = service.getPerformanceStats();
            
            expect(stats.cacheHitRate).toBe(50);
        });

        test('should provide pool statistics', () => {
            const poolStats = service.getPoolStats();
            
            expect(poolStats).toEqual({
                totalCount: 10,
                idleCount: 5,
                waitingCount: 0,
                max: 20
            });
        });

        test('should extract query signatures correctly', () => {
            const query1 = "SELECT * FROM users WHERE id = $1 AND name = 'John'";
            const query2 = "SELECT * FROM users WHERE id = $2 AND name = 'Jane'";
            
            const sig1 = service.extractQuerySignature(query1);
            const sig2 = service.extractQuerySignature(query2);
            
            expect(sig1).toBe(sig2); // Should be normalized to same signature
        });

        test('should identify query types correctly', () => {
            expect(service.getQueryType('SELECT * FROM users')).toBe('SELECT');
            expect(service.getQueryType('INSERT INTO users VALUES (1)')).toBe('INSERT');
            expect(service.getQueryType('UPDATE users SET name = \'test\'')).toBe('UPDATE');
            expect(service.getQueryType('DELETE FROM users WHERE id = 1')).toBe('DELETE');
        });
    });

    describe('Index Management and Optimization', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
            mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
        });

        test('should create optimized indexes', async () => {
            const results = await service.createOptimizedIndexes();
            
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
            
            results.forEach(result => {
                expect(result).toHaveProperty('sql');
                expect(result).toHaveProperty('status');
                expect(['created', 'exists', 'failed']).toContain(result.status);
            });
        });

        test('should handle index creation errors gracefully', async () => {
            mockPool.query.mockRejectedValueOnce(new Error('Permission denied'));
            
            const results = await service.createOptimizedIndexes();
            
            expect(results[0].status).toBe('failed');
            expect(results[0].error).toBe('Permission denied');
        });

        test('should skip existing indexes', async () => {
            const error = new Error('Index already exists');
            error.code = '42P07';
            mockPool.query.mockRejectedValueOnce(error);
            
            const results = await service.createOptimizedIndexes();
            
            expect(results[0].status).toBe('exists');
        });

        test('should generate index suggestions based on query patterns', async () => {
            const query = 'SELECT * FROM users WHERE email = \'test@example.com\' AND status = \'active\'';
            const analysis = {
                scanTypes: ['sequential'],
                indexesUsed: []
            };
            
            const suggestions = await service.generateIndexSuggestions(query, analysis);
            
            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions.length).toBeGreaterThan(0);
            
            suggestions.forEach(suggestion => {
                expect(suggestion).toHaveProperty('type');
                expect(suggestion).toHaveProperty('table');
                expect(suggestion).toHaveProperty('suggestion');
                expect(suggestion).toHaveProperty('priority');
            });
        });
    });

    describe('Database Statistics Collection', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
            
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ size: 1048576 }] }) // database size
                .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // table count
                .mockResolvedValueOnce({ rows: [{ count: '15' }] }) // index count
                .mockResolvedValueOnce({ rows: [{ schemaname: 'public', tablename: 'users', size: '16 kB', size_bytes: 16384 }] }) // table sizes
                .mockResolvedValueOnce({ rows: [{ schemaname: 'public', tablename: 'users', indexname: 'users_email_idx', idx_scan: 100 }] }); // index usage
        });

        test('should collect database statistics', async () => {
            const stats = await service.collectDatabaseStats();
            
            expect(stats).toHaveProperty('size', 1048576);
            expect(stats).toHaveProperty('tableCount', 10);
            expect(stats).toHaveProperty('indexCount', 15);
            expect(stats).toHaveProperty('tableSizes');
            expect(stats).toHaveProperty('indexUsage');
            expect(stats).toHaveProperty('collectedAt');
            
            expect(Array.isArray(stats.tableSizes)).toBe(true);
            expect(Array.isArray(stats.indexUsage)).toBe(true);
        });

        test('should handle statistics collection errors', async () => {
            mockPool.query.mockRejectedValue(new Error('Database error'));
            
            const stats = await service.collectDatabaseStats();
            
            expect(stats.size).toBe(0);
            expect(stats.tableCount).toBe(0);
            expect(stats.tableSizes).toEqual([]);
        });
    });

    describe('Health Checks', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
            mockPool.query.mockResolvedValue({ rows: [{ result: 1 }], rowCount: 1 });
        });

        test('should return healthy status when all checks pass', async () => {
            const health = await service.healthCheck();
            
            expect(health.status).toBe('healthy');
            expect(health.checks.database).toBe(true);
            expect(health.checks.cache).toBe(true);
            expect(health.checks.performance).toBe(true);
            expect(health).toHaveProperty('stats');
            expect(health).toHaveProperty('suggestions');
        });

        test('should return unhealthy status when checks fail', async () => {
            mockPool.query.mockRejectedValue(new Error('Connection failed'));
            
            const health = await service.healthCheck();
            
            expect(health.status).toBe('unhealthy');
            expect(health.checks.database).toBe(false);
        });

        test('should include performance statistics in health check', async () => {
            const health = await service.healthCheck();
            
            expect(health.stats).toHaveProperty('totalQueries');
            expect(health.stats).toHaveProperty('avgQueryTime');
            expect(health.stats).toHaveProperty('cacheHitRate');
        });
    });

    describe('Monitoring and Alerting', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should start performance monitoring', () => {
            service.startPerformanceMonitoring();
            
            jest.advanceTimersByTime(60000); // 1 minute
            
            expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
                'database.query_count',
                expect.any(Number)
            );
            expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
                'database.avg_query_time',
                expect.any(Number)
            );
        });

        test('should start statistics collection', () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ size: 1048576 }] })
                .mockResolvedValueOnce({ rows: [{ count: '10' }] })
                .mockResolvedValueOnce({ rows: [{ count: '15' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });
            
            service.startStatsCollection();
            
            jest.advanceTimersByTime(300000); // 5 minutes
            
            expect(mockMonitoring.recordMetric).toHaveBeenCalledWith(
                'database.size',
                1048576
            );
        });
    });

    describe('Error Handling and Recovery', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
        });

        test('should handle query execution errors', async () => {
            mockPool.query.mockRejectedValue(new Error('Query failed'));
            
            await expect(service.executeQuery('INVALID SQL'))
                .rejects.toThrow('Query failed');
            
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Query execution failed',
                expect.objectContaining({
                    query: expect.any(String),
                    error: 'Query failed'
                })
            );
        });

        test('should handle cache service failures gracefully', async () => {
            mockCache.get.mockRejectedValue(new Error('Cache error'));
            mockPool.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 });
            
            const result = await service.executeQuery('SELECT 1');
            
            expect(result).toEqual({ rows: [{ id: 1 }], rowCount: 1 });
            expect(mockLogger.warn).toHaveBeenCalledWith(
                'Failed to get cached query',
                expect.objectContaining({ error: 'Cache error' })
            );
        });

        test('should handle cleanup errors gracefully', async () => {
            mockPool.end.mockRejectedValue(new Error('Cleanup failed'));
            
            await service.cleanup();
            
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error during cleanup',
                expect.objectContaining({ error: 'Cleanup failed' })
            );
        });
    });

    describe('Integration with Other Services', () => {
        beforeEach(async () => {
            service = new DatabaseOptimizationService();
            mockPool.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 });
        });

        test('should integrate with logging service', async () => {
            await service.executeQuery('SELECT 1');
            
            expect(mockLogger.info).toHaveBeenCalled();
        });

        test('should integrate with monitoring service', async () => {
            await service.executeQuery('SELECT 1');
            
            expect(mockMonitoring.recordEvent).toHaveBeenCalledWith(
                'database.connection.established'
            );
        });

        test('should integrate with cache service', async () => {
            mockCache.get.mockResolvedValue({ cached: true });
            
            await service.executeQuery('SELECT 1');
            
            expect(mockCache.get).toHaveBeenCalled();
        });
    });
});