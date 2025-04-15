import React, { useEffect, useMemo, useState } from 'react';
import { useSprings, useSpring, animated } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { Header } from './Header';
import { PaycheckBudgetDetails } from './PaycheckBudgetDetails';
import { usePaycheckBudgets } from '../hooks/usePaycheckBudget';
import { withMinimumDelay } from "../utils/withDelay";
import { useToast } from '../contexts/ToastContext';
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { PaycheckBudgetCard } from './PaycheckBudgetCard';
import authService from '../services/authService';
import { downloadCSV } from '../utils/budgetCsvGenerator';
import { BusinessExpenseProjectForm } from './BusinessExpenseProjectForm';

export const BusinessProjects = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [deletingBudgetId, setDeletingBudgetId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [openingBudgetId, setOpeningBudgetId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fadingBudgetId, setFadingBudgetId] = useState(null);
    const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);

    const navigate = useNavigate();
    const userInfo = authService.getUserInfo();
    const { showToast } = useToast();

    // For now, we'll reuse the PaycheckBudgets hook and filter for business type
    const { paycheckBudgets, createPaycheckBudget, updatePaycheckBudget, deletePaycheckBudget, isLoading } = usePaycheckBudgets();

    // Filter budgets to only show those with "business" type
    const sortedBudgets = useMemo(() => {
        return [...paycheckBudgets]
            .filter(budget => budget.budgetType === 'business')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [paycheckBudgets]);

    // Get the complete budget objects for selected budget IDs
    const selectedBudgetObjects = useMemo(() => {
        return sortedBudgets.filter(budget => selectedBudgetIds.includes(budget.id));
    }, [sortedBudgets, selectedBudgetIds]);

    const fadeAnimationProps = {
        from: { opacity: 1, transform: 'translateY(0px)' },
        config: { duration: 500 }
    };

    const [fadeAnimations] = useSprings(
        sortedBudgets.length,
        index => ({
            ...fadeAnimationProps,
            to: {
                opacity: fadingBudgetId === sortedBudgets[index]?.id ? 0 : 1,
                transform: fadingBudgetId === sortedBudgets[index]?.id ? 'translateY(10px)' : 'translateY(0px)'
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

    const handleDeleteBudget = async (e, budgetId) => {
        e.stopPropagation();
        setConfirmingDeleteId(budgetId);
        await withMinimumDelay(async () => {});
        setConfirmingDeleteId(null);
        setDeletingBudgetId(budgetId);
        setShowDeleteModal(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingBudgetId(null);
    };

    const confirmDelete = async () => {
        if (deletingBudgetId) {
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
            }
        }
    };

    const handleCreateBudget = async (budgetData) => {
        try {
            // The budgetType field is already set in the BusinessExpenseProjectForm
            await createPaycheckBudget(budgetData);
            showToast('success', 'New business expense budget created successfully');
        } catch (error) {
            console.error('Error creating budget:', error);
            showToast('error', 'Failed to create business expense budget. Please try again.');
        }
    };

    const handleUpdateBudget = async (updatedBudget) => {
        try {
            // Make sure we preserve the budgetType
            const businessBudget = {
                ...updatedBudget,
                budgetType: 'business'
            };

            await updatePaycheckBudget(businessBudget);
            setSelectedBudget(businessBudget);
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };

    const handleSelectBudget = (budgetId, isSelected) => {
        setSelectedBudgetIds((prev) => {
            return isSelected ? [...prev, budgetId] : prev.filter((id) => id !== budgetId);
        });
    };

    const isBudgetSelected = (budgetId) => selectedBudgetIds.includes(budgetId);

    const handleDownloadCsv = async () => {
        if (selectedBudgetIds.length === 0) {
            showToast('error', 'Please select at least one budget to generate a CSV');
            return;
        }

        try {
            await downloadCSV(selectedBudgetObjects);
            showToast('success', 'CSV downloaded successfully');
        } catch (error) {
            console.error('Error downloading CSV:', error);
            showToast('error', 'Failed to download CSV');
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header
                showCreateButton
                onCreateClick={handleCreateClick}
                isCreatingBudget={isCreating}
                selectedBudgets={selectedBudgetObjects}
                onDownloadCsv={handleDownloadCsv}
            />

            <div className="pt-64 md:pt-40 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto pb-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                        </div>
                    ) : sortedBudgets.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="flex flex-col items-center justify-center p-5 sm:p-8 text-center">
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    No Business Expense Budgets Yet
                                </h3>
                                <p className="text-gray-500 max-w-sm mb-4">
                                    Track and document your business expenses for reimbursement. Create your first business expense budget.
                                </p>

                                <button
                                    onClick={handleCreateClick}
                                    disabled={isCreating}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-6"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5 mr-2" />
                                            Create Business Expense Budget
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedBudgets.map((budget, index) => (
                                <PaycheckBudgetCard
                                    key={budget.id}
                                    budget={budget}
                                    onOpenBudget={handleOpenBudget}
                                    onDeleteBudget={handleDeleteBudget}
                                    openingBudgetId={openingBudgetId}
                                    confirmingDeleteId={confirmingDeleteId}
                                    style={fadeAnimations[index]}
                                    onSelect={handleSelectBudget}
                                    isSelected={isBudgetSelected(budget.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showNewBudgetForm && (
                <BusinessExpenseProjectForm
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

            <DeleteConfirmationModal
                isOpen={showDeleteModal && !!deletingBudgetId}
                onClose={handleCancelDelete}
                onConfirm={confirmDelete}
                title="Delete Business Expense Budget"
                message="Are you sure you want to delete this business expense budget? This action cannot be undone."
            />
        </div>
    );
};

export default BusinessProjects;