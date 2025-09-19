-- Seed data: Edge Cases and Boundary Testing Data
-- Created at: 2024-01-01 00:00:00
-- Description: Edge cases, boundary conditions, and stress testing data

-- Insert users with edge case scenarios
INSERT INTO users (username, email, password_hash, user_role, status, first_name, last_name, phone, company, job_title, email_verified, two_factor_enabled, created_by)
VALUES 
(
    'edge_case_user_very_long_username_that_exceeds_normal_limits',
    'edge.case.user.with.very.long.email.address@very.long.domain.name.example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'user',
    'active',
    'Edge',
    'Case-User-With-Very-Long-Name-That-Tests-Boundary-Conditions',
    '+1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
    'Edge Case Company With Very Long Name That Tests Database Field Limits And Boundary Conditions',
    'Senior Vice President of Edge Case Testing and Quality Assurance Department',
    true,
    true,
    1
),
(
    'unicode_user_测试',
    'unicode.用户@测试.公司.中国',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'user',
    'active',
    '测试',
    '用户',
    '+86-138-0013-8000',
    '测试公司',
    '测试经理',
    true,
    false,
    1
),
(
    'special_chars_user!@#$%^&*()',
    'special.chars+test.email@subdomain.example-domain.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'user',
    'active',
    'Special',
    'Chars-User!@#$%^&*()',
    '+1-800-TEST-NUMBER',
    'Special Chars & Co. Ltd.',
    'Special Characters Testing Specialist (Level 5)',
    true,
    true,
    1
),
(
    'null_fields_user',
    'null.fields@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'user',
    'active',
    'Null',
    'Fields',
    NULL,
    NULL,
    NULL,
    false,
    false,
    1
),
(
    'empty_strings_user',
    'empty.strings@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G',
    'user',
    'active',
    '',
    '',
    '',
    '',
    '',
    true,
    false,
    1
);

-- Insert newsletters with edge case content
INSERT INTO newsletters (title, content, excerpt, newsletter_type, status, scheduled_at, sender_email, sender_name, reply_to_email, template_used, tags, metadata, created_by)
VALUES 
(
    'Edge Case Newsletter with Extremely Long Title That Tests Database Field Limits and Content Management System Handling of Very Long Titles',
    'This newsletter contains extremely long content that tests the system''s ability to handle large text fields. ' || repeat('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ', 500) || ' End of test content.',
    'Extremely long excerpt that tests the system''s handling of very long text in the excerpt field. ' || repeat('Testing excerpt length. ', 50),
    'edge_case',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '1 year',
    'edge.case.newsletter@very.long.domain.name.example.com',
    'Edge Case Newsletter Sender With Very Long Name',
    'edge.case.reply@very.long.domain.name.example.com',
    'edge_case_template_with_very_long_name_that_tests_template_handling',
    '["edge_case", "long_content", "stress_test", "boundary_testing"]',
    '{"test_type": "edge_case", "content_length": "extreme", "character_encoding": "utf8", "special_chars": "!@#$%^&*()_+-=[]{}|;:,.<>?"}',
    1
),
(
    'Unicode Newsletter 测试',
    'This newsletter contains various Unicode characters: 你好世界 🌍 مرحبا بالعالم שלום עולם Привет мир. Testing internationalization and character encoding support.',
    'Testing Unicode support and international characters in newsletter content.',
    'unicode_test',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'unicode@测试.公司.中国',
    'Unicode Newsletter Sender 测试',
    'unicode.reply@测试.公司.中国',
    'unicode_template_测试',
    '["unicode", "international", "encoding_test"]',
    '{"languages": ["chinese", "arabic", "hebrew", "russian"], "encoding": "utf8mb4", "special_chars": "🌍🎉✨"}',
    1
),
(
    'Special Characters Newsletter !@#$%^&*()',
    'Testing special characters and HTML entities: <script>alert("XSS Test");</script> &lt;script&gt;alert(&quot;HTML Entity Test&quot;);&lt;/script&gt; <b>Bold</b> <i>Italic</i> <u>Underline</u> <a href="javascript:alert('XSS')">Click me</a>',
    'Testing special characters, HTML entities, and potential XSS vectors.',
    'special_chars_test',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '60 days',
    'special.chars+newsletter@subdomain.example-domain.com',
    'Special Chars Newsletter !@#$%^&*()',
    'special.chars+reply@subdomain.example-domain.com',
    'special_chars_template_!@#$%^&*()',
    '["special_chars", "html_test", "security_test", "xss_test"]',
    '{"security_test": true, "html_entities": true, "xss_protection": "enabled", "sanitization": "required"}',
    1
),
(
    'Empty Content Newsletter',
    '',
    '',
    'empty_test',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '90 days',
    'empty@example.com',
    'Empty Newsletter Sender',
    'empty.reply@example.com',
    'empty_template',
    '["empty", "boundary_test"]',
    '{"content_length": 0, "test_type": "empty_content"}',
    1
),
(
    'Maximum Tags Newsletter',
    'This newsletter tests the maximum number of tags that can be associated with a single newsletter.',
    'Testing tag limits and system boundaries.',
    'max_tags_test',
    'draft',
    CURRENT_TIMESTAMP + INTERVAL '120 days',
    'max.tags@example.com',
    'Max Tags Sender',
    'max.tags.reply@example.com',
    'max_tags_template',
    '["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13", "tag14", "tag15", "tag16", "tag17", "tag18", "tag19", "tag20", "tag21", "tag22", "tag23", "tag24", "tag25", "tag26", "tag27", "tag28", "tag29", "tag30", "max_tags", "boundary_test", "system_limits"]',
    '{"tag_count": 33, "test_type": "maximum_tags", "system_limits": "tested"}',
    1
);

