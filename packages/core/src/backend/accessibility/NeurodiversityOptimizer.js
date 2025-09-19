import React, { useState, useEffect, useContext, createContext } from 'react';
import { motion } from 'framer-motion';

// Context for neurodiversity settings
const NeurodiversityContext = createContext();

export const useNeurodiversity = () => {
  const context = useContext(NeurodiversityContext);
  if (!context) {
    throw new Error('useNeurodiversity must be used within NeurodiversityProvider');
  }
  return context;
};

// Provider component
export const NeurodiversityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('neurodiversity-settings');
    return saved ? JSON.parse(saved) : {
      dyslexiaMode: false,
      adhdMode: false,
      autismMode: false,
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      focusIndicators: true,
      readingGuide: false,
      colorBlindMode: 'none', // none, protanopia, deuteranopia, tritanopia
      cognitiveLoad: 'normal' // low, normal, high
    };
  });

  const [isOptimizing, setIsOptimizing] = useState(false);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('neurodiversity-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  // Apply settings to document
  const applySettings = (newSettings) => {
    const root = document.documentElement;
    
    // Dyslexia-friendly settings
    if (newSettings.dyslexiaMode) {
      root.style.setProperty('--font-family', 'OpenDyslexic, Arial, sans-serif');
      root.style.setProperty('--letter-spacing', '0.12em');
      root.style.setProperty('--line-height', '1.8');
    } else {
      root.style.removeProperty('--font-family');
      root.style.removeProperty('--letter-spacing');
      root.style.removeProperty('--line-height');
    }

    // ADHD-friendly settings
    if (newSettings.adhdMode) {
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      root.classList.add('adhd-mode');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
      root.classList.remove('adhd-mode');
    }

    // Autism-friendly settings
    if (newSettings.autismMode) {
      root.classList.add('autism-mode');
      root.style.setProperty('--sensory-reduction', 'true');
    } else {
      root.classList.remove('autism-mode');
      root.style.removeProperty('--sensory-reduction');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--motion-reduce', 'true');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--motion-reduce');
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (newSettings.largeText) {
      root.style.setProperty('--font-scale', '1.25');
    } else {
      root.style.removeProperty('--font-scale');
    }

    // Focus indicators
    if (newSettings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Reading guide
    if (newSettings.readingGuide) {
      root.classList.add('reading-guide');
    } else {
      root.classList.remove('reading-guide');
    }

    // Color blind mode
    if (newSettings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${newSettings.colorBlindMode}`);
    } else {
      root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    }

    // Cognitive load
    root.setAttribute('data-cognitive-load', newSettings.cognitiveLoad);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      dyslexiaMode: false,
      adhdMode: false,
      autismMode: false,
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      focusIndicators: true,
      readingGuide: false,
      colorBlindMode: 'none',
      cognitiveLoad: 'normal'
    });
  };

  const autoOptimize = async () => {
    setIsOptimizing(true);
    
    // Simulate AI-based optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Basic heuristics for auto-optimization
    const optimizedSettings = { ...settings };
    
    // Check for motion sensitivity
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      optimizedSettings.reducedMotion = true;
    }
    
    // Check for contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      optimizedSettings.highContrast = true;
    }
    
    // Check time of day for cognitive load
    const hour = new Date().getHours();
    if (hour < 9 || hour > 17) {
      optimizedSettings.cognitiveLoad = 'low';
    }
    
    setSettings(optimizedSettings);
    setIsOptimizing(false);
  };

  const value = {
    settings,
    updateSetting,
    resetSettings,
    autoOptimize,
    isOptimizing
  };

  return (
    <NeurodiversityContext.Provider value={value}>
      {children}
    </NeurodiversityContext.Provider>
  );
};

// Main optimizer component
const NeurodiversityOptimizer = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetSettings, autoOptimize, isOptimizing } = useNeurodiversity();
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'visual', label: 'Visual', icon: '👁️' },
    { id: 'cognitive', label: 'Cognitive', icon: '🧠' },
    { id: 'motor', label: 'Motor', icon: '✋' }
  ];

  return (
    <motion.div 
      className="neurodiversity-optimizer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="optimizer-header">
        <h2>Accessibility Optimizer</h2>
        <button className="close-button" onClick={onClose} aria-label="Close optimizer">
          ✕
        </button>
      </div>

      <div className="optimizer-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="optimizer-content">
        {activeTab === 'general' && (
          <div className="settings-group">
            <h3>General Settings</h3>
            
            <motion.button
              className="auto-optimize-button"
              onClick={autoOptimize}
              disabled={isOptimizing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isOptimizing ? '🔄 Optimizing...' : '🤖 Auto-Optimize'}
            </motion.button>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.focusIndicators}
                  onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                />
                Enhanced Focus Indicators
              </label>
              <p className="setting-description">Stronger visual focus indicators for keyboard navigation</p>
            </div>

            <div className="setting-item">
              <label>Cognitive Load Level:</label>
              <select
                value={settings.cognitiveLoad}
                onChange={(e) => updateSetting('cognitiveLoad', e.target.value)}
              >
                <option value="low">Low - Minimal distractions</option>
                <option value="normal">Normal - Standard interface</option>
                <option value="high">High - Information dense</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="settings-group">
            <h3>Visual Settings</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                />
                High Contrast Mode
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.largeText}
                  onChange={(e) => updateSetting('largeText', e.target.checked)}
                />
                Large Text
              </label>
            </div>

            <div className="setting-item">
              <label>Color Blind Support:</label>
              <select
                value={settings.colorBlindMode}
                onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="tritanopia">Tritanopia (Blue-blind)</option>
              </select>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.readingGuide}
                  onChange={(e) => updateSetting('readingGuide', e.target.checked)}
                />
                Reading Guide
              </label>
              <p className="setting-description">Highlight current line while reading</p>
            </div>
          </div>
        )}

        {activeTab === 'cognitive' && (
          <div className="settings-group">
            <h3>Cognitive Support</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.dyslexiaMode}
                  onChange={(e) => updateSetting('dyslexiaMode', e.target.checked)}
                />
                Dyslexia-Friendly Mode
              </label>
              <p className="setting-description">Optimized fonts and spacing for dyslexia</p>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.adhdMode}
                  onChange={(e) => updateSetting('adhdMode', e.target.checked)}
                />
                ADHD-Friendly Mode
              </label>
              <p className="setting-description">Reduced distractions and faster interactions</p>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autismMode}
                  onChange={(e) => updateSetting('autismMode', e.target.checked)}
                />
                Autism-Friendly Mode
              </label>
              <p className="setting-description">Sensory-friendly interface with predictable patterns</p>
            </div>
          </div>
        )}

        {activeTab === 'motor' && (
          <div className="settings-group">
            <h3>Motor & Motion</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                />
                Reduce Motion
              </label>
              <p className="setting-description">Minimize animations and transitions</p>
            </div>
          </div>
        )}
      </div>

      <div className="optimizer-footer">
        <button className="reset-button" onClick={resetSettings}>
          Reset to Defaults
        </button>
      </div>
    </motion.div>
  );
};

export default NeurodiversityOptimizer;