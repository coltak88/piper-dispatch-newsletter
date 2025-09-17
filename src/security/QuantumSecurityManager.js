import React, { useState, useEffect, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Quantum Security Context
const QuantumSecurityContext = createContext();

export const useQuantumSecurity = () => {
  const context = useContext(QuantumSecurityContext);
  if (!context) {
    throw new Error('useQuantumSecurity must be used within QuantumSecurityProvider');
  }
  return context;
};

// Quantum Security Provider
export const QuantumSecurityProvider = ({ children }) => {
  const [securityLevel, setSecurityLevel] = useState('standard');
  const [encryptionStatus, setEncryptionStatus] = useState('active');
  const [threatLevel, setThreatLevel] = useState('low');
  const [quantumReadiness, setQuantumReadiness] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState({
    encryptionStrength: 256,
    keyRotationInterval: 24,
    threatDetectionAccuracy: 99.7,
    quantumResistance: 85
  });

  // Simulate quantum security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate security metrics updates
      setSecurityMetrics(prev => ({
        ...prev,
        threatDetectionAccuracy: Math.min(99.9, prev.threatDetectionAccuracy + Math.random() * 0.1),
        quantumResistance: Math.min(100, prev.quantumResistance + Math.random() * 0.5)
      }));

      // Simulate threat level changes
      const threats = ['low', 'medium', 'high'];
      const randomThreat = threats[Math.floor(Math.random() * threats.length)];
      if (Math.random() < 0.1) { // 10% chance of threat level change
        setThreatLevel(randomThreat);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const upgradeSecurityLevel = (level) => {
    setSecurityLevel(level);
    if (level === 'quantum') {
      setQuantumReadiness(true);
      setSecurityMetrics(prev => ({
        ...prev,
        encryptionStrength: 512,
        quantumResistance: 100
      }));
    }
  };

  const rotateEncryptionKeys = () => {
    setEncryptionStatus('rotating');
    setTimeout(() => {
      setEncryptionStatus('active');
    }, 2000);
  };

  const performSecurityScan = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scanResults = {
          vulnerabilities: Math.floor(Math.random() * 3),
          patchesRequired: Math.floor(Math.random() * 5),
          complianceScore: Math.floor(Math.random() * 20) + 80,
          quantumThreatLevel: Math.floor(Math.random() * 30) + 70
        };
        resolve(scanResults);
      }, 3000);
    });
  };

  const value = {
    securityLevel,
    encryptionStatus,
    threatLevel,
    quantumReadiness,
    securityMetrics,
    upgradeSecurityLevel,
    rotateEncryptionKeys,
    performSecurityScan
  };

  return (
    <QuantumSecurityContext.Provider value={value}>
      {children}
    </QuantumSecurityContext.Provider>
  );
};

