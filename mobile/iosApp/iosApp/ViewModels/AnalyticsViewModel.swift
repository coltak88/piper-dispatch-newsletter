import Foundation
import Combine

enum AnalyticsState {
    case loading
    case success(AnalyticsData)
    case error(String)
}

struct AnalyticsData: Identifiable {
    let id = UUID()
    let totalViews: Int
    let totalSubscribers: Int
    let clickRate: Double
    let revenue: Double
    let viewsChange: Double
    let subscribersChange: Double
    let clickRateChange: Double
    let revenueChange: Double
    let timeRange: String
    let chartData: [ChartPoint]
    let newsletterAnalytics: [NewsletterAnalytics]
    let activeReaders: Int
    let pagesPerMinute: Int
    let currentClickRate: Double
}

struct ChartPoint: Identifiable {
    let id = UUID()
    let label: String
    let value: Double
    let date: Date
}

struct NewsletterAnalytics: Identifiable {
    let id = UUID()
    let title: String
    let sendDate: Date
    let views: Int
    let clicks: Int
    let clickThroughRate: Double
    let isTrending: Bool
}

class AnalyticsViewModel: ObservableObject {
    @Published var state: AnalyticsState = .loading
    private var cancellables = Set<AnyCancellable>()
    private let analyticsManager = AnalyticsManager()
    
    func loadAnalytics() {
        state = .loading
        
        analyticsManager.getAnalytics()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    switch completion {
                    case .failure(let error):
                        self.state = .error(error.localizedDescription)
                    case .finished:
                        break
                    }
                },
                receiveValue: { analyticsData in
                    self.state = .success(analyticsData)
                }
            )
            .store(in: &cancellables)
    }
    
    func searchAnalytics(query: String) {
        // Implement search functionality
        print("Searching analytics for: \(query)")
    }
    
    func updateTimeRange(range: String) {
        // Implement time range update
        print("Updating time range to: \(range)")
        loadAnalytics() // Reload with new time range
    }
    
    func exportAnalytics(format: ExportFormat) {
        // Implement export functionality
        print("Exporting analytics as \(format)")
    }
}

enum ExportFormat: String {
    case csv = "CSV"
    case pdf = "PDF"
    case json = "JSON"
}

class AnalyticsManager {
    func getAnalytics() -> AnyPublisher<AnalyticsData, Error> {
        // Mock data for now - replace with actual API calls
        let mockData = AnalyticsData(
            totalViews: 125000,
            totalSubscribers: 8500,
            clickRate: 24.5,
            revenue: 12500.0,
            viewsChange: 12.3,
            subscribersChange: 5.7,
            clickRateChange: -2.1,
            revenueChange: 18.9,
            timeRange: "7d",
            chartData: generateMockChartData(),
            newsletterAnalytics: generateMockNewsletterAnalytics(),
            activeReaders: 342,
            pagesPerMinute: 28,
            currentClickRate: 26.1
        )
        
        return Just(mockData)
            .setFailureType(to: Error.self)
            .delay(for: .seconds(1), scheduler: RunLoop.main)
            .eraseToAnyPublisher()
    }
    
    private func generateMockChartData() -> [ChartPoint] {
        let calendar = Calendar.current
        let now = Date()
        
        return (0..<7).map { dayOffset in
            let date = calendar.date(byAdding: .day, value: -dayOffset, to: now)!
            let value = Double.random(in: 8000...15000)
            let label = calendar.shortWeekdaySymbols[calendar.component(.weekday, from: date) - 1]
            
            return ChartPoint(label: label, value: value, date: date)
        }.reversed()
    }
    
    private func generateMockNewsletterAnalytics() -> [NewsletterAnalytics] {
        let calendar = Calendar.current
        let now = Date()
        
        return [
            NewsletterAnalytics(
                title: "Tech Weekly #45",
                sendDate: calendar.date(byAdding: .day, value: -1, to: now)!,
                views: 8500,
                clicks: 2100,
                clickThroughRate: 24.7,
                isTrending: true
            ),
            NewsletterAnalytics(
                title: "AI Insights Monthly",
                sendDate: calendar.date(byAdding: .day, value: -3, to: now)!,
                views: 12300,
                clicks: 2800,
                clickThroughRate: 22.8,
                isTrending: false
            ),
            NewsletterAnalytics(
                title: "Startup Spotlight",
                sendDate: calendar.date(byAdding: .day, value: -5, to: now)!,
                views: 6200,
                clicks: 1500,
                clickThroughRate: 24.2,
                isTrending: true
            ),
            NewsletterAnalytics(
                title: "Developer Digest",
                sendDate: calendar.date(byAdding: .day, value: -7, to: now)!,
                views: 9800,
                clicks: 2400,
                clickThroughRate: 24.5,
                isTrending: false
            )
        ]
    }
}