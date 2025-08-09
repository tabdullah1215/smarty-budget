// src/components/Home.js - Enhanced for Multi-SubApp Support
// PRESERVES: All original layout, animations, styling, business logic, error handling
// FULLY BACKWARDS COMPATIBLE: Works with existing auth service and tokens
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Briefcase, Calculator, PiggyBank } from 'lucide-react';
import { Header } from './Header';
import { withMinimumDelay } from '../utils/withDelay';
import { getAvailableBudgetTypes } from '../utils/helpers';
import authService from '../services/authService';

const ICONS = {
    Calculator: Calculator,
    Wallet: Wallet,
    Briefcase: Briefcase,
    PiggyBank: PiggyBank
};

export const Home = () => {
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    const [availableBudgetTypes, setAvailableBudgetTypes] = useState([]);

    // NEW: Enhanced user info with multi-subapp support (safe defaults)
    const [userDisplayMode, setUserDisplayMode] = useState('single'); // 'single', 'multiple', 'all'

    // PRESERVED: Original subappId logic as primary fallback
    const subappId = authService.getSubappId();

    // ENHANCED: useEffect with full backwards compatibility
    useEffect(() => {
        try {
            // SAFE: Get user info with fallback handling
            const userInfo = authService.getUserInfo();
            let budgetTypes = [];
            let displayMode = 'single'; // Default to original behavior

            // NEW: Check if user has enhanced multi-subapp access (only if present)
            if (userInfo?.subAppId === 'all') {
                // User has "all" access - show all possible budget types
                displayMode = 'all';
                budgetTypes = getAvailableBudgetTypes('all');
            } else if (userInfo?.subAppId === 'registered' && userInfo?.userRegisteredSubApps) {
                // User has multiple specific registrations
                displayMode = 'multiple';
                budgetTypes = userInfo.userRegisteredSubApps.flatMap(subAppId =>
                    getAvailableBudgetTypes(subAppId)
                ).filter(Boolean);

                // Remove duplicates if user has overlapping subapp access
                const uniqueBudgetTypes = budgetTypes.filter((type, index, self) =>
                    index === self.findIndex(t => t.id === type.id)
                );
                budgetTypes = uniqueBudgetTypes;
            } else {
                // PRESERVED: Original behavior - single subapp or fallback
                displayMode = 'single';
                // Use the existing subappId (either from userInfo.subAppId or getSubappId fallback)
                const effectiveSubAppId = userInfo?.subAppId || subappId;
                budgetTypes = getAvailableBudgetTypes(effectiveSubAppId);
            }

            setUserDisplayMode(displayMode);

            // PRESERVED: Original filtering logic
            const filteredTypes = budgetTypes.filter(type =>
                type.id !== 'placeholder' && type.enabled === true
            );

            setAvailableBudgetTypes(filteredTypes);

        } catch (error) {
            // FALLBACK: If anything goes wrong, use original logic
            console.warn('Enhanced user detection failed, falling back to original behavior:', error);
            setUserDisplayMode('single');
            const types = getAvailableBudgetTypes(subappId);
            const filteredTypes = types.filter(type =>
                type.id !== 'placeholder' && type.enabled === true
            );
            setAvailableBudgetTypes(filteredTypes);
        }
    }, [subappId]); // Keep original dependency

    // PRESERVED: Original tile click handler with all animations
    const handleTileClick = async (budgetType) => {
        if (!budgetType.enabled || isNavigating) return;

        setIsNavigating(true);
        const tileElement = document.getElementById(budgetType.id);
        const iconElement = tileElement?.querySelector('.tile-icon');

        if (iconElement) {
            iconElement.classList.add('animate-spin');
            await withMinimumDelay(async () => {
                await navigate(budgetType.route);
            }, 1000);
        }
        setIsNavigating(false);
    };

    // NEW: Helper function to get display title based on user access (safe)
    const getDisplayTitle = () => {
        if (userDisplayMode === 'all') {
            return 'All Budget Applications';
        } else if (userDisplayMode === 'multiple') {
            try {
                const userInfo = authService.getUserInfo();
                const subAppCount = userInfo?.userRegisteredSubApps?.length || 0;
                return `Your Budget Apps (${subAppCount} available)`;
            } catch {
                return 'Budget Tracker'; // Safe fallback
            }
        } else {
            // PRESERVED: Original single app behavior
            return null; // Don't show title for single users (original behavior)
        }
    };

    // NEW: Helper function to get welcome message (safe)
    const getWelcomeMessage = () => {
        try {
            const userInfo = authService.getUserInfo();
            const email = userInfo?.sub || userInfo?.email || 'User';

            if (userDisplayMode === 'all') {
                return `Welcome ${email}! You have access to all budget applications.`;
            } else if (userDisplayMode === 'multiple') {
                const subApps = userInfo?.userRegisteredSubApps || [];
                return `Welcome ${email}! You have access to ${subApps.join(', ')} budget types.`;
            } else {
                // PRESERVED: Original behavior for single subapp users
                return null; // Don't show additional message for single app users
            }
        } catch {
            return null; // Safe fallback - no message
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            {/* PRESERVED: Original Header component */}
            <Header />

            {/* NEW: Enhanced header for multi-subapp users (only shown when relevant) */}
            {userDisplayMode !== 'single' && getDisplayTitle() && (
                <div className="max-w-2xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            {getDisplayTitle()}
                        </h1>
                        {getWelcomeMessage() && (
                            <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                                {getWelcomeMessage()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* PRESERVED: Original container with conditional top padding adjustment */}
            <div className={`max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 ${
                userDisplayMode === 'single'
                    ? 'pt-44 md:pt-32 lg:pt-28' // PRESERVED: Original padding for single users
                    : 'pt-4' // Reduced padding for multi-subapp users (header already added)
            }`}>
                <div className="space-y-4">
                    {availableBudgetTypes.map((budgetType) => {
                        const IconComponent = ICONS[budgetType.icon];

                        return (
                            <div
                                id={budgetType.id}
                                key={budgetType.id}
                                onClick={() => handleTileClick(budgetType)}
                                // PRESERVED: All original styling and animations
                                className={`bg-white shadow-md rounded-lg p-6 border-2
                                    hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer
                                    ${budgetType.borderColor}`}
                            >
                                {/* PRESERVED: Original tile content structure */}
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className={`text-xl font-semibold ${budgetType.color}`}>
                                        {budgetType.title}
                                    </h2>
                                    <div className={`${budgetType.color} tile-icon transition-transform duration-500`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                </div>
                                <p className="text-gray-600">{budgetType.description}</p>

                                {/* NEW: Optional subapp indicator for multi-access users (subtle, safe) */}
                                {userDisplayMode === 'multiple' && budgetType.subAppId && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {budgetType.subAppId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* ENHANCED: Empty state with safe fallback */}
                    {availableBudgetTypes.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    No Budget Apps Available
                                </h3>
                                <p className="text-gray-600">
                                    {userDisplayMode === 'all'
                                        ? 'No budget applications are currently configured.'
                                        : userDisplayMode === 'multiple'
                                            ? 'You don\'t have access to any budget applications yet. Contact your administrator for access.'
                                            : 'No budget applications are available. Please contact support.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;