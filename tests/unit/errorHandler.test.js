const { expect } = require('chai');
const sinon = require('sinon');
const ErrorHandler = require('../../services/ErrorHandler');
const loggingService = require('../../services/LoggingService');
const monitoringService = require('../../services/MonitoringService');

describe('ErrorHandler', () => {
    let errorHandler;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        errorHandler = new ErrorHandler();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Constructor', () => {
        it('should initialize with default configuration', () => {
            expect(errorHandler).to.be.an.instanceOf(ErrorHandler);
            expect(errorHandler.isShuttingDown).to.be.false;
            expect(errorHandler.errorCounts).to.be.an.instanceOf(Map);
            expect(errorHandler.lastErrorTime).to.be.an.instanceOf(Map);
        });

        it('should setup global handlers', () => {
            const processOnStub = sandbox.stub(process, 'on');
            const newErrorHandler = new ErrorHandler();
            
            expect(processOnStub.calledWith('uncaughtException')).to.be.true;
            expect(processOnStub.calledWith('unhandledRejection')).to.be.true;
            expect(processOnStub.calledWith('SIGTERM')).to.be.true;
            expect(processOnStub.calledWith('SIGINT')).to.be.true;
        });
    });

    describe('Error Categorization', () => {
        it('should categorize validation errors', () => {
            const error = new Error('Validation failed');
            error.name = 'ValidationError';
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(400);
            expect(result.errorCode).to.equal('VALIDATION_ERROR');
            expect(result.message).to.equal('Validation failed');
        });

        it('should categorize authentication errors', () => {
            const error = new Error('Authentication failed');
            error.name = 'AuthenticationError';
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(401);
            expect(result.errorCode).to.equal('AUTHENTICATION_ERROR');
            expect(result.message).to.equal('Authentication failed');
        });

        it('should categorize authorization errors', () => {
            const error = new Error('Access denied');
            error.name = 'AuthorizationError';
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(403);
            expect(result.errorCode).to.equal('AUTHORIZATION_ERROR');
            expect(result.message).to.equal('Access denied');
        });

        it('should categorize not found errors', () => {
            const error = new Error('Resource not found');
            error.name = 'NotFoundError';
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(404);
            expect(result.errorCode).to.equal('NOT_FOUND_ERROR');
            expect(result.message).to.equal('Resource not found');
        });

        it('should categorize rate limit errors', () => {
            const error = new Error('Too many requests');
            error.name = 'RateLimitError';
            error.retryAfter = 60;
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(429);
            expect(result.errorCode).to.equal('RATE_LIMIT_ERROR');
            expect(result.details.retryAfter).to.equal(60);
        });

        it('should categorize database errors', () => {
            const error = new Error('Database connection failed');
            error.name = 'DatabaseError';
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(500);
            expect(result.errorCode).to.equal('DATABASE_ERROR');
            expect(result.message).to.equal('Database operation failed');
        });

        it('should categorize external service errors', () => {
            const error = new Error('Service unavailable');
            error.name = 'ExternalServiceError';
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(503);
            expect(result.errorCode).to.equal('SERVICE_UNAVAILABLE');
            expect(result.message).to.equal('External service unavailable');
        });

        it('should categorize unknown errors as internal server error', () => {
            const error = new Error('Unknown error');
            
            const result = errorHandler.categorizeError(error);
            
            expect(result.statusCode).to.equal(500);
            expect(result.errorCode).to.equal('INTERNAL_SERVER_ERROR');
            expect(result.message).to.equal('Internal server error');
        });
    });

    describe('Error Response Creation', () => {
        it('should create standardized error response', () => {
            const error = new Error('Test error');
            error.name = 'ValidationError';
            
            const req = {
                path: '/api/test',
                method: 'POST'
            };
            
            const result = errorHandler.createErrorResponse(error, req);
            
            expect(result.response).to.have.property('error');
            expect(result.response.error).to.have.property('id');
            expect(result.response.error).to.have.property('code');
            expect(result.response.error).to.have.property('message');
            expect(result.response.error).to.have.property('timestamp');
            expect(result.response.error).to.have.property('path');
            expect(result.statusCode).to.equal(400);
        });

        it('should include details in development mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';
            
            const error = new Error('Test error');
            error.name = 'ValidationError';
            error.errors = ['Field 1 is required', 'Field 2 is invalid'];
            
            const result = errorHandler.createErrorResponse(error);
            
            expect(result.response.error).to.have.property('details');
            expect(result.response.error.details).to.deep.equal(error.errors);
            
            process.env.NODE_ENV = originalEnv;
        });

        it('should sanitize error messages for 5xx errors', () => {
            const error = new Error('Database connection string with password');
            error.name = 'DatabaseError';
            
            const result = errorHandler.createErrorResponse(error);
            
            expect(result.response.error.message).to.equal('Internal server error');
            expect(result.statusCode).to.equal(500);
        });
    });

    describe('Error Logging', () => {
        it('should log errors with context', () => {
            const logErrorStub = sandbox.stub(errorHandler.logger, 'logError');
            const recordMetricStub = sandbox.stub(errorHandler.monitoring, 'recordMetric');
            
            const error = new Error('Test error');
            const req = {
                method: 'POST',
                originalUrl: '/api/test',
                headers: { 'content-type': 'application/json' },
                body: { test: 'data' },
                ip: '127.0.0.1',
                user: { id: 'user123' }
            };
            
            const context = { errorId: 'test123' };
            
            errorHandler.logError(error, req, context);
            
            expect(logErrorStub.calledOnce).to.be.true;
            expect(recordMetricStub.calledTwice).to.be.true;
        });

        it('should rate limit error logging', () => {
            const logErrorStub = sandbox.stub(errorHandler.logger, 'logError');
            
            const error = new Error('Test error');
            error.name = 'TestError';
            
            // Log the same error multiple times quickly
            for (let i = 0; i < 15; i++) {
                errorHandler.logError(error);
            }
            
            // Should be rate limited after 10 logs
            expect(logErrorStub.callCount).to.be.lessThan(15);
        });

        it('should log security-related errors as security events', () => {
            const logSecurityEventStub = sandbox.stub(errorHandler.security, 'logSecurityEvent');
            
            const error = new Error('Authentication failed');
            error.name = 'AuthenticationError';
            
            const req = {
                ip: '192.168.1.1',
                user: { id: 'user123' }
            };
            
            errorHandler.logError(error, req);
            
            expect(logSecurityEventStub.calledOnce).to.be.true;
        });
    });

    describe('Retry Mechanism', () => {
        it('should retry failed operations', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Temporary failure');
                }
                return 'success';
            };
            
            const result = await errorHandler.retryOperation(operation, {
                maxRetries: 3,
                retryDelay: 10
            });
            
            expect(result).to.equal('success');
            expect(attempts).to.equal(3);
        });

        it('should fail after max retries', async () => {
            const operation = async () => {
                throw new Error('Persistent failure');
            };
            
            try {
                await errorHandler.retryOperation(operation, {
                    maxRetries: 2,
                    retryDelay: 10
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Persistent failure');
            }
        });

        it('should implement exponential backoff', async () => {
            const delays = [];
            const operation = async () => {
                delays.push(Date.now());
                throw new Error('Temporary failure');
            };
            
            try {
                await errorHandler.retryOperation(operation, {
                    maxRetries: 3,
                    retryDelay: 50,
                    backoffMultiplier: 2
                });
            } catch (error) {
                // Expected to fail
            }
            
            expect(delays.length).to.equal(4); // Initial attempt + 3 retries
            
            // Check that delays increase exponentially
            const delay1 = delays[1] - delays[0];
            const delay2 = delays[2] - delays[1];
            const delay3 = delays[3] - delays[2];
            
            expect(delay2).to.be.greaterThan(delay1);
            expect(delay3).to.be.greaterThan(delay2);
        });
    });

    describe('Circuit Breaker', () => {
        it('should open circuit after threshold failures', async () => {
            const operation = async () => {
                throw new Error('Service failure');
            };
            
            const circuitBreaker = errorHandler.createCircuitBreaker(operation, {
                failureThreshold: 3,
                resetTimeout: 100
            });
            
            // Should fail and open circuit
            for (let i = 0; i < 3; i++) {
                try {
                    await circuitBreaker();
                } catch (error) {
                    // Expected
                }
            }
            
            // Circuit should now be open
            try {
                await circuitBreaker();
                expect.fail('Should have thrown circuit breaker error');
            } catch (error) {
                expect(error.message).to.equal('Circuit breaker is OPEN');
            }
        });

        it('should reset circuit after timeout', async () => {
            const operation = async () => {
                throw new Error('Service failure');
            };
            
            const circuitBreaker = errorHandler.createCircuitBreaker(operation, {
                failureThreshold: 2,
                resetTimeout: 100
            });
            
            // Open the circuit
            for (let i = 0; i < 2; i++) {
                try {
                    await circuitBreaker();
                } catch (error) {
                    // Expected
                }
            }
            
            // Wait for reset timeout
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Circuit should be half-open and allow one attempt
            try {
                await circuitBreaker();
            } catch (error) {
                // Expected to fail but circuit should close again
                expect(error.message).to.equal('Service failure');
            }
        });
    });

    describe('Express Middleware', () => {
        it('should handle errors in middleware', () => {
            const middleware = errorHandler.middleware();
            const error = new Error('Test error');
            error.name = 'ValidationError';
            
            const req = { path: '/api/test' };
            const res = {
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };
            const next = sandbox.stub();
            
            middleware(error, req, res, next);
            
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should handle errors in error handler gracefully', () => {
            const middleware = errorHandler.middleware();
            const error = new Error('Test error');
            
            // Make createErrorResponse throw an error
            sandbox.stub(errorHandler, 'createErrorResponse').throws(new Error('Handler error'));
            
            const req = { path: '/api/test' };
            const res = {
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };
            const next = sandbox.stub();
            
            middleware(error, req, res, next);
            
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            const response = res.json.getCall(0).args[0];
            expect(response.error.code).to.equal('INTERNAL_SERVER_ERROR');
        });
    });

    describe('Async Wrapper', () => {
        it('should catch errors in async functions', async () => {
            const asyncFn = async (req, res, next) => {
                throw new Error('Async error');
            };
            
            const wrappedFn = errorHandler.asyncWrapper(asyncFn);
            
            const req = {};
            const res = {};
            const next = sandbox.stub();
            
            await wrappedFn(req, res, next);
            
            expect(next.calledOnce).to.be.true;
            expect(next.getCall(0).args[0]).to.be.an.instanceOf(Error);
            expect(next.getCall(0).args[0].message).to.equal('Async error');
        });

        it('should pass successful results', async () => {
            const asyncFn = async (req, res, next) => {
                res.data = 'success';
                return res;
            };
            
            const wrappedFn = errorHandler.asyncWrapper(asyncFn);
            
            const req = {};
            const res = {};
            const next = sandbox.stub();
            
            const result = await wrappedFn(req, res, next);
            
            expect(result.data).to.equal('success');
            expect(next.called).to.be.false;
        });
    });

    describe('Data Sanitization', () => {
        it('should sanitize sensitive headers', () => {
            const headers = {
                'content-type': 'application/json',
                'authorization': 'Bearer secret-token',
                'cookie': 'session=secret-session',
                'x-api-key': 'secret-api-key'
            };
            
            const sanitized = errorHandler.sanitizeHeaders(headers);
            
            expect(sanitized['content-type']).to.equal('application/json');
            expect(sanitized['authorization']).to.equal('[REDACTED]');
            expect(sanitized['cookie']).to.equal('[REDACTED]');
            expect(sanitized['x-api-key']).to.equal('[REDACTED]');
        });

        it('should sanitize sensitive body fields', () => {
            const body = {
                username: 'testuser',
                password: 'secret123',
                creditCard: '1234-5678-9012-3456',
                email: 'user@example.com',
                token: 'secret-token'
            };
            
            const sanitized = errorHandler.sanitizeBody(body);
            
            expect(sanitized.username).to.equal('testuser');
            expect(sanitized.password).to.equal('[REDACTED]');
            expect(sanitized.creditCard).to.equal('[REDACTED]');
            expect(sanitized.email).to.equal('user@example.com');
            expect(sanitized.token).to.equal('[REDACTED]');
        });
    });

    describe('Security Error Detection', () => {
        it('should identify security-related errors', () => {
            const authError = new Error('Authentication failed');
            authError.name = 'AuthenticationError';
            
            const sqlError = new Error('SQL injection attempt detected');
            
            const xssError = new Error('XSS attack prevented');
            
            expect(errorHandler.isSecurityRelatedError(authError)).to.be.true;
            expect(errorHandler.isSecurityRelatedError(sqlError)).to.be.true;
            expect(errorHandler.isSecurityRelatedError(xssError)).to.be.true;
        });

        it('should not identify non-security errors as security-related', () => {
            const normalError = new Error('Normal error');
            const validationError = new Error('Validation failed');
            validationError.name = 'SomeOtherError';
            
            expect(errorHandler.isSecurityRelatedError(normalError)).to.be.false;
            expect(errorHandler.isSecurityRelatedError(validationError)).to.be.false;
        });
    });

    describe('Health Check', () => {
        it('should provide health status', async () => {
            const health = await errorHandler.getHealth();
            
            expect(health).to.have.property('status');
            expect(health).to.have.property('uptime');
            expect(health).to.have.property('errorRates');
            expect(health).to.have.property('isShuttingDown');
            expect(health.status).to.equal('healthy');
        });

        it('should include recent error rates in health check', async () => {
            // Create some errors
            const error = new Error('Test error');
            error.name = 'TestError';
            
            for (let i = 0; i < 3; i++) {
                errorHandler.logError(error);
            }
            
            const health = await errorHandler.getHealth();
            
            expect(health.errorRates).to.have.property('TestError:Test error');
            expect(health.errorRates['TestError:Test error'].count).to.equal(3);
        });
    });

    describe('Graceful Shutdown', () => {
        it('should handle graceful shutdown on SIGTERM', (done) => {
            const logInfoStub = sandbox.stub(errorHandler.logger, 'logInfo');
            const exitStub = sandbox.stub(process, 'exit');
            
            // Trigger SIGTERM
            process.emit('SIGTERM');
            
            setTimeout(() => {
                expect(logInfoStub.calledWith('system', 'Received SIGTERM, starting graceful shutdown')).to.be.true;
                expect(exitStub.called).to.be.true;
                done();
            }, 100);
        });

        it('should handle uncaught exceptions', (done) => {
            const logErrorStub = sandbox.stub(errorHandler.logger, 'logError');
            const recordMetricStub = sandbox.stub(errorHandler.monitoring, 'recordMetric');
            const exitStub = sandbox.stub(process, 'exit');
            
            const error = new Error('Uncaught exception');
            process.emit('uncaughtException', error);
            
            setTimeout(() => {
                expect(logErrorStub.calledOnce).to.be.true;
                expect(recordMetricStub.calledTwice).to.be.true;
                expect(exitStub.calledWith(1)).to.be.true;
                done();
            }, 100);
        });
    });
});