const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const loggingService = require('./LoggingService');
const monitoringService = require('./MonitoringService');

/**
 * Analytics Service - Comprehensive analytics and monitoring
 * Provides real-time analytics, user behavior tracking, performance monitoring,
 * and business intelligence insights
 */
class AnalyticsService extends EventEmitter {
    constructor() {
        super();
        this.isInitialized = false;
        this.eventQueue = [];
        this.batchSize = 100;
        this.flushInterval = 5000; // 5 seconds
        this.aggregations = new Map();
        this.realTimeMetrics = new Map();
        this.userSessions = new Map();
        this.performanceMetrics = new Map();
        this.businessMetrics = new Map();
        
        this.initialize();
    }

    /**
     * Initialize analytics service
     */
    async initialize() {
        try {
            this.setupEventBatching();
            this.setupRealTimeMonitoring();
            this.setupPerformanceTracking();
            this.setupBusinessMetrics();
            
            this.isInitialized = true;
            this.logger.logInfo('analytics', 'Analytics service initialized successfully');
            
            this.emit('initialized');
        } catch (error) {
            this.logger.logError('analytics', 'Failed to initialize analytics service', { error });
            throw error;
        }
    }

    /**
     * Track API endpoint usage and performance
     */
    trackApiEndpoint(method, path, statusCode, responseTime, userId = null, metadata = {}) {
        const event = {
            type: 'api_endpoint',
            timestamp: new Date(),
            data: {
                method,
                path,
                statusCode,
                responseTime,
                userId,
                metadata
            }
        };

        this.trackEvent(event);
        this.updateEndpointMetrics(method, path, statusCode, responseTime);
    }

    /**
     * Track user behavior and interactions
     */
    trackUserBehavior(userId, action, properties = {}, sessionId = null) {
        const event = {
            type: 'user_behavior',
            timestamp: new Date(),
            userId,
            sessionId: sessionId || this.getSessionId(userId),
            data: {
                action,
                properties
            }
        };

        this.trackEvent(event);
        this.updateUserSession(userId, action, properties);
    }

    /**
     * Track user sessions and engagement
     */
    trackSession(userId, sessionId, eventType, metadata = {}) {
        const event = {
            type: 'session',
            timestamp: new Date(),
            userId,
            sessionId,
            data: {
                eventType, // 'start', 'end', 'heartbeat', 'timeout'
                metadata
            }
        };

        this.trackEvent(event);
        this.updateSessionMetrics(userId, sessionId, eventType, metadata);
    }

    /**
     * Track performance metrics
     */
    trackPerformance(metricName, value, unit = 'ms', tags = {}) {
        const event = {
            type: 'performance',
            timestamp: new Date(),
            data: {
                metricName,
                value,
                unit,
                tags
            }
        };

        this.trackEvent(event);
        this.updatePerformanceMetrics(metricName, value, tags);
    }

    /**
     * Track business metrics and KPIs
     */
    trackBusinessMetric(metricName, value, dimensions = {}) {
        const event = {
            type: 'business_metric',
            timestamp: new Date(),
            data: {
                metricName,
                value,
                dimensions
            }
        };

        this.trackEvent(event);
        this.updateBusinessMetrics(metricName, value, dimensions);
    }

    /**
     * Track error events and patterns
     */
    trackError(error, context = {}) {
        const event = {
            type: 'error',
            timestamp: new Date(),
            data: {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: error.code
                },
                context
            }
        };

