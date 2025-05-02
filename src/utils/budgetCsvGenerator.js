import Papa from 'papaparse';
import { CUSTOM_BUDGET_CATEGORIES } from '../data/customBudgetCategories';

/**
 * Helper function to get the user-friendly display name for a budget category
 * @param {string} categoryKey - The internal category key (e.g., 'special_event')
 * @returns {string} - The user-friendly display name (e.g., 'Special Event')
 */
const getBudgetCategoryName = (categoryKey) => {
    if (!categoryKey) return 'Not Specified';

    const categoryData = CUSTOM_BUDGET_CATEGORIES[categoryKey];
    return categoryData?.name || categoryKey;
};

/**
 * Determines the budget type based on the structure of the budget object
 * @param {Object} budget - The budget object
 * @returns {string} - 'business', 'custom', or 'paycheck'
 */
const determineBudgetType = (budget) => {
    if (budget.hasOwnProperty('projectName')) {
        return 'business';
    } else if (budget.hasOwnProperty('budgetCategory')) {
        return 'custom';
    } else {
        return 'paycheck';
    }
};

/**
 * Check if a budget has a meaningful limit
 * @param {Object} budget - The budget object
 * @returns {boolean} - Whether the budget has a limit
 */
const hasBudgetLimit = (budget) => {
    if (determineBudgetType(budget) === 'business') {
        return budget.amount > 0;
    }
    return true; // Paycheck and custom budgets always have a limit
};

/**
 * Format date string to a consistent format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
};

/**
 * Returns the appropriate column names based on budget type
 * @param {string} budgetType - The type of budget
 * @returns {Object} - Object with column names
 */
const getColumnNames = (budgetType) => {
    const baseColumns = {
        budgetName: 'Budget Name',
        budgetDate: 'Date',
        budgetAmount: 'Amount',
        itemCategory: 'Category',
        itemDescription: 'Description',
        itemDate: 'Expense Date',
        itemAmount: 'Expense Amount',
        hasAttachment: 'Has Receipt',
        itemStatus: 'Status',
        budgetType: 'Budget Type'
    };

    switch (budgetType) {
        case 'business':
            return {
                ...baseColumns,
                budgetName: 'Project Name',
                budgetDate: 'Project Date',
                budgetAmount: 'Budget Limit',
                clientName: 'Client',
                originalProjectName: 'Project ID'
            };
        case 'custom':
            return {
                ...baseColumns,
                budgetCategory: 'Budget Category',
                budgetCategoryType: 'Budget Type'
            };
        case 'paycheck':
        default:
            return {
                ...baseColumns,
                budgetName: 'Paycheck Name',
                budgetDate: 'Paycheck Date',
                budgetAmount: 'Paycheck Amount'
            };
    }
};

/**
 * Creates a row object for a budget item
 * @param {Object} budget - The budget object
 * @param {Object} item - The budget item
 * @returns {Object} - Row object for CSV
 */
const createItemRow = (budget, item) => {
    const budgetType = determineBudgetType(budget);
    const budgetHasLimit = hasBudgetLimit(budget);
    const columnNames = getColumnNames(budgetType);

    // Create the base row with common fields
    const row = {
        [columnNames.budgetType]: budgetType.charAt(0).toUpperCase() + budgetType.slice(1),
        [columnNames.budgetName]: budget.name || '',
        [columnNames.budgetDate]: formatDate(budget.date) || '',
        [columnNames.budgetAmount]: budgetHasLimit ? (budget.amount || 0).toFixed(2) : 'No Limit',
        [columnNames.itemCategory]: item.category || '',
        [columnNames.itemDescription]: item.description || '',
        [columnNames.itemDate]: formatDate(item.date) || '',
        [columnNames.itemAmount]: (item.amount || 0).toFixed(2),
        [columnNames.hasAttachment]: item.image ? 'Yes' : 'No',
        [columnNames.itemStatus]: item.isActive ? 'Included' : 'Pending',
        'Created': formatDate(item.createdAt) || '',
        'Last Updated': formatDate(item.updatedAt) || ''
    };

    // Add budget-specific fields
    if (budgetType === 'business') {
        row[columnNames.clientName] = budget.client || 'None';
        row[columnNames.originalProjectName] = budget.projectName || '';
    } else if (budgetType === 'custom') {
        row[columnNames.budgetCategory] = getBudgetCategoryName(budget.budgetCategory);
        row[columnNames.budgetCategoryType] = budget.budgetCategory || '';
    }

    return row;
};

/**
 * Create summary rows for the CSV
 * @param {Array} budgets - Array of budget objects
 * @param {string} dominantBudgetType - The most common budget type in the selection
 * @returns {Array} - Array of summary rows
 */
