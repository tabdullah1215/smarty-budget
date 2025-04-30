// src/config.js
//export const API_ENDPOINT = 'https://vsisvetgu5.execute-api.us-east-1.amazonaws.com/prod';

export const API_ENDPOINT = 'https://tkdjfvpqjk.execute-api.us-east-1.amazonaws.com/prod';
export const APP_ID = 'budget-tracker';
export const DEFAULT_BUDGET_TYPE = 'paycheck';

export const DB_CONFIG = {
    name: 'BudgetTrackerDB',
    version: 13, // Increment version number for schema change
    stores: {
        customBudgets: 'customBudgets',
        paycheckBudgets: 'paycheckBudgets',
        businessBudgets: 'businessBudgets',
        paycheckCategories: 'paycheckCategories',
        businessCategories: 'businessCategories',
        customCategories: 'customCategories',
        backupInfo: 'backupInfo',
    },
};