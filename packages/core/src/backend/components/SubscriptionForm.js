import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivacy } from '../utils/privacy-utils';

const SubscriptionForm = ({ 
  onSubscribe,
  onUnsubscribe,
  initialEmail = '',
  isSubscribed = false,
  showPreferences = true,
  compact = false,
  theme = 'light'
}) => {
  const [formData, setFormData] = useState({
    email: initialEmail,
    firstName: '',
    lastName: '',
    preferences: {
      frequency: 'weekly',
      topics: [],
      format: 'html'
    },
    gdprConsent: false,
    marketingConsent: false
  });

  const [formState, setFormState] = useState({
    isSubmitting: false,
    isSuccess: false,
    error: null,
    step: 1,
    showPreferences: false
  });

  const [validationErrors, setValidationErrors] = useState({});
  const { trackConsent, getConsentStatus } = usePrivacy();

  // Available topics for subscription
  const availableTopics = [
    { id: 'technology', label: 'Technology & Innovation', icon: '💻' },
    { id: 'business', label: 'Business & Finance', icon: '💼' },
    { id: 'security', label: 'Cybersecurity', icon: '🔒' },
    { id: 'ai', label: 'Artificial Intelligence', icon: '🤖' },
    { id: 'crypto', label: 'Cryptocurrency', icon: '₿' },
    { id: 'startups', label: 'Startups & Ventures', icon: '🚀' },
    { id: 'policy', label: 'Policy & Regulation', icon: '⚖️' },
    { id: 'research', label: 'Research & Analysis', icon: '📊' }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: 'Daily Digest', description: 'Get updates every day' },
    { value: 'weekly', label: 'Weekly Summary', description: 'Perfect weekly roundup' },
    { value: 'monthly', label: 'Monthly Report', description: 'Comprehensive monthly insights' }
  ];

  useEffect(() => {
    // Check existing consent status
    const consentStatus = getConsentStatus();
    if (consentStatus) {
      setFormData(prev => ({
        ...prev,
        gdprConsent: consentStatus.gdpr || false,
        marketingConsent: consentStatus.marketing || false
      }));
    }
  }, [getConsentStatus]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.gdprConsent) {
      errors.gdprConsent = 'You must accept the privacy policy to continue';
    }

    if (showPreferences && formData.preferences.topics.length === 0) {
      errors.topics = 'Please select at least one topic of interest';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleTopicToggle = (topicId) => {
    setFormData(prev => {
      const currentTopics = prev.preferences.topics;
      const newTopics = currentTopics.includes(topicId)
        ? currentTopics.filter(id => id !== topicId)
        : [...currentTopics, topicId];

      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          topics: newTopics
        }
      };
    });

    // Clear topics validation error
    if (validationErrors.topics) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.topics;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      // Track consent
      await trackConsent({
        gdpr: formData.gdprConsent,
        marketing: formData.marketingConsent,
        timestamp: new Date().toISOString(),
        source: 'subscription_form'
      });

      // Submit subscription
      if (onSubscribe) {
        await onSubscribe({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          preferences: formData.preferences,
          consents: {
            gdpr: formData.gdprConsent,
            marketing: formData.marketingConsent
          }
        });
      }

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true
      }));

      // Reset form after success
      setTimeout(() => {
        setFormState(prev => ({ ...prev, isSuccess: false }));
      }, 3000);

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error.message || 'An error occurred. Please try again.'
      }));
    }
  };

  const handleUnsubscribe = async () => {
    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      if (onUnsubscribe) {
        await onUnsubscribe(formData.email);
      }

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true
      }));

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error.message || 'An error occurred. Please try again.'
      }));
    }
  };

  const togglePreferences = () => {
    setFormState(prev => ({
      ...prev,
      showPreferences: !prev.showPreferences
    }));
  };

  if (isSubscribed) {
    return (
      <motion.div
        className={`subscription-form ${theme} subscribed`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="subscribed-content">
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
          >
            ✅
          </motion.div>
          <h3>You're subscribed!</h3>
          <p>Thank you for subscribing to Piper Dispatch. You'll receive our newsletter at {formData.email}.</p>
          
          <div className="subscribed-actions">
            <motion.button
              className="preferences-button"
              onClick={togglePreferences}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {formState.showPreferences ? 'Hide' : 'Manage'} Preferences
            </motion.button>
            
            <motion.button
              className="unsubscribe-button"
              onClick={handleUnsubscribe}
              disabled={formState.isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {formState.isSubmitting ? 'Processing...' : 'Unsubscribe'}
            </motion.button>
          </div>

          <AnimatePresence>
            {formState.showPreferences && (
              <motion.div
                className="preferences-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Preferences content would go here */}
                <p>Preference management coming soon...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`subscription-form ${theme} ${compact ? 'compact' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {formState.isSuccess ? (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
            >
              🎉
            </motion.div>
            <h3>Welcome aboard!</h3>
            <p>Thank you for subscribing to Piper Dispatch. Check your email for confirmation.</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="subscription-form-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!compact && (
              <div className="form-header">
                <h2>Stay Informed</h2>
                <p>Get the latest strategic intelligence delivered to your inbox.</p>
              </div>
            )}

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <motion.input
                type="email"
                id="email"
                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                whileFocus={{ scale: 1.02 }}
              />
              {validationErrors.email && (
                <motion.span
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {validationErrors.email}
                </motion.span>
              )}
            </div>

            {/* Name Fields */}
            {!compact && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <motion.input
                    type="text"
                    id="firstName"
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <motion.input
                    type="text"
                    id="lastName"
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
            )}

            {/* Preferences */}
            {showPreferences && !compact && (
              <motion.div
                className="preferences-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                {/* Frequency */}
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <div className="frequency-options">
                    {frequencyOptions.map((option) => (
                      <motion.label
                        key={option.value}
                        className={`frequency-option ${
                          formData.preferences.frequency === option.value ? 'selected' : ''
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={option.value}
                          checked={formData.preferences.frequency === option.value}
                          onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
                        />
                        <div className="option-content">
                          <span className="option-label">{option.label}</span>
                          <span className="option-description">{option.description}</span>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                <div className="form-group">
                  <label className="form-label">
                    Topics of Interest *
                  </label>
                  <div className="topics-grid">
                    {availableTopics.map((topic) => (
                      <motion.button
                        key={topic.id}
                        type="button"
                        className={`topic-button ${
                          formData.preferences.topics.includes(topic.id) ? 'selected' : ''
                        }`}
                        onClick={() => handleTopicToggle(topic.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="topic-icon">{topic.icon}</span>
                        <span className="topic-label">{topic.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  {validationErrors.topics && (
                    <motion.span
                      className="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {validationErrors.topics}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Consent Checkboxes */}
            <div className="consent-section">
              <motion.label
                className={`consent-checkbox ${validationErrors.gdprConsent ? 'error' : ''}`}
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="checkbox"
                  checked={formData.gdprConsent}
                  onChange={(e) => handleInputChange('gdprConsent', e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="consent-text">
                  I agree to the <a href="/privacy" target="_blank">Privacy Policy</a> and 
                  <a href="/terms" target="_blank">Terms of Service</a> *
                </span>
              </motion.label>
              {validationErrors.gdprConsent && (
                <motion.span
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {validationErrors.gdprConsent}
                </motion.span>
              )}

              <motion.label
                className="consent-checkbox"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="checkbox"
                  checked={formData.marketingConsent}
                  onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="consent-text">
                  I'd like to receive marketing communications and special offers
                </span>
              </motion.label>
            </div>

            {/* Error Message */}
            {formState.error && (
              <motion.div
                className="error-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formState.error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="submit-button"
              disabled={formState.isSubmitting}
              whileHover={{ scale: formState.isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: formState.isSubmitting ? 1 : 0.95 }}
            >
              {formState.isSubmitting ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  Subscribing...
                </span>
              ) : (
                'Subscribe Now'
              )}
            </motion.button>

            {!compact && (
              <p className="form-footer">
                No spam, ever. Unsubscribe at any time.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style jsx>{`
        .subscription-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 32px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .subscription-form.compact {
          padding: 24px;
          max-width: 400px;
        }

        .subscription-form.dark {
          background: #2d3748;
          border-color: #4a5568;
          color: white;
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .form-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
        }

        .dark .form-header h2 {
          color: white;
        }

        .form-header p {
          margin: 0;
          color: #718096;
          font-size: 16px;
        }

        .dark .form-header p {
          color: #a0aec0;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
        }

        .dark .form-label {
          color: white;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #f56565;
        }

        .dark .form-input {
          background: #4a5568;
          border-color: #718096;
          color: white;
        }

        .dark .form-input:focus {
          border-color: #667eea;
        }

        .error-message {
          display: block;
          margin-top: 4px;
          color: #f56565;
          font-size: 12px;
          font-weight: 500;
        }

        .frequency-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .frequency-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .frequency-option:hover {
          border-color: #cbd5e0;
        }

        .frequency-option.selected {
          border-color: #667eea;
          background: #f7fafc;
        }

        .dark .frequency-option {
          border-color: #4a5568;
        }

        .dark .frequency-option.selected {
          background: #4a5568;
        }

        .frequency-option input {
          margin: 0;
        }

        .option-content {
          display: flex;
          flex-direction: column;
        }

        .option-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 2px;
        }

        .dark .option-label {
          color: white;
        }

        .option-description {
          font-size: 12px;
          color: #718096;
        }

        .dark .option-description {
          color: #a0aec0;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .topic-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .topic-button:hover {
          border-color: #cbd5e0;
        }

        .topic-button.selected {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .dark .topic-button {
          background: #4a5568;
          border-color: #718096;
          color: white;
        }

        .topic-icon {
          font-size: 16px;
        }

        .topic-label {
          font-weight: 500;
        }

        .consent-section {
          margin: 24px 0;
        }

        .consent-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s ease;
        }

        .consent-checkbox:hover {
          background: #f7fafc;
        }

        .dark .consent-checkbox:hover {
          background: #4a5568;
        }

        .consent-checkbox.error {
          background: #fed7d7;
        }

        .dark .consent-checkbox.error {
          background: #742a2a;
        }

        .consent-checkbox input {
          margin: 0;
          width: 16px;
          height: 16px;
        }

        .consent-text {
          font-size: 14px;
          line-height: 1.5;
          color: #4a5568;
        }

        .dark .consent-text {
          color: #a0aec0;
        }

        .consent-text a {
          color: #667eea;
          text-decoration: none;
        }

        .consent-text a:hover {
          text-decoration: underline;
        }

        .error-banner {
          padding: 12px 16px;
          background: #fed7d7;
          border: 1px solid #feb2b2;
          border-radius: 6px;
          color: #c53030;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .dark .error-banner {
          background: #742a2a;
          border-color: #9b2c2c;
          color: #feb2b2;
        }

        .submit-button {
          width: 100%;
          padding: 16px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .form-footer {
          text-align: center;
          margin-top: 16px;
          font-size: 12px;
          color: #718096;
        }

        .dark .form-footer {
          color: #a0aec0;
        }

        .success-message {
          text-align: center;
          padding: 40px 20px;
        }

        .success-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .success-message h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #2d3748;
        }

        .dark .success-message h3 {
          color: white;
        }

        .success-message p {
          margin: 0;
          color: #718096;
          font-size: 16px;
        }

        .dark .success-message p {
          color: #a0aec0;
        }

        .subscribed-content {
          text-align: center;
        }

        .subscribed-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 24px 0;
        }

        .preferences-button,
        .unsubscribe-button {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #4a5568;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .preferences-button:hover {
          background: #f7fafc;
        }

        .unsubscribe-button {
          color: #e53e3e;
          border-color: #feb2b2;
        }

        .unsubscribe-button:hover {
          background: #fed7d7;
        }

        .preferences-panel {
          margin-top: 20px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          text-align: left;
        }

        .dark .preferences-panel {
          background: #4a5568;
        }

        @media (max-width: 768px) {
          .subscription-form {
            padding: 24px 20px;
            margin: 0 16px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .topics-grid {
            grid-template-columns: 1fr;
          }

          .subscribed-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SubscriptionForm;