package com.piper.newsletter.shared

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.Serializable

@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val error: String? = null
)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class LoginResponse(val token: String, val user: User)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val first_name: String,
    val last_name: String
)

@Serializable
data class CreateNewsletterRequest(
    val title: String,
    val content: String,
    val excerpt: String,
    val status: String = "draft"
)

@Serializable
data class UpdateNewsletterRequest(
    val title: String? = null,
    val content: String? = null,
    val excerpt: String? = null,
    val status: String? = null
)

@Serializable
data class AnalyticsEvent(
    val event_type: String,
    val user_id: String,
    val newsletter_id: String? = null,
    val metadata: Map<String, String> = emptyMap(),
    val timestamp: String
)

@Serializable
data class NewsletterFilters(
    val status: String? = null,
    val author_id: String? = null,
    val tags: List<String>? = null,
    val search: String? = null
)

class PiperNewsletterAPI(private val baseUrl: String = "https://piper-newsletter.fly.dev") {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            })
        }
        install(Logging) {
            level = LogLevel.INFO
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
            connectTimeoutMillis = 10000
            socketTimeoutMillis = 30000
        }
        defaultRequest {
            header(HttpHeaders.ContentType, ContentType.Application.Json)
            header(HttpHeaders.Accept, ContentType.Application.Json)
        }
    }
    
    // Authentication endpoints
    suspend fun login(email: String, password: String): ApiResponse<LoginResponse> {
        return client.post("$baseUrl/api/auth/login") {
            setBody(LoginRequest(email, password))
        }.body()
    }
    
    suspend fun register(email: String, password: String, firstName: String, lastName: String): ApiResponse<User> {
        return client.post("$baseUrl/api/auth/register") {
            setBody(RegisterRequest(email, password, firstName, lastName))
        }.body()
    }
    
    suspend fun getProfile(token: String): ApiResponse<User> {
        return client.get("$baseUrl/api/auth/profile") {
            bearerAuth(token)
        }.body()
    }
    
    suspend fun updateProfile(token: String, updates: Map<String, String>): ApiResponse<User> {
        return client.put("$baseUrl/api/auth/profile") {
            bearerAuth(token)
            setBody(updates)
        }.body()
    }
    
    suspend fun changePassword(token: String, currentPassword: String, newPassword: String): ApiResponse<Unit> {
        return client.post("$baseUrl/api/auth/change-password") {
            bearerAuth(token)
            setBody(mapOf(
                "current_password" to currentPassword,
                "new_password" to newPassword
            ))
        }.body()
    }
    
    // Newsletter endpoints
    suspend fun getNewsletters(token: String, page: Int = 1, limit: Int = 10, filters: NewsletterFilters? = null): ApiResponse<List<Newsletter>> {
        return client.get("$baseUrl/api/newsletters") {
            bearerAuth(token)
            parameter("page", page)
            parameter("limit", limit)
            filters?.status?.let { parameter("status", it) }
            filters?.author_id?.let { parameter("author_id", it) }
            filters?.tags?.let { parameter("tags", it.joinToString(",")) }
            filters?.search?.let { parameter("search", it) }
        }.body()
    }
    
    suspend fun getNewsletter(token: String, id: String): ApiResponse<Newsletter> {
        return client.get("$baseUrl/api/newsletters/$id") {
            bearerAuth(token)
        }.body()
    }
    
    suspend fun createNewsletter(token: String, title: String, content: String, excerpt: String, status: String = "draft"): ApiResponse<Newsletter> {
        return client.post("$baseUrl/api/newsletters") {
            bearerAuth(token)
            setBody(CreateNewsletterRequest(title, content, excerpt, status))
        }.body()
    }
    
    suspend fun updateNewsletter(token: String, id: String, updates: UpdateNewsletterRequest): ApiResponse<Newsletter> {
        return client.put("$baseUrl/api/newsletters/$id") {
            bearerAuth(token)
            setBody(updates)
        }.body()
    }
    
    suspend fun deleteNewsletter(token: String, id: String): ApiResponse<Unit> {
        return client.delete("$baseUrl/api/newsletters/$id") {
            bearerAuth(token)
        }.body()
    }
    
    // Subscription endpoints
    suspend fun subscribe(token: String, newsletterId: String): ApiResponse<Subscription> {
        return client.post("$baseUrl/api/subscriptions") {
            bearerAuth(token)
            setBody(mapOf("newsletter_id" to newsletterId))
        }.body()
    }
    
    suspend fun unsubscribe(token: String, newsletterId: String): ApiResponse<Unit> {
        return client.delete("$baseUrl/api/subscriptions/$newsletterId") {
            bearerAuth(token)
        }.body()
    }
    
    suspend fun getSubscriptions(token: String): ApiResponse<List<Subscription>> {
        return client.get("$baseUrl/api/subscriptions") {
            bearerAuth(token)
        }.body()
    }
    
    // Analytics endpoints
    suspend fun trackAnalytics(token: String, event: AnalyticsEvent): ApiResponse<Unit> {
        return client.post("$baseUrl/api/analytics/track") {
            bearerAuth(token)
            setBody(event)
        }.body()
    }
    
    suspend fun getAnalytics(token: String, newsletterId: String? = null, eventType: String? = null, startDate: String? = null, endDate: String? = null): ApiResponse<AnalyticsData> {
        return client.get("$baseUrl/api/analytics") {
            bearerAuth(token)
            newsletterId?.let { parameter("newsletter_id", it) }
            eventType?.let { parameter("event_type", it) }
            startDate?.let { parameter("start_date", it) }
            endDate?.let { parameter("end_date", it) }
        }.body()
    }
    
    // User management endpoints
    suspend fun getUsers(token: String, page: Int = 1, limit: Int = 10): ApiResponse<List<User>> {
        return client.get("$baseUrl/api/users") {
            bearerAuth(token)
            parameter("page", page)
            parameter("limit", limit)
        }.body()
    }
    
    suspend fun getUser(token: String, id: String): ApiResponse<User> {
        return client.get("$baseUrl/api/users/$id") {
            bearerAuth(token)
        }.body()
    }
    
    suspend fun updateUser(token: String, id: String, updates: Map<String, String>): ApiResponse<User> {
        return client.put("$baseUrl/api/users/$id") {
            bearerAuth(token)
            setBody(updates)
        }.body()
    }
    
    suspend fun deleteUser(token: String, id: String): ApiResponse<Unit> {
        return client.delete("$baseUrl/api/users/$id") {
            bearerAuth(token)
        }.body()
    }
    
    // Email endpoints
    suspend fun sendEmail(token: String, newsletterId: String, recipients: List<String>): ApiResponse<Unit> {
        return client.post("$baseUrl/api/email/send") {
            bearerAuth(token)
            setBody(mapOf(
                "newsletter_id" to newsletterId,
                "recipients" to recipients
            ))
        }.body()
    }
    
    suspend fun getEmailHistory(token: String, newsletterId: String? = null): ApiResponse<List<EmailLog>> {
        return client.get("$baseUrl/api/email/history") {
            bearerAuth(token)
            newsletterId?.let { parameter("newsletter_id", it) }
        }.body()
    }
    
    // Search endpoints
    suspend fun search(token: String, query: String, type: String = "all", limit: Int = 10): ApiResponse<SearchResults> {
        return client.get("$baseUrl/api/search") {
            bearerAuth(token)
            parameter("q", query)
            parameter("type", type)
            parameter("limit", limit)
        }.body()
    }
    
    // Health check
    suspend fun healthCheck(): ApiResponse<HealthStatus> {
        return client.get("$baseUrl/api/health").body()
    }
    
    fun close() {
        client.close()
    }
}

// Extension function for bearer auth
fun HttpRequestBuilder.bearerAuth(token: String) {
    header(HttpHeaders.Authorization, "Bearer $token")
}