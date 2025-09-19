package com.piper.newsletter.shared

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class AuthManager {
    private var currentToken: String? = null
    private var currentUser: User? = null
    private val mutex = Mutex()
    
    suspend fun login(email: String, password: String, api: PiperNewsletterAPI): Boolean {
        val response = api.login(email, password)
        return if (response.success && response.data != null) {
            mutex.withLock {
                currentToken = response.data.token
                currentUser = response.data.user
            }
            true
        } else {
            false
        }
    }
    
    suspend fun logout() {
        mutex.withLock {
            currentToken = null
            currentUser = null
        }
    }
    
    suspend fun getToken(): String? {
        return mutex.withLock { currentToken }
    }
    
    suspend fun getCurrentUser(): User? {
        return mutex.withLock { currentUser }
    }
    
    suspend fun isAuthenticated(): Boolean {
        return mutex.withLock { currentToken != null }
    }
}

class NewsletterManager(private val api: PiperNewsletterAPI, private val authManager: AuthManager) {
    private val newsletterCache = mutableMapOf<String, Newsletter>()
    private val mutex = Mutex()
    
    suspend fun getNewsletters(): List<Newsletter> {
        val token = authManager.getToken() ?: return emptyList()
        val response = api.getNewsletters(token)
        return if (response.success && response.data != null) {
            mutex.withLock {
                response.data.forEach { newsletter ->
                    newsletterCache[newsletter.id] = newsletter
                }
            }
            response.data
        } else {
            emptyList()
        }
    }
    
    suspend fun getNewsletter(id: String): Newsletter? {
        mutex.withLock {
            newsletterCache[id]
        }?.let { return it }
        
        val token = authManager.getToken() ?: return null
        val response = api.getNewsletter(token, id)
        return if (response.success && response.data != null) {
            mutex.withLock {
                newsletterCache[id] = response.data
            }
            response.data
        } else {
            null
        }
    }
    
    suspend fun subscribe(newsletterId: String): Boolean {
        val token = authManager.getToken() ?: return false
        val response = api.subscribe(token, newsletterId)
        return response.success
    }
    
    suspend fun unsubscribe(newsletterId: String): Boolean {
        val token = authManager.getToken() ?: return false
        val response = api.unsubscribe(token, newsletterId)
        return response.success
    }
}

class AnalyticsManager(private val api: PiperNewsletterAPI, private val authManager: AuthManager) {
    private val eventQueue = mutableListOf<AnalyticsEvent>()
    private val mutex = Mutex()
    
    suspend fun trackEvent(eventType: String, newsletterId: String? = null, metadata: Map<String, String> = emptyMap()) {
        val user = authManager.getCurrentUser() ?: return
        val event = AnalyticsEvent(
            event_type = eventType,
            user_id = user.id,
            newsletter_id = newsletterId,
            metadata = metadata,
            timestamp = kotlinx.datetime.Clock.System.now().toString()
        )
        
        mutex.withLock {
            eventQueue.add(event)
        }
        
        // Send immediately if authenticated
        if (authManager.isAuthenticated()) {
            flushEvents()
        }
    }
    
    suspend fun flushEvents() {
        val token = authManager.getToken() ?: return
        val eventsToSend = mutex.withLock {
            val events = eventQueue.toList()
            eventQueue.clear()
            events
        }
        
        eventsToSend.forEach { event ->
            api.trackAnalytics(token, event)
        }
    }
    
    suspend fun trackNewsletterOpen(newsletterId: String) {
        trackEvent("newsletter_open", newsletterId)
    }
    
    suspend fun trackNewsletterClick(newsletterId: String, link: String) {
        trackEvent("newsletter_click", newsletterId, mapOf("link" to link))
    }
    
    suspend fun trackNewsletterShare(newsletterId: String, platform: String) {
        trackEvent("newsletter_share", newsletterId, mapOf("platform" to platform))
    }
}