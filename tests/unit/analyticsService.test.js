const AnalyticsService = require('../../services/AnalyticsService');
const loggingService = require('../../services/LoggingService');
const monitoringService = require('../../services/MonitoringService');

describe('AnalyticsService', () => {
    let analyticsService;

    beforeEach(() => {
        // Mock dependencies
        jest.spyOn(loggingService, 'logInfo').mockImplementation(() => {});
        jest.spyOn(loggingService, 'logError').mockImplementation(() => {});
        jest.spyOn(loggingService, 'logDebug').mockImplementation(() => {});
        jest.spyOn(monitoringService, 'trackMetric').mockImplementation(() => {});

        // Create a fresh instance for each test
        analyticsService = new AnalyticsService();
    });

    afterEach(async () => {
        await analyticsService.cleanup();
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with default configuration', () => {
            expect(analyticsService.isInitialized).toBe(false);
            expect(analyticsService.eventQueue).toBeInstanceOf(Array);
            expect(analyticsService.metrics).toBeInstanceOf(Map);
            expect(analyticsService.userSessions).toBeInstanceOf(Map);
            expect(analyticsService.performanceMetrics).toBeInstanceOf(Map);
            expect(analyticsService.businessMetrics).toBeInstanceOf(Map);
            expect(analyticsService.realTimeMetrics).toBeInstanceOf(Map);
            expect(analyticsService.batchSize).toBe(100);
            expect(analyticsService.batchInterval).toBe(5000);
            expect(analyticsService.retentionPeriod).toBe(2592000000); // 30 days
        });

        test('should have default configuration', () => {
            expect(analyticsService.defaultConfig).toEqual({
                batchSize: 100,
                batchInterval: 5000,
                retentionPeriod: 2592000000,
                enableRealTime: true,
                enableUserTracking: true,
                enablePerformanceTracking: true,
                enableBusinessMetrics: true
            });
        });

        test('should initialize successfully', async () => {
            await expect(analyticsService.initialize()).resolves.not.toThrow();
            expect(analyticsService.isInitialized).toBe(true);
            expect(loggingService.logInfo).toHaveBeenCalledWith('analytics', 'Analytics service initialized successfully');
        });

        test('should emit initialized event', async () => {
            const initializedSpy = jest.fn();
            analyticsService.on('initialized', initializedSpy);
            
            await analyticsService.initialize();
            
            expect(initializedSpy).toHaveBeenCalled();
        });

        test('should handle initialization errors', async () => {
            const error = new Error('Initialization failed');
            jest.spyOn(analyticsService, 'startBatchProcessor').mockRejectedValue(error);
            
            await expect(analyticsService.initialize()).rejects.toThrow(error);
            expect(loggingService.logError).toHaveBeenCalledWith('analytics', 'Failed to initialize analytics service', { error });
        });
    });

    describe('Event Tracking', () => {
        test('should track basic event', () => {
            const eventData = {
                name: 'user_login',
                userId: 'user123',
                properties: { method: 'email' }
            };
            
            analyticsService.trackEvent('user_login', eventData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0]).toMatchObject({
                name: 'user_login',
                userId: 'user123',
                properties: { method: 'email' },
                timestamp: expect.any(Date)
            });
        });

        test('should track event with session data', () => {
            const eventData = {
                name: 'page_view',
                userId: 'user123',
                sessionId: 'session456',
                properties: { page: '/home' }
            };
            
            analyticsService.trackEvent('page_view', eventData);
            
            expect(analyticsService.eventQueue[0]).toMatchObject({
                name: 'page_view',
                userId: 'user123',
                sessionId: 'session456',
                properties: { page: '/home' }
            });
        });

        test('should track event with custom metadata', () => {
            const eventData = {
                name: 'button_click',
                userId: 'user123',
                properties: { buttonId: 'submit' },
                metadata: { 
                    campaign: 'summer_sale',
                    source: 'email'
                }
            };
            
            analyticsService.trackEvent('button_click', eventData);
            
            expect(analyticsService.eventQueue[0].metadata).toEqual({
                campaign: 'summer_sale',
                source: 'email'
            });
        });

        test('should log event tracking', () => {
            const eventData = {
                name: 'test_event',
                userId: 'user123'
            };
            
            analyticsService.trackEvent('test_event', eventData);
            
            expect(loggingService.logDebug).toHaveBeenCalledWith('analytics', 'Event tracked: test_event', eventData);
        });

        test('should emit event_tracked event', () => {
            const eventSpy = jest.fn();
            analyticsService.on('event_tracked', eventSpy);
            
            const eventData = { name: 'test_event', userId: 'user123' };
            analyticsService.trackEvent('test_event', eventData);
            
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                name: 'test_event',
                userId: 'user123'
            }));
        });
    });

    describe('User Behavior Tracking', () => {
        test('should track user session start', () => {
            const sessionData = {
                userId: 'user123',
                sessionId: 'session456',
                startTime: new Date(),
                device: 'mobile',
                browser: 'Chrome',
                location: 'US'
            };
            
            analyticsService.trackUserSession(sessionData);
            
            expect(analyticsService.userSessions.has('session456')).toBe(true);
            const session = analyticsService.userSessions.get('session456');
            expect(session.userId).toBe('user123');
            expect(session.device).toBe('mobile');
            expect(session.events).toBeInstanceOf(Array);
            expect(session.pageViews).toBeInstanceOf(Array);
        });

        test('should track user page view', () => {
            const sessionData = {
                userId: 'user123',
                sessionId: 'session456',
                page: '/products',
                referrer: '/home',
                title: 'Products'
            };
            
            analyticsService.trackPageView(sessionData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('page_view');
            expect(analyticsService.eventQueue[0].properties).toMatchObject({
                page: '/products',
                referrer: '/home',
                title: 'Products'
            });
        });

        test('should track user action', () => {
            const actionData = {
                userId: 'user123',
                sessionId: 'session456',
                action: 'add_to_cart',
                properties: { productId: 'prod123', quantity: 2 }
            };
            
            analyticsService.trackUserAction(actionData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('user_action');
            expect(analyticsService.eventQueue[0].properties).toMatchObject({
                action: 'add_to_cart',
                productId: 'prod123',
                quantity: 2
            });
        });

        test('should track user conversion', () => {
            const conversionData = {
                userId: 'user123',
                sessionId: 'session456',
                conversionType: 'purchase',
                value: 99.99,
                currency: 'USD',
                properties: { 
                    orderId: 'order123',
                    products: ['prod123', 'prod456']
                }
            };
            
            analyticsService.trackConversion(conversionData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('conversion');
            expect(analyticsService.eventQueue[0].properties).toMatchObject({
                conversionType: 'purchase',
                value: 99.99,
                currency: 'USD',
                orderId: 'order123'
            });
        });

        test('should update session with user events', () => {
            // Start session
            analyticsService.trackUserSession({
                userId: 'user123',
                sessionId: 'session456'
            });
            
            // Track events
            analyticsService.trackPageView({
                userId: 'user123',
                sessionId: 'session456',
                page: '/products'
            });
            
            analyticsService.trackUserAction({
                userId: 'user123',
                sessionId: 'session456',
                action: 'add_to_cart'
            });
            
            const session = analyticsService.userSessions.get('session456');
            expect(session.events.length).toBe(2);
            expect(session.pageViews.length).toBe(1);
        });
    });

    describe('Performance Tracking', () => {
        test('should track page load performance', () => {
            const performanceData = {
                page: '/products',
                loadTime: 1200,
                domContentLoaded: 800,
                firstContentfulPaint: 600,
                largestContentfulPaint: 1000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.1
            };
            
            analyticsService.trackPageLoadPerformance(performanceData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('page_performance');
            expect(analyticsService.eventQueue[0].properties).toMatchObject(performanceData);
        });

        test('should track API performance', () => {
            const apiData = {
                endpoint: '/api/users',
                method: 'GET',
                responseTime: 250,
                statusCode: 200,
                requestSize: 0,
                responseSize: 1024
            };
            
            analyticsService.trackApiPerformance(apiData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('api_performance');
            expect(analyticsService.eventQueue[0].properties).toMatchObject(apiData);
        });

        test('should track database performance', () => {
            const dbData = {
                query: 'SELECT * FROM users',
                executionTime: 150,
                rowsReturned: 100,
                queryType: 'select'
            };
            
            analyticsService.trackDatabasePerformance(dbData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('database_performance');
            expect(analyticsService.eventQueue[0].properties).toMatchObject(dbData);
        });

        test('should track error performance', () => {
            const errorData = {
                errorType: 'ValidationError',
                message: 'Invalid input',
                stack: 'Error: Invalid input\n    at validateInput...',
                endpoint: '/api/users',
                userId: 'user123'
            };
            
            analyticsService.trackErrorPerformance(errorData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('error_performance');
            expect(analyticsService.eventQueue[0].properties).toMatchObject({
                errorType: 'ValidationError',
                message: 'Invalid input',
                endpoint: '/api/users'
            });
        });

        test('should track custom performance metric', () => {
            const metricData = {
                metricName: 'image_processing_time',
                value: 500,
                unit: 'milliseconds',
                category: 'processing',
                metadata: { imageSize: 'large', format: 'jpg' }
            };
            
            analyticsService.trackPerformanceMetric(metricData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('performance_metric');
            expect(analyticsService.eventQueue[0].properties).toMatchObject({
                metricName: 'image_processing_time',
                value: 500,
                unit: 'milliseconds',
                category: 'processing'
            });
        });
    });

    describe('Business Metrics', () => {
        test('should track business metric', () => {
            const metricData = {
                metric: 'revenue',
                value: 15000,
                unit: 'USD',
                period: 'daily',
                metadata: { 
                    source: 'ecommerce',
                    region: 'US'
                }
            };
            
            analyticsService.trackBusinessMetric(metricData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('business_metric');
            expect(analyticsService.eventQueue[0].properties).toMatchObject({
                metric: 'revenue',
                value: 15000,
                unit: 'USD',
                period: 'daily'
            });
        });

        test('should track user engagement', () => {
            const engagementData = {
                userId: 'user123',
                sessionDuration: 300,
                pageViews: 5,
                interactions: 12,
                bounceRate: 0.2
            };
            
            analyticsService.trackUserEngagement(engagementData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('user_engagement');
            expect(analyticsService.eventQueue[0].properties).toMatchObject(engagementData);
        });

        test('should track feature usage', () => {
            const usageData = {
                feature: 'search',
                userId: 'user123',
                usageCount: 25,
                successRate: 0.8,
                averageTime: 2.5
            };
            
            analyticsService.trackFeatureUsage(usageData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('feature_usage');
            expect(analyticsService.eventQueue[0].properties).toMatchObject(usageData);
        });

        test('should track content engagement', () => {
            const contentData = {
                contentId: 'article123',
                contentType: 'article',
                views: 150,
                likes: 25,
                shares: 10,
                comments: 5,
                averageTime: 180
            };
            
            analyticsService.trackContentEngagement(contentData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('content_engagement');
            expect(analyticsService.eventQueue[0].properties).toMatchObject(contentData);
        });

        test('should track custom business event', () => {
            const eventData = {
                eventName: 'subscription_upgrade',
                userId: 'user123',
                value: 29.99,
                currency: 'USD',
                properties: { 
                    previousPlan: 'basic',
                    newPlan: 'premium'
                }
            };
            
            analyticsService.trackCustomBusinessEvent(eventData);
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('custom_business_event');
            expect(analyticsService.eventQueue[0].properties).toMatchObject({
                eventName: 'subscription_upgrade',
                value: 29.99,
                currency: 'USD'
            });
        });
    });

    describe('Real-time Metrics', () => {
        test('should update real-time metrics', () => {
            analyticsService.updateRealTimeMetric('active_users', 150);
            
            expect(analyticsService.realTimeMetrics.get('active_users')).toBe(150);
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('real_time_metric');
        });

        test('should get real-time metrics', () => {
            analyticsService.updateRealTimeMetric('active_users', 150);
            analyticsService.updateRealTimeMetric('page_views', 2500);
            
            const metrics = analyticsService.getRealTimeMetrics();
            
            expect(metrics).toMatchObject({
                active_users: 150,
                page_views: 2500
            });
        });

        test('should get real-time dashboard data', () => {
            analyticsService.updateRealTimeMetric('active_users', 150);
            analyticsService.updateRealTimeMetric('page_views', 2500);
            analyticsService.updateRealTimeMetric('conversion_rate', 0.025);
            
            const dashboardData = analyticsService.getRealTimeDashboardData();
            
            expect(dashboardData).toHaveProperty('metrics');
            expect(dashboardData).toHaveProperty('trends');
            expect(dashboardData).toHaveProperty('alerts');
            expect(dashboardData.metrics).toMatchObject({
                active_users: 150,
                page_views: 2500,
                conversion_rate: 0.025
            });
        });

        test('should emit real_time_metric_updated event', () => {
            const eventSpy = jest.fn();
            analyticsService.on('real_time_metric_updated', eventSpy);
            
            analyticsService.updateRealTimeMetric('active_users', 150);
            
            expect(eventSpy).toHaveBeenCalledWith('active_users', 150);
        });
    });

    describe('Data Aggregation', () => {
        test('should aggregate events by time period', () => {
            // Add some test events
            analyticsService.eventQueue = [
                {
                    name: 'page_view',
                    timestamp: new Date(Date.now() - 60000), // 1 minute ago
                    properties: { page: '/home' }
                },
                {
                    name: 'page_view',
                    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
                    properties: { page: '/products' }
                },
                {
                    name: 'user_action',
                    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
                    properties: { action: 'click' }
                }
            ];
            
            const aggregated = analyticsService.aggregateEvents('hourly');
            
            expect(aggregated).toHaveProperty('page_view');
            expect(aggregated).toHaveProperty('user_action');
            expect(aggregated.page_view.count).toBe(2);
            expect(aggregated.user_action.count).toBe(1);
        });

        test('should aggregate user behavior metrics', () => {
            // Add some test user sessions
            analyticsService.userSessions.set('session1', {
                userId: 'user123',
                startTime: new Date(Date.now() - 300000),
                pageViews: ['/home', '/products', '/checkout'],
                events: ['page_view', 'user_action', 'conversion']
            });
            
            const aggregated = analyticsService.aggregateUserBehavior();
            
            expect(aggregated).toHaveProperty('totalSessions');
            expect(aggregated).toHaveProperty('averageSessionDuration');
            expect(aggregated).toHaveProperty('averagePageViews');
            expect(aggregated).toHaveProperty('bounceRate');
            expect(aggregated).toHaveProperty('conversionRate');
        });

        test('should aggregate performance metrics', () => {
            // Add some test performance metrics
            analyticsService.performanceMetrics.set('page_load', [
                { value: 1000, timestamp: new Date() },
                { value: 1200, timestamp: new Date() },
                { value: 800, timestamp: new Date() }
            ]);
            
            const aggregated = analyticsService.aggregatePerformanceMetrics();
            
            expect(aggregated).toHaveProperty('page_load');
            expect(aggregated.page_load).toHaveProperty('average');
            expect(aggregated.page_load).toHaveProperty('min');
            expect(aggregated.page_load).toHaveProperty('max');
            expect(aggregated.page_load).toHaveProperty('count');
            expect(aggregated.page_load.average).toBe(1000);
            expect(aggregated.page_load.min).toBe(800);
            expect(aggregated.page_load.max).toBe(1200);
        });

        test('should aggregate business metrics', () => {
            // Add some test business metrics
            analyticsService.businessMetrics.set('revenue', [
                { value: 1000, timestamp: new Date() },
                { value: 1500, timestamp: new Date() },
                { value: 2000, timestamp: new Date() }
            ]);
            
            const aggregated = analyticsService.aggregateBusinessMetrics();
            
            expect(aggregated).toHaveProperty('revenue');
            expect(aggregated.revenue).toHaveProperty('total');
            expect(aggregated.revenue).toHaveProperty('average');
            expect(aggregated.revenue.total).toBe(4500);
            expect(aggregated.revenue.average).toBe(1500);
        });
    });

    describe('Report Generation', () => {
        test('should generate basic analytics report', () => {
            // Add some test data
            analyticsService.eventQueue = [
                {
                    name: 'page_view',
                    timestamp: new Date(),
                    properties: { page: '/home' }
                }
            ];
            
            const report = analyticsService.generateReport();
            
            expect(report).toHaveProperty('period');
            expect(report).toHaveProperty('generatedAt');
            expect(report).toHaveProperty('summary');
            expect(report).toHaveProperty('metrics');
            expect(report).toHaveProperty('events');
            expect(report).toHaveProperty('users');
            expect(report).toHaveProperty('performance');
            expect(report).toHaveProperty('business');
            expect(report).toHaveProperty('recommendations');
        });

        test('should generate custom period report', () => {
            const startDate = new Date(Date.now() - 86400000); // 1 day ago
            const endDate = new Date();
            
            const report = analyticsService.generateReport({
                period: 'custom',
                startDate,
                endDate
            });
            
            expect(report.period).toBe('custom');
            expect(report.startDate).toBe(startDate);
            expect(report.endDate).toBe(endDate);
        });

        test('should generate user analytics report', () => {
            // Add some test user data
            analyticsService.userSessions.set('session1', {
                userId: 'user123',
                startTime: new Date(Date.now() - 300000),
                pageViews: ['/home', '/products'],
                events: ['page_view', 'user_action']
            });
            
            const report = analyticsService.generateUserAnalyticsReport();
            
            expect(report).toHaveProperty('totalUsers');
            expect(report).toHaveProperty('activeUsers');
            expect(report).toHaveProperty('newUsers');
            expect(report).toHaveProperty('returningUsers');
            expect(report).toHaveProperty('userEngagement');
            expect(report).toHaveProperty('userRetention');
            expect(report).toHaveProperty('userSegments');
        });

        test('should generate performance report', () => {
            // Add some test performance data
            analyticsService.performanceMetrics.set('page_load', [
                { value: 1000, timestamp: new Date() }
            ]);
            
            const report = analyticsService.generatePerformanceReport();
            
            expect(report).toHaveProperty('pageLoadTimes');
            expect(report).toHaveProperty('apiResponseTimes');
            expect(report).toHaveProperty('databaseQueryTimes');
            expect(report).toHaveProperty('errorRates');
            expect(report).toHaveProperty('uptime');
            expect(report).toHaveProperty('performanceScore');
            expect(report).toHaveProperty('bottlenecks');
            expect(report).toHaveProperty('recommendations');
        });

        test('should generate business intelligence report', () => {
            // Add some test business data
            analyticsService.businessMetrics.set('revenue', [
                { value: 1000, timestamp: new Date() }
            ]);
            
            const report = analyticsService.generateBusinessIntelligenceReport();
            
            expect(report).toHaveProperty('revenue');
            expect(report).toHaveProperty('conversionRates');
            expect(report).toHaveProperty('customerLifetimeValue');
            expect(report).toHaveProperty('customerAcquisitionCost');
            expect(report).toHaveProperty('returnOnInvestment');
            expect(report).toHaveProperty('marketShare');
            expect(report).toHaveProperty('competitiveAnalysis');
            expect(report).toHaveProperty('trends');
            expect(report).toHaveProperty('predictions');
        });
    });

    describe('Data Retention and Cleanup', () => {
        test('should clean up old data', () => {
            // Add old event
            const oldEvent = {
                name: 'old_event',
                timestamp: new Date(Date.now() - 3000000000) // 35 days ago
            };
            
            // Add recent event
            const recentEvent = {
                name: 'recent_event',
                timestamp: new Date()
            };
            
            analyticsService.eventQueue = [oldEvent, recentEvent];
            
            analyticsService.cleanupOldData();
            
            expect(analyticsService.eventQueue).toHaveLength(1);
            expect(analyticsService.eventQueue[0].name).toBe('recent_event');
        });

        test('should clean up old sessions', () => {
            // Add old session
            const oldSession = {
                userId: 'user123',
                startTime: new Date(Date.now() - 3000000000) // 35 days ago
            };
            
            // Add recent session
            const recentSession = {
                userId: 'user456',
                startTime: new Date()
            };
            
            analyticsService.userSessions.set('old_session', oldSession);
            analyticsService.userSessions.set('recent_session', recentSession);
            
            analyticsService.cleanupOldData();
            
            expect(analyticsService.userSessions.has('old_session')).toBe(false);
            expect(analyticsService.userSessions.has('recent_session')).toBe(true);
        });

        test('should clean up old metrics', () => {
            // Add old metrics
            const oldMetrics = [
                { value: 100, timestamp: new Date(Date.now() - 3000000000) }
            ];
            
            // Add recent metrics
            const recentMetrics = [
                { value: 200, timestamp: new Date() }
            ];
            
            analyticsService.performanceMetrics.set('old_metric', oldMetrics);
            analyticsService.performanceMetrics.set('recent_metric', recentMetrics);
            
            analyticsService.cleanupOldData();
            
            expect(analyticsService.performanceMetrics.has('old_metric')).toBe(false);
            expect(analyticsService.performanceMetrics.has('recent_metric')).toBe(true);
        });

        test('should schedule cleanup', () => {
            jest.useFakeTimers();
            
            analyticsService.scheduleCleanup();
            
            // Fast forward 24 hours
            jest.advanceTimersByTime(86400000);
            
            expect(loggingService.logInfo).toHaveBeenCalledWith('analytics', 'Running scheduled cleanup of old data');
            
            jest.useRealTimers();
        });
    });

    describe('Batch Processing', () => {
        test('should process event batch', async () => {
            // Add events to queue
            for (let i = 0; i < 5; i++) {
                analyticsService.eventQueue.push({
                    name: `event_${i}`,
                    timestamp: new Date(),
                    properties: { index: i }
                });
            }
            
            await analyticsService.processBatch();
            
            expect(analyticsService.eventQueue).toHaveLength(0);
            expect(loggingService.logDebug).toHaveBeenCalledWith('analytics', 'Processed batch of 5 events');
        });

        test('should handle batch processing errors', async () => {
            // Add events to queue
            analyticsService.eventQueue.push({
                name: 'test_event',
                timestamp: new Date()
            });
            
            // Mock error during processing
            jest.spyOn(analyticsService, 'storeEventData').mockRejectedValue(new Error('Storage error'));
            
            await analyticsService.processBatch();
            
            expect(loggingService.logError).toHaveBeenCalledWith('analytics', 'Error processing batch', expect.any(Error));
        });

        test('should start batch processor', async () => {
            jest.useFakeTimers();
            
            await analyticsService.startBatchProcessor();
            
            // Add some events
            analyticsService.eventQueue.push({
                name: 'test_event',
                timestamp: new Date()
            });
            
            // Fast forward batch interval
            jest.advanceTimersByTime(analyticsService.batchInterval);
            
            expect(loggingService.logDebug).toHaveBeenCalledWith('analytics', 'Processed batch of 1 events');
            
            jest.useRealTimers();
        });

        test('should stop batch processor', async () => {
            await analyticsService.startBatchProcessor();
            
            expect(analyticsService.batchProcessor).toBeDefined();
            
            await analyticsService.stopBatchProcessor();
            
            expect(analyticsService.batchProcessor).toBeNull();
            expect(loggingService.logInfo).toHaveBeenCalledWith('analytics', 'Batch processor stopped');
        });
    });

    describe('Data Storage and Retrieval', () => {
        test('should store event data', async () => {
            const event = {
                name: 'test_event',
                timestamp: new Date(),
                properties: { test: 'value' }
            };
            
            await analyticsService.storeEventData(event);
            
            // Should update metrics based on event type
            expect(analyticsService.metrics.has('events_total')).toBe(true);
            expect(analyticsService.metrics.has('events_test_event')).toBe(true);
        });

        test('should retrieve event data', async () => {
            const startDate = new Date(Date.now() - 3600000); // 1 hour ago
            const endDate = new Date();
            
            const events = await analyticsService.getEventData('page_view', startDate, endDate);
            
            expect(events).toBeInstanceOf(Array);
            // Should return filtered events based on criteria
        });

        test('should get aggregated metrics', async () => {
            const startDate = new Date(Date.now() - 3600000); // 1 hour ago
            const endDate = new Date();
            
            const metrics = await analyticsService.getAggregatedMetrics('page_views', startDate, endDate);
            
            expect(metrics).toHaveProperty('total');
            expect(metrics).toHaveProperty('average');
            expect(metrics).toHaveProperty('trend');
        });
    });

    describe('Service Health and Status', () => {
        test('should return service health', () => {
            const health = analyticsService.getHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('initialized');
            expect(health).toHaveProperty('totalEvents');
            expect(health).toHaveProperty('totalUsers');
            expect(health).toHaveProperty('totalSessions');
            expect(health).toHaveProperty('queueSize');
            expect(health).toHaveProperty('lastBatchProcess');
            expect(health).toHaveProperty('storageSize');
        });

        test('should return service status', () => {
            const status = analyticsService.getStatus();
            
            expect(status).toHaveProperty('service');
            expect(status).toHaveProperty('status');
            expect(status).toHaveProperty('uptime');
            expect(status).toHaveProperty('metrics');
            expect(status).toHaveProperty('config');
            expect(status.service).toBe('AnalyticsService');
        });

        test('should reflect initialization status', () => {
            analyticsService.isInitialized = true;
            const health = analyticsService.getHealth();
            
            expect(health.status).toBe('healthy');
            expect(health.initialized).toBe(true);
        });
    });

    describe('Configuration Management', () => {
        test('should update configuration', () => {
            const newConfig = {
                batchSize: 200,
                batchInterval: 10000,
                retentionPeriod: 5184000000 // 60 days
            };
            
            analyticsService.updateConfig(newConfig);
            
            expect(analyticsService.batchSize).toBe(200);
            expect(analyticsService.batchInterval).toBe(10000);
            expect(analyticsService.retentionPeriod).toBe(5184000000);
            expect(loggingService.logInfo).toHaveBeenCalledWith('analytics', 'Configuration updated', newConfig);
        });

        test('should get current configuration', () => {
            const config = analyticsService.getConfig();
            
            expect(config).toHaveProperty('batchSize');
            expect(config).toHaveProperty('batchInterval');
            expect(config).toHaveProperty('retentionPeriod');
            expect(config).toHaveProperty('enableRealTime');
            expect(config).toHaveProperty('enableUserTracking');
            expect(config).toHaveProperty('enablePerformanceTracking');
            expect(config).toHaveProperty('enableBusinessMetrics');
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid event data', () => {
            // Should not throw error with invalid data
            expect(() => {
                analyticsService.trackEvent(null, null);
            }).not.toThrow();
            
            expect(() => {
                analyticsService.trackEvent('test_event', {});
            }).not.toThrow();
        });

        test('should handle batch processing with invalid events', async () => {
            analyticsService.eventQueue = [
                null,
                undefined,
                { name: 'valid_event', timestamp: new Date() },
                { name: null, timestamp: new Date() }
            ];
            
            await analyticsService.processBatch();
            
            // Should process valid events and skip invalid ones
            expect(loggingService.logDebug).toHaveBeenCalled();
        });

        test('should handle storage errors gracefully', async () => {
            const event = {
                name: 'test_event',
                timestamp: new Date()
            };
            
            jest.spyOn(analyticsService, 'storeEventData').mockRejectedValue(new Error('Storage error'));
            
            await analyticsService.processBatch();
            
            expect(loggingService.logError).toHaveBeenCalledWith('analytics', 'Error processing batch', expect.any(Error));
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources', async () => {
            await analyticsService.startBatchProcessor();
            
            await analyticsService.cleanup();
            
            expect(analyticsService.isInitialized).toBe(false);
            expect(analyticsService.batchProcessor).toBeNull();
            expect(loggingService.logInfo).toHaveBeenCalledWith('analytics', 'Analytics service cleaned up');
        });

        test('should stop batch processor on cleanup', async () => {
            await analyticsService.startBatchProcessor();
            
            expect(analyticsService.batchProcessor).toBeDefined();
            
            await analyticsService.cleanup();
            
            expect(analyticsService.batchProcessor).toBeNull();
        });

        test('should clear cleanup scheduler on cleanup', async () => {
            analyticsService.scheduleCleanup();
            
            expect(analyticsService.cleanupScheduler).toBeDefined();
            
            await analyticsService.cleanup();
            
            expect(analyticsService.cleanupScheduler).toBeNull();
        });
    });
});