-- Insert subscriptions with edge case data
INSERT INTO subscriptions (email, first_name, last_name, phone, company, job_title, industry, country, subscription_status, consent_status, consent_source, consent_date, verification_token, verification_date, preferences, tags, custom_fields, source)
VALUES 
(
    'edge.case.very.long.email.address@very.long.domain.name.example.com',
    'Edge',
    'Case-Subscriber-With-Very-Long-Name',
    '+1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
    'Edge Case Company With Very Long Name That Tests Database Field Limits And Boundary Conditions',
    'Senior Vice President of Edge Case Testing and Quality Assurance Department',
    'technology',
    'United States of America - Testing Very Long Country Names',
    'active',
    'granted',
    'edge_case_signup',
    CURRENT_TIMESTAMP - INTERVAL '1 year',
    'edge_case_verification_token_very_long_and_complex_1234567890abcdefghijklmnopqrstuvwxyz',
    CURRENT_TIMESTAMP - INTERVAL '1 year' + INTERVAL '1 day',
    '{"frequency": "custom", "categories": ["edge_case", "boundary_testing", "system_limits"], "format": "html", "timezone": "UTC+14:00"}',
    '["edge_case", "long_data", "boundary_testing", "system_limits", "stress_test"]',
    '{"test_type": "edge_case", "data_length": "extreme", "character_encoding": "utf8", "special_requirements": "none"}',
    'edge_case'
),
(
    'unicode.subscriber@测试.公司.中国',
    '测试',
    '用户',
    '+86-138-0013-8000-1234-5678-9012-3456',
    '测试公司 - 边界测试部门',
    '测试经理 - 边缘案例处理专家',
    'technology',
    '中华人民共和国',
    'active',
    'granted',
    'unicode_signup',
    CURRENT_TIMESTAMP - INTERVAL '6 months',
    'unicode_verification_token_测试_用户_验证_令牌_1234567890',
    CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '1 hour',
    '{"frequency": "daily", "categories": ["unicode", "international", "chinese"], "format": "html", "language": "zh-CN"}',
    '["unicode", "chinese", "international", "edge_case", "encoding_test"]',
    '{"language": "chinese", "encoding": "utf8mb4", "timezone": "Asia/Shanghai", "cultural_preferences": "chinese"}',
    'unicode'
),
(
    'special.chars+test!@#$%^&*()@subdomain.example-domain.com',
    'Special',
    'Chars-Subscriber!@#$%^&*()',
    '+1-800-SPECIAL-NUMBER-THAT-TESTS-PHONE-FIELD-LIMITS',
    'Special Chars & Co. Ltd. - Testing Department !@#$%^&*()',
    'Special Characters Testing Specialist (Level 5) - Edge Case Handler',
    'marketing',
    'United States',
    'pending',
    'pending',
    'special_chars_signup',
    CURRENT_TIMESTAMP - INTERVAL '3 months',
    'special_chars_verification_token_!@#$%^&*()_1234567890_abcdefghijklmnopqrstuvwxyz',
    NULL,
    '{"frequency": "weekly", "categories": ["special_chars", "testing", "marketing"], "format": "html", "special_requirements": "handle_special_characters"}',
    '["special_chars", "testing", "edge_case", "boundary_testing"]',
    '{"test_type": "special_characters", "character_set": "extended", "encoding": "utf8", "special_handling": "required"}',
    'special_chars'
),
(
    'null.fields@example.com',
    'Null',
    'Fields',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'active',
    'granted',
    'null_fields_signup',
    CURRENT_TIMESTAMP - INTERVAL '2 months',
    'null_fields_verification_token_1234567890',
    CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '2 hours',
    '{}',
    '["null_fields", "boundary_test"]',
    '{}',
    'null_fields'
),
(
    'empty.strings@example.com',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'active',
    'granted',
    'empty_strings_signup',
    CURRENT_TIMESTAMP - INTERVAL '1 month',
    'empty_strings_verification_token_1234567890',
    CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '30 minutes',
    '{"frequency": "", "categories": [], "format": ""}',
    '["empty_strings", "boundary_test"]',
    '{}',
    'empty_strings'
);

