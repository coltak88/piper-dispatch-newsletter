import React, { useState, useEffect } from 'react';
import '../styles/icp/icp-pathways.css';

/**
 * ICP (Ideal Customer Profile) Implementation Pathways Integration System
 * Provides personalized content and features for:
 * - Global E-Commerce Innovator
 * - Underestimated Founder
 * - Tech-Forward Scaler
 * - Inclusive Culture Builder
 */

const ICPPathways = ({ 
  currentICP = null, 
  onICPChange, 
  children,
  sectionType = 'general'
}) => {
  const [selectedICP, setSelectedICP] = useState(currentICP);
  const [icpData, setICPData] = useState(null);
  const [personalizationLevel, setPersonalizationLevel] = useState('standard');
  const [isOnboarding, setIsOnboarding] = useState(!currentICP);
  const [preferences, setPreferences] = useState({});

  // ICP pathway definitions with comprehensive profiles
  const icpPathways = {
    'global-ecommerce': {
      id: 'global-ecommerce',
      name: 'Global E-Commerce Innovator',
      icon: '🌐',
      description: 'Scaling e-commerce operations across international markets',
      primaryFocus: ['market-expansion', 'supply-chain', 'customer-acquisition', 'technology-integration'],
      keyMetrics: ['GMV', 'CAC', 'LTV', 'Market Penetration', 'Cross-border Conversion'],
      challenges: [
        'Multi-currency payment processing',
        'International shipping logistics',
        'Cross-cultural marketing',
        'Regulatory compliance across markets',
        'Inventory management at scale'
      ],
      opportunities: [
        'Emerging market penetration',
        'AI-powered personalization',
        'Sustainable logistics solutions',
        'Social commerce integration',
        'Voice commerce adoption'
      ],
      contentPreferences: {
        'the-signal': ['market-intelligence', 'consumer-trends', 'regulatory-updates'],
        'capital-flows': ['venture-funding', 'market-valuations', 'acquisition-activity'],
        'the-vanguard': ['ecommerce-tech', 'payment-innovations', 'logistics-tech'],
        'oats-section': ['sustainable-packaging', 'green-logistics', 'circular-economy'],
        'eastern-meridian': ['apac-markets', 'cross-border-trade', 'digital-payments'],
        'on-the-edge': ['ar-vr-commerce', 'blockchain-supply-chain', 'ai-personalization']
      },
      actionableInsights: [
        'Market entry timing recommendations',
        'Competitive positioning analysis',
        'Technology adoption roadmaps',
        'Partnership opportunity identification',
        'Risk mitigation strategies'
      ],
      tools: [
        'Market Opportunity Calculator',
        'Cross-border Compliance Checker',
        'Currency Risk Analyzer',
        'Logistics Cost Optimizer',
        'Customer Acquisition Forecaster'
      ]
    },
    
    'underestimated-founder': {
      id: 'underestimated-founder',
      name: 'Underestimated Founder',
      icon: '💎',
      description: 'Breaking barriers and building exceptional companies despite systemic challenges',
      primaryFocus: ['funding-access', 'network-building', 'market-validation', 'team-scaling'],
      keyMetrics: ['Funding Raised', 'Network Growth', 'Product-Market Fit', 'Team Diversity', 'Market Traction'],
      challenges: [
        'Limited access to traditional funding',
        'Smaller professional networks',
        'Bias in market validation',
        'Talent acquisition competition',
        'Visibility and recognition gaps'
      ],
      opportunities: [
        'Alternative funding mechanisms',
        'Community-driven growth',
        'Authentic brand storytelling',
        'Diverse market insights',
        'Innovation through constraint'
      ],
      contentPreferences: {
        'the-signal': ['funding-trends', 'diversity-metrics', 'market-opportunities'],
        'capital-flows': ['alternative-funding', 'diversity-focused-vcs', 'grant-opportunities'],
        'the-vanguard': ['inclusive-tech', 'accessibility-innovations', 'community-platforms'],
        'oats-section': ['social-impact', 'community-sustainability', 'ethical-business'],
        'eastern-meridian': ['emerging-markets', 'diaspora-networks', 'cultural-innovation'],
        'on-the-edge': ['democratizing-tech', 'no-code-platforms', 'community-tools']
      },
      actionableInsights: [
        'Alternative funding pathway recommendations',
        'Network expansion strategies',
        'Bias mitigation techniques',
        'Community building frameworks',
        'Authentic storytelling approaches'
      ],
      tools: [
        'Funding Pathway Mapper',
        'Network Growth Tracker',
        'Bias Detection Analyzer',
        'Community Engagement Planner',
        'Story Impact Measurer'
      ]
    },
    
    'tech-forward-scaler': {
      id: 'tech-forward-scaler',
      name: 'Tech-Forward Scaler',
      icon: '🚀',
      description: 'Leveraging cutting-edge technology to achieve rapid, sustainable growth',
      primaryFocus: ['technology-adoption', 'automation-scaling', 'data-optimization', 'innovation-integration'],
      keyMetrics: ['Tech ROI', 'Automation Rate', 'Data Quality Score', 'Innovation Velocity', 'Scalability Index'],
      challenges: [
        'Technology integration complexity',
        'Skill gap in emerging technologies',
        'Balancing innovation with stability',
        'Data privacy and security',
        'Vendor selection and management'
      ],
      opportunities: [
        'AI and ML implementation',
        'Blockchain integration',
        'IoT ecosystem development',
        'Edge computing adoption',
        'Quantum computing preparation'
      ],
      contentPreferences: {
        'the-signal': ['tech-trends', 'adoption-rates', 'innovation-cycles'],
        'capital-flows': ['tech-investments', 'startup-valuations', 'acquisition-multiples'],
        'the-vanguard': ['emerging-technologies', 'implementation-strategies', 'tech-leadership'],
        'oats-section': ['green-tech', 'sustainable-computing', 'energy-efficiency'],
        'eastern-meridian': ['tech-hubs', 'innovation-ecosystems', 'talent-markets'],
        'on-the-edge': ['breakthrough-tech', 'research-developments', 'future-applications']
      },
      actionableInsights: [
        'Technology adoption roadmaps',
        'Implementation risk assessments',
        'ROI optimization strategies',
        'Skill development priorities',
        'Innovation pipeline management'
      ],
      tools: [
        'Tech Stack Optimizer',
        'Implementation Risk Calculator',
        'ROI Projection Modeler',
        'Skill Gap Analyzer',
        'Innovation Pipeline Tracker'
      ]
    },
    
    'inclusive-culture-builder': {
      id: 'inclusive-culture-builder',
      name: 'Inclusive Culture Builder',
      icon: '🤝',
      description: 'Creating diverse, equitable, and inclusive organizations that drive innovation',
      primaryFocus: ['diversity-equity', 'inclusive-leadership', 'culture-measurement', 'systemic-change'],
      keyMetrics: ['Diversity Index', 'Inclusion Score', 'Equity Metrics', 'Culture Health', 'Innovation Diversity'],
      challenges: [
        'Measuring culture effectively',
        'Addressing unconscious bias',
        'Scaling inclusive practices',
        'Balancing diverse perspectives',
        'Sustaining long-term change'
      ],
      opportunities: [
        'Enhanced innovation through diversity',
        'Improved market understanding',
        'Stronger talent attraction',
        'Better risk management',
        'Increased stakeholder trust'
      ],
      contentPreferences: {
        'the-signal': ['diversity-trends', 'inclusion-research', 'culture-metrics'],
        'capital-flows': ['esg-investing', 'diversity-funds', 'impact-investments'],
        'the-vanguard': ['inclusive-design', 'accessibility-tech', 'culture-platforms'],
        'oats-section': ['social-sustainability', 'community-impact', 'ethical-practices'],
        'eastern-meridian': ['global-diversity', 'cultural-intelligence', 'inclusive-markets'],
        'on-the-edge': ['bias-detection-ai', 'inclusive-algorithms', 'culture-analytics']
      },
      actionableInsights: [
        'Culture assessment frameworks',
        'Bias mitigation strategies',
        'Inclusive leadership development',
        'Diversity recruitment approaches',
        'Systemic change methodologies'
      ],
      tools: [
        'Culture Health Monitor',
        'Bias Impact Analyzer',
        'Inclusion Opportunity Mapper',
        'Diversity Pipeline Tracker',
        'Change Impact Measurer'
      ]
    }
  };

  // Load saved ICP and preferences
  useEffect(() => {
    const savedICP = localStorage.getItem('piper-selected-icp');
    const savedPreferences = localStorage.getItem('piper-icp-preferences');
    const savedPersonalization = localStorage.getItem('piper-personalization-level');
    
    if (savedICP && icpPathways[savedICP]) {
      setSelectedICP(savedICP);
      setICPData(icpPathways[savedICP]);
      setIsOnboarding(false);
    }
    
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
    
    if (savedPersonalization) {
      setPersonalizationLevel(savedPersonalization);
    }
  }, []);

  // Handle ICP selection
  const handleICPSelection = (icpId) => {
    const icp = icpPathways[icpId];
    setSelectedICP(icpId);
    setICPData(icp);
    setIsOnboarding(false);
    
    // Save selection
    localStorage.setItem('piper-selected-icp', icpId);
    
    // Notify parent component
    if (onICPChange) {
      onICPChange(icp);
    }
  };

  // Update preferences
  const updatePreferences = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('piper-icp-preferences', JSON.stringify(updated));
  };

  // Get personalized content for current section
  const getPersonalizedContent = (sectionType) => {
    if (!icpData || !icpData.contentPreferences[sectionType]) {
      return null;
    }
    
    return icpData.contentPreferences[sectionType];
  };

  // Generate actionable insights based on ICP
  const generateActionableInsights = () => {
    if (!icpData) return [];
    
    return icpData.actionableInsights.map((insight, index) => ({
      id: `insight-${index}`,
      title: insight,
      priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
      category: icpData.primaryFocus[index % icpData.primaryFocus.length],
      relevanceScore: Math.floor(Math.random() * 30) + 70 // Simulated relevance
    }));
  };

  // ICP onboarding component
  const ICPOnboarding = () => (
    <div className="icp-onboarding">
      <div className="onboarding-header">
        <h2 className="onboarding-title">
          <span className="title-icon">🎯</span>
          Choose Your Pathway
        </h2>
        <p className="onboarding-description">
          Select the profile that best matches your business focus to receive personalized insights and recommendations.
        </p>
      </div>
      
      <div className="icp-grid">
        {Object.values(icpPathways).map(icp => (
          <div 
            key={icp.id}
            className="icp-card"
            onClick={() => handleICPSelection(icp.id)}
          >
            <div className="card-header">
              <span className="card-icon">{icp.icon}</span>
              <h3 className="card-title">{icp.name}</h3>
            </div>
            
            <p className="card-description">{icp.description}</p>
            
            <div className="card-focus">
              <h4 className="focus-title">Primary Focus Areas:</h4>
              <ul className="focus-list">
                {icp.primaryFocus.slice(0, 3).map(focus => (
                  <li key={focus} className="focus-item">
                    {focus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card-metrics">
              <h4 className="metrics-title">Key Metrics:</h4>
              <div className="metrics-tags">
                {icp.keyMetrics.slice(0, 3).map(metric => (
                  <span key={metric} className="metric-tag">{metric}</span>
                ))}
              </div>
            </div>
            
            <button className="select-button">
              <span className="button-text">Select This Pathway</span>
              <span className="button-arrow">→</span>
            </button>
          </div>
        ))}
      </div>
      
      <div className="onboarding-footer">
        <p className="footer-note">
          Don't worry - you can change your pathway anytime or customize your preferences later.
        </p>
      </div>
    </div>
  );

  // ICP dashboard component
  const ICPDashboard = () => {
    const insights = generateActionableInsights();
    
    return (
      <div className="icp-dashboard">
        <div className="dashboard-header">
          <div className="current-icp">
            <span className="icp-icon">{icpData.icon}</span>
            <div className="icp-info">
              <h3 className="icp-name">{icpData.name}</h3>
              <p className="icp-description">{icpData.description}</p>
            </div>
          </div>
          
          <div className="dashboard-controls">
            <button 
              className="change-icp-button"
              onClick={() => setIsOnboarding(true)}
            >
              <span className="control-icon">🔄</span>
              <span className="control-text">Change Pathway</span>
            </button>
            
            <select 
              className="personalization-selector"
              value={personalizationLevel}
              onChange={(e) => {
                setPersonalizationLevel(e.target.value);
                localStorage.setItem('piper-personalization-level', e.target.value);
              }}
            >
              <option value="minimal">Minimal Personalization</option>
              <option value="standard">Standard Personalization</option>
              <option value="advanced">Advanced Personalization</option>
            </select>
          </div>
        </div>
        
        {/* Personalized insights */}
        <div className="insights-section">
          <h4 className="section-title">
            <span className="title-icon">💡</span>
            Personalized Insights
          </h4>
          
          <div className="insights-grid">
            {insights.slice(0, 3).map(insight => (
              <div key={insight.id} className={`insight-card ${insight.priority}`}>
                <div className="insight-header">
                  <span className="insight-category">{insight.category.replace('-', ' ')}</span>
                  <span className="insight-priority">{insight.priority}</span>
                </div>
                <h5 className="insight-title">{insight.title}</h5>
                <div className="insight-relevance">
                  <span className="relevance-label">Relevance:</span>
                  <div className="relevance-bar">
                    <div 
                      className="relevance-fill"
                      style={{ width: `${insight.relevanceScore}%` }}
                    ></div>
                  </div>
                  <span className="relevance-score">{insight.relevanceScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Key metrics tracking */}
        <div className="metrics-section">
          <h4 className="section-title">
            <span className="title-icon">📊</span>
            Key Metrics for {icpData.name}
          </h4>
          
          <div className="metrics-grid">
            {icpData.keyMetrics.map(metric => (
              <div key={metric} className="metric-card">
                <h5 className="metric-name">{metric}</h5>
                <div className="metric-value">
                  <span className="value-number">{Math.floor(Math.random() * 100)}</span>
                  <span className="value-unit">%</span>
                </div>
                <div className="metric-trend">
                  <span className="trend-indicator positive">↗</span>
                  <span className="trend-text">+{Math.floor(Math.random() * 20)}% this month</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Challenges and opportunities */}
        <div className="challenges-opportunities">
          <div className="challenges-section">
            <h4 className="section-title">
              <span className="title-icon">⚠️</span>
              Key Challenges
            </h4>
            
            <ul className="challenges-list">
              {icpData.challenges.slice(0, 3).map(challenge => (
                <li key={challenge} className="challenge-item">
                  <span className="challenge-text">{challenge}</span>
                  <button className="challenge-action">Address</button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="opportunities-section">
            <h4 className="section-title">
              <span className="title-icon">🎯</span>
              Key Opportunities
            </h4>
            
            <ul className="opportunities-list">
              {icpData.opportunities.slice(0, 3).map(opportunity => (
                <li key={opportunity} className="opportunity-item">
                  <span className="opportunity-text">{opportunity}</span>
                  <button className="opportunity-action">Explore</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Available tools */}
        <div className="tools-section">
          <h4 className="section-title">
            <span className="title-icon">🛠️</span>
            Recommended Tools
          </h4>
          
          <div className="tools-grid">
            {icpData.tools.map(tool => (
              <div key={tool} className="tool-card">
                <h5 className="tool-name">{tool}</h5>
                <button className="tool-launch">Launch Tool</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Content personalization overlay
  const PersonalizationOverlay = () => {
    const personalizedContent = getPersonalizedContent(sectionType);
    
    if (!personalizedContent || personalizationLevel === 'minimal') {
      return null;
    }
    
    return (
      <div className="personalization-overlay">
        <div className="overlay-header">
          <span className="overlay-icon">{icpData.icon}</span>
          <span className="overlay-text">Personalized for {icpData.name}</span>
        </div>
        
        <div className="overlay-content">
          <h5 className="content-title">Focus Areas for This Section:</h5>
          <ul className="content-list">
            {personalizedContent.map(content => (
              <li key={content} className="content-item">
                {content.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="icp-pathways">
      {isOnboarding ? (
        <ICPOnboarding />
      ) : (
        <>
          <ICPDashboard />
          <PersonalizationOverlay />
        </>
      )}
      
      {/* Main content with ICP context */}
      <div className="icp-content">
        {children}
      </div>
    </div>
  );
};

// Higher-order component for ICP-aware sections
export const withICPPersonalization = (WrappedComponent, sectionType) => {
  return function ICPPersonalizedComponent(props) {
    const [currentICP, setCurrentICP] = useState(null);
    
    return (
      <ICPPathways 
        currentICP={currentICP}
        onICPChange={setCurrentICP}
        sectionType={sectionType}
      >
        <WrappedComponent 
          {...props}
          currentICP={currentICP}
          sectionType={sectionType}
        />
      </ICPPathways>
    );
  };
};

// Utility functions for ICP-based personalization
export const ICPUtils = {
  // Get content relevance score for current ICP
  getContentRelevance: (content, icpId, sectionType) => {
    // Implementation would analyze content against ICP preferences
    return Math.floor(Math.random() * 40) + 60; // Simulated score
  },
  
  // Filter content based on ICP preferences
  filterContentByICP: (contentArray, icpId, sectionType) => {
    // Implementation would filter and sort content by relevance
    return contentArray.sort(() => Math.random() - 0.5);
  },
  
  // Generate ICP-specific recommendations
  generateRecommendations: (icpId, context) => {
    const recommendations = {
      'global-ecommerce': [
        'Consider expanding to Southeast Asian markets',
        'Implement AI-powered inventory optimization',
        'Explore sustainable packaging solutions'
      ],
      'underestimated-founder': [
        'Apply for diversity-focused accelerator programs',
        'Build strategic partnerships with established players',
        'Leverage community-driven marketing approaches'
      ],
      'tech-forward-scaler': [
        'Evaluate quantum computing applications',
        'Implement edge computing for real-time processing',
        'Adopt blockchain for supply chain transparency'
      ],
      'inclusive-culture-builder': [
        'Implement bias-detection AI in hiring processes',
        'Create inclusive design guidelines',
        'Establish culture measurement frameworks'
      ]
    };
    
    return recommendations[icpId] || [];
  },
  
  // Calculate ICP alignment score
  calculateAlignmentScore: (userProfile, icpId) => {
    // Implementation would analyze user profile against ICP characteristics
    return Math.floor(Math.random() * 30) + 70; // Simulated score
  },
  
  // Get next best actions for ICP
  getNextActions: (icpId, currentContext) => {
    const actions = {
      'global-ecommerce': [
        { action: 'Market Research', priority: 'high', timeframe: '1-2 weeks' },
        { action: 'Technology Audit', priority: 'medium', timeframe: '2-4 weeks' },
        { action: 'Partnership Outreach', priority: 'medium', timeframe: '1 month' }
      ],
      'underestimated-founder': [
        { action: 'Network Expansion', priority: 'high', timeframe: '1-2 weeks' },
        { action: 'Funding Strategy', priority: 'high', timeframe: '2-4 weeks' },
        { action: 'Brand Storytelling', priority: 'medium', timeframe: '1 month' }
      ],
      'tech-forward-scaler': [
        { action: 'Technology Roadmap', priority: 'high', timeframe: '1-2 weeks' },
        { action: 'Skill Assessment', priority: 'medium', timeframe: '2-4 weeks' },
        { action: 'Innovation Pipeline', priority: 'medium', timeframe: '1 month' }
      ],
      'inclusive-culture-builder': [
        { action: 'Culture Assessment', priority: 'high', timeframe: '1-2 weeks' },
        { action: 'Bias Training', priority: 'high', timeframe: '2-4 weeks' },
        { action: 'Diversity Metrics', priority: 'medium', timeframe: '1 month' }
      ]
    };
    
    return actions[icpId] || [];
  }
};

export default ICPPathways;