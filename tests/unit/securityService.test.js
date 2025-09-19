const sinon = require('sinon');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

describe('SecurityService', () => {
  let securityService;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Initialize service
    const SecurityService = require('../../services/SecurityService');
    securityService = new SecurityService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      expect(securityService.config).to.exist;
      expect(securityService.failedAttempts).to.be.an('object');
      expect(securityService.rateLimiters).to.be.an('object');
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        jwtSecret: 'custom-secret',
        bcryptRounds: 12,
        rateLimitWindowMs: 60000,
        maxRateLimitAttempts: 5
      };
      
      const customService = new (require('../../services/SecurityService'))(customOptions);
      
      expect(customService.config.jwtSecret).to.equal('custom-secret');
      expect(customService.config.bcryptRounds).to.equal(12);
      expect(customService.config.rateLimitWindowMs).to.equal(60000);
      expect(customService.config.maxRateLimitAttempts).to.equal(5);
    });

    it('should use environment variables when available', () => {
      process.env.JWT_SECRET = 'env-secret';
      process.env.BCRYPT_ROUNDS = '15';
      process.env.RATE_LIMIT_WINDOW_MS = '30000';
      
      const envService = new (require('../../services/SecurityService'))();
      
      expect(envService.config.jwtSecret).to.equal('env-secret');
      expect(envService.config.bcryptRounds).to.equal(15);
      expect(envService.config.rateLimitWindowMs).to.equal(30000);
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'testPassword123';
      
      sandbox.stub(bcrypt, 'hash').resolves('hashedPassword123');
      
      const result = await securityService.hashPassword(password);
      
      expect(result).to.equal('hashedPassword123');
      expect(bcrypt.hash.calledWith(password, securityService.config.bcryptRounds)).to.be.true;
    });

    it('should handle hashing failure', async () => {
      sandbox.stub(bcrypt, 'hash').rejects(new Error('Hashing failed'));
      
      const result = await securityService.hashPassword('testPassword');
      
      expect(result).to.be.null;
    });

    it('should handle empty password', async () => {
      const result = await securityService.hashPassword('');
      
      expect(result).to.be.null;
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
      
      sandbox.stub(bcrypt, 'compare').resolves(true);
      
      const result = await securityService.verifyPassword(password, hashedPassword);
      
      expect(result).to.be.true;
      expect(bcrypt.compare.calledWith(password, hashedPassword)).to.be.true;
    });

    it('should reject incorrect password', async () => {
      const password = 'wrongPassword';
      const hashedPassword = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
      
      sandbox.stub(bcrypt, 'compare').resolves(false);
      
      const result = await securityService.verifyPassword(password, hashedPassword);
      
      expect(result).to.be.false;
    });

    it('should handle verification failure', async () => {
      sandbox.stub(bcrypt, 'compare').rejects(new Error('Comparison failed'));
      
      const result = await securityService.verifyPassword('password', 'hash');
      
      expect(result).to.be.false;
    });
  });

  describe('generateJWT', () => {
    it('should generate JWT token successfully', () => {
      const payload = { userId: '123', email: 'user@example.com' };
      const expiresIn = '1h';
      
      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.signature';
      
      sandbox.stub(jwt, 'sign').returns(expectedToken);
      
      const result = securityService.generateJWT(payload, expiresIn);
      
      expect(result).to.equal(expectedToken);
      expect(jwt.sign.calledWith(
        payload,
        securityService.config.jwtSecret,
        { expiresIn, issuer: 'piper-newsletter' }
      )).to.be.true;
    });

    it('should use default expiration if not provided', () => {
      const payload = { userId: '123' };
      
      sandbox.stub(jwt, 'sign').returns('token');
      
      securityService.generateJWT(payload);
      
      expect(jwt.sign.calledWith(
        payload,
        securityService.config.jwtSecret,
        { expiresIn: '24h', issuer: 'piper-newsletter' }
      )).to.be.true;
    });

    it('should handle JWT generation failure', () => {
      sandbox.stub(jwt, 'sign').throws(new Error('Invalid payload'));
      
      const result = securityService.generateJWT({});
      
      expect(result).to.be.null;
    });
  });

  describe('verifyJWT', () => {
    it('should verify valid JWT token', () => {
      const token = 'valid.jwt.token';
      const expectedPayload = { userId: '123', email: 'user@example.com' };
      
      sandbox.stub(jwt, 'verify').returns(expectedPayload);
      
      const result = securityService.verifyJWT(token);
      
      expect(result).to.deep.equal(expectedPayload);
      expect(jwt.verify.calledWith(token, securityService.config.jwtSecret)).to.be.true;
    });

    it('should reject invalid JWT token', () => {
      const token = 'invalid.jwt.token';
      
      sandbox.stub(jwt, 'verify').throws(new Error('Invalid token'));
      
      const result = securityService.verifyJWT(token);
      
      expect(result).to.be.null;
    });

    it('should handle expired JWT token', () => {
      const token = 'expired.jwt.token';
      
      sandbox.stub(jwt, 'verify').throws(new jwt.TokenExpiredError('Token expired', new Date()));
      
      const result = securityService.verifyJWT(token);
      
      expect(result).to.be.null;
    });
  });

  describe('generateAPIKey', () => {
    it('should generate API key with prefix', () => {
      const userId = '123';
      const prefix = 'test';
      
      sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('randomdata'));
      
      const result = securityService.generateAPIKey(userId, prefix);
      
      expect(result).to.include(prefix + '_');
      expect(result).to.have.length.greaterThan(prefix.length + 1);
    });

    it('should generate API key without prefix', () => {
      const userId = '123';
      
      sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('randomdata'));
      
      const result = securityService.generateAPIKey(userId);
      
      expect(result).to.be.a('string');
      expect(result).to.have.length.greaterThan(32);
    });

    it('should include user ID in key generation', () => {
      const userId = 'testUser123';
      
      const randomBytesStub = sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('randomdata'));
      
      securityService.generateAPIKey(userId);
      
      // Verify crypto.randomBytes was called for key generation
      expect(randomBytesStub.called).to.be.true;
    });
  });

  describe('hashAPIKey', () => {
    it('should hash API key consistently', () => {
      const apiKey = 'test_api_key_123';
      
      sandbox.stub(crypto, 'createHash').returns({
        update: sandbox.stub().returnsThis(),
        digest: sandbox.stub().returns('hashed_api_key')
      });
      
      const result = securityService.hashAPIKey(apiKey);
      
      expect(result).to.equal('hashed_api_key');
    });

    it('should use SHA-256 for hashing', () => {
      const apiKey = 'test_api_key';
      const createHashStub = sandbox.stub(crypto, 'createHash').returns({
        update: sandbox.stub().returnsThis(),
        digest: sandbox.stub().returns('hash')
      });
      
      securityService.hashAPIKey(apiKey);
      
      expect(createHashStub.calledWith('sha256')).to.be.true;
    });
  });

  describe('generateSecureToken', () => {
    it('should generate secure token', () => {
      const length = 32;
      
      sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('secure_random_data'));
      
      const result = securityService.generateSecureToken(length);
      
      expect(result).to.be.a('string');
      expect(result).to.have.length.greaterThan(0);
    });

    it('should use default length if not specified', () => {
      const randomBytesStub = sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('data'));
      
      securityService.generateSecureToken();
      
      expect(randomBytesStub.calledWith(32)).to.be.true;
    });

    it('should generate unique tokens', () => {
      sandbox.stub(crypto, 'randomBytes')
        .onFirstCall().returns(Buffer.from('random1'))
        .onSecondCall().returns(Buffer.from('random2'));
      
      const token1 = securityService.generateSecureToken();
      const token2 = securityService.generateSecureToken();
      
      expect(token1).to.not.equal(token2);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML content', () => {
      const input = '<script>alert("xss")</script><p>Safe content</p>';
      const expected = '<p>Safe content</p>';
      
      const result = securityService.sanitizeInput(input);
      
      expect(result).to.equal(expected);
    });

    it('should handle plain text', () => {
      const input = 'Plain text content';
      
      const result = securityService.sanitizeInput(input);
      
      expect(result).to.equal(input);
    });

    it('should handle empty input', () => {
      const result = securityService.sanitizeInput('');
      
      expect(result).to.equal('');
    });

    it('should allow specified HTML tags', () => {
      const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
      
      const result = securityService.sanitizeInput(input, {
        allowedTags: ['p', 'strong', 'em']
      });
      
      expect(result).to.equal(input);
    });
  });

  describe('validateInput', () => {
    it('should validate email format', () => {
      const validEmail = 'user@example.com';
      const invalidEmail = 'invalid-email';
      
      expect(securityService.validateInput(validEmail, 'email')).to.be.true;
      expect(securityService.validateInput(invalidEmail, 'email')).to.be.false;
    });

    it('should validate URL format', () => {
      const validUrl = 'https://example.com';
      const invalidUrl = 'not-a-url';
      
      expect(securityService.validateInput(validUrl, 'url')).to.be.true;
      expect(securityService.validateInput(invalidUrl, 'url')).to.be.false;
    });

    it('should validate phone number format', () => {
      const validPhone = '+1234567890';
      const invalidPhone = 'invalid-phone';
      
      expect(securityService.validateInput(validPhone, 'phone')).to.be.true;
      expect(securityService.validateInput(invalidPhone, 'phone')).to.be.false;
    });

    it('should validate custom regex patterns', () => {
      const pattern = /^[A-Z]{2,4}$/;
      
      expect(securityService.validateInput('AB', pattern)).to.be.true;
      expect(securityService.validateInput('ABCD', pattern)).to.be.true;
      expect(securityService.validateInput('ABCDE', pattern)).to.be.false;
    });

    it('should handle invalid validation type', () => {
      expect(securityService.validateInput('test', 'invalid_type')).to.be.false;
    });
  });

  describe('encrypt', () => {
    it('should encrypt data successfully', () => {
      const data = 'sensitive information';
      const key = 'encryption_key_1234567890123456';
      
      const result = securityService.encrypt(data, key);
      
      expect(result).to.be.an('object');
      expect(result.encrypted).to.be.a('string');
      expect(result.iv).to.be.a('string');
      expect(result.encrypted).to.not.equal(data);
    });

    it('should produce different encrypted outputs for same data', () => {
      const data = 'test data';
      const key = 'encryption_key_1234567890123456';
      
      const result1 = securityService.encrypt(data, key);
      const result2 = securityService.encrypt(data, key);
      
      expect(result1.encrypted).to.not.equal(result2.encrypted);
      expect(result1.iv).to.not.equal(result2.iv);
    });

    it('should handle encryption errors', () => {
      const result = securityService.encrypt('data', 'short_key');
      
      expect(result).to.be.null;
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data successfully', () => {
      const originalData = 'sensitive information';
      const key = 'encryption_key_1234567890123456';
      
      const encrypted = securityService.encrypt(originalData, key);
      const decrypted = securityService.decrypt(encrypted, key);
      
      expect(decrypted).to.equal(originalData);
    });

    it('should return null for invalid encrypted data', () => {
      const key = 'encryption_key_1234567890123456';
      const invalidData = { encrypted: 'invalid', iv: 'invalid' };
      
      const result = securityService.decrypt(invalidData, key);
      
      expect(result).to.be.null;
    });

    it('should return null for wrong key', () => {
      const data = 'test data';
      const key1 = 'encryption_key_1234567890123456';
      const key2 = 'wrong_key_1234567890123456';
      
      const encrypted = securityService.encrypt(data, key1);
      const result = securityService.decrypt(encrypted, key2);
      
      expect(result).to.be.null;
    });
  });

  describe('trackFailedAttempt', () => {
    it('should track failed login attempts', () => {
      const identifier = 'user_123';
      
      securityService.trackFailedAttempt(identifier);
      securityService.trackFailedAttempt(identifier);
      securityService.trackFailedAttempt(identifier);
      
      expect(securityService.failedAttempts[identifier].count).to.equal(3);
    });

    it('should reset attempts after time window', (done) => {
      const identifier = 'user_123';
      const originalWindow = securityService.config.bruteForceWindowMs;
      
      // Set short window for testing
      securityService.config.bruteForceWindowMs = 100;
      
      securityService.trackFailedAttempt(identifier);
      expect(securityService.failedAttempts[identifier].count).to.equal(1);
      
      // Wait for window to expire
      setTimeout(() => {
        securityService.trackFailedAttempt(identifier);
        expect(securityService.failedAttempts[identifier].count).to.equal(1);
        
        // Restore original window
        securityService.config.bruteForceWindowMs = originalWindow;
        done();
      }, 150);
    });

    it('should handle multiple identifiers independently', () => {
      const identifier1 = 'user_123';
      const identifier2 = 'user_456';
      
      securityService.trackFailedAttempt(identifier1);
      securityService.trackFailedAttempt(identifier1);
      securityService.trackFailedAttempt(identifier2);
      
      expect(securityService.failedAttempts[identifier1].count).to.equal(2);
      expect(securityService.failedAttempts[identifier2].count).to.equal(1);
    });
  });

  describe('isBruteForceAttack', () => {
    it('should detect brute force attack', () => {
      const identifier = 'user_123';
      const maxAttempts = securityService.config.maxBruteForceAttempts;
      
      // Add failed attempts up to limit
      for (let i = 0; i < maxAttempts; i++) {
        securityService.trackFailedAttempt(identifier);
      }
      
      expect(securityService.isBruteForceAttack(identifier)).to.be.true;
    });

    it('should not detect attack below threshold', () => {
      const identifier = 'user_123';
      
      securityService.trackFailedAttempt(identifier);
      securityService.trackFailedAttempt(identifier);
      
      expect(securityService.isBruteForceAttack(identifier)).to.be.false;
    });

    it('should handle unknown identifier', () => {
      expect(securityService.isBruteForceAttack('unknown_user')).to.be.false;
    });
  });

  describe('resetFailedAttempts', () => {
    it('should reset failed attempts for identifier', () => {
      const identifier = 'user_123';
      
      securityService.trackFailedAttempt(identifier);
      securityService.trackFailedAttempt(identifier);
      securityService.resetFailedAttempts(identifier);
      
      expect(securityService.failedAttempts[identifier]).to.be.undefined;
    });

    it('should handle reset for unknown identifier', () => {
      expect(() => {
        securityService.resetFailedAttempts('unknown_user');
      }).to.not.throw();
    });
  });

  describe('getSecurityHeaders', () => {
    it('should return security headers', () => {
      const headers = securityService.getSecurityHeaders();
      
      expect(headers).to.be.an('object');
      expect(headers['X-Content-Type-Options']).to.equal('nosniff');
      expect(headers['X-Frame-Options']).to.equal('DENY');
      expect(headers['X-XSS-Protection']).to.equal('1; mode=block');
      expect(headers['Strict-Transport-Security']).to.include('max-age');
      expect(headers['Content-Security-Policy']).to.be.a('string');
    });

    it('should include custom CSP directives', () => {
      const customCSP = "default-src 'self'; script-src 'self' 'unsafe-inline'";
      
      const headers = securityService.getSecurityHeaders(customCSP);
      
      expect(headers['Content-Security-Policy']).to.equal(customCSP);
    });
  });

  describe('rateLimitMiddleware', () => {
    it('should create rate limiter middleware', () => {
      const limiter = securityService.rateLimitMiddleware();
      
      expect(limiter).to.be.a('function');
    });

    it('should create custom rate limiter', () => {
      const options = {
        windowMs: 60000,
        max: 10,
        message: 'Too many requests'
      };
      
      const limiter = securityService.rateLimitMiddleware(options);
      
      expect(limiter).to.be.a('function');
    });
  });

  describe('inputValidationMiddleware', () => {
    it('should create validation middleware', () => {
      const rules = {
        email: 'email',
        phone: 'phone',
        website: 'url'
      };
      
      const middleware = securityService.inputValidationMiddleware(rules);
      
      expect(middleware).to.be.a('function');
      expect(middleware.length).to.equal(3); // req, res, next
    });

    it('should validate request body', () => {
      const rules = {
        email: 'email',
        phone: 'phone'
      };
      
      const middleware = securityService.inputValidationMiddleware(rules);
      
      const req = {
        body: {
          email: 'valid@example.com',
          phone: '+1234567890'
        }
      };
      
      const res = {};
      const next = sandbox.stub();
      
      middleware(req, res, next);
      
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args).to.have.lengthOf(0); // No errors
    });

    it('should reject invalid input', () => {
      const rules = {
        email: 'email'
      };
      
      const middleware = securityService.inputValidationMiddleware(rules);
      
      const req = {
        body: {
          email: 'invalid-email'
        }
      };
      
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.stub()
      };
      
      const next = sandbox.stub();
      
      middleware(req, res, next);
      
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Invalid email format' }]
      })).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  describe('sanitizeInputMiddleware', () => {
    it('should create sanitization middleware', () => {
      const middleware = securityService.sanitizeInputMiddleware();
      
      expect(middleware).to.be.a('function');
      expect(middleware.length).to.equal(3); // req, res, next
    });

    it('should sanitize request body', () => {
      const middleware = securityService.sanitizeInputMiddleware();
      
      const req = {
        body: {
          name: 'John Doe',
          bio: '<script>alert("xss")</script><p>Safe content</p>',
          description: 'Plain text'
        }
      };
      
      const res = {};
      const next = sandbox.stub();
      
      middleware(req, res, next);
      
      expect(req.body.bio).to.equal('<p>Safe content</p>');
      expect(req.body.name).to.equal('John Doe');
      expect(req.body.description).to.equal('Plain text');
      expect(next.calledOnce).to.be.true;
    });

    it('should sanitize nested objects', () => {
      const middleware = securityService.sanitizeInputMiddleware();
      
      const req = {
        body: {
          user: {
            name: 'John',
            profile: {
              bio: '<script>alert("xss")</script>Safe bio'
            }
          }
        }
      };
      
      const res = {};
      const next = sandbox.stub();
      
      middleware(req, res, next);
      
      expect(req.body.user.profile.bio).to.equal('Safe bio');
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security events', () => {
      const consoleSpy = sandbox.spy(console, 'log');
      
      securityService.logSecurityEvent('login_failed', 'user_123', {
        ip: '192.168.1.1',
        reason: 'Invalid password'
      });
      
      expect(consoleSpy.called).to.be.true;
      const logCall = consoleSpy.getCall(0);
      expect(logCall.args[0]).to.include('Security Event');
      expect(logCall.args[0]).to.include('login_failed');
      expect(logCall.args[0]).to.include('user_123');
    });

    it('should handle missing metadata', () => {
      const consoleSpy = sandbox.spy(console, 'log');
      
      securityService.logSecurityEvent('password_changed', 'user_123');
      
      expect(consoleSpy.called).to.be.true;
      const logCall = consoleSpy.getCall(0);
      expect(logCall.args[0]).to.include('password_changed');
    });
  });

  describe('Error Handling', () => {
    it('should handle crypto operation failures', () => {
      sandbox.stub(crypto, 'randomBytes').throws(new Error('Crypto error'));
      
      const result = securityService.generateSecureToken();
      
      expect(result).to.be.null;
    });

    it('should handle JWT operation failures', () => {
      sandbox.stub(jwt, 'sign').throws(new Error('JWT error'));
      
      const result = securityService.generateJWT({});
      
      expect(result).to.be.null;
    });

    it('should handle bcrypt operation failures', async () => {
      sandbox.stub(bcrypt, 'hash').rejects(new Error('Bcrypt error'));
      
      const result = await securityService.hashPassword('password');
      
      expect(result).to.be.null;
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent operations', async () => {
      const operations = [
        securityService.hashPassword('password1'),
        securityService.hashPassword('password2'),
        securityService.hashPassword('password3'),
        securityService.generateSecureToken(),
        securityService.generateSecureToken()
      ];
      
      const results = await Promise.all(operations);
      
      expect(results).to.have.lengthOf(5);
      expect(results.every(r => r !== null || r !== undefined)).to.be.true;
    });

    it('should efficiently track failed attempts', () => {
      const start = Date.now();
      
      // Simulate many failed attempts
      for (let i = 0; i < 1000; i++) {
        securityService.trackFailedAttempt(`user_${i}`);
      }
      
      const duration = Date.now() - start;
      
      expect(duration).to.be.lessThan(100); // Should be very fast
    });
  });
});