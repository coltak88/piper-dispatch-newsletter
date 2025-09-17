import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantumSecurity } from '../security/QuantumSecurityManager';

const Header = ({ 
  user = null, 
  onLogin, 
  onLogout, 
  onNavigate,
  currentPage = 'home',
  showSecurityStatus = true 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'New newsletter available', unread: true },
    { id: 2, type: 'security', message: 'Security scan completed', unread: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { securityLevel, threatLevel } = useQuantumSecurity();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navigationItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'newsletters', label: 'Newsletters', icon: '📰' },
    { id: 'archive', label: 'Archive', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'admin', label: 'Admin', icon: '⚙️', adminOnly: true }
  ];

  const handleNavigation = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
    setIsMenuOpen(false);
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, unread: false }
          : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getSecurityStatusColor = () => {
    if (threatLevel === 'high') return '#f56565';
    if (threatLevel === 'medium') return '#ed8936';
    return '#48bb78';
  };

  const getSecurityStatusIcon = () => {
    switch (securityLevel) {
      case 'quantum': return '🔮';
      case 'advanced': return '⚡';
      case 'standard': return '🛡️';
      default: return '🔒';
    }
  };

  return (
    <motion.header
      className={`header ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="header-container">
        {/* Logo and Brand */}
        <motion.div 
          className="brand"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigation('home')}
        >
          <div className="logo">
            <span className="logo-icon">📡</span>
            <div className="logo-text">
              <span className="brand-name">Piper Dispatch</span>
              <span className="brand-tagline">Strategic Intelligence</span>
            </div>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navigationItems.map((item) => {
            if (item.adminOnly && (!user || !user.isAdmin)) return null;
            
            return (
              <motion.button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Security Status */}
          {showSecurityStatus && (
            <motion.div 
              className="security-status"
              whileHover={{ scale: 1.1 }}
              title={`Security Level: ${securityLevel} | Threat Level: ${threatLevel}`}
            >
              <span 
                className="security-icon"
                style={{ color: getSecurityStatusColor() }}
              >
                {getSecurityStatusIcon()}
              </span>
              <span className="security-level">{securityLevel}</span>
            </motion.div>
          )}

          {/* Notifications */}
          <div className="notifications-container">
            <motion.button
              className="notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                <motion.span 
                  className="notification-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notifications-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                    <button 
                      className="close-notifications"
                      onClick={() => setShowNotifications(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className={`notification-item ${notification.unread ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification.id)}
                          whileHover={{ backgroundColor: '#f7fafc' }}
                        >
                          <span className={`notification-type-icon type-${notification.type}`}>
                            {notification.type === 'security' ? '🛡️' : 
                             notification.type === 'info' ? 'ℹ️' : '📢'}
                          </span>
                          <span className="notification-message">{notification.message}</span>
                          {notification.unread && <span className="unread-dot">•</span>}
                        </motion.div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <span>No notifications</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <motion.button
                className="user-avatar"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavigation('profile')}
              >
                <span className="avatar-icon">{user.avatar || '👤'}</span>
                <span className="user-name">{user.name}</span>
              </motion.button>
              <motion.button
                className="logout-button"
                onClick={onLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <motion.button
              className="login-button"
              onClick={onLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-nav-content">
              {navigationItems.map((item) => {
                if (item.adminOnly && (!user || !user.isAdmin)) return null;
                
                return (
                  <motion.button
                    key={item.id}
                    className={`mobile-nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.id)}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Styles */}
      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e2e8f0;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .header.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .brand {
          cursor: pointer;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .brand-tagline {
          font-size: 12px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #4a5568;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .nav-item.active {
          background: #667eea;
          color: white;
        }

        .nav-icon {
          font-size: 16px;
        }

        .nav-label {
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .security-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f7fafc;
          border-radius: 20px;
          cursor: pointer;
        }

        .security-icon {
          font-size: 16px;
        }

        .security-level {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #4a5568;
        }

        .notifications-container {
          position: relative;
        }

        .notifications-button {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .notifications-button:hover {
          background: #f7fafc;
        }

        .notification-icon {
          font-size: 20px;
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #f56565;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }

        .notifications-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 300px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          margin-top: 8px;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f7fafc;
        }

        .notifications-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .close-notifications {
          background: none;
          border: none;
          cursor: pointer;
          color: #718096;
          font-size: 16px;
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f7fafc;
          transition: background 0.2s ease;
        }

        .notification-item:hover {
          background: #f7fafc;
        }

        .notification-item.unread {
          background: #ebf8ff;
        }

        .notification-type-icon {
          font-size: 16px;
        }

        .notification-message {
          flex: 1;
          font-size: 14px;
          color: #2d3748;
        }

        .unread-dot {
          color: #3182ce;
          font-size: 20px;
        }

        .no-notifications {
          padding: 40px 20px;
          text-align: center;
          color: #718096;
          font-size: 14px;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 20px;
          transition: background 0.2s ease;
        }

        .user-avatar:hover {
          background: #f7fafc;
        }

        .avatar-icon {
          font-size: 20px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #2d3748;
        }

        .login-button,
        .logout-button {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .login-button:hover,
        .logout-button:hover {
          background: #5a67d8;
        }

        .logout-button {
          background: #e2e8f0;
          color: #4a5568;
        }

        .logout-button:hover {
          background: #cbd5e0;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 20px;
        }

        .hamburger span {
          height: 2px;
          background: #4a5568;
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .mobile-nav {
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .mobile-nav-content {
          padding: 20px;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #4a5568;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .mobile-nav-item:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .mobile-nav-item.active {
          background: #667eea;
          color: white;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .header-actions {
            gap: 8px;
          }

          .security-status {
            display: none;
          }

          .user-name {
            display: none;
          }

          .notifications-dropdown {
            width: 280px;
            right: -20px;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0 15px;
          }

          .brand-name {
            font-size: 18px;
          }

          .brand-tagline {
            display: none;
          }
        }
      `}</style>
    </motion.header>
  );
};

export default Header;