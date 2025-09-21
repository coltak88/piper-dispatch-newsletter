const express = require('express');
const { body, validationResult } = require('express-validator');
const EmailTrackingService = require('../services/EmailTrackingService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const emailTrackingService = new EmailTrackingService();

/**
 * Track email open
 * GET /api/email/track/open/:trackingId
 */
router.get('/track/open/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Parse tracking ID
    const trackingData = emailTrackingService.parseTrackingId(trackingId);
    
    // Track the email open
    await emailTrackingService.trackEmailOpen(
      trackingData.emailId,
      trackingData.subscriberId,
      trackingData.campaignId,
      ipAddress,
      userAgent
    );

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    res.end(pixel);
  } catch (error) {
    console.error('Error tracking email open:', error);
    // Still return pixel even if tracking fails
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    res.end(pixel);
  }
});

/**
 * Track email click
 * GET /api/email/track/click/:trackingId
 */
router.get('/track/click/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { url } = req.query;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Decode the original URL
    let originalUrl;
    try {
      originalUrl = Buffer.from(url, 'base64').toString('utf-8');
    } catch (decodeError) {
      return res.status(400).json({ error: 'Invalid URL encoding' });
    }

    // Parse tracking ID
    const trackingData = emailTrackingService.parseTrackingId(trackingId);
    
    // Track the email click
    await emailTrackingService.trackEmailClick(
      trackingData.emailId,
      trackingData.subscriberId,
      trackingData.campaignId,
      originalUrl,
      trackingData.linkId,
      ipAddress,
      userAgent
    );

    // Redirect to the original URL
    res.redirect(302, originalUrl);
  } catch (error) {
    console.error('Error tracking email click:', error);
    // If tracking fails, still redirect to the original URL if available
    if (req.query.url) {
      try {
        const originalUrl = Buffer.from(req.query.url, 'base64').toString('utf-8');
        return res.redirect(302, originalUrl);
      } catch (decodeError) {
        return res.status(400).json({ error: 'Invalid tracking or URL parameters' });
      }
    }
    res.status(400).json({ error: 'Invalid tracking parameters' });
  }
});

/**
 * Track unsubscribe
 * POST /api/email/track/unsubscribe
 */
router.post('/track/unsubscribe', [
  body('emailId').isString().notEmpty(),
  body('subscriberId').isString().notEmpty(),
  body('campaignId').isString().notEmpty(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailId, subscriberId, campaignId, reason } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const unsubscribe = await emailTrackingService.trackUnsubscribe(
      emailId,
      subscriberId,
      campaignId,
      ipAddress,
      reason
    );

    res.json({
      message: 'Unsubscribe request processed successfully',
      unsubscribe
    });
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    res.status(500).json({ error: 'Failed to process unsubscribe request' });
  }
});

/**
 * Track spam complaint
 * POST /api/email/track/spam
 */
router.post('/track/spam', [
  body('emailId').isString().notEmpty(),
  body('subscriberId').isString().notEmpty(),
  body('campaignId').isString().notEmpty(),
  body('complaintType').optional().isIn(['spam', 'abuse', 'other']),
  body('feedback').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailId, subscriberId, campaignId, complaintType, feedback } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const spamComplaint = await emailTrackingService.trackSpamComplaint(
      emailId,
      subscriberId,
      campaignId,
      ipAddress,
      complaintType,
      feedback
    );

    res.json({
      message: 'Spam complaint processed successfully',
      spamComplaint
    });
  } catch (error) {
    console.error('Error processing spam complaint:', error);
    res.status(500).json({ error: 'Failed to process spam complaint' });
  }
});

/**
 * Get campaign analytics (protected route)
 * GET /api/email/analytics/:campaignId
 */
router.get('/analytics/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;

    const analytics = await emailTrackingService.getCampaignAnalytics(campaignId);

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ error: 'Failed to fetch campaign analytics' });
  }
});

/**
 * Generate tracking pixel URL
 * POST /api/email/generate-pixel
 */
router.post('/generate-pixel', authenticateToken, [
  body('emailId').isString().notEmpty(),
  body('subscriberId').isString().notEmpty(),
  body('campaignId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailId, subscriberId, campaignId } = req.body;

    const pixelUrl = emailTrackingService.generateTrackingPixelUrl(emailId, subscriberId, campaignId);

    res.json({ pixelUrl });
  } catch (error) {
    console.error('Error generating tracking pixel URL:', error);
    res.status(500).json({ error: 'Failed to generate tracking pixel URL' });
  }
});

/**
 * Generate tracking link
 * POST /api/email/generate-link
 */
router.post('/generate-link', authenticateToken, [
  body('originalUrl').isURL(),
  body('emailId').isString().notEmpty(),
  body('subscriberId').isString().notEmpty(),
  body('campaignId').isString().notEmpty(),
  body('linkId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalUrl, emailId, subscriberId, campaignId, linkId } = req.body;

    const trackingLink = emailTrackingService.generateTrackingLink(originalUrl, emailId, subscriberId, campaignId, linkId);

    res.json({ trackingLink });
  } catch (error) {
    console.error('Error generating tracking link:', error);
    res.status(500).json({ error: 'Failed to generate tracking link' });
  }
});

module.exports = router;