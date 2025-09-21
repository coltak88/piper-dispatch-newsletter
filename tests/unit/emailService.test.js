// Mock nodemailer before importing EmailService
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn()
}));

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const Mustache = require('mustache');
const EmailService = require('../../services/EmailService');

// Mock fs
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

describe('EmailService', () => {
  let emailService;
  let mockTransporter;
  let mockSendMail;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Clean up any environment variables that might interfere
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    
    // Setup mock transporter
    mockSendMail = jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      accepted: ['test@example.com'],
      rejected: []
    });
    
    mockTransporter = {
      sendMail: mockSendMail,
      verify: jest.fn().mockResolvedValue(true)
    };
    
    nodemailer.createTransporter.mockReturnValue(mockTransporter);
    
    // Create a fresh instance of EmailService for each test
    emailService = new EmailService({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'newsletter@example.com',
        pass: 'password'
      },
      from: 'newsletter@example.com'
    });
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(emailService.config).toMatchObject({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'newsletter@example.com',
          pass: 'password'
        },
        from: 'newsletter@example.com'
      });
      expect(emailService.transporter).toBeDefined();
    });

    it('should use custom config when provided', () => {
      const customConfig = {
        host: 'smtp.custom.com',
        port: 465,
        secure: true,
        auth: { user: 'custom@example.com', pass: 'custompass' },
        from: 'custom@example.com'
      };
      const service = new EmailService(customConfig);
      expect(service.config).toMatchObject(customConfig);
    });

    it('should use environment variables when available', () => {
      process.env.SMTP_HOST = 'smtp.env.com';
      process.env.SMTP_PORT = '2525';
      process.env.SMTP_USER = 'env@example.com';
      process.env.SMTP_PASS = 'envpass';
      process.env.SMTP_FROM = 'env@example.com';
      
      const service = new EmailService();
      expect(service.config.host).toBe('smtp.env.com');
      expect(service.config.port).toBe('2525'); // Environment variables come as strings
      expect(service.config.auth.user).toBe('env@example.com');
      expect(service.config.auth.pass).toBe('envpass');
      expect(service.config.from).toBe('env@example.com');
    });
  });

  describe('verifyConnection', () => {
    it('should verify connection successfully', async () => {
      const result = await emailService.verifyConnection();
      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should handle connection failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
      await expect(emailService.verifyConnection())
        .rejects.toThrow('Connection failed');
    });

    it('should throw error if transporter not initialized', async () => {
      emailService.transporter = null;
      
      await expect(emailService.verifyConnection())
        .rejects.toThrow('Transporter not initialized');
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test text'
      };

      const result = await emailService.sendEmail(emailData);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'newsletter@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test text',
        attachments: [],
        headers: {
          'X-Campaign-ID': '',
          'X-Subscriber-ID': ''
        }
      });
      expect(result).toEqual({
        messageId: 'test-message-id',
        accepted: ['test@example.com'],
        rejected: []
      });
    });

    it('should handle email sending failure', async () => {
      mockSendMail.mockRejectedValue(new Error('Send failed'));
      
      const emailData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>'
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Send failed');
    });
  });

  describe('sendBulkEmails', () => {
    it('should send multiple emails successfully', async () => {
      const emailList = [
        {
          email: 'recipient1@example.com',
          subscriberId: 'sub1'
        },
        {
          email: 'recipient2@example.com',
          subscriberId: 'sub2'
        }
      ];

      const campaignData = {
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test text'
      };

      const results = await emailService.sendBulkEmails(emailList, campaignData);

      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(results.successful).toHaveLength(2);
      expect(results.failed).toHaveLength(0);
      expect(results.total).toBe(2);
    });

    it('should handle partial failures in bulk emails', async () => {
      mockSendMail
        .mockResolvedValueOnce({
          messageId: 'test-message-id-1',
          accepted: ['recipient1@example.com'],
          rejected: []
        })
        .mockRejectedValueOnce(new Error('Send failed'));

      const emailList = [
        {
          email: 'recipient1@example.com',
          subscriberId: 'sub1'
        },
        {
          email: 'recipient2@example.com',
          subscriberId: 'sub2'
        }
      ];

      const campaignData = {
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test text'
      };

      const results = await emailService.sendBulkEmails(emailList, campaignData);

      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(results.successful).toHaveLength(1);
      expect(results.failed).toHaveLength(1);
      expect(results.total).toBe(2);
    });
  });

  describe('renderTemplate', () => {
    it('should render template with data', async () => {
      const template = emailService.renderTemplate('<h1>Hello {{name}}!</h1>', { name: 'John' });
      expect(template).toBe('<h1>Hello John!</h1>');
    });

    it('should handle missing template content', async () => {
      expect(() => emailService.renderTemplate(null, { name: 'John' }))
        .toThrow('Template content is required');
    });
  });

  describe('sendWelcomeEmail', () => {
    beforeEach(() => {
      // Mock the loadTemplate method to return a template
      emailService.loadTemplate = jest.fn().mockResolvedValue('<h1>Hello {{name}}!</h1>');
    });

    it('should send welcome email successfully', async () => {
      const result = await emailService.sendWelcomeEmail('recipient@example.com', {
        firstName: 'John',
        id: 'subscriber-123'
      });

      expect(emailService.loadTemplate).toHaveBeenCalledWith('welcome');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@example.com',
          subject: 'Welcome to Piper Newsletter!',
          headers: expect.objectContaining({
            'X-Subscriber-ID': 'subscriber-123'
          })
        })
      );
      expect(result).toMatchObject({ messageId: 'test-message-id' });
    });

    it('should handle template loading error', async () => {
      emailService.loadTemplate = jest.fn().mockRejectedValue(new Error('Template not found'));

      await expect(emailService.sendWelcomeEmail('recipient@example.com', {
        firstName: 'John'
      })).rejects.toThrow('Template not found');
    });
  });

  describe('processQueue', () => {
    it('should process queued emails', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Queued Email',
        html: '<h1>Queued Email</h1>'
      };

      emailService.addToQueue(emailOptions);
      await emailService.processQueue();

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Queued Email'
      }));
    });

    it('should handle empty queue', async () => {
      await expect(emailService.processQueue()).resolves.not.toThrow();
    });
  });

  describe('addToQueue', () => {
    it('should add email to queue', () => {
      // Mock the processQueue method to prevent automatic processing
      emailService.processQueue = jest.fn();
      
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>'
      };

      emailService.addToQueue(emailOptions);
      expect(emailService.getQueueStatus().queueSize).toBe(1);
    });
  });

  describe('getQueueStatus', () => {
    it('should return correct queue status', () => {
      // Mock the processQueue method to prevent automatic processing
      emailService.processQueue = jest.fn();
      
      const status = emailService.getQueueStatus();
      expect(status.queueSize).toBe(0);
      expect(status.isProcessing).toBe(false);
      
      emailService.addToQueue({
        to: 'test1@example.com',
        subject: 'Test 1',
        html: '<h1>Test 1</h1>'
      });
      
      const status2 = emailService.getQueueStatus();
      expect(status2.queueSize).toBe(1);
      
      emailService.addToQueue({
        to: 'test2@example.com',
        subject: 'Test 2',
        html: '<h1>Test 2</h1>'
      });
      
      const status3 = emailService.getQueueStatus();
      expect(status3.queueSize).toBe(2);
    });
  });
});