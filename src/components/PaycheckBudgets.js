import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Header } from './Header';
import { PaycheckBudgetForm } from './PaycheckBudgetForm';
import { usePaycheckBudgets } from '../hooks/usePaycheckBudget'; // Import the hook
import authService from '../services/authService';

export const PaycheckBudgets = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
    const navigate = useNavigate();
    const userInfo = authService.getUserInfo();

    // Use the usePaycheckBudgets hook
    const { paycheckBudgets, createPaycheckBudget, isLoading } = usePaycheckBudgets();

    useEffect(() => {
        if (!userInfo?.sub) {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const handleCreateClick = async () => {
        setIsCreating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setShowNewBudgetForm(true);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateBudget = async (budgetData) => {
        try {
            // Use the createPaycheckBudget function from the hook
            await createPaycheckBudget(budgetData);
            setShowNewBudgetForm(false);
        } catch (error) {
            console.error('Error creating budget:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header
                showCreateButton
                onCreateClick={handleCreateClick}
                isCreatingBudget={isCreating}
            />

            <div className="pt-60 md:pt-36 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto pb-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                        </div>
                    ) : paycheckBudgets.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    No Paycheck Budgets Yet
                                </h3>
                                <p className="text-gray-500 max-w-sm mb-6">
                                    Track your income and expenses for each paycheck. Create your first paycheck budget to get started.
                                </p>
                                <button
                                    onClick={handleCreateClick}
                                    disabled={isCreating}
                                    className="inline-flex items-center px-4 py-2 border border-transparent
                                        text-sm font-medium rounded-md shadow-sm text-white bg-blue-600
                                        hover:bg-blue-700 focus:outline-none focus:ring-2
                                        focus:ring-offset-2 focus:ring-blue-500
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all duration-200"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5 mr-2" />
                                            Create Paycheck Budget
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paycheckBudgets.map((budget) => (
                                <div key={budget.id} className="bg-white shadow-md rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-900">{budget.name}</h3>
                                    <p className="text-gray-600">Amount: ${budget.amount.toLocaleString()}</p>
                                    <p className="text-gray-600">Date: {new Date(budget.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showNewBudgetForm && (
                <PaycheckBudgetForm
                    onSave={handleCreateBudget}
                    onClose={() => setShowNewBudgetForm(false)}
                />
            )}
        </div>
    );
};