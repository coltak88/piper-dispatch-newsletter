-- Migration: Create comprehensive audit log table
-- Created at: 2024-01-01 00:00:00
-- Description: Creates a comprehensive audit log table for tracking all system activities

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    impersonated_by_user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    resource_name VARCHAR(500),
    action_category VARCHAR(100) NOT NULL CHECK (action_category IN ('authentication', 'authorization', 'data_modification', 'system_operation', 'security_event', 'api_call', 'admin_action', 'user_action', 'payment_action', 'email_action', 'subscription_action')),
    action_status VARCHAR(50) NOT NULL CHECK (action_status IN ('success', 'failure', 'pending', 'cancelled', 'timeout')),
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('info', 'warning', 'error', 'critical')),
    ip_address INET,
    user_agent TEXT,
    http_method VARCHAR(10),
    url_path VARCHAR(1000),
    query_parameters JSONB DEFAULT '{}',
    request_headers JSONB DEFAULT '{}',
    request_body JSONB DEFAULT '{}',
    response_status INTEGER,
    response_headers JSONB DEFAULT '{}',
    response_body JSONB DEFAULT '{}',
    error_code VARCHAR(100),
    error_message TEXT,
    error_stack_trace TEXT,
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    changed_fields TEXT[],
    business_impact VARCHAR(500),
    risk_assessment VARCHAR(500),
    compliance_requirement VARCHAR(100),
    retention_period INTEGER DEFAULT 2555, -- 7 years in days
    geo_location JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    authentication_method VARCHAR(100),
    authorization_result VARCHAR(100),
    correlation_id VARCHAR(255),
    parent_audit_log_id UUID REFERENCES audit_logs(id),
    tags TEXT[],
    notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    escalation_level VARCHAR(50),
    escalation_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_impersonated_by_user_id ON audit_logs(impersonated_by_user_id);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX idx_audit_logs_request_id ON audit_logs(request_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_action_category ON audit_logs(action_category);
CREATE INDEX idx_audit_logs_action_status ON audit_logs(action_status);
CREATE INDEX idx_audit_logs_severity_level ON audit_logs(severity_level);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action_category_created_at ON audit_logs(action_category, created_at);
CREATE INDEX idx_audit_logs_user_id_created_at ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_resource_type_resource_id ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action_status_severity_level ON audit_logs(action_status, severity_level);
CREATE INDEX idx_audit_logs_correlation_id ON audit_logs(correlation_id);
CREATE INDEX idx_audit_logs_parent_audit_log_id ON audit_logs(parent_audit_log_id);
CREATE INDEX idx_audit_logs_tags ON audit_logs USING GIN(tags);
CREATE INDEX idx_audit_logs_geo_location ON audit_logs USING GIN(geo_location);
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN(metadata);

-- Partition audit logs by month for better performance
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Create function to automatically create monthly partitions
CREATE OR REPLACE FUNCTION create_audit_log_partition()
RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'audit_logs_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
    
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (user_id, created_at)',
                   partition_name || '_user_created_idx', partition_name);
    
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (action_category, created_at)',
                   partition_name || '_category_created_idx', partition_name);
END;
$$ LANGUAGE plpgsql;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id VARCHAR,
    p_action_category VARCHAR,
    p_action_status VARCHAR,
    p_severity_level VARCHAR,
    p_old_values JSONB DEFAULT '{}',
    p_new_values JSONB DEFAULT '{}',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_audit_log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, action_category,
        action_status, severity_level, old_values, new_values, metadata
    ) VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id, p_action_category,
        p_action_status, p_severity_level, p_old_values, p_new_values, p_metadata
    ) RETURNING id INTO v_audit_log_id;
    
    RETURN v_audit_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get audit trail for a resource
