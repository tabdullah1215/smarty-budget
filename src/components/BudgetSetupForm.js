import React, { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { X, Loader2, Calendar, DollarSign, Briefcase, Users, Hash } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { disableScroll, enableScroll } from '../utils/scrollLock';
import { Calculator } from 'lucide-react';
import { CUSTOM_BUDGET_CATEGORIES } from '../data/customBudgetCategories';

export const BudgetSetupForm = ({
                                    onSave,
                                    onClose,
                                    isSaving = false,
                                    budgetType = 'paycheck' // 'paycheck', 'business', or 'custom'
                                }) => {

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [show, setShow] = useState(true);

    const [projectName, setProjectName] = useState('');
    const [client, setClient] = useState('');

    const [budgetName, setBudgetName] = useState('');
    const [budgetCategory, setBudgetCategory] = useState('');

    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);

    const config = {
        paycheck: {
            title: 'New Paycheck Budget',
            icon: <Calendar className="h-8 w-8 text-blue-600" />,
            primaryColor: 'blue',
            primaryShade: '600',
            hoverShade: '700',
            buttonText: 'Create Budget',
            amountLabel: 'Net Paycheck Amount',
            amountRequired: true,
            amountHelpText: '',
        },
        business: {
            title: 'New Business Expense Project',
            icon: <Briefcase className="h-8 w-8 text-emerald-800" />,
            primaryColor: 'emerald',
            primaryShade: '800',
            hoverShade: '900',
            buttonText: 'Create Project',
            amountLabel: 'Budget Limit (Optional)',
            amountRequired: false,
            amountHelpText: 'Leave empty or set to 0 if you just want to track expenses without a budget limit'
        },
        custom: {
            title: 'New Custom Budget',
            icon: <Calculator className="h-8 w-8 text-purple-600" />,
            primaryColor: 'purple',
            primaryShade: '600',
            hoverShade: '700',
            buttonText: 'Create Budget',
            amountLabel: 'Budget Limit',
            amountRequired: true,
            amountHelpText: '',
            namePlaceholder: 'Vacation, DIY Project, Wedding, etc...',
        }
    };

    const currentConfig = config[budgetType] || config.paycheck;

    // Format budget category entries for dropdown
    const customBudgetCategoryOptions = Object.entries(CUSTOM_BUDGET_CATEGORIES).map(([key, category]) => ({
        id: key,
        name: category.name,
        description: category.description
    }));

    // When budget category changes, update the budget name suggestion
    useEffect(() => {
        if (budgetType === 'custom' && budgetCategory) {
            const selectedCategory = CUSTOM_BUDGET_CATEGORIES[budgetCategory];
            if (selectedCategory) {
                // Generate a default name if user hasn't typed anything yet
                if (!budgetName) {
                    setBudgetName(`${selectedCategory.name} Budget`);
                }
            }
        }
    }, [budgetCategory, budgetType, budgetName]);

    useEffect(() => {
        disableScroll();
        return () => {
            enableScroll();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsAdding(true);

        try {
            await withMinimumDelay(async () => {
                const budgetData = {};

                if (budgetType === 'paycheck') {
                    const budgetName = `Budget for ${new Date(date).toLocaleDateString()} Paycheck`;
                    budgetData.name = budgetName;
                    budgetData.date = date;
                    budgetData.amount = Number(amount);
                    budgetData.items = [];
                } else if (budgetType === 'business') {
                    const fullProjectName = `${projectName} - ${client || 'No Client'}`;
                    budgetData.name = fullProjectName;
                    budgetData.date = date;
                    budgetData.amount = amount ? Number(amount) : 0;
                    budgetData.projectName = projectName;
                    budgetData.client = client;
                    budgetData.items = [];
                } else if (budgetType === 'custom') {
                    budgetData.name = budgetName;
                    budgetData.date = date;
                    budgetData.amount = Number(amount);
                    budgetData.budgetCategory = budgetCategory; // Add the budgetCategory field
                    budgetData.items = [];
                }

                await onSave(budgetData);
                setShow(false); // Trigger exit animation
                await withMinimumDelay(async () => {}); // Wait for animation
            }, 2000);
        } catch (error) {
            console.error('Error saving:', error);
            setError('Failed to save. Please try again.');
            throw error;
        } finally {
            setIsAdding(false);
        }
    };

    const handleCancel = async () => {
        setIsCancelling(true);
        await withMinimumDelay(async () => {});
        setShow(false);
        await withMinimumDelay(async () => {});
        setIsCancelling(false);
        onClose();
    };

    // For debugging - verify button classes being generated
    const buttonClassName = `inline-flex items-center px-4 py-2 border-2 border-transparent
        rounded-lg shadow-sm text-sm font-medium text-white
        bg-${currentConfig.primaryColor}-${currentConfig.primaryShade} hover:bg-${currentConfig.primaryColor}-${currentConfig.hoverShade}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${currentConfig.primaryColor}-500
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        min-w-[100px] justify-center`;

    // Define hardcoded button classes based on budgetType
    const getButtonClass = () => {
        if (budgetType === 'custom') {
            return "inline-flex items-center px-4 py-2 border-2 border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center";
        } else if (budgetType === 'business') {
            return "inline-flex items-center px-4 py-2 border-2 border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center";
        } else {
            return "inline-flex items-center px-4 py-2 border-2 border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center";
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
                            <div className="relative mx-auto p-8 border w-[95%] max-w-xl shadow-lg rounded-lg bg-white">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center space-x-3">
                                        {currentConfig.icon}
                                        <h2 className="text-2xl font-semibold text-gray-900">{currentConfig.title}</h2>
                                    </div>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCancelling || isSaving}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        {isCancelling ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <X className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {budgetType === 'business' && (
                                        <>
                                            <div>
                                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                    <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                                                    Project Name *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={projectName}
                                                        onChange={(e) => setProjectName(e.target.value)}
                                                        className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                                    shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200
                                                    focus:ring-opacity-50 transition-colors duration-200`}
                                                        placeholder="Enter project name"
                                                        required
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                                                    Client (Optional)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={client}
                                                        onChange={(e) => setClient(e.target.value)}
                                                        className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                                    shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200
                                                    focus:ring-opacity-50 transition-colors duration-200`}
                                                        placeholder="Enter client name"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {budgetType === 'custom' && (
                                        <>
                                            <div>
                                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                    <Hash className="h-5 w-5 text-gray-400 mr-2" />
                                                    Budget Category *
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={budgetCategory}
                                                        onChange={(e) => setBudgetCategory(e.target.value)}
                                                        className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                                    shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200
                                                    focus:ring-opacity-50 transition-colors duration-200`}
                                                        required
                                                        disabled={isSaving}
                                                    >
                                                        <option value="">Select Budget Category</option>
                                                        {customBudgetCategoryOptions.map(option => (
                                                            <option key={option.id} value={option.id}>
                                                                {option.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {budgetCategory && (
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        {CUSTOM_BUDGET_CATEGORIES[budgetCategory]?.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                    <Calculator className="h-5 w-5 text-gray-400 mr-2" />
                                                    Budget Name *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={budgetName}
                                                        onChange={(e) => setBudgetName(e.target.value)}
                                                        className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                                shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200
                                                focus:ring-opacity-50 transition-colors duration-200`}
                                                        placeholder={currentConfig.namePlaceholder || "Enter budget name"}
                                                        required
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                            {budgetType === 'business' ? 'Start Date' :
                                                budgetType === 'custom' ? 'Budget Date' : 'Paycheck Date'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-3
                                            shadow-sm focus:border-${currentConfig.primaryColor}-500 focus:ring-4 focus:ring-${currentConfig.primaryColor}-200
                                            focus:ring-opacity-50 transition-colors duration-200
                                            appearance-none bg-white`}
                                                required
                                                disabled={isSaving}
                                                style={{
                                                    colorScheme: 'light'
                                                }}
                                            />
                                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                                            {currentConfig.amountLabel}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className={`block w-full rounded-lg border-2 border-gray-300 pl-8 pr-4 py-3
                                            shadow-sm focus:border-${currentConfig.primaryColor}-500 focus:ring-4 focus:ring-${currentConfig.primaryColor}-200
                                            focus:ring-opacity-50 transition-colors duration-200`}
                                                placeholder={budgetType === 'business' ? "Leave empty for no budget limit" : "0.00"}
                                                required={currentConfig.amountRequired}
                                                disabled={isSaving}
                                            />
                                            {currentConfig.amountHelpText && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {currentConfig.amountHelpText}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={isCancelling || isSaving}
                                            className="inline-flex items-center px-4 py-2 bg-white text-gray-700
                                        border-2 border-gray-300 rounded-lg hover:bg-gray-50
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                                        transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        min-w-[100px] justify-center shadow-sm"
                                        >
                                            {isCancelling ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Cancelling...
                                                </>
                                            ) : (
                                                'Cancel'
                                            )}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving || isAdding}
                                            className={getButtonClass()}
                                        >
                                            {isAdding || isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                currentConfig.buttonText
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};

export default BudgetSetupForm;