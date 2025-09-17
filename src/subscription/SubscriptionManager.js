/**
 * Piper Dispatch Newsletter - Subscription Management System
 * 
 * Features:
 * - Multi-tier subscription management
 * - Ultra-exclusive personalized service
 * - Gamification integration
 * - Billing and payment processing
 * - Content access control
 * - Analytics and reporting
 * - Automated tier upgrades
 * - Personalization preferences
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Subscription Tiers Configuration
const SUBSCRIPTION_TIERS = {
    free: {
        id: 'free',
        name: 'Community Access',
        price: 0,
        billingCycle: 'monthly',
        features: [
            'Basic newsletter access',
            'Community discussions',
            'Limited gamification features',
            'Standard content (5k words bi-weekly)'
        ],
        limits: {
            wordCount: 5000,
            frequency: 'bi-weekly',
            personalization: 'none',
            networkAccess: 'basic',
            gamificationLevel: 1
        },
        color: '#64748b',
        gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
    },
    standard: {
        id: 'standard',
        name: 'Professional Reader',
        price: 29,
        billingCycle: 'monthly',
        features: [
            'Full newsletter access (10k words bi-weekly)',
            'Basic personalization',
            'Gamification participation',
            'Network insights',
            'Archive access'
        ],
        limits: {
            wordCount: 10000,
            frequency: 'bi-weekly',
            personalization: 'basic',
            networkAccess: 'standard',
            gamificationLevel: 3
        },
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    premium: {
        id: 'premium',
        name: 'Strategic Intelligence',
        price: 99,
        billingCycle: 'monthly',
        features: [
            'Enhanced newsletter (12k words bi-weekly)',
            'Advanced personalization',
            'Full gamification access',
            'Network intelligence reports',
            'Quarterly strategy sessions',
            'Priority support'
        ],
        limits: {
            wordCount: 12000,
            frequency: 'bi-weekly',
            personalization: 'enhanced',
            networkAccess: 'premium',
            gamificationLevel: 5
        },
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    executive: {
        id: 'executive',
        name: 'Executive Intelligence',
        price: 299,
        billingCycle: 'monthly',
        features: [
            'Executive newsletter (15k words bi-weekly)',
            'Advanced AI personalization',
            'Executive gamification tier',
            'Comprehensive network analysis',
            'Monthly strategy consultations',
            'Direct analyst access',
            'Custom research requests'
        ],
        limits: {
            wordCount: 15000,
            frequency: 'bi-weekly',
            personalization: 'advanced',
            networkAccess: 'executive',
            gamificationLevel: 7
        },
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    ultra_exclusive: {
        id: 'ultra_exclusive',
        name: 'Ultra-Exclusive Intelligence',
        price: 999,
        billingCycle: 'monthly',
        features: [
            'Bespoke intelligence briefings (20k words bi-weekly)',
            'Ultra-personalized content generation',
            'Exclusive gamification rewards',
            'Real-time intelligence alerts',
            'Weekly strategy sessions',
            'Dedicated intelligence analyst',
            'Custom research team',
            'Annual bonus issue (30k words)',
            'Life-specific intelligence',
            'Connection-based insights',
            'Work-focused strategic briefings'
        ],
        limits: {
            wordCount: 20000,
            frequency: 'bi-weekly',
            personalization: 'bespoke',
            networkAccess: 'unlimited',
            gamificationLevel: 10,
            annualBonus: true,
            annualBonusWordCount: 30000
        },
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        exclusive: true
    }
};

// Subscription Management Engine
class SubscriptionEngine {
    constructor() {
        this.subscribers = new Map();
        this.billingHistory = new Map();
        this.usageTracking = new Map();
        this.personalizationProfiles = new Map();
        this.initializeEngine();
    }

    initializeEngine() {
        // Load existing subscriptions
        this.loadSubscriptions();
        
        // Initialize billing processor
        this.initializeBillingProcessor();
        
        // Setup usage tracking
        this.initializeUsageTracking();
        
        // Initialize personalization engine
        this.initializePersonalizationEngine();
    }

    loadSubscriptions() {
        // Simulate loading from database
        const mockSubscriptions = [
            {
                userId: 'user_001',
                tier: 'executive',
                status: 'active',
                startDate: '2024-01-01',
                nextBilling: '2024-02-01',
                gamificationScore: 1250,
                personalizationLevel: 'advanced'
            },
            {
                userId: 'user_002',
                tier: 'ultra_exclusive',
                status: 'active',
                startDate: '2023-12-01',
                nextBilling: '2024-02-01',
                gamificationScore: 2500,
                personalizationLevel: 'bespoke'
            }
        ];

        mockSubscriptions.forEach(sub => {
            this.subscribers.set(sub.userId, sub);
        });
    }

    initializeBillingProcessor() {
        this.billingProcessor = {
            processPayment: async (userId, amount, tier) => {
                // Simulate payment processing
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            success: true,
                            transactionId: `txn_${Date.now()}`,
                            amount,
                            tier,
                            processedAt: new Date().toISOString()
                        });
                    }, 1500);
                });
            },
            
            setupRecurringBilling: async (userId, tier) => {
                // Setup recurring billing
                return {
                    success: true,
                    subscriptionId: `sub_${userId}_${Date.now()}`,
                    nextBilling: this.calculateNextBilling(tier)
                };
            },
            
            cancelSubscription: async (userId) => {
                // Cancel subscription
                const subscription = this.subscribers.get(userId);
                if (subscription) {
                    subscription.status = 'cancelled';
                    subscription.cancelledAt = new Date().toISOString();
                    return { success: true };
                }
                return { success: false, error: 'Subscription not found' };
            }
        };
    }

    initializeUsageTracking() {
        this.usageTracker = {
            trackContentAccess: (userId, contentType, wordCount) => {
                const usage = this.usageTracking.get(userId) || {
                    contentAccessed: 0,
                    wordsRead: 0,
                    lastAccess: null,
                    monthlyUsage: {}
                };
                
                usage.contentAccessed += 1;
                usage.wordsRead += wordCount;
                usage.lastAccess = new Date().toISOString();
                
                const month = new Date().toISOString().slice(0, 7);
                usage.monthlyUsage[month] = (usage.monthlyUsage[month] || 0) + wordCount;
                
                this.usageTracking.set(userId, usage);
            },
            
            getUsageStats: (userId) => {
                return this.usageTracking.get(userId) || {};
            },
            
            checkUsageLimits: (userId, requestedContent) => {
                const subscription = this.subscribers.get(userId);
                const tier = SUBSCRIPTION_TIERS[subscription?.tier || 'free'];
                const usage = this.usageTracking.get(userId) || {};
                
                return {
                    allowed: true, // Simplified for demo
                    remaining: tier.limits.wordCount - (usage.wordsRead || 0),
                    resetDate: this.calculateResetDate()
                };
            }
        };
    }

    initializePersonalizationEngine() {
        this.personalizationEngine = {
            updateProfile: (userId, preferences) => {
                const profile = this.personalizationProfiles.get(userId) || {
                    interests: [],
                    readingPatterns: {},
                    networkConnections: [],
                    professionalProfile: {},
                    personalProfile: {}
                };
                
                Object.assign(profile, preferences);
                this.personalizationProfiles.set(userId, profile);
                
                return profile;
            },
            
            getPersonalizationLevel: (userId) => {
                const subscription = this.subscribers.get(userId);
                const tier = SUBSCRIPTION_TIERS[subscription?.tier || 'free'];
                return tier.limits.personalization;
            },
            
            generatePersonalizedContent: (userId, baseContent) => {
                const profile = this.personalizationProfiles.get(userId);
                const level = this.getPersonalizationLevel(userId);
                
                // Personalization logic based on tier
                switch (level) {
                    case 'bespoke':
                        return this.generateBespokeContent(baseContent, profile);
                    case 'advanced':
                        return this.generateAdvancedContent(baseContent, profile);
                    case 'enhanced':
                        return this.generateEnhancedContent(baseContent, profile);
                    case 'basic':
                        return this.generateBasicContent(baseContent, profile);
                    default:
                        return baseContent;
                }
            }
        };
    }

    // Subscription Management Methods
    async subscribeUser(userId, tierId, paymentMethod) {
        const tier = SUBSCRIPTION_TIERS[tierId];
        if (!tier) {
            throw new Error('Invalid subscription tier');
        }

        // Process payment
        const paymentResult = await this.billingProcessor.processPayment(
            userId, 
            tier.price, 
            tierId
        );

        if (!paymentResult.success) {
            throw new Error('Payment processing failed');
        }

        // Setup recurring billing
        const billingResult = await this.billingProcessor.setupRecurringBilling(userId, tierId);

        // Create subscription record
        const subscription = {
            userId,
            tier: tierId,
            status: 'active',
            startDate: new Date().toISOString(),
            nextBilling: billingResult.nextBilling,
            paymentMethod,
            transactionId: paymentResult.transactionId,
            gamificationScore: 0,
            personalizationLevel: tier.limits.personalization
        };

        this.subscribers.set(userId, subscription);
        
        // Initialize personalization profile
        this.personalizationEngine.updateProfile(userId, {
            subscriptionTier: tierId,
            preferences: {}
        });

        return subscription;
    }

    async upgradeSubscription(userId, newTierId) {
        const currentSubscription = this.subscribers.get(userId);
        if (!currentSubscription) {
            throw new Error('No existing subscription found');
        }

        const newTier = SUBSCRIPTION_TIERS[newTierId];
        const currentTier = SUBSCRIPTION_TIERS[currentSubscription.tier];

        if (newTier.price <= currentTier.price) {
            throw new Error('Cannot downgrade or lateral move');
        }

        // Calculate prorated amount
        const proratedAmount = this.calculateProratedAmount(
            currentSubscription,
            newTier
        );

        // Process upgrade payment
        const paymentResult = await this.billingProcessor.processPayment(
            userId,
            proratedAmount,
            newTierId
        );

        if (!paymentResult.success) {
            throw new Error('Upgrade payment failed');
        }

        // Update subscription
        currentSubscription.tier = newTierId;
        currentSubscription.upgradedAt = new Date().toISOString();
        currentSubscription.personalizationLevel = newTier.limits.personalization;

        this.subscribers.set(userId, currentSubscription);

        return currentSubscription;
    }

    async cancelSubscription(userId, reason = '') {
        const result = await this.billingProcessor.cancelSubscription(userId);
        
        if (result.success) {
            const subscription = this.subscribers.get(userId);
            subscription.cancellationReason = reason;
            subscription.cancelledAt = new Date().toISOString();
        }

        return result;
    }

    getSubscription(userId) {
        return this.subscribers.get(userId);
    }

    getUserTier(userId) {
        const subscription = this.subscribers.get(userId);
        return subscription ? SUBSCRIPTION_TIERS[subscription.tier] : SUBSCRIPTION_TIERS.free;
    }

    checkAccess(userId, feature) {
        const tier = this.getUserTier(userId);
        
        // Access control logic
        const accessRules = {
            personalized_briefing: ['premium', 'executive', 'ultra_exclusive'],
            network_intelligence: ['standard', 'premium', 'executive', 'ultra_exclusive'],
            gamification_full: ['premium', 'executive', 'ultra_exclusive'],
            annual_bonus: ['ultra_exclusive'],
            strategy_sessions: ['executive', 'ultra_exclusive'],
            dedicated_analyst: ['ultra_exclusive']
        };

        return accessRules[feature]?.includes(tier.id) || false;
    }

    // Utility Methods
    calculateNextBilling(tierId) {
        const tier = SUBSCRIPTION_TIERS[tierId];
        const now = new Date();
        
        if (tier.billingCycle === 'monthly') {
            now.setMonth(now.getMonth() + 1);
        } else if (tier.billingCycle === 'yearly') {
            now.setFullYear(now.getFullYear() + 1);
        }
        
        return now.toISOString();
    }

    calculateProratedAmount(currentSubscription, newTier) {
        // Simplified proration calculation
        const daysRemaining = Math.ceil(
            (new Date(currentSubscription.nextBilling) - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        const dailyRate = newTier.price / 30;
        return Math.round(dailyRate * daysRemaining * 100) / 100;
    }

    calculateResetDate() {
        const now = new Date();
        now.setMonth(now.getMonth() + 1, 1);
        return now.toISOString();
    }

    // Content Personalization Methods
    generateBespokeContent(baseContent, profile) {
        return {
            ...baseContent,
            personalization: 'bespoke',
            customSections: this.generateCustomSections(profile),
            personalizedInsights: this.generatePersonalizedInsights(profile),
            networkAnalysis: this.generateNetworkAnalysis(profile),
            opportunityAlerts: this.generateOpportunityAlerts(profile)
        };
    }

    generateAdvancedContent(baseContent, profile) {
        return {
            ...baseContent,
            personalization: 'advanced',
            targetedSections: this.generateTargetedSections(profile),
            industryInsights: this.generateIndustryInsights(profile)
        };
    }

    generateEnhancedContent(baseContent, profile) {
        return {
            ...baseContent,
            personalization: 'enhanced',
            relevantSections: this.filterRelevantSections(baseContent, profile)
        };
    }

    generateBasicContent(baseContent, profile) {
        return {
            ...baseContent,
            personalization: 'basic',
            recommendations: this.generateBasicRecommendations(profile)
        };
    }

    generateCustomSections(profile) {
        // Generate ultra-personalized sections
        return [
            {
                title: 'Your Personal Intelligence Brief',
                content: 'Tailored intelligence based on your specific life circumstances'
            },
            {
                title: 'Network Movement Analysis',
                content: 'Analysis of changes in your professional network'
            },
            {
                title: 'Strategic Opportunity Assessment',
                content: 'Opportunities specifically relevant to your goals'
            }
        ];
    }

    generatePersonalizedInsights(profile) {
        return [
            'Market movements affecting your investment portfolio',
            'Industry changes impacting your career trajectory',
            'Network connections creating new opportunities'
        ];
    }

    generateNetworkAnalysis(profile) {
        return {
            networkGrowth: '+15% this quarter',
            keyConnections: ['Sarah Chen - VP Strategy', 'Marcus Johnson - Board Member'],
            influenceScore: 78,
            recommendedConnections: 5
        };
    }

    generateOpportunityAlerts(profile) {
        return [
            {
                type: 'Investment',
                title: 'Series A opportunity in AI startup',
                urgency: 'High',
                deadline: '2024-02-15'
            },
            {
                type: 'Career',
                title: 'Executive role at fintech unicorn',
                urgency: 'Medium',
                deadline: '2024-02-28'
            }
        ];
    }
}

// Subscription Manager Component
const SubscriptionManager = ({ userId, onSubscriptionChange }) => {
    const [engine] = useState(() => new SubscriptionEngine());
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [usageStats, setUsageStats] = useState({});

    // Load current subscription
    useEffect(() => {
        const subscription = engine.getSubscription(userId);
        setCurrentSubscription(subscription);
        
        const stats = engine.usageTracker.getUsageStats(userId);
        setUsageStats(stats);
    }, [userId, engine]);

    // Handle subscription upgrade
    const handleUpgrade = useCallback(async (tierId) => {
        setIsProcessing(true);
        
        try {
            let result;
            if (currentSubscription) {
                result = await engine.upgradeSubscription(userId, tierId);
            } else {
                result = await engine.subscribeUser(userId, tierId, 'card_default');
            }
            
            setCurrentSubscription(result);
            setShowUpgradeModal(false);
            onSubscriptionChange?.(result);
        } catch (error) {
            console.error('Subscription upgrade failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [userId, currentSubscription, engine, onSubscriptionChange]);

    // Handle subscription cancellation
    const handleCancel = useCallback(async () => {
        setIsProcessing(true);
        
        try {
            await engine.cancelSubscription(userId, 'User requested');
            const updatedSubscription = engine.getSubscription(userId);
            setCurrentSubscription(updatedSubscription);
            onSubscriptionChange?.(updatedSubscription);
        } catch (error) {
            console.error('Subscription cancellation failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [userId, engine, onSubscriptionChange]);

    const currentTier = currentSubscription ? SUBSCRIPTION_TIERS[currentSubscription.tier] : SUBSCRIPTION_TIERS.free;
    
    const formatPrice = (price) => {
        return price === 0 ? 'Free' : `$${price}/month`;
    };

    const getNextBillingDate = () => {
        if (!currentSubscription?.nextBilling) return null;
        return new Date(currentSubscription.nextBilling).toLocaleDateString();
    };

    return (
        <div className="subscription-manager">
            {/* Current Subscription Status */}
            <motion.div 
                className="current-subscription"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="subscription-header">
                    <h2>Your Subscription</h2>
                    <div className="subscription-status">
                        <span 
                            className="tier-badge"
                            style={{ background: currentTier.gradient }}
                        >
                            {currentTier.name}
                        </span>
                        <span className={`status ${currentSubscription?.status || 'inactive'}`}>
                            {currentSubscription?.status || 'No Active Subscription'}
                        </span>
                    </div>
                </div>
                
                {currentSubscription && (
                    <div className="subscription-details">
                        <div className="detail-item">
                            <span className="label">Price:</span>
                            <span className="value">{formatPrice(currentTier.price)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Next Billing:</span>
                            <span className="value">{getNextBillingDate()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Gamification Score:</span>
                            <span className="value">{currentSubscription.gamificationScore || 0}</span>
                        </div>
                    </div>
                )}
                
                {usageStats.wordsRead && (
                    <div className="usage-stats">
                        <h3>Usage This Month</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{usageStats.wordsRead?.toLocaleString()}</span>
                                <span className="stat-label">Words Read</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{usageStats.contentAccessed}</span>
                                <span className="stat-label">Articles Accessed</span>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Subscription Tiers */}
            <motion.div 
                className="subscription-tiers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2>Choose Your Intelligence Level</h2>
                <div className="tiers-grid">
                    {Object.values(SUBSCRIPTION_TIERS).map((tier, index) => (
                        <motion.div 
                            key={tier.id}
                            className={`tier-card ${tier.id === currentTier.id ? 'current' : ''} ${tier.exclusive ? 'exclusive' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="tier-header">
                                <h3>{tier.name}</h3>
                                <div className="tier-price">
                                    <span className="price">{formatPrice(tier.price)}</span>
                                    {tier.price > 0 && <span className="billing-cycle">/{tier.billingCycle}</span>}
                                </div>
                            </div>
                            
                            <div className="tier-features">
                                <ul>
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="tier-limits">
                                <div className="limit-item">
                                    <span className="limit-label">Word Count:</span>
                                    <span className="limit-value">{tier.limits.wordCount.toLocaleString()}</span>
                                </div>
                                <div className="limit-item">
                                    <span className="limit-label">Frequency:</span>
                                    <span className="limit-value">{tier.limits.frequency}</span>
                                </div>
                                <div className="limit-item">
                                    <span className="limit-label">Personalization:</span>
                                    <span className="limit-value">{tier.limits.personalization}</span>
                                </div>
                            </div>
                            
                            <div className="tier-actions">
                                {tier.id === currentTier.id ? (
                                    <button className="current-plan-button" disabled>
                                        Current Plan
                                    </button>
                                ) : (
                                    <button 
                                        className="upgrade-button"
                                        style={{ background: tier.gradient }}
                                        onClick={() => {
                                            setSelectedTier(tier);
                                            setShowUpgradeModal(true);
                                        }}
                                        disabled={isProcessing}
                                    >
                                        {currentSubscription ? 'Upgrade' : 'Subscribe'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgradeModal && selectedTier && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUpgradeModal(false)}
                    >
                        <motion.div
                            className="upgrade-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Upgrade to {selectedTier.name}</h2>
                                <button 
                                    className="close-button"
                                    onClick={() => setShowUpgradeModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="modal-content">
                                <div className="upgrade-summary">
                                    <p>You're upgrading to <strong>{selectedTier.name}</strong></p>
                                    <div className="price-breakdown">
                                        <div className="price-item">
                                            <span>Monthly Price:</span>
                                            <span>{formatPrice(selectedTier.price)}</span>
                                        </div>
                                        {currentSubscription && (
                                            <div className="price-item">
                                                <span>Prorated Amount:</span>
                                                <span>${engine.calculateProratedAmount(currentSubscription, selectedTier)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="upgrade-benefits">
                                    <h3>What you'll get:</h3>
                                    <ul>
                                        {selectedTier.features.map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="cancel-button"
                                    onClick={() => setShowUpgradeModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="confirm-upgrade-button"
                                    onClick={() => handleUpgrade(selectedTier.id)}
                                    disabled={isProcessing}
                                    style={{ background: selectedTier.gradient }}
                                >
                                    {isProcessing ? 'Processing...' : 'Confirm Upgrade'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subscription Actions */}
            {currentSubscription && currentSubscription.status === 'active' && (
                <motion.div 
                    className="subscription-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>Manage Subscription</h3>
                    <div className="actions-grid">
                        <button className="action-button update-payment">
                            Update Payment Method
                        </button>
                        <button className="action-button billing-history">
                            View Billing History
                        </button>
                        <button className="action-button personalization">
                            Personalization Settings
                        </button>
                        <button 
                            className="action-button cancel-subscription"
                            onClick={handleCancel}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default SubscriptionManager;
export { SubscriptionEngine, SUBSCRIPTION_TIERS };