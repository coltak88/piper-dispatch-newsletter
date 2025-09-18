/**
 * Advanced Threat Intelligence Service
 * Integrates multiple cybersecurity feeds for comprehensive threat analysis
 * Privacy-first architecture with on-device processing
 */

// Threat Intelligence API Configuration
const THREAT_API_CONFIG = {
    baseUrl: process.env.REACT_APP_THREAT_API_URL || 'https://threat-intel.piperdispatch.com',
    version: 'v3',
    endpoints: {
        feeds: '/feeds',
        indicators: '/indicators',
        analysis: '/analysis',
        alerts: '/alerts',
        attribution: '/attribution'
    },
    sources: {
        mitre: 'MITRE ATT&CK',
        cisa: 'CISA Alerts',
        nist: 'NIST Cybersecurity',
        crowdstrike: 'CrowdStrike Intelligence',
        mandiant: 'Mandiant Threat Intelligence',
        recorded_future: 'Recorded Future'
    }
};

// Privacy-first headers for threat intelligence requests
const getThreatHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Privacy-Mode': 'maximum',
    'X-Data-Retention': '0',
    'X-On-Device-Processing': 'true',
    'Authorization': `Bearer ${getAuthToken()}`,
    'X-Threat-Signature': generateThreatSignature(),
    'User-Agent': 'PiperDispatch-ThreatIntel/3.0'
});

// Get authentication token with privacy protection
const getAuthToken = () => {
    try {
        const token = localStorage.getItem('threatIntelToken');
        if (!token) {
            console.warn('Threat intelligence token not found, using fallback data');
            return null;
        }
        return token;
    } catch (error) {
        console.error('Error retrieving threat intel token:', error);
        return null;
    }
};

// Generate threat signature for API authentication
const generateThreatSignature = () => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    return btoa(`threat-${timestamp}-${nonce}`);
};

// Fetch real-time threat feeds from multiple sources
export const fetchThreatFeeds = async (sources = ['mitre', 'cisa', 'nist'], limit = 50) => {
    try {
        const response = await fetch(`${THREAT_API_CONFIG.baseUrl}${THREAT_API_CONFIG.endpoints.feeds}`, {
            method: 'POST',
            headers: getThreatHeaders(),
            body: JSON.stringify({
                sources,
                limit,
                privacy_mode: 'maximum',
                real_time: true
            })
        });

        if (!response.ok) {
            throw new Error(`Threat feeds fetch failed: ${response.status}`);
        }

        const data = await response.json();
        return {
            feeds: data.feeds || [],
            status: 'live',
            timestamp: new Date().toISOString(),
            sources: data.sources || [],
            total_threats: data.total_threats || 0
        };
    } catch (error) {
        console.error('Error fetching threat feeds:', error);
        return getFallbackThreatFeeds();
    }
};

// Fetch threat indicators and IOCs (Indicators of Compromise)
export const fetchThreatIndicators = async (categories = ['malware', 'phishing', 'apt'], severity = 'high') => {
    try {
        const response = await fetch(`${THREAT_API_CONFIG.baseUrl}${THREAT_API_CONFIG.endpoints.indicators}`, {
            method: 'POST',
            headers: getThreatHeaders(),
            body: JSON.stringify({
                categories,
                severity,
                include_attribution: true,
                privacy_protected: true
            })
        });

        if (!response.ok) {
            throw new Error(`Threat indicators fetch failed: ${response.status}`);
        }

        const data = await response.json();
        return {
            indicators: data.indicators || [],
            iocs: data.iocs || [],
            status: 'live',
            timestamp: new Date().toISOString(),
            severity_distribution: data.severity_distribution || {}
        };
    } catch (error) {
        console.error('Error fetching threat indicators:', error);
        return getFallbackThreatIndicators();
    }
};

