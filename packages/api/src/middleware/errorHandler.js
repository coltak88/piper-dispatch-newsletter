const errorHandler = require('../services/ErrorHandler');
const loggingService = require('../services/LoggingService');

/**
 * Express Error Handling Middleware
 * Provides comprehensive error handling for the application
 */

/**
 * Main error handling middleware
 */
const handleErrors = (error, req, res, next) => {
    // Use the centralized error handler
    errorHandler.middleware()(error, req, res, next);
};

/**
 * 404 Not Found handler
 */
const handleNotFound = (req, res, next) => {
    const error = new Error(`Resource not found: ${req.originalUrl}`);
    error.name = 'NotFoundError';
    error.status = 404;
    next(error);
};

/**
 * Async error wrapper for route handlers
 * Automatically catches errors in async functions
 */
const asyncHandler = (fn) => {
    return errorHandler.asyncWrapper(fn);
};

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
    const errors = req.validationErrors;
    
    if (errors && errors.length > 0) {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        error.errors = errors;
        return next(error);
    }
    
    next();
};

/**
 * Rate limit error handler
 */
const handleRateLimit = (req, res, next) => {
    // This would typically be handled by rate limiting middleware
    // But we provide a custom handler here for consistency
    if (req.rateLimit && req.rateLimit.current >= req.rateLimit.limit) {
        const error = new Error('Too many requests');
        error.name = 'RateLimitError';
        error.retryAfter = req.rateLimit.resetTime;
        return next(error);
    }
    next();
};

/**
 * Database error handler
 */
const handleDatabaseErrors = (error, req, res, next) => {
    if (error.name && error.name.includes('MongoError')) {
        const dbError = new Error('Database operation failed');
        dbError.name = 'DatabaseError';
        dbError.originalError = error;
        return next(dbError);
    }
    
    if (error.code && error.code === 11000) {
        // MongoDB duplicate key error
        const conflictError = new Error('Resource already exists');
        conflictError.name = 'ConflictError';
        conflictError.code = 'CONFLICT';
        return next(conflictError);
    }
    
    next(error);
};

/**
 * External service error handler
 */
const handleExternalServiceErrors = (error, req, res, next) => {
    // Handle external API errors
    if (error.response && error.response.status) {
        const serviceError = new Error('External service unavailable');
        serviceError.name = 'ExternalServiceError';
        serviceError.status = error.response.status;
        serviceError.serviceError = error;
        return next(serviceError);
    }
    
    // Handle network errors
    if (error.code && ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)) {
        const networkError = new Error('Network error occurred');
        networkError.name = 'ExternalServiceError';
        networkError.originalError = error;
        return next(networkError);
    }
    
    next(error);
};

/**
 * Error recovery suggestions
 */
const getRecoverySuggestions = (error, req) => {
    const suggestions = [];
    
    switch (error.name) {
        case 'ValidationError':
            suggestions.push('Check your input data and ensure all required fields are provided');
            suggestions.push('Verify data types and formats match the expected schema');
            break;
            
        case 'AuthenticationError':
            suggestions.push('Verify your credentials are correct');
            suggestions.push('Check if your session has expired');
            suggestions.push('Try logging out and logging back in');
            break;
            
        case 'AuthorizationError':
            suggestions.push('Check if you have the necessary permissions');
            suggestions.push('Contact your administrator if you believe you should have access');
            break;
            
        case 'DatabaseError':
            suggestions.push('The service is experiencing issues, please try again later');
            suggestions.push('If the problem persists, contact support');
            break;
            
        case 'ExternalServiceError':
            suggestions.push('An external service is unavailable');
            suggestions.push('Please try again in a few minutes');
            break;
            
        case 'RateLimitError':
            suggestions.push(`Please wait ${error.retryAfter || 60} seconds before retrying`);
            suggestions.push('Consider reducing the frequency of your requests');
            break;
            
        default:
            suggestions.push('An unexpected error occurred');
            suggestions.push('Please try again or contact support if the issue persists');
    }
    
    return suggestions;
};

