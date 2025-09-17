import React, { useState, useEffect, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivacy } from '../utils/privacy-utils';

// GDPR Plus Compliance Context
const GDPRContext = createContext();

export const useGDPR = () => {
  const context = useContext(GDPRContext);
  if (!context) {
    throw new Error('useGDPR must be used within a GDPRProvider');
  }
  return context;
};

// GDPR Provider Component
export const GDPRProvider = ({ children }) => {
  const [consentData, setConsentData] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    personalization: false,
    thirdParty: false
  });

  const [complianceStatus, setComplianceStatus] = useState({
    gdprCompliant: false,
    ccpaCompliant: false,
    cookieConsentGiven: false,
    dataProcessingConsent: false,
    lastUpdated: null
  });

  const [userRights, setUserRights] = useState({
    dataPortability: false,
    dataErasure: false,
    dataRectification: false,
    dataAccess: false,
    processingRestriction: false
  });

  const { trackConsent, getConsentStatus, clearUserData } = usePrivacy();

  useEffect(() => {
    // Load existing consent data
    const existingConsent = getConsentStatus();
    if (existingConsent) {
      setConsentData(prev => ({ ...prev, ...existingConsent }));
      setComplianceStatus(prev => ({
        ...prev,
        gdprCompliant: existingConsent.gdpr || false,
        ccpaCompliant: existingConsent.ccpa || false,
        cookieConsentGiven: existingConsent.cookies || false,
        lastUpdated: existingConsent.timestamp
      }));
    }
  }, [getConsentStatus]);

  const updateConsent = async (consentType, value) => {
    const newConsentData = {
      ...consentData,
      [consentType]: value
    };

    setConsentData(newConsentData);

    // Track the consent change
    await trackConsent({
      ...newConsentData,
      timestamp: new Date().toISOString(),
      source: 'gdpr_compliance_update'
    });

    // Update compliance status
    setComplianceStatus(prev => ({
      ...prev,
      gdprCompliant: true,
      lastUpdated: new Date().toISOString()
    }));
  };

  const exerciseUserRight = async (rightType) => {
    setUserRights(prev => ({
      ...prev,
      [rightType]: true
    }));

    // Handle specific user rights
    switch (rightType) {
      case 'dataErasure':
        await clearUserData();
        break;
      case 'dataPortability':
        // Trigger data export
        await exportUserData();
        break;
      case 'dataAccess':
        // Provide data access report
        await generateDataReport();
        break;
      default:
        break;
    }
  };

  const exportUserData = async () => {
    // Implementation for data export
    const userData = {
      consents: consentData,
      complianceStatus,
      userRights,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-data-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateDataReport = async () => {
    // Generate comprehensive data report
    return {
      personalData: {
        consents: consentData,
        preferences: complianceStatus,
        rights: userRights
      },
      processingActivities: {
        analytics: consentData.analytics,
        marketing: consentData.marketing,
        personalization: consentData.personalization
      },
      dataRetention: {
        retentionPeriod: '24 months',
        lastReview: complianceStatus.lastUpdated
      }
    };
  };

  const contextValue = {
    consentData,
    complianceStatus,
    userRights,
    updateConsent,
    exerciseUserRight,
    exportUserData,
    generateDataReport
  };

  return (
    <GDPRContext.Provider value={contextValue}>
      {children}
    </GDPRContext.Provider>
  );
};

// GDPR Compliance Dashboard Component
const GDPRPlusCompliance = ({ 
  showBanner = true,
  compactMode = false,
  position = 'bottom-right'
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('consent');
  const [showBanner, setShowBannerState] = useState(showBanner);
  
  const {
    consentData,
    complianceStatus,
    userRights,
    updateConsent,
    exerciseUserRight,
    exportUserData
  } = useGDPR();

  const consentCategories = [
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      description: 'Essential for website functionality',
      required: true,
      icon: '🔧'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Help us understand how you use our site',
      required: false,
      icon: '📊'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Used for advertising and promotional content',
      required: false,
      icon: '📢'
    },
    {
      id: 'personalization',
      name: 'Personalization',
      description: 'Customize your experience',
      required: false,
      icon: '🎯'
    },
    {
      id: 'thirdParty',
      name: 'Third-Party',
      description: 'External services and integrations',
      required: false,
      icon: '🔗'
    }
  ];

  const userRightsList = [
    {
      id: 'dataAccess',
      name: 'Right to Access',
      description: 'Request a copy of your personal data',
      icon: '👁️'
    },
    {
      id: 'dataPortability',
      name: 'Data Portability',
      description: 'Export your data in a machine-readable format',
      icon: '📦'
    },
    {
      id: 'dataRectification',
      name: 'Right to Rectification',
      description: 'Correct inaccurate personal data',
      icon: '✏️'
    },
    {
      id: 'dataErasure',
      name: 'Right to Erasure',
      description: 'Request deletion of your personal data',
      icon: '🗑️'
    },
    {
      id: 'processingRestriction',
      name: 'Restrict Processing',
      description: 'Limit how we process your data',
      icon: '⏸️'
    }
  ];

  const handleConsentChange = async (consentType, value) => {
    await updateConsent(consentType, value);
  };

  const handleUserRightRequest = async (rightType) => {
    await exerciseUserRight(rightType);
  };

  const acceptAllConsents = async () => {
    for (const category of consentCategories) {
      if (!category.required) {
        await updateConsent(category.id, true);
      }
    }
    setShowBannerState(false);
  };

  const rejectAllConsents = async () => {
    for (const category of consentCategories) {
      if (!category.required) {
        await updateConsent(category.id, false);
      }
    }
    setShowBannerState(false);
  };

  const customizeConsents = () => {
    setShowPanel(true);
    setShowBannerState(false);
  };

  if (!complianceStatus.gdprCompliant && showBanner) {
    return (
      <motion.div
        className={`gdpr-banner ${position}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="banner-content">
          <div className="banner-text">
            <h3>🍪 We value your privacy</h3>
            <p>
              We use cookies and similar technologies to enhance your experience, 
              analyze site usage, and assist in marketing efforts. 
              <a href="/privacy-policy" target="_blank">Learn more</a>
            </p>
          </div>
          <div className="banner-actions">
            <motion.button
              className="accept-all-btn"
              onClick={acceptAllConsents}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Accept All
            </motion.button>
            <motion.button
              className="reject-all-btn"
              onClick={rejectAllConsents}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reject All
            </motion.button>
            <motion.button
              className="customize-btn"
              onClick={customizeConsents}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Customize
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Privacy Settings Toggle */}
      <motion.button
        className="privacy-toggle"
        onClick={() => setShowPanel(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Privacy Settings"
      >
        🔒
      </motion.button>

      {/* GDPR Compliance Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="gdpr-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPanel(false)}
          >
            <motion.div
              className={`gdpr-panel ${compactMode ? 'compact' : ''}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel-header">
                <h2>Privacy & Data Protection</h2>
                <motion.button
                  className="close-btn"
                  onClick={() => setShowPanel(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="panel-tabs">
                {['consent', 'rights', 'compliance'].map((tab) => (
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

              <div className="panel-content">
                {activeTab === 'consent' && (
                  <motion.div
                    className="consent-tab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3>Consent Management</h3>
                    <p>Control how your data is used across our platform.</p>
                    
                    <div className="consent-categories">
                      {consentCategories.map((category) => (
                        <div key={category.id} className="consent-item">
                          <div className="consent-info">
                            <span className="consent-icon">{category.icon}</span>
                            <div className="consent-details">
                              <h4>{category.name}</h4>
                              <p>{category.description}</p>
                            </div>
                          </div>
                          <div className="consent-toggle">
                            {category.required ? (
                              <span className="required-badge">Required</span>
                            ) : (
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={consentData[category.id]}
                                  onChange={(e) => handleConsentChange(category.id, e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'rights' && (
                  <motion.div
                    className="rights-tab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3>Your Data Rights</h3>
                    <p>Exercise your rights under GDPR and other privacy laws.</p>
                    
                    <div className="rights-list">
                      {userRightsList.map((right) => (
                        <div key={right.id} className="right-item">
                          <div className="right-info">
                            <span className="right-icon">{right.icon}</span>
                            <div className="right-details">
                              <h4>{right.name}</h4>
                              <p>{right.description}</p>
                            </div>
                          </div>
                          <motion.button
                            className={`right-btn ${userRights[right.id] ? 'exercised' : ''}`}
                            onClick={() => handleUserRightRequest(right.id)}
                            disabled={userRights[right.id]}
                            whileHover={{ scale: userRights[right.id] ? 1 : 1.05 }}
                            whileTap={{ scale: userRights[right.id] ? 1 : 0.95 }}
                          >
                            {userRights[right.id] ? 'Requested' : 'Request'}
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'compliance' && (
                  <motion.div
                    className="compliance-tab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3>Compliance Status</h3>
                    <p>Overview of your privacy and compliance settings.</p>
                    
                    <div className="compliance-status">
                      <div className="status-item">
                        <span className="status-icon">🇪🇺</span>
                        <div className="status-details">
                          <h4>GDPR Compliance</h4>
                          <span className={`status-badge ${complianceStatus.gdprCompliant ? 'compliant' : 'non-compliant'}`}>
                            {complianceStatus.gdprCompliant ? 'Compliant' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="status-item">
                        <span className="status-icon">🇺🇸</span>
                        <div className="status-details">
                          <h4>CCPA Compliance</h4>
                          <span className={`status-badge ${complianceStatus.ccpaCompliant ? 'compliant' : 'non-compliant'}`}>
                            {complianceStatus.ccpaCompliant ? 'Compliant' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="status-item">
                        <span className="status-icon">🍪</span>
                        <div className="status-details">
                          <h4>Cookie Consent</h4>
                          <span className={`status-badge ${complianceStatus.cookieConsentGiven ? 'given' : 'pending'}`}>
                            {complianceStatus.cookieConsentGiven ? 'Given' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="compliance-actions">
                      <motion.button
                        className="export-btn"
                        onClick={exportUserData}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📦 Export My Data
                      </motion.button>
                    </div>
                    
                    {complianceStatus.lastUpdated && (
                      <div className="last-updated">
                        <small>
                          Last updated: {new Date(complianceStatus.lastUpdated).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style jsx>{`
        .gdpr-banner {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          padding: 24px;
        }

        .gdpr-banner.bottom-right {
          left: auto;
          right: 20px;
          max-width: 400px;
        }

        .banner-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .banner-text h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .banner-text p {
          margin: 0;
          font-size: 14px;
          color: #4a5568;
          line-height: 1.5;
        }

        .banner-text a {
          color: #667eea;
          text-decoration: none;
        }

        .banner-text a:hover {
          text-decoration: underline;
        }

        .banner-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .accept-all-btn,
        .reject-all-btn,
        .customize-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .accept-all-btn {
          background: #667eea;
          color: white;
        }

        .accept-all-btn:hover {
          background: #5a67d8;
        }

        .reject-all-btn {
          background: #e2e8f0;
          color: #4a5568;
        }

        .reject-all-btn:hover {
          background: #cbd5e0;
        }

        .customize-btn {
          background: transparent;
          color: #667eea;
          border: 1px solid #667eea;
        }

        .customize-btn:hover {
          background: #667eea;
          color: white;
        }

        .privacy-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #667eea;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          z-index: 999;
          transition: all 0.3s ease;
        }

        .privacy-toggle:hover {
          transform: scale(1.1);
        }

        .gdpr-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          padding: 20px;
        }

        .gdpr-panel {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .gdpr-panel.compact {
          max-width: 500px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .panel-header h2 {
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

        .panel-tabs {
          display: flex;
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-btn {
          flex: 1;
          padding: 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #718096;
          transition: all 0.2s ease;
          position: relative;
        }

        .tab-btn:hover {
          color: #4a5568;
          background: #edf2f7;
        }

        .tab-btn.active {
          color: #667eea;
          background: white;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #667eea;
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .consent-tab h3,
        .rights-tab h3,
        .compliance-tab h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .consent-tab p,
        .rights-tab p,
        .compliance-tab p {
          margin: 0 0 24px 0;
          color: #718096;
          font-size: 14px;
        }

        .consent-categories,
        .rights-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .consent-item,
        .right-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f7fafc;
        }

        .consent-info,
        .right-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .consent-icon,
        .right-icon {
          font-size: 20px;
        }

        .consent-details h4,
        .right-details h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .consent-details p,
        .right-details p {
          margin: 0;
          font-size: 12px;
          color: #718096;
        }

        .required-badge {
          padding: 4px 8px;
          background: #e2e8f0;
          color: #4a5568;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e0;
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input:checked + .toggle-slider {
          background-color: #667eea;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .right-btn {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .right-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .right-btn.exercised {
          background: #48bb78;
          cursor: not-allowed;
        }

        .compliance-status {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f7fafc;
        }

        .status-icon {
          font-size: 24px;
        }

        .status-details {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-details h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .status-badge {
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
        }

        .status-badge.compliant,
        .status-badge.given {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-badge.non-compliant,
        .status-badge.pending {
          background: #fed7d7;
          color: #742a2a;
        }

        .compliance-actions {
          margin-bottom: 16px;
        }

        .export-btn {
          padding: 12px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-btn:hover {
          background: #5a67d8;
        }

        .last-updated {
          text-align: center;
          color: #718096;
        }

        @media (max-width: 768px) {
          .gdpr-banner {
            left: 10px;
            right: 10px;
            bottom: 10px;
          }

          .banner-actions {
            flex-direction: column;
          }

          .gdpr-panel {
            margin: 10px;
            max-height: 90vh;
          }

          .panel-content {
            padding: 16px;
          }

          .consent-item,
          .right-item,
          .status-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .consent-info,
          .right-info {
            width: 100%;
          }

          .status-details {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default GDPRPlusCompliance;