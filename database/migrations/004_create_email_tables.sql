-- Migration: Create email-related tables
-- Created at: 2024-01-01 00:00:00
-- Description: Creates tables for email campaigns, templates, and tracking

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subject VARCHAR(500),
    html_content TEXT,
    text_content TEXT,
    template_variables JSONB DEFAULT '[]',
    preview_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for email templates
CREATE INDEX idx_email_templates_slug ON email_templates(slug);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);
CREATE INDEX idx_email_templates_is_default ON email_templates(is_default);
CREATE INDEX idx_email_templates_created_by ON email_templates(created_by);
CREATE INDEX idx_email_templates_deleted_at ON email_templates(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for email templates
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID REFERENCES newsletters(id),
    template_id UUID REFERENCES email_templates(id),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    html_content TEXT,
    text_content TEXT,
    recipient_count INTEGER DEFAULT 0,
    segment_ids UUID[],
    exclude_segment_ids UUID[],
    recipient_filters JSONB DEFAULT '{}',
    send_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    tracking_enabled BOOLEAN DEFAULT TRUE,
    open_tracking_enabled BOOLEAN DEFAULT TRUE,
    click_tracking_enabled BOOLEAN DEFAULT TRUE,
    unsubscribe_tracking_enabled BOOLEAN DEFAULT TRUE,
    custom_tracking_domain VARCHAR(255),
    ab_test_enabled BOOLEAN DEFAULT FALSE,
    ab_test_type VARCHAR(50) CHECK (ab_test_type IN ('subject', 'content', 'sender', 'send_time')),
    ab_test_percentage INTEGER DEFAULT 10 CHECK (ab_test_percentage > 0 AND ab_test_percentage <= 50),
    winning_metric VARCHAR(50) DEFAULT 'open_rate' CHECK (winning_metric IN ('open_rate', 'click_rate', 'conversion_rate')),
    winner_selection_delay_hours INTEGER DEFAULT 24,
    send_winner_delay_hours INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for email campaigns
CREATE INDEX idx_email_campaigns_newsletter_id ON email_campaigns(newsletter_id);
CREATE INDEX idx_email_campaigns_template_id ON email_campaigns(template_id);
CREATE INDEX idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_send_at ON email_campaigns(send_at);
CREATE INDEX idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at);
CREATE INDEX idx_email_campaigns_priority ON email_campaigns(priority);
CREATE INDEX idx_email_campaigns_ab_test_enabled ON email_campaigns(ab_test_enabled);
CREATE INDEX idx_email_campaigns_created_at ON email_campaigns(created_at);
CREATE INDEX idx_email_campaigns_deleted_at ON email_campaigns(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for email campaigns
CREATE TRIGGER update_email_campaigns_updated_at 
    BEFORE UPDATE ON email_campaigns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Email queue table for managing email sending
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    email_address VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    html_content TEXT,
    text_content TEXT,
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    message_id VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'normal',
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    bounced_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'delivered', 'bounced', 'failed', 'cancelled')),
    bounce_reason VARCHAR(255),
    bounce_type VARCHAR(50),
    smtp_response TEXT,
    error_message TEXT,
    tracking_pixel_id UUID,
    unsubscribe_token VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for email queue
CREATE INDEX idx_email_queue_campaign_id ON email_queue(campaign_id);
CREATE INDEX idx_email_queue_subscription_id ON email_queue(subscription_id);
CREATE INDEX idx_email_queue_email_address ON email_queue(email_address);
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled_at ON email_queue(scheduled_at);
CREATE INDEX idx_email_queue_sent_at ON email_queue(sent_at);
CREATE INDEX idx_email_queue_priority ON email_queue(priority);
CREATE INDEX idx_email_queue_message_id ON email_queue(message_id);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at);

-- Create updated_at trigger for email queue
CREATE TRIGGER update_email_queue_updated_at 
    BEFORE UPDATE ON email_queue 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Email opens tracking table
CREATE TABLE IF NOT EXISTS email_opens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    email_queue_id UUID REFERENCES email_queue(id),
    email_address VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_count INTEGER DEFAULT 1,
    first_opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referrer TEXT,
    tracking_pixel_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, subscription_id, ip_address)
);

-- Create indexes for email opens
CREATE INDEX idx_email_opens_campaign_id ON email_opens(campaign_id);
CREATE INDEX idx_email_opens_newsletter_id ON email_opens(newsletter_id);
CREATE INDEX idx_email_opens_subscription_id ON email_opens(subscription_id);
CREATE INDEX idx_email_opens_email_address ON email_opens(email_address);
CREATE INDEX idx_email_opens_opened_at ON email_opens(opened_at);
CREATE INDEX idx_email_opens_ip_address ON email_opens(ip_address);
CREATE INDEX idx_email_opens_country ON email_opens(country);
CREATE INDEX idx_email_opens_device_type ON email_opens(device_type);
CREATE INDEX idx_email_opens_created_at ON email_opens(created_at);

-- Email clicks tracking table
CREATE TABLE IF NOT EXISTS email_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    email_queue_id UUID REFERENCES email_queue(id),
    email_address VARCHAR(255) NOT NULL,
    link_url TEXT NOT NULL,
    link_text TEXT,
    link_position VARCHAR(100),
    link_category VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    click_count INTEGER DEFAULT 1,
    first_clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, subscription_id, link_url, ip_address)
);

-- Create indexes for email clicks
CREATE INDEX idx_email_clicks_campaign_id ON email_clicks(campaign_id);
CREATE INDEX idx_email_clicks_newsletter_id ON email_clicks(newsletter_id);
CREATE INDEX idx_email_clicks_subscription_id ON email_clicks(subscription_id);
CREATE INDEX idx_email_clicks_email_address ON email_clicks(email_address);
CREATE INDEX idx_email_clicks_link_url ON email_clicks(link_url);
CREATE INDEX idx_email_clicks_clicked_at ON email_clicks(clicked_at);
CREATE INDEX idx_email_clicks_ip_address ON email_clicks(ip_address);
CREATE INDEX idx_email_clicks_country ON email_clicks(country);
CREATE INDEX idx_email_clicks_utm_campaign ON email_clicks(utm_campaign);
CREATE INDEX idx_email_clicks_created_at ON email_clicks(created_at);

-- Unsubscribes tracking table
CREATE TABLE IF NOT EXISTS unsubscribes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    email_queue_id UUID REFERENCES email_queue(id),
    email_address VARCHAR(255) NOT NULL,
    unsubscribe_reason TEXT,
    unsubscribe_category VARCHAR(100),
    unsubscribe_feedback TEXT,
    ip_address INET,
    user_agent TEXT,
    unsubscribe_type VARCHAR(50) DEFAULT 'one_click' CHECK (unsubscribe_type IN ('one_click', 'preferences', 'global')),
    unsubscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscription_id, campaign_id)
);

-- Create indexes for unsubscribes
CREATE INDEX idx_unsubscribes_campaign_id ON unsubscribes(campaign_id);
CREATE INDEX idx_unsubscribes_newsletter_id ON unsubscribes(newsletter_id);
CREATE INDEX idx_unsubscribes_subscription_id ON unsubscribes(subscription_id);
CREATE INDEX idx_unsubscribes_email_address ON unsubscribes(email_address);
CREATE INDEX idx_unsubscribes_unsubscribed_at ON unsubscribes(unsubscribed_at);
CREATE INDEX idx_unsubscribes_unsubscribe_type ON unsubscribes(unsubscribe_type);
CREATE INDEX idx_unsubscribes_created_at ON unsubscribes(created_at);

-- Spam complaints tracking table
CREATE TABLE IF NOT EXISTS spam_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    email_queue_id UUID REFERENCES email_queue(id),
    email_address VARCHAR(255) NOT NULL,
    complaint_type VARCHAR(100),
    feedback_loop_provider VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    complained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscription_id, campaign_id)
);

-- Create indexes for spam complaints
CREATE INDEX idx_spam_complaints_campaign_id ON spam_complaints(campaign_id);
CREATE INDEX idx_spam_complaints_newsletter_id ON spam_complaints(newsletter_id);
CREATE INDEX idx_spam_complaints_subscription_id ON spam_complaints(subscription_id);
CREATE INDEX idx_spam_complaints_email_address ON spam_complaints(email_address);
CREATE INDEX idx_spam_complaints_complained_at ON spam_complaints(complained_at);
CREATE INDEX idx_spam_complaints_feedback_loop_provider ON spam_complaints(feedback_loop_provider);
CREATE INDEX idx_spam_complaints_created_at ON spam_complaints(created_at);

-- Email bounces tracking table
CREATE TABLE IF NOT EXISTS email_bounces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id),
    newsletter_id UUID REFERENCES newsletters(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    email_queue_id UUID REFERENCES email_queue(id),
    email_address VARCHAR(255) NOT NULL,
    bounce_type VARCHAR(50) CHECK (bounce_type IN ('hard', 'soft', 'general')),
    bounce_sub_type VARCHAR(100),
    bounce_reason TEXT,
    smtp_response TEXT,
    remote_mta_ip INET,
    reporting_mta TEXT,
    bounced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email_queue_id)
);

