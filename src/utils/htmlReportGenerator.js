import _ from 'lodash';

/**
 * Generates HTML string for the report content based on budget data
 * @param {Array} budgets - Array of budget objects
 * @param {Object} userInfo - User information object
 * @returns {string} - HTML string for the report
 */
export const generateReportHtml = (budgets, userInfo) => {
    // Process data
    const reportData = processReportData(budgets);

    // Determine if first budget is a business budget
    const isBusinessBudget = budgets.length > 0 && 'projectName' in budgets[0];

    // Check if a budget is a business budget with no meaningful limit
    const hasBudgetLimit = (budget) => {
        // If it has a projectName property, it's a business budget
        if (budget.projectName) {
            return budget.amount > 0;
        }
        // Otherwise it's a paycheck budget which always has a limit
        return true;
    };

    // Format currency amounts
    const formatCurrency = (amount, budgetType, budgetHasLimit) => {
        // Special case for business budgets with no limit
        if (budgetType === 'business' && !budgetHasLimit) {
            return 'Not Set';
        }
        return '$' + amount.toLocaleString();
    };

    // Format dates
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // CSS styles for the report
    const styles = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        color: #333;
        background: white;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 210mm;
        margin: 0 auto;
        padding: 20px;
      }
      .report-header {
        margin-bottom: 30px;
      }
      h1 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #1f2937;
      }
      h2 {
        font-size: 20px;
        font-weight: bold;
        margin-top: 25px;
        margin-bottom: 15px;
        color: #1f2937;
      }
      h3 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #1f2937;
      }
      .info-box {
        background-color: #f9fafb;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      .meta-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
      }
      .section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }
      .paycheck-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 15px;
      }
      .summary-box {
        background-color: #f9fafb;
        padding: 12px;
        border-radius: 6px;
      }
      .summary-label {
        font-size: 12px;
        color: #6b7280;
      }
      .summary-value {
        font-size: 16px;
        font-weight: bold;
      }
      .positive {
        color: #10b981;
      }
      .negative {
        color: #ef4444;
      }
      .not-applicable {
        color: #6b7280;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th {
        background-color: #f9fafb;
        text-align: left;
        padding: 10px;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        border-bottom: 1px solid #e5e7eb;
      }
      td {
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 14px;
      }
      .text-right {
        text-align: right;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .category-list {
        margin-bottom: 15px;
      }
      .category-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .footer {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #6b7280;
      }
      .chart-container {
        height: 250px;
        width: 100%;
        margin-bottom: 20px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      }
      .stat-box {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 15px;
      }
      .image-gallery {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-top: 20px;
      }
      .image-item {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 15px;
        break-inside: avoid;
      }
      .image-container {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }
      .receipt-image {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
        border-radius: 4px;
        border: 1px solid #e5e7eb;
      }
      .image-details {
        font-size: 12px;
        color: #6b7280;
      }
      .image-amount {
        font-weight: bold;
        font-size: 16px;
        color: #111827;
      }
      .category-tag {
        display: inline-block;
        background-color: #e5e7eb;
        color: #4b5563;
        font-size: 11px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 9999px;
        margin-bottom: 6px;
      }
      .pie-chart {
        height: 250px;
        width: 100%;
        position: relative;
      }
      .pie-slice {
        position: absolute;
        width: 100%;
        height: 100%;
        clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
        transform-origin: 50% 50%;
      }
      .bar-chart {
        display: flex;
        height: 200px;
        align-items: flex-end;
        justify-content: space-around;
        margin-top: 20px;
      }
      .bar {
        background-color: #3b82f6;
        width: 30px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        position: relative;
      }
      .bar-label {
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: #6b7280;
        text-align: center;
        white-space: nowrap;
      }
      .bar-value {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: #6b7280;
        text-align: center;
      }
      
     .image-gallery-section {
      page-break-before: always;
      page-break-after: auto;
    }
    
    .image-gallery-page {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    .image-gallery {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    
    .image-item {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 15px;
      break-inside: avoid;
    }
    
.image-gallery-section {
  page-break-before: always !important;
  break-before: page !important;
  display: block !important;
  position: relative !important;
}

.image-gallery-section::before {
  content: "";
  display: block !important;
  height: 1px !important;
  page-break-before: always !important;
  break-before: page !important;
}
      
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .image-gallery-section {
    page-break-before: always !important;
  }
  
  .image-gallery-page {
    page-break-before: always !important;
    page-break-inside: avoid !important;
  }
  
  .category-analysis {
    page-break-before: always !important;
    page-break-inside: avoid !important;
  }
  
  .overall-analysis {
    page-break-before: always !important;
    page-break-inside: avoid !important;
  }
  
  .paycheck-section {
    page-break-inside: auto;
  }
  
  .paycheck-card {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
      
    </style>
  `;

    // Generate payment details HTML
    const generatePaycheckDetailsHtml = () => {
        return reportData.paycheckDetails.map((budget, index) => {
            const budgetHasLimit = hasBudgetLimit(budgets[index]);

            return `
      <div class="paycheck-card">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">
          <h3>${budget.name}</h3>
          <p style="color: #6b7280;">Date: ${formatDate(budget.date)}</p>
          ${budgets[index].projectName ? `<p style="color: #6b7280;">Client: ${budgets[index].client || 'None'}</p>` : ''}
        </div>
        
        <div class="summary-grid">
          <div class="summary-box">
            <p class="summary-label">${isBusinessBudget ? 'Budget Limit' : 'Amount'}</p>
            <p class="summary-value">${formatCurrency(budget.amount, isBusinessBudget ? 'business' : 'paycheck', budgetHasLimit)}</p>
          </div>
          <div class="summary-box">
            <p class="summary-label">Total Spent</p>
            <p class="summary-value">${formatCurrency(budget.totalSpent)}</p>
          </div>
          <div class="summary-box">
            <p class="summary-label">Remaining</p>
            ${budgetHasLimit ?
                `<p class="summary-value ${budget.remaining >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(budget.remaining)}
              </p>` :
                `<p class="summary-value not-applicable">N/A</p>`
            }
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${budget.items.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${item.description || ''}</td>
                <td>${item.date}</td>
                <td class="text-right">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}).join('');
    };

    // Generate category analysis HTML with pie chart
    const generateCategoryAnalysisHtml = () => {
        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#4ECDC4', '#45B7D1'];

        // Prepare SVG pie chart
        const totalAmount = reportData.categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
        let startAngle = 0;
        const radius = 100;
        const centerX = 110;
        const centerY = 110;

        // Create SVG pie chart paths
        const pieSlices = reportData.categoryTotals.map((category, index) => {
            const percentage = (category.total / totalAmount) * 100;
            const angle = (percentage / 100) * 360;
            const color = colors[index % colors.length];

            // Calculate start and end points
            const endAngle = startAngle + angle;

            // Convert angles to radians
            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;

            // Calculate points
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            // Determine the large-arc-flag
            const largeArcFlag = angle > 180 ? 1 : 0;

            // Create SVG path
            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            // Update start angle for next slice
            startAngle = endAngle;

            return `<path d="${pathData}" fill="${color}" />`;
        }).join('');

        // Create SVG wrapper
        const svgPieChart = `
    <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
      ${pieSlices}
    </svg>
  `;

        return `
    <div class="grid-2">
      <div class="paycheck-card">
        <h3>Spending by Category</h3>
        <div class="category-list">
          ${reportData.categoryTotals.map((category, index) => `
            <div class="category-item">
              <span>
                <span style="display: inline-block; width: 12px; height: 12px; background-color: ${colors[index % colors.length]}; margin-right: 8px; border-radius: 2px;"></span>
                ${category.category}
              </span>
              <span style="font-weight: 600;">${formatCurrency(category.total)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="paycheck-card">
        <h3>Category Distribution</h3>
        <div class="pie-chart" style="display: flex; justify-content: center; align-items: center;">
          ${svgPieChart}
        </div>
      </div>
    </div>
  `;
    };
    // Generate overall analysis HTML with bar chart
    const generateOverallAnalysisHtml = () => {
        // Generate a simple bar chart for monthly spending
        const maxAmount = Math.max(...reportData.monthlySpending.map(m => m.amount));

        const barChart = `
      <div class="bar-chart">
        ${reportData.monthlySpending.map(month => {
            const heightPercentage = (month.amount / maxAmount) * 100;
            return `
            <div class="bar" style="height: ${heightPercentage}%;">
              <div class="bar-label">${month.month}</div>
              <div class="bar-value">${formatCurrency(month.amount)}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

        // For business budgets without limits, handle differently
        const hasMeaningfulBudgetLimit = isBusinessBudget ?
            budgets.some(hasBudgetLimit) : true;

        return `
      <div class="stats-grid">
        <div class="stat-box">
          <p class="summary-label">${isBusinessBudget ? 'Total Budget' : 'Total Income'}</p>
          <p style="font-size: 20px; font-weight: bold;">
            ${formatCurrency(reportData.overall.totalIncome, isBusinessBudget ? 'business' : 'paycheck', hasMeaningfulBudgetLimit)}
          </p>
        </div>
        <div class="stat-box">
          <p class="summary-label">Total Spent</p>
          <p style="font-size: 20px; font-weight: bold;">
            ${formatCurrency(reportData.overall.totalSpent)}
          </p>
        </div>
        <div class="stat-box">
          <p class="summary-label">${isBusinessBudget ? 'Net Balance' : 'Net Savings'}</p>
          ${hasMeaningfulBudgetLimit ?
            `<p style="font-size: 20px; font-weight: bold;" class="${reportData.overall.netSavings >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(reportData.overall.netSavings)}
            </p>` :
            `<p style="font-size: 20px; font-weight: bold;" class="not-applicable">N/A</p>`
        }
        </div>
        <div class="stat-box">
          <p class="summary-label">${isBusinessBudget ? 'Budget Utilization' : 'Savings Rate'}</p>
          ${hasMeaningfulBudgetLimit ?
            `<p style="font-size: 20px; font-weight: bold;" class="${Number(reportData.overall.savingsRate) >= 0 ? 'positive' : 'negative'}">
              ${reportData.overall.savingsRate}%
            </p>` :
            `<p style="font-size: 20px; font-weight: bold;" class="not-applicable">N/A</p>`
        }
        </div>
      </div>
      
      <div class="paycheck-card">
        <h3>Monthly Spending Trend</h3>
        ${barChart}
      </div>
    `;
    };

    // Generate image gallery HTML for attached images
    const generateImageGalleryHtml = () => {
        // Get all items with images from all budgets
        const itemsWithImages = [];

        budgets.forEach(budget => {
            const activeItems = budget.items.filter(item => item.isActive && item.image);
            if (activeItems.length > 0) {
                activeItems.forEach(item => {
                    itemsWithImages.push({
                        ...item,
                        budgetName: budget.name,
                        budgetDate: budget.date
                    });
                });
            }
        });

        // If no images, don't show the gallery section
        if (itemsWithImages.length === 0) {
            return '';
        }

        // Group images into pages of 4
        const imagesPerPage = 4;
        const imagePages = [];

        for (let i = 0; i < itemsWithImages.length; i += imagesPerPage) {
            imagePages.push(itemsWithImages.slice(i, i + imagesPerPage));
        }

        // Generate gallery HTML with page breaks
        return `
  <div style="display:block; height:1px; page-break-after:always;"></div>

    <div class="section image-gallery-section">
      <div style="break-before: page; page-break-before: always;"></div>
      <h2>Attached Receipts & Documents</h2>
      
      ${imagePages.map((imagePage, pageIndex) => `
        <!-- Image Gallery Page ${pageIndex + 1} -->
        <div class="image-gallery-page" ${pageIndex > 0 ? 'style="page-break-before: always;"' : ''}>
          <div class="image-gallery">
            ${imagePage.map(item => `
              <div class="image-item">
                <div class="image-container">
                  <img class="receipt-image" src="data:${item.fileType || 'image/jpeg'};base64,${item.image}" alt="Receipt for ${item.description}" />
                </div>
                <div>
                  <span class="category-tag">${item.category}</span>
                  <p class="image-amount">${formatCurrency(item.amount)}</p>
                  <p style="margin-top: 5px; margin-bottom: 5px;">${item.description || 'No description'}</p>
                  <div class="image-details">
                    <div>Expense Date: ${formatDate(item.date)}</div>
                    <div>Paycheck: ${item.budgetName}</div>
                    <div>Paycheck Date: ${formatDate(item.budgetDate)}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
    };

    // Get an appropriate title for the report
    const reportTitle = isBusinessBudget ?
        "Business Expense Analysis Report" :
        "Paycheck Budget Analysis Report";

    // Get appropriate section titles
    const detailsSectionTitle = isBusinessBudget ? "Project Details" : "Paycheck Details";

    // Assemble the full HTML document
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        <!-- Report Header -->
        <div class="report-header">
          <h1>${reportTitle}</h1>
          <div class="info-box">
            <div class="info-grid">
              <div>
                <p class="meta-label">Prepared For</p>
                <p>Email: ${userInfo?.sub || 'Unknown User'}</p>
              </div>
              <div>
                <p class="meta-label">Report Details</p>
                <p>Generated: ${new Date().toLocaleDateString()}</p>
                <p>Period: ${reportData.paycheckDetails.length > 0 ?
        `${formatDate(reportData.paycheckDetails[reportData.paycheckDetails.length - 1].date)} to ${formatDate(reportData.paycheckDetails[0].date)}` :
        'No data available'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Budget Details Section -->
        <div class="paycheck-section section">
          <h2>${detailsSectionTitle}</h2>
          ${generatePaycheckDetailsHtml()}
        </div>
        
        <!-- Category Analysis Section -->
        <div class="category-analysis section">
          <h2>Category Analysis</h2>
          ${generateCategoryAnalysisHtml()}
        </div>
        
        <!-- Overall Analysis Section -->
        <div class="overall-analysis section">
          <h2>Overall Analysis</h2>
          ${generateOverallAnalysisHtml()}
        </div>
        
        <!-- Image Gallery Section -->
        ${generateImageGalleryHtml()}
        
        <!-- Report Footer -->
        <div class="footer">
          <p>Report generated on ${new Date().toLocaleString()}</p>
          <p>Analysis based on ${reportData.paycheckDetails.length} ${isBusinessBudget ? 'projects' : 'paychecks'}</p>
        </div>
      </div>
    </body>
    </html>
  `;

    return htmlContent;
};

/**
 * Process budget data for the report
 * @param {Array} budgets - Array of budget objects
 * @returns {Object} - Processed data for the report
 */
function processReportData(budgets) {
    const paycheckDetails = budgets.map(budget => {
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

    const totalIncome = _.sumBy(paycheckDetails, 'amount');
    const totalSpent = _.sumBy(paycheckDetails, 'totalSpent');
    const netSavings = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0';

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
}

export default generateReportHtml;