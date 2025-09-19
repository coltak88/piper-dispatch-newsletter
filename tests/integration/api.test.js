const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../server');
const SecurityService = require('../../services/SecurityService');
const EmailService = require('../../services/EmailService');
const PaymentService = require('../../services/PaymentService');

describe('API Integration Tests', () => {
    let sandbox;
    let authToken;
    let refreshToken;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        
        // Create test user and get auth tokens
        const testUser = {
            email: 'test@example.com',
            password: 'TestPassword123!',
            name: 'Test User'
        };

        // Register test user
        await request(app)
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);

        // Login to get tokens
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            })
            .expect(200);

        authToken = loginResponse.body.token;
        refreshToken = loginResponse.body.refreshToken;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Authentication Endpoints', () => {
        it('should register a new user', async () => {
            const newUser = {
                email: 'newuser@example.com',
                password: 'NewPassword123!',
                name: 'New User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect(201);

            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('userId');
        });

        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'TestPassword123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).to.have.property('token');
            expect(response.body).to.have.property('refreshToken');
            expect(response.body).to.have.property('user');
        });

        it('should refresh access token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body).to.have.property('token');
            expect(response.body).to.have.property('refreshToken');
        });

        it('should logout user', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).to.have.property('message');
        });
    });

    describe('User Management', () => {
        it('should get user profile', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).to.have.property('email');
            expect(response.body).to.have.property('name');
        });

        it('should update user profile', async () => {
            const updateData = {
                name: 'Updated Name',
                preferences: {
                    newsletterFrequency: 'weekly'
                }
            };

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).to.have.property('message');
        });

        it('should change password', async () => {
            const passwordData = {
                currentPassword: 'TestPassword123!',
                newPassword: 'NewPassword456!'
            };

            const response = await request(app)
                .put('/api/users/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send(passwordData)
                .expect(200);

            expect(response.body).to.have.property('message');
        });
    });

    describe('Email Service Integration', () => {
        beforeEach(() => {
            // Stub email service methods
            sandbox.stub(EmailService.prototype, 'sendEmail').resolves({
                messageId: 'test-message-id'
            });
        });

        it('should send welcome email', async () => {
            const emailData = {
                to: 'test@example.com',
                subject: 'Welcome to Piper Newsletter',
                template: 'welcome'
            };

            const response = await request(app)
                .post('/api/emails/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send(emailData)
                .expect(200);

            expect(response.body).to.have.property('messageId');
        });

        it('should handle email template rendering', async () => {
            const templateData = {
                template: 'welcome',
                data: {
                    userName: 'Test User',
                    companyName: 'Piper Newsletter'
                }
            };

            const response = await request(app)
                .post('/api/emails/render-template')
                .set('Authorization', `Bearer ${authToken}`)
                .send(templateData)
                .expect(200);

            expect(response.body).to.have.property('html');
            expect(response.body).to.have.property('text');
        });

        it('should handle bulk email operations', async () => {
            const bulkData = {
                recipients: ['user1@example.com', 'user2@example.com'],
                subject: 'Newsletter Update',
                template: 'newsletter',
                data: {
                    content: 'Latest newsletter content'
                }
            };

            const response = await request(app)
                .post('/api/emails/send-bulk')
                .set('Authorization', `Bearer ${authToken}`)
                .send(bulkData)
                .expect(200);

            expect(response.body).to.have.property('results');
            expect(response.body.results).to.be.an('array');
        });
    });

    describe('Payment Service Integration', () => {
        beforeEach(() => {
            // Stub payment service methods
            sandbox.stub(PaymentService.prototype, 'createCustomer').resolves({
                id: 'test-customer-id'
            });
            sandbox.stub(PaymentService.prototype, 'createSubscription').resolves({
                id: 'test-subscription-id'
            });
        });

        it('should create payment customer', async () => {
            const customerData = {
                email: 'test@example.com',
                name: 'Test User'
            };

            const response = await request(app)
                .post('/api/payments/customers')
                .set('Authorization', `Bearer ${authToken}`)
                .send(customerData)
                .expect(201);

            expect(response.body).to.have.property('customerId');
        });

        it('should create subscription', async () => {
            const subscriptionData = {
                customerId: 'test-customer-id',
                priceId: 'price_test',
                plan: 'premium'
            };

            const response = await request(app)
                .post('/api/payments/subscriptions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(subscriptionData)
                .expect(201);

            expect(response.body).to.have.property('subscriptionId');
        });

        it('should handle payment webhooks', async () => {
            const webhookData = {
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_test'
                    }
                }
            };

            const response = await request(app)
                .post('/api/payments/webhook')
                .send(webhookData)
                .expect(200);

            expect(response.body).to.have.property('received');
        });
    });

    describe('Security Endpoints', () => {
        it('should validate API key', async () => {
            const apiKeyData = {
                apiKey: 'test-api-key'
            };

            const response = await request(app)
                .post('/api/security/validate-api-key')
                .send(apiKeyData)
                .expect(200);

            expect(response.body).to.have.property('valid');
        });

        it('should check rate limiting', async () => {
            // Make multiple requests to test rate limiting
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    request(app)
                        .get('/api/security/rate-limit-test')
                        .set('Authorization', `Bearer ${authToken}`)
                );
            }

            const responses = await Promise.all(promises);
            const rateLimitedResponse = responses.find(r => r.status === 429);
            
            if (rateLimitedResponse) {
                expect(rateLimitedResponse.body).to.have.property('error');
                expect(rateLimitedResponse.body.error).to.include('rate limit');
            }
        });

        it('should handle security headers', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.headers).to.have.property('x-content-type-options');
            expect(response.headers).to.have.property('x-frame-options');
            expect(response.headers).to.have.property('x-xss-protection');
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 errors', async () => {
            const response = await request(app)
                .get('/api/nonexistent-endpoint')
                .expect(404);

            expect(response.body).to.have.property('error');
            expect(response.body.error).to.include('Not found');
        });

        it('should handle validation errors', async () => {
            const invalidData = {
                email: 'invalid-email',
                password: '123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidData)
                .expect(400);

            expect(response.body).to.have.property('error');
            expect(response.body).to.have.property('validationErrors');
        });

        it('should handle server errors gracefully', async () => {
            // Force a server error by providing invalid data
            sandbox.stub(SecurityService.prototype, 'hashPassword').throws(new Error('Hashing failed'));

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'error@example.com',
                    password: 'test123',
                    name: 'Error User'
                })
                .expect(500);

            expect(response.body).to.have.property('error');
            expect(response.body.error).to.include('Internal server error');
        });
    });

    describe('Rate Limiting', () => {
        it('should apply rate limiting to endpoints', async () => {
            const promises = [];
            
            // Make requests that should trigger rate limiting
            for (let i = 0; i < 15; i++) {
                promises.push(
                    request(app)
                        .post('/api/auth/login')
                        .send({
                            email: 'ratelimit@example.com',
                            password: 'wrongpassword'
                        })
                );
            }

            const responses = await Promise.all(promises);
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            
            expect(rateLimitedResponses.length).to.be.greaterThan(0);
        });
    });

    describe('CORS and Headers', () => {
        it('should handle CORS preflight requests', async () => {
            const response = await request(app)
                .options('/api/auth/login')
                .set('Origin', 'https://example.com')
                .set('Access-Control-Request-Method', 'POST')
                .expect(200);

            expect(response.headers).to.have.property('access-control-allow-origin');
            expect(response.headers).to.have.property('access-control-allow-methods');
        });

        it('should include security headers in responses', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.headers).to.have.property('x-content-type-options', 'nosniff');
            expect(response.headers).to.have.property('x-frame-options', 'DENY');
            expect(response.headers).to.have.property('x-xss-protection', '1; mode=block');
        });
    });

    describe('Health Checks', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).to.have.property('status');
            expect(response.body.status).to.equal('healthy');
            expect(response.body).to.have.property('timestamp');
        });

        it('should return detailed health check', async () => {
            const response = await request(app)
                .get('/api/health/detailed')
                .expect(200);

            expect(response.body).to.have.property('status');
            expect(response.body).to.have.property('services');
            expect(response.body.services).to.be.an('object');
        });
    });

    describe('Performance Testing', () => {
        it('should handle concurrent requests efficiently', async () => {
            const startTime = Date.now();
            const concurrentRequests = 50;
            
            const promises = [];
            for (let i = 0; i < concurrentRequests; i++) {
                promises.push(
                    request(app)
                        .get('/api/health')
                        .expect(200)
                );
            }

            await Promise.all(promises);
            const endTime = Date.now();
            const duration = endTime - startTime;

            // All requests should complete within reasonable time
            expect(duration).to.be.below(5000); // 5 seconds
        });

        it('should handle large payloads', async () => {
            const largeData = {
                content: 'x'.repeat(100000), // 100KB of data
                metadata: {
                    title: 'Large Content Test',
                    tags: Array(100).fill('tag')
                }
            };

            const response = await request(app)
                .post('/api/content/test-large-payload')
                .set('Authorization', `Bearer ${authToken}`)
                .send(largeData)
                .expect(200);

            expect(response.body).to.have.property('received');
        });
    });
});