-- Create indexes for email bounces
CREATE INDEX idx_email_bounces_campaign_id ON email_bounces(campaign_id);
CREATE INDEX idx_email_bounces_newsletter_id ON email_bounces(newsletter_id);
CREATE INDEX idx_email_bounces_subscription_id ON email_bounces(subscription_id);
CREATE INDEX idx_email_bounces_email_address ON email_bounces(email_address);
CREATE INDEX idx_email_bounces_bounce_type ON email_bounces(bounce_type);
CREATE INDEX idx_email_bounces_bounced_at ON email_bounces(bounced_at);
CREATE INDEX idx_email_bounces_created_at ON email_bounces(created_at);

-- Email campaign statistics table
CREATE TABLE IF NOT EXISTS email_campaign_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL UNIQUE REFERENCES email_campaigns(id),
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_complaints INTEGER DEFAULT 0,
    unique_opens INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    repeat_opens INTEGER DEFAULT 0,
    repeat_clicks INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    unsubscribe_rate DECIMAL(5,2) DEFAULT 0,
    spam_complaint_rate DECIMAL(5,2) DEFAULT 0,
    click_to_open_rate DECIMAL(5,2) DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for campaign statistics
CREATE INDEX idx_campaign_statistics_campaign_id ON email_campaign_statistics(campaign_id);
CREATE INDEX idx_campaign_statistics_total_sent ON email_campaign_statistics(total_sent);
CREATE INDEX idx_campaign_statistics_open_rate ON email_campaign_statistics(open_rate);
CREATE INDEX idx_campaign_statistics_click_rate ON email_campaign_statistics(click_rate);
CREATE INDEX idx_campaign_statistics_created_at ON email_campaign_statistics(created_at);

-- Create updated_at trigger for campaign statistics
CREATE TRIGGER update_email_campaign_statistics_updated_at 
    BEFORE UPDATE ON email_campaign_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate campaign statistics
CREATE OR REPLACE FUNCTION calculate_campaign_stats(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO email_campaign_statistics (campaign_id)
    VALUES (p_campaign_id)
    ON CONFLICT (campaign_id) DO UPDATE SET
        total_recipients = (SELECT COUNT(*) FROM email_queue WHERE campaign_id = p_campaign_id),
        total_sent = (SELECT COUNT(*) FROM email_queue WHERE campaign_id = p_campaign_id AND status = 'sent'),
        total_delivered = (SELECT COUNT(*) FROM email_queue WHERE campaign_id = p_campaign_id AND status = 'delivered'),
        total_bounced = (SELECT COUNT(*) FROM email_bounces WHERE campaign_id = p_campaign_id),
        total_opened = (SELECT COUNT(*) FROM email_opens WHERE campaign_id = p_campaign_id),
        total_clicked = (SELECT COUNT(*) FROM email_clicks WHERE campaign_id = p_campaign_id),
        total_unsubscribed = (SELECT COUNT(*) FROM unsubscribes WHERE campaign_id = p_campaign_id),
        total_complaints = (SELECT COUNT(*) FROM spam_complaints WHERE campaign_id = p_campaign_id),
        unique_opens = (SELECT COUNT(DISTINCT subscription_id) FROM email_opens WHERE campaign_id = p_campaign_id),
        unique_clicks = (SELECT COUNT(DISTINCT subscription_id) FROM email_clicks WHERE campaign_id = p_campaign_id),
        repeat_opens = total_opened - unique_opens,
        repeat_clicks = total_clicked - unique_clicks,
        open_rate = CASE WHEN total_delivered > 0 THEN (unique_opens::DECIMAL / total_delivered::DECIMAL) * 100 ELSE 0 END,
        click_rate = CASE WHEN total_delivered > 0 THEN (unique_clicks::DECIMAL / total_delivered::DECIMAL) * 100 ELSE 0 END,
        bounce_rate = CASE WHEN total_sent > 0 THEN (total_bounced::DECIMAL / total_sent::DECIMAL) * 100 ELSE 0 END,
        unsubscribe_rate = CASE WHEN total_delivered > 0 THEN (total_unsubscribed::DECIMAL / total_delivered::DECIMAL) * 100 ELSE 0 END,
        spam_complaint_rate = CASE WHEN total_delivered > 0 THEN (total_complaints::DECIMAL / total_delivered::DECIMAL) * 100 ELSE 0 END,
        click_to_open_rate = CASE WHEN unique_opens > 0 THEN (unique_clicks::DECIMAL / unique_opens::DECIMAL) * 100 ELSE 0 END,
        last_calculated = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';