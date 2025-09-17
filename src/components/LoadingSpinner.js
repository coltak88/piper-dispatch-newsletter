import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  message = 'Loading...', 
  showMessage = true 
}) => {
  const sizeClasses = {
    small: 'spinner--small',
    medium: 'spinner--medium',
    large: 'spinner--large'
  };

  const colorClasses = {
    primary: 'spinner--primary',
    secondary: 'spinner--secondary',
    accent: 'spinner--accent',
    white: 'spinner--white'
  };

  return (
    <div className="loading-container">
      <motion.div 
        className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        aria-label="Loading"
      >
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </motion.div>
      
      {showMessage && (
        <motion.p 
          className="loading-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

// Overlay spinner for full-screen loading
export const LoadingOverlay = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <motion.div 
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner size="large" color="white" message={message} />
    </motion.div>
  );
};

// Inline spinner for smaller components
export const InlineSpinner = ({ size = 'small' }) => {
  return (
    <motion.div 
      className={`inline-spinner spinner--${size}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      ⟳
    </motion.div>
  );
};

export default LoadingSpinner;