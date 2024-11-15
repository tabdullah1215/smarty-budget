import React, { useState } from 'react';
import { FileText, Trash2, Calendar, DollarSign, PieChart, Loader2 } from 'lucide-react';
import { generateUniqueColor } from '../utils/colorGenerator';

export const BudgetList = ({ budgets, onSelect, onDelete }) => {
    const [deletingBudgetId, setDeletingBudgetId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [openingBudgetId, setOpeningBudgetId] = useState(null);

    const handleDelete = async (budgetId) => {
        setConfirmingDeleteId(budgetId);
        await new Promise(resolve => setTimeout(resolve, 500));
        setConfirmingDeleteId(null);
        setDeletingBudgetId(budgetId);
    };

    const confirmDelete = async () => {
        if (deletingBudgetId) {
            setIsDeleting(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            onDelete(deletingBudgetId);
            setDeletingBudgetId(null);
            setIsDeleting(false);
        }
    };

    const handleOpenBudget = async (budget) => {
        setOpeningBudgetId(budget.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        setOpeningBudgetId(null);
        onSelect(budget);
    };

    return (
        <div className="space-y-4">
            {budgets.map((budget, index) => {
                const totalSpent = budget.items
                    .filter(item => item.isCommitted)
                    .reduce((sum, item) => sum + item.amount, 0);
                const remaining = budget.totalBudget - totalSpent;
                const spentPercentage = (totalSpent / budget.totalBudget) * 100;
                const progressColor = generateUniqueColor(index);

                return (
                    <div
                        key={budget.id}
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900">{budget.name}</h3>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        <span className="text-sm">
                      Last updated: {new Date(budget.updatedAt).toLocaleDateString()}
                    </span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <PieChart className="h-5 w-5 mr-2" />
                                        <span className="text-sm capitalize">
                      Type: {budget.type}
                    </span>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div>
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="h-5 w-5 mr-1" />
                                            <span className="text-sm font-medium">Total Budget:</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">
                      ${budget.totalBudget.toLocaleString()}
                    </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="h-5 w-5 mr-1" />
                                            <span className="text-sm font-medium">Total Spent:</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">
                      ${totalSpent.toLocaleString()}
                    </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="h-5 w-5 mr-1" />
                                            <span className="text-sm font-medium">Remaining:</span>
                                        </div>
                                        <span className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${remaining.toLocaleString()}
                    </span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(spentPercentage, 100)}%`,
                                                backgroundColor: progressColor
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {spentPercentage.toFixed(1)}% of budget used
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-2 ml-4">
                                <button
                                    onClick={() => handleOpenBudget(budget)}
                                    disabled={openingBudgetId === budget.id || confirmingDeleteId === budget.id}
                                    className="inline-flex items-center p-2 border border-transparent rounded-md text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="View details"
                                >
                                    {openingBudgetId === budget.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <FileText className="h-5 w-5" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(budget.id)}
                                    disabled={confirmingDeleteId === budget.id || openingBudgetId === budget.id}
                                    className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete budget"
                                >
                                    {confirmingDeleteId === budget.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {deletingBudgetId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Budget</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this budget? This action cannot be undone and will remove all associated budget items.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    onClick={() => setDeletingBudgetId(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : null}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};