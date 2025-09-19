const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000
  },
  type: {
    type: String,
    enum: ['newsletter', 'blog', 'article', 'email', 'social', 'webinar', 'other'],
    default: 'newsletter'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  scheduledDate: {
    type: Date,
    index: true
  },
  publishedDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  categories: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  targetAudience: {
    type: String,
    enum: ['general', 'adhd', 'dyslexia', 'autism', 'neurodiverse', 'custom'],
    default: 'general'
  },
  accessibility: {
    readabilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    readingTime: {
      type: Number,
      min: 0
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    contrast: {
      type: String,
      enum: ['normal', 'high', 'dark'],
      default: 'normal'
    },
    textToSpeech: {
      type: Boolean,
      default: false
    },
    neurodiversityOptimized: {
      type: Boolean,
      default: false
    }
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: 60,
      trim: true
    },
    metaDescription: {
      type: String,
      maxlength: 160,
      trim: true
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
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
    bounceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastEngagement: {
      type: Date
    }
  },
  recipients: {
    total: {
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
    bounced: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  images: [{
    url: String,
    alt: String,
    caption: String,
    width: Number,
    height: Number
  }],
  links: [{
    url: String,
    text: String,
    clicks: { type: Number, default: 0 }
  }],
  version: {
    type: Number,
    default: 1
  },
  parentContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: {
    type: String,
    enum: ['newsletter', 'announcement', 'promotional', 'educational', 'welcome', 'other'],
    default: 'newsletter'
  },
  compliance: {
    gdprCompliant: {
      type: Boolean,
      default: true
    },
    canSpamCompliant: {
      type: Boolean,
      default: true
    },
    privacyPolicy: {
      type: Boolean,
      default: true
    },
    unsubscribeLink: {
      type: Boolean,
      default: true
    }
  },
  collaboration: {
    editors: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permissions: {
        type: String,
        enum: ['view', 'edit', 'admin'],
        default: 'edit'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isLocked: {
      type: Boolean,
      default: false
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lockedAt: {
      type: Date
    }
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    model: String,
    prompt: String,
    temperature: Number,
    tokens: Number
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

contentSchema.index({ userId: 1, status: 1 });
contentSchema.index({ scheduledDate: 1 });
contentSchema.index({ publishedDate: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ categories: 1 });
contentSchema.index({ 'seo.slug': 1 });
contentSchema.index({ targetAudience: 1 });

contentSchema.virtual('isPublished').get(function() {
  return this.status === 'published';
});

contentSchema.virtual('isScheduled').get(function() {
  return this.status === 'scheduled' && this.scheduledDate > new Date();
});

contentSchema.virtual('isOverdue').get(function() {
  return this.status === 'scheduled' && this.scheduledDate < new Date();
});

contentSchema.virtual('engagementRate').get(function() {
  if (this.analytics.views === 0) return 0;
  return ((this.analytics.likes + this.analytics.shares + this.analytics.comments) / this.analytics.views * 100).toFixed(2);
});

contentSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedDate = new Date();
  return this.save();
};

contentSchema.methods.schedule = function(scheduledDate) {
  this.status = 'scheduled';
  this.scheduledDate = scheduledDate;
  return this.save();
};

contentSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

contentSchema.methods.incrementAnalytics = function(metric, amount = 1) {
  if (this.analytics[metric] !== undefined) {
    this.analytics[metric] += amount;
    this.analytics.lastEngagement = new Date();
  }
  return this.save();
};

contentSchema.methods.addTag = function(tag) {
  const cleanTag = tag.toLowerCase().trim();
  if (!this.tags.includes(cleanTag)) {
    this.tags.push(cleanTag);
  }
  return this.save();
};

contentSchema.methods.removeTag = function(tag) {
  const cleanTag = tag.toLowerCase().trim();
  this.tags = this.tags.filter(t => t !== cleanTag);
  return this.save();
};

contentSchema.methods.lockForEditing = function(userId) {
  if (this.collaboration.isLocked && this.collaboration.lockedBy.toString() !== userId.toString()) {
    throw new Error('Content is currently being edited by another user');
  }

  this.collaboration.isLocked = true;
  this.collaboration.lockedBy = userId;
  this.collaboration.lockedAt = new Date();
  return this.save();
};

contentSchema.methods.unlockForEditing = function() {
  this.collaboration.isLocked = false;
  this.collaboration.lockedBy = null;
  this.collaboration.lockedAt = null;
  return this.save();
};

contentSchema.methods.addEditor = function(userId, permissions = 'edit') {
  const existingEditor = this.collaboration.editors.find(e => e.userId.toString() === userId.toString());
  if (existingEditor) {
    existingEditor.permissions = permissions;
  } else {
    this.collaboration.editors.push({ userId, permissions });
  }
  return this.save();
};

contentSchema.methods.removeEditor = function(userId) {
  this.collaboration.editors = this.collaboration.editors.filter(e => e.userId.toString() !== userId.toString());
  return this.save();
};

contentSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

contentSchema.statics.findScheduledForDate = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    status: 'scheduled',
    scheduledDate: { $gte: startOfDay, $lte: endOfDay }
  }).populate('userId');
};

contentSchema.statics.findOverdueScheduled = function() {
  return this.find({
    status: 'scheduled',
    scheduledDate: { $lt: new Date() }
  });
};

contentSchema.statics.getTemplates = function(userId, category = null) {
  const query = { userId, isTemplate: true };
  if (category) {
    query.templateCategory = category;
  }
  return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Content', contentSchema);