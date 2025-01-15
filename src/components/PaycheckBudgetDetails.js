import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Share2, X, PlusCircle, Loader2 } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';

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
    const [isClosing, setIsClosing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const componentRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${budget.name} - Paycheck Budget Details`,
        onBeforePrint: async () => {
            setIsPrinting(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
        },
        onAfterPrint: async () => {
            await new Promise((resolve) => {
                setIsPrinting(false);
                resolve();
            });
        },
    });

    const handlePrintClick = (e) => {
        e.preventDefault();
        if (componentRef.current && !isPrinting) {
            handlePrint();
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
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

    const handleClose = async () => {
        setIsClosing(true);
        await withMinimumDelay(async () => {});
        setIsClosing(false);
        onClose();
    };

    const totalSpent = budget.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const remainingAmount = budget.amount - totalSpent;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="mx-auto p-5 border w-[95%] max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{budget.name}</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePrintClick}
                            disabled={isPrinting || isSaving}
                            className="inline-flex items-center p-2 border border-transparent
                             rounded-md text-gray-600 hover:bg-gray-100
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                             transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="inline-flex items-center p-2 border border-transparent
                                 rounded-md text-gray-600 hover:bg-gray-100
                                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                                 transition-all duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="inline-flex items-center p-2 border border-transparent
                                 rounded-md text-gray-600 hover:bg-gray-100
                                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                                 transition-all duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Expense Items</h3>
                    <button
                        disabled={isSaving}
                        className="inline-flex items-center px-3 py-2 border border-transparent
                             text-sm leading-4 font-medium rounded-md text-white
                             bg-indigo-600 hover:bg-indigo-700
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                             transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusCircle className="h-4 w-4 mr-2"/>
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
                            {budget.items?.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No expense items recorded yet
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{position: 'fixed', top: '-9999px', left: '-9999px'}}>
                    <PrintableContent
                        ref={componentRef}
                        budget={budget}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleClose}
                        disabled={isClosing || isSaving}
                        className="inline-flex items-center px-4 py-2 border border-gray-300
                             shadow-sm text-sm font-medium rounded-md text-gray-700
                             bg-white hover:bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                             transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
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