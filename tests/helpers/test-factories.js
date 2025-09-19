// Test data factories for creating consistent test data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Factory for creating test users
 */
const UserFactory = {
  create: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    email: overrides.email || `test.user.${Date.now()}@example.com`,
    password: overrides.password || 'TestPassword123!',
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    role: overrides.role || 'subscriber',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    lastLogin: overrides.lastLogin || null,
    preferences: overrides.preferences || {
      newsletterFrequency: 'weekly',
      categories: ['technology', 'business'],
      timezone: 'UTC'
    },
    subscription: overrides.subscription || {
      status: 'active',
      plan: 'basic',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  }),

  createAdmin: (overrides = {}) => ({
    ...UserFactory.create(overrides),
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin']
  }),

  createEditor: (overrides = {}) => ({
    ...UserFactory.create(overrides),
    role: 'editor',
    permissions: ['read', 'write']
  })
};

/**
 * Factory for creating test newsletters
 */
const NewsletterFactory = {
  create: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    title: overrides.title || 'Test Newsletter',
    content: overrides.content || 'This is test newsletter content',
    excerpt: overrides.excerpt || 'Test newsletter excerpt',
    status: overrides.status || 'draft',
    author: overrides.author || new mongoose.Types.ObjectId(),
    targetAudience: overrides.targetAudience || 'all',
    scheduledDate: overrides.scheduledDate || new Date(Date.now() + 86400000), // Tomorrow
    sentDate: overrides.sentDate || null,
    recipients: overrides.recipients || [],
    openRate: overrides.openRate || 0,
    clickRate: overrides.clickRate || 0,
    unsubscribeRate: overrides.unsubscribeRate || 0,
    bounceRate: overrides.bounceRate || 0,
    tags: overrides.tags || ['test', 'newsletter'],
    categories: overrides.categories || ['general'],
    template: overrides.template || 'default',
    subjectLine: overrides.subjectLine || 'Test Newsletter Subject',
    fromName: overrides.fromName || 'Piper Newsletter',
    fromEmail: overrides.fromEmail || 'noreply@pipernewsletter.com',
    replyTo: overrides.replyTo || 'support@pipernewsletter.com',
    isPersonalized: overrides.isPersonalized !== undefined ? overrides.isPersonalized : false,
    personalizationFields: overrides.personalizationFields || [],
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    createdBy: overrides.createdBy || new mongoose.Types.ObjectId(),
    updatedBy: overrides.updatedBy || new mongoose.Types.ObjectId()
  }),

  createPublished: (overrides = {}) => ({
    ...NewsletterFactory.create(overrides),
    status: 'published',
    sentDate: new Date()
  }),

  createScheduled: (overrides = {}) => ({
    ...NewsletterFactory.create(overrides),
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 86400000) // Tomorrow
  })
};

/**
 * Factory for creating test subscribers
 */
const SubscriberFactory = {
  create: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    email: overrides.email || `subscriber.${Date.now()}@example.com`,
    firstName: overrides.firstName || 'Subscriber',
    lastName: overrides.lastName || 'Test',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
    preferences: overrides.preferences || {
      categories: ['technology', 'business'],
      frequency: 'weekly',
      timezone: 'UTC',
      language: 'en'
    },
    subscriptionDate: overrides.subscriptionDate || new Date(),
    unsubscribeDate: overrides.unsubscribeDate || null,
    lastEngagement: overrides.lastEngagement || new Date(),
    engagementScore: overrides.engagementScore || 0,
    tags: overrides.tags || ['test-subscriber'],
    customFields: overrides.customFields || {},
    source: overrides.source || 'website',
    ipAddress: overrides.ipAddress || '127.0.0.1',
    userAgent: overrides.userAgent || 'Mozilla/5.0 (Test Browser)',
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date()
  }),

  createUnsubscribed: (overrides = {}) => ({
    ...SubscriberFactory.create(overrides),
    isActive: false,
    unsubscribeDate: new Date()
  })
};

/**
 * Factory for creating test analytics data
 */
