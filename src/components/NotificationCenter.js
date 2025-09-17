import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = ({ notifications = [], onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    if (onDismiss) onDismiss(id);
  };

  return (
    <div className="notification-center">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`notification notification--${notification.type}`}
          >
            <div className="notification__content">
              <h4 className="notification__title">{notification.title}</h4>
              <p className="notification__message">{notification.message}</p>
            </div>
            <button
              className="notification__dismiss"
              onClick={() => handleDismiss(notification.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;