import React, { useState, useEffect, useRef } from 'react';
import './styles/language-selector.css';
import TranslationService from '../services/TranslationService';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';

const LanguageSelector = ({ 
  neurodiversityMode = 'standard',
  compactMode = false,
  showFlags = true,
  showNativeNames = true,
  onLanguageChange = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translationStats, setTranslationStats] = useState(null);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const selectorRef = useRef(null);

  // Initialize language data
  useEffect(() => {
    const initializeLanguageData = () => {
      const current = TranslationService.getCurrentLanguage();
      const supported = TranslationService.getSupportedLanguages();
      const stats = TranslationService.getTranslationStats();
      
      setCurrentLanguage(current);
      setSupportedLanguages(supported);
      setFilteredLanguages(supported);
      setTranslationStats(stats);
    };

    initializeLanguageData();

    // Listen for language changes
    const handleLanguageChange = (event) => {
      const { language, languageInfo } = event.detail;
      setCurrentLanguage({ code: language, ...languageInfo });
      
      // Update translation stats
      const stats = TranslationService.getTranslationStats();
      setTranslationStats(stats);
      
      // Close dropdown
      setIsOpen(false);
      setSearchTerm('');
      
      // Notify parent component
      if (onLanguageChange) {
        onLanguageChange(language, languageInfo);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [onLanguageChange]);

  // Filter languages based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLanguages(supportedLanguages);
      return;
    }

    const filtered = supportedLanguages.filter(lang => 
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredLanguages(filtered);
  }, [searchTerm, supportedLanguages]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      
      // Focus search input when dropdown opens
      if (searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          selectorRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          focusNextLanguage(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusNextLanguage(-1);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus next/previous language in dropdown
  const focusNextLanguage = (direction) => {
    const languageButtons = dropdownRef.current?.querySelectorAll('.language-option');
    if (!languageButtons || languageButtons.length === 0) return;

    const currentIndex = Array.from(languageButtons).findIndex(btn => 
      btn === document.activeElement
    );
    
    let nextIndex;
    if (currentIndex === -1) {
      nextIndex = direction > 0 ? 0 : languageButtons.length - 1;
    } else {
      nextIndex = (currentIndex + direction + languageButtons.length) % languageButtons.length;
    }
    
    languageButtons[nextIndex]?.focus();
  };

  // Handle language selection
  const handleLanguageSelect = async (languageCode) => {
    if (languageCode === currentLanguage?.code || isLoading) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Track language selection
      await PrivacyFirstTracker.trackEvent({
        category: 'localization',
        action: 'language_select',
        label: languageCode,
        privacy_level: 'anonymous'
      });
      
      // Set new language
      await TranslationService.setLanguage(languageCode);
      
    } catch (error) {
      console.error('Language change failed:', error);
      
      // Show error notification
      showNotification('Language change failed. Please try again.', 'error');
      
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (isLoading) return;
    
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      // Track dropdown open
      PrivacyFirstTracker.trackEvent({
        category: 'ui',
        action: 'language_dropdown_open',
        privacy_level: 'anonymous'
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  // Show notification (placeholder - would integrate with notification system)
  const showNotification = (message, type = 'info') => {
    // This would integrate with a proper notification system
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Get language display name
  const getLanguageDisplayName = (language) => {
    if (compactMode) {
      return showFlags ? language.flag : language.code.toUpperCase();
    }
    
    if (showNativeNames && language.nativeName !== language.name) {
      return `${language.name} (${language.nativeName})`;
    }
    
    return language.name;
  };

  // Get popular languages (most commonly used)
  const getPopularLanguages = () => {
    const popularCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'];
    return supportedLanguages.filter(lang => popularCodes.includes(lang.code));
  };

  // Get regional languages
  const getRegionalLanguages = () => {
    const popularCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'];
    return supportedLanguages.filter(lang => !popularCodes.includes(lang.code));
  };

  if (!currentLanguage) {
    return (
      <div className="language-selector-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef}
      className={`language-selector ${neurodiversityMode}-optimized ${compactMode ? 'compact' : ''} ${isOpen ? 'open' : ''}`}
    >
      {/* Current language button */}
      <button
        ref={selectorRef}
        className={`language-button ${isLoading ? 'loading' : ''}`}
        onClick={toggleDropdown}
        disabled={isLoading}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
        title={`Current language: ${currentLanguage.name}`}
      >
        <div className="language-button-content">
          {showFlags && (
            <span className="language-flag" aria-hidden="true">
              {currentLanguage.flag}
            </span>
          )}
          
          <span className="language-name">
            {getLanguageDisplayName(currentLanguage)}
          </span>
          
          {!compactMode && (
            <span className="dropdown-arrow" aria-hidden="true">
              {isOpen ? '▲' : '▼'}
            </span>
          )}
        </div>
        
        {isLoading && (
          <div className="button-loading-spinner" aria-hidden="true"></div>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="language-dropdown"
          role="listbox"
          aria-label="Select language"
        >
          {/* Search input */}
          {!compactMode && supportedLanguages.length > 10 && (
            <div className="language-search">
              <div className="search-input-container">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search languages"
                />
                
                {searchTerm && (
                  <button
                    className="clear-search-button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
                
                <span className="search-icon" aria-hidden="true">🔍</span>
              </div>
            </div>
          )}

          {/* Language options */}
          <div className="language-options">
            {filteredLanguages.length === 0 ? (
              <div className="no-languages-found">
                <span className="no-results-icon" aria-hidden="true">🔍</span>
                <span className="no-results-text">No languages found</span>
                {searchTerm && (
                  <button 
                    className="clear-search-link"
                    onClick={clearSearch}
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Popular languages section */}
                {!searchTerm && !compactMode && (
                  <>
                    <div className="language-section">
                      <div className="section-header">Popular Languages</div>
                      {getPopularLanguages().map((language) => (
                        <button
                          key={language.code}
                          className={`language-option ${language.code === currentLanguage.code ? 'current' : ''}`}
                          onClick={() => handleLanguageSelect(language.code)}
                          disabled={isLoading || language.code === currentLanguage.code}
                          role="option"
                          aria-selected={language.code === currentLanguage.code}
                          title={`Switch to ${language.name}`}
                        >
                          <div className="language-option-content">
                            {showFlags && (
                              <span className="language-flag" aria-hidden="true">
                                {language.flag}
                              </span>
                            )}
                            
                            <div className="language-info">
                              <span className="language-name">{language.name}</span>
                              {showNativeNames && language.nativeName !== language.name && (
                                <span className="language-native-name">{language.nativeName}</span>
                              )}
                            </div>
                            
                            {language.code === currentLanguage.code && (
                              <span className="current-indicator" aria-hidden="true">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Regional languages section */}
                    {getRegionalLanguages().length > 0 && (
                      <div className="language-section">
                        <div className="section-header">Other Languages</div>
                        {getRegionalLanguages().map((language) => (
                          <button
                            key={language.code}
                            className={`language-option ${language.code === currentLanguage.code ? 'current' : ''}`}
                            onClick={() => handleLanguageSelect(language.code)}
                            disabled={isLoading || language.code === currentLanguage.code}
                            role="option"
                            aria-selected={language.code === currentLanguage.code}
                            title={`Switch to ${language.name}`}
                          >
                            <div className="language-option-content">
                              {showFlags && (
                                <span className="language-flag" aria-hidden="true">
                                  {language.flag}
                                </span>
                              )}
                              
                              <div className="language-info">
                                <span className="language-name">{language.name}</span>
                                {showNativeNames && language.nativeName !== language.name && (
                                  <span className="language-native-name">{language.nativeName}</span>
                                )}
                              </div>
                              
                              {language.code === currentLanguage.code && (
                                <span className="current-indicator" aria-hidden="true">✓</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Filtered results (when searching or compact mode) */}
                {(searchTerm || compactMode) && (
                  <div className="language-section">
                    {filteredLanguages.map((language) => (
                      <button
                        key={language.code}
                        className={`language-option ${language.code === currentLanguage.code ? 'current' : ''}`}
                        onClick={() => handleLanguageSelect(language.code)}
                        disabled={isLoading || language.code === currentLanguage.code}
                        role="option"
                        aria-selected={language.code === currentLanguage.code}
                        title={`Switch to ${language.name}`}
                      >
                        <div className="language-option-content">
                          {showFlags && (
                            <span className="language-flag" aria-hidden="true">
                              {language.flag}
                            </span>
                          )}
                          
                          <div className="language-info">
                            <span className="language-name">{language.name}</span>
                            {showNativeNames && language.nativeName !== language.name && (
                              <span className="language-native-name">{language.nativeName}</span>
                            )}
                          </div>
                          
                          {language.code === currentLanguage.code && (
                            <span className="current-indicator" aria-hidden="true">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Translation stats (debug info) */}
          {process.env.NODE_ENV === 'development' && translationStats && (
            <div className="translation-stats">
              <div className="stats-header">Translation Stats</div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Cache:</span>
                  <span className="stat-value">{translationStats.cacheSize}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Offline:</span>
                  <span className="stat-value">{translationStats.offlineCacheSize}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Queue:</span>
                  <span className="stat-value">{translationStats.queueSize}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Online:</span>
                  <span className="stat-value">{translationStats.isOnline ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;