import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FeedbackSystem = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    type: 'general',
    rating: 5,
    message: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'content', label: 'Content Suggestion' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(feedback);
      }
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFeedback({ type: 'general', rating: 5, message: '', email: '' });
      }, 2000);
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="feedback-system">
      <motion.button
        className="feedback-trigger"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open feedback form"
      >
        💬 Feedback
      </motion.button>

      {isOpen && (
        <motion.div 
          className="feedback-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            className="feedback-modal-content"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="feedback-modal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close feedback form"
            >
              ×
            </button>

            {submitted ? (
              <div className="feedback-success">
                <h3>Thank you for your feedback!</h3>
                <p>We appreciate your input and will review it shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                <h3>Share Your Feedback</h3>
                
                <div className="feedback-field">
                  <label htmlFor="feedback-type">Feedback Type</label>
                  <select
                    id="feedback-type"
                    value={feedback.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="feedback-select"
                  >
                    {feedbackTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="feedback-field">
                  <label htmlFor="feedback-rating">Rating (1-5)</label>
                  <input
                    id="feedback-rating"
                    type="range"
                    min="1"
                    max="5"
                    value={feedback.rating}
                    onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                    className="feedback-rating"
                  />
                  <span className="rating-display">{feedback.rating}/5</span>
                </div>

                <div className="feedback-field">
                  <label htmlFor="feedback-message">Message</label>
                  <textarea
                    id="feedback-message"
                    value={feedback.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please share your thoughts..."
                    className="feedback-textarea"
                    rows="4"
                    required
                  />
                </div>

                <div className="feedback-field">
                  <label htmlFor="feedback-email">Email (optional)</label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={feedback.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="feedback-input"
                  />
                </div>

                <button 
                  type="submit" 
                  className="feedback-submit"
                  disabled={isSubmitting || !feedback.message.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FeedbackSystem;