import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import authService from '../services/authService';
import { indexdbService } from '../services/IndexDBService';

export const usePaycheckBudgets = () => {
    const [paycheckBudgets, setPaycheckBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userInfo = authService.getUserInfo();
    const userEmail = userInfo?.sub;

    useEffect(() => {
        const loadPaycheckBudgets = async () => {
            if (!userEmail) return;
            try {
                const userBudgets = await indexdbService.getPaycheckBudgetsByEmail(userEmail);
                setPaycheckBudgets(userBudgets);
            } catch (error) {
                console.error('Error loading paycheck budgets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPaycheckBudgets();
    }, [userEmail]);

    const createPaycheckBudget = async (budgetData) => {
        if (!userEmail) throw new Error('User not authenticated');

        const newBudget = {
            id: uuidv4(),
            name: budgetData.name,
            date: budgetData.date,
            amount: budgetData.amount,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userEmail
        };

        try {
            await indexdbService.addPaycheckBudget(newBudget);
            setPaycheckBudgets(prev => [...prev, newBudget]);
            return newBudget;
        } catch (error) {
            console.error('Error creating paycheck budget:', error);
            throw error;
        }
    };

    const updatePaycheckBudget = async (updatedBudget) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            const budgetToUpdate = {
                ...updatedBudget,
                updatedAt: new Date().toISOString(),
                userEmail,
                items: updatedBudget.items || [] // Ensure items array exists
            };

            await indexdbService.updatePaycheckBudget(budgetToUpdate);
            setPaycheckBudgets(prev => prev.map(budget =>
                budget.id === budgetToUpdate.id ? budgetToUpdate : budget
            ));

            return budgetToUpdate;
        } catch (error) {
            console.error('Error updating paycheck budget:', error);
            throw error;
        }
    };

    const deletePaycheckBudget = async (budgetId) => {
        if (!userEmail) throw new Error('User not authenticated');

        try {
            await indexdbService.deletePaycheckBudget(budgetId);
            setPaycheckBudgets(prev => prev.filter(budget => budget.id !== budgetId));
        } catch (error) {
            console.error('Error deleting paycheck budget:', error);
            throw error;
        }
    };

    return {
        paycheckBudgets,
        createPaycheckBudget,
        updatePaycheckBudget,
        deletePaycheckBudget,
        isLoading
    };
};