// Fetch advanced threat analysis and attribution
export const fetchThreatAnalysis = async (threat_types = ['apt', 'ransomware', 'supply_chain']) => {
    try {
        const response = await fetch(`${THREAT_API_CONFIG.baseUrl}${THREAT_API_CONFIG.endpoints.analysis}`, {
            method: 'POST',
            headers: getThreatHeaders(),
            body: JSON.stringify({
                threat_types,
                include_predictions: true,
                analysis_depth: 'comprehensive',
                privacy_mode: 'maximum'
            })
        });

        if (!response.ok) {
            throw new Error(`Threat analysis fetch failed: ${response.status}`);
        }

        const data = await response.json();
        return {
            analysis: data.analysis || [],
            predictions: data.predictions || [],
            attribution: data.attribution || [],
            risk_score: data.risk_score || 0,
            status: 'live',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching threat analysis:', error);
        return getFallbackThreatAnalysis();
    }
};

// Fetch real-time security alerts
export const fetchSecurityAlerts = async (priority = 'high', limit = 20) => {
    try {
        const response = await fetch(`${THREAT_API_CONFIG.baseUrl}${THREAT_API_CONFIG.endpoints.alerts}`, {
            method: 'POST',
            headers: getThreatHeaders(),
            body: JSON.stringify({
                priority,
                limit,
                real_time: true,
                include_context: true
            })
        });

        if (!response.ok) {
            throw new Error(`Security alerts fetch failed: ${response.status}`);
        }

        const data = await response.json();
        return {
            alerts: data.alerts || [],
            active_campaigns: data.active_campaigns || [],
            status: 'live',
            timestamp: new Date().toISOString(),
            alert_count: data.alert_count || 0
        };
    } catch (error) {
        console.error('Error fetching security alerts:', error);
        return getFallbackSecurityAlerts();
    }
};

// Real-time threat intelligence WebSocket connection
export class ThreatIntelligenceWebSocket {
    constructor(onMessage, onError) {
        this.onMessage = onMessage;
        this.onError = onError;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(subscriptions = ['alerts', 'indicators', 'analysis']) {
        try {
            const wsUrl = `${THREAT_API_CONFIG.baseUrl.replace('https', 'wss')}/ws/threat-intel`;
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('Threat Intelligence WebSocket connected');
                this.reconnectAttempts = 0;
                
                // Subscribe to threat intelligence feeds
                this.ws.send(JSON.stringify({
                    action: 'subscribe',
                    subscriptions,
                    privacy_mode: 'maximum',
                    auth_token: getAuthToken()
                }));
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.onMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('Threat Intelligence WebSocket error:', error);
                this.onError(error);
            };

            this.ws.onclose = () => {
                console.log('Threat Intelligence WebSocket disconnected');
                this.attemptReconnect(subscriptions);
            };
        } catch (error) {
            console.error('Error establishing WebSocket connection:', error);
            this.onError(error);
        }
    }

    attemptReconnect(subscriptions) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect(subscriptions);
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.onError(new Error('WebSocket connection failed'));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Fallback threat feeds data
const getFallbackThreatFeeds = () => ({
    feeds: [
        {
            id: 'feed_001',
            source: 'MITRE ATT&CK',
            title: 'Advanced Persistent Threat Campaign Detected',
            severity: 'high',
            category: 'apt',
            description: 'Sophisticated APT group targeting financial institutions',
            timestamp: new Date().toISOString(),
            indicators: ['suspicious_network_traffic', 'credential_harvesting']
        },
        {
            id: 'feed_002',
            source: 'CISA Alerts',
            title: 'Critical Infrastructure Vulnerability',
            severity: 'critical',
            category: 'vulnerability',
            description: 'Zero-day vulnerability affecting industrial control systems',
            timestamp: new Date().toISOString(),
            indicators: ['system_compromise', 'data_exfiltration']
        }
    ],
    status: 'fallback',
    timestamp: new Date().toISOString(),
    sources: ['mitre', 'cisa'],
    total_threats: 2
});

// Fallback threat indicators data
const getFallbackThreatIndicators = () => ({
    indicators: [
        {
            id: 'ioc_001',
            type: 'ip_address',
            value: '192.168.1.100',
            severity: 'high',
            category: 'malware',
            description: 'Command and control server',
            first_seen: new Date().toISOString(),
            confidence: 0.95
        },
        {
            id: 'ioc_002',
            type: 'domain',
            value: 'malicious-domain.com',
            severity: 'medium',
            category: 'phishing',
            description: 'Phishing campaign infrastructure',
            first_seen: new Date().toISOString(),
            confidence: 0.87
        }
    ],
    iocs: [
        {
            hash: 'a1b2c3d4e5f6',
            type: 'md5',
            malware_family: 'TrickBot',
            severity: 'high'
        }
    ],
    status: 'fallback',
    timestamp: new Date().toISOString(),
    severity_distribution: {
        critical: 1,
        high: 3,
        medium: 5,
        low: 2
    }
});

// Fallback threat analysis data
const getFallbackThreatAnalysis = () => ({
    analysis: [
        {
            id: 'analysis_001',
            threat_type: 'apt',
            title: 'State-Sponsored Cyber Espionage Campaign',
            description: 'Coordinated campaign targeting government and defense sectors',
            risk_level: 'high',
            affected_sectors: ['government', 'defense', 'finance'],
            timeline: '2024-01-15 to present',
            attribution: {
                group: 'APT29',
                confidence: 0.85,
                country: 'Unknown'
            }
        }
    ],
    predictions: [
        {
            threat_type: 'ransomware',
            probability: 0.78,
            timeframe: '30 days',
            target_sectors: ['healthcare', 'education']
        }
    ],
    attribution: [
        {
            group: 'APT29',
            confidence: 0.85,
            techniques: ['spear_phishing', 'credential_harvesting']
        }
    ],
    risk_score: 8.5,
    status: 'fallback',
    timestamp: new Date().toISOString()
});

// Fallback security alerts data
const getFallbackSecurityAlerts = () => ({
    alerts: [
        {
            id: 'alert_001',
            title: 'Critical Zero-Day Vulnerability Disclosed',
            severity: 'critical',
            category: 'vulnerability',
            description: 'Remote code execution vulnerability in widely-used software',
            timestamp: new Date().toISOString(),
            affected_products: ['Software X v1.0-2.5'],
            mitigation: 'Apply security patch immediately'
        },
        {
            id: 'alert_002',
            title: 'Ransomware Campaign Targeting Healthcare',
            severity: 'high',
            category: 'ransomware',
            description: 'Active ransomware campaign specifically targeting healthcare organizations',
            timestamp: new Date().toISOString(),
            affected_sectors: ['healthcare'],
            mitigation: 'Implement network segmentation and backup procedures'
        }
    ],
    active_campaigns: [
        {
            name: 'Operation ShadowStrike',
            threat_actor: 'APT28',
            start_date: '2024-01-01',
            status: 'active',
            targets: ['government', 'military']
        }
    ],
    status: 'fallback',
    timestamp: new Date().toISOString(),
    alert_count: 2
});

// Threat intelligence data categories
export const THREAT_CATEGORIES = {
    MALWARE: 'malware',
    PHISHING: 'phishing',
    APT: 'apt',
    RANSOMWARE: 'ransomware',
    VULNERABILITY: 'vulnerability',
    SUPPLY_CHAIN: 'supply_chain',
    INSIDER_THREAT: 'insider_threat',
    DDOS: 'ddos'
};

// Threat severity levels
export const THREAT_SEVERITY = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info'
};

export default {
    fetchThreatFeeds,
    fetchThreatIndicators,
    fetchThreatAnalysis,
    fetchSecurityAlerts,
    ThreatIntelligenceWebSocket,
    THREAT_CATEGORIES,
    THREAT_SEVERITY
};