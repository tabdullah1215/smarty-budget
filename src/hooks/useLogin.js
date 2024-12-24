import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const useLogin = (setPermanentMessage) => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        setIsLoading(true);
        setPermanentMessage({ type: '', content: '' });

        try {
            await authService.login(email, password);
            setPermanentMessage({ type: 'success', content: 'Login successful!' });
            navigate('/dashboard');
        } catch (error) {
            setPermanentMessage({
                type: 'error',
                content: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        authService.removeToken();
        navigate('/login');
    };

    return {
        isLoading,
        handleLogin,
        handleLogout
    };
};