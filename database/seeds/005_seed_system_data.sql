-- Seed data: System Configuration and Reference Data
-- Created at: 2024-01-01 00:00:00
-- Description: System configuration data, reference tables, and operational settings

-- Insert countries reference data
INSERT INTO countries (country_code, country_name, region, subregion, is_active) VALUES 
('US', 'United States', 'Americas', 'Northern America', true),
('GB', 'United Kingdom', 'Europe', 'Northern Europe', true),
('CA', 'Canada', 'Americas', 'Northern America', true),
('AU', 'Australia', 'Oceania', 'Australia and New Zealand', true),
('DE', 'Germany', 'Europe', 'Western Europe', true),
('FR', 'France', 'Europe', 'Western Europe', true),
('JP', 'Japan', 'Asia', 'Eastern Asia', true),
('BR', 'Brazil', 'Americas', 'South America', true),
('IN', 'India', 'Asia', 'Southern Asia', true),
('CN', 'China', 'Asia', 'Eastern Asia', true),
('MX', 'Mexico', 'Americas', 'Central America', true),
('ES', 'Spain', 'Europe', 'Southern Europe', true),
('IT', 'Italy', 'Europe', 'Southern Europe', true),
('NL', 'Netherlands', 'Europe', 'Western Europe', true),
('SE', 'Sweden', 'Europe', 'Northern Europe', true),
('SG', 'Singapore', 'Asia', 'South-eastern Asia', true),
('HK', 'Hong Kong', 'Asia', 'Eastern Asia', true),
('KR', 'South Korea', 'Asia', 'Eastern Asia', true),
('RU', 'Russia', 'Europe', 'Eastern Europe', true),
('ZA', 'South Africa', 'Africa', 'Southern Africa', true);

