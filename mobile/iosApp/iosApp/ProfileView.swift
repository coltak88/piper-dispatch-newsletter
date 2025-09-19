import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = ProfileViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    if let user = authManager.currentUser {
                        // User Info Card
                        VStack(spacing: 16) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.accentColor)
                            
                            VStack(spacing: 4) {
                                Text(user.name)
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            if let role = user.role {
                                Text(role.capitalized)
                                    .font(.caption)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 4)
                                    .background(Color.accentColor.opacity(0.1))
                                    .cornerRadius(8)
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                        
                        // Stats Card
                        if let stats = viewModel.userStats {
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Your Activity")
                                    .font(.headline)
                                
                                HStack(spacing: 16) {
                                    VStack(spacing: 4) {
                                        Text("\(stats.newslettersCreated)")
                                            .font(.title2)
                                            .fontWeight(.semibold)
                                        
                                        Text("Created")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    Spacer()
                                    
                                    VStack(spacing: 4) {
                                        Text("\(stats.subscriptionsCount)")
                                            .font(.title2)
                                            .fontWeight(.semibold)
                                        
                                        Text("Subscriptions")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    Spacer()
                                    
                                    VStack(spacing: 4) {
                                        Text("\(stats.totalViews)")
                                            .font(.title2)
                                            .fontWeight(.semibold)
                                        
                                        Text("Views")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                        }
                        
                        // Settings Section
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Settings")
                                .font(.headline)
                            
                            // Notifications Toggle
                            HStack {
                                Label {
                                    Text("Email Notifications")
                                } icon: {
                                    Image(systemName: "bell.fill")
                                        .foregroundColor(.blue)
                                }
                                
                                Spacer()
                                
                                Toggle("", isOn: $viewModel.emailNotifications)
                                    .labelsHidden()
                                    .onChange(of: viewModel.emailNotifications) { newValue in
                                        viewModel.updateNotificationSettings()
                                    }
                            }
                            
                            Divider()
                            
                            // Dark Mode Toggle
                            HStack {
                                Label {
                                    Text("Dark Mode")
                                } icon: {
                                    Image(systemName: "moon.fill")
                                        .foregroundColor(.purple)
                                }
                                
                                Spacer()
                                
                                Toggle("", isOn: $viewModel.darkMode)
                                    .labelsHidden()
                            }
                            
                            Divider()
                            
                            // Change Password
                            Button("Change Password") {
                                viewModel.showChangePassword = true
                            }
                            .foregroundColor(.blue)
                            
                            Divider()
                            
                            // Logout Button
                            Button("Sign Out") {
                                viewModel.showLogoutConfirmation = true
                            }
                            .foregroundColor(.red)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                    }
                }
                .padding()
            }
            .navigationTitle("Profile")
            .onAppear {
                viewModel.loadUserStats()
            }
            .alert("Sign Out", isPresented: $viewModel.showLogoutConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Sign Out", role: .destructive) {
                    authManager.logout()
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .sheet(isPresented: $viewModel.showChangePassword) {
                ChangePasswordView()
            }
        }
    }
}

struct ChangePasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var error: String?
    
    var body: some View {
        NavigationView {
            Form {
                Section("Current Password") {
                    SecureField("Enter current password", text: $currentPassword)
                }
                
                Section("New Password") {
                    SecureField("Enter new password", text: $newPassword)
                    SecureField("Confirm new password", text: $confirmPassword)
                }
                
                if let error = error {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Change Password")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        changePassword()
                    }
                    .disabled(isLoading || currentPassword.isEmpty || newPassword.isEmpty || newPassword != confirmPassword)
                }
            }
        }
    }
    
    private func changePassword() {
        isLoading = true
        error = nil
        
        // Implement password change logic
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            isLoading = false
            dismiss()
        }
    }
}

class ProfileViewModel: ObservableObject {
    @Published var emailNotifications = true
    @Published var darkMode = false
    @Published var userStats: UserStats?
    @Published var showLogoutConfirmation = false
    @Published var showChangePassword = false
    
    private let newsletterManager = NewsletterManager()
    
    func loadUserStats() {
        // Load user statistics
        userStats = UserStats(
            newslettersCreated: 5,
            subscriptionsCount: 12,
            totalViews: 2847
        )
    }
    
    func updateNotificationSettings() {
        // Update notification settings via API
    }
}

struct UserStats {
    let newslettersCreated: Int
    let subscriptionsCount: Int
    let totalViews: Int
}