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
import com.piper.newsletter.shared.models.Newsletter
import com.piper.newsletter.shared.viewmodels.HomeViewModel
import com.piper.newsletter.shared.viewmodels.HomeViewModel.State
import org.koin.androidx.compose.koinViewModel

@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = koinViewModel()
) {
    val state by viewModel.state.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadNewsletters()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(AppSpacing.Medium.dp)
    ) {
        // Header
        Text(
            text = AppStrings.Home,
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(bottom = AppSpacing.Large.dp)
        )
        
        // Search Bar
        var searchQuery by remember { mutableStateOf("") }
        AppTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            label = "Search newsletters",
            leadingIcon = AppIcon.IconSearch,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = AppSpacing.Medium.dp)
        )
        
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
                    onRetry = { viewModel.loadNewsletters() },
                    modifier = Modifier.fillMaxSize()
                )
            }
            
            is State.Success -> {
                val filteredNewsletters = currentState.newsletters.filter { newsletter ->
                    newsletter.title.contains(searchQuery, ignoreCase = true) ||
                    newsletter.description.contains(searchQuery, ignoreCase = true)
                }
                
                if (filteredNewsletters.isEmpty()) {
                    EmptyState(
                        message = "No newsletters found",
                        icon = AppIcon.IconNewsletter,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    NewsletterList(
                        newsletters = filteredNewsletters,
                        onNewsletterClick = { newsletter ->
                            navController.navigate("newsletter_detail/${newsletter.id}")
                        },
                        onNewsletterLongClick = { newsletter ->
                            // Handle long click (e.g., show context menu)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun NewsletterList(
    newsletters: List<Newsletter>,
    onNewsletterClick: (Newsletter) -> Unit,
    onNewsletterLongClick: (Newsletter) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(AppSpacing.Small.dp)
    ) {
        items(newsletters) { newsletter ->
            NewsletterCard(
                newsletter = newsletter,
                onClick = { onNewsletterClick(newsletter) },
                onLongClick = { onNewsletterLongClick(newsletter) }
            )
        }
    }
}

@Composable
fun NewsletterCard(
    newsletter: Newsletter,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    AppCard(
        onClick = onClick,
        onLongClick = onLongClick,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(AppSpacing.Medium.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Newsletter Icon/Logo
            AppIcon(
                name = AppIcon.IconNewsletter,
                size = AppIcon.Large,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(end = AppSpacing.Medium.dp)
            )
            
            // Newsletter Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = newsletter.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 2
                )
                
                Text(
                    text = newsletter.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 3,
                    modifier = Modifier.padding(top = AppSpacing.XSmall.dp)
                )
                
                // Newsletter Stats
                Row(
                    modifier = Modifier.padding(top = AppSpacing.Small.dp),
                    horizontalArrangement = Arrangement.spacedBy(AppSpacing.Large.dp)
                ) {
                    NewsletterStat(
                        label = "Subscribers",
                        value = newsletter.subscriberCount.toString(),
                        icon = AppIcon.IconProfile
                    )
                    
                    NewsletterStat(
                        label = "Open Rate",
                        value = "${newsletter.openRate}%",
                        icon = AppIcon.IconAnalytics
                    )
                }
            }
            
            // Action Button
            AppButton(
                onClick = onClick,
                variant = ButtonVariant.Outlined,
                text = "View"
            )
        }
    }
}

@Composable
fun NewsletterStat(
    label: String,
    value: String,
    icon: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        AppIcon(
            name = icon,
            size = AppIcon.Small,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(end = AppSpacing.XSmall.dp)
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

@Composable
fun HomeScreenPreview() {
    PiperNewsletterTheme {
        Surface {
            HomeScreen(navController = NavController(androidx.compose.ui.platform.LocalContext.current))
        }
    }
}