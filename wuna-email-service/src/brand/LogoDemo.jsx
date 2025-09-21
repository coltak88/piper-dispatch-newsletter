/**
 * WunaEmail Logo Demo Component
 * Showcase different logo states with gamification levels
 */

import React, { useState } from 'react';
import WunaLogo from './WunaLogo.jsx';
import { WunaBrandKit } from './BrandKit.js';

const LogoDemo = () => {
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [isAnimated, setIsAnimated] = useState(true);
  const [userAchievements, setUserAchievements] = useState([]);
  
  // Simulate different gamification levels
  const gamificationLevels = [
    { level: 0, name: 'New Seeker', achievements: [] },
    { level: 5, name: 'Curious Wanderer', achievements: ['first_email', 'mystery_box'] },
    { level: 15, name: 'Knowledge Seeker', achievements: ['first_email', 'mystery_box', 'wisdom_collector', 'sanctuary_visitor'] },
    { level: 30, name: 'Wisdom Adept', achievements: ['first_email', 'mystery_box', 'wisdom_collector', 'sanctuary_visitor', 'dawn_witness', 'quantum_guardian'] },
    { level: 50, name: 'Mystic Master', achievements: ['first_email', 'mystery_box', 'wisdom_collector', 'sanctuary_visitor', 'dawn_witness', 'quantum_guardian', 'occult_initiate', 'ethereal_master'] }
  ];
  
  const sizes = ['small', 'medium', 'large'];
  
  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: WunaBrandKit.visual.colors.primary.ethereal,
            fontSize: '3rem',
            marginBottom: '10px',
            fontWeight: '700'
          }}>
            WunaEmail Logo Showcase
          </h1>
          <p style={{ 
            color: WunaBrandKit.visual.colors.primary.tranquil,
            fontSize: '1.2rem',
            opacity: 0.8
          }}>
            Dynamic logo with psychological gamification effects
          </p>
        </div>
        
        {/* Controls */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '40px',
          border: `1px solid ${WunaBrandKit.visual.colors.primary.ethereal}20`
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Gamification Level */}
            <div>
              <label style={{ 
                color: WunaBrandKit.visual.colors.primary.tranquil,
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                Gamification Level
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {gamificationLevels.map((level, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedLevel(level.level);
                      setUserAchievements(level.achievements);
                    }}
                    style={{
                      background: selectedLevel === level.level 
                        ? WunaBrandKit.visual.colors.primary.ethereal
                        : 'rgba(30, 41, 59, 0.8)',
                      color: selectedLevel === level.level ? '#0F172A' : '#E2E8F0',
                      border: `1px solid ${WunaBrandKit.visual.colors.primary.ethereal}40`,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{level.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      Level {level.level} • {level.achievements.length} achievements
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Size Selection */}
            <div>
              <label style={{ 
                color: WunaBrandKit.visual.colors.primary.tranquil,
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                Logo Size
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      background: selectedSize === size 
                        ? WunaBrandKit.visual.colors.primary.tranquil
                        : 'rgba(30, 41, 59, 0.8)',
                      color: selectedSize === size ? '#0F172A' : '#E2E8F0',
                      border: `1px solid ${WunaBrandKit.visual.colors.primary.tranquil}40`,
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Animation Toggle */}
            <div>
              <label style={{ 
                color: WunaBrandKit.visual.colors.primary.tranquil,
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                Animation
              </label>
              <button
                onClick={() => setIsAnimated(!isAnimated)}
                style={{
                  background: isAnimated 
                    ? WunaBrandKit.visual.colors.primary.sanctuary
                    : 'rgba(30, 41, 59, 0.8)',
                  color: isAnimated ? '#0F172A' : '#E2E8F0',
                  border: `1px solid ${WunaBrandKit.visual.colors.primary.sanctuary}40`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                {isAnimated ? 'Animated' : 'Static'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Logo Display */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '40px',
          border: `1px solid ${WunaBrandKit.visual.colors.primary.ethereal}20`,
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <WunaLogo 
            size={selectedSize}
            animated={isAnimated}
            gamificationLevel={selectedLevel}
            userAchievements={userAchievements}
          />
        </div>
        
        {/* Achievement Showcase */}
        {userAchievements.length > 0 && (
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '40px',
            border: `1px solid ${WunaBrandKit.visual.colors.primary.sanctuary}20`
          }}>
            <h3 style={{ 
              color: WunaBrandKit.visual.colors.primary.sanctuary,
              marginBottom: '20px',
              fontSize: '1.5rem'
            }}>
              Current Achievements
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              {userAchievements.map(achievementId => {
                const achievement = WunaBrandKit.gamification.achievements.novice
                  .concat(WunaBrandKit.gamification.achievements.adept)
                  .concat(WunaBrandKit.gamification.achievements.master)
                  .find(a => a.id === achievementId);
                
                if (!achievement) return null;
                
                return (
                  <div key={achievementId} style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    borderRadius: '8px',
                    padding: '15px',
                    border: `1px solid ${WunaBrandKit.visual.colors.primary.ethereal}20`,
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      marginBottom: '8px',
                      filter: `drop-shadow(0 0 8px ${WunaBrandKit.visual.colors.gamification.achievement})`
                    }}>
                      {achievement.symbol}
                    </div>
                    <div style={{ 
                      color: WunaBrandKit.visual.colors.primary.tranquil,
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {achievement.name}
                    </div>
                    <div style={{ 
                      color: '#94A3B8',
                      fontSize: '0.8rem'
                    }}>
                      {achievement.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Brand Kit Information */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '30px',
          border: `1px solid ${WunaBrandKit.visual.colors.primary.dawn}20`
        }}>
          <h3 style={{ 
            color: WunaBrandKit.visual.colors.primary.dawn,
            marginBottom: '20px',
            fontSize: '1.5rem'
          }}>
            Logo Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: WunaBrandKit.visual.colors.primary.ethereal, marginBottom: '10px' }}>
                🎨 Visual Design
              </h4>
              <ul style={{ color: '#E2E8F0', opacity: 0.8, lineHeight: '1.6' }}>
                <li>Multicolour gradients aligned with brand kit</li>
                <li>Each letter represents a core principle</li>
                <li>Mystical glow effects based on user level</li>
                <li>Animated particles and energy fields</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: WunaBrandKit.visual.colors.primary.tranquil, marginBottom: '10px' }}>
                🎮 Gamification Elements
              </h4>
              <ul style={{ color: '#E2E8F0', opacity: 0.8, lineHeight: '1.6' }}>
                <li>Dynamic glow intensity based on level</li>
                <li>Particle count increases with achievements</li>
                <li>Animation speed reflects user progress</li>
                <li>Achievement symbols appear as overlays</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: WunaBrandKit.visual.colors.primary.sanctuary, marginBottom: '10px' }}>
                ✨ Mystical Features
              </h4>
              <ul style={{ color: '#E2E8F0', opacity: 0.8, lineHeight: '1.6' }}>
                <li>Occult-themed animations and symbols</li>
                <li>Cosmic background with star field</li>
                <li>Energy connections between letters</li>
                <li>Psychological engagement triggers</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: WunaBrandKit.visual.colors.primary.dawn, marginBottom: '10px' }}>
                🛡️ Security Focus
              </h4>
              <ul style={{ color: '#E2E8F0', opacity: 0.8, lineHeight: '1.6' }}>
                <li>Quantum-resistant visual metaphors</li>
                <li>Privacy-first design principles</li>
                <li>Anonymous user representation</li>
                <li>Secure visual communication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoDemo;