-- Seed data: Performance Testing and Load Testing Data
-- Created at: 2024-01-01 00:00:00
-- Description: Large datasets for performance testing, load testing, and scalability testing

-- Function to generate bulk performance test data
CREATE OR REPLACE FUNCTION generate_performance_test_data()
RETURNS VOID AS $$
DECLARE
    batch_size INTEGER := 1000;
    total_batches INTEGER := 10;
    i INTEGER;
    j INTEGER;
    start_time TIMESTAMP;
    batch_start_time TIMESTAMP;
    user_batch_start INTEGER;
    newsletter_batch_start INTEGER;
    subscription_batch_start INTEGER;
BEGIN
    start_time := CURRENT_TIMESTAMP;
    RAISE NOTICE 'Starting performance test data generation at %', start_time;
    
    -- Generate bulk users for performance testing
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        user_batch_start := (i-1) * batch_size + 1000; -- Start from 1000 to avoid conflicts with existing data
        
        INSERT INTO users (username, email, password_hash, user_role, status, first_name, last_name, phone, company, job_title, email_verified, two_factor_enabled, created_by)
        SELECT 
            'perf_user_' || (user_batch_start + j),
            'perf.user.' || (user_batch_start + j) || '@performance.test.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
            CASE WHEN j % 10 = 0 THEN 'admin' WHEN j % 5 = 0 THEN 'premium_user' ELSE 'user' END,
            CASE WHEN j % 20 = 0 THEN 'inactive' WHEN j % 15 = 0 THEN 'locked' ELSE 'active' END,
            'Performance' || (user_batch_start + j),
            'User' || (user_batch_start + j),
            '+1-555-' || LPAD((user_batch_start + j)::TEXT, 4, '0'),
            'Performance Test Company ' || (user_batch_start + j),
            CASE WHEN j % 3 = 0 THEN 'Manager' WHEN j % 2 = 0 THEN 'Director' ELSE 'Specialist' END,
            j % 10 != 0,
            j % 5 = 0,
            1
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Batch %/% users completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        -- Small delay to prevent overwhelming the system
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- Generate bulk newsletters for performance testing
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        newsletter_batch_start := (i-1) * batch_size + 100; -- Start from 100 to avoid conflicts
        
        INSERT INTO newsletters (title, content, excerpt, newsletter_type, status, scheduled_at, sender_email, sender_name, reply_to_email, template_used, tags, metadata, created_by)
        SELECT 
            'Performance Test Newsletter ' || (newsletter_batch_start + j) || ' - Bulk Data Generation Test',
            'This is performance test newsletter content for newsletter ' || (newsletter_batch_start + j) || '. ' || repeat('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ', 20),
            'Performance test excerpt for newsletter ' || (newsletter_batch_start + j),
            'performance_test',
            CASE WHEN j % 4 = 0 THEN 'published' WHEN j % 3 = 0 THEN 'scheduled' ELSE 'draft' END,
            CURRENT_TIMESTAMP + INTERVAL '1 day' * (j % 30),
            'perf.sender@performance.test.com',
            'Performance Test Sender',
            'perf.reply@performance.test.com',
            'performance_template_' || (j % 10),
            '["performance_test", "bulk_data", "newsletter_' || (newsletter_batch_start + j) || '"]',
            '{"test_type": "performance", "batch_id": ' || i || ', "item_id": ' || (newsletter_batch_start + j) || '}',
            1
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Batch %/% newsletters completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- Generate bulk subscriptions for performance testing
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        subscription_batch_start := (i-1) * batch_size + 1000; -- Start from 1000 to avoid conflicts
        
        INSERT INTO subscriptions (email, first_name, last_name, phone, company, job_title, industry, country, subscription_status, consent_status, consent_source, consent_date, verification_token, verification_date, preferences, tags, custom_fields, source)
        SELECT 
            'perf.subscriber.' || (subscription_batch_start + j) || '@performance.test.com',
            'Perf' || (subscription_batch_start + j),
            'Subscriber' || (subscription_batch_start + j),
            '+1-555-' || LPAD((subscription_batch_start + j)::TEXT, 4, '0'),
            'Performance Test Company ' || (subscription_batch_start + j),
            CASE WHEN j % 5 = 0 THEN 'Manager' WHEN j % 3 = 0 THEN 'Director' ELSE 'Specialist' END,
            CASE WHEN j % 6 = 0 THEN 'technology' WHEN j % 5 = 0 THEN 'marketing' WHEN j % 4 = 0 THEN 'finance' ELSE 'retail' END,
            CASE WHEN j % 4 = 0 THEN 'United States' WHEN j % 3 = 0 THEN 'United Kingdom' WHEN j % 2 = 0 THEN 'Canada' ELSE 'Australia' END,
            CASE WHEN j % 20 = 0 THEN 'unsubscribed' WHEN j % 15 = 0 THEN 'bounced' WHEN j % 10 = 0 THEN 'pending' ELSE 'active' END,
            CASE WHEN j % 25 = 0 THEN 'withdrawn' WHEN j % 20 = 0 THEN 'pending' ELSE 'granted' END,
            'performance_test',
            CURRENT_TIMESTAMP - INTERVAL '1 day' * (j % 365),
            'perf_verification_token_' || (subscription_batch_start + j),
            CASE WHEN j % 15 != 0 THEN CURRENT_TIMESTAMP - INTERVAL '1 day' * (j % 365) + INTERVAL '1 hour' ELSE NULL END,
            '{"frequency": "' || CASE WHEN j % 3 = 0 THEN 'daily' WHEN j % 2 = 0 THEN 'weekly' ELSE 'monthly' END || '", "categories": ["' || CASE WHEN j % 6 = 0 THEN 'technology' WHEN j % 5 = 0 THEN 'marketing' WHEN j % 4 = 0 THEN 'finance' ELSE 'retail' END || '"], "format": "html"}',
            '["performance_test", "bulk_data", "subscriber_' || (subscription_batch_start + j) || '"]',
            '{"test_type": "performance", "batch_id": ' || i || ', "item_id": ' || (subscription_batch_start + j) || '}',
            'performance_test'
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Batch %/% subscriptions completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    RAISE NOTICE 'Performance test data generation completed in % seconds', EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time));
END;
$$ LANGUAGE plpgsql;

