/**
 * WunaEmail Logo Component
 * Multicolour mystical logo with psychological gamification effects
 * Aligns with BrandKit principles: wisdom, tranquility, sanctuary, dawn
 */

import React, { useState, useEffect } from 'react';
import { WunaBrandKit } from './BrandKit.js';

const WunaLogo = ({ 
  size = 'medium',
  animated = true,
  gamificationLevel = 0,
  userAchievements = [],
  theme = 'default'
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [particlePositions, setParticlePositions] = useState([]);
  
  // Size configurations
  const sizes = {
    small: { width: 150, height: 50, fontSize: 5 },
    medium: { width: 300, height: 100, fontSize: 10 },
    large: { width: 450, height: 150, fontSize: 15 }
  };
  
  const currentSize = sizes[size] || sizes.medium;
  
  // Gamification effects based on user level and achievements
  const getGlowIntensity = () => {
    const baseIntensity = 0.3;
    const levelBonus = Math.min(gamificationLevel * 0.02, 0.7);
    const achievementBonus = Math.min(userAchievements.length * 0.05, 0.5);
    return Math.min(baseIntensity + levelBonus + achievementBonus, 1);
  };
  
  const getParticleCount = () => {
    const baseCount = 5;
    const levelBonus = Math.floor(gamificationLevel / 10);
    const achievementBonus = Math.floor(userAchievements.length / 3);
    return Math.min(baseCount + levelBonus + achievementBonus, 15);
  };
  
  const getAnimationSpeed = () => {
    const baseSpeed = 1;
    const levelBonus = gamificationLevel * 0.05;
    return Math.max(baseSpeed - levelBonus, 0.3);
  };
  
  // Initialize particle positions
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < getParticleCount(); i++) {
      particles.push({
        id: i,
        x: Math.random() * currentSize.width,
        y: Math.random() * currentSize.height,
        color: getRandomBrandColor(),
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1
      });
    }
    setParticlePositions(particles);
  }, [gamificationLevel, userAchievements.length]);
  
  // Animation cycle
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
      
      // Update particle positions
      setParticlePositions(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y + particle.speed * getAnimationSpeed()) % currentSize.height,
        x: particle.x + Math.sin(animationPhase * 0.01 + particle.id) * 0.5
      })));
    }, 50);
    
    return () => clearInterval(interval);
  }, [animated, animationPhase, gamificationLevel]);
  
  const getRandomBrandColor = () => {
    const colors = [
      WunaBrandKit.visual.colors.primary.ethereal,
      WunaBrandKit.visual.colors.primary.tranquil,
      WunaBrandKit.visual.colors.primary.sanctuary,
      WunaBrandKit.visual.colors.primary.dawn,
      WunaBrandKit.visual.colors.gamification.mystery
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const getAchievementSymbol = () => {
    if (userAchievements.length === 0) return null;
    
    const latestAchievement = userAchievements[userAchievements.length - 1];
    const achievementConfig = WunaBrandKit.gamification.achievements.novice
      .concat(WunaBrandKit.gamification.achievements.adept)
      .concat(WunaBrandKit.gamification.achievements.master)
      .find(a => a.id === latestAchievement);
    
    return achievementConfig ? achievementConfig.symbol : '🌟';
  };
  
  const glowIntensity = getGlowIntensity();
  const achievementSymbol = getAchievementSymbol();
  
  return (
    <div className="wuna-logo-container" style={{ 
      display: 'inline-block',
      position: 'relative',
      width: currentSize.width,
      height: currentSize.height
    }}>
      <svg 
        width={currentSize.width} 
        height={currentSize.height}
        viewBox={`0 0 ${currentSize.width} ${currentSize.height}`}
        className="wuna-logo"
      >
        <defs>
          {/* Ethereal gradient for W */}
          <linearGradient id="etherealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: WunaBrandKit.visual.colors.primary.ethereal, stopOpacity: 1}} />
            <stop offset="50%" style={{stopColor: WunaBrandKit.visual.colors.gamification.mystery, stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#A855F7', stopOpacity: 1}} />
          </linearGradient>
          
          {/* Tranquil gradient for U */}
          <linearGradient id="tranquilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: WunaBrandKit.visual.colors.primary.tranquil, stopOpacity: 1}} />
            <stop offset="50%" style={{stopColor: '#0891B2', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#0E7490', stopOpacity: 1}} />
          </linearGradient>
          
          {/* Novelty gradient for N */}
        <linearGradient id="noveltyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#0369A1', stopOpacity: 1}} />
        </linearGradient>
          
          {/* Dawn gradient for A */}
          <linearGradient id="dawnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: WunaBrandKit.visual.colors.primary.dawn, stopOpacity: 1}} />
            <stop offset="50%" style={{stopColor: '#D97706', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#B45309', stopOpacity: 1}} />
          </linearGradient>
          
          {/* Mystical glow filter */}
          <filter id="mysticalGlow">
            <feGaussianBlur stdDeviation={glowIntensity * 3} result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Achievement aura */}
          {achievementSymbol && (
            <filter id="achievementAura">
              <feGaussianBlur stdDeviation="4" result="auraBlur"/>
              <feColorMatrix in="auraBlur" type="matrix" 
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="aura"/>
              <feMerge> 
                <feMergeNode in="aura"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Background cosmic field */}
        <rect width={currentSize.width} height={currentSize.height} fill="#0F172A" opacity="0.9" rx="8"/>
        
        {/* Animated particles */}
        {particlePositions.map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            opacity={0.7}
          />
        ))}
        
        {/* W letter - Ethereal Wisdom */}
        <g transform="translate(15, 25)" filter={glowIntensity > 0.5 ? "url(#mysticalGlow)" : ""}>
          <path 
            d="M 0 5 L 15 45 L 30 25 L 45 45 L 60 5 L 50 5 L 37.5 30 L 30 20 L 22.5 30 L 10 5 Z" 
            fill="url(#etherealGradient)"
            opacity={0.9 + glowIntensity * 0.1}
          />
          <circle 
            cx="30" 
            cy="25" 
            r={animated ? "3" : "2"}
            fill={WunaBrandKit.visual.colors.gamification.mystery}
            opacity={animated ? "0.7" : "0.5"}
          >
            {animated && (
              <animate 
                attributeName="r" 
                values="2;4;2" 
                dur={`${3 / getAnimationSpeed()}s`} 
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>
        
        {/* U letter - Tranquil Understanding */}
        <g transform="translate(70, 25)" filter={glowIntensity > 0.5 ? "url(#mysticalGlow)" : ""}>
          <path 
            d="M 10 5 Q 10 45 30 45 Q 50 45 50 5 L 40 5 Q 40 35 30 35 Q 20 35 20 5 Z" 
            fill="url(#tranquilGradient)"
            opacity={0.9 + glowIntensity * 0.1}
          />
          <path 
            d="M 15 30 Q 25 25 35 30" 
            stroke={WunaBrandKit.visual.colors.primary.tranquil} 
            strokeWidth="2" 
            fill="none" 
            opacity="0.6"
          >
            {animated && (
              <animate 
                attributeName="d" 
                values="M 15 30 Q 25 25 35 30;M 15 30 Q 25 35 35 30;M 15 30 Q 25 25 35 30" 
                dur={`${3 / getAnimationSpeed()}s`} 
                repeatCount="indefinite"
              />
            )}
          </path>
        </g>
        
        {/* N letter - Novelty */}
        <g transform="translate(125, 25)" filter={glowIntensity > 0.5 ? "url(#mysticalGlow)" : ""}>
          <path 
            d="M 5 5 L 5 45 L 15 45 L 15 15 L 40 45 L 50 45 L 50 5 L 40 5 L 40 35 L 15 5 Z" 
            fill="url(#noveltyGradient)"
            opacity={0.9 + glowIntensity * 0.1}
          />
          <path 
            d="M 27.5 25 L 25 20 L 27.5 22.5 L 30 20 L 27.5 25" 
            fill="#0EA5E9" 
            opacity="0.8"
          >
            {animated && (
              <animateTransform 
                attributeName="transform" 
                type="scale" 
                values="1;1.2;1" 
                dur={`${2.5 / getAnimationSpeed()}s`} 
                repeatCount="indefinite"
              />
            )}
          </path>
        </g>
        
        {/* A letter - Dawn Awakening */}
        <g transform="translate(180, 25)" filter={glowIntensity > 0.5 ? "url(#mysticalGlow)" : ""}>
          <path 
            d="M 25 5 L 5 45 L 15 45 L 18 38 L 32 38 L 35 45 L 45 45 Z M 25 15 L 30 28 L 20 28 Z" 
            fill="url(#dawnGradient)"
            opacity={0.9 + glowIntensity * 0.1}
          />
          <circle 
            cx="25" 
            cy="10" 
            r={animated ? "4" : "3"}
            fill={WunaBrandKit.visual.colors.primary.dawn} 
            opacity={animated ? "0.8" : "0.6"}
          >
            {animated && (
              <>
                <animate 
                  attributeName="cy" 
                  values="10;8;10" 
                  dur={`${4 / getAnimationSpeed()}s`} 
                  repeatCount="indefinite"
                />
                <animate 
                  attributeName="opacity" 
                  values="0.8;1;0.8" 
                  dur={`${4 / getAnimationSpeed()}s`} 
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
        </g>
        
        {/* Energy field connecting letters */}
        <g opacity={0.3 + glowIntensity * 0.2}>
          <path 
            d="M 65 30 Q 105 20 125 30" 
            stroke={WunaBrandKit.visual.colors.gamification.mystery} 
            strokeWidth="1" 
            fill="none" 
            strokeDasharray="5,5"
          >
            {animated && (
              <animate 
                attributeName="stroke-dashoffset" 
                values="0;10;0" 
                dur={`${2 / getAnimationSpeed()}s`} 
                repeatCount="indefinite"
              />
            )}
          </path>
          <path 
            d="M 125 30 Q 165 40 185 30" 
            stroke={WunaBrandKit.visual.colors.primary.tranquil} 
            strokeWidth="1" 
            fill="none" 
            strokeDasharray="3,3"
          >
            {animated && (
              <animate 
                attributeName="stroke-dashoffset" 
                values="0;6;0" 
                dur={`${3 / getAnimationSpeed()}s`} 
                repeatCount="indefinite"
              />
            )}
          </path>
          <path 
            d="M 185 30 Q 225 25 245 30" 
            stroke="#0EA5E9" 
            strokeWidth="1" 
            fill="none" 
            strokeDasharray="4,4"
          >
            {animated && (
              <animate 
                attributeName="stroke-dashoffset" 
                values="0;8;0" 
                dur={`${2.5 / getAnimationSpeed()}s`} 
                repeatCount="indefinite"
              />
            )}
          </path>
        </g>
        
        {/* Achievement symbol overlay */}
        {achievementSymbol && (
          <text 
            x={currentSize.width * 0.9} 
            y={currentSize.height * 0.2}
            fontSize={currentSize.fontSize * 1.5}
            fill={WunaBrandKit.visual.colors.gamification.achievement}
            textAnchor="middle"
            filter="url(#achievementAura)"
            opacity={glowIntensity}
          >
            {achievementSymbol}
          </text>
        )}
        
        {/* Tagline */}
        <text 
          x={currentSize.width * 0.5} 
          y={currentSize.height * 0.85}
          fontFamily="Inter, sans-serif" 
          fontSize={currentSize.fontSize}
          fill="#E2E8F0" 
          textAnchor="middle" 
          opacity={0.8} 
          letterSpacing="2"
        >
          {WunaBrandKit.identity.tagline}
        </text>
        
        {/* Mystical border */}
        <rect 
          x="5" 
          y="5" 
          width={currentSize.width - 10} 
          height={currentSize.height - 10} 
          fill="none" 
          stroke={WunaBrandKit.visual.colors.primary.ethereal} 
          strokeWidth="0.5" 
          strokeDasharray="10,5" 
          opacity={0.3 + glowIntensity * 0.2}
          rx="8"
        >
          {animated && (
            <animate 
              attributeName="stroke-dashoffset" 
              values="0;15;0" 
              dur={`${4 / getAnimationSpeed()}s`} 
              repeatCount="indefinite"
            />
          )}
        </rect>
      </svg>
      
      {/* Hidden accessibility text */}
      <span className="sr-only">WunaEmail - {WunaBrandKit.identity.tagline}</span>
    </div>
  );
};

export default WunaLogo;