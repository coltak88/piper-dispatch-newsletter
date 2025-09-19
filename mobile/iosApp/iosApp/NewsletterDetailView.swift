import SwiftUI

struct NewsletterDetailView: View {
    let newsletter: Newsletter
    @StateObject private var viewModel: NewsletterDetailViewModel
    @Environment(\.dismiss) private var dismiss
    
    init(newsletter: Newsletter) {
        self.newsletter = newsletter
        self._viewModel = StateObject(wrappedValue: NewsletterDetailViewModel(newsletter: newsletter))
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(newsletter.title)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        if let author = newsletter.author {
                            HStack {
                                Image(systemName: "person.circle")
                                Text("By \(author.name)")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        if let publishedAt = newsletter.publishedAt {
                            Text("Published: \(publishedAt, style: .date)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if !newsletter.tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack {
                                ForEach(newsletter.tags, id: \.self) { tag in
                                    Text(tag)
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(Color.accentColor.opacity(0.1))
                                        .cornerRadius(8)
                                }
                            }
                        }
                    }
                    
                    if let content = newsletter.content {
                        Text(content)
                            .font(.body)
                            .lineSpacing(6)
                    }
                    
                    if let analytics = newsletter.analytics {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Analytics")
                                .font(.headline)
                            
                            HStack(spacing: 20) {
                                VStack(spacing: 4) {
                                    Text("\(analytics.views)")
                                        .font(.title2)
                                        .fontWeight(.semibold)
                                    Text("Views")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                VStack(spacing: 4) {
                                    Text("\(analytics.clicks)")
                                        .font(.title2)
                                        .fontWeight(.semibold)
                                    Text("Clicks")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                VStack(spacing: 4) {
                                    Text("\(analytics.opens)")
                                        .font(.title2)
                                        .fontWeight(.semibold)
                                    Text("Opens")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                VStack(spacing: 4) {
                                    Text("\(analytics.unsubscribes)")
                                        .font(.title2)
                                        .fontWeight(.semibold)
                                    Text("Unsubscribes")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    
                    if viewModel.isSubscribed {
                        Button("Unsubscribe") {
                            viewModel.unsubscribe()
                        }
                        .buttonStyle(.bordered)
                        .foregroundColor(.red)
                    } else {
                        Button("Subscribe") {
                            viewModel.subscribe()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                .padding()
            }
            .navigationTitle("Newsletter")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
    }
}

class NewsletterDetailViewModel: ObservableObject {
    @Published var isSubscribed = false
    @Published var isLoading = false
    @Published var error: String?
    
    private let newsletter: Newsletter
    private let newsletterManager = NewsletterManager()
    
    init(newsletter: Newsletter) {
        self.newsletter = newsletter
        self.isSubscribed = newsletter.isSubscribed ?? false
    }
    
    func subscribe() {
        isLoading = true
        
        Task {
            do {
                let response = try await newsletterManager.subscribeToNewsletter(id: Int32(newsletter.id))
                await MainActor.run {
                    self.isLoading = false
                    if response.success {
                        self.isSubscribed = true
                    } else {
                        self.error = response.message ?? "Failed to subscribe"
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
    
    func unsubscribe() {
        isLoading = true
        
        Task {
            do {
                let response = try await newsletterManager.unsubscribeFromNewsletter(id: Int32(newsletter.id))
                await MainActor.run {
                    self.isLoading = false
                    if response.success {
                        self.isSubscribed = false
                    } else {
                        self.error = response.message ?? "Failed to unsubscribe"
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
}