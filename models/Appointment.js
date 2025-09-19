const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'scheduled',
    index: true
  },
  type: {
    type: String,
    enum: ['meeting', 'call', 'interview', 'consultation', 'webinar', 'other'],
    default: 'meeting'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  meetingLink: {
    type: String,
    trim: true
  },
  participants: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['organizer', 'attendee', 'observer'],
      default: 'attendee'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending'
    },
    responseTime: {
      type: Date
    }
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'popup'],
      required: true
    },
    timeBefore: {
      type: Number,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    }
  }],
  recurrence: {
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: null
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    endDate: {
      type: Date
    },
    occurrences: {
      type: Number
    }
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: {
    type: String,
    maxlength: 2000
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  calendarSync: {
    googleCalendarId: String,
    outlookCalendarId: String,
    lastSync: Date,
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'failed'],
      default: 'pending'
    }
  },
  conflictResolution: {
    hasConflict: {
      type: Boolean,
      default: false
    },
    conflictDetails: [{
      conflictingAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
      },
      conflictType: String,
      suggestedResolution: String
    }]
  }
}, {
  timestamps: true
});

appointmentSchema.index({ userId: 1, startTime: 1 });
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ startTime: 1, endTime: 1 });
appointmentSchema.index({ 'participants.email': 1 });
appointmentSchema.index({ 'calendarSync.googleCalendarId': 1 });
appointmentSchema.index({ 'calendarSync.outlookCalendarId': 1 });

appointmentSchema.virtual('duration').get(function() {
  return this.endTime.getTime() - this.startTime.getTime();
});

appointmentSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date();
});

appointmentSchema.virtual('isPast').get(function() {
  return this.endTime < new Date();
});

appointmentSchema.virtual('isHappeningNow').get(function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now;
});

appointmentSchema.methods.checkConflicts = async function() {
  const conflicts = await this.model('Appointment').find({
    userId: this.userId,
    _id: { $ne: this._id },
    status: { $ne: 'cancelled' },
    $or: [
      {
        startTime: { $lt: this.endTime },
        endTime: { $gt: this.startTime }
      }
    ]
  });

  return conflicts;
};

appointmentSchema.methods.addParticipant = function(email, name = '', role = 'attendee') {
  const existingParticipant = this.participants.find(p => p.email === email);
  if (existingParticipant) {
    throw new Error('Participant already exists');
  }

  this.participants.push({
    email,
    name,
    role,
    status: 'pending'
  });

  return this.save();
};

appointmentSchema.methods.updateParticipantStatus = function(email, status) {
  const participant = this.participants.find(p => p.email === email);
  if (!participant) {
    throw new Error('Participant not found');
  }

  participant.status = status;
  participant.responseTime = new Date();
  return this.save();
};

appointmentSchema.methods.addReminder = function(type, timeBefore) {
  const existingReminder = this.reminders.find(r => r.type === type && r.timeBefore === timeBefore);
  if (existingReminder) {
    throw new Error('Reminder already exists');
  }

  this.reminders.push({
    type,
    timeBefore,
    sent: false
  });

  return this.save();
};

appointmentSchema.methods.sendReminders = async function() {
  const now = new Date();
  const unsentReminders = this.reminders.filter(r => !r.sent);

  for (const reminder of unsentReminders) {
    const reminderTime = new Date(this.startTime.getTime() - reminder.timeBefore);
    if (now >= reminderTime) {
      reminder.sent = true;
      reminder.sentAt = now;
      
      // Here you would integrate with your notification service
      // await sendNotification(this, reminder);
    }
  }

  return this.save();
};

appointmentSchema.statics.findUpcoming = function(userId, limit = 10) {
  return this.find({
    userId,
    startTime: { $gte: new Date() },
    status: { $ne: 'cancelled' }
  })
  .sort({ startTime: 1 })
  .limit(limit);
};

appointmentSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    startTime: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' }
  }).sort({ startTime: 1 });
};

appointmentSchema.statics.getAvailability = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' }
  }).sort({ startTime: 1 });
};

module.exports = mongoose.model('Appointment', appointmentSchema);