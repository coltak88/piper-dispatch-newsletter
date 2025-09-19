/**
 * Content Schedule Component
 * Beautiful, production-ready content scheduling interface
 * with calendar view, team collaboration, and workflow management
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getContentScheduler } from '../services/ContentScheduler';
import './styles/content-schedule.css';

const ContentSchedule = ({
  userRole = 'editor',
  teamMembers = [],
  onScheduleUpdate,
  showTeamView = true,
  enableApprovals = true
}) => {
  // State management
  const [currentView, setCurrentView] = useState('calendar'); // calendar, list, timeline
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    assignedTo: 'all',
    priority: 'all',
    dateRange: 'month'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [teamWorkload, setTeamWorkload] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [draggedSchedule, setDraggedSchedule] = useState(null);

  // Content scheduler instance
  const scheduler = useMemo(() => getContentScheduler(), []);

  // Initialize component
  useEffect(() => {
    initializeScheduler();
  }, []);

  // Load calendar data when date or filters change
  useEffect(() => {
    loadCalendarData();
  }, [selectedDate, filters]);

  // Load team workload
  useEffect(() => {
    if (showTeamView) {
      loadTeamWorkload();
    }
  }, [selectedDate, showTeamView]);

  /**
   * Initialize scheduler
   */
  const initializeScheduler = async () => {
    try {
      setIsLoading(true);
      await loadCalendarData();
      await loadNotifications();
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load calendar data
   */
  const loadCalendarData = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const result = await scheduler.getCalendarView(startDate, endDate, filters);
      
      if (result.success) {
        setCalendarData(result.calendarData);
        setConflicts(result.conflicts);
        
        // Convert to flat array for list view
        const allSchedules = Object.values(result.calendarData).flat();
        setSchedules(allSchedules);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  /**
   * Load team workload
   */
  const loadTeamWorkload = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const workload = scheduler.getTeamWorkload(startDate, endDate);
      setTeamWorkload(workload);
    } catch (error) {
      console.error('Failed to load team workload:', error);
    }
  };

  /**
   * Load notifications
   */
  const loadNotifications = async () => {
    try {
      // Get notifications from scheduler
      const notifications = scheduler.notifications || [];
      setNotifications(notifications.slice(-5)); // Show last 5
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  /**
   * Get date range based on current view
   */
  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    switch (filters.dateRange) {
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        end.setMonth(quarter * 3 + 3, 0);
        break;
      default:
        end.setDate(end.getDate() + 30);
    }
    
    return { startDate: start, endDate: end };
  };

  /**
   * Handle schedule creation
   */
  const handleCreateSchedule = async (scheduleData) => {
    try {
      const result = await scheduler.scheduleContent(scheduleData.contentId, scheduleData);
      
      if (result.success) {
        await loadCalendarData();
        setShowScheduleModal(false);
        
        if (onScheduleUpdate) {
          onScheduleUpdate(result.schedule);
        }
      } else if (result.conflicts) {
        setConflicts(result.conflicts);
        setShowConflictModal(true);
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragStart = (schedule) => {
    setDraggedSchedule(schedule);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newDate) => {
    e.preventDefault();
    
    if (draggedSchedule) {
      try {
        // Update schedule date
        const updatedSchedule = {
          ...draggedSchedule,
          publishDate: newDate
        };
        
        // Check for conflicts
        const conflicts = await scheduler.detectConflicts(updatedSchedule);
        
        if (conflicts.length > 0) {
          setConflicts(conflicts);
          setShowConflictModal(true);
        } else {
          // Update schedule
          await scheduler.updateSchedule(draggedSchedule.id, { publishDate: newDate });
          await loadCalendarData();
        }
      } catch (error) {
        console.error('Failed to update schedule:', error);
      }
      
      setDraggedSchedule(null);
    }
  };

  /**
   * Filter schedules based on search and filters
   */
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      // Search filter
      if (searchQuery && !schedule.contentId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && schedule.status !== filters.status) {
        return false;
      }
      
      // Assigned to filter
      if (filters.assignedTo !== 'all' && schedule.assignedTo !== filters.assignedTo) {
        return false;
      }
      
      // Priority filter
      if (filters.priority !== 'all' && schedule.priority !== filters.priority) {
        return false;
      }
      
      return true;
    });
  }, [schedules, searchQuery, filters]);

  /**
   * Get calendar days for current month
   */
  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#667eea',
      published: '#48bb78',
      failed: '#f56565',
      pending: '#ed8936',
      approved: '#38b2ac',
      rejected: '#e53e3e'
    };
    return colors[status] || '#718096';
  };

  /**
   * Get priority icon
   */
  const getPriorityIcon = (priority) => {
    const icons = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
      urgent: '⚡'
    };
    return icons[priority] || '⚪';
  };

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="schedule-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          📅
        </motion.div>
        <p>Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="content-schedule">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <h1>📅 Content Schedule</h1>
          <p>Manage your content publishing timeline</p>
        </div>
        
        <div className="header-actions">
          <motion.button
            className="create-schedule-btn"
            onClick={() => setShowScheduleModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➕ Schedule Content
          </motion.button>
        </div>
      </div>

      {/* Controls */}
      <div className="schedule-controls">
        <div className="view-controls">
          <div className="view-tabs">
            {['calendar', 'list', 'timeline'].map(view => (
              <button
                key={view}
                className={`view-tab ${currentView === view ? 'active' : ''}`}
                onClick={() => setCurrentView(view)}
              >
                {view === 'calendar' && '📅'}
                {view === 'list' && '📋'}
                {view === 'timeline' && '📊'}
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="date-navigation">
            <button
              className="nav-btn"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
            >
              ←
            </button>
            <span className="current-date">
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <button
              className="nav-btn"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
            >
              →
            </button>
          </div>
        </div>

        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Team</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="schedule-notifications">
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              className="notification"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <span className="notification-icon">🔔</span>
              <span className="notification-message">{notification.message}</span>
              <span className="notification-time">
                {formatDate(notification.timestamp)}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="schedule-content">
        {currentView === 'calendar' && (
          <div className="calendar-view">
            <div className="calendar-grid">
              <div className="calendar-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
              </div>
              
              <div className="calendar-body">
                {getCalendarDays().map((day, index) => {
                  const dateKey = day.toISOString().split('T')[0];
                  const daySchedules = calendarData[dateKey] || [];
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      className={`calendar-day ${
                        isCurrentMonth ? 'current-month' : 'other-month'
                      } ${isToday ? 'today' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="day-number">{day.getDate()}</div>
                      
                      <div className="day-schedules">
                        {daySchedules.slice(0, 3).map(schedule => (
                          <motion.div
                            key={schedule.id}
                            className="schedule-item"
                            style={{ backgroundColor: getStatusColor(schedule.status) }}
                            draggable
                            onDragStart={() => handleDragStart(schedule)}
                            onClick={() => setSelectedSchedule(schedule)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="schedule-priority">
                              {getPriorityIcon(schedule.priority)}
                            </span>
                            <span className="schedule-title">
                              {schedule.contentId.substring(0, 15)}...
                            </span>
                          </motion.div>
                        ))}
                        
                        {daySchedules.length > 3 && (
                          <div className="more-schedules">
                            +{daySchedules.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentView === 'list' && (
          <div className="list-view">
            <div className="schedule-list">
              {filteredSchedules.map(schedule => (
                <motion.div
                  key={schedule.id}
                  className="schedule-list-item"
                  onClick={() => setSelectedSchedule(schedule)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="schedule-info">
                    <div className="schedule-header">
                      <span className="schedule-priority">
                        {getPriorityIcon(schedule.priority)}
                      </span>
                      <h3 className="schedule-title">{schedule.contentId}</h3>
                      <span 
                        className="schedule-status"
                        style={{ backgroundColor: getStatusColor(schedule.status) }}
                      >
                        {schedule.status}
                      </span>
                    </div>
                    
                    <div className="schedule-meta">
                      <span className="schedule-date">
                        📅 {formatDate(schedule.publishDate)}
                      </span>
                      {schedule.assignedTo && (
                        <span className="schedule-assignee">
                          👤 {schedule.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="schedule-actions">
                    <button className="action-btn edit">
                      ✏️
                    </button>
                    <button className="action-btn delete">
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'timeline' && (
          <div className="timeline-view">
            <div className="timeline">
              {filteredSchedules
                .sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate))
                .map((schedule, index) => (
                  <motion.div
                    key={schedule.id}
                    className="timeline-item"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="timeline-marker"
                         style={{ backgroundColor: getStatusColor(schedule.status) }}>
                      {getPriorityIcon(schedule.priority)}
                    </div>
                    
                    <div className="timeline-content">
                      <h4>{schedule.contentId}</h4>
                      <p className="timeline-date">{formatDate(schedule.publishDate)}</p>
                      <p className="timeline-status">Status: {schedule.status}</p>
                      {schedule.assignedTo && (
                        <p className="timeline-assignee">Assigned to: {schedule.assignedTo}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Team Workload Sidebar */}
      {showTeamView && (
        <div className="team-workload">
          <h3>Team Workload</h3>
          <div className="workload-list">
            {Object.entries(teamWorkload).map(([member, workload]) => (
              <div key={member} className="workload-item">
                <div className="member-info">
                  <span className="member-name">{member}</span>
                  <span className="member-total">{workload.totalSchedules}</span>
                </div>
                
                <div className="workload-stats">
                  <div className="stat upcoming">
                    <span className="stat-label">Upcoming</span>
                    <span className="stat-value">{workload.upcomingSchedules}</span>
                  </div>
                  <div className="stat overdue">
                    <span className="stat-label">Overdue</span>
                    <span className="stat-value">{workload.overdueSchedules}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleModal
            onClose={() => setShowScheduleModal(false)}
            onSubmit={handleCreateSchedule}
            teamMembers={teamMembers}
            enableApprovals={enableApprovals}
          />
        )}
      </AnimatePresence>

      {/* Conflict Modal */}
      <AnimatePresence>
        {showConflictModal && (
          <ConflictModal
            conflicts={conflicts}
            onClose={() => setShowConflictModal(false)}
            onResolve={() => {
              setShowConflictModal(false);
              loadCalendarData();
            }}
          />
        )}
      </AnimatePresence>

      {/* Schedule Details Modal */}
      <AnimatePresence>
        {selectedSchedule && (
          <ScheduleDetailsModal
            schedule={selectedSchedule}
            onClose={() => setSelectedSchedule(null)}
            onUpdate={loadCalendarData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Schedule Modal Component
 */
const ScheduleModal = ({ onClose, onSubmit, teamMembers, enableApprovals }) => {
  const [formData, setFormData] = useState({
    contentId: '',
    publishDate: '',
    timezone: 'UTC',
    priority: 'medium',
    assignedTo: '',
    approvalRequired: false,
    recurringPattern: null,
    notifications: {
      enabled: true,
      reminders: ['1h', '15m'],
      channels: ['email', 'in-app']
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content schedule-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📅 Schedule Content</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label>Content ID</label>
            <input
              type="text"
              value={formData.contentId}
              onChange={(e) => setFormData(prev => ({ ...prev, contentId: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Publish Date</label>
              <input
                type="datetime-local"
                value={formData.publishDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
                <option value="urgent">⚡ Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Assign To</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
            >
              <option value="">Select team member</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          
          {enableApprovals && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.approvalRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                />
                Require approval before publishing
              </label>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              📅 Schedule
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/**
 * Conflict Modal Component
 */
const ConflictModal = ({ conflicts, onClose, onResolve }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content conflict-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="modal-header">
          <h2>⚠️ Scheduling Conflicts</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="conflict-list">
          {conflicts.map((conflict, index) => (
            <div key={index} className="conflict-item">
              <div className="conflict-type">{conflict.type}</div>
              <div className="conflict-details">{conflict.message}</div>
              <div className="conflict-severity">{conflict.severity}</div>
            </div>
          ))}
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={onResolve} className="resolve-btn">
            Force Schedule
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Schedule Details Modal Component
 */
const ScheduleDetailsModal = ({ schedule, onClose, onUpdate }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content details-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="modal-header">
          <h2>📋 Schedule Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="schedule-details">
          <div className="detail-section">
            <h3>Content Information</h3>
            <div className="detail-item">
              <span className="label">Content ID:</span>
              <span className="value">{schedule.contentId}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="value">{schedule.status}</span>
            </div>
            <div className="detail-item">
              <span className="label">Priority:</span>
              <span className="value">{schedule.priority}</span>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Schedule Information</h3>
            <div className="detail-item">
              <span className="label">Publish Date:</span>
              <span className="value">{new Date(schedule.publishDate).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Assigned To:</span>
              <span className="value">{schedule.assignedTo || 'Unassigned'}</span>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentSchedule;