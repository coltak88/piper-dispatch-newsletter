package com.piper.newsletter.ios.ui.screens

import SwiftUI
import shared

struct RegisterScreen: View {
    @StateObject private var viewModel = RegisterViewModel()
    @EnvironmentObject private var navigationState: NavigationState
    @EnvironmentObject private var authState: AuthState
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "person.badge.plus")
                            .font(.system(size: 64))
                            .foregroundColor(.blue)
                        
                        Text("Create Account")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Join Piper Newsletter to stay informed")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    
                    // Registration Form
                    VStack(spacing: 20) {
                        VStack(spacing: 16) {
                            // Name Field
                            HStack {
                                Image(systemName: "person")
                                    .foregroundColor(.secondary)
                                    .frame(width: 20)
                                
                                TextField("Full Name", text: $viewModel.name)
                                    .textContentType(.name)
                                    .autocapitalization(.words)
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                            
                            // Email Field
                            HStack {
                                Image(systemName: "envelope")
                                    .foregroundColor(.secondary)
                                    .frame(width: 20)
                                
                                if viewModel.showEmail {
                                    TextField("Email", text: $viewModel.email)
                                        .textContentType(.emailAddress)
                                        .keyboardType(.emailAddress)
                                        .autocapitalization(.none)
                                } else {
                                    SecureField("Email", text: $viewModel.email)
                                        .textContentType(.emailAddress)
                                        .keyboardType(.emailAddress)
                                        .autocapitalization(.none)
                                }
                                
                                Button(action: { viewModel.showEmail.toggle() }) {
                                    Image(systemName: viewModel.showEmail ? "eye.slash" : "eye")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                            
                            // Password Field
                            HStack {
                                Image(systemName: "lock")
                                    .foregroundColor(.secondary)
                                    .frame(width: 20)
                                
                                if viewModel.showPassword {
                                    TextField("Password", text: $viewModel.password)
                                        .textContentType(.newPassword)
                                } else {
                                    SecureField("Password", text: $viewModel.password)
                                        .textContentType(.newPassword)
                                }
                                
                                Button(action: { viewModel.showPassword.toggle() }) {
                                    Image(systemName: viewModel.showPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                            
                            // Confirm Password Field
                            HStack {
                                Image(systemName: "lock.fill")
                                    .foregroundColor(.secondary)
                                    .frame(width: 20)
                                
                                if viewModel.showConfirmPassword {
                                    TextField("Confirm Password", text: $viewModel.confirmPassword)
                                        .textContentType(.newPassword)
                                } else {
                                    SecureField("Confirm Password", text: $viewModel.confirmPassword)
                                        .textContentType(.newPassword)
                                }
                                
                                Button(action: { viewModel.showConfirmPassword.toggle() }) {
                                    Image(systemName: viewModel.showConfirmPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                            
                            // Password Requirements
                            if !viewModel.password.isEmpty {
                                VStack(alignment: .leading, spacing: 4) {
                                    PasswordRequirement(
                                        text: "At least 8 characters",
                                        isMet: viewModel.password.count >= 8
                                    )
                                    PasswordRequirement(
                                        text: "Contains uppercase letter",
                                        isMet: viewModel.password.range(of: "[A-Z]", options: .regularExpression) != nil
                                    )
                                    PasswordRequirement(
                                        text: "Contains lowercase letter",
                                        isMet: viewModel.password.range(of: "[a-z]", options: .regularExpression) != nil
                                    )
                                    PasswordRequirement(
                                        text: "Contains number",
                                        isMet: viewModel.password.range(of: "[0-9]", options: .regularExpression) != nil
                                    )
                                    PasswordRequirement(
                                        text: "Passwords match",
                                        isMet: viewModel.password == viewModel.confirmPassword && !viewModel.confirmPassword.isEmpty
                                    )
                                }
                                .font(.caption)
                                .padding(.horizontal)
                            }
                        }
                        
                        // Error Message
                        if let error = viewModel.errorMessage {
                            HStack {
                                Image(systemName: "exclamationmark.triangle")
                                    .foregroundColor(.red)
                                
                                Text(error)
                                    .font(.caption)
                                    .foregroundColor(.red)
                            }
                            .padding(.horizontal)
                        }
                        
                        // Register Button
                        Button(action: {
                            Task {
                                await viewModel.register()
                            }
                        }) {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Create Account")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(viewModel.isFormValid ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .disabled(!viewModel.isFormValid || viewModel.isLoading)
                        
                        // Terms and Privacy
                        VStack(spacing: 8) {
                            Text("By creating an account, you agree to our")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            HStack(spacing: 4) {
                                Button("Terms of Service") {
                                    // Handle terms navigation
                                }
                                .font(.caption)
                                .foregroundColor(.blue)
                                
                                Text("and")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Button("Privacy Policy") {
                                    // Handle privacy navigation
                                }
                                .font(.caption)
                                .foregroundColor(.blue)
                            }
                        }
                        .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal)
                    
                    // Login Link
                    HStack {
                        Text("Already have an account?")
                            .foregroundColor(.secondary)
                        
                        Button("Sign In") {
                            navigationState.currentScreen = .login
                        }
                        .foregroundColor(.blue)
                        .fontWeight(.medium)
                    }
                    .padding(.top, 20)
                    
                    Spacer()
                }
            }
            .navigationBarHidden(true)
            .onChange(of: viewModel.isAuthenticated) { newValue in
                if newValue {
                    authState.isAuthenticated = true
                    navigationState.currentScreen = .home
                }
            }
        }
    }
}

struct PasswordRequirement: View {
    let text: String
    let isMet: Bool
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: isMet ? "checkmark.circle.fill" : "circle")
                .foregroundColor(isMet ? .green : .secondary)
                .font(.caption)
            
            Text(text)
                .foregroundColor(isMet ? .green : .secondary)
        }
    }
}

class RegisterViewModel: ObservableObject {
    @Published var name = ""
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var showEmail = false
    @Published var showPassword = false
    @Published var showConfirmPassword = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isAuthenticated = false
    
    private let authManager = AuthManager.shared
    
    var isFormValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        email.contains("@") &&
        email.contains(".") &&
        password.count >= 8 &&
        password == confirmPassword &&
        password.range(of: "[A-Z]", options: .regularExpression) != nil &&
        password.range(of: "[a-z]", options: .regularExpression) != nil &&
        password.range(of: "[0-9]", options: .regularExpression) != nil
    }
    
    func register() async {
        guard isFormValid else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            try await authManager.register(
                name: name,
                email: email,
                password: password
            )
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}