// src/components/ProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (!authService.isAuthenticated()) {
        // Preserve the attempted URL for post-login redirect
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;