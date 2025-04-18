import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Loader2, PlusCircle, Briefcase } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';
import { withMinimumDelay } from '../utils/withDelay';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { useToast } from '../contexts/ToastContext';
import { BusinessExpenseItemForm } from './BusinessExpenseItemForm';
import PaycheckBudgetDetailsHeader from './PaycheckBudgetDetailsHeader';
import PaycheckBudgetItemRow from './PaycheckBudgetItemRow';
import PaycheckBudgetTableHeader from './PaycheckBudgetTableHeader';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export const BusinessProjectDetails = ({ budget, onClose, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [show, setShow] = useState(true);
    const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [deletingButtonId, setDeletingButtonId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [uploadingImageItemId, setUploadingImageItemId] = useState(null);
    const componentRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const { showToast } = useToast();

    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);

    // Calculate total spent and remaining amount
    const totalSpent = budget.items?.reduce((sum, item) =>
        sum + (item.isActive ? (item.amount || 0) : 0), 0) || 0;
    const remainingAmount = budget.amount - totalSpent;

    const handleClose = async () => {
        setIsClosing(true);
        await withMinimumDelay(async () => {});
        setShow(false);
        await withMinimumDelay(async () => {});
        setIsClosing(false);
        onClose();
    };

    const handleAddItemClick = async () => {
        setIsAddingItem(true);
        try {
            await withMinimumDelay(async () => {});
            setEditingItem(null);
            setShowForm(true);
        } finally {
            setIsAddingItem(false);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    const handleEditItem = async (item) => {
        setEditingItemId(item.id);
        try {
            await withMinimumDelay(async () => {}, 800);
            setEditingItemId(null);
            setEditingItem(item);
            setShowForm(true);
        } catch (error) {
            setEditingItemId(null);
            console.error('Error initiating edit:', error);
        }
    };

    const handleSaveItem = async (itemData) => {
        setIsSaving(true);
        try {
            const updatedItems = editingItem
                ? budget.items.map(item =>
                    item.id === editingItem.id
                        ? {
                            ...item,
                            ...itemData,
                            updatedAt: new Date().toISOString()
                        }
                        : item
                )
                : [
                    ...budget.items,
                    {
                        id: crypto.randomUUID(),
                        ...itemData,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];

            const updatedBudget = {
                ...budget,
                items: updatedItems,
                updatedAt: new Date().toISOString()
            };

            await onUpdate(updatedBudget);
            showToast('success', editingItem
                ? 'Business expense updated successfully'
                : 'New business expense added successfully'
            );
            return true;
        } catch (error) {
            console.error('Error saving item:', error);
            showToast('error', `Failed to ${editingItem ? 'update' : 'add'} expense item. Please try again.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        setDeletingButtonId(itemId);
        try {
            await withMinimumDelay(async () => {});
            setDeletingButtonId(null);
            setDeletingItemId(itemId);
            setShowDeleteItemModal(true);
        } catch (error) {
            setDeletingButtonId(null);
            console.error('Error initiating delete:', error);
        }
    };

    const handleCancelItemDelete = () => {
        setShowDeleteItemModal(false);
        setDeletingItemId(null);
    };

    const confirmItemDelete = async () => {
        try {
            const updatedBudget = {
                ...budget,
                items: budget.items.filter(item => item.id !== deletingItemId)
            };
            await onUpdate(updatedBudget);
            showToast('success', 'Expense item deleted successfully');
            setShowDeleteItemModal(false);
            setDeletingItemId(null);
        } catch (error) {
            console.error('Error deleting item:', error);
            showToast('error', 'Failed to delete expense item. Please try again.');
        }
    };

    const handleToggleActive = async (itemId) => {
        try {
            const updatedItems = budget.items.map(item =>
                item.id === itemId ? {...item, isActive: !item.isActive} : item
            );
            const updatedBudget = {...budget, items: updatedItems};
            await onUpdate(updatedBudget);
            showToast('success', 'Item status updated successfully');
        } catch (error) {
            console.error('Error toggling item status:', error);
            showToast('error', 'Failed to update item status');
        }
    };

    const handleToggleAll = (shouldActivate) => {
        const updatedItems = budget.items.map(item => ({
            ...item,
            isActive: shouldActivate
        }));

        const updatedBudget = {...budget, items: updatedItems};
        onUpdate(updatedBudget);

        showToast(
            'success',
            shouldActivate
                ? 'All expense items included'
                : 'All expense items excluded'
        );
    };

    // Handle image upload, similar to PaycheckBudgetDetails
    const handleImageUpload = async (itemId) => {
        setUploadingImageItemId(itemId);
        try {
            // Simplified for now - implement full image handling later
            await withMinimumDelay(async () => {}, 800);
            showToast('info', 'Receipt upload functionality coming soon');
        } catch (error) {
            console.error('Error with image upload:', error);
        } finally {
            setUploadingImageItemId(null);
        }
    };

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
                                <PaycheckBudgetDetailsHeader
                                    budget={budget}
                                    totalSpent={totalSpent}
                                    remainingAmount={remainingAmount}
                                    onPrint={() => {}} // Implement print later
                                    onShare={() => {}} // Implement share later
                                    onClose={handleClose}
                                    isPrinting={isPrinting}
                                    isSharing={isSharing}
                                    isClosing={isClosing}
                                    isSaving={isSaving}
                                    handleAddItemClick={handleAddItemClick}
                                    isAddingItem={isAddingItem}
                                />
                                <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-5">
                                    <div className="relative w-full min-h-0 max-h-[calc(80vh-250px)]">
                                        <div className="w-full overflow-x-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <PaycheckBudgetTableHeader
                                                    items={budget.items}
                                                    onToggleAll={handleToggleAll}
                                                />
                                                <tbody className="bg-white divide-y divide-black">
                                                {budget.items?.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                            No expense items recorded yet
                                                        </td>
                                                    </tr>
                                                )}
                                                {budget.items?.map(item => (
                                                    <PaycheckBudgetItemRow
                                                        key={item.id}
                                                        item={item}
                                                        onEdit={handleEditItem}
                                                        onDelete={handleDeleteItem}
                                                        onImageUpload={handleImageUpload}
                                                        onRemoveImage={() => {}}
                                                        onToggleActive={handleToggleActive}
                                                        onImageClick={() => {}}
                                                        editingItemId={editingItemId}
                                                        deletingButtonId={deletingButtonId}
                                                        uploadingImageItemId={uploadingImageItemId}
                                                        isSaving={isSaving}
                                                    />
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 border-t">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleClose}
                                            disabled={isClosing || isSaving}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isClosing ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                            ) : null}
                                            Close Project
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </animated.div>
                    )
            )}
            {showForm && (
                <BusinessExpenseItemForm
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
            <DeleteConfirmationModal
                isOpen={showDeleteItemModal && !!deletingItemId}
                onClose={handleCancelItemDelete}
                onConfirm={confirmItemDelete}
                title="Delete Expense Item"
                message="Are you sure you want to delete this expense item? This action cannot be undone."
            />
        </>
    );
};

export default BusinessProjectDetails;