const AnalyticsFactory = {
  create: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    type: overrides.type || 'newsletter_metrics',
    date: overrides.date || new Date(),
    data: overrides.data || {
      totalSent: 1000,
      totalDelivered: 950,
      totalOpened: 450,
      totalClicked: 150,
      totalUnsubscribed: 10,
      totalBounced: 50,
      openRate: 47.4,
      clickRate: 15.8,
      unsubscribeRate: 1.1,
      bounceRate: 5.3
    },
    metadata: overrides.metadata || {
      newsletterId: new mongoose.Types.ObjectId(),
      campaignId: new mongoose.Types.ObjectId(),
      segmentId: new mongoose.Types.ObjectId()
    },
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date()
  }),

  createUserActivity: (overrides = {}) => ({
    ...AnalyticsFactory.create(overrides),
    type: 'user_activity',
    data: {
      userId: new mongoose.Types.ObjectId(),
      action: overrides.action || 'newsletter_open',
      newsletterId: new mongoose.Types.ObjectId(),
      timestamp: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      referrer: 'https://example.com',
      device: 'desktop',
      browser: 'Chrome',
      os: 'Windows'
    }
  })
};

/**
 * Factory for creating test content
 */
const ContentFactory = {
  create: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    type: overrides.type || 'article',
    title: overrides.title || 'Test Content',
    content: overrides.content || 'This is test content',
    excerpt: overrides.excerpt || 'Test content excerpt',
    author: overrides.author || new mongoose.Types.ObjectId(),
    status: overrides.status || 'draft',
    tags: overrides.tags || ['test', 'content'],
    categories: overrides.categories || ['general'],
    featuredImage: overrides.featuredImage || null,
    seoTitle: overrides.seoTitle || 'Test Content SEO Title',
    seoDescription: overrides.seoDescription || 'Test content SEO description',
    seoKeywords: overrides.seoKeywords || ['test', 'content', 'seo'],
    readingTime: overrides.readingTime || 5,
    wordCount: overrides.wordCount || 1000,
    publishedDate: overrides.publishedDate || null,
    lastModified: overrides.lastModified || new Date(),
    createdBy: overrides.createdBy || new mongoose.Types.ObjectId(),
    updatedBy: overrides.updatedBy || new mongoose.Types.ObjectId(),
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date()
  }),

  createPublished: (overrides = {}) => ({
    ...ContentFactory.create(overrides),
    status: 'published',
    publishedDate: new Date()
  })
};

/**
 * Factory for creating test API responses
 */
const ApiResponseFactory = {
  success: (data = {}, message = 'Success') => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }),

  error: (message = 'Error', code = 'GENERIC_ERROR', details = null) => ({
    success: false,
    error: {
      message,
      code,
      details
    },
    timestamp: new Date().toISOString()
  }),

  paginated: (items = [], total = 0, page = 1, limit = 10) => ({
    success: true,
    data: {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    },
    timestamp: new Date().toISOString()
  })
};

/**
 * Factory for creating test authentication data
 */
const AuthFactory = {
  createToken: (userId, role = 'subscriber', expiresIn = '1h') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        userId, 
        role, 
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (expiresIn === '1h' ? 3600 : 86400)
      },
      'test-secret-key'
    );
  },

  createRefreshToken: (userId) => {
    return `refresh_${userId}_${Date.now()}`;
  },

  createAuthHeaders: (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  })
};

/**
 * Factory for creating test validation errors
 */
const ValidationErrorFactory = {
  create: (field, message, value = null) => ({
    field,
    message,
    value,
    code: 'VALIDATION_ERROR'
  }),

  email: () => ValidationErrorFactory.create('email', 'Invalid email format'),
  password: () => ValidationErrorFactory.create('password', 'Password must be at least 8 characters'),
  required: (field) => ValidationErrorFactory.create(field, `${field} is required`),
  unique: (field) => ValidationErrorFactory.create(field, `${field} already exists`)
};

module.exports = {
  UserFactory,
  NewsletterFactory,
  SubscriberFactory,
  AnalyticsFactory,
  ContentFactory,
  ApiResponseFactory,
  AuthFactory,
  ValidationErrorFactory
};