-- Function to generate analytics performance data
CREATE OR REPLACE FUNCTION generate_analytics_performance_data()
RETURNS VOID AS $$
DECLARE
    batch_size INTEGER := 5000;
    total_batches INTEGER := 20;
    i INTEGER;
    j INTEGER;
    start_time TIMESTAMP;
    batch_start_time TIMESTAMP;
    session_batch_start INTEGER;
    event_batch_start INTEGER;
BEGIN
    start_time := CURRENT_TIMESTAMP;
    RAISE NOTICE 'Starting analytics performance data generation at %', start_time;
    
    -- Generate bulk website analytics data
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        session_batch_start := (i-1) * batch_size + 10000; -- Start from 10000 to avoid conflicts
        
        INSERT INTO website_analytics (session_id, user_id, page_url, page_title, referrer, user_agent, device_type, browser, operating_system, country, city, session_duration, bounce_rate, conversion_rate, custom_data)
        SELECT 
            'perf_session_' || (session_batch_start + j) || '_' || CURRENT_TIMESTAMP::TEXT,
            1 + (j % 100), -- Random user ID from 1-100
            'https://perf.pipernewsletter.com/page/' || (j % 100),
            'Performance Test Page ' || (j % 100),
            CASE WHEN j % 3 = 0 THEN 'https://google.com' WHEN j % 2 = 0 THEN 'https://facebook.com' ELSE 'https://twitter.com' END,
            'Mozilla/5.0 (' || CASE WHEN j % 2 = 0 THEN 'Windows NT 10.0; Win64; x64' ELSE 'Macintosh; Intel Mac OS X 10_15_7' END || ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            CASE WHEN j % 3 = 0 THEN 'mobile' WHEN j % 2 = 0 THEN 'desktop' ELSE 'tablet' END,
            'Chrome',
            CASE WHEN j % 3 = 0 THEN 'Windows' WHEN j % 2 = 0 THEN 'macOS' ELSE 'Linux' END,
            CASE WHEN j % 4 = 0 THEN 'United States' WHEN j % 3 = 0 THEN 'United Kingdom' WHEN j % 2 = 0 THEN 'Canada' ELSE 'Australia' END,
            'Test City ' || (j % 50),
            60 + (j % 600), -- 60-660 seconds
            (j % 100)::DECIMAL / 100, -- 0.00-0.99
            (j % 50)::DECIMAL / 100, -- 0.00-0.49
            '{"test_type": "performance", "batch_id": ' || i || ', "item_id": ' || (session_batch_start + j) || ', "load_test": true}'
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Analytics batch %/% sessions completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.05);
    END LOOP;
    
    -- Generate bulk custom events data
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        event_batch_start := (i-1) * batch_size + 50000; -- Start from 50000 to avoid conflicts
        
        INSERT INTO custom_events (event_name, user_id, session_id, properties, timestamp, event_category, event_value, event_label)
        SELECT 
            CASE WHEN j % 5 = 0 THEN 'newsletter_signup' WHEN j % 4 = 0 THEN 'email_open' WHEN j % 3 = 0 THEN 'link_click' WHEN j % 2 = 0 THEN 'page_view' ELSE 'form_submission' END,
            1 + (j % 100), -- Random user ID from 1-100
            'perf_session_' || (event_batch_start + j),
            '{"test_type": "performance", "batch_id": ' || i || ', "item_id": ' || (event_batch_start + j) || ', "performance_test": true}',
            CURRENT_TIMESTAMP - INTERVAL '1 hour' * (j % 168), -- Random time within last week
            CASE WHEN j % 5 = 0 THEN 'engagement' WHEN j % 4 = 0 THEN 'conversion' WHEN j % 3 = 0 THEN 'interaction' ELSE 'navigation' END,
            (j % 1000)::DECIMAL / 10, -- 0.0-100.0
            'Performance Test Event ' || (event_batch_start + j)
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Custom events batch %/% completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.05);
    END LOOP;
    
    RAISE NOTICE 'Analytics performance data generation completed in % seconds', EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time));
