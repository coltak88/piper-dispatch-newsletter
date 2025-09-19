import SwiftUI
import Combine

struct ProfileScreen: View {
    @ObservedObject private var viewModel: ProfileViewModel
    @State private var showingEditProfile = false
    @State private var showingNotifications = false
    @State private var showingPreferences = false
    
    init(viewModel: ProfileViewModel = ProfileViewModel()) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Profile Header
                ProfileHeader(viewModel: viewModel)
                
                // Stats Section
                ProfileStats(viewModel: viewModel)
                
                // Quick Actions
                QuickActionsSection(viewModel: viewModel)
                
                // Settings Sections
                SettingsSection(
                    showingEditProfile: $showingEditProfile,
                    showingNotifications: $showingNotifications,
                    showingPreferences: $showingPreferences
                )
                
                // App Info
                AppInfoSection()
            }
            .padding(16)
        }
        .background(Color(.systemBackground))
        .navigationBarHidden(true)
        .sheet(isPresented: $showingEditProfile) {
            EditProfileSheet(viewModel: viewModel)
        }
        .sheet(isPresented: $showingNotifications) {
            NotificationSettingsSheet()
        }
        .sheet(isPresented: $showingPreferences) {
            PreferencesSheet()
        }
        .onAppear {
            viewModel.loadProfile()
        }
    }
}

struct ProfileContent: View {
    let user: User
    let activityStats: UserActivityStats
    let preferences: UserPreferences
    let onUpdateProfile: (User) -> Void
    let onUpdatePreferences: (UserPreferences) -> Void
    let onChangePassword: (String, String) -> Void
    let onLogout: () -> Void
    
    @State private var showingEditProfile = false
    @State private var showingPreferences = false
    @State private var showingPasswordChange = false
    @State private var showingDeleteAccount = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Profile Header
                VStack(spacing: 16) {
                    // Avatar
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 100, height: 100)
                        
                        Text(String(user.name.prefix(1)).uppercased())
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }
                    
                    // User Info
                    VStack(spacing: 4) {
                        Text(user.name)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text(user.email)
                            .font(.body)
                            .foregroundColor(.secondary)
                        
                        if let role = user.role {
                            Text(role.name)
                                .font(.caption)
                                .foregroundColor(.blue)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                    
                    // Edit Button
                    Button(action: { showingEditProfile = true }) {
                        HStack {
                            Image(systemName: "pencil")
                            Text("Edit Profile")
                        }
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.large)
                }
                
                // Activity Stats
                VStack(alignment: .leading, spacing: 16) {
                    Text("Activity Statistics")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ActivityStat(
                                title: "Newsletters Read",
                                value: "\(activityStats.newslettersRead)",
                                icon: "book",
                                color: .blue
                            )
                            
                            ActivityStat(
                                title: "Subscriptions",
                                value: "\(activityStats.activeSubscriptions)",
                                icon: "bell",
                                color: .green
                            )
                            
                            ActivityStat(
                                title: "Avg. Read Time",
                                value: "\(activityStats.averageReadTime)min",
                                icon: "clock",
                                color: .orange
                            )
                            
                            ActivityStat(
                                title: "Engagement Rate",
                                value: "\(activityStats.engagementRate)%",
                                icon: "heart",
                                color: .red
                            )
                        }
                        .padding(.horizontal)
                    }
                }
                
                // Settings Sections
                VStack(spacing: 20) {
                    // Preferences
                    SettingsSection(
                        title: "Preferences",
                        icon: "gear",
                        items: [
                            SettingsItem(
                                title: "Notification Settings",
                                icon: "bell",
                                action: { showingPreferences = true }
                            ),
                            SettingsItem(
                                title: "Privacy Settings",
                                icon: "shield",
                                action: { /* Handle privacy settings */ }
                            ),
                            SettingsItem(
                                title: "Language",
                                icon: "globe",
                                subtitle: preferences.language,
                                action: { /* Handle language change */ }
                            )
                        ]
                    )
                    
                    // Account
                    SettingsSection(
                        title: "Account",
                        icon: "person",
                        items: [
                            SettingsItem(
                                title: "Change Password",
                                icon: "lock",
                                action: { showingPasswordChange = true }
                            ),
                            SettingsItem(
                                title: "Security Settings",
                                icon: "shield.checkered",
                                action: { /* Handle security settings */ }
                            ),
                            SettingsItem(
                                title: "Connected Accounts",
                                icon: "link",
                                action: { /* Handle connected accounts */ }
                            )
                        ]
                    )
                    
                    // Support
                    SettingsSection(
                        title: "Support",
                        icon: "questionmark.circle",
                        items: [
                            SettingsItem(
                                title: "Help Center",
                                icon: "book",
                                action: { /* Handle help center */ }
                            ),
                            SettingsItem(
                                title: "Contact Support",
                                icon: "envelope",
                                action: { /* Handle contact support */ }
                            ),
                            SettingsItem(
                                title: "Report a Problem",
                                icon: "exclamationmark.triangle",
                                action: { /* Handle report problem */ }
                            )
                        ]
                    )
                    
                    // Danger Zone
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Danger Zone")
                            .font(.headline)
                            .foregroundColor(.red)
                            .padding(.horizontal)
                        
                        Button(action: { showingDeleteAccount = true }) {
                            HStack {
                                Image(systemName: "trash")
                                Text("Delete Account")
                                    .fontWeight(.medium)
                            }
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(12)
                        }
                        .padding(.horizontal)
                    }
                    
                    // Logout Button
                    Button(action: onLogout) {
                        HStack {
                            Image(systemName: "arrow.right.square")
                            Text("Sign Out")
                                .fontWeight(.medium)
                        }
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .sheet(isPresented: $showingEditProfile) {
            EditProfileSheet(
                user: user,
                onSave: onUpdateProfile
            )
        }
        .sheet(isPresented: $showingPreferences) {
            PreferencesSheet(
                preferences: preferences,
                onSave: onUpdatePreferences
            )
        }
        .sheet(isPresented: $showingPasswordChange) {
            ChangePasswordSheet(onChangePassword: onChangePassword)
        }
        .alert("Delete Account", isPresented: $showingDeleteAccount) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                // Handle account deletion
            }
        } message: {
            Text("Are you sure you want to delete your account? This action cannot be undone.")
        }
    }
}

