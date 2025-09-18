import React, { useState, useEffect, useRef } from 'react';
import PersonalizationEngine from '../services/PersonalizationEngine';
import './styles/personalized-content.css';

const PersonalizedContent = ({ neurodiversityMode, privacyToken }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEngagement, setUserEngagement] = useState({
    startTime: Date.now(),
    scrollDepth: 0,
    interactions: 0
  });
  const contentRef = useRef(null);
  const observerRef = useRef(null);

  // Initialize personalization engine and load recommendations
  useEffect(() => {
    const initializePersonalization = async () => {
      try {
        await PersonalizationEngine.initialize();
        const personalizedRecs = await PersonalizationEngine.getPersonalizedRecommendations();
        setRecommendations(personalizedRecs);
      } catch (error) {
        console.error('Failed to initialize personalization:', error);
        // Use default recommendations on error
        setRecommendations(PersonalizationEngine.getDefaultRecommendations());
      } finally {
        setIsLoading(false);
      }
    };

    initializePersonalization();
  }, []);

  // Track scroll depth for personalization
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const scrollDepth = Math.min(100, (scrollTop / scrollHeight) * 100);
        
        setUserEngagement(prev => ({
          ...prev,
          scrollDepth: Math.max(prev.scrollDepth, scrollDepth)
        }));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track user interactions
  const trackInteraction = (type, data = {}) => {
    setUserEngagement(prev => ({
      ...prev,
      interactions: prev.interactions + 1
    }));

    // Send interaction data to personalization engine
    PersonalizationEngine.trackReadingBehavior({
      section: 'personalized-content',
      interactionType: type,
      timeSpent: Date.now() - userEngagement.startTime,
      scrollDepth: userEngagement.scrollDepth,
      ...data
    });
  };

  // Send engagement data when component unmounts
  useEffect(() => {
    return () => {
      PersonalizationEngine.trackReadingBehavior({
        section: 'personalized-content',
        timeSpent: Date.now() - userEngagement.startTime,
        scrollDepth: userEngagement.scrollDepth,
        interactions: userEngagement.interactions
      });
    };
  }, [userEngagement]);

  const renderPrioritySections = () => {
    if (!recommendations?.prioritySections) return null;

    const sectionInfo = {
      'signal': { title: 'The Signal', icon: '📡', description: 'Market intelligence and financial analysis' },
      'capital': { title: 'Capital Flows & Pied', icon: '💰', description: 'Investment flows and capital markets' },
      'vanguard': { title: 'The Vanguard', icon: '🚀', description: 'Innovation and emerging technologies' },
      'threat': { title: 'Threat Intelligence', icon: '🛡️', description: 'Cybersecurity and risk assessment' },
      'oats': { title: 'Oats Section', icon: '🌾', description: 'Commodities and agricultural markets' },
      'meridian': { title: 'Eastern Meridian', icon: '🧭', description: 'Geopolitical analysis and international affairs' },
      'edge': { title: 'On the Edge', icon: '⚡', description: 'Emerging markets and cutting-edge trends' }
    };

    return (
      <div className="priority-sections">
        <h3>📊 Your Priority Sections</h3>
        <div className="sections-grid">
          {recommendations.prioritySections.map(sectionId => {
            const section = sectionInfo[sectionId];
            if (!section) return null;
            
            return (
              <div 
                key={sectionId} 
                className="priority-section-card"
                onClick={() => trackInteraction('section-click', { sectionId })}
              >
                <div className="section-icon">{section.icon}</div>
                <div className="section-info">
                  <h4>{section.title}</h4>
                  <p>{section.description}</p>
                </div>
                <div className="section-priority">High Priority</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContentTypeRecommendations = () => {
    if (!recommendations?.contentTypes) return null;

    const contentTypeInfo = {
      'detailed': { icon: '📖', title: 'Detailed Analysis', description: 'In-depth articles and comprehensive reports' },
      'summary': { icon: '⚡', title: 'Quick Summaries', description: 'Concise overviews and key highlights' },
      'visual': { icon: '📊', title: 'Visual Content', description: 'Charts, graphs, and infographics' },
      'interactive': { icon: '🎯', title: 'Interactive Features', description: 'Polls, quizzes, and dynamic content' }
    };

    return (
      <div className="content-type-recommendations">
        <h3>🎯 Recommended Content Types</h3>
        <div className="content-types-grid">
          {recommendations.contentTypes.map(type => {
            const contentType = contentTypeInfo[type];
            if (!contentType) return null;
            
            return (
              <div 
                key={type} 
                className="content-type-card"
                onClick={() => trackInteraction('content-type-click', { type })}
              >
                <div className="content-type-icon">{contentType.icon}</div>
                <div className="content-type-info">
                  <h4>{contentType.title}</h4>
                  <p>{contentType.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReadingTimeEstimate = () => {
    if (!recommendations?.readingTime) return null;

    const minutes = Math.round(recommendations.readingTime / 60000);
    
    return (
      <div className="reading-time-estimate">
        <h3>⏱️ Optimal Reading Time</h3>
        <div className="time-card">
          <div className="time-value">{minutes} min</div>
          <p>Based on your reading patterns, this is your optimal session length</p>
          <div className="time-tips">
            <span className="tip">💡 Take breaks every {Math.max(5, Math.floor(minutes/3))} minutes</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAccessibilityRecommendations = () => {
    if (!recommendations?.accessibility) return null;

    const { fontSize, contrast, animations, readingMode } = recommendations.accessibility;
    
    return (
      <div className="accessibility-recommendations">
        <h3>♿ Accessibility Settings</h3>
        <div className="accessibility-grid">
          <div className="accessibility-setting">
            <span className="setting-icon">🔤</span>
            <div className="setting-info">
              <h4>Font Size</h4>
              <p>Recommended: {fontSize}</p>
            </div>
          </div>
          <div className="accessibility-setting">
            <span className="setting-icon">🌓</span>
            <div className="setting-info">
              <h4>Contrast</h4>
              <p>Recommended: {contrast}</p>
            </div>
          </div>
          <div className="accessibility-setting">
            <span className="setting-icon">🎬</span>
            <div className="setting-info">
              <h4>Animations</h4>
              <p>Status: {animations}</p>
            </div>
          </div>
          <div className="accessibility-setting">
            <span className="setting-icon">📖</span>
            <div className="setting-info">
              <h4>Reading Mode</h4>
              <p>Mode: {readingMode}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopicRecommendations = () => {
    if (!recommendations?.topics) return null;

    const topicInfo = {
      'market-intelligence': { icon: '📈', title: 'Market Intelligence' },
      'financial-analysis': { icon: '💹', title: 'Financial Analysis' },
      'investment': { icon: '💰', title: 'Investment Strategies' },
      'capital-flows': { icon: '🌊', title: 'Capital Flows' },
      'innovation': { icon: '💡', title: 'Innovation' },
      'technology': { icon: '🔬', title: 'Technology' },
      'cybersecurity': { icon: '🔒', title: 'Cybersecurity' },
      'risk-assessment': { icon: '⚠️', title: 'Risk Assessment' },
      'commodities': { icon: '🌾', title: 'Commodities' },
      'agriculture': { icon: '🚜', title: 'Agriculture' },
      'geopolitics': { icon: '🌍', title: 'Geopolitics' },
      'international': { icon: '🌐', title: 'International Affairs' },
      'emerging-markets': { icon: '🚀', title: 'Emerging Markets' },
      'trends': { icon: '📊', title: 'Market Trends' }
    };

    return (
      <div className="topic-recommendations">
        <h3>🏷️ Your Interest Topics</h3>
        <div className="topics-container">
          {recommendations.topics.map(topic => {
            const topicData = topicInfo[topic];
            if (!topicData) return null;
            
            return (
              <div 
                key={topic} 
                className="topic-tag"
                onClick={() => trackInteraction('topic-click', { topic })}
              >
                <span className="topic-icon">{topicData.icon}</span>
                <span className="topic-title">{topicData.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPrivacyInfo = () => {
    return (
      <div className="privacy-info">
        <h3>🔒 Privacy-First Personalization</h3>
        <div className="privacy-features">
          <div className="privacy-feature">
            <span className="feature-icon">🏠</span>
            <span className="feature-text">All processing happens on your device</span>
          </div>
          <div className="privacy-feature">
            <span className="feature-icon">🔐</span>
            <span className="feature-text">Data encrypted with quantum-resistant algorithms</span>
          </div>
          <div className="privacy-feature">
            <span className="feature-icon">⏰</span>
            <span className="feature-text">Automatic data cleanup after 30 days</span>
          </div>
          <div className="privacy-feature">
            <span className="feature-icon">🎭</span>
            <span className="feature-text">Differential privacy protects your identity</span>
          </div>
        </div>
        <button 
          className="clear-data-button"
          onClick={() => {
            PersonalizationEngine.clearUserData();
            trackInteraction('privacy-clear');
            window.location.reload();
          }}
        >
          Clear All Personal Data
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="personalized-content-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your reading patterns...</p>
      </div>
    );
  }

  return (
    <div 
      ref={contentRef}
      className={`personalized-content ${neurodiversityMode}-mode`}
    >
      <div className="personalized-header">
        <h2>🎯 Your Personalized Experience</h2>
        <p>Content tailored to your reading patterns with complete privacy protection</p>
      </div>

      <div className="personalization-grid">
        {renderPrioritySections()}
        {renderContentTypeRecommendations()}
        {renderReadingTimeEstimate()}
        {renderAccessibilityRecommendations()}
        {renderTopicRecommendations()}
        {renderPrivacyInfo()}
      </div>

      <div className="personalization-stats">
        <div className="stat-item">
          <span className="stat-icon">👁️</span>
          <span className="stat-text">Current scroll depth: {Math.round(userEngagement.scrollDepth)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🖱️</span>
          <span className="stat-text">Interactions: {userEngagement.interactions}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏱️</span>
          <span className="stat-text">Session time: {Math.round((Date.now() - userEngagement.startTime) / 1000)}s</span>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedContent;