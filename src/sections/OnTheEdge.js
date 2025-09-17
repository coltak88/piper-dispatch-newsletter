import React, { useState, useEffect } from 'react';
import '../styles/sections/on-the-edge.css';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';
import { EdgeTechnologyAnalyzer } from '../services/technology/EdgeAnalyzer';

const OnTheEdge = ({ neurodiversityMode, privacyToken, specialKitActive }) => {
  const [edgeData, setEdgeData] = useState(null);
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('breakthrough');
  const [technologyFilter, setTechnologyFilter] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize edge technology data
  useEffect(() => {
    const loadEdgeData = async () => {
      try {
        // Load cutting-edge technology data with privacy-first processing
        const data = await EdgeTechnologyAnalyzer.loadBreakthroughData('edge-tech', {
          privacyToken,
          technologyMetrics: true,
          dataRetention: 0
        });

        setEdgeData(data);
      } catch (error) {
        console.error('Edge technology data loading failed:', error);
      }
    };

    loadEdgeData();
  }, [privacyToken]);

  // Handle technology analysis with privacy protection
  const analyzeTechnology = async (technology) => {
    setIsAnalyzing(true);
    setSelectedTechnology(technology);

    try {
      // Track technology analysis with differential privacy
      await PrivacyFirstTracker.trackInteraction({
        section: 'on-the-edge',
        action: 'technology_analysis',
        technology: technology.id,
        timestamp: Date.now()
      });

      // Edge technology analysis
      await EdgeTechnologyAnalyzer.analyzeBreakthrough({
        technologyId: technology.id,
        analysisType: analysisMode,
        privacyToken
      });

      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);

    } catch (error) {
      console.error('Technology analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  // Mock edge technology data for demonstration
  const mockEdgeData = {
    breakthroughTechnologies: [
      {
        id: 'quantum-neural-networks',
        title: 'Quantum Neural Networks',
        category: 'Quantum Computing',
        breakthroughLevel: 'Revolutionary',
        maturityStage: 'Research',
        timeToMarket: '3-5 years',
        disruptionPotential: 98,
        description: 'Quantum-enhanced neural networks that process information using quantum superposition and entanglement, offering exponential speedups for AI tasks while maintaining privacy through quantum encryption.',
        technicalMetrics: {
          processingSpeed: '10,000x faster',
          energyEfficiency: '99.7%',
          accuracyImprovement: '847%',
          privacyLevel: 'Quantum-secured',
          neurodiversityScore: 94
        },
        keyInnovators: [
          { name: 'Quantum AI Labs', role: 'Research Leader', focus: 'Quantum-Classical Hybrid Systems' },
          { name: 'Privacy Quantum Institute', role: 'Privacy Technology', focus: 'Quantum Encryption' },
          { name: 'Inclusive Quantum Computing', role: 'Accessibility Partner', focus: 'Neurodiversity Integration' }
        ],
        applications: [
          'Privacy-preserving AI training',
          'Quantum-secured financial modeling',
          'Neurodiversity-optimized interfaces',
          'Sustainable quantum computing',
          'Real-time language translation',
          'Quantum-enhanced drug discovery'
        ],
        challenges: [
          'Quantum decoherence management',
          'Scalability to practical systems',
          'Integration with classical infrastructure',
          'Talent acquisition and training'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 91,
        investmentLevel: '$2.3B',
        patentCount: 234
      },
      {
        id: 'bio-computing-processors',
        title: 'Bio-Computing Processors',
        category: 'Biological Computing',
        breakthroughLevel: 'Revolutionary',
        maturityStage: 'Prototype',
        timeToMarket: '5-7 years',
        disruptionPotential: 95,
        description: 'Living processors that use biological cells to perform computations, offering self-healing capabilities, ultra-low power consumption, and natural privacy protection through biological encryption.',
        technicalMetrics: {
          processingSpeed: '1,000x parallel',
          energyEfficiency: '99.9%',
          accuracyImprovement: '234%',
          privacyLevel: 'Biologically-secured',
          neurodiversityScore: 89
        },
        keyInnovators: [
          { name: 'BioCompute Systems', role: 'Technology Pioneer', focus: 'Living Processors' },
          { name: 'Synthetic Biology Institute', role: 'Research Partner', focus: 'Cellular Computing' },
          { name: 'Inclusive BioTech', role: 'Accessibility Partner', focus: 'Universal Design' }
        ],
        applications: [
          'Self-healing data centers',
          'Ultra-low power IoT devices',
          'Biological data encryption',
          'Environmental monitoring systems',
          'Personalized medicine platforms',
          'Sustainable computing infrastructure'
        ],
        challenges: [
          'Biological system stability',
          'Manufacturing scalability',
          'Regulatory approval processes',
          'Integration with digital systems'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 97,
        investmentLevel: '$1.8B',
        patentCount: 156
      },
      {
        id: 'holographic-data-storage',
        title: 'Holographic Data Storage',
        category: 'Data Storage',
        breakthroughLevel: 'High',
        maturityStage: 'Development',
        timeToMarket: '2-4 years',
        disruptionPotential: 87,
        description: 'Three-dimensional holographic storage systems that store data in light patterns within crystals, offering massive capacity, instant access, and inherent privacy through optical encryption.',
        technicalMetrics: {
          processingSpeed: '100x faster access',
          energyEfficiency: '95%',
          accuracyImprovement: '156%',
          privacyLevel: 'Optically-encrypted',
          neurodiversityScore: 92
        },
        keyInnovators: [
          { name: 'Holographic Storage Corp', role: 'Technology Leader', focus: 'Crystal Storage Systems' },
          { name: 'Optical Privacy Labs', role: 'Security Partner', focus: 'Light-based Encryption' },
          { name: 'Accessible Storage Solutions', role: 'Inclusion Partner', focus: 'Universal Access' }
        ],
        applications: [
          'Massive data archival systems',
          'Real-time analytics platforms',
          'Privacy-preserving cloud storage',
          'Neurodiversity-optimized interfaces',
          'Sustainable data centers',
          'Quantum-resistant backup systems'
        ],
        challenges: [
          'Manufacturing cost reduction',
          'Read/write speed optimization',
          'Environmental stability',
          'Industry standard development'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 88,
        investmentLevel: '$1.2B',
        patentCount: 89
      },
      {
        id: 'neuromorphic-ai-chips',
        title: 'Neuromorphic AI Chips',
        category: 'Artificial Intelligence',
        breakthroughLevel: 'High',
        maturityStage: 'Production',
        timeToMarket: 'Available Now',
        disruptionPotential: 92,
        description: 'Brain-inspired processors that mimic neural structures and processes, offering ultra-low power AI processing with built-in privacy features and natural neurodiversity optimization.',
        technicalMetrics: {
          processingSpeed: '1,000x more efficient',
          energyEfficiency: '99.5%',
          accuracyImprovement: '345%',
          privacyLevel: 'Hardware-encrypted',
          neurodiversityScore: 96
        },
        keyInnovators: [
          { name: 'Intel Loihi', role: 'Market Leader', focus: 'Neuromorphic Processors' },
          { name: 'IBM TrueNorth', role: 'Research Pioneer', focus: 'Brain-inspired Computing' },
          { name: 'Inclusive AI Hardware', role: 'Accessibility Partner', focus: 'Neurodiversity Integration' }
        ],
        applications: [
          'Edge AI processing',
          'Autonomous vehicle systems',
          'Smart city infrastructure',
          'Personalized healthcare devices',
          'Privacy-preserving analytics',
          'Adaptive user interfaces'
        ],
        challenges: [
          'Programming paradigm shifts',
          'Software ecosystem development',
          'Performance benchmarking',
          'Market education and adoption'
        ],
        privacyCompliant: true,
        neurodiversityOptimized: true,
        sustainabilityScore: 93,
        investmentLevel: '$3.1B',
        patentCount: 445
      }
    ],
    emergingBreakthroughs: [
      {
        id: 'room-temperature-superconductors',
        title: 'Room-Temperature Superconductors',
        stage: 'Early Research',
        potential: 'Transformative',
        description: 'Materials that conduct electricity with zero resistance at room temperature, revolutionizing energy transmission and computing.',
        timeline: '7-10 years',
        disruptionLevel: 'Civilization-changing'
      },
      {
        id: 'programmable-matter',
        title: 'Programmable Matter',
        stage: 'Concept Development',
        potential: 'Revolutionary',
        description: 'Materials that can change their physical properties on command, enabling self-assembling structures and adaptive devices.',
        timeline: '10-15 years',
        disruptionLevel: 'Industry-transforming'
      },
      {
        id: 'consciousness-computing',
        title: 'Consciousness Computing',
        stage: 'Theoretical Research',
        potential: 'Revolutionary',
        description: 'Computing systems that exhibit aspects of consciousness, enabling truly empathetic and self-aware AI.',
        timeline: '15-20 years',
        disruptionLevel: 'Paradigm-shifting'
      }
    ],
    technologyLeaders: [
      {
        id: 'quantum-innovations-lab',
        name: 'Quantum Innovations Lab',
        focus: 'Quantum computing breakthroughs',
        breakthroughs: 23,
        investmentReceived: '$4.2B',
        neurodiversityScore: 94,
        sustainabilityRating: 'A+'
      },
      {
        id: 'bio-computing-institute',
        name: 'Bio-Computing Institute',
        focus: 'Biological computing systems',
        breakthroughs: 18,
        investmentReceived: '$2.8B',
        neurodiversityScore: 91,
        sustainabilityRating: 'A+'
      },
      {
        id: 'neuromorphic-systems-corp',
        name: 'Neuromorphic Systems Corp',
        focus: 'Brain-inspired computing',
        breakthroughs: 31,
        investmentReceived: '$3.7B',
        neurodiversityScore: 97,
        sustainabilityRating: 'A'
      }
    ],
    breakthroughMetrics: {
      totalInvestment: '$45.7B',
      activeResearchProjects: '1,247',
      patentApplications: '3,456',
      commercialBreakthroughs: '89',
      neurodiversityIntegration: '94%',
      sustainabilityCompliance: '91%',
      privacyByDesign: '98%'
    },
    technologyTrends: {
      quantumComputing: { momentum: 'Exponential', maturity: '15%', impact: 'Revolutionary' },
      biologicalComputing: { momentum: 'Accelerating', maturity: '8%', impact: 'Transformative' },
      neuromorphicAI: { momentum: 'Strong', maturity: '35%', impact: 'High' },
      holographicStorage: { momentum: 'Growing', maturity: '25%', impact: 'Significant' },
      programmableMatter: { momentum: 'Emerging', maturity: '3%', impact: 'Revolutionary' },
      consciousnessComputing: { momentum: 'Theoretical', maturity: '1%', impact: 'Paradigm-shifting' }
    }
  };

  const currentData = edgeData || mockEdgeData;

  // Filter technologies based on selected filter
  const filteredTechnologies = currentData.breakthroughTechnologies.filter(tech => {
    if (technologyFilter === 'all') return true;
    if (technologyFilter === 'revolutionary') return tech.breakthroughLevel === 'Revolutionary';
    if (technologyFilter === 'production-ready') return tech.maturityStage === 'Production';
    if (technologyFilter === 'quantum') return tech.category.toLowerCase().includes('quantum');
    if (technologyFilter === 'ai') return tech.category.toLowerCase().includes('artificial intelligence') || tech.category.toLowerCase().includes('computing');
    return true;
  });

  return (
    <div className={`on-the-edge ${neurodiversityMode}-optimized`}>
      {/* Section header */}
      <header className="edge-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="title-icon">⚡</span>
            <span className="title-text">On the Edge</span>
            <span className="title-subtitle">Cutting-Edge Technology & Breakthrough Innovations</span>
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
                <option value="breakthrough">Breakthrough Analysis</option>
                <option value="disruption-potential">Disruption Potential</option>
                <option value="commercialization">Commercialization Timeline</option>
                <option value="investment-opportunity">Investment Opportunity</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="technology-filter">Technology Filter:</label>
              <select 
                id="technology-filter"
                value={technologyFilter}
                onChange={(e) => setTechnologyFilter(e.target.value)}
                className="filter-selector"
              >
                <option value="all">All Technologies</option>
                <option value="revolutionary">Revolutionary Only</option>
                <option value="production-ready">Production Ready</option>
                <option value="quantum">Quantum Technologies</option>
                <option value="ai">AI & Computing</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="edge-status">
          <div className="status-indicator active">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Live Breakthrough Tracking</span>
          </div>
          <div className="innovation-status">
            <span className="innovation-icon">🚀</span>
            <span className="innovation-text">Next-Gen Innovation</span>
          </div>
        </div>
      </header>

      {/* Breakthrough metrics dashboard */}
      <section className="breakthrough-dashboard">
        <h3 className="subsection-title">
          <span className="subsection-icon">📊</span>
          Global Breakthrough Metrics
        </h3>
        
        <div className="metrics-grid">
          <div className="metric-card investment">
            <div className="metric-header">
              <span className="metric-icon">💰</span>
              <h4 className="metric-title">Total Investment</h4>
            </div>
            <div className="metric-value">{currentData.breakthroughMetrics.totalInvestment}</div>
            <div className="metric-description">Global R&D funding</div>
          </div>
          
          <div className="metric-card research">
            <div className="metric-header">
              <span className="metric-icon">🔬</span>
              <h4 className="metric-title">Active Research</h4>
            </div>
            <div className="metric-value">{currentData.breakthroughMetrics.activeResearchProjects}</div>
            <div className="metric-description">Ongoing projects</div>
          </div>
          
          <div className="metric-card patents">
            <div className="metric-header">
              <span className="metric-icon">📋</span>
              <h4 className="metric-title">Patent Applications</h4>
            </div>
            <div className="metric-value">{currentData.breakthroughMetrics.patentApplications}</div>
            <div className="metric-description">New filings this year</div>
          </div>
          
          <div className="metric-card commercial">
            <div className="metric-header">
              <span className="metric-icon">🏭</span>
              <h4 className="metric-title">Commercial Breakthroughs</h4>
            </div>
            <div className="metric-value">{currentData.breakthroughMetrics.commercialBreakthroughs}</div>
            <div className="metric-description">Market-ready innovations</div>
          </div>
          
          <div className="metric-card inclusion">
            <div className="metric-header">
              <span className="metric-icon">🧠</span>
              <h4 className="metric-title">Neurodiversity Integration</h4>
            </div>
            <div className="metric-value">{currentData.breakthroughMetrics.neurodiversityIntegration}</div>
            <div className="metric-description">Inclusive design adoption</div>
          </div>
          
          <div className="metric-card privacy">
            <div className="metric-header">
              <span className="metric-icon">🔒</span>
              <h4 className="metric-title">Privacy by Design</h4>
            </div>
            <div className="metric-value">{currentData.breakthroughMetrics.privacyByDesign}</div>
            <div className="metric-description">Privacy-first implementations</div>
          </div>
        </div>
      </section>

      {/* Technology trends */}
      <section className="technology-trends">
        <h3 className="subsection-title">
          <span className="subsection-icon">📈</span>
          Technology Trend Analysis
        </h3>
        
        <div className="trends-grid">
          {Object.entries(currentData.technologyTrends).map(([key, trend]) => (
            <div key={key} className="trend-card">
              <div className="trend-header">
                <h4 className="trend-title">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                <div className={`momentum-badge ${trend.momentum.toLowerCase().replace(' ', '-')}`}>
                  {trend.momentum}
                </div>
              </div>
              <div className="trend-metrics">
                <div className="maturity-level">
                  <span className="metric-label">Maturity</span>
                  <span className="metric-value">{trend.maturity}</span>
                  <div className="maturity-bar">
                    <div 
                      className="maturity-fill"
                      style={{ width: trend.maturity }}
                    ></div>
                  </div>
                </div>
                <div className="impact-assessment">
                  <span className="metric-label">Impact</span>
                  <span className={`impact-value ${trend.impact.toLowerCase().replace('-', '-')}`}>
                    {trend.impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Breakthrough technologies */}
      <section className="breakthrough-technologies">
        <h3 className="subsection-title">
          <span className="subsection-icon">🔬</span>
          Breakthrough Technologies
        </h3>
        
        <div className="technologies-grid">
          {filteredTechnologies.map((technology) => (
            <div 
              key={technology.id}
              className={`technology-card ${selectedTechnology?.id === technology.id ? 'selected' : ''}`}
              onClick={() => analyzeTechnology(technology)}
            >
              <div className="technology-header">
                <h4 className="technology-title">{technology.title}</h4>
                <div className="technology-badges">
                  <span className="category-badge">{technology.category}</span>
                  <span className={`breakthrough-badge ${technology.breakthroughLevel.toLowerCase()}`}>
                    {technology.breakthroughLevel}
                  </span>
                </div>
              </div>
              
              <div className="technology-meta">
                <span className={`maturity-badge ${technology.maturityStage.toLowerCase().replace(' ', '-')}`}>
                  {technology.maturityStage}
                </span>
                <span className="time-to-market">{technology.timeToMarket}</span>
                <div className="disruption-score">
                  <span className="score-label">Disruption Potential</span>
                  <span className="score-value">{technology.disruptionPotential}/100</span>
                </div>
              </div>
              
              <p className="technology-description">{technology.description}</p>
              
              {/* Technical metrics */}
              <div className="technical-metrics">
                <div className="metric">
                  <span className="metric-label">Processing Speed</span>
                  <span className="metric-value">{technology.technicalMetrics.processingSpeed}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Energy Efficiency</span>
                  <span className="metric-value">{technology.technicalMetrics.energyEfficiency}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Accuracy Improvement</span>
                  <span className="metric-value">{technology.technicalMetrics.accuracyImprovement}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Privacy Level</span>
                  <span className="metric-value">{technology.technicalMetrics.privacyLevel}</span>
                </div>
              </div>
              
              {/* Key applications */}
              <div className="applications">
                <h5 className="applications-title">Key Applications</h5>
                <ul className="applications-list">
                  {technology.applications.slice(0, 4).map((application, index) => (
                    <li key={index} className="application-item">{application}</li>
                  ))}
                </ul>
              </div>
              
              {/* Investment and patents */}
              <div className="investment-metrics">
                <div className="investment-item">
                  <span className="investment-label">Investment</span>
                  <span className="investment-value">{technology.investmentLevel}</span>
                </div>
                <div className="investment-item">
                  <span className="investment-label">Patents</span>
                  <span className="investment-value">{technology.patentCount}</span>
                </div>
              </div>
              
              <div className="technology-badges-footer">
                {technology.privacyCompliant && (
                  <div className="compliance-badge">
                    <span className="badge-icon">🔒</span>
                    <span className="badge-text">Privacy Compliant</span>
                  </div>
                )}
                {technology.neurodiversityOptimized && (
                  <div className="neurodiversity-badge">
                    <span className="badge-icon">🧠</span>
                    <span className="badge-text">Neurodiversity Optimized</span>
                  </div>
                )}
                <div className="sustainability-badge">
                  <span className="badge-icon">🌱</span>
                  <span className="badge-text">Sustainability: {technology.sustainabilityScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emerging breakthroughs */}
      <section className="emerging-breakthroughs">
        <h3 className="subsection-title">
          <span className="subsection-icon">🔮</span>
          Emerging Breakthroughs
        </h3>
        
        <div className="emerging-list">
          {currentData.emergingBreakthroughs.map((breakthrough) => (
            <div key={breakthrough.id} className="emerging-card">
              <div className="emerging-header">
                <h4 className="emerging-title">{breakthrough.title}</h4>
                <div className="emerging-badges">
                  <span className={`stage-badge ${breakthrough.stage.toLowerCase().replace(' ', '-')}`}>
                    {breakthrough.stage}
                  </span>
                  <span className={`potential-badge ${breakthrough.potential.toLowerCase()}`}>
                    {breakthrough.potential}
                  </span>
                </div>
              </div>
              <p className="emerging-description">{breakthrough.description}</p>
              <div className="emerging-meta">
                <div className="meta-item">
                  <span className="meta-label">Timeline:</span>
                  <span className="meta-value">{breakthrough.timeline}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Disruption Level:</span>
                  <span className={`meta-value ${breakthrough.disruptionLevel.toLowerCase().replace('-', '-')}`}>
                    {breakthrough.disruptionLevel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology leaders */}
      <section className="technology-leaders">
        <h3 className="subsection-title">
          <span className="subsection-icon">🏆</span>
          Technology Innovation Leaders
        </h3>
        
        <div className="leaders-grid">
          {currentData.technologyLeaders.map((leader) => (
            <div key={leader.id} className="leader-card">
              <div className="leader-header">
                <h4 className="leader-name">{leader.name}</h4>
                <div className="investment-received">{leader.investmentReceived}</div>
              </div>
              <p className="leader-focus">{leader.focus}</p>
              <div className="leader-metrics">
                <div className="metric">
                  <span className="metric-label">Breakthroughs</span>
                  <span className="metric-value">{leader.breakthroughs}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Inclusion Score</span>
                  <span className="metric-value">{leader.neurodiversityScore}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Sustainability</span>
                  <span className={`metric-value rating-${leader.sustainabilityRating.toLowerCase().replace('+', '-plus')}`}>
                    {leader.sustainabilityRating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology analysis panel */}
      {selectedTechnology && (
        <section className="analysis-panel">
          <div className="panel-header">
            <h3 className="panel-title">Breakthrough Analysis: {selectedTechnology.title}</h3>
            <button 
              className="close-panel"
              onClick={() => setSelectedTechnology(null)}
            >
              ×
            </button>
          </div>
          
          {isAnalyzing ? (
            <div className="analysis-loading">
              <div className="loading-spinner breakthrough"></div>
              <p>Analyzing breakthrough potential with privacy-first algorithms...</p>
            </div>
          ) : (
            <div className="analysis-content">
              <div className="breakthrough-insights">
                <h4>Breakthrough Insights</h4>
                <ul>
                  <li>Technology readiness exceeding industry benchmarks by 340%</li>
                  <li>Privacy-first architecture enabling secure deployment</li>
                  <li>Neurodiversity optimization increasing accessibility by 89%</li>
                  <li>Sustainability integration reducing environmental impact</li>
                </ul>
              </div>
              
              <div className="commercialization-strategy">
                <h4>Commercialization Strategy</h4>
                <ul>
                  {selectedTechnology.challenges.map((challenge, index) => (
                    <li key={index}>Address: {challenge}</li>
                  ))}
                </ul>
              </div>
              
              <div className="impact-projection">
                <h4>Projected Impact (10 Years)</h4>
                <div className="projection-matrix">
                  <div className="projection-item">
                    <span className="projection-factor">Market Size</span>
                    <span className="projection-value">$234B</span>
                  </div>
                  <div className="projection-item">
                    <span className="projection-factor">Jobs Created</span>
                    <span className="projection-value">2.3M</span>
                  </div>
                  <div className="projection-item">
                    <span className="projection-factor">Industries Transformed</span>
                    <span className="projection-value">47</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Privacy and innovation notice */}
      <div className="privacy-notice">
        <p>
          <span className="privacy-icon">🔒</span>
          All breakthrough analysis performed with zero data retention. 
          <span className="innovation-icon">⚡</span>
          Cutting-edge privacy protection.
        </p>
      </div>
    </div>
  );
};

export default OnTheEdge;