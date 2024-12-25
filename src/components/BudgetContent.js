import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Loader2 } from 'lucide-react';
import { BudgetList } from './BudgetList';
import { BudgetDetails } from './BudgetDetails';
import { BudgetForm } from './BudgetForm';
import { useBudgets } from '../hooks/useBudget';
import { useLogin } from '../hooks/useLogin';
import authService from '../services/authService';
import { withMinimumDelay } from '../utils/withDelay';
import { budgetTemplates } from '../data/budgetTemplates';

export const BudgetContent = () => {
    const {budgets, createBudget, updateBudget, deleteBudget, isLoading} = useBudgets();
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
    const [selectedBudgetType, setSelectedBudgetType] = useState('monthly');
    const [isCreating, setIsCreating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const {handleLogout} = useLogin();
    const userInfo = authService.getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userInfo?.sub) {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const handleCreateClick = async () => {
        setIsCreating(true);
        await withMinimumDelay(async () => {
            setShowNewBudgetForm(true);
        });
        setIsCreating(false);
    };

    const handleCreateBudget = async (budgetData) => {
        setIsCreating(true);
        await withMinimumDelay(async () => {
            try {
                await createBudget(budgetData.name, budgetData.type, budgetData.totalBudget);
                setShowNewBudgetForm(false);
            } catch (error) {
                console.error('Error creating budget:', error);
                // Handle error presentation to user
            }
        });
        setIsCreating(false);
    };

    // const onLogout = async () => {
    //     setIsLoggingOut(true);
    //
    //     // Inline delay before invoking the logout handler
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //
    //     handleLogout(); // This still includes the navigation logic
    //     setIsLoggingOut(false);
    // };

    const onLogout = async () => {
        setIsLoggingOut(true);

        try {
            await withMinimumDelay(() => handleLogout(), 2000); // Ensure delay happens first
        } catch (error) {
            console.error('Logout failed:', error); // Optional: Handle errors gracefully
        }

        setIsLoggingOut(false);
    };



    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-200 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">Smarty Budget Tracker</h1>
                            <span className="text-sm text-gray-600">
                                {userInfo?.sub}
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={onLogout}
                                disabled={isLoggingOut}
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {isLoggingOut && <Loader2 size={16} className="mr-2 animate-spin"/>}
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                            <button
                                onClick={handleCreateClick}
                                disabled={isCreating}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent
                                    text-sm font-medium rounded-md shadow-sm text-white
                                    bg-indigo-600 hover:bg-indigo-700
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Create New Budget
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Budget Forms and Lists */}
                {showNewBudgetForm && (
                    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50">
                        <div className="absolute inset-0 bg-gray-600 bg-opacity-50"></div>
                        <div
                            className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Create New Budget</h2>
                                <button
                                    onClick={() => setShowNewBudgetForm(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <X className="h-6 w-6"/>
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
                <div className="relative min-h-screen">
                    {/* Budget List */}
                    <div
                        className={`relative transition-opacity duration-300 ${selectedBudget ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
                    >
                        <BudgetList
                            budgets={budgets}
                            onSelect={setSelectedBudget}
                            onDelete={deleteBudget}
                        />
                    </div>

                    {/* Budget Details Overlay */}
                    {selectedBudget && (
                        <div
                            className="absolute inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center p-4 sm:p-6">
                            <div className="w-[90%] max-w-2xl bg-white shadow-lg rounded-lg p-6">
                                <BudgetDetails
                                    budget={selectedBudget}
                                    onClose={() => setSelectedBudget(null)}
                                    onUpdate={updateBudget}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};