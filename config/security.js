const winston = require('winston');
const crypto = require('crypto');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-config' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-config-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-config-combined.log' })
  ]
});

class SecurityConfig {
  constructor() {
    this.environments = {
      development: this.getDevelopmentConfig(),
      staging: this.getStagingConfig(),
      production: this.getProductionConfig()
    };
    
    this.currentEnvironment = process.env.NODE_ENV || 'development';
    this.config = this.environments[this.currentEnvironment] || this.environments.development;
    
    this.validateConfiguration();
  }

  getDevelopmentConfig() {
    return {
      // Security Headers
      securityHeaders: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
          }
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false // Disabled for development
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'same-origin' }
      },

      // Rate Limiting
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Much higher for development
        message: 'Too many requests from this IP'
      },

      // DDoS Protection
      ddosProtection: {
        enabled: false, // Disabled for development
        burstThreshold: 50,
        sustainedThreshold: 30,
        blockDuration: 60000, // 1 minute
        whitelist: ['127.0.0.1', '::1']
      },

      // Input Validation
      inputValidation: {
        maxParameterLength: 1000,
        maxArrayLength: 100,
        maxNestedDepth: 5,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        maxFileSize: '10mb'
      },

      // Authentication
      auth: {
        jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
        jwtExpiration: '24h', // Longer for development
        refreshTokenExpiration: '7d',
        passwordRequirements: {
          minLength: 8,
          requireUppercase: false,
          requireLowercase: true,
          requireNumbers: false,
          requireSpecialChars: false
        },
        sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
        maxFailedLoginAttempts: 10 // Higher for development
      },

      // CORS
      cors: {
        origin: true, // Allow all origins in development
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      },

      // Logging
      logging: {
        level: 'debug',
        logRequests: true,
        logResponses: false,
        logErrors: true,
        logSecurityEvents: true
      }
    };
  }

  getStagingConfig() {
    return {
      // Security Headers
      securityHeaders: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "https://staging.piper-newsletter.com"],
            connectSrc: ["'self'", "https://staging.piper-newsletter.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
          }
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'same-origin' }
      },

      // Rate Limiting
      rateLimiting: {
        windowMs: 15 * 60 * 1000,
        max: 300, // Moderate for staging
        message: 'Too many requests from this IP'
      },

      // DDoS Protection
      ddosProtection: {
        enabled: true,
        burstThreshold: 30,
        sustainedThreshold: 20,
        blockDuration: 300000, // 5 minutes
        whitelist: ['127.0.0.1', '::1', '10.0.0.0/8']
      },

      // Input Validation
      inputValidation: {
        maxParameterLength: 500,
        maxArrayLength: 50,
        maxNestedDepth: 3,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        maxFileSize: '5mb'
      },

      // Authentication
      auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiration: '2h',
        refreshTokenExpiration: '3d',
        passwordRequirements: {
          minLength: 10,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
        maxFailedLoginAttempts: 5
      },

      // CORS
      cors: {
        origin: [
          'https://staging.piper-newsletter.com',
          'https://app-staging.piper-newsletter.com'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      },

      // Logging
      logging: {
        level: 'info',
        logRequests: true,
        logResponses: false,
        logErrors: true,
        logSecurityEvents: true
      }
    };
  }

  getProductionConfig() {
    return {
      // Security Headers
      securityHeaders: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "https://piper-newsletter.com"],
            connectSrc: ["'self'", "https://api.piper-newsletter.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: []
          }
        },
        hsts: {
          maxAge: 63072000, // 2 years
          includeSubDomains: true,
          preload: true
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
      },

      // Rate Limiting
      rateLimiting: {
        windowMs: 15 * 60 * 1000,
        max: 100, // Strict for production
        message: 'Too many requests from this IP',
        standardHeaders: true,
        legacyHeaders: false
      },

      // DDoS Protection
      ddosProtection: {
        enabled: true,
        burstThreshold: 20,
        sustainedThreshold: 10,
        blockDuration: 900000, // 15 minutes
        whitelist: ['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12']
      },

      // Input Validation
      inputValidation: {
        maxParameterLength: 255,
        maxArrayLength: 25,
        maxNestedDepth: 2,
        allowedFileTypes: ['jpg', 'jpeg', 'png'],
        maxFileSize: '2mb'
      },

      // Authentication
      auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiration: '1h',
        refreshTokenExpiration: '1d',
        passwordRequirements: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          preventCommonPasswords: true,
          maxAge: 90 // days
        },
        sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours
        maxFailedLoginAttempts: 3,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
        requireTwoFactor: true
      },

      // CORS
      cors: {
        origin: [
          'https://piper-newsletter.com',
          'https://www.piper-newsletter.com',
          'https://app.piper-newsletter.com'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type', 
          'Authorization', 
          'X-Requested-With',
          'X-CSRF-Token'
        ]
      },

      // Logging
      logging: {
        level: 'warn',
        logRequests: false, // Disabled for performance
        logResponses: false,
        logErrors: true,
        logSecurityEvents: true,
        logToCloud: true
      },

      // Additional Production Security
      productionSecurity: {
        enableSecurityAudit: true,
        vulnerabilityScanning: true,
        penetrationTesting: false, // Set to true during security audits
        complianceChecks: true,
        dataEncryption: {
          atRest: true,
          inTransit: true,
          keyRotation: 90 // days
        },
        backupEncryption: true,
        secureCommunication: {
          minTLSVersion: '1.2',
          cipherSuites: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256'
          ]
        }
      }
    };
  }

  validateConfiguration() {
    const requiredEnvVars = {
      production: ['JWT_SECRET', 'DATABASE_URL', 'REDIS_URL'],
      staging: ['JWT_SECRET', 'DATABASE_URL'],
      development: []
    };

    const requiredVars = requiredEnvVars[this.currentEnvironment] || [];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.error(`Missing required environment variables for ${this.currentEnvironment}:`, missingVars);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate JWT secret strength
    if (this.currentEnvironment === 'production' && process.env.JWT_SECRET) {
      if (process.env.JWT_SECRET.length < 32) {
        logger.error('JWT_SECRET is too short for production use');
        throw new Error('JWT_SECRET must be at least 32 characters long for production');
      }
    }

    logger.info(`Security configuration validated for ${this.currentEnvironment}`);
  }

  getConfig() {
    return this.config;
  }

  getEnvironment() {
    return this.currentEnvironment;
  }

  // Environment-specific helpers
  isProduction() {
    return this.currentEnvironment === 'production';
  }

  isDevelopment() {
    return this.currentEnvironment === 'development';
  }

  isStaging() {
    return this.currentEnvironment === 'staging';
  }

  // Security utilities
  generateSecureKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  hashSensitiveData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  maskSensitiveData(data) {
    if (typeof data !== 'string') return data;
    
    // Mask credit card numbers
    data = data.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
    
    // Mask email addresses
    data = data.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) => {
      const [username, domain] = match.split('@');
      return `${username.charAt(0)}***@${domain}`;
    });
    
    return data;
  }
}

// Create singleton instance
const securityConfig = new SecurityConfig();

module.exports = {
  SecurityConfig,
  securityConfig
};