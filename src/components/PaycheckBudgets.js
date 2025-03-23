import React, {useEffect, useMemo, useState} from 'react';
import {useSprings, useSpring, animated, config} from '@react-spring/web';
import {useNavigate} from 'react-router-dom';
import {Loader2, Plus} from 'lucide-react';
import {Header} from './Header';
import {PaycheckBudgetForm} from './PaycheckBudgetForm';
import {PaycheckBudgetDetails} from './PaycheckBudgetDetails';
import {usePaycheckBudgets} from '../hooks/usePaycheckBudget';
import {withMinimumDelay} from "../utils/withDelay";
import {useToast} from '../contexts/ToastContext';
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import {PaycheckBudgetCard} from './PaycheckBudgetCard';
import authService from '../services/authService';
import PaycheckBudgetReport from "./PaycheckBudgetReport";
import {downloadCSV} from '../utils/budgetCsvGenerator';
// Import StaticRestoreButton
import StaticRestoreButton from './StaticRestoreButton';

export const PaycheckBudgets = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [deletingBudgetId, setDeletingBudgetId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [openingBudgetId, setOpeningBudgetId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fadingBudgetId, setFadingBudgetId] = useState(null);
    const [selectedBudgets, setSelectedBudgets] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    // New state for toggling restore options
    const [showRestoreOptions, setShowRestoreOptions] = useState(false);

    const navigate = useNavigate();
    const userInfo = authService.getUserInfo();
    const { showToast } = useToast();
    const { paycheckBudgets, createPaycheckBudget, updatePaycheckBudget, deletePaycheckBudget, isLoading } = usePaycheckBudgets();

    // Animation for the restore options panel
    const restoreOptionsAnimation = useSpring({
        opacity: showRestoreOptions ? 1 : 0,
        height: showRestoreOptions ? 'auto' : 0,
        transform: showRestoreOptions ? 'translateY(0px)' : 'translateY(-20px)',
        config: {
            tension: 120,
            friction: 14,
            duration: 800 // Slow animation for visibility
        }
    });

    // Animation for the restore toggle link
    const restoreToggleAnimation = useSpring({
        scale: showRestoreOptions ? 1.1 : 1,
        color: showRestoreOptions ? '#2563EB' : '#3B82F6',
        config: config.wobbly
    });

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

    const handleSelectBudget = (budgetId, isSelected) => {
        setSelectedBudgets((prev) => {
            return isSelected ? [...prev, budgetId] : prev.filter((id) => id !== budgetId);
        });
    };

    const isBudgetSelected = (budgetId) => selectedBudgets.includes(budgetId);

    const handleGenerateReport = () => {
        if (selectedBudgets.length === 0) {
            showToast('error', 'Please select at least one budget to generate a report');
            return;
        }

        // Get full budget objects and ensure data is valid
        const selectedBudgetObjects = sortedBudgets.filter(budget =>
            selectedBudgets.includes(budget.id)
        );

        if (!selectedBudgetObjects.length) {
            showToast('error', 'Selected budgets could not be found');
            return;
        }

        setShowReport(true);
    };

    const handleDownloadCsv = () => {
        if (selectedBudgets.length === 0) {
            showToast('error', 'Please select at least one budget to generate a CSV');
            return;
        }

        // Get full budget objects and ensure data is valid
        const selectedBudgetObjects = sortedBudgets.filter(budget =>
            selectedBudgets.includes(budget.id)
        );

        if (!selectedBudgetObjects.length) {
            showToast('error', 'Selected budgets could not be found');
            return;
        }

        downloadCSV(selectedBudgetObjects);
    };

    // Toggle function for restore options
    const toggleRestoreOptions = () => {
        setShowRestoreOptions(!showRestoreOptions);
    };

    // CRITICAL: This function ensures page reload after successful restore
    const handleRestoreSuccess = () => {
        // Set state to indicate we're in the process of restoring
        setIsRestoring(true);

        // Show a toast notification to inform the user
        showToast('success', 'Restore complete! Refreshing to show your data...');

        // Set a flag in localStorage that we can check after reload
        localStorage.setItem('justRestored', 'true');

        // Log the current time so we can confirm this function was called
        console.log('Restore complete, page will reload in 2 seconds', new Date().toISOString());

        // Set a timeout to delay the reload slightly
        setTimeout(() => {
            // Log right before reload
            console.log('Executing page reload now', new Date().toISOString());

            // THIS IS THE CRITICAL LINE - it forces a complete page reload
            window.location.reload();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header
                showCreateButton
                onCreateClick={handleCreateClick}
                isCreatingBudget={isCreating}
                selectedBudgets={selectedBudgets || []}
                onGenerateReport={handleGenerateReport}
                onDownloadCsv={handleDownloadCsv}
            />

            {/* Substantially increased padding to ensure content is below header */}
            <div className="pt-64 md:pt-40 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto pb-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                        </div>
                    ) : paycheckBudgets.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="flex flex-col items-center justify-center p-5 sm:p-8 text-center">
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    No Paycheck Budgets Yet
                                </h3>
                                <p className="text-gray-500 max-w-sm mb-4">
                                    Track your income and expenses for each paycheck. Create your first paycheck budget.
                                </p>

                                {/* Create Budget Button */}
                                <button
                                    onClick={handleCreateClick}
                                    disabled={isCreating || isRestoring}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-6"
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

                                {/* Restore Section with toggle and animated panel */}
                                <div className="w-full max-w-md pt-4 border-t border-gray-200">
                                    <div className="text-center mb-3">
                                        <animated.button
                                            onClick={toggleRestoreOptions}
                                            style={{
                                                transform: restoreToggleAnimation.scale.to(s => `scale(${s})`),
                                                color: restoreToggleAnimation.color
                                            }}
                                            className="underline text-sm text-blue-600 hover:text-blue-800
                                                      transition-colors duration-300"
                                        >
                                            {showRestoreOptions ? "Hide restore options" : "Or restore from a previously created backup"}
                                        </animated.button>
                                    </div>

                                    {/* Animated restore options panel */}
                                    <animated.div
                                        style={restoreOptionsAnimation}
                                        className="overflow-hidden"
                                    >
                                        <StaticRestoreButton onRestore={handleRestoreSuccess} />
                                    </animated.div>
                                </div>
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

            <DeleteConfirmationModal
                isOpen={showDeleteModal && !!deletingBudgetId}
                onClose={handleCancelDelete}
                onConfirm={confirmDelete}
                title="Delete Budget"
                message="Are you sure you want to delete this budget? This action cannot be undone."
            />

            {showReport && (
                <PaycheckBudgetReport
                    selectedBudgets={sortedBudgets.filter(budget =>
                        selectedBudgets.includes(budget.id)
                    )}
                    onClose={() => setShowReport(false)}
                    onPrint={setIsPrinting}
                    isPrinting={isPrinting}
                />
            )}
        </div>
    );
};