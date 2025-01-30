import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Force desktop styles for PDF generation
const applyPrintStyles = (element) => {
    // Save original styles
    const originalStyles = {
        position: element.style.position,
        width: element.style.width,
        height: element.style.height,
        overflow: element.style.overflow,
        maxWidth: element.style.maxWidth
    };

    // Force desktop layout
    const styleSheet = document.createElement('style');
    styleSheet.id = 'pdf-styles';
    styleSheet.textContent = `
        /* Force desktop layout */
        .grid { 
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        
        /* Force desktop text sizes */
        .text-sm { font-size: 0.875rem !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-xl { font-size: 1.25rem !important; }
        .text-2xl { font-size: 1.5rem !important; }
        .text-3xl { font-size: 1.875rem !important; }
        
        /* Force margins and padding */
        .mt-12 { margin-top: 3rem !important; }
        .mb-6 { margin-bottom: 1.5rem !important; }
        .p-6 { padding: 1.5rem !important; }
        .gap-6 { gap: 1.5rem !important; }
        
        /* Force colors */
        .bg-white { background-color: #ffffff !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-gray-600 { color: #4B5563 !important; }
        .text-gray-500 { color: #6B7280 !important; }
        
        /* Force shadows and borders */
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }
        .rounded-lg { border-radius: 0.5rem !important; }
        
        /* Force flexbox layouts */
        .flex { display: flex !important; }
        .flex-col { flex-direction: column !important; }
        .items-center { align-items: center !important; }
        .justify-between { justify-content: space-between !important; }
        
        /* Force specific widths */
        .w-full { width: 100% !important; }
        
        /* Image specific styles */
        .image-gallery img {
            max-height: 300px !important;
            width: auto !important;
            margin: 0 auto !important;
            object-fit: contain !important;
        }
        
        /* Chart specific styles */
        .recharts-wrapper {
            width: 100% !important;
            height: 300px !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // Apply fixed positioning and width for capture
    element.style.position = 'absolute';
    element.style.width = '210mm'; // A4 width
    element.style.maxWidth = '210mm';
    element.style.height = 'auto';
    element.style.overflow = 'visible';

    return () => {
        // Cleanup function to restore original styles
        Object.assign(element.style, originalStyles);
        document.head.removeChild(styleSheet);
    };
};

const handlePrint = async (content, onPrint, showToast) => {
    if (!content) return;

    onPrint(true);
    try {
        // Set up PDF document
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Apply print styles and get cleanup function
        const cleanup = applyPrintStyles(content);

        // Force layout recalculation
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get total height after layout adjustments
        const totalHeight = content.scrollHeight;
        const totalPages = Math.ceil(totalHeight / (pageHeight * 3.779527559)); // Convert mm to pixels

        // Capture each page
        for (let page = 0; page < totalPages; page++) {
            // Add new page if not first page
            if (page > 0) {
                pdf.addPage();
            }

            // Calculate capture area
            const captureHeight = pageHeight * 3.779527559; // Convert mm to pixels
            const yPosition = page * captureHeight;

            // Set temporary height for current section
            content.style.height = `${captureHeight}px`;
            content.style.top = `-${yPosition}px`;

            // Capture the current page section with improved settings
            const canvas = await html2canvas(content, {
                scale: 2, // Higher scale for better quality
                logging: false,
                windowHeight: captureHeight,
                y: yPosition,
                height: Math.min(captureHeight, totalHeight - yPosition),
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                removeContainer: true, // Cleanup temporary elements
                letterRendering: true, // Improve text rendering
            });

            // Add to PDF with improved image handling
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        }

        // Cleanup styles
        cleanup();

        // Save the PDF
        pdf.save('budget-report.pdf');
        showToast('success', 'PDF report generated successfully');

    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('error', 'Failed to generate PDF report');
    } finally {
        onPrint(false);
    }
};

export default handlePrint;