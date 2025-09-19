package com.piper.newsletter.android.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.piper.newsletter.android.ui.components.*
import com.piper.newsletter.android.ui.theme.*
import com.piper.newsletter.shared.models.NewsletterDetail
import com.piper.newsletter.shared.viewmodels.NewsletterDetailViewModel
import com.piper.newsletter.shared.viewmodels.NewsletterDetailViewModel.State
import org.koin.androidx.compose.koinViewModel

@Composable
fun NewsletterDetailScreen(
    newsletterId: String,
    navController: NavController,
    viewModel: NewsletterDetailViewModel = koinViewModel()
) {
    val state by viewModel.state.collectAsState()
    var showPreferencesSheet by remember { mutableStateOf(false) }
    
    LaunchedEffect(newsletterId) {
        viewModel.loadNewsletter(newsletterId)
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(AppSpacing.Medium.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            AppButton(
                onClick = { navController.navigateUp() },
                variant = ButtonVariant.Text,
                text = "Back"
            )
            
            Text(
                text = AppStrings.Newsletter_Detail,
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Action menu would go here
        }
        
        Spacer(modifier = Modifier.height(AppSpacing.Large.dp))
        
        // Content based on state
        when (val currentState = state) {
            is State.Loading -> {
                LoadingIndicator(
                    style = LoadingStyle.Circular,
                    modifier = Modifier.fillMaxSize()
                )
            }
            
            is State.Error -> {
                ErrorState(
                    message = currentState.message,
                    onRetry = { viewModel.loadNewsletter(newsletterId) },
                    modifier = Modifier.fillMaxSize()
                )
            }
            
            is State.Success -> {
                NewsletterDetailContent(
                    newsletter = currentState.newsletter,
                    onSubscribeClick = { viewModel.toggleSubscription() },
                    onPreferencesClick = { showPreferencesSheet = true },
                    onAnalyticsClick = { /* Navigate to analytics */ }
                )
            }
        }
    }
    
    // Preferences Sheet
    if (showPreferencesSheet) {
        PreferencesSheet(
            newsletter = (state as? State.Success)?.newsletter,
            onDismiss = { showPreferencesSheet = false },
            onSave = { preferences ->
                viewModel.updatePreferences(preferences)
                showPreferencesSheet = false
            }
        )
    }
}

@Composable
fun NewsletterDetailContent(
    newsletter: NewsletterDetail,
    onSubscribeClick: () -> Unit,
    onPreferencesClick: () -> Unit,
    onAnalyticsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
    ) {
        // Newsletter Header
        item {
            AppCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(AppSpacing.Medium.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = newsletter.title,
                                style = MaterialTheme.typography.headlineMedium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            
                            Text(
                                text = newsletter.author,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        
                        AppIcon(
                            name = newsletter.icon,
                            size = AppIcon.Large,
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(AppSpacing.Medium.dp))
                    
                    Text(
                        text = newsletter.description,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(AppSpacing.Large.dp))
                    
                    // Subscribe/Unsubscribe Button
                    AppButton(
                        onClick = onSubscribeClick,
                        variant = if (newsletter.isSubscribed) {
                            ButtonVariant.Outlined
                        } else {
                            ButtonVariant.Primary
                        },
                        text = if (newsletter.isSubscribed) {
                            "Unsubscribe"
                        } else {
                            "Subscribe"
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
        
        // Analytics Section
        item {
            AppCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(AppSpacing.Medium.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Analytics",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        AppButton(
                            onClick = onAnalyticsClick,
                            variant = ButtonVariant.Text,
                            text = "View Details"
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(AppSpacing.Medium.dp))
                    
                    // Analytics Chips
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(AppSpacing.Small.dp)
                    ) {
                        AnalyticsChip(
                            label = "Subscribers",
                            value = newsletter.subscribers.toString(),
                            icon = AppIcon.IconProfile,
                            modifier = Modifier.weight(1f)
                        )
                        
                        AnalyticsChip(
                            label = "Open Rate",
                            value = "${newsletter.openRate}%",
                            icon = AppIcon.IconAnalytics,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(AppSpacing.Small.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(AppSpacing.Small.dp)
                    ) {
                        AnalyticsChip(
                            label = "Click Rate",
                            value = "${newsletter.clickRate}%",
                            icon = AppIcon.IconAnalytics,
                            modifier = Modifier.weight(1f)
                        )
                        
                        AnalyticsChip(
                            label = "Frequency",
                            value = newsletter.frequency,
                            icon = AppIcon.IconCalendar,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
        
        // Performance Chart
        item {
            PerformanceChart(
                title = "Performance Over Time",
                data = newsletter.performanceData,
                chartType = ChartType.Line,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        // Preferences Section
        item {
            AppCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(AppSpacing.Medium.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = "Preferences",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        Text(
                            text = "Customize your subscription settings",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    AppButton(
                        onClick = onPreferencesClick,
                        variant = ButtonVariant.Outlined,
                        text = "Manage"
                    )
                }
            }
        }
    }
}

@Composable
fun AnalyticsChip(
    label: String,
    value: String,
    icon: String,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = MaterialTheme.shapes.small,
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Row(
            modifier = Modifier.padding(
                horizontal = AppSpacing.Small.dp,
                vertical = AppSpacing.XSmall.dp
            ),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(AppSpacing.XSmall.dp)
        ) {
            AppIcon(
                name = icon,
                size = AppIcon.Small,
                tint = MaterialTheme.colorScheme.primary
            )
            
            Column {
                Text(
                    text = value,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun PerformanceChart(
    title: String,
    data: List<NewsletterDetail.PerformancePoint>,
    chartType: ChartType,
    modifier: Modifier = Modifier
) {
    AppCard(
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(AppSpacing.Medium.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(bottom = AppSpacing.Medium.dp)
            )
            
            // Chart implementation would go here
            // This is a placeholder for the actual chart component
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(AppMetrics.ChartMinHeight.dp)
                    .background(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = MaterialTheme.shapes.medium
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Chart: $title (${data.size} points)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun PreferencesSheet(
    newsletter: NewsletterDetail?,
    onDismiss: () -> Unit,
    onSave: (NewsletterDetail.Preferences) -> Unit
) {
    if (newsletter == null) return
    
    var frequency by remember { mutableStateOf(newsletter.preferences.frequency) }
    var notifications by remember { mutableStateOf(newsletter.preferences.notifications) }
    var categories by remember { mutableStateOf(newsletter.preferences.categories) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Subscription Preferences",
                style = MaterialTheme.typography.titleLarge
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
            ) {
                // Frequency
                Text(
                    text = "Frequency",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(AppSpacing.Small.dp)
                ) {
                    FilterChip(
                        selected = frequency == "daily",
                        onClick = { frequency = "daily" },
                        label = { Text("Daily") }
                    )
                    
                    FilterChip(
                        selected = frequency == "weekly",
                        onClick = { frequency = "weekly" },
                        label = { Text("Weekly") }
                    )
                    
                    FilterChip(
                        selected = frequency == "monthly",
                        onClick = { frequency = "monthly" },
                        label = { Text("Monthly") }
                    )
                }
                
                // Notifications
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Notifications",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    
                    Switch(
                        checked = notifications,
                        onCheckedChange = { notifications = it }
                    )
                }
                
                // Categories
                Text(
                    text = "Categories",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = "Select categories to follow",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = {
            AppButton(
                onClick = {
                    val newPreferences = NewsletterDetail.Preferences(
                        frequency = frequency,
                        notifications = notifications,
                        categories = categories
                    )
                    onSave(newPreferences)
                },
                variant = ButtonVariant.Primary,
                text = "Save"
            )
        },
        dismissButton = {
            AppButton(
                onClick = onDismiss,
                variant = ButtonVariant.Text,
                text = "Cancel"
            )
        }
    )
}

enum class ChartType {
    Line, Bar, Area, Pie
}

@Composable
fun NewsletterDetailScreenPreview() {
    PiperNewsletterTheme {
        Surface {
            NewsletterDetailContent(
                newsletter = NewsletterDetail(
                    id = "1",
                    title = "Tech Weekly",
                    author = "Tech News Team",
                    description = "Your weekly dose of technology news and insights",
                    icon = AppIcon.IconNewsletter,
                    isSubscribed = true,
                    subscribers = 12500,
                    openRate = 42.5,
                    clickRate = 18.3,
                    frequency = "Weekly",
                    performanceData = emptyList(),
                    preferences = NewsletterDetail.Preferences(
                        frequency = "weekly",
                        notifications = true,
                        categories = listOf("Technology", "Innovation")
                    )
                ),
                onSubscribeClick = {},
                onPreferencesClick = {},
                onAnalyticsClick = {}
            )
        }
    }
}