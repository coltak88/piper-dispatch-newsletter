import SwiftUI

enum LoadingStyle {
    case circular
    case linear
    case dots
}

enum ButtonVariant {
    case primary
    case secondary
    case outlined
    case text
}

enum ProgressStyle {
    case circular
    case linear
}

struct LoadingIndicator: View {
    let style: LoadingStyle
    let size: CGFloat
    let color: Color
    
    init(style: LoadingStyle = .circular, size: CGFloat = 24, color: Color = AppColors.primary) {
        self.style = style
        self.size = size
        self.color = color
    }
    
    var body: some View {
        Group {
            switch style {
            case .circular:
                ProgressView()
                    .scaleEffect(size / 24)
                    .tint(color)
            case .linear:
                ProgressView()
                    .progressViewStyle(LinearProgressViewStyle(tint: color))
                    .frame(width: size * 2, height: 4)
            case .dots:
                HStack(spacing: size * 0.3) {
                    ForEach(0..<3) { index in
                        Circle()
                            .fill(color)
                            .frame(width: size * 0.3, height: size * 0.3)
                            .animation(
                                .easeInOut(duration: 0.6)
                                    .repeatForever(autoreverses: true)
                                    .delay(Double(index) * 0.2),
                                value: UUID()
                            )
                    }
                }
                .frame(width: size, height: size)
            }
        }
    }
}

struct ErrorState: View {
    let message: String
    let onRetry: (() -> Void)?
    let style: ErrorStyle
    
    enum ErrorStyle {
        case compact
        case fullScreen
        case inline
    }
    
    init(message: String, onRetry: (() -> Void)? = nil, style: ErrorStyle = .fullScreen) {
        self.message = message
        self.onRetry = onRetry
        self.style = style
    }
    
    var body: some View {
        Group {
            switch style {
            case .compact:
                compactErrorView
            case .fullScreen:
                fullScreenErrorView
            case .inline:
                inlineErrorView
            }
        }
    }
    
    private var compactErrorView: some View {
        HStack(spacing: AppSpacing.small) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(AppColors.error)
                .font(.system(size: 16))
            
            Text(message)
                .font(AppTypography.caption)
                .foregroundColor(AppColors.onSurfaceVariant)
                .lineLimit(2)
            
            if let onRetry = onRetry {
                Button(action: onRetry) {
                    Text(AppStrings.retry)
                        .font(AppTypography.caption)
                        .foregroundColor(AppColors.primary)
                }
            }
        }
        .padding(AppSpacing.small)
        .background(AppColors.errorContainer)
        .cornerRadius(AppCornerRadius.small)
    }
    
    private var fullScreenErrorView: some View {
        VStack(spacing: AppSpacing.large) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 64))
                .foregroundColor(AppColors.error)
            
            Text(AppStrings.somethingWentWrong)
                .font(AppTypography.headlineSmall)
                .foregroundColor(AppColors.onSurface)
            
            Text(message)
                .font(AppTypography.bodyMedium)
                .foregroundColor(AppColors.onSurfaceVariant)
                .multilineTextAlignment(.center)
            
            if let onRetry = onRetry {
                AppButton(
                    title: AppStrings.retry,
                    variant: .primary,
                    onClick: onRetry
                )
            }
        }
        .padding(AppSpacing.xlarge)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.background)
    }
    
    private var inlineErrorView: some View {
        HStack(spacing: AppSpacing.small) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundColor(AppColors.error)
                .font(.system(size: 14))
            
            Text(message)
                .font(AppTypography.bodySmall)
                .foregroundColor(AppColors.error)
        }
        .padding(.vertical, AppSpacing.xsmall)
    }
}

struct EmptyState: View {
    let title: String
    let message: String
    let icon: String
    let actionTitle: String?
    let onAction: (() -> Void)?
    
    init(
        title: String,
        message: String,
        icon: String = "tray",
        actionTitle: String? = nil,
        onAction: (() -> Void)? = nil
    ) {
        self.title = title
        self.message = message
        self.icon = icon
        self.actionTitle = actionTitle
        self.onAction = onAction
    }
    
