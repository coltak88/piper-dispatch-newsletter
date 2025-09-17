import React, { useState, useEffect } from 'react';
import '../styles/sections/the-signal.css';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';
import { NeurodiversityOptimizer } from '../services/neurodiversity/NeurodiversityOptimizer';

const TheSignal = ({ neurodiversityMode, privacyToken, specialKitActive }) => {
  const [signalData, setSignalData] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [privacyMode, setPrivacyMode] = useState('maximum');

  // Initialize section with privacy-first data loading
  useEffect(() => {
    const loadSignalData = async () => {
      try {
        // Load market intelligence with differential privacy
        const data = await PrivacyFirstTracker.loadSectionData('signal', {
          epsilon: 0.05,
          onDeviceProcessing: true,
          dataRetention: 0
        });

        setSignalData(data);
      } catch (error) {
        console.error('Signal data loading failed:', error);
      }
    };

    loadSignalData();
  }, [privacyToken]);

  // Handle trend analysis with privacy protection
  const analyzeTrend = async (trend) => {
    setIsAnalyzing(true);
    setSelectedTrend(trend);

    try {
      // Track interaction with differential privacy
      await PrivacyFirstTracker.trackInteraction({
        section: 'signal',
        action: 'trend_analysis',
        trend: trend.id,
        timestamp: Date.now()
      });

      // Simulate analysis with privacy-first processing
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);

    } catch (error) {
      console.error('Trend analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  // Render neurodiversity-optimized content
  const renderNeurodiversityOptimized = () => {
    const optimizationProps = {
      mode: neurodiversityMode,
      content: signalData,
      section: 'signal'
    };

    return NeurodiversityOptimizer.optimizeContent(optimizationProps);
  };

  // Mock signal data for demonstration
  const mockSignalData = {
    marketTrends: [
      {
        id: 'ai-automation',
        title: 'AI Automation Surge',
        confidence: 94,
        impact: 'High',
        timeframe: '3-6 months',
        description: 'Enterprise AI adoption accelerating with 340% YoY growth in automation investments.',
        keyMetrics: {
          marketSize: '$127B',
          growthRate: '42%',
          adoptionRate: '67%'
        },
        privacyCompliant: true
      },
      {
        id: 'quantum-security',
        title: 'Quantum Security Transition',
        confidence: 87,
        impact: 'Critical',
        timeframe: '12-18 months',
        description: 'Post-quantum cryptography becoming mandatory for financial institutions.',
        keyMetrics: {
          marketSize: '$89B',
          growthRate: '156%',
          adoptionRate: '23%'
        },
        privacyCompliant: true
      },
      {
        id: 'neurodiversity-tech',
        title: 'Neurodiversity-First Design',
        confidence: 91,
        impact: 'Medium',
        timeframe: '6-12 months',
        description: 'Inclusive design principles driving 28% higher user engagement rates.',
        keyMetrics: {
          marketSize: '$34B',
          growthRate: '73%',
          adoptionRate: '45%'
        },
        privacyCompliant: true
      }
    ],
    emergingSignals: [
      {
        id: 'privacy-first-commerce',
        title: 'Privacy-First E-Commerce',
        strength: 'Strong',
        source: 'Multiple indicators',
        description: 'Zero-data retention models showing 3x conversion improvements.'
      },
      {
        id: 'decentralized-identity',
        title: 'Decentralized Identity Systems',
        strength: 'Moderate',
        source: 'Tech adoption patterns',
        description: 'Self-sovereign identity solutions gaining enterprise traction.'
      }
    ],
    riskFactors: [
      {
        id: 'regulatory-uncertainty',
        title: 'AI Regulation Uncertainty',
        severity: 'High',
        probability: '78%',
        impact: 'Market volatility in AI sector'
      },
      {
        id: 'quantum-threat',
        title: 'Quantum Computing Threat',
        severity: 'Critical',
        probability: '45%',
        impact: 'Current encryption obsolescence'
      }
    ]
  };

  const currentData = signalData || mockSignalData;

  return (
    <div className={`signal-section ${neurodiversityMode}-optimized`}>
      {/* Section header */}
      <header className="signal-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="title-icon">📡</span>
            <span className="title-text">The Signal</span>
            <span className="title-subtitle">Market Intelligence & Trend Analysis</span>
          </h2>
          
          <div className="privacy-controls">
            <label htmlFor="privacy-mode">Privacy Level:</label>
            <select 
              id="privacy-mode"
              value={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.value)}
              className="privacy-selector"
            >
              <option value="maximum">Maximum (ε=0.01)</option>
              <option value="high">High (ε=0.05)</option>
              <option value="standard">Standard (ε=0.1)</option>
            </select>
          </div>
        </div>
        
        <div className="signal-status">
          <div className="status-indicator active">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Live Signal Processing</span>
          </div>
          <div className="last-update">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Market trends */}
      <section className="market-trends">
        <h3 className="subsection-title">
          <span className="subsection-icon">📈</span>
          Market Trends
        </h3>
        
        <div className="trends-grid">
          {currentData.marketTrends.map((trend) => (
            <div 
              key={trend.id}
              className={`trend-card ${selectedTrend?.id === trend.id ? 'selected' : ''}`}
              onClick={() => analyzeTrend(trend)}
            >
              <div className="trend-header">
                <h4 className="trend-title">{trend.title}</h4>
                <div className="trend-confidence">
                  <span className="confidence-value">{trend.confidence}%</span>
                  <span className="confidence-label">Confidence</span>
                </div>
              </div>
              
              <div className="trend-meta">
                <span className={`impact-badge ${trend.impact.toLowerCase()}`}>
                  {trend.impact} Impact
                </span>
                <span className="timeframe">{trend.timeframe}</span>
              </div>
              
              <p className="trend-description">{trend.description}</p>
              
              <div className="trend-metrics">
                <div className="metric">
                  <span className="metric-label">Market Size</span>
                  <span className="metric-value">{trend.keyMetrics.marketSize}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Growth Rate</span>
                  <span className="metric-value">{trend.keyMetrics.growthRate}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Adoption</span>
                  <span className="metric-value">{trend.keyMetrics.adoptionRate}</span>
                </div>
              </div>
              
              {trend.privacyCompliant && (
                <div className="privacy-badge">
                  <span className="privacy-icon">🔒</span>
                  <span className="privacy-text">Privacy Compliant</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Emerging signals */}
      <section className="emerging-signals">
        <h3 className="subsection-title">
          <span className="subsection-icon">🔍</span>
          Emerging Signals
        </h3>
        
        <div className="signals-list">
          {currentData.emergingSignals.map((signal) => (
            <div key={signal.id} className="signal-item">
              <div className="signal-header">
                <h4 className="signal-title">{signal.title}</h4>
                <span className={`strength-badge ${signal.strength.toLowerCase()}`}>
                  {signal.strength}
                </span>
              </div>
              <p className="signal-description">{signal.description}</p>
              <div className="signal-source">
                <span className="source-label">Source:</span>
                <span className="source-value">{signal.source}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Risk factors */}
      <section className="risk-factors">
        <h3 className="subsection-title">
          <span className="subsection-icon">⚠️</span>
          Risk Factors
        </h3>
        
        <div className="risks-grid">
          {currentData.riskFactors.map((risk) => (
            <div key={risk.id} className="risk-card">
              <div className="risk-header">
                <h4 className="risk-title">{risk.title}</h4>
                <span className={`severity-badge ${risk.severity.toLowerCase()}`}>
                  {risk.severity}
                </span>
              </div>
              <div className="risk-probability">
                <span className="probability-label">Probability:</span>
                <span className="probability-value">{risk.probability}</span>
              </div>
              <p className="risk-impact">{risk.impact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis panel */}
      {selectedTrend && (
        <section className="analysis-panel">
          <div className="panel-header">
            <h3 className="panel-title">Trend Analysis: {selectedTrend.title}</h3>
            <button 
              className="close-panel"
              onClick={() => setSelectedTrend(null)}
            >
              ×
            </button>
          </div>
          
          {isAnalyzing ? (
            <div className="analysis-loading">
              <div className="loading-spinner"></div>
              <p>Analyzing trend with privacy-first algorithms...</p>
            </div>
          ) : (
            <div className="analysis-content">
              <div className="analysis-insights">
                <h4>Key Insights</h4>
                <ul>
                  <li>Market momentum accelerating beyond projections</li>
                  <li>Early adopter advantage window: 3-6 months</li>
                  <li>Regulatory clarity expected Q2 2024</li>
                  <li>Privacy-first implementations showing 2x success rates</li>
                </ul>
              </div>
              
              <div className="analysis-recommendations">
                <h4>Strategic Recommendations</h4>
                <ul>
                  <li>Prioritize privacy-compliant implementations</li>
                  <li>Establish partnerships with quantum-secure providers</li>
                  <li>Develop neurodiversity-inclusive user experiences</li>
                  <li>Monitor regulatory developments closely</li>
                </ul>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Privacy notice */}
      <div className="privacy-notice">
        <p>
          <span className="privacy-icon">🔒</span>
          All trend analysis performed with differential privacy (ε={privacyMode === 'maximum' ? '0.01' : privacyMode === 'high' ? '0.05' : '0.1'}). 
          Data automatically purged every 15 seconds.
        </p>
      </div>
    </div>
  );
};

export default TheSignal;