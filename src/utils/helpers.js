// src/utils/helpers.js - SAFE ENHANCEMENT preserving original structure

import { DEFAULT_BUDGET_TYPE } from '../config';

// PRESERVED: Original function
export const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// PRESERVED: Original budget types object with exact same structure
export const budgetTypes = {
    custom: {
        id: 'custom',
        title: 'Custom Budgets',
        description: 'Create and manage custom budget plans',
        route: '/custom-budgets',
        icon: 'Calculator',
        color: 'text-purple-600',
        borderColor: 'border-purple-600',
        visible: false,
        enabled: false,
        buttonText: 'Create New Budget'
    },
    paycheck: {
        id: 'paycheck',
        title: 'Paycheck Budgets',
        description: 'Track and manage your paycheck spending',
        route: '/paycheck-budgets',
        icon: 'Wallet',
        color: 'text-blue-600',
        borderColor: 'border-blue-600',
        visible: true,
        enabled: true,
        buttonText: 'Create New Budget'
    },
    business: {
        id: 'business',
        title: 'Business Projects',
        description: 'Track expenses for Business Projects',
        route: '/business-budgets',
        icon: 'Briefcase',
        color: 'text-emerald-800',
        borderColor: 'border-emerald-800',
        visible: true,
        enabled: true,
        buttonText: 'Create New Project'
    },
    savings: {
        id: 'savings',
        title: 'Savings Goals',
        description: 'Set and track your savings goals',
        route: '/savings-budgets',
        icon: 'PiggyBank',
        color: 'text-orange-800',
        borderColor: 'border-orange-800',
        visible: true,
        enabled: false,
        buttonText: 'Create New Goal'
    }
};

// PRESERVED: Original placeholder budget type
const placeholderBudgetType = {
    id: 'placeholder',
    title: 'More Budget Features Coming Soon',
    description: 'We\'re working on adding more budget management features',
    route: '#',
    icon: 'Calculator',
    color: 'text-gray-600',
    borderColor: 'border-gray-300',
    visible: true,
    enabled: false
};

// PRESERVED: Original functions
export const isLocalhost = () => {
    return process.env.REACT_APP_IS_LOCAL === 'true' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
};

export const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const shouldBypassMobileCheck = () => {
    return isLocalhost();
};

// ENHANCED: getAvailableBudgetTypes with multi-subapp support but preserving original structure
export const getAvailableBudgetTypes = (subappId) => {
    // PRESERVED: Original null/undefined handling
    if (!subappId) {
        return [{ ...budgetTypes[DEFAULT_BUDGET_TYPE], visible: true, enabled: true }];
    }

    // ENHANCED: Handle multi-subapp scenarios while preserving original structure
    if (Array.isArray(subappId)) {
        // NEW: Handle array of subAppIds (for registered users with multiple access)
        const availableTypes = [];
        subappId.forEach(id => {
            if (budgetTypes[id]) {
                availableTypes.push({ ...budgetTypes[id], visible: true, enabled: true });
            }
        });
        // Add placeholder if we have room
        if (availableTypes.length < Object.keys(budgetTypes).length) {
            availableTypes.push(placeholderBudgetType);
        }
        return availableTypes;
    }

    // PRESERVED: Original direct subappId to budgetType mapping
    switch (subappId) {
        case 'paycheck':
            return [
                { ...budgetTypes.paycheck, visible: true, enabled: true },
                placeholderBudgetType
            ];

        case 'savings':
            return [
                { ...budgetTypes.savings, visible: true, enabled: true },
                placeholderBudgetType
            ];

        case 'custom':
            return [
                { ...budgetTypes.custom, visible: true, enabled: true },
                placeholderBudgetType
            ];

        case 'business':
            return [
                { ...budgetTypes.business, visible: true, enabled: true },
                placeholderBudgetType
            ];

        case 'all':
            // ENHANCED: Enable all budget types when subappId is 'all'
            return Object.values(budgetTypes).map(type => ({
                ...type,
                visible: true,
                enabled: true
            }));

        default:
            // PRESERVED: Unknown subappId - fallback to paycheck only
            return [{ ...budgetTypes[DEFAULT_BUDGET_TYPE], visible: true, enabled: true }];
    }
};

// NEW: Additional helper functions (additive only - don't break existing functionality)

// Helper function to format user display information (safe)
export const formatUserDisplayInfo = (userInfo) => {
    if (!userInfo) return 'Guest User';

    const email = userInfo.sub || userInfo.email || 'Unknown User';
    const subAppId = userInfo.subAppId;

    if (subAppId === 'all') {
        return `${email} (All Access)`;
    } else if (subAppId === 'registered') {
        const subApps = userInfo.userRegisteredSubApps || [];
        return `${email} (${subApps.length} app${subApps.length !== 1 ? 's' : ''})`;
    } else {
        return `${email} (${subAppId || 'Limited Access'})`;
    }
};

// Helper function to check if user has access to specific budget type (safe)
export const hasAccessToBudgetType = (userInfo, budgetTypeId) => {
    if (!userInfo) return false;

    if (userInfo.subAppId === 'all') {
        return true;
    } else if (userInfo.subAppId === 'registered') {
        return userInfo.userRegisteredSubApps?.includes(budgetTypeId) || false;
    } else {
        return userInfo.subAppId === budgetTypeId;
    }
};

// Helper function to get user's accessible budget types (safe)
export const getUserAccessibleBudgetTypes = (userInfo) => {
    if (!userInfo) return [];

    if (userInfo.subAppId === 'all') {
        return getAvailableBudgetTypes('all');
    } else if (userInfo.subAppId === 'registered') {
        return getAvailableBudgetTypes(userInfo.userRegisteredSubApps || []);
    } else {
        return getAvailableBudgetTypes(userInfo.subAppId);
    }
};

// Enhanced navigation helper with access checking (safe)
export const navigateWithAccessCheck = (navigate, budgetType, userInfo) => {
    if (!hasAccessToBudgetType(userInfo, budgetType.id)) {
        console.warn(`User ${userInfo?.email} attempted to access ${budgetType.id} without permission`);
        return false;
    }

    navigate(budgetType.route);
    return true;
};

// Helper to get display title for dashboard based on user access (safe)
export const getDashboardTitle = (userInfo) => {
    if (!userInfo) return 'Budget Tracker';

    if (userInfo.subAppId === 'all') {
        return 'All Budget Applications';
    } else if (userInfo.subAppId === 'registered') {
        const subAppCount = userInfo.userRegisteredSubApps?.length || 0;
        return `Your Budget Apps (${subAppCount} available)`;
    } else {
        // Return specific budget type name if available
        const budgetType = budgetTypes[userInfo.subAppId];
        if (budgetType) {
            return budgetType.title;
        }
        return 'Budget Tracker';
    }
};