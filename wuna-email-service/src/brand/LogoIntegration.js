/**
 * WunaEmail Logo Integration Guide
 * Demonstrates various ways to integrate the WUNA logo into applications
 */

import React, { useState, useEffect } from 'react';
import WunaLogo from './WunaLogo.jsx';
import { WunaBrandKit } from './BrandKit.js';

/**
 * Header Logo Component
 * Use in application headers and navigation bars
 */
export const HeaderLogo = ({ userLevel = 0, userAchievements = [] }) => {
  return (
    <div className="header-logo-container" style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${WunaBrandKit.visual.colors.primary.ethereal}20`
    }}>
      <WunaLogo 
        size="small"
        animated={true}
        gamificationLevel={userLevel}
        userAchievements={userAchievements}
      />
      <div style={{ marginLeft: '15px' }}>
        <h1 style={{
          color: WunaBrandKit.visual.colors.primary.ethereal,
          fontSize: '1.2rem',
          margin: 0,
          fontWeight: '600'
        }}>
          {WunaBrandKit.identity.name}
        </h1>
        <p style={{
          color: WunaBrandKit.visual.colors.primary.tranquil,
          fontSize: '0.8rem',
          margin: '2px 0 0 0',
          opacity: 0.8
        }}>
          {WunaBrandKit.identity.tagline}
        </p>
      </div>
    </div>
  );
};

/**
 * Loading Screen Logo
 * Animated logo for loading states and transitions
 */
export const LoadingLogo = ({ message = "Loading mystical email experience..." }) => {
  return (
    <div className="loading-logo-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
    }}>
      <WunaLogo 
        size="large"
        animated={true}
        gamificationLevel={0}
        userAchievements={[]}
      />
      <p style={{
        color: WunaBrandKit.visual.colors.primary.tranquil,
        fontSize: '1rem',
        marginTop: '30px',
        opacity: 0.8,
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        {message}
      </p>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

/**
 * Achievement Unlocked Logo
 * Special logo state for achievement notifications
 */
export const AchievementLogo = ({ achievement, userLevel, userAchievements }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  
  useEffect(() => {
    setShowCelebration(true);
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => clearTimeout(timer);
  }, [achievement]);
  
  return (
    <div className="achievement-logo-container" style={{
      position: 'relative',
      display: 'inline-block',
      transform: showCelebration ? 'scale(1.1)' : 'scale(1)',
      transition: 'transform 0.5s ease-out'
    }}>
      <WunaLogo 
        size="medium"
        animated={true}
        gamificationLevel={userLevel}
        userAchievements={[...userAchievements, achievement]}
      />
      {showCelebration && (
        <div className="celebration-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle, ${WunaBrandKit.visual.colors.gamification.achievement}40 0%, transparent 70%)`,
          borderRadius: '50%',
          animation: 'celebrationPulse 1s ease-out'
        }} />
      )}
      <style jsx>{`
        @keyframes celebrationPulse {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

/**
 * Email Signature Logo
 * Compact logo for email signatures
 */
export const EmailSignatureLogo = () => {
  return (
    <div className="email-signature-logo" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 12px',
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '6px',
      border: `1px solid ${WunaBrandKit.visual.colors.primary.ethereal}30`
    }}>
      <WunaLogo 
        size="small"
        animated={false}
        gamificationLevel={0}
        userAchievements={[]}
      />
      <div>
        <div style={{
          color: WunaBrandKit.visual.colors.primary.ethereal,
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {WunaBrandKit.identity.name}
        </div>
        <div style={{
          color: WunaBrandKit.visual.colors.primary.tranquil,
          fontSize: '0.7rem',
          opacity: 0.8
        }}>
          Secure • Private • Mystical
        </div>
      </div>
    </div>
  );
};

/**
 * Error State Logo
 * Logo for error pages and fallback states
 */
export const ErrorLogo = ({ errorMessage }) => {
  return (
    <div className="error-logo-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px',
      textAlign: 'center'
    }}>
      <WunaLogo 
        size="medium"
        animated={false}
        gamificationLevel={0}
        userAchievements={[]}
      />
      <h2 style={{
        color: WunaBrandKit.visual.colors.primary.dawn,
        fontSize: '1.5rem',
        marginTop: '30px',
        marginBottom: '10px'
      }}>
        Something went awry in the mystical realm
      </h2>
      {errorMessage && (
        <p style={{
          color: WunaBrandKit.visual.colors.primary.tranquil,
          fontSize: '1rem',
          opacity: 0.8,
          maxWidth: '400px'
        }}>
          {errorMessage}
        </p>
      )}
      <p style={{
        color: WunaBrandKit.visual.colors.primary.sanctuary,
        fontSize: '0.9rem',
        opacity: 0.7,
        marginTop: '20px'
      }}>
        Your secrets remain safe with us. Please try again.
      </p>
    </div>
  );
};

/**
 * Success State Logo
 * Logo for success messages and confirmations
 */
export const SuccessLogo = ({ successMessage, userLevel, userAchievements }) => {
  return (
    <div className="success-logo-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      padding: '40px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
      borderRadius: '12px',
      border: `1px solid ${WunaBrandKit.visual.colors.primary.sanctuary}40`
    }}>
      <WunaLogo 
        size="large"
        animated={true}
        gamificationLevel={userLevel}
        userAchievements={userAchievements}
      />
      <h2 style={{
        color: WunaBrandKit.visual.colors.primary.sanctuary,
        fontSize: '1.8rem',
        marginTop: '30px',
        marginBottom: '10px'
      }}>
        Mystical Success!
      </h2>
      {successMessage && (
        <p style={{
          color: WunaBrandKit.visual.colors.primary.tranquil,
          fontSize: '1.1rem',
          opacity: 0.9,
          maxWidth: '500px'
        }}>
          {successMessage}
        </p>
      )}
      <p style={{
        color: WunaBrandKit.visual.colors.primary.ethereal,
        fontSize: '0.9rem',
        opacity: 0.8,
        marginTop: '20px'
      }}>
        The ancient wisdom has been preserved.
      </p>
    </div>
  );
};

/**
 * Logo Usage Guidelines
 * Documentation for proper logo usage
 */
export const LogoUsageGuidelines = () => {
  return (
    <div className="logo-guidelines" style={{
      background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '12px',
      padding: '30px',
      border: `1px solid ${WunaBrandKit.visual.colors.primary.ethereal}20`,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{
        color: WunaBrandKit.visual.colors.primary.ethereal,
        marginBottom: '20px',
        fontSize: '1.5rem'
      }}>
        Logo Usage Guidelines
      </h3>
      
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          color: WunaBrandKit.visual.colors.primary.tranquil,
          marginBottom: '10px'
        }}>
          Brand Colors
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          {Object.entries(WunaBrandKit.visual.colors.primary).map(([name, color]) => (
            <div key={name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: color,
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)'
              }} />
              <span style={{ color: '#E2E8F0', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          color: WunaBrandKit.visual.colors.primary.sanctuary,
          marginBottom: '10px'
        }}>
          Size Recommendations
        </h4>
        <ul style={{ color: '#E2E8F0', opacity: 0.8, lineHeight: '1.6' }}>
          <li><strong>Small (150x50px):</strong> Email signatures, compact UI elements</li>
          <li><strong>Medium (300x100px):</strong> Headers, cards, standard displays</li>
          <li><strong>Large (450x150px):</strong> Landing pages, hero sections, loading screens</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          color: WunaBrandKit.visual.colors.primary.dawn,
          marginBottom: '10px'
        }}>
          Gamification Integration
        </h4>
        <ul style={{ color: '#E2E8F0', opacity: 0.8, lineHeight: '1.6' }}>
          <li>Logo glow intensity increases with user level (0-50+)</li>
          <li>Particle count reflects achievement progress</li>
          <li>Animation speed adapts to user engagement</li>
          <li>Achievement symbols appear as overlays</li>
        </ul>
      </div>
      
      <div>
        <h4 style={{
          color: WunaBrandKit.visual.colors.gamification.mystery,
          marginBottom: '10px'
        }}>
          Accessibility
        </h4>
        <ul style={{ color: '#E2E8F0', opacity: 0.8, lineHeight: '1.6' }}>
          <li>Includes screen reader text with brand name and tagline</li>
          <li>Maintains contrast ratios for readability</li>
          <li>Animation can be disabled for accessibility</li>
          <li>Semantic HTML structure for screen readers</li>
        </ul>
      </div>
    </div>
  );
};

export default {
  HeaderLogo,
  LoadingLogo,
  AchievementLogo,
  EmailSignatureLogo,
  ErrorLogo,
  SuccessLogo,
  LogoUsageGuidelines
};