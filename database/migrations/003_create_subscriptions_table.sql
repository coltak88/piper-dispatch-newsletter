-- Migration: Create subscriptions table
-- Created at: 2024-01-01 00:00:00
-- Description: Creates the subscriptions table for managing newsletter subscribers

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(255),
    job_title VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    interests TEXT[],
    tags TEXT[],
    source VARCHAR(100),
    medium VARCHAR(100),
    campaign VARCHAR(100),
    referral_code VARCHAR(100),
    custom_fields JSONB DEFAULT '{}',
    consent_given BOOLEAN DEFAULT TRUE,
    consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consent_ip INET,
    consent_user_agent TEXT,
    verification_token VARCHAR(255),
    verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    unsubscribe_token VARCHAR(255) UNIQUE,
    unsubscribed_at TIMESTAMP,
    unsubscribe_reason TEXT,
    bounce_count INTEGER DEFAULT 0,
    last_bounce_date TIMESTAMP,
    last_bounce_type VARCHAR(50),
    spam_complaint BOOLEAN DEFAULT FALSE,
    spam_complaint_date TIMESTAMP,
    engagement_score INTEGER DEFAULT 0,
    last_engagement_date TIMESTAMP,
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    subscription_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date TIMESTAMP,
    payment_status VARCHAR(50) DEFAULT 'none',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_is_verified ON subscriptions(is_verified);
CREATE INDEX idx_subscriptions_consent_date ON subscriptions(consent_date);
CREATE INDEX idx_subscriptions_verified_at ON subscriptions(verified_at);
CREATE INDEX idx_subscriptions_unsubscribed_at ON subscriptions(unsubscribed_at);
CREATE INDEX idx_subscriptions_subscription_tier ON subscriptions(subscription_tier);
CREATE INDEX idx_subscriptions_engagement_score ON subscriptions(engagement_score);
CREATE INDEX idx_subscriptions_last_engagement_date ON subscriptions(last_engagement_date);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX idx_subscriptions_tags ON subscriptions USING GIN(tags);
CREATE INDEX idx_subscriptions_interests ON subscriptions USING GIN(interests);
CREATE INDEX idx_subscriptions_deleted_at ON subscriptions(deleted_at) WHERE deleted_at IS NULL;

-- Create full text search index
CREATE INDEX idx_subscriptions_search ON subscriptions USING GIN(to_tsvector('english', email || ' ' || COALESCE(name, '') || ' ' || COALESCE(company, '')));

-- Create updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create subscription segments table for advanced targeting
CREATE TABLE IF NOT EXISTS subscription_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filter_conditions JSONB NOT NULL,
    estimated_count INTEGER DEFAULT 0,
    is_dynamic BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscription segments
CREATE INDEX idx_subscription_segments_name ON subscription_segments(name);
CREATE INDEX idx_subscription_segments_is_active ON subscription_segments(is_active);
CREATE INDEX idx_subscription_segments_created_by ON subscription_segments(created_by);

-- Create updated_at trigger for subscription segments
CREATE TRIGGER update_subscription_segments_updated_at 
    BEFORE UPDATE ON subscription_segments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create subscription_segment_subscribers junction table
CREATE TABLE IF NOT EXISTS subscription_segment_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID NOT NULL REFERENCES subscription_segments(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(segment_id, subscription_id)
);

-- Create indexes for junction table
CREATE INDEX idx_segment_subscribers_segment_id ON subscription_segment_subscribers(segment_id);
CREATE INDEX idx_segment_subscribers_subscription_id ON subscription_segment_subscribers(subscription_id);
CREATE INDEX idx_segment_subscribers_added_at ON subscription_segment_subscribers(added_at);

-- Create subscription preferences table
CREATE TABLE IF NOT EXISTS subscription_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscription_id, preference_key)
);

-- Create indexes for subscription preferences
CREATE INDEX idx_subscription_preferences_subscription_id ON subscription_preferences(subscription_id);
CREATE INDEX idx_subscription_preferences_preference_key ON subscription_preferences(preference_key);
CREATE INDEX idx_subscription_preferences_is_enabled ON subscription_preferences(is_enabled);

-- Create updated_at trigger for subscription preferences
CREATE TRIGGER update_subscription_preferences_updated_at 
    BEFORE UPDATE ON subscription_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create subscription activities table for engagement tracking
CREATE TABLE IF NOT EXISTS subscription_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('email_opened', 'email_clicked', 'email_bounced', 'email_complained', 'subscription_created', 'subscription_updated', 'subscription_verified', 'subscription_unsubscribed', 'profile_updated', 'preference_changed')),
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    campaign_id UUID,
    newsletter_id UUID,
    email_id UUID,
    session_id VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscription activities
CREATE INDEX idx_subscription_activities_subscription_id ON subscription_activities(subscription_id);
CREATE INDEX idx_subscription_activities_activity_type ON subscription_activities(activity_type);
CREATE INDEX idx_subscription_activities_campaign_id ON subscription_activities(campaign_id);
CREATE INDEX idx_subscription_activities_newsletter_id ON subscription_activities(newsletter_id);
CREATE INDEX idx_subscription_activities_created_at ON subscription_activities(created_at);
CREATE INDEX idx_subscription_activities_session_id ON subscription_activities(session_id);

-- Create subscription tags table for better organization
CREATE TABLE IF NOT EXISTS subscription_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#000000',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger for subscription tags
CREATE TRIGGER update_subscription_tags_updated_at 
    BEFORE UPDATE ON subscription_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create subscription_tag_assignments junction table
CREATE TABLE IF NOT EXISTS subscription_tag_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    tag_id UUID NOT NULL REFERENCES subscription_tags(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscription_id, tag_id)
);

-- Create indexes for tag assignments
CREATE INDEX idx_tag_assignments_subscription_id ON subscription_tag_assignments(subscription_id);
CREATE INDEX idx_tag_assignments_tag_id ON subscription_tag_assignments(tag_id);
CREATE INDEX idx_tag_assignments_assigned_at ON subscription_tag_assignments(assigned_at);

-- Create subscription import history table
CREATE TABLE IF NOT EXISTS subscription_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    file_size INTEGER,
    total_records INTEGER,
    processed_records INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    import_status VARCHAR(50) DEFAULT 'pending' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed')),
    import_errors JSONB DEFAULT '[]',
    field_mapping JSONB DEFAULT '{}',
    import_options JSONB DEFAULT '{}',
    imported_by UUID REFERENCES users(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for import history
CREATE INDEX idx_subscription_imports_import_status ON subscription_imports(import_status);
CREATE INDEX idx_subscription_imports_imported_by ON subscription_imports(imported_by);
CREATE INDEX idx_subscription_imports_created_at ON subscription_imports(created_at);

-- Create updated_at trigger for subscription imports
CREATE TRIGGER update_subscription_imports_updated_at 
    BEFORE UPDATE ON subscription_imports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_subscription_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_recent_opens INTEGER;
    v_recent_clicks INTEGER;
    v_total_emails INTEGER;
    v_days_since_last_engagement INTEGER;
BEGIN
    -- Get recent activity (last 30 days)
    SELECT 
        COUNT(CASE WHEN activity_type = 'email_opened' THEN 1 END),
        COUNT(CASE WHEN activity_type = 'email_clicked' THEN 1 END)
    INTO v_recent_opens, v_recent_clicks
    FROM subscription_activities 
    WHERE subscription_id = p_subscription_id 
    AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days';

    -- Get total emails sent
    SELECT COUNT(*) INTO v_total_emails
    FROM email_campaigns 
    WHERE subscription_id = p_subscription_id 
    AND status = 'sent';

    -- Get days since last engagement
    SELECT EXTRACT(DAY FROM (CURRENT_TIMESTAMP - MAX(created_at)))::INTEGER
    INTO v_days_since_last_engagement
    FROM subscription_activities 
    WHERE subscription_id = p_subscription_id;

    -- Calculate score based on recent activity
    v_score := v_score + (v_recent_opens * 5);
    v_score := v_score + (v_recent_clicks * 10);
    
    -- Penalize for bounces and complaints
    v_score := v_score - (SELECT COUNT(*) FROM subscription_activities WHERE subscription_id = p_subscription_id AND activity_type IN ('email_bounced', 'email_complained')) * 20;
    
    -- Penalize for inactivity
    IF v_days_since_last_engagement > 30 THEN
        v_score := v_score - 50;
    ELSIF v_days_since_last_engagement > 90 THEN
        v_score := v_score - 100;
    END IF;

    -- Ensure score is between 0 and 100
    v_score := GREATEST(0, LEAST(100, v_score));

    RETURN v_score;
END;
$$ language 'plpgsql';