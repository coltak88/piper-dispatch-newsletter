-- Seed data: Test Data for Development and Testing
-- Created at: 2024-01-01 00:00:00
-- Description: Test data for unit tests, integration tests, and development environments

-- Insert test users for different scenarios
INSERT INTO users (username, email, password_hash, user_role, status, first_name, last_name, phone, company, job_title, email_verified, two_factor_enabled, last_login_at, created_by)
VALUES 
(
    'test_admin',
    'test.admin@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- password: TestAdmin123!
    'admin',
    'active',
    'Test',
    'Admin',
    '+1234567890',
    'Piper Newsletter',
    'System Administrator',
    true,
    false,
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    1
),
(
    'test_user',
    'test.user@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- password: TestUser123!
    'user',
    'active',
    'Test',
    'User',
    '+1234567891',
    'Test Company',
    'Marketing Manager',
    true,
    false,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    1
),
(
    'test_premium',
    'test.premium@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- password: TestPremium123!
    'premium_user',
    'active',
    'Test',
    'Premium',
    '+1234567892',
    'Premium Corp',
    'Email Marketing Director',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '6 hours',
    1
),
(
    'test_enterprise',
    'test.enterprise@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- password: TestEnterprise123!
    'enterprise_user',
    'active',
    'Test',
    'Enterprise',
    '+1234567893',
    'Enterprise Solutions',
    'Chief Marketing Officer',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    1
),
(
    'test_inactive',
    'test.inactive@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- password: TestInactive123!
    'user',
    'inactive',
    'Test',
    'Inactive',
    '+1234567894',
    'Inactive Company',
    'Former Manager',
    false,
    false,
    CURRENT_TIMESTAMP - INTERVAL '90 days',
    1
),
(
    'test_locked',
    'test.locked@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- password: TestLocked123!
    'user',
    'locked',
    'Test',
    'Locked',
    '+1234567895',
    'Locked Company',
    'Marketing Coordinator',
    true,
    false,
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    1
);

-- Insert test newsletters for various scenarios
INSERT INTO newsletters (title, content, excerpt, newsletter_type, status, scheduled_at, sent_at, sender_email, sender_name, reply_to_email, template_used, tags, metadata, created_by)
VALUES 
(
    'Test Newsletter - Draft',
    'This is a test newsletter in draft status for testing purposes.',
    'Test draft newsletter for development.',
    'test',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    NULL,
    'test@pipernewsletter.com',
    'Test Sender',
    'reply@pipernewsletter.com',
    'test_template',
    '["test", "draft"]',
    '{"test": true, "environment": "development"}',
    2
),
(
    'Test Newsletter - Scheduled',
    'This is a test newsletter that is scheduled for future sending.',
    'Test scheduled newsletter for development.',
    'test',
    'scheduled',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    NULL,
    'test@pipernewsletter.com',
    'Test Sender',
    'reply@pipernewsletter.com',
    'test_template',
    '["test", "scheduled"]',
    '{"test": true, "environment": "development", "scheduled": true}',
    2
),
(
    'Test Newsletter - Published',
    'This is a test newsletter that has been published and sent.',
    'Test published newsletter for development.',
    'test',
    'published',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'test@pipernewsletter.com',
    'Test Sender',
    'reply@pipernewsletter.com',
    'test_template',
    '["test", "published"]',
    '{"test": true, "environment": "development", "sent": true}',
    2
),
(
    'Test Newsletter - Template Test',
    'This newsletter is used for testing different email templates and formatting.',
    'Test template variations for development.',
    'test',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    NULL,
    'test@pipernewsletter.com',
    'Test Template Sender',
    'reply@pipernewsletter.com',
    'test_template_v2',
    '["test", "template", "v2"]',
    '{"test": true, "template_version": "2.0", "environment": "development"}',
    2
),
(
    'Test Newsletter - A/B Test',
    'This newsletter is part of an A/B test for subject lines and content variations.',
    'Test A/B testing functionality for development.',
    'test',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    NULL,
    'test@pipernewsletter.com',
    'Test A/B Sender',
    'reply@pipernewsletter.com',
    'ab_test_template',
    '["test", "ab_test", "variant_a"]',
    '{"test": true, "ab_test": true, "variant": "A", "environment": "development"}',
    2
);

