# Piper Newsletter API Documentation

## Overview

The Piper Newsletter API provides a comprehensive set of endpoints for managing newsletters, subscribers, campaigns, and analytics. This documentation covers all available endpoints, request/response formats, authentication, and error handling.

## Base URL

```
Production: https://api.pipernewsletter.com/api/v1
Development: http://localhost:3001/api/v1
```

## Authentication

### JWT Authentication

All API requests require authentication using JWT tokens.

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1234567890",
      "email": "user@example.com",
      "role": "admin",
      "permissions": ["read", "write", "delete"]
    }
  }
}
```

#### Using the Token
Include the JWT token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Standard**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **Admin**: 5000 requests per minute per user

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640995200
```

## Request/Response Format

### Request Format
All requests should include appropriate headers:
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

### Response Format
All responses follow a consistent format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2023-12-01T12:00:00.000Z",
  "requestId": "req_1234567890"
}
```

### Error Format
Error responses include detailed information:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email field is required",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      }
    ]
  },
  "timestamp": "2023-12-01T12:00:00.000Z",
  "requestId": "req_1234567890"
}
```

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

### Newsletter Endpoints

#### Create Newsletter
```http
POST /newsletters
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Monthly Newsletter",
  "subject": "Your Monthly Update from Piper",
  "content": "<h1>Welcome to our newsletter!</h1><p>Here's what's new...</p>",
  "template": "modern",
  "category": "monthly-update",
  "tags": ["news", "updates"],
  "scheduledFor": "2023-12-15T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "newsletter": {
      "id": "news_1234567890",
      "title": "Monthly Newsletter",
      "subject": "Your Monthly Update from Piper",
      "content": "<h1>Welcome to our newsletter!</h1><p>Here's what's new...</p>",
      "template": "modern",
      "category": "monthly-update",
      "tags": ["news", "updates"],
      "status": "draft",
      "createdBy": "user_1234567890",
      "createdAt": "2023-12-01T12:00:00.000Z",
      "updatedAt": "2023-12-01T12:00:00.000Z"
    }
  }
}
```

#### Get All Newsletters
```http
GET /newsletters?page=1&limit=10&status=draft&category=monthly-update
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): Filter by status (draft, published, scheduled, archived)
- `category` (string): Filter by category
- `search` (string): Search by title or content
- `sortBy` (string): Sort field (createdAt, title, status)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "newsletters": [
      {
        "id": "news_1234567890",
        "title": "Monthly Newsletter",
        "subject": "Your Monthly Update from Piper",
        "status": "draft",
        "createdAt": "2023-12-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Newsletter by ID
```http
GET /newsletters/{id}
Authorization: Bearer {token}
```

#### Update Newsletter
```http
PUT /newsletters/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Newsletter Title",
  "subject": "Updated Subject Line",
  "content": "<h1>Updated content</h1>"
}
```

#### Delete Newsletter
```http
DELETE /newsletters/{id}
Authorization: Bearer {token}
```

#### Send Newsletter
```http
POST /newsletters/{id}/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "subscriberLists": ["list_123", "list_456"],
  "sendToAll": false,
  "scheduleFor": "2023-12-15T10:00:00.000Z"
}
```

#### Preview Newsletter
```http
POST /newsletters/{id}/preview
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Subscriber Endpoints

#### Create Subscriber List
```http
POST /subscribers/lists
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "VIP Customers",
  "description": "High-value customer segment",
  "tags": ["vip", "customers"]
}
```

#### Get Subscriber Lists
```http
GET /subscribers/lists?page=1&limit=10
Authorization: Bearer {token}
```

#### Add Subscriber
```http
POST /subscribers
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "subscriber@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "tags": ["customer", "newsletter"],
  "customFields": {
    "company": "Acme Corp",
    "industry": "Technology"
  }
}
```

#### Import Subscribers
```http
POST /subscribers/import
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": CSV_FILE,
  "listId": "list_1234567890",
  "updateExisting": true
}
```

#### Get Subscribers
```http
GET /subscribers?listId=list_1234567890&status=active&page=1&limit=50
Authorization: Bearer {token}
```

#### Update Subscriber
```http
PUT /subscribers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Updated Name",
  "tags": ["customer", "vip"]
}
```

#### Unsubscribe Subscriber
```http
POST /subscribers/{id}/unsubscribe
Authorization: Bearer {token}
```

#### Delete Subscriber
```http
DELETE /subscribers/{id}
Authorization: Bearer {token}
```

### Campaign Endpoints

#### Create Campaign
```http
POST /campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Holiday Campaign 2023",
  "newsletterId": "news_1234567890",
  "subscriberLists": ["list_123", "list_456"],
  "scheduleFor": "2023-12-15T10:00:00.000Z",
  "abTest": {
    "enabled": true,
    "testPercentage": 20,
    "testDuration": 24,
    "variations": [
      {
        "subject": "Subject A - Holiday Special",
        "percentage": 50
      },
      {
        "subject": "Subject B - Christmas Sale",
        "percentage": 50
      }
    ]
  }
}
```

#### Get Campaigns
```http
GET /campaigns?page=1&limit=10&status=scheduled
Authorization: Bearer {token}
```

