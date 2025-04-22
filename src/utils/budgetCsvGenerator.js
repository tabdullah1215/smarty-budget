import Papa from 'papaparse';

export const downloadCSV = async (selectedBudgets = []) => {
    try {
        if (!Array.isArray(selectedBudgets) || selectedBudgets.length === 0) {
            console.warn('No budgets selected for CSV export');
            return;
        }

        // Log the incoming data to debug
        console.log('Selected budgets:', selectedBudgets);

        // Determine budget type from first budget (assuming all are same type)
        const isBusinessBudget = selectedBudgets.length > 0 &&
            selectedBudgets[0].hasOwnProperty('projectName');

        // Check if business budget has no meaningful limit
        const hasBudgetLimit = (budget) => {
            if (isBusinessBudget) {
                return budget.amount > 0;
            }
            return true; // Paycheck budgets always have a limit
        };

        const rows = selectedBudgets.flatMap(budget => {
            console.log('Processing budget:', budget);
            return (budget.items || []).map(item => {
                console.log('Processing item:', item);
                return {
                    PaycheckName: budget.name || '',
                    PaycheckDate: budget.date || '',
                    PaycheckAmount: hasBudgetLimit(budget) ? (budget.amount || 0) : 'No Limit',
                    ExpenseCategory: item.category || '',
                    ExpenseDescription: item.description || '',
                    ExpenseDate: item.date || '',
                    ExpenseAmount: item.amount || 0,
                    HasAttachment: item.image ? 'Yes' : 'No',
                    Status: item.isActive ? 'Included' : 'Pending'
                };
            });
        });

        // Add summary rows
        // Calculate summary values with special handling for unlimited budgets
        const totalBudget = selectedBudgets.reduce((sum, budget) => {
            // Only add budget amount to total if it has a limit
            if (hasBudgetLimit(budget)) {
                return sum + (budget.amount || 0);
            }
            return sum;
        }, 0);

        const totalSpent = rows.reduce((sum, row) => sum + (row.ExpenseAmount || 0), 0);

        // For remaining budget, only calculate if there are meaningful limits
        const hasAnyBudgetLimit = selectedBudgets.some(hasBudgetLimit);
        const remainingBudget = hasAnyBudgetLimit ? totalBudget - totalSpent : 'Not Applicable';

        rows.push(
            {
                PaycheckName: 'SUMMARY',
                PaycheckDate: '',
                PaycheckAmount: '',
                ExpenseCategory: '',
                ExpenseDescription: '',
                ExpenseDate: '',
                ExpenseAmount: '',
                HasAttachment: '',
                Status: ''
            },
            {
                PaycheckName: 'Total Budget',
                PaycheckDate: '',
                PaycheckAmount: hasAnyBudgetLimit ? totalBudget : 'Some Budgets Unlimited',
                ExpenseCategory: '',
                ExpenseDescription: '',
                ExpenseDate: '',
                ExpenseAmount: '',
                HasAttachment: '',
                Status: ''
            },
            {
                PaycheckName: 'Total Spent',
                PaycheckDate: '',
                PaycheckAmount: totalSpent,
                ExpenseCategory: '',
                ExpenseDescription: '',
                ExpenseDate: '',
                ExpenseAmount: '',
                HasAttachment: '',
                Status: ''
            },
            {
                PaycheckName: 'Remaining Budget',
                PaycheckDate: '',
                PaycheckAmount: remainingBudget,
                ExpenseCategory: '',
                ExpenseDescription: '',
                ExpenseDate: '',
                ExpenseAmount: '',
                HasAttachment: '',
                Status: ''
            }
        );

        const csv = Papa.unparse(rows, {
            delimiter: ',',
            header: true,
            newline: '\n'
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Determine file name based on budget type
        const prefix = isBusinessBudget ? 'business-expense' : 'budget';

        link.setAttribute('href', url);
        link.setAttribute('download', `${prefix}-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating CSV:', error);
        throw error;
    }
};