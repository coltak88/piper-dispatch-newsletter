package com.piper.newsletter.android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Color System
object AppColors {
    // Primary Colors
    val Primary = Color(0xFF0066CC)
    val PrimaryDark = Color(0xFF004499)
    val PrimaryLight = Color(0xFF3388DD)
    
    // Secondary Colors
    val Secondary = Color(0xFF6B46C1)
    val SecondaryDark = Color(0xFF553C9A)
    val SecondaryLight = Color(0xFF8B5CF6)
    
    // Semantic Colors
    val Success = Color(0xFF10B981)
    val Warning = Color(0xFFF59E0B)
    val Error = Color(0xFFEF4444)
    val Info = Color(0xFF3B82F6)
    
    // Neutral Colors
    val Background = Color(0xFFF8FAFC)
    val Surface = Color(0xFFFFFFFF)
    val SurfaceVariant = Color(0xFFF1F5F9)
    val Border = Color(0xFFE2E8F0)
    
    // Text Colors
    val TextPrimary = Color(0xFF1E293B)
    val TextSecondary = Color(0xFF64748B)
    val TextTertiary = Color(0xFF94A3B8)
    val TextInverse = Color(0xFFFFFFFF)
    
    // Chart Colors
    val ChartPrimary = Color(0xFF3B82F6)
    val ChartSecondary = Color(0xFF10B981)
    val ChartTertiary = Color(0xFFF59E0B)
    val ChartQuaternary = Color(0xFFEF4444)
    
    // Dark Theme Colors
    val DarkBackground = Color(0xFF0F172A)
    val DarkSurface = Color(0xFF1E293B)
    val DarkSurfaceVariant = Color(0xFF334155)
    val DarkBorder = Color(0xFF475569)
    val DarkTextPrimary = Color(0xFFF8FAFC)
    val DarkTextSecondary = Color(0xFFCBD5E1)
    val DarkTextTertiary = Color(0xFF94A3B8)
}

// Typography System
object AppTypography {
    // Display Styles
    val DisplayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 57.sp,
        lineHeight = 64.sp,
        letterSpacing = (-0.25).sp
    )
    
    val DisplayMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 45.sp,
        lineHeight = 52.sp,
        letterSpacing = 0.sp
    )
    
    val DisplaySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 36.sp,
        lineHeight = 44.sp,
        letterSpacing = 0.sp
    )
    
    // Headline Styles
    val HeadlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 32.sp,
        lineHeight = 40.sp,
        letterSpacing = 0.sp
    )
    
    val HeadlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.sp
    )
    
    val HeadlineSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        letterSpacing = 0.sp
    )
    
    // Title Styles
    val TitleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    )
    
    val TitleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    )
    
    val TitleSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    )
    
    // Body Styles
    val BodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    )
    
    val BodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    )
    
    val BodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp
    )
    
    // Label Styles
    val LabelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    )
    
    val LabelMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
    
    val LabelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
}

// Spacing System
object AppSpacing {
    // Base spacing unit = 4dp
    val XXSmall: Int = 1  // 4dp
    val XSmall: Int = 2   // 8dp
    val Small: Int = 3    // 12dp
    val Medium: Int = 4   // 16dp
    val Large: Int = 6    // 24dp
    val XLarge: Int = 8   // 32dp
    val XXLarge: Int = 12 // 48dp
    val XXXLarge: Int = 16 // 64dp
    
    // Specific spacing values
    val CardPadding: Int = 16
    val ButtonPadding: Int = 16
    val TextFieldPadding: Int = 12
    val ListItemPadding: Int = 16
    val ScreenPadding: Int = 16
}

// Corner Radius System
object AppCornerRadius {
    val Small: Dp = 4.dp
    val Medium: Dp = 8.dp
    val Large: Dp = 12.dp
    val XLarge: Dp = 16.dp
    val XXLarge: Dp = 24.dp
    val Full: Dp = 50.dp
}

// Elevation System
object AppElevation {
    val Level0: Dp = 0.dp
    val Level1: Dp = 1.dp
    val Level2: Dp = 3.dp
    val Level3: Dp = 6.dp
    val Level4: Dp = 8.dp
    val Level5: Dp = 12.dp
}

// Animation System
object AppAnimation {
    val DurationShort: Int = 150
    val DurationMedium: Int = 300
    val DurationLong: Int = 500
    val DurationExtraLong: Int = 1000
    
    val EasingLinear = androidx.compose.animation.core.LinearEasing
    val EasingStandard = androidx.compose.material3.tokens.MotionTokens.EasingStandard
    val EasingDecelerate = androidx.compose.animation.core.FastOutSlowInEasing
    val EasingAccelerate = androidx.compose.animation.core.LinearOutSlowInEasing
}

// Strings System
object AppStrings {
    // App Name
    const val AppName = "Piper Newsletter"
    
    // Common Labels
    const val Loading = "Loading..."
    const val Retry = "Retry"
    const val Cancel = "Cancel"
    const val Save = "Save"
    const val Delete = "Delete"
    const val Edit = "Edit"
    const val Share = "Share"
    const val Search = "Search"
    const val Filter = "Filter"
    const val Sort = "Sort"
    const val Back = "Back"
    const val Next = "Next"
    const val Previous = "Previous"
    const val Close = "Close"
    
