import SwiftUI
import Combine

enum SettingsState {
    case idle
    case loading
    case success
    case error(String)
}

struct AccountSettings: Codable {
    let id: String
    let name: String
    let email: String
    let avatarUrl: String?
    let isPremium: Bool
    let createdAt: Date
    let lastLoginAt: Date
}

struct AppearanceSettings: Codable {
    var theme: String // "system", "light", "dark"
    var language: String
    var useSystemFontSize: Bool
    var reduceMotion: Bool
    var defaultView: String // "list", "grid", "compact"
}

struct NotificationSettings: Codable {
    var emailNotifications: Bool
    var pushNotifications: Bool
    var newsletterReminders: Bool
    var newContentAlerts: Bool
    var quietHoursEnabled: Bool
    var quietHoursStart: String?
    var quietHoursEnd: String?
}

struct DataManagementSettings: Codable {
    var autoBackup: Bool
    var backupFrequency: String // "daily", "weekly", "monthly"
    var lastBackupAt: Date?
    var cacheSize: Int64 // in bytes
}

struct PrivacySettings: Codable {
    var twoFactorEnabled: Bool
    var analyticsEnabled: Bool
    var crashReportingEnabled: Bool
    var shareUsageData: Bool
}

struct AdvancedSettings: Codable {
    var developerMode: Bool
    var debugLogging: Bool
    var experimentalFeatures: Bool
    var autoUpdate: Bool
}

class SettingsViewModel: ObservableObject {
    @Published private(set) var state: SettingsState = .idle
    @Published private(set) var isLoading: Bool = false
    @Published private(set) var account: AccountSettings?
    
    @Published var appearance = AppearanceSettings(
        theme: "system",
        language: "English",
        useSystemFontSize: true,
        reduceMotion: false,
        defaultView: "list"
    )
    
    @Published var notifications = NotificationSettings(
        emailNotifications: true,
        pushNotifications: true,
        newsletterReminders: true,
        newContentAlerts: true,
        quietHoursEnabled: false,
        quietHoursStart: nil,
        quietHoursEnd: nil
    )
    
    @Published var dataManagement = DataManagementSettings(
        autoBackup: true,
        backupFrequency: "weekly",
        lastBackupAt: nil,
        cacheSize: 0
    )
    
    @Published var privacy = PrivacySettings(
        twoFactorEnabled: false,
        analyticsEnabled: true,
        crashReportingEnabled: true,
        shareUsageData: false
    )
    
    @Published var advanced = AdvancedSettings(
        developerMode: false,
        debugLogging: false,
        experimentalFeatures: false,
        autoUpdate: true
    )
    
