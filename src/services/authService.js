// src/services/authService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINT, APP_ID, DEFAULT_BUDGET_TYPE } from '../config';

const TOKEN_KEY = 'budget_auth_token';
const API_KEY = process.env.REACT_APP_KEY_1;
const subappNameCache = {};


// Add interceptor
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
            console.log('getsubappid: ', userInfo?.subAppId);
            return userInfo?.subAppId || DEFAULT_BUDGET_TYPE; // Use default from config
        } catch {
            return DEFAULT_BUDGET_TYPE; // Use default from config
        }
    },

    async getSubappName(subappId) {
        if (!subappId) return "Registration";

        // Check cache first
        if (subappNameCache[subappId]) {
            return subappNameCache[subappId];
        }

        try {
            const response = await axios.post(
                `${API_ENDPOINT}/app-manager`,
                {
                    appId: APP_ID,
                    subappId
                },
                {
                    params: { action: 'getSubappInfo' },
                    headers: { 'X-Api-Key': API_KEY }
                }
            );

            if (response.data && response.data.subappName) {
                subappNameCache[subappId] = response.data.subappName;
                return response.data.subappName;
            }

            // Fallback to capitalized subappId if name not found
            return subappId.charAt(0).toUpperCase() + subappId.slice(1);
        } catch (error) {
            console.error('Error fetching subapp name:', error);
            // Fallback to capitalized subappId
            return subappId.charAt(0).toUpperCase() + subappId.slice(1);
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
    }
};

export default authService;