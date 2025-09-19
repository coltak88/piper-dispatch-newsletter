import SwiftUI
import Combine

struct NewsletterDetailScreen: View {
    let newsletterId: String
    @ObservedObject private var viewModel: NewsletterDetailViewModel
    @EnvironmentObject private var navigationState: NavigationState
    @State private var showPreferencesSheet = false
    
    init(newsletterId: String, viewModel: NewsletterDetailViewModel) {
        self.newsletterId = newsletterId
        self.viewModel = viewModel
    }
    
    var body: some View {
        VStack(spacing: AppSpacing.Medium) {
            // Header
            HStack {
                Button("Back") {
                    navigationState.navigateBack()
                }
                .buttonStyle(TextButtonStyle())
                
                Spacer()
                
                Text(AppStrings.Newsletter_Detail)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(Color.primary)
                
                Spacer()
                
                // Action menu would go here
            }
            
            // Content based on state
            switch viewModel.state {
            case .loading:
                LoadingView(style: .circular)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                
            case .error(let message):
                ErrorView(
                    message: message,
                    onRetry: { viewModel.loadNewsletter(newsletterId: newsletterId) }
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                
            case .success(let newsletter):
                ScrollView {
                    VStack(spacing: AppSpacing.Medium) {
                        NewsletterHeader(
                            newsletter: newsletter,
                            onSubscribeClick: { viewModel.toggleSubscription() }
                        )
                        
                        AnalyticsSection(
                            newsletter: newsletter,
                            onAnalyticsClick: { /* Navigate to analytics */ }
                        )
                        
                        PerformanceChart(
                            title: "Performance Over Time",
                            data: newsletter.performanceData,
                            chartType: .line
                        )
                        
                        PreferencesSection(
                            onPreferencesClick: { showPreferencesSheet = true }
                        )
                    }
                    .padding(.horizontal, AppSpacing.Medium)
                }
            }
        }
        .padding(AppSpacing.Medium)
        .sheet(isPresented: $showPreferencesSheet) {
            if case .success(let newsletter) = viewModel.state {
                PreferencesSheet(
                    newsletter: newsletter,
                    onDismiss: { showPreferencesSheet = false },
                    onSave: { preferences in
                        viewModel.updatePreferences(preferences)
                        showPreferencesSheet = false
                    }
                )
            }
        }
        .onAppear {
            viewModel.loadNewsletter(newsletterId: newsletterId)
        }
    }
}

struct NewsletterHeader: View {
    let newsletter: NewsletterDetail
    let onSubscribeClick: () -> Void
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: AppSpacing.Medium) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: AppSpacing.Small) {
                        Text(newsletter.title)
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(Color.primaryText)
                        
                        Text(newsletter.author)
                            .font(.body)
                            .foregroundColor(Color.secondaryText)
                    }
                    
                    Spacer()
                    
                    AppIcon(name: newsletter.icon, size: .large, tint: Color.accent)
                }
                
                Text(newsletter.description)
                    .font(.body)
                    .foregroundColor(Color.secondaryText)
                    .multilineTextAlignment(.leading)
                
                AppButton(
                    title: newsletter.isSubscribed ? "Unsubscribe" : "Subscribe",
                    variant: newsletter.isSubscribed ? .outlined : .primary,
                    action: onSubscribeClick
                )
            }
            .padding(AppSpacing.Medium)
        }
    }
}

struct AnalyticsSection: View {
    let newsletter: NewsletterDetail
    let onAnalyticsClick: () -> Void
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: AppSpacing.Medium) {
                HStack {
                    Text("Analytics")
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(Color.primaryText)
                    
                    Spacer()
                    
                    Button("View Details") {
                        onAnalyticsClick()
                    }
                    .buttonStyle(TextButtonStyle())
                }
                
                // Analytics Chips
                VStack(spacing: AppSpacing.Small) {
                    HStack(spacing: AppSpacing.Small) {
                        AnalyticsChip(
                            label: "Subscribers",
                            value: String(newsletter.subscribers),
                            icon: AppIcon.IconProfile
                        )
                        
                        AnalyticsChip(
                            label: "Open Rate",
                            value: String(format: "%.1f%%", newsletter.openRate),
                            icon: AppIcon.IconAnalytics
                        )
                    }
                    
                    HStack(spacing: AppSpacing.Small) {
                        AnalyticsChip(
                            label: "Click Rate",
                            value: String(format: "%.1f%%", newsletter.clickRate),
                            icon: AppIcon.IconAnalytics
                        )
                        
                        AnalyticsChip(
                            label: "Frequency",
                            value: newsletter.frequency,
                            icon: AppIcon.IconCalendar
                        )
                    }
                }
            }
            .padding(AppSpacing.Medium)
        }
    }
}

