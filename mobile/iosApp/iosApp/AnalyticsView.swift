import SwiftUI
import Charts

struct AnalyticsView: View {
    @StateObject private var viewModel = AnalyticsViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if let error = viewModel.error {
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 50))
                                .foregroundColor(.orange)
                            
                            Text("Error Loading Analytics")
                                .font(.headline)
                            
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                            
                            Button("Retry") {
                                viewModel.loadAnalytics()
                            }
                            .buttonStyle(.borderedProminent)
                        }
                        .padding()
                    } else {
                        // Overview Cards
                        VStack(spacing: 16) {
                            HStack(spacing: 16) {
                                MetricCard(
                                    title: "Total Views",
                                    value: "\(viewModel.totalViews)",
                                    icon: "eye.fill",
                                    color: .blue
                                )
                                
                                MetricCard(
                                    title: "Total Clicks",
                                    value: "\(viewModel.totalClicks)",
                                    icon: "cursorarrow.click.fill",
                                    color: .green
                                )
                            }
                            
                            HStack(spacing: 16) {
                                MetricCard(
                                    title: "Open Rate",
                                    value: "\(viewModel.openRate)%",
                                    icon: "envelope.open.fill",
                                    color: .orange
                                )
                                
                                MetricCard(
                                    title: "Click Rate",
                                    value: "\(viewModel.clickRate)%",
                                    icon: "hand.point.up.fill",
                                    color: .purple
                                )
                            }
                        }
                        
                        // Time Series Chart
                        if !viewModel.timeSeriesData.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Views Over Time")
                                    .font(.headline)
                                
                                Chart(viewModel.timeSeriesData, id: \.date) { data in
                                    LineMark(
                                        x: .value("Date", data.date),
                                        y: .value("Views", data.value)
                                    )
                                    .foregroundStyle(.blue)
                                    
                                    AreaMark(
                                        x: .value("Date", data.date),
                                        y: .value("Views", data.value)
                                    )
                                    .foregroundStyle(.blue.opacity(0.1))
                                }
                                .frame(height: 200)
                                .chartYAxis {
                                    AxisMarks { value in
                                        AxisGridLine()
                                        AxisValueLabel {
                                            if let intValue = value.as(Int.self) {
                                                Text("\(intValue)")
                                            }
                                        }
                                    }
                                }
                                .chartXAxis {
                                    AxisMarks { value in
                                        AxisGridLine()
                                        AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                                    }
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        }
                        
                        // Top Newsletters
                        if !viewModel.topNewsletters.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Top Performing Newsletters")
                                    .font(.headline)
                                
                                ForEach(viewModel.topNewsletters, id: \.id) { newsletter in
                                    NewsletterAnalyticsRow(newsletter: newsletter)
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Analytics")
            .onAppear {
                viewModel.loadAnalytics()
            }
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }
            
            Text(value)
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct NewsletterAnalyticsRow: View {
    let newsletter: Newsletter
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(newsletter.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                if let analytics = newsletter.analytics {
                    HStack(spacing: 16) {
                        Label("\(analytics.views)", systemImage: "eye")
                            .font(.caption)
                        
                        Label("\(analytics.clicks)", systemImage: "cursorarrow.click")
                            .font(.caption)
                        
                        Label("\(analytics.opens)", systemImage: "envelope.open")
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            if let analytics = newsletter.analytics {
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(analytics.clickRate)%")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text("click rate")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

class AnalyticsViewModel: ObservableObject {
    @Published var totalViews = 0
    @Published var totalClicks = 0
    @Published var openRate = 0.0
    @Published var clickRate = 0.0
    @Published var timeSeriesData: [TimeSeriesData] = []
    @Published var topNewsletters: [Newsletter] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let analyticsManager = AnalyticsManager()
    
    func loadAnalytics() {
        isLoading = true
        error = nil
        
        Task {
            do {
                let response = try await analyticsManager.getAnalytics()
                await MainActor.run {
                    self.isLoading = false
                    if response.success, let data = response.data {
                        self.updateAnalytics(data)
                    } else {
                        self.error = response.message ?? "Failed to load analytics"
                    }
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.error = error.localizedDescription
                }
            }
        }
    }
    
    private func updateAnalytics(_ data: AnalyticsData) {
        totalViews = data.totalViews
        totalClicks = data.totalClicks
        openRate = data.openRate
        clickRate = data.clickRate
        timeSeriesData = data.timeSeriesData
        topNewsletters = data.topNewsletters
    }
}