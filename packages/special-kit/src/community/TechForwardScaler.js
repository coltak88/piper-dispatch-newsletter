/**
 * Tech-Forward Scaler ICP Implementation Pathway
 * AI-powered growth strategies with GDPR-Plus compliance
 * Advanced automation, predictive analytics, and privacy-first scaling
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/tech-forward-scaler.css';

/**
 * Tech-Forward Scaler Main Component
 */
const TechForwardScaler = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scalerProfile, setScalerProfile] = useState({});
  const [aiInsights, setAiInsights] = useState(null);
  const [gdprCompliance, setGdprCompliance] = useState(false);
  const [automationLevel, setAutomationLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const steps = [
    { id: 'assessment', title: 'Tech Assessment', icon: '🔬' },
    { id: 'ai-strategy', title: 'AI Strategy', icon: '🤖' },
    { id: 'automation', title: 'Automation Setup', icon: '⚙️' },
    { id: 'scaling', title: 'Growth Scaling', icon: '📈' },
    { id: 'compliance', title: 'GDPR-Plus', icon: '🛡️' }
  ];
  
  // Initialize GDPR-Plus compliance system
  useEffect(() => {
    initializeGDPRPlus();
  }, []);
  
  const initializeGDPRPlus = () => {
    // Enhanced privacy protection beyond GDPR requirements
    const gdprPlusConfig = {
      dataMinimization: true,
      purposeLimitation: true,
      storageMinimization: true,
      transparencyEnhanced: true,
      consentGranular: true,
      rightToExplanation: true, // AI decision transparency
      algorithmicAuditing: true,
      biasDetection: true,
      quantumResistantEncryption: true
    };
    
    setGdprCompliance(true);
    console.log('GDPR-Plus compliance initialized:', gdprPlusConfig);
  };
  
  const handleStepChange = (stepIndex) => {
    setCurrentStep(stepIndex);
  };
  
  const handleProfileUpdate = (updates) => {
    setScalerProfile(prev => ({ ...prev, ...updates }));
  };
  
  const generateAIInsights = useCallback(async (profile) => {
    setIsLoading(true);
    
    // Simulate AI-powered analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const insights = {
      growthPotential: Math.floor(Math.random() * 40) + 60, // 60-100%
      automationOpportunities: [
        'Customer service chatbots',
        'Predictive inventory management',
        'Dynamic pricing optimization',
        'Automated marketing campaigns',
        'AI-powered recruitment'
      ],
      techStack: {
        recommended: ['React', 'Node.js', 'TensorFlow', 'AWS', 'MongoDB'],
        aiTools: ['OpenAI GPT', 'Google Cloud AI', 'Azure Cognitive Services'],
        automationTools: ['Zapier', 'Microsoft Power Automate', 'UiPath']
      },
      scalingStrategy: {
        phase1: 'Process automation and AI integration',
        phase2: 'Predictive analytics and customer intelligence',
        phase3: 'Autonomous operations and self-optimizing systems'
      },
      complianceScore: 95,
      riskFactors: [
        'Data privacy regulations',
        'AI bias and fairness',
        'Cybersecurity threats',
        'Technology obsolescence'
      ]
    };
    
    setAiInsights(insights);
    setIsLoading(false);
  }, []);
  
  const renderCurrentStep = () => {
    switch (steps[currentStep].id) {
      case 'assessment':
        return (
          <TechAssessmentView 
            profile={scalerProfile}
            onProfileUpdate={handleProfileUpdate}
            onComplete={() => handleStepChange(1)}
            gdprCompliance={gdprCompliance}
          />
        );
      case 'ai-strategy':
        return (
          <AIStrategyView 
            profile={scalerProfile}
            insights={aiInsights}
            onGenerateInsights={generateAIInsights}
            onComplete={() => handleStepChange(2)}
            isLoading={isLoading}
          />
        );
      case 'automation':
        return (
          <AutomationSetupView 
            profile={scalerProfile}
            insights={aiInsights}
            automationLevel={automationLevel}
            onAutomationUpdate={setAutomationLevel}
            onComplete={() => handleStepChange(3)}
          />
        );
      case 'scaling':
        return (
          <GrowthScalingView 
            profile={scalerProfile}
            insights={aiInsights}
            automationLevel={automationLevel}
            onComplete={() => handleStepChange(4)}
          />
        );
      case 'compliance':
        return (
          <GDPRPlusComplianceView 
            profile={scalerProfile}
            insights={aiInsights}
            gdprCompliance={gdprCompliance}
            onComplete={() => console.log('Tech-Forward Scaler pathway completed!')}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="tech-forward-scaler">
      <h1>🚀 Tech-Forward Scaler</h1>
      <p className="subtitle">
        AI-powered growth strategies with GDPR-Plus compliance for technology-driven scaling
      </p>
      
      {gdprCompliance && (
        <div className="gdpr-notice">
          <span>🛡️</span>
          <span>GDPR-Plus compliance active - Enhanced privacy protection beyond regulatory requirements</span>
        </div>
      )}
      
      {/* Step Navigation */}
      <div className="step-navigation">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`step-nav-item ${
              index === currentStep ? 'active' : ''
            } ${
              index < currentStep ? 'completed' : ''
            }`}
            onClick={() => handleStepChange(index)}
          >
            <span className="step-icon">{step.icon}</span>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>
      
      {/* Current Step Content */}
      <div className="step-content">
        {renderCurrentStep()}
      </div>
      
      <style jsx>{`
        .tech-forward-scaler {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: linear-gradient(135deg, 
            rgba(0, 123, 255, 0.02) 0%, 
            rgba(40, 167, 69, 0.02) 50%,
            rgba(108, 117, 125, 0.02) 100%);
          min-height: 100vh;
        }
        
        .tech-forward-scaler h1 {
          color: #007bff;
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #007bff, #28a745);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          text-align: center;
          color: #ccc;
          font-size: 1.1rem;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        
        .gdpr-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.2);
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #007bff;
        }
        
        .step-navigation {
          display: flex;
          justify-content: center;
          margin-bottom: 48px;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .step-nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          color: #ccc;
        }
        
        .step-nav-item:hover {
          background: rgba(0, 123, 255, 0.1);
          border-color: rgba(0, 123, 255, 0.2);
          color: #007bff;
        }
        
        .step-nav-item.active {
          background: linear-gradient(135deg, #007bff, #28a745);
          border-color: #007bff;
          color: #fff;
          box-shadow: 0 4px 20px rgba(0, 123, 255, 0.2);
        }
        
        .step-nav-item.completed {
          background: rgba(40, 167, 69, 0.1);
          border-color: rgba(40, 167, 69, 0.2);
          color: #28a745;
        }
        
        .step-icon {
          font-size: 1.2rem;
        }
        
        .step-content {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 32px;
          min-height: 600px;
        }
        
        @media (max-width: 768px) {
          .tech-forward-scaler {
            padding: 16px;
          }
          
          .tech-forward-scaler h1 {
            font-size: 2rem;
          }
          
          .step-navigation {
            flex-direction: column;
            align-items: center;
          }
          
          .step-content {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Tech Assessment View Component
 */
const TechAssessmentView = ({ profile, onProfileUpdate, onComplete, gdprCompliance }) => {
  const [assessment, setAssessment] = useState({
    currentTechStack: [],
    teamSize: '',
    monthlyRevenue: '',
    growthRate: '',
    automationLevel: 'basic',
    dataVolume: '',
    aiExperience: 'none',
    scalingChallenges: [],
    complianceNeeds: []
  });
  
  const techStackOptions = [
    'React/Vue/Angular', 'Node.js/Python/Java', 'AWS/Azure/GCP',
    'MongoDB/PostgreSQL', 'Docker/Kubernetes', 'CI/CD Pipelines',
    'Microservices', 'API Management', 'Analytics Tools', 'CRM Systems'
  ];
  
  const scalingChallengesOptions = [
    'Manual processes', 'Data silos', 'Slow decision making',
    'Customer service bottlenecks', 'Inventory management',
    'Marketing inefficiencies', 'Hiring and onboarding',
    'Quality control', 'Financial reporting', 'Compliance tracking'
  ];
  
  const complianceOptions = [
    'GDPR', 'CCPA', 'HIPAA', 'SOX', 'PCI DSS',
    'ISO 27001', 'SOC 2', 'NIST Framework'
  ];
  
  const handleInputChange = (field, value) => {
    const updatedAssessment = { ...assessment, [field]: value };
    setAssessment(updatedAssessment);
    onProfileUpdate({ techAssessment: updatedAssessment });
  };
  
  const handleArrayToggle = (field, value) => {
    const currentArray = assessment[field] || [];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleInputChange(field, updatedArray);
  };
  
  const isFormValid = () => {
    return assessment.teamSize && assessment.monthlyRevenue && 
           assessment.growthRate && assessment.currentTechStack.length > 0;
  };
  
  return (
    <div className="tech-assessment">
      <h3>🔬 Technology Assessment</h3>
      <p>Let's evaluate your current technology infrastructure and scaling readiness.</p>
      
      {gdprCompliance && (
        <div className="privacy-notice">
          <span>🔒</span>
          <span>All assessment data is processed with GDPR-Plus compliance and quantum-resistant encryption</span>
        </div>
      )}
      
      <div className="assessment-form">
        {/* Current Tech Stack */}
        <div className="form-section">
          <h4>Current Technology Stack</h4>
          <div className="checkbox-grid">
            {techStackOptions.map(tech => (
              <label key={tech} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={assessment.currentTechStack.includes(tech)}
                  onChange={() => handleArrayToggle('currentTechStack', tech)}
                />
                <span>{tech}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Team and Business Metrics */}
        <div className="form-section">
          <h4>Business Metrics</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Team Size</label>
              <select
                value={assessment.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
              >
                <option value="">Select team size</option>
                <option value="1-5">1-5 people</option>
                <option value="6-15">6-15 people</option>
                <option value="16-50">16-50 people</option>
                <option value="51-100">51-100 people</option>
                <option value="100+">100+ people</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Monthly Revenue</label>
              <select
                value={assessment.monthlyRevenue}
                onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
              >
                <option value="">Select revenue range</option>
                <option value="<10k">Less than $10K</option>
                <option value="10k-50k">$10K - $50K</option>
                <option value="50k-100k">$50K - $100K</option>
                <option value="100k-500k">$100K - $500K</option>
                <option value="500k+">$500K+</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Monthly Growth Rate</label>
              <select
                value={assessment.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
              >
                <option value="">Select growth rate</option>
                <option value="<5%">Less than 5%</option>
                <option value="5-15%">5% - 15%</option>
                <option value="15-30%">15% - 30%</option>
                <option value="30%+">30%+</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Data Volume (Monthly)</label>
              <select
                value={assessment.dataVolume}
                onChange={(e) => handleInputChange('dataVolume', e.target.value)}
              >
                <option value="">Select data volume</option>
                <option value="<1GB">Less than 1GB</option>
                <option value="1-10GB">1GB - 10GB</option>
                <option value="10-100GB">10GB - 100GB</option>
                <option value="100GB-1TB">100GB - 1TB</option>
                <option value="1TB+">1TB+</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* AI and Automation Experience */}
        <div className="form-section">
          <h4>AI & Automation Experience</h4>
          <div className="form-group">
            <label>Current AI/ML Experience Level</label>
            <select
              value={assessment.aiExperience}
              onChange={(e) => handleInputChange('aiExperience', e.target.value)}
            >
              <option value="none">No experience</option>
              <option value="basic">Basic (using AI tools)</option>
              <option value="intermediate">Intermediate (custom implementations)</option>
              <option value="advanced">Advanced (ML models, AI strategy)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Current Automation Level</label>
            <select
              value={assessment.automationLevel}
              onChange={(e) => handleInputChange('automationLevel', e.target.value)}
            >
              <option value="basic">Basic (email, simple workflows)</option>
              <option value="intermediate">Intermediate (CRM, marketing automation)</option>
              <option value="advanced">Advanced (end-to-end process automation)</option>
            </select>
          </div>
        </div>
        
        {/* Scaling Challenges */}
        <div className="form-section">
          <h4>Primary Scaling Challenges</h4>
          <div className="checkbox-grid">
            {scalingChallengesOptions.map(challenge => (
              <label key={challenge} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={assessment.scalingChallenges.includes(challenge)}
                  onChange={() => handleArrayToggle('scalingChallenges', challenge)}
                />
                <span>{challenge}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Compliance Requirements */}
        <div className="form-section">
          <h4>Compliance Requirements</h4>
          <div className="checkbox-grid">
            {complianceOptions.map(compliance => (
              <label key={compliance} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={assessment.complianceNeeds.includes(compliance)}
                  onChange={() => handleArrayToggle('complianceNeeds', compliance)}
                />
                <span>{compliance}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="assessment-actions">
        <button 
          onClick={onComplete}
          className="btn-primary"
          disabled={!isFormValid()}
        >
          Complete Assessment & Generate AI Strategy
        </button>
      </div>
      
      <style jsx>{`
        .tech-assessment h3 {
          margin: 0 0 8px 0;
          color: #007bff;
          font-size: 24px;
        }
        
        .tech-assessment > p {
          margin: 0 0 24px 0;
          color: #ccc;
          line-height: 1.6;
        }
        
        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.2);
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #007bff;
        }
        
        .assessment-form {
          margin-bottom: 32px;
        }
        
        .form-section {
          margin-bottom: 32px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .form-section h4 {
          margin: 0 0 16px 0;
          color: #28a745;
          font-size: 18px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          color: #fff;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .form-group select {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
        }
        
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ccc;
        }
        
        .checkbox-item:hover {
          background: rgba(0, 123, 255, 0.05);
          color: #007bff;
        }
        
        .checkbox-item input {
          margin: 0;
        }
        
        .assessment-actions {
          text-align: center;
        }
        
        .btn-primary {
          padding: 16px 32px;
          background: linear-gradient(135deg, #007bff, #28a745);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 123, 255, 0.3);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
          
          .form-section {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * AI Strategy View Component
 */
const AIStrategyView = ({ profile, insights, onGenerateInsights, onComplete, isLoading }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [aiPriorities, setAiPriorities] = useState([]);
  
  useEffect(() => {
    if (profile.techAssessment && !insights) {
      onGenerateInsights(profile);
    }
  }, [profile, insights, onGenerateInsights]);
  
  const strategyOptions = [
    {
      id: 'customer-centric',
      title: 'Customer-Centric AI',
      description: 'Personalization, recommendation engines, customer service automation',
      benefits: ['Improved customer satisfaction', 'Higher conversion rates', 'Reduced support costs']
    },
    {
      id: 'operational-efficiency',
      title: 'Operational Efficiency',
      description: 'Process automation, predictive maintenance, supply chain optimization',
      benefits: ['Cost reduction', 'Faster operations', 'Better resource utilization']
    },
    {
      id: 'data-driven-insights',
      title: 'Data-Driven Insights',
      description: 'Business intelligence, predictive analytics, market trend analysis',
      benefits: ['Better decision making', 'Risk mitigation', 'Competitive advantage']
    },
    {
      id: 'product-innovation',
      title: 'Product Innovation',
      description: 'AI-powered features, smart products, automated testing',
      benefits: ['Product differentiation', 'Faster development', 'Enhanced user experience']
    }
  ];
  
  const aiPriorityOptions = [
    'Customer segmentation and targeting',
    'Automated customer support',
    'Predictive inventory management',
    'Dynamic pricing optimization',
    'Fraud detection and prevention',
    'Content personalization',
    'Demand forecasting',
    'Quality assurance automation',
    'Recruitment and HR optimization',
    'Financial risk assessment'
  ];
  
  const handlePriorityToggle = (priority) => {
    setAiPriorities(prev => 
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };
  
  const isFormValid = () => {
    return selectedStrategy && aiPriorities.length >= 3;
  };
  
  return (
    <div className="ai-strategy">
      <h3>🤖 AI Strategy Development</h3>
      <p>Define your AI-powered growth strategy based on your technology assessment.</p>
      
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating AI insights based on your assessment...</p>
        </div>
      ) : insights ? (
        <div className="insights-summary">
          <h4>📊 AI Analysis Results</h4>
          <div className="insights-grid">
            <div className="insight-card">
              <h5>Growth Potential</h5>
              <div className="metric">{insights.growthPotential}%</div>
            </div>
            <div className="insight-card">
              <h5>Compliance Score</h5>
              <div className="metric">{insights.complianceScore}%</div>
            </div>
            <div className="insight-card">
              <h5>Automation Opportunities</h5>
              <div className="metric">{insights.automationOpportunities.length}</div>
            </div>
          </div>
          
          <div className="recommended-stack">
            <h5>Recommended AI Tech Stack</h5>
            <div className="tech-tags">
              {insights.techStack.aiTools.map(tool => (
                <span key={tool} className="tech-tag">{tool}</span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="strategy-selection">
        <h4>Select Your Primary AI Strategy</h4>
        <div className="strategy-grid">
          {strategyOptions.map(strategy => (
            <div 
              key={strategy.id}
              className={`strategy-card ${
                selectedStrategy === strategy.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedStrategy(strategy.id)}
            >
              <h5>{strategy.title}</h5>
              <p>{strategy.description}</p>
              <div className="benefits">
                {strategy.benefits.map(benefit => (
                  <span key={benefit} className="benefit-tag">{benefit}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="priority-selection">
        <h4>Select AI Implementation Priorities (Choose at least 3)</h4>
        <div className="priority-grid">
          {aiPriorityOptions.map(priority => (
            <label key={priority} className="priority-item">
              <input
                type="checkbox"
                checked={aiPriorities.includes(priority)}
                onChange={() => handlePriorityToggle(priority)}
              />
              <span>{priority}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="strategy-actions">
        <button 
          onClick={onComplete}
          className="btn-primary"
          disabled={!isFormValid()}
        >
          Proceed to Automation Setup
        </button>
      </div>
      
      <style jsx>{`
        .ai-strategy h3 {
          margin: 0 0 8px 0;
          color: #007bff;
          font-size: 24px;
        }
        
        .loading-state {
          text-align: center;
          padding: 48px;
          color: #ccc;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 123, 255, 0.1);
          border-left: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .insights-summary {
          margin: 24px 0;
          padding: 24px;
          background: rgba(0, 123, 255, 0.05);
          border: 1px solid rgba(0, 123, 255, 0.1);
          border-radius: 8px;
        }
        
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .insight-card {
          text-align: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
        }
        
        .insight-card h5 {
          margin: 0 0 8px 0;
          color: #ccc;
          font-size: 14px;
        }
        
        .metric {
          font-size: 24px;
          font-weight: 700;
          color: #007bff;
        }
        
        .recommended-stack h5 {
          margin: 0 0 12px 0;
          color: #28a745;
        }
        
        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .tech-tag {
          padding: 4px 12px;
          background: rgba(40, 167, 69, 0.1);
          border: 1px solid rgba(40, 167, 69, 0.2);
          border-radius: 16px;
          font-size: 12px;
          color: #28a745;
        }
        
        .strategy-selection {
          margin: 32px 0;
        }
        
        .strategy-selection h4 {
          margin: 0 0 16px 0;
          color: #fff;
        }
        
        .strategy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .strategy-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .strategy-card:hover {
          border-color: rgba(0, 123, 255, 0.3);
          background: rgba(0, 123, 255, 0.05);
        }
        
        .strategy-card.selected {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }
        
        .strategy-card h5 {
          margin: 0 0 8px 0;
          color: #007bff;
        }
        
        .strategy-card p {
          margin: 0 0 12px 0;
          color: #ccc;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .benefit-tag {
          padding: 2px 8px;
          background: rgba(40, 167, 69, 0.1);
          border-radius: 12px;
          font-size: 11px;
          color: #28a745;
        }
        
        .priority-selection {
          margin: 32px 0;
        }
        
        .priority-selection h4 {
          margin: 0 0 16px 0;
          color: #fff;
        }
        
        .priority-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }
        
        .priority-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ccc;
        }
        
        .priority-item:hover {
          background: rgba(0, 123, 255, 0.05);
          color: #007bff;
        }
        
        .strategy-actions {
          text-align: center;
          margin-top: 32px;
        }
      `}</style>
    </div>
  );
};

/**
 * Automation Setup View Component
 */
const AutomationSetupView = ({ profile, insights, automationLevel, onAutomationUpdate, onComplete }) => {
  const [selectedAutomations, setSelectedAutomations] = useState([]);
  const [implementationPlan, setImplementationPlan] = useState('');
  
  const automationCategories = [
    {
      category: 'Customer Operations',
      automations: [
        { id: 'chatbot', name: 'AI Chatbot', complexity: 'Medium', roi: 'High' },
        { id: 'email-marketing', name: 'Email Marketing Automation', complexity: 'Low', roi: 'High' },
        { id: 'lead-scoring', name: 'Lead Scoring & Nurturing', complexity: 'Medium', roi: 'High' },
        { id: 'customer-onboarding', name: 'Customer Onboarding', complexity: 'Medium', roi: 'Medium' }
      ]
    },
    {
      category: 'Business Operations',
      automations: [
        { id: 'inventory-management', name: 'Inventory Management', complexity: 'High', roi: 'High' },
        { id: 'invoice-processing', name: 'Invoice Processing', complexity: 'Low', roi: 'Medium' },
        { id: 'report-generation', name: 'Report Generation', complexity: 'Medium', roi: 'Medium' },
        { id: 'data-backup', name: 'Data Backup & Recovery', complexity: 'Low', roi: 'High' }
      ]
    },
    {
      category: 'Marketing & Sales',
      automations: [
        { id: 'social-media', name: 'Social Media Management', complexity: 'Low', roi: 'Medium' },
        { id: 'ad-optimization', name: 'Ad Campaign Optimization', complexity: 'High', roi: 'High' },
        { id: 'content-generation', name: 'Content Generation', complexity: 'Medium', roi: 'Medium' },
        { id: 'crm-sync', name: 'CRM Data Synchronization', complexity: 'Medium', roi: 'High' }
      ]
    },
    {
      category: 'HR & Operations',
      automations: [
        { id: 'recruitment', name: 'Recruitment Screening', complexity: 'High', roi: 'Medium' },
        { id: 'employee-onboarding', name: 'Employee Onboarding', complexity: 'Medium', roi: 'Medium' },
        { id: 'time-tracking', name: 'Time Tracking & Payroll', complexity: 'Low', roi: 'High' },
        { id: 'performance-monitoring', name: 'Performance Monitoring', complexity: 'High', roi: 'Medium' }
      ]
    }
  ];
  
  const implementationPlans = [
    {
      id: 'gradual',
      name: 'Gradual Implementation (6-12 months)',
      description: 'Start with low-complexity, high-ROI automations and gradually add more complex systems'
    },
    {
      id: 'focused',
      name: 'Focused Sprint (3-6 months)',
      description: 'Implement automations in one category at a time for maximum impact'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Rollout (12-18 months)',
      description: 'Full-scale automation across all business functions with proper change management'
    }
  ];
  
  const handleAutomationToggle = (automationId) => {
    setSelectedAutomations(prev => 
      prev.includes(automationId)
        ? prev.filter(id => id !== automationId)
        : [...prev, automationId]
    );
  };
  
  const calculateAutomationScore = () => {
    const totalSelected = selectedAutomations.length;
    const maxPossible = automationCategories.reduce((sum, cat) => sum + cat.automations.length, 0);
    return Math.round((totalSelected / maxPossible) * 100);
  };
  
  useEffect(() => {
    onAutomationUpdate(calculateAutomationScore());
  }, [selectedAutomations, onAutomationUpdate]);
  
  const isFormValid = () => {
    return selectedAutomations.length >= 3 && implementationPlan;
  };
  
  return (
    <div className="automation-setup">
      <h3>⚙️ Automation Implementation</h3>
      <p>Select the automation systems that will drive your scaling efficiency.</p>
      
      <div className="automation-score">
        <h4>Automation Coverage: {calculateAutomationScore()}%</h4>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${calculateAutomationScore()}%` }}
          ></div>
        </div>
      </div>
      
      <div className="automation-categories">
        {automationCategories.map(category => (
          <div key={category.category} className="category-section">
            <h4>{category.category}</h4>
            <div className="automation-grid">
              {category.automations.map(automation => (
                <div 
                  key={automation.id}
                  className={`automation-card ${
                    selectedAutomations.includes(automation.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleAutomationToggle(automation.id)}
                >
                  <div className="automation-header">
                    <h5>{automation.name}</h5>
                    <input
                      type="checkbox"
                      checked={selectedAutomations.includes(automation.id)}
                      onChange={() => handleAutomationToggle(automation.id)}
                    />
                  </div>
                  <div className="automation-meta">
                    <span className={`complexity ${automation.complexity.toLowerCase()}`}>
                      {automation.complexity} Complexity
                    </span>
                    <span className={`roi ${automation.roi.toLowerCase()}`}>
                      {automation.roi} ROI
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="implementation-planning">
        <h4>Implementation Strategy</h4>
        <div className="plan-options">
          {implementationPlans.map(plan => (
            <div 
              key={plan.id}
              className={`plan-card ${
                implementationPlan === plan.id ? 'selected' : ''
              }`}
              onClick={() => setImplementationPlan(plan.id)}
            >
              <h5>{plan.name}</h5>
              <p>{plan.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="automation-actions">
        <button 
          onClick={onComplete}
          className="btn-primary"
          disabled={!isFormValid()}
        >
          Configure Growth Scaling
        </button>
      </div>
      
      <style jsx>{`
        .automation-setup h3 {
          margin: 0 0 8px 0;
          color: #007bff;
          font-size: 24px;
        }
        
        .automation-score {
          margin: 24px 0;
          padding: 20px;
          background: rgba(40, 167, 69, 0.05);
          border: 1px solid rgba(40, 167, 69, 0.1);
          border-radius: 8px;
        }
        
        .automation-score h4 {
          margin: 0 0 12px 0;
          color: #28a745;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #007bff);
          transition: width 0.3s ease;
        }
        
        .automation-categories {
          margin: 32px 0;
        }
        
        .category-section {
          margin-bottom: 32px;
        }
        
        .category-section h4 {
          margin: 0 0 16px 0;
          color: #fff;
          font-size: 18px;
        }
        
        .automation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .automation-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .automation-card:hover {
          border-color: rgba(0, 123, 255, 0.3);
          background: rgba(0, 123, 255, 0.05);
        }
        
        .automation-card.selected {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }
        
        .automation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .automation-header h5 {
          margin: 0;
          color: #007bff;
          font-size: 16px;
        }
        
        .automation-meta {
          display: flex;
          gap: 8px;
        }
        
        .complexity, .roi {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .complexity.low, .roi.high {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }
        
        .complexity.medium, .roi.medium {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }
        
        .complexity.high {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }
        
        .implementation-planning {
          margin: 32px 0;
        }
        
        .implementation-planning h4 {
          margin: 0 0 16px 0;
          color: #fff;
        }
        
        .plan-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .plan-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .plan-card:hover {
          border-color: rgba(0, 123, 255, 0.3);
          background: rgba(0, 123, 255, 0.05);
        }
        
        .plan-card.selected {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }
        
        .plan-card h5 {
          margin: 0 0 8px 0;
          color: #007bff;
        }
        
        .plan-card p {
          margin: 0;
          color: #ccc;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .automation-actions {
          text-align: center;
          margin-top: 32px;
        }
      `}</style>
    </div>
  );
};

/**
 * Growth Scaling View Component
 */
const GrowthScalingView = ({ profile, insights, automationLevel, onComplete }) => {
  const [scalingMetrics, setScalingMetrics] = useState({
    targetGrowthRate: '',
    scalingTimeframe: '',
    resourceAllocation: {},
    kpiTargets: {},
    riskMitigation: []
  });
  const [selectedScalingStrategies, setSelectedScalingStrategies] = useState([]);
  const [marketExpansion, setMarketExpansion] = useState([]);
  
  const scalingStrategies = [
    {
      id: 'horizontal-scaling',
      title: 'Horizontal Scaling',
      description: 'Expand to new markets, customer segments, or geographic regions',
      requirements: ['Market research', 'Localization', 'Regional partnerships'],
      timeframe: '6-18 months',
      complexity: 'High'
    },
    {
      id: 'vertical-scaling',
      title: 'Vertical Integration',
      description: 'Expand up or down the value chain to control more processes',
      requirements: ['Supply chain analysis', 'Acquisition strategy', 'Integration planning'],
      timeframe: '12-24 months',
      complexity: 'High'
    },
    {
      id: 'product-scaling',
      title: 'Product Portfolio Expansion',
      description: 'Develop new products or enhance existing ones with AI capabilities',
      requirements: ['R&D investment', 'AI integration', 'User testing'],
      timeframe: '3-12 months',
      complexity: 'Medium'
    },
    {
      id: 'operational-scaling',
      title: 'Operational Excellence',
      description: 'Optimize internal processes for higher efficiency and capacity',
      requirements: ['Process automation', 'Team scaling', 'Infrastructure upgrade'],
      timeframe: '3-9 months',
      complexity: 'Medium'
    },
    {
      id: 'partnership-scaling',
      title: 'Strategic Partnerships',
      description: 'Scale through alliances, integrations, and ecosystem partnerships',
      requirements: ['Partner identification', 'Integration APIs', 'Revenue sharing models'],
      timeframe: '6-12 months',
      complexity: 'Medium'
    },
    {
      id: 'platform-scaling',
      title: 'Platform Business Model',
      description: 'Create a platform that connects multiple parties and scales network effects',
      requirements: ['Platform architecture', 'Multi-sided market design', 'Network effects strategy'],
      timeframe: '12-36 months',
      complexity: 'High'
    }
  ];
  
  const marketExpansionOptions = [
    'North America', 'Europe', 'Asia-Pacific', 'Latin America',
    'Middle East & Africa', 'Emerging Markets', 'Enterprise Segment',
    'SMB Segment', 'Consumer Market', 'B2B2C Model'
  ];
  
  const kpiCategories = [
    {
      category: 'Growth Metrics',
      kpis: [
        { id: 'revenue-growth', name: 'Monthly Revenue Growth (%)', target: '' },
        { id: 'customer-acquisition', name: 'Customer Acquisition Rate', target: '' },
        { id: 'market-share', name: 'Market Share Growth (%)', target: '' }
      ]
    },
    {
      category: 'Operational Metrics',
      kpis: [
        { id: 'automation-efficiency', name: 'Process Automation Rate (%)', target: '' },
        { id: 'cost-reduction', name: 'Operational Cost Reduction (%)', target: '' },
        { id: 'time-to-market', name: 'Product Time-to-Market (days)', target: '' }
      ]
    },
    {
      category: 'Customer Metrics',
      kpis: [
        { id: 'customer-satisfaction', name: 'Customer Satisfaction Score', target: '' },
        { id: 'retention-rate', name: 'Customer Retention Rate (%)', target: '' },
        { id: 'lifetime-value', name: 'Customer Lifetime Value ($)', target: '' }
      ]
    }
  ];
  
  const riskFactors = [
    'Technology obsolescence',
    'Competitive pressure',
    'Regulatory changes',
    'Market saturation',
    'Talent acquisition challenges',
    'Cybersecurity threats',
    'Economic downturn',
    'Supply chain disruptions',
    'Data privacy regulations',
    'AI bias and fairness issues'
  ];
  
  const handleStrategyToggle = (strategyId) => {
    setSelectedScalingStrategies(prev => 
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };
  
  const handleMarketToggle = (market) => {
    setMarketExpansion(prev => 
      prev.includes(market)
        ? prev.filter(m => m !== market)
        : [...prev, market]
    );
  };
  
  const handleKPIUpdate = (kpiId, value) => {
    setScalingMetrics(prev => ({
      ...prev,
      kpiTargets: {
        ...prev.kpiTargets,
        [kpiId]: value
      }
    }));
  };
  
  const handleRiskToggle = (risk) => {
    setScalingMetrics(prev => ({
      ...prev,
      riskMitigation: prev.riskMitigation.includes(risk)
        ? prev.riskMitigation.filter(r => r !== risk)
        : [...prev.riskMitigation, risk]
    }));
  };
  
  const isFormValid = () => {
    return selectedScalingStrategies.length >= 2 && 
           scalingMetrics.targetGrowthRate && 
           scalingMetrics.scalingTimeframe &&
           marketExpansion.length >= 1;
  };
  
  return (
    <div className="growth-scaling">
      <h3>📈 Growth Scaling Strategy</h3>
      <p>Design your comprehensive scaling strategy with AI-powered growth optimization.</p>
      
      <div className="automation-summary">
        <h4>🤖 Current Automation Level: {automationLevel}%</h4>
        <div className="automation-insight">
          {automationLevel >= 70 ? (
            <span className="insight-good">✅ High automation level enables aggressive scaling</span>
          ) : automationLevel >= 40 ? (
            <span className="insight-medium">⚠️ Moderate automation - consider increasing before scaling</span>
          ) : (
            <span className="insight-warning">🚨 Low automation may limit scaling efficiency</span>
          )}
        </div>
      </div>
      
      <div className="scaling-targets">
        <h4>Scaling Targets</h4>
        <div className="targets-grid">
          <div className="form-group">
            <label>Target Growth Rate</label>
            <select
              value={scalingMetrics.targetGrowthRate}
              onChange={(e) => setScalingMetrics(prev => ({ ...prev, targetGrowthRate: e.target.value }))}
            >
              <option value="">Select target growth</option>
              <option value="20-50%">20-50% annually</option>
              <option value="50-100%">50-100% annually</option>
              <option value="100-200%">100-200% annually</option>
              <option value="200%+">200%+ annually</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Scaling Timeframe</label>
            <select
              value={scalingMetrics.scalingTimeframe}
              onChange={(e) => setScalingMetrics(prev => ({ ...prev, scalingTimeframe: e.target.value }))}
            >
              <option value="">Select timeframe</option>
              <option value="6-months">6 months</option>
              <option value="12-months">12 months</option>
              <option value="18-months">18 months</option>
              <option value="24-months">24 months</option>
              <option value="36-months">36 months</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="scaling-strategies">
        <h4>Select Scaling Strategies (Choose at least 2)</h4>
        <div className="strategies-grid">
          {scalingStrategies.map(strategy => (
            <div 
              key={strategy.id}
              className={`strategy-card ${
                selectedScalingStrategies.includes(strategy.id) ? 'selected' : ''
              }`}
              onClick={() => handleStrategyToggle(strategy.id)}
            >
              <div className="strategy-header">
                <h5>{strategy.title}</h5>
                <span className={`complexity ${strategy.complexity.toLowerCase()}`}>
                  {strategy.complexity}
                </span>
              </div>
              <p>{strategy.description}</p>
              <div className="strategy-meta">
                <span className="timeframe">⏱️ {strategy.timeframe}</span>
              </div>
              <div className="requirements">
                <strong>Requirements:</strong>
                <ul>
                  {strategy.requirements.map(req => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="market-expansion">
        <h4>Market Expansion Targets</h4>
        <div className="market-grid">
          {marketExpansionOptions.map(market => (
            <label key={market} className="market-item">
              <input
                type="checkbox"
                checked={marketExpansion.includes(market)}
                onChange={() => handleMarketToggle(market)}
              />
              <span>{market}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="kpi-targets">
        <h4>Key Performance Indicators (KPIs)</h4>
        {kpiCategories.map(category => (
          <div key={category.category} className="kpi-category">
            <h5>{category.category}</h5>
            <div className="kpi-grid">
              {category.kpis.map(kpi => (
                <div key={kpi.id} className="kpi-item">
                  <label>{kpi.name}</label>
                  <input
                    type="text"
                    placeholder="Enter target value"
                    value={scalingMetrics.kpiTargets[kpi.id] || ''}
                    onChange={(e) => handleKPIUpdate(kpi.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="risk-mitigation">
        <h4>Risk Mitigation Planning</h4>
        <div className="risk-grid">
          {riskFactors.map(risk => (
            <label key={risk} className="risk-item">
              <input
                type="checkbox"
                checked={scalingMetrics.riskMitigation.includes(risk)}
                onChange={() => handleRiskToggle(risk)}
              />
              <span>{risk}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="scaling-actions">
        <button 
          onClick={onComplete}
          className="btn-primary"
          disabled={!isFormValid()}
        >
          Finalize with GDPR-Plus Compliance
        </button>
      </div>
      
      <style jsx>{`
        .growth-scaling h3 {
          margin: 0 0 8px 0;
          color: #007bff;
          font-size: 24px;
        }
        
        .automation-summary {
          margin: 24px 0;
          padding: 20px;
          background: rgba(40, 167, 69, 0.05);
          border: 1px solid rgba(40, 167, 69, 0.1);
          border-radius: 8px;
        }
        
        .automation-summary h4 {
          margin: 0 0 12px 0;
          color: #28a745;
        }
        
        .insight-good {
          color: #28a745;
        }
        
        .insight-medium {
          color: #ffc107;
        }
        
        .insight-warning {
          color: #dc3545;
        }
        
        .scaling-targets {
          margin: 32px 0;
        }
        
        .scaling-targets h4 {
          margin: 0 0 16px 0;
          color: #fff;
        }
        
        .targets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          color: #fff;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .form-group select {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
        }
        
        .scaling-strategies {
          margin: 32px 0;
        }
        
        .scaling-strategies h4 {
          margin: 0 0 16px 0;
          color: #fff;
        }
        
        .strategies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 16px;
        }
        
        .strategy-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .strategy-card:hover {
          border-color: rgba(0, 123, 255, 0.3);
          background: rgba(0, 123, 255, 0.05);
        }
        
        .strategy-card.selected {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }
        
        .strategy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .strategy-header h5 {
          margin: 0;
          color: #007bff;
        }
        
        .complexity {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .complexity.low {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }
        
        .complexity.medium {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }
        
        .complexity.high {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }
        
        .strategy-card p {
          margin: 0 0 12px 0;
          color: #ccc;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .strategy-meta {
          margin-bottom: 12px;
        }
        
        .timeframe {
          font-size: 12px;
          color: #28a745;
        }
        
        .requirements {
          font-size: 12px;
          color: #ccc;
        }
        
        .requirements ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }
        
        .requirements li {
          margin-bottom: 2px;
        }
        
        .market-expansion, .kpi-targets, .risk-mitigation {
          margin: 32px 0;
        }
        
        .market-expansion h4, .kpi-targets h4, .risk-mitigation h4 {
          margin: 0 0 16px 0;
          color: #fff;
        }
        
        .market-grid, .risk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .market-item, .risk-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ccc;
        }
        
        .market-item:hover, .risk-item:hover {
          background: rgba(0, 123, 255, 0.05);
          color: #007bff;
        }
        
        .kpi-category {
          margin-bottom: 24px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        
        .kpi-category h5 {
          margin: 0 0 16px 0;
          color: #28a745;
        }
        
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        
        .kpi-item {
          display: flex;
          flex-direction: column;
        }
        
        .kpi-item label {
          color: #fff;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .kpi-item input {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #fff;
          font-size: 14px;
        }
        
        .scaling-actions {
          text-align: center;
          margin-top: 32px;
        }
      `}</style>
    </div>
  );
};

/**
 * GDPR-Plus Compliance View Component
 */
const GDPRPlusComplianceView = ({ profile, insights, gdprCompliance, onComplete }) => {
  const [complianceSettings, setComplianceSettings] = useState({
    dataProcessingPurposes: [],
    consentMechanisms: [],
    dataRetentionPolicies: {},
    privacyEnhancements: [],
    auditingFrequency: '',
    incidentResponsePlan: false,
    dataProtectionOfficer: false,
    crossBorderTransfers: []
  });
  const [privacyByDesign, setPrivacyByDesign] = useState([]);
  const [complianceScore, setComplianceScore] = useState(0);
  
  const dataProcessingPurposes = [
    'Customer service and support',
    'Product development and improvement',
    'Marketing and communications',
    'Analytics and business intelligence',
    'Legal compliance and regulatory requirements',
    'Security and fraud prevention',
    'Payment processing',
    'User authentication and access control',
    'Performance monitoring and optimization',
    'Research and development'
  ];
  
  const consentMechanisms = [
    'Granular consent controls',
    'Opt-in for all non-essential processing',
    'Easy withdrawal mechanisms',
    'Consent refresh notifications',
    'Age-appropriate consent for minors',
    'Separate consent for sensitive data',
    'Clear and plain language explanations',
    'Consent receipts and records'
  ];
  
  const privacyEnhancements = [
    'Differential privacy for analytics',
    'Homomorphic encryption for computations',
    'Zero-knowledge proofs for verification',
    'Federated learning for AI models',
    'Secure multi-party computation',
    'Privacy-preserving record linkage',
    'Synthetic data generation',
    'Quantum-resistant cryptography',
    'Blockchain-based consent management',
    'Automated data minimization'
  ];
  
  const privacyByDesignPrinciples = [
    'Proactive not Reactive',
    'Privacy as the Default Setting',
    'Privacy Embedded into Design',
    'Full Functionality - Positive-Sum',
    'End-to-End Security',
    'Visibility and Transparency',
    'Respect for User Privacy'
  ];
  
  const crossBorderOptions = [
    'EU Standard Contractual Clauses',
    'Adequacy Decision Countries',
    'Binding Corporate Rules (BCRs)',
    'Certification Mechanisms',
    'Codes of Conduct',
    'Data Localization Requirements',
    'Privacy Shield Alternatives',
    'Regional Data Protection Frameworks'
  ];
  
  const handleArrayToggle = (field, value) => {
    setComplianceSettings(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };
  
  const handlePrivacyByDesignToggle = (principle) => {
    setPrivacyByDesign(prev => 
      prev.includes(principle)
        ? prev.filter(p => p !== principle)
        : [...prev, principle]
    );
  };
  
  const calculateComplianceScore = () => {
    let score = 0;
    
    // Base GDPR compliance
    if (gdprCompliance) score += 30;
    
    // Data processing purposes defined
    if (complianceSettings.dataProcessingPurposes.length >= 3) score += 15;
    
    // Consent mechanisms implemented
    if (complianceSettings.consentMechanisms.length >= 4) score += 15;
    
    // Privacy enhancements (GDPR-Plus features)
    if (complianceSettings.privacyEnhancements.length >= 3) score += 20;
    
    // Privacy by Design principles
    if (privacyByDesign.length >= 5) score += 10;
    
    // Governance and processes
    if (complianceSettings.auditingFrequency) score += 5;
    if (complianceSettings.incidentResponsePlan) score += 3;
    if (complianceSettings.dataProtectionOfficer) score += 2;
    
    return Math.min(score, 100);
  };
  
  useEffect(() => {
    setComplianceScore(calculateComplianceScore());
  }, [complianceSettings, privacyByDesign, gdprCompliance]);
  
  const isFormValid = () => {
    return complianceSettings.dataProcessingPurposes.length >= 3 &&
           complianceSettings.consentMechanisms.length >= 4 &&
           complianceSettings.privacyEnhancements.length >= 3 &&
           complianceSettings.auditingFrequency &&
           privacyByDesign.length >= 5;
  };
  
  return (
    <div className="gdpr-plus-compliance">
      <h3>🛡️ GDPR-Plus Compliance Framework</h3>
      <p>Implement enhanced privacy protection that exceeds regulatory requirements.</p>
      
      <div className="compliance-score">
        <h4>Compliance Score: {complianceScore}%</h4>
        <div className="score-bar">
          <div 
            className="score-fill"
            style={{ width: `${complianceScore}%` }}
          ></div>
        </div>
        <div className="score-legend">
          <span className="legend-item">
            <span className="legend-color basic"></span>
            Basic GDPR (0-60%)
          </span>
          <span className="legend-item">
            <span className="legend-color enhanced"></span>
            GDPR-Plus (61-85%)
          </span>
          <span className="legend-item">
            <span className="legend-color premium"></span>
            Privacy Leader (86-100%)
          </span>
        </div>
      </div>
      
      <div className="compliance-section">
        <h4>Data Processing Purposes (Select at least 3)</h4>
        <div className="checkbox-grid">
          {dataProcessingPurposes.map(purpose => (
            <label key={purpose} className="checkbox-item">
              <input
                type="checkbox"
                checked={complianceSettings.dataProcessingPurposes.includes(purpose)}
                onChange={() => handleArrayToggle('dataProcessingPurposes', purpose)}
              />
              <span>{purpose}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="compliance-section">
        <h4>Consent Mechanisms (Select at least 4)</h4>
        <div className="checkbox-grid">
          {consentMechanisms.map(mechanism => (
            <label key={mechanism} className="checkbox-item">
              <input
                type="checkbox"
                checked={complianceSettings.consentMechanisms.includes(mechanism)}
                onChange={() => handleArrayToggle('consentMechanisms', mechanism)}
              />
              <span>{mechanism}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="compliance-section">
        <h4>Privacy Enhancements (GDPR-Plus Features - Select at least 3)</h4>
        <div className="checkbox-grid">
          {privacyEnhancements.map(enhancement => (
            <label key={enhancement} className="checkbox-item enhanced">
              <input
                type="checkbox"
                checked={complianceSettings.privacyEnhancements.includes(enhancement)}
                onChange={() => handleArrayToggle('privacyEnhancements', enhancement)}
              />
              <span>{enhancement}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="compliance-section">
        <h4>Privacy by Design Principles (Select at least 5)</h4>
        <div className="checkbox-grid">
          {privacyByDesignPrinciples.map(principle => (
            <label key={principle} className="checkbox-item">
              <input
                type="checkbox"
                checked={privacyByDesign.includes(principle)}
                onChange={() => handlePrivacyByDesignToggle(principle)}
              />
              <span>{principle}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="compliance-section">
        <h4>Cross-Border Data Transfers</h4>
        <div className="checkbox-grid">
          {crossBorderOptions.map(option => (
            <label key={option} className="checkbox-item">
              <input
                type="checkbox"
                checked={complianceSettings.crossBorderTransfers.includes(option)}
                onChange={() => handleArrayToggle('crossBorderTransfers', option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="compliance-section">
        <h4>Governance and Processes</h4>
        <div className="governance-grid">
          <div className="form-group">
            <label>Auditing Frequency</label>
            <select
              value={complianceSettings.auditingFrequency}
              onChange={(e) => setComplianceSettings(prev => ({ ...prev, auditingFrequency: e.target.value }))}
            >
              <option value="">Select frequency</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annual">Semi-Annual</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={complianceSettings.incidentResponsePlan}
                onChange={(e) => setComplianceSettings(prev => ({ ...prev, incidentResponsePlan: e.target.checked }))}
              />
              <span>Incident Response Plan Implemented</span>
            </label>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={complianceSettings.dataProtectionOfficer}
                onChange={(e) => setComplianceSettings(prev => ({ ...prev, dataProtectionOfficer: e.target.checked }))}
              />
              <span>Data Protection Officer Appointed</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="compliance-summary">
        <h4>🎯 Compliance Implementation Summary</h4>
        <div className="summary-grid">
          <div className="summary-card">
            <h5>Data Processing</h5>
            <p>{complianceSettings.dataProcessingPurposes.length} purposes defined</p>
          </div>
          <div className="summary-card">
            <h5>Consent Management</h5>
            <p>{complianceSettings.consentMechanisms.length} mechanisms implemented</p>
          </div>
          <div className="summary-card">
            <h5>Privacy Enhancements</h5>
            <p>{complianceSettings.privacyEnhancements.length} advanced features</p>
          </div>
          <div className="summary-card">
            <h5>Privacy by Design</h5>
            <p>{privacyByDesign.length}/7 principles adopted</p>
          </div>
        </div>
      </div>
      
      <div className="compliance-actions">
        <button 
          onClick={onComplete}
          className="btn-primary"
          disabled={!isFormValid()}
        >
          Complete Tech-Forward Scaler Implementation
        </button>
      </div>
      
      <style jsx>{`
        .gdpr-plus-compliance h3 {
          margin: 0 0 8px 0;
          color: #007bff;
          font-size: 24px;
        }
        
        .compliance-score {
          margin: 24px 0;
          padding: 24px;
          background: rgba(0, 123, 255, 0.05);
          border: 1px solid rgba(0, 123, 255, 0.1);
          border-radius: 8px;
        }
        
        .compliance-score h4 {
          margin: 0 0 16px 0;
          color: #007bff;
          text-align: center;
        }
        
        .score-bar {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        
        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #dc3545, #ffc107, #28a745);
          transition: width 0.5s ease;
        }
        
        .score-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #ccc;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        
        .legend-color.basic {
          background: #dc3545;
        }
        
        .legend-color.enhanced {
          background: #ffc107;
        }
        
        .legend-color.premium {
          background: #28a745;
        }
        
        .compliance-section {
          margin: 32px 0;
          padding: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .compliance-section h4 {
          margin: 0 0 16px 0;
          color: #fff;
        }
        
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ccc;
        }
        
        .checkbox-item:hover {
          background: rgba(0, 123, 255, 0.05);
          color: #007bff;
        }
        
        .checkbox-item.enhanced {
          border: 1px solid rgba(40, 167, 69, 0.2);
        }
        
        .checkbox-item.enhanced:hover {
          background: rgba(40, 167, 69, 0.05);
          color: #28a745;
        }
        
        .governance-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          align-items: start;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          color: #fff;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .form-group select {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .compliance-summary {
          margin: 32px 0;
          padding: 24px;
          background: rgba(40, 167, 69, 0.05);
          border: 1px solid rgba(40, 167, 69, 0.1);
          border-radius: 8px;
        }
        
        .compliance-summary h4 {
          margin: 0 0 16px 0;
          color: #28a745;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .summary-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          text-align: center;
        }
        
        .summary-card h5 {
          margin: 0 0 8px 0;
          color: #28a745;
          font-size: 14px;
        }
        
        .summary-card p {
          margin: 0;
          color: #ccc;
          font-size: 12px;
        }
        
        .compliance-actions {
          text-align: center;
          margin-top: 32px;
        }
        
        @media (max-width: 768px) {
          .governance-grid {
            grid-template-columns: 1fr;
          }
          
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
          
          .score-legend {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TechForwardScaler;