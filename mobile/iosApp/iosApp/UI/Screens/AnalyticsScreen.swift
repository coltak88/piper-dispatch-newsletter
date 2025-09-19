import SwiftUI
import Combine

struct AnalyticsScreen: View {
    @ObservedObject private var viewModel: AnalyticsViewModel
    @State private var searchText = ""
    @State private var selectedTimeRange = "7d"
    
    init(viewModel: AnalyticsViewModel = AnalyticsViewModel()) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header with search and time range selector
            HStack {
                Button(action: { /* Back action */ }) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(AppColors.primary)
                }
                
                AppTextField(
                    text: $searchText,
                    placeholder: "Search analytics...",
                    leadingIcon: "magnifyingglass"
                )
                .onChange(of: searchText) { newValue in
                    viewModel.searchAnalytics(query: newValue)
                }
                
                Picker("Time Range", selection: $selectedTimeRange) {
                    Text("7d").tag("7d")
                    Text("30d").tag("30d")
                    Text("90d").tag("90d")
                }
                .pickerStyle(SegmentedPickerStyle())
                .frame(width: 150)
                .onChange(of: selectedTimeRange) { newValue in
                    viewModel.updateTimeRange(range: newValue)
                }
            }
            .padding(AppSpacing.medium)
            .background(AppColors.surface)
            
            // Content based on state
            switch viewModel.state {
            case .loading:
                LoadingIndicator(style: .circular)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    
            case .error(let message):
                ErrorState(
                    message: message,
                    style: .fullScreen,
                    onRetry: { viewModel.loadAnalytics() }
                )
                
            case .success(let analytics):
                AnalyticsContent(analytics: analytics)
            }
        }
        .background(AppColors.background)
        .navigationBarHidden(true)
        .onAppear {
            viewModel.loadAnalytics()
        }
    }
}

struct AnalyticsContent: View {
    let summary: AnalyticsSummary
    let userAnalytics: UserAnalytics?
    let dashboardMetrics: DashboardMetrics?
    let onExport: (ExportFormat) -> Void
    
    @State private var selectedTimeRange: AnalyticsTimeRange = .week
    @State private var selectedGranularity: AnalyticsGranularity = .daily
    
    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Time Range Selector
            Picker("Time Range", selection: $selectedTimeRange) {
                Text("Week").tag(AnalyticsTimeRange.week)
                Text("Month").tag(AnalyticsTimeRange.month)
                Text("Quarter").tag(AnalyticsTimeRange.quarter)
                Text("Year").tag(AnalyticsTimeRange.year)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            
            // Key Metrics Cards
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    MetricCard(
                        title: "Total Users",
                        value: formatNumber(summary.totalUsers),
                        change: summary.userGrowthRate,
                        icon: "person.2",
                        color: .blue
                    )
                    
                    MetricCard(
                        title: "Active Subscriptions",
                        value: formatNumber(summary.activeSubscriptions),
                        change: summary.subscriptionGrowthRate,
                        icon: "bell",
                        color: .green
                    )
                    
                    MetricCard(
                        title: "Avg. Open Rate",
                        value: "\(summary.averageOpenRate)%",
                        change: summary.openRateChange,
                        icon: "eye",
                        color: .orange
                    )
                    
                    MetricCard(
                        title: "Revenue",
                        value: formatCurrency(summary.totalRevenue),
                        change: summary.revenueGrowthRate,
                        icon: "dollarsign.circle",
                        color: .purple
                    )
                }
                .padding(.horizontal)
            }
            
            // Charts Section
            VStack(alignment: .leading, spacing: 16) {
                // User Growth Chart
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("User Growth")
                            .font(.headline)
                        
                        Spacer()
                        
                        Picker("Granularity", selection: $selectedGranularity) {
                            Text("Daily").tag(AnalyticsGranularity.daily)
                            Text("Weekly").tag(AnalyticsGranularity.weekly)
                            Text("Monthly").tag(AnalyticsGranularity.monthly)
                        }
                        .pickerStyle(.menu)
                    }
                    
                    AnalyticsChart(
                        data: summary.userGrowthData,
                        title: "Users",
                        color: .blue
                    )
                    .frame(height: 200)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: .black.opacity(0.1), radius: 2)
                
                // Newsletter Performance Chart
                if !summary.topNewsletters.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Top Performing Newsletters")
                            .font(.headline)
                        
                        ForEach(summary.topNewsletters, id: \\.id) { newsletter in
                            NewsletterAnalyticsRow(
                                newsletter: newsletter,
                                performance: newsletter.performance
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.1), radius: 2)
                }
            }
            .padding(.horizontal)
            
            // Real-time Metrics
            if let dashboardMetrics = dashboardMetrics {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Real-time Metrics")
                        .font(.headline)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 12) {
                        RealTimeMetric(
                            title: "Active Users",
                            value: "\(dashboardMetrics.activeUsers)",
                            icon: "person.circle",
                            trend: dashboardMetrics.activeUsersTrend
                        )
                        
                        RealTimeMetric(
                            title: "Newsletters Sent",
                            value: "\(dashboardMetrics.newslettersSentToday)",
                            icon: "paperplane",
                            trend: dashboardMetrics.newslettersSentTrend
                        )
                        
                        RealTimeMetric(
                            title: "Avg. Engagement",
                            value: "\(dashboardMetrics.averageEngagementRate)%",
                            icon: "heart",
                            trend: dashboardMetrics.engagementTrend
                        )
                        
                        RealTimeMetric(
                            title: "Server Status",
                            value: dashboardMetrics.serverStatus,
                            icon: "server.rack",
                            trend: 0
                        )
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: .black.opacity(0.1), radius: 2)
            }
            
            Spacer(minLength: 20)
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let change: Double
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.title3)
                
                Spacer()
                
                if change != 0 {
                    HStack(spacing: 2) {
                        Image(systemName: change > 0 ? "arrow.up.right" : "arrow.down.right")
                            .font(.caption)
                        
                        Text("\(abs(change), specifier: "%.1f")%")
                            .font(.caption)
                    }
                    .foregroundColor(change > 0 ? .green : .red)
                }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(16)
        .frame(width: 140, height: 100)
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }
}

