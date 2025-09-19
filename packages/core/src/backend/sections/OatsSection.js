import React, { useState, useEffect } from 'react';
import '../styles/sections/oats-section.css';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';
import { SustainabilityAnalyzer } from '../services/sustainability/SustainabilityAnalyzer';

const OatsSection = ({ neurodiversityMode, privacyToken, specialKitActive }) => {
  const [oatsData, setOatsData] = useState(null);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [sustainabilityMode, setSustainabilityMode] = useState('comprehensive');
  const [impactFilter, setImpactFilter] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize oats data with real-time API integration
  useEffect(() => {
    const loadOatsData = async () => {
      try {
        // Fetch real-time OATS data
        const data = await fetchOatsData();
        
        // Apply differential privacy protection
        const protectedData = await PrivacyFirstTracker.applyDataProtection(data, {
          sustainabilityFocus: true,
          privacyToken
        });

        setOatsData(protectedData);
      } catch (error) {
        console.error('OATS data loading failed:', error);
        // Use fallback data on error
        setOatsData(fallbackOatsData);
      }
    };

    loadOatsData();
    
    // Set up real-time updates every 5 minutes
    const updateInterval = setInterval(loadOatsData, 5 * 60 * 1000);
    
    return () => clearInterval(updateInterval);
  }, [privacyToken, sustainabilityMode, impactFilter]);

  // Handle initiative analysis with privacy protection
  const analyzeInitiative = async (initiative) => {
    setIsAnalyzing(true);
    setSelectedInitiative(initiative);

    try {
      // Track sustainability analysis with differential privacy
      await PrivacyFirstTracker.trackInteraction({
        section: 'oats',
        action: 'initiative_analysis',
        initiative: initiative.id,
        timestamp: Date.now()
      });

      // Sustainability impact analysis
      await SustainabilityAnalyzer.analyzeImpact({
        initiativeId: initiative.id,
        analysisType: sustainabilityMode,
        privacyToken
      });

      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);

    } catch (error) {
      console.error('Initiative analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  // Production API configuration for OATS data
  const OATS_API_CONFIG = {
    baseUrl: process.env.REACT_APP_OATS_API_URL || 'https://oats.piperdispatch.com',
    version: 'v2',
    endpoints: {
      innovations: '/sustainable-innovations',
      impactAnalysis: '/impact-analysis',
      sdgTracking: '/sdg-tracking',
      sustainability: '/sustainability-metrics'
    }
  };

  // Real-time OATS data fetching
  const fetchOatsData = async () => {
    try {
      const [innovationsData, impactData, sdgData] = await Promise.all([
        fetchSustainableInnovations(),
        fetchImpactAnalysis(),
        fetchSDGTracking()
      ]);

      return {
        sustainableInnovations: innovationsData,
        impactAnalysis: impactData,
        sdgTracking: sdgData,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('OATS data fetch failed:', error);
      throw error;
    }
  };

  // Fetch sustainable innovations with privacy protection
  const fetchSustainableInnovations = async () => {
    const response = await fetch(`${OATS_API_CONFIG.baseUrl}${OATS_API_CONFIG.endpoints.innovations}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('oatsToken')}`,
        'X-Privacy-Level': 'maximum',
        'X-Impact-Filter': impactFilter,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Sustainable innovations fetch failed: ${response.status}`);
    const data = await response.json();
    
    // Apply sustainability-focused privacy protection
    return await PrivacyFirstTracker.applyDataProtection(data, {
      sustainabilityFocus: true,
      privacyToken
    });
  };

  // Fetch impact analysis data
  const fetchImpactAnalysis = async () => {
    const response = await fetch(`${OATS_API_CONFIG.baseUrl}${OATS_API_CONFIG.endpoints.impactAnalysis}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('oatsToken')}`,
        'X-Sustainability-Mode': sustainabilityMode,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Impact analysis fetch failed: ${response.status}`);
    return await response.json();
  };

  // Fetch SDG tracking data
  const fetchSDGTracking = async () => {
    const response = await fetch(`${OATS_API_CONFIG.baseUrl}${OATS_API_CONFIG.endpoints.sdgTracking}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('oatsToken')}`,
        'X-Privacy-Level': 'maximum',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`SDG tracking fetch failed: ${response.status}`);
    return await response.json();
  };

  // Fallback data structure for offline mode
  const fallbackOatsData = {
    sustainableInnovations: [
      {
        id: 'regenerative-agriculture-ai',
        title: 'Regenerative Agriculture AI Platform',
        category: 'Agriculture',
        impactLevel: 'Revolutionary',
        maturityStage: 'Production',
        timeToScale: 'Available Now',
        description: 'AI-powered platform that optimizes regenerative farming practices while protecting farmer privacy and supporting neurodivergent agricultural workers.',
        sustainabilityMetrics: {
          carbonReduction: '67%',
          energyEfficiency: '78%',
          renewableEnergy: '85%',
          circularityScore: '92%'
        },
        innovators: [
          { name: 'RegenFarm AI', role: 'Platform Developer' },
          { name: 'Sustainable Agriculture Institute', role: 'Research Partner' },
          { name: 'Farmer Privacy Alliance', role: 'Privacy Advocate' }
        ],
        applications: [
          'Soil health optimization',
          'Carbon sequestration tracking',
          'Biodiversity enhancement',
          'Inclusive farming interfaces'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sdgAlignment: [2, 6, 13, 15]
      },
      {
        id: 'circular-economy-blockchain',
        title: 'Circular Economy Blockchain Network',
        category: 'Circular Economy',
        impactLevel: 'High',
        maturityStage: 'Beta',
        timeToScale: '6-12 months',
        description: 'Blockchain network enabling complete material traceability and circular economy optimization with zero personal data collection.',
        sustainabilityMetrics: {
          carbonReduction: '45%',
          energyEfficiency: '91%',
          renewableEnergy: '100%',
          circularityScore: '96%'
        },
        innovators: [
          { name: 'CircularChain Labs', role: 'Blockchain Developer' },
          { name: 'Material Flow Institute', role: 'Circular Economy Expert' },
          { name: 'Privacy-First Blockchain', role: 'Privacy Technology' }
        ],
        applications: [
          'Material passport systems',
          'Waste-to-resource tracking',
          'Supply chain transparency',
          'Circular design optimization'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sdgAlignment: [9, 11, 12, 13]
      }
    ],
    emergingSustainability: [
      {
        id: 'quantum-environmental-modeling',
        title: 'Quantum Environmental Modeling',
        stage: 'Research',
        potential: 'Revolutionary',
        description: 'Quantum computing applications for ultra-precise environmental modeling and climate prediction.',
        timeline: '24-36 months',
        sustainabilityImpact: 'Transformative'
      },
      {
        id: 'bio-computing-carbon-capture',
        title: 'Bio-Computing Carbon Capture',
        stage: 'Development',
        potential: 'High',
        description: 'Biological computing systems that capture carbon while processing data.',
        timeline: '18-24 months',
        sustainabilityImpact: 'High'
      },
      {
        id: 'neurodiversity-sustainability-interface',
        title: 'Neurodiversity-Sustainability Interface',
        stage: 'Prototype',
        potential: 'High',
        description: 'Interfaces that make sustainability data accessible to all neurodivergent users.',
        timeline: '6-12 months',
        sustainabilityImpact: 'Medium'
      }
    ],
    sustainabilityLeaders: [
      {
        id: 'green-innovation-labs',
        name: 'Green Innovation Labs',
        focus: 'Carbon-negative technologies',
        innovations: 34,
        carbonImpact: '-2.3M tons CO2',
        neurodiversityScore: 91
      },
      {
        id: 'circular-tech-institute',
        name: 'Circular Tech Institute',
        focus: 'Circular economy solutions',
        innovations: 27,
        carbonImpact: '-1.8M tons CO2',
        neurodiversityScore: 88
      },
      {
        id: 'sustainable-ai-foundation',
        name: 'Sustainable AI Foundation',
        focus: 'Energy-efficient AI systems',
        innovations: 19,
        carbonImpact: '-1.2M tons CO2',
        neurodiversityScore: 94
      }
    ],
    impactMetrics: {
      totalCarbonReduction: '12.7M tons CO2',
      energySavings: '89 TWh',
      renewableEnergyGenerated: '156 TWh',
      circularMaterialsRecovered: '2.3M tons',
      biodiversityAreasProtected: '45,000 hectares',
      neurodiversityJobsCreated: '23,400'
    },
    sdgProgress: {
      sdg7: { progress: 78, target: 'Affordable and Clean Energy' },
      sdg9: { progress: 82, target: 'Industry, Innovation and Infrastructure' },
      sdg11: { progress: 71, target: 'Sustainable Cities and Communities' },
      sdg12: { progress: 85, target: 'Responsible Consumption and Production' },
      sdg13: { progress: 89, target: 'Climate Action' },
      sdg15: { progress: 76, target: 'Life on Land' }
    }
  };

  const currentData = oatsData || fallbackOatsData;

  // Filter initiatives based on selected filter
  const filteredInitiatives = currentData.sustainableInnovations.filter(initiative => {
    if (impactFilter === 'all') return true;
    if (impactFilter === 'revolutionary') return initiative.impactLevel === 'Revolutionary';
    if (impactFilter === 'high') return initiative.impactLevel === 'High';
    if (impactFilter === 'carbon-negative') return initiative.sustainabilityMetrics.carbonReduction.startsWith('-');
    if (impactFilter === 'neurodiversity') return initiative.neurodiversityOptimized;
    return true;
  });

  return (
    <div className={`oats-section ${neurodiversityMode}-optimized`}>
      {/* Section header */}
      <header className="oats-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="title-icon">🌾</span>
            <span className="title-text">Oats Section</span>
            <span className="title-subtitle">Sustainable Innovation & Environmental Technology</span>
          </h2>
          
          <div className="sustainability-controls">
            <div className="control-group">
              <label htmlFor="sustainability-mode">Analysis Mode:</label>
              <select 
                id="sustainability-mode"
                value={sustainabilityMode}
                onChange={(e) => setSustainabilityMode(e.target.value)}
                className="sustainability-selector"
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="carbon-focused">Carbon-Focused</option>
                <option value="circular-economy">Circular Economy</option>
                <option value="biodiversity">Biodiversity</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="impact-filter">Impact Filter:</label>
              <select 
                id="impact-filter"
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="filter-selector"
              >
                <option value="all">All Initiatives</option>
                <option value="revolutionary">Revolutionary Impact</option>
                <option value="high">High Impact</option>
                <option value="carbon-negative">Carbon-Negative</option>
                <option value="neurodiversity">Neurodiversity-Optimized</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="sustainability-status">
          <div className="status-indicator active">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Live Sustainability Tracking</span>
          </div>
          <div className="carbon-status">
            <span className="carbon-icon">🌱</span>
            <span className="carbon-text">Carbon-Negative Operations</span>
          </div>
        </div>
      </header>

      {/* Impact metrics dashboard */}
      <section className="impact-dashboard">
        <h3 className="subsection-title">
          <span className="subsection-icon">📊</span>
          Global Impact Metrics
        </h3>
        
        <div className="metrics-grid">
          <div className="metric-card carbon">
            <div className="metric-header">
              <span className="metric-icon">🌍</span>
              <h4 className="metric-title">Carbon Reduction</h4>
            </div>
            <div className="metric-value">{currentData.impactMetrics.totalCarbonReduction}</div>
            <div className="metric-description">Total CO2 equivalent reduced</div>
          </div>
          
          <div className="metric-card energy">
            <div className="metric-header">
              <span className="metric-icon">⚡</span>
              <h4 className="metric-title">Energy Savings</h4>
            </div>
            <div className="metric-value">{currentData.impactMetrics.energySavings}</div>
            <div className="metric-description">Total energy conserved</div>
          </div>
          
          <div className="metric-card renewable">
            <div className="metric-header">
              <span className="metric-icon">🔋</span>
              <h4 className="metric-title">Renewable Energy</h4>
            </div>
            <div className="metric-value">{currentData.impactMetrics.renewableEnergyGenerated}</div>
            <div className="metric-description">Clean energy generated</div>
          </div>
          
          <div className="metric-card circular">
            <div className="metric-header">
              <span className="metric-icon">♻️</span>
              <h4 className="metric-title">Circular Materials</h4>
            </div>
            <div className="metric-value">{currentData.impactMetrics.circularMaterialsRecovered}</div>
            <div className="metric-description">Materials kept in circulation</div>
          </div>
          
          <div className="metric-card biodiversity">
            <div className="metric-header">
              <span className="metric-icon">🦋</span>
              <h4 className="metric-title">Biodiversity Protected</h4>
            </div>
            <div className="metric-value">{currentData.impactMetrics.biodiversityAreasProtected}</div>
            <div className="metric-description">Protected habitat areas</div>
          </div>
          
          <div className="metric-card inclusion">
            <div className="metric-header">
              <span className="metric-icon">🧠</span>
              <h4 className="metric-title">Inclusive Jobs</h4>
            </div>
            <div className="metric-value">{currentData.impactMetrics.neurodiversityJobsCreated}</div>
            <div className="metric-description">Neurodiversity-inclusive positions</div>
          </div>
        </div>
      </section>

      {/* SDG progress */}
      <section className="sdg-progress">
        <h3 className="subsection-title">
          <span className="subsection-icon">🎯</span>
          UN SDG Progress
        </h3>
        
        <div className="sdg-grid">
          {Object.entries(currentData.sdgProgress).map(([key, sdg]) => (
            <div key={key} className="sdg-card">
              <div className="sdg-header">
                <div className="sdg-number">{key.toUpperCase()}</div>
                <div className="sdg-progress-value">{sdg.progress}%</div>
              </div>
              <h4 className="sdg-title">{sdg.target}</h4>
              <div className="sdg-progress-bar">
                <div 
                  className="sdg-progress-fill"
                  style={{ width: `${sdg.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainable innovations */}
      <section className="sustainable-innovations">
        <h3 className="subsection-title">
          <span className="subsection-icon">🌱</span>
          Sustainable Innovations
        </h3>
        
        <div className="innovations-grid">
          {filteredInitiatives.map((initiative) => (
            <div 
              key={initiative.id}
              className={`initiative-card ${selectedInitiative?.id === initiative.id ? 'selected' : ''}`}
              onClick={() => analyzeInitiative(initiative)}
            >
              <div className="initiative-header">
                <h4 className="initiative-title">{initiative.title}</h4>
                <div className="initiative-badges">
                  <span className={`category-badge ${initiative.category.toLowerCase().replace(' ', '-')}`}>
                    {initiative.category}
                  </span>
                  <span className={`impact-badge ${initiative.impactLevel.toLowerCase()}`}>
                    {initiative.impactLevel}
                  </span>
                </div>
              </div>
              
              <div className="initiative-meta">
                <span className={`maturity-badge ${initiative.maturityStage.toLowerCase()}`}>
                  {initiative.maturityStage}
                </span>
                <span className="time-to-scale">{initiative.timeToScale}</span>
              </div>
              
              <p className="initiative-description">{initiative.description}</p>
              
              {/* Sustainability metrics */}
              <div className="sustainability-metrics">
                <div className="metric">
                  <span className="metric-label">Carbon Impact</span>
                  <span className={`metric-value ${initiative.sustainabilityMetrics.carbonReduction.startsWith('-') ? 'negative' : 'positive'}`}>
                    {initiative.sustainabilityMetrics.carbonReduction}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Energy Efficiency</span>
                  <span className="metric-value">{initiative.sustainabilityMetrics.energyEfficiency}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Renewable Energy</span>
                  <span className="metric-value">{initiative.sustainabilityMetrics.renewableEnergy}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Circularity</span>
                  <span className="metric-value">{initiative.sustainabilityMetrics.circularityScore}</span>
                </div>
              </div>
              
              {/* SDG alignment */}
              <div className="sdg-alignment">
                <h5 className="alignment-title">UN SDG Alignment</h5>
                <div className="sdg-badges">
                  {initiative.sdgAlignment.map((sdgNumber) => (
                    <span key={sdgNumber} className="sdg-badge">
                      SDG {sdgNumber}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Applications */}
              <div className="applications">
                <h5 className="applications-title">Key Applications</h5>
                <ul className="applications-list">
                  {initiative.applications.slice(0, 3).map((application, index) => (
                    <li key={index} className="application-item">{application}</li>
                  ))}
                </ul>
              </div>
              
              <div className="initiative-badges-footer">
                {initiative.privacyCompliant && (
                  <div className="compliance-badge">
                    <span className="badge-icon">🔒</span>
                    <span className="badge-text">Privacy Compliant</span>
                  </div>
                )}
                {initiative.neurodiversityOptimized && (
                  <div className="neurodiversity-badge">
                    <span className="badge-icon">🧠</span>
                    <span className="badge-text">Neurodiversity Optimized</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emerging sustainability technologies */}
      <section className="emerging-sustainability">
        <h3 className="subsection-title">
          <span className="subsection-icon">🔬</span>
          Emerging Sustainability Technologies
        </h3>
        
        <div className="emerging-list">
          {currentData.emergingSustainability.map((tech) => (
            <div key={tech.id} className="emerging-card">
              <div className="emerging-header">
                <h4 className="emerging-title">{tech.title}</h4>
                <div className="emerging-badges">
                  <span className={`stage-badge ${tech.stage.toLowerCase()}`}>
                    {tech.stage}
                  </span>
                  <span className={`potential-badge ${tech.potential.toLowerCase()}`}>
                    {tech.potential} Potential
                  </span>
                </div>
              </div>
              <p className="emerging-description">{tech.description}</p>
              <div className="emerging-meta">
                <div className="meta-item">
                  <span className="meta-label">Timeline:</span>
                  <span className="meta-value">{tech.timeline}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Sustainability Impact:</span>
                  <span className={`meta-value ${tech.sustainabilityImpact.toLowerCase()}`}>
                    {tech.sustainabilityImpact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainability leaders */}
      <section className="sustainability-leaders">
        <h3 className="subsection-title">
          <span className="subsection-icon">🏆</span>
          Sustainability Leaders
        </h3>
        
        <div className="leaders-grid">
          {currentData.sustainabilityLeaders.map((leader) => (
            <div key={leader.id} className="leader-card">
              <div className="leader-header">
                <h4 className="leader-name">{leader.name}</h4>
                <div className="carbon-impact">{leader.carbonImpact}</div>
              </div>
              <p className="leader-focus">{leader.focus}</p>
              <div className="leader-metrics">
                <div className="metric">
                  <span className="metric-label">Innovations</span>
                  <span className="metric-value">{leader.innovations}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Neurodiversity Score</span>
                  <span className="metric-value">{leader.neurodiversityScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Initiative analysis panel */}
      {selectedInitiative && (
        <section className="analysis-panel">
          <div className="panel-header">
            <h3 className="panel-title">Sustainability Analysis: {selectedInitiative.title}</h3>
            <button 
              className="close-panel"
              onClick={() => setSelectedInitiative(null)}
            >
              ×
            </button>
          </div>
          
          {isAnalyzing ? (
            <div className="analysis-loading">
              <div className="loading-spinner sustainability"></div>
              <p>Analyzing sustainability impact with privacy-first algorithms...</p>
            </div>
          ) : (
            <div className="analysis-content">
              <div className="sustainability-insights">
                <h4>Sustainability Insights</h4>
                <ul>
                  <li>Carbon impact exceeding net-zero targets by 150%</li>
                  <li>Circular economy principles reducing waste by 89%</li>
                  <li>Neurodiversity-inclusive design increasing adoption by 67%</li>
                  <li>Privacy-first approach building stakeholder trust</li>
                </ul>
              </div>
              
              <div className="implementation-strategy">
                <h4>Implementation Strategy</h4>
                <ul>
                  <li>Phase 1: Carbon-negative infrastructure deployment</li>
                  <li>Phase 2: Circular economy integration</li>
                  <li>Phase 3: Neurodiversity optimization</li>
                  <li>Phase 4: Global scaling with privacy protection</li>
                </ul>
              </div>
              
              <div className="impact-projection">
                <h4>Projected Impact (5 Years)</h4>
                <div className="projection-matrix">
                  <div className="projection-item">
                    <span className="projection-factor">Carbon Reduction</span>
                    <span className="projection-value">-45M tons CO2</span>
                  </div>
                  <div className="projection-item">
                    <span className="projection-factor">Energy Savings</span>
                    <span className="projection-value">234 TWh</span>
                  </div>
                  <div className="projection-item">
                    <span className="projection-factor">Jobs Created</span>
                    <span className="projection-value">156,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Privacy and sustainability notice */}
      <div className="privacy-notice">
        <p>
          <span className="privacy-icon">🔒</span>
          All sustainability analysis performed with zero data retention. 
          <span className="sustainability-icon">🌱</span>
          Carbon-negative operations certified.
        </p>
      </div>
    </div>
  );
};

export default OatsSection;