#### Get Campaign Analytics
```http
GET /campaigns/{id}/analytics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalSent": 1000,
      "delivered": 950,
      "bounced": 50,
      "opened": 380,
      "clicked": 95,
      "unsubscribed": 5,
      "complained": 2,
      "openRate": 40.0,
      "clickRate": 10.0,
      "bounceRate": 5.0,
      "unsubscribeRate": 0.5,
      "complaintRate": 0.2,
      "timeline": [
        {
          "timestamp": "2023-12-01T12:00:00.000Z",
          "event": "sent",
          "count": 1000
        }
      ]
    }
  }
}
```

### Analytics Endpoints

#### Get Dashboard Metrics
```http
GET /analytics/dashboard?startDate=2023-11-01&endDate=2023-12-01
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalSubscribers": 5000,
      "activeSubscribers": 4500,
      "totalNewsletters": 25,
      "totalCampaigns": 15,
      "totalSent": 12500,
      "averageOpenRate": 35.5,
      "averageClickRate": 8.2,
      "growthRate": 12.5
    },
    "trends": {
      "subscriberGrowth": [
        {
          "date": "2023-11-01",
          "count": 4500
        }
      ],
      "engagementTrends": [
        {
          "date": "2023-11-01",
          "openRate": 32.5,
          "clickRate": 7.8
        }
      ]
    }
  }
}
```

#### Get Subscriber Analytics
```http
GET /analytics/subscribers?startDate=2023-11-01&endDate=2023-12-01
Authorization: Bearer {token}
```

#### Get Campaign Analytics
```http
GET /analytics/campaigns?startDate=2023-11-01&endDate=2023-12-01
Authorization: Bearer {token}
```

### Template Endpoints

#### Get Templates
```http
GET /templates?category=newsletter&page=1&limit=10
Authorization: Bearer {token}
```

#### Create Template
```http
POST /templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Modern Newsletter",
  "category": "newsletter",
  "html": "<html><body><h1>{{title}}</h1>{{content}}</body></html>",
  "variables": ["title", "content", "footer"],
  "previewData": {
    "title": "Sample Title",
    "content": "Sample content",
    "footer": "Sample footer"
  }
}
```

### File Upload Endpoints

#### Upload File
```http
POST /files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": IMAGE_FILE,
  "type": "image",
  "folder": "newsletters"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file_1234567890",
      "filename": "newsletter-header.jpg",
      "originalName": "header.jpg",
      "mimeType": "image/jpeg",
      "size": 102400,
      "url": "https://cdn.pipernewsletter.com/files/newsletter-header.jpg",
      "uploadedAt": "2023-12-01T12:00:00.000Z"
    }
  }
}
```

### Settings Endpoints

#### Get Settings
```http
GET /settings
Authorization: Bearer {token}
```

#### Update Settings
```http
PUT /settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "general": {
    "siteName": "Piper Newsletter",
    "siteUrl": "https://pipernewsletter.com"
  },
  "email": {
    "fromName": "Piper Newsletter",
    "fromEmail": "noreply@pipernewsletter.com",
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false
    }
  },
  "security": {
    "rateLimit": {
      "windowMs": 900000,
      "max": 100
    }
  }
}
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `AUTHENTICATION_FAILED` | Invalid credentials | 401 |
| `UNAUTHORIZED` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource conflict | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | 503 |

## Webhooks

### Webhook Events

The system supports webhooks for real-time event notifications:

#### Newsletter Events
- `newsletter.created` - Newsletter created
- `newsletter.updated` - Newsletter updated
- `newsletter.sent` - Newsletter sent
- `newsletter.scheduled` - Newsletter scheduled

#### Campaign Events
- `campaign.started` - Campaign started
- `campaign.completed` - Campaign completed
- `campaign.failed` - Campaign failed

#### Subscriber Events
- `subscriber.added` - Subscriber added
- `subscriber.updated` - Subscriber updated
- `subscriber.unsubscribed` - Subscriber unsubscribed

#### Analytics Events
- `email.opened` - Email opened
- `email.clicked` - Email link clicked
- `email.bounced` - Email bounced
- `email.complained` - Email complaint received

### Webhook Payload
```json
{
  "event": "newsletter.sent",
  "timestamp": "2023-12-01T12:00:00.000Z",
  "data": {
    "newsletterId": "news_1234567890",
    "campaignId": "camp_1234567890",
    "subscriberCount": 1000,
    "sentCount": 950
  },
  "signature": "sha256=abc123..."
}
```

### Webhook Configuration
```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["newsletter.sent", "email.opened"],
  "secret": "your-webhook-secret",
  "active": true
}
```

## SDKs and Libraries

### Official SDKs
- **Node.js**: `npm install piper-newsletter-sdk`
- **Python**: `pip install piper-newsletter`
- **PHP**: `composer require piper/newsletter`

### Community SDKs
- **Ruby**: `gem install piper-newsletter`
- **Go**: `go get github.com/piper/newsletter-go`
- **Java**: Available on Maven Central

## API Versioning

The API uses semantic versioning. Current version: `v1`

### Version Deprecation Policy
- **Announcement**: 6 months before deprecation
- **Sunset**: 1 year after announcement
- **Support**: Legacy versions supported for 2 years

### Version Headers
```http
X-API-Version: v1
X-API-Deprecation-Date: 2024-12-01
X-API-Sunset-Date: 2025-12-01
```

## Support

For API support, please contact:
- **Email**: api-support@pipernewsletter.com
- **Documentation**: https://docs.pipernewsletter.com/api
- **Status Page**: https://status.pipernewsletter.com
- **Community**: https://community.pipernewsletter.com