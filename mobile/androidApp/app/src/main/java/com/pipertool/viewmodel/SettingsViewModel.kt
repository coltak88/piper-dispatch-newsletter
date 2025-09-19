package com.pipertool.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

sealed class SettingsState {
    object Idle : SettingsState()
    object Loading : SettingsState()
    object Success : SettingsState()
    data class Error(val message: String) : SettingsState()
}

data class AccountSettings(
    val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String?,
    val isPremium: Boolean,
    val createdAt: Date,
    val lastLoginAt: Date
)

data class AppearanceSettings(
    val theme: String = "system", // "system", "light", "dark"
    val language: String = "English",
    val useSystemFontSize: Boolean = true,
    val reduceMotion: Boolean = false,
    val defaultView: String = "list" // "list", "grid", "compact"
)

data class NotificationSettings(
    val emailNotifications: Boolean = true,
    val pushNotifications: Boolean = true,
    val newsletterReminders: Boolean = true,
    val newContentAlerts: Boolean = true,
    val quietHoursEnabled: Boolean = false,
    val quietHoursStart: String? = null,
    val quietHoursEnd: String? = null
)

data class DataManagementSettings(
    val autoBackup: Boolean = true,
    val backupFrequency: String = "weekly", // "daily", "weekly", "monthly"
    val lastBackupAt: Date? = null,
    val cacheSize: Long = 0 // in bytes
)

data class PrivacySettings(
    val twoFactorEnabled: Boolean = false,
    val analyticsEnabled: Boolean = true,
    val crashReportingEnabled: Boolean = true,
    val shareUsageData: Boolean = false
)

data class AdvancedSettings(
    val developerMode: Boolean = false,
    val debugLogging: Boolean = false,
    val experimentalFeatures: Boolean = false,
    val autoUpdate: Boolean = true
)

