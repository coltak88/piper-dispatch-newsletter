-- Migration: Create analytics tables
-- Created at: 2024-01-01 00:00:00
-- Description: Creates tables for comprehensive analytics tracking

-- Website analytics tracking
CREATE TABLE IF NOT EXISTS website_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    campaign_id UUID REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    screen_resolution VARCHAR(50),
    viewport_size VARCHAR(50),
    color_depth INTEGER,
    timezone VARCHAR(100),
    language VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    session_duration INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    scroll_depth DECIMAL(5,2) DEFAULT 0,
    time_on_page INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    custom_dimensions JSONB DEFAULT '{}',
    custom_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for website analytics
CREATE INDEX idx_website_analytics_session_id ON website_analytics(session_id);
CREATE INDEX idx_website_analytics_user_id ON website_analytics(user_id);
CREATE INDEX idx_website_analytics_subscription_id ON website_analytics(subscription_id);
CREATE INDEX idx_website_analytics_campaign_id ON website_analytics(campaign_id);
CREATE INDEX idx_website_analytics_newsletter_id ON website_analytics(newsletter_id);
CREATE INDEX idx_website_analytics_page_url ON website_analytics(page_url);
CREATE INDEX idx_website_analytics_created_at ON website_analytics(created_at);
CREATE INDEX idx_website_analytics_utm_campaign ON website_analytics(utm_campaign);
CREATE INDEX idx_website_analytics_country ON website_analytics(country);
CREATE INDEX idx_website_analytics_device_type ON website_analytics(device_type);

-- Create updated_at trigger for website analytics
CREATE TRIGGER update_website_analytics_updated_at 
    BEFORE UPDATE ON website_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Custom events tracking
CREATE TABLE IF NOT EXISTS custom_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100),
    event_action VARCHAR(100),
    event_label VARCHAR(255),
    event_value DECIMAL(10,2),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    campaign_id UUID REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    page_url TEXT,
    element_id VARCHAR(255),
    element_class VARCHAR(255),
    element_text TEXT,
    element_position JSONB DEFAULT '{}',
    custom_properties JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for custom events
CREATE INDEX idx_custom_events_event_name ON custom_events(event_name);
CREATE INDEX idx_custom_events_session_id ON custom_events(session_id);
CREATE INDEX idx_custom_events_user_id ON custom_events(user_id);
CREATE INDEX idx_custom_events_subscription_id ON custom_events(subscription_id);
CREATE INDEX idx_custom_events_campaign_id ON custom_events(campaign_id);
CREATE INDEX idx_custom_events_newsletter_id ON custom_events(newsletter_id);
CREATE INDEX idx_custom_events_event_category ON custom_events(event_category);
CREATE INDEX idx_custom_events_occurred_at ON custom_events(occurred_at);
CREATE INDEX idx_custom_events_created_at ON custom_events(created_at);

-- Conversion tracking
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversion_name VARCHAR(255) NOT NULL,
    conversion_category VARCHAR(100),
    conversion_value DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    campaign_id UUID REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    referrer TEXT,
    conversion_page TEXT,
    conversion_funnel JSONB DEFAULT '[]',
    attribution_model VARCHAR(50) DEFAULT 'last_click' CHECK (attribution_model IN ('first_click', 'last_click', 'linear', 'time_decay', 'position_based')),
    touchpoints JSONB DEFAULT '[]',
    custom_properties JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for conversions
CREATE INDEX idx_conversions_conversion_name ON conversions(conversion_name);
CREATE INDEX idx_conversions_session_id ON conversions(session_id);
CREATE INDEX idx_conversions_user_id ON conversions(user_id);
CREATE INDEX idx_conversions_subscription_id ON conversions(subscription_id);
CREATE INDEX idx_conversions_campaign_id ON conversions(campaign_id);
CREATE INDEX idx_conversions_newsletter_id ON conversions(newsletter_id);
CREATE INDEX idx_conversions_utm_campaign ON conversions(utm_campaign);
CREATE INDEX idx_conversions_converted_at ON conversions(converted_at);
CREATE INDEX idx_conversions_created_at ON conversions(created_at);
CREATE INDEX idx_conversions_conversion_value ON conversions(conversion_value);

