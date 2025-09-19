import SwiftUI
import Combine

struct SettingsScreen: View {
    @ObservedObject private var viewModel: SettingsViewModel
    @State private var showingThemePicker = false
    @State private var showingLanguagePicker = false
    @State private var showingExportOptions = false
    @State private var showingImportSheet = false
    
    init(viewModel: SettingsViewModel = SettingsViewModel()) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.large) {
                // Account Section
                AccountSection(viewModel: viewModel)
                
                // Appearance Section
                AppearanceSection(
                    viewModel: viewModel,
                    showingThemePicker: $showingThemePicker,
                    showingLanguagePicker: $showingLanguagePicker
                )
                
                // Notifications Section
                NotificationsSection(viewModel: viewModel)
                
                // Data Management Section
                DataManagementSection(
                    viewModel: viewModel,
                    showingExportOptions: $showingExportOptions,
                    showingImportSheet: $showingImportSheet
                )
                
                // Privacy & Security Section
                PrivacySecuritySection(viewModel: viewModel)
                
                // Advanced Section
                AdvancedSection(viewModel: viewModel)
                
                // About Section
                AboutSection()
            }
            .padding(AppSpacing.medium)
        }
        .background(AppColors.background)
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showingThemePicker) {
            ThemePickerSheet(viewModel: viewModel)
        }
        .sheet(isPresented: $showingLanguagePicker) {
            LanguagePickerSheet(viewModel: viewModel)
        }
        .sheet(isPresented: $showingExportOptions) {
            ExportOptionsSheet(viewModel: viewModel)
        }
        .sheet(isPresented: $showingImportSheet) {
            ImportDataSheet(viewModel: viewModel)
        }
        .onAppear {
            viewModel.loadSettings()
        }
    }
}

struct AccountSection: View {
    @ObservedObject var viewModel: SettingsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.medium) {
            Text("Account")
                .font(AppTypography.subtitle)
                .fontWeight(.semibold)
                .padding(.horizontal, AppSpacing.medium)
            
            VStack(spacing: 0) {
                if let account = viewModel.account {
                    AccountInfoRow(account: account)
                    
                    Divider()
                        .padding(.horizontal, AppSpacing.medium)
                    
                    SettingsToggleRow(
                        title: "Premium Subscription",
                        icon: "star.circle.fill",
                        iconColor: AppColors.warning,
                        isOn: Binding(
                            get: { account.isPremium },
                            set: { _ in /* Handle upgrade */ }
                        )
                    )
                    
                    Divider()
                        .padding(.horizontal, AppSpacing.medium)
                    
                    SettingsActionRow(
                        title: "Manage Subscription",
                        icon: "creditcard",
                        iconColor: AppColors.primary,
                        action: { /* Handle subscription management */ }
                    )
                    
                    Divider()
                        .padding(.horizontal, AppSpacing.medium)
                    
                    SettingsActionRow(
                        title: "Sign Out",
                        icon: "arrow.right.square",
                        iconColor: AppColors.error,
                        action: { viewModel.signOut() }
                    )
                } else {
                    LoadingIndicator(style: .circular)
                        .frame(height: 200)
                }
            }
            .background(AppColors.surface)
            .cornerRadius(AppCornerRadius.large)
            .shadow(color: AppColors.shadow.opacity(0.1), radius: AppElevation.small)
        }
    }
}

struct AccountInfoRow: View {
    let account: AccountSettings
    
    var body: some View {
        HStack(spacing: AppSpacing.medium) {
            if let avatarUrl = account.avatarUrl, let url = URL(string: avatarUrl) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(AppColors.onSurface.opacity(0.3))
                }
                .frame(width: 60, height: 60)
                .clipShape(Circle())
            } else {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(AppColors.onSurface.opacity(0.3))
            }
            
