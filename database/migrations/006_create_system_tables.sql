-- Migration: Create system tables
-- Created at: 2024-01-01 00:00:00
-- Description: Creates tables for system configuration, audit logging, and security

-- System configuration table
CREATE TABLE IF NOT EXISTS system_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string' CHECK (config_type IN ('string', 'integer', 'decimal', 'boolean', 'json', 'array')),
    description TEXT,
    category VARCHAR(100),
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    allowed_values JSONB DEFAULT '[]',
    validation_rules JSONB DEFAULT '{}',
    environment VARCHAR(50) DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for system configurations
CREATE INDEX idx_system_configurations_config_key ON system_configurations(config_key);
CREATE INDEX idx_system_configurations_category ON system_configurations(category);
CREATE INDEX idx_system_configurations_environment ON system_configurations(environment);
CREATE INDEX idx_system_configurations_is_active ON system_configurations(is_active);
CREATE INDEX idx_system_configurations_created_at ON system_configurations(created_at);
CREATE INDEX idx_system_configurations_deleted_at ON system_configurations(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for system configurations
CREATE TRIGGER update_system_configurations_updated_at 
    BEFORE UPDATE ON system_configurations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    resource_name VARCHAR(500),
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    changes JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    request_headers JSONB DEFAULT '{}',
    response_status INTEGER,
    response_body JSONB DEFAULT '{}',
    error_message TEXT,
    execution_time_ms INTEGER,
    session_id VARCHAR(255),
    correlation_id VARCHAR(255),
    tags JSONB DEFAULT '[]',
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX idx_audit_logs_correlation_id ON audit_logs(correlation_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_occurred_at ON audit_logs(occurred_at);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('login_attempt', 'login_success', 'login_failure', 'logout', 'password_change', 'password_reset', 'account_lockout', 'permission_denied', 'suspicious_activity', 'api_rate_limit', 'brute_force_detected', 'sql_injection_attempt', 'xss_attempt', 'csrf_attempt', 'file_upload', 'data_export', 'api_key_generated', 'api_key_revoked')),
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('authentication', 'authorization', 'data_access', 'security_threat', 'system_security')),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    ip_address INET NOT NULL,
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_fingerprint VARCHAR(255),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    threat_intelligence JSONB DEFAULT '{}',
    mitigation_action VARCHAR(255),
    mitigation_result BOOLEAN,
    additional_data JSONB DEFAULT '{}',
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for security events
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_event_category ON security_events(event_category);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX idx_security_events_session_id ON security_events(session_id);
CREATE INDEX idx_security_events_risk_score ON security_events(risk_score DESC);
CREATE INDEX idx_security_events_occurred_at ON security_events(occurred_at);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);

-- API rate limiting table
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP, API key, or user ID
    identifier_type VARCHAR(50) NOT NULL CHECK (identifier_type IN ('ip_address', 'api_key', 'user_id', 'session_id')),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    window_start TIMESTAMP NOT NULL,
    window_duration_minutes INTEGER DEFAULT 60,
    max_requests INTEGER NOT NULL,
    current_requests INTEGER DEFAULT 0,
    remaining_requests INTEGER DEFAULT 0,
    reset_at TIMESTAMP,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason VARCHAR(255),
    blocked_until TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for API rate limits
CREATE INDEX idx_api_rate_limits_identifier ON api_rate_limits(identifier);
CREATE INDEX idx_api_rate_limits_identifier_type ON api_rate_limits(identifier_type);
CREATE INDEX idx_api_rate_limits_endpoint ON api_rate_limits(endpoint);
CREATE INDEX idx_api_rate_limits_window_start ON api_rate_limits(window_start);
CREATE INDEX idx_api_rate_limits_is_blocked ON api_rate_limits(is_blocked);
CREATE INDEX idx_api_rate_limits_reset_at ON api_rate_limits(reset_at);
CREATE INDEX idx_api_rate_limits_created_at ON api_rate_limits(created_at);

-- Create updated_at trigger for API rate limits
CREATE TRIGGER update_api_rate_limits_updated_at 
    BEFORE UPDATE ON api_rate_limits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- System health monitoring
CREATE TABLE IF NOT EXISTS system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_name VARCHAR(255) NOT NULL,
    component_type VARCHAR(100) NOT NULL CHECK (component_type IN ('database', 'cache', 'queue', 'api', 'email_service', 'payment_service', 'storage', 'external_service', 'server')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    response_time_ms INTEGER,
    uptime_percentage DECIMAL(5,2),
    error_rate DECIMAL(5,2),
    throughput_rps INTEGER,
    cpu_usage_percentage DECIMAL(5,2),
    memory_usage_percentage DECIMAL(5,2),
    disk_usage_percentage DECIMAL(5,2),
    network_io_mb DECIMAL(10,2),
    active_connections INTEGER,
    queue_size INTEGER,
    last_heartbeat TIMESTAMP,
    health_check_details JSONB DEFAULT '{}',
    alert_sent BOOLEAN DEFAULT FALSE,
    alert_sent_at TIMESTAMP,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for system health
CREATE INDEX idx_system_health_component_name ON system_health(component_name);
CREATE INDEX idx_system_health_component_type ON system_health(component_type);
CREATE INDEX idx_system_health_status ON system_health(status);
CREATE INDEX idx_system_health_checked_at ON system_health(checked_at);
CREATE INDEX idx_system_health_last_heartbeat ON system_health(last_heartbeat);
CREATE INDEX idx_system_health_created_at ON system_health(created_at);

-- Backup and restore logs
CREATE TABLE IF NOT EXISTS backup_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential', 'database', 'files', 'configuration')),
    backup_scope VARCHAR(100) NOT NULL,
    backup_size_bytes BIGINT,
    backup_location VARCHAR(500),
    backup_format VARCHAR(50),
    compression_ratio DECIMAL(5,2),
    encryption_used BOOLEAN DEFAULT FALSE,
    checksum VARCHAR(255),
    backup_start_time TIMESTAMP NOT NULL,
    backup_end_time TIMESTAMP,
    duration_seconds INTEGER,
    status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    tables_backed_up JSONB DEFAULT '[]',
    files_backed_up JSONB DEFAULT '[]',
    restore_point_created BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'not_required')),
    verification_time TIMESTAMP,
    retention_until DATE,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for backup logs
