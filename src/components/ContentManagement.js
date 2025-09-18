import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentScheduler from '../services/ContentScheduler';

const ContentManagement = ({ 
  userRole = 'editor',
  showDrafts = true,
  enableCollaboration = true
}) => {
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState('published');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);

  // Content API configuration
  const CONTENT_API_CONFIG = {
    baseUrl: process.env.REACT_APP_CONTENT_API_URL || '/api/content',
    timeout: 10000,
    retryAttempts: 3
  };

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      const response = await fetch(`${CONTENT_API_CONFIG.baseUrl}/articles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-Privacy-Mode': 'strict',
          'X-User-Role': userRole
        },
        signal: AbortSignal.timeout(CONTENT_API_CONFIG.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      return getFallbackArticles();
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'demo-token';
  };

  // Fallback article data
  const getFallbackArticles = () => [
    {
      id: 'fallback_1',
      title: 'Welcome to Piper Newsletter',
      content: 'This is a fallback article displayed when the API is unavailable...',
      excerpt: 'Welcome message for new users.',
      author: 'Piper Team',
      status: 'published',
      category: 'General',
      publishDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      views: 100,
      engagement: 75,
      tags: ['Welcome', 'General'],
      featured: true,
      wordCount: 500
    }
  ];

  const categories = ['all', 'Technology', 'Science', 'Environment', 'Healthcare'];
  const statuses = ['published', 'draft', 'scheduled', 'review', 'archived'];

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      try {
        const articlesData = await fetchArticles();
        setArticles(articlesData);
      } catch (error) {
        console.error('Failed to load articles:', error);
        setArticles(getFallbackArticles());
      }
      setIsLoading(false);
    };

    loadArticles();
  }, [userRole]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    const matchesTab = activeTab === 'all' || article.status === activeTab;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.lastModified) - new Date(a.lastModified);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'views':
        return b.views - a.views;
      case 'engagement':
        return b.engagement - a.engagement;
      default:
        return 0;
    }
  });

  const handleStatusChange = (articleId, newStatus) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, status: newStatus, lastModified: new Date().toISOString().split('T')[0] }
        : article
    ));
  };

  const handleDelete = (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setArticles(prev => prev.filter(article => article.id !== articleId));
    }
  };

  const handleDuplicate = (article) => {
    const newArticle = {
      ...article,
      id: Math.max(...articles.map(a => a.id)) + 1,
      title: `${article.title} (Copy)`,
      status: 'draft',
      publishDate: null,
      lastModified: new Date().toISOString().split('T')[0],
      views: 0,
      engagement: 0
    };
    setArticles(prev => [newArticle, ...prev]);
  };

  const getStatusColor = (status) => {
    const colors = {
      published: '#48bb78',
      draft: '#ed8936',
      scheduled: '#667eea',
      review: '#9f7aea',
      archived: '#718096'
    };
    return colors[status] || '#718096';
  };

  const getStatusIcon = (status) => {
    const icons = {
      published: '✅',
      draft: '📝',
      scheduled: '⏰',
      review: '👁️',
      archived: '📦'
    };
    return icons[status] || '📄';
  };

  const ArticleCard = ({ article }) => (
    <motion.div
      className="article-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="article-header">
        <div className="article-meta">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(article.status) }}
          >
            {getStatusIcon(article.status)} {article.status}
          </span>
          {article.featured && <span className="featured-badge">⭐ Featured</span>}
        </div>
        <div className="article-actions">
          <motion.button
            className="action-btn"
            onClick={() => setSelectedArticle(article)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View Details"
          >
            👁️
          </motion.button>
          <motion.button
            className="action-btn"
            onClick={() => {
              setSelectedArticle(article);
              setShowEditor(true);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Edit"
          >
            ✏️
          </motion.button>
          <motion.button
            className="action-btn"
            onClick={() => handleDuplicate(article)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Duplicate"
          >
            📋
          </motion.button>
          <motion.button
            className="action-btn delete"
            onClick={() => handleDelete(article.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete"
          >
            🗑️
          </motion.button>
        </div>
      </div>

      <div className="article-content">
        <h3>{article.title}</h3>
        <p className="article-excerpt">{article.excerpt}</p>
        
        <div className="article-details">
          <div className="detail-item">
            <span className="detail-label">Author:</span>
            <span className="detail-value">{article.author}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{article.category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Words:</span>
            <span className="detail-value">{article.wordCount.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Modified:</span>
            <span className="detail-value">{new Date(article.lastModified).toLocaleDateString()}</span>
          </div>
        </div>

        {article.status === 'published' && (
          <div className="article-stats">
            <div className="stat-item">
              <span className="stat-icon">👁️</span>
              <span className="stat-value">{article.views.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💝</span>
              <span className="stat-value">{article.engagement}%</span>
            </div>
          </div>
        )}

        <div className="article-tags">
          {article.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="article-footer">
        <select
          value={article.status}
          onChange={(e) => handleStatusChange(article.id, e.target.value)}
          className="status-select"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        
        {article.publishDate && (
          <span className="publish-date">
            📅 {new Date(article.publishDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="content-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          📝
        </motion.div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="content-management">
      <div className="content-header">
        <div className="header-content">
          <h1>📝 Content Management</h1>
          <p>Manage your newsletter articles and content</p>
        </div>
        
        <motion.button
          className="create-btn"
          onClick={() => {
            setSelectedArticle(null);
            setShowEditor(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ➕ Create Article
        </motion.button>
      </div>

      <div className="content-controls">
        <div className="search-section">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search articles, authors, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="views">Sort by Views</option>
            <option value="engagement">Sort by Engagement</option>
          </select>
        </div>
      </div>

      <div className="content-tabs">
        {['all', ...statuses].map((tab) => {
          const count = tab === 'all' 
            ? articles.length 
            : articles.filter(a => a.status === tab).length;
          
          return (
            <motion.button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab === 'all' ? '📄 All' : `${getStatusIcon(tab)} ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
              <span className="tab-count">({count})</span>
            </motion.button>
          );
        })}
      </div>

      <div className="content-grid">
        <AnimatePresence>
          {sortedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </AnimatePresence>
        
        {sortedArticles.length === 0 && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-icon">📝</div>
            <h3>No articles found</h3>
            <p>Try adjusting your search or filters, or create a new article.</p>
            <motion.button
              className="create-btn"
              onClick={() => {
                setSelectedArticle(null);
                setShowEditor(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ Create Your First Article
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && !showEditor && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              className="article-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedArticle.title}</h2>
                <motion.button
                  className="close-btn"
                  onClick={() => setSelectedArticle(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="modal-content">
                <div className="article-full-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedArticle.status) }}
                      >
                        {getStatusIcon(selectedArticle.status)} {selectedArticle.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Author:</span>
                      <span className="detail-value">{selectedArticle.author}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{selectedArticle.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Word Count:</span>
                      <span className="detail-value">{selectedArticle.wordCount.toLocaleString()}</span>
                    </div>
                    {selectedArticle.publishDate && (
                      <div className="detail-item">
                        <span className="detail-label">Publish Date:</span>
                        <span className="detail-value">{new Date(selectedArticle.publishDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Last Modified:</span>
                      <span className="detail-value">{new Date(selectedArticle.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {selectedArticle.status === 'published' && (
                    <div className="performance-stats">
                      <div className="stat-card">
                        <span className="stat-icon">👁️</span>
                        <div className="stat-info">
                          <span className="stat-value">{selectedArticle.views.toLocaleString()}</span>
                          <span className="stat-label">Views</span>
                        </div>
                      </div>
                      <div className="stat-card">
                        <span className="stat-icon">💝</span>
                        <div className="stat-info">
                          <span className="stat-value">{selectedArticle.engagement}%</span>
                          <span className="stat-label">Engagement</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="article-tags-full">
                    <span className="tags-label">Tags:</span>
                    <div className="tags-list">
                      {selectedArticle.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="article-content-preview">
                  <h3>Content Preview</h3>
                  <div className="content-text">
                    {selectedArticle.content}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <motion.button
                  className="edit-btn"
                  onClick={() => setShowEditor(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✏️ Edit Article
                </motion.button>
                <motion.button
                  className="duplicate-btn"
                  onClick={() => {
                    handleDuplicate(selectedArticle);
                    setSelectedArticle(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📋 Duplicate
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              className="editor-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedArticle ? 'Edit Article' : 'Create New Article'}</h2>
                <motion.button
                  className="close-btn"
                  onClick={() => setShowEditor(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="editor-content">
                <div className="editor-form">
                  <input
                    type="text"
                    placeholder="Article Title"
                    defaultValue={selectedArticle?.title || ''}
                    className="title-input"
                  />
                  
                  <div className="form-row">
                    <select className="category-select">
                      {categories.filter(c => c !== 'all').map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      defaultValue={selectedArticle?.tags.join(', ') || ''}
                      className="tags-input"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Article excerpt..."
                    defaultValue={selectedArticle?.excerpt || ''}
                    className="excerpt-textarea"
                    rows="3"
                  />
                  
                  <textarea
                    placeholder="Write your article content here..."
                    defaultValue={selectedArticle?.content || ''}
                    className="content-textarea"
                    rows="15"
                  />
                </div>
              </div>
              
              <div className="editor-actions">
                <motion.button
                  className="save-draft-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💾 Save Draft
                </motion.button>
                <motion.button
                  className="publish-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚀 Publish
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .content-management {
          padding: 24px;
          background: #f7fafc;
          min-height: 100vh;
        }

        .content-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #718096;
        }

        .loading-spinner {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
        }

        .header-content p {
          margin: 0;
          color: #718096;
          font-size: 16px;
        }

        .create-btn {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-btn:hover {
          background: #5a67d8;
        }

        .content-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-section {
          flex: 1;
        }

        .search-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #718096;
          z-index: 1;
        }

        .search-input input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #f7fafc;
        }

        .search-input input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
        }

        .filter-section {
          display: flex;
          gap: 12px;
        }

        .filter-select,
        .sort-select {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
        }

        .content-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding: 4px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #718096;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: #4a5568;
          border-color: #cbd5e0;
        }

        .tab-btn.active {
          color: #667eea;
          border-color: #667eea;
          background: #edf2f7;
        }

        .tab-count {
          font-size: 12px;
          color: #a0aec0;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .article-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .article-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f7fafc;
        }

        .article-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }

        .featured-badge {
          padding: 4px 8px;
          background: #ffd700;
          color: #744210;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .article-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: #f7fafc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #edf2f7;
        }

        .action-btn.delete:hover {
          background: #fed7d7;
          color: #e53e3e;
        }

        .article-content {
          padding: 20px;
        }

        .article-content h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          line-height: 1.4;
        }

        .article-excerpt {
          margin: 0 0 16px 0;
          color: #718096;
          font-size: 14px;
          line-height: 1.5;
        }

        .article-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .detail-label {
          color: #718096;
          font-weight: 500;
        }

        .detail-value {
          color: #4a5568;
          font-weight: 600;
        }

        .article-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #4a5568;
        }

        .stat-icon {
          font-size: 14px;
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .tag {
          padding: 2px 8px;
          background: #edf2f7;
          color: #4a5568;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
          background: #f7fafc;
        }

        .status-select {
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          font-size: 12px;
          cursor: pointer;
        }

        .publish-date {
          font-size: 12px;
          color: #718096;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          border: 2px dashed #e2e8f0;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #4a5568;
        }

        .empty-state p {
          margin: 0 0 24px 0;
          color: #718096;
          text-align: center;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .article-modal,
        .editor-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #718096;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .modal-content,
        .editor-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .article-full-details {
          margin-bottom: 24px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .performance-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          flex: 1;
        }

        .stat-card .stat-icon {
          font-size: 24px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
        }

        .stat-label {
          font-size: 12px;
          color: #718096;
        }

        .article-tags-full {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tags-label {
          font-weight: 500;
          color: #4a5568;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .article-content-preview {
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
        }

        .article-content-preview h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .content-text {
          color: #4a5568;
          line-height: 1.6;
          font-size: 14px;
        }

        .modal-actions,
        .editor-actions {
          display: flex;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e2e8f0;
          background: #f7fafc;
        }

        .edit-btn,
        .duplicate-btn,
        .save-draft-btn,
        .publish-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: #667eea;
          color: white;
        }

        .edit-btn:hover {
          background: #5a67d8;
        }

        .duplicate-btn {
          background: #e2e8f0;
          color: #4a5568;
        }

        .duplicate-btn:hover {
          background: #cbd5e0;
        }

        .save-draft-btn {
          background: #ed8936;
          color: white;
        }

        .save-draft-btn:hover {
          background: #dd6b20;
        }

        .publish-btn {
          background: #48bb78;
          color: white;
        }

        .publish-btn:hover {
          background: #38a169;
        }

        .editor-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .title-input {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .category-select,
        .tags-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
        }

        .excerpt-textarea,
        .content-textarea {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .content-textarea {
          min-height: 300px;
        }

        @media (max-width: 768px) {
          .content-management {
            padding: 16px;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .content-controls {
            flex-direction: column;
          }

          .filter-section {
            flex-direction: column;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .content-tabs {
            overflow-x: auto;
          }

          .article-details {
            grid-template-columns: 1fr;
          }

          .article-stats {
            flex-direction: column;
            gap: 8px;
          }

          .performance-stats {
            flex-direction: column;
          }

          .form-row {
            flex-direction: column;
          }

          .modal-actions,
          .editor-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ContentManagement;