data class AllSettings(
    val account: AccountSettings?,
    val appearance: AppearanceSettings,
    val notifications: NotificationSettings,
    val dataManagement: DataManagementSettings,
    val privacy: PrivacySettings,
    val advanced: AdvancedSettings
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsManager: SettingsManager
) : ViewModel() {
    
    private val _state = MutableStateFlow<SettingsState>(SettingsState.Idle)
    val state: StateFlow<SettingsState> = _state.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _account = MutableStateFlow<AccountSettings?>(null)
    val account: StateFlow<AccountSettings?> = _account.asStateFlow()
    
    private val _appearance = MutableStateFlow(AppearanceSettings())
    val appearance: StateFlow<AppearanceSettings> = _appearance.asStateFlow()
    
    private val _notifications = MutableStateFlow(NotificationSettings())
    val notifications: StateFlow<NotificationSettings> = _notifications.asStateFlow()
    
    private val _dataManagement = MutableStateFlow(DataManagementSettings())
    val dataManagement: StateFlow<DataManagementSettings> = _dataManagement.asStateFlow()
    
    private val _privacy = MutableStateFlow(PrivacySettings())
    val privacy: StateFlow<PrivacySettings> = _privacy.asStateFlow()
    
    private val _advanced = MutableStateFlow(AdvancedSettings())
    val advanced: StateFlow<AdvancedSettings> = _advanced.asStateFlow()
    
    init {
        setupAutoSave()
        loadSettings()
    }
    
    private fun setupAutoSave() {
        // Auto-save appearance changes
        viewModelScope.launch {
            _appearance
                .drop(1) // Skip initial value
                .debounce(1000) // Wait 1 second after last change
                .collect { saveSettings() }
        }
        
        // Auto-save notification changes
        viewModelScope.launch {
            _notifications
                .drop(1)
                .debounce(1000)
                .collect { saveSettings() }
        }
        
        // Auto-save privacy changes
        viewModelScope.launch {
            _privacy
                .drop(1)
                .debounce(1000)
                .collect { saveSettings() }
        }
        
        // Auto-save advanced changes
        viewModelScope.launch {
            _advanced
                .drop(1)
                .debounce(1000)
                .collect { saveSettings() }
        }
    }
    
    fun loadSettings() {
        viewModelScope.launch {
            _isLoading.value = true
            _state.value = SettingsState.Loading
            
            try {
                val settings = settingsManager.fetchSettings()
                updateSettings(settings)
                _state.value = SettingsState.Success
            } catch (e: Exception) {
                _state.value = SettingsState.Error(e.message ?: "Failed to load settings")
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    private fun updateSettings(settings: AllSettings) {
        _account.value = settings.account
        _appearance.value = settings.appearance
        _notifications.value = settings.notifications
        _dataManagement.value = settings.dataManagement
        _privacy.value = settings.privacy
        _advanced.value = settings.advanced
    }
    
    private fun saveSettings() {
        viewModelScope.launch {
            try {
                val allSettings = AllSettings(
                    account = _account.value,
                    appearance = _appearance.value,
                    notifications = _notifications.value,
                    dataManagement = _dataManagement.value,
                    privacy = _privacy.value,
                    advanced = _advanced.value
                )
                
                settingsManager.saveSettings(allSettings)
            } catch (e: Exception) {
                // Handle save error silently or show user notification
                println("Failed to save settings: ${e.message}")
            }
        }
    }
    
    // Appearance update methods
    fun updateTheme(theme: String) {
        _appearance.value = _appearance.value.copy(theme = theme)
    }
    
    fun updateLanguage(language: String) {
        _appearance.value = _appearance.value.copy(language = language)
    }
    
    fun updateUseSystemFontSize(useSystem: Boolean) {
        _appearance.value = _appearance.value.copy(useSystemFontSize = useSystem)
    }
    
    fun updateReduceMotion(reduce: Boolean) {
        _appearance.value = _appearance.value.copy(reduceMotion = reduce)
    }
    
    // Notification update methods
    fun updateEmailNotifications(enabled: Boolean) {
        _notifications.value = _notifications.value.copy(emailNotifications = enabled)
    }
    
    fun updatePushNotifications(enabled: Boolean) {
        _notifications.value = _notifications.value.copy(pushNotifications = enabled)
    }
    
    fun updateNewsletterReminders(enabled: Boolean) {
        _notifications.value = _notifications.value.copy(newsletterReminders = enabled)
    }
    
    fun updateNewContentAlerts(enabled: Boolean) {
        _notifications.value = _notifications.value.copy(newContentAlerts = enabled)
    }
    
    // Data management update methods
    fun updateAutoBackup(enabled: Boolean) {
        _dataManagement.value = _dataManagement.value.copy(autoBackup = enabled)
    }
    
    fun updateCacheSize(size: Long) {
        _dataManagement.value = _dataManagement.value.copy(cacheSize = size)
    }
    
    // Privacy update methods
    fun updateTwoFactor(enabled: Boolean) {
        _privacy.value = _privacy.value.copy(twoFactorEnabled = enabled)
    }
    
    fun updateAnalytics(enabled: Boolean) {
        _privacy.value = _privacy.value.copy(analyticsEnabled = enabled)
    }
    
    fun updateCrashReporting(enabled: Boolean) {
        _privacy.value = _privacy.value.copy(crashReportingEnabled = enabled)
    }
    
    fun updateShareUsageData(enabled: Boolean) {
        _privacy.value = _privacy.value.copy(shareUsageData = enabled)
    }
    
    // Advanced update methods
    fun updateDeveloperMode(enabled: Boolean) {
        _advanced.value = _advanced.value.copy(developerMode = enabled)
    }
    
    fun updateDebugLogging(enabled: Boolean) {
        _advanced.value = _advanced.value.copy(debugLogging = enabled)
    }
    
    fun updateExperimentalFeatures(enabled: Boolean) {
        _advanced.value = _advanced.value.copy(experimentalFeatures = enabled)
    }
    
    fun updateAutoUpdate(enabled: Boolean) {
        _advanced.value = _advanced.value.copy(autoUpdate = enabled)
    }
    
    // Data operations
    fun exportData(format: String) {
        viewModelScope.launch {
            try {
                settingsManager.exportData(format)
                // Handle success - could show a notification
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Failed to export data: ${e.message}")
            }
        }
    }
    
    fun clearCache() {
        viewModelScope.launch {
            try {
                settingsManager.clearCache()
                _dataManagement.value = _dataManagement.value.copy(cacheSize = 0)
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Failed to clear cache: ${e.message}")
            }
        }
    }
    
    fun resetSettings() {
        viewModelScope.launch {
            try {
                settingsManager.resetSettings()
                loadSettings() // Reload default settings
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Failed to reset settings: ${e.message}")
            }
        }
    }
    
    fun syncSettings() {
        viewModelScope.launch {
            try {
                settingsManager.syncSettings()
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Failed to sync settings: ${e.message}")
            }
        }
    }
    
    fun signOut() {
        viewModelScope.launch {
            try {
                settingsManager.signOut()
                // Navigate to auth screen would typically be handled by the UI
            } catch (e: Exception) {
                _state.value = SettingsState.Error("Failed to sign out: ${e.message}")
            }
        }
    }
}

class SettingsManager @Inject constructor() {
    private val mockDelay = 500L
    
    suspend fun fetchSettings(): AllSettings {
        kotlinx.coroutines.delay(mockDelay)
        
        val account = AccountSettings(
            id = "user_123",
            name = "John Doe",
            email = "john.doe@example.com",
            avatarUrl = "https://example.com/avatar.jpg",
            isPremium = true,
            createdAt = Date(System.currentTimeMillis() - 86400000L * 30), // 30 days ago
            lastLoginAt = Date()
        )
        
        val appearance = AppearanceSettings()
        
        val notifications = NotificationSettings()
        
        val dataManagement = DataManagementSettings(
            autoBackup = true,
            backupFrequency = "weekly",
            lastBackupAt = Date(System.currentTimeMillis() - 86400000L * 3), // 3 days ago
            cacheSize = 1024L * 1024L * 50 // 50MB
        )
        
        val privacy = PrivacySettings()
        
        val advanced = AdvancedSettings()
        
        return AllSettings(
            account = account,
            appearance = appearance,
            notifications = notifications,
            dataManagement = dataManagement,
            privacy = privacy,
            advanced = advanced
        )
    }
    
    suspend fun saveSettings(settings: AllSettings) {
        kotlinx.coroutines.delay(mockDelay)
        // Mock implementation - in real app, save to server/local storage
    }
    
    suspend fun exportData(format: String) {
        kotlinx.coroutines.delay(mockDelay)
        // Mock implementation - generate export file
    }
    
    suspend fun importData(filePath: String) {
        kotlinx.coroutines.delay(mockDelay)
        // Mock implementation - parse and import data
    }
    
    suspend fun clearCache() {
        kotlinx.coroutines.delay(mockDelay)
        // Mock implementation - clear app cache
    }
    
    suspend fun syncSettings() {
        kotlinx.coroutines.delay(mockDelay)
        // Mock implementation - sync with server
    }
    
    suspend fun resetSettings() {
        kotlinx.coroutines.delay(mockDelay)
        // Mock implementation - reset to defaults
    }
    
    suspend fun signOut() {
        kotlinx.coroutines.delay(mockDelay)
        // Mock implementation - clear user data
    }
}