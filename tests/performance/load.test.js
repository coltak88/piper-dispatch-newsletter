const { performance } = require('perf_hooks');
const autocannon = require('autocannon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');

// Performance test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  duration: 30, // seconds
  connections: 50,
  pipelining: 10,
  timeout: 30,
  headers: {
    'Content-Type': 'application/json'
  }
};

describe('Performance and Load Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/piper_newsletter_performance_test');
    
    // Create test user for authentication
    testUser = new User({
      email: 'performance@test.com',
      password: await bcrypt.hash('testpassword123', 10),
      name: 'Performance Test User',
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
    await mongoose.connection.close();
  });

  describe('API Endpoint Performance', () => {
    test('Login endpoint performance under load', async () => {
      const loginData = {
        email: 'performance@test.com',
        password: 'testpassword123'
      };

      const result = await autocannon({
        ...TEST_CONFIG,
        url: `${TEST_CONFIG.baseUrl}/api/auth/login`,
        method: 'POST',
        body: JSON.stringify(loginData),
        duration: 10
      });

      console.log('Login Performance Results:');
      console.log(`- Requests per second: ${result.requests.average}`);
      console.log(`- Average latency: ${result.latency.average}ms`);
      console.log(`- P99 latency: ${result.latency.p99}ms`);
      console.log(`- Errors: ${result.errors}`);
      console.log(`- Timeouts: ${result.timeouts}`);

      // Performance assertions
      expect(result.requests.average).toBeGreaterThan(100); // At least 100 req/s
      expect(result.latency.average).toBeLessThan(200); // Average latency < 200ms
      expect(result.latency.p99).toBeLessThan(500); // P99 latency < 500ms
      expect(result.errors).toBe(0); // No errors
    });

    test('Newsletter list endpoint performance', async () => {
      const result = await autocannon({
        ...TEST_CONFIG,
        url: `${TEST_CONFIG.baseUrl}/api/newsletters`,
        method: 'GET',
        headers: {
          ...TEST_CONFIG.headers,
          'Authorization': `Bearer ${authToken}`
        },
        duration: 10
      });

      console.log('Newsletter List Performance Results:');
      console.log(`- Requests per second: ${result.requests.average}`);
      console.log(`- Average latency: ${result.latency.average}ms`);
      console.log(`- P99 latency: ${result.latency.p99}ms`);

      expect(result.requests.average).toBeGreaterThan(200); // At least 200 req/s
      expect(result.latency.average).toBeLessThan(100); // Average latency < 100ms
      expect(result.latency.p99).toBeLessThan(300); // P99 latency < 300ms
    });

    test('Campaign creation endpoint performance', async () => {
      const campaignData = {
        name: 'Performance Test Campaign',
        subject: 'Performance Test Subject',
        content: '<html><body>Performance test content</body></html>',
        newsletterId: new mongoose.Types.ObjectId(),
        scheduledFor: new Date(Date.now() + 3600000)
      };

      const result = await autocannon({
        ...TEST_CONFIG,
        url: `${TEST_CONFIG.baseUrl}/api/campaigns`,
        method: 'POST',
        headers: {
          ...TEST_CONFIG.headers,
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(campaignData),
        duration: 10
      });

      console.log('Campaign Creation Performance Results:');
      console.log(`- Requests per second: ${result.requests.average}`);
      console.log(`- Average latency: ${result.latency.average}ms`);
      console.log(`- P99 latency: ${result.latency.p99}ms`);

      expect(result.requests.average).toBeGreaterThan(50); // At least 50 req/s
      expect(result.latency.average).toBeLessThan(300); // Average latency < 300ms
      expect(result.latency.p99).toBeLessThan(800); // P99 latency < 800ms
    });
  });

  describe('Database Performance', () => {
    test('Database query performance with large datasets', async () => {
      const Newsletter = require('../../src/models/Newsletter');
      const Subscriber = require('../../src/models/Subscriber');

      // Create test data
      console.log('Creating test data...');
      const newsletters = [];
      const subscribers = [];

      // Create 100 newsletters
      for (let i = 1; i <= 100; i++) {
        newsletters.push({
          name: `Performance Test Newsletter ${i}`,
          description: `Test newsletter ${i}`,
          fromName: 'Test Sender',
          fromEmail: 'sender@example.com',
          subjectTemplate: 'Test - {{date}}',
          userId: testUser._id
        });
      }

      await Newsletter.insertMany(newsletters);

      // Create 10,000 subscribers
      for (let i = 1; i <= 10000; i++) {
        subscribers.push({
          email: `subscriber${i}@performance.com`,
          name: `Subscriber ${i}`,
          newsletterId: newsletters[Math.floor(Math.random() * newsletters.length)]._id,
          status: 'active'
        });
      }

      await Subscriber.insertMany(subscribers);

      // Test query performance
      console.log('Testing query performance...');
      
      // Test 1: Newsletter list query
      let startTime = performance.now();
      const newsletterResults = await Newsletter.find({ userId: testUser._id })
        .limit(50)
        .lean();
      let endTime = performance.now();
      
      console.log(`Newsletter query (${newsletterResults.length} results): ${(endTime - startTime).toFixed(2)}ms`);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms

      // Test 2: Subscriber count query
      startTime = performance.now();
      const subscriberCount = await Subscriber.countDocuments({ 
        newsletterId: newsletters[0]._id 
      });
      endTime = performance.now();
      
      console.log(`Subscriber count query (${subscriberCount} results): ${(endTime - startTime).toFixed(2)}ms`);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in < 50ms

      // Test 3: Complex aggregation query
      startTime = performance.now();
      const aggregationResults = await Subscriber.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: '$newsletterId',
            subscriberCount: { $sum: 1 }
          }
        },
        {
          $sort: { subscriberCount: -1 }
        },
        {
          $limit: 10
        }
      ]);
      endTime = performance.now();
      
      console.log(`Aggregation query (${aggregationResults.length} results): ${(endTime - startTime).toFixed(2)}ms`);
      expect(endTime - startTime).toBeLessThan(200); // Should complete in < 200ms

      // Test 4: Indexed query performance
      startTime = performance.now();
      const indexedResults = await Subscriber.find({ 
        email: 'subscriber5000@performance.com' 
      }).lean();
      endTime = performance.now();
      
      console.log(`Indexed email query (${indexedResults.length} results): ${(endTime - startTime).toFixed(2)}ms`);
      expect(endTime - startTime).toBeLessThan(20); // Should complete in < 20ms

      // Cleanup
      await Newsletter.deleteMany({});
      await Subscriber.deleteMany({});
    });
  });

  describe('Memory Usage and Resource Management', () => {
    test('Memory usage under sustained load', async () => {
      const initialMemory = process.memoryUsage();
      console.log('Initial memory usage:', initialMemory);

      // Simulate sustained load
      const loadPromises = [];
      for (let i = 0; i < 1000; i++) {
        loadPromises.push(
          request(TEST_CONFIG.baseUrl)
            .get('/api/newsletters')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      await Promise.all(loadPromises);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      console.log('Final memory usage:', finalMemory);

      // Memory usage should not increase dramatically
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);
      expect(memoryIncreaseMB).toBeLessThan(100); // Less than 100MB increase
    });
  });

  describe('Concurrent User Handling', () => {
    test('Handle multiple concurrent users efficiently', async () => {
      // Create multiple user tokens
      const userTokens = [];
      for (let i = 1; i <= 10; i++) {
        const user = new User({
          email: `concurrent${i}@test.com`,
          password: await bcrypt.hash('password123', 10),
          name: `Concurrent User ${i}`,
          role: 'user'
        });
        await user.save();

        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '24h' }
        );
        userTokens.push(token);
      }

      // Simulate concurrent requests from different users
      const concurrentPromises = [];
      for (let i = 0; i < userTokens.length; i++) {
        concurrentPromises.push(
          request(TEST_CONFIG.baseUrl)
            .get('/api/newsletters')
            .set('Authorization', `Bearer ${userTokens[i]}`)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(concurrentPromises);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      console.log(`Concurrent requests completed in: ${(endTime - startTime).toFixed(2)}ms`);
      expect(endTime - startTime).toBeLessThan(2000); // All requests should complete in < 2 seconds

      // Cleanup concurrent users
      await User.deleteMany({ email: { $regex: /^concurrent\d+@test\.com$/ } });
    });
  });

  describe('Stress Testing', () => {
    test('System behavior under extreme load', async () => {
      const stressConfig = {
        ...TEST_CONFIG,
        duration: 60, // 1 minute
        connections: 100,
        pipelining: 20
      };

      console.log('Starting stress test...');
      
      const result = await autocannon({
        ...stressConfig,
        url: `${TEST_CONFIG.baseUrl}/api/newsletters`,
        method: 'GET',
        headers: {
          ...TEST_CONFIG.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('Stress Test Results:');
      console.log(`- Total requests: ${result.requests.total}`);
      console.log(`- Successful requests: ${result.requests.sent - result.errors}`);
      console.log(`- Failed requests: ${result.errors}`);
      console.log(`- Average RPS: ${result.requests.average}`);
      console.log(`- Average latency: ${result.latency.average}ms`);
      console.log(`- Max latency: ${result.latency.max}ms`);

      // Stress test assertions
      expect(result.errors).toBeLessThan(result.requests.total * 0.01); // Less than 1% errors
      expect(result.requests.average).toBeGreaterThan(500); // Should maintain at least 500 RPS
      expect(result.latency.max).toBeLessThan(5000); // Max latency should be < 5 seconds
    });
  });
});