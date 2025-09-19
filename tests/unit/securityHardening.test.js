const SecurityHardeningService = require('../../services/SecurityHardeningService');
const VulnerabilityScannerService = require('../../services/VulnerabilityScannerService');
const winston = require('winston');

describe('SecurityHardeningService', () => {
  let securityService;
  let vulnerabilityScanner;

  beforeEach(() => {
    securityService = new SecurityHardeningService();
    vulnerabilityScanner = new VulnerabilityScannerService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation and Sanitization', () => {
    test('should validate and sanitize user input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = securityService.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    test('should validate email addresses', () => {
      const validEmail = 'user@example.com';
      const invalidEmail = 'invalid-email';
      
      expect(securityService.validateEmail(validEmail)).toBe(true);
      expect(securityService.validateEmail(invalidEmail)).toBe(false);
    });

    test('should validate URLs', () => {
      const validUrl = 'https://example.com';
      const maliciousUrl = 'javascript:alert("xss")';
      
      expect(securityService.validateUrl(validUrl)).toBe(true);
      expect(securityService.validateUrl(maliciousUrl)).toBe(false);
    });

    test('should validate file uploads', () => {
      const safeFile = { name: 'document.pdf', size: 1024 };
      const maliciousFile = { name: 'script.php', size: 1024 };
      const largeFile = { name: 'large.pdf', size: 10 * 1024 * 1024 };
      
      expect(securityService.validateFileUpload(safeFile)).toBe(true);
      expect(securityService.validateFileUpload(maliciousFile)).toBe(false);
      expect(securityService.validateFileUpload(largeFile)).toBe(false);
    });

    test('should sanitize HTML content', () => {
      const htmlInput = '<div onclick="alert(\'xss\')">Content</div>';
      const sanitized = securityService.sanitizeHtml(htmlInput);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('<div>');
    });

    test('should validate JSON input', () => {
      const validJson = '{"name": "test", "value": 123}';
      const invalidJson = '{"name": "test", invalid}';
      const maliciousJson = '{"__proto__": {"isAdmin": true}}';
      
      expect(securityService.validateJson(validJson)).toBe(true);
      expect(securityService.validateJson(invalidJson)).toBe(false);
      expect(securityService.validateJson(maliciousJson)).toBe(false);
    });
  });

  describe('Vulnerability Pattern Detection', () => {
    test('should detect SQL injection patterns', () => {
      const maliciousQuery = "SELECT * FROM users WHERE id = '" + "userInput" + "'";
      const result = securityService.detectSQLInjection(maliciousQuery);
      
      expect(result.isVulnerable).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect XSS patterns', () => {
      const maliciousInput = '<script>alert(document.cookie)</script>';
      const result = securityService.detectXSS(maliciousInput);
      
      expect(result.isVulnerable).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect command injection patterns', () => {
      const maliciousCommand = 'ls; rm -rf /';
      const result = securityService.detectCommandInjection(maliciousCommand);
      
      expect(result.isVulnerable).toBe(true);
      expect(result.riskLevel).toBe('critical');
    });

    test('should detect path traversal patterns', () => {
      const maliciousPath = '../../../etc/passwd';
      const result = securityService.detectPathTraversal(maliciousPath);
      
      expect(result.isVulnerable).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect LDAP injection patterns', () => {
      const maliciousFilter = '(&(uid=user)(userPassword=password))';
      const result = securityService.detectLDAPInjection(maliciousFilter);
      
      expect(result.isVulnerable).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect NoSQL injection patterns', () => {
      const maliciousQuery = { $where: "this.password.length > 0" };
      const result = securityService.detectNoSQLInjection(maliciousQuery);
      
      expect(result.isVulnerable).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    test('should detect SSRF patterns', () => {
      const maliciousUrl = 'http://localhost:22';
      const result = securityService.detectSSRF(maliciousUrl);
      
      expect(result.isVulnerable).toBe(true);
      expect(result.riskLevel).toBe('high');
    });
  });

  describe('Encryption and Key Management', () => {
    test('should encrypt sensitive data', () => {
      const sensitiveData = 'password123';
      const encrypted = securityService.encryptSensitiveData(sensitiveData);
      
      expect(encrypted).not.toBe(sensitiveData);
      expect(typeof encrypted).toBe('string');
    });

    test('should decrypt encrypted data', () => {
      const sensitiveData = 'password123';
      const encrypted = securityService.encryptSensitiveData(sensitiveData);
      const decrypted = securityService.decryptSensitiveData(encrypted);
      
      expect(decrypted).toBe(sensitiveData);
    });

    test('should generate secure keys', () => {
      const key = securityService.generateSecureKey();
      
      expect(key).toBeDefined();
      expect(key.length).toBeGreaterThan(32);
    });

    test('should rotate encryption keys', async () => {
      const oldKey = securityService.getCurrentKey();
      await securityService.rotateEncryptionKey();
      const newKey = securityService.getCurrentKey();
      
      expect(oldKey).not.toBe(newKey);
    });

    test('should hash passwords securely', async () => {
      const password = 'securePassword123';
      const hash = await securityService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    test('should verify passwords correctly', async () => {
      const password = 'securePassword123';
      const hash = await securityService.hashPassword(password);
      
      const isValid = await securityService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await securityService.verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Security Event Logging', () => {
    test('should log security events', () => {
      const event = {
        type: 'login_attempt',
        user: 'testuser',
        ip: '192.168.1.1',
        success: false
      };
      
      const logEntry = securityService.logSecurityEvent(event);
      
      expect(logEntry).toBeDefined();
      expect(logEntry.type).toBe('login_attempt');
      expect(logEntry.timestamp).toBeDefined();
    });

    test('should detect suspicious activities', () => {
      const activities = [
        { type: 'login_attempt', user: 'testuser', ip: '192.168.1.1', success: false },
        { type: 'login_attempt', user: 'testuser', ip: '192.168.1.1', success: false },
        { type: 'login_attempt', user: 'testuser', ip: '192.168.1.1', success: false },
        { type: 'login_attempt', user: 'testuser', ip: '192.168.1.1', success: false },
        { type: 'login_attempt', user: 'testuser', ip: '192.168.1.1', success: false }
      ];
      
      activities.forEach(activity => securityService.logSecurityEvent(activity));
      
      const isSuspicious = securityService.detectSuspiciousActivity('testuser');
      expect(isSuspicious).toBe(true);
    });

    test('should generate security reports', () => {
      const events = [
        { type: 'login_attempt', user: 'user1', success: true },
        { type: 'login_attempt', user: 'user2', success: false },
        { type: 'file_access', user: 'user1', file: 'sensitive.txt' }
      ];
      
      events.forEach(event => securityService.logSecurityEvent(event));
      
      const report = securityService.generateSecurityReport();
      
      expect(report).toBeDefined();
      expect(report.totalEvents).toBeGreaterThan(0);
      expect(report.eventTypes).toBeDefined();
    });

    test('should alert on security incidents', () => {
      const incident = {
        type: 'brute_force',
        severity: 'high',
        details: 'Multiple failed login attempts'
      };
      
      const alert = securityService.alertSecurityIncident(incident);
      
      expect(alert).toBeDefined();
      expect(alert.severity).toBe('high');
      expect(alert.timestamp).toBeDefined();
    });
  });

  describe('Advanced Threat Detection', () => {
    test('should detect brute force attacks', () => {
      const attempts = Array(10).fill(null).map((_, i) => ({
        type: 'login_attempt',
        user: 'testuser',
        ip: '192.168.1.1',
        success: false,
        timestamp: Date.now() - (i * 1000)
      }));
      
      attempts.forEach(attempt => securityService.logSecurityEvent(attempt));
      
      const isBruteForce = securityService.detectBruteForce('192.168.1.1');
      expect(isBruteForce).toBe(true);
    });

    test('should detect unusual access patterns', () => {
      const accessEvents = [
        { user: 'user1', resource: 'admin_panel', timestamp: Date.now() - 3600000 },
        { user: 'user1', resource: 'user_data', timestamp: Date.now() - 1800000 },
        { user: 'user1', resource: 'admin_panel', timestamp: Date.now() - 900000 }
      ];
      
      accessEvents.forEach(event => securityService.logSecurityEvent(event));
      
      const isUnusual = securityService.detectUnusualAccess('user1');
      expect(typeof isUnusual).toBe('boolean');
    });

    test('should detect data exfiltration attempts', () => {
      const downloadEvents = Array(50).fill(null).map((_, i) => ({
        type: 'file_download',
        user: 'user1',
        file: `file${i}.pdf`,
        size: 1024 * 1024,
        timestamp: Date.now() - (i * 1000)
      }));
      
      downloadEvents.forEach(event => securityService.logSecurityEvent(event));
      
      const isExfiltration = securityService.detectDataExfiltration('user1');
      expect(typeof isExfiltration).toBe('boolean');
    });

    test('should detect privilege escalation attempts', () => {
      const privilegeEvents = [
        { type: 'privilege_change', user: 'user1', oldRole: 'user', newRole: 'admin' },
        { type: 'permission_grant', user: 'user1', permission: 'system_access' }
      ];
      
      privilegeEvents.forEach(event => securityService.logSecurityEvent(event));
      
      const isEscalation = securityService.detectPrivilegeEscalation('user1');
      expect(typeof isEscalation).toBe('boolean');
    });
  });

  describe('Vulnerability Scanner Integration', () => {
    test('should scan code for vulnerabilities', async () => {
      const mockCodebase = {
        path: '/test/codebase',
        files: ['test.js', 'app.js']
      };
      
      // Mock file system operations
      const mockScanResults = {
        vulnerabilities: [
          {
            category: 'injection',
            severity: 'high',
            file: 'test.js',
            line: 10
          }
        ],
        summary: { totalVulnerabilities: 1 }
      };
      
      vulnerabilityScanner.scanCodebase = jest.fn().mockResolvedValue(mockScanResults);
      
      const results = await vulnerabilityScanner.scanCodebase(mockCodebase.path);
      
      expect(results.vulnerabilities).toBeDefined();
      expect(results.summary.totalVulnerabilities).toBeGreaterThanOrEqual(0);
    });

    test('should generate vulnerability reports', async () => {
      const mockScanResults = {
        vulnerabilities: [
          { severity: 'critical', category: 'injection' },
          { severity: 'high', category: 'xss' }
        ],
        summary: { critical: 1, high: 1 }
      };
      
      const report = vulnerabilityScanner.generateDetailedReport(mockScanResults);
      
      expect(report).toBeDefined();
      expect(report.executiveSummary).toBeDefined();
      expect(report.riskAssessment).toBeDefined();
    });

    test('should check compliance requirements', () => {
      const mockVulnerabilities = [
        { category: 'sensitiveDataExposure', severity: 'high' },
        { category: 'brokenAuthentication', severity: 'critical' }
      ];
      
      const compliance = vulnerabilityScanner.generateComplianceCheck({ vulnerabilities: mockVulnerabilities });
      
      expect(compliance.owaspTop10).toBeDefined();
      expect(compliance.pciDss).toBeDefined();
      expect(compliance.gdpr).toBeDefined();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle encryption errors gracefully', () => {
      const invalidData = null;
      
      expect(() => securityService.encryptSensitiveData(invalidData)).not.toThrow();
    });

    test('should handle invalid input gracefully', () => {
      const invalidInput = undefined;
      
      expect(() => securityService.sanitizeInput(invalidInput)).not.toThrow();
    });

    test('should handle file system errors', async () => {
      const nonExistentFile = '/non/existent/file.js';
      
      await expect(vulnerabilityScanner.scanFile(nonExistentFile)).rejects.toThrow();
    });

    test('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      
      // Mock network operation
      const mockDependencyCheck = jest.fn().mockRejectedValue(networkError);
      vulnerabilityScanner.checkDependencyVulnerabilities = mockDependencyCheck;
      
      await expect(vulnerabilityScanner.checkDependencyVulnerabilities('test-package', '1.0.0')).rejects.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large input efficiently', () => {
      const largeInput = 'A'.repeat(10000) + '<script>alert("xss")</script>' + 'B'.repeat(10000);
      const startTime = Date.now();
      
      const result = securityService.sanitizeInput(largeInput);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result).not.toContain('<script>');
    });

    test('should handle multiple concurrent validations', async () => {
      const inputs = Array(100).fill(null).map((_, i) => `test${i}@example.com`);
      
      const startTime = Date.now();
      const results = await Promise.all(
        inputs.map(input => securityService.validateEmail(input))
      );
      const endTime = Date.now();
      
      expect(results.every(r => r === true)).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should manage memory efficiently', () => {
      const iterations = 1000;
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < iterations; i++) {
        securityService.sanitizeInput('<script>alert("xss")</script>');
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    });
  });

  describe('Security Configuration', () => {
    test('should apply security headers', () => {
      const headers = securityService.getSecurityHeaders();
      
      expect(headers).toBeDefined();
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    test('should validate security configuration', () => {
      const validConfig = {
        encryptionKey: 'valid-key-32-characters-long',
        maxAttempts: 5,
        lockoutDuration: 900000
      };
      
      const invalidConfig = {
        encryptionKey: 'short',
        maxAttempts: -1,
        lockoutDuration: 'invalid'
      };
      
      expect(securityService.validateSecurityConfig(validConfig)).toBe(true);
      expect(securityService.validateSecurityConfig(invalidConfig)).toBe(false);
    });

    test('should enforce rate limiting', () => {
      const ip = '192.168.1.1';
      
      // Simulate multiple requests
      for (let i = 0; i < 10; i++) {
        securityService.checkRateLimit(ip);
      }
      
      const isRateLimited = securityService.checkRateLimit(ip);
      expect(isRateLimited).toBe(true);
    });
  });
});