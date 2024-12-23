// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PWAGateway from './components/PWAGateway';
import Login from './components/Login';
import AppRegistration from './components/AppRegistration';
import { BudgetContent} from "./components/BudgetContent";
import authService from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
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
    mediaQuery.addListener(checkStandalone);

    return () => mediaQuery.removeListener(checkStandalone);
  }, []);


  // Show gateway page if not in standalone mode and on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile && !isStandalone) {
    return <PWAGateway />;
  }

  return (
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
  );
}

export default App;