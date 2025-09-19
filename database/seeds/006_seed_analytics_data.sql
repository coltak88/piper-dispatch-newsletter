-- Seed data: Analytics and Reporting Data
-- Created at: 2024-01-01 00:00:00
-- Description: Sample analytics data for testing reporting, dashboards, and data visualization

-- Insert sample conversion funnels
INSERT INTO conversion_funnels (funnel_name, funnel_steps, total_visitors, total_conversions, conversion_rate, created_by)
VALUES 
(
    'Newsletter Subscription Funnel',
    '[{"step": "landing_page", "description": "Visitor lands on landing page"}, {"step": "email_capture", "description": "Email address captured"}, {"step": "verification", "description": "Email verified"}, {"step": "subscription", "description": "Subscription confirmed"}]',
    10000,
    850,
    0.085,
    1
),
(
    'Premium Plan Upgrade Funnel',
    '[{"step": "free_trial", "description": "User starts free trial"}, {"step": "feature_usage", "description": "User tries premium features"}, {"step": "upgrade_prompt", "description": "Upgrade prompt shown"}, {"step": "payment", "description": "Payment completed"}]',
    2500,
    375,
    0.15,
    1
),
(
    'Email Engagement Funnel',
    '[{"step": "email_sent", "description": "Email successfully sent"}, {"step": "email_delivered", "description": "Email delivered to inbox"}, {"step": "email_opened", "description": "Email opened by recipient"}, {"step": "link_clicked", "description": "Link clicked in email"}, {"step": "conversion", "description": "Desired action completed"}]',
    50000,
    7500,
    0.15,
    1
),
(
    'Content Download Funnel',
    '[{"step": "content_view", "description": "User views content page"}, {"step": "form_fill", "description": "User fills download form"}, {"step": "email_verification", "description": "Email address verified"}, {"step": "download", "description": "Content downloaded"}]',
    8000,
    1200,
    0.15,
    1
),
(
    'Event Registration Funnel',
    '[{"step": "event_page", "description": "User visits event page"}, {"step": "registration_form", "description": "Registration form accessed"}, {"step": "details_filled", "description": "Registration details completed"}, {"step": "registration_confirmed", "description": "Registration confirmed"}]',
    3000,
    690,
    0.23,
    1
);

-- Insert sample cohort analysis data
INSERT INTO cohort_analysis (cohort_name, cohort_criteria, cohort_period, cohort_size, retention_rates, churn_rates, created_by)
VALUES 
(
    'January 2024 Signups',
    '{"signup_month": "2024-01", "source": "organic"}',
    'monthly',
    1200,
    '[{"period": 0, "retained": 100}, {"period": 1, "retained": 85}, {"period": 2, "retained": 72}, {"period": 3, "retained": 68}, {"period": 6, "retained": 55}, {"period": 12, "retained": 45}]',
    '[{"period": 0, "churn": 0}, {"period": 1, "churn": 15}, {"period": 2, "churn": 13}, {"period": 3, "churn": 4}, {"period": 6, "churn": 13}, {"period": 12, "churn": 10}]',
    1
),
(
    'Email Active Users Q1 2024',
    '{"last_email_engagement": "2024-01-01", "engagement_level": "active"}',
    'weekly',
    8500,
    '[{"period": 0, "retained": 100}, {"period": 1, "retained": 92}, {"period": 2, "retained": 88}, {"period": 4, "retained": 82}, {"period": 8, "retained": 75}, {"period": 12, "retained": 68}]',
    '[{"period": 0, "churn": 0}, {"period": 1, "churn": 8}, {"period": 2, "churn": 4}, {"period": 4, "churn": 6}, {"period": 8, "churn": 7}, {"period": 12, "churn": 7}]',
    1
),
(
    'Premium Trial Users',
    '{"trial_start": "2024-01", "plan_type": "premium_trial"}',
    'daily',
    450,
    '[{"period": 0, "retained": 100}, {"period": 1, "retained": 95}, {"period": 3, "retained": 88}, {"period": 7, "retained": 75}, {"period": 14, "retained": 62}, {"period": 30, "retained": 45}]',
    '[{"period": 0, "churn": 0}, {"period": 1, "churn": 5}, {"period": 3, "churn": 7}, {"period": 7, "churn": 13}, {"period": 14, "churn": 13}, {"period": 30, "churn": 17}]',
    1
);

