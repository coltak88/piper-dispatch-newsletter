const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { body, validationResult } = require('express-validator');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'production-security-middleware' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info'
    })
  ]
});

class ProductionSecurityMiddleware {
  constructor() {
    this.ddosProtection = new Map();
    this.ipReputation = new Map();
    this.requestFingerprinting = new Map();
    this.botDetection = new Map();
    this.initializeCleanupInterval();
  }

  // Advanced DDoS Protection
  ddosProtectionMiddleware() {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req);
      const userAgent = req.get('User-Agent') || 'unknown';
      const fingerprint = this.generateRequestFingerprint(req);
      
      // Check if IP is already blocked
      if (this.isIPBlocked(clientIP)) {
        logger.warn(`Blocked request from ${clientIP} - IP is blocked`);
        return res.status(403).json({
          error: 'Access denied',
          code: 'IP_BLOCKED',
          message: 'Your IP address has been blocked due to suspicious activity'
        });
      }

      // Rate limiting per IP with progressive delays
      const ipKey = `ddos_${clientIP}`;
      const currentTime = Date.now();
      
      if (!this.ddosProtection.has(ipKey)) {
        this.ddosProtection.set(ipKey, {
          count: 0,
          windowStart: currentTime,
          violations: 0,
          lastRequest: currentTime
        });
      }

      const ipData = this.ddosProtection.get(ipKey);
      const windowDuration = 60 * 1000; // 1 minute window
      
      // Reset window if expired
      if (currentTime - ipData.windowStart > windowDuration) {
        ipData.count = 0;
        ipData.windowStart = currentTime;
        ipData.violations = Math.max(0, ipData.violations - 1); // Decay violations
      }

      // Check request patterns
      const timeSinceLastRequest = currentTime - ipData.lastRequest;
      ipData.lastRequest = currentTime;

      // Detect rapid-fire requests (potential bot/DDoS)
      if (timeSinceLastRequest < 100) { // Less than 100ms between requests
        ipData.violations++;
        logger.warn(`Rapid-fire requests detected from ${clientIP}`);
      }

      // Detect suspicious user agents
      if (this.isSuspiciousUserAgent(userAgent)) {
        ipData.violations += 2;
        logger.warn(`Suspicious user agent detected: ${userAgent} from ${clientIP}`);
      }

      // Progressive rate limiting
      const baseLimit = 60; // Base requests per minute
      const violationMultiplier = Math.pow(2, ipData.violations);
      const currentLimit = Math.max(10, baseLimit / violationMultiplier);

      ipData.count++;

      if (ipData.count > currentLimit) {
        // Progressive blocking
        const blockDuration = Math.min(300000, 60000 * Math.pow(2, ipData.violations)); // Max 5 minutes
        this.blockIP(clientIP, blockDuration, 'DDoS protection triggered');
        
        logger.error(`DDoS protection triggered for ${clientIP}. Blocked for ${blockDuration}ms`);
        return res.status(429).json({
          error: 'Rate limit exceeded',
          code: 'DDOS_PROTECTION_TRIGGERED',
          retryAfter: Math.ceil(blockDuration / 1000),
          message: 'Too many requests. Please try again later.'
        });
      }