struct ActivityStat: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            VStack(spacing: 2) {
                Text(value)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(width: 100, height: 80)
        .padding(12)
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }
}

struct SettingsSection: View {
    let title: String
    let icon: String
    let items: [SettingsItem]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.blue)
                    .font(.headline)
                
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
            }
            .padding(.horizontal)
            
            VStack(spacing: 1) {
                ForEach(items.indices, id: \\.self) { index in
                    SettingsRow(item: items[index])
                    
                    if index < items.count - 1 {
                        Divider()
                            .padding(.horizontal)
                    }
                }
            }
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2)
        }
    }
}

struct SettingsItem {
    let title: String
    let icon: String
    var subtitle: String? = nil
    let action: () -> Void
}

struct SettingsRow: View {
    let item: SettingsItem
    
    var body: some View {
        Button(action: item.action) {
            HStack(spacing: 12) {
                Image(systemName: item.icon)
                    .foregroundColor(.blue)
                    .frame(width: 20)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.title)
                        .font(.body)
                        .foregroundColor(.primary)
                    
                    if let subtitle = item.subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
                    .font(.caption)
            }
            .padding(16)
            .background(Color.clear)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct EditProfileSheet: View {
    let user: User
    let onSave: (User) -> Void
    @Environment(\.dismiss) private var dismiss
    
    @State private var name: String
    @State private var email: String
    
    init(user: User, onSave: @escaping (User) -> Void) {
        self.user = user
        self.onSave = onSave
        self._name = State(initialValue: user.name)
        self._email = State(initialValue: user.email)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Personal Information")) {
                    TextField("Name", text: $name)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let updatedUser = User(
                            id: user.id,
                            name: name,
                            email: email,
                            role: user.role,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt
                        )
                        onSave(updatedUser)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

struct PreferencesSheet: View {
    let preferences: UserPreferences
    let onSave: (UserPreferences) -> Void
    @Environment(\.dismiss) private var dismiss
    
    @State private var language: String
    @State private var theme: String
    @State private var notificationsEnabled: Bool
    @State private var emailNotifications: Bool
    @State private var pushNotifications: Bool
    
    init(preferences: UserPreferences, onSave: @escaping (UserPreferences) -> Void) {
        self.preferences = preferences
        self.onSave = onSave
        self._language = State(initialValue: preferences.language)
        self._theme = State(initialValue: preferences.theme)
        self._notificationsEnabled = State(initialValue: preferences.notificationsEnabled)
        self._emailNotifications = State(initialValue: preferences.emailNotifications)
        self._pushNotifications = State(initialValue: preferences.pushNotifications)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("General")) {
                    Picker("Language", selection: $language) {
                        Text("English").tag("en")
                        Text("Spanish").tag("es")
                        Text("French").tag("fr")
                    }
                    
                    Picker("Theme", selection: $theme) {
                        Text("System").tag("system")
                        Text("Light").tag("light")
                        Text("Dark").tag("dark")
                    }
                }
                
                Section(header: Text("Notifications")) {
                    Toggle("Enable Notifications", isOn: $notificationsEnabled)
                    
                    if notificationsEnabled {
                        Toggle("Email Notifications", isOn: $emailNotifications)
                        Toggle("Push Notifications", isOn: $pushNotifications)
                    }
                }
            }
            .navigationTitle("Preferences")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let updatedPreferences = UserPreferences(
                            language: language,
                            theme: theme,
                            notificationsEnabled: notificationsEnabled,
                            emailNotifications: emailNotifications,
                            pushNotifications: pushNotifications
                        )
                        onSave(updatedPreferences)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

struct ChangePasswordSheet: View {
    let onChangePassword: (String, String) -> Void
    @Environment(\.dismiss) private var dismiss
    
    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var showCurrentPassword = false
    @State private var showNewPassword = false
    @State private var showConfirmPassword = false
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Change Password")) {
                    HStack {
                        if showCurrentPassword {
                            TextField("Current Password", text: $currentPassword)
                        } else {
                            SecureField("Current Password", text: $currentPassword)
                        }
                        
                        Button(action: { showCurrentPassword.toggle() }) {
                            Image(systemName: showCurrentPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    HStack {
                        if showNewPassword {
                            TextField("New Password", text: $newPassword)
                        } else {
                            SecureField("New Password", text: $newPassword)
                        }
                        
                        Button(action: { showNewPassword.toggle() }) {
                            Image(systemName: showNewPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    HStack {
                        if showConfirmPassword {
                            TextField("Confirm Password", text: $confirmPassword)
                        } else {
                            SecureField("Confirm Password", text: $confirmPassword)
                        }
                        
                        Button(action: { showConfirmPassword.toggle() }) {
                            Image(systemName: showConfirmPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if !newPassword.isEmpty && newPassword != confirmPassword {
                        Text("Passwords do not match")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Change Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onChangePassword(currentPassword, newPassword)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .disabled(newPassword.isEmpty || newPassword != confirmPassword)
                }
            }
        }
    }
}

class ProfileViewModel: ObservableObject {
    @Published var uiState: ProfileUiState = .loading
    
    private let authManager = AuthManager.shared
    private let newsletterManager = NewsletterManager(api: PiperNewsletterAPI.shared, authManager: AuthManager.shared)
    private let analyticsManager = AnalyticsManager(api: PiperNewsletterAPI.shared, authManager: AuthManager.shared)
    
    func loadProfile() {
        uiState = .loading
        
        Task {
            do {
                let user = try await authManager.getCurrentUser()
                let activityStats = try await analyticsManager.getUserActivityStats(userId: user.id)
                let preferences = try await authManager.getUserPreferences()
                
                await MainActor.run {
                    self.uiState = .success(user, activityStats, preferences)
                }
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
    
    func updateProfile(user: User) {
        Task {
            do {
                try await authManager.updateUser(user: user)
                await loadProfile()
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
    
    func updatePreferences(preferences: UserPreferences) {
        Task {
            do {
                try await authManager.updateUserPreferences(preferences: preferences)
                await loadProfile()
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
    
    func changePassword(currentPassword: String, newPassword: String) {
        Task {
            do {
                try await authManager.updatePassword(
                    currentPassword: currentPassword,
                    newPassword: newPassword
                )
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
    
    func logout() {
        authManager.logout()
    }
}

enum ProfileUiState {
    case loading
    case success(User, UserActivityStats, UserPreferences)
    case error(String)
}

class AuthState: ObservableObject {
    @Published var isAuthenticated = true
}