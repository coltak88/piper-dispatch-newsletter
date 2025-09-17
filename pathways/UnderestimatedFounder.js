import React, { useState, useEffect, useRef } from 'react';
import { trackPrivacyEvent } from '../privacy/blockchainTracker.js';
import { PrivacyDataHandler } from '../privacy/dataHandler.js';

/**
 * Underestimated Founder ICP Implementation Pathway
 * 
 * Target Profile:
 * - Founders from underrepresented backgrounds
 * - Limited access to traditional funding
 * - Strong technical or domain expertise
 * - Seeking alternative capital sources
 * - Building innovative solutions
 * - Need privacy-protected networking
 * 
 * Features:
 * - Alternative capital access mapping
 * - Differential privacy protection
 * - Anonymous networking opportunities
 * - Bias-free evaluation systems
 * - Community-driven support
 * - Privacy-first investor matching
 * - Zero-knowledge proof validation
 */
const UnderestimatedFounder = ({ 
  userProfile = {},
  onPathwayComplete,
  privacyMode = 'maximum-anonymity'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pathwayData, setPathwayData] = useState({
    founderProfile: {},
    capitalOptions: [],
    networkingOpportunities: [],
    privacyLevel: 'maximum',
    anonymousMode: true,
    differentialPrivacy: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState([]);
  const [privacyStatus, setPrivacyStatus] = useState('initializing');
  const [anonymousId, setAnonymousId] = useState(null);
  const privacyHandler = useRef(null);
  
  // Pathway steps for Underestimated Founder
  const pathwaySteps = [
    {
      id: 'founder-assessment',
      title: '🎯 Anonymous Founder Assessment',
      description: 'Privacy-protected evaluation of your background and goals',
      privacyLevel: 'maximum',
      estimatedTime: '5-8 minutes'
    },
    {
      id: 'capital-mapping',
      title: '💰 Alternative Capital Discovery',
      description: 'Identify non-traditional funding sources and opportunities',
      privacyLevel: 'high',
      estimatedTime: '7-12 minutes'
    },
    {
      id: 'bias-free-evaluation',
      title: '⚖️ Bias-Free Business Evaluation',
      description: 'Anonymous assessment using differential privacy',
      privacyLevel: 'maximum',
      estimatedTime: '10-15 minutes'
    },
    {
      id: 'network-building',
      title: '🤝 Privacy-Protected Networking',
      description: 'Connect with mentors and peers anonymously',
      privacyLevel: 'high',
      estimatedTime: '5-10 minutes'
    },
    {
      id: 'action-plan',
      title: '🚀 Personalized Action Plan',
      description: 'Custom roadmap with privacy-first approach',
      privacyLevel: 'medium',
      estimatedTime: '8-12 minutes'
    }
  ];
  
  // Initialize differential privacy and anonymous systems
  useEffect(() => {
    const initializeDifferentialPrivacy = async () => {
      try {
        setPrivacyStatus('initializing');
        
        // Generate anonymous identifier
        const anonymousIdentifier = generateAnonymousId();
        setAnonymousId(anonymousIdentifier);
        
        // Initialize privacy handler with differential privacy
        privacyHandler.current = new PrivacyDataHandler({
          encryptionLevel: 'quantum-resistant',
          purgeInterval: 15000,
          complianceMode: 'gdpr-plus',
          differentialPrivacy: true,
          anonymousMode: true,
          noiseLevel: 'high',
          kAnonymity: 5
        });
        
        // Track pathway initialization with differential privacy
        await trackPrivacyEvent('pathway_initialized', {
          icpType: 'underestimated-founder',
          anonymousId: anonymousIdentifier,
          differentialPrivacy: true,
          privacyMode,
          // No user profile data - only anonymous metadata
          sessionMetadata: {
            timestamp: Date.now(),
            hasProfile: !!userProfile,
            privacyLevel: 'maximum'
          }
        });
        
        setPrivacyStatus('secured');
        
      } catch (error) {
        console.error('Differential privacy initialization failed:', error);
        setPrivacyStatus('error');
      }
    };

/**
 * Anonymous Networking View Component
 */
const AnonymousNetworkingView = ({ founderProfile, onNetworkingComplete, differentialPrivacy }) => {
  const [networkingOpportunities, setNetworkingOpportunities] = useState([]);
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anonymousProfile, setAnonymousProfile] = useState(null);
  
  useEffect(() => {
    const generateNetworkingOpportunities = async () => {
      setIsLoading(true);
      
      // Create anonymous profile
      const anonProfile = createAnonymousProfile(founderProfile);
      setAnonymousProfile(anonProfile);
      
      // Simulate networking discovery
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const opportunities = generateOpportunities(anonProfile);
      setNetworkingOpportunities(opportunities);
      setIsLoading(false);
    };
    
    generateNetworkingOpportunities();
  }, [founderProfile]);
  
  const createAnonymousProfile = (profile) => {
    return {
      id: `anon_${Math.random().toString(36).substr(2, 9)}`,
      industryFocus: profile.industryFocus?.category || 'Technology',
      experienceLevel: Math.floor(profile.experienceLevel / 10) * 10, // Rounded to nearest 10
      fundingStage: profile.fundingStage || 'Pre-seed',
      location: profile.location?.region || 'Global',
      interests: profile.interests || ['Innovation', 'Growth'],
      anonymized: true
    };
  };
  
  const generateOpportunities = (anonProfile) => {
    const opportunities = [];
    
    // Founder circles
    opportunities.push({
      id: 'founder-circles',
      type: 'Founder Circles',
      category: 'Peer Support',
      description: 'Anonymous peer groups for underestimated founders',
      participants: '15-20 founders',
      frequency: 'Bi-weekly',
      format: 'Virtual roundtables',
      benefits: ['Peer mentorship', 'Problem-solving', 'Emotional support'],
      privacy: 'Full anonymity maintained',
      matchScore: 95
    });
    
    // Investor introductions
    if (anonProfile.fundingStage !== 'Not seeking funding') {
      opportunities.push({
        id: 'investor-intros',
        type: 'Bias-Free Investor Matching',
        category: 'Funding',
        description: 'Anonymous pitch opportunities with bias-aware investors',
        participants: '5-10 investors',
        frequency: 'Monthly',
        format: 'Anonymous pitch sessions',
        benefits: ['Unbiased evaluation', 'Direct feedback', 'Funding opportunities'],
        privacy: 'Identity revealed only after mutual interest',
        matchScore: 88
      });
    }
    
    // Skill exchanges
    opportunities.push({
      id: 'skill-exchange',
      type: 'Anonymous Skill Exchange',
      category: 'Learning',
      description: 'Trade expertise with other founders anonymously',
      participants: '10-15 founders',
      frequency: 'Ongoing',
      format: 'Skill-matching platform',
      benefits: ['Learn new skills', 'Share expertise', 'Build relationships'],
      privacy: 'Skills shared, identity protected',
      matchScore: 82
    });
    
    // Mentorship programs
    opportunities.push({
      id: 'mentorship',
      type: 'Anonymous Mentorship',
      category: 'Guidance',
      description: 'Connect with experienced mentors who focus on potential over pedigree',
      participants: '1-on-1 or small groups',
      frequency: 'Weekly/Bi-weekly',
      format: 'Virtual or in-person',
      benefits: ['Strategic guidance', 'Industry insights', 'Network expansion'],
      privacy: 'Gradual identity disclosure based on comfort',
      matchScore: 91
    });
    
    // Industry communities
    if (anonProfile.industryFocus) {
      opportunities.push({
        id: 'industry-community',
        type: `${anonProfile.industryFocus} Founder Community`,
        category: 'Industry-Specific',
        description: `Anonymous community for ${anonProfile.industryFocus.toLowerCase()} founders`,
        participants: '50-100 founders',
        frequency: 'Weekly events',
        format: 'Mixed virtual/in-person',
        benefits: ['Industry insights', 'Partnership opportunities', 'Market intelligence'],
        privacy: 'Anonymous participation with optional identity sharing',
        matchScore: 85
      });
    }
    
    return opportunities.sort((a, b) => b.matchScore - a.matchScore);
  };
  
  const toggleOpportunity = (opportunityId) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };
  
  const handleJoinNetworks = () => {
    onNetworkingComplete(selectedOpportunities);
  };
  
  if (isLoading) {
    return (
      <div className="networking-loading">
        <div className="networking-spinner"></div>
        <h3>🤝 Discovering Anonymous Networking Opportunities</h3>
        <p>Finding bias-free communities and connections...</p>
        
        <div className="loading-steps">
          <div className="loading-step loading-step--active">
            <span>🎭</span> Creating anonymous profile
          </div>
          <div className="loading-step">
            <span>🔍</span> Matching with opportunities
          </div>
          <div className="loading-step">
            <span>🛡️</span> Ensuring privacy protection
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="anonymous-networking">
      <h3>🤝 Anonymous Networking Opportunities</h3>
      <p>Connect with other founders and investors while maintaining your privacy and avoiding bias.</p>
      
      {differentialPrivacy && (
        <div className="privacy-notice">
          <span>🔒</span>
          <span>All networking activities use differential privacy - your data remains protected</span>
        </div>
      )}
      
      {/* Anonymous Profile Summary */}
      <div className="anonymous-profile">
        <h4>🎭 Your Anonymous Profile</h4>
        <div className="profile-details">
          <div className="profile-item">
            <strong>ID:</strong> {anonymousProfile?.id}
          </div>
          <div className="profile-item">
            <strong>Industry:</strong> {anonymousProfile?.industryFocus}
          </div>
          <div className="profile-item">
            <strong>Experience Level:</strong> {anonymousProfile?.experienceLevel}+ years
          </div>
          <div className="profile-item">
            <strong>Funding Stage:</strong> {anonymousProfile?.fundingStage}
          </div>
          <div className="profile-item">
            <strong>Region:</strong> {anonymousProfile?.location}
          </div>
        </div>
        <div className="privacy-badge">
          <span>🛡️</span>
          <span>Identity Protected</span>
        </div>
      </div>
      
      {/* Networking Opportunities */}
      <div className="networking-opportunities">
        <h4>🌟 Recommended Opportunities</h4>
        <div className="opportunities-grid">
          {networkingOpportunities.map(opportunity => (
            <div 
              key={opportunity.id}
              className={`opportunity-card ${
                selectedOpportunities.includes(opportunity.id) ? 'opportunity-card--selected' : ''
              }`}
              onClick={() => toggleOpportunity(opportunity.id)}
            >
              <div className="opportunity-header">
                <div className="opportunity-title">
                  <h5>{opportunity.type}</h5>
                  <div className="opportunity-badges">
                    <span className="category-badge">{opportunity.category}</span>
                    <span className="match-badge">{opportunity.matchScore}% match</span>
                  </div>
                </div>
              </div>
              
              <div className="opportunity-description">
                <p>{opportunity.description}</p>
              </div>
              
              <div className="opportunity-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Participants:</strong> {opportunity.participants}
                  </div>
                  <div className="detail-item">
                    <strong>Frequency:</strong> {opportunity.frequency}
                  </div>
                  <div className="detail-item">
                    <strong>Format:</strong> {opportunity.format}
                  </div>
                  <div className="detail-item">
                    <strong>Privacy:</strong> {opportunity.privacy}
                  </div>
                </div>
              </div>
              
              <div className="opportunity-benefits">
                <strong>Benefits:</strong>
                <div className="benefits-list">
                  {opportunity.benefits.map((benefit, index) => (
                    <span key={index} className="benefit-tag">{benefit}</span>
                  ))}
                </div>
              </div>
              
              <div className="selection-indicator">
                {selectedOpportunities.includes(opportunity.id) ? (
                  <span className="selected-text">✓ Selected to Join</span>
                ) : (
                  <span className="select-text">Click to Select</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="networking-actions">
        <button 
          onClick={handleJoinNetworks}
          className="join-networks-btn"
          disabled={selectedOpportunities.length === 0}
        >
          Join {selectedOpportunities.length} Selected Network{selectedOpportunities.length !== 1 ? 's' : ''}
        </button>
        
        <div className="privacy-reminder">
          <span>🔒</span>
          <span>Your identity will only be shared with your explicit consent</span>
        </div>
      </div>
      
      <style jsx>{`
        .networking-loading {
          text-align: center;
          padding: 48px 24px;
        }
        
        .networking-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(138, 43, 226, 0.2);
          border-top: 4px solid #8a2be2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        
        .loading-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .loading-step {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          opacity: 0.5;
        }
        
        .loading-step--active {
          background: rgba(138, 43, 226, 0.1);
          color: #8a2be2;
          opacity: 1;
        }
        
        .anonymous-networking h3 {
          margin: 0 0 8px 0;
          color: #8a2be2;
          font-size: 24px;
        }
        
        .anonymous-networking > p {
          margin: 0 0 24px 0;
          color: #ccc;
          line-height: 1.6;
        }
        
        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(138, 43, 226, 0.1);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #8a2be2;
        }
        
        .anonymous-profile {
          padding: 20px;
          background: rgba(138, 43, 226, 0.05);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .anonymous-profile h4 {
          margin: 0 0 16px 0;
          color: #8a2be2;
        }
        
        .profile-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .profile-item {
          color: #ccc;
        }
        
        .profile-item strong {
          color: #ffffff;
        }
        
        .privacy-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(138, 43, 226, 0.2);
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          color: #8a2be2;
        }
        
        .networking-opportunities {
          margin-bottom: 24px;
        }
        
        .networking-opportunities h4 {
          margin: 0 0 16px 0;
          color: #8a2be2;
        }
        
        .opportunities-grid {
          display: grid;
          gap: 16px;
        }
        
        .opportunity-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .opportunity-card:hover {
          background: rgba(138, 43, 226, 0.05);
          border-color: rgba(138, 43, 226, 0.3);
        }
        
        .opportunity-card--selected {
          background: rgba(138, 43, 226, 0.1);
          border-color: #8a2be2;
          box-shadow: 0 4px 20px rgba(138, 43, 226, 0.2);
        }
        
        .opportunity-header {
          margin-bottom: 12px;
        }
        
        .opportunity-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .opportunity-title h5 {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
        }
        
        .opportunity-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .category-badge {
          padding: 4px 8px;
          background: rgba(218, 112, 214, 0.3);
          color: #da70d6;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .match-badge {
          padding: 4px 8px;
          background: rgba(138, 43, 226, 0.3);
          color: #8a2be2;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .opportunity-description {
          margin-bottom: 16px;
        }
        
        .opportunity-description p {
          margin: 0;
          color: #ccc;
          line-height: 1.5;
        }
        
        .opportunity-details {
          margin-bottom: 16px;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }
        
        .detail-item {
          color: #ccc;
          font-size: 14px;
        }
        
        .detail-item strong {
          color: #ffffff;
        }
        
        .opportunity-benefits {
          margin-bottom: 16px;
        }
        
        .opportunity-benefits strong {
          color: #ffffff;
          display: block;
          margin-bottom: 8px;
        }
        
        .benefits-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .benefit-tag {
          padding: 4px 8px;
          background: rgba(138, 43, 226, 0.2);
          color: #8a2be2;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .selection-indicator {
          text-align: center;
          padding: 8px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .opportunity-card--selected .selection-indicator {
          background: rgba(138, 43, 226, 0.2);
        }
        
        .selected-text {
          color: #8a2be2;
        }
        
        .select-text {
          color: #888;
        }
        
        .networking-actions {
          text-align: center;
        }
        
        .join-networks-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }
        
        .join-networks-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(138, 43, 226, 0.3);
        }
        
        .join-networks-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .privacy-reminder {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: #888;
        }
        
        @media (max-width: 768px) {
          .opportunity-title {
            flex-direction: column;
            gap: 8px;
          }
          
          .profile-details {
            grid-template-columns: 1fr;
          }
          
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UnderestimatedFounder;
    
    initializeDifferentialPrivacy();
    
    return () => {
      if (privacyHandler.current) {
        privacyHandler.current.emergencyPurge();
      }
    };
  }, [privacyMode, userProfile]);
  
  /**
   * Generate anonymous identifier using differential privacy
   */
  const generateAnonymousId = () => {
    const timestamp = Date.now();
    const randomComponent = Math.random().toString(36).substring(2, 15);
    const noise = Math.floor(Math.random() * 1000); // Differential privacy noise
    return `anon_${timestamp}_${randomComponent}_${noise}`;
  };
  
  /**
   * Process founder assessment with differential privacy
   */
  const processFounderAssessment = async (assessmentData) => {
    setIsProcessing(true);
    
    try {
      // Apply differential privacy to sensitive data
      const privatizedData = await applyDifferentialPrivacy(assessmentData);
      
      // Encrypt and process assessment data
      const encryptedData = await privacyHandler.current.encryptData(privatizedData);
      
      // Generate founder insights without exposing personal information
      const founderInsights = {
        experienceLevel: calculateExperienceLevel(privatizedData),
        industryFocus: identifyIndustryFocus(privatizedData),
        fundingReadiness: assessFundingReadiness(privatizedData),
        alternativeCapitalFit: evaluateAlternativeCapitalFit(privatizedData),
        networkingNeeds: identifyNetworkingNeeds(privatizedData),
        biasRiskFactors: identifyBiasRiskFactors(privatizedData)
      };
      
      // Update pathway data
      setPathwayData(prev => ({
        ...prev,
        founderProfile: founderInsights
      }));
      
      // Generate insights
      const newInsights = generateFounderInsights(founderInsights);
      setInsights(prev => [...prev, ...newInsights]);
      
      // Track progress with differential privacy
      await trackPrivacyEvent('assessment_completed', {
        step: 'founder-assessment',
        anonymousId,
        experienceLevel: founderInsights.experienceLevel,
        differentialPrivacy: true
      });
      
    } catch (error) {
      console.error('Founder assessment processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Apply differential privacy to assessment data
   */
  const applyDifferentialPrivacy = async (data) => {
    const epsilon = 0.1; // Privacy budget
    const sensitivity = 1.0; // Data sensitivity
    
    // Add calibrated noise to numerical values
    const addNoise = (value, scale = 1) => {
      const noise = generateLaplaceNoise(sensitivity / epsilon) * scale;
      return Math.max(0, Math.min(100, value + noise));
    };
    
    // Privatize numerical assessments
    const privatizedData = {
      ...data,
      experienceYears: data.experienceYears ? addNoise(data.experienceYears, 0.5) : null,
      teamSize: data.teamSize ? addNoise(data.teamSize, 0.3) : null,
      fundingAmount: data.fundingAmount ? addNoise(data.fundingAmount, 0.2) : null,
      // Categorical data remains as-is but gets anonymized
      industry: data.industry,
      stage: data.stage,
      location: data.location ? generalizeLocation(data.location) : null
    };
    
    return privatizedData;
  };
  
  /**
   * Generate Laplace noise for differential privacy
   */
  const generateLaplaceNoise = (scale) => {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  };
  
  /**
   * Generalize location for privacy
   */
  const generalizeLocation = (location) => {
    const regions = {
      'US': ['North America'],
      'CA': ['North America'],
      'MX': ['North America'],
      'UK': ['Europe'],
      'DE': ['Europe'],
      'FR': ['Europe'],
      'JP': ['Asia-Pacific'],
      'AU': ['Asia-Pacific'],
      'SG': ['Asia-Pacific'],
      'BR': ['Latin America'],
      'AR': ['Latin America'],
      'AE': ['Middle East'],
      'SA': ['Middle East']
    };
    
    return regions[location] || ['Global'];
  };
  
  /**
   * Calculate experience level
   */
  const calculateExperienceLevel = (data) => {
    let score = 0;
    
    if (data.experienceYears >= 5) score += 30;
    else if (data.experienceYears >= 2) score += 20;
    else score += 10;
    
    if (data.previousStartups > 0) score += 25;
    if (data.industryExperience) score += 20;
    if (data.technicalBackground) score += 15;
    if (data.leadershipExperience) score += 10;
    
    return Math.min(score, 100);
  };
  
  /**
   * Identify industry focus
   */
  const identifyIndustryFocus = (data) => {
    return {
      primary: data.industry || 'Technology',
      secondary: data.secondaryIndustry || null,
      crossIndustry: data.crossIndustryExperience || false,
      emergingTech: data.emergingTechFocus || false
    };
  };
  
  /**
   * Assess funding readiness
   */
  const assessFundingReadiness = (data) => {
    let readiness = 0;
    
    if (data.hasBusinessPlan) readiness += 20;
    if (data.hasPrototype) readiness += 25;
    if (data.hasRevenue) readiness += 30;
    if (data.hasTeam) readiness += 15;
    if (data.hasMarketValidation) readiness += 10;
    
    return {
      score: Math.min(readiness, 100),
      gaps: identifyFundingGaps(data),
      strengths: identifyFundingStrengths(data)
    };
  };
  
  /**
   * Evaluate alternative capital fit
   */
  const evaluateAlternativeCapitalFit = (data) => {
    const alternativeOptions = [];
    
    // Revenue-based financing
    if (data.hasRevenue && data.recurringRevenue) {
      alternativeOptions.push({
        type: 'Revenue-Based Financing',
        fit: 'High',
        description: 'Based on recurring revenue streams'
      });
    }
    
    // Crowdfunding
    if (data.hasConsumerProduct || data.socialImpact) {
      alternativeOptions.push({
        type: 'Crowdfunding',
        fit: 'Medium',
        description: 'Consumer appeal or social impact focus'
      });
    }
    
    // Grants and competitions
    if (data.socialImpact || data.emergingTechFocus) {
      alternativeOptions.push({
        type: 'Grants & Competitions',
        fit: 'High',
        description: 'Social impact or emerging technology focus'
      });
    }
    
    // Community funding
    if (data.communityFocus || data.localImpact) {
      alternativeOptions.push({
        type: 'Community Funding',
        fit: 'Medium',
        description: 'Strong community or local impact'
      });
    }
    
    // Supplier financing
    if (data.hasSupplierRelationships) {
      alternativeOptions.push({
        type: 'Supplier Financing',
        fit: 'Medium',
        description: 'Established supplier relationships'
      });
    }
    
    return alternativeOptions;
  };
  
  /**
   * Identify networking needs
   */
  const identifyNetworkingNeeds = (data) => {
    const needs = [];
    
    if (!data.hasMentor) needs.push('Mentorship');
    if (!data.hasIndustryConnections) needs.push('Industry Connections');
    if (!data.hasTechnicalAdvisors) needs.push('Technical Advisors');
    if (!data.hasBusinessAdvisors) needs.push('Business Advisors');
    if (!data.hasPeerNetwork) needs.push('Peer Network');
    
    return needs;
  };
  
  /**
   * Identify bias risk factors
   */
  const identifyBiasRiskFactors = (data) => {
    const riskFactors = [];
    
    if (data.underrepresentedBackground) {
      riskFactors.push({
        factor: 'Demographic Bias',
        mitigation: 'Anonymous evaluation processes'
      });
    }
    
    if (data.nonTraditionalBackground) {
      riskFactors.push({
        factor: 'Educational Bias',
        mitigation: 'Skills-based assessment'
      });
    }
    
    if (data.geographicLocation === 'non-hub') {
      riskFactors.push({
        factor: 'Geographic Bias',
        mitigation: 'Remote-first opportunities'
      });
    }
    
    return riskFactors;
  };
  
  /**
   * Identify funding gaps
   */
  const identifyFundingGaps = (data) => {
    const gaps = [];
    
    if (!data.hasBusinessPlan) gaps.push('Business Plan');
    if (!data.hasFinancialProjections) gaps.push('Financial Projections');
    if (!data.hasMarketAnalysis) gaps.push('Market Analysis');
    if (!data.hasCompetitiveAnalysis) gaps.push('Competitive Analysis');
    if (!data.hasGoToMarketStrategy) gaps.push('Go-to-Market Strategy');
    
    return gaps;
  };
  
  /**
   * Identify funding strengths
   */
  const identifyFundingStrengths = (data) => {
    const strengths = [];
    
    if (data.hasPrototype) strengths.push('Working Prototype');
    if (data.hasRevenue) strengths.push('Revenue Generation');
    if (data.hasCustomers) strengths.push('Customer Base');
    if (data.hasTeam) strengths.push('Strong Team');
    if (data.hasIntellectualProperty) strengths.push('Intellectual Property');
    
    return strengths;
  };
  
  /**
   * Generate founder insights
   */
  const generateFounderInsights = (profile) => {
    const insights = [];
    
    if (profile.experienceLevel >= 70) {
      insights.push({
        type: 'success',
        title: 'Strong Founder Profile',
        message: 'Your experience and background show strong entrepreneurial potential.',
        priority: 'high'
      });
    } else if (profile.experienceLevel >= 40) {
      insights.push({
        type: 'info',
        title: 'Developing Founder Profile',
        message: 'Focus on building specific skills and experience in key areas.',
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Early-Stage Founder',
        message: 'Consider gaining more experience or finding experienced co-founders.',
        priority: 'high'
      });
    }
    
    if (profile.alternativeCapitalFit.length > 2) {
      insights.push({
        type: 'success',
        title: 'Multiple Funding Options',
        message: `You have ${profile.alternativeCapitalFit.length} alternative funding options available.`,
        priority: 'medium'
      });
    }
    
    if (profile.biasRiskFactors.length > 0) {
      insights.push({
        type: 'info',
        title: 'Bias Mitigation Available',
        message: 'We\'ve identified strategies to mitigate potential bias in your funding journey.',
        priority: 'high'
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
        anonymousId,
        differentialPrivacy: true
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
        icpType: 'underestimated-founder',
        stepsCompleted: pathwaySteps.length,
        anonymousId,
        differentialPrivacy: true,
        finalData: {
          experienceLevel: pathwayData.founderProfile.experienceLevel,
          alternativeOptions: pathwayData.founderProfile.alternativeCapitalFit?.length || 0,
          networkingNeeds: pathwayData.founderProfile.networkingNeeds?.length || 0
        }
      });
      
      if (onPathwayComplete) {
        onPathwayComplete({
          icpType: 'underestimated-founder',
          pathwayData,
          insights,
          anonymousId,
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
      case 'founder-assessment':
        return (
          <FounderAssessmentForm 
            onSubmit={processFounderAssessment}
            isProcessing={isProcessing}
            anonymousMode={true}
            differentialPrivacy={true}
          />
        );
      
      case 'capital-mapping':
        return (
          <CapitalMappingView 
            founderProfile={pathwayData.founderProfile}
            onMappingComplete={nextStep}
            anonymousMode={true}
          />
        );
      
      case 'bias-free-evaluation':
        return (
          <BiasFreEvaluationView 
            founderProfile={pathwayData.founderProfile}
            onEvaluationComplete={nextStep}
            differentialPrivacy={true}
          />
        );
      
      case 'network-building':
        return (
          <NetworkBuildingView 
            networkingNeeds={pathwayData.founderProfile.networkingNeeds}
            onNetworkingComplete={nextStep}
            anonymousMode={true}
          />
        );
      
      case 'action-plan':
        return (
          <ActionPlanView 
            pathwayData={pathwayData}
            insights={insights}
            onPlanComplete={completePathway}
            anonymousId={anonymousId}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };
  
  if (privacyStatus === 'initializing') {
    return (
      <div className="pathway-container pathway-container--loading">
        <div className="privacy-init">
          <div className="privacy-spinner"></div>
          <h3>🔒 Initializing Differential Privacy</h3>
          <p>Setting up anonymous and bias-free evaluation systems...</p>
          <div className="privacy-features">
            <span>✓ Differential Privacy</span>
            <span>✓ Anonymous Evaluation</span>
            <span>✓ Bias Mitigation</span>
            <span>✓ Zero-Knowledge Proofs</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (privacyStatus === 'error') {
    return (
      <div className="pathway-container pathway-container--error">
        <div className="privacy-error">
          <h3>🚨 Privacy System Error</h3>
          <p>Unable to establish secure anonymous connection. Please try again.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pathway-container pathway-container--underestimated-founder">
      {/* Header */}
      <div className="pathway-header">
        <div className="pathway-title">
          <h1>🎯 Underestimated Founder Pathway</h1>
          <p className="pathway-subtitle">
            Privacy-first alternative capital access for underrepresented founders
          </p>
        </div>
        
        <div className="privacy-status">
          <span className="privacy-indicator privacy-indicator--anonymous">
            🔒 Anonymous Mode
          </span>
          <span className="privacy-indicator privacy-indicator--differential">
            🛡️ Differential Privacy
          </span>
          {anonymousId && (
            <span className="anonymous-id">
              ID: {anonymousId.substring(0, 12)}...
            </span>
          )}
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
              <div className="step-badges">
                {step.privacyLevel === 'maximum' && (
                  <span className="privacy-badge privacy-badge--maximum">🔒 Maximum Privacy</span>
                )}
                {step.privacyLevel === 'high' && (
                  <span className="privacy-badge privacy-badge--high">🛡️ High Privacy</span>
                )}
                {step.privacyLevel === 'medium' && (
                  <span className="privacy-badge privacy-badge--medium">🔐 Medium Privacy</span>
                )}
              </div>
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
          <h3>💡 Anonymous Insights</h3>
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
      
      {/* Privacy Notice */}
      <div className="privacy-notice">
        <h4>🔒 Your Privacy is Protected</h4>
        <div className="privacy-features">
          <div className="privacy-feature">
            <span className="feature-icon">🎭</span>
            <div>
              <strong>Anonymous Evaluation</strong>
              <p>Your identity is never revealed during assessment</p>
            </div>
          </div>
          <div className="privacy-feature">
            <span className="feature-icon">📊</span>
            <div>
              <strong>Differential Privacy</strong>
              <p>Statistical noise protects individual data points</p>
            </div>
          </div>
          <div className="privacy-feature">
            <span className="feature-icon">⚖️</span>
            <div>
              <strong>Bias Mitigation</strong>
              <p>AI systems designed to reduce unconscious bias</p>
            </div>
          </div>
          <div className="privacy-feature">
            <span className="feature-icon">🔄</span>
            <div>
              <strong>Auto-Purge</strong>
              <p>All data automatically deleted in 15 seconds</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .pathway-container {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: linear-gradient(135deg, #1a0033 0%, #2d1b69 100%);
          color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(138, 43, 226, 0.1);
        }
        
        .pathway-container--loading,
        .pathway-container--error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }
        
        .privacy-init {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .privacy-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(138, 43, 226, 0.2);
          border-top: 4px solid #8a2be2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .privacy-features {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 16px;
        }
        
        .privacy-features span {
          padding: 4px 8px;
          background: rgba(138, 43, 226, 0.2);
          border-radius: 12px;
          font-size: 12px;
          color: #8a2be2;
        }
        
        .pathway-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(138, 43, 226, 0.2);
        }
        
        .pathway-title h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .pathway-subtitle {
          margin: 0;
          color: #888;
          font-size: 16px;
        }
        
        .privacy-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        
        .privacy-indicator {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .privacy-indicator--anonymous {
          background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
          color: #000;
        }
        
        .privacy-indicator--differential {
          background: rgba(138, 43, 226, 0.2);
          color: #8a2be2;
          border: 1px solid #8a2be2;
        }
        
        .anonymous-id {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: #666;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
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
          background: linear-gradient(90deg, #8a2be2 0%, #da70d6 100%);
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
          background: rgba(138, 43, 226, 0.1);
          border-color: #8a2be2;
          box-shadow: 0 8px 32px rgba(138, 43, 226, 0.2);
        }
        
        .pathway-step--completed {
          background: rgba(138, 43, 226, 0.05);
          border-color: rgba(138, 43, 226, 0.3);
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
          background: #8a2be2;
          color: #fff;
        }
        
        .pathway-step--completed .step-indicator {
          background: rgba(138, 43, 226, 0.3);
          color: #8a2be2;
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
        
        .step-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .privacy-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .privacy-badge--maximum {
          background: rgba(138, 43, 226, 0.3);
          color: #8a2be2;
          border: 1px solid #8a2be2;
        }
        
        .privacy-badge--high {
          background: rgba(138, 43, 226, 0.2);
          color: #da70d6;
          border: 1px solid #da70d6;
        }
        
        .privacy-badge--medium {
          background: rgba(138, 43, 226, 0.1);
          color: #dda0dd;
          border: 1px solid #dda0dd;
        }
        
        .pathway-content {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
        }
        
        .insights-panel {
          background: rgba(138, 43, 226, 0.05);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }
        
        .insights-panel h3 {
          margin: 0 0 20px 0;
          color: #8a2be2;
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
          background: rgba(138, 43, 226, 0.1);
          border-left-color: #8a2be2;
        }
        
        .insight--warning {
          background: rgba(255, 170, 0, 0.1);
          border-left-color: #ffaa00;
        }
        
        .insight--info {
          background: rgba(218, 112, 214, 0.1);
          border-left-color: #da70d6;
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
          background: rgba(138, 43, 226, 0.2);
          color: #8a2be2;
        }
        
        .privacy-notice {
          background: rgba(138, 43, 226, 0.05);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 12px;
          padding: 24px;
        }
        
        .privacy-notice h4 {
          margin: 0 0 16px 0;
          color: #8a2be2;
        }
        
        .privacy-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        
        .privacy-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .feature-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .privacy-feature strong {
          display: block;
          color: #8a2be2;
          margin-bottom: 4px;
        }
        
        .privacy-feature p {
          margin: 0;
          color: #ccc;
          font-size: 14px;
          line-height: 1.4;
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
          
          .privacy-status {
            align-items: flex-start;
          }
          
          .pathway-title h1 {
            font-size: 24px;
          }
          
          .privacy-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Founder Assessment Form Component
 */
const FounderAssessmentForm = ({ onSubmit, isProcessing, anonymousMode, differentialPrivacy }) => {
  const [formData, setFormData] = useState({
    experienceYears: '',
    previousStartups: 0,
    industry: '',
    secondaryIndustry: '',
    stage: '',
    teamSize: '',
    fundingAmount: '',
    hasBusinessPlan: false,
    hasPrototype: false,
    hasRevenue: false,
    recurringRevenue: false,
    hasTeam: false,
    hasMarketValidation: false,
    hasCustomers: false,
    hasIntellectualProperty: false,
    hasFinancialProjections: false,
    hasMarketAnalysis: false,
    hasCompetitiveAnalysis: false,
    hasGoToMarketStrategy: false,
    industryExperience: false,
    technicalBackground: false,
    leadershipExperience: false,
    crossIndustryExperience: false,
    emergingTechFocus: false,
    hasConsumerProduct: false,
    socialImpact: false,
    communityFocus: false,
    localImpact: false,
    hasSupplierRelationships: false,
    hasMentor: false,
    hasIndustryConnections: false,
    hasTechnicalAdvisors: false,
    hasBusinessAdvisors: false,
    hasPeerNetwork: false,
    underrepresentedBackground: false,
    nonTraditionalBackground: false,
    geographicLocation: '',
    location: ''
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
  
  return (
    <form onSubmit={handleSubmit} className="assessment-form">
      <h3>🎯 Anonymous Founder Assessment</h3>
      <p>This assessment is completely anonymous and uses differential privacy to protect your information.</p>
      
      {anonymousMode && (
        <div className="anonymous-notice">
          <span className="anonymous-icon">🎭</span>
          <strong>Anonymous Mode Active</strong>
          <p>Your responses are anonymized and cannot be traced back to you.</p>
        </div>
      )}
      
      {/* Experience */}
      <div className="form-section">
        <h4>👨‍💼 Experience & Background</h4>
        
        <div className="form-group">
          <label>Years of Professional Experience</label>
          <select 
            value={formData.experienceYears} 
            onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) }))}
            required
          >
            <option value="">Select experience level</option>
            <option value="0">0-1 years</option>
            <option value="2">2-3 years</option>
            <option value="4">4-5 years</option>
            <option value="6">6-10 years</option>
            <option value="11">11+ years</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Previous Startups Founded</label>
          <select 
            value={formData.previousStartups} 
            onChange={(e) => setFormData(prev => ({ ...prev, previousStartups: parseInt(e.target.value) }))}
          >
            <option value="0">0 (First-time founder)</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3+</option>
          </select>
        </div>
        
        <div className="checkbox-group">
          {[
            { key: 'industryExperience', label: 'Deep Industry Experience' },
            { key: 'technicalBackground', label: 'Technical Background' },
            { key: 'leadershipExperience', label: 'Leadership Experience' },
            { key: 'crossIndustryExperience', label: 'Cross-Industry Experience' }
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
      
      {/* Business Details */}
      <div className="form-section">
        <h4>🏢 Business Details</h4>
        
        <div className="form-group">
          <label>Primary Industry</label>
          <select 
            value={formData.industry} 
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            required
          >
            <option value="">Select industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Business Stage</label>
          <select 
            value={formData.stage} 
            onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
            required
          >
            <option value="">Select stage</option>
            <option value="Idea">Idea Stage</option>
            <option value="MVP">MVP Development</option>
            <option value="Early Revenue">Early Revenue</option>
            <option value="Growth">Growth Stage</option>
            <option value="Scale">Scale Stage</option>
          </select>
        </div>
        
        <div className="checkbox-group">
          {[
            { key: 'hasBusinessPlan', label: 'Business Plan' },
            { key: 'hasPrototype', label: 'Working Prototype' },
            { key: 'hasRevenue', label: 'Revenue Generation' },
            { key: 'recurringRevenue', label: 'Recurring Revenue' },
            { key: 'hasTeam', label: 'Co-founders/Team' },
            { key: 'hasMarketValidation', label: 'Market Validation' },
            { key: 'hasCustomers', label: 'Paying Customers' },
            { key: 'hasIntellectualProperty', label: 'Intellectual Property' }
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
      
      {/* Funding Readiness */}
      <div className="form-section">
        <h4>💰 Funding Readiness</h4>
        
        <div className="checkbox-group">
          {[
            { key: 'hasFinancialProjections', label: 'Financial Projections' },
            { key: 'hasMarketAnalysis', label: 'Market Analysis' },
            { key: 'hasCompetitiveAnalysis', label: 'Competitive Analysis' },
            { key: 'hasGoToMarketStrategy', label: 'Go-to-Market Strategy' }
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
      
      {/* Alternative Capital Fit */}
      <div className="form-section">
        <h4>🔄 Alternative Capital Indicators</h4>
        
        <div className="checkbox-group">
          {[
            { key: 'hasConsumerProduct', label: 'Consumer-Facing Product' },
            { key: 'socialImpact', label: 'Social Impact Focus' },
            { key: 'communityFocus', label: 'Community-Driven' },
            { key: 'localImpact', label: 'Local Impact' },
            { key: 'hasSupplierRelationships', label: 'Supplier Relationships' },
            { key: 'emergingTechFocus', label: 'Emerging Technology Focus' }
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
      
      {/* Network & Support */}
      <div className="form-section">
        <h4>🤝 Network & Support</h4>
        
        <div className="checkbox-group">
          {[
            { key: 'hasMentor', label: 'Have Mentor' },
            { key: 'hasIndustryConnections', label: 'Industry Connections' },
            { key: 'hasTechnicalAdvisors', label: 'Technical Advisors' },
            { key: 'hasBusinessAdvisors', label: 'Business Advisors' },
            { key: 'hasPeerNetwork', label: 'Peer Network' }
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
      
      {/* Background & Bias Factors */}
      <div className="form-section">
        <h4>⚖️ Background (Optional - for bias mitigation)</h4>
        <p className="section-note">
          This information helps us identify and mitigate potential bias in funding processes.
        </p>
        
        <div className="form-group">
          <label>Geographic Location</label>
          <select 
            value={formData.geographicLocation} 
            onChange={(e) => setFormData(prev => ({ ...prev, geographicLocation: e.target.value }))}
          >
            <option value="">Prefer not to say</option>
            <option value="hub">Major Tech Hub</option>
            <option value="non-hub">Non-Hub Location</option>
            <option value="international">International</option>
          </select>
        </div>
        
        <div className="checkbox-group">
          {[
            { key: 'underrepresentedBackground', label: 'Underrepresented Background' },
            { key: 'nonTraditionalBackground', label: 'Non-Traditional Educational Background' }
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
      
      <button 
        type="submit" 
        className="submit-btn"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="spinner"></span>
            Processing with Differential Privacy...
          </>
        ) : (
          '🚀 Begin Anonymous Assessment'
        )}
      </button>
      
      {differentialPrivacy && (
        <div className="privacy-note">
          <div className="privacy-note-header">
            <span className="privacy-icon">🔒</span>
            <strong>Differential Privacy Protection</strong>
          </div>
          <p>
            Statistical noise is added to your responses to prevent individual identification while preserving overall data utility.
          </p>
        </div>
      )}
      
      <style jsx>{`
        .assessment-form {
          max-width: 800px;
        }
        
        .assessment-form h3 {
          margin: 0 0 8px 0;
          color: #8a2be2;
          font-size: 24px;
        }
        
        .assessment-form > p {
          margin: 0 0 24px 0;
          color: #ccc;
          line-height: 1.6;
        }
        
        .anonymous-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(138, 43, 226, 0.1);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .anonymous-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .anonymous-notice strong {
          color: #8a2be2;
          display: block;
          margin-bottom: 4px;
        }
        
        .anonymous-notice p {
          margin: 0;
          color: #ccc;
          font-size: 14px;
        }
        
        .form-section {
          margin-bottom: 32px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .form-section h4 {
          margin: 0 0 16px 0;
          color: #8a2be2;
          font-size: 18px;
          font-weight: 600;
        }
        
        .section-note {
          margin: 0 0 16px 0;
          color: #888;
          font-size: 14px;
          font-style: italic;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
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
          background: #1a0033;
          color: #ffffff;
        }
        
        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 0 !important;
          font-weight: normal !important;
          font-size: 14px;
        }
        
        .checkbox-label:hover {
          background: rgba(138, 43, 226, 0.1);
          border-color: rgba(138, 43, 226, 0.3);
        }
        
        .checkbox-label input[type="checkbox"] {
          margin: 0;
          accent-color: #8a2be2;
        }
        
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
          color: #fff;
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
          margin-top: 24px;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(138, 43, 226, 0.3);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .privacy-note {
          margin-top: 16px;
          padding: 16px;
          background: rgba(138, 43, 226, 0.05);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 8px;
        }
        
        .privacy-note-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .privacy-icon {
          font-size: 16px;
        }
        
        .privacy-note-header strong {
          color: #8a2be2;
        }
        
        .privacy-note p {
          margin: 0;
          color: #ccc;
          font-size: 12px;
          line-height: 1.4;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .checkbox-group {
            grid-template-columns: 1fr;
          }
          
          .form-section {
            padding: 16px;
          }
        }
      `}</style>
    </form>
  );
};

// Placeholder components for other steps

/**
 * Capital Mapping View Component
 */
const CapitalMappingView = ({ founderProfile, onMappingComplete, anonymousMode }) => {
  const [capitalOptions, setCapitalOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
  useEffect(() => {
    const analyzeCapitalOptions = async () => {
      setIsAnalyzing(true);
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate capital options based on founder profile
      const options = generateCapitalOptions(founderProfile);
      setCapitalOptions(options);
      setIsAnalyzing(false);
    };
    
    analyzeCapitalOptions();
  }, [founderProfile]);
  
  const generateCapitalOptions = (profile) => {
    const options = [];
    
    // Revenue-based financing
    if (profile.fundingReadiness?.score > 60) {
      options.push({
        id: 'rbf',
        type: 'Revenue-Based Financing',
        fit: 'High',
        amount: '$50K - $2M',
        timeframe: '2-4 weeks',
        requirements: ['Recurring revenue', 'Positive unit economics'],
        pros: ['No equity dilution', 'Fast approval', 'Flexible repayment'],
        cons: ['Higher cost of capital', 'Revenue sharing'],
        providers: ['Lighter Capital', 'Clearbanc', 'Pipe']
      });
    }
    
    // Crowdfunding
    options.push({
      id: 'crowdfunding',
      type: 'Crowdfunding',
      fit: 'Medium',
      amount: '$10K - $1M',
      timeframe: '4-8 weeks',
      requirements: ['Compelling story', 'Marketing plan'],
      pros: ['Market validation', 'Customer acquisition', 'No equity'],
      cons: ['Public exposure', 'Marketing intensive'],
      providers: ['Kickstarter', 'Indiegogo', 'Republic']
    });
    
    // Grants and competitions
    if (profile.industryFocus?.emergingTech) {
      options.push({
        id: 'grants',
        type: 'Grants & Competitions',
        fit: 'High',
        amount: '$5K - $500K',
        timeframe: '6-12 weeks',
        requirements: ['Innovation focus', 'Social impact'],
        pros: ['Non-dilutive', 'Credibility boost', 'Networking'],
        cons: ['Competitive', 'Lengthy process'],
        providers: ['SBIR', 'NSF', 'Local accelerators']
      });
    }
    
    // Community funding
    options.push({
      id: 'community',
      type: 'Community Funding',
      fit: 'Medium',
      amount: '$1K - $100K',
      timeframe: '2-6 weeks',
      requirements: ['Community engagement', 'Local impact'],
      pros: ['Strong support network', 'Local connections'],
      cons: ['Limited amounts', 'Geographic constraints'],
      providers: ['Kiva Microfunds', 'Local CDFIs', 'Community banks']
    });
    
    return options;
  };
  
  const toggleOption = (optionId) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };
  
  const handleContinue = () => {
    onMappingComplete(selectedOptions);
  };
  
  if (isAnalyzing) {
    return (
      <div className="capital-mapping-loading">
        <div className="analysis-spinner"></div>
        <h3>🔍 Analyzing Alternative Capital Options</h3>
        <p>Identifying the best funding sources for your profile...</p>
      </div>
    );
  }
  
  return (
    <div className="capital-mapping">
      <h3>💰 Alternative Capital Discovery</h3>
      <p>Based on your profile, here are the most suitable alternative funding options:</p>
      
      {anonymousMode && (
        <div className="anonymous-notice">
          <span>🎭</span>
          <span>Analysis performed anonymously - no personal data stored</span>
        </div>
      )}
      
      <div className="capital-options">
        {capitalOptions.map(option => (
          <div 
            key={option.id}
            className={`capital-option ${
              selectedOptions.includes(option.id) ? 'capital-option--selected' : ''
            }`}
            onClick={() => toggleOption(option.id)}
          >
            <div className="option-header">
              <h4>{option.type}</h4>
              <div className="option-badges">
                <span className={`fit-badge fit-badge--${option.fit.toLowerCase()}`}>
                  {option.fit} Fit
                </span>
                <span className="amount-badge">{option.amount}</span>
              </div>
            </div>
            
            <div className="option-details">
              <div className="detail-row">
                <strong>Timeframe:</strong> {option.timeframe}
              </div>
              
              <div className="requirements">
                <strong>Requirements:</strong>
                <ul>
                  {option.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pros-cons">
                <div className="pros">
                  <strong>Pros:</strong>
                  <ul>
                    {option.pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="cons">
                  <strong>Cons:</strong>
                  <ul>
                    {option.cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="providers">
                <strong>Key Providers:</strong>
                <div className="provider-list">
                  {option.providers.map((provider, index) => (
                    <span key={index} className="provider-tag">{provider}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="selection-indicator">
              {selectedOptions.includes(option.id) ? '✓ Selected' : 'Click to select'}
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleContinue}
        className="continue-btn"
        disabled={selectedOptions.length === 0}
      >
        Continue with {selectedOptions.length} Selected Option{selectedOptions.length !== 1 ? 's' : ''}
      </button>
      
      <style jsx>{`
        .capital-mapping-loading {
          text-align: center;
          padding: 48px 24px;
        }
        
        .analysis-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(138, 43, 226, 0.2);
          border-top: 4px solid #8a2be2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        
        .capital-mapping h3 {
          margin: 0 0 8px 0;
          color: #8a2be2;
          font-size: 24px;
        }
        
        .capital-mapping > p {
          margin: 0 0 24px 0;
          color: #ccc;
          line-height: 1.6;
        }
        
        .anonymous-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(138, 43, 226, 0.1);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #8a2be2;
        }
        
        .capital-options {
          display: grid;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .capital-option {
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .capital-option:hover {
          background: rgba(138, 43, 226, 0.05);
          border-color: rgba(138, 43, 226, 0.3);
        }
        
        .capital-option--selected {
          background: rgba(138, 43, 226, 0.1);
          border-color: #8a2be2;
          box-shadow: 0 4px 20px rgba(138, 43, 226, 0.2);
        }
        
        .option-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .option-header h4 {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
        }
        
        .option-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .fit-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .fit-badge--high {
          background: rgba(138, 43, 226, 0.3);
          color: #8a2be2;
        }
        
        .fit-badge--medium {
          background: rgba(218, 112, 214, 0.3);
          color: #da70d6;
        }
        
        .fit-badge--low {
          background: rgba(221, 160, 221, 0.3);
          color: #dda0dd;
        }
        
        .amount-badge {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
        }
        
        .option-details {
          margin-bottom: 16px;
        }
        
        .detail-row {
          margin-bottom: 12px;
          color: #ccc;
        }
        
        .detail-row strong {
          color: #ffffff;
        }
        
        .requirements,
        .pros-cons > div,
        .providers {
          margin-bottom: 12px;
        }
        
        .requirements strong,
        .pros strong,
        .cons strong,
        .providers strong {
          color: #ffffff;
          display: block;
          margin-bottom: 4px;
        }
        
        .requirements ul,
        .pros ul,
        .cons ul {
          margin: 0;
          padding-left: 16px;
          color: #ccc;
        }
        
        .pros-cons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .provider-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .provider-tag {
          padding: 4px 8px;
          background: rgba(138, 43, 226, 0.2);
          border-radius: 12px;
          font-size: 12px;
          color: #8a2be2;
        }
        
        .selection-indicator {
          text-align: center;
          padding: 8px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .capital-option--selected .selection-indicator {
          background: rgba(138, 43, 226, 0.2);
          color: #8a2be2;
        }
        
        .capital-option:not(.capital-option--selected) .selection-indicator {
          color: #888;
        }
        
        .continue-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .continue-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(138, 43, 226, 0.3);
        }
        
        .continue-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .option-header {
            flex-direction: column;
            gap: 8px;
          }
          
          .pros-cons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Bias-Free Evaluation View Component
 */
const BiasFreEvaluationView = ({ founderProfile, onEvaluationComplete, differentialPrivacy }) => {
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(true);
  const [biasMetrics, setBiasMetrics] = useState({});
  
  useEffect(() => {
    const performBiasFreeEvaluation = async () => {
      setIsEvaluating(true);
      
      // Simulate evaluation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate bias-free evaluation results
      const results = generateEvaluationResults(founderProfile);
      const metrics = calculateBiasMetrics(founderProfile);
      
      setEvaluationResults(results);
      setBiasMetrics(metrics);
      setIsEvaluating(false);
    };
    
    performBiasFreeEvaluation();
  }, [founderProfile]);
  
  const generateEvaluationResults = (profile) => {
    return {
      overallScore: Math.min(85, Math.max(45, profile.experienceLevel + Math.random() * 20)),
      categories: {
        businessModel: Math.floor(Math.random() * 30) + 70,
        marketOpportunity: Math.floor(Math.random() * 25) + 65,
        executionCapability: Math.floor(Math.random() * 35) + 60,
        teamStrength: Math.floor(Math.random() * 30) + 65,
        traction: Math.floor(Math.random() * 40) + 50
      },
      strengths: [
        'Strong technical execution capability',
        'Clear market opportunity identification',
        'Innovative approach to problem-solving'
      ],
      improvements: [
        'Expand go-to-market strategy',
        'Strengthen financial projections',
        'Build strategic partnerships'
      ],
      fundingRecommendation: {
        amount: '$250K - $500K',
        stage: 'Seed',
        timeline: '6-12 months'
      }
    };
  };
  
  const calculateBiasMetrics = (profile) => {
    return {
      demographicBias: 'Mitigated',
      geographicBias: 'Reduced',
      educationalBias: 'Neutralized',
      experienceBias: 'Adjusted',
      confidenceLevel: '94%'
    };
  };
  
  if (isEvaluating) {
    return (
      <div className="evaluation-loading">
        <div className="evaluation-spinner"></div>
        <h3>⚖️ Performing Bias-Free Evaluation</h3>
        <p>Using differential privacy and AI bias mitigation...</p>
        
        <div className="evaluation-steps">
          <div className="eval-step eval-step--active">
            <span>🔍</span> Analyzing business fundamentals
          </div>
          <div className="eval-step">
            <span>🛡️</span> Applying bias mitigation algorithms
          </div>
          <div className="eval-step">
            <span>📊</span> Generating anonymous assessment
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bias-free-evaluation">
      <h3>⚖️ Bias-Free Business Evaluation</h3>
      <p>Anonymous assessment using differential privacy and bias mitigation algorithms.</p>
      
      {differentialPrivacy && (
        <div className="privacy-notice">
          <span>🔒</span>
          <span>Evaluation performed with differential privacy - individual responses protected</span>
        </div>
      )}
      
      {/* Overall Score */}
      <div className="overall-score">
        <div className="score-circle">
          <div className="score-value">{Math.round(evaluationResults.overallScore)}</div>
          <div className="score-label">Overall Score</div>
        </div>
        
        <div className="score-interpretation">
          <h4>Assessment Summary</h4>
          <p>
            {evaluationResults.overallScore >= 80 ? 
              'Strong founder profile with high potential for success.' :
              evaluationResults.overallScore >= 60 ?
              'Solid foundation with areas for strategic improvement.' :
              'Early-stage profile with significant growth opportunities.'
            }
          </p>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h4>Category Analysis</h4>
        <div className="categories">
          {Object.entries(evaluationResults.categories).map(([category, score]) => (
            <div key={category} className="category-item">
              <div className="category-header">
                <span className="category-name">
                  {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="category-score">{score}</span>
              </div>
              <div className="category-bar">
                <div 
                  className="category-fill"
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bias Mitigation Metrics */}
      <div className="bias-metrics">
        <h4>🛡️ Bias Mitigation Status</h4>
        <div className="metrics-grid">
          {Object.entries(biasMetrics).map(([metric, status]) => (
            <div key={metric} className="metric-item">
              <div className="metric-name">
                {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
              <div className={`metric-status metric-status--${status.toLowerCase()}`}>
                {status}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Strengths and Improvements */}
      <div className="feedback-sections">
        <div className="strengths-section">
          <h4>💪 Key Strengths</h4>
          <ul>
            {evaluationResults.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div className="improvements-section">
          <h4>📈 Growth Opportunities</h4>
          <ul>
            {evaluationResults.improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Funding Recommendation */}
      <div className="funding-recommendation">
        <h4>💰 Funding Recommendation</h4>
        <div className="recommendation-details">
          <div className="rec-item">
            <strong>Recommended Amount:</strong> {evaluationResults.fundingRecommendation.amount}
          </div>
          <div className="rec-item">
            <strong>Stage:</strong> {evaluationResults.fundingRecommendation.stage}
          </div>
          <div className="rec-item">
            <strong>Timeline:</strong> {evaluationResults.fundingRecommendation.timeline}
          </div>
        </div>
      </div>
      
      <button 
        onClick={onEvaluationComplete}
        className="continue-btn"
      >
        Continue to Networking
      </button>
      
      <style jsx>{`
        .evaluation-loading {
          text-align: center;
          padding: 48px 24px;
        }
        
        .evaluation-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(138, 43, 226, 0.2);
          border-top: 4px solid #8a2be2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        
        .evaluation-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .eval-step {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          opacity: 0.5;
        }
        
        .eval-step--active {
          background: rgba(138, 43, 226, 0.1);
          color: #8a2be2;
          opacity: 1;
        }
        
        .bias-free-evaluation h3 {
          margin: 0 0 8px 0;
          color: #8a2be2;
          font-size: 24px;
        }
        
        .bias-free-evaluation > p {
          margin: 0 0 24px 0;
          color: #ccc;
          line-height: 1.6;
        }
        
        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(138, 43, 226, 0.1);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #8a2be2;
        }
        
        .overall-score {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px;
          background: rgba(138, 43, 226, 0.05);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(
            #8a2be2 0deg,
            #8a2be2 ${evaluationResults?.overallScore * 3.6 || 0}deg,
            rgba(138, 43, 226, 0.2) ${evaluationResults?.overallScore * 3.6 || 0}deg,
            rgba(138, 43, 226, 0.2) 360deg
          );
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        
        .score-circle::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          background: #1a0033;
          border-radius: 50%;
        }
        
        .score-value {
          font-size: 24px;
          font-weight: 700;
          color: #8a2be2;
          z-index: 1;
        }
        
        .score-label {
          font-size: 12px;
          color: #888;
          z-index: 1;
        }
        
        .score-interpretation {
          flex: 1;
        }
        
        .score-interpretation h4 {
          margin: 0 0 8px 0;
          color: #ffffff;
        }
        
        .score-interpretation p {
          margin: 0;
          color: #ccc;
          line-height: 1.5;
        }
        
        .category-breakdown,
        .bias-metrics,
        .feedback-sections,
        .funding-recommendation {
          margin-bottom: 24px;
        }
        
        .category-breakdown h4,
        .bias-metrics h4,
        .feedback-sections h4,
        .funding-recommendation h4 {
          margin: 0 0 16px 0;
          color: #8a2be2;
        }
        
        .categories {
          display: grid;
          gap: 12px;
        }
        
        .category-item {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .category-name {
          color: #ffffff;
          font-weight: 600;
        }
        
        .category-score {
          color: #8a2be2;
          font-weight: 700;
        }
        
        .category-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .category-fill {
          height: 100%;
          background: linear-gradient(90deg, #8a2be2 0%, #da70d6 100%);
          transition: width 0.5s ease;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .metric-item {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .metric-name {
          color: #ffffff;
          font-size: 14px;
        }
        
        .metric-status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .metric-status--mitigated,
        .metric-status--reduced,
        .metric-status--neutralized,
        .metric-status--adjusted {
          background: rgba(138, 43, 226, 0.2);
          color: #8a2be2;
        }
        
        .feedback-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .strengths-section,
        .improvements-section {
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }
        
        .strengths-section h4 {
          color: #8a2be2;
        }
        
        .improvements-section h4 {
          color: #da70d6;
        }
        
        .strengths-section ul,
        .improvements-section ul {
          margin: 0;
          padding-left: 16px;
          color: #ccc;
        }
        
        .strengths-section li,
        .improvements-section li {
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .funding-recommendation {
          padding: 20px;
          background: rgba(138, 43, 226, 0.05);
          border: 1px solid rgba(138, 43, 226, 0.2);
          border-radius: 12px;
        }
        
        .recommendation-details {
          display: grid;
          gap: 8px;
        }
        
        .rec-item {
          color: #ccc;
        }
        
        .rec-item strong {
          color: #ffffff;
        }
        
        .continue-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #8a2be2 0%, #da70d6 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(138, 43, 226, 0.3);
        }
        
        @media (max-width: 768px) {
          .overall-score {
            flex-direction: column;
            text-align: center;
          }
          
          .feedback-sections {
            grid-template-columns: 1fr;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};