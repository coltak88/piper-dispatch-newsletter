const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('@playwright/test');

describe('End-to-End User Journey Tests', () => {
    let browser;
    let context;
    let page;
    let baseURL;

    beforeAll(async () => {
        // Set base URL based on environment
        baseURL = process.env.BASE_URL || 'http://localhost:3000';
        
        // Launch browser (use chromium by default, but test with all browsers)
        const browserType = process.env.BROWSER || 'chromium';
        browser = await { chromium, firefox, webkit }[browserType].launch({
            headless: process.env.HEADLESS !== 'false',
            slowMo: parseInt(process.env.SLOW_MO || '0')
        });
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    beforeEach(async () => {
        // Create new context and page for each test
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            locale: 'en-US',
            timezoneId: 'America/New_York'
        });
        
        page = await context.newPage();
        
        // Set up console and error logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error('Browser error:', msg.text());
            }
        });
        
        page.on('pageerror', error => {
            console.error('Page error:', error.message);
        });
    });

    afterEach(async () => {
        if (context) {
            await context.close();
        }
    });

    describe('User Registration Journey', () => {
        test('should complete full user registration flow', async () => {
            // Navigate to registration page
            await page.goto(`${baseURL}/register`);
            await expect(page).toHaveTitle(/Register/);
            
            // Fill registration form
            await page.fill('#username', 'testuser_' + Date.now());
            await page.fill('#email', `test_${Date.now()}@example.com`);
            await page.fill('#password', 'TestPassword123!');
            await page.fill('#confirmPassword', 'TestPassword123!');
            
            // Submit registration
            await page.click('button[type="submit"]');
            
            // Wait for success message or redirect
            await page.waitForSelector('.success-message, .dashboard, .login-form', { timeout: 10000 });
            
            // Verify registration success
            const successMessage = await page.textContent('.success-message, .alert-success, .toast-success');
            expect(successMessage).toContain('success') || expect(page.url()).toContain('/dashboard');
            
            // Take screenshot for evidence
            await page.screenshot({ path: `screenshots/registration_success_${Date.now()}.png` });
        });

        test('should handle registration validation errors', async () => {
            await page.goto(`${baseURL}/register`);
            
            // Submit empty form
            await page.click('button[type="submit"]');
            
            // Wait for validation errors
            await page.waitForSelector('.error-message, .is-invalid, .text-danger');
            
            // Check for validation messages
            const errorMessages = await page.textContent('.error-message, .invalid-feedback, .text-danger');
            expect(errorMessages).toMatch(/required|invalid|empty/i);
            
            // Test invalid email format
            await page.fill('#email', 'invalid-email');
            await page.click('button[type="submit"]');
            
            await page.waitForSelector('.email-error, .invalid-email');
            const emailError = await page.textContent('.email-error, .invalid-email, .text-danger');
            expect(emailError).toMatch(/valid email|invalid|format/i);
            
            await page.screenshot({ path: `screenshots/registration_validation_${Date.now()}.png` });
        });

        test('should handle duplicate username/email', async () => {
            await page.goto(`${baseURL}/register`);
            
            // Use existing credentials
            await page.fill('#username', 'existinguser');
            await page.fill('#email', 'existing@example.com');
            await page.fill('#password', 'Password123!');
            await page.fill('#confirmPassword', 'Password123!');
            
            await page.click('button[type="submit"]');
            
            // Wait for duplicate error
            await page.waitForSelector('.duplicate-error, .user-exists, .email-exists');
            
            const errorMessage = await page.textContent('.duplicate-error, .user-exists, .email-exists, .text-danger');
            expect(errorMessage).toMatch(/already exists|taken|duplicate/i);
            
            await page.screenshot({ path: `screenshots/registration_duplicate_${Date.now()}.png` });
        });
    });

    describe('User Login Journey', () => {
        test('should complete successful login flow', async () => {
            await page.goto(`${baseURL}/login`);
            
            // Fill login form
            await page.fill('#email', 'testuser@example.com');
            await page.fill('#password', 'TestPassword123!');
            
            // Submit login
            await page.click('button[type="submit"]');
            
            // Wait for redirect to dashboard
            await page.waitForURL('**/dashboard', { timeout: 10000 });
            
            // Verify dashboard elements
            await expect(page).toHaveTitle(/Dashboard/);
            await page.waitForSelector('.dashboard-content, .user-menu, .navigation');
            
            // Check user is logged in
            const userMenu = await page.textContent('.user-menu, .user-info, .account-menu');
            expect(userMenu).toBeTruthy();
            
            await page.screenshot({ path: `screenshots/login_success_${Date.now()}.png` });
        });

        test('should handle login errors', async () => {
            await page.goto(`${baseURL}/login`);
            
            // Try invalid credentials
            await page.fill('#email', 'wrong@example.com');
            await page.fill('#password', 'WrongPassword123!');
            
            await page.click('button[type="submit"]');
            
            // Wait for error message
            await page.waitForSelector('.error-message, .login-error, .text-danger');
            
            const errorMessage = await page.textContent('.error-message, .login-error, .text-danger');
            expect(errorMessage).toMatch(/invalid|wrong|incorrect|failed/i);
            
            // Verify still on login page
            expect(page.url()).toContain('/login');
            
            await page.screenshot({ path: `screenshots/login_error_${Date.now()}.png` });
        });

        test('should handle password reset flow', async () => {
            await page.goto(`${baseURL}/login`);
            
            // Click forgot password link
            await page.click('a[href*="forgot"], .forgot-password');
            
            // Wait for password reset page
            await page.waitForURL('**/forgot-password', { timeout: 5000 });
            
            // Fill email for reset
            await page.fill('#email', 'testuser@example.com');
            await page.click('button[type="submit"]');
            
            // Wait for success message
            await page.waitForSelector('.success-message, .reset-sent, .check-email');
            
            const successMessage = await page.textContent('.success-message, .reset-sent, .check-email');
            expect(successMessage).toMatch(/sent|email|reset|check/i);
            
            await page.screenshot({ path: `screenshots/password_reset_${Date.now()}.png` });
        });
    });

    describe('User Dashboard Journey', () => {
        test('should navigate dashboard sections', async () => {
            // Login first
            await page.goto(`${baseURL}/login`);
            await page.fill('#email', 'testuser@example.com');
            await page.fill('#password', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard');
            
            // Navigate to different sections
            const sections = ['profile', 'settings', 'analytics', 'content'];
            
            for (const section of sections) {
                await page.click(`a[href*="${section}"], .nav-${section}, .menu-${section}`);
                await page.waitForLoadState('networkidle');
                
                // Verify section content
                await expect(page).toHaveTitle(new RegExp(section, 'i'));
                await page.waitForSelector(`.${section}-content, .${section}-section, [data-section="${section}"]`);
                
                await page.screenshot({ path: `screenshots/dashboard_${section}_${Date.now()}.png` });
            }
        });

        test('should create and manage content', async () => {
            // Login and navigate to content section
            await page.goto(`${baseURL}/login`);
            await page.fill('#email', 'testuser@example.com');
            await page.fill('#password', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard');
            
            await page.click('a[href*="content"], .nav-content, .menu-content');
            await page.waitForLoadState('networkidle');
            
            // Click create content button
            await page.click('.create-content, .new-content, .add-content');
            await page.waitForSelector('.content-form, .editor, [data-form="content"]');
            
            // Fill content form
            await page.fill('#title', 'Test Content ' + Date.now());
            await page.fill('#description', 'This is a test content created by E2E test');
            await page.selectOption('#category', 'technology');
            
            // Add tags
            await page.fill('#tags', 'test, e2e, automation');
            
            // Submit content
            await page.click('button[type="submit"]:has-text("Create"), .save-content, .publish-content');
            
            // Wait for success
            await page.waitForSelector('.success-message, .content-created, .content-published');
            
            const successMessage = await page.textContent('.success-message, .content-created, .content-published');
            expect(successMessage).toMatch(/created|published|success/i);
            
            await page.screenshot({ path: `screenshots/content_created_${Date.now()}.png` });
        });

        test('should handle user settings updates', async () => {
            // Login and navigate to settings
            await page.goto(`${baseURL}/login`);
            await page.fill('#email', 'testuser@example.com');
            await page.fill('#password', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard');
            
            await page.click('a[href*="settings"], .nav-settings, .menu-settings');
            await page.waitForLoadState('networkidle');
            
            // Update profile information
            await page.fill('#displayName', 'Updated Name ' + Date.now());
            await page.fill('#bio', 'Updated bio for testing');
            
            // Change preferences
            await page.check('#notifications');
            await page.uncheck('#marketing-emails');
            
            // Save settings
            await page.click('button[type="submit"]:has-text("Save"), .save-settings');
            
            // Wait for confirmation
            await page.waitForSelector('.settings-saved, .success-message, .toast-success');
            
            const confirmation = await page.textContent('.settings-saved, .success-message, .toast-success');
            expect(confirmation).toMatch(/saved|updated|success/i);
            
            await page.screenshot({ path: `screenshots/settings_updated_${Date.now()}.png` });
        });
    });

    describe('Newsletter Management Journey', () => {
        test('should create and send newsletter', async () => {
            // Login first
            await page.goto(`${baseURL}/login`);
            await page.fill('#email', 'testuser@example.com');
            await page.fill('#password', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard');
            
            // Navigate to newsletters section
            await page.click('a[href*="newsletters"], .nav-newsletters, .menu-newsletters');
            await page.waitForLoadState('networkidle');
            
            // Create new newsletter
            await page.click('.create-newsletter, .new-newsletter, .add-newsletter');
            await page.waitForSelector('.newsletter-form, .editor, [data-form="newsletter"]');
            
            // Fill newsletter details
            await page.fill('#title', 'Test Newsletter ' + Date.now());
            await page.fill('#subject', 'Test Subject for Newsletter');
            
            // Use rich text editor if available
            const editor = await page.$('.rich-editor, .editor-content, [contenteditable="true"]');
            if (editor) {
                await editor.fill('This is the content of our test newsletter. It contains important updates and information.');
            } else {
                await page.fill('#content', 'This is the content of our test newsletter.');
            }
            
            // Select recipients
            await page.click('.select-recipients, .choose-audience');
            await page.waitForSelector('.recipient-selector, .audience-list');
            
            // Select all subscribers
            await page.check('#all-subscribers, .select-all');
            
            // Schedule or send immediately
            const sendButton = await page.$('button:has-text("Send Now"), .send-immediately, .publish-newsletter');
            if (sendButton) {
                await sendButton.click();
                
                // Confirm send
                await page.waitForSelector('.confirm-dialog, .modal-confirm');
                await page.click('.confirm-send, .modal-confirm button:has-text("Send")');
            }
            
            // Wait for success confirmation
            await page.waitForSelector('.newsletter-sent, .success-message, .sent-confirmation', { timeout: 15000 });
            
            const confirmation = await page.textContent('.newsletter-sent, .success-message, .sent-confirmation');
            expect(confirmation).toMatch(/sent|published|delivered|success/i);
            
            await page.screenshot({ path: `screenshots/newsletter_sent_${Date.now()}.png` });
        });

        test('should manage subscriber lists', async () => {
            // Login and navigate to subscribers
            await page.goto(`${baseURL}/login`);
            await page.fill('#email', 'testuser@example.com');
            await page.fill('#password', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard');
            
            await page.click('a[href*="subscribers"], .nav-subscribers, .menu-subscribers');
            await page.waitForLoadState('networkidle');
            
            // Add new subscriber
            await page.click('.add-subscriber, .new-subscriber');
            await page.waitForSelector('.subscriber-form, .add-subscriber-form');
            
            await page.fill('#subscriberEmail', `newsubscriber_${Date.now()}@example.com`);
            await page.fill('#subscriberName', 'New Subscriber');
            await page.selectOption('#subscriberGroup', 'test-group');
            
            await page.click('button[type="submit"]:has-text("Add"), .save-subscriber');
            
            // Wait for subscriber to be added
            await page.waitForSelector('.subscriber-added, .success-message');
            
            // Import subscribers from file
            await page.click('.import-subscribers, .bulk-import');
            await page.waitForSelector('.import-form, .file-upload');
            
            // Create sample CSV content
            const csvContent = 'email,name,group\ntest1@example.com,Test User 1,group1\ntest2@example.com,Test User 2,group2';
            
            // Upload file (create temporary file)
            await page.setInputFiles('#csvFile, .file-input', {
                name: 'subscribers.csv',
                mimeType: 'text/csv',
                buffer: Buffer.from(csvContent)
            });
            
            await page.click('.import-button, .process-import');
            
            // Wait for import completion
            await page.waitForSelector('.import-complete, .import-summary');
            
            const importSummary = await page.textContent('.import-summary, .import-results');
            expect(importSummary).toMatch(/imported|added|processed|complete/i);
            
            await page.screenshot({ path: `screenshots/subscribers_imported_${Date.now()}.png` });
        });
    });

    describe('Cross-browser Compatibility', () => {
        test('should work across different browsers', async () => {
            const browsers = ['chromium', 'firefox', 'webkit'];
            
            for (const browserType of browsers) {
                const testBrowser = await { chromium, firefox, webkit }[browserType].launch({
                    headless: true
                });
                
                const testContext = await testBrowser.newContext();
                const testPage = await testContext.newPage();
                
                try {
                    // Test basic functionality
                    await testPage.goto(`${baseURL}/login`);
                    await testPage.waitForSelector('#email, #password, button[type="submit"]');
                    
                    await testPage.fill('#email', 'testuser@example.com');
                    await testPage.fill('#password', 'TestPassword123!');
                    await testPage.click('button[type="submit"]');
                    
                    await testPage.waitForURL('**/dashboard', { timeout: 10000 });
                    
                    // Verify dashboard loaded
                    await testPage.waitForSelector('.dashboard-content, .user-menu');
                    
                    console.log(`${browserType} compatibility test passed`);
                    
                    await testPage.screenshot({ path: `screenshots/compatibility_${browserType}_${Date.now()}.png` });
                    
                } catch (error) {
                    console.error(`${browserType} compatibility test failed:`, error.message);
                    throw error;
                } finally {
                    await testContext.close();
                    await testBrowser.close();
                }
            }
        });
    });

    describe('Accessibility Testing', () => {
        test('should meet accessibility standards', async () => {
            await page.goto(`${baseURL}/login`);
            
            // Check for basic accessibility features
            const hasAltText = await page.$$eval('img', imgs => 
                imgs.every(img => img.hasAttribute('alt'))
            );
            
            const hasLabels = await page.$$eval('input', inputs => 
                inputs.every(input => {
                    const hasLabel = input.hasAttribute('aria-label') || 
                                   input.hasAttribute('aria-labelledby') ||
                                   document.querySelector(`label[for="${input.id}"]`);
                    return hasLabel || input.type === 'hidden';
                })
            );
            
            const hasFocusableElements = await page.$$eval('button, a, input, select, textarea', elements =>
                elements.every(el => el.tabIndex >= 0 || !el.hasAttribute('tabindex'))
            );
            
            expect(hasAltText).toBe(true);
            expect(hasLabels).toBe(true);
            expect(hasFocusableElements).toBe(true);
            
            // Test keyboard navigation
            await page.keyboard.press('Tab');
            const focusedElement = await page.evaluate(() => document.activeElement.tagName);
            expect(focusedElement).toBeTruthy();
            
            await page.screenshot({ path: `screenshots/accessibility_${Date.now()}.png` });
        });
    });

    describe('Performance Testing', () => {
        test('should load pages within acceptable time', async () => {
            const maxLoadTime = 3000; // 3 seconds
            
            const startTime = Date.now();
            await page.goto(`${baseURL}/login`);
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(maxLoadTime);
            
            // Test navigation performance
            await page.fill('#email', 'testuser@example.com');
            await page.fill('#password', 'TestPassword123!');
            await page.click('button[type="submit"]');
            
            const navStart = Date.now();
            await page.waitForURL('**/dashboard');
            const navTime = Date.now() - navStart;
            
            expect(navTime).toBeLessThan(maxLoadTime);
            
            // Test interactive elements
            const interactiveStart = Date.now();
            await page.click('.dashboard-content, .user-menu');
            await page.waitForLoadState('networkidle');
            const interactiveTime = Date.now() - interactiveStart;
            
            expect(interactiveTime).toBeLessThan(2000); // Interactive elements should respond quickly
            
            console.log(`Page load: ${loadTime}ms, Navigation: ${navTime}ms, Interactive: ${interactiveTime}ms`);
        });
    });
});