CREATE INDEX idx_backup_logs_backup_type ON backup_logs(backup_type);
CREATE INDEX idx_backup_logs_backup_start_time ON backup_logs(backup_start_time);
CREATE INDEX idx_backup_logs_status ON backup_logs(status);
CREATE INDEX idx_backup_logs_verification_status ON backup_logs(verification_status);
CREATE INDEX idx_backup_logs_retention_until ON backup_logs(retention_until);
CREATE INDEX idx_backup_logs_created_by ON backup_logs(created_by);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_code VARCHAR(100),
    error_message TEXT NOT NULL,
    error_stack_trace TEXT,
    error_type VARCHAR(100) CHECK (error_type IN ('application', 'database', 'network', 'security', 'validation', 'configuration', 'external_service')),
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    component VARCHAR(255),
    module VARCHAR(255),
    function_name VARCHAR(255),
    file_path VARCHAR(500),
    line_number INTEGER,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    correlation_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    request_url TEXT,
    request_method VARCHAR(10),
    request_headers JSONB DEFAULT '{}',
    request_body JSONB DEFAULT '{}',
    response_status INTEGER,
    response_headers JSONB DEFAULT '{}',
    response_body JSONB DEFAULT '{}',
    environment VARCHAR(50) DEFAULT 'production',
    server_name VARCHAR(255),
    process_id INTEGER,
    thread_id VARCHAR(255),
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percentage DECIMAL(5,2),
    additional_context JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for error logs
CREATE INDEX idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_component ON error_logs(component);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX idx_error_logs_request_id ON error_logs(request_id);
CREATE INDEX idx_error_logs_occurred_at ON error_logs(occurred_at);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(255) UNIQUE NOT NULL,
    flag_description TEXT,
    flag_key VARCHAR(255) UNIQUE NOT NULL,
    flag_value JSONB NOT NULL DEFAULT 'true',
    flag_type VARCHAR(50) DEFAULT 'boolean' CHECK (flag_type IN ('boolean', 'string', 'integer', 'decimal', 'json')),
    rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_users JSONB DEFAULT '[]',
    target_segments JSONB DEFAULT '[]',
    target_roles JSONB DEFAULT '[]',
    target_countries JSONB DEFAULT '[]',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for feature flags
CREATE INDEX idx_feature_flags_flag_key ON feature_flags(flag_key);
CREATE INDEX idx_feature_flags_is_active ON feature_flags(is_active);
CREATE INDEX idx_feature_flags_is_archived ON feature_flags(is_archived);
CREATE INDEX idx_feature_flags_start_date ON feature_flags(start_date);
CREATE INDEX idx_feature_flags_end_date ON feature_flags(end_date);
CREATE INDEX idx_feature_flags_created_at ON feature_flags(created_at);
CREATE INDEX idx_feature_flags_deleted_at ON feature_flags(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for feature flags
CREATE TRIGGER update_feature_flags_updated_at 
    BEFORE UPDATE ON feature_flags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check if feature flag is enabled for user
CREATE OR REPLACE FUNCTION is_feature_flag_enabled(p_flag_key VARCHAR, p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_flag RECORD;
    v_user_rollout INTEGER;
    v_is_enabled BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_flag
    FROM feature_flags
    WHERE flag_key = p_flag_key
    AND is_active = TRUE
    AND is_archived = FALSE
    AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
    AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP);

    IF v_flag IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check rollout percentage
    IF v_flag.rollout_percentage < 100 THEN
        IF p_user_id IS NULL THEN
            RETURN FALSE;
        END IF;
        -- Simple deterministic rollout based on user ID hash
        v_user_rollout := ABS(HASHTEXT(p_user_id::TEXT)) % 100;
        IF v_user_rollout >= v_flag.rollout_percentage THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Check target users
    IF v_flag.target_users IS NOT NULL AND ARRAY_LENGTH(v_flag.target_users, 1) > 0 THEN
        IF p_user_id IS NULL OR NOT (p_user_id::TEXT = ANY(v_flag.target_users)) THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Parse and return flag value based on type
    CASE v_flag.flag_type
        WHEN 'boolean' THEN
            v_is_enabled := COALESCE((v_flag.flag_value)::TEXT::BOOLEAN, FALSE);
        WHEN 'string' THEN
            v_is_enabled := v_flag.flag_value IS NOT NULL;
        WHEN 'integer' THEN
            v_is_enabled := COALESCE((v_flag.flag_value)::TEXT::INTEGER, 0) > 0;
        WHEN 'decimal' THEN
            v_is_enabled := COALESCE((v_flag.flag_value)::TEXT::DECIMAL, 0) > 0;
        WHEN 'json' THEN
            v_is_enabled := v_flag.flag_value IS NOT NULL;
        ELSE
            v_is_enabled := FALSE;
    END CASE;

    RETURN v_is_enabled;
END;
$$ language 'plpgsql';