import React, { useState, useEffect } from 'react';
import './styles/piper-dispatch.css';
import { QuantumSecurityProvider } from './services/quantum/QuantumSecurity';
import { PrivacyFirstTracker } from './services/privacy/PrivacyTracker';
import { BlockchainVerification } from './services/blockchain/BlockchainVerification';
import { NeurodiversityOptimizer } from './services/neurodiversity/NeurodiversityOptimizer';

// Import newsletter sections
import TheSignal from './sections/TheSignal';
import CapitalFlowsAndPied from './sections/CapitalFlowsAndPied';
import TheVanguard from './sections/TheVanguard';
import OatsSection from './sections/OatsSection';
import EasternMeridian from './sections/EasternMeridian';
import OnTheEdge from './sections/OnTheEdge';

// Import Special Kit integration
import SpecialKitIntegration from './specialkit/SpecialKitIntegration';

const PiperDispatch = () => {
  const [currentSection, setCurrentSection] = useState('signal');
  const [neurodiversityMode, setNeurodiversityMode] = useState('standard');
  const [privacyToken, setPrivacyToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [specialKitActive, setSpecialKitActive] = useState(false);

  // Initialize privacy-first architecture
  useEffect(() => {
    const initializePrivacyFirst = async () => {
      try {
        // 1. Generate quantum-secured token
        const quantumToken = await QuantumSecurityProvider.generateToken();
        setPrivacyToken(quantumToken);

        // 2. Initialize differential privacy
        await PrivacyFirstTracker.initialize({
          epsilon: 0.05,
          dataPurgeInterval: 15000, // 15 seconds
          onDeviceProcessing: true
        });

        // 3. Set up blockchain verification
        await BlockchainVerification.initialize({
          verificationHash: quantumToken,
          auditTrail: true,
          zeroDataRetention: true
        });

        // 4. Initialize neurodiversity optimization
        const neurodiversitySettings = await NeurodiversityOptimizer.detectPreferences();
        setNeurodiversityMode(neurodiversitySettings.mode);

        // 5. Schedule automatic data purge
        PrivacyFirstTracker.scheduleDataPurge();

      } catch (error) {
        console.error('Privacy initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePrivacyFirst();

    // Cleanup on unmount
    return () => {
      PrivacyFirstTracker.immediateDataPurge();
    };
  }, []);

  // Handle section navigation with privacy tracking
  const handleSectionChange = async (section) => {
    // Track navigation with differential privacy
    await PrivacyFirstTracker.trackNavigation({
      from: currentSection,
      to: section,
      timestamp: Date.now()
    });

    setCurrentSection(section);
  };

  // Handle neurodiversity mode change
  const handleNeurodiversityChange = async (mode) => {
    await NeurodiversityOptimizer.updateMode(mode);
    setNeurodiversityMode(mode);
  };

  // Render current section
  const renderCurrentSection = () => {
    const sectionProps = {
      neurodiversityMode,
      privacyToken,
      specialKitActive
    };

    switch (currentSection) {
      case 'signal':
        return <TheSignal {...sectionProps} />;
      case 'capital':
        return <CapitalFlowsAndPied {...sectionProps} />;
      case 'vanguard':
        return <TheVanguard {...sectionProps} />;
      case 'oats':
        return <OatsSection {...sectionProps} />;
      case 'meridian':
        return <EasternMeridian {...sectionProps} />;
      case 'edge':
        return <OnTheEdge {...sectionProps} />;
      default:
        return <TheSignal {...sectionProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="piper-dispatch-loading">
        <div className="quantum-loader">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>
        <p>Initializing privacy-first architecture...</p>
        <div className="privacy-status">
          <span className="status-indicator">🔒</span>
          <span>Zero data retention • GDPR-Plus compliant</span>
        </div>
      </div>
    );
  }

  return (
    <QuantumSecurityProvider token={privacyToken}>
      <div className={`piper-dispatch ${neurodiversityMode}-mode`}>
        {/* Header with privacy indicators */}
        <header className="dispatch-header">
          <div className="header-content">
            <h1 className="dispatch-title">
              <span className="title-main">Piper Dispatch</span>
              <span className="title-subtitle">Privacy-First Newsletter</span>
            </h1>
            
            <div className="privacy-indicators">
              <div className="privacy-badge">
                <span className="badge-icon">🛡️</span>
                <span className="badge-text">Quantum-Secured</span>
              </div>
              <div className="privacy-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">Zero Data Retention</span>
              </div>
              <div className="privacy-badge">
                <span className="badge-icon">⚡</span>
                <span className="badge-text">15s Data Purge</span>
              </div>
            </div>
          </div>

          {/* Neurodiversity controls */}
          <div className="neurodiversity-controls">
            <label htmlFor="neurodiversity-mode">Accessibility Mode:</label>
            <select 
              id="neurodiversity-mode"
              value={neurodiversityMode}
              onChange={(e) => handleNeurodiversityChange(e.target.value)}
              className="neurodiversity-selector"
            >
              <option value="standard">Standard</option>
              <option value="adhd">ADHD-Friendly</option>
              <option value="dyslexia">Dyslexia-Optimized</option>
              <option value="asd">ASD-Structured</option>
            </select>
          </div>
        </header>

        {/* Navigation */}
        <nav className="dispatch-navigation">
          <div className="nav-sections">
            <button 
              className={`nav-button ${currentSection === 'signal' ? 'active' : ''}`}
              onClick={() => handleSectionChange('signal')}
            >
              <span className="nav-icon">📡</span>
              <span className="nav-text">The Signal</span>
            </button>
            <button 
              className={`nav-button ${currentSection === 'capital' ? 'active' : ''}`}
              onClick={() => handleSectionChange('capital')}
            >
              <span className="nav-icon">💰</span>
              <span className="nav-text">Capital Flows & Pied</span>
            </button>
            <button 
              className={`nav-button ${currentSection === 'vanguard' ? 'active' : ''}`}
              onClick={() => handleSectionChange('vanguard')}
            >
              <span className="nav-icon">🚀</span>
              <span className="nav-text">The Vanguard</span>
            </button>
            <button 
              className={`nav-button ${currentSection === 'oats' ? 'active' : ''}`}
              onClick={() => handleSectionChange('oats')}
            >
              <span className="nav-icon">🌾</span>
              <span className="nav-text">Oats Section</span>
            </button>
            <button 
              className={`nav-button ${currentSection === 'meridian' ? 'active' : ''}`}
              onClick={() => handleSectionChange('meridian')}
            >
              <span className="nav-icon">🧭</span>
              <span className="nav-text">Eastern Meridian</span>
            </button>
            <button 
              className={`nav-button ${currentSection === 'edge' ? 'active' : ''}`}
              onClick={() => handleSectionChange('edge')}
            >
              <span className="nav-icon">⚡</span>
              <span className="nav-text">On the Edge</span>
            </button>
          </div>

          {/* Special Kit toggle */}
          <div className="special-kit-toggle">
            <button 
              className={`kit-toggle ${specialKitActive ? 'active' : ''}`}
              onClick={() => setSpecialKitActive(!specialKitActive)}
            >
              <span className="kit-icon">🎯</span>
              <span className="kit-text">Special Kit</span>
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main className="dispatch-content">
          {renderCurrentSection()}
        </main>

        {/* Special Kit integration */}
        {specialKitActive && (
          <SpecialKitIntegration 
            currentSection={currentSection}
            neurodiversityMode={neurodiversityMode}
            privacyToken={privacyToken}
          />
        )}

        {/* Privacy footer */}
        <footer className="dispatch-footer">
          <div className="privacy-guarantee">
            <p>🔒 <strong>Privacy Guarantee:</strong> No personal data stored • 15-second automatic data purge • GDPR-Plus compliant</p>
            <p>🛡️ <strong>Security:</strong> Quantum-resistant encryption • Blockchain verification • Zero-knowledge architecture</p>
          </div>
          
          <div className="verification-link">
            <a href={`https://piperdispatch.com/audit/${privacyToken}`} target="_blank" rel="noopener noreferrer">
              Verify Privacy Compliance
            </a>
          </div>
        </footer>
      </div>
    </QuantumSecurityProvider>
  );
};

export default PiperDispatch;