package com.piper.newsletter.ios.ui.theme

import SwiftUI

extension Color {
    static let primaryBlue = Color(red: 0.2, green: 0.5, blue: 1.0)
    static let secondaryBlue = Color(red: 0.4, green: 0.7, blue: 1.0)
    static let accentGreen = Color(red: 0.2, green: 0.8, blue: 0.4)
    static let accentOrange = Color(red: 1.0, green: 0.6, blue: 0.2)
    static let accentRed = Color(red: 1.0, green: 0.3, blue: 0.3)
    
    static let backgroundPrimary = Color(.systemBackground)
    static let backgroundSecondary = Color(.secondarySystemBackground)
    static let backgroundTertiary = Color(.tertiarySystemBackground)
    
    static let textPrimary = Color(.label)
    static let textSecondary = Color(.secondaryLabel)
    static let textTertiary = Color(.tertiaryLabel)
    
    static let borderLight = Color(.separator)
    static let borderDark = Color(.opaqueSeparator)
}

struct AppColors {
    static let primary = Color.primaryBlue
    static let secondary = Color.secondaryBlue
    static let success = Color.accentGreen
    static let warning = Color.accentOrange
    static let error = Color.accentRed
    
    static let background = Color.backgroundPrimary
    static let surface = Color.backgroundSecondary
    static let surfaceVariant = Color.backgroundTertiary
    
    static let onPrimary = Color.white
    static let onSecondary = Color.white
    static let onBackground = Color.textPrimary
    static let onSurface = Color.textPrimary
    static let onSurfaceVariant = Color.textSecondary
}

extension Font {
    static let titleLarge = Font.system(size: 22, weight: .bold, design: .default)
    static let titleMedium = Font.system(size: 16, weight: .medium, design: .default)
    static let titleSmall = Font.system(size: 14, weight: .medium, design: .default)
    
    static let bodyLarge = Font.system(size: 16, weight: .regular, design: .default)
    static let bodyMedium = Font.system(size: 14, weight: .regular, design: .default)
    static let bodySmall = Font.system(size: 12, weight: .regular, design: .default)
    
    static let labelLarge = Font.system(size: 14, weight: .medium, design: .default)
    static let labelMedium = Font.system(size: 12, weight: .medium, design: .default)
    static let labelSmall = Font.system(size: 11, weight: .medium, design: .default)
}

struct AppTypography {
    static let titleLarge = Font.titleLarge
    static let titleMedium = Font.titleMedium
    static let titleSmall = Font.titleSmall
    
    static let bodyLarge = Font.bodyLarge
    static let bodyMedium = Font.bodyMedium
    static let bodySmall = Font.bodySmall
    
    static let labelLarge = Font.labelLarge
    static let labelMedium = Font.labelMedium
    static let labelSmall = Font.labelSmall
}

struct AppTheme {
    static let cornerRadiusSmall: CGFloat = 8
    static let cornerRadiusMedium: CGFloat = 12
    static let cornerRadiusLarge: CGFloat = 16
    static let cornerRadiusXLarge: CGFloat = 24
    
    static let spacingSmall: CGFloat = 8
    static let spacingMedium: CGFloat = 16
    static let spacingLarge: CGFloat = 24
    static let spacingXLarge: CGFloat = 32
    
    static let elevationSmall: CGFloat = 2
    static let elevationMedium: CGFloat = 4
    static let elevationLarge: CGFloat = 8
    
    static let animationDuration: Double = 0.3
    static let animationCurve = Animation.easeInOut
}

struct AppButtonStyle: ButtonStyle {
    let variant: ButtonVariant
    let size: ButtonSize
    
    enum ButtonVariant {
        case primary
        case secondary
        case outlined
        case text
    }
    
    enum ButtonSize {
        case small
        case medium
        case large
    }
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(buttonFont)
            .padding(buttonPadding)
            .frame(minWidth: buttonMinWidth, minHeight: buttonMinHeight)
            .background(buttonBackground)
            .foregroundColor(buttonForeground)
            .cornerRadius(buttonCornerRadius)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
    
    private var buttonFont: Font {
        switch size {
        case .small:
            return .labelSmall
        case .medium:
            return .labelMedium
        case .large:
            return .labelLarge
        }
    }
    
