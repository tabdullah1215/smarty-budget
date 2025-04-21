import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import { animated, useSpring } from '@react-spring/web';

export const BudgetCard = ({
                               budget,
                               onOpenBudget,
                               onDeleteBudget,
                               openingBudgetId,
                               confirmingDeleteId,
                               style,
                               onSelect,
                               isSelected,
                               isNewlyAdded,
                               budgetType = 'paycheck'
                           }) => {
    const totalSpent = budget.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Check if this is a business project with no meaningful budget limit
    const isBusinessWithNoLimit = budgetType === 'business' && (!budget.amount || budget.amount <= 0);

    // Only calculate remaining and percentage if there is a budget limit
    const remainingAmount = isBusinessWithNoLimit ? null : budget.amount - totalSpent;
    const percentageUsed = isBusinessWithNoLimit ? null : (totalSpent / budget.amount) * 100;

    // Add a fade-in animation for newly added budget cards
    const [hasMounted, setHasMounted] = useState(false);

    // On initial mount, set hasMounted to true after a short delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasMounted(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Create fadeIn animation
    const fadeInAnimation = useSpring({
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: {
            opacity: hasMounted ? 1 : 0,
            transform: hasMounted ? 'translateY(0px)' : 'translateY(20px)'
        },
        config: {
            mass: 1,
            tension: 50,
            friction: 12,
            duration: 400
        }
    });

    // Combine custom style with fadeIn animation
    const combinedStyle = style ? { ...style, ...fadeInAnimation } : fadeInAnimation;

    return (
        <animated.div
            style={combinedStyle}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-all duration-200"
        >
            <div className="absolute top-2 left-2">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(budget.id, e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{budget.name}</h3>
                    <div className="flex flex-row items-center space-x-3 mt-1">
                        {isBusinessWithNoLimit ? (
                            <>
                                <div className="bg-gray-200 p-2 rounded-lg">
                                    <span className="text-gray-800">No Budget Limit</span>
                                </div>
                                <div className="bg-gray-200 p-2 rounded-lg">
                                    <span className="text-gray-800">Total Spent: ${totalSpent.toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-gray-200 p-2 rounded-lg">
                                    <span className="text-gray-800">Amount: ${budget.amount.toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-200 p-2 rounded-lg">
                                    <span className="text-gray-800">Remaining: </span>
                                    <span className={`${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${remainingAmount.toLocaleString()}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-1">
                        <p className="text-gray-600">Date: {new Date(budget.date).toLocaleDateString()}</p>
                        {!isBusinessWithNoLimit && (
                            <div className="w-32 relative">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.min(percentageUsed, 100)}%`,
                                            backgroundColor: percentageUsed > 100
                                                ? '#EF4444'
                                                : percentageUsed > 90
                                                    ? '#F59E0B'
                                                    : '#10B981'
                                        }}
                                    />
                                    <span className="absolute -bottom-4 right-0 text-xs text-gray-500">
                                        {percentageUsed.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!openingBudgetId) onOpenBudget(budget);
                        }}
                        disabled={openingBudgetId === budget.id || confirmingDeleteId === budget.id}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View details"
                    >
                        {openingBudgetId === budget.id ? (
                            <Loader2 className="h-7 w-7 animate-spin"/>
                        ) : (
                            <FileText className="h-7 w-7"/>
                        )}
                    </button>
                    <button
                        onClick={(e) => !confirmingDeleteId && onDeleteBudget(e, budget.id)}
                        disabled={confirmingDeleteId === budget.id || openingBudgetId === budget.id}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete budget"
                    >
                        {confirmingDeleteId === budget.id ? (
                            <Loader2 className="h-7 w-7 animate-spin"/>
                        ) : (
                            <Trash2 className="h-7 w-7"/>
                        )}
                    </button>
                </div>
            </div>
        </animated.div>
    );
};