
import React, { useState, useEffect } from 'react';
import { X, Loader2, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';
import ReactMarkdown from 'react-markdown';

interface DataInsightModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    severity?: 'critical' | 'warning' | 'info';
    dataContext?: any;
}

export const DataInsightModal: React.FC<DataInsightModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    severity = 'info',
    dataContext
}) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && title) {
            fetchAnalysis();
        } else {
            setAnalysis(null);
        }
    }, [isOpen, title]);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/ai/explain/issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    data_context: dataContext
                })
            });
            const data = await response.json();
            setAnalysis(data.analysis || "No analysis available.");
        } catch (error) {
            console.error("Analysis failed", error);
            setAnalysis("Failed to generate AI analysis. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-none">
                {/* Header */}
                <div className={`p-4 border-b flex justify-between items-center ${severity === 'critical' ? 'bg-destructive/10' :
                        severity === 'warning' ? 'bg-amber-500/10' : 'bg-primary/5'
                    }`}>
                    <div className="flex items-center gap-2">
                        {severity === 'critical' && <AlertTriangle className="text-destructive h-5 w-5" />}
                        {severity === 'warning' && <AlertTriangle className="text-amber-500 h-5 w-5" />}
                        {severity === 'info' && <Lightbulb className="text-primary h-5 w-5" />}
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto min-h-[300px]">
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Issue Description</h3>
                        <p className="text-base">{description}</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Consulting GenAI for root causes and solutions...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* AI Analysis Section */}
                            <div className="bg-muted/50 rounded-lg p-4 border">
                                <h3 className="flex items-center gap-2 font-semibold text-primary mb-3">
                                    <Lightbulb className="h-4 w-4" /> AI Root Cause & Impact
                                </h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{analysis || ''}</ReactMarkdown>
                                </div>
                            </div>

                            {/* Raw Data Context */}
                            {dataContext && (
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Raw Data Context</h3>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                        {JSON.stringify(dataContext, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2"
                    >
                        <CheckCircle className="h-4 w-4" /> Save Report
                    </button>
                </div>
            </Card>
        </div>
    );
};
