import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

/**
 * Generate Executive Report PDF
 */
export const generateExecutiveReport = async (
    data: {
        title?: string;
        summary?: string;
        metrics?: any[];
        charts?: string[]; // Element IDs to capture
        tables?: { title: string; data: any[] }[];
    }
) => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPos = 20;

        // Header
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.title || 'Aadhaar Sanket - Executive Report', pageWidth / 2, yPos, {
            align: 'center',
        });
        yPos += 10;

        // Date
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated: ${format(new Date(), 'PPP')}`, pageWidth / 2, yPos, {
            align: 'center',
        });
        yPos += 15;

        // Summary Section
        if (data.summary) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Executive Summary', 15, yPos);
            yPos += 8;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 30);
            pdf.text(summaryLines, 15, yPos);
            yPos += (summaryLines.length * 5) + 10;
        }

        // Key Metrics
        if (data.metrics && data.metrics.length > 0) {
            checkPageBreak(pdf, yPos, 60);

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Key Metrics', 15, yPos);
            yPos += 10;

            const metricHeaders = Object.keys(data.metrics[0]).map(key =>
                key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            );

            autoTable(pdf, {
                startY: yPos,
                head: [metricHeaders],
                body: data.metrics.map(m => Object.values(m)),
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
                bodyStyles: { halign: 'center' },
                margin: { left: 15, right: 15 },
            });

            yPos = (pdf as any).lastAutoTable.finalY + 15;
        }

        // Charts (capture as images)
        if (data.charts && data.charts.length > 0) {
            for (const chartId of data.charts) {
                const element = document.getElementById(chartId);
                if (element) {
                    checkPageBreak(pdf, yPos, 100);

                    const canvas = await html2canvas(element, { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = pageWidth - 30;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, 'PNG', 15, yPos, imgWidth, Math.min(imgHeight, 120));
                    yPos += Math.min(imgHeight, 120) + 15;
                }
            }
        }

        // Tables
        if (data.tables && data.tables.length > 0) {
            for (const table of data.tables) {
                checkPageBreak(pdf, yPos, 60);

                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 0, 0);
                pdf.text(table.title, 15, yPos);
                yPos += 8;

                if (table.data && table.data.length > 0) {
                    const tableHeaders = Object.keys(table.data[0]).map(key =>
                        key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    );

                    autoTable(pdf, {
                        startY: yPos,
                        head: [tableHeaders],
                        body: table.data.map(row => Object.values(row)),
                        theme: 'striped',
                        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', valign: 'middle' },
                        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
                        alternateRowStyles: { fillColor: [241, 245, 249] },
                        margin: { left: 15, right: 15 },
                        columnStyles: {
                            0: { fontStyle: 'bold' } // First column often ID/Key
                        }
                    });

                    yPos = (pdf as any).lastAutoTable.finalY + 15;
                }
            }
        }

        // Footer on last page
        addFooter(pdf, (pdf as any).internal.getNumberOfPages());

        // Save PDF
        pdf.save(`Aadhaar_Sanket_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

        return { success: true };
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF report');
    }
};

/**
 * Generate Detailed Analysis PDF
 */
export const generateDetailedAnalysis = async (
    sections: { title: string; content: string; data?: any[] }[]
) => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPos = 20;

        // Cover Page
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Aadhaar Sanket', pageWidth / 2, 100, { align: 'center' });

        pdf.setFontSize(18);
        pdf.text('Detailed Analysis Report', pageWidth / 2, 115, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(format(new Date(), 'PPPP'), pageWidth / 2, 130, { align: 'center' });

        // Content Sections
        for (const section of sections) {
            pdf.addPage();
            yPos = 20;

            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(section.title, 15, yPos);
            yPos += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const contentLines = pdf.splitTextToSize(section.content, pageWidth - 30);
            pdf.text(contentLines, 15, yPos);
            yPos += (contentLines.length * 5) + 10;

            if (section.data && section.data.length > 0) {
                checkPageBreak(pdf, yPos, 60);

                autoTable(pdf, {
                    startY: yPos,
                    head: [Object.keys(section.data[0])],
                    body: section.data.map(row => Object.values(row)),
                    theme: 'grid',
                    margin: { left: 15, right: 15 },
                });
            }
        }

        // Add page numbers
        const pageCount = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            addFooter(pdf, i);
        }

        pdf.save(`Aadhaar_Sanket_Detailed_Analysis_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

        return { success: true };
    } catch (error) {
        console.error('Error generating detailed PDF:', error);
        throw new Error('Failed to generate detailed analysis PDF');
    }
};

/**
 * Capture a chart/element as image and add to PDF
 */
export const captureChartAsImage = async (elementId: string): Promise<string> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
    });

    return canvas.toDataURL('image/png');
};

/**
 * Helper: Check if page break is needed
 */
const checkPageBreak = (pdf: jsPDF, currentY: number, requiredSpace: number) => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (currentY + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        return 20; // Reset yPos
    }
    return currentY;
};

/**
 * Helper: Add footer to page
 */
const addFooter = (pdf: jsPDF, pageNumber: number) => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);

    pdf.text(
        `Aadhaar Sanket - Demographic Intelligence Dashboard`,
        15,
        pageHeight - 10
    );

    pdf.text(
        `Page ${pageNumber}`,
        pageWidth - 15,
        pageHeight - 10,
        { align: 'right' }
    );

    pdf.setTextColor(0, 0, 0); // Reset color
};