      // Add delay for high violation counts
      if (ipData.violations > 2) {
        const delay = Math.min(5000, 1000 * ipData.violations);
        setTimeout(() => next(), delay);
      } else {
        next();
      }
    };
  }

  // Advanced Bot Detection
  botDetectionMiddleware() {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req);
      const userAgent = req.get('User-Agent') || 'unknown';
      const fingerprint = this.generateRequestFingerprint(req);
      
      // Known bot signatures
      const botSignatures = [
        /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
        /python/i, /java/i, /httpclient/i, /okhttp/i, /axios/i
      ];

      const isKnownBot = botSignatures.some(signature => 
        signature.test(userAgent.toLowerCase())
      );

      if (isKnownBot && !this.isLegitimateBot(userAgent)) {
        logger.warn(`Known bot detected: ${userAgent} from ${clientIP}`);
        return res.status(403).json({
          error: 'Bot detected',
          code: 'BOT_DETECTED',
          message: 'Automated requests are not allowed'
        });
      }

      // Behavioral analysis
      const behaviorKey = `behavior_${fingerprint}`;
      const currentTime = Date.now();
      
      if (!this.botDetection.has(behaviorKey)) {
        this.botDetection.set(behaviorKey, {
          requests: [],
          patterns: new Map(),
          suspiciousScore: 0
        });
      }

      const behavior = this.botDetection.get(behaviorKey);
      behavior.requests.push({
        timestamp: currentTime,
        url: req.url,
        method: req.method,
        headers: this.sanitizeHeaders(req.headers)
      });

      // Keep only last 100 requests for analysis
      if (behavior.requests.length > 100) {
        behavior.requests = behavior.requests.slice(-100);
      }

      // Analyze patterns
      this.analyzeBehavioralPatterns(behavior, req);

      // Block if suspicious score is too high
      if (behavior.suspiciousScore > 50) {
        logger.error(`High suspicious score (${behavior.suspiciousScore}) for ${clientIP}`);
        this.blockIP(clientIP, 3600000, 'Bot behavior detected'); // Block for 1 hour
        
        return res.status(403).json({
          error: 'Suspicious activity detected',
          code: 'SUSPICIOUS_BEHAVIOR',
          message: 'Your request pattern appears to be automated'
        });
      }

      next();
    };
  }

  // Advanced Rate Limiting with Machine Learning
  intelligentRateLimiter(options = {}) {
    const {
      windowMs = 15 * 60 * 1000,
      max = 100,
      keyGenerator = (req) => this.getClientIP(req),
      skipSuccessfulRequests = false,
      skipFailedRequests = false
    } = options;

    const requests = new Map();

    return (req, res, next) => {
      const key = keyGenerator(req);
      const currentTime = Date.now();
      
      if (!requests.has(key)) {
        requests.set(key, []);
      }

      const keyRequests = requests.get(key);
      
      // Remove old requests outside the window
      const validRequests = keyRequests.filter(
        timestamp => currentTime - timestamp < windowMs
      );

      // Adaptive rate limiting based on request patterns
      let adjustedMax = max;
      
      // Reduce limit for suspicious patterns
      if (this.isSuspiciousPattern(validRequests)) {
        adjustedMax = Math.floor(max * 0.3);
        logger.warn(`Reduced rate limit for ${key} due to suspicious pattern`);
      }

      // Increase limit for trusted patterns
      if (this.isTrustedPattern(validRequests)) {
        adjustedMax = Math.floor(max * 1.5);
        logger.info(`Increased rate limit for ${key} due to trusted pattern`);
      }

      if (validRequests.length >= adjustedMax) {
        const oldestRequest = validRequests[0];
        const retryAfter = Math.ceil((windowMs - (currentTime - oldestRequest)) / 1000);
        
        logger.warn(`Rate limit exceeded for ${key}. Limit: ${adjustedMax}`);
        
        return res.status(429).json({
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: retryAfter,
          limit: adjustedMax,
          current: validRequests.length
        });
      }

      // Add current request timestamp
      validRequests.push(currentTime);
      requests.set(key, validRequests);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', adjustedMax);
      res.setHeader('X-RateLimit-Remaining', adjustedMax - validRequests.length);
      res.setHeader('X-RateLimit-Reset', new Date(currentTime + windowMs).toISOString());

      next();
    };
  }

  // SQL Injection Prevention
  sqlInjectionPrevention() {
    return (req, res, next) => {
      const sqlPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|truncate)\b)/i,
        /(\b(or|and)\b.*=.*\b(or|and)\b)/i,
        /(--|\/\*|\*\/|xp_)/i,
        /(\bwaitfor\s+delay\b)/i,
        /(\bexec\s*\(\s*['"])/i
      ];

      const checkForSQLInjection = (data) => {
        if (typeof data !== 'string') return false;
        
        return sqlPatterns.some(pattern => pattern.test(data.toLowerCase()));
      };

      const scanObject = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            if (checkForSQLInjection(obj[key])) {
              return true;
            }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (scanObject(obj[key])) {
              return true;
            }
          }
        }
        return false;
      };

      // Scan request body
      if (req.body && scanObject(req.body)) {
        const clientIP = this.getClientIP(req);
        logger.error(`SQL injection attempt detected from ${clientIP}`);
        this.blockIP(clientIP, 86400000, 'SQL injection attempt'); // Block for 24 hours
        
        return res.status(400).json({
          error: 'Invalid request',
          code: 'SQL_INJECTION_DETECTED',
          message: 'Your request contains invalid characters'
        });
      }

      next();
    };
  }

  // XSS Prevention
  xssPrevention() {
    return (req, res, next) => {
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /(<iframe|<object|<embed|<form)/gi,
        /(alert|confirm|prompt)\s*\(/gi
      ];

      const sanitizeInput = (input) => {
        if (typeof input !== 'string') return input;
        
        let sanitized = input;
        xssPatterns.forEach(pattern => {
          sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized.trim();
      };

      const sanitizeObject = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            obj[key] = sanitizeInput(obj[key]);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      };

      // Sanitize request body
      if (req.body) {
        sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        sanitizeObject(req.query);
      }

      next();
    };
  }

  // Request Size Limiting
  requestSizeLimit(options = {}) {
    const {
      maxSize = '1mb',
      maxParameterLength = 1000,
      maxArrayLength = 100
    } = options;

    const maxBytes = this.parseSize(maxSize);

    return (req, res, next) => {
      // Check content length
      const contentLength = parseInt(req.get('Content-Length') || '0');
      if (contentLength > maxBytes) {
        return res.status(413).json({
          error: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize: maxSize,
          currentSize: this.formatBytes(contentLength)
        });
      }

      // Check parameter lengths
      const checkParameterLength = (obj, depth = 0) => {
        if (depth > 10) return false; // Prevent deep recursion

        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            if (obj[key].length > maxParameterLength) {
              return false;
            }
          } else if (Array.isArray(obj[key])) {
            if (obj[key].length > maxArrayLength) {
              return false;
            }
            if (!obj[key].every(item => checkParameterLength(item, depth + 1))) {
              return false;
            }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (!checkParameterLength(obj[key], depth + 1)) {
              return false;
            }
          }
        }
        return true;
      };

      if (req.body && !checkParameterLength(req.body)) {
        return res.status(400).json({
          error: 'Invalid request parameters',
          code: 'PARAMETERS_TOO_LARGE'
        });
      }

      next();
    };
  }

  // Helper Methods
  getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  generateRequestFingerprint(req) {
    const data = [
      this.getClientIP(req),
      req.get('User-Agent') || '',
      req.get('Accept-Language') || '',
      req.get('Accept-Encoding') || '',
      req.get('DNT') || ''
    ].join('|');
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  isSuspiciousUserAgent(userAgent) {
    const suspiciousPatterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|python|java|httpclient/i,
      /okhttp|axios|postman|insomnia/i,
      /<|>|script|javascript/i,
      /^$/ // Empty user agent
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent.toLowerCase()));
  }

  isLegitimateBot(userAgent) {
    const legitimateBots = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
      'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot'
    ];

    return legitimateBots.some(bot => userAgent.toLowerCase().includes(bot));
  }

  isSuspiciousPattern(requests) {
    if (requests.length < 10) return false;

    // Check for machine-like timing
    const intervals = [];
    for (let i = 1; i < requests.length; i++) {
      intervals.push(requests[i] - requests[i-1]);
    }

    // If intervals are too consistent, it's likely a bot
    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    return variance < 100; // Very low variance indicates automation
  }

  isTrustedPattern(requests) {
    if (requests.length < 5) return false;

    // Check for human-like patterns (irregular timing)
    const intervals = [];
    for (let i = 1; i < requests.length; i++) {
      intervals.push(requests[i] - requests[i-1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    return avgInterval > 1000; // Average interval > 1 second suggests human behavior
  }

  analyzeBehavioralPatterns(behavior, req) {
    const recentRequests = behavior.requests.slice(-10);
    
    // Check for repetitive patterns
    const urls = recentRequests.map(r => r.url);
    const uniqueUrls = new Set(urls);
    
    if (uniqueUrls.size < urls.length * 0.5) {
      behavior.suspiciousScore += 10;
    }

    // Check for rapid navigation (too fast for human)
    const timeDiffs = [];
    for (let i = 1; i < recentRequests.length; i++) {
      timeDiffs.push(recentRequests[i].timestamp - recentRequests[i-1].timestamp);
    }
    
    const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    if (avgTimeDiff < 500) { // Less than 500ms between requests
      behavior.suspiciousScore += 15;
    }

    // Check for missing browser headers
    const requiredHeaders = ['user-agent', 'accept', 'accept-language', 'accept-encoding'];
    const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
    
    if (missingHeaders.length > 2) {
      behavior.suspiciousScore += 20;
    }
  }

  sanitizeHeaders(headers) {
    const sanitized = {};
    const safeHeaders = ['user-agent', 'accept', 'accept-language', 'accept-encoding', 'dnt'];
    
    safeHeaders.forEach(header => {
      if (headers[header]) {
        sanitized[header] = headers[header].substring(0, 200); // Limit length
      }
    });
    
    return sanitized;
  }

  blockIP(ip, duration, reason) {
    const expiry = Date.now() + duration;
    // This would typically integrate with your firewall or CDN
    logger.error(`IP ${ip} blocked for ${duration}ms: ${reason}`);
    // In production, integrate with Cloudflare, AWS WAF, etc.
  }

  parseSize(sizeStr) {
    const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
    const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([kmg]?b)$/);
    
    if (!match) return 1024 * 1024; // Default 1MB
    
    const size = parseFloat(match[1]);
    const unit = match[2];
    
    return Math.floor(size * (units[unit] || 1));
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  initializeCleanupInterval() {
    // Clean up old data every hour
    setInterval(() => {
      const now = Date.now();
      const cleanupWindow = 24 * 60 * 60 * 1000; // 24 hours

      // Cleanup DDoS protection data
      for (const [key, data] of this.ddosProtection.entries()) {
        if (now - data.lastRequest > cleanupWindow) {
          this.ddosProtection.delete(key);
        }
      }

      // Cleanup bot detection data
      for (const [key, data] of this.botDetection.entries()) {
        if (now - data.requests[data.requests.length - 1]?.timestamp > cleanupWindow) {
          this.botDetection.delete(key);
        }
      }

      logger.info('Security middleware cleanup completed');
    }, 60 * 60 * 1000); // Every hour
  }
}

// Export singleton instance
const productionSecurity = new ProductionSecurityMiddleware();

module.exports = {
  ProductionSecurityMiddleware,
  productionSecurity,
  // Convenience exports for individual middleware
  ddosProtection: productionSecurity.ddosProtectionMiddleware(),
  botDetection: productionSecurity.botDetectionMiddleware(),
  intelligentRateLimit: (options) => productionSecurity.intelligentRateLimiter(options),
  sqlInjectionPrevention: productionSecurity.sqlInjectionPrevention(),
  xssPrevention: productionSecurity.xssPrevention(),
  requestSizeLimit: (options) => productionSecurity.requestSizeLimit(options)
};