package com.piper.newsletter.shared

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String,
    val first_name: String,
    val last_name: String,
    val subscription_status: String,
    val created_at: String,
    val updated_at: String,
    val avatar_url: String? = null,
    val bio: String? = null,
    val website: String? = null
)

@Serializable
data class Newsletter(
    val id: String,
    val title: String,
    val content: String,
    val excerpt: String,
    val published_at: String,
    val status: String,
    val author_id: String,
    val author: User? = null,
    val tags: List<String> = emptyList(),
    val analytics: NewsletterAnalytics? = null,
    val created_at: String,
    val updated_at: String
)

@Serializable
data class NewsletterAnalytics(
    val views: Int = 0,
    val clicks: Int = 0,
    val shares: Int = 0,
    val open_rate: Float = 0f,
    val click_rate: Float = 0f,
    val subscriber_count: Int = 0,
    val engagement_score: Float = 0f
)

@Serializable
data class Subscription(
    val id: String,
    val user_id: String,
    val newsletter_id: String,
    val status: String,
    val subscribed_at: String,
    val unsubscribed_at: String? = null,
    val user: User? = null,
    val newsletter: Newsletter? = null
)

@Serializable
data class AnalyticsData(
    val total_events: Int,
    val events_by_type: Map<String, Int>,
    val newsletter_performance: List<NewsletterAnalytics>,
    val user_engagement: Map<String, Float>,
    val time_series: List<TimeSeriesData>
)

@Serializable
data class TimeSeriesData(
    val date: String,
    val events: Int,
    val unique_users: Int
)

@Serializable
data class EmailLog(
    val id: String,
    val newsletter_id: String,
    val recipient_email: String,
    val subject: String,
    val status: String,
    val sent_at: String? = null,
    val delivered_at: String? = null,
    val opened_at: String? = null,
    val clicked_at: String? = null,
    val bounce_reason: String? = null
)

@Serializable
data class SearchResults(
    val newsletters: List<Newsletter> = emptyList(),
    val users: List<User> = emptyList(),
    val total_results: Int,
    val query: String,
    val execution_time_ms: Int
)

@Serializable
data class HealthStatus(
    val status: String,
    val timestamp: String,
    val uptime: Long,
    version: String,
    val database: DatabaseHealth,
    val services: Map<String, ServiceHealth>
)

@Serializable
data class DatabaseHealth(
    val connected: Boolean,
    val response_time_ms: Int,
    val active_connections: Int
)

@Serializable
data class ServiceHealth(
    val status: String,
    val response_time_ms: Int,
    val healthy: Boolean
)