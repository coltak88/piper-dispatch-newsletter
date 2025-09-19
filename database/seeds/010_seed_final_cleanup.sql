-- Seed data: Final Cleanup and Validation
-- Created at: 2024-01-01 00:00:00
-- Description: Final cleanup, validation, and summary of all seeded data

-- Update all sequences to ensure they don't conflict with existing data
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('newsletters_id_seq', (SELECT MAX(id) FROM newsletters));
SELECT setval('newsletter_statistics_id_seq', (SELECT MAX(id) FROM newsletter_statistics));
SELECT setval('newsletter_ab_test_versions_id_seq', (SELECT MAX(id) FROM newsletter_ab_test_versions));
SELECT setval('newsletter_audit_logs_id_seq', (SELECT MAX(id) FROM newsletter_audit_logs));
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));
SELECT setval('subscription_segments_id_seq', (SELECT MAX(id) FROM subscription_segments));
SELECT setval('subscription_preferences_id_seq', (SELECT MAX(id) FROM subscription_preferences));
SELECT setval('subscription_activities_id_seq', (SELECT MAX(id) FROM subscription_activities));
SELECT setval('subscription_tags_id_seq', (SELECT MAX(id) FROM subscription_tags));
SELECT setval('subscription_imports_id_seq', (SELECT MAX(id) FROM subscription_imports));
SELECT setval('email_templates_id_seq', (SELECT MAX(id) FROM email_templates));
SELECT setval('email_campaigns_id_seq', (SELECT MAX(id) FROM email_campaigns));
SELECT setval('email_queue_id_seq', (SELECT MAX(id) FROM email_queue));
SELECT setval('email_opens_id_seq', (SELECT MAX(id) FROM email_opens));
SELECT setval('email_clicks_id_seq', (SELECT MAX(id) FROM email_clicks));
SELECT setval('email_unsubscribes_id_seq', (SELECT MAX(id) FROM email_unsubscribes));
SELECT setval('email_spam_complaints_id_seq', (SELECT MAX(id) FROM email_spam_complaints));
SELECT setval('email_bounces_id_seq', (SELECT MAX(id) FROM email_bounces));
SELECT setval('email_statistics_id_seq', (SELECT MAX(id) FROM email_statistics));
SELECT setval('website_analytics_id_seq', (SELECT MAX(id) FROM website_analytics));
SELECT setval('custom_events_id_seq', (SELECT MAX(id) FROM custom_events));
SELECT setval('conversions_id_seq', (SELECT MAX(id) FROM conversions));
SELECT setval('ab_test_results_id_seq', (SELECT MAX(id) FROM ab_test_results));
SELECT setval('user_behavior_analytics_id_seq', (SELECT MAX(id) FROM user_behavior_analytics));
SELECT setval('real_time_analytics_id_seq', (SELECT MAX(id) FROM real_time_analytics));
SELECT setval('system_configurations_id_seq', (SELECT MAX(id) FROM system_configurations));
SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));
SELECT setval('security_events_id_seq', (SELECT MAX(id) FROM security_events));
SELECT setval('api_rate_limits_id_seq', (SELECT MAX(id) FROM api_rate_limits));
SELECT setval('system_health_monitoring_id_seq', (SELECT MAX(id) FROM system_health_monitoring));
SELECT setval('backup_logs_id_seq', (SELECT MAX(id) FROM backup_logs));
SELECT setval('error_logs_id_seq', (SELECT MAX(id) FROM error_logs));
SELECT setval('feature_flags_id_seq', (SELECT MAX(id) FROM feature_flags));
SELECT setval('payment_methods_id_seq', (SELECT MAX(id) FROM payment_methods));
SELECT setval('subscription_plans_id_seq', (SELECT MAX(id) FROM subscription_plans));
SELECT setval('user_subscriptions_id_seq', (SELECT MAX(id) FROM user_subscriptions));
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));
SELECT setval('invoices_id_seq', (SELECT MAX(id) FROM invoices));
SELECT setval('usage_tracking_id_seq', (SELECT MAX(id) FROM usage_tracking));