-- Insert industries reference data
INSERT INTO industries (industry_name, industry_category, description, is_active) VALUES 
('Technology', 'Technology', 'Software development, hardware, IT services, and technology solutions', true),
('Healthcare', 'Healthcare', 'Medical services, pharmaceuticals, healthcare technology', true),
('Finance', 'Financial Services', 'Banking, insurance, investment, fintech, and financial technology', true),
('Retail', 'Retail & E-commerce', 'Physical retail, online retail, e-commerce platforms', true),
('Manufacturing', 'Manufacturing', 'Industrial manufacturing, production, and supply chain', true),
('Education', 'Education', 'Educational institutions, e-learning, training services', true),
('Real Estate', 'Real Estate', 'Property development, real estate services, property management', true),
('Consulting', 'Professional Services', 'Business consulting, management consulting, professional services', true),
('Marketing', 'Marketing & Advertising', 'Digital marketing, advertising agencies, marketing technology', true),
('Media', 'Media & Entertainment', 'Publishing, broadcasting, entertainment, content creation', true),
('Non-Profit', 'Non-Profit', 'Charitable organizations, NGOs, social services', true),
('Government', 'Government', 'Government agencies, public sector, policy organizations', true),
('Legal', 'Legal Services', 'Law firms, legal technology, compliance services', true),
('Hospitality', 'Hospitality', 'Hotels, restaurants, tourism, travel services', true),
('Transportation', 'Transportation', 'Logistics, shipping, transportation services', true),
('Energy', 'Energy', 'Oil & gas, renewable energy, utilities', true),
('Telecommunications', 'Telecommunications', 'Telecom services, internet providers, communication technology', true),
('Agriculture', 'Agriculture', 'Farming, agricultural technology, food production', true),
('Construction', 'Construction', 'Building construction, infrastructure, construction services', true),
('Insurance', 'Insurance', 'Insurance services, risk management, insurance technology', true);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_encrypted, is_active)
VALUES 
(
    'app.name',
    'Piper Newsletter System',
    'string',
    'Application name displayed in UI and emails',
    false,
    true
),
(
    'app.timezone',
    'UTC',
    'string',
    'Default timezone for the application',
    false,
    true
),
(
    'app.language',
    'en',
    'string',
    'Default language code',
    false,
    true
),
(
    'email.smtp_host',
    'smtp.gmail.com',
    'string',
    'SMTP server hostname',
    false,
    true
),
(
    'email.smtp_port',
    '587',
    'integer',
    'SMTP server port',
    false,
    true
),
(
    'email.smtp_encryption',
    'tls',
    'string',
    'SMTP encryption method',
    false,
    true
),
(
    'email.max_recipients_per_batch',
    '100',
    'integer',
    'Maximum number of recipients per email batch',
    false,
    true
),
(
    'email.throttle_rate',
    '100',
    'integer',
    'Number of emails to send per minute',
    false,
    true
),
(
    'analytics.session_timeout',
    '1800',
    'integer',
    'Session timeout in seconds (30 minutes)',
    false,
    true
),
(
    'analytics.heartbeat_interval',
    '30',
    'integer',
    'Analytics heartbeat interval in seconds',
    false,
    true
),
(
    'security.session_lifetime',
    '7200',
    'integer',
    'User session lifetime in seconds (2 hours)',
    false,
    true
),
(
    'security.password_min_length',
    '8',
    'integer',
    'Minimum password length requirement',
    false,
    true
),
(
    'security.require_strong_password',
    'true',
    'boolean',
    'Require strong password with mixed case, numbers, and symbols',
    false,
    true
),
(
    'security.max_failed_login_attempts',
    '5',
    'integer',
    'Maximum failed login attempts before account lockout',
    false,
    true
),
(
    'security.account_lockout_duration',
    '900',
    'integer',
    'Account lockout duration in seconds (15 minutes)',
    false,
    true
),
(
    'security.enable_2fa',
    'false',
    'boolean',
    'Enable two-factor authentication',
    false,
    true
),
(
    'cache.default_ttl',
    '3600',
    'integer',
    'Default cache time-to-live in seconds (1 hour)',
    false,
    true
),
(
    'cache.newsletter_ttl',
    '7200',
    'integer',
    'Newsletter cache TTL in seconds (2 hours)',
    false,
    true
),
(
    'cache.analytics_ttl',
    '300',
    'integer',
    'Analytics cache TTL in seconds (5 minutes)',
    false,
    true
),
(
    'cache.user_session_ttl',
    '7200',
    'integer',
    'User session cache TTL in seconds (2 hours)',
    false,
    true
),
(
    'rate_limit.api_requests_per_minute',
    '100',
    'integer',
    'Maximum API requests per minute per user',
    false,
    true
),
(
    'rate_limit.email_send_per_hour',
    '1000',
    'integer',
    'Maximum emails that can be sent per hour per user',
    false,
    true
),
(
    'rate_limit.login_attempts_per_minute',
    '10',
    'integer',
    'Maximum login attempts per minute per IP',
    false,
    true
),
(
    'backup.retention_days',
    '30',
    'integer',
    'Number of days to retain backups',
    false,
    true
),
(
    'backup.schedule',
    '0 2 * * *',
    'string',
    'Backup schedule in cron format (daily at 2 AM)',
    false,
    true
),
(
    'log.retention_days',
    '90',
    'integer',
    'Number of days to retain log files',
    false,
    true
),
(
    'log.level',
    'info',
    'string',
    'Logging level (debug, info, warning, error)',
    false,
    true
),
(
    'monitoring.health_check_interval',
    '60',
    'integer',
    'Health check interval in seconds',
    false,
    true
),
(
    'monitoring.metrics_retention_days',
    '30',
    'integer',
    'Number of days to retain monitoring metrics',
    false,
    true
),
(
    'feature.enable_ab_testing',
    'true',
    'boolean',
    'Enable A/B testing functionality',
    false,
    true
),
(
    'feature.enable_advanced_analytics',
    'true',
    'boolean',
    'Enable advanced analytics features',
    false,
    true
),
(
    'feature.enable_automation',
    'true',
    'boolean',
    'Enable email automation features',
    false,
    true
),
(
    'feature.enable_personalization',
    'true',
    'boolean',
    'Enable email personalization features',
    false,
    true
),
(
    'feature.enable_api_access',
    'true',
    'boolean',
    'Enable API access for external integrations',
    false,
    true
);

