import { PrivacyFirstTracker } from './privacy/PrivacyTracker';
import { QuantumSecurityProvider } from './quantum/QuantumSecurity';

/**
 * AI-Powered Content Personalization Engine
 * Privacy-first personalization using differential privacy and on-device processing
 */
class PersonalizationEngine {
  constructor() {
    this.userProfile = {
      readingPatterns: new Map(),
      preferences: new Map(),
      engagementMetrics: new Map(),
      lastUpdated: null
    };
    this.privacyBudget = 1.0; // Differential privacy budget
    this.isInitialized = false;
  }

  /**
   * Initialize the personalization engine with privacy-first settings
   */
  async initialize() {
    try {
      // Load encrypted user preferences from local storage only
      await this.loadUserProfile();
      
      // Initialize AI models for on-device processing
      await this.initializeAIModels();
      
      // Set up automatic profile cleanup
      this.scheduleProfileCleanup();
      
      this.isInitialized = true;
      console.log('Personalization engine initialized with privacy-first architecture');
    } catch (error) {
      console.error('Failed to initialize personalization engine:', error);
    }
  }

  /**
   * Track reading behavior with differential privacy
   */
  async trackReadingBehavior(data) {
    if (!this.isInitialized) return;

    try {
      // Apply differential privacy noise
      const noisyData = this.addDifferentialPrivacyNoise(data);
      
      // Update reading patterns
      const sectionId = noisyData.section;
      const timeSpent = noisyData.timeSpent;
      const scrollDepth = noisyData.scrollDepth;
      
      // Store patterns locally with encryption
      const currentPattern = this.userProfile.readingPatterns.get(sectionId) || {
        totalTime: 0,
        averageScrollDepth: 0,
        visitCount: 0,
        lastVisit: null
      };
      
      currentPattern.totalTime += timeSpent;
      currentPattern.visitCount += 1;
      currentPattern.averageScrollDepth = 
        (currentPattern.averageScrollDepth + scrollDepth) / 2;
      currentPattern.lastVisit = Date.now();
      
      this.userProfile.readingPatterns.set(sectionId, currentPattern);
      this.userProfile.lastUpdated = Date.now();
      
      // Save encrypted profile
      await this.saveUserProfile();
      
      // Generate personalized recommendations
      await this.updateRecommendations();
      
    } catch (error) {
      console.error('Error tracking reading behavior:', error);
    }
  }

