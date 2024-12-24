// src/config.js
export const API_ENDPOINT = 'https://vsisvetgu5.execute-api.us-east-1.amazonaws.com/prod';
export const APP_ID = 'budget-tracker';

export const DB_CONFIG = {
    name: 'BudgetTrackerDB',
    version: 1,
    stores: {
        budgets: 'budgets'
    }
};

// Add any future IndexedDB stores here
// Example:
// stores: {
//     budgets: 'budgets',
//     categories: 'categories',
//     templates: 'templates'
// }