import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivacy } from '../utils/privacy-utils';

const PrivacySettings = ({ 
  showDataManagement = true,
  showCookieSettings = true,
  showConsentManagement = true,
  showDataExport = true
}) => {
  const {
    consentManager,
    dataManager,
    cookieManager,
    storageManager,
    policyManager
  } = usePrivacy();

  const [activeTab, setActiveTab] = useState('overview');
  const [privacySettings, setPrivacySettings] = useState({});
  const [consentStatus, setConsentStatus] = useState({});
  const [cookieSettings, setCookieSettings] = useState({});
  const [dataRequests, setDataRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Privacy API configuration
  const PRIVACY_API_CONFIG = {
    baseUrl: process.env.REACT_APP_PRIVACY_API_URL || '/api/privacy',
    timeout: 10000,
    retryAttempts: 3
  };

  // Fetch privacy settings from API
  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch(`${PRIVACY_API_CONFIG.baseUrl}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-Privacy-Mode': 'strict'
        },
        signal: AbortSignal.timeout(PRIVACY_API_CONFIG.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch privacy settings:', error);
      return getFallbackPrivacySettings();
    }
  };

  const fetchConsentStatus = async () => {
    try {
      const response = await fetch(`${PRIVACY_API_CONFIG.baseUrl}/consent`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-Privacy-Mode': 'strict'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch consent status:', error);
      return getFallbackConsentStatus();
    }
  };

  const fetchDataRequests = async () => {
    try {
      const response = await fetch(`${PRIVACY_API_CONFIG.baseUrl}/data-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-Privacy-Mode': 'strict'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data requests:', error);
      return getFallbackDataRequests();
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'demo-token';
  };

  // Fallback privacy settings
  const getFallbackPrivacySettings = () => ({
    dataCollection: {
      analytics: false,
      personalization: false,
      marketing: false,
      thirdParty: false,
      location: false,
      deviceInfo: false,
      behaviorTracking: false,
      crossSiteTracking: false
    },
    dataSharing: {
      partners: false,
      advertisers: false,
      analytics: false,
      socialMedia: false,
      research: false,
      legal: true
    },
    communication: {
      newsletter: true,
      promotions: false,
      surveys: false,
      updates: true,
      security: true,
      thirdPartyOffers: false
    },
    visibility: {
      profile: 'private',
      activity: 'private',
      email: 'private',
      stats: 'private',
      preferences: 'private'
    },
    retention: {
      accountData: '1 year',
      activityLogs: '6 months',
      analytics: '3 months',
      cookies: '7 days',
      backups: '30 days'
    }
  });

  const getFallbackConsentStatus = () => ({
    essential: { granted: true, required: true, description: 'Required for basic functionality' },
    analytics: { granted: false, required: false, description: 'Help us improve our service' },
    marketing: { granted: false, required: false, description: 'Personalized content and ads' },
    personalization: { granted: false, required: false, description: 'Customize your experience' },
    social: { granted: false, required: false, description: 'Social media integration' },
    thirdParty: { granted: false, required: false, description: 'Third-party services' }
  });

  const getFallbackCookieSettings = () => ({
    essential: { enabled: true, locked: true, count: 2 },
    functional: { enabled: false, locked: false, count: 0 },
    analytics: { enabled: false, locked: false, count: 0 },
    marketing: { enabled: false, locked: false, count: 0 },
    social: { enabled: false, locked: false, count: 0 }
  });

  const getFallbackDataRequests = () => [
    {
      id: 'fallback_001',
      type: 'info',
      status: 'pending',
      requestDate: new Date().toISOString(),
      completedDate: null,
      description: 'Privacy information request'
    }
  ];

  useEffect(() => {
    const loadPrivacyData = async () => {
      setIsLoading(true);
      try {
        const [settings, consent, requests] = await Promise.all([
          fetchPrivacySettings(),
          fetchConsentStatus(),
          fetchDataRequests()
        ]);
        
        setPrivacySettings(settings);
        setConsentStatus(consent);
        setCookieSettings(getFallbackCookieSettings());
        setDataRequests(requests);
      } catch (error) {
        console.error('Failed to load privacy data:', error);
        setPrivacySettings(getFallbackPrivacySettings());
        setConsentStatus(getFallbackConsentStatus());
        setCookieSettings(getFallbackCookieSettings());
        setDataRequests(getFallbackDataRequests());
      }
      setIsLoading(false);
    };

    loadPrivacyData();
  }, []);

  const handlePrivacySettingChange = (category, key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    // Show notification
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `Privacy setting updated: ${key}`
    }, ...prev]);
  };

  const handleConsentChange = (consentType, granted) => {
    if (consentStatus[consentType]?.required && !granted) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: 'This consent is required and cannot be disabled'
      }, ...prev]);
      return;
    }

    setConsentStatus(prev => ({
      ...prev,
      [consentType]: {
        ...prev[consentType],
        granted
      }
    }));

    // Update related settings
    if (consentManager) {
      consentManager.updateConsent(consentType, granted);
    }

    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `Consent ${granted ? 'granted' : 'revoked'} for ${consentType}`
    }, ...prev]);
  };

  const handleCookieSettingChange = (category, enabled) => {
    if (cookieSettings[category]?.locked) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: 'Essential cookies cannot be disabled'
      }, ...prev]);
      return;
    }

    setCookieSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled
      }
    }));

    // Update cookie manager
    if (cookieManager) {
      cookieManager.updateCookieConsent(category, enabled);
    }

    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `${category} cookies ${enabled ? 'enabled' : 'disabled'}`
    }, ...prev]);
  };

  const handleDataExport = async () => {
    setShowExportModal(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNotifications(prev => [{
            id: Date.now(),
            type: 'success',
            message: 'Data export completed! Download link sent to your email.'
          }, ...prev]);
          setTimeout(() => setShowExportModal(false), 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDataDeletion = async () => {
    if (deleteConfirmation !== 'DELETE MY DATA') {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: 'Please type "DELETE MY DATA" to confirm'
      }, ...prev]);
      return;
    }

    setIsLoading(true);
    // Simulate deletion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowDeleteModal(false);
    setDeleteConfirmation('');
    setIsLoading(false);
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: 'Data deletion request submitted. You will receive confirmation via email.'
    }, ...prev]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#48bb78',
      processing: '#ed8936',
      pending: '#667eea',
      failed: '#e53e3e'
    };
    return colors[status] || '#718096';
  };

  const OverviewSection = () => (
    <div className="overview-section">
      <div className="privacy-summary">
        <h3>🛡️ Privacy Overview</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">🔒</div>
            <div className="summary-info">
              <div className="summary-value">
                {Object.values(consentStatus).filter(c => c.granted).length}
              </div>
              <div className="summary-label">Active Consents</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">🍪</div>
            <div className="summary-info">
              <div className="summary-value">
                {Object.values(cookieSettings).filter(c => c.enabled).length}
              </div>
              <div className="summary-label">Cookie Categories</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-info">
              <div className="summary-value">{dataRequests.length}</div>
              <div className="summary-label">Data Requests</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-info">
              <div className="summary-value">30 days</div>
              <div className="summary-label">Data Retention</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>📋 Recent Privacy Activity</h3>
        <div className="activity-list">
          {dataRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="activity-item">
              <div 
                className="activity-status"
                style={{ backgroundColor: getStatusColor(request.status) }}
              >
                {request.type === 'export' && '📤'}
                {request.type === 'deletion' && '🗑️'}
                {request.type === 'correction' && '✏️'}
              </div>
              <div className="activity-content">
                <div className="activity-title">{request.description}</div>
                <div className="activity-meta">
                  <span className="activity-date">{formatDate(request.requestDate)}</span>
                  <span 
                    className="activity-status-text"
                    style={{ color: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid">
          <motion.button
            className="action-btn export"
            onClick={handleDataExport}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="action-icon">📤</span>
            <span className="action-text">Export My Data</span>
          </motion.button>
          
          <motion.button
            className="action-btn delete"
            onClick={() => setShowDeleteModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="action-icon">🗑️</span>
            <span className="action-text">Delete My Data</span>
          </motion.button>
          
          <motion.button
            className="action-btn settings"
            onClick={() => setActiveTab('consent')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="action-icon">⚙️</span>
            <span className="action-text">Manage Consents</span>
          </motion.button>
          
          <motion.button
            className="action-btn cookies"
            onClick={() => setActiveTab('cookies')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="action-icon">🍪</span>
            <span className="action-text">Cookie Settings</span>
          </motion.button>
        </div>
      </div>
    </div>
  );

  const ConsentSection = () => (
    <div className="consent-section">
      <div className="section-header">
        <h3>🔒 Consent Management</h3>
        <p>Control how your data is used and shared</p>
      </div>
      
      <div className="consent-list">
        {Object.entries(consentStatus).map(([consentType, consent]) => (
          <div key={consentType} className="consent-item">
            <div className="consent-info">
              <div className="consent-title">
                {consentType.charAt(0).toUpperCase() + consentType.slice(1)}
                {consent.required && <span className="required-badge">Required</span>}
              </div>
              <div className="consent-description">{consent.description}</div>
            </div>
            
            <div className="consent-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={consent.granted}
                  onChange={(e) => handleConsentChange(consentType, e.target.checked)}
                  disabled={consent.required}
                  className="toggle-input"
                />
                <span className={`toggle-slider ${consent.required ? 'locked' : ''}`}></span>
              </label>
            </div>
          </div>
        ))}
      </div>
      
      <div className="consent-actions">
        <motion.button
          className="consent-btn accept-all"
          onClick={() => {
            Object.keys(consentStatus).forEach(type => {
              if (!consentStatus[type].required) {
                handleConsentChange(type, true);
              }
            });
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Accept All
        </motion.button>
        
        <motion.button
          className="consent-btn reject-all"
          onClick={() => {
            Object.keys(consentStatus).forEach(type => {
              if (!consentStatus[type].required) {
                handleConsentChange(type, false);
              }
            });
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Reject All Optional
        </motion.button>
      </div>
    </div>
  );

  const CookiesSection = () => (
    <div className="cookies-section">
      <div className="section-header">
        <h3>🍪 Cookie Settings</h3>
        <p>Manage cookies and tracking technologies</p>
      </div>
      
      <div className="cookies-list">
        {Object.entries(cookieSettings).map(([category, settings]) => (
          <div key={category} className="cookie-category">
            <div className="category-header">
              <div className="category-info">
                <div className="category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)} Cookies
                  {settings.locked && <span className="locked-badge">🔒 Required</span>}
                </div>
                <div className="category-count">{settings.count} cookies</div>
              </div>
              
              <div className="category-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleCookieSettingChange(category, e.target.checked)}
                    disabled={settings.locked}
                    className="toggle-input"
                  />
                  <span className={`toggle-slider ${settings.locked ? 'locked' : ''}`}></span>
                </label>
              </div>
            </div>
            
            <div className="category-description">
              {category === 'essential' && 'Required for basic site functionality'}
              {category === 'functional' && 'Remember your preferences and settings'}
              {category === 'analytics' && 'Help us understand how you use our site'}
              {category === 'marketing' && 'Used for advertising and personalization'}
              {category === 'social' && 'Enable social media features and sharing'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="cookies-actions">
        <motion.button
          className="cookie-btn clear"
          onClick={() => {
            if (cookieManager) {
              cookieManager.clearNonEssentialCookies();
            }
            setNotifications(prev => [{
              id: Date.now(),
              type: 'success',
              message: 'Non-essential cookies cleared'
            }, ...prev]);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Clear Non-Essential Cookies
        </motion.button>
      </div>
    </div>
  );

  const DataSection = () => (
    <div className="data-section">
      <div className="section-header">
        <h3>📊 Data Management</h3>
        <p>Control your personal data and privacy settings</p>
      </div>
      
      <div className="data-categories">
        {Object.entries(privacySettings).map(([category, settings]) => (
          <div key={category} className="data-category">
            <h4>{category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
            
            <div className="settings-list">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="setting-item">
                  <div className="setting-info">
                    <div className="setting-title">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  </div>
                  
                  <div className="setting-control">
                    {typeof value === 'boolean' ? (
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePrivacySettingChange(category, key, e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    ) : (
                      <select
                        value={value}
                        onChange={(e) => handlePrivacySettingChange(category, key, e.target.value)}
                        className="setting-select"
                      >
                        {category === 'visibility' && [
                          <option key="public" value="public">Public</option>,
                          <option key="friends" value="friends">Friends Only</option>,
                          <option key="private" value="private">Private</option>
                        ]}
                        {category === 'retention' && [
                          <option key="30days" value="30 days">30 days</option>,
                          <option key="90days" value="90 days">90 days</option>,
                          <option key="6months" value="6 months">6 months</option>,
                          <option key="1year" value="1 year">1 year</option>,
                          <option key="2years" value="2 years">2 years</option>
                        ]}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="data-requests-section">
        <h4>📋 Data Requests History</h4>
        <div className="requests-list">
          {dataRequests.map((request) => (
            <div key={request.id} className="request-item">
              <div className="request-icon">
                {request.type === 'export' && '📤'}
                {request.type === 'deletion' && '🗑️'}
                {request.type === 'correction' && '✏️'}
              </div>
              
              <div className="request-info">
                <div className="request-title">{request.description}</div>
                <div className="request-meta">
                  <span>Requested: {formatDate(request.requestDate)}</span>
                  {request.completedDate && (
                    <span>Completed: {formatDate(request.completedDate)}</span>
                  )}
                </div>
              </div>
              
              <div 
                className="request-status"
                style={{ color: getStatusColor(request.status) }}
              >
                {request.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading && Object.keys(privacySettings).length === 0) {
    return (
      <div className="privacy-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🛡️
        </motion.div>
        <p>Loading privacy settings...</p>
      </div>
    );
  }

  return (
    <div className="privacy-settings">
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

      <div className="privacy-header">
        <h1>🛡️ Privacy Settings</h1>
        <p>Control your data, privacy, and consent preferences</p>
      </div>

      <div className="privacy-tabs">
        {[
          { id: 'overview', label: '📊 Overview', show: true },
          { id: 'consent', label: '🔒 Consent', show: showConsentManagement },
          { id: 'cookies', label: '🍪 Cookies', show: showCookieSettings },
          { id: 'data', label: '📊 Data', show: showDataManagement }
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

      <div className="privacy-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <OverviewSection />}
            {activeTab === 'consent' && <ConsentSection />}
            {activeTab === 'cookies' && <CookiesSection />}
            {activeTab === 'data' && <DataSection />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="export-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>📤 Exporting Your Data</h2>
              </div>
              
              <div className="modal-content">
                <div className="export-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{exportProgress}% Complete</div>
                </div>
                
                <p>We're preparing your data export. This may take a few minutes.</p>
                {exportProgress === 100 && (
                  <p className="export-complete">✅ Export complete! Check your email for the download link.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
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
                <h2>🗑️ Delete My Data</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="warning-box">
                  <p>⚠️ <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.</p>
                </div>
                
                <div className="form-group">
                  <label>Type "DELETE MY DATA" to confirm:</label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="form-input"
                    placeholder="DELETE MY DATA"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="delete-btn"
                  onClick={handleDataDeletion}
                  disabled={deleteConfirmation !== 'DELETE MY DATA'}
                >
                  Delete My Data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .privacy-settings {
          padding: 24px;
          background: #f7fafc;
          min-height: 100vh;
          position: relative;
        }

        .privacy-loading {
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

        .privacy-header {
          margin-bottom: 32px;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .privacy-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
        }

        .privacy-header p {
          margin: 0;
          color: #718096;
          font-size: 16px;
        }

        .privacy-tabs {
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

        .privacy-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .overview-section,
        .consent-section,
        .cookies-section,
        .data-section {
          padding: 24px;
        }

        .section-header {
          margin-bottom: 24px;
        }

        .section-header h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
        }

        .section-header p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .privacy-summary {
          margin-bottom: 32px;
        }

        .privacy-summary h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .summary-icon {
          font-size: 24px;
        }

        .summary-info {
          display: flex;
          flex-direction: column;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
        }

        .summary-label {
          font-size: 12px;
          color: #718096;
        }

        .recent-activity {
          margin-bottom: 32px;
        }

        .recent-activity h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid transparent;
        }

        .activity-status {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .activity-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }

        .activity-date {
          color: #718096;
        }

        .activity-status-text {
          font-weight: 500;
        }

        .quick-actions h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.export {
          background: #667eea;
          color: white;
        }

        .action-btn.delete {
          background: #e53e3e;
          color: white;
        }

        .action-btn.settings {
          background: #48bb78;
          color: white;
        }

        .action-btn.cookies {
          background: #ed8936;
          color: white;
        }

        .action-icon {
          font-size: 16px;
        }

        .consent-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .consent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .consent-info {
          flex: 1;
        }

        .consent-title {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .required-badge {
          padding: 2px 6px;
          background: #e53e3e;
          color: white;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .consent-description {
          font-size: 14px;
          color: #718096;
        }

        .consent-toggle,
        .category-toggle {
          margin-left: 16px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
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

        .toggle-slider.locked {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .toggle-input:disabled + .toggle-slider.locked::before {
          background: #e2e8f0;
        }

        .consent-actions {
          display: flex;
          gap: 12px;
        }

        .consent-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .consent-btn.accept-all {
          background: #48bb78;
          color: white;
        }

        .consent-btn.reject-all {
          background: #e2e8f0;
          color: #4a5568;
        }

        .cookies-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .cookie-category {
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .category-info {
          flex: 1;
        }

        .category-title {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .locked-badge {
          padding: 2px 6px;
          background: #a0aec0;
          color: white;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .category-count {
          font-size: 12px;
          color: #718096;
        }

        .category-description {
          font-size: 14px;
          color: #718096;
          line-height: 1.4;
        }

        .cookies-actions {
          display: flex;
          gap: 12px;
        }

        .cookie-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cookie-btn.clear {
          background: #e53e3e;
          color: white;
        }

        .data-categories {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 32px;
        }

        .data-category {
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .data-category h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;
        }

        .setting-title {
          font-weight: 500;
          color: #2d3748;
        }

        .setting-control {
          margin-left: 16px;
        }

        .setting-select {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .data-requests-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .data-requests-section h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .request-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .request-icon {
          font-size: 20px;
        }

        .request-info {
          flex: 1;
        }

        .request-title {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .request-meta {
          font-size: 12px;
          color: #718096;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .request-status {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          background: #f7fafc;
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

        .export-modal,
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

        .export-progress {
          margin-bottom: 16px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: #667eea;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          font-size: 14px;
          color: #4a5568;
          font-weight: 500;
        }

        .export-complete {
          color: #48bb78;
          font-weight: 500;
        }

        .warning-box {
          padding: 12px;
          background: #fed7d7;
          border: 1px solid #feb2b2;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .warning-box p {
          margin: 0;
          color: #c53030;
          font-size: 14px;
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

        .cancel-btn {
          padding: 10px 20px;
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background: #cbd5e0;
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

        .delete-btn:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .privacy-settings {
            padding: 16px;
          }

          .privacy-tabs {
            overflow-x: auto;
          }

          .summary-grid,
          .actions-grid {
            grid-template-columns: 1fr;
          }

          .consent-item,
          .cookie-category,
          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .consent-toggle,
          .category-toggle,
          .setting-control {
            margin-left: 0;
          }

          .modal-actions {
            flex-direction: column;
          }

          .request-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacySettings;