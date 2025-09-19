package com.piper.newsletter.ios.ui.theme

import SwiftUI

struct AppColors {
    static let primary = Color(red: 0.2, green: 0.5, blue: 1.0)
    static let primaryDark = Color(red: 0.1, green: 0.3, blue: 0.8)
    static let secondary = Color(red: 0.4, green: 0.7, blue: 1.0)
    static let secondaryDark = Color(red: 0.2, green: 0.5, blue: 0.8)
    
    static let success = Color(red: 0.2, green: 0.8, blue: 0.4)
    static let warning = Color(red: 1.0, green: 0.6, blue: 0.2)
    static let error = Color(red: 1.0, green: 0.3, blue: 0.3)
    static let info = Color(red: 0.2, green: 0.6, blue: 1.0)
    
    static let background = Color(.systemBackground)
    static let backgroundSecondary = Color(.secondarySystemBackground)
    static let backgroundTertiary = Color(.tertiarySystemBackground)
    
    static let surface = Color(.systemBackground)
    static let surfaceVariant = Color(.secondarySystemBackground)
    
    static let textPrimary = Color(.label)
    static let textSecondary = Color(.secondaryLabel)
    static let textTertiary = Color(.tertiaryLabel)
    static let textInverse = Color(.systemBackground)
    
    static let border = Color(.separator)
    static let borderVariant = Color(.opaqueSeparator)
    
    static let overlay = Color.black.opacity(0.5)
    static let shadow = Color.black.opacity(0.2)
    