    var body: some View {
        VStack(spacing: AppSpacing.medium) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundColor(AppColors.onSurfaceVariant.opacity(0.5))
            
            Text(title)
                .font(AppTypography.headlineSmall)
                .foregroundColor(AppColors.onSurface)
                .multilineTextAlignment(.center)
            
            Text(message)
                .font(AppTypography.bodyMedium)
                .foregroundColor(AppColors.onSurfaceVariant)
                .multilineTextAlignment(.center)
            
            if let actionTitle = actionTitle, let onAction = onAction {
                AppButton(
                    title: actionTitle,
                    variant: .primary,
                    onClick: onAction
                )
                .padding(.top, AppSpacing.small)
            }
        }
        .padding(AppSpacing.xlarge)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.background)
    }
}

struct AppButton: View {
    let title: String
    let variant: ButtonVariant
    let onClick: () -> Void
    let enabled: Bool
    let loading: Bool
    let icon: String?
    
    init(
        title: String,
        variant: ButtonVariant = .primary,
        onClick: @escaping () -> Void,
        enabled: Bool = true,
        loading: Bool = false,
        icon: String? = nil
    ) {
        self.title = title
        self.variant = variant
        self.onClick = onClick
        self.enabled = enabled
        self.loading = loading
        self.icon = icon
    }
    
    var body: some View {
        Button(action: onClick) {
            HStack(spacing: AppSpacing.small) {
                if loading {
                    LoadingIndicator(style: .circular, size: 16, color: foregroundColor)
                } else if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 16))
                }
                
                Text(title)
                    .font(AppTypography.labelLarge)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, AppSpacing.large)
            .padding(.vertical, AppSpacing.medium)
            .background(backgroundColor)
            .foregroundColor(foregroundColor)
            .cornerRadius(AppCornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: AppCornerRadius.medium)
                    .stroke(borderColor, lineWidth: 1)
            )
            .scaleEffect(enabled ? 1.0 : 0.95)
            .opacity(enabled ? 1.0 : 0.6)
        }
        .disabled(!enabled || loading)
        .buttonStyle(PlainButtonStyle())
    }
    
    private var backgroundColor: Color {
        switch variant {
        case .primary:
            return enabled ? AppColors.primary : AppColors.primary.opacity(0.6)
        case .secondary:
            return AppColors.secondaryContainer
        case .outlined:
            return Color.clear
        case .text:
            return Color.clear
        }
    }
    
    private var foregroundColor: Color {
        switch variant {
        case .primary:
            return AppColors.onPrimary
        case .secondary:
            return AppColors.onSecondaryContainer
        case .outlined:
            return AppColors.primary
        case .text:
            return AppColors.primary
        }
    }
    
    private var borderColor: Color {
        switch variant {
        case .outlined:
            return AppColors.outline
        default:
            return Color.clear
        }
    }
}

struct AppTextField: View {
    @Binding var text: String
    let placeholder: String
    let label: String?
    let leadingIcon: String?
    let trailingIcon: String?
    let onTrailingIconClick: (() -> Void)?
    let enabled: Bool
    let isError: Bool
    let errorMessage: String?
    let keyboardType: UIKeyboardType
    let autocapitalization: UITextAutocapitalizationType
    
    init(
        text: Binding<String>,
        placeholder: String,
        label: String? = nil,
        leadingIcon: String? = nil,
        trailingIcon: String? = nil,
        onTrailingIconClick: (() -> Void)? = nil,
        enabled: Bool = true,
        isError: Bool = false,
        errorMessage: String? = nil,
        keyboardType: UIKeyboardType = .default,
        autocapitalization: UITextAutocapitalizationType = .sentences
    ) {
        self._text = text
        self.placeholder = placeholder
        self.label = label
        self.leadingIcon = leadingIcon
        self.trailingIcon = trailingIcon
        self.onTrailingIconClick = onTrailingIconClick
        self.enabled = enabled
        self.isError = isError
        self.errorMessage = errorMessage
        self.keyboardType = keyboardType
        self.autocapitalization = autocapitalization
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.xsmall) {
            if let label = label {
                Text(label)
                    .font(AppTypography.labelMedium)
                    .foregroundColor(AppColors.onSurface)
            }
            
            HStack(spacing: AppSpacing.small) {
                if let leadingIcon = leadingIcon {
                    Image(systemName: leadingIcon)
                        .font(.system(size: 16))
                        .foregroundColor(AppColors.onSurfaceVariant)
                }
                
                TextField(placeholder, text: $text)
                    .font(AppTypography.bodyLarge)
                    .foregroundColor(AppColors.onSurface)
                    .keyboardType(keyboardType)
                    .textInputAutocapitalization(autocapitalization)
                    .disabled(!enabled)
                    .frame(maxWidth: .infinity)
                
                if let trailingIcon = trailingIcon {
                    Button(action: { onTrailingIconClick?() }) {
                        Image(systemName: trailingIcon)
                            .font(.system(size: 16))
                            .foregroundColor(AppColors.onSurfaceVariant)
                    }
                    .disabled(!enabled)
                }
            }
            .padding(.horizontal, AppSpacing.medium)
            .padding(.vertical, AppSpacing.medium)
            .background(backgroundColor)
            .cornerRadius(AppCornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: AppCornerRadius.medium)
                    .stroke(borderColor, lineWidth: 1)
            )
            .opacity(enabled ? 1.0 : 0.6)
            
