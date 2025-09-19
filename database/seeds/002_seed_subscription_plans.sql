-- Seed data: Subscription Plans
-- Created at: 2024-01-01 00:00:00
-- Description: Seed data for subscription plans with different tiers and features

-- Insert subscription plans
INSERT INTO subscription_plans (
    plan_name, plan_key, description, plan_type, billing_cycle, price, currency, setup_fee, trial_period_days,
    max_subscribers, max_emails_per_month, max_campaigns_per_month, features, limitations, is_active, is_public, is_recommended, display_order
) VALUES 
(
    'Free Plan',
    'free_plan',
    'Perfect for individuals and small projects just getting started with email marketing',
    'free',
    'monthly',
    0.00,
    'USD',
    0.00,
    0,
    100,
    500,
    2,
    '["basic_email_templates", "subscriber_management", "basic_analytics", "email_support", "mobile_responsive_emails", "signup_forms", "list_segmentation"]',
    '{"max_subscribers": 100, "max_emails_per_month": 500, "max_campaigns_per_month": 2, "branding": "Piper Newsletter", "support_response_time": "72_hours"}',
    true,
    true,
    false,
    1
),
(
    'Basic Plan',
    'basic_monthly',
    'Great for small businesses looking to grow their email marketing efforts',
    'basic',
    'monthly',
    29.99,
    'USD',
    0.00,
    14,
    1000,
    5000,
    10,
    '["all_free_features", "advanced_email_templates", "advanced_analytics", "a_b_testing", "automation_workflows", "custom_branding", "priority_support", "social_media_integration", "basic_api_access"]',
    '{"max_subscribers": 1000, "max_emails_per_month": 5000, "max_campaigns_per_month": 10, "support_response_time": "24_hours", "api_rate_limit": "1000_per_day"}',
    true,
    true,
    false,
    2
),
(
    'Basic Plan - Yearly',
    'basic_yearly',
    'Save 20% with yearly billing - Great for small businesses',
    'basic',
    'yearly',
    287.90,
    'USD',
    0.00,
    14,
    1000,
    5000,
    10,
    '["all_free_features", "advanced_email_templates", "advanced_analytics", "a_b_testing", "automation_workflows", "custom_branding", "priority_support", "social_media_integration", "basic_api_access"]',
    '{"max_subscribers": 1000, "max_emails_per_month": 5000, "max_campaigns_per_month": 10, "support_response_time": "24_hours", "api_rate_limit": "1000_per_day"}',
    true,
    true,
    false,
    3
),
(
    'Premium Plan',
    'premium_monthly',
    'Perfect for growing businesses with advanced marketing needs',
    'premium',
    'monthly',
    79.99,
    'USD',
    0.00,
    30,
    10000,
    50000,
    50,
    '["all_basic_features", "premium_email_templates", "advanced_segmentation", "behavioral_targeting", "advanced_automation", "multivariate_testing", "advanced_reporting", "phone_support", "advanced_api_access", "webhooks", "custom_fields", "advanced_integrations", "team_collaboration", "content_optimization"]',
    '{"max_subscribers": 10000, "max_emails_per_month": 50000, "max_campaigns_per_month": 50, "support_response_time": "4_hours", "api_rate_limit": "5000_per_day", "team_members": 5}',
    true,
    true,
    true,
    4
),
(
    'Premium Plan - Yearly',
    'premium_yearly',
    'Save 25% with yearly billing - Perfect for growing businesses',
    'premium',
    'yearly',
    719.90,
    'USD',
    0.00,
    30,
    10000,
    50000,
    50,
    '["all_basic_features", "premium_email_templates", "advanced_segmentation", "behavioral_targeting", "advanced_automation", "multivariate_testing", "advanced_reporting", "phone_support", "advanced_api_access", "webhooks", "custom_fields", "advanced_integrations", "team_collaboration", "content_optimization"]',
    '{"max_subscribers": 10000, "max_emails_per_month": 50000, "max_campaigns_per_month": 50, "support_response_time": "4_hours", "api_rate_limit": "5000_per_day", "team_members": 5}',
    true,
    true,
    true,
    5
),
(
    'Enterprise Plan',
    'enterprise_monthly',
    'For large organizations with custom requirements and dedicated support',
    'enterprise',
    'monthly',
    299.99,
    'USD',
    500.00,
    60,
    100000,
    500000,
    200,
    '["all_premium_features", "enterprise_email_templates", "advanced_security", "compliance_tools", "white_label_options", "dedicated_ip", "deliverability_consulting", "advanced_analytics", "custom_integration", "sla_guarantee", "account_manager", "training_sessions", "custom_reporting", "advanced_automation", "enterprise_api_access", "priority_infrastructure", "data_export", "advanced_user_management", "sso_integration"]',
    '{"max_subscribers": 100000, "max_emails_per_month": 500000, "max_campaigns_per_month": 200, "support_response_time": "1_hour", "api_rate_limit": "unlimited", "team_members": 20, "dedicated_ip": true, "sla": "99.9%"}',
    true,
    true,
    false,
    6
),
(
    'Enterprise Plan - Yearly',
    'enterprise_yearly',
    'Save 30% with yearly billing - For large organizations',
    'enterprise',
    'yearly',
    2519.90,
    'USD',
    500.00,
    60,
    100000,
    500000,
    200,
    '["all_premium_features", "enterprise_email_templates", "advanced_security", "compliance_tools", "white_label_options", "dedicated_ip", "deliverability_consulting", "advanced_analytics", "custom_integration", "sla_guarantee", "account_manager", "training_sessions", "custom_reporting", "advanced_automation", "enterprise_api_access", "priority_infrastructure", "data_export", "advanced_user_management", "sso_integration"]',
    '{"max_subscribers": 100000, "max_emails_per_month": 500000, "max_campaigns_per_month": 200, "support_response_time": "1_hour", "api_rate_limit": "unlimited", "team_members": 20, "dedicated_ip": true, "sla": "99.9%"}',
    true,
    true,
    false,
    7
),
(
    'Trial Plan',
    'trial_plan',
    '14-day free trial with premium features',
    'trial',
    'monthly',
    0.00,
    'USD',
    0.00,
    14,
    1000,
    5000,
    10,
    '["all_premium_features", "trial_specific_templates", "basic_analytics", "email_support", "no_branding", "full_feature_access"]',
    '{"max_subscribers": 1000, "max_emails_per_month": 5000, "max_campaigns_per_month": 10, "trial_days": 14, "support_response_time": "24_hours"}',
    true,
    true,
    false,
    0
),
(
    'Custom Plan',
    'custom_plan',
    'Custom pricing and features tailored to your specific needs',
    'custom',
    'monthly',
    0.00,
    'USD',
    0.00,
    0,
    0,
    0,
    0,
    '[]',
    '{"custom_pricing": true, "custom_features": true, "consultation_required": true}',
    true,
    false,
    false,
    99
);

