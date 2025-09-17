/**
 * Piper Dispatch Newsletter - Comprehensive Gamification Engine
 * 
 * Features:
 * - Referral tracking and rewards
 * - Network interconnection scoring
 * - Government/Corporate department representation tracking
 * - Birthday celebrations and special events
 * - Quiz competitions and knowledge challenges
 * - Insightful question submissions and rewards
 * - Super exclusive subscription tiers
 * - Personalized intelligence briefings
 * - Annual bonus issues (20k words)
 * - Regular bi-weekly issues (10k words)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Gamification Core Engine
class GamificationEngine {
    constructor() {
        this.achievements = new Map();
        this.leaderboards = new Map();
        this.rewards = new Map();
        this.subscriptionTiers = new Map();
        this.personalizedContent = new Map();
        this.initializeRewardSystem();
        this.initializeSubscriptionTiers();
    }

    initializeRewardSystem() {
        // Referral Rewards
        this.rewards.set('referral_bronze', {
            threshold: 5,
            title: 'Network Builder',
            description: 'Referred 5 new subscribers',
            prize: 'Exclusive Piper Dispatch branded notebook',
            points: 100,
            badge: '🏆'
        });

        this.rewards.set('referral_silver', {
            threshold: 25,
            title: 'Connection Catalyst',
            description: 'Referred 25 new subscribers',
            prize: 'Private quarterly briefing call with Piper team',
            points: 500,
            badge: '🥈'
        });

        this.rewards.set('referral_gold', {
            threshold: 100,
            title: 'Network Architect',
            description: 'Referred 100+ new subscribers',
            prize: 'Annual VIP dinner with Piper editorial team',
            points: 2000,
            badge: '🥇'
        });

        // Network Interconnection Rewards
        this.rewards.set('network_connector', {
            threshold: 50,
            title: 'Web Weaver',
            description: 'Connected 50+ professionals across sectors',
            prize: 'Custom intelligence report on your industry',
            points: 300,
            badge: '🕸️'
        });

        // Government/Corporate Department Representation
        this.rewards.set('dept_diversity_champion', {
            threshold: 10,
            title: 'Diversity Champion',
            description: 'Represents 10+ different departments/sectors',
            prize: 'Exclusive policy briefing document',
            points: 400,
            badge: '🏛️'
        });

        // Quiz and Knowledge Rewards
        this.rewards.set('quiz_master', {
            threshold: 20,
            title: 'Intelligence Analyst',
            description: 'Scored 90%+ on 20 weekly quizzes',
            prize: 'Signed copy of annual intelligence report',
            points: 250,
            badge: '🧠'
        });

        // Insightful Questions
        this.rewards.set('question_sage', {
            threshold: 5,
            title: 'Strategic Thinker',
            description: 'Submitted 5 featured questions',
            prize: 'Personal consultation with Piper analyst',
            points: 350,
            badge: '💡'
        });

        // Birthday and Special Events
        this.rewards.set('birthday_vip', {
            threshold: 1,
            title: 'Birthday VIP',
            description: 'Celebrating another year of intelligence',
            prize: 'Personalized birthday intelligence brief',
            points: 50,
            badge: '🎂'
        });
    }

    initializeSubscriptionTiers() {
        this.subscriptionTiers.set('standard', {
            name: 'Standard Intelligence',
            price: 0,
            features: [
                'Bi-weekly 10k word newsletter',
                'Basic market intelligence',
                'Community access',
                'Weekly quiz participation'
            ],
            wordCount: 10000,
            frequency: 'bi-weekly',
            personalization: 'basic'
        });

        this.subscriptionTiers.set('premium', {
            name: 'Premium Intelligence',
            price: 99,
            features: [
                'All Standard features',
                'Priority content delivery',
                'Advanced analytics dashboard',
                'Monthly exclusive briefings',
                'Direct analyst access'
            ],
            wordCount: 12000,
            frequency: 'bi-weekly',
            personalization: 'enhanced'
        });

        this.subscriptionTiers.set('executive', {
            name: 'Executive Intelligence',
            price: 299,
            features: [
                'All Premium features',
                'Weekly personalized briefings',
                'Custom intelligence requests',
                'Quarterly strategy sessions',
                'Network introduction service'
            ],
            wordCount: 15000,
            frequency: 'weekly',
            personalization: 'advanced'
        });

        this.subscriptionTiers.set('ultra_exclusive', {
            name: 'Ultra Exclusive Intelligence',
            price: 999,
            features: [
                'All Executive features',
                'Daily personalized intelligence briefings',
                'Real-time alerts on your interests',
                'Personal intelligence analyst',
                'Exclusive annual 20k word bonus issue',
                'Private intelligence network access',
                'Custom research projects',
                'Direct line to editorial team'
            ],
            wordCount: 20000,
            frequency: 'daily',
            personalization: 'ultra_personalized',
            exclusiveFeatures: [
                'Life-specific intelligence',
                'Connection-based insights',
                'Work-focused briefings',
                'Personal opportunity alerts'
            ]
        });
    }

    calculateUserScore(userData) {
        const scores = {
            referrals: userData.referralCount * 10,
            networkConnections: userData.networkSize * 5,
            deptRepresentation: userData.departmentCount * 20,
            quizPerformance: userData.quizAverage * userData.quizCount,
            questionQuality: userData.featuredQuestions * 50,
            engagement: userData.engagementScore,
            tenure: this.calculateTenureBonus(userData.joinDate)
        };

        return Object.values(scores).reduce((total, score) => total + score, 0);
    }

    calculateTenureBonus(joinDate) {
        const monthsActive = Math.floor((Date.now() - new Date(joinDate)) / (1000 * 60 * 60 * 24 * 30));
        return monthsActive * 5; // 5 points per month
    }

    checkAchievements(userData) {
        const newAchievements = [];
        
        this.rewards.forEach((reward, key) => {
            if (!userData.achievements?.includes(key)) {
                const qualified = this.checkRewardQualification(key, userData, reward);
                if (qualified) {
                    newAchievements.push({ key, ...reward });
                }
            }
        });

        return newAchievements;
    }

    checkRewardQualification(rewardKey, userData, reward) {
        switch (rewardKey) {
            case 'referral_bronze':
            case 'referral_silver':
            case 'referral_gold':
                return userData.referralCount >= reward.threshold;
            
            case 'network_connector':
                return userData.networkSize >= reward.threshold;
            
            case 'dept_diversity_champion':
                return userData.departmentCount >= reward.threshold;
            
            case 'quiz_master':
                return userData.quizCount >= reward.threshold && userData.quizAverage >= 90;
            
            case 'question_sage':
                return userData.featuredQuestions >= reward.threshold;
            
            case 'birthday_vip':
                return this.isBirthdayMonth(userData.birthday);
            
            default:
                return false;
        }
    }

    isBirthdayMonth(birthday) {
        if (!birthday) return false;
        const birthMonth = new Date(birthday).getMonth();
        const currentMonth = new Date().getMonth();
        return birthMonth === currentMonth;
    }

    generatePersonalizedContent(userData, subscriptionTier) {
        const tier = this.subscriptionTiers.get(subscriptionTier);
        if (!tier) return null;

        const baseContent = {
            wordCount: tier.wordCount,
            frequency: tier.frequency,
            personalizationLevel: tier.personalization
        };

        if (subscriptionTier === 'ultra_exclusive') {
            return {
                ...baseContent,
                personalizedSections: [
                    this.generateLifeSpecificIntelligence(userData),
                    this.generateConnectionInsights(userData),
                    this.generateWorkFocusedBriefings(userData),
                    this.generateOpportunityAlerts(userData)
                ],
                exclusiveFeatures: tier.exclusiveFeatures
            };
        }

        return baseContent;
    }

    generateLifeSpecificIntelligence(userData) {
        return {
            title: 'Personal Intelligence Brief',
            content: `Tailored intelligence based on your location: ${userData.location}, interests: ${userData.interests?.join(', ')}, and recent activities.`,
            relevanceScore: 95,
            confidenceLevel: 'High'
        };
    }

    generateConnectionInsights(userData) {
        return {
            title: 'Network Intelligence',
            content: `Analysis of your professional network movements, new connections in ${userData.industry}, and strategic relationship opportunities.`,
            relevanceScore: 90,
            confidenceLevel: 'High'
        };
    }

    generateWorkFocusedBriefings(userData) {
        return {
            title: 'Professional Intelligence',
            content: `Industry-specific intelligence for ${userData.jobTitle} in ${userData.company}, including competitive landscape and strategic opportunities.`,
            relevanceScore: 88,
            confidenceLevel: 'Medium-High'
        };
    }

    generateOpportunityAlerts(userData) {
        return {
            title: 'Opportunity Intelligence',
            content: `Real-time alerts on career opportunities, investment possibilities, and strategic partnerships relevant to your profile.`,
            relevanceScore: 85,
            confidenceLevel: 'Medium'
        };
    }

    getLeaderboard(category = 'overall') {
        // Mock leaderboard data - would be fetched from backend
        return {
            category,
            updated: new Date().toISOString(),
            leaders: [
                { rank: 1, name: 'Sarah Chen', score: 2850, badge: '👑' },
                { rank: 2, name: 'Marcus Johnson', score: 2720, badge: '🥈' },
                { rank: 3, name: 'Elena Rodriguez', score: 2650, badge: '🥉' },
                { rank: 4, name: 'David Kim', score: 2580, badge: '🏆' },
                { rank: 5, name: 'Amara Okafor', score: 2510, badge: '⭐' }
            ]
        };
    }
}

// Gamification Dashboard Component
const GamificationDashboard = ({ userData, onAchievementUnlock }) => {
    const [engine] = useState(() => new GamificationEngine());
    const [userScore, setUserScore] = useState(0);
    const [achievements, setAchievements] = useState([]);
    const [leaderboard, setLeaderboard] = useState(null);
    const [personalizedContent, setPersonalizedContent] = useState(null);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [newAchievement, setNewAchievement] = useState(null);

    // Calculate user score and check achievements
    useEffect(() => {
        const score = engine.calculateUserScore(userData);
        setUserScore(score);

        const newAchievements = engine.checkAchievements(userData);
        if (newAchievements.length > 0) {
            setNewAchievement(newAchievements[0]);
            setShowAchievementModal(true);
            onAchievementUnlock?.(newAchievements[0]);
        }

        setAchievements(userData.achievements || []);
    }, [userData, engine, onAchievementUnlock]);

    // Load leaderboard
    useEffect(() => {
        const leaderboardData = engine.getLeaderboard('overall');
        setLeaderboard(leaderboardData);
    }, [engine]);

    // Generate personalized content
    useEffect(() => {
        const content = engine.generatePersonalizedContent(
            userData, 
            userData.subscriptionTier || 'standard'
        );
        setPersonalizedContent(content);
    }, [userData, engine]);

    const handleAchievementModalClose = () => {
        setShowAchievementModal(false);
        setNewAchievement(null);
    };

    return (
        <div className="gamification-dashboard">
            {/* User Score and Level */}
            <motion.div 
                className="user-score-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="score-display">
                    <h3>Intelligence Score</h3>
                    <motion.div 
                        className="score-number"
                        key={userScore}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {userScore.toLocaleString()}
                    </motion.div>
                </div>
                
                <div className="user-stats">
                    <div className="stat">
                        <span className="label">Referrals</span>
                        <span className="value">{userData.referralCount || 0}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Network Size</span>
                        <span className="value">{userData.networkSize || 0}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Departments</span>
                        <span className="value">{userData.departmentCount || 0}</span>
                    </div>
                </div>
            </motion.div>

            {/* Achievements */}
            <motion.div 
                className="achievements-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h3>Achievements</h3>
                <div className="achievements-grid">
                    {Array.from(engine.rewards.entries()).map(([key, reward]) => {
                        const isUnlocked = achievements.includes(key);
                        return (
                            <motion.div
                                key={key}
                                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="achievement-badge">{reward.badge}</div>
                                <div className="achievement-title">{reward.title}</div>
                                <div className="achievement-description">{reward.description}</div>
                                {isUnlocked && (
                                    <div className="achievement-prize">
                                        Prize: {reward.prize}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Leaderboard */}
            {leaderboard && (
                <motion.div 
                    className="leaderboard-section"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h3>Intelligence Leaders</h3>
                    <div className="leaderboard">
                        {leaderboard.leaders.map((leader) => (
                            <motion.div
                                key={leader.rank}
                                className="leader-row"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: leader.rank * 0.1 }}
                            >
                                <span className="rank">#{leader.rank}</span>
                                <span className="badge">{leader.badge}</span>
                                <span className="name">{leader.name}</span>
                                <span className="score">{leader.score.toLocaleString()}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Subscription Tier Info */}
            <motion.div 
                className="subscription-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <h3>Your Intelligence Tier</h3>
                <div className="tier-card">
                    <div className="tier-name">
                        {engine.subscriptionTiers.get(userData.subscriptionTier || 'standard')?.name}
                    </div>
                    {personalizedContent && (
                        <div className="personalization-info">
                            <div>Word Count: {personalizedContent.wordCount.toLocaleString()}</div>
                            <div>Frequency: {personalizedContent.frequency}</div>
                            <div>Personalization: {personalizedContent.personalizationLevel}</div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Achievement Unlock Modal */}
            <AnimatePresence>
                {showAchievementModal && newAchievement && (
                    <motion.div
                        className="achievement-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleAchievementModalClose}
                    >
                        <motion.div
                            className="achievement-modal"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content">
                                <div className="achievement-celebration">
                                    <div className="celebration-badge">{newAchievement.badge}</div>
                                    <h2>Achievement Unlocked!</h2>
                                    <h3>{newAchievement.title}</h3>
                                    <p>{newAchievement.description}</p>
                                    <div className="prize-info">
                                        <strong>Your Prize:</strong> {newAchievement.prize}
                                    </div>
                                    <div className="points-earned">
                                        +{newAchievement.points} Intelligence Points
                                    </div>
                                </div>
                                <button 
                                    className="close-modal"
                                    onClick={handleAchievementModalClose}
                                >
                                    Claim Reward
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GamificationDashboard;
export { GamificationEngine };