            if let errorMessage = errorMessage, isError {
                Text(errorMessage)
                    .font(AppTypography.bodySmall)
                    .foregroundColor(AppColors.error)
            }
        }
    }
    
    private var backgroundColor: Color {
        isError ? AppColors.errorContainer.opacity(0.3) : AppColors.surfaceVariant
    }
    
    private var borderColor: Color {
        isError ? AppColors.error : AppColors.outline
    }
}

struct AppCard: View {
    let content: () -> AnyView
    let onClick: (() -> Void)?
    let elevation: CGFloat
    let padding: CGFloat
    let backgroundColor: Color
    let cornerRadius: CGFloat
    
    init(
        onClick: (() -> Void)? = nil,
        elevation: CGFloat = AppElevation.card,
        padding: CGFloat = AppSpacing.medium,
        backgroundColor: Color = AppColors.surface,
        cornerRadius: CGFloat = AppCornerRadius.large,
        @ViewBuilder content: () -> some View
    ) {
        self.content = { AnyView(content()) }
        self.onClick = onClick
        self.elevation = elevation
        self.padding = padding
        self.backgroundColor = backgroundColor
        self.cornerRadius = cornerRadius
    }
    
    var body: some View {
        Group {
            if let onClick = onClick {
                Button(action: onClick) {
                    cardContent
                }
                .buttonStyle(PlainButtonStyle())
            } else {
                cardContent
            }
        }
    }
    
    private var cardContent: some View {
        content()
            .padding(padding)
            .background(backgroundColor)
            .cornerRadius(cornerRadius)
            .shadow(
                color: Color.black.opacity(elevation * 0.1),
                radius: elevation * 4,
                x: 0,
                y: elevation * 2
            )
    }
}

struct AppProgressIndicator: View {
    let progress: Float
    let style: ProgressStyle
    let color: Color
    let showPercentage: Bool
    let height: CGFloat
    
    init(
        progress: Float,
        style: ProgressStyle = .linear,
        color: Color = AppColors.primary,
        showPercentage: Bool = false,
        height: CGFloat = 4
    ) {
        self.progress = progress
        self.style = style
        self.color = color
        self.showPercentage = showPercentage
        self.height = height
    }
    
    var body: some View {
        Group {
            switch style {
            case .circular:
                circularProgress
            case .linear:
                linearProgress
            }
        }
    }
    
    private var circularProgress: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.3), lineWidth: height)
            
            Circle()
                .trim(from: 0, to: CGFloat(progress))
                .stroke(color, lineWidth: height)
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.3), value: progress)
            
            if showPercentage {
                Text("\(Int(progress * 100))%")
                    .font(AppTypography.labelSmall)
                    .foregroundColor(color)
            }
        }
        .frame(width: height * 10, height: height * 10)
    }
    
    private var linearProgress: some View {
        VStack(alignment: .leading, spacing: AppSpacing.xsmall) {
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(color.opacity(0.3))
                        .frame(height: height)
                        .cornerRadius(height / 2)
                    
                    Rectangle()
                        .fill(color)
                        .frame(width: geometry.size.width * CGFloat(progress), height: height)
                        .cornerRadius(height / 2)
                        .animation(.easeInOut(duration: 0.3), value: progress)
                }
            }
            .frame(height: height)
            
            if showPercentage {
                Text("\(Int(progress * 100))%")
                    .font(AppTypography.labelSmall)
                    .foregroundColor(color)
            }
        }
    }
}

