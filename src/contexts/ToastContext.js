// src/contexts/ToastContext.js
import React, { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const showToast = (type, message) => {
        const toastOptions = {
            position: 'top-right',
            style: {
                background: type === 'error' ? '#FEE2E2' : '#ECFDF5',
                color: type === 'error' ? '#991B1B' : '#065F46',
                fontWeight: '500',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            duration: type === 'error' ? Infinity : 3000,
        };

        if (type === 'error') {
            toast.error(message, toastOptions);
        } else {
            toast.success(message, toastOptions);
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div id="toast-container" style={{ zIndex: 10000 }} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};