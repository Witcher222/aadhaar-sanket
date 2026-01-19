import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, MapPin, Activity, RefreshCw, Sparkles, Loader2, ChevronDown, ChevronUp, Info, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { JustificationButton } from '@/components/ui/JustificationButton';
import { DataJustificationModal, MetricJustification } from '@/components/DataJustificationModal';

interface CriticalAlert {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium';
    category: string;
    region: string;
    impact: Record<string, any>;
    data_justification: string;
    justification_metadata?: MetricJustification;
    affected_count: number;
    timestamp: string;
}

const CriticalAlerts = () => {
    const { toast } = useToast();
    const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [solutions, setSolutions] = useState<Record<string, string>>({});
    const [loadingSolutions, setLoadingSolutions] = useState<Record<string, boolean>>({});

    // Justification Modal State
    const [isJustifyOpen, setIsJustifyOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<MetricJustification | null>(null);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/alerts/critical');
            const data = await response.json();
            setAlerts(data.alerts || []);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load critical alerts', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSolution = async (alertId: string) => {
        if (solutions[alertId]) return;

        setLoadingSolutions(prev => ({ ...prev, [alertId]: true }));
        try {
            const response = await fetch(`http://localhost:8000/api/alerts/critical/${alertId}/solution`);
            const data = await response.json();
            setSolutions(prev => ({ ...prev, [alertId]: data.solution }));
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load AI solution', variant: 'destructive' });
        } finally {
            setLoadingSolutions(prev => ({ ...prev, [alertId]: false }));
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 text-red-600 border-red-500/20 shadow-sm shadow-red-500/5';
            case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-sm shadow-orange-500/5';
            case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-sm shadow-yellow-500/5';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Infrastructure Stress': return <Activity className="w-5 h-5" />;
            case 'Demographic Forecast': return <TrendingUp className="w-5 h-5" />;
            case 'Migration Pattern': return <MapPin className="w-5 h-5" />;
            case 'Trend Instability': return <TrendingUp className="w-5 h-5 text-orange-500" />;
            case 'Statistical Anomaly': return <Activity className="w-5 h-5 text-red-500" />;
            default: return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const toggleExpand = (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            fetchSolution(id);
        }
    };

    const handleJustifyClick = (metadata?: MetricJustification) => {
        if (metadata) {
            setSelectedMetric(metadata);
            setIsJustifyOpen(true);
        } else {
            toast({ title: 'Manual Verification', description: 'Deep data trace for this alert is being re-indexed.', variant: 'default' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg shadow-black/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 animate-pulse">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Systematic Critical Alerts</h1>
                        <p className="text-sm text-muted-foreground font-medium">Data-driven urgency scanner active • Indian Demographic Perimeter</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        LIVE ANALYTICS SCANNER
                    </div>
                    <button
                        onClick={fetchAlerts}
                        disabled={loading}
                        className="p-3 rounded-2xl hover:bg-secondary text-muted-foreground transition-all hover:rotate-180 hover:text-primary active:scale-95"
                        title="Refresh perimeter scan"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Critical Threshold', value: alerts.filter(a => a.severity === 'critical').length, color: 'text-red-600' },
                    { label: 'High Priority Patterns', value: alerts.filter(a => a.severity === 'high').length, color: 'text-orange-600' },
                    { label: 'Active Alerts', value: alerts.length, color: 'text-primary' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card-elevated rounded-3xl p-6 border border-white/50 bg-white/40 backdrop-blur-sm"
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <p className={`text-4xl font-display font-black ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Alerts List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Scanning multidimensional data engines...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {alerts.map((alert, index) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`card-elevated rounded-[2rem] overflow-hidden border-2 transition-all hover:shadow-xl ${expandedId === alert.id ? 'border-primary/20 ring-4 ring-primary/5' : 'border-transparent'}`}
                            >
                                {/* Alert Header */}
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border uppercase ${getSeverityColor(alert.severity)}`}>
                                                    {alert.severity}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                                                    {alert.category}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-display font-extrabold text-foreground leading-tight tracking-tight">{alert.title}</h3>
                                                <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary/60" />
                                                    {alert.region}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-end md:self-start">
                                            {/* JUSTIFICATION BUTTON - The 'i' button requested */}
                                            <button
                                                onClick={() => handleJustifyClick(alert.justification_metadata)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all font-bold text-sm border border-blue-500/20 group"
                                                title="View Systematic Justification"
                                            >
                                                <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Justify
                                            </button>

                                            <button
                                                onClick={() => toggleExpand(alert.id)}
                                                className={`p-3 rounded-2xl transition-all ${expandedId === alert.id ? 'bg-primary text-white shadow-lg' : 'bg-secondary hover:bg-secondary/80'}`}
                                            >
                                                {expandedId === alert.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Impact Metrics - Systematic Grid */}
                                    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {Object.entries(alert.impact).map(([key, value]) => (
                                            <div key={key} className="p-4 bg-secondary/30 rounded-2xl border border-white/50 hover:border-primary/10 transition-colors">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{key.replace('_', ' ')}</p>
                                                <p className="text-sm font-bold text-foreground">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedId === alert.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                            className="border-t border-border bg-gradient-to-b from-transparent to-secondary/10"
                                        >
                                            <div className="p-6 md:p-8 space-y-6">
                                                {/* Data Context Header */}
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 w-fit">
                                                    <Database className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">System Intelligence Context</span>
                                                </div>

                                                {/* Data Justification Quick Info */}
                                                <div className="p-5 rounded-3xl bg-blue-500/[0.03] border border-blue-500/10 relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                                                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Info className="w-3 h-3" /> Data-Backed Justification
                                                    </h4>
                                                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                                                        "{alert.data_justification}"
                                                    </p>
                                                </div>

                                                {/* AI Solution Section */}
                                                <div className="p-6 md:p-8 bg-gradient-to-br from-primary/[0.02] to-primary/[0.08] rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                                                    <div className="absolute top-[-20px] right-[-20px] p-8 bg-primary/5 rounded-full blur-3xl" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                                                                <Sparkles className="w-5 h-5 text-white" />
                                                            </div>
                                                            <h4 className="text-xl font-display font-black text-foreground tracking-tight">AI Resolution Strategy</h4>
                                                        </div>
                                                        {loadingSolutions[alert.id] ? (
                                                            <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground py-10">
                                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                                <span className="tracking-wide">Synthesizing multi-modal mitigation strategies...</span>
                                                            </div>
                                                        ) : solutions[alert.id] ? (
                                                            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                                                                {solutions[alert.id]}
                                                            </div>
                                                        ) : (
                                                            <div className="py-4 px-6 rounded-2xl bg-secondary/50 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                                Initializing Solution Engine...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {alerts.length === 0 && !loading && (
                        <div className="text-center py-20 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border">
                            <AlertTriangle className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
                            <h3 className="text-2xl font-display font-bold text-foreground">Aadhaar Sanket Perimeter Clear</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">No critical anomalies detected in the current data buffer. Monitoring continues across 725 districts.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Data Justification Modal Integration */}
            <DataJustificationModal
                isOpen={isJustifyOpen}
                onClose={() => setIsJustifyOpen(false)}
                metric={selectedMetric}
            />
        </motion.div>
    );
};

export default CriticalAlerts;
