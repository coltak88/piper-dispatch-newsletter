/**
 * Piper Dispatch Newsletter - Adaptive User Interface System
 * Implements dynamic layout adaptation based on user behavior patterns
 * Integrates Ask Polestar UIDL (User Intent Dynamic Layout) system
 * 
 * Features:
 * - Behavioral pattern recognition and adaptation
 * - Dynamic component positioning and sizing
 * - Personalized content prioritization
 * - Reading habit optimization
 * - Accessibility preference learning
 * - Performance-based layout adjustments
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// UIDL Core Engine - Adapted from Ask Polestar
class UIDLEngine {
    constructor() {
        this.behaviorPatterns = new Map();
        this.layoutPreferences = new Map();
        this.adaptationRules = new Map();
        this.performanceMetrics = new Map();
        this.initializeDefaultRules();
    }

    initializeDefaultRules() {
        // Reading behavior adaptations
        this.adaptationRules.set('quick_scanner', {
            layout: 'compact',
            prioritize: ['headlines', 'summaries', 'key_metrics'],
            reduce: ['detailed_analysis', 'background_context']
        });

        this.adaptationRules.set('deep_reader', {
            layout: 'expanded',
            prioritize: ['full_articles', 'analysis', 'context'],
            enhance: ['typography', 'spacing', 'focus_mode']
        });

        this.adaptationRules.set('mobile_focused', {
            layout: 'vertical_stack',
            optimize: ['touch_targets', 'scroll_efficiency'],
            minimize: ['horizontal_elements', 'complex_grids']
        });

        this.adaptationRules.set('accessibility_enhanced', {
            layout: 'high_contrast',
            enhance: ['font_sizes', 'color_contrast', 'navigation'],
            include: ['screen_reader_optimization', 'keyboard_navigation']
        });
    }

    analyzeUserBehavior(sessionData) {
        const patterns = {
            readingSpeed: this.calculateReadingSpeed(sessionData),
            interactionDepth: this.analyzeInteractionDepth(sessionData),
            devicePreference: this.detectDevicePreference(sessionData),
            timeSpentPerSection: this.analyzeTimeDistribution(sessionData),
            scrollBehavior: this.analyzeScrollPatterns(sessionData),
            clickPatterns: this.analyzeClickBehavior(sessionData)
        };

        return this.classifyBehaviorType(patterns);
    }

    calculateReadingSpeed(sessionData) {
        const totalWordsRead = sessionData.wordsViewed || 0;
        const totalTimeSpent = sessionData.timeSpent || 1;
        return totalWordsRead / (totalTimeSpent / 60); // Words per minute
    }

    analyzeInteractionDepth(sessionData) {
        const interactions = sessionData.interactions || [];
        const deepInteractions = interactions.filter(i => 
            i.type === 'expand' || i.type === 'share' || i.type === 'bookmark'
        ).length;
        return deepInteractions / Math.max(interactions.length, 1);
    }

    detectDevicePreference(sessionData) {
        const deviceSessions = sessionData.deviceHistory || [];
        const mobileCount = deviceSessions.filter(d => d.type === 'mobile').length;
        return mobileCount / Math.max(deviceSessions.length, 1);
    }

    analyzeTimeDistribution(sessionData) {
        return sessionData.sectionTimes || {};
    }

    analyzeScrollPatterns(sessionData) {
        const scrollEvents = sessionData.scrollEvents || [];
        return {
            averageScrollSpeed: this.calculateAverageScrollSpeed(scrollEvents),
            pausePoints: this.identifyScrollPauses(scrollEvents),
            backtrackFrequency: this.calculateBacktrackFrequency(scrollEvents)
        };
    }

    analyzeClickBehavior(sessionData) {
        const clicks = sessionData.clickEvents || [];
        return {
            clickFrequency: clicks.length / Math.max(sessionData.timeSpent, 1),
            targetTypes: this.categorizeClickTargets(clicks),
            precisionScore: this.calculateClickPrecision(clicks)
        };
    }

    classifyBehaviorType(patterns) {
        if (patterns.readingSpeed > 300 && patterns.interactionDepth < 0.3) {
            return 'quick_scanner';
        }
        if (patterns.readingSpeed < 200 && patterns.interactionDepth > 0.7) {
            return 'deep_reader';
        }
        if (patterns.devicePreference > 0.7) {
            return 'mobile_focused';
        }
        return 'balanced_reader';
    }

    generateAdaptiveLayout(behaviorType, contentSections) {
        const rules = this.adaptationRules.get(behaviorType) || {};
        
        return {
            layoutType: rules.layout || 'standard',
            sectionOrder: this.prioritizeSections(contentSections, rules),
            componentSizes: this.calculateComponentSizes(rules),
            interactionEnhancements: this.getInteractionEnhancements(rules),
            accessibilityFeatures: this.getAccessibilityFeatures(rules)
        };
    }

    prioritizeSections(sections, rules) {
        const prioritized = rules.prioritize || [];
        const reduced = rules.reduce || [];
        
        return sections.sort((a, b) => {
            const aPriority = prioritized.includes(a.type) ? 1 : 0;
            const bPriority = prioritized.includes(b.type) ? 1 : 0;
            const aReduced = reduced.includes(a.type) ? -1 : 0;
            const bReduced = reduced.includes(b.type) ? -1 : 0;
            
            return (bPriority + bReduced) - (aPriority + aReduced);
        });
    }

    calculateComponentSizes(rules) {
        const baseSize = 1.0;
        const enhancements = rules.enhance || [];
        
        return {
            typography: enhancements.includes('typography') ? baseSize * 1.2 : baseSize,
            spacing: enhancements.includes('spacing') ? baseSize * 1.3 : baseSize,
            touchTargets: enhancements.includes('touch_targets') ? baseSize * 1.4 : baseSize
        };
    }

    getInteractionEnhancements(rules) {
        return {
            focusMode: rules.enhance?.includes('focus_mode') || false,
            quickActions: rules.optimize?.includes('quick_actions') || false,
            gestureSupport: rules.optimize?.includes('gesture_support') || false
        };
    }

    getAccessibilityFeatures(rules) {
        return {
            highContrast: rules.layout === 'high_contrast',
            screenReaderOptimized: rules.include?.includes('screen_reader_optimization') || false,
            keyboardNavigation: rules.include?.includes('keyboard_navigation') || false
        };
    }
}

// Adaptive Interface Component
const UserBehaviorInterface = ({ children, userId, contentSections }) => {
    const [uidlEngine] = useState(() => new UIDLEngine());
    const [behaviorType, setBehaviorType] = useState('balanced_reader');
    const [adaptiveLayout, setAdaptiveLayout] = useState(null);
    const [sessionData, setSessionData] = useState({
        startTime: Date.now(),
        interactions: [],
        scrollEvents: [],
        clickEvents: [],
        timeSpent: 0,
        wordsViewed: 0
    });

    // Track user behavior in real-time
    const trackInteraction = useCallback((type, data) => {
        setSessionData(prev => ({
            ...prev,
            interactions: [...prev.interactions, {
                type,
                data,
                timestamp: Date.now()
            }],
            timeSpent: Date.now() - prev.startTime
        }));
    }, []);

    const trackScroll = useCallback((scrollData) => {
        setSessionData(prev => ({
            ...prev,
            scrollEvents: [...prev.scrollEvents, {
                ...scrollData,
                timestamp: Date.now()
            }]
        }));
    }, []);

    const trackClick = useCallback((clickData) => {
        setSessionData(prev => ({
            ...prev,
            clickEvents: [...prev.clickEvents, {
                ...clickData,
                timestamp: Date.now()
            }]
        }));
    }, []);

    // Analyze behavior and adapt interface
    useEffect(() => {
        const analyzeAndAdapt = () => {
            const detectedBehavior = uidlEngine.analyzeUserBehavior(sessionData);
            setBehaviorType(detectedBehavior);
            
            const newLayout = uidlEngine.generateAdaptiveLayout(detectedBehavior, contentSections);
            setAdaptiveLayout(newLayout);
        };

        // Analyze behavior every 30 seconds
        const interval = setInterval(analyzeAndAdapt, 30000);
        
        // Initial analysis after 10 seconds
        const initialTimeout = setTimeout(analyzeAndAdapt, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimeout);
        };
    }, [sessionData, uidlEngine, contentSections]);

    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            trackScroll({
                scrollY: window.scrollY,
                scrollDirection: window.scrollY > (window.lastScrollY || 0) ? 'down' : 'up',
                viewportHeight: window.innerHeight
            });
            window.lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [trackScroll]);

    // Click tracking
    useEffect(() => {
        const handleClick = (event) => {
            trackClick({
                target: event.target.tagName,
                className: event.target.className,
                x: event.clientX,
                y: event.clientY,
                elementType: event.target.dataset.trackingType || 'unknown'
            });
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [trackClick]);

    // Dynamic layout styles
    const layoutStyles = useMemo(() => {
        if (!adaptiveLayout) return {};

        const { componentSizes, accessibilityFeatures } = adaptiveLayout;
        
        return {
            fontSize: `${componentSizes.typography}rem`,
            lineHeight: componentSizes.spacing,
            filter: accessibilityFeatures.highContrast ? 'contrast(1.5)' : 'none',
            transition: 'all 0.3s ease-in-out'
        };
    }, [adaptiveLayout]);

    // Layout variants for animation
    const layoutVariants = {
        compact: {
            gap: '0.5rem',
            padding: '0.75rem'
        },
        expanded: {
            gap: '2rem',
            padding: '2rem'
        },
        vertical_stack: {
            flexDirection: 'column',
            gap: '1rem'
        },
        standard: {
            gap: '1rem',
            padding: '1rem'
        }
    };

    return (
        <motion.div
            className="adaptive-interface"
            style={layoutStyles}
            animate={adaptiveLayout ? layoutVariants[adaptiveLayout.layoutType] : layoutVariants.standard}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            data-behavior-type={behaviorType}
            data-layout-type={adaptiveLayout?.layoutType}
        >
            <div className="behavior-indicator">
                <span className="behavior-type">{behaviorType.replace('_', ' ')}</span>
                <span className="adaptation-status">
                    {adaptiveLayout ? 'Adapted' : 'Learning'}
                </span>
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={adaptiveLayout?.layoutType || 'default'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="adaptive-content"
                    onScroll={() => trackInteraction('scroll', { section: 'main' })}
                    onClick={() => trackInteraction('click', { section: 'main' })}
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            {/* Accessibility enhancements */}
            {adaptiveLayout?.accessibilityFeatures.keyboardNavigation && (
                <div className="keyboard-navigation-hints">
                    <span>Press Tab to navigate, Enter to select</span>
                </div>
            )}

            {/* Performance metrics display (dev mode) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="performance-metrics">
                    <div>Behavior: {behaviorType}</div>
                    <div>Layout: {adaptiveLayout?.layoutType}</div>
                    <div>Interactions: {sessionData.interactions.length}</div>
                    <div>Time: {Math.round(sessionData.timeSpent / 1000)}s</div>
                </div>
            )}
        </motion.div>
    );
};

export default UserBehaviorInterface;
export { UIDLEngine };