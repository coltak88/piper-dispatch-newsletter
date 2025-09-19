// Privacy Utilities for Piper Newsletter
// Comprehensive privacy management and data protection utilities
import React from 'react';

/**
 * Privacy consent management
 */
export const PrivacyConsent = {
  // Consent types
  TYPES: {
    ESSENTIAL: 'essential',
    ANALYTICS: 'analytics',
    MARKETING: 'marketing',
    PERSONALIZATION: 'personalization',
    SOCIAL_MEDIA: 'social_media'
  },

  // Get consent status from localStorage
  getConsent: (type = null) => {
    try {
      const consent = JSON.parse(localStorage.getItem('privacy_consent') || '{}');
      return type ? consent[type] : consent;
    } catch (error) {
      console.warn('Error reading privacy consent:', error);
      return type ? false : {};
    }
  },

  // Set consent status
  setConsent: (type, granted = true) => {
    try {
      const currentConsent = PrivacyConsent.getConsent();
      const updatedConsent = {
        ...currentConsent,
        [type]: granted,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('privacy_consent', JSON.stringify(updatedConsent));
      
      // Dispatch custom event for consent changes
      window.dispatchEvent(new CustomEvent('privacy-consent-changed', {
        detail: { type, granted, consent: updatedConsent }
      }));
      
      return true;
    } catch (error) {
      console.error('Error setting privacy consent:', error);
      return false;
    }
  },

  // Set multiple consents at once
  setBulkConsent: (consentMap) => {
    try {
      const currentConsent = PrivacyConsent.getConsent();
      const updatedConsent = {
        ...currentConsent,
        ...consentMap,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('privacy_consent', JSON.stringify(updatedConsent));
      
      window.dispatchEvent(new CustomEvent('privacy-consent-changed', {
        detail: { bulk: true, consent: updatedConsent }
      }));
      
      return true;
    } catch (error) {
      console.error('Error setting bulk privacy consent:', error);
      return false;
    }
  },

  // Check if consent is required
  isConsentRequired: (type) => {
    return type !== PrivacyConsent.TYPES.ESSENTIAL;
  },

  // Clear all consent data
  clearConsent: () => {
    try {
      localStorage.removeItem('privacy_consent');
      window.dispatchEvent(new CustomEvent('privacy-consent-cleared'));
      return true;
    } catch (error) {
      console.error('Error clearing privacy consent:', error);
      return false;
    }
  }
};

/**
 * Data anonymization utilities
 */
export const DataAnonymizer = {
  // Anonymize email addresses
  anonymizeEmail: (email) => {
    if (!email || typeof email !== 'string') return '';
    
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    
    const anonymizedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
      : '*'.repeat(localPart.length);
    
    return `${anonymizedLocal}@${domain}`;
  },

  // Anonymize IP addresses
  anonymizeIP: (ip) => {
    if (!ip || typeof ip !== 'string') return '';
    
    // IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }
    
    // IPv6 - anonymize last 64 bits
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return parts.slice(0, 4).join(':') + '::xxxx:xxxx:xxxx:xxxx';
      }
    }
    
    return 'xxx.xxx.xxx.xxx';
  },

  // Anonymize user agent strings
  anonymizeUserAgent: (userAgent) => {
    if (!userAgent || typeof userAgent !== 'string') return '';
    
    // Remove version numbers and specific identifiers
    return userAgent
      .replace(/\d+\.\d+\.\d+/g, 'x.x.x')
      .replace(/\b\d{2,}\b/g, 'xxx')
      .replace(/\([^)]*\)/g, '(anonymized)');
  },

  // Generate anonymous user ID
  generateAnonymousId: () => {
    return 'anon_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  // Hash sensitive data
  hashData: async (data, salt = '') => {
    if (!data) return '';
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

/**
 * Cookie management utilities
 */
export const CookieManager = {
  // Set cookie with privacy considerations
  setCookie: (name, value, options = {}) => {
    const defaults = {
      expires: 30, // days
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict'
    };
    
    const config = { ...defaults, ...options };
    
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (config.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (config.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    
    if (config.path) {
      cookieString += `; path=${config.path}`;
    }
    
    if (config.domain) {
      cookieString += `; domain=${config.domain}`;
    }
    
    if (config.secure) {
      cookieString += '; secure';
    }
    
    if (config.sameSite) {
      cookieString += `; samesite=${config.sameSite}`;
    }
    
    if (config.httpOnly) {
      cookieString += '; httponly';
    }
    
    document.cookie = cookieString;
  },

  // Get cookie value
  getCookie: (name) => {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    
    return null;
  },

  // Delete cookie
  deleteCookie: (name, path = '/', domain = null) => {
    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    document.cookie = cookieString;
  },

  // Clear all cookies (where possible)
  clearAllCookies: () => {
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      CookieManager.deleteCookie(name);
    }
  }
};

/**
 * Local storage privacy utilities
 */
export const PrivateStorage = {
  // Set item with encryption (basic)
  setSecureItem: async (key, value, encrypt = true) => {
    try {
      let processedValue = value;
      
      if (encrypt && typeof value === 'string') {
        // Simple encryption using base64 (not cryptographically secure)
        processedValue = btoa(unescape(encodeURIComponent(value)));
      }
      
      const item = {
        value: processedValue,
        encrypted: encrypt,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error setting secure item:', error);
      return false;
    }
  },

  // Get item with decryption
  getSecureItem: (key) => {
    try {
      const itemString = localStorage.getItem(key);
      if (!itemString) return null;
      
      const item = JSON.parse(itemString);
      
      if (item.encrypted && typeof item.value === 'string') {
        // Simple decryption
        return decodeURIComponent(escape(atob(item.value)));
      }
      
      return item.value;
    } catch (error) {
      console.error('Error getting secure item:', error);
      return null;
    }
  },

  // Remove item
  removeSecureItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing secure item:', error);
      return false;
    }
  },

  // Clear all privacy-related storage
  clearPrivacyData: () => {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('privacy') || key.includes('consent') || key.includes('tracking'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing privacy data:', error);
      return false;
    }
  }
};

/**
 * Privacy policy utilities
 */
export const PrivacyPolicy = {
  // Get current privacy policy version
  getCurrentVersion: () => {
    return localStorage.getItem('privacy_policy_version') || '1.0';
  },

  // Set privacy policy version
  setCurrentVersion: (version) => {
    localStorage.setItem('privacy_policy_version', version);
    localStorage.setItem('privacy_policy_accepted_date', new Date().toISOString());
  },

  // Check if user has accepted current policy
  hasAcceptedCurrentPolicy: (currentVersion = '1.0') => {
    const acceptedVersion = PrivacyPolicy.getCurrentVersion();
    return acceptedVersion === currentVersion;
  },

  // Get policy acceptance date
  getAcceptanceDate: () => {
    return localStorage.getItem('privacy_policy_accepted_date');
  },

  // Clear policy data
  clearPolicyData: () => {
    localStorage.removeItem('privacy_policy_version');
    localStorage.removeItem('privacy_policy_accepted_date');
  }
};

/**
 * Data retention utilities
 */
export const DataRetention = {
  // Set data with expiration
  setExpiringData: (key, value, expirationDays = 30) => {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);
      
      const item = {
        value: value,
        expiration: expirationDate.toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error setting expiring data:', error);
      return false;
    }
  },

  // Get data if not expired
  getExpiringData: (key) => {
    try {
      const itemString = localStorage.getItem(key);
      if (!itemString) return null;
      
      const item = JSON.parse(itemString);
      const now = new Date();
      const expiration = new Date(item.expiration);
      
      if (now > expiration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error getting expiring data:', error);
      return null;
    }
  },

  // Clean up expired data
  cleanupExpiredData: () => {
    try {
      const keysToRemove = [];
      const now = new Date();
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        try {
          const itemString = localStorage.getItem(key);
          const item = JSON.parse(itemString);
          
          if (item.expiration) {
            const expiration = new Date(item.expiration);
            if (now > expiration) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          // Skip items that aren't in our format
          continue;
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return keysToRemove.length;
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
      return 0;
    }
  }
};

/**
 * Privacy compliance utilities
 */
export const PrivacyCompliance = {
  // GDPR compliance helpers
  gdpr: {
    // Right to be forgotten
    deleteAllUserData: () => {
      PrivacyConsent.clearConsent();
      PrivateStorage.clearPrivacyData();
      CookieManager.clearAllCookies();
      PrivacyPolicy.clearPolicyData();
      
      // Dispatch event for app-wide cleanup
      window.dispatchEvent(new CustomEvent('gdpr-data-deletion'));
    },

    // Data portability
    exportUserData: () => {
      const userData = {
        consent: PrivacyConsent.getConsent(),
        policyVersion: PrivacyPolicy.getCurrentVersion(),
        acceptanceDate: PrivacyPolicy.getAcceptanceDate(),
        exportDate: new Date().toISOString()
      };
      
      return userData;
    },

    // Check if processing is lawful
    hasLawfulBasis: (processingType) => {
      const consent = PrivacyConsent.getConsent(processingType);
      return consent === true;
    }
  },

  // CCPA compliance helpers
  ccpa: {
    // Do not sell flag
    setDoNotSell: (doNotSell = true) => {
      localStorage.setItem('ccpa_do_not_sell', JSON.stringify(doNotSell));
    },

    // Get do not sell preference
    getDoNotSell: () => {
      try {
        const preference = localStorage.getItem('ccpa_do_not_sell');
        return preference ? JSON.parse(preference) : false;
      } catch (error) {
        return false;
      }
    }
  }
};

/**
 * Privacy event system
 */
export const PrivacyEvents = {
  // Subscribe to privacy events
  subscribe: (eventType, callback) => {
    window.addEventListener(eventType, callback);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener(eventType, callback);
    };
  },

  // Available event types
  EVENTS: {
    CONSENT_CHANGED: 'privacy-consent-changed',
    CONSENT_CLEARED: 'privacy-consent-cleared',
    DATA_DELETION: 'gdpr-data-deletion',
    POLICY_UPDATED: 'privacy-policy-updated'
  }
};

// Initialize privacy utilities
export const initializePrivacyUtils = () => {
  // Clean up expired data on initialization
  DataRetention.cleanupExpiredData();
  
  // Set up periodic cleanup
  setInterval(() => {
    DataRetention.cleanupExpiredData();
  }, 24 * 60 * 60 * 1000); // Daily cleanup
  
  console.log('Privacy utilities initialized');
};

// React hook for privacy utilities
export const usePrivacy = () => {
  const [privacySettings, setPrivacySettings] = React.useState({
    cookiesAccepted: false,
    analyticsEnabled: false,
    marketingEnabled: false,
    functionalEnabled: true
  });

  const updatePrivacySettings = (settings) => {
    setPrivacySettings(prev => ({ ...prev, ...settings }));
    // Store in localStorage
    localStorage.setItem('privacySettings', JSON.stringify({ ...privacySettings, ...settings }));
  };

  React.useEffect(() => {
    // Load privacy settings from localStorage
    const stored = localStorage.getItem('privacySettings');
    if (stored) {
      try {
        setPrivacySettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse privacy settings:', error);
      }
    }
  }, []);

  return {
    privacySettings,
    updatePrivacySettings,
    consent: new PrivacyConsent(),
    cookies: new CookieManager(),
    anonymizer: new DataAnonymizer(),
    storage: new PrivateStorage(),
    policy: new PrivacyPolicy(),
    retention: new DataRetention(),
    compliance: new PrivacyCompliance(),
    events: PrivacyEvents
  };
};

// Differential privacy implementation
export const differentialPrivacy = {
  /**
   * Add Laplace noise for differential privacy
   */
  addLaplaceNoise(value, epsilon = 1.0, sensitivity = 1.0) {
    const scale = sensitivity / epsilon;
    const u = Math.random() - 0.5;
    const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    return value + noise;
  },

  /**
   * Add Gaussian noise for differential privacy
   */
  addGaussianNoise(value, epsilon = 1.0, delta = 1e-5, sensitivity = 1.0) {
    const sigma = Math.sqrt(2 * Math.log(1.25 / delta)) * sensitivity / epsilon;
    const noise = this.gaussianRandom() * sigma;
    return value + noise;
  },

  /**
   * Generate Gaussian random number
   */
  gaussianRandom() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  },

  /**
   * Apply differential privacy to dataset
   */
  privatizeDataset(dataset, epsilon = 1.0) {
    return dataset.map(item => {
      const privatized = { ...item };
      Object.keys(privatized).forEach(key => {
        if (typeof privatized[key] === 'number') {
          privatized[key] = this.addLaplaceNoise(privatized[key], epsilon);
        }
      });
      return privatized;
    });
  },

  /**
   * Calculate privacy budget
   */
  calculatePrivacyBudget(queries, totalBudget = 1.0) {
    const budgetPerQuery = totalBudget / queries.length;
    return queries.map((query, index) => ({
      query,
      epsilon: budgetPerQuery,
      remaining: totalBudget - (budgetPerQuery * (index + 1))
    }));
  }
};

// Default export
export default {
  PrivacyConsent,
  CookieManager,
  DataAnonymizer,
  PrivateStorage,
  PrivacyPolicy,
  DataRetention,
  PrivacyCompliance,
  PrivacyEvents,
  initializePrivacyUtils,
  usePrivacy,
  differentialPrivacy
};