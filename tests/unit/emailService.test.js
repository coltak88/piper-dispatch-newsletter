const sinon = require('sinon');
const { expect } = require('chai');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

describe('EmailService', () => {
  let emailService;
  let transporterStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Create transporter stub
    transporterStub = {
      verify: sandbox.stub(),
      sendMail: sandbox.stub(),
      close: sandbox.stub()
    };
    
    // Stub nodemailer.createTransport
    sandbox.stub(nodemailer, 'createTransport').returns(transporterStub);
    
    // Stub fs.readFile for template loading
    sandbox.stub(fs, 'readFile').resolves('<html>Test Template</html>');
    
    // Initialize service
    const EmailService = require('../../services/EmailService');
    emailService = new EmailService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should initialize with provided options', () => {
      const customOptions = {
        host: 'custom.smtp.com',
        port: 587,
        secure: false
      };
      
      const customService = new (require('../../services/EmailService'))(customOptions);
      
      expect(nodemailer.createTransport.calledOnce).to.be.true;
      expect(nodemailer.createTransport.firstCall.args[0]).to.include(customOptions);
    });

    it('should initialize with environment variables', () => {
      process.env.SMTP_HOST = 'env.smtp.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_SECURE = 'true';
      
      const envService = new (require('../../services/EmailService'))();
      
      expect(nodemailer.createTransport.calledOnce).to.be.true;
      const options = nodemailer.createTransport.firstCall.args[0];
      expect(options.host).to.equal('env.smtp.com');
      expect(options.port).to.equal(465);
      expect(options.secure).to.be.true;
    });
  });

  describe('verifyConnection', () => {
    it('should verify successful connection', async () => {
      transporterStub.verify.resolves(true);
      
      const result = await emailService.verifyConnection();
      
      expect(result).to.be.true;
      expect(transporterStub.verify.calledOnce).to.be.true;
    });

    it('should handle connection verification failure', async () => {
      transporterStub.verify.rejects(new Error('Connection failed'));
      
      const result = await emailService.verifyConnection();
      
      expect(result).to.be.false;
      expect(transporterStub.verify.calledOnce).to.be.true;
    });
  });

  describe('loadTemplate', () => {
    it('should load existing template', async () => {
      const templateName = 'welcome';
      const templateContent = '<html>Welcome Template</html>';
      
      fs.readFile.resolves(templateContent);
      
      const result = await emailService.loadTemplate(templateName);
      
      expect(result).to.equal(templateContent);
      expect(fs.readFile.calledOnce).to.be.true;
      expect(fs.readFile.firstCall.args[0]).to.include(`templates/emails/${templateName}.html`);
    });

    it('should return null for non-existent template', async () => {
      fs.readFile.rejects(new Error('File not found'));
      
      const result = await emailService.loadTemplate('nonexistent');
      
      expect(result).to.be.null;
    });
  });

  describe('renderTemplate', () => {
    it('should render template with placeholders', () => {
      const template = 'Hello {{userName}}, welcome to {{appName}}!';
      const variables = {
        userName: 'John Doe',
        appName: 'Test App'
      };
      
      const result = emailService.renderTemplate(template, variables);
      
      expect(result).to.equal('Hello John Doe, welcome to Test App!');
    });

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {{userName}}, your balance is {{balance}}';
      const variables = {
        userName: 'John Doe'
        // balance is missing
      };
      
      const result = emailService.renderTemplate(template, variables);
      
      expect(result).to.equal('Hello John Doe, your balance is {{balance}}');
    });

    it('should handle empty template', () => {
      const template = '';
      const variables = { userName: 'John Doe' };
      
      const result = emailService.renderTemplate(template, variables);
      
      expect(result).to.equal('');
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<html>Test Content</html>'
      };
      
      transporterStub.sendMail.resolves({ messageId: 'test-message-id' });
      
      const result = await emailService.sendEmail(emailOptions);
      
      expect(result.success).to.be.true;
      expect(result.messageId).to.equal('test-message-id');
      expect(transporterStub.sendMail.calledOnce).to.be.true;
      expect(transporterStub.sendMail.firstCall.args[0]).to.include(emailOptions);
    });

    it('should include default from address if not provided', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Email'
      };
      
      transporterStub.sendMail.resolves({ messageId: 'test-message-id' });
      
      await emailService.sendEmail(emailOptions);
      
      const sentOptions = transporterStub.sendMail.firstCall.args[0];
      expect(sentOptions.from).to.exist;
      expect(sentOptions.from).to.include(process.env.SMTP_USER || 'noreply@pipernewsletter.com');
    });

    it('should handle email sending failure', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Email'
      };
      
      transporterStub.sendMail.rejects(new Error('SMTP Error'));
      
      const result = await emailService.sendEmail(emailOptions);
      
      expect(result.success).to.be.false;
      expect(result.error).to.equal('SMTP Error');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with template', async () => {
      const userData = {
        email: 'newuser@example.com',
        userName: 'John Doe',
        appName: 'Piper Newsletter'
      };
      
      const templateContent = '<html>Welcome {{userName}} to {{appName}}!</html>';
      fs.readFile.resolves(templateContent);
      transporterStub.sendMail.resolves({ messageId: 'welcome-message-id' });
      
      const result = await emailService.sendWelcomeEmail(userData);
      
      expect(result.success).to.be.true;
      expect(result.messageId).to.equal('welcome-message-id');
      
      const sentOptions = transporterStub.sendMail.firstCall.args[0];
      expect(sentOptions.to).to.equal(userData.email);
      expect(sentOptions.subject).to.include('Welcome');
      expect(sentOptions.html).to.include('Welcome John Doe to Piper Newsletter!');
    });

    it('should handle template loading failure', async () => {
      const userData = {
        email: 'newuser@example.com',
        userName: 'John Doe'
      };
      
      fs.readFile.rejects(new Error('Template not found'));
      
      const result = await emailService.sendWelcomeEmail(userData);
      
      expect(result.success).to.be.false;
      expect(result.error).to.include('Failed to load template');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      const userData = {
        email: 'user@example.com',
        userName: 'John Doe',
        resetUrl: 'https://app.com/reset?token=abc123',
        expiryHours: 24
      };
      
      const templateContent = '<html>Reset your password: {{resetUrl}} (expires in {{expiryHours}} hours)</html>';
      fs.readFile.resolves(templateContent);
      transporterStub.sendMail.resolves({ messageId: 'reset-message-id' });
      
      const result = await emailService.sendPasswordResetEmail(userData);
      
      expect(result.success).to.be.true;
      
      const sentOptions = transporterStub.sendMail.firstCall.args[0];
      expect(sentOptions.to).to.equal(userData.email);
      expect(sentOptions.subject).to.include('Password Reset');
      expect(sentOptions.html).to.include(userData.resetUrl);
      expect(sentOptions.html).to.include('24 hours');
    });
  });

  describe('sendSubscriptionConfirmationEmail', () => {
    it('should send subscription confirmation email', async () => {
      const subscriptionData = {
        email: 'subscriber@example.com',
        userName: 'John Doe',
        planName: 'Premium',
        amount: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: '2024-02-01',
        features: ['Feature 1', 'Feature 2']
      };
      
      const templateContent = '<html>Subscribed to {{planName}} plan for {{amount}} {{currency}}</html>';
      fs.readFile.resolves(templateContent);
      transporterStub.sendMail.resolves({ messageId: 'subscription-message-id' });
      
      const result = await emailService.sendSubscriptionConfirmationEmail(subscriptionData);
      
      expect(result.success).to.be.true;
      
      const sentOptions = transporterStub.sendMail.firstCall.args[0];
      expect(sentOptions.html).to.include('Premium plan');
      expect(sentOptions.html).to.include('29.99 USD');
    });
  });

  describe('sendBulkEmails', () => {
    it('should send bulk emails successfully', async () => {
      const recipients = [
        { email: 'user1@example.com', userName: 'User 1' },
        { email: 'user2@example.com', userName: 'User 2' },
        { email: 'user3@example.com', userName: 'User 3' }
      ];
      
      const templateData = {
        subject: 'Bulk Newsletter',
        templateName: 'newsletter',
        variables: { appName: 'Piper Newsletter' }
      };
      
      const templateContent = '<html>Hello {{userName}}, from {{appName}}</html>';
      fs.readFile.resolves(templateContent);
      
      transporterStub.sendMail
        .onFirstCall().resolves({ messageId: 'msg1' })
        .onSecondCall().resolves({ messageId: 'msg2' })
        .onThirdCall().resolves({ messageId: 'msg3' });
      
      const results = await emailService.sendBulkEmails(recipients, templateData);
      
      expect(results).to.have.lengthOf(3);
      expect(results.every(r => r.success)).to.be.true;
      expect(transporterStub.sendMail.callCount).to.equal(3);
    });

    it('should handle partial failures in bulk sending', async () => {
      const recipients = [
        { email: 'user1@example.com', userName: 'User 1' },
        { email: 'user2@example.com', userName: 'User 2' }
      ];
      
      const templateData = {
        subject: 'Bulk Newsletter',
        templateName: 'newsletter'
      };
      
      const templateContent = '<html>Hello {{userName}}</html>';
      fs.readFile.resolves(templateContent);
      
      transporterStub.sendMail
        .onFirstCall().resolves({ messageId: 'msg1' })
        .onSecondCall().rejects(new Error('SMTP Error'));
      
      const results = await emailService.sendBulkEmails(recipients, templateData);
      
      expect(results).to.have.lengthOf(2);
      expect(results[0].success).to.be.true;
      expect(results[1].success).to.be.false;
      expect(results[1].error).to.equal('SMTP Error');
    });

    it('should respect batch size limit', async () => {
      const recipients = Array(15).fill(null).map((_, i) => ({
        email: `user${i}@example.com`,
        userName: `User ${i}`
      }));
      
      const templateData = {
        subject: 'Bulk Newsletter',
        templateName: 'newsletter',
        batchSize: 5
      };
      
      const templateContent = '<html>Hello {{userName}}</html>';
      fs.readFile.resolves(templateContent);
      
      transporterStub.sendMail.resolves({ messageId: 'msg-id' });
      
      const results = await emailService.sendBulkEmails(recipients, templateData);
      
      expect(results).to.have.lengthOf(15);
      expect(transporterStub.sendMail.callCount).to.equal(15);
    });
  });

  describe('verifyEmailAddress', () => {
    it('should return verification result', async () => {
      const email = 'test@example.com';
      
      // Mock DNS lookup and SMTP verification
      const dnsStub = sandbox.stub(require('dns'), 'resolveMx');
      dnsStub.resolves([{ exchange: 'mail.example.com', priority: 10 }]);
      
      const result = await emailService.verifyEmailAddress(email);
      
      expect(result.isValid).to.be.true;
      expect(result.domain).to.equal('example.com');
      expect(result.hasMXRecord).to.be.true;
    });

    it('should handle invalid email format', async () => {
      const email = 'invalid-email';
      
      const result = await emailService.verifyEmailAddress(email);
      
      expect(result.isValid).to.be.false;
      expect(result.error).to.include('Invalid email format');
    });

    it('should handle domain without MX records', async () => {
      const email = 'test@nodomain.com';
      
      const dnsStub = sandbox.stub(require('dns'), 'resolveMx');
      dnsStub.rejects(new Error('No MX records found'));
      
      const result = await emailService.verifyEmailAddress(email);
      
      expect(result.isValid).to.be.false;
      expect(result.hasMXRecord).to.be.false;
    });
  });

  describe('checkEmailReputation', () => {
    it('should return reputation score', async () => {
      const email = 'test@example.com';
      
      // Mock reputation service API call
      const axiosStub = sandbox.stub(require('axios'), 'get');
      axiosStub.resolves({
        data: {
          reputation: 95,
          blacklisted: false,
          disposable: false
        }
      });
      
      const result = await emailService.checkEmailReputation(email);
      
      expect(result.reputation).to.equal(95);
      expect(result.isBlacklisted).to.be.false;
      expect(result.isDisposable).to.be.false;
    });

    it('should handle reputation service errors', async () => {
      const email = 'test@example.com';
      
      const axiosStub = sandbox.stub(require('axios'), 'get');
      axiosStub.rejects(new Error('Service unavailable'));
      
      const result = await emailService.checkEmailReputation(email);
      
      expect(result.reputation).to.equal(50); // Default score
      expect(result.error).to.equal('Service unavailable');
    });
  });

  describe('Error Handling', () => {
    it('should handle transporter initialization failure', () => {
      nodemailer.createTransport.throws(new Error('Invalid configuration'));
      
      expect(() => {
        new (require('../../services/EmailService'))();
      }).to.throw('Failed to initialize email transporter');
    });

    it('should handle template loading errors gracefully', async () => {
      const userData = {
        email: 'user@example.com',
        userName: 'John Doe'
      };
      
      fs.readFile.rejects(new Error('Template not found'));
      
      const result = await emailService.sendWelcomeEmail(userData);
      
      expect(result.success).to.be.false;
      expect(result.error).to.include('Failed to load template');
    });
  });

  describe('Cleanup', () => {
    it('should close transporter connection', async () => {
      transporterStub.close.resolves();
      
      await emailService.close();
      
      expect(transporterStub.close.calledOnce).to.be.true;
    });

    it('should handle cleanup errors', async () => {
      transporterStub.close.rejects(new Error('Close failed'));
      
      await emailService.close();
      
      expect(transporterStub.close.calledOnce).to.be.true;
      // Should not throw error
    });
  });
});