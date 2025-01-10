// src/services/indexdbService.js
import { DB_CONFIG } from '../config';

class IndexDBService {
    constructor() {
        this.db = null;
    }

    async initDB() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            // Replace this entire block
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create stores if they don't exist
                if (!db.objectStoreNames.contains(DB_CONFIG.stores.budgets)) {
                    const store = db.createObjectStore(DB_CONFIG.stores.budgets, {keyPath: 'id'});
                    store.createIndex('userEmail', 'userEmail', {unique: false});
                    store.createIndex('createdAt', 'createdAt', {unique: false});
                }

                // Add the paycheckBudgets object store
                if (!db.objectStoreNames.contains(DB_CONFIG.stores.paycheckBudgets)) {
                    const paycheckStore = db.createObjectStore(DB_CONFIG.stores.paycheckBudgets, { keyPath: 'id' });
                    paycheckStore.createIndex('userEmail', 'userEmail', { unique: false });
                    paycheckStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    async getBudgetsByEmail(userEmail) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.budgets], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.budgets);
            const index = store.index('userEmail');
            const request = index.getAll(IDBKeyRange.only(userEmail));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.budgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.budgets);
            const request = store.add(budget);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.budgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.budgets);
            const request = store.put(budget);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteBudget(budgetId) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.budgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.budgets);
            const request = store.delete(budgetId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getPaycheckBudgetsByEmail(userEmail) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);
            const index = store.index('userEmail');
            const request = index.getAll(IDBKeyRange.only(userEmail));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addPaycheckBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);
            const request = store.add(budget);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clearUserData(userEmail) {
        if (!this.db) await this.initDB();

        // Clear regular budgets
        const budgets = await this.getBudgetsByEmail(userEmail);
        const regularBudgetPromises = budgets.map(budget =>
            new Promise((resolve, reject) => {
                const transaction = this.db.transaction([DB_CONFIG.stores.budgets], 'readwrite');
                const store = transaction.objectStore(DB_CONFIG.stores.budgets);
                const request = store.delete(budget.id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
        );

        // Clear paycheck budgets
        const paycheckBudgets = await this.getPaycheckBudgetsByEmail(userEmail);
        const paycheckBudgetPromises = paycheckBudgets.map(budget =>
            new Promise((resolve, reject) => {
                const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readwrite');
                const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);
                const request = store.delete(budget.id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
        );

        return Promise.all([...regularBudgetPromises, ...paycheckBudgetPromises]);
    }
}

export const indexdbService = new IndexDBService();