-- Insert add-on features
INSERT INTO subscription_plans (
    plan_name, plan_key, description, plan_type, billing_cycle, price, currency, setup_fee, trial_period_days,
    max_subscribers, max_emails_per_month, max_campaigns_per_month, features, limitations, is_active, is_public, is_recommended, display_order
) VALUES 
(
    'Additional Subscribers - 1K',
    'addon_subscribers_1k',
    'Add 1,000 additional subscribers to your plan',
    'custom',
    'monthly',
    10.00,
    'USD',
    0.00,
    0,
    1000,
    0,
    0,
    '["additional_subscribers", "no_feature_changes"]',
    '{"subscriber_addition": 1000, "requires_existing_plan": true}',
    true,
    false,
    false,
    100
),
(
    'Additional Emails - 10K',
    'addon_emails_10k',
    'Add 10,000 additional emails per month',
    'custom',
    'monthly',
    15.00,
    'USD',
    0.00,
    0,
    0,
    10000,
    0,
    '["additional_emails", "no_feature_changes"]',
    '{"email_addition": 10000, "requires_existing_plan": true}',
    true,
    false,
    false,
    101
),
(
    'Dedicated IP Address',
    'addon_dedicated_ip',
    'Get your own dedicated IP address for better deliverability',
    'custom',
    'monthly',
    59.99,
    'USD',
    0.00,
    0,
    0,
    0,
    0,
    '["dedicated_ip", "improved_deliverability", "ip_warmup_service", "reputation_monitoring"]',
    '{"dedicated_ip": true, "requires_existing_plan": true, "setup_required": true}',
    true,
    false,
    false,
    102
),
(
    'Priority Support',
    'addon_priority_support',
    'Get priority support with faster response times',
    'custom',
    'monthly',
    29.99,
    'USD',
    0.00,
    0,
    0,
    0,
    0,
    '["priority_support", "faster_response", "phone_support", "dedicated_support_agent"]',
    '{"priority_support": true, "response_time": "1_hour", "requires_existing_plan": true}',
    true,
    false,
    false,
    103
);