struct AnalyticsChart: View {
    let data: [UserGrowthDataPoint]
    let title: String
    let color: Color
    
    var body: some View {
        GeometryReader { geometry in
            let maxValue = data.map { $0.userCount }.max() ?? 100
            let minValue = data.map { $0.userCount }.min() ?? 0
            let range = maxValue - minValue
            
            ZStack {
                // Grid lines
                VStack(spacing: 0) {
                    ForEach(0..<5) { i in
                        HStack {
                            Text("\(Int(maxValue - Double(i) * range / 4))")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                                .frame(width: 30, alignment: .trailing)
                            
                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(height: 0.5)
                        }
                        
                        if i < 4 {
                            Spacer()
                        }
                    }
                }
                
                // Chart line
                Path { path in
                    for (index, point) in data.enumerated() {
                        let x = Double(index) * (geometry.size.width - 30) / Double(max(data.count - 1, 1))
                        let y = geometry.size.height - (Double(point.userCount) - minValue) * geometry.size.height / range
                        
                        if index == 0 {
                            path.move(to: CGPoint(x: x + 30, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x + 30, y: y))
                        }
                    }
                }
                .stroke(color, lineWidth: 2)
                
                // Data points
                ForEach(Array(data.enumerated()), id: \\.offset) { index, point in
                    let x = Double(index) * (geometry.size.width - 30) / Double(max(data.count - 1, 1))
                    let y = geometry.size.height - (Double(point.userCount) - minValue) * geometry.size.height / range
                    
                    Circle()
                        .fill(color)
                        .frame(width: 6, height: 6)
                        .position(x: x + 30, y: y)
                }
            }
        }
    }
}

struct NewsletterAnalyticsRow: View {
    let newsletter: NewsletterPerformance
    let performance: NewsletterPerformance
    
    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(newsletter.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                HStack(spacing: 16) {
                    Label("\(newsletter.subscriberCount)", systemImage: "person.2")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Label("\(newsletter.openRate)%", systemImage: "eye")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Label("\(newsletter.clickRate)%", systemImage: "cursorarrow.click")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Performance indicator
            Circle()
                .fill(performance.openRate > 25 ? Color.green : performance.openRate > 15 ? Color.orange : Color.red)
                .frame(width: 12, height: 12)
        }
        .padding(.vertical, 8)
    }
}

struct RealTimeMetric: View {
    let title: String
    let value: String
    let icon: String
    let trend: Double
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.blue)
                    .font(.title3)
                
                Spacer()
                
                if trend != 0 {
                    Image(systemName: trend > 0 ? "arrow.up.right" : "arrow.down.right")
                        .font(.caption)
                        .foregroundColor(trend > 0 ? .green : .red)
                }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(12)
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
    }
}

class AnalyticsViewModel: ObservableObject {
    @Published var uiState: AnalyticsUiState = .loading
    
    private let analyticsManager = AnalyticsManager(api: PiperNewsletterAPI.shared, authManager: AuthManager.shared)
    
    func loadAnalytics() {
        uiState = .loading
        
        Task {
            do {
                let summary = try await analyticsManager.getAnalyticsSummary(
                    timeRange: .week,
                    granularity: .daily
                )
                let userAnalytics = try await analyticsManager.getUserAnalytics(userId: nil)
                let dashboardMetrics = try await analyticsManager.getDashboardMetrics()
                
                await MainActor.run {
                    self.uiState = .success(summary, userAnalytics, dashboardMetrics)
                }
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
    
    func exportAnalytics(format: ExportFormat) {
        Task {
            do {
                let data = try await analyticsManager.exportAnalytics(
                    format: format,
                    timeRange: .week,
                    includeUserData: true
                )
                // Handle file export
                print("Exported analytics data: \(data)")
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
}

enum AnalyticsUiState {
    case loading
    case success(AnalyticsSummary, UserAnalytics?, DashboardMetrics?)
    case error(String)
}

// Helper functions
func formatNumber(_ number: Int32) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.maximumFractionDigits = 0
    return formatter.string(from: NSNumber(value: number)) ?? "\(number)"
}

func formatCurrency(_ amount: Double) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = "USD"
    return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
}