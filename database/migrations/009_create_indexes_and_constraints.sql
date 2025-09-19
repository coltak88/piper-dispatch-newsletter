-- Migration: Create comprehensive indexes and constraints
-- Created at: 2024-01-01 00:00:00
-- Description: Creates comprehensive indexes, constraints, and performance optimizations

-- Create indexes for improved query performance on users table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at_desc ON users(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login_at_desc ON users(last_login_at DESC NULLS LAST);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Create composite indexes for users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email, is_active) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users(role, is_active) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_verified ON users(created_at, email_verified);

-- Create indexes for newsletters table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_user_id ON newsletters(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_created_at_desc ON newsletters(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_scheduled_at ON newsletters(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_sent_at ON newsletters(sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_is_template ON newsletters(is_template);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_category ON newsletters(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_tags ON newsletters USING GIN(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_deleted_at ON newsletters(deleted_at) WHERE deleted_at IS NULL;

-- Create full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_title_search ON newsletters USING GIN(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_content_search ON newsletters USING GIN(to_tsvector('english', content));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletters_title_content_search ON newsletters USING GIN(to_tsvector('english', title || ' ' || content));

-- Create indexes for subscriptions table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_email_lower ON subscriptions(LOWER(email));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_created_at_desc ON subscriptions(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_verified_at ON subscriptions(verified_at) WHERE verified_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_unsubscribed_at ON subscriptions(unsubscribed_at) WHERE unsubscribed_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_newsletter_id ON subscriptions(newsletter_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subsegments_segment_id ON subscription_segments(segment_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subsegments_subscription_id ON subscription_segments(subscription_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subpreferences_subscription_id ON subscription_preferences(subscription_id);

-- Create indexes for email-related tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_campaigns_newsletter_id ON email_campaigns(newsletter_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_campaigns_created_at_desc ON email_campaigns(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_queue_campaign_id ON email_queue(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_queue_scheduled_at ON email_queue(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_queue_sent_at ON email_queue(sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_campaign_id ON email_tracking(campaign_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_subscription_id ON email_tracking(subscription_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_email ON email_tracking(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_opened_at ON email_tracking(opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_tracking_clicked_at ON email_tracking(clicked_at) WHERE clicked_at IS NOT NULL;

-- Create indexes for analytics tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_website_analytics_date ON website_analytics(analytics_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_website_analytics_page_path ON website_analytics(page_path);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_website_analytics_session_id ON website_analytics(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_events_event_name ON custom_events(event_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_events_event_date ON custom_events(event_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_events_user_id ON custom_events(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversions_conversion_date ON conversions(conversion_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ab_test_results_test_id ON ab_test_results(test_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ab_test_results_test_date ON ab_test_results(test_date);

-- Create indexes for system tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_configs_category ON system_configs(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_configs_is_active ON system_configs(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_created_at_desc ON security_events(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limiting_identifier ON rate_limiting(identifier);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limiting_endpoint ON rate_limiting(endpoint);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limiting_window_start ON rate_limiting(window_start);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_health_service_name ON system_health(service_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_health_status ON system_health(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_health_checked_at_desc ON system_health(checked_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_service ON error_logs(service);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_created_at_desc ON error_logs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_flags_flag_key ON feature_flags(flag_key);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_flags_is_active ON feature_flags(is_active);

-- Create indexes for payment tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_is_primary ON payment_methods(is_primary);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_is_active ON payment_methods(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_verification_status ON payment_methods(verification_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_plans_plan_key ON subscription_plans(plan_key);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_plans_plan_type ON subscription_plans(plan_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_next_billing_date ON user_subscriptions(next_billing_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_subscription_id ON transactions(user_subscription_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created_at_desc ON transactions(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_tracking_user_subscription_id ON usage_tracking(user_subscription_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_tracking_usage_date ON usage_tracking(usage_date);

-- Create indexes for audit logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id_created_at ON audit_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_category_created_at ON audit_logs(action_category, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_type_resource_id ON audit_logs(resource_type, resource_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_status_severity_level ON audit_logs(action_status, severity_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_correlation_id ON audit_logs(correlation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at_desc ON audit_logs(created_at DESC);

-- Add constraints for data integrity
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_users_phone_format CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$');
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_users_password_length CHECK (LENGTH(password_hash) >= 60); -- bcrypt hash length
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_users_username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 50);

ALTER TABLE newsletters ADD CONSTRAINT IF NOT EXISTS chk_newsletters_title_length CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 500);
ALTER TABLE newsletters ADD CONSTRAINT IF NOT EXISTS chk_newsletters_content_length CHECK (LENGTH(content) >= 1);
ALTER TABLE newsletters ADD CONSTRAINT IF NOT EXISTS chk_newsletters_status_valid CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'));

ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS chk_subscriptions_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS chk_subscriptions_name_length CHECK (first_name IS NULL OR LENGTH(first_name) <= 100);
ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS chk_subscriptions_name_length2 CHECK (last_name IS NULL OR LENGTH(last_name) <= 100);

ALTER TABLE email_queue ADD CONSTRAINT IF NOT EXISTS chk_email_queue_priority_range CHECK (priority >= 1 AND priority <= 10);
ALTER TABLE email_queue ADD CONSTRAINT IF NOT EXISTS chk_email_queue_status_valid CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled', 'bounced'));

ALTER TABLE transactions ADD CONSTRAINT IF NOT EXISTS chk_transactions_amount_positive CHECK (amount >= 0);
ALTER TABLE transactions ADD CONSTRAINT IF NOT EXISTS chk_transactions_refund_amount CHECK (refund_amount >= 0 AND refund_amount <= amount);
ALTER TABLE transactions ADD CONSTRAINT IF NOT EXISTS chk_transactions_status_valid CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed'));

-- Create unique constraints
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS unique_users_email UNIQUE (email) WHERE deleted_at IS NULL;
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS unique_users_username UNIQUE (username) WHERE deleted_at IS NULL;
ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS unique_subscription_email_newsletter UNIQUE (email, newsletter_id) WHERE deleted_at IS NULL;
ALTER TABLE system_configs ADD CONSTRAINT IF NOT EXISTS unique_system_configs_key UNIQUE (config_key);
ALTER TABLE feature_flags ADD CONSTRAINT IF NOT EXISTS unique_feature_flags_key UNIQUE (flag_key);

-- Create foreign key constraints with proper cascade rules
ALTER TABLE newsletters ADD CONSTRAINT IF NOT EXISTS fk_newsletters_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS fk_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS fk_subscriptions_newsletter_id FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE;
ALTER TABLE email_campaigns ADD CONSTRAINT IF NOT EXISTS fk_campaigns_newsletter_id FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE;
ALTER TABLE email_queue ADD CONSTRAINT IF NOT EXISTS fk_queue_campaign_id FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE;
ALTER TABLE user_subscriptions ADD CONSTRAINT IF NOT EXISTS fk_user_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_subscriptions ADD CONSTRAINT IF NOT EXISTS fk_user_subscriptions_plan_id FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT;

-- Create check constraints for JSONB fields
ALTER TABLE newsletters ADD CONSTRAINT IF NOT EXISTS chk_newsletters_tags_format CHECK (jsonb_typeof(tags) = 'array');
ALTER TABLE newsletters ADD CONSTRAINT IF NOT EXISTS chk_newsletters_recipients_format CHECK (jsonb_typeof(recipients) = 'object');
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_users_preferences_format CHECK (jsonb_typeof(preferences) = 'object');
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_users_metadata_format CHECK (jsonb_typeof(metadata) = 'object');

-- Create function to optimize table performance
CREATE OR REPLACE FUNCTION optimize_table_performance(table_name TEXT)
RETURNS VOID AS $$
DECLARE
    sql_query TEXT;
BEGIN
    -- Update table statistics
    sql_query := format('ANALYZE %I;', table_name);
    EXECUTE sql_query;
    
    -- Reindex table if needed (commented out as it's resource intensive)
    -- sql_query := format('REINDEX TABLE %I;', table_name);
    -- EXECUTE sql_query;
    
    RAISE NOTICE 'Optimized table: %', table_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get table size information
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    table_name TEXT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    row_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename) - pg_indexes_size(t.schemaname||'.'||t.tablename))::TEXT as table_size,
        pg_size_pretty(pg_indexes_size(t.schemaname||'.'||t.tablename))::TEXT as index_size,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename))::TEXT as total_size,
        c.reltuples::BIGINT as row_count
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE 'sql_%'
    ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;
END;
$$ LANGUAGE plpgsql;