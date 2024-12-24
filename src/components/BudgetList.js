import React, { useState } from 'react';
import { FileText, Trash2, Calendar, Clock, DollarSign, Paperclip, Camera, Loader2 } from 'lucide-react';
import { generateUniqueColor } from '../utils/colorGenerator';
import { withMinimumDelay } from '../utils/withDelay';

export const BudgetList = ({ budgets, onSelect, onDelete }) => {
    const [deletingBudgetId, setDeletingBudgetId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [openingBudgetId, setOpeningBudgetId] = useState(null);

    const handleDelete = async (e, budgetId) => {
        e.stopPropagation();
        setConfirmingDeleteId(budgetId);
        await withMinimumDelay(async () => {});
        setConfirmingDeleteId(null);
        setDeletingBudgetId(budgetId);
    };

    const confirmDelete = async () => {
        if (deletingBudgetId) {
            setIsDeleting(true);
            try {
                await withMinimumDelay(async () => {
                    await onDelete(deletingBudgetId);
                });
            } catch (error) {
                console.error('Error deleting budget:', error);
            } finally {
                setIsDeleting(false);
                setDeletingBudgetId(null);
            }
        }
    };

    const handleOpenBudget = async (budget) => {
        if (openingBudgetId) return;

        setOpeningBudgetId(budget.id);
        try {
            await withMinimumDelay(async () => {
                await onSelect(budget);
            });
        } catch (error) {
            console.error('Error opening budget:', error);
        } finally {
            setOpeningBudgetId(null);
        }
    };

    return (
        <div className="space-y-4">
            {budgets
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((budget, index) => {
                    const totalSpent = budget.items
                        .filter(item => item.isCommitted)
                        .reduce((sum, item) => sum + item.amount, 0);
                    const remaining = budget.totalBudget - totalSpent;
                    const spentPercentage = (totalSpent / budget.totalBudget) * 100;
                    const progressColor = generateUniqueColor(index);

                    return (
                        <div key={budget.id}
                             className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
                             onClick={() => handleOpenBudget(budget)}>
                            {/* Title and Action Icons Row */}
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">{budget.name}</h3>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!openingBudgetId) handleOpenBudget(budget);
                                        }}
                                        disabled={openingBudgetId === budget.id || confirmingDeleteId === budget.id}
                                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="View details"
                                    >
                                        {openingBudgetId === budget.id ? (
                                            <Loader2 className="h-7 w-7 animate-spin"/>
                                        ) : (
                                            <FileText className="h-7 w-7"/>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => !confirmingDeleteId && handleDelete(e, budget.id)}
                                        disabled={confirmingDeleteId === budget.id || openingBudgetId === budget.id}
                                        className="text-red-600 hover:text-red-800 transition-colors duration-200
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete budget"
                                    >
                                        {confirmingDeleteId === budget.id ? (
                                            <Loader2 className="h-7 w-7 animate-spin"/>
                                        ) : (
                                            <Trash2 className="h-7 w-7"/>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Grid Layout with Aligned Rows */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                {/* Last Updated Row */}
                                <div className="flex items-center">
                                    <Calendar className="h-7 w-7 mr-2 text-gray-400"/>
                                    <div>
                                        <div className="text-sm text-gray-500">Last updated:</div>
                                        <div className="text-sm text-gray-900">
                                            {new Date(budget.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-7 w-7 mr-2 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Type:</div>
                                        <div className="text-sm text-gray-900">{budget.type}</div>
                                    </div>
                                </div>

                                {/* Budget Amount Row */}
                                <div className="flex items-center">
                                    <DollarSign className="h-7 w-7 mr-2 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Total Budget:</div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            ${budget.totalBudget.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="h-7 w-7 mr-2 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Total Spent:</div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            ${totalSpent.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Remaining Amount Row */}
                                <div className="flex items-center">
                                    <DollarSign className="h-7 w-7 mr-2 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Remaining:</div>
                                        <div className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${remaining.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        title="Add attachment"
                                    >
                                        <Paperclip className="h-7 w-7" />
                                    </button>
                                    <button
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        title="Add photo"
                                    >
                                        <Camera className="h-7 w-7" />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.min(spentPercentage, 100)}%`,
                                            backgroundColor: progressColor
                                        }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {spentPercentage.toFixed(1)}% of budget used
                                </p>
                            </div>
                        </div>
                    );
                })}

            {/* Delete Confirmation Modal */}
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
                                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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