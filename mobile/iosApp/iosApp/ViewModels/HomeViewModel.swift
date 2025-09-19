import SwiftUI
import Combine

enum HomeState {
    case loading
    case error(String)
    case success([Newsletter])
}

struct Newsletter: Identifiable, Codable {
    let id: String
    let title: String
    let description: String
    let category: String
    let subscriberCount: Int
    let rating: Double
    let frequency: String
    let isFeatured: Bool
    let isNew: Bool
    let logoUrl: String?
    let createdAt: Date
    
    init(
        id: String,
        title: String,
        description: String,
        category: String,
        subscriberCount: Int,
        rating: Double,
        frequency: String,
        isFeatured: Bool = false,
        isNew: Bool = false,
        logoUrl: String? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.category = category
        self.subscriberCount = subscriberCount
        self.rating = rating
        self.frequency = frequency
        self.isFeatured = isFeatured
        self.isNew = isNew
        self.logoUrl = logoUrl
        self.createdAt = createdAt
    }
}

struct FilterOptions {
    let category: String
    let sortBy: String
    let showOnlySubscribed: Bool
}

class HomeViewModel: ObservableObject {
    @Published private(set) var state: HomeState = .loading
    @Published private(set) var isLoading = false
    @Published private(set) var error: String?
    
    private let homeManager = HomeManager()
    private var cancellables = Set<AnyCancellable>()
    private var allNewsletters: [Newsletter] = []
    private var currentFilters = FilterOptions(
        category: "All",
        sortBy: "Popular",
        showOnlySubscribed: false
    )
    
    init() {
        loadNewsletters()
    }
    
    func loadNewsletters() {
        isLoading = true
        state = .loading
        
        homeManager.getNewsletters()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.state = .error(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] newsletters in
                    self?.allNewsletters = newsletters
                    self?.applyCurrentFilters()
                }
            )
            .store(in: &cancellables)
    }
    
    func searchNewsletters(query: String) {
        guard !query.isEmpty else {
            applyCurrentFilters()
            return
        }
        
        let filtered = allNewsletters.filter { newsletter in
            newsletter.title.localizedCaseInsensitiveContains(query) ||
            newsletter.description.localizedCaseInsensitiveContains(query) ||
            newsletter.category.localizedCaseInsensitiveContains(query)
        }
        
        applyFiltersToNewsletters(filtered)
    }
    
    func filterByCategory(category: String) {
        currentFilters = FilterOptions(
            category: category,
            sortBy: currentFilters.sortBy,
            showOnlySubscribed: currentFilters.showOnlySubscribed
        )
        applyCurrentFilters()
    }
    
    func applyFilters(filters: FilterOptions) {
        currentFilters = filters
        applyCurrentFilters()
    }
    
    private func applyCurrentFilters() {
        var filtered = allNewsletters
        
        // Filter by category
        if currentFilters.category != "All" {
            filtered = filtered.filter { $0.category == currentFilters.category }
        }
        
        // Sort
        switch currentFilters.sortBy {
        case "Popular":
            filtered.sort { $0.subscriberCount > $1.subscriberCount }
        case "Newest":
            filtered.sort { $0.createdAt > $1.createdAt }
        case "Rating":
            filtered.sort { $0.rating > $1.rating }
        case "Subscribers":
            filtered.sort { $0.subscriberCount > $1.subscriberCount }
        default:
            break
        }
        
        applyFiltersToNewsletters(filtered)
    }
    
    private func applyFiltersToNewsletters(_ newsletters: [Newsletter]) {
        state = .success(newsletters)
    }
    
    func toggleSubscription(newsletterId: String) {
        homeManager.toggleSubscription(newsletterId: newsletterId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.error = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.loadNewsletters() // Refresh data
                }
            )
            .store(in: &cancellables)
    }
}

class HomeManager {
    func getNewsletters() -> AnyPublisher<[Newsletter], Error> {
        // Mock data for now - replace with actual API call
        let mockNewsletters = [
            Newsletter(
                id: "1",
                title: "Tech Weekly",
                description: "Your weekly dose of technology news, trends, and insights from industry experts.",
                category: "Tech",
                subscriberCount: 12500,
                rating: 4.8,
                frequency: "Weekly",
                isFeatured: true,
                isNew: false,
                logoUrl: "https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=TW"
            ),
            Newsletter(
                id: "2",
                title: "Business Insights",
                description: "Daily business analysis, market trends, and strategic thinking for entrepreneurs.",
                category: "Business",
                subscriberCount: 8900,
                rating: 4.6,
                frequency: "Daily",
                isFeatured: false,
                isNew: true,
                logoUrl: "https://via.placeholder.com/100x100/059669/FFFFFF?text=BI"
            ),
            Newsletter(
                id: "3",
                title: "Design Matters",
                description: "Creative design inspiration, UX/UI trends, and visual storytelling techniques.",
                category: "Design",
                subscriberCount: 6700,
                rating: 4.9,
                frequency: "Bi-weekly",
                isFeatured: false,
                isNew: false,
                logoUrl: "https://via.placeholder.com/100x100/DC2626/FFFFFF?text=DM"
            ),
            Newsletter(
                id: "4",
                title: "AI & Machine Learning",
                description: "Latest developments in artificial intelligence, machine learning, and data science.",
                category: "AI",
                subscriberCount: 15200,
                rating: 4.7,
                frequency: "Weekly",
                isFeatured: true,
                isNew: true,
                logoUrl: "https://via.placeholder.com/100x100/7C3AED/FFFFFF?text=AI"
            ),
            Newsletter(
                id: "5",
                title: "Marketing Pro",
                description: "Digital marketing strategies, social media trends, and growth hacking techniques.",
                category: "Marketing",
                subscriberCount: 9800,
                rating: 4.5,
                frequency: "Weekly",
                isFeatured: false,
                isNew: false,
                logoUrl: "https://via.placeholder.com/100x100/EA580C/FFFFFF?text=MP"
            ),
            Newsletter(
                id: "6",
                title: "Startup Stories",
                description: "Real stories from startup founders, funding news, and entrepreneurial advice.",
                category: "Business",
                subscriberCount: 5400,
                rating: 4.4,
                frequency: "Monthly",
                isFeatured: false,
                isNew: false,
                logoUrl: "https://via.placeholder.com/100x100/0891B2/FFFFFF?text=SS"
            ),
            Newsletter(
                id: "7",
                title: "Web Development Today",
                description: "Modern web development trends, frameworks, and best practices.",
                category: "Tech",
                subscriberCount: 11300,
                rating: 4.8,
                frequency: "Weekly",
                isFeatured: false,
                isNew: true,
                logoUrl: "https://via.placeholder.com/100x100/4338CA/FFFFFF?text=WD"
            ),
            Newsletter(
                id: "8",
                title: "Product Management",
                description: "Product strategy, user research, and leadership insights for PMs.",
                category: "Business",
                subscriberCount: 7200,
                rating: 4.6,
                frequency: "Bi-weekly",
                isFeatured: false,
                isNew: false,
                logoUrl: "https://via.placeholder.com/100x100/BE185D/FFFFFF?text=PM"
            )
        ]
        
        return Just(mockNewsletters)
            .delay(for: .seconds(1), scheduler: RunLoop.main)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    func toggleSubscription(newsletterId: String) -> AnyPublisher<Bool, Error> {
        // Mock subscription toggle - replace with actual API call
        return Just(true)
            .delay(for: .seconds(0.5), scheduler: RunLoop.main)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
}