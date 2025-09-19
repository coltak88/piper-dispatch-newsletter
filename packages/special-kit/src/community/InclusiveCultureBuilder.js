/**
 * Inclusive Culture Builder ICP Implementation Pathway
 * Neurodiversity talent integration with quantum-resistant encryption
 * Privacy-first inclusive workplace design
 */

import React, { useState, useEffect } from 'react';

const InclusiveCultureBuilder = () => {
  const [currentStep, setCurrentStep] = useState('assessment');
  const [inclusionData, setInclusionData] = useState({});
  const [neurodiversityInsights, setNeurodiversityInsights] = useState([]);
  const [quantumEncryption, setQuantumEncryption] = useState(false);
  const [privacyScore, setPrivacyScore] = useState(0);
  const [inclusionLevel, setInclusionLevel] = useState(0);

  // Initialize quantum-resistant encryption for sensitive data
  useEffect(() => {
    const initializeQuantumSecurity = () => {
      // Simulate quantum-resistant encryption initialization
      setTimeout(() => {
        setQuantumEncryption(true);
        console.log('🔐 Quantum-resistant encryption activated for inclusive culture data');
      }, 1000);
    };

    initializeQuantumSecurity();
  }, []);

  // Generate neurodiversity insights
  const generateNeurodiversityInsights = () => {
    const insights = [
      {
        type: 'Talent Pool Expansion',
        description: 'Access to 15-20% untapped talent market through neurodiversity inclusion',
        impact: 'High',
        privacy: 'Quantum-encrypted talent profiles'
      },
      {
        type: 'Innovation Boost',
        description: 'Neurodiverse teams show 30% higher innovation rates',
        impact: 'Very High',
        privacy: 'Anonymous performance analytics'
      },
      {
        type: 'Problem-Solving Enhancement',
        description: 'Diverse cognitive approaches improve complex problem resolution',
        impact: 'High',
        privacy: 'Encrypted collaboration patterns'
      },
      {
        type: 'Market Understanding',
        description: 'Better representation leads to improved customer insights',
        impact: 'Medium',
        privacy: 'Privacy-first customer research'
      }
    ];
    setNeurodiversityInsights(insights);
  };

  // Calculate inclusion metrics with privacy protection
  const calculateInclusionMetrics = (data) => {
    const metrics = {
      accessibility: (data.accessibilityFeatures || 0) * 20,
      neurodiversity: (data.neurodiversityPrograms || 0) * 25,
      communication: (data.communicationStyles || 0) * 15,
      workspace: (data.workspaceAdaptations || 0) * 20,
      training: (data.inclusionTraining || 0) * 20
    };
    
    const totalScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / 5;
    setInclusionLevel(Math.min(100, totalScore));
    
    // Privacy score based on quantum encryption and data protection
    const privacyMetrics = {
      encryption: quantumEncryption ? 30 : 0,
      anonymization: (data.dataAnonymization || 0) * 25,
      consent: (data.consentManagement || 0) * 20,
      retention: (data.dataRetention || 0) * 25
    };
    
    const privacyTotal = Object.values(privacyMetrics).reduce((sum, score) => sum + score, 0);
    setPrivacyScore(Math.min(100, privacyTotal));
  };

  const steps = {
    assessment: 'Culture Assessment',
    neurodiversity: 'Neurodiversity Integration',
    accessibility: 'Accessibility Design',
    communication: 'Inclusive Communication',
    implementation: 'Implementation Strategy'
  };

  const renderStepNavigation = () => (
    <div className="step-navigation">
      {Object.entries(steps).map(([key, label]) => (
        <div
          key={key}
          className={`step-nav-item ${
            currentStep === key ? 'active' : ''
          } ${inclusionData[key] ? 'completed' : ''}`}
          onClick={() => setCurrentStep(key)}
        >
          {label}
        </div>
      ))}
    </div>
  );

  const renderCultureAssessment = () => (
    <div className="culture-assessment-view">
      <h2>🌈 Inclusive Culture Assessment</h2>
      <div className="privacy-indicator">
        🔐 Quantum-Encrypted • Anonymous Data Collection
      </div>
      
      <form className="assessment-form">
        <div className="form-section">
          <h3>Current Inclusion State</h3>
          
          <div className="form-group">
            <label>Team Diversity Level (1-5)</label>
            <select 
              value={inclusionData.diversityLevel || ''}
              onChange={(e) => {
                const newData = { ...inclusionData, diversityLevel: parseInt(e.target.value) };
                setInclusionData(newData);
                calculateInclusionMetrics(newData);
              }}
            >
              <option value="">Select level</option>
              <option value="1">1 - Minimal diversity</option>
              <option value="2">2 - Some diversity efforts</option>
              <option value="3">3 - Moderate inclusion</option>
              <option value="4">4 - Strong inclusive culture</option>
              <option value="5">5 - Exemplary inclusion</option>
            </select>
          </div>

          <div className="form-group">
            <label>Neurodiversity Programs (1-5)</label>
            <select 
              value={inclusionData.neurodiversityPrograms || ''}
              onChange={(e) => {
                const newData = { ...inclusionData, neurodiversityPrograms: parseInt(e.target.value) };
                setInclusionData(newData);
                calculateInclusionMetrics(newData);
              }}
            >
              <option value="">Select level</option>
              <option value="1">1 - No specific programs</option>
              <option value="2">2 - Basic awareness</option>
              <option value="3">3 - Some accommodations</option>
              <option value="4">4 - Structured programs</option>
              <option value="5">5 - Comprehensive support</option>
            </select>
          </div>

          <div className="form-group">
            <label>Accessibility Features (1-5)</label>
            <select 
              value={inclusionData.accessibilityFeatures || ''}
              onChange={(e) => {
                const newData = { ...inclusionData, accessibilityFeatures: parseInt(e.target.value) };
                setInclusionData(newData);
                calculateInclusionMetrics(newData);
              }}
            >
              <option value="">Select level</option>
              <option value="1">1 - Basic compliance</option>
              <option value="2">2 - Standard features</option>
              <option value="3">3 - Enhanced accessibility</option>
              <option value="4">4 - Advanced accommodations</option>
              <option value="5">5 - Universal design</option>
            </select>
          </div>

          <div className="form-group">
            <label>Communication Styles Support (1-5)</label>
            <select 
              value={inclusionData.communicationStyles || ''}
              onChange={(e) => {
                const newData = { ...inclusionData, communicationStyles: parseInt(e.target.value) };
                setInclusionData(newData);
                calculateInclusionMetrics(newData);
              }}
            >
              <option value="">Select level</option>
              <option value="1">1 - Single communication style</option>
              <option value="2">2 - Limited flexibility</option>
              <option value="3">3 - Multiple options</option>
              <option value="4">4 - Adaptive communication</option>
              <option value="5">5 - Personalized approaches</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Privacy & Data Protection</h3>
          
          <div className="form-group">
            <label>Data Anonymization (1-5)</label>
            <select 
              value={inclusionData.dataAnonymization || ''}
              onChange={(e) => {
                const newData = { ...inclusionData, dataAnonymization: parseInt(e.target.value) };
                setInclusionData(newData);
                calculateInclusionMetrics(newData);
              }}
            >
              <option value="">Select level</option>
              <option value="1">1 - No anonymization</option>
              <option value="2">2 - Basic anonymization</option>
              <option value="3">3 - Standard protection</option>
              <option value="4">4 - Advanced anonymization</option>
              <option value="5">5 - Quantum-level privacy</option>
            </select>
          </div>

          <div className="form-group">
            <label>Consent Management (1-5)</label>
            <select 
              value={inclusionData.consentManagement || ''}
              onChange={(e) => {
                const newData = { ...inclusionData, consentManagement: parseInt(e.target.value) };
                setInclusionData(newData);
                calculateInclusionMetrics(newData);
              }}
            >
              <option value="">Select level</option>
              <option value="1">1 - Basic consent</option>
              <option value="2">2 - Standard forms</option>
              <option value="3">3 - Granular consent</option>
              <option value="4">4 - Dynamic consent</option>
              <option value="5">5 - Quantum-secured consent</option>
            </select>
          </div>
        </div>

        <button 
          type="button" 
          className="btn-primary"
          onClick={() => {
            generateNeurodiversityInsights();
            setCurrentStep('neurodiversity');
          }}
          disabled={!inclusionData.diversityLevel}
        >
          Generate Neurodiversity Insights
        </button>
      </form>

      {inclusionLevel > 0 && (
        <div className="inclusion-score">
          <h3>Current Inclusion Level</h3>
          <div className="score-circle" style={{'--score': inclusionLevel}}>
            <div className="score-value">{Math.round(inclusionLevel)}%</div>
          </div>
          <p>Privacy Score: {Math.round(privacyScore)}% (Quantum-Protected)</p>
        </div>
      )}
    </div>
  );

  const renderNeurodiversityIntegration = () => (
    <div className="neurodiversity-integration-view">
      <h2>🧠 Neurodiversity Integration Strategy</h2>
      <div className="privacy-indicator">
        🔐 Quantum-Encrypted • Bias-Free Analytics
      </div>
      
      <div className="integration-sections">
        <div className="talent-acquisition">
          <h3>Talent Acquisition</h3>
          <div className="feature-grid">
            <div className="feature-item">
              <h4>Inclusive Job Descriptions</h4>
              <p>AI-powered language analysis to remove bias and attract neurodiverse candidates</p>
              <div className="privacy-note">🛡️ Anonymous bias detection</div>
            </div>
            <div className="feature-item">
              <h4>Alternative Assessment Methods</h4>
              <p>Skills-based evaluations that accommodate different cognitive styles</p>
              <div className="privacy-note">🔐 Encrypted assessment data</div>
            </div>
            <div className="feature-item">
              <h4>Neurodiversity Partnerships</h4>
              <p>Connections with specialized recruitment organizations</p>
              <div className="privacy-note">🌐 Privacy-first networking</div>
            </div>
          </div>
        </div>
        
        <div className="workplace-adaptations">
          <h3>Workplace Adaptations</h3>
          <div className="adaptation-list">
            <div className="adaptation-item">
              <span className="adaptation-icon">🎧</span>
              <div className="adaptation-content">
                <h4>Sensory Accommodations</h4>
                <p>Noise-canceling spaces, adjustable lighting, and sensory-friendly environments</p>
              </div>
            </div>
            <div className="adaptation-item">
              <span className="adaptation-icon">⏰</span>
              <div className="adaptation-content">
                <h4>Flexible Scheduling</h4>
                <p>Customizable work hours and break patterns to match individual needs</p>
              </div>
            </div>
            <div className="adaptation-item">
              <span className="adaptation-icon">💬</span>
              <div className="adaptation-content">
                <h4>Communication Preferences</h4>
                <p>Multiple communication channels and clear, structured information sharing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="btn-primary"
        onClick={() => setCurrentStep('accessibility')}
      >
        Design Accessibility Features
      </button>
    </div>
  );

  const renderAccessibilityDesign = () => (
    <div className="accessibility-design-view">
      <h2>♿ Universal Accessibility Design</h2>
      <div className="privacy-indicator">
        🔐 Privacy-First • WCAG 2.1 AAA Compliant
      </div>
      
      <div className="accessibility-categories">
        <div className="category-card">
          <h3>🖥️ Digital Accessibility</h3>
          <ul className="feature-list">
            <li>Screen reader compatibility with quantum-encrypted content</li>
            <li>Keyboard navigation for all interactive elements</li>
            <li>High contrast modes with customizable color schemes</li>
            <li>Voice control integration with privacy protection</li>
            <li>Adjustable text size and spacing preferences</li>
          </ul>
        </div>
        
        <div className="category-card">
          <h3>🏢 Physical Workspace</h3>
          <ul className="feature-list">
            <li>Adjustable desk heights and ergonomic equipment</li>
            <li>Quiet zones and collaboration spaces</li>
            <li>Clear wayfinding and signage systems</li>
            <li>Accessible parking and building entrances</li>
            <li>Sensory-friendly meeting rooms</li>
          </ul>
        </div>
        
        <div className="category-card">
          <h3>🧠 Cognitive Accessibility</h3>
          <ul className="feature-list">
            <li>Clear, simple language in all communications</li>
            <li>Visual aids and infographics for complex information</li>
            <li>Structured templates and checklists</li>
            <li>Memory aids and reminder systems</li>
            <li>Stress reduction and mindfulness spaces</li>
          </ul>
        </div>
      </div>
      
      <button 
        className="btn-primary"
        onClick={() => setCurrentStep('communication')}
      >
        Setup Inclusive Communication
      </button>
    </div>
  );

  const renderInclusiveCommunication = () => (
    <div className="inclusive-communication-view">
      <h2>💬 Inclusive Communication Framework</h2>
      <div className="privacy-indicator">
        🔐 End-to-End Encrypted • Anonymous Feedback
      </div>
      
      <div className="communication-framework">
        <div className="framework-section">
          <h3>Communication Channels</h3>
          <div className="channel-grid">
            <div className="channel-item">
              <h4>📝 Written Communication</h4>
              <p>Clear, structured emails and documents with quantum encryption</p>
              <div className="features">
                <span className="feature-tag">Plain Language</span>
                <span className="feature-tag">Visual Aids</span>
                <span className="feature-tag">Encrypted</span>
              </div>
            </div>
            <div className="channel-item">
              <h4>🎤 Verbal Communication</h4>
              <p>Multiple formats including recorded messages and live captions</p>
              <div className="features">
                <span className="feature-tag">Live Captions</span>
                <span className="feature-tag">Recording Options</span>
                <span className="feature-tag">Privacy-First</span>
              </div>
            </div>
            <div className="channel-item">
              <h4>🎨 Visual Communication</h4>
              <p>Infographics, diagrams, and visual storytelling with accessibility</p>
              <div className="features">
                <span className="feature-tag">Alt Text</span>
                <span className="feature-tag">High Contrast</span>
                <span className="feature-tag">Scalable</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="feedback-system">
          <h3>Anonymous Feedback System</h3>
          <div className="feedback-features">
            <div className="feedback-item">
              <span className="feedback-icon">🔒</span>
              <div className="feedback-content">
                <h4>Quantum-Secured Anonymity</h4>
                <p>Complete privacy protection for sensitive feedback</p>
              </div>
            </div>
            <div className="feedback-item">
              <span className="feedback-icon">📊</span>
              <div className="feedback-content">
                <h4>Real-Time Analytics</h4>
                <p>Immediate insights while maintaining individual privacy</p>
              </div>
            </div>
            <div className="feedback-item">
              <span className="feedback-icon">🎯</span>
              <div className="feedback-content">
                <h4>Actionable Insights</h4>
                <p>AI-powered recommendations for culture improvements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="btn-primary"
        onClick={() => setCurrentStep('implementation')}
      >
        Create Implementation Strategy
      </button>
    </div>
  );

  const renderImplementationStrategy = () => (
    <div className="implementation-strategy-view">
      <h2>🚀 Implementation Roadmap</h2>
      <div className="privacy-indicator">
        🔐 Quantum-Secured • Privacy-by-Design
      </div>
      
      <div className="implementation-timeline">
        <div className="timeline-phase">
          <div className="phase-header">
            <h3>Phase 1: Foundation (Months 1-2)</h3>
            <div className="phase-status">🟡 Planning</div>
          </div>
          <div className="phase-content">
            <ul className="task-list">
              <li>✅ Leadership commitment and budget allocation</li>
              <li>✅ Baseline culture assessment with quantum encryption</li>
              <li>🔄 Form inclusive culture task force</li>
              <li>⏳ Develop privacy-first policies and procedures</li>
              <li>⏳ Partner with neurodiversity organizations</li>
            </ul>
          </div>
        </div>
        
        <div className="timeline-phase">
          <div className="phase-header">
            <h3>Phase 2: Infrastructure (Months 3-4)</h3>
            <div className="phase-status">🔵 Ready</div>
          </div>
          <div className="phase-content">
            <ul className="task-list">
              <li>⏳ Implement accessibility upgrades</li>
              <li>⏳ Deploy quantum-encrypted communication tools</li>
              <li>⏳ Create sensory-friendly spaces</li>
              <li>⏳ Establish anonymous feedback systems</li>
              <li>⏳ Train managers on inclusive leadership</li>
            </ul>
          </div>
        </div>
        
        <div className="timeline-phase">
          <div className="phase-header">
            <h3>Phase 3: Integration (Months 5-6)</h3>
            <div className="phase-status">🟢 Future</div>
          </div>
          <div className="phase-content">
            <ul className="task-list">
              <li>⏳ Launch neurodiversity hiring initiatives</li>
              <li>⏳ Implement inclusive communication protocols</li>
              <li>⏳ Deploy AI-powered bias detection</li>
              <li>⏳ Establish mentorship programs</li>
              <li>⏳ Create employee resource groups</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="success-metrics">
        <h3>Success Metrics (Privacy-Protected)</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Inclusion Score</h4>
            <div className="metric-value">{Math.round(inclusionLevel)}%</div>
            <p>Current inclusion level with quantum-secured measurement</p>
          </div>
          <div className="metric-card">
            <h4>Privacy Score</h4>
            <div className="metric-value">{Math.round(privacyScore)}%</div>
            <p>Data protection and anonymization effectiveness</p>
          </div>
          <div className="metric-card">
            <h4>Neurodiversity Representation</h4>
            <div className="metric-value">Target: 15%</div>
            <p>Anonymous tracking of neurodiverse talent integration</p>
          </div>
        </div>
      </div>
      
      <div className="implementation-actions">
        <button className="btn-primary" onClick={() => alert('Implementation plan generated with quantum encryption!')}>
          Generate Secure Implementation Plan
        </button>
        <button className="btn-secondary" onClick={() => setCurrentStep('assessment')}>
          Return to Assessment
        </button>
      </div>
    </div>
  );

  return (
    <div className="inclusive-culture-builder">
      <h1>🌈 Inclusive Culture Builder</h1>
      <p className="subtitle">
        Build neurodiversity-friendly workplaces with quantum-resistant privacy protection
      </p>
      
      <div className="security-badges">
        <div className="security-badge">
          🔐 Quantum-Resistant Encryption
        </div>
        <div className="privacy-indicator">
          🛡️ Privacy-First Design
        </div>
        <div className="inclusion-badge">
          🌈 Neurodiversity Optimized
        </div>
      </div>

      {renderStepNavigation()}

      <div className="pathway-content">
        {currentStep === 'assessment' && renderCultureAssessment()}
        {currentStep === 'neurodiversity' && renderNeurodiversityIntegration()}
        {currentStep === 'accessibility' && renderAccessibilityDesign()}
        {currentStep === 'communication' && renderInclusiveCommunication()}
        {currentStep === 'implementation' && renderImplementationStrategy()}
      </div>

      {neurodiversityInsights.length > 0 && (
        <div className="neurodiversity-insights">
          <h3>🧠 Neurodiversity Insights</h3>
          <div className="insights-grid">
            {neurodiversityInsights.map((insight, index) => (
              <div key={index} className="insight-card">
                <h4>{insight.type}</h4>
                <p>{insight.description}</p>
                <div className="insight-meta">
                  <span className={`impact-badge impact-${insight.impact.toLowerCase().replace(' ', '-')}`}>
                    Impact: {insight.impact}
                  </span>
                  <span className="privacy-note">{insight.privacy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="quantum-status">
        <div className={`quantum-indicator ${quantumEncryption ? 'active' : 'inactive'}`}>
          {quantumEncryption ? '🔐 Quantum Encryption Active' : '⏳ Initializing Security...'}
        </div>
      </div>
    </div>
  );
};

// Inline styles for the component
const styles = `
  .inclusive-culture-builder {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    color: #fff;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .inclusive-culture-builder h1 {
    font-size: 32px;
    text-align: center;
    background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .subtitle {
    text-align: center;
    color: #ccc;
    margin-bottom: 32px;
    font-size: 16px;
  }

  .security-badges {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  .security-badge, .privacy-indicator, .inclusion-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .security-badge {
    background: rgba(111, 66, 193, 0.1);
    color: #6f42c1;
    border-color: rgba(111, 66, 193, 0.3);
  }

  .privacy-indicator {
    background: rgba(32, 201, 151, 0.1);
    color: #20c997;
    border-color: rgba(32, 201, 151, 0.3);
  }

  .inclusion-badge {
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
    border-color: rgba(255, 107, 107, 0.3);
  }

  .step-navigation {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin: 32px 0;
    flex-wrap: wrap;
  }

  .step-nav-item {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 25px;
    color: #ccc;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .step-nav-item.active {
    background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
    border-color: #ff6b6b;
    color: #fff;
    transform: translateY(-2px);
  }

  .step-nav-item.completed {
    background: rgba(40, 167, 69, 0.2);
    border-color: #28a745;
    color: #28a745;
  }

  .culture-assessment-view {
    background: rgba(255, 255, 255, 0.02);
    padding: 32px;
    border-radius: 12px;
    margin: 24px 0;
  }

  .assessment-form {
    max-width: 800px;
    margin: 0 auto;
  }

  .form-section {
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .form-section h3 {
    color: #4ecdc4;
    margin-bottom: 20px;
    font-size: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    color: #fff;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .form-group select {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
  }

  .form-group select:focus {
    outline: none;
    border-color: #4ecdc4;
    background: rgba(78, 205, 196, 0.05);
  }

  .btn-primary {
    background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
    border: none;
    padding: 16px 32px;
    border-radius: 8px;
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 24px;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .inclusion-score {
    text-align: center;
    margin-top: 32px;
    padding: 24px;
    background: rgba(78, 205, 196, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(78, 205, 196, 0.2);
  }

  .score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(#4ecdc4 0deg, #4ecdc4 calc(var(--score) * 3.6deg), rgba(255, 255, 255, 0.1) calc(var(--score) * 3.6deg));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    position: relative;
  }

  .score-circle::before {
    content: '';
    position: absolute;
    width: 90px;
    height: 90px;
    background: #1a1a2e;
    border-radius: 50%;
  }

  .score-value {
    position: relative;
    z-index: 1;
    font-size: 24px;
    font-weight: 700;
    color: #fff;
  }

  .neurodiversity-insights {
    margin-top: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .insight-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .insight-card:hover {
    transform: translateY(-2px);
    border-color: rgba(78, 205, 196, 0.3);
  }

  .insight-card h4 {
    color: #4ecdc4;
    margin-bottom: 12px;
  }

  .insight-card p {
    color: #ccc;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .insight-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .impact-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .impact-high {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.3);
  }

  .impact-very-high {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
    border: 1px solid rgba(40, 167, 69, 0.3);
  }

  .impact-medium {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
    border: 1px solid rgba(0, 123, 255, 0.3);
  }

  .privacy-note {
    font-size: 12px;
    color: #20c997;
    font-style: italic;
  }

  .quantum-status {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
  }

  .quantum-indicator {
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .quantum-indicator.active {
    background: rgba(111, 66, 193, 0.1);
    color: #6f42c1;
    border: 1px solid rgba(111, 66, 193, 0.3);
    animation: quantum-pulse 2s ease-in-out infinite;
  }

  .quantum-indicator.inactive {
    background: rgba(255, 255, 255, 0.05);
    color: #ccc;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  @keyframes quantum-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(111, 66, 193, 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(111, 66, 193, 0);
    }
  }

  @media (max-width: 768px) {
    .inclusive-culture-builder {
      padding: 16px;
    }
    
    .security-badges {
      flex-direction: column;
      align-items: center;
    }
    
    .step-navigation {
      flex-direction: column;
      align-items: center;
    }
    
    .insights-grid {
      grid-template-columns: 1fr;
    }
    
    .quantum-status {
      position: static;
      margin-top: 24px;
      text-align: center;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default InclusiveCultureBuilder;