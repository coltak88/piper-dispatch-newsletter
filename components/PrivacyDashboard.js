import React, { useState, useEffect, useRef } from 'react';
import { getGlobalPrivacyTracker, getPrivacyReport, emergencyPrivacyPurge } from '../privacy/blockchainTracker.js';
import { PrivacyTracker } from '../privacy/tracking.js';

/**
 * Privacy Dashboard Component
 * Real-time privacy compliance monitoring with blockchain verification
 * Features:
 * - Live privacy metrics
 * - Blockchain integrity status
 * - Data purge controls
 * - Compliance reporting
 * - Emergency privacy controls
 * - Quantum resistance status
 * - Differential privacy budget
 */
const PrivacyDashboard = ({ 
  showAdvanced = false, 
  autoRefresh = true, 
  refreshInterval = 5000,
  theme = 'dark'
}) => {
  const [privacyReport, setPrivacyReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [trackerEvents, setTrackerEvents] = useState([]);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const intervalRef = useRef(null);
  const trackerRef = useRef(null);
  
  // Initialize privacy tracker and event listeners
  useEffect(() => {
    try {
      trackerRef.current = getGlobalPrivacyTracker({
        purgeInterval: 15000,
        blockchainEnabled: true,
        quantumResistant: true,
        differentialPrivacy: true,
        zeroKnowledge: true
      });
      
      // Listen to tracker events
      const handleTrackerEvent = (eventType, eventData) => {
        setTrackerEvents(prev => [
          {
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
          },
          ...prev.slice(0, 49) // Keep last 50 events
        ]);
      };
      
      // Subscribe to all tracker events
      const eventTypes = [
        'tracker_initialized',
        'event_tracked',
        'data_purged',
        'keys_rotated',
        'block_added',
        'emergency_purge_completed'
      ];
      
      eventTypes.forEach(eventType => {
        trackerRef.current.on(eventType, (data) => {
          handleTrackerEvent(eventType, data);
        });
      });
      
      // Initial report fetch
      fetchPrivacyReport();
      
    } catch (err) {
      setError(`Failed to initialize privacy tracker: ${err.message}`);
      setIsLoading(false);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Auto-refresh privacy report
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchPrivacyReport();
      }, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);
  
  /**
   * Fetch latest privacy report
   */
  const fetchPrivacyReport = async () => {
    try {
      const report = getPrivacyReport();
      if (report) {
        setPrivacyReport(report);
        setLastUpdate(Date.now());
        setError(null);
      }
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to fetch privacy report: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  /**
   * Handle emergency privacy purge
   */
  const handleEmergencyPurge = () => {
    try {
      emergencyPrivacyPurge();
      setShowEmergencyConfirm(false);
      fetchPrivacyReport();
    } catch (err) {
      setError(`Emergency purge failed: ${err.message}`);
    }
  };
  
  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  /**
   * Format duration for display
   */
  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  /**
   * Get compliance status color
   */
  const getComplianceColor = (isCompliant) => {
    return isCompliant ? '#00ff88' : '#ff4444';
  };
  
  /**
   * Get privacy budget status
   */
  const getPrivacyBudgetStatus = () => {
    if (!privacyReport?.privacyBudgetRemaining) return null;
    
    const remaining = privacyReport.privacyBudgetRemaining;
    const percentage = (remaining * 100).toFixed(1);
    
    let status = 'good';
    let color = '#00ff88';
    
    if (remaining < 0.3) {
      status = 'warning';
      color = '#ffaa00';
    }
    if (remaining < 0.1) {
      status = 'critical';
      color = '#ff4444';
    }
    
    return { remaining, percentage, status, color };
  };
  
  if (isLoading) {
    return (
      <div className={`privacy-dashboard privacy-dashboard--${theme}`}>
        <div className="privacy-dashboard__loading">
          <div className="privacy-dashboard__spinner"></div>
          <p>Initializing Privacy Tracker...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`privacy-dashboard privacy-dashboard--${theme}`}>
        <div className="privacy-dashboard__error">
          <h3>Privacy Tracker Error</h3>
          <p>{error}</p>
          <button 
            onClick={fetchPrivacyReport}
            className="privacy-dashboard__retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const budgetStatus = getPrivacyBudgetStatus();
  
  return (
    <div className={`privacy-dashboard privacy-dashboard--${theme}`}>
      {/* Header */}
      <div className="privacy-dashboard__header">
        <h2 className="privacy-dashboard__title">
          🔒 Privacy Compliance Dashboard
        </h2>
        <div className="privacy-dashboard__status">
          <span className="privacy-dashboard__status-indicator privacy-dashboard__status-indicator--active">
            ● ACTIVE
          </span>
          <span className="privacy-dashboard__last-update">
            Last Update: {lastUpdate ? formatTimestamp(lastUpdate) : 'Never'}
          </span>
        </div>
      </div>
      
      {/* Main Metrics */}
      <div className="privacy-dashboard__metrics">
        <div className="privacy-dashboard__metric-card">
          <h3>🛡️ Compliance Status</h3>
          <div className="privacy-dashboard__compliance-grid">
            {privacyReport?.compliance && Object.entries(privacyReport.compliance).map(([key, value]) => (
              <div key={key} className="privacy-dashboard__compliance-item">
                <span className="privacy-dashboard__compliance-label">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span 
                  className="privacy-dashboard__compliance-status"
                  style={{ color: getComplianceColor(value) }}
                >
                  {value ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="privacy-dashboard__metric-card">
          <h3>📊 Data Metrics</h3>
          <div className="privacy-dashboard__data-metrics">
            <div className="privacy-dashboard__metric">
              <span className="privacy-dashboard__metric-label">Current Data Points:</span>
              <span className="privacy-dashboard__metric-value">
                {privacyReport?.currentDataPoints || 0}
              </span>
            </div>
            <div className="privacy-dashboard__metric">
              <span className="privacy-dashboard__metric-label">Total Processed:</span>
              <span className="privacy-dashboard__metric-value">
                {privacyReport?.metrics?.dataPointsProcessed || 0}
              </span>
            </div>
            <div className="privacy-dashboard__metric">
              <span className="privacy-dashboard__metric-label">Purge Operations:</span>
              <span className="privacy-dashboard__metric-value">
                {privacyReport?.metrics?.purgeOperations || 0}
              </span>
            </div>
            <div className="privacy-dashboard__metric">
              <span className="privacy-dashboard__metric-label">Uptime:</span>
              <span className="privacy-dashboard__metric-value">
                {privacyReport?.uptime ? formatDuration(privacyReport.uptime) : '0s'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Privacy Budget */}
        {budgetStatus && (
          <div className="privacy-dashboard__metric-card">
            <h3>🎯 Privacy Budget</h3>
            <div className="privacy-dashboard__budget">
              <div className="privacy-dashboard__budget-bar">
                <div 
                  className="privacy-dashboard__budget-fill"
                  style={{ 
                    width: `${budgetStatus.percentage}%`,
                    backgroundColor: budgetStatus.color
                  }}
                ></div>
              </div>
              <div className="privacy-dashboard__budget-info">
                <span>Remaining: {budgetStatus.percentage}%</span>
                <span className={`privacy-dashboard__budget-status privacy-dashboard__budget-status--${budgetStatus.status}`}>
                  {budgetStatus.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Blockchain Status */}
        {privacyReport?.config?.blockchainEnabled && (
          <div className="privacy-dashboard__metric-card">
            <h3>⛓️ Blockchain Verification</h3>
            <div className="privacy-dashboard__blockchain">
              <div className="privacy-dashboard__metric">
                <span className="privacy-dashboard__metric-label">Blocks:</span>
                <span className="privacy-dashboard__metric-value">
                  {privacyReport?.blockchainBlocks || 0}
                </span>
              </div>
              <div className="privacy-dashboard__metric">
                <span className="privacy-dashboard__metric-label">Verifications:</span>
                <span className="privacy-dashboard__metric-value">
                  {privacyReport?.metrics?.blockchainVerifications || 0}
                </span>
              </div>
              <div className="privacy-dashboard__metric">
                <span className="privacy-dashboard__metric-label">Integrity:</span>
                <span 
                  className="privacy-dashboard__metric-value"
                  style={{ color: getComplianceColor(privacyReport?.blockchainIntegrity) }}
                >
                  {privacyReport?.blockchainIntegrity ? '✓ VALID' : '✗ INVALID'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Advanced Section */}
      {showAdvanced && (
        <div className="privacy-dashboard__advanced">
          <h3>🔧 Advanced Controls</h3>
          
          {/* Configuration */}
          <div className="privacy-dashboard__config">
            <h4>Configuration</h4>
            <div className="privacy-dashboard__config-grid">
              {privacyReport?.config && Object.entries(privacyReport.config).map(([key, value]) => (
                <div key={key} className="privacy-dashboard__config-item">
                  <span className="privacy-dashboard__config-label">{key}:</span>
                  <span className="privacy-dashboard__config-value">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Events */}
          <div className="privacy-dashboard__events">
            <h4>Recent Events</h4>
            <div className="privacy-dashboard__events-list">
              {trackerEvents.slice(0, 10).map(event => (
                <div key={event.id} className="privacy-dashboard__event">
                  <span className="privacy-dashboard__event-time">
                    {formatTimestamp(event.timestamp)}
                  </span>
                  <span className="privacy-dashboard__event-type">
                    {event.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="privacy-dashboard__event-data">
                    {JSON.stringify(event.data).substring(0, 100)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Emergency Controls */}
          <div className="privacy-dashboard__emergency">
            <h4>Emergency Controls</h4>
            <button 
              onClick={() => setShowEmergencyConfirm(true)}
              className="privacy-dashboard__emergency-btn"
            >
              🚨 Emergency Data Purge
            </button>
            
            {showEmergencyConfirm && (
              <div className="privacy-dashboard__confirm-modal">
                <div className="privacy-dashboard__confirm-content">
                  <h4>Confirm Emergency Purge</h4>
                  <p>
                    This will immediately purge all tracked data, reset the blockchain, 
                    and rotate encryption keys. This action cannot be undone.
                  </p>
                  <div className="privacy-dashboard__confirm-actions">
                    <button 
                      onClick={handleEmergencyPurge}
                      className="privacy-dashboard__confirm-btn privacy-dashboard__confirm-btn--danger"
                    >
                      Confirm Purge
                    </button>
                    <button 
                      onClick={() => setShowEmergencyConfirm(false)}
                      className="privacy-dashboard__confirm-btn privacy-dashboard__confirm-btn--cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="privacy-dashboard__footer">
        <p className="privacy-dashboard__footer-text">
          🔐 Zero Data Retention • 🚀 15-Second Auto-Purge • ⚡ Quantum-Resistant • 🛡️ GDPR-Plus Compliant
        </p>
        <p className="privacy-dashboard__session-id">
          Session: {privacyReport?.sessionId?.substring(0, 8)}...
        </p>
      </div>
      
      <style jsx>{`
        .privacy-dashboard {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          color: #ffffff;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 8px 32px rgba(0, 255, 136, 0.1);
        }
        
        .privacy-dashboard--light {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          color: #333333;
          border-color: #e0e0e0;
        }
        
        .privacy-dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #333;
        }
        
        .privacy-dashboard__title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #00ff88;
        }
        
        .privacy-dashboard__status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        
        .privacy-dashboard__status-indicator {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }
        
        .privacy-dashboard__last-update {
          font-size: 11px;
          color: #888;
        }
        
        .privacy-dashboard__metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .privacy-dashboard__metric-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 20px;
        }
        
        .privacy-dashboard__metric-card h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #00ff88;
        }
        
        .privacy-dashboard__compliance-grid {
          display: grid;
          gap: 12px;
        }
        
        .privacy-dashboard__compliance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .privacy-dashboard__compliance-label {
          font-size: 13px;
          color: #ccc;
        }
        
        .privacy-dashboard__compliance-status {
          font-size: 12px;
          font-weight: 600;
        }
        
        .privacy-dashboard__data-metrics {
          display: grid;
          gap: 12px;
        }
        
        .privacy-dashboard__metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        
        .privacy-dashboard__metric-label {
          font-size: 13px;
          color: #ccc;
        }
        
        .privacy-dashboard__metric-value {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }
        
        .privacy-dashboard__budget {
          display: grid;
          gap: 12px;
        }
        
        .privacy-dashboard__budget-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .privacy-dashboard__budget-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .privacy-dashboard__budget-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        
        .privacy-dashboard__budget-status {
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 3px;
        }
        
        .privacy-dashboard__budget-status--good {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }
        
        .privacy-dashboard__budget-status--warning {
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
        }
        
        .privacy-dashboard__budget-status--critical {
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
        }
        
        .privacy-dashboard__blockchain {
          display: grid;
          gap: 12px;
        }
        
        .privacy-dashboard__advanced {
          border-top: 1px solid #333;
          padding-top: 24px;
          margin-top: 24px;
        }
        
        .privacy-dashboard__advanced h3 {
          margin: 0 0 20px 0;
          color: #00ff88;
        }
        
        .privacy-dashboard__config {
          margin-bottom: 24px;
        }
        
        .privacy-dashboard__config h4 {
          margin: 0 0 12px 0;
          color: #ccc;
          font-size: 14px;
        }
        
        .privacy-dashboard__config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }
        
        .privacy-dashboard__config-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 12px;
        }
        
        .privacy-dashboard__config-label {
          color: #888;
        }
        
        .privacy-dashboard__config-value {
          color: #ffffff;
          font-weight: 500;
        }
        
        .privacy-dashboard__events {
          margin-bottom: 24px;
        }
        
        .privacy-dashboard__events h4 {
          margin: 0 0 12px 0;
          color: #ccc;
          font-size: 14px;
        }
        
        .privacy-dashboard__events-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #333;
          border-radius: 4px;
        }
        
        .privacy-dashboard__event {
          display: grid;
          grid-template-columns: 80px 150px 1fr;
          gap: 12px;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 11px;
        }
        
        .privacy-dashboard__event-time {
          color: #888;
        }
        
        .privacy-dashboard__event-type {
          color: #00ff88;
          font-weight: 600;
        }
        
        .privacy-dashboard__event-data {
          color: #ccc;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .privacy-dashboard__emergency {
          margin-bottom: 24px;
        }
        
        .privacy-dashboard__emergency h4 {
          margin: 0 0 12px 0;
          color: #ff4444;
          font-size: 14px;
        }
        
        .privacy-dashboard__emergency-btn {
          background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .privacy-dashboard__emergency-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
        }
        
        .privacy-dashboard__confirm-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .privacy-dashboard__confirm-content {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
        }
        
        .privacy-dashboard__confirm-content h4 {
          margin: 0 0 16px 0;
          color: #ff4444;
        }
        
        .privacy-dashboard__confirm-content p {
          margin: 0 0 20px 0;
          color: #ccc;
          line-height: 1.5;
        }
        
        .privacy-dashboard__confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .privacy-dashboard__confirm-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .privacy-dashboard__confirm-btn--danger {
          background: #ff4444;
          color: white;
        }
        
        .privacy-dashboard__confirm-btn--cancel {
          background: #333;
          color: #ccc;
        }
        
        .privacy-dashboard__confirm-btn:hover {
          transform: translateY(-1px);
        }
        
        .privacy-dashboard__footer {
          border-top: 1px solid #333;
          padding-top: 16px;
          margin-top: 24px;
          text-align: center;
        }
        
        .privacy-dashboard__footer-text {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #888;
        }
        
        .privacy-dashboard__session-id {
          margin: 0;
          font-size: 10px;
          color: #666;
          font-family: monospace;
        }
        
        .privacy-dashboard__loading,
        .privacy-dashboard__error {
          text-align: center;
          padding: 40px 20px;
        }
        
        .privacy-dashboard__spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #333;
          border-top: 3px solid #00ff88;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        .privacy-dashboard__retry-btn {
          background: #00ff88;
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .privacy-dashboard {
            padding: 16px;
          }
          
          .privacy-dashboard__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .privacy-dashboard__metrics {
            grid-template-columns: 1fr;
          }
          
          .privacy-dashboard__event {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyDashboard;

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <PrivacyDashboard />
 * 
 * // With advanced controls
 * <PrivacyDashboard 
 *   showAdvanced={true}
 *   autoRefresh={true}
 *   refreshInterval={3000}
 *   theme="dark"
 * />
 * 
 * // Light theme
 * <PrivacyDashboard theme="light" />
 * 
 * // Manual refresh only
 * <PrivacyDashboard autoRefresh={false} />
 */