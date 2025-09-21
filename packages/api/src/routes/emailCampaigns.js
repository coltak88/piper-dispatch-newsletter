const express = require('express');
const { body, validationResult } = require('express-validator');
const EmailCampaign = require('../models/EmailCampaign');
const EmailTrackingService = require('../services/EmailTrackingService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const emailTrackingService = new EmailTrackingService();

/**
 * Get all campaigns for the authenticated user
 * GET /api/email/campaigns
 */
router.get('/campaigns', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const userId = req.user._id;

    const query = { userId, isDeleted: false };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await EmailCampaign.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await EmailCampaign.countDocuments(query);

    res.json({
      campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * Get a specific campaign
 * GET /api/email/campaigns/:id
 */
router.get('/campaigns/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    }).lean();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get additional analytics from tracking service
    let analytics = null;
    try {
      analytics = await emailTrackingService.getCampaignAnalytics(campaign._id.toString());
    } catch (analyticsError) {
      console.warn('Could not fetch campaign analytics:', analyticsError.message);
    }

    res.json({
      ...campaign,
      analytics
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

/**
 * Create a new campaign
 * POST /api/email/campaigns
 */
router.post('/campaigns', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Campaign name is required and must be less than 200 characters'),
  body('subject').trim().isLength({ min: 1, max: 300 }).withMessage('Subject is required and must be less than 300 characters'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('template').optional().isString(),
  body('fromEmail').optional().isEmail().normalizeEmail(),
  body('fromName').optional().isString().trim(),
  body('replyTo').optional().isEmail().normalizeEmail(),
  body('segment').optional().isObject(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      subject,
      content,
      template = 'default',
      fromEmail = process.env.DEFAULT_FROM_EMAIL || 'noreply@pipernewsletter.com',
      fromName = 'Piper Newsletter',
      replyTo,
      segment = { type: 'all', criteria: {} },
      tags = [],
      tracking = {
        trackOpens: true,
        trackClicks: true,
        trackUnsubscribes: true
      }
    } = req.body;

    const campaign = new EmailCampaign({
      userId: req.user._id,
      name,
      subject,
      content,
      template,
      segment,
      tracking,
      settings: {
        fromEmail,
        fromName,
        replyTo: replyTo || fromEmail
      },
      tags,
      status: 'draft'
    });

    await campaign.save();

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * Update a campaign
 * PUT /api/email/campaigns/:id
 */
router.put('/campaigns/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('subject').optional().trim().isLength({ min: 1, max: 300 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('template').optional().isString(),
  body('fromEmail').optional().isEmail().normalizeEmail(),
  body('fromName').optional().isString().trim(),
  body('replyTo').optional().isEmail().normalizeEmail(),
  body('segment').optional().isObject(),
  body('tags').optional().isArray(),
  body('tracking').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Only allow updates to draft campaigns
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Cannot update campaign that is not in draft status' });
    }

    const updateFields = {};
    const allowedFields = ['name', 'subject', 'content', 'template', 'segment', 'tags', 'tracking'];
    const allowedSettings = ['fromEmail', 'fromName', 'replyTo'];

    // Update main fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Update settings
    allowedSettings.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[`settings.${field}`] = req.body[field];
      }
    });

    Object.assign(campaign, updateFields);
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

/**
 * Delete a campaign (soft delete)
 * DELETE /api/email/campaigns/:id
 */
router.delete('/campaigns/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Only allow deletion of draft campaigns
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Cannot delete campaign that is not in draft status' });
    }

    campaign.isDeleted = true;
    await campaign.save();

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

/**
 * Schedule a campaign
 * POST /api/email/campaigns/:id/schedule
 */
router.post('/campaigns/:id/schedule', authenticateToken, [
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft campaigns can be scheduled' });
    }

    const { scheduledDate } = req.body;
    const scheduleDate = new Date(scheduledDate);

    if (scheduleDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled date must be in the future' });
    }

    campaign.status = 'scheduled';
    campaign.scheduledDate = scheduleDate;
    await campaign.save();

    res.json({
      message: 'Campaign scheduled successfully',
      campaign
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    res.status(500).json({ error: 'Failed to schedule campaign' });
  }
});

/**
 * Cancel a scheduled campaign
 * POST /api/email/campaigns/:id/cancel
 */
router.post('/campaigns/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled campaigns can be cancelled' });
    }

    campaign.status = 'cancelled';
    campaign.scheduledDate = null;
    await campaign.save();

    res.json({
      message: 'Campaign cancelled successfully',
      campaign
    });
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    res.status(500).json({ error: 'Failed to cancel campaign' });
  }
});

/**
 * Add recipients to a campaign
 * POST /api/email/campaigns/:id/recipients
 */
router.post('/campaigns/:id/recipients', authenticateToken, [
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('recipients.*.subscriberId').isString().notEmpty(),
  body('recipients.*.email').isEmail().normalizeEmail(),
  body('recipients.*.firstName').optional().isString().trim(),
  body('recipients.*.lastName').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Cannot modify recipients for non-draft campaigns' });
    }

    const { recipients } = req.body;
    
    // Add new recipients (avoid duplicates based on subscriberId)
    const existingSubscriberIds = new Set(campaign.recipients.map(r => r.subscriberId));
    const newRecipients = recipients.filter(r => !existingSubscriberIds.has(r.subscriberId));
    
    campaign.recipients.push(...newRecipients.map(recipient => ({
      subscriberId: recipient.subscriberId,
      email: recipient.email,
      firstName: recipient.firstName || '',
      lastName: recipient.lastName || '',
      status: 'pending'
    })));

    await campaign.save();

    res.json({
      message: `${newRecipients.length} recipients added successfully`,
      totalRecipients: campaign.recipients.length,
      campaign
    });
  } catch (error) {
    console.error('Error adding recipients:', error);
    res.status(500).json({ error: 'Failed to add recipients' });
  }
});

/**
 * Remove recipients from a campaign
 * DELETE /api/email/campaigns/:id/recipients
 */
router.delete('/campaigns/:id/recipients', authenticateToken, [
  body('subscriberIds').isArray().withMessage('subscriberIds must be an array'),
  body('subscriberIds.*').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Cannot modify recipients for non-draft campaigns' });
    }

    const { subscriberIds } = req.body;
    
    // Remove specified recipients
    const initialCount = campaign.recipients.length;
    campaign.recipients = campaign.recipients.filter(r => !subscriberIds.includes(r.subscriberId));
    const removedCount = initialCount - campaign.recipients.length;

    await campaign.save();

    res.json({
      message: `${removedCount} recipients removed successfully`,
      totalRecipients: campaign.recipients.length,
      campaign
    });
  } catch (error) {
    console.error('Error removing recipients:', error);
    res.status(500).json({ error: 'Failed to remove recipients' });
  }
});

module.exports = router;