        this.trackEvent(event);
        this.updateErrorMetrics(error, context);
    }

    /**
     * Track security events and incidents
     */
    trackSecurityEvent(eventType, severity, details = {}) {
        const event = {
            type: 'security',
            timestamp: new Date(),
            data: {
                eventType,
                severity,
                details
            }
        };

        this.trackEvent(event);
        this.updateSecurityMetrics(eventType, severity, details);
    }

    /**
     * Generic event tracking with batching
     */
    trackEvent(event) {
        if (!this.isInitialized) {
            this.logger.logWarning('analytics', 'Analytics service not initialized, queuing event');
        }

        const enrichedEvent = {
            id: uuidv4(),
            ...event,
            metadata: {
                service: 'piper-newsletter',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            }
        };

        this.eventQueue.push(enrichedEvent);
        
        if (this.eventQueue.length >= this.batchSize) {
            this.flushEvents();
        }

        this.emit('event_tracked', enrichedEvent);
    }

    /**
     * Flush queued events
     */
    async flushEvents() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        try {
            await this.processEvents(events);
            this.logger.logDebug('analytics', `Processed ${events.length} analytics events`);
        } catch (error) {
            this.logger.logError('analytics', 'Failed to process analytics events', { error });
            // Re-queue events for retry
            this.eventQueue.unshift(...events);
        }
    }

    /**
     * Process batch of events
     */
    async processEvents(events) {
        // Group events by type for efficient processing
        const groupedEvents = events.reduce((groups, event) => {
            if (!groups[event.type]) {
                groups[event.type] = [];
            }
            groups[event.type].push(event);
            return groups;
        }, {});

        // Process each group
        for (const [type, typeEvents] of Object.entries(groupedEvents)) {
            await this.processEventGroup(type, typeEvents);
        }

        // Update real-time metrics
        this.updateRealTimeMetrics(events);
    }

    /**
     * Process events of specific type
     */
    async processEventGroup(type, events) {
        switch (type) {
            case 'api_endpoint':
                await this.processApiEndpointEvents(events);
                break;
            case 'user_behavior':
                await this.processUserBehaviorEvents(events);
                break;
            case 'session':
                await this.processSessionEvents(events);
                break;
            case 'performance':
                await this.processPerformanceEvents(events);
                break;
            case 'business_metric':
                await this.processBusinessMetricEvents(events);
                break;
            case 'error':
                await this.processErrorEvents(events);
                break;
            case 'security':
                await this.processSecurityEvents(events);
                break;
            default:
                this.logger.logWarning('analytics', `Unknown event type: ${type}`);
        }
    }

    /**
     * Process API endpoint events
     */
    async processApiEndpointEvents(events) {
        const aggregations = {
            totalRequests: events.length,
            statusCodes: {},
            responseTimes: [],
            endpoints: {}
        };

        events.forEach(event => {
            const { method, path, statusCode, responseTime } = event.data;
            
            // Status code distribution
            aggregations.statusCodes[statusCode] = (aggregations.statusCodes[statusCode] || 0) + 1;
            
            // Response times
            aggregations.responseTimes.push(responseTime);
            
            // Endpoint statistics
            const endpointKey = `${method} ${path}`;
            if (!aggregations.endpoints[endpointKey]) {
                aggregations.endpoints[endpointKey] = {
                    count: 0,
                    totalResponseTime: 0,
                    statusCodes: {}
                };
            }
            
            aggregations.endpoints[endpointKey].count++;
            aggregations.endpoints[endpointKey].totalResponseTime += responseTime;
            aggregations.endpoints[endpointKey].statusCodes[statusCode] = 
                (aggregations.endpoints[endpointKey].statusCodes[statusCode] || 0) + 1;
        });

        // Calculate averages
        Object.keys(aggregations.endpoints).forEach(endpoint => {
            const endpointData = aggregations.endpoints[endpoint];
            endpointData.avgResponseTime = endpointData.totalResponseTime / endpointData.count;
        });

        // Store aggregations
        this.updateAggregations('api_endpoints', aggregations);
        
        // Record metrics
        this.recordApiMetrics(aggregations);
    }

    /**
     * Process user behavior events
     */
    async processUserBehaviorEvents(events) {
        const userActions = {};
        const featureUsage = {};

        events.forEach(event => {
            const { userId, data } = event.data;
            const { action, properties } = data;
            
            // User actions
            if (!userActions[userId]) {
                userActions[userId] = {};
            }
            userActions[userId][action] = (userActions[userId][action] || 0) + 1;
            
            // Feature usage
            if (properties.feature) {
                featureUsage[properties.feature] = (featureUsage[properties.feature] || 0) + 1;
            }
        });

        this.updateAggregations('user_behavior', { userActions, featureUsage });
    }

    /**
     * Process session events
     */
    async processSessionEvents(events) {
        const sessionStats = {
            activeSessions: 0,
            sessionDurations: [],
            bounceRate: 0
        };

        events.forEach(event => {
            const { eventType, metadata } = event.data;
            
            if (eventType === 'start') {
                sessionStats.activeSessions++;
            } else if (eventType === 'end' && metadata.duration) {
                sessionStats.sessionDurations.push(metadata.duration);
            }
        });

        this.updateAggregations('sessions', sessionStats);
    }

    /**
     * Process performance events
     */
    async processPerformanceEvents(events) {
        const performanceStats = {
            metrics: {}
        };

        events.forEach(event => {
            const { metricName, value, tags } = event.data;
            
            if (!performanceStats.metrics[metricName]) {
                performanceStats.metrics[metricName] = {
                    values: [],
                    tags: new Set()
                };
            }
            
            performanceStats.metrics[metricName].values.push(value);
            Object.keys(tags).forEach(tag => performanceStats.metrics[metricName].tags.add(tag));
        });

        this.updateAggregations('performance', performanceStats);
        this.updatePerformanceMetrics(performanceStats);
    }

    /**
     * Process business metric events
     */
    async processBusinessMetricEvents(events) {
        const businessStats = {};

        events.forEach(event => {
            const { metricName, value, dimensions } = event.data;
            
            const key = `${metricName}:${JSON.stringify(dimensions)}`;
            if (!businessStats[key]) {
                businessStats[key] = {
                    total: 0,
                    count: 0,
                    dimensions
                };
            }
            
            businessStats[key].total += value;
            businessStats[key].count++;
        });

        this.updateAggregations('business_metrics', businessStats);
        this.updateBusinessMetrics(businessStats);
    }

    /**
     * Process error events
     */
    async processErrorEvents(events) {
        const errorStats = {
            totalErrors: events.length,
            errorTypes: {},
            errorCodes: {},
            errorPatterns: []
        };

        events.forEach(event => {
            const { error } = event.data;
            
            // Error types
            errorStats.errorTypes[error.name] = (errorStats.errorTypes[error.name] || 0) + 1;
            
            // Error codes
            if (error.code) {
                errorStats.errorCodes[error.code] = (errorStats.errorCodes[error.code] || 0) + 1;
            }
        });

        this.updateAggregations('errors', errorStats);
        this.updateErrorMetrics(errorStats);
    }

    /**
     * Process security events
     */
    async processSecurityEvents(events) {
        const securityStats = {
            totalEvents: events.length,
            bySeverity: {},
            byType: {}
        };

        events.forEach(event => {
            const { severity, eventType } = event.data;
            
            securityStats.bySeverity[severity] = (securityStats.bySeverity[severity] || 0) + 1;
            securityStats.byType[eventType] = (securityStats.byType[eventType] || 0) + 1;
        });

        this.updateAggregations('security', securityStats);
        this.updateSecurityMetrics(securityStats);
    }

    /**
     * Update aggregations
     */
    updateAggregations(key, data) {
        const timestamp = Date.now();
        
        if (!this.aggregations.has(key)) {
            this.aggregations.set(key, []);
        }
        
        const aggregations = this.aggregations.get(key);
        aggregations.push({
            timestamp,
            data
        });
        
        // Keep only last 24 hours of aggregations
        const cutoff = timestamp - (24 * 60 * 60 * 1000);
        const filtered = aggregations.filter(agg => agg.timestamp > cutoff);
        this.aggregations.set(key, filtered);
    }

    /**
     * Update real-time metrics
     */
    updateRealTimeMetrics(events) {
        const now = Date.now();
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        
        events.forEach(event => {
            const key = `${event.type}:${event.data.metricName || event.data.action || 'default'}`;
            
            if (!this.realTimeMetrics.has(key)) {
                this.realTimeMetrics.set(key, []);
            }
            
            const metrics = this.realTimeMetrics.get(key);
            metrics.push({
                timestamp: now,
                value: event.data.value || 1
            });
            
            // Keep only recent metrics
            const cutoff = now - timeWindow;
            const filtered = metrics.filter(metric => metric.timestamp > cutoff);
            this.realTimeMetrics.set(key, filtered);
        });
    }

    /**
     * Update endpoint metrics
     */
    updateEndpointMetrics(method, path, statusCode, responseTime) {
        const key = `${method} ${path}`;
        
        if (!this.performanceMetrics.has(key)) {
            this.performanceMetrics.set(key, {
                count: 0,
                totalResponseTime: 0,
                statusCodes: {},
                avgResponseTime: 0
            });
        }
        
        const metrics = this.performanceMetrics.get(key);
        metrics.count++;
        metrics.totalResponseTime += responseTime;
        metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
        metrics.avgResponseTime = metrics.totalResponseTime / metrics.count;
    }

    /**
     * Update user session metrics
     */
    updateUserSession(userId, action, properties) {
        const now = Date.now();
        
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, {
                sessionId: uuidv4(),
                startTime: now,
                lastActivity: now,
                actions: [],
                features: new Set()
            });
        }
        
        const session = this.userSessions.get(userId);
        session.lastActivity = now;
        session.actions.push({
            action,
            timestamp: now,
            properties
        });
        
        if (properties.feature) {
            session.features.add(properties.feature);
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(performanceStats) {
        Object.entries(performanceStats.metrics).forEach(([metricName, data]) => {
            const values = data.values;
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            const max = Math.max(...values);
            const min = Math.min(...values);
            
            this.monitoring.recordMetric('performance', metricName, {
                avg,
                max,
                min,
                count: values.length
            });
        });
    }

    /**
     * Update business metrics
     */
    updateBusinessMetrics(businessStats) {
        Object.entries(businessStats).forEach(([key, data]) => {
            const avg = data.total / data.count;
            
            this.monitoring.recordMetric('business', key, {
                total: data.total,
                count: data.count,
                average: avg,
                dimensions: data.dimensions
            });
        });
    }

    /**
     * Update error metrics
     */
    updateErrorMetrics(errorStats) {
        this.monitoring.recordMetric('errors', 'total_errors', errorStats.totalErrors);
        
        Object.entries(errorStats.errorTypes).forEach(([errorType, count]) => {
            this.monitoring.recordMetric('errors', `error_type_${errorType}`, count);
        });
    }

    /**
     * Update security metrics
     */
    updateSecurityMetrics(securityStats) {
        this.monitoring.recordMetric('security', 'total_events', securityStats.totalEvents);
        
        Object.entries(securityStats.bySeverity).forEach(([severity, count]) => {
            this.monitoring.recordMetric('security', `severity_${severity}`, count);
        });
    }

    /**
     * Record API metrics
     */
    recordApiMetrics(aggregations) {
        this.monitoring.recordMetric('api', 'total_requests', aggregations.totalRequests);
        
        Object.entries(aggregations.statusCodes).forEach(([statusCode, count]) => {
            this.monitoring.recordMetric('api', `status_${statusCode}`, count);
        });
        
        if (aggregations.responseTimes.length > 0) {
            const avgResponseTime = aggregations.responseTimes.reduce((sum, time) => sum + time, 0) / aggregations.responseTimes.length;
            this.monitoring.recordMetric('api', 'avg_response_time', avgResponseTime);
        }
    }

    /**
     * Get session ID for user
     */
    getSessionId(userId) {
        if (this.userSessions.has(userId)) {
            return this.userSessions.get(userId).sessionId;
        }
        return uuidv4();
    }

    /**
     * Get analytics dashboard data
     */
    getDashboardData(timeRange = '24h') {
        const now = Date.now();
        const timeWindow = this.getTimeWindow(timeRange);
        const cutoff = now - timeWindow;

        return {
            apiMetrics: this.getApiMetrics(cutoff),
            userMetrics: this.getUserMetrics(cutoff),
            performanceMetrics: this.getPerformanceMetrics(cutoff),
            businessMetrics: this.getBusinessMetrics(cutoff),
            errorMetrics: this.getErrorMetrics(cutoff),
            securityMetrics: this.getSecurityMetrics(cutoff),
            realTimeMetrics: this.getRealTimeMetrics()
        };
    }

    /**
     * Get API metrics
     */
    getApiMetrics(cutoff) {
        const apiData = this.aggregations.get('api_endpoints') || [];
        const recentData = apiData.filter(agg => agg.timestamp > cutoff);

        return {
            totalRequests: recentData.reduce((sum, agg) => sum + agg.data.totalRequests, 0),
            statusCodes: this.aggregateStatusCodes(recentData),
            topEndpoints: this.getTopEndpoints(recentData),
            responseTimeTrends: this.getResponseTimeTrends(recentData)
        };
    }

    /**
     * Get user metrics
     */
    getUserMetrics(cutoff) {
        const userData = this.aggregations.get('user_behavior') || [];
        const recentData = userData.filter(agg => agg.timestamp > cutoff);

        return {
            activeUsers: this.getActiveUsers(cutoff),
            userActions: this.aggregateUserActions(recentData),
            featureUsage: this.getFeatureUsage(recentData),
            sessionMetrics: this.getSessionMetrics(cutoff)
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics(cutoff) {
        const perfData = this.aggregations.get('performance') || [];
        const recentData = perfData.filter(agg => agg.timestamp > cutoff);

        return {
            responseTimes: this.getResponseTimeMetrics(recentData),
            throughput: this.getThroughputMetrics(recentData),
            resourceUsage: this.getResourceUsageMetrics(recentData)
        };
    }

    /**
     * Get business metrics
     */
    getBusinessMetrics(cutoff) {
        const businessData = this.aggregations.get('business_metrics') || [];
        const recentData = businessData.filter(agg => agg.timestamp > cutoff);

        return {
            kpis: this.getKPIs(recentData),
            conversionRates: this.getConversionRates(recentData),
            revenueMetrics: this.getRevenueMetrics(recentData)
        };
    }

    /**
     * Get error metrics
     */
    getErrorMetrics(cutoff) {
        const errorData = this.aggregations.get('errors') || [];
        const recentData = errorData.filter(agg => agg.timestamp > cutoff);

        return {
            totalErrors: recentData.reduce((sum, agg) => sum + agg.data.totalErrors, 0),
            errorTypes: this.aggregateErrorTypes(recentData),
            errorRates: this.getErrorRates(recentData)
        };
    }

    /**
     * Get security metrics
     */
    getSecurityMetrics(cutoff) {
        const securityData = this.aggregations.get('security') || [];
        const recentData = securityData.filter(agg => agg.timestamp > cutoff);

        return {
            totalEvents: recentData.reduce((sum, agg) => sum + agg.data.totalEvents, 0),
            bySeverity: this.aggregateSecurityBySeverity(recentData),
            byType: this.aggregateSecurityByType(recentData)
        };
    }

    /**
     * Get real-time metrics
     */
    getRealTimeMetrics() {
        const metrics = {};
        
        this.realTimeMetrics.forEach((values, key) => {
            if (values.length > 0) {
                const recentValues = values.filter(v => Date.now() - v.timestamp < 5 * 60 * 1000);
                metrics[key] = {
                    current: recentValues[recentValues.length - 1]?.value || 0,
                    average: recentValues.reduce((sum, v) => sum + v.value, 0) / recentValues.length,
                    trend: this.calculateTrend(recentValues)
                };
            }
        });

        return metrics;
    }

    /**
     * Get time window in milliseconds
     */
    getTimeWindow(timeRange) {
        const windows = {
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };

        return windows[timeRange] || windows['24h'];
    }

    /**
     * Helper methods for data aggregation
     */
    aggregateStatusCodes(data) {
        const statusCodes = {};
        data.forEach(agg => {
            Object.entries(agg.data.statusCodes).forEach(([code, count]) => {
                statusCodes[code] = (statusCodes[code] || 0) + count;
            });
        });
        return statusCodes;
    }

    getTopEndpoints(data) {
        const endpoints = {};
        data.forEach(agg => {
            Object.entries(agg.data.endpoints).forEach(([endpoint, stats]) => {
                if (!endpoints[endpoint]) {
                    endpoints[endpoint] = { count: 0, avgResponseTime: 0 };
                }
                endpoints[endpoint].count += stats.count;
                endpoints[endpoint].avgResponseTime = stats.avgResponseTime;
            });
        });

        return Object.entries(endpoints)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 10)
            .map(([endpoint, stats]) => ({ endpoint, ...stats }));
    }

    getResponseTimeTrends(data) {
        return data.map(agg => ({
            timestamp: agg.timestamp,
            avgResponseTime: Object.values(agg.data.endpoints)
                .reduce((sum, endpoint) => sum + endpoint.avgResponseTime, 0) / 
                Object.keys(agg.data.endpoints).length
        }));
    }

    getActiveUsers(cutoff) {
        const sessionData = this.aggregations.get('sessions') || [];
        const recentSessions = sessionData.filter(agg => agg.timestamp > cutoff);
        
        const userIds = new Set();
        recentSessions.forEach(agg => {
            if (agg.data.userId) {
                userIds.add(agg.data.userId);
            }
        });

        return userIds.size;
    }

    aggregateUserActions(data) {
        const actions = {};
        data.forEach(agg => {
            Object.entries(agg.data.userActions).forEach(([userId, userActions]) => {
                Object.entries(userActions).forEach(([action, count]) => {
                    actions[action] = (actions[action] || 0) + count;
                });
            });
        });
        return actions;
    }

    getFeatureUsage(data) {
        const features = {};
        data.forEach(agg => {
            Object.entries(agg.data.featureUsage || {}).forEach(([feature, count]) => {
                features[feature] = (features[feature] || 0) + count;
            });
        });
        return features;
    }

    getSessionMetrics(cutoff) {
        const sessionData = this.aggregations.get('sessions') || [];
        const recentSessions = sessionData.filter(agg => agg.timestamp > cutoff);
        
        let totalSessions = 0;
        let totalDuration = 0;
        
        recentSessions.forEach(agg => {
            if (agg.data.sessionDurations) {
                totalSessions += agg.data.sessionDurations.length;
                totalDuration += agg.data.sessionDurations.reduce((sum, duration) => sum + duration, 0);
            }
        });

        return {
            totalSessions,
            avgDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
            bounceRate: this.calculateBounceRate(recentSessions)
        };
    }

    calculateBounceRate(sessionData) {
        // Simplified bounce rate calculation
        return 0.25; // Placeholder
    }

    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values.slice(-10);
        const older = values.slice(0, Math.min(10, values.length - 10));
        
        const recentAvg = recent.reduce((sum, v) => sum + v.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, v) => sum + v.value, 0) / older.length;
        
        const change = (recentAvg - olderAvg) / olderAvg;
        
        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    /**
     * Get analytics report
     */
    getAnalyticsReport(timeRange = '24h', metrics = []) {
        const dashboardData = this.getDashboardData(timeRange);
        
        return {
            timeRange,
            generatedAt: new Date(),
            summary: this.generateSummary(dashboardData),
            metrics: metrics.length > 0 ? this.filterMetrics(dashboardData, metrics) : dashboardData,
            insights: this.generateInsights(dashboardData),
            recommendations: this.generateRecommendations(dashboardData)
        };
    }

    /**
     * Generate summary
     */
    generateSummary(data) {
        return {
            totalRequests: data.apiMetrics?.totalRequests || 0,
            activeUsers: data.userMetrics?.activeUsers || 0,
            avgResponseTime: this.calculateOverallAvgResponseTime(data.performanceMetrics),
            errorRate: this.calculateOverallErrorRate(data.errorMetrics),
            topIssues: this.identifyTopIssues(data)
        };
    }

    /**
     * Generate insights
     */
    generateInsights(data) {
        const insights = [];

        // Performance insights
        if (data.performanceMetrics?.responseTimes?.avg > 1000) {
            insights.push({
                type: 'performance',
                severity: 'high',
                message: 'Average response time is above 1 second'
            });
        }

        // Error insights
        if (data.errorMetrics?.totalErrors > 100) {
            insights.push({
                type: 'error',
                severity: 'medium',
                message: 'High error rate detected'
            });
        }

        // User insights
        if (data.userMetrics?.sessionMetrics?.bounceRate > 0.5) {
            insights.push({
                type: 'user',
                severity: 'medium',
                message: 'High bounce rate detected'
            });
        }

        return insights;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(data) {
        const recommendations = [];

        // Performance recommendations
        if (data.performanceMetrics?.responseTimes?.avg > 500) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                recommendation: 'Consider implementing caching or optimizing database queries',
                estimatedImpact: '50-70% improvement in response time'
            });
        }

        // Error recommendations
        if (data.errorMetrics?.totalErrors > 50) {
            recommendations.push({
                type: 'error',
                priority: 'high',
                recommendation: 'Review error logs and fix top error types',
                estimatedImpact: '30-50% reduction in error rate'
            });
        }

        return recommendations;
    }

    /**
     * Setup event batching
     */
    setupEventBatching() {
        setInterval(() => {
            this.flushEvents();
        }, this.flushInterval);

        // Flush on process exit
        process.on('exit', () => {
            this.flushEvents();
        });

        process.on('SIGTERM', () => {
            this.flushEvents();
        });
    }

    /**
     * Setup real-time monitoring
     */
    setupRealTimeMonitoring() {
        // Monitor key metrics every 30 seconds
        setInterval(() => {
            this.monitorKeyMetrics();
        }, 30000);
    }

    /**
     * Setup performance tracking
     */
    setupPerformanceTracking() {
        // Track system performance metrics
        setInterval(() => {
            this.trackSystemPerformance();
        }, 60000); // Every minute
    }

    /**
     * Setup business metrics
     */
    setupBusinessMetrics() {
        // Track business KPIs
        setInterval(() => {
            this.trackBusinessKPIs();
        }, 300000); // Every 5 minutes
    }

    /**
     * Monitor key metrics
     */
    monitorKeyMetrics() {
        const metrics = this.getRealTimeMetrics();
        
        // Check for anomalies
        Object.entries(metrics).forEach(([key, metric]) => {
            if (metric.trend === 'increasing' && metric.current > metric.average * 2) {
                this.logger.logWarning('analytics', `Metric ${key} is spiking`, { metric });
            }
        });
    }

    /**
     * Track system performance
     */
    async trackSystemPerformance() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.trackPerformance('memory_usage', memUsage.heapUsed, 'bytes', {
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss
        });
        
        this.trackPerformance('cpu_usage', cpuUsage.user + cpuUsage.system, 'microseconds', {
            user: cpuUsage.user,
            system: cpuUsage.system
        });
    }

    /**
     * Track business KPIs
     */
    async trackBusinessKPIs() {
        // Track user engagement
        const activeUsers = this.userSessions.size;
        this.trackBusinessMetric('active_users', activeUsers, { type: 'real_time' });
        
        // Track API usage
        const totalRequests = Array.from(this.performanceMetrics.values())
            .reduce((sum, metrics) => sum + metrics.count, 0);
        this.trackBusinessMetric('total_api_requests', totalRequests, { type: 'cumulative' });
    }

    /**
     * Helper methods
     */
    calculateOverallAvgResponseTime(performanceMetrics) {
        if (!performanceMetrics?.responseTimes) return 0;
        return performanceMetrics.responseTimes.avg || 0;
    }

    calculateOverallErrorRate(errorMetrics) {
        if (!errorMetrics?.totalErrors) return 0;
        // This would need total requests to calculate rate
        return 0; // Placeholder
    }

    identifyTopIssues(data) {
        const issues = [];
        
        if (data.errorMetrics?.errorTypes) {
            const topErrors = Object.entries(data.errorMetrics.errorTypes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3);
            
            topErrors.forEach(([type, count]) => {
                issues.push({ type: 'error', name: type, count });
            });
        }
        
        return issues;
    }

    filterMetrics(data, metrics) {
        const filtered = {};
        metrics.forEach(metric => {
            if (data[metric]) {
                filtered[metric] = data[metric];
            }
        });
        return filtered;
    }

    /**
     * Get analytics service health
     */
    getHealth() {
        return {
            status: this.isInitialized ? 'healthy' : 'unhealthy',
            initialized: this.isInitialized,
            eventQueueSize: this.eventQueue.length,
            aggregationsCount: this.aggregations.size,
            realTimeMetricsCount: this.realTimeMetrics.size,
            userSessionsCount: this.userSessions.size,
            performanceMetricsCount: this.performanceMetrics.size
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        await this.flushEvents();
        this.removeAllListeners();
        this.isInitialized = false;
        this.logger.logInfo('analytics', 'Analytics service cleaned up');
    }

    // Getters
    get logger() {
        return loggingService;
    }

    get monitoring() {
        return monitoringService;
    }
}

module.exports = new AnalyticsService();