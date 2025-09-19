-- Seed data: Sample Data for Testing
-- Created at: 2024-01-01 00:00:00
-- Description: Comprehensive sample data for newsletters, subscribers, campaigns, analytics, and system testing

-- Insert sample newsletters
INSERT INTO newsletters (
    title, content, excerpt, newsletter_type, status, scheduled_at, sent_at, 
    sender_email, sender_name, reply_to_email, template_used, tags, metadata, created_by
) VALUES 
(
    'Welcome to Our Community',
    'Welcome to our exclusive community! We\'re excited to have you join us on this journey. In this newsletter, you\'ll find valuable insights, tips, and updates that will help you make the most of our services.',
    'Get started with our community and discover amazing features.',
    'welcome',
    'published',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    'welcome@pipernewsletter.com',
    'Piper Newsletter Team',
    'support@pipernewsletter.com',
    'welcome_newsletter',
    '["welcome", "community", "onboarding"]',
    '{"target_audience": "new_subscribers", "personalization": true, "tracking_enabled": true}',
    1
),
(
    'Weekly Industry Insights',
    'This week in the industry: New trends are emerging that will shape the future of email marketing. We\'ve analyzed the latest data and compiled the most important insights for you.',
    'Stay ahead with our weekly industry analysis and trends.',
    'industry_insights',
    'published',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'insights@pipernewsletter.com',
    'Industry Insights Team',
    'insights@pipernewsletter.com',
    'weekly_digest',
    '["industry", "insights", "trends", "weekly"]',
    '{"target_audience": "all_subscribers", "personalization": false, "tracking_enabled": true}',
    1
),
(
    'Special Holiday Offer',
    '🎉 Holiday Special! Get 30% off on all premium plans this season. Limited time offer - don\'t miss out on this amazing opportunity to upgrade your email marketing.',
    'Exclusive 30% holiday discount on premium plans.',
    'promotional',
    'scheduled',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    NULL,
    'offers@pipernewsletter.com',
    'Special Offers Team',
    'offers@pipernewsletter.com',
    'promotional_offer',
    '["holiday", "promotional", "discount", "seasonal"]',
    '{"target_audience": "premium_prospects", "personalization": true, "tracking_enabled": true}',
    1
),
(
    'Product Update: New Features Released',
    'We\'re excited to announce new features that will enhance your email marketing experience. Our latest update includes advanced analytics, improved automation, and better integration options.',
    'Discover our latest features and improvements.',
    'product_update',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    NULL,
    'updates@pipernewsletter.com',
    'Product Team',
    'updates@pipernewsletter.com',
    'welcome_newsletter',
    '["product", "update", "features", "announcement"]',
    '{"target_audience": "all_users", "personalization": false, "tracking_enabled": true}',
    1
),
(
    'Customer Success Story',
    'Meet Sarah, one of our successful customers who increased her email engagement by 150% using our platform. Learn how she achieved these amazing results and get inspired for your own campaigns.',
    'Learn how Sarah boosted engagement by 150%.',
    'case_study',
    'published',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP - INTERVAL '9 days',
    'stories@pipernewsletter.com',
    'Customer Success Team',
    'stories@pipernewsletter.com',
    'welcome_newsletter',
    '["success", "case_study", "customer", "inspiration"]',
    '{"target_audience": "all_subscribers", "personalization": true, "tracking_enabled": true}',
    1
);

