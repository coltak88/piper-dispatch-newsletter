/**
 * Performance Optimization Configuration
 * Comprehensive settings for caching, database optimization, and monitoring
 */

const performanceConfig = {
    // Caching Configuration
    caching: {
        // Redis Configuration
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_DB) || 0,
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            enableReadyCheck: true,
            maxMemoryPolicy: 'allkeys-lru',
            maxMemory: '256mb'
        },

        // Cache Settings
        cache: {
            // Default TTL (Time To Live) in seconds
            defaultTTL: 300, // 5 minutes
            
            // Specific TTLs for different data types
            ttlByType: {
                user: 1800,        // 30 minutes
                newsletter: 900,   // 15 minutes
                analytics: 600,    // 10 minutes
                dashboard: 300,    // 5 minutes
                api_response: 120, // 2 minutes
                session: 3600      // 1 hour
            },

            // Compression settings
            compression: {
                enabled: true,
                threshold: 1024,    // Compress data larger than 1KB
                level: 6           // Compression level (1-9)
            },

            // Cache warming configuration
            warming: {
                enabled: true,
                interval: 300,     // Warm cache every 5 minutes
                keys: [
                    'newsletters:popular',
                    'analytics:dashboard',
                    'users:active',
                    'subscribers:count',
                    'system:health'
                ]
            },

            // Multi-level caching
            levels: {
                local: {
                    enabled: true,
                    maxSize: 1000,   // Max items in local cache
                    ttl: 60           // 1 minute TTL
                },
                redis: {
                    enabled: true,
                    maxSize: 100000  // Max items in Redis
                }
            },

            // Cache invalidation strategies
            invalidation: {
                // Pattern-based invalidation
                patterns: {
                    'user:*': ['profile:*', 'preferences:*'],
                    'newsletter:*': ['newsletters:*', 'analytics:*'],
                    'subscriber:*': ['subscribers:*', 'counts:*']
                },
                
                // Event-based invalidation
                events: {
                    'user:updated': ['user:*'],
                    'newsletter:created': ['newsletters:*'],
                    'newsletter:updated': ['newsletters:*', 'newsletter:*'],
                    'subscriber:added': ['subscribers:*', 'counts:*']
                }
            }
        }
    },

    // Database Optimization Configuration
    database: {
        // Connection pooling
        pool: {
            min: 2,
            max: 20,
            acquireTimeoutMillis: 30000,
            createTimeoutMillis: 30000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 200,
            propagateCreateError: false
        },

        // Query optimization
        query: {
            // Slow query threshold in milliseconds
            slowQueryThreshold: 500,
            
            // Query timeout in milliseconds
            timeout: 30000,
            
            // Query result caching
            caching: {
                enabled: true,
                maxSize: 1000,     // Max cached queries
                ttl: 300,          // 5 minutes
                compression: true
            },

            // Query analysis
            analysis: {
                enabled: true,
                logSlowQueries: true,
                logQueryPlans: false,
                collectStatistics: true
            }
        },

        // Index optimization
        indexing: {
            // Automatic index suggestions
            suggestions: {
                enabled: true,
                minQueryFrequency: 10,     // Suggest after 10 executions
                minPerformanceGain: 0.5   // 50% improvement threshold
            },

            // Index management
            management: {
                autoCreate: false,          // Manual approval required
                autoDrop: false,          // Manual approval required
                analyzeStats: true,       // Collect usage statistics
                maintainStats: true       // Keep statistics updated
            },

            // Performance thresholds
            thresholds: {
                tableScanThreshold: 1000,    // Warn on large table scans
                indexUsageThreshold: 0.8,    // Minimum 80% index usage
                queryCostThreshold: 1000     // Maximum query cost
            }
        },

        // Statistics collection
        statistics: {
            enabled: true,
            collectionInterval: 3600,    // Collect every hour
            retentionPeriod: 2592000,     // Keep for 30 days
            compression: true
        }
    },

    // Monitoring and Alerting Configuration
    monitoring: {
        // Performance monitoring
        performance: {
            enabled: true,
            collectionInterval: 60,        // Collect every minute
            retentionPeriod: 604800,     // Keep for 7 days
            
            // Metrics to collect
            metrics: [
                'response_time',
                'throughput',
                'error_rate',
                'memory_usage',
                'cpu_usage',
                'database_connections',
                'cache_hit_rate',
                'queue_size'
            ]
        },

        // Health check configuration
        health: {
            enabled: true,
            checkInterval: 30,            // Check every 30 seconds
            timeout: 5000,                // 5 second timeout
            
            // Health check endpoints
            endpoints: [
                {
                    name: 'database',
                    url: '/health/database',
                    critical: true
                },
                {
                    name: 'cache',
                    url: '/health/cache',
                    critical: true
                },
                {
                    name: 'api',
                    url: '/health/api',
                    critical: false
                }
            ]
        },

        // Alerting configuration
        alerting: {
            enabled: true,
            
            // Thresholds for different severity levels
            thresholds: {
                response_time: {
                    warning: 1000,     // 1 second
                    critical: 3000     // 3 seconds
                },
                error_rate: {
                    warning: 5,        // 5%
                    critical: 10       // 10%
                },
                memory_usage: {
                    warning: 80,       // 80%
                    critical: 90       // 90%
                },
                cpu_usage: {
                    warning: 70,       // 70%
                    critical: 85       // 85%
                },
                cache_hit_rate: {
                    warning: 70,       // 70%
                    critical: 50       // 50%
                }
            },

            // Notification channels
            channels: {
                email: {
                    enabled: true,
                    recipients: process.env.ALERT_EMAILS?.split(',') || [],
                    smtp: {
                        host: process.env.SMTP_HOST,
                        port: parseInt(process.env.SMTP_PORT) || 587,
                        secure: process.env.SMTP_SECURE === 'true',
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASS
                        }
                    }
                },
                
                slack: {
                    enabled: process.env.SLACK_WEBHOOK_URL !== undefined,
                    webhookUrl: process.env.SLACK_WEBHOOK_URL,
                    channel: process.env.SLACK_CHANNEL || '#alerts'
                },
                
                webhook: {
                    enabled: process.env.WEBHOOK_URL !== undefined,
                    url: process.env.WEBHOOK_URL,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            },

            // Rate limiting for alerts
            rateLimiting: {
                maxAlertsPerHour: 10,
                cooldownPeriod: 300,    // 5 minutes between similar alerts
                escalationDelay: 1800   // 30 minutes before escalation
            }
        }
    },

    // Load Testing Configuration
    loadTesting: {
        enabled: process.env.NODE_ENV !== 'production',
        
        // Test scenarios
        scenarios: [
            {
                name: 'baseline',
                concurrentUsers: 10,
                duration: 60,          // 1 minute
                rampUp: 10,            // 10 seconds ramp-up
                requestsPerSecond: 5
            },
            {
                name: 'stress',
                concurrentUsers: 50,
                duration: 300,         // 5 minutes
                rampUp: 30,            // 30 seconds ramp-up
                requestsPerSecond: 20
            },
            {
                name: 'spike',
                concurrentUsers: 100,
                duration: 120,         // 2 minutes
                rampUp: 5,             // 5 seconds ramp-up
                requestsPerSecond: 50
            }
        ],

        // Success criteria
        successCriteria: {
            maxResponseTime: 2000,     // 2 seconds
            maxErrorRate: 1,           // 1%
            minThroughput: 10,         // 10 requests/second
            maxMemoryUsage: 80         // 80% of available memory
        }
    },

    // Security Configuration
    security: {
        // Rate limiting
        rateLimiting: {
            windowMs: 15 * 60 * 1000,    // 15 minutes
            max: 100,                      // 100 requests per window
            message: 'Too many requests from this IP',
            standardHeaders: true,
            legacyHeaders: false
        },

        // Request size limits
        requestLimits: {
            jsonLimit: '10mb',
            urlencodedLimit: '10mb',
            maxParameterCount: 1000
        },

        // Timeout configurations
        timeouts: {
            request: 30000,    // 30 seconds
            keepAlive: 5000,   // 5 seconds
            headers: 30000     // 30 seconds
        }
    },

    // Development and Debugging Configuration
    development: {
        // Performance profiling
        profiling: {
            enabled: process.env.NODE_ENV === 'development',
            
            // CPU profiling
            cpu: {
                enabled: true,
                samplingInterval: 10,    // 10ms sampling
                duration: 30000          // 30 seconds
            },

            // Memory profiling
            memory: {
                enabled: true,
                heapSnapshotInterval: 300000,  // 5 minutes
                leakDetection: true
            },

            // Database profiling
            database: {
                enabled: true,
                logQueries: true,
                logSlowQueries: true,
                explainQueries: true
            }
        },

        // Debug logging
        debug: {
            enabled: process.env.DEBUG === 'true',
            
            // Debug categories
            categories: [
                'performance',
                'cache',
                'database',
                'monitoring',
                'optimization'
            ],

            // Log levels
            levels: ['error', 'warn', 'info', 'debug']
        }
    }
};

