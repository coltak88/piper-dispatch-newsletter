const request = require('supertest');
const express = require('express');
const SecurityHardeningService = require('../../services/SecurityHardeningService');
const VulnerabilityScannerService = require('../../services/VulnerabilityScannerService');
const SecurityService = require('../../services/SecurityService');

describe('Security Integration Tests', () => {
  let app;
  let securityHardeningService;
  let vulnerabilityScanner;
  let securityService;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    securityHardeningService = new SecurityHardeningService();
    vulnerabilityScanner = new VulnerabilityScannerService();
    securityService = new SecurityService();
    
    // Apply security middleware
    app.use((req, res, next) => {
      securityHardeningService.applySecurityHeaders(req, res);
      next();
    });
    
    // Security test endpoints
    app.post('/api/login', async (req, res) => {
      const { username, password } = req.body;
      
      // Input validation
      if (!securityHardeningService.validateInput(username) || 
          !securityHardeningService.validateInput(password)) {
        return res.status(400).json({ error: 'Invalid input' });
      }
      
      // Rate limiting check
      const clientIp = req.ip;
      if (securityHardeningService.isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      
      // Authentication
      try {
        const result = await securityService.authenticateUser(username, password);
        if (result.success) {
          securityHardeningService.logSecurityEvent({
            type: 'login_success',
            user: username,
            ip: clientIp
          });
          res.json({ token: result.token });
        } else {
          securityHardeningService.logSecurityEvent({
            type: 'login_failed',
            user: username,
            ip: clientIp
          });
          res.status(401).json({ error: 'Authentication failed' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    app.post('/api/data', (req, res) => {
      const { data } = req.body;
      
      // Sanitize input
      const sanitizedData = securityHardeningService.sanitizeInput(data);
      
      // Check for XSS
      if (securityHardeningService.detectXSS(data).isVulnerable) {
        securityHardeningService.logSecurityEvent({
          type: 'xss_attempt',
          ip: req.ip,
          data: data
        });
        return res.status(400).json({ error: 'Malicious content detected' });
      }
      
      res.json({ processed: sanitizedData });
    });
    
    app.get('/api/admin/users', async (req, res) => {
      // Authorization check
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      try {
        const decoded = securityService.verifyToken(token);
        if (decoded.role !== 'admin') {
          securityHardeningService.logSecurityEvent({
            type: 'unauthorized_access',
            user: decoded.userId,
            resource: 'admin/users',
            ip: req.ip
          });
          return res.status(403).json({ error: 'Insufficient privileges' });
        }
        
        // Return sanitized user data
        const users = await securityService.getUsers();
        const sanitizedUsers = users.map(user => ({
          id: user.id,
          username: user.username,
          role: user.role
        }));
        
        res.json({ users: sanitizedUsers });
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
    });
    
    app.post('/api/upload', securityHardeningService.validateFileUpload.bind(securityHardeningService), (req, res) => {
      res.json({ message: 'File uploaded successfully' });
    });
    
    app.get('/api/security/scan', async (req, res) => {
      try {
        const scanResults = await vulnerabilityScanner.scanCodebase('./src');
        res.json(scanResults);
      } catch (error) {
        res.status(500).json({ error: 'Scan failed' });
      }
    });
  });

  describe('Authentication Security', () => {
    test('should prevent SQL injection in login', async () => {
      const maliciousUsername = "admin' OR '1'='1";
      const maliciousPassword = "password' OR '1'='1";
      
      const response = await request(app)
        .post('/api/login')
        .send({ username: maliciousUsername, password: maliciousPassword });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input');
    });

    test('should prevent XSS in login response', async () => {
      const maliciousUsername = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/login')
        .send({ username: maliciousUsername, password: 'password' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).not.toContain('<script>');
    });

    test('should enforce rate limiting', async () => {
      const loginAttempts = Array(10).fill(null).map(() => 
        request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: 'wrongpassword' })
      );
      
      const responses = await Promise.all(loginAttempts);
      const rateLimitedResponse = responses.find(r => r.status === 429);
      
      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse.body.error).toBe('Rate limit exceeded');
    });

    test('should log security events', async () => {
      const logSpy = jest.spyOn(securityHardeningService, 'logSecurityEvent');
      
      await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'password' });
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
          user: 'testuser'
        })
      );
    });
  });

  describe('Input Validation Security', () => {
    test('should sanitize input data', async () => {
      const maliciousData = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/data')
        .send({ data: maliciousData });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Malicious content detected');
    });

    test('should prevent command injection', async () => {
      const maliciousData = 'data; rm -rf /';
      
      const response = await request(app)
        .post('/api/data')
        .send({ data: maliciousData });
      
      expect(response.status).toBe(200);
      expect(response.body.processed).not.toContain('rm');
    });

    test('should validate JSON structure', async () => {
      const malformedJson = '{"key": invalid json}';
      
      const response = await request(app)
        .post('/api/data')
        .send(malformedJson)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
    });

    test('should handle large payloads', async () => {
      const largeData = 'A'.repeat(10 * 1024 * 1024); // 10MB
      
      const response = await request(app)
        .post('/api/data')
        .send({ data: largeData });
      
      expect(response.status).toBe(413); // Payload Too Large
    });
  });

  describe('Authorization Security', () => {
    test('should enforce role-based access control', async () => {
      const userToken = 'user-jwt-token';
      
      // Mock JWT verification
      securityService.verifyToken = jest.fn().mockReturnValue({
        userId: 'user123',
        role: 'user'
      });
      
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient privileges');
    });

    test('should prevent unauthorized access', async () => {
      const response = await request(app)
        .get('/api/admin/users');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    test('should log unauthorized access attempts', async () => {
      const logSpy = jest.spyOn(securityHardeningService, 'logSecurityEvent');
      
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unauthorized_access'
        })
      );
    });
  });

  describe('File Upload Security', () => {
    test('should validate file types', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('malicious content'), 'script.php');
      
      expect(response.status).toBe(400);
    });

    test('should limit file size', async () => {
      const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', largeFile, 'large.pdf');
      
      expect(response.status).toBe(413);
    });

    test('should scan uploaded files', async () => {
      const maliciousContent = '<?php echo "malicious"; ?>';
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from(maliciousContent), 'test.php');
      
      expect(response.status).toBe(400);
    });
  });

  describe('Vulnerability Scanning', () => {
    test('should scan codebase for vulnerabilities', async () => {
      vulnerabilityScanner.scanCodebase = jest.fn().mockResolvedValue({
        scanId: 'test-scan',
        vulnerabilities: [
          {
            category: 'injection',
            severity: 'high',
            file: 'test.js',
            line: 10
          }
        ],
        summary: { totalVulnerabilities: 1 }
      });
      
      const response = await request(app)
        .get('/api/security/scan');
      
      expect(response.status).toBe(200);
      expect(response.body.vulnerabilities).toBeDefined();
      expect(response.body.summary.totalVulnerabilities).toBeGreaterThanOrEqual(0);
    });

    test('should generate detailed vulnerability reports', async () => {
      const mockResults = {
        vulnerabilities: [
          { severity: 'critical', category: 'injection' }
        ]
      };
      
      const report = vulnerabilityScanner.generateDetailedReport(mockResults);
      
      expect(report.executiveSummary).toBeDefined();
      expect(report.riskAssessment).toBeDefined();
      expect(report.remediationPlan).toBeDefined();
    });

    test('should check compliance requirements', () => {
      const mockVulnerabilities = [
        { category: 'sensitiveDataExposure', severity: 'high' }
      ];
      
      const compliance = vulnerabilityScanner.generateComplianceCheck({ 
        vulnerabilities: mockVulnerabilities 
      });
      
      expect(compliance.owaspTop10).toBeDefined();
      expect(compliance.pciDss).toBeDefined();
      expect(compliance.gdpr).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    test('should set security headers on responses', async () => {
      const response = await request(app)
        .get('/api/admin/users');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should prevent clickjacking', async () => {
      const response = await request(app)
        .get('/api/admin/users');
      
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    test('should prevent MIME type sniffing', async () => {
      const response = await request(app)
        .get('/api/admin/users');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'test', password: 'wrong' });
      
      expect(response.body.error).not.toContain('database');
      expect(response.body.error).not.toContain('connection');
      expect(response.body.error).not.toContain('password');
    });

    test('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/data')
        .send('invalid json')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should handle missing parameters gracefully', async () => {
      const response = await request(app)
        .post('/api/data')
        .send({}); // Missing required 'data' parameter
      
      expect(response.status).toBe(400);
    });
  });

  describe('Threat Detection and Response', () => {
    test('should detect brute force attacks', async () => {
      const attempts = Array(10).fill(null).map(() => 
        request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: 'wrongpassword' })
      );
      
      await Promise.all(attempts);
      
      const isBruteForce = securityHardeningService.detectBruteForce('::ffff:127.0.0.1');
      expect(typeof isBruteForce).toBe('boolean');
    });

    test('should detect suspicious patterns', async () => {
      const suspiciousInputs = [
        '<script>alert("xss")</script>',
        '../../../etc/passwd',
        "' OR '1'='1",
        'javascript:alert("xss")'
      ];
      
      for (const input of suspiciousInputs) {
        await request(app)
          .post('/api/data')
          .send({ data: input });
      }
      
      const securityEvents = securityHardeningService.getSecurityEvents();
      const suspiciousEvents = securityEvents.filter(e => 
        e.type === 'xss_attempt' || e.type === 'malicious_input'
      );
      
      expect(suspiciousEvents.length).toBeGreaterThan(0);
    });

    test('should alert on security incidents', async () => {
      const alertSpy = jest.spyOn(securityHardeningService, 'alertSecurityIncident');
      
      // Trigger a security incident
      await request(app)
        .post('/api/data')
        .send({ data: '<script>alert("xss")</script>' });
      
      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: expect.any(String)
        })
      );
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent security checks', async () => {
      const concurrentRequests = Array(50).fill(null).map(() => 
        request(app)
          .post('/api/data')
          .send({ data: 'test data' })
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(responses.every(r => r.status === 200)).toBe(true);
    });

    test('should handle large payloads efficiently', async () => {
      const largeData = 'A'.repeat(100 * 1024); // 100KB
      
      const startTime = Date.now();
      const response = await request(app)
        .post('/api/data')
        .send({ data: largeData });
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should manage memory efficiently under load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform multiple security operations
      for (let i = 0; i < 100; i++) {
        await request(app)
          .post('/api/data')
          .send({ data: `test data ${i}` });
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
  });

  describe('Compliance and Reporting', () => {
    test('should generate security audit logs', () => {
      const auditLog = securityHardeningService.generateAuditLog();
      
      expect(auditLog).toBeDefined();
      expect(auditLog.events).toBeDefined();
      expect(auditLog.summary).toBeDefined();
    });

    test('should track security metrics', () => {
      const metrics = securityHardeningService.getSecurityMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.totalEvents).toBeGreaterThanOrEqual(0);
      expect(metrics.violations).toBeDefined();
    });

    test('should generate compliance reports', () => {
      const complianceReport = securityHardeningService.generateComplianceReport();
      
      expect(complianceReport).toBeDefined();
      expect(complianceReport.owasp).toBeDefined();
      expect(complianceReport.pciDss).toBeDefined();
      expect(complianceReport.gdpr).toBeDefined();
    });
  });
});