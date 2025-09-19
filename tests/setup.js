// Jest setup file for test configuration
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

// Mock mongoose connection to prevent real database operations
mongoose.connect = jest.fn().mockResolvedValue(true);
mongoose.disconnect = jest.fn().mockResolvedValue(true);

// Mock all model operations
const mockDeleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
const mockFind = jest.fn().mockResolvedValue([]);
const mockFindOne = jest.fn().mockResolvedValue(null);
const mockSave = jest.fn().mockImplementation(function() {
  if (!this._id) this._id = new mongoose.Types.ObjectId();
  return Promise.resolve(this);
});

// Create storage for model instances
const modelStorage = {
  Content: [],
  Analytics: [],
  Subscription: [],
  Appointment: []
};

// Create a function to mock a model
function mockModel(modelName) {
  const Model = function(data) {
    Object.assign(this, data);
    if (!this._id) this._id = new mongoose.Types.ObjectId();
  };
  
  Model.deleteMany = async function(query = {}) {
    modelStorage[modelName] = [];
    return { deletedCount: 0 };
  };
  
  Model.find = function(query = {}) {
    // Return stored instances that match the query
    const instances = modelStorage[modelName] || [];
    
    // Simple query matching - handle basic cases
    if (Object.keys(query).length === 0) {
      return createChainableQuery(instances);
    }
    
    // Handle date range queries for analytics
    if (query.date && query.date.$gte && query.date.$lte) {
      const filtered = instances.filter(instance => {
        const instanceDate = new Date(instance.date || instance.createdAt);
        return instanceDate >= query.date.$gte && instanceDate <= query.date.$lte;
      });
      return createChainableQuery(filtered);
    }
    
    // Handle other simple queries
    const filtered = instances.filter(instance => {
      for (let key in query) {
        if (instance[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return createChainableQuery(filtered);
  };
  
  function createChainableQuery(results) {
    const queryObj = {
      results,
      sort: function(sortObj) {
        const sortKey = Object.keys(sortObj)[0];
        const sortOrder = sortObj[sortKey];
        this.results.sort((a, b) => {
          if (sortOrder === 1) return a[sortKey] > b[sortKey] ? 1 : -1;
          if (sortOrder === -1) return a[sortKey] < b[sortKey] ? 1 : -1;
          return 0;
        });
        return this;
      },
      exec: function() {
        return Promise.resolve(this.results);
      },
      then: function(onFulfilled, onRejected) {
        return Promise.resolve(this.results).then(onFulfilled, onRejected);
      }
    };
    return queryObj;
  }
  
  Model.findOne = async function(query = {}) {
    const instances = modelStorage[modelName] || [];
    
    if (Object.keys(query).length === 0) {
      return instances[0] || null;
    }
    
    return instances.find(instance => {
      for (let key in query) {
        if (instance[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  };
  
  Model.prototype.save = async function() {
    const storage = modelStorage[modelName];
    const existingIndex = storage.findIndex(item => item._id.toString() === this._id.toString());
    
    if (existingIndex >= 0) {
      storage[existingIndex] = this;
    } else {
      storage.push(this);
    }
    
    return this;
  };
  
  return Model;
}

// Mock all models before they're imported
jest.mock('../models/User', () => {
  const User = function(data) {
    Object.assign(this, data);
  };
  
  // Store users in memory for authentication
  const users = new Map();
  
  User.findOne = async function(query) {
    if (query.email) {
      for (let [id, user] of users) {
        if (user.email === query.email) {
          return { ...user, _id: id };
        }
      }
    }
    return null;
  };
  
  User.findById = function(id) {
    // Handle both ObjectId and string formats
    const idString = id.toString();
    let user = null;
    
    // Look for user by ID in both ObjectId and string formats
    for (let [key, value] of users) {
      if (key.toString() === idString) {
        user = value;
        break;
      }
    }
    
    const userData = user ? { ...user, _id: idString } : null;
    
    // Return a mock query object that has select method
    return {
      select: function(fields) {
        if (!userData) return Promise.resolve(null);
        
        // Handle field selection
        const selectedUser = {};
        if (typeof fields === 'string') {
          // Handle space-separated fields like "name email"
          const fieldArray = fields.split(' ').filter(f => f);
          fieldArray.forEach(field => {
            if (userData[field]) {
              selectedUser[field] = userData[field];
            }
          });
        } else if (Array.isArray(fields)) {
          // Handle array of fields
          fields.forEach(field => {
            if (userData[field]) {
              selectedUser[field] = userData[field];
            }
          });
        }
        
        // Always include _id and important fields
        selectedUser._id = userData._id;
        selectedUser.email = userData.email;
        selectedUser.role = userData.role;
        
        return Promise.resolve(selectedUser);
      },
      exec: function() {
        return Promise.resolve(userData);
      }
    };
  };
  
  User.prototype.save = async function() {
    const id = this._id || new mongoose.Types.ObjectId().toString();
    this._id = id;
    users.set(id, { ...this, _id: id });
    return this;
  };
  
  User.deleteMany = async function(query = {}) {
    if (query.email && query.email.$ne) {
      // Keep test user, delete others
      for (let [id, user] of users) {
        if (user.email !== query.email.$ne) {
          users.delete(id);
        }
      }
    } else {
      users.clear();
    }
    return { deletedCount: 0 };
  };
  
  // Store reference for test setup
  User._users = users;
  
  return User;
});

jest.mock('../models/Subscription', () => mockModel('Subscription'));
jest.mock('../models/Appointment', () => mockModel('Appointment'));
jest.mock('../models/Content', () => mockModel('Content'));
jest.mock('../models/Analytics', () => mockModel('Analytics'));

// Mock database setup for testing without MongoDB connection

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
  
  // Create test user
  const User = require('../models/User');
  const testUserId = new mongoose.Types.ObjectId();
  const hashedPassword = await bcrypt.hash('testpassword123', 10);
  const testUser = new User({
    _id: testUserId,
    email: 'test@example.com',
    password: hashedPassword,
    name: 'Test User',
    role: 'admin'
  });
  await testUser.save();
  global.testUser = testUser;
  
  console.log('Test setup complete - using mock database');
  console.log('Test user created with ID:', testUserId.toString());
  
  // Create test data for analytics and content endpoints
  const Content = require('../models/Content');
  const Analytics = require('../models/Analytics');
  
  // Create test content
  const testContent = new Content({
    title: 'Test Newsletter',
    content: 'Test content for newsletter',
    type: 'newsletter',
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    userId: testUserId,
    createdBy: testUserId
  });
  await testContent.save();
  
  // Create test analytics data
  const testAnalytics = new Analytics({
    userId: testUserId,
    metric: 'total_subscribers',
    value: 150,
    date: new Date(),
    timestamp: new Date()
  });
  await testAnalytics.save();
  
  const testAnalytics2 = new Analytics({
    userId: testUserId,
    metric: 'open_rate',
    value: 25.5,
    date: new Date(),
    timestamp: new Date()
  });
  await testAnalytics2.save();
});

// Clear database between tests
beforeEach(async () => {
  const User = require('../models/User');
  const Subscription = require('../models/Subscription');
  const Appointment = require('../models/Appointment');
  const Content = require('../models/Content');
  const Analytics = require('../models/Analytics');
  
  await User.deleteMany({ email: { $ne: 'test@example.com' } });
  await Subscription.deleteMany({});
  await Appointment.deleteMany({});
  await Content.deleteMany({});
  await Analytics.deleteMany({});
  
  // Clear model storage
  modelStorage.Content = [];
  modelStorage.Analytics = [];
  modelStorage.Subscription = [];
  modelStorage.Appointment = [];
});

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.SENTRY_DSN = 'https://test@sentry.io/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_REGION = 'us-east-1';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: console.log, // Temporarily allow console.log for debugging
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Temporarily allow console.error for debugging
};

// Mock external services
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((callback) => callback({
    setTag: jest.fn(),
    setContext: jest.fn(),
    setUser: jest.fn(),
  })),
  startTransaction: jest.fn(() => ({
    finish: jest.fn(),
    setTag: jest.fn(),
    setData: jest.fn(),
  })),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
    verify: jest.fn(() => Promise.resolve(true)),
  })),
}));

jest.mock('stripe', () => jest.fn(() => ({
  customers: {
    create: jest.fn(() => Promise.resolve({ id: 'cus_test123' })),
  },
  charges: {
    create: jest.fn(() => Promise.resolve({ id: 'ch_test123' })),
  },
})));

jest.mock('twilio', () => jest.fn(() => ({
  messages: {
    create: jest.fn(() => Promise.resolve({ sid: 'SM_test123' })),
  },
})));

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    role: 'user',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockNewsletter: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Newsletter',
    content: '<p>Test content</p>',
    subject: 'Test Subject',
    status: 'draft',
    author: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockSubscriber: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    email: 'subscriber@example.com',
    name: 'Test Subscriber',
    status: 'active',
    preferences: { newsletter: true, promotions: false },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockCampaign: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Campaign',
    newsletter: new mongoose.Types.ObjectId(),
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 3600000),
    recipients: [],
    analytics: { sent: 0, opened: 0, clicked: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  generateValidToken: (userId) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
};

// Store mocked models globally for test server to use
global.mockedModels = {
  User: require('../models/User'),
  Subscription: require('../models/Subscription'),
  Appointment: require('../models/Appointment'),
  Content: require('../models/Content'),
  Analytics: require('../models/Analytics')
};