// Environment-specific overrides
const environmentOverrides = {
    development: {
        caching: {
            cache: {
                defaultTTL: 60,  // Shorter TTL for development
                warming: {
                    enabled: false  // Disable cache warming in dev
                }
            }
        },
        database: {
            query: {
                slowQueryThreshold: 100  // Lower threshold for development
            }
        },
        monitoring: {
            performance: {
                collectionInterval: 30  // More frequent collection
            }
        }
    },
    
    staging: {
        caching: {
            cache: {
                defaultTTL: 180  // 3 minutes for staging
            }
        },
        database: {
            pool: {
                max: 10  // Smaller pool for staging
            }
        }
    },
    
    production: {
        caching: {
            redis: {
                maxMemory: '1gb',  // Larger memory for production
                maxMemoryPolicy: 'allkeys-lru'
            },
            cache: {
                defaultTTL: 900  // 15 minutes for production
            }
        },
        database: {
            pool: {
                max: 50  // Larger pool for production
            },
            query: {
                slowQueryThreshold: 1000  // Higher threshold for production
            }
        },
        monitoring: {
            performance: {
                collectionInterval: 300  // Less frequent collection to reduce overhead
            }
        }
    }
};

// Apply environment-specific overrides
const currentEnvironment = process.env.NODE_ENV || 'development';
if (environmentOverrides[currentEnvironment]) {
    Object.assign(performanceConfig, environmentOverrides[currentEnvironment]);
}

// Validation function
function validateConfig(config) {
    const errors = [];
    
    // Validate cache TTLs
    if (config.caching.cache.defaultTTL <= 0) {
        errors.push('Cache defaultTTL must be positive');
    }
    
    // Validate database pool settings
    if (config.database.pool.min >= config.database.pool.max) {
        errors.push('Database pool min must be less than max');
    }
    
    // Validate monitoring intervals
    if (config.monitoring.performance.collectionInterval <= 0) {
        errors.push('Performance collection interval must be positive');
    }
    
    // Validate alerting thresholds
    const thresholds = config.monitoring.alerting.thresholds;
    Object.keys(thresholds).forEach(metric => {
        if (thresholds[metric].warning >= thresholds[metric].critical) {
            errors.push(`${metric} warning threshold must be less than critical threshold`);
        }
    });
    
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
}

// Validate configuration on load
try {
    validateConfig(performanceConfig);
} catch (error) {
    console.error('Performance configuration validation failed:', error.message);
    process.exit(1);
}

module.exports = performanceConfig;