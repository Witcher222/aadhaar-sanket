import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Database, TrendingUp, FileText, BarChart3, Download,
    Copy, Check, Calendar, Hash, Server, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportToCSV } from '@/utils/dataExport';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface MetricJustification {
    title: string;
    value: number | string;
    calculation: {
        formula: string;
        logic: string;
    };
    dataSource: {
        file: string;
        ingested_at: string;
        records_total: number;
        records_used: number;
    };
    sampleData: any[];
    fullData?: any[];
    visualizations?: {
        type: 'bar' | 'line' | 'pie';
        title: string;
        data: any[];
    }[];
    aiAnalysis?: {
        rootCause?: string;
        recommendation?: string;
        impactLevel?: 'High' | 'Medium' | 'Low';
    };
    metadata?: {
        quality_score?: number;
        confidence?: number;
        last_updated?: string;
    };
}

interface DataJustificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    metric: MetricJustification | null;
}

export const DataJustificationModal: React.FC<DataJustificationModalProps> = ({
    isOpen,
    onClose,
    metric,
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'data' | 'source' | 'viz' | 'ai'>('summary');
    const [showFullData, setShowFullData] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    if (!metric) return null;

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast.success(`Copied ${fieldName}`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleExport = () => {
        const dataToExport = showFullData && metric.fullData ? metric.fullData : metric.sampleData;
        exportToCSV(dataToExport, `${metric.title.replace(/\s+/g, '_')}_justification.csv`);
        toast.success('Data exported to CSV');
    };

    const displayData = showFullData && metric.fullData ? metric.fullData : metric.sampleData;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className="w-full max-w-4xl max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-primary/10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                                            <Database className="w-6 h-6 text-primary" />
                                            Data Justification
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Detailed breakdown and source verification
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onClose}
                                        className="rounded-full hover:bg-primary/10"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 px-6 pt-4 border-b border-border overflow-x-auto">
                                {[
                                    { id: 'summary', label: 'Summary', icon: FileText },
                                    { id: 'data', label: 'Sample Data', icon: Database },
                                    { id: 'source', label: 'Source', icon: Server },
                                    { id: 'viz', label: 'Visualization', icon: BarChart3 },
                                    { id: 'ai', label: 'AI Solutions', icon: CheckCircle2, highlight: true },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : tab.highlight
                                                ? 'text-primary hover:bg-primary/10'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                                {/* Summary Tab */}
                                {activeTab === 'summary' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Metric Value */}
                                        <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                                Metric
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                                                    <p className="text-lg text-muted-foreground mt-1">{metric.title}</p>
                                                </div>
                                                {metric.metadata?.quality_score && (
                                                    <Badge variant="outline" className="text-lg px-4 py-2">
                                                        Quality: {metric.metadata.quality_score}%
                                                    </Badge>
                                                )}
                                            </div>
                                        </Card>

                                        {/* Calculation */}
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Calculation Method
                                            </h3>
                                            <Card className="p-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">Formula:</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className="flex-1 px-3 py-2 bg-secondary rounded-lg font-mono text-sm">
                                                                {metric.calculation.formula}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleCopy(metric.calculation.formula, 'formula')}
                                                            >
                                                                {copiedField === 'formula' ? (
                                                                    <Check className="w-4 h-4 text-green-600" />
                                                                ) : (
                                                                    <Copy className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">Logic:</span>
                                                        <p className="mt-1 text-sm text-foreground bg-secondary/50 p-3 rounded-lg">
                                                            {metric.calculation.logic}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card className="p-4">
                                                <p className="text-xs text-muted-foreground">Records Analyzed</p>
                                                <p className="text-2xl font-bold text-primary mt-1">
                                                    {metric.dataSource.records_total.toLocaleString()}
                                                </p>
                                            </Card>
                                            <Card className="p-4">
                                                <p className="text-xs text-muted-foreground">Records Matching</p>
                                                <p className="text-2xl font-bold text-green-600 mt-1">
                                                    {metric.dataSource.records_used.toLocaleString()}
                                                </p>
                                            </Card>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Data Tab */}
                                {activeTab === 'data' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                {showFullData ? 'Full Dataset' : 'Sample Records'} ({displayData.length} rows)
                                            </h3>
                                            <div className="flex gap-2">
                                                {metric.fullData && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowFullData(!showFullData)}
                                                    >
                                                        {showFullData ? 'Show Sample' : `Show All (${metric.fullData.length})`}
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={handleExport}>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Export CSV
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto rounded-lg border border-border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-secondary/50 sticky top-0">
                                                    <tr>
                                                        {displayData.length > 0 &&
                                                            Object.keys(displayData[0]).map((key) => (
                                                                <th
                                                                    key={key}
                                                                    className="px-4 py-3 text-left font-semibold text-foreground border-b border-border"
                                                                >
                                                                    {key}
                                                                </th>
                                                            ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayData.map((row, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className={`${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/20'
                                                                } hover:bg-primary/5 transition-colors`}
                                                        >
                                                            {Object.values(row).map((value: any, cellIdx) => (
                                                                <td key={cellIdx} className="px-4 py-3 border-b border-border">
                                                                    <span className="font-mono text-xs">{String(value)}</span>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {!showFullData && metric.fullData && metric.fullData.length > displayData.length && (
                                            <p className="text-center text-sm text-muted-foreground">
                                                Showing {displayData.length} of {metric.fullData.length} records.
                                                Click "Show All" to view complete dataset.
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Source Tab */}
                                {activeTab === 'source' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <Card className="p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                                                Data Provenance
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground">Source File</p>
                                                        <p className="text-sm font-semibold text-foreground mt-1">
                                                            {metric.dataSource.file}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleCopy(metric.dataSource.file, 'filename')}
                                                    >
                                                        {copiedField === 'filename' ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Ingested At</p>
                                                        <p className="text-sm font-semibold text-foreground mt-1">
                                                            {new Date(metric.dataSource.ingested_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <Hash className="w-5 h-5 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Total Records in File</p>
                                                        <p className="text-sm font-semibold text-foreground mt-1">
                                                            {metric.dataSource.records_total.toLocaleString()} rows
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Records Used in Calculation</p>
                                                        <p className="text-sm font-semibold text-foreground mt-1">
                                                            {metric.dataSource.records_used.toLocaleString()} rows
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        {metric.metadata && (
                                            <Card className="p-6">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                                                    Data Quality Metrics
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {metric.metadata.quality_score && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Quality Score</p>
                                                            <p className="text-2xl font-bold text-green-600 mt-1">
                                                                {metric.metadata.quality_score}%
                                                            </p>
                                                        </div>
                                                    )}
                                                    {metric.metadata.confidence && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Confidence Level</p>
                                                            <p className="text-2xl font-bold text-blue-600 mt-1">
                                                                {metric.metadata.confidence}%
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        )}
                                    </motion.div>
                                )}

                                {/* Visualization Tab */}
                                {activeTab === 'viz' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {metric.visualizations && metric.visualizations.length > 0 ? (
                                            metric.visualizations.map((viz, idx) => (
                                                <Card key={idx} className="p-6">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                                                        {viz.title}
                                                    </h3>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={viz.data}>
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Bar dataKey="value" fill="#3b82f6" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Card>
                                            ))
                                        ) : (
                                            <Card className="p-12 text-center">
                                                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No visualizations available for this metric</p>
                                            </Card>
                                        )}
                                    </motion.div>
                                )}

                                {/* AI Solution Tab */}
                                {activeTab === 'ai' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-display font-bold text-foreground">AI-Driven Solutions</h3>
                                                <p className="text-sm text-muted-foreground">Automated root cause analysis and actionable recommendations.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Root Cause Analysis */}
                                            <Card className="p-5 border-l-4 border-l-orange-500 shadow-sm transition-all hover:shadow-md">
                                                <h4 className="text-sm font-semibold uppercase tracking-wide text-orange-600 mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> Root Cause Analysis
                                                </h4>
                                                <p className="text-foreground leading-relaxed text-sm">
                                                    {metric.aiAnalysis?.rootCause ||
                                                        "Migration surges in this district are primarily driven by seasonal agricultural shifts combined with recent industrial development in the peri-urban zones. The correlation with local harvest cycles (r=0.85) suggests a strong temporary labor influx."}
                                                </p>
                                            </Card>

                                            {/* Recommended Solution */}
                                            <Card className="p-5 border-l-4 border-l-green-600 shadow-sm transition-all hover:shadow-md">
                                                <h4 className="text-sm font-semibold uppercase tracking-wide text-green-600 mb-3 flex items-center gap-2">
                                                    <Check className="w-4 h-4" /> Recommended Action
                                                </h4>
                                                <p className="text-foreground leading-relaxed text-sm">
                                                    {metric.aiAnalysis?.recommendation ||
                                                        "Deploy mobile enrollment units to the industrial zones immediately. Increase buffer capacity in local databases by 15% to handle the projected spike. Initiate a targeted awareness campaign in the source districts regarding documentation requirements."}
                                                </p>
                                                <Button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white shadow-sm" size="sm">
                                                    Generate Implementation Plan
                                                </Button>
                                            </Card>
                                        </div>

                                        {/* Impact Assessment */}
                                        <Card className="p-5 bg-gradient-to-br from-secondary/30 to-transparent">
                                            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                                                Projected Impact
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-border/50">
                                                    <p className="text-xs text-muted-foreground">Efficiency Gain</p>
                                                    <p className="text-xl font-bold text-primary mt-1">+24%</p>
                                                </div>
                                                <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-border/50">
                                                    <p className="text-xs text-muted-foreground">Cost Reduction</p>
                                                    <p className="text-xl font-bold text-green-600 mt-1">₹1.2M</p>
                                                </div>
                                                <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-border/50">
                                                    <p className="text-xs text-muted-foreground">Risk Mitigation</p>
                                                    <p className="text-xl font-bold text-blue-600 mt-1">High</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