CREATE OR REPLACE FUNCTION get_resource_audit_trail(
    p_resource_type VARCHAR,
    p_resource_id VARCHAR,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    action VARCHAR,
    action_status VARCHAR,
    severity_level VARCHAR,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    created_at TIMESTAMP,
    user_email VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.user_id,
        al.action,
        al.action_status,
        al.severity_level,
        al.old_values,
        al.new_values,
        al.changed_fields,
        al.created_at,
        u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.resource_type = p_resource_type 
    AND al.resource_id = p_resource_id
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    p_user_id UUID,
    p_time_window INTERVAL DEFAULT INTERVAL '1 hour',
    p_failed_login_threshold INTEGER DEFAULT 5,
    p_api_call_threshold INTEGER DEFAULT 100
)
RETURNS TABLE (
    alert_type VARCHAR,
    alert_description TEXT,
    event_count BIGINT,
    first_occurrence TIMESTAMP,
    last_occurrence TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    -- Detect excessive failed login attempts
    SELECT 
        'EXCESSIVE_FAILED_LOGINS'::VARCHAR as alert_type,
        'More than ' || p_failed_login_threshold || ' failed login attempts in ' || p_time_window::TEXT as alert_description,
        COUNT(*) as event_count,
        MIN(created_at) as first_occurrence,
        MAX(created_at) as last_occurrence
    FROM audit_logs
    WHERE user_id = p_user_id
    AND action = 'login_attempt'
    AND action_status = 'failure'
    AND created_at >= CURRENT_TIMESTAMP - p_time_window
    GROUP BY user_id
    HAVING COUNT(*) > p_failed_login_threshold
    
    UNION ALL
    
    -- Detect excessive API calls
    SELECT 
        'EXCESSIVE_API_CALLS'::VARCHAR as alert_type,
        'More than ' || p_api_call_threshold || ' API calls in ' || p_time_window::TEXT as alert_description,
        COUNT(*) as event_count,
        MIN(created_at) as first_occurrence,
        MAX(created_at) as last_occurrence
    FROM audit_logs
    WHERE user_id = p_user_id
    AND action_category = 'api_call'
    AND created_at >= CURRENT_TIMESTAMP - p_time_window
    GROUP BY user_id
    HAVING COUNT(*) > p_api_call_threshold
    
    UNION ALL
    
    -- Detect access from multiple IP addresses
    SELECT 
        'MULTIPLE_IP_ADDRESSES'::VARCHAR as alert_type,
        'Access from ' || COUNT(DISTINCT ip_address) || ' different IP addresses in ' || p_time_window::TEXT as alert_description,
        COUNT(DISTINCT ip_address) as event_count,
        MIN(created_at) as first_occurrence,
        MAX(created_at) as last_occurrence
    FROM audit_logs
    WHERE user_id = p_user_id
    AND ip_address IS NOT NULL
    AND created_at >= CURRENT_TIMESTAMP - p_time_window
    GROUP BY user_id
    HAVING COUNT(DISTINCT ip_address) > 3;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
    p_retention_days INTEGER DEFAULT 2555 -- 7 years
)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * p_retention_days
    AND retention_period <= p_retention_days;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic audit logging on table changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_old_values JSONB;
    v_new_values JSONB;
    v_action VARCHAR(10);
    v_user_id UUID;
    v_resource_type VARCHAR(100);
BEGIN
    v_resource_type := TG_TABLE_NAME;
    v_user_id := COALESCE(current_setting('app.current_user_id', true)::UUID, NULL);
    
    IF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_old_values := to_jsonb(OLD);
        v_new_values := '{}';
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, action_category, action_status, severity_level, old_values, new_values)
        VALUES (v_user_id, v_action, v_resource_type, OLD.id::TEXT, 'data_modification', 'success', 'info', v_old_values, v_new_values);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, action_category, action_status, severity_level, old_values, new_values)
        VALUES (v_user_id, v_action, v_resource_type, NEW.id::TEXT, 'data_modification', 'success', 'info', v_old_values, v_new_values);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        v_action := 'CREATE';
        v_old_values := '{}';
        v_new_values := to_jsonb(NEW);
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, action_category, action_status, severity_level, old_values, new_values)
        VALUES (v_user_id, v_action, v_resource_type, NEW.id::TEXT, 'data_modification', 'success', 'info', v_old_values, v_new_values);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;