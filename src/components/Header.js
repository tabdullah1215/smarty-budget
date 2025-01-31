import React from 'react';
import { useLogin } from '../hooks/useLogin';
import authService from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { withMinimumDelay } from "../utils/withDelay";
import { Loader2, ArrowLeft, LogOut, X, FileDown, FileSpreadsheet } from 'lucide-react';
import {useToast} from '../contexts/ToastContext';

export const Header = ({
                           showCreateButton = false,
                           onCreateClick,
                           isCreatingBudget = false,
                           onGenerateReport = () => {},
                           onDownloadCsv = () => {},
                           selectedBudgets = []
                       }) => {
    const { handleLogout } = useLogin();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const userInfo = authService.getUserInfo();
    const navigate = useNavigate();
    const location = useLocation();
    const showBackButton = location.pathname !== '/dashboard';
    const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';
    const { showToast } = useToast();

    const onLogout = async () => {
        setIsLoggingOut(true);
        try {
            await withMinimumDelay(async () => {
                const logoutIcon = document.querySelector('.logout-icon');
                if (logoutIcon) {
                    logoutIcon.classList.add('animate-spin');
                }
                await handleLogout();
            }, 2000);
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
        if (path === '/' || path === '/dashboard') return '';
        if (path.includes('paycheck')) return 'Paycheck Budgets';
        if (path.includes('business')) return 'Business Trip Budgets';
        if (path.includes('savings')) return 'Savings Budgets';
        if (path.includes('budgets')) return 'Custom Budgets';
        return '';
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-lg">
            <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    {/* Title and User Info */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
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
                            <h1 className="text-3xl font-bold text-gray-900 text-center md:text-left flex-grow md:flex-grow-0">
                                Smarty Budget Tracker
                            </h1>
                        </div>
                        <span className="text-sm text-gray-600 text-center md:text-left">{userInfo?.sub}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            onClick={onLogout}
                            disabled={isLoggingOut}
                            className="inline-flex items-center justify-center px-4 py-2
                                bg-blue-500 text-white rounded hover:bg-blue-600
                                disabled:bg-blue-300 transition-all duration-300"
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
                                className="inline-flex items-center justify-center px-4 py-2
                                    border border-transparent text-sm font-medium rounded-md
                                    shadow-sm text-white bg-indigo-600 hover:bg-indigo-700
                                    focus:outline-none focus:ring-2 focus:ring-offset-2
                                    focus:ring-indigo-500 transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingBudget ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                        Creating...
                                    </>
                                ) : (
                                    'Create New Budget'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Budget Type and Buttons */}
                    {/* Budget Type and Buttons */}
                    <div className="z-10 flex items-center justify-between md:gap-8">
                        {/* W-10 div visible only in desktop */}
                        <div className="hidden md:block w-10"/>

                        {/* CSV button visible only in mobile, at the start */}
                        {!isHomePage && (
                            <div className="md:hidden">
                                <button
                                    onClick={async () => {
                                        try {
                                            const button = document.querySelector('.csv-button-mobile');
                                            if (button) button.classList.add('animate-spin');
                                            await withMinimumDelay(async () => {
                                                await onDownloadCsv();
                                            }, 800);
                                        } finally {
                                            const button = document.querySelector('.csv-button-mobile');
                                            if (button) button.classList.remove('animate-spin');
                                        }
                                    }}
                                    disabled={selectedBudgets.length === 0}
                                    className="p-2 bg-green-600 text-white rounded
                    hover:bg-green-700 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download CSV Report"
                                >
                                    <FileSpreadsheet
                                        className="h-6 w-6 csv-button-mobile transition-transform duration-200"
                                    />
                                </button>
                            </div>
                        )}

                        {/* Budget Type - visible in both mobile and desktop */}
                        {!isHomePage && (
                            <div className="text-center md:flex-grow">
                                <h2 className="text-lg text-gray-600">{getBudgetType()}</h2>
                            </div>
                        )}

                        {/* Container for desktop CSV button and PDF button */}
                        {!isHomePage && (
                            <div className="flex items-center space-x-2">
                                {/* CSV button visible only in desktop */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const button = document.querySelector('.csv-button-desktop');
                                            if (button) button.classList.add('animate-spin');
                                            await withMinimumDelay(async () => {
                                                await onDownloadCsv();
                                            }, 800);
                                        } finally {
                                            const button = document.querySelector('.csv-button-desktop');
                                            if (button) button.classList.remove('animate-spin');
                                        }
                                    }}
                                    disabled={selectedBudgets.length === 0}
                                    className="hidden md:inline-flex p-2 bg-green-600 text-white rounded
                    hover:bg-green-700 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download CSV Report"
                                >
                                    <FileSpreadsheet
                                        className="h-6 w-6 csv-button-desktop transition-transform duration-200"
                                    />
                                </button>

                                {/* PDF Report Button - visible in both mobile and desktop */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const button = document.querySelector('.report-button');
                                            if (button) button.classList.add('animate-spin');
                                            await withMinimumDelay(async () => {
                                                await onGenerateReport();
                                            }, 800);
                                        } finally {
                                            const button = document.querySelector('.report-button');
                                            if (button) button.classList.remove('animate-spin');
                                        }
                                    }}
                                    disabled={selectedBudgets.length === 0}
                                    className="p-2 bg-blue-600 text-white rounded
                    hover:bg-blue-700 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download PDF Report"
                                >
                                    <FileDown
                                        className="h-6 w-6 report-button transition-transform duration-200"
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};