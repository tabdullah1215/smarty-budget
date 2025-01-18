import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Share2, X, PlusCircle, Loader2 } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';
import { withMinimumDelay } from '../utils/withDelay';
import { PaycheckBudgetItemForm } from './PaycheckBudgetItemForm';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { useMessage } from '../contexts/MessageContext';

const PrintableContent = React.forwardRef(({ budget }, ref) => {
    return (
        <div ref={ref} className="print-content">
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">{budget.name}</h2>
                <div className="mb-4">
                    <p>Date: {new Date(budget.date).toLocaleDateString()}</p>
                    <p>Net Amount: ${budget.amount.toLocaleString()}</p>
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
                    {budget.items?.map(item => (
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
        </div>
    );
});

PrintableContent.displayName = 'PrintableContent';

export const PaycheckBudgetDetails = ({ budget, onClose, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const componentRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [show, setShow] = useState(true); // Control modal visibility
    const { showMessage } = useMessage();

    // Replace with the imported transitions
    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${budget.name} - Paycheck Budget Details`,
        onBeforePrint: async () => {
            setIsPrinting(true);
            await withMinimumDelay(async () => {}, 2000);
        },
        onAfterPrint: async () => {
            await new Promise((resolve) => {
                setIsPrinting(false);
                resolve();
            });
        },
    });

    const handleSaveItem = async (itemData) => {
        setIsSaving(true);
        try {
            const newItem = {
                id: crypto.randomUUID(),
                ...itemData,
                createdAt: new Date().toISOString()
            };

            const updatedBudget = {
                ...budget,
                items: [...(budget.items || []), newItem]
            };

            await onUpdate(updatedBudget);
            showMessage('success', 'Item saved successfully');
            setShowForm(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error saving item:', error);
            showMessage('error', 'Failed to save item. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrintClick = (e) => {
        e.preventDefault();
        if (componentRef.current && !isPrinting) {
            handlePrint();
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            await withMinimumDelay(async () => {}, 2000);
            const shareData = {
                title: budget.name,
                text: `Paycheck Budget: ${budget.name}\nAmount: $${budget.amount}\nDate: ${new Date(budget.date).toLocaleDateString()}`,
                url: window.location.href,
            };
            await navigator.share(shareData);
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleAddItemClick = async () => {
        setIsAddingItem(true);
        await withMinimumDelay(async () => {});
        setIsAddingItem(false);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    const handleClose = async () => {
        setIsClosing(true);

        await withMinimumDelay(async () => {});
        setShow(false); // Trigger exit animation
        await withMinimumDelay(async () => {});
        setIsClosing(false);
        onClose();
    };

    const totalSpent = budget.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const remainingAmount = budget.amount - totalSpent;

    return (
        <>
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
                        />
                    )
            )}
            {transitions((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 z-50 flex items-center justify-center"
                        >
                            <div className="w-[95%] max-w-4xl bg-white rounded-lg shadow-xl max-h-[80vh] flex flex-col">
                                {/* Fixed Header Section */}
                                <div className="p-5 border-b">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">{budget.name}</h2>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handlePrintClick}
                                                disabled={isPrinting || isSaving}
                                                className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Print budget"
                                            >
                                                {isPrinting ? (
                                                    <Loader2 className="h-7 w-7 animate-spin"/>
                                                ) : (
                                                    <Printer className="h-7 w-7"/>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                disabled={isSharing || isSaving}
                                                className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Share budget"
                                            >
                                                {isSharing ? (
                                                    <Loader2 className="h-7 w-7 animate-spin"/>
                                                ) : (
                                                    <Share2 className="h-7 w-7"/>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleClose}
                                                disabled={isClosing || isSaving}
                                                className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Close budget"
                                            >
                                                {isClosing ? (
                                                    <Loader2 className="h-7 w-7 animate-spin"/>
                                                ) : (
                                                    <X className="h-7 w-7"/>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Total Paycheck</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ${budget.amount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Remaining Amount</p>
                                            <p className={`text-2xl font-bold ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${remainingAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">Expense Items</h3>
                                        <button
                                            onClick={handleAddItemClick}
                                            disabled={isAddingItem || isSaving}
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
                                </div>

                                {/* Scrollable Content Section */}
                                <div className="flex-1 overflow-hidden px-5">
                                    <div className="overflow-y-auto overflow-x-auto h-full max-h-[calc(90vh-280px)]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {budget.items?.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                        No expense items recorded yet
                                                    </td>
                                                </tr>
                                            )}
                                            {budget.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">${item.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        {/* Action buttons will be added later */}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Fixed Footer Section */}
                                <div className="p-5 border-t">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleClose}
                                            disabled={isClosing || isSaving}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isClosing ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                            ) : null}
                                            Close Budget
                                        </button>
                                    </div>
                                </div>

                                {showForm && (
                                    <PaycheckBudgetItemForm
                                        onSave={async (itemData) => {
                                            setIsSaving(true);
                                            try {
                                                await withMinimumDelay(async () => {
                                                    await handleSaveItem(itemData);
                                                });
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                        onClose={handleFormClose}
                                        initialItem={editingItem}
                                        isSaving={isSaving}
                                    />
                                )}

                                <div style={{position: 'fixed', top: '-9999px', left: '-9999px'}}>
                                    <PrintableContent
                                        ref={componentRef}
                                        budget={budget}
                                    />
                                </div>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};

export default PaycheckBudgetDetails;