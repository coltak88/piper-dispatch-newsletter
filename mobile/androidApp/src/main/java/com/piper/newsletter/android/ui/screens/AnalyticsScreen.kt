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
import com.piper.newsletter.shared.models.AnalyticsData
import com.piper.newsletter.shared.viewmodels.AnalyticsViewModel
import com.piper.newsletter.shared.viewmodels.AnalyticsViewModel.State
import org.koin.androidx.compose.koinViewModel

@Composable
fun AnalyticsScreen(
    navController: NavController,
    viewModel: AnalyticsViewModel = koinViewModel()
) {
    val state by viewModel.state.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadAnalytics()
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
            Text(
                text = AppStrings.Analytics,
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            AppButton(
                onClick = { viewModel.exportData() },
                variant = ButtonVariant.Outlined,
                text = "Export"
            )
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
                    onRetry = { viewModel.loadAnalytics() },
                    modifier = Modifier.fillMaxSize()
                )
            }
            
            is State.Success -> {
                AnalyticsContent(
                    analyticsData = currentState.analyticsData,
                    onMetricClick = { metric ->
                        // Handle metric click
                    }
                )
            }
        }
    }
}

@Composable
fun AnalyticsContent(
    analyticsData: AnalyticsData,
    onMetricClick: (AnalyticsData.Metric) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
    ) {
        // Key Metrics Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
            ) {
                MetricCard(
                    title = "Total Subscribers",
                    value = analyticsData.totalSubscribers.toString(),
                    change = analyticsData.subscriberGrowth,
                    icon = AppIcon.IconProfile,
                    modifier = Modifier.weight(1f)
                )
                
                MetricCard(
                    title = "Open Rate",
                    value = "${analyticsData.averageOpenRate}%",
                    change = analyticsData.openRateChange,
                    icon = AppIcon.IconAnalytics,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // Secondary Metrics Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
            ) {
                MetricCard(
                    title = "Click Rate",
                    value = "${analyticsData.averageClickRate}%",
                    change = analyticsData.clickRateChange,
                    icon = AppIcon.IconAnalytics,
                    modifier = Modifier.weight(1f)
                )
                
                MetricCard(
                    title = "Unsubscribe Rate",
                    value = "${analyticsData.unsubscribeRate}%",
                    change = analyticsData.unsubscribeRateChange,
                    icon = AppIcon.IconWarning,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // Performance Chart
        item {
            AnalyticsChart(
                title = "Performance Trends",
                data = analyticsData.performanceTrends,
                chartType = ChartType.Line,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        // Top Performing Newsletters
        item {
            Text(
                text = "Top Performing Newsletters",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(vertical = AppSpacing.Medium.dp)
            )
        }
        
        items(analyticsData.topNewsletters) { newsletter ->
            NewsletterAnalyticsRow(
                newsletter = newsletter,
                onClick = { onMetricClick(newsletter) }
            )
        }
        
        // Real-time Metrics
        item {
            Text(
                text = "Real-time Activity",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(vertical = AppSpacing.Medium.dp)
            )
        }
        
        items(analyticsData.realTimeMetrics) { metric ->
            RealTimeMetric(
                metric = metric
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    change: Double,
    icon: String,
    modifier: Modifier = Modifier
) {
    AppCard(
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(AppSpacing.Medium.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                AppIcon(
                    name = icon,
                    size = AppIcon.Medium,
                    tint = MaterialTheme.colorScheme.primary
                )
                
                // Change indicator
                val changeColor = if (change >= 0) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.error
                }
                
                val changeIcon = if (change >= 0) {
                    AppIcon.IconSuccess
                } else {
                    AppIcon.IconError
                }
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AppIcon(
                        name = changeIcon,
                        size = AppIcon.Small,
                        tint = changeColor
                    )
                    
                    Text(
                        text = "${if (change >= 0) "+" else ""}${String.format("%.1f", change)}%",
                        style = MaterialTheme.typography.labelSmall,
                        color = changeColor,
                        modifier = Modifier.padding(start = AppSpacing.XSmall.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(AppSpacing.Small.dp))
            
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Text(
                text = title,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun AnalyticsChart(
    title: String,
    data: List<AnalyticsData.ChartPoint>,
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
fun NewsletterAnalyticsRow(
    newsletter: AnalyticsData.NewsletterAnalytics,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    AppCard(
        onClick = onClick,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(AppSpacing.Medium.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = newsletter.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = "${newsletter.subscribers} subscribers",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.Large.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "${newsletter.openRate}%",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    
                    Text(
                        text = "Open Rate",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "${newsletter.clickRate}%",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    
                    Text(
                        text = "Click Rate",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun RealTimeMetric(
    metric: AnalyticsData.RealTimeMetric,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            AppIcon(
                name = metric.icon,
                size = AppIcon.Small,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(end = AppSpacing.Small.dp)
            )
            
            Column {
                Text(
                    text = metric.name,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = metric.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        Text(
            text = metric.value,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

enum class ChartType {
    Line, Bar, Pie, Area
}

@Composable
fun AnalyticsScreenPreview() {
    PiperNewsletterTheme {
        Surface {
            AnalyticsScreen(navController = NavController(androidx.compose.ui.platform.LocalContext.current))
        }
    }
}