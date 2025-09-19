const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    index: true
  },
  type: {
    type: String,
    enum: ['newsletter', 'website', 'social', 'email', 'campaign', 'general'],
    default: 'general'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metrics: {
    pageViews: {
      type: Number,
      default: 0,
      min: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
      min: 0
    },
    bounceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageSessionDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clickThroughRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    openRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    unsubscribeRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    socialShares: {
      type: Number,
      default: 0,
      min: 0
    },
    comments: {
      type: Number,
      default: 0,
      min: 0
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0
    },
    transactions: {
      type: Number,
      default: 0,
      min: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  traffic: {
    organic: {
      type: Number,
      default: 0,
      min: 0
    },
    paid: {
      type: Number,
      default: 0,
      min: 0
    },
    social: {
      type: Number,
      default: 0,
      min: 0
    },
    direct: {
      type: Number,
      default: 0,
      min: 0
    },
    referral: {
      type: Number,
      default: 0,
      min: 0
    },
    email: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  demographics: {
    ageGroups: {
      '18-24': { type: Number, default: 0 },
      '25-34': { type: Number, default: 0 },
      '35-44': { type: Number, default: 0 },
      '45-54': { type: Number, default: 0 },
      '55-64': { type: Number, default: 0 },
      '65+': { type: Number, default: 0 }
    },
    gender: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      unknown: { type: Number, default: 0 }
    },
    countries: [{
      country: String,
      count: { type: Number, default: 0 }
    }],
    devices: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    },
    browsers: [{
      browser: String,
      count: { type: Number, default: 0 }
    }]
  },
  neurodiversityMetrics: {
    adhdFriendlyViews: {
      type: Number,
      default: 0,
      min: 0
    },
    dyslexiaFriendlyViews: {
      type: Number,
      default: 0,
      min: 0
    },
    autismFriendlyViews: {
      type: Number,
      default: 0,
      min: 0
    },
    neurodiversityEngagement: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    accessibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  emailMetrics: {
    sent: {
      type: Number,
      default: 0,
      min: 0
    },
    delivered: {
      type: Number,
      default: 0,
      min: 0
    },
    bounced: {
      type: Number,
      default: 0,
      min: 0
    },
    opened: {
      type: Number,
      default: 0,
      min: 0
    },
    clicked: {
      type: Number,
      default: 0,
      min: 0
    },
    unsubscribed: {
      type: Number,
      default: 0,
      min: 0
    },
    complained: {
      type: Number,
      default: 0,
      min: 0
    },
    listSize: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  performance: {
    pageLoadTime: {
      type: Number,
      default: 0,
      min: 0
    },
    serverResponseTime: {
      type: Number,
      default: 0,
      min: 0
    },
    errorRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    uptime: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  privacyMetrics: {
    gdprCompliantViews: {
      type: Number,
      default: 0,
      min: 0
    },
    consentGiven: {
      type: Number,
      default: 0,
      min: 0
    },
    consentWithdrawn: {
      type: Number,
      default: 0,
      min: 0
    },
    dataRequests: {
      type: Number,
      default: 0,
      min: 0
    },
    dataDeletions: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  customMetrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

analyticsSchema.index({ userId: 1, timestamp: 1 });
analyticsSchema.index({ contentId: 1, timestamp: 1 });
analyticsSchema.index({ type: 1, timestamp: 1 });
analyticsSchema.index({ 'metrics.pageViews': 1 });
analyticsSchema.index({ 'metrics.conversionRate': 1 });

analyticsSchema.virtual('engagementScore').get(function() {
  const baseScore = (
    (this.metrics.averageSessionDuration / 300) * 0.3 +
    ((100 - this.metrics.bounceRate) / 100) * 0.3 +
    (this.metrics.conversionRate / 10) * 0.4
  ) * 100;
  
  return Math.min(Math.max(baseScore, 0), 100);
});

analyticsSchema.virtual('emailDeliverabilityRate').get(function() {
  if (this.emailMetrics.sent === 0) return 0;
  return (this.emailMetrics.delivered / this.emailMetrics.sent * 100).toFixed(2);
});

analyticsSchema.virtual('emailEngagementRate').get(function() {
  if (this.emailMetrics.delivered === 0) return 0;
  return (this.emailMetrics.clicked / this.emailMetrics.delivered * 100).toFixed(2);
});

analyticsSchema.methods.incrementMetric = function(metric, value = 1) {
  const path = metric.split('.');
  let current = this;
  
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }
  
  if (typeof current[path[path.length - 1]] === 'number') {
    current[path[path.length - 1]] += value;
  }
  
  return this.save();
};

analyticsSchema.methods.addCustomMetric = function(key, value) {
  this.customMetrics.set(key, value);
  return this.save();
};

analyticsSchema.statics.getDailyStats = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    userId,
    timestamp: { $gte: startOfDay, $lte: endOfDay }
  });
};

analyticsSchema.statics.getMonthlyStats = function(userId, year, month) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        totalPageViews: { $sum: '$metrics.pageViews' },
        totalUniqueVisitors: { $sum: '$metrics.uniqueVisitors' },
        totalRevenue: { $sum: '$metrics.revenue' },
        totalTransactions: { $sum: '$metrics.transactions' },
        averageConversionRate: { $avg: '$metrics.conversionRate' },
        averageBounceRate: { $avg: '$metrics.bounceRate' },
        averageSessionDuration: { $avg: '$metrics.averageSessionDuration' }
      }
    }
  ]);
};

analyticsSchema.statics.getTopPerformingContent = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ 'metrics.pageViews': -1 })
    .limit(limit)
    .populate('contentId');
};

analyticsSchema.statics.getConversionFunnel = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: '$metrics.uniqueVisitors' },
        totalPageViews: { $sum: '$metrics.pageViews' },
        totalConversions: { $sum: '$metrics.transactions' },
        totalRevenue: { $sum: '$metrics.revenue' },
        averageConversionRate: { $avg: '$metrics.conversionRate' }
      }
    }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);