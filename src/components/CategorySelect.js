// CategorySelect.js
import React, { useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import AddCategoryModal from './AddCategoryModal';

export const CategorySelect = ({
                                   value,
                                   onChange,
                                   disabled,
                                   categories,
                                   onNewCategory
                               }) => {
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);

    const handleAddClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAddingCategory(true);
        try {
            await withMinimumDelay(async () => {}, 800);
            setShowAddCategory(true);
        } finally {
            setIsAddingCategory(false);
        }
    };

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <button
                        type="button"
                        onClick={handleAddClick}
                        disabled={isAddingCategory}
                        className="p-1 text-gray-600 hover:text-gray-900
                                transition-colors duration-200
                                hover:bg-gray-100 rounded-full
                                disabled:opacity-50 disabled:cursor-not-allowed"
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
                    value={value}
                    onChange={onChange}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                        shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200
                        focus:ring-opacity-50 transition-colors duration-200"
                    required
                    disabled={disabled}
                >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {showAddCategory && (
                <AddCategoryModal
                    onClose={() => setShowAddCategory(false)}
                    onCategoryAdded={(newCategory) => {
                        setShowAddCategory(false);
                        onNewCategory(newCategory);
                    }}
                />
            )}
        </>
    );
};

export default CategorySelect;