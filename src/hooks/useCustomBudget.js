// src/hooks/useCustomBudget.js
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import authService from '../services/authService';
import { indexdbService } from '../services/IndexDBService';

export const useCustomBudgets = () => {
    const [customBudgets, setCustomBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userInfo = authService.getUserInfo();
    const userEmail = userInfo?.sub;

    useEffect(() => {
        const loadCustomBudgets = async () => {
            if (!userEmail) return;
            try {
                // We're using the existing getBudgetsByEmail method for custom budgets
                const userBudgets = await indexdbService.getCustomBudgetsByEmail(userEmail);
                setCustomBudgets(userBudgets);
            } catch (error) {
                console.error('Error loading custom budgets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCustomBudgets();
    }, [userEmail]);

    const createCustomBudget = async (budgetData) => {
        if (!userEmail) throw new Error('User not authenticated');

        const newBudget = {
            id: uuidv4(),
            name: budgetData.name,
            date: budgetData.date,
            amount: Number(budgetData.amount),
            budgetCategory: budgetData.budgetCategory || null, // Store the budgetCategory
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userEmail
        };

        try {
            await indexdbService.addCustomBudget(newBudget);
            setCustomBudgets(prev => [...prev, newBudget]);
            return newBudget;
        } catch (error) {
            console.error('Error creating custom budget:', error);
            throw error;
        }
    };

    const updateCustomBudget = async (updatedBudget) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            const budgetToUpdate = {
                ...updatedBudget,
                updatedAt: new Date().toISOString(),
                userEmail,
                items: updatedBudget.items || [],
                // Ensure budgetCategory is preserved during update
                budgetCategory: updatedBudget.budgetCategory || null
            };

            await indexdbService.updateCustomBudget(budgetToUpdate);
            setCustomBudgets(prev => prev.map(budget =>
                budget.id === budgetToUpdate.id ? budgetToUpdate : budget
            ));

            return budgetToUpdate;
        } catch (error) {
            console.error('Error updating custom budget:', error);
            throw error;
        }
    };

    const deleteCustomBudget = async (budgetId) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            await indexdbService.deleteCustomBudget(budgetId);
            setCustomBudgets(prev => prev.filter(budget => budget.id !== budgetId));
        } catch (error) {
            console.error('Error deleting custom budget:', error);
            throw error;
        }
    };

    return {
        customBudgets,
        createCustomBudget,
        updateCustomBudget,
        deleteCustomBudget,
        isLoading
    };
};