            VStack(alignment: .leading, spacing: AppSpacing.extraSmall) {
                Text(account.name)
                    .font(AppTypography.headline)
                    .fontWeight(.semibold)
                
                Text(account.email)
                    .font(AppTypography.body2)
                    .foregroundColor(AppColors.onSurface.opacity(0.7))
                
                if account.isPremium {
                    HStack(spacing: AppSpacing.extraSmall) {
                        Image(systemName: "star.fill")
                            .foregroundColor(AppColors.warning)
                            .font(.system(size: 12))
                        
                        Text("Premium Member")
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.warning)
                    }
                    .padding(.horizontal, AppSpacing.small)
                    .padding(.vertical, 4)
                    .background(AppColors.warning.opacity(0.1))
                    .cornerRadius(AppCornerRadius.small)
                }
            }
            
            Spacer()
        }
        .padding(AppSpacing.medium)
    }
}

struct AppearanceSection: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Binding var showingThemePicker: Bool
    @Binding var showingLanguagePicker: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.medium) {
            Text("Appearance")
                .font(AppTypography.subtitle)
                .fontWeight(.semibold)
                .padding(.horizontal, AppSpacing.medium)
            
            VStack(spacing: 0) {
                SettingsActionRow(
                    title: "Theme",
                    icon: "paintbrush.fill",
                    iconColor: AppColors.primary,
                    value: viewModel.appearance.theme.capitalized,
                    action: { showingThemePicker.toggle() }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Language",
                    icon: "globe",
                    iconColor: AppColors.info,
                    value: viewModel.appearance.language,
                    action: { showingLanguagePicker.toggle() }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsToggleRow(
                    title: "Use System Font Size",
                    icon: "textformat.size",
                    iconColor: AppColors.success,
                    isOn: $viewModel.appearance.useSystemFontSize
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsToggleRow(
                    title: "Reduce Motion",
                    icon: "circle.dashed",
                    iconColor: AppColors.secondary,
                    isOn: $viewModel.appearance.reduceMotion
                )
            }
            .background(AppColors.surface)
            .cornerRadius(AppCornerRadius.large)
            .shadow(color: AppColors.shadow.opacity(0.1), radius: AppElevation.small)
        }
    }
}

struct NotificationsSection: View {
    @ObservedObject var viewModel: SettingsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.medium) {
            Text("Notifications")
                .font(AppTypography.subtitle)
                .fontWeight(.semibold)
                .padding(.horizontal, AppSpacing.medium)
            
            VStack(spacing: 0) {
                SettingsToggleRow(
                    title: "Email Notifications",
                    icon: "envelope.fill",
                    iconColor: AppColors.primary,
                    isOn: $viewModel.notifications.emailNotifications
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsToggleRow(
                    title: "Push Notifications",
                    icon: "bell.fill",
                    iconColor: AppColors.warning,
                    isOn: $viewModel.notifications.pushNotifications
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsToggleRow(
                    title: "Newsletter Reminders",
                    icon: "newspaper.fill",
                    iconColor: AppColors.info,
                    isOn: $viewModel.notifications.newsletterReminders
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsToggleRow(
                    title: "New Content Alerts",
                    icon: "sparkles",
                    iconColor: AppColors.success,
                    isOn: $viewModel.notifications.newContentAlerts
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Quiet Hours",
                    icon: "moon.fill",
                    iconColor: AppColors.secondary,
                    value: viewModel.notifications.quietHoursEnabled ? "Enabled" : "Disabled",
                    action: { /* Handle quiet hours */ }
                )
            }
            .background(AppColors.surface)
            .cornerRadius(AppCornerRadius.large)
            .shadow(color: AppColors.shadow.opacity(0.1), radius: AppElevation.small)
        }
    }
}

struct DataManagementSection: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Binding var showingExportOptions: Bool
    @Binding var showingImportSheet: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.medium) {
            Text("Data Management")
                .font(AppTypography.subtitle)
                .fontWeight(.semibold)
                .padding(.horizontal, AppSpacing.medium)
            
            VStack(spacing: 0) {
                SettingsActionRow(
                    title: "Export Data",
                    icon: "square.and.arrow.up",
                    iconColor: AppColors.primary,
                    action: { showingExportOptions.toggle() }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Import Data",
                    icon: "square.and.arrow.down",
                    iconColor: AppColors.success,
                    action: { showingImportSheet.toggle() }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Clear Cache",
                    icon: "trash",
                    iconColor: AppColors.warning,
                    action: { viewModel.clearCache() }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Sync Settings",
                    icon: "arrow.clockwise",
                    iconColor: AppColors.info,
                    action: { viewModel.syncSettings() }
                )
            }
            .background(AppColors.surface)
            .cornerRadius(AppCornerRadius.large)
            .shadow(color: AppColors.shadow.opacity(0.1), radius: AppElevation.small)
        }
    }
}

