import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Loader2 } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';
import { withMinimumDelay } from '../utils/withDelay';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { useToast } from '../contexts/ToastContext';
import { BudgetItemForm } from './BudgetItemForm';
import BudgetDetailsHeader from './BudgetDetailsHeader';
import BudgetItemRow from './BudgetItemRow';
import BudgetTableHeader from './BudgetTableHeader';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { compressImage, formatFileSize } from '../utils/imageCompression';
import { ImageViewer } from './ImageViewer';
import { getStorageEstimate, formatStorageMessage } from '../utils/storageEstimation';
import { disableScroll, enableScroll } from '../utils/scrollLock';

const PrintableContent = React.forwardRef(({budget}, ref) => {
    return (
        <div ref={ref} className="print-content">
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">{budget.name}</h2>
                <div className="mb-4">
                    <p>Date: {new Date(budget.date).toLocaleDateString()}</p>
                    <p>Budget Limit: ${budget.amount.toLocaleString()}</p>
                    <p>Created: {new Date(budget.createdAt).toLocaleDateString()}</p>
                </div>
                <table className="w-full divide-y divide-gray-200" style={{tableLayout: 'fixed'}}>
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

export const CustomBudgetDetails = ({ budget, onClose, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const componentRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [show, setShow] = useState(true);
    const { showToast } = useToast();
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageType, setSelectedImageType] = useState(null);

    const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [deletingButtonId, setDeletingButtonId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [uploadingImageItemId, setUploadingImageItemId] = useState(null);

    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);
    const fileInputRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${budget.name} - Custom Budget Details`,
        onBeforePrint: async () => {
            setIsPrinting(true);
            await withMinimumDelay(async () => {}, 2000);
        },
        onAfterPrint: async () => {
            await new Promise((resolve) => {
                setIsPrinting(false);
                showToast('success', 'Budget printed successfully');
                resolve();
            });
        },
        onPrintError: (error) => {
            console.error('Print error:', error);
            showToast('error', 'Failed to print budget. Please try again.');
            setIsPrinting(false);
        }
    });

    const { totalSpent, remainingAmount } = useMemo(() => {
        // Only count active items in total spent
        const total = budget.items?.reduce((sum, item) =>
            sum + (item.isActive ? (item.amount || 0) : 0), 0) || 0;
        const remaining = budget.amount - total;

        return {
            totalSpent: total,
            remainingAmount: remaining
        };
    }, [budget.items, budget.amount]);

    useEffect(() => {
        disableScroll();

        return () => {
            enableScroll();
        };
    }, []);

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
                text: `Custom Budget: ${budget.name}\nAmount: $${budget.amount}\nDate: ${new Date(budget.date).toLocaleDateString()}`,
                url: window.location.href,
            };
            await navigator.share(shareData);
            showToast('success', 'Budget shared successfully');
        } catch (error) {
            console.error('Error sharing:', error);
            if (error.name === 'AbortError') return;
            showToast('error', 'Failed to share budget. Please try again.');
        } finally {
            setIsSharing(false);
        }
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

    const handleClose = async () => {
        setIsClosing(true);
        await withMinimumDelay(async () => {});
        setShow(false);
        await withMinimumDelay(async () => {});
        setIsClosing(false);
        onClose();
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
                ? 'Expense item updated successfully'
                : 'New expense item added successfully'
            );
            return true;
        } catch (error) {
            console.error('Error saving item:', error);
            showToast('error', `Failed to ${editingItem ? 'update' : 'add'} expense item. Please try again.`);
        } finally {
            setIsSaving(false);
        }
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

    const handleImageUpload = async (itemId) => {
        setUploadingImageItemId(itemId);
        try {
            await withMinimumDelay(async () => {
                if (fileInputRef.current) {
                    fileInputRef.current.dataset.itemId = itemId;
                    fileInputRef.current.click();
                }
            }, 800);
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('error', 'Failed to upload image: ' + (error.message || 'Unknown error'));
        } finally {
            // Don't clear uploadingImageItemId here - it will be done in handleFileInputChange
        }
    };

    const handleRemoveImage = async (itemId) => {
        setUploadingImageItemId(itemId);
        try {
            await withMinimumDelay(async () => {
                const updatedItems = budget.items.map(item =>
                    item.id === itemId ? {...item, image: null, fileType: null} : item
                );
                const updatedBudget = {...budget, items: updatedItems};
                await onUpdate(updatedBudget);
                showToast('success', 'Attachment removed successfully');
            });
        } catch (error) {
            showToast('error', 'Failed to remove attachment');
        } finally {
            setUploadingImageItemId(null);
        }
    };

    const handleFileInputChange = async (e) => {
        const file = e.target.files?.[0];
        const itemId = e.target.dataset.itemId;

        if (!file || !itemId) {
            setUploadingImageItemId(null);
            return;
        }

        try {
            // Compress the image
            const compressResult = await compressImage(file);

            // Get storage estimate
            const storageEstimate = await getStorageEstimate();
            const storageMessage = formatStorageMessage(storageEstimate);

            // Show compression statistics in a toast with storage info
            showToast(
                'success',
                `Image compressed: ${formatFileSize(compressResult.originalSize)} → 
       ${formatFileSize(compressResult.compressedSize)} 
       (${compressResult.compressionRatio}% reduction)
       ${storageMessage ? `\n${storageMessage}` : ''}`
            );

            // Update the budget item with compressed image
            const updatedItems = budget.items.map(item =>
                item.id === itemId ? {
                    ...item,
                    image: compressResult.data,
                    fileType: compressResult.fileType
                } : item
            );

            const updatedBudget = {...budget, items: updatedItems};
            await onUpdate(updatedBudget);

        } catch (compressionError) {
            console.error('Error compressing image:', compressionError);
            showToast('error', 'Could not compress image. Using original instead.');
        } finally {
            // Reset the file input value so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                                <BudgetDetailsHeader
                                    budget={budget}
                                    totalSpent={totalSpent}
                                    remainingAmount={remainingAmount}
                                    hasBudgetLimit={true}
                                    budgetType="custom"
                                    onPrint={handlePrintClick}
                                    onShare={handleShare}
                                    onClose={handleClose}
                                    isPrinting={isPrinting}
                                    isSharing={isSharing}
                                    isClosing={isClosing}
                                    isSaving={isSaving}
                                    handleAddItemClick={handleAddItemClick}
                                    isAddingItem={isAddingItem}
                                    showPrintShare={false}
                                />
                                <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-5">
                                    <div className="relative w-full min-h-0 max-h-[calc(80vh-250px)]">
                                        <div className="w-full overflow-x-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <BudgetTableHeader
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
                                                    <BudgetItemRow
                                                        key={item.id}
                                                        item={item}
                                                        onEdit={handleEditItem}
                                                        onDelete={handleDeleteItem}
                                                        onImageUpload={handleImageUpload}
                                                        onRemoveImage={handleRemoveImage}
                                                        onToggleActive={handleToggleActive}
                                                        onImageClick={(item) => {
                                                            setSelectedImage(item.image);
                                                            setSelectedImageType(item.fileType || 'image/png');
                                                        }}
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
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isClosing ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                            ) : null}
                                            Close Budget
                                        </button>
                                    </div>
                                </div>

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
            {showForm && (
                <BudgetItemForm
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
                    budgetType="custom"
                    budgetCategory={budget.budgetCategory} // Pass the budgetCategory
                />
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteItemModal && !!deletingItemId}
                onClose={handleCancelItemDelete}
                onConfirm={confirmItemDelete}
                title="Delete Expense Item"
                message="Are you sure you want to delete this expense item? This action cannot be undone."
            />

            {selectedImage && (
                <ImageViewer
                    imageData={selectedImage}
                    fileType={selectedImageType}
                    onClose={() => {
                        setSelectedImage(null);
                        setSelectedImageType(null);
                    }}
                />
            )}

            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{display: 'none'}}
                onChange={handleFileInputChange}
            />
        </>
    );
};

export default CustomBudgetDetails;