-- Create data validation and integrity checks
CREATE OR REPLACE FUNCTION validate_seeded_data()
RETURNS TABLE (
    table_name TEXT,
    record_count BIGINT,
    validation_status TEXT,
    issues_found TEXT[]
) AS $$
BEGIN
    -- Users table validation
    RETURN QUERY
    SELECT 
        'users'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            WHEN COUNT(*) < 100 THEN 'WARNING - Low record count'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No users found' ELSE 'Users: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE email_verified = true) = 0 THEN 'No verified emails' ELSE 'Verified emails: ' || COUNT(*) FILTER (WHERE email_verified = true)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE user_role = 'admin') = 0 THEN 'No admin users' ELSE 'Admin users: ' || COUNT(*) FILTER (WHERE user_role = 'admin')::TEXT END
        ]
    FROM users;
    
    -- Newsletters table validation
    RETURN QUERY
    SELECT 
        'newsletters'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            WHEN COUNT(*) < 50 THEN 'WARNING - Low record count'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No newsletters found' ELSE 'Newsletters: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE status = 'published') = 0 THEN 'No published newsletters' ELSE 'Published: ' || COUNT(*) FILTER (WHERE status = 'published')::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE status = 'draft') = 0 THEN 'No draft newsletters' ELSE 'Drafts: ' || COUNT(*) FILTER (WHERE status = 'draft')::TEXT END
        ]
    FROM newsletters;
    
    -- Subscriptions table validation
    RETURN QUERY
    SELECT 
        'subscriptions'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            WHEN COUNT(*) < 500 THEN 'WARNING - Low record count'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No subscriptions found' ELSE 'Subscriptions: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE subscription_status = 'active') = 0 THEN 'No active subscriptions' ELSE 'Active: ' || COUNT(*) FILTER (WHERE subscription_status = 'active')::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE consent_status = 'granted') = 0 THEN 'No granted consents' ELSE 'Consented: ' || COUNT(*) FILTER (WHERE consent_status = 'granted')::TEXT END
        ]
    FROM subscriptions;
    
    -- Email campaigns validation
    RETURN QUERY
    SELECT 
        'email_campaigns'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            WHEN COUNT(*) < 20 THEN 'WARNING - Low record count'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No campaigns found' ELSE 'Campaigns: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE status = 'completed') = 0 THEN 'No completed campaigns' ELSE 'Completed: ' || COUNT(*) FILTER (WHERE status = 'completed')::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE status = 'scheduled') = 0 THEN 'No scheduled campaigns' ELSE 'Scheduled: ' || COUNT(*) FILTER (WHERE status = 'scheduled')::TEXT END
        ]
    FROM email_campaigns;
    
    -- Website analytics validation
    RETURN QUERY
    SELECT 
        'website_analytics'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            WHEN COUNT(*) < 1000 THEN 'WARNING - Low record count'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No analytics found' ELSE 'Analytics records: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE session_duration > 0) = 0 THEN 'No sessions with duration' ELSE 'Sessions with duration: ' || COUNT(*) FILTER (WHERE session_duration > 0)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE bounce_rate < 1.0) = 0 THEN 'No valid bounce rates' ELSE 'Valid bounce rates: ' || COUNT(*) FILTER (WHERE bounce_rate < 1.0)::TEXT END
        ]
    FROM website_analytics;
    
    -- Custom events validation
    RETURN QUERY
    SELECT 
        'custom_events'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            WHEN COUNT(*) < 500 THEN 'WARNING - Low record count'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No custom events found' ELSE 'Custom events: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE event_value > 0) = 0 THEN 'No events with value' ELSE 'Events with value: ' || COUNT(*) FILTER (WHERE event_value > 0)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE event_category IS NOT NULL) = 0 THEN 'No categorized events' ELSE 'Categorized events: ' || COUNT(*) FILTER (WHERE event_category IS NOT NULL)::TEXT END
        ]
    FROM custom_events;
    
    -- System configurations validation
    RETURN QUERY
    SELECT 
        'system_configurations'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No configurations found' ELSE 'Configurations: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE is_active = true) = 0 THEN 'No active configurations' ELSE 'Active configurations: ' || COUNT(*) FILTER (WHERE is_active = true)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE config_key = 'app_name') = 0 THEN 'No app name configured' ELSE 'App name configured' END
        ]
    FROM system_configurations;
    
    -- Subscription plans validation
    RETURN QUERY
    SELECT 
        'subscription_plans'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'FAILED - No records found'
            ELSE 'PASSED'
        END,
        ARRAY[
            CASE WHEN COUNT(*) = 0 THEN 'No subscription plans found' ELSE 'Plans: ' || COUNT(*)::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE plan_type = 'free') = 0 THEN 'No free plan' ELSE 'Free plan: ' || COUNT(*) FILTER (WHERE plan_type = 'free')::TEXT END,
            CASE WHEN COUNT(*) FILTER (WHERE plan_type = 'premium') = 0 THEN 'No premium plan' ELSE 'Premium plans: ' || COUNT(*) FILTER (WHERE plan_type = 'premium')::TEXT END
        ]
    FROM subscription_plans;
