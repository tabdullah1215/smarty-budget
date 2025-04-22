import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateReportHtml } from './htmlReportGenerator';
import authService from '../services/authService';
import { withMinimumDelay } from './withDelay';

/**
 * Generates a PDF report directly from selected budgets without using React components
 * @param {Array} selectedBudgets - Array of budget objects
 * @param {Function} showToast - Function to display toast notifications
 * @param {Function} loadingCallback - Optional callback to update the loading state in the UI
 * @returns {Promise<boolean>} True if the PDF was generated successfully
 */
export const generatePdfReport = async (selectedBudgets, showToast, loadingCallback = () => {}) => {
    try {
        // If no budgets, don't proceed
        if (!selectedBudgets || selectedBudgets.length === 0) {
            showToast('error', 'Please select at least one budget to generate a report');
            return false;
        }

        loadingCallback(true);

        // Get user info for the report
        const userInfo = authService.getUserInfo();

        // Determine budget type for appropriate filename
        const isBusinessBudget = selectedBudgets.length > 0 &&
            selectedBudgets[0].hasOwnProperty('projectName');

        // Generate HTML content for the report
        const htmlContent = generateReportHtml(selectedBudgets, userInfo);

        // Create an invisible iframe to completely isolate the rendering
        const iframe = document.createElement('iframe');

        // Set styles to make the iframe invisible but available for document operations
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm'; // A4 width
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.setAttribute('tabindex', '-1');

        // Add the iframe to the DOM
        document.body.appendChild(iframe);

        // Wait for iframe to initialize
        await new Promise(resolve => {
            iframe.onload = resolve;
            setTimeout(resolve, 100); // Fallback timeout
        });

        // Get the iframe document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Write the HTML content to the iframe document
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Wait for fonts and styles to load properly in the iframe
        await new Promise(resolve => setTimeout(resolve, 800));

        // Setup the PDF document
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Determine the needed dimensions
        const contentElement = iframeDoc.body;
        const contentHeight = contentElement.scrollHeight;
        const contentWidth = contentElement.scrollWidth;
        const totalPages = Math.ceil(contentHeight / (pageHeight * 3.779527559)); // Convert mm to pixels

        // Log generation start
        console.log(`Starting PDF generation with ${totalPages} estimated pages`);
        showToast('info', `Preparing ${totalPages} page PDF...`);

        // Capture and add each page
        for (let page = 0; page < totalPages; page++) {
            // Add new page if not first page
            if (page > 0) {
                pdf.addPage();
            }

            // Calculate capture area for this page
            const captureHeight = pageHeight * 3.779527559; // Convert mm to pixels
            const yPosition = page * captureHeight;

            // Capture the current page section
            const canvas = await html2canvas(contentElement, {
                scale: 2, // Higher scale for better quality
                logging: false,
                windowHeight: captureHeight,
                y: yPosition,
                height: Math.min(captureHeight, contentHeight - yPosition),
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                removeContainer: true,
                letterRendering: true,
                // Use iframe's window to avoid affecting the main window
                windowWidth: contentWidth,
                width: contentWidth
            });

            // Add to PDF
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

            // Update progress if many pages
            if (totalPages > 2 && page < totalPages - 1) {
                showToast('info', `Generating PDF: page ${page + 1}/${totalPages}`);
            }
        }

        // Save the PDF with filename based on budget type and date
        const filename = isBusinessBudget
            ? `business-expense-report-${new Date().toISOString().split('T')[0]}.pdf`
            : `budget-report-${new Date().toISOString().split('T')[0]}.pdf`;

        pdf.save(filename);

        // Cleanup - remove the iframe
        document.body.removeChild(iframe);

        showToast('success', `PDF report generated successfully (${totalPages} pages)`);
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('error', 'Failed to generate PDF report: ' + (error.message || 'Unknown error'));
        return false;
    } finally {
        loadingCallback(false);
    }
};

export default generatePdfReport;