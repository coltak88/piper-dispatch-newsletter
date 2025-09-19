const loggingService = require('./LoggingService');
const monitoringService = require('./MonitoringService');
const securityService = require('./SecurityService');

/**
 * Comprehensive Error Handler Service
 * Provides centralized error handling with logging, monitoring, and recovery
 */
class ErrorHandler {
    constructor() {
        this.logger = loggingService;
        this.monitoring = monitoringService;
        this.security = securityService;
        this.isShuttingDown = false;
        this.errorCounts = new Map();
        this.lastErrorTime = new Map();
        
        this.setupGlobalHandlers();
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.handleUncaughtException(error);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.handleUnhandledRejection(reason, promise);
        });

        // Handle SIGTERM for graceful shutdown
        process.on('SIGTERM', () => {
            this.handleGracefulShutdown('SIGTERM');
        });

        // Handle SIGINT for graceful shutdown
        process.on('SIGINT', () => {
            this.handleGracefulShutdown('SIGINT');
        });
    }

    /**
     * Handle uncaught exceptions
     */
    handleUncaughtException(error) {
        this.logger.logError('system', 'Uncaught Exception', error, {
            type: 'uncaught_exception',
            timestamp: new Date().toISOString(),
            pid: process.pid,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        });

        this.monitoring.recordMetric('errors.uncaught_exceptions', 1);
        this.monitoring.recordMetric('system.health', 0);

        // Attempt graceful shutdown
        this.shutdownGracefully(1);
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(reason, promise) {
        const error = reason instanceof Error ? reason : new Error(reason);
        
        this.logger.logError('system', 'Unhandled Promise Rejection', error, {
            type: 'unhandled_rejection',
            promise: promise.toString(),
            timestamp: new Date().toISOString(),
            pid: process.pid
        });

        this.monitoring.recordMetric('errors.unhandled_rejections', 1);
        this.monitoring.recordMetric('system.health', 0);

        // Attempt graceful shutdown
        this.shutdownGracefully(1);
    }

    /**
     * Handle graceful shutdown
     */
    handleGracefulShutdown(signal) {
        if (this.isShuttingDown) {
            return;
        }

        this.isShuttingDown = true;
        this.logger.logInfo('system', `Received ${signal}, starting graceful shutdown`);

        this.shutdownGracefully(0);
    }

    /**
     * Graceful shutdown with cleanup
     */
    shutdownGracefully(exitCode) {
        this.logger.logInfo('system', 'Starting graceful shutdown', {
            exitCode,
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });

        // Allow time for cleanup
        setTimeout(() => {
            this.logger.logInfo('system', 'Shutdown complete');
            process.exit(exitCode);
        }, 5000);
    }

    /**
     * Create standardized error response
     */
    createErrorResponse(error, req = null) {
        const errorId = this.generateErrorId();
        const timestamp = new Date().toISOString();

        // Determine error type and status code
        const { statusCode, errorCode, message, details } = this.categorizeError(error);

        // Log the error with context
        this.logError(error, req, {
            errorId,
            statusCode,
            errorCode,
            timestamp
        });

        // Build response
        const response = {
            error: {
                id: errorId,
                code: errorCode,
                message: this.sanitizeErrorMessage(message, statusCode),
                timestamp: timestamp,
                path: req ? req.path : null
            }
        };

        // Add details in development mode
        if (process.env.NODE_ENV === 'development' && details) {
            response.error.details = details;
        }

        return {
            response,
            statusCode
        };
    }

    /**
     * Categorize error and determine response
     */
    categorizeError(error) {
        // Validation errors
        if (error.name === 'ValidationError') {
            return {
                statusCode: 400,
                errorCode: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: error.errors || error.message
            };
        }

        // Authentication errors
        if (error.name === 'AuthenticationError' || error.code === 'UNAUTHORIZED') {
            return {
                statusCode: 401,
                errorCode: 'AUTHENTICATION_ERROR',
                message: 'Authentication failed',
                details: null
            };
        }

        // Authorization errors
        if (error.name === 'AuthorizationError' || error.code === 'FORBIDDEN') {
            return {
                statusCode: 403,
                errorCode: 'AUTHORIZATION_ERROR',
                message: 'Access denied',
                details: null
            };
        }

        // Not found errors
        if (error.name === 'NotFoundError' || error.code === 'NOT_FOUND') {
            return {
                statusCode: 404,
                errorCode: 'NOT_FOUND_ERROR',
                message: 'Resource not found',
                details: null
            };
        }

        // Conflict errors
        if (error.name === 'ConflictError' || error.code === 'CONFLICT') {
            return {
                statusCode: 409,
                errorCode: 'CONFLICT_ERROR',
                message: 'Resource conflict',
                details: error.message
            };
        }

        // Rate limit errors
        if (error.name === 'RateLimitError') {
            return {
                statusCode: 429,
                errorCode: 'RATE_LIMIT_ERROR',
                message: 'Too many requests',
                details: {
                    retryAfter: error.retryAfter || 60
                }
            };
        }

        // Database errors
        if (error.name === 'DatabaseError') {
            return {
                statusCode: 500,
                errorCode: 'DATABASE_ERROR',
                message: 'Database operation failed',
                details: process.env.NODE_ENV === 'development' ? error.message : null
            };
        }

        // External service errors
        if (error.name === 'ExternalServiceError') {
            return {
                statusCode: 503,
                errorCode: 'SERVICE_UNAVAILABLE',
                message: 'External service unavailable',
                details: null
            };
        }

        // Default server error
        return {
            statusCode: 500,
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        };
    }

    /**
     * Log error with monitoring and rate limiting
     */
    logError(error, req = null, context = {}) {
        const errorKey = `${error.name || 'Error'}:${error.message}`;
        const now = Date.now();
        
        // Rate limit error logging (max 10 per minute per error type)
        const lastTime = this.lastErrorTime.get(errorKey) || 0;
        const count = this.errorCounts.get(errorKey) || 0;
        
        if (now - lastTime < 60000 && count >= 10) {
            return; // Skip logging due to rate limit
        }
        
        // Update error tracking
        if (now - lastTime >= 60000) {
            this.errorCounts.set(errorKey, 1);
            this.lastErrorTime.set(errorKey, now);
        } else {
            this.errorCounts.set(errorKey, count + 1);
        }

        // Log with context
        const logData = {
            ...context,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            request: req ? {
                method: req.method,
                url: req.originalUrl || req.url,
                headers: this.sanitizeHeaders(req.headers),
                body: this.sanitizeBody(req.body),
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id || 'anonymous'
            } : null
        };

        this.logger.logError('application', 'Application error', error, logData);

        // Record metrics
        this.monitoring.recordMetric('errors.total', 1);
        this.monitoring.recordMetric(`errors.${context.errorCode || 'unknown'}`, 1);

        // Security events for certain error types
        if (this.isSecurityRelatedError(error)) {
            this.security.logSecurityEvent('application_error', {
                errorType: error.name,
                errorCode: context.errorCode,
                ip: req?.ip,
                userId: req?.user?.id
            });
        }
    }

    /**
     * Express error handling middleware
     */
    middleware() {
        return (error, req, res, next) => {
            try {
                const { response, statusCode } = this.createErrorResponse(error, req);
                res.status(statusCode).json(response);
            } catch (handlerError) {
                // Fallback error response
                this.logger.logError('system', 'Error in error handler', handlerError);
                res.status(500).json({
                    error: {
                        id: 'error_handler_failed',
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Internal server error',
                        timestamp: new Date().toISOString()
                    }
                });
            }
        };
    }

    /**
     * Async error wrapper for route handlers
     */
    asyncWrapper(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    /**
     * Retry mechanism for failed operations
     */
    async retryOperation(operation, options = {}) {
        const {
            maxRetries = 3,
            retryDelay = 1000,
            backoffMultiplier = 2,
            maxDelay = 30000
        } = options;

        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await operation();
                
                if (attempt > 0) {
                    this.logger.logInfo('system', `Operation succeeded after ${attempt} retries`);
                }
                
                return result;
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    this.logger.logError('system', `Operation failed after ${maxRetries} retries`, error);
                    throw error;
                }
                
                const delay = Math.min(
                    retryDelay * Math.pow(backoffMultiplier, attempt),
                    maxDelay
                );
                
                this.logger.logWarn('system', `Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError;
    }

    /**
     * Circuit breaker for failing operations
     */
    createCircuitBreaker(operation, options = {}) {
        const {
            failureThreshold = 5,
            resetTimeout = 60000,
            monitoringPeriod = 10000
        } = options;

        let failures = 0;
        let lastFailureTime = 0;
        let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

        return async (...args) => {
            if (state === 'OPEN') {
                if (Date.now() - lastFailureTime > resetTimeout) {
                    state = 'HALF_OPEN';
                    this.logger.logInfo('system', 'Circuit breaker moving to HALF_OPEN state');
                } else {
                    throw new Error('Circuit breaker is OPEN');
                }
            }

            try {
                const result = await operation(...args);
                
                if (state === 'HALF_OPEN') {
                    state = 'CLOSED';
                    failures = 0;
                    this.logger.logInfo('system', 'Circuit breaker reset to CLOSED state');
                }
                
                return result;
            } catch (error) {
                failures++;
                lastFailureTime = Date.now();
                
                if (failures >= failureThreshold) {
                    state = 'OPEN';
                    this.logger.logError('system', 'Circuit breaker opened due to failures', error, {
                        failures,
                        failureThreshold
                    });
                }
                
                throw error;
            }
        };
    }

    /**
     * Sanitize error message for client response
     */
    sanitizeErrorMessage(message, statusCode) {
        if (statusCode >= 500) {
            return 'Internal server error';
        }
        
        return message || 'An error occurred';
    }

    /**
     * Sanitize request headers
     */
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
        
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }

    /**
     * Sanitize request body
     */
    sanitizeBody(body) {
        if (!body || typeof body !== 'object') {
            return body;
        }

        const sanitized = { ...body };
        const sensitiveFields = ['password', 'creditCard', 'ssn', 'token', 'secret'];
        
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }

    /**
     * Check if error is security-related
     */
    isSecurityRelatedError(error) {
        const securityErrorTypes = [
            'AuthenticationError',
            'AuthorizationError',
            'ValidationError',
            'RateLimitError'
        ];
        
        return securityErrorTypes.includes(error.name) || 
               (error.message && error.message.toLowerCase().includes('sql injection')) ||
               (error.message && error.message.toLowerCase().includes('xss'));
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Health check for error handler
     */
    async getHealth() {
        const errorRates = {};
        
        this.errorCounts.forEach((count, key) => {
            const lastTime = this.lastErrorTime.get(key) || 0;
            const timeSinceLastError = Date.now() - lastTime;
            
            if (timeSinceLastError < 300000) { // Last 5 minutes
                errorRates[key] = {
                    count,
                    lastOccurrence: new Date(lastTime).toISOString()
                };
            }
        });

        return {
            status: 'healthy',
            uptime: process.uptime(),
            errorRates,
            isShuttingDown: this.isShuttingDown
        };
    }
}

// Singleton instance
const errorHandler = new ErrorHandler();

module.exports = errorHandler;