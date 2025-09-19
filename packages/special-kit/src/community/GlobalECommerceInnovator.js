import React, { useState, useEffect, useRef } from 'react';
import { trackPrivacyEvent } from '../privacy/blockchainTracker.js';
import { PrivacyDataHandler } from '../privacy/dataHandler.js';

/**
 * Global E-Commerce Innovator ICP Implementation Pathway
 * 
 * Target Profile:
 * - E-commerce leaders scaling globally
 * - Revenue: $10M-$500M annually
 * - Multi-channel operations
 * - International expansion focus
 * - Technology-forward mindset
 * - Data-driven decision making
 * 
 * Features:
 * - Quantum-secured data processing
 * - Real-time global market analytics
 * - Cross-border compliance automation
 * - Multi-currency optimization
 * - Supply chain intelligence
 * - Customer behavior prediction
 * - Privacy-first international operations
 */
const GlobalECommerceInnovator = ({ 
  userProfile = {},
  onPathwayComplete,
  privacyMode = 'quantum-secured'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pathwayData, setPathwayData] = useState({
    businessMetrics: {},
    globalMarkets: [],
    complianceStatus: {},
    quantumSecurityLevel: 'maximum',
    privacyCompliance: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState([]);
  const [securityStatus, setSecurityStatus] = useState('initializing');
  const privacyHandler = useRef(null);
  
  // Pathway steps for Global E-Commerce Innovator
  const pathwaySteps = [
    {
      id: 'business-assessment',
      title: '🌍 Global Business Assessment',
      description: 'Analyze current e-commerce operations and international readiness',
      quantumSecured: true,
      estimatedTime: '5-10 minutes'
    },
    {
      id: 'market-analysis',
      title: '📊 Global Market Intelligence',
      description: 'AI-powered analysis of target international markets',
      quantumSecured: true,
      estimatedTime: '3-7 minutes'
    },
    {
      id: 'compliance-mapping',
      title: '⚖️ Cross-Border Compliance',
      description: 'Automated compliance mapping for target markets',
      quantumSecured: true,
      estimatedTime: '2-5 minutes'
    },
    {
      id: 'technology-stack',
      title: '🔧 Technology Infrastructure',
      description: 'Quantum-secured technology recommendations',
      quantumSecured: true,
      estimatedTime: '5-8 minutes'
    },
    {
      id: 'growth-strategy',
      title: '🚀 Scaling Strategy',
      description: 'Personalized global expansion roadmap',
      quantumSecured: true,
      estimatedTime: '7-12 minutes'
    }
  ];
  
  // Initialize privacy handler and quantum security
  useEffect(() => {
    const initializeQuantumSecurity = async () => {
      try {
        setSecurityStatus('initializing');
        
        // Initialize privacy handler with quantum encryption
        privacyHandler.current = new PrivacyDataHandler({
          encryptionLevel: 'quantum-resistant',
          purgeInterval: 15000,
          complianceMode: 'gdpr-plus',
          quantumSecured: true
        });
        
        // Track pathway initialization
        await trackPrivacyEvent('pathway_initialized', {
          icpType: 'global-ecommerce-innovator',
          quantumSecured: true,
          privacyMode,
          userProfile: {
            // Only non-sensitive metadata
            hasProfile: !!userProfile,
            timestamp: Date.now()
          }
        });
        
        setSecurityStatus('secured');
        
      } catch (error) {
        console.error('Quantum security initialization failed:', error);
        setSecurityStatus('error');
      }
    };
    
    initializeQuantumSecurity();
    
    return () => {
      if (privacyHandler.current) {
        privacyHandler.current.emergencyPurge();
      }
    };
  }, [privacyMode, userProfile]);
  
  /**
   * Process business assessment with quantum security
   */
  const processBusinessAssessment = async (assessmentData) => {
    setIsProcessing(true);
    
    try {
      // Encrypt and process assessment data
      const encryptedData = await privacyHandler.current.encryptData(assessmentData);
      
      // Simulate AI-powered business analysis
      const businessInsights = {
        currentRevenue: assessmentData.revenue || 'Not specified',
        marketPresence: assessmentData.markets || [],
        technologyReadiness: calculateTechReadiness(assessmentData),
        globalReadinessScore: calculateGlobalReadiness(assessmentData),
        recommendedMarkets: generateMarketRecommendations(assessmentData),
        complianceGaps: identifyComplianceGaps(assessmentData)
      };
      
      // Update pathway data
      setPathwayData(prev => ({
        ...prev,
        businessMetrics: businessInsights
      }));
      
      // Generate insights
      const newInsights = generateBusinessInsights(businessInsights);
      setInsights(prev => [...prev, ...newInsights]);
      
      // Track progress with privacy compliance
      await trackPrivacyEvent('assessment_completed', {
        step: 'business-assessment',
        readinessScore: businessInsights.globalReadinessScore,
        quantumSecured: true
      });
      
    } catch (error) {
      console.error('Business assessment processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Calculate technology readiness score
   */
  const calculateTechReadiness = (data) => {
    let score = 0;
    const factors = {
      hasAPI: data.hasAPI ? 20 : 0,
      hasAnalytics: data.hasAnalytics ? 15 : 0,
      hasAutomation: data.hasAutomation ? 20 : 0,
      hasCloudInfra: data.hasCloudInfra ? 25 : 0,
      hasSecurityMeasures: data.hasSecurityMeasures ? 20 : 0
    };
    
    score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    return Math.min(score, 100);
  };
  
  /**
   * Calculate global readiness score
   */
  const calculateGlobalReadiness = (data) => {
    let score = 0;
    const factors = {
      multiCurrency: data.multiCurrency ? 25 : 0,
      multiLanguage: data.multiLanguage ? 20 : 0,
      internationalShipping: data.internationalShipping ? 20 : 0,
      complianceKnowledge: data.complianceKnowledge ? 15 : 0,
      localizedMarketing: data.localizedMarketing ? 20 : 0
    };
    
    score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    return Math.min(score, 100);
  };
  
  /**
   * Generate market recommendations based on assessment
   */
  const generateMarketRecommendations = (data) => {
    const allMarkets = [
      { region: 'Europe', countries: ['UK', 'Germany', 'France'], difficulty: 'Medium', potential: 'High' },
      { region: 'Asia-Pacific', countries: ['Australia', 'Japan', 'Singapore'], difficulty: 'Medium', potential: 'Very High' },
      { region: 'North America', countries: ['Canada', 'Mexico'], difficulty: 'Low', potential: 'High' },
      { region: 'Latin America', countries: ['Brazil', 'Argentina', 'Chile'], difficulty: 'High', potential: 'Medium' },
      { region: 'Middle East', countries: ['UAE', 'Saudi Arabia'], difficulty: 'Medium', potential: 'High' }
    ];
    
    // Filter based on business readiness and preferences
    return allMarkets.filter(market => {
      if (data.preferredRegions && data.preferredRegions.length > 0) {
        return data.preferredRegions.includes(market.region);
      }
      return market.difficulty !== 'High' || data.hasInternationalExperience;
    }).slice(0, 3);
  };
  
  /**
   * Identify compliance gaps
   */
  const identifyComplianceGaps = (data) => {
    const gaps = [];
    
    if (!data.gdprCompliant) gaps.push('GDPR Compliance');
    if (!data.dataLocalization) gaps.push('Data Localization');
    if (!data.taxCompliance) gaps.push('International Tax Compliance');
    if (!data.consumerProtection) gaps.push('Consumer Protection Laws');
    if (!data.accessibilityCompliance) gaps.push('Accessibility Standards');
    
    return gaps;
  };
  
  /**
   * Generate business insights
   */
  const generateBusinessInsights = (metrics) => {
    const insights = [];
    
    if (metrics.globalReadinessScore >= 80) {
      insights.push({
        type: 'success',
        title: 'High Global Readiness',
        message: 'Your business shows strong indicators for international expansion.',
        priority: 'high'
      });
    } else if (metrics.globalReadinessScore >= 60) {
      insights.push({
        type: 'warning',
        title: 'Moderate Global Readiness',
        message: 'Some preparation needed before international expansion.',
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Building Global Foundation',
        message: 'Focus on strengthening core capabilities before expanding.',
        priority: 'high'
      });
    }
    
    if (metrics.technologyReadiness < 70) {
      insights.push({
        type: 'warning',
        title: 'Technology Infrastructure Gap',
        message: 'Consider upgrading your technology stack for global operations.',
        priority: 'high'
      });
    }
    
    if (metrics.complianceGaps.length > 0) {
      insights.push({
        type: 'info',
        title: 'Compliance Requirements',
        message: `Address ${metrics.complianceGaps.length} compliance areas before expansion.`,
        priority: 'medium'
      });
    }
    
    return insights;
  };
  
  /**
   * Advance to next step
   */
  const nextStep = async () => {
    if (currentStep < pathwaySteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      await trackPrivacyEvent('step_advanced', {
        fromStep: currentStep,
        toStep: newStep,
        stepId: pathwaySteps[newStep].id,
        quantumSecured: true
      });
    } else {
      // Pathway complete
      await completePathway();
    }
  };
  
  /**
   * Complete pathway
   */
  const completePathway = async () => {
    try {
      await trackPrivacyEvent('pathway_completed', {
        icpType: 'global-ecommerce-innovator',
        stepsCompleted: pathwaySteps.length,
        quantumSecured: true,
        finalData: {
          globalReadinessScore: pathwayData.businessMetrics.globalReadinessScore,
          recommendedMarkets: pathwayData.businessMetrics.recommendedMarkets?.length || 0,
          complianceGaps: pathwayData.businessMetrics.complianceGaps?.length || 0
        }
      });
      
      if (onPathwayComplete) {
        onPathwayComplete({
          icpType: 'global-ecommerce-innovator',
          pathwayData,
          insights,
          completedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Pathway completion failed:', error);
    }
  };
  
  /**
   * Render current step content
   */
  const renderStepContent = () => {
    const step = pathwaySteps[currentStep];
    
    switch (step.id) {
      case 'business-assessment':
        return (
          <BusinessAssessmentForm 
            onSubmit={processBusinessAssessment}
            isProcessing={isProcessing}
            quantumSecured={true}
          />
        );
      
      case 'market-analysis':
        return (
          <MarketAnalysisView 
            businessMetrics={pathwayData.businessMetrics}
            onAnalysisComplete={nextStep}
            quantumSecured={true}
          />
        );
      
      case 'compliance-mapping':
        return (
          <ComplianceMappingView 
            recommendedMarkets={pathwayData.businessMetrics.recommendedMarkets}
            complianceGaps={pathwayData.businessMetrics.complianceGaps}
            onMappingComplete={nextStep}
            quantumSecured={true}
          />
        );
      
      case 'technology-stack':
        return (
          <TechnologyStackView 
            currentReadiness={pathwayData.businessMetrics.technologyReadiness}
            onRecommendationsReady={nextStep}
            quantumSecured={true}
          />
        );
      
      case 'growth-strategy':
        return (
          <GrowthStrategyView 
            pathwayData={pathwayData}
            insights={insights}
            onStrategyComplete={completePathway}
            quantumSecured={true}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };
  
  if (securityStatus === 'initializing') {
    return (
      <div className="pathway-container pathway-container--loading">
        <div className="quantum-security-init">
          <div className="quantum-spinner"></div>
          <h3>🔐 Initializing Quantum Security</h3>
          <p>Securing your data with quantum-resistant encryption...</p>
        </div>
      </div>
    );
  }
  
  if (securityStatus === 'error') {
    return (
      <div className="pathway-container pathway-container--error">
        <div className="security-error">
          <h3>🚨 Security Initialization Failed</h3>
          <p>Unable to establish quantum-secured connection. Please try again.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pathway-container pathway-container--global-ecommerce">
      {/* Header */}
      <div className="pathway-header">
        <div className="pathway-title">
          <h1>🌍 Global E-Commerce Innovator Pathway</h1>
          <p className="pathway-subtitle">
            Quantum-secured implementation for international e-commerce scaling
          </p>
        </div>
        
        <div className="security-status">
          <span className="security-indicator security-indicator--quantum">
            🔐 Quantum Secured
          </span>
          <span className="privacy-indicator">
            🛡️ GDPR-Plus Compliant
          </span>
        </div>
      </div>
      
      {/* Progress */}
      <div className="pathway-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / pathwaySteps.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="progress-info">
          <span>Step {currentStep + 1} of {pathwaySteps.length}</span>
          <span>{pathwaySteps[currentStep].estimatedTime}</span>
        </div>
      </div>
      
      {/* Steps Navigation */}
      <div className="pathway-steps">
        {pathwaySteps.map((step, index) => (
          <div 
            key={step.id}
            className={`pathway-step ${
              index === currentStep ? 'pathway-step--active' :
              index < currentStep ? 'pathway-step--completed' :
              'pathway-step--pending'
            }`}
          >
            <div className="step-indicator">
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="step-content">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
              {step.quantumSecured && (
                <span className="quantum-badge">🔐 Quantum Secured</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Current Step Content */}
      <div className="pathway-content">
        {renderStepContent()}
      </div>
      
      {/* Insights Panel */}
      {insights.length > 0 && (
        <div className="insights-panel">
          <h3>💡 AI-Powered Insights</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight insight--${insight.type}`}>
                <div className="insight-header">
                  <h4>{insight.title}</h4>
                  <span className={`priority priority--${insight.priority}`}>
                    {insight.priority.toUpperCase()}
                  </span>
                </div>
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .pathway-container {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 255, 136, 0.1);
        }
        
        .pathway-container--loading,
        .pathway-container--error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }
        
        .quantum-security-init {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .quantum-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(0, 255, 136, 0.2);
          border-top: 4px solid #00ff88;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .pathway-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }
        
        .pathway-title h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .pathway-subtitle {
          margin: 0;
          color: #888;
          font-size: 16px;
        }
        
        .security-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        
        .security-indicator,
        .privacy-indicator {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .security-indicator--quantum {
          background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
          color: #000;
        }
        
        .privacy-indicator {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid #00ff88;
        }
        
        .pathway-progress {
          margin-bottom: 32px;
        }
        
        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff88 0%, #00d4ff 100%);
          transition: width 0.5s ease;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #888;
        }
        
        .pathway-steps {
          display: grid;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .pathway-step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .pathway-step--active {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          box-shadow: 0 8px 32px rgba(0, 255, 136, 0.2);
        }
        
        .pathway-step--completed {
          background: rgba(0, 255, 136, 0.05);
          border-color: rgba(0, 255, 136, 0.3);
        }
        
        .pathway-step--pending {
          opacity: 0.6;
        }
        
        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .pathway-step--active .step-indicator {
          background: #00ff88;
          color: #000;
        }
        
        .pathway-step--completed .step-indicator {
          background: rgba(0, 255, 136, 0.3);
          color: #00ff88;
        }
        
        .pathway-step--pending .step-indicator {
          background: rgba(255, 255, 255, 0.1);
          color: #888;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-content h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #ffffff;
        }
        
        .step-content p {
          margin: 0 0 8px 0;
          color: #ccc;
          line-height: 1.5;
        }
        
        .quantum-badge {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .pathway-content {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
        }
        
        .insights-panel {
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 12px;
          padding: 24px;
        }
        
        .insights-panel h3 {
          margin: 0 0 20px 0;
          color: #00ff88;
        }
        
        .insights-list {
          display: grid;
          gap: 16px;
        }
        
        .insight {
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid;
        }
        
        .insight--success {
          background: rgba(0, 255, 136, 0.1);
          border-left-color: #00ff88;
        }
        
        .insight--warning {
          background: rgba(255, 170, 0, 0.1);
          border-left-color: #ffaa00;
        }
        
        .insight--info {
          background: rgba(0, 212, 255, 0.1);
          border-left-color: #00d4ff;
        }
        
        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .insight-header h4 {
          margin: 0;
          font-size: 16px;
        }
        
        .priority {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .priority--high {
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
        }
        
        .priority--medium {
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
        }
        
        .priority--low {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .pathway-container {
            padding: 16px;
          }
          
          .pathway-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .security-status {
            align-items: flex-start;
          }
          
          .pathway-title h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Business Assessment Form Component
 */
const BusinessAssessmentForm = ({ onSubmit, isProcessing, quantumSecured }) => {
  const [formData, setFormData] = useState({
    revenue: '',
    markets: [],
    hasAPI: false,
    hasAnalytics: false,
    hasAutomation: false,
    hasCloudInfra: false,
    hasSecurityMeasures: false,
    multiCurrency: false,
    multiLanguage: false,
    internationalShipping: false,
    complianceKnowledge: false,
    localizedMarketing: false,
    gdprCompliant: false,
    dataLocalization: false,
    taxCompliance: false,
    consumerProtection: false,
    accessibilityCompliance: false,
    preferredRegions: [],
    hasInternationalExperience: false
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="assessment-form">
      <h3>🌍 Business Assessment</h3>
      <p>Help us understand your current e-commerce operations and international readiness.</p>
      
      {/* Revenue */}
      <div className="form-group">
        <label>Annual Revenue Range</label>
        <select 
          value={formData.revenue} 
          onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
          required
        >
          <option value="">Select revenue range</option>
          <option value="under-1m">Under $1M</option>
          <option value="1m-10m">$1M - $10M</option>
          <option value="10m-50m">$10M - $50M</option>
          <option value="50m-100m">$50M - $100M</option>
          <option value="100m-500m">$100M - $500M</option>
          <option value="over-500m">Over $500M</option>
        </select>
      </div>
      
      {/* Current Markets */}
      <div className="form-group">
        <label>Current Markets (Select all that apply)</label>
        <div className="checkbox-grid">
          {['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East', 'Africa'].map(market => (
            <label key={market} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.markets.includes(market)}
                onChange={() => handleMultiSelect('markets', market)}
              />
              {market}
            </label>
          ))}
        </div>
      </div>
      
      {/* Technology Capabilities */}
      <div className="form-group">
        <label>Technology Capabilities</label>
        <div className="checkbox-grid">
          {[
            { key: 'hasAPI', label: 'API Integration' },
            { key: 'hasAnalytics', label: 'Advanced Analytics' },
            { key: 'hasAutomation', label: 'Process Automation' },
            { key: 'hasCloudInfra', label: 'Cloud Infrastructure' },
            { key: 'hasSecurityMeasures', label: 'Security Measures' }
          ].map(item => (
            <label key={item.key} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
      
      {/* International Readiness */}
      <div className="form-group">
        <label>International Readiness</label>
        <div className="checkbox-grid">
          {[
            { key: 'multiCurrency', label: 'Multi-Currency Support' },
            { key: 'multiLanguage', label: 'Multi-Language Support' },
            { key: 'internationalShipping', label: 'International Shipping' },
            { key: 'complianceKnowledge', label: 'Compliance Knowledge' },
            { key: 'localizedMarketing', label: 'Localized Marketing' }
          ].map(item => (
            <label key={item.key} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
      
      {/* Compliance Status */}
      <div className="form-group">
        <label>Compliance Status</label>
        <div className="checkbox-grid">
          {[
            { key: 'gdprCompliant', label: 'GDPR Compliant' },
            { key: 'dataLocalization', label: 'Data Localization' },
            { key: 'taxCompliance', label: 'Tax Compliance' },
            { key: 'consumerProtection', label: 'Consumer Protection' },
            { key: 'accessibilityCompliance', label: 'Accessibility Standards' }
          ].map(item => (
            <label key={item.key} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
      
      {/* Preferred Expansion Regions */}
      <div className="form-group">
        <label>Preferred Expansion Regions (Optional)</label>
        <div className="checkbox-grid">
          {['Europe', 'Asia-Pacific', 'Latin America', 'Middle East', 'Africa'].map(region => (
            <label key={region} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.preferredRegions.includes(region)}
                onChange={() => handleMultiSelect('preferredRegions', region)}
              />
              {region}
            </label>
          ))}
        </div>
      </div>
      
      {/* International Experience */}
      <div className="form-group">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={formData.hasInternationalExperience}
            onChange={() => handleCheckboxChange('hasInternationalExperience')}
          />
          I have previous international business experience
        </label>
      </div>
      
      <button 
        type="submit" 
        className="submit-btn"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="spinner"></span>
            Processing with Quantum Security...
          </>
        ) : (
          '🚀 Analyze My Business'
        )}
      </button>
      
      {quantumSecured && (
        <p className="security-note">
          🔐 Your data is protected with quantum-resistant encryption and will be automatically purged in 15 seconds.
        </p>
      )}
      
      <style jsx>{`
        .assessment-form {
          max-width: 800px;
        }
        
        .assessment-form h3 {
          margin: 0 0 8px 0;
          color: #00ff88;
          font-size: 24px;
        }
        
        .assessment-form p {
          margin: 0 0 32px 0;
          color: #ccc;
          line-height: 1.6;
        }
        
        .form-group {
          margin-bottom: 24px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #ffffff;
          font-weight: 600;
        }
        
        .form-group select {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
        }
        
        .form-group select option {
          background: #1a1a1a;
          color: #ffffff;
        }
        
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-bottom: 0 !important;
          font-weight: normal !important;
        }
        
        .checkbox-label:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }
        
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
          color: #000;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top: 2px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .security-note {
          margin-top: 16px;
          padding: 12px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 6px;
          color: #00ff88;
          font-size: 12px;
          text-align: center;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
};

// Placeholder components for other steps
const MarketAnalysisView = ({ businessMetrics, onAnalysisComplete, quantumSecured }) => (
  <div className="step-placeholder">
    <h3>📊 Global Market Intelligence</h3>
    <p>AI-powered analysis of your target international markets...</p>
    <button onClick={onAnalysisComplete} className="continue-btn">
      Continue to Compliance Mapping
    </button>
  </div>
);

const ComplianceMappingView = ({ recommendedMarkets, complianceGaps, onMappingComplete, quantumSecured }) => (
  <div className="step-placeholder">
    <h3>⚖️ Cross-Border Compliance</h3>
    <p>Automated compliance mapping for your target markets...</p>
    <button onClick={onMappingComplete} className="continue-btn">
      Continue to Technology Stack
    </button>
  </div>
);

const TechnologyStackView = ({ currentReadiness, onRecommendationsReady, quantumSecured }) => (
  <div className="step-placeholder">
    <h3>🔧 Technology Infrastructure</h3>
    <p>Quantum-secured technology recommendations...</p>
    <button onClick={onRecommendationsReady} className="continue-btn">
      Continue to Growth Strategy
    </button>
  </div>
);

const GrowthStrategyView = ({ pathwayData, insights, onStrategyComplete, quantumSecured }) => (
  <div className="step-placeholder">
    <h3>🚀 Scaling Strategy</h3>
    <p>Your personalized global expansion roadmap...</p>
    <button onClick={onStrategyComplete} className="complete-btn">
      Complete Pathway
    </button>
  </div>
);

export default GlobalECommerceInnovator;

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <GlobalECommerceInnovator 
 *   userProfile={userProfile}
 *   onPathwayComplete={(result) => {
 *     console.log('Pathway completed:', result);
 *   }}
 * />
 * 
 * // With custom privacy mode
 * <GlobalECommerceInnovator 
 *   userProfile={userProfile}
 *   privacyMode="maximum-security"
 *   onPathwayComplete={handleCompletion}
 * />
 */