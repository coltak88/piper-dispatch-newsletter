const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { expect } = require('chai');
const sinon = require('sinon');

describe('Authentication Middleware', () => {
  let authMiddleware;
  let req, res, next;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    authMiddleware = require('../../middleware/auth');
    
    req = {
      headers: {},
      body: {},
      user: null
    };
    
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis()
    };
    
    next = sinon.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('authenticate', () => {
    it('should authenticate valid JWT token', async () => {
      const userId = 'test-user-id';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
      
      req.headers.authorization = `Bearer ${token}`;
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(req.user).to.exist;
      expect(req.user.userId).to.equal(userId);
      expect(next.calledOnce).to.be.true;
    });

    it('should reject missing authorization header', async () => {
      await authMiddleware.authenticate(req, res, next);
      
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Access token required' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should reject invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat token';
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Invalid token format' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should reject expired token', async () => {
      const token = jwt.sign(
        { userId: 'test-user' }, 
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );
      
      req.headers.authorization = `Bearer ${token}`;
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWithMatch({ error: /Token expired/ })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should reject invalid token signature', async () => {
      const token = jwt.sign({ userId: 'test-user' }, 'wrong-secret');
      
      req.headers.authorization = `Bearer ${token}`;
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWithMatch({ error: /Invalid token/ })).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  describe('optionalAuth', () => {
    it('should set user if valid token provided', async () => {
      const userId = 'test-user-id';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
      
      req.headers.authorization = `Bearer ${token}`;
      
      await authMiddleware.optionalAuth(req, res, next);
      
      expect(req.user).to.exist;
      expect(req.user.userId).to.equal(userId);
      expect(next.calledOnce).to.be.true;
    });

    it('should continue without user if no token provided', async () => {
      await authMiddleware.optionalAuth(req, res, next);
      
      expect(req.user).to.be.null;
      expect(next.calledOnce).to.be.true;
    });

    it('should continue without user if invalid token provided', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      await authMiddleware.optionalAuth(req, res, next);
      
      expect(req.user).to.be.null;
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', () => {
      req.user = { role: 'admin' };
      
      const middleware = authMiddleware.requireRole('admin');
      middleware(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });

    it('should deny access for user without required role', () => {
      req.user = { role: 'user' };
      
      const middleware = authMiddleware.requireRole('admin');
      middleware(req, res, next);
      
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'Insufficient permissions' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should deny access for user with insufficient role hierarchy', () => {
      req.user = { role: 'user' };
      
      const middleware = authMiddleware.requireRole(['admin', 'moderator']);
      middleware(req, res, next);
      
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'Insufficient permissions' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should allow access for user with one of multiple required roles', () => {
      req.user = { role: 'moderator' };
      
      const middleware = authMiddleware.requireRole(['admin', 'moderator']);
      middleware(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('requirePermission', () => {
    it('should allow access for user with required permission', () => {
      req.user = { permissions: ['write:content'] };
      
      const middleware = authMiddleware.requirePermission('write:content');
      middleware(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });

    it('should deny access for user without required permission', () => {
      req.user = { permissions: ['read:content'] };
      
      const middleware = authMiddleware.requirePermission('write:content');
      middleware(req, res, next);
      
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'Permission denied' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should allow access for user with one of multiple required permissions', () => {
      req.user = { permissions: ['read:content', 'write:content'] };
      
      const middleware = authMiddleware.requirePermission(['write:content', 'admin:all']);
      middleware(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('rateLimit', () => {
    let cacheStub;

    beforeEach(() => {
      cacheStub = {
        increment: sandbox.stub(),
        expire: sandbox.stub()
      };
    });

    it('should allow request within rate limit', async () => {
      cacheStub.increment.resolves(5);
      cacheStub.expire.resolves(true);
      
      req.ip = '192.168.1.1';
      req.user = { id: 'user123' };
      
      const middleware = authMiddleware.rateLimit({
        windowMs: 60000,
        max: 10,
        keyGenerator: (req) => req.user.id
      });
      
      await middleware(req, res, next, cacheStub);
      
      expect(next.calledOnce).to.be.true;
      expect(cacheStub.increment.calledWith('rate_limit:user123')).to.be.true;
    });

    it('should block request exceeding rate limit', async () => {
      cacheStub.increment.resolves(15);
      cacheStub.expire.resolves(true);
      
      req.ip = '192.168.1.1';
      req.user = { id: 'user123' };
      
      const middleware = authMiddleware.rateLimit({
        windowMs: 60000,
        max: 10,
        keyGenerator: (req) => req.user.id
      });
      
      await middleware(req, res, next, cacheStub);
      
      expect(res.status.calledWith(429)).to.be.true;
      expect(res.json.calledWithMatch({ error: /Too many requests/ })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should use IP address when user not authenticated', async () => {
      cacheStub.increment.resolves(3);
      cacheStub.expire.resolves(true);
      
      req.ip = '192.168.1.1';
      req.user = null;
      
      const middleware = authMiddleware.rateLimit({
        windowMs: 60000,
        max: 10
      });
      
      await middleware(req, res, next, cacheStub);
      
      expect(next.calledOnce).to.be.true;
      expect(cacheStub.increment.calledWith('rate_limit:192.168.1.1')).to.be.true;
    });
  });

  describe('validateInput', () => {
    it('should validate input against schema', () => {
      const schema = {
        body: {
          email: { type: 'string', required: true },
          password: { type: 'string', minLength: 8 }
        }
      };
      
      req.body = {
        email: 'test@example.com',
        password: 'securepassword123'
      };
      
      const middleware = authMiddleware.validateInput(schema);
      middleware(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });

    it('should reject invalid input', () => {
      const schema = {
        body: {
          email: { type: 'string', required: true },
          password: { type: 'string', minLength: 8 }
        }
      };
      
      req.body = {
        email: 'invalid-email',
        password: 'short'
      };
      
      const middleware = authMiddleware.validateInput(schema);
      middleware(req, res, next);
      
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ error: /Validation failed/ })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should reject missing required fields', () => {
      const schema = {
        body: {
          email: { type: 'string', required: true },
          password: { type: 'string', required: true }
        }
      };
      
      req.body = { email: 'test@example.com' }; // Missing password
      
      const middleware = authMiddleware.validateInput(schema);
      middleware(req, res, next);
      
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ error: /Missing required field/ })).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  describe('requireApiKey', () => {
    it('should authenticate valid API key', async () => {
      const validApiKey = 'valid-api-key-123';
      process.env.API_KEYS = validApiKey;
      
      req.headers['x-api-key'] = validApiKey;
      
      await authMiddleware.requireApiKey(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });

    it('should reject missing API key', async () => {
      await authMiddleware.requireApiKey(req, res, next);
      
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'API key required' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should reject invalid API key', async () => {
      process.env.API_KEYS = 'valid-api-key-123';
      
      req.headers['x-api-key'] = 'invalid-api-key';
      
      await authMiddleware.requireApiKey(req, res, next);
      
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Invalid API key' })).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  describe('require2FA', () => {
    it('should allow access for user with 2FA verified', () => {
      req.user = { 
        id: 'user123',
        twoFactorEnabled: true,
        twoFactorVerified: true 
      };
      
      authMiddleware.require2FA(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });

    it('should deny access for user without 2FA verification', () => {
      req.user = { 
        id: 'user123',
        twoFactorEnabled: true,
        twoFactorVerified: false 
      };
      
      authMiddleware.require2FA(req, res, next);
      
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: '2FA verification required' })).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should allow access for user without 2FA enabled', () => {
      req.user = { 
        id: 'user123',
        twoFactorEnabled: false,
        twoFactorVerified: false 
      };
      
      authMiddleware.require2FA(req, res, next);
      
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('errorHandler', () => {
    it('should handle authentication errors', () => {
      const error = new Error('Authentication failed');
      error.status = 401;
      
      authMiddleware.errorHandler(error, req, res, next);
      
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Authentication failed' })).to.be.true;
    });

    it('should handle authorization errors', () => {
      const error = new Error('Authorization failed');
      error.status = 403;
      
      authMiddleware.errorHandler(error, req, res, next);
      
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'Authorization failed' })).to.be.true;
    });

    it('should handle rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      error.status = 429;
      error.retryAfter = 60;
      
      authMiddleware.errorHandler(error, req, res, next);
      
      expect(res.status.calledWith(429)).to.be.true;
      expect(res.set.calledWith('Retry-After', '60')).to.be.true;
      expect(res.json.calledWith({ error: 'Rate limit exceeded' })).to.be.true;
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      
      authMiddleware.errorHandler(error, req, res, next);
      
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Internal server error' })).to.be.true;
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', () => {
      const middleware = authMiddleware.securityHeaders();
      middleware(req, res, next);
      
      expect(res.set.calledWith('X-Content-Type-Options', 'nosniff')).to.be.true;
      expect(res.set.calledWith('X-Frame-Options', 'DENY')).to.be.true;
      expect(res.set.calledWith('X-XSS-Protection', '1; mode=block')).to.be.true;
      expect(res.set.calledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')).to.be.true;
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', () => {
      req.method = 'OPTIONS';
      
      const middleware = authMiddleware.cors();
      middleware(req, res, next);
      
      expect(res.set.calledWith('Access-Control-Allow-Origin', '*')).to.be.true;
      expect(res.set.calledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')).to.be.true;
      expect(res.set.calledWith('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')).to.be.true;
      expect(res.sendStatus.calledWith(200)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should set CORS headers for regular requests', () => {
      req.method = 'GET';
      
      const middleware = authMiddleware.cors();
      middleware(req, res, next);
      
      expect(res.set.calledWith('Access-Control-Allow-Origin', '*')).to.be.true;
      expect(next.calledOnce).to.be.true;
    });
  });
});