-- Insert sample subscribers
INSERT INTO subscriptions (
    email, first_name, last_name, phone, company, job_title, industry, country, 
    subscription_status, consent_status, consent_source, consent_date, verification_token,
    verification_date, preferences, tags, custom_fields, source, campaign_source, medium
) VALUES 
(
    'john.doe@example.com',
    'John',
    'Doe',
    '+1234567890',
    'Tech Solutions Inc',
    'Marketing Manager',
    'technology',
    'United States',
    'active',
    'granted',
    'website_signup',
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    'verify_token_123',
    CURRENT_TIMESTAMP - INTERVAL '29 days',
    '{"frequency": "weekly", "categories": ["technology", "marketing"], "format": "html"}',
    '["premium", "engaged", "tech_industry"]',
    '{"company_size": "50-100", "budget_range": "1000-5000", "decision_maker": true}',
    'website',
    'welcome_campaign',
    'organic'
),
(
    'sarah.smith@retailcorp.com',
    'Sarah',
    'Smith',
    '+1987654321',
    'Retail Corp',
    'E-commerce Director',
    'retail',
    'United Kingdom',
    'active',
    'granted',
    'landing_page',
    CURRENT_TIMESTAMP - INTERVAL '45 days',
    'verify_token_456',
    CURRENT_TIMESTAMP - INTERVAL '44 days',
    '{"frequency": "daily", "categories": ["retail", "ecommerce", "sales"], "format": "html"}',
    '["high_value", "retail_sector", "decision_maker"]',
    '{"company_size": "500+", "budget_range": "5000+", "store_count": 25}',
    'landing_page',
    'retail_webinar',
    'paid_social'
),
(
    'mike.johnson@startup.io',
    'Mike',
    'Johnson',
    '+1555666777',
    'Startup.io',
    'Founder & CEO',
    'startup',
    'Canada',
    'active',
    'granted',
    'referral',
    CURRENT_TIMESTAMP - INTERVAL '20 days',
    'verify_token_789',
    CURRENT_TIMESTAMP - INTERVAL '19 days',
    '{"frequency": "weekly", "categories": ["startup", "growth", "funding"], "format": "html"}',
    '["startup", "founder", "high_potential"]',
    '{"company_size": "1-10", "funding_stage": "seed", "industry": "saas"}',
    'referral',
    'startup_network',
    'referral'
),
(
    'lisa.brown@healthcare.org',
    'Lisa',
    'Brown',
    '+1444333222',
    'Healthcare Organization',
    'Communications Manager',
    'healthcare',
    'Australia',
    'pending',
    'pending',
    'event_registration',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'verify_token_101',
    NULL,
    '{"frequency": "monthly", "categories": ["healthcare", "compliance", "communication"], "format": "text"}',
    '["healthcare", "compliance_focused", "pending_verification"]',
    '{"company_size": "100-500", "compliance_required": true, "region": "apac"}',
    'event',
    'healthcare_conference',
    'event'
),
(
    'david.wilson@finance.com',
    'David',
    'Wilson',
    '+1777888999',
    'Finance Solutions Ltd',
    'Digital Marketing Lead',
    'finance',
    'Germany',
    'active',
    'granted',
    'content_upgrade',
    CURRENT_TIMESTAMP - INTERVAL '60 days',
    'verify_token_202',
    CURRENT_TIMESTAMP - INTERVAL '59 days',
    '{"frequency": "weekly", "categories": ["finance", "fintech", "regulation"], "format": "html"}',
    '["finance", "b2b", "content_consumer"]',
    '{"company_size": "50-100", "regulatory_focus": true, "market": "emea"}',
    'content',
    'finance_guide',
    'content_marketing'
);

-- Insert sample subscription segments
INSERT INTO subscription_segments (segment_name, description, filter_criteria, segment_type, is_active, created_by)
VALUES 
(
    'High-Value Prospects',
    'Subscribers with high engagement and purchase potential',
    '{"engagement_score": {"min": 70}, "company_size": ["100-500", "500+"], "industry": ["technology", "finance", "healthcare"]}',
    'dynamic',
    true,
    1
),
(
    'New Subscribers',
    'Subscribers who joined within the last 30 days',
    '{"subscription_date": {"within_days": 30}, "status": ["active"]}',
    'dynamic',
    true,
    1
),
(
    'Inactive Users',
    'Subscribers who haven\'t engaged in the last 90 days',
    '{"last_engagement": {"older_than_days": 90}, "status": ["active"]}',
    'dynamic',
    true,
    1
),
(
    'Geographic - North America',
    'Subscribers from North American countries',
    '{"country": ["United States", "Canada", "Mexico"], "status": ["active"]}',
    'static',
    true,
    1
),
(
    'Industry - Technology',
    'Subscribers in the technology industry',
    '{"industry": ["technology", "saas", "software"], "status": ["active"]}',
    'static',
    true,
    1
);

