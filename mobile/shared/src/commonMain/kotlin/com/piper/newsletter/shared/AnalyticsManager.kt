package com.piper.newsletter.shared

import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class AnalyticsSummary(
    val totalViews: Int,
    val totalClicks: Int,
    val totalSubscriptions: Int,
    val totalNewsletters: Int,
    val averageOpenRate: Double,
    val averageClickRate: Double,
    val topNewsletters: List<NewsletterPerformance>,
    val growthMetrics: GrowthMetrics,
    val timeSeriesData: List<AnalyticsDataPoint>
)

@Serializable
data class NewsletterPerformance(
    val newsletterId: Int,
    val title: String,
    val views: Int,
    val clicks: Int,
    val openRate: Double,
    val clickRate: Double,
    val subscriptionGrowth: Int
)

@Serializable
data class GrowthMetrics(
    val viewsGrowth: Double,
    val clicksGrowth: Double,
    val subscriptionsGrowth: Double,
    val period: String = "30d"
)

@Serializable
data class UserAnalytics(
    val userId: Int,
    val totalViews: Int,
    val totalClicks: Int,
    val subscriptions: Int,
    val favoriteCategories: List<CategoryPreference>,
    val readingPatterns: ReadingPatterns,
    val engagementScore: Double
)

@Serializable
data class CategoryPreference(
    val category: String,
    val views: Int,
    val clicks: Int,
    val preference: Double
)

@Serializable
data class ReadingPatterns(
    val preferredTimeOfDay: String,
    val averageReadTime: Int,
    val completionRate: Double,
    val sharingFrequency: Double
)

@Serializable
data class DashboardMetrics(
    val activeUsers: Int,
    val newSubscriptions: Int,
    val churnRate: Double,
    val engagementRate: Double,
    val topPerformingNewsletter: NewsletterPerformance?,
    val recentActivity: List<ActivityEvent>
)

@Serializable
data class ActivityEvent(
    val type: ActivityType,
    val timestamp: String,
    val userId: Int,
    val newsletterId: Int? = null,
    val details: Map<String, String> = emptyMap()
)

@Serializable
enum class ActivityType {
    VIEW,
    CLICK,
    SUBSCRIBE,
    UNSUBSCRIBE,
    SHARE,
    LOGIN,
    LOGOUT
}

@Serializable
data class AnalyticsFilter(
    val dateFrom: String? = null,
    val dateTo: String? = null,
    val newsletterIds: List<Int> = emptyList(),
    val userIds: List<Int> = emptyList(),
    val categories: List<String> = emptyList(),
    val granularity: AnalyticsGranularity = AnalyticsGranularity.DAILY
)

@Serializable
enum class AnalyticsGranularity {
    HOURLY,
    DAILY,
    WEEKLY,
    MONTHLY
}

@Serializable
data class RealtimeMetrics(
    val activeUsers: Int,
    val viewsPerMinute: Double,
    val clicksPerMinute: Double,
    val subscriptionsPerHour: Double,
    val topContent: List<ContentMetrics>,
    val geographicData: Map<String, Int>
)

@Serializable
data class ContentMetrics(
    val newsletterId: Int,
    val title: String,
    val currentViews: Int,
    val currentClicks: Int,
    val trend: TrendDirection
)

@Serializable
enum class TrendDirection {
    UP,
    DOWN,
    STABLE
}

class AnalyticsManager(
    private val api: PiperNewsletterAPI,
    private val authManager: AuthManager
) {
    suspend fun getAnalyticsSummary(
        filter: AnalyticsFilter? = null
    ): Result<AnalyticsSummary> {
        return try {
            val response: AnalyticsSummary = api.get("/analytics/summary") {
                filter?.let {
                    parameter("date_from", it.dateFrom)
                    parameter("date_to", it.dateTo)
                    parameter("newsletter_ids", it.newsletterIds.joinToString(","))
                    parameter("user_ids", it.userIds.joinToString(","))
                    parameter("categories", it.categories.joinToString(","))
                    parameter("granularity", it.granularity.name)
                }
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUserAnalytics(
        userId: Int? = null,
        filter: AnalyticsFilter? = null
    ): Result<UserAnalytics> {
        return try {
            val targetUserId = userId ?: authManager.getCurrentUser()?.id
            ?: return Result.failure(Exception("User ID required"))
            
            val response: UserAnalytics = api.get("/analytics/users/$targetUserId") {
                filter?.let {
                    parameter("date_from", it.dateFrom)
                    parameter("date_to", it.dateTo)
                    parameter("granularity", it.granularity.name)
                }
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getDashboardMetrics(): Result<DashboardMetrics> {
        return try {
            val response: DashboardMetrics = api.get("/analytics/dashboard")
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getRealtimeMetrics(): Result<RealtimeMetrics> {
        return try {
            val response: RealtimeMetrics = api.get("/analytics/realtime")
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getNewsletterAnalytics(
        newsletterId: Int,
        filter: AnalyticsFilter? = null
    ): Result<NewsletterAnalytics> {
        return try {
            val response: NewsletterAnalytics = api.get("/analytics/newsletters/$newsletterId") {
                filter?.let {
                    parameter("date_from", it.dateFrom)
                    parameter("date_to", it.dateTo)
                    parameter("granularity", it.granularity.name)
                }
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun trackEvent(
        type: ActivityType,
        newsletterId: Int? = null,
        details: Map<String, String> = emptyMap()
    ): Result<Unit> {
        return try {
            val userId = authManager.getCurrentUser()?.id
            val event = ActivityEvent(
                type = type,
                timestamp = Clock.System.now().toString(),
                userId = userId ?: 0,
                newsletterId = newsletterId,
                details = details
            )
            
            api.post<Unit>("/analytics/events", body = event)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun exportAnalytics(
        format: ExportFormat,
        filter: AnalyticsFilter? = null
    ): Result<String> {
        return try {
            val response: Map<String, String> = api.get("/analytics/export") {
                parameter("format", format.name)
                filter?.let {
                    parameter("date_from", it.dateFrom)
                    parameter("date_to", it.dateTo)
                    parameter("granularity", it.granularity.name)
                }
            }
            Result.success(response["downloadUrl"] ?: "")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

@Serializable
enum class ExportFormat {
    CSV,
    JSON,
    PDF,
    EXCEL
}