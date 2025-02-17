// src/utils/helpers.js

export const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const budgetTypes = {
    custom: {
        id: 'custom',
        title: 'Custom Budgets',
        description: 'Create and manage custom budget plans',
        route: '/budgets',
        icon: 'Calculator',
        color: 'text-purple-600',
        borderColor: 'border-purple-600',
        visible: false,
        enabled: false
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
        enabled: true
    },
    business: {
        id: 'business',
        title: 'Business Trip Expenses',
        description: 'Track business travel expenses and receipts',
        route: '/business-budgets',
        icon: 'Briefcase',
        color: 'text-emerald-800',
        borderColor: 'border-emerald-800',
        visible: false,
        enabled: false
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
        enabled: false
    }
};

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