    // Navigation Labels
    const val Home = "Home"
    const val Analytics = "Analytics"
    const val Profile = "Profile"
    const val Newsletter = "Newsletter"
    
    // Error Messages
    const val ErrorGeneric = "Something went wrong. Please try again."
    const val ErrorNetwork = "Network connection error. Please check your connection."
    const val ErrorAuthentication = "Authentication failed. Please try again."
    const val ErrorValidation = "Please check your input and try again."
    
    // Success Messages
    const val SuccessSaved = "Changes saved successfully!"
    const val SuccessDeleted = "Item deleted successfully!"
    const val SuccessShared = "Content shared successfully!"
}

// Metrics System
object AppMetrics {
    // Screen Metrics
    const val MaxContentWidth = 600
    const val MaxCardWidth = 400
    const val MaxDialogWidth = 400
    const val MaxSheetWidth = 600
    
    // Component Metrics
    const val ButtonMinWidth = 120
    const val ButtonMaxWidth = 200
    const val TextFieldMinWidth = 200
    const val CardMinWidth = 280
    const val ListItemMinHeight = 72
    
    // Chart Metrics
    const val ChartMinHeight = 200
    const val ChartMaxHeight = 400
    const val ChartBarWidth = 32
    const val ChartPointRadius = 4
}

// Layout System
object AppLayout {
    // Grid System
    const val GridColumns = 12
    const val GridGutter = 16
    const val GridMargin = 16
    
    // Breakpoints
    const val BreakpointMobile = 360
    const val BreakpointTablet = 768
    const val BreakpointDesktop = 1024
    const val BreakpointLarge = 1440
    
    // Layout Types
    const val LayoutSingleColumn = "single_column"
    const val LayoutTwoColumn = "two_column"
    const val LayoutThreeColumn = "three_column"
    const val LayoutGrid = "grid"
}

// Icon System
object AppIcon {
    // Icon Sizes
    val Small: Dp = 16.dp
    val Medium: Dp = 24.dp
    val Large: Dp = 32.dp
    val XLarge: Dp = 48.dp
    
    // Icon Names (references to drawable resources)
    const val IconHome = "ic_home"
    const val IconAnalytics = "ic_analytics"
    const val IconProfile = "ic_profile"
    const val IconNewsletter = "ic_newsletter"
    const val IconSearch = "ic_search"
    const val IconFilter = "ic_filter"
    const val IconSort = "ic_sort"
    const val IconShare = "ic_share"
    const val IconBookmark = "ic_bookmark"
    const val IconSettings = "ic_settings"
    const val IconBack = "ic_back"
    const val IconClose = "ic_close"
    const val IconRefresh = "ic_refresh"
    const val IconError = "ic_error"
    const val IconSuccess = "ic_success"
    const val IconWarning = "ic_warning"
    const val IconInfo = "ic_info"
}

// Theme Composable
@Composable
fun PiperNewsletterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && androidx.compose.foundation.Build.VERSION.SDK_INT >= androidx.compose.foundation.Build.VERSION_CODES.S -> {
            val context = androidx.compose.ui.platform.LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> darkColorScheme(
            primary = AppColors.Primary,
            secondary = AppColors.Secondary,
            tertiary = AppColors.Info,
            background = AppColors.DarkBackground,
            surface = AppColors.DarkSurface,
            surfaceVariant = AppColors.DarkSurfaceVariant,
            error = AppColors.Error,
            onPrimary = AppColors.TextInverse,
            onSecondary = AppColors.TextInverse,
            onBackground = AppColors.DarkTextPrimary,
            onSurface = AppColors.DarkTextPrimary,
            onSurfaceVariant = AppColors.DarkTextSecondary,
            onError = AppColors.TextInverse
        )
        else -> lightColorScheme(
            primary = AppColors.Primary,
            secondary = AppColors.Secondary,
            tertiary = AppColors.Info,
            background = AppColors.Background,
            surface = AppColors.Surface,
            surfaceVariant = AppColors.SurfaceVariant,
            error = AppColors.Error,
            onPrimary = AppColors.TextInverse,
            onSecondary = AppColors.TextInverse,
            onBackground = AppColors.TextPrimary,
            onSurface = AppColors.TextPrimary,
            onSurfaceVariant = AppColors.TextSecondary,
            onError = AppColors.TextInverse
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(
            displayLarge = AppTypography.DisplayLarge,
            displayMedium = AppTypography.DisplayMedium,
            displaySmall = AppTypography.DisplaySmall,
            headlineLarge = AppTypography.HeadlineLarge,
            headlineMedium = AppTypography.HeadlineMedium,
            headlineSmall = AppTypography.HeadlineSmall,
            titleLarge = AppTypography.TitleLarge,
            titleMedium = AppTypography.TitleMedium,
            titleSmall = AppTypography.TitleSmall,
            bodyLarge = AppTypography.BodyLarge,
            bodyMedium = AppTypography.BodyMedium,
            bodySmall = AppTypography.BodySmall,
            labelLarge = AppTypography.LabelLarge,
            labelMedium = AppTypography.LabelMedium,
            labelSmall = AppTypography.LabelSmall
        ),
        content = content
    )
}