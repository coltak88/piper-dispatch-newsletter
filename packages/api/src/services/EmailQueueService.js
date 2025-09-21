const cron = require('node-cron');
const winston = require('winston');
const EmailCampaign = require('../models/EmailCampaign');
const EmailTrackingService = require('./EmailTrackingService');
const MonitoringService = require('./MonitoringService');
const { createTransport } = require('nodemailer');

/**
 * Service for processing email campaigns and managing email queues
 */
class EmailQueueService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'EmailQueueService' },
      transports: [
        new winston.transports.File({ filename: 'logs/email-queue.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
      ]
    });

    this.monitoringService = new MonitoringService();
    this.transporter = null;
    this.isProcessing = false;
    this.currentJob = null;
    
    this.initializeTransporter();
    this.setupScheduledTasks();
  }

  /**
   * Initialize email transporter with SMTP configuration
   */
  initializeTransporter() {
    try {
      this.transporter = createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 10
      });

      this.logger.info('Email transporter initialized');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
    }
  }

  /**
   * Setup scheduled tasks for email processing
   */
  setupScheduledTasks() {
    // Process email queue every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.processEmailQueue();
    });

    // Update campaign statistics every hour
    cron.schedule('0 * * * *', () => {
      this.updateCampaignStatistics();
    });

    // Clean up old campaigns daily at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldCampaigns();
    });

    this.logger.info('Scheduled email tasks configured');
  }

  /**
   * Process email queue - send scheduled campaigns
   */
  async processEmailQueue() {
    if (this.isProcessing) {
      this.logger.info('Email queue processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    this.logger.info('Starting email queue processing...');
    const startTime = Date.now();

    try {
      // Find campaigns ready to be sent
      const campaigns = await EmailCampaign.find({
        status: 'scheduled',
        scheduledDate: { $lte: new Date() },
        'stats.recipients': { $gt: 0 }
      }).populate('userId', 'email firstName lastName');

      this.logger.info(`Found ${campaigns.length} campaigns ready to send`);
      
      // Update email queue size metric
      this.monitoringService.updateEmailQueueSize(campaigns.length);

      for (const campaign of campaigns) {
        try {
          await this.sendCampaign(campaign);
        } catch (error) {
          this.logger.error(`Failed to send campaign ${campaign._id}:`, error);
          
          // Track error in monitoring
          this.monitoringService.trackSecurityEvent('email_campaign_failed', 'error');
          
          // Update campaign status to failed
          await EmailCampaign.findByIdAndUpdate(campaign._id, {
            status: 'failed',
            'stats.error': error.message
          });
        }
      }

      this.logger.info('Email queue processing completed');
      
      // Track performance
      const duration = Date.now() - startTime;
      this.monitoringService.trackApiPerformance('/email/queue/process', 'POST', duration);
    } catch (error) {
      this.logger.error('Error processing email queue:', error);
      this.monitoringService.trackSecurityEvent('email_queue_error', 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send individual campaign
   */
  async sendCampaign(campaign) {
    this.logger.info(`Sending campaign: ${campaign.name} (${campaign._id})`);
    
    const startTime = Date.now();
    let sentCount = 0;
    let failedCount = 0;

    try {
      // Update campaign status to sending
      await EmailCampaign.findByIdAndUpdate(campaign._id, {
        status: 'sending',
        'stats.sentAt': new Date()
      });

      // Process recipients in batches
      const batchSize = 50;
      const recipients = campaign.recipients;
      
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        // Send batch of emails
        const batchResults = await this.sendBatchEmails(campaign, batch);
        sentCount += batchResults.sent;
        failedCount += batchResults.failed;
        
        // Update progress
        const progress = Math.round(((i + batch.length) / recipients.length) * 100);
        await EmailCampaign.findByIdAndUpdate(campaign._id, {
          'stats.progress': progress
        });
        
        this.logger.info(`Campaign ${campaign._id} progress: ${progress}%`);
        
        // Small delay between batches to avoid rate limiting
        await this.delay(1000);
      }

      const duration = Date.now() - startTime;
      
      // Update campaign status and statistics
      await EmailCampaign.findByIdAndUpdate(campaign._id, {
        status: 'sent',
        'stats.sent': sentCount,
        'stats.failed': failedCount,
        'stats.duration': duration,
        'stats.progress': 100
      });

      this.logger.info(`Campaign ${campaign._id} completed: ${sentCount} sent, ${failedCount} failed in ${duration}ms`);
      
      // Track newsletter metrics
      this.monitoringService.incrementNewsletterSent(campaign.template || 'default', 'sent');
      this.monitoringService.trackApiPerformance(`/email/campaign/${campaign._id}/send`, 'POST', duration);
      
      // Track error rate if there are failures
      if (failedCount > 0) {
        const errorRate = (failedCount / (sentCount + failedCount)) * 100;
        this.monitoringService.updateErrorRate('email_send', errorRate);
      }
    } catch (error) {
      this.logger.error(`Error sending campaign ${campaign._id}:`, error);
      
      // Track error in monitoring
      this.monitoringService.trackSecurityEvent('email_campaign_send_failed', 'error');
      this.monitoringService.updateErrorRate('email_campaign', 100);
      
      // Update campaign status to failed
      await EmailCampaign.findByIdAndUpdate(campaign._id, {
        status: 'failed',
        'stats.error': error.message
      });
      
      throw error;
    }
  }

  /**
   * Send batch of emails
   */
  async sendBatchEmails(campaign, recipients) {
    let sent = 0;
    let failed = 0;

    const emailPromises = recipients.map(async (recipient) => {
      try {
        await this.sendIndividualEmail(campaign, recipient);
        sent++;
        return { success: true };
      } catch (error) {
        failed++;
        this.logger.error(`Failed to send email to ${recipient.email}:`, error);
        return { success: false, error: error.message };
      }
    });

    await Promise.allSettled(emailPromises);
    
    return { sent, failed };
  }

  /**
   * Send individual email
   */
  async sendIndividualEmail(campaign, recipient) {
    const startTime = Date.now();
    
    try {
      // Generate tracking URLs
      const trackingPixelUrl = EmailTrackingService.generateTrackingPixelUrl(campaign._id, recipient.email);
      const unsubscribeUrl = EmailTrackingService.generateUnsubscribeUrl(campaign._id, recipient.email);
      
      // Replace placeholders in email content
      let emailContent = campaign.content;
      
      // Personalization
      emailContent = emailContent.replace(/\{\{firstName\}\}/g, recipient.firstName || '');
      emailContent = emailContent.replace(/\{\{lastName\}\}/g, recipient.lastName || '');
      emailContent = emailContent.replace(/\{\{email\}\}/g, recipient.email || '');
      
      // Add tracking pixel
      const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" border="0" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
      emailContent = emailContent.replace('</body>', `${trackingPixel}</body>`);
      
      // Add unsubscribe link if not already present
      if (!emailContent.includes('{{unsubscribeUrl}}')) {
        emailContent = emailContent.replace('</body>', `<p style="font-size:12px;color:#666;"><a href="${unsubscribeUrl}">Unsubscribe</a></p></body>`);
      } else {
        emailContent = emailContent.replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl);
      }

      // Email options
      const mailOptions = {
        from: {
          name: campaign.fromName || 'Piper Newsletter',
          address: campaign.fromEmail || process.env.FROM_EMAIL || 'newsletter@piper.com'
        },
        to: recipient.email,
        subject: campaign.subject,
        html: emailContent,
        replyTo: campaign.replyTo || process.env.REPLY_TO_EMAIL
      };

      // Send email
      await this.transporter.sendMail(mailOptions);
      
      const duration = Date.now() - startTime;
      this.logger.info(`Email sent to ${recipient.email} for campaign ${campaign._id}`);
      
      // Track successful email send
      this.monitoringService.trackApiPerformance('/email/individual/send', 'POST', duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to send email to ${recipient.email} for campaign ${campaign._id}:`, error);
      
      // Track failed email send
      this.monitoringService.trackSecurityEvent('individual_email_send_failed', 'error');
      this.monitoringService.trackApiPerformance('/email/individual/send', 'POST', duration);
      
      throw error;
    }
  }

  /**
   * Update campaign statistics
   */
  async updateCampaignStatistics() {
    const startTime = Date.now();
    let updatedCount = 0;
    let errorCount = 0;

    try {
      const campaigns = await EmailCampaign.find({
        status: 'sent',
        'stats.updatedAt': { $lt: new Date(Date.now() - 60 * 60 * 1000) } // Update if older than 1 hour
      });

      for (const campaign of campaigns) {
        try {
          const stats = await EmailTrackingService.getCampaignStats(campaign._id);
          
          await EmailCampaign.findByIdAndUpdate(campaign._id, {
            'stats.opens': stats.opens,
            'stats.clicks': stats.clicks,
            'stats.unsubscribes': stats.unsubscribes,
            'stats.spamComplaints': stats.spamComplaints,
            'stats.openRate': stats.openRate,
            'stats.clickRate': stats.clickRate,
            'stats.updatedAt': new Date()
          });
          
          updatedCount++;
          this.logger.info(`Updated statistics for campaign ${campaign._id}`);
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to update statistics for campaign ${campaign._id}:`, error);
        }
      }
      
      const duration = Date.now() - startTime;
      this.logger.info(`Campaign statistics update completed: ${updatedCount} updated, ${errorCount} errors in ${duration}ms`);
      
      // Track performance and metrics
      this.monitoringService.trackApiPerformance('/email/statistics/update', 'PUT', duration);
      
      // Track error rate if there are errors
      const totalAttempts = updatedCount + errorCount;
      if (totalAttempts > 0 && errorCount > 0) {
        const errorRate = (errorCount / totalAttempts) * 100;
        this.monitoringService.updateErrorRate('email_statistics_update', errorRate);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Error updating campaign statistics:', error);
      
      // Track error in monitoring
      this.monitoringService.trackSecurityEvent('email_statistics_update_failed', 'error');
      this.monitoringService.trackApiPerformance('/email/statistics/update', 'PUT', duration);
    }
  }

  /**
   * Cleanup old campaigns (soft delete)
   */
  async cleanupOldCampaigns() {
    const startTime = Date.now();
    
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await EmailCampaign.updateMany(
        {
          status: 'sent',
          'stats.sentAt': { $lt: thirtyDaysAgo },
          isDeleted: false
        },
        {
          isDeleted: true,
          'stats.deletedAt': new Date()
        }
      );
      
      const duration = Date.now() - startTime;
      this.logger.info(`Cleaned up ${result.modifiedCount} old campaigns`);
      
      // Track cleanup metrics
      this.monitoringService.trackApiPerformance('/email/cleanup', 'DELETE', duration);
      
      // Track number of campaigns cleaned up as a metric
      if (result.modifiedCount > 0) {
        this.monitoringService.trackSecurityEvent('email_campaign_cleanup', 'info');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Error cleaning up old campaigns:', error);
      
      // Track error in monitoring
      this.monitoringService.trackSecurityEvent('email_cleanup_failed', 'error');
      this.monitoringService.trackApiPerformance('/email/cleanup', 'DELETE', duration);
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      isProcessing: this.isProcessing,
      currentJob: this.currentJob,
      timestamp: new Date()
    };
  }

  /**
   * Utility function to create delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop the service
   */
  async stop() {
    this.logger.info('Stopping EmailQueueService...');
    
    if (this.transporter) {
      await this.transporter.close();
    }
    
    this.logger.info('EmailQueueService stopped');
  }
}

module.exports = new EmailQueueService();