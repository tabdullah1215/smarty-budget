// src/contexts/MessageContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
    const [message, setMessage] = useState({ type: '', content: '' });

    const showMessage = useCallback((type, content) => {
        setMessage({ type, content });
        // Auto-clear success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                setMessage({ type: '', content: '' });
            }, 5000);
        }
    }, []);

    const clearMessage = useCallback(() => {
        setMessage({ type: '', content: '' });
    }, []);

    return (
        <MessageContext.Provider value={{ message, showMessage, clearMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};