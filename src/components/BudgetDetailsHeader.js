
// First let's define the BudgetHeader component within PaycheckBudgetDetails.js
import {Loader2, PlusCircle, Printer, Share2, X} from "lucide-react";
import React from "react";

const BudgetDetailsHeader = ({
                                  budget,
                                  totalSpent,
                                  remainingAmount,
                                  onPrint,
                                  onShare,
                                  onClose,
                                  isPrinting,
                                  isSharing,
                                  isClosing,
                                  isSaving,
                                  handleAddItemClick,
                                  isAddingItem,
                                  showPrintShare = false
                              }) => {
    return (
        <div className="p-4 border-b border-black">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">{budget.name}</h2>
                <div className="flex space-x-1.5">
                    <div className={`${showPrintShare ? 'visible' : 'invisible'}`}>
                        <button
                            onClick={onPrint}
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
                    </div>
                    <div className={`${showPrintShare ? 'visible' : 'invisible'}`}>
                        <button
                            onClick={onShare}
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
                    </div>
                    <button
                        onClick={onClose}
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

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Paycheck</p>
                    <p className="text-2xl font-bold text-gray-900">
                        ${budget.amount.toLocaleString()}
                    </p>
                </div>
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                        ${totalSpent.toLocaleString()}
                    </p>
                </div>
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Remaining</p>
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
                        <Loader2 className="h-6 w-6 mr-2 animate-spin stroke-[1.5]"/>
                    ) : (
                        <PlusCircle className="h-6 w-6 mr-2 stroke-[1.5]"/>
                    )}
                    Record Expense!
                </button>
            </div>
        </div>
    );
};

export default BudgetDetailsHeader;