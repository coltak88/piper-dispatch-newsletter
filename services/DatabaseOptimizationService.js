/**
 * Database Optimization Service - Query optimization, indexing, and performance tuning
 * Provides automated query optimization, index management, and performance monitoring
 */

const { Pool } = require('pg');
const crypto = require('crypto');
const LoggingService = require('./LoggingService');
const MonitoringService = require('./MonitoringService');
const CacheService = require('./CacheService');

class DatabaseOptimizationService {
    constructor(config = {}) {
        this.config = {
            database: {
                connectionString: process.env.DATABASE_URL,
                max: 20, // Maximum pool size
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
                statement_timeout: 30000, // 30 seconds
                query_timeout: 25000, // 25 seconds
                ...config.database
            },
            optimization: {
                autoIndexSuggestions: true,
                queryTimeoutMs: 30000,
                slowQueryThresholdMs: 1000,
                analyzeThresholdMs: 5000,
                maxQueryCacheSize: 1000,
                enableQueryCaching: true,
                ...config.optimization
            },
            monitoring: {
                performanceCheckInterval: 60000, // 1 minute
                statsCollectionInterval: 300000, // 5 minutes
                ...config.monitoring
            }
        };

        this.pool = null;
        this.cache = null;
        this.queryCache = new Map();
        this.slowQueries = new Map();
        this.indexSuggestions = [];
        this.performanceStats = {
            totalQueries: 0,
            slowQueries: 0,
            avgQueryTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        this.logger = new LoggingService('DatabaseOptimizationService');
        this.monitoring = new MonitoringService();
        
        this.init();
    }

    async init() {
        try {
            await this.connectDatabase();
            await this.setupCache();
            this.startPerformanceMonitoring();
            this.startStatsCollection();
            this.logger.info('DatabaseOptimizationService initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize DatabaseOptimizationService', { error: error.message });
            throw error;
        }
    }

    async connectDatabase() {
        try {
            this.pool = new Pool(this.config.database);
            
            // Test connection
            await this.pool.query('SELECT 1');
            
            this.logger.info('Database pool created successfully');
            this.monitoring.recordEvent('database.connection.established');
            
        } catch (error) {
            this.logger.error('Database connection failed', { error: error.message });
            throw error;
        }
    }

    async setupCache() {
        try {
            this.cache = new CacheService({
                cache: {
                    defaultTTL: 300, // 5 minutes for query results
                    enableCompression: true,
                    compressionThreshold: 1024
                }
            });
            
            this.logger.info('Cache service initialized for database optimization');
        } catch (error) {
            this.logger.warn('Cache service initialization failed, continuing without cache', { error: error.message });
        }
    }

    /**
     * Execute optimized query with caching and performance monitoring
     */
    async executeQuery(query, params = [], options = {}) {
        const startTime = Date.now();
        const queryHash = this.hashQuery(query, params);
        
        try {
            this.performanceStats.totalQueries++;
            
            // Check cache first
            if (this.config.optimization.enableQueryCaching && !options.skipCache) {
                const cachedResult = await this.getCachedQuery(queryHash);
                if (cachedResult !== null) {
                    this.performanceStats.cacheHits++;
                    return cachedResult;
                }
            }
            
            this.performanceStats.cacheMisses++;
            
            // Execute query with timeout
            const result = await this.executeWithTimeout(query, params, options);
            
            const executionTime = Date.now() - startTime;
            
            // Cache the result if enabled
            if (this.config.optimization.enableQueryCaching && !options.skipCache) {
                await this.cacheQuery(queryHash, result, options.cacheTTL);
            }
            
            // Monitor performance
            this.recordQueryPerformance(query, params, executionTime);
            
            // Check if query is slow
            if (executionTime > this.config.optimization.slowQueryThresholdMs) {
                this.handleSlowQuery(query, params, executionTime);
            }
            
            return result;
            
        } catch (error) {
            this.logger.error('Query execution failed', { 
                query: query.substring(0, 200), 
                params, 
                error: error.message,
                duration: Date.now() - startTime 
            });
            throw error;
        }
    }

    /**
     * Execute query with timeout protection
     */
    async executeWithTimeout(query, params, options = {}) {
        const timeoutMs = options.timeout || this.config.optimization.queryTimeoutMs;
        
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Query timeout after ${timeoutMs}ms`));
            }, timeoutMs);
            
            try {
                const result = await this.pool.query(query, params);
                clearTimeout(timeout);
                resolve(result);
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    /**
     * Get cached query result
     */
    async getCachedQuery(queryHash) {
        if (!this.cache) return null;
        
        try {
            return await this.cache.get(queryHash, 'query_cache');
        } catch (error) {
            this.logger.warn('Failed to get cached query', { error: error.message });
            return null;
        }
    }

    /**
     * Cache query result
     */
    async cacheQuery(queryHash, result, ttl = 300) {
        if (!this.cache) return;
        
        try {
            await this.cache.set(queryHash, result, 'query_cache', { ttl });
        } catch (error) {
            this.logger.warn('Failed to cache query result', { error: error.message });
        }
    }

    /**
     * Generate query hash for caching
     */
    hashQuery(query, params) {
        const queryString = `${query}:${JSON.stringify(params)}`;
        return crypto.createHash('md5').update(queryString).digest('hex');
    }

    /**
     * Record query performance metrics
     */
    recordQueryPerformance(query, params, executionTime) {
        const querySignature = this.extractQuerySignature(query);
        
        if (!this.slowQueries.has(querySignature)) {
            this.slowQueries.set(querySignature, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                maxTime: 0,
                lastExecuted: new Date()
            });
        }
        
        const stats = this.slowQueries.get(querySignature);
        stats.count++;
        stats.totalTime += executionTime;
        stats.avgTime = stats.totalTime / stats.count;
        stats.maxTime = Math.max(stats.maxTime, executionTime);
        stats.lastExecuted = new Date();
        
        // Update global average
        this.performanceStats.avgQueryTime = 
            (this.performanceStats.avgQueryTime * (this.performanceStats.totalQueries - 1) + executionTime) 
            / this.performanceStats.totalQueries;
    }

    /**
     * Handle slow queries with analysis and optimization suggestions
     */
    async handleSlowQuery(query, params, executionTime) {
        this.performanceStats.slowQueries++;
        
        this.logger.warn('Slow query detected', {
            query: query.substring(0, 100),
            executionTime,
            params: params.length
        });
        
        this.monitoring.recordEvent('database.slow_query', {
            executionTime,
            queryType: this.getQueryType(query)
        });
        
        // Generate optimization suggestions for very slow queries
        if (executionTime > this.config.optimization.analyzeThresholdMs) {
            await this.analyzeSlowQuery(query, params);
        }
    }

    /**
     * Analyze slow query and generate optimization suggestions
     */
    async analyzeSlowQuery(query, params) {
        try {
            // Get query execution plan
            const explainResult = await this.pool.query(`EXPLAIN (ANALYZE, BUFFERS) ${query}`, params);
            
            const analysis = this.parseExecutionPlan(explainResult.rows);
            
            // Generate index suggestions
            if (this.config.optimization.autoIndexSuggestions) {
                const suggestions = await this.generateIndexSuggestions(query, analysis);
                this.indexSuggestions.push(...suggestions);
            }
            
            this.logger.info('Slow query analysis completed', {
                query: query.substring(0, 100),
                analysis
            });
            
        } catch (error) {
            this.logger.error('Failed to analyze slow query', { error: error.message });
        }
    }

    /**
     * Parse PostgreSQL execution plan
     */
    parseExecutionPlan(planRows) {
        const planText = planRows.map(row => row['QUERY PLAN']).join('\n');
        
        const analysis = {
            totalCost: 0,
            startupCost: 0,
            actualTime: 0,
            rows: 0,
            nodeType: '',
            scanTypes: [],
            indexesUsed: [],
            warnings: []
        };
        
        // Extract key metrics from plan
        const totalCostMatch = planText.match(/cost=(\d+\.?\d*)\.\.(\d+\.?\d*)/);
        if (totalCostMatch) {
            analysis.startupCost = parseFloat(totalCostMatch[1]);
            analysis.totalCost = parseFloat(totalCostMatch[2]);
        }
        
        const actualTimeMatch = planText.match(/actual time=(\d+\.?\d*)\.\.(\d+\.?\d*)/);
        if (actualTimeMatch) {
            analysis.actualTime = parseFloat(actualTimeMatch[2]);
        }
        
        const rowsMatch = planText.match(/rows=(\d+)/);
        if (rowsMatch) {
            analysis.rows = parseInt(rowsMatch[1]);
        }
        
        // Detect scan types
        if (planText.includes('Seq Scan')) {
            analysis.scanTypes.push('sequential');
            analysis.warnings.push('Sequential scan detected - consider adding index');
        }
        
        if (planText.includes('Index Scan')) {
            analysis.scanTypes.push('index');
        }
        
        if (planText.includes('Bitmap Heap Scan')) {
            analysis.scanTypes.push('bitmap');
        }
        
        // Extract index usage
        const indexMatches = planText.match(/Index Scan using (\w+)/g);
        if (indexMatches) {
            analysis.indexesUsed = indexMatches.map(match => 
                match.replace('Index Scan using ', '')
            );
        }
        
        return analysis;
    }

    /**
     * Generate index suggestions based on query analysis
     */
    async generateIndexSuggestions(query, analysis) {
        const suggestions = [];
        
        // Extract table and column information from query
        const tableMatches = query.match(/FROM\s+(\w+)/i);
        const whereMatches = query.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/is);
        
        if (tableMatches && whereMatches) {
            const tableName = tableMatches[1];
            const whereClause = whereMatches[1];
            
            // Extract column names from WHERE clause
            const columnMatches = whereClause.match(/(\w+)\s*[=<>!]/g);
            if (columnMatches) {
                const columns = [...new Set(columnMatches.map(match => 
                    match.replace(/\s*[=<>!].*/, '')
                ))];
                
                columns.forEach(column => {
                    if (!analysis.indexesUsed.includes(`${tableName}_${column}_idx`)) {
                        suggestions.push({
                            type: 'index',
                            table: tableName,
                            column: column,
                            suggestion: `CREATE INDEX CONCURRENTLY ${tableName}_${column}_idx ON ${tableName}(${column});`,
                            reason: 'Frequently used in WHERE clause without index',
                            priority: 'high',
                            estimatedBenefit: 'Reduced query time by 70-90%'
                        });
                    }
                });
            }
        }
        
        // Suggest composite indexes for multiple column queries
        if (analysis.scanTypes.includes('sequential') && tableMatches) {
            suggestions.push({
                type: 'composite_index',
                table: tableMatches[1],
                suggestion: `Consider creating composite index on frequently queried columns`,
                reason: 'Sequential scan detected on large table',
                priority: 'critical',
                estimatedBenefit: 'Eliminates full table scans'
            });
        }
        
        return suggestions;
    }

    /**
     * Get query performance statistics
     */
    getPerformanceStats() {
        const cacheHitRate = this.performanceStats.totalQueries > 0
            ? (this.performanceStats.cacheHits / this.performanceStats.totalQueries) * 100
            : 0;
        
        return {
            ...this.performanceStats,
            cacheHitRate: parseFloat(cacheHitRate.toFixed(2)),
            slowQueryCount: this.slowQueries.size,
            indexSuggestions: this.indexSuggestions.length,
            connectionPool: this.getPoolStats()
        };
    }

    /**
     * Get connection pool statistics
     */
    getPoolStats() {
        if (!this.pool) return null;
        
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
            max: this.config.database.max
        };
    }

    /**
     * Extract query signature for grouping similar queries
     */
    extractQuerySignature(query) {
        // Remove specific values and normalize
        return query
            .replace(/\$\d+/g, '$N') // Parameter placeholders
            .replace(/'[^']*'/g, "'?'") // String literals
            .replace(/\d+/g, '?') // Numbers
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .substring(0, 200); // Limit length
    }

    /**
     * Get query type (SELECT, INSERT, UPDATE, DELETE)
     */
    getQueryType(query) {
        const match = query.trim().match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i);
        return match ? match[1].toUpperCase() : 'UNKNOWN';
    }

    /**
     * Create optimized indexes for common query patterns
     */
    async createOptimizedIndexes() {
        const indexes = [
            // User table indexes
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users(status) WHERE status = \'active\';',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at DESC);',
            
            // Newsletter table indexes
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_user_id ON newsletters(user_id);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_status ON newsletters(status);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at DESC);',
            
            // Subscriber table indexes
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscribers_email ON subscribers(email);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscribers_status ON subscribers(status);',
            
            // Content table indexes
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_newsletter_id ON content(newsletter_id);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_type ON content(type);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_created_at ON content(created_at DESC);',
            
            // Analytics table indexes
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);',
            
            // Composite indexes for common queries
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_user_status ON newsletters(user_id, status);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscribers_user_status ON subscribers(user_id, status);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_user_event_date ON analytics(user_id, event_type, created_at DESC);'
        ];
        
        const results = [];
        
        for (const indexSQL of indexes) {
            try {
                await this.pool.query(indexSQL);
                results.push({ sql: indexSQL, status: 'created' });
                this.logger.info('Index created successfully', { sql: indexSQL });
            } catch (error) {
                if (error.code !== '42P07') { // Index already exists
                    results.push({ sql: indexSQL, status: 'failed', error: error.message });
                    this.logger.error('Failed to create index', { sql: indexSQL, error: error.message });
                } else {
                    results.push({ sql: indexSQL, status: 'exists' });
                }
            }
        }
        
        return results;
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        setInterval(() => {
            const stats = this.getPerformanceStats();
            
            this.monitoring.recordMetric('database.query_count', stats.totalQueries);
            this.monitoring.recordMetric('database.avg_query_time', stats.avgQueryTime);
            this.monitoring.recordMetric('database.cache_hit_rate', stats.cacheHitRate);
            this.monitoring.recordMetric('database.slow_query_count', stats.slowQueryCount);
            
        }, this.config.monitoring.performanceCheckInterval);
    }

    /**
     * Start statistics collection
     */
    startStatsCollection() {
        setInterval(async () => {
            try {
                const dbStats = await this.collectDatabaseStats();
                
                this.monitoring.recordMetric('database.size', dbStats.size);
                this.monitoring.recordMetric('database.index_count', dbStats.indexCount);
                this.monitoring.recordMetric('database.table_count', dbStats.tableCount);
                
            } catch (error) {
                this.logger.error('Failed to collect database statistics', { error: error.message });
            }
        }, this.config.monitoring.statsCollectionInterval);
    }

    /**
     * Collect comprehensive database statistics
     */
    async collectDatabaseStats() {
        const statsQueries = {
            size: `
                SELECT pg_database_size(current_database()) as size;
            `,
            tableCount: `
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
            `,
            indexCount: `
                SELECT COUNT(*) as count 
                FROM pg_indexes 
                WHERE schemaname = 'public';
            `,
            tableSizes: `
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
                FROM pg_tables
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
            `,
            indexUsage: `
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_scan,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes
                ORDER BY idx_scan DESC;
            `
        };
        
        const results = {};
        
        for (const [key, query] of Object.entries(statsQueries)) {
            try {
                const result = await this.pool.query(query);
                results[key] = result.rows;
            } catch (error) {
                this.logger.error(`Failed to collect ${key} stats`, { error: error.message });
                results[key] = [];
            }
        }
        
        return {
            size: results.size[0]?.size || 0,
            tableCount: parseInt(results.tableCount[0]?.count) || 0,
            indexCount: parseInt(results.indexCount[0]?.count) || 0,
            tableSizes: results.tableSizes,
            indexUsage: results.indexUsage,
            collectedAt: new Date()
        };
    }

    /**
     * Health check for database optimization service
     */
    async healthCheck() {
        const checks = {
            database: false,
            cache: false,
            performance: false
        };
        
        try {
            // Test database connection
            await this.pool.query('SELECT 1');
            checks.database = true;
            
            // Test cache
            if (this.cache) {
                const cacheHealth = await this.cache.healthCheck();
                checks.cache = cacheHealth.status === 'healthy';
            }
            
            // Check performance metrics
            const stats = this.getPerformanceStats();
            checks.performance = stats.avgQueryTime < this.config.optimization.slowQueryThresholdMs;
            
        } catch (error) {
            this.logger.error('Health check failed', { error: error.message });
        }
        
        const overall = Object.values(checks).every(check => check === true);
        
        return {
            status: overall ? 'healthy' : 'unhealthy',
            checks,
            stats: this.getPerformanceStats(),
            suggestions: this.indexSuggestions.slice(-10) // Last 10 suggestions
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        try {
            if (this.pool) {
                await this.pool.end();
            }
            
            if (this.cache) {
                await this.cache.cleanup();
            }
            
            this.logger.info('DatabaseOptimizationService cleaned up');
        } catch (error) {
            this.logger.error('Error during cleanup', { error: error.message });
        }
    }
}

module.exports = DatabaseOptimizationService;