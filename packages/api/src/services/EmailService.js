const nodemailer = require('nodemailer');
const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'email-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/email-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/email-combined.log' })
  ]
});

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Configure based on environment
      if (process.env.NODE_ENV === 'production') {
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 20000,
          rateLimit: 5
        });
      } else {
        // Use Ethereal for development
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      // Verify connection
      await this.transporter.verify();
      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      throw error;
    }
  }

  async loadTemplate(templateName, data = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');

      // Replace template variables
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key]);
      });

      return template;
    } catch (error) {
      logger.error(`Failed to load email template: ${templateName}`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@pipernewsletter.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments || []
      };

      if (options.cc) mailOptions.cc = options.cc;
      if (options.bcc) mailOptions.bcc = options.bcc;
      if (options.replyTo) mailOptions.replyTo = options.replyTo;

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${options.to}`);
      return {
        messageId: result.messageId,
        previewURL: nodemailer.getTestMessageUrl(result)
      };
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(userData) {
    try {
      const templateData = {
        userName: userData.name,
        appName: 'Piper Newsletter',
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pipernewsletter.com'
      };

      const html = await this.loadTemplate('welcome', templateData);
      const text = `Welcome to Piper Newsletter, ${userData.name}! We're excited to have you on board.`;

      return await this.sendEmail({
        to: userData.email,
        subject: 'Welcome to Piper Newsletter!',
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send welcome email to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(userData, resetToken) {
    try {
      const templateData = {
        userName: userData.name,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        expiryHours: process.env.PASSWORD_RESET_EXPIRY || '24',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pipernewsletter.com'
      };

      const html = await this.loadTemplate('password-reset', templateData);
      const text = `Click here to reset your password: ${templateData.resetUrl}. This link expires in ${templateData.expiryHours} hours.`;

      return await this.sendEmail({
        to: userData.email,
        subject: 'Reset Your Piper Newsletter Password',
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send password reset email to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendSubscriptionConfirmation(userData, subscriptionData) {
    try {
      const templateData = {
        userName: userData.name,
        planName: subscriptionData.planName,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency,
        billingCycle: subscriptionData.billingCycle,
        nextBillingDate: subscriptionData.nextBillingDate,
        features: subscriptionData.features || []
      };

      const html = await this.loadTemplate('subscription-confirmation', templateData);
      const text = `Thank you for subscribing to ${subscriptionData.planName}! Your subscription is now active.`;

      return await this.sendEmail({
        to: userData.email,
        subject: 'Subscription Confirmation - Piper Newsletter',
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send subscription confirmation to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendPaymentFailedEmail(userData, paymentData) {
    try {
      const templateData = {
        userName: userData.name,
        amount: paymentData.amount,
        currency: paymentData.currency,
        retryUrl: `${process.env.FRONTEND_URL}/billing`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pipernewsletter.com'
      };

      const html = await this.loadTemplate('payment-failed', templateData);
      const text = `Your payment of ${paymentData.amount} ${paymentData.currency} failed. Please update your payment method.`;

      return await this.sendEmail({
        to: userData.email,
        subject: 'Payment Failed - Piper Newsletter',
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send payment failed email to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendAppointmentReminder(userData, appointmentData) {
    try {
      const templateData = {
        userName: userData.name,
        appointmentTitle: appointmentData.title,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        appointmentLocation: appointmentData.location,
        meetingLink: appointmentData.meetingLink,
        timezone: appointmentData.timezone,
        cancelUrl: `${process.env.FRONTEND_URL}/appointments/${appointmentData.id}/cancel`
      };

      const html = await this.loadTemplate('appointment-reminder', templateData);
      const text = `Reminder: You have an appointment "${appointmentData.title}" scheduled for ${appointmentData.date} at ${appointmentData.time}.`;

      return await this.sendEmail({
        to: userData.email,
        subject: `Appointment Reminder: ${appointmentData.title}`,
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send appointment reminder to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendNewsletterDigest(userData, newsletterData) {
    try {
      const templateData = {
        userName: userData.name,
        newsletterTitle: newsletterData.title,
        articles: newsletterData.articles || [],
        readMoreUrl: `${process.env.FRONTEND_URL}/newsletter/${newsletterData.id}`,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?token=${userData.unsubscribeToken}`
      };

      const html = await this.loadTemplate('newsletter-digest', templateData);
      const text = `Your weekly newsletter digest is ready: ${newsletterData.title}`;

      return await this.sendEmail({
        to: userData.email,
        subject: `📧 ${newsletterData.title} - Your Weekly Digest`,
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send newsletter digest to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendTwoFactorCode(userData, code) {
    try {
      const templateData = {
        userName: userData.name,
        code: code,
        expiryMinutes: process.env.TWO_FACTOR_EXPIRY || '10',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pipernewsletter.com'
      };

      const html = await this.loadTemplate('two-factor-code', templateData);
      const text = `Your two-factor authentication code is: ${code}. This code expires in ${templateData.expiryMinutes} minutes.`;

      return await this.sendEmail({
        to: userData.email,
        subject: 'Your Two-Factor Authentication Code',
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send 2FA code to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendSecurityAlert(userData, alertData) {
    try {
      const templateData = {
        userName: userData.name,
        alertType: alertData.type,
        alertDescription: alertData.description,
        timestamp: alertData.timestamp,
        ipAddress: alertData.ipAddress,
        userAgent: alertData.userAgent,
        actionUrl: alertData.actionUrl || `${process.env.FRONTEND_URL}/security`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pipernewsletter.com'
      };

      const html = await this.loadTemplate('security-alert', templateData);
      const text = `Security Alert: ${alertData.type} - ${alertData.description}`;

      return await this.sendEmail({
        to: userData.email,
        subject: `🚨 Security Alert - ${alertData.type}`,
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send security alert to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendAccountSuspendedEmail(userData, suspensionData) {
    try {
      const templateData = {
        userName: userData.name,
        suspensionReason: suspensionData.reason,
        suspensionDate: suspensionData.date,
        appealUrl: `${process.env.FRONTEND_URL}/appeal`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pipernewsletter.com'
      };

      const html = await this.loadTemplate('account-suspended', templateData);
      const text = `Your account has been suspended due to: ${suspensionData.reason}. You can appeal this decision.`;

      return await this.sendEmail({
        to: userData.email,
        subject: 'Account Suspended - Piper Newsletter',
        html,
        text
      });
    } catch (error) {
      logger.error(`Failed to send account suspension email to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendGDPRDataExport(userData, exportData) {
    try {
      const templateData = {
        userName: userData.name,
        exportDate: new Date().toISOString(),
        dataTypes: exportData.dataTypes || []
      };

      const html = await this.loadTemplate('gdpr-data-export', templateData);
      const text = `Your GDPR data export is ready. Please find the download link in the email.`;

      const attachments = [{
        filename: `data-export-${userData.id}.json`,
        content: JSON.stringify(exportData.data, null, 2),
        contentType: 'application/json'
      }];

      return await this.sendEmail({
        to: userData.email,
        subject: 'Your GDPR Data Export - Piper Newsletter',
        html,
        text,
        attachments
      });
    } catch (error) {
      logger.error(`Failed to send GDPR data export to ${userData.email}:`, error);
      throw error;
    }
  }

  async sendBulkEmails(emailData) {
    try {
      const results = [];
      const batchSize = 50; // Send 50 emails at a time

      for (let i = 0; i < emailData.length; i += batchSize) {
        const batch = emailData.slice(i, i + batchSize);
        const batchPromises = batch.map(email => this.sendEmail(email));
        
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < emailData.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info(`Bulk email campaign completed: ${successful} successful, ${failed} failed`);
      
      return {
        total: emailData.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          email: emailData[index].to,
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason.message : null
        }))
      };
    } catch (error) {
      logger.error('Bulk email campaign failed:', error);
      throw error;
    }
  }

  async verifyEmail(email) {
    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async checkEmailReputation(email) {
    // This would integrate with email reputation services
    // For now, return a basic check
    const domain = email.split('@')[1];
    const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    
    return {
      isValid: true,
      isSuspicious: suspiciousDomains.includes(domain),
      domain: domain,
      score: suspiciousDomains.includes(domain) ? 0.2 : 0.8
    };
  }
}

module.exports = EmailService;