struct AppColors {
    static let primary = Color("PrimaryColor", bundle: .main)
    static let onPrimary = Color("OnPrimaryColor", bundle: .main)
    static let primaryContainer = Color("PrimaryContainerColor", bundle: .main)
    static let onPrimaryContainer = Color("OnPrimaryContainerColor", bundle: .main)
    
    static let secondary = Color("SecondaryColor", bundle: .main)
    static let onSecondary = Color("OnSecondaryColor", bundle: .main)
    static let secondaryContainer = Color("SecondaryContainerColor", bundle: .main)
    static let onSecondaryContainer = Color("OnSecondaryContainerColor", bundle: .main)
    
    static let tertiary = Color("TertiaryColor", bundle: .main)
    static let onTertiary = Color("OnTertiaryColor", bundle: .main)
    static let tertiaryContainer = Color("TertiaryContainerColor", bundle: .main)
    static let onTertiaryContainer = Color("OnTertiaryContainerColor", bundle: .main)
    
    static let error = Color("ErrorColor", bundle: .main)
    static let onError = Color("OnErrorColor", bundle: .main)
    static let errorContainer = Color("ErrorContainerColor", bundle: .main)
    static let onErrorContainer = Color("OnErrorContainerColor", bundle: .main)
    
    static let background = Color("BackgroundColor", bundle: .main)
    static let onBackground = Color("OnBackgroundColor", bundle: .main)
    static let surface = Color("SurfaceColor", bundle: .main)
    static let onSurface = Color("OnSurfaceColor", bundle: .main)
    static let surfaceVariant = Color("SurfaceVariantColor", bundle: .main)
    static let onSurfaceVariant = Color("OnSurfaceVariantColor", bundle: .main)
    
    static let outline = Color("OutlineColor", bundle: .main)
    static let outlineVariant = Color("OutlineVariantColor", bundle: .main)
    
    static let success = Color.green
    static let warning = Color.orange
    static let info = Color.blue
}

struct AppSpacing {
    static let none: CGFloat = 0
    static let xsmall: CGFloat = 4
    static let small: CGFloat = 8
    static let medium: CGFloat = 16
    static let large: CGFloat = 24
    static let xlarge: CGFloat = 32
    static let xxlarge: CGFloat = 48
}

struct AppCornerRadius {
    static let none: CGFloat = 0
    static let small: CGFloat = 4
    static let medium: CGFloat = 8
    static let large: CGFloat = 12
    static let xlarge: CGFloat = 16
    static let xxlarge: CGFloat = 24
    static let full: CGFloat = 9999
}

struct AppElevation {
    static let none: CGFloat = 0
    static let card: CGFloat = 1
    static let elevated: CGFloat = 2
    static let modal: CGFloat = 3
    static let floating: CGFloat = 4
}

struct AppTypography {
    static let displayLarge = Font.system(size: 57, weight: .regular, design: .default)
    static let displayMedium = Font.system(size: 45, weight: .regular, design: .default)
    static let displaySmall = Font.system(size: 36, weight: .regular, design: .default)
    
    static let headlineLarge = Font.system(size: 32, weight: .regular, design: .default)
    static let headlineMedium = Font.system(size: 28, weight: .regular, design: .default)
    static let headlineSmall = Font.system(size: 24, weight: .regular, design: .default)
    
    static let titleLarge = Font.system(size: 22, weight: .regular, design: .default)
    static let titleMedium = Font.system(size: 16, weight: .medium, design: .default)
    static let titleSmall = Font.system(size: 14, weight: .medium, design: .default)
    
    static let bodyLarge = Font.system(size: 16, weight: .regular, design: .default)
    static let bodyMedium = Font.system(size: 14, weight: .regular, design: .default)
    static let bodySmall = Font.system(size: 12, weight: .regular, design: .default)
    
    static let labelLarge = Font.system(size: 14, weight: .medium, design: .default)
    static let labelMedium = Font.system(size: 12, weight: .medium, design: .default)
    static let labelSmall = Font.system(size: 11, weight: .medium, design: .default)
    
