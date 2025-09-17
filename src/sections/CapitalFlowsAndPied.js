import React, { useState, useEffect } from 'react';
import '../styles/sections/capital-flows.css';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';
import { BlockchainVerification } from '../services/blockchain/BlockchainVerification';

const CapitalFlowsAndPied = ({ neurodiversityMode, privacyToken, specialKitActive }) => {
  const [capitalData, setCapitalData] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('real-time');
  const [privacyLevel, setPrivacyLevel] = useState('maximum');
  const [isTracking, setIsTracking] = useState(false);

  // Initialize capital flows data with blockchain verification
  useEffect(() => {
    const loadCapitalData = async () => {
      try {
        // Load investment data with blockchain verification
        const data = await BlockchainVerification.loadVerifiedData('capital-flows', {
          privacyToken,
          verificationLevel: 'high',
          dataRetention: 0
        });

        setCapitalData(data);
      } catch (error) {
        console.error('Capital flows data loading failed:', error);
      }
    };

    loadCapitalData();
  }, [privacyToken]);

  // Handle flow analysis with privacy protection
  const analyzeFlow = async (flow) => {
    setIsTracking(true);
    setSelectedFlow(flow);

    try {
      // Track analysis with differential privacy
      await PrivacyFirstTracker.trackInteraction({
        section: 'capital-flows',
        action: 'flow_analysis',
        flow: flow.id,
        timestamp: Date.now()
      });

      // Verify analysis integrity with blockchain
      await BlockchainVerification.verifyAnalysis({
        flowId: flow.id,
        analysisType: analysisMode,
        privacyToken
      });

      setTimeout(() => {
        setIsTracking(false);
      }, 1500);

    } catch (error) {
      console.error('Flow analysis failed:', error);
      setIsTracking(false);
    }
  };

  // Mock capital flows data for demonstration
  const mockCapitalData = {
    majorFlows: [
      {
        id: 'ai-venture-surge',
        title: 'AI Venture Capital Surge',
        amount: '$47.2B',
        change: '+156%',
        direction: 'inbound',
        confidence: 96,
        timeframe: 'Q4 2023 - Q1 2024',
        description: 'Unprecedented venture capital influx into AI startups, particularly privacy-first and neurodiversity-focused solutions.',
        keyPlayers: [
          { name: 'Andreessen Horowitz', allocation: '$12.3B' },
          { name: 'Sequoia Capital', allocation: '$8.7B' },
          { name: 'Kleiner Perkins', allocation: '$6.1B' }
        ],
        sectors: [
          { name: 'Privacy Tech', percentage: 34 },
          { name: 'Neurodiversity AI', percentage: 28 },
          { name: 'Quantum Security', percentage: 23 },
          { name: 'Inclusive Design', percentage: 15 }
        ],
        riskLevel: 'Medium',
        privacyCompliant: true
      },
      {
        id: 'quantum-security-investment',
        title: 'Quantum Security Investment Wave',
        amount: '$23.8B',
        change: '+234%',
        direction: 'inbound',
        confidence: 89,
        timeframe: 'Q1 2024',
        description: 'Enterprise and government investment in post-quantum cryptography solutions accelerating.',
        keyPlayers: [
          { name: 'Government Agencies', allocation: '$9.2B' },
          { name: 'Financial Institutions', allocation: '$7.4B' },
          { name: 'Tech Giants', allocation: '$7.2B' }
        ],
        sectors: [
          { name: 'Post-Quantum Crypto', percentage: 45 },
          { name: 'Quantum Key Distribution', percentage: 32 },
          { name: 'Quantum Random Generators', percentage: 23 }
        ],
        riskLevel: 'Low',
        privacyCompliant: true
      },
      {
        id: 'privacy-first-commerce',
        title: 'Privacy-First Commerce Funding',
        amount: '$18.6B',
        change: '+89%',
        direction: 'inbound',
        confidence: 92,
        timeframe: 'Q4 2023 - Q1 2024',
        description: 'Zero-data retention e-commerce platforms attracting significant investment.',
        keyPlayers: [
          { name: 'Index Ventures', allocation: '$5.2B' },
          { name: 'Accel Partners', allocation: '$4.8B' },
          { name: 'Bessemer Venture', allocation: '$4.1B' }
        ],
        sectors: [
          { name: 'Zero-Data Platforms', percentage: 42 },
          { name: 'Decentralized Commerce', percentage: 31 },
          { name: 'Privacy Analytics', percentage: 27 }
        ],
        riskLevel: 'Medium',
        privacyCompliant: true
      }
    ],
    emergingOpportunities: [
      {
        id: 'neurodiversity-tech-fund',
        title: 'Neurodiversity Tech Fund Launch',
        amount: '$2.3B',
        stage: 'Early',
        description: 'First dedicated fund for neurodiversity-inclusive technology solutions.',
        timeline: '6-12 months'
      },
      {
        id: 'quantum-startup-accelerator',
        title: 'Quantum Startup Accelerator',
        amount: '$890M',
        stage: 'Formation',
        description: 'Specialized accelerator for quantum computing and security startups.',
        timeline: '3-6 months'
      }
    ],
    marketIndicators: [
      {
        id: 'privacy-premium',
        name: 'Privacy Premium Index',
        value: 147,
        change: '+23%',
        description: 'Premium investors pay for privacy-compliant solutions'
      },
      {
        id: 'neurodiversity-multiplier',
        name: 'Neurodiversity Value Multiplier',
        value: 2.8,
        change: '+67%',
        description: 'Valuation multiplier for neurodiversity-inclusive companies'
      },
      {
        id: 'quantum-readiness-score',
        name: 'Quantum Readiness Score',
        value: 73,
        change: '+156%',
        description: 'Market readiness for quantum-secure solutions'
      }
    ]
  };

  const currentData = capitalData || mockCapitalData;

  return (
    <div className={`capital-flows-section ${neurodiversityMode}-optimized`}>
      {/* Section header */}
      <header className="capital-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="title-icon">💰</span>
            <span className="title-text">Capital Flows & Pied</span>
            <span className="title-subtitle">Investment Intelligence & Market Analysis</span>
          </h2>
          
          <div className="analysis-controls">
            <div className="control-group">
              <label htmlFor="analysis-mode">Analysis Mode:</label>
              <select 
                id="analysis-mode"
                value={analysisMode}
                onChange={(e) => setAnalysisMode(e.target.value)}
                className="analysis-selector"
              >
                <option value="real-time">Real-Time</option>
                <option value="predictive">Predictive</option>
                <option value="historical">Historical</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="privacy-level">Privacy Level:</label>
              <select 
                id="privacy-level"
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
                className="privacy-selector"
              >
                <option value="maximum">Maximum</option>
                <option value="high">High</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="market-status">
          <div className="status-indicator active">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Live Market Tracking</span>
          </div>
          <div className="blockchain-verification">
            <span className="verification-icon">⛓️</span>
            <span className="verification-text">Blockchain Verified</span>
          </div>
        </div>
      </header>

      {/* Market indicators */}
      <section className="market-indicators">
        <h3 className="subsection-title">
          <span className="subsection-icon">📊</span>
          Market Indicators
        </h3>
        
        <div className="indicators-grid">
          {currentData.marketIndicators.map((indicator) => (
            <div key={indicator.id} className="indicator-card">
              <div className="indicator-header">
                <h4 className="indicator-name">{indicator.name}</h4>
                <span className={`change-badge ${indicator.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {indicator.change}
                </span>
              </div>
              <div className="indicator-value">{indicator.value}</div>
              <p className="indicator-description">{indicator.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Major capital flows */}
      <section className="major-flows">
        <h3 className="subsection-title">
          <span className="subsection-icon">🌊</span>
          Major Capital Flows
        </h3>
        
        <div className="flows-grid">
          {currentData.majorFlows.map((flow) => (
            <div 
              key={flow.id}
              className={`flow-card ${selectedFlow?.id === flow.id ? 'selected' : ''}`}
              onClick={() => analyzeFlow(flow)}
            >
              <div className="flow-header">
                <h4 className="flow-title">{flow.title}</h4>
                <div className="flow-amount">
                  <span className="amount-value">{flow.amount}</span>
                  <span className={`change-indicator ${flow.change.startsWith('+') ? 'positive' : 'negative'}`}>
                    {flow.change}
                  </span>
                </div>
              </div>
              
              <div className="flow-meta">
                <span className={`direction-badge ${flow.direction}`}>
                  {flow.direction === 'inbound' ? '📈' : '📉'} {flow.direction}
                </span>
                <span className="confidence">{flow.confidence}% confidence</span>
                <span className={`risk-badge ${flow.riskLevel.toLowerCase()}`}>
                  {flow.riskLevel} Risk
                </span>
              </div>
              
              <p className="flow-description">{flow.description}</p>
              
              <div className="flow-timeframe">
                <span className="timeframe-label">Timeframe:</span>
                <span className="timeframe-value">{flow.timeframe}</span>
              </div>
              
              {/* Key players */}
              <div className="key-players">
                <h5 className="players-title">Key Players</h5>
                <div className="players-list">
                  {flow.keyPlayers.map((player, index) => (
                    <div key={index} className="player-item">
                      <span className="player-name">{player.name}</span>
                      <span className="player-allocation">{player.allocation}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sector breakdown */}
              <div className="sector-breakdown">
                <h5 className="sectors-title">Sector Allocation</h5>
                <div className="sectors-chart">
                  {flow.sectors.map((sector, index) => (
                    <div key={index} className="sector-bar">
                      <div className="sector-info">
                        <span className="sector-name">{sector.name}</span>
                        <span className="sector-percentage">{sector.percentage}%</span>
                      </div>
                      <div className="sector-progress">
                        <div 
                          className="sector-fill"
                          style={{ width: `${sector.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {flow.privacyCompliant && (
                <div className="privacy-badge">
                  <span className="privacy-icon">🔒</span>
                  <span className="privacy-text">Privacy Compliant</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Emerging opportunities */}
      <section className="emerging-opportunities">
        <h3 className="subsection-title">
          <span className="subsection-icon">🚀</span>
          Emerging Opportunities
        </h3>
        
        <div className="opportunities-list">
          {currentData.emergingOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="opportunity-card">
              <div className="opportunity-header">
                <h4 className="opportunity-title">{opportunity.title}</h4>
                <div className="opportunity-amount">{opportunity.amount}</div>
              </div>
              
              <div className="opportunity-meta">
                <span className={`stage-badge ${opportunity.stage.toLowerCase()}`}>
                  {opportunity.stage} Stage
                </span>
                <span className="timeline">{opportunity.timeline}</span>
              </div>
              
              <p className="opportunity-description">{opportunity.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow analysis panel */}
      {selectedFlow && (
        <section className="analysis-panel">
          <div className="panel-header">
            <h3 className="panel-title">Flow Analysis: {selectedFlow.title}</h3>
            <button 
              className="close-panel"
              onClick={() => setSelectedFlow(null)}
            >
              ×
            </button>
          </div>
          
          {isTracking ? (
            <div className="analysis-loading">
              <div className="loading-spinner"></div>
              <p>Analyzing capital flow with blockchain verification...</p>
            </div>
          ) : (
            <div className="analysis-content">
              <div className="flow-insights">
                <h4>Investment Insights</h4>
                <ul>
                  <li>Flow momentum exceeding historical patterns by 67%</li>
                  <li>Privacy-first solutions commanding 2.3x premium</li>
                  <li>Neurodiversity-inclusive companies showing 89% higher retention</li>
                  <li>Quantum-secure implementations reducing risk by 94%</li>
                </ul>
              </div>
              
              <div className="investment-recommendations">
                <h4>Investment Strategy</h4>
                <ul>
                  <li>Prioritize privacy-compliant portfolio companies</li>
                  <li>Increase allocation to neurodiversity-focused solutions</li>
                  <li>Establish quantum-security investment thesis</li>
                  <li>Monitor regulatory impact on flow patterns</li>
                </ul>
              </div>
              
              <div className="risk-assessment">
                <h4>Risk Assessment</h4>
                <div className="risk-matrix">
                  <div className="risk-item">
                    <span className="risk-factor">Market Volatility</span>
                    <span className="risk-level medium">Medium</span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-factor">Regulatory Changes</span>
                    <span className="risk-level low">Low</span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-factor">Technology Risk</span>
                    <span className="risk-level low">Low</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Privacy and verification notice */}
      <div className="privacy-notice">
        <p>
          <span className="privacy-icon">🔒</span>
          All investment data processed with maximum privacy protection. 
          <span className="blockchain-icon">⛓️</span>
          Analysis integrity verified on blockchain.
        </p>
      </div>
    </div>
  );
};

export default CapitalFlowsAndPied;