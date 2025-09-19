package com.pipertool.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pipertool.ui.theme.AppColors
import com.pipertool.ui.theme.AppTypography
import com.pipertool.viewmodel.HomeViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = viewModel(),
    onNavigateToProfile: () -> Unit = {}

@Composable
private fun WelcomeSection() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = AppColors.primaryContainer
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Welcome back!",
                style = AppTypography.headingMedium,
                color = AppColors.onPrimaryContainer
            )
            Text(
                text = "Discover amazing newsletters tailored just for you",
                style = AppTypography.bodyMedium,
                color = AppColors.onPrimaryContainer.copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
private fun QuickStatsSection(stats: HomeViewModel.HomeStats) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = AppColors.surface
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            StatItem(
                value = stats.totalNewsletters.toString(),
                label = "Total"
            )
            Divider(
                modifier = Modifier
                    .height(40.dp)
                    .width(1.dp),
                color = AppColors.outline
            )
            StatItem(
                value = stats.subscribedCount.toString(),
                label = "Subscribed"
            )
            Divider(
                modifier = Modifier
                    .height(40.dp)
                    .width(1.dp),
                color = AppColors.outline
            )
            StatItem(
                value = stats.unreadCount.toString(),
                label = "Unread"
            )
        }
    }
}

@Composable
private fun StatItem(value: String, label: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = value,
            style = AppTypography.headingSmall,
            color = AppColors.primary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = AppTypography.bodySmall,
            color = AppColors.textSecondary
        )
    }
}

@Composable
private fun CategoryFilterSection(
    categories: List<String>,
    selectedCategory: String?,
    onCategorySelected: (String?) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Categories",
            style = AppTypography.headingMedium,
            color = AppColors.textPrimary
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                FilterChip(
                    selected = selectedCategory == null,
                    onClick = { onCategorySelected(null) },
                    label = { Text("All") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.primary,
                        selectedLabelColor = AppColors.onPrimary
                    )
                )
            }
            
            items(categories) { category ->
                FilterChip(
                    selected = selectedCategory == category,
                    onClick = { onCategorySelected(category) },
                    label = { Text(category) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.primary,
                        selectedLabelColor = AppColors.onPrimary
                    )
                )
            }
        }
    }
}

