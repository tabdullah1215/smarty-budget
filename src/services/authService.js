// src/services/authService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINT, APP_ID } from '../config';

const TOKEN_KEY = 'budget_auth_token';

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

    async login(email, password) {
        try {
            const response = await axios.post(
                `${API_ENDPOINT}/create-distributor`,
                {
                    appId: APP_ID,
                    email,
                    password
                },
                {
                    params: { action: 'appLogin' }
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