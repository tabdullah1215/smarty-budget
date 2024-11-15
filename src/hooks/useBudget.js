import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useBudgets = () => {
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        const savedBudgets = localStorage.getItem('budgets');
        if (savedBudgets) {
            setBudgets(JSON.parse(savedBudgets));
        }
    }, []);

    const saveBudgets = (updatedBudgets) => {
        localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
        setBudgets(updatedBudgets);
    };

    const createBudget = (name, type, totalBudget) => {
        const newBudget = {
            id: uuidv4(),
            name,
            type,
            totalBudget,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveBudgets([...budgets, newBudget]);
        return newBudget;
    };

    const updateBudget = (updatedBudget) => {
        const updatedBudgets = budgets.map(budget =>
            budget.id === updatedBudget.id
                ? { ...updatedBudget, updatedAt: new Date().toISOString() }
                : budget
        );
        saveBudgets(updatedBudgets);
    };

    const deleteBudget = (budgetId) => {
        saveBudgets(budgets.filter(budget => budget.id !== budgetId));
    };

    return {
        budgets,
        createBudget,
        updateBudget,
        deleteBudget
    };
};