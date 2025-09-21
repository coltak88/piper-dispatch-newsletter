const mongoose = require('mongoose');

const emailOpenSchema = new mongoose.Schema({
  email_id: {
    type: String,
    required: true,
    index: true
  },
  subscriber_id: {
    type: String,
    required: true,
    index: true
  },
  campaign_id: {
    type: String,
    required: true,
    index: true
  },
  ip_address: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    required: true
  },
  device_type: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'other'],
    default: 'other'
  },
  opened_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const emailClickSchema = new mongoose.Schema({
  email_id: {
    type: String,
    required: true,
    index: true
  },
  subscriber_id: {
    type: String,
    required: true,
    index: true
  },
  campaign_id: {
    type: String,
    required: true,
    index: true
  },
  link_url: {
    type: String,
    required: true
  },
  link_id: {
    type: String,
    required: true
  },
  ip_address: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    required: true
  },
  device_type: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'other'],
    default: 'other'
  },
  utm_source: {
    type: String,
    default: null
  },
  utm_medium: {
    type: String,
    default: null
  },
  utm_campaign: {
    type: String,
    default: null
  },
  clicked_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const emailUnsubscribeSchema = new mongoose.Schema({
  email_id: {
    type: String,
    required: true,
    index: true
  },
  subscriber_id: {
    type: String,
    required: true,
    index: true
  },
  campaign_id: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    default: null
  },
  ip_address: {
    type: String,
    required: true
  },
  unsubscribed_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const spamComplaintSchema = new mongoose.Schema({
  email_id: {
    type: String,
    required: true,
    index: true
  },
  subscriber_id: {
    type: String,
    required: true,
    index: true
  },
  campaign_id: {
    type: String,
    required: true,
    index: true
  },
  complaint_type: {
    type: String,
    enum: ['spam', 'abuse', 'other'],
    default: 'spam'
  },
  feedback: {
    type: String,
    default: null
  },
  ip_address: {
    type: String,
    required: true
  },
  complained_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Create compound indexes for efficient queries
emailOpenSchema.index({ campaign_id: 1, subscriber_id: 1 });
emailOpenSchema.index({ email_id: 1, subscriber_id: 1 });
emailClickSchema.index({ campaign_id: 1, subscriber_id: 1 });
emailClickSchema.index({ email_id: 1, subscriber_id: 1 });
emailUnsubscribeSchema.index({ campaign_id: 1, subscriber_id: 1 });
spamComplaintSchema.index({ campaign_id: 1, subscriber_id: 1 });

const EmailOpen = mongoose.model('EmailOpen', emailOpenSchema);
const EmailClick = mongoose.model('EmailClick', emailClickSchema);
const EmailUnsubscribe = mongoose.model('EmailUnsubscribe', emailUnsubscribeSchema);
const SpamComplaint = mongoose.model('SpamComplaint', spamComplaintSchema);

module.exports = {
  EmailOpen,
  EmailClick,
  EmailUnsubscribe,
  SpamComplaint
};