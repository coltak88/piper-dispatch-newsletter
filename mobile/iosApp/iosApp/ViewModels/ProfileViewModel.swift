import SwiftUI
import Combine

enum ProfileState {
    case idle
    case loading
    case success(ProfileData)
    case error(String)
}

struct ProfileData {
    let profile: UserProfile
    let stats: UserStats
    let preferences: UserPreferences
}

struct UserProfile: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let avatarUrl: String?
    let isPremium: Bool
    let createdAt: Date
    let updatedAt: Date
}

struct UserStats: Codable {
    let subscribedNewsletters: Int
    let favoriteNewsletters: Int
    let readArticles: Int
    let totalReadingTime: Int // in minutes
    let streakDays: Int
    let lastActiveAt: Date
}

struct UserPreferences: Codable {
    let emailNotifications: Bool
    let pushNotifications: Bool
    let newsletterReminders: Bool
    let newContentAlerts: Bool
    let theme: String // "system", "light", "dark"
    let language: String
    let defaultView: String // "list", "grid", "compact"
    let quietHoursEnabled: Bool
    let quietHoursStart: String?
    let quietHoursEnd: String?
}

class ProfileViewModel: ObservableObject {
    @Published private(set) var state: ProfileState = .idle
    @Published private(set) var isLoading: Bool = false
    
    private let profileManager = ProfileManager()
    private var cancellables = Set<AnyCancellable>()
    
    var profile: UserProfile? {
        switch state {
        case .success(let data):
            return data.profile
        default:
            return nil
        }
    }
    
    var stats: UserStats? {
        switch state {
        case .success(let data):
            return data.stats
        default:
            return nil
        }
    }
    
    var preferences: UserPreferences? {
        switch state {
        case .success(let data):
            return data.preferences
        default:
            return nil
        }
    }
    
    func loadProfile() {
        isLoading = true
        state = .loading
        
        profileManager.fetchProfile()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.state = .error(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] profileData in
                    self?.state = .success(profileData)
                }
            )
            .store(in: &cancellables)
    }
    
    func updateProfile(name: String, email: String, avatarUrl: String?) {
        guard case .success(let currentData) = state else { return }
        
        let updatedProfile = UserProfile(
            id: currentData.profile.id,
            name: name,
            email: email,
            avatarUrl: avatarUrl,
            isPremium: currentData.profile.isPremium,
            createdAt: currentData.profile.createdAt,
            updatedAt: Date()
        )
        
        let updatedData = ProfileData(
            profile: updatedProfile,
            stats: currentData.stats,
            preferences: currentData.preferences
        )
        
        state = .success(updatedData)
        
        // Update on server
        profileManager.updateProfile(updatedProfile)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to update profile: \(error)")
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func updatePreferences(_ preferences: UserPreferences) {
        guard case .success(let currentData) = state else { return }
        
        let updatedData = ProfileData(
            profile: currentData.profile,
            stats: currentData.stats,
            preferences: preferences
        )
        
        state = .success(updatedData)
        
        // Update on server
        profileManager.updatePreferences(preferences)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to update preferences: \(error)")
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func changePassword(currentPassword: String, newPassword: String) {
        profileManager.changePassword(currentPassword: currentPassword, newPassword: newPassword)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to change password: \(error)")
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func logout() {
        profileManager.logout()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}

class ProfileManager {
    private let mockDelay: TimeInterval = 1.0
    
    func fetchProfile() -> AnyPublisher<ProfileData, Error> {
        // Mock implementation
        return Future<ProfileData, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                let profile = UserProfile(
                    id: "user_123",
                    name: "John Doe",
                    email: "john.doe@example.com",
                    avatarUrl: "https://example.com/avatar.jpg",
                    isPremium: true,
                    createdAt: Date().addingTimeInterval(-86400 * 30), // 30 days ago
                    updatedAt: Date()
                )
                
                let stats = UserStats(
                    subscribedNewsletters: 12,
                    favoriteNewsletters: 5,
                    readArticles: 156,
                    totalReadingTime: 420, // 7 hours
                    streakDays: 15,
                    lastActiveAt: Date()
                )
                
                let preferences = UserPreferences(
                    emailNotifications: true,
                    pushNotifications: true,
                    newsletterReminders: true,
                    newContentAlerts: true,
                    theme: "system",
                    language: "English",
                    defaultView: "list",
                    quietHoursEnabled: false,
                    quietHoursStart: nil,
                    quietHoursEnd: nil
                )
                
                let profileData = ProfileData(
                    profile: profile,
                    stats: stats,
                    preferences: preferences
                )
                
                promise(.success(profileData))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func updateProfile(_ profile: UserProfile) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func updatePreferences(_ preferences: UserPreferences) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func changePassword(currentPassword: String, newPassword: String) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                if currentPassword.isEmpty {
                    promise(.failure(NSError(domain: "", code: 400, userInfo: [NSLocalizedDescriptionKey: "Current password is incorrect"])))
                } else {
                    promise(.success(()))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func logout() -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
}