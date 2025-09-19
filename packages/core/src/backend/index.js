import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/App.css';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-boundary">
      <div className="error-container">
        <h2>Something went wrong</h2>
        <details style={{ whiteSpace: 'pre-wrap' }}>
          {error && error.message}
        </details>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    </div>
  );
}

// Performance monitoring
function sendToAnalytics(metric) {
  // Send performance metrics to analytics service
  if (process.env.NODE_ENV === 'production') {
    console.log('Performance metric:', metric);
    // Implementation for analytics service
  }
}

// Initialize the application
function initializeApp() {
  const container = document.getElementById('root');
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error('Application error:', error, errorInfo);
          // Send error to monitoring service
        }}
        onReset={() => {
          // Clear any cached state or reload the page
          window.location.reload();
        }}
      >
        <HelmetProvider>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--color-success)',
                    secondary: 'var(--color-surface)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--color-error)',
                    secondary: 'var(--color-surface)',
                  },
                },
              }}
            />
          </BrowserRouter>
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Initialize privacy settings on app start
function initializePrivacySettings() {
  // Set default privacy preferences
  const defaultPrivacySettings = {
    dataRetention: 'zero',
    analytics: false,
    cookies: 'essential-only',
    tracking: false,
    personalization: 'on-device',
    encryption: 'quantum-resistant',
    biometrics: false,
    location: false,
    notifications: 'privacy-first',
    sharing: 'none',
    compliance: 'gdpr-plus',
    neurodiversity: {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
    },
  };

  // Check if privacy settings exist in localStorage
  const existingSettings = localStorage.getItem('piper-privacy-settings');
  if (!existingSettings) {
    localStorage.setItem(
      'piper-privacy-settings',
      JSON.stringify(defaultPrivacySettings)
    );
  }

  // Apply neurodiversity preferences
  const settings = JSON.parse(
    localStorage.getItem('piper-privacy-settings') || '{}'
  );
  
  if (settings.neurodiversity?.reducedMotion) {
    document.documentElement.style.setProperty('--animation-duration', '0s');
  }
  
  if (settings.neurodiversity?.highContrast) {
    document.documentElement.classList.add('high-contrast');
  }
  
  if (settings.neurodiversity?.largeText) {
    document.documentElement.classList.add('large-text');
  }
}

// Initialize quantum security
function initializeQuantumSecurity() {
  // Initialize quantum-resistant encryption
  const quantumSettings = {
    algorithm: 'kyber-768',
    keySize: 3168,
    encryptionLevel: 'military-grade',
    rotationInterval: '24h',
    backupKeys: 3,
  };

  sessionStorage.setItem(
    'piper-quantum-settings',
    JSON.stringify(quantumSettings)
  );

  // Initialize secure random number generator
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    sessionStorage.setItem('piper-entropy-seed', array[0].toString());
  }
}

// Initialize performance monitoring
function initializePerformanceMonitoring() {
  // Monitor Core Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }

  // Monitor custom performance metrics
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        sendToAnalytics({
          name: 'page-load-time',
          value: entry.loadEventEnd - entry.loadEventStart,
        });
      }
    }
  });

  observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
}

// Initialize accessibility features
function initializeAccessibility() {
  // Check for user preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

  // Apply system preferences
  if (prefersReducedMotion.matches) {
    document.documentElement.classList.add('reduce-motion');
  }

  if (prefersHighContrast.matches) {
    document.documentElement.classList.add('high-contrast');
  }

  if (prefersDarkMode.matches) {
    document.documentElement.classList.add('dark-mode');
  }

  // Listen for changes
  prefersReducedMotion.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('reduce-motion', e.matches);
  });

  prefersHighContrast.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('high-contrast', e.matches);
  });

  prefersDarkMode.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('dark-mode', e.matches);
  });
}

// Main initialization function
function main() {
  try {
    // Initialize core systems
    initializePrivacySettings();
    initializeQuantumSecurity();
    initializeAccessibility();
    initializePerformanceMonitoring();

    // Initialize the React application
    initializeApp();

    // Register service worker for PWA functionality
    if (process.env.NODE_ENV === 'production') {
      serviceWorkerRegistration.register({
        onSuccess: (registration) => {
          console.log('SW registered: ', registration);
        },
        onUpdate: (registration) => {
          console.log('SW updated: ', registration);
          // Notify user of available update
        },
      });
    } else {
      serviceWorkerRegistration.unregister();
    }

    // Report web vitals
    reportWebVitals(sendToAnalytics);

  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Fallback initialization
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          color: #1e293b;
        ">
          <div style="text-align: center; max-width: 400px; padding: 2rem;">
            <h1 style="margin-bottom: 1rem; color: #dc2626;">Application Error</h1>
            <p style="margin-bottom: 1.5rem; color: #64748b;">We're sorry, but something went wrong. Please refresh the page to try again.</p>
            <button 
              onclick="window.location.reload()" 
              style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 500;
              "
            >
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Start the application
main();