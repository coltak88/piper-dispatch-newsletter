package com.piper.newsletter.shared

import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class Newsletter(
    val id: Int,
    val title: String,
    val description: String,
    val content: String,
    val author: String,
    val authorAvatar: String? = null,
    val publicationDate: String,
    val tags: List<String> = emptyList(),
    val category: String,
    val isSubscribed: Boolean = false,
    val viewCount: Int = 0,
    val clickCount: Int = 0,
    val openRate: Double = 0.0,
    val clickRate: Double = 0.0,
    val createdAt: String,
    val updatedAt: String
) {
    fun isPublished(): Boolean {
        val now = Clock.System.now()
        val pubDate = Instant.parse(publicationDate)
        return now >= pubDate
    }
    
    fun getEstimatedReadTime(): Int {
        val words = content.split(Regex("\\s+")).size
        return (words / 200.0).toInt().coerceAtLeast(1) // Assuming 200 words per minute
    }
}

@Serializable
data class NewsletterSubscription(
    val id: Int,
    val newsletterId: Int,
    val userId: Int,
    val subscribedAt: String,
    val unsubscribedAt: String? = null,
    val isActive: Boolean = true,
    val preferences: NewsletterPreferences? = null
)

@Serializable
data class NewsletterPreferences(
    val emailNotifications: Boolean = true,
    val pushNotifications: Boolean = true,
    val frequency: NewsletterFrequency = NewsletterFrequency.WEEKLY,
    val categories: List<String> = emptyList()
)

@Serializable
enum class NewsletterFrequency {
    DAILY,
    WEEKLY,
    BIWEEKLY,
    MONTHLY
}

@Serializable
data class NewsletterAnalytics(
    val newsletterId: Int,
    val totalViews: Int,
    val uniqueViews: Int,
    val totalClicks: Int,
    val uniqueClicks: Int,
    val openRate: Double,
    val clickRate: Double,
    val unsubscribeRate: Double,
    val timeSeriesData: List<AnalyticsDataPoint>,
    val topLinks: List<LinkAnalytics>,
    val demographics: DemographicsData
)

@Serializable
data class AnalyticsDataPoint(
    val timestamp: String,
    val views: Int,
    val clicks: Int,
    val opens: Int
)

@Serializable
data class LinkAnalytics(
    val url: String,
    val clicks: Int,
    uniqueClicks: Int,
    val clickRate: Double
)

@Serializable
data class DemographicsData(
    val ageGroups: Map<String, Int>,
    val locations: Map<String, Int>,
    val devices: Map<String, Int>
)

@Serializable
data class NewsletterFilter(
    val category: String? = null,
    val author: String? = null,
    val tags: List<String> = emptyList(),
    val isSubscribed: Boolean? = null,
    val dateFrom: String? = null,
    val dateTo: String? = null,
    val sortBy: NewsletterSortBy = NewsletterSortBy.PUBLICATION_DATE,
    val sortOrder: SortOrder = SortOrder.DESC
)

@Serializable
enum class NewsletterSortBy {
    TITLE,
    PUBLICATION_DATE,
    AUTHOR,
    CATEGORY,
    VIEW_COUNT,
    OPEN_RATE
}

@Serializable
enum class SortOrder {
    ASC,
    DESC
}

@Serializable
data class PaginatedResponse<T>(
    val items: List<T>,
    val total: Int,
    val page: Int,
    val pageSize: Int,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)

class NewsletterManager(
    private val api: PiperNewsletterAPI,
    private val authManager: AuthManager
) {
    suspend fun getNewsletters(
        page: Int = 1,
        pageSize: Int = 20,
        filter: NewsletterFilter? = null
    ): Result<PaginatedResponse<Newsletter>> {
        return try {
            val response: PaginatedResponse<Newsletter> = api.get("/newsletters") {
                parameter("page", page)
                parameter("page_size", pageSize)
                filter?.let {
                    parameter("category", it.category)
                    parameter("author", it.author)
                    parameter("tags", it.tags.joinToString(","))
                    parameter("is_subscribed", it.isSubscribed)
                    parameter("date_from", it.dateFrom)
                    parameter("date_to", it.dateTo)
                    parameter("sort_by", it.sortBy.name)
                    parameter("sort_order", it.sortOrder.name)
                }
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getNewsletter(id: Int): Result<Newsletter> {
        return try {
            val newsletter: Newsletter = api.get("/newsletters/$id")
            Result.success(newsletter)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getSubscribedNewsletters(
        page: Int = 1,
        pageSize: Int = 20
    ): Result<PaginatedResponse<Newsletter>> {
        return try {
            val response: PaginatedResponse<Newsletter> = api.get("/newsletters/subscribed") {
                parameter("page", page)
                parameter("page_size", pageSize)
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun subscribeToNewsletter(newsletterId: Int): Result<NewsletterSubscription> {
        return try {
            val subscription: NewsletterSubscription = api.post("/newsletters/$newsletterId/subscribe")
            Result.success(subscription)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun unsubscribeFromNewsletter(newsletterId: Int): Result<Unit> {
        return try {
            api.delete<Unit>("/newsletters/$newsletterId/unsubscribe")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateSubscriptionPreferences(
        newsletterId: Int,
        preferences: NewsletterPreferences
    ): Result<NewsletterSubscription> {
        return try {
            val subscription: NewsletterSubscription = api.put(
                "/newsletters/$newsletterId/preferences",
                body = preferences
            )
            Result.success(subscription)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getNewsletterAnalytics(newsletterId: Int): Result<NewsletterAnalytics> {
        return try {
            val analytics: NewsletterAnalytics = api.get("/newsletters/$newsletterId/analytics")
            Result.success(analytics)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun searchNewsletters(
        query: String,
        page: Int = 1,
        pageSize: Int = 20
    ): Result<PaginatedResponse<Newsletter>> {
        return try {
            val response: PaginatedResponse<Newsletter> = api.get("/newsletters/search") {
                parameter("q", query)
                parameter("page", page)
                parameter("page_size", pageSize)
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}