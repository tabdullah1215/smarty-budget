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
                const userPaycheckBudgets = await indexdbService.getPaycheckBudgetsByEmail(userEmail);
                setPaycheckBudgets(userPaycheckBudgets);
            } catch (error) {
                console.error('Error loading paycheck budgets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPaycheckBudgets();
    }, [userEmail]);

    const createPaycheckBudget = async ({ name, date, amount }) => {
        if (!userEmail) throw new Error('User not authenticated');

        const newBudget = {
            id: uuidv4(),
            name,
            date,
            amount,
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

    return {
        paycheckBudgets,
        createPaycheckBudget,
        isLoading
    };
};