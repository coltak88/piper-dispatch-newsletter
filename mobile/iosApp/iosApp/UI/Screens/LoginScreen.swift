package com.piper.newsletter.ios.ui.screens

import SwiftUI
import shared

struct LoginScreen: View {
    @StateObject private var viewModel = LoginViewModel()
    @EnvironmentObject private var navigationState: NavigationState
    @EnvironmentObject private var authState: AuthState
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "newspaper")
                            .font(.system(size: 64))
                            .foregroundColor(.blue)
                        
                        Text("Piper Newsletter")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Stay informed with curated newsletters")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    
                    // Login Form
                    VStack(spacing: 20) {
                        VStack(spacing: 16) {
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
                                        .textContentType(.password)
                                } else {
                                    SecureField("Password", text: $viewModel.password)
                                        .textContentType(.password)
                                }
                                
                                Button(action: { viewModel.showPassword.toggle() }) {
                                    Image(systemName: viewModel.showPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
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
                        
                        // Login Button
                        Button(action: {
                            Task {
                                await viewModel.login()
                            }
                        }) {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Sign In")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(viewModel.isFormValid ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .disabled(!viewModel.isFormValid || viewModel.isLoading)
                        
                        // Forgot Password
                        Button("Forgot Password?") {
                            viewModel.showForgotPassword = true
                        }
                        .font(.body)
                        .foregroundColor(.blue)
                    }
                    .padding(.horizontal)
                    
                    // Sign Up Link
                    HStack {
                        Text("Don't have an account?")
                            .foregroundColor(.secondary)
                        
                        Button("Sign Up") {
                            navigationState.currentScreen = .register
                        }
                        .foregroundColor(.blue)
                        .fontWeight(.medium)
                    }
                    .padding(.top, 20)
                    
                    Spacer()
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $viewModel.showForgotPassword) {
                ForgotPasswordSheet(
                    onResetPassword: { email in
                        Task {
                            await viewModel.resetPassword(email: email)
                        }
                    }
                )
            }
            .onChange(of: viewModel.isAuthenticated) { newValue in
                if newValue {
                    authState.isAuthenticated = true
                    navigationState.currentScreen = .home
                }
            }
        }
    }
}

struct ForgotPasswordSheet: View {
    let onResetPassword: (String) -> Void
    @Environment(\.dismiss) private var dismiss
    
    @State private var email = ""
    @State private var showEmail = false
    @State private var isLoading = false
    @State private var successMessage: String?
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "key")
                        .font(.system(size: 48))
                        .foregroundColor(.blue)
                    
                    Text("Reset Password")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("Enter your email address and we'll send you instructions to reset your password.")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 20)
                
                // Email Field
                HStack {
                    Image(systemName: "envelope")
                        .foregroundColor(.secondary)
                        .frame(width: 20)
                    
                    if showEmail {
                        TextField("Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    } else {
                        SecureField("Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    
                    Button(action: { showEmail.toggle() }) {
                        Image(systemName: showEmail ? "eye.slash" : "eye")
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // Messages
                if let successMessage = successMessage {
                    HStack {
                        Image(systemName: "checkmark.circle")
                            .foregroundColor(.green)
                        
                        Text(successMessage)
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                    .padding(.horizontal)
                }
                
                if let errorMessage = errorMessage {
                    HStack {
                        Image(systemName: "exclamationmark.triangle")
                            .foregroundColor(.red)
                        
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                    .padding(.horizontal)
                }
                
                // Reset Button
                Button(action: {
                    Task {
                        await resetPassword()
                    }
                }) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Send Reset Instructions")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(isEmailValid ? Color.blue : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
                .disabled(!isEmailValid || isLoading)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Reset Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private var isEmailValid: Bool {
        !email.isEmpty && email.contains("@") && email.contains(".")
    }
    
    private func resetPassword() async {
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        do {
            try await AuthManager.shared.resetPassword(email: email)
            successMessage = "Password reset instructions sent to your email."
            
            // Auto-dismiss after 3 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                dismiss()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

class LoginViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var showEmail = false
    @Published var showPassword = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showForgotPassword = false
    @Published var isAuthenticated = false
    
    private let authManager = AuthManager.shared
    
    var isFormValid: Bool {
        !email.isEmpty && 
        email.contains("@") && 
        email.contains(".") && 
        !password.isEmpty && 
        password.count >= 6
    }
    
    func login() async {
        guard isFormValid else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            try await authManager.login(email: email, password: password)
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func resetPassword(email: String) async {
        do {
            try await authManager.resetPassword(email: email)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}