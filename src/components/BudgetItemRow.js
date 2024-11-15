import React, { useState } from 'react';
import { MinusCircle, Plus, Edit2, Loader2 } from 'lucide-react';
import { budgetTemplates } from '../data/budgetTemplates';

export const BudgetItemRow = ({ item, budgetType, isCommitted, onUpdate, onRemove, onCommit, onEdit }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);
    const categories = budgetTemplates[budgetType]?.categories || [];

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onRemove();
        setIsDeleting(false);
        setShowDeleteConfirm(false);
    };

    const handleEdit = async () => {
        setIsEditing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsEditing(false);
        onEdit();
    };

    const handleCommit = async () => {
        setIsCommitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onCommit();
        setIsCommitting(false);
    };

    return (
        <>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                    <select
                        value={item.category}
                        onChange={(e) => onUpdate({ category: e.target.value })}
                        disabled={isCommitted}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                            isCommitted ? 'bg-gray-50' : ''
                        }`}
                    >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <input
                        type="text"
                        value={item.description}
                        onChange={(e) => onUpdate({ description: e.target.value })}
                        disabled={isCommitted}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                            isCommitted ? 'bg-gray-50' : ''
                        }`}
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <input
                        type="date"
                        value={item.date || ''}
                        onChange={(e) => onUpdate({ date: e.target.value })}
                        disabled={isCommitted}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                            isCommitted ? 'bg-gray-50' : ''
                        }`}
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                        disabled={isCommitted}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-right ${
                            isCommitted ? 'bg-gray-50' : ''
                        }`}
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                        {!isCommitted ? (
                            <button
                                onClick={handleCommit}
                                disabled={!item.category || !item.description || !item.amount || !item.date || isCommitting}
                                className="inline-flex items-center p-2 border border-transparent rounded-md text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                title="Add to budget"
                            >
                                {isCommitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Plus className="h-5 w-5" />
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleEdit}
                                disabled={isEditing}
                                className="inline-flex items-center p-2 border border-transparent rounded-md text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                title="Edit item"
                            >
                                {isEditing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Edit2 className="h-5 w-5" />
                                )}
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                            title="Remove item"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <MinusCircle className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </td>
            </tr>

            {showDeleteConfirm && (
                <tr>
                    <td colSpan={5}>
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                                <div className="mt-3 text-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Item</h3>
                                    <div className="mt-2 px-7 py-3">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this budget item? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
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
                    </td>
                </tr>
            )}
        </>
    );
};