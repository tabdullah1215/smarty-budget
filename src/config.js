// src/config.js
export const API_ENDPOINT = 'https://vsisvetgu5.execute-api.us-east-1.amazonaws.com/prod';
export const APP_ID = 'budget-tracker';

export const DB_CONFIG = {
    name: 'BudgetTrackerDB',
    version: 3, // Increment the version
    stores: {
        budgets: 'budgets',
        paycheckBudgets: 'paycheckBudgets',
    },
};

// Add any future IndexedDB stores here
// Example:
// stores: {
//     budgets: 'budgets',
//     categories: 'categories',
//     templates: 'templates'
// }