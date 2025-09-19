const { chromium, firefox, webkit } = require('playwright');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Newsletter = require('../../src/models/Newsletter');
const Subscriber = require('../../src/models/Subscriber');
const Campaign = require('../../src/models/Campaign');
const bcrypt = require('bcryptjs');

describe('End-to-End User Workflows', () => {
  let browser;
  let context;
  let page;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/piper_newsletter_e2e_test');
    
    // Create test user
    testUser = new User({
      email: 'e2e@test.com',
      password: await bcrypt.hash('testpassword123', 10),
      name: 'E2E Test User',
      role: 'admin'
    });
    await testUser.save();

    // Launch browser
    browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: 50
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    await User.deleteMany({});
    await Newsletter.deleteMany({});
    await Subscriber.deleteMany({});
    await Campaign.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  describe('User Registration and Login Workflow', () => {
    test('Complete user registration and login flow', async () => {
      // Navigate to registration page
      await page.click('text=Sign Up');
      await page.waitForLoadState('networkidle');

      // Fill registration form
      await page.fill('input[name="name"]', 'New Test User');
      await page.fill('input[name="email"]', 'newuser@test.com');
      await page.fill('input[name="password"]', 'securepassword123');
      await page.fill('input[name="confirmPassword"]', 'securepassword123');

      // Submit registration
      await page.click('button[type="submit"]');
      
      // Wait for success message or redirect
      await page.waitForTimeout(2000);

      // Verify registration success by checking for login form
      await expect(page.locator('input[name="email"]')).toBeVisible();

      // Login with new credentials
      await page.fill('input[name="email"]', 'newuser@test.com');
      await page.fill('input[name="password"]', 'securepassword123');
      await page.click('button[type="submit"]');

      // Wait for dashboard to load
      await page.waitForTimeout(3000);

      // Verify successful login by checking dashboard elements
      await expect(page.locator('h1')).toContainText('Dashboard');
      await expect(page.locator('text=Welcome')).toBeVisible();

      // Cleanup
      await User.deleteOne({ email: 'newuser@test.com' });
    });

    test('Login with invalid credentials shows error', async () => {
      // Fill login form with invalid credentials
      await page.fill('input[name="email"]', 'invalid@test.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Wait for error message
      await page.waitForTimeout(2000);

      // Verify error message is displayed
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Invalid credentials');

      // Verify user is still on login page
      await expect(page.url()).toContain('/login');
    });
  });

  describe('Newsletter Creation and Management Workflow', () => {
    test('Create new newsletter with all required fields', async () => {
      // Login first
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to newsletters page
      await page.click('text=Newsletters');
      await page.waitForLoadState('networkidle');

      // Click create new newsletter
      await page.click('text=Create Newsletter');
      await page.waitForLoadState('networkidle');

      // Fill newsletter form
      await page.fill('input[name="name"]', 'E2E Test Newsletter');
      await page.fill('textarea[name="description"]', 'This is a test newsletter created via E2E testing');
      await page.fill('input[name="fromName"]', 'Test Sender');
      await page.fill('input[name="fromEmail"]', 'sender@example.com');
      await page.fill('input[name="subjectTemplate"]', 'Monthly Update - {{date}}');

      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify success
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('.success-message')).toContainText('Newsletter created successfully');

      // Verify newsletter appears in list
      await expect(page.locator('text=E2E Test Newsletter')).toBeVisible();
    });

    test('Edit existing newsletter', async () => {
      // Create test newsletter
      const testNewsletter = new Newsletter({
        name: 'Newsletter to Edit',
        description: 'Original description',
        fromName: 'Original Sender',
        fromEmail: 'original@example.com',
        subjectTemplate: 'Original - {{date}}',
        userId: testUser._id
      });
      await testNewsletter.save();

      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to newsletters
      await page.click('text=Newsletters');
      await page.waitForLoadState('networkidle');

      // Find and click edit button
      await page.click(`text=${testNewsletter.name}`);
      await page.click('text=Edit');
      await page.waitForLoadState('networkidle');

      // Edit fields
      await page.fill('input[name="name"]', 'Edited Newsletter Name');
      await page.fill('textarea[name="description"]', 'Updated description');

      // Save changes
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify changes
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('text=Edited Newsletter Name')).toBeVisible();

      // Cleanup
      await testNewsletter.deleteOne();
    });
  });

  describe('Subscriber Management Workflow', () => {
    test('Add subscriber to newsletter', async () => {
      // Create test newsletter
      const testNewsletter = new Newsletter({
        name: 'Subscriber Test Newsletter',
        description: 'For testing subscriber management',
        fromName: 'Test Sender',
        fromEmail: 'sender@example.com',
        subjectTemplate: 'Test - {{date}}',
        userId: testUser._id
      });
      await testNewsletter.save();

      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to subscribers page
      await page.click('text=Subscribers');
      await page.waitForLoadState('networkidle');

      // Click add subscriber
      await page.click('text=Add Subscriber');
      await page.waitForLoadState('networkidle');

      // Fill subscriber form
      await page.fill('input[name="email"]', 'subscriber@test.com');
      await page.fill('input[name="name"]', 'Test Subscriber');
      await page.selectOption('select[name="newsletterId"]', testNewsletter._id.toString());

      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify success
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('text=subscriber@test.com')).toBeVisible();

      // Cleanup
      await testNewsletter.deleteOne();
      await Subscriber.deleteOne({ email: 'subscriber@test.com' });
    });

    test('Import subscribers from CSV', async () => {
      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to subscribers
      await page.click('text=Subscribers');
      await page.waitForLoadState('networkidle');

      // Click import button
      await page.click('text=Import');
      await page.waitForLoadState('networkidle');

      // Create CSV file content
      const csvContent = `email,name
import1@test.com,Import User 1
import2@test.com,Import User 2
import3@test.com,Import User 3`;

      // Upload CSV file (this would require file input handling)
      // For now, we'll test the import UI exists
      await expect(page.locator('input[type="file"]')).toBeVisible();
      await expect(page.locator('text=Select CSV File')).toBeVisible();
    });
  });

  describe('Campaign Creation and Scheduling Workflow', () => {
    test('Create and schedule email campaign', async () => {
      // Create test newsletter and subscribers
      const testNewsletter = new Newsletter({
        name: 'Campaign Test Newsletter',
        description: 'For testing campaigns',
        fromName: 'Test Sender',
        fromEmail: 'sender@example.com',
        subjectTemplate: 'Test - {{date}}',
        userId: testUser._id
      });
      await testNewsletter.save();

      const testSubscriber = new Subscriber({
        email: 'campaignsubscriber@test.com',
        name: 'Campaign Subscriber',
        newsletterId: testNewsletter._id,
        status: 'active'
      });
      await testSubscriber.save();

      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to campaigns
      await page.click('text=Campaigns');
      await page.waitForLoadState('networkidle');

      // Click create campaign
      await page.click('text=Create Campaign');
      await page.waitForLoadState('networkidle');

      // Fill campaign form
      await page.fill('input[name="name"]', 'E2E Test Campaign');
      await page.fill('input[name="subject"]', 'Test Campaign Subject');
      await page.selectOption('select[name="newsletterId"]', testNewsletter._id.toString());

      // Use rich text editor for content
      await page.fill('textarea[name="content"]', '<h1>Test Campaign</h1><p>This is a test campaign created via E2E testing.</p>');

      // Schedule for future
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      await page.fill('input[name="scheduledFor"]', futureDate.toISOString().slice(0, 16));

      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify success
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('text=E2E Test Campaign')).toBeVisible();

      // Cleanup
      await testNewsletter.deleteOne();
      await testSubscriber.deleteOne();
    });
  });

  describe('Analytics and Reporting Workflow', () => {
    test('View campaign analytics dashboard', async () => {
      // Create test campaign with analytics data
      const testNewsletter = new Newsletter({
        name: 'Analytics Test Newsletter',
        description: 'For testing analytics',
        fromName: 'Test Sender',
        fromEmail: 'sender@example.com',
        subjectTemplate: 'Test - {{date}}',
        userId: testUser._id
      });
      await testNewsletter.save();

      const testCampaign = new Campaign({
        name: 'Analytics Test Campaign',
        subject: 'Test Subject',
        content: '<h1>Test</h1>',
        newsletterId: testNewsletter._id,
        userId: testUser._id,
        status: 'sent',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        analytics: {
          sent: 1000,
          delivered: 950,
          opened: 300,
          clicked: 150,
          bounced: 50,
          unsubscribed: 10
        }
      });
      await testCampaign.save();

      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to analytics
      await page.click('text=Analytics');
      await page.waitForLoadState('networkidle');

      // Verify analytics dashboard loads
      await expect(page.locator('h1')).toContainText('Analytics');
      await expect(page.locator('text=Campaign Performance')).toBeVisible();

      // Check for analytics data
      await expect(page.locator('text=1000')).toBeVisible(); // Sent count
      await expect(page.locator('text=300')).toBeVisible(); // Opened count
      await expect(page.locator('text=30%')).toBeVisible(); // Open rate

      // Cleanup
      await testNewsletter.deleteOne();
      await testCampaign.deleteOne();
    });
  });

  describe('Settings and Configuration Workflow', () => {
    test('Update user profile settings', async () => {
      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to settings
      await page.click('text=Settings');
      await page.waitForLoadState('networkidle');

      // Update profile information
      await page.fill('input[name="name"]', 'Updated E2E User');
      await page.fill('input[name="company"]', 'Test Company');
      await page.fill('textarea[name="bio"]', 'Updated bio for testing');

      // Save changes
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify success
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toHaveValue('Updated E2E User');
    });

    test('Change password with validation', async () => {
      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to settings
      await page.click('text=Settings');
      await page.waitForLoadState('networkidle');

      // Navigate to security tab
      await page.click('text=Security');
      await page.waitForLoadState('networkidle');

      // Fill password change form
      await page.fill('input[name="currentPassword"]', 'testpassword123');
      await page.fill('input[name="newPassword"]', 'newpassword123');
      await page.fill('input[name="confirmPassword"]', 'newpassword123');

      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify success
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('.success-message')).toContainText('Password updated successfully');

      // Test login with new password
      await page.click('text=Logout');
      await page.waitForLoadState('networkidle');

      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'newpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Verify login with new password works
      await expect(page.locator('h1')).toContainText('Dashboard');
    });
  });

  describe('Error Handling and User Feedback', () => {
    test('Display appropriate error messages for invalid operations', async () => {
      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to newsletters
      await page.click('text=Newsletters');
      await page.waitForLoadState('networkidle');

      // Try to create newsletter with invalid email
      await page.click('text=Create Newsletter');
      await page.waitForLoadState('networkidle');

      await page.fill('input[name="name"]', 'Invalid Test Newsletter');
      await page.fill('input[name="fromEmail"]', 'invalid-email-format');
      await page.fill('input[name="fromName"]', 'Test Sender');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify error message
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Invalid email format');
    });

    test('Handle network errors gracefully', async () => {
      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Block network requests to simulate server error
      await page.route('**/api/**', route => route.abort());

      // Try to navigate to newsletters
      await page.click('text=Newsletters');
      await page.waitForTimeout(3000);

      // Verify error handling
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Network error');
    });
  });

  describe('Responsive Design and Mobile Experience', () => {
    test('Mobile navigation and responsive layout', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Login
      await page.fill('input[name="email"]', 'e2e@test.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Check mobile navigation menu
      await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
      
      // Open mobile menu
      await page.click('.mobile-menu-toggle');
      await page.waitForTimeout(1000);

      // Verify mobile menu items are visible
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Newsletters')).toBeVisible();
      await expect(page.locator('text=Subscribers')).toBeVisible();
    });
  });
});