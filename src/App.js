// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PWAGateway from './components/PWAGateway';
import Login from './components/Login';
import AppRegistration from './components/AppRegistration';
import { BudgetContent } from "./components/BudgetContent";
import authService from './services/authService';
import { indexdbService } from './services/IndexDBService';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState(null);

    useEffect(() => {
        const initDatabase = async () => {
            try {
                await indexdbService.initDB();
                setDbInitialized(true);
            } catch (error) {
                console.error('Database initialization failed:', error);
                setDbError(error);
            }
        };

        initDatabase();
    }, []);

    if (dbError) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Database Error
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Unable to access the database. This might be due to:
                        <ul className="list-disc text-left pl-4 mt-2">
                            <li>Private browsing mode</li>
                            <li>Limited device storage</li>
                            <li>Browser restrictions</li>
                        </ul>
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!dbInitialized) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Initialize authentication state
        authService.initializeAuth();

        // Check for standalone mode
        const checkStandalone = () => {
            const isAppMode = window.matchMedia('(display-mode: standalone)').matches
                || window.navigator.standalone
                || document.referrer.includes('android-app://');
            setIsStandalone(isAppMode);
        };

        checkStandalone();

        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const listener = (e) => checkStandalone();
        mediaQuery.addListener(listener);

        return () => mediaQuery.removeListener(listener);
    }, []);

    // Show gateway page if not in standalone mode and on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !isStandalone) {
        return <PWAGateway />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/register/:appId/:linkType/:token"
                        element={<AppRegistration />}
                    />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <BudgetContent />
                            </ProtectedRoute>
                        }
                    />

                    {/* Root redirect to dashboard */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;