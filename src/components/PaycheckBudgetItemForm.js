import React, { useState, useEffect } from 'react';
import { X, Loader2, PlusCircle } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web'; // No need to import `config` anymore
import { withMinimumDelay } from '../utils/withDelay';
import { indexdbService } from '../services/IndexDBService';
// Add this import
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import AddCategoryModal from './AddCategoryModal';

export const PaycheckBudgetItemForm = ({onSave, onClose, initialItem = null, isSaving = false}) => {
    const [category, setCategory] = useState(initialItem?.category || '');
    const [description, setDescription] = useState(initialItem?.description || '');
    const [date, setDate] = useState(initialItem?.date || new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(initialItem?.amount?.toString() || '');
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [show, setShow] = useState(true);
    const [showAddCategory, setShowAddCategory] = useState(false);

    // Replace with the imported transitions
    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const loadedCategories = await indexdbService.getPaycheckCategories();
                setCategories(loadedCategories);
            } catch (error) {
                console.error('Error loading categories:', error);
                setError('Failed to load categories: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, []);

    const handleCancel = async () => {
        setIsCancelling(true);

        await withMinimumDelay(async () => {});
        setShow(false);
        await withMinimumDelay(async () => {});
        setIsCancelling(false);
        onClose();

    };

    const handleSave = async (itemData) => {
        try {
            await onSave(itemData); // Call the parent's onSave function
            // await withMinimumDelay(async () => {});
            setShow(false); // Trigger exit animation
            await withMinimumDelay(async () => {});
            onClose();
        } catch (error) {
            console.error('Error saving item:', error);
            setError('Failed to save item');
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50">
                {backdropTransition((style, item) =>
                        item && (
                            <animated.div
                                style={style}
                                className="fixed inset-0 bg-gray-600 bg-opacity-50"
                            />
                        )
                )}
                {transitions((style, item) =>
                        item && (
                            <animated.div
                                style={style}
                                className="fixed inset-0 flex items-center justify-center"
                            >
                                <div className="bg-white p-8 rounded-lg shadow-xl flex items-center space-x-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-lg text-gray-700">Loading categories...</p>
                                </div>
                            </animated.div>
                        )
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50">
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-gray-600 bg-opacity-50"
                        />
                    )
            )}
            {transitions((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 flex items-center justify-center"
                        >
                            <div className="relative w-[95%] max-w-xl p-8 bg-white rounded-lg shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        {initialItem ? 'Edit Expense Item' : 'Add Expense Item'}
                                    </h2>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCancelling || isSaving}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        {isCancelling ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <X className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>

                                <form className="space-y-6" onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        const itemData = {
                                            category,
                                            description,
                                            date,
                                            amount: parseFloat(amount)
                                        };
                                        await handleSave(itemData);
                                    } catch (error) {
                                        console.error('Error saving item:', error);
                                        setError('Failed to save item');
                                    }
                                }}>
                                    {/* Form fields */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Category
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddCategory(true)}
                                                className="p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200
                hover:bg-gray-100 rounded-full"
                                                title="Add new category"
                                            >
                                                <PlusCircle className="h-6 w-6 stroke-[1.5]"/>
                                            </button>
                                        </div>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3
            shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200
            focus:ring-opacity-50 transition-colors duration-200"
                                            required
                                            disabled={isSaving}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description/Reference (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                        shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200
                                        focus:ring-opacity-50 transition-colors duration-200"
                                            disabled={isSaving}
                                            placeholder="e.g., Electric bill - August"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                        shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200
                                        focus:ring-opacity-50 transition-colors duration-200"
                                            required
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount
                                        </label>
                                        <div className="relative">
                                        <span
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            $
                                        </span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="block w-full rounded-lg border-2 border-gray-300 pl-8 pr-4 py-3
                                            shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200
                                            focus:ring-opacity-50 transition-colors duration-200"
                                                placeholder="0.00"
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div
                                            className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={isCancelling || isSaving}
                                            className="inline-flex items-center px-4 py-2 bg-white text-gray-700
                                        border-2 border-gray-300 rounded-lg hover:bg-gray-50
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                                        transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        min-w-[100px] justify-center shadow-sm"
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
                                            className="inline-flex items-center px-4 py-2 border-2 border-transparent
                                        rounded-lg shadow-sm text-sm font-medium text-white
                                        bg-blue-600 hover:bg-blue-700
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                        transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        min-w-[100px] justify-center"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                                    {initialItem ? 'Updating...' : 'Adding...'}
                                                </>
                                            ) : (
                                                initialItem ? 'Update Item' : 'Add Item'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </animated.div>
                    )
            )}
            {showAddCategory && (
                <AddCategoryModal
                    onClose={() => setShowAddCategory(false)}
                    onCategoryAdded={(newCategory) => {
                        setCategories(prev => [...prev, newCategory].sort((a, b) =>
                            a.name.localeCompare(b.name)
                        ));
                    }}
                />
            )}
        </div>
    );
};

export default PaycheckBudgetItemForm;