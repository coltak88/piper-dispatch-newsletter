/**
 * Unified Dashboard Component
 * Integrates meeting scheduling, communication, and email features
 * Supports multi-platform access (web, mobile, desktop)
 */

import React, { useState, useEffect, useCallback } from 'react';
import './UnifiedDashboard.css';
import AuthenticationService from '../services/AuthenticationService';
import MeetingSchedulingService from '../services/MeetingSchedulingService';
import CommunicationService from '../services/CommunicationService';
import WunaEmailService from '../services/WunaEmailService';
import SubscriptionService from '../services/SubscriptionService';
import EcosystemIntegrationService from '../services/EcosystemIntegrationService';

const UnifiedDashboard = () => {
    // Core services
    const [authService] = useState(() => new AuthenticationService());
    const [meetingService] = useState(() => new MeetingSchedulingService());
    const [communicationService] = useState(() => new CommunicationService());
    const [emailService] = useState(() => new WunaEmailService());
    const [subscriptionService] = useState(() => new SubscriptionService());
    const [ecosystemService] = useState(() => new EcosystemIntegrationService());

    // State management
    const [user, setUser] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        meetings: [],
        messages: [],
        emails: [],
        analytics: {},
        quickActions: []
    });

    // Real-time data
    const [realTimeData, setRealTimeData] = useState({
        activeCalls: 0,
        unreadMessages: 0,
        unreadEmails: 0,
        upcomingMeetings: 0,
        onlineContacts: 0
    });

    // UI state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [mobileView, setMobileView] = useState(false);

    /**
     * Initialize dashboard
     */
    useEffect(() => {
        initializeDashboard();
        setupRealTimeUpdates();
        detectMobileView();
        
        return () => {
            cleanupRealTimeUpdates();
        };
    }, []);

    const initializeDashboard = async () => {
        try {
            setLoading(true);
            
            // Get current user
            const currentUser = await authService.getCurrentUser();
            if (!currentUser) {
                // Redirect to login
                window.location.href = '/login';
                return;
            }
            setUser(currentUser);

            // Get user subscription
            const userSubscription = await subscriptionService.getUserSubscription(currentUser.id);
            setSubscription(userSubscription);

            // Load dashboard data
            await loadDashboardData(currentUser.id);
            
            // Setup ecosystem integration
            await ecosystemService.registerWithOrchestrator({
                userId: currentUser.id,
                dashboardVersion: '1.0.0'
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            setLoading(false);
        }
    };

    const loadDashboardData = async (userId) => {
        try {
            const [meetings, messages, emails, analytics] = await Promise.all([
                meetingService.getUserMeetings(userId, { limit: 10, upcoming: true }),
                communicationService.getRecentMessages(userId, { limit: 20 }),
                emailService.getInboxEmails(userId, { limit: 15, unread: true }),
                getAnalyticsData(userId)
            ]);

            const quickActions = generateQuickActions(userId);

            setDashboardData({
                meetings: meetings || [],
                messages: messages || [],
                emails: emails || [],
                analytics: analytics || {},
                quickActions
            });

            // Update real-time counters
            setRealTimeData({
                activeCalls: await communicationService.getActiveCallsCount(userId),
                unreadMessages: messages?.filter(m => !m.read).length || 0,
                unreadEmails: emails?.filter(e => !e.read).length || 0,
                upcomingMeetings: meetings?.length || 0,
                onlineContacts: await communicationService.getOnlineContactsCount(userId)
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const setupRealTimeUpdates = () => {
        // Setup WebSocket connections for real-time updates
        const updateInterval = setInterval(() => {
            if (user) {
                updateRealTimeData();
            }
        }, 30000); // Update every 30 seconds

        return () => clearInterval(updateInterval);
    };

    const cleanupRealTimeUpdates = () => {
        // Cleanup WebSocket connections
    };

    const updateRealTimeData = async () => {
        if (!user) return;

        try {
            const updates = {
                activeCalls: await communicationService.getActiveCallsCount(user.id),
                unreadMessages: await communicationService.getUnreadMessagesCount(user.id),
                unreadEmails: await emailService.getUnreadEmailsCount(user.id),
                upcomingMeetings: await meetingService.getUpcomingMeetingsCount(user.id),
                onlineContacts: await communicationService.getOnlineContactsCount(user.id)
            };

            setRealTimeData(updates);
        } catch (error) {
            console.error('Failed to update real-time data:', error);
        }
    };

    const detectMobileView = () => {
        const checkMobile = () => {
            setMobileView(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    };

    /**
     * Quick actions generator
     */
    const generateQuickActions = (userId) => {
        const baseActions = [
            {
                id: 'schedule_meeting',
                title: 'Schedule Meeting',
                icon: 'calendar-plus',
                action: () => handleQuickAction('schedule_meeting'),
                color: 'primary'
            },
            {
                id: 'start_call',
                title: 'Start Call',
                icon: 'phone',
                action: () => handleQuickAction('start_call'),
                color: 'success'
            },
            {
                id: 'compose_email',
                title: 'Compose Email',
                icon: 'mail-edit',
                action: () => handleQuickAction('compose_email'),
                color: 'info'
            },
            {
                id: 'join_meeting',
                title: 'Join Meeting',
                icon: 'video',
                action: () => handleQuickAction('join_meeting'),
                color: 'warning'
            }
        ];

        // Add subscription-specific actions
        if (subscription?.planId === 'pro' || subscription?.planId === 'ecosystem_staff') {
            baseActions.push(
                {
                    id: 'analytics',
                    title: 'View Analytics',
                    icon: 'chart-line',
                    action: () => handleQuickAction('analytics'),
                    color: 'secondary'
                },
                {
                    id: 'screen_share',
                    title: 'Screen Share',
                    icon: 'monitor-share',
                    action: () => handleQuickAction('screen_share'),
                    color: 'dark'
                }
            );
        }

        return baseActions;
    };

    /**
     * Event handlers
     */
    const handleQuickAction = async (actionId) => {
        try {
            switch (actionId) {
                case 'schedule_meeting':
                    setActiveView('meetings');
                    // Open meeting scheduler modal
                    break;
                case 'start_call':
                    await communicationService.initiateCall({
                        type: 'voice',
                        userId: user.id
                    });
                    break;
                case 'compose_email':
                    setActiveView('email');
                    // Open email composer
                    break;
                case 'join_meeting':
                    // Show join meeting dialog
                    break;
                case 'analytics':
                    setActiveView('analytics');
                    break;
                case 'screen_share':
                    await communicationService.startScreenShare(user.id);
                    break;
                default:
                    console.warn(`Unknown quick action: ${actionId}`);
            }
        } catch (error) {
            console.error(`Failed to execute quick action ${actionId}:`, error);
            addNotification({
                type: 'error',
                message: `Failed to ${actionId.replace('_', ' ')}`
            });
        }
    };

    const handleViewChange = (view) => {
        setActiveView(view);
        // Track view change for analytics
        if (subscription?.plan?.features?.advanced_analytics) {
            ecosystemService.exchangeData('analytics', 'view_change', {
                userId: user.id,
                view,
                timestamp: new Date().toISOString()
            });
        }
    };

    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
    };

    const removeNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    /**
     * Analytics data fetcher
     */
    const getAnalyticsData = async (userId) => {
        try {
            const analytics = await subscriptionService.getSubscriptionAnalytics(userId);
            return {
                ...analytics,
                dashboardViews: await getDashboardViewAnalytics(userId),
                productivity: await getProductivityMetrics(userId)
            };
        } catch (error) {
            console.error('Failed to get analytics data:', error);
            return {};
        }
    };

    const getDashboardViewAnalytics = async (userId) => {
        // Implementation would fetch dashboard view analytics
        return {
            totalViews: 150,
            averageSessionTime: '12m 34s',
            mostUsedFeature: 'meetings',
            peakUsageHour: '10:00 AM'
        };
    };

    const getProductivityMetrics = async (userId) => {
        // Implementation would calculate productivity metrics
        return {
            meetingsScheduled: 25,
            callsCompleted: 18,
            emailsSent: 42,
            collaborationScore: 85
        };
    };

    /**
     * Render methods
     */
    const renderSidebar = () => (
        <div className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileView ? 'mobile' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <h2>Hybrid</h2>
                </div>
                <button 
                    className="collapse-btn"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    {sidebarCollapsed ? '→' : '←'}
                </button>
            </div>
            
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <h3>Main</h3>
                    <button 
                        className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
                        onClick={() => handleViewChange('overview')}
                    >
                        <span className="icon">📊</span>
                        <span className="label">Overview</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'meetings' ? 'active' : ''}`}
                        onClick={() => handleViewChange('meetings')}
                    >
                        <span className="icon">📅</span>
                        <span className="label">Meetings</span>
                        {realTimeData.upcomingMeetings > 0 && (
                            <span className="badge">{realTimeData.upcomingMeetings}</span>
                        )}
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'communication' ? 'active' : ''}`}
                        onClick={() => handleViewChange('communication')}
                    >
                        <span className="icon">💬</span>
                        <span className="label">Messages</span>
                        {realTimeData.unreadMessages > 0 && (
                            <span className="badge">{realTimeData.unreadMessages}</span>
                        )}
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'email' ? 'active' : ''}`}
                        onClick={() => handleViewChange('email')}
                    >
                        <span className="icon">📧</span>
                        <span className="label">Wuna Mail</span>
                        {realTimeData.unreadEmails > 0 && (
                            <span className="badge">{realTimeData.unreadEmails}</span>
                        )}
                    </button>
                </div>
                
                <div className="nav-section">
                    <h3>Tools</h3>
                    <button 
                        className={`nav-item ${activeView === 'contacts' ? 'active' : ''}`}
                        onClick={() => handleViewChange('contacts')}
                    >
                        <span className="icon">👥</span>
                        <span className="label">Contacts</span>
                        <span className="status-indicator online">{realTimeData.onlineContacts}</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'files' ? 'active' : ''}`}
                        onClick={() => handleViewChange('files')}
                    >
                        <span className="icon">📁</span>
                        <span className="label">Files</span>
                    </button>
                    {(subscription?.plan?.features?.advanced_analytics) && (
                        <button 
                            className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
                            onClick={() => handleViewChange('analytics')}
                        >
                            <span className="icon">📈</span>
                            <span className="label">Analytics</span>
                        </button>
                    )}
                </div>
                
                <div className="nav-section">
                    <h3>Account</h3>
                    <button 
                        className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
                        onClick={() => handleViewChange('settings')}
                    >
                        <span className="icon">⚙️</span>
                        <span className="label">Settings</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'subscription' ? 'active' : ''}`}
                        onClick={() => handleViewChange('subscription')}
                    >
                        <span className="icon">💳</span>
                        <span className="label">Subscription</span>
                        <span className="plan-badge">{subscription?.plan?.name}</span>
                    </button>
                </div>
            </nav>
        </div>
    );

    const renderTopBar = () => (
        <div className="dashboard-topbar">
            <div className="topbar-left">
                <h1 className="page-title">
                    {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h1>
            </div>
            
            <div className="topbar-center">
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Search meetings, messages, emails..."
                        className="search-input"
                    />
                    <button className="search-btn">🔍</button>
                </div>
            </div>
            
            <div className="topbar-right">
                <div className="status-indicators">
                    {realTimeData.activeCalls > 0 && (
                        <div className="status-item active-call">
                            <span className="icon">📞</span>
                            <span className="count">{realTimeData.activeCalls}</span>
                        </div>
                    )}
                </div>
                
                <div className="notifications-dropdown">
                    <button className="notifications-btn">
                        🔔
                        {notifications.length > 0 && (
                            <span className="notification-badge">{notifications.length}</span>
                        )}
                    </button>
                </div>
                
                <div className="user-menu">
                    <div className="user-avatar">
                        <img 
                            src={user?.avatar || '/default-avatar.png'} 
                            alt={user?.name || 'User'}
                        />
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-status">Online</span>
                    </div>
                </div>
                
                <button 
                    className="theme-toggle"
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </div>
        </div>
    );

    const renderQuickActions = () => (
        <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
                {dashboardData.quickActions.map(action => (
                    <button
                        key={action.id}
                        className={`quick-action-btn ${action.color}`}
                        onClick={action.action}
                    >
                        <span className="action-icon">{action.icon}</span>
                        <span className="action-title">{action.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderOverviewContent = () => (
        <div className="overview-content">
            <div className="overview-grid">
                <div className="overview-section quick-stats">
                    <h3>Today's Overview</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{realTimeData.upcomingMeetings}</div>
                            <div className="stat-label">Upcoming Meetings</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{realTimeData.unreadMessages}</div>
                            <div className="stat-label">Unread Messages</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{realTimeData.unreadEmails}</div>
                            <div className="stat-label">Unread Emails</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{realTimeData.onlineContacts}</div>
                            <div className="stat-label">Online Contacts</div>
                        </div>
                    </div>
                </div>
                
                <div className="overview-section recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {dashboardData.meetings.slice(0, 3).map(meeting => (
                            <div key={meeting.id} className="activity-item">
                                <span className="activity-icon">📅</span>
                                <div className="activity-content">
                                    <div className="activity-title">{meeting.title}</div>
                                    <div className="activity-time">{meeting.startTime}</div>
                                </div>
                            </div>
                        ))}
                        {dashboardData.messages.slice(0, 2).map(message => (
                            <div key={message.id} className="activity-item">
                                <span className="activity-icon">💬</span>
                                <div className="activity-content">
                                    <div className="activity-title">{message.sender}: {message.preview}</div>
                                    <div className="activity-time">{message.timestamp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {renderQuickActions()}
            </div>
        </div>
    );

    const renderMainContent = () => {
        switch (activeView) {
            case 'overview':
                return renderOverviewContent();
            case 'meetings':
                return <div className="meetings-content">Meetings content will be implemented here</div>;
            case 'communication':
                return <div className="communication-content">Communication content will be implemented here</div>;
            case 'email':
                return <div className="email-content">Email content will be implemented here</div>;
            case 'contacts':
                return <div className="contacts-content">Contacts content will be implemented here</div>;
            case 'files':
                return <div className="files-content">Files content will be implemented here</div>;
            case 'analytics':
                return <div className="analytics-content">Analytics content will be implemented here</div>;
            case 'settings':
                return <div className="settings-content">Settings content will be implemented here</div>;
            case 'subscription':
                return <div className="subscription-content">Subscription content will be implemented here</div>;
            default:
                return renderOverviewContent();
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className={`unified-dashboard ${darkMode ? 'dark-mode' : ''} ${mobileView ? 'mobile-view' : ''}`}>
            {renderSidebar()}
            
            <div className="dashboard-main">
                {renderTopBar()}
                
                <div className="dashboard-content">
                    {renderMainContent()}
                </div>
            </div>
            
            {notifications.length > 0 && (
                <div className="notifications-panel">
                    {notifications.map(notification => (
                        <div key={notification.id} className={`notification ${notification.type}`}>
                            <div className="notification-content">
                                <div className="notification-message">{notification.message}</div>
                                <div className="notification-time">{notification.timestamp}</div>
                            </div>
                            <button 
                                className="notification-close"
                                onClick={() => removeNotification(notification.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UnifiedDashboard;