-- Insert sample email campaigns
INSERT INTO email_campaigns (
    campaign_name, campaign_type, template_id, target_segment, scheduled_at, status,
    subject_line, from_name, from_email, reply_to_email, 
    target_audience_size, personalization_enabled, tracking_enabled, created_by
) VALUES 
(
    'Welcome Series - Week 1',
    'welcome_series',
    1,
    2,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'completed',
    'Welcome to Our Community - Let\'s Get Started!',
    'Piper Newsletter Team',
    'welcome@pipernewsletter.com',
    'support@pipernewsletter.com',
    150,
    true,
    true,
    1
),
(
    'Weekly Digest - Current Week',
    'newsletter',
    2,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'completed',
    'Weekly Industry Insights - Stay Ahead of the Curve',
    'Industry Insights Team',
    'insights@pipernewsletter.com',
    'insights@pipernewsletter.com',
    450,
    false,
    true,
    1
),
(
    'Holiday Promotion Campaign',
    'promotional',
    3,
    1,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'scheduled',
    '🎉 Holiday Special: 30% Off Premium Plans!',
    'Special Offers Team',
    'offers@pipernewsletter.com',
    'offers@pipernewsletter.com',
    75,
    true,
    true,
    1
),
(
    'Customer Success Story Distribution',
    'content_distribution',
    5,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '8 days',
    'completed',
    'Customer Success Story: 150% Engagement Increase',
    'Customer Success Team',
    'stories@pipernewsletter.com',
    'stories@pipernewsletter.com',
    300,
    true,
    true,
    1
),
(
    'Re-engagement Campaign',
    're_engagement',
    1,
    3,
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    'draft',
    'We Miss You! Come Back and See What\'s New',
    'Piper Newsletter Team',
    'reengage@pipernewsletter.com',
    'support@pipernewsletter.com',
    200,
    true,
    true,
    1
);

-- Insert sample email queue items
INSERT INTO email_queue (
    campaign_id, subscriber_id, newsletter_id, status, scheduled_at, priority,
    personalization_data, tracking_data
) VALUES 
(
    1,
    1,
    1,
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'high',
    '{"first_name": "John", "company_name": "Tech Solutions Inc"}',
    '{"tracking_id": "track_001", "campaign_source": "welcome_series"}'
),
(
    1,
    2,
    1,
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'high',
    '{"first_name": "Sarah", "company_name": "Retail Corp"}',
    '{"tracking_id": "track_002", "campaign_source": "welcome_series"}'
),
(
    2,
    3,
    2,
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'normal',
    '{"first_name": "Mike", "articles": [{"title": "AI in Email Marketing", "summary": "How AI is changing email marketing...", "url": "https://example.com/ai-email"}]}',
    '{"tracking_id": "track_003", "campaign_source": "weekly_digest"}'
),
(
    3,
    1,
    3,
    'pending',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'high',
    '{"first_name": "John", "discount_percentage": 30, "promo_code": "HOLIDAY30"}',
    '{"tracking_id": "track_004", "campaign_source": "holiday_promotion"}'
),
(
    4,
    4,
    5,
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '8 days',
    'normal',
    '{"first_name": "Lisa", "story_subject": "Sarah from Retail Corp"}',
    '{"tracking_id": "track_005", "campaign_source": "success_stories"}'
);