END;
$$ LANGUAGE plpgsql;

-- Function to generate email performance data
CREATE OR REPLACE FUNCTION generate_email_performance_data()
RETURNS VOID AS $$
DECLARE
    batch_size INTEGER := 10000;
    total_batches INTEGER := 5;
    i INTEGER;
    j INTEGER;
    start_time TIMESTAMP;
    batch_start_time TIMESTAMP;
    campaign_batch_start INTEGER;
    queue_batch_start INTEGER;
    open_batch_start INTEGER;
    click_batch_start INTEGER;
BEGIN
    start_time := CURRENT_TIMESTAMP;
    RAISE NOTICE 'Starting email performance data generation at %', start_time;
    
    -- Generate bulk email campaigns
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        campaign_batch_start := (i-1) * batch_size + 100; -- Start from 100 to avoid conflicts
        
        INSERT INTO email_campaigns (campaign_name, campaign_type, template_id, target_segment, scheduled_at, status, subject_line, from_name, from_email, reply_to_email, target_audience_size, personalization_enabled, tracking_enabled, created_by)
        SELECT 
            'Performance Email Campaign ' || (campaign_batch_start + j),
            CASE WHEN j % 4 = 0 THEN 'newsletter' WHEN j % 3 = 0 THEN 'promotional' WHEN j % 2 = 0 THEN 'welcome_series' ELSE 'ab_test' END,
            1 + (j % 10), -- Random template ID 1-10
            NULL,
            CURRENT_TIMESTAMP - INTERVAL '1 day' * (j % 30),
            CASE WHEN j % 5 = 0 THEN 'completed' WHEN j % 4 = 0 THEN 'scheduled' WHEN j % 3 = 0 THEN 'running' ELSE 'draft' END,
            'Performance Test Subject ' || (campaign_batch_start + j),
            'Performance Sender',
            'perf.sender@performance.test.com',
            'perf.reply@performance.test.com',
            1000 + (j % 5000), -- 1000-6000
            j % 2 = 0,
            j % 3 != 0,
            1
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Email campaigns batch %/% completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- Generate bulk email queue items
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        queue_batch_start := (i-1) * batch_size + 1000; -- Start from 1000 to avoid conflicts
        
        INSERT INTO email_queue (campaign_id, subscriber_id, newsletter_id, status, scheduled_at, priority, personalization_data, tracking_data)
        SELECT 
            1 + (j % 100), -- Random campaign ID 1-100
            1000 + (j % 5000), -- Random subscriber ID 1000-6000
            1 + (j % 50), -- Random newsletter ID 1-50
            CASE WHEN j % 10 = 0 THEN 'failed' WHEN j % 8 = 0 THEN 'bounced' WHEN j % 6 = 0 THEN 'delivered' WHEN j % 4 = 0 THEN 'sent' ELSE 'pending' END,
            CURRENT_TIMESTAMP - INTERVAL '1 day' * (j % 30),
            CASE WHEN j % 5 = 0 THEN 'high' WHEN j % 3 = 0 THEN 'normal' ELSE 'low' END,
            '{"test_type": "performance", "batch_id": ' || i || ', "item_id": ' || (queue_batch_start + j) || '}',
            '{"tracking_id": "perf_track_' || (queue_batch_start + j) || '", "campaign_source": "performance_test"}'
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Email queue batch %/% completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- Generate bulk email opens
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        open_batch_start := (i-1) * batch_size + 50000; -- Start from 50000 to avoid conflicts
        
        INSERT INTO email_opens (email_id, subscriber_id, opened_at, ip_address, user_agent, device_type, location)
        SELECT 
            1000 + (j % 50000), -- Random email ID 1000-51000
            1000 + (j % 5000), -- Random subscriber ID 1000-6000
            CURRENT_TIMESTAMP - INTERVAL '1 day' * (j % 30),
            '192.168.' || (j % 255) || '.' || (j % 255),
            'Mozilla/5.0 (' || CASE WHEN j % 2 = 0 THEN 'Windows NT 10.0; Win64; x64' ELSE 'Macintosh; Intel Mac OS X 10_15_7' END || ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            CASE WHEN j % 3 = 0 THEN 'mobile' WHEN j % 2 = 0 THEN 'desktop' ELSE 'tablet' END,
            'Test City ' || (j % 100) || ', Country'
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Email opens batch %/% completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- Generate bulk email clicks
    FOR i IN 1..total_batches LOOP
        batch_start_time := CURRENT_TIMESTAMP;
        click_batch_start := (i-1) * batch_size + 100000; -- Start from 100000 to avoid conflicts
        
        INSERT INTO email_clicks (email_id, subscriber_id, clicked_at, link_url, link_text, ip_address, user_agent)
        SELECT 
            1000 + (j % 50000), -- Random email ID 1000-51000
            1000 + (j % 5000), -- Random subscriber ID 1000-6000
            CURRENT_TIMESTAMP - INTERVAL '1 day' * (j % 30),
            'https://perf.pipernewsletter.com/link/' || (j % 100),
            'Performance Test Link ' || (j % 100),
            '192.168.' || (j % 255) || '.' || (j % 255),
            'Mozilla/5.0 (' || CASE WHEN j % 2 = 0 THEN 'Windows NT 10.0; Win64; x64' ELSE 'Macintosh; Intel Mac OS X 10_15_7' END || ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        FROM generate_series(1, batch_size) j;
        
        RAISE NOTICE 'Email clicks batch %/% completed in % seconds', i, total_batches, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - batch_start_time));
        
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    RAISE NOTICE 'Email performance data generation completed in % seconds', EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time));
END;
$$ LANGUAGE plpgsql;

-- Generate performance test data
SELECT generate_performance_test_data();
SELECT generate_analytics_performance_data();
SELECT generate_email_performance_data();

-- Update sequences after bulk inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('newsletters_id_seq', (SELECT MAX(id) FROM newsletters));
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));
SELECT setval('email_campaigns_id_seq', (SELECT MAX(id) FROM email_campaigns));
SELECT setval('email_queue_id_seq', (SELECT MAX(id) FROM email_queue));
SELECT setval('email_opens_id_seq', (SELECT MAX(id) FROM email_opens));
SELECT setval('email_clicks_id_seq', (SELECT MAX(id) FROM email_clicks));
SELECT setval('website_analytics_id_seq', (SELECT MAX(id) FROM website_analytics));
SELECT setval('custom_events_id_seq', (SELECT MAX(id) FROM custom_events));