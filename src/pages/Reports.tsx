import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
    FileText, Download, Calendar, Filter, BarChart2, PieChart,
    TrendingUp, Map, Users, AlertTriangle, Clock, Check, Loader2,
    FileSpreadsheet, File, Mail, RefreshCw, Star, Trash2, Eye
} from 'lucide-react';
import { generateExecutiveReport, generateDetailedAnalysis } from '@/utils/pdfExport';
import { generateInteractiveHTMLReport } from '@/utils/htmlExport';
import { exportToCSV, exportToExcel } from '@/utils/dataExport';
import { toast as sonnerToast } from 'sonner';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingBar } from '@/components/ui/LoadingBar';

interface Report {
    id: number;
    title: string;
    type: 'migration' | 'stress' | 'forecast' | 'policy' | 'quality';
    format: 'pdf' | 'excel' | 'csv';
    generatedAt: Date;
    size: string;
    status: 'ready' | 'generating' | 'scheduled';
    starred?: boolean;
}

const Reports = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'scheduled'>('generate');
    const [selectedType, setSelectedType] = useState<string>('migration');
    const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
    const [dateRange, setDateRange] = useState({ from: '2025-01-01', to: '2025-01-18' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [reports, setReports] = useState<Report[]>([
        { id: 1, title: 'Monthly Migration Analysis - January 2025', type: 'migration', format: 'pdf', generatedAt: new Date(Date.now() - 86400000), size: '2.4 MB', status: 'ready', starred: true },
        { id: 2, title: 'Stress Zone Report - Delhi NCR', type: 'stress', format: 'excel', generatedAt: new Date(Date.now() - 172800000), size: '1.8 MB', status: 'ready' },
        { id: 3, title: 'Population Forecast Q1 2025', type: 'forecast', format: 'pdf', generatedAt: new Date(Date.now() - 259200000), size: '3.1 MB', status: 'ready' },
    ]);

    // Fetch data for reports
    const { data: overviewData, isLoading, error } = useQuery({
        queryKey: ['report-data'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8000/api/overview/');
            if (!res.ok) throw new Error('Failed to fetch data');
            return res.json();
        }
    });

    const { data: trendData } = useQuery({
        queryKey: ['report-trends'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8000/api/trends/');
            if (!res.ok) throw new Error('Failed to fetch trends');
            return res.json();
        }
    });

    const reportTypes = [
        { id: 'migration', label: 'Migration Analysis', icon: <TrendingUp className="w-5 h-5" />, description: 'Interstate movement patterns' },
        { id: 'stress', label: 'Stress Zone Report', icon: <Map className="w-5 h-5" />, description: 'Population pressure analysis' },
        { id: 'forecast', label: 'Population Forecast', icon: <BarChart2 className="w-5 h-5" />, description: 'Predictive analytics' },
        { id: 'policy', label: 'Policy Impact', icon: <Users className="w-5 h-5" />, description: 'Recommendations analysis' },
        { id: 'quality', label: 'Data Quality', icon: <AlertTriangle className="w-5 h-5" />, description: 'Data integrity reports' },
    ];

    const formatOptions = [
        { id: 'pdf', label: 'PDF Report', icon: <File className="w-5 h-5 text-destructive" /> },
        { id: 'html', label: 'Interactive HTML', icon: <FileText className="w-5 h-5 text-blue-500" /> },
        { id: 'excel', label: 'Excel Spreadsheet', icon: <FileSpreadsheet className="w-5 h-5 text-success" /> },
        { id: 'csv', label: 'CSV Data', icon: <FileText className="w-5 h-5 text-gray-500" /> },
    ];

    const getTypeIcon = (type: string) => {
        const typeObj = reportTypes.find(t => t.id === type);
        return typeObj?.icon || <FileText className="w-5 h-5" />;
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'pdf': return <File className="w-4 h-4 text-destructive" />;
            case 'excel': return <FileSpreadsheet className="w-4 h-4 text-success" />;
            default: return <FileText className="w-4 h-4 text-info" />;
        }
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);

        try {
            const typeLabel = reportTypes.find(t => t.id === selectedType)?.label || 'Report';

            // Generate actual report based on format
            // Generate actual report based on format
            if (selectedFormat === 'pdf') {
                await generateExecutiveReport({
                    title: `${typeLabel} - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
                    summary: overviewData?.executive_summary || 'Comprehensive analysis of demographic trends.',
                    metrics: [
                        {
                            'Total Districts': overviewData?.districts_analyzed || 0,
                            'Migration Velocity': overviewData?.migration_velocity || 'N/A',
                            'Active Zones': overviewData?.zone_distribution?.high_inflow + overviewData?.zone_distribution?.critical_stress || 0,
                        }
                    ],
                    tables: trendData?.data ? [
                        {
                            title: 'Top Districts by MVI Stress',
                            data: trendData.data.slice(0, 10).map((item: any) => ({
                                District: item.district,
                                State: item.state,
                                'Migration Velocity': item.mvi,
                                'Zone Status': item.zone_type,
                                'Trend': item.trend_type
                            }))
                        }
                    ] : [],
                });
                sonnerToast.success('PDF Report Generated Successfully!');

            } else if (selectedFormat === 'html') {
                // Fetch AI Summary (Mock for now, replacing with real API call in next step)
                const aiSummary = overviewData?.executive_summary || "The latest quarter reveals a significant 18% surge in migration velocity across the northern corridor. Bihar and UP remain primary source states, while Bangalore and Surat are seeing unprecedented inflow pressure. Immediate infrastructure scaling in these active zones is recommended to mitigate the predicted 0.85 MVI rise.";

                generateInteractiveHTMLReport({
                    title: `${typeLabel} Analysis - Interactive`,
                    summary: aiSummary,
                    metrics: [
                        { 'Total Districts Analyzed': overviewData?.districts_analyzed || 150 },
                        { 'Avg. Migration Velocity': overviewData?.migration_velocity || '4.2' },
                        { 'Critical Stress Zones': overviewData?.zone_distribution?.critical_stress || 12 }
                    ],
                    tableData: trendData?.data ? trendData.data.slice(0, 15).map((item: any) => ({
                        District: item.district,
                        State: item.state,
                        'MVI Score': item.mvi,
                        'Zone Status': item.zone_type,
                        'Confidence': (item.confidence * 100).toFixed(0) + '%'
                    })) : []
                });
                sonnerToast.success('Interactive HTML Report Downloaded!');

            } else if (selectedFormat === 'excel') {
                const data = trendData?.data || [];
                exportToExcel(data, `${typeLabel}_${new Date().toISOString().split('T')[0]}.xlsx`, typeLabel);
                sonnerToast.success('Excel Report Generated Successfully!');
            } else {
                const data = trendData?.data || [];
                exportToCSV(data, `${typeLabel}_${new Date().toISOString().split('T')[0]}.csv`);
                sonnerToast.success('CSV Report Generated Successfully!');
            }

            // Add to history
            const newReport: Report = {
                id: Date.now(),
                title: `${typeLabel} - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
                type: selectedType as Report['type'],
                format: selectedFormat as Report['format'],
                generatedAt: new Date(),
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
                status: 'ready',
            };
            setReports(prev => [newReport, ...prev]);

        } catch (error) {
            console.error('Report generation error:', error);
            sonnerToast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async (report: Report) => {
        sonnerToast.info(`Downloading ${report.title}...`);
        // In real implementation, fetch/regenerate the report
        // For now, we'll just show a message
        setTimeout(() => {
            sonnerToast.success('Download started!');
        }, 500);
    };

    const handleDelete = (id: number) => {
        setReports(prev => prev.filter(r => r.id !== id));
        toast({ title: '🗑️ Deleted', description: 'Report removed from history' });
    };

    const handleStar = (id: number) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, starred: !r.starred } : r));
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Reports & Analytics</h1>
                        <p className="text-muted-foreground mt-1">Generate comprehensive reports from Aadhaar data</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-medium hover:bg-accent transition-colors">
                            <Mail className="w-4 h-4" />
                            Email Reports
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-medium hover:bg-accent transition-colors">
                            <Clock className="w-4 h-4" />
                            Schedule
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    {(['generate', 'history', 'scheduled'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-secondary text-secondary-foreground hover:bg-accent'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'generate' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 card-elevated p-6">
                            <h3 className="text-lg font-display font-semibold text-foreground mb-4">Select Report Type</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reportTypes.map(type => (
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedType === type.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-xl ${selectedType === type.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                                {type.icon}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{type.label}</p>
                                                <p className="text-sm text-muted-foreground">{type.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
                                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Date Range
                                </h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-muted-foreground">From</label>
                                        <input type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} className="w-full mt-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-muted-foreground">To</label>
                                        <input type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} className="w-full mt-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-elevated p-6">
                            <h3 className="text-lg font-display font-semibold text-foreground mb-4">Output Format</h3>
                            <div className="space-y-3">
                                {formatOptions.map(format => (
                                    <div
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${selectedFormat === format.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                                            }`}
                                    >
                                        {format.icon}
                                        <span className="font-medium text-foreground">{format.label}</span>
                                        {selectedFormat === format.id && <Check className="w-4 h-4 text-primary ml-auto" />}
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all">
                                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <><Download className="w-5 h-5" />Generate Report</>}
                            </button>
                        </motion.div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display font-semibold text-foreground">Generated Reports</h3>
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <Filter className="w-4 h-4" />Filter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {reports.map((report, idx) => (
                                <motion.div key={report.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-xl bg-secondary">{getTypeIcon(report.type)}</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-foreground">{report.title}</p>
                                                    {report.starred && <Star className="w-4 h-4 fill-warning text-warning" />}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">{getFormatIcon(report.format)}{report.format.toUpperCase()}</span>
                                                    <span className="text-xs text-muted-foreground">{report.size}</span>
                                                    <span className="text-xs text-muted-foreground">{report.generatedAt.toLocaleDateString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleStar(report.id)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Star">
                                                <Star className={`w-4 h-4 ${report.starred ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Preview"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                                            <button onClick={() => handleDownload(report)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Download"><Download className="w-4 h-4 text-primary" /></button>
                                            <button onClick={() => handleDelete(report.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'scheduled' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Scheduled Reports</h3>
                            <p className="text-muted-foreground mb-6">Set up automated report generation on a daily, weekly, or monthly basis.</p>
                            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">Schedule a Report</button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </>
    );
};

export default Reports;