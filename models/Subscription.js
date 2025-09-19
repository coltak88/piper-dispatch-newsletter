const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'suspended', 'pending'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    default: function() {
      const pricing = {
        basic: 9.99,
        premium: 29.99,
        enterprise: 99.99
      };
      return pricing[this.plan] || 9.99;
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    default: function() {
      const nextDate = new Date(this.startDate);
      switch (this.billingCycle) {
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          nextDate.setMonth(nextDate.getMonth() + 1);
      }
      return nextDate;
    }
  },
  features: {
    newsletterTemplates: { type: Boolean, default: true },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    unlimitedSubscribers: { type: Boolean, default: false },
    teamCollaboration: { type: Boolean, default: false },
    advancedAutomation: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false }
  },
  usage: {
    newslettersSent: { type: Number, default: 0 },
    subscribers: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  limits: {
    maxNewsletters: { type: Number, default: 10 },
    maxSubscribers: { type: Number, default: 1000 },
    maxStorage: { type: Number, default: 104857600 }
  },
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: String,
    paymentDate: Date,
    transactionId: String,
    paymentMethod: String
  }],
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'admin', 'system']
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  trialEndsAt: {
    type: Date,
    default: function() {
      const trialEnd = new Date(this.startDate);
      trialEnd.setDate(trialEnd.getDate() + 14);
      return trialEnd;
    }
  },
  isTrial: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ endDate: 1 });

subscriptionSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

subscriptionSchema.methods.isInTrial = function() {
  return this.isTrial && this.trialEndsAt > new Date();
};

subscriptionSchema.methods.canSendNewsletter = function() {
  if (this.status !== 'active') return false;
  if (this.isInTrial()) return true;
  return this.usage.newslettersSent < this.limits.maxNewsletters;
};

subscriptionSchema.methods.incrementUsage = function(type, amount = 1) {
  if (type === 'newsletters') {
    this.usage.newslettersSent += amount;
  } else if (type === 'subscribers') {
    this.usage.subscribers += amount;
  }
  return this.save();
};

subscriptionSchema.methods.resetUsage = function() {
  this.usage.newslettersSent = 0;
  this.usage.lastReset = new Date();
  return this.save();
};

subscriptionSchema.statics.findActiveSubscription = function(userId) {
  return this.findOne({
    userId,
    status: 'active',
    endDate: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

subscriptionSchema.statics.findExpiringSubscriptions = function(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  return this.find({
    status: 'active',
    endDate: { $lte: cutoffDate },
    autoRenew: true
  });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);