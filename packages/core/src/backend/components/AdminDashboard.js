import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    openRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    server: 'healthy',
    database: 'healthy',
    email: 'healthy',
    security: 'healthy'
  });

  useEffect(() => {
    // Mock data loading
    setStats({
      totalUsers: 12547,
      activeSubscriptions: 8932,
      totalRevenue: 45678.90,
      openRate: 68.5
    });

    setRecentActivity([
      { id: 1, type: 'subscription', user: 'john@example.com', time: '2 minutes ago' },
      { id: 2, type: 'unsubscribe', user: 'jane@example.com', time: '15 minutes ago' },
      { id: 3, type: 'newsletter_sent', count: 8932, time: '1 hour ago' },
      { id: 4, type: 'security_scan', status: 'completed', time: '2 hours ago' },
      { id: 5, type: 'backup', status: 'completed', time: '6 hours ago' }
    ]);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const StatCard = ({ title, value, icon, trend }) => (
    <motion.div
      className="stat-card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => (
    <motion.div
      className="activity-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`activity-type ${activity.type}`}>
        {activity.type === 'subscription' && '✅'}
        {activity.type === 'unsubscribe' && '❌'}
        {activity.type === 'newsletter_sent' && '📧'}
        {activity.type === 'security_scan' && '🔒'}
        {activity.type === 'backup' && '💾'}
      </div>
      <div className="activity-content">
        <div className="activity-description">
          {activity.type === 'subscription' && `New subscription: ${activity.user}`}
          {activity.type === 'unsubscribe' && `Unsubscribed: ${activity.user}`}
          {activity.type === 'newsletter_sent' && `Newsletter sent to ${activity.count} subscribers`}
          {activity.type === 'security_scan' && `Security scan ${activity.status}`}
          {activity.type === 'backup' && `System backup ${activity.status}`}
        </div>
        <div className="activity-time">{activity.time}</div>
      </div>
    </motion.div>
  );

  const SystemHealthIndicator = ({ service, status }) => (
    <div className={`health-indicator ${status}`}>
      <div className="health-dot"></div>
      <span>{service}</span>
      <span className="health-status">{status}</span>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Admin Dashboard</h1>
        <div className="dashboard-actions">
          <button className="btn-primary">Export Data</button>
          <button className="btn-secondary">Settings</button>
        </div>
      </motion.div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="dashboard-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="stats-grid">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon="👥"
                  trend={12.5}
                />
                <StatCard
                  title="Active Subscriptions"
                  value={stats.activeSubscriptions.toLocaleString()}
                  icon="📧"
                  trend={8.3}
                />
                <StatCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  icon="💰"
                  trend={15.7}
                />
                <StatCard
                  title="Open Rate"
                  value={`${stats.openRate}%`}
                  icon="📊"
                  trend={-2.1}
                />
              </div>

              <div className="dashboard-grid">
                <div className="recent-activity">
                  <h2>Recent Activity</h2>
                  <div className="activity-list">
                    {recentActivity.map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>

                <div className="system-health">
                  <h2>System Health</h2>
                  <div className="health-grid">
                    {Object.entries(systemHealth).map(([service, status]) => (
                      <SystemHealthIndicator
                        key={service}
                        service={service.charAt(0).toUpperCase() + service.slice(1)}
                        status={status}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-content">
              <h2>User Management</h2>
              <p>User management interface coming soon...</p>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="content-content">
              <h2>Content Management</h2>
              <p>Content management interface coming soon...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-content">
              <h2>Analytics Dashboard</h2>
              <p>Advanced analytics coming soon...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-content">
              <h2>System Settings</h2>
              <p>System configuration interface coming soon...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .admin-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
        }

        .dashboard-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #4CAF50;
          color: white;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .btn-primary:hover, .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .dashboard-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab.active {
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .dashboard-content {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .stat-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }

        .stat-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-trend {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .stat-trend.positive {
          color: #4CAF50;
        }

        .stat-trend.negative {
          color: #f44336;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .recent-activity, .system-health {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .recent-activity h2, .system-health h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .activity-type {
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
        }

        .activity-content {
          flex: 1;
        }

        .activity-description {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .activity-time {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .health-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .health-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .health-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4CAF50;
        }

        .health-indicator.warning .health-dot {
          background: #FF9800;
        }

        .health-indicator.error .health-dot {
          background: #f44336;
        }

        .health-status {
          margin-left: auto;
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;