    private var buttonPadding: EdgeInsets {
        switch size {
        case .small:
            return EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16)
        case .medium:
            return EdgeInsets(top: 12, leading: 24, bottom: 12, trailing: 24)
        case .large:
            return EdgeInsets(top: 16, leading: 32, bottom: 16, trailing: 32)
        }
    }
    
    private var buttonMinWidth: CGFloat {
        switch size {
        case .small:
            return 80
        case .medium:
            return 120
        case .large:
            return 160
        }
    }
    
    private var buttonMinHeight: CGFloat {
        switch size {
        case .small:
            return 32
        case .medium:
            return 44
        case .large:
            return 56
        }
    }
    
    private var buttonBackground: Color {
        switch variant {
        case .primary:
            return AppColors.primary
        case .secondary:
            return AppColors.secondary
        case .outlined:
            return Color.clear
        case .text:
            return Color.clear
        }
    }
    
    private var buttonForeground: Color {
        switch variant {
        case .primary:
            return AppColors.onPrimary
        case .secondary:
            return AppColors.onSecondary
        case .outlined:
            return AppColors.primary
        case .text:
            return AppColors.primary
        }
    }
    
    private var buttonCornerRadius: CGFloat {
        switch size {
        case .small:
            return AppTheme.cornerRadiusSmall
        case .medium:
            return AppTheme.cornerRadiusMedium
        case .large:
            return AppTheme.cornerRadiusLarge
        }
    }
}

struct AppCardStyle: ViewModifier {
    let elevation: CGFloat
    let cornerRadius: CGFloat
    
    func body(content: Content) -> some View {
        content
            .background(Color(.systemBackground))
            .cornerRadius(cornerRadius)
            .shadow(color: .black.opacity(elevation * 0.04), radius: elevation, y: elevation)
    }
}

extension View {
    func appCard(elevation: CGFloat = AppTheme.elevationSmall, cornerRadius: CGFloat = AppTheme.cornerRadiusMedium) -> some View {
        modifier(AppCardStyle(elevation: elevation, cornerRadius: cornerRadius))
    }
}

struct AppTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<_Label>) -> some View {
        configuration
            .padding(12)
            .background(Color(.systemGray6))
            .cornerRadius(AppTheme.cornerRadiusMedium)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cornerRadiusMedium)
                    .stroke(Color.borderLight, lineWidth: 1)
            )
    }
}

struct AppToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack {
            configuration.label
            Spacer()
            Toggle("", isOn: configuration.$isOn)
                .labelsHidden()
                .tint(AppColors.primary)
        }
    }
}

struct AppProgressView: View {
    let message: String?
    let style: ProgressStyle
    
    enum ProgressStyle {
        case circular
        case linear
        case custom
    }
    
    var body: some View {
        VStack(spacing: 16) {
            switch style {
            case .circular:
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: AppColors.primary))
                    .scaleEffect(1.5)
            case .linear:
                ProgressView()
                    .progressViewStyle(LinearProgressViewStyle(tint: AppColors.primary))
                    .frame(height: 4)
            case .custom:
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: AppColors.primary))
            }
            
            if let message = message {
                Text(message)
                    .font(.body)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
}

struct AppEmptyState: View {
    let icon: String
    let title: String
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?
    
    init(
        icon: String = "exclamationmark.triangle",
        title: String,
        message: String,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.title = title
        self.message = message
        self.actionTitle = actionTitle
        self.action = action
    }
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundColor(.secondary)
            
            Text(title)
                .font(.title3)
                .fontWeight(.semibold)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .fontWeight(.medium)
                }
                .buttonStyle(AppButtonStyle(variant: .primary, size: .medium))
                .padding(.top, 8)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
        .background(Color(.systemBackground))
    }
}

struct AppErrorState: View {
    let title: String
    let message: String
    let retryTitle: String
    let onRetry: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 64))
                .foregroundColor(.red)
            
            Text(title)
                .font(.title3)
                .fontWeight(.semibold)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button(action: onRetry) {
                HStack {
                    Image(systemName: "arrow.clockwise")
                    Text(retryTitle)
                }
                .fontWeight(.medium)
            }
            .buttonStyle(AppButtonStyle(variant: .primary, size: .medium))
            .padding(.top, 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
        .background(Color(.systemBackground))
    }
}