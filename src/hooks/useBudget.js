import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import authService from '../services/authService';

const DB_NAME = 'BudgetTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'budgets';

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('userEmail', 'userEmail', { unique: false });
            }
        };
    });
};

export const useBudgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [db, setDb] = useState(null);
    const userInfo = authService.getUserInfo();
    const userEmail = userInfo?.sub;

    useEffect(() => {
        const setupDB = async () => {
            try {
                const database = await initDB();
                setDb(database);
                if (userEmail) {
                    await loadBudgets(database);
                }
            } catch (error) {
                console.error('Error initializing database:', error);
            }
        };
        setupDB();
    }, [userEmail]);

    const loadBudgets = async (database) => {
        if (!database || !userEmail) return;

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('userEmail');
            const request = index.getAll(IDBKeyRange.only(userEmail));

            request.onsuccess = () => {
                setBudgets(request.result);
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    };

    const createBudget = async (name, type, totalBudget) => {
        if (!db || !userEmail) return null;

        const newBudget = {
            id: uuidv4(),
            name,
            type,
            totalBudget,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userEmail
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(newBudget);

            request.onsuccess = async () => {
                await loadBudgets(db);
                resolve(newBudget);
            };
            request.onerror = () => reject(request.error);
        });
    };

    const updateBudget = async (updatedBudget) => {
        if (!db || !userEmail) return;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({
                ...updatedBudget,
                updatedAt: new Date().toISOString(),
                userEmail
            });

            request.onsuccess = async () => {
                await loadBudgets(db);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    };

    const deleteBudget = async (budgetId) => {
        if (!db || !userEmail) return;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(budgetId);

            request.onsuccess = async () => {
                await loadBudgets(db);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    };

    return {
        budgets,
        createBudget,
        updateBudget,
        deleteBudget,
        isLoading: !db
    };
};