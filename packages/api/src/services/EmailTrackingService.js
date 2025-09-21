const { EmailOpen, EmailClick, EmailUnsubscribe, SpamComplaint } = require('../models/EmailTracking');
const crypto = require('crypto');
const winston = require('winston');

class EmailTrackingService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'email-tracking-service' },
      transports: [
        new winston.transports.File({ filename: 'logs/email-tracking-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/email-tracking.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  /**
   * Track email open event
   * @param {string} emailId - The email ID
   * @param {string} subscriberId - The subscriber ID
   * @param {string} campaignId - The campaign ID
   * @param {string} ipAddress - The IP address of the opener
   * @param {string} userAgent - The user agent string
   * @returns {Promise<Object>} The created email open record
   */
  async trackEmailOpen(emailId, subscriberId, campaignId, ipAddress, userAgent) {
    try {
      // Check if this open was already tracked (prevent duplicates)
      const existingOpen = await EmailOpen.findOne({
        email_id: emailId,
        subscriber_id: subscriberId
      });

      if (existingOpen) {
        this.logger.info(`Email open already tracked for email ${emailId} and subscriber ${subscriberId}`);
        return existingOpen;
      }

      const deviceType = this.detectDeviceType(userAgent);

      const emailOpen = new EmailOpen({
        email_id: emailId,
        subscriber_id: subscriberId,
        campaign_id: campaignId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType
      });

      await emailOpen.save();

      this.logger.info(`Email open tracked: email ${emailId}, subscriber ${subscriberId}, campaign ${campaignId}`);
      return emailOpen;
    } catch (error) {
      this.logger.error('Error tracking email open:', error);
      throw error;
    }
  }

  /**
   * Track email click event
   * @param {string} emailId - The email ID
   * @param {string} subscriberId - The subscriber ID
   * @param {string} campaignId - The campaign ID
   * @param {string} linkUrl - The clicked link URL
   * @param {string} linkId - The link ID
   * @param {string} ipAddress - The IP address of the clicker
   * @param {string} userAgent - The user agent string
   * @param {Object} utmParams - UTM parameters (optional)
   * @returns {Promise<Object>} The created email click record
   */
  async trackEmailClick(emailId, subscriberId, campaignId, linkUrl, linkId, ipAddress, userAgent, utmParams = {}) {
    try {
      const deviceType = this.detectDeviceType(userAgent);

      const emailClick = new EmailClick({
        email_id: emailId,
        subscriber_id: subscriberId,
        campaign_id: campaignId,
        link_url: linkUrl,
        link_id: linkId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
        utm_source: utmParams.source || null,
        utm_medium: utmParams.medium || null,
        utm_campaign: utmParams.campaign || null
      });

      await emailClick.save();

      this.logger.info(`Email click tracked: email ${emailId}, subscriber ${subscriberId}, link ${linkUrl}`);
      return emailClick;
    } catch (error) {
      this.logger.error('Error tracking email click:', error);
      throw error;
    }
  }

  /**
   * Track email unsubscribe event
   * @param {string} emailId - The email ID
   * @param {string} subscriberId - The subscriber ID
   * @param {string} campaignId - The campaign ID
   * @param {string} ipAddress - The IP address
   * @param {string} reason - The unsubscribe reason (optional)
   * @returns {Promise<Object>} The created unsubscribe record
   */
  async trackUnsubscribe(emailId, subscriberId, campaignId, ipAddress, reason = null) {
    try {
      const unsubscribe = new EmailUnsubscribe({
        email_id: emailId,
        subscriber_id: subscriberId,
        campaign_id: campaignId,
        ip_address: ipAddress,
        reason: reason
      });

      await unsubscribe.save();

      this.logger.info(`Email unsubscribe tracked: email ${emailId}, subscriber ${subscriberId}, campaign ${campaignId}`);
      return unsubscribe;
    } catch (error) {
      this.logger.error('Error tracking unsubscribe:', error);
      throw error;
    }
  }

  /**
   * Track spam complaint
   * @param {string} emailId - The email ID
   * @param {string} subscriberId - The subscriber ID
   * @param {string} campaignId - The campaign ID
   * @param {string} ipAddress - The IP address
   * @param {string} complaintType - The type of complaint
   * @param {string} feedback - Additional feedback (optional)
   * @returns {Promise<Object>} The created spam complaint record
   */
  async trackSpamComplaint(emailId, subscriberId, campaignId, ipAddress, complaintType = 'spam', feedback = null) {
    try {
      const spamComplaint = new SpamComplaint({
        email_id: emailId,
        subscriber_id: subscriberId,
        campaign_id: campaignId,
        complaint_type: complaintType,
        feedback: feedback,
        ip_address: ipAddress
      });

      await spamComplaint.save();

      this.logger.info(`Spam complaint tracked: email ${emailId}, subscriber ${subscriberId}, campaign ${campaignId}`);
      return spamComplaint;
    } catch (error) {
      this.logger.error('Error tracking spam complaint:', error);
      throw error;
    }
  }

  /**
   * Generate tracking pixel URL
   * @param {string} emailId - The email ID
   * @param {string} subscriberId - The subscriber ID
   * @param {string} campaignId - The campaign ID
   * @returns {string} The tracking pixel URL
   */
  generateTrackingPixelUrl(emailId, subscriberId, campaignId) {
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const trackingId = this.generateTrackingId(emailId, subscriberId, campaignId);
    return `${baseUrl}/api/email/track/open/${trackingId}`;
  }

  /**
   * Generate tracking link
   * @param {string} originalUrl - The original URL
   * @param {string} emailId - The email ID
   * @param {string} subscriberId - The subscriber ID
   * @param {string} campaignId - The campaign ID
   * @param {string} linkId - The link ID
   * @returns {string} The tracking link URL
   */
  generateTrackingLink(originalUrl, emailId, subscriberId, campaignId, linkId) {
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const trackingId = this.generateTrackingId(emailId, subscriberId, campaignId, linkId);
    const encodedUrl = Buffer.from(originalUrl).toString('base64');
    return `${baseUrl}/api/email/track/click/${trackingId}?url=${encodedUrl}`;
  }

  /**
   * Parse tracking ID to extract tracking data
   * @param {string} trackingId - The tracking ID
   * @returns {Object} The parsed tracking data
   */
  parseTrackingId(trackingId) {
    try {
      const decoded = Buffer.from(trackingId, 'base64').toString('utf-8');
      const parts = decoded.split('|');
      
      if (parts.length < 3) {
        throw new Error('Invalid tracking ID format');
      }

      return {
        emailId: parts[0],
        subscriberId: parts[1],
        campaignId: parts[2],
        linkId: parts[3] || null
      };
    } catch (error) {
      this.logger.error('Error parsing tracking ID:', error);
      throw new Error('Invalid tracking ID');
    }
  }

  /**
   * Get campaign analytics
   * @param {string} campaignId - The campaign ID
   * @returns {Promise<Object>} Campaign analytics data
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const [opens, clicks, unsubscribes, spamComplaints] = await Promise.all([
        EmailOpen.countDocuments({ campaign_id: campaignId }),
        EmailClick.countDocuments({ campaign_id: campaignId }),
        EmailUnsubscribe.countDocuments({ campaign_id: campaignId }),
        SpamComplaint.countDocuments({ campaign_id: campaignId })
      ]);

      const uniqueOpens = await EmailOpen.distinct('subscriber_id', { campaign_id: campaignId });
      const uniqueClicks = await EmailClick.distinct('subscriber_id', { campaign_id: campaignId });

      const clickThroughRate = uniqueOpens.length > 0 ? (uniqueClicks.length / uniqueOpens.length * 100).toFixed(2) : 0;
      const openRate = 0; // This should be calculated based on total emails sent

      return {
        campaignId,
        opens: {
          total: opens,
          unique: uniqueOpens.length
        },
        clicks: {
          total: clicks,
          unique: uniqueClicks.length
        },
        unsubscribes,
        spamComplaints,
        clickThroughRate: parseFloat(clickThroughRate),
        openRate: parseFloat(openRate)
      };
    } catch (error) {
      this.logger.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Detect device type from user agent
   * @param {string} userAgent - The user agent string
   * @returns {string} The device type
   */
  detectDeviceType(userAgent) {
    const ua = userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    } else if (/windows|macintosh|linux|x11/i.test(ua)) {
      return 'desktop';
    } else {
      return 'other';
    }
  }

  /**
   * Generate tracking ID
   * @param {string} emailId - The email ID
   * @param {string} subscriberId - The subscriber ID
   * @param {string} campaignId - The campaign ID
   * @param {string} linkId - The link ID (optional)
   * @returns {string} The tracking ID
   */
  generateTrackingId(emailId, subscriberId, campaignId, linkId = '') {
    const data = `${emailId}|${subscriberId}|${campaignId}|${linkId}`;
    return Buffer.from(data).toString('base64');
  }
}

module.exports = EmailTrackingService;