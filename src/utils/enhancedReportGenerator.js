import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const handlePrint = async (content, onPrint, showToast) => {
    if (!content) return;

    onPrint(true);
    try {
        // Set up PDF document
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Save original styles
        const originalStyle = {
            position: content.style.position,
            width: content.style.width,
            height: content.style.height,
            overflow: content.style.overflow
        };

        // Prepare element for capture
        content.style.position = 'absolute';
        content.style.width = '210mm'; // A4 width
        content.style.height = 'auto';
        content.style.overflow = 'visible';

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

            // Capture the current page section
            const canvas = await html2canvas(content, {
                scale: 2,
                logging: false,
                windowHeight: captureHeight,
                y: yPosition,
                height: Math.min(captureHeight, totalHeight - yPosition)
            });

            // Add to PDF
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        }

        // Restore original styles
        Object.assign(content.style, originalStyle);

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