-- Insert sample predictive analytics
INSERT INTO predictive_analytics (model_name, model_type, target_variable, accuracy_score, feature_importance, predictions, training_data_size, created_by)
VALUES 
(
    'Churn Prediction Model',
    'classification',
    'user_churn',
    0.87,
    '{"email_engagement": 0.35, "last_login_days": 0.25, "subscription_age": 0.20, "support_tickets": 0.15, "feature_usage": 0.05}',
    '{"high_risk": 450, "medium_risk": 1200, "low_risk": 8350}',
    25000,
    1
),
(
    'Email Open Rate Prediction',
    'regression',
    'open_rate',
    0.82,
    '{"subject_length": 0.30, "send_time": 0.25, "personalization": 0.20, "sender_reputation": 0.15, "list_quality": 0.10}',
    '{"predicted_open_rate": 0.28, "confidence_interval": [0.24, 0.32]}',
    100000,
    1
),
(
    'Conversion Probability Model',
    'classification',
    'conversion',
    0.91,
    '{"email_engagement": 0.40, "website_behavior": 0.30, "demographics": 0.15, "subscription_tier": 0.10, "support_interaction": 0.05}',
    '{"high_probability": 850, "medium_probability": 2100, "low_probability": 7050}',
    15000,
    1
),
(
    'Customer Lifetime Value Prediction',
    'regression',
    'clv',
    0.85,
    '{"subscription_tier": 0.35, "engagement_score": 0.25, "company_size": 0.20, "industry": 0.15, "geography": 0.05}',
    '{"predicted_clv": 1250.50, "confidence_interval": [980.25, 1520.75]}',
    8000,
    1
);

-- Insert sample engagement scoring
INSERT INTO engagement_scores (subscriber_id, engagement_score, score_components, score_date, score_category, trend_direction)
VALUES 
(
    1,
    85.5,
    '{"email_opens": 25, "email_clicks": 12, "website_visits": 8, "content_downloads": 3, "event_attendance": 1}',
    CURRENT_DATE - INTERVAL '1 day',
    'highly_engaged',
    'increasing'
),
(
    2,
    92.3,
    '{"email_opens": 30, "email_clicks": 18, "website_visits": 15, "content_downloads": 5, "event_attendance": 2}',
    CURRENT_DATE - INTERVAL '1 day',
    'highly_engaged',
    'stable'
),
(
    3,
    67.8,
    '{"email_opens": 18, "email_clicks": 8, "website_visits": 5, "content_downloads": 1, "event_attendance": 0}',
    CURRENT_DATE - INTERVAL '1 day',
    'moderately_engaged',
    'decreasing'
),
(
    4,
    45.2,
    '{"email_opens": 12, "email_clicks": 3, "website_visits": 2, "content_downloads": 0, "event_attendance": 0}',
    CURRENT_DATE - INTERVAL '1 day',
    'low_engagement',
    'decreasing'
),
(
    5,
    78.9,
    '{"email_opens": 22, "email_clicks": 10, "website_visits": 7, "content_downloads": 2, "event_attendance": 1}',
    CURRENT_DATE - INTERVAL '1 day',
    'moderately_engaged',
    'increasing'
);

-- Insert sample heatmap data
INSERT INTO heatmap_data (page_url, element_selector, element_type, interaction_count, interaction_type, position_x, position_y, device_type, browser, created_by)
VALUES 
(
    '/newsletter/welcome',
    '#subscribe-button',
    'button',
    1250,
    'click',
    450,
    680,
    'desktop',
    'Chrome',
    1
),
(
    '/newsletter/welcome',
    '.email-input-field',
    'input',
    2100,
    'focus',
    450,
    520,
    'desktop',
    'Chrome',
    1
),
(
    '/pricing',
    '.premium-plan-card',
    'div',
    850,
    'hover',
    300,
    400,
    'desktop',
    'Firefox',
    1
),
(
    '/blog/email-marketing-tips',
    '.download-guide-button',
    'button',
    650,
    'click',
    200,
    1200,
    'mobile',
    'Safari',
    1
),
(
    '/dashboard',
    '.analytics-widget',
    'div',
    3200,
    'hover',
    150,
    250,
    'desktop',
    'Chrome',
    1
);

-- Insert sample performance metrics
INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, metric_category, threshold_value, alert_status, created_by)
VALUES 
(
    'email_send_time_avg',
    2.3,
    'seconds',
    'email_performance',
    5.0,
    'normal',
    1
),
(
    'database_query_time_avg',
    45.7,
    'milliseconds',
    'database_performance',
    100.0,
    'normal',
    1
),
(
    'api_response_time_p95',
    850.2,
    'milliseconds',
    'api_performance',
    1000.0,
    'normal',
    1
),
(
    'page_load_time_avg',
    1.8,
    'seconds',
    'web_performance',
    3.0,
    'normal',
    1
),
(
    'email_delivery_rate',
    98.5,
    'percentage',
    'email_performance',
    95.0,
    'normal',
    1
),
(
    'bounce_rate',
    1.2,
    'percentage',
    'email_performance',
    5.0,
    'normal',
    1
),
(
    'spam_complaint_rate',
    0.05,
    'percentage',
    'email_performance',
    0.1,
    'normal',
    1
),
(
    'unsubscribe_rate',
    0.8,
    'percentage',
    'email_performance',
    2.0,
    'normal',
    1
);

