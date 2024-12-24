import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import authService from '../services/authService';
import { indexdbService } from '../services/IndexDBService';

export const useBudgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userInfo = authService.getUserInfo();
    const userEmail = userInfo?.sub;

    useEffect(() => {
        const loadBudgets = async () => {
            if (!userEmail) return;
            try {
                const userBudgets = await indexdbService.getBudgetsByEmail(userEmail);
                setBudgets(userBudgets);
            } catch (error) {
                console.error('Error loading budgets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadBudgets();
    }, [userEmail]);

    const createBudget = async (name, type, totalBudget) => {
        if (!userEmail) throw new Error('User not authenticated');

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

        try {
            await indexdbService.addBudget(newBudget);
            setBudgets(prev => [...prev, newBudget]);
            return newBudget;
        } catch (error) {
            console.error('Error creating budget:', error);
            throw error;
        }
    };

    const updateBudget = async (updatedBudget) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            const budgetToUpdate = {
                ...updatedBudget,
                updatedAt: new Date().toISOString(),
                userEmail
            };
            await indexdbService.updateBudget(budgetToUpdate);
            setBudgets(prev => prev.map(budget =>
                budget.id === budgetToUpdate.id ? budgetToUpdate : budget
            ));
        } catch (error) {
            console.error('Error updating budget:', error);
            throw error;
        }
    };

    const deleteBudget = async (budgetId) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            await indexdbService.deleteBudget(budgetId);
            setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
        } catch (error) {
            console.error('Error deleting budget:', error);
            throw error;
        }
    };

    return {
        budgets,
        createBudget,
        updateBudget,
        deleteBudget,
        isLoading
    };
};