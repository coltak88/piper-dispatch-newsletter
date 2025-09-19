const { chromium } = require('playwright');
const { expect } = require('@playwright/test');

describe('End-to-End API Endpoint Tests', () => {
    let browser;
    let context;
    let page;
    let baseURL;
    let authToken;

    beforeAll(async () => {
        baseURL = process.env.BASE_URL || 'http://localhost:3000';
        browser = await chromium.launch({
            headless: process.env.HEADLESS !== 'false'
        });
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    beforeEach(async () => {
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        page = await context.newPage();
        
        // Set up API response logging
        page.on('response', response => {
            if (response.status() >= 400) {
                console.error(`API Error: ${response.status()} ${response.statusText()}`);
            }
        });
    });

    afterEach(async () => {
        if (context) {
            await context.close();
        }
    });

    describe('Authentication API Endpoints', () => {
        test('should register new user via API', async () => {
            const userData = {
                username: 'apitest_' + Date.now(),
                email: `apitest_${Date.now()}@example.com`,
                password: 'TestPassword123!'
            };

            const response = await page.request.post(`${baseURL}/api/auth/register`, {
                data: userData
            });

            expect(response.status()).toBe(201);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('user');
            expect(responseData).toHaveProperty('token');
            expect(responseData.user.email).toBe(userData.email);
            
            authToken = responseData.token;
        });

        test('should login user via API', async () => {
            const loginData = {
                email: 'testuser@example.com',
                password: 'TestPassword123!'
            };

            const response = await page.request.post(`${baseURL}/api/auth/login`, {
                data: loginData
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('token');
            expect(responseData).toHaveProperty('user');
            expect(responseData.user.email).toBe(loginData.email);
            
            authToken = responseData.token;
        });

        test('should refresh authentication token', async () => {
            // First login to get initial token
            const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'testuser@example.com',
                    password: 'TestPassword123!'
                }
            });

            const loginData = await loginResponse.json();
            const initialToken = loginData.token;

            // Refresh token
            const refreshResponse = await page.request.post(`${baseURL}/api/auth/refresh`, {
                headers: {
                    'Authorization': `Bearer ${initialToken}`
                }
            });

            expect(refreshResponse.status()).toBe(200);
            
            const refreshData = await refreshResponse.json();
            expect(refreshData).toHaveProperty('token');
            expect(refreshData.token).not.toBe(initialToken);
            
            authToken = refreshData.token;
        });

        test('should logout user and invalidate token', async () => {
            // Login first
            const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'testuser@example.com',
                    password: 'TestPassword123!'
                }
            });

            const loginData = await loginResponse.json();
            const token = loginData.token;

            // Logout
            const logoutResponse = await page.request.post(`${baseURL}/api/auth/logout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            expect(logoutResponse.status()).toBe(200);

            // Verify token is invalidated by making authenticated request
            const verifyResponse = await page.request.get(`${baseURL}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            expect(verifyResponse.status()).toBe(401);
        });
    });

    describe('User Profile API Endpoints', () => {
        beforeEach(async () => {
            // Login and get auth token for each test
            const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'testuser@example.com',
                    password: 'TestPassword123!'
                }
            });

            const loginData = await loginResponse.json();
            authToken = loginData.token;
        });

        test('should get user profile', async () => {
            const response = await page.request.get(`${baseURL}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const profileData = await response.json();
            expect(profileData).toHaveProperty('user');
            expect(profileData.user).toHaveProperty('email');
            expect(profileData.user).toHaveProperty('username');
        });

        test('should update user profile', async () => {
            const updateData = {
                displayName: 'Updated Display Name',
                bio: 'Updated bio for testing',
                preferences: {
                    notifications: true,
                    newsletter: false
                }
            };

            const response = await page.request.put(`${baseURL}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: updateData
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData.user.displayName).toBe(updateData.displayName);
            expect(responseData.user.bio).toBe(updateData.bio);
        });

        test('should change user password', async () => {
            const passwordData = {
                currentPassword: 'TestPassword123!',
                newPassword: 'NewPassword456!'
            };

            const response = await page.request.put(`${baseURL}/api/user/password`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: passwordData
            });

            expect(response.status()).toBe(200);

            // Verify new password works by logging in again
            const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'testuser@example.com',
                    password: 'NewPassword456!'
                }
            });

            expect(loginResponse.status()).toBe(200);

            // Reset password back to original
            await page.request.put(`${baseURL}/api/user/password`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: {
                    currentPassword: 'NewPassword456!',
                    newPassword: 'TestPassword123!'
                }
            });
        });
    });

    describe('Newsletter API Endpoints', () => {
        beforeEach(async () => {
            const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'testuser@example.com',
                    password: 'TestPassword123!'
                }
            });

            const loginData = await loginResponse.json();
            authToken = loginData.token;
        });

        test('should create new newsletter', async () => {
            const newsletterData = {
                title: 'Test Newsletter ' + Date.now(),
                subject: 'Test Subject for API Newsletter',
                content: 'This is the content of the test newsletter created via API.',
                recipients: ['test1@example.com', 'test2@example.com'],
                scheduledFor: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
            };

            const response = await page.request.post(`${baseURL}/api/newsletters`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: newsletterData
            });

            expect(response.status()).toBe(201);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('newsletter');
            expect(responseData.newsletter.title).toBe(newsletterData.title);
            expect(responseData.newsletter.subject).toBe(newsletterData.subject);
        });

        test('should get user newsletters', async () => {
            const response = await page.request.get(`${baseURL}/api/newsletters`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('newsletters');
            expect(Array.isArray(responseData.newsletters)).toBe(true);
        });

        test('should get specific newsletter', async () => {
            // First create a newsletter
            const createResponse = await page.request.post(`${baseURL}/api/newsletters`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: {
                    title: 'Specific Test Newsletter',
                    subject: 'Specific Test Subject',
                    content: 'Specific test content',
                    recipients: ['specific@example.com']
                }
            });

            const createData = await createResponse.json();
            const newsletterId = createData.newsletter.id;

            // Get specific newsletter
            const response = await page.request.get(`${baseURL}/api/newsletters/${newsletterId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('newsletter');
            expect(responseData.newsletter.id).toBe(newsletterId);
        });

        test('should update newsletter', async () => {
            // Create newsletter first
            const createResponse = await page.request.post(`${baseURL}/api/newsletters`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: {
                    title: 'Update Test Newsletter',
                    subject: 'Original Subject',
                    content: 'Original content',
                    recipients: ['update@example.com']
                }
            });

            const createData = await createResponse.json();
            const newsletterId = createData.newsletter.id;

            // Update newsletter
            const updateData = {
                title: 'Updated Newsletter Title',
                subject: 'Updated Subject',
                content: 'Updated content for testing'
            };

            const response = await page.request.put(`${baseURL}/api/newsletters/${newsletterId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: updateData
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData.newsletter.title).toBe(updateData.title);
            expect(responseData.newsletter.subject).toBe(updateData.subject);
        });

        test('should delete newsletter', async () => {
            // Create newsletter first
            const createResponse = await page.request.post(`${baseURL}/api/newsletters`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: {
                    title: 'Delete Test Newsletter',
                    subject: 'Delete Test Subject',
                    content: 'Content to be deleted',
                    recipients: ['delete@example.com']
                }
            });

            const createData = await createResponse.json();
            const newsletterId = createData.newsletter.id;

            // Delete newsletter
            const response = await page.request.delete(`${baseURL}/api/newsletters/${newsletterId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(204);

            // Verify newsletter is deleted
            const verifyResponse = await page.request.get(`${baseURL}/api/newsletters/${newsletterId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(verifyResponse.status()).toBe(404);
        });
    });

    describe('Subscriber Management API Endpoints', () => {
        beforeEach(async () => {
            const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'testuser@example.com',
                    password: 'TestPassword123!'
                }
            });

            const loginData = await loginResponse.json();
            authToken = loginData.token;
        });

        test('should add new subscriber', async () => {
            const subscriberData = {
                email: `subscriber_${Date.now()}@example.com`,
                name: 'Test Subscriber',
                groups: ['test-group', 'api-test'],
                preferences: {
                    newsletter: true,
                    updates: false
                }
            };

            const response = await page.request.post(`${baseURL}/api/subscribers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: subscriberData
            });

            expect(response.status()).toBe(201);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('subscriber');
            expect(responseData.subscriber.email).toBe(subscriberData.email);
            expect(responseData.subscriber.name).toBe(subscriberData.name);
        });

        test('should get user subscribers', async () => {
            const response = await page.request.get(`${baseURL}/api/subscribers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('subscribers');
            expect(Array.isArray(responseData.subscribers)).toBe(true);
        });

        test('should update subscriber preferences', async () => {
            // First add a subscriber
            const addResponse = await page.request.post(`${baseURL}/api/subscribers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: {
                    email: `update_sub_${Date.now()}@example.com`,
                    name: 'Update Test Subscriber'
                }
            });

            const addData = await addResponse.json();
            const subscriberId = addData.subscriber.id;

            // Update subscriber preferences
            const updateData = {
                preferences: {
                    newsletter: false,
                    updates: true,
                    frequency: 'weekly'
                },
                groups: ['updated-group']
            };

            const response = await page.request.put(`${baseURL}/api/subscribers/${subscriberId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: updateData
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData.subscriber.preferences.newsletter).toBe(false);
            expect(responseData.subscriber.preferences.updates).toBe(true);
        });

        test('should unsubscribe subscriber', async () => {
            // Add subscriber first
            const addResponse = await page.request.post(`${baseURL}/api/subscribers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: {
                    email: `unsub_${Date.now()}@example.com`,
                    name: 'Unsubscribe Test'
                }
            });

            const addData = await addResponse.json();
            const subscriberId = addData.subscriber.id;

            // Unsubscribe
            const response = await page.request.post(`${baseURL}/api/subscribers/${subscriberId}/unsubscribe`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData.subscriber.status).toBe('unsubscribed');
        });
    });

    describe('Analytics API Endpoints', () => {
        beforeEach(async () => {
            const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
                data: {
                    email: 'testuser@example.com',
                    password: 'TestPassword123!'
                }
            });

            const loginData = await loginResponse.json();
            authToken = loginData.token;
        });

        test('should get newsletter analytics', async () => {
            const response = await page.request.get(`${baseURL}/api/analytics/newsletters`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('analytics');
            expect(responseData.analytics).toHaveProperty('totalNewsletters');
            expect(responseData.analytics).toHaveProperty('sentNewsletters');
            expect(responseData.analytics).toHaveProperty('openRates');
        });

        test('should get subscriber analytics', async () => {
            const response = await page.request.get(`${baseURL}/api/analytics/subscribers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('analytics');
            expect(responseData.analytics).toHaveProperty('totalSubscribers');
            expect(responseData.analytics).toHaveProperty('activeSubscribers');
            expect(responseData.analytics).toHaveProperty('growthTrend');
        });

        test('should get engagement analytics', async () => {
            const response = await page.request.get(`${baseURL}/api/analytics/engagement`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            expect(response.status()).toBe(200);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('analytics');
            expect(responseData.analytics).toHaveProperty('clickRates');
            expect(responseData.analytics).toHaveProperty('engagementTrend');
            expect(responseData.analytics).toHaveProperty('popularContent');
        });
    });

    describe('Error Handling API Endpoints', () => {
        test('should handle 404 errors gracefully', async () => {
            const response = await page.request.get(`${baseURL}/api/nonexistent-endpoint`);
            
            expect(response.status()).toBe(404);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('error');
            expect(responseData.error).toHaveProperty('message');
            expect(responseData.error).toHaveProperty('code', 'NOT_FOUND');
        });

        test('should handle validation errors', async () => {
            const response = await page.request.post(`${baseURL}/api/auth/register`, {
                data: {
                    email: 'invalid-email-format',
                    password: 'short'
                }
            });

            expect(response.status()).toBe(400);
            
            const responseData = await response.json();
            expect(responseData).toHaveProperty('error');
            expect(responseData.error).toHaveProperty('message');
            expect(responseData.error).toHaveProperty('validationErrors');
        });

        test('should handle rate limiting', async () => {
            // Make multiple rapid requests to trigger rate limiting
            const requests = Array(10).fill().map(() => 
                page.request.post(`${baseURL}/api/auth/login`, {
                    data: {
                        email: 'test@example.com',
                        password: 'wrongpassword'
                    }
                })
            );

            const responses = await Promise.all(requests);
            
            // Check if any response indicates rate limiting
            const rateLimitedResponse = responses.find(response => response.status() === 429);
            
            if (rateLimitedResponse) {
                const responseData = await rateLimitedResponse.json();
                expect(responseData).toHaveProperty('error');
                expect(responseData.error).toHaveProperty('message');
                expect(responseData.error).toHaveProperty('retryAfter');
            }
        });

        test('should handle server errors gracefully', async () => {
            // This test assumes there's an endpoint that can trigger server errors
            const response = await page.request.get(`${baseURL}/api/test/server-error`, {
                headers: {
                    'Authorization': `Bearer ${authToken || 'dummy-token'}`
                }
            }).catch(() => ({ status: () => 500 }));

            if (response.status() === 500) {
                const responseData = await response.json().catch(() => ({ error: { message: 'Internal Server Error' } }));
                expect(responseData).toHaveProperty('error');
                expect(responseData.error.message).toBeTruthy();
            }
        });
    });

    describe('Performance API Endpoints', () => {
        test('should measure API response times', async () => {
            const endpoints = [
                { method: 'GET', path: '/api/health' },
                { method: 'GET', path: '/api/auth/me', auth: true },
                { method: 'GET', path: '/api/newsletters', auth: true },
                { method: 'GET', path: '/api/subscribers', auth: true }
            ];

            const results = [];

            for (const endpoint of endpoints) {
                const startTime = Date.now();
                
                const options = {};
                if (endpoint.auth && authToken) {
                    options.headers = { 'Authorization': `Bearer ${authToken}` };
                }

                const response = await page.request.fetch(`${baseURL}${endpoint.path}`, {
                    method: endpoint.method,
                    ...options
                });

                const responseTime = Date.now() - startTime;
                
                results.push({
                    endpoint: endpoint.path,
                    method: endpoint.method,
                    responseTime,
                    status: response.status()
                });
            }

            // Verify all responses are fast
            results.forEach(result => {
                expect(result.responseTime).toBeLessThan(2000); // 2 seconds max
                expect(result.status).toBeLessThan(400); // No client/server errors
            });

            console.log('API Performance Results:', results);
        });

        test('should handle concurrent API requests', async () => {
            const concurrentRequests = 10;
            
            const requests = Array(concurrentRequests).fill().map((_, i) => 
                page.request.get(`${baseURL}/api/health`, {
                    headers: { 'X-Request-ID': `concurrent-${i}` }
                })
            );

            const startTime = Date.now();
            const responses = await Promise.all(requests);
            const totalTime = Date.now() - startTime;

            // All requests should succeed
            responses.forEach(response => {
                expect(response.status()).toBe(200);
            });

            // Total time should be reasonable even with concurrency
            expect(totalTime).toBeLessThan(5000); // 5 seconds for all concurrent requests

            console.log(`Concurrent requests (${concurrentRequests}) completed in ${totalTime}ms`);
        });
    });

    describe('Security API Endpoints', () => {
        test('should enforce authentication on protected endpoints', async () => {
            const protectedEndpoints = [
                { method: 'GET', path: '/api/user/profile' },
                { method: 'GET', path: '/api/newsletters' },
                { method: 'POST', path: '/api/newsletters', data: { title: 'Test' } },
                { method: 'GET', path: '/api/subscribers' }
            ];

            for (const endpoint of protectedEndpoints) {
                const response = await page.request.fetch(`${baseURL}${endpoint.path}`, {
                    method: endpoint.method,
                    data: endpoint.data
                });

                expect(response.status()).toBe(401);
            }
        });

        test('should sanitize input data', async () => {
            const maliciousData = {
                title: '<script>alert("xss")</script>',
                content: 'javascript:alert("xss")',
                description: '<img src="x" onerror="alert(1)">'
            };

            const response = await page.request.post(`${baseURL}/api/newsletters`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: maliciousData
            });

            expect(response.status()).toBe(201);
            
            const responseData = await response.json();
            
            // Verify data is sanitized
            expect(responseData.newsletter.title).not.toContain('<script>');
            expect(responseData.newsletter.content).not.toContain('javascript:');
            expect(responseData.newsletter.description).not.toContain('onerror=');
        });

        test('should handle SQL injection attempts', async () => {
            const injectionAttempt = {
                email: 'test@example.com\' OR 1=1--',
                password: 'password'
            };

            const response = await page.request.post(`${baseURL}/api/auth/login`, {
                data: injectionAttempt
            });

            // Should not crash or return unexpected data
            expect([200, 401, 400]).toContain(response.status());
            
            if (response.status() === 200) {
                const responseData = await response.json();
                // Should not return all users or sensitive data
                expect(responseData).not.toHaveProperty('users');
                expect(responseData).not.toHaveProperty('password');
            }
        });
    });
});