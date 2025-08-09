// src/services/authService.js - SAFE ENHANCEMENT (DO NOT REPLACE - ONLY ADD)
// Keep ALL your existing code and ADD these methods to the authService object

// PRESERVE ALL YOUR EXISTING CODE:
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINT, APP_ID, DEFAULT_BUDGET_TYPE } from '../config';

const TOKEN_KEY = 'budget_auth_token';
const API_KEY = process.env.REACT_APP_KEY_1;

// PRESERVE: Your existing axios interceptor
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            delete axios.defaults.headers.common['Authorization'];

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const authService = {
    // PRESERVE ALL YOUR EXISTING METHODS (keep them exactly the same):
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken() {
        localStorage.removeItem(TOKEN_KEY);
        delete axios.defaults.headers.common['Authorization'];
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            return decoded.exp > Date.now() / 1000 && decoded.appId === APP_ID;
        } catch {
            return false;
        }
    },

    getUserInfo() {
        try {
            const token = this.getToken();
            if (!token) return null;
            return jwtDecode(token);
        } catch {
            return null;
        }
    },

    initializeAuth() {
        const token = this.getToken();
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },

    getSubappId() {
        try {
            const userInfo = this.getUserInfo();
            return userInfo?.subAppId || DEFAULT_BUDGET_TYPE;
        } catch {
            return DEFAULT_BUDGET_TYPE; // Use default from config
        }
    },

    async login(email, password) {
        try {
            const response = await axios.post(
                `${API_ENDPOINT}/app-manager`,
                {
                    appId: APP_ID,
                    email,
                    password
                },
                {
                    params: { action: 'appLogin' },
                    headers: { 'X-Api-Key': API_KEY }
                }
            );

            if (response.data.token) {
                this.setToken(response.data.token);
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (error) {
            const msg = error.response?.data?.message || 'Authentication failed';
            throw new Error(msg);
        }
    },

    // ADD THESE NEW METHODS (safe additions):

    // NEW: Get user's registered subapps (safe fallback)
    getRegisteredSubApps() {
        try {
            const userInfo = this.getUserInfo();
            return userInfo?.userRegisteredSubApps || [];
        } catch {
            return [];
        }
    },

    // NEW: Check if user has access to specific subapp (safe fallback)
    hasSubAppAccess(subAppId) {
        try {
            const userInfo = this.getUserInfo();

            if (userInfo?.subAppId === 'all') {
                return true;
            } else if (userInfo?.subAppId === 'registered') {
                return userInfo?.userRegisteredSubApps?.includes(subAppId) || false;
            } else {
                return userInfo?.subAppId === subAppId;
            }
        } catch {
            return false;
        }
    },

    // NEW: Get user's access level (safe fallback)
    getUserAccessLevel() {
        try {
            const userInfo = this.getUserInfo();

            if (userInfo?.subAppId === 'all') {
                return 'all';
            } else if (userInfo?.subAppId === 'registered') {
                return 'multiple';
            } else {
                return 'single';
            }
        } catch {
            return 'single';
        }
    },

    // NEW: Get user's accessible subapp list (safe fallback)
    getAccessibleSubApps() {
        try {
            const userInfo = this.getUserInfo();

            if (userInfo?.subAppId === 'all') {
                return ['paycheck', 'custom', 'business']; // All available subapps
            } else if (userInfo?.subAppId === 'registered') {
                return userInfo?.userRegisteredSubApps || [];
            } else {
                return userInfo?.subAppId ? [userInfo.subAppId] : [];
            }
        } catch {
            return [];
        }
    },

    // NEW: Get formatted display name for user (safe fallback)
    getDisplayName() {
        try {
            const userInfo = this.getUserInfo();
            if (!userInfo) return 'Guest User';

            const email = userInfo.sub || userInfo.email || 'Unknown User';
            const accessLevel = this.getUserAccessLevel();

            switch (accessLevel) {
                case 'all':
                    return `${email} (All Access)`;
                case 'multiple':
                    const subApps = userInfo.userRegisteredSubApps || [];
                    return `${email} (${subApps.length} app${subApps.length !== 1 ? 's' : ''})`;
                default:
                    return `${email} (${userInfo.subAppId || 'Limited Access'})`;
            }
        } catch {
            return 'Guest User';
        }
    }

    // END OF NEW METHODS - ADD COMMA AFTER PREVIOUS METHOD IF NEEDED
};

export default authService;