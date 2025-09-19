const request = require('supertest');
const app = require('../../app');
const AnalyticsService = require('../../services/AnalyticsService');
const loggingService = require('../../services/LoggingService');
const monitoringService = require('../../services/MonitoringService');

describe('Analytics Integration Tests', () => {
    let analyticsService;

    beforeAll(async () => {
        // Initialize analytics service
        analyticsService = new AnalyticsService();
        await analyticsService.initialize();
    });

    afterAll(async () => {
        await analyticsService.cleanup();
    });

    beforeEach(() => {
        // Clear event queue and metrics before each test
        analyticsService.eventQueue = [];
        analyticsService.metrics.clear();
        analyticsService.userSessions.clear();
        analyticsService.performanceMetrics.clear();
        analyticsService.businessMetrics.clear();
        analyticsService.realTimeMetrics.clear();
    });

    describe('Analytics API Endpoints', () => {
        describe('POST /api/analytics/events', () => {
            test('should track custom event', async () => {
                const eventData = {
                    name: 'user_signup',
                    userId: 'user123',
                    properties: {
                        source: 'email_campaign',
                        plan: 'premium'
                    }
                };

                const response = await request(app)
                    .post('/api/analytics/events')
                    .send(eventData)
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('eventId');
                expect(response.body).toHaveProperty('timestamp');
                expect(response.body.message).toBe('Event tracked successfully');

                // Verify event was tracked
                expect(analyticsService.eventQueue).toHaveLength(1);
                expect(analyticsService.eventQueue[0].name).toBe('user_signup');
            });

            test('should track page view event', async () => {
                const eventData = {
                    name: 'page_view',
                    userId: 'user123',
                    sessionId: 'session456',
                    properties: {
                        page: '/products',
                        referrer: '/home',
                        title: 'Products Page',
                        loadTime: 1200
                    }
                };

                const response = await request(app)
                    .post('/api/analytics/events')
                    .send(eventData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].properties.page).toBe('/products');
            });

            test('should track conversion event', async () => {
                const eventData = {
                    name: 'conversion',
                    userId: 'user123',
                    properties: {
                        conversionType: 'purchase',
                        value: 99.99,
                        currency: 'USD',
                        orderId: 'order123',
                        products: ['prod123', 'prod456']
                    }
                };

                const response = await request(app)
                    .post('/api/analytics/events')
                    .send(eventData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                const event = analyticsService.eventQueue[0];
                expect(event.properties.value).toBe(99.99);
                expect(event.properties.conversionType).toBe('purchase');
            });

            test('should handle invalid event data', async () => {
                const invalidData = {
                    // Missing required name field
                    userId: 'user123',
                    properties: {}
                };

                const response = await request(app)
                    .post('/api/analytics/events')
                    .send(invalidData)
                    .expect(400);

                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toContain('name is required');
            });

            test('should handle missing user ID gracefully', async () => {
                const eventData = {
                    name: 'page_view',
                    properties: {
                        page: '/home'
                    }
                };

                const response = await request(app)
                    .post('/api/analytics/events')
                    .send(eventData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].userId).toBe('anonymous');
            });
        });

        describe('POST /api/analytics/sessions', () => {
            test('should start user session', async () => {
                const sessionData = {
                    userId: 'user123',
                    sessionId: 'session456',
                    device: 'mobile',
                    browser: 'Chrome',
                    os: 'Android',
                    location: 'US',
                    referrer: 'https://google.com'
                };

                const response = await request(app)
                    .post('/api/analytics/sessions')
                    .send(sessionData)
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('sessionId', 'session456');
                expect(analyticsService.userSessions.has('session456')).toBe(true);
            });

            test('should update session with page views', async () => {
                // Start session first
                await request(app)
                    .post('/api/analytics/sessions')
                    .send({
                        userId: 'user123',
                        sessionId: 'session456'
                    });

                // Track page view
                const pageViewData = {
                    userId: 'user123',
                    sessionId: 'session456',
                    page: '/products',
                    referrer: '/home',
                    title: 'Products'
                };

                const response = await request(app)
                    .post('/api/analytics/sessions/pageview')
                    .send(pageViewData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                const session = analyticsService.userSessions.get('session456');
                expect(session.pageViews).toContain('/products');
            });

            test('should track user engagement', async () => {
                const engagementData = {
                    userId: 'user123',
                    sessionId: 'session456',
                    sessionDuration: 300,
                    pageViews: 5,
                    interactions: 12,
                    bounceRate: 0.2
                };

                const response = await request(app)
                    .post('/api/analytics/engagement')
                    .send(engagementData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('user_engagement');
            });
        });

        describe('POST /api/analytics/performance', () => {
            test('should track page load performance', async () => {
                const performanceData = {
                    page: '/products',
                    loadTime: 1200,
                    domContentLoaded: 800,
                    firstContentfulPaint: 600,
                    largestContentfulPaint: 1000,
                    firstInputDelay: 50,
                    cumulativeLayoutShift: 0.1
                };

                const response = await request(app)
                    .post('/api/analytics/performance/page')
                    .send(performanceData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('page_performance');
                expect(analyticsService.eventQueue[0].properties.loadTime).toBe(1200);
            });

            test('should track API performance', async () => {
                const apiData = {
                    endpoint: '/api/users',
                    method: 'GET',
                    responseTime: 250,
                    statusCode: 200,
                    requestSize: 0,
                    responseSize: 1024,
                    userId: 'user123'
                };

                const response = await request(app)
                    .post('/api/analytics/performance/api')
                    .send(apiData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('api_performance');
                expect(analyticsService.eventQueue[0].properties.responseTime).toBe(250);
            });

            test('should track database performance', async () => {
                const dbData = {
                    query: 'SELECT * FROM users WHERE id = ?',
                    executionTime: 150,
                    rowsReturned: 100,
                    queryType: 'select',
                    table: 'users'
                };

                const response = await request(app)
                    .post('/api/analytics/performance/database')
                    .send(dbData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('database_performance');
                expect(analyticsService.eventQueue[0].properties.executionTime).toBe(150);
            });

            test('should track custom performance metrics', async () => {
                const metricData = {
                    metricName: 'image_processing_time',
                    value: 500,
                    unit: 'milliseconds',
                    category: 'processing',
                    metadata: {
                        imageSize: 'large',
                        format: 'jpg'
                    }
                };

                const response = await request(app)
                    .post('/api/analytics/performance/metric')
                    .send(metricData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('performance_metric');
                expect(analyticsService.eventQueue[0].properties.value).toBe(500);
            });
        });

        describe('POST /api/analytics/business', () => {
            test('should track business metrics', async () => {
                const businessData = {
                    metric: 'revenue',
                    value: 15000,
                    unit: 'USD',
                    period: 'daily',
                    metadata: {
                        source: 'ecommerce',
                        region: 'US'
                    }
                };

                const response = await request(app)
                    .post('/api/analytics/business/metric')
                    .send(businessData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('business_metric');
                expect(analyticsService.eventQueue[0].properties.value).toBe(15000);
            });

            test('should track conversions', async () => {
                const conversionData = {
                    userId: 'user123',
                    conversionType: 'purchase',
                    value: 99.99,
                    currency: 'USD',
                    properties: {
                        orderId: 'order123',
                        products: ['prod123', 'prod456']
                    }
                };

                const response = await request(app)
                    .post('/api/analytics/business/conversion')
                    .send(conversionData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('conversion');
                expect(analyticsService.eventQueue[0].properties.value).toBe(99.99);
            });

            test('should track feature usage', async () => {
                const usageData = {
                    feature: 'search',
                    userId: 'user123',
                    usageCount: 25,
                    successRate: 0.8,
                    averageTime: 2.5
                };

                const response = await request(app)
                    .post('/api/analytics/business/feature')
                    .send(usageData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('feature_usage');
                expect(analyticsService.eventQueue[0].properties.feature).toBe('search');
            });

            test('should track content engagement', async () => {
                const contentData = {
                    contentId: 'article123',
                    contentType: 'article',
                    views: 150,
                    likes: 25,
                    shares: 10,
                    comments: 5,
                    averageTime: 180
                };

                const response = await request(app)
                    .post('/api/analytics/business/content')
                    .send(contentData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(analyticsService.eventQueue[0].name).toBe('content_engagement');
                expect(analyticsService.eventQueue[0].properties.contentId).toBe('article123');
            });
        });

        describe('GET /api/analytics', () => {
            test('should get real-time metrics', async () => {
                // Add some real-time metrics
                analyticsService.updateRealTimeMetric('active_users', 150);
                analyticsService.updateRealTimeMetric('page_views', 2500);
                analyticsService.updateRealTimeMetric('conversion_rate', 0.025);

                const response = await request(app)
                    .get('/api/analytics/realtime')
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('metrics');
                expect(response.body.metrics).toMatchObject({
                    active_users: 150,
                    page_views: 2500,
                    conversion_rate: 0.025
                });
            });

            test('should get dashboard data', async () => {
                // Add some data
                analyticsService.updateRealTimeMetric('active_users', 150);
                analyticsService.eventQueue.push({
                    name: 'page_view',
                    timestamp: new Date(),
                    properties: { page: '/home' }
                });

                const response = await request(app)
                    .get('/api/analytics/dashboard')
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('dashboard');
                expect(response.body.dashboard).toHaveProperty('metrics');
                expect(response.body.dashboard).toHaveProperty('trends');
                expect(response.body.dashboard).toHaveProperty('alerts');
            });

            test('should get analytics reports', async () => {
                // Add some test data
                analyticsService.eventQueue.push({
                    name: 'page_view',
                    timestamp: new Date(),
                    properties: { page: '/home' }
                });

                const response = await request(app)
                    .get('/api/analytics/reports')
                    .query({ period: 'daily' })
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('report');
                expect(response.body.report).toHaveProperty('period', 'daily');
                expect(response.body.report).toHaveProperty('summary');
                expect(response.body.report).toHaveProperty('metrics');
            });

            test('should get user analytics', async () => {
                // Add user session
                analyticsService.userSessions.set('session123', {
                    userId: 'user123',
                    startTime: new Date(),
                    pageViews: ['/home', '/products'],
                    events: ['page_view', 'user_action']
                });

                const response = await request(app)
                    .get('/api/analytics/users')
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('analytics');
                expect(response.body.analytics).toHaveProperty('totalUsers');
                expect(response.body.analytics).toHaveProperty('activeUsers');
                expect(response.body.analytics).toHaveProperty('userEngagement');
            });

            test('should get performance analytics', async () => {
                // Add performance data
                analyticsService.performanceMetrics.set('page_load', [
                    { value: 1000, timestamp: new Date() }
                ]);

                const response = await request(app)
                    .get('/api/analytics/performance')
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('performance');
                expect(response.body.performance).toHaveProperty('pageLoadTimes');
                expect(response.body.performance).toHaveProperty('apiResponseTimes');
                expect(response.body.performance).toHaveProperty('performanceScore');
            });

            test('should get business intelligence', async () => {
                // Add business data
                analyticsService.businessMetrics.set('revenue', [
                    { value: 1000, timestamp: new Date() }
                ]);

                const response = await request(app)
                    .get('/api/analytics/business')
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('intelligence');
                expect(response.body.intelligence).toHaveProperty('revenue');
                expect(response.body.intelligence).toHaveProperty('conversionRates');
                expect(response.body.intelligence).toHaveProperty('trends');
            });
        });
    });

    describe('Analytics Data Processing', () => {
        test('should process batch of events', async () => {
            // Add multiple events
            const events = [];
            for (let i = 0; i < 10; i++) {
                events.push({
                    name: `test_event_${i}`,
                    userId: `user${i}`,
                    properties: { index: i }
                });
            }

            // Track events
            for (const event of events) {
                await request(app)
                    .post('/api/analytics/events')
                    .send(event);
            }

            expect(analyticsService.eventQueue).toHaveLength(10);

            // Process batch
            await analyticsService.processBatch();

            expect(analyticsService.eventQueue).toHaveLength(0);
        });

        test('should aggregate events by time period', async () => {
            // Add events with different timestamps
            const now = new Date();
            analyticsService.eventQueue = [
                {
                    name: 'page_view',
                    timestamp: new Date(now.getTime() - 60000),
                    properties: { page: '/home' }
                },
                {
                    name: 'page_view',
                    timestamp: new Date(now.getTime() - 120000),
                    properties: { page: '/products' }
                },
                {
                    name: 'user_action',
                    timestamp: new Date(now.getTime() - 180000),
                    properties: { action: 'click' }
                }
            ];

            const aggregated = analyticsService.aggregateEvents('hourly');

            expect(aggregated).toHaveProperty('page_view');
            expect(aggregated).toHaveProperty('user_action');
            expect(aggregated.page_view.count).toBe(2);
            expect(aggregated.user_action.count).toBe(1);
        });

        test('should handle data retention cleanup', async () => {
            // Add old data
            const oldData = {
                name: 'old_event',
                timestamp: new Date(Date.now() - 3500000000) // 40 days ago
            };

            analyticsService.eventQueue.push(oldData);

            // Run cleanup
            analyticsService.cleanupOldData();

            expect(analyticsService.eventQueue).toHaveLength(0);
        });
    });

    describe('Analytics User Behavior Tracking', () => {
        test('should track complete user journey', async () => {
            const userId = 'user123';
            const sessionId = 'session456';

            // Start session
            await request(app)
                .post('/api/analytics/sessions')
                .send({
                    userId,
                    sessionId,
                    device: 'desktop',
                    browser: 'Chrome',
                    location: 'US'
                });

            // Track page views
            const pages = ['/home', '/products', '/product-detail', '/cart', '/checkout'];
            for (const page of pages) {
                await request(app)
                    .post('/api/analytics/sessions/pageview')
                    .send({
                        userId,
                        sessionId,
                        page,
                        referrer: pages[pages.indexOf(page) - 1] || 'direct'
                    });
            }

            // Track user actions
            await request(app)
                .post('/api/analytics/events')
                .send({
                    name: 'user_action',
                    userId,
                    sessionId,
                    properties: {
                        action: 'add_to_cart',
                        productId: 'prod123'
                    }
                });

            // Track conversion
            await request(app)
                .post('/api/analytics/business/conversion')
                .send({
                    userId,
                    sessionId,
                    conversionType: 'purchase',
                    value: 99.99,
                    currency: 'USD'
                });

            // Track engagement
            await request(app)
                .post('/api/analytics/engagement')
                .send({
                    userId,
                    sessionId,
                    sessionDuration: 300,
                    pageViews: pages.length,
                    interactions: 8,
                    bounceRate: 0
                });

            const session = analyticsService.userSessions.get(sessionId);
            expect(session.pageViews).toHaveLength(pages.length);
            expect(session.events).toHaveLength(4); // page views + user action + conversion + engagement
        });

        test('should track user segments and cohorts', async () => {
            // Track users with different characteristics
            const users = [
                {
                    userId: 'user1',
                    segment: 'premium',
                    cohort: '2024-01'
                },
                {
                    userId: 'user2',
                    segment: 'free',
                    cohort: '2024-01'
                },
                {
                    userId: 'user3',
                    segment: 'premium',
                    cohort: '2024-02'
                }
            ];

            for (const user of users) {
                await request(app)
                    .post('/api/analytics/events')
                    .send({
                        name: 'user_segment',
                        userId: user.userId,
                        properties: {
                            segment: user.segment,
                            cohort: user.cohort
                        }
                    });
            }

            expect(analyticsService.eventQueue).toHaveLength(3);
            
            const segments = analyticsService.eventQueue.filter(e => 
                e.properties.segment === 'premium'
            );
            expect(segments).toHaveLength(2);
        });
    });

    describe('Analytics Performance Monitoring', () => {
        test('should track and analyze performance metrics', async () => {
            // Track various performance metrics
            const performanceMetrics = [
                {
                    endpoint: '/api/users',
                    responseTime: 150,
                    statusCode: 200
                },
                {
                    endpoint: '/api/products',
                    responseTime: 250,
                    statusCode: 200
                },
                {
                    endpoint: '/api/search',
                    responseTime: 500,
                    statusCode: 200
                }
            ];

            for (const metric of performanceMetrics) {
                await request(app)
                    .post('/api/analytics/performance/api')
                    .send({
                        ...metric,
                        method: 'GET'
                    });
            }

            // Analyze performance
            const performanceReport = analyticsService.generatePerformanceReport();
            
            expect(performanceReport).toHaveProperty('apiResponseTimes');
            expect(performanceReport.apiResponseTimes).toHaveProperty('average');
            expect(performanceReport.apiResponseTimes).toHaveProperty('p95');
            expect(performanceReport.apiResponseTimes).toHaveProperty('p99');
        });

        test('should identify performance bottlenecks', async () => {
            // Add slow performance data
            await request(app)
                .post('/api/analytics/performance/api')
                .send({
                    endpoint: '/api/slow-endpoint',
                    responseTime: 2000,
                    statusCode: 200,
                    method: 'GET'
                });

            await request(app)
                .post('/api/analytics/performance/database')
                .send({
                    query: 'SELECT * FROM large_table',
                    executionTime: 5000,
                    rowsReturned: 10000,
                    queryType: 'select'
                });

            const report = analyticsService.generatePerformanceReport();
            
            expect(report).toHaveProperty('bottlenecks');
            expect(report.bottlenecks).toBeInstanceOf(Array);
            expect(report.bottlenecks.length).toBeGreaterThan(0);
        });
    });

    describe('Analytics Business Intelligence', () => {
        test('should track and analyze business metrics', async () => {
            // Track business metrics
            const businessMetrics = [
                { metric: 'revenue', value: 1000, period: 'daily' },
                { metric: 'revenue', value: 1500, period: 'daily' },
                { metric: 'conversion_rate', value: 0.025, period: 'daily' },
                { metric: 'customer_acquisition_cost', value: 50, period: 'monthly' }
            ];

            for (const metric of businessMetrics) {
                await request(app)
                    .post('/api/analytics/business/metric')
                    .send(metric);
            }

            const intelligenceReport = analyticsService.generateBusinessIntelligenceReport();
            
            expect(intelligenceReport).toHaveProperty('revenue');
            expect(intelligenceReport).toHaveProperty('conversionRates');
            expect(intelligenceReport).toHaveProperty('customerAcquisitionCost');
            expect(intelligenceReport.revenue.total).toBe(2500);
        });

        test('should calculate ROI and predictions', async () => {
            // Add historical data for predictions
            for (let i = 0; i < 30; i++) {
                await request(app)
                    .post('/api/analytics/business/metric')
                    .send({
                        metric: 'revenue',
                        value: 1000 + (i * 50),
                        period: 'daily'
                    });
            }

            const report = analyticsService.generateBusinessIntelligenceReport();
            
            expect(report).toHaveProperty('returnOnInvestment');
            expect(report).toHaveProperty('predictions');
            expect(report.predictions).toHaveProperty('revenue_forecast');
            expect(report.predictions).toHaveProperty('growth_rate');
        });
    });

    describe('Analytics Error Handling and Recovery', () => {
        test('should handle analytics service errors gracefully', async () => {
            // Mock error in analytics service
            jest.spyOn(analyticsService, 'trackEvent').mockImplementation(() => {
                throw new Error('Analytics service error');
            });

            const response = await request(app)
                .post('/api/analytics/events')
                .send({
                    name: 'test_event',
                    userId: 'user123'
                })
                .expect(500);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Analytics service error');
        });

        test('should recover from batch processing failures', async () => {
            // Add events to queue
            analyticsService.eventQueue = [
                { name: 'event1', timestamp: new Date() },
                { name: 'event2', timestamp: new Date() }
            ];

            // Mock error in batch processing
            jest.spyOn(analyticsService, 'storeEventData').mockRejectedValueOnce(new Error('Storage error'));

            // Process batch should handle error gracefully
            await analyticsService.processBatch();

            // Events should still be in queue for retry
            expect(analyticsService.eventQueue.length).toBeGreaterThan(0);
        });

        test('should handle invalid analytics data', async () => {
            const invalidData = [
                { name: null, userId: 'user123' },
                { name: 'test_event', userId: null },
                { name: 'test_event', userId: 'user123', properties: { value: Infinity } }
            ];

            for (const data of invalidData) {
                const response = await request(app)
                    .post('/api/analytics/events')
                    .send(data)
                    .expect(400);

                expect(response.body).toHaveProperty('error');
            }
        });
    });

    describe('Analytics Data Privacy and Security', () => {
        test('should handle PII data sanitization', async () => {
            const eventWithPII = {
                name: 'user_signup',
                userId: 'user123',
                properties: {
                    email: 'user@example.com',
                    phone: '+1234567890',
                    ssn: '123-45-6789',
                    creditCard: '1234-5678-9012-3456'
                }
            };

            const response = await request(app)
                .post('/api/analytics/events')
                .send(eventWithPII)
                .expect(200);

            expect(response.body.success).toBe(true);
            
            // Verify PII is sanitized in stored event
            const storedEvent = analyticsService.eventQueue[0];
            expect(storedEvent.properties.email).toBe('[REDACTED]');
            expect(storedEvent.properties.phone).toBe('[REDACTED]');
            expect(storedEvent.properties.ssn).toBe('[REDACTED]');
            expect(storedEvent.properties.creditCard).toBe('[REDACTED]');
        });

        test('should respect user consent and privacy settings', async () => {
            // User with tracking disabled
            const eventData = {
                name: 'page_view',
                userId: 'user123',
                properties: {
                    page: '/home'
                },
                consent: {
                    analytics: false,
                    marketing: false
                }
            };

            const response = await request(app)
                .post('/api/analytics/events')
                .send(eventData)
                .expect(200);

            // Event should not be tracked if analytics consent is false
            expect(analyticsService.eventQueue).toHaveLength(0);
            expect(response.body).toHaveProperty('consent', false);
        });

        test('should handle data anonymization', async () => {
            const eventData = {
                name: 'page_view',
                userId: 'user123',
                properties: {
                    page: '/home'
                },
                anonymize: true
            };

            const response = await request(app)
                .post('/api/analytics/events')
                .send(eventData)
                .expect(200);

            expect(response.body.success).toBe(true);
            
            // User ID should be anonymized
            const storedEvent = analyticsService.eventQueue[0];
            expect(storedEvent.userId).not.toBe('user123');
            expect(storedEvent.userId).toMatch(/^anon_[a-f0-9]{8}$/);
        });
    });

    describe('Analytics Service Integration', () => {
        test('should integrate with logging service', async () => {
            const logSpy = jest.spyOn(loggingService, 'logInfo');

            await request(app)
                .post('/api/analytics/events')
                .send({
                    name: 'test_event',
                    userId: 'user123'
                });

            expect(logSpy).toHaveBeenCalledWith('analytics', 'Event tracked: test_event', expect.any(Object));
        });

        test('should integrate with monitoring service', async () => {
            const metricSpy = jest.spyOn(monitoringService, 'trackMetric');

            await request(app)
                .post('/api/analytics/events')
                .send({
                    name: 'test_event',
                    userId: 'user123'
                });

            expect(metricSpy).toHaveBeenCalledWith('analytics_events_total', 1, expect.any(Object));
        });

        test('should emit analytics events', async () => {
            const eventSpy = jest.fn();
            analyticsService.on('event_tracked', eventSpy);

            await request(app)
                .post('/api/analytics/events')
                .send({
                    name: 'test_event',
                    userId: 'user123'
                });

            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                name: 'test_event',
                userId: 'user123'
            }));
        });
    });
});