-- Create function to calculate plan pricing with discounts
CREATE OR REPLACE FUNCTION calculate_plan_price(
    p_plan_key VARCHAR,
    p_billing_cycle VARCHAR,
    p_currency VARCHAR DEFAULT 'USD'
)
RETURNS TABLE (
    plan_name VARCHAR,
    base_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    savings DECIMAL(10,2),
    currency VARCHAR(3)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.plan_name,
        sp.price as base_price,
        CASE 
            WHEN sp.billing_cycle = 'yearly' THEN sp.price
            WHEN EXISTS (
                SELECT 1 FROM subscription_plans sp2 
                WHERE sp2.plan_key = sp.plan_key || '_yearly' AND sp2.is_active = true
            ) THEN (
                SELECT sp2.price / 12 
                FROM subscription_plans sp2 
                WHERE sp2.plan_key = sp.plan_key || '_yearly' AND sp2.is_active = true
            )
            ELSE sp.price
        END as discounted_price,
        CASE 
            WHEN sp.billing_cycle = 'yearly' THEN 0.00
            WHEN EXISTS (
                SELECT 1 FROM subscription_plans sp2 
                WHERE sp2.plan_key = sp.plan_key || '_yearly' AND sp2.is_active = true
            ) THEN (
                SELECT ROUND(((sp.price - (sp2.price / 12)) / sp.price) * 100, 2)
                FROM subscription_plans sp2 
                WHERE sp2.plan_key = sp.plan_key || '_yearly' AND sp2.is_active = true
            )
            ELSE 0.00
        END as discount_percentage,
        CASE 
            WHEN sp.billing_cycle = 'yearly' THEN 0.00
            WHEN EXISTS (
                SELECT 1 FROM subscription_plans sp2 
                WHERE sp2.plan_key = sp.plan_key || '_yearly' AND sp2.is_active = true
            ) THEN (
                SELECT sp.price - (sp2.price / 12)
                FROM subscription_plans sp2 
                WHERE sp2.plan_key = sp.plan_key || '_yearly' AND sp2.is_active = true
            )
            ELSE 0.00
        END as savings,
        sp.currency
    FROM subscription_plans sp
    WHERE sp.plan_key = p_plan_key 
    AND sp.billing_cycle = p_billing_cycle
    AND sp.currency = p_currency
    AND sp.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to get recommended plan based on usage
CREATE OR REPLACE FUNCTION get_recommended_plan(
    p_current_subscribers INTEGER,
    p_monthly_emails INTEGER,
    p_monthly_campaigns INTEGER
)
RETURNS TABLE (
    recommended_plan VARCHAR,
    plan_key VARCHAR,
    price DECIMAL(10,2),
    billing_cycle VARCHAR,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.plan_name as recommended_plan,
        sp.plan_key,
        sp.price,
        sp.billing_cycle,
        CASE 
            WHEN p_current_subscribers <= 100 AND p_monthly_emails <= 500 THEN 'Your usage fits perfectly within the Free Plan limits'
            WHEN p_current_subscribers <= 1000 AND p_monthly_emails <= 5000 AND p_monthly_campaigns <= 10 THEN 'Your usage fits perfectly within the Basic Plan limits'
            WHEN p_current_subscribers <= 10000 AND p_monthly_emails <= 50000 AND p_monthly_campaigns <= 50 THEN 'Your usage fits perfectly within the Premium Plan limits'
            WHEN p_current_subscribers <= 100000 AND p_monthly_emails <= 500000 AND p_monthly_campaigns <= 200 THEN 'Your usage fits perfectly within the Enterprise Plan limits'
            ELSE 'Your usage exceeds our standard plans. Consider Enterprise or Custom plan.'
        END as reason
    FROM subscription_plans sp
    WHERE sp.plan_type = CASE 
        WHEN p_current_subscribers <= 100 AND p_monthly_emails <= 500 THEN 'free'
        WHEN p_current_subscribers <= 1000 AND p_monthly_emails <= 5000 AND p_monthly_campaigns <= 10 THEN 'basic'
        WHEN p_current_subscribers <= 10000 AND p_monthly_emails <= 50000 AND p_monthly_campaigns <= 50 THEN 'premium'
        WHEN p_current_subscribers <= 100000 AND p_monthly_emails <= 500000 AND p_monthly_campaigns <= 200 THEN 'enterprise'
        ELSE 'custom'
    END
    AND sp.billing_cycle = 'monthly'
    AND sp.is_active = true
    AND sp.is_public = true
    ORDER BY sp.display_order
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;