@Composable
private fun NewsletterListSection(
    newsletters: List<HomeViewModel.Newsletter>,
    onToggleSubscription: (String) -> Unit,
    onMarkAsRead: (String) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Newsletters",
                style = AppTypography.headingMedium,
                color = AppColors.textPrimary
            )
            Text(
                text = "${newsletters.size} items",
                style = AppTypography.bodySmall,
                color = AppColors.textSecondary
            )
        }
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(newsletters) { newsletter ->
                NewsletterItem(
                    newsletter = newsletter,
                    onToggleSubscription = onToggleSubscription,
                    onMarkAsRead = onMarkAsRead
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NewsletterItem(
    newsletter: HomeViewModel.Newsletter,
    onToggleSubscription: (String) -> Unit,
    onMarkAsRead: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (newsletter.isRead) 
                AppColors.surfaceVariant 
            else 
                AppColors.surface
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(AppColors.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = newsletter.name.take(2).uppercase(),
                    style = AppTypography.bodyMedium,
                    color = AppColors.onPrimaryContainer,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = newsletter.name,
                    style = AppTypography.bodyLarge,
                    color = AppColors.textPrimary,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = newsletter.description,
                    style = AppTypography.bodySmall,
                    color = AppColors.textSecondary,
                    maxLines = 2
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AssistChip(
                        onClick = { },
                        label = { Text(newsletter.category) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = AppColors.secondaryContainer,
                            labelColor = AppColors.onSecondaryContainer
                        )
                    )
                    if (newsletter.isSubscribed) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Subscribed",
                            tint = AppColors.success,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
            
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Switch(
                    checked = newsletter.isSubscribed,
                    onCheckedChange = { onToggleSubscription(newsletter.id) },
                    colors = SwitchDefaults.colors(
                        checkedTrackColor = AppColors.primary
                    )
                )
                
                if (!newsletter.isRead) {
                    TextButton(
                        onClick = { onMarkAsRead(newsletter.id) }
                    ) {
                        Text(
                            "Mark as read",
                            style = AppTypography.bodySmall,
                            color = AppColors.primary
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterBottomSheet(
    onDismiss: () -> Unit,
    selectedCategory: String?,
    categories: List<String>,
    onFilterApplied: (String?) -> Unit,
    onClearFilters: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = AppColors.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Filter Newsletters",
                    style = AppTypography.headingMedium,
                    color = AppColors.textPrimary
                )
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = AppColors.textPrimary
                    )
                }
            }
            
            Divider(color = AppColors.outline)
            
            Text(
                text = "Category",
                style = AppTypography.bodyLarge,
                color = AppColors.textPrimary,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            FilterChip(
                selected = selectedCategory == null,
                onClick = { onFilterApplied(null) },
                label = { Text("All Categories") },
                modifier = Modifier.fillMaxWidth(),
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = AppColors.primary,
                    selectedLabelColor = AppColors.onPrimary
                )
            )
            
            categories.forEach { category ->
                FilterChip(
                    selected = selectedCategory == category,
                    onClick = { onFilterApplied(category) },
                    label = { Text(category) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.primary,
                        selectedLabelColor = AppColors.onPrimary
                    )
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onClearFilters,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Clear All")
                }
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AppColors.primary
                    )
                ) {
                    Text("Apply", color = AppColors.onPrimary)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SearchBottomSheet(
    onDismiss: () -> Unit,
    currentQuery: String,
    onSearch: (String) -> Unit
) {
    var searchText by remember { mutableStateOf(currentQuery) }
    
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = AppColors.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Search Newsletters",
                    style = AppTypography.headingMedium,
                    color = AppColors.textPrimary
                )
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = AppColors.textPrimary
                    )
                }
            }
            
            Divider(color = AppColors.outline)
            
            OutlinedTextField(
                value = searchText,
                onValueChange = { searchText = it },
                label = { Text("Search query") },
                placeholder = { Text("Enter newsletter name or description") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AppColors.primary,
                    focusedLabelColor = AppColors.primary
                )
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancel")
                }
                Button(
                    onClick = { onSearch(searchText) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AppColors.primary
                    )
                ) {
                    Text("Search", color = AppColors.onPrimary)
                }
            }
        }
    }
},
    onNavigateToSettings: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val newsletters by viewModel.newsletters.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val stats by viewModel.stats.collectAsState()
    
    var showFilterSheet by remember { mutableStateOf(false) }
    var showSearchSheet by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Piper Newsletter",
                        style = AppTypography.headingLarge,
                        color = AppColors.textPrimary
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AppColors.background
                ),
                actions = {
                    IconButton(onClick = { showSearchSheet = true }) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = AppColors.primary
                        )
                    }
                    IconButton(onClick = { showFilterSheet = true }) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = "Filter",
                            tint = AppColors.primary
                        )
                    }
                }
            )
        },
        containerColor = AppColors.background
    ) { paddingValues ->
        when (uiState) {
            is HomeViewModel.HomeState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = AppColors.primary
                    )
                }
            }
            
            is HomeViewModel.HomeState.Success -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item { WelcomeSection() }
                        item { QuickStatsSection(stats = stats) }
                        item { CategoryFilterSection(
                            categories = categories,
                            selectedCategory = selectedCategory,
                            onCategorySelected = { category ->
                                viewModel.filterByCategory(category)
                            }
                        )}
                        item { NewsletterListSection(
                            newsletters = newsletters,
                            onToggleSubscription = { id ->
                                viewModel.toggleSubscription(id)
                            },
                            onMarkAsRead = { id ->
                                viewModel.markAsRead(id)
                            }
                        )}
                    }
                }
            }
            
            is HomeViewModel.HomeState.Error -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Error,
                            contentDescription = "Error",
                            tint = AppColors.error,
                            modifier = Modifier.size(64.dp)
                        )
                        
                        Text(
                            text = (uiState as HomeViewModel.HomeState.Error).message,
                            style = AppTypography.bodyMedium,
                            color = AppColors.textPrimary
                        )
                        
                        Button(
                            onClick = { viewModel.refreshNewsletters() },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AppColors.primary
                            )
                        ) {
                            Text("Retry", color = AppColors.onPrimary)
                        }
                    }
                }
            }
        }
    }
    
    if (showFilterSheet) {
        FilterBottomSheet(
            onDismiss = { showFilterSheet = false },
            selectedCategory = selectedCategory,
            categories = categories,
            onFilterApplied = { category ->
                viewModel.filterByCategory(category)
                showFilterSheet = false
            },
            onClearFilters = {
                viewModel.clearFilters()
                showFilterSheet = false
            }
        )
    }
    
    if (showSearchSheet) {
        SearchBottomSheet(
            onDismiss = { showSearchSheet = false },
            currentQuery = searchQuery,
            onSearch = { query ->
                viewModel.searchNewsletters(query)
                showSearchSheet = false
            }
        )
    }
}