/**
 * Error context enrichment
 */
const enrichErrorContext = (error, req) => {
    const context = {
        timestamp: new Date().toISOString(),
        requestId: req.id || req.headers['x-request-id'] || 'unknown',
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        method: req.method,
        url: req.originalUrl || req.url,
        userId: req.user?.id || 'anonymous'
    };
    
    // Add request body for debugging (sanitized)
    if (req.body && Object.keys(req.body).length > 0) {
        context.body = loggingService.sanitizeData(req.body);
    }
    
    // Add query parameters
    if (req.query && Object.keys(req.query).length > 0) {
        context.query = req.query;
    }
    
    return context;
};

/**
 * Error severity assessment
 */
const getErrorSeverity = (error) => {
    const errorName = error.name || error.constructor.name;
    
    // Critical errors
    const criticalErrors = ['DatabaseError', 'ExternalServiceError'];
    if (criticalErrors.includes(errorName)) {
        return 'critical';
    }
    
    // High severity errors
    const highSeverityErrors = ['AuthenticationError', 'AuthorizationError'];
    if (highSeverityErrors.includes(errorName)) {
        return 'high';
    }
    
    // Medium severity errors
    const mediumSeverityErrors = ['ValidationError', 'ConflictError'];
    if (mediumSeverityErrors.includes(errorName)) {
        return 'medium';
    }
    
    // Low severity errors
    if (errorName === 'NotFoundError') {
        return 'low';
    }
    
    // Default to high for unknown errors
    return 'high';
};

/**
 * Error aggregation and reporting
 */
const aggregateErrors = (errors) => {
    const aggregated = {
        total: errors.length,
        byType: {},
        bySeverity: {},
        timeRange: {
            start: null,
            end: null
        }
    };
    
    errors.forEach(error => {
        // Count by type
        const errorType = error.name || 'UnknownError';
        aggregated.byType[errorType] = (aggregated.byType[errorType] || 0) + 1;
        
        // Count by severity
        const severity = getErrorSeverity(error);
        aggregated.bySeverity[severity] = (aggregated.bySeverity[severity] || 0) + 1;
        
        // Update time range
        const errorTime = new Date(error.timestamp || Date.now());
        if (!aggregated.timeRange.start || errorTime < aggregated.timeRange.start) {
            aggregated.timeRange.start = errorTime;
        }
        if (!aggregated.timeRange.end || errorTime > aggregated.timeRange.end) {
            aggregated.timeRange.end = errorTime;
        }
    });
    
    return aggregated;
};

/**
 * Health check for error handling system
 */
const getHealth = async () => {
    try {
        const errorHandlerHealth = await errorHandler.getHealth();
        
        return {
            status: 'healthy',
            errorHandler: errorHandlerHealth,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Error recovery strategies
 */
const implementRecoveryStrategy = (error, req) => {
    const strategies = {
        // Database connection recovery
        async recoverDatabaseConnection() {
            // Implement database reconnection logic
            loggingService.logInfo('recovery', 'Attempting database connection recovery');
            // This would typically involve retrying the database connection
        },
        
        // External service recovery
        async recoverExternalService() {
            // Implement external service recovery
            loggingService.logInfo('recovery', 'Attempting external service recovery');
            // This might involve switching to backup services or retrying
        },
        
        // Memory cleanup
        async recoverMemory() {
            // Implement memory cleanup
            if (global.gc) {
                global.gc();
                loggingService.logInfo('recovery', 'Forced garbage collection');
            }
        }
    };
    
    return strategies;
};

module.exports = {
    handleErrors,
    handleNotFound,
    asyncHandler,
    handleValidationErrors,
    handleRateLimit,
    handleDatabaseErrors,
    handleExternalServiceErrors,
    getRecoverySuggestions,
    enrichErrorContext,
    getErrorSeverity,
    aggregateErrors,
    getHealth,
    implementRecoveryStrategy,
    errorHandler // Export the main error handler instance
};