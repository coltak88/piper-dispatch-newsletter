const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'piper-newsletter-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configure rate limiting - use stricter limits in test environment
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 5 : 100, // Stricter limit in tests
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB only if not already connected (prevents conflicts in test environment)
if (mongoose.connection.readyState === 0) {
  const mongoUri = process.env.NODE_ENV === 'test' 
    ? process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
    : process.env.MONGODB_URI || 'mongodb://localhost:27017/piper_newsletter';

  // In test environment, if connection fails, continue without database
  if (process.env.NODE_ENV === 'test') {
    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => {
      logger.warn('MongoDB connection failed in test environment, continuing without database:', err.message);
      // Continue without database for testing
    });
  } else {
    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));
  }
} else {
  logger.info('MongoDB already connected');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Appointment = require('./models/Appointment');
const Content = require('./models/Content');
const Analytics = require('./models/Analytics');

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('location').optional().trim(),
  body('website').optional().isURL(),
  body('bio').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User profile updated: ${req.user.email}`);
    res.json(user);
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/subscriptions', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id });
    res.json(subscriptions);
  } catch (error) {
    logger.error('Subscriptions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

app.post('/api/subscriptions', authenticateToken, [
  body('plan').isIn(['basic', 'premium', 'enterprise']),
  body('paymentMethod').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, paymentMethod } = req.body;

    const existingSubscription = await Subscription.findOne({ 
      userId: req.user._id, 
      status: 'active' 
    });

    if (existingSubscription) {
      return res.status(409).json({ error: 'Active subscription already exists' });
    }

    const subscription = new Subscription({
      userId: req.user._id,
      plan,
      paymentMethod,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await subscription.save();

    logger.info(`New subscription created: ${req.user.email} - ${plan}`);
    res.status(201).json(subscription);
  } catch (error) {
    logger.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id });
    res.json(appointments);
  } catch (error) {
    logger.error('Appointments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', authenticateToken, [
  body('title').trim().isLength({ min: 1 }),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('participants').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, startTime, endTime, participants, description } = req.body;

    const appointment = new Appointment({
      userId: req.user._id,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      participants: participants || [],
      description: description || '',
      status: 'scheduled'
    });

    await appointment.save();

    logger.info(`New appointment created: ${req.user.email} - ${title}`);
    res.status(201).json(appointment);
  } catch (error) {
    logger.error('Appointment creation error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const userId = req.user._id;

    const dateRange = new Date();
    switch (range) {
      case '24h':
        dateRange.setDate(dateRange.getDate() - 1);
        break;
      case '7d':
        dateRange.setDate(dateRange.getDate() - 7);
        break;
      case '30d':
        dateRange.setDate(dateRange.getDate() - 30);
        break;
      case '90d':
        dateRange.setDate(dateRange.getDate() - 90);
        break;
      default:
        dateRange.setDate(dateRange.getDate() - 7);
    }

    const analytics = await Analytics.find({
      userId,
      timestamp: { $gte: dateRange }
    }).sort({ timestamp: -1 });

    const metrics = {
      subscribers: Math.floor(Math.random() * 1000) + 500,
      engagement: Math.floor(Math.random() * 100) + 20,
      contentViews: Math.floor(Math.random() * 5000) + 1000,
      traffic: Math.floor(Math.random() * 10000) + 2000,
      conversionRate: (Math.random() * 5 + 2).toFixed(2),
      revenue: Math.floor(Math.random() * 50000) + 10000
    };

    res.json({
      metrics,
      analytics,
      dateRange: {
        start: dateRange.toISOString(),
        end: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Analytics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/content/schedule', authenticateToken, async (req, res) => {
  try {
    const schedules = await Content.find({ userId: req.user._id })
      .sort({ scheduledDate: -1 });
    res.json(schedules);
  } catch (error) {
    logger.error('Content schedule fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch content schedules' });
  }
});

app.post('/api/content/schedule', authenticateToken, [
  body('title').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 }),
  body('scheduledDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, scheduledDate, tags } = req.body;

    const contentItem = new Content({
      userId: req.user._id,
      title,
      content,
      scheduledDate: new Date(scheduledDate),
      tags: tags || [],
      status: 'scheduled'
    });

    await contentItem.save();

    logger.info(`Content scheduled: ${req.user.email} - ${title}`);
    res.status(201).json(contentItem);
  } catch (error) {
    logger.error('Content scheduling error:', error);
    res.status(500).json({ error: 'Failed to schedule content' });
  }
});

app.get('/api/privacy/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('privacySettings');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.privacySettings || {
      dataProcessing: true,
      marketingEmails: false,
      analyticsTracking: true,
      cookieConsent: true
    });
  } catch (error) {
    logger.error('Privacy settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch privacy settings' });
  }
});

app.put('/api/privacy/settings', authenticateToken, async (req, res) => {
  try {
    const { dataProcessing, marketingEmails, analyticsTracking, cookieConsent } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        privacySettings: {
          dataProcessing: dataProcessing !== undefined ? dataProcessing : true,
          marketingEmails: marketingEmails !== undefined ? marketingEmails : false,
          analyticsTracking: analyticsTracking !== undefined ? analyticsTracking : true,
          cookieConsent: cookieConsent !== undefined ? cookieConsent : true
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Privacy settings updated: ${req.user.email}`);
    res.json(user.privacySettings);
  } catch (error) {
    logger.error('Privacy settings update error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Only start server if this file is run directly, not when imported in tests
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;