-- Insert sample email tracking data
INSERT INTO email_opens (email_id, subscriber_id, opened_at, ip_address, user_agent, device_type, location)
VALUES 
(1, 1, CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '2 hours', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', 'desktop', 'New York, USA'),
(1, 2, CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '1 hour', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...', 'mobile', 'London, UK'),
(2, 3, CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6...', 'mobile', 'Toronto, Canada'),
(4, 4, CURRENT_TIMESTAMP - INTERVAL '8 days' + INTERVAL '4 hours', '192.168.1.103', 'Mozilla/5.0 (Android 11; Mobile; rv:89.0)...', 'mobile', 'Sydney, Australia'),
(1, 5, CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '3 hours', '192.168.1.104', 'Mozilla/5.0 (X11; Linux x86_64)...', 'desktop', 'Berlin, Germany');

INSERT INTO email_clicks (email_id, subscriber_id, clicked_at, link_url, link_text, ip_address, user_agent)
VALUES 
(1, 1, CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '2 hours' + INTERVAL '15 minutes', 'https://pipernewsletter.com/welcome', 'Get Started', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'),
(1, 2, CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '1 hour' + INTERVAL '10 minutes', 'https://pipernewsletter.com/community', 'Join Community', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...'),
(2, 3, CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '45 minutes', 'https://pipernewsletter.com/ai-email-marketing', 'Read Full Article', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6...'),
(4, 4, CURRENT_TIMESTAMP - INTERVAL '8 days' + INTERVAL '5 hours', 'https://pipernewsletter.com/customer-stories', 'Read Success Story', '192.168.1.103', 'Mozilla/5.0 (Android 11; Mobile; rv:89.0)...'),
(1, 5, CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '3 hours' + INTERVAL '20 minutes', 'https://pipernewsletter.com/support', 'Contact Support', '192.168.1.104', 'Mozilla/5.0 (X11; Linux x86_64)...');

-- Insert sample website analytics
INSERT INTO website_analytics (
    session_id, user_id, page_url, referrer_url, user_agent, device_type, browser, 
    os, country, city, session_duration, bounce_rate, conversion_event, conversion_value
) VALUES 
(
    'sess_1234567890',
    1,
    '/newsletter/welcome-community',
    'https://google.com/search?q=email+marketing',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'desktop',
    'Chrome',
    'Windows 10',
    'United States',
    'New York',
    180,
    0.2,
    'newsletter_subscription',
    25.00
),
(
    'sess_0987654321',
    2,
    '/pricing',
    'https://facebook.com',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
    'mobile',
    'Safari',
    'iOS 14.6',
    'United Kingdom',
    'London',
    240,
    0.1,
    'plan_upgrade',
    79.99
),
(
    'sess_1122334455',
    NULL,
    '/blog/email-marketing-tips',
    'https://twitter.com',
    'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0',
    'mobile',
    'Firefox',
    'Android 11',
    'Canada',
    'Toronto',
    300,
    0.3,
    NULL,
    NULL
);

-- Insert sample custom events
INSERT INTO custom_events (event_name, user_id, session_id, properties, event_value, revenue_impact)
VALUES 
(
    'newsletter_signup',
    1,
    'sess_1234567890',
    '{"source": "blog", "campaign": "content_marketing", "form_type": "popup"}',
    1,
    25.00
),
(
    'email_opened',
    2,
    'sess_0987654321',
    '{"campaign_id": 1, "email_type": "welcome", "device": "mobile"}',
    1,
    0.50
),
(
    'link_clicked',
    3,
    'sess_1122334455',
    '{"email_id": 2, "link_type": "article", "destination": "blog_post"}',
    1,
    1.00
),
(
    'plan_upgraded',
    2,
    'sess_0987654321',
    '{"from_plan": "basic", "to_plan": "premium", "discount_applied": true}',
    1,
    79.99
),
(
    'survey_completed',
    4,
    'sess_5566778899',
    '{"survey_id": 1, "completion_time": 180, "satisfaction_score": 9}',
    1,
    5.00
);

-- Insert sample A/B test results
INSERT INTO ab_test_results (
    test_name, test_type, variant_a, variant_b, test_start_date, test_end_date,
    audience_size_a, audience_size_b, conversions_a, conversions_b,
    conversion_rate_a, conversion_rate_b, statistical_significance, winner_variant, confidence_level
) VALUES 
(
    'Subject Line Test - Welcome Email',
    'subject_line',
    'Welcome to Our Community',
    '🎉 Welcome! Your Journey Starts Here',
    CURRENT_TIMESTAMP - INTERVAL '14 days',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    500,
    500,
    125,
    175,
    0.25,
    0.35,
    0.95,
    'B',
    0.95
),
(
    'CTA Button Color Test',
    'cta_color',
    'blue_button',
    'green_button',
    CURRENT_TIMESTAMP - INTERVAL '21 days',
    CURRENT_TIMESTAMP - INTERVAL '14 days',
    750,
    750,
    150,
    195,
    0.20,
    0.26,
    0.92,
    'B',
    0.92
),
(
    'Email Timing Test',
    'send_time',
    'morning_send',
    'evening_send',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    1000,
    1000,
    200,
    250,
    0.20,
    0.25,
    0.88,
    'B',
    0.88
);

-- Insert sample user behavior analytics
INSERT INTO user_behavior_analytics (
    user_id, session_id, behavior_type, behavior_data, engagement_score, conversion_probability, churn_risk_score
) VALUES 
(
    1,
    'sess_1234567890',
    'email_engagement',
    '{"emails_opened": 15, "emails_clicked": 8, "last_engagement": "2024-01-15", "preferred_time": "morning"}',
    85,
    0.75,
    0.1
),
(
    2,
    'sess_0987654321',
    'website_navigation',
    '{"pages_visited": 25, "time_on_site": 1800, "features_used": ["analytics", "automation", "templates"], "support_tickets": 2}',
    92,
    0.85,
    0.05
),
(
    3,
    'sess_1122334455',
    'subscription_behavior',
    '{"subscription_date": "2024-01-01", "plan_changes": 1, "payment_history": "good", "usage_frequency": "daily"}',
    78,
    0.60,
    0.2
),
(
    4,
    'sess_5566778899',
    'feature_adoption',
    '{"features_tried": 5, "features_adopted": 3, "learning_progress": "intermediate", "training_completed": true}',
    65,
    0.45,
    0.3
),
(
    5,
    'sess_7788990011',
    'support_interaction',
    '{"tickets_opened": 1, "resolution_time": 24, "satisfaction_score": 9, "self_service_usage": true}',
    70,
    0.55,
    0.15
);

-- Insert sample real-time analytics
INSERT INTO real_time_analytics (
    metric_name, metric_value, metric_category, time_window, dimensions, alert_threshold, is_alert
) VALUES 
(
    'active_users',
    1250,
    'engagement',
    '1h',
    '{"country": "global", "device": "all", "source": "all"}',
    1000,
    false
),
(
    'email_send_rate',
    850,
    'performance',
    '5m',
    '{"campaign_type": "all", "priority": "all"}',
    1000,
    false
),
(
    'bounce_rate',
    0.02,
    'deliverability',
    '1h',
    '{"email_type": "all", "domain": "all"}',
    0.05,
    false
),
(
    'conversion_rate',
    0.035,
    'conversion',
    '24h',
    '{"funnel_stage": "newsletter_signup", "source": "organic"}',
    0.03,
    false
),
(
    'api_response_time',
    245,
    'performance',
    '5m',
    '{"endpoint": "all", "method": "all"}',
    500,
    false
);

-- Insert sample system configurations
INSERT INTO system_configurations (config_key, config_value, config_type, description, is_encrypted, is_active)
VALUES 
(
    'email.daily_send_limit',
    '10000',
    'integer',
    'Maximum number of emails that can be sent per day',
    false,
    true
),
(
    'analytics.retention_days',
    '365',
    'integer',
    'Number of days to retain analytics data before archiving',
    false,
    true
),
(
    'security.max_login_attempts',
    '5',
    'integer',
    'Maximum number of failed login attempts before account lockout',
    false,
    true
),
(
    'email.bounce_threshold',
    '0.05',
    'float',
    'Bounce rate threshold for triggering alerts',
    false,
    true
),
(
    'performance.cache_ttl',
    '3600',
    'integer',
    'Time-to-live for cached data in seconds',
    false,
    true
);

-- Insert sample audit log entries
INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by, change_reason, ip_address, user_agent)
VALUES 
(
    'subscriptions',
    1,
    'UPDATE',
    '{"subscription_status": "pending"}',
    '{"subscription_status": "active"}',
    1,
    'Email verification completed',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
),
(
    'newsletters',
    1,
    'INSERT',
    NULL,
    '{"title": "Welcome to Our Community", "status": "published"}',
    1,
    'New welcome newsletter created',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...'
),
(
    'email_campaigns',
    3,
    'UPDATE',
    '{"status": "draft"}',
    '{"status": "scheduled"}',
    1,
    'Holiday promotion campaign scheduled',
    '192.168.1.102',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6...'
);

-- Update sequences to ensure proper auto-increment values
SELECT setval('newsletters_id_seq', (SELECT MAX(id) FROM newsletters));
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));
SELECT setval('email_campaigns_id_seq', (SELECT MAX(id) FROM email_campaigns));
SELECT setval('email_templates_id_seq', (SELECT MAX(id) FROM email_templates));