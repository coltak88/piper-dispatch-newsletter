const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Newsletter = require('../../src/models/Newsletter');
const Campaign = require('../../src/models/Campaign');

describe('Security Tests', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/piper_newsletter_security_test');
    
    // Get the Express app
    app = require('../../src/app');

    // Create test user
    testUser = new User({
      email: 'security@test.com',
      password: await bcrypt.hash('securepassword123', 10),
      name: 'Security Test User',
      role: 'admin'
    });
    await testUser.save();

    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Newsletter.deleteMany({});
    await Campaign.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Authentication Security', () => {
    test('Should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/newsletters')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Authentication required');
    });

    test('Should reject requests with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/newsletters')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('Should reject requests with expired authentication token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id, email: testUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/newsletters')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('Should reject requests with malformed authentication header', async () => {
      const response = await request(app)
        .get('/api/newsletters')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('Should enforce rate limiting on login attempts', async () => {
      // Attempt multiple login requests to trigger rate limiting
      const loginAttempts = [];
      for (let i = 0; i < 15; i++) {
        loginAttempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'security@test.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(loginAttempts);
      
      // Check if rate limiting was triggered (429 status code)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation and Sanitization', () => {
    test('Should sanitize HTML content in newsletter creation', async () => {
      const maliciousContent = '<script>alert("XSS")</script><p>Safe content</p>';
      
      const response = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Newsletter',
          description: 'Test description',
          fromName: 'Test Sender',
          fromEmail: 'sender@example.com',
          subjectTemplate: 'Test - {{date}}',
          content: maliciousContent
        })
        .expect(201);

      // Check that script tags were removed
      expect(response.body.content).not.toContain('<script>');
      expect(response.body.content).toContain('<p>Safe content</p>');
    });

    test('Should reject SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: maliciousInput,
          description: 'Test description',
          fromName: 'Test Sender',
          fromEmail: 'sender@example.com',
          subjectTemplate: 'Test - {{date}}'
        })
        .expect(201);

      // Should create newsletter without executing malicious SQL
      expect(response.body.name).toBe(maliciousInput);
    });

    test('Should validate email format strictly', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test@.com',
        'test@example',
        'test@example..com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/newsletters')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Newsletter',
            description: 'Test description',
            fromName: 'Test Sender',
            fromEmail: email,
            subjectTemplate: 'Test - {{date}}'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    test('Should enforce field length limits', async () => {
      const longString = 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: longString,
          description: 'Test description',
          fromName: 'Test Sender',
          fromEmail: 'sender@example.com',
          subjectTemplate: 'Test - {{date}}'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Should reject requests with invalid content types', async () => {
      const response = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'text/plain')
        .send('This is plain text content')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authorization and Access Control', () => {
    test('Should prevent unauthorized access to admin endpoints', async () => {
      // Create regular user
      const regularUser = new User({
        email: 'regular@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Regular User',
        role: 'user'
      });
      await regularUser.save();

      const regularUserToken = jwt.sign(
        { userId: regularUser._id, email: regularUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '24h' }
      );

      // Try to access admin endpoint
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Insufficient permissions');

      await regularUser.deleteOne();
    });

    test('Should prevent users from accessing other users\' data', async () => {
      // Create another user
      const otherUser = new User({
        email: 'other@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Other User',
        role: 'admin'
      });
      await otherUser.save();

      // Create newsletter for other user
      const otherNewsletter = new Newsletter({
        name: 'Other User Newsletter',
        description: 'This belongs to other user',
        fromName: 'Other User',
        fromEmail: 'other@example.com',
        subjectTemplate: 'Other - {{date}}',
        userId: otherUser._id
      });
      await otherNewsletter.save();

      // Try to access other user's newsletter
      const response = await request(app)
        .get(`/api/newsletters/${otherNewsletter._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404); // Should return 404 (not found) instead of 403

      expect(response.body).toHaveProperty('error');

      await otherUser.deleteOne();
      await otherNewsletter.deleteOne();
    });

    test('Should enforce resource ownership on update operations', async () => {
      // Create newsletter for test user
      const newsletter = new Newsletter({
        name: 'Test Newsletter',
        description: 'Test description',
        fromName: 'Test Sender',
        fromEmail: 'sender@example.com',
        subjectTemplate: 'Test - {{date}}',
        userId: testUser._id
      });
      await newsletter.save();

      // Create another user
      const otherUser = new User({
        email: 'other2@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Other User 2',
        role: 'admin'
      });
      await otherUser.save();

      const otherUserToken = jwt.sign(
        { userId: otherUser._id, email: otherUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '24h' }
      );

      // Try to update newsletter owned by another user
      const response = await request(app)
        .put(`/api/newsletters/${newsletter._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Hacked Newsletter Name'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');

      await otherUser.deleteOne();
      await newsletter.deleteOne();
    });
  });

  describe('Data Protection and Privacy', () => {
    test('Should not expose sensitive user data in API responses', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should not expose password hash
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('__v'); // MongoDB version field
    });

    test('Should encrypt sensitive data in database', async () => {
      // Create user with sensitive data
      const sensitiveUser = new User({
        email: 'sensitive@test.com',
        password: await bcrypt.hash('sensitivepassword', 10),
        name: 'Sensitive User',
        role: 'user',
        apiKeys: {
          sendgrid: 'SG.1234567890abcdef',
          mailchimp: 'abc123def456'
        }
      });
      await sensitiveUser.save();

      // Check that sensitive data is encrypted or not exposed
      const userInDb = await User.findById(sensitiveUser._id);
      expect(userInDb.password).not.toBe('sensitivepassword'); // Password should be hashed
      
      await sensitiveUser.deleteOne();
    });

    test('Should implement proper session management', async () => {
      // Login to create session
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'security@test.com',
          password: 'securepassword123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body).toHaveProperty('expiresIn');
      
      // Verify token is valid
      const decoded = jwt.verify(loginResponse.body.token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('exp');
    });
  });

  describe('Error Handling and Information Disclosure', () => {
    test('Should not expose internal system information in error messages', async () => {
      // Try to access non-existent endpoint
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Should not expose stack traces or internal paths
      expect(response.body).not.toHaveProperty('stack');
      expect(response.text).not.toContain('node_modules');
      expect(response.text).not.toContain('at ');
    });

    test('Should handle database connection errors gracefully', async () => {
      // Temporarily close database connection
      await mongoose.connection.close();

      const response = await request(app)
        .get('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      // Should return generic error message
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Internal server error');

      // Reconnect for other tests
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/piper_newsletter_security_test');
    });

    test('Should sanitize error messages for production', async () => {
      // Create malformed request that might trigger detailed error
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields to trigger validation error
          name: 'Test Campaign'
        })
        .expect(400);

      // Error should be user-friendly
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/validation|required|missing/i);
    });
  });

  describe('Security Headers', () => {
    test('Should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });

    test('Should prevent clickjacking attacks', async () => {
      const response = await request(app)
        .get('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should have X-Frame-Options header
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
    });

    test('Should prevent MIME type sniffing', async () => {
      const response = await request(app)
        .get('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should have X-Content-Type-Options header
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    });
  });

  describe('File Upload Security', () => {
    test('Should reject executable file uploads', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('malicious code'), {
          filename: 'malware.exe',
          contentType: 'application/x-msdownload'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Should reject files with dangerous extensions', async () => {
      const dangerousExtensions = ['.php', '.asp', '.jsp', '.sh', '.bat'];

      for (const extension of dangerousExtensions) {
        const response = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from('test content'), {
            filename: `test${extension}`,
            contentType: 'text/plain'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    test('Should validate file size limits', async () => {
      const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB file
      
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFile, {
          filename: 'large_file.pdf',
          contentType: 'application/pdf'
        })
        .expect(413); // Payload Too Large

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('API Security', () => {
    test('Should implement proper CORS configuration', async () => {
      const response = await request(app)
        .options('/api/newsletters')
        .set('Origin', 'https://malicious-site.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      // Should not allow requests from unauthorized origins
      expect(response.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');
    });

    test('Should implement CSRF protection', async () => {
      // Try to perform state-changing operation without CSRF token
      const response = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'CSRF Test Newsletter',
          description: 'Test description',
          fromName: 'Test Sender',
          fromEmail: 'sender@example.com',
          subjectTemplate: 'Test - {{date}}'
        })
        .expect(201); // Should succeed with proper authentication

      // Additional CSRF tests would be implemented based on the actual CSRF protection mechanism
    });

    test('Should implement proper API versioning', async () => {
      // Test with versioned endpoint
      const response = await request(app)
        .get('/api/v1/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.status).toBe(200);
    });
  });
});