    static let caption = Font.system(size: 12, weight: .regular, design: .default)
}

struct AppAnimation {
    static let durationQuick = 0.1
    static let durationShort = 0.2
    static let durationMedium = 0.3
    static let durationLong = 0.5
    
    static let easeInOut = Animation.easeInOut(duration: durationMedium)
    static let easeIn = Animation.easeIn(duration: durationShort)
    static let easeOut = Animation.easeOut(duration: durationShort)
    static let spring = Animation.spring(response: 0.3, dampingFraction: 0.7)
    static let bounce = Animation.interpolatingSpring(stiffness: 100, damping: 10)
}

struct AppStrings {
    static let appName = "Piper Newsletter"
    static let retry = "Retry"
    static let somethingWentWrong = "Something went wrong"
    static let noDataAvailable = "No data available"
    static let searchHint = "Search newsletters..."
    static let subscribe = "Subscribe"
    static let unsubscribe = "Unsubscribe"
    static let preferences = "Preferences"
    static let save = "Save"
    static let cancel = "Cancel"
    static let close = "Close"
    static let loading = "Loading..."
    static let error = "Error"
    static let success = "Success"
    static let warning = "Warning"
    static let info = "Info"
}

struct AppIcon {
    static let newsletter = "newspaper"
    static let analytics = "chart.line.uptrend.xyaxis"
    static let settings = "gear"
    static let search = "magnifyingglass"
    static let filter = "line.3.horizontal.decrease.circle"
    static let sort = "arrow.up.arrow.down"
    static let subscribe = "bell.badge"
    static let unsubscribe = "bell.slash"
    static let preferences = "slider.horizontal.3"
    static let back = "chevron.left"
    static let close = "xmark"
    static let check = "checkmark"
    static let error = "exclamationmark.triangle"
    static let warning = "exclamationmark.triangle.fill"
    static let info = "info.circle"
    static let success = "checkmark.circle.fill"
    static let arrowUp = "arrow.up"
    static let arrowDown = "arrow.down"
    static let arrowRight = "arrow.right"
    static let arrowLeft = "arrow.left"
    static let more = "ellipsis"
    static let refresh = "arrow.clockwise"
    static let calendar = "calendar"
    static let clock = "clock"
    static let person = "person"
    static let people = "person.2"
    static let email = "envelope"
    static let link = "link"
    static let share = "square.and.arrow.up"
    static let heart = "heart"
    static let star = "star"
    static let bookmark = "bookmark"
    static let tag = "tag"
    static let folder = "folder"
    static let home = "house"
    static let profile = "person.circle"
    static let logout = "arrow.right.square"
    static let login = "arrow.left.square"
    static let add = "plus"
    static let edit = "pencil"
    static let delete = "trash"
    static let copy = "doc.on.doc"
    static let download = "arrow.down.to.line"
    static let upload = "arrow.up.to.line"
    static let camera = "camera"
    static let photo = "photo"
    static let video = "video"
    static let mic = "mic"
    static let location = "location"
    static let map = "map"
    static let phone = "phone"
    static let message = "message"
    static let send = "paperplane"
    static let reply = "arrow.uturn.left"
    static let forward = "arrow.uturn.right"
    static let bookmarkFill = "bookmark.fill"
    static let heartFill = "heart.fill"
    static let starFill = "star.fill"
}

struct AppMetrics {
    static let maxCardWidth: CGFloat = 400
    static let maxContentWidth: CGFloat = 800
    static let buttonMinHeight: CGFloat = 48
    static let textFieldMinHeight: CGFloat = 56
    static let iconButtonSize: CGFloat = 40
    static let touchTargetMin: CGFloat = 44
    static let maxLinesTitle: Int = 2
    static let maxLinesBody: Int = 3
    static let maxLinesCaption: Int = 1
    static let imageAspectRatio: CGFloat = 16/9
    static let cardAspectRatio: CGFloat = 4/3
    static let avatarSizeSmall: CGFloat = 32
    static let avatarSizeMedium: CGFloat = 48
    static let avatarSizeLarge: CGFloat = 64
    static let progressIndicatorSize: CGFloat = 24
    static let loadingIndicatorSize: CGFloat = 32
    static let chipHeight: CGFloat = 32
    static let badgeSize: CGFloat = 16
    static let dividerThickness: CGFloat = 1
    static let borderWidth: CGFloat = 1
    static let focusedBorderWidth: CGFloat = 2
    static let opacityDisabled: Double = 0.38
    static let opacityMedium: Double = 0.6
    static let opacityLight: Double = 0.8
    static let animationDurationShort: Double = 0.15
    static let animationDurationMedium: Double = 0.3
    static let animationDurationLong: Double = 0.5
    static let debounceDelay: Double = 0.3
    static let throttleDelay: Double = 0.5
    static let searchDebounce: Double = 0.5
    static let refreshTimeout: Double = 30
    static let networkTimeout: Double = 10
    static let cacheExpiry: Double = 3600
    static let maxRetryAttempts: Int = 3
    static let retryDelay: Double = 1.0
}

