package com.pipertool.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.util.UUID

sealed class HomeState {
    object Loading : HomeState()
    data class Success(val message: String = "Newsletters loaded successfully") : HomeState()
    data class Error(val message: String) : HomeState()
}

data class Newsletter(
    val id: String,
    val name: String,
    val description: String,
    val category: String,
    val isSubscribed: Boolean,
    val isRead: Boolean,
    val lastUpdated: LocalDateTime,
    val subscriberCount: Int,
    val rating: Float
)

data class HomeStats(
    val totalNewsletters: Int,
    val subscribedCount: Int,
    val unreadCount: Int,
    val categoriesCount: Int
)

class HomeViewModel : ViewModel() {
    
    private val _uiState = MutableStateFlow<HomeState>(HomeState.Loading)
    val uiState: StateFlow<HomeState> = _uiState.asStateFlow()
    
    private val _newsletters = MutableStateFlow<List<Newsletter>>(emptyList())
    val newsletters: StateFlow<List<Newsletter>> = _newsletters.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()
    
    private val _categories = MutableStateFlow<List<String>>(emptyList())
    val categories: StateFlow<List<String>> = _categories.asStateFlow()
    
    private val _stats = MutableStateFlow(HomeStats(0, 0, 0, 0))
    val stats: StateFlow<HomeStats> = _stats.asStateFlow()
    
    private val originalNewsletters = mutableListOf<Newsletter>()
    
    init {
        loadNewsletters()
    }
    
    fun loadNewsletters() {
        viewModelScope.launch {
            _isLoading.value = true
            _uiState.value = HomeState.Loading
            
            try {
                val mockNewsletters = HomeManager.generateMockNewsletters()
                originalNewsletters.clear()
                originalNewsletters.addAll(mockNewsletters)
                
                _newsletters.value = mockNewsletters
                _categories.value = mockNewsletters.map { it.category }.distinct().sorted()
                updateStats()
                
                _uiState.value = HomeState.Success()
            } catch (e: Exception) {
                _uiState.value = HomeState.Error("Failed to load newsletters: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun searchNewsletters(query: String) {
        _searchQuery.value = query
        applyFilters()
    }
    
    fun filterByCategory(category: String?) {
        _selectedCategory.value = category
        applyFilters()
    }
    
    fun clearFilters() {
        _searchQuery.value = ""
        _selectedCategory.value = null
        _newsletters.value = originalNewsletters.toList()
        updateStats()
    }
    
    fun toggleSubscription(newsletterId: String) {
        viewModelScope.launch {
            val updatedList = _newsletters.value.map { newsletter ->
                if (newsletter.id == newsletterId) {
                    newsletter.copy(isSubscribed = !newsletter.isSubscribed)
                } else {
                    newsletter
                }
            }
            
            _newsletters.value = updatedList
            
            val originalIndex = originalNewsletters.indexOfFirst { it.id == newsletterId }
            if (originalIndex != -1) {
                originalNewsletters[originalIndex] = originalNewsletters[originalIndex].copy(
                    isSubscribed = !originalNewsletters[originalIndex].isSubscribed
                )
            }
            
            updateStats()
        }
    }
    
    fun markAsRead(newsletterId: String) {
        viewModelScope.launch {
            val updatedList = _newsletters.value.map { newsletter ->
                if (newsletter.id == newsletterId) {
                    newsletter.copy(isRead = true)
                } else {
                    newsletter
                }
            }
            
            _newsletters.value = updatedList
            
            val originalIndex = originalNewsletters.indexOfFirst { it.id == newsletterId }
            if (originalIndex != -1) {
                originalNewsletters[originalIndex] = originalNewsletters[originalIndex].copy(
                    isRead = true
                )
            }
            
            updateStats()
        }
    }
    
    fun refreshNewsletters() {
        loadNewsletters()
    }
    
    private fun applyFilters() {
        val query = _searchQuery.value.lowercase()
        val category = _selectedCategory.value
        
        var filteredList = originalNewsletters.toList()
        
        if (query.isNotBlank()) {
            filteredList = filteredList.filter { newsletter ->
                newsletter.name.lowercase().contains(query) ||
                newsletter.description.lowercase().contains(query) ||
                newsletter.category.lowercase().contains(query)
            }
        }
        
        if (category != null) {
            filteredList = filteredList.filter { it.category == category }
        }
        
        _newsletters.value = filteredList
        updateStats()
    }
    
    private fun updateStats() {
        val currentNewsletters = _newsletters.value
        val totalNewsletters = currentNewsletters.size
        val subscribedCount = currentNewsletters.count { it.isSubscribed }
        val unreadCount = currentNewsletters.count { !it.isRead }
        val categoriesCount = currentNewsletters.map { it.category }.distinct().size
        
        _stats.value = HomeStats(
            totalNewsletters = totalNewsletters,
            subscribedCount = subscribedCount,
            unreadCount = unreadCount,
            categoriesCount = categoriesCount
        )
    }
}

object HomeManager {
    fun generateMockNewsletters(): List<Newsletter> {
        return listOf(
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Tech Weekly",
                description = "Stay updated with the latest technology trends, AI breakthroughs, and software development insights.",
                category = "Technology",
                isSubscribed = true,
                isRead = false,
                lastUpdated = LocalDateTime.now().minusDays(1),
                subscriberCount = 15420,
                rating = 4.8f
            ),
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Design Digest",
                description = "Weekly design inspiration, UI/UX trends, and creative resources for designers and developers.",
                category = "Design",
                isSubscribed = false,
                isRead = false,
                lastUpdated = LocalDateTime.now().minusDays(2),
                subscriberCount = 8930,
                rating = 4.6f
            ),
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Business Insights",
                description = "Market analysis, entrepreneurship tips, and business strategy for modern professionals.",
                category = "Business",
                isSubscribed = true,
                isRead = true,
                lastUpdated = LocalDateTime.now().minusDays(3),
                subscriberCount = 22150,
                rating = 4.7f
            ),
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Health & Wellness",
                description = "Evidence-based health tips, wellness strategies, and fitness advice from certified experts.",
                category = "Health",
                isSubscribed = false,
                isRead = false,
                lastUpdated = LocalDateTime.now().minusDays(1),
                subscriberCount = 18740,
                rating = 4.5f
            ),
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Finance Today",
                description = "Personal finance advice, investment strategies, and economic news for informed decision making.",
                category = "Finance",
                isSubscribed = true,
                isRead = false,
                lastUpdated = LocalDateTime.now().minusHours(12),
                subscriberCount = 31200,
                rating = 4.9f
            ),
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Creative Writing",
                description = "Writing tips, storytelling techniques, and creative prompts for aspiring writers and authors.",
                category = "Education",
                isSubscribed = false,
                isRead = true,
                lastUpdated = LocalDateTime.now().minusDays(4),
                subscriberCount = 6780,
                rating = 4.4f
            ),
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Science Weekly",
                description = "Latest scientific discoveries, research breakthroughs, and educational content for science enthusiasts.",
                category = "Science",
                isSubscribed = true,
                isRead = false,
                lastUpdated = LocalDateTime.now().minusDays(2),
                subscriberCount = 12890,
                rating = 4.7f
            ),
            Newsletter(
                id = UUID.randomUUID().toString(),
                name = "Marketing Pro",
                description = "Digital marketing strategies, social media trends, and advertising insights for modern marketers.",
                category = "Marketing",
                isSubscribed = false,
                isRead = false,
                lastUpdated = LocalDateTime.now().minusDays(1),
                subscriberCount = 19560,
                rating = 4.6f
            )
        )
    }
}