-- Insert sample geographic analytics
INSERT INTO geographic_analytics (country, region, city, metric_type, metric_value, subscriber_count, engagement_rate, conversion_rate, created_by)
VALUES 
(
    'United States',
    'North America',
    'New York',
    'subscriber_acquisition',
    2850,
    2850,
    0.72,
    0.12,
    1
),
(
    'United Kingdom',
    'Europe',
    'London',
    'subscriber_acquisition',
    1650,
    1650,
    0.68,
    0.10,
    1
),
(
    'Canada',
    'North America',
    'Toronto',
    'subscriber_acquisition',
    980,
    980,
    0.75,
    0.14,
    1
),
(
    'Australia',
    'Oceania',
    'Sydney',
    'subscriber_acquisition',
    750,
    750,
    0.70,
    0.11,
    1
),
(
    'Germany',
    'Europe',
    'Berlin',
    'subscriber_acquisition',
    620,
    620,
    0.65,
    0.09,
    1
),
(
    'France',
    'Europe',
    'Paris',
    'subscriber_acquisition',
    480,
    480,
    0.69,
    0.08,
    1
),
(
    'Japan',
    'Asia',
    'Tokyo',
    'subscriber_acquisition',
    420,
    420,
    0.73,
    0.13,
    1
),
(
    'Brazil',
    'South America',
    'São Paulo',
    'subscriber_acquisition',
    380,
    380,
    0.66,
    0.07,
    1
);

-- Insert sample device analytics
INSERT INTO device_analytics (device_type, browser, os, metric_type, metric_value, user_count, engagement_score, conversion_rate, created_by)
VALUES 
(
    'desktop',
    'Chrome',
    'Windows 10',
    'email_engagement',
    85.5,
    5200,
    8.2,
    0.15,
    1
),
(
    'mobile',
    'Safari',
    'iOS 14.6',
    'email_engagement',
    78.3,
    3800,
    7.8,
    0.12,
    1
),
(
    'tablet',
    'Chrome',
    'Android 11',
    'email_engagement',
    72.1,
    1200,
    7.5,
    0.10,
    1
),
(
    'desktop',
    'Firefox',
    'macOS 11.4',
    'website_engagement',
    88.7,
    2100,
    8.5,
    0.18,
    1
),
(
    'mobile',
    'Chrome Mobile',
    'Android 10',
    'website_engagement',
    75.2,
    4500,
    7.3,
    0.11,
    1
);

-- Insert sample revenue analytics
INSERT INTO revenue_analytics (metric_date, revenue_type, revenue_amount, subscriber_count, arpu, churn_rate, created_by)
VALUES 
(
    CURRENT_DATE - INTERVAL '30 days',
    'subscription',
    125000.00,
    8500,
    14.71,
    0.05,
    1
),
(
    CURRENT_DATE - INTERVAL '30 days',
    'add_on',
    25000.00,
    2100,
    11.90,
    0.02,
    1
),
(
    CURRENT_DATE - INTERVAL '30 days',
    'consulting',
    15000.00,
    45,
    333.33,
    0.00,
    1
),
(
    CURRENT_DATE - INTERVAL '7 days',
    'subscription',
    28500.00,
    8750,
    3.26,
    0.04,
    1
),
(
    CURRENT_DATE - INTERVAL '7 days',
    'add_on',
    5800.00,
    2200,
    2.64,
    0.01,
    1
),
(
    CURRENT_DATE - INTERVAL '1 day',
    'subscription',
    4200.00,
    8800,
    0.48,
    0.03,
    1
);

-- Update sequences
SELECT setval('conversion_funnels_id_seq', (SELECT MAX(id) FROM conversion_funnels));
SELECT setval('cohort_analysis_id_seq', (SELECT MAX(id) FROM cohort_analysis));
SELECT setval('predictive_analytics_id_seq', (SELECT MAX(id) FROM predictive_analytics));
SELECT setval('engagement_scores_id_seq', (SELECT MAX(id) FROM engagement_scores));
SELECT setval('heatmap_data_id_seq', (SELECT MAX(id) FROM heatmap_data));
SELECT setval('performance_metrics_id_seq', (SELECT MAX(id) FROM performance_metrics));
SELECT setval('geographic_analytics_id_seq', (SELECT MAX(id) FROM geographic_analytics));
SELECT setval('device_analytics_id_seq', (SELECT MAX(id) FROM device_analytics));
SELECT setval('revenue_analytics_id_seq', (SELECT MAX(id) FROM revenue_analytics));