-- Insert email campaigns with edge cases
INSERT INTO email_campaigns (campaign_name, campaign_type, template_id, target_segment, scheduled_at, status, subject_line, from_name, from_email, reply_to_email, target_audience_size, personalization_enabled, tracking_enabled, created_by)
VALUES 
(
    'Edge Case Campaign with Extremely Long Name That Tests Database Field Limits and Campaign Management System Handling of Very Long Campaign Names',
    'edge_case_test',
    1,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '1 year',
    'draft',
    'Edge Case Subject Line That Is Extremely Long and Tests Email Subject Line Length Limits and System Handling of Very Long Subject Lines',
    'Edge Case Campaign Sender With Very Long Name That Tests From Name Field Limits',
    'edge.case.campaign@very.long.domain.name.example.com',
    'edge.case.reply@very.long.domain.name.example.com',
    999999,
    true,
    true,
    1
),
(
    'Unicode Campaign 测试',
    'unicode_test',
    2,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '6 months',
    'draft',
    'Unicode Subject 测试 - Testing International Characters in Email Subject Lines',
    'Unicode Campaign Sender 测试',
    'unicode.campaign@测试.公司.中国',
    'unicode.reply@测试.公司.中国',
    50000,
    true,
    true,
    1
),
(
    'Special Characters Campaign !@#$%^&*()',
    'special_chars_test',
    3,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '3 months',
    'draft',
    'Special Characters Subject !@#$%^&*() - Testing Special Characters in Subject Lines',
    'Special Chars Campaign Sender !@#$%^&*()',
    'special.chars.campaign+test@subdomain.example-domain.com',
    'special.chars.reply+test@subdomain.example-domain.com',
    25000,
    true,
    true,
    1
),
(
    'Empty Fields Campaign',
    'empty_test',
    4,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '2 months',
    'draft',
    '',
    '',
    'empty.campaign@example.com',
    'empty.reply@example.com',
    0,
    false,
    false,
    1
),
(
    'Maximum Values Campaign',
    'max_values_test',
    5,
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '1 month',
    'draft',
    'Maximum Values Test - Testing System Limits and Boundary Conditions',
    'Max Values Sender',
    'max.values@example.com',
    'max.values.reply@example.com',
    2147483647,
    true,
    true,
    1
);

-- Insert test data for stress testing
INSERT INTO website_analytics (session_id, user_id, page_url, page_title, referrer, user_agent, device_type, browser, operating_system, country, city, session_duration, bounce_rate, conversion_rate, custom_data)
VALUES 
(
    'stress_test_session_001',
    11,
    'https://stress.test.pipernewsletter.com/very/long/url/path/that/tests/url/length/limits/and/system/handling/of/extremely/long/urls/in/the/database/and/analytics/system',
    'Stress Test Page Title That Is Extremely Long and Tests System Handling of Very Long Page Titles in Analytics Data',
    'https://referrer.test.com/very/long/referrer/url/that/tests/referrer/length/limits/and/system/handling/of/extremely/long/referrer/urls',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Test User Agent String That Is Extremely Long and Tests User Agent Field Limits in Database',
    'desktop',
    'Chrome',
    'Windows 10 Pro 64-bit Version 21H1 Build 19043.1083',
    'United States of America',
    'San Francisco, California, USA',
    999999,
    0.0,
    99.9,
    '{"stress_test": true, "data_size": "extreme", "test_type": "boundary_conditions", "special_chars": "!@#$%^&*()_+-=[]{}|;:,.<>?/~`"}'
),
(
    'unicode_session_测试',
    12,
    'https://unicode.test.pipernewsletter.com/测试/路径/中文',
    'Unicode Test Page 测试页面',
    'https://unicode.referrer.com/测试/来源',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Unicode Test 测试用户代理',
    'mobile',
    'Chrome',
    'macOS Big Sur Version 11.4',
    '中华人民共和国',
    '北京',
    3600,
    25.5,
    15.2,
    '{"unicode_test": true, "languages": ["chinese", "english"], "encoding": "utf8mb4", "special_chars": "测试中文🌍"}'
);

-- Insert custom events with edge cases
INSERT INTO custom_events (event_name, user_id, session_id, properties, timestamp, event_category, event_value, event_label)
VALUES 
(
    'edge_case_event_with_extremely_long_event_name_that_tests_event_name_field_limits_and_system_handling_of_very_long_event_names_in_analytics_system',
    11,
    'stress_test_session_001',
    '{"very_long_property": "' || repeat('This is a very long property value that tests the system''s ability to handle large JSON objects in custom event properties. ', 100) || '", "nested_object": {"deep": {"very": {"deeply": {"nested": {"property": "value"}}}}}, "array_with_many_items": [' || repeat('"item",', 50) || '"last_item"]}',
    CURRENT_TIMESTAMP,
    'edge_case_test',
    999999999.999999,
    'Edge case event label that is extremely long and tests the system''s handling of very long event labels in analytics data'
),
(
    'unicode_event_测试',
    12,
    'unicode_session_测试',
    '{"中文属性": "测试值", "mixed_language": "Testing mixed 中文 and English content", "emoji_test": "🌍🎉✨🚀💻📊", "unicode_categories": ["测试", "中文", "国际化"]}',
    CURRENT_TIMESTAMP,
    'unicode_test',
    42.0,
    'Unicode test event 测试事件'
),
(
    'special_chars_event!@#$%^&*()',
    13,
    'special_chars_session',
    '{"special_chars": "!@#$%^&*()_+-=[]{}|;:,.<>?/~`", "html_entities": "&lt;script&gt;alert(&quot;test&quot;);&lt;/script&gt;", "potential_xss": "<script>alert(\'test\');</script>", "sql_injection": "\'; DROP TABLE users; --"}',
    CURRENT_TIMESTAMP,
    'security_test',
    0.0,
    'Special chars event !@#$%^&*() - testing security handling'
);

-- Update sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('newsletters_id_seq', (SELECT MAX(id) FROM newsletters));
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));
SELECT setval('email_campaigns_id_seq', (SELECT MAX(id) FROM email_campaigns));
SELECT setval('website_analytics_id_seq', (SELECT MAX(id) FROM website_analytics));
SELECT setval('custom_events_id_seq', (SELECT MAX(id) FROM custom_events));