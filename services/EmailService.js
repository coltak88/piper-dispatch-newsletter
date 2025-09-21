const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const mustache = require('mustache');

/**
 * Email service for sending newsletters and managing email campaigns
 */
class EmailService {
    constructor(options = {}) {
        this.config = {
            host: options.host || process.env.SMTP_HOST || 'smtp.gmail.com',
            port: options.port || process.env.SMTP_PORT || 587,
            secure: options.secure || process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: options.user || process.env.SMTP_USER,
                pass: options.pass || process.env.SMTP_PASS
            },
            from: options.from || process.env.SMTP_FROM || 'noreply@pipernewsletter.com',
            templatesDir: options.templatesDir || path.join(__dirname, '../templates/emails'),
            batchSize: options.batchSize || 100,
            retryAttempts: options.retryAttempts || 3,
            retryDelay: options.retryDelay || 5000,
            rateLimit: options.rateLimit || 100, // emails per minute
            ...options
        };

        this.transporter = null;
        this.templates = new Map();
        this.rateLimiter = {
            sentThisMinute: 0,
            lastReset: Date.now()
        };
        this.queue = [];
        this.isProcessing = false;
        
        this.initializeTransporter();
    }

    /**
     * Initialize the email transporter
     */
    async initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransporter({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: this.config.auth,
                pool: true,
                maxConnections: 5,
                maxMessages: 100,
                rateDelta: 60000,
                rateLimit: this.config.rateLimit
            });

            // Verify connection on initialization
            await this.verifyConnection();
            console.log('Email transporter initialized successfully');
        } catch (error) {
            console.error('Failed to initialize email transporter:', error);
            throw error;
        }
    }

    /**
     * Verify email service connection
     */
    async verifyConnection() {
        if (!this.transporter) {
            throw new Error('Transporter not initialized');
        }

        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('Email connection verification failed:', error);
            throw new Error(`Email connection failed: ${error.message}`);
        }
    }

    /**
     * Load email template from file
     */
    async loadTemplate(templateName) {
        try {
            if (this.templates.has(templateName)) {
                return this.templates.get(templateName);
            }

            const templatePath = path.join(this.config.templatesDir, `${templateName}.html`);
            const templateContent = await fs.readFile(templatePath, 'utf8');
            
            this.templates.set(templateName, templateContent);
            return templateContent;
        } catch (error) {
            console.error(`Failed to load template ${templateName}:`, error);
            throw new Error(`Template not found: ${templateName}`);
        }
    }

    /**
     * Render template with provided data
     */
    renderTemplate(templateContent, templateData = {}) {
        try {
            if (!templateContent) {
                throw new Error('Template content is required');
            }

            return mustache.render(templateContent, templateData);
        } catch (error) {
            console.error('Template rendering failed:', error);
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    }

    /**
     * Send a single email
     */
    async sendEmail(options) {
        if (!this.transporter) {
            throw new Error('Email transporter not initialized');
        }

        try {
            // Rate limiting check
            this.checkRateLimit();

            const mailOptions = {
                from: options.from || this.config.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments || [],
                headers: {
                    'X-Campaign-ID': options.campaignId || '',
                    'X-Subscriber-ID': options.subscriberId || ''
                }
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            // Update rate limiter
            this.rateLimiter.sentThisMinute++;

            console.log(`Email sent successfully to ${options.to}`);
            return {
                messageId: result.messageId,
                accepted: result.accepted,
                rejected: result.rejected,
                pending: result.pending,
                response: result.response
            };
        } catch (error) {
            console.error(`Failed to send email to ${options.to}:`, error);
            throw new Error(`Email sending failed: ${error.message}`);
        }
    }

    /**
     * Send welcome email to new subscriber
     */
    async sendWelcomeEmail(email, subscriberData = {}) {
        try {
            const template = await this.loadTemplate('welcome');
            const html = this.renderTemplate(template, {
                email,
                firstName: subscriberData.firstName || 'Subscriber',
                subscriptionDate: new Date().toLocaleDateString(),
                unsubscribeUrl: subscriberData.unsubscribeUrl || '',
                ...subscriberData
            });

            return await this.sendEmail({
                to: email,
                subject: 'Welcome to Piper Newsletter!',
                html,
                text: `Welcome to Piper Newsletter, ${subscriberData.firstName || 'Subscriber'}!`,
                subscriberId: subscriberData.id
            });
        } catch (error) {
            console.error(`Failed to send welcome email to ${email}:`, error);
            throw error;
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, resetData) {
        try {
            const template = await this.loadTemplate('password-reset');
            const html = this.renderTemplate(template, {
                email,
                resetUrl: resetData.resetUrl,
                expiryHours: resetData.expiryHours || 24,
                ...resetData
            });

            return await this.sendEmail({
                to: email,
                subject: 'Password Reset Request',
                html,
                text: `Click here to reset your password: ${resetData.resetUrl}`,
                subscriberId: resetData.userId
            });
        } catch (error) {
            console.error(`Failed to send password reset email to ${email}:`, error);
            throw error;
        }
    }

    /**
     * Send subscription confirmation email
     */
    async sendSubscriptionConfirmationEmail(email, confirmationData) {
        try {
            const template = await this.loadTemplate('subscription-confirmation');
            const html = this.renderTemplate(template, {
                email,
                confirmationUrl: confirmationData.confirmationUrl,
                newsletterName: confirmationData.newsletterName || 'Piper Newsletter',
                ...confirmationData
            });

            return await this.sendEmail({
                to: email,
                subject: 'Confirm Your Subscription',
                html,
                text: `Please confirm your subscription by clicking: ${confirmationData.confirmationUrl}`,
                subscriberId: confirmationData.subscriberId
            });
        } catch (error) {
            console.error(`Failed to send subscription confirmation email to ${email}:`, error);
            throw error;
        }
    }

    /**
     * Send bulk emails with batching
     */
    async sendBulkEmails(emailList, campaignData) {
        const results = {
            successful: [],
            failed: [],
            total: emailList.length
        };

        try {
            // Process in batches
            const batches = this.createBatches(emailList, this.config.batchSize);
            
            for (const batch of batches) {
                const batchPromises = batch.map(async (emailData) => {
                    try {
                        const emailOptions = {
                            to: emailData.email,
                            subject: campaignData.subject,
                            html: campaignData.html,
                            text: campaignData.text,
                            campaignId: campaignData.campaignId,
                            subscriberId: emailData.subscriberId
                        };

                        const result = await this.sendEmail(emailOptions);
                        results.successful.push({
                            email: emailData.email,
                            subscriberId: emailData.subscriberId,
                            messageId: result.messageId
                        });
                        
                        return result;
                    } catch (error) {
                        results.failed.push({
                            email: emailData.email,
                            subscriberId: emailData.subscriberId,
                            error: error.message
                        });
                        
                        console.error(`Failed to send email to ${emailData.email}:`, error);
                    }
                });

                await Promise.all(batchPromises);
                
                // Small delay between batches to avoid overwhelming the SMTP server
                await this.delay(1000);
            }

            console.log(`Bulk email campaign completed: ${results.successful.length} successful, ${results.failed.length} failed`);
            return results;
        } catch (error) {
            console.error('Bulk email campaign failed:', error);
            throw new Error(`Bulk email sending failed: ${error.message}`);
        }
    }

    /**
     * Verify email address format and domain
     */
    async verifyEmailAddress(email) {
        try {
            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return {
                    valid: false,
                    reason: 'Invalid email format'
                };
            }

            // Domain validation (simplified - in production, you'd check MX records)
            const domain = email.split('@')[1];
            
            // Check for common typos or invalid domains
            const invalidDomains = ['gmai.com', 'yahooo.com', 'hotmial.com'];
            if (invalidDomains.includes(domain.toLowerCase())) {
                return {
                    valid: false,
                    reason: 'Likely typo in domain'
                };
            }

            return {
                valid: true,
                domain: domain,
                reason: 'Email appears valid'
            };
        } catch (error) {
            console.error(`Email verification failed for ${email}:`, error);
            return {
                valid: false,
                reason: `Verification error: ${error.message}`
            };
        }
    }

    /**
     * Check email reputation (simplified implementation)
     */
    async checkEmailReputation(email) {
        try {
            // In a real implementation, this would integrate with services like:
            // - SendGrid Reputation API
            // - Mailgun Reputation API
            // - Custom reputation scoring
            
            const domain = email.split('@')[1];
            
            // Simplified reputation scoring
            let reputationScore = 80; // Base score
            
            // Check against known bad domains (simplified)
            const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'mailinator.com'];
            if (suspiciousDomains.some(d => domain.includes(d))) {
                reputationScore -= 50;
            }

            return {
                score: reputationScore,
                risk: reputationScore < 50 ? 'high' : reputationScore < 70 ? 'medium' : 'low',
                recommendations: reputationScore < 50 ? ['Consider additional verification'] : []
            };
        } catch (error) {
            console.error(`Email reputation check failed for ${email}:`, error);
            throw new Error(`Reputation check failed: ${error.message}`);
        }
    }

    /**
     * Process email queue
     */
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            while (this.queue.length > 0) {
                const emailJob = this.queue.shift();
                
                try {
                    await this.sendEmail(emailJob);
                    
                    // Update monitoring metrics
                    if (global.monitoringService) {
                        global.monitoringService.incrementNewsletterSent('queued');
                        global.monitoringService.decrementEmailQueueSize();
                    }
                } catch (error) {
                    console.error('Queue email sending failed:', error);
                    
                    // Retry logic
                    if (emailJob.retryCount < this.config.retryAttempts) {
                        emailJob.retryCount = (emailJob.retryCount || 0) + 1;
                        this.queue.push(emailJob);
                        
                        // Wait before retrying
                        await this.delay(this.config.retryDelay);
                    }
                }

                // Small delay between emails
                await this.delay(100);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Add email to queue
     */
    addToQueue(emailOptions) {
        const job = {
            ...emailOptions,
            retryCount: 0,
            addedAt: new Date()
        };

        this.queue.push(job);
        
        // Update monitoring metrics
        if (global.monitoringService) {
            global.monitoringService.incrementEmailQueueSize();
        }

        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Close email transporter connection
     */
    async close() {
        if (this.transporter) {
            try {
                await this.transporter.close();
                console.log('Email transporter closed successfully');
            } catch (error) {
                console.error('Error closing email transporter:', error);
                throw error;
            }
        }
    }

    // Helper methods
    createBatches(array, batchSize) {
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }

    checkRateLimit() {
        const now = Date.now();
        const minuteAgo = now - 60000;
        
        // Reset counter if minute has passed
        if (this.rateLimiter.lastReset < minuteAgo) {
            this.rateLimiter.sentThisMinute = 0;
            this.rateLimiter.lastReset = now;
        }

        if (this.rateLimiter.sentThisMinute >= this.config.rateLimit) {
            throw new Error('Rate limit exceeded');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get queue status
    getQueueStatus() {
        return {
            queueSize: this.queue.length,
            isProcessing: this.isProcessing,
            rateLimiter: this.rateLimiter
        };
    }
}

module.exports = EmailService;