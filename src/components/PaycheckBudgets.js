import React, { useState, useEffect, useMemo } from 'react';
import { useTransition, animated, useSprings, animated as a } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, FileText, Trash2 } from 'lucide-react';
import { Header } from './Header';
import { PaycheckBudgetForm } from './PaycheckBudgetForm';
import { PaycheckBudgetDetails } from './PaycheckBudgetDetails';
import { usePaycheckBudgets } from '../hooks/usePaycheckBudget';
import { withMinimumDelay } from '../utils/withDelay';
import authService from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { modalTransitions, backdropTransitions } from '../utils/transitions';

export const PaycheckBudgets = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [deletingBudgetId, setDeletingBudgetId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [openingBudgetId, setOpeningBudgetId] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fadingBudgetId, setFadingBudgetId] = useState(null);
    const navigate = useNavigate();
    const userInfo = authService.getUserInfo();
    const { showToast } = useToast();
    const { paycheckBudgets, createPaycheckBudget, updatePaycheckBudget, deletePaycheckBudget, isLoading } = usePaycheckBudgets();

    const transitions = useTransition(showDeleteModal, modalTransitions);
    const backdropTransition = useTransition(showDeleteModal, backdropTransitions);

    const sortedBudgets = useMemo(() =>
            [...paycheckBudgets].sort((a, b) => new Date(b.date) - new Date(a.date)),
        [paycheckBudgets]
    );

    const fadeAnimationProps = {
        from: { opacity: 1, transform: 'translateY(0px)' },
        config: { duration: 500 }
    };

    const [fadeAnimations] = useSprings(
        sortedBudgets.length,
        index => ({
            ...fadeAnimationProps,
            to: {
                opacity: fadingBudgetId === sortedBudgets[index].id ? 0 : 1,
                transform: fadingBudgetId === sortedBudgets[index].id ? 'translateY(10px)' : 'translateY(0px)'
            }
        }),
        [fadingBudgetId, sortedBudgets]
    );

    useEffect(() => {
        if (!userInfo?.sub) {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const handleCreateClick = async () => {
        setIsCreating(true);
        try {
            await withMinimumDelay(async () => {});
            setShowNewBudgetForm(true);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (e, budgetId) => {
        e.stopPropagation();
        setConfirmingDeleteId(budgetId);
        await withMinimumDelay(async () => {});
        setConfirmingDeleteId(null);
        setDeletingBudgetId(budgetId);
        setShowDeleteModal(true);
    };

    const handleCancelDelete = async () => {
        setIsCancelling(true);
        await withMinimumDelay(async () => {});
        setShowDeleteModal(false);
        await withMinimumDelay(async () => {});
        setDeletingBudgetId(null);
        setIsCancelling(false);
    };

    const confirmDelete = async () => {
        if (deletingBudgetId) {
            setIsDeleting(true);
            try {
                setFadingBudgetId(deletingBudgetId);
                await withMinimumDelay(async () => {
                    await deletePaycheckBudget(deletingBudgetId);
                    setShowDeleteModal(false);
                });
                await withMinimumDelay(async () => {});
                setDeletingBudgetId(null);
            } catch (error) {
                console.error('Error deleting budget:', error);
                setFadingBudgetId(null);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleOpenBudget = async (budget) => {
        if (openingBudgetId) return;

        setOpeningBudgetId(budget.id);
        try {
            await withMinimumDelay(async () => {
                setSelectedBudget(budget);
            });
        } catch (error) {
            console.error('Error opening budget:', error);
        } finally {
            setOpeningBudgetId(null);
        }
    };

    const handleCreateBudget = async (budgetData) => {
        try {
            await createPaycheckBudget(budgetData);
            showToast('success', 'New paycheck budget created successfully');
        } catch (error) {
            console.error('Error creating budget:', error);
            showToast('error', 'Failed to create paycheck budget. Please try again.');
        }
    };

    const handleUpdateBudget = async (updatedBudget) => {
        try {
            await updatePaycheckBudget(updatedBudget);
            setSelectedBudget(updatedBudget);
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header
                showCreateButton
                onCreateClick={handleCreateClick}
                isCreatingBudget={isCreating}
            />

            <div className="pt-72 md:pt-36 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto pb-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                        </div>
                    ) : paycheckBudgets.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    No Paycheck Budgets Yet
                                </h3>
                                <p className="text-gray-500 max-w-sm mb-6">
                                    Track your income and expenses for each paycheck. Create your first paycheck budget to get started.
                                </p>
                                <button
                                    onClick={handleCreateClick}
                                    disabled={isCreating}
                                    className="inline-flex items-center px-4 py-2 border border-transparent
                                        text-sm font-medium rounded-md shadow-sm text-white bg-blue-600
                                        hover:bg-blue-700 focus:outline-none focus:ring-2
                                        focus:ring-offset-2 focus:ring-blue-500
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all duration-200"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5 mr-2" />
                                            Create Paycheck Budget
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedBudgets.map((budget, index) => (
                                <a.div
                                    key={budget.id}
                                    style={fadeAnimations[index]}
                                    className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-all duration-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{budget.name}</h3>
                                            <div className="flex flex-row items-center space-x-3 mt-1">
                                                <div className="bg-gray-200 p-2 rounded-lg">
                                                    <span className="text-gray-800">Amount: ${budget.amount.toLocaleString()}</span>
                                                </div>
                                                {(() => {
                                                    const totalSpent = budget.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                                                    const remainingAmount = budget.amount - totalSpent;

                                                    return (
                                                        <>
                                                            <div className="bg-gray-200 p-2 rounded-lg">
                                                                <span className="text-gray-800">Remaining: </span>
                                                                <span
                                                                    className={`${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    ${remainingAmount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-gray-600">Date: {new Date(budget.date).toLocaleDateString()}</p>
                                                <div className="w-32 relative">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        {(() => {
                                                            const totalSpent = budget.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                                                            const percentageUsed = (totalSpent / budget.amount) * 100;
                                                            return (
                                                                <>
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
                                                                    ></div>
                                                                    <span
                                                                        className="absolute -bottom-4 right-0 text-xs text-gray-500">
                                                                        {percentageUsed.toFixed(1)}%
                                                                    </span>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!openingBudgetId) handleOpenBudget(budget);
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
                                                onClick={(e) => !confirmingDeleteId && handleDelete(e, budget.id)}
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
                                </a.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showNewBudgetForm && (
                <PaycheckBudgetForm
                    onSave={handleCreateBudget}
                    onClose={() => setShowNewBudgetForm(false)}
                />
            )}

            {selectedBudget && (
                <PaycheckBudgetDetails
                    budget={selectedBudget}
                    onClose={() => setSelectedBudget(null)}
                    onUpdate={handleUpdateBudget}
                />
            )}

            {transitions((style, item) =>
                    item && deletingBudgetId && (
                        <>
                            {backdropTransition((backdropStyle, show) =>
                                    show && (
                                        <animated.div
                                            style={backdropStyle}
                                            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                                        />
                                    )
                            )}
                            <animated.div
                                style={style}
                                className="fixed inset-0 z-50 flex items-center justify-center"
                            >
                                <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                                    <div className="mt-3 text-center">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Budget</h3>
                                        <div className="mt-2 px-7 py-3">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete this budget? This action cannot be undone.
                                            </p>
                                        </div>
                                        <div className="flex justify-center space-x-4 mt-4">
                                            <button
                                                onClick={handleCancelDelete}
                                                disabled={isCancelling || isDeleting}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300
                                                rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2
                                                focus:ring-gray-500 transition-all duration-200
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isCancelling ? (
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                ) : (
                                                    'Cancel'
                                                )}
                                            </button>

                                            <button
                                                onClick={confirmDelete}
                                                disabled={isDeleting}
                                                className="inline-flex items-center px-4 py-2 bg-red-600
                                                text-white rounded-md hover:bg-red-700
                                                transition-all duration-200
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isDeleting ? (
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
        </div>
    );
};