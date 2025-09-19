-- Migration: Create newsletters table
-- Created at: 2024-01-01 00:00:00
-- Description: Creates the newsletters table for storing newsletter content and metadata

CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    template VARCHAR(100) DEFAULT 'modern',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'archived')),
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    subject_line VARCHAR(255),
    preview_text VARCHAR(255),
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    tags TEXT[],
    category VARCHAR(100),
    featured_image_url VARCHAR(500),
    click_tracking_enabled BOOLEAN DEFAULT TRUE,
    open_tracking_enabled BOOLEAN DEFAULT TRUE,
    unsubscribe_footer_enabled BOOLEAN DEFAULT TRUE,
    analytics_enabled BOOLEAN DEFAULT TRUE,
    custom_css TEXT,
    custom_js TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_newsletters_user_id ON newsletters(user_id);
CREATE INDEX idx_newsletters_slug ON newsletters(slug);
CREATE INDEX idx_newsletters_status ON newsletters(status);
CREATE INDEX idx_newsletters_scheduled_for ON newsletters(scheduled_for);
CREATE INDEX idx_newsletters_sent_at ON newsletters(sent_at);
CREATE INDEX idx_newsletters_category ON newsletters(category);
CREATE INDEX idx_newsletters_created_at ON newsletters(created_at);
CREATE INDEX idx_newsletters_tags ON newsletters USING GIN(tags);
CREATE INDEX idx_newsletters_deleted_at ON newsletters(deleted_at) WHERE deleted_at IS NULL;

-- Create full text search index
CREATE INDEX idx_newsletters_search ON newsletters USING GIN(to_tsvector('english', title || ' ' || content || ' ' || COALESCE(excerpt, '')));

-- Create updated_at trigger
CREATE TRIGGER update_newsletters_updated_at 
    BEFORE UPDATE ON newsletters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create newsletter statistics table
CREATE TABLE IF NOT EXISTS newsletter_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id),
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_complaints INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    unsubscribe_rate DECIMAL(5,2) DEFAULT 0,
    spam_complaint_rate DECIMAL(5,2) DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(newsletter_id)
);

-- Create indexes for newsletter statistics
CREATE INDEX idx_newsletter_statistics_newsletter_id ON newsletter_statistics(newsletter_id);
CREATE INDEX idx_newsletter_statistics_sent_at ON newsletter_statistics(total_sent);
CREATE INDEX idx_newsletter_statistics_open_rate ON newsletter_statistics(open_rate);
CREATE INDEX idx_newsletter_statistics_click_rate ON newsletter_statistics(click_rate);

-- Create newsletter content versions table for A/B testing
CREATE TABLE IF NOT EXISTS newsletter_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id),
    version_name VARCHAR(100) NOT NULL,
    version_percentage INTEGER DEFAULT 50 CHECK (version_percentage > 0 AND version_percentage <= 100),
    title VARCHAR(255),
    content TEXT,
    subject_line VARCHAR(255),
    preview_text VARCHAR(255),
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    template VARCHAR(100),
    custom_css TEXT,
    custom_js TEXT,
    is_winner BOOLEAN DEFAULT FALSE,
    winner_reason TEXT,
    statistics JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(newsletter_id, version_name)
);

-- Create indexes for newsletter versions
CREATE INDEX idx_newsletter_versions_newsletter_id ON newsletter_versions(newsletter_id);
CREATE INDEX idx_newsletter_versions_version_name ON newsletter_versions(version_name);
CREATE INDEX idx_newsletter_versions_is_winner ON newsletter_versions(is_winner);

-- Create updated_at trigger for newsletter versions
CREATE TRIGGER update_newsletter_versions_updated_at 
    BEFORE UPDATE ON newsletter_versions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create newsletter audit log table
CREATE TABLE IF NOT EXISTS newsletter_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit log
CREATE INDEX idx_newsletter_audit_log_newsletter_id ON newsletter_audit_log(newsletter_id);
CREATE INDEX idx_newsletter_audit_log_user_id ON newsletter_audit_log(user_id);
CREATE INDEX idx_newsletter_audit_log_action ON newsletter_audit_log(action);
CREATE INDEX idx_newsletter_audit_log_created_at ON newsletter_audit_log(created_at);

-- Create audit log trigger
CREATE OR REPLACE FUNCTION log_newsletter_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO newsletter_audit_log (newsletter_id, user_id, action, old_values, new_values, created_at)
        VALUES (NEW.id, NEW.user_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO newsletter_audit_log (newsletter_id, user_id, action, new_values, created_at)
        VALUES (NEW.id, NEW.user_id, 'INSERT', to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER newsletter_audit_trigger
    AFTER INSERT OR UPDATE ON newsletters
    FOR EACH ROW
    EXECUTE FUNCTION log_newsletter_changes();

-- Create function to calculate newsletter statistics
CREATE OR REPLACE FUNCTION calculate_newsletter_stats(p_newsletter_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE newsletter_statistics 
    SET 
        total_sent = (SELECT COUNT(*) FROM email_campaigns WHERE newsletter_id = p_newsletter_id AND status = 'sent'),
        total_delivered = (SELECT COUNT(*) FROM email_campaigns WHERE newsletter_id = p_newsletter_id AND status = 'delivered'),
        total_bounced = (SELECT COUNT(*) FROM email_campaigns WHERE newsletter_id = p_newsletter_id AND status = 'bounced'),
        total_opened = (SELECT COUNT(*) FROM email_opens WHERE newsletter_id = p_newsletter_id),
        total_clicked = (SELECT COUNT(*) FROM email_clicks WHERE newsletter_id = p_newsletter_id),
        total_unsubscribed = (SELECT COUNT(*) FROM unsubscribes WHERE newsletter_id = p_newsletter_id),
        total_complaints = (SELECT COUNT(*) FROM spam_complaints WHERE newsletter_id = p_newsletter_id),
        open_rate = CASE 
            WHEN total_delivered > 0 THEN (total_opened::DECIMAL / total_delivered::DECIMAL) * 100
            ELSE 0
        END,
        click_rate = CASE 
            WHEN total_delivered > 0 THEN (total_clicked::DECIMAL / total_delivered::DECIMAL) * 100
            ELSE 0
        END,
        bounce_rate = CASE 
            WHEN total_sent > 0 THEN (total_bounced::DECIMAL / total_sent::DECIMAL) * 100
            ELSE 0
        END,
        unsubscribe_rate = CASE 
            WHEN total_delivered > 0 THEN (total_unsubscribed::DECIMAL / total_delivered::DECIMAL) * 100
            ELSE 0
        END,
        spam_complaint_rate = CASE 
            WHEN total_delivered > 0 THEN (total_complaints::DECIMAL / total_delivered::DECIMAL) * 100
            ELSE 0
        END,
        last_calculated = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE newsletter_id = p_newsletter_id;
END;
$$ language 'plpgsql';