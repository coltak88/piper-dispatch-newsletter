package com.piper.newsletter.android.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.piper.newsletter.shared.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

// ViewModels for Android screens
class HomeViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    
    private val newsletterManager = NewsletterManager()
    
    init {
        loadNewsletters()
    }
    
    fun loadNewsletters(
        category: String? = null,
        searchQuery: String? = null,
        sortBy: NewsletterSortBy = NewsletterSortBy.PUBLICATION_DATE,
        sortOrder: SortOrder = SortOrder.DESCENDING
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            try {
                val newsletters = newsletterManager.getNewsletters(
                    category = category,
                    searchQuery = searchQuery,
                    sortBy = sortBy,
                    sortOrder = sortOrder
                )
                
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        newsletters = newsletters,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load newsletters: ${e.message}"
                    )
                }
            }
        }
    }
    
    fun refreshNewsletters() {
        loadNewsletters(
            category = _uiState.value.selectedCategory,
            searchQuery = _uiState.value.searchQuery,
            sortBy = _uiState.value.sortBy,
            sortOrder = _uiState.value.sortOrder
        )
    }
    
    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        loadNewsletters(
            category = _uiState.value.selectedCategory,
            searchQuery = query,
            sortBy = _uiState.value.sortBy,
            sortOrder = _uiState.value.sortOrder
        )
    }
    
    fun setCategory(category: String?) {
        _uiState.update { it.copy(selectedCategory = category) }
        loadNewsletters(
            category = category,
            searchQuery = _uiState.value.searchQuery,
            sortBy = _uiState.value.sortBy,
            sortOrder = _uiState.value.sortOrder
        )
    }
    
    fun setSortOptions(sortBy: NewsletterSortBy, sortOrder: SortOrder) {
        _uiState.update { it.copy(sortBy = sortBy, sortOrder = sortOrder) }
        loadNewsletters(
            category = _uiState.value.selectedCategory,
            searchQuery = _uiState.value.searchQuery,
            sortBy = sortBy,
            sortOrder = sortOrder
        )
    }
}

data class HomeUiState(
    val isLoading: Boolean = false,
    val newsletters: List<Newsletter> = emptyList(),
    val error: String? = null,
    val selectedCategory: String? = null,
    val searchQuery: String = "",
    val sortBy: NewsletterSortBy = NewsletterSortBy.PUBLICATION_DATE,
    val sortOrder: SortOrder = SortOrder.DESCENDING
)

class NewsletterDetailViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(NewsletterDetailUiState())
    val uiState: StateFlow<NewsletterDetailUiState> = _uiState.asStateFlow()
    
    private val newsletterManager = NewsletterManager()
    private var currentNewsletterId: Int = 0
    
    fun loadNewsletter(newsletterId: Int) {
        currentNewsletterId = newsletterId
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            try {
                val newsletter = newsletterManager.getNewsletter(newsletterId)
                val isSubscribed = newsletterManager.isSubscribed(newsletterId)
                
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        newsletter = newsletter,
                        isSubscribed = isSubscribed,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load newsletter: ${e.message}"
                    )
                }
            }
        }
    }
    
    suspend fun toggleSubscription() {
        _uiState.update { it.copy(subscriptionLoading = true) }
        
        try {
            if (_uiState.value.isSubscribed) {
                newsletterManager.unsubscribe(currentNewsletterId)
            } else {
                newsletterManager.subscribe(currentNewsletterId)
            }
            
            _uiState.update {
                it.copy(
                    isSubscribed = !it.isSubscribed,
                    subscriptionLoading = false
                )
            }
        } catch (e: Exception) {
            _uiState.update {
                it.copy(
                    subscriptionLoading = false,
                    error = "Failed to update subscription: ${e.message}"
                )
            }
        }
    }
}

data class NewsletterDetailUiState(
    val isLoading: Boolean = false,
    val newsletter: Newsletter? = null,
    val isSubscribed: Boolean = false,
    val subscriptionLoading: Boolean = false,
    val error: String? = null
)

class AnalyticsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AnalyticsUiState())
    val uiState: StateFlow<AnalyticsUiState> = _uiState.asStateFlow()
    
    private val analyticsManager = AnalyticsManager()
    
    fun loadAnalytics() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            try {
                val analytics = analyticsManager.getAnalyticsSummary()
                val topNewsletters = analyticsManager.getTopNewsletters(
                    limit = 10,
                    sortBy = "views"
                )
                
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        analytics = analytics,
                        topNewsletters = topNewsletters,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load analytics: ${e.message}"
                    )
                }
            }
        }
    }
    
    fun exportAnalytics(format: ExportFormat) {
        viewModelScope.launch {
            try {
                analyticsManager.exportAnalytics(format)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(error = "Failed to export analytics: ${e.message}")
                }
            }
        }
    }
}

data class AnalyticsUiState(
    val isLoading: Boolean = false,
    val analytics: AnalyticsSummary? = null,
    val topNewsletters: List<NewsletterPerformance> = emptyList(),
    val error: String? = null
)

class ProfileViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()
    
    private val authManager = AuthManager()
    private val analyticsManager = AnalyticsManager()
    
    fun loadProfile() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            try {
                val user = authManager.getCurrentUser()
                val userAnalytics = analyticsManager.getUserAnalytics(user?.id ?: 0)
                
                val activityStats = mapOf(
                    "subscriptions" to userAnalytics.subscriptionCount,
                    "articlesRead" to userAnalytics.articlesRead,
                    "bookmarks" to userAnalytics.bookmarksCount
                )
                
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        user = user,
                        activityStats = activityStats,
                        notificationsEnabled = user?.preferences?.notificationsEnabled ?: true,
                        darkModeEnabled = user?.preferences?.darkModeEnabled ?: false,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load profile: ${e.message}"
                    )
                }
            }
        }
    }
    
    suspend fun updateNotificationSettings(enabled: Boolean) {
        try {
            authManager.updateUserPreferences(
                notificationsEnabled = enabled,
                darkModeEnabled = _uiState.value.darkModeEnabled
            )
            _uiState.update { it.copy(notificationsEnabled = enabled) }
        } catch (e: Exception) {
            _uiState.update { it.copy(error = "Failed to update notifications: ${e.message}") }
        }
    }
    
    suspend fun updateDarkModeSettings(enabled: Boolean) {
        try {
            authManager.updateUserPreferences(
                notificationsEnabled = _uiState.value.notificationsEnabled,
                darkModeEnabled = enabled
            )
            _uiState.update { it.copy(darkModeEnabled = enabled) }
        } catch (e: Exception) {
            _uiState.update { it.copy(error = "Failed to update dark mode: ${e.message}") }
        }
    }
    
    fun showChangePasswordDialog() {
        _uiState.update { it.copy(showChangePasswordDialog = true) }
    }
    
    fun hideChangePasswordDialog() {
        _uiState.update { it.copy(showChangePasswordDialog = false) }
    }
    
    suspend fun changePassword(currentPassword: String, newPassword: String) {
        try {
            authManager.updatePassword(currentPassword, newPassword)
            hideChangePasswordDialog()
        } catch (e: Exception) {
            _uiState.update { it.copy(error = "Failed to change password: ${e.message}") }
        }
    }
    
    fun showLogoutDialog() {
        _uiState.update { it.copy(showLogoutDialog = true) }
    }
    
    fun hideLogoutDialog() {
        _uiState.update { it.copy(showLogoutDialog = false) }
    }
    
    suspend fun confirmLogout() {
        try {
            authManager.logout()
            _uiState.update { it.copy(showLogoutDialog = false) }
            // Navigate to login screen would be handled by navigation
        } catch (e: Exception) {
            _uiState.update { it.copy(error = "Failed to logout: ${e.message}") }
        }
    }
}

data class ProfileUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val activityStats: Map<String, Int> = emptyMap(),
    val notificationsEnabled: Boolean = true,
    val darkModeEnabled: Boolean = false,
    val showChangePasswordDialog: Boolean = false,
    val showLogoutDialog: Boolean = false,
    val error: String? = null
)