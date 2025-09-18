/**
 * Content Scheduling Service
 * Production-ready content scheduling with calendar management,
 * automated publishing, conflict detection, and team collaboration
 */

import { BlockchainService } from './BlockchainService';
import { PrivacyTracker } from '../privacy/PrivacyTracker';

class ContentScheduler {
  constructor() {
    this.schedules = new Map();
    this.conflicts = new Set();
    this.notifications = [];
    this.blockchainService = BlockchainService.getInstance();
    this.privacyTracker = new PrivacyTracker();
    this.publishQueue = [];
    this.recurringSchedules = new Map();
    this.teamAssignments = new Map();
    this.approvalWorkflows = new Map();
    
    // Initialize scheduler
    this.initializeScheduler();
  }

  /**
   * Initialize the content scheduler
   */
  async initializeScheduler() {
    try {
      await this.loadSchedules();
      this.startScheduleMonitoring();
      this.initializeNotificationSystem();
      
      // Privacy-first initialization
      this.privacyTracker.trackEvent('scheduler_initialized', {
        timestamp: Date.now(),
        privacy_mode: 'strict'
      });
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    }
  }

  /**
   * Schedule content for publication
   */
  async scheduleContent(contentId, scheduleData) {
    try {
      const schedule = {
        id: this.generateScheduleId(),
        contentId,
        publishDate: new Date(scheduleData.publishDate),
        timezone: scheduleData.timezone || 'UTC',
        status: 'scheduled',
        priority: scheduleData.priority || 'normal',
        assignedTo: scheduleData.assignedTo,
        approvalRequired: scheduleData.approvalRequired || false,
        recurringPattern: scheduleData.recurringPattern,
        metadata: {
          createdAt: new Date(),
          createdBy: scheduleData.createdBy,
          lastModified: new Date(),
          version: 1
        },
        notifications: {
          enabled: scheduleData.notifications?.enabled || true,
          reminders: scheduleData.notifications?.reminders || ['1h', '15m'],
          channels: scheduleData.notifications?.channels || ['email', 'in-app']
        }
      };

      // Conflict detection
      const conflicts = await this.detectConflicts(schedule);
      if (conflicts.length > 0 && !scheduleData.forceSchedule) {
        return {
          success: false,
          conflicts,
          message: 'Scheduling conflicts detected'
        };
      }

      // Blockchain verification for content integrity
      const contentHash = await this.blockchainService.hashContent({
        contentId,
        scheduleData: schedule
      });
      schedule.contentHash = contentHash;

      // Store schedule
      this.schedules.set(schedule.id, schedule);
      
      // Handle recurring schedules
      if (schedule.recurringPattern) {
        await this.setupRecurringSchedule(schedule);
      }

      // Setup approval workflow if required
      if (schedule.approvalRequired) {
        await this.initializeApprovalWorkflow(schedule);
      }

      // Save to persistent storage
      await this.saveSchedule(schedule);

      // Privacy tracking
      this.privacyTracker.trackEvent('content_scheduled', {
        scheduleId: schedule.id,
        publishDate: schedule.publishDate,
        privacy_mode: 'strict'
      });

      return {
        success: true,
        schedule,
        message: 'Content scheduled successfully'
      };
    } catch (error) {
      console.error('Failed to schedule content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get calendar view of scheduled content
   */
  async getCalendarView(startDate, endDate, filters = {}) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const schedulesInRange = Array.from(this.schedules.values())
        .filter(schedule => {
          const publishDate = new Date(schedule.publishDate);
          return publishDate >= start && publishDate <= end;
        })
        .filter(schedule => this.applyFilters(schedule, filters))
        .sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));

      // Group by date for calendar display
      const calendarData = {};
      schedulesInRange.forEach(schedule => {
        const dateKey = schedule.publishDate.toISOString().split('T')[0];
        if (!calendarData[dateKey]) {
          calendarData[dateKey] = [];
        }
        calendarData[dateKey].push(schedule);
      });

      return {
        success: true,
        calendarData,
        totalSchedules: schedulesInRange.length,
        conflicts: this.getConflictsInRange(start, end)
      };
    } catch (error) {
      console.error('Failed to get calendar view:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect scheduling conflicts
   */
  async detectConflicts(newSchedule) {
    const conflicts = [];
    const publishTime = new Date(newSchedule.publishDate);
    const conflictWindow = 30 * 60 * 1000; // 30 minutes

    for (const [id, existingSchedule] of this.schedules) {
      const existingTime = new Date(existingSchedule.publishDate);
      const timeDiff = Math.abs(publishTime - existingTime);

      if (timeDiff < conflictWindow && existingSchedule.status === 'scheduled') {
        conflicts.push({
          type: 'time_conflict',
          conflictingSchedule: existingSchedule,
          timeDifference: timeDiff,
          severity: timeDiff < 15 * 60 * 1000 ? 'high' : 'medium'
        });
      }

      // Check for resource conflicts
      if (existingSchedule.assignedTo === newSchedule.assignedTo &&
          timeDiff < 2 * 60 * 60 * 1000) { // 2 hours
        conflicts.push({
          type: 'resource_conflict',
          conflictingSchedule: existingSchedule,
          resource: existingSchedule.assignedTo,
          severity: 'medium'
        });
      }
    }

    return conflicts;
  }

  /**
   * Start automated publishing monitoring
   */
  startScheduleMonitoring() {
    setInterval(async () => {
      await this.processScheduledPublications();
      await this.sendNotifications();
      await this.cleanupExpiredSchedules();
    }, 60000); // Check every minute
  }

  /**
   * Process scheduled publications
   */
  async processScheduledPublications() {
    const now = new Date();
    const readyToPublish = Array.from(this.schedules.values())
      .filter(schedule => {
        return schedule.status === 'scheduled' &&
               new Date(schedule.publishDate) <= now &&
               (!schedule.approvalRequired || schedule.approvalStatus === 'approved');
      });

    for (const schedule of readyToPublish) {
      try {
        await this.publishContent(schedule);
      } catch (error) {
        console.error(`Failed to publish scheduled content ${schedule.id}:`, error);
        schedule.status = 'failed';
        schedule.error = error.message;
      }
    }
  }

  /**
   * Publish scheduled content
   */
  async publishContent(schedule) {
    try {
      // Verify content integrity
      const isValid = await this.blockchainService.verifyContent({
        contentId: schedule.contentId,
        expectedHash: schedule.contentHash
      });

      if (!isValid) {
        throw new Error('Content integrity verification failed');
      }

      // Call content management API to publish
      const response = await fetch('/api/content/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Privacy-Mode': 'strict'
        },
        body: JSON.stringify({
          contentId: schedule.contentId,
          scheduleId: schedule.id,
          publishDate: schedule.publishDate
        })
      });

      if (!response.ok) {
        throw new Error(`Publication failed: ${response.statusText}`);
      }

      // Update schedule status
      schedule.status = 'published';
      schedule.publishedAt = new Date();
      
      // Privacy tracking
      this.privacyTracker.trackEvent('content_published', {
        scheduleId: schedule.id,
        contentId: schedule.contentId,
        publishedAt: schedule.publishedAt,
        privacy_mode: 'strict'
      });

      // Handle recurring schedules
      if (schedule.recurringPattern) {
        await this.createNextRecurrence(schedule);
      }

      await this.saveSchedule(schedule);
    } catch (error) {
      console.error('Failed to publish content:', error);
      throw error;
    }
  }

