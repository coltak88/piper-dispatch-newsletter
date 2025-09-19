/**
 * Market Data Service - Real-time Financial Intelligence Integration
 * Provides live market data, financial indicators, and economic intelligence
 * for The Signal section of Piper Newsletter
 */

// Market Data API Configuration
const MARKET_DATA_CONFIG = {
    BASE_URL: process.env.REACT_APP_MARKET_API_URL || 'https://api.marketdata.com/v1',
    API_KEY: process.env.REACT_APP_MARKET_API_KEY,
    WEBSOCKET_URL: process.env.REACT_APP_MARKET_WS_URL || 'wss://ws.marketdata.com',
    RATE_LIMIT: 100, // requests per minute
    CACHE_DURATION: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 10000 // 10 seconds
};

// Market Data Categories
const DATA_CATEGORIES = {
    STOCKS: 'stocks',
    FOREX: 'forex',
    CRYPTO: 'crypto',
    COMMODITIES: 'commodities',
    INDICES: 'indices',
    BONDS: 'bonds',
    OPTIONS: 'options',
    FUTURES: 'futures'
};

// Privacy-compliant headers
const getPrivacyHeaders = () => ({
    'Content-Type': 'application/json',
    'X-API-Key': MARKET_DATA_CONFIG.API_KEY,
    'X-Privacy-Mode': 'strict',
    'X-Data-Retention': 'minimal',
    'X-User-Consent': 'analytics-only',
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache'
});

// Authentication token management
const getAuthToken = () => {
    try {
        const token = localStorage.getItem('market_auth_token');
        if (!token) {
            console.warn('Market data authentication token not found');
            return null;
        }
        return token;
    } catch (error) {
        console.error('Error retrieving market auth token:', error);
        return null;
    }
};

// Cache management for market data
class MarketDataCache {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
    }

    set(key, data) {
        this.cache.set(key, data);
        this.timestamps.set(key, Date.now());
    }

    get(key) {
        const timestamp = this.timestamps.get(key);
        if (!timestamp || Date.now() - timestamp > MARKET_DATA_CONFIG.CACHE_DURATION) {
            this.cache.delete(key);
            this.timestamps.delete(key);
            return null;
        }
        return this.cache.get(key);
    }

    clear() {
        this.cache.clear();
        this.timestamps.clear();
    }
}

const marketCache = new MarketDataCache();