-- A/B test results tracking
CREATE TABLE IF NOT EXISTS ab_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('subject', 'content', 'sender', 'send_time', 'template', 'cta')),
    campaign_id UUID REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    variant_a_name VARCHAR(100) NOT NULL,
    variant_b_name VARCHAR(100) NOT NULL,
    variant_a_recipients INTEGER DEFAULT 0,
    variant_b_recipients INTEGER DEFAULT 0,
    variant_a_sent INTEGER DEFAULT 0,
    variant_b_sent INTEGER DEFAULT 0,
    variant_a_delivered INTEGER DEFAULT 0,
    variant_b_delivered INTEGER DEFAULT 0,
    variant_a_opened INTEGER DEFAULT 0,
    variant_b_opened INTEGER DEFAULT 0,
    variant_a_clicked INTEGER DEFAULT 0,
    variant_b_clicked INTEGER DEFAULT 0,
    variant_a_converted INTEGER DEFAULT 0,
    variant_b_converted INTEGER DEFAULT 0,
    variant_a_revenue DECIMAL(10,2) DEFAULT 0,
    variant_b_revenue DECIMAL(10,2) DEFAULT 0,
    winning_variant VARCHAR(100),
    confidence_level DECIMAL(5,2) DEFAULT 0,
    statistical_significance BOOLEAN DEFAULT FALSE,
    test_duration_hours INTEGER DEFAULT 24,
    test_status VARCHAR(50) DEFAULT 'running' CHECK (test_status IN ('running', 'completed', 'cancelled')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    winner_selected_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for A/B test results
CREATE INDEX idx_ab_test_results_test_name ON ab_test_results(test_name);
CREATE INDEX idx_ab_test_results_campaign_id ON ab_test_results(campaign_id);
CREATE INDEX idx_ab_test_results_newsletter_id ON ab_test_results(newsletter_id);
CREATE INDEX idx_ab_test_results_test_type ON ab_test_results(test_type);
CREATE INDEX idx_ab_test_results_test_status ON ab_test_results(test_status);
CREATE INDEX idx_ab_test_results_started_at ON ab_test_results(started_at);
CREATE INDEX idx_ab_test_results_created_at ON ab_test_results(created_at);

-- Create updated_at trigger for A/B test results
CREATE TRIGGER update_ab_test_results_updated_at 
    BEFORE UPDATE ON ab_test_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- User behavior analytics
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    session_count INTEGER DEFAULT 0,
    total_session_duration INTEGER DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    unique_pages_viewed INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    first_visit_date DATE,
    last_visit_date DATE,
    days_since_last_visit INTEGER DEFAULT 0,
    visit_frequency VARCHAR(50) DEFAULT 'new' CHECK (visit_frequency IN ('new', 'returning', 'frequent', 'churned')),
    engagement_score DECIMAL(5,2) DEFAULT 0,
    email_engagement_score DECIMAL(5,2) DEFAULT 0,
    preferred_device_type VARCHAR(50),
    preferred_browser VARCHAR(100),
    preferred_time_of_day INTEGER,
    preferred_day_of_week INTEGER,
    geographic_data JSONB DEFAULT '{}',
    interests JSONB DEFAULT '[]',
    behavior_segments JSONB DEFAULT '[]',
    custom_metrics JSONB DEFAULT '{}',
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create indexes for user behavior analytics
CREATE INDEX idx_user_behavior_user_id ON user_behavior_analytics(user_id);
CREATE INDEX idx_user_behavior_subscription_id ON user_behavior_analytics(subscription_id);
CREATE INDEX idx_user_behavior_visit_frequency ON user_behavior_analytics(visit_frequency);
CREATE INDEX idx_user_behavior_engagement_score ON user_behavior_analytics(engagement_score DESC);
CREATE INDEX idx_user_behavior_last_visit_date ON user_behavior_analytics(last_visit_date);
CREATE INDEX idx_user_behavior_created_at ON user_behavior_analytics(created_at);

-- Create updated_at trigger for user behavior analytics
CREATE TRIGGER update_user_behavior_analytics_updated_at 
    BEFORE UPDATE ON user_behavior_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Real-time analytics aggregation
CREATE TABLE IF NOT EXISTS analytics_hourly_aggregation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_hour TIMESTAMP NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_category VARCHAR(100),
    metric_name VARCHAR(255) NOT NULL,
    dimension_1 VARCHAR(255),
    dimension_2 VARCHAR(255),
    dimension_3 VARCHAR(255),
    total_value DECIMAL(15,2) DEFAULT 0,
    unique_count INTEGER DEFAULT 0,
    avg_value DECIMAL(10,2) DEFAULT 0,
    min_value DECIMAL(10,2) DEFAULT 0,
    max_value DECIMAL(10,2) DEFAULT 0,
    percentile_25 DECIMAL(10,2) DEFAULT 0,
    percentile_50 DECIMAL(10,2) DEFAULT 0,
    percentile_75 DECIMAL(10,2) DEFAULT 0,
    percentile_95 DECIMAL(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date_hour, metric_type, metric_name, dimension_1, dimension_2, dimension_3)
);

