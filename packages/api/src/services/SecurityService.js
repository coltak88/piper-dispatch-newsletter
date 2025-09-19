const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const winston = require('winston');
const { body, validationResult } = require('express-validator');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-combined.log' })
  ]
});

class SecurityService {
  constructor() {
    this.failedAttempts = new Map();
    this.blockedIPs = new Map();
    this.suspiciousActivities = new Map();
    this.rateLimiters = new Map();
  }

  // Password hashing and validation
  hashPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return {
      salt: salt,
      hash: hash
    };
  }

  verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // JWT token generation and validation
  generateJWT(payload, secret, expiresIn = '24h') {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadStr = Buffer.from(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry(expiresIn)
    })).toString('base64');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payloadStr}`)
      .digest('base64');

    return `${header}.${payloadStr}.${signature}`;
  }

  verifyJWT(token, secret) {
    try {
      const [header, payload, signature] = token.split('.');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64');

      if (signature !== expectedSignature) {
        throw new Error('Invalid token signature');
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
      
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token has expired');
      }

      return decodedPayload;
    } catch (error) {
      logger.error('JWT verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }

  parseExpiry(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }

  // Rate limiting with different strategies
  createRateLimiter(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100,
      message = 'Too many requests from this IP',
      standardHeaders = true,
      legacyHeaders = false,
      handler = (req, res) => {
        res.status(429).json({
          error: 'Too many requests',
          message: message,
          retryAfter: Math.round(windowMs / 1000)
        });
      }
    } = options;

    return rateLimit({
      windowMs,
      max,
      message,
      standardHeaders,
      legacyHeaders,
      handler: (req, res) => {
        this.logSuspiciousActivity(req.ip, 'rate_limit_exceeded', {
          url: req.url,
          method: req.method,
          userAgent: req.get('User-Agent')
        });
        handler(req, res);
      }
    });
  }

  // Advanced rate limiting for specific endpoints
  createAdvancedRateLimiter(endpoint, options = {}) {
    const key = `rate_limit_${endpoint}`;
    
    if (this.rateLimiters.has(key)) {
      return this.rateLimiters.get(key);
    }

    const limiter = this.createRateLimiter({
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || 5,
      message: options.message || `Rate limit exceeded for ${endpoint}`,
      ...options
    });

    this.rateLimiters.set(key, limiter);
    return limiter;
  }

  // Brute force protection
  trackFailedAttempt(identifier, ip) {
    const key = `failed_${identifier}_${ip}`;
    const now = Date.now();
    
    if (!this.failedAttempts.has(key)) {
      this.failedAttempts.set(key, { count: 0, timestamps: [] });
    }

    const attempts = this.failedAttempts.get(key);
    attempts.count++;
    attempts.timestamps.push(now);

    // Keep only timestamps from last 15 minutes
    attempts.timestamps = attempts.timestamps.filter(
      timestamp => now - timestamp < 15 * 60 * 1000
    );

    // Block after 5 failed attempts
    if (attempts.count >= 5) {
      this.blockIP(ip, 30 * 60 * 1000); // Block for 30 minutes
      this.logSuspiciousActivity(ip, 'brute_force_detected', {
        identifier,
        attempts: attempts.count
      });
      return true;
    }

    return false;
  }

  clearFailedAttempts(identifier, ip) {
    const key = `failed_${identifier}_${ip}`;
    this.failedAttempts.delete(key);
  }

  blockIP(ip, duration = 30 * 60 * 1000) {
    const expiry = Date.now() + duration;
    this.blockedIPs.set(ip, expiry);
    
    logger.warn(`IP ${ip} blocked for ${duration}ms`);
  }

  isIPBlocked(ip) {
    if (!this.blockedIPs.has(ip)) return false;
    
    const expiry = this.blockedIPs.get(ip);
    if (Date.now() > expiry) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  // Input validation and sanitization
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
  }

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      strength: this.calculatePasswordStrength(password)
    };
  }

  calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  // CSRF protection
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCSRFToken(token, sessionToken) {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(sessionToken)
    );
  }

  // API key generation and validation
  generateAPIKey() {
    const prefix = 'pk_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return prefix + randomBytes;
  }

  generateSecretKey() {
    const prefix = 'sk_';
    const randomBytes = crypto.randomBytes(64).toString('hex');
    return prefix + randomBytes;
  }

  // Encryption for sensitive data
  encrypt(text, key) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData, key) {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, key);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Suspicious activity tracking
  logSuspiciousActivity(ip, activityType, details = {}) {
    const key = `suspicious_${ip}_${activityType}`;
    const now = Date.now();
    
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, {
        count: 0,
        firstSeen: now,
        lastSeen: now,
        details: []
      });
    }

    const activity = this.suspiciousActivities.get(key);
    activity.count++;
    activity.lastSeen = now;
    activity.details.push({
      timestamp: now,
      ...details
    });

    // Keep only last 10 details
    if (activity.details.length > 10) {
      activity.details = activity.details.slice(-10);
    }

    logger.warn(`Suspicious activity detected: ${activityType} from ${ip}`, {
      activityType,
      ip,
      count: activity.count,
      details
    });

    // Auto-block after 10 suspicious activities
    if (activity.count >= 10) {
      this.blockIP(ip, 24 * 60 * 60 * 1000); // Block for 24 hours
      logger.error(`IP ${ip} auto-blocked due to excessive suspicious activities`);
    }
  }

  // Security headers middleware
  securityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
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
    });
  }

  // Input validation middleware
  validateInput(validations) {
    return async (req, res, next) => {
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }
      
      next();
    };
  }

  // Common validation rules
  static getValidationRules() {
    return {
      email: body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 320 })
        .withMessage('Please provide a valid email address'),
      
      password: body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
      
      name: body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name must be 2-100 characters and contain only letters, spaces, hyphens and apostrophes'),
      
      url: body('url')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL'),
      
      phone: body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .isLength({ min: 10, max: 20 })
        .withMessage('Please provide a valid phone number')
    };
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    
    // Clean up failed attempts
    for (const [key, attempts] of this.failedAttempts.entries()) {
      attempts.timestamps = attempts.timestamps.filter(
        timestamp => now - timestamp < 15 * 60 * 1000
      );
      if (attempts.timestamps.length === 0) {
        this.failedAttempts.delete(key);
      }
    }

    // Clean up blocked IPs
    for (const [ip, expiry] of this.blockedIPs.entries()) {
      if (now > expiry) {
        this.blockedIPs.delete(ip);
      }
    }

    // Clean up suspicious activities
    for (const [key, activity] of this.suspiciousActivities.entries()) {
      if (now - activity.lastSeen > 24 * 60 * 60 * 1000) {
        this.suspiciousActivities.delete(key);
      }
    }
  }
}

module.exports = SecurityService;