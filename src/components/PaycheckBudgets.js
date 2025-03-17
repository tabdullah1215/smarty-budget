import React, {useEffect, useMemo, useState, useRef} from 'react';
import {useSprings, useSpring, animated} from '@react-spring/web';
import {useNavigate} from 'react-router-dom';
import {Loader2, Plus, ChevronDown, ChevronRight} from 'lucide-react';
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
    const [showRestoreSection, setShowRestoreSection] = useState(false);
    const [restoreComplete, setRestoreComplete] = useState(false);
    // Track when the component is freshly loaded after restore
    const isRestoredLoad = useRef(false);

    const navigate = useNavigate();
    const userInfo = authService.getUserInfo();
    const { showToast } = useToast();
    const { paycheckBudgets, createPaycheckBudget, updatePaycheckBudget, deletePaycheckBudget, isLoading } = usePaycheckBudgets();

    // Container fadeout animation for when restore completes
    const containerAnimation = useSpring({
        opacity: restoreComplete ? 0 : 1,
        transform: restoreComplete ? 'translateY(20px)' : 'translateY(0px)',
        config: {
            mass: 5,          // Higher mass for more inertia
            tension: 10,      // Low tension for slower movement
            friction: 10,     // Low friction so it moves longer
            duration: 500    // 3 second minimum duration
        }
    });

    // Check localStorage to see if we just did a restore
    useEffect(() => {
        const restoredFlag = localStorage.getItem('justRestored');
        if (restoredFlag === 'true') {
            // Set our ref to true so we know to animate budgets
            isRestoredLoad.current = true;
            // Clear the flag so it only happens once
            localStorage.removeItem('justRestored');
        }
    }, []);

    // Handle page reload after fadeout animation
    useEffect(() => {
        if (restoreComplete) {
            // Set a flag in localStorage that we just did a restore
            // This will be used after reload to trigger the fade-in
            localStorage.setItem('justRestored', 'true');

            const timer = setTimeout(() => {
                window.location.reload();
            }, 1000); // Slightly longer than animation duration
            return () => clearTimeout(timer);
        }
    }, [restoreComplete]);

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

    const toggleRestoreSection = () => {
        setShowRestoreSection(!showRestoreSection);
    };

    // This function is called when restore is successfully completed
    const handleRestoreSuccess = () => {
        setIsRestoring(true);
        // Trigger fadeout animation for the entire container
        setRestoreComplete(true);
        // Page reload happens in the useEffect
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
                <animated.div style={containerAnimation} className="max-w-4xl mx-auto pb-8">
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

                                {/* Collapsible Restore Section */}
                                <div className="w-full max-w-md pt-4 border-t border-gray-200">
                                    <button
                                        onClick={toggleRestoreSection}
                                        disabled={isRestoring}
                                        className="flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {showRestoreSection ? (
                                            <>
                                                <ChevronDown className="h-4 w-4 mr-1" />
                                                Hide restore options
                                            </>
                                        ) : (
                                            <>
                                                <ChevronRight className="h-4 w-4 mr-1" />
                                                Restore from a previously created backup
                                            </>
                                        )}
                                    </button>

                                    {showRestoreSection && (
                                        <div className="mt-3">
                                            <StaticRestoreButton onRestore={handleRestoreSuccess} />
                                        </div>
                                    )}
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
                                    // Pass isRestoredLoad.current to indicate these are newly restored budgets
                                    isNewlyAdded={isRestoredLoad.current}
                                />
                            ))}
                        </div>
                    )}
                </animated.div>
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