-- Insert test subscribers with various statuses
INSERT INTO subscriptions (email, first_name, last_name, phone, company, job_title, industry, country, subscription_status, consent_status, consent_source, consent_date, verification_token, verification_date, preferences, tags, custom_fields, source, campaign_source, medium)
VALUES 
(
    'test.subscriber1@example.com',
    'Test',
    'Subscriber1',
    '+1234567801',
    'Test Company 1',
    'Test Manager 1',
    'technology',
    'United States',
    'active',
    'granted',
    'test_signup',
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    'test_verify_token_001',
    CURRENT_TIMESTAMP - INTERVAL '14 days',
    '{"frequency": "weekly", "categories": ["technology", "testing"], "format": "html"}',
    '["test", "active", "tech"]',
    '{"test_account": true, "environment": "development"}',
    'test',
    'test_campaign',
    'test_medium'
),
(
    'test.subscriber2@example.com',
    'Test',
    'Subscriber2',
    '+1234567802',
    'Test Company 2',
    'Test Manager 2',
    'marketing',
    'United Kingdom',
    'pending',
    'pending',
    'test_signup',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'test_verify_token_002',
    NULL,
    '{"frequency": "daily", "categories": ["marketing", "testing"], "format": "html"}',
    '["test", "pending", "marketing"]',
    '{"test_account": true, "environment": "development"}',
    'test',
    'test_campaign',
    'test_medium'
),
(
    'test.subscriber3@example.com',
    'Test',
    'Subscriber3',
    '+1234567803',
    'Test Company 3',
    'Test Manager 3',
    'finance',
    'Canada',
    'unsubscribed',
    'withdrawn',
    'test_signup',
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    'test_verify_token_003',
    CURRENT_TIMESTAMP - INTERVAL '29 days',
    '{"frequency": "monthly", "categories": ["finance", "testing"], "format": "text"}',
    '["test", "unsubscribed", "finance"]',
    '{"test_account": true, "environment": "development"}',
    'test',
    'test_campaign',
    'test_medium'
),
(
    'test.subscriber4@example.com',
    'Test',
    'Subscriber4',
    '+1234567804',
    'Test Company 4',
    'Test Manager 4',
    'healthcare',
    'Australia',
    'active',
    'granted',
    'test_signup',
    CURRENT_TIMESTAMP - INTERVAL '20 days',
    'test_verify_token_004',
    CURRENT_TIMESTAMP - INTERVAL '19 days',
    '{"frequency": "weekly", "categories": ["healthcare", "testing"], "format": "html"}',
    '["test", "active", "healthcare"]',
    '{"test_account": true, "environment": "development"}',
    'test',
    'test_campaign',
    'test_medium'
),
(
    'test.invalid@invalid',
    'Test',
    'Invalid',
    '+1234567805',
    'Test Company 5',
    'Test Manager 5',
    'retail',
    'Germany',
    'bounced',
    'granted',
    'test_signup',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    'test_verify_token_005',
    CURRENT_TIMESTAMP - INTERVAL '9 days',
    '{"frequency": "daily", "categories": ["retail", "testing"], "format": "html"}',
    '["test", "bounced", "retail"]',
    '{"test_account": true, "environment": "development", "invalid_email": true}',
    'test',
    'test_campaign',
    'test_medium'
);

-- Insert test email campaigns
INSERT INTO email_campaigns (campaign_name, campaign_type, template_id, target_segment, scheduled_at, status, subject_line, from_name, from_email, reply_to_email, target_audience_size, personalization_enabled, tracking_enabled, created_by)
VALUES 
(
    'Test Campaign - Welcome Series',
    'welcome_series',
    1,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    'completed',
    'Test Welcome - Getting Started',
    'Test Campaign Sender',
    'test.campaign@pipernewsletter.com',
    'test.reply@pipernewsletter.com',
    50,
    true,
    true,
    2
),
(
    'Test Campaign - Newsletter',
    'newsletter',
    2,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    'completed',
    'Test Newsletter - Latest Updates',
    'Test Newsletter Team',
    'test.newsletter@pipernewsletter.com',
    'test.reply@pipernewsletter.com',
    100,
    false,
    true,
    2
),
(
    'Test Campaign - Promotional',
    'promotional',
    3,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    'scheduled',
    'Test Promotional - Special Offer',
    'Test Offers Team',
    'test.offers@pipernewsletter.com',
    'test.reply@pipernewsletter.com',
    75,
    true,
    true,
    2
),
(
    'Test Campaign - A/B Test',
    'ab_test',
    4,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'draft',
    'Test A/B Test - Variant A',
    'Test A/B Team',
    'test.ab@pipernewsletter.com',
    'test.reply@pipernewsletter.com',
    200,
    true,
    true,
    2
),
(
    'Test Campaign - Re-engagement',
    're_engagement',
    5,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    'draft',
    'Test Re-engagement - We Miss You',
    'Test Re-engagement Team',
    'test.reengage@pipernewsletter.com',
    'test.reply@pipernewsletter.com',
    150,
    true,
    true,
    2
);

-- Insert test email queue items
INSERT INTO email_queue (campaign_id, subscriber_id, newsletter_id, status, scheduled_at, priority, personalization_data, tracking_data)
VALUES 
(
    1,
    6,
    6,
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    'high',
    '{"first_name": "Test", "company_name": "Test Company 1"}',
    '{"tracking_id": "test_track_001", "campaign_source": "test_welcome"}'
),
(
    1,
    7,
    6,
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    'high',
    '{"first_name": "Test", "company_name": "Test Company 2"}',
    '{"tracking_id": "test_track_002", "campaign_source": "test_welcome"}'
),
(
    2,
    8,
    7,
    'failed',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    'normal',
    '{"first_name": "Test", "articles": [{"title": "Test Article 1", "summary": "Test summary..."}]}',
    '{"tracking_id": "test_track_003", "campaign_source": "test_newsletter", "failure_reason": "bounced"}'
),
(
    3,
    9,
    8,
    'pending',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    'high',
    '{"first_name": "Test", "discount_percentage": 25, "promo_code": "TEST25"}',
    '{"tracking_id": "test_track_004", "campaign_source": "test_promotional"}'
),
(
    4,
    10,
    9,
    'scheduled',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'normal',
    '{"first_name": "Test", "ab_test_variant": "A"}',
    '{"tracking_id": "test_track_005", "campaign_source": "test_ab_test"}'
);

