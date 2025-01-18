import React from 'react';
import { Loader2, ArrowLeft, LogOut, X } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import authService from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import {withMinimumDelay} from "../utils/withDelay";

export const Header = ({ showCreateButton = false, onCreateClick, isCreatingBudget = false }) => {
    const { handleLogout } = useLogin();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const userInfo = authService.getUserInfo();
    const navigate = useNavigate();
    const location = useLocation();
    const showBackButton = location.pathname !== '/dashboard';
    const isHomePage = location.pathname === '/';

    const onLogout = async () => {
        setIsLoggingOut(true);
        try {
            await withMinimumDelay(async () => {
                const logoutIcon = document.querySelector('.logout-icon');
                if (logoutIcon) {
                    logoutIcon.classList.add('animate-spin');
                }
                await handleLogout();
            }, 2000); // 2 second delay with animation
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleBack = async () => {
        const backButton = document.querySelector('.back-button');
        backButton?.classList.add('animate-spin');
        await withMinimumDelay(async () => {
            await navigate('/dashboard');
        }, 1000);
    };

    const getBudgetType = () => {
        const path = location.pathname;
        if (path === '/' || path === 'dashboard') return ''; // Home page - no budget type
        if (path.includes('paycheck')) return 'Paycheck Budgets';
        if (path.includes('business')) return 'Business Trip Budgets';
        if (path.includes('savings')) return 'Savings Budgets';
        if (path.includes('budgets')) return 'Custom Budgets';
        return '';
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-lg">
            <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            {showBackButton ? (
                                <button
                                    onClick={handleBack}
                                    className="back-button text-gray-600 hover:text-gray-900 transition-all duration-500 transform hover:-translate-x-1"
                                >
                                    <ArrowLeft className="h-6 w-6"/>
                                </button>
                            ) : (
                                <div className="w-6"/>
                                )}
                            <h1 className="text-3xl font-bold text-gray-900">Smarty Budget Tracker</h1>
                        </div>
                        <span className="text-sm text-gray-600">{userInfo?.sub}</span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            onClick={onLogout}
                            disabled={isLoggingOut}
                            className="inline-flex items-center justify-center px-4 py-2
                                        bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-all duration-300"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="logout-icon h-5 w-5 mr-2 animate-spin"/>
                            ) : (
                                <LogOut className="logout-icon h-5 w-5 mr-2"/>
                            )}
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                        {showCreateButton && (
                            <button
                                onClick={onCreateClick}
                                disabled={isCreatingBudget}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent
            text-sm font-medium rounded-md shadow-sm text-white
            bg-indigo-600 hover:bg-indigo-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingBudget ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create New Budget'
                                )}
                            </button>
                        )}
                    </div>
                    {!isHomePage && (
                        <div className="text-center">
                            <h2 className="text-lg text-gray-600">{getBudgetType()}</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};