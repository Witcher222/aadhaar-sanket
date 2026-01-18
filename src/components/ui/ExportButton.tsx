import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToExcel, exportToJSON, formatDataForExport } from '@/utils/dataExport';
import { toast } from 'sonner';

interface ExportButtonProps {
    data: any[];
    filename?: string;
    label?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    cleanData?: boolean;
    disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
    data,
    filename = 'export',
    label = 'Export',
    variant = 'outline',
    size = 'default',
    cleanData = true,
    disabled = false,
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'csv' | 'excel' | 'json') => {
        if (!data || data.length === 0) {
            toast.error('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            const dataToExport = cleanData ? formatDataForExport(data) : data;

            switch (format) {
                case 'csv':
                    exportToCSV(dataToExport, `${filename}.csv`);
                    toast.success(`Exported ${dataToExport.length} rows to CSV`);
                    break;
                case 'excel':
                    exportToExcel(dataToExport, `${filename}.xlsx`);
                    toast.success(`Exported ${dataToExport.length} rows to Excel`);
                    break;
                case 'json':
                    exportToJSON(dataToExport, `${filename}.json`);
                    toast.success(`Exported ${dataToExport.length} items to JSON`);
                    break;
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    disabled={disabled || isExporting || !data || data.length === 0}
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            {label}
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                    Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileJson className="w-4 h-4 mr-2 text-blue-600" />
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
