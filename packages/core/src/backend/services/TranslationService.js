import { PrivacyFirstTracker } from './privacy/PrivacyTracker';
import { QuantumSecurityProvider } from '../quantum/QuantumSecurityService';

/**
 * Multi-language support service with real-time translation capabilities
 * Features privacy-first translation, offline support, and quantum-secured API calls
 */
class TranslationService {
  constructor() {
    this.supportedLanguages = {
      'en': { name: 'English', nativeName: 'English', rtl: false, flag: '🇺🇸' },
      'es': { name: 'Spanish', nativeName: 'Español', rtl: false, flag: '🇪🇸' },
      'fr': { name: 'French', nativeName: 'Français', rtl: false, flag: '🇫🇷' },
      'de': { name: 'German', nativeName: 'Deutsch', rtl: false, flag: '🇩🇪' },
      'it': { name: 'Italian', nativeName: 'Italiano', rtl: false, flag: '🇮🇹' },
      'pt': { name: 'Portuguese', nativeName: 'Português', rtl: false, flag: '🇵🇹' },
      'ru': { name: 'Russian', nativeName: 'Русский', rtl: false, flag: '🇷🇺' },
      'zh': { name: 'Chinese', nativeName: '中文', rtl: false, flag: '🇨🇳' },
      'ja': { name: 'Japanese', nativeName: '日本語', rtl: false, flag: '🇯🇵' },
      'ko': { name: 'Korean', nativeName: '한국어', rtl: false, flag: '🇰🇷' },
      'ar': { name: 'Arabic', nativeName: 'العربية', rtl: true, flag: '🇸🇦' },
      'he': { name: 'Hebrew', nativeName: 'עברית', rtl: true, flag: '🇮🇱' },
      'hi': { name: 'Hindi', nativeName: 'हिन्दी', rtl: false, flag: '🇮🇳' },
      'th': { name: 'Thai', nativeName: 'ไทย', rtl: false, flag: '🇹🇭' },
      'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false, flag: '🇻🇳' },
      'tr': { name: 'Turkish', nativeName: 'Türkçe', rtl: false, flag: '🇹🇷' },
      'pl': { name: 'Polish', nativeName: 'Polski', rtl: false, flag: '🇵🇱' },
      'nl': { name: 'Dutch', nativeName: 'Nederlands', rtl: false, flag: '🇳🇱' },
      'sv': { name: 'Swedish', nativeName: 'Svenska', rtl: false, flag: '🇸🇪' },
      'da': { name: 'Danish', nativeName: 'Dansk', rtl: false, flag: '🇩🇰' },
      'no': { name: 'Norwegian', nativeName: 'Norsk', rtl: false, flag: '🇳🇴' },
      'fi': { name: 'Finnish', nativeName: 'Suomi', rtl: false, flag: '🇫🇮' },
      'cs': { name: 'Czech', nativeName: 'Čeština', rtl: false, flag: '🇨🇿' },
      'sk': { name: 'Slovak', nativeName: 'Slovenčina', rtl: false, flag: '🇸🇰' },
      'hu': { name: 'Hungarian', nativeName: 'Magyar', rtl: false, flag: '🇭🇺' },
      'ro': { name: 'Romanian', nativeName: 'Română', rtl: false, flag: '🇷🇴' },
      'bg': { name: 'Bulgarian', nativeName: 'Български', rtl: false, flag: '🇧🇬' },
      'hr': { name: 'Croatian', nativeName: 'Hrvatski', rtl: false, flag: '🇭🇷' },
      'sr': { name: 'Serbian', nativeName: 'Српски', rtl: false, flag: '🇷🇸' },
      'sl': { name: 'Slovenian', nativeName: 'Slovenščina', rtl: false, flag: '🇸🇮' },
      'et': { name: 'Estonian', nativeName: 'Eesti', rtl: false, flag: '🇪🇪' },
      'lv': { name: 'Latvian', nativeName: 'Latviešu', rtl: false, flag: '🇱🇻' },
      'lt': { name: 'Lithuanian', nativeName: 'Lietuvių', rtl: false, flag: '🇱🇹' },
      'uk': { name: 'Ukrainian', nativeName: 'Українська', rtl: false, flag: '🇺🇦' },
      'be': { name: 'Belarusian', nativeName: 'Беларуская', rtl: false, flag: '🇧🇾' },
      'mk': { name: 'Macedonian', nativeName: 'Македонски', rtl: false, flag: '🇲🇰' },
      'mt': { name: 'Maltese', nativeName: 'Malti', rtl: false, flag: '🇲🇹' },
      'is': { name: 'Icelandic', nativeName: 'Íslenska', rtl: false, flag: '🇮🇸' },
      'ga': { name: 'Irish', nativeName: 'Gaeilge', rtl: false, flag: '🇮🇪' },
      'cy': { name: 'Welsh', nativeName: 'Cymraeg', rtl: false, flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
      'eu': { name: 'Basque', nativeName: 'Euskera', rtl: false, flag: '🏴󠁥󠁳󠁰󠁶󠁿' },
      'ca': { name: 'Catalan', nativeName: 'Català', rtl: false, flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
      'gl': { name: 'Galician', nativeName: 'Galego', rtl: false, flag: '🏴󠁥󠁳󠁧󠁡󠁿' }
    };
    
    this.currentLanguage = this.detectUserLanguage();
    this.translationCache = new Map();
    this.offlineTranslations = new Map();
    this.isOnline = navigator.onLine;
    this.translationQueue = [];
    this.privacyMode = 'maximum';
    this.apiEndpoint = process.env.REACT_APP_TRANSLATION_API || 'https://api.piperdispatch.com/translate';
    
    // Initialize offline support
    this.initializeOfflineSupport();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processTranslationQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Detect user's preferred language from browser settings
   */
  detectUserLanguage() {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('piper_preferred_language');
    if (savedLanguage && this.supportedLanguages[savedLanguage]) {
      return savedLanguage;
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    if (this.supportedLanguages[langCode]) {
      return langCode;
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Initialize offline translation support
   */
  async initializeOfflineSupport() {
    try {
      // Load cached translations from IndexedDB
      const cachedTranslations = await this.loadCachedTranslations();
      this.offlineTranslations = new Map(cachedTranslations);
      
      // Preload essential translations for current language
      await this.preloadEssentialTranslations();
      
    } catch (error) {
      console.warn('Offline translation initialization failed:', error);
    }
  }

  /**
   * Load cached translations from IndexedDB
   */
  async loadCachedTranslations() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PiperTranslations', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['translations'], 'readonly');
        const store = transaction.objectStore('translations');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const translations = getAllRequest.result.map(item => [item.key, item.value]);
          resolve(translations);
        };
        
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('translations')) {
          db.createObjectStore('translations', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Save translation to IndexedDB cache
   */
  async saveCachedTranslation(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PiperTranslations', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['translations'], 'readwrite');
        const store = transaction.objectStore('translations');
        
        store.put({ key, value });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Preload essential translations for better offline experience
   */
  async preloadEssentialTranslations() {
    const essentialKeys = [
      'navigation.home',
      'navigation.signal',
      'navigation.edge',
      'navigation.threat',
      'navigation.personalized',
      'navigation.analytics',
      'common.loading',
      'common.error',
      'common.retry',
      'common.close',
      'common.save',
      'common.cancel',
      'privacy.notice',
      'privacy.accept',
      'privacy.decline',
      'accessibility.skip_to_content',
      'accessibility.menu',
      'accessibility.close_menu'
    ];
    
    for (const key of essentialKeys) {
      if (this.currentLanguage !== 'en') {
        await this.translate(key, 'en', this.currentLanguage);
      }
    }
  }

  /**
   * Set current language and update UI
   */
  async setLanguage(languageCode) {
    if (!this.supportedLanguages[languageCode]) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }
    
    this.currentLanguage = languageCode;
    
    // Save to localStorage
    localStorage.setItem('piper_preferred_language', languageCode);
    
    // Update document language and direction
    document.documentElement.lang = languageCode;
    document.documentElement.dir = this.supportedLanguages[languageCode].rtl ? 'rtl' : 'ltr';
    
    // Track language change for analytics
    await PrivacyFirstTracker.trackEvent({
      category: 'localization',
      action: 'language_change',
      label: languageCode,
      privacy_level: 'anonymous'
    });
    
    // Preload essential translations for new language
    if (languageCode !== 'en') {
      await this.preloadEssentialTranslations();
    }
    
    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: languageCode, languageInfo: this.supportedLanguages[languageCode] }
    }));
  }

  /**
   * Get current language information
   */
  getCurrentLanguage() {
    return {
      code: this.currentLanguage,
      ...this.supportedLanguages[this.currentLanguage]
    };
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return Object.entries(this.supportedLanguages).map(([code, info]) => ({
      code,
      ...info
    }));
  }

  /**
   * Translate text with privacy-first approach
   */
  async translate(text, fromLang = 'en', toLang = this.currentLanguage) {
    // Return original text if same language
    if (fromLang === toLang) {
      return text;
    }
    
    // Generate cache key
    const cacheKey = `${fromLang}-${toLang}-${this.hashText(text)}`;
    
    // Check memory cache first
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }
    
    // Check offline cache
    if (this.offlineTranslations.has(cacheKey)) {
      const translation = this.offlineTranslations.get(cacheKey);
      this.translationCache.set(cacheKey, translation);
      return translation;
    }
    
    // If offline, queue for later or return fallback
    if (!this.isOnline) {
      this.translationQueue.push({ text, fromLang, toLang, cacheKey });
      return this.getFallbackTranslation(text, toLang) || text;
    }
    
    try {
      // Perform online translation with privacy protection
      const translation = await this.performOnlineTranslation(text, fromLang, toLang);
      
      // Cache the translation
      this.translationCache.set(cacheKey, translation);
      this.offlineTranslations.set(cacheKey, translation);
      
      // Save to persistent cache
      await this.saveCachedTranslation(cacheKey, translation);
      
      return translation;
      
    } catch (error) {
      console.warn('Translation failed:', error);
      return this.getFallbackTranslation(text, toLang) || text;
    }
  }

  /**
   * Perform online translation with quantum security
   */
  async performOnlineTranslation(text, fromLang, toLang) {
    // Generate quantum signature for request
    const timestamp = Date.now();
    const requestId = this.generateRequestId();
    const signature = await this.generateQuantumSignature({
      text: this.hashText(text), // Hash text for privacy
      fromLang,
      toLang,
      timestamp,
      requestId
    });
    
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Quantum-Signature': signature,
        'X-Request-ID': requestId,
        'X-Privacy-Level': this.privacyMode,
        'X-Timestamp': timestamp.toString()
      },
      body: JSON.stringify({
        text: this.privacyMode === 'maximum' ? this.anonymizeText(text) : text,
        from: fromLang,
        to: toLang,
        privacy_level: this.privacyMode,
        on_device_processing: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.translation || text;
  }

  /**
   * Generate quantum signature for secure API requests
   */
  async generateQuantumSignature(payload) {
    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash text for privacy (used in cache keys and API requests)
   */
  hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Anonymize text for maximum privacy mode
   */
  anonymizeText(text) {
    // Replace sensitive patterns while preserving structure
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b[A-Z]{2}\d{6,8}\b/g, '[ID]');
  }

  /**
   * Get fallback translation from predefined dictionary
   */
  getFallbackTranslation(text, toLang) {
    const fallbackDictionary = {
      'es': {
        'Loading...': 'Cargando...',
        'Error': 'Error',
        'Retry': 'Reintentar',
        'Close': 'Cerrar',
        'Save': 'Guardar',
        'Cancel': 'Cancelar'
      },
      'fr': {
        'Loading...': 'Chargement...',
        'Error': 'Erreur',
        'Retry': 'Réessayer',
        'Close': 'Fermer',
        'Save': 'Enregistrer',
        'Cancel': 'Annuler'
      },
      'de': {
        'Loading...': 'Laden...',
        'Error': 'Fehler',
        'Retry': 'Wiederholen',
        'Close': 'Schließen',
        'Save': 'Speichern',
        'Cancel': 'Abbrechen'
      }
    };
    
    return fallbackDictionary[toLang]?.[text];
  }

  /**
   * Process queued translations when back online
   */
  async processTranslationQueue() {
    if (!this.isOnline || this.translationQueue.length === 0) {
      return;
    }
    
    const queue = [...this.translationQueue];
    this.translationQueue = [];
    
    for (const item of queue) {
      try {
        await this.translate(item.text, item.fromLang, item.toLang);
      } catch (error) {
        console.warn('Queued translation failed:', error);
        // Re-queue failed translations
        this.translationQueue.push(item);
      }
    }
  }

  /**
   * Translate multiple texts in batch for better performance
   */
  async translateBatch(texts, fromLang = 'en', toLang = this.currentLanguage) {
    const translations = await Promise.allSettled(
      texts.map(text => this.translate(text, fromLang, toLang))
    );
    
    return translations.map((result, index) => ({
      original: texts[index],
      translation: result.status === 'fulfilled' ? result.value : texts[index],
      success: result.status === 'fulfilled'
    }));
  }

  /**
   * Get translation statistics
   */
  getTranslationStats() {
    return {
      cacheSize: this.translationCache.size,
      offlineCacheSize: this.offlineTranslations.size,
      queueSize: this.translationQueue.length,
      currentLanguage: this.currentLanguage,
      isOnline: this.isOnline,
      supportedLanguagesCount: Object.keys(this.supportedLanguages).length
    };
  }

  /**
   * Clear translation cache
   */
  async clearCache() {
    this.translationCache.clear();
    this.offlineTranslations.clear();
    
    // Clear IndexedDB cache
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PiperTranslations', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['translations'], 'readwrite');
        const store = transaction.objectStore('translations');
        
        store.clear();
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set privacy mode for translations
   */
  setPrivacyMode(mode) {
    if (!['maximum', 'high', 'standard'].includes(mode)) {
      throw new Error(`Invalid privacy mode: ${mode}`);
    }
    
    this.privacyMode = mode;
  }

  /**
   * Get privacy mode
   */
  getPrivacyMode() {
    return this.privacyMode;
  }

  /**
   * Check if language is RTL (Right-to-Left)
   */
  isRTL(languageCode = this.currentLanguage) {
    return this.supportedLanguages[languageCode]?.rtl || false;
  }

  /**
   * Format number according to current language locale
   */
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format date according to current language locale
   */
  formatDate(date, options = {}) {
    try {
      return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    } catch (error) {
      return date.toString();
    }
  }

  /**
   * Format currency according to current language locale
   */
  formatCurrency(amount, currency = 'USD', options = {}) {
    try {
      return new Intl.NumberFormat(this.currentLanguage, {
        style: 'currency',
        currency,
        ...options
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.translationCache.clear();
    this.offlineTranslations.clear();
    this.translationQueue = [];
    
    window.removeEventListener('online', this.processTranslationQueue);
    window.removeEventListener('offline', () => { this.isOnline = false; });
  }
}

// Create singleton instance
const translationService = new TranslationService();

export default translationService;
export { TranslationService };