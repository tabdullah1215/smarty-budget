import Papa from 'papaparse';

export const downloadCSV = async (selectedBudgets = []) => {
    try {
        if (!Array.isArray(selectedBudgets) || selectedBudgets.length === 0) {
            console.warn('No budgets selected for CSV export');
            return;
        }

        // Log the incoming data to debug
        console.log('Selected budgets:', selectedBudgets);

        const rows = selectedBudgets.flatMap(budget => {
            console.log('Processing budget:', budget);
            return (budget.items || []).map(item => {
                console.log('Processing item:', item);
                return {
                    PaycheckName: budget.name || '',
                    PaycheckDate: budget.date || '',
                    PaycheckAmount: budget.amount || 0,
                    ExpenseCategory: item.category || '',
                    ExpenseDescription: item.description || '',
                    ExpenseDate: item.date || '',
                    ExpenseAmount: item.amount || 0,
                    HasAttachment: item.image ? 'Yes' : 'No',
                    Status: 'All Items Included'
                };
            });
        });

        // Add summary rows
        const totalBudget = selectedBudgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
        const totalSpent = rows.reduce((sum, row) => sum + (row.ExpenseAmount || 0), 0);
        const remainingBudget = totalBudget - totalSpent;

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
                PaycheckAmount: totalBudget,
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

        link.setAttribute('href', url);
        link.setAttribute('download', `budget-report-${new Date().toISOString().split('T')[0]}.csv`);
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