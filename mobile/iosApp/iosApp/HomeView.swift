import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var selectedNewsletter: Newsletter?
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = viewModel.error {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)
                        
                        Text("Error Loading Newsletters")
                            .font(.headline)
                        
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        
                        Button("Retry") {
                            viewModel.loadNewsletters()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.newsletters, id: \.id) { newsletter in
                                NewsletterCard(newsletter: newsletter)
                                    .onTapGesture {
                                        selectedNewsletter = newsletter
                                    }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Newsletters")
            .onAppear {
                viewModel.loadNewsletters()
            }
            .sheet(item: $selectedNewsletter) { newsletter in
                NewsletterDetailView(newsletter: newsletter)
            }
        }
    }
}

struct NewsletterCard: View {
    let newsletter: Newsletter
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(newsletter.title)
                    .font(.headline)
                    .lineLimit(2)
                
                Spacer()
                
                if newsletter.status == "published" {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }
            
            Text(newsletter.excerpt)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(3)
            
            HStack {
                if let author = newsletter.author {
                    Label(author.name, systemImage: "person.circle")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if let analytics = newsletter.analytics {
                    HStack(spacing: 8) {
                        Label("\(analytics.views)", systemImage: "eye")
                        Label("\(analytics.clicks)", systemImage: "cursorarrow.click")
                    }
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
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.accentColor.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

class HomeViewModel: ObservableObject {
    @Published var newsletters: [Newsletter] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let newsletterManager = NewsletterManager()
    
    func loadNewsletters() {
        isLoading = true
        error = nil
        
        Task {
            do {
                let response = try await newsletterManager.getNewsletters()
                await MainActor.run {
                    self.isLoading = false
                    if response.success, let data = response.data {
                        self.newsletters = data
                    } else {
                        self.error = response.message ?? "Failed to load newsletters"
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