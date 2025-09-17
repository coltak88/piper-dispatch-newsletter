import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send error report
    console.log('Error Report:', errorReport);
    
    // You could send this to your error reporting service
    if (this.props.onReportError) {
      this.props.onReportError(errorReport);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <motion.div 
          className="error-boundary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="error-boundary__container">
            <div className="error-boundary__icon">⚠️</div>
            
            <h2 className="error-boundary__title">
              Oops! Something went wrong
            </h2>
            
            <p className="error-boundary__message">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {this.props.showDetails && this.state.error && (
              <details className="error-boundary__details">
                <summary>Technical Details</summary>
                <div className="error-boundary__error-info">
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  {this.state.error.stack && (
                    <pre className="error-boundary__stack">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="error-boundary__actions">
              <motion.button
                className="error-boundary__button error-boundary__button--primary"
                onClick={this.handleRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
              
              <motion.button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reload Page
              </motion.button>
              
              <motion.button
                className="error-boundary__button error-boundary__button--outline"
                onClick={this.handleReportError}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Report Issue
              </motion.button>
            </div>

            {this.props.contactInfo && (
              <p className="error-boundary__contact">
                If this problem persists, please contact us at{' '}
                <a href={`mailto:${this.props.contactInfo}`}>
                  {this.props.contactInfo}
                </a>
              </p>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);
  
  const captureError = (error) => {
    console.error('Captured error:', error);
    setError(error);
  };

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

export default ErrorBoundary;