const createSummaryRows = (budgets, dominantBudgetType) => {
    // Calculate summary values
    const columnNames = getColumnNames(dominantBudgetType);

    // Calculate whether all budgets have meaningful limits
    const hasAnyBudgetLimit = budgets.some(hasBudgetLimit);

    // Calculate total budget and total spent
    const totalBudget = budgets.reduce((sum, budget) => {
        if (hasBudgetLimit(budget)) {
            return sum + (budget.amount || 0);
        }
        return sum;
    }, 0);

    // Calculate total spent from all items
    let totalSpent = 0;
    let includedItemsCount = 0;
    let pendingItemsCount = 0;
    let totalItemsCount = 0;

    budgets.forEach(budget => {
        (budget.items || []).forEach(item => {
            totalItemsCount++;
            if (item.isActive) {
                totalSpent += (item.amount || 0);
                includedItemsCount++;
            } else {
                pendingItemsCount++;
            }
        });
    });

    // Format the remaining budget value
    const remainingBudget = hasAnyBudgetLimit ? (totalBudget - totalSpent) : 'Not Applicable';

    // Create the summary rows
    return [
        // Empty row as separator
        {
            [columnNames.budgetName]: 'SUMMARY',
            [columnNames.budgetDate]: '',
            [columnNames.budgetAmount]: '',
            [columnNames.itemCategory]: '',
            [columnNames.itemDescription]: '',
            [columnNames.itemDate]: '',
            [columnNames.itemAmount]: '',
            [columnNames.hasAttachment]: '',
            [columnNames.itemStatus]: '',
            [columnNames.budgetType]: ''
        },
        // Total budget row
        {
            [columnNames.budgetName]: 'Total Budget',
            [columnNames.budgetAmount]: hasAnyBudgetLimit ? totalBudget.toFixed(2) : 'Some Budgets Unlimited',
            [columnNames.itemCategory]: '',
            [columnNames.itemDescription]: '',
            [columnNames.itemDate]: '',
            [columnNames.itemAmount]: '',
            [columnNames.hasAttachment]: '',
            [columnNames.itemStatus]: '',
            [columnNames.budgetType]: ''
        },
        // Total spent row
        {
            [columnNames.budgetName]: 'Total Spent',
            [columnNames.budgetAmount]: totalSpent.toFixed(2),
            [columnNames.itemCategory]: '',
            [columnNames.itemDescription]: '',
            [columnNames.itemDate]: '',
            [columnNames.itemAmount]: '',
            [columnNames.hasAttachment]: '',
            [columnNames.itemStatus]: '',
            [columnNames.budgetType]: ''
        },
        // Remaining budget row
        {
            [columnNames.budgetName]: 'Remaining Budget',
            [columnNames.budgetAmount]: hasAnyBudgetLimit ? (totalBudget - totalSpent).toFixed(2) : 'Not Applicable',
            [columnNames.itemCategory]: '',
            [columnNames.itemDescription]: '',
            [columnNames.itemDate]: '',
            [columnNames.itemAmount]: '',
            [columnNames.hasAttachment]: '',
            [columnNames.itemStatus]: '',
            [columnNames.budgetType]: ''
        },
        // Item stats row
        {
            [columnNames.budgetName]: 'Item Statistics',
            [columnNames.budgetAmount]: `Total: ${totalItemsCount}, Included: ${includedItemsCount}, Pending: ${pendingItemsCount}`,
            [columnNames.itemCategory]: '',
            [columnNames.itemDescription]: '',
            [columnNames.itemDate]: '',
            [columnNames.itemAmount]: '',
            [columnNames.hasAttachment]: '',
            [columnNames.itemStatus]: '',
            [columnNames.budgetType]: ''
        }
    ];
};

/**
 * Generate and download a CSV file from the selected budgets
 * @param {Array} selectedBudgets - Array of selected budget objects
 * @returns {Promise<void>}
 */
export const downloadCSV = async (selectedBudgets = []) => {
    try {
        if (!Array.isArray(selectedBudgets) || selectedBudgets.length === 0) {
            console.warn('No budgets selected for CSV export');
            return;
        }

        console.log('Selected budgets:', selectedBudgets);

        // Determine the dominant budget type for consistent column names
        const budgetTypes = selectedBudgets.map(determineBudgetType);
        const dominantBudgetType = budgetTypes.sort((a, b) =>
            budgetTypes.filter(v => v === a).length - budgetTypes.filter(v => v === b).length
        ).pop();

        // Create rows for each budget item
        const itemRows = selectedBudgets.flatMap(budget => {
            return (budget.items || []).map(item => createItemRow(budget, item));
        });

        // Create summary rows
        const summaryRows = createSummaryRows(selectedBudgets, dominantBudgetType);

        // Combine all rows
        const allRows = [...itemRows, ...summaryRows];

        // Generate the CSV
        const csv = Papa.unparse(allRows, {
            delimiter: ',',
            header: true,
            newline: '\n'
        });

        // Create and download the file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Determine file name based on budget types
        const budgetTypeNames = [...new Set(budgetTypes)].map(type =>
            type.charAt(0).toUpperCase() + type.slice(1)
        ).join('-');

        link.setAttribute('href', url);
        link.setAttribute('download', `${budgetTypeNames}-budget-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error generating CSV:', error);
        throw error;
    }
};

export default downloadCSV;