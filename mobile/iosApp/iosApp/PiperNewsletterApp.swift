import SwiftUI
import shared

@main
struct PiperNewsletterApp: App {
    @StateObject private var authManager = AuthManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
        }
    }
}

class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private let sharedAuthManager = shared.AuthManager()
    
    func login(email: String, password: String, completion: @escaping (Bool, String?) -> Void) {
        Task {
            do {
                let success = try await sharedAuthManager.login(email: email, password: password)
                await MainActor.run {
                    self.isAuthenticated = success
                    if success {
                        self.currentUser = try? await sharedAuthManager.getCurrentUser()
                    }
                    completion(success, success ? nil : "Invalid credentials")
                }
            } catch {
                await MainActor.run {
                    completion(false, error.localizedDescription)
                }
            }
        }
    }
    
    func logout() {
        Task {
            await sharedAuthManager.logout()
            await MainActor.run {
                self.isAuthenticated = false
                self.currentUser = nil
            }
        }
    }
}