-- Master Seed Script: Piper Newsletter System
-- Description: Runs all seed scripts in the correct order
-- Usage: \i run_all_seeds.sql
-- Created: 2024-01-01

-- Set session parameters for optimal seeding performance
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;
SET session_replication_role = replica; -- Disable triggers for faster inserts

-- Start transaction
BEGIN;

-- Show current database and user
SELECT current_database() AS database_name, current_user AS current_user, now() AS seeding_start_time;

-- Users and core data
\echo 'Seeding users...'
\i 001_seed_users.sql

-- Subscription plans
\echo 'Seeding subscription plans...'
\i 002_seed_subscription_plans.sql

-- Email templates
\echo 'Seeding email templates...'
\i 003_seed_email_templates.sql

-- Sample data
\echo 'Seeding sample data...'
\i 004_seed_sample_data.sql

-- System data
\echo 'Seeding system data...'
\i 005_seed_system_data.sql

-- Analytics data
\echo 'Seeding analytics data...'
\i 006_seed_analytics_data.sql

-- Test data
\echo 'Seeding test data...'
\i 007_seed_test_data.sql

-- Edge cases
\echo 'Seeding edge cases...'
\i 008_seed_edge_cases.sql

-- Performance data
\echo 'Seeding performance data...'
\i 009_seed_performance_data.sql

-- Final cleanup and validation
\echo 'Running final cleanup and validation...'
\i 010_seed_final_cleanup.sql

-- Re-enable triggers and constraints
SET session_replication_role = default;

-- Commit transaction
COMMIT;

-- Show completion summary
SELECT 'SEEDING PROCESS COMPLETED SUCCESSFULLY!' AS status;
SELECT now() AS seeding_end_time;
SELECT age(now(), min(created_at)) AS total_seeding_duration FROM users;

-- Show final statistics
SELECT 
    'Final Statistics:' AS category,
    'Users: ' || (SELECT COUNT(*) FROM users)::TEXT || 
    ' | Newsletters: ' || (SELECT COUNT(*) FROM newsletters)::TEXT || 
    ' | Subscriptions: ' || (SELECT COUNT(*) FROM subscriptions)::TEXT || 
    ' | Campaigns: ' || (SELECT COUNT(*) FROM email_campaigns)::TEXT || 
    ' | Analytics: ' || (SELECT COUNT(*) FROM website_analytics)::TEXT AS details
UNION ALL
SELECT 
    'Database Size:' AS category,
    pg_size_pretty(pg_database_size(current_database())) AS details
UNION ALL
SELECT 
    'Total Tables:' AS category,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::TEXT || ' tables' AS details
UNION ALL
SELECT 
    'Total Indexes:' AS category,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public')::TEXT || ' indexes' AS details;