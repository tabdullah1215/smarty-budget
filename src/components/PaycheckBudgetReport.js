import React, { useMemo } from 'react';
import { Printer, X, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import _ from 'lodash';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const PaycheckBudgetReport = ({ selectedBudgets, onClose, isPrinting, onPrint }) => {
    const { showToast } = useToast();
    const userInfo = authService.getUserInfo(); // Get user info

    const reportData = useMemo(() => {
        // Process individual paycheck data
        const paycheckDetails = selectedBudgets.map(budget => {
            const activeItems = budget.items.filter(item => item.isActive);
            const totalSpent = activeItems.reduce((sum, item) => sum + item.amount, 0);
            const remaining = budget.amount - totalSpent;

            return {
                id: budget.id,
                name: budget.name,
                date: budget.date,
                amount: budget.amount,
                totalSpent,
                remaining,
                items: activeItems.sort((a, b) => new Date(b.date) - new Date(a.date))
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate category totals across all paychecks
        const allItems = paycheckDetails.flatMap(paycheck => paycheck.items);
        const categoryTotals = _(allItems)
            .groupBy('category')
            .map((items, category) => ({
                category,
                total: _.sumBy(items, 'amount'),
                count: items.length
            }))
            .orderBy(['total'], ['desc'])
            .value();

        // Calculate monthly spending trends
        const monthlySpending = _(allItems)
            .groupBy(item => {
                const date = new Date(item.date);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            })
            .map((items, month) => ({
                month,
                amount: _.sumBy(items, 'amount')
            }))
            .orderBy(['month'], ['asc'])
            .value();

        // Overall totals
        const totalIncome = _.sumBy(paycheckDetails, 'amount');
        const totalSpent = _.sumBy(paycheckDetails, 'totalSpent');
        const netSavings = totalIncome - totalSpent;
        const savingsRate = ((netSavings / totalIncome) * 100).toFixed(1);

        return {
            paycheckDetails,
            categoryTotals,
            monthlySpending,
            overall: {
                totalIncome,
                totalSpent,
                netSavings,
                savingsRate
            }
        };
    }, [selectedBudgets]);

    const handlePrint = async () => {
        onPrint(true);
        try {
            const content = document.getElementById('report-content');
            if (!content) return;

            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('budget-report.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('error', 'Failed to generate PDF report');
        } finally {
            onPrint(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Budget Report</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isPrinting ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Printer className="h-5 w-5 mr-2" />
                                    Download PDF
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isPrinting}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div id="report-content" className="p-8">
                {/* Part 1: Report Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Budget Analysis Report</h1>
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Prepared For</h3>
                                <p className="text-gray-900 mt-1">Email: {userInfo?.sub}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Report Details</h3>
                                <p className="text-gray-900 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                                <p className="text-gray-900">Period: {reportData.paycheckDetails[reportData.paycheckDetails.length - 1].date} to {reportData.paycheckDetails[0].date}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Part 2: Individual Paycheck Details */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Paycheck Details</h2>
                    {reportData.paycheckDetails.map((paycheck, index) => (
                        <div key={paycheck.id} className="mb-8 bg-white rounded-lg shadow-md p-6">
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h3 className="text-xl font-semibold">{paycheck.name}</h3>
                                <p className="text-gray-600">Date: {paycheck.date}</p>
                            </div>

                            {/* Paycheck Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        ${paycheck.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Spent</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        ${paycheck.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Remaining</p>
                                    <p className={`text-lg font-bold ${paycheck.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${paycheck.remaining.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Expense Items */}
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {paycheck.items.map((item, itemIndex) => (
                                    <tr key={itemIndex}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* Part 3: Category Analysis */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Analysis</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {/* Category Grid */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                            <div className="space-y-4">
                                {reportData.categoryTotals.map((category, index) => (
                                    <div key={category.category} className="flex justify-between items-center">
                                        <span className="text-gray-700">{category.category}</span>
                                        <span className="font-semibold">${category.total.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                            <div style={{height: '300px'}}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={reportData.categoryTotals}
                                            dataKey="total"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={(entry) => entry.category}
                                        >
                                            {reportData.categoryTotals.map((entry, index) => (
                                                <Cell key={entry.category} fill={COLORS[index % COLORS.length]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip/>
                                        <Legend/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Part 4: Overall Analysis */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Analysis</h2>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                ${reportData.overall.totalIncome.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                ${reportData.overall.totalSpent.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-sm font-medium text-gray-500">Net Savings</h3>
                            <p className={`text-2xl font-bold mt-2 ${reportData.overall.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${reportData.overall.netSavings.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
                            <p className={`text-2xl font-bold mt-2 ${Number(reportData.overall.savingsRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {reportData.overall.savingsRate}%
                            </p>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
                        <div style={{height: '300px'}}>
                            <ResponsiveContainer>
                                <BarChart data={reportData.monthlySpending}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="month"/>
                                    <YAxis
                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => `$${value.toLocaleString()}`}
                                    />
                                    <Legend/>
                                    <Bar
                                        dataKey="amount"
                                        name="Total Spent"
                                        fill="#0088FE"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Report Footer */}
                <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
                    <p>Report generated on {new Date().toLocaleString()}</p>
                    <p>Analysis based on {reportData.paycheckDetails.length} paychecks</p>
                </div>
            </div>
        </div>
    );
};

export default PaycheckBudgetReport;