// Fetch live market data
export const fetchLiveMarketData = async (symbols = [], category = DATA_CATEGORIES.STOCKS) => {
    const cacheKey = `market_${category}_${symbols.join(',')}`;
    const cachedData = marketCache.get(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }

    try {
        const token = getAuthToken();
        const headers = {
            ...getPrivacyHeaders(),
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const queryParams = new URLSearchParams({
            symbols: symbols.join(','),
            category: category,
            fields: 'price,change,volume,market_cap,pe_ratio',
            format: 'json'
        });

        const response = await fetch(
            `${MARKET_DATA_CONFIG.BASE_URL}/quotes?${queryParams}`,
            {
                method: 'GET',
                headers,
                timeout: MARKET_DATA_CONFIG.TIMEOUT
            }
        );

        if (!response.ok) {
            throw new Error(`Market data API error: ${response.status}`);
        }

        const data = await response.json();
        marketCache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching live market data:', error);
        return getFallbackMarketData(symbols, category);
    }
};

// Fetch market news and intelligence
export const fetchMarketIntelligence = async (topics = [], limit = 10) => {
    const cacheKey = `intelligence_${topics.join(',')}_${limit}`;
    const cachedData = marketCache.get(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }

    try {
        const token = getAuthToken();
        const headers = {
            ...getPrivacyHeaders(),
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const queryParams = new URLSearchParams({
            topics: topics.join(','),
            limit: limit.toString(),
            sentiment: 'true',
            impact_score: 'true'
        });

        const response = await fetch(
            `${MARKET_DATA_CONFIG.BASE_URL}/intelligence?${queryParams}`,
            {
                method: 'GET',
                headers,
                timeout: MARKET_DATA_CONFIG.TIMEOUT
            }
        );

        if (!response.ok) {
            throw new Error(`Market intelligence API error: ${response.status}`);
        }

        const data = await response.json();
        marketCache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching market intelligence:', error);
        return getFallbackIntelligence(topics, limit);
    }
};

// Fetch economic indicators
export const fetchEconomicIndicators = async (indicators = []) => {
    const cacheKey = `indicators_${indicators.join(',')}`;
    const cachedData = marketCache.get(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }

    try {
        const token = getAuthToken();
        const headers = {
            ...getPrivacyHeaders(),
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const queryParams = new URLSearchParams({
            indicators: indicators.join(','),
            period: 'latest',
            format: 'json'
        });

        const response = await fetch(
            `${MARKET_DATA_CONFIG.BASE_URL}/indicators?${queryParams}`,
            {
                method: 'GET',
                headers,
                timeout: MARKET_DATA_CONFIG.TIMEOUT
            }
        );

        if (!response.ok) {
            throw new Error(`Economic indicators API error: ${response.status}`);
        }

        const data = await response.json();
        marketCache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching economic indicators:', error);
        return getFallbackIndicators(indicators);
    }
};

// WebSocket connection for real-time updates
export class MarketDataWebSocket {
    constructor(onMessage, onError) {
        this.ws = null;
        this.onMessage = onMessage;
        this.onError = onError;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(symbols = []) {
        try {
            const token = getAuthToken();
            const wsUrl = `${MARKET_DATA_CONFIG.WEBSOCKET_URL}?token=${token}&symbols=${symbols.join(',')}`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('Market data WebSocket connected');
                this.reconnectAttempts = 0;
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
                console.error('Market data WebSocket error:', error);
                this.onError(error);
            };
            
            this.ws.onclose = () => {
                console.log('Market data WebSocket disconnected');
                this.handleReconnect(symbols);
            };
        } catch (error) {
            console.error('Error connecting to market data WebSocket:', error);
            this.onError(error);
        }
    }

    handleReconnect(symbols) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect(symbols);
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    subscribe(symbols) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                action: 'subscribe',
                symbols: symbols
            }));
        }
    }

    unsubscribe(symbols) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                action: 'unsubscribe',
                symbols: symbols
            }));
        }
    }
}

// Fallback data functions
const getFallbackMarketData = (symbols, category) => {
    return {
        quotes: symbols.map(symbol => ({
            symbol,
            price: 0,
            change: 0,
            change_percent: 0,
            volume: 0,
            market_cap: 0,
            pe_ratio: 0,
            last_updated: new Date().toISOString(),
            status: 'offline'
        })),
        category,
        timestamp: new Date().toISOString(),
        status: 'fallback'
    };
};

const getFallbackIntelligence = (topics, limit) => {
    return {
        articles: Array(limit).fill(null).map((_, index) => ({
            id: `fallback_${index}`,
            title: 'Market data temporarily unavailable',
            summary: 'Real-time market intelligence is currently offline. Please check back later.',
            sentiment: 'neutral',
            impact_score: 0,
            published_at: new Date().toISOString(),
            source: 'System',
            topics: topics
        })),
        total: limit,
        timestamp: new Date().toISOString(),
        status: 'fallback'
    };
};

const getFallbackIndicators = (indicators) => {
    return {
        indicators: indicators.map(indicator => ({
            name: indicator,
            value: 0,
            change: 0,
            last_updated: new Date().toISOString(),
            status: 'offline'
        })),
        timestamp: new Date().toISOString(),
        status: 'fallback'
    };
};

// Export configuration and utilities
export { DATA_CATEGORIES, MARKET_DATA_CONFIG, marketCache };
export default {
    fetchLiveMarketData,
    fetchMarketIntelligence,
    fetchEconomicIndicators,
    MarketDataWebSocket,
    DATA_CATEGORIES
};