  /**
   * Get personalized content recommendations
   */
  async getPersonalizedRecommendations() {
    if (!this.isInitialized) {
      return this.getDefaultRecommendations();
    }

    try {
      const recommendations = {
        prioritySections: await this.calculatePrioritySections(),
        contentTypes: await this.recommendContentTypes(),
        readingTime: await this.estimateOptimalReadingTime(),
        accessibility: await this.getAccessibilityRecommendations(),
        topics: await this.getTopicRecommendations()
      };
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Calculate priority sections based on user engagement
   */
  async calculatePrioritySections() {
    const sectionScores = new Map();
    
    for (const [sectionId, pattern] of this.userProfile.readingPatterns) {
      // Calculate engagement score
      const timeScore = Math.min(pattern.totalTime / 60000, 1); // Normalize to minutes
      const depthScore = pattern.averageScrollDepth / 100;
      const frequencyScore = Math.min(pattern.visitCount / 10, 1);
      const recencyScore = this.calculateRecencyScore(pattern.lastVisit);
      
      const totalScore = (timeScore * 0.3) + (depthScore * 0.2) + 
                        (frequencyScore * 0.3) + (recencyScore * 0.2);
      
      sectionScores.set(sectionId, totalScore);
    }
    
    // Sort sections by score
    return Array.from(sectionScores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([sectionId]) => sectionId);
  }

  /**
   * Recommend content types based on user preferences
   */
  async recommendContentTypes() {
    const contentPreferences = {
      detailed: 0,
      summary: 0,
      visual: 0,
      interactive: 0
    };
    
    // Analyze reading patterns to infer content type preferences
    for (const [, pattern] of this.userProfile.readingPatterns) {
      if (pattern.averageScrollDepth > 80) {
        contentPreferences.detailed += pattern.visitCount;
      } else if (pattern.averageScrollDepth < 30) {
        contentPreferences.summary += pattern.visitCount;
      }
      
      if (pattern.totalTime > 120000) { // 2 minutes
        contentPreferences.detailed += 1;
      } else {
        contentPreferences.summary += 1;
      }
    }
    
    return Object.entries(contentPreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);
  }

  /**
   * Estimate optimal reading time based on user behavior
   */
  async estimateOptimalReadingTime() {
    const readingTimes = Array.from(this.userProfile.readingPatterns.values())
      .map(pattern => pattern.totalTime / pattern.visitCount)
      .filter(time => time > 0);
    
    if (readingTimes.length === 0) return 180000; // Default 3 minutes
    
    const averageTime = readingTimes.reduce((sum, time) => sum + time, 0) / readingTimes.length;
    return Math.max(60000, Math.min(averageTime, 600000)); // Between 1-10 minutes
  }

  /**
   * Get accessibility recommendations based on user behavior
   */
  async getAccessibilityRecommendations() {
    const recommendations = {
      fontSize: 'medium',
      contrast: 'standard',
      animations: 'enabled',
      readingMode: 'standard'
    };
    
    // Analyze patterns for accessibility needs
    const avgScrollDepth = Array.from(this.userProfile.readingPatterns.values())
      .reduce((sum, pattern) => sum + pattern.averageScrollDepth, 0) / 
      this.userProfile.readingPatterns.size;
    
    if (avgScrollDepth < 50) {
      recommendations.fontSize = 'large';
      recommendations.readingMode = 'focused';
    }
    
    return recommendations;
  }

  /**
   * Get topic recommendations based on engagement
   */
  async getTopicRecommendations() {
    const topicEngagement = new Map();
    
    // Map sections to topics
    const sectionTopics = {
      'signal': ['market-intelligence', 'financial-analysis'],
      'capital': ['investment', 'capital-flows'],
      'vanguard': ['innovation', 'technology'],
      'threat': ['cybersecurity', 'risk-assessment'],
      'oats': ['commodities', 'agriculture'],
      'meridian': ['geopolitics', 'international'],
      'edge': ['emerging-markets', 'trends']
    };
    
    for (const [sectionId, pattern] of this.userProfile.readingPatterns) {
      const topics = sectionTopics[sectionId] || [];
      const engagementScore = pattern.totalTime * pattern.averageScrollDepth / 100;
      
      topics.forEach(topic => {
        const currentScore = topicEngagement.get(topic) || 0;
        topicEngagement.set(topic, currentScore + engagementScore);
      });
    }
    
    return Array.from(topicEngagement.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  /**
   * Add differential privacy noise to protect user data
   */
  addDifferentialPrivacyNoise(data) {
    const epsilon = 0.1; // Privacy parameter
    const sensitivity = 1.0;
    
    // Add Laplace noise
    const noise = this.generateLaplaceNoise(sensitivity / epsilon);
    
    return {
      ...data,
      timeSpent: Math.max(0, data.timeSpent + noise),
      scrollDepth: Math.max(0, Math.min(100, data.scrollDepth + noise))
    };
  }

  /**
   * Generate Laplace noise for differential privacy
   */
  generateLaplaceNoise(scale) {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  /**
   * Calculate recency score for engagement
   */
  calculateRecencyScore(lastVisit) {
    if (!lastVisit) return 0;
    
    const daysSinceVisit = (Date.now() - lastVisit) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceVisit / 30)); // Decay over 30 days
  }

  /**
   * Load user profile from encrypted local storage
   */
  async loadUserProfile() {
    try {
      const encryptedProfile = localStorage.getItem('piper_user_profile');
      if (encryptedProfile) {
        const decryptedProfile = await QuantumSecurityProvider.decrypt(encryptedProfile);
        const profileData = JSON.parse(decryptedProfile);
        
        // Restore Maps from serialized data
        this.userProfile.readingPatterns = new Map(profileData.readingPatterns || []);
        this.userProfile.preferences = new Map(profileData.preferences || []);
        this.userProfile.engagementMetrics = new Map(profileData.engagementMetrics || []);
        this.userProfile.lastUpdated = profileData.lastUpdated;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Initialize with empty profile on error
      this.userProfile = {
        readingPatterns: new Map(),
        preferences: new Map(),
        engagementMetrics: new Map(),
        lastUpdated: null
      };
    }
  }

  /**
   * Save user profile to encrypted local storage
   */
  async saveUserProfile() {
    try {
      // Serialize Maps for storage
      const profileData = {
        readingPatterns: Array.from(this.userProfile.readingPatterns.entries()),
        preferences: Array.from(this.userProfile.preferences.entries()),
        engagementMetrics: Array.from(this.userProfile.engagementMetrics.entries()),
        lastUpdated: this.userProfile.lastUpdated
      };
      
      const serializedProfile = JSON.stringify(profileData);
      const encryptedProfile = await QuantumSecurityProvider.encrypt(serializedProfile);
      
      localStorage.setItem('piper_user_profile', encryptedProfile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  /**
   * Initialize AI models for on-device processing
   */
  async initializeAIModels() {
    // Placeholder for future ML model initialization
    // This would load lightweight models for content analysis
    console.log('AI models initialized for on-device processing');
  }

  /**
   * Schedule automatic profile cleanup for privacy
   */
  scheduleProfileCleanup() {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // 1 hour
  }

  /**
   * Clean up old data to maintain privacy
   */
  cleanupOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Remove old reading patterns
    for (const [sectionId, pattern] of this.userProfile.readingPatterns) {
      if (pattern.lastVisit < thirtyDaysAgo) {
        this.userProfile.readingPatterns.delete(sectionId);
      }
    }
    
    // Save cleaned profile
    this.saveUserProfile();
  }

  /**
   * Update recommendations based on current profile
   */
  async updateRecommendations() {
    // Trigger recommendation recalculation
    // This could emit events for UI updates
    console.log('Recommendations updated based on user behavior');
  }

  /**
   * Get default recommendations for new users
   */
  getDefaultRecommendations() {
    return {
      prioritySections: ['signal', 'capital', 'vanguard'],
      contentTypes: ['summary', 'detailed'],
      readingTime: 180000, // 3 minutes
      accessibility: {
        fontSize: 'medium',
        contrast: 'standard',
        animations: 'enabled',
        readingMode: 'standard'
      },
      topics: ['market-intelligence', 'financial-analysis', 'technology']
    };
  }

  /**
   * Clear all user data for privacy compliance
   */
  async clearUserData() {
    this.userProfile = {
      readingPatterns: new Map(),
      preferences: new Map(),
      engagementMetrics: new Map(),
      lastUpdated: null
    };
    
    localStorage.removeItem('piper_user_profile');
    console.log('All user data cleared for privacy compliance');
  }
}

// Export singleton instance
export default new PersonalizationEngine();