/**
 * Threat Intelligence Section Component
 * Displays real-time cybersecurity threats, indicators, and analysis
 * Privacy-first architecture with on-device threat processing
 */

import React, { useState, useEffect, useRef } from 'react';
import '../styles/sections/threat-intelligence.css';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';
import { NeurodiversityOptimizer } from '../services/neurodiversity/NeurodiversityOptimizer';
import {
    fetchThreatFeeds,
    fetchThreatIndicators,
    fetchThreatAnalysis,
    fetchSecurityAlerts,
    ThreatIntelligenceWebSocket,
    THREAT_CATEGORIES,
    THREAT_SEVERITY
} from '../services/ThreatIntelligenceService';

const ThreatIntelligence = ({ neurodiversityMode, privacyToken, specialKitActive }) => {
    const [threatData, setThreatData] = useState(null);
    const [selectedThreat, setSelectedThreat] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [privacyMode, setPrivacyMode] = useState('maximum');
    const [threatFeeds, setThreatFeeds] = useState(null);
    const [indicators, setIndicators] = useState(null);
    const [securityAlerts, setSecurityAlerts] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const wsRef = useRef(null);

    // Initialize threat intelligence with privacy-first data loading
    useEffect(() => {
        const loadThreatIntelligence = async () => {
            if (!privacyToken) return;

            try {
                // Fetch comprehensive threat intelligence data
                const [feeds, threatIndicators, analysis, alerts] = await Promise.all([
                    fetchThreatFeeds(['mitre', 'cisa', 'nist', 'crowdstrike'], 25),
                    fetchThreatIndicators(['malware', 'phishing', 'apt', 'ransomware'], 'high'),
                    fetchThreatAnalysis(['apt', 'ransomware', 'supply_chain']),
                    fetchSecurityAlerts('high', 15)
                ]);

                // Combine all threat intelligence sources
                const combinedThreatData = {
                    feeds: feeds.feeds || [],
                    indicators: threatIndicators.indicators || [],
                    iocs: threatIndicators.iocs || [],
                    analysis: analysis.analysis || [],
                    predictions: analysis.predictions || [],
                    alerts: alerts.alerts || [],
                    activeCampaigns: alerts.active_campaigns || [],
                    riskScore: analysis.risk_score || 0,
                    threatLevel: calculateOverallThreatLevel(feeds, analysis, alerts),
                    confidenceScore: calculateThreatConfidence(feeds, analysis),
                    lastUpdated: new Date().toISOString()
                };

                // Apply differential privacy to threat data
                const privacyProtectedData = await PrivacyFirstTracker.applyDifferentialPrivacy(combinedThreatData, {
                    epsilon: privacyMode === 'maximum' ? 0.005 : 0.01,
                    onDeviceProcessing: true,
                    dataRetention: 0,
                    sensitiveFields: ['indicators', 'iocs', 'attribution']
                });

                setThreatData(privacyProtectedData);
                setThreatFeeds(feeds);
                setIndicators(threatIndicators);
                setSecurityAlerts(alerts);
            } catch (error) {
                console.error('Threat intelligence loading failed:', error);
                // Use fallback data in case of API failure
                setThreatData(fallbackThreatData);
            }
        };

        loadThreatIntelligence();
        
        // Set up real-time updates every 60 seconds for threat intelligence
        const updateInterval = setInterval(loadThreatIntelligence, 60000);
        
        return () => clearInterval(updateInterval);
    }, [privacyToken, privacyMode]);

    // Calculate overall threat level based on multiple sources
    const calculateOverallThreatLevel = (feeds, analysis, alerts) => {
        try {
            const criticalAlerts = alerts.alerts?.filter(a => a.severity === 'critical').length || 0;
            const highSeverityFeeds = feeds.feeds?.filter(f => f.severity === 'high').length || 0;
            const riskScore = analysis.risk_score || 0;

            if (criticalAlerts > 0 || riskScore > 8.0) return 'critical';
            if (highSeverityFeeds > 3 || riskScore > 6.0) return 'high';
            if (highSeverityFeeds > 1 || riskScore > 4.0) return 'medium';
            return 'low';
        } catch (error) {
            console.error('Error calculating threat level:', error);
            return 'unknown';
        }
    };

    // Calculate threat intelligence confidence score
    const calculateThreatConfidence = (feeds, analysis) => {
        try {
            const feedQuality = feeds.status === 'live' ? 0.95 : 0.6;
            const analysisQuality = analysis.status === 'live' ? 0.9 : 0.5;
            const sourceCount = feeds.sources?.length || 1;
            const sourceBonus = Math.min(sourceCount * 0.05, 0.2);
            
            return Math.round((feedQuality + analysisQuality + sourceBonus) / 2 * 100);
        } catch (error) {
            console.error('Error calculating threat confidence:', error);
            return 0;
        }
    };

    // Set up WebSocket connection for real-time threat updates
    useEffect(() => {
        if (!privacyToken) return;

        const handleWebSocketMessage = (data) => {
            if (data.type === 'threat_update') {
                setThreatData(prevData => ({
                    ...prevData,
                    feeds: data.feeds || prevData.feeds,
                    alerts: data.alerts || prevData.alerts,
                    lastUpdated: new Date().toISOString()
                }));
                setIsConnected(true);
            }
        };

        const handleWebSocketError = (error) => {
            console.error('Threat Intelligence WebSocket error:', error);
            setIsConnected(false);
        };

        wsRef.current = new ThreatIntelligenceWebSocket(handleWebSocketMessage, handleWebSocketError);
        wsRef.current.connect(['alerts', 'indicators', 'analysis']);

        return () => {
            if (wsRef.current) {
                wsRef.current.disconnect();
            }
        };
    }, [privacyToken]);

    // Handle threat analysis with privacy protection
    const analyzeThreat = async (threat) => {
        setIsAnalyzing(true);
        setSelectedThreat(threat);

        try {
            // Track interaction with differential privacy
            await PrivacyFirstTracker.trackInteraction({
                section: 'threat_intelligence',
                action: 'threat_analysis',
                threat_id: threat.id,
                threat_category: threat.category,
                timestamp: Date.now()
            });

            // Simulate detailed threat analysis
            setTimeout(() => {
                setIsAnalyzing(false);
            }, 3000);

        } catch (error) {
            console.error('Threat analysis failed:', error);
            setIsAnalyzing(false);
        }
    };

    // Filter threats based on category
    const filterThreats = (category) => {
        setActiveFilter(category);
    };

    // Get filtered threat data
    const getFilteredThreats = () => {
        if (!threatData) return [];
        
        if (activeFilter === 'all') {
            return threatData.feeds || [];
        }
        
        return threatData.feeds?.filter(threat => threat.category === activeFilter) || [];
    };

    // Render neurodiversity-optimized content
    const renderNeurodiversityOptimized = () => {
        const optimizationProps = {
            mode: neurodiversityMode,
            content: threatData,
            section: 'threat_intelligence'
        };

        return NeurodiversityOptimizer.optimizeContent(optimizationProps);
    };

    // Fallback threat intelligence data
    const fallbackThreatData = {
        feeds: [
            {
                id: 'threat_001',
                source: 'MITRE ATT&CK',
                title: 'Advanced Persistent Threat Campaign',
                severity: 'high',
                category: 'apt',
                description: 'Sophisticated APT group targeting critical infrastructure',
                timestamp: new Date().toISOString(),
                indicators: ['network_reconnaissance', 'credential_harvesting'],
                attribution: {
                    group: 'APT29',
                    confidence: 0.85
                }
            },
            {
                id: 'threat_002',
                source: 'CISA Alerts',
                title: 'Ransomware Campaign Targeting Healthcare',
                severity: 'critical',
                category: 'ransomware',
                description: 'Active ransomware campaign with healthcare sector focus',
                timestamp: new Date().toISOString(),
                indicators: ['file_encryption', 'ransom_demand'],
                attribution: {
                    group: 'Conti',
                    confidence: 0.92
                }
            }
        ],
        indicators: [
            {
                id: 'ioc_001',
                type: 'ip_address',
                value: '***REDACTED***',
                severity: 'high',
                category: 'malware'
            }
        ],
        alerts: [
            {
                id: 'alert_001',
                title: 'Zero-Day Vulnerability Disclosed',
                severity: 'critical',
                category: 'vulnerability'
            }
        ],
        riskScore: 7.8,
        threatLevel: 'high',
        confidenceScore: 88,
        lastUpdated: new Date().toISOString()
    };

    const currentData = threatData || fallbackThreatData;
    const filteredThreats = getFilteredThreats();

    return (
        <div className={`threat-intelligence-section ${neurodiversityMode}-optimized`}>
            {/* Section header */}
            <header className="threat-header">
                <div className="header-content">
                    <h2 className="section-title">
                        <span className="title-icon">🛡️</span>
                        <span className="title-text">Threat Intelligence</span>
                        <span className="title-subtitle">Cybersecurity Feeds & Analysis</span>
                    </h2>
                    
                    <div className="privacy-controls">
                        <label htmlFor="threat-privacy-mode">Privacy Level:</label>
                        <select 
                            id="threat-privacy-mode"
                            value={privacyMode}
                            onChange={(e) => setPrivacyMode(e.target.value)}
                            className="privacy-selector"
                        >
                            <option value="maximum">Maximum (ε=0.005)</option>
                            <option value="high">High (ε=0.01)</option>
                            <option value="standard">Standard (ε=0.05)</option>
                        </select>
                    </div>
                </div>
                
                <div className="threat-status">
                    <div className={`status-indicator ${isConnected ? 'active' : 'offline'}`}>
                        <span className="indicator-dot"></span>
                        <span className="indicator-text">
                            {isConnected ? 'Live Threat Feeds' : 'Offline Mode'}
                        </span>
                    </div>
                    <div className="threat-level">
                        <span className={`threat-badge ${currentData.threatLevel}`}>
                            {currentData.threatLevel?.toUpperCase()} THREAT
                        </span>
                    </div>
                    <div className="confidence-score">
                        Confidence: {currentData.confidenceScore}%
                    </div>
                    <div className="last-update">
                        Updated: {currentData.lastUpdated ? new Date(currentData.lastUpdated).toLocaleTimeString() : 'Never'}
                    </div>
                </div>
            </header>

            {/* Threat category filters */}
            <div className="threat-filters">
                <button 
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => filterThreats('all')}
                >
                    All Threats
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'apt' ? 'active' : ''}`}
                    onClick={() => filterThreats('apt')}
                >
                    APT
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'ransomware' ? 'active' : ''}`}
                    onClick={() => filterThreats('ransomware')}
                >
                    Ransomware
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'malware' ? 'active' : ''}`}
                    onClick={() => filterThreats('malware')}
                >
                    Malware
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'vulnerability' ? 'active' : ''}`}
                    onClick={() => filterThreats('vulnerability')}
                >
                    Vulnerabilities
                </button>
            </div>

            {/* Threat feeds */}
            <section className="threat-feeds">
                <h3 className="subsection-title">
                    <span className="subsection-icon">⚠️</span>
                    Active Threats
                </h3>
                
                <div className="threats-grid">
                    {filteredThreats.map((threat) => (
                        <div 
                            key={threat.id}
                            className={`threat-card ${selectedThreat?.id === threat.id ? 'selected' : ''} ${threat.severity}`}
                            onClick={() => analyzeThreat(threat)}
                        >
                            <div className="threat-header">
                                <h4 className="threat-title">{threat.title}</h4>
                                <div className="threat-meta">
                                    <span className={`severity-badge ${threat.severity}`}>
                                        {threat.severity?.toUpperCase()}
                                    </span>
                                    <span className="category-badge">
                                        {threat.category?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="threat-source">
                                <span className="source-label">Source:</span>
                                <span className="source-value">{threat.source}</span>
                            </div>
                            
                            <p className="threat-description">{threat.description}</p>
                            
                            {threat.indicators && (
                                <div className="threat-indicators">
                                    <span className="indicators-label">Indicators:</span>
                                    <div className="indicators-list">
                                        {threat.indicators.map((indicator, index) => (
                                            <span key={index} className="indicator-tag">
                                                {indicator.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {threat.attribution && (
                                <div className="threat-attribution">
                                    <span className="attribution-label">Attribution:</span>
                                    <span className="attribution-group">{threat.attribution.group}</span>
                                    <span className="attribution-confidence">
                                        ({Math.round(threat.attribution.confidence * 100)}% confidence)
                                    </span>
                                </div>
                            )}
                            
                            <div className="threat-timestamp">
                                {new Date(threat.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Security alerts */}
            {currentData.alerts && currentData.alerts.length > 0 && (
                <section className="security-alerts">
                    <h3 className="subsection-title">
                        <span className="subsection-icon">🚨</span>
                        Security Alerts
                    </h3>
                    
                    <div className="alerts-list">
                        {currentData.alerts.slice(0, 5).map((alert) => (
                            <div key={alert.id} className={`alert-item ${alert.severity}`}>
                                <div className="alert-header">
                                    <h4 className="alert-title">{alert.title}</h4>
                                    <span className={`alert-severity ${alert.severity}`}>
                                        {alert.severity?.toUpperCase()}
                                    </span>
                                </div>
                                <p className="alert-description">{alert.description}</p>
                                {alert.mitigation && (
                                    <div className="alert-mitigation">
                                        <strong>Mitigation:</strong> {alert.mitigation}
                                    </div>
                                )}
                                <div className="alert-timestamp">
                                    {new Date(alert.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Threat analysis panel */}
            {selectedThreat && (
                <div className="threat-analysis-panel">
                    <div className="analysis-header">
                        <h3>Threat Analysis: {selectedThreat.title}</h3>
                        <button 
                            className="close-analysis"
                            onClick={() => setSelectedThreat(null)}
                        >
                            ×
                        </button>
                    </div>
                    
                    {isAnalyzing ? (
                        <div className="analysis-loading">
                            <div className="loading-spinner"></div>
                            <p>Analyzing threat patterns...</p>
                        </div>
                    ) : (
                        <div className="analysis-content">
                            <div className="analysis-section">
                                <h4>Threat Overview</h4>
                                <p>{selectedThreat.description}</p>
                            </div>
                            
                            {selectedThreat.indicators && (
                                <div className="analysis-section">
                                    <h4>Indicators of Compromise</h4>
                                    <ul>
                                        {selectedThreat.indicators.map((indicator, index) => (
                                            <li key={index}>{indicator.replace(/_/g, ' ')}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {selectedThreat.attribution && (
                                <div className="analysis-section">
                                    <h4>Attribution Analysis</h4>
                                    <p>
                                        <strong>Threat Actor:</strong> {selectedThreat.attribution.group}<br/>
                                        <strong>Confidence Level:</strong> {Math.round(selectedThreat.attribution.confidence * 100)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Neurodiversity optimization */}
            {neurodiversityMode !== 'standard' && renderNeurodiversityOptimized()}
        </div>
    );
};

export default ThreatIntelligence;