struct PrivacySecuritySection: View {
    @ObservedObject var viewModel: SettingsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.medium) {
            Text("Privacy & Security")
                .font(AppTypography.subtitle)
                .fontWeight(.semibold)
                .padding(.horizontal, AppSpacing.medium)
            
            VStack(spacing: 0) {
                SettingsToggleRow(
                    title: "Two-Factor Authentication",
                    icon: "lock.shield",
                    iconColor: AppColors.success,
                    isOn: $viewModel.privacy.twoFactorEnabled
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Privacy Policy",
                    icon: "hand.raised.fill",
                    iconColor: AppColors.primary,
                    action: { /* Handle privacy policy */ }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Terms of Service",
                    icon: "doc.text.fill",
                    iconColor: AppColors.info,
                    action: { /* Handle terms */ }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Data Request",
                    icon: "person.fill.questionmark",
                    iconColor: AppColors.warning,
                    action: { /* Handle data request */ }
                )
            }
            .background(AppColors.surface)
            .cornerRadius(AppCornerRadius.large)
            .shadow(color: AppColors.shadow.opacity(0.1), radius: AppElevation.small)
        }
    }
}

struct AdvancedSection: View {
    @ObservedObject var viewModel: SettingsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.medium) {
            Text("Advanced")
                .font(AppTypography.subtitle)
                .fontWeight(.semibold)
                .padding(.horizontal, AppSpacing.medium)
            
            VStack(spacing: 0) {
                SettingsToggleRow(
                    title: "Developer Mode",
                    icon: "wrench.and.screwdriver",
                    iconColor: AppColors.secondary,
                    isOn: $viewModel.advanced.developerMode
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsToggleRow(
                    title: "Debug Logging",
                    icon: "ant",
                    iconColor: AppColors.error,
                    isOn: $viewModel.advanced.debugLogging
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Reset All Settings",
                    icon: "arrow.counterclockwise",
                    iconColor: AppColors.error,
                    action: { viewModel.resetSettings() }
                )
            }
            .background(AppColors.surface)
            .cornerRadius(AppCornerRadius.large)
            .shadow(color: AppColors.shadow.opacity(0.1), radius: AppElevation.small)
        }
    }
}

struct AboutSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.medium) {
            Text("About")
                .font(AppTypography.subtitle)
                .fontWeight(.semibold)
                .padding(.horizontal, AppSpacing.medium)
            
            VStack(spacing: 0) {
                SettingsActionRow(
                    title: "App Version",
                    icon: "app.badge",
                    iconColor: AppColors.primary,
                    value: "1.0.0",
                    action: { /* Handle version info */ }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Rate App",
                    icon: "star.fill",
                    iconColor: AppColors.warning,
                    action: { /* Handle rating */ }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Share App",
                    icon: "square.and.arrow.up",
                    iconColor: AppColors.success,
                    action: { /* Handle sharing */ }
                )
                
                Divider()
                    .padding(.horizontal, AppSpacing.medium)
                
                SettingsActionRow(
                    title: "Acknowledgments",
                    icon: "hands.sparkles",
                    iconColor: AppColors.info,
                    action: { /* Handle acknowledgments */ }
                )
            }
            .background(AppColors.surface)
            .cornerRadius(AppCornerRadius.large)
            .shadow(color: AppColors.shadow.opacity(0.1), radius: AppElevation.small)
        }
    }
}

// Reusable Settings Components
struct SettingsToggleRow: View {
    let title: String
    let icon: String
    let iconColor: Color
    @Binding var isOn: Bool
    