struct AnalyticsChip: View {
    let label: String
    let value: String
    let icon: String
    
    var body: some View {
        HStack(spacing: AppSpacing.XSmall) {
            AppIcon(name: icon, size: .small, tint: Color.accent)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(Color.primaryText)
                
                Text(label)
                    .font(.caption2)
                    .foregroundColor(Color.secondaryText)
            }
        }
        .padding(.horizontal, AppSpacing.Small)
        .padding(.vertical, AppSpacing.XSmall)
        .background(Color.surfaceVariant)
        .cornerRadius(AppCornerRadius.Small)
    }
}

struct PerformanceChart: View {
    let title: String
    let data: [NewsletterDetail.PerformancePoint]
    let chartType: ChartType
    
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: AppSpacing.Medium) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(Color.primaryText)
                
                // Chart placeholder
                RoundedRectangle(cornerRadius: AppCornerRadius.Medium)
                    .fill(Color.surfaceVariant)
                    .frame(height: AppMetrics.ChartMinHeight)
                    .overlay(
                        Text("Chart: \(title) (\(data.count) points)")
                            .font(.caption)
                            .foregroundColor(Color.secondaryText)
                    )
            }
            .padding(AppSpacing.Medium)
        }
    }
}

struct PreferencesSection: View {
    let onPreferencesClick: () -> Void
    
    var body: some View {
        AppCard {
            HStack {
                VStack(alignment: .leading, spacing: AppSpacing.XSmall) {
                    Text("Preferences")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(Color.primaryText)
                    
                    Text("Customize your subscription settings")
                        .font(.caption)
                        .foregroundColor(Color.secondaryText)
                }
                
                Spacer()
                
                Button("Manage") {
                    onPreferencesClick()
                }
                .buttonStyle(OutlinedButtonStyle())
            }
            .padding(AppSpacing.Medium)
        }
    }
}

struct PreferencesSheet: View {
    let newsletter: NewsletterDetail
    let onDismiss: () -> Void
    let onSave: (NewsletterDetail.Preferences) -> Void
    
    @State private var frequency: String
    @State private var notifications: Bool
    @State private var categories: [String]
    
    init(newsletter: NewsletterDetail, onDismiss: @escaping () -> Void, onSave: @escaping (NewsletterDetail.Preferences) -> Void) {
        self.newsletter = newsletter
        self.onDismiss = onDismiss
        self.onSave = onSave
        self._frequency = State(initialValue: newsletter.preferences.frequency)
        self._notifications = State(initialValue: newsletter.preferences.notifications)
        self._categories = State(initialValue: newsletter.preferences.categories)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Frequency")) {
                    Picker("Frequency", selection: $frequency) {
                        Text("Daily").tag("daily")
                        Text("Weekly").tag("weekly")
                        Text("Monthly").tag("monthly")
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section {
                    Toggle("Notifications", isOn: $notifications)
                }
                
                Section(header: Text("Categories")) {
                    Text("Select categories to follow")
                        .font(.caption)
                        .foregroundColor(Color.secondaryText)
                }
            }
            .navigationTitle("Subscription Preferences")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        onDismiss()
                    }
                    .buttonStyle(TextButtonStyle())
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        let newPreferences = NewsletterDetail.Preferences(
                            frequency: frequency,
                            notifications: notifications,
                            categories: categories
                        )
                        onSave(newPreferences)
                    }
                    .buttonStyle(TextButtonStyle())
                }
            }
        }
    }
}

enum ChartType {
    case line, bar, area, pie
}

struct NewsletterDetailScreen_Previews: PreviewProvider {
    static var previews: some View {
        let viewModel = NewsletterDetailViewModel()
        NewsletterDetailScreen(
            newsletterId: "1",
            viewModel: viewModel
        )
        .environmentObject(NavigationState())
    }
}