-- Seed data: Users
-- Created at: 2024-01-01 00:00:00
-- Description: Seed data for users table with sample data and default admin user

-- Insert default admin user
INSERT INTO users (
    username, email, password_hash, first_name, last_name, role, 
    email_verified, phone_verified, two_factor_enabled, is_active, 
    preferences, metadata
) VALUES (
    'admin',
    'admin@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- password: admin123
    'System',
    'Administrator',
    'admin',
    true,
    true,
    true,
    true,
    '{"theme": "dark", "language": "en", "timezone": "UTC", "notifications": {"email": true, "sms": false, "push": true}}',
    '{"department": "IT", "employee_id": "ADMIN001", "created_by": "system"}'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (
    username, email, password_hash, first_name, last_name, role, 
    email_verified, phone_verified, two_factor_enabled, is_active, 
    preferences, metadata
) VALUES 
(
    'john_doe',
    'john.doe@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'John',
    'Doe',
    'user',
    true,
    false,
    false,
    true,
    '{"theme": "light", "language": "en", "timezone": "America/New_York", "notifications": {"email": true, "sms": true, "push": false}}',
    '{"subscription_tier": "premium", "signup_source": "website", "created_by": "admin"}'
),
(
    'jane_smith',
    'jane.smith@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Jane',
    'Smith',
    'user',
    true,
    true,
    true,
    true,
    '{"theme": "dark", "language": "en", "timezone": "Europe/London", "notifications": {"email": true, "sms": false, "push": true}}',
    '{"subscription_tier": "basic", "signup_source": "mobile_app", "created_by": "admin"}'
),
(
    'mike_johnson',
    'mike.johnson@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Mike',
    'Johnson',
    'user',
    false,
    false,
    false,
    true,
    '{"theme": "auto", "language": "en", "timezone": "America/Chicago", "notifications": {"email": false, "sms": false, "push": true}}',
    '{"subscription_tier": "free", "signup_source": "referral", "created_by": "admin"}'
),
(
    'sarah_williams',
    'sarah.williams@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Sarah',
    'Williams',
    'user',
    true,
    true,
    false,
    false,
    '{"theme": "light", "language": "en", "timezone": "America/Los_Angeles", "notifications": {"email": true, "sms": true, "push": true}}',
    '{"subscription_tier": "premium", "signup_source": "social_media", "created_by": "admin"}'
),
(
    'david_brown',
    'david.brown@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'David',
    'Brown',
    'user',
    true,
    false,
    true,
    true,
    '{"theme": "dark", "language": "en", "timezone": "Europe/Berlin", "notifications": {"email": true, "sms": false, "push": false}}',
    '{"subscription_tier": "basic", "signup_source": "website", "created_by": "admin"}'
),
(
    'emma_davis',
    'emma.davis@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Emma',
    'Davis',
    'user',
    false,
    false,
    false,
    true,
    '{"theme": "light", "language": "en", "timezone": "Asia/Tokyo", "notifications": {"email": true, "sms": true, "push": true}}',
    '{"subscription_tier": "free", "signup_source": "mobile_app", "created_by": "admin"}'
),
(
    'alex_miller',
    'alex.miller@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Alex',
    'Miller',
    'user',
    true,
    true,
    false,
    true,
    '{"theme": "dark", "language": "en", "timezone": "Australia/Sydney", "notifications": {"email": true, "sms": false, "push": true}}',
    '{"subscription_tier": "premium", "signup_source": "website", "created_by": "admin"}'
),
(
    'lisa_wilson',
    'lisa.wilson@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Lisa',
    'Wilson',
    'user',
    true,
    false,
    true,
    true,
    '{"theme": "auto", "language": "en", "timezone": "America/Toronto", "notifications": {"email": true, "sms": true, "push": false}}',
    '{"subscription_tier": "basic", "signup_source": "referral", "created_by": "admin"}'
),
(
    'tom_anderson',
    'tom.anderson@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Tom',
    'Anderson',
    'user',
    false,
    false,
    false,
    true,
    '{"theme": "light", "language": "en", "timezone": "America/Denver", "notifications": {"email": false, "sms": false, "push": true}}',
    '{"subscription_tier": "free", "signup_source": "social_media", "created_by": "admin"}'
),
(
    'rachel_taylor',
    'rachel.taylor@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Rachel',
    'Taylor',
    'user',
    true,
    true,
    false,
    true,
    '{"theme": "dark", "language": "en", "timezone": "Europe/Paris", "notifications": {"email": true, "sms": false, "push": true}}',
    '{"subscription_tier": "premium", "signup_source": "website", "created_by": "admin"}'
);

-- Insert additional admin users
INSERT INTO users (
    username, email, password_hash, first_name, last_name, role, 
    email_verified, phone_verified, two_factor_enabled, is_active, 
    preferences, metadata
) VALUES 
(
    'content_manager',
    'content@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Content',
    'Manager',
    'editor',
    true,
    false,
    true,
    true,
    '{"theme": "dark", "language": "en", "timezone": "UTC", "notifications": {"email": true, "sms": false, "push": true}}',
    '{"department": "Content", "employee_id": "CONTENT001", "created_by": "system"}'
),
(
    'support_agent',
    'support@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Support',
    'Agent',
    'support',
    true,
    false,
    false,
    true,
    '{"theme": "light", "language": "en", "timezone": "UTC", "notifications": {"email": true, "sms": true, "push": false}}',
    '{"department": "Support", "employee_id": "SUPPORT001", "created_by": "system"}'
),
(
    'billing_manager',
    'billing@pipernewsletter.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'Billing',
    'Manager',
    'billing',
    true,
    true,
    true,
    true,
    '{"theme": "auto", "language": "en", "timezone": "UTC", "notifications": {"email": true, "sms": false, "push": true}}',
    '{"department": "Billing", "employee_id": "BILLING001", "created_by": "system"}'
);

-- Update sequences to start from a higher number
SELECT setval('users_id_seq', 1000);

-- Create function to generate more sample users
CREATE OR REPLACE FUNCTION generate_sample_users(count INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    first_names TEXT[] := ARRAY['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    roles TEXT[] := ARRAY['user', 'user', 'user', 'user', 'editor'];
    themes TEXT[] := ARRAY['light', 'dark', 'auto'];
    timezones TEXT[] := ARRAY['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];
    sources TEXT[] := ARRAY['website', 'mobile_app', 'social_media', 'referral'];
    tiers TEXT[] := ARRAY['free', 'basic', 'premium'];
BEGIN
    FOR i IN 1..count LOOP
        INSERT INTO users (
            username, email, password_hash, first_name, last_name, role, 
            email_verified, phone_verified, two_factor_enabled, is_active, 
            preferences, metadata
        ) VALUES (
            LOWER(REPLACE(first_names[1 + (i % array_length(first_names, 1))] || '_' || last_names[1 + (i % array_length(last_names, 1))], ' ', '_')) || '_' || i,
            LOWER(first_names[1 + (i % array_length(first_names, 1))] || '.' || last_names[1 + (i % array_length(last_names, 1))] || i || '@example.com'),
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
            first_names[1 + (i % array_length(first_names, 1))],
            last_names[1 + (i % array_length(last_names, 1))],
            roles[1 + (i % array_length(roles, 1))],
            CASE WHEN i % 3 = 0 THEN false ELSE true END,
            CASE WHEN i % 2 = 0 THEN true ELSE false END,
            CASE WHEN i % 4 = 0 THEN true ELSE false END,
            true,
            jsonb_build_object(
                'theme', themes[1 + (i % array_length(themes, 1))],
                'language', 'en',
                'timezone', timezones[1 + (i % array_length(timezones, 1))],
                'notifications', jsonb_build_object('email', CASE WHEN i % 5 = 0 THEN false ELSE true END, 'sms', CASE WHEN i % 3 = 0 THEN true ELSE false END, 'push', CASE WHEN i % 2 = 0 THEN true ELSE false END)
            ),
            jsonb_build_object(
                'subscription_tier', tiers[1 + (i % array_length(tiers, 1))],
                'signup_source', sources[1 + (i % array_length(sources, 1))],
                'created_by', 'system'
            )
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate additional sample users
SELECT generate_sample_users(50);