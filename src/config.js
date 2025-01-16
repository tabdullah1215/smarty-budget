// src/config.js
export const API_ENDPOINT = 'https://vsisvetgu5.execute-api.us-east-1.amazonaws.com/prod';
export const APP_ID = 'budget-tracker';

// export const DB_CONFIG = {
//     name: 'BudgetTrackerDB',
//     version: 3, // Increment the version
//     stores: {
//         budgets: 'budgets',
//         paycheckBudgets: 'paycheckBudgets',
//     },
// };

export const DB_CONFIG = {
    name: 'BudgetTrackerDB',
    version: 4, // Incremented version for new store
    stores: {
        budgets: 'budgets',
        paycheckBudgets: 'paycheckBudgets',
        paycheckCategories: 'paycheckCategories',
    },
};