    static let gradientPrimary = LinearGradient(
        colors: [primary, secondary],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    static let gradientSecondary = LinearGradient(
        colors: [secondary, primary],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    static let gradientSuccess = LinearGradient(
        colors: [success, Color(red: 0.3, green: 0.9, blue: 0.5)],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    static let gradientWarning = LinearGradient(
        colors: [warning, Color(red: 1.0, green: 0.7, blue: 0.3)],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    static let gradientError = LinearGradient(
        colors: [error, Color(red: 1.0, green: 0.4, blue: 0.4)],
        startPoint: .leading,
        endPoint: .trailing
    )
}

struct AppTypography {
    static let displayLarge = Font.system(size: 57, weight: .bold, design: .default)
    static let displayMedium = Font.system(size: 45, weight: .bold, design: .default)
    static let displaySmall = Font.system(size: 36, weight: .bold, design: .default)
    
    static let headlineLarge = Font.system(size: 32, weight: .bold, design: .default)
    static let headlineMedium = Font.system(size: 28, weight: .semibold, design: .default)
    static let headlineSmall = Font.system(size: 24, weight: .semibold, design: .default)
    
    static let titleLarge = Font.system(size: 22, weight: .semibold, design: .default)
    static let titleMedium = Font.system(size: 16, weight: .medium, design: .default)
    static let titleSmall = Font.system(size: 14, weight: .medium, design: .default)
    
    static let bodyLarge = Font.system(size: 16, weight: .regular, design: .default)
    static let bodyMedium = Font.system(size: 14, weight: .regular, design: .default)
    static let bodySmall = Font.system(size: 12, weight: .regular, design: .default)
    
    static let labelLarge = Font.system(size: 14, weight: .medium, design: .default)
    static let labelMedium = Font.system(size: 12, weight: .medium, design: .default)
    static let labelSmall = Font.system(size: 11, weight: .medium, design: .default)
    
    static let caption = Font.system(size: 10, weight: .regular, design: .default)
    static let overline = Font.system(size: 10, weight: .medium, design: .default)
}

struct AppSpacing {
    static let spacing2: CGFloat = 2
    static let spacing4: CGFloat = 4
    static let spacing8: CGFloat = 8
    static let spacing12: CGFloat = 12
    static let spacing16: CGFloat = 16
    static let spacing24: CGFloat = 24
    static let spacing32: CGFloat = 32
    static let spacing48: CGFloat = 48
    static let spacing64: CGFloat = 64
}

struct AppCornerRadius {
    static let radius4: CGFloat = 4
    static let radius8: CGFloat = 8
    static let radius12: CGFloat = 12
    static let radius16: CGFloat = 16
    static let radius24: CGFloat = 24
    static let radius32: CGFloat = 32
}

struct AppShadow {
    static let shadow1 = Shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    static let shadow2 = Shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    static let shadow3 = Shadow(color: .black.opacity(0.15), radius: 8, x: 0, y: 4)
    static let shadow4 = Shadow(color: .black.opacity(0.15), radius: 16, x: 0, y: 8)
}

struct AppAnimation {
    static let durationFast: Double = 0.15
    static let durationNormal: Double = 0.3
    static let durationSlow: Double = 0.5
    
    static let curveLinear = Animation.linear
    static let curveEaseIn = Animation.easeIn
    static let curveEaseOut = Animation.easeOut
    static let curveEaseInOut = Animation.easeInOut
    static let curveSpring = Animation.spring()
    static let curveBouncy = Animation.spring(response: 0.5, dampingFraction: 0.6, blendDuration: 0)
    static let curveSmooth = Animation.interpolatingSpring(mass: 1, stiffness: 100, damping: 10, initialVelocity: 0)
}

struct AppIcon {
    static let systemName = "newspaper.fill"
    static let sizeSmall: CGFloat = 16
    static let sizeMedium: CGFloat = 24
    static let sizeLarge: CGFloat = 32
    static let sizeXLarge: CGFloat = 48
}

struct AppLayout {
    static let maxContentWidth: CGFloat = 600
    static let minTouchTarget: CGFloat = 44
    static let safeAreaTop: CGFloat = 44
    static let safeAreaBottom: CGFloat = 34
    
    static let screenPaddingHorizontal: CGFloat = 16
    static let screenPaddingVertical: CGFloat = 20
    
    static let componentPadding: CGFloat = 12
    static let componentSpacing: CGFloat = 8
    
    static let buttonHeight: CGFloat = 44
    static let buttonMinWidth: CGFloat = 120
    
    static let inputHeight: CGFloat = 44
    static let inputMinWidth: CGFloat = 200
    
    static let cardPadding: CGFloat = 16
    static let cardSpacing: CGFloat = 12
}

struct AppMetrics {
    static let animationFPS: Double = 60
    static let scrollThreshold: CGFloat = 50
    static let tapThreshold: CGFloat = 10
    static let swipeThreshold: CGFloat = 100
    
    static let debounceDelay: Double = 0.3
    static let throttleDelay: Double = 0.1
    
    static let maxRetries: Int = 3
    static let retryDelay: Double = 1.0
    
    static let cacheExpiry: TimeInterval = 3600 // 1 hour
    static let networkTimeout: TimeInterval = 30
    
    static let maxImageSize: CGFloat = 2048
    static let maxFileSize: Int = 10 * 1024 * 1024 // 10MB
    
    static let analyticsBatchSize: Int = 50
    static let analyticsFlushInterval: TimeInterval = 300 // 5 minutes
}

struct AppStrings {
    static let appName = "Piper Newsletter"
    static let tagline = "Your personalized newsletter experience"
    
    static let loading = "Loading..."
    static let error = "Something went wrong"
    static let retry = "Retry"
    static let cancel = "Cancel"
    static let ok = "OK"
    static let save = "Save"
    static let delete = "Delete"
    static let edit = "Edit"
    static let share = "Share"
    static let search = "Search"
    static let filter = "Filter"
    static let sort = "Sort"
    static let refresh = "Refresh"
    
    static let home = "Home"
    static let analytics = "Analytics"
    static let profile = "Profile"
    static let settings = "Settings"
    
    static let login = "Login"
    static let register = "Register"
    static let logout = "Logout"
    static let forgotPassword = "Forgot Password?"
    static let email = "Email"
    static let password = "Password"
    static let name = "Name"
    static let confirmPassword = "Confirm Password"
    
    static let newsletters = "Newsletters"
    static let newsletterDetail = "Newsletter Detail"
    static let subscribers = "Subscribers"
    static let performance = "Performance"
    static let preferences = "Preferences"
    
    static let openRate = "Open Rate"
    static let clickRate = "Click Rate"
    static let unsubscribeRate = "Unsubscribe Rate"
    static let bounceRate = "Bounce Rate"
    static let conversionRate = "Conversion Rate"
    
    static let totalSubscribers = "Total Subscribers"
    static let activeSubscribers = "Active Subscribers"
    static let newSubscribers = "New Subscribers"
    static let churnRate = "Churn Rate"
    
    static let lastUpdated = "Last Updated"
    static let lastSent = "Last Sent"
    static let frequency = "Frequency"
    static let status = "Status"
    
    static let success = "Success"
    static let warning = "Warning"
    static let info = "Info"
    static let critical = "Critical"
    
    static let noData = "No data available"
    static let noResults = "No results found"
    static let noConnection = "No internet connection"
    static let serverError = "Server error"
    static let authenticationError = "Authentication error"
    static let authorizationError = "Authorization error"
    static let validationError = "Validation error"
    static let networkError = "Network error"
    static let timeoutError = "Request timeout"
    static let unknownError = "Unknown error"
}