/**
 * Real-time Collaboration Tools for Editorial Team Workflow
 * Provides collaborative editing, real-time communication, task management,
 * and workflow automation for newsletter editorial teams
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/collaboration-tools.css';

// Simulated WebSocket service for real-time collaboration
class CollaborationWebSocket {
    constructor() {
        this.listeners = new Map();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        // Simulate WebSocket connection
        setTimeout(() => {
            this.isConnected = true;
            this.emit('connected');
        }, 1000);
    }

    disconnect() {
        this.isConnected = false;
        this.emit('disconnected');
    }

    send(data) {
        if (!this.isConnected) return;
        // Simulate message sending
        setTimeout(() => {
            this.emit('message', data);
        }, 100);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

const CollaborationTools = ({ 
    documentId, 
    userId, 
    userRole = 'editor',
    onContentChange,
    onCollaboratorJoin,
    onCollaboratorLeave,
    className = '',
    ...props 
}) => {
    // State management
    const [isConnected, setIsConnected] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [activeUsers, setActiveUsers] = useState(new Set());
    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [comments, setComments] = useState([]);
    const [documentVersion, setDocumentVersion] = useState(1);
    const [conflictResolution, setConflictResolution] = useState(null);
    const [workflowStatus, setWorkflowStatus] = useState('draft');
    const [permissions, setPermissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI state
    const [activeTab, setActiveTab] = useState('collaborators');
    const [showChat, setShowChat] = useState(false);
    const [showTasks, setShowTasks] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showWorkflow, setShowWorkflow] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [newTask, setNewTask] = useState({ title: '', assignee: '', priority: 'medium' });
    const [newComment, setNewComment] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
    
    // Refs
    const wsRef = useRef(null);
    const chatContainerRef = useRef(null);
    const messageInputRef = useRef(null);
    const collaborationRef = useRef(null);
    const heartbeatInterval = useRef(null);
    
    // Initialize collaboration service
    useEffect(() => {
        initializeCollaboration();
        
        return () => {
            cleanup();
        };
    }, [documentId, userId]);
    
    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    // Handle text selection for comments
    useEffect(() => {
        const handleTextSelection = () => {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
                setSelectedText(selection.toString());
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setCommentPosition({ x: rect.right, y: rect.bottom });
            } else {
                setSelectedText('');
            }
        };
        
        document.addEventListener('mouseup', handleTextSelection);
        return () => document.removeEventListener('mouseup', handleTextSelection);
    }, []);
    
    /**
     * Initialize collaboration service
     */
    const initializeCollaboration = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Create WebSocket connection
            wsRef.current = new CollaborationWebSocket();
            
            // Set up event listeners
            wsRef.current.on('connected', handleConnection);
            wsRef.current.on('disconnected', handleDisconnection);
            wsRef.current.on('message', handleMessage);
            wsRef.current.on('collaborator_joined', handleCollaboratorJoin);
            wsRef.current.on('collaborator_left', handleCollaboratorLeave);
            wsRef.current.on('content_changed', handleContentChange);
            wsRef.current.on('comment_added', handleCommentAdded);
            wsRef.current.on('task_updated', handleTaskUpdated);
            wsRef.current.on('workflow_changed', handleWorkflowChange);
            wsRef.current.on('conflict_detected', handleConflictDetected);
            
            // Connect to collaboration server
            wsRef.current.connect();
            
            // Load initial data
            await loadCollaborationData();
            
            // Start heartbeat
            startHeartbeat();
            
            console.log('Collaboration tools initialized');
        } catch (error) {
            console.error('Failed to initialize collaboration:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    /**
     * Load collaboration data
     */
    const loadCollaborationData = async () => {
        try {
            // Simulate loading collaboration data
            const data = await simulateDataLoad();
            
            setCollaborators(data.collaborators);
            setTasks(data.tasks);
            setComments(data.comments);
            setWorkflowStatus(data.workflowStatus);
            setPermissions(data.permissions);
            setDocumentVersion(data.version);
        } catch (error) {
            throw new Error(`Failed to load collaboration data: ${error.message}`);
        }
    };
    
    /**
     * Simulate data loading
     */
    const simulateDataLoad = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    collaborators: [
                        {
                            id: 'user1',
                            name: 'Sarah Johnson',
                            role: 'editor',
                            avatar: '👩‍💼',
                            status: 'online',
                            lastSeen: Date.now(),
                            cursor: { x: 100, y: 200 }
                        },
                        {
                            id: 'user2',
                            name: 'Mike Chen',
                            role: 'writer',
                            avatar: '👨‍💻',
                            status: 'typing',
                            lastSeen: Date.now() - 30000,
                            cursor: { x: 300, y: 150 }
                        },
                        {
                            id: 'user3',
                            name: 'Emma Davis',
                            role: 'reviewer',
                            avatar: '👩‍🎨',
                            status: 'away',
                            lastSeen: Date.now() - 300000,
                            cursor: null
                        }
                    ],
                    tasks: [
                        {
                            id: 'task1',
                            title: 'Review market analysis section',
                            assignee: 'user1',
                            priority: 'high',
                            status: 'in_progress',
                            dueDate: Date.now() + 86400000,
                            createdBy: 'user2',
                            createdAt: Date.now() - 3600000
                        },
                        {
                            id: 'task2',
                            title: 'Fact-check cryptocurrency data',
                            assignee: 'user3',
                            priority: 'medium',
                            status: 'pending',
                            dueDate: Date.now() + 172800000,
                            createdBy: 'user1',
                            createdAt: Date.now() - 7200000
                        }
                    ],
                    comments: [
                        {
                            id: 'comment1',
                            text: 'This section needs more recent data',
                            author: 'user1',
                            timestamp: Date.now() - 1800000,
                            position: { start: 150, end: 200 },
                            resolved: false,
                            replies: []
                        },
                        {
                            id: 'comment2',
                            text: 'Great analysis! Consider adding a chart here.',
                            author: 'user3',
                            timestamp: Date.now() - 900000,
                            position: { start: 500, end: 550 },
                            resolved: true,
                            replies: [
                                {
                                    id: 'reply1',
                                    text: 'Added the chart as suggested',
                                    author: 'user2',
                                    timestamp: Date.now() - 300000
                                }
                            ]
                        }
                    ],
                    workflowStatus: 'review',
                    permissions: {
                        canEdit: userRole === 'editor' || userRole === 'writer',
                        canReview: userRole === 'editor' || userRole === 'reviewer',
                        canPublish: userRole === 'editor',
                        canAssignTasks: userRole === 'editor',
                        canManageWorkflow: userRole === 'editor'
                    },
                    version: 3
                });
            }, 1000);
        });
    };
    
    /**
     * Start heartbeat to maintain connection
     */
    const startHeartbeat = () => {
        heartbeatInterval.current = setInterval(() => {
            if (wsRef.current && wsRef.current.isConnected) {
                wsRef.current.send({
                    type: 'heartbeat',
                    userId,
                    timestamp: Date.now()
                });
            }
        }, 30000); // 30 seconds
    };
    
    /**
     * Event handlers
     */
    const handleConnection = () => {
        setIsConnected(true);
        setError(null);
        
        // Join document collaboration
        wsRef.current.send({
            type: 'join_document',
            documentId,
            userId,
            userRole
        });
    };
    
    const handleDisconnection = () => {
        setIsConnected(false);
        setActiveUsers(new Set());
    };
    
    const handleMessage = (data) => {
        if (data.type === 'chat_message') {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: data.message,
                author: data.userId,
                timestamp: Date.now(),
                type: 'message'
            }]);
        }
    };
    
    const handleCollaboratorJoin = (collaborator) => {
        setActiveUsers(prev => new Set([...prev, collaborator.id]));
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `${collaborator.name} joined the collaboration`,
            type: 'system',
            timestamp: Date.now()
        }]);
        
        if (onCollaboratorJoin) {
            onCollaboratorJoin(collaborator);
        }
    };
    
    const handleCollaboratorLeave = (collaborator) => {
        setActiveUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(collaborator.id);
            return newSet;
        });
        
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `${collaborator.name} left the collaboration`,
            type: 'system',
            timestamp: Date.now()
        }]);
        
        if (onCollaboratorLeave) {
            onCollaboratorLeave(collaborator);
        }
    };
    
    const handleContentChange = (change) => {
        setDocumentVersion(prev => prev + 1);
        
        if (onContentChange) {
            onContentChange(change);
        }
    };
    
    const handleCommentAdded = (comment) => {
        setComments(prev => [...prev, comment]);
    };
    
    const handleTaskUpdated = (task) => {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    };
    
    const handleWorkflowChange = (status) => {
        setWorkflowStatus(status);
    };
    
    const handleConflictDetected = (conflict) => {
        setConflictResolution(conflict);
    };
    
    /**
     * Send chat message
     */
    const sendMessage = () => {
        if (!newMessage.trim() || !isConnected) return;
        
        wsRef.current.send({
            type: 'chat_message',
            message: newMessage,
            userId,
            documentId,
            timestamp: Date.now()
        });
        
        setNewMessage('');
    };
    
    /**
     * Create new task
     */
    const createTask = () => {
        if (!newTask.title.trim()) return;
        
        const task = {
            id: `task_${Date.now()}`,
            ...newTask,
            status: 'pending',
            createdBy: userId,
            createdAt: Date.now(),
            dueDate: Date.now() + 86400000 // 24 hours from now
        };
        
        wsRef.current.send({
            type: 'create_task',
            task,
            documentId
        });
        
        setTasks(prev => [...prev, task]);
        setNewTask({ title: '', assignee: '', priority: 'medium' });
    };
    
    /**
     * Update task status
     */
    const updateTaskStatus = (taskId, status) => {
        const updatedTask = tasks.find(t => t.id === taskId);
        if (!updatedTask) return;
        
        updatedTask.status = status;
        updatedTask.updatedAt = Date.now();
        
        wsRef.current.send({
            type: 'update_task',
            task: updatedTask,
            documentId
        });
        
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    };
    
    /**
     * Add comment
     */
    const addComment = () => {
        if (!newComment.trim()) return;
        
        const comment = {
            id: `comment_${Date.now()}`,
            text: newComment,
            author: userId,
            timestamp: Date.now(),
            position: selectedText ? { text: selectedText } : null,
            resolved: false,
            replies: []
        };
        
        wsRef.current.send({
            type: 'add_comment',
            comment,
            documentId
        });
        
        setComments(prev => [...prev, comment]);
        setNewComment('');
        setSelectedText('');
    };
    
    /**
     * Update workflow status
     */
    const updateWorkflowStatus = (status) => {
        if (!permissions.canManageWorkflow) return;
        
        wsRef.current.send({
            type: 'update_workflow',
            status,
            documentId,
            userId
        });
        
        setWorkflowStatus(status);
    };
    
    /**
     * Resolve conflict
     */
    const resolveConflict = (resolution) => {
        wsRef.current.send({
            type: 'resolve_conflict',
            resolution,
            documentId,
            userId
        });
        
        setConflictResolution(null);
    };
    
    /**
     * Cleanup resources
     */
    const cleanup = () => {
        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
        }
        
        if (wsRef.current) {
            wsRef.current.disconnect();
        }
    };
    
    /**
     * Format timestamp
     */
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };
    
    /**
     * Get user by ID
     */
    const getUserById = (id) => {
        return collaborators.find(c => c.id === id) || { name: 'Unknown User', avatar: '👤' };
    };
    
    if (isLoading) {
        return (
            <div className={`collaboration-tools loading ${className}`} {...props}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Connecting to collaboration server...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`collaboration-tools error ${className}`} {...props}>
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <div className="error-content">
                        <h3>Connection Error</h3>
                        <p>{error}</p>
                        <button onClick={initializeCollaboration} className="retry-button">
                            Retry Connection
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div 
            ref={collaborationRef}
            className={`collaboration-tools ${className} ${isConnected ? 'connected' : 'disconnected'}`}
            {...props}
        >
            {/* Connection Status */}
            <div className="connection-status">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className="status-dot"></span>
                    <span className="status-text">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <div className="document-info">
                    <span className="version">v{documentVersion}</span>
                    <span className="workflow-status">{workflowStatus}</span>
                </div>
            </div>
            
            {/* Conflict Resolution Modal */}
            <AnimatePresence>
                {conflictResolution && (
                    <motion.div
                        className="conflict-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="conflict-content">
                            <h3>Conflict Detected</h3>
                            <p>{conflictResolution.message}</p>
                            <div className="conflict-actions">
                                <button 
                                    onClick={() => resolveConflict('accept_local')}
                                    className="resolve-button local"
                                >
                                    Keep My Changes
                                </button>
                                <button 
                                    onClick={() => resolveConflict('accept_remote')}
                                    className="resolve-button remote"
                                >
                                    Accept Their Changes
                                </button>
                                <button 
                                    onClick={() => resolveConflict('merge')}
                                    className="resolve-button merge"
                                >
                                    Merge Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Main Collaboration Panel */}
            <div className="collaboration-panel">
                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button 
                        className={`tab-button ${activeTab === 'collaborators' ? 'active' : ''}`}
                        onClick={() => setActiveTab('collaborators')}
                    >
                        <span className="tab-icon">👥</span>
                        <span className="tab-label">Team</span>
                        <span className="tab-badge">{activeUsers.size}</span>
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <span className="tab-icon">💬</span>
                        <span className="tab-label">Chat</span>
                        {messages.length > 0 && (
                            <span className="tab-badge">{messages.length}</span>
                        )}
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        <span className="tab-icon">✅</span>
                        <span className="tab-label">Tasks</span>
                        <span className="tab-badge">{tasks.filter(t => t.status !== 'completed').length}</span>
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        <span className="tab-icon">💭</span>
                        <span className="tab-label">Comments</span>
                        <span className="tab-badge">{comments.filter(c => !c.resolved).length}</span>
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'workflow' ? 'active' : ''}`}
                        onClick={() => setActiveTab('workflow')}
                    >
                        <span className="tab-icon">🔄</span>
                        <span className="tab-label">Workflow</span>
                    </button>
                </div>
                
                {/* Tab Content */}
                <div className="tab-content">
                    {/* Collaborators Tab */}
                    {activeTab === 'collaborators' && (
                        <motion.div 
                            className="collaborators-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="collaborators-list">
                                {collaborators.map(collaborator => (
                                    <div 
                                        key={collaborator.id}
                                        className={`collaborator-item ${collaborator.status} ${activeUsers.has(collaborator.id) ? 'active' : ''}`}
                                    >
                                        <div className="collaborator-avatar">
                                            {collaborator.avatar}
                                            <div className={`status-indicator ${collaborator.status}`}></div>
                                        </div>
                                        <div className="collaborator-info">
                                            <div className="collaborator-name">{collaborator.name}</div>
                                            <div className="collaborator-role">{collaborator.role}</div>
                                            <div className="collaborator-status">
                                                {collaborator.status === 'online' ? 'Online' :
                                                 collaborator.status === 'typing' ? 'Typing...' :
                                                 collaborator.status === 'away' ? 'Away' :
                                                 `Last seen ${formatTimestamp(collaborator.lastSeen)}`}
                                            </div>
                                        </div>
                                        {collaborator.status === 'typing' && (
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                        <motion.div 
                            className="chat-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="chat-messages" ref={chatContainerRef}>
                                {messages.map(message => (
                                    <div 
                                        key={message.id}
                                        className={`message ${message.type} ${message.author === userId ? 'own' : ''}`}
                                    >
                                        {message.type === 'message' && (
                                            <>
                                                <div className="message-avatar">
                                                    {getUserById(message.author).avatar}
                                                </div>
                                                <div className="message-content">
                                                    <div className="message-header">
                                                        <span className="message-author">
                                                            {getUserById(message.author).name}
                                                        </span>
                                                        <span className="message-time">
                                                            {formatTimestamp(message.timestamp)}
                                                        </span>
                                                    </div>
                                                    <div className="message-text">{message.text}</div>
                                                </div>
                                            </>
                                        )}
                                        {message.type === 'system' && (
                                            <div className="system-message">
                                                <span className="system-icon">ℹ️</span>
                                                <span className="system-text">{message.text}</span>
                                                <span className="system-time">
                                                    {formatTimestamp(message.timestamp)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <input
                                    ref={messageInputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="message-input"
                                    disabled={!isConnected}
                                />
                                <button 
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || !isConnected}
                                    className="send-button"
                                >
                                    📤
                                </button>
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <motion.div 
                            className="tasks-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {permissions.canAssignTasks && (
                                <div className="task-creation">
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Task title..."
                                        className="task-input"
                                    />
                                    <select
                                        value={newTask.assignee}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                                        className="task-assignee"
                                    >
                                        <option value="">Assign to...</option>
                                        {collaborators.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                        className="task-priority"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <button onClick={createTask} className="create-task-button">
                                        ➕ Add Task
                                    </button>
                                </div>
                            )}
                            
                            <div className="tasks-list">
                                {tasks.map(task => (
                                    <div key={task.id} className={`task-item ${task.status} ${task.priority}`}>
                                        <div className="task-header">
                                            <div className="task-title">{task.title}</div>
                                            <div className="task-priority">{task.priority}</div>
                                        </div>
                                        <div className="task-meta">
                                            <span className="task-assignee">
                                                👤 {getUserById(task.assignee).name}
                                            </span>
                                            <span className="task-due">
                                                📅 {formatTimestamp(task.dueDate)}
                                            </span>
                                        </div>
                                        <div className="task-actions">
                                            {task.status === 'pending' && (
                                                <button 
                                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                    className="task-action start"
                                                >
                                                    ▶️ Start
                                                </button>
                                            )}
                                            {task.status === 'in_progress' && (
                                                <button 
                                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                                    className="task-action complete"
                                                >
                                                    ✅ Complete
                                                </button>
                                            )}
                                            {task.status === 'completed' && (
                                                <span className="task-completed">✅ Completed</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <motion.div 
                            className="comments-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="comment-creation">
                                {selectedText && (
                                    <div className="selected-text">
                                        <span className="selection-label">Selected:</span>
                                        <span className="selection-text">"{selectedText}"</span>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="comment-input"
                                    rows={3}
                                />
                                <button 
                                    onClick={addComment}
                                    disabled={!newComment.trim()}
                                    className="add-comment-button"
                                >
                                    💭 Add Comment
                                </button>
                            </div>
                            
                            <div className="comments-list">
                                {comments.map(comment => (
                                    <div key={comment.id} className={`comment-item ${comment.resolved ? 'resolved' : ''}`}>
                                        <div className="comment-header">
                                            <div className="comment-author">
                                                <span className="author-avatar">
                                                    {getUserById(comment.author).avatar}
                                                </span>
                                                <span className="author-name">
                                                    {getUserById(comment.author).name}
                                                </span>
                                            </div>
                                            <div className="comment-time">
                                                {formatTimestamp(comment.timestamp)}
                                            </div>
                                        </div>
                                        {comment.position?.text && (
                                            <div className="comment-context">
                                                <span className="context-label">On:</span>
                                                <span className="context-text">"{comment.position.text}"</span>
                                            </div>
                                        )}
                                        <div className="comment-text">{comment.text}</div>
                                        {comment.replies.length > 0 && (
                                            <div className="comment-replies">
                                                {comment.replies.map(reply => (
                                                    <div key={reply.id} className="reply-item">
                                                        <div className="reply-author">
                                                            {getUserById(reply.author).name}
                                                        </div>
                                                        <div className="reply-text">{reply.text}</div>
                                                        <div className="reply-time">
                                                            {formatTimestamp(reply.timestamp)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="comment-actions">
                                            {!comment.resolved && (
                                                <button className="resolve-comment-button">
                                                    ✅ Resolve
                                                </button>
                                            )}
                                            <button className="reply-comment-button">
                                                💬 Reply
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Workflow Tab */}
                    {activeTab === 'workflow' && (
                        <motion.div 
                            className="workflow-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="workflow-status">
                                <h3>Current Status: {workflowStatus}</h3>
                                <div className="workflow-progress">
                                    <div className={`progress-step ${['draft', 'review', 'approved', 'published'].indexOf(workflowStatus) >= 0 ? 'completed' : ''}`}>
                                        📝 Draft
                                    </div>
                                    <div className={`progress-step ${['review', 'approved', 'published'].indexOf(workflowStatus) >= 0 ? 'completed' : ''}`}>
                                        👀 Review
                                    </div>
                                    <div className={`progress-step ${['approved', 'published'].indexOf(workflowStatus) >= 0 ? 'completed' : ''}`}>
                                        ✅ Approved
                                    </div>
                                    <div className={`progress-step ${workflowStatus === 'published' ? 'completed' : ''}`}>
                                        🚀 Published
                                    </div>
                                </div>
                            </div>
                            
                            {permissions.canManageWorkflow && (
                                <div className="workflow-actions">
                                    <h4>Actions</h4>
                                    <div className="action-buttons">
                                        {workflowStatus === 'draft' && (
                                            <button 
                                                onClick={() => updateWorkflowStatus('review')}
                                                className="workflow-button review"
                                            >
                                                📋 Submit for Review
                                            </button>
                                        )}
                                        {workflowStatus === 'review' && permissions.canReview && (
                                            <>
                                                <button 
                                                    onClick={() => updateWorkflowStatus('approved')}
                                                    className="workflow-button approve"
                                                >
                                                    ✅ Approve
                                                </button>
                                                <button 
                                                    onClick={() => updateWorkflowStatus('draft')}
                                                    className="workflow-button reject"
                                                >
                                                    ❌ Request Changes
                                                </button>
                                            </>
                                        )}
                                        {workflowStatus === 'approved' && permissions.canPublish && (
                                            <button 
                                                onClick={() => updateWorkflowStatus('published')}
                                                className="workflow-button publish"
                                            >
                                                🚀 Publish
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="workflow-history">
                                <h4>History</h4>
                                <div className="history-list">
                                    <div className="history-item">
                                        <span className="history-time">{formatTimestamp(Date.now() - 3600000)}</span>
                                        <span className="history-action">Document created</span>
                                        <span className="history-user">by {getUserById(userId).name}</span>
                                    </div>
                                    <div className="history-item">
                                        <span className="history-time">{formatTimestamp(Date.now() - 1800000)}</span>
                                        <span className="history-action">Status changed to {workflowStatus}</span>
                                        <span className="history-user">by {getUserById(userId).name}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollaborationTools;

// Export utility functions
export const createCollaborationSession = (documentId, userId, userRole) => {
    return {
        documentId,
        userId,
        userRole,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now()
    };
};

export const formatCollaboratorStatus = (status, lastSeen) => {
    switch (status) {
        case 'online':
            return 'Online';
        case 'typing':
            return 'Typing...';
        case 'away':
            return 'Away';
        default:
            return `Last seen ${new Date(lastSeen).toLocaleTimeString()}`;
    }
};

export const getWorkflowSteps = () => {
    return [
        { id: 'draft', label: 'Draft', icon: '📝' },
        { id: 'review', label: 'Review', icon: '👀' },
        { id: 'approved', label: 'Approved', icon: '✅' },
        { id: 'published', label: 'Published', icon: '🚀' }
    ];
};

export const validatePermissions = (userRole) => {
    const rolePermissions = {
        editor: {
            canEdit: true,
            canReview: true,
            canPublish: true,
            canAssignTasks: true,
            canManageWorkflow: true
        },
        writer: {
            canEdit: true,
            canReview: false,
            canPublish: false,
            canAssignTasks: false,
            canManageWorkflow: false
        },
        reviewer: {
            canEdit: false,
            canReview: true,
            canPublish: false,
            canAssignTasks: false,
            canManageWorkflow: false
        },
        viewer: {
            canEdit: false,
            canReview: false,
            canPublish: false,
            canAssignTasks: false,
            canManageWorkflow: false
        }
    };
    
    return rolePermissions[userRole] || rolePermissions.viewer;
};