-- Seed data: Email Templates
-- Created at: 2024-01-01 00:00:00
-- Description: Seed data for email templates including newsletter templates, system emails, and marketing templates

-- Insert email templates
INSERT INTO email_templates (
    template_name, template_key, template_type, subject_line, html_content, text_content, template_variables,
    category, industry, is_active, is_editable, thumbnail_url, preview_url, description, tags, created_by
) VALUES 
(
    'Welcome Newsletter',
    'welcome_newsletter',
    'newsletter',
    'Welcome to {{company_name}} Newsletter!',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Newsletter</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to {{company_name}}!</h1>
        <p>Thank you for subscribing to our newsletter</p>
    </div>
    <div class="content">
        <h2>Hello {{first_name}}!</h2>
        <p>We\'re thrilled to have you join our community of {{subscriber_count}} subscribers.</p>
        <p>Here\'s what you can expect from us:</p>
        <ul>
            <li>Weekly insights and tips</li>
            <li>Exclusive content and offers</li>
            <li>Industry news and updates</li>
        </ul>
        <a href="{{website_url}}" class="button">Visit Our Website</a>
        <p>If you have any questions, feel free to reach out to us at {{support_email}}.</p>
        <p>Best regards,<br>{{company_name}} Team</p>
    </div>
    <div class="footer">
        <p>You received this email because you subscribed to {{company_name}} newsletter.</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a></p>
    </div>
</body>
</html>',
    'Welcome to {{company_name}} Newsletter!\n\nHello {{first_name}}!\n\nWe\'re thrilled to have you join our community of {{subscriber_count}} subscribers.\n\nHere\'s what you can expect from us:\n- Weekly insights and tips\n- Exclusive content and offers\n- Industry news and updates\n\nVisit our website: {{website_url}}\n\nIf you have any questions, feel free to reach out to us at {{support_email}}.\n\nBest regards,\n{{company_name}} Team\n\n---\nYou received this email because you subscribed to {{company_name}} newsletter.\nUnsubscribe: {{unsubscribe_url}}\nUpdate Preferences: {{preferences_url}}',
    '["company_name", "first_name", "subscriber_count", "website_url", "support_email", "unsubscribe_url", "preferences_url"]',
    'newsletter',
    'general',
    true,
    true,
    '/templates/thumbnails/welcome_newsletter.jpg',
    '/templates/preview/welcome_newsletter',
    'A warm welcome template for new newsletter subscribers',
    '["welcome", "newsletter", "onboarding", "engagement"]',
    1
),
(
    'Weekly Digest',
    'weekly_digest',
    'newsletter',
    'Your Weekly Digest - {{week_date}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Digest</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .article { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #dee2e6; }
        .article:last-child { border-bottom: none; }
        .article-title { color: #007bff; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .article-summary { color: #6c757d; margin-bottom: 15px; }
        .read-more { color: #28a745; text-decoration: none; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Weekly Digest</h1>
        <p>{{week_date}}</p>
    </div>
    <div class="content">
        <p>Hello {{first_name}},</p>
        <p>Here are the top stories from this week:</p>
        
        {{#each articles}}
        <div class="article">
            <div class="article-title">{{title}}</div>
            <div class="article-summary">{{summary}}</div>
            <a href="{{url}}" class="read-more">Read more →</a>
        </div>
        {{/each}}
        
        <p>Thank you for reading! We\'ll be back next week with more updates.</p>
        <p>Best regards,<br>{{company_name}} Team</p>
    </div>
    <div class="footer">
        <p>You received this email because you subscribed to {{company_name}} newsletter.</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a></p>
    </div>
</body>
</html>',
    'Your Weekly Digest - {{week_date}}\n\nHello {{first_name}},\n\nHere are the top stories from this week:\n\n{{#each articles}}
{{title}}\n{{summary}}\nRead more: {{url}}\n\n{{/each}}\n\nThank you for reading! We\'ll be back next week with more updates.\n\nBest regards,\n{{company_name}} Team\n\n---\nYou received this email because you subscribed to {{company_name}} newsletter.\nUnsubscribe: {{unsubscribe_url}}\nUpdate Preferences: {{preferences_url}}',
    '["company_name", "first_name", "week_date", "articles", "unsubscribe_url", "preferences_url"]',
    'newsletter',
    'general',
    true,
    true,
    '/templates/thumbnails/weekly_digest.jpg',
    '/templates/preview/weekly_digest',
    'A clean and organized weekly digest template',
    '["weekly", "digest", "news", "content"]',
    1
),
(
    'Promotional Offer',
    'promotional_offer',
    'marketing',
    '🎉 Special Offer: {{offer_title}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Special Offer</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b, #ff8e8e); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .offer-box { background-color: #fff; border: 2px solid #ff6b6b; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
        .discount { font-size: 36px; font-weight: bold; color: #ff6b6b; margin: 10px 0; }
        .button { display: inline-block; background-color: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .urgency { background-color: #ffc107; color: #212529; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Special Offer Just for You!</h1>
        <p>Don\'t miss out on this exclusive deal</p>
    </div>
    <div class="content">
        <p>Hello {{first_name}},</p>
        
        <div class="offer-box">
            <h2>{{offer_title}}</h2>
            <div class="discount">{{discount_percentage}}% OFF</div>
            <p>{{offer_description}}</p>
            <p><strong>Use code:</strong> {{promo_code}}</p>
        </div>
        
        <div class="urgency">
            ⏰ Hurry! This offer expires in {{days_left}} days
        </div>
        
        <a href="{{offer_url}}" class="button">Claim Your Discount Now</a>
        
        <p>{{additional_details}}</p>
        
        <p>Don\'t wait - this offer won\'t last long!</p>
        <p>Best regards,<br>{{company_name}} Team</p>
    </div>
    <div class="footer">
        <p>You received this email because you\'re a valued customer of {{company_name}}.</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a></p>
    </div>
</body>
</html>',
    '🎉 Special Offer: {{offer_title}}\n\nHello {{first_name}},\n\n🎁 {{offer_title}}\n{{discount_percentage}}% OFF\n\n{{offer_description}}\n\nUse code: {{promo_code}}\n\n⏰ Hurry! This offer expires in {{days_left}} days\n\nClaim your discount: {{offer_url}}\n\n{{additional_details}}\n\nDon\'t wait - this offer won\'t last long!\n\nBest regards,\n{{company_name}} Team\n\n---\nYou received this email because you\'re a valued customer of {{company_name}}.\nUnsubscribe: {{unsubscribe_url}}\nUpdate Preferences: {{preferences_url}}',
    '["company_name", "first_name", "offer_title", "discount_percentage", "offer_description", "promo_code", "days_left", "offer_url", "additional_details", "unsubscribe_url", "preferences_url"]',
    'marketing',
    'retail',
    true,
    true,
    '/templates/thumbnails/promotional_offer.jpg',
    '/templates/preview/promotional_offer',
    'An eye-catching promotional offer template with urgency elements',
    '["promotional", "offer", "discount", "marketing", "sales"]',
    1
),
(
    'Event Invitation',
    'event_invitation',
    'event',
    'You\'re Invited: {{event_title}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Invitation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-details { background-color: #fff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
        .detail-item { margin-bottom: 15px; }
        .detail-label { font-weight: bold; color: #667eea; }
        .button { display: inline-block; background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .calendar-link { color: #28a745; text-decoration: none; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 You\'re Invited!</h1>
        <p>We\'d love for you to join us</p>
    </div>
    <div class="content">
        <p>Hello {{first_name}},</p>
        
        <p>You\'re cordially invited to attend:</p>
        
        <div class="event-details">
            <h2>{{event_title}}</h2>
            <div class="detail-item">
                <span class="detail-label">📅 Date:</span> {{event_date}}
            </div>
            <div class="detail-item">
                <span class="detail-label">🕐 Time:</span> {{event_time}}
            </div>
            <div class="detail-item">
                <span class="detail-label">📍 Location:</span> {{event_location}}
            </div>
            <div class="detail-item">
                <span class="detail-label">🎯 Duration:</span> {{event_duration}}
            </div>
            <div class="detail-item">
                <span class="detail-label">👥 Capacity:</span> {{capacity}} attendees
            </div>
        </div>
        
        <p><strong>About the event:</strong></p>
        <p>{{event_description}}</p>
        
        <a href="{{rsvp_url}}" class="button">RSVP Now</a>
        
        <p><a href="{{calendar_url}}" class="calendar-link">📅 Add to Calendar</a></p>
        
        <p>We hope to see you there!</p>
        <p>Best regards,<br>{{company_name}} Team</p>
    </div>
    <div class="footer">
        <p>You received this email because you\'re subscribed to {{company_name}} event notifications.</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a></p>
    </div>
</body>
</html>',
    'You\'re Invited: {{event_title}}\n\nHello {{first_name}},\n\nYou\'re cordially invited to attend:\n\n{{event_title}}\n\n📅 Date: {{event_date}}\n🕐 Time: {{event_time}}\n📍 Location: {{event_location}}\n🎯 Duration: {{event_duration}}\n👥 Capacity: {{capacity}} attendees\n\nAbout the event:\n{{event_description}}\n\nRSVP: {{rsvp_url}}\n\nAdd to Calendar: {{calendar_url}}\n\nWe hope to see you there!\n\nBest regards,\n{{company_name}} Team\n\n---\nYou received this email because you\'re subscribed to {{company_name}} event notifications.\nUnsubscribe: {{unsubscribe_url}}\nUpdate Preferences: {{preferences_url}}',
    '["company_name", "first_name", "event_title", "event_date", "event_time", "event_location", "event_duration", "capacity", "event_description", "rsvp_url", "calendar_url", "unsubscribe_url", "preferences_url"]',
    'event',
    'general',
    true,
    true,
    '/templates/thumbnails/event_invitation.jpg',
    '/templates/preview/event_invitation',
    'An elegant event invitation template with all necessary details',
    '["event", "invitation", "rsvp", "calendar"]',
    1
),
(
    'Abandoned Cart Reminder',
    'abandoned_cart_reminder',
    'transactional',
    'Don\'t forget your items! Complete your purchase',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Purchase</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #fd7e14; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .cart-items { background-color: #fff; border: 1px solid #dee2e6; border-radius: 5px; padding: 20px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #dee2e6; }
        .item:last-child { border-bottom: none; }
        .item-name { font-weight: bold; }
        .item-price { color: #28a745; font-weight: bold; }
        .total { text-align: right; font-size: 18px; font-weight: bold; color: #28a745; margin-top: 15px; }
        .button { display: inline-block; background-color: #fd7e14; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .urgency { background-color: #dc3545; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛒 Your Items Are Waiting!</h1>
        <p>Complete your purchase before they\'re gone</p>
    </div>
    <div class="content">
        <p>Hello {{first_name}},</p>
        
        <p>We noticed you left some items in your cart. Don\'t miss out on these great products!</p>
        
        <div class="cart-items">
            <h3>Your Cart:</h3>
            {{#each items}}
            <div class="item">
                <span class="item-name">{{name}} (x{{quantity}})</span>
                <span class="item-price">${{price}}</span>
            </div>
            {{/each}}
            <div class="total">
                Total: ${{cart_total}}
            </div>
        </div>
        
        <div class="urgency">
            ⚠️ Limited stock available - Complete your purchase now!
        </div>
        
        <a href="{{checkout_url}}" class="button">Complete Purchase</a>
        
        <p>Need help? Contact us at {{support_email}} or call {{support_phone}}.</p>
        
        <p>Best regards,<br>{{company_name}} Team</p>
    </div>
    <div class="footer">
        <p>You received this email because you have an account with {{company_name}}.</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a></p>
    </div>
</body>
</html>',
    'Don\'t forget your items! Complete your purchase\n\nHello {{first_name}},\n\nWe noticed you left some items in your cart. Don\'t miss out on these great products!\n\nYour Cart:\n{{#each items}}
- {{name}} (x{{quantity}}): ${{price}}\n{{/each}}\nTotal: ${{cart_total}}\n\n⚠️ Limited stock available - Complete your purchase now!\n\nComplete your purchase: {{checkout_url}}\n\nNeed help? Contact us at {{support_email}} or call {{support_phone}}.\n\nBest regards,\n{{company_name}} Team\n\n---\nYou received this email because you have an account with {{company_name}}.\nUnsubscribe: {{unsubscribe_url}}\nUpdate Preferences: {{preferences_url}}',
    '["company_name", "first_name", "items", "cart_total", "checkout_url", "support_email", "support_phone", "unsubscribe_url", "preferences_url"]',
    'transactional',
    'ecommerce',
    true,
    true,
    '/templates/thumbnails/abandoned_cart_reminder.jpg',
    '/templates/preview/abandoned_cart_reminder',
    'An effective abandoned cart reminder template with urgency elements',
    '["abandoned_cart", "ecommerce", "reminder", "transactional"]',
    1
),
(
    'Survey Request',
    'survey_request',
    'survey',
    'We value your feedback - {{survey_title}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Feedback Matters</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #20c997; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .survey-box { background-color: #fff; border: 2px solid #20c997; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background-color: #20c997; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .incentive { background-color: #ffc107; color: #212529; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-weight: bold; }
        .time-estimate { color: #6c757d; font-style: italic; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 We Value Your Feedback!</h1>
        <p>Help us improve our services</p>
    </div>
    <div class="content">
        <p>Hello {{first_name}},</p>
        
        <p>We hope you\'re enjoying your experience with {{company_name}}. Your opinion matters to us, and we\'d love to hear your thoughts.</p>
        
        <div class="survey-box">
            <h3>{{survey_title}}</h3>
            <p>{{survey_description}}</p>
            <p class="time-estimate">⏱️ Takes only {{estimated_time}} minutes</p>
        </div>
        
        <div class="incentive">
            🎁 Complete the survey and receive {{incentive_description}}
        </div>
        
        <a href="{{survey_url}}" class="button">Start Survey</a>
        
        <p>Your feedback helps us:</p>
        <ul>
            <li>Improve our products and services</li>
            <li>Better understand your needs</li>
            <li>Create more value for you</li>
        </ul>
        
        <p>Thank you for taking the time to help us serve you better!</p>
        <p>Best regards,<br>{{company_name}} Team</p>
    </div>
    <div class="footer">
        <p>You received this email because you\'re a valued customer of {{company_name}}.</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a></p>
    </div>
</body>
</html>',
    'We value your feedback - {{survey_title}}\n\nHello {{first_name}},\n\nWe hope you\'re enjoying your experience with {{company_name}}. Your opinion matters to us, and we\'d love to hear your thoughts.\n\n{{survey_title}}\n{{survey_description}}\n⏱️ Takes only {{estimated_time}} minutes\n\n🎁 Complete the survey and receive {{incentive_description}}\n\nStart Survey: {{survey_url}}\n\nYour feedback helps us:\n- Improve our products and services\n- Better understand your needs\n- Create more value for you\n\nThank you for taking the time to help us serve you better!\n\nBest regards,\n{{company_name}} Team\n\n---\nYou received this email because you\'re a valued customer of {{company_name}}.\nUnsubscribe: {{unsubscribe_url}}\nUpdate Preferences: {{preferences_url}}',
    '["company_name", "first_name", "survey_title", "survey_description", "estimated_time", "incentive_description", "survey_url", "unsubscribe_url", "preferences_url"]',
    'survey',
    'general',
    true,
    true,
    '/templates/thumbnails/survey_request.jpg',
    '/templates/preview/survey_request',
    'An engaging survey request template with incentives',
    '["survey", "feedback", "research", "customer_satisfaction"]',
    1
);

-- Insert system email templates
INSERT INTO email_templates (
    template_name, template_key, template_type, subject_line, html_content, text_content, template_variables,
    category, industry, is_active, is_editable, description, tags, created_by
) VALUES 
(
    'Password Reset',
    'password_reset',
    'system',
    'Password Reset Request - {{company_name}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .security-notice { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Password Reset Request</h1>
        <p>We received a request to reset your password</p>
    </div>
    <div class="content">
        <p>Hello {{first_name}},</p>
        
        <p>We received a request to reset the password for your account associated with {{email_address}}.</p>
        
        <p>If you made this request, click the button below to reset your password:</p>
        
        <a href="{{reset_url}}" class="button">Reset Password</a>
        
        <div class="security-notice">
            <strong>Security Notice:</strong> This password reset link will expire in {{expiry_hours}} hours for your security.
        </div>
        
        <p>If you didn\'t request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <p>If the button doesn\'t work, you can copy and paste this link into your browser:</p>
        <p><small>{{reset_url}}</small></p>
        
        <p>For security reasons, this link will expire in {{expiry_hours}} hours.</p>
        
        <p>Best regards,<br>{{company_name}} Security Team</p>
    </div>
    <div class="footer">
        <p>This is an automated security email from {{company_name}}.</p>
        <p><a href="{{support_url}}">Contact Support</a></p>
    </div>
</body>
</html>',
    'Password Reset Request - {{company_name}}\n\nHello {{first_name}},\n\nWe received a request to reset the password for your account associated with {{email_address}}.\n\nIf you made this request, use this link to reset your password:\n{{reset_url}}\n\n⚠️ Security Notice: This password reset link will expire in {{expiry_hours}} hours for your security.\n\nIf you didn\'t request a password reset, you can safely ignore this email. Your password will remain unchanged.\n\nFor security reasons, this link will expire in {{expiry_hours}} hours.\n\nBest regards,\n{{company_name}} Security Team\n\n---\nThis is an automated security email from {{company_name}}.\nContact Support: {{support_url}}',
    '["company_name", "first_name", "email_address", "reset_url", "expiry_hours", "support_url"]',
    'system',
    'general',
    true,
    false,
    'A secure password reset email template with security notices',
    '["password", "reset", "security", "authentication"]',
    1
),
(
    'Account Verification',
    'account_verification',
    'system',
    'Verify Your Account - {{company_name}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .security-notice { background-color: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Verify Your Account</h1>
        <p>Complete your registration</p>
    </div>
    <div class="content">
        <p>Hello {{first_name}},</p>
        
        <p>Thank you for creating an account with {{company_name}}. To complete your registration and ensure the security of your account, please verify your email address.</p>
        
        <p>Click the button below to verify your account:</p>
        
        <a href="{{verification_url}}" class="button">Verify Account</a>
        
        <div class="security-notice">
            <strong>Important:</strong> This verification link will expire in {{expiry_hours}} hours for security reasons.
        </div>
        
        <p>If the button doesn\'t work, you can copy and paste this link into your browser:</p>
        <p><small>{{verification_url}}</small></p>
        
        <p>Once verified, you\'ll have full access to all features of your account.</p>
        
        <p>If you didn\'t create this account, you can safely ignore this email.</p>
        
        <p>Welcome to {{company_name}}!</p>
        <p>Best regards,<br>{{company_name}} Team</p>
    </div>
    <div class="footer">
        <p>This is an automated email from {{company_name}}.</p>
        <p><a href="{{support_url}}">Contact Support</a></p>
    </div>
</body>
</html>',
    'Verify Your Account - {{company_name}}\n\nHello {{first_name}},\n\nThank you for creating an account with {{company_name}}. To complete your registration and ensure the security of your account, please verify your email address.\n\nVerify your account: {{verification_url}}\n\n⚠️ Important: This verification link will expire in {{expiry_hours}} hours for security reasons.\n\nOnce verified, you\'ll have full access to all features of your account.\n\nIf you didn\'t create this account, you can safely ignore this email.\n\nWelcome to {{company_name}}!\n\nBest regards,\n{{company_name}} Team\n\n---\nThis is an automated email from {{company_name}}.\nContact Support: {{support_url}}',
    '["company_name", "first_name", "verification_url", "expiry_hours", "support_url"]',
    'system',
    'general',
    true,
    false,
    'A clean account verification email template',
    '["verification", "account", "registration", "onboarding"]',
    1
);