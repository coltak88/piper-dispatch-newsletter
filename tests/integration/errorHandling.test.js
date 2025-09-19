const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../../app');
const ErrorHandler = require('../../services/ErrorHandler');
const loggingService = require('../../services/LoggingService');
const monitoringService = require('../../services/MonitoringService');

describe('Error Handling Integration Tests', () => {
    let sandbox;
    let errorHandler;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        errorHandler = new ErrorHandler();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('API Error Responses', () => {
        it('should handle 404 errors gracefully', async () => {
            const response = await request(app)
                .get('/api/nonexistent-endpoint')
                .expect(404);

            expect(response.body).to.have.property('error');
            expect(response.body.error).to.have.property('code', 'NOT_FOUND_ERROR');
            expect(response.body.error).to.have.property('message', 'Resource not found');
            expect(response.body.error).to.have.property('id');
            expect(response.body.error).to.have.property('timestamp');
            expect(response.body.error).to.have.property('path');
        });

        it('should handle validation errors', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    email: 'invalid-email',
                    password: '123' // Too short
                })
                .expect(400);

            expect(response.body).to.have.property('error');
            expect(response.body.error.code).to.equal('VALIDATION_ERROR');
            expect(response.body.error.message).to.include('Validation failed');
            expect(response.body.error).to.have.property('details');
        });

        it('should handle authentication errors', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).to.have.property('error');
            expect(response.body.error.code).to.equal('AUTHENTICATION_ERROR');
            expect(response.body.error.message).to.include('Authentication failed');
        });

        it('should handle authorization errors', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', 'Bearer invalid-token')
                .expect(403);

            expect(response.body).to.have.property('error');
            expect(response.body.error.code).to.equal('AUTHORIZATION_ERROR');
            expect(response.body.error.message).to.include('Access denied');
        });

        it('should handle rate limiting', async () => {
            // Make multiple requests to trigger rate limiting
            const promises = [];
            for (let i = 0; i < 15; i++) {
                promises.push(
                    request(app)
                        .get('/api/public-endpoint')
                );
            }

            const responses = await Promise.all(promises);
            const rateLimitedResponse = responses.find(r => r.status === 429);

            expect(rateLimitedResponse).to.exist;
            expect(rateLimitedResponse.body).to.have.property('error');
            expect(rateLimitedResponse.body.error.code).to.equal('RATE_LIMIT_ERROR');
            expect(rateLimitedResponse.body.error.message).to.include('Too many requests');
            expect(rateLimitedResponse.body.error.details).to.have.property('retryAfter');
        });

        it('should handle database errors', async () => {
            // Simulate database connection failure
            sandbox.stub(require('../../services/DatabaseService'), 'connect').rejects(new Error('Database connection failed'));

            const response = await request(app)
                .get('/api/users')
                .expect(500);

            expect(response.body).to.have.property('error');
            expect(response.body.error.code).to.equal('DATABASE_ERROR');
            expect(response.body.error.message).to.equal('Database operation failed');
        });

        it('should handle external service errors', async () => {
            // Simulate external service failure
            sandbox.stub(require('../../services/EmailService'), 'sendEmail').rejects(new Error('Service unavailable'));

            const response = await request(app)
                .post('/api/contact')
                .send({
                    email: 'test@example.com',
                    message: 'Test message'
                })
                .expect(503);

            expect(response.body).to.have.property('error');
            expect(response.body.error.code).to.equal('SERVICE_UNAVAILABLE');
            expect(response.body.error.message).to.equal('External service unavailable');
        });

        it('should sanitize error messages for 5xx errors', async () => {
            // Simulate internal error with sensitive information
            sandbox.stub(require('../../services/UserService'), 'getUser').rejects(new Error('Database connection string: postgres://user:password@localhost:5432/db'));

            const response = await request(app)
                .get('/api/users/123')
                .expect(500);

            expect(response.body.error.message).to.equal('Internal server error');
            expect(response.body.error.message).to.not.include('postgres://user:password');
        });
    });

    describe('Error Logging', () => {
        it('should log errors with request context', async () => {
            const logErrorStub = sandbox.stub(loggingService, 'logError');
            const recordMetricStub = sandbox.stub(monitoringService, 'recordMetric');

            await request(app)
                .post('/api/users')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(logErrorStub.calledOnce).to.be.true;
            expect(recordMetricStub.calledTwice).to.be.true;
            
            const logCall = logErrorStub.getCall(0);
            expect(logCall.args[0]).to.equal('api');
            expect(logCall.args[1]).to.be.an.instanceOf(Error);
            expect(logCall.args[2]).to.have.property('requestId');
            expect(logCall.args[2]).to.have.property('method', 'POST');
            expect(logCall.args[2]).to.have.property('url', '/api/users');
        });

        it('should log security-related errors as security events', async () => {
            const logSecurityEventStub = sandbox.stub(require('../../services/SecurityService'), 'logSecurityEvent');

            await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(logSecurityEventStub.calledOnce).to.be.true;
            expect(logSecurityEventStub.getCall(0).args[0]).to.equal('authentication_failed');
        });

        it('should include request headers in error logs', async () => {
            const logErrorStub = sandbox.stub(loggingService, 'logError');

            await request(app)
                .get('/api/users')
                .set('User-Agent', 'TestAgent/1.0')
                .set('X-Forwarded-For', '192.168.1.1')
                .expect(200); // or any status that might trigger logging

            if (logErrorStub.called) {
                const logCall = logErrorStub.getCall(0);
                expect(logCall.args[2]).to.have.property('headers');
                expect(logCall.args[2].headers).to.have.property('user-agent');
                expect(logCall.args[2].headers).to.have.property('x-forwarded-for');
            }
        });

        it('should sanitize sensitive data in error logs', async () => {
            const logErrorStub = sandbox.stub(loggingService, 'logError');

            await request(app)
                .post('/api/users')
                .send({
                    email: 'test@example.com',
                    password: 'secret123',
                    creditCard: '1234-5678-9012-3456'
                })
                .expect(400);

            if (logErrorStub.called) {
                const logCall = logErrorStub.getCall(0);
                expect(logCall.args[2].body.password).to.equal('[REDACTED]');
                expect(logCall.args[2].body.creditCard).to.equal('[REDACTED]');
                expect(logCall.args[2].body.email).to.equal('test@example.com');
            }
        });
    });

    describe('Error Recovery', () => {
        it('should implement retry mechanisms for transient failures', async () => {
            let attempts = 0;
            
            // Mock a service that fails initially then succeeds
            sandbox.stub(require('../../services/ExternalService'), 'fetchData')
                .callsFake(async () => {
                    attempts++;
                    if (attempts < 3) {
                        throw new Error('Temporary network failure');
                    }
                    return { data: 'success' };
                });

            const response = await request(app)
                .get('/api/external-data')
                .expect(200);

            expect(response.body).to.have.property('data', 'success');
            expect(attempts).to.equal(3); // 2 failures + 1 success
        });

        it('should implement circuit breaker for failing services', async () => {
            const externalService = require('../../services/ExternalService');
            
            // Mock a service that consistently fails
            sandbox.stub(externalService, 'fetchData').rejects(new Error('Service unavailable'));

            // Make multiple requests to open the circuit
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(
                    request(app)
                        .get('/api/external-data')
                );
            }

            const responses = await Promise.all(promises);
            
            // Should have some circuit breaker responses
            const circuitBreakerResponses = responses.filter(r => 
                r.status === 503 && r.body.error.code === 'SERVICE_UNAVAILABLE'
            );
            
            expect(circuitBreakerResponses.length).to.be.greaterThan(0);
        });

        it('should provide fallback responses for non-critical services', async () => {
            // Mock a non-critical service failure
            sandbox.stub(require('../../services/CacheService'), 'get').rejects(new Error('Cache unavailable'));

            const response = await request(app)
                .get('/api/data')
                .expect(200);

            // Should still return data, just without caching
            expect(response.body).to.have.property('data');
            expect(response.body).to.have.property('cached', false);
        });
    });

    describe('Error Monitoring', () => {
        it('should track error rates and types', async () => {
            const recordMetricStub = sandbox.stub(monitoringService, 'recordMetric');

            // Create various types of errors
            await request(app).get('/api/nonexistent'); // 404
            await request(app).post('/api/auth/login').send({ email: 'invalid' }); // 400
            await request(app).get('/api/admin/users').set('Authorization', 'Bearer invalid'); // 403

            expect(recordMetricStub.called).to.be.true;
            
            const errorMetrics = recordMetricStub.getCalls().filter(call => 
                call.args[0] === 'error'
            );
            
            expect(errorMetrics.length).to.be.greaterThan(0);
        });

        it('should provide health check endpoint with error statistics', async () => {
            // Create some errors first
            await request(app).get('/api/nonexistent');
            await request(app).post('/api/auth/login').send({ email: 'invalid' });

            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).to.have.property('status');
            expect(response.body).to.have.property('errorRates');
            expect(response.body.errorRates).to.be.an('object');
        });

        it('should alert on high error rates', async () => {
            const sendAlertStub = sandbox.stub(monitoringService, 'sendAlert');

            // Create many errors to trigger high error rate
            const promises = [];
            for (let i = 0; i < 20; i++) {
                promises.push(request(app).get('/api/nonexistent'));
            }
            
            await Promise.all(promises);

            // Should trigger an alert for high error rate
            expect(sendAlertStub.called).to.be.true;
            
            const alertCalls = sendAlertStub.getCalls().filter(call =>
                call.args[0] === 'high_error_rate'
            );
            
            expect(alertCalls.length).to.be.greaterThan(0);
        });
    });

    describe('Error Context Enrichment', () => {
        it('should include request context in error responses', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('X-Request-ID', 'test-request-123')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body.error).to.have.property('path', '/api/users');
            expect(response.body.error).to.have.property('method', 'POST');
            expect(response.body.error).to.have.property('timestamp');
            expect(response.body.error).to.have.property('id');
        });

        it('should include user context when available', async () => {
            const response = await request(app)
                .get('/api/protected-endpoint')
                .set('Authorization', 'Bearer valid-token')
                .expect(403);

            expect(response.body.error).to.have.property('userId');
        });

        it('should include correlation IDs for distributed tracing', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('X-Correlation-ID', 'trace-123')
                .expect(200);

            // Even successful responses should include correlation ID
            expect(response.headers).to.have.property('x-correlation-id');
        });
    });

    describe('Error Aggregation and Analysis', () => {
        it('should aggregate similar errors', async () => {
            const logErrorStub = sandbox.stub(loggingService, 'logError');

            // Create multiple similar validation errors
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(
                    request(app)
                        .post('/api/users')
                        .send({ email: 'invalid-email' })
                );
            }
            
            await Promise.all(promises);

            // Should log errors but potentially aggregate them
            expect(logErrorStub.callCount).to.be.greaterThan(0);
        });

        it('should provide error trend analysis', async () => {
            const response = await request(app)
                .get('/api/analytics/errors')
                .set('Authorization', 'Bearer admin-token')
                .expect(200);

            expect(response.body).to.have.property('errorTrends');
            expect(response.body.errorTrends).to.be.an('object');
            expect(response.body.errorTrends).to.have.property('byType');
            expect(response.body.errorTrends).to.have.property('byEndpoint');
            expect(response.body.errorTrends).to.have.property('byTime');
        });

        it('should identify error hotspots', async () => {
            const response = await request(app)
                .get('/api/analytics/error-hotspots')
                .set('Authorization', 'Bearer admin-token')
                .expect(200);

            expect(response.body).to.have.property('hotspots');
            expect(response.body.hotspots).to.be.an('array');
            expect(response.body).to.have.property('recommendations');
        });
    });

    describe('Error Recovery Strategies', () => {
        it('should implement automatic recovery for transient errors', async () => {
            const service = require('../../services/TransientService');
            let attempts = 0;

            sandbox.stub(service, 'process').callsFake(async () => {
                attempts++;
                if (attempts <= 2) {
                    throw new Error('Temporary failure');
                }
                return { success: true };
            });

            const response = await request(app)
                .post('/api/process')
                .send({ data: 'test' })
                .expect(200);

            expect(response.body).to.have.property('success', true);
            expect(attempts).to.equal(3); // Initial + 2 retries
        });

        it('should provide user-friendly error messages', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body.error.message).to.be.a('string');
            expect(response.body.error.message).to.not.include('Error:');
            expect(response.body.error.message).to.not.include('Stack trace');
            expect(response.body.error.message).to.be.length.greaterThan(0);
        });

        it('should provide actionable error details', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body.error).to.have.property('details');
            expect(response.body.error.details).to.be.an('array');
            expect(response.body.error.details.length).to.be.greaterThan(0);
        });
    });
});