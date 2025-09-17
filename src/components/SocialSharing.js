import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SocialSharing = ({ url, title, description }) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || 'Check out this content from Piper Dispatch';

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: '#0077B5'
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: '#1877F2'
    },
    {
      name: 'Reddit',
      icon: '🤖',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      color: '#FF4500'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: '#0088CC'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform) => {
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl
        });
      } catch (err) {
        console.error('Native share failed:', err);
      }
    }
  };

  return (
    <div className="social-sharing">
      <motion.button
        className="share-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share content"
      >
        📤 Share
      </motion.button>

      {isOpen && (
        <motion.div 
          className="share-menu"
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
        >
          <div className="share-platforms">
            {socialPlatforms.map((platform) => (
              <motion.button
                key={platform.name}
                className="share-platform"
                onClick={() => handleShare(platform)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ '--platform-color': platform.color }}
                aria-label={`Share on ${platform.name}`}
              >
                <span className="platform-icon">{platform.icon}</span>
                <span className="platform-name">{platform.name}</span>
              </motion.button>
            ))}
          </div>

          <div className="share-actions">
            {navigator.share && (
              <motion.button
                className="share-native"
                onClick={handleNativeShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📱 Native Share
              </motion.button>
            )}
            
            <motion.button
              className="share-copy"
              onClick={copyToClipboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </motion.button>
          </div>

          <div className="share-url">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="share-url-input"
              onClick={(e) => e.target.select()}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SocialSharing;