-- Create indexes for hourly analytics aggregation
CREATE INDEX idx_analytics_hourly_date_hour ON analytics_hourly_aggregation(date_hour);
CREATE INDEX idx_analytics_hourly_metric_type ON analytics_hourly_aggregation(metric_type);
CREATE INDEX idx_analytics_hourly_metric_name ON analytics_hourly_aggregation(metric_name);
CREATE INDEX idx_analytics_hourly_dimension_1 ON analytics_hourly_aggregation(dimension_1);
CREATE INDEX idx_analytics_hourly_created_at ON analytics_hourly_aggregation(created_at);

-- Create updated_at trigger for hourly analytics aggregation
CREATE TRIGGER update_analytics_hourly_aggregation_updated_at 
    BEFORE UPDATE ON analytics_hourly_aggregation 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement_score(p_user_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_score DECIMAL(5,2) := 0;
    v_session_count INTEGER;
    v_avg_session_duration INTEGER;
    v_page_views INTEGER;
    v_conversion_count INTEGER;
    v_email_opens INTEGER;
    v_email_clicks INTEGER;
BEGIN
    -- Get user behavior data
    SELECT session_count, avg_session_duration, page_views, conversion_count
    INTO v_session_count, v_avg_session_duration, v_page_views, v_conversion_count
    FROM user_behavior_analytics
    WHERE user_id = p_user_id;

    -- Get email engagement data
    SELECT COUNT(*), COUNT(DISTINCT campaign_id)
    INTO v_email_opens, v_email_clicks
    FROM email_opens eo
    JOIN email_campaigns ec ON eo.campaign_id = ec.id
    WHERE eo.subscription_id IN (SELECT id FROM subscriptions WHERE user_id = p_user_id);

    -- Calculate engagement score (0-100)
    v_score := 
        LEAST(v_session_count * 2, 20) + -- Session frequency (max 20)
        LEAST(v_avg_session_duration / 60, 15) + -- Session duration (max 15)
        LEAST(v_page_views / 10, 15) + -- Page views (max 15)
        LEAST(v_conversion_count * 10, 20) + -- Conversions (max 20)
        LEAST(v_email_opens * 2, 15) + -- Email opens (max 15)
        LEAST(v_email_clicks * 3, 15); -- Email clicks (max 15)

    RETURN LEAST(v_score, 100);
END;
$$ language 'plpgsql';