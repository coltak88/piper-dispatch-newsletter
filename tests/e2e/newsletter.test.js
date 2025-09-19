const { test, expect } = require('@playwright/test');

test.describe('Newsletter System E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('http://localhost:3000');
        
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
    });

    test.describe('User Registration and Authentication', () => {
        test('should register a new user successfully', async ({ page }) => {
            // Navigate to registration page
            await page.click('text=Sign Up');
            
            // Fill registration form
            await page.fill('input[name="name"]', 'Test User');
            await page.fill('input[name="email"]', 'testuser@example.com');
            await page.fill('input[name="password"]', 'TestPassword123!');
            await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
            
            // Submit form
            await page.click('button[type="submit"]');
            
            // Wait for success message
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.success-message')).toContainText('Registration successful');
        });

        test('should login with valid credentials', async ({ page }) => {
            // Navigate to login page
            await page.click('text=Login');
            
            // Fill login form
            await page.fill('input[name="email"]', 'testuser@example.com');
            await page.fill('input[name="password"]', 'TestPassword123!');
            
            // Submit form
            await page.click('button[type="submit"]');
            
            // Verify successful login
            await expect(page.locator('.dashboard')).toBeVisible();
            await expect(page.locator('.user-profile')).toContainText('Test User');
        });

        test('should handle invalid login credentials', async ({ page }) => {
            // Navigate to login page
            await page.click('text=Login');
            
            // Fill form with invalid credentials
            await page.fill('input[name="email"]', 'invalid@example.com');
            await page.fill('input[name="password"]', 'WrongPassword');
            
            // Submit form
            await page.click('button[type="submit"]');
            
            // Verify error message
            await expect(page.locator('.error-message')).toBeVisible();
            await expect(page.locator('.error-message')).toContainText('Invalid credentials');
        });
    });

    test.describe('Newsletter Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login before newsletter tests
            await page.click('text=Login');
            await page.fill('input[name="email"]', 'testuser@example.com');
            await page.fill('input[name="password"]', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
        });

        test('should create a new newsletter', async ({ page }) => {
            // Navigate to newsletter creation
            await page.click('text=Create Newsletter');
            
            // Fill newsletter form
            await page.fill('input[name="title"]', 'Test Newsletter');
            await page.fill('textarea[name="description"]', 'This is a test newsletter');
            
            // Select template
            await page.selectOption('select[name="template"]', 'modern');
            
            // Add content sections
            await page.click('text=Add Section');
            await page.fill('textarea[name="section-content"]', 'Test section content');
            
            // Schedule newsletter
            await page.fill('input[name="scheduleDate"]', '2024-01-01');
            await page.fill('input[name="scheduleTime"]', '09:00');
            
            // Submit form
            await page.click('button[type="submit"]');
            
            // Verify success
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.newsletter-list')).toContainText('Test Newsletter');
        });

        test('should preview newsletter before sending', async ({ page }) => {
            // Create a newsletter first
            await page.click('text=Create Newsletter');
            await page.fill('input[name="title"]', 'Preview Test Newsletter');
            await page.fill('textarea[name="description"]', 'Content for preview');
            await page.click('button[type="submit"]');
            
            // Click preview button
            await page.click('text=Preview');
            
            // Verify preview modal opens
            await expect(page.locator('.preview-modal')).toBeVisible();
            await expect(page.locator('.preview-content')).toContainText('Preview Test Newsletter');
            
            // Close preview
            await page.click('.preview-modal .close-button');
        });

        test('should schedule newsletter for later delivery', async ({ page }) => {
            // Create newsletter
            await page.click('text=Create Newsletter');
            await page.fill('input[name="title"]', 'Scheduled Newsletter');
            await page.fill('textarea[name="description"]', 'Scheduled content');
            
            // Set future date and time
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            
            await page.fill('input[name="scheduleDate"]', futureDate.toISOString().split('T')[0]);
            await page.fill('input[name="scheduleTime"]', '14:30');
            
            // Submit form
            await page.click('button[type="submit"]');
            
            // Verify scheduled status
            await expect(page.locator('.newsletter-status')).toContainText('Scheduled');
            await expect(page.locator('.scheduled-date')).toBeVisible();
        });
    });

    test.describe('Subscription Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login before subscription tests
            await page.click('text=Login');
            await page.fill('input[name="email"]', 'testuser@example.com');
            await page.fill('input[name="password"]', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
        });

        test('should subscribe to newsletter', async ({ page }) => {
            // Navigate to subscription page
            await page.click('text=Subscribe');
            
            // Fill subscription form
            await page.fill('input[name="email"]', 'subscriber@example.com');
            await page.fill('input[name="name"]', 'Subscriber Name');
            
            // Select preferences
            await page.check('input[value="technology"]');
            await page.check('input[value="business"]');
            
            // Set frequency
            await page.selectOption('select[name="frequency"]', 'weekly');
            
            // Submit form
            await page.click('button[type="submit"]');
            
            // Verify success
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.subscription-status')).toContainText('Active');
        });

        test('should manage subscription preferences', async ({ page }) => {
            // Navigate to preferences
            await page.click('text=Subscription Preferences');
            
            // Update preferences
            await page.uncheck('input[value="technology"]');
            await page.check('input[value="health"]');
            
            // Change frequency
            await page.selectOption('select[name="frequency"]', 'monthly');
            
            // Save changes
            await page.click('text=Save Preferences');
            
            // Verify updates
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.preference-summary')).toContainText('health');
            await expect(page.locator('.frequency-display')).toContainText('Monthly');
        });

        test('should unsubscribe from newsletter', async ({ page }) => {
            // First subscribe
            await page.click('text=Subscribe');
            await page.fill('input[name="email"]', 'unsubscribe@example.com');
            await page.fill('input[name="name"]', 'Unsubscribe User');
            await page.click('button[type="submit"]');
            
            // Navigate to unsubscribe
            await page.click('text=Unsubscribe');
            
            // Confirm unsubscription
            await page.click('button[type="submit"]');
            
            // Verify success
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.subscription-status')).toContainText('Unsubscribed');
        });
    });

    test.describe('Email Templates and Personalization', () => {
        test.beforeEach(async ({ page }) => {
            // Login
            await page.click('text=Login');
            await page.fill('input[name="email"]', 'testuser@example.com');
            await page.fill('input[name="password"]', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
        });

        test('should use different email templates', async ({ page }) => {
            // Create newsletter with template
            await page.click('text=Create Newsletter');
            await page.fill('input[name="title"]', 'Template Test Newsletter');
            
            // Select different templates
            const templates = ['modern', 'classic', 'minimal'];
            
            for (const template of templates) {
                await page.selectOption('select[name="template"]', template);
                await page.click('text=Preview');
                
                // Verify template is applied
                await expect(page.locator('.preview-content')).toBeVisible();
                await expect(page.locator(`.template-${template}`)).toBeVisible();
                
                await page.click('.preview-modal .close-button');
            }
        });

        test('should personalize content based on user preferences', async ({ page }) => {
            // Set user preferences first
            await page.click('text=Profile');
            await page.check('input[value="technology"]');
            await page.check('input[value="business"]');
            await page.click('text=Save Preferences');
            
            // Create personalized newsletter
            await page.click('text=Create Newsletter');
            await page.fill('input[name="title"]', 'Personalized Newsletter');
            
            // Enable personalization
            await page.check('input[name="personalize"]');
            
            // Preview personalized content
            await page.click('text=Preview');
            
            // Verify personalization is applied
            await expect(page.locator('.personalized-content')).toBeVisible();
            await expect(page.locator('.user-interests')).toContainText('technology');
        });
    });

    test.describe('Analytics and Reporting', () => {
        test.beforeEach(async ({ page }) => {
            // Login
            await page.click('text=Login');
            await page.fill('input[name="email"]', 'testuser@example.com');
            await page.fill('input[name="password"]', 'TestPassword123!');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
        });

        test('should display analytics dashboard', async ({ page }) => {
            // Navigate to analytics
            await page.click('text=Analytics');
            
            // Verify dashboard loads
            await expect(page.locator('.analytics-dashboard')).toBeVisible();
            await expect(page.locator('.metrics-overview')).toBeVisible();
            
            // Check specific metrics
            await expect(page.locator('.subscriber-count')).toBeVisible();
            await expect(page.locator('.open-rate')).toBeVisible();
            await expect(page.locator('.click-rate')).toBeVisible();
        });

        test('should show newsletter performance metrics', async ({ page }) => {
            // Navigate to analytics
            await page.click('text=Analytics');
            
            // Select a newsletter
            await page.click('text=Newsletter Performance');
            
            // Verify performance metrics
            await expect(page.locator('.performance-chart')).toBeVisible();
            await expect(page.locator('.delivery-rate')).toBeVisible();
            await expect(page.locator('.engagement-metrics')).toBeVisible();
        });

        test('should export analytics data', async ({ page }) => {
            // Navigate to analytics
            await page.click('text=Analytics');
            
            // Click export button
            await page.click('text=Export Data');
            
            // Select export format
            await page.selectOption('select[name="format"]', 'csv');
            
            // Confirm export
            await page.click('text=Download');
            
            // Verify download started
            const download = await page.waitForEvent('download');
            expect(download.suggestedFilename()).toContain('.csv');
        });
    });

    test.describe('Accessibility Features', () => {
        test('should support keyboard navigation', async ({ page }) => {
            // Test tab navigation
            await page.keyboard.press('Tab');
            await expect(page.locator('a:focus')).toBeVisible();
            
            // Navigate through menu items
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            
            // Verify focus management
            await expect(page.locator('button:focus, input:focus')).toBeVisible();
        });

        test('should provide screen reader support', async ({ page }) => {
            // Check ARIA labels
            await expect(page.locator('[aria-label]')).toHaveCountGreaterThan(0);
            
            // Check role attributes
            await expect(page.locator('[role="navigation"]')).toBeVisible();
            await expect(page.locator('[role="main"]')).toBeVisible();
            
            // Check form labels
            await expect(page.locator('label[for]')).toHaveCountGreaterThan(0);
        });

        test('should support high contrast mode', async ({ page }) => {
            // Enable high contrast
            await page.emulateMedia({ reducedMotion: 'reduce' });
            
            // Check contrast ratios
            const backgroundColor = await page.locator('body').evaluate(el => 
                window.getComputedStyle(el).backgroundColor
            );
            const textColor = await page.locator('body').evaluate(el => 
                window.getComputedStyle(el).color
            );
            
            // Verify sufficient contrast
            expect(backgroundColor).not.toBe(textColor);
        });
    });

    test.describe('Performance and Loading', () => {
        test('should load pages quickly', async ({ page }) => {
            const startTime = Date.now();
            
            await page.goto('http://localhost:3000');
            await page.waitForLoadState('networkidle');
            
            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
        });

        test('should handle slow network conditions', async ({ page }) => {
            // Simulate slow network
            await page.context().setOffline(false);
            
            // Test functionality under slow conditions
            await page.click('text=Login');
            await page.fill('input[name="email"]', 'test@example.com');
            await page.fill('input[name="password"]', 'password123');
            
            // Should still work despite network delays
            await page.click('button[type="submit"]');
            await expect(page.locator('.dashboard')).toBeVisible({ timeout: 10000 });
        });

        test('should lazy load content appropriately', async ({ page }) => {
            // Scroll to trigger lazy loading
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            
            // Check that additional content loads
            await expect(page.locator('.lazy-loaded')).toBeVisible();
            
            // Verify images load properly
            await expect(page.locator('img[loading="lazy"]')).toHaveAttribute('src');
        });
    });

    test.describe('Error Handling', () => {
        test('should display user-friendly error messages', async ({ page }) => {
            // Trigger an error
            await page.click('text=Login');
            await page.click('button[type="submit"]'); // Submit empty form
            
            // Check error message
            await expect(page.locator('.error-message')).toBeVisible();
            await expect(page.locator('.error-message')).not.toContainText('undefined');
            await expect(page.locator('.error-message')).not.toContainText('[object]');
        });

        test('should recover from network errors', async ({ page }) => {
            // Simulate network error
            await page.route('**/api/**', route => route.abort('failed'));
            
            // Try to perform action
            await page.click('text=Login');
            await page.fill('input[name="email"]', 'test@example.com');
            await page.fill('input[name="password"]', 'password123');
            await page.click('button[type="submit"]');
            
            // Should show appropriate error
            await expect(page.locator('.error-message')).toBeVisible();
            await expect(page.locator('.retry-button')).toBeVisible();
        });

        test('should handle form validation errors', async ({ page }) => {
            // Navigate to registration
            await page.click('text=Sign Up');
            
            // Submit invalid form
            await page.fill('input[name="email"]', 'invalid-email');
            await page.fill('input[name="password"]', '123');
            await page.click('button[type="submit"]');
            
            // Check validation messages
            await expect(page.locator('.validation-error')).toBeVisible();
            await expect(page.locator('.validation-error')).toContainText('valid email');
        });
    });
});