-- Insert test email tracking data
INSERT INTO email_opens (email_id, subscriber_id, opened_at, ip_address, user_agent, device_type, location)
VALUES 
(6, 6, CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '1 hour', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', 'desktop', 'Test City, USA'),
(6, 7, CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '30 minutes', '192.168.1.201', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...', 'mobile', 'Test Town, UK'),
(7, 8, CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '2 hours', '192.168.1.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6...', 'mobile', 'Test Village, Canada'),
(9, 10, CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes', '192.168.1.203', 'Mozilla/5.0 (Android 11; Mobile; rv:89.0)...', 'mobile', 'Test Hamlet, Australia');

INSERT INTO email_clicks (email_id, subscriber_id, clicked_at, link_url, link_text, ip_address, user_agent)
VALUES 
(6, 6, CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '1 hour' + INTERVAL '10 minutes', 'https://test.pipernewsletter.com/welcome', 'Test Get Started', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'),
(6, 7, CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '30 minutes' + INTERVAL '5 minutes', 'https://test.pipernewsletter.com/community', 'Test Join Community', '192.168.1.201', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...'),
(7, 8, CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '2 hours' + INTERVAL '15 minutes', 'https://test.pipernewsletter.com/test-article', 'Test Read Article', '192.168.1.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6...'),
(9, 10, CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes' + INTERVAL '20 minutes', 'https://test.pipernewsletter.com/test-offer', 'Test Claim Offer', '192.168.1.203', 'Mozilla/5.0 (Android 11; Mobile; rv:89.0)...');

-- Insert test API usage data
INSERT INTO api_usage_logs (user_id, endpoint, method, request_body, response_status, response_time, ip_address, user_agent, error_message)
VALUES 
(
    6,
    '/api/newsletters',
    'POST',
    '{"title": "Test API Newsletter", "content": "Test content"}',
    201,
    245,
    '192.168.1.200',
    'TestClient/1.0',
    NULL
),
(
    7,
    '/api/subscribers',
    'GET',
    NULL,
    200,
    189,
    '192.168.1.201',
    'TestClient/1.0',
    NULL
),
(
    8,
    '/api/campaigns/send',
    'POST',
    '{"campaign_id": 3, "subscriber_ids": [9]}',
    400,
    456,
    '192.168.1.202',
    'TestClient/1.0',
    'Campaign not ready for sending'
),
(
    9,
    '/api/analytics/report',
    'GET',
    NULL,
    200,
    1234,
    '192.168.1.203',
    'TestClient/1.0',
    NULL
),
(
    10,
    '/api/users/profile',
    'PUT',
    '{"first_name": "Updated Test", "last_name": "User"}',
    200,
    98,
    '192.168.1.204',
    'TestClient/1.0',
    NULL
);

-- Insert test error logs
INSERT INTO error_logs (error_level, error_message, error_code, stack_trace, context, user_id, resolved_at, resolved_by)
VALUES 
(
    'ERROR',
    'Test database connection failure',
    'TEST_DB_ERROR_001',
    'TestDatabase.connect() at line 45\nConnectionPool.getConnection() at line 89',
    '{"test_scenario": "connection_failure", "retry_count": 3, "timeout": 30}',
    6,
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    1
),
(
    'WARNING',
    'Test email validation failed',
    'TEST_EMAIL_VALIDATION_002',
    'EmailValidator.validate() at line 123\nSubscriberController.create() at line 67',
    '{"test_email": "invalid@", "validation_rules": ["format", "domain"], "suggestion": "check_format"}',
    7,
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    1
),
(
    'ERROR',
    'Test API rate limit exceeded',
    'TEST_RATE_LIMIT_003',
    'RateLimiter.checkLimit() at line 45\nTestAPIController.handleRequest() at line 78',
    '{"test_endpoint": "/api/test/limited", "user_id": 8, "current_usage": 105, "limit": 100, "window": "1m"}',
    8,
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    1
),
(
    'INFO',
    'Test cache miss - expected behavior',
    'TEST_CACHE_MISS_004',
    'TestCacheManager.get() at line 67\nTestDataService.fetchData() at line 234',
    '{"test_cache_key": "test_newsletter:123", "expected_miss": true, "fallback": "database"}',
    NULL,
    NULL,
    NULL
);

-- Insert test security events
INSERT INTO security_events (event_type, severity, description, source_ip, user_agent, user_id, affected_resource, mitigation_action, is_resolved)
VALUES 
(
    'failed_login',
    'medium',
    'Multiple failed login attempts detected',
    '192.168.1.200',
    'TestBruteForceBot/1.0',
    NULL,
    'user_account',
    'temporary_ip_block',
    true
),
(
    'suspicious_activity',
    'high',
    'Unusual API access pattern detected',
    '192.168.1.201',
    'TestSuspiciousClient/2.0',
    7,
    'api_endpoints',
    'rate_limit_enforcement',
    true
),
(
    'data_access',
    'low',
    'Large data export request',
    '192.168.1.202',
    'TestDataExporter/1.0',
    8,
    'subscriber_data',
    'additional_authentication_required',
    true
),
(
    'permission_violation',
    'medium',
    'Attempted access to admin functionality',
    '192.168.1.203',
    'TestUnauthorizedClient/1.0',
    9,
    'admin_panel',
    'access_denied_logging',
    true
);

-- Update sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('newsletters_id_seq', (SELECT MAX(id) FROM newsletters));
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));
SELECT setval('email_campaigns_id_seq', (SELECT MAX(id) FROM email_campaigns));
SELECT setval('email_queue_id_seq', (SELECT MAX(id) FROM email_queue));
SELECT setval('api_usage_logs_id_seq', (SELECT MAX(id) FROM api_usage_logs));
SELECT setval('security_events_id_seq', (SELECT MAX(id) FROM security_events));