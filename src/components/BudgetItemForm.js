import React, { useState, useEffect } from 'react';
import { X, Loader2, PlusCircle } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';
import { withMinimumDelay } from '../utils/withDelay';
import { indexdbService } from '../services/IndexDBService';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import AddCategoryModal from './AddCategoryModal';

export const BudgetItemForm = ({
                                   onSave,
                                   onClose,
                                   initialItem = null,
                                   isSaving = false,
                                   budgetType = 'paycheck' // 'paycheck' or 'business'
                               }) => {
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
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);

    // Determine styling based on budget type
    const accentColor = budgetType === 'business' ? 'emerald' : 'blue';
    const formTitle = budgetType === 'business'
        ? (initialItem ? 'Edit Business Expense' : 'Add Business Expense')
        : (initialItem ? 'Edit Expense Item' : 'Add Expense Item');
    const descriptionPlaceholder = budgetType === 'business'
        ? 'e.g., Hotel - San Francisco trip'
        : 'e.g., Electric bill - August';

    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Use dynamic method with budgetType
                const loadedCategories = await indexdbService.getCategories(budgetType);
                setCategories(loadedCategories);
            } catch (error) {
                console.error(`Error loading ${budgetType} categories:`, error);
                setError(`Failed to load categories: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, [budgetType]);
    const handleCancel = async () => {
        setIsCancelling(true);
        await withMinimumDelay(async () => {});
        setShow(false);
        await withMinimumDelay(async () => {});
        setIsCancelling(false);
        onClose();
    };

    const handleAddCategoryClick = async () => {
        setIsAddingCategory(true);
        try {
            await withMinimumDelay(async () => {}, 800);
            setShowAddCategory(true);
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleSave = async (itemData) => {
        try {
            await onSave(itemData); // Call the parent's onSave function
            setShow(false); // Trigger exit animation
            await withMinimumDelay(async () => {});
            onClose();
        } catch (error) {
            console.error(`Error saving ${budgetType} expense item:`, error);
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
                                    <Loader2 className={`h-8 w-8 animate-spin text-${accentColor}-500`} />
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
                                        {formTitle}
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
                                                onClick={handleAddCategoryClick}
                                                disabled={isAddingCategory}
                                                className="p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200
                                            hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Add new category"
                                            >
                                                {isAddingCategory ? (
                                                    <Loader2 className="h-6 w-6 animate-spin stroke-[1.5]"/>
                                                ) : (
                                                    <PlusCircle className="h-6 w-6 stroke-[1.5]"/>
                                                )}
                                            </button>
                                        </div>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                        shadow-sm focus:border-${accentColor}-500 focus:ring-4 focus:ring-${accentColor}-200
                                        focus:ring-opacity-50 transition-colors duration-200`}
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
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                        shadow-sm focus:border-${accentColor}-500 focus:ring-4 focus:ring-${accentColor}-200
                                        focus:ring-opacity-50 transition-colors duration-200`}
                                            disabled={isSaving}
                                            placeholder={descriptionPlaceholder}
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
                                            className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                        shadow-sm focus:border-${accentColor}-500 focus:ring-4 focus:ring-${accentColor}-200
                                        focus:ring-opacity-50 transition-colors duration-200`}
                                            required
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount
                                        </label>
                                        <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            $
                                        </span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className={`block w-full rounded-lg border-2 border-gray-300 pl-8 pr-4 py-3
                                            shadow-sm focus:border-${accentColor}-500 focus:ring-4 focus:ring-${accentColor}-200
                                            focus:ring-opacity-50 transition-colors duration-200`}
                                                placeholder="0.00"
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
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
                                            className={`inline-flex items-center px-4 py-2 border-2 border-transparent
                                        rounded-lg shadow-sm text-sm font-medium text-white
                                        bg-${accentColor}-${budgetType === 'business' ? '800' : '600'} hover:bg-${accentColor}-${budgetType === 'business' ? '900' : '700'}
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${accentColor}-500
                                        transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        min-w-[100px] justify-center`}
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
                        setShowAddCategory(false);
                        setCategory(newCategory.name);
                    }}
                    budgetType={budgetType}
                />
            )}
        </div>
    );
};

export default BudgetItemForm;