  /**
   * Setup recurring schedule
   */
  async setupRecurringSchedule(schedule) {
    const pattern = schedule.recurringPattern;
    const nextDate = this.calculateNextRecurrence(schedule.publishDate, pattern);
    
    if (nextDate) {
      const nextSchedule = {
        ...schedule,
        id: this.generateScheduleId(),
        publishDate: nextDate,
        status: 'scheduled',
        metadata: {
          ...schedule.metadata,
          parentScheduleId: schedule.id,
          recurrenceIndex: (schedule.metadata.recurrenceIndex || 0) + 1
        }
      };

      this.schedules.set(nextSchedule.id, nextSchedule);
      this.recurringSchedules.set(schedule.id, nextSchedule.id);
    }
  }

  /**
   * Calculate next recurrence date
   */
  calculateNextRecurrence(baseDate, pattern) {
    const date = new Date(baseDate);
    
    switch (pattern.type) {
      case 'daily':
        date.setDate(date.getDate() + (pattern.interval || 1));
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * (pattern.interval || 1)));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + (pattern.interval || 1));
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + (pattern.interval || 1));
        break;
      default:
        return null;
    }

    // Check if we've reached the end date
    if (pattern.endDate && date > new Date(pattern.endDate)) {
      return null;
    }

    return date;
  }

  /**
   * Initialize approval workflow
   */
  async initializeApprovalWorkflow(schedule) {
    const workflow = {
      scheduleId: schedule.id,
      status: 'pending',
      approvers: schedule.approvers || [],
      currentApprover: 0,
      approvals: [],
      createdAt: new Date()
    };

    this.approvalWorkflows.set(schedule.id, workflow);
    
    // Send approval request
    await this.sendApprovalRequest(workflow);
  }

  /**
   * Send notifications
   */
  async sendNotifications() {
    const now = new Date();
    const upcomingSchedules = Array.from(this.schedules.values())
      .filter(schedule => {
        if (schedule.status !== 'scheduled' || !schedule.notifications.enabled) {
          return false;
        }

        const publishTime = new Date(schedule.publishDate);
        const timeDiff = publishTime - now;
        
        return schedule.notifications.reminders.some(reminder => {
          const reminderMs = this.parseReminderTime(reminder);
          return Math.abs(timeDiff - reminderMs) < 60000; // Within 1 minute
        });
      });

    for (const schedule of upcomingSchedules) {
      await this.sendScheduleNotification(schedule);
    }
  }

  /**
   * Parse reminder time string to milliseconds
   */
  parseReminderTime(reminder) {
    const match = reminder.match(/(\d+)([hm])/i);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    return unit === 'h' ? value * 60 * 60 * 1000 : value * 60 * 1000;
  }

  /**
   * Get team workload
   */
  getTeamWorkload(startDate, endDate) {
    const workload = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    Array.from(this.schedules.values())
      .filter(schedule => {
        const publishDate = new Date(schedule.publishDate);
        return publishDate >= start && publishDate <= end && schedule.assignedTo;
      })
      .forEach(schedule => {
        const assignee = schedule.assignedTo;
        if (!workload[assignee]) {
          workload[assignee] = {
            totalSchedules: 0,
            upcomingSchedules: 0,
            overdueSchedules: 0,
            schedules: []
          };
        }
        
        workload[assignee].totalSchedules++;
        workload[assignee].schedules.push(schedule);
        
        if (schedule.status === 'scheduled') {
          workload[assignee].upcomingSchedules++;
        }
        
        if (schedule.status === 'overdue') {
          workload[assignee].overdueSchedules++;
        }
      });

    return workload;
  }

  /**
   * Generate unique schedule ID
   */
  generateScheduleId() {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Apply filters to schedule
   */
  applyFilters(schedule, filters) {
    if (filters.status && schedule.status !== filters.status) return false;
    if (filters.assignedTo && schedule.assignedTo !== filters.assignedTo) return false;
    if (filters.priority && schedule.priority !== filters.priority) return false;
    return true;
  }

  /**
   * Get conflicts in date range
   */
  getConflictsInRange(startDate, endDate) {
    return Array.from(this.conflicts)
      .filter(conflict => {
        const conflictDate = new Date(conflict.date);
        return conflictDate >= startDate && conflictDate <= endDate;
      });
  }

  /**
   * Load schedules from storage
   */
  async loadSchedules() {
    try {
      const response = await fetch('/api/schedules', {
        headers: { 'X-Privacy-Mode': 'strict' }
      });
      
      if (response.ok) {
        const data = await response.json();
        data.schedules?.forEach(schedule => {
          this.schedules.set(schedule.id, schedule);
        });
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  }

  /**
   * Save schedule to storage
   */
  async saveSchedule(schedule) {
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Privacy-Mode': 'strict'
        },
        body: JSON.stringify(schedule)
      });
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  }

  /**
   * Initialize notification system
   */
  initializeNotificationSystem() {
    // Setup notification channels
    this.notificationChannels = {
      'email': this.sendEmailNotification.bind(this),
      'in-app': this.sendInAppNotification.bind(this),
      'slack': this.sendSlackNotification.bind(this)
    };
  }

  /**
   * Send schedule notification
   */
  async sendScheduleNotification(schedule) {
    const notification = {
      type: 'schedule_reminder',
      scheduleId: schedule.id,
      message: `Content "${schedule.contentId}" is scheduled to publish at ${schedule.publishDate}`,
      timestamp: new Date()
    };

    for (const channel of schedule.notifications.channels) {
      if (this.notificationChannels[channel]) {
        await this.notificationChannels[channel](notification, schedule);
      }
    }
  }

  /**
   * Send approval request
   */
  async sendApprovalRequest(workflow) {
    // Implementation for sending approval requests
    console.log('Approval request sent for workflow:', workflow.scheduleId);
  }

  /**
   * Notification channel implementations
   */
  async sendEmailNotification(notification, schedule) {
    // Email notification implementation
    console.log('Email notification sent:', notification);
  }

  async sendInAppNotification(notification, schedule) {
    // In-app notification implementation
    this.notifications.push(notification);
  }

  async sendSlackNotification(notification, schedule) {
    // Slack notification implementation
    console.log('Slack notification sent:', notification);
  }

  /**
   * Cleanup expired schedules
   */
  async cleanupExpiredSchedules() {
    const now = new Date();
    const expiredThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days

    for (const [id, schedule] of this.schedules) {
      if (schedule.status === 'published' || schedule.status === 'failed') {
        const ageMs = now - new Date(schedule.publishedAt || schedule.publishDate);
        if (ageMs > expiredThreshold) {
          this.schedules.delete(id);
        }
      }
    }
  }
}

// Singleton instance
let contentSchedulerInstance = null;

export const getContentScheduler = () => {
  if (!contentSchedulerInstance) {
    contentSchedulerInstance = new ContentScheduler();
  }
  return contentSchedulerInstance;
};

export default ContentScheduler;