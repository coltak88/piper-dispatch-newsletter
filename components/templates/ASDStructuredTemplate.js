import React, { useState, useEffect, useRef } from 'react';
import { trackPrivacyCompliantEvent, trackAccessibilityUsage } from '../../privacy/tracking';
import { privacyStorage } from '../../privacy/dataHandler';

/**
 * ASD-Structured Newsletter Template
 * Features:
 * - Predictable, consistent layout patterns
 * - Minimal sensory overload
 * - Clear visual hierarchy
 * - Structured step-by-step workflow
 * - Reduced cognitive load
 * - Zero data retention
 * - Privacy-first design
 */
const ASDStructuredTemplate = ({ 
  content = {},
  onContentChange = () => {},
  privacyMode = 'strict'
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [sensoryMode, setSensoryMode] = useState('minimal');
  const [structureLevel, setStructureLevel] = useState('high');
  const [visualComplexity, setVisualComplexity] = useState('simple');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const contentRef = useRef(null);
  const purgeTimerRef = useRef(null);
  const stepRefs = useRef({});

  // Structured workflow steps
  const workflowSteps = [
    {
      id: 1,
      title: 'Newsletter Title',
      description: 'Create a clear, specific title',
      field: 'title',
      type: 'text',
      maxLength: 50,
      placeholder: 'Newsletter Title (be specific)',
      validation: (value) => value && value.length >= 5,
      tips: ['Use clear, simple words', 'Avoid complex phrases', 'Be specific about the topic']
    },
    {
      id: 2,
      title: 'Main Topic',
      description: 'What is the main subject?',
      field: 'mainTopic',
      type: 'text',
      maxLength: 100,
      placeholder: 'The main topic of this newsletter',
      validation: (value) => value && value.length >= 10,
      tips: ['One clear topic only', 'Avoid multiple subjects', 'Be direct and specific']
    },
    {
      id: 3,
      title: 'Key Points',
      description: 'List 3-5 main points',
      field: 'keyPoints',
      type: 'structured-list',
      maxItems: 5,
      placeholder: 'Enter one key point per line',
      validation: (value) => value && value.split('\n').filter(line => line.trim()).length >= 3,
      tips: ['One point per line', 'Use simple sentences', 'Keep points related to main topic']
    },
    {
      id: 4,
      title: 'Detailed Content',
      description: 'Expand on your key points',
      field: 'detailedContent',
      type: 'structured-text',
      placeholder: 'Explain each key point in detail',
      validation: (value) => value && value.length >= 100,
      tips: ['Follow the same order as key points', 'Use clear paragraphs', 'One idea per paragraph']
    },
    {
      id: 5,
      title: 'Action Step',
      description: 'What should readers do next?',
      field: 'actionStep',
      type: 'text',
      maxLength: 80,
      placeholder: 'One clear action for readers',
      validation: (value) => value && value.length >= 10,
      tips: ['One action only', 'Be specific', 'Make it achievable']
    },
    {
      id: 6,
      title: 'Review & Finalize',
      description: 'Check your newsletter',
      field: 'review',
      type: 'review',
      validation: () => true,
      tips: ['Read through everything', 'Check for clarity', 'Ensure consistency']
    }
  ];

  // Privacy-first data handling with auto-purge
  useEffect(() => {
    // Start 15-second purge timer
    purgeTimerRef.current = setInterval(() => {
      purgeLocalData();
    }, 15000);

    // Initialize step tracking
    trackAccessibilityUsage('asd_template_initialized', true);

    return () => {
      if (purgeTimerRef.current) {
        clearInterval(purgeTimerRef.current);
      }
      purgeLocalData();
    };
  }, []);

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
    
    trackPrivacyCompliantEvent('asd_data_purged', {
      timestamp: Date.now(),
      component: 'ASDStructuredTemplate',
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
    
    // Check if step is completed
    const step = workflowSteps.find(s => s.field === field);
    if (step && step.validation(value)) {
      setCompletedSteps(prev => new Set([...prev, step.id]));
      playCompletionSound();
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(step?.id);
        return newSet;
      });
    }
    
    trackPrivacyCompliantEvent('asd_content_updated', {
      field: field,
      hasContent: !!value,
      stepCompleted: step?.validation(value) || false,
      timestamp: Date.now(),
      retention: false
    });
  };

  const navigateToStep = (stepId) => {
    setCurrentStep(stepId);
    
    // Scroll to step
    if (stepRefs.current[stepId]) {
      stepRefs.current[stepId].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
    
    trackAccessibilityUsage('asd_step_navigated', true);
  };

  const goToNextStep = () => {
    if (currentStep < workflowSteps.length) {
      navigateToStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1);
    }
  };

  const playCompletionSound = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Simple completion sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  const adjustSensoryMode = (mode) => {
    setSensoryMode(mode);
    trackAccessibilityUsage('asd_sensory_mode_changed', true);
  };

  const adjustStructureLevel = (level) => {
    setStructureLevel(level);
    trackAccessibilityUsage('asd_structure_level_changed', true);
  };

  const adjustVisualComplexity = (complexity) => {
    setVisualComplexity(complexity);
    trackAccessibilityUsage('asd_visual_complexity_changed', true);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    trackAccessibilityUsage('asd_sound_toggled', !soundEnabled);
  };

  const getCurrentStep = () => {
    return workflowSteps.find(step => step.id === currentStep);
  };

  const getProgressPercentage = () => {
    return Math.round((completedSteps.size / workflowSteps.length) * 100);
  };

  const renderStepContent = (step) => {
    const value = localContent[step.field] || '';
    const isCompleted = completedSteps.has(step.id);
    const isCurrent = currentStep === step.id;

    switch (step.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleContentUpdate(step.field, e.target.value)}
            className={`asd-input ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            placeholder={step.placeholder}
            maxLength={step.maxLength}
            autoComplete="off"
          />
        );
      
      case 'structured-list':
        return (
          <textarea
            value={value}
            onChange={(e) => handleContentUpdate(step.field, e.target.value)}
            className={`asd-textarea structured-list ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            placeholder={step.placeholder}
            rows={step.maxItems || 5}
          />
        );
      
      case 'structured-text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleContentUpdate(step.field, e.target.value)}
            className={`asd-textarea structured-text ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            placeholder={step.placeholder}
            rows={8}
          />
        );
      
      case 'review':
        return (
          <div className="review-section">
            <div className="review-summary">
              <h4>Newsletter Summary:</h4>
              <div className="summary-item">
                <strong>Title:</strong> {localContent.title || 'Not set'}
              </div>
              <div className="summary-item">
                <strong>Main Topic:</strong> {localContent.mainTopic || 'Not set'}
              </div>
              <div className="summary-item">
                <strong>Key Points:</strong> 
                <div className="key-points-preview">
                  {(localContent.keyPoints || '').split('\n').filter(line => line.trim()).map((point, index) => (
                    <div key={index} className="point-preview">• {point}</div>
                  ))}
                </div>
              </div>
              <div className="summary-item">
                <strong>Action Step:</strong> {localContent.actionStep || 'Not set'}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`asd-template sensory-${sensoryMode} structure-${structureLevel} visual-${visualComplexity}`}>
      {/* Privacy Notice */}
      <div className="privacy-notice">
        <span className="privacy-indicator">🔒</span>
        <span>ASD-Structured • Predictable patterns • Zero data retention • 15s auto-purge</span>
      </div>

      {/* ASD-Specific Controls */}
      <div className="asd-controls">
        <div className="control-section">
          <h3>Sensory Settings</h3>
          <div className="control-group">
            <button 
              onClick={() => adjustSensoryMode('minimal')}
              className={`control-btn ${sensoryMode === 'minimal' ? 'active' : ''}`}
            >
              🔇 Minimal
            </button>
            <button 
              onClick={() => adjustSensoryMode('reduced')}
              className={`control-btn ${sensoryMode === 'reduced' ? 'active' : ''}`}
            >
              🔉 Reduced
            </button>
            <button 
              onClick={() => adjustSensoryMode('standard')}
              className={`control-btn ${sensoryMode === 'standard' ? 'active' : ''}`}
            >
              🔊 Standard
            </button>
            <button 
              onClick={toggleSound}
              className={`control-btn ${soundEnabled ? 'active' : ''}`}
            >
              {soundEnabled ? '🔔' : '🔕'} Completion Sounds
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>Structure Level</h3>
          <div className="control-group">
            <button 
              onClick={() => adjustStructureLevel('maximum')}
              className={`control-btn ${structureLevel === 'maximum' ? 'active' : ''}`}
            >
              📋 Maximum
            </button>
            <button 
              onClick={() => adjustStructureLevel('high')}
              className={`control-btn ${structureLevel === 'high' ? 'active' : ''}`}
            >
              📝 High
            </button>
            <button 
              onClick={() => adjustStructureLevel('medium')}
              className={`control-btn ${structureLevel === 'medium' ? 'active' : ''}`}
            >
              📄 Medium
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>Visual Complexity</h3>
          <div className="control-group">
            <button 
              onClick={() => adjustVisualComplexity('simple')}
              className={`control-btn ${visualComplexity === 'simple' ? 'active' : ''}`}
            >
              ⚪ Simple
            </button>
            <button 
              onClick={() => adjustVisualComplexity('moderate')}
              className={`control-btn ${visualComplexity === 'moderate' ? 'active' : ''}`}
            >
              🔘 Moderate
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Progress: {getProgressPercentage()}% Complete</h3>
          <div className="step-counter">
            Step {currentStep} of {workflowSteps.length}
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="step-indicators">
          {workflowSteps.map(step => (
            <button
              key={step.id}
              onClick={() => navigateToStep(step.id)}
              className={`step-indicator ${
                completedSteps.has(step.id) ? 'completed' : ''
              } ${currentStep === step.id ? 'current' : ''}`}
              title={step.title}
            >
              {completedSteps.has(step.id) ? '✓' : step.id}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-section">
        <button 
          onClick={goToPreviousStep}
          disabled={currentStep === 1}
          className="nav-btn prev-btn"
        >
          ← Previous Step
        </button>
        <div className="current-step-info">
          <strong>{getCurrentStep()?.title}</strong>
        </div>
        <button 
          onClick={goToNextStep}
          disabled={currentStep === workflowSteps.length}
          className="nav-btn next-btn"
        >
          Next Step →
        </button>
      </div>

      {/* Main Content Area */}
      <div className="workflow-container">
        {workflowSteps.map(step => (
          <div
            key={step.id}
            ref={el => stepRefs.current[step.id] = el}
            className={`workflow-step ${
              currentStep === step.id ? 'active' : ''
            } ${completedSteps.has(step.id) ? 'completed' : ''}`}
          >
            <div className="step-header">
              <div className="step-number">
                {completedSteps.has(step.id) ? '✓' : step.id}
              </div>
              <div className="step-title-section">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              <div className="step-status">
                {completedSteps.has(step.id) ? (
                  <span className="status-completed">✓ Complete</span>
                ) : (
                  <span className="status-pending">○ Pending</span>
                )}
              </div>
            </div>

            <div className="step-content">
              {renderStepContent(step)}
              
              {step.tips && (
                <div className="step-tips">
                  <h4>💡 Tips:</h4>
                  <ul>
                    {step.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {step.maxLength && (
                <div className="character-count">
                  {(localContent[step.field] || '').length}/{step.maxLength} characters
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ASD-Specific Features */}
      <div className="asd-features">
        <div className="feature-indicator">
          <span className="feature-icon">🧩</span>
          <span>ASD-Structured</span>
        </div>
        <div className="feature-indicator">
          <span className="feature-icon">📋</span>
          <span>Predictable Workflow</span>
        </div>
        <div className="feature-indicator">
          <span className="feature-icon">🔇</span>
          <span>Sensory Control</span>
        </div>
        <div className="feature-indicator">
          <span className="feature-icon">📊</span>
          <span>Clear Progress</span>
        </div>
      </div>

      <style jsx>{`
        .asd-template {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        /* Sensory Mode Variations */
        .sensory-minimal {
          background: #ffffff;
          color: #333333;
        }
        
        .sensory-minimal * {
          animation: none !important;
          transition: none !important;
        }
        
        .sensory-reduced {
          background: #fafafa;
          color: #444444;
        }
        
        .sensory-reduced * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }

        /* Structure Level Variations */
        .structure-maximum .workflow-step {
          border: 3px solid #e1e5e9;
          margin-bottom: 32px;
          padding: 24px;
        }
        
        .structure-high .workflow-step {
          border: 2px solid #e1e5e9;
          margin-bottom: 24px;
          padding: 20px;
        }
        
        .structure-medium .workflow-step {
          border: 1px solid #e1e5e9;
          margin-bottom: 16px;
          padding: 16px;
        }

        /* Visual Complexity Variations */
        .visual-simple {
          --primary-color: #007bff;
          --secondary-color: #6c757d;
          --success-color: #28a745;
          --border-radius: 8px;
        }
        
        .visual-moderate {
          --primary-color: #0056b3;
          --secondary-color: #495057;
          --success-color: #1e7e34;
          --border-radius: 12px;
        }

        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #e8f5e8;
          border: 2px solid #28a745;
          border-radius: var(--border-radius, 8px);
          margin-bottom: 24px;
          font-weight: 600;
          color: #155724;
        }

        .asd-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: var(--border-radius, 8px);
          border: 2px solid #dee2e6;
        }

        .control-section h3 {
          margin: 0 0 16px 0;
          color: var(--secondary-color, #495057);
          font-weight: 700;
          font-size: 1.1em;
        }

        .control-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .control-btn {
          padding: 10px 16px;
          background: #ffffff;
          border: 2px solid #dee2e6;
          border-radius: var(--border-radius, 8px);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          font-family: inherit;
          font-size: 0.9em;
        }

        .control-btn:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .control-btn.active {
          background: var(--primary-color, #007bff);
          color: white;
          border-color: var(--primary-color, #007bff);
        }

        .progress-section {
          margin-bottom: 32px;
          padding: 20px;
          background: #ffffff;
          border: 2px solid #e1e5e9;
          border-radius: var(--border-radius, 8px);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .progress-header h3 {
          margin: 0;
          color: var(--secondary-color, #495057);
        }

        .step-counter {
          font-weight: 600;
          color: var(--primary-color, #007bff);
          background: #e3f2fd;
          padding: 6px 12px;
          border-radius: var(--border-radius, 8px);
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: #e9ecef;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color, #007bff), var(--success-color, #28a745));
          transition: width 0.5s ease;
        }

        .step-indicators {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .step-indicator {
          width: 40px;
          height: 40px;
          border: 2px solid #dee2e6;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-indicator:hover {
          background: #e9ecef;
          transform: scale(1.1);
        }

        .step-indicator.current {
          background: var(--primary-color, #007bff);
          color: white;
          border-color: var(--primary-color, #007bff);
        }

        .step-indicator.completed {
          background: var(--success-color, #28a745);
          color: white;
          border-color: var(--success-color, #28a745);
        }

        .navigation-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 16px 20px;
          background: #f8f9fa;
          border-radius: var(--border-radius, 8px);
          border: 2px solid #dee2e6;
        }

        .nav-btn {
          padding: 12px 24px;
          background: var(--primary-color, #007bff);
          color: white;
          border: none;
          border-radius: var(--border-radius, 8px);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .nav-btn:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-2px);
        }

        .nav-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .current-step-info {
          text-align: center;
          color: var(--secondary-color, #495057);
        }

        .workflow-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .workflow-step {
          background: #ffffff;
          border-radius: var(--border-radius, 8px);
          transition: all 0.3s ease;
          opacity: 0.7;
        }

        .workflow-step.active {
          opacity: 1;
          box-shadow: 0 8px 24px rgba(0, 123, 255, 0.15);
          border-color: var(--primary-color, #007bff) !important;
        }

        .workflow-step.completed {
          opacity: 0.9;
          border-color: var(--success-color, #28a745) !important;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e1e5e9;
        }

        .step-number {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2em;
          color: var(--secondary-color, #495057);
        }

        .workflow-step.active .step-number {
          background: var(--primary-color, #007bff);
          color: white;
        }

        .workflow-step.completed .step-number {
          background: var(--success-color, #28a745);
          color: white;
        }

        .step-title-section {
          flex: 1;
        }

        .step-title {
          margin: 0 0 8px 0;
          color: var(--secondary-color, #495057);
          font-size: 1.3em;
        }

        .step-description {
          margin: 0;
          color: #6c757d;
          font-size: 0.95em;
        }

        .step-status {
          font-weight: 600;
        }

        .status-completed {
          color: var(--success-color, #28a745);
        }

        .status-pending {
          color: #6c757d;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .asd-input, .asd-textarea {
          padding: 16px 20px;
          border: 2px solid #e1e5e9;
          border-radius: var(--border-radius, 8px);
          font-family: inherit;
          font-size: 1.1em;
          line-height: 1.6;
          background: #ffffff;
          transition: all 0.3s ease;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        .asd-input:focus, .asd-textarea:focus {
          border-color: var(--primary-color, #007bff);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
          background: #f8f9fa;
        }

        .asd-input.completed, .asd-textarea.completed {
          border-color: var(--success-color, #28a745);
          background: #f8fff8;
        }

        .asd-input.current, .asd-textarea.current {
          border-color: var(--primary-color, #007bff);
          background: #f0f8ff;
        }

        .structured-list {
          font-family: 'Courier New', monospace;
          line-height: 1.8;
        }

        .structured-text {
          min-height: 200px;
          resize: vertical;
        }

        .step-tips {
          background: #e3f2fd;
          padding: 16px 20px;
          border-radius: var(--border-radius, 8px);
          border-left: 4px solid var(--primary-color, #007bff);
        }

        .step-tips h4 {
          margin: 0 0 12px 0;
          color: #1565c0;
          font-size: 1em;
        }

        .step-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .step-tips li {
          margin-bottom: 8px;
          color: #1565c0;
        }

        .character-count {
          text-align: right;
          font-size: 0.85em;
          color: #6c757d;
          font-weight: 600;
        }

        .review-section {
          background: #f8f9fa;
          padding: 24px;
          border-radius: var(--border-radius, 8px);
          border: 2px solid #dee2e6;
        }

        .review-summary h4 {
          margin: 0 0 20px 0;
          color: var(--secondary-color, #495057);
        }

        .summary-item {
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #ffffff;
          border-radius: var(--border-radius, 8px);
          border: 1px solid #dee2e6;
        }

        .summary-item strong {
          color: var(--primary-color, #007bff);
          display: block;
          margin-bottom: 8px;
        }

        .key-points-preview {
          margin-top: 8px;
        }

        .point-preview {
          padding: 4px 0;
          color: var(--secondary-color, #495057);
        }

        .asd-features {
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
          color: var(--secondary-color, #495057);
        }

        .feature-icon {
          font-size: 1.2em;
        }

        @media (max-width: 768px) {
          .asd-template {
            padding: 16px;
            margin: 8px;
          }

          .asd-controls {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .navigation-section {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .step-header {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .asd-features {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          .asd-input, .asd-textarea, .workflow-step {
            border-width: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default ASDStructuredTemplate;