import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Share2, X, PlusCircle, Loader2 } from 'lucide-react';
import { BudgetForm } from './BudgetForm';
import { BudgetItemRow } from './BudgetItemRow';

const PrintableContent = React.forwardRef((props, ref) => {
    const { budget } = props;
    return (
        <div ref={ref} className="p-8">
            <h2 className="text-2xl font-bold mb-4">{budget.name}</h2>
            <div className="mb-4">
                <p>Type: {budget.type}</p>
                <p>Total Budget: ${budget.totalBudget.toLocaleString()}</p>
                <p>Created: {new Date(budget.createdAt).toLocaleDateString()}</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {budget.items.map(item => (
                    <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">${item.amount.toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
});

PrintableContent.displayName = 'PrintableContent';

export const BudgetDetails = ({ budget, onClose, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [localBudget, setLocalBudget] = useState(budget);
    const printRef = useRef(null);

    // Update local budget when prop changes
    useEffect(() => {
        setLocalBudget(budget);
    }, [budget]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const handleShare = async () => {
        try {
            const shareData = {
                title: localBudget.name,
                text: `Budget: ${localBudget.name}\nTotal: $${localBudget.totalBudget}\nType: ${localBudget.type}`,
                url: window.location.href,
            };
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleAddItemClick = async () => {
        setIsAddingItem(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsAddingItem(false);
        setShowForm(true);
    };

    const handleClose = async () => {
        setIsClosing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsClosing(false);
        onClose();
    };

    const handleSaveItem = (updates) => {
        if (updates.items && updates.items.length > 0) {
            const updatedItems = editingItem
                ? localBudget.items.map(item =>
                    item.id === editingItem.id ? { ...item, ...updates.items[0] } : item
                )
                : [...localBudget.items, updates.items[0]];

            const updatedBudget = {
                ...localBudget,
                items: updatedItems,
            };

            // Update local state immediately
            setLocalBudget(updatedBudget);
            // Update parent state
            onUpdate(updatedBudget);
        }
        setShowForm(false);
        setEditingItem(null);
    };

    const handleRemoveItem = (itemId) => {
        const updatedBudget = {
            ...localBudget,
            items: localBudget.items.filter(item => item.id !== itemId),
        };
        setLocalBudget(updatedBudget);
        onUpdate(updatedBudget);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const totalSpent = localBudget.items
        .filter(item => item.isCommitted)
        .reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{localBudget.name}</h2>
                    {/* Rest of your JSX using localBudget instead of budget */}
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            title="Print budget"
                        >
                            <Printer className="h-5 w-5"/>
                        </button>
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            title="Share budget"
                        >
                            <Share2 className="h-5 w-5"/>
                        </button>
                        <button
                            onClick={handleClose}
                            disabled={isClosing}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            title="Close budget"
                        >
                            {isClosing ? (
                                <Loader2 className="h-5 w-5 animate-spin"/>
                            ) : (
                                <X className="h-5 w-5"/>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Budget</p>
                        <p className="text-2xl font-bold text-gray-900">${localBudget.totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Budget Items</h3>
                    <button
                        onClick={handleAddItemClick}
                        disabled={isAddingItem}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAddingItem ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                        ) : (
                            <PlusCircle className="h-4 w-4 mr-2"/>
                        )}
                        Record Expense
                    </button>
                </div>

                <div className="mt-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {localBudget.items.map(item => (
                                <BudgetItemRow
                                    key={item.id}
                                    item={item}
                                    budgetType={localBudget.type}
                                    isCommitted={!!item.isCommitted}
                                    onUpdate={(updates) => {
                                        const updatedItems = localBudget.items.map(i =>
                                            i.id === item.id ? {...i, ...updates} : i
                                        );
                                        const updatedBudget = {...localBudget, items: updatedItems};
                                        setLocalBudget(updatedBudget);
                                        onUpdate(updatedBudget);
                                    }}
                                    onRemove={() => handleRemoveItem(item.id)}
                                    onCommit={() => {
                                        const updatedItems = localBudget.items.map(i =>
                                            i.id === item.id ? {...i, isCommitted: true} : i
                                        );
                                        const updatedBudget = {...localBudget, items: updatedItems};
                                        setLocalBudget(updatedBudget);
                                        onUpdate(updatedBudget);
                                    }}
                                    onEdit={() => handleEditItem(item)}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showForm && (
                    <BudgetForm
                        onSave={handleSaveItem}
                        onClose={() => {
                            setShowForm(false);
                            setEditingItem(null);
                        }}
                        budgetType={localBudget.type}
                        initialItem={editingItem}
                    />
                )}

                <div className="hidden">
                    <PrintableContent ref={printRef} budget={localBudget}/>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleClose}
                        disabled={isClosing}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isClosing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                        ) : null}
                        Close Budget
                    </button>
                </div>
            </div>
        </div>
    );
};