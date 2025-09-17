import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnalyticsDashboard = ({ 
  showRealTime = true,
  compactMode = false,
  refreshInterval = 30000
}) => {
  const [analyticsData, setAnalyticsData] = useState({
    subscribers: {
      total: 0,
      growth: 0,
      newToday: 0,
      churnRate: 0
    },
    engagement: {
      openRate: 0,
      clickRate: 0,
      shareRate: 0,
      readTime: 0
    },
    content: {
      topArticles: [],
      categories: [],
      performance: []
    },
    traffic: {
      pageViews: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      sources: []
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Mock data generation
  const generateMockData = () => {
    return {
      subscribers: {
        total: Math.floor(Math.random() * 10000) + 5000,
        growth: (Math.random() * 20 - 10).toFixed(1),
        newToday: Math.floor(Math.random() * 100) + 10,
        churnRate: (Math.random() * 5).toFixed(2)
      },
      engagement: {
        openRate: (Math.random() * 40 + 20).toFixed(1),
        clickRate: (Math.random() * 15 + 5).toFixed(1),
        shareRate: (Math.random() * 8 + 2).toFixed(1),
        readTime: Math.floor(Math.random() * 300 + 120)
      },
      content: {
        topArticles: [
          { title: 'AI Revolution in 2024', views: 2543, engagement: 85 },
          { title: 'Quantum Computing Breakthrough', views: 1987, engagement: 78 },
          { title: 'Climate Tech Innovations', views: 1654, engagement: 72 },
          { title: 'Space Exploration Updates', views: 1432, engagement: 69 },
          { title: 'Biotech Advances', views: 1298, engagement: 65 }
        ],
        categories: [
          { name: 'Technology', percentage: 35 },
          { name: 'Science', percentage: 25 },
          { name: 'Innovation', percentage: 20 },
          { name: 'Research', percentage: 15 },
          { name: 'Other', percentage: 5 }
        ],
        performance: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          views: Math.floor(Math.random() * 1000) + 500,
          engagement: Math.floor(Math.random() * 100) + 50
        }))
      },
      traffic: {
        pageViews: Math.floor(Math.random() * 50000) + 20000,
        uniqueVisitors: Math.floor(Math.random() * 15000) + 8000,
        bounceRate: (Math.random() * 30 + 20).toFixed(1),
        sources: [
          { name: 'Direct', percentage: 35, visitors: 3500 },
          { name: 'Search', percentage: 28, visitors: 2800 },
          { name: 'Social', percentage: 22, visitors: 2200 },
          { name: 'Email', percentage: 10, visitors: 1000 },
          { name: 'Referral', percentage: 5, visitors: 500 }
        ]
      }
    };
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(generateMockData());
      setLastUpdated(new Date());
      setIsLoading(false);
    };

    fetchAnalytics();

    // Set up refresh interval if real-time is enabled
    let interval;
    if (showRealTime && refreshInterval > 0) {
      interval = setInterval(fetchAnalytics, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showRealTime, refreshInterval, dateRange]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const MetricCard = ({ title, value, change, icon, color = '#667eea' }) => (
    <motion.div
      className="metric-card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="metric-header">
        <span className="metric-icon" style={{ color }}>{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="metric-value">{value}</div>
      {change !== undefined && (
        <div className={`metric-change ${parseFloat(change) >= 0 ? 'positive' : 'negative'}`}>
          {parseFloat(change) >= 0 ? '↗' : '↘'} {Math.abs(change)}%
        </div>
      )}
    </motion.div>
  );

  const ChartContainer = ({ title, children }) => (
    <motion.div
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>{title}</h3>
      {children}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          📊
        </motion.div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className={`analytics-dashboard ${compactMode ? 'compact' : ''}`}>
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Analytics Dashboard</h1>
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {showRealTime && <span className="live-indicator">🔴 Live</span>}
            </div>
          )}
        </div>
        
        <div className="dashboard-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="dashboard-tabs">
        {['overview', 'subscribers', 'engagement', 'content', 'traffic'].map((tab) => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              className="overview-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="metrics-grid">
                <MetricCard
                  title="Total Subscribers"
                  value={formatNumber(analyticsData.subscribers.total)}
                  change={analyticsData.subscribers.growth}
                  icon="👥"
                  color="#667eea"
                />
                <MetricCard
                  title="Open Rate"
                  value={`${analyticsData.engagement.openRate}%`}
                  icon="📧"
                  color="#48bb78"
                />
                <MetricCard
                  title="Page Views"
                  value={formatNumber(analyticsData.traffic.pageViews)}
                  icon="👁️"
                  color="#ed8936"
                />
                <MetricCard
                  title="Avg. Read Time"
                  value={formatTime(analyticsData.engagement.readTime)}
                  icon="⏱️"
                  color="#9f7aea"
                />
              </div>

              <div className="charts-grid">
                <ChartContainer title="Content Performance">
                  <div className="performance-chart">
                    {analyticsData.content.performance.map((item, index) => (
                      <div key={index} className="performance-bar">
                        <div className="bar-label">{item.date}</div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{ width: `${(item.views / 1000) * 100}%` }}
                          ></div>
                        </div>
                        <div className="bar-value">{item.views}</div>
                      </div>
                    ))}
                  </div>
                </ChartContainer>

                <ChartContainer title="Traffic Sources">
                  <div className="traffic-sources">
                    {analyticsData.traffic.sources.map((source, index) => (
                      <div key={index} className="source-item">
                        <div className="source-info">
                          <span className="source-name">{source.name}</span>
                          <span className="source-percentage">{source.percentage}%</span>
                        </div>
                        <div className="source-bar">
                          <div 
                            className="source-fill"
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="source-visitors">{formatNumber(source.visitors)}</span>
                      </div>
                    ))}
                  </div>
                </ChartContainer>
              </div>
            </motion.div>
          )}

          {activeTab === 'subscribers' && (
            <motion.div
              key="subscribers"
              className="subscribers-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="metrics-grid">
                <MetricCard
                  title="Total Subscribers"
                  value={formatNumber(analyticsData.subscribers.total)}
                  change={analyticsData.subscribers.growth}
                  icon="👥"
                />
                <MetricCard
                  title="New Today"
                  value={analyticsData.subscribers.newToday}
                  icon="✨"
                  color="#48bb78"
                />
                <MetricCard
                  title="Churn Rate"
                  value={`${analyticsData.subscribers.churnRate}%`}
                  icon="📉"
                  color="#f56565"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'engagement' && (
            <motion.div
              key="engagement"
              className="engagement-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="metrics-grid">
                <MetricCard
                  title="Open Rate"
                  value={`${analyticsData.engagement.openRate}%`}
                  icon="📧"
                  color="#48bb78"
                />
                <MetricCard
                  title="Click Rate"
                  value={`${analyticsData.engagement.clickRate}%`}
                  icon="👆"
                  color="#667eea"
                />
                <MetricCard
                  title="Share Rate"
                  value={`${analyticsData.engagement.shareRate}%`}
                  icon="📤"
                  color="#ed8936"
                />
                <MetricCard
                  title="Avg. Read Time"
                  value={formatTime(analyticsData.engagement.readTime)}
                  icon="⏱️"
                  color="#9f7aea"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              className="content-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="content-grid">
                <ChartContainer title="Top Performing Articles">
                  <div className="top-articles">
                    {analyticsData.content.topArticles.map((article, index) => (
                      <div key={index} className="article-item">
                        <div className="article-rank">#{index + 1}</div>
                        <div className="article-info">
                          <h4>{article.title}</h4>
                          <div className="article-stats">
                            <span>👁️ {formatNumber(article.views)}</span>
                            <span>💝 {article.engagement}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartContainer>

                <ChartContainer title="Content Categories">
                  <div className="categories-chart">
                    {analyticsData.content.categories.map((category, index) => (
                      <div key={index} className="category-item">
                        <div className="category-info">
                          <span className="category-name">{category.name}</span>
                          <span className="category-percentage">{category.percentage}%</span>
                        </div>
                        <div className="category-bar">
                          <div 
                            className="category-fill"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartContainer>
              </div>
            </motion.div>
          )}

          {activeTab === 'traffic' && (
            <motion.div
              key="traffic"
              className="traffic-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="metrics-grid">
                <MetricCard
                  title="Page Views"
                  value={formatNumber(analyticsData.traffic.pageViews)}
                  icon="👁️"
                  color="#ed8936"
                />
                <MetricCard
                  title="Unique Visitors"
                  value={formatNumber(analyticsData.traffic.uniqueVisitors)}
                  icon="👤"
                  color="#667eea"
                />
                <MetricCard
                  title="Bounce Rate"
                  value={`${analyticsData.traffic.bounceRate}%`}
                  icon="⚡"
                  color="#f56565"
                />
              </div>

              <ChartContainer title="Traffic Sources">
                <div className="traffic-sources-detailed">
                  {analyticsData.traffic.sources.map((source, index) => (
                    <div key={index} className="source-detailed">
                      <div className="source-header">
                        <h4>{source.name}</h4>
                        <span className="source-visitors">{formatNumber(source.visitors)} visitors</span>
                      </div>
                      <div className="source-bar">
                        <div 
                          className="source-fill"
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                      <div className="source-percentage">{source.percentage}%</div>
                    </div>
                  ))}
                </div>
              </ChartContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          padding: 24px;
          background: #f7fafc;
          min-height: 100vh;
        }

        .analytics-dashboard.compact {
          padding: 16px;
        }

        .analytics-loading {
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

        .dashboard-header {
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

        .last-updated {
          font-size: 14px;
          color: #718096;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .live-indicator {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .date-range-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          color: #4a5568;
          cursor: pointer;
        }

        .dashboard-tabs {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        .tab-btn {
          flex: 1;
          padding: 12px 16px;
          background: none;
          border: none;
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
          background: #f7fafc;
        }

        .tab-btn.active {
          color: #667eea;
          background: #edf2f7;
        }

        .dashboard-content {
          min-height: 400px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .metric-icon {
          font-size: 20px;
        }

        .metric-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #718096;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .metric-change {
          font-size: 14px;
          font-weight: 500;
        }

        .metric-change.positive {
          color: #48bb78;
        }

        .metric-change.negative {
          color: #f56565;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .chart-container {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .chart-container h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .performance-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .performance-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bar-label {
          width: 80px;
          font-size: 12px;
          color: #718096;
        }

        .bar-container {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .bar-value {
          width: 60px;
          text-align: right;
          font-size: 12px;
          font-weight: 500;
          color: #4a5568;
        }

        .traffic-sources,
        .traffic-sources-detailed {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .source-item,
        .source-detailed {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .source-detailed {
          flex-direction: column;
          align-items: stretch;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .source-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .source-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .source-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 120px;
        }

        .source-name {
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
        }

        .source-percentage {
          font-size: 12px;
          color: #718096;
        }

        .source-bar {
          flex: 1;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .source-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .source-visitors {
          font-size: 12px;
          font-weight: 500;
          color: #4a5568;
          min-width: 60px;
          text-align: right;
        }

        .top-articles {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .article-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .article-rank {
          width: 32px;
          height: 32px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .article-info {
          flex: 1;
        }

        .article-info h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .article-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #718096;
        }

        .categories-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 140px;
        }

        .category-name {
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
        }

        .category-percentage {
          font-size: 12px;
          color: #718096;
        }

        .category-bar {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          background: linear-gradient(90deg, #48bb78, #38a169);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        @media (max-width: 768px) {
          .analytics-dashboard {
            padding: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-tabs {
            overflow-x: auto;
          }

          .tab-btn {
            min-width: 100px;
          }

          .source-item {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .source-info {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;