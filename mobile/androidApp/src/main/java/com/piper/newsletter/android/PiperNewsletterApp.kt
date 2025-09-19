package com.piper.newsletter.android

import android.app.Application
import com.piper.newsletter.shared.PiperNewsletterAPI
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.GlobalContext.startKoin
import org.koin.dsl.module

class PiperNewsletterApp : Application() {
    override fun onCreate() {
        super.onCreate()
        
        startKoin {
            androidContext(this@PiperNewsletterApp)
            modules(appModule)
        }
    }
}

val appModule = module {
    single { PiperNewsletterAPI() }
    single { com.piper.newsletter.shared.AuthManager() }
    single { com.piper.newsletter.shared.NewsletterManager(get(), get()) }
    single { com.piper.newsletter.shared.AnalyticsManager(get(), get()) }
}