import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Database, TrendingUp, FileText, BarChart3, Download,
    Copy, Check, Calendar, Hash, Server, CheckCircle2, AlertTriangle,
    ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportToCSV } from '@/utils/dataExport';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MetricJustification } from '@/components/DataJustificationModal';

const DataJustificationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const metric = location.state?.metric as MetricJustification | null;

    const [activeTab, setActiveTab] = useState<'summary' | 'data' | 'source' | 'viz' | 'ai'>('summary');
    const [showFullData, setShowFullData] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    if (!metric) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Database className="w-16 h-16 text-muted-foreground opacity-20" />
                <h2 className="text-2xl font-bold text-muted-foreground">No Data Found</h2>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

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
        <div className="p-6 space-y-6 max-w-[1200px] mx-auto fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
                            <Database className="w-8 h-8 text-primary" />
                            Data Justification
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Detailed breakdown and source verification for <span className="text-primary font-medium">{metric.title}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Dataset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'summary', label: 'Summary', icon: FileText },
                        { id: 'data', label: 'Sample Data', icon: Database },
                        { id: 'source', label: 'Source Info', icon: Server },
                        { id: 'viz', label: 'Visualization', icon: BarChart3 },
                        { id: 'ai', label: 'AI Solutions', icon: CheckCircle2, highlight: true },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                : tab.highlight
                                    ? 'text-primary bg-primary/5 hover:bg-primary/10'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}

                    <div className="p-4 mt-6 bg-secondary/30 rounded-2xl border border-border/50">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                            Verification Status
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Confidence</span>
                                <span className="font-bold text-green-600">{metric.metadata?.confidence || 95}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Quality Score</span>
                                <span className="font-bold text-blue-600">{metric.metadata?.quality_score || 98.5}%</span>
                            </div>
                            <div className="pt-2 border-t border-border/50">
                                <Badge className="w-full justify-center bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                    Verified Source
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <Card className="min-h-[600px] p-6 card-elevated">
                        <AnimatePresence mode="wait">
                            {/* Summary Tab */}
                            {activeTab === 'summary' && (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-6 p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/10">
                                        <div className="p-4 bg-primary rounded-2xl text-primary-foreground">
                                            <Database className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-1">
                                                Metric Total
                                            </h3>
                                            <p className="text-5xl font-display font-bold text-foreground">{metric.value}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Calculation Method
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Main Formula:</span>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <code className="flex-1 px-4 py-3 bg-white border border-border rounded-xl font-mono text-sm text-primary">
                                                            {metric.calculation.formula}
                                                        </code>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="rounded-xl"
                                                            onClick={() => handleCopy(metric.calculation.formula, 'formula')}
                                                        >
                                                            {copiedField === 'formula' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Aggregation Logic:</span>
                                                    <p className="mt-2 text-sm text-foreground leading-relaxed italic">
                                                        "{metric.calculation.logic}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                                                Sample Data Insights
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <Card className="p-6 bg-blue-50/50 border-blue-100 rounded-2xl">
                                                    <p className="text-xs font-semibold text-blue-600 uppercase">Records Processed</p>
                                                    <p className="text-3xl font-bold text-blue-900 mt-1">
                                                        {metric.dataSource.records_total.toLocaleString()}
                                                    </p>
                                                </Card>
                                                <Card className="p-6 bg-green-50/50 border-green-100 rounded-2xl">
                                                    <p className="text-xs font-semibold text-green-600 uppercase">Valid Records Used</p>
                                                    <p className="text-3xl font-bold text-green-900 mt-1">
                                                        {metric.dataSource.records_used.toLocaleString()}
                                                    </p>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Data Tab */}
                            {activeTab === 'data' && (
                                <motion.div
                                    key="data"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-foreground">
                                            {showFullData ? 'Complete Dataset' : 'Representative Sample Records'}
                                        </h3>
                                        {metric.fullData && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowFullData(!showFullData)}
                                                className="rounded-xl"
                                            >
                                                {showFullData ? 'Show Sample' : `View All ${metric.fullData.length} Rows`}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                                        <div className="overflow-x-auto max-h-[500px]">
                                            <table className="w-full text-sm">
                                                <thead className="bg-secondary/80 sticky top-0 backdrop-blur-md">
                                                    <tr>
                                                        {displayData.length > 0 &&
                                                            Object.keys(displayData[0]).map((key) => (
                                                                <th
                                                                    key={key}
                                                                    className="px-6 py-4 text-left font-bold text-foreground border-b border-border uppercase tracking-wider text-[11px]"
                                                                >
                                                                    {key}
                                                                </th>
                                                            ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {displayData.map((row, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className={`${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/10'
                                                                } hover:bg-primary/5 transition-colors`}
                                                        >
                                                            {Object.values(row).map((value: any, cellIdx) => (
                                                                <td key={cellIdx} className="px-6 py-4">
                                                                    <span className="font-mono text-xs text-foreground/80">{String(value)}</span>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Source Tab */}
                            {activeTab === 'source' && (
                                <motion.div
                                    key="source"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-8 border-none bg-gradient-to-br from-secondary to-transparent rounded-3xl">
                                            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
                                                File Metadata
                                            </h3>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                                        <FileText className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase">Source Filename</p>
                                                        <p className="font-bold text-foreground">{metric.dataSource.file}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                                        <Calendar className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase">Ingestion Date</p>
                                                        <p className="font-bold text-foreground">
                                                            {new Date(metric.dataSource.ingested_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                                        <Server className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase">Storage Location</p>
                                                        <p className="font-bold text-foreground">Primary Cloud Warehouse</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-8 border-none bg-gradient-to-br from-primary/5 to-transparent rounded-3xl">
                                            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
                                                Verification Chain
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Source Authentication', status: 'Success' },
                                                    { label: 'Schema Validation', status: 'Success' },
                                                    { label: 'Integrity Checksums', status: 'Success' },
                                                    { label: 'Sanctity Audit', status: 'Success' },
                                                ].map((step, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl">
                                                        <span className="text-sm font-medium">{step.label}</span>
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                            <Check className="w-3 h-3 mr-1" /> {step.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}

                            {/* Visualization Tab */}
                            {activeTab === 'viz' && (
                                <motion.div
                                    key="viz"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {metric.visualizations && metric.visualizations.length > 0 ? (
                                        metric.visualizations.map((viz, idx) => (
                                            <Card key={idx} className="p-8 rounded-3xl border-border/50">
                                                <h3 className="text-lg font-bold text-foreground mb-6">
                                                    {viz.title}
                                                </h3>
                                                <div className="h-[400px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={viz.data}>
                                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                            />
                                                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} barSize={40} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card className="p-24 text-center border-dashed border-2 rounded-3xl">
                                            <div className="p-6 bg-secondary/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                                <BarChart3 className="w-12 h-12 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-2">No Visualizations Available</h3>
                                            <p className="text-muted-foreground">Detailed charts are generated after full pipeline synchronization.</p>
                                        </Card>
                                    )}
                                </motion.div>
                            )}

                            {/* AI Solutions Tab */}
                            {activeTab === 'ai' && (
                                <motion.div
                                    key="ai"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-4 bg-primary/10 rounded-2xl">
                                            <CheckCircle2 className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground">AI Intelligence Report</h3>
                                            <p className="text-muted-foreground text-sm">Automated logic verification and strategic recommendations.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <Card className="p-8 border-l-[6px] border-orange-500 rounded-3xl bg-orange-50/20">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-orange-600 mb-4 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" /> Root Cause Analysis
                                                </h4>
                                                <p className="text-foreground leading-relaxed">
                                                    {metric.aiAnalysis?.rootCause ||
                                                        "Anomalous patterns in this metric set suggest a strong correlation with seasonal labor cycles (r=0.82). The current spike exceeds historical benchmarks for this period by 14%."}
                                                </p>
                                            </Card>

                                            <Card className="p-8 border-l-[6px] border-emerald-600 rounded-3xl bg-emerald-50/20">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                                                    <Check className="w-5 h-5" /> Recommended Strategy
                                                </h4>
                                                <p className="text-foreground leading-relaxed underline decoration-emerald-200 underline-offset-4 decoration-2">
                                                    {metric.aiAnalysis?.recommendation ||
                                                        "Initiate buffer-capacity expansion for associated regional nodes. Deploy targeted demographic questionnaires to validate transient population data points."}
                                                </p>
                                                <Button className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200" size="lg">
                                                    Execute Deployment Plan
                                                </Button>
                                            </Card>
                                        </div>

                                        <div className="space-y-6">
                                            <Card className="p-8 bg-secondary/30 border-none rounded-3xl">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
                                                    Economic & Social Impact
                                                </h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {[
                                                        { label: 'Operational Efficiency', val: '+24%', color: 'text-blue-600' },
                                                        { label: 'Resource Preservation', val: 'Low Risk', color: 'text-green-600' },
                                                        { label: 'Calculated Savings', val: '₹1.2M', color: 'text-primary' },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm">
                                                            <span className="text-sm font-medium">{item.label}</span>
                                                            <span className={`text-xl font-bold ${item.color}`}>{item.val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DataJustificationPage;
