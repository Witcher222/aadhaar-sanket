import { useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area,
    AreaChart,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';

interface Prediction {
    period: number;
    predicted_value: number;
    lower_bound: number;
    upper_bound: number;
    confidence: number;
}

interface PredictiveChartProps {
    data: {
        historical: Array<{ [key: string]: any }>;
        predictions: Prediction[];
        trend: string;
    };
    metric: string;
    districtName?: string;
    alertThreshold?: number;
}

const PredictiveChart = ({
    data,
    metric,
    districtName,
    alertThreshold
}: PredictiveChartProps) => {
    const [scenario, setScenario] = useState<'realistic' | 'optimistic' | 'pessimistic'>('realistic');

    // Safety checks
    if (!data || !data.historical || !data.predictions) {
        return (
            <div className="py-12 text-center text-slate-500">
                No prediction data available
            </div>
        );
    }

    const { historical, predictions, trend } = data;

    // Additional safety check
    if (!Array.isArray(historical) || !Array.isArray(predictions)) {
        return (
            <div className="py-12 text-center text-slate-500">
                Invalid data format
            </div>
        );
    }

    // Combine historical and prediction data
    const combinedData = [
        ...historical.map((h, idx) => ({
            period: idx + 1,
            value: h[metric],
            type: 'historical'
        })),
        ...predictions.map((p, idx) => {
            let adjustedValue = p.predicted_value;
            if (scenario === 'optimistic') {
                adjustedValue = p.upper_bound;
            } else if (scenario === 'pessimistic') {
                adjustedValue = p.lower_bound;
            }

            return {
                period: historical.length + idx + 1,
                value: adjustedValue,
                lower: p.lower_bound,
                upper: p.upper_bound,
                type: 'predicted',
                confidence: p.confidence * 100
            };
        })
    ];

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-border">
                    <p className="font-semibold text-sm mb-2">
                        Period {data.period} - {data.type === 'historical' ? 'Historical' : 'Forecast'}
                    </p>
                    <p className="text-primary font-bold text-lg">
                        {metric}: {data.value?.toFixed(2)}
                    </p>
                    {data.type === 'predicted' && (
                        <>
                            <p className="text-xs text-muted-foreground mt-1">
                                Range: {data.lower?.toFixed(2)} - {data.upper?.toFixed(2)}
                            </p>
                            <p className="text-xs text-green-600 font-medium mt-1">
                                Confidence: {data.confidence}%
                            </p>
                        </>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Predictive Forecast{districtName && ` - ${districtName}`}
                        </CardTitle>
                        <CardDescription>
                            {historical.length} historical periods + {predictions.length} forecasted periods
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                        Trend: {trend}
                    </Badge>
                </div>

                {/* Scenario Selector */}
                <div className="flex gap-2 mt-4">
                    <Button
                        variant={scenario === 'optimistic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScenario('optimistic')}
                        className="flex-1"
                    >
                        Optimistic
                    </Button>
                    <Button
                        variant={scenario === 'realistic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScenario('realistic')}
                        className="flex-1"
                    >
                        Realistic
                    </Button>
                    <Button
                        variant={scenario === 'pessimistic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScenario('pessimistic')}
                        className="flex-1"
                    >
                        Pessimistic
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={combinedData}>
                        <defs>
                            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="period"
                            label={{ value: 'Period', position: 'insideBottom', offset: -5 }}
                            tick={{ fontSize: 11 }}
                        />
                        <YAxis
                            label={{ value: metric.toUpperCase(), angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            iconType="line"
                        />

                        {/* Alert threshold line */}
                        {alertThreshold && (
                            <ReferenceLine
                                y={alertThreshold}
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                label={{
                                    value: 'Alert Threshold',
                                    position: 'right',
                                    fill: '#ef4444',
                                    fontSize: 11
                                }}
                            />
                        )}

                        {/* Vertical line separating historical from predicted */}
                        <ReferenceLine
                            x={historical.length}
                            stroke="#9ca3af"
                            strokeDasharray="3 3"
                            label={{ value: 'Now', position: 'top', fill: '#6b7280', fontSize: 10 }}
                        />

                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#historicalGradient)"
                            name={metric.toUpperCase()}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-blue-900">Current Scenario</h4>
                        </div>
                        <p className="text-xs text-blue-700">
                            Showing <strong className="capitalize">{scenario}</strong> projection based on{' '}
                            {scenario === 'optimistic' ? 'upper confidence bounds' :
                                scenario === 'pessimistic' ? 'lower confidence bounds' :
                                    'median trend extrapolation'}.
                        </p>
                    </div>

                    {alertThreshold && predictions.some(p => p.predicted_value > alertThreshold) && (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <h4 className="text-sm font-semibold text-red-900">Alert Warning</h4>
                            </div>
                            <p className="text-xs text-red-700">
                                Forecast exceeds alert threshold in {predictions.findIndex(p => p.predicted_value > alertThreshold!) + 1} period(s).
                                Intervention recommended.
                            </p>
                        </div>
                    )}
                </div>

                {/* Model Info */}
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                        <strong>Model:</strong> Linear extrapolation with confidence intervals •
                        <strong> Confidence:</strong> {predictions[0]?.confidence ? (predictions[0].confidence * 100).toFixed(0) : 80}%
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PredictiveChart;
