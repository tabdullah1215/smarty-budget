//PaycheckBudgetDetails.js
import React, { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Share2, X, PlusCircle, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';
import { withMinimumDelay } from '../utils/withDelay';
import { PaycheckBudgetItemForm } from './PaycheckBudgetItemForm';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { useToast } from '../contexts/ToastContext';
import { Camera } from 'lucide-react';
import { ImageViewer } from './ImageViewer';

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
    const [show, setShow] = useState(true);
    const { showToast } = useToast();
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageType, setSelectedImageType] = useState(null);

    // Delete confirmation states
    const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [isItemDeleting, setIsItemDeleting] = useState(false);
    const [isItemCancelling, setIsItemCancelling] = useState(false);
    const [deletingButtonId, setDeletingButtonId] = useState(null);

// Transitions
    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);
    const deleteItemTransitions = useTransition(showDeleteItemModal, modalTransitions);
    const deleteItemBackdropTransition = useTransition(showDeleteItemModal, backdropTransitions);

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

    const { totalSpent, remainingAmount, categoryTotals, monthlyBreakdown } = useMemo(() => {
        const total = budget.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        const remaining = budget.amount - total;

        const byCategory = budget.items?.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + (item.amount || 0);
            return acc;
        }, {});

        const byMonth = budget.items?.reduce((acc, item) => {
            const date = new Date(item.date);
            const monthYear = date.toLocaleString('default', {
                month: 'long',
                year: 'numeric'
            });

            if (!acc[monthYear]) {
                acc[monthYear] = {
                    total: 0,
                    items: [],
                    month: date.getMonth(),
                    year: date.getFullYear()
                };
            }

            acc[monthYear].total += (item.amount || 0);
            acc[monthYear].items.push(item);

            return acc;
        }, {});

        const sortedByMonth = Object.entries(byMonth || {})
            .sort(([, a], [, b]) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            })
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        return {
            totalSpent: total,
            remainingAmount: remaining,
            categoryTotals: byCategory || {},
            monthlyBreakdown: sortedByMonth
        };
    }, [budget.items, budget.amount]);

    const budgetStats = useMemo(() => {
        const percentageUsed = (totalSpent / budget.amount) * 100;
        const isOverBudget = percentageUsed > 100;
        const percentageRemaining = 100 - percentageUsed;

        return {
            percentageUsed: Math.min(percentageUsed, 100),
            isOverBudget,
            percentageRemaining: Math.max(percentageRemaining, 0),
            status: isOverBudget ? 'over' : percentageUsed > 90 ? 'warning' : 'good'
        };
    }, [totalSpent, budget.amount]);

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

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleCancelItemDelete = async () => {
        setIsItemCancelling(true);
        await withMinimumDelay(async () => {});
        setShowDeleteItemModal(false);
        await withMinimumDelay(async () => {});
        setDeletingItemId(null);
        setIsItemCancelling(false);
    };

    const confirmItemDelete = async () => {
        if (deletingItemId) {
            setIsItemDeleting(true);
            try {
                await withMinimumDelay(async () => {
                    const updatedBudget = {
                        ...budget,
                        items: budget.items.filter(item => item.id !== deletingItemId)
                    };
                    await onUpdate(updatedBudget);
                    showToast('success', 'Expense item deleted successfully');
                    setShowDeleteItemModal(false);
                });
                await withMinimumDelay(async () => {});
                setDeletingItemId(null);
            } catch (error) {
                console.error('Error deleting item:', error);
                showToast('error', 'Failed to delete expense item. Please try again.');
            } finally {
                setIsItemDeleting(false);
            }
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

    const handleImageUpload = (itemId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Data = reader.result.split(',')[1];
                    const fileType = file.type;
                    const updatedItems = budget.items.map(item =>
                        item.id === itemId ? { ...item, image: base64Data, fileType: fileType } : item
                    );
                    const updatedBudget = { ...budget, items: updatedItems };
                    onUpdate(updatedBudget);
                    showToast('success', 'Image uploaded successfully');
                };
                reader.onerror = () => {
                    showToast('error', 'Failed to upload image. Please try again.');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
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
                                {/* Header Section */}
                                <div className="p-5 border-b border-black">
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

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto px-5">
                                    <div className="relative w-full min-h-0 max-h-[calc(80vh-250px)]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                            <tr>
                                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="hidden md:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="hidden md:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                <th className="md:hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense
                                                    Details
                                                </th>
                                                <th className="md:hidden px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-black">
                                            {budget.items?.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                        No expense items recorded yet
                                                    </td>
                                                </tr>
                                            )}
                                            {budget.items?.map(item => (
                                                <React.Fragment key={item.id}>
                                                    {/* Desktop Row */}
                                                    <tr className="hidden md:table-row">
                                                        <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">${item.amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col space-y-2">
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditItem(item)}
                                                                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                                        title="Edit item"
                                                                    >
                                                                        <Edit2 className="h-5 w-5"/>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteItem(item.id)}
                                                                        disabled={deletingButtonId === item.id}
                                                                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                                                        title="Delete item"
                                                                    >
                                                                        {deletingButtonId === item.id ? (
                                                                            <Loader2 className="h-5 w-5 animate-spin"/>
                                                                        ) : (
                                                                            <Trash2 className="h-5 w-5"/>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleImageUpload(item.id)}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                                                        title={item.image ? "Update image" : "Add image"}
                                                                    >
                                                                        <Camera className="h-5 w-5"/>
                                                                    </button>
                                                                </div>
                                                                {item.image && (
                                                                    <div className="flex justify-center">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedImage(item.image);
                                                                                setSelectedImageType(item.fileType || 'image/png');
                                                                            }}
                                                                            className="group relative"
                                                                            title="Click to enlarge"
                                                                        >
                                                                            <img
                                                                                src={`data:${item.fileType || 'image/png'};base64,${item.image}`}
                                                                                alt="Budget Item"
                                                                                className="w-16 h-16 object-cover rounded-md border-2 border-gray-300 transition-transform duration-200 group-hover:scale-105"
                                                                            />
                                                                            <div
                                                                                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-md transition-colors duration-200"/>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Mobile Row */}
                                                    <tr className="md:hidden">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-1">
                                                                <span
                                                                    className="font-medium text-gray-900">{item.category}</span>
                                                                <span
                                                                    className="text-gray-600">{item.description}</span>
                                                                <span
                                                                    className="text-gray-500 text-sm">{item.date}</span>
                                                                <span
                                                                    className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col items-end space-y-2">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditItem(item)}
                                                                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                                        title="Edit item"
                                                                    >
                                                                        <Edit2 className="h-5 w-5"/>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteItem(item.id)}
                                                                        disabled={deletingButtonId === item.id}
                                                                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                                                        title="Delete item"
                                                                    >
                                                                        {deletingButtonId === item.id ? (
                                                                            <Loader2 className="h-5 w-5 animate-spin"/>
                                                                        ) : (
                                                                            <Trash2 className="h-5 w-5"/>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleImageUpload(item.id)}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                                                        title={item.image ? "Update image" : "Add image"}
                                                                    >
                                                                        <Camera className="h-5 w-5"/>
                                                                    </button>
                                                                </div>
                                                                {item.image && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedImage(item.image);
                                                                            setSelectedImageType(item.fileType || 'image/png');
                                                                        }}
                                                                        className="group relative w-16 h-16"
                                                                        title="Click to enlarge"
                                                                    >
                                                                        <img
                                                                            src={`data:${item.fileType || 'image/png'};base64,${item.image}`}
                                                                            alt="Budget Item"
                                                                            className="w-16 h-16 object-cover rounded-md border-2 border-gray-300 transition-transform duration-200 group-hover:scale-105"
                                                                        />
                                                                        <div
                                                                            className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-md transition-colors duration-200"/>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Footer Section */}
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

                                {/* Modals */}
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

            {/* Delete Confirmation Modal */}
            {deleteItemTransitions((style, item) =>
                    item && deletingItemId && (
                        <>
                            {deleteItemBackdropTransition((backdropStyle, show) =>
                                    show && (
                                        <animated.div
                                            style={backdropStyle}
                                            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                                        />
                                    )
                            )}
                            <animated.div
                                style={style}
                                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                            >
                                <div className="relative mx-auto p-5 border w-[90%] max-w-lg shadow-lg rounded-md bg-white">
                                    <div className="mt-3 text-center">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Expense Item</h3>
                                        <div className="mt-2 px-7 py-3">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete this expense item? This action cannot be undone.
                                            </p>
                                        </div>
                                        <div className="flex justify-center space-x-4 mt-4">
                                            <button
                                                onClick={handleCancelItemDelete}
                                                disabled={isItemCancelling || isItemDeleting}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isItemCancelling ? (
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                ) : (
                                                    'Cancel'
                                                )}
                                            </button>
                                            <button
                                                onClick={confirmItemDelete}
                                                disabled={isItemDeleting}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isItemDeleting ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                                ) : null}
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </animated.div>
                        </>
                    )
            )}
        </>
    );
};

export default PaycheckBudgetDetails;