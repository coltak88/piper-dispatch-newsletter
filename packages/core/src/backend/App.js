/**
 * Main Application Component
 * Hybrid system combining Calendly, Microsoft Teams, Slack, and Gmail functionality
 * Supports Android, iOS, MacOS, Windows native desktop and web platforms
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Core components
import UnifiedDashboard from './components/UnifiedDashboard';

// Services
import AuthenticationService from './services/AuthenticationService';
import EcosystemIntegrationService from './services/EcosystemIntegrationService';

const App = () => {
    // Core state
    const [authService] = useState(() => new AuthenticationService());
    const [ecosystemService] = useState(() => new EcosystemIntegrationService());
    
    // Application state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    /**
     * Initialize application
     */
    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            setLoading(true);
            
            // Initialize authentication service
            await authService.initialize();
            
            // Check for existing authentication
            const existingAuth = await authService.checkExistingAuth();
            if (existingAuth.isAuthenticated) {
                setIsAuthenticated(true);
                setUser(existingAuth.user);
                
                // Initialize ecosystem integration for authenticated users
                await ecosystemService.initialize({
                    userId: existingAuth.user.id
                });
            }
            
            setLoading(false);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            setError({
                type: 'initialization',
                message: 'Failed to initialize application',
                details: error.message
            });
            setLoading(false);
        }
    };
  
    /**
     * Authentication handlers
     */
    const handleLogin = async (credentials) => {
        try {
            setLoading(true);
            
            const authResult = await authService.authenticate(credentials);
            
            if (authResult.success) {
                setIsAuthenticated(true);
                setUser(authResult.user);
                
                // Initialize ecosystem integration
                await ecosystemService.initialize({
                    userId: authResult.user.id
                });
                
                setError(null);
            } else {
                setError({
                    type: 'authentication',
                    message: authResult.error || 'Authentication failed'
                });
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Login error:', error);
            setError({
                type: 'authentication',
                message: 'Login failed',
                details: error.message
            });
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            await ecosystemService.disconnect();
            
            setIsAuthenticated(false);
            setUser(null);
            setError(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Simple login component for demo
    const LoginPage = () => (
        <div className="login-page">
            <div className="login-container">
                <h1>Hybrid Workspace</h1>
                <p>Calendly + Teams + Slack + Gmail in one platform</p>
                <button 
                    onClick={() => handleLogin({ email: 'demo@example.com', password: 'demo' })}
                    className="login-btn"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Demo Login'}
                </button>
                {error && (
                    <div className="error-message">
                        {error.message}
                    </div>
                )}
            </div>
        </div>
    );

    // Loading screen
    if (loading && !isAuthenticated) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Initializing your hybrid workspace...</p>
            </div>
        );
    }
  
    return (
        <div className="app">
            <Router>
                <Routes>
                    <Route 
                        path="/login" 
                        element={
                            isAuthenticated ? 
                            <Navigate to="/dashboard" replace /> : 
                            <LoginPage />
                        } 
                    />
                    
                    <Route 
                        path="/dashboard" 
                        element={
                            isAuthenticated ? 
                            <UnifiedDashboard 
                                user={user}
                                onLogout={handleLogout}
                            /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    
                    <Route 
                        path="/" 
                        element={
                            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                        } 
                    />
                </Routes>
            </Router>
        </div>
    );
};

export default App;