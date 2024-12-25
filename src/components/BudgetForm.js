import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { budgetTemplates } from '../data/budgetTemplates';
import { withMinimumDelay } from '../utils/withDelay';

export const BudgetForm = ({
                               onSave,
                               onClose,
                               budgetType,
                               isNewBudget = false,
                               initialItem = null,
                               isSaving = false
                           }) => {
    const [name, setName] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [category, setCategory] = useState(initialItem?.category || '');
    const [description, setDescription] = useState(initialItem?.description || '');
    const [amount, setAmount] = useState(initialItem?.amount?.toString() || '');
    const [date, setDate] = useState(initialItem?.date || new Date().toISOString().split('T')[0]);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);


    const categories = budgetTemplates[budgetType]?.categories || [];

    useEffect(() => {
        if (initialItem) {
            setCategory(initialItem.category);
            setDescription(initialItem.description);
            setAmount(initialItem.amount.toString());
            setDate(initialItem.date);
        }
    }, [initialItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsAdding(true); // Set loading state

        try {
            await withMinimumDelay(async () => {
                if (isNewBudget) {
                    await onSave({
                        name,
                        type: budgetType,
                        totalBudget: Number(totalBudget),
                        items: [],
                    });
                } else {
                    await onSave({
                        items: [
                            {
                                id: initialItem?.id || crypto.randomUUID(),
                                category,
                                description,
                                amount: Number(amount),
                                date,
                                isCommitted: true,
                            },
                        ],
                    });
                }
            }, 2000); // Add a 2-second delay
        } catch (error) {
            console.error('Error saving:', error);
            setError('Failed to save. Please try again.');
        } finally {
            setIsAdding(false); // Reset loading state
        }
    };

    const handleCancel = async () => {
        setIsCancelling(true);
        await withMinimumDelay(async () => {
            onClose();
        });
        setIsCancelling(false);
    };

    if (isNewBudget) {
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Budget Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        disabled={isSaving}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Total Budget Amount</label>
                    <input
                        type="number"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        disabled={isSaving}
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isCancelling || isSaving}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700
                            border border-gray-300 rounded-md hover:bg-gray-200
                            focus:outline-none focus:ring-2 focus:ring-gray-500
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                Cancelling...
                            </>
                        ) : (
                            'Cancel'
                        )}
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent
                            rounded-md shadow-sm text-sm font-medium text-white
                            bg-indigo-600 hover:bg-indigo-700
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                Saving...
                            </>
                        ) : (
                            'Save Budget'
                        )}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <form
                onSubmit={handleSubmit}
                className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white sm:px-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialItem ? 'Edit Budget Item' : 'Add Budget Item'}
                    </h2>
                    <button
                        onClick={handleCancel}
                        disabled={isSaving || isCancelling}
                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                    >
                        {isCancelling ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            <X className="h-6 w-6"/>
                        )}
                    </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                            disabled={isSaving}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSaving || isCancelling}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCancelling ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                            ) : (
                                'Cancel'
                            )}
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding || isSaving}
                            className="inline-flex items-center px-4 py-2 border border-transparent
                        rounded-md shadow-sm text-sm font-medium text-white
                        bg-indigo-600 hover:bg-indigo-700
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                    {initialItem ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                initialItem ? 'Update Item' : 'Add Item'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>

    );
};