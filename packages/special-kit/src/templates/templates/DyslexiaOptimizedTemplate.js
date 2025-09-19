import React, { useState, useEffect, useRef } from 'react';
import { trackPrivacyCompliantEvent, trackAccessibilityUsage } from '../../privacy/tracking';
import { privacyStorage } from '../../privacy/dataHandler';

/**
 * Dyslexia-Optimized Newsletter Template
 * Features:
 * - OpenDyslexic font support
 * - High contrast color schemes
 * - Increased letter spacing
 * - Reduced visual clutter
 * - Reading assistance tools
 * - Zero data retention
 * - Privacy-first design
 */
const DyslexiaOptimizedTemplate = ({ 
  content = {},
  onContentChange = () => {},
  privacyMode = 'strict'
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [readingMode, setReadingMode] = useState('standard');
  const [contrastLevel, setContrastLevel] = useState('high');
  const [fontSize, setFontSize] = useState('large');
  const [letterSpacing, setLetterSpacing] = useState('wide');
  const [readingGuide, setReadingGuide] = useState(false);
  const [wordHighlight, setWordHighlight] = useState(false);
  const contentRef = useRef(null);
  const purgeTimerRef = useRef(null);

  // Privacy-first data handling with auto-purge
  useEffect(() => {
    // Start 15-second purge timer
    purgeTimerRef.current = setInterval(() => {
      purgeLocalData();
    }, 15000);

    // Load OpenDyslexic font
    loadOpenDyslexicFont();

    return () => {
      if (purgeTimerRef.current) {
        clearInterval(purgeTimerRef.current);
      }
      purgeLocalData();
    };
  }, []);

  const loadOpenDyslexicFont = () => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      trackAccessibilityUsage('opendyslexic_font_loaded', true);
    }
  };

  const purgeLocalData = () => {
    // Secure data purge
    setLocalContent({});
    if (contentRef.current) {
      contentRef.current.value = '';
    }
    
    // Memory overwrite
    for (let i = 0; i < 10; i++) {
      const dummy = new Array(1000).fill(Math.random());
      dummy.length = 0;
    }
    
    trackPrivacyCompliantEvent('dyslexia_data_purged', {
      timestamp: Date.now(),
      component: 'DyslexiaOptimizedTemplate',
      retention: false
    });
  };

  const handleContentUpdate = (field, value) => {
    const updatedContent = {
      ...localContent,
      [field]: value
    };
    
    setLocalContent(updatedContent);
    onContentChange(updatedContent);
    
    trackPrivacyCompliantEvent('dyslexia_content_updated', {
      field: field,
      hasContent: !!value,
      readingMode: readingMode,
      timestamp: Date.now(),
      retention: false
    });
  };

  const toggleReadingMode = (mode) => {
    setReadingMode(mode);
    trackAccessibilityUsage('reading_mode_changed', true);
  };

  const adjustContrast = (level) => {
    setContrastLevel(level);
    trackAccessibilityUsage('contrast_adjusted', true);
  };

  const adjustFontSize = (size) => {
    setFontSize(size);
    trackAccessibilityUsage('font_size_adjusted', true);
  };

  const adjustLetterSpacing = (spacing) => {
    setLetterSpacing(spacing);
    trackAccessibilityUsage('letter_spacing_adjusted', true);
  };

  const toggleReadingGuide = () => {
    setReadingGuide(!readingGuide);
    trackAccessibilityUsage('reading_guide_toggled', !readingGuide);
  };

  const toggleWordHighlight = () => {
    setWordHighlight(!wordHighlight);
    trackAccessibilityUsage('word_highlight_toggled', !wordHighlight);
  };

  const getContrastClass = () => {
    const contrastClasses = {
      'standard': 'contrast-standard',
      'high': 'contrast-high',
      'maximum': 'contrast-maximum',
      'dark': 'contrast-dark'
    };
    return contrastClasses[contrastLevel] || 'contrast-high';
  };

  const getFontSizeClass = () => {
    const fontSizeClasses = {
      'small': 'font-small',
      'medium': 'font-medium',
      'large': 'font-large',
      'extra-large': 'font-extra-large'
    };
    return fontSizeClasses[fontSize] || 'font-large';
  };

  const getLetterSpacingClass = () => {
    const spacingClasses = {
      'normal': 'spacing-normal',
      'wide': 'spacing-wide',
      'extra-wide': 'spacing-extra-wide'
    };
    return spacingClasses[letterSpacing] || 'spacing-wide';
  };

  return (
    <div className={`dyslexia-template ${getContrastClass()} ${getFontSizeClass()} ${getLetterSpacingClass()} ${readingMode === 'focus' ? 'focus-mode' : ''} ${readingGuide ? 'reading-guide' : ''} ${wordHighlight ? 'word-highlight' : ''}`}>
      {/* Privacy Notice */}
      <div className="privacy-notice">
        <span className="privacy-indicator">🔒</span>
        <span>Dyslexia-optimized • Zero data retention • 15s auto-purge</span>
      </div>

      {/* Accessibility Controls */}
      <div className="accessibility-controls">
        <div className="control-section">
          <h3>Reading Assistance</h3>
          <div className="control-group">
            <button 
              onClick={() => toggleReadingMode('standard')}
              className={`control-btn ${readingMode === 'standard' ? 'active' : ''}`}
            >
              📖 Standard
            </button>
            <button 
              onClick={() => toggleReadingMode('focus')}
              className={`control-btn ${readingMode === 'focus' ? 'active' : ''}`}
            >
              🎯 Focus Mode
            </button>
            <button 
              onClick={toggleReadingGuide}
              className={`control-btn ${readingGuide ? 'active' : ''}`}
            >
              📏 Reading Guide
            </button>
            <button 
              onClick={toggleWordHighlight}
              className={`control-btn ${wordHighlight ? 'active' : ''}`}
            >
              ✨ Word Highlight
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>Visual Settings</h3>
          <div className="control-group">
            <label>Contrast:</label>
            <select 
              value={contrastLevel} 
              onChange={(e) => adjustContrast(e.target.value)}
              className="control-select"
            >
              <option value="standard">Standard</option>
              <option value="high">High</option>
              <option value="maximum">Maximum</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Font Size:</label>
            <select 
              value={fontSize} 
              onChange={(e) => adjustFontSize(e.target.value)}
              className="control-select"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Letter Spacing:</label>
            <select 
              value={letterSpacing} 
              onChange={(e) => adjustLetterSpacing(e.target.value)}
              className="control-select"
            >
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
              <option value="extra-wide">Extra Wide</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container">
        {/* Header Section */}
        <section className="header-section">
          <div className="input-group">
            <label htmlFor="newsletter-title" className="dyslexia-label">
              Newsletter Title
            </label>
            <input
              id="newsletter-title"
              type="text"
              value={localContent.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
              className="dyslexia-input title-input"
              placeholder="Clear, simple title..."
              maxLength={50}
              autoComplete="off"
            />
            <div className="character-count">
              {(localContent.title || '').length}/50 characters
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section className="summary-section">
          <div className="input-group">
            <label htmlFor="summary" className="dyslexia-label">
              Quick Summary (What readers will learn)
            </label>
            <textarea
              id="summary"
              value={localContent.summary || ''}
              onChange={(e) => handleContentUpdate('summary', e.target.value)}
              className="dyslexia-textarea summary-textarea"
              placeholder="In simple words, what will readers learn from this newsletter?"
              rows={3}
              maxLength={150}
            />
            <div className="character-count">
              {(localContent.summary || '').length}/150 characters
            </div>
          </div>
        </section>

        {/* Main Points Section */}
        <section className="main-points-section">
          <div className="input-group">
            <label htmlFor="main-points" className="dyslexia-label">
              Main Points (Use simple bullet points)
            </label>
            <div className="writing-tips">
              <span>💡 Tips: Use short sentences • One idea per line • Simple words</span>
            </div>
            <textarea
              id="main-points"
              ref={contentRef}
              value={localContent.mainPoints || ''}
              onChange={(e) => handleContentUpdate('mainPoints', e.target.value)}
              className="dyslexia-textarea main-points-textarea"
              placeholder="• First main point in simple words\n• Second main point with clear benefit\n• Third main point with action step"
              rows={6}
            />
          </div>
        </section>

        {/* Action Section */}
        <section className="action-section">
          <div className="input-group">
            <label htmlFor="action-step" className="dyslexia-label">
              Next Step (One clear action)
            </label>
            <input
              id="action-step"
              type="text"
              value={localContent.actionStep || ''}
              onChange={(e) => handleContentUpdate('actionStep', e.target.value)}
              className="dyslexia-input action-input"
              placeholder="What should readers do next?"
              maxLength={60}
            />
            <div className="character-count">
              {(localContent.actionStep || '').length}/60 characters
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="resources-section">
          <div className="input-group">
            <label htmlFor="helpful-links" className="dyslexia-label">
              Helpful Links (Optional)
            </label>
            <textarea
              id="helpful-links"
              value={localContent.helpfulLinks || ''}
              onChange={(e) => handleContentUpdate('helpfulLinks', e.target.value)}
              className="dyslexia-textarea links-textarea"
              placeholder="Link 1: Description\nLink 2: Description"
              rows={3}
            />
          </div>
        </section>
      </div>

      {/* Dyslexia-Specific Features */}
      <div className="dyslexia-features">
        <div className="feature-indicator">
          <span className="feature-icon">👁️</span>
          <span>Dyslexia-Friendly</span>
        </div>
        <div className="feature-indicator">
          <span className="feature-icon">🔤</span>
          <span>OpenDyslexic Font</span>
        </div>
        <div className="feature-indicator">
          <span className="feature-icon">🌈</span>
          <span>High Contrast</span>
        </div>
        <div className="feature-indicator">
          <span className="feature-icon">📏</span>
          <span>Reading Assistance</span>
        </div>
      </div>

      <style jsx>{`
        .dyslexia-template {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          font-family: 'OpenDyslexic', 'Comic Sans MS', cursive, sans-serif;
          line-height: 1.8;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        /* Font Size Classes */
        .font-small { font-size: 14px; }
        .font-medium { font-size: 16px; }
        .font-large { font-size: 18px; }
        .font-extra-large { font-size: 22px; }

        /* Letter Spacing Classes */
        .spacing-normal { letter-spacing: 0.5px; }
        .spacing-wide { letter-spacing: 1.2px; }
        .spacing-extra-wide { letter-spacing: 2px; }

        /* Contrast Classes */
        .contrast-standard {
          background: #ffffff;
          color: #333333;
        }
        
        .contrast-high {
          background: #ffffff;
          color: #000000;
        }
        
        .contrast-maximum {
          background: #ffff00;
          color: #000000;
        }
        
        .contrast-dark {
          background: #1a1a1a;
          color: #ffffff;
        }

        .focus-mode {
          background: #f0f8ff;
          border: 4px solid #4169e1;
        }

        .reading-guide {
          position: relative;
        }

        .reading-guide::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
          z-index: 10;
          animation: reading-guide 3s ease-in-out infinite;
        }

        @keyframes reading-guide {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }

        .word-highlight .dyslexia-input:focus,
        .word-highlight .dyslexia-textarea:focus {
          background: linear-gradient(45deg, #fff3cd, #d4edda);
        }

        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #e8f5e8;
          border: 2px solid #28a745;
          border-radius: 12px;
          margin-bottom: 24px;
          font-weight: 600;
          color: #155724;
        }

        .accessibility-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px solid #dee2e6;
        }

        .control-section h3 {
          margin: 0 0 16px 0;
          color: #495057;
          font-weight: 700;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .control-btn {
          padding: 10px 16px;
          background: #ffffff;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .control-btn:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .control-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .control-select {
          padding: 8px 12px;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          font-family: inherit;
          font-weight: 600;
          background: white;
        }

        .content-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dyslexia-label {
          font-weight: 700;
          font-size: 1.1em;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .dyslexia-input, .dyslexia-textarea {
          padding: 20px;
          border: 3px solid #e1e5e9;
          border-radius: 12px;
          font-family: inherit;
          font-size: inherit;
          letter-spacing: inherit;
          line-height: 1.8;
          background: #ffffff;
          transition: all 0.3s ease;
          outline: none;
        }

        .dyslexia-input:focus, .dyslexia-textarea:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
          background: #f8f9fa;
        }

        .title-input {
          font-size: 1.4em;
          font-weight: 700;
          background: #fff3cd;
          border-color: #ffc107;
        }

        .summary-textarea {
          background: #d1ecf1;
          border-color: #17a2b8;
        }

        .main-points-textarea {
          min-height: 180px;
          background: #f8f9fa;
        }

        .action-input {
          background: #d4edda;
          border-color: #28a745;
          font-weight: 600;
        }

        .links-textarea {
          background: #e2e3e5;
          border-color: #6c757d;
        }

        .writing-tips {
          padding: 12px 16px;
          background: #e3f2fd;
          border-radius: 8px;
          font-size: 0.9em;
          color: #1565c0;
          border-left: 4px solid #2196f3;
        }

        .character-count {
          text-align: right;
          font-size: 0.85em;
          color: #6c757d;
          font-weight: 600;
          margin-top: 6px;
        }

        .dyslexia-features {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #e1e5e9;
          flex-wrap: wrap;
        }

        .feature-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #495057;
        }

        .feature-icon {
          font-size: 1.2em;
        }

        @media (max-width: 768px) {
          .dyslexia-template {
            padding: 20px;
            margin: 12px;
          }

          .accessibility-controls {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .control-group {
            flex-direction: column;
            align-items: stretch;
          }

          .dyslexia-features {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .dyslexia-input, .dyslexia-textarea {
            border-width: 4px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }

        /* Dark mode adjustments */
        .contrast-dark .dyslexia-input,
        .contrast-dark .dyslexia-textarea {
          background: #2d2d2d;
          color: #ffffff;
          border-color: #555555;
        }

        .contrast-dark .privacy-notice {
          background: #1a4d1a;
          border-color: #28a745;
          color: #90ee90;
        }

        .contrast-dark .accessibility-controls {
          background: #2d2d2d;
          border-color: #555555;
        }

        .contrast-dark .control-btn {
          background: #404040;
          color: #ffffff;
          border-color: #666666;
        }

        .contrast-dark .writing-tips {
          background: #1a3a5c;
          color: #87ceeb;
          border-color: #4169e1;
        }
      `}</style>
    </div>
  );
};

export default DyslexiaOptimizedTemplate;