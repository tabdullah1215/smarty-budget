import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { BudgetList } from './BudgetList';
import { BudgetDetails } from './BudgetDetails';
import { BudgetForm } from './BudgetForm';
import { Header } from './Header';
import { useBudgets } from '../hooks/useBudget';
import authService from '../services/authService';
import {withMinimumDelay} from "../utils/withDelay";

export const BudgetContent = () => {
    const {budgets, createBudget, updateBudget, deleteBudget, isLoading} = useBudgets();
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
    const [selectedBudgetType, setSelectedBudgetType] = useState('monthly');
    const [isCreating, setIsCreating] = useState(false);
    const [isXClosing, setIsXClosing] = useState(false);
    const userInfo = authService.getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userInfo?.sub) {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const handleCreateClick = async () => {
        setIsCreating(true);
        try {
            await withMinimumDelay(async () => {}, 1000);
            setShowNewBudgetForm(true);
        } finally {
            setIsCreating(false);
        }
    };

    const handleXClose = async () => {
        setIsXClosing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsXClosing(false);
        setShowNewBudgetForm(false);
    };

    const handleCreateBudget = async (budgetData) => {
        setIsCreating(true);
        try {
            await createBudget(budgetData.name, budgetData.type, budgetData.totalBudget);
            setShowNewBudgetForm(false);
        } catch (error) {
            console.error('Error creating budget:', error);
        }
        setIsCreating(false);
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-gray-200 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <Header showCreateButton
                    onCreateClick={handleCreateClick}
                    isCreatingBudget={isCreating}
            />

            <div className="pt-60 md:pt-36 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto pb-8">
                    <div className="relative">
                        <BudgetList
                            budgets={budgets}
                            onSelect={setSelectedBudget}
                            onDelete={deleteBudget}
                        />
                    </div>
                </div>
            </div>

            {showNewBudgetForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="mx-auto p-5 border w-[95%] max-w-xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Create New Budget</h2>
                            <button
                                onClick={handleXClose}
                                disabled={isXClosing}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isXClosing ? (
                                    <Loader2 className="h-6 w-6 animate-spin"/>
                                ) : (
                                    <X className="h-6 w-6"/>
                                )}
                            </button>
                        </div>
                        <BudgetForm
                            onSave={handleCreateBudget}
                            onClose={() => setShowNewBudgetForm(false)}
                            budgetType={selectedBudgetType}
                            isNewBudget={true}
                        />
                    </div>
                </div>
            )}

            {selectedBudget && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-start pt-20 overflow-y-auto">
                    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
                        <BudgetDetails
                            budget={selectedBudget}
                            onClose={() => setSelectedBudget(null)}
                            onUpdate={updateBudget}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};