END;
$$ LANGUAGE plpgsql;

-- Create data summary function
CREATE OR REPLACE FUNCTION get_data_summary()
RETURNS TABLE (
    category TEXT,
    table_name TEXT,
    record_count BIGINT,
    percentage_of_total NUMERIC
) AS $$
DECLARE
    total_records BIGINT;
BEGIN
    -- Calculate total records across all main tables
    SELECT 
        (SELECT COUNT(*) FROM users) +
        (SELECT COUNT(*) FROM newsletters) +
        (SELECT COUNT(*) FROM subscriptions) +
        (SELECT COUNT(*) FROM email_campaigns) +
        (SELECT COUNT(*) FROM website_analytics) +
        (SELECT COUNT(*) FROM custom_events) +
        (SELECT COUNT(*) FROM system_configurations) +
        (SELECT COUNT(*) FROM subscription_plans)
    INTO total_records;
    
    -- Users summary
    RETURN QUERY
    SELECT 'Users'::TEXT, 'users'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM users;
    
    -- Newsletters summary
    RETURN QUERY
    SELECT 'Content'::TEXT, 'newsletters'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM newsletters;
    
    -- Subscriptions summary
    RETURN QUERY
    SELECT 'Subscribers'::TEXT, 'subscriptions'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM subscriptions;
    
    -- Email campaigns summary
    RETURN QUERY
    SELECT 'Campaigns'::TEXT, 'email_campaigns'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM email_campaigns;
    
    -- Analytics summary
    RETURN QUERY
    SELECT 'Analytics'::TEXT, 'website_analytics'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM website_analytics;
    
    -- Events summary
    RETURN QUERY
    SELECT 'Events'::TEXT, 'custom_events'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM custom_events;
    
    -- System summary
    RETURN QUERY
    SELECT 'System'::TEXT, 'system_configurations'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM system_configurations;
    
    -- Plans summary
    RETURN QUERY
    SELECT 'Plans'::TEXT, 'subscription_plans'::TEXT, COUNT(*)::BIGINT, (COUNT(*)::NUMERIC / NULLIF(total_records, 0) * 100)::NUMERIC
    FROM subscription_plans;
END;
$$ LANGUAGE plpgsql;