-- Insert API rate limiting rules
INSERT INTO api_rate_limits (endpoint_pattern, method, rate_limit, time_window, description, is_active)
VALUES 
('/api/auth/*', 'POST', 10, '1m', 'Authentication endpoints rate limit', true),
('/api/users/*', 'GET', 100, '1m', 'User data retrieval rate limit', true),
('/api/users/*', 'POST', 20, '1m', 'User creation rate limit', true),
('/api/newsletters/*', 'GET', 200, '1m', 'Newsletter retrieval rate limit', true),
('/api/newsletters/*', 'POST', 50, '1m', 'Newsletter creation rate limit', true),
('/api/email/send', 'POST', 100, '1m', 'Email sending rate limit', true),
('/api/analytics/*', 'GET', 300, '1m', 'Analytics data retrieval rate limit', true),
('/api/exports/*', 'GET', 10, '1m', 'Data export rate limit', true),
('/api/imports/*', 'POST', 5, '1m', 'Data import rate limit', true),
('/api/webhooks/*', 'POST', 1000, '1m', 'Webhook endpoint rate limit', true),
('/api/public/*', 'GET', 500, '1m', 'Public API endpoints rate limit', true),
('/api/admin/*', 'ALL', 50, '1m', 'Admin panel API rate limit', true),
('/api/reports/*', 'GET', 30, '1m', 'Reports generation rate limit', true),
('/api/bulk/*', 'POST', 5, '1m', 'Bulk operations rate limit', true),
('/api/search/*', 'GET', 150, '1m', 'Search functionality rate limit', true);

-- Insert feature flags
INSERT INTO feature_flags (flag_name, description, enabled_for, rollout_percentage, is_active, created_by)
VALUES 
(
    'advanced_segmentation',
    'Enable advanced subscriber segmentation features',
    'premium_users',
    100,
    true,
    1
),
(
    'ai_subject_optimization',
    'AI-powered subject line optimization',
    'all_users',
    50,
    true,
    1
),
(
    'real_time_analytics',
    'Real-time analytics dashboard',
    'enterprise_users',
    100,
    true,
    1
),
(
    'multi_language_support',
    'Support for multiple languages in newsletters',
    'all_users',
    25,
    false,
    1
),
(
    'advanced_automation',
    'Advanced email automation workflows',
    'premium_users',
    75,
    true,
    1
),
(
    'predictive_analytics',
    'Predictive analytics for subscriber behavior',
    'enterprise_users',
    100,
    true,
    1
),
(
    'social_media_integration',
    'Integration with social media platforms',
    'all_users',
    60,
    true,
    1
),
(
    'advanced_reporting',
    'Advanced reporting and data visualization',
    'premium_users',
    100,
    true,
    1
),
(
    'api_rate_limit_increase',
    'Increased API rate limits for high-volume users',
    'enterprise_users',
    100,
    true,
    1
),
(
    'custom_branding',
    'Custom branding options for newsletters',
    'all_users',
    40,
    false,
    1
);

-- Insert email blacklist patterns
INSERT INTO email_blacklist (email_pattern, domain_pattern, reason, is_active, created_by)
VALUES 
(
    '*@tempmail.com',
    'tempmail.com',
    'Temporary email service',
    true,
    1
),
(
    '*@10minutemail.com',
    '10minutemail.com',
    'Temporary email service',
    true,
    1
),
(
    '*@mailinator.com',
    'mailinator.com',
    'Disposable email service',
    true,
    1
),
(
    'test*@*',
    NULL,
    'Test email pattern',
    true,
    1
),
(
    'noreply@*',
    NULL,
    'No-reply email addresses',
    true,
    1
),
(
    '*@spam.com',
    'spam.com',
    'Known spam domain',
    true,
    1
),
(
    '*@bounce.*',
    'bounce.*',
    'Bounce testing domains',
    true,
    1
);

