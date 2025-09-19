import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/voice-reader.css';
import { PrivacyFirstTracker } from '../services/privacy/PrivacyTracker';
import TranslationService from '../services/TranslationService';

const VoiceReader = ({ 
  content = '',
  autoPlay = false,
  showControls = true,
  showProgress = true,
  showTranscript = false,
  neurodiversityMode = 'standard',
  onPlayStateChange = null,
  onProgressChange = null,
  onError = null
}) => {
  // State management
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    pitch: 1.0,
    rate: 1.0,
    volume: 0.8,
    voice: null,
    highlightWords: true,
    autoScroll: true,
    pauseOnPunctuation: false
  });

  // Refs
  const utteranceRef = useRef(null);
  const contentRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const currentWordRef = useRef(null);
  const settingsRef = useRef(settings);

  // Update settings ref when settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Check browser support and initialize
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      setIsSupported(supported);
      
      if (!supported) {
        setError('Speech synthesis is not supported in this browser.');
        return;
      }

      // Load available voices
      loadVoices();
      
      // Listen for voices changed event (some browsers load voices asynchronously)
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    };

    checkSupport();

    return () => {
      if (speechSynthesis.onvoiceschanged) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Load available voices
  const loadVoices = useCallback(() => {
    try {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to find a good default voice
        const currentLang = TranslationService.getCurrentLanguage()?.code || 'en';
        const preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith(currentLang) && voice.default
        ) || availableVoices.find(voice => 
          voice.lang.startsWith(currentLang)
        ) || availableVoices.find(voice => 
          voice.default
        ) || availableVoices[0];
        
        setSelectedVoice(preferredVoice);
        setSettings(prev => ({ ...prev, voice: preferredVoice }));
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      setError('Failed to load speech voices.');
    }
  }, [selectedVoice]);

  // Auto-play when content changes
  useEffect(() => {
    if (autoPlay && content && isSupported && !isPlaying) {
      handlePlay();
    }
  }, [content, autoPlay, isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      handleStop();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Process content for speech synthesis
  const processContentForSpeech = useCallback((text) => {
    if (!text) return '';
    
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    
    // Normalize whitespace
    const normalizedText = cleanText.replace(/\s+/g, ' ').trim();
    
    // Add pauses for better readability
    let processedText = normalizedText
      .replace(/\./g, '. ')
      .replace(/\!/g, '! ')
      .replace(/\?/g, '? ')
      .replace(/;/g, '; ')
      .replace(/:/g, ': ')
      .replace(/,/g, ', ');
    
    // Add longer pauses for paragraphs
    processedText = processedText.replace(/\n\n+/g, '. . . ');
    
    return processedText;
  }, []);

  // Create speech utterance
  const createUtterance = useCallback((text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    utterance.voice = settings.voice;
    utterance.pitch = settings.pitch;
    utterance.rate = settings.rate;
    utterance.volume = settings.volume;
    
    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
      setError(null);
      
      // Start progress tracking
      startProgressTracking(text);
      
      // Track usage
      PrivacyFirstTracker.trackEvent({
        category: 'accessibility',
        action: 'voice_reader_start',
        label: 'speech_synthesis',
        privacy_level: 'anonymous'
      });
      
      if (onPlayStateChange) {
        onPlayStateChange(true);
      }
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentTime(duration);
      
      // Clear progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Clear highlighting
      setHighlightedText('');
      
      if (onPlayStateChange) {
        onPlayStateChange(false);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setError(`Speech synthesis failed: ${event.error}`);
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
      
      if (onError) {
        onError(event.error);
      }
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    // Word boundary tracking for highlighting
    if (settings.highlightWords) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const word = text.substring(event.charIndex, event.charIndex + event.charLength);
          setHighlightedText(word);
          
          // Auto-scroll to current word
          if (settings.autoScroll && currentWordRef.current) {
            currentWordRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      };
    }
    
    return utterance;
  }, [settings, duration, onPlayStateChange, onError]);

  // Start progress tracking
  const startProgressTracking = useCallback((text) => {
    const estimatedDuration = (text.length / 10) * (2 - settings.rate); // Rough estimation
    setDuration(estimatedDuration);
    
    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      if (!speechSynthesis.speaking) {
        clearInterval(progressIntervalRef.current);
        return;
      }
      
      const elapsed = (Date.now() - startTime) / 1000;
      const progressPercent = Math.min((elapsed / estimatedDuration) * 100, 100);
      
      setCurrentTime(elapsed);
      setProgress(progressPercent);
      
      if (onProgressChange) {
        onProgressChange(progressPercent, elapsed, estimatedDuration);
      }
    }, 100);
  }, [settings.rate, onProgressChange]);

  // Play speech
  const handlePlay = useCallback(() => {
    if (!isSupported || !content) return;
    
    try {
      // Stop any existing speech
      speechSynthesis.cancel();
      
      setIsLoading(true);
      setError(null);
      
      // Process content
      const processedText = processContentForSpeech(content);
      setTranscript(processedText);
      
      // Create and start utterance
      const utterance = createUtterance(processedText);
      utteranceRef.current = utterance;
      
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error starting speech:', error);
      setError('Failed to start speech synthesis.');
      setIsLoading(false);
    }
  }, [isSupported, content, processContentForSpeech, createUtterance]);

  // Pause speech
  const handlePause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  // Resume speech
  const handleResume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  // Stop speech
  const handleStop = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
    setHighlightedText('');
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  // Change playback rate
  const handleRateChange = useCallback((newRate) => {
    setPlaybackRate(newRate);
    setSettings(prev => ({ ...prev, rate: newRate }));
    
    // If currently playing, restart with new rate
    if (isPlaying) {
      const wasPlaying = !isPaused;
      handleStop();
      setTimeout(() => {
        if (wasPlaying) {
          handlePlay();
        }
      }, 100);
    }
  }, [isPlaying, isPaused, handleStop, handlePlay]);

  // Change volume
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    setSettings(prev => ({ ...prev, volume: newVolume }));
  }, []);

  // Change voice
  const handleVoiceChange = useCallback((voice) => {
    setSelectedVoice(voice);
    setSettings(prev => ({ ...prev, voice }));
    
    // If currently playing, restart with new voice
    if (isPlaying) {
      const wasPlaying = !isPaused;
      handleStop();
      setTimeout(() => {
        if (wasPlaying) {
          handlePlay();
        }
      }, 100);
    }
  }, [isPlaying, isPaused, handleStop, handlePlay]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get voice display name
  const getVoiceDisplayName = useCallback((voice) => {
    if (!voice) return 'Default';
    return `${voice.name} (${voice.lang})`;
  }, []);

  // Render transcript with highlighting
  const renderTranscript = useCallback(() => {
    if (!transcript || !showTranscript) return null;
    
    if (!settings.highlightWords || !highlightedText) {
      return <div className="transcript-text">{transcript}</div>;
    }
    
    // Split transcript and highlight current word
    const words = transcript.split(' ');
    return (
      <div className="transcript-text">
        {words.map((word, index) => {
          const isHighlighted = word.toLowerCase().includes(highlightedText.toLowerCase());
          return (
            <span
              key={index}
              ref={isHighlighted ? currentWordRef : null}
              className={`transcript-word ${isHighlighted ? 'highlighted' : ''}`}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>
    );
  }, [transcript, showTranscript, settings.highlightWords, highlightedText]);

  if (!isSupported) {
    return (
      <div className={`voice-reader unsupported ${neurodiversityMode}-optimized`}>
        <div className="unsupported-message">
          <span className="unsupported-icon" aria-hidden="true">🔇</span>
          <span className="unsupported-text">
            Voice reading is not supported in this browser.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={contentRef}
      className={`voice-reader ${neurodiversityMode}-optimized ${isPlaying ? 'playing' : ''} ${error ? 'error' : ''}`}
    >
      {/* Error display */}
      {error && (
        <div className="error-message" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span className="error-text">{error}</span>
          <button 
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main controls */}
      {showControls && (
        <div className="voice-controls">
          {/* Play/Pause/Stop buttons */}
          <div className="playback-controls">
            {!isPlaying ? (
              <button
                className="control-button play-button"
                onClick={handlePlay}
                disabled={isLoading || !content}
                aria-label="Start reading"
                title="Start reading"
              >
                {isLoading ? (
                  <div className="loading-spinner" aria-hidden="true"></div>
                ) : (
                  <span className="control-icon" aria-hidden="true">▶️</span>
                )}
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    className="control-button pause-button"
                    onClick={handlePause}
                    aria-label="Pause reading"
                    title="Pause reading"
                  >
                    <span className="control-icon" aria-hidden="true">⏸️</span>
                  </button>
                ) : (
                  <button
                    className="control-button resume-button"
                    onClick={handleResume}
                    aria-label="Resume reading"
                    title="Resume reading"
                  >
                    <span className="control-icon" aria-hidden="true">▶️</span>
                  </button>
                )}
                
                <button
                  className="control-button stop-button"
                  onClick={handleStop}
                  aria-label="Stop reading"
                  title="Stop reading"
                >
                  <span className="control-icon" aria-hidden="true">⏹️</span>
                </button>
              </>
            )}
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="progress-section">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`Reading progress: ${Math.round(progress)}%`}
                >
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="time-display">
                <span className="current-time">{formatTime(currentTime)}</span>
                <span className="time-separator">/</span>
                <span className="total-time">{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Advanced controls */}
          <div className="advanced-controls">
            {/* Playback rate */}
            <div className="control-group">
              <label htmlFor="playback-rate" className="control-label">
                Speed: {playbackRate}x
              </label>
              <input
                id="playback-rate"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={playbackRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="range-input rate-slider"
                aria-label="Playback speed"
              />
            </div>

            {/* Volume */}
            <div className="control-group">
              <label htmlFor="volume" className="control-label">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="range-input volume-slider"
                aria-label="Volume level"
              />
            </div>

            {/* Voice selection */}
            {voices.length > 1 && (
              <div className="control-group">
                <label htmlFor="voice-select" className="control-label">
                  Voice:
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    if (voice) handleVoiceChange(voice);
                  }}
                  className="voice-select"
                  aria-label="Select voice"
                >
                  {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {getVoiceDisplayName(voice)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transcript */}
      {showTranscript && (
        <div className="transcript-section">
          <div className="transcript-header">
            <h3 className="transcript-title">Transcript</h3>
            <div className="transcript-controls">
              <button
                className={`transcript-toggle ${settings.highlightWords ? 'active' : ''}`}
                onClick={() => setSettings(prev => ({ ...prev, highlightWords: !prev.highlightWords }))}
                aria-label="Toggle word highlighting"
                title="Toggle word highlighting"
              >
                <span className="toggle-icon" aria-hidden="true">🔍</span>
              </button>
              
              <button
                className={`transcript-toggle ${settings.autoScroll ? 'active' : ''}`}
                onClick={() => setSettings(prev => ({ ...prev, autoScroll: !prev.autoScroll }))}
                aria-label="Toggle auto-scroll"
                title="Toggle auto-scroll"
              >
                <span className="toggle-icon" aria-hidden="true">📜</span>
              </button>
            </div>
          </div>
          
          <div className="transcript-content">
            {renderTranscript()}
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="status-indicator" aria-live="polite" aria-atomic="true">
        {isLoading && 'Loading...'}
        {isPlaying && !isPaused && 'Reading...'}
        {isPaused && 'Paused'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
};

export default VoiceReader;