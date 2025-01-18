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
        visible: false,    // Show the tile
        enabled: false     // Tile is clickable
    },
    paycheck: {
        id: 'paycheck',
        title: 'Paycheck Budgets',
        description: 'Track and manage your paycheck spending',
        route: '/paycheck-budgets',
        icon: 'Wallet',
        color: 'text-blue-600',
        borderColor: 'border-blue-600',
        visible: true,    // Show the tile
        enabled: true    // Tile is not clickable (disabled state)
    },
    business: {
        id: 'business',
        title: 'Business Trip Expenses',
        description: 'Track business travel expenses and receipts',
        route: '/business-budgets',
        icon: 'Briefcase',
        color: 'text-emerald-800',
        borderColor: 'border-emerald-800',
        visible: false,   // Don't show the tile at all
        enabled: false    // Not relevant since tile is hidden
    },
    savings: {
        id: 'savings',
        title: 'Savings Goals',
        description: 'Set and track your savings goals',
        route: '/savings-budgets',
        icon: 'PiggyBank',
        color: 'text-orange-800',
        borderColor: 'border-orange-800',
        visible: true,   // Don't show the tile at all
        enabled: false    // Not relevant since tile is hidden
    }
};