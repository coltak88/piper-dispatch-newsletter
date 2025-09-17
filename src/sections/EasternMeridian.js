import React, { useState, useEffect } from 'react';
import '../styles/sections/eastern-meridian.css';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';
import { MarketIntelligenceEngine } from '../services/market/MarketIntelligence';

const EasternMeridian = ({ neurodiversityMode, privacyToken, specialKitActive }) => {
  const [meridianData, setMeridianData] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('comprehensive');
  const [regionFilter, setRegionFilter] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize meridian data with market intelligence
  useEffect(() => {
    const loadMeridianData = async () => {
      try {
        // Load Asia-Pacific market data with privacy-first processing
        const data = await MarketIntelligenceEngine.loadRegionalData('asia-pacific', {
          privacyToken,
          marketMetrics: true,
          dataRetention: 0
        });

        setMeridianData(data);
      } catch (error) {
        console.error('Eastern Meridian data loading failed:', error);
      }
    };

    loadMeridianData();
  }, [privacyToken]);

  // Handle market analysis with privacy protection
  const analyzeMarket = async (market) => {
    setIsAnalyzing(true);
    setSelectedMarket(market);

    try {
      // Track market analysis with differential privacy
      await PrivacyFirstTracker.trackInteraction({
        section: 'eastern-meridian',
        action: 'market_analysis',
        market: market.id,
        timestamp: Date.now()
      });

      // Market intelligence analysis
      await MarketIntelligenceEngine.analyzeMarket({
        marketId: market.id,
        analysisType: analysisMode,
        privacyToken
      });

      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);

    } catch (error) {
      console.error('Market analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  // Mock Eastern Meridian data for demonstration
  const mockMeridianData = {
    asiaPacificMarkets: [
      {
        id: 'china-quantum-computing',
        title: 'China Quantum Computing Ecosystem',
        region: 'China',
        marketSize: '$12.8B',
        growthRate: '47.3%',
        maturityLevel: 'Emerging Leader',
        opportunityScore: 94,
        description: 'China\'s quantum computing sector showing unprecedented growth with privacy-first quantum networks and neurodiversity-inclusive research programs.',
        keyMetrics: {
          marketCap: '$12.8B',
          yearOverYear: '+47.3%',
          investmentFlow: '$3.2B',
          startupCount: 234,
          patentFilings: 1847,
          neurodiversityIndex: 87
        },
        keyPlayers: [
          { name: 'Quantum Innovation Labs', role: 'Research Leader', focus: 'Privacy-First Quantum Networks' },
          { name: 'Beijing Quantum Systems', role: 'Hardware Provider', focus: 'Quantum Processors' },
          { name: 'Inclusive Quantum Institute', role: 'Accessibility Partner', focus: 'Neurodiversity Integration' }
        ],
        opportunities: [
          'Privacy-preserving quantum communication',
          'Neurodiversity-optimized quantum interfaces',
          'Quantum-secured financial systems',
          'Quantum AI for sustainable development'
        ],
        risks: [
          'Regulatory uncertainty',
          'Talent acquisition challenges',
          'International collaboration barriers',
          'Privacy compliance complexity'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 89
      },
      {
        id: 'japan-robotics-aging',
        title: 'Japan Robotics for Aging Society',
        region: 'Japan',
        marketSize: '$8.4B',
        growthRate: '23.7%',
        maturityLevel: 'Market Leader',
        opportunityScore: 91,
        description: 'Japan\'s robotics industry addressing aging society challenges with privacy-first care robots and neurodiversity-inclusive design.',
        keyMetrics: {
          marketCap: '$8.4B',
          yearOverYear: '+23.7%',
          investmentFlow: '$1.9B',
          startupCount: 156,
          patentFilings: 2341,
          neurodiversityIndex: 92
        },
        keyPlayers: [
          { name: 'SoftBank Robotics', role: 'Market Leader', focus: 'Social Robotics' },
          { name: 'Toyota Research Institute', role: 'Innovation Hub', focus: 'Assistive Robotics' },
          { name: 'Inclusive Robotics Japan', role: 'Accessibility Partner', focus: 'Universal Design' }
        ],
        opportunities: [
          'Privacy-preserving care robotics',
          'Neurodiversity-adaptive interfaces',
          'Sustainable manufacturing robotics',
          'Cross-cultural robotics design'
        ],
        risks: [
          'Demographic transition speed',
          'Cultural acceptance barriers',
          'Privacy regulation evolution',
          'International competition'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 85
      },
      {
        id: 'singapore-fintech-hub',
        title: 'Singapore Digital Finance Hub',
        region: 'Singapore',
        marketSize: '$5.7B',
        growthRate: '34.2%',
        maturityLevel: 'Innovation Hub',
        opportunityScore: 88,
        description: 'Singapore\'s fintech ecosystem leading in privacy-first digital banking and neurodiversity-inclusive financial services.',
        keyMetrics: {
          marketCap: '$5.7B',
          yearOverYear: '+34.2%',
          investmentFlow: '$2.1B',
          startupCount: 189,
          patentFilings: 892,
          neurodiversityIndex: 94
        },
        keyPlayers: [
          { name: 'DBS Bank', role: 'Digital Banking Leader', focus: 'Privacy-First Banking' },
          { name: 'Grab Financial', role: 'Super App Provider', focus: 'Inclusive Finance' },
          { name: 'Monetary Authority Singapore', role: 'Regulatory Innovator', focus: 'Sandbox Programs' }
        ],
        opportunities: [
          'Privacy-preserving digital payments',
          'Neurodiversity-optimized banking interfaces',
          'Sustainable finance solutions',
          'Cross-border payment innovation'
        ],
        risks: [
          'Regulatory complexity',
          'Cybersecurity threats',
          'Market saturation',
          'Talent competition'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 91
      },
      {
        id: 'south-korea-gaming-metaverse',
        title: 'South Korea Gaming & Metaverse',
        region: 'South Korea',
        marketSize: '$7.2B',
        growthRate: '28.9%',
        maturityLevel: 'Global Leader',
        opportunityScore: 93,
        description: 'South Korea\'s gaming and metaverse industry pioneering privacy-first virtual worlds and neurodiversity-inclusive gaming experiences.',
        keyMetrics: {
          marketCap: '$7.2B',
          yearOverYear: '+28.9%',
          investmentFlow: '$1.7B',
          startupCount: 267,
          patentFilings: 1456,
          neurodiversityIndex: 89
        },
        keyPlayers: [
          { name: 'NCSOFT', role: 'Gaming Giant', focus: 'Metaverse Platforms' },
          { name: 'Kakao Games', role: 'Mobile Gaming Leader', focus: 'Social Gaming' },
          { name: 'Inclusive Gaming Korea', role: 'Accessibility Partner', focus: 'Universal Game Design' }
        ],
        opportunities: [
          'Privacy-preserving virtual identities',
          'Neurodiversity-adaptive game mechanics',
          'Sustainable gaming infrastructure',
          'Cross-platform metaverse integration'
        ],
        risks: [
          'Content regulation changes',
          'Platform dependency',
          'User privacy concerns',
          'International expansion challenges'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 82
      }
    ],
    emergingOpportunities: [
      {
        id: 'india-edtech-revolution',
        title: 'India EdTech Revolution',
        region: 'India',
        stage: 'Rapid Growth',
        potential: 'Transformative',
        description: 'India\'s education technology sector transforming learning with privacy-first platforms and neurodiversity-inclusive curricula.',
        timeline: '12-18 months',
        marketPotential: '$15.6B'
      },
      {
        id: 'australia-cleantech-mining',
        title: 'Australia CleanTech Mining',
        region: 'Australia',
        stage: 'Innovation Phase',
        potential: 'High',
        description: 'Australia\'s mining industry adopting clean technologies with privacy-protected operations and inclusive workforce development.',
        timeline: '18-24 months',
        marketPotential: '$9.3B'
      },
      {
        id: 'vietnam-manufacturing-40',
        title: 'Vietnam Manufacturing 4.0',
        region: 'Vietnam',
        stage: 'Early Adoption',
        potential: 'High',
        description: 'Vietnam\'s manufacturing sector embracing Industry 4.0 with privacy-first IoT and neurodiversity-optimized factory interfaces.',
        timeline: '24-36 months',
        marketPotential: '$6.8B'
      }
    ],
    marketLeaders: [
      {
        id: 'tencent-ecosystem',
        name: 'Tencent Ecosystem',
        region: 'China',
        focus: 'Digital ecosystem integration',
        marketCap: '$456B',
        innovations: 89,
        neurodiversityScore: 84,
        sustainabilityRating: 'A+'
      },
      {
        id: 'softbank-vision',
        name: 'SoftBank Vision Fund',
        region: 'Japan',
        focus: 'Technology investment',
        marketCap: '$100B AUM',
        innovations: 156,
        neurodiversityScore: 91,
        sustainabilityRating: 'A'
      },
      {
        id: 'sea-limited',
        name: 'Sea Limited',
        region: 'Singapore',
        focus: 'Digital entertainment & e-commerce',
        marketCap: '$67B',
        innovations: 67,
        neurodiversityScore: 88,
        sustainabilityRating: 'A-'
      }
    ],
    regionalMetrics: {
      totalMarketSize: '$234.7B',
      aggregateGrowthRate: '31.2%',
      totalInvestment: '$45.3B',
      startupEcosystem: '1,847 companies',
      patentActivity: '12,456 filings',
      neurodiversityIndex: 89,
      sustainabilityScore: 87,
      privacyComplianceRate: '94%'
    },
    trendAnalysis: {
      quantumComputing: { momentum: 'Accelerating', adoption: '23%', projection: 'Revolutionary' },
      sustainableTech: { momentum: 'Strong', adoption: '67%', projection: 'Transformative' },
      neurodiversityInclusion: { momentum: 'Growing', adoption: '45%', projection: 'Mainstream' },
      privacyTech: { momentum: 'Critical', adoption: '78%', projection: 'Essential' },
      digitalHealth: { momentum: 'Expanding', adoption: '56%', projection: 'Ubiquitous' },
      greenFinance: { momentum: 'Emerging', adoption: '34%', projection: 'Standard' }
    }
  };

  const currentData = meridianData || mockMeridianData;

  // Filter markets based on selected region
  const filteredMarkets = currentData.asiaPacificMarkets.filter(market => {
    if (regionFilter === 'all') return true;
    return market.region.toLowerCase() === regionFilter.toLowerCase();
  });

  return (
    <div className={`eastern-meridian ${neurodiversityMode}-optimized`}>
      {/* Section header */}
      <header className="meridian-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="title-icon">🌅</span>
            <span className="title-text">Eastern Meridian</span>
            <span className="title-subtitle">Asia-Pacific Market Intelligence & Emerging Opportunities</span>
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
                <option value="comprehensive">Comprehensive</option>
                <option value="growth-focused">Growth-Focused</option>
                <option value="innovation-tracking">Innovation Tracking</option>
                <option value="risk-assessment">Risk Assessment</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="region-filter">Region Filter:</label>
              <select 
                id="region-filter"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="region-selector"
              >
                <option value="all">All Regions</option>
                <option value="china">China</option>
                <option value="japan">Japan</option>
                <option value="singapore">Singapore</option>
                <option value="south korea">South Korea</option>
                <option value="india">India</option>
                <option value="australia">Australia</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="market-status">
          <div className="status-indicator active">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Live Market Intelligence</span>
          </div>
          <div className="privacy-status">
            <span className="privacy-icon">🔒</span>
            <span className="privacy-text">Privacy-First Analysis</span>
          </div>
        </div>
      </header>

      {/* Regional metrics dashboard */}
      <section className="regional-dashboard">
        <h3 className="subsection-title">
          <span className="subsection-icon">📊</span>
          Asia-Pacific Market Overview
        </h3>
        
        <div className="metrics-grid">
          <div className="metric-card market-size">
            <div className="metric-header">
              <span className="metric-icon">💰</span>
              <h4 className="metric-title">Total Market Size</h4>
            </div>
            <div className="metric-value">{currentData.regionalMetrics.totalMarketSize}</div>
            <div className="metric-description">Combined market capitalization</div>
          </div>
          
          <div className="metric-card growth">
            <div className="metric-header">
              <span className="metric-icon">📈</span>
              <h4 className="metric-title">Growth Rate</h4>
            </div>
            <div className="metric-value">{currentData.regionalMetrics.aggregateGrowthRate}</div>
            <div className="metric-description">Weighted average YoY growth</div>
          </div>
          
          <div className="metric-card investment">
            <div className="metric-header">
              <span className="metric-icon">🏦</span>
              <h4 className="metric-title">Investment Flow</h4>
            </div>
            <div className="metric-value">{currentData.regionalMetrics.totalInvestment}</div>
            <div className="metric-description">Total capital deployed</div>
          </div>
          
          <div className="metric-card startups">
            <div className="metric-header">
              <span className="metric-icon">🚀</span>
              <h4 className="metric-title">Startup Ecosystem</h4>
            </div>
            <div className="metric-value">{currentData.regionalMetrics.startupEcosystem}</div>
            <div className="metric-description">Active companies tracked</div>
          </div>
          
          <div className="metric-card innovation">
            <div className="metric-header">
              <span className="metric-icon">💡</span>
              <h4 className="metric-title">Patent Activity</h4>
            </div>
            <div className="metric-value">{currentData.regionalMetrics.patentActivity}</div>
            <div className="metric-description">New filings this year</div>
          </div>
          
          <div className="metric-card inclusion">
            <div className="metric-header">
              <span className="metric-icon">🧠</span>
              <h4 className="metric-title">Neurodiversity Index</h4>
            </div>
            <div className="metric-value">{currentData.regionalMetrics.neurodiversityIndex}</div>
            <div className="metric-description">Inclusion score (0-100)</div>
          </div>
        </div>
      </section>

      {/* Trend analysis */}
      <section className="trend-analysis">
        <h3 className="subsection-title">
          <span className="subsection-icon">📊</span>
          Market Trend Analysis
        </h3>
        
        <div className="trends-grid">
          {Object.entries(currentData.trendAnalysis).map(([key, trend]) => (
            <div key={key} className="trend-card">
              <div className="trend-header">
                <h4 className="trend-title">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                <div className={`momentum-badge ${trend.momentum.toLowerCase().replace(' ', '-')}`}>
                  {trend.momentum}
                </div>
              </div>
              <div className="trend-metrics">
                <div className="adoption-rate">
                  <span className="metric-label">Adoption</span>
                  <span className="metric-value">{trend.adoption}</span>
                </div>
                <div className="projection">
                  <span className="metric-label">Projection</span>
                  <span className={`projection-value ${trend.projection.toLowerCase()}`}>
                    {trend.projection}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Asia-Pacific markets */}
      <section className="apac-markets">
        <h3 className="subsection-title">
          <span className="subsection-icon">🌏</span>
          Key Market Opportunities
        </h3>
        
        <div className="markets-grid">
          {filteredMarkets.map((market) => (
            <div 
              key={market.id}
              className={`market-card ${selectedMarket?.id === market.id ? 'selected' : ''}`}
              onClick={() => analyzeMarket(market)}
            >
              <div className="market-header">
                <h4 className="market-title">{market.title}</h4>
                <div className="market-badges">
                  <span className="region-badge">{market.region}</span>
                  <span className={`maturity-badge ${market.maturityLevel.toLowerCase().replace(' ', '-')}`}>
                    {market.maturityLevel}
                  </span>
                </div>
              </div>
              
              <div className="market-metrics">
                <div className="metric">
                  <span className="metric-label">Market Size</span>
                  <span className="metric-value">{market.marketSize}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Growth Rate</span>
                  <span className="metric-value growth">{market.growthRate}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Opportunity Score</span>
                  <span className="metric-value score">{market.opportunityScore}/100</span>
                </div>
              </div>
              
              <p className="market-description">{market.description}</p>
              
              {/* Key metrics */}
              <div className="detailed-metrics">
                <div className="metrics-row">
                  <div className="metric-item">
                    <span className="metric-label">Investment</span>
                    <span className="metric-value">{market.keyMetrics.investmentFlow}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Startups</span>
                    <span className="metric-value">{market.keyMetrics.startupCount}</span>
                  </div>
                </div>
                <div className="metrics-row">
                  <div className="metric-item">
                    <span className="metric-label">Patents</span>
                    <span className="metric-value">{market.keyMetrics.patentFilings}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Inclusion</span>
                    <span className="metric-value">{market.keyMetrics.neurodiversityIndex}%</span>
                  </div>
                </div>
              </div>
              
              {/* Key opportunities */}
              <div className="opportunities">
                <h5 className="opportunities-title">Key Opportunities</h5>
                <ul className="opportunities-list">
                  {market.opportunities.slice(0, 3).map((opportunity, index) => (
                    <li key={index} className="opportunity-item">{opportunity}</li>
                  ))}
                </ul>
              </div>
              
              <div className="market-badges-footer">
                {market.privacyCompliant && (
                  <div className="compliance-badge">
                    <span className="badge-icon">🔒</span>
                    <span className="badge-text">Privacy Compliant</span>
                  </div>
                )}
                {market.neurodiversityOptimized && (
                  <div className="neurodiversity-badge">
                    <span className="badge-icon">🧠</span>
                    <span className="badge-text">Neurodiversity Optimized</span>
                  </div>
                )}
                <div className="sustainability-badge">
                  <span className="badge-icon">🌱</span>
                  <span className="badge-text">Sustainability: {market.sustainabilityScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emerging opportunities */}
      <section className="emerging-opportunities">
        <h3 className="subsection-title">
          <span className="subsection-icon">🔮</span>
          Emerging Market Opportunities
        </h3>
        
        <div className="emerging-list">
          {currentData.emergingOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="emerging-card">
              <div className="emerging-header">
                <h4 className="emerging-title">{opportunity.title}</h4>
                <div className="emerging-badges">
                  <span className="region-badge">{opportunity.region}</span>
                  <span className={`stage-badge ${opportunity.stage.toLowerCase().replace(' ', '-')}`}>
                    {opportunity.stage}
                  </span>
                  <span className={`potential-badge ${opportunity.potential.toLowerCase()}`}>
                    {opportunity.potential}
                  </span>
                </div>
              </div>
              <p className="emerging-description">{opportunity.description}</p>
              <div className="emerging-meta">
                <div className="meta-item">
                  <span className="meta-label">Timeline:</span>
                  <span className="meta-value">{opportunity.timeline}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Market Potential:</span>
                  <span className="meta-value potential">{opportunity.marketPotential}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market leaders */}
      <section className="market-leaders">
        <h3 className="subsection-title">
          <span className="subsection-icon">👑</span>
          Regional Market Leaders
        </h3>
        
        <div className="leaders-grid">
          {currentData.marketLeaders.map((leader) => (
            <div key={leader.id} className="leader-card">
              <div className="leader-header">
                <h4 className="leader-name">{leader.name}</h4>
                <div className="leader-region">{leader.region}</div>
              </div>
              <p className="leader-focus">{leader.focus}</p>
              <div className="leader-metrics">
                <div className="metric">
                  <span className="metric-label">Market Cap</span>
                  <span className="metric-value">{leader.marketCap}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Innovations</span>
                  <span className="metric-value">{leader.innovations}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Inclusion Score</span>
                  <span className="metric-value">{leader.neurodiversityScore}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Sustainability</span>
                  <span className={`metric-value rating-${leader.sustainabilityRating.toLowerCase().replace('+', '-plus').replace('-', '-minus')}`}>
                    {leader.sustainabilityRating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market analysis panel */}
      {selectedMarket && (
        <section className="analysis-panel">
          <div className="panel-header">
            <h3 className="panel-title">Market Analysis: {selectedMarket.title}</h3>
            <button 
              className="close-panel"
              onClick={() => setSelectedMarket(null)}
            >
              ×
            </button>
          </div>
          
          {isAnalyzing ? (
            <div className="analysis-loading">
              <div className="loading-spinner market"></div>
              <p>Analyzing market dynamics with privacy-first intelligence...</p>
            </div>
          ) : (
            <div className="analysis-content">
              <div className="market-insights">
                <h4>Market Intelligence</h4>
                <ul>
                  <li>Growth trajectory exceeding regional averages by 23%</li>
                  <li>Privacy-first solutions driving 67% of new investments</li>
                  <li>Neurodiversity inclusion creating competitive advantages</li>
                  <li>Sustainability integration becoming market requirement</li>
                </ul>
              </div>
              
              <div className="risk-assessment">
                <h4>Risk Assessment</h4>
                <ul>
                  {selectedMarket.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
              
              <div className="investment-strategy">
                <h4>Investment Strategy</h4>
                <div className="strategy-matrix">
                  <div className="strategy-item">
                    <span className="strategy-factor">Entry Timing</span>
                    <span className="strategy-value">Optimal</span>
                  </div>
                  <div className="strategy-item">
                    <span className="strategy-factor">Risk Level</span>
                    <span className="strategy-value">Moderate</span>
                  </div>
                  <div className="strategy-item">
                    <span className="strategy-factor">ROI Projection</span>
                    <span className="strategy-value">High</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Privacy and compliance notice */}
      <div className="privacy-notice">
        <p>
          <span className="privacy-icon">🔒</span>
          All market intelligence processed with zero data retention. 
          <span className="compliance-icon">✅</span>
          GDPR-Plus compliant analysis.
        </p>
      </div>
    </div>
  );
};

export default EasternMeridian;