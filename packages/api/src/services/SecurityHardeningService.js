const crypto = require('crypto');
const winston = require('winston');
const { body, validationResult } = require('express-validator');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-hardening' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-hardening-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-hardening-combined.log' })
  ]
});

class SecurityHardeningService {
  constructor() {
    this.vulnerabilityPatterns = this.initializeVulnerabilityPatterns();
    this.securityHeaders = this.initializeSecurityHeaders();
    this.inputFilters = this.initializeInputFilters();
    this.encryptionKeys = new Map();
    this.securityEvents = [];
    this.threatIntelligence = new Map();
    this.initializeThreatIntelligence();
  }

  initializeVulnerabilityPatterns() {
    return {
      // SQL Injection patterns
      sqlInjection: [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|cast|convert)\b.*\b(from|where|and|or|having|group|order|by)\b)/i,
        /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
        /(\b(or|and)\s+['"]\s*=\s*['"])/i,
        /(;\s*(drop|delete|truncate|update|insert|create|alter)\b)/i,
        /(\bunion\b.*\bselect\b.*\bfrom\b)/i
      ],

      // XSS patterns
      xss: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=\s*["']?[^"']*["']?/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
        /<embed[^>]*>.*?<\/embed>/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi
      ],

      // Command Injection patterns
      commandInjection: [
        /[;&|`]/,
        /\$\(/,
        /\b(cat|echo|ls|pwd|id|whoami|uname|nc|netcat|wget|curl)\b/i,
        /\b(cmd|powershell|bash|sh|zsh)\b/i
      ],

      // Path Traversal patterns
      pathTraversal: [
        /\.\.\//,
        /%2e%2e%2f/,
        /%252e%252e%252f/,
        /\.\.\\/,
        /%2e%2e%5c/,
        /%252e%252e%255c/
      ],

      // LDAP Injection patterns
      ldapInjection: [
        /[\*\(\)\\\|&=]/,
        /\b(and|or|not)\b/i,
        /\*/
      ],

      // XML/XXE patterns
      xmlInjection: [
        /<\!ENTITY/i,
        /SYSTEM\s+["'][^"']*["']/i,
        /PUBLIC\s+["'][^"']*["']\s+["'][^"']*["']/i
      ],

      // NoSQL Injection patterns
      nosqlInjection: [
        /\$where/i,
        /\$ne/,
        /\$gt/,
        /\$lt/,
        /\$regex/,
        /\$exists/
      ]
    };
  }

  initializeSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'X-Download-Options': 'noopen',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
    };
  }

  initializeInputFilters() {
    return {
      maxLength: 10000,
      maxNestedDepth: 10,
      maxArraySize: 1000,
      forbiddenStrings: [
        'eval(', 'expression(', 'javascript:', 'vbscript:',
        'onload=', 'onerror=', 'onclick=', 'onmouseover='
      ],
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: ['class', 'id', 'style']
    };
  }

  initializeThreatIntelligence() {
    // Known malicious IPs, user agents, patterns
    const maliciousIPs = [
      '192.168.1.100', // Example - in real implementation, fetch from threat feeds
      '10.0.0.50'
    ];

    const maliciousUserAgents = [
      /sqlmap/i,
      /nikto/i,
      /nessus/i,
      /burp/i,
      /zap/i,
      /acunetix/i
    ];

    maliciousIPs.forEach(ip => {
      this.threatIntelligence.set(ip, { type: 'malicious_ip', severity: 'high' });
    });

    this.vulnerabilityPatterns.maliciousUserAgents = maliciousUserAgents;
  }

  // Advanced Input Validation and Sanitization
  validateAndSanitizeInput(input, options = {}) {
    const {
      type = 'string',
      maxLength = this.inputFilters.maxLength,
      minLength = 0,
      required = false,
      allowHtml = false,
      customValidation = null
    } = options;

    try {
      // Check if required
      if (required && (input === undefined || input === null || input === '')) {
        throw new Error('Input is required');
      }

      // Handle optional empty input
      if (!required && (input === undefined || input === null || input === '')) {
        return { success: true, data: input, sanitized: true };
      }

      // Convert to string for processing
      let processedInput = String(input);

      // Check length
      if (processedInput.length > maxLength) {
        throw new Error(`Input exceeds maximum length of ${maxLength}`);
      }

      if (processedInput.length < minLength) {
        throw new Error(`Input must be at least ${minLength} characters`);
      }

      // Check for vulnerability patterns
      const vulnerabilityCheck = this.checkForVulnerabilities(processedInput);
      if (vulnerabilityCheck.found) {
        this.logSecurityEvent('vulnerability_detected', {
          input: this.maskSensitiveData(processedInput),
          vulnerabilities: vulnerabilityCheck.types,
          severity: 'high'
        });
        throw new Error(`Potential security vulnerability detected: ${vulnerabilityCheck.types.join(', ')}`);
      }

      // Sanitize based on type
      let sanitizedInput = this.sanitizeByType(processedInput, type, allowHtml);

      // Apply custom validation if provided
      if (customValidation && !customValidation(sanitizedInput)) {
        throw new Error('Custom validation failed');
      }

      return {
        success: true,
        data: sanitizedInput,
        originalLength: processedInput.length,
        sanitizedLength: sanitizedInput.length,
        sanitized: processedInput !== sanitizedInput
      };

    } catch (error) {
      this.logSecurityEvent('validation_failed', {
        input: this.maskSensitiveData(String(input)),
        error: error.message,
        severity: 'medium'
      });

      return {
        success: false,
        error: error.message,
        sanitized: false
      };
    }
  }

  checkForVulnerabilities(input) {
    const foundVulnerabilities = [];

    for (const [vulnerabilityType, patterns] of Object.entries(this.vulnerabilityPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          foundVulnerabilities.push(vulnerabilityType);
          break;
        }
      }
    }

    return {
      found: foundVulnerabilities.length > 0,
      types: foundVulnerabilities,
      severity: this.calculateVulnerabilitySeverity(foundVulnerabilities)
    };
  }

  calculateVulnerabilitySeverity(vulnerabilityTypes) {
    const severityMap = {
      sqlInjection: 'critical',
      xss: 'high',
      commandInjection: 'critical',
      pathTraversal: 'high',
      ldapInjection: 'medium',
      xmlInjection: 'medium',
      nosqlInjection: 'high'
    };

    if (vulnerabilityTypes.length === 0) return 'none';

    const severities = vulnerabilityTypes.map(type => severityMap[type] || 'low');
    
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  sanitizeByType(input, type, allowHtml = false) {
    switch (type) {
      case 'email':
        return this.sanitizeEmail(input);
      case 'url':
        return this.sanitizeUrl(input);
      case 'phone':
        return this.sanitizePhone(input);
      case 'number':
        return this.sanitizeNumber(input);
      case 'json':
        return this.sanitizeJson(input);
      case 'html':
        return allowHtml ? this.sanitizeHtml(input) : this.sanitizeText(input);
      default:
        return this.sanitizeText(input);
    }
  }

  sanitizeEmail(email) {
    // Remove any HTML or script tags
    let sanitized = email.replace(/<[^>]*>/g, '');
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    // Normalize and return
    return sanitized.toLowerCase().trim();
  }

  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Check for suspicious protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        throw new Error('URL protocol not allowed');
      }
      
      // Check for path traversal
      if (this.vulnerabilityPatterns.pathTraversal.some(pattern => pattern.test(url))) {
        throw new Error('URL contains path traversal patterns');
      }
      
      return urlObj.href;
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  sanitizePhone(phone) {
    // Remove all non-numeric characters except +
    let sanitized = phone.replace(/[^\d+]/g, '');
    
    // Validate phone format
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(sanitized)) {
      throw new Error('Invalid phone number format');
    }
    
    return sanitized;
  }

  sanitizeNumber(number) {
    const num = Number(number);
    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }
    
    // Check for potential numeric overflow
    if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
      throw new Error('Number too large');
    }
    
    return num;
  }

  sanitizeJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Recursively sanitize JSON
      const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
          return this.sanitizeText(obj);
        } else if (Array.isArray(obj)) {
          return obj.map(item => sanitizeObject(item));
        } else if (typeof obj === 'object' && obj !== null) {
          const sanitized = {};
          for (const [key, value] of Object.entries(obj)) {
            const sanitizedKey = this.sanitizeText(key);
            sanitized[sanitizedKey] = sanitizeObject(value);
          }
          return sanitized;
        }
        return obj;
      };
      
      return JSON.stringify(sanitizeObject(parsed));
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  sanitizeText(text) {
    let sanitized = text;
    
    // Remove forbidden strings
    this.inputFilters.forbiddenStrings.forEach(forbidden => {
      sanitized = sanitized.replace(new RegExp(forbidden, 'gi'), '');
    });
    
    // Remove HTML tags unless explicitly allowed
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove potential script injections
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    return sanitized.trim();
  }

  sanitizeHtml(html) {
    // Use a more sophisticated HTML sanitizer in production
    // This is a basic implementation
    let sanitized = html;
    
    // Remove dangerous tags
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Remove dangerous attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'];
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`${attr}\\s*=\\s*["']?[^"']*["']?`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized;
  }

  // Advanced Encryption and Key Management
  generateEncryptionKey(keyType = 'aes-256-gcm') {
    switch (keyType) {
      case 'aes-256-gcm':
        return crypto.randomBytes(32);
      case 'aes-192-gcm':
        return crypto.randomBytes(24);
      case 'aes-128-gcm':
        return crypto.randomBytes(16);
      default:
        throw new Error('Unsupported encryption key type');
    }
  }

  encryptSensitiveData(data, key = null) {
    try {
      const encryptionKey = key || this.generateEncryptionKey();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-gcm', encryptionKey);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: 'aes-256-gcm',
        keyId: this.storeEncryptionKey(encryptionKey)
      };
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decryptSensitiveData(encryptedData, keyId) {
    try {
      const key = this.getEncryptionKey(keyId);
      if (!key) {
        throw new Error('Encryption key not found');
      }
      
      const decipher = crypto.createDecipher('aes-256-gcm', key);
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  storeEncryptionKey(key) {
    const keyId = crypto.randomBytes(16).toString('hex');
    this.encryptionKeys.set(keyId, {
      key: key,
      created: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    return keyId;
  }

  getEncryptionKey(keyId) {
    const keyData = this.encryptionKeys.get(keyId);
    if (!keyData) return null;
    
    if (Date.now() > keyData.expires) {
      this.encryptionKeys.delete(keyId);
      return null;
    }
    
    return keyData.key;
  }

  // Security Event Logging and Monitoring
  logSecurityEvent(eventType, details) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      eventType: eventType,
      severity: details.severity || 'medium',
      details: details,
      sessionId: details.sessionId || null,
      userId: details.userId || null,
      ipAddress: details.ipAddress || null,
      userAgent: details.userAgent || null
    };
    
    this.securityEvents.push(securityEvent);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
    
    // Log based on severity
    switch (details.severity) {
      case 'critical':
        logger.error(`CRITICAL SECURITY EVENT: ${eventType}`, securityEvent);
        break;
      case 'high':
        logger.warn(`HIGH SEVERITY SECURITY EVENT: ${eventType}`, securityEvent);
        break;
      default:
        logger.info(`Security event: ${eventType}`, securityEvent);
    }
  }

  getSecurityEvents(filters = {}) {
    let events = [...this.securityEvents];
    
    if (filters.eventType) {
      events = events.filter(e => e.eventType === filters.eventType);
    }
    
    if (filters.severity) {
      events = events.filter(e => e.severity === filters.severity);
    }
    
    if (filters.startDate) {
      events = events.filter(e => new Date(e.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      events = events.filter(e => new Date(e.timestamp) <= new Date(filters.endDate));
    }
    
    return events;
  }

  // Advanced Threat Detection
  detectAdvancedThreats(requestData) {
    const threats = [];
    
    // Check for known malicious patterns
    const vulnerabilityCheck = this.checkForVulnerabilities(
      JSON.stringify(requestData.body || '') + 
      JSON.stringify(requestData.query || '') + 
      JSON.stringify(requestData.headers || '')
    );
    
    if (vulnerabilityCheck.found) {
      threats.push({
        type: 'vulnerability_exploit',
        severity: vulnerabilityCheck.severity,
        details: vulnerabilityCheck.types
      });
    }
    
    // Check for suspicious timing patterns
    if (this.isSuspiciousTiming(requestData)) {
      threats.push({
        type: 'timing_attack',
        severity: 'medium',
        details: 'Unusual request timing patterns detected'
      });
    }
    
    // Check for session anomalies
    if (this.isSessionAnomalous(requestData)) {
      threats.push({
        type: 'session_anomaly',
        severity: 'high',
        details: 'Session behavior appears anomalous'
      });
    }
    
    return threats;
  }

  isSuspiciousTiming(requestData) {
    // Implement timing attack detection
    // This is a simplified implementation
    const currentTime = Date.now();
    const sessionKey = `timing_${requestData.sessionId || requestData.ip}`;
    
    if (!this.threatIntelligence.has(sessionKey)) {
      this.threatIntelligence.set(sessionKey, {
        requests: [],
        lastRequest: currentTime
      });
    }
    
    const timingData = this.threatIntelligence.get(sessionKey);
    const timeSinceLastRequest = currentTime - timingData.lastRequest;
    
    timingData.requests.push({
      timestamp: currentTime,
      interval: timeSinceLastRequest
    });
    
    timingData.lastRequest = currentTime;
    
    // Keep only last 20 requests
    if (timingData.requests.length > 20) {
      timingData.requests = timingData.requests.slice(-20);
    }
    
    // Check for suspicious patterns
    const intervals = timingData.requests.map(r => r.interval).filter(i => i > 0);
    if (intervals.length < 5) return false;
    
    // Check for too regular intervals (potential automation)
    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    return variance < 100; // Very low variance suggests automation
  }

  isSessionAnomalous(requestData) {
    // Implement session anomaly detection
    // This is a simplified implementation
    const sessionKey = `session_${requestData.sessionId}`;
    
    if (!this.threatIntelligence.has(sessionKey)) {
      this.threatIntelligence.set(sessionKey, {
        userAgents: new Set(),
        ips: new Set(),
        requestPatterns: new Map(),
        created: Date.now()
      });
    }
    
    const sessionData = this.threatIntelligence.get(sessionKey);
    
    // Track user agents
    if (requestData.userAgent) {
      sessionData.userAgents.add(requestData.userAgent);
    }
    
    // Track IPs
    if (requestData.ip) {
      sessionData.ips.add(requestData.ip);
    }
    
    // Check for anomalies
    if (sessionData.userAgents.size > 3 || sessionData.ips.size > 3) {
      return true;
    }
    
    return false;
  }

  // Utility method to mask sensitive data
  maskSensitiveData(data) {
    if (typeof data !== 'string') return data;
    
    // Mask credit card numbers
    data = data.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
    
    // Mask email addresses
    data = data.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) => {
      const [username, domain] = match.split('@');
      return `${username.charAt(0)}***@${domain}`;
    });
    
    // Mask API keys
    data = data.replace(/\b(sk|pk)_[a-zA-Z0-9]{20,}\b/g, '$1_***');
    
    return data;
  }

  // Cleanup expired data
  cleanup() {
    const now = Date.now();
    
    // Clean up expired encryption keys
    for (const [keyId, keyData] of this.encryptionKeys.entries()) {
      if (now > keyData.expires) {
        this.encryptionKeys.delete(keyId);
      }
    }
    
    // Clean up old threat intelligence data
    for (const [key, data] of this.threatIntelligence.entries()) {
      if (data.created && (now - data.created) > (24 * 60 * 60 * 1000)) {
        this.threatIntelligence.delete(key);
      }
    }
    
    logger.info('Security hardening service cleanup completed');
  }
}

module.exports = SecurityHardeningService;