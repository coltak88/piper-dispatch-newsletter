const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const Sentry = require('@sentry/node');

class LoggingService {
  constructor() {
    this.loggers = new Map();
    this.initializeSentry();
    this.initializeDefaultLogger();
  }

  initializeSentry() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: this }),
        ],
      });
    }
  }

  initializeDefaultLogger() {
    const defaultLogger = this.createLogger('default', {
      level: process.env.LOG_LEVEL || 'info',
      console: true,
      file: true,
      dailyRotate: true,
      elasticsearch: process.env.ELASTICSEARCH_URL ? true : false
    });

    this.loggers.set('default', defaultLogger);
  }

  createLogger(name, options = {}) {
    const {
      level = 'info',
      console = true,
      file = true,
      dailyRotate = true,
      elasticsearch = false,
      sentry = true,
      maxSize = '20m',
      maxFiles = '14d'
    } = options;

    const transports = [];

    // Console transport
    if (console) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `[${timestamp}] ${level}: ${message}${metaStr}`;
            })
          ),
          level
        })
      );
    }

    // File transport
    if (file) {
      const fileFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      );

      if (dailyRotate) {
        // Daily rotate file transport
        transports.push(
          new DailyRotateFile({
            filename: path.join('logs', name, '%DATE%-combined.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize,
            maxFiles,
            format: fileFormat,
            level
          })
        );

        // Error log file
        transports.push(
          new DailyRotateFile({
            filename: path.join('logs', name, '%DATE%-error.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize,
            maxFiles,
            format: fileFormat,
            level: 'error'
          })
        );
      } else {
        // Regular file transport
        transports.push(
          new winston.transports.File({
            filename: path.join('logs', `${name}-combined.log`),
            format: fileFormat,
            maxSize,
            level
          })
        );

        transports.push(
          new winston.transports.File({
            filename: path.join('logs', `${name}-error.log`),
            format: fileFormat,
            level: 'error'
          })
        );
      }
    }

    // Elasticsearch transport
    if (elasticsearch && process.env.ELASTICSEARCH_URL) {
      transports.push(
        new ElasticsearchTransport({
          level,
          clientOpts: {
            node: process.env.ELASTICSEARCH_URL,
            auth: process.env.ELASTICSEARCH_AUTH ? {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD
            } : undefined
          },
          index: `logs-${name}-${process.env.NODE_ENV || 'development'}`,
          dataStream: true
        })
      );
    }

    const logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true })
      ),
      defaultMeta: { service: name },
      transports,
      exitOnError: false
    });

    // Add Sentry transport for errors
    if (sentry && process.env.SENTRY_DSN) {
      logger.on('data', (info) => {
        if (info.level === 'error' || info.level === 'fatal') {
          Sentry.captureException(new Error(info.message), {
            level: info.level,
            extra: info
          });
        }
      });
    }

    return logger;
  }

  getLogger(name = 'default') {
    if (!this.loggers.has(name)) {
      const logger = this.createLogger(name);
      this.loggers.set(name, logger);
    }
    return this.loggers.get(name);
  }

  // Structured logging methods
  logInfo(loggerName, message, meta = {}) {
    const logger = this.getLogger(loggerName);
    logger.info(message, meta);
  }

  logError(loggerName, message, error = null, meta = {}) {
    const logger = this.getLogger(loggerName);
    const logData = {
      ...meta,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    logger.error(message, logData);
  }

  logWarn(loggerName, message, meta = {}) {
    const logger = this.getLogger(loggerName);
    logger.warn(message, meta);
  }

  logDebug(loggerName, message, meta = {}) {
    const logger = this.getLogger(loggerName);
    logger.debug(message, meta);
  }

  // Request logging middleware
  requestLogger(loggerName = 'requests') {
    return (req, res, next) => {
      const start = Date.now();
      const originalSend = res.send;
      
      res.send = function(data) {
        const duration = Date.now() - start;
        const logger = this.getLogger(loggerName);
        
        const logData = {
          method: req.method,
          url: req.originalUrl || req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress,
          userId: req.user?.id || 'anonymous',
          contentLength: res.get('Content-Length') || 0,
          timestamp: new Date().toISOString()
        };

        if (res.statusCode >= 400) {
          logger.error('Request failed', logData);
        } else if (res.statusCode >= 300) {
          logger.warn('Request redirected', logData);
        } else {
          logger.info('Request completed', logData);
        }

        originalSend.call(this, data);
      }.bind(this);

      next();
    }.bind(this);
  }

  // Error logging middleware
  errorLogger(loggerName = 'errors') {
    return (error, req, res, next) => {
      const logger = this.getLogger(loggerName);
      
      const logData = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        request: {
          method: req.method,
          url: req.originalUrl || req.url,
          headers: req.headers,
          body: this.sanitizeBody(req.body),
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        },
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString()
      };

      logger.error('Unhandled error', logData);
      
      // Send to Sentry for critical errors
      if (process.env.SENTRY_DSN && (error.status >= 500 || !error.status)) {
        Sentry.captureException(error, {
          extra: logData
        });
      }

      next(error);
    };
  }

  // Sanitize sensitive data from logs
  sanitizeBody(body) {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password', 'confirmPassword', 'oldPassword', 'newPassword',
      'creditCard', 'cardNumber', 'cvv', 'securityCode',
      'ssn', 'socialSecurityNumber', 'taxId',
      'token', 'accessToken', 'refreshToken', 'apiKey', 'secretKey',
      'bankAccount', 'routingNumber', 'accountNumber'
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Performance logging
  logPerformance(loggerName, operation, duration, meta = {}) {
    const logger = this.getLogger(loggerName);
    const logData = {
      operation,
      duration: `${duration}ms`,
      performance: duration > 1000 ? 'poor' : duration > 500 ? 'fair' : 'good',
      ...meta
    };

    if (duration > 1000) {
      logger.error('Performance issue detected', logData);
    } else if (duration > 500) {
      logger.warn('Slow operation detected', logData);
    } else {
      logger.info('Operation completed', logData);
    }
  }

  // Business event logging
  logBusinessEvent(loggerName, eventType, eventData = {}) {
    const logger = this.getLogger(loggerName);
    const logData = {
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId()
    };

    logger.info('Business event', logData);
  }

  // Security event logging
  logSecurityEvent(loggerName, eventType, eventData = {}) {
    const logger = this.getLogger(loggerName);
    const logData = {
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      severity: this.getSecuritySeverity(eventType),
      eventId: this.generateEventId()
    };

    if (logData.severity === 'high') {
      logger.error('Security event', logData);
    } else if (logData.severity === 'medium') {
      logger.warn('Security event', logData);
    } else {
      logger.info('Security event', logData);
    }
  }

  getSecuritySeverity(eventType) {
    const highSeverityEvents = [
      'login_failed', 'password_reset_failed', 'account_locked',
      'unauthorized_access', 'data_breach', 'suspicious_activity'
    ];
    
    const mediumSeverityEvents = [
      'password_changed', 'email_changed', 'profile_updated',
      'two_factor_enabled', 'two_factor_disabled'
    ];

    if (highSeverityEvents.includes(eventType)) return 'high';
    if (mediumSeverityEvents.includes(eventType)) return 'medium';
    return 'low';
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log rotation and cleanup
  setupLogRotation() {
    // Daily cleanup task
    setInterval(() => {
      this.cleanupOldLogs();
    }, 24 * 60 * 60 * 1000); // Run daily
  }

  cleanupOldLogs() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const logDir = 'logs';
      if (fs.existsSync(logDir)) {
        const files = fs.readdirSync(logDir);
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        files.forEach(file => {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime.getTime() < thirtyDaysAgo && file.endsWith('.log')) {
            fs.unlinkSync(filePath);
            this.logInfo('logging', `Cleaned up old log file: ${file}`);
          }
        });
      }
    } catch (error) {
      this.logError('logging', 'Failed to cleanup old logs', error);
    }
  }

  // Health check for logging service
  getHealth() {
    const health = {
      status: 'healthy',
      loggers: this.loggers.size,
      timestamp: new Date().toISOString()
    };

    // Check if log directory is writable
    try {
      const fs = require('fs');
      const testFile = 'logs/health-check.tmp';
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error) {
      health.status = 'unhealthy';
      health.error = 'Log directory not writable';
    }

    return health;
  }
}

module.exports = LoggingService;