// Quantum Security Manager Component
const QuantumSecurityManager = ({ isVisible, onClose }) => {
  const {
    securityLevel,
    encryptionStatus,
    threatLevel,
    quantumReadiness,
    securityMetrics,
    upgradeSecurityLevel,
    rotateEncryptionKeys,
    performSecurityScan
  } = useQuantumSecurity();

  const [activeTab, setActiveTab] = useState('overview');
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      message: 'Quantum encryption protocols initialized',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      type: 'warning',
      message: 'Key rotation scheduled in 2 hours',
      timestamp: new Date(Date.now() - 600000)
    }
  ]);

  const handleSecurityScan = async () => {
    setIsScanning(true);
    try {
      const results = await performSecurityScan();
      setScanResults(results);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: 'Security scan completed successfully',
        timestamp: new Date()
      }, ...prev]);
    } catch (error) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: 'Security scan failed',
        timestamp: new Date()
      }, ...prev]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyRotation = () => {
    rotateEncryptionKeys();
    setNotifications(prev => [{
      id: Date.now(),
      type: 'info',
      message: 'Encryption key rotation initiated',
      timestamp: new Date()
    }, ...prev]);
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'low': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'high': return '#f56565';
      default: return '#718096';
    }
  };

  const getSecurityLevelIcon = (level) => {
    switch (level) {
      case 'basic': return '🔒';
      case 'standard': return '🛡️';
      case 'advanced': return '⚡';
      case 'quantum': return '🔮';
      default: return '🔒';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="quantum-security-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="quantum-security-panel"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="security-header">
            <div className="header-title">
              <span className="quantum-icon">🔮</span>
              <h2>Quantum Security Manager</h2>
              <span className={`status-indicator status-${encryptionStatus}`}>
                {encryptionStatus === 'active' ? '🟢' : '🟡'}
              </span>
            </div>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>

          {/* Navigation Tabs */}
          <div className="security-tabs">
            {['overview', 'encryption', 'threats', 'compliance'].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="security-content">
            {activeTab === 'overview' && (
              <motion.div
                className="overview-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="security-metrics">
                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">🔐</span>
                      <span className="metric-label">Security Level</span>
                    </div>
                    <div className="metric-value">
                      {getSecurityLevelIcon(securityLevel)} {securityLevel.toUpperCase()}
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">⚠️</span>
                      <span className="metric-label">Threat Level</span>
                    </div>
                    <div 
                      className="metric-value"
                      style={{ color: getThreatLevelColor(threatLevel) }}
                    >
                      {threatLevel.toUpperCase()}
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">🛡️</span>
                      <span className="metric-label">Quantum Ready</span>
                    </div>
                    <div className="metric-value">
                      {quantumReadiness ? '✅ YES' : '⏳ PREPARING'}
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">📊</span>
                      <span className="metric-label">Detection Accuracy</span>
                    </div>
                    <div className="metric-value">
                      {securityMetrics.threatDetectionAccuracy.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    className="action-button primary"
                    onClick={handleSecurityScan}
                    disabled={isScanning}
                  >
                    {isScanning ? '🔄 Scanning...' : '🔍 Run Security Scan'}
                  </button>
                  <button 
                    className="action-button secondary"
                    onClick={handleKeyRotation}
                    disabled={encryptionStatus === 'rotating'}
                  >
                    {encryptionStatus === 'rotating' ? '🔄 Rotating...' : '🔑 Rotate Keys'}
                  </button>
                </div>

                {scanResults && (
                  <motion.div
                    className="scan-results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h4>Latest Scan Results</h4>
                    <div className="results-grid">
                      <div className="result-item">
                        <span className="result-label">Vulnerabilities</span>
                        <span className="result-value">{scanResults.vulnerabilities}</span>
                      </div>
                      <div className="result-item">
                        <span className="result-label">Patches Required</span>
                        <span className="result-value">{scanResults.patchesRequired}</span>
                      </div>
                      <div className="result-item">
                        <span className="result-label">Compliance Score</span>
                        <span className="result-value">{scanResults.complianceScore}%</span>
                      </div>
                      <div className="result-item">
                        <span className="result-label">Quantum Threat Level</span>
                        <span className="result-value">{scanResults.quantumThreatLevel}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'encryption' && (
              <motion.div
                className="encryption-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="encryption-status">
                  <h4>Encryption Configuration</h4>
                  <div className="config-grid">
                    <div className="config-item">
                      <label>Encryption Strength</label>
                      <span>{securityMetrics.encryptionStrength}-bit</span>
                    </div>
                    <div className="config-item">
                      <label>Key Rotation Interval</label>
                      <span>{securityMetrics.keyRotationInterval} hours</span>
                    </div>
                    <div className="config-item">
                      <label>Quantum Resistance</label>
                      <span>{securityMetrics.quantumResistance}%</span>
                    </div>
                  </div>
                </div>

                <div className="security-levels">
                  <h4>Security Level Upgrade</h4>
                  <div className="level-options">
                    {['basic', 'standard', 'advanced', 'quantum'].map((level) => (
                      <button
                        key={level}
                        className={`level-button ${securityLevel === level ? 'active' : ''}`}
                        onClick={() => upgradeSecurityLevel(level)}
                      >
                        {getSecurityLevelIcon(level)} {level.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'threats' && (
              <motion.div
                className="threats-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="threat-monitor">
                  <h4>Threat Monitoring</h4>
                  <div className="threat-indicator">
                    <div 
                      className="threat-level-bar"
                      style={{ 
                        backgroundColor: getThreatLevelColor(threatLevel),
                        width: threatLevel === 'low' ? '30%' : threatLevel === 'medium' ? '60%' : '90%'
                      }}
                    />
                    <span className="threat-label">Current Threat Level: {threatLevel.toUpperCase()}</span>
                  </div>
                </div>

                <div className="notifications-panel">
                  <h4>Security Notifications</h4>
                  <div className="notifications-list">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className={`notification notification-${notification.type}`}>
                        <div className="notification-content">
                          <span className="notification-message">{notification.message}</span>
                          <span className="notification-time">
                            {notification.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'compliance' && (
              <motion.div
                className="compliance-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="compliance-status">
                  <h4>Compliance Status</h4>
                  <div className="compliance-items">
                    <div className="compliance-item">
                      <span className="compliance-label">GDPR Compliance</span>
                      <span className="compliance-status-badge compliant">✅ Compliant</span>
                    </div>
                    <div className="compliance-item">
                      <span className="compliance-label">SOC 2 Type II</span>
                      <span className="compliance-status-badge compliant">✅ Certified</span>
                    </div>
                    <div className="compliance-item">
                      <span className="compliance-label">ISO 27001</span>
                      <span className="compliance-status-badge pending">⏳ In Progress</span>
                    </div>
                    <div className="compliance-item">
                      <span className="compliance-label">NIST Framework</span>
                      <span className="compliance-status-badge compliant">✅ Aligned</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Styles */}
        <style jsx>{`
          .quantum-security-overlay {
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

          .quantum-security-panel {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          }

          .security-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .quantum-icon {
            font-size: 24px;
          }

          .header-title h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .status-indicator {
            font-size: 12px;
          }

          .close-button {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .close-button:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .security-tabs {
            display: flex;
            background: #f7fafc;
            border-bottom: 1px solid #e2e8f0;
          }

          .tab-button {
            flex: 1;
            padding: 16px;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            color: #718096;
            transition: all 0.2s ease;
          }

          .tab-button.active {
            background: white;
            color: #667eea;
            border-bottom: 2px solid #667eea;
          }

          .tab-button:hover {
            background: #edf2f7;
          }

          .security-content {
            padding: 24px;
            max-height: 60vh;
            overflow-y: auto;
          }

          .security-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }

          .metric-card {
            background: #f7fafc;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }

          .metric-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .metric-icon {
            font-size: 16px;
          }

          .metric-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .metric-value {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
          }

          .action-buttons {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }

          .action-button {
            flex: 1;
            padding: 12px 16px;
            border-radius: 8px;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .action-button.primary {
            background: #667eea;
            color: white;
          }

          .action-button.primary:hover {
            background: #5a67d8;
          }

          .action-button.secondary {
            background: #e2e8f0;
            color: #4a5568;
          }

          .action-button.secondary:hover {
            background: #cbd5e0;
          }

          .action-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .scan-results {
            background: #f7fafc;
            border-radius: 12px;
            padding: 20px;
          }

          .scan-results h4 {
            margin: 0 0 16px 0;
            color: #2d3748;
          }

          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .result-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px;
            background: white;
            border-radius: 8px;
          }

          .result-label {
            font-size: 12px;
            color: #718096;
            margin-bottom: 4px;
          }

          .result-value {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
          }

          .encryption-status,
          .security-levels,
          .threat-monitor,
          .notifications-panel,
          .compliance-status {
            margin-bottom: 24px;
          }

          .encryption-status h4,
          .security-levels h4,
          .threat-monitor h4,
          .notifications-panel h4,
          .compliance-status h4 {
            margin: 0 0 16px 0;
            color: #2d3748;
          }

          .config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }

          .config-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #f7fafc;
            border-radius: 8px;
          }

          .config-item label {
            font-weight: 500;
            color: #4a5568;
          }

          .config-item span {
            font-weight: 600;
            color: #2d3748;
          }

          .level-options {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .level-button {
            padding: 8px 16px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .level-button.active {
            border-color: #667eea;
            background: #667eea;
            color: white;
          }

          .level-button:hover {
            border-color: #cbd5e0;
          }

          .threat-indicator {
            background: #f7fafc;
            border-radius: 12px;
            padding: 20px;
            position: relative;
          }

          .threat-level-bar {
            height: 8px;
            border-radius: 4px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
          }

          .threat-label {
            font-weight: 500;
            color: #2d3748;
          }

          .notifications-list {
            max-height: 200px;
            overflow-y: auto;
          }

          .notification {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            border-left: 4px solid;
          }

          .notification-info {
            background: #ebf8ff;
            border-left-color: #3182ce;
          }

          .notification-warning {
            background: #fffbeb;
            border-left-color: #d69e2e;
          }

          .notification-success {
            background: #f0fff4;
            border-left-color: #38a169;
          }

          .notification-error {
            background: #fed7d7;
            border-left-color: #e53e3e;
          }

          .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .notification-message {
            font-weight: 500;
            color: #2d3748;
          }

          .notification-time {
            font-size: 12px;
            color: #718096;
          }

          .compliance-items {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .compliance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #f7fafc;
            border-radius: 8px;
          }

          .compliance-label {
            font-weight: 500;
            color: #2d3748;
          }

          .compliance-status-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .compliance-status-badge.compliant {
            background: #c6f6d5;
            color: #22543d;
          }

          .compliance-status-badge.pending {
            background: #feebc8;
            color: #744210;
          }

          @media (max-width: 768px) {
            .quantum-security-panel {
              width: 95%;
              margin: 20px;
            }

            .security-metrics {
              grid-template-columns: 1fr;
            }

            .action-buttons {
              flex-direction: column;
            }

            .level-options {
              justify-content: center;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuantumSecurityManager;