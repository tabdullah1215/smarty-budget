// src/hooks/useBusinessBudget.js
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import authService from '../services/authService';
import { indexdbService } from '../services/IndexDBService';

export const useBusinessBudgets = () => {
    const [businessBudgets, setBusinessBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userInfo = authService.getUserInfo();
    const userEmail = userInfo?.sub;

    useEffect(() => {
        const loadBusinessBudgets = async () => {
            if (!userEmail) return;
            try {
                // Use the dedicated method for business budgets
                const userBudgets = await indexdbService.getBusinessBudgetsByEmail(userEmail);
                setBusinessBudgets(userBudgets);
            } catch (error) {
                console.error('Error loading business budgets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadBusinessBudgets();
    }, [userEmail]);

    const createBusinessBudget = async (budgetData) => {
        if (!userEmail) throw new Error('User not authenticated');

        const budgetAmount = budgetData.amount ? Number(budgetData.amount) : 0;

        const newBudget = {
            id: uuidv4(),
            name: budgetData.name,
            date: budgetData.date,
            amount: budgetAmount, // Store as 0 if not provided
            projectName: budgetData.projectName || budgetData.name,
            client: budgetData.client || null,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userEmail
        };

        try {
            await indexdbService.addBusinessBudget(newBudget);
            setBusinessBudgets(prev => [...prev, newBudget]);
            return newBudget;
        } catch (error) {
            console.error('Error creating business budget:', error);
            throw error;
        }
    };
    const updateBusinessBudget = async (updatedBudget) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            const budgetToUpdate = {
                ...updatedBudget,
                updatedAt: new Date().toISOString(),
                userEmail,
                items: updatedBudget.items || []
            };

            // Use the dedicated method for business budgets
            await indexdbService.updateBusinessBudget(budgetToUpdate);
            setBusinessBudgets(prev => prev.map(budget =>
                budget.id === budgetToUpdate.id ? budgetToUpdate : budget
            ));

            return budgetToUpdate;
        } catch (error) {
            console.error('Error updating business budget:', error);
            throw error;
        }
    };

    const deleteBusinessBudget = async (budgetId) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            // Use the dedicated method for business budgets
            await indexdbService.deleteBusinessBudget(budgetId);
            setBusinessBudgets(prev => prev.filter(budget => budget.id !== budgetId));
        } catch (error) {
            console.error('Error deleting business budget:', error);
            throw error;
        }
    };

    return {
        businessBudgets,
        createBusinessBudget,
        updateBusinessBudget,
        deleteBusinessBudget,
        isLoading
    };
};