    private let settingsManager = SettingsManager()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupBindings()
    }
    
    private func setupBindings() {
        // Auto-save appearance changes
        $appearance
            .dropFirst()
            .debounce(for: .seconds(1), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.saveSettings()
            }
            .store(in: &cancellables)
        
        // Auto-save notification changes
        $notifications
            .dropFirst()
            .debounce(for: .seconds(1), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.saveSettings()
            }
            .store(in: &cancellables)
        
        // Auto-save privacy changes
        $privacy
            .dropFirst()
            .debounce(for: .seconds(1), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.saveSettings()
            }
            .store(in: &cancellables)
        
        // Auto-save advanced changes
        $advanced
            .dropFirst()
            .debounce(for: .seconds(1), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.saveSettings()
            }
            .store(in: &cancellables)
    }
    
    func loadSettings() {
        isLoading = true
        state = .loading
        
        settingsManager.fetchSettings()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.state = .error(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] settings in
                    self?.updateSettings(settings)
                    self?.state = .success
                }
            )
            .store(in: &cancellables)
    }
    
    private func updateSettings(_ settings: AllSettings) {
        account = settings.account
        appearance = settings.appearance
        notifications = settings.notifications
        dataManagement = settings.dataManagement
        privacy = settings.privacy
        advanced = settings.advanced
    }
    
    func saveSettings() {
        let allSettings = AllSettings(
            account: account,
            appearance: appearance,
            notifications: notifications,
            dataManagement: dataManagement,
            privacy: privacy,
            advanced: advanced
        )
        
        settingsManager.saveSettings(allSettings)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to save settings: \(error)")
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func exportData(format: String) {
        settingsManager.exportData(format: format)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to export data: \(error)")
                    }
                },
                receiveValue: { url in
                    // Handle exported file URL
                    print("Data exported to: \(url)")
                }
            )
            .store(in: &cancellables)
    }
    
    func importData(from url: URL) {
        settingsManager.importData(from: url)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.state = .error(error.localizedDescription)
                    } else {
                        self?.loadSettings() // Reload settings after import
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func clearCache() {
        settingsManager.clearCache()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to clear cache: \(error)")
                    } else {
                        // Update cache size
                        dataManagement.cacheSize = 0
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func syncSettings() {
        settingsManager.syncSettings()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to sync settings: \(error)")
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func resetSettings() {
        settingsManager.resetSettings()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.state = .error(error.localizedDescription)
                    } else {
                        self?.loadSettings() // Reload default settings
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func signOut() {
        settingsManager.signOut()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}

struct AllSettings: Codable {
    let account: AccountSettings?
    let appearance: AppearanceSettings
    let notifications: NotificationSettings
    let dataManagement: DataManagementSettings
    let privacy: PrivacySettings
    let advanced: AdvancedSettings
}

class SettingsManager {
    private let mockDelay: TimeInterval = 0.5
    private let userDefaults = UserDefaults.standard
    
    func fetchSettings() -> AnyPublisher<AllSettings, Error> {
        return Future<AllSettings, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                let account = AccountSettings(
                    id: "user_123",
                    name: "John Doe",
                    email: "john.doe@example.com",
                    avatarUrl: "https://example.com/avatar.jpg",
                    isPremium: true,
                    createdAt: Date().addingTimeInterval(-86400 * 30),
                    lastLoginAt: Date()
                )
                
                let appearance = AppearanceSettings(
                    theme: "system",
                    language: "English",
                    useSystemFontSize: true,
                    reduceMotion: false,
                    defaultView: "list"
                )
                
                let notifications = NotificationSettings(
                    emailNotifications: true,
                    pushNotifications: true,
                    newsletterReminders: true,
                    newContentAlerts: true,
                    quietHoursEnabled: false,
                    quietHoursStart: nil,
                    quietHoursEnd: nil
                )
                
                let dataManagement = DataManagementSettings(
                    autoBackup: true,
                    backupFrequency: "weekly",
                    lastBackupAt: Date().addingTimeInterval(-86400 * 3),
                    cacheSize: 1024 * 1024 * 50 // 50MB
                )
                
                let privacy = PrivacySettings(
                    twoFactorEnabled: false,
                    analyticsEnabled: true,
                    crashReportingEnabled: true,
                    shareUsageData: false
                )
                
                let advanced = AdvancedSettings(
                    developerMode: false,
                    debugLogging: false,
                    experimentalFeatures: false,
                    autoUpdate: true
                )
                
                let allSettings = AllSettings(
                    account: account,
                    appearance: appearance,
                    notifications: notifications,
                    dataManagement: dataManagement,
                    privacy: privacy,
                    advanced: advanced
                )
                
                promise(.success(allSettings))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func saveSettings(_ settings: AllSettings) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                // Mock implementation - in real app, save to server/local storage
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func exportData(format: String) -> AnyPublisher<URL, Error> {
        return Future<URL, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                let tempURL = FileManager.default.temporaryDirectory
                    .appendingPathComponent("newsletter_data")
                    .appendingPathExtension(format)
                
                // Mock data export
                let mockData = "Mock export data in \(format) format"
                try? mockData.write(to: tempURL, atomically: true, encoding: .utf8)
                
                promise(.success(tempURL))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func importData(from url: URL) -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                // Mock implementation - in real app, parse and import data
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func clearCache() -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                // Mock implementation - clear app cache
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func syncSettings() -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                // Mock implementation - sync with server
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func resetSettings() -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                // Mock implementation - reset to defaults
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func signOut() -> AnyPublisher<Void, Error> {
        return Future<Void, Error> { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + self.mockDelay) {
                // Mock implementation - clear user data
                promise(.success(()))
            }
        }
        .eraseToAnyPublisher()
    }
}