/**
 * Personal Assistant Dashboard Component
 * Comprehensive AI-powered personal assistant interface with secretarial/PA capabilities
 * Integrates phone management, appointments, meetings, and AI insights
 */

import React, { useState, useEffect, useRef } from 'react';
import AIPersonalAssistant from '../services/AIPersonalAssistant';
import PhoneManager from '../services/PhoneManager';
import AppointmentManager from '../services/AppointmentManager';
import MeetingManager from '../services/MeetingManager';
import AINoteTaker from '../services/AINoteTaker';
import InsightsEngine from '../services/InsightsEngine';
import './PersonalAssistant.css';

const PersonalAssistant = () => {
    // Core state management
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [aiStatus, setAiStatus] = useState('initializing');
    
    // Service instances
    const aiAssistantRef = useRef(null);
    const phoneManagerRef = useRef(null);
    const appointmentManagerRef = useRef(null);
    const meetingManagerRef = useRef(null);
    const notesTakerRef = useRef(null);
    const insightsEngineRef = useRef(null);
    
    // Dashboard data state
    const [dashboardData, setDashboardData] = useState({
        todaysAppointments: [],
        upcomingMeetings: [],
        recentCalls: [],
        pendingTasks: [],
        insights: [],
        systemStatus: {}
    });
    
    // Phone management state
    const [phoneState, setPhoneState] = useState({
        incomingCall: null,
        activeCall: null,
        callHistory: [],
        voicemails: [],
        callQueue: []
    });
    
    // Appointment management state
    const [appointmentState, setAppointmentState] = useState({
        todaysAppointments: [],
        upcomingAppointments: [],
        appointmentRequests: [],
        calendarConflicts: [],
        availableSlots: []
    });
    
    // Meeting management state
    const [meetingState, setMeetingState] = useState({
        activeMeeting: null,
        upcomingMeetings: [],
        meetingPreparation: [],
        recordingStatus: 'inactive',
        liveNotes: '',
        participants: []
    });
    
    // AI insights state
    const [insightsState, setInsightsState] = useState({
        dailyInsights: [],
        weeklyTrends: [],
        recommendations: [],
        performanceMetrics: {},
        collaborationAnalysis: {}
    });
    
    // Chat interface state
    const [chatState, setChatState] = useState({
        messages: [],
        isTyping: false,
        inputValue: '',
        suggestions: []
    });

    // Initialize AI Personal Assistant system
    useEffect(() => {
        const initializeSystem = async () => {
            try {
                setIsLoading(true);
                setAiStatus('initializing');
                
                // Initialize core AI assistant
                aiAssistantRef.current = new AIPersonalAssistant();
                await aiAssistantRef.current.initialize();
                
                // Initialize specialized services
                phoneManagerRef.current = new PhoneManager(aiAssistantRef.current);
                await phoneManagerRef.current.initialize();
                
                appointmentManagerRef.current = new AppointmentManager(aiAssistantRef.current);
                await appointmentManagerRef.current.initialize();
                
                meetingManagerRef.current = new MeetingManager(aiAssistantRef.current);
                await meetingManagerRef.current.initialize();
                
                notesTakerRef.current = new AINoteTaker(aiAssistantRef.current);
                await notesTakerRef.current.initialize();
                
                insightsEngineRef.current = new InsightsEngine(aiAssistantRef.current);
                await insightsEngineRef.current.initialize();
                
                // Setup event listeners
                setupEventListeners();
                
                // Load initial data
                await loadDashboardData();
                
                setIsInitialized(true);
                setAiStatus('active');
                setIsLoading(false);
                
                // Add welcome notification
                addNotification({
                    type: 'success',
                    title: 'AI Personal Assistant Ready',
                    message: 'Your AI PA is now active and ready to assist you.',
                    timestamp: new Date()
                });
                
            } catch (error) {
                console.error('Failed to initialize AI Personal Assistant:', error);
                setAiStatus('error');
                setIsLoading(false);
                addNotification({
                    type: 'error',
                    title: 'Initialization Failed',
                    message: 'Failed to initialize AI Personal Assistant. Please try again.',
                    timestamp: new Date()
                });
            }
        };
        
        initializeSystem();
        
        // Cleanup on unmount
        return () => {
            if (aiAssistantRef.current) {
                aiAssistantRef.current.shutdown();
            }
        };
    }, []);
    
    // Setup event listeners for real-time updates
    const setupEventListeners = () => {
        // Phone events
        if (phoneManagerRef.current) {
            phoneManagerRef.current.on('incomingCall', handleIncomingCall);
            phoneManagerRef.current.on('callEnded', handleCallEnded);
            phoneManagerRef.current.on('voicemailReceived', handleVoicemailReceived);
        }
        
        // Appointment events
        if (appointmentManagerRef.current) {
            appointmentManagerRef.current.on('appointmentReminder', handleAppointmentReminder);
            appointmentManagerRef.current.on('appointmentRequest', handleAppointmentRequest);
            appointmentManagerRef.current.on('calendarConflict', handleCalendarConflict);
        }
        
        // Meeting events
        if (meetingManagerRef.current) {
            meetingManagerRef.current.on('meetingStarting', handleMeetingStarting);
            meetingManagerRef.current.on('meetingEnded', handleMeetingEnded);
            meetingManagerRef.current.on('participantJoined', handleParticipantJoined);
        }
        
        // AI insights events
        if (insightsEngineRef.current) {
            insightsEngineRef.current.on('newInsight', handleNewInsight);
            insightsEngineRef.current.on('recommendationGenerated', handleRecommendationGenerated);
        }
    };
    
    // Load dashboard data
    const loadDashboardData = async () => {
        try {
            const [appointments, meetings, calls, tasks, insights] = await Promise.all([
                appointmentManagerRef.current?.getTodaysAppointments() || [],
                meetingManagerRef.current?.getUpcomingMeetings() || [],
                phoneManagerRef.current?.getRecentCalls() || [],
                aiAssistantRef.current?.getPendingTasks() || [],
                insightsEngineRef.current?.getDailyInsights() || []
            ]);
            
            setDashboardData({
                todaysAppointments: appointments,
                upcomingMeetings: meetings,
                recentCalls: calls,
                pendingTasks: tasks,
                insights: insights,
                systemStatus: {
                    phone: phoneManagerRef.current?.getStatus() || 'inactive',
                    appointments: appointmentManagerRef.current?.getStatus() || 'inactive',
                    meetings: meetingManagerRef.current?.getStatus() || 'inactive',
                    ai: aiStatus
                }
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };
    
    // Event handlers
    const handleIncomingCall = (callData) => {
        setPhoneState(prev => ({ ...prev, incomingCall: callData }));
        addNotification({
            type: 'info',
            title: 'Incoming Call',
            message: `Call from ${callData.caller}`,
            timestamp: new Date(),
            actions: [
                { label: 'Answer', action: () => answerCall(callData.id) },
                { label: 'Decline', action: () => declineCall(callData.id) }
            ]
        });
    };
    
    const handleCallEnded = (callData) => {
        setPhoneState(prev => ({ 
            ...prev, 
            activeCall: null,
            callHistory: [callData, ...prev.callHistory]
        }));
        addNotification({
            type: 'info',
            title: 'Call Ended',
            message: `Call with ${callData.caller} ended (${callData.duration})`,
            timestamp: new Date()
        });
    };
    
    const handleVoicemailReceived = (voicemailData) => {
        setPhoneState(prev => ({ 
            ...prev, 
            voicemails: [voicemailData, ...prev.voicemails]
        }));
        addNotification({
            type: 'info',
            title: 'New Voicemail',
            message: `Voicemail from ${voicemailData.caller}`,
            timestamp: new Date(),
            actions: [
                { label: 'Listen', action: () => playVoicemail(voicemailData.id) }
            ]
        });
    };
    
    const handleAppointmentReminder = (appointmentData) => {
        addNotification({
            type: 'warning',
            title: 'Appointment Reminder',
            message: `${appointmentData.title} in ${appointmentData.timeUntil}`,
            timestamp: new Date(),
            actions: [
                { label: 'Prepare', action: () => prepareForAppointment(appointmentData.id) },
                { label: 'Reschedule', action: () => rescheduleAppointment(appointmentData.id) }
            ]
        });
    };
    
    const handleAppointmentRequest = (requestData) => {
        setAppointmentState(prev => ({ 
            ...prev, 
            appointmentRequests: [requestData, ...prev.appointmentRequests]
        }));
        addNotification({
            type: 'info',
            title: 'Appointment Request',
            message: `${requestData.requester} wants to schedule a meeting`,
            timestamp: new Date(),
            actions: [
                { label: 'Accept', action: () => acceptAppointmentRequest(requestData.id) },
                { label: 'Suggest Alternative', action: () => suggestAlternativeTime(requestData.id) }
            ]
        });
    };
    
    const handleCalendarConflict = (conflictData) => {
        addNotification({
            type: 'error',
            title: 'Calendar Conflict',
            message: `Conflict detected for ${conflictData.appointment}`,
            timestamp: new Date(),
            actions: [
                { label: 'Resolve', action: () => resolveCalendarConflict(conflictData.id) }
            ]
        });
    };
    
    const handleMeetingStarting = (meetingData) => {
        setMeetingState(prev => ({ ...prev, activeMeeting: meetingData }));
        addNotification({
            type: 'info',
            title: 'Meeting Starting',
            message: `${meetingData.title} is about to begin`,
            timestamp: new Date(),
            actions: [
                { label: 'Join', action: () => joinMeeting(meetingData.id) },
                { label: 'Start Recording', action: () => startMeetingRecording(meetingData.id) }
            ]
        });
    };
    
    const handleMeetingEnded = (meetingData) => {
        setMeetingState(prev => ({ ...prev, activeMeeting: null }));
        addNotification({
            type: 'success',
            title: 'Meeting Ended',
            message: `${meetingData.title} has concluded`,
            timestamp: new Date(),
            actions: [
                { label: 'View Summary', action: () => viewMeetingSummary(meetingData.id) },
                { label: 'Generate Report', action: () => generateMeetingReport(meetingData.id) }
            ]
        });
    };
    
    const handleParticipantJoined = (participantData) => {
        setMeetingState(prev => ({ 
            ...prev, 
            participants: [...prev.participants, participantData]
        }));
    };
    
    const handleNewInsight = (insightData) => {
        setInsightsState(prev => ({ 
            ...prev, 
            dailyInsights: [insightData, ...prev.dailyInsights]
        }));
        addNotification({
            type: 'info',
            title: 'New Insight',
            message: insightData.summary,
            timestamp: new Date()
        });
    };
    
    const handleRecommendationGenerated = (recommendationData) => {
        setInsightsState(prev => ({ 
            ...prev, 
            recommendations: [recommendationData, ...prev.recommendations]
        }));
        addNotification({
            type: 'info',
            title: 'New Recommendation',
            message: recommendationData.title,
            timestamp: new Date()
        });
    };
    
    // Utility functions
    const addNotification = (notification) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [{ ...notification, id }, ...prev.slice(0, 9)]);
        
        // Auto-remove notification after 10 seconds if no actions
        if (!notification.actions) {
            setTimeout(() => {
                removeNotification(id);
            }, 10000);
        }
    };
    
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    // Action handlers
    const answerCall = async (callId) => {
        try {
            await phoneManagerRef.current.answerCall(callId);
            setPhoneState(prev => ({ 
                ...prev, 
                incomingCall: null,
                activeCall: prev.incomingCall
            }));
        } catch (error) {
            console.error('Failed to answer call:', error);
        }
    };
    
    const declineCall = async (callId) => {
        try {
            await phoneManagerRef.current.declineCall(callId);
            setPhoneState(prev => ({ ...prev, incomingCall: null }));
        } catch (error) {
            console.error('Failed to decline call:', error);
        }
    };
    
    const playVoicemail = async (voicemailId) => {
        try {
            await phoneManagerRef.current.playVoicemail(voicemailId);
        } catch (error) {
            console.error('Failed to play voicemail:', error);
        }
    };
    
    const prepareForAppointment = async (appointmentId) => {
        try {
            await appointmentManagerRef.current.prepareForAppointment(appointmentId);
            addNotification({
                type: 'success',
                title: 'Appointment Prepared',
                message: 'Meeting materials and agenda are ready',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to prepare for appointment:', error);
        }
    };
    
    const rescheduleAppointment = async (appointmentId) => {
        try {
            const result = await appointmentManagerRef.current.rescheduleAppointment(appointmentId);
            addNotification({
                type: 'success',
                title: 'Appointment Rescheduled',
                message: `Moved to ${result.newTime}`,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to reschedule appointment:', error);
        }
    };
    
    const acceptAppointmentRequest = async (requestId) => {
        try {
            await appointmentManagerRef.current.acceptAppointmentRequest(requestId);
            addNotification({
                type: 'success',
                title: 'Appointment Confirmed',
                message: 'Meeting has been scheduled',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to accept appointment request:', error);
        }
    };
    
    const suggestAlternativeTime = async (requestId) => {
        try {
            const alternatives = await appointmentManagerRef.current.suggestAlternativeTimes(requestId);
            addNotification({
                type: 'info',
                title: 'Alternative Times Suggested',
                message: `${alternatives.length} alternative times sent`,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to suggest alternative times:', error);
        }
    };
    
    const resolveCalendarConflict = async (conflictId) => {
        try {
            await appointmentManagerRef.current.resolveConflict(conflictId);
            addNotification({
                type: 'success',
                title: 'Conflict Resolved',
                message: 'Calendar conflict has been resolved',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to resolve calendar conflict:', error);
        }
    };
    
    const joinMeeting = async (meetingId) => {
        try {
            await meetingManagerRef.current.joinMeeting(meetingId);
            addNotification({
                type: 'success',
                title: 'Joined Meeting',
                message: 'Successfully joined the meeting',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to join meeting:', error);
        }
    };
    
    const startMeetingRecording = async (meetingId) => {
        try {
            await notesTakerRef.current.startRecording(meetingId);
            setMeetingState(prev => ({ ...prev, recordingStatus: 'active' }));
            addNotification({
                type: 'success',
                title: 'Recording Started',
                message: 'Meeting recording and note-taking active',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to start meeting recording:', error);
        }
    };
    
    const viewMeetingSummary = async (meetingId) => {
        try {
            const summary = await insightsEngineRef.current.generateMeetingSummary({ id: meetingId });
            // Navigate to summary view or open modal
            console.log('Meeting summary:', summary);
        } catch (error) {
            console.error('Failed to view meeting summary:', error);
        }
    };
    
    const generateMeetingReport = async (meetingId) => {
        try {
            const report = await insightsEngineRef.current.generateMeetingInsights({ id: meetingId });
            addNotification({
                type: 'success',
                title: 'Report Generated',
                message: 'Meeting report is ready for review',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to generate meeting report:', error);
        }
    };
    
    // Chat functionality
    const handleChatSubmit = async (message) => {
        if (!message.trim()) return;
        
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        
        setChatState(prev => ({ 
            ...prev, 
            messages: [...prev.messages, userMessage],
            inputValue: '',
            isTyping: true
        }));
        
        try {
            const response = await aiAssistantRef.current.processMessage(message);
            
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.message,
                timestamp: new Date(),
                actions: response.actions || []
            };
            
            setChatState(prev => ({ 
                ...prev, 
                messages: [...prev.messages, aiMessage],
                isTyping: false
            }));
        } catch (error) {
            console.error('Failed to process chat message:', error);
            setChatState(prev => ({ ...prev, isTyping: false }));
        }
    };
    
    // Render loading state
    if (isLoading) {
        return (
            <div className="personal-assistant-loading">
                <div className="loading-spinner"></div>
                <h2>Initializing AI Personal Assistant</h2>
                <p>Setting up your intelligent PA system...</p>
                <div className="loading-status">
                    Status: {aiStatus}
                </div>
            </div>
        );
    }
    
    // Main render
    return (
        <div className="personal-assistant">
            {/* Header */}
            <header className="pa-header">
                <div className="pa-header-left">
                    <h1>AI Personal Assistant</h1>
                    <div className="pa-status">
                        <span className={`status-indicator ${aiStatus}`}></span>
                        <span className="status-text">{aiStatus}</span>
                    </div>
                </div>
                <div className="pa-header-right">
                    <div className="pa-notifications">
                        <button className="notifications-toggle">
                            <span className="notification-icon">🔔</span>
                            {notifications.length > 0 && (
                                <span className="notification-count">{notifications.length}</span>
                            )}
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Navigation */}
            <nav className="pa-navigation">
                <button 
                    className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'phone' ? 'active' : ''}`}
                    onClick={() => setActiveTab('phone')}
                >
                    📞 Phone
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    📅 Appointments
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'meetings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('meetings')}
                >
                    🎥 Meetings
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'insights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('insights')}
                >
                    🧠 Insights
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    💬 AI Chat
                </button>
            </nav>
            
            {/* Main Content */}
            <main className="pa-main">
                {/* Notifications Panel */}
                {notifications.length > 0 && (
                    <div className="notifications-panel">
                        {notifications.slice(0, 3).map(notification => (
                            <div key={notification.id} className={`notification ${notification.type}`}>
                                <div className="notification-content">
                                    <h4>{notification.title}</h4>
                                    <p>{notification.message}</p>
                                    <span className="notification-time">
                                        {notification.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                                {notification.actions && (
                                    <div className="notification-actions">
                                        {notification.actions.map((action, index) => (
                                            <button 
                                                key={index}
                                                className="notification-action"
                                                onClick={action.action}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                
                {/* Tab Content */}
                <div className="pa-content">
                    {activeTab === 'dashboard' && (
                        <DashboardTab 
                            data={dashboardData}
                            onRefresh={loadDashboardData}
                        />
                    )}
                    
                    {activeTab === 'phone' && (
                        <PhoneTab 
                            phoneState={phoneState}
                            phoneManager={phoneManagerRef.current}
                            onAnswer={answerCall}
                            onDecline={declineCall}
                            onPlayVoicemail={playVoicemail}
                        />
                    )}
                    
                    {activeTab === 'appointments' && (
                        <AppointmentsTab 
                            appointmentState={appointmentState}
                            appointmentManager={appointmentManagerRef.current}
                            onAcceptRequest={acceptAppointmentRequest}
                            onSuggestAlternative={suggestAlternativeTime}
                            onPrepare={prepareForAppointment}
                        />
                    )}
                    
                    {activeTab === 'meetings' && (
                        <MeetingsTab 
                            meetingState={meetingState}
                            meetingManager={meetingManagerRef.current}
                            notesTaker={notesTakerRef.current}
                            onJoin={joinMeeting}
                            onStartRecording={startMeetingRecording}
                        />
                    )}
                    
                    {activeTab === 'insights' && (
                        <InsightsTab 
                            insightsState={insightsState}
                            insightsEngine={insightsEngineRef.current}
                        />
                    )}
                    
                    {activeTab === 'chat' && (
                        <ChatTab 
                            chatState={chatState}
                            onSendMessage={handleChatSubmit}
                            onInputChange={(value) => setChatState(prev => ({ ...prev, inputValue: value }))}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

// Dashboard Tab Component
const DashboardTab = ({ data, onRefresh }) => {
    return (
        <div className="dashboard-tab">
            <div className="dashboard-header">
                <h2>Personal Assistant Dashboard</h2>
                <button className="refresh-button" onClick={onRefresh}>
                    🔄 Refresh
                </button>
            </div>
            
            <div className="dashboard-grid">
                {/* System Status */}
                <div className="dashboard-card system-status">
                    <h3>System Status</h3>
                    <div className="status-grid">
                        <div className="status-item">
                            <span className="status-label">Phone:</span>
                            <span className={`status-value ${data.systemStatus.phone}`}>
                                {data.systemStatus.phone}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Appointments:</span>
                            <span className={`status-value ${data.systemStatus.appointments}`}>
                                {data.systemStatus.appointments}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Meetings:</span>
                            <span className={`status-value ${data.systemStatus.meetings}`}>
                                {data.systemStatus.meetings}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">AI:</span>
                            <span className={`status-value ${data.systemStatus.ai}`}>
                                {data.systemStatus.ai}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Today's Appointments */}
                <div className="dashboard-card appointments">
                    <h3>Today's Appointments</h3>
                    <div className="appointments-list">
                        {data.todaysAppointments.length > 0 ? (
                            data.todaysAppointments.map(appointment => (
                                <div key={appointment.id} className="appointment-item">
                                    <div className="appointment-time">{appointment.time}</div>
                                    <div className="appointment-details">
                                        <div className="appointment-title">{appointment.title}</div>
                                        <div className="appointment-client">{appointment.client}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No appointments today</div>
                        )}
                    </div>
                </div>
                
                {/* Upcoming Meetings */}
                <div className="dashboard-card meetings">
                    <h3>Upcoming Meetings</h3>
                    <div className="meetings-list">
                        {data.upcomingMeetings.length > 0 ? (
                            data.upcomingMeetings.map(meeting => (
                                <div key={meeting.id} className="meeting-item">
                                    <div className="meeting-time">{meeting.time}</div>
                                    <div className="meeting-details">
                                        <div className="meeting-title">{meeting.title}</div>
                                        <div className="meeting-participants">
                                            {meeting.participants.length} participants
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No upcoming meetings</div>
                        )}
                    </div>
                </div>
                
                {/* Recent Calls */}
                <div className="dashboard-card calls">
                    <h3>Recent Calls</h3>
                    <div className="calls-list">
                        {data.recentCalls.length > 0 ? (
                            data.recentCalls.slice(0, 5).map(call => (
                                <div key={call.id} className="call-item">
                                    <div className="call-type">
                                        {call.type === 'incoming' ? '📞' : '📱'}
                                    </div>
                                    <div className="call-details">
                                        <div className="call-contact">{call.contact}</div>
                                        <div className="call-time">{call.time}</div>
                                    </div>
                                    <div className="call-duration">{call.duration}</div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No recent calls</div>
                        )}
                    </div>
                </div>
                
                {/* Pending Tasks */}
                <div className="dashboard-card tasks">
                    <h3>Pending Tasks</h3>
                    <div className="tasks-list">
                        {data.pendingTasks.length > 0 ? (
                            data.pendingTasks.map(task => (
                                <div key={task.id} className="task-item">
                                    <div className="task-priority">
                                        <span className={`priority-indicator ${task.priority}`}></span>
                                    </div>
                                    <div className="task-details">
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-due">{task.dueDate}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No pending tasks</div>
                        )}
                    </div>
                </div>
                
                {/* AI Insights */}
                <div className="dashboard-card insights">
                    <h3>AI Insights</h3>
                    <div className="insights-list">
                        {data.insights.length > 0 ? (
                            data.insights.slice(0, 3).map(insight => (
                                <div key={insight.id} className="insight-item">
                                    <div className="insight-type">{insight.type}</div>
                                    <div className="insight-content">{insight.content}</div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No insights available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Phone Tab Component
const PhoneTab = ({ phoneState, phoneManager, onAnswer, onDecline, onPlayVoicemail }) => {
    return (
        <div className="phone-tab">
            <h2>Phone Management</h2>
            
            {/* Incoming Call */}
            {phoneState.incomingCall && (
                <div className="incoming-call">
                    <h3>Incoming Call</h3>
                    <div className="caller-info">
                        <div className="caller-name">{phoneState.incomingCall.caller}</div>
                        <div className="caller-number">{phoneState.incomingCall.number}</div>
                    </div>
                    <div className="call-actions">
                        <button 
                            className="answer-button"
                            onClick={() => onAnswer(phoneState.incomingCall.id)}
                        >
                            📞 Answer
                        </button>
                        <button 
                            className="decline-button"
                            onClick={() => onDecline(phoneState.incomingCall.id)}
                        >
                            📵 Decline
                        </button>
                    </div>
                </div>
            )}
            
            {/* Active Call */}
            {phoneState.activeCall && (
                <div className="active-call">
                    <h3>Active Call</h3>
                    <div className="call-info">
                        <div className="caller-name">{phoneState.activeCall.caller}</div>
                        <div className="call-duration">{phoneState.activeCall.duration}</div>
                    </div>
                    <div className="call-controls">
                        <button className="mute-button">🔇 Mute</button>
                        <button className="hold-button">⏸️ Hold</button>
                        <button className="end-button">📞 End Call</button>
                    </div>
                </div>
            )}
            
            {/* Voicemails */}
            <div className="voicemails-section">
                <h3>Voicemails ({phoneState.voicemails.length})</h3>
                <div className="voicemails-list">
                    {phoneState.voicemails.map(voicemail => (
                        <div key={voicemail.id} className="voicemail-item">
                            <div className="voicemail-info">
                                <div className="voicemail-caller">{voicemail.caller}</div>
                                <div className="voicemail-time">{voicemail.timestamp}</div>
                                <div className="voicemail-duration">{voicemail.duration}</div>
                            </div>
                            <button 
                                className="play-button"
                                onClick={() => onPlayVoicemail(voicemail.id)}
                            >
                                ▶️ Play
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Call History */}
            <div className="call-history-section">
                <h3>Call History</h3>
                <div className="call-history-list">
                    {phoneState.callHistory.map(call => (
                        <div key={call.id} className="call-history-item">
                            <div className="call-type">
                                {call.type === 'incoming' ? '📞' : '📱'}
                            </div>
                            <div className="call-info">
                                <div className="call-contact">{call.contact}</div>
                                <div className="call-time">{call.timestamp}</div>
                            </div>
                            <div className="call-duration">{call.duration}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Appointments Tab Component
const AppointmentsTab = ({ appointmentState, appointmentManager, onAcceptRequest, onSuggestAlternative, onPrepare }) => {
    return (
        <div className="appointments-tab">
            <h2>Appointment Management</h2>
            
            {/* Appointment Requests */}
            {appointmentState.appointmentRequests.length > 0 && (
                <div className="appointment-requests">
                    <h3>Pending Requests ({appointmentState.appointmentRequests.length})</h3>
                    <div className="requests-list">
                        {appointmentState.appointmentRequests.map(request => (
                            <div key={request.id} className="request-item">
                                <div className="request-info">
                                    <div className="requester-name">{request.requester}</div>
                                    <div className="requested-time">{request.requestedTime}</div>
                                    <div className="request-purpose">{request.purpose}</div>
                                </div>
                                <div className="request-actions">
                                    <button 
                                        className="accept-button"
                                        onClick={() => onAcceptRequest(request.id)}
                                    >
                                        ✅ Accept
                                    </button>
                                    <button 
                                        className="suggest-button"
                                        onClick={() => onSuggestAlternative(request.id)}
                                    >
                                        📅 Suggest Alternative
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Today's Appointments */}
            <div className="todays-appointments">
                <h3>Today's Schedule</h3>
                <div className="appointments-list">
                    {appointmentState.todaysAppointments.map(appointment => (
                        <div key={appointment.id} className="appointment-item">
                            <div className="appointment-time">{appointment.time}</div>
                            <div className="appointment-info">
                                <div className="appointment-title">{appointment.title}</div>
                                <div className="appointment-client">{appointment.client}</div>
                                <div className="appointment-location">{appointment.location}</div>
                            </div>
                            <div className="appointment-actions">
                                <button 
                                    className="prepare-button"
                                    onClick={() => onPrepare(appointment.id)}
                                >
                                    📋 Prepare
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Upcoming Appointments */}
            <div className="upcoming-appointments">
                <h3>Upcoming Appointments</h3>
                <div className="appointments-list">
                    {appointmentState.upcomingAppointments.map(appointment => (
                        <div key={appointment.id} className="appointment-item">
                            <div className="appointment-date">{appointment.date}</div>
                            <div className="appointment-time">{appointment.time}</div>
                            <div className="appointment-info">
                                <div className="appointment-title">{appointment.title}</div>
                                <div className="appointment-client">{appointment.client}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Calendar Conflicts */}
            {appointmentState.calendarConflicts.length > 0 && (
                <div className="calendar-conflicts">
                    <h3>Calendar Conflicts</h3>
                    <div className="conflicts-list">
                        {appointmentState.calendarConflicts.map(conflict => (
                            <div key={conflict.id} className="conflict-item">
                                <div className="conflict-info">
                                    <div className="conflict-appointments">
                                        {conflict.appointments.join(' vs ')}
                                    </div>
                                    <div className="conflict-time">{conflict.time}</div>
                                </div>
                                <button className="resolve-button">
                                    🔧 Resolve
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Meetings Tab Component
const MeetingsTab = ({ meetingState, meetingManager, notesTaker, onJoin, onStartRecording }) => {
    return (
        <div className="meetings-tab">
            <h2>Meeting Management</h2>
            
            {/* Active Meeting */}
            {meetingState.activeMeeting && (
                <div className="active-meeting">
                    <h3>Active Meeting</h3>
                    <div className="meeting-info">
                        <div className="meeting-title">{meetingState.activeMeeting.title}</div>
                        <div className="meeting-participants">
                            Participants: {meetingState.participants.length}
                        </div>
                        <div className="recording-status">
                            Recording: {meetingState.recordingStatus}
                        </div>
                    </div>
                    <div className="meeting-controls">
                        <button 
                            className="join-button"
                            onClick={() => onJoin(meetingState.activeMeeting.id)}
                        >
                            🎥 Join
                        </button>
                        <button 
                            className="record-button"
                            onClick={() => onStartRecording(meetingState.activeMeeting.id)}
                            disabled={meetingState.recordingStatus === 'active'}
                        >
                            🎙️ Start Recording
                        </button>
                    </div>
                    
                    {/* Live Notes */}
                    {meetingState.liveNotes && (
                        <div className="live-notes">
                            <h4>Live Notes</h4>
                            <div className="notes-content">{meetingState.liveNotes}</div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Upcoming Meetings */}
            <div className="upcoming-meetings">
                <h3>Upcoming Meetings</h3>
                <div className="meetings-list">
                    {meetingState.upcomingMeetings.map(meeting => (
                        <div key={meeting.id} className="meeting-item">
                            <div className="meeting-time">{meeting.time}</div>
                            <div className="meeting-info">
                                <div className="meeting-title">{meeting.title}</div>
                                <div className="meeting-participants">
                                    {meeting.participants.length} participants
                                </div>
                                <div className="meeting-platform">{meeting.platform}</div>
                            </div>
                            <div className="meeting-actions">
                                <button className="prepare-button">
                                    📋 Prepare
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Meeting Preparation */}
            {meetingState.meetingPreparation.length > 0 && (
                <div className="meeting-preparation">
                    <h3>Meeting Preparation</h3>
                    <div className="preparation-list">
                        {meetingState.meetingPreparation.map(prep => (
                            <div key={prep.id} className="preparation-item">
                                <div className="prep-meeting">{prep.meetingTitle}</div>
                                <div className="prep-tasks">
                                    {prep.tasks.map((task, index) => (
                                        <div key={index} className="prep-task">
                                            <input type="checkbox" checked={task.completed} readOnly />
                                            <span>{task.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Insights Tab Component
const InsightsTab = ({ insightsState, insightsEngine }) => {
    return (
        <div className="insights-tab">
            <h2>AI Insights & Analytics</h2>
            
            {/* Daily Insights */}
            <div className="daily-insights">
                <h3>Today's Insights</h3>
                <div className="insights-list">
                    {insightsState.dailyInsights.map(insight => (
                        <div key={insight.id} className="insight-item">
                            <div className="insight-type">{insight.type}</div>
                            <div className="insight-content">{insight.content}</div>
                            <div className="insight-confidence">
                                Confidence: {Math.round(insight.confidence * 100)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Weekly Trends */}
            <div className="weekly-trends">
                <h3>Weekly Trends</h3>
                <div className="trends-list">
                    {insightsState.weeklyTrends.map(trend => (
                        <div key={trend.id} className="trend-item">
                            <div className="trend-metric">{trend.metric}</div>
                            <div className="trend-change">
                                <span className={`trend-direction ${trend.direction}`}>
                                    {trend.direction === 'up' ? '📈' : '📉'}
                                </span>
                                <span className="trend-percentage">{trend.change}%</span>
                            </div>
                            <div className="trend-description">{trend.description}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Recommendations */}
            <div className="recommendations">
                <h3>AI Recommendations</h3>
                <div className="recommendations-list">
                    {insightsState.recommendations.map(recommendation => (
                        <div key={recommendation.id} className="recommendation-item">
                            <div className="recommendation-priority">
                                <span className={`priority-badge ${recommendation.priority}`}>
                                    {recommendation.priority}
                                </span>
                            </div>
                            <div className="recommendation-content">
                                <div className="recommendation-title">{recommendation.title}</div>
                                <div className="recommendation-description">{recommendation.description}</div>
                            </div>
                            <div className="recommendation-impact">
                                Expected Impact: {recommendation.expectedImpact}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="performance-metrics">
                <h3>Performance Metrics</h3>
                <div className="metrics-grid">
                    {Object.entries(insightsState.performanceMetrics).map(([metric, value]) => (
                        <div key={metric} className="metric-item">
                            <div className="metric-name">{metric}</div>
                            <div className="metric-value">{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Chat Tab Component
const ChatTab = ({ chatState, onSendMessage, onInputChange }) => {
    const chatEndRef = useRef(null);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatState.messages]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSendMessage(chatState.inputValue);
    };
    
    return (
        <div className="chat-tab">
            <h2>AI Assistant Chat</h2>
            
            <div className="chat-container">
                <div className="chat-messages">
                    {chatState.messages.map(message => (
                        <div key={message.id} className={`message ${message.type}`}>
                            <div className="message-content">{message.content}</div>
                            <div className="message-time">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                            {message.actions && (
                                <div className="message-actions">
                                    {message.actions.map((action, index) => (
                                        <button key={index} className="message-action">
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {chatState.isTyping && (
                        <div className="message ai typing">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    
                    <div ref={chatEndRef} />
                </div>
                
                <form className="chat-input-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="chat-input"
                        value={chatState.inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Ask your AI assistant anything..."
                        disabled={chatState.isTyping}
                    />
                    <button 
                        type="submit" 
                        className="chat-send-button"
                        disabled={!chatState.inputValue.trim() || chatState.isTyping}
                    >
                        Send
                    </button>
                </form>
                
                {/* Quick Suggestions */}
                {chatState.suggestions.length > 0 && (
                    <div className="chat-suggestions">
                        {chatState.suggestions.map((suggestion, index) => (
                            <button 
                                key={index}
                                className="suggestion-button"
                                onClick={() => onSendMessage(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalAssistant;