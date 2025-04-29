import {Loader2, PlusCircle, Printer, Share2, X} from "lucide-react";
import React from "react";

const BudgetDetailsHeader = ({
                                 budget,
                                 totalSpent,
                                 remainingAmount,
                                 hasBudgetLimit = true,
                                 budgetType = "paycheck",
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

    // Define button and text colors based on budget type
    // Updated to match the colors used in Header.js
    const buttonColors = {
        "paycheck": {
            bg: "bg-blue-600 hover:bg-blue-700",
            focus: "focus:ring-blue-500"
        },
        "business": {
            bg: "bg-emerald-800 hover:bg-emerald-900",
            focus: "focus:ring-emerald-500"
        },
        "custom": {
            bg: "bg-purple-600 hover:bg-purple-700",
            focus: "focus:ring-purple-500"
        }
    };

    // Get the button colors for current budget type
    const buttonColor = buttonColors[budgetType] || buttonColors.paycheck;

    const labels = {
        title: budgetType === "business" ? "Project Expenses" :
            budgetType === "custom" ? "Budget Items" :
                "Expense Items",
        amountLabel: budgetType === "business" ? "Budget Limit" :
            budgetType === "custom" ? "Budget Limit" :
                "Paycheck",
        spentLabel: "Spent",
        remainingLabel: "Remaining",
        buttonLabel: budgetType === "business" ? "Record Expense" :
            budgetType === "custom" ? "Add Budget Item" :
                "Record Expense"
    };

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
                {/* First box - changes based on budget type */}
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{labels.amountLabel}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {budgetType === "business" && !hasBudgetLimit
                            ? "Not Set"
                            : `$${budget.amount.toLocaleString()}`}
                    </p>
                </div>
                {/* Total Spent box - unchanged */}
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{labels.spentLabel}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        ${totalSpent.toLocaleString()}
                    </p>
                </div>
                {/* Remaining box - conditional for business type */}
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{labels.remainingLabel}</p>
                    {budgetType === "business" && !hasBudgetLimit ? (
                        <p className="text-2xl font-bold text-gray-600">N/A</p>
                    ) : (
                        <p className={`text-2xl font-bold ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${remainingAmount.toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{labels.title}</h3>
                <button
                    onClick={handleAddItemClick}
                    disabled={isAddingItem || isSaving}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white 
                    ${buttonColor.bg} 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${buttonColor.focus}
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isAddingItem ? (
                        <Loader2 className="h-6 w-6 mr-2 animate-spin stroke-[1.5]"/>
                    ) : (
                        <PlusCircle className="h-6 w-6 mr-2 stroke-[1.5]"/>
                    )}
                    {labels.buttonLabel}
                </button>
            </div>
        </div>
    );
};

export default BudgetDetailsHeader;