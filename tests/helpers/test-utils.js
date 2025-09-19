// Test utilities and helper functions
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Test utility functions for common testing operations
 */
class TestUtils {
  /**
   * Create a test server instance
   */
  static createTestServer(app) {
    return request(app);
  }

  /**
   * Generate JWT token for testing
   */
  static generateToken(payload, secret = 'test-secret', expiresIn = '1h') {
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Create authentication headers
   */
  static createAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Hash password for testing
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Wait for specified milliseconds
   */
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random test data
   */
  static generateRandomData(type, length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const numbers = '0123456789';
    const emails = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];

    switch (type) {
      case 'string':
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      
      case 'number':
        return Math.floor(Math.random() * Math.pow(10, length));
      
      case 'email':
        const username = this.generateRandomData('string', 8);
        const domain = emails[Math.floor(Math.random() * emails.length)];
        return `${username}@${domain}`;
      
      case 'phone':
        return `+1${Array.from({ length: 10 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('')}`;
      
      case 'date':
        return new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
      
      default:
        return this.generateRandomData('string', length);
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Generate test dates
   */
  static generateTestDates() {
    const now = new Date();
    return {
      today: now,
      yesterday: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      tomorrow: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      lastWeek: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      lastMonth: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      nextWeek: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      nextMonth: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Mock external API responses
   */
  static mockApiResponse(status = 200, data = {}, delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status,
          data,
          headers: { 'content-type': 'application/json' }
        });
      }, delay);
    });
  }

  /**
   * Create test files
   */
  static createTestFile(name = 'test.txt', content = 'Test content', type = 'text/plain') {
    const buffer = Buffer.from(content);
    return {
      fieldname: 'file',
      originalname: name,
      encoding: '7bit',
      mimetype: type,
      size: buffer.length,
      buffer,
      stream: null,
      destination: null,
      filename: null,
      path: null
    };
  }

  /**
   * Clean up test files
   */
  static async cleanupTestFiles(files) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    
    for (const file of files) {
      if (file.path) {
        try {
          const fs = require('fs').promises;
          await fs.unlink(file.path);
        } catch (error) {
          console.warn(`Failed to cleanup test file: ${file.path}`);
        }
      }
    }
  }

  /**
   * Validate object structure
   */
  static validateObjectStructure(obj, expectedStructure) {
    const errors = [];
    
    for (const [key, expectedType] of Object.entries(expectedStructure)) {
      if (!(key in obj)) {
        errors.push(`Missing property: ${key}`);
        continue;
      }
      
      const actualType = typeof obj[key];
      if (actualType !== expectedType) {
        errors.push(`Invalid type for ${key}: expected ${expectedType}, got ${actualType}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate test scenarios
   */
  static generateTestScenarios(baseScenario, variations = {}) {
    const scenarios = [baseScenario];
    
    for (const [key, values] of Object.entries(variations)) {
      const newScenarios = [];
      
      for (const scenario of scenarios) {
        for (const value of values) {
          newScenarios.push({
            ...scenario,
            [key]: value
          });
        }
      }
      
      scenarios.push(...newScenarios);
    }
    
    return scenarios;
  }

  /**
   * Measure test performance
   */
  static async measurePerformance(testFunction, iterations = 100) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await testFunction();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to milliseconds
    }
    
    const avg = times.reduce((a, b) => a + b) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
    
    return {
      average: avg,
      minimum: min,
      maximum: max,
      median,
      iterations,
      times
    };
  }

  /**
   * Create mock request/response objects
   */
  static createMockReqRes() {
    const req = {
      body: {},
      params: {},
      query: {},
      headers: {},
      user: null,
      file: null,
      files: [],
      ip: '127.0.0.1',
      method: 'GET',
      url: '/test',
      get: jest.fn((header) => this.headers[header.toLowerCase()]),
      header: jest.fn((header) => this.headers[header.toLowerCase()])
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      render: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();
    
    return { req, res, next };
  }

  /**
   * Retry failed operations
   */
  static async retry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < maxRetries) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Generate load testing data
   */
  static generateLoadTestData(users = 100, newsletters = 50, subscribers = 1000) {
    const testData = {
      users: [],
      newsletters: [],
      subscribers: []
    };
    
    // Generate users
    for (let i = 0; i < users; i++) {
      testData.users.push({
        email: `user${i}@example.com`,
        password: 'TestPassword123!',
        firstName: `User${i}`,
        lastName: 'Test',
        role: i === 0 ? 'admin' : 'subscriber'
      });
    }
    
    // Generate newsletters
    for (let i = 0; i < newsletters; i++) {
      testData.newsletters.push({
        title: `Newsletter ${i}`,
        content: `Content for newsletter ${i}`,
        status: i % 3 === 0 ? 'published' : 'draft'
      });
    }
    
    // Generate subscribers
    for (let i = 0; i < subscribers; i++) {
      testData.subscribers.push({
        email: `subscriber${i}@example.com`,
        firstName: `Subscriber${i}`,
        isActive: true
      });
    }
    
    return testData;
  }
}

module.exports = TestUtils;