-- Insert system status history
INSERT INTO system_status_history (component, status, message, details, severity, resolved_at, resolved_by)
VALUES 
(
    'email_service',
    'operational',
    'Email service is operating normally',
    '{"queue_size": 125, "processing_rate": 85, "error_rate": 0.001}',
    'info',
    NULL,
    NULL
),
(
    'database',
    'operational',
    'Database connections and queries performing within normal parameters',
    '{"connection_pool": 45, "query_time_avg": 25, "replication_lag": 0}',
    'info',
    NULL,
    NULL
),
(
    'analytics_service',
    'degraded',
    'Analytics service experiencing higher than normal response times',
    '{"response_time": 850, "error_rate": 0.02, "queue_depth": 250}',
    'warning',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    1
),
(
    'api_gateway',
    'operational',
    'API gateway functioning normally with all endpoints available',
    '{"uptime": 99.9, "request_rate": 1250, "error_rate": 0.001}',
    'info',
    NULL,
    NULL
),
(
    'backup_service',
    'maintenance',
    'Backup service undergoing scheduled maintenance',
    '{"maintenance_type": "routine", "estimated_completion": "2024-01-15 04:00:00"}',
    'info',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    1
);

-- Insert backup logs
INSERT INTO backup_logs (backup_type, backup_size, backup_location, backup_status, error_message, started_at, completed_at, created_by)
VALUES 
(
    'full',
    256000000,
    '/backups/full/2024-01-15_02-00-00.sql',
    'completed',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes',
    1
),
(
    'incremental',
    15000000,
    '/backups/incremental/2024-01-15_14-00-00.sql',
    'completed',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '10 hours',
    CURRENT_TIMESTAMP - INTERVAL '10 hours' + INTERVAL '5 minutes',
    1
),
(
    'analytics',
    85000000,
    '/backups/analytics/2024-01-15_06-00-00.sql',
    'completed',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '18 hours',
    CURRENT_TIMESTAMP - INTERVAL '18 hours' + INTERVAL '20 minutes',
    1
),
(
    'email_archive',
    512000000,
    '/backups/email/2024-01-14_22-00-00.tar.gz',
    'failed',
    'Insufficient disk space for backup operation',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '30 minutes',
    1
);

-- Insert error logs
INSERT INTO error_logs (error_level, error_message, error_code, stack_trace, context, user_id, resolved_at, resolved_by)
VALUES 
(
    'ERROR',
    'Database connection timeout',
    'DB_TIMEOUT_001',
    'ConnectionPool.getConnection() at line 145\nDatabaseManager.executeQuery() at line 89',
    '{"query": "SELECT * FROM subscriptions WHERE status = ?", "timeout": 30, "retry_count": 3}',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    1
),
(
    'WARNING',
    'Email delivery failed - temporary bounce',
    'EMAIL_BOUNCE_002',
    'EmailService.sendEmail() at line 234\nSMTPClient.send() at line 156',
    '{"recipient": "user@example.com", "bounce_type": "temporary", "retry_scheduled": true}',
    2,
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    1
),
(
    'ERROR',
    'API rate limit exceeded',
    'RATE_LIMIT_003',
    'RateLimiter.checkLimit() at line 67\nAPIController.handleRequest() at line 45',
    '{"endpoint": "/api/email/send", "user_id": 123, "current_usage": 1050, "limit": 1000}',
    123,
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    1
),
(
    'INFO',
    'Cache miss - data not found in cache',
    'CACHE_MISS_004',
    'CacheManager.get() at line 89\nDataService.fetchData() at line 234',
    '{"cache_key": "newsletter:12345", "fallback": "database", "performance_impact": "minimal"}',
    NULL,
    NULL,
    NULL
);

-- Update sequences
SELECT setval('countries_id_seq', (SELECT MAX(id) FROM countries));
SELECT setval('industries_id_seq', (SELECT MAX(id) FROM industries));
SELECT setval('system_settings_id_seq', (SELECT MAX(id) FROM system_settings));
SELECT setval('api_rate_limits_id_seq', (SELECT MAX(id) FROM api_rate_limits));
SELECT setval('feature_flags_id_seq', (SELECT MAX(id) FROM feature_flags));
SELECT setval('email_blacklist_id_seq', (SELECT MAX(id) FROM email_blacklist));
SELECT setval('system_status_history_id_seq', (SELECT MAX(id) FROM system_status_history));
SELECT setval('backup_logs_id_seq', (SELECT MAX(id) FROM backup_logs));
SELECT setval('error_logs_id_seq', (SELECT MAX(id) FROM error_logs));