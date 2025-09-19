import SwiftUI
import Combine

struct HomeScreen: View {
    @ObservedObject private var viewModel: HomeViewModel
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    @State private var showingFilters = false
    
    private let categories = ["All", "Tech", "Business", "Design", "Marketing", "AI"]
    
    init(viewModel: HomeViewModel = HomeViewModel()) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header with search and filters
            VStack(spacing: AppSpacing.medium) {
                // Search Bar
                HStack(spacing: AppSpacing.medium) {
                    AppTextField(
                        text: $searchText,
                        placeholder: "Search newsletters...",
                        leadingIcon: "magnifyingglass"
                    )
                    .onChange(of: searchText) { newValue in
                        viewModel.searchNewsletters(query: newValue)
                    }
                    
                    Button(action: { showingFilters.toggle() }) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                            .font(.system(size: 24))
                            .foregroundColor(AppColors.primary)
                    }
                }
                
                // Category Pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppSpacing.small) {
                        ForEach(categories, id: \.self) { category in
                            CategoryPill(
                                title: category,
                                isSelected: category == selectedCategory,
                                action: {
                                    selectedCategory = category
                                    viewModel.filterByCategory(category: category)
                                }
                            )
                        }
                    }
                    .padding(.horizontal, AppSpacing.medium)
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
                    onRetry: { viewModel.loadNewsletters() }
                )
                
            case .success(let newsletters):
                NewsletterList(newsletters: newsletters)
            }
            
            Spacer()
        }
        .background(AppColors.background)
        .navigationBarHidden(true)
        .sheet(isPresented: $showingFilters) {
            FilterSheet(
                selectedCategory: $selectedCategory,
                onApply: { filters in
                    viewModel.applyFilters(filters: filters)
                    showingFilters = false
                }
            )
        }
        .onAppear {
            viewModel.loadNewsletters()
        }
    }
}

struct NewsletterList: View {
    let newsletters: [Newsletter]
    let onNewsletterClick: (Newsletter) -> Void
    let onSubscribeToggle: (Newsletter) -> Void
    
    var body: some View {
        List(newsletters) { newsletter in
            NewsletterCard(
                newsletter: newsletter,
                onClick: { onNewsletterClick(newsletter) },
                onSubscribeToggle: { onSubscribeToggle(newsletter) }
            )
            .listRowInsets(EdgeInsets())
            .listRowBackground(Color.clear)
        }
        .listStyle(.plain)
    }
}

struct NewsletterCard: View {
    let newsletter: Newsletter
    let onClick: () -> Void
    let onSubscribeToggle: () -> Void
    
    var body: some View {
        Button(action: onClick) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(newsletter.title)
                            .font(.headline)
                            .lineLimit(2)
                            .foregroundColor(.primary)
                        
                        Text(newsletter.description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    AsyncImage(url: URL(string: newsletter.imageUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 60, height: 60)
                            .cornerRadius(8)
                    } placeholder: {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.gray.opacity(0.2))
                            .frame(width: 60, height: 60)
                            .overlay(
                                Image(systemName: "newspaper")
                                    .foregroundColor(.gray)
                            )
                    }
                }
                
                HStack {
                    HStack(spacing: 16) {
                        Label("\(newsletter.subscriberCount)", systemImage: "person.2")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Label("\(newsletter.openRate)%", systemImage: "eye")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        if newsletter.isSubscribed {
                            Label("Subscribed", systemImage: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: onSubscribeToggle) {
                        Text(newsletter.isSubscribed ? "Unsubscribe" : "Subscribe")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
            }
            .padding(16)
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct LoadingView: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct ErrorView: View {
    let message: String
    let onRetry: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.red)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button(action: onRetry) {
                Text("Retry")
                    .fontWeight(.medium)
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
    }
}

struct EmptyStateView: View {
    let message: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundColor(.gray)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

class HomeViewModel: ObservableObject {
    @Published var uiState: HomeUiState = .loading
    
    private let newsletterManager = NewsletterManager(api: PiperNewsletterAPI.shared, authManager: AuthManager.shared)
    
    func loadNewsletters() {
        uiState = .loading
        
        Task {
            do {
                let newsletters = try await newsletterManager.getNewsletters(
                    page: 1,
                    limit: 20,
                    sortBy: .createdAt,
                    sortOrder: .desc
                )
                await MainActor.run {
                    self.uiState = .success(newsletters)
                }
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
    
    func toggleSubscription(newsletter: Newsletter) {
        Task {
            do {
                if newsletter.isSubscribed {
                    try await newsletterManager.unsubscribeFromNewsletter(newsletterId: newsletter.id)
                } else {
                    try await newsletterManager.subscribeToNewsletter(newsletterId: newsletter.id)
                }
                await loadNewsletters()
            } catch {
                await MainActor.run {
                    self.uiState = .error(error.localizedDescription)
                }
            }
        }
    }
}

enum HomeUiState {
    case loading
    case success([Newsletter])
    case error(String)
}