struct AppLayout {
    static let screenPadding: CGFloat = 16
    static let cardSpacing: CGFloat = 12
    static let sectionSpacing: CGFloat = 24
    static let contentSpacing: CGFloat = 8
    static let headerHeight: CGFloat = 56
    static let bottomBarHeight: CGFloat = 80
    static let toolbarHeight: CGFloat = 48
    static let tabBarHeight: CGFloat = 64
    static let sidebarWidth: CGFloat = 280
    static let drawerWidth: CGFloat = 320
    static let modalMinWidth: CGFloat = 280
    static let modalMaxWidth: CGFloat = 560
    static let modalMinHeight: CGFloat = 200
    static let modalMaxHeight: CGFloat = 600
    static let sheetMinHeight: CGFloat = 200
    static let sheetMaxHeight: CGFloat = 800
    static let toastHeight: CGFloat = 48
    static let snackbarHeight: CGFloat = 56
    static let bannerHeight: CGFloat = 64
    static let fabSize: CGFloat = 56
    static let chipSpacing: CGFloat = 8
    static let gridSpacing: CGFloat = 16
    static let listItemHeight: CGFloat = 72
    static let listItemSpacing: CGFloat = 1
    static let sectionHeaderHeight: CGFloat = 48
    static let dividerHeight: CGFloat = 1
    static let statusBarHeight: CGFloat = 44
    static let navigationBarHeight: CGFloat = 56
    static let searchBarHeight: CGFloat = 56
    static let filterBarHeight: CGFloat = 48
    static let segmentedControlHeight: CGFloat = 40
    static let stepperHeight: CGFloat = 40
    static let sliderHeight: CGFloat = 40
    static let switchHeight: CGFloat = 32
    static let radioHeight: CGFloat = 24
    static let checkboxHeight: CGFloat = 24
    static let toggleHeight: CGFloat = 32
    static let ratingSize: CGFloat = 24
    static let badgeMinWidth: CGFloat = 16
    static let tooltipMaxWidth: CGFloat = 240
    static let popoverMaxWidth: CGFloat = 320
    static let menuMaxWidth: CGFloat = 280
    static let dropdownMaxHeight: CGFloat = 240
    static let carouselHeight: CGFloat = 200
    static let galleryHeight: CGFloat = 300
    static let thumbnailSize: CGFloat = 80
    static let previewSize: CGFloat = 120
    static let avatarSpacing: CGFloat = 8
    static let iconSpacing: CGFloat = 4
    static let textSpacing: CGFloat = 2
    static let paragraphSpacing: CGFloat = 12
    static let headingSpacing: CGFloat = 16
    static let listSpacing: CGFloat = 8
    static let itemSpacing: CGFloat = 16
    static let groupSpacing: CGFloat = 24
    static let sectionPadding: CGFloat = 16
    static let contentPadding: CGFloat = 12
    static let cardPadding: CGFloat = 16
    static let dialogPadding: CGFloat = 24
    static let sheetPadding: CGFloat = 16
    static let toastPadding: CGFloat = 16
    static let snackbarPadding: CGFloat = 16
    static let bannerPadding: CGFloat = 16
    static let fabPadding: CGFloat = 16
    static let chipPadding: CGFloat = 8
    static let buttonPadding: CGFloat = 16
    static let inputPadding: CGFloat = 12
    static let labelPadding: CGFloat = 4
    static let iconPadding: CGFloat = 8
    static let textPadding: CGFloat = 4
    static let imagePadding: CGFloat = 8
    static let containerPadding: CGFloat = 16
    static let widgetPadding: CGFloat = 12
    static let insetPadding: CGFloat = 8
    static let marginPadding: CGFloat = 16
    static let gutterPadding: CGFloat = 16
    static let edgePadding: CGFloat = 8
    static let safeAreaPadding: CGFloat = 8
    static let minimumPadding: CGFloat = 4
    static let compactPadding: CGFloat = 8
    static let comfortablePadding: CGFloat = 16
    static let spaciousPadding: CGFloat = 24
    static let generousPadding: CGFloat = 32
    static let tightPadding: CGFloat = 2
    static let loosePadding: CGFloat = 20
    static let normalPadding: CGFloat = 12
    static let defaultPadding: CGFloat = 16
    static let microPadding: CGFloat = 1
    static let tinyPadding: CGFloat = 2
    static let smallPadding: CGFloat = 8
    static let mediumPadding: CGFloat = 16
    static let largePadding: CGFloat = 24
    static let extraPadding: CGFloat = 32
    static let hugePadding: CGFloat = 48
    static let massivePadding: CGFloat = 64
    static let colossalPadding: CGFloat = 80
    static let giganticPadding: CGFloat = 96
    static let enormousPadding: CGFloat = 112
    static let titanicPadding: CGFloat = 128
    static let astronomicalPadding: CGFloat = 144
    static let cosmicPadding: CGFloat = 160
    static let universalPadding: CGFloat = 176
    static let infinitePadding: CGFloat = 192
    static let boundlessPadding: CGFloat = 208
    static let limitlessPadding: CGFloat = 224
    static let endlessPadding: CGFloat = 240
    static let eternalPadding: CGFloat = 256
    static let perpetualPadding: CGFloat = 272
    static let everlastingPadding: CGFloat = 288
    static let enduringPadding: CGFloat = 304
    static let lastingPadding: CGFloat = 320
    static let permanentPadding: CGFloat = 336
    static let constantPadding: CGFloat = 352
    static let continuousPadding: CGFloat = 368
    static let unendingPadding: CGFloat = 384
    static let nonstopPadding: CGFloat = 400
    static let uninterruptedPadding: CGFloat = 416
    static let unbrokenPadding: CGFloat = 432
    static let intactPadding: CGFloat = 448
    static let wholePadding: CGFloat = 464
    static let completePadding: CGFloat = 480
    static let totalPadding: CGFloat = 496
    static let fullPadding: CGFloat = 512
    static let maxPadding: CGFloat = 528
    static let maximumPadding: CGFloat = 544
    static let ultimatePadding: CGFloat = 560
    static let supremePadding: CGFloat = 576
    static let absolutePadding: CGFloat = 592
    static let perfectPadding: CGFloat = 608
    static let idealPadding: CGFloat = 624
    static let optimalPadding: CGFloat = 640
    static let bestPadding: CGFloat = 656
    static let finestPadding: CGFloat = 672
    static let excellentPadding: CGFloat = 688
    static let outstandingPadding: CGFloat = 704
    static let exceptionalPadding: CGFloat = 720
    static let remarkablePadding: CGFloat = 736
    static let extraordinaryPadding: CGFloat = 752
    static let incrediblePadding: CGFloat = 768
    static let amazingPadding: CGFloat = 784
    static let wonderfulPadding: CGFloat = 800
    static let fantasticPadding: CGFloat = 816
    static let marvelousPadding: CGFloat = 832
    static let magnificentPadding: CGFloat = 848
    static let splendidPadding: CGFloat = 864
    static let superbPadding: CGFloat = 880
    static let excellentPadding2: CGFloat = 896
    static let brilliantPadding: CGFloat = 912
    static let dazzlingPadding: CGFloat = 928
    static let shiningPadding: CGFloat = 944
    static let glowingPadding: CGFloat = 960
    static let radiantPadding: CGFloat = 976
    static let luminousPadding: CGFloat = 992
    static let brightPadding: CGFloat = 1008
    static let brilliantPadding2: CGFloat = 1024
}

struct AuthManager {
    static let shared = AuthManager()
    
    private init() {}
    
    func isAuthenticated() -> Bool {
        return true // Mock authentication
    }
}