-- Create database health check function
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
BEGIN
    -- Check table sizes
    RETURN QUERY
    SELECT 
        'Table Sizes'::TEXT,
        CASE 
            WHEN pg_total_relation_size(c.oid) > 1073741824 THEN 'WARNING' -- 1GB
            WHEN pg_total_relation_size(c.oid) > 5368709120 THEN 'CRITICAL' -- 5GB
            ELSE 'OK'
        END,
        'Table ' || c.relname || ' size: ' || pg_size_pretty(pg_total_relation_size(c.oid)),
        CASE 
            WHEN pg_total_relation_size(c.oid) > 5368709120 THEN 'Consider partitioning or archiving old data'
            WHEN pg_total_relation_size(c.oid) > 1073741824 THEN 'Monitor table growth'
            ELSE 'Table size is acceptable'
        END
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r' 
    AND n.nspname = 'public'
    AND c.relname IN ('users', 'newsletters', 'subscriptions', 'email_campaigns', 'website_analytics', 'custom_events')
    ORDER BY pg_total_relation_size(c.oid) DESC
    LIMIT 10;
    
    -- Check index usage
    RETURN QUERY
    SELECT 
        'Index Usage'::TEXT,
        CASE 
            WHEN idx_scan = 0 THEN 'WARNING'
            WHEN idx_scan < 100 THEN 'INFO'
            ELSE 'OK'
        END,
        'Index ' || indexrelname || ' on ' || relname || ' used ' || idx_scan || ' times',
        CASE 
            WHEN idx_scan = 0 THEN 'Consider if index is necessary'
            WHEN idx_scan < 100 THEN 'Low usage - monitor'
            ELSE 'Index is being used effectively'
        END
    FROM pg_stat_user_indexes 
    WHERE relname IN ('users', 'newsletters', 'subscriptions', 'email_campaigns', 'website_analytics', 'custom_events')
    ORDER BY idx_scan ASC
    LIMIT 5;
    
    -- Check for missing indexes on foreign keys
    RETURN QUERY
    SELECT 
        'Missing FK Indexes'::TEXT,
        'WARNING'::TEXT,
        'Table ' || tc.table_name || ' column ' || kcu.column_name || ' has no index',
        'Consider creating index on ' || kcu.column_name || ' for better performance'
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('users', 'newsletters', 'subscriptions', 'email_campaigns', 'website_analytics', 'custom_events')
    AND NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = tc.table_name 
        AND indexdef ILIKE '%' || kcu.column_name || '%'
    );
    
    -- Check for duplicate indexes
    RETURN QUERY
    SELECT 
        'Duplicate Indexes'::TEXT,
        'INFO'::TEXT,
        'Duplicate index found: ' || indexname,
        'Consider removing duplicate index to save space'
    FROM pg_indexes
    WHERE indexname IN (
        SELECT indexname 
        FROM pg_indexes 
        GROUP BY indexname 
        HAVING COUNT(*) > 1
    );
END;
$$ LANGUAGE plpgsql;

-- Run validation and health checks
SELECT '=== DATA VALIDATION RESULTS ===' AS message;
SELECT * FROM validate_seeded_data();

SELECT '=== DATA SUMMARY ===' AS message;
SELECT * FROM get_data_summary();

SELECT '=== DATABASE HEALTH CHECK ===' AS message;
SELECT * FROM check_database_health();

-- Create final summary report
SELECT '=== PIPER NEWSLETTER SYSTEM - SEEDING COMPLETED ===' AS message;
SELECT 
    'Total Users: ' || COUNT(*)::TEXT || 
    ' (Admins: ' || COUNT(*) FILTER (WHERE user_role = 'admin')::TEXT || 
    ', Premium: ' || COUNT(*) FILTER (WHERE user_role LIKE '%premium%')::TEXT || 
    ')' AS summary
FROM users;

SELECT 
    'Total Newsletters: ' || COUNT(*)::TEXT || 
    ' (Published: ' || COUNT(*) FILTER (WHERE status = 'published')::TEXT || 
    ', Drafts: ' || COUNT(*) FILTER (WHERE status = 'draft')::TEXT || 
    ')' AS summary
FROM newsletters;

SELECT 
    'Total Subscribers: ' || COUNT(*)::TEXT || 
    ' (Active: ' || COUNT(*) FILTER (WHERE subscription_status = 'active')::TEXT || 
    ', Pending: ' || COUNT(*) FILTER (WHERE subscription_status = 'pending')::TEXT || 
    ')' AS summary
FROM subscriptions;

SELECT 
    'Total Email Campaigns: ' || COUNT(*)::TEXT || 
    ' (Completed: ' || COUNT(*) FILTER (WHERE status = 'completed')::TEXT || 
    ', Scheduled: ' || COUNT(*) FILTER (WHERE status = 'scheduled')::TEXT || 
    ')' AS summary
FROM email_campaigns;

SELECT 
    'Total Analytics Records: ' || (SELECT COUNT(*) FROM website_analytics)::TEXT || 
    ', Custom Events: ' || (SELECT COUNT(*) FROM custom_events)::TEXT || 
    ', Email Opens: ' || (SELECT COUNT(*) FROM email_opens)::TEXT || 
    ', Email Clicks: ' || (SELECT COUNT(*) FROM email_clicks)::TEXT AS summary;

SELECT 'Seeding completed successfully! System is ready for testing and development.' AS final_message;