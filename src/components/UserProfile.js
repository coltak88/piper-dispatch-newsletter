import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfile = ({ 
  userId = 'user123',
  showPreferences = true,
  showActivity = true,
  showSecurity = true
}) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [preferences, setPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock user data
  const mockUser = {
    id: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    avatar: null,
    bio: 'Tech enthusiast and newsletter subscriber. Love staying updated with the latest in AI and quantum computing.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    joinDate: '2023-06-15',
    lastActive: '2024-01-15T10:30:00Z',
    subscriptionStatus: 'premium',
    subscriptionDate: '2023-07-01',
    totalNewsletters: 156,
    readCount: 142,
    favoriteCount: 23,
    shareCount: 18,
    engagementScore: 87,
    streak: 45,
    badges: ['Early Adopter', 'Power Reader', 'Engagement Champion'],
    interests: ['Technology', 'AI', 'Quantum Computing', 'Space', 'Climate Tech'],
    timezone: 'America/Los_Angeles',
    language: 'en',
    emailVerified: true,
    twoFactorEnabled: false
  };

  const mockPreferences = {
    emailFrequency: 'daily',
    emailTime: '09:00',
    categories: ['Technology', 'Science', 'AI'],
    digestFormat: 'detailed',
    notifications: {
      newNewsletter: true,
      weeklyDigest: true,
      recommendations: false,
      socialActivity: true,
      securityAlerts: true
    },
    privacy: {
      profileVisibility: 'public',
      showActivity: true,
      showStats: true,
      allowRecommendations: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false
    },
    theme: 'light',
    autoplay: false,
    saveReadingProgress: true
  };

  const mockActivity = [
    {
      id: 1,
      type: 'read',
      title: 'Read "The Future of AI in Newsletter Publishing"',
      timestamp: '2024-01-15T09:30:00Z',
      icon: '📖',
      color: '#48bb78'
    },
    {
      id: 2,
      type: 'favorite',
      title: 'Favorited "Quantum Computing Breakthrough"',
      timestamp: '2024-01-14T16:45:00Z',
      icon: '❤️',
      color: '#e53e3e'
    },
    {
      id: 3,
      type: 'share',
      title: 'Shared "Climate Tech Innovations"',
      timestamp: '2024-01-14T14:20:00Z',
      icon: '🔗',
      color: '#667eea'
    },
    {
      id: 4,
      type: 'subscribe',
      title: 'Upgraded to Premium subscription',
      timestamp: '2024-01-13T11:15:00Z',
      icon: '⭐',
      color: '#ed8936'
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Earned "Power Reader" badge',
      timestamp: '2024-01-12T08:00:00Z',
      icon: '🏆',
      color: '#ffd700'
    }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(mockUser);
      setPreferences(mockPreferences);
      setEditForm(mockUser);
      setIsLoading(false);
    };

    loadUserData();
  }, [userId]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm(user);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(editForm);
    setIsEditing(false);
    setIsLoading(false);
    
    // Show success notification
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: 'Profile updated successfully!'
    }, ...prev]);
  };

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSimplePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getSubscriptionBadge = (status) => {
    const badges = {
      free: { icon: '🆓', color: '#718096', label: 'Free' },
      premium: { icon: '⭐', color: '#ed8936', label: 'Premium' },
      pro: { icon: '💎', color: '#667eea', label: 'Pro' }
    };
    return badges[status] || badges.free;
  };

  const ProfileSection = () => (
    <div className="profile-section">
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>
          <motion.button
            className="avatar-edit-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            📷
          </motion.button>
        </div>
        
        <div className="profile-info">
          <div className="name-section">
            {isEditing ? (
              <div className="name-edit">
                <input
                  type="text"
                  value={editForm.firstName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First Name"
                  className="name-input"
                />
                <input
                  type="text"
                  value={editForm.lastName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last Name"
                  className="name-input"
                />
              </div>
            ) : (
              <h1>{user.firstName} {user.lastName}</h1>
            )}
            
            <div className="user-meta">
              <span className="username">@{user.username}</span>
              <div 
                className="subscription-badge"
                style={{ backgroundColor: getSubscriptionBadge(user.subscriptionStatus).color }}
              >
                {getSubscriptionBadge(user.subscriptionStatus).icon} {getSubscriptionBadge(user.subscriptionStatus).label}
              </div>
              {user.emailVerified && <span className="verified-badge">✅ Verified</span>}
            </div>
          </div>
          
          <div className="profile-actions">
            <motion.button
              className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
              onClick={isEditing ? handleSaveProfile : handleEditToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isEditing ? '💾 Save' : '✏️ Edit'}
            </motion.button>
            
            {isEditing && (
              <motion.button
                className="cancel-btn"
                onClick={handleEditToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ❌ Cancel
              </motion.button>
            )}
          </div>
        </div>
      </div>
      
      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-label">📧 Email:</span>
          {isEditing ? (
            <input
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              className="detail-input"
            />
          ) : (
            <span className="detail-value">{user.email}</span>
          )}
        </div>
        
        <div className="detail-item">
          <span className="detail-label">📍 Location:</span>
          {isEditing ? (
            <input
              type="text"
              value={editForm.location || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Your location"
              className="detail-input"
            />
          ) : (
            <span className="detail-value">{user.location || 'Not specified'}</span>
          )}
        </div>
        
        <div className="detail-item">
          <span className="detail-label">🌐 Website:</span>
          {isEditing ? (
            <input
              type="url"
              value={editForm.website || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourwebsite.com"
              className="detail-input"
            />
          ) : (
            <span className="detail-value">
              {user.website ? (
                <a href={user.website} target="_blank" rel="noopener noreferrer">
                  {user.website}
                </a>
              ) : (
                'Not specified'
              )}
            </span>
          )}
        </div>
        
        <div className="detail-item bio-item">
          <span className="detail-label">📝 Bio:</span>
          {isEditing ? (
            <textarea
              value={editForm.bio || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="bio-textarea"
              rows="3"
            />
          ) : (
            <span className="detail-value bio-text">{user.bio || 'No bio provided'}</span>
          )}
        </div>
        
        <div className="join-info">
          <div className="join-item">
            <span className="join-label">📅 Joined:</span>
            <span className="join-value">{formatDate(user.joinDate)}</span>
          </div>
          <div className="join-item">
            <span className="join-label">⏰ Last Active:</span>
            <span className="join-value">{formatRelativeTime(user.lastActive)}</span>
          </div>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-info">
            <div className="stat-value">{user.totalNewsletters}</div>
            <div className="stat-label">Newsletters</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <div className="stat-value">{user.readCount}</div>
            <div className="stat-label">Read</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-info">
            <div className="stat-value">{user.favoriteCount}</div>
            <div className="stat-label">Favorites</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <div className="stat-value">{user.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>
      
      <div className="badges-section">
        <h3>🏆 Badges</h3>
        <div className="badges-grid">
          {user.badges.map((badge, index) => (
            <motion.div
              key={index}
              className="badge-item"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              🏆 {badge}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="interests-section">
        <h3>🎯 Interests</h3>
        <div className="interests-grid">
          {user.interests.map((interest, index) => (
            <span key={index} className="interest-tag">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const PreferencesSection = () => (
    <div className="preferences-section">
      <div className="preference-group">
        <h3>📧 Email Preferences</h3>
        
        <div className="preference-item">
          <label className="preference-label">Email Frequency</label>
          <select
            value={preferences.emailFrequency}
            onChange={(e) => handleSimplePreferenceChange('emailFrequency', e.target.value)}
            className="preference-select"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>
        
        <div className="preference-item">
          <label className="preference-label">Preferred Time</label>
          <input
            type="time"
            value={preferences.emailTime}
            onChange={(e) => handleSimplePreferenceChange('emailTime', e.target.value)}
            className="preference-input"
          />
        </div>
        
        <div className="preference-item">
          <label className="preference-label">Digest Format</label>
          <select
            value={preferences.digestFormat}
            onChange={(e) => handleSimplePreferenceChange('digestFormat', e.target.value)}
            className="preference-select"
          >
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
            <option value="headlines">Headlines Only</option>
          </select>
        </div>
      </div>
      
      <div className="preference-group">
        <h3>🔔 Notifications</h3>
        
        {Object.entries(preferences.notifications).map(([key, value]) => (
          <div key={key} className="preference-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          </div>
        ))}
      </div>
      
      <div className="preference-group">
        <h3>🔒 Privacy</h3>
        
        {Object.entries(preferences.privacy).map(([key, value]) => (
          <div key={key} className="preference-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePreferenceChange('privacy', key, e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          </div>
        ))}
      </div>
      
      <div className="preference-group">
        <h3>♿ Accessibility</h3>
        
        {Object.entries(preferences.accessibility).map(([key, value]) => (
          <div key={key} className="preference-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePreferenceChange('accessibility', key, e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          </div>
        ))}
      </div>
      
      <div className="preference-group">
        <h3>🎨 Appearance</h3>
        
        <div className="preference-item">
          <label className="preference-label">Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => handleSimplePreferenceChange('theme', e.target.value)}
            className="preference-select"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.autoplay}
              onChange={(e) => handleSimplePreferenceChange('autoplay', e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Autoplay Media</span>
          </label>
        </div>
        
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.saveReadingProgress}
              onChange={(e) => handleSimplePreferenceChange('saveReadingProgress', e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Save Reading Progress</span>
          </label>
        </div>
      </div>
    </div>
  );

  const ActivitySection = () => (
    <div className="activity-section">
      <div className="activity-header">
        <h3>📊 Recent Activity</h3>
        <div className="activity-stats">
          <div className="activity-stat">
            <span className="stat-value">{user.engagementScore}%</span>
            <span className="stat-label">Engagement</span>
          </div>
        </div>
      </div>
      
      <div className="activity-timeline">
        {mockActivity.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="activity-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div 
              className="activity-icon"
              style={{ backgroundColor: activity.color }}
            >
              {activity.icon}
            </div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div className="activity-time">{formatRelativeTime(activity.timestamp)}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const SecuritySection = () => (
    <div className="security-section">
      <div className="security-group">
        <h3>🔐 Account Security</h3>
        
        <div className="security-item">
          <div className="security-info">
            <div className="security-title">Password</div>
            <div className="security-desc">Last changed 3 months ago</div>
          </div>
          <motion.button
            className="security-btn"
            onClick={() => setShowPasswordModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Change Password
          </motion.button>
        </div>
        
        <div className="security-item">
          <div className="security-info">
            <div className="security-title">Two-Factor Authentication</div>
            <div className="security-desc">
              {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <motion.button
            className={`security-btn ${user.twoFactorEnabled ? 'enabled' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </motion.button>
        </div>
        
        <div className="security-item">
          <div className="security-info">
            <div className="security-title">Email Verification</div>
            <div className="security-desc">
              {user.emailVerified ? 'Verified ✅' : 'Not verified ❌'}
            </div>
          </div>
          {!user.emailVerified && (
            <motion.button
              className="security-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Verify Email
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="security-group danger-zone">
        <h3>⚠️ Danger Zone</h3>
        
        <div className="security-item">
          <div className="security-info">
            <div className="security-title">Delete Account</div>
            <div className="security-desc">Permanently delete your account and all data</div>
          </div>
          <motion.button
            className="security-btn danger"
            onClick={() => setShowDeleteModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Delete Account
          </motion.button>
        </div>
      </div>
    </div>
  );

  if (isLoading && !user) {
    return (
      <div className="profile-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          👤
        </motion.div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            {notification.message}
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="notification-close"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="profile-header-main">
        <h1>👤 User Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-tabs">
        {[
          { id: 'profile', label: '👤 Profile', show: true },
          { id: 'preferences', label: '⚙️ Preferences', show: showPreferences },
          { id: 'activity', label: '📊 Activity', show: showActivity },
          { id: 'security', label: '🔐 Security', show: showSecurity }
        ].filter(tab => tab.show).map((tab) => (
          <motion.button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div className="profile-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'preferences' && <PreferencesSection />}
            {activeTab === 'activity' && <ActivitySection />}
            {activeTab === 'security' && <SecuritySection />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              className="password-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>🔐 Change Password</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowPasswordModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" className="form-input" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-input" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" className="form-input" />
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button className="save-btn">
                  Update Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="delete-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>⚠️ Delete Account</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                <div className="form-group">
                  <label>Type "DELETE" to confirm:</label>
                  <input type="text" className="form-input" placeholder="DELETE" />
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="delete-btn">
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .user-profile {
          padding: 24px;
          background: #f7fafc;
          min-height: 100vh;
          position: relative;
        }

        .profile-loading {
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

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
        }

        .notification.success {
          background: #48bb78;
        }

        .notification.error {
          background: #e53e3e;
        }

        .notification-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          margin-left: auto;
        }

        .profile-header-main {
          margin-bottom: 32px;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-header-main h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
        }

        .profile-header-main p {
          margin: 0;
          color: #718096;
          font-size: 16px;
        }

        .profile-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding: 4px;
        }

        .tab-btn {
          padding: 12px 20px;
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

        .profile-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .profile-section {
          padding: 24px;
        }

        .profile-header {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          align-items: flex-start;
        }

        .avatar-section {
          position: relative;
        }

        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #e2e8f0;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #667eea;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 700;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #667eea;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .profile-info {
          flex: 1;
        }

        .name-section h1 {
          margin: 0 0 12px 0;
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
        }

        .name-edit {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .name-input {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 18px;
          font-weight: 600;
        }

        .user-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .username {
          color: #718096;
          font-size: 16px;
        }

        .subscription-badge,
        .verified-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }

        .verified-badge {
          background: #48bb78;
        }

        .profile-actions {
          display: flex;
          gap: 12px;
        }

        .edit-btn,
        .cancel-btn {
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

        .edit-btn.save {
          background: #48bb78;
        }

        .edit-btn.save:hover {
          background: #38a169;
        }

        .cancel-btn {
          background: #e2e8f0;
          color: #4a5568;
        }

        .cancel-btn:hover {
          background: #cbd5e0;
        }

        .profile-details {
          margin-bottom: 32px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-item.bio-item {
          align-items: flex-start;
        }

        .detail-label {
          min-width: 100px;
          font-weight: 500;
          color: #4a5568;
        }

        .detail-value {
          flex: 1;
          color: #2d3748;
        }

        .detail-value a {
          color: #667eea;
          text-decoration: none;
        }

        .detail-value a:hover {
          text-decoration: underline;
        }

        .detail-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
        }

        .bio-textarea {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .bio-text {
          line-height: 1.5;
        }

        .join-info {
          display: flex;
          gap: 32px;
          margin-bottom: 32px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .join-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .join-label {
          font-size: 12px;
          color: #718096;
          font-weight: 500;
        }

        .join-value {
          font-size: 14px;
          color: #2d3748;
          font-weight: 600;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .stat-icon {
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

        .badges-section,
        .interests-section {
          margin-bottom: 32px;
        }

        .badges-section h3,
        .interests-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badge-item {
          padding: 8px 12px;
          background: #ffd700;
          color: #744210;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .interests-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .interest-tag {
          padding: 6px 12px;
          background: #edf2f7;
          color: #4a5568;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .preferences-section {
          padding: 24px;
        }

        .preference-group {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preference-group:last-child {
          border-bottom: none;
        }

        .preference-group h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .preference-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .preference-label {
          font-weight: 500;
          color: #4a5568;
        }

        .preference-select,
        .preference-input {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .preference-toggle {
          margin-bottom: 16px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .toggle-input {
          display: none;
        }

        .toggle-slider {
          width: 44px;
          height: 24px;
          background: #cbd5e0;
          border-radius: 12px;
          position: relative;
          transition: all 0.2s ease;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.2s ease;
        }

        .toggle-input:checked + .toggle-slider {
          background: #667eea;
        }

        .toggle-input:checked + .toggle-slider::before {
          transform: translateX(20px);
        }

        .toggle-text {
          font-weight: 500;
          color: #4a5568;
        }

        .activity-section {
          padding: 24px;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .activity-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .activity-stats {
          display: flex;
          gap: 16px;
        }

        .activity-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid transparent;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .activity-time {
          font-size: 12px;
          color: #718096;
        }

        .security-section {
          padding: 24px;
        }

        .security-group {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .security-group:last-child {
          border-bottom: none;
        }

        .security-group h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .danger-zone {
          border: 1px solid #fed7d7;
          border-radius: 8px;
          padding: 20px;
          background: #fef5e7;
        }

        .danger-zone h3 {
          color: #e53e3e;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .security-info {
          flex: 1;
        }

        .security-title {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .security-desc {
          font-size: 14px;
          color: #718096;
        }

        .security-btn {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #4a5568;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .security-btn:hover {
          background: #f7fafc;
        }

        .security-btn.enabled {
          background: #48bb78;
          color: white;
          border-color: #48bb78;
        }

        .security-btn.danger {
          background: #e53e3e;
          color: white;
          border-color: #e53e3e;
        }

        .security-btn.danger:hover {
          background: #c53030;
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

        .password-modal,
        .delete-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #718096;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #f7fafc;
        }

        .modal-content {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #4a5568;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          background: #f7fafc;
        }

        .save-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #5a67d8;
        }

        .delete-btn {
          padding: 10px 20px;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: #c53030;
        }

        @media (max-width: 768px) {
          .user-profile {
            padding: 16px;
          }

          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-tabs {
            overflow-x: auto;
          }

          .profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .preference-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .security-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .join-info {
            flex-direction: column;
            gap: 16px;
          }

          .name-edit {
            flex-direction: column;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;