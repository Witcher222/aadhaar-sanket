import * as XLSX from 'xlsx';

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string = 'export.csv') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        downloadFile(csv, filename, 'text/csv;charset=utf-8;');
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw new Error('Failed to export CSV');
    }
};

/**
 * Export data to Excel format (.xlsx)
 */
export const exportToExcel = (
    data: any[],
    filename: string = 'export.xlsx',
    sheetName: string = 'Sheet1'
) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        XLSX.writeFile(workbook, filename);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Failed to export Excel');
    }
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: any[], filename: string = 'export.json') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    try {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, filename, 'application/json;charset=utf-8;');
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        throw new Error('Failed to export JSON');
    }
};

/**
 * Export multiple sheets to Excel
 */
export const exportMultiSheetExcel = (
    sheets: { name: string; data: any[] }[],
    filename: string = 'export.xlsx'
) => {
    if (!sheets || sheets.length === 0) {
        console.warn('No data to export');
        return;
    }

    try {
        const workbook = XLSX.utils.book_new();

        sheets.forEach(({ name, data }) => {
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, name.substring(0, 31)); // Excel limit
        });

        XLSX.writeFile(workbook, filename);
    } catch (error) {
        console.error('Error exporting multi-sheet Excel:', error);
        throw new Error('Failed to export multi-sheet Excel');
    }
};

/**
 * Helper function to trigger file download
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

/**
 * Format data for export (clean up, remove internal fields)
 */
export const formatDataForExport = (data: any[]): any[] => {
    return data.map(item => {
        const cleaned = { ...item };

        // Remove internal/meta fields
        delete cleaned._id;
        delete cleaned.__v;
        delete cleaned.createdAt;
        delete cleaned.updatedAt;

        // Format dates if present
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key] instanceof Date) {
                cleaned[key] = cleaned[key].toISOString().split('T')[0];
            }
        });

        return cleaned;
    });
};
