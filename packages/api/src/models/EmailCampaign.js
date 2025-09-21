const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  template: {
    type: String,
    default: 'default'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'],
    default: 'draft',
    index: true
  },
  recipients: {
    type: [{
      subscriberId: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      firstName: String,
      lastName: String,
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'bounced', 'opened', 'clicked'],
        default: 'pending'
      },
      sentAt: Date,
      openedAt: Date,
      clickedAt: Date,
      bounceReason: String
    }],
    default: []
  },
  segment: {
    type: {
      type: String,
      enum: ['all', 'tag', 'custom'],
      default: 'all'
    },
    criteria: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  tracking: {
    trackOpens: {
      type: Boolean,
      default: true
    },
    trackClicks: {
      type: Boolean,
      default: true
    },
    trackUnsubscribes: {
      type: Boolean,
      default: true
    }
  },
  settings: {
    fromName: {
      type: String,
      default: 'Piper Newsletter'
    },
    fromEmail: {
      type: String,
      required: true
    },
    replyTo: String,
    sendAt: Date,
    batchSize: {
      type: Number,
      default: 100
    },
    delayBetweenBatches: {
      type: Number,
      default: 60 // seconds
    }
  },
  scheduledDate: {
    type: Date,
    index: true
  },
  sentDate: Date,
  completedDate: Date,
  stats: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    },
    spamComplaints: {
      type: Number,
      default: 0
    },
    openRate: {
      type: Number,
      default: 0
    },
    clickRate: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
emailCampaignSchema.index({ userId: 1, status: 1 });
emailCampaignSchema.index({ userId: 1, createdAt: -1 });
emailCampaignSchema.index({ status: 1, scheduledDate: 1 });
emailCampaignSchema.index({ 'recipients.subscriberId': 1 });
emailCampaignSchema.index({ tags: 1 });

// Virtual for campaign performance summary
emailCampaignSchema.virtual('performance').get(function() {
  const total = this.stats.totalRecipients;
  if (total === 0) return { openRate: 0, clickRate: 0, clickThroughRate: 0 };

  return {
    openRate: ((this.stats.opened / total) * 100).toFixed(2),
    clickRate: ((this.stats.clicked / total) * 100).toFixed(2),
    clickThroughRate: this.stats.opened > 0 ? ((this.stats.clicked / this.stats.opened) * 100).toFixed(2) : 0
  };
});

// Pre-save middleware to update stats
emailCampaignSchema.pre('save', function(next) {
  if (this.isModified('recipients')) {
    this.stats.totalRecipients = this.recipients.length;
    this.stats.sent = this.recipients.filter(r => r.status === 'sent').length;
    this.stats.opened = this.recipients.filter(r => r.openedAt).length;
    this.stats.clicked = this.recipients.filter(r => r.clickedAt).length;
  }
  next();
});

const EmailCampaign = mongoose.model('EmailCampaign', emailCampaignSchema);

module.exports = EmailCampaign;