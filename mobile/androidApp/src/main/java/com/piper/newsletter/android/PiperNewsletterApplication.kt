package com.piper.newsletter.android

import android.app.Application
import com.piper.newsletter.shared.AuthManager
import com.piper.newsletter.shared.AuthorizationManager
import com.piper.newsletter.shared.PiperNewsletterAPI
import com.piper.newsletter.shared.NewsletterManager
import com.piper.newsletter.shared.AnalyticsManager

class PiperNewsletterApplication : Application() {
    
    companion object {
        lateinit var authManager: AuthManager
            private set
        
        lateinit var authorizationManager: AuthorizationManager
            private set
        
        lateinit var api: PiperNewsletterAPI
            private set
        
        lateinit var newsletterManager: NewsletterManager
            private set
        
        lateinit var analyticsManager: AnalyticsManager
            private set
    }
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize shared components
        authManager = AuthManager()
        authorizationManager = AuthorizationManager()
        api = PiperNewsletterAPI(authManager)
        newsletterManager = NewsletterManager(api, authManager)
        analyticsManager = AnalyticsManager(api, authManager)
    }
}