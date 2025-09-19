const { expect } = require('chai');
const sinon = require('sinon');
const winston = require('winston');
const LoggingService = require('../../services/LoggingService');

describe('LoggingService', () => {
    let loggingService;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        loggingService = new LoggingService();
    });

    afterEach(() => {
        sandbox.restore();
        if (loggingService) {
            loggingService.cleanup();
        }
    });

    describe('Constructor', () => {
        it('should initialize with default configuration', () => {
            expect(loggingService.config).to.be.an('object');
            expect(loggingService.loggers).to.be.an('object');
            expect(loggingService.loggers.default).to.be.an('object');
        });

        it('should accept custom configuration', () => {
            const customConfig = {
                level: 'debug',
                service: 'test-service'
            };
            const customLoggingService = new LoggingService(customConfig);
            expect(customLoggingService.config.level).to.equal('debug');
            expect(customLoggingService.config.service).to.equal('test-service');
            customLoggingService.cleanup();
        });
    });

    describe('Logger Types', () => {
        it('should create console logger', () => {
            const consoleLogger = loggingService.createConsoleLogger();
            expect(consoleLogger).to.be.an('object');
            expect(consoleLogger.transports).to.have.property('console');
        });

        it('should create file logger', () => {
            const fileLogger = loggingService.createFileLogger('test.log');
            expect(fileLogger).to.be.an('object');
            expect(fileLogger.transports).to.have.property('file');
        });

        it('should create daily rotate logger', () => {
            const rotateLogger = loggingService.createDailyRotateLogger('test-%DATE%.log');
            expect(rotateLogger).to.be.an('object');
            expect(rotateLogger.transports).to.have.property('dailyRotateFile');
        });
    });

    describe('Basic Logging Methods', () => {
        it('should log info messages', () => {
            const infoSpy = sandbox.spy(loggingService.loggers.default, 'info');
            loggingService.info('Test info message');
            expect(infoSpy.calledOnce).to.be.true;
            expect(infoSpy.calledWith('Test info message')).to.be.true;
        });

        it('should log error messages', () => {
            const errorSpy = sandbox.spy(loggingService.loggers.default, 'error');
            const error = new Error('Test error');
            loggingService.error('Test error message', error);
            expect(errorSpy.calledOnce).to.be.true;
            expect(errorSpy.calledWith('Test error message', error)).to.be.true;
        });

        it('should log debug messages', () => {
            const debugSpy = sandbox.spy(loggingService.loggers.default, 'debug');
            loggingService.debug('Test debug message');
            expect(debugSpy.calledOnce).to.be.true;
            expect(debugSpy.calledWith('Test debug message')).to.be.true;
        });

        it('should log warning messages', () => {
            const warnSpy = sandbox.spy(loggingService.loggers.default, 'warn');
            loggingService.warn('Test warning message');
            expect(warnSpy.calledOnce).to.be.true;
            expect(warnSpy.calledWith('Test warning message')).to.be.true;
        });
    });

    describe('Specialized Logging Methods', () => {
        it('should log security events', () => {
            const infoSpy = sandbox.spy(loggingService.loggers.default, 'info');
            const securityData = {
                event: 'login_attempt',
                user: 'testuser',
                ip: '192.168.1.1'
            };
            loggingService.logSecurityEvent('login_attempt', securityData);
            expect(infoSpy.calledOnce).to.be.true;
            expect(infoSpy.firstCall.args[0]).to.include('SECURITY_EVENT');
        });

        it('should log performance metrics', () => {
            const infoSpy = sandbox.spy(loggingService.loggers.default, 'info');
            loggingService.logPerformance('test_operation', 100);
            expect(infoSpy.calledOnce).to.be.true;
            expect(infoSpy.firstCall.args[0]).to.include('PERFORMANCE');
        });

        it('should log business events', () => {
            const infoSpy = sandbox.spy(loggingService.loggers.default, 'info');
            const businessData = {
                event: 'user_signup',
                revenue: 100
            };
            loggingService.logBusinessEvent('user_signup', businessData);
            expect(infoSpy.calledOnce).to.be.true;
            expect(infoSpy.firstCall.args[0]).to.include('BUSINESS_EVENT');
        });
    });

    describe('Request Context', () => {
        it('should create request context logger', () => {
            const req = {
                id: 'test-request-id',
                user: { id: 'user123' },
                ip: '192.168.1.1'
            };
            const contextLogger = loggingService.withRequestContext(req);
            expect(contextLogger).to.be.an('object');
            expect(contextLogger.defaultMeta).to.include({
                requestId: 'test-request-id',
                userId: 'user123',
                ip: '192.168.1.1'
            });
        });
    });

    describe('Data Sanitization', () => {
        it('should sanitize sensitive data', () => {
            const sensitiveData = {
                password: 'secret123',
                creditCard: '1234-5678-9012-3456',
                email: 'user@example.com'
            };
            const sanitized = loggingService.sanitizeData(sensitiveData);
            expect(sanitized.password).to.equal('[REDACTED]');
            expect(sanitized.creditCard).to.equal('[REDACTED]');
            expect(sanitized.email).to.equal('user@example.com');
        });

        it('should handle nested data sanitization', () => {
            const nestedData = {
                user: {
                    password: 'secret123',
                    profile: {
                        ssn: '123-45-6789'
                    }
                }
            };
            const sanitized = loggingService.sanitizeData(nestedData);
            expect(sanitized.user.password).to.equal('[REDACTED]');
            expect(sanitized.user.profile.ssn).to.equal('[REDACTED]');
        });
    });

    describe('Express Middleware', () => {
        it('should create request logging middleware', () => {
            const middleware = loggingService.requestLoggingMiddleware();
            expect(middleware).to.be.a('function');
        });

        it('should create error logging middleware', () => {
            const middleware = loggingService.errorLoggingMiddleware();
            expect(middleware).to.be.a('function');
        });

        it('should handle request logging', (done) => {
            const req = {
                method: 'GET',
                url: '/test',
                headers: { 'user-agent': 'test-agent' },
                ip: '192.168.1.1'
            };
            const res = {
                statusCode: 200
            };
            const next = () => {
                done();
            };

            const middleware = loggingService.requestLoggingMiddleware();
            middleware(req, res, next);
        });
    });

    describe('Error Handling', () => {
        it('should handle logger creation errors gracefully', () => {
            const invalidConfig = {
                transports: ['invalid_transport']
            };
            const result = loggingService.createLogger('test', invalidConfig);
            expect(result).to.be.an('object');
        });

        it('should handle log rotation errors', () => {
            const rotateLogger = loggingService.createDailyRotateLogger('/invalid/path/test.log');
            expect(rotateLogger).to.be.an('object');
        });
    });

    describe('Performance', () => {
        it('should handle high-frequency logging efficiently', (done) => {
            const startTime = Date.now();
            const logPromises = [];

            for (let i = 0; i < 1000; i++) {
                logPromises.push(Promise.resolve(loggingService.info(`Test message ${i}`)));
            }

            Promise.all(logPromises).then(() => {
                const endTime = Date.now();
                const duration = endTime - startTime;
                expect(duration).to.be.below(1000); // Should complete within 1 second
                done();
            });
        });
    });

    describe('Integration', () => {
        it('should work with multiple loggers simultaneously', () => {
            const consoleLogger = loggingService.createConsoleLogger();
            const fileLogger = loggingService.createFileLogger('integration-test.log');
            
            expect(consoleLogger).to.be.an('object');
            expect(fileLogger).to.be.an('object');
            
            consoleLogger.info('Console test message');
            fileLogger.info('File test message');
        });
    });
});