    var body: some View {
        Toggle(isOn: $isOn) {
            HStack(spacing: AppSpacing.medium) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(iconColor)
                    .frame(width: 24)
                
                Text(title)
                    .font(AppTypography.body1)
                    .foregroundColor(AppColors.onSurface)
            }
        }
        .padding(AppSpacing.medium)
    }
}

struct SettingsActionRow: View {
    let title: String
    let icon: String
    let iconColor: Color
    var value: String? = nil
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: AppSpacing.medium) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(iconColor)
                    .frame(width: 24)
                
                Text(title)
                    .font(AppTypography.body1)
                    .foregroundColor(AppColors.onSurface)
                
                Spacer()
                
                if let value = value {
                    Text(value)
                        .font(AppTypography.body2)
                        .foregroundColor(AppColors.onSurface.opacity(0.6))
                }
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 16))
                    .foregroundColor(AppColors.onSurface.opacity(0.5))
            }
            .padding(AppSpacing.medium)
        }
    }
}

// Sheet Views
struct ThemePickerSheet: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.presentationMode) var presentationMode
    
    let themes = ["System", "Light", "Dark"]
    
    var body: some View {
        NavigationView {
            List {
                ForEach(themes, id: \.self) { theme in
                    HStack {
                        Text(theme)
                            .font(AppTypography.body1)
                        
                        Spacer()
                        
                        if viewModel.appearance.theme.lowercased() == theme.lowercased() {
                            Image(systemName: "checkmark")
                                .foregroundColor(AppColors.primary)
                        }
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        viewModel.appearance.theme = theme.lowercased()
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .navigationTitle("Choose Theme")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

struct LanguagePickerSheet: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.presentationMode) var presentationMode
    
    let languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean"]
    
    var body: some View {
        NavigationView {
            List {
                ForEach(languages, id: \.self) { language in
                    HStack {
                        Text(language)
                            .font(AppTypography.body1)
                        
                        Spacer()
                        
                        if viewModel.appearance.language == language {
                            Image(systemName: "checkmark")
                                .foregroundColor(AppColors.primary)
                        }
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        viewModel.appearance.language = language
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .navigationTitle("Choose Language")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

struct ExportOptionsSheet: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Export Format")) {
                    Button("Export as JSON") {
                        viewModel.exportData(format: "json")
                        presentationMode.wrappedValue.dismiss()
                    }
                    
                    Button("Export as CSV") {
                        viewModel.exportData(format: "csv")
                        presentationMode.wrappedValue.dismiss()
                    }
                    
                    Button("Export as PDF") {
                        viewModel.exportData(format: "pdf")
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                
                Section(header: Text("Data to Export")) {
                    Toggle("Newsletters", isOn: .constant(true))
                    Toggle("Reading History", isOn: .constant(true))
                    Toggle("Favorites", isOn: .constant(true))
                    Toggle("Preferences", isOn: .constant(true))
                }
            }
            .navigationTitle("Export Options")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

struct ImportDataSheet: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            VStack(spacing: AppSpacing.large) {
                Image(systemName: "square.and.arrow.down")
                    .font(.system(size: 64))
                    .foregroundColor(AppColors.primary)
                
                Text("Import Data")
                    .font(AppTypography.headline)
                    .fontWeight(.semibold)
                
                Text("Select a file to import your newsletter data")
                    .font(AppTypography.body2)
                    .foregroundColor(AppColors.onSurface.opacity(0.7))
                    .multilineTextAlignment(.center)
                
                AppButton(
                    title: "Choose File",
                    variant: .primary,
                    action: {
                        // Handle file selection
                        presentationMode.wrappedValue.dismiss()
                    }
                )
                
                Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                }
                .font(AppTypography.body1)
                .foregroundColor(AppColors.onSurface.opacity(0.7))
            }
            .padding(AppSpacing.large)
            .navigationTitle("Import Data")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct SettingsScreen_Previews: PreviewProvider {
    static var previews: some View {
        let mockViewModel = SettingsViewModel()
        SettingsScreen(viewModel: mockViewModel)
    }
}