// src/config.js
//export const API_ENDPOINT = 'https://vsisvetgu5.execute-api.us-east-1.amazonaws.com/prod';

export const API_ENDPOINT = 'https://tkdjfvpqjk.execute-api.us-east-1.amazonaws.com/prod';
export const APP_ID = 'budget-tracker';
export const DEFAULT_BUDGET_TYPE = 'paycheck';

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
    version: 7, // Increment version for new store
    stores: {
        budgets: 'budgets',
        paycheckBudgets: 'paycheckBudgets',
        businessBudgets: 'businessBudgets',
        paycheckCategories: 'paycheckCategories',
        businessCategories: 'businessCategories',
        backupInfo: 'backupInfo',
    },
};